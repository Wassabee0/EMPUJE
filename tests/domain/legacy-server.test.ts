import { afterEach, describe, expect, test } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const rootDir = path.resolve(__dirname, "../..");

let server: ChildProcess | null = null;
let dataDir: string | null = null;

async function waitForServer(url: string) {
  const started = Date.now();
  while (Date.now() - started < 8_000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function startLegacyServer(env: Record<string, string | undefined>) {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "empuje-legacy-"));
  const port = 4800 + Math.floor(Math.random() * 500);
  const baseUrl = `http://127.0.0.1:${port}`;

  server = spawn(process.execPath, ["server.js"], {
    cwd: rootDir,
    env: {
      ...process.env,
      ...env,
      LEGACY_SERVER_MODE: env.LEGACY_SERVER_MODE ?? "local",
      PORT: String(port),
      DATA_DIR: dataDir,
    },
    stdio: ["ignore", "ignore", "ignore"],
  });

  await waitForServer(`${baseUrl}/api/health`);
  return baseUrl;
}

async function probeLegacyServer(env: Record<string, string | undefined>) {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "empuje-legacy-"));
  const port = 5400 + Math.floor(Math.random() * 500);
  const baseUrl = `http://127.0.0.1:${port}`;

  server = spawn(process.execPath, ["server.js"], {
    cwd: rootDir,
    env: {
      ...process.env,
      ...env,
      PORT: String(port),
      DATA_DIR: dataDir,
    },
    stdio: ["ignore", "ignore", "ignore"],
  });

  let exitCode: number | null = null;
  server.once("exit", (code) => {
    exitCode = code;
  });

  const started = Date.now();
  while (Date.now() - started < 1_500) {
    if (exitCode !== null) break;
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return { started: true, exitCode };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 75));
    }
  }

  return { started: false, exitCode };
}

afterEach(() => {
  if (server && !server.killed) server.kill();
  server = null;

  if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
  dataDir = null;
});

describe("legacy intake server", () => {
  test("is not exposed as an npm production or serving script", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts).not.toHaveProperty("serve:legacy");
    expect(Object.values(packageJson.scripts ?? {})).not.toContain("node server.js");
  });

  test("refuses to bind without explicit local legacy mode", async () => {
    const probe = await probeLegacyServer({ ADMIN_PIN: "local-pin", NODE_ENV: "development" });

    expect(probe.started).toBe(false);
    expect(probe.exitCode).not.toBe(0);
  });

  test("refuses to bind when NODE_ENV is production even with local opt-in", async () => {
    const probe = await probeLegacyServer({
      ADMIN_PIN: "production-pin",
      LEGACY_SERVER_MODE: "local",
      NODE_ENV: "production",
    });

    expect(probe.started).toBe(false);
    expect(probe.exitCode).not.toBe(0);
  });

  test("refuses to bind in Vercel-like environments", async () => {
    const probe = await probeLegacyServer({
      ADMIN_PIN: "vercel-pin",
      LEGACY_SERVER_MODE: "local",
      VERCEL: "1",
    });

    expect(probe.started).toBe(false);
    expect(probe.exitCode).not.toBe(0);
  });

  test("disables admin export when ADMIN_PIN is not configured", async () => {
    const baseUrl = await startLegacyServer({ ADMIN_PIN: "" });

    const response = await fetch(`${baseUrl}/api/admin/export?pin=change-me`);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "La exportación admin está desactivada hasta configurar ADMIN_PIN",
    });
  });

  test("does not accept admin PINs in query strings", async () => {
    const baseUrl = await startLegacyServer({ ADMIN_PIN: "2468" });

    const response = await fetch(`${baseUrl}/api/admin/export?pin=2468`);

    expect(response.status).toBe(401);
  });

  test("accepts the admin PIN only through the local legacy header", async () => {
    const baseUrl = await startLegacyServer({ ADMIN_PIN: "2468" });

    const response = await fetch(`${baseUrl}/api/admin/export`, {
      headers: { "x-admin-pin": "2468" },
    });

    expect(response.status).toBe(200);
  });
});

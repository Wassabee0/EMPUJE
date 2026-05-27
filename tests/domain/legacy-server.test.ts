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
      PORT: String(port),
      DATA_DIR: dataDir,
    },
    stdio: ["ignore", "ignore", "ignore"],
  });

  await waitForServer(`${baseUrl}/api/health`);
  return baseUrl;
}

afterEach(() => {
  if (server && !server.killed) server.kill();
  server = null;

  if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
  dataDir = null;
});

describe("legacy intake server", () => {
  test("disables admin export when ADMIN_PIN is not configured", async () => {
    const baseUrl = await startLegacyServer({ ADMIN_PIN: "" });

    const response = await fetch(`${baseUrl}/api/admin/export?pin=change-me`);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "La exportación admin está desactivada hasta configurar ADMIN_PIN",
    });
  });
});

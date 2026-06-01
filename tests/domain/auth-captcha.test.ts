import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = path.resolve(__dirname, "../..");

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

describe("auth CAPTCHA wiring", () => {
  test("passes CAPTCHA tokens to every Supabase email auth request", () => {
    const source = readSource("components/auth-form.tsx");

    expect(source).toContain("captchaToken");
    expect(source).toMatch(/signInWithOtp\(\{[\s\S]*captchaToken/s);
    expect(source).toMatch(/signUp\(\{[\s\S]*captchaToken/s);
    expect(source).toMatch(/signInWithPassword\(\{[\s\S]*captchaToken/s);
  });

  test("documents public CAPTCHA provider configuration", () => {
    const envExample = readSource(".env.example");

    expect(envExample).toContain("NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER");
    expect(envExample).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(envExample).toContain("NEXT_PUBLIC_HCAPTCHA_SITE_KEY");
  });
});

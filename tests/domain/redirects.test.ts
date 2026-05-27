import { describe, expect, test } from "vitest";

import { safeRedirectPath } from "../../lib/redirects";

describe("safeRedirectPath", () => {
  test("keeps normal in-app paths with query and hash", () => {
    expect(safeRedirectPath("/onboarding?step=evidence#files")).toBe("/onboarding?step=evidence#files");
  });

  test("falls back for absolute or protocol-relative redirects", () => {
    expect(safeRedirectPath("https://evil.example/phish")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.example/phish")).toBe("/dashboard");
  });

  test("falls back for empty or malformed paths", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath("")).toBe("/dashboard");
    expect(safeRedirectPath("dashboard")).toBe("/dashboard");
  });
});

import { describe, expect, test } from "vitest";

import { canUseDevAdminPanel } from "../../lib/dev-admin";

describe("canUseDevAdminPanel", () => {
  test("allows the temporary admin panel only in local development without Supabase", () => {
    expect(
      canUseDevAdminPanel({
        hasSupabaseConfig: false,
        nodeEnv: "development",
        providedCode: "local",
      }),
    ).toBe(true);
  });

  test("blocks the temporary admin panel in production, with Supabase, or with a wrong code", () => {
    expect(
      canUseDevAdminPanel({
        hasSupabaseConfig: false,
        nodeEnv: "production",
        providedCode: "local",
      }),
    ).toBe(false);
    expect(
      canUseDevAdminPanel({
        hasSupabaseConfig: true,
        nodeEnv: "development",
        providedCode: "local",
      }),
    ).toBe(false);
    expect(
      canUseDevAdminPanel({
        hasSupabaseConfig: false,
        nodeEnv: "development",
        providedCode: "wrong",
        expectedCode: "secret-local",
      }),
    ).toBe(false);
  });
});

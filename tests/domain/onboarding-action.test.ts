import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = path.resolve(__dirname, "../..");

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

describe("onboarding server action errors", () => {
  test("redirects user-correctable onboarding validation failures instead of throwing", () => {
    const actions = readSource("app/actions.ts");
    const page = readSource("app/onboarding/page.tsx");

    expect(actions).toContain("onboardingErrorRedirect");
    expect(actions).toContain("redirect(`/onboarding?error=");
    expect(actions).not.toContain("throw new Error(`El onboarding está incompleto:");
    expect(actions).not.toContain(
      'throw new Error("Añade al menos un enlace o archivo de evidencia para que la oferta pueda revisarse.")',
    );
    expect(page).toContain("params.error");
    expect(page).toContain("onboardingError");
  });
});

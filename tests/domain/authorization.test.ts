import { describe, expect, test } from "vitest";

import { canRequestIntroForMatch } from "../../lib/authorization";

describe("canRequestIntroForMatch", () => {
  test("allows intro requests only for participants in approved or later matches", () => {
    expect(canRequestIntroForMatch("approved", true)).toBe(true);
    expect(canRequestIntroForMatch("introduced", true)).toBe(true);
    expect(canRequestIntroForMatch("completed", true)).toBe(true);
  });

  test("blocks non-participants and unapproved matches", () => {
    expect(canRequestIntroForMatch("approved", false)).toBe(false);
    expect(canRequestIntroForMatch("suggested", true)).toBe(false);
    expect(canRequestIntroForMatch("needs_evidence", true)).toBe(false);
    expect(canRequestIntroForMatch(null, true)).toBe(false);
  });
});

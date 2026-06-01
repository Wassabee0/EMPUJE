import { describe, expect, test } from "vitest";

import { buildSecurityEvent } from "../../lib/security-events";

describe("security event logging", () => {
  test("builds structured events without leaking raw email or freeform payloads", () => {
    const event = buildSecurityEvent("admin_export", {
      userId: "user-123",
      action: "csv",
      metadata: {
        email: "ana@example.com",
        count: 3,
      },
    });

    expect(event).toMatchObject({
      source: "empuje",
      event: "admin_export",
      userId: "user-123",
      action: "csv",
      metadata: {
        count: 3,
      },
    });
    expect(JSON.stringify(event)).not.toContain("ana@example.com");
  });
});

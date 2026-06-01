import { describe, expect, test } from "vitest";

import {
  ONBOARDING_QUOTAS,
  normalizeEvidenceUrl,
  planOnboardingWrite,
} from "../../lib/onboarding-quotas";

describe("onboarding quota planning", () => {
  test("plans repeated onboarding as an update to the existing primary offer and need", () => {
    const plan = planOnboardingWrite(
      {
        offerIds: ["offer-1"],
        needIds: ["need-1"],
        evidenceLinks: ["https://example.com/alba"],
        evidenceFileCount: 0,
        uploadedBytes: 0,
        fileHashes: [],
      },
      {
        evidenceLinks: ["https://example.com/alba/"],
        files: [],
      },
    );

    expect(plan.ok).toBe(true);
    if (!plan.ok) throw new Error(plan.error);
    expect(plan.primaryOfferId).toBe("offer-1");
    expect(plan.primaryNeedId).toBe("need-1");
    expect(plan.evidenceLinksToInsert).toEqual([]);
  });

  test("rejects users that already exceed the single primary offer or need quota", () => {
    const plan = planOnboardingWrite(
      {
        offerIds: ["offer-1", "offer-2"],
        needIds: ["need-1"],
        evidenceLinks: [],
        evidenceFileCount: 0,
        uploadedBytes: 0,
        fileHashes: [],
      },
      {
        evidenceLinks: [],
        files: [],
      },
    );

    expect(plan.ok).toBe(false);
    if (plan.ok) throw new Error("Expected quota planning to fail");
    expect(plan.error).toContain("ofertas");
  });

  test("dedupes normalized HTTP evidence links and enforces the link quota", () => {
    expect(normalizeEvidenceUrl("HTTPS://Example.com/alba/")).toBe("https://example.com/alba");

    const plan = planOnboardingWrite(
      {
        offerIds: [],
        needIds: [],
        evidenceLinks: Array.from({ length: ONBOARDING_QUOTAS.evidenceLinks }, (_, index) =>
          `https://example.com/existing-${index}`,
        ),
        evidenceFileCount: 0,
        uploadedBytes: 0,
        fileHashes: [],
      },
      {
        evidenceLinks: ["https://example.com/new"],
        files: [],
      },
    );

    expect(plan.ok).toBe(false);
    if (plan.ok) throw new Error("Expected quota planning to fail");
    expect(plan.error).toContain("enlaces");
  });

  test("enforces file count and total uploaded byte quotas", () => {
    const tooManyFiles = planOnboardingWrite(
      {
        offerIds: [],
        needIds: [],
        evidenceLinks: [],
        evidenceFileCount: ONBOARDING_QUOTAS.evidenceFiles,
        uploadedBytes: 0,
        fileHashes: [],
      },
      {
        evidenceLinks: [],
        files: [{ size: 1, hash: "new-file" }],
      },
    );

    expect(tooManyFiles.ok).toBe(false);

    const exactBoundary = planOnboardingWrite(
      {
        offerIds: [],
        needIds: [],
        evidenceLinks: [],
        evidenceFileCount: 0,
        uploadedBytes: ONBOARDING_QUOTAS.uploadedBytes - 1,
        fileHashes: [],
      },
      {
        evidenceLinks: [],
        files: [{ size: 1, hash: "boundary" }],
      },
    );

    expect(exactBoundary.ok).toBe(true);

    const tooManyBytes = planOnboardingWrite(
      {
        offerIds: [],
        needIds: [],
        evidenceLinks: [],
        evidenceFileCount: 0,
        uploadedBytes: ONBOARDING_QUOTAS.uploadedBytes,
        fileHashes: [],
      },
      {
        evidenceLinks: [],
        files: [{ size: 1, hash: "over" }],
      },
    );

    expect(tooManyBytes.ok).toBe(false);
    if (tooManyBytes.ok) throw new Error("Expected byte quota planning to fail");
    expect(tooManyBytes.error).toContain("MB");
  });

  test("dedupes already uploaded files by content hash before consuming quota", () => {
    const plan = planOnboardingWrite(
      {
        offerIds: [],
        needIds: [],
        evidenceLinks: [],
        evidenceFileCount: ONBOARDING_QUOTAS.evidenceFiles,
        uploadedBytes: ONBOARDING_QUOTAS.uploadedBytes,
        fileHashes: ["known"],
      },
      {
        evidenceLinks: [],
        files: [{ size: 12_345, hash: "known" }],
      },
    );

    expect(plan.ok).toBe(true);
    if (!plan.ok) throw new Error(plan.error);
    expect(plan.filesToInsert).toEqual([]);
  });
});

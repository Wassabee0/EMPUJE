import { describe, expect, test } from "vitest";

import {
  STAGING_SEED_EMAIL_DOMAIN,
  STAGING_SEED_PROJECT_REF,
  STAGING_SEED_TAG,
  buildStagingSeedDataset,
  findSeedCleanupEmails,
} from "../../scripts/staging-seed-data";

describe("staging seed dataset", () => {
  test("builds a reversible 20-account admin workload for the staging project", () => {
    const dataset = buildStagingSeedDataset();
    const emails = dataset.accounts.map((account) => account.email);
    const statuses = new Set(dataset.accounts.map((account) => account.profile.status));
    const stageCities = new Set(dataset.accounts.map((account) => account.profile.city));
    const overlapPairs = dataset.accounts.flatMap((offerer) =>
      dataset.accounts.filter((needer) => {
        if (offerer.email === needer.email) return false;
        return offerer.offer.tags.some((tag) => needer.need.tags.includes(tag));
      }),
    );

    expect(STAGING_SEED_PROJECT_REF).toBe("ifphiqzvslsxnqkatton");
    expect(STAGING_SEED_TAG).toBe("empuje_staging_admin_panel_seed");
    expect(dataset.accounts).toHaveLength(20);
    expect(new Set(emails).size).toBe(20);
    expect(emails.every((email) => email.endsWith(`@${STAGING_SEED_EMAIL_DOMAIN}`))).toBe(true);
    expect(statuses).toEqual(new Set(["pending_review", "active", "needs_evidence", "rejected"]));
    expect(stageCities.size).toBeGreaterThanOrEqual(8);
    expect(dataset.accounts.every((account) => account.offer.tags.length >= 3)).toBe(true);
    expect(dataset.accounts.every((account) => account.need.tags.length >= 3)).toBe(true);
    expect(dataset.accounts.every((account) => account.evidenceItems.length >= 1)).toBe(true);
    expect(overlapPairs.length).toBeGreaterThanOrEqual(20);
    expect(findSeedCleanupEmails(emails)).toEqual(emails);
    expect(findSeedCleanupEmails(["real@example.com", emails[0]])).toEqual([emails[0]]);
  });
});

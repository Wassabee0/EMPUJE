import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "../..");

function readMigration(name: string) {
  return fs.readFileSync(path.join(rootDir, "supabase/migrations", name), "utf8");
}

describe("beta access and onboarding quota migration", () => {
  test("defines an invite-only Auth hook backed by private invites", () => {
    const sql = readMigration("20260601075345_beta_access_onboarding_quotas.sql");

    expect(sql).toContain("create table if not exists app_private.beta_invites");
    expect(sql).toContain("create or replace function app_private.require_beta_invite(event jsonb)");
    expect(sql).toContain("Empuje beta is invite-only.");
    expect(sql).toContain("revoke execute on function app_private.require_beta_invite(jsonb) from public, anon, authenticated");
    expect(sql).toContain("grant execute on function app_private.require_beta_invite(jsonb) to supabase_auth_admin");
    expect(sql).toContain("revoke all on app_private.beta_invites from public, anon, authenticated");
  });

  test("adds persistent keys and metadata needed for idempotency and quotas", () => {
    const sql = readMigration("20260601075345_beta_access_onboarding_quotas.sql");

    expect(sql).toContain("add column if not exists onboarding_key text");
    expect(sql).toContain("offers_one_primary_onboarding_per_profile");
    expect(sql).toContain("needs_one_primary_onboarding_per_profile");
    expect(sql).toContain("add column if not exists normalized_url text");
    expect(sql).toContain("add column if not exists content_hash text");
    expect(sql).toContain("add column if not exists byte_size bigint not null default 0");
    expect(sql).toContain("evidence_unique_profile_offer_link");
    expect(sql).toContain("evidence_unique_profile_offer_file_hash");
    expect(sql).toContain(
      "revoke insert, update, delete on public.offers, public.needs, public.evidence_items from authenticated",
    );
  });

  test("removes direct member table mutation and DDL-style privileges from onboarding tables", () => {
    const migrationsDir = path.join(rootDir, "supabase/migrations");
    const combined = fs
      .readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => readMigration(name))
      .join("\n");

    expect(combined).toContain(
      "revoke insert, update, delete, truncate, references, trigger on public.offers, public.needs, public.evidence_items from authenticated",
    );
  });
});

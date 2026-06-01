import { describe, expect, test } from "vitest";
import fs, { readdirSync } from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "../..");
const migrationsDir = path.join(rootDir, "supabase/migrations");

function readInitialMigration() {
  return fs.readFileSync(
    path.join(migrationsDir, "20260526163000_initial_empuje_beta.sql"),
    "utf8",
  );
}

function policyBlock(sql: string, policyName: string) {
  const match = sql.match(
    new RegExp(`create policy "${policyName}"[\\s\\S]*?;\\n\\n`, "m"),
  );
  return match?.[0] ?? "";
}

describe("Supabase RLS policies", () => {
  test("evidence insert policy only accepts offer evidence for the authenticated owner's offers", () => {
    const policy = policyBlock(readInitialMigration(), "evidence_insert_own_pending");

    expect(policy).toContain("profile_id = (select auth.uid())");
    expect(policy).toContain("status = 'pending'");
    expect(policy).toContain("offer_id is null");
    expect(policy).toContain("from public.offers o");
    expect(policy).toContain("o.id = evidence_items.offer_id");
    expect(policy).toContain("o.profile_id = (select auth.uid())");
  });

  test("post-initial migrations reapply the tightened evidence insert policy", () => {
    const laterMigrations = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .filter((name) => name > "20260526163000_initial_empuje_beta.sql");
    const combined = laterMigrations
      .map((name) => fs.readFileSync(path.join(migrationsDir, name), "utf8"))
      .join("\n");

    expect(combined).toContain('drop policy if exists "evidence_insert_own_pending"');
    expect(combined).toContain('create policy "evidence_insert_own_pending"');
    expect(combined).toContain("o.id = evidence_items.offer_id");
    expect(combined).toContain("o.profile_id = (select auth.uid())");
  });
});

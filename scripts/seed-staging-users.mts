#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  STAGING_SEED_EMAIL_DOMAIN,
  STAGING_SEED_PROJECT_REF,
  STAGING_SEED_TAG,
  buildStagingSeedDataset,
  findSeedCleanupEmails,
} = require("./staging-seed-data.ts") as typeof import("./staging-seed-data");

type Command = "up" | "down" | "summary";
type Client = ReturnType<typeof createSupabaseAdminClient>;
type Row = Record<string, unknown>;

type SeededAccount = {
  seedKey: string;
  userId: string;
  offerId: string;
  needId: string;
};

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    const raw = trimmed.slice(separator + 1).trim();
    const value = raw.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadLocalEnv() {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
}

function projectRefFromUrl(url: string) {
  return new URL(url).hostname.split(".")[0] ?? "";
}

function getConfig() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  if (!serviceKey) throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");

  const projectRef = projectRefFromUrl(supabaseUrl);
  if (projectRef !== STAGING_SEED_PROJECT_REF && process.env.ALLOW_NON_STAGING_SEED !== "1") {
    throw new Error(
      `Refusing to seed project ${projectRef}. Expected staging project ${STAGING_SEED_PROJECT_REF}.`,
    );
  }

  return { supabaseUrl, serviceKey, projectRef };
}

function createSupabaseAdminClient() {
  const { supabaseUrl, serviceKey } = getConfig();
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.trim() || null;
  }
}

async function requireNoError<T>(label: string, result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function listAllAuthUsers(client: Client) {
  const users: Array<{ id: string; email?: string }> = [];
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`list auth users: ${error.message}`);

    users.push(...data.users.map((user) => ({ id: user.id, email: user.email ?? undefined })));
    if (data.users.length < 1000) break;
    page += 1;
  }

  return users;
}

async function findSeedProfileIds(client: Client, emails: string[]) {
  if (!emails.length) return [];

  const ids = new Set<string>();
  for (const emailChunk of chunk(emails, 100)) {
    const { data, error } = await client.from("profiles").select("id,email").in("email", emailChunk);
    if (error) throw new Error(`select seed profiles: ${error.message}`);
    for (const row of (data ?? []) as Row[]) {
      const id = asString(row.id);
      if (id) ids.add(id);
    }
  }

  return [...ids];
}

async function deleteMatchesForProfiles(client: Client, profileIds: string[]) {
  if (!profileIds.length) return 0;

  const matchIds = new Set<string>();
  for (const profileChunk of chunk(profileIds, 100)) {
    const { data, error } = await client.from("match_participants").select("match_id").in("profile_id", profileChunk);
    if (error) throw new Error(`select seed match participants: ${error.message}`);
    for (const row of (data ?? []) as Row[]) {
      const matchId = asString(row.match_id);
      if (matchId) matchIds.add(matchId);
    }
  }

  const ids = [...matchIds];
  for (const matchChunk of chunk(ids, 100)) {
    const { error } = await client.from("matches").delete().in("id", matchChunk);
    if (error) throw new Error(`delete seed matches: ${error.message}`);
  }

  return ids.length;
}

async function deleteSeedProfiles(client: Client, profileIds: string[]) {
  for (const profileChunk of chunk(profileIds, 100)) {
    const { error } = await client.from("profiles").delete().in("id", profileChunk);
    if (error) throw new Error(`delete seed profiles: ${error.message}`);
  }
}

async function clearSeedData(client: Client, knownEmails = buildStagingSeedDataset().accounts.map((account) => account.email)) {
  const authUsers = await listAllAuthUsers(client);
  const seedAuthUsers = authUsers.filter((user) => user.email && findSeedCleanupEmails([user.email]).length);
  const cleanupEmails = [...new Set([...knownEmails, ...seedAuthUsers.map((user) => user.email ?? "")])].filter(Boolean);
  const profileIds = await findSeedProfileIds(client, cleanupEmails);
  const matchCount = await deleteMatchesForProfiles(client, profileIds);

  if (profileIds.length) await deleteSeedProfiles(client, profileIds);

  for (const user of seedAuthUsers) {
    const { error } = await client.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`delete auth user ${user.email ?? user.id}: ${error.message}`);
  }

  return {
    authUsers: seedAuthUsers.length,
    profiles: profileIds.length,
    matches: matchCount,
  };
}

async function createSeedAuthUser(client: Client, account: ReturnType<typeof buildStagingSeedDataset>["accounts"][number]) {
  const { data, error } = await client.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: {
      seedTag: STAGING_SEED_TAG,
      seedKey: account.seedKey,
      businessName: account.profile.businessName,
    },
  });

  if (error) {
    throw new Error(
      `create auth user ${account.email}: ${error.message}. If the invite-only Auth Hook is enabled, insert these seed emails into app_private.beta_invites or temporarily disable the hook for this staging seed run.`,
    );
  }
  if (!data.user) throw new Error(`create auth user ${account.email}: Supabase returned no user.`);

  return data.user.id;
}

async function insertAccountData(client: Client, account: ReturnType<typeof buildStagingSeedDataset>["accounts"][number]) {
  const now = new Date().toISOString();
  const userId = await createSeedAuthUser(client, account);

  await requireNoError(
    `insert profile ${account.email}`,
    await client.from("profiles").insert({
      id: userId,
      email: account.email,
      full_name: account.profile.fullName,
      business_name: account.profile.businessName,
      city: account.profile.city,
      business_type: account.profile.businessType,
      stage: account.profile.stage,
      status: account.profile.status,
      role: "member",
      consent_accepted: true,
      consent_at: now,
      trust_score: account.profile.trustScore,
      admin_summary: account.profile.adminSummary,
      created_at: now,
      updated_at: now,
    }),
  );

  const offerData = await requireNoError(
    `insert offer ${account.email}`,
    await client
      .from("offers")
      .insert({
        profile_id: userId,
        onboarding_key: "primary",
        title: account.offer.title,
        description: account.offer.description,
        tags: account.offer.tags,
        status: account.offer.status,
        contribution_template_id: account.offer.contributionTemplateId,
        contribution_category: account.offer.contributionCategory,
        availability_status: account.offer.availabilityStatus,
        capacity_total: account.offer.capacityTotal,
        capacity_used: account.offer.capacityUsed,
        capacity_unit: account.offer.capacityUnit,
        next_review_at: "2026-07-01",
        restrictions: account.offer.restrictions,
        admin_notes: account.offer.adminNotes,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single(),
  );
  const offerId = asString((offerData as Row).id);
  if (!offerId) throw new Error(`insert offer ${account.email}: Supabase returned no offer id.`);

  const needData = await requireNoError(
    `insert need ${account.email}`,
    await client
      .from("needs")
      .insert({
        profile_id: userId,
        onboarding_key: "primary",
        title: account.need.title,
        description: account.need.description,
        tags: account.need.tags,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single(),
  );
  const needId = asString((needData as Row).id);
  if (!needId) throw new Error(`insert need ${account.email}: Supabase returned no need id.`);

  await requireNoError(
    `insert evidence ${account.email}`,
    await client.from("evidence_items").insert(
      account.evidenceItems.map((item) => ({
        profile_id: userId,
        offer_id: offerId,
        label: item.label,
        kind: item.kind,
        url: item.url ?? null,
        normalized_url: normalizeUrl(item.url),
        status: item.status,
        admin_notes: item.adminNotes ?? `Seed: ${STAGING_SEED_TAG}`,
        byte_size: 0,
        created_at: now,
        updated_at: now,
      })),
    ),
  );

  return {
    seedKey: account.seedKey,
    userId,
    offerId,
    needId,
  };
}

async function insertSeedMatches(client: Client, seededAccounts: SeededAccount[]) {
  const dataset = buildStagingSeedDataset();
  const bySeedKey = new Map(seededAccounts.map((account) => [account.seedKey, account]));
  let inserted = 0;

  for (const match of dataset.matches) {
    const offerer = bySeedKey.get(match.offererSeedKey);
    const needer = bySeedKey.get(match.neederSeedKey);
    const requester = match.introRequest ? bySeedKey.get(match.introRequest.requesterSeedKey) : null;
    if (!offerer || !needer) throw new Error(`seed match ${match.seedKey}: missing account reference.`);
    if (match.introRequest && !requester) throw new Error(`seed match ${match.seedKey}: missing requester.`);

    const matchData = await requireNoError(
      `insert match ${match.seedKey}`,
      await client
        .from("matches")
        .insert({
          status: match.status,
          score: match.score,
          blocking_reasons: match.blockingReasons,
          score_breakdown: {
            seedTag: STAGING_SEED_TAG,
            generatedFor: "admin-panel-staging",
          },
          admin_notes: match.adminNotes,
          approved_at: ["approved", "introduced", "completed"].includes(match.status)
            ? new Date().toISOString()
            : null,
        })
        .select("id")
        .single(),
    );
    const matchId = asString((matchData as Row).id);
    if (!matchId) throw new Error(`insert match ${match.seedKey}: Supabase returned no match id.`);

    await requireNoError(
      `insert match participants ${match.seedKey}`,
      await client.from("match_participants").insert([
        {
          match_id: matchId,
          profile_id: offerer.userId,
          role: "offerer",
          offer_id: offerer.offerId,
        },
        {
          match_id: matchId,
          profile_id: needer.userId,
          role: "needer",
          need_id: needer.needId,
        },
      ]),
    );

    if (match.introRequest && requester) {
      await requireNoError(
        `insert intro request ${match.seedKey}`,
        await client.from("intro_requests").insert({
          match_id: matchId,
          requested_by: requester.userId,
          message: match.introRequest.message,
          status: match.introRequest.status,
          admin_notes: `Seed: ${STAGING_SEED_TAG}`,
        }),
      );
    }

    inserted += 1;
  }

  return inserted;
}

async function seedUp(client: Client) {
  const dataset = buildStagingSeedDataset();
  const cleared = await clearSeedData(client, dataset.accounts.map((account) => account.email));
  const seededAccounts: SeededAccount[] = [];

  for (const account of dataset.accounts) {
    seededAccounts.push(await insertAccountData(client, account));
  }

  const matches = await insertSeedMatches(client, seededAccounts);

  return {
    cleared,
    accounts: seededAccounts.length,
    matches,
  };
}

async function seedSummary(client: Client) {
  const dataset = buildStagingSeedDataset();
  const authUsers = await listAllAuthUsers(client);
  const seedAuthUsers = authUsers.filter((user) => user.email && findSeedCleanupEmails([user.email]).length);
  const profileIds = await findSeedProfileIds(client, dataset.accounts.map((account) => account.email));

  return {
    expectedAccounts: dataset.accounts.length,
    authUsers: seedAuthUsers.length,
    profiles: profileIds.length,
  };
}

function parseCommand(): Command {
  const command = process.argv[2] ?? "summary";
  if (command === "up" || command === "down" || command === "summary") return command;
  throw new Error(`Unknown command "${command}". Use up, down, or summary.`);
}

async function main() {
  const command = parseCommand();
  const client = createSupabaseAdminClient();
  const config = getConfig();

  console.log(`Staging seed command: ${command}`);
  console.log(`Supabase project: ${config.projectRef}`);
  console.log(`Seed domain: ${STAGING_SEED_EMAIL_DOMAIN}`);

  if (command === "summary") {
    console.log(await seedSummary(client));
    return;
  }

  if (command === "down") {
    console.log(await clearSeedData(client));
    return;
  }

  console.log(await seedUp(client));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

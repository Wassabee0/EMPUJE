import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";

import { canRequestIntroForMatch } from "@/lib/authorization";
import { buildInternalCreditLedger } from "@/lib/credit-ledger";
import { formatAdminExport } from "@/lib/export";
import { candidateToDatabaseRow, mapMaterializedCandidate } from "@/lib/match-candidates";
import { generateCandidateMatches } from "@/lib/matching";
import { buildMatchWorkbench } from "@/lib/match-workbench";
import {
  planOnboardingWrite,
  type ExistingOnboardingUsage,
} from "@/lib/onboarding-quotas";
import { buildVerificationReviews } from "@/lib/verification";
import type {
  AdminData,
  AdminExportData,
  AdminProfile,
  BusinessStage,
  BusinessType,
  CapacityUnit,
  ContributionCategory,
  DashboardData,
  EvidenceItemRecord,
  EvidenceStatus,
  IntroRequestRecord,
  MatchCandidate,
  MatchRecord,
  MatchStatus,
  NeedRecord,
  OfferAvailabilityStatus,
  OfferRecord,
  OfferStatus,
  ParsedOnboardingInput,
  ProfileStatus,
  UserRole,
} from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type SupabaseClient = NonNullable<ReturnType<typeof createAdminSupabaseClient>>;
type Row = Record<string, unknown>;

function requireAdminClient() {
  const client = createAdminSupabaseClient();
  if (!client) {
    throw new Error("Faltan las variables privadas de Supabase en el servidor.");
  }
  return client;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function asOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapProfile(row: Row): AdminProfile {
  return {
    id: asString(row.id),
    email: asString(row.email),
    fullName: asString(row.full_name),
    businessName: asString(row.business_name),
    city: asString(row.city),
    businessType: asString(row.business_type, "other") as BusinessType,
    stage: asString(row.stage, "idea") as BusinessStage,
    status: asString(row.status, "pending_review") as ProfileStatus,
    role: asString(row.role, "member") as UserRole,
    trustScore: asNumber(row.trust_score, 20),
    createdAt: asString(row.created_at),
  };
}

function mapOffer(row: Row): OfferRecord {
  return {
    id: asString(row.id),
    profileId: asString(row.profile_id),
    title: asString(row.title),
    description: asString(row.description),
    tags: asStringArray(row.tags),
    status: asString(row.status, "pending") as OfferStatus,
    contributionTemplateId: asString(row.contribution_template_id, "") || null,
    contributionCategory: (asString(row.contribution_category, "") || null) as ContributionCategory | null,
    availabilityStatus: asString(row.availability_status, "active") as OfferAvailabilityStatus,
    capacityTotal: asOptionalNumber(row.capacity_total),
    capacityUsed: asOptionalNumber(row.capacity_used),
    capacityUnit: (asString(row.capacity_unit, "") || null) as CapacityUnit | null,
    availableFrom: asString(row.available_from, "") || null,
    availableUntil: asString(row.available_until, "") || null,
    nextReviewAt: asString(row.next_review_at, "") || null,
    restrictions: asString(row.restrictions, "") || null,
    createdAt: asString(row.created_at),
    adminNotes: asString(row.admin_notes, "") || null,
  };
}

function mapNeed(row: Row): NeedRecord {
  return {
    id: asString(row.id),
    profileId: asString(row.profile_id),
    title: asString(row.title),
    description: asString(row.description),
    tags: asStringArray(row.tags),
    createdAt: asString(row.created_at),
  };
}

function mapEvidence(row: Row): EvidenceItemRecord {
  return {
    id: asString(row.id),
    profileId: asString(row.profile_id),
    offerId: asString(row.offer_id, "") || null,
    label: asString(row.label),
    kind: asString(row.kind, "link") as EvidenceItemRecord["kind"],
    url: asString(row.url, "") || null,
    normalizedUrl: asString(row.normalized_url, "") || null,
    storagePath: asString(row.storage_path, "") || null,
    contentHash: asString(row.content_hash, "") || null,
    byteSize: asNumber(row.byte_size),
    status: asString(row.status, "pending") as EvidenceStatus,
    adminNotes: asString(row.admin_notes, "") || null,
    createdAt: asString(row.created_at),
  };
}

function mapIntro(row: Row): IntroRequestRecord {
  return {
    id: asString(row.id),
    matchId: asString(row.match_id),
    requestedBy: asString(row.requested_by),
    message: asString(row.message),
    status: asString(row.status, "requested") as IntroRequestRecord["status"],
    createdAt: asString(row.created_at),
  };
}

function buildProfileLookup(profiles: AdminProfile[]): DashboardData["profileLookup"] {
  return Object.fromEntries(
    profiles.map((profile) => [
      profile.id,
      {
        id: profile.id,
        businessName: profile.businessName,
        city: profile.city,
        businessType: profile.businessType,
        status: profile.status,
      },
    ]),
  );
}

function calculateTrustScore(
  profile: AdminProfile,
  offers: OfferRecord[],
  evidenceItems: EvidenceItemRecord[],
  matches: MatchRecord[],
) {
  const verifiedOffers = offers.filter((offer) => offer.status === "verified").length;
  const verifiedEvidence = evidenceItems.filter((item) => item.status === "verified").length;
  const completedMatches = matches.filter((match) => match.status === "completed").length;
  const activeBonus = profile.status === "active" ? 15 : 0;
  const evidenceBonus = Math.min(20, verifiedEvidence * 5);
  const offerBonus = Math.min(30, verifiedOffers * 15);
  const completionBonus = Math.min(20, completedMatches * 10);
  const penalty = profile.status === "rejected" ? 40 : profile.status === "needs_evidence" ? 10 : 0;

  return Math.max(0, Math.min(100, 20 + activeBonus + evidenceBonus + offerBonus + completionBonus - penalty));
}

async function selectAll(
  client: SupabaseClient,
): Promise<AdminExportData & { participants: Row[]; materializedCandidates: MatchCandidate[] }> {
  const [
    profilesResult,
    offersResult,
    needsResult,
    evidenceResult,
    matchesResult,
    participantsResult,
    introsResult,
    candidatesResult,
  ] =
    await Promise.all([
      client.from("profiles").select("*").order("created_at", { ascending: false }),
      client.from("offers").select("*").order("created_at", { ascending: false }),
      client.from("needs").select("*").order("created_at", { ascending: false }),
      client.from("evidence_items").select("*").order("created_at", { ascending: false }),
      client.from("matches").select("*").order("created_at", { ascending: false }),
      client.from("match_participants").select("*"),
      client.from("intro_requests").select("*").order("created_at", { ascending: false }),
      client
        .from("match_candidates")
        .select("*")
        .is("dismissed_at", null)
        .order("score", { ascending: false })
        .limit(500),
    ]);

  const firstError =
    profilesResult.error ||
    offersResult.error ||
    needsResult.error ||
    evidenceResult.error ||
    matchesResult.error ||
    participantsResult.error ||
    introsResult.error ||
    candidatesResult.error;

  if (firstError) throw firstError;

  const profiles = (profilesResult.data ?? []).map((row) => mapProfile(row as Row));
  const offers = (offersResult.data ?? []).map((row) => mapOffer(row as Row));
  const needs = (needsResult.data ?? []).map((row) => mapNeed(row as Row));
  const evidenceItems = (evidenceResult.data ?? []).map((row) => mapEvidence(row as Row));
  const participants = (participantsResult.data ?? []) as Row[];
  const matches = ((matchesResult.data ?? []) as Row[]).map((row) => mapMatch(row, participants));
  const introRequests = (introsResult.data ?? []).map((row) => mapIntro(row as Row));
  const materializedCandidates = ((candidatesResult.data ?? []) as Row[]).map((row) =>
    mapMaterializedCandidate(row),
  );

  return { profiles, offers, needs, evidenceItems, matches, participants, introRequests, materializedCandidates };
}

function mapMatch(row: Row, participants: Row[]): MatchRecord {
  const matchId = asString(row.id);
  const related = participants.filter((participant) => asString(participant.match_id) === matchId);
  const offerer = related.find((participant) => asString(participant.role) === "offerer");
  const needer = related.find((participant) => asString(participant.role) === "needer");

  return {
    id: matchId,
    status: asString(row.status, "suggested") as MatchStatus,
    score: asNumber(row.score),
    offererProfileId: asString(offerer?.profile_id),
    neederProfileId: asString(needer?.profile_id),
    offerId: asString(offerer?.offer_id),
    needId: asString(needer?.need_id),
    blockingReasons: asStringArray(row.blocking_reasons),
    adminNotes: asString(row.admin_notes, "") || null,
    createdAt: asString(row.created_at),
  };
}

export async function isAdminUser(userId: string) {
  const client = requireAdminClient();
  const { data, error } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (error) throw error;
  return asString((data as Row | null)?.role) === "admin";
}

export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  const client = requireAdminClient();
  const all = await selectAll(client);
  const profile = all.profiles.find((item) => item.id === userId);
  if (!profile) return null;

  const offers = all.offers.filter((offer) => offer.profileId === userId);
  const needs = all.needs.filter((need) => need.profileId === userId);
  const evidenceItems = all.evidenceItems.filter((item) => item.profileId === userId);
  const matches = all.matches.filter(
    (match) =>
      (match.offererProfileId === userId || match.neederProfileId === userId) &&
      ["approved", "introduced", "completed"].includes(match.status),
  );
  const introRequests = all.introRequests.filter((intro) => matches.some((match) => match.id === intro.matchId));
  const computedTrust = calculateTrustScore(profile, offers, evidenceItems, matches);
  const visibleProfileIds = new Set([
    userId,
    ...matches.flatMap((match) => [match.offererProfileId, match.neederProfileId]),
  ]);

  return {
    profile: { ...profile, trustScore: computedTrust },
    offers,
    needs,
    evidenceItems,
    matches,
    introRequests,
    profileLookup: buildProfileLookup(all.profiles.filter((item) => visibleProfileIds.has(item.id))),
  };
}

export async function getAdminData(): Promise<AdminData> {
  const client = requireAdminClient();
  const all = await selectAll(client);
  const profiles = all.profiles.map((profile) => ({
    ...profile,
    trustScore: calculateTrustScore(
      profile,
      all.offers.filter((offer) => offer.profileId === profile.id),
      all.evidenceItems.filter((item) => item.profileId === profile.id),
      all.matches.filter((match) => match.offererProfileId === profile.id || match.neederProfileId === profile.id),
    ),
  }));
  const profileLookup = buildProfileLookup(profiles);
  const matchProfiles = all.profiles.map((profile) => ({
    id: profile.id,
    businessName: profile.businessName,
    city: profile.city,
    businessType: profile.businessType,
    status: profile.status,
  }));
  const candidateMatches = all.materializedCandidates.length
    ? all.materializedCandidates
    : generateCandidateMatches({
        profiles: matchProfiles,
        offers: all.offers,
        needs: all.needs,
        evidenceItems: all.evidenceItems,
      });
  const matchWorkbench = buildMatchWorkbench({
    candidates: candidateMatches,
    profiles: matchProfiles,
    existingMatches: all.matches,
  });
  const verificationReviews = buildVerificationReviews({
    offers: all.offers,
    profiles,
    evidenceItems: all.evidenceItems,
  });

  return {
    ...all,
    profiles,
    profileLookup,
    candidateMatches: matchWorkbench.reviewQueue,
    matchWorkbench,
    creditLedger: buildInternalCreditLedger({ profiles, introRequests: all.introRequests }),
    verificationReviews,
  };
}

export async function refreshMaterializedMatchCandidates() {
  const client = requireAdminClient();
  const all = await selectAll(client);
  const matchProfiles = all.profiles.map((profile) => ({
    id: profile.id,
    businessName: profile.businessName,
    city: profile.city,
    businessType: profile.businessType,
    status: profile.status,
  }));
  const candidates = generateCandidateMatches({
    profiles: matchProfiles,
    offers: all.offers,
    needs: all.needs,
    evidenceItems: all.evidenceItems,
  });
  const rows = candidates.map((candidate) => candidateToDatabaseRow(candidate));
  const now = new Date().toISOString();

  const { error: dismissError } = await client
    .from("match_candidates")
    .update({ dismissed_at: now, updated_at: now })
    .is("dismissed_at", null);
  if (dismissError) throw dismissError;

  if (rows.length) {
    const { error } = await client.from("match_candidates").upsert(rows, { onConflict: "pair_key" });
    if (error) throw error;
  }

  revalidatePath("/admin");
  return { generated: candidates.length };
}

export async function getAdminExportData(): Promise<AdminExportData> {
  const adminData = await getAdminData();
  return {
    profiles: adminData.profiles,
    offers: adminData.offers,
    needs: adminData.needs,
    evidenceItems: adminData.evidenceItems,
    matches: adminData.matches,
    introRequests: adminData.introRequests,
  };
}

function nextProfileStatus(existingStatus: string) {
  return existingStatus === "active" || existingStatus === "rejected" ? existingStatus : "pending_review";
}

async function hashEvidenceFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return createHash("sha256").update(buffer).digest("hex");
}

async function getOnboardingUsage(client: SupabaseClient, profileId: string): Promise<ExistingOnboardingUsage> {
  const [offersResult, needsResult, evidenceResult] = await Promise.all([
    client
      .from("offers")
      .select("id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true }),
    client
      .from("needs")
      .select("id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true }),
    client
      .from("evidence_items")
      .select("kind,url,normalized_url,byte_size,content_hash")
      .eq("profile_id", profileId),
  ]);

  const firstError = offersResult.error || needsResult.error || evidenceResult.error;
  if (firstError) throw firstError;

  const evidenceRows = (evidenceResult.data ?? []) as Row[];
  const fileRows = evidenceRows.filter((row) => asString(row.kind) === "file");

  return {
    offerIds: ((offersResult.data ?? []) as Row[]).map((row) => asString(row.id)).filter(Boolean),
    needIds: ((needsResult.data ?? []) as Row[]).map((row) => asString(row.id)).filter(Boolean),
    evidenceLinks: evidenceRows
      .filter((row) => asString(row.kind) === "link")
      .map((row) => asString(row.normalized_url) || asString(row.url))
      .filter(Boolean),
    evidenceFileCount: fileRows.length,
    uploadedBytes: fileRows.reduce((total, row) => total + Math.max(0, asNumber(row.byte_size)), 0),
    fileHashes: fileRows.map((row) => asString(row.content_hash)).filter(Boolean),
  };
}

export async function saveOnboarding(
  user: { id: string; email?: string | null },
  parsed: ParsedOnboardingInput,
  files: File[],
) {
  const client = requireAdminClient();
  const now = new Date().toISOString();
  const nonEmptyFiles = files.filter((item) => item.size > 0);
  const incomingFiles = await Promise.all(
    nonEmptyFiles.map(async (file) => ({
      file,
      size: file.size,
      hash: await hashEvidenceFile(file),
    })),
  );
  const [existingProfileResult, usage] = await Promise.all([
    client.from("profiles").select("status").eq("id", user.id).maybeSingle(),
    getOnboardingUsage(client, user.id),
  ]);
  if (existingProfileResult.error) throw existingProfileResult.error;

  const plan = planOnboardingWrite(usage, {
    evidenceLinks: parsed.evidenceLinks,
    files: incomingFiles,
  });
  if (!plan.ok) throw new Error(plan.error);

  const { error: profileError } = await client.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    full_name: parsed.profile.fullName,
    business_name: parsed.profile.businessName,
    city: parsed.profile.city,
    business_type: parsed.profile.businessType,
    stage: parsed.profile.stage,
    status: nextProfileStatus(asString((existingProfileResult.data as Row | null)?.status)),
    consent_accepted: true,
    consent_at: now,
    updated_at: now,
  });
  if (profileError) throw profileError;

  const offerPayload = {
    profile_id: user.id,
    onboarding_key: "primary",
    title: parsed.offer.title,
    description: parsed.offer.description,
    tags: parsed.offer.tags,
    status: "pending",
    contribution_template_id: parsed.offer.contributionTemplateId,
    contribution_category: parsed.offer.contributionCategory,
    availability_status: parsed.offer.availabilityStatus,
    capacity_total: parsed.offer.capacityTotal,
    capacity_used: 0,
    capacity_unit: parsed.offer.capacityUnit,
    available_from: parsed.offer.availableFrom,
    available_until: parsed.offer.availableUntil,
    next_review_at: parsed.offer.availableUntil,
    restrictions: parsed.offer.restrictions,
    updated_at: now,
  };
  const offerQuery = plan.primaryOfferId
    ? client.from("offers").update(offerPayload).eq("id", plan.primaryOfferId).select("id").single()
    : client.from("offers").insert(offerPayload).select("id").single();
  const { data: offerData, error: offerError } = await offerQuery;
  if (offerError) throw offerError;

  const offerId = asString((offerData as Row).id);
  const needPayload = {
    profile_id: user.id,
    onboarding_key: "primary",
    title: parsed.need.title,
    description: parsed.need.description,
    tags: parsed.need.tags,
    updated_at: now,
  };
  const needQuery = plan.primaryNeedId
    ? client.from("needs").update(needPayload).eq("id", plan.primaryNeedId)
    : client.from("needs").insert(needPayload);
  const { error: needError } = await needQuery;
  if (needError) throw needError;

  if (plan.evidenceLinksToInsert.length) {
    const { error } = await client.from("evidence_items").insert(
      plan.evidenceLinksToInsert.map((link) => ({
        profile_id: user.id,
        offer_id: offerId,
        label: link,
        kind: "link",
        url: link,
        normalized_url: link,
        byte_size: 0,
        status: "pending",
      })),
    );
    if (error) throw error;
  }

  for (const item of plan.filesToInsert) {
    const file = item.file;
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]+/g, "-").slice(0, 120);
    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await client.storage.from("evidence").upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { error: evidenceError } = await client.from("evidence_items").insert({
      profile_id: user.id,
      offer_id: offerId,
      label: file.name,
      kind: "file",
      storage_path: storagePath,
      content_hash: item.hash,
      byte_size: item.size,
      status: "pending",
    });
    if (evidenceError) throw evidenceError;
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function updateProfileStatus(profileId: string, status: ProfileStatus) {
  const client = requireAdminClient();
  const { error } = await client
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateOfferStatus(offerId: string, status: OfferStatus, adminNotes: string) {
  const client = requireAdminClient();
  const { data: offer, error: offerReadError } = await client
    .from("offers")
    .select("profile_id")
    .eq("id", offerId)
    .single();
  if (offerReadError) throw offerReadError;

  const { error } = await client
    .from("offers")
    .update({ status, admin_notes: adminNotes, updated_at: new Date().toISOString() })
    .eq("id", offerId);
  if (error) throw error;

  if (status === "verified") {
    await client.from("reputation_events").insert({
      profile_id: asString((offer as Row).profile_id),
      kind: "offer_verified",
      score_delta: 15,
      reason: "El fundador verificó una afirmación de oferta",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateOfferAvailability(
  offerId: string,
  payload: {
    availabilityStatus: OfferAvailabilityStatus;
    capacityTotal?: number | null;
    capacityUsed?: number | null;
    capacityUnit?: CapacityUnit | null;
    availableFrom?: string | null;
    availableUntil?: string | null;
    restrictions?: string | null;
  },
) {
  const client = requireAdminClient();
  const { error } = await client
    .from("offers")
    .update({
      availability_status: payload.availabilityStatus,
      capacity_total: payload.capacityTotal,
      capacity_used: payload.capacityUsed,
      capacity_unit: payload.capacityUnit,
      available_from: payload.availableFrom,
      available_until: payload.availableUntil,
      next_review_at: payload.availableUntil,
      restrictions: payload.restrictions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", offerId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateEvidenceStatus(evidenceId: string, status: EvidenceStatus, adminNotes: string, reviewerId: string) {
  const client = requireAdminClient();
  const { error } = await client
    .from("evidence_items")
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", evidenceId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function requestEvidence(offerId: string, adminNotes: string) {
  await updateOfferStatus(offerId, "pending", adminNotes || "Se necesita más evidencia antes de hacer una presentación.");
}

export async function createMatch(candidate: MatchCandidate, adminNotes: string) {
  const client = requireAdminClient();
  const { data: match, error: matchError } = await client
    .from("matches")
    .insert({
      status: candidate.status,
      score: candidate.score,
      blocking_reasons: candidate.blockingReasons,
      score_breakdown: candidate.scoreBreakdown,
      admin_notes: adminNotes,
    })
    .select("id")
    .single();
  if (matchError) throw matchError;

  const matchId = asString((match as Row).id);
  const { error: participantError } = await client.from("match_participants").insert([
    {
      match_id: matchId,
      profile_id: candidate.offererProfileId,
      role: "offerer",
      offer_id: candidate.offerId,
    },
    {
      match_id: matchId,
      profile_id: candidate.neederProfileId,
      role: "needer",
      need_id: candidate.needId,
    },
  ]);
  if (participantError) throw participantError;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateMatchStatus(matchId: string, status: MatchStatus, adminNotes: string) {
  const client = requireAdminClient();
  const { error } = await client
    .from("matches")
    .update({
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", matchId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function createIntroRequest(matchId: string, requestedBy: string, message: string) {
  const client = requireAdminClient();
  const [participantResult, matchResult] = await Promise.all([
    client
      .from("match_participants")
      .select("id")
      .eq("match_id", matchId)
      .eq("profile_id", requestedBy)
      .maybeSingle(),
    client.from("matches").select("status").eq("id", matchId).maybeSingle(),
  ]);

  if (participantResult.error) throw participantResult.error;
  if (matchResult.error) throw matchResult.error;

  const matchStatus = asString((matchResult.data as Row | null)?.status, "") as MatchStatus;
  if (!canRequestIntroForMatch(matchStatus, Boolean(participantResult.data))) {
    throw new Error("Solo puedes pedir presentación en matches aprobados donde participa tu cuenta.");
  }

  const { error } = await client.from("intro_requests").insert({
    match_id: matchId,
    requested_by: requestedBy,
    message,
    status: "requested",
  });
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function exportAdminData(format: "json" | "csv") {
  const data = await getAdminExportData();
  return formatAdminExport(data, format);
}

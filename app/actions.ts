"use server";

import { redirect } from "next/navigation";

import { hasEvidenceSubmission, parseOnboardingInput } from "@/lib/onboarding";
import {
  createIntroRequest,
  createMatch,
  isAdminUser,
  requestEvidence,
  refreshMaterializedMatchCandidates,
  saveOnboarding,
  updateEvidenceStatus,
  updateOfferAvailability,
  updateMatchStatus,
  updateOfferStatus,
  updateProfileStatus,
} from "@/lib/repository";
import { getCurrentUser } from "@/lib/supabase/server";
import type {
  CapacityUnit,
  EvidenceStatus,
  MatchCandidate,
  MatchStatus,
  OfferAvailabilityStatus,
  OfferStatus,
  ProfileStatus,
} from "@/lib/types";

function formToRecord(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).filter(([key]) => key !== "evidenceFiles"),
  ) as Record<string, unknown>;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/onboarding");
  return user;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin");
  const isAdmin = await isAdminUser(user.id);
  if (!isAdmin) throw new Error("No tienes acceso de fundador.");
  return user;
}

function nullablePositiveNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

function nullableString(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw || null;
}

export async function submitOnboarding(formData: FormData) {
  const user = await requireUser();
  const parsed = parseOnboardingInput(formToRecord(formData));

  if (!parsed.success) {
    throw new Error(`El onboarding está incompleto: ${parsed.error}`);
  }

  const files = formData.getAll("evidenceFiles").filter((value): value is File => value instanceof File);
  if (!hasEvidenceSubmission(parsed.data.evidenceLinks, files.map((file) => file.size))) {
    throw new Error("Añade al menos un enlace o archivo de evidencia para que la oferta pueda revisarse.");
  }
  await saveOnboarding(user, parsed.data, files);
  redirect("/dashboard");
}

export async function setProfileStatus(formData: FormData) {
  await requireAdmin();
  await updateProfileStatus(
    String(formData.get("profileId") ?? ""),
    String(formData.get("status") ?? "pending_review") as ProfileStatus,
  );
}

export async function setOfferStatus(formData: FormData) {
  await requireAdmin();
  await updateOfferStatus(
    String(formData.get("offerId") ?? ""),
    String(formData.get("status") ?? "pending") as OfferStatus,
    String(formData.get("adminNotes") ?? ""),
  );
}

export async function setOfferAvailability(formData: FormData) {
  await requireAdmin();
  await updateOfferAvailability(String(formData.get("offerId") ?? ""), {
    availabilityStatus: String(formData.get("availabilityStatus") ?? "active") as OfferAvailabilityStatus,
    capacityTotal: nullablePositiveNumber(formData.get("capacityTotal")),
    capacityUsed: nullablePositiveNumber(formData.get("capacityUsed")),
    capacityUnit: String(formData.get("capacityUnit") ?? "other") as CapacityUnit,
    availableFrom: nullableString(formData.get("availableFrom")),
    availableUntil: nullableString(formData.get("availableUntil")),
    restrictions: nullableString(formData.get("restrictions")),
  });
}

export async function askForEvidence(formData: FormData) {
  await requireAdmin();
  await requestEvidence(String(formData.get("offerId") ?? ""), String(formData.get("adminNotes") ?? ""));
}

export async function setEvidenceStatus(formData: FormData) {
  const user = await requireAdmin();
  await updateEvidenceStatus(
    String(formData.get("evidenceId") ?? ""),
    String(formData.get("status") ?? "pending") as EvidenceStatus,
    String(formData.get("adminNotes") ?? ""),
    user.id,
  );
}

export async function approveCandidateMatch(formData: FormData) {
  await requireAdmin();
  const candidate: MatchCandidate = {
    offererProfileId: String(formData.get("offererProfileId") ?? ""),
    neederProfileId: String(formData.get("neederProfileId") ?? ""),
    offerId: String(formData.get("offerId") ?? ""),
    needId: String(formData.get("needId") ?? ""),
    score: Number(formData.get("score") ?? 0),
    status: String(formData.get("status") ?? "suggested") as MatchCandidate["status"],
    blockingReasons: String(formData.get("blockingReasons") ?? "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean),
    overlapTags: String(formData.get("overlapTags") ?? "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean),
    scoreBreakdown: {
      tagOverlap: Number(formData.get("tagOverlap") ?? 0),
      sameCity: Number(formData.get("sameCity") ?? 0),
      verifiedOffer: Number(formData.get("verifiedOffer") ?? 0),
      complementaryTypes: Number(formData.get("complementaryTypes") ?? 0),
    },
    automation: {
      fitScore: Number(formData.get("fitScore") ?? 0),
      trustScore: Number(formData.get("trustScore") ?? 0),
      urgencyScore: Number(formData.get("urgencyScore") ?? 0),
      riskPenalty: Number(formData.get("riskPenalty") ?? 0),
      riskLevel: String(formData.get("riskLevel") ?? "medium") as MatchCandidate["automation"]["riskLevel"],
      nextAction: String(formData.get("nextAction") ?? "review_manually") as MatchCandidate["automation"]["nextAction"],
      reason: String(formData.get("automationReason") ?? "Revisar manualmente"),
    },
  };

  await createMatch(candidate, String(formData.get("adminNotes") ?? ""));
}

export async function refreshCandidateQueue() {
  await requireAdmin();
  await refreshMaterializedMatchCandidates();
}

export async function setMatchStatus(formData: FormData) {
  await requireAdmin();
  await updateMatchStatus(
    String(formData.get("matchId") ?? ""),
    String(formData.get("status") ?? "suggested") as MatchStatus,
    String(formData.get("adminNotes") ?? ""),
  );
}

export async function requestIntro(formData: FormData) {
  const user = await requireUser();
  await createIntroRequest(
    String(formData.get("matchId") ?? ""),
    user.id,
    String(formData.get("message") ?? "Me gustaría que Empuje revise esta presentación."),
  );
}

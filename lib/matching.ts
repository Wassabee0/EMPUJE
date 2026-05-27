import type {
  BusinessType,
  EvidenceItemRecord,
  MatchCandidate,
  MatchCandidateInput,
  OfferRecord,
  PublicProfile,
} from "./types";
import { canGenerateCandidateForOffer, formatCapacityLabel, getRemainingCapacity } from "./offer-availability";

const complementaryTypes = new Set<string>([
  "local:brand",
  "brand:local",
  "local:service",
  "service:local",
  "brand:service",
  "service:brand",
  "community:brand",
  "brand:community",
  "community:local",
  "local:community",
]);

function normalizeTag(tag: string) {
  return tag
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right.map(normalizeTag));
  return left.map(normalizeTag).filter((tag) => tag && rightSet.has(tag));
}

function typeBonus(offerer: BusinessType, needer: BusinessType) {
  return complementaryTypes.has(`${offerer}:${needer}`) ? 10 : 0;
}

function profileBlocks(profile: PublicProfile, role: "offerer" | "needer") {
  const label = role === "offerer" ? "El perfil que ofrece" : "El perfil que necesita";
  if (profile.status === "active") return [];
  if (profile.status === "rejected") return [`${label} está rechazado`];
  if (profile.status === "needs_evidence") return [`${label} necesita más evidencia`];
  return [`${label} está pendiente de revisión del fundador`];
}

function offerBlocks(offer: OfferRecord) {
  if (offer.status === "verified") return [];
  if (offer.status === "rejected") return ["La afirmación de la oferta fue rechazada"];
  return ["La evidencia de la oferta debe verificarse antes de una presentación"];
}

function urgencyScore(offer: OfferRecord, need: { title: string; description?: string }) {
  const text = `${offer.title} ${offer.description ?? ""} ${need.title} ${need.description ?? ""}`.toLowerCase();
  const markers = ["urgente", "este mes", "esta semana", "ahora", "primer caso", "validar", "piloto"];
  return Math.min(20, markers.filter((marker) => text.includes(marker)).length * 7);
}

function trustScore({
  offer,
  offerer,
  needer,
  evidenceItems,
  blockingReasons,
}: {
  offer: OfferRecord;
  offerer: PublicProfile;
  needer: PublicProfile;
  evidenceItems: EvidenceItemRecord[];
  blockingReasons: string[];
}) {
  const verifiedEvidence = evidenceItems.some((item) => item.status === "verified");
  const rejectedEvidence = evidenceItems.some((item) => item.status === "rejected");
  let score = 0;
  if (offerer.status === "active") score += 20;
  if (needer.status === "active") score += 20;
  if (offer.status === "verified") score += 35;
  if (verifiedEvidence) score += 20;
  if (!blockingReasons.length) score += 5;
  if (rejectedEvidence) score -= 30;
  return Math.max(0, Math.min(100, score));
}

function riskPenalty(offer: OfferRecord, blockingReasons: string[], evidenceItems: EvidenceItemRecord[]) {
  let penalty = blockingReasons.length * 25;
  if (offer.status === "pending" || offer.status === "unverified") penalty += 15;
  if (offer.status === "rejected") penalty += 60;
  if (evidenceItems.some((item) => item.status === "rejected")) penalty += 35;
  return Math.min(100, penalty);
}

function riskLevel(penalty: number) {
  if (penalty >= 40) return "high";
  if (penalty >= 15) return "medium";
  return "low";
}

function nextAction(candidate: {
  status: MatchCandidate["status"];
  score: number;
  riskLevel: MatchCandidate["automation"]["riskLevel"];
  blockingReasons: string[];
}) {
  if (candidate.blockingReasons.some((reason) => reason.includes("rechazad"))) return "reject";
  if (candidate.blockingReasons.some((reason) => reason.includes("evidencia") || reason.includes("pendiente"))) {
    return "request_evidence";
  }
  if (candidate.status === "suggested" && candidate.score >= 80 && candidate.riskLevel === "low") {
    return "approve_candidate";
  }
  return "review_manually";
}

function actionReason(action: MatchCandidate["automation"]["nextAction"]) {
  if (action === "approve_candidate") return "Listo para revisión rápida";
  if (action === "request_evidence") return "Pedir evidencia antes de revisar intro";
  if (action === "reject") return "Descartar o corregir antes de volver a proponer";
  return "Revisar manualmente";
}

function evidenceByOffer(evidenceItems: EvidenceItemRecord[] = []) {
  const map = new Map<string, EvidenceItemRecord[]>();
  for (const item of evidenceItems) {
    if (!item.offerId) continue;
    map.set(item.offerId, [...(map.get(item.offerId) ?? []), item]);
  }
  return map;
}

export function generateCandidateMatches(input: MatchCandidateInput): MatchCandidate[] {
  const profiles = new Map(input.profiles.map((profile) => [profile.id, profile]));
  const evidenceLookup = evidenceByOffer(input.evidenceItems);
  const candidates: MatchCandidate[] = [];

  for (const offer of input.offers) {
    if (!canGenerateCandidateForOffer(offer)) continue;

    const offerer = profiles.get(offer.profileId);
    if (!offerer) continue;

    for (const need of input.needs) {
      if (need.profileId === offer.profileId) continue;

      const needer = profiles.get(need.profileId);
      if (!needer) continue;

      const overlapTags = overlap(offer.tags, need.tags);
      if (overlapTags.length === 0) continue;

      const scoreBreakdown = {
        tagOverlap: overlapTags.length * 30,
        sameCity: offerer.city.trim().toLowerCase() === needer.city.trim().toLowerCase() ? 15 : 0,
        verifiedOffer: offer.status === "verified" ? 20 : 0,
        complementaryTypes: typeBonus(offerer.businessType, needer.businessType),
        availableCapacity: offer.capacityTotal ? 5 : 0,
      };
      const blockingReasons = [
        ...profileBlocks(offerer, "offerer"),
        ...profileBlocks(needer, "needer"),
        ...offerBlocks(offer),
      ];
      const score = Math.min(
        100,
        scoreBreakdown.tagOverlap +
          scoreBreakdown.sameCity +
          scoreBreakdown.verifiedOffer +
          scoreBreakdown.complementaryTypes +
          scoreBreakdown.availableCapacity,
      );
      const offerEvidence = evidenceLookup.get(offer.id) ?? [];
      const fitScore = Math.min(
        100,
        scoreBreakdown.tagOverlap + scoreBreakdown.sameCity + scoreBreakdown.complementaryTypes,
      );
      const candidateTrustScore = trustScore({
        offer,
        offerer,
        needer,
        evidenceItems: offerEvidence,
        blockingReasons,
      });
      const candidateUrgencyScore = urgencyScore(offer, need);
      const candidateRiskPenalty = riskPenalty(offer, blockingReasons, offerEvidence);
      const candidateRiskLevel = riskLevel(candidateRiskPenalty);
      const status = blockingReasons.length ? "needs_evidence" : "suggested";
      const candidateNextAction = nextAction({
        status,
        score,
        riskLevel: candidateRiskLevel,
        blockingReasons,
      });

      candidates.push({
        offererProfileId: offerer.id,
        neederProfileId: needer.id,
        offerId: offer.id,
        needId: need.id,
        score,
        status,
        blockingReasons,
        overlapTags,
        scoreBreakdown,
        automation: {
          fitScore,
          trustScore: candidateTrustScore,
          urgencyScore: candidateUrgencyScore,
          riskPenalty: candidateRiskPenalty,
          riskLevel: candidateRiskLevel,
          nextAction: candidateNextAction,
          reason: actionReason(candidateNextAction),
          remainingCapacity: getRemainingCapacity(offer),
          capacityLabel: formatCapacityLabel(offer),
        },
      });
    }
  }

  return candidates.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.offerId.localeCompare(right.offerId);
  });
}

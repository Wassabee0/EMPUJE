import type { AdminProfile, EvidenceItemRecord, OfferRecord, OfferVerificationReview } from "@/lib/types";
import { buildEvidenceGuidance } from "./evidence-guidance";
import { availabilityBlocksMatch } from "./offer-availability";

type BuildOfferVerificationReviewInput = {
  offer: OfferRecord;
  profile: Pick<AdminProfile, "id" | "status" | "businessType">;
  evidenceItems: EvidenceItemRecord[];
};

const defaultRequiredEvidence = ["Una prueba verificable de que la oferta existe"];
const vagueTags = new Set(["visibilidad", "audiencia", "marketing", "networking", "contactos"]);

function hasConcreteText(offer: OfferRecord) {
  const text = `${offer.title} ${offer.description ?? ""}`.trim();
  return text.length >= 45 && /\b(espacio|foto|producto|taller|legal|logistica|local|stock|portfolio|evento|pop-up)\b/i.test(text);
}

function hasVagueOnlyTags(offer: OfferRecord) {
  const tags = offer.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  return tags.length > 0 && tags.every((tag) => vagueTags.has(tag));
}

function riskFromScore(score: number, hasBlockingRisk: boolean) {
  if (hasBlockingRisk || score < 50) return "high";
  if (score < 80) return "medium";
  return "low";
}

export function buildOfferVerificationReview({
  offer,
  profile,
  evidenceItems,
}: BuildOfferVerificationReviewInput): OfferVerificationReview {
  const relatedEvidence = evidenceItems.filter((item) => item.offerId === offer.id);
  const verifiedEvidence = relatedEvidence.filter((item) => item.status === "verified");
  const pendingEvidence = relatedEvidence.filter((item) => item.status === "pending" || item.status === "needs_more");
  const rejectedEvidence = relatedEvidence.filter((item) => item.status === "rejected");
  const concrete = hasConcreteText(offer);
  const vagueOnly = hasVagueOnlyTags(offer);
  const activeProfile = profile.status === "active";
  const availabilityBlocks = availabilityBlocksMatch(offer);
  const guidance = buildEvidenceGuidance({
    businessType: profile.businessType,
    contributionTemplateId: offer.contributionTemplateId,
    offerTitle: offer.title,
    offerDescription: offer.description,
    offerTags: offer.tags,
  });

  const blockingReasons = [
    ...(!activeProfile ? ["El perfil no esta activo"] : []),
    ...(rejectedEvidence.length ? ["Hay evidencia rechazada asociada a la oferta"] : []),
    ...(vagueOnly ? ["La oferta depende de tags demasiado genericos"] : []),
    ...availabilityBlocks,
  ];
  const missingEvidence = verifiedEvidence.length ? [] : [...defaultRequiredEvidence, ...guidance.requiredEvidence];
  if (!concrete) missingEvidence.push("Una descripcion concreta de que se ofrece, para quien y con que limite");

  let score = 20;
  if (activeProfile) score += 15;
  if (concrete) score += 20;
  if (offer.tags.length >= 2 && !vagueOnly) score += 10;
  if (verifiedEvidence.length) score += 35;
  if (pendingEvidence.length) score += 8;
  if (rejectedEvidence.length) score -= 35;
  if (vagueOnly) score -= 20;
  if (availabilityBlocks.length) score -= 20;
  score = Math.max(0, Math.min(100, score));

  const riskLevel = riskFromScore(score, blockingReasons.length > 0);
  const recommendedAction =
    rejectedEvidence.length
      ? "reject_or_request_fix"
      : !activeProfile
        ? "review_profile"
        : verifiedEvidence.length && concrete && availabilityBlocks.length === 0
          ? "can_verify"
          : "request_evidence";

  const autoChecks: OfferVerificationReview["autoChecks"] = [
    { label: "Perfil activo", status: activeProfile ? "pass" : "fail" },
    { label: "Oferta concreta", status: concrete ? "pass" : "warn" },
    { label: "Hay evidencia verificada", status: verifiedEvidence.length ? "pass" : "fail" },
    { label: "Sin evidencia rechazada", status: rejectedEvidence.length ? "fail" : "pass" },
    { label: "Capacidad disponible", status: availabilityBlocks.length ? "fail" : "pass" },
  ];

  const adminSummary =
    recommendedAction === "can_verify"
      ? "Lista para verificacion manual: hay evidencia revisada y una oferta concreta."
      : "La afirmacion no debe verificarse automaticamente; pide evidencia, capacidad o ajustes antes de activar matches.";

  return {
    offerId: offer.id,
    profileId: offer.profileId,
    score,
    riskLevel,
    recommendedAction,
    requiredEvidence: defaultRequiredEvidence,
    missingEvidence,
    blockingReasons,
    autoChecks,
    adminSummary,
  };
}

export function buildVerificationReviews({
  offers,
  profiles,
  evidenceItems,
}: {
  offers: OfferRecord[];
  profiles: Array<Pick<AdminProfile, "id" | "status" | "businessType">>;
  evidenceItems: EvidenceItemRecord[];
}) {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  return offers
    .map((offer) => {
      const profile = profilesById.get(offer.profileId);
      if (!profile) return null;
      return buildOfferVerificationReview({
        offer,
        profile,
        evidenceItems: evidenceItems.filter((item) => item.offerId === offer.id),
      });
    })
    .filter((review): review is OfferVerificationReview => Boolean(review))
    .sort((left, right) => {
      const actionOrder = {
        request_evidence: 0,
        reject_or_request_fix: 1,
        review_profile: 2,
        can_verify: 3,
      };
      return actionOrder[left.recommendedAction] - actionOrder[right.recommendedAction] || left.score - right.score;
    });
}

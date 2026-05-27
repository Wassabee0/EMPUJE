import type {
  CandidateNextAction,
  MatchCandidate,
  MatchStatus,
  OperationalRiskLevel,
} from "@/lib/types";

type MatchCandidateRow = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function pairKey(candidate: Pick<MatchCandidate, "offerId" | "needId">) {
  return `${candidate.offerId}:${candidate.needId}`;
}

export function candidateToDatabaseRow(candidate: MatchCandidate) {
  return {
    pair_key: pairKey(candidate),
    offerer_profile_id: candidate.offererProfileId,
    needer_profile_id: candidate.neederProfileId,
    offer_id: candidate.offerId,
    need_id: candidate.needId,
    score: candidate.score,
    status: candidate.status,
    blocking_reasons: candidate.blockingReasons,
    overlap_tags: candidate.overlapTags,
    score_breakdown: candidate.scoreBreakdown,
    fit_score: candidate.automation.fitScore,
    trust_score: candidate.automation.trustScore,
    urgency_score: candidate.automation.urgencyScore,
    risk_penalty: candidate.automation.riskPenalty,
    risk_level: candidate.automation.riskLevel,
    next_action: candidate.automation.nextAction,
    automation_reason: candidate.automation.reason,
    remaining_capacity: candidate.automation.remainingCapacity,
    capacity_label: candidate.automation.capacityLabel,
    dismissed_at: null,
    generated_at: new Date().toISOString(),
  };
}

export function mapMaterializedCandidate(row: MatchCandidateRow): MatchCandidate {
  const scoreBreakdown = row.score_breakdown as MatchCandidate["scoreBreakdown"] | undefined;
  return {
    offererProfileId: asString(row.offerer_profile_id),
    neederProfileId: asString(row.needer_profile_id),
    offerId: asString(row.offer_id),
    needId: asString(row.need_id),
    score: asNumber(row.score),
    status: asString(row.status, "suggested") as Extract<MatchStatus, "suggested" | "needs_evidence">,
    blockingReasons: asStringArray(row.blocking_reasons),
    overlapTags: asStringArray(row.overlap_tags),
    scoreBreakdown: {
      tagOverlap: scoreBreakdown?.tagOverlap ?? 0,
      sameCity: scoreBreakdown?.sameCity ?? 0,
      verifiedOffer: scoreBreakdown?.verifiedOffer ?? 0,
      complementaryTypes: scoreBreakdown?.complementaryTypes ?? 0,
    },
    automation: {
      fitScore: asNumber(row.fit_score),
      trustScore: asNumber(row.trust_score),
      urgencyScore: asNumber(row.urgency_score),
      riskPenalty: asNumber(row.risk_penalty),
      riskLevel: asString(row.risk_level, "medium") as OperationalRiskLevel,
      nextAction: asString(row.next_action, "review_manually") as CandidateNextAction,
      reason: asString(row.automation_reason, "Revisar manualmente"),
      remainingCapacity:
        row.remaining_capacity === null || typeof row.remaining_capacity === "undefined"
          ? null
          : asNumber(row.remaining_capacity, 0),
      capacityLabel: asString(row.capacity_label, "") || null,
    },
  };
}

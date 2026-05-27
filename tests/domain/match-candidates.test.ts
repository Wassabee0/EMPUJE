import { describe, expect, test } from "vitest";

import { candidateToDatabaseRow, mapMaterializedCandidate } from "../../lib/match-candidates";
import type { MatchCandidate } from "../../lib/types";

const candidate: MatchCandidate = {
  offererProfileId: "offerer",
  neederProfileId: "needer",
  offerId: "offer",
  needId: "need",
  score: 92,
  status: "suggested",
  blockingReasons: [],
  overlapTags: ["pop-up", "madrid"],
  scoreBreakdown: {
    tagOverlap: 60,
    sameCity: 15,
    verifiedOffer: 20,
    complementaryTypes: 10,
  },
  automation: {
    fitScore: 75,
    trustScore: 80,
    urgencyScore: 10,
    riskPenalty: 5,
    riskLevel: "low",
    nextAction: "approve_candidate",
    reason: "Listo para revisión rápida",
  },
};

describe("match candidate persistence", () => {
  test("serializes a candidate into the match_candidates table shape", () => {
    expect(candidateToDatabaseRow(candidate)).toMatchObject({
      pair_key: "offer:need",
      offerer_profile_id: "offerer",
      needer_profile_id: "needer",
      offer_id: "offer",
      need_id: "need",
      score: 92,
      fit_score: 75,
      trust_score: 80,
      urgency_score: 10,
      risk_penalty: 5,
      risk_level: "low",
      next_action: "approve_candidate",
      blocking_reasons: [],
      overlap_tags: ["pop-up", "madrid"],
    });
  });

  test("maps a materialized row back into the admin candidate contract", () => {
    const mapped = mapMaterializedCandidate({
      id: "candidate-id",
      pair_key: "offer:need",
      offerer_profile_id: "offerer",
      needer_profile_id: "needer",
      offer_id: "offer",
      need_id: "need",
      score: 92,
      status: "suggested",
      blocking_reasons: [],
      overlap_tags: ["pop-up", "madrid"],
      score_breakdown: candidate.scoreBreakdown,
      fit_score: 75,
      trust_score: 80,
      urgency_score: 10,
      risk_penalty: 5,
      risk_level: "low",
      next_action: "approve_candidate",
      automation_reason: "Listo para revisión rápida",
      generated_at: "2026-05-27T00:00:00.000Z",
    });

    expect(mapped).toMatchObject(candidate);
  });
});

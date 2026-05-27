import type { MatchCandidate, MatchRecord, PublicProfile } from "@/lib/types";

type BuildMatchWorkbenchInput = {
  candidates: MatchCandidate[];
  profiles: PublicProfile[];
  existingMatches: MatchRecord[];
};

function candidatePairKey(candidate: Pick<MatchCandidate, "offerId" | "needId">) {
  return `${candidate.offerId}:${candidate.needId}`;
}

function matchPairKey(match: Pick<MatchRecord, "offerId" | "needId">) {
  return `${match.offerId}:${match.needId}`;
}

function sortForReview(left: MatchCandidate, right: MatchCandidate) {
  const leftReady = left.status === "suggested" ? 0 : 1;
  const rightReady = right.status === "suggested" ? 0 : 1;
  if (leftReady !== rightReady) return leftReady - rightReady;
  if (right.score !== left.score) return right.score - left.score;
  if (right.scoreBreakdown.sameCity !== left.scoreBreakdown.sameCity) {
    return right.scoreBreakdown.sameCity - left.scoreBreakdown.sameCity;
  }
  return left.offerId.localeCompare(right.offerId);
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function buildMatchWorkbench({ candidates, profiles, existingMatches }: BuildMatchWorkbenchInput) {
  const profileLookup = new Map(profiles.map((profile) => [profile.id, profile]));
  const existingPairs = new Set(existingMatches.map(matchPairKey));
  const reviewQueue = candidates
    .filter((candidate) => !existingPairs.has(candidatePairKey(candidate)))
    .sort(sortForReview);

  const readyNow = reviewQueue.filter((candidate) => candidate.status === "suggested");
  const needsEvidence = reviewQueue.filter((candidate) => candidate.status === "needs_evidence");
  const highSignalSameCity = readyNow.filter(
    (candidate) => candidate.score >= 75 && candidate.scoreBreakdown.sameCity > 0,
  );
  const blockerCounts = countBy(needsEvidence.flatMap((candidate) => candidate.blockingReasons));
  const cityBuckets = countBy(
    reviewQueue
      .map((candidate) => {
        const offerer = profileLookup.get(candidate.offererProfileId);
        const needer = profileLookup.get(candidate.neederProfileId);
        if (!offerer || !needer) return "";
        return `${offerer.city} ↔ ${needer.city}`;
      })
      .filter(Boolean),
  );

  return {
    totalCandidates: candidates.length,
    existingPairsSkipped: candidates.length - reviewQueue.length,
    reviewQueue,
    readyNow,
    needsEvidence,
    highSignalSameCity,
    topBlockers: blockerCounts.map(({ label, count }) => ({ reason: label, count })).slice(0, 5),
    cityBuckets: cityBuckets.slice(0, 5),
  };
}

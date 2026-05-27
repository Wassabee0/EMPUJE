import type { MatchStatus } from "@/lib/types";

const introRequestableStatuses = new Set<MatchStatus>(["approved", "introduced", "completed"]);

export function canRequestIntroForMatch(status: MatchStatus | null | undefined, isParticipant: boolean) {
  return Boolean(status && isParticipant && introRequestableStatuses.has(status));
}

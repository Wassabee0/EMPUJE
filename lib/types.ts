export type ProfileStatus = "pending_review" | "active" | "needs_evidence" | "rejected";
export type BusinessType = "local" | "brand" | "service" | "community" | "other";
export type BusinessStage = "idea" | "first_sales" | "running" | "growing";
export type UserRole = "member" | "admin";
export type OfferStatus = "unverified" | "pending" | "verified" | "rejected";
export type OfferAvailabilityStatus =
  | "active"
  | "partial"
  | "reserved"
  | "in_agreement"
  | "exhausted"
  | "cooldown"
  | "paused"
  | "archived"
  | "suspended";
export type ContributionCategory =
  | "physical_space_assets"
  | "audience_channels"
  | "product_stock"
  | "professional_services"
  | "validation_first_customers"
  | "events_experiences"
  | "operations_distribution"
  | "relationship_capital"
  | "specific_knowledge"
  | "time_execution"
  | "seed_contribution";
export type CapacityUnit =
  | "slots_per_month"
  | "hours_per_month"
  | "units"
  | "projects_per_month"
  | "introductions"
  | "spots"
  | "other";
export type MatchStatus =
  | "suggested"
  | "needs_evidence"
  | "approved"
  | "introduced"
  | "completed"
  | "rejected";
export type EvidenceStatus = "pending" | "verified" | "rejected" | "needs_more";
export type IntroRequestStatus = "requested" | "approved" | "introduced" | "rejected";
export type OperationalRiskLevel = "low" | "medium" | "high";
export type CandidateNextAction = "approve_candidate" | "request_evidence" | "review_manually" | "reject";
export type VerificationRecommendedAction = "can_verify" | "request_evidence" | "reject_or_request_fix" | "review_profile";

export type PublicProfile = {
  id: string;
  businessName: string;
  city: string;
  businessType: BusinessType;
  status: ProfileStatus;
};

export type AdminProfile = PublicProfile & {
  email: string;
  fullName: string;
  stage: BusinessStage;
  role: UserRole;
  trustScore: number;
  createdAt: string;
};

export type OfferRecord = {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  tags: string[];
  status: OfferStatus;
  contributionTemplateId?: string | null;
  contributionCategory?: ContributionCategory | null;
  availabilityStatus?: OfferAvailabilityStatus;
  capacityTotal?: number | null;
  capacityUsed?: number | null;
  capacityUnit?: CapacityUnit | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  nextReviewAt?: string | null;
  restrictions?: string | null;
  createdAt?: string;
  adminNotes?: string | null;
};

export type NeedRecord = {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt?: string;
};

export type EvidenceItemRecord = {
  id: string;
  profileId: string;
  offerId?: string | null;
  label: string;
  kind: "link" | "file" | "note";
  url?: string | null;
  storagePath?: string | null;
  status: EvidenceStatus;
  adminNotes?: string | null;
  createdAt: string;
};

export type OfferVerificationReview = {
  offerId: string;
  profileId: string;
  score: number;
  riskLevel: OperationalRiskLevel;
  recommendedAction: VerificationRecommendedAction;
  requiredEvidence: string[];
  missingEvidence: string[];
  blockingReasons: string[];
  autoChecks: Array<{
    label: string;
    status: "pass" | "warn" | "fail";
  }>;
  adminSummary: string;
};

export type MatchRecord = {
  id: string;
  status: MatchStatus;
  score: number;
  offererProfileId: string;
  neederProfileId: string;
  offerId: string;
  needId: string;
  blockingReasons: string[];
  adminNotes?: string | null;
  createdAt: string;
};

export type IntroRequestRecord = {
  id: string;
  matchId: string;
  requestedBy: string;
  message: string;
  status: IntroRequestStatus;
  createdAt: string;
};

export type MatchCandidateInput = {
  profiles: PublicProfile[];
  offers: OfferRecord[];
  needs: NeedRecord[];
  evidenceItems?: EvidenceItemRecord[];
};

export type MatchCandidate = {
  offererProfileId: string;
  neederProfileId: string;
  offerId: string;
  needId: string;
  score: number;
  status: Extract<MatchStatus, "suggested" | "needs_evidence">;
  blockingReasons: string[];
  overlapTags: string[];
  scoreBreakdown: {
    tagOverlap: number;
    sameCity: number;
    verifiedOffer: number;
    complementaryTypes: number;
    availableCapacity?: number;
  };
  automation: {
    fitScore: number;
    trustScore: number;
    urgencyScore: number;
    riskPenalty: number;
    riskLevel: OperationalRiskLevel;
    nextAction: CandidateNextAction;
    reason: string;
    remainingCapacity?: number | null;
    capacityLabel?: string | null;
  };
};

export type MatchWorkbench = {
  totalCandidates: number;
  existingPairsSkipped: number;
  reviewQueue: MatchCandidate[];
  readyNow: MatchCandidate[];
  needsEvidence: MatchCandidate[];
  highSignalSameCity: MatchCandidate[];
  topBlockers: Array<{
    reason: string;
    count: number;
  }>;
  cityBuckets: Array<{
    label: string;
    count: number;
  }>;
};

export type MaterializedMatchCandidate = MatchCandidate & {
  id: string;
  pairKey: string;
  generatedAt: string;
};

export type InternalCreditAccount = {
  profileId: string;
  businessName: string;
  city: string;
  profileStatus: ProfileStatus;
  planLabel: string;
  monthlyGrant: number;
  rolloverCap: number;
  usedThisMonth: number;
  availableThisMonth: number;
  status: string;
  note: string;
  lastIntroAt?: string;
};

export type InternalCreditLedger = {
  month: string;
  summary: {
    monthlyCreditsIssued: number;
    usedThisMonth: number;
    availableThisMonth: number;
    blockedAccounts: number;
  };
  accounts: InternalCreditAccount[];
};

export type ParsedOnboardingInput = {
  profile: {
    fullName: string;
    businessName: string;
    city: string;
    businessType: BusinessType;
    stage: BusinessStage;
    consentAccepted: true;
  };
  offer: {
    title: string;
    description: string;
    tags: string[];
    contributionTemplateId?: string | null;
    contributionCategory?: ContributionCategory | null;
    availabilityStatus: OfferAvailabilityStatus;
    capacityTotal?: number | null;
    capacityUnit?: CapacityUnit | null;
    availableFrom?: string | null;
    availableUntil?: string | null;
    restrictions?: string | null;
  };
  need: {
    title: string;
    description: string;
    tags: string[];
  };
  evidenceLinks: string[];
};

export type AdminExportData = {
  profiles: AdminProfile[];
  offers: OfferRecord[];
  needs: NeedRecord[];
  evidenceItems: EvidenceItemRecord[];
  matches: MatchRecord[];
  introRequests: IntroRequestRecord[];
};

export type DashboardData = {
  profile: AdminProfile;
  offers: OfferRecord[];
  needs: NeedRecord[];
  evidenceItems: EvidenceItemRecord[];
  matches: MatchRecord[];
  introRequests: IntroRequestRecord[];
  profileLookup: Record<string, Pick<AdminProfile, "id" | "businessName" | "city" | "businessType" | "status">>;
};

export type AdminData = AdminExportData & {
  candidateMatches: MatchCandidate[];
  matchWorkbench: MatchWorkbench;
  creditLedger: InternalCreditLedger;
  verificationReviews: OfferVerificationReview[];
  profileLookup: DashboardData["profileLookup"];
};

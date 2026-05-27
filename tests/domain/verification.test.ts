import { describe, expect, test } from "vitest";

import { buildOfferVerificationReview } from "../../lib/verification";
import type { AdminProfile, EvidenceItemRecord, OfferRecord } from "../../lib/types";

const activeProfile: AdminProfile = {
  id: "profile-active",
  email: "active@example.com",
  fullName: "Alba",
  businessName: "Pan Obrador",
  city: "Madrid",
  businessType: "local",
  stage: "running",
  status: "active",
  role: "member",
  trustScore: 70,
  createdAt: "2026-05-01T00:00:00.000Z",
};

const offer: OfferRecord = {
  id: "offer-space",
  profileId: "profile-active",
  title: "Espacio para pop-up entre semana",
  description: "Local con tardes tranquilas, aforo pequeno y fotos del espacio.",
  tags: ["pop-up", "madrid", "alimentacion"],
  status: "pending",
  createdAt: "2026-05-02T00:00:00.000Z",
};

const verifiedEvidence: EvidenceItemRecord = {
  id: "evidence-web",
  profileId: "profile-active",
  offerId: "offer-space",
  label: "Google Business y fotos",
  kind: "link",
  url: "https://example.com/pan",
  status: "verified",
  adminNotes: "Visto por fundador.",
  createdAt: "2026-05-03T00:00:00.000Z",
};

describe("buildOfferVerificationReview", () => {
  test("marks a concrete active offer with verified evidence as ready for manual verification", () => {
    const review = buildOfferVerificationReview({
      offer,
      profile: activeProfile,
      evidenceItems: [verifiedEvidence],
    });

    expect(review).toMatchObject({
      offerId: "offer-space",
      profileId: "profile-active",
      riskLevel: "low",
      recommendedAction: "can_verify",
    });
    expect(review.score).toBeGreaterThanOrEqual(80);
    expect(review.missingEvidence).toEqual([]);
    expect(review.autoChecks).toContainEqual({
      label: "Hay evidencia verificada",
      status: "pass",
    });
  });

  test("requests evidence for unverifiable offers and never trusts the claim by default", () => {
    const review = buildOfferVerificationReview({
      offer: { ...offer, id: "offer-vague", title: "Visibilidad para marcas", description: "", tags: ["visibilidad"] },
      profile: activeProfile,
      evidenceItems: [],
    });

    expect(review.recommendedAction).toBe("request_evidence");
    expect(review.riskLevel).toBe("high");
    expect(review.score).toBeLessThan(50);
    expect(review.missingEvidence).toContain("Una prueba verificable de que la oferta existe");
    expect(review.adminSummary).toContain("no debe verificarse automaticamente");
  });

  test("flags rejected evidence as a blocking verification risk", () => {
    const review = buildOfferVerificationReview({
      offer,
      profile: activeProfile,
      evidenceItems: [{ ...verifiedEvidence, id: "evidence-bad", status: "rejected" }],
    });

    expect(review.recommendedAction).toBe("reject_or_request_fix");
    expect(review.riskLevel).toBe("high");
    expect(review.blockingReasons).toContain("Hay evidencia rechazada asociada a la oferta");
  });
});

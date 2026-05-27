import { describe, expect, test } from "vitest";

import { generateCandidateMatches } from "../../lib/matching";
import type { EvidenceItemRecord, MatchCandidateInput, OfferRecord } from "../../lib/types";

const baseInput: MatchCandidateInput = {
  profiles: [
    {
      id: "offerer",
      businessName: "Pan Obrador",
      city: "Madrid",
      businessType: "local",
      status: "active",
    },
    {
      id: "needer",
      businessName: "Luz Producto",
      city: "Madrid",
      businessType: "service",
      status: "active",
    },
  ],
  offers: [
    {
      id: "offer-space",
      profileId: "offerer",
      title: "Espacio para pop-up este mes",
      description: "Local disponible para una prueba pequena y concreta.",
      tags: ["pop-up", "madrid", "alimentacion"],
      status: "verified",
    },
  ],
  needs: [
    {
      id: "need-space",
      profileId: "needer",
      title: "Necesito espacio urgente para caso visible",
      description: "Busco sitio en Madrid este mes para crear un caso real.",
      tags: ["pop-up", "madrid", "contenido"],
    },
  ],
};

const verifiedEvidence: EvidenceItemRecord = {
  id: "evidence-space",
  profileId: "offerer",
  offerId: "offer-space",
  label: "Fotos del local",
  kind: "link",
  url: "https://example.com/local",
  status: "verified",
  createdAt: "2026-05-03T00:00:00.000Z",
};

describe("generateCandidateMatches automation", () => {
  test("adds operational scores and a fast-review action for ready matches", () => {
    const [candidate] = generateCandidateMatches({
      ...baseInput,
      evidenceItems: [verifiedEvidence],
    });

    expect(candidate.status).toBe("suggested");
    expect(candidate.automation).toMatchObject({
      riskLevel: "low",
      nextAction: "approve_candidate",
    });
    expect(candidate.automation.fitScore).toBeGreaterThanOrEqual(70);
    expect(candidate.automation.trustScore).toBeGreaterThanOrEqual(70);
    expect(candidate.automation.urgencyScore).toBeGreaterThan(0);
    expect(candidate.scoreBreakdown).toMatchObject({
      tagOverlap: 60,
      sameCity: 15,
      verifiedOffer: 20,
      complementaryTypes: 10,
    });
  });

  test("keeps unverified offers blocked and tells admin to request evidence", () => {
    const unverifiedOffer: OfferRecord = { ...baseInput.offers[0], status: "pending" };
    const [candidate] = generateCandidateMatches({
      ...baseInput,
      offers: [unverifiedOffer],
      evidenceItems: [],
    });

    expect(candidate.status).toBe("needs_evidence");
    expect(candidate.automation.nextAction).toBe("request_evidence");
    expect(candidate.automation.riskLevel).toBe("high");
    expect(candidate.blockingReasons).toContain(
      "La evidencia de la oferta debe verificarse antes de una presentación",
    );
  });
});

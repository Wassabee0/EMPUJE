import { describe, expect, test } from "vitest";

import { generateCandidateMatches } from "../../lib/matching";
import type { MatchCandidateInput } from "../../lib/types";

const input: MatchCandidateInput = {
  profiles: [
    {
      id: "space-owner",
      businessName: "Patio Norte",
      city: "Madrid",
      businessType: "local",
      status: "active",
    },
    {
      id: "brand",
      businessName: "Lua Cosmetica",
      city: "Madrid",
      businessType: "brand",
      status: "active",
    },
    {
      id: "mentor",
      businessName: "Cuenta Clara",
      city: "Valencia",
      businessType: "service",
      status: "active",
    },
  ],
  offers: [
    {
      id: "space-offer",
      profileId: "space-owner",
      title: "Escaparate y sala para pop-ups",
      tags: ["espacio", "eventos"],
      status: "verified",
    },
    {
      id: "mentor-offer",
      profileId: "mentor",
      title: "Revision financiera para tiendas nuevas",
      tags: ["finanzas", "pricing"],
      status: "pending",
    },
  ],
  needs: [
    {
      id: "brand-need",
      profileId: "brand",
      title: "Necesito un espacio para validar producto",
      tags: ["eventos", "espacio"],
    },
    {
      id: "space-need",
      profileId: "space-owner",
      title: "Necesito pricing y margen",
      tags: ["pricing"],
    },
  ],
};

describe("generateCandidateMatches", () => {
  test("scores complementary verified offers above weaker candidates", () => {
    const candidates = generateCandidateMatches(input);

    expect(candidates[0]).toMatchObject({
      offerId: "space-offer",
      needId: "brand-need",
      offererProfileId: "space-owner",
      neederProfileId: "brand",
      status: "suggested",
      blockingReasons: [],
    });
    expect(candidates[0].score).toBe(100);
    expect(candidates[0].scoreBreakdown).toMatchObject({
      tagOverlap: 60,
      sameCity: 15,
      verifiedOffer: 20,
      complementaryTypes: 10,
    });
  });

  test("keeps unverified offers visible to admin but blocks approval", () => {
    const candidate = generateCandidateMatches(input).find(
      (match) => match.offerId === "mentor-offer" && match.needId === "space-need",
    );

    expect(candidate).toBeDefined();
    expect(candidate).toMatchObject({
      status: "needs_evidence",
      blockingReasons: ["La evidencia de la oferta debe verificarse antes de una presentación"],
    });
    expect(candidate?.scoreBreakdown.verifiedOffer).toBe(0);
  });

  test("never matches a profile with its own offer", () => {
    const candidates = generateCandidateMatches(input);

    expect(candidates).not.toContainEqual(
      expect.objectContaining({
        offererProfileId: "space-owner",
        neederProfileId: "space-owner",
      }),
    );
  });

  test("skips offers that are exhausted, paused, or already reserved", () => {
    const candidates = generateCandidateMatches({
      ...input,
      offers: [
        { ...input.offers[0], id: "exhausted", availabilityStatus: "exhausted", capacityTotal: 2, capacityUsed: 2 },
        { ...input.offers[0], id: "paused", availabilityStatus: "paused" },
        { ...input.offers[0], id: "reserved", availabilityStatus: "reserved" },
      ],
    });

    expect(candidates).toEqual([]);
  });

  test("keeps partial offers matchable while exposing remaining capacity to admin", () => {
    const [candidate] = generateCandidateMatches({
      ...input,
      offers: [
        {
          ...input.offers[0],
          availabilityStatus: "partial",
          capacityTotal: 3,
          capacityUsed: 2,
          capacityUnit: "slots_per_month",
        },
      ],
    });

    expect(candidate.status).toBe("suggested");
    expect(candidate.automation.remainingCapacity).toBe(1);
    expect(candidate.automation.capacityLabel).toBe("1 de 3 slots/mes disponibles");
  });
});

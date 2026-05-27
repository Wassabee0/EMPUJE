import { describe, expect, test } from "vitest";

import { generateCandidateMatches } from "../../lib/matching";
import { buildMatchWorkbench } from "../../lib/match-workbench";
import type { MatchCandidateInput, MatchRecord } from "../../lib/types";

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

const existingMatch: MatchRecord = {
  id: "existing",
  status: "approved",
  score: 100,
  offererProfileId: "space-owner",
  neederProfileId: "brand",
  offerId: "space-offer",
  needId: "brand-need",
  blockingReasons: [],
  createdAt: "2026-05-26T00:00:00.000Z",
};

describe("buildMatchWorkbench", () => {
  test("hides already saved pairs and exposes blockers for fast admin triage", () => {
    const candidates = generateCandidateMatches(input);
    const workbench = buildMatchWorkbench({
      candidates,
      profiles: input.profiles,
      existingMatches: [existingMatch],
    });

    expect(workbench.totalCandidates).toBe(2);
    expect(workbench.existingPairsSkipped).toBe(1);
    expect(workbench.reviewQueue).toHaveLength(1);
    expect(workbench.reviewQueue[0]).toMatchObject({
      offerId: "mentor-offer",
      needId: "space-need",
      status: "needs_evidence",
    });
    expect(workbench.readyNow).toHaveLength(0);
    expect(workbench.needsEvidence).toHaveLength(1);
    expect(workbench.topBlockers[0]).toMatchObject({
      reason: "La evidencia de la oferta debe verificarse antes de una presentación",
      count: 1,
    });
  });

  test("prioritizes ready same-city matches before blocked candidates", () => {
    const candidates = generateCandidateMatches(input);
    const workbench = buildMatchWorkbench({
      candidates,
      profiles: input.profiles,
      existingMatches: [],
    });

    expect(workbench.reviewQueue[0]).toMatchObject({
      offerId: "space-offer",
      needId: "brand-need",
      status: "suggested",
    });
    expect(workbench.readyNow).toHaveLength(1);
    expect(workbench.highSignalSameCity).toHaveLength(1);
    expect(workbench.cityBuckets[0]).toMatchObject({
      label: "Madrid ↔ Madrid",
      count: 1,
    });
  });
});

import { describe, expect, test } from "vitest";

import { buildInternalCreditLedger } from "../../lib/credit-ledger";
import type { AdminProfile, IntroRequestRecord } from "../../lib/types";

const profiles: AdminProfile[] = [
  {
    id: "active",
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
  },
  {
    id: "needs-evidence",
    email: "evidence@example.com",
    fullName: "Bruno",
    businessName: "Fotos Norte",
    city: "Madrid",
    businessType: "service",
    stage: "first_sales",
    status: "needs_evidence",
    role: "member",
    trustScore: 35,
    createdAt: "2026-05-01T00:00:00.000Z",
  },
];

const introRequests: IntroRequestRecord[] = [
  {
    id: "intro-1",
    matchId: "match-1",
    requestedBy: "active",
    message: "Tiene sentido.",
    status: "requested",
    createdAt: "2026-05-12T00:00:00.000Z",
  },
  {
    id: "intro-old",
    matchId: "match-old",
    requestedBy: "active",
    message: "Mes anterior.",
    status: "requested",
    createdAt: "2026-04-12T00:00:00.000Z",
  },
];

describe("buildInternalCreditLedger", () => {
  test("tracks internal monthly intro credits without exposing paid membership", () => {
    const ledger = buildInternalCreditLedger({
      profiles,
      introRequests,
      now: new Date("2026-05-26T12:00:00.000Z"),
    });

    expect(ledger.summary).toMatchObject({
      monthlyCreditsIssued: 1,
      usedThisMonth: 1,
      availableThisMonth: 0,
      blockedAccounts: 1,
    });
    expect(ledger.accounts[0]).toMatchObject({
      profileId: "active",
      planLabel: "Beta gratuita: matching activo interno",
      monthlyGrant: 1,
      usedThisMonth: 1,
      availableThisMonth: 0,
      rolloverCap: 2,
      status: "Disponible cuando haya créditos",
    });
    expect(ledger.accounts[1]).toMatchObject({
      profileId: "needs-evidence",
      monthlyGrant: 0,
      availableThisMonth: 0,
      status: "Bloqueado hasta revisar evidencia",
    });
  });
});

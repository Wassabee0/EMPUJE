import type { AdminProfile, InternalCreditAccount, InternalCreditLedger, IntroRequestRecord } from "@/lib/types";

type BuildInternalCreditLedgerInput = {
  profiles: AdminProfile[];
  introRequests: IntroRequestRecord[];
  now?: Date;
};

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function isInMonth(value: string, targetMonth: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return monthKey(date) === targetMonth;
}

function creditPolicyFor(profile: AdminProfile) {
  if (profile.status === "active") {
    return {
      planLabel: "Beta gratuita: matching activo interno",
      monthlyGrant: 1,
      rolloverCap: 2,
      status: "Disponible para intro revisada",
      note: "No se cobra en beta. Este crédito solo ayuda al admin a medir capacidad y valor mensual.",
    };
  }

  if (profile.status === "needs_evidence") {
    return {
      planLabel: "Beta gratuita: bloqueado por evidencia",
      monthlyGrant: 0,
      rolloverCap: 0,
      status: "Bloqueado hasta revisar evidencia",
      note: "No debería recibir intros nuevas hasta que una afirmación clave tenga evidencia suficiente.",
    };
  }

  if (profile.status === "rejected") {
    return {
      planLabel: "Beta gratuita: rechazado",
      monthlyGrant: 0,
      rolloverCap: 0,
      status: "Sin acceso",
      note: "Perfil fuera de la beta actual.",
    };
  }

  return {
    planLabel: "Beta gratuita: pendiente de revisión",
    monthlyGrant: 0,
    rolloverCap: 0,
    status: "Pendiente de revisión",
    note: "Primero hay que revisar perfil, oferta, necesidad y consentimiento.",
  };
}

export function buildInternalCreditLedger({
  profiles,
  introRequests,
  now = new Date(),
}: BuildInternalCreditLedgerInput): InternalCreditLedger {
  const targetMonth = monthKey(now);

  const accounts: InternalCreditAccount[] = profiles.map((profile) => {
    const policy = creditPolicyFor(profile);
    const monthlyIntros = introRequests
      .filter((intro) => intro.requestedBy === profile.id && isInMonth(intro.createdAt, targetMonth))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const usedThisMonth = monthlyIntros.length;
    const availableThisMonth = Math.max(0, policy.monthlyGrant - usedThisMonth);

    return {
      profileId: profile.id,
      businessName: profile.businessName,
      city: profile.city,
      profileStatus: profile.status,
      planLabel: policy.planLabel,
      monthlyGrant: policy.monthlyGrant,
      rolloverCap: policy.rolloverCap,
      usedThisMonth,
      availableThisMonth,
      status:
        profile.status === "active" && availableThisMonth === 0
          ? "Disponible cuando haya créditos"
          : policy.status,
      note: policy.note,
      lastIntroAt: monthlyIntros[0]?.createdAt,
    };
  });

  return {
    month: targetMonth,
    summary: {
      monthlyCreditsIssued: accounts.reduce((total, account) => total + account.monthlyGrant, 0),
      usedThisMonth: accounts.reduce((total, account) => total + account.usedThisMonth, 0),
      availableThisMonth: accounts.reduce((total, account) => total + account.availableThisMonth, 0),
      blockedAccounts: accounts.filter((account) => account.monthlyGrant === 0).length,
    },
    accounts,
  };
}

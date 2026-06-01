export const ONBOARDING_QUOTAS = {
  offers: 1,
  needs: 1,
  evidenceLinks: 8,
  evidenceFiles: 5,
  uploadedBytes: 20 * 1024 * 1024,
} as const;

export type ExistingOnboardingUsage = {
  offerIds: string[];
  needIds: string[];
  evidenceLinks: string[];
  evidenceFileCount: number;
  uploadedBytes: number;
  fileHashes: string[];
};

export type IncomingOnboardingFile = {
  size: number;
  hash?: string | null;
};

type OnboardingPlan<TFile extends IncomingOnboardingFile> =
  | {
      ok: true;
      primaryOfferId: string | null;
      primaryNeedId: string | null;
      evidenceLinksToInsert: string[];
      filesToInsert: TFile[];
    }
  | {
      ok: false;
      error: string;
    };

function bytesToMiB(value: number) {
  return Math.round(value / 1024 / 1024);
}

export function normalizeEvidenceUrl(value: string) {
  const raw = value.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
    return `${url.protocol}//${url.host.toLowerCase()}${pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function normalizeUniqueEvidenceLinks(values: string[]) {
  const links: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = normalizeEvidenceUrl(value);
    if (!normalized) {
      invalid.push(value);
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    links.push(normalized);
  }

  return { links, invalid };
}

export function planOnboardingWrite<TFile extends IncomingOnboardingFile>(
  existing: ExistingOnboardingUsage,
  incoming: {
    evidenceLinks: string[];
    files: TFile[];
  },
): OnboardingPlan<TFile> {
  if (existing.offerIds.length > ONBOARDING_QUOTAS.offers) {
    return {
      ok: false,
      error: "Tu cuenta ya supera el limite de ofertas de onboarding. Escribe a Empuje para revisarlo.",
    };
  }
  if (existing.needIds.length > ONBOARDING_QUOTAS.needs) {
    return {
      ok: false,
      error: "Tu cuenta ya supera el limite de necesidades de onboarding. Escribe a Empuje para revisarlo.",
    };
  }

  const existingLinkSet = new Set(
    normalizeUniqueEvidenceLinks(existing.evidenceLinks).links,
  );
  const normalizedIncomingLinks = normalizeUniqueEvidenceLinks(incoming.evidenceLinks);
  if (normalizedIncomingLinks.invalid.length) {
    return {
      ok: false,
      error: "Los enlaces de evidencia deben usar http o https.",
    };
  }

  const evidenceLinksToInsert = normalizedIncomingLinks.links.filter(
    (link) => !existingLinkSet.has(link),
  );
  if (existingLinkSet.size + evidenceLinksToInsert.length > ONBOARDING_QUOTAS.evidenceLinks) {
    return {
      ok: false,
      error: `Tu cuenta puede guardar hasta ${ONBOARDING_QUOTAS.evidenceLinks} enlaces de evidencia.`,
    };
  }

  const existingHashes = new Set(existing.fileHashes.filter(Boolean));
  const seenIncomingHashes = new Set<string>();
  const filesToInsert = incoming.files.filter((file) => {
    if (file.size <= 0) return false;
    if (!file.hash) return true;
    if (existingHashes.has(file.hash) || seenIncomingHashes.has(file.hash)) return false;
    seenIncomingHashes.add(file.hash);
    return true;
  });

  if (existing.evidenceFileCount + filesToInsert.length > ONBOARDING_QUOTAS.evidenceFiles) {
    return {
      ok: false,
      error: `Tu cuenta puede guardar hasta ${ONBOARDING_QUOTAS.evidenceFiles} archivos de evidencia.`,
    };
  }

  const incomingBytes = filesToInsert.reduce((total, file) => total + file.size, 0);
  if (existing.uploadedBytes + incomingBytes > ONBOARDING_QUOTAS.uploadedBytes) {
    return {
      ok: false,
      error: `Tu cuenta puede guardar hasta ${bytesToMiB(ONBOARDING_QUOTAS.uploadedBytes)} MB de archivos de evidencia.`,
    };
  }

  return {
    ok: true,
    primaryOfferId: existing.offerIds[0] ?? null,
    primaryNeedId: existing.needIds[0] ?? null,
    evidenceLinksToInsert,
    filesToInsert,
  };
}

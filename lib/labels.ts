import type {
  BusinessStage,
  BusinessType,
  EvidenceItemRecord,
  EvidenceStatus,
  IntroRequestStatus,
  MatchStatus,
  OfferAvailabilityStatus,
  OfferStatus,
  ProfileStatus,
} from "@/lib/types";

export const statusLabels = {
  pending_review: "Pendiente de revisión",
  active: "Activo",
  needs_evidence: "Falta evidencia",
  rejected: "Rechazado",
  unverified: "Sin verificar",
  pending: "Pendiente",
  verified: "Verificado",
  suggested: "Sugerido",
  approved: "Aprobado",
  introduced: "Presentado",
  completed: "Completado",
  requested: "Solicitado",
  needs_more: "Falta más",
  partial: "Parcial",
  reserved: "Reservada",
  in_agreement: "En acuerdo",
  exhausted: "Agotada",
  cooldown: "En cooldown",
  paused: "Pausada",
  archived: "Archivada",
  suspended: "Suspendida",
} satisfies Record<
  ProfileStatus | OfferStatus | OfferAvailabilityStatus | MatchStatus | EvidenceStatus | IntroRequestStatus,
  string
>;

export const businessTypeLabels = {
  local: "Local físico",
  brand: "Marca o producto",
  service: "Autónomo/a o servicio",
  community: "Comunidad o medio",
  other: "Otro",
} satisfies Record<BusinessType, string>;

export const stageLabels = {
  idea: "Idea",
  first_sales: "Primeras ventas",
  running: "Funcionando",
  growing: "Creciendo",
} satisfies Record<BusinessStage, string>;

export const evidenceKindLabels = {
  link: "Enlace",
  file: "Archivo",
  note: "Nota",
} satisfies Record<EvidenceItemRecord["kind"], string>;

export function labelForStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status.replaceAll("_", " ");
}

import type { CapacityUnit, OfferAvailabilityStatus, OfferRecord } from "./types";

export const offerAvailabilityLabels = {
  active: "Activa",
  partial: "Parcial",
  reserved: "Reservada",
  in_agreement: "En acuerdo",
  exhausted: "Agotada",
  cooldown: "En cooldown",
  paused: "Pausada",
  archived: "Archivada",
  suspended: "Suspendida",
} satisfies Record<OfferAvailabilityStatus, string>;

export const capacityUnitLabels = {
  slots_per_month: "slots/mes",
  hours_per_month: "horas/mes",
  units: "unidades",
  projects_per_month: "proyectos/mes",
  introductions: "introducciones",
  spots: "huecos",
  other: "unidades",
} satisfies Record<CapacityUnit, string>;

const matchableAvailability = new Set<OfferAvailabilityStatus>(["active", "partial"]);

function asAvailability(status: OfferRecord["availabilityStatus"]): OfferAvailabilityStatus {
  return status ?? "active";
}

function asCapacity(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : null;
}

function isAfter(date: string | null | undefined, now: Date) {
  return Boolean(date && new Date(date).getTime() > now.getTime());
}

function isBefore(date: string | null | undefined, now: Date) {
  return Boolean(date && new Date(date).getTime() < now.getTime());
}

export function getRemainingCapacity(offer: Pick<OfferRecord, "capacityTotal" | "capacityUsed">) {
  const total = asCapacity(offer.capacityTotal);
  if (total === null) return null;
  const used = asCapacity(offer.capacityUsed) ?? 0;
  return Math.max(0, total - used);
}

export function formatCapacityLabel(
  offer: Pick<OfferRecord, "capacityTotal" | "capacityUsed" | "capacityUnit">,
) {
  const total = asCapacity(offer.capacityTotal);
  if (total === null) return "Capacidad por declarar";
  const remaining = getRemainingCapacity(offer) ?? total;
  const unit = capacityUnitLabels[offer.capacityUnit ?? "other"];
  return `${remaining} de ${total} ${unit} disponibles`;
}

export function availabilityBlocksMatch(offer: OfferRecord, now = new Date()) {
  const status = asAvailability(offer.availabilityStatus);
  const blocks: string[] = [];
  if (!matchableAvailability.has(status)) {
    blocks.push(`La oferta esta ${offerAvailabilityLabels[status].toLowerCase()}`);
  }
  if (getRemainingCapacity(offer) === 0) {
    blocks.push("La oferta no tiene capacidad disponible");
  }
  if (isAfter(offer.availableFrom, now)) {
    blocks.push("La oferta aun no esta disponible");
  }
  if (isBefore(offer.availableUntil, now)) {
    blocks.push("La disponibilidad de la oferta ha caducado");
  }
  return blocks;
}

export function canGenerateCandidateForOffer(offer: OfferRecord, now = new Date()) {
  if (offer.status === "rejected") return false;
  return availabilityBlocksMatch(offer, now).length === 0;
}

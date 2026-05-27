import { buildInternalCreditLedger } from "@/lib/credit-ledger";
import { generateCandidateMatches } from "@/lib/matching";
import { buildMatchWorkbench } from "@/lib/match-workbench";
import { buildVerificationReviews } from "@/lib/verification";
import type {
  AdminData,
  AdminProfile,
  EvidenceItemRecord,
  IntroRequestRecord,
  MatchRecord,
  NeedRecord,
  OfferRecord,
} from "@/lib/types";

const now = "2026-05-26T12:00:00.000Z";

const profiles: AdminProfile[] = [
  {
    id: "dev-pan",
    email: "alba@example.local",
    fullName: "Alba Martin",
    businessName: "Pan Obrador Lavapies",
    city: "Madrid",
    businessType: "local",
    stage: "running",
    status: "active",
    role: "member",
    trustScore: 75,
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "dev-foto",
    email: "bruno@example.local",
    fullName: "Bruno Ruiz",
    businessName: "Luz Producto",
    city: "Madrid",
    businessType: "service",
    stage: "first_sales",
    status: "active",
    role: "member",
    trustScore: 68,
    createdAt: "2026-05-03T10:00:00.000Z",
  },
  {
    id: "dev-cosmetica",
    email: "clara@example.local",
    fullName: "Clara Serra",
    businessName: "Arcilla Botanica",
    city: "Valencia",
    businessType: "brand",
    stage: "first_sales",
    status: "needs_evidence",
    role: "member",
    trustScore: 35,
    createdAt: "2026-05-04T10:00:00.000Z",
  },
  {
    id: "dev-newsletter",
    email: "diego@example.local",
    fullName: "Diego Soler",
    businessName: "Barrio Vivo",
    city: "Valencia",
    businessType: "community",
    stage: "running",
    status: "pending_review",
    role: "member",
    trustScore: 25,
    createdAt: "2026-05-05T10:00:00.000Z",
  },
];

const offers: OfferRecord[] = [
  {
    id: "offer-pan-popup",
    profileId: "dev-pan",
    title: "Tardes tranquilas para pop-up o cata",
    description: "Espacio pequeno con clientela de barrio y huecos entre semana.",
    tags: ["pop-up", "madrid", "alimentacion"],
    status: "verified",
    contributionTemplateId: "space_quiet_hours",
    contributionCategory: "physical_space_assets",
    availabilityStatus: "partial",
    capacityTotal: 3,
    capacityUsed: 1,
    capacityUnit: "slots_per_month",
    availableUntil: "2026-06-30",
    restrictions: "Solo tardes de martes a jueves, aforo pequeno.",
    createdAt: now,
    adminNotes: "Fotos del local revisadas y web activa.",
  },
  {
    id: "offer-foto-producto",
    profileId: "dev-foto",
    title: "Foto de producto para marcas pequenas",
    description: "Pack sencillo para validar catalogo, redes o primera ficha comercial.",
    tags: ["foto", "contenido", "producto"],
    status: "verified",
    contributionTemplateId: "professional_service_pack",
    contributionCategory: "professional_services",
    availabilityStatus: "active",
    capacityTotal: 2,
    capacityUsed: 0,
    capacityUnit: "projects_per_month",
    availableUntil: "2026-06-30",
    restrictions: "Solo pack basico de 8 fotos, sin video.",
    createdAt: now,
    adminNotes: "Portfolio y facturas anonimizadas revisadas.",
  },
  {
    id: "offer-cosmetica-muestras",
    profileId: "dev-cosmetica",
    title: "Muestras de cosmetica natural para acciones locales",
    description: "Quiere probar conversion en tiendas y pequenos eventos.",
    tags: ["cosmetica", "muestras", "valencia"],
    status: "pending",
    contributionTemplateId: "product_stock_samples",
    contributionCategory: "product_stock",
    availabilityStatus: "active",
    capacityTotal: 40,
    capacityUsed: 0,
    capacityUnit: "units",
    availableUntil: "2026-07-15",
    restrictions: "Falta confirmar lote, etiquetado y condiciones de entrega.",
    createdAt: now,
    adminNotes: "Falta evidencia de stock y etiquetado.",
  },
  {
    id: "offer-newsletter-difusion",
    profileId: "dev-newsletter",
    title: "Difusion en newsletter local",
    description: "Audiencia pequena, muy local, pendiente de revisar metricas.",
    tags: ["difusion", "valencia", "comunidad"],
    status: "unverified",
    contributionTemplateId: "audience_local_channel",
    contributionCategory: "audience_channels",
    availabilityStatus: "paused",
    capacityTotal: 2,
    capacityUsed: 0,
    capacityUnit: "spots",
    restrictions: "Pausada hasta revisar metricas reales de newsletter.",
    createdAt: now,
  },
];

const needs: NeedRecord[] = [
  {
    id: "need-pan-foto",
    profileId: "dev-pan",
    title: "Fotos limpias para nuevos desayunos",
    description: "Necesita contenido real sin una produccion cara.",
    tags: ["foto", "contenido", "producto"],
    createdAt: now,
  },
  {
    id: "need-foto-espacio",
    profileId: "dev-foto",
    title: "Espacio fisico para caso visible",
    description: "Busca un primer caso local con escaparate y testimonio.",
    tags: ["pop-up", "madrid", "alimentacion"],
    createdAt: now,
  },
  {
    id: "need-cosmetica-difusion",
    profileId: "dev-cosmetica",
    title: "Difusion local antes de comprar anuncios",
    description: "Necesita validar respuesta en Valencia con bajo riesgo.",
    tags: ["difusion", "valencia", "comunidad"],
    createdAt: now,
  },
  {
    id: "need-newsletter-muestras",
    profileId: "dev-newsletter",
    title: "Muestras o experiencias para contenido local",
    description: "Busca marcas pequenas con algo comprobable que contar.",
    tags: ["cosmetica", "muestras", "valencia"],
    createdAt: now,
  },
];

const evidenceItems: EvidenceItemRecord[] = [
  {
    id: "ev-pan-web",
    profileId: "dev-pan",
    offerId: "offer-pan-popup",
    label: "Web y fotos del local",
    kind: "link",
    url: "https://example.local/pan-obrdor",
    status: "verified",
    adminNotes: "Solo ejemplo local temporal.",
    createdAt: now,
  },
  {
    id: "ev-foto-portfolio",
    profileId: "dev-foto",
    offerId: "offer-foto-producto",
    label: "Portfolio",
    kind: "link",
    url: "https://example.local/luz-producto",
    status: "verified",
    adminNotes: "Solo ejemplo local temporal.",
    createdAt: now,
  },
  {
    id: "ev-cosmetica-stock",
    profileId: "dev-cosmetica",
    offerId: "offer-cosmetica-muestras",
    label: "Stock disponible",
    kind: "note",
    status: "needs_more",
    adminNotes: "Pedir lote, fotos y etiquetado.",
    createdAt: now,
  },
];

const matches: MatchRecord[] = [
  {
    id: "match-dev-pan-foto",
    status: "approved",
    score: 95,
    offererProfileId: "dev-foto",
    neederProfileId: "dev-pan",
    offerId: "offer-foto-producto",
    needId: "need-pan-foto",
    blockingReasons: [],
    adminNotes: "Buen primer caso: oferta verificada y necesidad concreta.",
    createdAt: "2026-05-15T09:00:00.000Z",
  },
];

const introRequests: IntroRequestRecord[] = [
  {
    id: "intro-dev-pan",
    matchId: "match-dev-pan-foto",
    requestedBy: "dev-pan",
    message: "Quiero hablar con Bruno para preparar fotos del nuevo brunch.",
    status: "requested",
    createdAt: "2026-05-20T09:00:00.000Z",
  },
];

function buildProfileLookup() {
  return Object.fromEntries(
    profiles.map((profile) => [
      profile.id,
      {
        id: profile.id,
        businessName: profile.businessName,
        city: profile.city,
        businessType: profile.businessType,
        status: profile.status,
      },
    ]),
  );
}

export function getDevAdminData(): AdminData {
  const matchProfiles = profiles.map((profile) => ({
    id: profile.id,
    businessName: profile.businessName,
    city: profile.city,
    businessType: profile.businessType,
    status: profile.status,
  }));
  const candidateMatches = generateCandidateMatches({
    profiles: matchProfiles,
    offers,
    needs,
    evidenceItems,
  });
  const matchWorkbench = buildMatchWorkbench({
    candidates: candidateMatches,
    profiles: matchProfiles,
    existingMatches: matches,
  });
  const verificationReviews = buildVerificationReviews({
    offers,
    profiles,
    evidenceItems,
  });

  return {
    profiles,
    offers,
    needs,
    evidenceItems,
    matches,
    introRequests,
    profileLookup: buildProfileLookup(),
    candidateMatches: matchWorkbench.reviewQueue,
    matchWorkbench,
    verificationReviews,
    creditLedger: buildInternalCreditLedger({
      profiles,
      introRequests,
      now: new Date("2026-05-26T12:00:00.000Z"),
    }),
  };
}

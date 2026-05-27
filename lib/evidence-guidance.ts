import type { BusinessType } from "@/lib/types";
import { getContributionTemplate, type ContributionTemplate } from "./contribution-templates";

export type EvidenceGuidanceInput = {
  businessType: BusinessType;
  contributionTemplateId?: string | null;
  offerTitle?: string;
  offerDescription?: string;
  offerTags?: string | string[];
};

export type EvidenceGuidance = {
  readiness: "ready_to_prepare" | "needs_detail";
  requiredEvidence: string[];
  specificEvidence: string[];
  warnings: string[];
  summary: string;
  capacityPrompt: string;
  template?: Pick<ContributionTemplate, "id" | "label" | "category" | "riskFlags"> | null;
};

const baseEvidenceByType = {
  local: [
    "Fotos actuales del espacio o escaparate",
    "Google Business, web, Instagram o prueba pública del local",
    "Dirección aproximada y disponibilidad real",
  ],
  brand: [
    "Fotos de producto, stock o muestras disponibles",
    "Web, tienda, Instagram o catálogo público",
    "Prueba de que puedes entregar lo que ofreces",
  ],
  service: [
    "Portfolio, web profesional o ejemplos de trabajos anteriores",
    "Referencia publica, testimonio o perfil profesional",
    "Alcance exacto del servicio y limites de entrega",
  ],
  community: [
    "Capturas recientes de alcance, aperturas, visitas o audiencia real",
    "Canal público, newsletter, comunidad o medio verificable",
    "Ejemplo de colaboración o publicación anterior",
  ],
  other: [
    "Enlace publico que demuestre que el proyecto existe",
    "Fotos, documentos o ejemplos recientes",
    "Limites claros de lo que puedes ofrecer",
  ],
} satisfies Record<BusinessType, string[]>;

const tagEvidenceRules: Array<{ tags: string[]; evidence: string }> = [
  {
    tags: ["espacio", "pop-up", "local", "escaparate", "evento", "eventos"],
    evidence: "Condiciones del espacio: días, aforo, límites y ubicación",
  },
  {
    tags: ["audiencia", "difusion", "newsletter", "visibilidad", "comunidad"],
    evidence: "Capturas recientes de alcance, aperturas, visitas o audiencia real",
  },
  {
    tags: ["foto", "fotografia", "contenido", "branding", "diseno"],
    evidence: "Portfolio o ejemplos antes/despues de trabajos parecidos",
  },
  {
    tags: ["producto", "stock", "muestras", "cosmetica", "alimentacion"],
    evidence: "Fotos de stock, lote disponible, etiquetado o ficha de producto",
  },
  {
    tags: ["legal", "contratos", "finanzas", "asesoria"],
    evidence: "Credencial profesional, web, colegiación o experiencia demostrable",
  },
  {
    tags: ["logistica", "transporte", "reparto"],
    evidence: "Prueba de seguro, zona de reparto, capacidad y rutas disponibles",
  },
];

function normalizeTags(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(/[,;\n]+/);
  return raw
    .map((tag) =>
      tag
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function hasUsefulDetail(text: string) {
  return text.length >= 60 && /\b(dia|dias|mes|semana|aforo|limite|limites|zona|stock|portfolio|muestra|entrega|ubicacion|referencia|cliente|caso)\b/i.test(text);
}

export function buildEvidenceGuidance(input: EvidenceGuidanceInput): EvidenceGuidance {
  const template = getContributionTemplate(input.contributionTemplateId);
  const tags = normalizeTags(input.offerTags);
  const text = `${input.offerTitle ?? ""} ${input.offerDescription ?? ""}`.trim();
  const specificEvidence = unique(
    tagEvidenceRules
      .filter((rule) => rule.tags.some((tag) => tags.includes(tag)))
      .map((rule) => rule.evidence),
  );
  const warnings: string[] = [];

  if (!hasUsefulDetail(text)) {
    warnings.push("Explica límites, frecuencia, ubicación o capacidad antes de enviar");
  }
  if (tags.some((tag) => ["visibilidad", "audiencia", "difusion"].includes(tag))) {
    warnings.push("Evita prometer visibilidad sin métricas o ejemplos verificables");
  }

  const requiredEvidence = unique([
    ...baseEvidenceByType[input.businessType],
    ...(template?.requiredEvidence ?? []),
    ...(specificEvidence.length ? [] : ["Una prueba concreta de que la oferta existe y se puede cumplir"]),
  ]);

  return {
    readiness: warnings.length ? "needs_detail" : "ready_to_prepare",
    requiredEvidence,
    specificEvidence,
    warnings,
    summary:
      "Sube al menos un enlace o archivo. Empuje no verifica automáticamente: esta guía prepara la revisión humana.",
    capacityPrompt:
      template?.capacityPrompt ??
      "Define capacidad, frecuencia, limite mensual, disponibilidad y restricciones antes de enviar.",
    template: template
      ? {
          id: template.id,
          label: template.label,
          category: template.category,
          riskFlags: template.riskFlags,
        }
      : null,
  };
}

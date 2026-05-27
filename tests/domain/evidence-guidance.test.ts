import { describe, expect, test } from "vitest";

import { buildEvidenceGuidance } from "../../lib/evidence-guidance";

describe("buildEvidenceGuidance", () => {
  test("tells a local space owner exactly what evidence helps verify an offer", () => {
    const guidance = buildEvidenceGuidance({
      businessType: "local",
      offerTitle: "Espacio para pop-up de marcas pequenas",
      offerDescription: "Puedo ceder una zona del local dos tardes al mes con aforo limitado.",
      offerTags: "pop-up, espacio, madrid",
    });

    expect(guidance.requiredEvidence).toContain("Fotos actuales del espacio o escaparate");
    expect(guidance.specificEvidence).toContain("Condiciones del espacio: días, aforo, límites y ubicación");
    expect(guidance.readiness).toBe("ready_to_prepare");
    expect(guidance.warnings).toEqual([]);
  });

  test("warns when an offer depends on audience or visibility without proof", () => {
    const guidance = buildEvidenceGuidance({
      businessType: "community",
      offerTitle: "Visibilidad para marcas",
      offerDescription: "Tengo una comunidad.",
      offerTags: "visibilidad, audiencia",
    });

    expect(guidance.readiness).toBe("needs_detail");
    expect(guidance.specificEvidence).toContain("Capturas recientes de alcance, aperturas, visitas o audiencia real");
    expect(guidance.warnings).toContain("Evita prometer visibilidad sin métricas o ejemplos verificables");
    expect(guidance.warnings).toContain("Explica límites, frecuencia, ubicación o capacidad antes de enviar");
  });

  test("adds template-specific evidence and capacity guidance", () => {
    const guidance = buildEvidenceGuidance({
      businessType: "brand",
      contributionTemplateId: "product_stock_samples",
      offerTitle: "Muestras para acciones locales",
      offerDescription: "Puedo aportar 40 unidades este mes con lote, etiquetado y límites de entrega claros.",
      offerTags: "producto, muestras, stock",
    });

    expect(guidance.template?.label).toBe("Producto, stock o muestras");
    expect(guidance.requiredEvidence).toContain("Fotos de stock, lote disponible, etiquetado o ficha de producto");
    expect(guidance.capacityPrompt).toContain("unidades reales");
  });
});

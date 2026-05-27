import { describe, expect, test } from "vitest";

import { hasEvidenceSubmission, normalizeTags, parseOnboardingInput } from "../../lib/onboarding";

describe("onboarding validation", () => {
  test("normalizes tags from comma, semicolon, and newline separated text", () => {
    expect(normalizeTags(" Local, Instagram; local\nContenido ")).toEqual([
      "local",
      "instagram",
      "contenido",
    ]);
  });

  test("requires concrete offer and need tags plus privacy consent", () => {
    const result = parseOnboardingInput({
      fullName: "Ana Ruiz",
      businessName: "Panaderia Alba",
      city: "Madrid",
      businessType: "local",
      stage: "first_sales",
      contributionTemplateId: "space_quiet_hours",
      offerTitle: "Obrador por las tardes",
      offerDescription: "Puedo ceder una mesa de trabajo dos tardes al mes.",
      offerTags: "espacio, alimentos",
      capacityTotal: "2",
      capacityUnit: "slots_per_month",
      availableUntil: "2026-12-31",
      restrictions: "Solo tardes entre semana y sin cocina caliente.",
      needTitle: "Fotos y difusion local",
      needDescription: "Necesito contenido para explicar el obrador.",
      needTags: "contenido, audiencia",
      evidenceLinks: "https://example.com/alba",
      consentAccepted: "on",
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error);
    expect(result.data.offer.contributionTemplateId).toBe("space_quiet_hours");
    expect(result.data.offer.tags).toEqual(["espacio", "alimentos"]);
    expect(result.data.offer.capacityTotal).toBe(2);
    expect(result.data.offer.capacityUnit).toBe("slots_per_month");
    expect(result.data.offer.availabilityStatus).toBe("active");
    expect(result.data.offer.restrictions).toBe("Solo tardes entre semana y sin cocina caliente.");
    expect(result.data.need.tags).toEqual(["contenido", "audiencia"]);
    expect(result.data.evidenceLinks).toEqual(["https://example.com/alba"]);
  });

  test("rejects applications without consent or useful tags", () => {
    const result = parseOnboardingInput({
      fullName: "Ana Ruiz",
      businessName: "Panaderia Alba",
      city: "Madrid",
      businessType: "local",
      stage: "idea",
      offerTitle: "Algo",
      offerDescription: "Puedo ayudar.",
      offerTags: "",
      needTitle: "Algo",
      needDescription: "Necesito ayuda.",
      needTags: "",
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected onboarding validation to fail");
    expect(result.error).toContain("consent");
    expect(result.error).toContain("offerTags");
    expect(result.error).toContain("needTags");
  });

  test("requires at least one evidence link or uploaded file before beta submission", () => {
    expect(hasEvidenceSubmission([], [])).toBe(false);
    expect(hasEvidenceSubmission(["https://example.com"], [])).toBe(true);
    expect(hasEvidenceSubmission([], [0, 342])).toBe(true);
  });
});

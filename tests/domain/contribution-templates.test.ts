import { describe, expect, test } from "vitest";

import {
  getContributionTemplate,
  listContributionTemplates,
  templatesForBusinessType,
} from "../../lib/contribution-templates";

describe("contribution templates", () => {
  test("exposes concrete templates with evidence and capacity prompts", () => {
    const template = getContributionTemplate("space_quiet_hours");

    expect(template).toMatchObject({
      id: "space_quiet_hours",
      category: "physical_space_assets",
      label: "Espacio en horas tranquilas",
    });
    expect(template?.defaultTags).toContain("espacio");
    expect(template?.requiredEvidence).toContain("Fotos actuales del espacio o escaparate");
    expect(template?.capacityUnit).toBe("slots_per_month");
    expect(template?.riskFlags).toContain("physical_access");
  });

  test("suggests useful contribution templates for a seed project", () => {
    const templates = templatesForBusinessType("other").map((template) => template.id);

    expect(templates).toContain("seed_feedback_pack");
    expect(templates).toContain("specific_knowledge_session");
  });

  test("keeps every public template backed by at least one verification requirement", () => {
    expect(listContributionTemplates()).not.toHaveLength(0);
    for (const template of listContributionTemplates()) {
      expect(template.requiredEvidence.length).toBeGreaterThan(0);
      expect(template.capacityPrompt.length).toBeGreaterThan(20);
    }
  });
});

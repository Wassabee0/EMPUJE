import { z } from "zod";

import { contributionCategoryForTemplate, getContributionTemplate } from "./contribution-templates";
import type { BusinessStage, BusinessType, ParsedOnboardingInput } from "./types";

const businessTypes = ["local", "brand", "service", "community", "other"] as const;
const businessStages = ["idea", "first_sales", "running", "growing"] as const;
const capacityUnits = [
  "slots_per_month",
  "hours_per_month",
  "units",
  "projects_per_month",
  "introductions",
  "spots",
  "other",
] as const;

const onboardingSchema = z.object({
  fullName: z.string().trim().min(2),
  businessName: z.string().trim().min(2),
  city: z.string().trim().min(2),
  businessType: z.enum(businessTypes),
  stage: z.enum(businessStages),
  contributionTemplateId: z.string().trim().optional().default(""),
  offerTitle: z.string().trim().min(4),
  offerDescription: z.string().trim().min(12),
  offerTags: z.string().trim().min(2),
  capacityTotal: z.string().trim().optional().default(""),
  capacityUnit: z.enum(capacityUnits).optional().default("other"),
  availableFrom: z.string().trim().optional().default(""),
  availableUntil: z.string().trim().optional().default(""),
  restrictions: z.string().trim().optional().default(""),
  needTitle: z.string().trim().min(4),
  needDescription: z.string().trim().min(12),
  needTags: z.string().trim().min(2),
  evidenceLinks: z.string().optional().default(""),
  consentAccepted: z.union([z.literal("on"), z.literal(true)]),
});

function clean(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeTags(value: string) {
  const seen = new Set<string>();
  return value
    .split(/[,;\n]+/)
    .map((tag) =>
      tag
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase(),
    )
    .filter((tag) => {
      if (!tag || seen.has(tag)) return false;
      seen.add(tag);
      return true;
    })
    .slice(0, 8);
}

function splitLinks(value: string) {
  return value
    .split(/[\n,]+/)
    .map((link) => link.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function parsePositiveInteger(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9999) return null;
  return parsed;
}

function optionalDate(value: string) {
  return value ? value : null;
}

export function hasEvidenceSubmission(evidenceLinks: string[], fileSizes: number[]) {
  return evidenceLinks.some((link) => link.trim().length > 0) || fileSizes.some((size) => size > 0);
}

export function parseOnboardingInput(input: Record<string, unknown>):
  | { success: true; data: ParsedOnboardingInput }
  | { success: false; error: string } {
  const parsed = onboardingSchema.safeParse(input);
  const offerTags = normalizeTags(String(input.offerTags ?? ""));
  const needTags = normalizeTags(String(input.needTags ?? ""));
  const issues: string[] = [];
  const requestedTemplateId = String(input.contributionTemplateId ?? "").trim();
  const template = getContributionTemplate(requestedTemplateId);
  const capacityTotal = parsePositiveInteger(String(input.capacityTotal ?? "").trim());

  if (!parsed.success) {
    issues.push(...parsed.error.issues.map((issue) => issue.path.join(".") || issue.message));
  }
  if (offerTags.length === 0) issues.push("offerTags");
  if (needTags.length === 0) issues.push("needTags");
  if (requestedTemplateId && !template) issues.push("contributionTemplateId");
  if (String(input.capacityTotal ?? "").trim() && capacityTotal === null) issues.push("capacityTotal");

  if (issues.length || !parsed.success) {
    return { success: false, error: Array.from(new Set(issues)).join(", ") };
  }

  return {
    success: true,
    data: {
      profile: {
        fullName: clean(parsed.data.fullName),
        businessName: clean(parsed.data.businessName),
        city: clean(parsed.data.city),
        businessType: parsed.data.businessType as BusinessType,
        stage: parsed.data.stage as BusinessStage,
        consentAccepted: true,
      },
      offer: {
        title: clean(parsed.data.offerTitle),
        description: clean(parsed.data.offerDescription),
        tags: offerTags,
        contributionTemplateId: template?.id ?? null,
        contributionCategory: contributionCategoryForTemplate(template?.id),
        availabilityStatus: "active",
        capacityTotal,
        capacityUnit: parsed.data.capacityUnit === "other" && template ? template.capacityUnit : parsed.data.capacityUnit,
        availableFrom: optionalDate(parsed.data.availableFrom),
        availableUntil: optionalDate(parsed.data.availableUntil),
        restrictions: parsed.data.restrictions ? clean(parsed.data.restrictions) : null,
      },
      need: {
        title: clean(parsed.data.needTitle),
        description: clean(parsed.data.needDescription),
        tags: needTags,
      },
      evidenceLinks: splitLinks(parsed.data.evidenceLinks),
    },
  };
}

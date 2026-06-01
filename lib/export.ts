import type { AdminExportData, OfferRecord } from "./types";

type ExportFormat = "json" | "csv";

type FormattedExport = {
  body: string;
  contentType: string;
  filename: string;
};

function csvCell(value: unknown) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  const neutralized = /^[\s]*[=+\-@]/.test(text) || /^[\t\r]/.test(text) ? `'${text}` : text;
  if (!/[",\n\r]/.test(neutralized) && neutralized === text) return text;
  return `"${neutralized.replaceAll('"', '""')}"`;
}

function offerBusinessName(offer: OfferRecord, data: AdminExportData) {
  return data.profiles.find((profile) => profile.id === offer.profileId)?.businessName ?? "";
}

function formatCsv(data: AdminExportData) {
  const rows = [["record_type", "id", "profile_id", "email", "business_name", "status", "tags", "title", "created_at"]];

  for (const profile of data.profiles) {
    rows.push([
      "profile",
      profile.id,
      "",
      profile.email,
      profile.businessName,
      profile.status,
      "",
      "",
      profile.createdAt,
    ]);
  }

  for (const offer of data.offers) {
    rows.push([
      "offer",
      offer.id,
      offer.profileId,
      "",
      offerBusinessName(offer, data),
      offer.status,
      offer.tags.join("|"),
      offer.title,
      offer.createdAt ?? "",
    ]);
  }

  for (const need of data.needs) {
    rows.push([
      "need",
      need.id,
      need.profileId,
      "",
      data.profiles.find((profile) => profile.id === need.profileId)?.businessName ?? "",
      "",
      need.tags.join("|"),
      need.title,
      need.createdAt ?? "",
    ]);
  }

  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

export function formatAdminExport(
  data: AdminExportData,
  format: ExportFormat,
  generatedAt = new Date(),
): FormattedExport {
  const stamp = generatedAt.toISOString().replace(/[:.]/g, "-");

  if (format === "csv") {
    return {
      body: formatCsv(data),
      contentType: "text/csv; charset=utf-8",
      filename: `empuje-admin-export-${stamp}.csv`,
    };
  }

  return {
    body: JSON.stringify(
      {
        generatedAt: generatedAt.toISOString(),
        counts: {
          profiles: data.profiles.length,
          offers: data.offers.length,
          needs: data.needs.length,
          evidenceItems: data.evidenceItems.length,
          matches: data.matches.length,
          introRequests: data.introRequests.length,
        },
        data,
      },
      null,
      2,
    ),
    contentType: "application/json; charset=utf-8",
    filename: `empuje-admin-export-${stamp}.json`,
  };
}

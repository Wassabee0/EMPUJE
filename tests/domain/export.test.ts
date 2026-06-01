import { describe, expect, test } from "vitest";

import { formatAdminExport } from "../../lib/export";
import type { AdminExportData } from "../../lib/types";

const exportData: AdminExportData = {
  profiles: [
    {
      id: "p1",
      email: "ana@example.com",
      fullName: "Ana Ruiz",
      businessName: "Panaderia Alba",
      city: "Madrid",
      businessType: "local",
      stage: "first_sales",
      status: "pending_review",
      role: "member",
      trustScore: 25,
      createdAt: "2026-05-26T10:00:00.000Z",
    },
  ],
  offers: [
    {
      id: "o1",
      profileId: "p1",
      title: "Obrador por las tardes",
      description: "Espacio para pruebas pequenas.",
      tags: ["espacio"],
      status: "pending",
      createdAt: "2026-05-26T10:01:00.000Z",
    },
  ],
  needs: [],
  evidenceItems: [],
  matches: [],
  introRequests: [],
};

describe("formatAdminExport", () => {
  test("formats a JSON export with metadata and raw records", () => {
    const formatted = formatAdminExport(exportData, "json", new Date("2026-05-26T12:00:00.000Z"));

    expect(formatted.contentType).toBe("application/json; charset=utf-8");
    expect(JSON.parse(formatted.body)).toMatchObject({
      generatedAt: "2026-05-26T12:00:00.000Z",
      counts: {
        profiles: 1,
        offers: 1,
        needs: 0,
        matches: 0,
      },
      data: exportData,
    });
  });

  test("formats a CSV export with explicit production records only", () => {
    const formatted = formatAdminExport(exportData, "csv", new Date("2026-05-26T12:00:00.000Z"));

    expect(formatted.contentType).toBe("text/csv; charset=utf-8");
    expect(formatted.body).toContain("record_type,id,profile_id,email,business_name,status,tags,title,created_at");
    expect(formatted.body).toContain("profile,p1,,ana@example.com,Panaderia Alba,pending_review,,");
    expect(formatted.body).toContain("offer,o1,p1,,Panaderia Alba,pending,espacio,Obrador por las tardes");
    expect(formatted.body).not.toContain("demo");
  });

  test("neutralizes spreadsheet formula prefixes in member-controlled CSV cells", () => {
    const formatted = formatAdminExport(
      {
        ...exportData,
        profiles: [
          {
            ...exportData.profiles[0],
            businessName: '=HYPERLINK("https://evil.example","abrir")',
          },
        ],
        offers: [
          {
            ...exportData.offers[0],
            tags: ["@SUM(1,1)", "espacio"],
            title: "+1+1",
          },
        ],
        needs: [
          {
            id: "n1",
            profileId: "p1",
            title: "  -2+3",
            description: "Necesito algo sencillo.",
            tags: ["\t@IMPORTXML"],
            createdAt: "2026-05-26T10:02:00.000Z",
          },
        ],
      },
      "csv",
      new Date("2026-05-26T12:00:00.000Z"),
    );

    expect(formatted.body).toContain(`"'=HYPERLINK(""https://evil.example"",""abrir"")"`);
    expect(formatted.body).toContain(`"'+1+1"`);
    expect(formatted.body).toContain(`"'@SUM(1,1)|espacio"`);
    expect(formatted.body).toContain(`"'  -2+3"`);
    expect(formatted.body).toContain(`"'\t@IMPORTXML"`);
  });

  test("quotes carriage returns even when the cell is not a formula", () => {
    const formatted = formatAdminExport(
      {
        ...exportData,
        profiles: [
          {
            ...exportData.profiles[0],
            businessName: "Linea\rPartida",
          },
        ],
      },
      "csv",
      new Date("2026-05-26T12:00:00.000Z"),
    );

    expect(formatted.body).toContain('"Linea\rPartida"');
  });
});

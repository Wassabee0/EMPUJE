import { expect, test } from "@playwright/test";

test("local onboarding preview explains evidence needed before verification", async ({ page }) => {
  await page.goto("/onboarding?dev_preview=local");

  await expect(page.getByRole("heading", { name: /Tu perfil de Empuje empieza pendiente/i })).toBeVisible();
  await expect(page.getByText(/Para verificar esta oferta/i)).toBeVisible();
  await page.getByLabel(/Título de la oferta/i).fill("Espacio para pop-up de marcas pequenas");
  await page
    .getByLabel(/Detalles de la oferta/i)
    .fill("Puedo ceder una zona del local dos tardes al mes con aforo limitado y ubicacion clara.");
  await page.getByLabel(/Etiquetas de la oferta/i).fill("pop-up, espacio, madrid");

  await expect(page.getByText(/Fotos actuales del espacio/i)).toBeVisible();
  await expect(page.getByText(/Condiciones del espacio/i)).toBeVisible();
  await expect(page.getByText(/Necesitas aportar al menos un enlace o archivo/i)).toBeVisible();
});

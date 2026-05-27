import { expect, test } from "@playwright/test";

test("temporary local admin panel shows internal credits without Supabase", async ({ page }) => {
  await page.goto("/admin?dev_admin=local");

  await expect(page.getByText(/Modo admin temporal local/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Créditos internos/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Motor de verificación/i })).toBeVisible();
  await expect(page.getByText(/Regenerar candidatos/i)).toBeVisible();
  await expect(page.getByText(/no visibles para miembros/i)).toBeVisible();
  await expect(page.getByText(/Datos de ejemplo, solo lectura/i)).toBeVisible();
});

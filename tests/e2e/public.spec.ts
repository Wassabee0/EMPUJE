import { expect, test } from "@playwright/test";

test("public page explains examples versus private reviewed opportunities in Spanish", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Emprender no debería depender/i })).toBeVisible();
  await expect(page.getByText(/La página pública solo enseña ejemplos/i)).toBeVisible();
  await expect(page.getByText(/Las ofertas, necesidades y matches reales son privados/i)).toBeVisible();
  await expect(page.getByText(/Beneficio probable/i).first()).toBeVisible();
  await expect(page.getByText(/Probar una colaboración sin comprar anuncios/i)).toBeVisible();
  await expect(page.getByText(/No son casos reales/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Solicitar acceso beta/i }).first()).toBeVisible();
  await expect(page.getByText(/España/i).first()).toBeVisible();
});

test("auth page is Spanish and offers Supabase-backed Google auth", async ({ page }) => {
  await page.goto("/auth?mode=signup&next=/onboarding");

  await expect(page.getByRole("heading", { name: /Crea tu cuenta beta/i })).toBeVisible();
  await expect(page.getByText(/Faltan las claves de Supabase/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Continuar con Google/i })).toBeDisabled();
  await expect(page.locator("form").getByRole("button", { name: /Crear cuenta/i })).toBeDisabled();
});

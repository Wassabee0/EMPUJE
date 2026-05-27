const path = require('path');
const { test, expect } = require('@playwright/test');

const appUrl = 'file://' + path.resolve(__dirname, '..', 'preview.html');

async function unlockAdmin(page) {
  await page.getByRole('button', { name: /Acceso fundador/i }).click();
  await page.getByLabel(/PIN de admin/i).fill('2468');
  await page.getByRole('button', { name: /Entrar al panel/i }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('a beta applicant becomes a persisted pending account visible to admin', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Emprender no debería depender/i })).toBeVisible();

  await page.getByRole('button', { name: /Solicitar acceso beta/i }).first().click();
  await page.getByPlaceholder('Tu nombre').fill('Ana');
  await page.getByPlaceholder('tu@email.com').fill('ana@example.com');
  await page.getByPlaceholder('Nombre del negocio').fill('Panadería Alba');
  await page.locator('#betaForm select').nth(0).selectOption('Madrid');
  await page.locator('#betaForm select').nth(1).selectOption('Local físico');
  await page.locator('#betaForm select').nth(2).selectOption('Primeras ventas');
  await page.getByPlaceholder(/espacio los martes/i).fill('Obrador libre por las tardes y escaparate de barrio.');
  await page.getByPlaceholder(/clientes piloto/i).fill('Necesito fotos, difusión local y proveedores de café.');
  await page.getByPlaceholder(/Web, Instagram/i).fill('Instagram @panaderiaalba y Google Business.');
  await page.getByLabel(/Acepto que Empuje guarde/i).check();
  await page.getByRole('button', { name: /Enviar solicitud/i }).click();

  await expect(page.getByText(/Solicitud guardada/i)).toBeVisible();
  await page.reload();
  await unlockAdmin(page);
  await page.getByRole('button', { name: /Solicitudes/i }).click();

  await expect(page.locator('#admin-intake').getByRole('heading', { name: 'Panadería Alba' })).toBeVisible();
  await expect(page.locator('#admin-intake').getByText('ana@example.com')).toBeVisible();
  await expect(page.locator('#admin-intake').getByText(/Obrador libre/i)).toBeVisible();
});

test('evidence submitted by a member can be verified from the admin queue', async ({ page }) => {
  await page.getByRole('button', { name: /Ver demo de cuenta/i }).click();
  await page.locator("button[onclick=\"loginAs('lua')\"]").click();
  await page.getByRole('button', { name: /^Verificación/i }).click();
  await page.locator('[data-evidence-link="lua-ig"]').fill('https://instagram.com/lua-cosmetica');
  await page.locator('[data-evidence-note="lua-ig"]').fill('Métricas de audiencia y últimos posts.');
  await page.locator('[data-submit-evidence="lua-ig"]').click();

  await expect(page.getByText(/Evidencia enviada/i)).toBeVisible();
  await page.reload();
  await unlockAdmin(page);
  await page.getByRole('button', { name: /Cola de evidencias/i }).click();
  await expect(page.getByText('https://instagram.com/lua-cosmetica')).toBeVisible();

  await page.locator('[data-verify-offer="lua:lua-ig"]').click();
  await expect(page.getByText(/Oferta verificada/i)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Ver demo de cuenta/i }).click();
  await page.locator("button[onclick=\"loginAs('lua')\"]").click();
  await page.getByRole('button', { name: /^Verificación/i }).click();
  await expect(page.locator('[data-offer-status="lua-ig"]')).toHaveText(/verificado/i);
});

test('admin match decisions persist and beta data can be exported', async ({ page }) => {
  await unlockAdmin(page);
  await page.getByRole('button', { name: /Verificar matches/i }).click();
  await page.locator('#admin-matches [data-approve-match="m2"]').click();
  await expect(page.getByText(/Match aprobado/i)).toBeVisible();

  await page.reload();
  await unlockAdmin(page);
  await page.getByRole('button', { name: /Verificar matches/i }).click();
  await expect(page.locator('#admin-matches [data-match-card="m2"]')).toContainText('Aprobado');

  await page.locator('[data-export-beta]').click();
  const exported = await page.evaluate(() => localStorage.getItem('empuje_last_export'));
  expect(exported).toContain('"matches"');
  expect(exported).toContain('"evidenceSubmissions"');
});

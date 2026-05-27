const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

let server;
let baseUrl;
let dataDir;

async function waitForServer(url) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Server did not become ready at ${url}`);
}

test.beforeAll(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'empuje-beta-'));
  const port = 4300 + Math.floor(Math.random() * 400);
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      PORT: String(port),
      ADMIN_PIN: '2468',
      DATA_DIR: dataDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer(`${baseUrl}/api/health`);
});

test.afterAll(async () => {
  if (server && !server.killed) server.kill();
  if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
});

test('server persists public beta applications and protects admin export with a PIN', async () => {
  const blocked = await fetch(`${baseUrl}/api/admin/export`);
  expect(blocked.status).toBe(401);

  const created = await fetch(`${baseUrl}/api/applications`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Nora',
      email: 'nora@example.com',
      business: 'Taller Sur',
      city: 'Madrid',
      typeLabel: 'Autónomo/a',
      stage: 'Primeras ventas',
      offer: 'Montaje de escaparates pequeños y prototipos de madera.',
      need: 'Necesito locales piloto y fotos profesionales.',
      evidence: 'Portfolio: https://example.com/taller-sur',
      consent: true
    })
  });
  expect(created.status).toBe(201);
  await expect(created.json()).resolves.toMatchObject({ ok: true });

  const exported = await fetch(`${baseUrl}/api/admin/export`, {
    headers: { 'x-admin-pin': '2468' }
  });
  expect(exported.status).toBe(200);
  const payload = await exported.json();
  expect(payload.betaApplications).toHaveLength(1);
  expect(payload.betaApplications[0]).toMatchObject({
    business: 'Taller Sur',
    email: 'nora@example.com',
    status: 'pendiente'
  });

  const stored = JSON.parse(fs.readFileSync(path.join(dataDir, 'beta-state.json'), 'utf8'));
  expect(stored.betaApplications[0].business).toBe('Taller Sur');
});

test('served signup flow explains private opportunities and stores applicants on the server', async ({ page }) => {
  await page.goto(`${baseUrl}/preview.html`);

  await expect(page.getByText(/Las oportunidades reales se muestran dentro de cada cuenta/i)).toBeVisible();
  await expect(page.getByText(/El escaparate público enseña ejemplos/i)).toBeVisible();

  await page.getByRole('button', { name: /Solicitar acceso beta/i }).first().click();
  await page.getByPlaceholder('Tu nombre').fill('Lucía');
  await page.getByPlaceholder('tu@email.com').fill('lucia@example.com');
  await page.getByPlaceholder('Nombre del negocio').fill('Floristería Vela');
  await page.locator('#betaForm select').nth(0).selectOption('Madrid');
  await page.locator('#betaForm select').nth(1).selectOption('Local físico');
  await page.locator('#betaForm select').nth(2).selectOption('Funcionando');
  await page.getByPlaceholder(/espacio los martes/i).fill('Escaparate de barrio para marcas pequeñas.');
  await page.getByPlaceholder(/clientes piloto/i).fill('Necesito talleres, contenido y marcas invitadas.');
  await page.getByPlaceholder(/Web, Instagram/i).fill('Instagram @floristeriavela');
  await page.getByLabel(/Acepto que Empuje guarde/i).check();
  await page.getByRole('button', { name: /Enviar solicitud/i }).click();

  await expect(page.getByText(/Solicitud recibida en el servidor/i)).toBeVisible();

  const exported = await fetch(`${baseUrl}/api/admin/export`, {
    headers: { 'x-admin-pin': '2468' }
  });
  const payload = await exported.json();
  expect(payload.betaApplications.some(item => item.business === 'Floristería Vela')).toBe(true);
});

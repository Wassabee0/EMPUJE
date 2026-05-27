const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const rootDir = __dirname;
const port = Number(process.env.PORT || 4173);
const adminPin = (process.env.ADMIN_PIN || '').trim();
const dataDir = process.env.DATA_DIR || path.join(rootDir, 'data');
const stateFile = path.join(dataDir, 'beta-state.json');

const publicFiles = new Set([
  '/preview.html',
  '/package.json'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyState() {
  return {
    profiles: [],
    matches: [],
    agreements: [],
    betaApplications: [],
    proposals: [],
    evidenceSubmissions: [],
    intros: []
  };
}

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, JSON.stringify(emptyState(), null, 2));
  }
}

function readState() {
  ensureDataFile();
  try {
    return { ...emptyState(), ...JSON.parse(fs.readFileSync(stateFile, 'utf8')) };
  } catch (error) {
    return emptyState();
  }
}

function writeState(state) {
  ensureDataFile();
  const tempFile = `${stateFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
  fs.renameSync(tempFile, stateFile);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text) {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(text);
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 200_000) {
        reject(new Error('Solicitud demasiado grande'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('JSON no válido'));
      }
    });
    request.on('error', reject);
  });
}

function cleanText(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function slugify(value) {
  return cleanText(value, 80)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'perfil';
}

function initials(value) {
  return cleanText(value, 80)
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'E';
}

function splitList(value) {
  return cleanText(value)
    .split(/[\n,;.]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function typeFromLabel(label) {
  const normalized = cleanText(label, 80).toLowerCase();
  if (normalized.includes('local')) return 'local';
  if (normalized.includes('marca')) return 'marca';
  if (normalized.includes('comunidad') || normalized.includes('medio')) return 'medio';
  return 'autonomo';
}

function tagsFromText(value) {
  const text = cleanText(value).toLowerCase();
  const tags = [];
  if (/local|sala|obrador|espacio|escaparate/.test(text)) tags.push('espacio fisico');
  if (/instagram|newsletter|audiencia|difusion|visibilidad/.test(text)) tags.push('audiencia');
  if (/foto|video|contenido|redes/.test(text)) tags.push('contenido');
  if (/asesor|legal|gestor|consult/.test(text)) tags.push('servicio experto');
  if (/producto|stock|muestra/.test(text)) tags.push('producto');
  return tags.length ? tags.slice(0, 3) : ['oferta beta'];
}

function validateApplication(input) {
  const required = ['name', 'email', 'business', 'city', 'typeLabel', 'stage', 'offer', 'need'];
  const missing = required.filter(field => !cleanText(input[field], 400));
  if (missing.length) return `Faltan campos: ${missing.join(', ')}`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(input.email, 240))) return 'Email no válido';
  if (input.consent !== true) return 'Consentimiento requerido';
  return '';
}

function applicationToRecords(input) {
  const now = new Date().toISOString();
  const business = cleanText(input.business, 160);
  const name = cleanText(input.name, 120);
  const email = cleanText(input.email, 240).toLowerCase();
  const typeLabel = cleanText(input.typeLabel, 80);
  const type = typeFromLabel(typeLabel);
  const profileId = `beta-${slugify(business)}-${Date.now().toString(36)}`;
  const offer = cleanText(input.offer);
  const need = cleanText(input.need);
  const evidence = cleanText(input.evidence);

  const application = {
    id: `app-${Date.now().toString(36)}`,
    createdAt: now,
    profileId,
    name,
    email,
    business,
    city: cleanText(input.city, 80),
    type,
    typeLabel,
    stage: cleanText(input.stage, 80),
    offer,
    need,
    evidence,
    consent: input.consent === true,
    consentAt: cleanText(input.consentAt, 80) || now,
    source: cleanText(input.source, 120) || 'public-beta',
    status: 'pendiente'
  };

  const profile = {
    id: profileId,
    name: business,
    owner: name,
    email,
    city: application.city,
    type,
    typeLabel,
    initials: initials(business || name),
    color: 'gray',
    summary: `${business} ha solicitado entrar en Empuje y esta pendiente de revision.`,
    offers: [{
      id: `${profileId}-offer`,
      title: offer,
      tags: tagsFromText(offer),
      verified: false,
      evidence: evidence ? [evidence] : [],
      value: 0,
      risk: 'medio'
    }],
    needs: splitList(need),
    gives: splitList(offer),
    constraints: ['Pendiente de revision de beta', `Etapa: ${application.stage}`],
    trust: 42,
    rating: 0,
    agreements: 0,
    response: 'nueva',
    verifiedIdentity: false,
    completion: 35,
    reviews: [],
    betaStatus: 'pendiente'
  };

  return { application, profile };
}

function hasAdminPin(request) {
  if (!adminPin) return false;
  const url = new URL(request.url, `http://${request.headers.host}`);
  return request.headers['x-admin-pin'] === adminPin || url.searchParams.get('pin') === adminPin;
}

function serveStatic(request, response, url) {
  const pathname = url.pathname === '/' ? '/preview.html' : url.pathname;
  if (pathname.startsWith('/api/')) return false;
  if (!publicFiles.has(pathname) && !pathname.startsWith('/docs/') && !pathname.startsWith('/tests/')) {
    sendText(response, 404, 'No encontrado');
    return true;
  }
  const filePath = path.normalize(path.join(rootDir, pathname));
  if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(response, 404, 'No encontrado');
    return true;
  }
  const ext = path.extname(filePath);
  const type = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
  }[ext] || 'application/octet-stream';
  response.writeHead(200, {
    'content-type': type,
    'cache-control': 'no-cache, no-store, must-revalidate'
  });
  fs.createReadStream(filePath).pipe(response);
  return true;
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/applications') {
    try {
      const input = await parseBody(request);
      const error = validateApplication(input);
      if (error) {
        sendJson(response, 400, { ok: false, error });
        return;
      }
      const state = readState();
      const { application, profile } = applicationToRecords(input);
      state.betaApplications.push(application);
      state.profiles.push(profile);
      writeState(state);
      sendJson(response, 201, { ok: true, application, profile });
    } catch (error) {
      sendJson(response, error.message === 'Solicitud demasiado grande' ? 413 : 400, { ok: false, error: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/export') {
    if (!adminPin) {
      sendJson(response, 503, { ok: false, error: 'La exportación admin está desactivada hasta configurar ADMIN_PIN' });
      return;
    }
    if (!hasAdminPin(request)) {
      sendJson(response, 401, { ok: false, error: 'PIN admin requerido' });
      return;
    }
    sendJson(response, 200, readState());
    return;
  }

  sendJson(response, 404, { ok: false, error: 'No encontrado' });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    await handleApi(request, response, url);
    return;
  }
  serveStatic(request, response, url);
});

server.listen(port, '0.0.0.0', () => {
  ensureDataFile();
  console.log(`Empuje beta server running at http://127.0.0.1:${port}/preview.html`);
});

# Empuje Beta

Empuje es una beta en Next.js + TypeScript para España. La web pública explica el concepto y muestra ejemplos; las ofertas, necesidades, evidencias, matches y solicitudes de presentación reales viven dentro de cuentas privadas y revisadas.

## Tecnología

- Next.js 16 App Router
- TypeScript
- Supabase Auth, Postgres y Storage
- Acceso por email/contraseña, enlace mágico y Google mediante Supabase Auth
- Server actions y route handlers
- Vitest y Playwright

## Setup local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

Sin claves de Supabase, la web pública renderiza y las páginas de auth/onboarding/admin muestran un aviso. Las cuentas reales y las escrituras de datos requieren Supabase.

### Admin temporal sin Supabase

Mientras Supabase no esté conectado, puedes revisar el panel fundador con datos de ejemplo:

```bash
npm run dev
```

Después abre `http://localhost:3000/admin?dev_admin=local`.

Ese acceso es solo local, de solo lectura, se desactiva en producción y deja de funcionar cuando `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SECRET_KEY` están configuradas. Para cambiar el código local usa `DEV_ADMIN_ACCESS_CODE` en `.env.local`.

Cuando Supabase esté listo, elimina esta ayuda temporal quitando `lib/dev-admin.ts`, `lib/dev-admin-data.ts` y la rama sin Supabase de `app/admin/page.tsx`.

### Preview local del onboarding

Para revisar el flujo de usuario sin Supabase:

```bash
npm run dev
```

Después abre `http://localhost:3000/onboarding?dev_preview=local`.

Esta preview solo funciona en desarrollo. Permite comprobar el formulario, la guía de evidencias y la copia antes de activar Auth. En producción, el onboarding real exige sesión de Supabase.

El alta beta exige al menos un enlace o archivo de evidencia. El usuario elige una plantilla de aportación, declara capacidad/disponibilidad/restricciones y ve una guía inicial de qué aportar según su tipo de negocio, oferta y etiquetas; la verificación final sigue siendo manual.

## Supabase

1. Crea un proyecto en Supabase.
2. Copia la URL del proyecto en `NEXT_PUBLIC_SUPABASE_URL`.
3. Copia una publishable key en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Copia una secret key en `SUPABASE_SECRET_KEY`.
5. En Supabase Auth, activa email/contraseña y enlace mágico.
6. Añade redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://tu-dominio.vercel.app/auth/callback`
7. Aplica la migración:

```bash
supabase db push
```

Si no tienes la CLI de Supabase, pega `supabase/migrations/20260526163000_initial_empuje_beta.sql` en el SQL editor de Supabase y ejecútalo una vez.

La migración crea `profiles`, `offers`, `needs`, `evidence_items`, `matches`, `match_participants`, `intro_requests`, `admin_notes`, `reputation_events`, políticas RLS y el bucket privado `evidence`.

La migración adicional `supabase/migrations/20260527002854_materialized_match_candidates.sql` crea `match_candidates`: una cola interna admin-only para guardar candidatos generados, scores operativos y razones de bloqueo.

La migración `supabase/migrations/20260527090000_offer_capacity_and_contribution_templates.sql` añade plantillas/categorías de aportación, estado de disponibilidad, capacidad, restricciones y columnas de capacidad para candidatos. Aplica las tres migraciones antes de usar el panel real.

## Auth con Google

La recomendación es mantener Supabase Auth como backend de identidad, sesión y RLS. Google debe añadirse como proveedor OAuth dentro de Supabase, no sustituir a Supabase.

Pasos:

1. En Google Cloud/Auth Platform, crea un OAuth Client ID de tipo Web.
2. En Authorized JavaScript origins añade:
   - `http://localhost:3000`
   - `https://tu-dominio.vercel.app`
3. En Authorized redirect URIs añade el callback de Supabase que aparece en Supabase Dashboard → Auth → Providers → Google.
4. En Supabase Dashboard → Auth → Providers → Google, activa Google y pega Client ID + Client Secret.
5. En Supabase Auth URL Configuration, mantén permitida la ruta `/auth/callback` de tu app.

Usa solo scopes básicos: `openid`, email y profile. No pidas permisos sensibles si no hacen falta.

## Crear Admin

1. Regístrate normalmente.
2. Completa onboarding.
3. En el SQL editor de Supabase, promueve tu cuenta:

```sql
update public.profiles
set role = 'admin', status = 'active'
where email = 'tu@email.com';
```

Después visita `/admin`.

## Deploy en Vercel

1. Sube el repo a GitHub.
2. Importa el repo en Vercel.
3. Añade variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `DEV_ADMIN_ACCESS_CODE` no es necesario en producción
4. Pon `NEXT_PUBLIC_SITE_URL` con tu dominio de producción.
5. Añade el callback de producción en Supabase Auth.
6. Despliega.

## Verificación

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

`npm test` cubre matching determinista, onboarding y export admin. `npm run test:e2e` comprueba la web pública en español y la auth con Google vía Supabase.

El panel fundador incluye un botón “Regenerar candidatos” para materializar la cola en Supabase. La regeneración descarta candidatos obsoletos y no genera matches nuevos para ofertas agotadas, pausadas, reservadas, suspendidas o sin capacidad. En el admin temporal local ese botón aparece desactivado porque los datos son de ejemplo.

## Estrategia

- Producto y arquitectura: `docs/01-foundation/product-brief.md` y `docs/01-foundation/architecture-overview.md`
- Monetización: `docs/01-foundation/monetization-strategy.md`
- Confianza/verificación: `docs/02-contracts/trust-verification-contract.md`
- Operativa de matching: `docs/02-contracts/matching-operations-contract.md`

## Prototipo Antiguo

`preview.html` y `prototypes/preview.html` quedan como historia de producto. No son la arquitectura de producción ni deben usarse para recoger usuarios de Reddit. Si arrancas `server.js` para revisar el prototipo antiguo, define `ADMIN_PIN`; la exportación admin queda desactivada cuando falta ese valor.

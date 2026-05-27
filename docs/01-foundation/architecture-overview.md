# Resumen de Arquitectura

Estado: beta Next.js/Supabase para España, 2026-05-26.

## Forma

Empuje es ahora una aplicación Next.js App Router desplegable en Vercel. El prototipo HTML queda como historia de producto, no como arquitectura de producción.

Ruta real:

- La web pública explica el concepto, el modelo de confianza, ejemplos y CTA de beta.
- Supabase Auth gestiona email/contraseña, enlace mágico y Google como proveedor OAuth.
- El onboarding escribe perfiles, ofertas, necesidades y metadatos de evidencia en Supabase Postgres.
- Los archivos de evidencia suben al bucket privado `evidence` de Supabase Storage.
- El panel de miembro muestra estado, ofertas, necesidades, evidencia, confianza y matches privados aprobados.
- El panel fundador revisa usuarios, verifica evidencias/ofertas, guarda matches candidatos, cambia estados y exporta datos.

## Unidades

| Unidad | Responsabilidad |
| --- | --- |
| `app/` | Páginas App Router, route handlers y server actions. |
| `components/` | UI pública, auth, onboarding, dashboard y admin. |
| `lib/supabase/` | Clientes browser, server, secret-key y proxy de sesión. |
| `lib/repository.ts` | Acceso a datos y mutaciones de miembro/admin. |
| `lib/authorization.ts` | Guardas de autorización que no deben depender solo de RLS. |
| `lib/matching.ts` | Matching determinista por etiquetas, ciudad, verificación y tipo. |
| `lib/contribution-templates.ts` | Catálogo estructurado de aportaciones verificables y requisitos de evidencia. |
| `lib/offer-availability.ts` | Estados de disponibilidad, capacidad restante y reglas para excluir ofertas del matching. |
| `lib/onboarding.ts` | Validación de onboarding y normalización de etiquetas. |
| `lib/export.ts` | Export admin JSON/CSV. |
| `supabase/migrations/` | Esquema, RLS, bucket privado y políticas. |

## Límites

El navegador renderiza formularios e inicia auth. Las escrituras de producto pasan por server actions o route handlers. Los visitantes públicos no reciben datos de miembros. Los miembros solo ven datos propios y matches aprobados donde participan. Admin usa la clave privada de Supabase desde servidor y cada acción sensible comprueba rol.

## Despliegue

Variables necesarias en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`

Aplica todas las migraciones en orden antes de lanzar públicamente:

- `20260526163000_initial_empuje_beta.sql`
- `20260527002854_materialized_match_candidates.sql`
- `20260527090000_offer_capacity_and_contribution_templates.sql`

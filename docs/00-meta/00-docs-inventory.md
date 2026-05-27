# Inventario de Docs

Estado: inventario actualizado para beta Next.js/Supabase, 2026-05-26.

## Taxonomía

| Carpeta | Responsable de | Añadir aquí cuando |
| --- | --- | --- |
| `00-meta/` | Inventario y proceso documental. | Cambia el sistema de docs. |
| `01-foundation/` | Verdad de producto y arquitectura. | Cambia la historia global o una decisión base. |
| `02-contracts/` | Contratos vinculantes. | El código necesita una regla estable. |
| `03-delivery/` | Orden de trabajo y aceptación. | Cambia el alcance activo o estado de entrega. |
| `04-audits/` | Auditorías y comparaciones. | Hay que inspeccionar la realidad antes de decidir. |
| `99-archive/` | Historia útil, no autoridad actual. | Una nota queda superada. |

## Raíz del Proyecto

| Ruta | Rol |
| --- | --- |
| `app/` | Beta actual en Next.js App Router. |
| `components/` | Superficies UI actuales. |
| `lib/` | Dominio, Supabase, autorización, matching, validación y export. |
| `supabase/migrations/` | Contrato actual de base de datos, RLS y Storage. |
| `README.md` | Configuración, Supabase, auth con Google, Vercel y creación de admin. |
| `.env.example` | Plantilla de variables necesarias. |
| `preview.html` | Prototipo estático legado. |
| `prototypes/preview.html` | Prototipo histórico usado como contexto. |
| `gpt-idea.md` | Historia de idea y racional. |
| `package.json` | Scripts Next.js, build, tests y dependencias. |
| `server.js` | Servidor legado del prototipo; no producción. |
| `tests/domain/` | Tests Vitest de dominio y seguridad. |
| `tests/e2e/` | Smoke tests Playwright. |

## Foundation

| Ruta | Rol |
| --- | --- |
| `01-foundation/product-brief.md` | Resumen de producto y promesa de beta. |
| `01-foundation/architecture-overview.md` | Arquitectura Next.js/Supabase y límites. |
| `01-foundation/monetization-strategy.md` | Estrategia de monetización, umbrales y escenarios. |
| `01-foundation/open-decisions.md` | Decisiones cerradas y abiertas. |
| `01-foundation/source-inventory.md` | Inventario de fuentes y autoridad actual. |

## Contratos

| Ruta | Rol |
| --- | --- |
| `02-contracts/storage-contract.md` | Reglas de datos, persistencia y acceso. |
| `02-contracts/trust-verification-contract.md` | Verificación, reputación y bloqueo de matches. |
| `02-contracts/matching-operations-contract.md` | Operativa interna para revisar matches a escala beta. |

## Entrega

| Ruta | Rol |
| --- | --- |
| `03-delivery/README.md` | Mapa y reglas de entrega. |
| `03-delivery/00-current/active-roadmap.md` | Orden actual de trabajo. |
| `03-delivery/20-owner-checklists/README.md` | Reglas de aceptación manual. |
| `03-delivery/20-owner-checklists/beta-owner-checklist.md` | Checklist de aceptación de beta. |

## Auditorías

| Ruta | Rol |
| --- | --- |
| `04-audits/beta-preview-implementation-audit.md` | Auditoría de estado actual y riesgos restantes. |

## Checklist de Mantenimiento

- [x] Nuevos docs están en la carpeta correcta.
- [x] Nuevos docs aparecen en este inventario.
- [x] Roadmap activo vive en `03-delivery/00-current/`.
- [x] Checklists de aceptación viven en `03-delivery/20-owner-checklists/`.
- [x] Contratos vigentes viven en `02-contracts/`.

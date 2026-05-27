# Docs de Empuje

Esta carpeta es la fuente viva de verdad para Empuje.

## Empieza Aquí

1. `00-meta/00-docs-inventory.md`
2. `01-foundation/product-brief.md`
3. `01-foundation/architecture-overview.md`
4. `03-delivery/README.md`
5. `03-delivery/00-current/active-roadmap.md`

## Mapa

| Carpeta | Propósito |
| --- | --- |
| `00-meta/` | Inventario, taxonomía y proceso de docs. |
| `01-foundation/` | Producto, arquitectura, decisiones e inventario de fuentes. |
| `02-contracts/` | Contratos vinculantes de implementación. |
| `03-delivery/` | Roadmap activo, checklists de aceptación e histórico. |
| `04-audits/` | Auditorías, triage y comparaciones. |
| `99-archive/` | Notas históricas que ya no son autoridad actual. |

## Jerarquía de Fuentes

Cuando dos fuentes no coinciden:

1. Ganan `docs/02-contracts/` y las decisiones cerradas.
2. `app/`, `components/`, `lib/` y `supabase/migrations/` describen la implementación actual.
3. `preview.html`, `prototypes/preview.html` y `gpt-idea.md` son contexto histórico.
4. Las nuevas decisiones se documentan antes de depender de ellas en código.

## Reglas

- No añadir docs sueltos en la raíz si pertenecen a `docs/`.
- Nuevos contratos van en `02-contracts/`.
- Roadmap activo va en `03-delivery/00-current/`.
- Checklists manuales van en `03-delivery/20-owner-checklists/`.
- Auditorías y comparaciones van en `04-audits/`.
- Actualiza `00-meta/00-docs-inventory.md` cuando cambie la estructura.

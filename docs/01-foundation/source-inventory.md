# Inventario de Fuentes

Estado: mapa actual, 2026-05-26.

| Ruta | Tipo | Autoridad actual |
| --- | --- | --- |
| `app/` | Implementación actual | Vinculante para rutas, server actions y comportamiento UI. |
| `components/` | Implementación actual | Vinculante para superficies reutilizables. |
| `lib/` | Implementación actual | Vinculante para dominio, autorización, Supabase, matching y export. |
| `supabase/migrations/` | Implementación actual | Vinculante para schema, RLS y Storage. |
| `preview.html` | Prototipo legado | Referencia histórica solamente. |
| `prototypes/preview.html` | Prototipo | Contexto visual/producto, no autoridad de implementación. |
| `gpt-idea.md` | Transcripción de idea | Racional e historia del producto. |
| `tests/domain/` | Verificación | Tests unitarios de matching, onboarding, autorización, redirect y export. |
| `tests/e2e/` | Verificación | Smoke tests de web pública/auth. |

## Notas

- `gpt-idea.md` explica la evolución: directorio, beta, cuentas, verificación, reputación y revisión admin.
- `preview.html` y `prototypes/preview.html` sirven para comparar tono/idea, no para recoger usuarios reales.
- Las decisiones que cambian almacenamiento, confianza, verificación o expectativa de usuario deben reflejarse en `docs/02-contracts/`.

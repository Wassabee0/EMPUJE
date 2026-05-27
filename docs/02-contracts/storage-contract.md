# Contrato de Datos y Almacenamiento

Estado: vinculante para la beta Next.js/Supabase, 2026-05-26.

## Almacenamiento Canónico

Los datos de producción viven en Supabase:

- Usuarios en Supabase Auth.
- Perfiles y solicitudes en `public.profiles`.
- Afirmaciones de oferta en `public.offers`.
- Necesidades en `public.needs`.
- Metadatos de evidencia en `public.evidence_items`.
- Archivos de evidencia en el bucket privado `evidence`.
- Flujo de matches en `public.matches` y `public.match_participants`.
- Solicitudes de presentación en `public.intro_requests`.
- Notas internas e historial de reputación en `public.admin_notes` y `public.reputation_events`.

`data/beta-state.json`, `preview.html` y `prototypes/preview.html` son artefactos del prototipo antiguo. No son el camino para recoger usuarios de Reddit.

## Reglas de Acceso

- Visitantes públicos no pueden consultar datos de miembros.
- Miembros autenticados pueden leer su propio perfil, ofertas, necesidades, evidencias y matches aprobados donde participan.
- El fundador/admin puede leer y modificar todos los registros de beta.
- La autorización admin vive en `profiles.role`, no en metadatos editables por el usuario.
- Los archivos de evidencia son privados y se aíslan por carpeta de usuario en Supabase Storage.
- Las server actions que usan clave privada de Supabase deben repetir las comprobaciones de objeto necesarias, porque la clave privada salta RLS.

## Export

El export admin está disponible en:

- `/api/admin/export?format=json`
- `/api/admin/export?format=csv`

Ambos requieren sesión autenticada y rol admin.

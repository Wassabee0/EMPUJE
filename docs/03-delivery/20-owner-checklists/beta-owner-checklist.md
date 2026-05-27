# Checklist Responsable de Beta

Estado: checklist controlado por owner para la beta Next.js/Supabase.

Alcance:

- Landing pública.
- Signup beta.
- Onboarding de perfil completo.
- Panel de miembro con estado, evidencia y matches privados aprobados.
- Panel fundador con revisión, evidencia, matching manual, export y control de estados.

Referencias:

- Implementación actual: `app/`, `components/`, `lib/`, `supabase/migrations/`
- Prototipo legado: `preview.html`
- Racional de producto: `gpt-idea.md`
- Contratos: `docs/02-contracts/storage-contract.md`, `docs/02-contracts/trust-verification-contract.md`

## Puerta de Salida

- [ ] La persona responsable confirma que la beta está lista para compartir públicamente.
- [x] Copy pública explica que los ejemplos no son oportunidades reales.
- [x] Signup pide datos suficientes para matching manual.
- [x] Onboarding pide tipo de aportación, capacidad, disponibilidad y restricciones.
- [x] Los datos reales se guardan en Supabase cuando hay credenciales.
- [x] El panel miembro no muestra demo data como verdad.
- [x] El panel admin permite operar revisión y matching a mano.
- [x] Estados de confianza/verificación son visibles.
- [ ] Supabase de producción está conectado y migrado.
- [ ] Vercel funciona con variables de producción.
- [ ] Política de privacidad/legal está publicada o explícitamente diferida.

## Implementado

- [x] App Next.js con TypeScript.
- [x] Supabase Auth/Postgres/Storage y migración RLS.
- [x] Auth por email/contraseña, enlace mágico y Google vía Supabase.
- [x] Onboarding crea perfil pendiente.
- [x] Miembros pueden enviar enlaces/archivos de evidencia.
- [x] Admin puede verificar ofertas y evidencias.
- [x] Admin puede guardar y actualizar matches.
- [x] Export admin CSV/JSON requiere rol admin.
- [x] Matching determinista con bloqueos por evidencia.
- [x] Matching descarta ofertas agotadas, pausadas, reservadas o sin capacidad.
- [x] Catálogo de aportaciones verificables alimenta onboarding y guía de evidencias.
- [x] Tests unitarios, e2e, build y auditoría de dependencias pasan.

## Decisiones Pendientes de Responsable

- [ ] Primera ciudad o vertical de España.
- [ ] Texto exacto del post/CTA de Reddit.
- [ ] Contenido legal mínimo antes de promoción amplia.

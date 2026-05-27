# Auditoría de Implementación de Beta

Estado: auditoría actualizada tras migración a Next.js/Supabase, 2026-05-26.

## Qué Existe

- App Next.js App Router con TypeScript, lista para Vercel.
- Landing pública en español para España, con ejemplos y aviso claro de privacidad.
- Supabase Auth para email/contraseña, enlace mágico y Google.
- Onboarding respaldado por servidor con perfil, oferta, necesidad, evidencia y consentimiento.
- Supabase Postgres con RLS para perfiles, ofertas, necesidades, evidencia, matches, intros, notas y reputación.
- Supabase Storage privado para archivos de evidencia.
- Panel miembro con estado, ofertas, necesidades, evidencia, confianza y matches aprobados.
- Panel fundador con revisión de usuarios, verificación de evidencia/ofertas, candidatos de matching, estados de match y export CSV/JSON.
- Matching determinista por etiquetas, ciudad, verificación y tipo complementario.
- Tests Vitest y Playwright.

## Riesgos Reducidos Durante la Auditoría

- Callback de auth ahora solo redirige a rutas internas.
- Solicitudes de intro ahora verifican participación y estado del match aunque el servidor use clave privada de Supabase.
- El servidor legado ya no tiene PIN admin por defecto.
- PostCSS queda forzado a una versión parcheada y `npm audit --omit=dev` no reporta vulnerabilidades.

## Límites Conocidos

- Falta conectar credenciales reales de Supabase en este entorno.
- Falta publicar página de privacidad/legal completa.
- No hay emails transaccionales todavía.
- No hay reviews post-introducción todavía.
- `server.js`, `preview.html` y `prototypes/preview.html` son legado y no deben usarse para recoger usuarios reales.

## Riesgo de Lanzamiento

Antes de promoción amplia: conectar Supabase, aplicar migración, promover cuenta fundador a admin, configurar Google OAuth en Supabase, desplegar en Vercel y publicar privacidad/legal. Para una prueba pequeña de Reddit, el producto ya tiene camino real de cuenta y almacenamiento cuando las credenciales estén puestas.

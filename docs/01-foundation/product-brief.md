# Brief de Producto

Estado: fuente de verdad de beta, 2026-05-26.

## Producto

Empuje es una beta para España que ayuda a pequeños negocios, autónomos, proyectos locales y marcas emergentes a encontrar oportunidades revisadas sin depender de conocer ya a la persona correcta.

La promesa:

> Conseguir oportunidades que normalmente viven en redes cerradas: espacios, primeros clientes, proveedores, visibilidad, colaboraciones y recursos compartidos mediante cuentas revisadas, ofertas verificables y presentaciones cuidadas.

## Posicionamiento

Empuje no es un directorio público, marketplace genérico ni tablón de trueque. La página pública solo enseña ejemplos. Las ofertas, necesidades y matches reales viven dentro de cada cuenta después de signup, revisión y aprobación manual.

## Alcance de Beta

La beta actual debe soportar:

- Landing pública en español para España.
- Cuenta real con Supabase Auth: email/contraseña, enlace mágico y Google.
- Onboarding con negocio, ciudad, tipo, etapa, oferta, necesidad, evidencia y consentimiento.
- Panel de miembro con estado, ofertas, necesidades, evidencia, confianza e oportunidades privadas aprobadas.
- Panel fundador con revisión de usuarios, verificación de evidencias/ofertas, matches candidatos, aprobación manual y export JSON/CSV.
- Matching determinista por etiquetas, ciudad, verificación y tipo complementario.
- Datos reales en Supabase; sin `localStorage` ni demo data como camino principal.

## Validación de Lanzamiento

Experimento inicial:

- Reclutar 30 a 50 miembros en una ciudad o vertical de España.
- Pedir a cada miembro una oferta útil y una necesidad concreta.
- Revisar evidencias manualmente.
- Aprobar solo matches con encaje y suficiente confianza.
- Medir colaboraciones útiles cerradas por cada 10 miembros activos.

Métrica principal:

- 3 a 5 colaboraciones reales desde los primeros 30 miembros comprometidos.

## Ángulo Monetizable

No cobrar por estar listado. Monetizar:

- Acceso curado a oportunidades revisadas.
- Verificación y confianza.
- Presentaciones humanas revisadas.
- Montaje asistido de colaboraciones.
- Círculos locales o verticales patrocinados.

Fases probables:

- Beta gratuita por invitación mientras se valida liquidez y confianza.
- Membresía local de 9-19 EUR/mes cuando haya oportunidades reales.
- Oportunidades asistidas de 79-250 EUR por colaboración activada.
- Círculos patrocinados de 300-1.500 EUR/mes para coworkings, asociaciones, asesorías, escuelas o instituciones locales.

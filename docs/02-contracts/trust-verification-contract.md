# Contrato de Confianza y Verificación

Estado: vinculante para la beta Next.js/Supabase, 2026-05-26.

## Regla Central

Empuje separa “un miembro dice que puede ofrecer esto” de “esta oferta está verificada”.

## Verificación de Ofertas

Cada oferta tiene:

- `status`: `unverified`, `pending`, `verified` o `rejected`
- `availability_status`: `active`, `partial`, `reserved`, `in_agreement`, `exhausted`, `cooldown`, `paused`, `archived` o `suspended`
- plantilla/categoria de aportación cuando el onboarding la captura
- capacidad declarada, capacidad usada, unidad, disponibilidad y restricciones
- etiquetas
- evidencias asociadas
- notas admin

La evidencia puede ser un enlace, archivo, portfolio, reseña, foto, licencia, Google Business, web, referencia pública o nota de validación manual.

## Preverificación Automática

Empuje puede calcular una revisión interna por oferta:

- `score`: calidad verificable de 0 a 100.
- `riskLevel`: `low`, `medium` o `high`.
- `recommendedAction`: `can_verify`, `request_evidence`, `reject_or_request_fix` o `review_profile`.
- `missingEvidence`: qué falta pedir.
- `blockingReasons`: por qué no se debe activar todavía.
- `autoChecks`: checks legibles para el fundador.

La preverificación no verifica. Una oferta solo pasa a `verified` cuando el fundador lo decide.

Regla: si hay evidencia rechazada, perfil no activo o una afirmación vaga sin prueba, el sistema debe bloquear o pedir evidencia antes de permitir intros.

## Guía de Evidencia Para Miembros

Antes de enviar el onboarding, el miembro debe ver qué pruebas ayudan a verificar su oferta.

La guía inicial se calcula por:

- Tipo de negocio: local, marca, servicio, comunidad u otro.
- Plantilla de aportación: espacio, audiencia, stock, servicio, validación, evento, distribución, relación, conocimiento, tiempo o semilla.
- Texto de la oferta.
- Etiquetas de la oferta.
- Capacidad declarada y restricciones.

El usuario debe aportar al menos un enlace o archivo. Si no aporta nada, la solicitud no debe guardarse como onboarding completo.

Ejemplos de requisitos:

- Local físico: fotos del espacio, Google Business o prueba pública, disponibilidad y límites.
- Marca/producto: fotos de producto, stock, tienda o catálogo, prueba de entrega.
- Servicio: portfolio, referencias, web profesional y alcance del servicio.
- Comunidad/medio: métricas recientes, canal público y ejemplo de colaboración.

La guía prepara la revisión; no sustituye al fundador.

## Capacidad de Oferta

La capacidad se revisa por oferta, no por usuario.

Reglas:

- Un miembro puede seguir activo aunque una oferta concreta esté agotada o pausada.
- Una oferta `partial` puede seguir generando candidatos si queda capacidad.
- Una oferta `reserved`, `in_agreement`, `exhausted`, `cooldown`, `paused`, `archived` o `suspended` no debe generar nuevos candidatos.
- Si `capacity_used >= capacity_total`, el sistema debe tratarla como no disponible para matching.
- Admin puede corregir capacidad, restricciones y fecha de revisión desde el panel fundador.

## Bloqueo de Matches

- Un match puede aparecer como candidato con evidencia parcial.
- Un match no debe activarse para miembros si su valor crítico depende de una oferta sin verificar.
- Admin puede aprobar, rechazar, pedir más evidencia o ajustar manualmente.
- Miembros solo ven matches `approved`, `introduced` o `completed` donde participan.

## Reputación

La puntuación de confianza combina:

- Estado de revisión del perfil.
- Ofertas verificadas.
- Evidencias verificadas.
- Matches completados.
- Señales de riesgo por evidencia ausente, ofertas rechazadas o compromisos poco claros.

## Promesa al Usuario

La beta nunca debe insinuar que todas las afirmaciones visibles están verificadas. El estado de cada oferta y evidencia debe seguir visible para miembro y admin.

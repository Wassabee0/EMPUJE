# Contrato Operativo de Matching

Estado: vinculante para operar la beta con 50-150 miembros, 2026-05-26.

## Objetivo

El fundador debe poder revisar una beta de unas 100 personas sin convertir el matching en una hoja de cálculo infinita.

El sistema no decide por sí solo. Ordena el trabajo para que una persona pueda decidir rápido y con evidencia.

## Flujo Semanal

1. Revisar perfiles nuevos.
2. Marcar perfiles como `active`, `needs_evidence` o `rejected`.
3. Revisar evidencias pendientes.
4. Verificar o rechazar ofertas.
5. Abrir la cola de matching operativo.
6. Guardar los mejores candidatos.
7. Aprobar solo matches con oferta verificada y encaje claro.
8. Facilitar o pedir intro.
9. Marcar resultado: `introduced`, `completed` o `rejected`.

## Qué Hace la Cola de Matching

La cola interna:

- Genera candidatos por solape entre etiquetas de oferta y necesidad.
- Puede materializar candidatos en `match_candidates` para que el admin no recalcule toda la red al abrir el panel.
- Da bonus por misma ciudad.
- Da bonus por oferta verificada.
- Da bonus por tipos complementarios.
- Descarta automáticamente ofertas `reserved`, `in_agreement`, `exhausted`, `cooldown`, `paused`, `archived` o `suspended`.
- Descarta ofertas sin capacidad restante o con disponibilidad caducada.
- Muestra capacidad restante cuando una oferta parcial sigue siendo matchable.
- Calcula scores operativos separados: encaje, confianza, urgencia y penalización de riesgo.
- Bloquea candidatos con perfil pendiente, perfil rechazado, perfil con falta de evidencia u oferta sin verificar.
- Oculta pares que ya están guardados como match.
- Prioriza primero candidatos listos (`suggested`) y después bloqueados por evidencia (`needs_evidence`).
- Muestra bloqueos principales para saber qué revisar antes.
- Muestra rutas de ciudad con más señal.

## Automatización V1

El sistema puede proponer una acción interna para cada candidato:

- `approve_candidate`: listo para revisión rápida del fundador.
- `request_evidence`: no revisar intro todavía; pedir o revisar evidencia.
- `review_manually`: hay señal, pero no suficiente para acción rápida.
- `reject`: hay rechazo o riesgo fuerte que conviene descartar o corregir.

Esto no aprueba matches por sí solo. Solo reduce el tiempo de decisión.

La tabla `match_candidates` es una cola interna, no una oportunidad visible para miembros. Los miembros siguen viendo únicamente matches `approved`, `introduced` o `completed` donde participan.

## Regeneración de Candidatos

El admin puede usar “Regenerar candidatos” después de revisar perfiles, ofertas o evidencias.

La regeneración:

- Lee perfiles, ofertas, necesidades y evidencias.
- Recalcula candidatos deterministas.
- Marca como descartados los candidatos materializados que ya no deben estar activos.
- Guarda o actualiza cada par `offer_id:need_id` en `match_candidates`.
- Mantiene `blocking_reasons`, `overlap_tags`, `score_breakdown`, `risk_level` y `next_action`.
- Deja fuera la aprobación final, que sigue siendo manual.

Cuando haya más volumen, esta regeneración puede pasar a cron/Edge Function, pero la regla de producto no cambia: automatizar cola, no automatizar confianza.

## Umbrales de Decisión

Usa estos umbrales hasta tener datos reales:

- `80-100`: revisar primero; posible aprobación si la evidencia es fuerte.
- `60-79`: guardar solo si el contexto humano lo justifica.
- `40-59`: útil para entender demanda, pero no priorizar.
- `<40`: no revisar salvo que sea una ciudad o vertical estratégica.

La puntuación nunca sustituye el juicio humano. Sirve para ordenar.

## Reglas de Fiabilidad

- No aprobar un match si la oferta crítica está sin verificar.
- No generar un candidato nuevo si la oferta está pausada, agotada, reservada, suspendida o fuera de capacidad.
- No presentar a dos miembros si uno está `pending_review`, `needs_evidence` o `rejected`.
- No enseñar al miembro un match `suggested` o `needs_evidence`.
- No guardar duplicados si ya existe el mismo par oferta-necesidad.
- No convertir “misma ciudad” en garantía de encaje.
- No usar tags genéricos como única razón. Debe haber una historia de valor.

## Cómo Operar 100 Personas

Cadencia recomendada:

- 2 bloques semanales de 60-90 minutos.
- Primer bloque: perfiles y evidencia.
- Segundo bloque: matching e intros.

Objetivo por bloque:

- Revisar 20-30 perfiles/evidencias.
- Guardar 10-20 candidatos.
- Aprobar 3-8 matches.
- Hacer 2-5 intros cuidadas.

Si la cola crece:

- Pedir más evidencia en lote.
- Filtrar por ciudad/vertical en la decisión humana.
- Priorizar miembros activos con oferta verificada.
- Pausar signup abierto antes de bajar calidad.

## Señales de Buen Match

Un buen match suele tener:

- Necesidad concreta y urgente.
- Oferta verificable.
- Beneficio para ambos lados.
- Bajo riesgo operativo.
- Una primera acción pequeña.
- Ciudad o comunidad compatible.
- Expectativas fáciles de escribir en 5 líneas.

## Señales de Mal Match

No aprobar si:

- Una parte solo busca clientes gratis.
- Una parte ofrece “visibilidad” sin audiencia demostrable.
- La oferta depende de permisos no verificados.
- Hay demasiadas condiciones no escritas.
- La colaboración exige dinero, contrato o fiscalidad que Empuje no está preparado para manejar.

## Métricas de Matching

Medir semanalmente:

- Candidatos generados.
- Candidatos listos.
- Candidatos bloqueados por evidencia.
- Bloqueos más repetidos.
- Matches guardados.
- Matches aprobados.
- Intros solicitadas.
- Intros completadas.
- Tiempo medio hasta decidir.
- Colaboraciones reales.

Si hay muchos candidatos pero pocas aprobaciones, el problema suele ser evidencia o calidad de oferta.

Si hay muchas aprobaciones pero pocas intros, el problema suele ser confianza, copy o momento.

Si hay intros pero pocas colaboraciones, el problema suele ser coordinación posterior.

Sí: aquí Empuje puede volverse mucho más potente, pero hay que separar dos cosas.

La primera es **automatizar el motor de matches**: directos, triangulares, grupales, por capacidad, por reputación, por necesidad común, etc.

La segunda es **abrir un nuevo tipo de match**: no solo “yo tengo algo que tú necesitas”, sino “muchos necesitamos lo mismo; juntemos demanda para negociar mejor”. Eso puede ser una línea de producto enorme, pero tiene más riesgo legal y operativo que los matches normales.

Mi conclusión inicial: **sí lo exploraría, pero empezaría con una versión muy ligera de compra agregada, sin que Empuje toque el dinero ni compre el producto en nombre de nadie**.

### 1. El motor de matches debería ser un sistema por capas

No intentaría resolverlo solo con IA generativa. La IA puede ayudar, pero la base debería ser más estructurada.

El sistema debería funcionar así:

Primero, cada usuario no tiene simplemente una biografía. Tiene objetos estructurados:

**Ofertas**: qué puede aportar.
**Necesidades**: qué busca.
**Capacidad**: cuánto puede ofrecer y hasta cuándo.
**Disponibilidad**: fechas, zona, recurrencia.
**Evidencia**: si está verificado o no.
**Restricciones**: qué no acepta.
**Reputación**: cumplimiento, respuesta, valoraciones.
**Tipo de valor**: espacio, producto, audiencia, contenido, distribución, conocimiento, clientes piloto, financiación, etc.

Luego el sistema genera “aristas” de valor:

A puede ayudar a B.
B puede ayudar a C.
C puede ayudar a A.
A, B, C, D y E juntos pueden crear una oportunidad grupal.
A, B, C, D y E comparten una necesidad de compra y podrían negociar juntos con un proveedor.

La unidad interna no debería ser solo el match. Debería ser:

**nodo = usuario**
**activo = oferta verificable**
**necesidad = bloqueo concreto**
**arista = posibilidad de que un activo cubra una necesidad**
**ciclo = triángulo o cadena de valor**
**cluster = grupo de usuarios con necesidad similar**
**oportunidad = match accionable que una persona puede aprobar**

### 2. Cómo automatizarlo de forma realista

Yo lo dividiría en cinco motores.

El primero sería el **motor de clasificación**. Convierte texto libre en etiquetas normalizadas.

Ejemplo:

“Puedo dejar mi local los martes por la tarde” se convierte en:

Categoría: espacio físico.
Subcategoría: local para evento/pop-up.
Unidad: franja horaria.
Capacidad: martes tarde.
Verificación necesaria: fotos, dirección aproximada, aforo, permiso, calendario.
Tipo de valor: recurso escaso.
Riesgo: medio si no está verificado.

“Necesito vender material de deportes de contacto fuera de mi gimnasio” se convierte en:

Categoría: clientes piloto / distribución.
Subcategoría: primeros compradores fuera de círculo.
Sector: deporte/contacto.
Necesidad: canal alternativo, confianza, contenido, validación.
Riesgo: verificar producto, stock, condiciones y categoría permitida.

El segundo sería el **motor de compatibilidad directa**.

Pregunta:

¿La oferta de A cubre la necesidad de B?
¿B puede compensar a A de alguna manera?
¿Hay disponibilidad?
¿Está verificado lo crítico?
¿La reputación permite activar intro?
¿La colaboración puede ejecutarse en menos de 30 días?

El tercero sería el **motor de ciclos**.

Aquí se buscan triángulos y cadenas:

A ayuda a B.
B ayuda a C.
C ayuda a A.

O cadenas más largas:

A ayuda a B.
B ayuda a C.
C ayuda a D.
D ayuda a A.

Pero yo limitaría el MVP a ciclos de 3 y grupos de máximo 5. Más allá de eso se vuelve difícil de ejecutar.

El cuarto sería el **motor de oportunidades grupales**.

Este no busca ciclos perfectos, sino “roles” para crear algo:

Evento: local + producto + contenido + audiencia + experiencia.
Pop-up: espacio + marca + difusión + diseño + logística.
Validación: producto + clientes piloto + encuesta + contenido + canal.
Campaña local: historia + medio + punto físico + entrega.
Compra agregada: demanda común + proveedor + umbral + condiciones.

El quinto sería el **motor de riesgo y revisión manual**.

La IA no debería aprobar sola. Debería decir:

“Este match parece bueno, pero falta verificar stock.”
“Este triángulo tiene valor claro, pero uno de los nodos tiene reputación baja.”
“Esta compra agregada puede tener riesgo de competencia porque agrupa a competidores del mismo sector.”
“Esta propuesta implica pagos; usar proveedor de pagos externo.”
“Este producto puede ser regulado; revisar antes.”

Este motor es clave porque Empuje no solo debe encontrar oportunidades. Debe evitar malas oportunidades.

### 3. Fórmula de scoring

Usaría una puntuación de 0 a 100 con componentes visibles.

Por ejemplo:

**Score de match = encaje + capacidad + evidencia + reputación + geografía + urgencia + equilibrio + bajo riesgo**

Más concretamente:

Encaje oferta/necesidad: 25 puntos.
Disponibilidad/capacidad: 15 puntos.
Evidencia/verificación: 15 puntos.
Reputación/cumplimiento: 15 puntos.
Cercanía geográfica o logística: 10 puntos.
Urgencia compatible: 5 puntos.
Equilibrio de valor: 10 puntos.
Riesgo bajo: 5 puntos.

Y luego penalizaciones:

Producto no verificado: -15.
Capacidad agotada: -25.
Reputación baja: -10.
Categoría sensible: -20.
Posible riesgo legal: -30 y revisión obligatoria.
Necesidad demasiado vaga: -10.
Usuario que consume mucho y aporta poco: -10 o limitación de solicitudes.

La automatización no debería ser “la IA decide”. Debería ser:

**el sistema genera candidatos, explica el porqué, muestra riesgos, y tú apruebas.**

### 4. Pipeline operativo del motor

El flujo sería así:

1. Usuario crea o actualiza oferta/necesidad.
2. Sistema clasifica automáticamente.
3. Sistema pide datos que faltan.
4. Sistema genera aristas de valor.
5. Sistema calcula matches directos.
6. Sistema busca triángulos/ciclos.
7. Sistema detecta grupos por plantillas.
8. Sistema detecta clusters de compra común.
9. Sistema puntúa cada oportunidad.
10. Sistema separa en tres colas:

**Auto-sugerible al usuario**: bajo riesgo, no requiere intro directa.
**Revisión admin**: buen match pero falta verificación o coordinación.
**Bloqueado**: riesgo legal, producto sensible, pago complejo, falta evidencia crítica.

Esto permite automatizar mucho sin perder control.

### 5. La nueva categoría: compra agregada

Lo que planteas es muy interesante. No es un match triangular. Es otro tipo de oportunidad:

**match por demanda común.**

Ejemplo:

10 cafeterías necesitan vasos compostables.
8 marcas necesitan packaging.
12 entrenadores necesitan material básico.
7 tiendas necesitan transporte local.
5 estudios necesitan seguro, gestoría o impresión.
20 marcas pequeñas necesitan cajas, etiquetas o fotografía de producto.

Empuje podría detectar que muchos usuarios tienen la misma necesidad y crear una “ronda de compra”.

Yo no lo llamaría cooperativa. Lo llamaría:

**Ronda de compra**
**Compra agregada**
**Demanda agrupada**
**Lote Empuje**
**Mesa de compra**

La propuesta de producto sería:

“Empuje detecta necesidades repetidas entre pequeños negocios y abre rondas de compra con proveedores verificados, sin que cada usuario tenga que negociar solo.”

Esto amplía muchísimo Empuje porque ya no depende solo de que A ayude a B. También puede crear valor agrupando demanda.

### 6. Cómo debería funcionar una compra agregada en el MVP

La versión más segura sería esta:

1. El sistema detecta que muchos usuarios necesitan lo mismo.
2. Empuje crea una “ronda de interés” no vinculante.
3. Los usuarios se apuntan indicando cantidad estimada, ciudad, plazo y condiciones.
4. Empuje muestra demanda agregada anonimizada.
5. Proveedores verificados envían oferta.
6. Empuje compara condiciones.
7. Cada usuario decide si acepta individualmente.
8. El proveedor factura directamente a cada comprador.
9. Empuje cobra una comisión de servicio o una tarifa fija por gestión.
10. Empuje no toca el dinero de la compra ni se convierte en comprador/revendedor.

Esto es importante: **Empuje debería empezar como facilitador, no como comprador central**.

Si Empuje compra al proveedor y revende a los usuarios, entra en otra liga: IVA sobre compraventa, responsabilidad de producto, devoluciones, logística, impagos, stock, garantías y más riesgo operativo. Si Empuje solo intermedia y cobra por servicio, el modelo es más ligero.

### 7. Tres niveles de compra agregada

Yo lo dividiría en tres modelos.

**Modelo A: demanda agrupada ligera**

Empuje solo detecta demanda y presenta proveedores.
No hay compromiso vinculante hasta que cada usuario acepta.
El proveedor factura a cada comprador.
Empuje cobra fee de gestión o comisión transparente.
Este es el modelo para empezar.

**Modelo B: acuerdo marco**

Empuje negocia unas condiciones generales con un proveedor, pero cada usuario compra individualmente.
Ejemplo: “Miembros de Empuje tienen acceso a precio X hasta Y unidades este mes.”
Empuje puede cobrar al proveedor por canal o al usuario por gestión.
Riesgo medio. Necesita términos claros.

**Modelo C: central de compras / reseller**

Empuje compra, agrupa pagos, revende o distribuye.
Mayor margen potencial.
Mucho más riesgo legal, fiscal, financiero y operativo.
Yo no empezaría aquí.

### 8. Legalmente, ¿puede hacerse?

Puede hacerse, pero con cuidado. El gran riesgo no es “parecer cooperativa”. El gran riesgo es **competencia, pagos y responsabilidad comercial**.

En España, la Ley de Defensa de la Competencia prohíbe acuerdos, decisiones colectivas o prácticas concertadas que tengan por objeto o puedan producir el efecto de restringir o falsear la competencia, incluyendo la fijación directa o indirecta de precios u otras condiciones comerciales. Esto es relevante si Empuje agrupa a empresas que son competidoras entre sí. ([BOE][1])

La Comisión Europea reconoce que los acuerdos de compra conjunta pueden existir y que incluso pueden ayudar a evitar interrupciones de suministro, pero también advierte que pueden generar problemas de competencia y que hay que analizar tanto el acuerdo horizontal entre compradores como los acuerdos verticales con proveedores. 

La CNMC también advierte en su guía para asociaciones empresariales sobre riesgos de decisiones colectivas relativas a precios, reparto de mercados, condiciones comerciales o intercambio de información comercial sensible y desagregada, como facturación, precios, costes, clientes o inversiones. ([CNMC][2])

Traducido a Empuje:

Puedes agrupar demanda para comprar mejor.
Pero no debes permitir que competidores compartan información sensible.
No debes permitir que pacten precios de venta al cliente final.
No debes recomendar precios de reventa.
No debes facilitar reparto de clientes, zonas o mercados.
No debes permitir boicots coordinados a proveedores.
No debes crear una mesa donde competidores hablen de márgenes, ventas, costes internos o estrategia comercial.

### 9. Qué información sí y no debería compartir Empuje

Para compras agregadas, Empuje debería mostrar información agregada, no individual sensible.

Sí:

“Hay 18 negocios interesados en packaging compostable.”
“Demanda total estimada: 4.000 unidades.”
“Zonas: Madrid, Valencia, Barcelona.”
“Plazo deseado: próximas 4 semanas.”
“Rango de calidad: básico, medio, premium.”
“Condiciones mínimas: factura, entrega, devolución.”

No:

“Cafetería X compra 800 unidades al mes.”
“Marca Y tiene margen del 40%.”
“Todos vendemos a este precio.”
“Vamos a dejar de comprar a este proveedor.”
“Pactemos cuánto cobrar al cliente final.”
“Repartamos zonas o clientes.”
“Estos son mis costes exactos y mi volumen de venta.”

La compra agregada debe ser un mecanismo de eficiencia, no una herramienta de coordinación entre competidores.

### 10. Cómo evitar riesgo de competencia

Diseñaría reglas duras:

Los participantes no pueden ver datos individuales de otros compradores salvo que sea necesario.
No se permite discutir precios de reventa.
No se permite hablar de márgenes, clientes, volúmenes históricos o estrategia comercial.
Los proveedores compiten entre sí por condiciones claras.
Cada usuario decide individualmente si compra.
No hay obligación de exclusividad.
No hay boicot coordinado a proveedores.
No hay recomendación de precios finales.
Empuje registra la finalidad de la ronda: conseguir eficiencia de compra o acceso a mejores condiciones, no coordinar el mercado.
Las rondas con competidores directos pasan por revisión legal si superan cierto volumen o sensibilidad.

También metería un aviso dentro de la interfaz:

“Esta ronda no permite coordinar precios de venta, reparto de clientes, márgenes ni estrategia comercial. Empuje solo agrega demanda para solicitar condiciones de suministro.”

### 11. Pagos: cuidado con tocar dinero

Aquí hay otro punto importante.

Si Empuje empieza a guardar saldo, emitir créditos aceptados por terceros, custodiar dinero o hacer escrow, puede acercarse a regulación de servicios de pago o dinero electrónico. La Ley 21/2011 define el dinero electrónico como valor monetario almacenado electrónicamente que representa un crédito sobre el emisor, emitido al recibir fondos y aceptado por una persona distinta del emisor. ([BOE][3])

Además, el Real Decreto-ley 19/2018 regula servicios de pago y establece un sistema de autorización para el acceso a la prestación de servicios de pago. ([BOE][4])

Por eso, para MVP:

No custodiar dinero.
No crear wallet.
No crear saldo transferible.
No hacer escrow propio.
No cobrar a compradores para luego pagar al proveedor desde la cuenta de Empuje.

Mejor:

El proveedor factura directamente al comprador.
El comprador paga al proveedor.
Empuje cobra una comisión de gestión al proveedor o al comprador, separada.
Si algún día hay pagos integrados, usar un PSP/licencia externa tipo marketplace, no dinero en una cuenta propia.

### 12. Fiscalidad y facturación

En el modelo ligero, Empuje prestaría un servicio de intermediación, coordinación o acceso a ronda. Eso se facturaría como servicio. La AEAT recuerda que para saber si una prestación de servicios está sujeta al IVA español hay que atender a las reglas de localización y al tipo de servicio; en comercio exterior y prestaciones de servicios existen reglas particulares. ([Agencia Tributaria][5])

La distinción importante es:

Si Empuje solo intermedia, factura su servicio o comisión.
Si Empuje compra y revende, ya no es solo intermediario: entra en compraventa de bienes, IVA sobre operaciones, posibles garantías, devoluciones y responsabilidad sobre producto.
Si Empuje actúa en nombre propio, el riesgo y la fiscalidad cambian mucho.
Si el proveedor factura a cada comprador, el MVP es más simple.

### 13. Productos que sí y productos que evitaría

Para compras agregadas, empezaría con categorías de bajo riesgo:

Packaging.
Imprenta.
Material de oficina.
Herramientas digitales.
Servicios de fotografía.
Logística local.
Café/consumibles para hostelería, con cuidado.
Merchandising.
Diseño o producción de etiquetas.
Material deportivo básico no regulado.
Limpieza no peligrosa.
Mobiliario ligero.

Evitaría al principio:

Alcohol.
Tabaco o nicotina.
Medicamentos o suplementos.
Armas o productos de defensa.
Productos químicos peligrosos.
Productos sanitarios o de protección regulados si no hay asesoría.
Alimentos perecederos sin estructura logística.
Servicios financieros, seguros o energía sin asesoría específica.
Cualquier cosa con licencias especiales.

En el caso de deportes de contacto, vender vendas, combas, guantes o protectores básicos puede ser viable, pero Empuje debería verificar que no se ofrecen armas, artículos regulados, promesas médicas o productos que requieran certificaciones específicas.

### 14. Cómo se vería como tipo de match en el sistema

Yo añadiría una nueva familia:

**Tipo de match: Compra agregada**

Tendría estos campos:

Categoría del producto.
Especificación mínima.
Cantidad individual estimada.
Cantidad agregada objetivo.
Número mínimo de participantes.
Fecha límite de adhesión.
Ciudad o zona.
Proveedor candidato.
Precio individual estimado.
Precio agregado estimado.
Ahorro estimado.
Condiciones de entrega.
Necesidad de factura.
Riesgo legal.
Riesgo operativo.
Estado de verificación.

Estados:

Detectada.
Ronda abierta.
Umbral alcanzado.
Proveedor solicitado.
Oferta recibida.
En decisión individual.
Cerrada.
Cancelada.
Bloqueada por riesgo.

Ejemplo:

“Ronda: packaging para marcas emergentes.”
12 marcas interesadas.
Volumen estimado: 3.500 cajas.
Umbral mínimo: 2.000 cajas.
Proveedor: pendiente.
Riesgo competencia: bajo si no son competidores directos o no comparten datos sensibles.
Riesgo pago: bajo si cada uno paga al proveedor.
Empuje cobra: 5% al proveedor o 9 € por comprador.

### 15. Monetización de compras agregadas

Aquí hay varias opciones.

La más limpia:

**Fee fijo por participación**

Ejemplo: “Participar en una ronda cerrada cuesta 5-15 € si se alcanza el umbral.”
Ventaja: transparente.
Desventaja: puede frenar a usuarios pequeños.

Otra opción:

**Comisión del proveedor**

Proveedor paga 3-8% sobre ventas generadas.
Ventaja: el comprador lo percibe como gratuito.
Riesgo: Empuje puede parecer incentivado a recomendar al proveedor que más paga.

Para evitar conflicto, haría esto:

Comisión fija y transparente por categoría.
O tarifa plana al proveedor por ronda cerrada.
No permitir que el proveedor pague más para aparecer como “mejor”.
Ranking de proveedores por condiciones reales, reputación y cumplimiento, no por comisión.

Otra opción:

**Compra agregada incluida en planes superiores**

Semilla: puede ver rondas.
Activo: puede participar en 1 ronda/mes.
Crecimiento: 3 rondas/mes.
Operador: crear rondas privadas.
Concierge: Empuje te monta una ronda específica.

Esta encaja mejor con el modelo recurrente.

### 16. ¿Debe Empuje meterse en esto?

Mi respuesta: **sí, pero no desde el día uno como comprador o central de compras.**

Primera fase:

Empuje solo detecta demanda común y organiza rondas no vinculantes.
Cada usuario decide individualmente.
El proveedor factura individualmente.
No se comparte información sensible.
No se toca dinero.
No se negocian precios de reventa.
Revisión manual obligatoria para rondas con competidores directos.

Segunda fase:

Empuje negocia acuerdos marco con proveedores.
Los usuarios compran individualmente bajo condiciones pactadas.
Empuje cobra fee transparente.
Más automatización y scoring de proveedores.

Tercera fase, solo si el negocio lo justifica:

Empuje como operador de compra gestionada, con asesoría legal, fiscal, pagos, contratos, seguro y compliance.
No antes.

### 17. Automatización específica para compras agregadas

El motor debería detectar clusters así:

Muchos usuarios tienen necesidad similar.
La necesidad pertenece a categoría comprable.
Las cantidades son agregables.
Los plazos son compatibles.
La geografía es compatible.
No hay riesgo alto de competencia.
El producto no es regulado o sensible.
Hay proveedores candidatos.
El ahorro o valor esperado supera un umbral.

Ejemplo de regla:

Si 8 usuarios o más necesitan “packaging” en 45 días, y la suma estimada supera 1.000 unidades, y no hay categoría sensible, crear ronda sugerida.

Otro ejemplo:

Si 5 usuarios de una ciudad necesitan “fotografía de producto”, no es compra de producto, pero sí puede ser “contratación agregada”: negociar un día de shooting compartido con un fotógrafo.

Esto abre mucho el abanico:

Compra agregada de producto.
Contratación agregada de servicios.
Campañas compartidas.
Eventos compartidos.
Logística compartida.
Herramientas compartidas.
Formación compartida.
Espacios compartidos.

### 18. Arquitectura técnica del sistema de matches

Base de datos mínima:

Usuarios.
Ofertas.
Necesidades.
Evidencias.
Capacidades.
Disponibilidad.
Reputación.
Matches candidatos.
Aristas de valor.
Rondas de compra.
Proveedores.
Ofertas de proveedores.
Acuerdos.
Reviews.

Automatización:

Un job diario recalcula aristas.
Un job diario busca ciclos.
Un job semanal detecta clusters de necesidad común.
Un modelo de embeddings detecta similitud semántica.
Un clasificador por reglas normaliza categorías.
Un LLM genera explicación y mensaje sugerido.
Un motor de riesgo marca bloqueos.
Un admin aprueba o descarta.

El LLM no debería tener libertad total. Debería recibir datos estructurados y devolver JSON:

Tipo de oportunidad.
Participantes.
Score.
Qué aporta cada uno.
Qué recibe cada uno.
Riesgos.
Evidencias faltantes.
Siguiente paso.
Mensaje sugerido.
Razón de bloqueo si existe.

### 19. Categorías de matches que debería tener Empuje

Yo definiría estas:

**Match directo**
A tiene algo que B necesita y B puede compensar.

**Match triangular**
A ayuda a B, B ayuda a C, C ayuda a A.

**Match grupal**
Varios perfiles cubren roles de una oportunidad.

**Match semilla**
Alguien en fase inicial necesita su primera validación y otros pueden darle producto, feedback, canal, contenido o cliente piloto.

**Match de capacidad sobrante**
Alguien tiene un recurso infrautilizado durante tiempo concreto.

**Match de compra agregada**
Varios usuarios comparten una necesidad de compra o contratación.

**Match de proveedor**
Un proveedor externo puede cubrir una necesidad agregada de la red.

**Match de campaña**
Varios usuarios crean una acción pública: evento, pop-up, newsletter, pack, ruta local.

Esta taxonomía hace que Empuje deje de ser “una web de colaboraciones” y se convierta en un **sistema operativo de oportunidades para pequeños negocios**.

### 20. Qué haría ahora

Para no quemar el producto, haría dos MVPs paralelos:

**MVP A: motor de matches automatizado**

Objetivo: con 50 perfiles, generar 20 matches candidatos, 8 revisados y 3 acuerdos ejecutados.

Sin pagos complejos.
Sin compras agregadas todavía.
Solo directos, triángulos y grupos.

**MVP B: compra agregada ligera**

Objetivo: detectar una necesidad común real y abrir una ronda no vinculante.

Ejemplo:

“Packaging para marcas emergentes.”
“Fotografía de producto compartida.”
“Material básico para entrenadores y microtiendas deportivas.”
“Impresión de flyers/cartelería para negocios locales.”
“Logística local para tiendas pequeñas.”

Sin tocar dinero.
Sin que los usuarios compartan información sensible.
Con proveedor facturando individualmente.
Con Empuje cobrando fee de gestión o comisión transparente.

### 21. Mi recomendación final

Sí metería compras agregadas en la visión de Empuje, porque amplía muchísimo el valor de la plataforma.

Pero lo metería con esta regla:

**Empuje no compra por los usuarios. Empuje detecta demanda común, organiza rondas, verifica proveedores y facilita condiciones.**

Y esta otra:

**Empuje no permite coordinación comercial entre competidores. Solo agregación segura de demanda.**

Si lo haces bien, abre una línea enorme:

Matches de crecimiento.
Matches de validación.
Matches de confianza.
Matches de compra.
Matches de proveedores.
Matches de campañas.

Eso convierte Empuje en algo más grande que una red de favores: una infraestructura para que pequeños negocios accedan a ventajas que normalmente solo tienen empresas con red, volumen o equipo.

[1]: https://www.boe.es/buscar/act.php?id=BOE-A-2007-12946 "BOE-A-2007-12946 Ley 15/2007, de 3 de julio, de Defensa de la Competencia."
[2]: https://www.cnmc.es/sites/default/files/1185648_7.pdf "guia de asociaciones"
[3]: https://www.boe.es/buscar/act.php?id=BOE-A-2011-12909 "BOE-A-2011-12909 Ley 21/2011, de 26 de julio, de dinero electrónico."
[4]: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16036 "BOE-A-2018-16036 Real Decreto-ley 19/2018, de 23 de noviembre, de servicios de pago y otras medidas urgentes en materia financiera."
[5]: https://sede.agenciatributaria.gob.es/Sede/iva/iva-operaciones-comercio-exterior/prestaciones-servicios.html "Agencia Tributaria: Prestaciones de servicios"

# Estrategia de comunidades privadas de VitaGloss RD

Estado: guía operativa interna. Cada mensaje, activo y afirmación debe validarse contra las reglas y fuentes oficiales vigentes para República Dominicana.

## Decisión de arquitectura

VitaGloss RD no usará un único grupo para mezclar clientes, interesados en el negocio y vendedores activos. Cada audiencia tendrá un propósito, acceso y contenido distintos.

| Espacio | Audiencia | Canal principal | Objetivo |
|---|---|---|---|
| Círculo VitaGloss RD \| Clientes | Clientes y personas que pidieron orientación sobre productos | Grupo privado de Facebook | Educación oficial, uso responsable, soporte y recompra por MyShop |
| Orientación VitaGloss RD \| Conoce el negocio Amway | Personas que solicitaron voluntariamente información sobre el negocio | Grupo privado de Facebook o sesión privada temporal | Explicar con transparencia el modelo de venta directa, responsabilidades y proceso oficial |
| Equipo VitaGloss RD \| IBO activos | Empresarios Independientes confirmados en la línea de auspicio | Academia protegida `/academia` y canal privado de avisos | Formación, cumplimiento, herramientas, seguimiento y operación del equipo |

WhatsApp se usará principalmente para atención individual, listas de difusión con consentimiento y avisos. No se añadirá a nadie a un grupo sin aceptación expresa; en un grupo de WhatsApp los participantes pueden ver los números de los demás.

## Recorrido de cada persona

### Cliente

`Contenido público aprobado → consulta voluntaria → orientación individual → invitación aceptada al grupo de clientes → MyShop → seguimiento poscompra`

- El contenido público informa; no incluye llamados públicos de compra ni reclutamiento cuando las reglas no lo permitan.
- La invitación al grupo se realiza después de una conversación y con consentimiento.
- El cliente recibe el enlace oficial de MyShop y decide qué comprar directamente.
- Una persona interesada solo en productos no se mueve automáticamente al recorrido de vendedores.

### Persona interesada en el negocio

`Interés expresado voluntariamente → conversación individual → consentimiento → orientación privada → decisión informada → registro oficial en Amway`

- Se presenta claramente como un negocio de venta directa de Amway, no como empleo, salario, inversión pasiva ni mentoría remunerada.
- Se explican esfuerzo, responsabilidades, costos y resultados variables sin promesas de ingresos o plazos de éxito.
- El registro se inicia únicamente después de resolver preguntas y mediante los canales oficiales de Amway.
- Los materiales marcados “Solo para uso de IBO” nunca se comparten con prospectos.

### Vendedor o IBO activo

`Registro y confirmación oficial → verificación manual → acceso a academia → incorporación de 7 días → seguimiento semanal`

- El administrador confirma identidad, número de IBO y pertenencia a la línea antes de habilitar el acceso.
- La academia concentra módulos y documentos; WhatsApp o Facebook solo distribuyen avisos y conversación.
- Si deja de pertenecer al equipo, se revoca el acceso a los espacios internos.

## Contenido permitido por espacio

### Círculo de clientes

- Educación de producto tomada de fuentes oficiales del mercado.
- Cómo usar MyShop, elegir una categoría y solicitar orientación.
- Rutinas, preguntas frecuentes y acompañamiento poscompra sin afirmaciones médicas propias.
- Novedades y promociones solo cuando estén autorizadas y sean aplicables al mercado.

No se publican materiales internos de IBO, Plan de Ventas, captación de vendedores ni promesas de resultados de salud.

### Orientación sobre el negocio

- Qué es y qué no es el negocio Amway.
- Diferencia entre cliente, vendedor e IBO.
- Responsabilidades, esfuerzo, costos y proceso de registro oficial.
- Preguntas y respuestas basadas en documentos oficiales para prospectos.

No se publican cifras extraordinarias, estilo de vida, urgencia, presión, testimonios de ingresos ni materiales exclusivos para IBO.

### Equipo IBO

- Formación oficial de Amway y reglas de conducta.
- Uso responsable de redes, MyShop y seguimiento de clientes.
- Guías operativas internas, objetivos de actividad y revisión de casos.
- Materiales identificados expresamente como exclusivos para IBO.

## Reglas fijadas en todos los grupos

1. Identidad y propósito del grupo visibles en la descripción.
2. Acceso voluntario; no añadir contactos sin consentimiento.
3. Trato respetuoso, sin spam ni mensajes privados no solicitados.
4. No hacer afirmaciones médicas, diagnósticos o promesas de curación.
5. No prometer ingresos, resultados garantizados ni fechas de éxito.
6. No vender productos ajenos ni publicar enlaces no autorizados.
7. No descargar ni reutilizar fotos, datos o testimonios de miembros sin permiso.
8. Los administradores pueden corregir o retirar contenido que incumpla las reglas.
9. Las conversaciones privadas siguen sujetas a las mismas normas de contenido.

## Incorporación de siete días

### Clientes

1. Bienvenida, propósito y reglas.
2. Cómo comprar directamente mediante MyShop.
3. Selección de interés: nutrición, cuidado personal, belleza u hogar.
4. Educación oficial sobre una categoría.
5. Uso y preguntas frecuentes.
6. Sesión de preguntas y respuestas.
7. Seguimiento individual sin presión.

### Interesados en el negocio

1. Qué es y qué no es la oportunidad.
2. Venta directa, productos y clientes reales.
3. Responsabilidades, tiempo y esfuerzo.
4. Costos y documentación oficial aplicable.
5. Reglas de comunicación y cumplimiento.
6. Preguntas individuales.
7. Decisión informada: continuar, posponer o cerrar el seguimiento.

### IBO activos

1. Acceso, identidad y reglas del equipo.
2. Amway Education y fuentes oficiales.
3. Cumplimiento digital y mensajes permitidos.
4. Primera conversación con un cliente.
5. MyShop y herramientas de seguimiento.
6. Plan semanal de actividad responsable.
7. Revisión con el auspiciador.

## Cadencia mínima

| Audiencia | Cadencia |
|---|---|
| Clientes | Martes: educación oficial; jueves: uso o preguntas; sábado: soporte o recordatorio opcional |
| Interesados | Una orientación privada programada y una sesión de preguntas; sin captación constante |
| IBO activos | Lunes: prioridades; miércoles: formación; viernes: revisión de actividad sin afirmaciones de ingresos |

## Registro y automatización

El panel de leads debe incorporar, en una fase posterior:

- `audienceType`: `customer`, `business_prospect` o `ibo`.
- `source`: Instagram, Facebook, WhatsApp, recomendación, web u otra fuente comprobable.
- `consentAt` y `consentSource`.
- `communityStatus`: no invitado, invitado, aceptó, activo, salió o removido.
- `joinedAt`, `leftAt` y `nextActionAt`.
- `amwayStatus`: no aplica, orientación, registro pendiente o IBO confirmado.

La primera versión será de invitación manual. Solo se automatizarán bienvenidas y recordatorios para contactos que hayan dado consentimiento; no se automatizará prospección masiva ni la publicación sin revisión humana.

## Indicadores útiles

- Clientes: aceptación voluntaria, participación, clics a MyShop, recompra y consultas resueltas.
- Interesados: orientaciones completadas, preguntas atendidas y decisiones informadas; no volumen de reclutamiento.
- IBO: incorporación completada, módulos vistos, seguimiento de clientes y actividad comercial real.
- Cumplimiento: piezas revisadas, fuentes archivadas, correcciones y bajas atendidas.

## Orden de implementación

1. Crear `Círculo VitaGloss RD | Clientes` como grupo privado de Facebook y publicar reglas y bienvenida.
2. Preparar el espacio privado de orientación; abrirlo solo cuando haya interesados con consentimiento.
3. Mantener `/academia` como biblioteca exclusiva para IBO y verificar accesos existentes.
4. Crear listas de difusión separadas en WhatsApp para clientes e IBO que las acepten.
5. Añadir la clasificación y el consentimiento al panel antes de automatizar invitaciones.
6. Revisar mensualmente miembros, permisos, publicaciones y fuentes.

## Regla final

Una comunidad privada facilita la orientación, pero no elimina las obligaciones de cumplimiento. Si una afirmación, imagen, documento o invitación no tiene fuente, permiso o audiencia claramente definida, no se publica.

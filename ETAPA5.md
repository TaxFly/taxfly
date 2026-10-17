# Etapa 5 — disponibilidad offline y actualizaciones

Entrega acumulada de las cinco etapas. No publicada. Se detiene el trabajo al terminar esta etapa.

## Causas comprobadas

- assets/reconnect.js recargaba la pantalla 1,2 segundos después de recuperar conexión, incluso con formularios en edición. Inicio también recargaba al cambiar el controlador del service worker.
- El worker ejecutaba skipWaiting durante la instalación y clients.claim durante la activación, además de reemplazar HTML y scripts/traducciones desde la red en forma independiente. Una pestaña abierta podía combinar recursos de dos versiones.
- Un fallback HTML usaba una promesa como alternativa con || sin esperar su resultado; podía impedir llegar al documento offline.
- El panel decía “Sincronizado” por tener cero operaciones en algunas colas. No contaba todas las escrituras de Planificación, ni los borrados de equipaje. Además, un sello de preparación antiguo se usaba como evidencia general sin separar las pantallas de los datos.
- La preparación de Reservas usaba una clave sin UID que no coincidía con el lector. Los archivos se consideraban completos por tener algún contenido, sin verificar todos sus fragmentos declarados.
- La descarga de preparación y el descubrimiento de documentos usaban algunas claves calculadas después de esperas asincrónicas, con riesgo de mezclar contextos al cambiar de perfil.

## Cambios

### Actualizaciones sin abandonar el trabajo

- La reconexión verifica el servidor y reintenta las colas en la pantalla actual. No recarga ni navega. Se expone el reintento ya existente de Gastos para esa vía.
- El reintento global comparte una sola ejecución ante llamadas simultáneas y también invoca los reintentos de la sección abierta. Los temporizadores se reemplazan al iniciar un nuevo intento.
- Las versiones nuevas del worker se instalan en espera, sin skipWaiting ni toma de control de pestañas abiertas. El panel de Ajustes informa si hay una versión esperando y explica que hay que cerrar todas las pestañas de TaxFly y volver a abrir después de guardar.
- Inicio conserva la pantalla ante controllerchange. No se añadieron recargas, borrado de datos, ni almacenamiento nuevo de formularios.

### Código y traducciones de una misma versión

- La instalación descarga los recursos obligatorios con cache:reload; un fallo mantiene la instalación anterior.
- Las pantallas, scripts, CSS y diccionarios locales precargados se sirven desde el caché de la versión activa. No se reemplazan individualmente desde una publicación más reciente.
- Si falta un recurso por expulsión del caché, solo se repara desde la red después de verificar que el worker publicado declara la misma versión. Si es otra versión, no se mezcla código; un documento puede usar la pantalla de respaldo y un script falla de forma explícita.
- Se corrigió el fallback con búsquedas esperadas correctamente. El probe de conectividad evita el caché; los servicios actuales siguen por red. Los recursos locales que contienen “recaptcha” en el nombre ya no quedan excluidos del caché por el filtro de servicios externos.
- OFFLINE_STATUS devuelve el estado de los recursos obligatorios y su versión. La versión del caché se calcula con el script existente a partir de los archivos incluidos.

### Estados offline verificables

- El panel separa conexión de red, pantallas guardadas, última descarga de datos, documentos completos y funciones que requieren internet.
- “Sincronizado” y “Sincronizando” dejan de inferirse del tamaño de la cola. Se muestran “Cambios pendientes”, “Guardado en este dispositivo”, “Necesita atención” o “Sin cambios pendientes detectados”. Una nota aclara que los cambios del servidor se verifican al conectar.
- El contador compartido incluye las operaciones de gastos, lugares, viaje/grupo, documentos y equipaje, y cada documento pendiente de Planificación se cuenta una sola vez. Respeta las claves de cuenta/perfil/viaje disponibles en cada cola.
- Un sello anterior sin el esquema verificado no certifica disponibilidad de los datos de Planificación. Las pantallas se comprueban por separado, sin confundir la fecha de descarga con la de la versión del código.
- Las respuestas antiguas del panel se descartan por generación/contexto para que no reemplacen una consulta más reciente.

### Descargas y documentos

- La preparación utiliza la clave de Reservas con UID y respeta las ediciones pendientes de Planificación.
- Las escrituras de preparación y descubrimiento fijan sus claves y comprueban el contexto antes de guardar o certificar resultados.
- Los documentos seleccionados se vuelven a descargar y se verifica cantidad e integridad posicional de los fragmentos antes de marcar la copia como verificada. Se conserva compatibilidad con el formato anterior de fragmentos en línea. No basta con concatenar una lista parcial ni con encontrar el mismo número de archivos.
- Las copias anteriores se conservan si una descarga falla. Los archivos antiguos sin esa verificación requieren prepararse nuevamente para obtener el indicador de disponibilidad.

## Idiomas, estética y contenido

Todos los mensajes nuevos se incorporaron al diccionario ES/EN/PT que ya usa el panel. Se respeta appLang y se actualiza también el encabezado al cambiar de idioma. No hay consultas a traductores. Las pantallas y diccionarios forman parte del mismo caché de aplicación.

Los archivos CSS externos son idénticos a la etapa 4. Las tres páginas HTML modificadas solo incorporan el helper offline existente para compartir el contador; no cambian su estructura visual. No se modificaron itinerarios, nombres, fechas, marcas o datos personales guardados.

## Archivos afectados

- `assets/compras.js`
- `assets/index-app.js`
- `assets/offline-status.js`
- `assets/reconnect-sync.js`
- `assets/reconnect.js`
- `assets/travel-tools.js`
- `grupo.html`
- `rutas.html`
- `sw.js`
- `tax.html`
- `tests/flow.test.cjs`
- `tests/offline-updates.test.cjs`

Este registro y ETAPA5.patch permiten continuar o revisar sin repetir el análisis.

## Verificación

- 13 pruebas nuevas: instalación sin activación forzada; coherencia de HTML/JS/traducciones; caché incompleto y reparación de la misma versión; probes y servicios actuales; evidencia de recursos/versiones; reconexión sin navegación; colas y contexto; preparación y Reservas con UID; perfil cambiado durante preparación; fragmentos ausentes y formato anterior; traducciones y estados; ejecución única de reintentos.
- 83 comprobaciones enfocadas aprobadas, cero fallos.
- Suite completa: 206 pruebas, 182 aprobadas, los mismos 24 fallos anteriores. Comparados sus nombres con la etapa 4: no se agregaron fallos.
- Se actualizaron tres escenarios existentes de tests/flow.test.cjs para verificar el comportamiento pedido: esperar la activación, conservar HTML coherente y reconectar sin recargar. Se mantienen las comprobaciones de fallo de instalación y de actualización del hash.
- Sintaxis comprobada en los siete archivos JavaScript modificados. Integridad del ZIP comprobada.

Comandos:

```
node --test tests/offline-updates.test.cjs tests/section-connections.test.cjs tests/visual-stability.test.cjs tests/performance-loading.test.cjs tests/loading-state.test.cjs tests/travel-improvements.test.cjs
npm test
node scripts/bump-cache.js --check
```

## Límites y comprobaciones pendientes antes de publicar

No hubo despliegue ni acceso a Firebase real. Los tests usan el código real con adaptadores de navegador, red, caché, almacenamiento y SDK. No equivalen a pruebas de un service worker instalado en Chrome/Edge ni verifican expulsión real de caché, cuotas o restricciones de persistencia del navegador.

Sigue pendiente la comparación visual antes/después en escritorio y celular, en los tres idiomas: el acceso al archivo local del navegador fue rechazado en una etapa anterior y no se eludió esa restricción.

La primera migración desde una versión antigua debe probarse cerrando todas las pestañas. Hasta que la nueva versión se active, el worker antiguo conserva su política anterior. A partir de esta entrega la actualización espera al cierre de las pestañas; no se fuerza con trabajo abierto.

La preparación no promete mapas completos, datos meteorológicos actuales, filas, cotizaciones o Taxie sin internet. Las copias de documentos corresponden a lo descargado y no certifican que el servidor no haya cambiado después. “Sin cambios pendientes detectados” no certifica que el servidor esté alcanzable ni que no existan escrituras internas del SDK aún no reflejadas en las colas de la aplicación.

No se reconciliaron duplicados históricos de colas antiguas ni se migraron claves heredadas sin dueño verificable. Los contadores de documentos locales heredados usan el esquema de perfil/viaje ya existente; esta etapa no redefine todas las claves de datos de la aplicación. Se mantienen los cambios de perfil/viaje y las recargas explícitas de sus flujos existentes; se retiraron las recargas automáticas causadas por reconexión y cambio de worker.

Siguiente paso sugerido: validación manual de las cinco etapas en un entorno de prueba accesible, sin publicar hasta revisar la transición de versiones y los formularios. No se inicia ninguna tarea adicional automáticamente.

# Mejoras de uso de TaxFly / TaxUSA

Se mantienen las etapas 1–5 y el pulido anterior. Este paquete agrega las cinco mejoras autorizadas, con los componentes y estilos existentes y textos de interfaz en español, inglés y portugués.

## Qué cambia

- Deshacer: reservas y paradas de Rutas usan el mecanismo compartido de seis segundos. Varios borrados se restauran en orden inverso, conservando el orden original, los identificadores y los vínculos. Una confirmación pendiente no puede borrar en otro contexto.
- Buscar en el viaje: nueva entrada en Más. Busca nombres, referencias y texto de reservas, documentos, paradas, eventos, notas y gastos. Ignora diferencias de mayúsculas y acentos. Los resultados enlazan al registro correspondiente. Las consultas empiezan al abrir el buscador; no agrega listeners permanentes.
- Documentos en la agenda: un bloque permite elegir un documento del mismo viaje y abrirlo desde su tarjeta. El documento seleccionado se conserva mientras carga la lista. Se mantiene el acceso existente desde reservas.
- Rutas: selección individual de las paradas antes de importarlas, seleccionar todas/ninguna y protección contra duplicados. Opción para ofrecer un enlace de regreso al alojamiento desde la última parada de cada día, sin agregarlo como visita.
- Formularios: borrador local de Rutas por cuenta, perfil y viaje; conserva alojamiento, fecha inicial, días, método de entrada, campos manuales, enlaces, CSV, paradas y opción de regreso. Respeta campos editados durante la carga. La última categoría de gasto también queda separada por contexto. Reservas ofrece reutilizar la dirección del alojamiento guardado mediante una acción explícita.

## Datos, errores e idiomas

El índice de búsqueda se separa por cuenta, perfil y viaje, y se muestra después de verificar la sesión autenticada. Las respuestas tardías no actualizan otro contexto. Las consultas fallidas conservan resultados previos; una consulta vacía desde caché no confirma ausencia de datos. Los resultados locales y las actualizaciones incompletas se indican en pantalla. El índice guarda texto y enlaces internos, sin archivos, recibos ni bloques binarios de documentos. No usa servicios de traducción. El contenido personal se mantiene literal.

Los recursos nuevos se incluyen en la caché de la app y su versión fue actualizada. La búsqueda offline depende de los metadatos ya disponibles en el dispositivo y de una sesión previamente autenticada; no convierte Maps ni servicios externos en funciones offline. Los borradores son locales y no se transfieren entre dispositivos.

## Validación

- 114 verificaciones enfocadas aprobadas, incluidas 24 nuevas sobre búsqueda, filtrado de viaje, caché parcial, sesión, respuestas tardías, cambios pendientes, selección de paradas, borradores, deshacer, documentos e idiomas.
- Suite completa: 237 verificaciones, 213 aprobadas y los mismos 24 fallos previos de Europa. No aparecieron fallos nuevos frente al paquete anterior.
- Comprobación de sintaxis de los 13 archivos JavaScript nuevos o modificados.
- Verificación adicional de caché y conexiones de las pantallas tras cerrar el paquete.
- Revisión estática de estilos: colores, tipografías, superficies y bordes reutilizan las variables existentes; buscador adaptable, texto con salto de línea, foco visible y menú con desplazamiento vertical.

No se realizó una comparación visual renderizada ni una prueba con Firebase real en esta entrega: el acceso de navegador local estaba bloqueado. Quedan por comprobar manualmente escritorio y móvil, los tres idiomas, apertura de documentos reales, destinos de los resultados y recuperación offline con la cuenta del usuario. No se desplegó ni publicó este paquete.

## Archivos de esta entrega

- `assets/app-shell.css`
- `assets/compras.js`
- `assets/localize.js`
- `assets/lugares.js`
- `assets/plan-app.js`
- `assets/plan-firebase.js`
- `assets/plan-i18n.js`
- `assets/plan-reservations.js`
- `assets/rutas-app.js`
- `assets/travel-tools.js`
- `assets/trip-search-core.js`
- `assets/trip-search.js`
- `assets/ui.js`
- `assets/ux.js`
- `compras.html`
- `grupo.html`
- `index.html`
- `lugares.html`
- `mis-cosas.html`
- `planificacion.html`
- `rutas.html`
- `sw.js`
- `tax.html`
- `tests/section-connections.test.cjs`
- `tests/trip-search-and-forms.test.cjs`
- `tests/visual-stability.test.cjs`
- `tickets.html`
- `unidades.html`

## Continuación

Publicar el contenido del ZIP mediante el flujo habitual. Después de guardar formularios abiertos, cerrar todas las pestañas de TaxFly y abrir de nuevo para recibir la nueva versión. Comprobar los escenarios manuales anteriores antes de dar por validada la experiencia visual. No se proponen más cambios automáticos.

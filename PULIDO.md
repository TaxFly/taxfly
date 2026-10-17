# Pulido visual y apertura de Planificación

Entrega acumulada: etapas 1 a 5 más las correcciones solicitadas a partir de las once capturas. Sin despliegue.

## Causas comprobadas

- Planificación y Mis cosas tenían su propio HTML/CSS de navegación, mientras el resto usaba el renderer de assets/ui.js. Por eso “Más” tenía iconos, colores, descripciones y espacios distintos.
- Los fondos radiales del body y las superficies del encabezado se superponían. La zona del logo tenía un tono azulado y una transición diferente al resto.
- El avatar de Inicio estaba en su encabezado mientras las otras páginas lo incluían en la navegación.
- Los filtros de Mis cosas siempre mostraban ambas flechas y estiraban la fila, incluso sin contenido que desplazar.
- Las categorías dependían de sustituir emojis; algunas llegaban sin emoji y quedaban sin icono. La leyenda del gráfico estaba limitada a cinco filas, mientras las barras incluían categorías con cero y topes.
- startApp de Planificación esperaba las dieciséis consultas iniciales, cada una con un máximo de seis segundos. Una consulta lenta de una sección secundaria bloqueaba la primera pantalla.

## Cambios visuales

- Un solo renderer de navegación para las pantallas, usando los mismos textos ES/EN/PT, iconos de colores, descripciones del menú Más, tamaños de botones y avatar. El nodo del botón de Ajustes se conserva con sus eventos y su foto.
- Planificación y Mis cosas reutilizan ese renderer en un modo limitado a la navegación: no se les agrega el observador que recorre y sustituye contenido del resto de la aplicación.
- assets/app-shell.css unifica el fondo exterior, la tipografía del logo y la navegación. El encabezado se vuelve transparente sobre ese fondo continuo; se conservan las tarjetas y sus degradados. La paleta del menú oscuro es la del menú común existente.
- Las flechas de Mis cosas aparecen solo si hay desbordamiento y se deshabilitan en los extremos. La fila mantiene el ancho de sus opciones cuando caben, con observación de tamaño y contenido, sin polling.
- Los nombres de categorías siguen siendo texto plano para opciones, búsquedas y comparación. Sus representaciones HTML incorporan SVG explícitos, incluido teléfono y estetoscopio.
- El gráfico muestra todas las categorías con gasto positivo. Las barras inferiores se reservan a las categorías con topes configurados, donde aportan información adicional y pueden mostrar cero. No se modifican gastos ni categorías guardadas.

## Apertura de Planificación

- Nuevo coordinador pequeño assets/plan-loading.js. Las dieciséis consultas siguen en paralelo, pero cada sección tiene su propia condición de disponibilidad.
- La agenda espera su itinerario; las atracciones esperan los documentos que usan; las comidas, el supermercado, los lugares y las reservas esperan los suyos. Una sección sin datos confirmados muestra carga o error, nunca un vacío anticipado.
- Las respuestas iniciales posteriores a la apertura se entregan a los mismos callbacks de los listeners. Los datos ya aceptados de un listener no se sustituyen por una respuesta inicial más vieja ni por su fallo.
- La migración de gastos antiguos espera el presupuesto correspondiente. Los indicadores de presupuesto también esperan ese documento para no omitir gastos de esa fuente durante la carga. La tarjeta del día espera Comidas.
- Se mantienen los controles de generación, cambios pendientes y errores. No se agregan demoras artificiales ni dependencias de terceros.

## Mediciones

PULIDO-mediciones.json registra tres muestras controladas en Node: documentos normales de 20 ms y un documento de supermercado de 200 ms, entrando a la agenda.

| Condición | Antes | Ahora |
| --- | ---: | ---: |
| Mediana hasta liberar la agenda | 200,71 ms | 20,42 ms |
| Consultas iniciales | 16 | 16 |

La mejora medida corresponde exclusivamente a quitar la espera por un documento ajeno a la agenda. No mide carga de navegador, autenticación, Firestore real, pintura o descarga de todas las secciones. No debe interpretarse como un porcentaje de mejora real de toda la aplicación. El script permite repetir las condiciones con --baseline apuntando a la versión anterior.

## Validación

- 7 pruebas nuevas: barrera independiente de la agenda; respuesta inicial tardía; estados de carga/error/vacío confirmado en el idioma elegido; flechas según desbordamiento; etiquetas de categorías sin contaminar texto plano; barras con topes; menú idéntico entre pantallas en ES/EN/PT conservando el nodo de Ajustes.
- 90 comprobaciones enfocadas aprobadas.
- Suite completa: 213 pruebas, 189 aprobadas y los mismos 24 fallos preexistentes. Sin nombres de fallos nuevos frente a etapa 5.
- Sintaxis comprobada en los JavaScript modificados. Caché actualizada e integridad del ZIP comprobada.
- No se alteraron itinerarios, fechas, nombres o descripciones personales. No hay traducción por red.

## Archivos afectados

- `assets/app-shell.css`
- `assets/compras.js`
- `assets/mis-cosas.js`
- `assets/plan-app.js`
- `assets/plan-firebase.js`
- `assets/plan-loading.js`
- `assets/plan-reservations.js`
- `assets/ui.js`
- `compras.html`
- `grupo.html`
- `index.html`
- `login.html`
- `lugares.html`
- `mis-cosas.html`
- `offline.html`
- `planificacion.html`
- `profiles.html`
- `rutas.html`
- `scripts/benchmark-plan-startup.cjs`
- `sw.js`
- `tax.html`
- `tests/polish.test.cjs`
- `tickets.html`
- `unidades.html`

## Pendientes y límites

La revisión de las capturas originales sí se hizo. La comparación visual del resultado renderizado sigue pendiente: no se eludió la restricción de acceso del navegador al archivo local. Las pruebas del menú comprueban su HTML compartido y las de filtros sus medidas simuladas, no sustituyen una comprobación visual en celular/escritorio. Tampoco se probaron listeners con Firebase real.

La inicialización de conexión Firestore conserva su detección y compatibilidad de proxy, que en una primera entrada puede demorar hasta el timeout del probe. No se modificó esa ruta sin evidencia de fallos reales. La cantidad de información, el renderizado y la red aún pueden influir; ahora los documentos secundarios no bloquean la primera sección.

Al subir esta versión, guardar el trabajo y cerrar todas las pestañas de TaxFly antes de volver a abrirlo. La etapa 5 deja el worker nuevo en espera mientras existen pestañas con la versión anterior; un F5 aislado puede mantener esa versión.

Próximo paso: revisar las mismas pantallas después de activar esta versión y medir la apertura real de Planificación. No hubo publicación ni se inició otra tarea.

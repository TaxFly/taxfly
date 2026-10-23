# Mascota de la guía de TaxUSA

Se integra el pin azul 2D con manos y zapatos amarillos del ZIP `taxfly-main-2D.zip`. Se conserva su diseño vectorial y su motor de diez estados, sin WebGL ni descargas de modelos externos.

## Integración

- La mascota aparece dentro de la tarjeta de bienvenida, del menú y de los recorridos; no añade un botón flotante junto al chat IA.
- El acceso permanente es el signo de pregunta junto a Ajustes. También permanece el acceso desde el panel de Ajustes.
- Saluda en la bienvenida, señala hacia el bloque destacado, piensa al revisar/crear un viaje y festeja al completar. Si falta el objetivo, cambia a una expresión de curiosidad.
- Se conserva el recorrido «Conocer TaxUSA» de diez pantallas y las guías completas por pestaña, incluidos los cambios de subpestaña y la restauración de la vista inicial.
- Se conserva el progreso por cuenta/perfil, los permisos, la navegación con teclado y Escape. El SVG es decorativo: los textos siguen siendo la explicación accesible.
- La animación se pausa al cerrar la guía y cuando la pestaña está oculta. Se respeta la preferencia de movimiento reducido, incluso al cambiarla durante la sesión.
- Si no se carga `mascot.js`, la guía conserva su funcionamiento sin el personaje.

## Archivos

`assets/mascot.js` es el motor compartido. `assets/guide.js` y `assets/guide.css` lo integran con las guías actuales. Todas las pantallas autenticadas cargan el motor antes de la guía y la precaché incluye el archivo.

`mascota.html` conserva el estudio de expresiones del ZIP aportado, pero ahora reutiliza el mismo motor compartido. Permite probar los diez gestos, hablar, saltar, seguir el cursor, pausar y exportar SVG. Su enlace abre el recorrido real de la app. Se retiraron las copias internas antiguas de la guía y del motor para evitar divergencias.

## Otras mejoras seleccionadas

Se incorporaron los símbolos SVG y el color del clima de la versión aportada. Los indicadores de sensación térmica, humedad y viento también se dibujan como SVG desde el primer renderizado. Se ajustaron la cabecera de la guía, los títulos y listas para celular, y las etiquetas de navegación en pantallas angostas. Las categorías de Calculadora se distribuyen en dos filas en celulares pequeños para que sus nombres no se superpongan.

No se sustituyó la guía actual por la versión anterior del ZIP aportado: esa versión no incluía el recorrido entre páginas ni la cobertura completa de subpestañas. Se conserva el servicio de traducciones existente; la propuesta nueva hacía tres solicitudes siempre y dejaba de conservar el texto original del idioma detectado.

## Verificación

54 pruebas relacionadas aprobadas. Suite completa: 285 pruebas, 261 aprobadas y los mismos 24 fallos previos de Europa/archivos ausentes, sin fallos nuevos.

24 escenarios aprobados en Chromium con HTML y CSS reales y servicios de cuenta/viajes simulados, sin errores de JavaScript. Incluyen las diez pantallas, guías por pestaña, permisos, idioma, progreso y creación de viaje; diez expresiones, exportación SVG, movimiento reducido, pausa de animación, fallo de carga del motor, modos claro/oscuro y vistas de 320 px, horizontal y escritorio. Comprobación adicional de la navegación de 320, 390 y 1280 px tras el último ajuste de etiquetas.

No se verificó una sesión real de Firebase ni se desplegó la app.

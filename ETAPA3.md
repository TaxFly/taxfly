# Etapa 3 — estabilidad y claridad visual

Entrega acumulada: etapas 1, 2 y 3. Sin publicación ni ejecución de etapas 4 y 5.

## Causas comprobadas

- `itinParseNum` eliminaba todo carácter que no fuera un dígito: `45–60` se importaba como `4560`. El formulario también truncaba rangos al guardar con `parseInt`.
- Un bloque sin horario mostraba `--:--`, aunque representara una actividad flexible.
- Los controles de subir/bajar podían ocupar apenas 17 px por su SVG y padding de 2 px; las acciones tenían poca opacidad.
- `switchSection` desplazaba siempre al inicio. El día y los filtros solo vivían en memoria y se perdían al volver desde otra página si el navegador reconstruía Planificación.

## Cambios

- El importador y el editor conservan rangos, decimales y valores ambiguos. Los rangos válidos se presentan con el mismo separador visual; los valores ambiguos muestran “Revisar duración”. Un número mayor a 1440 minutos se señala para revisión, sin inferir que provenga de un rango ni corregirlo automáticamente. No hay migraciones ni reescritura de valores guardados.
- “Flexible” cuando falta la hora en el itinerario. Las horas ya guardadas se conservan.
- Etiquetas nuevas integradas en el diccionario existente ES/EN/PT. Disponibles en el archivo local, sin servicios externos. Formato decimal según idioma; cambio de idioma actualiza únicamente las etiquetas generadas, sin reconstruir formularios.
- Controles de icono de al menos 32 px y 40 px en celular, foco visible, mejor opacidad de acciones y estados deshabilitados diferenciados. Ajustes de flex y quiebre de texto para la columna horaria y las acciones en pantallas angostas. Colores, fuentes, tarjetas, bordes y sombras existentes permanecen; el CSS original se conserva íntegro con reglas puntuales al final.
- Posición por sección durante la navegación interna. Al salir de la página se guarda en sessionStorage el día, filtros, búsqueda, subtabs y posición, con clave por usuario, perfil y viaje. Al volver se restaura el día por ID si existe. No implica persistencia entre distintas pestañas ni recuperación de formularios sin guardar.
- Se actualizó la versión de caché con el script existente para distribuir los archivos modificados.

## Archivos afectados

- `sw.js`
- `assets/plan-i18n.js`
- `assets/plan-styles.css`
- `assets/plan-app.js`
- `tests/visual-stability.test.cjs`

## Validación

- 8 pruebas nuevas de importación de rangos y ambigüedades, seguridad del HTML generado, edición sin pérdida, traducciones y decimales, regreso a secciones, recuperación tras detalle externo, aislamiento por contexto y cambio de idioma sin reconstrucción de formularios.
- 57 comprobaciones enfocadas: 57 aprobadas.
- Suite completa: 180 pruebas, 156 aprobadas y los mismos 24 fallos anteriores. Comparados los nombres de fallos con etapa 2: ningún fallo nuevo.
- Sintaxis JavaScript comprobada en ambos archivos modificados.
- Auditoría estática: los 22 nombres de iconos usados de forma literal en Planificación están definidos entre sus 47 iconos. Los SVG ya reservan ancho y alto; el mapa mantiene su altura fija existente. No se detectó aquí un recurso local de Planificación que exigiera reemplazo.
- El conjunto de cambios de producción está limitado a los cuatro archivos indicados. No se modificaron archivos de datos, nombres, fechas, descripciones ni marca.

Comandos reproducibles:

```
node --test tests/visual-stability.test.cjs tests/performance-loading.test.cjs tests/loading-state.test.cjs tests/travel-improvements.test.cjs
npm test
node scripts/bump-cache.js
```

## Límites y pendientes

No se hizo comparación visual antes/después en un navegador: el acceso al archivo local fue rechazado por la política del navegador en la etapa anterior y no se intentó eludir esa restricción. Las comprobaciones de diseño son estáticas, no capturas renderizadas. Falta verificar a mano 320/390 px y escritorio, los tres idiomas, especialmente tarjetas con títulos largos y acciones móviles. Tampoco se probaron recursos remotos, Firebase real o la restauración nativa de historial en dispositivos reales.

No se afirma que toda la aplicación carezca de saltos visuales o imágenes rotas. La revisión y los cambios se concentraron en Planificación. Los datos antiguos ya importados como 4560 no permiten reconstruir el valor original con certeza: quedan visibles para revisión. No se normalizaron horarios ambiguos ni se tocaron textos personales. Los filtros por ID que dejaron de existir no se restauran.

Próximo paso sugerido: completar esa comprobación visual en un entorno accesible antes de publicar. La etapa 4, conexión entre secciones, requiere una nueva indicación.

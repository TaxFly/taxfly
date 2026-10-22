# Actualización de tips de viaje de TaxFly

Implementada el 22 de octubre de 2026. Este proyecto contiene los cambios listos para copiar sobre la carpeta existente.

## Instalación

1. Descomprime el ZIP.
2. Copia el contenido de `taxfly-main/` sobre tu proyecto, conservando la misma estructura. Acepta reemplazar los archivos modificados.
3. Publica los archivos como lo haces habitualmente. Incluye `sw.js`: su versión de caché se recalculó para distribuir juntos los nuevos textos y scripts.
4. Abre la app y usa su opción de actualización si todavía muestra la versión anterior.
5. En Ajustes, con idioma español, selecciona el país en “País (tips)”. “Sin especificar” muestra únicamente los tips generales. El cambio actualiza también el transporte visible.

El país reutiliza `appCountry`, que ya estaba en esta versión del proyecto. Es una preferencia local del navegador; no se añadió sincronización de país con Firebase. Los arrays originales y la rotación por pantalla se conservan. Las listas pueden tener distinta longitud.

## Contenido

Hay 161 entradas editoriales por ubicación y audiencia, con 423 textos localizados (158 ES, 131 EN y 134 PT). No son 423 consejos diferentes: las traducciones se cuentan por separado.

| Ubicación | Contenido general |
| --- | --- |
| Inicio | 10 por idioma; PT agrega IOF y ES agrega país |
| Lugares | 11 por idioma; ES-AR agrega comparación cultural |
| Ciudades | 82 por idioma en 12 ciudades; dos capas culturales ES-AR |
| Compras | 12 por idioma; PT agrega 2 de aduana brasileña y ES agrega país |
| Unidades | 16 por idioma, con adaptación de medidas de combustible y volumen |

Argentina, México, Colombia, Chile, Perú, Costa Rica, Panamá y Guatemala tienen contenido exclusivo. Costa Rica y Guatemala tienen menos consejos que otros países porque se excluyeron montos o reglas que no pudieron confirmarse con suficiente claridad. Los consejos de comisiones generales se mantienen en la capa universal; no se inventan impuestos nacionales.

## Fuentes y alcance de la verificación

`docs/travel-tips-sources-2026-10.json` registra cada texto exacto, idioma, país cuando aplica, estado y fuentes por identificador. La sección `sources` contiene URL, título y fecha o nota de consulta. `omitted` explica los datos descartados. Los consejos prácticos sin cifras se identifican como “consejo editorial”; las conversiones se identifican como comprobaciones aritméticas. La fecha de revisión es un corte de contenido, no una promesa de actualización automática futura.

Se corrigieron las afirmaciones absolutas sobre tax refund, tarifas antiguas, Red Line de Boston hacia Logan, límites universales de equipaje, tallas automáticas y la identificación de 37 °C como fiebre. Se actualizaron también cuadros de transporte cuando contradecían los tips. No se modificaron `offline.html` ni los tips personales de `assets/plan-app.js`.

## Archivos modificados

- `assets/compras.js`
- `assets/index-app.js`
- `assets/lugares-ciudades.js`
- `assets/lugares-selector.js`
- `assets/lugares.js`
- `assets/settings.js`
- `assets/unidades.js`
- `docs/travel-tips-sources-2026-10.json`
- `sw.js`
- `tests/travel-tips.test.cjs`
- `docs/TIPS_VIAJE_LEEME.md` (este archivo)

## Validación

- Sintaxis comprobada en los siete scripts modificados y en el service worker.
- 29 pruebas de tips y flujos relacionados: todas pasan. Incluyen país vacío/desconocido, las ocho capas, cambio de idioma durante animaciones, listas de distinto tamaño, los dos paneles de transporte y correspondencia de textos con el registro de fuentes.
- Suite completa: 267 pruebas, 243 aprobadas y 24 fallidas. El ZIP original presenta las mismas 24 fallidas entre 261 pruebas. Todas están relacionadas con TaxEurope y archivos o rutas ausentes en el original; esta actualización no agrega fallos.
- No se validó una sesión real autenticada de Firebase ni se publicó el proyecto.

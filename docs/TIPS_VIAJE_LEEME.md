# Actualización de tips de viaje de TaxFly

Implementada el 22 de octubre de 2026. Este proyecto contiene los cambios listos para copiar sobre la carpeta existente.

## Instalación

1. Descomprime el ZIP.
2. Copia el contenido de `taxfly-main/` sobre tu proyecto, conservando la misma estructura. Acepta reemplazar los archivos modificados.
3. Publica los archivos como lo haces habitualmente. Incluye `sw.js`: su versión de caché se recalculó para distribuir juntos los nuevos textos y scripts.
4. Abre la app y usa su opción de actualización si todavía muestra la versión anterior.
5. En Ajustes, con idioma español, selecciona el país en “País (tips)”. “Sin especificar” muestra únicamente los tips generales. El cambio actualiza también el transporte visible.

El país reutiliza `appCountry`, la preferencia local del navegador existente. No se añadió sincronización de país con Firebase. Al cambiar de idioma o país, los tips se actualizan sin conservar un índice fuera de la lista.

## Segunda revisión de calidad

Se revisaron las 12 ciudades y se reemplazaron recordatorios generales por decisiones concretas de acceso, entradas, traslados y compras. Las reglas repetidas de transporte se concentraron en menos tips. OMNY queda en Nueva York y su comparación con SUBE solo se muestra en la capa Argentina de esa ciudad.

Ejemplos nuevos o ampliados:

- Orlando: tramo TTC–Magic Kingdom, Visitor Toll Pass con condiciones y restricciones del transporte de Disney Springs.
- Nueva York: categorías de la Estatua de la Libertad, elegibilidad del Met y Memorial del 11-S frente a museo.
- Miami: trolleys gratuitos por jurisdicción y elegibilidad de Wynwood Walls.
- Las Vegas: fuentes gratuitas de Bellagio y diferencia entre entrada diurna/nocturna del Neon Museum.
- Los Ángeles: FlyAway, reserva gratuita del Getty con parking aparte y acceso a Griffith frente al planetario.
- San Francisco: ferry autorizado a Alcatraz y peajes del Golden Gate en auto alquilado.
- Chicago: Millennium Park, gratuidad del Shedd para residentes y crucero específico del CAC.
- Washington: reservas del Capitolio y Washington Monument.
- Boston: acceso al USS Constitution, costos de los interiores del Freedom Trail y accesibilidad MBTA.
- Seattle: ferry a Bainbridge a pie y acceso gratuito a Pike Place Market.
- Nueva Orleans: Airport Express 202, diferencias con JET y efectivo en el Café du Monde original.
- Denver: visitas diurnas a Red Rocks y requisitos de Rocky Mountain según fecha y sector.

En Inicio y Compras se añadieron situaciones de retención de garantía en hoteles, power banks, desbloqueo y garantía territorial de iPhone, cambio de VIP Shopper Club a Simon+ y pago en caja cuando falla el ZIP del surtidor.

La nueva rotación alterna temas cuando existe otra categoría disponible, sin dejar consejos inaccesibles. Yardas, pintas y cuartos de galón aparecen con menor frecuencia que las referencias habituales. No se añadió seguimiento del usuario ni persistencia del historial de tips.

## Contenido

El inventario contiene 180 entradas por ubicación/audiencia y 482 textos localizados (177 ES, 151 EN, 154 PT). Las traducciones se cuentan por separado; no son 482 consejos distintos. La segunda revisión priorizó utilidad sobre cantidad.

| Ubicación | Contenido general |
| --- | --- |
| Inicio | ES 10 · EN 10 · PT 11; capas por país cuando aplica |
| Lugares | ES 11 · EN 11 · PT 11; capas por país cuando aplica |
| Compras | ES 11 · EN 11 · PT 13; capas por país cuando aplica |
| Unidades | ES 16 · EN 16 · PT 16; capas por país cuando aplica |
| Ciudades | 103 tips por idioma en 12 ciudades; dos comparaciones culturales exclusivas de AR |

Argentina, México, Colombia, Chile, Perú, Costa Rica, Panamá y Guatemala conservan contenido exclusivo. Costa Rica y Guatemala tienen listas menores: se excluyeron cifras o reglas que no pudieron confirmarse con claridad. Los requisitos de entrada se vinculan al pasaporte utilizado, no se infiere la ciudadanía desde el país seleccionado.

## Fuentes y alcance de la verificación

`docs/travel-tips-sources-2026-10.json` registra cada texto exacto, idioma, país cuando aplica, estado y fuentes por identificador. La sección `sources` contiene URL, título y fecha o nota de consulta. `omitted` explica los datos descartados. Los consejos prácticos sin cifras se identifican como “consejo editorial”; las conversiones se identifican como comprobaciones aritméticas. La fecha de revisión es un corte de contenido, no una promesa de actualización automática futura.

Se corrigieron las afirmaciones absolutas sobre tax refund, tarifas antiguas, Red Line de Boston hacia Logan, límites universales de equipaje, tallas automáticas y la identificación de 37 °C como fiebre. Se actualizaron también cuadros de transporte cuando contradecían los tips. Se conservaron `offline.html` y los tips personales editables; la corrección de carga sí modifica `assets/plan-app.js`.

## Archivos modificados respecto del ZIP inicial

- `assets/index-app.js`
- `assets/lugares.js`
- `assets/lugares-ciudades.js`
- `assets/lugares-selector.js`
- `assets/compras.js`
- `assets/unidades.js`
- `assets/settings.js`
- `assets/ui.js`
- `assets/plan-app.js`
- `assets/plan-loading.js`
- `assets/plan-firebase.js`
- `tests/outlets-recovery.test.cjs`
- `tests/tip-icons.test.cjs`
- `assets/travel-tip-core.js` (nuevo; debe copiarse junto con los demás scripts)
- `sw.js`
- `tests/travel-tips.test.cjs`
- `tests/travel-tip-rotation.test.cjs`
- `docs/travel-tips-sources-2026-10.json`
- `docs/TIPS_VIAJE_LEEME.md`

## Validación

- Sintaxis comprobada en los scripts modificados y el service worker; nueva dependencia incluida en precaché.
- 48 pruebas de tips, iconos, carga y flujos relacionados: todas pasan. Incluyen ocho países, país vacío/desconocido, cambios de idioma durante animaciones, listas desiguales, ambos paneles de ciudades, inventario de fuentes, alternancia de temas, alcance de todos los tips y menor frecuencia de unidades secundarias.
- Suite completa: 279 pruebas; 255 aprobadas y 24 fallidas. El ZIP original tiene las mismas 24 fallidas entre 261 pruebas: corresponden a TaxEurope y archivos/rutas ausentes en el original. No se agregaron fallos.
- Comparación de integridad: los archivos ajenos al alcance, incluido `offline.html`, se conservaron byte a byte.
- No se validó una sesión real autenticada de Firebase ni se publicó el proyecto.

## Tercera revisión: iconos, Outlets y parques

- Los tips y elementos decorativos usan el catálogo compartido de SVG de trazo. La conversión también funciona en Planificación y Mis cosas, incluidos cambios dinámicos. Los datos existentes conservan sus identificadores.
- Outlets separa la disponibilidad del cronograma de la lista de compras y de la dirección del hotel. Las pestañas siguen accesibles ante un error. Se añadió Reintentar y recuperación de respuestas tardías sin sobreescribir snapshots más recientes. La dirección del hotel queda pendiente y sin edición hasta sincronizarse.
- Orlando suma Disney World (sus cuatro parques), los parques de Universal incluido Epic Universe y las condiciones de Hogwarts Express.
- Los Ángeles suma Disneyland/California Adventure y la diferencia entre Universal Express y Express Add-On de Hollywood. Los cinco tips nuevos tienen versiones ES/EN/PT y fuentes oficiales en el registro.
- El ZIP se genera de nuevo desde el proyecto completo; se verifica su CRC y se compara cada archivo extraído con el original.

## Cuarta revisión: más parques, ciencia y experiencias locales

Se añaden 17 consejos distintos (51 textos en español, inglés y portugués), repartidos entre las 12 ciudades. Se mantienen los cambios de iconos y recuperación de Outlets de la versión anterior.

| Ciudad | Nuevos consejos |
| --- | --- |
| Orlando y excursiones cercanas | SeaWorld Quick Queue; anticipación exigida con Reserved Seating; LEGOLAND en Winter Haven y acceso al acuático; Kennedy Space Center Bus Tour y último bus; traslado y cambios de lanzamientos |
| Nueva York | Intrepid y acceso incluido al Space Shuttle Pavilion |
| Miami | Shark Valley: entrada nacional frente a tram o bicicleta |
| Las Vegas | Sphere: seleccionar la función correcta de cine o concierto |
| Los Ángeles y alrededores | Knott’s frente a Soak City: entrada y temporada |
| San Francisco | NightLife de California Academy of Sciences: edad, documento y planetario |
| Chicago | Adler: entrada general frente a función en la cúpula |
| Washington y alrededores | Udvar-Hazy en Virginia: Discovery, traslado y estacionamiento |
| Boston | Museum of Science: tickets con horario para Omni y Planetarium |
| Seattle y alrededores | Boeing Everett Factory Tour: altura, objetos prohibidos y llegada; Museum of Flight: primer jueves gratuito |
| Nueva Orleans | Audubon: Aquarium/Insectarium, Zoo y combo |
| Denver | Museum of Nature & Science: qué queda fuera de los días gratuitos |

Las ubicaciones fuera de la ciudad se identifican en el consejo, sin presentarlas como visitas del centro. Los textos no prometen filas cortas, lanzamientos garantizados ni precios promocionales. El registro de fuentes contiene las páginas oficiales y los textos exactos de cada idioma.

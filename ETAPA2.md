# TaxFly / TaxUSA — Etapa 2: rendimiento

## Alcance
Esta entrega parte de la etapa 1 e incluye sus correcciones. Se implementó únicamente la etapa 2, mediante cambios acotados. No se ejecutaron las etapas 3 a 5. No se publicaron cambios ni se modificaron datos reales o el repositorio remoto.

## Qué se midió antes de cambiar
El script scripts/benchmark-loading.cjs ejecuta el código real de hidratación y el arranque de viajes de Planificación en Node, con adaptadores de datos simulados. Cada escenario se repite tres veces. La latencia de cada lectura se fija en 20 ms y la escritura pendiente en 200 ms. Son datos sintéticos: no se usan cuentas reales ni credenciales.

Se verificó que:
- Settings y la pantalla podían hidratar la misma lista simultáneamente, duplicando la consulta.
- La búsqueda de registros antiguos continuaba consultando gastos, actividades y notas aunque el viaje ya se hubiera reconocido por información local.
- La primera entrada a Planificación esperaba que terminara el envío de cambios pendientes para continuar, aun con viajes ya recibidos.
- Leaflet tenía un script y una hoja de estilo bloqueantes en la cabecera, aunque el usuario estuviera en el itinerario y no necesitara mapas.

## Cambios realizados
1. TripContext comparte únicamente operaciones de hidratación en curso para la misma cuenta, perfil e instancia de Firestore. Cada consumidor conserva sus notificaciones. Las operaciones se liberan al finalizar, incluso si fallan, para permitir consultas posteriores y reintentos. No se añadió una caché permanente con datos potencialmente obsoletos.
2. Se omiten consultas de descubrimiento antiguo que ya no aportan información tras encontrar el viaje.
3. Planificación continúa cuando la lista de viajes está disponible, sin esperar la finalización de escrituras pendientes. La sincronización existente sigue ejecutándose; la cola solo se elimina tras confirmar la escritura. La promesa de hidratación conserva su comportamiento de esperar la sincronización para los demás consumidores.
4. Los temporizadores de espera de documentos se limpian cuando la operación termina.
5. Leaflet y su CSS se solicitan solo al mostrar un mapa. Se reutiliza una única descarga entre mapas, se ignoran resultados de contenedores que ya no están activos y hay reintento explícito ante errores. Se mantuvieron las mismas URLs y versión del proveedor. Los mensajes nuevos están en ES/EN/PT.

## Resultados comparables
Medianas de tres ejecuciones bajo las condiciones simuladas anteriores:

| Escenario | Etapa 1 | Etapa 2 |
|---|---:|---:|
| Lecturas ante dos consumidores simultáneos | 2 | 1 |
| Tiempo en ese escenario | 20.44 ms | 20.93 ms |
| Lecturas al reconocer viaje antiguo por datos locales | 5 | 2 |
| Tiempo en ese escenario | 102.09 ms | 40.7 ms |
| Continuación de Planificación con escritura pendiente | 222.18 ms | 21.82 ms |
| Scripts Leaflet bloqueantes en el HTML inicial | 1 | 0 |
| CSS Leaflet bloqueante en el HTML inicial | 1 | 0 |

La duplicación de consultas se reduce, pero no se atribuye una mejora de tiempo significativa a ese escenario: las consultas anteriores ya corrían en paralelo y las diferencias de milisegundos incluyen variación de ejecución. El ahorro de lecturas es el resultado determinista.

Estos tiempos NO son LCP, tiempo total de carga de la web ni mediciones de Firebase en producción. No implican que toda la aplicación sea un porcentaje específico más rápida. Los datos completos, rangos mínimo/máximo y condiciones están en ETAPA2-mediciones.json.

## Validación
- 11 pruebas nuevas: operaciones compartidas, aislamiento de cuenta/perfil/base de datos, reintento tras fallo, persistencia de cola, carga diferida de mapas, descarga única, reintento y descarte al navegar.
- 49 pruebas enfocadas aprobadas, incluyendo las de la etapa 1.
- Suite completa: 172 pruebas, 148 aprobadas y 24 fallidas.
- Comparación con etapa 1: 161 pruebas, 137 aprobadas y las mismas 24 fallidas. No hay fallos adicionales. Los fallos existentes pertenecen a TaxEurope/rutas y no fueron ampliados a esta tarea.
- Sintaxis JavaScript de los archivos de producción modificados comprobada.
- Las 14 hojas de estilo son idénticas a la etapa 1. No se cambiaron colores, fuentes, tarjetas, nombres ni contenidos de itinerarios.
- El service worker recibió únicamente la actualización de versión mediante el script existente.

## Cómo repetir
```
node --test tests/performance-loading.test.cjs tests/loading-state.test.cjs tests/travel-improvements.test.cjs
node scripts/benchmark-loading.cjs --baseline /ruta/a/etapa1/taxfly-main --output mediciones.json
node scripts/bump-cache.js
npm test
```
Sin --baseline, el benchmark mide solamente la copia actual.

## Límites y pendientes
No se midió navegación real en Chrome, carga con red móvil, LCP/INP, transferencia comprimida ni ejecución con una sesión real de Firebase. La política del navegador disponible impidió abrir la copia local durante la etapa anterior; no se intentó eludir esa restricción. Sigue pendiente la comparación visual de escritorio/celular y probar mapas con conexión real.

La primera apertura de un mapa puede mostrar brevemente un indicador de carga porque sus recursos ahora se descargan a demanda. Una vez recibidos se reutilizan durante la página.

Se observó también el sondeo de conectividad de fs-net (hasta 3.5 s por prueba en ciertos casos de primera conexión) y la espera inicial de varios documentos de Planificación. No se alteraron indiscriminadamente: el sondeo mantiene compatibilidad con bloqueadores/proxy y la inicialización completa requiere proteger todos los estados y migraciones antes de adelantar más contenido. Son candidatos a medir en el entorno real, sin ampliar esta entrega.

Antes de avanzar a la etapa 3, revisar esta versión en un entorno de prueba con red lenta, cambios de viaje y mapas en los tres idiomas. Detenerse aquí hasta nueva autorización.

## Archivos afectados en esta etapa
- assets/plan-app.js
- assets/plan-firebase.js
- assets/plan-i18n.js
- assets/trip-context.js
- planificacion.html
- scripts/benchmark-loading.cjs
- sw.js
- tests/performance-loading.test.cjs

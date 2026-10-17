# TaxFly / TaxUSA — Etapa 1

## Alcance realizado
Corrección de estados de carga en Inicio, Gastos, presupuesto de Planificación y selector de viajes. No se implementaron las etapas 2 a 5. No hubo cambios remotos, publicación ni despliegue.

## Causas comprobadas en el código
- Inicio interpretaba la ausencia de caché como presupuesto cero y gastos vacíos.
- La tarjeta de próximo evento se renderizaba antes de recibir actividades y reservas.
- Gastos consultaba un presupuesto antes de resolver el viaje activo; también podía persistir snapshots vacíos provenientes de la caché de Firestore.
- Algunas suscripciones no se cancelaban ni descartaban sus respuestas al cambiar el contexto.
- La hidratación de viajes silenciaba errores y no distinguía una lista vacía confirmada de una carga fallida.
- Planificación ofrecía definir presupuesto antes de confirmar sus fuentes financieras.

## Cambios
- Estados separados de valor conocido, carga pendiente y error; tratamiento conservador de snapshots vacíos de caché.
- Los estados vacíos aparecen únicamente con información local previamente guardada o confirmación del servidor.
- Conservación de datos válidos ante fallos de actualización; avisos discretos en los componentes existentes.
- Suscripciones con cambios de metadatos para recibir también la confirmación del servidor cuando el contenido no cambia.
- Cancelación de suscripciones y comprobación de contexto/generación antes de aplicar respuestas tardías en los flujos corregidos.
- Presupuesto y caché financiera identificados por cuenta, perfil y viaje; gastos filtrados por viaje.
- Estado explícito de hidratación de viajes, recuperación de hidratación al reconectar y prevención del falso diálogo de creación de viajes.
- Carga de próximo evento coordinada entre actividades y reservas; caché de actividades identificada por cuenta y perfil.
- Mensajes nuevos en español, inglés y portugués utilizando los mecanismos existentes.
- Actualización de la versión de caché del service worker mediante el script existente. No se rediseñó su funcionamiento.

## Validación
- 15 pruebas nuevas de regresión para carga, errores, vacíos confirmados, caché, respuestas tardías, renderizado de tarjetas y traducciones.
- Las pruebas nuevas y las de mejoras de viaje suman 38 comprobaciones, todas aprobadas.
- Suite completa final: 161 pruebas, 137 aprobadas y 24 fallidas.
- ZIP original: 146 pruebas, 122 aprobadas y las mismas 24 fallidas. No hay fallos adicionales. Los fallos previos corresponden a pruebas de TaxEurope/rutas, con archivos de TaxEurope ausentes en este ZIP y expectativas existentes ajenas a esta etapa.
- Sintaxis de los 8 archivos JavaScript de producción modificados comprobada con Node.
- Las 14 hojas de estilo son idénticas al ZIP original. Se conservaron clases y estilos de los componentes existentes.

Comandos:
```
node --test tests/loading-state.test.cjs tests/travel-improvements.test.cjs
node scripts/bump-cache.js
npm test
```

## Límites de la validación
Las pruebas usan snapshots y documentos simulados; no modifican datos reales ni requieren credenciales. No se verificaron permisos reales de Firebase, conexiones con una sesión real ni sincronización entre dispositivos reales.

El navegador disponible bloqueó la apertura de las páginas de prueba locales por su política de seguridad. No se pudo completar una comparación visual con capturas de escritorio/celular. La comprobación visual real, incluidos posibles recortes en inglés/portugués, queda pendiente; no se presenta como realizada.

No se midieron mejoras de velocidad ni se atribuyen porcentajes de rendimiento: la optimización general corresponde a la etapa 2.

## Continuación
Revisar primero esta etapa en un entorno de prueba con una cuenta de prueba, verificando carga lenta, cambio de perfil/viaje y escritorio/celular en los tres idiomas. Luego, si se autoriza, comenzar la etapa 2 con mediciones de red y carga. No avanzar automáticamente.

## Archivos afectados
- assets/compras.js
- assets/index-app.js
- assets/plan-app.js
- assets/plan-firebase.js
- assets/plan-i18n.js
- assets/travel-core.js
- assets/trip-context.js
- assets/trips-ui.js
- compras.html
- index.html
- sw.js
- tests/loading-state.test.cjs
- tests/travel-improvements.test.cjs

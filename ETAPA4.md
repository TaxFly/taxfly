# Etapa 4 — conexión entre secciones

Entrega acumulada de las etapas 1 a 4. No publicada. Etapa 5 sin ejecutar.

## Causas comprobadas

- Rutas consultaba el alojamiento y lo volcaba al terminar sin comprobar si el usuario había empezado a escribir o había cambiado de contexto. La clave de la dirección manual no incluía la cuenta.
- Rutas solo recibía paradas manuales, CSV o enlaces. Existía el envío inverso a Planificación, pero sin UID ni identificador de importación estable; repetir una ruta sin fecha podía crear otro día.
- Los gastos nuevos de Planificación usaban addDoc y, ante fallo, una operación add sin ID fijo. El overlay compartido solo reconoce upsert, upd y del: no mostraba esas altas pendientes. Gastos también creaba una fila temporal local y otra remota, con riesgo de duplicados ante un resultado incierto.
- La cola emitía taxfly-pending-updated, pero las vistas financieras no escuchaban ese evento local. El evento storage no se dispara en la pestaña que escribe.
- Guardar presupuesto no publicaba el valor por una vía local compartida. Las vistas dependían del próximo snapshot para reflejarlo.

## Cambios

### Rutas y Planificación

- Nuevo bloque compacto dentro del constructor de Rutas: usar el alojamiento guardado, elegir un día de Lugares o Itinerario, agregar sus paradas y actualizar la lectura. Reutiliza los botones, inputs, colores, fuentes y radios existentes.
- Se conservan la entrada manual, CSV y enlaces. La importación suma copias de las paradas; no reorganiza ni modifica la fuente. Evita repetir el mismo nombre y enlace, incluso al importar dos veces.
- Direcciones manuales y caché de la consulta separadas por cuenta, perfil y viaje. El alojamiento respeta la ciudad activa del viaje.
- Respuestas tardías se descartan por generación y contexto; no pisan texto introducido durante la consulta ni un campo que el usuario vació expresamente. También se descartan sugerencias de dirección de una consulta anterior.
- Al fallar una actualización se conservan los datos válidos del mismo contexto; una respuesta vacía de caché no confirma que no haya datos. Si está disponible, se ofrece la copia guardada de la última consulta completa de Rutas.
- El envío inverso Rutas → Planificación incorpora UID e ID de importación. Repetir la misma ruta no crea otro día sin fecha; se conserva la combinación por fecha y nombre que ya existía. Los mensajes antiguos sin UID no se importan automáticamente.

### Presupuesto y gastos

- Las nuevas altas desde Planificación y Gastos se encolan con un ID de documento fijo antes de escribir. Los reintentos usan setDoc sobre ese ID. El overlay combina la fila pendiente y su snapshot remoto por ID, sin contarlas dos veces.
- Las vistas de Inicio, Gastos y Planificación reaccionan a los cambios de la cola. Las altas pendientes conocidas aparecen en sus totales sin exigir F5. La desuscripción de Planificación también retira sus listeners locales.
- El reintento existente admite upsert y upd, además de sus operaciones anteriores, y avisa al retirar una operación completada. Se reutilizó esta vía porque es necesaria para sincronizar los nuevos IDs; no se reorganizó el sistema offline.
- Las altas pendientes de Gastos pueden editarse o eliminarse con la misma identidad. Las operaciones existentes se conservan.
- publishBudget en travel-core reutiliza la clave de caché canónica y emite un evento con UID, perfil y viaje. Guardar desde Gastos o Planificación refleja el valor localmente; las vistas descartan eventos de otro contexto.
- El cálculo monetario y la moneda existentes se conservan; no se creó otro presupuesto ni una agenda nueva.

### Idiomas y estética

Todos los textos nuevos del bloque de Rutas tienen ES/EN/PT dentro de su diccionario existente. Las opciones se reconstruyen según el idioma sin traducir nombres personales y conservan la selección cuando sigue disponible. Las etiquetas se enlazan a su select y el estado usa role=status. No hay servicios de traducción durante la carga.

Los archivos CSS externos son idénticos a la etapa 3. En rutas.html solo se incorporan el bloque y ajustes acotados de tamaño, envoltura y estado deshabilitado para sus botones. No se tocaron archivos de datos de itinerarios, marcas, nombres, fechas, descripciones o reservas del usuario como parte de la entrega.

## Archivos afectados

- `assets/compras.js`
- `assets/index-app.js`
- `assets/plan-app.js`
- `assets/plan-firebase.js`
- `assets/reconnect-sync.js`
- `assets/rutas-app.js`
- `assets/rutas.js`
- `assets/travel-core.js`
- `rutas.html`
- `sw.js`
- `tests/flow.test.cjs`
- `tests/loading-state.test.cjs`
- `tests/section-connections.test.cjs`

Se incluyen ETAPA4.patch y este registro. Los dos tests existentes solo ajustan sus fixtures a los listeners y al nuevo contexto autenticado; sus verificaciones se mantienen.

## Verificaciones

- 13 pruebas nuevas: reutilización del hotel por destino; entrada manual y vaciado explícito; respuestas tardías; recuperación de errores conservando datos; importación sin duplicados y sin mutación de fuente; idiomas; gasto pendiente inmediato; convergencia con el snapshot remoto; reintento con ID estable; envío inverso repetido y aislado por cuenta; actualización local del presupuesto en las tres secciones; clave de caché canónica; alta offline de Gastos y ausencia de falsos vacíos durante autenticación/carga. Varios escenarios se agrupan en una misma prueba.
- 70 comprobaciones enfocadas aprobadas, cero fallos.
- Suite completa: 193 pruebas, 169 aprobadas, los mismos 24 fallos anteriores. Comparados los nombres contra etapa 3, sin fallos nuevos.
- Sintaxis comprobada en los ocho archivos JavaScript de producción modificados.
- Integridad del ZIP comprobada. Versión de caché actualizada con scripts/bump-cache.js.

Comandos reproducibles:

```
node --test tests/section-connections.test.cjs tests/visual-stability.test.cjs tests/performance-loading.test.cjs tests/loading-state.test.cjs tests/travel-improvements.test.cjs
npm test
node scripts/bump-cache.js
```

## Límites y pendientes

Las verificaciones se hicieron con el código real y adaptadores simulados de Firebase, eventos, almacenamiento y DOM. No se usaron credenciales ni datos privados. No se probó contra Firebase real ni se midió rendimiento de producción.

No fue posible comparar visualmente en navegador: sigue vigente la restricción de acceso al archivo local indicada en etapas anteriores. Falta verificar manualmente escritorio y celular, las tres lenguas y navegación real entre páginas antes de publicar.

La copia offline de Planificación ofrecida por Rutas corresponde a su última consulta completa. No pretende certificar que incluya cambios hechos offline desde otra pantalla que todavía no llegaron al servidor. Los antiguos overrides de alojamiento sin UID no se migran automáticamente por no poder atribuirlos con seguridad a una cuenta. Las operaciones add antiguas que ya existían se conservan, sin intentar reconciliar posibles duplicados históricos; los IDs estables se aplican a las nuevas altas. La etapa 5 debe revisar de forma integral la disponibilidad offline y los mensajes de sincronización.

Próximo paso sugerido: validar la entrega en un entorno de prueba accesible y, cuando se indique continuar, etapa 5. No hubo publicación ni avance automático.

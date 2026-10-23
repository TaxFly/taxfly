# Experiencia guiada de TaxFly

Versión integrada el 22 de octubre de 2026 sobre el ZIP de parques y atracciones v4.

## Experiencia

- Bienvenida opcional en Inicio después de cargar la cuenta y los viajes. Ofrece configurar el primer viaje o, si ya existen viajes, conocer la app. Cerrar o elegir «Ahora no» evita que se repita automáticamente en ese navegador para esa cuenta y perfil.
- Asistente de dos pasos: datos del viaje y revisión antes de crear. Reutiliza `TripContext.create`, con nombre, primer destino y fechas opcionales. No usa datos de ejemplo ni crea gastos o reservas. Los destinos adicionales se administran desde Mis viajes.
- Al crear el viaje se diferencia la sincronización confirmada del guardado local pendiente. Los siguientes accesos llevan a presupuesto, agenda y reservas.
- Tarjeta opcional de primeros pasos en Inicio. Sus marcas «Guía vista» indican recorridos explicativos completados, no datos cargados. Se puede ocultar y desaparece al terminar las tres guías destacadas.
- Quince recorridos, con 32 pasos en total, distribuidos por tarea: Inicio, presupuesto, gastos, agenda, reservas, outlets, comidas, supermercado, lugares, documentos, rutas, equipaje, grupo, calculadora y referencias.
- En las secciones se ofrece una ayuda discreta sin abrir automáticamente un recorrido. Se puede descartar. Los recorridos se recuperan desde el botón Guía o desde Ajustes.
- Español, inglés y portugués. Se conserva el texto ingresado si cambia el idioma durante la configuración.
- Iconos SVG del catálogo compartido; temas claro y oscuro; adaptación a celular; movimiento reducido; diálogo nativo con teclado, foco controlado y Escape para pausar.

## Continuidad y datos

El avance se guarda localmente por versión, cuenta y perfil, separado del contenido del viaje. No se envía telemetría. Se pueden pausar y retomar los recorridos. La guía no se comparte automáticamente entre dispositivos.

La guía espera los elementos visibles y evita señalar paneles que todavía están cargando. Si un elemento no aparece en seis segundos, muestra una alternativa para continuar o regresar a la sección. No confirma el guardado de un presupuesto, gasto o reserva por haber completado la explicación.

Crear un viaje requiere el permiso de edición que informa la app. Las guías de consulta siguen disponibles para perfiles de solo lectura. Esta integración no modifica la arquitectura de permisos preexistente ni las reglas del servidor.

## Archivos e instalación

Copiar el contenido completo de `taxfly-main/` sobre el proyecto, incluyendo `sw.js`. Se conservan los tips, iconos y correcciones de Outlets de las versiones anteriores.

- Nuevos: `assets/guide-core.js`, `assets/guide-data.js`, `assets/guide.js`, `assets/guide.css` y `tests/guide.test.cjs`.
- Diez pantallas cargan la misma guía en orden de dependencias.
- `assets/trips-ui.js` ofrece primero la bienvenida al crear el primer viaje desde Inicio y conserva el acceso habitual a Mis viajes.
- `assets/profile-access.js` permite consultar la ayuda sin bloquear sus controles como si fueran ediciones; la creación verifica el permiso explícitamente.
- Los cuatro recursos nuevos se incluyen en la precaché y se actualiza su versión.

## Validación

- 53 pruebas relacionadas aprobadas, incluyendo separación de cuentas y perfiles, fechas, traducciones, inventario de tips, carga de Outlets y orden de dependencias.
- Suite completa: 284 pruebas, 260 aprobadas y las mismas 24 fallidas del ZIP original, relativas a Europa y sus rutas o archivos ausentes.
- Doce escenarios en Chromium con las plantillas reales de la app y servicios simulados: primera bienvenida, foco y Escape; creación única; sincronización pendiente; conservación de viajes existentes; pausa y reanudación; bienvenida EN y PT; perfil de consulta; parámetros desconocidos; recorrido de presupuesto; cambio de cuenta durante un guardado; cambio de idioma con formulario abierto; pantalla de 320 px y tema oscuro; normalización del paso de reanudación. Algunos escenarios reúnen varias comprobaciones. Cero errores de JavaScript observados.
- Se inspeccionaron capturas de bienvenida y creación en celular, recorrido en escritorio y recorrido compacto con tema oscuro.
- Estas pruebas de interfaz no verifican una sesión real de Firebase ni un despliegue en producción. El guardado usa la integración existente y no se publicaron cambios.
- El ZIP final se verifica por CRC y se compara byte a byte con el proyecto después de extraerlo.

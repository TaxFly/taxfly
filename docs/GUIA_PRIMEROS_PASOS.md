# Guías de TaxUSA / TaxFly

Versión 6, integrada el 22 de octubre de 2026.

## Acceso permanente

El botón de ayuda es un signo de pregunta en SVG, junto a Ajustes en la cabecera o barra de navegación de cada pantalla. Se eliminó el acceso flotante inferior que se superponía con el chat de IA. Ambos accesos tienen funciones distintas y conservan su espacio. También se mantiene el acceso desde Ajustes cuando esa pantalla usa el panel compartido.

Abrir, repetir, pausar o retomar una guía está disponible aunque ya se haya completado. El recorrido no se limita a la primera visita.

## Dos niveles de ayuda

1. **Conocer TaxUSA:** recorrido general de diez pasos que navega por Inicio, Calculadora, Gastos, Planificación, Documentos, Lugares, Rutas, Mis cosas, Grupo y Ayuda y referencias. El avance se conserva al cambiar de página. Atrás, pausa y reanudación funcionan sobre el recorrido completo.
2. **Guías por pestaña:** explicaciones completas de cada pantalla. La pestaña actual aparece primero y las demás se pueden elegir desde el mismo menú. Cambian las subpestañas necesarias para mostrar cada bloque, sin ejecutar acciones de guardado, compras, borrado o IA.

| Pestaña | Cobertura |
| --- | --- |
| Inicio | Viaje activo, accesos, presupuesto y preparación offline |
| Calculadora | Precio individual, precio de etiqueta, categorías, estado/ciudad, ZIP y tasa manual, resultado, propina, guardar en Gastos, carrito y división de cuenta |
| Gastos | Filtro de viaje, presupuesto, cotizaciones, carga y comprobantes, resumen y topes, talles y comparación |
| Planificación | Agenda, atracciones, cronograma de outlets, lista de compras, comidas, supermercado, reservas y sus documentos/pagos |
| Documentos | Viaje, agregar archivos, apertura, almacenamiento y vínculos |
| Lugares | Ciudad y tips, actividades, búsqueda, notas y checklist |
| Rutas | Punto de partida, importación desde Planificación, modos de entrada, paradas, generación y días |
| Mis cosas | Viaje, secciones y bolsos, búsqueda/control y agregar elementos |
| Grupo | Crear/unirse, gastos compartidos, balances y permisos |
| Ayuda y referencias | Temperatura, otras medidas, farmacia y frases |

Hay 16 recorridos y 80 pasos en total: las diez guías por pestaña, el recorrido general y cinco ayudas específicas conservadas para accesos de tareas como presupuesto o primera reserva. El menú principal presenta el recorrido general y las diez pestañas.

## Bienvenida y continuidad

La bienvenida inicial sigue siendo opcional. El asistente de creación de viaje usa `TripContext.create`, con nombre, destino y fechas opcionales, y distingue guardado sincronizado de guardado local pendiente. No crea gastos ni reservas por ver una explicación.

Las guías usan los tres idiomas: español, inglés y portugués. El progreso se guarda localmente por versión, cuenta y perfil; no se envía telemetría ni se sincroniza entre dispositivos. Ver una guía marca únicamente «Guía vista».

Los recorridos que abren subpestañas restauran la vista inicial al cerrar cuando existe un adaptador de vista. No modifican campos para inventar datos de ejemplo. Si una sección no está disponible, muestran una explicación alternativa tras una espera limitada y permiten continuar o salir.

Se mantienen el diálogo nativo, el control de foco, Escape para pausar, movimiento reducido, temas claro/oscuro y adaptación a celular. Las guías de consulta están disponibles para perfiles de solo lectura; crear un viaje verifica el permiso de edición. Las reglas de seguridad preexistentes del servidor no fueron modificadas.

## Instalación

Copiar todo el contenido de `taxfly-main/` sobre el proyecto, incluyendo `assets/guide-pages.js`, los demás recursos de guía y `sw.js`. La precaché incluye las cinco dependencias de la guía y su versión fue recalculada. Se conservan los tips, iconos y correcciones de Outlets anteriores.

## Validación

- 54 pruebas relacionadas aprobadas.
- Suite completa: 285 pruebas, 261 aprobadas y las mismas 24 fallidas que tenía el ZIP original, relativas a Europa y rutas/archivos ausentes.
- 18 escenarios en Chromium con las plantillas y estilos reales y servicios simulados. Incluyen los escenarios anteriores de bienvenida, creación y sincronización pendiente, perfil de consulta, cambios de cuenta/idioma, pausa, parámetros y pantalla compacta.
- Nuevas comprobaciones: botón junto a Ajustes sin superponerse al chat en 320, 390 y 1280 px; conservación al reconstruir el menú por idioma; separación del menú general/pestañas; Calculadora completa y repetición posterior; subpestañas de Gastos y Planificación; recorrido general entre las diez páginas con avance global. Cero errores de JavaScript observados.
- Los recorridos de prueba no generaron compras ni gastos. Se comprobó la restauración de la vista de Calculadora después del recorrido.
- Se inspeccionó la captura del nuevo acceso en celular.
- No se verificó una sesión real de Firebase ni se publicó el proyecto.
- El ZIP final se valida por CRC y comparación de todos los archivos extraídos con el proyecto original.

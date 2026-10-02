# Mejoras de viajes, pagos y documentos

## Cómo usarlas

1. **Alertas de presupuesto:** se recuerdan para cada cuenta, perfil y viaje. Las alertas antiguas que solo identificaban el perfil no se reutilizan. Llegar al 90 % en un viaje no silencia el siguiente.
2. **Horarios:** al crear actividades o editar reservas, indicá ciudad y zona horaria. Los vuelos admiten fecha, hora y zona independientes para salida y llegada. Inicio ordena actividades y vuelos por el instante real, y muestra la hora del lugar, no la del dispositivo. Las actividades anteriores sin zona usan el destino del viaje; revisalas si fueron cargadas con hora de otro lugar. Una hora inexistente durante el cambio de horario de verano se rechaza; una hora repetida usa su primera ocurrencia.
3. **Pagos de reservas:** cargá el precio total en USD en la reserva. “Registrar pago” abre Gastos; confirmá el **total acumulado ya pagado**. Se crea un gasto con `reservationId` y un identificador estable para el viaje y la reserva. Volver a la acción abre ese mismo gasto. Para otro pago parcial, editá el acumulado: si habías pagado USD 100 y pagás otros USD 50, poné USD 150. El precio total no se registra automáticamente como gasto. El gasto y sus reintentos se guardan sin conexión.
4. **Disponible diario:** Inicio y Gastos conservan el saldo y muestran, por separado, el pendiente de reservas y el disponible diario. Cálculo: `(presupuesto − gastos − reservas pendientes) / días restantes`. Incluye el día actual, contado en la zona del destino; antes del viaje usa toda su duración. Sin fechas completas pide completarlas, y al finalizar no divide por cero. Los saldos negativos se mantienen visibles y el importe diario se limita a cero. Las reservas sin precio requieren completarlo para contabilizar el compromiso.
5. **Documentos:** agregá localizador, proveedor y fechas al crear un documento, o usá **Datos** dentro del visor para editar uno existente. Las sugerencias priorizan esos datos, descartan localizadores contradictorios y siguen requiriendo confirmación manual. Adjuntar desde una reserva precarga sus datos cuando están disponibles.
6. **Deshacer:** notas (incluidas las de Planificación), actividades y artículos de equipaje usan la misma acción durante seis segundos. Varios borrados rápidos se agrupan en un único botón para recuperarlos juntos. Cerrar la página confirma una sola vez el borrado y conserva las operaciones pendientes para sincronizarlas posteriormente.

## Persistencia y actualización

- Los pagos utilizan la colección de gastos existente; no se crea una segunda fuente de gastos.
- Las reservas conservan el árbol de Firebase existente: `orlando/reservations` o `tripPlanning/{viaje}/data/reservations` dentro del perfil.
- La caché de reservas nueva se separa por cuenta, perfil y viaje. Las claves antiguas se conservan; las reservas sincronizadas se recuperan de Firebase y se guardan en la nueva caché. Si una reserva antigua existe únicamente en la caché anterior, conservá una exportación de esa versión para importarla en el viaje correspondiente.
- La caché de la aplicación incorpora el módulo nuevo. Publicá todos los archivos del ZIP juntos para que HTML y scripts correspondan a la misma versión.
- No se publicaron cambios ni se modificaron datos de producción.

## Verificación

`npm test` ejecuta las pruebas anteriores y las pruebas nuevas de alertas, horarios, presupuesto, pagos, documentos y Deshacer. La prueba de `firestore.rules` continúa bloqueada porque ese archivo no estaba en el ZIP original; estas modificaciones no inventan ni cambian reglas de seguridad.

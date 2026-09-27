# Viajes compartidos entre TaxFly, Trip Planning y Mis cosas

TaxFly administra el catálogo y el viaje activo desde **Viajes** en Inicio o Ajustes. Trip Planning muestra ese viaje y permite elegir la ciudad usada para el clima. Mis cosas lee el mismo viaje al abrirse. No hay copia automática de datos de producción.

| Información | Ruta que sigue vigente |
| --- | --- |
| Metadatos de viajes nuevos y archivados | `usuarios/{uid}/perfiles/{perfilId}/tripPlanning/{tripId}` |
| Plan histórico de Orlando | `usuarios/{uid}/perfiles/{perfilId}/orlando/{docId}` |
| Plan de otros viajes | `usuarios/{uid}/perfiles/{perfilId}/tripPlanning/{tripId}/data/{docId}` |
| Mis cosas histórico (suite original de Orlando) | `usuarios/{uid}/perfiles/{perfilId}/misCosas/root/...` |
| Mis cosas de otros viajes | `usuarios/{uid}/perfiles/{perfilId}/tripPlanning/{tripId}/misCosas/root/...` |
| Gastos, actividades y notas | Colecciones actuales del perfil, filtradas por `tripId` |
| Documentos de Tickets | `users/{uid}/profiles/{perfilId}/docs/{id}`, filtrados por `tripId` |

Las claves locales `trip-planning-active::uid::perfilId` y `trip-planning-trips::uid::perfilId` se mantienen. Las ediciones sin conexión de los metadatos de viajes quedan en `trip-planning-pending::uid::perfilId`, y se reintentan al abrir la app o recuperar conexión. Los datos de cada viaje de Trip Planning mantienen sus claves locales por perfil y viaje; los de Mis cosas separan sus claves de IndexedDB por usuario, perfil y viaje. Orlando conserva las claves anteriores.

Los registros anteriores de gastos, actividades, notas y documentos que no tienen `tripId` se muestran en **Sin viaje**. No se reescriben ni se atribuyen automáticamente a Orlando. Las listas históricas de Mis cosas se conservan en su ruta original de la suite de Orlando; si parte de esas listas corresponde a otro viaje, hay que decidir manualmente su destino. Los viajes archivados conservan sus datos; eliminar un viaje nuevo borra su plan y listas asociadas, y deja gastos, actividades, notas y documentos bajo **Sin viaje**. El viaje histórico de Orlando no se puede eliminar.

El respaldo de TaxFly ahora incluye el catálogo `tripPlanning`, el plan y las listas de cada viaje. La importación usa las mismas rutas e IDs, por lo que no crea una segunda copia al repetirse. No se desplegaron reglas ni se ejecutaron migraciones contra Firebase de producción durante la verificación local.

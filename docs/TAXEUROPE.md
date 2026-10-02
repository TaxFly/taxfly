# TaxEurope — implementación y guía de adaptación

Versión del 02/10/2026. TaxEurope es una aplicación separada dentro de `TaxEurope/`, con interfaz en español, estructura visual de TaxUSA y cuentas/perfiles Firebase compartidos. Hay un único login real: `login.html` en la raíz.

## Qué incluye esta versión

| Módulo | Comportamiento implementado |
| --- | --- |
| Inicio | Crear y seleccionar viajes europeos; fechas; agregar varios países y ciudades al viaje activo; notas; métricas; copia JSON y restauración del mismo usuario/perfil/viaje. |
| Presupuesto | Moneda base elegible; presupuesto por moneda; gastos con categoría, país, ciudad y fecha; importe original; cambio manual con fecha y fuente; exportación CSV; editar y eliminar. Los gastos sin conversión aparecen como total parcial. |
| IVA | Precio con IVA o sin IVA; desglose neto, impuesto y bruto. Tasa estándar precargada editable para usar la tasa del comprobante. |
| Tax Free | Evaluación preliminar por país, residencia fiscal, bienes, comercio, edad cuando corresponde, territorio, fecha de compra y salida. IVA exacto opcional para comprobantes mixtos. Seguimiento de documento/operador, validación, solicitud, rechazo y cobro real. Solo los cobros recibidos reducen el presupuesto. |
| Alojamiento | Estancias por fechas y edades; tasa fija por huésped/noche, límites de noches y edad, o porcentaje sobre base sin IVA; categoría de alojamiento; tarifa manual confirmada; registro del costo como gasto sin duplicarlo al repetir la acción. |
| Destinos y compras | 29 países: 27 UE, Reino Unido y Suiza; ciudades importantes y ciudad personalizada; 20 comercios/localizadores oficiales; búsquedas de supermercados, farmacias, moda, outlets, museos y estaciones; lugares propios con dirección, enlace y notas. |
| Planificación | Actividades y reservas en cualquier país/ciudad del catálogo; fecha y hora local; tipo, estado, localizador, dirección, enlace y notas; agenda ordenada. |
| Rutas | Entre 2 y 10 paradas en orden; a pie, auto, bici o transporte público; enlace a Google Maps. Los horarios y servicios los confirma el proveedor externo. |
| Grupo | Integrantes; gastos con pagador y participantes; división en centavos conservando el total; saldos y transferencias sugeridas; exclusión visible de gastos sin reparto válido o cambio. No realiza pagos. |
| Equipaje | Lista inicial opcional; categorías, cantidad, estado listo; editar, borrar y marcar. |
| Documentos | Motor existente de PDF/fotos, cámara, caché y pendientes reutilizado. Filtrado por viaje europeo; exige perfil y viaje para guardar. Los adjuntos no forman parte del JSON de registros. |
| Herramientas | Conversor de monedas con cambio manual; referencia oficial del BCE; temperatura, distancia y peso. |
| Navegación y aspecto | Estructura visual de TaxUSA: cabecera con foto de perfil para ajustes, navegación horizontal con Más, bienvenida, próximo evento, tarjetas y presupuesto. Paleta azul marino/dorado y tipografía europea. Mismo panel de ajustes; tema claro/oscuro e iconos europeos. Selector y Cambiar app abren directamente `TaxEurope/index.html`. |

## Abrir y comprobar localmente

Desde la raíz del proyecto:

```bash
python3 -m http.server 8765
```

Abrir `http://localhost:8765/selector.html`. Elegir TaxEurope debe abrir su dashboard. Desde Cambiar app elegir TaxUSA debe abrir el dashboard de la raíz; elegir TaxEurope debe abrir el dashboard europeo.

Para explorar sin cuenta: `http://localhost:8765/TaxEurope/index.html?demo=1`. La demo usa usuario/perfil/viaje locales propios, no inicializa Firebase y mantiene el parámetro al recorrer los módulos nativos. Login, perfiles y documentos requieren la sesión real. La demo no demuestra la sincronización de cuentas.

No abrir con `file://`: módulos, autenticación y service worker requieren un servidor HTTP/HTTPS. El dominio que se publique debe estar autorizado en Firebase Auth.

## Modelo y aislamiento

- TaxUSA conserva las páginas de la raíz. TaxEurope tiene páginas, assets, configuración y manifiesto propios.
- `assets/app-routes.js` es el punto compartido de rutas. La región de una página se determina por su URL, no por el último selector guardado por otra pestaña. La autenticación lleva siempre a `selector.html`; no usa `next`, el destino anterior o pendientes para saltar esa elección. Los otros retornos internos se validan contra origen, carpeta y páginas admitidas.
- Los viajes permanecen en `usuarios/{uid}/perfiles/{perfil}/tripPlanning/{tripId}` y llevan `region: 'europe'`. La lista común conserva los viajes de ambas apps, pero cada pantalla filtra su región. Activo/vista europeos utilizan claves distintas con `::europe`.
- Los registros europeos nuevos se guardan en `usuarios/{uid}/perfiles/{perfil}/tripPlanning/{tripId}/data/{eu_id}`. Son registros tipados: config, budget, expense, refund, stay, plan, reservation, place, packing, member, note y route.
- Caché local: `taxeurope-workspace-v1::{uid}::{perfil}::{tripId}`. No se crea almacén para `unassigned`. Los usuarios, perfiles y viajes tienen espacios separados.
- Las escrituras persisten localmente antes de comunicar éxito. Una cola conserva cambios pendientes. Transacciones comparan revisiones, los borrados conservan tombstones y un acuse antiguo no elimina una edición posterior. Los errores de conexión o permisos dejan un aviso de copia local pendiente, sin afirmar sincronización exitosa.
- Los formularios conservan sus borradores cuando llegan cambios del mismo viaje. Cambiar usuario/perfil/viaje vuelve a montar la pantalla correspondiente.
- La restauración valida todos los registros antes de escribir y exige el mismo usuario/perfil/viaje. Rechaza datos financieros inválidos y otros espacios. CSV protege celdas que puedan interpretarse como fórmulas.
- Documentos reutiliza el árbol y motor de archivos del proyecto original. No se cambiaron credenciales, endpoints ni la base de producción.

## Presupuesto multimoneda

Cada gasto conserva `amount`, `currency`, `baseCurrency`, `fx`, `fxDate` y `fxSource`. El cambio se expresa como 1 unidad de la moneda original → unidades de la moneda base. No se reemplaza por cotizaciones posteriores.

Ejemplo: GBP 50 con cambio 1,20 hacia EUR representa EUR 60. Si se cambia la moneda base a USD, esa conversión a EUR ya no se usa: el registro debe editarse para confirmar un cambio hacia USD. Gastos sin cambio se excluyen del total convertido y se señalan como pendientes. El importe original continúa visible.

Tax Free no vuelve a registrar el gasto de compra automáticamente: ingresarlo en Presupuesto una vez. En Tax Free, solo `status: received` y `receivedAmount` representan dinero recuperado. El IVA calculado y la comisión estimada no se descuentan del gasto.

## Cobertura fiscal y mantenimiento

El catálogo geográfico no implica cobertura legal automática de todas las ciudades o territorios. Se distingue entre herramientas operativas y reglas precargadas verificadas.

### Tax Free

| País | Regla precargada general |
| --- | --- |
| España | Sin mínimo general en el ámbito peninsular/Baleares; DIVA/DER. Territorios especiales requieren revisión. |
| Francia | Más de EUR 100 con IVA; edad mínima 16; visita inferior a 6 meses; condiciones de enseña/agrupación y hasta 3 días. |
| Italia | Más de EUR 70 por factura; OTELLO; salida dentro del tercer mes siguiente y devolución de factura validada dentro de cuatro meses siguientes al mes de compra. |
| Alemania | Más de EUR 50 con IVA por entrega; certificación de exportación. |
| Portugal | Evaluación sobre importe sin IVA. Más de EUR 50 según guía oficial; el umbral exacto de EUR 50 queda en revisión por diferencias de redacción entre fuentes oficiales. |
| Países Bajos | Al menos EUR 50; verificar factura y registro digital NL Customs VAT. |
| Austria | Más de EUR 75 por factura; DEV cuando corresponda. |
| Bélgica | Más de EUR 125 con IVA por factura. |
| Suiza | Al menos CHF 300 y exportación dentro de 90 días; residencia fuera de Suiza. |
| Reino Unido | Gran Bretaña no ofrece el régimen turístico habitual de bienes llevados en equipaje; Irlanda del Norte requiere revisión específica. |

Para las reglas generales indicadas de la UE se calcula el fin del tercer mes siguiente a la compra. Los restantes países quedan en estado de revisión y permiten seguimiento manual del trámite; no se les atribuye un mínimo inventado. Las condiciones preliminares cumplidas no constituyen aprobación ni devolución garantizada. La residencia es habitual/fiscal: no se infiere de la nacionalidad o pasaporte.

### Tasas de alojamiento

- Barcelona: categorías, recargo municipal, exención por edad y máximo de 7 unidades; período verificado 01/04/2026–31/03/2027. La estimación muestra la tasa antes del tratamiento de IVA aplicable a su facturación. Reservas con impuesto pagado por adelantado requieren confirmar la tarifa aplicable.
- Lisboa: EUR 4, máximo 7 noches, edad superior a 13 años.
- Oporto: EUR 3, máximo 7 noches, menores de 13 años exentos.
- Ámsterdam: 12,5% sobre precio sin IVA; residentes registrados y cruceros tienen condiciones distintas.
- Lisboa/Oporto tienen cobertura verificada hasta 31/12/2026 y Ámsterdam para 2026. El límite es de cobertura del catálogo, no una afirmación de derogación legal. Fechas fuera de cobertura requieren tarifa manual confirmada.
- La tarifa manual permite otras ciudades y exenciones confirmadas. El usuario debe indicar la fuente y verificar sujetos gravados/base/excepciones con el alojamiento. No agrupar estancias separadas para aplicar un límite que corresponde a una estancia continua.

Para ampliar cobertura, editar `TaxEurope/assets/europe-rules.js` con fuente oficial, fechas, territorio, categoría, base, mínimos y exenciones; agregar pruebas de límites y no extender la vigencia sin verificación. Las tasas estándar y ciudades están en `europe-data.js`.

## Fuentes oficiales incorporadas

Todas las reglas enlazan su fuente en la interfaz. Revisión: 02/10/2026.

- UE IVA: https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm
- UE compras de viajeros: https://europa.eu/youreurope/citizens/consumers/shopping/vat/index_en.htm
- España AEAT: https://sede.agenciatributaria.gob.es/Sede/viajeros-trabajadores-desplazados-fronterizos/devoluciones-iva-compras-viajeros/informacion-general-sobre-devolucion-iva-viajeros.html
- Francia Douane: https://www.douane.gouv.fr/demarche/vous-achetez-des-marchandises-en-detaxe
- Italia ADM: https://www.adm.gov.it/portale/rimborso-iva
- Alemania Zoll: https://www.zoll.de/EN/Private-individuals/Travel/Leaving-Germany/Tax-free-shopping/tax-free-shopping_node.html
- Portugal AT: https://info.portaldasfinancas.gov.pt/en/tax-information/travellers-and-customs/e-taxfree-vat-refund-for-tourists/Pages/default.aspx
- Países Bajos: https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/douane/reisbagage/btw-terugvragen-bij-uitvoer/
- Austria BMF: https://www.bmf.gv.at/en/topics/customs/travellers/vat-refund.html
- Bélgica FPS: https://finances.belgium.be/fr/node/7485
- Suiza ESTV: https://www.estv.admin.ch/en/tax-free-for-tourists
- Reino Unido: https://www.gov.uk/tax-on-shopping/taxfree-shopping
- Barcelona tarifas: https://atc.gencat.cat/es/tributs/ieet/quota-tributaria/
- Barcelona límite: https://atc.gencat.cat/es/tributs/ieet/base-imposable/
- Lisboa: https://informacoeseservicos.lisboa.pt/servicos/detalhe/taxa-municipal-turistica
- Oporto: https://comercioturismo.cm-porto.pt/turismo/taxa-municipal-turistica-do-porto
- Ámsterdam: https://www.amsterdam.nl/en/municipal-taxes/tourist-tax/
- Cambios de referencia BCE: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

Los comercios incluyen enlaces oficiales de El Corte Inglés, Carrefour, Cortefiel, la colección Bicester, Galeries Lafayette, Printemps, dm, ROSSMANN, Coop, Migros, Esselunga, Conad, Tesco, BILLA y Lidl. Son localizadores, no un inventario exhaustivo de sucursales ni garantía de Tax Free. dm/ROSSMANN están clasificados como cuidado personal, no como farmacias. Fidenza Village se identifica en Fidenza; los outlets de Madrid, Barcelona, París y Londres se presentan como zona cercana.

## Pruebas y límites de validación

`npm test`: 126 pruebas; 124 aprobadas, 1 omitida y 1 fallida. La falla es preexistente: el archivo `firestore.rules` no estaba en el ZIP original y una prueba existente intenta leerlo. No se inventaron ni desplegaron reglas de acceso para ocultar la falla.

Se verificaron:

- Cálculos de IVA, mínimos estrictos/inclusivos, base neta portuguesa, plazos y edades, territorios especiales y condiciones no verificadas.
- Tasas por noches/edades, categorías y porcentajes; presupuesto sin cambio y devoluciones reales; reparto exacto en centavos.
- Persistencia, aislamiento, cuotas, revisiones, cambios pendientes, tombstones, restauración atómica y rechazo de datos inválidos.
- Renderizado de los 11 módulos nativos en un arnés DOM; formularios de compras, IVA, alojamiento, rutas, Tax Free y grupo. El arnés verifica ejecución y guardado, no distribución visual de un navegador.
- Selector/cambio de app, retorno de login y rutas seguras; sintaxis de todos los scripts europeos; referencias HTML locales y todos los archivos precacheados.
- Caché actualizada mediante `node scripts/bump-cache.js`. `node scripts/bump-cache.js --check` valida su correspondencia con los assets.

No se ejecutó un navegador real porque no hay Chromium instalado en este entorno. No se accedió a una cuenta ni se escribió en Firebase de producción. Login, App Check, permisos reales, adjuntos y sincronización entre dispositivos deben comprobarse en el entorno de la aplicación antes de publicar. No se realizó despliegue.

## Comprobación de integración antes de publicar

1. Recuperar las reglas reales de Firestore del proyecto existente y revisar que un usuario pueda acceder solo a sus perfiles/viajes/registros. El árbol nuevo europeo usa el mismo esquema de propietario `usuarios/{uid}/perfiles/{perfil}/tripPlanning/{tripId}/data/{eu_id}`. Validar el comportamiento de `getDocsFromServer` y transacciones; no sustituir las reglas completas por permisos amplios.
2. Ingresar desde selector con TaxEurope; elegir perfil; confirmar dashboard europeo. Repetir desde Cambiar app. Incluso con `login.html?next=TaxEurope/taxfree.html`, el login debe abrir primero el selector.
3. Crear un viaje con Madrid/Barcelona y otro país. Abrir TaxUSA en otra pestaña: no debe cambiar el viaje activo europeo ni mostrar registros europeos.
4. Guardar gastos EUR/GBP/CHF, confirmar fecha/fuente de cambios y total parcial sin conversión; editar y volver a cargar. Registrar una devolución solicitada y luego una efectivamente cobrada.
5. Calcular y guardar alojamiento, agregarlo a Presupuesto dos veces y comprobar que se actualiza un único gasto. Confirmar excepciones y monto final con la factura del alojamiento.
6. Cortar conexión, editar, recargar después de desbloquear el modo sin conexión y volver a conectar; verificar estado sincronizado desde otra sesión. Simular permisos rechazados: debe mantenerse la copia local pendiente.
7. Probar adjuntos PDF/fotos por viaje; exportación/restauración JSON, CSV y rechazo de una copia de otro perfil. Comprobar cámara, límites de almacenamiento y comportamiento móvil.
8. Revisar visualmente escritorio y móvil, instalación PWA, cambio de tema y el worker compartido. Publicar el árbol completo conservando `TaxEurope/` y las rutas raíz existentes.

## Ajuste de diseño y login solicitado

Se reutilizaron los estilos de la estructura de inicio y el código del panel de ajustes de TaxUSA. Los módulos europeos conservan su motor de datos; se cambió la presentación de todas las pantallas nativas. La cabecera muestra `perfilActivoFoto` en un botón circular que abre los mismos ajustes. Los accesos están en la barra horizontal y en Más; el dashboard presenta las tarjetas del mismo modo que TaxUSA.

El selector de app cierra el panel y su overlay antes de abrir un diálogo centrado explícitamente con `position: fixed`, `inset: 0` y `margin: auto`, evitando que el reset global de márgenes lo desplace arriba a la izquierda. Respeta el tema claro/oscuro y admite Cancelar, Escape y clic fuera. Las rutas de ambos botones permanecen separadas.

`TaxEurope/login.html` y `TaxEurope/profiles.html` son solo redirecciones compatibles, sin formulario ni sesión propios. El único formulario de ingreso está en el login raíz de TaxFly. Después de autenticarse, siempre se abre el selector, aunque haya una región previa o un retorno pendiente. TaxEurope se elige allí; si falta perfil, se usa el selector de perfiles común antes del dashboard europeo. No se publicó en GitHub Pages desde este entorno.

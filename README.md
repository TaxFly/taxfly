# TaxFly · TaxUSA + TaxEurope

TaxUSA vive en la raíz. TaxEurope vive en `TaxEurope/` y se abre desde `selector.html` o Cambiar app. Las cuentas y perfiles existentes se reutilizan.

La guía de implementación, cobertura de reglas, pruebas y verificación antes de publicar está en [docs/TAXEUROPE.md](docs/TAXEUROPE.md).

Para abrir localmente: `python3 -m http.server 8765`. Visitar `http://localhost:8765/selector.html`. Demo sin cuenta: `http://localhost:8765/TaxEurope/index.html?demo=1`.

Pruebas: `npm test`. Caché: `node scripts/bump-cache.js --check`.

El ZIP original no incluye `firestore.rules`; la prueba que lo requiere continúa fallando. Recuperar las reglas reales del proyecto antes de validar publicación. Este paquete no modifica la configuración de producción ni despliega servicios.

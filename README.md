# TaxFly · TaxUSA

Aplicación de viajes a Estados Unidos. El login común abre directamente `index.html`, sin selector de aplicaciones. La selección y edición de perfiles continúa en `profiles.html`.

Para abrir localmente: `python3 -m http.server 8765`, luego `http://localhost:8765/login.html`.

Pruebas: `npm test`. Caché: `node scripts/bump-cache.js --check`.

El archivo `firestore.rules` no estaba incluido en el proyecto original; la prueba que lo requiere continúa fallando. No se realizó despliegue ni se modificaron datos de producción.

Las seis mejoras de viajes, reservas, documentos y Deshacer se explican en [la guía de uso y actualización](docs/MEJORAS_TAXUSA.md).

## IA: medición, créditos y seguridad

La infraestructura de IA autosustentable está documentada en `docs/AI_BILLING_SETUP.md`. El billing viene desactivado por defecto para permitir un rollout seguro por etapas.

# Firestore: seguridad de las colecciones de IA

Las colecciones `aiWallets`, `aiReservations`, `aiLedger` y `aiBudgets` están pensadas para ser server-only.

La cuenta de servicio usada por `claude-worker.js` accede por Firestore REST y no depende de las reglas de Security Rules del navegador.

No copies reglas nuevas a ciegas: integrá estas colecciones en las reglas reales de producción y verificá que ningún `match /{document=**}` más amplio las habilite. En Firestore, un `allow` de otro match aplicable no queda anulado por un `allow ...: if false` más específico.

Objetivo de seguridad:

- cliente web: sin acceso directo a esas cuatro colecciones;
- Cloudflare Worker con service account: acceso permitido por IAM;
- UI: consulta el saldo únicamente vía `ai_status` del Worker.

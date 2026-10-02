# TaxUSA / TaxFly — IA autosustentable

Esta versión deja preparada la infraestructura de IA con:

- medición de tokens/costo por función en Cloudflare Workers Analytics Engine;
- owner por Firebase UID (créditos ilimitados, pero medido);
- circuit breakers monetarios diarios/semanales/globales;
- wallet + ledger + reservas idempotentes en Firestore vía REST;
- créditos iniciales solo para email verificado;
- request_id por petición para evitar doble captura por reintentos;
- endpoint `ai_status` y visualización básica del saldo en Ajustes;
- endpoint owner `ai_grant_credits` para otorgar créditos manualmente.

## Estado seguro por defecto

`wrangler.toml` viene con:

- `AI_BILLING_ENABLED = "false"`
- `AI_SAFETY_BUDGETS_ENABLED = "false"`

Eso significa que podés desplegar primero para medir uso sin descontar créditos. No actives billing hasta terminar los pasos de Firestore.

## 1. Firebase — obtener tu OWNER_UID

Firebase Console → Authentication → Users → buscá tu cuenta de propietario → copiá el UID.

No uses el email como bypass. El Worker compara únicamente `user.uid === env.OWNER_UID`.

## 2. Firebase / Google Cloud — crear una cuenta de servicio

Usá una cuenta de servicio del proyecto `viajes-db538` que pueda acceder a Firestore. Podés generar una clave JSON desde Firebase Console → Project settings → Service accounts, o desde Google Cloud IAM.

Del JSON solo hacen falta:

- `client_email`
- `private_key`

NO subas el JSON al repositorio y NO pongas la private key en `wrangler.toml`.

## 3. Cloudflare — cargar secrets

Desde la carpeta del Worker:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put OWNER_UID
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_EMAIL
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY
```

Para `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`, pegá el bloque PEM completo, incluyendo `BEGIN PRIVATE KEY` y `END PRIVATE KEY`.

Si `ANTHROPIC_API_KEY` ya existe, no hace falta volver a cargarla.

## 4. Cloudflare — desplegar primero en modo medición

No cambies todavía los flags del `wrangler.toml`.

```bash
npx wrangler deploy
```

El binding `AI_ANALYTICS` crea el dataset `taxfly_ai_usage` automáticamente al primer write.

La telemetría NO guarda prompts, imágenes ni texto de tickets: guarda feature, modelo, estado, UID como índice, tokens, búsquedas web, costo estimado y latencia.

## 5. Probar owner y Firestore

Entrá a TaxUSA con tu cuenta. En Ajustes debería mostrarse:

`Créditos IA  ∞ · Owner`

El endpoint interno `ai_status` debe indicar `owner: true`.

Si no aparece owner, revisá que `OWNER_UID` sea exactamente el UID de Firebase Authentication.

## 6. Activar circuit breakers monetarios

Cuando los secrets de Firestore estén correctos, cambiá:

```toml
AI_SAFETY_BUDGETS_ENABLED = "true"
```

Los límites iniciales incluidos son:

```toml
OWNER_DAILY_USD_LIMIT = "5"
OWNER_WEEKLY_USD_LIMIT = "20"
GLOBAL_DAILY_USD_LIMIT = "25"
```

Podés cambiarlos sin tocar el código. Son límites de seguridad, no créditos.

Para máxima seguridad podés cambiar también:

```toml
AI_SAFETY_FAIL_CLOSED = "true"
```

Con eso, si Firestore no puede verificar el presupuesto, las llamadas de IA se bloquean en vez de continuar.

## 7. Firestore — colecciones creadas por el Worker

El Worker usa estas colecciones top-level:

- `aiWallets/{uid}`
- `aiReservations/{requestId}`
- `aiLedger/{entryId}`
- `aiBudgets/{counterId}`
- `aiProfileLimits/{uid}__{profileId}`

El acceso del Worker se hace con la cuenta de servicio y no depende de las reglas cliente.

IMPORTANTE: asegurate de que tus reglas de Firestore NO tengan un catch-all que permita a cualquier usuario autenticado leer/escribir todo, por ejemplo:

```text
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

Si existe una regla amplia así, estas colecciones quedarían expuestas al navegador. En producción deben ser inaccesibles para clientes; solamente el Worker debe escribirlas.

## 8. Créditos iniciales y verificación de email

`AI_STARTER_CREDITS = "10"`.

Un usuario sin email verificado no recibe créditos iniciales. Cuando verifica el email, el grant se hace una única vez y queda registrado en `aiLedger`.

Tu cuenta owner no consume créditos y muestra infinito, pero sus llamadas sí se miden y cuentan para los límites USD.

## 9. Activar cobro por créditos

Solo después de probar varias llamadas y verificar que reservas, liberaciones y ledger funcionan correctamente:

```toml
AI_BILLING_ENABLED = "true"
```

Luego desplegá:

```bash
npx wrangler deploy
```

Costos iniciales de créditos:

- `invoice_ocr`: 1
- `insurance_analysis`: 2
- `moderate_image`: 1
- `optimize_route`: 3
- `taxie_chat`: 1
- `compare_shopping`: 2

Todavía son valores beta. Ajustalos después de observar el costo real en Analytics Engine.

## 10. Idempotencia

`config.js` agrega automáticamente un `request_id` UUID a cada llamada de IA.

En billing activo el Worker crea una reserva usando ese ID. El mismo ID no puede capturarse dos veces. Si Claude falla o la respuesta final no es 2xx, los créditos reservados vuelven al saldo.

## 11. Analytics Engine — columnas

En `taxfly_ai_usage`:

Blobs:

1. feature
2. modelo
3. `success` / `error`
4. código de error
5. `owner` / `user`

Doubles:

1. input tokens
2. output tokens
3. cache read tokens
4. cache creation tokens
5. web search requests
6. costo estimado USD
7. latencia ms

Index: Firebase UID.

La retención de Analytics Engine es temporal; el ledger financiero permanente queda en Firestore.

## 12. Precios de Anthropic usados por el estimador

El Worker está configurado con los precios actuales usados por los modelos de este proyecto al momento de esta versión:

- Claude Haiku 4.5: USD 1 / millón input, USD 5 / millón output, cache read USD 0.10 / millón, cache write USD 1.25 / millón.
- Claude Sonnet 5: USD 2 / millón input, USD 10 / millón output, cache read USD 0.20 / millón, cache write USD 2.50 / millón.
- Web search: USD 0.01 por búsqueda.

Si Anthropic cambia precios, actualizar `MODEL_PRICING_USD_PER_M` y `WEB_SEARCH_USD_PER_REQUEST` en `claude-worker.js`.

## 13. Pagos reales

No se conecta Stripe/Mercado Pago en esta entrega porque requiere elegir proveedor, país/cuenta comercial, moneda, comisiones, credenciales y URL de webhook. El core de créditos ya está preparado: un webhook validado debería acreditar saldo en Firestore mediante una operación server-side/ledger equivalente a `grantCredits`.

NO implementes un webhook que confíe en datos enviados por el navegador. La acreditación debe ocurrir únicamente después de verificar criptográficamente el webhook del proveedor.

## 14. Despliegue recomendado

1. Subir este ZIP a GitHub.
2. Cargar secrets de Cloudflare.
3. Deploy con billing OFF y safety budgets OFF.
4. Confirmar Analytics Engine durante algunos días.
5. Activar safety budgets.
6. Probar owner y un usuario beta con email verificado.
7. Activar billing para betas.
8. Recién después conectar un medio de pago.


## Límites de IA por perfil

La wallet de créditos pertenece al UID de Firebase. Los perfiles no tienen wallets separadas: pueden tener un límite de consumo sobre la wallet de la cuenta.

Modos disponibles:

- `unlimited`: sin límite interno por perfil; sigue sujeto al saldo de la cuenta.
- `limited`: máximo acumulado de créditos hasta que el titular restablezca el uso.
- `blocked`: ese perfil no puede iniciar llamadas de IA.

Los límites se guardan del lado servidor en `aiProfileLimits` y las reservas actualizan `reservedCredits` / `usedCredits` de forma transaccional. El `profile_id` enviado por el frontend se valida contra un perfil existente de `usuarios/{uid}/perfiles/{profileId}`.

> Nota: los perfiles comparten la misma sesión de Firebase. Este control evita consumo accidental y aplica límites normales dentro de la app, pero no sustituye cuentas separadas como frontera de seguridad frente a una persona con acceso técnico a la sesión.

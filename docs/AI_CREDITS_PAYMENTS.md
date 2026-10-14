# Cobrar créditos de IA: Mercado Pago, Stripe y PayPal

Los tres proveedores comparten el mismo mecanismo del lado servidor: `claude-worker.js`
crea un documento `aiCheckouts/{checkoutId}` (quién, cuántos créditos, qué moneda),
el comprador paga en el sitio del proveedor, y un webhook (más, para PayPal, una
confirmación al volver el comprador) acredita la wallet llamando a
`confirmCheckoutPayment`. Esa función es **idempotente**: no importa cuántas veces
llegue la notificación, el crédito se otorga una sola vez por pago real.

El precio sale siempre de `AI_CREDIT_USD_PER_CREDIT` (ya en `wrangler.toml`). Mercado
Pago lo convierte a ARS con `MP_USD_ARS_RATE` (manual, lo actualizás vos); Stripe y
PayPal cobran directo en USD.

## 1. Mercado Pago (ya funcionando)

No requiere cambios: `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET` ya
están configurados como antes.

## 2. Stripe (tarjetas internacionales)

1. Creá una cuenta en [dashboard.stripe.com](https://dashboard.stripe.com) si todavía
   no tenés una. Podés operar con cuenta registrada en Argentina: Stripe liquida en
   USD a una cuenta bancaria local.
2. Dashboard → **Developers → API keys** → copiá la *Secret key* (`sk_live_...` en
   modo real, `sk_test_...` en modo de prueba).
   ```
   npx wrangler secret put STRIPE_SECRET_KEY
   ```
3. Dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://taxfly-claude.juanbria18.workers.dev/stripe/webhook`
   - Evento a escuchar: `checkout.session.completed` (es el único que procesamos).
4. Copiá el *Signing secret* del endpoint recién creado (`whsec_...`):
   ```
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```
5. Probá primero en modo test (`sk_test_...` + webhook en modo test, tarjeta de
   prueba `4242 4242 4242 4242`) antes de pasar a las claves `live`.

**Importante:** Stripe solo habilita PayPal como medio de pago dentro de su propio
Checkout si la cuenta está domiciliada en Europa/Reino Unido. Con cuenta argentina
no aparece esa opción — por eso PayPal se integra aparte, directo contra la API de
PayPal (paso 3).

## 3. PayPal

1. Creá una app en [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications)
   (podés crear primero una en modo **Sandbox** para probar sin plata real).
2. Copiá el *Client ID* y el *Secret* de la app:
   ```
   npx wrangler secret put PAYPAL_CLIENT_ID
   npx wrangler secret put PAYPAL_CLIENT_SECRET
   ```
3. En `wrangler.toml`, dejá `PAYPAL_ENV = "sandbox"` mientras probás. Cuando pases a
   cobrar de verdad, cambialo a `PAYPAL_ENV = "live"` (o borrá la línea).
4. Dashboard de la app → **Webhooks → Add Webhook**:
   - URL: `https://taxfly-claude.juanbria18.workers.dev/paypal/webhook`
   - Evento a escuchar: `PAYMENT.CAPTURE.COMPLETED` (es el único que procesamos).
5. Copiá el **Webhook ID** que te muestra PayPal (no es secreto, es un identificador)
   y pegalo en `wrangler.toml`:
   ```toml
   PAYPAL_WEBHOOK_ID = "el-id-que-te-dio-paypal"
   ```

A diferencia de Mercado Pago y Stripe, PayPal además se confirma **al volver el
comprador** a la app (`ai_paypal_capture`), porque su webhook puede demorar más que
el tiempo que tarda alguien en volver de pagar. El webhook queda como respaldo: si
el comprador cierra la pestaña antes de volver, el pago se acredita igual apenas
llega la notificación.

## 4. Verificar que quedó bien

- `ai_status` ahora devuelve `paymentProviders: { mercadopago, stripe, paypal }` —
  cada uno en `true` solo cuando sus secrets están cargados. La pantalla de
  Ajustes → Comprar créditos solo habilita los botones de los proveedores en `true`.
- Hacé una compra de prueba con cada proveedor que actives (modo test/sandbox
  primero) y confirmá que el saldo sube en Ajustes.
- Revisá los logs del Worker (`npx wrangler tail`) si algún webhook no acredita:
  los tres devuelven **401** si la firma no valida y **500** si falló algo transitorio
  de Firestore (en ambos casos el proveedor reintenta solo; no hace falta
  reprocesar nada a mano).

## 5. Lo que falta para que esto sea un cobro "de verdad"

Esta entrega conecta el checkout y la acreditación automática. Todavía no incluye:
- Reembolsos (habría que descontar créditos y, si corresponde, devolver plata desde
  cada dashboard — no hay automatización acá).
- Facturación/comprobantes fiscales — cada proveedor emite su propio recibo de pago,
  pero no hay factura de TaxUSA como tal.
- Un tope de compras por usuario/día (más allá del rate limit general del Worker),
  si en algún momento ves abuso con tarjetas robadas probando montos chicos.

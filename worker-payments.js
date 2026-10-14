// worker-payments.js — Stripe y PayPal: creación de checkout y verificación de webhooks
// para pagos internacionales. Mercado Pago (Argentina) vive directo en claude-worker.js
// porque fue lo primero que se implementó; este archivo sigue el mismo patrón de
// checkout genérico (createCreditCheckout/confirmCheckoutPayment en worker-firestore.js),
// solo que correlaciona el pago con el checkout vía checkoutId en vez de external_reference.

function hex(buf) {
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("");
}
async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return hex(sig);
}
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ================= Stripe =================

export async function createStripeCheckoutSession(env, { checkoutId, email, credits, amountUsd, returnBase }) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe no configurado");
  if (!(amountUsd > 0)) throw new Error("Importe USD inválido");
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${returnBase}?ai_checkout=success&provider=stripe&checkout_id=${encodeURIComponent(checkoutId)}`);
  params.set("cancel_url", `${returnBase}?ai_checkout=cancel&provider=stripe&checkout_id=${encodeURIComponent(checkoutId)}`);
  params.append("payment_method_types[]", "card");
  params.set("client_reference_id", checkoutId);
  if (email) params.set("customer_email", email);
  params.set("metadata[checkoutId]", checkoutId);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(Number(amountUsd) * 100)));
  params.set("line_items[0][price_data][product_data][name]", `${credits} créditos IA · TaxUSA`);
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${key}` },
    body: params.toString()
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(new Error("No se pudo crear la sesión de Stripe"), { detail });
  }
  const data = await res.json();
  return { checkoutUrl: data.url, sessionId: data.id };
}

// Stripe firma el payload: a diferencia de Mercado Pago, acá sí se puede confiar
// directamente en el cuerpo del evento una vez validada la firma.
export async function verifyStripeSignature(env, rawBody, sigHeader) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !sigHeader) return false;
  const parts = {};
  for (const chunk of String(sigHeader).split(",")) {
    const idx = chunk.indexOf("=");
    if (idx === -1) continue;
    parts[chunk.slice(0, idx).trim()] = chunk.slice(idx + 1).trim();
  }
  if (!parts.t || !parts.v1) return false;
  const age = Math.abs(Date.now() / 1000 - Number(parts.t));
  if (!Number.isFinite(age) || age > 300) return false; // tolerancia de 5 min, igual que el SDK oficial
  const expected = await hmacSha256Hex(secret, `${parts.t}.${rawBody}`);
  return timingSafeEqual(expected, parts.v1);
}

// ================= PayPal =================

let cachedPaypalToken = null;
function paypalBase(env) {
  return env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
}
async function getPaypalAccessToken(env) {
  if (cachedPaypalToken && cachedPaypalToken.exp > Date.now() + 30_000) return cachedPaypalToken.token;
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) throw new Error("PayPal no configurado");
  const basic = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  if (!res.ok) throw new Error("No se pudo autenticar con PayPal");
  const data = await res.json();
  cachedPaypalToken = { token: data.access_token, exp: Date.now() + Number(data.expires_in || 300) * 1000 };
  return cachedPaypalToken.token;
}

export async function createPaypalOrder(env, { checkoutId, credits, amountUsd, returnBase }) {
  if (!(amountUsd > 0)) throw new Error("Importe USD inválido");
  const token = await getPaypalAccessToken(env);
  const body = {
    intent: "CAPTURE",
    purchase_units: [{
      custom_id: checkoutId,
      invoice_id: checkoutId,
      description: `${credits} créditos IA · TaxUSA`,
      amount: { currency_code: "USD", value: Number(amountUsd).toFixed(2) }
    }],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: `${returnBase}?ai_checkout=return&provider=paypal&checkout_id=${encodeURIComponent(checkoutId)}`,
          cancel_url: `${returnBase}?ai_checkout=cancel&provider=paypal&checkout_id=${encodeURIComponent(checkoutId)}`,
          user_action: "PAY_NOW",
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED"
        }
      }
    }
  };
  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "PayPal-Request-Id": checkoutId },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(new Error("No se pudo crear la orden de PayPal"), { detail });
  }
  const data = await res.json();
  const approve = (data.links || []).find(l => l.rel === "approve" || l.rel === "payer-action");
  return { checkoutUrl: approve ? approve.href : null, orderId: data.id };
}

// Tolera ORDER_ALREADY_CAPTURED (422): puede pasar si el webhook ya la capturó
// antes de que el comprador vuelva a la app. No es un error real.
export async function capturePaypalOrder(env, orderId) {
  const token = await getPaypalAccessToken(env);
  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data.name !== "UNPROCESSABLE_ENTITY") {
    throw Object.assign(new Error("No se pudo capturar el pago de PayPal"), { detail: data });
  }
  return data;
}

export async function getPaypalOrder(env, orderId) {
  const token = await getPaypalAccessToken(env);
  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("No se pudo leer la orden de PayPal");
  return res.json();
}

// Encuentra la primera captura COMPLETED y el checkoutId que le corresponde,
// tanto en la respuesta de /capture como en una relectura de la orden.
export function findCompletedCapture(order) {
  const unit = (order?.purchase_units || [])[0];
  const capture = (unit?.payments?.captures || []).find(c => c.status === "COMPLETED");
  if (!capture) return null;
  const checkoutId = unit?.custom_id || capture.custom_id || unit?.invoice_id || "";
  return { capture, checkoutId };
}

export async function verifyPaypalWebhookSignature(env, headers, rawBody) {
  if (!env.PAYPAL_WEBHOOK_ID) return false;
  let event;
  try { event = JSON.parse(rawBody); } catch (e) { return false; }
  const token = await getPaypalAccessToken(env);
  const payload = {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: env.PAYPAL_WEBHOOK_ID,
    webhook_event: event
  };
  const res = await fetch(`${paypalBase(env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return data.verification_status === "SUCCESS";
}

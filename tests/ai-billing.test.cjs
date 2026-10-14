const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('AI worker instruments Anthropic usage with billing enabled', () => {
  const worker = read('claude-worker.js');
  const wrangler = read('wrangler.toml');
  assert.match(worker, /AI_ANALYTICS\.writeDataPoint/);
  assert.match(worker, /estimateAnthropicCost/);
  assert.match(worker, /reserveCredits/);
  assert.match(worker, /finalizeReservation/);
  assert.match(worker, /requestId/);
  assert.match(wrangler, /AI_BILLING_ENABLED = "true"/);
  assert.match(wrangler, /binding = "AI_ANALYTICS"/);
});

test('owner bypass is UID based and guarded by monetary safety settings', () => {
  const worker = read('claude-worker.js');
  const wrangler = read('wrangler.toml');
  assert.match(worker, /user\.uid === env\.OWNER_UID/);
  assert.doesNotMatch(worker, /juanbria18@gmail\.com/i);
  assert.match(wrangler, /OWNER_DAILY_USD_LIMIT/);
  assert.match(wrangler, /OWNER_WEEKLY_USD_LIMIT/);
  assert.match(wrangler, /GLOBAL_DAILY_USD_LIMIT/);
});

test('Firestore wallet uses available and reserved credits plus idempotent reservation ids', () => {
  const code = read('worker-firestore.js');
  assert.match(code, /availableCredits/);
  assert.match(code, /reservedCredits/);
  assert.match(code, /aiReservations/);
  assert.match(code, /currentDocument/);
  assert.match(code, /starterCreditsGranted/);
  assert.match(code, /aiLedger/);
});

test('client adds request_id and exposes AI status helper', () => {
  const code = read('config.js');
  assert.match(code, /crypto\.randomUUID/);
  assert.match(code, /request_id/);
  assert.match(code, /taxflyAIStatus/);
});


test('settings exposes an aesthetic AI credits center with purchase, history and Cafecito support', () => {
  const settings = read('assets/settings.js');
  const config = read('config.js');
  assert.match(settings, /buy-credits/);
  assert.match(settings, /ai-history/);
  assert.match(settings, /cafecito/);
  assert.match(settings, /<details class=\"sx-ai\">/);
  assert.match(settings, /sxmCustomCredits/);
  assert.match(settings, /price_currency_note/);
  assert.match(settings, /taxes_note/);
  assert.match(config, /SUPPORT_CAFECITO_URL/);
  assert.match(config, /AI_CREDIT_PACKAGES/);
  assert.match(config, /AI_CREDIT_CURRENCY: \"USD\"/);
});

test('credit purchase flow covers Mercado Pago, Stripe and PayPal with idempotent server-side crediting', () => {
  const worker = read('claude-worker.js');
  const firestore = read('worker-firestore.js');
  const payments = read('worker-payments.js');
  const settings = read('assets/settings.js');
  assert.match(worker, /ai_credit_checkout_create/);
  assert.match(worker, /\/mp\/webhook/);
  assert.match(worker, /\/stripe\/webhook/);
  assert.match(worker, /\/paypal\/webhook/);
  assert.match(worker, /handleStripeWebhook/);
  assert.match(worker, /handlePaypalWebhook/);
  assert.match(worker, /handlePaypalCapture/);
  assert.match(firestore, /confirmCheckoutPayment/);
  assert.match(firestore, /exists: false/);
  assert.match(payments, /verifyStripeSignature/);
  assert.match(payments, /verifyPaypalWebhookSignature/);
  assert.match(settings, /ai_credit_checkout_create/);
  assert.match(settings, /ai_paypal_capture/);
  assert.match(settings, /openProviderPicker/);
});

test('Stripe and PayPal webhook signatures are never trusted without verification', () => {
  const payments = read('worker-payments.js');
  const worker = read('claude-worker.js');
  assert.match(payments, /hmacSha256Hex/);
  assert.match(payments, /timingSafeEqual/);
  // Stripe: ventana de tolerancia contra ataques de repetición.
  assert.match(payments, /age > 300/);
  // El webhook de Stripe arranca leyendo el cuerpo crudo antes de parsear JSON,
  // condición necesaria para poder validar la firma HMAC sobre el payload exacto.
  const stripeHandlerStart = worker.indexOf('async function handleStripeWebhook');
  const stripeHandlerBody = worker.slice(stripeHandlerStart, stripeHandlerStart + 400);
  assert.match(stripeHandlerBody, /request\.text\(\)/);
  assert.match(stripeHandlerBody, /verifyStripeSignature/);
});

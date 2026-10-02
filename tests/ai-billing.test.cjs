const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('AI worker instruments Anthropic usage and keeps billing disabled by default', () => {
  const worker = read('claude-worker.js');
  const wrangler = read('wrangler.toml');
  assert.match(worker, /AI_ANALYTICS\.writeDataPoint/);
  assert.match(worker, /estimateAnthropicCost/);
  assert.match(worker, /reserveCredits/);
  assert.match(worker, /finalizeReservation/);
  assert.match(worker, /requestId/);
  assert.match(wrangler, /AI_BILLING_ENABLED = "false"/);
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

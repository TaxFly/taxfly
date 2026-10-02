const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('AI calls carry active profile context', () => {
  const cfg = read('config.js');
  assert.match(cfg, /body\.profile_id\s*=\s*localStorage\.getItem\("perfilActivoId"\)/);
});

test('worker exposes authenticated profile limit endpoints', () => {
  const w = read('claude-worker.js');
  assert.match(w, /ai_profile_limits_get/);
  assert.match(w, /ai_profile_limit_set/);
  assert.match(w, /PROFILE_AI_BLOCKED/);
  assert.match(w, /PROFILE_AI_LIMIT_REACHED/);
  assert.match(w, /skipWallet:\s*isOwner/);
});

test('Firestore reservations enforce and account profile limits atomically', () => {
  const f = read('worker-firestore.js');
  assert.match(f, /aiProfileLimits/);
  assert.match(f, /usedCredits/);
  assert.match(f, /reservedCredits/);
  assert.match(f, /profileLimited/);
  assert.match(f, /usedCredits:\s*Math\.max\(0, Number\(base\.usedCredits/);
});

test('settings provides simple per-profile modes', () => {
  const s = read('assets/settings.js');
  assert.match(s, /ai_limit_unlimited/);
  assert.match(s, /ai_limit_limited/);
  assert.match(s, /ai_limit_blocked/);
  assert.match(s, /openAIProfileLimits/);
});

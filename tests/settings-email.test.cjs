const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('settings email action works independently of page-specific doChangeEmail', () => {
  const settings = read('assets/settings.js');
  assert.match(settings, /async function changeEmailFromSettings\(\)/);
  assert.match(settings, /verifyBeforeUpdateEmail\(user, email\)/);
  assert.match(settings, /case "email":\s*changeEmailFromSettings\(\);/s);
  assert.doesNotMatch(settings, /case "email":\s*call\("doChangeEmail"\);/s);
});

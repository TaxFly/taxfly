const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','assets','settings.js'),'utf8');

test('settings profile avatar keeps a square crop and renders the photo with object-fit cover', () => {
  assert.match(src, /aspect-ratio:1\/1/);
  assert.match(src, /overflow:hidden/);
  assert.match(src, /#settingsDrawer \.sx-av img\{[^}]*object-fit:cover/);
  assert.match(src, /document\.createElement\("img"\)/);
  assert.match(src, /img\.src = String\(foto\)/);
});

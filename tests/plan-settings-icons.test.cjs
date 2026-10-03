const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'plan-settings-extras.js'), 'utf8');

test('planning settings extras keep the original section icons and chevrons', () => {
  assert.match(source, /data-wipe="outlets"[\s\S]*class="sx-ico"/);
  assert.match(source, /data-wipe="comidas"[\s\S]*class="sx-ico"/);
  assert.match(source, /data-wipe="walmart"[\s\S]*class="sx-ico"/);
  assert.match(source, /data-wipe="parques"[\s\S]*class="sx-ico"/);
  const chevrons = (source.match(/class="sx-go"/g) || []).length;
  assert.equal(chevrons, 4);
});

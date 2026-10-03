const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('first/single profile becomes the stable primary profile',()=>{const p=read('assets/profiles-app.js');assert.match(p,/primaryProfileId/);assert.match(p,/profiles\.length === 1/);assert.match(p,/primaryProfileId: newProfile\.id/);assert.match(p,/showPrimaryChooser/);});
test('profile administration is security-PIN protected',()=>{const w=read('claude-worker.js'),f=read('worker-firestore.js'),s=read('assets/settings.js');assert.match(w,/security_pin_verify/);assert.match(w,/verifySecurityPin/);assert.match(f,/verifyPbkdf2Pin/);assert.match(f,/PRIMARY_PROFILE_REQUIRED/);assert.match(s,/promptSecurityPin/);});
test('profile controls include full, standard and read-only access plus AI limits',()=>{const s=read('assets/settings.js');assert.match(s,/access_full/);assert.match(s,/access_standard/);assert.match(s,/access_readonly/);assert.match(s,/profile_controls_set/);assert.match(s,/ai_profile_limit_set/);});
test('general profile guard is loaded by core pages',()=>{const g=read('assets/profile-access.js');assert.match(g,/data-profile-access/);assert.match(g,/accessLevel===\"readonly\"/);assert.match(g,/accessLevel===\"standard\"/);for(const p of ['index.html','compras.html','tickets.html','rutas.html','planificacion.html'])assert.match(read(p),/assets\/profile-access\.js/);});
test('new security PINs use six digits while legacy four-digit PINs remain supported',()=>{const l=read('assets/login-app.js');assert.match(l,/NEW_PIN_LENGTH = 6/);assert.match(l,/return n === 6 \? 6 : 4/);assert.match(l,/pinLength: NEW_PIN_LENGTH/);});


test('server PIN verification respects Cloudflare 100k PBKDF2 ceiling and migrates legacy hashes',()=>{
  const f=read('worker-firestore.js'), sec=read('assets/security.js'), settings=read('assets/settings.js');
  assert.match(f,/PIN_REHASH_REQUIRED/);
  assert.match(f,/iterations > 100000/);
  assert.match(f,/crypto\.subtle\.deriveBits/);
  assert.match(sec,/TAXFLY_PIN_ITERATIONS = 100000/);
  assert.match(settings,/security_pin_rehash/);
});

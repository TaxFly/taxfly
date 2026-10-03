const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
test("AI status auth initializes Firebase before requesting the worker",()=>{const s=read("config.js");assert.match(s,/initializeApp\(window\.TAXFLY_CONFIG\.FIREBASE_CONFIG\)/);assert.match(s,/authStateReady/);});
test("failed AI status is retryable and not cached for 30 seconds",()=>{const s=read("assets/settings.js");assert.match(s,/aiStatusAt = 0/);assert.match(s,/aiStatusRetry < 4/);assert.match(s,/refreshAIStatus\(true\)/);});
test("Planificación loads the full shared Settings drawer with AI credits and profile controls",()=>{const h=read("planificacion.html");assert.match(h,/assets\/settings\.js/);assert.match(h,/assets\/plan-settings-extras\.js/);assert.doesNotMatch(h,/assets\/app-settings\.js/);});

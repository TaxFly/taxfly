const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");

test("planning searches and activity/checklist icons avoid the reported emojis and include i18n hooks", () => {
  const html = read("lugares.html");
  const js = read("assets/lugares.js");
  assert.match(html, /id="searchActs"[^>]*data-i18n-placeholder="search_activities_placeholder"/);
  assert.match(html, /id="searchNotes"[^>]*data-i18n-placeholder="search_notes_placeholder"/);
  assert.doesNotMatch(html, /🔎 Buscar actividades/);
  assert.doesNotMatch(html, /🔎 Buscar notas/);
  assert.match(js, /search_activities_placeholder: "Search activities…"/);
  assert.match(js, /search_notes_placeholder: "Search notes…"/);
  assert.match(js, /function activityTimeMeta\(act, lang\)/);
  assert.match(js, /function formatChecklistItem\(item\)/);
  assert.match(js, /item\.startsWith\("🎒 "\)/);
});

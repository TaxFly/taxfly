#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');

function extractPrecachePaths(source) {
  const match = source.match(/const PRECACHE = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('No se encontró PRECACHE en sw.js');
  const values = JSON.parse(match[1]);
  if (!Array.isArray(values) || !values.length) throw new Error('PRECACHE vacío');
  return values.filter(value => value.startsWith('./'));
}

function cacheVersion(source, root = ROOT) {
  const hash = crypto.createHash('sha256');
  hash.update(source.replace(/^const CACHE = [\"'][^\"']+[\"'];/m, 'const CACHE = \"<version>\";'));
  for (const url of extractPrecachePaths(source).sort()) {
    const file = path.resolve(root, url);
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error(`Falta el archivo precargado: ${url}`);
    hash.update(url).update(fs.readFileSync(file));
  }
  return `taxfly-${hash.digest('hex').slice(0, 12)}`;
}

function main() {
  const source = fs.readFileSync(SW_PATH, 'utf8');
  const expected = cacheVersion(source);
  const current = source.match(/^const CACHE = ["']([^"']+)["'];/m)?.[1];
  if (!current) throw new Error('No se encontró CACHE en sw.js');
  if (current === expected) { console.log(`Caché al día: ${current}`); return; }
  if (process.argv.includes('--check')) {
    console.error(`Caché desactualizada: ${current} → ${expected}`);
    process.exitCode = 1;
    return;
  }
  fs.writeFileSync(SW_PATH, source.replace(/^const CACHE = ["'][^"']+["'];/m, `const CACHE = "${expected}";`));
  console.log(`Caché actualizada: ${current} → ${expected}`);
}

if (require.main === module) main();
module.exports = {extractPrecachePaths, cacheVersion};

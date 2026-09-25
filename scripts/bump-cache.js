#!/usr/bin/env node
// Calcula el nombre de CACHE en sw.js a partir de un hash del contenido de
// los archivos que están en PRECACHE, en vez de que alguien tenga que
// acordarse de subirlo a mano cada vez que cambia algo.
//
// Por qué hace falta esto y no alcanza con cambiar un archivo cualquiera:
// el navegador solo vuelve a instalar el Service Worker cuando el BYTE
// CONTENT de sw.js cambia. Si editás tax.html pero no tocás sw.js, el
// navegador nunca se entera de que hay algo nuevo para cachear, y el
// usuario sigue viendo la versión vieja hasta que a alguien se le ocurra
// bumpear CACHE a mano. Generar CACHE desde un hash del contenido real
// hace que sw.js cambie de bytes automáticamente cada vez que cambia
// cualquier archivo cacheado, sin depender de acordarse.
//
// Uso:
//   node scripts/bump-cache.js            → escribe sw.js si el hash cambió
//   node scripts/bump-cache.js --check    → no escribe, sale con código 1
//                                            si sw.js quedaría desactualizado
//                                            (útil para un chequeo en CI)
//
// No toca TILES_CACHE (esa es para los tiles de OpenStreetMap, no depende
// de ningún archivo del repo).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');

function readSw() {
  return fs.readFileSync(SW_PATH, 'utf8');
}

// Saca la lista de PRECACHE del propio sw.js, para no tener que mantenerla
// duplicada acá. Solo nos interesan los paths locales (los que empiezan con
// './'); los de gstatic.com son externos y ya están versionados en su URL.
function extractPrecachePaths(swSource) {
  const match = swSource.match(/const PRECACHE = \[([\s\S]*?)\];/);
  if (!match) throw new Error('No encontré el array PRECACHE en sw.js');
  const entries = [...match[1].matchAll(/'(\.\/[^']+)'/g)].map(m => m[1]);
  if (!entries.length) throw new Error('PRECACHE está vacío o no lo pude leer');
  return entries;
}

function hashPrecachedFiles(paths) {
  const hash = crypto.createHash('sha256');
  for (const p of paths.slice().sort()) { // orden estable
    const filePath = path.join(ROOT, p);
    hash.update(p); // el path también entra al hash: renombrar/mover cuenta como cambio
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      hash.update(fs.readFileSync(filePath));
    } else {
      console.warn(`[bump-cache] aviso: ${p} está en PRECACHE pero no existe en el repo`);
      hash.update('__missing__');
    }
  }
  return hash.digest('hex').slice(0, 12);
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const swSource = readSw();
  const paths = extractPrecachePaths(swSource);
  const newHash = hashPrecachedFiles(paths);
  const newCacheLine = `const CACHE = 'taxfly-${newHash}';`;

  const currentMatch = swSource.match(/const CACHE = '([^']+)';/);
  const currentValue = currentMatch ? currentMatch[1] : null;

  if (currentValue === `taxfly-${newHash}`) {
    console.log(`[bump-cache] sw.js ya está al día (${currentValue})`);
    return;
  }

  if (checkOnly) {
    console.error(`[bump-cache] sw.js desactualizado: dice '${currentValue}', debería ser 'taxfly-${newHash}'`);
    process.exit(1);
  }

  const updated = swSource.replace(/const CACHE = '[^']+';/, newCacheLine);
  fs.writeFileSync(SW_PATH, updated);
  console.log(`[bump-cache] CACHE actualizado: '${currentValue}' → 'taxfly-${newHash}'`);
}

main();

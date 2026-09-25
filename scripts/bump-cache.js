#!/usr/bin/env node
const fs = require("fs");

const path = require("path");

const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");

const SW_PATH = path.join(ROOT, "sw.js");

function readSw() {
  return fs.readFileSync(SW_PATH, "utf8");
}

function extractPrecachePaths(swSource) {
  const match = swSource.match(/const PRECACHE = \[([\s\S]*?)\];/);
  if (!match) throw new Error("No encontré el array PRECACHE en sw.js");
  const entries = [ ...match[1].matchAll(/'(\.\/[^']+)'/g) ].map(m => m[1]);
  if (!entries.length) throw new Error("PRECACHE está vacío o no lo pude leer");
  return entries;
}

function hashPrecachedFiles(paths) {
  const hash = crypto.createHash("sha256");
  for (const p of paths.slice().sort()) {
    const filePath = path.join(ROOT, p);
    hash.update(p);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      hash.update(fs.readFileSync(filePath));
    } else {
      console.warn(`[bump-cache] aviso: ${p} está en PRECACHE pero no existe en el repo`);
      hash.update("__missing__");
    }
  }
  return hash.digest("hex").slice(0, 12);
}

function main() {
  const checkOnly = process.argv.includes("--check");
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
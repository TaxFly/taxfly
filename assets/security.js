const TAXFLY_PIN_ITERATIONS = 600000;
const taxflyPinHex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
window.hashPin = async function(pin) { // Legacy verifier only.
  const salt = localStorage.getItem("taxusa_offline_email") || localStorage.getItem("perfilActivoNombre") || "taxfly";
  return taxflyPinHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + "::" + pin)));
};
window.createPinHash = async function(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt, iterations:TAXFLY_PIN_ITERATIONS}, key, 256);
  return "pbkdf2$" + TAXFLY_PIN_ITERATIONS + "$" + taxflyPinHex(salt) + "$" + taxflyPinHex(hash);
};
window.verifyPin = async function(pin, stored) {
  if (typeof stored !== "string") return false;
  if (!stored.startsWith("pbkdf2$")) return (await window.hashPin(pin)) === stored;
  const parts = stored.split("$");
  if (parts.length !== 4 || !/^\d+$/.test(parts[1]) || !/^[a-f0-9]{32}$/.test(parts[2]) || !/^[a-f0-9]{64}$/.test(parts[3])) return false;
  const iterations = Number(parts[1]);
  if (iterations < 100000 || iterations > 1000000) return false;
  const salt = new Uint8Array(parts[2].match(/../g).map(x => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const actual = taxflyPinHex(await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt, iterations}, key, 256));
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ parts[3].charCodeAt(i);
  return diff === 0;
};

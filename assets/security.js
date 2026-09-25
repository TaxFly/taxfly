window.hashPin = async function(pin) {
  const salt = localStorage.getItem("taxusa_offline_email") || localStorage.getItem("perfilActivoNombre") || "taxfly";
  const buf = await crypto.subtle.digest("SHA-256", (new TextEncoder).encode(salt + "::" + pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};
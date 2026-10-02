window.TAXFLY_CONFIG = {
  WORKER_URL: "https://taxfly-claude.juanbria18.workers.dev",
  // Pegá acá tu URL pública de Cafecito, por ejemplo: "https://cafecito.app/tuusuario".
  SUPPORT_CAFECITO_URL: "https://cafecito.app/taxflyapp",
  // Los enlaces de pago quedan vacíos hasta conectar el proveedor (Stripe/Mercado Pago/etc.).
  // Cuando exista un checkout por paquete, pegá su URL en el campo url correspondiente.
  AI_CREDIT_CURRENCY: "USD",
  // Se completa cuando definamos el precio real de los créditos. Mantener null hasta entonces.
  AI_CREDIT_USD_PER_CREDIT: null,
  // Endpoint/checkout para compras personalizadas. Queda vacío hasta conectar el proveedor de pagos.
  AI_CUSTOM_CREDIT_CHECKOUT_URL: "",
  AI_CREDIT_PACKAGES: [
    { credits: 50, priceUsd: null, label: "Paquete inicial", url: "" },
    { credits: 100, priceUsd: null, label: "Paquete estándar", url: "" },
    { credits: 250, priceUsd: null, label: "Paquete viajero", url: "" },
    { credits: 500, priceUsd: null, label: "Paquete intensivo", url: "" }
  ],
  // Proxy propio de Firestore (sync-worker/). Se usa solo si un bloqueador corta firestore.googleapis.com.
  // Dejalo vacío ("") para desactivarlo.
  FIRESTORE_PROXY_HOST: "taxfly-sync.juanbria18.workers.dev",
  FIREBASE_SDK: "https://www.gstatic.com/firebasejs/12.12.1",
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyA-eeKl8guVDmTa_NpYvkB0O7-RMbPrkP0",
    authDomain: "viajes-db538.firebaseapp.com",
    projectId: "viajes-db538",
    storageBucket: "viajes-db538.firebasestorage.app",
    messagingSenderId: "237311739178",
    appId: "1:237311739178:web:333e468b184c0402a98a53"
  }
};

window.taxflyWorker = async function(body) {
  body = body && typeof body === "object" ? { ...body } : body;
  const aiTypes = new Set(["invoice_ocr", "insurance_analysis", "moderate_image", "optimize_route", "taxie_chat", "compare_shopping"]);
  if (body && aiTypes.has(body.type) && !body.request_id) {
    body.request_id = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("req_" + Date.now() + "_" + Math.random().toString(36).slice(2));
  }
  const headers = {
    "Content-Type": "application/json"
  };
  try {
    const {getApps: getApps} = await (import(window.TAXFLY_CONFIG.FIREBASE_SDK + "/firebase-app.js"));
    if (getApps().length) {
      const {getAuth: getAuth} = await (import(window.TAXFLY_CONFIG.FIREBASE_SDK + "/firebase-auth.js"));
      const auth = getAuth();
      if (auth.authStateReady) await auth.authStateReady();
      if (auth.currentUser) headers.Authorization = "Bearer " + await auth.currentUser.getIdToken();
    }
  } catch (e) {}
  return fetch(window.TAXFLY_CONFIG.WORKER_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });
};

window.taxflyAIStatus = async function() {
  const res = await window.taxflyWorker({ type: "ai_status" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "No se pudo leer el estado de IA");
  return data;
};

(function() {
  const KEY = "taxfly_offline_unlocked_at";
  const SUBJECT = "taxfly_offline_unlocked_email";
  const GRACE_MS = 30 * 60 * 1000;
  window.taxflyTouchActivity = function() {
    try {
      const email = localStorage.getItem("taxusa_offline_email");
      if (!email) return;
      sessionStorage.setItem(KEY, String(Date.now()));
      sessionStorage.setItem(SUBJECT, email);
    } catch (e) {}
  };
  window.taxflyOfflineUnlocked = function() {
    try {
      const email = localStorage.getItem("taxusa_offline_email");
      const last = Number(sessionStorage.getItem(KEY));
      return !!email && sessionStorage.getItem(SUBJECT) === email && last > 0 &&
        Date.now() >= last && Date.now() - last < GRACE_MS;
    } catch (e) { return false; }
  };
  window.taxflyMinutesSinceActivity = function() {
    return window.taxflyOfflineUnlocked() ? (Date.now() - Number(sessionStorage.getItem(KEY))) / 60000 : Infinity;
  };
  window.taxflyClearOfflineUnlock = function() {
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(SUBJECT); } catch (e) {}
  };
})();
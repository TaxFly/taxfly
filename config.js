window.TAXFLY_CONFIG = {
  WORKER_URL: "https://taxfly-claude.juanbria18.workers.dev",
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
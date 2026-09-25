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
  const KEY = "taxfly_last_activity";
  function touch() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch (e) {}
  }
  touch();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") touch();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") touch();
  }, 5 * 60 * 1e3);
  window.taxflyTouchActivity = touch;
  window.taxflyMinutesSinceActivity = function() {
    const last = parseInt(localStorage.getItem(KEY), 10) || 0;
    return (Date.now() - last) / 6e4;
  };
})();
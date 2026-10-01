import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const FB = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = initializeApp(FB);

const auth = getAuth(app);

const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 200 * 1024 * 1024
      })
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

let currentUser = null;

async function probeConnectivity() {
  const cached = sessionStorage.getItem("taxfly_connectivity");
  if (cached !== null) return cached === "1";
  try {
    await fetch("https://www.gstatic.com/generate_204", {
      method: "HEAD",
      cache: "no-store",
      mode: "no-cors",
      signal: AbortSignal.timeout(1500)
    });
    sessionStorage.setItem("taxfly_connectivity", "1");
    return true;
  } catch (e) {
    sessionStorage.setItem("taxfly_connectivity", "0");
    return false;
  }
}

window.addEventListener("online", () => sessionStorage.setItem("taxfly_connectivity", "1"));

window.addEventListener("offline", () => sessionStorage.setItem("taxfly_connectivity", "0"));

onAuthStateChanged(auth, async user => {
  if (!user) {
    try {
      await probeConnectivity();
      window.location.replace("login.html");
      return;
    } catch (e) {
      const pinHash = localStorage.getItem("taxusa_pin_hash");
      const pinEmail = localStorage.getItem("taxusa_offline_email");
      if (!pinHash || !pinEmail || !window.taxflyOfflineUnlocked()) {
        window.location.replace("login.html");
        return;
      }
      const nombre = localStorage.getItem("perfilActivoNombre") || pinEmail;
      const el = document.getElementById("userEmail");
      if (el) el.innerText = nombre;
      const foto = localStorage.getItem("perfilActivoFoto") || "";
      if (foto) {
        const btn = document.getElementById("btnSettings");
        if (btn) {
          btn.style.backgroundImage = `url('${foto}')`;
          btn.innerText = "";
        }
      }
      const lang = localStorage.getItem("appLang") || "es";
      window.changeLanguage(lang);
      return;
    }
  }
  currentUser = user;
  window._routeUid = user.uid;
  loadTripStartingPoint(user.uid);
  const perfilNombre = localStorage.getItem("perfilActivoNombre");
  const el = document.getElementById("userEmail");
  if (el) el.innerText = perfilNombre || user.email;
  const foto = localStorage.getItem("perfilActivoFoto") || user.photoURL;
  if (foto) {
    const btn = document.getElementById("btnSettings");
    if (btn) {
      btn.style.backgroundImage = `url('${foto}')`;
      btn.innerText = "";
    }
  }
  const lang = localStorage.getItem("appLang") || "es";
  window.changeLanguage(lang);
});

async function loadTripStartingPoint(uid) {
  const profile = localStorage.getItem("perfilActivoId");
  if (!profile) return;
  const tripId = window.TripContext.active(uid, profile);
  const overrideKey = `taxusa_hotel_addr::${profile}::${tripId}`;
  if (tripId === "orlando" && !localStorage.getItem(overrideKey)) {
    const legacy = localStorage.getItem("taxusa_hotel_addr");
    if (legacy) localStorage.setItem(overrideKey, legacy);
  }
  const input = document.getElementById("hotel-input");
  if (!input) return;
  const override = localStorage.getItem(overrideKey);
  if (override) { input.value = override; return; }
  const localKey = `orlando-hotel-v1::${profile}${tripId === "orlando" ? "" : "::" + tripId}`;
  let hotel = null;
  try { hotel = JSON.parse(localStorage.getItem(localKey) || "null"); } catch (_) {}
  try {
    const path = tripId === "orlando"
      ? ["usuarios", uid, "perfiles", profile, "orlando", "hotel"]
      : ["usuarios", uid, "perfiles", profile, "tripPlanning", tripId, "data", "hotel"];
    const snap = await getDoc(doc(db, ...path));
    if (snap.exists()) hotel = snap.data();
  } catch (_) {}
  const trip = window.TripContext.readTrips(uid, profile).find(t => t.id === tripId);
  const destination = trip?.destinations?.[trip.activeDestination || 0];
  const location = destination && hotel?.locations?.[destination.city + "::" + destination.state];
  if (!localStorage.getItem(overrideKey) && (location?.addr || hotel?.addr)) input.value = location?.addr || hotel.addr;
}

window.doLogout = () => signOut(auth).then(() => { window.taxflyClearOfflineUnlock(); window.location.replace("login.html"); });

window.doChangeEmail = () => window.confirmAndChangeEmail({
  currentUser: currentUser,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmail
});

window.doChangePassword = async () => {
  if (!currentUser) return;
  const l = localStorage.getItem("appLang") || "es";
  const m = {
    es: {
      s: "Correo de recuperación enviado.",
      e: "Error: "
    },
    en: {
      s: "Recovery email sent.",
      e: "Error: "
    },
    pt: {
      s: "E-mail de recuperação enviado.",
      e: "Erro: "
    }
  };
  const t = m[l] || m.es;
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    showAlert(t.s);
  } catch (er) {
    showAlert(t.e + er.message);
  }
};

window.doDeleteAccount = () => window.confirmAndDeleteAccount({
  db: db,
  doc: doc,
  deleteDoc: deleteDoc,
  deleteUser: deleteUser,
  currentUser: currentUser,
  rcCheck: _rcCheck
});

window.confirmarPIN = async () => {
  const lang = localStorage.getItem("appLang") || "es";
  const errMsgs = {
    es: "Los PINs no coinciden o son muy cortos (mín. 4 dígitos).",
    en: "PINs don't match or are too short (min. 4 digits).",
    pt: "Os PINs não coincidem ou são curtos demais (mín. 4 dígitos)."
  };
  const p1 = document.getElementById("pinInput1").value.trim();
  const p2 = document.getElementById("pinInput2").value.trim();
  const errEl = document.getElementById("pinError");
  if (p1.length < 4 || p1 !== p2) {
    errEl.textContent = errMsgs[lang] || errMsgs.es;
    errEl.style.display = "block";
    document.getElementById("pinInput1").style.borderColor = "var(--danger)";
    document.getElementById("pinInput2").style.borderColor = "var(--danger)";
    return;
  }
  errEl.style.display = "none";
  const pinHash = await window.createPinHash(p1);
  localStorage.setItem("taxusa_pin_hash", pinHash);
  localStorage.removeItem("taxusa_offline_pin");
  if (currentUser) {
    try {
      await setDoc(doc(db, "usuarios", currentUser.uid), {
        pinHash: pinHash
      }, {
        merge: true
      });
    } catch (e) {}
  }
  document.getElementById("pinStep1").style.display = "none";
  document.getElementById("pinStep2").style.display = "block";
  setTimeout(() => window.closePinModal(), 2200);
};

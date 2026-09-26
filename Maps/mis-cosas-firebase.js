import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const TAXFLY_LOGIN_URL = "https://taxfly.github.io/taxfly/login.html";

const TAXFLY_PROFILES_URL = "https://taxfly.github.io/taxfly/profiles.html";

const PENDING_REDIRECT_KEY = "taxusa_pending_redirect";

const app = initializeApp(firebaseConfig);

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

const auth = getAuth(app);

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

window._misCosasReady = new Promise(resolve => {
  window._misCosasResolve = resolve;
});

function rootPath(uid, perfilId, tripId) {
  // The original Mis cosas collection remains the Orlando trip. Other trips
  // get isolated collections without copying or mutating legacy documents.
  return tripId === "orlando" ? `usuarios/${uid}/perfiles/${perfilId}/misCosas/root`
    : `usuarios/${uid}/perfiles/${perfilId}/tripPlanning/${tripId}/misCosas/root`;
}

function buildDB(uid, perfilId, tripId) {
  const base = rootPath(uid, perfilId, tripId);
  return {
    collection(name) {
      const ref = collection(db, `${base}/${name}`);
      return {
        onSnapshot(cb, errCb) {
          return onSnapshot(ref, snap => {
            cb({
              docs: snap.docs.map(d => ({
                id: d.id,
                data: () => d.data()
              }))
            });
          }, errCb);
        }
      };
    },
    doc(path) {
      const ref = doc(db, `${base}/${path}`);
      return {
        onSnapshot(cb, errCb) {
          return onSnapshot(ref, snap => {
            cb({
              exists: snap.exists(),
              data: () => snap.data()
            });
          }, errCb);
        },
        set(data) {
          return setDoc(ref, data);
        },
        delete() {
          return deleteDoc(ref);
        }
      };
    }
  };
}

window._misCosasSignOut = async function() {
  try {
    await signOut(auth);
  } catch (e) {}
  window.location.replace(TAXFLY_LOGIN_URL);
};

onAuthStateChanged(auth, async user => {
  if (!user) {
    try {
      localStorage.setItem(PENDING_REDIRECT_KEY, location.href);
    } catch (e) {}
    window.location.replace(TAXFLY_LOGIN_URL);
    return;
  }
  let perfilId = null;
  try {
    perfilId = localStorage.getItem("perfilActivoId");
  } catch (e) {}
  if (!perfilId) {
    try {
      localStorage.setItem(PENDING_REDIRECT_KEY, location.href);
    } catch (e) {}
    window.location.replace(TAXFLY_PROFILES_URL);
    return;
  }
  window.TripContext.configure({db,doc,collection,getDocs,setDoc,updateDoc,deleteDoc});
  window._taxflyTripUid=user.uid; window._taxflyTripProfile=perfilId;
  await window.TripContext.hydrate(db,user.uid,perfilId,getDocs,collection);
  const tripId = window.TripContext.active(user.uid, perfilId);
  window._misCosasScope = `${user.uid}::${perfilId}::${tripId}`;
  const trip = window.TripContext.readTrips(user.uid, perfilId).find(t => t.id === tripId);
  const chip = document.getElementById("mis-trip-active");
  if (chip) chip.textContent = "✈️ " + (trip?.name || "Mi viaje a Orlando");
  window._misCosasResolve({ DB: buildDB(user.uid, perfilId, tripId) });
});

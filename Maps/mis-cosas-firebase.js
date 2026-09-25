import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

// Mismo proyecto de Firebase que Taxfly y Orlando Planning (mismo origen,
// taxfly.github.io): la sesión de Auth ya es compartida, así que si ya
// estabas logueado para usar Orlando Planning, esto ni se nota. Cada
// perfil de Taxfly tiene SU PROPIO "Mis cosas de viaje" — los datos viven
// bajo usuarios/{uid}/perfiles/{perfilId}/misCosas/root/..., igual que
// Orlando vive bajo .../orlando/{docId}.
// Config centralizada en config.js (../config.js, cargado antes de este módulo).
const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;
const TAXFLY_LOGIN_URL = 'https://taxfly.github.io/taxfly/login.html';
const TAXFLY_PROFILES_URL = 'https://taxfly.github.io/taxfly/profiles.html';
const PENDING_REDIRECT_KEY = 'taxusa_pending_redirect';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// El script principal (no es un módulo) no puede hacer `import`, así que
// se comunican con esta promesa: la crea ANTES de arrancar el login para
// que exista apenas el script principal empiece a buscarla (sondea con
// un pequeño polling, ver esperarFirebaseReady en el HTML), sin importar
// en qué orden termine ejecutando el navegador los dos scripts.
window._misCosasReady = new Promise(resolve => { window._misCosasResolve = resolve; });

function rootPath(uid, perfilId) {
  return `usuarios/${uid}/perfiles/${perfilId}/misCosas/root`;
}

// Imita la forma en que el HTML ya usa DB.collection()/DB.doc() (viene de
// cuando esto corría sobre la capacidad "db" de un artefacto de Claude),
// para no tener que tocar el resto del archivo — solo lo que arma este
// objeto cambia.
function buildDB(uid, perfilId) {
  const base = rootPath(uid, perfilId);
  return {
    collection(name) {
      const ref = collection(db, `${base}/${name}`);
      return {
        onSnapshot(cb, errCb) {
          return onSnapshot(ref, snap => {
            cb({ docs: snap.docs.map(d => ({ id: d.id, data: () => d.data() })) });
          }, errCb);
        },
      };
    },
    doc(path) {
      const ref = doc(db, `${base}/${path}`);
      return {
        onSnapshot(cb, errCb) {
          return onSnapshot(ref, snap => {
            cb({ exists: snap.exists(), data: () => snap.data() });
          }, errCb);
        },
        set(data) { return setDoc(ref, data); },
        delete() { return deleteDoc(ref); },
      };
    },
  };
}

// Sin Storage: las fotos ahora viven como data URI adentro de cada
// documento de Firestore (ver comprimirParaNube en el HTML), así que no
// hace falta ninguna capacidad de subida de archivos acá.

// Cierra la sesión (mismo Auth que TaxUSA y Orlando) y vuelve al login de Taxfly.
window._misCosasSignOut = async function () {
  try { await signOut(auth); } catch (e) {}
  window.location.replace(TAXFLY_LOGIN_URL);
};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    try { localStorage.setItem(PENDING_REDIRECT_KEY, location.href); } catch (e) {}
    window.location.replace(TAXFLY_LOGIN_URL);
    return;
  }
  let perfilId = null;
  try { perfilId = localStorage.getItem('perfilActivoId'); } catch (e) {}
  if (!perfilId) {
    try { localStorage.setItem(PENDING_REDIRECT_KEY, location.href); } catch (e) {}
    window.location.replace(TAXFLY_PROFILES_URL);
    return;
  }
  window._misCosasResolve({ DB: buildDB(user.uid, perfilId) });
});

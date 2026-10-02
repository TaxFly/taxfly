/* Sacar a un usuario de sus grupos: al eliminar la cuenta (todos los grupos) o al eliminar
 * un perfil (solo los grupos a los que entró con ese perfil). Los gastos que pagó se conservan
 * para no romper las cuentas del resto. */
import { collection, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const withTimeout = (p, ms = 10000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
const norm = s => String(s || "").trim().toLowerCase();

function forgetLocally(uid, groupId) {
  try {
    localStorage.removeItem("taxusa_grupo_cache_" + groupId);
    if (localStorage.getItem("grupoActivo") === groupId) localStorage.removeItem("grupoActivo");
    const lista = JSON.parse(localStorage.getItem("misGrupos") || "[]").filter(g => g.id !== groupId);
    localStorage.setItem("misGrupos", JSON.stringify(lista));
    const key = "taxusa_pending_ops::" + uid;
    const ops = JSON.parse(localStorage.getItem(key) || "[]").filter(op => op.groupId !== groupId);
    localStorage.setItem(key, JSON.stringify(ops));
  } catch (e) {}
}

async function leaveOne(d, uid, mine) {
  const data = d.data();
  const rest = (data.miembros || []).filter(m => m && m.uid !== uid);
  // Último miembro y creador: se elimina el grupo (las reglas solo lo permiten al creador).
  if (!rest.length && data.creadoPor === uid) {
    try { await withTimeout(deleteDoc(d.ref)); return; } catch (e) { console.warn("[group-exit] no se pudo borrar el grupo vacío", d.id, e); }
  }
  // Todo en un solo update y mientras todavía es miembro: las reglas dejan de permitir escribir apenas deja de serlo.
  const patch = { miembroUids: arrayRemove(uid) };
  if (mine.length) patch.miembros = arrayRemove(...mine);
  if (data.creadoPor === uid && rest.length) patch.creadoPor = rest[0].uid;   // el grupo no queda sin creador
  await withTimeout(updateDoc(d.ref, patch));
}

async function leave(db, uid, matches) {
  if (!db || !uid) return 0;
  if (!navigator.onLine) throw new Error("offline");
  const snap = await withTimeout(getDocs(query(collection(db, "grupos"), where("miembroUids", "array-contains", uid))));
  let left = 0;
  for (const d of snap.docs) {
    const mine = (d.data().miembros || []).filter(m => m && m.uid === uid && matches(m));
    if (!mine.length) continue;
    await leaveOne(d, uid, mine);
    forgetLocally(uid, d.id);
    left++;
  }
  return left;
}

// Eliminar cuenta: sale de todos los grupos.
export async function leaveAllGroups(db, uid) {
  const left = await leave(db, uid, () => true);
  try {
    Object.keys(localStorage).filter(k => k.startsWith("taxusa_grupo_cache_")).forEach(k => localStorage.removeItem(k));
    ["misGrupos", "grupoActivo", "taxusa_pending_ops::" + uid].forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  return left;
}

// Eliminar un perfil: sale de los grupos donde participaba con ese perfil. Las membresías anteriores a
// este cambio no guardan el perfil, así que se reconocen por el apodo.
export function leaveGroupsOfProfile(db, uid, perfilId, nombre) {
  return leave(db, uid, m => (m.perfilId ? m.perfilId === perfilId : norm(m.nombre) === norm(nombre)));
}

export const leaveGroupsError = (kind) => {
  const lang = localStorage.getItem("appLang") || "es";
  const T = kind === "profile" ? {
    es: "No pudimos sacarte de tus grupos, así que el perfil NO se eliminó. Revisá tu conexión e intentá de nuevo.",
    en: "We couldn't remove you from your groups, so the profile was NOT deleted. Check your connection and try again.",
    pt: "Não conseguimos remover você dos seus grupos, então o perfil NÃO foi excluído. Verifique sua conexão e tente novamente."
  } : {
    es: "No pudimos sacarte de tus grupos. Revisá tu conexión e intentá de nuevo; tu cuenta no se eliminó.",
    en: "We couldn't remove you from your groups. Check your connection and try again; your account was not deleted.",
    pt: "Não conseguimos remover você dos seus grupos. Verifique sua conexão e tente novamente; sua conta não foi excluída."
  };
  return T[lang] || T.es;
};

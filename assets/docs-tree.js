/* Documentos (tickets.html): ruta única + migración one-shot del árbol viejo.
 *
 * Antes: users/{uid}/profiles/{pid}/docs/...      (árbol en inglés, solo tickets)
 * Ahora: usuarios/{uid}/perfiles/{pid}/docs/...   (el mismo árbol que usa todo el resto)
 *
 * ensure(uid, pid) copia lo que haya en el árbol viejo al nuevo. Reglas:
 *  - Nunca pisa un documento completo del árbol nuevo.
 *  - Copia primero los chunks y al final el documento de metadatos, así un
 *    documento a medio copiar nunca parece completo y se reintenta solo.
 *  - No borra nada del árbol viejo (queda de respaldo hasta una limpieza aparte).
 *  - Es idempotente y se recuerda por perfil en localStorage cuando termina bien.
 *  - Cualquier escritura al árbol nuevo tiene que esperar a ensure() antes.
 */
(function (root) {
  'use strict';
  const SDK = 'https://www.gstatic.com/firebasejs/12.12.1/';
  const LINK_FIELDS = ['reservationId', 'tripId', 'linkExplicit'];
  const MAX_BATCH_OPS = 400;
  const MAX_BATCH_CHARS = 6e6;
  const inflight = new Map();

  const base = (uid, pid) => ['usuarios', uid, 'perfiles', pid, 'docs'];
  const legacyBase = (uid, pid) => ['users', uid, 'profiles', pid, 'docs'];
  const flagKey = (uid, pid) => `taxfly-docs-tree-v1::${uid}::${pid}`;
  const isDone = (uid, pid) => { try { return localStorage.getItem(flagKey(uid, pid)) === '1'; } catch (e) { return false; } };
  const markDone = (uid, pid) => { try { localStorage.setItem(flagKey(uid, pid), '1'); } catch (e) {} };

  async function defaultSdk() {
    const [app, fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-firestore.js')]);
    if (!app.getApps().length) throw new Error('Firebase todavía no se inicializó');
    return { fs, db: fs.getFirestore(app.getApp()) };
  }

  async function copyDoc(sdk, uid, pid, source) {
    const { fs, db } = sdk;
    const target = fs.doc(db, ...base(uid, pid), source.id);
    const existing = await fs.getDocFromServer(target);
    if (existing.exists() && Array.isArray(existing.data().files)) return false;

    const chunks = await fs.getDocs(fs.collection(db, ...legacyBase(uid, pid), source.id, 'chunks'));
    let batch = fs.writeBatch(db), ops = 0, chars = 0;
    for (const chunk of chunks.docs) {
      const data = chunk.data(), size = String(data.data || '').length;
      if (ops && (ops >= MAX_BATCH_OPS || chars + size > MAX_BATCH_CHARS)) {
        await batch.commit(); batch = fs.writeBatch(db); ops = 0; chars = 0;
      }
      batch.set(fs.doc(db, ...base(uid, pid), source.id, 'chunks', chunk.id), data);
      ops++; chars += size;
    }
    if (ops) await batch.commit();

    // Si una escritura temprana dejó un doc a medias (solo campos de vínculo), esos campos son más nuevos: se conservan.
    const value = { ...source.data() };
    if (existing.exists()) for (const k of LINK_FIELDS) if (k in existing.data()) value[k] = existing.data()[k];
    await fs.setDoc(target, value);
    return true;
  }

  async function run(uid, pid, injected) {
    const sdk = injected || await defaultSdk();
    const legacy = await sdk.fs.getDocs(sdk.fs.collection(sdk.db, ...legacyBase(uid, pid)));
    let copied = 0;
    for (const source of legacy.docs) if (await copyDoc(sdk, uid, pid, source)) copied++;
    return copied;
  }

  /** Devuelve true si el árbol nuevo quedó al día; false si no se pudo (sin conexión o error): se reintenta en la próxima carga. */
  function ensure(uid, pid, injected) {
    if (!uid || !pid) return Promise.resolve(false);
    if (isDone(uid, pid)) return Promise.resolve(true);
    if (!injected && typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
    const key = uid + '::' + pid;
    if (!inflight.has(key)) {
      inflight.set(key, run(uid, pid, injected)
        .then(() => { markDone(uid, pid); return true; })
        .catch(e => { console.warn('Migración de documentos pendiente:', e); return false; })
        .finally(() => inflight.delete(key)));
    }
    return inflight.get(key);
  }

  const api = { base, legacyBase, ensure, isDone };
  root.TaxflyDocsTree = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

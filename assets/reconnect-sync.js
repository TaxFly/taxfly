/* Replay account-scoped offline queues even when another screen is open. */
const __fsDb = async (fs, app) => { try { const { fsNet } = await import(new URL('assets/fs-net.js', document.baseURI).href); return fs.initializeFirestore(app, { ...(await fsNet()), localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager(), cacheSizeBytes: 200 * 1024 * 1024 }) }); } catch (e) { return fs.getFirestore(app); } };
(async function syncAll() {
  window.taxflyRetryPending = syncAll;
  if (!navigator.onLine || !window.TAXFLY_CONFIG?.FIREBASE_CONFIG) return;
  const profile = localStorage.getItem('perfilActivoId');
  if (!profile) return;
  let activeUid = null;
  const possible = Object.keys(localStorage).some(k =>
    k.startsWith('taxusa_gastos_pending_' + profile + '::') ||
    k.startsWith('taxusa_itin_pending::') || k.startsWith('taxusa_pending_ops::') ||
    (k.startsWith('taxfly-offline-pending-docs::') && Number(localStorage.getItem(k)) > 0));
  if (!possible) return;
  const base = 'https://www.gstatic.com/firebasejs/12.12.1/';
  try {
    const [appMod, authMod, fs] = await Promise.all([
      import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
    ]);
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
    const user = await new Promise(resolve => {
      let unsub = () => {};
      const timer = setTimeout(() => { unsub(); resolve(null); }, 10000);
      unsub = authMod.onAuthStateChanged(authMod.getAuth(app), u => {
        if (!u) return;
        clearTimeout(timer); unsub(); resolve(u);
      }, () => { clearTimeout(timer); resolve(null); });
    });
    if (!user || !navigator.onLine) return;
    const uid = user.uid, db = await __fsDb(fs, app), page = location.pathname.split('/').pop();
    activeUid = uid;
    const queuedId = op => {
      const raw = JSON.stringify(op);
      let a = 2166136261, b = 5381;
      for (let i=0;i<raw.length;i++) { a=Math.imul(a ^ raw.charCodeAt(i),16777619); b=Math.imul(b,33) ^ raw.charCodeAt(i); }
      return 'offline_' + (a>>>0).toString(36) + '_' + (b>>>0).toString(36);
    };
    const flush = async (key, owner, action) => {
      let ops;
      try { ops = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return; }
      if (!Array.isArray(ops)) return;
      for (const op of ops) {
        if (!navigator.onLine || !owner(op)) break;
        try {
          await action(op);
          // Remove only this operation; another tab may have appended a new one.
          const now = JSON.parse(localStorage.getItem(key) || '[]');
          const i = now.findIndex(x => JSON.stringify(x) === JSON.stringify(op));
          if (i >= 0) { now.splice(i,1); localStorage.setItem(key,JSON.stringify(now)); }
        } catch (_) { break; }
      }
    };
    if (page !== 'compras.html') await flush('taxusa_gastos_pending_' + profile + '::' + uid,
      () => true, op => {
        const col = fs.collection(db,'usuarios',uid,'perfiles',profile,'gastos');
        if (op.type === 'add') return fs.setDoc(fs.doc(col,queuedId(op)),op.data);
        if (op.type === 'del') return fs.deleteDoc(fs.doc(col,op.id));
        throw Error('Operación desconocida');
      });
    if (page !== 'lugares.html') await flush('taxusa_itin_pending::' + uid + '::' + profile,
      op => op.uid === uid && op.perfilId === profile, op => {
        const col = name => fs.collection(db,'usuarios',uid,'perfiles',profile,name);
        switch (op.type) {
          case 'add_activity': return fs.setDoc(fs.doc(col('actividades'),queuedId(op)),op.data);
          case 'toggle_activity': return fs.updateDoc(fs.doc(col('actividades'),op.id),{done:op.done});
          case 'del_activity': return fs.deleteDoc(fs.doc(col('actividades'),op.id));
          case 'add_note': return fs.setDoc(fs.doc(col('notas'),queuedId(op)),op.data);
          case 'del_note': return fs.deleteDoc(fs.doc(col('notas'),op.id));
          default: throw Error('Operación desconocida');
        }
      });
    if (page !== 'grupo.html') await flush('taxusa_pending_ops::' + uid,
      op => op.uid === uid, async op => {
        const ref = fs.doc(db,'grupos',op.groupId);
        if (op.type === 'add_gasto') {
          try { return await fs.updateDoc(ref,{gastos:fs.arrayUnion(op.gasto)}); }
          catch (e) {
            // Grupo borrado o ya no es miembro: se descarta en vez de bloquear la cola.
            const s = await fs.getDoc(ref).catch(() => null);
            if (s && (!s.exists() || !(s.data().miembroUids || []).includes(uid))) return;
            throw e;
          }
        }
        if (op.type === 'del_gasto') {
          const snap = await fs.getDoc(ref);
          if (snap.exists()) return fs.updateDoc(ref,{gastos:(snap.data().gastos || []).filter(g => g.id !== op.gastoId)});
          return;
        }
        throw Error('Operación desconocida');
      });
    if (page !== 'tickets.html') {
      const key = 'taxusa_tickets_pending_ops::' + uid + '::' + profile;
      const dbReq = indexedDB.open('taxfly_docs_db',1);
      const idb = await new Promise((resolve,reject) => {
        dbReq.onupgradeneeded = () => { if (!dbReq.result.objectStoreNames.contains('kv')) dbReq.result.createObjectStore('kv'); };
        dbReq.onsuccess = () => resolve(dbReq.result); dbReq.onerror = () => reject(dbReq.error);
      });
      const get = () => new Promise((resolve,reject) => { const req=idb.transaction('kv').objectStore('kv').get(key); req.onsuccess=()=>resolve(req.result||[]); req.onerror=()=>reject(req.error); });
      const put = value => new Promise((resolve,reject) => { const tx=idb.transaction('kv','readwrite'); tx.objectStore('kv').put(value,key); tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); });
      for (const op of await get()) {
        if (!navigator.onLine || op.uid !== uid || op.perfilId !== profile) break;
        if (!await window.TaxflyDocsTree?.ensure(uid,profile)) break;
        const docs = fs.collection(db,...window.TaxflyDocsTree.base(uid,profile));
        try {
          if (op.type === 'save_doc') {
            const value=op.docObj;
            const files=value.files.map((f,fileIdx)=>({kind:f.kind,name:f.name,fileIdx,numChunks:Math.ceil(f.dataUrl.length/800000)}));
            await fs.setDoc(fs.doc(docs,value.id),{id:value.id,perfilId:value.perfilId,tripId:value.tripId||'unassigned',reservationId:value.reservationId||'',linkExplicit:!!value.linkExplicit,name:value.name,type:value.type,createdAt:value.createdAt,files});
            let batch=fs.writeBatch(db), size=0;
            for (const meta of files) for (let i=0;i<meta.numChunks;i++) {
              batch.set(fs.doc(docs,value.id,'chunks',meta.fileIdx+'_'+i),{data:value.files[meta.fileIdx].dataUrl.slice(i*800000,(i+1)*800000)});
              if (++size===400) { await batch.commit();batch=fs.writeBatch(db);size=0; }
            }
            if (size) await batch.commit();
          } else if (op.type === 'link_doc') {
            await fs.setDoc(fs.doc(docs,op.docId),{reservationId:op.reservationId||'',tripId:op.tripId||'unassigned',linkExplicit:true},{merge:true});
          } else if (op.type === 'del_doc') {
            const chunks=await fs.getDocs(fs.collection(docs,op.docId,'chunks'));
            let batch=fs.writeBatch(db),size=0;
            for (const chunk of chunks.docs) {
              batch.delete(chunk.ref);
              if (++size===400) { await batch.commit();batch=fs.writeBatch(db);size=0; }
            }
            if (size) await batch.commit();
            await fs.deleteDoc(fs.doc(docs,op.docId));
          } else break;
          const now=await get();
          const i=now.findIndex(x=>JSON.stringify(x)===JSON.stringify(op));
          if (i>=0) {now.splice(i,1);await put(now);localStorage.setItem('taxfly-offline-pending-docs::'+uid+'::'+profile,String(now.length));}
        } catch (_) { break; }
      }
      idb.close();
    }
    window.dispatchEvent(new Event('taxfly:offline-status'));
  } catch (err) { console.warn('Los cambios siguen pendientes para el próximo intento de sincronización',err); }
  finally {
    const keys = activeUid && [
      'taxusa_gastos_pending_' + profile + '::' + activeUid,
      'taxusa_itin_pending::' + activeUid + '::' + profile,
      'taxusa_pending_ops::' + activeUid
    ];
    const stillPending = !activeUid || keys?.some(k => { try { return JSON.parse(localStorage.getItem(k) || '[]').length > 0; } catch (_) { return false; } }) ||
      (activeUid && Number(localStorage.getItem('taxfly-offline-pending-docs::'+activeUid+'::'+profile)) > 0);
    if (stillPending && navigator.onLine) setTimeout(() => {
      const page = location.pathname.split('/').pop();
      if (page === 'compras.html') window.flushPendingGastos?.();
      if (page === 'lugares.html' || page === 'grupo.html') window._flushPending?.();
      if (page === 'tickets.html') window._flushTicketsPending?.();
      syncAll();
    }, 30000);
  }
}());

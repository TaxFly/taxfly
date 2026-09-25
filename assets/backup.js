import { getApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { getFirestore, collection, doc, getDoc, getDocs, setDoc, Timestamp, GeoPoint, Bytes } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

export const FORMAT = "taxfly-backup";

export const VERSION = 1;

export const COLLECTIONS = [ "actividades", "gastos", "notas", "orlando", "misCosas/root/accesorios", "misCosas/root/ropa", "misCosas/root/esenciales", "misCosas/root/estado" ];

export const DOCS = [ "misCosas/root" ];

export function enc(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : {
    __t: "num",
    v: String(v)
  };
  if (typeof v !== "object") return v;
  if (v instanceof Timestamp) return {
    __t: "ts",
    s: v.seconds,
    n: v.nanoseconds
  };
  if (v instanceof GeoPoint) return {
    __t: "geo",
    lat: v.latitude,
    lng: v.longitude
  };
  if (v instanceof Bytes) return {
    __t: "bytes",
    b64: v.toBase64()
  };
  if (typeof v.path === "string" && v.firestore) return {
    __t: "ref",
    path: v.path
  };
  if (Array.isArray(v)) return v.map(enc);
  const o = {};
  for (const k of Object.keys(v)) o[k] = enc(v[k]);
  return o;
}

export function dec(v, db) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(x => dec(x, db));
  switch (v.__t) {
   case "ts":
    return new Timestamp(v.s, v.n);

   case "geo":
    return new GeoPoint(v.lat, v.lng);

   case "bytes":
    return Bytes.fromBase64String(v.b64);

   case "ref":
    return doc(db, v.path);

   case "num":
    return Number(v.v);
  }
  const o = {};
  for (const k of Object.keys(v)) o[k] = dec(v[k], db);
  return o;
}

function ctx() {
  let app;
  try {
    app = getApp();
  } catch (e) {
    throw new Error("NO_APP");
  }
  const user = getAuth(app).currentUser;
  if (!user) throw new Error("NO_USER");
  let pid = null;
  try {
    pid = localStorage.getItem("perfilActivoId");
  } catch (e) {}
  if (!pid) throw new Error("NO_PROFILE");
  return {
    db: getFirestore(app),
    uid: user.uid,
    pid: pid
  };
}

export function activeProfileId() {
  try {
    return localStorage.getItem("perfilActivoId");
  } catch (e) {
    return null;
  }
}

async function accountProfiles(db, uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? snap.data().perfiles || [] : [];
}

export async function listProfiles() {
  const {db: db, uid: uid} = ctx();
  return accountProfiles(db, uid);
}

const okId = id => typeof id === "string" && id.length > 0 && id.length < 1500 && !id.includes("/") && id !== "." && id !== "..";

const isObj = o => o && typeof o === "object" && !Array.isArray(o);

export async function exportBackup({includeTickets: includeTickets = false, onProgress: onProgress = () => {}, pid: pidOverride = null} = {}) {
  const c = ctx();
  const {db: db, uid: uid} = c;
  const pid = pidOverride || c.pid;
  const base = [ "usuarios", uid, "perfiles", pid ];
  let total = 0;
  const warnings = [];
  const tick = label => onProgress({
    label: label,
    docs: total
  });
  let meta = {
    id: pid,
    nombre: "",
    foto: ""
  };
  try {
    const p = (await accountProfiles(db, uid)).find(x => x.id === pid);
    if (p) meta = {
      id: pid,
      nombre: p.nombre || "",
      foto: p.foto || ""
    };
  } catch (e) {}
  if (!meta.nombre && pid === c.pid) {
    try {
      meta.nombre = localStorage.getItem("perfilActivoNombre") || "";
    } catch (e) {}
  }
  if (!meta.foto && pid === c.pid) {
    try {
      meta.foto = localStorage.getItem("perfilActivoFoto") || "";
    } catch (e) {}
  }
  const out = {
    format: FORMAT,
    version: VERSION,
    exportedAt: (new Date).toISOString(),
    profile: meta,
    profileDoc: null,
    docs: {},
    collections: {},
    tickets: null,
    warnings: warnings
  };
  tick("profile");
  try {
    const s = await getDoc(doc(db, ...base));
    if (s.exists()) {
      out.profileDoc = enc(s.data());
      total++;
    }
  } catch (e) {
    warnings.push({
      path: base.join("/"),
      error: e.code || e.message
    });
  }
  for (const path of DOCS) {
    tick(path);
    try {
      const s = await getDoc(doc(db, ...base, ...path.split("/")));
      if (s.exists()) {
        out.docs[path] = enc(s.data());
        total++;
      }
    } catch (e) {
      warnings.push({
        path: path,
        error: e.code || e.message
      });
    }
  }
  for (const path of COLLECTIONS) {
    tick(path);
    try {
      const snap = await getDocs(collection(db, ...base, ...path.split("/")));
      const items = {};
      snap.forEach(d => {
        items[d.id] = enc(d.data());
        total++;
      });
      out.collections[path] = items;
    } catch (e) {
      warnings.push({
        path: path,
        error: e.code || e.message
      });
    }
  }
  if (includeTickets) {
    tick("tickets");
    out.tickets = {
      docs: {},
      chunks: {}
    };
    try {
      const tbase = [ "users", uid, "profiles", pid, "docs" ];
      const snap = await getDocs(collection(db, ...tbase));
      const ids = [];
      snap.forEach(d => {
        out.tickets.docs[d.id] = enc(d.data());
        ids.push(d.id);
        total++;
      });
      for (const id of ids) {
        tick("tickets");
        const cs = await getDocs(collection(db, ...tbase, id, "chunks"));
        const chunks = {};
        cs.forEach(c => {
          chunks[c.id] = enc(c.data());
          total++;
        });
        out.tickets.chunks[id] = chunks;
      }
    } catch (e) {
      warnings.push({
        path: "tickets",
        error: e.code || e.message
      });
    }
  }
  out.counts = {
    total: total
  };
  tick("done");
  const json = JSON.stringify(out, null, 1);
  const blob = new Blob([ json ], {
    type: "application/json"
  });
  const stamp = (new Date).toISOString().slice(0, 10);
  const safeName = (meta.nombre || "perfil").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "perfil";
  return {
    blob: blob,
    filename: `taxfly-respaldo-${safeName}-${stamp}.json`,
    total: total,
    bytes: blob.size,
    warnings: warnings,
    profile: meta
  };
}

export function parseBackup(text) {
  let d;
  try {
    d = JSON.parse(text);
  } catch (e) {
    throw new Error("BAD_JSON");
  }
  if (!isObj(d) || d.format !== FORMAT) throw new Error("NOT_BACKUP");
  if (typeof d.version !== "number" || d.version > VERSION) throw new Error("NEWER_VERSION");
  if (!isObj(d.collections)) d.collections = {};
  if (!isObj(d.docs)) d.docs = {};
  if (!isObj(d.profile)) d.profile = {
    id: "",
    nombre: "",
    foto: ""
  };
  return d;
}

export function summarize(d) {
  const counts = {};
  let total = d.profileDoc ? 1 : 0;
  for (const p of COLLECTIONS) {
    const n = isObj(d.collections[p]) ? Object.keys(d.collections[p]).length : 0;
    if (n) {
      counts[p] = n;
      total += n;
    }
  }
  for (const p of DOCS) if (isObj(d.docs[p])) {
    counts[p] = 1;
    total++;
  }
  let tickets = 0;
  if (d.tickets && isObj(d.tickets.docs)) {
    tickets = Object.keys(d.tickets.docs).length;
    for (const id of Object.keys(d.tickets.chunks || {})) tickets += Object.keys(d.tickets.chunks[id] || {}).length;
  }
  return {
    counts: counts,
    total: total,
    tickets: tickets,
    profile: d.profile,
    exportedAt: d.exportedAt || ""
  };
}

async function pool(tasks, limit, worker) {
  let i = 0, failed = 0;
  const errors = [];
  await Promise.all(Array.from({
    length: Math.min(limit, tasks.length)
  }, async () => {
    while (i < tasks.length) {
      const t = tasks[i++];
      try {
        await worker(t);
      } catch (e) {
        failed++;
        if (errors.length < 3) errors.push(e.code || e.message);
      }
    }
  }));
  return {
    failed: failed,
    errors: errors
  };
}

export async function importBackup(d, {targetPid: targetPid, includeTickets: includeTickets = false, onProgress: onProgress = () => {}} = {}) {
  const {db: db, uid: uid, pid: pid} = ctx();
  const target = targetPid || pid;
  if (!okId(target)) throw new Error("BAD_TARGET");
  const base = [ "usuarios", uid, "perfiles", target ];
  let recreated = false;
  const list = await accountProfiles(db, uid);
  if (!list.some(p => p.id === target)) {
    const act = list[0] || {};
    const entry = {
      id: target,
      nombre: String(d.profile && d.profile.nombre || "Perfil restaurado").slice(0, 60),
      foto: String(d.profile && d.profile.foto || act.foto || "")
    };
    await setDoc(doc(db, "usuarios", uid), {
      perfiles: [ ...list, entry ]
    }, {
      merge: true
    });
    try {
      localStorage.removeItem("taxfly_cached_profiles");
    } catch (e) {}
    recreated = true;
  }
  const writes = [];
  if (isObj(d.profileDoc)) writes.push({
    ref: doc(db, ...base),
    data: d.profileDoc,
    merge: true
  });
  for (const p of DOCS) {
    if (isObj(d.docs[p])) writes.push({
      ref: doc(db, ...base, ...p.split("/")),
      data: d.docs[p]
    });
  }
  for (const p of COLLECTIONS) {
    const items = d.collections[p];
    if (!isObj(items)) continue;
    for (const id of Object.keys(items)) {
      if (!okId(id) || !isObj(items[id])) continue;
      writes.push({
        ref: doc(db, ...base, ...p.split("/"), id),
        data: items[id]
      });
    }
  }
  if (includeTickets && d.tickets && isObj(d.tickets.docs)) {
    const tbase = [ "users", uid, "profiles", target, "docs" ];
    for (const id of Object.keys(d.tickets.docs)) {
      if (!okId(id) || !isObj(d.tickets.docs[id])) continue;
      writes.push({
        ref: doc(db, ...tbase, id),
        data: d.tickets.docs[id]
      });
      const ch = d.tickets.chunks && d.tickets.chunks[id] || {};
      for (const cid of Object.keys(ch)) {
        if (okId(cid) && isObj(ch[cid])) writes.push({
          ref: doc(db, ...tbase, id, "chunks", cid),
          data: ch[cid]
        });
      }
    }
  }
  let done = 0;
  onProgress({
    done: done,
    total: writes.length
  });
  const res = await pool(writes, 5, async w => {
    await setDoc(w.ref, dec(w.data, db), w.merge ? {
      merge: true
    } : undefined);
    done++;
    if (done % 5 === 0 || done === writes.length) onProgress({
      done: done,
      total: writes.length
    });
  });
  return {
    total: writes.length,
    written: writes.length - res.failed,
    failed: res.failed,
    errors: res.errors,
    recreated: recreated,
    target: target
  };
}
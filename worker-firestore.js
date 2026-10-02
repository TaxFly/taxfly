const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
let cachedAccessToken = null;

export function firestoreConfigured(env) {
  return !!(env.FIREBASE_SERVICE_ACCOUNT_EMAIL && env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY);
}

function b64url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToBytes(pem) {
  const clean = String(pem).replace(/\\n/g, "\n").replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function getAccessToken(env) {
  if (!firestoreConfigured(env)) throw new Error("Firestore service account is not configured");
  if (cachedAccessToken && cachedAccessToken.exp > Date.now() + 60_000) return cachedAccessToken.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss: env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey("pkcs8", pemToBytes(env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const assertion = `${signingInput}.${b64url(new Uint8Array(sig))}`;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString()
  });
  if (!res.ok) throw new Error(`OAuth service account failed (${res.status})`);
  const data = await res.json();
  cachedAccessToken = { token: data.access_token, exp: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return cachedAccessToken.token;
}

function dbBase(env) {
  const project = env.FIREBASE_PROJECT_ID || "viajes-db538";
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents`;
}
function docName(env, path) {
  const project = env.FIREBASE_PROJECT_ID || "viajes-db538";
  return `projects/${project}/databases/(default)/documents/${path}`;
}

function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "object") return { mapValue: { fields: encodeFields(v) } };
  return { stringValue: String(v) };
}
function encodeFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj || {})) fields[k] = toValue(v);
  return fields;
}
function fromValue(v) {
  if (!v) return null;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if (v.arrayValue) return (v.arrayValue.values || []).map(fromValue);
  if (v.mapValue) return decodeFields(v.mapValue.fields || {});
  return null;
}
function decodeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = fromValue(v);
  return out;
}
function decodeDocument(doc) {
  if (!doc) return null;
  return { name: doc.name, createTime: doc.createTime, updateTime: doc.updateTime, ...decodeFields(doc.fields || {}) };
}

async function api(env, url, options = {}) {
  const token = await getAccessToken(env);
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  return res;
}

export async function getDocument(env, path) {
  const res = await api(env, `${dbBase(env)}/${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore get failed (${res.status})`);
  return decodeDocument(await res.json());
}

export async function patchDocument(env, path, fields) {
  const params = new URLSearchParams();
  Object.keys(fields || {}).forEach(k => params.append("updateMask.fieldPaths", k));
  const res = await api(env, `${dbBase(env)}/${path}?${params.toString()}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(fields || {}) })
  });
  if (!res.ok) throw new Error(`Firestore patch failed (${res.status})`);
  return decodeDocument(await res.json());
}

async function beginTransaction(env) {
  const res = await api(env, `${dbBase(env)}:beginTransaction`, { method: "POST", body: "{}" });
  if (!res.ok) throw new Error(`Firestore beginTransaction failed (${res.status})`);
  return (await res.json()).transaction;
}

async function batchGet(env, paths, transaction) {
  const res = await api(env, `${dbBase(env)}:batchGet`, {
    method: "POST",
    body: JSON.stringify({ documents: paths.map(p => docName(env, p)), transaction })
  });
  if (!res.ok) throw new Error(`Firestore batchGet failed (${res.status})`);
  const text = await res.text();
  const rows = text.trim() ? text.trim().split("\n").map(line => JSON.parse(line)) : [];
  const out = new Map(paths.map(p => [docName(env, p), null]));
  for (const row of rows) {
    if (row.found) out.set(row.found.name, decodeDocument(row.found));
    if (row.missing) out.set(row.missing, null);
  }
  return paths.map(p => out.get(docName(env, p)) || null);
}

function writeUpdate(env, path, data, precondition = null) {
  const w = { update: { name: docName(env, path), fields: encodeFields(data) } };
  if (precondition) w.currentDocument = precondition;
  return w;
}
function writeDelete(env, path, precondition = null) {
  const w = { delete: docName(env, path) };
  if (precondition) w.currentDocument = precondition;
  return w;
}

async function commit(env, transaction, writes) {
  const res = await api(env, `${dbBase(env)}:commit`, { method: "POST", body: JSON.stringify({ transaction, writes }) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(`Firestore commit failed (${res.status})`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return res.json();
}

async function txRetry(fn, attempts = 5) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      const aborted = e?.status === 409 || e?.details?.error?.status === "ABORTED";
      if (!aborted || i === attempts - 1) throw e;
      await new Promise(r => setTimeout(r, 25 * (i + 1)));
    }
  }
  throw last;
}

function safeId(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 180); }
function profileLimitPath(uid, profileId) {
  return `aiProfileLimits/${safeId(uid)}__${safeId(profileId)}`;
}
function profileLimitDefaults(uid, profileId) {
  return {
    uid, profileId, mode: "unlimited", limitCredits: 0, usedCredits: 0, reservedCredits: 0, updatedAt: new Date().toISOString()
  };
}
async function accountData(env, uid) {
  return await getDocument(env, `usuarios/${safeId(uid)}`);
}
function accountProfiles(account) {
  return Array.isArray(account?.perfiles) ? account.perfiles.filter(p => p && p.id) : [];
}
async function profileExists(env, uid, profileId) {
  if (!profileId) return false;
  const account = await accountData(env, uid);
  if (accountProfiles(account).some(p => String(p.id) === String(profileId))) return true;
  // Compatibilidad con perfiles que ya tengan subdocumento propio.
  return !!(await getDocument(env, `usuarios/${safeId(uid)}/perfiles/${safeId(profileId)}`));
}
function profileControlPath(uid, profileId) {
  return `profileControls/${safeId(uid)}__${safeId(profileId)}`;
}
function profileControlDefaults(uid, profileId, isPrimary = false) {
  return {
    uid, profileId, accessLevel: "full", allowAI: true, isPrimary: !!isPrimary, updatedAt: new Date().toISOString()
  };
}
export async function getProfileControls(env, uid, profileIds = []) {
  const account = await accountData(env, uid);
  const profiles = accountProfiles(account);
  const valid = new Set(profiles.map(p => String(p.id)));
  const requested = [...new Set((Array.isArray(profileIds) && profileIds.length ? profileIds : profiles.map(p => p.id)).map(String))].filter(id => valid.has(id)).slice(0, 50);
  const primaryProfileId = valid.has(String(account?.primaryProfileId || "")) ? String(account.primaryProfileId) : (profiles.length === 1 ? String(profiles[0].id) : "");
  const controls = await Promise.all(requested.map(async profileId => {
    const raw = await getDocument(env, profileControlPath(uid, profileId));
    const isPrimary = profileId === primaryProfileId;
    const base = profileControlDefaults(uid, profileId, isPrimary);
    const out = { ...base, ...(raw || {}), uid, profileId, isPrimary };
    if (isPrimary) { out.accessLevel = "full"; out.allowAI = true; }
    if (!["full", "standard", "readonly"].includes(out.accessLevel)) out.accessLevel = "full";
    if (out.accessLevel === "readonly") out.allowAI = false;
    return out;
  }));
  return { profiles: profiles.map(p => ({ id:String(p.id), nombre:String(p.nombre || p.name || p.id) })), primaryProfileId, controls };
}

function hexBytes(hex) {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2) return null;
  return new Uint8Array(hex.match(/../g).map(x => parseInt(x, 16)));
}
async function verifyPbkdf2Pin(pin, stored) {
  if (typeof stored !== "string" || !stored.startsWith("pbkdf2$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || !/^\d+$/.test(parts[1])) return false;
  const iterations = Number(parts[1]);
  const salt = hexBytes(parts[2]);
  const expected = parts[3].toLowerCase();
  if (!salt || !/^[a-f0-9]{64}$/i.test(expected) || iterations < 100000 || iterations > 1000000) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(pin || "")), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name:"PBKDF2", hash:"SHA-256", salt, iterations }, key, 256));
  const actual = Array.from(bits, b => b.toString(16).padStart(2,"0")).join("");
  let diff = actual.length ^ expected.length;
  for (let i=0; i<Math.min(actual.length, expected.length); i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
export async function verifySecurityPin(env, uid, pin, actorProfileId = null, requirePrimary = true) {
  const account = await accountData(env, uid);
  if (!account) throw Object.assign(new Error("Account not found"), { code:"ACCOUNT_NOT_FOUND" });
  if (!account.pinHash) throw Object.assign(new Error("Security PIN not configured"), { code:"PIN_NOT_CONFIGURED" });
  if (!String(account.pinHash).startsWith("pbkdf2$")) throw Object.assign(new Error("Legacy PIN must be upgraded"), { code:"PIN_UPGRADE_REQUIRED" });
  if (!(await verifyPbkdf2Pin(pin, account.pinHash))) throw Object.assign(new Error("Invalid security PIN"), { code:"INVALID_SECURITY_PIN" });
  const profiles = accountProfiles(account);
  const valid = new Set(profiles.map(p => String(p.id)));
  const primary = valid.has(String(account.primaryProfileId || "")) ? String(account.primaryProfileId) : (profiles.length === 1 ? String(profiles[0].id) : "");
  if (requirePrimary && (!primary || String(actorProfileId || "") !== primary)) throw Object.assign(new Error("Primary profile required"), { code:"PRIMARY_PROFILE_REQUIRED", primaryProfileId:primary });
  return { account, primaryProfileId:primary, profiles };
}
export async function setProfileControl(env, uid, profileId, accessLevel, allowAI) {
  profileId = String(profileId || "");
  if (!["full","standard","readonly"].includes(accessLevel)) throw Object.assign(new Error("Invalid access level"), { code:"INVALID_PROFILE_CONTROL" });
  const state = await getProfileControls(env, uid, [profileId]);
  if (!state.profiles.some(p => p.id === profileId)) throw Object.assign(new Error("Profile not found"), { code:"PROFILE_NOT_FOUND" });
  if (state.primaryProfileId === profileId) throw Object.assign(new Error("Primary profile cannot be restricted"), { code:"PRIMARY_PROFILE_LOCKED" });
  const next = { uid, profileId, accessLevel, allowAI: accessLevel === "readonly" ? false : allowAI !== false, isPrimary:false, updatedAt:new Date().toISOString() };
  await patchDocument(env, profileControlPath(uid, profileId), next);
  return next;
}
export async function setPrimaryProfile(env, uid, targetProfileId) {
  targetProfileId = String(targetProfileId || "");
  const account = await accountData(env, uid);
  if (!accountProfiles(account).some(p => String(p.id) === targetProfileId)) throw Object.assign(new Error("Profile not found"), { code:"PROFILE_NOT_FOUND" });
  await patchDocument(env, `usuarios/${safeId(uid)}`, { primaryProfileId:targetProfileId });
  return targetProfileId;
}

export async function getProfileLimits(env, uid, profileIds) {
  const ids = [...new Set((Array.isArray(profileIds) ? profileIds : []).map(x => String(x || "").trim()).filter(Boolean))].slice(0, 50);
  const rows = await Promise.all(ids.map(async profileId => {
    if (!(await profileExists(env, uid, profileId))) return null;
    const doc = await getDocument(env, profileLimitPath(uid, profileId));
    const base = profileLimitDefaults(uid, profileId);
    return { ...base, ...(doc || {}), uid, profileId };
  }));
  return rows.filter(Boolean);
}

export async function setProfileLimit(env, uid, profileId, mode, limitCredits, resetUsed = false) {
  profileId = String(profileId || "").trim();
  mode = String(mode || "").trim();
  if (!profileId || !["unlimited", "limited", "blocked"].includes(mode)) throw Object.assign(new Error("Invalid profile limit"), { code: "INVALID_PROFILE_LIMIT" });
  if (!(await profileExists(env, uid, profileId))) throw Object.assign(new Error("Profile not found"), { code: "PROFILE_NOT_FOUND" });
  const limit = mode === "limited" ? Math.floor(Number(limitCredits)) : 0;
  if (mode === "limited" && (!Number.isFinite(limit) || limit < 1 || limit > 1000000)) throw Object.assign(new Error("Invalid credit limit"), { code: "INVALID_PROFILE_LIMIT" });
  const path = profileLimitPath(uid, profileId);
  return txRetry(async () => {
    const tx = await beginTransaction(env);
    const [raw] = await batchGet(env, [path], tx);
    const base = raw || profileLimitDefaults(uid, profileId);
    const next = {
      ...base, uid, profileId, mode, limitCredits: limit,
      usedCredits: resetUsed ? 0 : Math.max(0, Number(base.usedCredits || 0)),
      reservedCredits: Math.max(0, Number(base.reservedCredits || 0)),
      updatedAt: new Date().toISOString()
    };
    await commit(env, tx, [writeUpdate(env, path, next, raw ? null : { exists: false })]);
    return next;
  });
}
function walletDefaults(user, starterCredits) {
  const grant = user.emailVerified ? Math.max(0, starterCredits) : 0;
  return {
    uid: user.uid,
    email: user.email || "",
    platformRole: "user",
    unlimited: false,
    availableCredits: grant,
    reservedCredits: 0,
    starterCreditsGranted: grant > 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function getOrCreateWallet(env, user, starterCredits = 10) {
  const path = `aiWallets/${safeId(user.uid)}`;
  const existing = await getDocument(env, path);
  if (existing && !(user.emailVerified && !existing.starterCreditsGranted && starterCredits > 0)) return existing;
  return txRetry(async () => {
    const tx = await beginTransaction(env);
    const [wallet] = await batchGet(env, [path], tx);
    if (wallet) {
      if (user.emailVerified && !wallet.starterCreditsGranted && starterCredits > 0) {
        const next = { ...wallet, email: user.email || wallet.email || "", availableCredits: Number(wallet.availableCredits || 0) + starterCredits, starterCreditsGranted: true, updatedAt: new Date().toISOString() };
        await commit(env, tx, [
          writeUpdate(env, path, next),
          writeUpdate(env, `aiLedger/starter_${safeId(user.uid)}`, { uid: user.uid, type: "starter_grant", credits: starterCredits, createdAt: new Date().toISOString() }, { exists: false })
        ]);
        return next;
      }
      await commit(env, tx, []);
      return wallet;
    }
    const created = walletDefaults(user, starterCredits);
    const writes = [writeUpdate(env, path, created, { exists: false })];
    if (created.starterCreditsGranted) {
      writes.push(writeUpdate(env, `aiLedger/starter_${safeId(user.uid)}`, {
        uid: user.uid, type: "starter_grant", credits: created.availableCredits, createdAt: new Date().toISOString()
      }, { exists: false }));
    }
    await commit(env, tx, writes);
    return created;
  });
}

export async function reserveCredits(env, user, feature, credits, requestId, starterCredits = 10, profileId = null, options = {}) {
  const skipWallet = options?.skipWallet === true;
  profileId = profileId ? String(profileId).trim() : null;
  if (profileId && !(await profileExists(env, user.uid, profileId))) throw Object.assign(new Error("Profile not found"), { code: "PROFILE_NOT_FOUND" });
  if (profileId) {
    const general = await getProfileControls(env, user.uid, [profileId]);
    const control = general.controls && general.controls[0];
    if (control && (control.accessLevel === "readonly" || control.allowAI === false)) {
      throw Object.assign(new Error("AI disabled for this profile"), { code:"PROFILE_AI_BLOCKED", profileId });
    }
  }

  const walletPath = `aiWallets/${safeId(user.uid)}`;
  const reservationPath = `aiReservations/${safeId(requestId)}`;
  const limitPath = profileId ? profileLimitPath(user.uid, profileId) : null;

  return txRetry(async () => {
    const tx = await beginTransaction(env);
    const paths = [reservationPath];
    if (!skipWallet) paths.push(walletPath);
    if (limitPath) paths.push(limitPath);
    const docs = await batchGet(env, paths, tx);
    let pos = 0;
    const reservation = docs[pos++];
    const walletRaw = skipWallet ? null : docs[pos++];
    const limitRaw = limitPath ? docs[pos++] : null;

    if (reservation) {
      await commit(env, tx, []);
      if (reservation.uid !== user.uid || reservation.feature !== feature || String(reservation.profileId || "") !== String(profileId || "")) {
        throw Object.assign(new Error("requestId already used"), { code: "REQUEST_ID_CONFLICT" });
      }
      return { reused: true, reservation, wallet: walletRaw, profileLimit: limitRaw };
    }

    const profileLimit = limitPath ? { ...profileLimitDefaults(user.uid, profileId), ...(limitRaw || {}) } : null;
    if (profileLimit?.mode === "blocked") {
      await commit(env, tx, []);
      throw Object.assign(new Error("AI disabled for this profile"), { code: "PROFILE_AI_BLOCKED", profileId });
    }
    if (profileLimit?.mode === "limited") {
      const used = Math.max(0, Number(profileLimit.usedCredits || 0));
      const reservedProfile = Math.max(0, Number(profileLimit.reservedCredits || 0));
      const cap = Math.max(0, Number(profileLimit.limitCredits || 0));
      if (used + reservedProfile + credits > cap) {
        await commit(env, tx, []);
        throw Object.assign(new Error("Profile AI credit limit reached"), {
          code: "PROFILE_AI_LIMIT_REACHED", profileId, used, reserved: reservedProfile, limit: cap, required: credits
        });
      }
    }

    let wallet = walletRaw;
    let nextWallet = null;
    let starterGrantedNow = false;
    if (!skipWallet) {
      wallet = walletRaw || walletDefaults(user, starterCredits);
      if (!user.emailVerified && !walletRaw) throw Object.assign(new Error("Email verification required"), { code: "EMAIL_VERIFICATION_REQUIRED" });
      if (walletRaw && user.emailVerified && !wallet.starterCreditsGranted && starterCredits > 0) {
        wallet = { ...wallet, availableCredits: Number(wallet.availableCredits || 0) + starterCredits, starterCreditsGranted: true };
        starterGrantedNow = true;
      }
      if (Number(wallet.availableCredits || 0) < credits) throw Object.assign(new Error("Insufficient AI credits"), { code: "AI_CREDITS_REQUIRED", balance: Number(wallet.availableCredits || 0), required: credits });
      nextWallet = { ...wallet, email: user.email || wallet.email || "", availableCredits: Number(wallet.availableCredits || 0) - credits, reservedCredits: Number(wallet.reservedCredits || 0) + credits, updatedAt: new Date().toISOString() };
    }

    const limitedProfile = profileLimit?.mode === "limited";
    const nextProfileLimit = limitedProfile ? {
      ...profileLimit,
      reservedCredits: Math.max(0, Number(profileLimit.reservedCredits || 0)) + credits,
      updatedAt: new Date().toISOString()
    } : null;

    const reservationDoc = {
      requestId, uid: user.uid, feature, credits, profileId: profileId || "", walletReserved: !skipWallet,
      profileLimited: !!limitedProfile, profileLimitCredits: limitedProfile ? Number(profileLimit.limitCredits || 0) : 0,
      state: "reserved", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    const writes = [writeUpdate(env, reservationPath, reservationDoc, { exists: false })];
    if (nextWallet) writes.push(writeUpdate(env, walletPath, nextWallet, walletRaw ? null : { exists: false }));
    if (nextProfileLimit) writes.push(writeUpdate(env, limitPath, nextProfileLimit, limitRaw ? null : { exists: false }));
    if (!skipWallet && ((!walletRaw && nextWallet?.starterCreditsGranted) || starterGrantedNow)) {
      writes.push(writeUpdate(env, `aiLedger/starter_${safeId(user.uid)}`, { uid: user.uid, type: "starter_grant", credits: starterCredits, createdAt: new Date().toISOString() }, { exists: false }));
    }
    await commit(env, tx, writes);
    return { reused: false, reservation: reservationDoc, wallet: nextWallet, profileLimit: nextProfileLimit || profileLimit };
  });
}

export async function finalizeReservation(env, user, requestId, success, actualCostUsd = 0, usage = null) {
  const walletPath = `aiWallets/${safeId(user.uid)}`;
  const reservationPath = `aiReservations/${safeId(requestId)}`;
  return txRetry(async () => {
    const tx = await beginTransaction(env);
    const [reservation] = await batchGet(env, [reservationPath], tx);
    if (!reservation) { await commit(env, tx, []); return null; }
    if (reservation.uid !== user.uid) throw new Error("Reservation owner mismatch");
    if (reservation.state !== "reserved") { await commit(env, tx, []); return reservation; }

    const paths = [];
    if (reservation.walletReserved) paths.push(walletPath);
    const limitPath = reservation.profileLimited && reservation.profileId ? profileLimitPath(user.uid, reservation.profileId) : null;
    if (limitPath) paths.push(limitPath);
    const docs = paths.length ? await batchGet(env, paths, tx) : [];
    let pos = 0;
    const wallet = reservation.walletReserved ? docs[pos++] : null;
    const profileLimit = limitPath ? docs[pos++] : null;

    const credits = Number(reservation.credits || 0);
    const nextReservation = { ...reservation, state: success ? "captured" : "released", actualCostUsd: Number(actualCostUsd || 0), usage: usage || null, updatedAt: new Date().toISOString() };
    const writes = [writeUpdate(env, reservationPath, nextReservation)];

    if (reservation.walletReserved) {
      const nextWallet = {
        ...wallet,
        reservedCredits: Math.max(0, Number(wallet?.reservedCredits || 0) - credits),
        availableCredits: Number(wallet?.availableCredits || 0) + (success ? 0 : credits),
        updatedAt: new Date().toISOString()
      };
      writes.push(writeUpdate(env, walletPath, nextWallet));
    }

    if (limitPath) {
      const base = profileLimit || { ...profileLimitDefaults(user.uid, reservation.profileId), mode: "limited", limitCredits: Number(reservation.profileLimitCredits || credits) };
      const nextLimit = {
        ...base,
        reservedCredits: Math.max(0, Number(base.reservedCredits || 0) - credits),
        usedCredits: Math.max(0, Number(base.usedCredits || 0)) + (success ? credits : 0),
        updatedAt: new Date().toISOString()
      };
      writes.push(writeUpdate(env, limitPath, nextLimit, profileLimit ? null : { exists: false }));
    }

    if (success) writes.push(writeUpdate(env, `aiLedger/${safeId(requestId)}_usage`, {
      uid: user.uid, profileId: reservation.profileId || "", type: "usage", feature: reservation.feature,
      credits: -credits, requestId, actualCostUsd: Number(actualCostUsd || 0), createdAt: new Date().toISOString()
    }, { exists: false }));
    await commit(env, tx, writes);
    return nextReservation;
  });
}

export async function getBudgetCounters(env, uid, dayKey, weekKey) {
  const paths = [`aiBudgets/global_${dayKey}`, `aiBudgets/owner_${safeId(uid)}_${dayKey}`, `aiBudgets/owner_${safeId(uid)}_${weekKey}`];
  const docs = await Promise.all(paths.map(p => getDocument(env, p)));
  return { globalDaily: Number(docs[0]?.usd || 0), ownerDaily: Number(docs[1]?.usd || 0), ownerWeekly: Number(docs[2]?.usd || 0) };
}

export async function addBudgetUsage(env, uid, costUsd, dayKey, weekKey, isOwner) {
  if (!(costUsd > 0)) return;
  const paths = [`aiBudgets/global_${dayKey}`];
  if (isOwner) paths.push(`aiBudgets/owner_${safeId(uid)}_${dayKey}`, `aiBudgets/owner_${safeId(uid)}_${weekKey}`);
  await txRetry(async () => {
    const tx = await beginTransaction(env);
    const docs = await batchGet(env, paths, tx);
    const writes = paths.map((path, i) => writeUpdate(env, path, { key: path.split("/")[1], usd: Number(docs[i]?.usd || 0) + Number(costUsd), updatedAt: new Date().toISOString() }, docs[i] ? null : { exists: false }));
    await commit(env, tx, writes);
  });
}

export async function grantCredits(env, targetUid, credits, actorUid, reason = "owner_grant") {
  if (!(credits > 0 && Number.isInteger(credits))) throw new Error("credits must be a positive integer");
  const walletPath = `aiWallets/${safeId(targetUid)}`;
  const ledgerId = `grant_${safeId(targetUid)}_${crypto.randomUUID().replace(/-/g, "")}`;
  return txRetry(async () => {
    const tx = await beginTransaction(env);
    const [wallet] = await batchGet(env, [walletPath], tx);
    const base = wallet || { uid: targetUid, email: "", platformRole: "user", unlimited: false, availableCredits: 0, reservedCredits: 0, starterCreditsGranted: false, createdAt: new Date().toISOString() };
    const next = { ...base, availableCredits: Number(base.availableCredits || 0) + credits, updatedAt: new Date().toISOString() };
    await commit(env, tx, [
      writeUpdate(env, walletPath, next, wallet ? null : { exists: false }),
      writeUpdate(env, `aiLedger/${ledgerId}`, { uid: targetUid, type: reason, credits, actorUid, createdAt: new Date().toISOString() }, { exists: false })
    ]);
    return next;
  });
}

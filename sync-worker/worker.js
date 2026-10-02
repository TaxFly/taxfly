// Proxy mínimo hacia Firestore para usuarios cuyo bloqueador de anuncios corta
// firestore.googleapis.com. Solo reenvía rutas de Firestore del proyecto de TaxFly.
const UPSTREAM = "firestore.googleapis.com";
const PROJECT = "viajes-db538";

export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGINS || "https://taxfly.github.io")
      .split(",").map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const originOk = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
      "Access-Control-Expose-Headers": "*",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return originOk ? new Response(null, { status: 204, headers: cors }) : new Response(null, { status: 403 });
    }
    if (origin && !originOk) return new Response("Forbidden", { status: 403 });

    const url = new URL(request.url);
    const isChannel = url.pathname.startsWith("/google.firestore.v1.Firestore/");
    const isRest = url.pathname.startsWith("/v1/projects/" + PROJECT + "/");
    if (!isChannel && !isRest) return new Response("Not found", { status: 404 });
    const dbParam = url.searchParams.get("database");
    if (isChannel && dbParam && !dbParam.startsWith("projects/" + PROJECT + "/")) {
      return new Response("Forbidden", { status: 403 });
    }

    const headers = new Headers(request.headers);
    ["origin", "referer", "cookie", "host"].forEach(h => headers.delete(h));
    const upstream = await fetch("https://" + UPSTREAM + url.pathname + url.search, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual"
    });

    const out = new Headers(upstream.headers);
    [...out.keys()].filter(k => k.startsWith("access-control-")).forEach(k => out.delete(k));
    if (origin) Object.entries(cors).forEach(([k, v]) => out.set(k, v));
    out.set("Cache-Control", "no-store, no-transform");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  }
};

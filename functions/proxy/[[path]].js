const ALLOWED = {
  "/get_movies.php":    { type: "application/json", cache: "public, max-age=3600" },
  "/get_showtimes.php": { type: "application/json", cache: "public, max-age=1800" },
  "/get_poster.php":    { type: null,               cache: "public, max-age=86400" },
};

const UPSTREAM = "https://www.paris-cine.info";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/proxy/, "");
  const rule = ALLOWED[path];
  if (!rule) return new Response("Not found", { status: 404 });

  // Les Pages Functions ne passent PAS par le cache CDN automatiquement : le
  // Cache-Control ci-dessus ne pilote que le navigateur. Sans ce cache explicite,
  // chaque visiteur relance un appel réel par film, et la source nous rate-limite
  // (Cloudflare, error code 1015) au-delà d'environ 1,4 requête/seconde.
  const cacheable = request.method === "GET";
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: "GET" });

  if (cacheable) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      const cached = new Response(hit.body, hit);
      cached.headers.set("X-Proxy-Cache", "HIT");
      return cached;
    }
  }

  const upstream = await fetch(UPSTREAM + path + url.search, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const res = new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": rule.type || upstream.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": rule.cache,
      "X-Content-Type-Options": "nosniff",
      "X-Proxy-Cache": "MISS",
    },
  });

  // On ne met en cache que les succès : figer un 429 pendant 30 minutes
  // propagerait le rate-limit de la source à tous les visiteurs.
  if (cacheable && upstream.status === 200) {
    context.waitUntil(cache.put(cacheKey, res.clone()));
  } else if (upstream.status !== 200) {
    res.headers.set("Cache-Control", "no-store");
  }

  return res;
}

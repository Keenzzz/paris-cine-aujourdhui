const ALLOWED = {
  "/get_movies.php":    { type: "application/json", cache: "public, max-age=3600" },
  "/get_showtimes.php": { type: "application/json", cache: "public, max-age=1800" },
  "/get_poster.php":    { type: null,               cache: "public, max-age=86400" },
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/proxy/, "");
  const rule = ALLOWED[path];
  if (!rule) return new Response("Not found", { status: 404 });

  const res = await fetch("https://www.paris-cine.info" + path + url.search, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": rule.type || res.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": rule.cache,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

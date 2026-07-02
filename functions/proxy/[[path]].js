export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = "https://www.paris-cine.info" + url.pathname.replace(/^\/proxy/, "") + url.search;
  const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" } });
  const body = await res.arrayBuffer();
  return new Response(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

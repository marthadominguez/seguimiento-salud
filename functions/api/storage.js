// Cloudflare Pages Function — /api/storage
//
// Requiere:
//  - Un KV namespace ligado a esta variable de entorno: HEALTH_KV
//  - Una variable de entorno secreta: API_KEY
//
// El navegador debe enviar el header:  Authorization: Bearer <API_KEY>

function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

function checkAuth(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  return token && env.API_KEY && token === env.API_KEY;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!checkAuth(request, env)) return unauthorized();

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const prefix = url.searchParams.get("prefix");

  try {
    if (request.method === "GET") {
      if (prefix !== null) {
        const list = await env.HEALTH_KV.list({ prefix: prefix || "" });
        return json({ keys: list.keys.map((k) => k.name) });
      }
      if (!key) return json({ error: "missing key" }, 400);
      const value = await env.HEALTH_KV.get(key);
      if (value === null) return json({ error: "not found" }, 404);
      return json({ key, value });
    }

    if (request.method === "POST" || request.method === "PUT") {
      const body = await request.json();
      if (!body.key) return json({ error: "missing key" }, 400);
      await env.HEALTH_KV.put(body.key, body.value);
      return json({ key: body.key, value: body.value });
    }

    if (request.method === "DELETE") {
      if (!key) return json({ error: "missing key" }, 400);
      await env.HEALTH_KV.delete(key);
      return json({ key, deleted: true });
    }

    return json({ error: "method not allowed" }, 405);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

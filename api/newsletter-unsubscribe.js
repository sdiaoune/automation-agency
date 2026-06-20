const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = (process.env.SITE_URL || "https://www.emc2ops.com").replace(/\/$/, "");

function clean(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

function sendHtml(response, statusCode, title, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | EMC2Ops</title>
    <style>
      body{margin:0;font-family:Inter,Arial,sans-serif;background:#0b0c0a;color:#f5f7fb;display:grid;min-height:100vh;place-items:center;padding:24px}
      main{max-width:560px;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:28px;background:rgba(255,255,255,.05)}
      a{color:#f7c948}
      p{color:#cbd5e1;line-height:1.6}
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="${SITE_URL}/blog/">Return to the EMC2Ops blog</a></p>
    </main>
  </body>
</html>`);
}

async function readBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    return request.body ? JSON.parse(request.body) : {};
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

async function unsubscribe(token) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter_subscribers?unsubscribe_token=eq.${encodeURIComponent(token)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      }),
    },
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.message || data?.hint || "Supabase unsubscribe failed.";
    throw new Error(detail);
  }

  return data?.[0] || null;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(response, 500, { error: "Newsletter storage is not configured." });
  }

  const url = new URL(request.url || "/api/newsletter-unsubscribe", SITE_URL);
  let token = clean(url.searchParams.get("token"), 200);

  if (!token && request.method === "POST") {
    try {
      const body = await readBody(request);
      token = clean(body.token, 200);
    } catch {
      return sendJson(response, 400, { error: "Invalid JSON payload." });
    }
  }

  if (!token) {
    return request.method === "GET"
      ? sendHtml(response, 400, "Unsubscribe link missing", "This unsubscribe link is missing its token.")
      : sendJson(response, 400, { error: "Unsubscribe token is required." });
  }

  try {
    const subscriber = await unsubscribe(token);
    if (!subscriber) {
      return request.method === "GET"
        ? sendHtml(response, 404, "Link not found", "This unsubscribe link is invalid or already rotated.")
        : sendJson(response, 404, { error: "Subscriber not found." });
    }

    return request.method === "GET"
      ? sendHtml(response, 200, "You are unsubscribed", "You will no longer receive EMC2Ops newsletter emails.")
      : sendJson(response, 200, { ok: true });
  } catch (error) {
    return request.method === "GET"
      ? sendHtml(response, 500, "Unsubscribe failed", "We could not process that request. Please reply to the email and we will remove you manually.")
      : sendJson(response, 500, { error: error.message || "Could not unsubscribe." });
  }
};

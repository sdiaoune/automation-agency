const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const crypto = require("node:crypto");

const allowedMethods = ["POST"];

function clean(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
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

async function upsertSubscriber(subscriber) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter_subscribers?on_conflict=email`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(subscriber)
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.message || data?.hint || "Supabase upsert failed.";
    throw new Error(detail);
  }

  return data[0];
}

async function updateSubscriberNotification(id, values) {
  if (!id) return;

  await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  }).catch(() => {});
}

function notificationText(subscriber) {
  return [
    "New EMC2Ops newsletter subscriber",
    "",
    `Email: ${subscriber.email}`,
    `Source: ${subscriber.source || "website"}`,
    `Page: ${subscriber.page_url || "Not captured"}`
  ].join("\n");
}

async function sendTelegramNotification(subscriber) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { provider: null, providerMessageId: null };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: notificationText(subscriber),
      disable_web_page_preview: true
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const detail = data.description || "Telegram notification failed.";
    throw new Error(detail);
  }

  return {
    provider: "telegram",
    providerMessageId: data.result?.message_id ? String(data.result.message_id) : null
  };
}

module.exports = async function handler(request, response) {
  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods.join(", "));
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(response, 500, { error: "Newsletter storage is not configured." });
  }

  let body;
  try {
    body = await readBody(request);
  } catch {
    return sendJson(response, 400, { error: "Invalid JSON payload." });
  }

  if (clean(body.websiteConfirm)) {
    return sendJson(response, 200, { ok: true });
  }

  const subscriber = {
    email: clean(body.email, 320).toLowerCase(),
    source: clean(body.source, 120) || "website",
    page_url: clean(body.pageUrl, 500),
    user_agent: clean(request.headers["user-agent"], 500),
    status: "active",
    unsubscribe_token: createToken(),
    unsubscribed_at: null,
    notification_status: "pending",
    subscribed_at: new Date().toISOString()
  };

  if (!isEmail(subscriber.email)) {
    return sendJson(response, 400, { error: "A valid email is required." });
  }

  let savedSubscriber;
  try {
    savedSubscriber = await upsertSubscriber(subscriber);
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not save subscription." });
  }

  try {
    const notification = await sendTelegramNotification(savedSubscriber);
    await updateSubscriberNotification(savedSubscriber.id, {
      notification_status: notification.provider ? "sent" : "not_configured",
      notification_provider: notification.provider,
      notification_provider_message_id: notification.providerMessageId,
      notification_error: null,
      notified_at: notification.provider ? new Date().toISOString() : null
    });

    return sendJson(response, 200, {
      ok: true,
      id: savedSubscriber.id,
      notification: notification.provider ? "sent" : "not_configured"
    });
  } catch (error) {
    await updateSubscriberNotification(savedSubscriber.id, {
      notification_status: "failed",
      notification_error: clean(error.message, 1000)
    });

    return sendJson(response, 200, {
      ok: true,
      id: savedSubscriber.id,
      notification: "failed"
    });
  }
};

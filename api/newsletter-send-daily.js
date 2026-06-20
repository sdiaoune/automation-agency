const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = (process.env.SITE_URL || "https://www.emc2ops.com").replace(/\/$/, "");
const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM || "EMC2Ops <newsletter@emc2ops.com>";
const NEWSLETTER_REPLY_TO = process.env.NEWSLETTER_REPLY_TO || "hello@emc2ops.com";
const NEWSLETTER_LOOKBACK_DAYS = Number(process.env.NEWSLETTER_LOOKBACK_DAYS || 2);
const NEWSLETTER_CRON_SECRET = process.env.CRON_SECRET || process.env.NEWSLETTER_CRON_SECRET;
const crypto = require("node:crypto");

function clean(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

function isAuthorized(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const url = new URL(request.url || "/api/newsletter-send-daily", SITE_URL);
  return Boolean(NEWSLETTER_CRON_SECRET) && (
    token === NEWSLETTER_CRON_SECRET || url.searchParams.get("secret") === NEWSLETTER_CRON_SECRET
  );
}

function absoluteUrl(pathname) {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textForPosts(posts, unsubscribeUrl) {
  return [
    "New EMC2Ops property management automation guides",
    "",
    ...posts.flatMap((post) => [
      post.title,
      absoluteUrl(post.url),
      post.meta,
      "",
    ]),
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");
}

function htmlForPosts(posts, unsubscribeUrl) {
  const items = posts
    .map(
      (post) => `
        <li style="margin:0 0 22px;padding:0;">
          <a href="${escapeHtml(absoluteUrl(post.url))}" style="color:#12120e;font-size:18px;font-weight:700;text-decoration:none;">${escapeHtml(post.title)}</a>
          <p style="color:#4b5563;font-size:15px;line-height:1.55;margin:8px 0 10px;">${escapeHtml(post.meta)}</p>
          <a href="${escapeHtml(absoluteUrl(post.url))}" style="color:#7a5a00;font-weight:700;text-decoration:none;">Read the guide</a>
        </li>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f4ea;font-family:Inter,Arial,sans-serif;color:#12120e;">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e7e0c8;border-radius:8px;padding:28px;">
        <p style="color:#7a5a00;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px;">EMC2Ops newsletter</p>
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 12px;">New property management automation guides</h1>
        <p style="color:#4b5563;font-size:16px;line-height:1.55;margin:0 0 24px;">Fresh notes on missed-call recovery, leasing follow-up, maintenance intake, CRM cleanup, and operational AI workflows.</p>
        <ul style="list-style:none;margin:0;padding:0;">${items}</ul>
        <p style="border-top:1px solid #e7e0c8;color:#6b7280;font-size:13px;line-height:1.5;margin:24px 0 0;padding-top:18px;">
          You are receiving this because you subscribed to EMC2Ops updates.
          <a href="${escapeHtml(unsubscribeUrl)}" style="color:#7a5a00;">Unsubscribe</a>.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.message || data?.hint || `Supabase request failed with ${response.status}.`;
    throw new Error(detail);
  }

  return data;
}

async function fetchRecentPosts() {
  const response = await fetch(`${SITE_URL}/blog/posts.json`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Could not load blog posts feed (${response.status}).`);
  }

  const cutoff = Date.now() - Math.max(1, NEWSLETTER_LOOKBACK_DAYS) * 24 * 60 * 60 * 1000;
  const posts = await response.json();
  return posts
    .map((post) => ({ ...post, publishedTime: Date.parse(post.publishedAt) }))
    .filter((post) => post.slug && post.title && post.url && post.publishedTime)
    .filter((post) => post.publishedTime <= Date.now() && post.publishedTime >= cutoff)
    .sort((left, right) => left.publishedTime - right.publishedTime);
}

async function ensureUnsubscribeToken(subscriber) {
  if (subscriber.unsubscribe_token) return subscriber.unsubscribe_token;

  const unsubscribeToken = crypto.randomBytes(32).toString("hex");
  await supabaseFetch(`newsletter_subscribers?id=eq.${encodeURIComponent(subscriber.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ unsubscribe_token: unsubscribeToken }),
  });
  subscriber.unsubscribe_token = unsubscribeToken;
  return unsubscribeToken;
}

async function sendEmail(subscriber, posts) {
  const unsubscribeUrl = `${SITE_URL}/api/newsletter-unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
  const subject =
    posts.length === 1
      ? `New EMC2Ops guide: ${posts[0].title}`
      : `${posts.length} new EMC2Ops automation guides`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: NEWSLETTER_FROM,
      to: [subscriber.email],
      reply_to: NEWSLETTER_REPLY_TO,
      subject,
      html: htmlForPosts(posts, unsubscribeUrl),
      text: textForPosts(posts, unsubscribeUrl),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Resend failed with ${response.status}.`);
  }

  return data.id || null;
}

async function markDeliveries(subscriber, posts, status, providerMessageId, error) {
  if (!posts.length) return;

  await supabaseFetch("newsletter_email_deliveries?on_conflict=subscriber_id,post_slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(
      posts.map((post) => ({
        subscriber_id: subscriber.id,
        post_slug: post.slug,
        post_title: post.title,
        post_url: absoluteUrl(post.url),
        status,
        provider: "resend",
        provider_message_id: providerMessageId,
        error: clean(error, 1000) || null,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      })),
    ),
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!isAuthorized(request)) {
    return sendJson(response, 401, { error: "Unauthorized." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return sendJson(response, 500, { error: "Newsletter delivery is not configured." });
  }

  let posts;
  try {
    posts = await fetchRecentPosts();
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not load posts." });
  }

  if (!posts.length) {
    return sendJson(response, 200, { ok: true, subscribers: 0, emailsSent: 0, postsSent: 0 });
  }

  let subscribers;
  let sentDeliveries;
  try {
    subscribers = await supabaseFetch(
      "newsletter_subscribers?status=eq.active&select=id,email,subscribed_at,unsubscribe_token",
    );
    const slugs = posts.map((post) => post.slug).join(",");
    sentDeliveries = await supabaseFetch(
      `newsletter_email_deliveries?status=eq.sent&post_slug=in.(${slugs})&select=subscriber_id,post_slug`,
    );
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not load subscribers." });
  }

  const alreadySent = new Set(sentDeliveries.map((delivery) => `${delivery.subscriber_id}:${delivery.post_slug}`));
  let emailsSent = 0;
  let postsSent = 0;
  let failures = 0;

  for (const subscriber of subscribers) {
    const subscribedAt = Date.parse(subscriber.subscribed_at || subscriber.created_at || 0);
    const eligiblePosts = posts.filter(
      (post) => post.publishedTime >= subscribedAt && !alreadySent.has(`${subscriber.id}:${post.slug}`),
    );

    if (!eligiblePosts.length) continue;

    try {
      await ensureUnsubscribeToken(subscriber);
      const providerMessageId = await sendEmail(subscriber, eligiblePosts);
      await markDeliveries(subscriber, eligiblePosts, "sent", providerMessageId, null);
      emailsSent += 1;
      postsSent += eligiblePosts.length;
    } catch (error) {
      failures += 1;
      await markDeliveries(subscriber, eligiblePosts, "failed", null, error.message).catch(() => {});
    }
  }

  return sendJson(response, 200, {
    ok: true,
    subscribers: subscribers.length,
    emailsSent,
    postsSent,
    failures,
  });
};

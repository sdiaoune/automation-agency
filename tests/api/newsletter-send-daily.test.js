const assert = require("node:assert/strict");
const test = require("node:test");

const handlerPath = require.resolve("../../api/newsletter-send-daily.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/newsletter-send-daily.js");
}

function makeResponse() {
  return {
    body: "",
    headers: {},
    statusCode: 200,
    end(chunk = "") {
      this.body += chunk;
    },
    json() {
      return JSON.parse(this.body || "{}");
    },
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
  };
}

async function invoke(handler, request) {
  const response = makeResponse();
  await handler(request, response);
  return response;
}

test.afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
  delete require.cache[handlerPath];
});

test("rejects requests without the cron secret", async () => {
  const handler = loadHandler({
    NEWSLETTER_CRON_SECRET: "secret",
    RESEND_API_KEY: "resend-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, {
    headers: {},
    method: "GET",
    url: "/api/newsletter-send-daily",
  });

  assert.equal(response.statusCode, 401);
});

test("sends recent unsent posts with unsubscribe headers", async () => {
  const fetchCalls = [];
  const today = new Date().toISOString().slice(0, 10);
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url: String(url), options });

    if (String(url).endsWith("/blog/posts.json")) {
      return {
        ok: true,
        json: async () => [
          {
            meta: "A practical guide to missed-call recovery.",
            publishedAt: today,
            slug: "missed-call-text-back-property-management",
            title: "Missed-call text-back for property managers",
            url: "/blog/missed-call-text-back-property-management/",
          },
        ],
      };
    }

    if (String(url).includes("newsletter_subscribers?status=eq.active")) {
      return {
        ok: true,
        json: async () => [
          {
            email: "avery@example.com",
            id: "subscriber-id",
            subscribed_at: "2026-06-01T00:00:00.000Z",
            unsubscribe_token: "unsubscribe-token",
          },
        ],
      };
    }

    if (String(url).includes("newsletter_email_deliveries?status=eq.sent")) {
      return { ok: true, json: async () => [] };
    }

    if (String(url) === "https://api.resend.com/emails") {
      return { ok: true, json: async () => ({ id: "email-id" }) };
    }

    if (String(url).includes("newsletter_email_deliveries?on_conflict=")) {
      return { ok: true, json: async () => [] };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const handler = loadHandler({
    NEWSLETTER_CRON_SECRET: "secret",
    NEWSLETTER_LOOKBACK_DAYS: "30",
    RESEND_API_KEY: "resend-key",
    SITE_URL: "https://www.emc2ops.com",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, {
    headers: { authorization: "Bearer secret" },
    method: "POST",
    url: "/api/newsletter-send-daily",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    emailsSent: 1,
    failures: 0,
    ok: true,
    postsSent: 1,
    subscribers: 1,
  });

  const resendCall = fetchCalls.find((call) => call.url === "https://api.resend.com/emails");
  const resendBody = JSON.parse(resendCall.options.body);
  assert.deepEqual(resendBody.to, ["avery@example.com"]);
  assert.match(resendBody.headers["List-Unsubscribe"], /newsletter-unsubscribe\?token=unsubscribe-token/);
  assert.match(resendBody.html, /Missed-call text-back for property managers/);

  const deliveryCall = fetchCalls.find((call) => call.url.includes("newsletter_email_deliveries?on_conflict="));
  assert.match(deliveryCall.options.body, /"status":"sent"/);
  assert.match(deliveryCall.options.body, /"provider_message_id":"email-id"/);
});

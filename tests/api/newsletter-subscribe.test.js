const assert = require("node:assert/strict");
const test = require("node:test");

const handlerPath = require.resolve("../../api/newsletter-subscribe.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/newsletter-subscribe.js");
}

function jsonRequest(method, body) {
  return {
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "user-agent": "node-test" },
    method,
  };
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

test("rejects non-POST methods", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, jsonRequest("GET", {}));

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "POST");
  assert.deepEqual(response.json(), { error: "Method not allowed." });
});

test("returns a configuration error when Supabase env vars are missing", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "",
    SUPABASE_URL: "",
  });

  const response = await invoke(handler, jsonRequest("POST", {}));

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.json(), { error: "Newsletter storage is not configured." });
});

test("quietly accepts honeypot submissions without storing", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error("fetch should not be called");
  };

  const response = await invoke(
    handler,
    jsonRequest("POST", { email: "avery@example.com", websiteConfirm: "filled" }),
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });
  assert.equal(fetchCalls, 0);
});

test("validates email format", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, jsonRequest("POST", { email: "not-an-email" }));

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { error: "A valid email is required." });
});

test("stores a subscriber and sends a Telegram notification", async () => {
  const fetchCalls = [];
  global.fetch = async (url, options) => {
    fetchCalls.push({ url: String(url), options });
    if (String(url).includes("/rest/v1/newsletter_subscribers") && options.method === "POST") {
      return {
        ok: true,
        json: async () => [
          {
            email: "avery@example.com",
            id: "subscriber-id",
            page_url: "https://www.emc2ops.com/",
            source: "website",
          },
        ],
      };
    }
    if (String(url).includes("api.telegram.org")) {
      return {
        ok: true,
        json: async () => ({ ok: true, result: { message_id: 123 } }),
      };
    }
    return { ok: true, json: async () => ({}) };
  };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
    TELEGRAM_BOT_TOKEN: "telegram-token",
    TELEGRAM_CHAT_ID: "telegram-chat",
  });

  const response = await invoke(
    handler,
    jsonRequest("POST", {
      email: "AVERY@example.com",
      pageUrl: "https://www.emc2ops.com/",
      source: "website",
    }),
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    id: "subscriber-id",
    notification: "sent",
    ok: true,
  });
  assert.equal(fetchCalls.length, 3);
  assert.match(fetchCalls[0].url, /on_conflict=email/);
  assert.match(fetchCalls[0].options.headers.Prefer, /resolution=merge-duplicates/);
  assert.match(fetchCalls[0].options.body, /avery@example.com/);
  assert.match(fetchCalls[1].url, /api.telegram.org/);
  assert.match(fetchCalls[1].options.body, /New EMC2Ops newsletter subscriber/);
  assert.match(fetchCalls[2].options.body, /"notification_status":"sent"/);
});

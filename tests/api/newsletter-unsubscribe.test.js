const assert = require("node:assert/strict");
const test = require("node:test");

const handlerPath = require.resolve("../../api/newsletter-unsubscribe.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/newsletter-unsubscribe.js");
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

test("marks a subscriber unsubscribed from a token", async () => {
  const fetchCalls = [];
  global.fetch = async (url, options) => {
    fetchCalls.push({ url: String(url), options });
    return {
      ok: true,
      json: async () => [{ email: "avery@example.com", id: "subscriber-id" }],
    };
  };

  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, {
    headers: {},
    method: "POST",
    url: "/api/newsletter-unsubscribe?token=unsubscribe-token",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });
  assert.match(fetchCalls[0].url, /unsubscribe_token=eq.unsubscribe-token/);
  assert.match(fetchCalls[0].options.body, /"status":"unsubscribed"/);
});

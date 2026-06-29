const assert = require("node:assert/strict");
const test = require("node:test");

const handlerPath = require.resolve("../../api/audit-slots.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/audit-slots.js");
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

test("rejects non-GET methods", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, { method: "POST" });

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "GET");
  assert.deepEqual(response.json(), { error: "Method not allowed." });
});

test("returns a configuration error when Supabase env vars are missing", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "",
    SUPABASE_URL: "",
  });

  const response = await invoke(handler, { method: "GET" });

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.json(), { error: "Booking storage is not configured." });
});

test("returns generated audit slots after loading existing bookings", async () => {
  const fetchCalls = [];
  global.fetch = async (url, options) => {
    fetchCalls.push({ url: String(url), options });
    return { ok: true, json: async () => [] };
  };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, { method: "GET" });
  const body = response.json();

  assert.equal(response.statusCode, 200);
  assert.ok(body.slots.length > 0);
  assert.equal(body.slots[0].timeZone, "America/New_York");
  assert.match(fetchCalls[0].url, /\/rest\/v1\/audit_bookings/);
  assert.match(fetchCalls[0].url, /scheduled_start=not\.is\.null/);
});

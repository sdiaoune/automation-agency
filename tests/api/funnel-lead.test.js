const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const test = require("node:test");

const handlerPath = require.resolve("../../api/funnel-lead.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/funnel-lead.js");
}

function request(body, method = "POST") {
  return { body: JSON.stringify(body), headers: { "user-agent": "node-test" }, method };
}

function response() {
  return {
    body: "",
    headers: {},
    statusCode: 200,
    end(chunk = "") { this.body += chunk; },
    json() { return JSON.parse(this.body || "{}"); },
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
  };
}

async function invoke(handler, body, method) {
  const result = response();
  await handler(request(body, method), result);
  return result;
}

test.afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
  delete require.cache[handlerPath];
});

test("stores funnel intake in the shared audit_bookings table", async () => {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return { ok: true, json: async () => [{ id: "booking-id" }] };
  };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const result = await invoke(handler, {
    biggest_bottleneck: "Missed calls and after-hours response",
    company: "North Lake PM",
    current_system: "Yardi",
    email: "avery@example.com",
    page_slug: "property-management-systems",
    portfolio_size: "101–500 units",
    referrer: "https://ads.example/campaign",
    source_url: "https://www.emc2ops.com/lp/property-management-systems/?utm_source=google",
    utm_campaign: "buyer-intent",
    utm_source: "google",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.supabase.co/rest/v1/audit_bookings");
  const saved = JSON.parse(calls[0].options.body);
  assert.equal(saved.status, "new");
  assert.equal(saved.source, "funnel:property-management-systems");
  assert.equal(saved.email, "avery@example.com");
  assert.equal(saved.company, "North Lake PM");
  assert.equal(saved.portfolio_size, "101–500 units");
  assert.equal(saved.workflow_problem, "Missed calls and after-hours response");
  assert.match(saved.message, /Current system: Yardi/);
  assert.match(saved.message, /Campaign keyword: property management systems/);
  assert.match(saved.message, /UTM campaign: buyer-intent/);
  assert.deepEqual(result.json(), {
    bookingToken: createHmac("sha256", "service-key").update("funnel-booking:booking-id").digest("base64url"),
    id: "booking-id",
    ok: true,
  });
});

test("validates funnel fields before storage", async () => {
  global.fetch = async () => { throw new Error("fetch should not run"); };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });
  const result = await invoke(handler, {
    company: "N",
    email: "not-an-email",
    page_slug: "property-management-systems",
  });
  assert.equal(result.statusCode, 400);
  assert.deepEqual(result.json(), { ok: false, error: "Check each field and try again." });
});

test("quietly accepts the honeypot without storage", async () => {
  let fetchCount = 0;
  global.fetch = async () => { fetchCount += 1; };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });
  const result = await invoke(handler, { website: "bot" });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.json(), { ok: true });
  assert.equal(fetchCount, 0);
});

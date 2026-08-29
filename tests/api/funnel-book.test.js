const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const test = require("node:test");
const { generateSlots } = require("../../server/booking-schedule");

const handlerPath = require.resolve("../../api/funnel-book.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = {
    ...originalEnv,
    AUDIT_NOTIFICATION_WEBHOOK_URL: "",
    RESEND_API_KEY: "",
    TELEGRAM_BOT_TOKEN: "",
    TELEGRAM_CHAT_ID: "",
    ...env,
  };
  return require("../../api/funnel-book.js");
}

function token(id = "booking-id") {
  return createHmac("sha256", "service-key").update(`funnel-booking:${id}`).digest("base64url");
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

test("updates the saved funnel lead with an available slot", async () => {
  const slot = generateSlots()[0];
  const lead = {
    company: "North Lake PM",
    email: "avery@example.com",
    id: "booking-id",
    message: "Current system: Yardi",
    page_url: "https://www.emc2ops.com/lp/property-management-systems/",
    portfolio_size: "101–500 units",
    source: "funnel:property-management-systems",
    status: "new",
    workflow_problem: "Missed calls",
  };
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (!options.method && String(url).includes("id=eq.booking-id")) return { ok: true, json: async () => [lead] };
    if (!options.method) return { ok: true, json: async () => [] };
    if (options.method === "PATCH" && options.headers.Prefer) {
      const values = JSON.parse(options.body);
      return { ok: true, json: async () => [{ ...lead, ...values }] };
    }
    return { ok: true, json: async () => ({}) };
  };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const result = await invoke(handler, { id: "booking-id", bookingToken: token(), scheduledStart: slot.start });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.json(), {
    id: "booking-id",
    notification: "not_configured",
    ok: true,
    scheduledLabel: slot.label,
  });
  assert.equal(calls.length, 4);
  const scheduleUpdate = JSON.parse(calls[2].options.body);
  assert.equal(scheduleUpdate.status, "scheduled");
  assert.equal(scheduleUpdate.scheduled_start, slot.start);
  assert.equal(scheduleUpdate.scheduled_end, slot.end);
  assert.match(calls[3].options.body, /not_configured/);
});

test("rejects invalid scheduling tokens without reading Supabase", async () => {
  let fetchCount = 0;
  global.fetch = async () => { fetchCount += 1; };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });
  const result = await invoke(handler, { id: "booking-id", bookingToken: "wrong", scheduledStart: generateSlots()[0].start });
  assert.equal(result.statusCode, 403);
  assert.equal(fetchCount, 0);
});

test("requires the saved row to be a funnel lead", async () => {
  global.fetch = async () => ({ ok: true, json: async () => [{ id: "booking-id", source: "website", status: "new" }] });
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });
  const result = await invoke(handler, { id: "booking-id", bookingToken: token(), scheduledStart: generateSlots()[0].start });
  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.json(), { ok: false, error: "The saved request could not be found." });
});

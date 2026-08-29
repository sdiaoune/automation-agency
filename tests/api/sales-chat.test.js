const assert = require("node:assert/strict");
const test = require("node:test");

const handlerPath = require.resolve("../../api/sales-chat.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/sales-chat.js");
}

function request(body, method = "POST", headers = {}) {
  return {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
    method,
    socket: { remoteAddress: "127.0.0.1" },
  };
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

async function invoke(handler, body, method, headers) {
  const result = response();
  await handler(request(body, method, headers), result);
  return result;
}

test.afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
  delete require.cache[handlerPath];
});

test("sends bounded conversation context to the Responses API", async () => {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return {
      ok: true,
      status: 200,
      json: async () => ({
        output: [{ content: [{ type: "output_text", text: "Start with missed-call recovery, then measure replies and booked tours." }] }],
      }),
    };
  };
  const handler = loadHandler({ OPENAI_API_KEY: "test-key", OPENAI_CHAT_MODEL: "gpt-test" });
  const result = await invoke(handler, {
    messages: [{ role: "user", text: "We miss leasing calls. What should we automate first?" }],
    page: { path: "/services/missed-call-recovery/", title: "Untrusted title" },
    visitorId: "visitor-1",
  }, "POST", { origin: "https://www.emc2ops.com" });

  assert.equal(result.statusCode, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.openai.com/v1/responses");
  assert.equal(calls[0].options.headers.Authorization, "Bearer test-key");
  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.model, "gpt-test");
  assert.equal(payload.store, false);
  assert.deepEqual(payload.reasoning, { effort: "none" });
  assert.equal(payload.input[0].role, "user");
  assert.match(payload.instructions, /done-for-you AI front desk/);
  assert.match(payload.instructions, /\/services\/missed-call-recovery\//);
  assert.doesNotMatch(payload.instructions, /Untrusted title/);
  assert.match(payload.safety_identifier, /^[a-f0-9]{64}$/);
  assert.deepEqual(result.json(), {
    ok: true,
    reply: "Start with missed-call recovery, then measure replies and booked tours.",
    showBooking: true,
  });
});

test("surfaces the booking action for high-intent questions", async () => {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ output_text: "Pricing depends on scope. A consultation is the best next step." }),
  });
  const handler = loadHandler({ OPENAI_API_KEY: "test-key" });
  const result = await invoke(handler, {
    messages: [{ role: "user", text: "How much does implementation cost?" }],
    visitorId: "visitor-2",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.json().showBooking, true);
});

test("validates method, origin, configuration, and message shape before provider calls", async () => {
  let fetchCount = 0;
  global.fetch = async () => { fetchCount += 1; };

  let handler = loadHandler({ OPENAI_API_KEY: "test-key" });
  let result = await invoke(handler, {}, "GET");
  assert.equal(result.statusCode, 405);

  handler = loadHandler({ OPENAI_API_KEY: "test-key" });
  result = await invoke(handler, { messages: [{ role: "user", text: "Hello" }] }, "POST", { origin: "https://malicious.example" });
  assert.equal(result.statusCode, 403);

  handler = loadHandler({ OPENAI_API_KEY: "" });
  result = await invoke(handler, { messages: [{ role: "user", text: "Hello" }] });
  assert.equal(result.statusCode, 503);

  handler = loadHandler({ OPENAI_API_KEY: "test-key" });
  result = await invoke(handler, { messages: [{ role: "assistant", text: "Hello" }] });
  assert.equal(result.statusCode, 400);
  assert.equal(fetchCount, 0);
});

test("returns a safe temporary error when the provider rejects the request", async () => {
  global.fetch = async () => ({ ok: false, status: 429 });
  const handler = loadHandler({ OPENAI_API_KEY: "test-key" });
  const result = await invoke(handler, {
    messages: [{ role: "user", text: "Can you help?" }],
    visitorId: "visitor-provider-error",
  });

  assert.equal(result.statusCode, 503);
  assert.deepEqual(result.json(), { ok: false, error: "Assistant is temporarily unavailable." });
});

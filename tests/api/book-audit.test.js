const assert = require("node:assert/strict");
const test = require("node:test");

const handlerPath = require.resolve("../../api/book-audit.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require("../../api/book-audit.js");
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
  assert.deepEqual(response.json(), { error: "Booking storage is not configured." });
});

test("rejects invalid JSON", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(handler, jsonRequest("POST", "{not valid"));

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { error: "Invalid JSON payload." });
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
    jsonRequest("POST", { companySiteConfirm: "filled by bot" }),
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });
  assert.equal(fetchCalls, 0);
});

test("validates required fields and work email format", async () => {
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const missing = await invoke(handler, jsonRequest("POST", { email: "a@example.com" }));
  assert.equal(missing.statusCode, 400);
  assert.deepEqual(missing.json(), {
    error: "Name, company, and workflow are required.",
  });

  const invalidEmail = await invoke(
    handler,
    jsonRequest("POST", {
      company: "North Lake PM",
      email: "not-an-email",
      fullName: "Avery Lee",
      workflowProblem: "Missed leasing calls",
    }),
  );
  assert.equal(invalidEmail.statusCode, 400);
  assert.deepEqual(invalidEmail.json(), { error: "A valid work email is required." });
});

test("stores a valid booking and marks notification as not configured", async () => {
  const fetchCalls = [];
  global.fetch = async (url, options) => {
    fetchCalls.push({ url: String(url), options });
    if (options.method === "POST") {
      return {
        ok: true,
        json: async () => [{ id: "booking-id", company: "North Lake PM" }],
      };
    }
    return { ok: true, json: async () => ({}) };
  };
  const handler = loadHandler({
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(
    handler,
    jsonRequest("POST", {
      company: "North Lake PM",
      email: "avery@example.com",
      fullName: "Avery Lee",
      workflowProblem: "Missed leasing calls",
    }),
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    id: "booking-id",
    notification: "not_configured",
    ok: true,
  });
  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[0].options.method, "POST");
  assert.equal(fetchCalls[1].options.method, "PATCH");
  assert.match(fetchCalls[1].options.body, /not_configured/);
});

test("keeps a saved booking successful when notification fails", async () => {
  const fetchCalls = [];
  global.fetch = async (url, options) => {
    fetchCalls.push({ url: String(url), options });
    if (String(url).includes("/rest/v1/audit_bookings") && options.method === "POST") {
      return {
        ok: true,
        json: async () => [
          {
            company: "North Lake PM",
            email: "avery@example.com",
            full_name: "Avery Lee",
            id: "booking-id",
          },
        ],
      };
    }
    if (String(url).includes("api.resend.com")) {
      return {
        ok: false,
        json: async () => ({ message: "Resend rejected the message." }),
      };
    }
    return { ok: true, json: async () => ({}) };
  };
  const handler = loadHandler({
    RESEND_API_KEY: "re_test",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_URL: "https://example.supabase.co",
  });

  const response = await invoke(
    handler,
    jsonRequest("POST", {
      company: "North Lake PM",
      email: "avery@example.com",
      fullName: "Avery Lee",
      workflowProblem: "Missed leasing calls",
    }),
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    id: "booking-id",
    notification: "failed",
    ok: true,
  });
  assert.equal(fetchCalls.length, 3);
  assert.match(fetchCalls[2].options.body, /Resend rejected the message/);
});

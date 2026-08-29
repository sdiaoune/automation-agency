const { createHmac, randomUUID } = require("node:crypto");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const pages = new Map([
  ["property-management-systems", "property management systems"],
  ["property-management-application", "property management application"],
  ["real-estate-management-application", "real estate management application"],
  ["property-management-crm", "property management CRM"],
  ["crm-property-management", "CRM property management"],
  ["property-management-platforms", "property management platforms"],
  ["property-management-tools", "property management tools"],
  ["real-estate-management-tools", "real estate management tools"],
  ["ai-property-management", "AI property management"],
  ["ai-for-property-management", "AI for property management"],
]);

function clean(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) return request.body;
  if (typeof request.body === "string") return request.body ? JSON.parse(request.body) : {};
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

function bookingToken(id) {
  return createHmac("sha256", SUPABASE_SERVICE_ROLE_KEY).update(`funnel-booking:${id}`).digest("base64url");
}

async function insertLead(booking) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_bookings`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(booking),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.message || data?.hint || "Supabase insert failed.";
    throw new Error(detail);
  }

  if (!data?.[0]?.id) throw new Error("Supabase did not return the saved lead.");
  return data[0];
}

function leadMessage(lead) {
  const lines = [
    `Campaign keyword: ${lead.keyword}`,
    `Current system: ${lead.currentSystem}`,
    `Biggest bottleneck: ${lead.bottleneck}`,
    `Campaign page: ${lead.pageSlug}`,
  ];

  const attribution = [
    ["Referrer", lead.referrer],
    ["UTM source", lead.utmSource],
    ["UTM medium", lead.utmMedium],
    ["UTM campaign", lead.utmCampaign],
    ["UTM content", lead.utmContent],
    ["UTM term", lead.utmTerm],
  ].filter(([, value]) => value);

  if (attribution.length) {
    lines.push("", "Attribution:", ...attribution.map(([label, value]) => `${label}: ${value}`));
  }

  return lines.join("\n");
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { ok: false, error: "Method not allowed." });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(response, 500, { ok: false, error: "Lead storage is not configured." });
  }

  const startedAt = Date.now();
  const requestId = randomUUID();
  let body;
  try {
    body = await readBody(request);
  } catch {
    return sendJson(response, 400, { ok: false, error: "Invalid request." });
  }
  if (clean(body.website)) return sendJson(response, 200, { ok: true });

  const pageSlug = clean(body.page_slug, 100);
  const keyword = pages.get(pageSlug);
  if (!keyword) return sendJson(response, 404, { ok: false, error: "Unknown campaign page." });

  const lead = {
    bottleneck: clean(body.biggest_bottleneck, 300),
    company: clean(body.company, 180),
    currentSystem: clean(body.current_system, 200),
    email: clean(body.email, 320).toLowerCase(),
    keyword,
    pageSlug,
    portfolioSize: clean(body.portfolio_size, 80),
    referrer: clean(body.referrer, 1000),
    sourceUrl: clean(body.source_url, 500),
    utmCampaign: clean(body.utm_campaign, 200),
    utmContent: clean(body.utm_content, 200),
    utmMedium: clean(body.utm_medium, 200),
    utmSource: clean(body.utm_source, 200),
    utmTerm: clean(body.utm_term, 200),
  };

  if (!isEmail(lead.email) || lead.company.length < 2 || !lead.portfolioSize || !lead.currentSystem || !lead.bottleneck) {
    console.warn(JSON.stringify({ level: "warn", type: "funnel_lead_validation_failed", request_id: requestId, page_slug: pageSlug, duration_ms: Date.now() - startedAt }));
    return sendJson(response, 400, { ok: false, error: "Check each field and try again." });
  }

  const booking = {
    full_name: "Name not requested (campaign lead)",
    email: lead.email,
    company: lead.company,
    portfolio_size: lead.portfolioSize,
    workflow_problem: lead.bottleneck,
    preferred_time: "",
    message: leadMessage(lead),
    page_url: lead.sourceUrl,
    user_agent: clean(request.headers["user-agent"], 500),
    source: `funnel:${pageSlug}`,
    status: "new",
    notification_status: "pending",
  };

  try {
    const saved = await insertLead(booking);
    console.info(JSON.stringify({ level: "info", type: "funnel_lead_captured", request_id: requestId, booking_id: saved.id, page_slug: pageSlug, keyword, storage: "audit_bookings", duration_ms: Date.now() - startedAt }));
    return sendJson(response, 200, { ok: true, id: saved.id, bookingToken: bookingToken(saved.id) });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", type: "funnel_lead_capture_error", request_id: requestId, page_slug: pageSlug, error: error instanceof Error ? error.message : "UnknownError", duration_ms: Date.now() - startedAt }));
    return sendJson(response, 503, { ok: false, error: "We couldn't save this yet. Please try again in a moment." });
  }
};

const allowedEvents = new Set([
  "Funnel CTA Click",
  "Funnel Form Start",
  "Funnel Form Submit",
  "Funnel Lead Captured",
  "Funnel Calendar Viewed",
  "Funnel Slot Selected",
  "Funnel Booking Confirmed",
  "Funnel Form Error",
  "Funnel Proof Opened",
]);

const allowedSlugs = new Set([
  "property-management-systems",
  "property-management-application",
  "real-estate-management-application",
  "property-management-crm",
  "crm-property-management",
  "property-management-platforms",
  "property-management-tools",
  "real-estate-management-tools",
  "ai-property-management",
  "ai-for-property-management",
]);

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

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { ok: false });
  }

  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  try {
    const body = await readBody(request);
    const eventName = typeof body.eventName === "string" ? body.eventName : "";
    const pageSlug = typeof body.pageSlug === "string" ? body.pageSlug : "";
    if (!allowedEvents.has(eventName) || !allowedSlugs.has(pageSlug)) return sendJson(response, 400, { ok: false });

    const properties = body.properties && typeof body.properties === "object"
      ? Object.fromEntries(Object.entries(body.properties).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value)).slice(0, 10))
      : {};

    console.info(JSON.stringify({ level: "info", type: "funnel_event", request_id: requestId, event_name: eventName, page_slug: pageSlug, properties, duration_ms: Date.now() - startedAt }));
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", type: "funnel_event_error", request_id: requestId, error: error instanceof Error ? error.name : "UnknownError", duration_ms: Date.now() - startedAt }));
    return sendJson(response, 400, { ok: false });
  }
};

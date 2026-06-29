const { generateSlots, LOOKAHEAD_DAYS } = require("../server/booking-schedule");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

async function fetchBookedSlots() {
  const now = new Date();
  const through = new Date(now.getTime() + (LOOKAHEAD_DAYS + 1) * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams();
  params.set("select", "scheduled_start,scheduled_end,status");
  params.append("scheduled_start", `gte.${now.toISOString()}`);
  params.append("scheduled_start", `lte.${through.toISOString()}`);
  params.append("scheduled_start", "not.is.null");
  params.set("status", "not.eq.closed");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_bookings?${params.toString()}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.message || data?.hint || "Could not load booked audit times.";
    throw new Error(detail);
  }

  return data;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(response, 500, { error: "Booking storage is not configured." });
  }

  try {
    const bookedSlots = await fetchBookedSlots();
    return sendJson(response, 200, { slots: generateSlots({ bookedSlots }) });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not load available audit times." });
  }
};

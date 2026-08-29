const { createHmac, timingSafeEqual } = require("node:crypto");
const { findAvailableSlot, LOOKAHEAD_DAYS } = require("../server/booking-schedule");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NOTIFICATION_EMAIL = process.env.AUDIT_NOTIFICATION_EMAIL || "hello@emc2ops.com";
const NOTIFICATION_FROM = process.env.AUDIT_NOTIFICATION_FROM || "EMC2Ops <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_WEBHOOK_URL = process.env.AUDIT_NOTIFICATION_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function clean(value, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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

function expectedToken(id) {
  return createHmac("sha256", SUPABASE_SERVICE_ROLE_KEY).update(`funnel-booking:${id}`).digest("base64url");
}

function validToken(id, token) {
  if (!id || !token) return false;
  const expected = Buffer.from(expectedToken(id));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function fetchLead(id) {
  const params = new URLSearchParams({ id: `eq.${id}`, limit: "1", select: "*" });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_bookings?${params.toString()}`, {
    headers: supabaseHeaders(),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.hint || "Could not load the saved request.");
  return data?.[0] || null;
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
    headers: supabaseHeaders(),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.hint || "Could not verify availability.");
  return data || [];
}

async function updateBooking(id, values, representation = false) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_bookings?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: supabaseHeaders(representation ? { Prefer: "return=representation" } : {}),
    body: JSON.stringify(values),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.hint || "Could not update the saved request.");
  return representation ? data?.[0] : null;
}

function notificationText(booking) {
  return [
    "New EMC2Ops funnel consultation",
    "",
    `Email: ${booking.email}`,
    `Company: ${booking.company}`,
    `Portfolio size: ${booking.portfolio_size || "Not provided"}`,
    `Workflow: ${booking.workflow_problem}`,
    `Scheduled time: ${booking.scheduled_label}`,
    `Scheduled start: ${booking.scheduled_start}`,
    "",
    booking.message || "No additional campaign details.",
    "",
    `Page: ${booking.page_url || "Not captured"}`,
  ].join("\n");
}

async function sendNotification(booking) {
  const subject = `Funnel consultation booked: ${booking.company}`;
  const text = notificationText(booking);

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.description || "Telegram notification failed.");
    return { provider: "telegram", providerMessageId: data.result?.message_id ? String(data.result.message_id) : null };
  }

  if (RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: NOTIFICATION_FROM, to: [NOTIFICATION_EMAIL], reply_to: booking.email, subject, text }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Resend notification failed.");
    return { provider: "resend", providerMessageId: data.id || null };
  }

  if (NOTIFICATION_WEBHOOK_URL) {
    const response = await fetch(NOTIFICATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, text, booking }),
    });
    if (!response.ok) throw new Error(`Webhook notification failed with ${response.status}.`);
    return { provider: "webhook", providerMessageId: null };
  }

  return { provider: null, providerMessageId: null };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { ok: false, error: "Method not allowed." });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(response, 500, { ok: false, error: "Booking storage is not configured." });
  }

  let body;
  try {
    body = await readBody(request);
  } catch {
    return sendJson(response, 400, { ok: false, error: "Invalid request." });
  }

  const id = clean(body.id, 80);
  const token = clean(body.bookingToken, 200);
  const requestedStart = clean(body.scheduledStart, 80);
  if (!validToken(id, token)) return sendJson(response, 403, { ok: false, error: "This scheduling link is no longer valid." });

  try {
    const lead = await fetchLead(id);
    if (!lead || !String(lead.source || "").startsWith("funnel:")) {
      return sendJson(response, 404, { ok: false, error: "The saved request could not be found." });
    }
    if (lead.status === "scheduled") {
      if (lead.scheduled_start === requestedStart) {
        return sendJson(response, 200, { ok: true, id: lead.id, scheduledLabel: lead.scheduled_label, notification: lead.notification_status });
      }
      return sendJson(response, 409, { ok: false, error: "This request already has a consultation time." });
    }

    const selectedSlot = findAvailableSlot(requestedStart, await fetchBookedSlots());
    if (!selectedSlot) return sendJson(response, 409, { ok: false, error: "That time is no longer available. Please choose another." });

    const saved = await updateBooking(id, {
      preferred_time: selectedSlot.label,
      scheduled_end: selectedSlot.end,
      scheduled_label: selectedSlot.label,
      scheduled_start: selectedSlot.start,
      scheduled_time_zone: selectedSlot.timeZone,
      status: "scheduled",
    }, true);
    if (!saved) throw new Error("Supabase did not return the scheduled request.");

    try {
      const notification = await sendNotification(saved);
      await updateBooking(id, {
        notification_status: notification.provider ? "sent" : "not_configured",
        notification_provider: notification.provider,
        notification_provider_message_id: notification.providerMessageId,
        notification_error: null,
        notified_at: notification.provider ? new Date().toISOString() : null,
      });
      return sendJson(response, 200, { ok: true, id, scheduledLabel: selectedSlot.label, notification: notification.provider ? "sent" : "not_configured" });
    } catch (error) {
      await updateBooking(id, { notification_status: "failed", notification_error: clean(error.message, 1000) }).catch(() => {});
      return sendJson(response, 200, { ok: true, id, scheduledLabel: selectedSlot.label, notification: "failed" });
    }
  } catch (error) {
    console.error(JSON.stringify({ level: "error", type: "funnel_booking_error", booking_id: id, error: error instanceof Error ? error.message : "UnknownError" }));
    return sendJson(response, 500, { ok: false, error: "We couldn't confirm that time. Please try again." });
  }
};

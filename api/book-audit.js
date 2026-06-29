const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NOTIFICATION_EMAIL = process.env.AUDIT_NOTIFICATION_EMAIL || "hello@emc2ops.com";
const NOTIFICATION_FROM = process.env.AUDIT_NOTIFICATION_FROM || "EMC2Ops <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_WEBHOOK_URL = process.env.AUDIT_NOTIFICATION_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const { findAvailableSlot, LOOKAHEAD_DAYS } = require("../server/booking-schedule");

const allowedMethods = ["POST"];

function clean(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    return request.body ? JSON.parse(request.body) : {};
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

async function insertBooking(booking) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_bookings`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(booking)
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("That audit time was just booked. Please pick another available slot.");
    }
    const detail = data?.message || data?.hint || "Supabase insert failed.";
    throw new Error(detail);
  }

  return data[0];
}

async function updateBookingNotification(id, values) {
  if (!id) return;

  await fetch(`${SUPABASE_URL}/rest/v1/audit_bookings?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  }).catch(() => {});
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
    const detail = data?.message || data?.hint || "Could not verify audit availability.";
    throw new Error(detail);
  }

  return data;
}

function notificationText(booking) {
  return [
    "New EMC2Ops audit request",
    "",
    `Name: ${booking.full_name}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || "Not provided"}`,
    `Company: ${booking.company}`,
    `Website: ${booking.company_website || "Not provided"}`,
    `Portfolio size: ${booking.portfolio_size || "Not provided"}`,
    `Workflow: ${booking.workflow_problem}`,
    `Scheduled time: ${booking.scheduled_label || booking.preferred_time || "Not provided"}`,
    `Scheduled start: ${booking.scheduled_start || "Not captured"}`,
    "",
    "Message:",
    booking.message || "Not provided",
    "",
    `Page: ${booking.page_url || "Not captured"}`
  ].join("\n");
}

async function sendNotification(booking) {
  const subject = `New audit request: ${booking.company}`;
  const text = notificationText(booking);

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      const detail = data.description || "Telegram notification failed.";
      throw new Error(detail);
    }

    return {
      provider: "telegram",
      providerMessageId: data.result?.message_id ? String(data.result.message_id) : null
    };
  }

  if (RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: NOTIFICATION_FROM,
        to: [NOTIFICATION_EMAIL],
        reply_to: booking.email,
        subject,
        text
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Resend notification failed.");
    }

    return { provider: "resend", providerMessageId: data.id || null };
  }

  if (NOTIFICATION_WEBHOOK_URL) {
    const response = await fetch(NOTIFICATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, text, booking })
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed with ${response.status}.`);
    }

    return { provider: "webhook", providerMessageId: null };
  }

  return { provider: null, providerMessageId: null };
}

module.exports = async function handler(request, response) {
  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods.join(", "));
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return sendJson(response, 500, { error: "Booking storage is not configured." });
  }

  let body;
  try {
    body = await readBody(request);
  } catch {
    return sendJson(response, 400, { error: "Invalid JSON payload." });
  }

  if (clean(body.companySiteConfirm)) {
    return sendJson(response, 200, { ok: true });
  }

  const booking = {
    full_name: clean(body.fullName, 160),
    email: clean(body.email, 320).toLowerCase(),
    phone: clean(body.phone, 80),
    company: clean(body.company, 180),
    company_website: clean(body.companyWebsite, 240),
    portfolio_size: clean(body.portfolioSize, 80),
    workflow_problem: clean(body.workflowProblem, 120),
    preferred_time: clean(body.scheduledLabel || body.preferredTime, 160),
    message: clean(body.message, 2000),
    page_url: clean(body.pageUrl, 500),
    scheduled_end: "",
    scheduled_label: clean(body.scheduledLabel, 160),
    scheduled_start: clean(body.scheduledStart, 80),
    scheduled_time_zone: clean(body.scheduledTimeZone, 80) || "America/New_York",
    user_agent: clean(request.headers["user-agent"], 500),
    source: "website",
    status: "scheduled",
    notification_status: "pending"
  };

  if (!booking.full_name || !booking.company || !booking.workflow_problem) {
    return sendJson(response, 400, { error: "Name, company, and workflow are required." });
  }

  if (!isEmail(booking.email)) {
    return sendJson(response, 400, { error: "A valid work email is required." });
  }

  let selectedSlot;
  try {
    const bookedSlots = await fetchBookedSlots();
    selectedSlot = findAvailableSlot(booking.scheduled_start, bookedSlots);
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not verify audit availability." });
  }

  if (!selectedSlot) {
    return sendJson(response, 409, { error: "Select an available audit time." });
  }

  booking.scheduled_start = selectedSlot.start;
  booking.scheduled_end = selectedSlot.end;
  booking.scheduled_label = selectedSlot.label;
  booking.preferred_time = selectedSlot.label;
  booking.scheduled_time_zone = selectedSlot.timeZone;

  let savedBooking;
  try {
    savedBooking = await insertBooking(booking);
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not save booking." });
  }

  try {
    const notification = await sendNotification(savedBooking);
    await updateBookingNotification(savedBooking.id, {
      notification_status: notification.provider ? "sent" : "not_configured",
      notification_provider: notification.provider,
      notification_provider_message_id: notification.providerMessageId,
      notification_error: null,
      notified_at: notification.provider ? new Date().toISOString() : null
    });

    return sendJson(response, 200, {
      ok: true,
      id: savedBooking.id,
      notification: notification.provider ? "sent" : "not_configured"
    });
  } catch (error) {
    await updateBookingNotification(savedBooking.id, {
      notification_status: "failed",
      notification_error: clean(error.message, 1000)
    });

    return sendJson(response, 200, {
      ok: true,
      id: savedBooking.id,
      notification: "failed"
    });
  }
};

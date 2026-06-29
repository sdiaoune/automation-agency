const crypto = require("node:crypto");

const MAX_POST_LENGTH = 280;
const EASTERN_TIME_ZONE = "America/New_York";
const DEFAULT_SLOTS = [
  { hour: 8, label: "8 AM" },
  { hour: 11, label: "11 AM" },
  { hour: 14, label: "2 PM" },
  { hour: 17, label: "5 PM" },
  { hour: 20, label: "8 PM" }
];

const DEFAULT_POSTS = [
  "Apartment lead tracking is not a spreadsheet problem. It is a workflow problem: capture the source, match the renter, assign the owner, trigger the next step, and update the CRM before the lead goes cold.",
  "A guest card is only useful if it becomes a next action. The workflow should capture the source, dedupe the renter, assign ownership, and trigger follow-up without making leasing staff retype the same details.",
  "Lead-to-lease automation only works when every stage has an owner: inquiry, qualification, tour, application, approval, lease signing, and move-in. The gap is usually the handoff, not the software.",
  "The best leasing follow-up sequence has stop rules. It should pause when the renter books, replies, applies, opts out, becomes unqualified, or a human takes over. Otherwise automation starts damaging trust.",
  "Buildium-adjacent automation should start with the handoff. What trigger starts the workflow? What field or task needs to move? What needs approval? What exception should stop the process before it creates noise?",
  "Property management automation works best when it removes one bottleneck at a time. Start with a measurable workflow: missed-call text-back, leasing follow-up, maintenance intake, CRM logging, or owner updates.",
  "If every lead source creates a different follow-up path, your team is forced to improvise. Standardize intake, source tracking, status, ownership, and CRM writeback before you scale paid leasing demand.",
  "A renter who calls at 7:40 PM does not care that the office closed at 5. They care whether someone responds. AI voice, SMS follow-up, and routing rules can protect the lead and preserve the handoff.",
  "If your CRM only gets updated after someone manually catches up, your reporting is already late. Automate the handoff from call, text, form, or tour request into clean notes, stages, tasks, and owner alerts.",
  "Before adding another tool, map the first five minutes after a leasing inquiry. Who responds? What gets asked? Where does the request go? What gets logged? That is the workflow to automate.",
  "Maintenance intake is a good automation target because the first step is usually structured: collect tenant, unit, issue, urgency, photos, access notes, and route the request to the right place.",
  "A property manager should not have to choose between answering a leasing call and handling an urgent maintenance issue. Automation can catch the call, qualify the lead, and keep both workflows moving.",
  "If every lead source creates a different follow-up process, your team is forced to improvise. Standardize intake, qualification, reminders, and CRM updates before you scale outreach.",
  "No-show recovery should not wait three days. Send a useful follow-up while the appointment is still fresh: reschedule, ask a question, or close the loop. Then update the CRM automatically.",
  "The best AI workflow for property managers is usually boring: answer fast, ask clear questions, route correctly, and document what happened. Boring workflows are often where the revenue leaks are.",
  "A missed call is not just a missed conversation. It is an unqualified lead, an empty CRM field, a delayed follow-up, and a team member trying to reconstruct context later.",
  "If your team says, 'We called them back,' ask when. In leasing, the difference between two minutes and two hours can be the difference between a showing and a dead lead.",
  "Property management operators should measure response time like a revenue metric. Calls answered, missed-call text-backs, booked showings, no-shows recovered, and CRM completion rate tell the story.",
  "AI front desk workflows are not about replacing the leasing team. They are about making sure the team starts with context instead of voicemail, scattered texts, and manual data entry.",
  "Owner updates, vendor dispatch, lead routing, and maintenance intake all have the same automation pattern: capture the event, classify it, route it, notify the right person, and log the system of record.",
  "If your leasing pipeline has duplicate prospects, slow follow-up, and unclear ownership, automation should start with routing rules and deduplication before more marketing spend.",
  "Every property management team has a few repeatable questions they ask renters. Put those into the workflow so every missed call gets a consistent first response and every CRM note has the basics.",
  "The fastest way to find automation ROI is to look for handoffs. Call to text. Text to CRM. Maintenance request to vendor. Showing request to calendar. Each handoff is a place work can stall.",
  "When a leasing lead goes cold, the root cause is often operational: delayed response, unclear owner, missing CRM note, or no follow-up trigger. Those are workflow problems, not motivation problems.",
  "If you manage 50+ doors and still rely on voicemail for leasing calls, the workflow is asking renters to wait. Missed-call text-back gives them a next step while your team keeps working."
];

function clean(value, maxLength = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

function parsePosts() {
  if (!process.env.X_GROWTH_POSTS_JSON) return DEFAULT_POSTS;

  const parsed = JSON.parse(process.env.X_GROWTH_POSTS_JSON);
  if (!Array.isArray(parsed)) throw new Error("X_GROWTH_POSTS_JSON must be a JSON array of post strings.");

  const posts = parsed.map((item) => clean(item, MAX_POST_LENGTH)).filter(Boolean);
  if (posts.length === 0) throw new Error("X_GROWTH_POSTS_JSON must include at least one post.");
  return posts;
}

function easternParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    month: "2-digit",
    timeZone: EASTERN_TIME_ZONE,
    year: "numeric"
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function dayNumber(parts) {
  return Math.floor(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86_400_000);
}

function currentSlot(date = new Date()) {
  const parts = easternParts(date);
  const hour = Number(parts.hour);
  const slotIndex = DEFAULT_SLOTS.findIndex((slot) => slot.hour === hour);

  if (slotIndex === -1) return null;

  return {
    ...DEFAULT_SLOTS[slotIndex],
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    dayNumber: dayNumber(parts),
    index: slotIndex
  };
}

function postForSlot(posts, slot) {
  const index = (slot.dayNumber * DEFAULT_SLOTS.length + slot.index) % posts.length;
  return posts[index];
}

function encodeOAuthValue(value) {
  return encodeURIComponent(value)
    .replaceAll("!", "%21")
    .replaceAll("'", "%27")
    .replaceAll("(", "%28")
    .replaceAll(")", "%29")
    .replaceAll("*", "%2A");
}

function oauth1Header({ accessToken, accessTokenSecret, consumerKey, consumerSecret, method, url }) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0"
  };
  const parameterString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeOAuthValue(key)}=${encodeOAuthValue(value)}`)
    .join("&");
  const signatureBase = [
    method.toUpperCase(),
    encodeOAuthValue(url),
    encodeOAuthValue(parameterString)
  ].join("&");
  const signingKey = `${encodeOAuthValue(consumerSecret)}&${encodeOAuthValue(accessTokenSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(signatureBase).digest("base64");

  return `OAuth ${Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeOAuthValue(key)}="${encodeOAuthValue(value)}"`)
    .join(", ")}`;
}

function xAuthHeaders() {
  const url = "https://api.x.com/2/tweets";
  const oauth2Token = process.env.X_OAUTH2_ACCESS_TOKEN || process.env.X_BEARER_USER_TOKEN;

  if (oauth2Token) {
    return {
      Authorization: `Bearer ${oauth2Token}`,
      "Content-Type": "application/json"
    };
  }

  if (
    process.env.X_CONSUMER_KEY &&
    process.env.X_CONSUMER_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_TOKEN_SECRET
  ) {
    return {
      Authorization: oauth1Header({
        accessToken: process.env.X_ACCESS_TOKEN,
        accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
        consumerKey: process.env.X_CONSUMER_KEY,
        consumerSecret: process.env.X_CONSUMER_SECRET,
        method: "POST",
        url
      }),
      "Content-Type": "application/json"
    };
  }

  throw new Error("X publishing is not configured. Add OAuth 1.0a user tokens or X_OAUTH2_ACCESS_TOKEN.");
}

async function postToX(text) {
  const response = await fetch("https://api.x.com/2/tweets", {
    body: JSON.stringify({ text }),
    headers: xAuthHeaders(),
    method: "POST"
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.errors?.[0]?.message || `X returned ${response.status}.`);
  }

  return data.data;
}

module.exports = async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!process.env.CRON_SECRET) {
    return sendJson(response, 500, { error: "CRON_SECRET is not configured." });
  }

  const authorization = request.headers.authorization || request.headers.Authorization || "";
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return sendJson(response, 401, { error: "Unauthorized." });
  }

  let posts;
  try {
    posts = parsePosts();
  } catch (error) {
    return sendJson(response, 500, { error: error.message });
  }

  const url = new URL(request.url || "/api/x-growth-post", "http://localhost");
  const dryRun = url.searchParams.has("dryRun");
  const forcedSlot = Number(url.searchParams.get("slot"));
  const parts = easternParts();
  const slot = Number.isInteger(forcedSlot) && forcedSlot >= 0 && forcedSlot < DEFAULT_SLOTS.length
    ? {
        ...DEFAULT_SLOTS[forcedSlot],
        dateKey: `${parts.year}-${parts.month}-${parts.day}`,
        dayNumber: dayNumber(parts),
        index: forcedSlot
      }
    : currentSlot();

  if (!slot) {
    return sendJson(response, 200, {
      ok: true,
      skipped: true,
      reason: "Current Eastern hour is not a configured X growth slot."
    });
  }

  const text = postForSlot(posts, slot);
  if (text.length > MAX_POST_LENGTH) {
    return sendJson(response, 500, { error: `Selected X post is ${text.length} characters.` });
  }

  if (dryRun) {
    return sendJson(response, 200, {
      ok: true,
      dryRun: true,
      slot: slot.label,
      text,
      textLength: text.length
    });
  }

  try {
    const tweet = await postToX(text);
    return sendJson(response, 200, {
      ok: true,
      date: slot.dateKey,
      slot: slot.label,
      textLength: text.length,
      tweetId: tweet?.id || null
    });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Could not post to X." });
  }
};

import fs from "node:fs";

const oauth2ConnectionPaths = [
  process.env.X_CONNECTIONS_FILE,
  "acquisition-dashboard/.x-social-connections.json",
  ".x-social-connections.json",
].filter(Boolean);

const curatedAccountsPath = new URL("../docs/x-curated-accounts.json", import.meta.url);
const rotationStatePath = new URL("../.x-reply-targets-state.json", import.meta.url);

function loadCuratedConfig() {
  const raw = fs.readFileSync(curatedAccountsPath, "utf8");
  return JSON.parse(raw);
}

const curatedConfig = loadCuratedConfig();
const curatedAccounts = (curatedConfig.groups || []).flatMap((group) =>
  (group.accounts || []).map((account) => ({
    ...account,
    groupId: group.id,
    topic: group.topic,
  })),
);

const DEFAULT_HOURS = 4;
const DEFAULT_LIMIT = 3;
const TWEETS_PER_ACCOUNT = curatedConfig.tweets_per_account || 5;
const ACCOUNTS_PER_RUN = curatedConfig.accounts_per_run || 4;
const MIN_STRONG_CANDIDATES_TO_STOP = 2;

const lowSignalPatterns = [
  /\b(sign up|register|webinar|download|ebook|white paper|whitepaper)\b/i,
  /\b(we're hiring|job opening|apply now)\b/i,
  /\b(follow us|learn more|book now|schedule a demo)\b/i,
  /\b(cash app|venmo|zelle|chime|paypal|apple pay)\b/i,
  /\b(youtube|giveaway|birthday|vacation|donation)\b/i,
];

const painPatterns = [
  /\bmiss(ed|ing)\b/i,
  /\bafter[- ]hours\b/i,
  /\bfollow[- ]?up\b/i,
  /\bmaintenance\b/i,
  /\bcrm\b/i,
  /\bpms\b/i,
  /\boverflow\b/i,
  /\bleasing\b/i,
  /\bresponse\b/i,
  /\btenant\b/i,
  /\bowner\b/i,
  /\bvendor\b/i,
  /\boperations?\b/i,
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function argsFromCli() {
  const args = new Map();
  const flags = new Set();
  const values = process.argv.slice(2);
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      flags.add(key);
    } else {
      args.set(key, next);
      index += 1;
    }
  }
  return { args, flags };
}

function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function readRotationState() {
  return readJsonFile(rotationStatePath, { cursor: 0 });
}

function writeRotationState(value) {
  writeJsonFile(rotationStatePath, value);
}

function readOAuth2Connection() {
  for (const filePath of oauth2ConnectionPaths) {
    if (!fs.existsSync(filePath)) continue;
    const connections = readJsonFile(filePath, {});
    if (connections.accessToken || connections.refreshToken) return { connections, filePath };
  }
  return null;
}

function writeOAuth2Connection(filePath, connections) {
  writeJsonFile(filePath, { ...connections, updatedAt: new Date().toISOString() });
}

async function oauth2AccessToken() {
  const record = readOAuth2Connection();
  if (!record?.connections?.accessToken) throw new Error("No X OAuth 2 connection found.");

  const { connections, filePath } = record;
  const expiresAt = connections.expiresAt ? Date.parse(connections.expiresAt) : 0;
  if (!expiresAt || expiresAt > Date.now() + 60_000) return connections.accessToken;

  if (!connections.refreshToken || !process.env.X_CLIENT_ID) {
    throw new Error("X OAuth 2 connection is expired and cannot be refreshed.");
  }

  const body = new URLSearchParams({
    client_id: process.env.X_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: connections.refreshToken,
  });
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (process.env.X_CLIENT_SECRET) {
    headers.Authorization = `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`;
  }

  const response = await fetch("https://api.x.com/2/oauth2/token", {
    body,
    headers,
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || `X OAuth refresh returned ${response.status}.`);
  }

  const nextConnections = {
    ...connections,
    accessToken: data.access_token || "",
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
    refreshToken: data.refresh_token || connections.refreshToken || "",
    scope: data.scope || connections.scope || "",
    tokenType: data.token_type || connections.tokenType || "bearer",
  };
  writeOAuth2Connection(filePath, nextConnections);
  return nextConnections.accessToken;
}

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function tweetUrl(username, id) {
  return `https://x.com/${username}/status/${id}`;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function hoursOld(createdAt) {
  return (Date.now() - Date.parse(createdAt)) / 3_600_000;
}

function scoreCandidate(tweet, user, queryDef) {
  const text = cleanText(tweet.text);
  let score = 0;

  if (hoursOld(tweet.created_at) <= 1) score += 3;
  else if (hoursOld(tweet.created_at) <= 2) score += 2;
  else score += 1;

  if (user?.username) score += 3;
  if (painPatterns.some((pattern) => pattern.test(text))) score += 2;
  if (text.includes("?")) score += 1;
  if (queryDef.topic.includes("leasing") && /\bleasing\b/i.test(text)) score += 1;
  if (queryDef.topic.includes("maintenance") && /\bmaintenance\b/i.test(text)) score += 1;
  if (/\bproperty management|multifamily|apartment|resident|tenant\b/i.test(text)) score += 2;
  if (lowSignalPatterns.some((pattern) => pattern.test(text))) score -= 3;
  if (text.length < 40) score -= 1;

  return score;
}

function isRelevantCandidate(tweet, user) {
  const text = cleanText(tweet.text);
  const bio = cleanText(user?.description || "");
  const combined = `${text} ${bio}`;

  if (user?.username?.toLowerCase() === "emc2ops") return false;
  if (lowSignalPatterns.some((pattern) => pattern.test(text))) return false;
  if (!/\b(property management|property manager|multifamily|leasing|resident|tenant|crm|pms|maintenance|owner|vendor|tour)\b/i.test(combined)) {
    return false;
  }

  const hasOpsSignal = /\b(missed|after[- ]hours|follow[- ]?up|intake|handoff|routing|response|voicemail|overflow|lead|tour|maintenance|crm|pms|owner|vendor)\b/i.test(combined);
  return hasOpsSignal;
}

function draftReply(tweet, queryDef) {
  const text = cleanText(tweet.text);

  if (/\bafter[- ]hours|miss(ed|ing).{0,20}call|voicemail\b/i.test(text)) {
    return "This usually breaks at the handoff, not the phone line. If after-hours calls still hit voicemail, do those leads get an instant text-back and a clean CRM owner, or is someone rebuilding context the next morning?";
  }

  if (/\bmaintenance\b/i.test(text)) {
    return "This is usually an intake-shape problem before it is a staffing problem. If the first message does not capture unit, urgency, access, and next owner cleanly, the team ends up doing manual triage twice.";
  }

  if (/\bcrm|pms|handoff|follow[- ]?up\b/i.test(text)) {
    return "The workflow usually wins or loses at the write-back. If follow-up, owner assignment, and next step are not landing in the CRM/PMS automatically, the team is still carrying the process by memory.";
  }

  if (/\bleasing|tour|prospect\b/i.test(text)) {
    return "This is usually where leasing ops drift from intent. Fast response matters, but the bigger lever is whether the next step, owner, and property context get routed cleanly before the lead cools off.";
  }

  return `This feels like an operations issue more than a volume issue. The useful question is which handoff is breaking first: response, routing, or write-back into the system the team actually works from?`;
}

async function searchRecent(accessToken, queryDef, hours) {
  const query = `curated account timeline @${queryDef.username}`;
  const url = new URL(`https://api.x.com/2/users/${queryDef.id}/tweets`);
  url.searchParams.set("max_results", String(TWEETS_PER_ACCOUNT));
  url.searchParams.set("start_time", isoHoursAgo(hours));
  url.searchParams.set("tweet.fields", "author_id,created_at,public_metrics,conversation_id");
  url.searchParams.set("exclude", "replies,retweets");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.errors?.[0]?.message || `X search returned ${response.status}.`);
  }

  const user = {
    id: queryDef.id,
    username: queryDef.username,
    name: queryDef.name,
    description: "",
  };
  const candidates = (data.data || [])
    .filter((tweet) => tweet.created_at && hoursOld(tweet.created_at) <= hours)
    .map((tweet) => {
      const text = cleanText(tweet.text);
      return {
        author: user,
        query,
        queryId: queryDef.id,
        score: scoreCandidate(tweet, user, queryDef),
        text,
        tweet,
        url: user?.username ? tweetUrl(user.username, tweet.id) : `https://x.com/i/web/status/${tweet.id}`,
      };
    })
    .filter((candidate) => isRelevantCandidate(candidate.tweet, candidate.author));

  return {
    candidates,
    query,
    rawCount: Array.isArray(data.data) ? data.data.length : 0,
    meta: data.meta || {},
  };
}

function uniqueBestCandidates(allCandidates, limit) {
  const seen = new Set();
  return allCandidates
    .sort((a, b) => b.score - a.score || Date.parse(b.tweet.created_at) - Date.parse(a.tweet.created_at))
    .filter((candidate) => {
      if (seen.has(candidate.tweet.id)) return false;
      seen.add(candidate.tweet.id);
      return true;
    })
    .slice(0, limit);
}

async function sendTelegram(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return { ok: false, reason: "Missing Telegram credentials." };
  }
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    return { ok: false, reason: data?.description || `Telegram returned ${response.status}.` };
  }
  return { ok: true, messageId: data.result?.message_id || null };
}

function buildDigest(shortlist, queryStats, hours) {
  const lines = [`EMC2Ops X reply targets — API run (${hours}h window)`, ""];
  if (shortlist.length === 0) {
    lines.push(`Result: 0 strong reply targets in the last ${hours} hours.`);
    lines.push("");
    lines.push("Queries run:");
    for (const item of queryStats) {
      lines.push(`${item.id}. ${item.query} -> ${item.count} hits`);
    }
    lines.push("");
    lines.push("No reply recommended this cycle.");
    return lines.join("\n");
  }

  shortlist.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.author?.name || item.author?.username || "Unknown account"} (@${item.author?.username || "unknown"})`);
    lines.push(`URL: ${item.url}`);
    lines.push(`Query: ${item.query}`);
    lines.push(`Why it is worth replying to: Score ${item.score}; recent post from a curated account on ${(curatedAccounts.find((q) => q.id === item.queryId)?.topic) || "ops pain"}.`);
    lines.push(`Suggested reply: ${draftReply(item.tweet, curatedAccounts.find((q) => q.id === item.queryId) || { topic: "" })}`);
    lines.push("");
  });
  lines.push("Pick one reply and post it manually.");
  return lines.join("\n");
}

async function main() {
  readEnvFile("acquisition-dashboard/.env.local");
  readEnvFile(".env.local");
  const { args, flags } = argsFromCli();
  const hours = Number(args.get("hours") || String(DEFAULT_HOURS));
  const limit = Number(args.get("limit") || String(DEFAULT_LIMIT));

  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
    throw new Error("Pass --hours with a value between 1 and 24.");
  }

  const accessToken = await oauth2AccessToken();
  const allCandidates = [];
  const queryStats = [];
  const rotation = readRotationState();
  const selectedAccounts = [];
  for (let i = 0; i < Math.min(ACCOUNTS_PER_RUN, curatedAccounts.length); i += 1) {
    selectedAccounts.push(curatedAccounts[(rotation.cursor + i) % curatedAccounts.length]);
  }
  writeRotationState({ cursor: (rotation.cursor + selectedAccounts.length) % curatedAccounts.length });

  for (const queryDef of selectedAccounts) {
    const result = await searchRecent(accessToken, queryDef, hours);
    queryStats.push({
      id: queryDef.id,
      query: `@${queryDef.username} recent posts`,
      rawCount: result.rawCount,
      count: result.candidates.length,
    });
    allCandidates.push(...result.candidates);

    const provisionalShortlist = uniqueBestCandidates(
      allCandidates.filter((candidate) => candidate.score >= 4),
      MIN_STRONG_CANDIDATES_TO_STOP,
    );
    if (provisionalShortlist.length >= MIN_STRONG_CANDIDATES_TO_STOP) break;
  }

  const rawPostsRead = queryStats.reduce((sum, item) => sum + item.rawCount, 0);
  let shortlist = uniqueBestCandidates(
    allCandidates.filter((candidate) => candidate.score >= 4),
    limit,
  );
  shortlist = shortlist
    .filter((item) => isRelevantCandidate(item.tweet, item.author))
    .sort((a, b) => b.score - a.score || Date.parse(b.tweet.created_at) - Date.parse(a.tweet.created_at))
    .slice(0, limit);
  const digest = buildDigest(shortlist, queryStats, hours);
  const profileReads = [...new Set(allCandidates.map((item) => item.author?.id).filter(Boolean))].length;
  const output = {
    hours,
    estimatedCostUsd: {
      postsRead: Number((rawPostsRead * 0.005).toFixed(3)),
      profilesRead: Number((profileReads * 0.01).toFixed(3)),
      total: Number(((rawPostsRead * 0.005) + (profileReads * 0.01)).toFixed(3)),
    },
    queryStats,
    shortlist: shortlist.map((item) => ({
      account: item.author?.username || null,
      createdAt: item.tweet.created_at,
      query: item.query,
      score: item.score,
      text: item.text,
      url: item.url,
      reply: draftReply(item.tweet, curatedAccounts.find((q) => q.id === item.queryId) || { topic: "" }),
    })),
  };

  if (flags.has("send-telegram") && shortlist.length > 0) {
    output.telegram = await sendTelegram(digest);
  } else if (flags.has("send-telegram")) {
    output.telegram = { ok: false, reason: "No strong targets; Telegram skipped." };
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

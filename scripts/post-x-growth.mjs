import crypto from "node:crypto";
import fs from "node:fs";

const maxTweetLength = 280;
const historyPath = ".x-growth-post-history.json";
const oauth2ConnectionPaths = [
  process.env.X_CONNECTIONS_FILE,
  "acquisition-dashboard/.x-social-connections.json",
  ".x-social-connections.json",
].filter(Boolean);

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

function normalizeTweet(value) {
  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textHash(text) {
  return crypto.createHash("sha256").update(normalizeTweet(text)).digest("hex");
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
  if (!record?.connections?.accessToken) {
    throw new Error("No X OAuth 2 connection found.");
  }

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

async function postTweet(text) {
  const accessToken = await oauth2AccessToken();
  const response = await fetch("https://api.x.com/2/tweets", {
    body: JSON.stringify({ text }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.errors?.[0]?.detail || data?.errors?.[0]?.message || `X tweet returned ${response.status}.`);
  }

  return data.data;
}

async function main() {
  readEnvFile("acquisition-dashboard/.env.local");
  readEnvFile(".env.local");

  const { args, flags } = argsFromCli();
  const text = normalizeTweet(args.get("text") || "");
  const campaign = args.get("campaign") || "EMC2Ops X Growth";
  const slot = args.get("slot") || "unspecified";
  const dryRun = flags.has("dry-run");
  const force = flags.has("force");

  if (!text) throw new Error("Pass --text <post copy>.");
  if (text.length > maxTweetLength) {
    throw new Error(`X post is ${text.length} characters; keep it at ${maxTweetLength} or fewer.`);
  }

  const hash = textHash(text);
  const history = readJsonFile(historyPath, { posts: [] });
  const duplicate = (history.posts || []).find((post) => post.hash === hash);
  if (duplicate && !force) {
    throw new Error(`Duplicate X growth post blocked; already posted as ${duplicate.tweetId || "dry-run"} on ${duplicate.postedAt}.`);
  }

  if (dryRun) {
    console.log(JSON.stringify({ campaign, hash, slot, text, textLength: text.length }, null, 2));
    return;
  }

  const tweet = await postTweet(text);
  const record = {
    campaign,
    hash,
    postedAt: new Date().toISOString(),
    slot,
    text,
    tweetId: tweet.id,
  };
  writeJsonFile(historyPath, { posts: [record, ...(history.posts || [])].slice(0, 500) });
  console.log(`Posted X growth post ${tweet.id} (${slot}, ${text.length} chars).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

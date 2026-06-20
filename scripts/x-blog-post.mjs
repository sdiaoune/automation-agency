import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  createBufferPost,
  getBufferConfig,
  getBufferLinkedInChannelId,
} from "../acquisition-dashboard/api/buffer-store.js";
import { contentPostsPath, readBlogPosts, validateBlogPosts } from "./blog-content.mjs";

const siteUrl = "https://www.emc2ops.com";
const historyPath = ".x-blog-post-history.json";
const xCapabilityPath = ".x-publisher-capabilities.json";
const maxTweetLength = 280;
const localhostPostUrl = process.env.LOCAL_X_POST_URL || "http://localhost:9876/api/social-post";
const oauth2ConnectionPaths = [
  process.env.X_CONNECTIONS_FILE,
  "acquisition-dashboard/.x-social-connections.json",
  ".x-social-connections.json",
].filter(Boolean);
const requiredTwitterCardTags = [
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = unquoteEnvValue(trimmed.slice(index + 1).trim());
    if (!process.env[key]) process.env[key] = value;
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
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

function socialChannelsFromCli(args, flags) {
  let channels = ["x", "linkedin"];
  const requested = args.get("channels");

  if (requested) {
    channels = requested
      .split(",")
      .map((channel) => channel.trim().toLowerCase())
      .filter(Boolean);
  }

  if (flags.has("x-only")) channels = ["x"];
  if (flags.has("linkedin-only")) channels = ["linkedin"];
  if (flags.has("no-x")) channels = channels.filter((channel) => channel !== "x");
  if (flags.has("no-linkedin")) channels = channels.filter((channel) => channel !== "linkedin");

  const unsupported = channels.filter((channel) => !["x", "linkedin"].includes(channel));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported social channel: ${unsupported.join(", ")}.`);
  }

  return [...new Set(channels)];
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
    oauth_version: "1.0",
  };
  const parameterString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeOAuthValue(key)}=${encodeOAuthValue(value)}`)
    .join("&");
  const signatureBase = [
    method.toUpperCase(),
    encodeOAuthValue(url),
    encodeOAuthValue(parameterString),
  ].join("&");
  const signingKey = `${encodeOAuthValue(consumerSecret)}&${encodeOAuthValue(accessTokenSecret)}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  return `OAuth ${Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeOAuthValue(key)}="${encodeOAuthValue(value)}"`)
    .join(", ")}`;
}

function xConfig() {
  const config = {
    accessToken: process.env.X_ACCESS_TOKEN || "",
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET || "",
    consumerKey: process.env.X_CONSUMER_KEY || "",
    consumerSecret: process.env.X_CONSUMER_SECRET || "",
  };

  for (const [key, value] of Object.entries(config)) {
    if (!value) throw new Error(`Missing ${key} for direct X publishing.`);
  }

  return config;
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
    throw new Error("No X OAuth 2 connection found for media upload.");
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
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

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

function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function xCapabilities() {
  return readJsonFile(xCapabilityPath, {});
}

function writeXCapabilities(value) {
  writeJsonFile(xCapabilityPath, value);
}

function markXMediaUnsupported(reason) {
  const current = xCapabilities();
  writeXCapabilities({
    ...current,
    mediaUpload: {
      lastCheckedAt: new Date().toISOString(),
      status: "unsupported",
      reason,
    },
  });
}

function markXMediaSupported() {
  const current = xCapabilities();
  writeXCapabilities({
    ...current,
    mediaUpload: {
      lastCheckedAt: new Date().toISOString(),
      status: "supported",
      reason: "",
    },
  });
}

function shouldSkipMediaThread({ forceMediaThread = false }) {
  if (forceMediaThread) return false;
  return xCapabilities()?.mediaUpload?.status === "unsupported";
}

function isPermissionError(error) {
  const message = String(error instanceof Error ? error.message : error).toLowerCase();
  return message.includes("forbidden") || message.includes("403");
}

function normalizeWhitespace(value) {
  return String(value).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function truncateForTweet(value, maxLength) {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function mainTweetForPost(post) {
  if (post.slug === "ai-front-desk-loop-not-chatbot") {
    return truncateForTweet(
      `Loop engineering for property managers:\n\nThe AI front desk is a loop, not a chatbot.\n\nIt should respond, collect context, route the next step, escalate exceptions, and update the CRM.\n\n#PropertyManagement #AIAutomation`,
      maxTweetLength,
    );
  }

  const hashtags = "#PropertyManagement #AIAutomation";
  const lead = `New EMC2Ops guide: ${post.keyword}`;
  const cta = "For owners/operators managing 50+ units who want faster leasing response, cleaner maintenance intake, and fewer manual CRM handoffs.";
  const reserve = lead.length + cta.length + hashtags.length + 8;
  const insight = truncateForTweet(post.meta.replace(/\.$/, ""), maxTweetLength - reserve);
  const tweet = `${lead}\n\n${insight}\n\n${cta}\n\n${hashtags}`;

  return truncateForTweet(tweet, maxTweetLength);
}

function replyTweetForPost(post, url) {
  if (post.slug === "ai-front-desk-loop-not-chatbot") {
    return truncateForTweet(
      `New EMC2Ops guide on loop engineering and AI front desk workflows for property managers:\n${url}\n\nThe practical test: can AI move the request to the next correct outcome?`,
      maxTweetLength,
    );
  }

  const tweet = `Read the full EMC2Ops guide on ${post.keyword}:\n${url}\n\nBook a 15-minute workflow audit if this is costing your team time or leads.`;
  return truncateForTweet(tweet, maxTweetLength);
}

function localhostTweetForPost(post, url) {
  const tweet = `New EMC2Ops guide: ${post.title}`;
  return truncateForTweet(tweet, maxTweetLength - url.length - 2);
}

function linkTweetForPost(post, url) {
  return `${localhostTweetForPost(post, url)}\n\n${url}`;
}

function linkedInPostForPost(post, url) {
  if (post.slug === "ai-front-desk-loop-not-chatbot") {
    return normalizeWhitespace(`
Loop engineering is the useful way to think about the AI front desk.

A chatbot can answer a question. An AI front desk should complete the loop:

- respond when the trigger happens
- collect only the context needed for the next step
- route normal work automatically
- escalate exceptions to the right human
- update the CRM or operating record
- review completion, response speed, and handoff quality

For property managers, this matters across missed leasing calls, maintenance intake, tour reminders, stale lead follow-up, and CRM logging.

The practical question is not "Can it chat?"

It is: "Can it move the request to the next correct outcome?"

I wrote the full EMC2Ops guide here:
${url}

#PropertyManagement #LeasingAutomation #AIAutomation
`);
  }

  const systemBullets = (post.system || [])
    .slice(0, 5)
    .map((item) => `- ${item.replace(/\.$/, "")}`)
    .join("\n");
  const metricLine = (post.metrics || [])
    .slice(0, 4)
    .join(", ");

  return normalizeWhitespace(`
${post.h1}

${post.problem}

For property managers and operators managing 50+ doors, this is the part worth systemizing:

${systemBullets}

Useful metrics to watch: ${metricLine}.

I wrote the practical EMC2Ops guide here:
${url}

${post.cta}

#PropertyManagement #LeasingAutomation #AIAutomation
`);
}

function assertLinkedInPostLength(text) {
  if (text.length > 3000) {
    throw new Error(`LinkedIn post is ${text.length} characters; keep it at 3,000 or fewer.`);
  }
}

function metaContent(html, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+[^>]*(?:name|property)=["']${escapedName}["'][^>]*content=["']([^"']+)["'][^>]*>|<meta\\s+[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${escapedName}["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] || match?.[2] || "";
}

async function fetchPublicHtml(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Public blog URL returned ${response.status}: ${url}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Public blog URL did not return HTML: ${url}`);
  }

  return response.text();
}

async function verifyImageUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return response.ok;
  } catch {
    return false;
  }
}

async function verifyTwitterCard(url) {
  const html = await fetchPublicHtml(url);
  const tags = Object.fromEntries(
    requiredTwitterCardTags.map((tag) => [tag, metaContent(html, tag)]),
  );
  const missing = Object.entries(tags)
    .filter(([, value]) => !value)
    .map(([tag]) => tag);

  if (missing.length > 0) {
    throw new Error(`Public blog URL is missing Twitter card tags: ${missing.join(", ")}.`);
  }

  if (tags["twitter:card"] !== "summary_large_image") {
    throw new Error(`Expected twitter:card to be summary_large_image, got ${tags["twitter:card"]}.`);
  }

  if (!tags["twitter:image"].startsWith("https://")) {
    throw new Error(`twitter:image must be an absolute HTTPS URL, got ${tags["twitter:image"]}.`);
  }

  const imageOk = await verifyImageUrl(tags["twitter:image"]);
  if (!imageOk) {
    throw new Error(`twitter:image is not reachable: ${tags["twitter:image"]}.`);
  }

  return tags;
}

function mimeTypeForImage(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".gif") return "image/gif";
  if (extension === ".webp") return "image/webp";
  throw new Error("X image must be PNG, JPEG, GIF, or WebP.");
}

async function publicUrlStatus(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return response.status;
  } catch {
    return 0;
  }
}

function deployProduction() {
  console.log("Public article is not live yet. Running Vercel production deploy...");
  const result = spawnSync("npx", ["vercel", "--prod", "--yes"], {
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Vercel production deploy failed with exit code ${result.status}.`);
  }
}

function verifyLocalBlogBuild({ skipBuild }) {
  const posts = readBlogPosts();
  const errors = validateBlogPosts(posts);
  if (errors.length > 0) {
    throw new Error(`Blog content validation failed:\n${errors.join("\n")}`);
  }

  if (skipBuild) return posts;

  console.log("Validating Astro blog build...");
  const result = spawnSync("npm", ["run", "build"], {
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Astro build failed with exit code ${result.status}.`);
  }

  return posts;
}

async function verifyPublicUrl(url, { skipDeploy }) {
  const firstStatus = await publicUrlStatus(url);
  if (firstStatus >= 200 && firstStatus < 300) return;

  if (skipDeploy) {
    throw new Error(`Public blog URL is not live yet: ${url} returned ${firstStatus || "no response"}.`);
  }

  deployProduction();

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const status = await publicUrlStatus(url);
    if (status >= 200 && status < 300) return;
    console.log(`Waiting for public article URL... attempt ${attempt}, status ${status || "no response"}`);
  }

  throw new Error(`Public blog URL is still not live after deployment: ${url}.`);
}

async function verifyPublicTwitterCard(url, { skipDeploy }) {
  try {
    return await verifyTwitterCard(url);
  } catch (error) {
    if (skipDeploy) throw error;

    console.log(
      `Public article Twitter card is not ready yet: ${
        error instanceof Error ? error.message : error
      }`,
    );
    deployProduction();

    for (let attempt = 1; attempt <= 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        return await verifyTwitterCard(url);
      } catch (retryError) {
        console.log(
          `Waiting for Twitter card metadata... attempt ${attempt}: ${
            retryError instanceof Error ? retryError.message : retryError
          }`,
        );
      }
    }

    throw error;
  }
}

async function uploadMedia(imagePath, config) {
  const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
  const imageBuffer = fs.readFileSync(imagePath);
  const formData = new FormData();

  formData.set("media", new Blob([imageBuffer], { type: mimeTypeForImage(imagePath) }), path.basename(imagePath));

  const response = await fetch(uploadUrl, {
    body: formData,
    headers: {
      Authorization: oauth1Header({ ...config, method: "POST", url: uploadUrl }),
    },
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.message || data?.error || `X media upload returned ${response.status}.`);
  }

  return data.media_id_string;
}

async function uploadMediaOAuth2(imagePath) {
  const accessToken = await oauth2AccessToken();
  const uploadUrl = "https://api.x.com/2/media/upload";
  const imageBuffer = fs.readFileSync(imagePath);
  const response = await fetch(uploadUrl, {
    body: JSON.stringify({
      media: imageBuffer.toString("base64"),
      media_category: "tweet_image",
      media_type: mimeTypeForImage(imagePath),
      shared: false,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.errors?.[0]?.detail || data?.errors?.[0]?.message || `X OAuth 2 media upload returned ${response.status}.`);
  }

  return data.data?.id;
}

async function postTweet(body, config) {
  const tweetUrl = "https://api.x.com/2/tweets";
  const response = await fetch(tweetUrl, {
    body: JSON.stringify(body),
    headers: {
      Authorization: oauth1Header({ ...config, method: "POST", url: tweetUrl }),
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.errors?.[0]?.message || `X tweet returned ${response.status}.`);
  }

  return data.data;
}

async function postTweetOAuth2(body) {
  const accessToken = await oauth2AccessToken();
  const tweetUrl = "https://api.x.com/2/tweets";
  const response = await fetch(tweetUrl, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.errors?.[0]?.detail || data?.errors?.[0]?.message || `X OAuth 2 tweet returned ${response.status}.`);
  }

  return data.data;
}

async function postDirectThread({ imagePath, mainText, replyText }) {
  const oauth2Connection = readOAuth2Connection();
  if (oauth2Connection) {
    try {
      const mediaId = await uploadMediaOAuth2(imagePath);
      const mainTweet = await postTweetOAuth2({
        media: { media_ids: [mediaId] },
        text: mainText,
      });
      const replyTweet = await postTweetOAuth2({
        reply: { in_reply_to_tweet_id: mainTweet.id },
        text: replyText,
      });

      return {
        method: "oauth2-media-thread",
        replyId: replyTweet.id,
        tweetId: mainTweet.id,
      };
    } catch (error) {
      if (isPermissionError(error)) {
        markXMediaUnsupported(`oauth2 media upload forbidden: ${error instanceof Error ? error.message : error}`);
      }
      console.warn(
        `OAuth2 media thread failed; retrying with direct X credentials. ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  const config = xConfig();
  try {
    const mediaId = await uploadMedia(imagePath, config);
    const mainTweet = await postTweet(
      {
        media: { media_ids: [mediaId] },
        text: mainText,
      },
      config,
    );
    const replyTweet = await postTweet(
      {
        reply: { in_reply_to_tweet_id: mainTweet.id },
        text: replyText,
      },
      config,
    );

    markXMediaSupported();

    return {
      method: "direct-media-thread",
      replyId: replyTweet.id,
      tweetId: mainTweet.id,
    };
  } catch (error) {
    if (isPermissionError(error)) {
      markXMediaUnsupported(`oauth1 media upload forbidden: ${error instanceof Error ? error.message : error}`);
    }
    throw error;
  }
}

async function postTextThread({ mainText, replyText }) {
  const oauth2Connection = readOAuth2Connection();
  if (oauth2Connection) {
    try {
      const mainTweet = await postTweetOAuth2({
        text: mainText,
      });
      const replyTweet = await postTweetOAuth2({
        reply: { in_reply_to_tweet_id: mainTweet.id },
        text: replyText,
      });

      return {
        method: "oauth2-text-thread",
        replyId: replyTweet.id,
        tweetId: mainTweet.id,
      };
    } catch (error) {
      console.warn(
        `OAuth2 text thread failed; retrying with direct X credentials. ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  const config = xConfig();
  const mainTweet = await postTweet(
    {
      text: mainText,
    },
    config,
  );
  const replyTweet = await postTweet(
    {
      reply: { in_reply_to_tweet_id: mainTweet.id },
      text: replyText,
    },
    config,
  );

  return {
    method: "direct-text-thread",
    replyId: replyTweet.id,
    tweetId: mainTweet.id,
  };
}

async function postDirectLink({ post, url }) {
  const oauth2Connection = readOAuth2Connection();
  if (oauth2Connection) {
    try {
      const tweet = await postTweetOAuth2({
        text: linkTweetForPost(post, url),
      });

      return {
        method: "oauth2-link-post",
        replyId: null,
        tweetId: tweet.id,
      };
    } catch (error) {
      console.warn(
        `OAuth2 link post failed; retrying with direct X credentials. ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  const config = xConfig();
  const tweet = await postTweet(
    {
      text: linkTweetForPost(post, url),
    },
    config,
  );

  return {
    method: "direct-link-post",
    replyId: null,
    tweetId: tweet.id,
  };
}

async function postViaLocalhost({ post, url }) {
  const caption = localhostTweetForPost(post, url);
  const response = await fetch(localhostPostUrl, {
    body: JSON.stringify({
      campaign: "EMC2Ops Blog",
      caption,
      channels: ["x"],
      linkUrl: url,
      postType: "link",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data?.error || `Localhost X publisher returned ${response.status}.`);
  }

  const xResult = data.results?.find((result) => result.channel === "x");
  if (!xResult?.id) throw new Error("Localhost X publisher did not return a tweet id.");

  return {
    method: "localhost-link-post",
    replyId: null,
    tweetId: xResult.id,
  };
}

async function publishToLinkedIn({ post, url }) {
  const text = linkedInPostForPost(post, url);
  assertLinkedInPostLength(text);

  const channelId = await getBufferLinkedInChannelId();
  const config = getBufferConfig();
  const bufferPost = await createBufferPost({
    assets: [{ link: { url } }],
    channelId,
    mode: config.mode,
    schedulingType: "automatic",
    source: "emc2ops-blog-automation",
    text,
  });

  return {
    linkedInPostId: bufferPost.id,
    method: `buffer-${config.mode}`,
    text,
  };
}

async function publishToX({ forceLocalhost, imagePath, mainText, post, replyText, url, useMediaThread }) {
  if (forceLocalhost) return postViaLocalhost({ post, url });

  try {
    if (!useMediaThread) return await postDirectLink({ post, url });
    return await postDirectThread({ imagePath, mainText, replyText });
  } catch (error) {
    const method = useMediaThread ? "media thread" : "link post";
    console.warn(`Direct X ${method} failed: ${error instanceof Error ? error.message : error}`);
    if (useMediaThread) {
      console.warn("Falling back to a direct X text thread without media.");
      try {
        return await postTextThread({ mainText, replyText });
      } catch (threadError) {
        console.warn(
          `Direct X text thread also failed: ${threadError instanceof Error ? threadError.message : threadError}`,
        );
      }
      console.warn("Falling back to direct X link post without media.");
      try {
        return await postDirectLink({ post, url });
      } catch (linkError) {
        console.warn(
          `Direct X link post also failed: ${linkError instanceof Error ? linkError.message : linkError}`,
        );
      }
    }

    console.warn(`Falling back to localhost X publisher at ${localhostPostUrl}.`);
    return postViaLocalhost({ post, url });
  }
}

async function main() {
  readEnvFile("acquisition-dashboard/.env.local");
  readEnvFile(".env.local");

  const { args, flags } = argsFromCli();
  const slug = args.get("slug");
  const imagePath = args.get("image");
  const dryRun = flags.has("dry-run");
  const force = flags.has("force");
  const forceMediaThread = flags.has("force-media-thread");
  const forceLocalhost = flags.has("localhost");
  const requestedMediaThread = flags.has("media-thread") || Boolean(imagePath);
  const useMediaThread = requestedMediaThread;
  const verifyCardOnly = flags.has("verify-card-only");
  const skipLiveCheck = flags.has("skip-live-check");
  const skipDeploy = flags.has("no-deploy");
  const skipBuild = flags.has("skip-build");
  const channels = socialChannelsFromCli(args, flags);

  if (!slug) throw new Error("Pass --slug <blog-slug>.");
  if (channels.length === 0) throw new Error("Choose at least one social channel.");
  if (useMediaThread && !imagePath) throw new Error("Pass --image <path-to-generated-image> when using --media-thread.");
  if (imagePath && !fs.existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`);

  const posts = verifyLocalBlogBuild({ skipBuild });
  const post = posts.find((item) => item.slug === slug);
  if (!post) throw new Error(`Blog post not found in ${contentPostsPath}: ${slug}`);

  const url = `${siteUrl}/blog/${post.slug}/`;
  const mainText = mainTweetForPost(post);
  const replyText = replyTweetForPost(post, url);
  const linkedInText = linkedInPostForPost(post, url);
  assertLinkedInPostLength(linkedInText);

  if (dryRun) {
    console.log(JSON.stringify({
      channels,
      forceMediaThread,
      imagePath,
      linkedInPost: linkedInText,
      linkPost: linkTweetForPost(post, url),
      mainText,
      mediaCapability: xCapabilities().mediaUpload || null,
      replyText,
      slug,
      url,
      useMediaThread,
    }, null, 2));
    return;
  }

  const history = readJsonFile(historyPath, { posts: {} });
  const previousPost = history.posts?.[slug] || {};
  const shouldPostX = channels.includes("x") && (force || !previousPost.tweetId);
  const shouldPostLinkedIn = channels.includes("linkedin") && (force || !previousPost.linkedInPostId);

  if (!shouldPostX && !shouldPostLinkedIn) {
    const posted = [
      previousPost.tweetId ? `X ${previousPost.tweetId}` : "",
      previousPost.linkedInPostId ? `LinkedIn ${previousPost.linkedInPostId}` : "",
    ].filter(Boolean).join(", ");
    console.log(`Skipped social promotion for ${slug}; already posted to ${posted}.`);
    return;
  }

  if (!skipLiveCheck) {
    await verifyPublicUrl(url, { skipDeploy });
    const twitterCard = await verifyPublicTwitterCard(url, { skipDeploy });
    console.log(`Verified Twitter card for ${slug}: ${twitterCard["twitter:image"]}`);
  }

  if (verifyCardOnly) return;

  const nextRecord = {
    ...previousPost,
    imagePath: imagePath || previousPost.imagePath || "",
    url,
  };
  const messages = [];

  if (shouldPostX) {
    if (requestedMediaThread && shouldSkipMediaThread({ forceMediaThread })) {
      console.warn(
        `Cached media capability is marked unsupported for ${slug}; retrying anyway because an image path was provided.`,
      );
    }
    const result = await publishToX({ forceLocalhost, imagePath, mainText, post, replyText, url, useMediaThread });
    Object.assign(nextRecord, {
      mediaCapability: xCapabilities().mediaUpload || null,
      method: result.method,
      postedAt: new Date().toISOString(),
      replyId: result.replyId,
      tweetId: result.tweetId,
    });
    messages.push(`X ${result.tweetId}${result.replyId ? `, reply ${result.replyId}` : ""} (${result.method})`);
  } else if (channels.includes("x")) {
    messages.push(`X skipped; already posted as ${previousPost.tweetId}`);
  }

  if (shouldPostLinkedIn) {
    const result = await publishToLinkedIn({ post, url });
    Object.assign(nextRecord, {
      linkedInMethod: result.method,
      linkedInPostId: result.linkedInPostId,
      linkedInPostedAt: new Date().toISOString(),
    });
    messages.push(`LinkedIn ${result.linkedInPostId} (${result.method})`);
  } else if (channels.includes("linkedin")) {
    messages.push(`LinkedIn skipped; already posted as ${previousPost.linkedInPostId}`);
  }

  history.posts = {
    ...(history.posts || {}),
    [slug]: nextRecord,
  };
  writeJsonFile(historyPath, history);

  console.log(`Posted social promotion for ${slug}: ${messages.join("; ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

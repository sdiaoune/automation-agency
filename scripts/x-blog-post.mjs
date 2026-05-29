import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://www.emc2ops.com";
const historyPath = ".x-blog-post-history.json";
const postsPath = "blog/posts.json";
const maxTweetLength = 280;
const localhostPostUrl = process.env.LOCAL_X_POST_URL || "http://localhost:9876/api/social-post";

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

function normalizeWhitespace(value) {
  return String(value).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function truncateForTweet(value, maxLength) {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function mainTweetForPost(post) {
  const hashtags = "#PropertyManagement #AIAutomation";
  const lead = `New EMC2Ops guide: ${post.keyword}`;
  const cta = "For owners/operators managing 50+ units who want faster leasing response, cleaner maintenance intake, and fewer manual CRM handoffs.";
  const reserve = lead.length + cta.length + hashtags.length + 8;
  const insight = truncateForTweet(post.meta.replace(/\.$/, ""), maxTweetLength - reserve);
  const tweet = `${lead}\n\n${insight}\n\n${cta}\n\n${hashtags}`;

  return truncateForTweet(tweet, maxTweetLength);
}

function replyTweetForPost(post, url) {
  const tweet = `Read the full EMC2Ops guide on ${post.keyword}:\n${url}\n\nBook a 15-minute workflow audit if this is costing your team time or leads.`;
  return truncateForTweet(tweet, maxTweetLength);
}

function localhostTweetForPost(post, url) {
  const tweet = `New EMC2Ops guide: ${post.title}\n\n${url}`;
  return truncateForTweet(tweet, maxTweetLength);
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

async function postDirectThread({ imagePath, mainText, replyText }) {
  const config = xConfig();
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

  return {
    method: "direct-media-thread",
    replyId: replyTweet.id,
    tweetId: mainTweet.id,
  };
}

async function postViaLocalhost({ post, url }) {
  const caption = localhostTweetForPost(post, url);
  const response = await fetch(localhostPostUrl, {
    body: JSON.stringify({
      campaign: "EMC2Ops Blog",
      caption,
      channels: ["x"],
      postType: "text",
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
    method: "localhost-text-post",
    replyId: null,
    tweetId: xResult.id,
  };
}

async function publishToX({ forceLocalhost, imagePath, mainText, post, replyText, url }) {
  if (forceLocalhost) return postViaLocalhost({ post, url });

  try {
    return await postDirectThread({ imagePath, mainText, replyText });
  } catch (error) {
    console.warn(`Direct X media thread failed: ${error instanceof Error ? error.message : error}`);
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
  const forceLocalhost = flags.has("localhost");
  const skipLiveCheck = flags.has("skip-live-check");
  const skipDeploy = flags.has("no-deploy");

  if (!slug) throw new Error("Pass --slug <blog-slug>.");
  if (!imagePath) throw new Error("Pass --image <path-to-generated-image>.");
  if (!fs.existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`);

  const posts = readJsonFile(postsPath, []);
  const post = posts.find((item) => item.slug === slug);
  if (!post) throw new Error(`Blog post not found in ${postsPath}: ${slug}`);

  const history = readJsonFile(historyPath, { posts: {} });
  if (history.posts?.[slug] && !force) {
    console.log(`Skipped X post for ${slug}; already posted as ${history.posts[slug].tweetId}.`);
    return;
  }

  const url = `${siteUrl}/blog/${post.slug}/`;
  const mainText = mainTweetForPost(post);
  const replyText = replyTweetForPost(post, url);

  if (dryRun) {
    console.log(JSON.stringify({ imagePath, mainText, replyText, slug, url }, null, 2));
    return;
  }

  if (!skipLiveCheck) await verifyPublicUrl(url, { skipDeploy });

  const result = await publishToX({ forceLocalhost, imagePath, mainText, post, replyText, url });

  history.posts = {
    ...(history.posts || {}),
    [slug]: {
      imagePath,
      method: result.method,
      postedAt: new Date().toISOString(),
      replyId: result.replyId,
      tweetId: result.tweetId,
      url,
    },
  };
  writeJsonFile(historyPath, history);

  console.log(`Posted X promotion for ${slug}: ${result.tweetId}${result.replyId ? `, reply ${result.replyId}` : ""} (${result.method})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

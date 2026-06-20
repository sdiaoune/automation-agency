import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const siteUrl = "https://www.emc2ops.com";
const historyPath = path.join(root, ".meta-carousel-post-history.json");
const dashboardEnvPath = path.join(root, "acquisition-dashboard/.env.local");
const metaConnectionsPath = path.join(
  root,
  "acquisition-dashboard/.meta-social-connections.json",
);

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      flags.add(key);
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  return { args, flags };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
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

function historyPosts(history) {
  if (Array.isArray(history)) return history;
  if (history && Array.isArray(history.posts)) return history.posts;
  return [];
}

function historyShape(history, posts) {
  if (Array.isArray(history)) return posts;
  return { ...(history && typeof history === "object" ? history : {}), posts };
}

function runIdentity(entry) {
  const firstSlide = Array.isArray(entry.slideUrls) ? entry.slideUrls[0] : "";
  return [entry.date || "", entry.slot || "", entry.topic || "", entry.hook || "", firstSlide].join("::");
}

function ensureNoDuplicateRun(history, config, slideUrls = []) {
  const posts = historyPosts(history);
  const duplicate = posts.find(
    (post) =>
      runIdentity(post) ===
      runIdentity({
        date: config.date,
        hook: config.hook,
        slideUrls,
        slot: config.slot,
        topic: config.topic,
      }),
  );

  if (duplicate?.status === "publishing" || duplicate?.instagramPostId || duplicate?.facebookPostId) {
    throw new Error(
      `This ${config.slot} carousel is already ${duplicate.status === "publishing" ? "reserved" : "recorded"} for ${config.date}. Refusing to publish a duplicate run.`,
    );
  }
}

function reserveRun(history, config, slideUrls) {
  const lockDir = path.join(root, ".meta-carousel-locks");
  fs.mkdirSync(lockDir, { recursive: true });
  const lockPath = path.join(
    lockDir,
    `${Buffer.from(runIdentity({ ...config, slideUrls })).toString("base64url")}.lock`,
  );
  const lockFd = fs.openSync(lockPath, "wx");

  const posts = historyPosts(history).filter(
    (post) => runIdentity(post) !== runIdentity({ ...config, slideUrls }),
  );
  posts.push({
    date: config.date,
    hook: config.hook,
    reservedAt: new Date().toISOString(),
    slideUrls,
    slot: config.slot,
    status: "publishing",
    topic: config.topic,
  });
  writeJsonFile(historyPath, historyShape(history, posts));

  return () => {
    fs.closeSync(lockFd);
    fs.rmSync(lockPath, { force: true });
  };
}

function abortRun(config, slideUrls) {
  const history = readJsonFile(historyPath, { posts: [] });
  const posts = historyPosts(history).filter((post) => {
    if (runIdentity(post) !== runIdentity({ ...config, slideUrls })) return true;
    return post.status !== "publishing";
  });
  writeJsonFile(historyPath, historyShape(history, posts));
}

function slideDirectory(config) {
  return path.join(
    root,
    "public/social-assets/carousel",
    `${config.date}-${config.slot}-${config.slug}`,
  );
}

function publicSlideUrl(config, slideNumber) {
  return `${siteUrl}/social-assets/carousel/${config.date}-${config.slot}-${config.slug}/slide-${slideNumber}.png`;
}

function publicContactSheetUrl(config) {
  return `${siteUrl}/social-assets/carousel/${config.date}-${config.slot}-${config.slug}/contact-sheet.png`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function visualMarkup(type) {
  const pieces = {
    clock: `<div class="clock"><span></span><i></i><b></b></div>`,
    crm: `<div class="crm"><span></span><span></span><span></span><b></b></div>`,
    cta: `<div class="cta"><span></span><span></span><span></span><b></b></div>`,
    exception: `<div class="exception"><span></span><i></i><b></b></div>`,
    intake: `<div class="intake"><span></span><span></span><span></span><b></b></div>`,
    routing: `<div class="routing"><span></span><span></span><span></span><b></b></div>`,
    scorecard: `<div class="scorecard"><span></span><span></span><span></span><b></b></div>`,
    trigger: `<div class="trigger"><span></span><i></i><b></b></div>`,
  };

  return pieces[type] || pieces.scorecard;
}

function slideHtml(slide, index, total) {
  return `
    <section class="slide">
      <div class="panel">
        <div class="top">
          <span class="brand">${slide.eyebrow}</span>
          <span class="count">${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
        </div>
        <div class="copy">
          <p class="kicker">${slide.kicker}</p>
          <h1>${slide.title}${slide.titleAccent ? `<em>${slide.titleAccent}</em>` : ""}</h1>
          <p class="body">${slide.body.replaceAll("\n", "<br>")}</p>
        </div>
        <div class="visual-wrap">${visualMarkup(slide.visual)}</div>
        <div class="footer">${slide.footer}</div>
      </div>
    </section>
  `;
}

function pageHtml(slide, index, total) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        :root {
          --bg: #0b0c0a;
          --panel: #151511;
          --panel-2: #1c1c16;
          --text: #f5f7fb;
          --muted: #b8bcae;
          --line: rgba(255, 255, 255, 0.12);
          --accent: #f7c948;
          --accent-2: #46e6b0;
          --danger: #ff6b6b;
          --radius: 8px;
          --shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background:
            linear-gradient(180deg, #0b0c0a 0%, #12130f 48%, #080906 100%);
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .slide {
          width: 1080px;
          height: 1080px;
          position: relative;
          overflow: hidden;
        }
        .slide::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent 80%);
        }
        .slide::after {
          content: "";
          position: absolute;
          inset: 36px;
          border: 1px solid rgba(247, 201, 72, 0.16);
          pointer-events: none;
        }
        .panel {
          position: absolute;
          inset: 56px;
          padding: 38px;
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025));
          border: 1px solid var(--line);
          box-shadow: var(--shadow);
        }
        .top, .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand, .count {
          font-size: 24px;
          font-weight: 850;
          color: var(--muted);
          text-transform: uppercase;
        }
        .brand {
          color: var(--text);
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .brand::before {
          content: "E";
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #07100d;
          font-weight: 950;
          border-radius: var(--radius);
        }
        .copy {
          align-self: end;
          max-width: 822px;
          padding-bottom: 24px;
        }
        .kicker {
          display: inline-flex;
          align-items: center;
          min-height: 52px;
          margin: 0 0 24px;
          padding: 0 18px;
          border: 1px solid rgba(247, 201, 72, 0.28);
          background: rgba(247, 201, 72, 0.08);
          color: #ffe49a;
          font-size: 28px;
          font-weight: 820;
        }
        h1 {
          margin: 0;
          font-size: 78px;
          line-height: 0.94;
          font-weight: 980;
          letter-spacing: 0;
          text-wrap: balance;
        }
        h1 em {
          display: block;
          font-style: normal;
          background: linear-gradient(90deg, #fff, #f7c948 44%, #46e6b0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .body {
          margin: 30px 0 0;
          max-width: 784px;
          color: var(--muted);
          font-size: 31px;
          line-height: 1.18;
          font-weight: 760;
        }
        .visual-wrap {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 248px;
          margin: 8px 0 24px;
        }
        .footer {
          min-height: 74px;
          padding: 0 28px;
          border: 1px solid rgba(70, 230, 176, 0.24);
          background: rgba(70, 230, 176, 0.08);
          color: var(--text);
          font-size: 24px;
          font-weight: 820;
        }
        .scorecard, .routing, .crm, .intake, .clock, .exception, .trigger, .cta {
          position: relative;
          filter: drop-shadow(0 22px 40px rgba(0, 0, 0, 0.34));
        }
        .scorecard {
          width: 360px;
          height: 220px;
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, 1fr);
          padding: 22px;
          background: rgba(8, 11, 16, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .scorecard span,
        .crm span,
        .intake span {
          display: block;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .scorecard span::before,
        .crm span::before,
        .intake span::before {
          content: "";
          display: block;
          width: 18px;
          height: 18px;
          margin: 16px;
          background: var(--accent-2);
        }
        .scorecard b,
        .routing b,
        .trigger b,
        .cta b {
          position: absolute;
          background: var(--accent);
          color: #15100a;
        }
        .scorecard b {
          right: 18px;
          bottom: 18px;
          width: 94px;
          height: 54px;
          border-radius: var(--radius);
        }
        .scorecard b::after,
        .routing b::after,
        .cta b::after {
          content: "✓";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: 40px;
          font-weight: 950;
        }
        .trigger {
          width: 418px;
          height: 220px;
        }
        .trigger span, .routing span {
          position: absolute;
          left: 0;
          width: 42px;
          height: 42px;
          background: var(--danger);
        }
        .trigger span { top: 30px; }
        .trigger i {
          position: absolute;
          left: 72px;
          top: 46px;
          width: 238px;
          border-top: 4px dashed rgba(70, 230, 176, 0.56);
        }
        .trigger b {
          right: 0;
          top: 0;
          width: 124px;
          height: 124px;
          border-radius: var(--radius);
          background: var(--accent-2);
        }
        .trigger b::after {
          content: "";
          position: absolute;
          left: -26px;
          top: 52px;
          width: 26px;
          border-top: 4px solid rgba(70, 230, 176, 0.56);
        }
        .intake {
          width: 372px;
          display: grid;
          gap: 12px;
        }
        .intake span {
          height: 44px;
        }
        .intake b {
          position: absolute;
          right: -10px;
          top: -18px;
          width: 118px;
          height: 118px;
          background: rgba(247, 201, 72, 0.12);
          border: 2px solid rgba(247, 201, 72, 0.42);
          border-radius: 999px;
        }
        .intake b::after {
          content: "?";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #ffe49a;
          font-size: 56px;
          font-weight: 950;
        }
        .routing {
          width: 420px;
          height: 230px;
        }
        .routing span:nth-child(1) { top: 20px; }
        .routing span:nth-child(2) { top: 94px; }
        .routing span:nth-child(3) { top: 168px; }
        .routing span::after {
          content: "";
          position: absolute;
          left: 62px;
          top: 20px;
          width: 240px;
          height: 5px;
          background: rgba(70, 230, 176, 0.34);
        }
        .routing b {
          right: 0;
          top: 58px;
          width: 116px;
          height: 116px;
          background: var(--accent-2);
        }
        .crm {
          width: 380px;
          display: grid;
          gap: 14px;
        }
        .crm span {
          height: 48px;
        }
        .crm b {
          position: absolute;
          right: -26px;
          bottom: -20px;
          width: 144px;
          height: 96px;
          background: var(--panel);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius);
        }
        .crm b::after {
          content: "CRM";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: var(--accent);
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }
        .clock {
          width: 250px;
          height: 250px;
          border-radius: 999px;
          border: 10px solid rgba(247, 201, 72, 0.34);
        }
        .clock span {
          position: absolute;
          inset: 20px;
          border-radius: 999px;
          border: 2px dashed rgba(70, 230, 176, 0.34);
        }
        .clock i, .clock b {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: left center;
          background: var(--accent);
          height: 8px;
          border-radius: 999px;
        }
        .clock i {
          width: 74px;
          transform: translateY(-50%) rotate(-28deg);
        }
        .clock b {
          width: 52px;
          background: var(--accent-2);
          transform: translateY(-50%) rotate(68deg);
        }
        .clock::after {
          content: "";
          position: absolute;
          left: calc(50% - 10px);
          top: calc(50% - 10px);
          width: 20px;
          height: 20px;
          border-radius: 999px;
          background: var(--text);
        }
        .exception {
          width: 290px;
          height: 220px;
        }
        .exception span {
          position: absolute;
          inset: 0;
          background: var(--panel);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius);
        }
        .exception i {
          position: absolute;
          left: 92px;
          top: 20px;
          width: 106px;
          height: 106px;
          background: var(--danger);
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        }
        .exception b {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 24px;
          text-align: center;
          color: var(--muted);
          font-size: 30px;
          font-weight: 850;
        }
        .exception b::before {
          content: "Human review";
        }
        .cta {
          width: 230px;
          height: 230px;
          border-radius: 999px;
          border: 5px dashed rgba(70, 230, 176, 0.42);
        }
        .cta span {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: var(--danger);
          border: 8px solid var(--bg);
        }
        .cta span:nth-child(1) { left: 8px; top: 28px; }
        .cta span:nth-child(2) { right: -8px; top: 90px; }
        .cta span:nth-child(3) { left: 42px; bottom: 16px; }
        .cta b {
          left: 56px;
          top: 56px;
          width: 108px;
          height: 108px;
          border-radius: 999px;
          background: var(--accent-2);
        }
      </style>
    </head>
    <body>${slideHtml(slide, index, total)}</body>
  </html>`;
}

function contactSheetHtml(imagePaths) {
  const images = imagePaths
    .map((imagePath) => {
      const bytes = fs.readFileSync(imagePath).toString("base64");
      return `<img src="data:image/png;base64,${bytes}" alt="">`;
    })
    .join("");

  return `<!doctype html>
  <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 24px;
          width: max-content;
          background: #0b0c0a;
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(4, 270px);
        }
        img {
          display: block;
          width: 270px;
          height: 270px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #151511;
        }
      </style>
    </head>
    <body>${images}</body>
  </html>`;
}

async function renderCarousel(config) {
  const outDir = slideDirectory(config);
  ensureDir(outDir);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });

  for (let index = 0; index < config.slides.length; index += 1) {
    await page.setContent(pageHtml(config.slides[index], index, config.slides.length));
    await page.screenshot({
      path: path.join(outDir, `slide-${index + 1}.png`),
      type: "png",
    });
  }

  const imagePaths = config.slides.map((_, index) =>
    path.join(outDir, `slide-${index + 1}.png`),
  );
  await page.setViewportSize({ width: 1146, height: config.slides.length > 4 ? 600 : 300 });
  await page.setContent(contactSheetHtml(imagePaths));
  await page.screenshot({
    path: path.join(outDir, "contact-sheet.png"),
    fullPage: true,
    type: "png",
  });

  await browser.close();
  return outDir;
}

function buildSite() {
  const result = spawnSync("npm", ["run", "build"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Astro build failed with exit code ${result.status}.`);
  }
}

function deployProduction() {
  const result = spawnSync("npx", ["vercel", "--prod", "--yes"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Vercel production deploy failed with exit code ${result.status}.`);
  }
}

async function headStatus(url) {
  const response = await fetch(url, { method: "HEAD", redirect: "follow" });
  return {
    contentType: response.headers.get("content-type") || "",
    ok: response.ok,
    status: response.status,
  };
}

async function verifyPublicSlides(config) {
  const urls = config.slides.map((_, index) => publicSlideUrl(config, index + 1));
  const attempts = 8;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const results = await Promise.all(urls.map((url) => headStatus(url)));
    const allGood = results.every(
      (result) => result.ok && result.contentType.startsWith("image/"),
    );

    if (allGood) {
      const contactSheet = await headStatus(publicContactSheetUrl(config));
      if (contactSheet.ok && contactSheet.contentType.startsWith("image/")) {
        return urls;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  const diagnostics = await Promise.all(
    urls.map(async (url) => ({ url, ...(await headStatus(url)) })),
  );
  throw new Error(
    `One or more slide URLs did not return 200 image responses: ${JSON.stringify(
      diagnostics,
      null,
      2,
    )}`,
  );
}

async function loadMetaHelpers() {
  loadEnvFile(dashboardEnvPath);
  process.env.META_CONNECTIONS_FILE ||= metaConnectionsPath;
  return import("./../acquisition-dashboard/api/meta-store.js");
}

async function metaStatus() {
  const {
    FACEBOOK_PUBLISH_SCOPE,
    INSTAGRAM_PUBLISH_SCOPE,
    getActiveMetaConfig,
    inspectAccessToken,
  } = await loadMetaHelpers();
  const config = await getActiveMetaConfig();
  const token = await inspectAccessToken(config.pageAccessToken);
  const facebookReady = Boolean(
    config.facebookPageId &&
      config.pageAccessToken &&
      token.isValid &&
      token.type === "PAGE" &&
      token.missingScopes.length === 0,
  );
  const instagramReady = Boolean(
    facebookReady &&
      config.instagramBusinessAccountId &&
      token.scopes.includes(INSTAGRAM_PUBLISH_SCOPE),
  );

  return {
    config,
    facebookReady,
    instagramReady,
    summary: {
      facebookStatus:
        config.facebookPageId && config.pageAccessToken
          ? facebookReady
            ? `Ready: ${config.pageName || config.facebookPageId}`
            : `Needs Page token with ${FACEBOOK_PUBLISH_SCOPE}`
          : "Connect a Facebook Page",
      instagramStatus: config.instagramBusinessAccountId
        ? instagramReady
          ? `Ready: ${config.instagramBusinessAccountId}`
          : `Needs ${INSTAGRAM_PUBLISH_SCOPE}`
        : "No linked Instagram professional account",
      tokenType: token.type,
      version: config.version,
    },
  };
}

async function addAuthParams(params, config) {
  params.set("access_token", config.pageAccessToken);
  if (config.appSecretProof) {
    params.set("appsecret_proof", config.appSecretProof);
  }
}

async function postGraph(pathname, params, config) {
  const body = new URLSearchParams(params);
  await addAuthParams(body, config);

  const response = await fetch(
    `https://graph.facebook.com/${config.version}/${pathname}`,
    {
      body,
      method: "POST",
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Graph API returned ${response.status}.`);
  }
  return data;
}

async function getGraph(pathname, params, config) {
  const query = new URLSearchParams(params);
  await addAuthParams(query, config);

  const response = await fetch(
    `https://graph.facebook.com/${config.version}/${pathname}?${query.toString()}`,
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Graph API returned ${response.status}.`);
  }
  return data;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForInstagramContainer(containerId, config) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const status = await getGraph(
      containerId,
      { fields: "status_code,status" },
      config,
    );

    if (status.status_code === "FINISHED") return status;
    if (status.status_code === "ERROR") {
      throw new Error(status.status || "Instagram media processing failed.");
    }

    await wait(2500);
  }

  throw new Error(`Instagram container ${containerId} is still processing.`);
}

async function publishInstagramCarousel(config, slideUrls, metaConfig) {
  const childContainerIds = [];

  for (const slideUrl of slideUrls) {
    const child = await postGraph(
      `${metaConfig.instagramBusinessAccountId}/media`,
      {
        image_url: slideUrl,
        is_carousel_item: "true",
      },
      metaConfig,
    );
    await waitForInstagramContainer(child.id, metaConfig);
    childContainerIds.push(child.id);
  }

  const parent = await postGraph(
    `${metaConfig.instagramBusinessAccountId}/media`,
    {
      caption: config.captions.instagram,
      children: childContainerIds.join(","),
      media_type: "CAROUSEL",
    },
    metaConfig,
  );
  await waitForInstagramContainer(parent.id, metaConfig);

  const published = await postGraph(
    `${metaConfig.instagramBusinessAccountId}/media_publish`,
    { creation_id: parent.id },
    metaConfig,
  );

  return {
    childContainerIds,
    creationId: parent.id,
    postId: published.id,
  };
}

async function publishFacebookCarousel(config, slideUrls, metaConfig) {
  const mediaIds = [];

  for (const slideUrl of slideUrls) {
    const photo = await postGraph(
      `${metaConfig.facebookPageId}/photos`,
      {
        published: "false",
        url: slideUrl,
      },
      metaConfig,
    );
    mediaIds.push(photo.id);
  }

  const params = {
    message: config.captions.facebook,
  };

  mediaIds.forEach((mediaId, index) => {
    params[`attached_media[${index}]`] = JSON.stringify({ media_fbid: mediaId });
  });

  const published = await postGraph(`${metaConfig.facebookPageId}/feed`, params, metaConfig);
  const url =
    typeof published.id === "string" && published.id.includes("_")
      ? `https://www.facebook.com/${published.id.replace("_", "/posts/")}`
      : "";

  return {
    attachedPhotoIds: mediaIds,
    postId: published.id,
    postUrl: url,
  };
}

function appendHistory(history, entry) {
  const next = historyPosts(history).filter((post) => runIdentity(post) !== runIdentity(entry));
  next.push(entry);
  return historyShape(history, next);
}

function summarizeResult(config, outDir, slideUrls, deployStatus, instagram, facebook) {
  return {
    captionLengths: {
      facebook: config.captions.facebook.length,
      instagram: config.captions.instagram.length,
    },
    deployStatus,
    facebook,
    instagram,
    slideDirectory: outDir,
    slideUrls,
    topic: config.topic,
  };
}

async function main() {
  const start = Date.now();
  const { args, flags } = parseArgs(process.argv.slice(2));
  const configPath = args.get("config");

  if (!configPath) {
    throw new Error("Pass --config <path-to-config-module>.");
  }

  const history = readJsonFile(historyPath, { posts: [] });
  const configModule = await import(pathToFileURL(path.resolve(root, configPath)).href);
  const config = configModule.default;
  const expectedSlideUrls = config.slides.map((_, index) => publicSlideUrl(config, index + 1));
  let releaseReservation = () => {};
  let reservedForPublish = false;
  let completedPublish = false;

  try {

  const status = await metaStatus();
  if (!status.facebookReady || !status.instagramReady) {
    throw new Error(
      `Meta is not ready. Facebook: ${status.summary.facebookStatus}. Instagram: ${status.summary.instagramStatus}.`,
    );
  }

  const outDir = await renderCarousel(config);

	  if (flags.has("render-only")) {
    console.log(
      JSON.stringify(
        {
          mode: "render-only",
          slideDirectory: outDir,
          topic: config.topic,
        },
        null,
        2,
      ),
    );
	    return;
	  }

  if (!flags.has("skip-publish")) {
    const latestHistory = readJsonFile(historyPath, { posts: [] });
    ensureNoDuplicateRun(latestHistory, config, expectedSlideUrls);
    releaseReservation = reserveRun(latestHistory, config, expectedSlideUrls);
    reservedForPublish = true;
  }

  if (!flags.has("skip-build")) buildSite();

  let deployStatus = "skipped";
  if (!flags.has("skip-deploy")) {
    deployProduction();
    deployStatus = "deployed";
  }

  const slideUrls = await verifyPublicSlides(config);

  let instagram = null;
  let facebook = null;
  if (!flags.has("skip-publish")) {
    instagram = await publishInstagramCarousel(config, slideUrls, status.config);
    facebook = await publishFacebookCarousel(config, slideUrls, status.config);
  }

  if (!flags.has("skip-publish")) {
    const historyEntry = {
      channels: ["instagram", "facebook"],
      createdAt: new Date().toISOString(),
      date: config.date,
      facebookCaption: config.captions.facebook,
      facebookPostId: facebook?.postId || "",
      facebookPostUrl: facebook?.postUrl || "",
      hook: config.hook,
      instagramCaption: config.captions.instagram,
      instagramPostId: instagram?.postId || "",
      slideDirectory: outDir,
      slideUrls,
      slot: config.slot,
      topic: config.topic,
	    };
	    writeJsonFile(
	      historyPath,
	      appendHistory(readJsonFile(historyPath, { posts: [] }), historyEntry),
	    );
	    completedPublish = true;
	  }

  const elapsedMs = Date.now() - start;
  console.log(
    JSON.stringify(
      {
        ...summarizeResult(config, outDir, slideUrls, deployStatus, instagram, facebook),
        elapsedMs,
      },
      null,
      2,
    ),
	  );
  } catch (error) {
    if (reservedForPublish && !completedPublish) abortRun(config, expectedSlideUrls);
    throw error;
	  } finally {
	    releaseReservation();
	  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

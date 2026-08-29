import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const siteRoot = path.resolve(import.meta.dirname, "..");
const appRoot = process.env.PM_OPS_ROOT ||
  "/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app";
const origin = "http://127.0.0.1:5173";
const manifest = JSON.parse(
  await fs.readFile(path.join(siteRoot, "src/data/product-screenshot-manifest.json"), "utf8"),
);
const forbidden = [
  "EMC2Ops",
  "internal-operations",
  "+17166221976",
  "hqxibloxwgigowftfuaa",
  "soya@GetEMC2Ops.com",
];

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${origin}/app`);
      if (response.ok || response.status === 302) return;
    } catch {}
    await wait(250);
  }
  throw new Error("PM Ops capture server did not become ready.");
}

function publicFile(urlPath) {
  return path.join(siteRoot, "public", urlPath.replace(/^\//, ""));
}

function assertPrivacy(text, scenario) {
  for (const token of forbidden) {
    if (text.toLowerCase().includes(token.toLowerCase())) {
      throw new Error(`${scenario} contains forbidden token: ${token}`);
    }
  }

  for (const email of text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []) {
    if (!email.toLowerCase().endsWith("@example.com")) {
      throw new Error(`${scenario} contains non-demo email: ${email}`);
    }
  }

  for (const phone of text.match(/\(\d{3}\) \d{3}-\d{4}/g) || []) {
    if (!/^\(202\) 555-01\d{2}$/.test(phone)) {
      throw new Error(`${scenario} contains non-demo phone: ${phone}`);
    }
  }
}

function captureUrl(item) {
  const route = item.section === "dashboard" ? "/app" : `/app/${item.section}`;
  return `${origin}${route}?capture=${encodeURIComponent(item.captureScenario || item.scenario)}`;
}

async function buildContactSheet(captures) {
  const tileWidth = 260;
  const tileHeight = 190;
  const columns = 5;
  const rows = Math.ceil(captures.length / columns);
  const composites = [];

  for (let index = 0; index < captures.length; index += 1) {
    const capture = captures[index];
    const left = (index % columns) * tileWidth;
    const top = Math.floor(index / columns) * tileHeight;
    const image = await sharp(capture.file)
      .resize({ width: 238, height: 150, fit: "contain", background: "#f7f8fa" })
      .jpeg({ quality: 82 })
      .toBuffer();
    const label = capture.label.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const svg = Buffer.from(`<svg width="238" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="238" height="24" fill="#ffffff"/><text x="4" y="16" font-family="Arial, sans-serif" font-size="11" fill="#20252d">${label}</text></svg>`);
    composites.push({ input: image, left: left + 11, top: top + 8 });
    composites.push({ input: svg, left: left + 11, top: top + 160 });
  }

  const output = path.join(siteRoot, "output/pm-ops-money-page-contact-sheet.jpg");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp({
    create: { width: columns * tileWidth, height: rows * tileHeight, channels: 3, background: "#eef1f4" },
  }).composite(composites).jpeg({ quality: 88 }).toFile(output);
  return output;
}

const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1"], {
  cwd: appRoot,
  env: { ...process.env, PM_OPS_CAPTURE_MODE: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (chunk) => process.stdout.write(`[pm-ops] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[pm-ops] ${chunk}`));

let browser;
const captures = [];

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  for (const item of manifest) {
    for (const viewport of [
      { key: "desktop", width: 1440, height: 900, deviceScaleFactor: 2 },
      { key: "mobile", width: 390, height: 844, deviceScaleFactor: 3 },
    ]) {
      const page = await browser.newPage({
        deviceScaleFactor: viewport.deviceScaleFactor,
        viewport: { width: viewport.width, height: viewport.height },
      });
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error" && !message.text().includes("manifest patches")) {
          consoleErrors.push(message.text());
        }
      });

      await page.goto(captureUrl(item), { waitUntil: "domcontentloaded" });
      await page.locator(`[data-capture-scenario="${item.captureScenario || item.scenario}"]`).waitFor({ state: "visible" });
      await page.locator("[data-capture-primary]").waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);

      const visibleText = await page.locator("body").innerText();
      assertPrivacy(visibleText, item.scenario);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      if (overflow) throw new Error(`${item.scenario} ${viewport.key} has horizontal overflow.`);
      if (consoleErrors.length) {
        throw new Error(`${item.scenario} ${viewport.key} console errors: ${consoleErrors.join(" | ")}`);
      }
      if (await page.locator("vite-error-overlay, [data-nextjs-dialog-overlay]").count()) {
        throw new Error(`${item.scenario} ${viewport.key} shows a framework error overlay.`);
      }

      const jpegFile = publicFile(item[viewport.key].jpeg);
      const webpFile = publicFile(item[viewport.key].webp);
      await fs.mkdir(path.dirname(jpegFile), { recursive: true });
      const source = await page.screenshot({ type: "png", fullPage: false });
      await sharp(source)
        .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
        .toFile(jpegFile);
      await sharp(source)
        .webp({ lossless: true, effort: 6 })
        .toFile(webpFile);

      const metadata = await sharp(jpegFile).metadata();
      const expectedWidth = viewport.width * viewport.deviceScaleFactor;
      const expectedHeight = viewport.height * viewport.deviceScaleFactor;
      if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
        throw new Error(`${item.scenario} ${viewport.key} captured ${metadata.width}x${metadata.height}.`);
      }

      captures.push({ file: jpegFile, label: `${item.scenario} · ${viewport.key}` });
      console.log(`Captured ${item.scenario} ${viewport.key}`);
      await page.close();
    }
  }

  const contactSheet = await buildContactSheet(captures);
  console.log(`Contact sheet: ${contactSheet}`);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { readBlogPosts } from "./blog-content.mjs";

const dimensions = { width: 1672, height: 941 };
const root = process.cwd();
const outputRoot = path.join(root, "public/blog/social-assets");

function argsFromCli() {
  const args = new Map();
  const values = process.argv.slice(2);

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, "true");
    } else {
      args.set(key, next);
      index += 1;
    }
  }

  return args;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitTitle(value, maxWords = 11) {
  const words = String(value).trim().split(/\s+/);
  if (words.length <= maxWords) return value;
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function hashString(value) {
  let hash = 0;
  for (const character of value) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

function paletteForSlug(slug) {
  const palettes = [
    { accent: "#f7c948", accent2: "#46e6b0", accentGlow: "rgba(247,201,72,0.26)", accent2Glow: "rgba(70,230,176,0.31)", deep: "#08110f", mid: "#10221d" },
    { accent: "#ffbd6e", accent2: "#5dd5ff", accentGlow: "rgba(255,189,110,0.26)", accent2Glow: "rgba(93,213,255,0.31)", deep: "#0b1016", mid: "#172338" },
    { accent: "#ff8f70", accent2: "#8ef0c8", accentGlow: "rgba(255,143,112,0.26)", accent2Glow: "rgba(142,240,200,0.31)", deep: "#11100c", mid: "#26301f" },
    { accent: "#d9f06b", accent2: "#6ab8ff", accentGlow: "rgba(217,240,107,0.26)", accent2Glow: "rgba(106,184,255,0.31)", deep: "#080d12", mid: "#152736" },
  ];
  return palettes[hashString(slug) % palettes.length];
}

function updateSocialImageFrontmatter(post, socialImage) {
  const raw = fs.readFileSync(post.filePath, "utf8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!frontmatterMatch) throw new Error(`Missing frontmatter: ${post.filePath}`);
  if (/^socialImage:\s*/m.test(frontmatterMatch[1])) return;

  const frontmatter = frontmatterMatch[1];
  const updatedFrontmatter = /^socialHook:\s*/m.test(frontmatter)
    ? frontmatter.replace(/^(socialHook:\s*.*)$/m, `$1\nsocialImage: "${socialImage}"`)
    : frontmatter.replace(/^(bodySections:\s*.*)$/m, `$1\nsocialImage: "${socialImage}"`);

  const updated = raw.replace(frontmatterMatch[0], `---\n${updatedFrontmatter}\n---\n`);
  fs.writeFileSync(post.filePath, updated);
}

function cardHtml({ post, socialHook }) {
  const palette = paletteForSlug(post.slug);
  const hook = splitTitle(socialHook || post.socialHook || post.title, 12);
  const subhead = splitTitle(post.meta, 18);
  const label = post.pillar || "AI Front Desk";

  return String.raw`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        width: ${dimensions.width}px;
        height: ${dimensions.height}px;
        overflow: hidden;
        background: ${palette.deep};
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        position: relative;
        width: ${dimensions.width}px;
        height: ${dimensions.height}px;
        color: #f7fbff;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.055) 0 1px, transparent 1px 56px),
          radial-gradient(circle at 82% 22%, ${palette.accent2Glow}, transparent 25%),
          radial-gradient(circle at 78% 82%, ${palette.accentGlow}, transparent 28%),
          linear-gradient(135deg, ${palette.deep} 0%, #0c141b 48%, ${palette.mid} 100%);
      }
      .grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: linear-gradient(90deg, black 0%, rgba(0,0,0,0.82) 48%, transparent 100%);
      }
      .brand {
        position: absolute;
        left: 94px;
        top: 82px;
        display: flex;
        align-items: center;
        gap: 18px;
        color: #dffbf5;
        font-size: 30px;
        font-weight: 820;
      }
      .mark {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        color: #06100d;
        background: linear-gradient(135deg, ${palette.accent}, ${palette.accent2});
        font-weight: 950;
      }
      .eyebrow {
        position: absolute;
        left: 98px;
        top: 174px;
        color: ${palette.accent};
        font-size: 28px;
        font-weight: 850;
      }
      h1 {
        position: absolute;
        left: 92px;
        top: 236px;
        width: 930px;
        margin: 0;
        font-size: 86px;
        line-height: 0.99;
        letter-spacing: 0;
        font-weight: 900;
      }
      .subhead {
        position: absolute;
        left: 98px;
        top: 626px;
        width: 840px;
        color: #dce8ee;
        font-size: 33px;
        line-height: 1.22;
      }
      .rail {
        position: absolute;
        right: 92px;
        top: 154px;
        width: 430px;
        display: grid;
        gap: 18px;
      }
      .step {
        min-height: 118px;
        padding: 24px 28px;
        border: 1px solid rgba(220, 247, 241, 0.2);
        border-radius: 8px;
        background: rgba(6, 14, 18, 0.78);
        box-shadow: 0 28px 72px rgba(0,0,0,0.25);
      }
      .step strong {
        display: block;
        font-size: 31px;
        line-height: 1.05;
      }
      .step span {
        display: block;
        margin-top: 9px;
        color: #9fb4c0;
        font-size: 22px;
        line-height: 1.18;
      }
      .footer {
        position: absolute;
        left: 98px;
        bottom: 78px;
        display: flex;
        align-items: center;
        gap: 18px;
        color: #a7b8c2;
        font-size: 26px;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: ${palette.accent2};
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="grid"></div>
      <div class="brand"><span class="mark">E²</span><span>EMC2Ops</span></div>
      <div class="eyebrow">${escapeHtml(label)}</div>
      <h1>${escapeHtml(hook)}</h1>
      <p class="subhead">${escapeHtml(subhead)}</p>
      <section class="rail" aria-label="Workflow focus">
        <div class="step"><strong>Trigger</strong><span>What starts the work?</span></div>
        <div class="step"><strong>Route</strong><span>Who owns the next step?</span></div>
        <div class="step"><strong>Log</strong><span>Does the CRM know?</span></div>
        <div class="step"><strong>Escalate</strong><span>Where does human judgment enter?</span></div>
      </section>
      <div class="footer"><span>AI front desk workflows</span><span class="dot"></span><span>emc2ops.com</span></div>
    </main>
  </body>
</html>`;
}

async function main() {
  const args = argsFromCli();
  const slug = args.get("slug");
  const socialHook = args.get("hook");
  const noWrite = args.get("no-write") === "true";
  if (!slug) throw new Error("Pass --slug <blog-slug>.");

  const post = readBlogPosts().find((candidate) => candidate.slug === slug);
  if (!post) throw new Error(`Blog post not found: ${slug}`);

  fs.mkdirSync(outputRoot, { recursive: true });
  const output = path.join(outputRoot, `${slug}.png`);
  const relativePath = `/blog/social-assets/${slug}.png`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: dimensions, deviceScaleFactor: 1 });
  await page.setContent(cardHtml({ post, socialHook }), { waitUntil: "networkidle" });
  await page.screenshot({ path: output, type: "png" });
  await browser.close();

  if (!noWrite) updateSocialImageFrontmatter(post, relativePath);

  console.log(JSON.stringify({ output, relativePath, slug }, null, 2));
}

await main();

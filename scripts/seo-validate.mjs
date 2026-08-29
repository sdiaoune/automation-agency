import fs from "node:fs";
import path from "node:path";
import { normalizeInternalHref } from "./lib/normalize-internal-href.mjs";

const distDir = path.resolve("dist");
const sitemapPath = path.join(distDir, "sitemap.xml");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : fullPath;
  });
}

function pageUrl(filePath) {
  return `/${path.relative(distDir, filePath).replace(/index\.html$/, "").replace(/\\/g, "/")}`;
}

function firstMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

const htmlFiles = walk(distDir).filter((file) => file.endsWith(".html"));
const urls = new Set(htmlFiles.map(pageUrl));
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const sitemapUrls = new Set(
  [...sitemap.matchAll(/<loc>https:\/\/www\.emc2ops\.com([^<]*)<\/loc>/g)].map((match) => match[1]),
);
const moneyPageUrls = [
  "/use-cases/apartment-lead-tracking/",
  "/use-cases/real-estate-lead-follow-up-automation/",
  "/use-cases/how-to-automate-property-management/",
  "/use-cases/lead-to-lease-automation/",
  "/use-cases/real-estate-crm-follow-up-mess/",
  "/services/missed-call-recovery/",
  "/services/leasing-follow-up/",
  "/services/maintenance-intake-automation/",
  "/services/crm-workflow-automation/",
  "/services/owner-update-automation/",
  "/services/vendor-dispatch-automation/",
  "/services/ai-front-desk-property-management/",
  "/integrations/appfolio/",
  "/integrations/buildium/",
  "/integrations/leadsimple/",
];
const forbiddenVisibleLabels = [
  "Search intent this page answers",
  "Cluster keywords",
  "Search cluster strategy",
  "query clusters",
];
const failures = [];
const warnings = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const url = pageUrl(file);
  const title = firstMatch(html, /<title>(.*?)<\/title>/s);
  const description = firstMatch(html, /<meta name="description" content="(.*?)"/s);
  const canonical = firstMatch(html, /<link rel="canonical" href="(.*?)"/s);
  const h1s = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)].map((match) => stripTags(match[1]));
  const hasNoindex = /<meta name="robots" content="[^"]*noindex/i.test(html);

  if (!title) failures.push(`${url} is missing a title tag.`);
  if (title.length > 65) warnings.push(`${url} title is ${title.length} characters.`);
  if (!description) failures.push(`${url} is missing a meta description.`);
  if (description.length > 160) warnings.push(`${url} description is ${description.length} characters.`);
  if (!canonical) failures.push(`${url} is missing a canonical tag.`);
  if (h1s.length !== 1) failures.push(`${url} has ${h1s.length} H1 tags.`);
  if (!hasNoindex && !sitemapUrls.has(url)) failures.push(`${url} is indexable but missing from sitemap.`);
  for (const label of forbiddenVisibleLabels) {
    if (stripTags(html).includes(label)) failures.push(`${url} exposes internal SEO label "${label}".`);
  }
  if (url.startsWith("/blog/") && url !== "/blog/" && !moneyPageUrls.some((moneyUrl) => html.includes(`href="${moneyUrl}"`))) {
    failures.push(`${url} does not link to a service, use-case, or integration money page.`);
  }

  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(img[0])) failures.push(`${url} has an image without alt text.`);
  }

  for (const script of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      JSON.parse(script[1]);
    } catch {
      failures.push(`${url} has invalid JSON-LD.`);
    }
  }

  for (const link of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = link[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const target = normalizeInternalHref(href);
    if (!target) continue;
    const targetFile = path.join(distDir, target.replace(/^\//, ""), "index.html");
    const targetAsset = path.join(distDir, target.replace(/^\//, ""));
    if (!urls.has(target) && !fs.existsSync(targetFile) && !fs.existsSync(targetAsset)) {
      failures.push(`${url} links to missing internal URL ${href}.`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(warnings.join("\n"));
}

console.log(`SEO validation passed for ${htmlFiles.length} HTML pages.`);

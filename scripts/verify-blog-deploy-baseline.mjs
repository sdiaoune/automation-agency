#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const protectedRegions = [
  { className: "hero", label: "homepage hero", tagName: "section" },
  { className: "customer-results", label: "customer results strip", tagName: "aside" },
];

const protectedSecurityDepositMarkers = [
  "What is security deposit automation?",
  "What happens when evidence is missing, conflicting, or late?",
  "Questions to ask any security deposit automation provider",
  "AI must not infer the original condition",
  "Does new evidence invalidate an earlier manager approval?",
  "Content scope reviewed August 29, 2026",
];

const securityDepositPath = "/use-cases/security-deposit-automation/";
const securityDepositUrl = `https://www.emc2ops.com${securityDepositPath}`;

function elementWithClass(html, { className, label, tagName }) {
  const tokens = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  let start = -1;
  let depth = 0;
  let token;

  while ((token = tokens.exec(html))) {
    const value = token[0];
    const closing = value.startsWith("</");

    if (start >= 0) {
      depth += closing ? -1 : 1;
      if (depth === 0) return html.slice(start, tokens.lastIndex);
      continue;
    }

    if (closing) continue;
    const classes = value.match(/\bclass\s*=\s*(["'])(.*?)\1/is)?.[2]?.split(/\s+/) ?? [];
    if (classes.includes(className)) {
      start = token.index;
      depth = 1;
    }
  }

  throw new Error(`Blog deployment blocked: ${label} is missing from the rendered homepage.`);
}

function normalizeMarkup(value) {
  return value
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCss(value) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, "")
    .replace(/;}/g, "}")
    .trim();
}

function requireMarkers(value, markers, label) {
  const missing = markers.filter((marker) => !value.includes(marker));
  if (missing.length > 0) {
    throw new Error(`Blog deployment blocked: ${label} lost protected security-deposit content:\n${missing.join("\n")}`);
  }
}

function structuredDataGraph(html) {
  const nodes = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const value = JSON.parse(match[1]);
    if (Array.isArray(value?.["@graph"])) nodes.push(...value["@graph"]);
    else nodes.push(value);
  }
  return nodes;
}

function sitemapPaths(xml, label) {
  const paths = new Set();
  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gis)) {
    try {
      const url = new URL(match[1]);
      paths.add(`${url.pathname}${url.search}`);
    } catch {
      throw new Error(`Blog deployment blocked: ${label} contains an invalid sitemap URL: ${match[1]}.`);
    }
  }
  if (paths.size === 0) {
    throw new Error(`Blog deployment blocked: ${label} does not contain any sitemap URLs.`);
  }
  return paths;
}

function attributes(element) {
  const values = new Map();
  for (const match of element.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gis)) {
    values.set(match[1].toLowerCase(), match[3]);
  }
  return values;
}

function stylesheetHrefs(html) {
  const hrefs = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gis)) {
    const attrs = attributes(match[0]);
    const rel = (attrs.get("rel") ?? "").toLowerCase().split(/\s+/);
    const href = attrs.get("href");
    if (href && rel.includes("stylesheet")) hrefs.push(href);
  }
  return hrefs;
}

async function fetchedText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "EMC2Ops blog deployment baseline guard" },
  });
  if (!response.ok) {
    throw new Error(`Blog deployment blocked: ${url} returned HTTP ${response.status}.`);
  }
  return response.text();
}

async function remoteStylesheets(html, origin) {
  const originUrl = new URL(origin);
  const values = [];

  for (const href of stylesheetHrefs(html)) {
    const url = new URL(href, originUrl);
    if (url.origin !== originUrl.origin) {
      values.push(`external:${url.href}`);
      continue;
    }
    values.push(normalizeCss(await fetchedText(url)));
  }

  return values;
}

async function localStylesheets(html, distDir, origin) {
  const originUrl = new URL(origin);
  const root = path.resolve(distDir);
  const values = [];

  for (const href of stylesheetHrefs(html)) {
    const url = new URL(href, originUrl);
    if (url.origin !== originUrl.origin) {
      values.push(`external:${url.href}`);
      continue;
    }

    const filename = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (filename !== root && !filename.startsWith(`${root}${path.sep}`)) {
      throw new Error("Blog deployment blocked: a homepage stylesheet resolves outside dist/.");
    }
    values.push(normalizeCss(await readFile(filename, "utf8")));
  }

  return values;
}

export async function verifyBlogDeployBaseline({
  distDir = path.resolve("dist"),
  origin = "https://www.emc2ops.com",
} = {}) {
  const localHomepage = await readFile(path.join(distDir, "index.html"), "utf8");
  const liveHomepage = await fetchedText(new URL("/", origin));
  const [localSitemap, liveSitemap] = await Promise.all([
    readFile(path.join(distDir, "sitemap.xml"), "utf8"),
    fetchedText(new URL("/sitemap.xml", origin)),
  ]);

  const localPaths = sitemapPaths(localSitemap, "candidate build");
  const livePaths = sitemapPaths(liveSitemap, "production");
  const missingPaths = [...livePaths].filter((pathname) => !localPaths.has(pathname)).sort();
  if (missingPaths.length > 0) {
    throw new Error(
      `Blog deployment blocked: production URLs would disappear from the candidate build:\n${missingPaths.join("\n")}`,
    );
  }

  if (!localPaths.has(securityDepositPath)) {
    throw new Error(`Blog deployment blocked: candidate sitemap is missing ${securityDepositPath}.`);
  }

  const [securityDepositPage, llms, llmsFull, aiDocsText] = await Promise.all([
    readFile(path.join(distDir, "use-cases", "security-deposit-automation", "index.html"), "utf8"),
    readFile(path.join(distDir, "llms.txt"), "utf8"),
    readFile(path.join(distDir, "llms-full.txt"), "utf8"),
    readFile(path.join(distDir, "ai-docs.json"), "utf8"),
  ]);

  requireMarkers(securityDepositPage, protectedSecurityDepositMarkers, "rendered security-deposit page");
  const graph = structuredDataGraph(securityDepositPage);
  const webPage = graph.find((node) => node?.["@type"] === "WebPage");
  const faqPage = graph.find((node) => node?.["@type"] === "FAQPage");
  const howTo = graph.find((node) => node?.["@type"] === "HowTo");
  if (webPage?.dateModified !== "2026-08-29") {
    throw new Error("Blog deployment blocked: security-deposit WebPage dateModified is not 2026-08-29.");
  }
  if (!Array.isArray(faqPage?.mainEntity) || faqPage.mainEntity.length < 15) {
    throw new Error("Blog deployment blocked: security-deposit FAQ schema has fewer than 15 answers.");
  }
  if (!Array.isArray(howTo?.step) || howTo.step.length !== 6) {
    throw new Error("Blog deployment blocked: security-deposit HowTo schema does not contain six workflow steps.");
  }

  requireMarkers(llms, [securityDepositUrl], "llms.txt");
  requireMarkers(llmsFull, [
    securityDepositUrl,
    "Does new evidence invalidate an earlier manager approval?",
    "Can security deposit automation work without bank-account access?",
  ], "llms-full.txt");

  const aiDocs = JSON.parse(aiDocsText);
  if (aiDocs?.importantUrls?.securityDepositAutomation !== securityDepositUrl) {
    throw new Error("Blog deployment blocked: ai-docs.json lost the security-deposit canonical URL.");
  }
  if (!aiDocs?.useCaseClusters?.some((entry) => entry?.url === securityDepositUrl)) {
    throw new Error("Blog deployment blocked: ai-docs.json lost the security-deposit use-case cluster.");
  }

  for (const region of protectedRegions) {
    const local = normalizeMarkup(elementWithClass(localHomepage, region));
    const live = normalizeMarkup(elementWithClass(liveHomepage, region));
    if (local !== live) {
      throw new Error(`Blog deployment blocked: ${region.label} differs from production. Ship the homepage change separately before running a blog-only production deploy.`);
    }
  }

  const [localCss, liveCss] = await Promise.all([
    localStylesheets(localHomepage, distDir, origin),
    remoteStylesheets(liveHomepage, origin),
  ]);
  if (JSON.stringify(localCss) !== JSON.stringify(liveCss)) {
    throw new Error("Blog deployment blocked: homepage stylesheet bundle differs from production. Ship the site-wide style change separately before running a blog-only production deploy.");
  }

  return {
    protectedRegions: protectedRegions.length,
    stylesheets: localCss.length,
    securityDepositMarkers: protectedSecurityDepositMarkers.length,
  };
}

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await verifyBlogDeployBaseline({
      distDir: path.resolve(option("--dist", "dist")),
      origin: option("--origin", "https://www.emc2ops.com"),
    });
    console.log(`Blog deployment baseline verified: ${result.protectedRegions} protected regions, ${result.stylesheets} homepage stylesheet bundle(s), and ${result.securityDepositMarkers} security-deposit markers are preserved.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

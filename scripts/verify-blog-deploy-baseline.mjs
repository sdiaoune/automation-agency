#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const protectedRegions = [
  { className: "hero", label: "homepage hero", tagName: "section" },
  { className: "customer-results", label: "customer results strip", tagName: "aside" },
];

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

  return { protectedRegions: protectedRegions.length, stylesheets: localCss.length };
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
    console.log(`Blog deployment baseline verified: ${result.protectedRegions} protected regions and ${result.stylesheets} homepage stylesheet bundle(s) match production.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

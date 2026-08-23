#!/usr/bin/env node

const origin = process.env.LP_VALIDATION_ORIGIN || "https://www.emc2ops.com";
const slugs = ["property-management-systems", "property-management-crm", "ai-property-management"];
const failures = [];

for (const slug of slugs) {
  const pageUrl = `${origin}/lp/${slug}/`;
  const response = await fetch(pageUrl, { redirect: "follow" });
  const html = await response.text();
  const robotsHeader = response.headers.get("x-robots-tag") || "";

  if (!response.ok) failures.push(`${pageUrl} returned ${response.status}`);
  if (!/noindex/i.test(robotsHeader)) failures.push(`${pageUrl} is missing X-Robots-Tag noindex`);
  if (!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) failures.push(`${pageUrl} is missing meta robots noindex`);

  const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => new URL(match[1], pageUrl))
    .filter((url) => url.origin === new URL(origin).origin && /\.(css|js|png|jpe?g|webp|svg)(?:\?|$)/i.test(url.href));

  for (const assetUrl of new Map(assetUrls.map((url) => [url.href, url])).values()) {
    const assetResponse = await fetch(assetUrl, { redirect: "follow" });
    if (!assetResponse.ok) failures.push(`${pageUrl} references ${assetUrl.href} (${assetResponse.status})`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${slugs.length} live LPs, noindex controls, and first-party assets.`);

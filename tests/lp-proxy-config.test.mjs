import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
const pmOpsOrigin = "https://emc2ops-pm-ops.vercel.app";

function routeFor(source) {
  const route = config.routes.find((candidate) => candidate.src === source);
  assert.ok(route, `missing Vercel route ${source}`);
  return route;
}

test("LP proxy routes target PM Ops and retain the measurement endpoints", () => {
  assert.equal(routeFor("/lp/(.*)").dest, `${pmOpsOrigin}/lp/$1`);
  assert.equal(routeFor("/__manifest/?").dest, `${pmOpsOrigin}/__manifest`);
  assert.equal(routeFor("/api/funnel-event/?").dest, `${pmOpsOrigin}/api/funnel-event`);
});

test("LP proxy allows the current deployed first-party asset set without proxying all site assets", () => {
  const manifestRoute = routeFor("/assets/(manifest-[A-Za-z0-9_-]+\\.js)");
  assert.equal(manifestRoute.dest, `${pmOpsOrigin}/assets/$1`);

  const assetRoute = config.routes.find(
    (candidate) => candidate.src.startsWith("/assets/(entry\\.client-") && candidate.dest === `${pmOpsOrigin}/assets/$1`,
  );
  assert.ok(assetRoute, "missing scoped PM Ops asset proxy route");
  assert.notEqual(assetRoute.src, "/assets/(.*)");

  const covered = new RegExp(`^${assetRoute.src}$`);
  const currentAssets = [
    "/assets/entry.client-Dk0KuByq.js",
    "/assets/jsx-runtime-CGvjSJw6.js",
    "/assets/root-CLjlgIa6.js",
    "/assets/lib-ChiNR1J4.js",
    "/assets/lp._slug-_Qb1yElH.js",
    "/assets/home-CBw0Loct.js",
    "/assets/building-2-CY5AdSoh.js",
    "/assets/wrench-B207yrAV.js",
    "/assets/root-BW2LrLS9.css",
    "/assets/lp-BuVUsHAJ.css",
  ];

  for (const asset of currentAssets) assert.match(asset, covered, `${asset} is not proxied`);
  assert.doesNotMatch(assetRoute.src, /root-CgIbDCBc|root-BJbL__r8/);
});

test("LP responses are protected by noindex headers", () => {
  const headerRule = config.headers.find((candidate) => candidate.source === "/lp/:slug/");
  assert.ok(headerRule, "missing LP header rule");
  const headers = Object.fromEntries(headerRule.headers.map(({ key, value }) => [key.toLowerCase(), value]));

  assert.match(headers["x-robots-tag"], /noindex/i);
  assert.equal(headers["cache-control"], "public, max-age=0, s-maxage=300");
});

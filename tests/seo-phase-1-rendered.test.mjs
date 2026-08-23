import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function htmlFor(route) {
  return fs.readFileSync(path.join("dist", route.replace(/^\//, ""), "index.html"), "utf8");
}

function first(html, pattern) {
  return html.match(pattern)?.[1]?.replace(/&amp;/g, "&").trim() || "";
}

const targets = [
  {
    route: "/use-cases/apartment-lead-tracking/",
    title: "Apartment Lead Tracking for Multifamily Teams | EMC2Ops",
    phrases: ["apartment lead tracking", "multifamily lead tracking"],
    workflow: "apartment-lead-tracking",
    source: "use-case",
  },
  {
    route: "/services/leasing-follow-up/",
    title: "Leasing Lead Automation for Property Managers | EMC2Ops",
    phrases: ["leasing lead automation", "leasing follow-up"],
    workflow: "leasing-follow-up",
    source: "service",
  },
  {
    route: "/use-cases/lead-to-lease-automation/",
    title: "Lead-to-Lease Automation Workflow | EMC2Ops",
    phrases: ["lead-to-lease automation", "lead to lease workflow"],
    workflow: "lead-to-lease-automation",
    source: "use-case",
  },
  {
    route: "/services/missed-call-recovery/",
    title: "Missed-Call Recovery for Property Managers | EMC2Ops",
    phrases: ["apartment call tracking", "missed leasing calls"],
    workflow: "missed-call-recovery",
    source: "service",
  },
  {
    route: "/use-cases/real-estate-crm-follow-up-mess/",
    title: "Real Estate CRM Cleanup for Follow-Up | EMC2Ops",
    phrases: ["real estate crm cleanup", "property management crm cleanup"],
    workflow: "real-estate-crm-follow-up-mess",
    source: "use-case",
  },
  {
    route: "/integrations/buildium/",
    title: "Buildium Workflow Automation Integration | EMC2Ops",
    phrases: ["buildium workflow automation integration"],
    workflow: "buildium",
    source: "integration",
  },
  {
    route: "/integrations/appfolio/",
    title: "AppFolio Workflow Integration | EMC2Ops",
    phrases: ["appfolio workflow integration"],
    workflow: "appfolio",
    source: "integration",
  },
];

for (const target of targets) {
  test(`${target.route} owns its Phase 1 cluster`, () => {
    const html = htmlFor(target.route);
    const title = first(html, /<title>(.*?)<\/title>/s);
    const description = first(html, /<meta name="description" content="(.*?)"/s);
    const visible = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
    assert.equal(title, target.title);
    assert.ok(title.length <= 65, `${target.route} title has ${title.length} characters`);
    assert.ok(description.length <= 160, `${target.route} description has ${description.length} characters`);
    for (const phrase of target.phrases) assert.ok(visible.includes(phrase));
    const heroAuditHref = first(html, /<a class="btn btn-primary" href="([^"]+)">/);
    assert.equal(
      heroAuditHref,
      `/book-demo/?workflow=${target.workflow}&source=${target.source}`,
      `${target.route} preserves workflow/source attribution on its hero CTA`,
    );
  });
}

test("commercial hubs expose the expected structured-data types", () => {
  const cases = [
    ["/services/", "CollectionPage"],
    ["/integrations/", "CollectionPage"],
    ["/book-demo/", "ContactPage"],
  ];
  for (const [route, expectedType] of cases) {
    assert.ok(htmlFor(route).includes(`\"@type\":\"${expectedType}\"`));
  }
});

test("the links page uses existing assets and the booking route", () => {
  const html = htmlFor("/links/");
  assert.ok(html.includes('href="https://www.emc2ops.com/book-demo/"'));
  assert.ok(html.includes('src="/icon-512.png"'));
  assert.ok(html.includes('content="https://www.emc2ops.com/og-image.png"'));
  assert.ok(!html.includes("/links/assets/emc2ops-logo.jpg"));
  assert.ok(!html.includes("/#book"));
});

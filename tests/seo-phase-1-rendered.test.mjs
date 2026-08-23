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
  },
  {
    route: "/services/leasing-follow-up/",
    title: "Leasing Lead Automation for Property Managers | EMC2Ops",
    phrases: ["leasing lead automation", "leasing follow-up"],
  },
  {
    route: "/use-cases/lead-to-lease-automation/",
    title: "Lead-to-Lease Automation Workflow | EMC2Ops",
    phrases: ["lead-to-lease automation", "lead to lease workflow"],
  },
  {
    route: "/services/missed-call-recovery/",
    title: "Missed-Call Recovery for Property Managers | EMC2Ops",
    phrases: ["apartment call tracking", "missed leasing calls"],
  },
  {
    route: "/use-cases/real-estate-crm-follow-up-mess/",
    title: "Real Estate CRM Cleanup for Follow-Up | EMC2Ops",
    phrases: ["real estate crm cleanup", "property management crm cleanup"],
  },
  {
    route: "/integrations/buildium/",
    title: "Buildium Workflow Automation Integration | EMC2Ops",
    phrases: ["buildium workflow automation integration"],
  },
  {
    route: "/integrations/appfolio/",
    title: "AppFolio Workflow Integration | EMC2Ops",
    phrases: ["appfolio workflow integration"],
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
  });
}

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const querySet = JSON.parse(fs.readFileSync("docs/llm-visibility-phase-1-query-set.json", "utf8"));

test("every Phase 1 AI visibility prompt is brand-neutral", () => {
  assert.ok(querySet.queries.length >= 5);
  for (const item of querySet.queries) {
    assert.doesNotMatch(item.query, /emc\s*2\s*ops|emc2ops\.com/i);
    assert.ok(item.tags.includes("brand-neutral"));
    assert.equal(item.mode, "unpromptedOrganicVisibility");
  }
});

test("the run protocol measures unprompted mentions and evidence", () => {
  for (const field of [
    "query",
    "appeared",
    "mentionContext",
    "citedEmc2OpsUrls",
    "citedThirdPartyUrls",
    "competitorsMentioned",
    "rawAnswer"
  ]) {
    assert.ok(querySet.runProtocol.captureResultFields.includes(field));
  }
  assert.equal(querySet.runProtocol.unpromptedBrandMeasurement, true);
});

test("organic visibility and brand-explicit audits are separate machine-readable modes", () => {
  const modes = querySet.runProtocol.modes;
  assert.ok(modes);
  assert.deepEqual(modes.unpromptedOrganicVisibility, {
    promptPolicy: "brand-neutral",
    countInOrganicVisibility: true,
    outputNamespace: "organic",
    outputDirectory: "outputs/llm-visibility-phase-1/organic"
  });
  assert.deepEqual(modes.brandExplicitSiteAudit, {
    promptPolicy: "brand-explicit",
    countInOrganicVisibility: false,
    outputNamespace: "brand-explicit-site-audit",
    outputDirectory: "outputs/llm-visibility-phase-1/brand-explicit-site-audit"
  });
  assert.notEqual(
    modes.unpromptedOrganicVisibility.outputDirectory,
    modes.brandExplicitSiteAudit.outputDirectory
  );
  assert.ok(querySet.runProtocol.rules.some((rule) => /brand-explicit.*excluded from organic visibility/i.test(rule)));
});

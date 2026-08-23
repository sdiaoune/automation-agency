import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const querySet = JSON.parse(fs.readFileSync("docs/llm-visibility-phase-1-query-set.json", "utf8"));

test("every Phase 1 AI visibility prompt is brand-neutral", () => {
  assert.ok(querySet.queries.length >= 5);
  for (const item of querySet.queries) {
    assert.doesNotMatch(item.query, /emc\s*2\s*ops|emc2ops\.com/i);
    assert.ok(item.tags.includes("brand-neutral"));
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

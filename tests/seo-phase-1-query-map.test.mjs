import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const targets = JSON.parse(fs.readFileSync("docs/seo/phase-1-query-map.json", "utf8"));

test("every Phase 1 cluster owns one unique existing canonical page", () => {
  assert.equal(targets.length, 7);
  const canonicalUrls = targets.map((target) => target.canonicalUrl);
  assert.equal(new Set(canonicalUrls).size, canonicalUrls.length);
  for (const target of targets) {
    assert.match(target.canonicalUrl, /^\/(services|use-cases|integrations)\/[a-z0-9-]+\/$/);
    assert.equal(target.action, "optimize-existing");
    assert.ok(["high", "medium-high"].includes(target.intentTier));
    assert.ok(target.candidateQueries.length >= 1);
    assert.ok(["gsc", "gsc-or-fan-out"].includes(target.evidence));
  }
});

test("supporting URLs never claim canonical ownership", () => {
  const canonicalUrls = new Set(targets.map((target) => target.canonicalUrl));
  for (const target of targets) {
    for (const supportingUrl of target.supportingUrls) {
      assert.ok(!canonicalUrls.has(supportingUrl));
      assert.match(supportingUrl, /^\/blog\/[a-z0-9-]+\/$/);
    }
  }
});

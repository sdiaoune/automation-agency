# EMC2Ops X Editorial Portfolio Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace all 264 unpublished standard X posts with a verified editorial portfolio in a sharp operator voice while preserving the live three-posts-per-day schedule and publishing history.

**Architecture:** Four chronological 66-post batch files hold approved copy and metadata. A dependency-free Node module validates batches and the full history, reports similarity risks, applies copy only to ready rows, and regenerates the existing CSV atomically. The X LaunchAgent stays unloaded; final scheduler verification uses temporary queue files.

**Tech Stack:** Node.js ESM, built-in node:test, JSON, CSV, macOS launchctl, existing X scheduler scripts.

## Global Constraints

- Modify only the 264 rows whose status is ready_to_schedule.
- Preserve tweet numbers, Eastern and UTC schedules, statuses, IDs, attempt/error history, and every posted/skipped row.
- Preserve the 8:55 AM, 12:45 PM, and 5:55 PM America/New_York cadence.
- Keep blog and news-cycle promotion outside this standard queue.
- Use a sharp operator voice: practical, opinionated, conversational, and minimally promotional.
- Allocate exactly 211 insight posts, 40 conversation posts, and 13 soft promotions.
- Allocate exactly 48 leasing, 36 maintenance/resident, 42 workflow/handoff, 30 owner/vendor, 30 CRM/PMS, 24 team/escalation, 24 metrics/economics, and 30 contrarian/myth posts.
- Use no fabricated stories, unsupported statistics, hashtags, emojis, generic motivation, political framing, legal advice, or unverified capability claims.
- Keep every tweet at 280 characters or fewer.
- Permit “our AI” no more than three times and “we build” no more than three times.
- Require unique normalized tweets and openings, no adjacent matching pillar or format, and manual resolution of similarity flags.
- Keep com.emc2ops.property-ai-tweet-scheduler unloaded while credits are unavailable.
- Never publish, force-post, buy credits, change billing, or expose OAuth material.

## File Structure

- Create scripts/x-editorial-portfolio.mjs for validation, reporting, atomic application, and CSV rendering.
- Create tests/x-editorial-portfolio.test.mjs for queue-safety and originality tests.
- Create content/x-editorial-portfolio/2026-07-12/batch-01.json for tweets 37–102.
- Create content/x-editorial-portfolio/2026-07-12/batch-02.json for tweets 103–168.
- Create content/x-editorial-portfolio/2026-07-12/batch-03.json for tweets 169–234.
- Create content/x-editorial-portfolio/2026-07-12/batch-04.json for tweets 235–300.
- Modify outputs/property-management-ai-tweets-30-day-schedule.json only after the portfolio passes.
- Regenerate outputs/property-management-ai-tweets-30-day-schedule.csv atomically.
- Produce disposable review and backup artifacts under /tmp.

---

### Task 1: Build the validator and safe applier

**Files:**
- Create: scripts/x-editorial-portfolio.mjs
- Create: tests/x-editorial-portfolio.test.mjs

**Interfaces:**
- Exports normalizeText(text), openingKey(text), cosineSimilarity(a, b), bigramJaccard(a, b), validateBatch(batch, expectations), validatePortfolio(historyRows, candidateRows), applyPortfolio(schedule, candidateRows, editorialVersion), and renderCsv(rows).
- CLI:
  - node scripts/x-editorial-portfolio.mjs --check-batch FILE --batch-number N
  - node scripts/x-editorial-portfolio.mjs --check-portfolio DIRECTORY --schedule FILE --report FILE
  - node scripts/x-editorial-portfolio.mjs --apply DIRECTORY --schedule FILE --csv FILE --backup-dir DIRECTORY

- [ ] **Step 1: Write failing unit and integration tests**

Create tests/x-editorial-portfolio.test.mjs:

~~~js
import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeText, openingKey, cosineSimilarity, bigramJaccard,
  validateBatch, validatePortfolio, applyPortfolio, renderCsv,
} from "../scripts/x-editorial-portfolio.mjs";

test("normalization and opening keys ignore punctuation and case", () => {
  assert.equal(normalizeText("Fast follow-up, clean handoff."), "fast follow up clean handoff");
  assert.equal(openingKey("A clean queue wins. The rest is noise."), "a clean queue wins");
});

test("similarity metrics flag close editorial variants", () => {
  const a = "A leasing lead without an owner is already going stale";
  const b = "A leasing inquiry without a clear owner is already becoming stale";
  assert.ok(cosineSimilarity(a, b) >= 0.78 || bigramJaccard(a, b) >= 0.55);
});

test("batch validation rejects repeated shape and long copy", () => {
  const batch = { batch: 1, rows: [
    { tweet_number: 37, text: "Same opening. One.", content_pillar: "Leasing response and conversion", content_format: "Sharp one-line observation", content_intent: "insight" },
    { tweet_number: 38, text: "Same opening. " + "x".repeat(300), content_pillar: "Leasing response and conversion", content_format: "Sharp one-line observation", content_intent: "conversation" },
  ] };
  const errors = validateBatch(batch, { first: 37, last: 38, count: 2, pillars: {}, intents: {} });
  assert.ok(errors.some((value) => value.includes("opening")));
  assert.ok(errors.some((value) => value.includes("adjacent pillar")));
  assert.ok(errors.some((value) => value.includes("adjacent format")));
  assert.ok(errors.some((value) => value.includes("280")));
});

test("portfolio validation compares candidates with posted history", () => {
  const history = [{ tweet_number: 1, status: "posted", text: "Voicemail is not a leasing strategy." }];
  const candidates = [{ tweet_number: 37, text: "Voicemail is not a leasing strategy.", content_pillar: "Contrarian takes and industry myths", content_format: "Contrarian take", content_intent: "insight" }];
  assert.ok(validatePortfolio(history, candidates).errors.some((value) => value.includes("duplicate")));
});

test("application preserves operational fields", () => {
  const schedule = { rows: [
    { tweet_number: 1, status: "posted", text: "Keep me" },
    { tweet_number: 37, status: "ready_to_schedule", text: "Replace me", attempts: 4 },
  ] };
  const candidates = [{ tweet_number: 37, text: "A queue needs an owner, not another reminder.", content_pillar: "Workflow design and handoffs", content_format: "Sharp one-line observation", content_intent: "insight" }];
  const applied = applyPortfolio(schedule, candidates, "x-editorial-v1-2026-07-12");
  assert.deepEqual(applied.rows[0], schedule.rows[0]);
  assert.equal(applied.rows[1].attempts, 4);
  assert.equal(applied.rows[1].text, candidates[0].text);
  assert.equal(applied.rows[1].editorial_version, "x-editorial-v1-2026-07-12");
});

test("CSV renderer preserves the six-column scheduler schema", () => {
  const csv = renderCsv([{ tweet_number: 37, scheduled_at_eastern: "2026-07-13T08:55:00-04:00", scheduled_at_utc: "2026-07-13T12:55:00.000Z", status: "ready_to_schedule", tweet_id: "", text: "Useful, specific copy." }]);
  assert.match(csv, /^tweet_number,scheduled_at_eastern,scheduled_at_utc,status,tweet_id,text/);
});
~~~

- [ ] **Step 2: Run tests and confirm red state**

Run: node --test tests/x-editorial-portfolio.test.mjs

Expected: FAIL with ERR_MODULE_NOT_FOUND for scripts/x-editorial-portfolio.mjs.

- [ ] **Step 3: Implement constants, validation, reporting, application, and CLI**

The module must define:

~~~js
export const EDITORIAL_VERSION = "x-editorial-v1-2026-07-12";
export const PILLARS = [
  "Leasing response and conversion",
  "Maintenance and resident operations",
  "Workflow design and handoffs",
  "Owner and vendor coordination",
  "CRM/PMS data discipline",
  "Team capacity and human escalation",
  "Operational metrics and economics",
  "Contrarian takes and industry myths",
];
export const FORMATS = [
  "Sharp one-line observation", "Contrarian take", "Diagnostic question",
  "Micro-checklist", "Before-and-after contrast", "Workflow teardown",
  "Rule of thumb", "If/then operating rule", "Short scenario",
  "Myth and reframe", "Mini-framework", "Cost or bottleneck lens",
];
export const INTENTS = ["insight", "conversation", "soft_promotion"];
export const BATCH_EXPECTATIONS = {
  1: { first: 37, last: 102, count: 66, pillars: [12,9,11,8,7,6,6,7], intents: [53,10,3] },
  2: { first: 103, last: 168, count: 66, pillars: [12,9,10,7,8,6,6,8], intents: [53,10,3] },
  3: { first: 169, last: 234, count: 66, pillars: [12,9,11,8,7,6,6,7], intents: [53,10,3] },
  4: { first: 235, last: 300, count: 66, pillars: [12,9,10,7,8,6,6,8], intents: [52,10,4] },
};
~~~

Required behavior:

- Normalize by lowercasing, removing punctuation, and collapsing whitespace.
- Define opening as the first sentence or first 12 normalized tokens, whichever is shorter.
- Exclude a fixed local stopword set from cosine comparison.
- Flag cosine similarity at least 0.78 or bigram Jaccard at least 0.55.
- Validate contiguous tweet numbers, exact allocations, enum membership, length, uniqueness, and adjacency.
- Report trigrams used more than four times and bigrams used more than 12 times.
- Refuse application unless there are 264 candidates, zero errors, and zero unresolved similarity flags.
- Deep-clone the schedule and change only text plus content_pillar, content_format, content_intent, and editorial_version on ready rows.
- Back up both live files and use 0600 temp files plus atomic rename.
- Never read OAuth state or invoke a posting script.

- [ ] **Step 4: Run tests and confirm green state**

Run: node --test tests/x-editorial-portfolio.test.mjs

Expected: PASS, 6 tests, 0 failures.

- [ ] **Step 5: Commit**

Run:
git add scripts/x-editorial-portfolio.mjs tests/x-editorial-portfolio.test.mjs
git commit -m "Add X editorial portfolio validator"

---

### Task 2: Write and review batch 1

**Files:**
- Create: content/x-editorial-portfolio/2026-07-12/batch-01.json

**Interfaces:**
- Produces JSON object with batch 1 and 66 rows covering tweet numbers 37–102.
- Pillar counts in PILLARS order: 12, 9, 11, 8, 7, 6, 6, 7.
- Intent counts: 53 insight, 10 conversation, 3 soft promotion.

- [ ] **Step 1: Write all 66 rows**

Each row uses this exact schema:

~~~json
{
  "tweet_number": 37,
  "text": "The first leasing response should answer one question: what happens next?",
  "content_pillar": "Leasing response and conversion",
  "content_format": "Sharp one-line observation",
  "content_intent": "insight"
}
~~~

Rotate formats and pillars. Conversation rows must invite real operator experience. The three promotions need distinct, contextual invitations.

- [ ] **Step 2: Validate**

Run: node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-01.json --batch-number 1

Expected: Batch 1 valid: 66 posts; pillars and intents match.

- [ ] **Step 3: Manually read every row**

Run:
jq -r '.rows[] | "\(.tweet_number) [\(.content_pillar)] [\(.content_format)] [\(.content_intent)]\n\(.text)\n"' content/x-editorial-portfolio/2026-07-12/batch-01.json

Rewrite generic, company-centered, interchangeable, invented, or structurally repeated copy.

- [ ] **Step 4: Revalidate and commit**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-01.json --batch-number 1
git add content/x-editorial-portfolio/2026-07-12/batch-01.json
git commit -m "Add first X editorial portfolio batch"

---

### Task 3: Write and review batch 2

**Files:**
- Create: content/x-editorial-portfolio/2026-07-12/batch-02.json

**Interfaces:**
- Covers tweet numbers 103–168.
- Pillar counts: 12, 9, 10, 7, 8, 6, 6, 8.
- Intent counts: 53 insight, 10 conversation, 3 soft promotion.

- [ ] **Step 1: Write all 66 rows**

Use the Task 2 schema without reusing its hooks, sentence frames, questions, lists, or promotional invitations. Emphasize maintenance triage, handoff ownership, clean records, vendor coordination, and escalation judgment.

- [ ] **Step 2: Validate and read every row**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-02.json --batch-number 2
jq -r '.rows[] | "\(.tweet_number) [\(.content_pillar)] [\(.content_format)] [\(.content_intent)]\n\(.text)\n"' content/x-editorial-portfolio/2026-07-12/batch-02.json

Expected: 66 valid rows followed by the complete editorial listing.

- [ ] **Step 3: Revise, revalidate, and commit**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-02.json --batch-number 2
git add content/x-editorial-portfolio/2026-07-12/batch-02.json
git commit -m "Add second X editorial portfolio batch"

---

### Task 4: Write and review batch 3

**Files:**
- Create: content/x-editorial-portfolio/2026-07-12/batch-03.json

**Interfaces:**
- Covers tweet numbers 169–234.
- Pillar counts: 12, 9, 11, 8, 7, 6, 6, 7.
- Intent counts: 53 insight, 10 conversation, 3 soft promotion.

- [ ] **Step 1: Write all 66 rows**

Emphasize measurement, queue design, exception paths, owner/vendor visibility, lead-stage integrity, and automation limits. Keep examples concrete without inventing results.

- [ ] **Step 2: Validate and read every row**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-03.json --batch-number 3
jq -r '.rows[] | "\(.tweet_number) [\(.content_pillar)] [\(.content_format)] [\(.content_intent)]\n\(.text)\n"' content/x-editorial-portfolio/2026-07-12/batch-03.json

Expected: 66 valid rows followed by the complete editorial listing.

- [ ] **Step 3: Revise, revalidate, and commit**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-03.json --batch-number 3
git add content/x-editorial-portfolio/2026-07-12/batch-03.json
git commit -m "Add third X editorial portfolio batch"

---

### Task 5: Write and review batch 4

**Files:**
- Create: content/x-editorial-portfolio/2026-07-12/batch-04.json

**Interfaces:**
- Covers tweet numbers 235–300.
- Pillar counts: 12, 9, 10, 7, 8, 6, 6, 8.
- Intent counts: 52 insight, 10 conversation, 4 soft promotion.

- [ ] **Step 1: Write all 66 rows**

Use fresh angles on team capacity, human escalation, operating economics, contrarian myths, and system discipline. The final four promotions must remain distinct from the nine earlier promotions.

- [ ] **Step 2: Validate and read every row**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-04.json --batch-number 4
jq -r '.rows[] | "\(.tweet_number) [\(.content_pillar)] [\(.content_format)] [\(.content_intent)]\n\(.text)\n"' content/x-editorial-portfolio/2026-07-12/batch-04.json

Expected: 66 valid rows followed by the complete editorial listing.

- [ ] **Step 3: Revise, revalidate, and commit**

Run:
node scripts/x-editorial-portfolio.mjs --check-batch content/x-editorial-portfolio/2026-07-12/batch-04.json --batch-number 4
git add content/x-editorial-portfolio/2026-07-12/batch-04.json
git commit -m "Add final X editorial portfolio batch"

---

### Task 6: Resolve full-history originality risks

**Files:**
- Modify as needed: all four batch JSON files.
- Produce: /tmp/x-editorial-portfolio-review-2026-07-12.json

**Interfaces:**
- Consumes all batches and the current 300-row schedule.
- Produces zero errors and zero unresolved similarity flags.

- [ ] **Step 1: Run the portfolio audit**

Run:
node scripts/x-editorial-portfolio.mjs --check-portfolio content/x-editorial-portfolio/2026-07-12 --schedule outputs/property-management-ai-tweets-30-day-schedule.json --report /tmp/x-editorial-portfolio-review-2026-07-12.json

Expected initial result: clean, or a nonzero exit naming exact tweet-number pairs and phrase/allocation/adjacency problems.

- [ ] **Step 2: Inspect and resolve every flag**

Run:
jq '{errors, warnings, phraseReport, similarityFlags}' /tmp/x-editorial-portfolio-review-2026-07-12.json

Rewrite one tweet in every materially repetitive pair. Rewrite templated trigrams above four uses and templated bigrams above 12 uses. Necessary industry terms may remain only when the surrounding idea and structure are distinct.

- [ ] **Step 3: Re-run to green**

Expected: Portfolio valid: 264 candidates; 0 errors; 0 unresolved similarity flags.

- [ ] **Step 4: Run validator tests**

Run: node --test tests/x-editorial-portfolio.test.mjs

Expected: PASS, 0 failures.

- [ ] **Step 5: Commit revisions if files changed**

Run:
git add content/x-editorial-portfolio/2026-07-12/batch-*.json
git commit -m "Polish X editorial portfolio originality"

Skip this commit if the audit required no changes.

---

### Task 7: Apply and verify the live queue

**Files:**
- Modify: outputs/property-management-ai-tweets-30-day-schedule.json
- Modify: outputs/property-management-ai-tweets-30-day-schedule.csv
- Produce: /tmp/x-editorial-portfolio-backup-2026-07-12/

**Interfaces:**
- Consumes the validated portfolio and live queue.
- Produces a rewritten 300-row JSON queue and exact six-column CSV mirror.

- [ ] **Step 1: Verify operational preconditions**

Run:

~~~sh
test ! -e outputs/property-management-ai-tweets-scheduler.lock
! launchctl print gui/$(id -u)/com.emc2ops.property-ai-tweet-scheduler
jq -e '[.rows[] | select(.status=="posted")] | length == 33' outputs/property-management-ai-tweets-30-day-schedule.json
jq -e '[.rows[] | select(.status=="skipped")] | length == 3' outputs/property-management-ai-tweets-30-day-schedule.json
jq -e '[.rows[] | select(.status=="ready_to_schedule")] | length == 264' outputs/property-management-ai-tweets-30-day-schedule.json
~~~

Expected: all assertions pass and the LaunchAgent lookup fails because it is unloaded.

- [ ] **Step 2: Hash independent automations and apply atomically**

Run:

~~~sh
shasum -a 256 "$HOME/.codex/automations/daily-emc2ops-blog-post/automation.toml" "$HOME/.codex/automations/daily-emc2ops-news-cycle-blog-post/automation.toml" > /tmp/x-editorial-blog-automation-hashes.before
node scripts/x-editorial-portfolio.mjs --apply content/x-editorial-portfolio/2026-07-12 --schedule outputs/property-management-ai-tweets-30-day-schedule.json --csv outputs/property-management-ai-tweets-30-day-schedule.csv --backup-dir /tmp/x-editorial-portfolio-backup-2026-07-12
~~~

Expected: Applied 264 editorial posts; live schedule and CSV updated atomically.

- [ ] **Step 3: Run fresh queue verification**

Run:

~~~sh
node scripts/x-editorial-portfolio.mjs --check-portfolio content/x-editorial-portfolio/2026-07-12 --schedule outputs/property-management-ai-tweets-30-day-schedule.json --report /tmp/x-editorial-portfolio-review-2026-07-12.json
jq -e '.rows | length == 300' outputs/property-management-ai-tweets-30-day-schedule.json
jq -e '[.rows[] | select(.status=="ready_to_schedule" and (.text|length)>280)] | length == 0' outputs/property-management-ai-tweets-30-day-schedule.json
jq -e '[.rows[] | select(.status=="ready_to_schedule" and ((.content_pillar==null) or (.content_format==null) or (.content_intent==null) or (.editorial_version!="x-editorial-v1-2026-07-12")))] | length == 0' outputs/property-management-ai-tweets-30-day-schedule.json
~~~

Expected: portfolio valid, 300 rows, zero overlength copy, and complete metadata.

- [ ] **Step 4: Verify independent automations and publisher state**

Run:

~~~sh
shasum -a 256 "$HOME/.codex/automations/daily-emc2ops-blog-post/automation.toml" "$HOME/.codex/automations/daily-emc2ops-news-cycle-blog-post/automation.toml" > /tmp/x-editorial-blog-automation-hashes.after
cmp /tmp/x-editorial-blog-automation-hashes.before /tmp/x-editorial-blog-automation-hashes.after
! launchctl print gui/$(id -u)/com.emc2ops.property-ai-tweet-scheduler
~~~

Expected: hashes match and X LaunchAgent remains unloaded.

- [ ] **Step 5: Dry-run temporary copies only**

Run:

~~~sh
mkdir -p /tmp/x-editorial-dry-run
cp outputs/property-management-ai-tweets-30-day-schedule.json /tmp/x-editorial-dry-run/schedule.json
cp outputs/property-management-ai-tweets-30-day-schedule.csv /tmp/x-editorial-dry-run/schedule.csv
X_TWEET_SCHEDULE_PATH=/tmp/x-editorial-dry-run/schedule.json X_TWEET_SCHEDULE_CSV_PATH=/tmp/x-editorial-dry-run/schedule.csv X_TWEET_SCHEDULE_LOCK_PATH=/tmp/x-editorial-dry-run/scheduler.lock node scripts/run-scheduled-x-posts.mjs --dry-run
~~~

Expected: no due X posts or one Dry run due tweet line. No network request and no live-file mutation.

- [ ] **Step 6: Compare with the backup**

Run a Node assertion comparing every non-ready row in full and every ready-row field except text, content_pillar, content_format, content_intent, and editorial_version.

Expected: Operational fields preserved for all 300 rows.

- [ ] **Step 7: Report without enabling publishing**

Report allocations, originality checks, first and last schedule timestamps, backup path, credit blocker, and that no post was published. Do not bootstrap the LaunchAgent until credits are restored and restoration testing is separately authorized.


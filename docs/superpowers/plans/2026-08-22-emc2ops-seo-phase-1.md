# EMC2Ops SEO Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the existing EMC2Ops pages already earning Google impressions by consolidating search intent, strengthening snippets and internal links, repairing high-confidence technical issues, and turning qualified organic demand into measurable profitable pipeline.

**Architecture:** Keep one commercial page per intent cluster and treat the remaining phrases as supporting language that may include ordinary query reformulations or AI-feature query fan-out. Store the ownership map as data, validate the rendered site after Astro builds it, and keep deployment and post-deployment measurement behind explicit review gates.

**Tech Stack:** Astro 6, TypeScript content data, Markdown blog content, Node.js test runner, Playwright, JSON-LD, Google Ads `gtag`, Vercel Analytics.

**Spec:** `docs/superpowers/specs/2026-08-22-emc2ops-seo-phase-1-spec.md`

## Global Constraints

- Preserve all pre-existing user changes; the worktree is already dirty and several Phase 1 target files are modified.
- Before implementation, checkpoint or explicitly reconcile the existing edits in every target file. Never stage unrelated files.
- Do not create a standalone page solely because a candidate query appeared in Search Console.
- Do not redirect, delete, canonicalize elsewhere, or `noindex` an existing page in Phase 1.
- Do not fabricate customer outcomes, supported integrations, rankings, pricing, or performance guarantees.
- Rendered titles must be at most 65 characters and descriptions at most 160 characters.
- AI visibility prompts must be brand-neutral so they measure whether EMC2Ops is mentioned without prompting; retain each prompt and raw answer.
- Never count a brand-explicit site-audit prompt as organic AI mention visibility.
- Prioritize commercial-intent pages and qualified pipeline over raw traffic; clicks and impressions are leading indicators, not the profitability goal.
- Do not set a numeric CAC or margin threshold until actual project revenue and delivery-cost data are recorded.
- Preserve existing booking attribution fields (`workflow`, `source`, `pageUrl`, and `portfolioSize`); do not change booking storage schemas in Phase 1.
- Do not deploy without a separate founder approval after preview and validation.

---

## File map

**Create**

- `docs/seo/phase-1-baseline.md` — frozen GSC baseline, target cohort, and rollout dates.
- `docs/seo/phase-1-query-map.json` — one canonical page per intent cluster and the supporting URLs.
- `docs/seo/phase-1-profitability-scorecard.md` — buyer-intent, sales-outcome, cost, and contribution-margin definitions.
- `tests/seo-phase-1-query-map.test.mjs` — validates uniqueness and the no-new-page fan-out rule.
- `tests/seo-phase-1-rendered.test.mjs` — validates rendered titles, descriptions, phrases, links, schema, and `/links/` repair.
- `scripts/validate-live-lp-assets.mjs` — checks rewritten LP noindex headers/meta and first-party assets.
- `docs/llm-visibility-phase-1-query-set.json` — brand-neutral buyer prompts for unprompted EMC2Ops mention measurement.
- `tests/llm-visibility-phase-1-query-set.test.mjs` — prevents the benchmark from seeding EMC2Ops into visibility prompts.

**Modify**

- `package.json` — add Phase 1 SEO, AI-visibility, and live LP validation scripts.
- `src/lib/useCases.ts` — refine apartment lead tracking, lead-to-lease, and CRM cleanup targets.
- `src/lib/services.ts` — refine leasing lead automation and apartment call tracking coverage.
- `src/lib/integrations.ts` — refine AppFolio and Buildium workflow-integration coverage.
- `src/content/blog/apartment-lead-tracking.md` — convert the exact-keyword overlap into an educational supporting guide and pass preflight.
- Selected files under `src/content/blog/` — add contextual links to their canonical commercial target.
- `scripts/content-preflight.mjs` — reserve the five additional GSC-discovered commercial query families.
- `src/lib/site.ts` — allow `ContactPage` in `standardPageSchema`.
- `src/pages/services/index.astro` — add collection schema.
- `src/pages/integrations/index.astro` — add collection schema.
- `src/pages/book-demo.astro` — add contact-page schema.
- `public/links/index.html` — use existing public images and the real booking route.
- `tests/public-site.spec.js` — verify booking funnel events and source context.

---

### Task 1: Reconcile the dirty worktree and freeze the baseline

**Files:**

- Create: `docs/seo/phase-1-baseline.md`

**Interfaces:**

- Consumes: the current user-owned worktree and the GSC snapshot in the specification.
- Produces: a reviewed starting state and rollout record used by Tasks 2–8.

- [ ] **Step 1: Inspect overlapping user changes**

Run:

```bash
git status --short
git diff -- src/lib/useCases.ts src/lib/services.ts src/lib/integrations.ts \
  src/content/blog/apartment-lead-tracking.md scripts/content-preflight.mjs \
  src/pages/services/index.astro src/pages/integrations/index.astro \
  src/pages/book-demo.astro src/components/AuditBookingSection.astro \
  public/links/index.html tests/public-site.spec.js package.json
```

Expected: the command exposes existing edits in several target files. Review them as user-owned work; do not overwrite or stage them implicitly.

- [ ] **Step 2: Establish the execution checkpoint**

Before any source patch, record one of these states in the baseline document:

```markdown
## Execution checkpoint

- Repository: `/Users/diaoune/automation-agency`
- Starting commit: `4ceba1daf8c5ae5ed671f10b80b3457a6f410fd3`
- Existing target-file changes reviewed: yes
- Execution location: current worktree with narrow patches
- Deployment authorized: no
```

The plan-authoring commit is recorded above. If execution begins from a different commit, replace that value with the exact `git rev-parse HEAD` output before editing. If the existing target-file changes cannot be distinguished from planned work, stop implementation and ask the founder to checkpoint them.

- [ ] **Step 3: Write the frozen baseline**

Create `docs/seo/phase-1-baseline.md` with:

```markdown
# EMC2Ops SEO Phase 1 Baseline

## Search Console baseline

- Period: 2026-07-24 through 2026-08-20
- Clicks: 2
- Impressions: 1,982
- CTR: 0.1%
- Average position: 25.7

## Priority cohort

- /use-cases/apartment-lead-tracking/
- /services/leasing-follow-up/
- /use-cases/lead-to-lease-automation/
- /services/missed-call-recovery/
- /use-cases/real-estate-crm-follow-up-mess/
- /integrations/buildium/
- /integrations/appfolio/

## Measurement dates

- Deployment date: not deployed
- 7-day review: not scheduled
- 14-day review: not scheduled
- 28-day review: not scheduled

## Interpretation rule

Observed query variants may be conventional reformulations, Search Console query-group members, or generative-AI query fan-out. They inform cluster language but do not independently justify new pages.
```

Append the execution checkpoint from Step 2.

- [ ] **Step 4: Verify only the baseline document is staged**

Run:

```bash
git diff -- docs/seo/phase-1-baseline.md
git status --short docs/seo/phase-1-baseline.md
```

Expected: one new baseline file and no modifications to source code from this task.

- [ ] **Step 5: Commit the baseline only after the checkpoint is approved**

```bash
git add docs/seo/phase-1-baseline.md
git commit -m "docs: freeze SEO phase one baseline"
```

---

### Task 2: Encode one canonical page per intent cluster

**Files:**

- Create: `docs/seo/phase-1-query-map.json`
- Create: `tests/seo-phase-1-query-map.test.mjs`
- Modify: `package.json`

**Interfaces:**

- Consumes: the seven clusters in the specification.
- Produces: a machine-checked ownership map used by content and post-deployment analysis.

- [ ] **Step 1: Write the query-map test**

Create `tests/seo-phase-1-query-map.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and verify it fails because the map is absent**

Run:

```bash
node --test tests/seo-phase-1-query-map.test.mjs
```

Expected: FAIL with `ENOENT` for `docs/seo/phase-1-query-map.json`.

- [ ] **Step 3: Create the query map**

Create `docs/seo/phase-1-query-map.json`:

```json
[
  {
    "id": "apartment-lead-tracking",
    "candidateQueries": ["apartment lead tracking", "multifamily lead tracking"],
    "canonicalUrl": "/use-cases/apartment-lead-tracking/",
    "supportingUrls": ["/blog/apartment-lead-tracking/"],
    "intentTier": "medium-high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  },
  {
    "id": "leasing-lead-automation",
    "candidateQueries": ["leasing lead automation", "leasing follow-up automation"],
    "canonicalUrl": "/services/leasing-follow-up/",
    "supportingUrls": ["/blog/ai-leasing-follow-up-property-management/", "/blog/automate-property-management-lead-follow-up/"],
    "intentTier": "high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  },
  {
    "id": "lead-to-lease",
    "candidateQueries": ["lead-to-lease automation", "lead to lease workflow"],
    "canonicalUrl": "/use-cases/lead-to-lease-automation/",
    "supportingUrls": ["/blog/property-management-post-tour-follow-up-automation/", "/blog/buildium-tour-to-application-workflow/"],
    "intentTier": "medium-high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  },
  {
    "id": "apartment-call-tracking",
    "candidateQueries": ["apartment call tracking", "leasing call routing"],
    "canonicalUrl": "/services/missed-call-recovery/",
    "supportingUrls": ["/blog/property-management-leasing-call-routing-automation/", "/blog/missed-leasing-calls-property-management/"],
    "intentTier": "high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  },
  {
    "id": "crm-cleanup",
    "candidateQueries": ["real estate CRM cleanup", "property management CRM cleanup", "messy pipeline stages"],
    "canonicalUrl": "/use-cases/real-estate-crm-follow-up-mess/",
    "supportingUrls": ["/blog/property-management-crm-workflow-automation/", "/blog/property-management-lead-deduplication-routing/"],
    "intentTier": "high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  },
  {
    "id": "buildium-workflow-integration",
    "candidateQueries": ["Buildium workflow automation integration"],
    "canonicalUrl": "/integrations/buildium/",
    "supportingUrls": ["/blog/buildium-leasing-follow-up-workflow/", "/blog/buildium-maintenance-intake-workflow/"],
    "intentTier": "high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  },
  {
    "id": "appfolio-workflow-integration",
    "candidateQueries": ["AppFolio workflow integration"],
    "canonicalUrl": "/integrations/appfolio/",
    "supportingUrls": ["/blog/appfolio-claude-property-management-workflows/"],
    "intentTier": "high",
    "evidence": "gsc-or-fan-out",
    "action": "optimize-existing"
  }
]
```

- [ ] **Step 4: Add the validation script**

Add this package script without changing other existing scripts:

```json
"test:seo-query-map": "node --test tests/seo-phase-1-query-map.test.mjs"
```

- [ ] **Step 5: Run the test**

Run:

```bash
npm run test:seo-query-map
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit only the query-map files and package-script hunk**

```bash
git add docs/seo/phase-1-query-map.json tests/seo-phase-1-query-map.test.mjs package.json
git commit -m "test: define phase one SEO intent ownership"
```

---

### Task 3: Optimize the seven existing commercial targets

**Files:**

- Create: `tests/seo-phase-1-rendered.test.mjs`
- Modify: `src/lib/useCases.ts`
- Modify: `src/lib/services.ts`
- Modify: `src/lib/integrations.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `docs/seo/phase-1-query-map.json`.
- Produces: distinct, rendered landing pages that cover the cluster language without creating new URLs.

- [ ] **Step 1: Write the rendered-page contract**

Create `tests/seo-phase-1-rendered.test.mjs` with these helpers and targets:

```js
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
    phrases: ["apartment lead tracking", "multifamily lead tracking"]
  },
  {
    route: "/services/leasing-follow-up/",
    title: "Leasing Lead Automation for Property Managers | EMC2Ops",
    phrases: ["leasing lead automation", "leasing follow-up"]
  },
  {
    route: "/use-cases/lead-to-lease-automation/",
    title: "Lead-to-Lease Automation Workflow | EMC2Ops",
    phrases: ["lead-to-lease automation", "lead to lease workflow"]
  },
  {
    route: "/services/missed-call-recovery/",
    title: "Missed-Call Recovery for Property Managers | EMC2Ops",
    phrases: ["apartment call tracking", "missed leasing calls"]
  },
  {
    route: "/use-cases/real-estate-crm-follow-up-mess/",
    title: "Real Estate CRM Cleanup for Follow-Up | EMC2Ops",
    phrases: ["real estate crm cleanup", "property management crm cleanup"]
  },
  {
    route: "/integrations/buildium/",
    title: "Buildium Workflow Automation Integration | EMC2Ops",
    phrases: ["buildium workflow automation integration"]
  },
  {
    route: "/integrations/appfolio/",
    title: "AppFolio Workflow Integration | EMC2Ops",
    phrases: ["appfolio workflow integration"]
  }
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
```

- [ ] **Step 2: Add the rendered contract script**

Add:

```json
"test:seo-phase-1": "npm run build && node --test tests/seo-phase-1-rendered.test.mjs"
```

- [ ] **Step 3: Run the contract and verify the intended failures**

Run:

```bash
npm run test:seo-phase-1
```

Expected: the existing apartment and lead-to-lease targets pass most assertions; leasing, call tracking, CRM cleanup, Buildium, and AppFolio fail their new exact title or phrase contracts.

- [ ] **Step 4: Update the leasing follow-up service**

In the `leasing-follow-up` object in `src/lib/services.ts`, use:

```ts
title: "Leasing lead automation for property managers",
seoTitle: "Leasing Lead Automation for Property Managers",
description:
  "Install leasing lead automation for missed inquiries, stale replies, no-shows, and incomplete applications with CRM updates and human stop rules.",
summary:
  "EMC2Ops installs leasing lead automation that keeps renter follow-up moving after the first inquiry, missed call, tour, no-show, stale reply, or incomplete application.",
```

Keep the existing operational safeguards, stages, metrics, related use cases, and CTA data.

- [ ] **Step 5: Add apartment call tracking language to missed-call recovery**

Keep the current title and add this FAQ to the `missed-call-recovery` object:

```ts
{
  question: "How does apartment call tracking work after a missed leasing call?",
  answer:
    "Apartment call tracking connects the phone event to the renter, property, source, qualification details, staff owner, follow-up status, and CRM outcome instead of leaving the call as an isolated voicemail.",
},
```

Add the phrase `apartment call tracking` once to the summary or audit focus without weakening the primary missed-call-recovery intent.

- [ ] **Step 6: Refine the CRM cleanup use case**

In the `real-estate-crm-follow-up-mess` object in `src/lib/useCases.ts`, replace its primary metadata with:

```ts
primaryKeyword: "real estate CRM cleanup",
clusterKeywords: [
  "property management CRM cleanup",
  "real estate CRM follow-up cleanup",
  "messy real estate CRM",
  "broken pipeline stages",
  "CRM duplicate cleanup",
],
seoTitle: "Real Estate CRM Cleanup for Follow-Up",
h1: "Real estate CRM cleanup for broken follow-up",
description:
  "Clean up real estate CRM stages, duplicates, ownership, notes, tasks, and follow-up rules so property teams can trust the next action.",
```

Retain the existing route slug so no redirect is introduced.

- [ ] **Step 7: Refine Buildium and AppFolio integration targets**

In `src/lib/integrations.ts`, use these exact primary fields:

```ts
// buildium
title: "Buildium workflow automation integration",
seoTitle: "Buildium Workflow Automation Integration",
description:
  "Scope a Buildium workflow automation integration for leasing, maintenance, owner updates, CRM tasks, and supported API or middleware handoffs.",
summary:
  "EMC2Ops maps each Buildium workflow automation integration to verified access, required fields, fallback paths, human approvals, and safe writebacks.",

// appfolio
title: "AppFolio workflow integration",
seoTitle: "AppFolio Workflow Integration",
description:
  "Scope an AppFolio workflow integration for leasing, maintenance, communication, CRM tasks, and safe API, middleware, inbox, or review handoffs.",
summary:
  "EMC2Ops maps each AppFolio workflow integration to the available connection path, required fields, fallback route, and human review gates.",
```

Do not imply direct access until it has been verified for the buyer's account.

- [ ] **Step 8: Confirm the apartment and lead-to-lease pages need only minimal edits**

In `src/lib/useCases.ts`:

- Keep `Apartment Lead Tracking for Multifamily Teams` as the apartment page SEO title.
- Ensure its visible summary or FAQ contains both `apartment lead tracking` and `multifamily lead tracking`.
- Keep `Lead-to-Lease Automation Workflow` as the lead-to-lease SEO title.
- Ensure its visible first summary contains `lead to lease workflow`.

Do not add another apartment or multifamily landing page.

- [ ] **Step 9: Run the rendered contract and SEO validator**

Run:

```bash
npm run test:seo-phase-1
npm run seo:validate
```

Expected: all seven rendered-page tests pass; SEO validation reports no failures. Existing warnings outside the seven-page cohort are recorded but do not expand Phase 1.

- [ ] **Step 10: Commit the target-page changes**

Stage only the Phase 1 hunks after comparing them with the execution checkpoint:

```bash
git add src/lib/useCases.ts src/lib/services.ts src/lib/integrations.ts \
  tests/seo-phase-1-rendered.test.mjs package.json
git diff --cached --check
git commit -m "feat: align priority pages to search intent clusters"
```

---

### Task 4: Separate the apartment guide and reinforce canonical internal links

**Files:**

- Modify: `src/content/blog/apartment-lead-tracking.md`
- Modify: `scripts/content-preflight.mjs`
- Modify: `src/content/blog/automate-property-management-lead-follow-up.md`
- Modify: `src/content/blog/ai-leasing-follow-up-property-management.md`
- Modify: `src/content/blog/property-management-no-show-recovery-automation.md`
- Modify: `src/content/blog/property-management-post-tour-follow-up-automation.md`
- Modify: `src/content/blog/buildium-tour-to-application-workflow.md`
- Modify: `src/content/blog/property-management-leasing-call-routing-automation.md`
- Modify: `src/content/blog/missed-leasing-calls-property-management.md`
- Modify: `src/content/blog/after-hours-leasing-automation.md`
- Modify: `src/content/blog/high-leasing-lead-volume-property-management.md`
- Modify: `src/content/blog/property-management-crm-workflow-automation.md`
- Modify: `src/content/blog/property-management-lead-deduplication-routing.md`
- Modify: `src/content/blog/property-management-stale-lead-reactivation-automation.md`
- Modify: `src/content/blog/property-management-leasing-pipeline-setup.md`

**Interfaces:**

- Consumes: the canonical URLs from the query map.
- Produces: educational support pages that pass relevance to one commercial target without competing for ownership.

- [ ] **Step 1: Confirm the current apartment guide fails preflight**

Run:

```bash
npm run content:preflight -- --slug apartment-lead-tracking
```

Expected failures: no authored internal blog links, missing `socialHook`, missing `socialImage`, and reserved primary keyword ownership.

- [ ] **Step 2: Reposition the apartment guide**

Change its frontmatter to:

```yaml
keyword: "apartment lead tracking workflow"
seoTitle: "Apartment Lead Tracking Workflow Guide"
socialHook: "If apartment lead tracking still depends on separate call logs, ILS alerts, inboxes, and memory, the workflow is the problem—not the number of tools."
socialImage: "/og-image.png"
```

Keep the title educational and keep the direct link to `/use-cases/apartment-lead-tracking/` in the opening answer.

- [ ] **Step 3: Add six useful authored blog links**

Add a short `## Continue the lead-tracking workflow` section that naturally links to all six of these guides:

```markdown
- [Guest-card automation](/blog/property-management-guest-card-automation/)
- [Leasing pipeline setup](/blog/property-management-leasing-pipeline-setup/)
- [Leasing inquiry routing](/blog/property-management-leasing-inquiry-routing-automation/)
- [Stale-lead reactivation](/blog/property-management-stale-lead-reactivation-automation/)
- [Lead deduplication and routing](/blog/property-management-lead-deduplication-routing/)
- [Property management lead follow-up automation](/blog/automate-property-management-lead-follow-up/)
```

- [ ] **Step 4: Extend reserved commercial families**

Add these entries to `reservedFamilies` in `scripts/content-preflight.mjs`:

```js
{
  phrases: ["leasing lead automation", "leasing follow-up automation"],
  target: "/services/leasing-follow-up/",
},
{
  phrases: ["apartment call tracking", "leasing call routing"],
  target: "/services/missed-call-recovery/",
},
{
  phrases: ["real estate crm cleanup", "property management crm cleanup", "crm follow-up cleanup"],
  target: "/use-cases/real-estate-crm-follow-up-mess/",
},
{
  phrases: ["appfolio workflow integration"],
  target: "/integrations/appfolio/",
},
{
  phrases: ["buildium workflow integration", "buildium workflow automation integration"],
  target: "/integrations/buildium/",
},
```

Keep the existing reservations for apartment lead tracking, lead-to-lease, property-management automation, and Buildium integration.

- [ ] **Step 5: Add editorial links for lead-to-lease**

Ensure each of these articles contains one contextual, descriptive link to `/use-cases/lead-to-lease-automation/`:

```text
src/content/blog/automate-property-management-lead-follow-up.md
src/content/blog/ai-leasing-follow-up-property-management.md
src/content/blog/property-management-no-show-recovery-automation.md
src/content/blog/property-management-post-tour-follow-up-automation.md
src/content/blog/buildium-tour-to-application-workflow.md
```

Use anchors such as `lead-to-lease workflow`, `lead-to-lease automation`, or `inquiry-to-move-in workflow`; do not repeat one exact anchor everywhere.

- [ ] **Step 6: Add editorial links for apartment call tracking**

Ensure each article links to `/services/missed-call-recovery/`:

```text
src/content/blog/property-management-leasing-call-routing-automation.md
src/content/blog/missed-leasing-calls-property-management.md
src/content/blog/after-hours-leasing-automation.md
src/content/blog/high-leasing-lead-volume-property-management.md
```

Use anchors that describe missed-call recovery or the call-to-CRM path. Do not claim that EMC2Ops is a call-recording or attribution platform.

- [ ] **Step 7: Add editorial links for CRM cleanup**

Ensure each article links to `/use-cases/real-estate-crm-follow-up-mess/`:

```text
src/content/blog/property-management-crm-workflow-automation.md
src/content/blog/property-management-lead-deduplication-routing.md
src/content/blog/property-management-stale-lead-reactivation-automation.md
src/content/blog/property-management-leasing-pipeline-setup.md
```

Use anchors such as `CRM cleanup workflow`, `clean up broken follow-up`, or `repair CRM ownership and stages`.

- [ ] **Step 8: Validate the guide and build**

Run:

```bash
npm run content:preflight -- --slug apartment-lead-tracking
npm run blog:validate
npm run build
npm run seo:validate
```

Expected: apartment preflight passes with at least 900 body words, at least six authored blog links, `bodySections: true`, a social hook, an existing social image, a non-reserved primary keyword, and a link to the commercial target. Blog and SEO validation pass.

- [ ] **Step 9: Commit the content-cluster changes**

```bash
git add scripts/content-preflight.mjs src/content/blog/apartment-lead-tracking.md \
  src/content/blog/automate-property-management-lead-follow-up.md \
  src/content/blog/ai-leasing-follow-up-property-management.md \
  src/content/blog/property-management-no-show-recovery-automation.md \
  src/content/blog/property-management-post-tour-follow-up-automation.md \
  src/content/blog/buildium-tour-to-application-workflow.md \
  src/content/blog/property-management-leasing-call-routing-automation.md \
  src/content/blog/missed-leasing-calls-property-management.md \
  src/content/blog/after-hours-leasing-automation.md \
  src/content/blog/high-leasing-lead-volume-property-management.md \
  src/content/blog/property-management-crm-workflow-automation.md \
  src/content/blog/property-management-lead-deduplication-routing.md \
  src/content/blog/property-management-stale-lead-reactivation-automation.md \
  src/content/blog/property-management-leasing-pipeline-setup.md
git diff --cached --check
git commit -m "feat: reinforce priority SEO content clusters"
```

---

### Task 5: Repair public technical leaks and validate rewritten landing pages

**Files:**

- Modify: `public/links/index.html`
- Modify: `src/lib/site.ts`
- Modify: `src/pages/services/index.astro`
- Modify: `src/pages/integrations/index.astro`
- Modify: `src/pages/book-demo.astro`
- Create: `scripts/validate-live-lp-assets.mjs`
- Modify: `package.json`
- Modify: `tests/seo-phase-1-rendered.test.mjs`

**Interfaces:**

- Consumes: existing `/og-image.png`, `/icon-512.png`, `standardPageSchema`, and Vercel LP rewrites.
- Produces: valid `/links/` assets and CTA, commercial-hub JSON-LD, and a repeatable LP deployment check.

- [ ] **Step 1: Add failing technical assertions**

Append tests that assert:

```js
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
```

Run `npm run test:seo-phase-1` and verify these new assertions fail.

- [ ] **Step 2: Repair `/links/`**

In `public/links/index.html`:

- replace both social-image URLs with `https://www.emc2ops.com/og-image.png`;
- set the Open Graph dimensions to `1672` by `941`;
- replace the visible logo source with `/icon-512.png`;
- replace `https://www.emc2ops.com/#book` with `https://www.emc2ops.com/book-demo/`.

- [ ] **Step 3: Allow contact-page schema**

Change the `standardPageSchema` type union in `src/lib/site.ts` to:

```ts
type?: "WebPage" | "CollectionPage" | "ContactPage";
```

- [ ] **Step 4: Add schemas to the three hubs**

Import `standardPageSchema` and pass these exact schema calls:

```astro
<!-- src/pages/services/index.astro -->
schema={standardPageSchema({ path: "/services/", name: "Property management automation services", description, type: "CollectionPage" })}

<!-- src/pages/integrations/index.astro -->
schema={standardPageSchema({ path: "/integrations/", name: "Property management automation integrations", description, type: "CollectionPage" })}

<!-- src/pages/book-demo.astro -->
schema={standardPageSchema({ path: "/book-demo/", name: "Book an EMC2Ops consultation", description, type: "ContactPage" })}
```

- [ ] **Step 5: Write the live LP validator**

Create `scripts/validate-live-lp-assets.mjs`:

```js
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
```

- [ ] **Step 6: Add and run the technical scripts**

Add:

```json
"lp:validate-live": "node scripts/validate-live-lp-assets.mjs"
```

Run:

```bash
npm run test:seo-phase-1
npm run lp:validate-live
```

Expected: rendered technical assertions pass. The live validator passes before deployment. If it fails on hashed assets or noindex controls, block deployment and fix the PM Ops/Vercel rewrite atomically; do not merely paste new hashes into `vercel.json` without a deployment-safe strategy.

- [ ] **Step 7: Commit the technical repairs**

```bash
git add public/links/index.html src/lib/site.ts src/pages/services/index.astro \
  src/pages/integrations/index.astro src/pages/book-demo.astro \
  scripts/validate-live-lp-assets.mjs tests/seo-phase-1-rendered.test.mjs package.json
git diff --cached --check
git commit -m "fix: repair SEO hubs and public link routes"
```

---

### Task 6: Verify buyer intent, booking measurement, and profitability attribution

**Files:**

- Modify: `tests/public-site.spec.js`
- Create: `docs/seo/phase-1-profitability-scorecard.md`
- Modify only if the test proves a gap: `src/components/AuditBookingSection.astro`

**Interfaces:**

- Consumes: existing `bookingEvent()` calls, the query parameters produced by `auditHref()`, and the intent tiers in `docs/seo/phase-1-query-map.json`.
- Produces: a tested event sequence with `workflow`, `source`, page URL, portfolio context, and a scorecard that connects qualified demand to contribution profit.

- [ ] **Step 1: Add event capture to the existing booking test**

Before navigating to `/book-demo/`, initialize the data layer:

```js
await page.addInitScript(() => {
  window.dataLayer = [];
});
```

After the booking succeeds, add:

```js
const events = await page.evaluate(() => window.dataLayer
  .map((entry) => Array.from(entry))
  .filter((entry) => entry[0] === "event")
  .map((entry) => ({ name: entry[1], params: entry[2] || {} })));

for (const name of [
  "booking_page_view",
  "calendar_slot_selected",
  "form_start",
  "booking_confirmed",
  "conversion",
]) {
  expect(events.some((event) => event.name === name), `missing ${name}`).toBeTruthy();
}
```

- [ ] **Step 2: Extend the source-context test**

For `/book-demo/?workflow=lead-to-lease-automation&source=use-case`, assert that the `booking_page_view` event contains:

```js
expect(bookingPageView.params).toMatchObject({
  page_path: "/book-demo/",
  workflow: "lead-to-lease-automation",
  source: "use-case",
});
```

- [ ] **Step 3: Run the focused Playwright tests**

Run:

```bash
npx playwright test tests/public-site.spec.js --browser=chromium --grep "booking page"
```

Expected: the submission, source-context, and event assertions pass.

- [ ] **Step 4: Fix only demonstrated measurement gaps**

If a named event is absent, add the minimal `bookingEvent()` call at the corresponding transition in `AuditBookingSection.astro`. Preserve these event names and parameters:

```js
bookingEvent("booking_page_view", { page_path, workflow, source, display_time_zone });
bookingEvent("calendar_slot_selected", { slot_start, slot_label, display_time_zone });
bookingEvent("form_start", { form: "workflow_audit" });
bookingEvent("booking_confirmed", { booking_id, slot_start });
bookingEvent("form_error", { step, message });
```

Do not send names, email addresses, company names, phone numbers, or free-text form content to analytics. Keep the existing booking payload fields for sales follow-up; do not add a database column in Phase 1.

- [ ] **Step 5: Create the profitability scorecard**

Create `docs/seo/phase-1-profitability-scorecard.md`:

```markdown
# EMC2Ops Phase 1 Buyer-Intent and Profitability Scorecard

## Page intent tiers

| Tier | Pages | Success signal |
| --- | --- | --- |
| High | `/services/leasing-follow-up/`, `/services/missed-call-recovery/`, `/use-cases/real-estate-crm-follow-up-mess/`, `/integrations/buildium/`, `/integrations/appfolio/` | Qualified consultation, sales-qualified opportunity, or won project |
| Medium-high | `/use-cases/apartment-lead-tracking/`, `/use-cases/lead-to-lease-automation/` | Qualified consultation that identifies a measurable workflow and buying context |

## Weekly fields

| Field | Definition | Source |
| --- | --- | --- |
| Organic booking sessions | Sessions landing on a cohort page from organic search | Analytics |
| Qualified bookings | Bookings with a valid workflow, company, work email, and usable portfolio context | Booking record + sales review |
| Sales-qualified opportunities | Qualified bookings accepted for a scoped sales conversation | CRM |
| Won revenue | Contracted revenue attributed to the cohort page/workflow | CRM or finance record |
| Delivery cost | Labor, contractor, software, and usage cost required to deliver the project | Delivery record |
| Attributable marketing cost | Approved SEO labor/tool cost allocated to the cohort | Finance record |
| Contribution profit | Won revenue minus delivery cost minus attributable marketing cost | Calculation |

## Formulas

- Qualified booking rate = qualified bookings / organic booking sessions.
- Sales-qualified rate = sales-qualified opportunities / qualified bookings.
- Close rate = won opportunities / sales-qualified opportunities.
- Contribution profit = won revenue − delivery cost − attributable marketing cost.
- Organic CAC = attributable marketing cost / won organic customers.

Do not set a numeric margin or CAC threshold until the first complete baseline has actual revenue and delivery-cost values.
```

- [ ] **Step 6: Commit the measurement and profitability contract**

```bash
git add tests/public-site.spec.js docs/seo/phase-1-profitability-scorecard.md
git diff --cached --check
git commit -m "feat: connect SEO intent to profitability measurement"
```

If the component required a minimal fix, stage that file explicitly too.

---

### Task 7: Measure unprompted EMC2Ops visibility in AI answers

**Files:**

- Create: `docs/llm-visibility-phase-1-query-set.json`
- Create: `tests/llm-visibility-phase-1-query-set.test.mjs`
- Modify: `package.json`

**Interfaces:**

- Consumes: the commercial categories and buyer problems EMC2Ops wants to be associated with.
- Produces: an unbiased prompt set that measures whether assistants mention EMC2Ops without the prompt seeding the brand.

- [ ] **Step 1: Write the unbiased-query test**

Create `tests/llm-visibility-phase-1-query-set.test.mjs`:

```js
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
```

- [ ] **Step 2: Verify the test initially fails because the approved set is absent**

```bash
node --test tests/llm-visibility-phase-1-query-set.test.mjs
```

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Create the approved prompt set**

Create `docs/llm-visibility-phase-1-query-set.json`:

```json
{
  "version": 1,
  "purpose": "Measure whether AI assistants mention EMC2Ops for generic property-management automation buying questions without seeding the brand in the prompt.",
  "reviewCadence": "post-deployment-once",
  "runProtocol": {
    "assistants": ["Claude", "Gemini", "Perplexity"],
    "market": "United States",
    "language": "en-US",
    "freshConversationPerQuery": true,
    "unpromptedBrandMeasurement": true,
    "captureResultFields": ["checkedAt", "assistant", "modelOrMode", "queryId", "query", "appeared", "mentionContext", "rawAnswer", "citedEmc2OpsUrls", "citedThirdPartyUrls", "competitorsMentioned", "notes"],
    "rules": [
      "Run the wording exactly as stored.",
      "Do not add EMC2Ops, emc2ops.com, or a request to mention a specific company to any prompt.",
      "Keep the raw answer, mention context, competitors, and cited URLs.",
      "A brand mention without a cited EMC2Ops URL counts as appeared but not cited.",
      "Do not infer rankings, traffic, leads, or conversions."
    ]
  },
  "categories": ["category-discovery", "problem-discovery", "integration-discovery"],
  "queries": [
    {
      "id": "phase1-category-services",
      "category": "category-discovery",
      "funnelStage": "consideration",
      "persona": "property-management-owner",
      "tags": ["brand-neutral", "services", "category-discovery"],
      "query": "Which companies provide property management automation services for U.S. property managers, and what does each company specialize in?"
    },
    {
      "id": "phase1-leasing-automation",
      "category": "problem-discovery",
      "funnelStage": "consideration",
      "persona": "leasing-manager",
      "tags": ["brand-neutral", "leasing-follow-up", "missed-calls"],
      "query": "What service providers can automate missed leasing call recovery, renter qualification, follow-up, human escalation, and CRM updates for a property management company?"
    },
    {
      "id": "phase1-apartment-leads",
      "category": "problem-discovery",
      "funnelStage": "consideration",
      "persona": "property-management-owner",
      "tags": ["brand-neutral", "apartment-leads", "multifamily"],
      "query": "Which companies help multifamily property managers track apartment leads across calls, forms, ILS sources, texts, tours, and CRM follow-up?"
    },
    {
      "id": "phase1-crm-cleanup",
      "category": "problem-discovery",
      "funnelStage": "consideration",
      "persona": "property-management-operations-leader",
      "tags": ["brand-neutral", "crm-cleanup", "implementation-services"],
      "query": "Who provides real estate or property management CRM cleanup and workflow automation services for broken stages, duplicate leads, ownership, tasks, and follow-up?"
    },
    {
      "id": "phase1-integrations",
      "category": "integration-discovery",
      "funnelStage": "consideration",
      "persona": "property-management-operations-leader",
      "tags": ["brand-neutral", "appfolio", "buildium", "workflow-integration"],
      "query": "Which consultants or service providers implement AppFolio and Buildium workflow integrations using APIs, middleware, inbox parsing, approval queues, and safe writebacks?"
    }
  ]
}
```

- [ ] **Step 4: Add and run the visibility-query validation**

Add:

```json
"test:llm-phase-1-query-set": "node --test tests/llm-visibility-phase-1-query-set.test.mjs"
```

Run:

```bash
npm run test:llm-phase-1-query-set
node scripts/run-multi-assistant-visibility-benchmark.mjs \
  --query-set docs/llm-visibility-phase-1-query-set.json \
  --output-dir outputs/llm-visibility-phase-1 \
  --dry-run
```

Expected: the query-set test passes, and the dry run validates configuration without making network calls.

- [ ] **Step 5: Commit the approved prompt policy**

```bash
git add docs/llm-visibility-phase-1-query-set.json \
  tests/llm-visibility-phase-1-query-set.test.mjs package.json
git diff --cached --check
git commit -m "test: measure unprompted AI brand visibility"
```

Do not perform the live provider run until after the Phase 1 preview is approved and deployed. The live result is a share-of-voice observation, not a guaranteed ranking.

---

### Task 8: Run final verification and prepare the deployment review

**Files:**

- Modify: `docs/seo/phase-1-baseline.md`

**Interfaces:**

- Consumes: all Phase 1 changes and validation scripts.
- Produces: a reviewable preview, a clean validation record, and an explicit deploy/no-deploy decision.

- [ ] **Step 1: Run all static and content checks**

```bash
npm run test:seo-query-map
npm run test:llm-phase-1-query-set
npm run content:preflight -- --slug apartment-lead-tracking
npm run blog:validate
npm run build
npm run seo:validate
```

Expected: all commands exit 0. Record any metadata warnings outside the seven-page cohort; do not expand scope automatically.

- [ ] **Step 2: Run API and focused browser tests**

```bash
npm run test:api
npx playwright test tests/public-site.spec.js tests/mobile-navigation.spec.js --browser=chromium
```

Expected: API, public-site, booking, navigation, and mobile checks pass.

- [ ] **Step 3: Run the live LP safety check**

```bash
npm run lp:validate-live
```

Expected: all tested LPs return successful responses, include both header and meta noindex controls, and load every referenced first-party asset successfully.

- [ ] **Step 4: Review the seven-page preview manually**

Start the preview:

```bash
npm run preview
```

Review desktop and mobile rendering for:

```text
/use-cases/apartment-lead-tracking/
/services/leasing-follow-up/
/use-cases/lead-to-lease-automation/
/services/missed-call-recovery/
/use-cases/real-estate-crm-follow-up-mess/
/integrations/buildium/
/integrations/appfolio/
/book-demo/
/links/
```

Confirm that exact query phrases read naturally, CTAs preserve workflow/source context, related links are visible, and no page implies unsupported integration access or guaranteed outcomes.

- [ ] **Step 5: Update the validation record**

Append:

```markdown
## Pre-deployment verification

- Query-map tests: passed
- Phase 1 rendered SEO tests: passed
- Apartment guide preflight: passed
- Blog validation: passed
- Astro build: passed
- SEO validation: passed
- API tests: passed
- Public-site and mobile tests: passed
- Live LP validation: passed
- Profitability scorecard created: passed
- Preview reviewed: passed
- Deployment authorized: no
```

- [ ] **Step 6: Request deployment approval**

Provide the founder with:

- the preview URL;
- the seven-page before/after title and description table;
- the list of changed files;
- validation results;
- any warnings intentionally deferred;
- confirmation that no redirects, deletions, `noindex` changes, brand-seeded visibility prompts, or new indexable pages were introduced.

Stop here until the founder explicitly approves deployment.

- [ ] **Step 7: Commit the verification record**

```bash
git add docs/seo/phase-1-baseline.md
git commit -m "docs: record phase one SEO verification"
```

---

### Task 9: Measure after deployment without misclassifying query fan-out

**Files:**

- Modify: `docs/seo/phase-1-baseline.md`
- Write live AI-agent results only to: `outputs/llm-visibility-phase-1/`

**Interfaces:**

- Consumes: founder-approved deployment, GSC data, conversion events, and the approved brand-neutral AI visibility prompt set.
- Produces: 7-, 14-, and 28-day observations separated by traffic source and evidence quality.

- [ ] **Step 1: Record the deployment and review dates**

Replace `not deployed` and `not scheduled` with the actual deployment date and calculated 7-, 14-, and 28-day dates. Never backdate the rollout.

- [ ] **Step 2: Record the conventional Web cohort**

In Search Console, filter Page using this regular expression:

```text
/(use-cases/(apartment-lead-tracking|lead-to-lease-automation|real-estate-crm-follow-up-mess)|services/(leasing-follow-up|missed-call-recovery)|integrations/(buildium|appfolio))/
```

Record clicks, impressions, CTR, and average position for the cohort and for each page. Compare equal-length periods.

- [ ] **Step 3: Treat queries as clusters**

Group observed phrases according to `docs/seo/phase-1-query-map.json`. Label the evidence `candidate reformulation/fan-out` unless Search Console exposes an explicit generative-AI dimension for the property. Do not create a new URL from query wording alone.

- [ ] **Step 4: Check the Generative AI performance report if available**

Record whether the property has the Search Generative AI performance report. If available, capture page, country, device, and date observations separately from the conventional Web cohort. If unavailable, write `Generative AI report not available for this property` and make no attribution claim.

- [ ] **Step 5: Run the approved brand-neutral AI visibility snapshot once**

After deployment approval, run:

```bash
node scripts/run-multi-assistant-visibility-benchmark.mjs \
  --query-set docs/llm-visibility-phase-1-query-set.json \
  --output-dir outputs/llm-visibility-phase-1 \
  --no-resume
```

Expected: no transmitted prompt names EMC2Ops or its domain. Raw answers, spontaneous EMC2Ops mentions, mention context, citations, and competitors are retained. This is an unprompted share-of-voice snapshot, not a ranking guarantee.

- [ ] **Step 6: Report the outcome at 28 days**

Report:

```text
Conventional Web: clicks, impressions, CTR, position, and page-level changes
Generative AI: page-level visibility only when explicitly reported by GSC
Conversions: page views, slot selections, form starts, confirmed bookings, errors
Profitability: qualified bookings, sales-qualified opportunities, won revenue, delivery cost, attributable marketing cost, contribution profit, and organic CAC
AI-agent visibility: unprompted EMC2Ops mention rate, citation rate, mention context, and competitor share of voice
Decision: keep, iterate, or roll back each page change
```

Do not declare the 50% goal achieved from a one-click increase alone. Continue or expand a cluster only when it improves qualified demand and has a measurable path to positive contribution profit; include CTR, impressions, rankings, qualified consultations, and sales outcomes.

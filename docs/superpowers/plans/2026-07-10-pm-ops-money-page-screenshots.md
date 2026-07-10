# PM Ops Money-Page Screenshot System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic, privacy-safe PM Ops capture mode, generate 40 route-specific desktop/mobile screenshots, and integrate them with exact responsive alignment across all 20 EMC2Ops commercial pages.

**Architecture:** The official PM Ops app exposes fictional scenario data only when a local capture flag and a valid capture identifier are both present. A manifest-driven Playwright script renders those scenarios at 1440×900 and 390×844, validates visible text, and emits JPEG/WebP assets. The Astro marketing site consumes the same manifest through one responsive `<picture>` component placed by its shared page templates.

**Tech Stack:** React Router 8, React 19, TypeScript, Astro 6, Playwright 1.60/1.61, Sharp 0.34.5, CSS, Node.js 25.

## Global Constraints

- Use only the official PM Ops project at `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app` as the visual source.
- Cover exactly 20 commercial routes and generate exactly 40 primary captures.
- Desktop captures are exactly 1440×900; mobile captures are exactly 390×844.
- Mobile captures are genuine responsive renders, never crops of desktop assets.
- Capture mode requires `PM_OPS_CAPTURE_MODE=1`, is disabled in production, and never reads Supabase.
- Mock email addresses use `example.com`; mock phone numbers use the fictional `555-01xx` range.
- Do not expose the existing operator name, workspace identity, phone number, email, Supabase reference, or integration identifiers.
- Marketing images render uncropped with explicit intrinsic dimensions.
- Frames align to the existing 1120px `.wrap` container and retain 20px mobile gutters.
- Do not modify or discard unrelated dirty-worktree changes in `/Users/diaoune/automation-agency`.
- The PM Ops directory is not a Git repository; verify its changes directly. Commit marketing-site work in isolated, narrowly staged commits.

## File Structure

### Official PM Ops app

- Create `app/lib/capture-scenarios.ts`: typed scenario registry and deterministic fictional `OpsData` builders.
- Modify `app/lib/env.server.ts`: expose a production-safe `captureMode` flag.
- Modify `app/lib/types.ts`: add optional capture metadata used only for presentation and testing.
- Modify `app/routes/app.tsx`: select capture data before authentication/database access.
- Modify `app/components/ops-app.tsx`: add capture/test hooks and mobile-friendly table labels.
- Modify `app/app.css`: implement aligned 390px capture layout without horizontal overflow.
- Create `playwright.config.ts`: local capture-mode test server.
- Create `tests/capture-scenarios.spec.ts`: scenario availability, privacy, and responsive regression coverage.
- Modify `package.json`: add `test:capture` script.

### Marketing site

- Create `src/data/product-screenshot-manifest.json`: single source of truth for 20 routes, scenarios, sections, assets, and alt text.
- Create `src/lib/productScreenshots.ts`: typed manifest wrapper and path lookup.
- Create `src/components/ProductScreenshot.astro`: shared responsive `<picture>` component.
- Create `src/styles/product-screenshot.css`: shared frame, hero variant, and responsive alignment rules.
- Create `scripts/validate-product-screenshots.mjs`: manifest, privacy, dimensions, and file-existence validation.
- Create `scripts/capture-pm-ops-money-pages.mjs`: start PM Ops, render scenarios, capture JPEG, convert WebP, and build contact sheet.
- Modify `package.json` and `package-lock.json`: add explicit Sharp dependency and screenshot scripts.
- Create `tests/product-screenshots.spec.js`: all-route source selection, alignment, and overflow tests.
- Modify `src/pages/index.astro`: replace the illustrated dashboard with the homepage screenshot.
- Modify `src/pages/book-demo.astro`: add booking proof screenshot.
- Modify `src/pages/services/index.astro`: add services-index screenshot.
- Modify `src/pages/services/[slug].astro`: add service-specific screenshot.
- Modify `src/pages/use-cases/index.astro`: add use-cases-index screenshot.
- Modify `src/pages/use-cases/[slug].astro`: add use-case-specific screenshot.
- Modify `src/pages/integrations/index.astro`: add integrations-index screenshot.
- Modify `src/pages/integrations/[slug].astro`: add integration-specific screenshot.
- Create `public/assets/pm-ops/*.jpg`: 40 JPEG fallbacks.
- Create `public/assets/pm-ops/*.webp`: 40 optimized WebP assets.
- Create `output/pm-ops-money-page-contact-sheet.jpg`: uncommitted final review sheet.

---

### Task 1: Add a gated, deterministic PM Ops scenario registry

**Files:**
- Create: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/lib/capture-scenarios.ts`
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/lib/env.server.ts`
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/lib/types.ts`
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/routes/app.tsx`
- Test: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/tests/capture-scenarios.spec.ts`
- Create: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/playwright.config.ts`
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/package.json`

**Interfaces:**
- Produces: `CaptureScenarioId`, `CAPTURE_SCENARIO_IDS`, `isCaptureScenarioId(value)`, and `buildCaptureScenario(id, section): OpsData`.
- Produces: `ServerEnv.captureMode: boolean`.
- Consumes: existing `OpsData`, `OpsTask`, `ReviewGate`, `WorkflowStatus`, and `AppSection` types.

- [ ] **Step 1: Write the failing scenario-route test**

Create `tests/capture-scenarios.spec.ts` with the exact 20 identifiers and verify that each renders without authentication:

```ts
import { expect, test } from "playwright/test";

const scenarios = [
  ["home", "dashboard"],
  ["services-index", "workflows"],
  ["use-cases-index", "inbox"],
  ["integrations-index", "settings"],
  ["book-demo", "dashboard"],
  ["service-missed-call-recovery", "inbox"],
  ["service-leasing-follow-up", "leasing"],
  ["service-maintenance-intake", "maintenance"],
  ["service-crm-workflow", "crm"],
  ["service-owner-update", "owners"],
  ["service-vendor-dispatch", "vendors"],
  ["service-ai-front-desk", "inbox"],
  ["use-case-apartment-lead-tracking", "leasing"],
  ["use-case-real-estate-lead-follow-up", "leasing"],
  ["use-case-how-to-automate", "dashboard"],
  ["use-case-lead-to-lease", "leasing"],
  ["use-case-crm-follow-up-cleanup", "crm"],
  ["integration-appfolio", "crm"],
  ["integration-buildium", "workflows"],
  ["integration-leadsimple", "crm"],
] as const;

for (const [scenario, section] of scenarios) {
  test(`${scenario} renders fictional capture data`, async ({ page }) => {
    await page.goto(`/app/${section}?capture=${scenario}`);
    await expect(page.locator("[data-capture-scenario]")).toHaveAttribute(
      "data-capture-scenario",
      scenario,
    );
    await expect(page.locator("body")).toContainText("Northstar Property Group");
    await expect(page.locator("body")).not.toContainText("EMC2Ops");
    await expect(page.locator("body")).not.toContainText("hqxibloxwgigowftfuaa");
    await expect(page.locator("body")).not.toContainText("+17166221976");
  });
}
```

- [ ] **Step 2: Add the failing capture test command**

Create `playwright.config.ts`:

```ts
import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:5173" },
  webServer: {
    command: "PM_OPS_CAPTURE_MODE=1 npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173/app",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
```

Add to `package.json`:

```json
"test:capture": "playwright test tests/capture-scenarios.spec.ts"
```

- [ ] **Step 3: Run the scenario test and verify the red state**

Run:

```bash
cd /Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app
npm run test:capture
```

Expected: FAIL because `[data-capture-scenario]` and the scenario registry do not exist.

- [ ] **Step 4: Add capture metadata to `OpsData`**

Add this optional field to `OpsData` in `app/lib/types.ts`:

```ts
capture?: {
  scenario: string;
  generatedFrom: "fictional-fixtures";
};
```

- [ ] **Step 5: Add the production-safe environment gate**

Extend `ServerEnv` and `getServerEnv()` in `app/lib/env.server.ts`:

```ts
export interface ServerEnv {
  // existing fields
  captureMode: boolean;
}

const captureMode =
  process.env.NODE_ENV !== "production" && process.env.PM_OPS_CAPTURE_MODE === "1";

return {
  // existing fields
  captureMode,
};
```

- [ ] **Step 6: Implement the typed registry and deterministic builders**

Create `app/lib/capture-scenarios.ts`. Use shared fixture builders and this complete identifier contract:

```ts
import { buildMetrics } from "./sample-data";
import type {
  AppProperty,
  AppSection,
  OpsData,
  OpsTask,
  ReviewGate,
  WorkflowKey,
  WorkflowStatus,
} from "./types";

export const CAPTURE_SCENARIO_IDS = [
  "home",
  "services-index",
  "use-cases-index",
  "integrations-index",
  "book-demo",
  "service-missed-call-recovery",
  "service-leasing-follow-up",
  "service-maintenance-intake",
  "service-crm-workflow",
  "service-owner-update",
  "service-vendor-dispatch",
  "service-ai-front-desk",
  "use-case-apartment-lead-tracking",
  "use-case-real-estate-lead-follow-up",
  "use-case-how-to-automate",
  "use-case-lead-to-lease",
  "use-case-crm-follow-up-cleanup",
  "integration-appfolio",
  "integration-buildium",
  "integration-leadsimple",
] as const;

export type CaptureScenarioId = (typeof CAPTURE_SCENARIO_IDS)[number];

export function isCaptureScenarioId(value: string): value is CaptureScenarioId {
  return (CAPTURE_SCENARIO_IDS as readonly string[]).includes(value);
}

type Definition = {
  label: string;
  focus: WorkflowKey;
  property: string;
  requestType: string;
  stage: string;
  summary: string;
  nextAction: string;
  status: OpsTask["status"];
};

const definitions: Record<CaptureScenarioId, Definition> = {
  home: { label: "Portfolio operations overview", focus: "missed_call", property: "Harbor Point Residences", requestType: "Portfolio activity", stage: "Active", summary: "Leasing, maintenance, owner, and vendor work is routed into one operating queue.", nextAction: "Review today's highest-impact workflow", status: "new" },
  "services-index": { label: "Automation service catalog", focus: "crm_sync", property: "Northstar Portfolio", requestType: "Workflow health", stage: "Ready", summary: "Six repeatable property-management workflows are monitored from one workspace.", nextAction: "Choose the first workflow to activate", status: "synced" },
  "use-cases-index": { label: "Cross-functional operations queue", focus: "leasing_follow_up", property: "Maple Row Apartments", requestType: "Operations queue", stage: "In progress", summary: "Leasing and operations tasks are prioritized by intent, urgency, and required human review.", nextAction: "Resolve the highest-priority queue item", status: "waiting_reply" },
  "integrations-index": { label: "Integration synchronization health", focus: "crm_sync", property: "Northstar Portfolio", requestType: "Integration status", stage: "Connected", summary: "Property systems are connected through approved synchronization and review paths.", nextAction: "Review the latest synchronization run", status: "synced" },
  "book-demo": { label: "Workflow audit recommendation", focus: "missed_call", property: "Lakeview Commons", requestType: "Audit recommendation", stage: "Recommended", summary: "Missed-call recovery is the highest-value first workflow for this fictional portfolio.", nextAction: "Confirm trigger, handoff, and CRM fields", status: "pending_review" },
  "service-missed-call-recovery": { label: "Recovered missed caller", focus: "missed_call", property: "Harbor Point Residences", requestType: "Two-bedroom inquiry", stage: "Qualified", summary: "A missed after-hours caller received a text-back and shared move timing, budget, and tour intent.", nextAction: "Offer two tour times", status: "waiting_reply" },
  "service-leasing-follow-up": { label: "Stage-aware leasing follow-up", focus: "leasing_follow_up", property: "Maple Row Apartments", requestType: "Stale tour lead", stage: "Tour requested", summary: "A qualified renter re-engaged after a stage-aware follow-up message.", nextAction: "Confirm the selected tour time", status: "waiting_reply" },
  "service-maintenance-intake": { label: "Complete maintenance intake", focus: "maintenance_intake", property: "Juniper Court", requestType: "Kitchen leak", stage: "Dispatch ready", summary: "The resident supplied urgency, access notes, pet details, and two photos.", nextAction: "Assign the plumbing vendor", status: "staff_escalated" },
  "service-crm-workflow": { label: "Clean CRM writeback", focus: "crm_sync", property: "Lakeview Commons", requestType: "CRM synchronization", stage: "Synced", summary: "Source, qualification, owner, notes, and next task were written to the CRM.", nextAction: "Monitor the next follow-up due time", status: "synced" },
  "service-owner-update": { label: "Owner update review", focus: "owner_update", property: "Cedar Lane Townhomes", requestType: "Owner status update", stage: "Awaiting review", summary: "A concise leasing and maintenance update is ready for manager approval.", nextAction: "Approve or revise the owner message", status: "pending_review" },
  "service-vendor-dispatch": { label: "Vendor dispatch approval", focus: "vendor_dispatch", property: "Juniper Court", requestType: "HVAC dispatch", stage: "Approval required", summary: "The request is qualified and matched to a vendor, but the estimate exceeds the review threshold.", nextAction: "Approve the dispatch threshold", status: "vendor_pending" },
  "service-ai-front-desk": { label: "AI front desk queue", focus: "leasing_follow_up", property: "Harbor Point Residences", requestType: "Multi-channel intake", stage: "Routed", summary: "Voice, SMS, leasing, and resident requests are classified and routed with human handoff rules.", nextAction: "Review the sensitive-question escalation", status: "staff_escalated" },
  "use-case-apartment-lead-tracking": { label: "Apartment lead tracking", focus: "leasing_follow_up", property: "Maple Row Apartments", requestType: "ILS and call match", stage: "Tour booked", summary: "A duplicate ILS form and phone call were merged into one qualified lead with source attribution.", nextAction: "Send the tour confirmation", status: "synced" },
  "use-case-real-estate-lead-follow-up": { label: "Stale lead recovery", focus: "leasing_follow_up", property: "Cedar Lane Townhomes", requestType: "Stale lead", stage: "Re-engaged", summary: "A renter who stopped replying returned through a short follow-up with clear stop rules.", nextAction: "Offer an application or tour path", status: "waiting_reply" },
  "use-case-how-to-automate": { label: "First automation recommendation", focus: "missed_call", property: "Northstar Portfolio", requestType: "Workflow opportunity", stage: "Prioritized", summary: "The mixed operations dashboard identifies missed-call recovery as the first measurable workflow.", nextAction: "Approve the initial workflow scope", status: "pending_review" },
  "use-case-lead-to-lease": { label: "Lead-to-lease pipeline", focus: "leasing_follow_up", property: "Lakeview Commons", requestType: "Application handoff", stage: "Application started", summary: "Inquiry, tour, application, approval, and move-in tasks remain connected in one renter record.", nextAction: "Collect the remaining application document", status: "waiting_reply" },
  "use-case-crm-follow-up-cleanup": { label: "CRM follow-up cleanup", focus: "crm_sync", property: "Northstar Portfolio", requestType: "Duplicate and stale task review", stage: "Cleanup ready", summary: "Duplicate contacts, missing owners, and overdue next steps are grouped for review.", nextAction: "Merge duplicates and assign task owners", status: "pending_review" },
  "integration-appfolio": { label: "AppFolio synchronization", focus: "crm_sync", property: "Harbor Point Residences", requestType: "AppFolio writeback", stage: "Connected", summary: "Approved leasing and maintenance summaries are synchronized through the configured AppFolio path.", nextAction: "Review the latest successful writeback", status: "synced" },
  "integration-buildium": { label: "Buildium workflow synchronization", focus: "crm_sync", property: "Maple Row Apartments", requestType: "Buildium workflow run", stage: "Connected", summary: "Lead, work-order, and owner-update fields are synchronized through approved Buildium workflows.", nextAction: "Review the owner-update approval queue", status: "synced" },
  "integration-leadsimple": { label: "LeadSimple pipeline synchronization", focus: "leasing_follow_up", property: "Cedar Lane Townhomes", requestType: "LeadSimple pipeline task", stage: "Follow-up due", summary: "A qualified renter and next task are synchronized to the correct LeadSimple pipeline stage.", nextAction: "Complete the scheduled follow-up task", status: "waiting_reply" },
};
```

Implement deterministic helpers that create fictional properties, one primary task, three supporting tasks, scenario-specific workflows, and optional review gates. Use fixed timestamps beginning at `2026-07-10T13:00:00.000Z`, `lead-${index}@example.com`, and `(202) 555-01${String(index).padStart(2, "0")}`. Return `capture: { scenario: id, generatedFrom: "fictional-fixtures" }`, workspace `Northstar Property Group`, slug `northstar-demo`, and user `Jordan Lee <jordan.lee@example.com>`.

- [ ] **Step 7: Route capture requests before auth or Supabase access**

Update `app/routes/app.tsx`:

```ts
export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const captureId = url.searchParams.get("capture");
  const section = normalizeSection(params.section);
  const env = getServerEnv();

  if (captureId) {
    if (!env.captureMode) throw new Response("Capture mode is unavailable.", { status: 404 });
    if (!isCaptureScenarioId(captureId)) {
      throw new Response(`Unknown capture scenario: ${captureId}`, { status: 400 });
    }
    return routeData(buildCaptureScenario(captureId, section));
  }

  const auth = await getAuthContext(request);
  const opsData = await loadOperationsData({
    section,
    user: auth.user,
    workspace: auth.workspace,
    authConfigured: auth.authConfigured,
    schemaReady: auth.schemaReady,
    authIssue: auth.setupIssue,
  });
  return routeData(opsData, { headers: auth.headers });
}
```

- [ ] **Step 8: Expose the active scenario as a test hook**

In `OpsApp`, add the scenario attribute to the root:

```tsx
<div
  className={cn("app-frame", data.capture && "capture-mode")}
  data-capture-scenario={data.capture?.scenario}
>
```

- [ ] **Step 9: Run typecheck and scenario tests**

Run:

```bash
npm run typecheck
npm run test:capture
```

Expected: typecheck passes and 20 scenario tests pass.

- [ ] **Step 10: Record the non-Git PM Ops checkpoint**

Run:

```bash
find app tests -type f -newermt '2026-07-10 00:00:00' -maxdepth 4 | sort
```

Expected: the changed PM Ops files are listed. Do not attempt a commit because this project has no `.git` directory.

---

### Task 2: Make PM Ops capture layouts responsive and aligned

**Files:**
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/components/ops-app.tsx`
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/app.css`
- Modify: `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/tests/capture-scenarios.spec.ts`

**Interfaces:**
- Consumes: `data-capture-scenario` and fictional scenario data from Task 1.
- Produces: `.capture-mode`, `.mobile-task-label`, and responsive task-row rendering that has zero horizontal overflow at 390px.

- [ ] **Step 1: Add a failing mobile overflow and content test**

Append to `tests/capture-scenarios.spec.ts`:

```ts
test("capture scenarios fit the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [scenario, section] of scenarios) {
    await page.goto(`/app/${section}?capture=${scenario}`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, scenario).toBe(false);
    await expect(page.locator("[data-capture-primary]")).toBeVisible();
  }
});
```

- [ ] **Step 2: Run the mobile test and verify it fails**

Run: `npm run test:capture -- --grep "mobile viewport"`

Expected: FAIL because the current table uses an 820px minimum width.

- [ ] **Step 3: Add explicit table labels and capture-primary hooks**

Add `data-capture-primary` to the active workspace view. Add `data-label` attributes to task cells and workflow cells, for example:

```tsx
<td data-label="Contact">...</td>
<td data-label="Property">...</td>
<td data-label="Workflow">{task.workflowName}</td>
<td data-label="Status"><StatusChip status={task.status} /></td>
<td data-label="Next action">{task.nextAction}</td>
```

- [ ] **Step 4: Replace mobile table overflow with stacked rows**

Under `@media (max-width: 720px)` in `app/app.css`, add:

```css
.capture-mode .ops-table {
  display: block;
  min-width: 0;
  width: 100%;
}

.capture-mode .ops-table thead {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.capture-mode .ops-table tbody,
.capture-mode .ops-table tr,
.capture-mode .ops-table td {
  display: block;
  width: 100%;
}

.capture-mode .ops-table tr {
  border-bottom: 1px solid var(--color-border);
  padding: 12px;
}

.capture-mode .ops-table td {
  align-items: start;
  border: 0;
  display: grid;
  gap: 12px;
  grid-template-columns: 92px minmax(0, 1fr);
  padding: 6px 0;
}

.capture-mode .ops-table td::before {
  color: var(--color-muted);
  content: attr(data-label);
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.capture-mode .ops-table td:empty,
.capture-mode .ops-table td:first-child {
  display: none;
}

.capture-mode .sidebar {
  padding: 12px;
}

.capture-mode .nav-list {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.capture-mode .nav-item {
  flex: 0 0 auto;
  min-width: max-content;
}
```

Also reduce mobile topbar, metric, and detail-panel spacing without hiding required content.

- [ ] **Step 5: Verify desktop did not regress**

Add a 1440×900 test that asserts `.ops-table thead` is visible and the screenshot root width is no larger than the viewport.

- [ ] **Step 6: Run the full PM Ops verification**

Run:

```bash
npm run typecheck
npm run build
npm run test:capture
```

Expected: all commands exit 0; all 20 scenarios pass at desktop and mobile.

---

### Task 3: Add the marketing manifest and responsive screenshot component

**Files:**
- Create: `src/data/product-screenshot-manifest.json`
- Create: `src/lib/productScreenshots.ts`
- Create: `src/components/ProductScreenshot.astro`
- Create: `src/styles/product-screenshot.css`
- Create: `tests/product-screenshots.spec.js`

**Interfaces:**
- Produces: `ProductScreenshot`, `productScreenshotForPath(pathname)`, and `ProductScreenshot.astro` props `{ screenshot, variant?, priority? }`.
- Consumes later: the capture script reads the JSON manifest directly.

- [ ] **Step 1: Write a failing manifest coverage test**

Create `tests/product-screenshots.spec.js`:

```js
const { expect, test } = require("@playwright/test");

const routes = [
  "/", "/services/", "/use-cases/", "/integrations/", "/book-demo/",
  "/services/missed-call-recovery/", "/services/leasing-follow-up/",
  "/services/maintenance-intake-automation/", "/services/crm-workflow-automation/",
  "/services/owner-update-automation/", "/services/vendor-dispatch-automation/",
  "/services/ai-front-desk-property-management/", "/use-cases/apartment-lead-tracking/",
  "/use-cases/real-estate-lead-follow-up-automation/",
  "/use-cases/how-to-automate-property-management/", "/use-cases/lead-to-lease-automation/",
  "/use-cases/real-estate-crm-follow-up-mess/", "/integrations/appfolio/",
  "/integrations/buildium/", "/integrations/leadsimple/",
];

test("every commercial route renders its product screenshot", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator(`[data-product-screenshot-route="${route}"]`)).toHaveCount(1);
  }
});
```

- [ ] **Step 2: Run the coverage test and verify it fails**

Run: `npx playwright test tests/product-screenshots.spec.js`

Expected: FAIL because no product screenshot component exists.

- [ ] **Step 3: Create the complete 20-entry JSON manifest**

Use this entry shape for every approved route:

```json
{
  "route": "/services/missed-call-recovery/",
  "scenario": "service-missed-call-recovery",
  "section": "inbox",
  "desktop": {
    "webp": "/assets/pm-ops/service-missed-call-recovery-desktop.webp",
    "jpeg": "/assets/pm-ops/service-missed-call-recovery-desktop.jpg",
    "width": 1440,
    "height": 900
  },
  "mobile": {
    "webp": "/assets/pm-ops/service-missed-call-recovery-mobile.webp",
    "jpeg": "/assets/pm-ops/service-missed-call-recovery-mobile.jpg",
    "width": 390,
    "height": 844
  },
  "alt": "PM Ops missed-call recovery queue with fictional renter qualification and follow-up data."
}
```

Create corresponding entries for the exact route/scenario/section tuples from Task 1. Alt text must describe the page-specific state and state that the data is fictional where a person or record is visible.

- [ ] **Step 4: Create the typed lookup wrapper**

Implement `src/lib/productScreenshots.ts`:

```ts
import manifest from "../data/product-screenshot-manifest.json";

export interface ScreenshotSource {
  webp: string;
  jpeg: string;
  width: number;
  height: number;
}

export interface ProductScreenshot {
  route: string;
  scenario: string;
  section: string;
  desktop: ScreenshotSource;
  mobile: ScreenshotSource;
  alt: string;
}

const screenshots = manifest as ProductScreenshot[];
const byPath = new Map(screenshots.map((item) => [item.route, item]));

export function productScreenshotForPath(pathname: string): ProductScreenshot {
  const screenshot = byPath.get(pathname);
  if (!screenshot) throw new Error(`Missing PM Ops screenshot manifest entry for ${pathname}`);
  return screenshot;
}

export const productScreenshotRoutes = screenshots.map((item) => item.route);
```

- [ ] **Step 5: Create the reusable Astro component**

Implement `src/components/ProductScreenshot.astro`:

```astro
---
import type { ProductScreenshot } from "../lib/productScreenshots";
import "../styles/product-screenshot.css";

interface Props {
  screenshot: ProductScreenshot;
  variant?: "proof" | "hero";
  priority?: boolean;
}

const { screenshot, variant = "proof", priority = false } = Astro.props;
---

<figure
  class:list={["product-screenshot", `product-screenshot--${variant}`]}
  data-product-screenshot-route={screenshot.route}
>
  <picture>
    <source media="(max-width: 719px)" srcset={screenshot.mobile.webp} type="image/webp" />
    <source media="(max-width: 719px)" srcset={screenshot.mobile.jpeg} type="image/jpeg" />
    <source srcset={screenshot.desktop.webp} type="image/webp" />
    <img
      src={screenshot.desktop.jpeg}
      alt={screenshot.alt}
      width={screenshot.desktop.width}
      height={screenshot.desktop.height}
      loading={priority ? "eager" : "lazy"}
      fetchpriority={priority ? "high" : "auto"}
      decoding="async"
    />
  </picture>
</figure>
```

- [ ] **Step 6: Add shared alignment CSS**

Implement `src/styles/product-screenshot.css`:

```css
.product-proof-section {
  padding: 32px 0 12px;
}

.product-screenshot {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  margin: 0;
  overflow: hidden;
  width: 100%;
}

.product-screenshot picture,
.product-screenshot img {
  display: block;
  width: 100%;
}

.product-screenshot img {
  height: auto;
}

.product-screenshot--hero {
  box-shadow: var(--shadow-lg);
}

@media (max-width: 719px) {
  .product-proof-section {
    padding: 24px 0 8px;
  }
}
```

- [ ] **Step 7: Run typecheck/build to verify the component contract**

Run: `npm run build`

Expected: build exits 0 even though the component is not yet placed.

- [ ] **Step 8: Commit the manifest and component contract**

```bash
git add src/data/product-screenshot-manifest.json src/lib/productScreenshots.ts src/components/ProductScreenshot.astro src/styles/product-screenshot.css tests/product-screenshots.spec.js
git commit -m "Add PM Ops screenshot manifest and component"
```

---

### Task 4: Build the deterministic capture and privacy-validation pipeline

**Files:**
- Create: `scripts/validate-product-screenshots.mjs`
- Create: `scripts/capture-pm-ops-money-pages.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `public/assets/pm-ops/*.jpg`
- Create: `public/assets/pm-ops/*.webp`
- Create: `output/pm-ops-money-page-contact-sheet.jpg`

**Interfaces:**
- Consumes: `src/data/product-screenshot-manifest.json` and PM Ops capture URLs.
- Produces: `npm run screenshots:capture`, `npm run screenshots:validate`, 80 committed image files, and one uncommitted contact sheet.

- [ ] **Step 1: Add Sharp as an explicit dependency**

Run:

```bash
npm install --save-dev sharp@0.34.5
```

Expected: `package.json` and `package-lock.json` record Sharp directly.

- [ ] **Step 2: Write a failing asset validator**

Create `scripts/validate-product-screenshots.mjs` to load the JSON manifest and assert:

```js
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "src/data/product-screenshot-manifest.json"), "utf8"),
);

if (manifest.length !== 20) throw new Error(`Expected 20 routes, found ${manifest.length}`);
if (new Set(manifest.map((item) => item.route)).size !== 20) throw new Error("Duplicate route");
if (new Set(manifest.map((item) => item.scenario)).size !== 20) throw new Error("Duplicate scenario");

for (const item of manifest) {
  for (const [viewport, expected] of [["desktop", [1440, 900]], ["mobile", [390, 844]]]) {
    for (const format of ["jpeg", "webp"]) {
      const file = path.join(root, "public", item[viewport][format].replace(/^\//, ""));
      const metadata = await sharp(file).metadata();
      if (metadata.width !== expected[0] || metadata.height !== expected[1]) {
        throw new Error(`${item.route} ${viewport} ${format} has ${metadata.width}x${metadata.height}`);
      }
    }
  }
}
```

- [ ] **Step 3: Run the validator and verify it fails**

Run: `node scripts/validate-product-screenshots.mjs`

Expected: FAIL on the first missing asset.

- [ ] **Step 4: Implement the capture script**

Create `scripts/capture-pm-ops-money-pages.mjs` with these exact behaviors:

```js
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const siteRoot = path.resolve(import.meta.dirname, "..");
const appRoot = process.env.PM_OPS_ROOT ||
  "/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app";
const origin = "http://127.0.0.1:5173";
const forbidden = [
  "EMC2Ops",
  "internal-operations",
  "+17166221976",
  "hqxibloxwgigowftfuaa",
  "soya@GetEMC2Ops.com",
];
```

The script must:

1. Parse the 20-entry manifest.
2. Spawn `npm run dev -- --host 127.0.0.1` in `appRoot` with `PM_OPS_CAPTURE_MODE=1`.
3. Poll `${origin}/app` until it responds.
4. For each manifest entry and each viewport, create a fresh page with the exact viewport.
5. Open `/app` for `dashboard` or `/app/${section}` otherwise, with `?capture=${scenario}`.
6. Wait for `[data-capture-scenario="${scenario}"]` and `[data-capture-primary]`.
7. Read visible `document.body.innerText`; reject every forbidden token, non-`example.com` email, and phone number outside `555-01xx`.
8. Reject `document.documentElement.scrollWidth > window.innerWidth + 1`.
9. Reject console errors and framework overlays.
10. Save a quality-92 JPEG to the manifest path.
11. Convert the JPEG to WebP quality 86 with Sharp.
12. Verify dimensions with Sharp.
13. Close pages and terminate the PM Ops server in `finally`.
14. Composite scaled thumbnails into `output/pm-ops-money-page-contact-sheet.jpg` with route labels.

Use `page.screenshot({ type: "jpeg", quality: 92, fullPage: false })`; do not crop.

- [ ] **Step 5: Add package scripts**

Add:

```json
"screenshots:capture": "node scripts/capture-pm-ops-money-pages.mjs",
"screenshots:validate": "node scripts/validate-product-screenshots.mjs"
```

- [ ] **Step 6: Generate all assets**

Run: `npm run screenshots:capture`

Expected: 40 JPEGs, 40 WebPs, and a 40-tile contact sheet are written; no forbidden-string or overflow errors occur.

- [ ] **Step 7: Validate dimensions and manifest coverage**

Run: `npm run screenshots:validate`

Expected: exits 0 after validating 20 routes and 80 image files.

- [ ] **Step 8: Review the contact sheet with `view_image`**

Open `output/pm-ops-money-page-contact-sheet.jpg` at original detail. Reject and recapture any state with clipped content, uneven density, sensitive data, accidental blank space, or misaligned mobile UI.

- [ ] **Step 9: Commit generated assets and pipeline**

```bash
git add package.json package-lock.json scripts/capture-pm-ops-money-pages.mjs scripts/validate-product-screenshots.mjs public/assets/pm-ops
git commit -m "Generate privacy-safe PM Ops product screenshots"
```

Do not commit the contact sheet unless the user explicitly requests it.

---

### Task 5: Integrate screenshots across all marketing templates

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/book-demo.astro`
- Modify: `src/pages/services/index.astro`
- Modify: `src/pages/services/[slug].astro`
- Modify: `src/pages/use-cases/index.astro`
- Modify: `src/pages/use-cases/[slug].astro`
- Modify: `src/pages/integrations/index.astro`
- Modify: `src/pages/integrations/[slug].astro`
- Test: `tests/product-screenshots.spec.js`

**Interfaces:**
- Consumes: `ProductScreenshot.astro` and `productScreenshotForPath()`.
- Produces: one route-specific component instance on every commercial route.

- [ ] **Step 1: Add a helper assertion for source structure**

Extend `tests/product-screenshots.spec.js` inside the route loop:

```js
const figure = page.locator(`[data-product-screenshot-route="${route}"]`);
await expect(figure.locator("picture source[type='image/webp']")).toHaveCount(2);
await expect(figure.locator("img")).toHaveAttribute("width", "1440");
await expect(figure.locator("img")).toHaveAttribute("height", "900");
await expect(figure.locator("img")).toHaveAttribute("alt", /PM Ops/);
```

- [ ] **Step 2: Run the route test and preserve the red state**

Run: `npx playwright test tests/product-screenshots.spec.js`

Expected: FAIL because templates do not render the component.

- [ ] **Step 3: Replace the homepage dashboard illustration**

Import the component and lookup:

```astro
import ProductScreenshot from "../components/ProductScreenshot.astro";
import { productScreenshotForPath } from "../lib/productScreenshots";
const productScreenshot = productScreenshotForPath("/");
```

Replace only the existing `<div class="dashboard">...</div>` with:

```astro
<div class="dashboard product-hero-media">
  <ProductScreenshot screenshot={productScreenshot} variant="hero" priority />
</div>
```

Preserve all hero copy, CTA, offer-strip, and proof markup.

- [ ] **Step 4: Add full-width proof to the booking page**

After `.booking-page-hero` and before `<AuditBookingSection />`:

```astro
<section class="product-proof-section">
  <div class="wrap">
    <ProductScreenshot screenshot={productScreenshotForPath("/book-demo/")} />
  </div>
</section>
```

- [ ] **Step 5: Add proof to the three index pages**

On each index, place the same section immediately after `.service-hero`, using its exact route path:

```astro
<section class="product-proof-section">
  <div class="wrap">
    <ProductScreenshot screenshot={productScreenshotForPath("/services/")} />
  </div>
</section>
```

Use `/use-cases/` and `/integrations/` in their respective files.

- [ ] **Step 6: Add proof to service detail pages**

In `services/[slug].astro`, derive:

```ts
const servicePath = `/services/${service.slug}/`;
const productScreenshot = productScreenshotForPath(servicePath);
```

Render the shared proof section immediately after `.service-hero`.

- [ ] **Step 7: Add proof to use-case detail pages**

In `use-cases/[slug].astro`, derive:

```ts
const useCasePath = `/use-cases/${useCase.slug}/`;
const productScreenshot = productScreenshotForPath(useCasePath);
```

Render the shared proof section immediately after `.service-hero`.

- [ ] **Step 8: Add proof to integration detail pages**

In `integrations/[slug].astro`, derive:

```ts
const integrationPath = `/integrations/${integration.slug}/`;
const productScreenshot = productScreenshotForPath(integrationPath);
```

Render the shared proof section immediately after `.service-hero`.

- [ ] **Step 9: Run route and build verification**

Run:

```bash
npm run build
npx playwright test tests/product-screenshots.spec.js
```

Expected: build exits 0 and all 20 routes render one correct screenshot component.

- [ ] **Step 10: Commit template integration**

```bash
git add src/pages/index.astro src/pages/book-demo.astro src/pages/services src/pages/use-cases src/pages/integrations
git commit -m "Apply PM Ops screenshots to money pages"
```

---

### Task 6: Verify responsive source selection and exact alignment

**Files:**
- Modify: `tests/product-screenshots.spec.js`
- Modify: `src/styles/product-screenshot.css`
- Modify: `src/styles/landing.css`
- Modify: `src/styles/service.css`

**Interfaces:**
- Consumes: route components from Task 5.
- Produces: automated 20-route desktop/mobile alignment coverage.

- [ ] **Step 1: Add failing responsive and alignment assertions**

Add this test:

```js
for (const viewport of [
  { name: "mobile", width: 390, height: 844, expectedWidth: 390, expectedHeight: 844 },
  { name: "desktop", width: 1440, height: 900, expectedWidth: 1440, expectedHeight: 900 },
]) {
  test(`commercial screenshots align at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routes) {
      await page.goto(route);
      const figure = page.locator(`[data-product-screenshot-route="${route}"]`);
      const wrap = figure.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' wrap ')][1]");
      const [figureBox, wrapBox] = await Promise.all([figure.boundingBox(), wrap.boundingBox()]);
      expect(Math.abs(figureBox.x - wrapBox.x), route).toBeLessThanOrEqual(1);
      expect(Math.abs(figureBox.width - wrapBox.width), route).toBeLessThanOrEqual(1);
      const natural = await figure.locator("img").evaluate((img) => ({
        width: img.currentSrc.includes("-mobile.") ? 390 : 1440,
        height: img.currentSrc.includes("-mobile.") ? 844 : 900,
        currentSrc: img.currentSrc,
      }));
      expect(natural.width).toBe(viewport.expectedWidth);
      expect(natural.height).toBe(viewport.expectedHeight);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      expect(overflow, route).toBe(false);
    }
  });
}
```

For the homepage hero variant, compare its figure edges to `.dashboard` instead of the page `.wrap` width while still asserting it remains within `.hero-grid`.

- [ ] **Step 2: Run the alignment tests and collect exact failures**

Run: `npx playwright test tests/product-screenshots.spec.js --grep "align"`

Expected: any mismatched homepage or proof spacing is reported by route and viewport.

- [ ] **Step 3: Fix shared CSS, not individual routes**

Adjust only shared component/hero rules. Use:

```css
.product-proof-section > .wrap {
  display: block;
}

.product-hero-media {
  align-self: center;
  min-width: 0;
}

.product-hero-media .product-screenshot {
  width: 100%;
}

@media (max-width: 719px) {
  .product-screenshot {
    border-radius: var(--radius);
  }
}
```

Do not add per-route margins or negative offsets.

- [ ] **Step 4: Run all screenshot tests**

Run:

```bash
npx playwright test tests/product-screenshots.spec.js
npm run test:public
```

Expected: all product screenshot and existing public-site tests pass.

- [ ] **Step 5: Commit alignment fixes and tests**

```bash
git add tests/product-screenshots.spec.js src/styles/product-screenshot.css src/styles/landing.css src/styles/service.css
git commit -m "Verify responsive PM Ops screenshot alignment"
```

---

### Task 7: Run full privacy, browser, and production verification

**Files:**
- Verify only; modify the smallest relevant file if a check fails.
- Inspect: `output/pm-ops-money-page-contact-sheet.jpg`

**Interfaces:**
- Consumes all earlier tasks.
- Produces final build/test/privacy/browser evidence.

- [ ] **Step 1: Run PM Ops verification from a clean process**

Run:

```bash
cd /Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app
npm run typecheck
npm run build
npm run test:capture
```

Expected: all commands exit 0.

- [ ] **Step 2: Run marketing asset and build verification**

Run:

```bash
cd /Users/diaoune/automation-agency
npm run screenshots:validate
npm run build
npm run test:public
```

Expected: 20 manifest routes, 80 image files, successful Astro build, and all public tests pass.

- [ ] **Step 3: Scan source and rendered fixture data for forbidden strings**

Run:

```bash
rg -n '17166221976|hqxibloxwgigowftfuaa|soya@GetEMC2Ops\.com|internal-operations' \
  public/assets/pm-ops src/data/product-screenshot-manifest.json \
  /Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app/app/lib/capture-scenarios.ts
```

Expected: no matches.

- [ ] **Step 4: Start the marketing site and verify with the Browser plugin first**

Run `npm run dev`, then use the Browser plugin at `http://127.0.0.1:3000`. If the in-app browser remains unavailable, record that exact blocker and use the already-configured Playwright suite as the allowed fallback.

Verify this target flow:

`commercial route loads -> correct responsive PM Ops screenshot renders -> next content section and primary CTA remain usable`.

Check page identity, meaningful DOM, no framework overlay, no relevant console errors, screenshot evidence, and one primary CTA interaction.

- [ ] **Step 5: Inspect representative desktop and mobile renders with `view_image`**

Capture and inspect at least:

- Homepage desktop and mobile.
- Missed-call service desktop and mobile.
- Maintenance service desktop and mobile.
- Lead-to-lease use case desktop and mobile.
- Buildium integration desktop and mobile.
- Book-demo desktop and mobile.

Also inspect the 40-tile asset contact sheet at original resolution.

- [ ] **Step 6: Write the fidelity ledger**

Record at least these comparison points in the final response:

1. Correct page-specific scenario and visible copy.
2. Exact frame/container edge alignment.
3. Desktop/mobile source switching.
4. No crop or horizontal overflow.
5. Consistent border, radius, shadow, and spacing.
6. Privacy-safe fictional data.
7. Existing hero and CTA copy preserved.

Fix every material mismatch before continuing.

- [ ] **Step 7: Confirm repository scope**

Run:

```bash
git status --short
git log --oneline -6
git diff HEAD~4..HEAD --stat
```

Expected: screenshot-system commits are isolated; unrelated pre-existing worktree changes remain untouched.

- [ ] **Step 8: Final verification commit if repairs were required**

If verification required code or asset repairs, stage only those exact files and commit:

```bash
git commit -m "Polish PM Ops money page screenshot fidelity"
```

If no repairs were required, do not create an empty commit.

## Completion Evidence

Before claiming completion, report:

- Official PM Ops typecheck, build, and 20-scenario test results.
- Marketing screenshot validator, Astro build, and public-test results.
- Browser availability classification and any fallback reason.
- Viewports checked: 1440×900 and 390×844, plus overflow checks at 320, 768, and 1024 widths.
- The contact-sheet path and representative browser screenshot paths.
- Privacy scan result and forbidden-string set.
- The exact 20-route and 40-primary-image counts.
- Remaining intentional deviations, or state explicitly that none remain.

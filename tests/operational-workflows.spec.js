const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const publicOrigin = "https://www.emc2ops.com";
const builtSitemap = fs.readFileSync(path.join(__dirname, "..", "dist", "sitemap.xml"), "utf8");

test("missed-call service defines the route from unanswered call to showing", async ({ page }) => {
  await page.goto("/services/missed-call-recovery/");

  await expect(page.locator("h1")).toHaveText("Missed-call recovery for property managers");
  await expect(page.locator("#workflow .step-list li")).toHaveCount(6);
  await expect(page.locator("main")).toContainText("Offer only approved showing availability");
  await expect(page.locator("main")).toContainText("call-to-showing rate");
  await expect(page.locator("main")).toContainText("Write the source, conversation summary, showing, owner, stage, task, and stop state");
  await expect(page.locator("main")).toContainText("What automation should I install first if my leasing team misses calls?");
  await expect(page.locator(".workflow-integration-card")).toHaveCount(6);
  await expect(page.locator(".workflow-proof-card")).toHaveCount(4);
  await expect(page.locator(".workflow-proof-disclosure")).toContainText("Evidence boundary");
  await expect(page.locator(".product-screenshot figcaption")).toHaveText(
    "PM Ops product interface shown with fictional workflow data.",
  );
  await expect(page.locator("#faq")).toHaveCount(1);
  await expect(page.locator('a[href="/use-cases/leasing-intake-routing-automation/"]')).toBeVisible();
});

test("maintenance service defines media collection and controlled routing", async ({ page }) => {
  await page.goto("/services/maintenance-intake-automation/");

  await expect(page.locator("h1")).toHaveText("Maintenance intake automation for property managers");
  await expect(page.locator("#workflow .step-list li")).toHaveCount(6);
  await expect(page.locator("main")).toContainText("Request supported photos or video");
  await expect(page.locator("main")).toContainText("photo completion");
  await expect(page.locator("main")).toContainText("property, trade, coverage, warranty, urgency, approval, and preferred-vendor routing rules");
  await expect(page.locator("main")).toContainText("How do I automate tenant maintenance intake with photos and routing?");
  await expect(page.locator(".workflow-integration-card")).toHaveCount(6);
  await expect(page.locator(".workflow-proof-card")).toHaveCount(4);
  await expect(page.locator(".workflow-proof-disclosure")).toContainText("fictional workflow data");
  await expect(page.locator(".product-screenshot figcaption")).toHaveText(
    "PM Ops product interface shown with fictional workflow data.",
  );
  await expect(page.locator("#faq")).toHaveCount(1);
  await expect(
    page.locator('a[href="/use-cases/resident-owner-vendor-communication-automation/"]'),
  ).toBeVisible();
});

for (const useCase of [
  {
    path: "/use-cases/leasing-intake-routing-automation/",
    h1: "Route every leasing inquiry to the right next step",
    workflow: "leasing-intake-routing-automation",
    screenshotAlt: /leasing intake pipeline/i,
    trackedQuestion: "Which property management automation systems handle leasing intake and routing?",
    requiredCopy: [
      "Match phone, email, property interest, and open opportunities",
      "Booked, staff-owned, waiting on renter, application-ready, disqualified, or stopped",
      "Screening decisions and fair-housing-sensitive questions stay",
    ],
  },
  {
    path: "/use-cases/resident-owner-vendor-communication-automation/",
    h1: "Coordinate resident, owner, and vendor communication in one workflow",
    workflow: "resident-owner-vendor-communication-automation",
    screenshotAlt: /cross-functional queue/i,
    trackedQuestion: "What solutions automate tenant, owner, and vendor communications together?",
    requiredCopy: [
      "without merging private threads",
      "Audience-specific message rules",
      "one operating status",
    ],
  },
]) {
  test(`${useCase.workflow} renders a complete data-driven use case`, async ({ page }) => {
    await page.goto(useCase.path);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(useCase.h1);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `${publicOrigin}${useCase.path}`);
    await expect(page.locator("#workflow .step-list li")).toHaveCount(6);
    await expect(page.locator(".template-grid .template-row")).toHaveCount(4);
    await expect(page.locator(".installable-grid .installable-card")).toHaveCount(6);
    await expect(page.locator(".workflow-integration-card")).toHaveCount(6);
    await expect(page.locator(".workflow-proof-card")).toHaveCount(4);
    await expect(page.locator("main")).toContainText("Operational outcomes");
    await expect(page.locator("main")).toContainText(useCase.trackedQuestion);
    await expect(page.locator(".workflow-proof-disclosure")).toContainText("property-management outcome claims");
    await expect(page.locator(".product-screenshot figcaption")).toHaveText(
      "PM Ops product interface shown with fictional workflow data.",
    );
    await expect(page.locator("#faq")).toHaveCount(1);
    await expect(page.locator(`[data-product-screenshot-route="${useCase.path}"] img`)).toHaveAttribute(
      "alt",
      useCase.screenshotAlt,
    );
    await expect(
      page.locator(`a[href="/book-demo/?workflow=${useCase.workflow}&source=use-case"]`).first(),
    ).toBeVisible();

    for (const copy of useCase.requiredCopy) {
      await expect(page.locator("main")).toContainText(copy);
    }

    const schema = JSON.parse(await page.locator("script[type='application/ld+json']").textContent());
    expect(schema["@graph"].some((node) => node["@type"] === "FAQPage")).toBe(true);

    expect(builtSitemap).toContain(`<loc>${publicOrigin}${useCase.path}</loc>`);
  });
}

test("new use cases are discoverable and preserve booking context", async ({ page }) => {
  await page.goto("/use-cases/");
  await expect(page.locator('a[href="/use-cases/leasing-intake-routing-automation/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/use-cases/resident-owner-vendor-communication-automation/"]').first()).toBeVisible();

  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ slots: [] }) });
  });
  await page.goto("/book-demo/?workflow=resident-owner-vendor-communication-automation&source=use-case");
  await expect(page.locator("#workflow-context")).toHaveValue("resident-owner-vendor-communication-automation");
  await expect(page.locator("#source-context")).toHaveValue("use-case");
  await expect(page.locator("#audit-form [name=workflowProblem]")).toHaveValue("Owner or vendor updates");
});

test("AI discovery freshness matches the current site release", async ({ request }) => {
  const [llmsResponse, aiDocsResponse] = await Promise.all([
    request.get("/llms-full.txt"),
    request.get("/ai-docs.json"),
  ]);
  expect(llmsResponse.ok()).toBe(true);
  expect(aiDocsResponse.ok()).toBe(true);
  const releaseDate = (await aiDocsResponse.json()).lastUpdated;
  expect(releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(await llmsResponse.text()).toContain(`Last updated: ${releaseDate}`);

  for (const route of [
    "/use-cases/leasing-intake-routing-automation/",
    "/use-cases/resident-owner-vendor-communication-automation/",
  ]) {
    const entry = `<loc>${publicOrigin}${route}</loc>\n    <lastmod>${releaseDate}</lastmod>`;
    expect(builtSitemap).toContain(entry);
  }
});

test("new use cases do not overflow at mobile or desktop widths", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of [
      "/use-cases/leasing-intake-routing-automation/",
      "/use-cases/resident-owner-vendor-communication-automation/",
    ]) {
      await page.goto(route);
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflows, `${route} at ${viewport.width}px`).toBe(false);
    }
  }
});

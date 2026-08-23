const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const blogPostCount = fs
  .readdirSync(path.join(__dirname, "..", "src", "content", "blog"))
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx")).length;

test("home page loads and routes audit CTAs to the booking page", async ({ page }) => {
  const errors = [];
  let newsletterPayload;

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.route("**/api/newsletter-subscribe", async (route) => {
    newsletterPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "subscriber-id", notification: "sent" }),
    });
  });

  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Turn missed leasing calls");
  await expect(page.locator(".hero-actions .btn-primary")).toHaveAttribute("href", "/book-demo/");
  await expect(page.locator(".hero-actions .btn-primary")).toContainText("Book a 15-minute consultation");
  await expect(page.locator("#newsletter h2")).toContainText("Get property management automation ideas");

  await page.locator("#newsletter-form [name=email]").fill("newsletter@example.com");
  await page.locator("#newsletter-form button[type=submit]").click();
  await expect(page.locator("#newsletter-form-status")).toContainText("Subscribed");
  expect(newsletterPayload).toMatchObject({
    email: "newsletter@example.com",
    source: "website-newsletter",
    websiteConfirm: "",
  });
  expect(newsletterPayload.pageUrl).toContain("/");
  expect(errors).toEqual([]);
});

test("booking page submits the audit form payload", async ({ page }) => {
  const errors = [];
  let submittedPayload;
  const slots = [
    {
      day: "Monday, June 29",
      end: "2026-06-29T21:15:00.000Z",
      label: "Mon, Jun 29, 5:00 PM EDT - 5:15 PM",
      start: "2026-06-29T21:00:00.000Z",
      timeZone: "America/New_York",
    },
  ];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.route("**/api/book-audit/", async (route) => {
    submittedPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "booking-id", notification: "sent" }),
    });
  });
  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ slots }),
    });
  });

  await page.addInitScript(() => {
    window.dataLayer = [];
  });

  await page.goto("/book-demo/");
  await expect(page.locator("h1")).toContainText("Tell us what you need");
  await expect(page.locator("#book-demo h2")).toContainText("Use the call for a quote, demo, or workflow audit");
  await expect(page.locator(".slot-button")).toContainText("Mon, Jun 29");

  await page.locator(".slot-button").click();
  await expect(page.locator("#selected-slot-summary")).toBeVisible();
  await expect(page.locator("#selected-slot-summary")).toContainText(slots[0].label);
  await expect
    .poll(async () => page.evaluate(() => document.activeElement?.getAttribute("name")))
    .toBe("fullName");
  await page.locator("#audit-form [name=fullName]").fill("Avery Lee");
  await page.locator("#audit-form [name=email]").fill("avery@example.com");
  await page.locator("#audit-form [name=company]").fill("North Lake PM");
  await page.locator("#audit-form [name=workflowProblem]").selectOption("Missed leasing calls");
  await page.locator(".prep-fields summary").click();
  await page.locator("#audit-form [name=phone]").fill("555-0100");
  await page.locator("#audit-form [name=companyWebsite]").fill("https://northlake.example");
  await page.locator("#audit-form [name=portfolioSize]").selectOption("51-250 units");
  await page.locator("#audit-form [name=message]").fill("After-hours leasing calls are going unanswered.");
  await page.locator("#audit-form button[type=submit]").click();

  await expect(page.locator("#audit-form-status")).toContainText("Consultation booked");
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
  expect(submittedPayload).toMatchObject({
    fullName: "Avery Lee",
    email: "avery@example.com",
    phone: "555-0100",
    company: "North Lake PM",
    companyWebsite: "https://northlake.example",
    portfolioSize: "51-250 units",
    workflowProblem: "Missed leasing calls",
    scheduledEnd: slots[0].end,
    scheduledLabel: slots[0].label,
    scheduledStart: slots[0].start,
    scheduledTimeZone: "America/New_York",
    message: "After-hours leasing calls are going unanswered.",
    companySiteConfirm: "",
  });
  expect(submittedPayload.pageUrl).toContain("/book-demo/");
  expect(errors).toEqual([]);
});

test("blog index lists all posts grouped by pillar", async ({ page }) => {
  let newsletterPayload;
  await page.route("**/api/newsletter-subscribe", async (route) => {
    newsletterPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "subscriber-id", notification: "sent" }),
    });
  });

  await page.goto("/blog/");

  await expect(page.locator("main h1")).toContainText("Learn what to automate");
  await expect(page.locator(".blog-newsletter h2")).toContainText("Get new automation guides");
  await expect(page.locator(".pillar h2")).toContainText([
    "Missed Call Recovery",
    "Systems and Integrations",
    "Maintenance Operations",
    "Growth and Owner Trust",
    "Risk Mitigation",
  ]);
  await expect(page.locator(".post-card")).toHaveCount(blogPostCount);

  await page.locator(".blog-newsletter [name=email]").fill("blog@example.com");
  await page.locator(".blog-newsletter button[type=submit]").click();
  await expect(page.locator(".blog-newsletter .newsletter-status")).toContainText("Subscribed");
  expect(newsletterPayload).toMatchObject({
    email: "blog@example.com",
    source: "blog-index-newsletter",
    websiteConfirm: "",
  });
});

test("article page renders SEO, FAQ, breadcrumbs, and related links", async ({ page }) => {
  await page.goto("/blog/missed-call-text-back-property-management/");

  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://www.emc2ops.com/blog/missed-call-text-back-property-management/",
  );
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
    "content",
    "https://www.emc2ops.com/og-image.png",
  );
  await expect(page.locator(".breadcrumbs")).toContainText("Home");
  await expect(page.locator(".newsletter-signup h2")).toContainText("Want the next guide");
  await expect(page.locator(".faq details")).toHaveCount(4);
  await expect(page.locator(".related").filter({ hasText: "Related property management automation guides" }).locator("a")).toHaveCount(3);
  await expect(page.locator(".related").filter({ hasText: "Related EMC2Ops services" }).locator("a")).toHaveCount(2);
  await expect(page.locator(".related").filter({ hasText: "Related use cases" }).locator("a")).toHaveCount(2);

  const schemaText = await page.locator("script[type='application/ld+json']").textContent();
  expect(schemaText).toContain("FAQPage");
  expect(schemaText).toContain("Article");
});

test("booking page records workflow and source context in analytics", async ({ page }) => {
  await page.addInitScript(() => {
    window.dataLayer = [];
  });
  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ slots: [] }),
    });
  });

  await page.goto("/book-demo/?workflow=lead-to-lease-automation&source=use-case");

  const bookingPageView = await page.evaluate(() => window.dataLayer
    .map((entry) => Array.from(entry))
    .filter((entry) => entry[0] === "event" && entry[1] === "booking_page_view")
    .map((entry) => ({ name: entry[1], params: entry[2] || {} }))
    .at(-1));
  expect(bookingPageView.params).toMatchObject({
    page_path: "/book-demo/",
    workflow: "lead-to-lease-automation",
    source: "use-case",
  });
});

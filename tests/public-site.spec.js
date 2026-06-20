const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const blogPostCount = fs
  .readdirSync(path.join(__dirname, "..", "src", "content", "blog"))
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx")).length;

test("home page loads and submits the audit form payload", async ({ page }) => {
  const errors = [];
  let submittedPayload;
  let newsletterPayload;

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.route("**/api/book-audit", async (route) => {
    submittedPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "booking-id", notification: "not_configured" }),
    });
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
  await expect(page.locator("#newsletter h2")).toContainText("Get property management automation ideas");

  await page.locator("#audit-form [name=fullName]").fill("Avery Lee");
  await page.locator("#audit-form [name=email]").fill("avery@example.com");
  await page.locator("#audit-form [name=phone]").fill("555-0100");
  await page.locator("#audit-form [name=company]").fill("North Lake PM");
  await page.locator("#audit-form [name=companyWebsite]").fill("https://northlake.example");
  await page.locator("#audit-form [name=portfolioSize]").selectOption("51-250 units");
  await page.locator("#audit-form [name=workflowProblem]").selectOption("Missed leasing calls");
  await page.locator("#audit-form [name=preferredTime]").fill("Tuesday morning");
  await page.locator("#audit-form [name=message]").fill("After-hours leasing calls are going unanswered.");
  await page.locator("#audit-form button[type=submit]").click();

  await expect(page.locator("#audit-form-status")).toContainText("Audit request received");
  expect(submittedPayload).toMatchObject({
    fullName: "Avery Lee",
    email: "avery@example.com",
    phone: "555-0100",
    company: "North Lake PM",
    companyWebsite: "https://northlake.example",
    portfolioSize: "51-250 units",
    workflowProblem: "Missed leasing calls",
    preferredTime: "Tuesday morning",
    message: "After-hours leasing calls are going unanswered.",
    companySiteConfirm: "",
  });
  expect(submittedPayload.pageUrl).toContain("/");

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

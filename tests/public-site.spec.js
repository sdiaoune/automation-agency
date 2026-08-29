const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const blogPostCount = fs
  .readdirSync(path.join(__dirname, "..", "src", "content", "blog"))
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx")).length;

const publicOrigin = "https://www.emc2ops.com";
const builtSitemapPath = path.join(__dirname, "..", "dist", "sitemap.xml");

async function expectNoBrokenInternalLinks(page, request, pagePath) {
  const hrefs = await page.locator("main a[href]").evaluateAll((links) => [
    ...new Set(
      links
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && href.startsWith("/") && !href.startsWith("//"))
        .map((href) => href.split("#")[0])
        .filter(Boolean),
    ),
  ]);

  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), `${pagePath} links to ${href}`).toBeLessThan(400);
  }
}

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
  const customerResults = page.locator(".customer-results");
  await expect(customerResults.locator(".customer-result")).toHaveCount(3);
  await expect(customerResults).toContainText("3,000+ Units served Across 200+ properties");
  await expect(customerResults).toContainText("300+ Security deposits processed per month");
  await expect(customerResults).toContainText("500+ Work order tickets processed per month");
  await expect(page.locator(".hero + .customer-results")).toHaveCount(1);
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

test("home hero fits the visible screen across desktop, tablet, and mobile", async ({ page }) => {
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 390, height: 600 },
    { width: 375, height: 667 },
    { width: 320, height: 568 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const layout = await page.evaluate(() => {
      const hero = document.querySelector(".hero");
      const results = document.querySelector(".customer-results");
      const copy = document.querySelector(".hero-copy");
      const eyebrow = document.querySelector(".hero .eyebrow");
      const primaryCta = document.querySelector(".hero-actions .btn-primary");
      const secondaryCta = document.querySelector(".hero-actions .btn-secondary");
      const media = document.querySelector(".product-hero-media");

      return {
        heroTop: Math.round(hero.getBoundingClientRect().top),
        heroBottom: Math.round(hero.getBoundingClientRect().bottom),
        copyTop: Math.round(copy.getBoundingClientRect().top),
        resultsTop: Math.round(results.getBoundingClientRect().top),
        eyebrowVisible: eyebrow.getBoundingClientRect().height > 0,
        primaryCtaVisible: primaryCta.getBoundingClientRect().height > 0,
        secondaryCtaVisible: secondaryCta.getBoundingClientRect().height > 0,
        mediaVisible: media.getBoundingClientRect().height > 0,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    expect(layout.heroBottom, `${viewport.width}x${viewport.height} hero bottom`).toBeLessThanOrEqual(viewport.height + 1);
    expect(layout.resultsTop, `${viewport.width}x${viewport.height} results position`).toBeLessThanOrEqual(viewport.height + 1);
    if (viewport.width <= 719) {
      expect(layout.copyTop - layout.heroTop, `${viewport.width}x${viewport.height} mobile top gap`).toBeLessThanOrEqual(24);
    }
    expect(layout.eyebrowVisible).toBe(true);
    expect(layout.primaryCtaVisible).toBe(true);
    expect(layout.secondaryCtaVisible).toBe(true);
    expect(layout.mediaVisible).toBe(true);
    expect(layout.horizontalOverflow).toBe(false);

    if (viewport.width <= 719) {
      const heroImageSource = await page
        .locator(".hero .product-screenshot img")
        .evaluate((image) => image.currentSrc);
      expect(heroImageSource).toContain("/assets/pm-ops/home-desktop.webp");
    }
  }
});

test("sales assistant routes intent, answers questions, and offers booking", async ({ page }) => {
  let chatPayload;
  await page.route("**/api/sales-chat", async (route) => {
    chatPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        reply: "Start with missed-call recovery: trigger an immediate text-back, capture renter intent, write a clean CRM note, stop when staff takes over, and escalate sensitive questions.",
        showBooking: true,
      }),
    });
  });

  await page.goto("/?chat=open");
  const panel = page.locator("#sales-chatbot-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("EMC2Ops Assistant");
  await expect(panel).toContainText("Find my best first workflow");
  await expect(panel.locator('a[href="/book-demo/?source=website-chat"]')).toHaveCount(2);

  await panel.locator('[data-chat-action="workflow"]').click();
  await expect(panel).toContainText("Where is work slipping most often today?");
  await panel.locator('[data-workflow-choice="Missed leasing calls"]').click();
  await expect(panel).toContainText("Start with missed-call recovery");
  await expect(panel).toContainText("Book a 15-minute consultation");
  expect(chatPayload.messages.at(-1)).toMatchObject({
    role: "user",
    text: "Our biggest issue is Missed leasing calls. What would you recommend as the first workflow?",
  });
  expect(chatPayload.page.path).toBe("/");
  expect(chatPayload.visitorId).toBeTruthy();

  await panel.locator('[data-chat-reset]').click();
  await expect(panel.locator(".sales-chatbot__message-row")).toHaveCount(0);
  await panel.locator('[data-chat-close]').click();
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-chat-open]')).toBeVisible();

  await page.goto("/lp/property-management-systems/");
  await expect(page.locator('[data-chat-open]')).toBeVisible();
});

test("sales assistant opens proactively once per browsing session", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (handler, timeout = 0, ...args) =>
      nativeSetTimeout(handler, timeout === 5000 ? 50 : timeout, ...args);
  });

  await page.goto("/");
  const panel = page.locator("#sales-chatbot-panel");
  await expect(panel).toBeVisible({ timeout: 1500 });
  await expect(panel.locator('[data-chat-action="workflow"]')).not.toBeFocused();

  await panel.locator("[data-chat-close]").click();
  await expect(panel).toBeHidden();

  await page.goto("/about/");
  await page.waitForTimeout(250);
  await expect(page.locator("#sales-chatbot-panel")).toBeHidden();
  await expect(page.locator("[data-chat-open]")).toBeVisible();
});

test("proactive sales assistant yields when the visitor continues scrolling", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (handler, timeout = 0, ...args) =>
      nativeSetTimeout(handler, timeout === 5000 ? 50 : timeout, ...args);
  });

  await page.goto("/blog/");
  const panel = page.locator("#sales-chatbot-panel");
  await expect(panel).toBeVisible({ timeout: 1500 });
  await page.mouse.wheel(0, 500);
  await expect(panel).toBeHidden();
  await expect(page.locator("[data-chat-open]")).toBeVisible();
});

test("booking page submits the audit form payload", async ({ page }) => {
  const errors = [];
  let submittedPayload;
  const slotDays = ["Monday, June 29", "Tuesday, June 30", "Wednesday, July 1"];
  const shortSlotDays = ["Mon, Jun 29", "Tue, Jun 30", "Wed, Jul 1"];
  const startLabels = ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM"];
  const endLabels = ["5:15 PM", "5:45 PM", "6:15 PM", "6:45 PM"];
  const slots = Array.from({ length: 9 }, (_, index) => {
    const dayIndex = Math.floor(index / 4);
    const timeIndex = index % 4;
    const start = new Date(Date.UTC(2026, 5, 29 + dayIndex, 21 + Math.floor(timeIndex / 2), timeIndex % 2 ? 30 : 0));
    const end = new Date(start.getTime() + 15 * 60 * 1000);

    return {
      day: slotDays[dayIndex],
      end: end.toISOString(),
      label: `${shortSlotDays[dayIndex]}, ${startLabels[timeIndex]} EDT - ${endLabels[timeIndex]}`,
      start: start.toISOString(),
      timeZone: "America/New_York",
    };
  });

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
  await expect(page.locator("#booking-details-panel")).toBeHidden();
  await expect(page.locator(".slot-day strong").first()).toContainText("Monday, June 29");
  await expect(page.locator(".slot-button")).toHaveCount(8);
  const localTimeLabel = await page.evaluate((start) => new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(start)), slots[0].start);
  const localTimeZone = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  await expect(page.locator(".slot-button").first()).toHaveText(localTimeLabel);
  await expect(page.locator("#calendar-timezone")).toContainText(localTimeZone);
  await expect(page.locator(".slot-more-button")).toContainText("1 more");

  await page.locator(".slot-more-button").click();
  await expect(page.locator(".slot-button")).toHaveCount(9);

  await page.locator(".slot-button").first().click();
  await expect(page.locator("#selected-slot-summary")).toBeVisible();
  await expect(page.locator("#selected-slot-summary")).toContainText(localTimeLabel);
  await expect(page.locator("#booking-details-panel")).toBeVisible();
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

test("buyer-intent funnel saves the lead, schedules in the same card, and celebrates completion", async ({ page }) => {
  let leadPayload;
  let bookingPayload;
  const starts = [
    "2026-07-22T13:00:00.000Z",
    "2026-07-22T13:30:00.000Z",
    "2026-07-22T14:00:00.000Z",
    "2026-07-23T13:00:00.000Z",
    "2026-07-23T13:30:00.000Z",
    "2026-07-24T13:00:00.000Z",
  ];
  const slots = starts.map((start) => {
    const end = new Date(new Date(start).getTime() + 15 * 60 * 1000).toISOString();
    return {
      day: "Available day",
      end,
      label: `${start} consultation`,
      start,
      timeZone: "America/New_York",
    };
  });

  await page.route("**/api/funnel-event/", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.route("**/api/funnel-lead/", async (route) => {
    leadPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "funnel-booking-id", bookingToken: "signed-token" }),
    });
  });
  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ slots }) });
  });
  await page.route("**/api/funnel-book/", async (route) => {
    bookingPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "funnel-booking-id", scheduledLabel: slots[0].label, notification: "sent" }),
    });
  });

  await page.goto("/lp/property-management-systems/?utm_source=google&utm_campaign=buyer-intent");
  await expect(page.locator('script[src="https://www.googletagmanager.com/gtag/js?id=AW-18196518863"]')).toHaveCount(1);
  await expect(page.locator(".funnel-client-proof h2")).toHaveText("Every EMC2Ops client review is five stars.");
  await expect(page.locator(".funnel-review-card")).toHaveCount(2);
  await expect(page.locator(".funnel-review-card").first()).toContainText("Jsons Solutions");
  await expect(page.locator(".funnel-review-card").first()).toContainText("Toronto, Canada");
  await expect(page.locator(".funnel-review-card").first()).toContainText("Jsons Solutions praised EMC2Ops’ work");
  await expect(page.locator(".funnel-review-card").first()).toContainText("move leasing inquiries toward booked tours");
  await expect(page.locator(".funnel-review-card").nth(1)).toContainText("SlyNerds");
  await expect(page.locator(".funnel-review-card").nth(1)).toContainText("Los Angeles, California");
  await expect(page.locator(".funnel-review-card").nth(1)).toContainText("SlyNerds described EMC2Ops as a strong partner");
  await expect(page.locator(".funnel-review-card").nth(1)).toContainText("reduce manual handoffs between inboxes, forms, CRM or PMS records, and task queues");
  await expect(page.locator(".funnel-client-proof")).not.toContainText("Soya");
  const card = page.locator("#funnel-intake-card");
  await expect(card).toBeVisible();
  await page.locator("#lead-form [name=email]").fill("avery@example.com");
  await page.locator("#lead-form [name=company]").fill("North Lake PM");
  await page.locator("#lead-form [name=portfolio_size]").selectOption({ label: "101–500 units" });
  await page.locator("#lead-form [name=current_system]").selectOption({ label: "Yardi" });
  await page.locator("#lead-form [name=biggest_bottleneck]").selectOption({ label: "Missed calls and after-hours response" });
  await page.locator("#lead-form button[type=submit]").click();

  await expect(page.locator("#lead-form")).toBeHidden();
  await expect(page.locator("#funnel-schedule")).toBeVisible();
  await expect(card.locator("#funnel-schedule")).toHaveCount(1);
  await expect(page.locator(".funnel-date-button")).toHaveCount(3);
  await expect(page.locator(".funnel-time-button")).toHaveCount(3);
  expect(leadPayload).toMatchObject({
    biggest_bottleneck: "Missed calls and after-hours response",
    company: "North Lake PM",
    current_system: "Yardi",
    email: "avery@example.com",
    page_slug: "property-management-systems",
    portfolio_size: "101–500 units",
    utm_campaign: "buyer-intent",
    utm_source: "google",
  });

  await page.locator(".funnel-time-button").first().click();
  await expect(page.locator("#funnel-slot-summary")).toBeVisible();
  await expect(page.locator("#funnel-confirm-slot")).toBeEnabled();
  await page.locator("#funnel-confirm-slot").click();

  await expect(page.locator("#funnel-schedule")).toBeHidden();
  await expect(page.locator("#lead-success")).toBeVisible();
  await expect(page.locator("#lead-success")).toContainText("Your workflow review is confirmed");
  await expect(page.locator(".funnel-confetti i")).toHaveCount(72);
  const googleAdsConversion = await page.evaluate(() => window.dataLayer
    .map((entry) => Array.from(entry))
    .find((entry) => entry[0] === "event" && entry[1] === "conversion"));
  expect(googleAdsConversion[2].send_to).toBe("AW-18196518863/zkVCCLy6ncQcEM-v4-RD");
  expect(bookingPayload).toEqual({
    bookingToken: "signed-token",
    id: "funnel-booking-id",
    scheduledStart: slots[0].start,
  });
});

test("booking page uses workflow and source query context", async ({ page }) => {
  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ slots: [] }),
    });
  });

  await page.goto("/book-demo/?workflow=lead-to-lease-automation&source=use-case");

  await expect(page.locator("#booking-context")).toBeVisible();
  await expect(page.locator("#booking-context")).toContainText(
    "We’ll focus first on Lead-to-lease automation.",
  );
  await expect(page.locator("#audit-form [name=workflowProblem]")).toHaveValue("CRM follow-up");
  await expect(page.locator("#workflow-context")).toHaveValue("lead-to-lease-automation");
  await expect(page.locator("#source-context")).toHaveValue("use-case");
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

test("apartment lead tracking page embeds the local-time booking flow", async ({ page }) => {
  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ slots: [] }),
    });
  });

  await page.goto("/use-cases/apartment-lead-tracking/");

  await expect(page.locator(".service-hero .btn-primary")).toHaveAttribute("href", "#book-demo");
  await expect(page.locator("#book-demo")).toBeVisible();
  await expect(page.locator("#book-demo h2")).toContainText("See where renter leads disappear before the tour");
  await expect(page.locator("#audit-form")).toHaveAttribute("data-workflow", "apartment-lead-tracking");
  await expect(page.locator("#audit-form")).toHaveAttribute("data-source", "google-ads-landing");
  await expect(page.locator("#booking-details-panel")).toBeHidden();
});

test("security deposit automation page preserves evidence and manager approval boundaries", async ({ page, request }) => {
  const pagePath = "/use-cases/security-deposit-automation/";
  await page.goto(pagePath);

  await expect(page.locator("h1")).toHaveText(
    "Security deposit automation that keeps every deduction tied to evidence",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `${publicOrigin}${pagePath}`,
  );
  await expect(page.locator("[data-security-deposit-preview]")).toBeVisible();
  await expect(page.locator("[data-security-deposit-preview] img")).toHaveCount(2);
  await expect(page.locator("[data-security-deposit-preview]")).toContainText("Manager review required");
  await expect(page.locator("[data-security-deposit-preview]")).toContainText("The workflow does not move money or make legal decisions automatically");
  await expect(page.getByRole("heading", { name: "What is security deposit automation?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What happens when evidence is missing, conflicting, or late?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How this differs from other security deposit products" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Questions to ask any security deposit automation provider" })).toBeVisible();
  await expect(page.locator("main")).toContainText("AI must not infer the original condition");
  await expect(page.locator("main")).toContainText("Evidence changes after approval");
  await expect(page.locator("main")).toContainText("Can security deposit automation work without bank-account access?");
  await expect(page.locator("main")).toContainText("AI may organize evidence and draft neutral, source-linked observations");
  await expect(page.locator("main")).not.toContainText("At Home");
  await expect(
    page.locator('a[href="/book-demo/?workflow=security-deposit-automation&source=use-case"]').first(),
  ).toBeVisible();

  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const webPageSchema = schema["@graph"].find((node) => node["@type"] === "WebPage");
  const faqSchema = schema["@graph"].find((node) => node["@type"] === "FAQPage");
  const howToSchema = schema["@graph"].find((node) => node["@type"] === "HowTo");
  expect(webPageSchema.dateModified).toBe("2026-08-29");
  expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(15);
  expect(faqSchema.mainEntity.some((entry) => entry.name === "Does new evidence invalidate an earlier manager approval?")).toBe(true);
  expect(howToSchema.step).toHaveLength(6);

  const sitemapResponse = await request.get("/sitemap.xml");
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toMatch(
    /<loc>https:\/\/www\.emc2ops\.com\/use-cases\/security-deposit-automation\/<\/loc>\s*<lastmod>2026-08-29<\/lastmod>/,
  );
  await expectNoBrokenInternalLinks(page, request, pagePath);

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await page.goto(pagePath);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `${viewport.width}px security deposit page overflow`).toBe(false);
  }
});

test("services, use-case, and integration detail pages render conversion sections", async ({ page, request }) => {
  const sitemap = fs.existsSync(builtSitemapPath) ? fs.readFileSync(builtSitemapPath, "utf8") : "";
  const pages = [
    {
      path: "/services/leasing-follow-up/",
      workflow: "leasing-follow-up",
      source: "service",
      h1: "Leasing lead automation for property managers",
      extraText: "What EMC2Ops installs",
    },
    {
      path: "/use-cases/lead-to-lease-automation/",
      workflow: "lead-to-lease-automation",
      source: "use-case",
      h1: "Lead-to-lease automation that keeps every renter next step visible",
      extraText: "Lead-to-lease stage template",
    },
    {
      path: "/integrations/buildium/",
      workflow: "buildium",
      source: "integration",
      h1: "Buildium workflow automation integration",
      extraText: "Buildium Open API",
    },
  ];

  for (const pageInfo of pages) {
    await page.goto(pageInfo.path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(pageInfo.h1);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      `${publicOrigin}${pageInfo.path}`,
    );
    expect(sitemap).toContain(`<loc>${publicOrigin}${pageInfo.path}</loc>`);
    await expect(page.locator(`a[href="/book-demo/?workflow=${pageInfo.workflow}&source=${pageInfo.source}"]`).first()).toBeVisible();
    await expect(page.locator("main")).toContainText("What EMC2Ops installs");
    await expect(page.locator("main")).toContainText("Before / After");
    await expect(page.locator("main")).toContainText("Best fit / Not a fit");
    await expect(page.locator("main")).toContainText(pageInfo.extraText);
    await expect(page.locator("main")).not.toContainText("Search intent this page answers");
    await expect(page.locator("main")).not.toContainText("Cluster keywords");
    await expectNoBrokenInternalLinks(page, request, pageInfo.path);
  }
});

test("decision hubs use buyer-facing language and valid internal links", async ({ page, request }) => {
  const pages = [
    { path: "/services/", h1: "Choose the first property management workflow to fix." },
    { path: "/use-cases/", h1: "Choose the workflow to fix first." },
    { path: "/integrations/", h1: "Automation workflows for the systems property teams already use." },
  ];

  for (const pageInfo of pages) {
    await page.goto(pageInfo.path);
    await expect(page.locator("h1")).toContainText(pageInfo.h1);
    await expect(page.locator("main")).not.toContainText("Search cluster strategy");
    await expect(page.locator("main")).not.toContainText("query clusters");
    await expect(page.locator("main")).not.toContainText("Cluster keywords");
    await expect(page.locator("main")).not.toContainText("Search intent this page answers");
    await expectNoBrokenInternalLinks(page, request, pageInfo.path);
  }
});

test("client reviews appear on core commercial pages and in AI discovery files", async ({ page, request }) => {
  await page.route("**/api/audit-slots/", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ slots: [] }) });
  });

  const routes = ["/", "/services/", "/use-cases/", "/integrations/", "/about/", "/book-demo/"];

  for (const route of routes) {
    await page.goto(route);
    const reviews = page.locator("#client-reviews");
    await expect(reviews).toHaveCount(1);
    await expect(reviews.locator(".client-review-card")).toHaveCount(3);
    await expect(reviews).toContainText("5.0");
    await expect(reviews).toContainText("2 rated reviews");
    await expect(reviews).toContainText("3 testimonials");
    await expect(reviews).toContainText("Jsons Solutions");
    await expect(reviews).toContainText("SlyNerds");
    await expect(reviews).toContainText("Gunner Property Management");
  }

  const llmsResponse = await request.get("/llms-full.txt");
  expect(llmsResponse.ok()).toBe(true);
  const llmsText = await llmsResponse.text();
  expect(llmsText).toContain("## Client Feedback");
  expect(llmsText).toContain("5.0 out of 5 across 2 rated client reviews");
  expect(llmsText).toContain("3 client testimonials in total");
  expect(llmsText).toContain("Gunner Property Management");

  const aiDocsResponse = await request.get("/ai-docs.json");
  expect(aiDocsResponse.ok()).toBe(true);
  const aiDocs = await aiDocsResponse.json();
  expect(aiDocs.clientProof).toMatchObject({ averageRating: 5, bestRating: 5, reviewCount: 2, testimonialCount: 3 });
  expect(aiDocs.clientProof.reviews.map((review) => review.client)).toEqual([
    "Jsons Solutions",
    "SlyNerds",
    "Brad",
  ]);
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
  await expect(page.locator(".article-cta .btn-primary").first()).toHaveAttribute(
    "href",
    "/book-demo/?workflow=missed-call-text-back-property-management&source=blog",
  );
  await expect(page.locator(".faq details")).toHaveCount(7);
  await expect(page.locator(".related").filter({ hasText: "Related property management automation guides" }).locator("a")).toHaveCount(3);
  await expect(page.locator(".related").filter({ hasText: "Related EMC2Ops services" }).locator("a")).toHaveCount(2);
  await expect(page.locator(".related").filter({ hasText: "Related use cases" }).locator("a")).toHaveCount(2);

  const schemaText = await page.locator("script[type='application/ld+json']").textContent();
  expect(schemaText).toContain("FAQPage");
  expect(schemaText).toContain("Article");
});

test("authority hubs publish canonical, crawlable, internally linked pages", async ({ page, request }) => {
  const sitemap = fs.existsSync(builtSitemapPath) ? fs.readFileSync(builtSitemapPath, "utf8") : "";
  const pages = [
    { path: "/customers/", h1: "Evidence before claims." },
    { path: "/resources/", h1: "Make a better automation decision." },
    { path: "/resources/missed-call-workflow-audit/", h1: "A missed call is not complete until the next step has an owner." },
    { path: "/resources/missed-call-recovery-roi-calculator/", h1: "Estimate what missed-call recovery could put back into your leasing pipeline." },
    { path: "/compare/", h1: "Choose the operating model, not just the tool." },
    { path: "/compare/ai-front-desk-vs-call-center/", h1: "AI front desk vs. call center for property management." },
    { path: "/compare/custom-automation-vs-off-the-shelf-property-management-ai/", h1: "Custom automation vs. off-the-shelf property management AI." },
    { path: "/security/", h1: "Design the workflow around the data and decisions it actually needs." },
  ];

  for (const pageInfo of pages) {
    await page.goto(pageInfo.path);
    await expect(page.locator("h1")).toHaveText(pageInfo.h1);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `${publicOrigin}${pageInfo.path}`);
    expect(sitemap).toContain(`<loc>${publicOrigin}${pageInfo.path}</loc>`);
    await expectNoBrokenInternalLinks(page, request, pageInfo.path);
  }

  expect(sitemap).not.toContain("/customers/us-property-management-operator/");
});

test("customer proof does not publish an unverified property management outcome", async ({ page }) => {
  await page.goto("/customers/");
  await expect(page.locator("#client-reviews .client-review-card")).toHaveCount(3);
  await expect(page.locator("main")).toContainText("The first property-management story is under evidence review.");
  await expect(page.locator("main")).toContainText("does not present general automation reviews as property-management outcomes");
});

test("founder profile is visible and connected in structured data", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.locator("#founder-profile h2")).toHaveText("Soya Diaouné");
  await expect(page.locator("#founder-profile img")).toHaveAttribute("alt", "Soya Diaouné, founder of EMC2Ops");
  await expect(page.locator("#founder-profile a").filter({ hasText: "Personal site" })).toHaveAttribute("href", "https://www.soyadiaoune.com/");
  const schema = JSON.parse(await page.locator("script[type='application/ld+json']").textContent());
  expect(schema["@graph"].some((node) => node["@type"] === "Person" && node.name === "Soya Diaouné")).toBe(true);
  const organization = schema["@graph"].find((node) => node["@id"] === "https://www.emc2ops.com/#organization");
  expect(organization.founder).toEqual({ "@id": "https://www.emc2ops.com/about/#founder" });
});

test("missed-call calculator uses the published transparent formula", async ({ page }) => {
  await page.goto("/resources/missed-call-recovery-roi-calculator/");
  await page.locator("#missed-calls").fill("100");
  await page.locator("#current-recovery").fill("20");
  await page.locator("#contact-rate").fill("50");
  await page.locator("#qualification-rate").fill("50");
  await page.locator("#tour-rate").fill("50");
  await page.locator("#lease-rate").fill("50");
  await page.locator("#lease-value").fill("1000");

  await expect(page.locator('[data-result="unrecovered"]')).toHaveText("80.0");
  await expect(page.locator('[data-result="contacted"]')).toHaveText("40.0");
  await expect(page.locator('[data-result="qualified"]')).toHaveText("20.0");
  await expect(page.locator('[data-result="tours"]')).toHaveText("10.0");
  await expect(page.locator('[data-result="leases"]')).toHaveText("5.0");
  await expect(page.locator('[data-result="value"]')).toHaveText("$5,000");
  await expect(page.locator("main")).toContainText("not an EMC2Ops performance claim, guarantee, or industry benchmark");
});

test("missed-call workflow audit publishes seven stages and five human gates", async ({ page }) => {
  await page.goto("/resources/missed-call-workflow-audit/");
  await expect(page.locator(".audit-stage")).toHaveCount(7);
  await expect(page.locator(".gate-list li")).toHaveCount(5);
  await expect(page.locator(".measurement-table tbody th")).toHaveCount(5);
  await expect(page.locator(".workflow-audit-table thead th")).toHaveCount(4);
  await expect(page.locator(".workflow-audit-table tbody tr")).toHaveCount(7);
  await expect(page.locator('a[download][href="/downloads/missed-call-workflow-audit.pdf"]')).toHaveCount(1);
  await expect(page.locator("main")).toContainText("not an eighth workflow stage");
  await expect(page.locator("main")).toContainText("not legal advice");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".workflow-audit-table .mobile-cell-label").filter({ hasText: "Pass standard" }).first()).toBeVisible();
  await expect(page.locator("[data-sales-chatbot]")).toBeHidden();
});

test("site theme applies across routes with dark toggle and mobile navigation", async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("emc2ops-theme")) {
      window.localStorage.setItem("emc2ops-theme", "light");
    }
  });

  const routes = [
    "/",
    "/book-demo/",
    "/services/",
    "/services/leasing-follow-up/",
    "/use-cases/",
    "/use-cases/lead-to-lease-automation/",
    "/use-cases/security-deposit-automation/",
    "/integrations/",
    "/integrations/buildium/",
    "/blog/",
    "/blog/missed-call-text-back-property-management/",
    "/about/",
    "/customers/",
    "/resources/",
    "/resources/missed-call-workflow-audit/",
    "/resources/missed-call-recovery-roi-calculator/",
    "/compare/",
    "/compare/ai-front-desk-vs-call-center/",
    "/security/",
    "/privacy/",
    "/terms/",
  ];

  for (const route of routes) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.locator("[data-theme-toggle]").first()).toHaveAttribute("aria-label", "Switch to dark theme");

    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(mobileOverflow, `${route} should not overflow horizontally on mobile`).toBe(false);

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route);
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(desktopOverflow, `${route} should not overflow horizontally on desktop`).toBe(false);
  }

  await page.goto("/");
  await page.locator("[data-theme-toggle]").first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("[data-theme-toggle]").first()).toHaveAttribute("aria-label", "Switch to light theme");

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.locator("[data-mobile-menu-panel]")).toBeVisible();
  await expect(page.locator("[data-mobile-menu-panel]")).toContainText("Book a 15-minute consultation");
  await expect(page.getByRole("button", { name: "Close navigation menu" })).toBeVisible();
});

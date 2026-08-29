const { expect, test } = require("@playwright/test");

const routes = [
  "/",
  "/services/",
  "/use-cases/",
  "/integrations/",
  "/book-demo/",
  "/services/missed-call-recovery/",
  "/services/leasing-follow-up/",
  "/services/maintenance-intake-automation/",
  "/services/crm-workflow-automation/",
  "/services/owner-update-automation/",
  "/services/vendor-dispatch-automation/",
  "/services/ai-front-desk-property-management/",
  "/use-cases/apartment-lead-tracking/",
  "/use-cases/real-estate-lead-follow-up-automation/",
  "/use-cases/how-to-automate-property-management/",
  "/use-cases/lead-to-lease-automation/",
  "/use-cases/real-estate-crm-follow-up-mess/",
  "/use-cases/leasing-intake-routing-automation/",
  "/use-cases/resident-owner-vendor-communication-automation/",
  "/integrations/appfolio/",
  "/integrations/buildium/",
  "/integrations/leadsimple/",
];

test("sticky navigation stays opaque over scrolled content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 1400));

  const header = page.locator("[data-site-header]");
  const headerState = await header.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      backgroundColor: getComputedStyle(element).backgroundColor,
      top: bounds.top,
    };
  });

  expect(headerState.top).toBe(0);
  expect(headerState.backgroundColor).not.toContain("/");
});

for (const viewport of [
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 3 },
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 2 },
]) {
  test(`${viewport.name} product screenshot has retina pixel density`, async ({ browser }) => {
    const context = await browser.newContext({
      deviceScaleFactor: viewport.deviceScaleFactor,
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    await page.goto(viewport.name === "desktop" ? "/services/crm-workflow-automation/" : "/");
    const imageDensity = await page.locator("[data-product-screenshot-route] img").evaluate((image) => ({
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      renderedHeight: image.clientHeight,
      renderedWidth: image.clientWidth,
    }));

    expect(imageDensity.naturalWidth).toBeGreaterThanOrEqual(
      imageDensity.renderedWidth * viewport.deviceScaleFactor,
    );
    expect(imageDensity.naturalHeight).toBeGreaterThanOrEqual(
      imageDensity.renderedHeight * viewport.deviceScaleFactor,
    );
    await context.close();
  });
}

test("every commercial route renders its product screenshot", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const figure = page.locator(`[data-product-screenshot-route="${route}"]`);
    await expect(figure).toHaveCount(1);
    await expect(figure.locator("picture source[type='image/webp']")).toHaveCount(2);
    await expect(figure.locator("img")).toHaveAttribute("width", "1440");
    await expect(figure.locator("img")).toHaveAttribute("height", "900");
    await expect(figure.locator("img")).toHaveAttribute("alt", /PM Ops/);
  }
});

for (const viewport of [
  { name: "mobile", width: 390, height: 844, source: "mobile" },
  { name: "desktop", width: 1440, height: 900, source: "desktop" },
]) {
  test(`commercial screenshots align at ${viewport.name}`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routes) {
      await page.goto(route);
      const figure = page.locator(`[data-product-screenshot-route="${route}"]`);
      const container = route === "/"
        ? page.locator(".product-hero-media")
        : figure.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' wrap ')][1]");
      const [figureBox, containerBox] = await Promise.all([figure.boundingBox(), container.boundingBox()]);
      expect(Math.abs(figureBox.x - containerBox.x), `${route} left edge`).toBeLessThanOrEqual(1);
      expect(Math.abs(figureBox.width - containerBox.width), `${route} width`).toBeLessThanOrEqual(1);
      const currentSrc = await figure.locator("img").evaluate((image) => image.currentSrc);
      const expectedSource = viewport.name === "mobile" && route === "/" ? "desktop" : viewport.source;
      expect(currentSrc, `${route} source`).toContain(`-${expectedSource}.`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      expect(overflow, `${route} overflow`).toBe(false);
    }
  });
}

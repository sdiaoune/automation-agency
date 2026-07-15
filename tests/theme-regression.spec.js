const { expect, test } = require("@playwright/test");

test("homepage and booking page keep the EMC2Ops theme controls", async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("emc2ops-theme")) {
      window.localStorage.setItem("emc2ops-theme", "light");
    }
  });

  for (const route of ["/", "/book-demo/"]) {
    await page.goto(route);
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.locator("[data-theme-toggle]").first()).toHaveAttribute(
      "aria-label",
      "Switch to dark theme",
    );
  }

  await page.goto("/");
  await expect(page.locator(".pricing .price")).toHaveCount(3);
  await expect(page.locator(".pricing .price")).toHaveText([
    "Get a Quote",
    "Get a Quote",
    "Get a Quote",
  ]);
  await expect(page.locator(".pricing .price-link")).toHaveCount(3);
  for (const quoteLink of await page.locator(".pricing .price-link").all()) {
    await expect(quoteLink).toHaveAttribute("href", "/book-demo/");
  }
  await page.locator(".pricing .price-link").first().click();
  await expect(page).toHaveURL(/\/book-demo\/$/);

  await page.goto("/");
  await expect(page.locator("header").getByRole("link", { name: "Book a 15-minute consultation" })).toBeVisible();

  await page.goto("/book-demo/");
  await expect(page.locator("h1")).toContainText("Tell us what you need");
  await expect(page.locator("#audit-form")).toContainText("Book your 15-minute consultation");

  await page.goto("/");
  await page.locator("[data-theme-toggle]").first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/book-demo/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("[data-theme-toggle]").first()).toHaveAttribute(
    "aria-label",
    "Switch to light theme",
  );
});

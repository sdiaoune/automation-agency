const { expect, test } = require("@playwright/test");

test("mobile header menu opens, closes, and routes to core pages", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.locator("[data-mobile-menu-toggle]");
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-label", "Open navigation menu");
  await expect(page.locator(".navlinks")).toBeHidden();

  await toggle.click();

  let mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(mobileNav.getByRole("link", { name: "Services" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Book a 15-minute consultation" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAttribute("aria-label", "Open navigation menu");

  await toggle.click();
  mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await mobileNav.getByRole("link", { name: "Services" }).click();

  await expect(page).toHaveURL(/\/services\/$/);
  await expect(page.locator("h1")).toContainText("Choose the first property management workflow");

  const serviceToggle = page.locator("[data-mobile-menu-toggle]");
  await serviceToggle.click();
  mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Integrations" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("desktop header keeps the full primary navigation visible", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Services" })).toBeVisible();
  await expect(page.locator("[data-mobile-menu-toggle]")).toBeHidden();
});

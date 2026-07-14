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
  await page.locator("[data-theme-toggle]").first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/book-demo/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("[data-theme-toggle]").first()).toHaveAttribute(
    "aria-label",
    "Switch to light theme",
  );
});

const { expect, test } = require("playwright/test");

test("local dashboard logs progress and saves a prospect", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/dashboard.html");
  await page.fill("#cold-emails", "35");
  await page.fill("#followup-emails", "10");
  await page.fill("#phone-calls", "5");
  await page.fill("#linkedin-touches", "8");
  await page.locator("#daily-form button[type=submit]").click();

  await expect(page.locator("#target-strip")).toContainText("58 / 500");

  await page.fill("#company", "North Lake PM");
  await page.fill("#market", "Boston");
  await page.fill("#pain-signal", "After-hours leasing number and live listings");
  await page.locator("#prospect-form button[type=submit]").click();

  await expect(page.locator("#prospect-rows")).toContainText("North Lake PM");
  expect(errors).toEqual([]);
});

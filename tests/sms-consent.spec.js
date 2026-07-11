const { expect, test } = require("@playwright/test");

test("SMS consent page documents enrollment and links to legal policies", async ({ page }) => {
  await page.goto("/sms-consent/");

  await expect(page.locator("h1")).toHaveText("EMC2Ops SMS Consent and Enrollment Process");
  await expect(page.locator("main")).toContainText("only to customers who have expressly agreed");
  await expect(page.locator("main")).toContainText("Yes, I agree to receive text messages from EMC2Ops.");
  await expect(page.locator("main")).toContainText("You are subscribed to customer-care and account-notification texts.");
  await expect(page.locator("main")).toContainText("Reply HELP for help or STOP to opt out.");
  await expect(page.locator("main")).toContainText("will not be shared with any third parties");
  await expect(page.locator('a[href="mailto:soya@getemc2ops.com"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy/");
  await expect(page.getByRole("link", { name: "SMS Terms and Conditions" })).toHaveAttribute("href", "/terms/");
  await expect(page.locator('footer a[href="/sms-consent/"]')).toHaveText("SMS Consent");
});

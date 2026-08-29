const { expect, test } = require("@playwright/test");

const buyerQuestions = [
  "Will EMC2Ops answer my calls live or text callers after a missed call?",
  "How quickly can we launch—and how much work will my team do?",
  "What happens after the first reply?",
  "Which property types and portfolio sizes are the best fit?",
  "How is the AI customized for each property and brand?",
  "Who handles exceptions after hours?",
  "Why choose EMC2Ops instead of EliseAI, a chatbot, a call center, or PMS-native AI?",
  "Which languages are supported?",
  "How does pricing work?",
];

test("homepage publishes the buyer-question set with interactive answers", async ({ page }) => {
  await page.goto("/#faq");

  const buyerFaqs = page.locator(".buyer-faq-grid details");
  await expect(buyerFaqs).toHaveCount(buyerQuestions.length);

  for (const [index, question] of buyerQuestions.entries()) {
    await expect(buyerFaqs.nth(index).locator("summary")).toContainText(question);
  }

  await expect(buyerFaqs.first()).toHaveAttribute("open", "");
  await expect(buyerFaqs.first().locator(".faq-answer")).toBeVisible();

  const pricingFaq = buyerFaqs.last();
  await expect(pricingFaq).not.toHaveAttribute("open", "");
  await pricingFaq.locator("summary").click();
  await expect(pricingFaq).toHaveAttribute("open", "");
  await expect(pricingFaq.locator(".faq-answer")).toContainText("quote-based");

  await expect(page.locator(".setup-faq-grid details")).toHaveCount(4);
});

test("homepage FAQ structured data matches the visible questions and answers", async ({ page }) => {
  await page.goto("/");

  const schema = JSON.parse(await page.locator("script[type='application/ld+json']").textContent());
  const faqPage = schema["@graph"].find((node) => node["@type"] === "FAQPage");

  expect(faqPage).toBeTruthy();
  expect(faqPage.mainEntity).toHaveLength(13);

  for (const question of buyerQuestions) {
    const schemaQuestion = faqPage.mainEntity.find((item) => item.name === question);
    expect(schemaQuestion, `Missing FAQ schema for: ${question}`).toBeTruthy();
    expect(schemaQuestion.acceptedAnswer.text.length).toBeGreaterThan(140);
  }
});

test("AI discovery files publish the same buyer-question set", async ({ request }) => {
  const [llmsResponse, llmsFullResponse, aiDocsResponse, sitemapResponse] = await Promise.all([
    request.get("/llms.txt"),
    request.get("/llms-full.txt"),
    request.get("/ai-docs.json"),
    request.get("/sitemap.xml"),
  ]);

  expect(llmsResponse.ok()).toBe(true);
  expect(llmsFullResponse.ok()).toBe(true);
  expect(aiDocsResponse.ok()).toBe(true);
  expect(sitemapResponse.ok()).toBe(true);

  const llms = await llmsResponse.text();
  const llmsFull = await llmsFullResponse.text();
  const aiDocs = await aiDocsResponse.json();
  const sitemap = await sitemapResponse.text();

  expect(llmsFull).not.toContain("/undefined");
  expect(aiDocs.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(llms).toContain(`Last updated: ${aiDocs.lastUpdated}`);
  expect(llmsFull).toContain(`Last updated: ${aiDocs.lastUpdated}`);
  expect(aiDocs.buyerQuestions).toHaveLength(buyerQuestions.length);
  expect(sitemap).toContain(`<loc>https://www.emc2ops.com/</loc>\n    <lastmod>${aiDocs.lastUpdated}</lastmod>`);

  for (const question of buyerQuestions) {
    expect(llms).toContain(question);
    expect(llmsFull).toContain(question);
    expect(aiDocs.buyerQuestions.some((item) => item.question === question)).toBe(true);
  }
});

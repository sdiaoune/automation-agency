import { getCollection } from "astro:content";
import { integrationPages, integrationUrl } from "../lib/integrations";
import { customerStories, customerStoryUrl } from "../lib/customerStories";
import { absoluteUrl, byOrder, postUpdatedAt, siteUpdatedAt } from "../lib/site";
import { servicePages, serviceUrl } from "../lib/services";
import { useCasePages, useCaseUrl } from "../lib/useCases";

export async function GET() {
  const posts = byOrder(await getCollection("blog"));
  const urls = [
    { url: "/", lastmod: siteUpdatedAt },
    { url: "/about/", lastmod: siteUpdatedAt },
    { url: "/book-demo/", lastmod: siteUpdatedAt },
    { url: "/customers/", lastmod: siteUpdatedAt },
    ...customerStories.map((story) => ({ url: customerStoryUrl(story), lastmod: story.updatedAt })),
    { url: "/resources/", lastmod: siteUpdatedAt },
    { url: "/resources/missed-call-workflow-audit/", lastmod: siteUpdatedAt },
    { url: "/resources/missed-call-recovery-roi-calculator/", lastmod: siteUpdatedAt },
    { url: "/compare/", lastmod: siteUpdatedAt },
    { url: "/compare/ai-front-desk-vs-call-center/", lastmod: siteUpdatedAt },
    { url: "/compare/custom-automation-vs-off-the-shelf-property-management-ai/", lastmod: siteUpdatedAt },
    { url: "/security/", lastmod: siteUpdatedAt },
    { url: "/services/", lastmod: siteUpdatedAt },
    ...servicePages.map((service) => ({ url: serviceUrl(service), lastmod: siteUpdatedAt })),
    { url: "/use-cases/", lastmod: siteUpdatedAt },
    ...useCasePages.map((useCase) => ({ url: useCaseUrl(useCase), lastmod: useCase.updatedAt || siteUpdatedAt })),
    { url: "/integrations/", lastmod: siteUpdatedAt },
    ...integrationPages.map((integration) => ({ url: integrationUrl(integration), lastmod: siteUpdatedAt })),
    { url: "/blog/", lastmod: siteUpdatedAt },
    ...posts.map((post) => ({ url: `/blog/${post.data.slug}/`, lastmod: postUpdatedAt(post) })),
    { url: "/links/", lastmod: siteUpdatedAt },
    { url: "/privacy/", lastmod: siteUpdatedAt },
    { url: "/terms/", lastmod: siteUpdatedAt },
    { url: "/sms-consent/", lastmod: siteUpdatedAt },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${absoluteUrl(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

import { getCollection } from "astro:content";
import { absoluteUrl, byOrder, postUpdatedAt, siteName } from "../lib/site";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = byOrder(await getCollection("blog"));
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.data.slug}/`);
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.data.meta)}</description>
      <category>${escapeXml(post.data.pillar)}</category>
      <pubDate>${new Date(post.data.publishedAt).toUTCString()}</pubDate>
      <lastBuildDate>${new Date(postUpdatedAt(post)).toUTCString()}</lastBuildDate>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName} Blog</title>
    <link>${absoluteUrl("/blog/")}</link>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>Property management automation guides from EMC2Ops.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

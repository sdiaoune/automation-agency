import { getCollection } from "astro:content";
import { byOrder } from "../../lib/site";

export async function GET() {
  const posts = byOrder(await getCollection("blog")).map((post) => ({
    slug: post.data.slug,
    pillar: post.data.pillar,
    keyword: post.data.keyword,
    title: post.data.title,
    meta: post.data.meta,
    publishedAt: post.data.publishedAt,
    updatedAt: post.data.updatedAt,
    url: `/blog/${post.data.slug}/`,
  }));

  return new Response(JSON.stringify(posts, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

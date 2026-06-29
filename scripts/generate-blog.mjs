import fs from "node:fs";
import path from "node:path";
import { contentPostsPath, readBlogPosts, validateBlogPosts } from "./blog-content.mjs";

if (process.env.ALLOW_LEGACY_BLOG_GENERATOR !== "true") {
  console.error("scripts/generate-blog.mjs is retired for normal publishing.");
  console.error("Use src/content/blog/*.md, then run: npm run blog:validate, npm run blog:card, npm run build.");
  console.error("Set ALLOW_LEGACY_BLOG_GENERATOR=true only for an intentional legacy static export.");
  process.exit(1);
}

const siteUrl = "https://www.emc2ops.com";
const today = "2026-06-21";
const defaultSocialImage = `${siteUrl}/blog/social-assets/stop-losing-leads-after-hours.png`;
const socialImageDimensions = { width: 1672, height: 941 };
const cities =
  "Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, and Miami";

const newPost = {
  slug: "property-management-stale-lead-reactivation-automation",
  order: 57,
  pillar: "Leasing Automation",
  keyword: "property management stale lead reactivation automation",
  title:
    "Property Management Stale Lead Reactivation Automation: Stop Letting Old Prospects Rot in the CRM",
  seoTitle: "Property Management Stale Lead Reactivation Automation",
  meta:
    "Learn how property managers can automate stale-lead reactivation, renter re-engagement, and CRM cleanup without blasting every old prospect with generic follow-up.",
  publishedAt: today,
  updatedAt: today,
  h1: "Stop letting inactive leasing leads sit untouched until they are already lost",
  problem:
    "Stale leasing leads pile up when prospects who called, toured, replied, or started a conversation stop hearing from the team and nobody has a workflow that knows when to re-engage, what message fits the stage, and when the lead should stop sitting in the active pipeline.",
  stakes: [
    "Teams managing 50+ units lose leasing time when old calls, form fills, tour requests, and partial conversations stay in the CRM with no clear reactivation rule, so staff either ignore them or work the same stale list by hand.",
    "If stale-lead recovery stays manual, high-intent renters who were briefly active disappear into generic drip campaigns, duplicate outreach, or no outreach at all while units remain exposed.",
    "When reactivation logic lives in staff memory instead of a workflow, pipeline reports stay inflated, lead owners change without context, and managers cannot tell whether demand is truly weak or just unmanaged.",
  ],
  system: [
    "Trigger reactivation from real inactivity signals such as no reply after first contact, no tour booked after qualification, no response after a tour inquiry, or aged CRM stages that have not advanced within a defined window.",
    "Segment stale leads by the last meaningful action, property interest, unit fit, move timeline, and original source so the next message matches the real context instead of sending the same check-in to everyone.",
    "Send one short next-step message that asks for the highest-value response, such as preferred tour time, updated move date, unit preference, or whether the renter is still searching.",
    "Suppress, pause, or reroute the sequence when the prospect replies, books a tour, starts an application, opts out, or needs a human follow-up because the request is sensitive or unusual.",
    "Write every reactivation attempt, reply signal, stage change, and owner handoff back to the CRM automatically so stale leads stop distorting the live pipeline.",
  ],
  metrics: [
    "stale leads reactivated into active conversations",
    "aged leads converted to tours",
    "inactive CRM stages cleared automatically",
    "reply rate by stale-lead segment",
    "manual stale-list touches removed per week",
  ],
  cta:
    "If old leasing leads are clogging the CRM while units still need demand, book a 15-minute workflow audit.",
  faqs: [
    {
      question: "What is stale lead reactivation automation in property management?",
      answer:
        "It is a workflow that watches for inactive renter leads, sends a context-aware re-engagement message, routes replies to the right next step, and updates the CRM automatically.",
    },
    {
      question: "When should stale-lead automation stop and hand the prospect to staff?",
      answer:
        "It should stop when the prospect replies with objections, unusual availability, fair-housing-sensitive questions, complaints, negotiation needs, or anything that requires human judgment instead of another automated step.",
    },
    {
      question: "How do property managers reactivate old leads without spamming renters or dirtying the CRM?",
      answer:
        "The safest setup uses explicit inactivity triggers, segment-specific messages, suppression rules, owner assignment, opt-out handling, and CRM write-backs so only valid leads get the right follow-up at the right moment.",
    },
  ],
  related: [
    "ai-leasing-follow-up-property-management",
    "automate-property-management-lead-follow-up",
    "apartment-lead-tracking",
    "property-management-leasing-pipeline-setup",
    "property-management-lead-qualification-automation",
    "property-management-no-show-recovery-automation",
    "property-management-tour-scheduling-automation",
    "property-management-application-follow-up-automation",
  ],
  socialImage:
    "/blog/social-assets/property-management-stale-lead-reactivation-automation.png",
  body: `A stale lead list should not become a graveyard you occasionally scroll when occupancy pressure spikes.

One prospect called last week but never booked. Another toured and went quiet. Another replied to a text but never answered the follow-up question. By the time the team circles back, the CRM is full of leads marked contacted, toured, or nurture, but nobody knows which ones still have intent and which ones should be removed from the active queue.

For operators managing 50 or more units, stale-lead recovery becomes a quiet leasing drain. It pulls agents back into old lists, hides real demand quality, and keeps the CRM bloated because the reactivation process depends on memory instead of a controlled workflow.

## Why stale-lead recovery breaks down

The pattern is usually predictable:

- the CRM marks a lead as contacted, but nothing decides when that lead deserves a reactivation attempt
- old prospects get the same generic message whether they missed a call, toured already, or stopped halfway through qualification
- multiple agents touch the same aged lead because ownership and suppression rules are unclear
- renters who already moved on keep receiving follow-up while higher-intent stale leads get ignored
- managers keep seeing inflated pipeline volume because dead leads and recoverable leads are mixed together

This is not mainly a leasing hustle problem. It is a workflow problem.

## What stale-lead reactivation automation should actually do

The goal is not to blast every old renter lead until somebody unsubscribes. The goal is to automate the repetitive identification, segmentation, and next-step follow-up around approved inactivity states.

That means the workflow should:

1. Start from a verified inactivity signal instead of a vague feeling that the lead has gone cold.
2. Separate missed-contact leads, toured-but-silent leads, partial qualifiers, and long-aged nurture leads into different recovery paths.
3. Ask for the one next action that can reopen the conversation, not three new questions that restart the sales process from zero.
4. Stop the sequence immediately when the renter replies, opts out, books, or no longer fits the unit or timing.
5. Write the outcome back to the CRM so the team can see whether the lead reactivated, stayed inactive, or should leave the active pipeline.

If that loop is clean, the team gains cleaner pipeline visibility and more second chances without creating spammy follow-up.

## The stale-lead checkpoints worth automating first

Most property management teams do not need a huge nurture engine first. They need a reliable sequence around the basics.

Start with:

- verified inactivity windows by stage such as new inquiry, qualified lead, toured lead, or partially engaged prospect
- short reactivation prompts matched to the last known context
- suppression rules for booked tours, active conversations, applications started, disqualified leads, and opt-outs
- owner assignment so only one person or queue handles the recovered lead
- exit rules that move truly dead leads out of the active pipeline instead of leaving them open forever
- write-backs so the CRM reflects real lead status instead of historical guesswork

Those checkpoints remove a large amount of manual stale-list work while keeping live leasing judgment in the right hands.

## Where automation should stop

Automation should coordinate the reactivation layer, not replace leasing judgment.

If the prospect raises pricing objections, accommodation questions, fair-housing-sensitive issues, unusual timing, roommate or guarantor complexity, or any emotionally charged complaint, the workflow should stop and hand the case to staff with the full timeline attached.

The objective is cleaner execution, not automated overreach.

## How EMC2Ops would implement it

We would start by mapping how leads become stale in your operation today: which stages leak demand most often, how long high-intent renters usually stay warm, which messages still earn replies, which sources age badly, and which statuses should force a human callback instead of another automated touch.

From there we would define:

1. The verified inactivity triggers that open a stale-lead workflow.
2. The segment-specific messages and reactivation rules by stage, source, and property interest.
3. The suppression and escalation logic for active conversations, complaints, and sensitive replies.
4. The write-backs that keep the CRM, lead owner, and reporting view aligned.
5. The reporting that shows whether reactivation is actually recovering tours and cleaning the pipeline.

If old leasing leads still depend on spreadsheet callbacks and whoever has time to dig through the CRM, this is a strong workflow to automate next.`,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, "");
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function markdownForPost(post) {
  return [
    "---",
    `slug: ${yamlString(post.slug)}`,
    `order: ${post.order}`,
    `pillar: ${yamlString(post.pillar)}`,
    `keyword: ${yamlString(post.keyword)}`,
    `title: ${yamlString(post.title)}`,
    `seoTitle: ${yamlString(post.seoTitle)}`,
    `meta: ${yamlString(post.meta)}`,
    `publishedAt: ${yamlString(post.publishedAt)}`,
    `updatedAt: ${yamlString(post.updatedAt)}`,
    `h1: ${yamlString(post.h1)}`,
    `problem: ${yamlString(post.problem)}`,
    "stakes:",
    ...post.stakes.map((item) => `  - ${yamlString(item)}`),
    "system:",
    ...post.system.map((item) => `  - ${yamlString(item)}`),
    "metrics:",
    ...post.metrics.map((item) => `  - ${yamlString(item)}`),
    `cta: ${yamlString(post.cta)}`,
    "bodySections: true",
    "faqs:",
    ...post.faqs.flatMap((faq) => [
      `  - question: ${yamlString(faq.question)}`,
      `    answer: ${yamlString(faq.answer)}`,
    ]),
    "related:",
    ...post.related.map((slug) => `  - ${yamlString(slug)}`),
    `socialImage: ${yamlString(post.socialImage)}`,
    "---",
    "",
    post.body.trim(),
    "",
  ].join("\n");
}

function ensureSourcePost() {
  fs.mkdirSync(contentPostsPath, { recursive: true });
  fs.writeFileSync(
    path.join(contentPostsPath, `${newPost.slug}.md`),
    markdownForPost(newPost),
  );
}

function ensureSocialAssets(posts) {
  fs.mkdirSync(path.join("blog", "social-assets"), { recursive: true });
  fs.mkdirSync(path.join("public", "blog", "social-assets"), { recursive: true });

  for (const post of posts) {
    if (!post.socialImage) continue;
    const relativePath = post.socialImage.replace(/^\//, "");
    const publicPath = path.join("public", relativePath);
    const blogPath = path.join("blog", "social-assets", `${post.slug}.png`);

    if (fs.existsSync(blogPath) && !fs.existsSync(publicPath)) fs.copyFileSync(blogPath, publicPath);
    if (fs.existsSync(publicPath) && !fs.existsSync(blogPath)) fs.copyFileSync(publicPath, blogPath);
  }
}

function socialImageFor(post) {
  const relativePath = post.socialImage?.replace(/^\//, "");
  return relativePath && fs.existsSync(path.join("public", relativePath))
    ? `${siteUrl}/${relativePath}`
    : defaultSocialImage;
}

function titleTag(post) {
  const raw = `${post.seoTitle || post.title} | EMC2Ops`;
  return raw.length > 62 ? `${post.title.replace(/:.*$/, "")} | EMC2Ops` : raw;
}

function pageLayout({ title, description, canonical, body, schema }, postsBySlug) {
  const slug = canonical.match(/\/blog\/([^/]+)\/$/)?.[1];
  const post = slug ? postsBySlug[slug] : null;
  const socialImage = post ? socialImageFor(post) : defaultSocialImage;
  const imageAlt = `${title} social preview from EMC2Ops.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="theme-color" content="#080b10" />
  <link rel="canonical" href="${canonical}" />
  <link rel="stylesheet" href="/blog/styles.css" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="EMC2Ops" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${socialImage}" />
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
  <meta property="og:image:width" content="${socialImageDimensions.width}" />
  <meta property="og:image:height" content="${socialImageDimensions.height}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@EMC2Ops" />
  <meta name="twitter:creator" content="@EMC2Ops" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${socialImage}" />
  <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <header class="site-header">
    <div class="wrap nav">
      <a class="logo" href="/"><span class="mark">E²</span><span>EMC2Ops</span></a>
      <nav class="navlinks" aria-label="Primary">
        <a href="/">Home</a>
        <a href="/blog/">Blog</a>
        <a href="/#services">Services</a>
        <a class="btn btn-primary" href="/#book">Book a 15-minute workflow audit</a>
      </nav>
    </div>
  </header>
  ${body}
  <footer>
    <div class="wrap footer-row">
      <span>© 2026 EMC2Ops. AI automation for property managers.</span>
      <span><a href="/blog/">Blog</a> · <a href="/#book">Book a 15-minute workflow audit</a></span>
    </div>
  </footer>
</body>
</html>`;
}

function postSchema(post) {
  const url = `${siteUrl}/blog/${post.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "EMC2Ops", url: `${siteUrl}/` },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: `${siteUrl}/`, name: "EMC2Ops", publisher: { "@id": `${siteUrl}/#organization` } },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.meta,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        image: socialImageFor(post),
        author: { "@id": `${siteUrl}/#organization` },
        publisher: { "@id": `${siteUrl}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        about: ["property management automation", post.keyword, post.pillar],
      },
    ],
  };
}

function articlePage(post, postsBySlug) {
  const related = (post.related || []).map((slug) => postsBySlug[slug]).filter(Boolean);

  return pageLayout(
    {
      title: titleTag(post),
      description: post.meta,
      canonical: `${siteUrl}/blog/${post.slug}/`,
      schema: postSchema(post),
      body: `<main>
      <article class="article">
        <div class="wrap article-grid">
          <aside class="toc" aria-label="Article navigation">
            <strong>${escapeHtml(post.pillar)}</strong>
            <a href="#answer">Direct answer</a>
            <a href="#cost">Operational cost</a>
            <a href="#workflow">Workflow design</a>
            <a href="#metrics">Metrics</a>
            <a href="#faq">FAQ</a>
          </aside>
          <div class="article-body">
            <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog/">Blog</a><span>/</span>${escapeHtml(post.keyword)}</nav>
            <p class="eyebrow">${escapeHtml(post.keyword)}</p>
            <h1>${escapeHtml(post.h1)}</h1>
            <p class="dek">${escapeHtml(post.problem)}</p>
            <section id="answer" class="answer-box">
              <h2>Direct answer for operators</h2>
              <p>${escapeHtml(stripTags(post.problem))} For property management companies managing 50+ units, the practical fix is a workflow that watches status changes, asks for the one next action, escalates exceptions, and keeps the CRM current.</p>
            </section>
            <section id="cost">
              <h2>Where the operational cost shows up</h2>
              <p>In high-growth rental markets across the United States, including ${cities}, operational lag shows up as slower response, extra admin work, and avoidable revenue leakage.</p>
              <ul>${post.stakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
            <section id="workflow">
              <h2>What a practical automation system should do</h2>
              <ol>${post.system.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
            </section>
            <section id="metrics">
              <h2>Metrics worth tracking</h2>
              <div class="metric-list">${post.metrics.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
            </section>
            <section id="faq" class="faq">
              <h2>FAQ</h2>
              ${post.faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}
            </section>
            <section class="article-cta">
              <div><strong>${escapeHtml(post.cta)}</strong><span>Bring your current workflow, systems, and handoff process. We will identify the first automation worth implementing.</span></div>
              <a class="btn btn-primary" href="/#book">Book a 15-minute workflow audit</a>
            </section>
            <section class="related">
              <h2>Related property management automation guides</h2>
              <div class="related-grid">${related.map((item) => `<a href="/blog/${item.slug}/"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.keyword)}</span></a>`).join("")}</div>
            </section>
          </div>
        </div>
      </article>
    </main>`,
    },
    postsBySlug,
  );
}

function indexPage(posts, postsBySlug) {
  const pillars = [...new Set(posts.map((post) => post.pillar))];
  return pageLayout(
    {
      title: "Property Management Automation Blog | EMC2Ops",
      description:
        "Practical SEO guides for property managers on missed-call recovery, leasing automation, maintenance intake, CRM workflows, owner updates, and SMS compliance.",
      canonical: `${siteUrl}/blog/`,
      schema: {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "EMC2Ops", url: `${siteUrl}/` },
          { "@type": "CollectionPage", "@id": `${siteUrl}/blog/#webpage`, url: `${siteUrl}/blog/`, name: "Property Management Automation Blog" },
        ],
      },
      body: `<main>
      <section class="blog-hero">
        <div class="wrap">
          <p class="eyebrow">Property management automation guides</p>
          <h1>Systems-focused guides for operators managing 50+ units.</h1>
          <p class="dek">Prioritized for inbound intent around leasing follow-up, maintenance intake, owner communication, CRM workflow automation, and admin reduction.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="/#book">Book a 15-minute workflow audit</a><a class="btn btn-secondary" href="#posts">Browse articles</a></div>
        </div>
      </section>
      <section class="wrap blog-list" id="posts">
        ${pillars.map((pillar) => `<div class="pillar"><h2>${escapeHtml(pillar)}</h2><div class="post-grid">${posts.filter((post) => post.pillar === pillar).map((post) => `<article class="post-card"><span>${escapeHtml(post.keyword)}</span><h3><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.meta)}</p><a class="read-more" href="/blog/${post.slug}/">Read guide</a></article>`).join("")}</div></div>`).join("")}
      </section>
    </main>`,
    },
    postsBySlug,
  );
}

const css = `:root{--bg:#080b10;--text:#f5f7fb;--muted:#a9b4c6;--line:rgba(255,255,255,.12);--accent:#f7c948;--accent2:#46e6b0}*{box-sizing:border-box}body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);line-height:1.6}a{color:inherit;text-decoration:none}.wrap{width:min(1120px,calc(100% - 40px));margin:0 auto}.site-header{position:sticky;top:0;background:rgba(8,11,16,.88);border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}.nav{min-height:74px;display:flex;align-items:center;justify-content:space-between;gap:20px}.logo{display:flex;align-items:center;gap:12px;font-weight:800}.mark{width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#07100d;display:grid;place-items:center;font-weight:900}.navlinks{display:flex;align-items:center;gap:18px;color:var(--muted)}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:999px;font-weight:700;border:1px solid transparent}.btn-primary{background:var(--accent);color:#15100a}.btn-secondary{border-color:var(--line);background:rgba(255,255,255,.04)}.blog-hero,.article{padding:56px 0}.eyebrow{color:#ffe49a;font-weight:800;text-transform:uppercase;font-size:.78rem;letter-spacing:.08em}.dek{font-size:1.1rem;color:var(--muted);max-width:860px}h1{font-size:clamp(2.3rem,5vw,4.5rem);line-height:1.02;margin:0 0 18px}h2{font-size:clamp(1.6rem,3vw,2.3rem);line-height:1.08;margin:0 0 14px}.hero-actions,.metric-list{display:flex;gap:12px;flex-wrap:wrap}.blog-list{padding:0 0 64px}.pillar{margin-bottom:42px}.post-grid,.related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.post-card,.answer-box,.article-cta,.toc,.related-grid a,details{border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:8px}.post-card{padding:20px;display:flex;flex-direction:column;min-height:230px}.post-card span,.related-grid span{color:var(--accent2);font-size:.82rem;font-weight:800}.post-card h3{margin:10px 0;font-size:1.15rem}.post-card p{margin:0 0 18px;color:var(--muted)}.read-more{margin-top:auto;color:var(--accent);font-weight:800}.article-grid{display:grid;grid-template-columns:240px minmax(0,760px);gap:36px;align-items:start}.toc{position:sticky;top:92px;padding:18px;display:grid;gap:10px;color:var(--muted)}.breadcrumbs{display:flex;gap:8px;flex-wrap:wrap;color:var(--muted);font-size:.92rem;margin-bottom:24px}.article-body section{margin:34px 0}.article-body p,.article-body li{color:#d7deea}.answer-box,.article-cta{padding:20px}.article-cta{display:flex;justify-content:space-between;gap:18px;align-items:center}.article-cta strong,.article-cta span{display:block}.article-cta span{color:var(--muted);margin-top:4px}.metric-list span{border:1px solid rgba(70,230,176,.28);background:rgba(70,230,176,.08);color:#dffcf3;border-radius:999px;padding:8px 12px;font-weight:760}.faq details{padding:16px 18px;margin:12px 0}.faq summary{cursor:pointer;font-weight:800}.related-grid a{padding:16px;display:grid;gap:8px}.footer-row{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}footer{padding:30px 0 56px;color:var(--muted);border-top:1px solid var(--line)}@media(max-width:900px){.navlinks,.toc{display:none}.post-grid,.related-grid,.article-grid{grid-template-columns:1fr}.article-cta{align-items:flex-start;flex-direction:column}.wrap{width:min(100% - 28px,1120px)}}`;

ensureSourcePost();

const posts = readBlogPosts()
  .map((post) => ({
    ...post,
    faqs: (post.faqs || []).map((faq) => (Array.isArray(faq) ? { question: faq[0], answer: faq[1] } : faq)),
  }))
  .sort((left, right) => Number(left.order) - Number(right.order));

ensureSocialAssets(posts);

const errors = validateBlogPosts(posts);
if (errors.length > 0) throw new Error(`Blog validation failed:\n${errors.join("\n")}`);

const postsBySlug = Object.fromEntries(posts.map((post) => [post.slug, post]));

fs.mkdirSync("blog", { recursive: true });
fs.writeFileSync(path.join("blog", "styles.css"), css);
fs.writeFileSync(
  path.join("blog", "posts.json"),
  `${JSON.stringify(posts.map(({ slug, pillar, keyword, title, meta }) => ({ slug, pillar, keyword, title, meta })), null, 2)}\n`,
);
fs.writeFileSync(path.join("blog", "index.html"), indexPage(posts, postsBySlug));

for (const post of posts) {
  const dir = path.join("blog", post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), articlePage(post, postsBySlug));
}

const sitemapUrls = ["/", "/blog/", ...posts.map((post) => `/blog/${post.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url>\n    <loc>${siteUrl}${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync("sitemap.xml", sitemap);

console.log(`Generated ${posts.length} blog posts from ${contentPostsPath}.`);

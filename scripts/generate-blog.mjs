import fs from "node:fs";
import path from "node:path";
import { contentPostsPath, readBlogPosts, validateBlogPosts } from "./blog-content.mjs";

const siteUrl = "https://www.emc2ops.com";
const today = "2026-06-20";
const defaultSocialImage = `${siteUrl}/blog/social-assets/stop-losing-leads-after-hours.png`;
const socialImageDimensions = { width: 1672, height: 941 };
const cities =
  "Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, and Miami";

const newPost = {
  slug: "property-management-resident-portal-message-automation",
  order: 55,
  pillar: "Resident Operations",
  keyword: "property management resident portal message automation",
  title:
    "Property Management Resident Portal Message Automation: Stop Letting the Inbox Run the Day",
  seoTitle: "Property Management Resident Portal Message Automation",
  meta:
    "Learn how property managers can automate resident portal message triage, routing, follow-up, and CRM updates without letting the inbox drive the day.",
  publishedAt: today,
  updatedAt: today,
  h1: "Stop letting resident portal messages become a second property management system",
  problem:
    "Resident portal message handling turns into repetitive admin work when maintenance questions, rent issues, lease concerns, access requests, and status updates pile into one shared inbox without a workflow that can classify the issue, capture the right context, and route the next step automatically.",
  stakes: [
    "Teams managing 50+ units lose hours every week opening portal threads, reclassifying resident issues by hand, forwarding the same message to multiple people, and rebuilding context that should already be attached to the unit and resident record.",
    "If portal messages stay manual, urgent maintenance gets mixed with routine billing questions, residents receive inconsistent response times, and managers lose visibility into which inbox conversations are actually unresolved.",
    "When portal communication lives outside the real workflow, delinquency replies, lease-violation disputes, access questions, and service updates drift away from the PMS, CRM, and work-order record that the team relies on.",
  ],
  system: [
    "Trigger the workflow when a new resident portal message arrives so the property, unit, resident, lease status, and conversation channel are attached before anyone has to triage it manually.",
    "Classify the message into approved paths such as maintenance intake, rent or delinquency question, lease violation response, move-in or move-out coordination, or general account support without making policy decisions.",
    "Ask for the one next missing detail automatically, create or update the right task or record, and route the message to the correct team queue with the full conversation attached.",
    "Escalate emergencies, payment disputes, accommodation requests, legal-risk issues, and owner-sensitive cases into a human review queue instead of continuing automation blindly.",
    "Write every message, classification, task handoff, response timestamp, and resolution state back to the operating record automatically.",
  ],
  metrics: [
    "portal messages routed without manual triage",
    "first-response time by message type",
    "resident threads resolved without duplicate handoffs",
    "CRM or PMS conversation completeness",
    "manual inbox touches removed per week",
  ],
  cta:
    "If resident portal messages still depend on inbox sorting, forwarding, and staff memory, book a 15-minute workflow audit.",
  faqs: [
    {
      question: "What is resident portal message automation in property management?",
      answer:
        "It is a workflow that classifies incoming resident portal messages, requests missing details, routes each issue to the right operating path, and logs the full conversation automatically.",
    },
    {
      question: "What should stay human-led when automating resident portal messages?",
      answer:
        "Emergency judgment, legal interpretation, accommodation requests, payment disputes, resident complaints, owner-sensitive cases, and any unclear or emotionally charged situation should stay with trained staff.",
    },
    {
      question: "How do property managers automate portal messages without creating bad routing or compliance risk?",
      answer:
        "The safest setup uses approved message categories, verified resident and unit context, clear escalation rules, human review thresholds, and full write-backs so automation handles repetitive triage without improvising policy or legal answers.",
    },
  ],
  related: [
    "property-management-maintenance-intake-automation",
    "property-management-delinquency-outreach-automation",
    "property-management-lease-violation-follow-up-automation",
    "property-management-crm-workflow-automation",
    "reduce-administrative-workload-property-management",
    "property-management-maintenance-status-update-automation",
    "salesforce-fin-property-management-service-workflows",
  ],
  socialImage:
    "/blog/social-assets/property-management-resident-portal-message-automation.png",
  body: `A resident portal inbox should not become a second operating system.

One resident sends a maintenance complaint with no unit number. Another asks about a balance that already changed this morning. A third replies to an old portal thread with a new lease concern. By lunch, the team is forwarding messages, copying notes into the PMS, and trying to remember which conversation already became a work order, delinquency task, or manager callback.

For operators managing 50 or more units, resident portal messages become a quiet administrative drain. They pull leasing, maintenance, accounting, and managers into repetitive triage work, create inconsistent response times, and increase risk because the full conversation record never stays attached to the workflow that should own it.

## Why portal message handling breaks down

The pattern is usually predictable:

- different resident issues land in the same portal inbox even though they belong to different workflows
- staff manually decide whether a message should become a maintenance request, delinquency follow-up, manager task, or general reply
- residents send partial information, so teams waste time asking the same clarifying questions over and over
- replies get handled in the inbox, but the PMS, CRM, or work-order record never reflects the latest conversation
- managers lose visibility into which messages are still unresolved because the queue looks full even when half the threads are waiting on residents

This is not mainly an inbox discipline problem. It is a workflow problem.

## What resident portal message automation should actually do

The goal is not to let AI answer every resident question freely. The goal is to automate the repetitive intake, classification, and routing around approved message types.

That means the workflow should:

1. Start when a new portal message arrives from a verified resident thread.
2. Attach the property, unit, resident, active lease status, and prior conversation history immediately.
3. Classify the message into the right approved path such as maintenance, billing, delinquency, lease follow-up, move coordination, or general support.
4. Ask for the one next missing detail automatically before a staff member has to chase it manually.
5. Escalate emergencies, disputes, legal-risk issues, and policy-sensitive requests into a human queue with the full timeline attached.
6. Write every message, task, and status change back to the operating record automatically.

If that loop is clean, the team gains speed and consistency without letting automation improvise judgment.

## The portal inbox checkpoints worth automating first

Most property management teams do not need a resident-facing AI free-for-all. They need a reliable sequence around the basics.

Start with:

- verified resident, property, and unit matching on every portal thread
- approved categories for maintenance, balance questions, delinquency replies, lease concerns, and general support
- required-detail prompts when the message is missing issue type, urgency, access notes, or supporting context
- task or record creation for the correct downstream workflow
- exception routing for emergencies, disputes, accommodations, complaints, and legal-sensitive topics
- write-backs so the PMS, CRM, and team queue reflect the same conversation state

Those checkpoints remove a large amount of manual sorting while keeping sensitive decisions in the right hands.

## Where automation should stop

Automation should coordinate the first layer of the inbox, not replace human judgment.

If the resident raises a safety issue, disputes a charge, asks for an accommodation, reports a legal concern, or sends a message that does not fit an approved category, the workflow should stop and hand the case to staff with the full thread, resident history, and next recommended action attached.

The objective is cleaner execution, not automated overreach.

## How EMC2Ops would implement it

We would start by mapping how portal messages reach your team today: which message types show up most often, what details staff always have to request, which workflows those messages should create or update, who owns each queue, and which situations should always force human review.

From there we would define:

1. The verified trigger that opens a portal-message workflow.
2. The approved categories, prompts, and downstream routing rules.
3. The escalation logic for emergency, compliance, payment, and owner-sensitive cases.
4. The write-backs that keep the inbox, PMS, CRM, and work-order record aligned.
5. The reporting that shows whether portal triage is actually removing admin load and improving response time.

If resident portal messages still depend on forwarding, inbox tagging, and staff memory, this is a strong workflow to automate next.`,
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

import fs from "node:fs";
import path from "node:path";
import { contentPostsPath, readBlogPosts, validateBlogPosts } from "./blog-content.mjs";

const siteUrl = "https://www.emc2ops.com";
const today = "2026-06-05";
const defaultSocialImage = `${siteUrl}/blog/social-assets/stop-losing-leads-after-hours.png`;
const socialImageDimensions = { width: 1672, height: 941 };
const cities =
  "Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, and Miami";

const newPost = {
  slug: "property-management-application-follow-up-automation",
  order: 30,
  pillar: "Leasing Automation",
  keyword: "property management application follow up automation",
  title:
    "Property Management Application Follow-Up Automation: Stop Losing Qualified Renters Mid-Application",
  seoTitle: "Property Management Application Follow-Up Automation",
  meta:
    "How property managers can automate applicant follow-up, missing-document reminders, status updates, and CRM handoff without turning screening into a manual chase.",
  publishedAt: today,
  updatedAt: today,
  h1: "Stop letting qualified renters stall between tour and completed application",
  problem:
    "Application fallout is usually not a lead-quality problem. It is an operations problem: missing documents, unclear next steps, and slow follow-up leave qualified renters half-finished while the unit stays exposed.",
  stakes: [
    "Leasing teams managing 50+ units rarely have time to manually chase every incomplete application at the right moment.",
    "Applicants drop when they do not know whether they are missing ID, income documents, fees, guarantor details, or a next approval step.",
    "If application status lives across inboxes, screening portals, and CRM notes, managers lose visibility into where qualified demand is actually stalling.",
  ],
  system: [
    "Trigger follow-up from real application events such as application started, abandoned, missing document, screening returned, conditional approval, or no activity after a defined window.",
    "Send a short, specific message that explains the current status and asks for only the one next action needed to move the file forward.",
    "Route sensitive cases such as adverse action, screening disputes, accommodation requests, or policy exceptions to staff instead of continuing automation.",
    "Sync application status, document requests, applicant replies, and ownership tasks back to the CRM or property management system automatically.",
    "Escalate high-intent applicants before the unit is remarketed or the file goes stale.",
  ],
  metrics: [
    "applications completed after automated follow-up",
    "time from application start to completed file",
    "missing-document requests resolved",
    "manual applicant chase touches removed",
    "approved applicants lost to inactivity",
  ],
  cta:
    "If incomplete applications are quietly extending vacancy, book a 15-minute workflow audit.",
  faqs: [
    {
      question: "What is application follow-up automation in property management?",
      answer:
        "It is a workflow that watches applicant status, sends timely reminders for the next required step, and updates the CRM or property system instead of relying on staff to manually chase every incomplete file.",
    },
    {
      question: "What parts of the application process should stay human-led?",
      answer:
        "Screening decisions, adverse action, fair housing-sensitive situations, accommodation requests, exception approvals, and disputes should stay with trained staff and approved policy.",
    },
    {
      question: "When should a property manager trigger application follow-up?",
      answer:
        "The best triggers are specific workflow states such as started but not submitted, submitted with missing documents, screening returned, conditional approval, or inactivity after a defined number of hours or days.",
    },
  ],
  related: [
    "ai-leasing-follow-up-property-management",
    "property-management-tour-scheduling-automation",
    "property-management-leasing-pipeline-setup",
    "property-management-crm-workflow-automation",
  ],
  socialImage:
    "/blog/social-assets/property-management-application-follow-up-automation.png",
  body: `If your team is getting prospects to tour but not getting them all the way into completed applications, the problem is usually not motivation alone. It is the handoff between renter intent and application completion.

A prospect may be fully qualified and still disappear because the process asks for too much at once, goes quiet after the first step, or leaves the applicant unsure about what is missing. For operators managing 50 or more units, that drag creates vacancy pressure in a place many dashboards barely show.

## Why application fallout keeps happening

Most application loss happens in predictable moments:

- The renter starts but does not finish the form.
- Required documents are missing or rejected.
- The applicant is waiting on a co-applicant or guarantor.
- The screening result creates a conditional next step.
- The file sits untouched while staff are busy with tours, renewals, residents, and maintenance.

Those are workflow problems, not mystery problems. The useful fix is not more generic reminders. It is a system that knows the exact application state and asks for the exact next action.

## What good automation should do

The strongest application follow-up workflow is event-driven. It should react to what changed in the file, not blast the same message to every applicant on a timer.

That usually means:

1. Detect when an application starts, stalls, or comes back incomplete.
2. Identify the one thing blocking progress.
3. Send a short message with a clear next step.
4. Escalate when the case involves policy, screening, or judgment.
5. Log every step in the CRM or property management system.

When the workflow is narrow, the message can stay useful. "Please upload your proof of income to continue your application for Elm Street Apartments" is operational. "Just checking in on your application" usually is not.

## Where teams create avoidable friction

The first failure is vague status. Applicants need to know whether they are missing a pay stub, a photo ID, a guarantor form, a fee, or a signature. If the message does not clarify the blocker, it creates another reply loop.

The second failure is channel disconnect. If the screening portal shows one thing, the leasing CRM shows another, and the leasing agent keeps notes in email, nobody trusts the state of the file.

The third failure is automating where policy should take over. Application follow-up can be automated. Eligibility decisions should not be handed to a generic reminder sequence. Teams need a clear human path for disputes, accommodations, adverse action, and exceptions.

## The operational gain

For property managers, the value is straightforward:

- More started applications reach a completed state.
- Leasing teams spend less time manually checking who needs what.
- Units spend less time waiting on silent applicants.
- Managers can see whether the real bottleneck is document collection, screening turnaround, or staff follow-up.

This matters because application delay compounds with every vacant day. A renter who toured yesterday and started an application last night is still warm. A renter who heard nothing for three days may already be applying elsewhere.

## How EMC2Ops would roll it out

We would start by mapping the application states that already exist in your process: started, submitted, missing documents, under review, conditionally approved, approved, declined, or withdrawn.

Then we would define:

1. Which states can safely trigger automation.
2. What exact message belongs to each state.
3. Which replies need staff ownership.
4. Which systems must stay in sync.
5. Which metrics show the workflow is actually reducing vacancy risk.

The goal is not to automate screening judgment. The goal is to remove avoidable lag between renter intent and a complete application file.

If your pipeline looks healthy at the inquiry stage but units still sit open while applicants stall, application follow-up is often the missing workflow.`,
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
              <p>In high-growth rental markets across the United States, including ${cities}, application lag shows up as silent vacancy, stale files, and extra admin work.</p>
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
              <div><strong>${escapeHtml(post.cta)}</strong><span>Bring your current leasing, screening, CRM, and handoff process. We will identify the first workflow to automate.</span></div>
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

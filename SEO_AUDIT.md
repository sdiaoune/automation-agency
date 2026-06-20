# EMC2Ops SEO Audit

Audit date: June 4, 2026  
Site audited: https://www.emc2ops.com/  
Codebase: `/Users/diaoune/automation-agency`

## Executive Summary

EMC2Ops has a strong SEO foundation for a young niche service site. The site is crawlable, builds cleanly, ships canonical tags, has a sitemap and robots file, uses one H1 per page, includes JSON-LD, and has a focused topical blog cluster around property management automation.

The biggest opportunity is not basic technical SEO. It is turning the current single-page service site plus blog into a clearer commercial and topical architecture. Right now, most ranking depth lives in blog posts, while the money pages are mostly homepage sections. Google and buyers would both benefit from dedicated service, use-case, and integration pages.

## Priority Findings

### P1: The sitemap omits `/links/`

The build outputs `/links/index.html`, and the footer links to `/links/`, but the sitemap only includes `/`, `/blog/`, and blog posts. This is not catastrophic, because `/links/` is internally linked, but sitemap coverage should reflect indexable public pages.

Evidence:
- `dist/links/index.html` exists after build.
- `src/pages/sitemap.xml.ts` builds URLs from `["/", "/blog/", ...blogPosts]` only.
- `public/robots.txt` points crawlers to `https://www.emc2ops.com/sitemap.xml`.

Recommendation:
- Add `/links/` to the sitemap if it should be indexed.
- If `/links/` is only a social bio/utility page and not meant to rank, add a `noindex` page-specific robots tag instead.

### P1: Article publish and modified dates are hard-coded globally

Every article schema and sitemap URL uses the same `today` constant. This creates misleading `datePublished`, `dateModified`, and sitemap `lastmod` values across all blog posts.

Evidence:
- `src/lib/site.ts` defines `today = "2026-06-03"`.
- `articleSchema()` uses `today` for both `datePublished` and `dateModified`.
- `src/pages/sitemap.xml.ts` uses `today` for every URL.

Recommendation:
- Add `publishedAt` and `updatedAt` fields to blog frontmatter.
- Use those values in Article schema and sitemap `lastmod`.
- For the homepage and blog index, use real build/deploy update dates or omit `lastmod` until you can maintain it accurately.

### P1: Several title tags are too long

The generated HTML shows multiple blog title tags above the safer 50-60 character range. Long titles are not a ranking penalty by themselves, but they are likely to truncate and weaken click-through clarity.

Examples from built HTML:
- `/blog/reduce-administrative-workload-property-management/`: 94 characters
- `/blog/high-leasing-lead-volume-property-management/`: 90 characters
- `/blog/automate-dispatch-crm-sync-property-management/`: 85 characters
- `/blog/reduce-showing-no-shows-property-management/`: 84 characters
- `/blog/automate-property-management-lead-follow-up/`: 81 characters

Recommendation:
- Add a dedicated `seoTitle` frontmatter field.
- Keep most titles under about 60 characters.
- Keep H1s more descriptive if needed; title tags should be tighter and search-result-oriented.

### P1: The blog index is marked as `og:type="article"`

The blog index is a collection page, not an article. The schema correctly uses `CollectionPage`, but Open Graph says `article`.

Evidence:
- `src/pages/blog/index.astro` passes `type="article"` into `SiteLayout`.
- `src/lib/site.ts` uses `CollectionPage` in `blogIndexSchema()`.

Recommendation:
- Change the blog index Open Graph type to `website`.

### P2: Commercial SEO architecture is too shallow

The homepage contains strong commercial sections for missed-call recovery, tenant/lead follow-up, CRM workflow automation, maintenance intake, owner updates, vendor dispatch, pricing, integrations, and audit booking. Most of these are section anchors rather than indexable pages.

Impact:
- Blog posts may rank for informational queries, but there are fewer dedicated pages for high-intent service searches.
- Search engines get less page-level clarity for each offer.
- Sales traffic has fewer landing pages matched to intent.

Recommendation:
Create dedicated pages:
- `/services/missed-call-recovery/`
- `/services/leasing-follow-up/`
- `/services/maintenance-intake-automation/`
- `/services/crm-workflow-automation/`
- `/services/owner-update-automation/`
- `/services/vendor-dispatch-automation/`
- `/integrations/appfolio/`
- `/integrations/buildium/`
- `/integrations/leadsimple/`
- `/property-management-ai-automation/` or `/ai-front-desk-property-management/`

### P2: Programmatic location language is not supported by location pages

The article template injects a city list into every post: Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, and Miami. This can help geographic relevance lightly, but without dedicated local pages or unique local proof, it may read as generic.

Recommendation:
- Either keep location mentions modest, or create a small set of genuinely useful location pages.
- Only create local pages if each page can include market-specific context, examples, testimonials, or workflow needs.

### P2: Article schema can be stronger

Current schema includes Organization, WebSite, Article, WebPage, BreadcrumbList, and FAQPage. That is a good base. It can be improved with article images, author/publisher image or logo, and real dates.

Recommendation:
- Add `image` to Article schema.
- Add Organization logo if available.
- Add `mainEntityOfPage`, `datePublished`, and `dateModified` from frontmatter.
- Consider `Service` schema on service pages once those pages exist.

### P2: FAQ schema should be reviewed against visible page content

FAQPage schema is present for homepage and articles. That is fine when the exact FAQs are visible on the page. Continue to keep structured data aligned with visible content.

Recommendation:
- Confirm every FAQ in JSON-LD appears visibly on the same page.
- Avoid adding FAQ schema to pages where the FAQ section is thin or hidden.

### P3: Meta descriptions are mostly acceptable, with a few long entries

Most meta descriptions are in a usable range. A few exceed typical display length, including:
- Homepage: 173 characters
- `/blog/property-management-maintenance-status-update-automation/`: 191 characters
- `/blog/property-management-automation-tasks/`: 166 characters

Recommendation:
- Add a validation script that flags descriptions above 155-160 characters.
- Make descriptions benefit-driven and include the page's primary query.

### P3: Add SEO validation to CI or prebuild checks

The site already has tests and a successful build. Add a lightweight SEO validation script so regressions are caught before deployment.

Checks to include:
- Exactly one H1 per indexable page.
- Title length warning above 60 characters.
- Meta description warning above 160 characters.
- Canonical must match final URL.
- Every indexable HTML page must appear in sitemap.
- Sitemap URLs must build.
- Internal links must resolve.
- JSON-LD must parse.
- Images must have alt attributes.

## What Is Working Well

- The live homepage resolves and contains crawlable HTML content.
- `npm run build` succeeds and generated 31 pages.
- Robots file allows crawling and references the sitemap.
- Canonical tags are present on all audited HTML pages.
- Open Graph and Twitter card metadata are present.
- All audited pages have exactly one H1.
- No internal broken links were found in the generated static HTML.
- Image alt attributes were present in the generated HTML.
- Blog content has clean, descriptive slugs.
- Article pages include breadcrumbs, related posts, CTA blocks, FAQ content, and JSON-LD.

## Recommended 30-Day SEO Roadmap

### Week 1: Technical Cleanup

- Add `/links/` to the sitemap or mark it `noindex`.
- Add `publishedAt` and `updatedAt` to blog frontmatter.
- Update Article schema and sitemap `lastmod` to use real dates.
- Change blog index Open Graph type to `website`.
- Add an SEO validation script to the build/test workflow.

### Week 2: Metadata Pass

- Add `seoTitle` frontmatter.
- Rewrite title tags over 60 characters.
- Trim long meta descriptions.
- Add Article `image` and Organization `logo` schema fields.

### Week 3: Commercial Landing Pages

- Build dedicated pages for the 4 highest-value services:
  - Missed-call recovery
  - Leasing follow-up
  - Maintenance intake automation
  - CRM workflow automation
- Add these pages to header/footer navigation and sitemap.
- Add contextual links from relevant blog posts into these pages.

### Week 4: Internal Linking and Topic Clusters

- Create hub sections around:
  - Leasing automation
  - Maintenance automation
  - Owner/vendor communication
  - CRM workflow automation
  - SMS compliance
- Add links from each article to its matching service page.
- Add comparison/supporting posts where search intent is missing.

## Suggested Service Page Template

Each service page should include:
- One focused H1 matching the service intent.
- Short problem statement for property managers.
- What the workflow does.
- When to use it.
- Systems it can connect with.
- Implementation timeline.
- Metrics to track.
- FAQ section.
- CTA to request a workflow audit.
- Links to supporting blog posts.

## Highest-Value Page Opportunities

1. `Missed Call Recovery for Property Managers`
2. `AI Leasing Follow-Up Automation`
3. `Property Management Maintenance Intake Automation`
4. `CRM Workflow Automation for Property Managers`
5. `AI Front Desk for Property Management Companies`
6. `AppFolio Automation for Leasing and Maintenance Workflows`
7. `Buildium Automation for Property Managers`

## Verification Performed

- Ran `npm run build`.
- Reviewed emitted HTML in `dist/`.
- Checked generated title lengths, meta description lengths, canonical tags, H1 count, JSON-LD presence, and missing image alt attributes.
- Checked internal links in generated static HTML.
- Reviewed `robots.txt` and generated `sitemap.xml`.
- Verified the live homepage content at `https://www.emc2ops.com/`.

# EMC2Ops SEO Phase 1 Specification

## Objective

Improve the click-through and ranking potential of EMC2Ops pages that already receive Google impressions while increasing qualified, profitable pipeline, without adding thin pages for every observed query variation.

## Baseline

Google Search Console, July 24 through August 20, 2026:

- 1,982 impressions
- 2 clicks
- 0.1% click-through rate
- 25.7 average position

The disclosed query table shows no clicks, so the two total clicks are likely hidden by Search Console query privacy. Treat small click changes as directional rather than statistically reliable.

## Search-intent clusters

| Cluster | Candidate query language | Canonical commercial page | Supporting page |
| --- | --- | --- | --- |
| Apartment and multifamily lead tracking | apartment lead tracking; multifamily lead tracking | `/use-cases/apartment-lead-tracking/` | `/blog/apartment-lead-tracking/` |
| Leasing lead follow-up | leasing lead automation; leasing follow-up automation | `/services/leasing-follow-up/` | `/use-cases/real-estate-lead-follow-up-automation/` |
| Lead-to-lease workflow | lead-to-lease automation; lead to lease workflow | `/use-cases/lead-to-lease-automation/` | Relevant leasing and Buildium guides |
| Apartment call tracking | apartment call tracking; leasing call routing | `/services/missed-call-recovery/` | Relevant call-routing and after-hours guides |
| CRM cleanup | real estate CRM cleanup; property management CRM cleanup; messy pipeline stages | `/use-cases/real-estate-crm-follow-up-mess/` | CRM, deduplication, stale-lead, and pipeline guides |
| Buildium workflows | Buildium workflow automation integration | `/integrations/buildium/` | Existing Buildium workflow guides |
| AppFolio workflows | AppFolio workflow integration | `/integrations/appfolio/` | Existing AppFolio workflow guides |

These phrases may include ordinary reformulations, Search Console query-group variants, or AI-feature query fan-out. They are evidence of a topic cluster, not proof that each phrase needs a new URL.

## In scope

1. Store a reviewed query-to-page ownership map with one canonical page per intent cluster.
2. Improve titles, descriptions, headings, opening summaries, FAQs, and contextual links on the seven existing commercial targets.
3. Reposition the apartment lead tracking blog post as an educational workflow guide and make it pass content preflight.
4. Extend keyword-family governance so new posts cannot claim a reserved commercial keyword or omit the canonical commercial link.
5. Repair the `/links/` image and booking CTA, add structured data to commercial hubs, and add a live LP asset/noindex smoke test.
6. Verify the existing booking events from page view through confirmed consultation.
7. Establish a post-deployment Search Console measurement procedure that separates conventional Web performance from generative-AI visibility when that report is available.
8. Establish a buyer-intent and contribution-margin scorecard using the existing booking fields and sales outcomes.
9. Measure whether AI assistants mention EMC2Ops without being prompted with the brand name.

## AI visibility goal

The desired outcome is unprompted discovery: when a property-management buyer asks a generic question such as `Which companies provide property management automation services?`, EMC2Ops should appear naturally in the answer when it is a relevant choice.

Phase 1 visibility prompts must therefore be brand-neutral. They must not contain `EMC2Ops`, `emc2ops.com`, or language instructing the assistant to find or mention the company. Prompts and raw answers must be logged so the mention rate, citations, context, and competing brands can be reviewed honestly.

An approved example is:

> Which companies provide property management automation services for U.S. property managers, and what does each company specialize in?

Brand-explicit prompts may still be used for a separate on-page quality audit, but their results must never be counted as organic AI mention visibility.

## Global acceptance criteria

- No new indexable URL is created solely for a query variant.
- No page is redirected, deleted, canonicalized elsewhere, or changed to `noindex` during Phase 1.
- Each cluster has exactly one canonical commercial target in the query map.
- Final rendered titles are 65 characters or fewer, including ` | EMC2Ops` where the template appends it.
- Meta descriptions are 160 characters or fewer.
- No fabricated customer outcomes, integrations, rankings, or guarantees are introduced.
- `npm run blog:validate`, `npm run build`, `npm run seo:validate`, `npm run test:api`, the Phase 1 SEO tests, and the relevant Playwright tests pass.
- The live LP smoke test confirms that each tested LP is `noindex` and that every referenced first-party CSS, JavaScript, and image asset returns below HTTP 400.
- Every Phase 1 AI visibility prompt is brand-neutral, and results record whether EMC2Ops appeared unprompted, how it was described, which EMC2Ops URLs were cited, and which competitors appeared.
- The seven-page cohort is evaluated on qualified bookings, sales-qualified opportunities, won revenue, delivery cost, and contribution margin; clicks and impressions remain leading indicators.
- Existing booking attribution fields (`workflow`, `source`, `pageUrl`, and `portfolioSize`) are preserved; no new database column is required for Phase 1.
- Deployment remains a separate founder approval gate.

## Out of scope

- Publishing a new case study without customer-approved evidence
- New comparison or segment pages
- Bulk content pruning or consolidation
- Automated content generation or publishing
- Backlink outreach
- Ahrefs subscription changes
- Automated deployment
- Rewriting the external PM Ops landing-page deployment architecture unless the smoke test proves it is broken
- Changing booking storage or CRM schemas before the current sales outcome fields are audited

## Measurement

Primary cohort: the seven canonical pages in this specification.

Measure at 7, 14, and 28 days after deployment:

- impressions, clicks, CTR, and average position by page;
- query-group impressions for each intent cluster;
- count of cohort pages in positions 4–10, 11–20, and 21–50;
- `booking_page_view`, `calendar_slot_selected`, `form_start`, `booking_confirmed`, and `form_error` events;
- booked and qualified consultations, reported separately from traffic.
- sales-qualified opportunities, won revenue, delivery cost, and contribution margin by source and workflow.

Profitability formulas:

- Qualified booking rate = qualified bookings / organic booking sessions.
- Sales-qualified rate = sales-qualified opportunities / qualified bookings.
- Close rate = won opportunities / sales-qualified opportunities.
- Contribution profit = won revenue − delivery cost − attributable marketing cost.
- Organic CAC = attributable marketing cost / won organic customers.

Do not set a numeric CAC or margin threshold until actual project price and delivery-cost data are available; record the baseline first.

A 50% month-over-month improvement remains the business target, but Phase 1 is accepted on implementation quality and leading indicators because the two-click baseline is too small for a stable forecast.

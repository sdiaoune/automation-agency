# EMC2Ops SEO Phase 1 Baseline

## Search Console baseline

- Period: 2026-07-24 through 2026-08-20
- Clicks: 2
- Impressions: 1,982
- CTR: 0.1%
- Average position: 25.7

## Priority cohort

- /use-cases/apartment-lead-tracking/
- /services/leasing-follow-up/
- /use-cases/lead-to-lease-automation/
- /services/missed-call-recovery/
- /use-cases/real-estate-crm-follow-up-mess/
- /integrations/buildium/
- /integrations/appfolio/

## Measurement dates

- Deployment date: not deployed
- 7-day review: not scheduled
- 14-day review: not scheduled
- 28-day review: not scheduled

## Interpretation rule

Observed query variants may be conventional reformulations, Search Console query-group members, or generative-AI query fan-out. They inform cluster language but do not independently justify new pages.

## Execution checkpoint

- Repository: `/Users/diaoune/automation-agency`
- Starting commit: e3bc3aaa0c170388c3bf5e90d58e25b64b60dd35
- Existing target-file changes reviewed: yes
- Execution location: current worktree with narrow patches
- Deployment authorized: no

## Pre-deployment verification

- Query-map tests: passed (`npm run test:seo-query-map`, 2 tests).
- Phase 1 LLM query-set tests: passed (`npm run test:llm-phase-1-query-set`, 3 tests); no live AI providers were called.
- Phase 1 rendered SEO tests: passed (`npm run test:seo-phase-1`, 9 tests).
- Apartment guide preflight: passed (1,142 body words, 6 internal blog links, and a valid social image).
- Blog validation: passed (158 Astro blog posts).
- Astro build: passed (203 pages).
- SEO validation: passed (204 HTML pages). Existing metadata-length warnings remain outside the seven-page cohort; the `/book-demo/` description warning was resolved by commit `fb6912f` (128-character description).
- API tests: passed (33 tests).
- Public-site and mobile tests: failed. The Chromium run fails at `tests/public-site.spec.js:418` because its old expected H1, `AI leasing follow-up automation`, no longer matches the approved Phase 1 rendered H1, `Leasing lead automation for property managers`. That same fixture also still expects `Buildium integration automation for property managers`, while the approved rendered H1 is `Buildium workflow automation integration`. Reconcile both assertions before release.
- Live LP validation: failed. `https://www.emc2ops.com/lp/property-management-systems/`, `/lp/property-management-crm/`, and `/lp/ai-property-management/` each return 404 and lack both `X-Robots-Tag: noindex` and a meta-robots noindex directive. The public deployment is not applying the checked-in LP rewrite (or is serving an older configuration).
- Profitability scorecard created: passed.
- Preview reviewed: completed locally on desktop and mobile. The seven commercial targets, `/book-demo/`, and `/links/` render their updated titles, descriptions, visible CTAs, related links where applicable, and workflow/source booking context; no unsupported integration access or guaranteed outcome was observed.
- Deployment authorized: no. Resolve the stale browser assertion and the primary-domain LP rewrite/noindex failure, then rerun the failed checks and obtain founder approval before deployment.

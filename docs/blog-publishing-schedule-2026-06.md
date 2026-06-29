# Search Console SEO Cluster Priorities: July 2026

This replaces the early June publishing schedule. The June Search Console export showed early impressions but very low CTR, especially after June 21. The next publishing cycle should concentrate authority around the pages already earning impressions instead of adding disconnected posts.

## Primary Money Pages

| Priority | Page | Search intent | Role |
| --- | --- | --- | --- |
| P0 | `/use-cases/apartment-lead-tracking/` | apartment lead tracking, multifamily lead tracking | Primary page for source capture, deduplication, ownership, and CRM writeback. |
| P0 | `/use-cases/lead-to-lease-automation/` | lead-to-lease automation, lead to lease | Primary page for inquiry, tour, application, approval, and move-in handoffs. |
| P0 | `/use-cases/how-to-automate-property-management/` | property management automation, how to automate property management | Primary page for choosing the first measurable workflow. |
| P1 | `/integrations/buildium/` | Buildium integration, Buildium automation | Primary page for Buildium-adjacent workflow scoping and supported handoffs. |
| P1 | `/services/leasing-follow-up/` | leasing follow-up automation | Service page for stale replies, no-shows, application follow-up, and stop rules. |

## Supporting Content Queue

| Cluster | Supporting article angles | Link target |
| --- | --- | --- |
| Apartment lead tracking | lead source attribution, renter deduplication, guest card creation, call/form/ILS intake, lead owner assignment | `/use-cases/apartment-lead-tracking/` |
| Lead-to-lease automation | tour-to-application follow-up, approval handoffs, move-in task creation, no-show recovery, application reminders | `/use-cases/lead-to-lease-automation/` |
| Property management automation | first workflow selection, maintenance intake rollout, CRM field discipline, owner update approval gates, vendor dispatch routing | `/use-cases/how-to-automate-property-management/` |
| Buildium workflows | Buildium task handoffs, Buildium maintenance intake, Buildium owner updates, Buildium leasing follow-up, supported API or middleware paths | `/integrations/buildium/` |
| Leasing follow-up service | stale lead reactivation, post-tour follow-up, SMS/email cadence, suppression rules, no-show recovery | `/services/leasing-follow-up/` |

## Publishing Rules

- Do not use reserved money-page keywords as new blog `keyword` values unless the blog post also links to the matching primary page and clearly acts as a support article.
- Prefer long-tail keywords that describe the specific workflow problem.
- Add at least one body link to the target money page in the first half of the article.
- Add `relatedUseCases` or `relatedServices` frontmatter for the target page when available.
- Keep each post focused on one operational handoff: trigger, required fields, routing rule, exception path, system update, and metric.
- Run `npm run blog:validate` before build so reserved keyword conflicts are caught.

## Optimization Checklist

- Title tags should put the long-tail topic near the front and stay under 65 characters when practical.
- Meta descriptions should state the workflow outcome, not just the topic.
- The first section should answer the exact operational question in plain language.
- FAQ answers should use concise, buyer-language explanations.
- Each support article should reinforce one primary page and 2-4 adjacent blog posts.
- Mention measurable outcomes, CRM or system-of-record updates, escalation rules, and human review.

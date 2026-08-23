# EMC2Ops Phase 1 Buyer-Intent and Profitability Scorecard

## Page intent tiers

| Tier | Pages | Success signal |
| --- | --- | --- |
| High | `/services/leasing-follow-up/`, `/services/missed-call-recovery/`, `/use-cases/real-estate-crm-follow-up-mess/`, `/integrations/buildium/`, `/integrations/appfolio/` | Qualified consultation, sales-qualified opportunity, or won project |
| Medium-high | `/use-cases/apartment-lead-tracking/`, `/use-cases/lead-to-lease-automation/` | Qualified consultation that identifies a measurable workflow and buying context |

## Weekly fields

| Field | Definition | Source |
| --- | --- | --- |
| Organic booking sessions | Sessions landing on a cohort page from organic search | Analytics |
| Qualified bookings | Bookings with a valid workflow, company, work email, and usable portfolio context | Booking record + sales review |
| Sales-qualified opportunities | Qualified bookings accepted for a scoped sales conversation | CRM |
| Won revenue | Contracted revenue attributed to the cohort page/workflow | CRM or finance record |
| Delivery cost | Labor, contractor, software, and usage cost required to deliver the project | Delivery record |
| Attributable marketing cost | Approved SEO labor/tool cost allocated to the cohort | Finance record |
| Contribution profit | Won revenue minus delivery cost minus attributable marketing cost | Calculation |

## Formulas

- Qualified booking rate = qualified bookings / organic booking sessions.
- Sales-qualified rate = sales-qualified opportunities / qualified bookings.
- Close rate = won opportunities / sales-qualified opportunities.
- Contribution profit = won revenue − delivery cost − attributable marketing cost.
- Organic CAC = attributable marketing cost / won organic customers.

Do not set a numeric margin or CAC threshold until the first complete baseline has actual revenue and delivery-cost values.

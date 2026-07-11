# SMS Consent Page Design

## Goal

Add a public `/sms-consent/` page to the EMC2Ops website, update the website's company contact email to `soya@getemc2ops.com`, and expose the new compliance page through the footer and sitemap.

## Page design

The SMS consent page will follow the existing `/terms/` and `/privacy/` legal-page pattern exactly: `SiteLayout`, the standard site header and footer, `service-page` body class, legal breadcrumb hero, and `detail-section` content typography from `service.css`. No new visual system or decorative assets are needed.

The page title is “EMC2Ops SMS Consent and Enrollment Process.” Its sections are:

1. Introductory scope statement
2. How verbal consent is collected
3. Required affirmative customer response
4. How consent is recorded
5. Confirmation message
6. Opting out
7. Privacy
8. Links to `/privacy/` and `/terms/`

The disclosure, affirmative response, and confirmation message will be visually distinguished as quotations while remaining accessible, selectable HTML text. The HELP contact will be `soya@getemc2ops.com`.

## Contact email scope

Replace the public website's EMC2Ops-owned `hello@emc2ops.com` references with `soya@getemc2ops.com`, including mailto links, structured site data, booking fallback text, `llms-full.txt`, and `security.txt`. Customer, prospect, fixture, example, generated campaign, and historical email addresses are outside scope.

## Navigation and discovery

Add “SMS Consent” to the shared site footer. Add `/sms-consent/` to sitemap generation/static sitemap coverage and any SEO route allowlists used by validation.

## Testing and acceptance

- `/sms-consent/` builds and returns successfully.
- The page contains the supplied consent disclosure, affirmative opt-in, confirmation, STOP/HELP language, consent-record fields, and non-sharing statement.
- Privacy links to `/privacy/`; SMS Terms and Conditions links to `/terms/`.
- Public website-owned contact references use `soya@getemc2ops.com`, with no remaining `hello@emc2ops.com` in the public source surface.
- The page visually matches `/terms/` and `/privacy/` at desktop and mobile widths.
- Existing public-site tests, SEO validation, and the production build pass.


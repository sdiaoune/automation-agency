# SMS Consent Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an EMC2Ops SMS consent page at `/sms-consent/` and update the public website contact email to `soya@getemc2ops.com`.

**Architecture:** Add one Astro legal page composed from the site's existing layout, header, footer, schema helper, and legal-page CSS. Update shared and page-level public contact references, then register the route in footer/sitemap/SEO coverage and verify it with Playwright plus the production build.

**Tech Stack:** Astro 6, HTML/CSS, Node.js validation scripts, Playwright

## Global Constraints

- Match `/terms/` and `/privacy/` structure and styling.
- Use `/privacy/` for Privacy Policy and `/terms/` for SMS Terms and Conditions.
- Use `soya@getemc2ops.com` for all EMC2Ops-owned public website contact references.
- Do not modify prospect, customer, fixture, generated campaign, or historical email addresses.
- Preserve the user's supplied compliance wording except for formatting and light punctuation normalization.

---

### Task 1: Add failing public-page coverage

**Files:**
- Modify: `tests/public-site.spec.js`

**Interfaces:**
- Consumes: Astro public routes rendered by the Playwright web server.
- Produces: Assertions for `/sms-consent/`, its required copy, legal links, footer discovery, and public contact email.

- [ ] **Step 1: Write focused failing tests**

Add Playwright assertions that load `/sms-consent/`, require the H1 “EMC2Ops SMS Consent and Enrollment Process,” check the quoted opt-in and confirmation language, verify STOP and HELP, verify links to `/privacy/` and `/terms/`, and confirm `soya@getemc2ops.com` appears.

- [ ] **Step 2: Verify the tests fail for the missing route**

Run: `npx playwright test tests/public-site.spec.js --browser=chromium --grep "SMS consent"`

Expected: FAIL because `/sms-consent/` does not exist yet.

- [ ] **Step 3: Commit the failing test**

Run: `git add tests/public-site.spec.js && git commit -m "test: cover SMS consent page"`

### Task 2: Build the SMS consent legal page

**Files:**
- Create: `src/pages/sms-consent.astro`
- Modify: `src/components/SiteFooter.astro`

**Interfaces:**
- Consumes: `SiteLayout`, `SiteHeader`, `SiteFooter`, `legalPageSchema`, and `service.css`.
- Produces: Static route `/sms-consent/` and shared footer link `/sms-consent/`.

- [ ] **Step 1: Implement the legal page with existing primitives**

Create an Astro page matching `terms.astro` and `privacy.astro`, including the approved sections, exact disclosure messages, email HELP contact, and legal links.

- [ ] **Step 2: Add footer discovery**

Add `{ label: "SMS Consent", href: "/sms-consent/" }` alongside Privacy and Terms in `SiteFooter.astro`.

- [ ] **Step 3: Verify the focused test passes**

Run: `npx playwright test tests/public-site.spec.js --browser=chromium --grep "SMS consent"`

Expected: PASS.

- [ ] **Step 4: Commit the page**

Run: `git add src/pages/sms-consent.astro src/components/SiteFooter.astro tests/public-site.spec.js && git commit -m "feat: add SMS consent page"`

### Task 3: Update the public contact email

**Files:**
- Modify: `src/lib/site.ts`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/terms.astro`
- Modify: `src/pages/llms-full.txt.ts`
- Modify: `src/components/AuditBookingSection.astro`
- Modify: `public/security.txt`

**Interfaces:**
- Consumes: Existing public contact strings and `mailto:` links.
- Produces: `soya@getemc2ops.com` everywhere the public website presents EMC2Ops contact information.

- [ ] **Step 1: Add a failing source-surface assertion**

Extend the public-site test or SEO validator to assert the public output does not contain `hello@emc2ops.com` and does contain `soya@getemc2ops.com` on representative contact/legal surfaces.

- [ ] **Step 2: Verify the assertion fails**

Run the focused Playwright test and confirm it reports the old email.

- [ ] **Step 3: Replace only EMC2Ops-owned public contact references**

Update the listed source/public files, preserving query strings such as the workflow-audit subject.

- [ ] **Step 4: Verify no old public contact remains**

Run: `rg -n "hello@emc2ops\.com" src public/security.txt`

Expected: no output and exit code 1.

- [ ] **Step 5: Commit the email update**

Run: `git add src public/security.txt tests/public-site.spec.js && git commit -m "chore: update website contact email"`

### Task 4: Register and verify the route

**Files:**
- Modify: `public/sitemap.xml` or the site's sitemap source used by the current build
- Modify: `scripts/seo-validate.mjs` if it maintains an explicit route list

**Interfaces:**
- Consumes: Existing sitemap and SEO validation conventions.
- Produces: Discoverable canonical `/sms-consent/` route covered by validation.

- [ ] **Step 1: Add the canonical route to sitemap and validation coverage**

Register `https://www.emc2ops.com/sms-consent/` using the same format as `/privacy/` and `/terms/`.

- [ ] **Step 2: Run complete verification**

Run: `npm run build && npm run seo:validate && npm run test:public`

Expected: all commands exit 0 with no failed tests.

- [ ] **Step 3: Verify desktop and mobile rendering**

Open `/sms-consent/` at a desktop viewport and a mobile viewport, compare structure and typography with `/terms/` and `/privacy/`, and confirm there is no overflow or clipped text.

- [ ] **Step 4: Commit route registration**

Run: `git add public/sitemap.xml scripts/seo-validate.mjs && git commit -m "chore: register SMS consent route"`

### Task 5: Push and deploy production

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: Verified Git commits and configured Vercel project.
- Produces: Updated remote branch and production deployment.

- [ ] **Step 1: Push the current branch**

Run: `git push origin HEAD`

Expected: remote branch update succeeds.

- [ ] **Step 2: Deploy production**

Run the repository's configured production deployment command, using Vercel production deployment if branch push alone is not the production trigger.

- [ ] **Step 3: Smoke-test production**

Load `https://www.emc2ops.com/sms-consent/` and verify HTTP success, required H1, new email, and both legal links.


# EMC2Ops Daily News-Cycle Blog Playbook

Purpose: every day at 6:30 a.m. America/New_York, review the current news cycle and produce one EMC2Ops blog article that connects a timely story to property management operations without drifting away from the core message.

## Core Messaging

EMC2Ops builds done-for-you AI front desk workflows for property managers.

The article must connect back to at least one of these operating outcomes:

- Faster leasing response.
- Missed-call recovery.
- After-hours lead capture.
- Tour scheduling and follow-up.
- Maintenance intake and routing.
- Owner updates.
- Vendor handoffs.
- CRM or property management system logging.
- Reduced administrative workload.
- Human escalation for sensitive or judgment-heavy issues.

Avoid positioning EMC2Ops as a general AI news site, a consumer AI reviewer, or a vendor for tools it does not sell. The news item is the hook; the property management workflow is the point.

## Daily Workflow

1. Check the current news cycle.
   - Prioritize fresh stories from the last 24-48 hours.
   - Look for technology, AI, housing, labor, customer service, compliance, insurance, maintenance, real estate, local market, or operations stories.
   - Exclude geopolitics and US politics, even when a loose property management angle is possible.
   - Verify facts with primary or reputable sources before writing.

2. Choose one angle.
   - Prefer a news hook that naturally maps to a property management workflow.
   - Reject stories that require a forced connection.
   - Do not chase sensational angles that create fear without an operational takeaway.

3. Write one blog article.
   - Use the existing Astro blog frontmatter schema.
   - Keep the title timely, but make the article evergreen enough to remain useful after the news cycle fades.
   - Include a direct answer, operational stakes, practical workflow guidance, metrics, FAQs, related posts, and sources.
   - Set `bodySections: true` and write a substantial article body, not a short workflow stub.
   - Add a `socialHook` frontmatter field with a sharp, shareable one-sentence hook for X and LinkedIn.
   - Generate a custom social card with `npm run blog:card -- --slug <slug>` and confirm the generated `socialImage` frontmatter points to `/blog/social-assets/<slug>.png`.
   - Target 1,000-1,400 body words before frontmatter; do not publish articles under 900 body words unless the user explicitly asks for a short note.
   - Add at least 6 contextual internal links to existing EMC2Ops blog posts inside the article body, plus the `related` frontmatter list.

4. Keep the message anchored.
   - Say clearly when the news item is only a signal, not a direct property management tool.
   - Translate the headline into a specific operational lesson for property managers.
   - End with an EMC2Ops workflow audit CTA.

5. Validate and publish.
   - Confirm the post has `socialHook` and a custom `socialImage` before build.
   - Run `npm run blog:validate`.
   - Run `npm run build`.
   - Run `npm run blog:deploy-guard` after the build. This must confirm that the rendered homepage hero, customer results strip, and homepage stylesheet bundle still match production. If it fails, stop: ship the unrelated site change separately or restore the intended production baseline before continuing.
   - Deploy with `npx vercel --prod --yes` only when the working tree state is intended for production.
   - Verify the public article URL and Twitter card, including that `twitter:image` points to the custom generated card rather than the default `/og-image.png`.
   - Promote the article through the existing social publishing script when appropriate. Follow `docs/blog-social-publishing-runbook.md` for the dry review, single-attempt publish flow, history inspection, channel-by-channel reporting, and duplicate prevention.

## Angle Filters

Use these filters before writing:

- Does the story affect how renters, residents, owners, vendors, or staff expect service to work?
- Does it expose a workflow gap property managers already feel?
- Can EMC2Ops credibly explain a practical automation response?
- Can the article stand without overclaiming a direct product relationship?
- Would a property manager managing 50+ doors care about the operational takeaway?

If the answer is no, skip the story.

## Approved Newsjacking Patterns

### AI and Consumer Technology

Use when a consumer AI story changes expectations around speed, natural language, voice, summarization, or task completion.

Messaging frame: consumer AI trains expectations; property managers need operational workflows that acknowledge, route, log, and escalate.

### Labor and Staffing

Use when a story covers hiring constraints, call volume, burnout, administrative work, or productivity.

Messaging frame: automation should reduce repetitive intake and coordination without replacing human judgment.

### Housing and Real Estate

Use when a story covers rents, vacancy, regulation, migration, affordability, or multifamily operations.

Messaging frame: market pressure makes response speed, clean pipelines, and resident communication more important.

### Customer Service

Use when a story covers support expectations, contact centers, chat, voice AI, or service failures.

Messaging frame: property management is a service business; the front desk needs measurable workflows, not disconnected inboxes.

### Compliance and Trust

Use when a story covers privacy, AI risk, SMS rules, fair housing, data security, or consumer protection.

Messaging frame: automate intake, reminders, summaries, and routing first; keep humans in control of sensitive decisions.

## Avoid

- Articles that imply EMC2Ops is integrated with a company or product unless it is true.
- Geopolitics or US politics.
- Generic "what happened in tech today" recaps.
- AI hype without a property management workflow.
- Claims that AI replaces leasing agents, maintenance coordinators, or property managers.
- Legal, fair housing, compliance, or financial advice without clear caution and human review.
- Publishing social posts with broken public URLs.

## Default Article Structure

Use this structure unless the story calls for a better one:

1. News hook in plain English.
2. Why property managers should care.
3. What the story does not mean.
4. The operational expectation that is changing.
5. The workflow property managers should fix first.
6. What to automate.
7. What not to automate.
8. Related EMC2Ops workflows to review next, with contextual internal links.
9. Metrics to track.
10. Practical takeaway.
11. EMC2Ops workflow audit CTA.

## Social Hook and Card Requirements

Daily news-cycle articles should be written with distribution in mind, not as generic SEO posts.

Before publishing, define a `socialHook` that can stand alone as the first line on X and LinkedIn. Strong hooks should:

- Make a clear, scroll-stopping claim tied to the news hook.
- Translate the headline into an operating consequence for property managers.
- Be concrete enough to make the reader curious, such as "OpenAI just made 'we'll call you tomorrow' feel obsolete."
- Avoid vague setup lines like "New guide," "In today's article," or "Property managers should pay attention."
- Avoid unsupported fear, fake metrics, and overclaiming third-party relationships.

After the post is drafted, run:

```bash
npm run blog:card -- --slug <slug>
```

The renderer creates `/public/blog/social-assets/<slug>.png` and inserts `socialImage: "/blog/social-assets/<slug>.png"` into the post frontmatter when missing. The article should not publish with the generic `/og-image.png` fallback unless the card renderer fails and that blocker is reported.

When promoting the post, the social publisher uses `socialHook` for the X/LinkedIn opening. If the hook is weak, rewrite it before posting.

## SEO Internal Linking Requirements

Every daily article should help readers move deeper into the EMC2Ops property-management automation cluster.

## SEO Cluster Ownership Rules

Some short, commercial search intents are reserved for use-case, service, or integration pages. Daily blog posts can support these topics, but they should not compete as the primary page for the exact term.

Reserved money-page targets:

| Reserved keyword family | Primary page |
| --- | --- |
| apartment lead tracking, multifamily lead tracking | `/use-cases/apartment-lead-tracking/` |
| lead-to-lease automation, lead to lease | `/use-cases/lead-to-lease-automation/` |
| property management automation, how to automate property management | `/use-cases/how-to-automate-property-management/` |
| Buildium integration, Buildium integrations | `/integrations/buildium/` |

When a daily article touches one of these topics:

- Use a long-tail support angle for the blog keyword, not the reserved money-page keyword.
- Link contextually to the matching primary page in the body.
- Add `relatedUseCases` or `relatedServices` frontmatter when the destination is a use-case or service page.
- Keep the blog post practical and specific: examples, workflows, pitfalls, comparison points, or implementation detail that the primary page can summarize.
- Do not publish a new article whose main job is to replace one of the reserved pages unless the task is explicitly to update that page instead.

Before writing, run or inspect `npm run blog:list` and choose relevant existing posts. In the article body, include:

- 2-3 links to broad pillar or comparison guides, such as property management automation tasks, AI automation vs chatbots, AI front desk, or AI leasing assistant.
- 2-4 links to adjacent workflow guides, such as missed-call text-back, leasing follow-up, maintenance intake, CRM workflow automation, owner updates, vendor dispatch, tour scheduling, no-show recovery, or administrative workload reduction.
- Natural anchor text that describes the destination topic; avoid generic anchors like "click here," "this post," or "learn more."
- A short "Related workflows to review next" or equivalent section when it fits the article flow.

Do not stuff links into unrelated paragraphs. The link should answer the reader's next operational question.

## Body Depth Requirements

The article body should keep readers on the page by giving them enough substance to act:

- Open with the timely news hook, then quickly translate it into a property-management workflow issue.
- Explain the operational cost with concrete examples from leasing, maintenance, owner communication, vendor handoffs, or CRM/PMS logging.
- Include a practical workflow model with trigger, required fields, routing, exception handling, system update, and reporting.
- Add "what to automate" and "what not to automate" sections so the advice does not sound like generic AI hype.
- End with a concrete rollout path and the workflow audit CTA.

## Default CTA

If this news cycle has you thinking about AI front desk workflows, book a 15-minute workflow audit. EMC2Ops will map the first leasing, maintenance, owner update, vendor handoff, or CRM workflow worth automating.

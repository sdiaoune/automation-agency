# PM Ops Money-Page Screenshot System Design

Date: 2026-07-10

## Objective

Create and apply privacy-safe, page-specific PM Ops product screenshots across every EMC2Ops commercial-intent page. Each page receives a unique fictional PM Ops state with separate desktop and mobile captures. The final marketing implementation must preserve the existing page structure, align precisely with the site container system, and expose no live customer, operator, workspace, account, integration, or Supabase data.

## Scope

The implementation covers 20 pages and produces 40 screenshot assets.

### Commercial pages

1. `/`
2. `/services/`
3. `/use-cases/`
4. `/integrations/`
5. `/book-demo/`
6. `/services/missed-call-recovery/`
7. `/services/leasing-follow-up/`
8. `/services/maintenance-intake-automation/`
9. `/services/crm-workflow-automation/`
10. `/services/owner-update-automation/`
11. `/services/vendor-dispatch-automation/`
12. `/services/ai-front-desk-property-management/`
13. `/use-cases/apartment-lead-tracking/`
14. `/use-cases/real-estate-lead-follow-up-automation/`
15. `/use-cases/how-to-automate-property-management/`
16. `/use-cases/lead-to-lease-automation/`
17. `/use-cases/real-estate-crm-follow-up-mess/`
18. `/integrations/appfolio/`
19. `/integrations/buildium/`
20. `/integrations/leadsimple/`

### Exclusions

- Blog pages, legal pages, and the About page.
- Live application data or production Supabase changes.
- Live PM Ops embeds or iframes.
- Redesigning the existing marketing-page information architecture.
- Rebuilding screenshots as CSS-only product mockups.

## Approved Approach

Use the official PM Ops application at `/Users/diaoune/Documents/Codex/2026-07-05/i/property-manager-app` as the sole visual source. Add a development-only capture mode backed by deterministic fictional fixtures. Capture the official app at two viewports per scenario, optimize the assets, and place them through one shared Astro component in the marketing site.

This approach keeps the imagery authentic to PM Ops while providing stronger privacy, page relevance, repeatability, and responsive control than live embeds or reconstructed mockups.

## Scenario Registry

Each route maps to one unique capture scenario.

| Route | PM Ops state |
| --- | --- |
| `/` | Executive operations dashboard with fictional portfolio metrics |
| `/services/` | Automation workflow catalog and health overview |
| `/use-cases/` | Cross-functional activity queue for leasing, maintenance, CRM, owner, and vendor work |
| `/integrations/` | Integration connection and synchronization health |
| `/book-demo/` | Audit-ready operations overview with one recommended first workflow |
| `/services/missed-call-recovery/` | Recovered missed caller, qualification summary, and next action |
| `/services/leasing-follow-up/` | Stale renter lead with stage-aware follow-up and a booked-tour path |
| `/services/maintenance-intake-automation/` | Resident request with urgency, access notes, photos, and routing |
| `/services/crm-workflow-automation/` | CRM synchronization queue with ownership and next steps |
| `/services/owner-update-automation/` | Owner update draft awaiting human review |
| `/services/vendor-dispatch-automation/` | Qualified work order, approval threshold, and vendor assignment |
| `/services/ai-front-desk-property-management/` | Multi-channel leasing and resident conversation queue |
| `/use-cases/apartment-lead-tracking/` | Lead-source, qualification, ownership, and tour tracking |
| `/use-cases/real-estate-lead-follow-up-automation/` | Stale-lead recovery sequence with stop rules |
| `/use-cases/how-to-automate-property-management/` | Mixed operations dashboard highlighting a recommended first automation |
| `/use-cases/lead-to-lease-automation/` | Inquiry-to-tour-to-application pipeline |
| `/use-cases/real-estate-crm-follow-up-mess/` | Duplicate records, missing owners, and stale-task cleanup |
| `/integrations/appfolio/` | AppFolio synchronization health and workflow writebacks |
| `/integrations/buildium/` | Buildium lead, work-order, and owner-update synchronization |
| `/integrations/leadsimple/` | LeadSimple pipeline, task, and follow-up synchronization |

## PM Ops Capture Mode

### Activation

Capture mode must require both:

1. A local-only environment flag such as `PM_OPS_CAPTURE_MODE=1`.
2. A supported scenario identifier in the local request.

If either condition is absent, PM Ops must use its existing authentication and Supabase-backed loader path. Production builds must not expose the capture fixtures through a public URL.

### Fixture architecture

Create a typed scenario registry that returns valid `OpsData` for each approved scenario. Reuse shared fixture builders for workspace, operator, properties, metrics, workflows, tasks, review gates, and integration states. Individual scenarios override only the fields needed to produce their page-specific state.

The capture data must be deterministic: repeated runs produce the same visible values, selected record, timestamps, ordering, and layout.

### Fictional data rules

- Operator and workspace names must be fictional and unrelated to EMC2Ops accounts.
- Email addresses must use reserved `example.com` domains.
- Phone numbers must use fictional North American `555-01xx` ranges.
- Property names and addresses must be fictional.
- IDs, timestamps, metrics, workflow history, financial values, and integration references must be invented for the scenario registry.
- Do not use live database reads while capture mode is active.
- Do not display the existing operator name, workspace slug, phone number, Supabase project reference, or live integration identifiers.

## Capture Pipeline

Create a deterministic capture script that:

1. Starts or connects to PM Ops in local capture mode.
2. Opens each scenario at its intended application section and selected detail state.
3. Captures a desktop image at 1440 by 900 pixels.
4. Captures a mobile image at 390 by 844 pixels using the genuine responsive PM Ops layout.
5. Waits for fonts and meaningful app content before capturing.
6. Rejects framework error overlays, blank states, loading shells, and relevant console errors.
7. Inspects visible DOM text before each capture and rejects known live or sensitive strings.
8. Writes optimized WebP assets plus JPEG fallbacks into a stable public asset structure.
9. Produces a 40-image contact sheet outside committed production assets for final visual review.

Mobile captures are independent responsive renders, not crops of desktop images.

## Marketing-Site Architecture

### Screenshot manifest

Add a typed manifest that maps each of the 20 routes to:

- Scenario identifier.
- Desktop WebP and JPEG paths.
- Mobile WebP and JPEG paths.
- Descriptive alt text.
- Optional priority-loading behavior.

The route manifest is the single source of truth for templates and capture automation.

### Shared Astro component

Add `ProductScreenshot.astro` with a small public API. The component renders:

- A semantic `<picture>` element.
- Mobile sources selected below 720 pixels.
- WebP sources with JPEG fallback.
- Explicit intrinsic width and height.
- Descriptive alt text.
- A shared product-frame wrapper.
- Optional high-priority loading for the homepage hero.

The component must not crop the app UI. Images render at full width with automatic height.

## Placement

### Homepage

Replace the existing illustrated dashboard mockup on the right side of the homepage hero with the homepage PM Ops capture. Preserve the current hero copy, CTA labels, offer strip, proof items, and two-column structure.

### Service detail pages

Place the route-specific product proof immediately after the hero and before the existing `What this improves` section.

### Use-case detail pages

Place the route-specific product proof immediately after the hero and before the existing `Problems this workflow solves` section.

### Integration detail pages

Place the route-specific product proof immediately after the hero and before the existing `What can connect` section.

### Index pages

On the services, use-cases, and integrations indexes, place the matching screenshot immediately after the hero and before the decision-guide content.

### Book-demo page

Place the audit-ready screenshot between the booking hero and `AuditBookingSection`, preserving the booking form and its existing conversion flow.

## Alignment and Responsive Rules

- The outer frame aligns exactly with the existing `.wrap` container.
- Desktop maximum content width remains 1120 pixels.
- Mobile horizontal page spacing remains 20 pixels per side.
- The screenshot frame uses one shared border, radius, background, and shadow treatment.
- The image has explicit intrinsic dimensions to prevent cumulative layout shift.
- No `object-fit: cover`, negative positioning, or viewport-dependent cropping.
- Desktop assets are 1440 by 900; mobile assets are 390 by 844.
- Below 720 pixels, the `<picture>` element selects the mobile capture.
- The frame and image must not create horizontal overflow at 320, 390, 768, 1024, or 1440-pixel viewport widths.
- Homepage framing may use a compact hero variant, but its border, radius, and visual treatment must remain consistent with the full-width proof component.
- Dark-mode styling must not obscure or recolor the screenshot itself.

## Privacy Validation

Before an image is written, the capture script must inspect visible DOM text and fail when it finds:

- The existing live operator or workspace identity.
- The previously exposed phone number.
- Live email addresses or account identifiers.
- Supabase project references.
- Production integration identifiers.
- Any configured forbidden-string list.

The scenario registry must also have an automated fixture test confirming that every email, phone number, name, address, identifier, and metric complies with the fictional-data rules.

## Testing and Verification

### PM Ops checks

- Typecheck and build pass.
- Every capture scenario returns meaningful content.
- Scenario registry tests pass.
- Production loader behavior remains unchanged when capture mode is disabled.
- Mobile navigation, tables, selected details, and primary content do not overlap or clip.

### Marketing-site checks

- Astro build passes.
- Existing public-site tests pass.
- Each of the 20 commercial routes renders the correct scenario asset.
- Desktop verification uses 1440 by 900.
- Mobile verification uses 390 by 844.
- The selected `<picture>` source matches the viewport.
- The screenshot frame aligns with the route's content container.
- No page has horizontal overflow, missing assets, broken alt text, framework overlays, or relevant console errors.
- Homepage and booking conversion controls remain functional.

### Visual QA

- Review all 40 assets in a contact sheet.
- Review each route in the browser at both target viewports.
- Compare frame edges, section spacing, border radius, image scale, and next-section rhythm.
- Correct any clipped text, accidental wrapping, inconsistent density, uneven spacing, or mobile overflow before handoff.

## Error Handling

- Unknown scenario identifiers return a clear local capture error and do not fall back to live data.
- Missing screenshot manifest entries fail the marketing build.
- Missing source files fail automated asset verification.
- A sensitive-string match stops the capture run before the affected file is saved.
- Capture failures identify the route, scenario, viewport, and validation rule that failed.

## Deliverables

- Development-only PM Ops scenario registry and capture-mode loader path.
- Forty optimized screenshot assets: desktop and mobile for 20 pages.
- JPEG fallbacks for all screenshot assets.
- Route-to-screenshot manifest.
- Reusable Astro screenshot component.
- Template integration across all 20 commercial pages.
- Capture automation and privacy checks.
- Responsive browser verification and final contact sheet.

## Success Criteria

The work is complete when every listed commercial route displays its unique, privacy-safe PM Ops scenario; desktop and mobile renderings select the correct assets; all frames align to the marketing-site container system; no sensitive data is present; builds and tests pass; and the complete 40-image set has been visually reviewed at the approved target dimensions.

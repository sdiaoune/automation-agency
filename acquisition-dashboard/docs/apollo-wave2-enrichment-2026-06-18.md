# Apollo Wave 2 Enrichment - 2026-06-18

## Scope

- User approved enriching another 80 Apollo prospects for EMC2Ops property-management outreach.
- User then approved 2 additional Apollo credits after two records were looked up twice while reconciling truncated connector output.
- Total approved and consumed Apollo credits for this run: 82.
- No Apollo action was taken after the final 2-credit approval except reconciling local session output.

## Apollo Provenance

- Conversation ref: `x7m2q9ra`
- Bulk enrichment request IDs:
  - `6815284726314521690`
  - `-2457756024038309518`
  - `313864498105691616`
  - `5957699174447300625`
  - `-3931918205575003345`
  - `6507345057809904226`
  - `7576081349323199155`
  - `2526055228578810242`
  - `-6752162121678354315`
  - `-7315760033173490076`

## Output Files

- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/emc2ops-apollo-wave2-enriched-prospects-2026-06-18.xlsx`
- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/apollo-wave2-enriched-prospects-2026-06-18.csv`
- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/apollo-wave2-enriched-prospects-2026-06-18.json`
- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/speed-to-lead-send-queue-2026-06-22.json`
- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/revenue-recovery-send-queue-2026-06-23.json`
- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/dashboard-write-results-2026-06-18.json`
- `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/outlook-reply-bookkeeping-2026-06-18.json`

## Selection

- 80 unique Apollo people were extracted from the approved enrichment payloads.
- Workbook sheets:
  - `All 80 Enriched`: 80 rows.
  - `Speed-to-Lead 40`: 40 rows, scheduled to start 2026-06-22.
  - `Revenue Recovery 40`: 40 rows, scheduled to start 2026-06-23.
- 78 records were scored send-ready and inserted into the acquisition dashboard.
- 2 records stayed visible in the workbook but were not inserted for sending:
  - Allen & Rocks, Inc. / Michelle Parran: weak property-management and role signal; missing org domain.
  - CARIDA MANAGEMENT, LLC / Kyle Wong: unrelated `kaiserpermanente.org` email domain.

## Outreach Schedule

- Existing heartbeat automation updated: `emc2ops-missed-call-email-sequence`.
- New automation name: `EMC2Ops paced property-management email sequences`.
- Schedule: hourly checks during 9:00 AM-4:00 PM America/New_York from
  2026-06-18 through 2026-07-02.
- Cohort 1 starts 2026-06-18: Missed Calls Recovery, 32 email-ready prospects
  from the first Apollo spreadsheet.
- Cohort 2 starts 2026-06-18: Speed-to-Lead Response, 40-row wave 2 queue.
- Cohort 3 starts 2026-06-18: Revenue Recovery from Lost Leads, 40-row wave 2
  queue.
- The runner is instructed to skip rejected, failed, manually paused, blank-email, bounced, opted-out, replied, won, lost, or not-send-ready records.
- Safe sending rules: max 6 emails per automation run, max 30 approved
  cold/follow-up emails per day, at least 7 minutes between sends in the same
  run, and greeting rotation across `Hi`, `Hey`, `Hello`, first-name-only, and
  `Good morning`.

## Outlook Bookkeeping

- Recent Outlook scan found no new human buying-intent replies in the newest page.
- Scarlett Properties auto-response and JRealty out-of-office reply activities were already logged, so no duplicate rows were inserted.
- Added missing EquityTeam Property Management bounce evidence as an `outreach_activities` row with outcome `Outlook bounce`.

## Guardrails

- No calls, LinkedIn messages, proposals, pricing, calendar changes, or delivery commitments were made.
- No Apollo search, enrichment, export, list creation, record update, sequence action, or outreach action should happen next without a fresh explicit Apollo approval.

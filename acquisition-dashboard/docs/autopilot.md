# EMC2Ops Acquisition Autopilot

This runbook turns the 30-day client acquisition strategy into a recurring
operating loop for the EMC2Ops property-management sprint.

## Mission

Optimize for qualified sales conversations around one offer: the 7-Day Missed
Leasing Call Recovery System for residential property managers.

The operating record is the acquisition dashboard. Read the dashboard snapshot
before deciding what matters today, and update records only when the change is
grounded in research, user input, or evidence in the workspace.

## Autonomous Work

The agent may advance these tasks without waiting for the founder:

1. Use Apollo to find and enrich property-management prospects that match the
   ICP. Do not use internet search as the default prospect source while Apollo
   access is available.
2. Enrich Apollo leads in batches of 5 credits at a time. Stop after each
   5-person batch, record credits used, and preserve Apollo provenance in
   dashboard source, software clues, pain signal, or notes.
3. Read Outlook Email for recent prospect replies before deciding follow-up
   work. Update stages, notes, next follow-up dates, and reply summaries only
   when the inbox evidence supports the change.
   Log each confirmed prospect reply in `outreach_activities` with
   `activity_type = 'other'`, `outcome = 'Outlook reply'`, the received date as
   `occurred_on`, the matching `prospect_id` when known, and notes containing
   sender, subject, Outlook message id, and a concise reply excerpt.
4. Capture company, market, website, decision-maker path, contact path,
   software clues, pain signals, source, and uncertainty in the dashboard.
5. Prepare approved cold emails, follow-ups, call notes, Loom audit outlines,
   workflow breakdowns, proposal skeletons, and landing-page improvements.
   Routine cold-email and follow-up approval rows may be created with
   `approved` status so the founder can still reject or stop unwanted sends
   during the day.
   For approved scheduled cold-email campaigns, maintain enough approved rows
   to reach the user-approved daily send target when eligible enriched
   prospects exist. An empty approved queue before the daily cap is not a
   stopping condition; restock from existing send-ready dashboard/local queue
   records first, without Apollo, then send through the approved sender.
6. Keep sprint tasks current when the strategy or workspace evidence supports
   a change.
7. Review dashboard metrics, due follow-ups, and the 10-business-day learning
   rule from the plan.

## Approval-Gated Work

Ask the founder before any of these happen:

1. Spend more than the current 5-credit Apollo enrichment batch.
2. Place phone calls, send LinkedIn messages, or contact partners.
3. Publish content or post under the EMC2Ops name.
4. Change booking-calendar settings or commit to meeting availability.
5. Send proposals, pricing, commitments, or delivery promises externally.
6. Send replies from Outlook Email.

If an outbound channel becomes explicitly authorized later, record the scope of
that authorization before using it.

For routine cold emails and follow-ups, dashboard rows may now be created with
`approved` status by default. A dashboard row with `approved` status is founder
authorization to send through the configured approved-email sender. Leave
rejected, failed, or manually paused rows unsent until they are reviewed again.

## Human-Only Handoffs

Reach out when the work needs founder judgment, access, or presence. Common
handoffs are recording the workflow demo or Loom audit, taking a sales call,
approving final outreach language, providing proof assets, and deciding whether
an offer or ICP change is warranted.

## Recurring Loop

Each run should:

1. Read the strategy, dashboard snapshot, and recent workspace changes.
2. Check Outlook Email for replies from active prospects and update the
   dashboard from confirmed inbox evidence.
   New reply evidence should appear on the dashboard's Outlook replies panel via
   the `outreach_activities` logging format above.
3. Use Apollo for the next 5-credit prospect enrichment batch when the pipeline
   needs more qualified leads.
4. Pick the highest-value autonomous task that moves the current week forward.
5. Prefer evidence-rich Apollo enrichment, reply handling, and useful approved
   outreach over busywork.
6. Update the dashboard only for facts and work that can be proven.
7. Report completed autonomous work, Apollo credits used, replies found,
   approved outreach queued, human blockers, and the next likely action.

## Strategy Guardrails

- Keep the ICP narrow: residential property managers with roughly 100-2,000
  doors and a visible leasing lead-response path.
- Keep the offer narrow: missed-call text-back, qualification, routing, and CRM
  or team notification installed in seven days.
- Measure outbound touches, replies, calls booked, calls held, proposals, deals,
  and days from first touch to call.
- Do not present demo metrics, illustrative proof, or researched assumptions as
  client results.

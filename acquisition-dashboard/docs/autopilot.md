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

1. Research public property-management prospects that match the ICP.
2. Capture company, market, website, decision-maker path, public contact path,
   software clues, pain signals, source, and uncertainty in the dashboard.
3. Prepare draft cold emails, follow-ups, call notes, Loom audit outlines,
   workflow breakdowns, proposal skeletons, and landing-page improvements.
   Queue email copy in the dashboard approval list when it is ready for review.
4. Keep sprint tasks current when the strategy or workspace evidence supports
   a change.
5. Review dashboard metrics, due follow-ups, and the 10-business-day learning
   rule from the plan.

## Approval-Gated Work

Ask the founder before any of these happen:

1. Send cold email or follow-up email.
2. Place phone calls, send LinkedIn messages, or contact partners.
3. Publish content or post under the EMC2Ops name.
4. Change booking-calendar settings or commit to meeting availability.
5. Send proposals, pricing, commitments, or delivery promises externally.

If an outbound channel becomes explicitly authorized later, record the scope of
that authorization before using it.

For Office 365 approval sending, a dashboard row with `approved` status is the
founder approval. Send only those approved rows through `office365_mail.py` and
leave draft, failed, or rejected rows unsent until they are reviewed again.

## Human-Only Handoffs

Reach out when the work needs founder judgment, access, or presence. Common
handoffs are recording the workflow demo or Loom audit, taking a sales call,
approving final outreach language, providing proof assets, and deciding whether
an offer or ICP change is warranted.

## Recurring Loop

Each run should:

1. Read the strategy, dashboard snapshot, and recent workspace changes.
2. Pick the highest-value autonomous task that moves the current week forward.
3. Prefer evidence-rich prospect research and useful drafts over busywork.
4. Update the dashboard only for facts and work that can be proven.
5. Report completed autonomous work, ready-for-approval items, human blockers,
   and the next likely action.

## Strategy Guardrails

- Keep the ICP narrow: residential property managers with roughly 100-2,000
  doors and a visible leasing lead-response path.
- Keep the offer narrow: missed-call text-back, qualification, routing, and CRM
  or team notification installed in seven days.
- Measure outbound touches, replies, calls booked, calls held, proposals, deals,
  and days from first touch to call.
- Do not present demo metrics, illustrative proof, or researched assumptions as
  client results.

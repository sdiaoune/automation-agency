# Prospect follow-ups - 2026-06-16

Autopilot focus: Outlook reply check, dashboard follow-up triage, and Week 4
non-responder re-engagement preparation.

## Outlook reply check

Recent Outlook Email was reviewed before dashboard work.

- No new confirmed inbound prospect reply was found in the latest mailbox page.
- The newest prospect-related messages were outbound EMC2Ops follow-ups sent on
  2026-06-15.
- The already-known JRealty out-of-office and EquityTeam delivery-failure
  messages remain the latest inbound prospect-adjacent evidence visible in the
  recent page.

Dashboard action: no `outreach_activities` Outlook-reply row was inserted
because there was no new confirmed prospect reply.

## Dashboard state reviewed

Live dashboard check-in on 2026-06-16 showed:

- 86 outbound touches.
- 0 booked calls, 0 qualified calls, 0 proposals, and 0 paying clients.
- Pipeline: 35 contacted and 30 prospecting.
- 35 due follow-ups before this pass.
- Email approval queue: 1 draft, 0 approved, 0 failed.

The remaining draft is the Apollo-sourced Cove Property Management cold email.
It was left untouched because Apollo-related prospect work requires a fresh,
specific approval before action.

## Due follow-up triage

The overdue follow-up queue is mostly Apollo-sourced:

- Apollo-sourced due records: 34 of 35.
- Public-evidence due record: Scarlett Properties.
- Scarlett Properties has no email stored on the prospect row, but prior
  dashboard approval/sent history identified `Leasing@ScarlettProperties.com`
  as the established recipient.

## Approved Office 365 send

One routine public-evidence follow-up row was created with `approved` status and
sent through the configured Office 365 approved-email sender.

| Prospect | Approval ID | Recipient | Result |
| --- | --- | --- | --- |
| Scarlett Properties | `f2036864-5526-4317-b8c3-ce3919879c05` | `Leasing@ScarlettProperties.com` | Sent on 2026-06-16; Office 365 sender reported `1 sent, 0 failed`. |

Dashboard action: Scarlett Properties stayed in `contacted`; notes were updated
with the Office 365 send evidence and the next reply-monitoring checkpoint was
set to 2026-06-23.

No Apollo searches, enrichment, exports, list actions, record updates, sequence
actions, or Apollo-sourced dashboard writes were performed.

## Outlook auto-reply bookkeeping

A later Outlook check found a Scarlett Properties auto-reply to the approved
Office 365 follow-up sent earlier on 2026-06-16.

| Prospect | Activity ID | Received | Result |
| --- | --- | --- | --- |
| Scarlett Properties | `ed54c614-5977-48ce-93a6-17b9260fac9b` | 2026-06-16 16:04 UTC | Logged as `activity_type = other`, `outcome = Outlook reply`; auto-receipt only, no positive human intent. |

Dashboard action: appended the Outlook evidence to Scarlett Properties notes,
kept the stage as `contacted`, and kept the next reply-monitoring checkpoint at
2026-06-23. Current dashboard counts after this bookkeeping: 87 outbound
touches, today activity `follow_up_email: 1` and `other: 1`, and 34 due
follow-ups remaining.

## Week 4 re-engagement copy bank

Use this only for prospects where the dashboard has non-Apollo contact evidence
or after the founder explicitly approves the specific Apollo action needed for
Apollo-sourced records.

### Final follow-up

Subject: close the loop?

Hi {{first_name}},

Closing the loop here.

The narrow workflow I was asking about is missed leasing call recovery:
immediate text-back, a few qualification questions, and a clean summary routed
to the right inbox, CRM, or leasing teammate.

If this is not a priority right now, no problem. If it is on your radar, I can
send a short written teardown of where I would start for {{company}}.

Diaoune
EMC2Ops

### Referral ask

Subject: right person for leasing follow-up?

Hi {{first_name}},

Quick question before I close this out: is there someone else at {{company}} who
owns leasing response, missed calls, or process improvement?

I am focused on one workflow for property managers: missed call -> text-back ->
qualification -> showing request or team summary.

If there is a better owner for that conversation, I would appreciate the nudge.

Diaoune
EMC2Ops

### Two-minute teardown offer

Subject: quick teardown for {{company}}

Hi {{first_name}},

I can keep this lightweight: I will map the public renter inquiry path for
{{company}} and show where a missed-call text-back workflow would fit.

The output would be a short written teardown, not a broad AI pitch.

Useful, or should I close the loop?

Diaoune
EMC2Ops

## Next likely action

Ask the founder whether to approve a specific Apollo action for the overdue
Apollo-sourced follow-up queue. A practical next approval would be: prepare and
queue up to 10 routine follow-up approval rows for already-contacted,
Apollo-sourced prospects using existing dashboard records only, with no new
Apollo search, enrichment, export, or credit spend.

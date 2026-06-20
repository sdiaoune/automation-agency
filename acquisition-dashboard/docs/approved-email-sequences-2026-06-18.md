# Approved EMC2Ops Email Sequences - 2026-06-18

These sequences are founder-approved for the configured approved-email sender.
Do not use Apollo, LinkedIn, phone, proposals, pricing, calendar changes, or
delivery commitments while running them.

Before sending any due touch, check Outlook Email for replies, bounces, and
opt-outs. Skip rejected, failed, manually paused, blank-email, bounced,
opted-out, replied, won, lost, or not-send-ready records.

## Safe Sending Rules

- All three cohorts become eligible to start on 2026-06-18, but sends must be
  paced instead of blasted.
- Do not send more than 1 email in one automation run. The automation should
  wake on a schedule for pacing instead of using a long sleep loop.
- Do not send more than 30 total cold emails per calendar day from the mailbox.
- The daily target is 30 approved cold/follow-up sends when there are enough
  eligible prospects. If the approved queue is empty before the daily cap is
  reached, the automation must restock approved rows from already-enriched,
  send-ready dashboard prospects before reporting quiet status.
- Use
  `/Users/diaoune/automation-agency/acquisition-dashboard/scripts/restock_approved_email_queue.py --target-total 30`
  for queue restocking. This script does not use Apollo; it only reads existing
  dashboard records and local enriched queue files. It skips prospects already
  sent, queued, contacted, replied, won, lost, bounced, opted out, or marked
  do-not-send.
- Never restock with Apollo searches, Apollo enrichment, Apollo exports, or
  Apollo writes unless the user explicitly approves that specific Apollo action.
- Runs are scheduled about 10 minutes apart during the sending window, which
  gives spacing without keeping a live process awake all day.
- Rotate the greeting/opening token across eligible prospects. Acceptable
  variants:
  - `Hi {{first_name}},`
  - `Hey {{first_name}},`
  - `Hello {{first_name}},`
  - `{{first_name}},`
  - `Good morning {{first_name}},`
- Do not use the same greeting variant more than twice in a row.
- Keep the rest of the approved copy intact except for normal personalization,
  greeting rotation, and small whitespace differences.
- Prefer spreading first touches across the 9:00 AM-4:00 PM America/New_York
  window.
- If the sender has already sent 30 approved cold emails that day, stop and
  leave the rest for the next run.
- If a prospect replies with remove-me, unsubscribe, not interested, stop, or
  similar language, mark the prospect lost/opted out and never send them again.

## Cohort 1: Missed Calls Recovery

- Audience:
  `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-candidates-2026-06-18/emc2ops-apollo-enrichment-candidates-2026-06-18.xlsx`
  or `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-candidates-2026-06-18/candidates.json`
- Send only the 32 email-ready prospects.
- Day 0: 2026-06-18
- Follow-up dates: 2026-06-20, 2026-06-23, 2026-06-27, 2026-07-02
- Subject: `missed calls`

### Day 0

Hi {{first_name}},

I noticed {{company}} has active leasing paths where renters can reach the team by phone, listings, portals, or online inquiries.

Quick question: when a leasing call is missed after hours or while your team is tied up, does the renter get an immediate text-back and a clear next step?

I build a narrow missed-call recovery workflow for property managers: instant SMS reply, a few fit/timing questions, and a clean handoff to the right inbox or system.

Worth seeing where this would fit for {{company}}?

Diaoune
EMC2Ops

### Follow-Up 1

Hi {{first_name}},

The reason I asked is that missed leasing calls usually are not a huge tech problem. They are a small handoff problem.

The first workflow I would map is:

missed call -> text-back -> timing/property fit -> routed showing request or team summary

Would a short written teardown of that flow be useful?

### Follow-Up 2

Hi {{first_name}},

One thing I see with property management teams is that response speed matters most before the lead is in the system.

If a renter calls and no one answers, the team may never know whether that was a serious showing request, wrong-fit tenant question, or something that should have gone to maintenance.

That is the gap I would look at first for {{company}}.

Should I send the quick teardown?

### Follow-Up 3

Hi {{first_name}},

To be clear, I am not suggesting a broad AI chatbot.

The useful version is much narrower: catch missed leasing calls, ask a few practical questions, and send your team a usable summary before the lead goes cold.

If {{company}} already has this covered, no worries. If not, I can outline the first version I would install.

### Follow-Up 4

Hi {{first_name}},

I will close the loop here.

Is missed-call follow-up something you own, or is there someone else at {{company}} who handles leasing response and process improvement?

Either way, happy to send the short teardown if useful.

Diaoune

## Cohort 2: Speed-to-Lead Response

- Audience:
  `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/speed-to-lead-send-queue-2026-06-22.json`
- Day 0: 2026-06-18
- Follow-up dates: 2026-06-20, 2026-06-23, 2026-06-27, 2026-07-02
- Subject: `response time`

### Day 0

Hi {{first_name}},

I noticed {{company}} has renter-facing leasing paths where speed matters: phone, listings, portals, or online inquiries.

Quick question: when a renter calls and no one can answer, how quickly do they get a useful next step?

I help property managers tighten that first response window: missed call -> instant text-back -> a few fit/timing questions -> routed summary for the team.

Worth seeing where the slowest handoff might be for {{company}}?

Diaoune
EMC2Ops

### Follow-Up 1

Hi {{first_name}},

The reason I asked is that speed-to-lead usually breaks before the lead is cleanly in the system.

The first workflow I would map is:

missed call or inquiry -> instant reply -> fit/timing questions -> routed summary for the leasing team

Would a short written teardown of that handoff be useful?

### Follow-Up 2

Hi {{first_name}},

A small delay can make a good leasing lead look like a no-show.

If the renter calls while the team is busy, after hours, or between showings, the useful question is whether they still get a clear next step before they move on.

That is the first response window I would look at for {{company}}.

Should I send the quick teardown?

### Follow-Up 3

Hi {{first_name}},

To be clear, I am not suggesting a broad AI chatbot.

The useful version is narrower: catch the missed call or slow inquiry, ask a few practical questions, and give the team a usable summary while the renter is still warm.

If {{company}} already has this covered, no worries. If not, I can outline the first version I would install.

### Follow-Up 4

Hi {{first_name}},

I will close the loop here.

Is first-response speed something you own, or is there someone else at {{company}} who handles leasing response and process improvement?

Either way, happy to send the short teardown if useful.

Diaoune

## Cohort 3: Revenue Recovery from Lost Leads

- Audience:
  `/Users/diaoune/automation-agency/outputs/emc2ops-apollo-wave2-2026-06-18/revenue-recovery-send-queue-2026-06-23.json`
- Day 0: 2026-06-18
- Follow-up dates: 2026-06-20, 2026-06-23, 2026-06-27, 2026-07-02
- Subject: `lost leads`

### Day 0

Hi {{first_name}},

I noticed {{company}} has renter-facing leasing paths where missed calls or slow follow-up can quietly turn into lost showing opportunities.

Quick question: do you have a clean way to see which leasing inquiries disappear before the team can respond?

I build a narrow recovery workflow for property managers: missed call -> instant text-back -> qualification -> routed showing request or team summary.

The point is not more software. It is recovering the leads that would otherwise go cold.

Worth a quick teardown for {{company}}?

Diaoune
EMC2Ops

### Follow-Up 1

Hi {{first_name}},

The reason I asked is that lost leasing revenue often hides in small handoffs.

The workflow I would check first is:

missed call or stale inquiry -> fast text-back -> fit/timing questions -> routed next step

Would a short written teardown of that recovery flow be useful?

### Follow-Up 2

Hi {{first_name}},

A missed leasing call is easy to write off as "they will call back."

The issue is that renters usually keep moving. If the next property responds first, the lead loss may never show up as a clear metric.

That is the revenue leak I would look for first at {{company}}.

Should I send the quick teardown?

### Follow-Up 3

Hi {{first_name}},

To be clear, I am not suggesting a broad AI rollout.

The useful version is narrow: catch the missed or stale lead, get the basic context, and route a useful summary before the opportunity disappears.

If {{company}} already has this covered, no worries. If not, I can outline the first version I would install.

### Follow-Up 4

Hi {{first_name}},

I will close the loop here.

Is leasing lead recovery something you own, or is there someone else at {{company}} who handles leasing operations and vacancy reduction?

Either way, happy to send the short teardown if useful.

Diaoune

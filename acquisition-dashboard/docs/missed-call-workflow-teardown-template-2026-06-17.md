# Missed-call workflow teardown template - 2026-06-17

Use this as the founder-ready written asset behind the Week 4 "quick teardown"
offer. It is meant to be customized for one property-management company after
reviewing that company's public renter inquiry paths. Do not send it externally
without founder approval.

## Subject options

- Quick missed-call teardown for {{company}}
- Where missed leasing calls may leak at {{company}}
- First workflow I would map for {{company}}

## Email body

Hi {{first_name}},

Here is the short teardown I mentioned. I kept it narrow: this is not a broad AI
pitch, just the first leasing-response workflow I would map for {{company}}.

From the public renter path, I see these inquiry routes:

- Phone: {{phone_signal}}
- Rentals/listings: {{rental_listing_signal}}
- Showing or application path: {{showing_application_signal}}
- Portal or team handoff: {{portal_or_team_signal}}

The gap I would test first is what happens when a leasing call is missed after
hours, during a showing, or while the team is tied up. If the caller has to
leave voicemail or retry later, the lead can go cold before anyone knows the
property, timing, budget, or next step.

The first workflow I would install is:

1. Missed leasing call is detected on the main leasing line.
2. The caller gets an immediate SMS acknowledgement.
3. The text asks 2-4 qualifying questions: target property, move timing,
   bedroom count or budget, and whether they want a showing or callback.
4. Qualified showing intent is routed to the right team inbox, CRM, or property
   manager with a concise summary.
5. Non-fit or maintenance/resident messages are routed away from leasing so
   they do not clutter the pipeline.
6. The team gets a daily summary of missed calls, replies, booked next steps,
   and stale leads that need attention.

The value is speed and context. Your team does not need to change the whole
leasing system first; the first version should recover missed calls and create a
clean handoff before the next business day.

If useful, the 15-minute audit would map:

- which phone number or inbox should trigger the workflow,
- what questions should be asked before routing,
- where the summary should land,
- what the team should review before the workflow goes live,
- and how to measure recovered calls, replies, and showing requests.

Diaoune
EMC2Ops

## Customization checklist

- Replace every `{{...}}` field with evidence from the prospect website,
  dashboard notes, or a confirmed inbox thread.
- Remove any route that is not visible from public research.
- Do not imply client results. Use "would test," "would map," and "first
  workflow" unless there is confirmed delivery evidence.
- If the prospect is Apollo-sourced, get explicit approval before preparing or
  queuing a dashboard email row tied to that record.
- If the prospect replied with human interest, log the Outlook reply before
  using this asset as a next step.

## Audit notes block

Use this block internally before turning the teardown into an email.

| Field | Notes |
| --- | --- |
| Company | {{company}} |
| Prospect id | {{prospect_id}} |
| Source allowed? | Public evidence / explicit Apollo approval / other |
| Renter phone path | {{phone_signal}} |
| Rental listing path | {{rental_listing_signal}} |
| Showing/application path | {{showing_application_signal}} |
| Handoff system clue | {{portal_or_team_signal}} |
| Main missed-call risk | {{risk}} |
| Suggested first workflow | Missed call -> SMS -> qualification -> routed summary |
| Next approved action | Queue follow-up / send after approval / founder review |

# Prospect Follow-Ups - 2026-06-08

Autopilot focus: Week 3 stale follow-up cleanup and approval-queue preparation.
No outreach was sent. The dashboard had no approved Office 365 email rows, so
`office365_mail.py send-approved` was not run.

## Dashboard state before work

- Outbound touches: 39.
- Booked calls: 0.
- Qualified calls: 0.
- Proposals: 0.
- Paying clients: 0.
- Due follow-ups: 16 contacted prospects dated 2026-06-05.

## Approval-queue drafts created

Sixteen follow-up drafts were queued as `follow_up_email` rows with `draft`
status for founder review. Each linked prospect was left in `contacted` and had
its next review checkpoint moved to 2026-06-11.

| Prospect | Approval ID | Recipient | Evidence basis |
| --- | --- | --- | --- |
| Acora Asset Management | `fa8b76c1-d8a9-4fe9-b31f-9338ba6d75e1` | `Office@AcoraAM.com` | Public Phoenix rental inventory, AppFolio branding, owner/resident portals. |
| Compass Property Management Group | `05037c8c-44e6-4f5e-8d86-202f70af41a9` | `manager@compassrent.com` | Public Greater Atlanta PM site, Propertyware owner/tenant logins, available-rentals path, named operations team. |
| EquityTeam Property Management | `6cdf1db8-0536-4087-99a6-e0d846c4f246` | `alyson.l@equityteam.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| Gatekeeper Property Management | `51205fb2-ca62-4a65-877d-336b29fc578a` | `office@gatekeeperproperties.com` | Public residential PM site, active homes, owner consultation CTAs, internal systems language. |
| JRealty Property Management | `1f21b174-496b-42ce-be62-53e533df2fa5` | `dylan@jrealty.org` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| MAXX Property Management | `bbba6582-0b2a-4054-acc5-3f97491f5886` | `alexis@maxxpm.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| Martin Property Management | `9fa92538-4e96-4067-b957-56753586e364` | `rebecca.mills@martinpropertymanagement.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| McMath Realty | `0c43e766-0f2c-444d-8414-181152bb3eb1` | `Tyler@McMathRealty.com` | Public Maricopa residential management site, named managers, PropertyBoss/Rently clues. |
| Mosaic Property Management | `d38f2b10-fc10-4a88-bdd0-cd8ed3747cd9` | `nicole@mosaicpropertiesaz.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| Moxie Real Estate | `2b6f5d3f-0b5d-4eae-bc6e-18637857e67d` | `hello@moxieproperties.com` | Public Phoenix rental/SMS/email contact paths, Buildium/portal and 24/7 repair signals. |
| PMI Atlanta OTP | `08975d34-4dc6-4693-99e4-25e7c4207266` | `info@pmiatlantaotp.com` | Public Atlanta residential PM site, Rentvine portals, named owner, live homes-for-rent flow. |
| Pilot Property Management | `6527e8fa-aafe-48de-a8af-d0e5ab6bf908` | `blake@pilotnw.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| Real Property Management Pros | `6b66d68b-0e49-48f1-b670-2973cd3ae84a` | `chugh@managementpros.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| SMG Property Management | `2ad1a586-4342-462a-af7b-f93686ce4eb3` | `jane@smgpm.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| SYLO Property Management | `f3923fef-4dd7-46cd-ad76-6352f5444313` | `mchasteen@sylopm.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |
| TrueDoor Property Management | `504b1382-8ebb-482b-92d2-f92d16418224` | `bryson@truedoorpm.com` | Dashboard Apollo import with verified leasing-manager email; public-page enrichment still needed. |

## Sources used

- `docs/prospect-research-2026-05-23.md`
- `docs/prospect-research-2026-05-24.md`
- `docs/prospect-follow-ups-2026-06-03.md`
- Dashboard prospect notes from the 2026-05-29 Apollo qualified PM import.

## Result

The dashboard now shows no overdue follow-ups as of 2026-06-08. The approval
queue contains 23 draft rows and 0 approved rows. Draft rows still require
founder review; only rows moved to `approved` are authorized for Office 365
sending.

# Apollo enrichment - 2026-06-18

Founder approval: user replied "proceed" after the required Apollo confirmation
for a 40-person enrichment scope. The local dashboard had 40 enrichment
candidates, not 50.

## Apollo calls

| Batch | Requested | Matched | Credits | Request ID |
| --- | ---: | ---: | ---: | --- |
| 1 | 10 | 10 | 10 | `8397356581056662142` |
| 2 | 10 | 5 | 5 | `-9007654305489511091` |
| 2 retry | 5 | 5 | 5 | `-3360540669966749697` |
| 3 | 10 | 10 | 10 | `6952848508693103942` |
| 4 | 10 | 10 | 10 | `8676612482949966891` |

Total Apollo credits used: 40.

No Apollo searches, exports, list creation, sequence actions, or Apollo record
updates were performed. This run only used people bulk enrichment for the
approved dashboard-list scope.

## Dashboard records updated

The dashboard was updated only where the returned match was visible and
high-confidence enough to write back safely.

| Company | Enriched contact | Email |
| --- | --- | --- |
| Morgan Property Management | Angele O'Reilly, Managing Broker | `angele@morganpm.com` |
| Innovative Property Solutions | Tonya Ramsey, Director of Property Management | `tramsey@ips-nc.com` |
| Dennis Property Management | Lori Hendrix, Director of Property Management | `lori@dennisrealty.com` |
| ABS Property Management | Sandra Lee, Managing Broker/Owner | `sandra@absproperty.net` |
| Synergistic Property Management, LLC | Maria D'Amico, Managing Broker / Property Manager | `mariaelena@synergisticpropertymgmt.com` |
| Five Bridges Real Estate Services Company | Patricia Womack, Managing Broker - Director of Property Management | `patti@womackrealty.net` |
| New View Realty Group | Sara Escobar, Director of Property Management | `sara@newviewrg.com` |
| First Class Realty & Property Management | Ally Papandrew, Founder | `allison@fcpmnc.com` |
| Alarca Property Management | Pamela Greene, Operations Manager | `pamela@pgmanagementgroup.com` |
| Shuford Property Management | Nick Shuford, owner and broker | `nick@theshufordgroup.com` |

Each updated prospect note now includes Apollo provenance, the 2026-06-18
enrichment date, and the relevant request ID.

## Records not overwritten

Several matched records were already enriched/contacted in the dashboard, so no
new dashboard mutation was needed. Terminus Residential returned a noisy Art Lieb
match whose primary current organization was not Terminus and whose email was
unavailable, so Terminus was left unchanged. Other records whose useful details
were not visible enough in the tool output were also left unchanged rather than
polluting the dashboard.

## Next likely action

Prepare routine approved cold-email rows for the newly email-ready prospects,
starting with the clearest fit and preserving Apollo provenance in the email
approval notes/body context. Do not send proposals, publish content, place
calls, add Apollo sequence enrollments, or perform any additional Apollo action
without separate authorization.

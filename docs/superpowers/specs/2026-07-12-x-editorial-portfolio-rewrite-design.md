# EMC2Ops X Editorial Portfolio Rewrite Design

## Goal

Replace the 264 unpublished standard X posts with a high-quality editorial portfolio that earns attention through useful property-management operating insight. The account should sound like a sharp operator: practical, opinionated, conversational, and minimally promotional.

The rewrite must improve originality and engagement without changing the approved three-posts-per-day schedule. Blog and news-cycle promotional posts remain separate and do not count toward this standard-post cadence.

## Current-State Findings

The live queue contains 300 rows:

- 33 posted
- 3 skipped
- 264 ready to schedule

The unpublished copy is overly repetitive:

- 238 of 264 posts are promotional or company-centered.
- “our AI” appears in 137 posts.
- “we build” appears in 93 posts.
- No posts end with a genuine question.
- No posts use numbered hooks, multiline structures, or meaningful format variation.

The publisher is currently paused because the enrolled X developer account has no posting credits. It must remain paused throughout the rewrite.

## Editorial Approach

Use an editorial-portfolio approach instead of rewriting each existing sentence in place. The portfolio will cover distinct operating topics, rotate formats deliberately, and limit promotion to a small number of context-specific posts.

### Topic allocation

| Pillar | Posts |
| --- | ---: |
| Leasing response and conversion | 48 |
| Maintenance and resident operations | 36 |
| Workflow design and handoffs | 42 |
| Owner and vendor coordination | 30 |
| CRM/PMS data discipline | 30 |
| Team capacity and human escalation | 24 |
| Operational metrics and economics | 24 |
| Contrarian takes and industry myths | 30 |
| **Total** | **264** |

### Intent allocation

| Intent | Posts | Share |
| --- | ---: | ---: |
| Pure operational insight, no CTA | 211 | 79.9% |
| Genuine conversation prompt | 40 | 15.2% |
| Soft, context-specific promotion | 13 | 4.9% |
| **Total** | **264** | **100%** |

The 40 conversation posts must invite relevant operator experience or judgment. Empty engagement bait such as “Thoughts?” does not qualify. The 13 promotional posts must use distinct transitions and invitations; no demo, DM, or workflow-audit CTA may become a repeated template.

## Format System

Rotate among these standalone X formats:

- Sharp one-line observation
- Contrarian take
- Diagnostic question
- Micro-checklist
- Before-and-after contrast
- Workflow teardown
- Rule of thumb
- If/then operating rule
- Short scenario
- Myth and reframe
- Mini-framework
- Cost or bottleneck lens

No thread dependency is allowed because each queue row is published as an independent post. Posts may use line breaks when they materially improve readability.

## Daily Sequencing

Each three-post day follows a loose editorial rhythm:

1. Morning: sharp observation or contrarian take.
2. Midday: practical framework, checklist, or workflow lesson.
3. Evening: scenario, diagnostic question, or conversation prompt.

This is a role system, not a rigid sentence template. Adjacent posts may not share the same pillar or format, including across day boundaries.

## Voice Rules

The approved voice is a sharp operator voice:

- Plainspoken, concise, and credible.
- Focused on the operation before the technology.
- Willing to state a clear point of view without manufacturing controversy.
- Specific about triggers, handoffs, queues, ownership, escalation, and measurement.
- Conversational without sounding casual about resident or business risk.

The copy must not include:

- Fabricated personal stories, customer stories, quotations, or outcomes.
- Unsupported statistics or performance claims.
- Hashtags, emojis, generic motivational language, or breathless AI hype.
- Legal, fair-housing, compliance, or financial advice.
- Hostile, political, or engagement-bait framing.
- Claims of integrations, product capabilities, or customer results that are not established in the workspace context.

AI should appear only when it adds meaning. Most posts should discuss the operating problem, decision, or workflow directly.

## Originality Requirements

The complete 300-row history, including posted and skipped rows, is the comparison set.

For automated checks, normalize text by lowercasing it, removing punctuation, and collapsing whitespace. Define the opening as the first sentence or the first 12 normalized tokens, whichever is shorter. Flag a pair for editorial review when its non-stopword token cosine similarity is at least 0.78 or its normalized bigram-set Jaccard similarity is at least 0.55.

- All 264 rewritten tweets must be unique after normalization.
- All 264 opening clauses must be unique after normalization.
- No rewritten tweet may be a close paraphrase of another rewritten, posted, or skipped tweet.
- No adjacent rows may share a pillar or format.
- “our AI” may appear no more than three times.
- “we build” may appear no more than three times.
- Other repeated multiword phrases must be reviewed and reduced when they indicate templating rather than necessary industry terminology.
- The 13 promotional posts must have distinct invitations and distinct lead-ins.

Also report every trigram used in more than four ready posts and every bigram used in more than 12 ready posts. Similarity and phrase-frequency checks are review signals, not substitutes for editorial judgment. Every flagged pair must be manually reviewed and one post rewritten when the pair expresses substantially the same idea in substantially the same shape.

## Queue Data Changes

Only rows whose status is `ready_to_schedule` may receive new copy. Preserve, byte-for-byte at the field level where applicable:

- `tweet_number`
- `scheduled_at_eastern`
- `scheduled_at_utc`
- `status`
- `tweet_id`
- Existing attempt and error history
- All posted and skipped rows

Add the following editorial metadata to each rewritten ready row:

- `content_pillar`
- `content_format`
- `content_intent`
- `editorial_version`

Use one consistent editorial version identifier for this rewrite. The scheduler ignores these additional fields and continues to publish the `text` field.

Regenerate the CSV mirror after the JSON update. The CSV remains limited to its existing scheduler-facing columns unless the publisher’s CSV schema is intentionally expanded in a separate change.

## Implementation Workflow

1. Save a backup of the current live JSON and CSV outside the repository working files.
2. Confirm the X LaunchAgent is still unloaded and no scheduler lock exists.
3. Build a 264-row editorial manifest with exact pillar, format, and intent allocations.
4. Write original copy against the manifest in manageable batches.
5. Review every batch for credibility, natural rhythm, topic overlap, and CTA repetition.
6. Run full-history uniqueness, phrase-frequency, similarity, length, and sequencing checks. Adjacency is evaluated in scheduled order across the ready rows.
7. Replace only the ready-row text and add editorial metadata.
8. Regenerate the CSV mirror atomically.
9. Run final data-integrity and dry-run verification without publishing. If any row is due by then, point the dry run at temporary schedule and CSV copies so the live queue's attempt history cannot change.

## Verification

Completion requires fresh evidence for all of the following:

- JSON parses successfully and still contains exactly 300 rows.
- Status counts remain 33 posted, 3 skipped, and 264 ready to schedule.
- All non-ready rows are unchanged.
- Ready-row tweet numbers, schedules, statuses, IDs, and operational history are unchanged.
- Every ready tweet is 280 characters or fewer.
- The pillar allocation exactly matches the approved table.
- The intent allocation is exactly 211 insight, 40 conversation, and 13 soft promotion.
- Every ready row has valid pillar, format, intent, and editorial-version metadata.
- No adjacent ready rows share a pillar or format.
- Exact and normalized duplicate counts are zero.
- All opening clauses are unique after normalization.
- “our AI” and “we build” each appear no more than three times.
- Similarity flags have been manually resolved.
- The CSV is an exact scheduler-facing mirror of the JSON.
- A scheduler dry run reports no due post and makes no network request.
- The X LaunchAgent remains unloaded.
- Blog and news-cycle automation definitions remain unchanged.

## Success Criteria

The queue should read like 264 distinct observations from one credible operating perspective—not 264 variants of a product pitch. A property-management operator should encounter useful ideas, recognizable workflow problems, defensible opinions, and occasional genuine invitations to respond. EMC2Ops should become more memorable because of the quality of its thinking, not the frequency of its CTA.

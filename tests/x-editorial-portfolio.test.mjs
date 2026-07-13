import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeText,
  openingKey,
  cosineSimilarity,
  bigramJaccard,
  validateBatch,
  validatePortfolio,
  applyPortfolio,
  renderCsv,
} from "../scripts/x-editorial-portfolio.mjs";

test("normalization and opening keys ignore punctuation and case", () => {
  assert.equal(normalizeText("Fast follow-up, clean handoff."), "fast follow up clean handoff");
  assert.equal(openingKey("A clean queue wins. The rest is noise."), "a clean queue wins");
});

test("similarity metrics flag close editorial variants", () => {
  const a = "A leasing lead without an owner is already going stale";
  const b = "A leasing inquiry without a clear owner is already becoming stale";
  assert.ok(cosineSimilarity(a, b) >= 0.78 || bigramJaccard(a, b) >= 0.55);
});

test("batch validation rejects repeated shape and long copy", () => {
  const batch = {
    batch: 1,
    rows: [
      {
        tweet_number: 37,
        text: "Same opening. One.",
        content_pillar: "Leasing response and conversion",
        content_format: "Sharp one-line observation",
        content_intent: "insight",
      },
      {
        tweet_number: 38,
        text: `Same opening. ${"x".repeat(300)}`,
        content_pillar: "Leasing response and conversion",
        content_format: "Sharp one-line observation",
        content_intent: "conversation",
      },
    ],
  };

  const errors = validateBatch(batch, {
    first: 37,
    last: 38,
    count: 2,
    pillars: {},
    intents: {},
  });

  assert.ok(errors.some((value) => value.includes("opening")));
  assert.ok(errors.some((value) => value.includes("adjacent pillar")));
  assert.ok(errors.some((value) => value.includes("adjacent format")));
  assert.ok(errors.some((value) => value.includes("280")));
});

test("portfolio validation compares candidates with posted history", () => {
  const history = [
    {
      tweet_number: 1,
      status: "posted",
      text: "Voicemail is not a leasing strategy.",
    },
  ];
  const candidates = [
    {
      tweet_number: 37,
      text: "Voicemail is not a leasing strategy.",
      content_pillar: "Contrarian takes and industry myths",
      content_format: "Contrarian take",
      content_intent: "insight",
    },
  ];

  assert.ok(
    validatePortfolio(history, candidates).errors.some((value) => value.includes("duplicate")),
  );
});

test("application preserves operational fields", () => {
  const schedule = {
    rows: [
      { tweet_number: 1, status: "posted", text: "Keep me" },
      {
        tweet_number: 37,
        status: "ready_to_schedule",
        text: "Replace me",
        attempts: 4,
      },
    ],
  };
  const candidates = [
    {
      tweet_number: 37,
      text: "A queue needs an owner, not another reminder.",
      content_pillar: "Workflow design and handoffs",
      content_format: "Sharp one-line observation",
      content_intent: "insight",
    },
  ];

  const applied = applyPortfolio(schedule, candidates, "x-editorial-v1-2026-07-12");

  assert.deepEqual(applied.rows[0], schedule.rows[0]);
  assert.equal(applied.rows[1].attempts, 4);
  assert.equal(applied.rows[1].text, candidates[0].text);
  assert.equal(applied.rows[1].editorial_version, "x-editorial-v1-2026-07-12");
  assert.equal(schedule.rows[1].text, "Replace me");
});

test("application rejects candidates targeting completed rows", () => {
  const schedule = {
    rows: [{ tweet_number: 1, status: "posted", text: "Keep me" }],
  };
  const candidates = [
    {
      tweet_number: 1,
      text: "Do not apply me",
      content_pillar: "Workflow design and handoffs",
      content_format: "Sharp one-line observation",
      content_intent: "insight",
    },
  ];

  assert.throws(
    () => applyPortfolio(schedule, candidates, "x-editorial-v1-2026-07-12"),
    /ready_to_schedule/,
  );
});

test("CSV renderer preserves the six-column scheduler schema", () => {
  const csv = renderCsv([
    {
      tweet_number: 37,
      scheduled_at_eastern: "2026-07-13T08:55:00-04:00",
      scheduled_at_utc: "2026-07-13T12:55:00.000Z",
      status: "ready_to_schedule",
      tweet_id: "",
      text: "Useful, specific copy.",
    },
  ]);

  assert.match(
    csv,
    /^tweet_number,scheduled_at_eastern,scheduled_at_utc,status,tweet_id,text\n/,
  );
  assert.match(csv, /"Useful, specific copy\."/);
});

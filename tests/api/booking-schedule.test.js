const assert = require("node:assert/strict");
const test = require("node:test");

const { generateSlots, findAvailableSlot, MIN_LEAD_BUSINESS_DAYS } = require("../../server/booking-schedule");

test("starts availability two business days out from a weekday", () => {
  const slots = generateSlots({ now: new Date("2026-06-26T14:00:00.000Z") });

  assert.equal(MIN_LEAD_BUSINESS_DAYS, 2);
  assert.ok(slots.length > 0);
  assert.equal(slots[0].day, "Tuesday, June 30");
  assert.equal(slots[0].timeLabel, "5:00 PM EDT - 5:15 PM");
  assert.ok(slots.every((slot) => !["Friday, June 26", "Saturday, June 27", "Sunday, June 28", "Monday, June 29"].includes(slot.day)));
});

test("skips weekends when calculating the two-business-day lead time", () => {
  const slots = generateSlots({ now: new Date("2026-06-27T14:00:00.000Z") });

  assert.ok(slots.length > 0);
  assert.equal(slots[0].day, "Tuesday, June 30");
  assert.ok(slots.every((slot) => !["Saturday, June 27", "Sunday, June 28", "Monday, June 29"].includes(slot.day)));
});

test("rejects manually posted slots inside the lead-time buffer", () => {
  const now = new Date("2026-06-27T14:00:00.000Z");
  const tooSoon = "2026-06-28T14:00:00.000Z";

  assert.equal(findAvailableSlot(tooSoon, [], now), null);
});

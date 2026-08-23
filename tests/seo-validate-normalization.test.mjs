import test from "node:test";
import assert from "node:assert/strict";
import { normalizeInternalHref } from "../scripts/lib/normalize-internal-href.mjs";

test("normalizes attributed internal booking links to their generated pathname", () => {
  assert.equal(
    normalizeInternalHref("/book-demo/?workflow=leasing-follow-up&amp;source=service"),
    "/book-demo/",
  );
});

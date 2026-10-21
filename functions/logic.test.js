const test = require("node:test");
const assert = require("node:assert/strict");
const { METHOD_CATALOG, dateKey, dayOffset, weekStartKey, nextStreak } = require("./logic");

test("catalog accepts all built-in methods", () => {
  assert.equal(Object.keys(METHOD_CATALOG).length, 23);
  assert.equal(METHOD_CATALOG["scene-hook"].category, "remember");
});

test("Taipei date helpers cross week and month boundaries", () => {
  assert.equal(dateKey(new Date("2026-10-21T16:30:00Z")), "2026-10-22");
  assert.equal(dayOffset("2026-11-01", -1), "2026-10-31");
  assert.equal(weekStartKey("2026-10-22"), "2026-10-19");
});

test("streak stays stable on the same day and increments on consecutive days", () => {
  assert.equal(nextStreak("2026-10-22", 4, "2026-10-22"), 4);
  assert.equal(nextStreak("2026-10-21", 4, "2026-10-22"), 5);
  assert.equal(nextStreak("2026-10-20", 4, "2026-10-22"), 1);
});

import test from "node:test";
import assert from "node:assert/strict";
import { collectPages } from "../src/lib/server/pagination.ts";

test("persistence reads include the 1001st ordered record and version", async () => {
  const records = Array.from({ length: 1001 }, (_, i) => ({
    id: i,
    body: `Synthetic ${i}`,
  }));
  const ranges = [];
  const result = await collectPages(async (start, end) => {
    ranges.push([start, end]);
    return records.slice(start, end + 1);
  });
  assert.deepEqual(result, records);
  assert.deepEqual(ranges, [
    [0, 499],
    [500, 999],
    [1000, 1499],
  ]);
});
test("persistence pagination handles empty/exact boundaries and never returns partial success on a failed page", async () => {
  assert.deepEqual(await collectPages(async () => []), []);
  const records = Array.from({ length: 500 }, (_, i) => i);
  let reads = 0;
  assert.deepEqual(
    await collectPages(async (start, end) => {
      reads++;
      return records.slice(start, end + 1);
    }),
    records,
  );
  assert.equal(reads, 2);
  await assert.rejects(
    collectPages(async (start) => {
      if (start > 0) throw new Error("Unavailable");
      return records;
    }),
    /Unavailable/,
  );
  await assert.rejects(
    collectPages(async () => [], 1000),
    /Invalid page size/,
  );
});

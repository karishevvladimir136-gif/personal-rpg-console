import assert from "node:assert/strict";
import test from "node:test";
import { moduleFromSource } from "./d1-qa-fixture.mjs";

const { memoryFixture, memoryRow, event, request, addRow, id } =
  await moduleFromSource("tests/d1-runtime-fixtures.mjs");
const { buildLabMemoryBatch, retrieveLabMemory } = await moduleFromSource(
  "src/lib/world-lab/memory.ts",
);

test("D1 QA private/future/unknown flood cannot crowd out positive Actor evidence before a one-excerpt limit", () => {
  const f = memoryFixture();
  const observed = event(f.raw, { text: "The harbor gate is open." });
  const good = memoryRow(f, observed);
  const query = request(f, {
    query: "harbor gate",
    maxExcerpts: 1,
    maxBytes: 1000,
  });
  const before = retrieveLabMemory(f.state(), query);
  assert.equal(before.paused, false);
  assert.deepEqual(
    before.sources.map((row) => row.id),
    [good.payload.id],
  );
  for (let index = 0; index < 50; index++) {
    const unknown = event(f.raw, {
      text: `QA_UNKNOWN_${index} harbor gate`,
      actorIds: [f.actor],
    });
    memoryRow(f, unknown, {
      known_by: [],
      authority: "correction",
      significance: 99,
    });
    const future = event(f.raw, {
      text: `QA_FUTURE_${index} harbor gate`,
      worldMinutes: 100,
    });
    memoryRow(f, future, { authority: "correction", significance: 99 });
    const hidden = event(f.raw, {
      text: `QA_PRIVATE_${index} harbor gate`,
      visibility: "private",
    });
    memoryRow(
      f,
      hidden,
      { kind: "private_event", significance: 99 },
      "private",
    );
  }
  addRow(f.raw, "rpg_private.memory_aliases", {
    campaign_id: f.raw.campaignId,
    entity_id: f.enemy,
    alias: "QA_PRIVATE_ALIAS",
  });
  const state = f.state();
  const batch = buildLabMemoryBatch(state, query);
  assert.deepEqual(
    batch.sources.map((row) => row.id),
    [good.payload.id],
  );
  assert.deepEqual(batch.aliases, []);
  assert.deepEqual(retrieveLabMemory(state, query), before);
  assert.doesNotMatch(
    JSON.stringify(retrieveLabMemory(state, query)),
    /QA_UNKNOWN|QA_FUTURE|QA_PRIVATE/,
  );
});

test("D1 QA hidden required evidence and stale canonical basis pause with neutral bounded results", () => {
  const f = memoryFixture();
  const hidden = event(f.raw, {
    text: "QA_PRIVATE_REQUIRED_FACT",
    actorIds: [f.actor],
  });
  const row = memoryRow(f, hidden, { known_by: [] });
  const query = request(f, {
    query: "QA_PRIVATE_REQUIRED_FACT",
    requiredSourceIds: [row.payload.id],
  });
  const missing = retrieveLabMemory(f.state(), query);
  assert.equal(missing.paused, true);
  assert.equal(missing.reason, "missing");
  assert.deepEqual(missing.sources, []);
  assert.doesNotMatch(JSON.stringify(missing), /QA_PRIVATE|source_id|known_by/);
  row.payload.known_by = [f.actor];
  assert.equal(retrieveLabMemory(f.state(), query).paused, false);
  f.raw.canonGeneration++;
  const stale = retrieveLabMemory(f.state(), query);
  assert.equal(stale.paused, true);
  assert.deepEqual(stale.sources, []);
  assert.equal(stale.bytes, 2);
  assert.doesNotMatch(JSON.stringify(stale), /QA_PRIVATE/);
  for (const actorIds of [[], [id()]]) {
    const result = retrieveLabMemory(f.state(), { ...query, actorIds });
    assert.equal(result.paused, true);
    assert.deepEqual(result.sources, []);
  }
});

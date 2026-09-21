import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildLabWorldInput,
  prepareLabStep,
  validateLabDetachedState,
} from "../src/lib/world-lab/runtime.ts";
import {
  buildLabMemoryBatch,
  retrieveLabMemory,
} from "../src/lib/world-lab/memory.ts";
import { stageWorldTransition } from "../src/lib/world/stage.ts";
import { buildDetachedWorldCommit } from "../src/lib/world-lab/writer.ts";
import { createDetachedRunFence } from "../src/lib/saves/detached-fence.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import {
  fixture,
  memoryFixture,
  attachSource,
  memoryRow,
  request,
  event,
  addRow,
  id,
  worldId,
} from "./d1-runtime-fixtures.mjs";

test("D1 detached World adapter uses exact rows and a private compatibility sentinel without live state", () => {
  const f = fixture(),
    state = f.state(),
    before = structuredClone(state),
    operationId = id();
  const input = buildLabWorldInput(state, operationId, 20);
  assert.deepEqual(
    input.source.snapshot.entities,
    state.records["public.rpg_entities"],
  );
  assert.deepEqual(
    input.source.snapshot.locations,
    state.records["public.rpg_locations"],
  );
  assert.deepEqual(input.source.runtime.configuration, f.runtime.configuration);
  assert.equal(input.source.historyComplete, false);
  assert.deepEqual(input.source.privateState, {});
  assert.deepEqual(input.snapshot.timeline, {
    timelineId: state.run.timelineId,
    epoch: 1,
  });
  assert.equal(input.snapshot.headId, state.manifest.id);
  assert.equal(input.snapshot.worldMinutes, 0);
  assert.equal(stageWorldTransition(input).status, "staged");
  const commit = buildDetachedWorldCommit({
    state,
    fence: createDetachedRunFence(state.run),
    operationId,
    throughWorldMinutes: 20,
    worldInput: input,
  });
  assert.equal(commit.kind, "deterministic_world");
  assert.equal(commit.fence.kind, "detached");
  assert.equal(Object.hasOwn(commit.fence, "epoch"), false);
  assert.deepEqual(state, before);
});

test("D1 explicit continuation is finite, respects the horizon and preserves Wave4 state", () => {
  const f = fixture(),
    before = structuredClone(f.raw),
    operationId = id();
  let result = prepareLabStep(f.state(), operationId);
  assert.equal(result.status, "commit");
  assert.equal(result.modelRequests, 0);
  assert.equal(result.commit.throughWorldMinutes, 60);
  const worldWrite = result.commit.writes.find(
    (row) => row.tableName === "rpg_private.world_foundations",
  );
  assert.deepEqual(worldWrite.payload.loop_state, f.foundation.loop_state);
  assert.equal(worldWrite.payload.world.threads[0].status, "resolved");
  assert.equal(
    result.commit.writes.filter(
      (row) => row.tableName === "rpg_private.world_events",
    ).length,
    2,
  );
  assert.deepEqual(f.raw, before);
  f.raw.run.input.throughWorldMinutes = 12;
  result = prepareLabStep(f.state(), id());
  assert.equal(result.status, "commit");
  assert.equal(result.commit.throughWorldMinutes, 12);
});

test("D1 unchanged-time no-op makes no writes; advancing an idle world requires explicit continuation", () => {
  const f = fixture(),
    state = f.state();
  const input = buildLabWorldInput(state, id());
  assert.equal(input.trigger, "none");
  assert.equal(input.resolution.worldMinutes, 0);
  assert.deepEqual(stageWorldTransition(input), {
    status: "noop",
    modelRequests: 0,
  });
  const commit = buildDetachedWorldCommit({
    state,
    fence: createDetachedRunFence(state.run),
    operationId: input.command.operationId,
    throughWorldMinutes: 0,
    worldInput: input,
  });
  assert.equal(commit.kind, "noop");
  assert.deepEqual(commit.writes, []);
  f.world.policy.simulation = false;
  const requested = prepareLabStep(f.state(), id());
  assert.equal(requested.status, "commit");
  assert.deepEqual(
    requested.commit.writes.map((row) => row.tableName),
    ["rpg_private.runtime_state"],
  );
  f.runtime.world_minutes = 120;
  f.raw.run.currentWorldMinutes = 120;
  f.raw.manifest.publicMetadata.worldMinutes = 120;
  const ended = prepareLabStep(f.state(), id());
  assert.equal(ended.status, "noop");
  assert.deepEqual(ended.commit.writes, []);
});

test("D1 unsupported consequences, resolver, PC agency and fair-warning requirements pause without partial commit", () => {
  for (const modify of [
    (f) => {
      f.world.threads[0].steps[0].resolution = "resolver_required";
    },
    (f) => {
      f.world.threads[0].decisionActorIds = [f.actor];
    },
    (f) => {
      f.world.threads[0].steps[0].consequence = "surface_before_complete";
    },
  ]) {
    const f = fixture();
    modify(f);
    const before = structuredClone(f.raw);
    assert.deepEqual(prepareLabStep(f.state(), id()), {
      status: "paused",
      reason: "review_required",
      modelRequests: 0,
    });
    assert.deepEqual(f.raw, before);
  }
  const f = fixture();
  f.world.threads[0].steps[0].resolution = "resolver_required";
  f.world.threads[0].steps[0].consequences = [
    { kind: "resource.spend", actorId: f.enemy, resource: "focus", amount: 1 },
  ];
  assert.deepEqual(prepareLabStep(f.state(), id()), {
    status: "paused",
    reason: "unsupported",
    modelRequests: 0,
  });
});

test("D1 pins evidence, respects actor knowledge and pauses future or restricted source work", () => {
  const f = fixture(),
    pin = attachSource(f);
  f.world.threads[0].steps[0].evidence = [pin.evidence];
  assert.deepEqual(prepareLabStep(f.state(), id()), {
    status: "paused",
    reason: "review_required",
    modelRequests: 0,
  });
  f.world.actors.find((actor) => actor.id === f.enemy).knowledge = [
    pin.evidence,
  ];
  assert.equal(prepareLabStep(f.state(), id()).status, "commit");
  pin.source.body.knowledge = "future_source";
  assert.equal(prepareLabStep(f.state(), id()).status, "paused");
  delete pin.source.body.knowledge;
  f.raw.restrictions.push({
    campaign_id: f.raw.campaignId,
    kind: "source",
    source_id: pin.source.id,
  });
  assert.equal(prepareLabStep(f.state(), id()).status, "paused");
});

test("D1 work budgets pause the entire finite proposal", () => {
  const f = fixture();
  const second = structuredClone(f.world.threads[0]);
  second.id = id();
  second.steps[0].id = id();
  f.world.threads.push(second);
  f.raw.run.input.resolutionPolicy.maxSteps = 1;
  assert.deepEqual(prepareLabStep(f.state(), id()), {
    status: "paused",
    reason: "work_limit",
    modelRequests: 0,
  });
});

test("D1 stale basis, active projection injection, pending work and out-of-horizon time cannot reach a write", () => {
  const f = fixture(),
    state = f.state();
  const drift = structuredClone(state);
  drift.records["public.rpg_entities"][0].hp = 999;
  assert.throws(() => validateLabDetachedState(drift), { code: "conflict" });
  assert.equal(prepareLabStep(drift, id()).status, "paused");
  for (const through of [-1, 61, 121, Infinity])
    assert.throws(() => buildLabWorldInput(state, id(), through));
  assert.throws(() => buildLabWorldInput(state, id(), 1, "none"));
  const oldHead = structuredClone(state);
  oldHead.run.headManifestId = id();
  assert.equal(prepareLabStep(oldHead, id()).status, "paused");
  f.raw.canonGeneration++;
  assert.deepEqual(prepareLabStep(f.state(), id()), {
    status: "paused",
    reason: "source_changed",
    modelRequests: 0,
  });
  f.raw.canonGeneration--;
  addRow(f.raw, "rpg_private.turns", {
    id: id(),
    campaign_id: f.raw.campaignId,
    owner_id: f.raw.ownerId,
    status: "pending",
    retryable: false,
  });
  assert.equal(prepareLabStep(f.state(), id()).status, "paused");
});

test("D1 independent branch proposals retain own head/timeline and never change siblings", () => {
  const a = fixture(),
    b = fixture(),
    before = structuredClone(b.raw);
  const left = prepareLabStep(a.state(), id()),
    right = prepareLabStep(b.state(), id());
  assert.equal(left.status, "commit");
  assert.equal(right.status, "commit");
  assert.notEqual(left.commit.fence.timelineId, right.commit.fence.timelineId);
  assert.notEqual(left.commit.fence.manifestId, right.commit.fence.manifestId);
  assert.deepEqual(b.raw, before);
  const detached = left.worldInput;
  detached.source.snapshot.entities[0].hp = 999;
  assert.notEqual(a.state().records["public.rpg_entities"][0].hp, 999);
});

test("D1 Memory requires positive knowledge and filters private/future/sibling candidates before ranking/limits", () => {
  const f = memoryFixture();
  const goodEvent = event(f.raw, { text: "The harbor gate opened." });
  const good = memoryRow(f, goodEvent);
  const unknownEvent = event(f.raw, {
    text: "PRIVATE_UNKNOWN",
    actorIds: [f.actor],
  });
  memoryRow(f, unknownEvent, {
    known_by: [],
    significance: 99,
    authority: "correction",
  });
  const future = event(f.raw, { text: "FUTURE_EVENT", worldMinutes: 30 });
  memoryRow(f, future, { significance: 99 });
  const secret = event(f.raw, { text: "PRIVATE_EVENT", visibility: "private" });
  memoryRow(f, secret, { kind: "private_event" }, "private");
  const foreign = memoryRow(f, goodEvent, {
    source_id: id(),
    text: "SIBLING_FUTURE",
    significance: 99,
  });
  assert.ok(foreign);
  const state = f.state(),
    batch = buildLabMemoryBatch(state, request(f, { maxExcerpts: 1 }));
  assert.deepEqual(
    batch.sources.map((source) => source.id),
    [good.payload.id],
  );
  const result = retrieveLabMemory(state, request(f, { maxExcerpts: 1 }));
  assert.equal(result.paused, false);
  assert.deepEqual(
    result.sources.map((source) => source.text),
    ["The harbor gate opened."],
  );
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_|FUTURE_|SIBLING_/);
  const privateResult = retrieveLabMemory(
    state,
    request(f, { visibility: "private", query: "PRIVATE_EVENT" }),
  );
  assert.deepEqual(
    privateResult.sources.map((source) => source.text),
    ["PRIVATE_EVENT"],
  );
});

test("D1 Memory rejects empty/unknown actor scopes and never treats involvement as knowing", () => {
  const f = memoryFixture(),
    observed = event(f.raw, { actorIds: [f.actor] });
  memoryRow(f, observed, { known_by: [] });
  assert.deepEqual(buildLabMemoryBatch(f.state(), request(f)).sources, []);
  for (const actorIds of [[], [id()]]) {
    const result = retrieveLabMemory(f.state(), request(f, { actorIds }));
    assert.equal(result.paused, true);
    assert.deepEqual(result.sources, []);
  }
});

test("D1 Memory validates exact transitive refs and cannot launder hidden evidence through a summary", () => {
  const f = memoryFixture(),
    pin = attachSource(f, { knowledge: "future_source" });
  const childEvent = event(f.raw, {
    text: "FUTURE_CHILD",
    evidence: [{ ...pin.evidence, knowledge: "future_source" }],
  });
  const child = memoryRow(f, childEvent);
  const summaryId = id();
  addRow(f.raw, "public.rpg_memory_summaries", {
    id: summaryId,
    campaign_id: f.raw.campaignId,
    schema_version: 1,
    valid: true,
  });
  memoryRow(f, childEvent, {
    kind: "summary",
    source_id: summaryId,
    text: "LEAKED_DERIVATIVE",
    authority: "derived",
    source_refs: [
      {
        campaignId: f.raw.campaignId,
        kind: "event",
        id: child.payload.source_id,
        version: "1",
        part: 0,
        visibility: "public",
      },
    ],
  });
  assert.deepEqual(buildLabMemoryBatch(f.state(), request(f)).sources, []);
  assert.doesNotMatch(
    JSON.stringify(
      retrieveLabMemory(f.state(), request(f, { query: "LEAKED_DERIVATIVE" })),
    ),
    /LEAKED_DERIVATIVE/,
  );
  delete pin.source.body.knowledge;
  childEvent.payload.event.evidence = [pin.evidence];
  const validBatch = buildLabMemoryBatch(f.state(), request(f));
  assert.equal(validBatch.sources.length, 2);
  f.raw.restrictions.push({
    campaign_id: f.raw.campaignId,
    kind: "event",
    source_id: childEvent.payload.id,
  });
  assert.deepEqual(buildLabMemoryBatch(f.state(), request(f)).sources, []);
});

test("D1 Memory immutable source provenance and source title remain separate from character context", () => {
  const f = memoryFixture(),
    pin = attachSource(f, { title: "PRIVATE_SOURCE_TITLE" });
  const observed = event(f.raw, {
    text: "The harbor gate opened.",
    evidence: [pin.evidence],
  });
  memoryRow(f, observed);
  assert.equal(retrieveLabMemory(f.state(), request(f)).sources.length, 1);
  pin.source.body.visibility = "private";
  assert.deepEqual(buildLabMemoryBatch(f.state(), request(f)).sources, []);
  pin.source.body.visibility = "public";
  f.raw.restrictions.push({
    campaign_id: f.raw.campaignId,
    kind: "source",
    source_id: pin.source.id,
  });
  assert.deepEqual(buildLabMemoryBatch(f.state(), request(f)).sources, []);
  assert.doesNotMatch(
    JSON.stringify(retrieveLabMemory(f.state(), request(f))),
    /PRIVATE_SOURCE_TITLE/,
  );
});

test("D1 Memory retains accepted text-span evidence and existing required-source budget behavior", () => {
  const f = memoryFixture(),
    pin = attachSource(f, {
      extraction: { version: "text-evidence-v1", status: "complete", gaps: [] },
    });
  const span = {
    ...pin.evidence,
    locator: { kind: "text", value: "0:6" },
    digest: sha256(pin.source.body.original.text.slice(0, 6)),
  };
  const observed = event(f.raw, {
    text: "The harbor gate opened.",
    evidence: [span],
  });
  const row = memoryRow(f, observed);
  const result = retrieveLabMemory(
    f.state(),
    request(f, { requiredSourceIds: [row.payload.id] }),
  );
  assert.equal(result.paused, false);
  assert.equal(result.sources[0].id, row.payload.id);
  const budget = retrieveLabMemory(
    f.state(),
    request(f, { requiredSourceIds: [row.payload.id], maxBytes: 2 }),
  );
  assert.equal(budget.paused, true);
  assert.equal(budget.reason, "budget");
  row.payload.known_by = [];
  const missing = retrieveLabMemory(
    f.state(),
    request(f, { requiredSourceIds: [row.payload.id] }),
  );
  assert.equal(missing.paused, true);
  assert.equal(missing.reason, "missing");
});

test("D1 Memory alias expansion needs positively known exact entity evidence", () => {
  const f = memoryFixture(),
    entity = f.raw.versions.find(
      (v) =>
        v.tableName === "public.rpg_entities" &&
        v.payload.id === worldId("enemy"),
    ).payload;
  addRow(f.raw, "rpg_private.memory_aliases", {
    campaign_id: f.raw.campaignId,
    entity_id: entity.id,
    alias: "PRIVATE_ALIAS",
  });
  const observed = event(f.raw, { actorIds: [entity.id] });
  memoryRow(f, observed, { entity_ids: [entity.id] });
  assert.deepEqual(buildLabMemoryBatch(f.state(), request(f)).aliases, []);
  memoryRow(f, observed, {
    kind: "entity",
    source_id: entity.id,
    version: String(entity.revision),
    text: `${entity.name}: ${entity.details}`,
    entity_ids: [entity.id],
  });
  const batch = buildLabMemoryBatch(f.state(), request(f));
  assert.equal(batch.aliases.length, 1);
  assert.equal(batch.aliases[0].entityId, entity.id);
});

test("D1 Memory retains exact indexed paragraphs without dropping negation or duplicating full event text", () => {
  const f = memoryFixture();
  const first = "The harbor gate did not open.";
  const second = "The keeper heard a rumor about the harbor bridge.";
  const observed = event(f.raw, { text: `${first}\n\n${second}` });
  const a = memoryRow(f, observed, { part: 0, text: first });
  const b = memoryRow(f, observed, { part: 1, text: second });
  const batch = buildLabMemoryBatch(f.state(), request(f));
  assert.deepEqual(
    batch.sources.map((source) => source.text),
    [first, second],
  );
  assert.deepEqual(
    batch.sources.map((source) => source.id),
    [a.payload.id, b.payload.id],
  );
  assert.deepEqual(
    batch.sources.map((source) => source.ref.part),
    [0, 1],
  );
  a.payload.text = "open.";
  assert.deepEqual(
    buildLabMemoryBatch(f.state(), request(f)).sources.map(
      (source) => source.text,
    ),
    [second],
  );
});

test("D1 Memory stale canon and current restrictions invalidate history without active-source fallback", () => {
  const f = memoryFixture(),
    observed = event(f.raw),
    row = memoryRow(f, observed);
  f.raw.canonGeneration++;
  const result = retrieveLabMemory(
    f.state(),
    request(f, { requiredSourceIds: [row.payload.id] }),
  );
  assert.equal(result.paused, true);
  assert.deepEqual(result.sources, []);
  f.raw.canonGeneration--;
  f.raw.run.reason = "source_changed";
  assert.equal(retrieveLabMemory(f.state(), request(f)).paused, true);
});

test("D1 runtime and Memory adapters make zero network/provider calls and import no active stores", async (t) => {
  t.mock.method(globalThis, "fetch", () =>
    assert.fail("No detached provider or active reads"),
  );
  const f = fixture();
  assert.equal(prepareLabStep(f.state(), id()).status, "commit");
  const m = memoryFixture(),
    e = event(m.raw);
  memoryRow(m, e);
  assert.equal(retrieveLabMemory(m.state(), request(m)).paused, false);
  for (const name of ["runtime", "memory"]) {
    const code = await readFile(
      new URL(`../src/lib/world-lab/${name}.ts`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      code,
      /(?:createRpc(?:Memory|Turn|Save)Store|fetch\(|process\.env|setInterval\(|\.from\()/,
    );
  }
});

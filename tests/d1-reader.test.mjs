import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DETACHED_TABLES_V1,
  DETACHED_TABLES_V2,
  readDetachedState,
  detachedRows,
  detachedLoopState,
  validateDetachedRun,
} from "../src/lib/saves/detached-reader.ts";
import {
  projectLabRun,
  projectLabCheckpoint,
  detachedReadEnvelope,
} from "../src/lib/world-lab/projection.ts";
import {
  fixture,
  runFixture,
  addRow,
  event,
  knowledge,
  scope,
  id,
} from "./d1-reader-fixtures.mjs";

const invalid = (call) => assert.throws(call, { code: "validation" });
test("D1 inventories exactly preserve accepted schema 1 and schema 2 SQL tables", async () => {
  const sql = await readFile(
    new URL(
      "../supabase/migrations/202609190008_phase35_timelines.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const inventory = sql.match(
    /create function rpg_private\.timeline_tables\(\)[\s\S]*?select array\[([\s\S]*?)\]::text\[\]/,
  )[1];
  assert.deepEqual(
    DETACHED_TABLES_V1,
    [...inventory.matchAll(/'([^']+)'/g)].map((match) => match[1]),
  );
  assert.equal(DETACHED_TABLES_V1.length, 35);
  assert.equal(DETACHED_TABLES_V2.length, 40);
  assert.deepEqual(DETACHED_TABLES_V2.slice(0, 35), DETACHED_TABLES_V1);
  for (const version of [1, 2]) {
    const raw = fixture(version),
      state = readDetachedState(raw, scope(raw));
    assert.equal(state.manifest.schemaVersion, version);
    assert.deepEqual(state.manifest, raw.manifest);
    assert.deepEqual(detachedRows(state, "rpg_private.world_events"), []);
    assert.equal(detachedLoopState(state), null);
  }
});

test("D1 manifest rejects missing, unknown and cross-version families without changing historical schemas", () => {
  for (const version of [1, 2, 3]) {
    const original = version === 3 ? runFixture().read : fixture(version);
    for (const mutate of [
      (r) => {
        delete r.manifest.refs["public.rpg_settings"];
      },
      (r) => {
        r.manifest.refs["rpg_private.unapproved"] = [];
      },
      (r) => {
        r.manifest.schemaVersion = 4;
      },
      (r) => {
        r.manifest.refs["public.rpg_settings"] = null;
      },
    ]) {
      const raw = structuredClone(original);
      mutate(raw);
      invalid(() => readDetachedState(raw, scope(raw)));
    }
  }
  const old = fixture(1);
  old.manifest.refs["rpg_private.world_foundations"] = [];
  invalid(() => readDetachedState(old, scope(old)));
  const newer = fixture(2);
  delete newer.manifest.refs["rpg_private.world_foundations"];
  invalid(() => readDetachedState(newer, scope(newer)));
});

test("D1 exact row membership rejects duplicate references, omitted, extra and foreign rows", () => {
  const raw = fixture();
  addRow(raw, "public.rpg_entities", {
    id: id(),
    campaign_id: raw.campaignId,
    name: "Inherited actor",
  });
  const mutations = [
    (r) => r.versions.pop(),
    (r) => r.versions.push(structuredClone(r.versions[0])),
    (r) => r.manifest.refs["rpg_private.runtime_state"].push(r.versions[0].id),
    (r) => r.manifest.refs["public.rpg_scenes"].push(r.versions[0].id),
    (r) => {
      r.versions[1].id = id();
    },
    (r) => {
      r.versions[1].campaignId = id();
    },
    (r) => {
      r.versions[1].tableName = "public.rpg_items";
    },
    (r) => {
      r.versions[1].payload.campaign_id = id();
    },
    (r) => {
      r.versions[1].payload.owner_id = id();
    },
    (r) => {
      r.versions[1].rowKey = id();
    },
    (r) => {
      r.versions[1].digest = "corrupt";
    },
  ];
  for (const mutate of mutations) {
    const bad = structuredClone(raw);
    mutate(bad);
    invalid(() => readDetachedState(bad, scope(bad)));
  }
  const duplicateKey = structuredClone(raw);
  addRow(
    duplicateKey,
    "public.rpg_entities",
    structuredClone(raw.versions[1].payload),
  );
  invalid(() => readDetachedState(duplicateKey, scope(duplicateKey)));
});

test("D1 ancestry follows exact manifest membership, never row origin or RPC order", () => {
  const raw = fixture();
  const inherited = addRow(
    raw,
    "public.rpg_entities",
    { id: id(), campaign_id: raw.campaignId, name: "Inherited" },
    { originTimelineId: id() },
  );
  const later = addRow(raw, "public.rpg_entities", {
    id: id(),
    campaign_id: raw.campaignId,
    name: "Later",
  });
  raw.versions.reverse();
  const state = readDetachedState(raw, scope(raw));
  assert.deepEqual(
    state.records["public.rpg_entities"].map((row) => row.name),
    ["Inherited", "Later"],
  );
  assert.equal(
    state.versions.find((row) => row.id === inherited.id).originTimelineId,
    inherited.originTimelineId,
  );
  raw.manifest.refs["public.rpg_entities"].pop();
  invalid(() => readDetachedState(raw, scope(raw)));
  assert.ok(later.id);
});

test("D1 alias/restriction composite row keys and singleton keys are checked", () => {
  const raw = fixture();
  const alias = addRow(raw, "rpg_private.memory_aliases", {
    campaign_id: raw.campaignId,
    entity_id: id(),
    alias: "Mara:keeper",
  });
  const restriction = {
    campaign_id: raw.campaignId,
    kind: "event",
    source_id: id(),
  };
  addRow(raw, "rpg_private.memory_restrictions", restriction);
  raw.restrictions.push(restriction);
  assert.ok(readDetachedState(raw, scope(raw)));
  alias.rowKey = alias.payload.entity_id;
  invalid(() => readDetachedState(raw, scope(raw)));
  const wrongSingleton = fixture();
  wrongSingleton.versions[0].payload.id = wrongSingleton.campaignId;
  invalid(() => readDetachedState(wrongSingleton, scope(wrongSingleton)));
});

test("D1 owner, campaign, selected manifest/timeline and schema3 run binding fail closed", () => {
  const raw = fixture();
  for (const fields of [
    { ownerId: id() },
    { campaignId: id() },
    { manifestId: id() },
    { timelineId: id() },
    { runId: id() },
  ])
    invalid(() => readDetachedState(raw, { ...scope(raw), ...fields }));
  const original = runFixture().read;
  for (const mutate of [
    (r) => {
      r.manifest.runId = id();
    },
    (r) => {
      r.manifest.timelineId = id();
    },
    (r) => {
      r.run = null;
    },
    (r) => {
      r.manifest.canonGeneration--;
    },
    (r) => {
      r.run.input.campaignId = id();
    },
    (r) => {
      r.run.input.purpose = "playable";
    },
    (r) => {
      r.run.input.nonCanon = false;
    },
    (r) => {
      r.run.input.sourceHeads[0].versionId = id();
    },
    (r) => {
      r.run.inputDigest = "not-a-digest";
    },
    (r) => {
      r.run.currentWorldMinutes = 61;
    },
  ]) {
    const bad = structuredClone(original);
    mutate(bad);
    invalid(() => readDetachedState(bad, scope(bad)));
  }
  const old = fixture(1);
  old.run = original.run;
  invalid(() => readDetachedState(old, scope(old)));
});

test("D1 private envelopes reject malformed JSON and unexpected top-level authority", () => {
  const raw = fixture();
  for (const mutate of [
    (r) => {
      r.activeProjection = {};
    },
    (r) => {
      r.manifest.publicMetadata.value = Infinity;
    },
    (r) => {
      r.manifest.publicMetadata.value = new Date();
    },
    (r) => {
      r.manifest.publicMetadata.value = undefined;
    },
    (r) => {
      r.manifest.publicMetadata.self = r;
    },
  ]) {
    const bad = structuredClone(raw);
    mutate(bad);
    invalid(() => readDetachedState(bad, scope(bad)));
  }
});

test("D1 verifies digest envelopes without claiming JS serialization authenticates SQL jsonb", () => {
  const raw = fixture();
  raw.versions[0].digest = "0".repeat(64);
  assert.ok(readDetachedState(raw, scope(raw)));
  // The SQL vault RPC authenticates this digest; TS intentionally has no hash guess.
  raw.versions[0].digest = "0".repeat(63);
  invalid(() => readDetachedState(raw, scope(raw)));
});

test("D1 preserves Wave4 loop_state exactly and absent old-v2 loop state stays absent", () => {
  const raw = fixture();
  const foundation = addRow(raw, "rpg_private.world_foundations", {
    campaign_id: raw.campaignId,
    revision: 1,
    world: null,
    bindings: [],
    ruleset: { id: "console-basic-v1", version: 1 },
    execution_policy: null,
  });
  assert.equal(
    Object.hasOwn(
      readDetachedState(raw, scope(raw)).records[
        "rpg_private.world_foundations"
      ][0],
      "loop_state",
    ),
    false,
  );
  foundation.payload.loop_state = {
    schemaVersion: 1,
    version: 3,
    profile: { id: "console-basic-v1", version: 1 },
    progression: "on",
    currencies: [],
    itemPolicies: [],
    merchants: [],
    tracks: [],
    rewards: [{ privateMarker: "PRIVATE_REWARD" }],
    progress: [],
    pending: [],
    preparations: [],
  };
  const before = structuredClone(raw),
    state = readDetachedState(raw, scope(raw));
  assert.deepEqual(
    state.records["rpg_private.world_foundations"][0].loop_state,
    foundation.payload.loop_state,
  );
  const loop = detachedLoopState(state);
  loop.rewards.length = 0;
  assert.equal(
    state.records["rpg_private.world_foundations"][0].loop_state.rewards.length,
    1,
  );
  assert.deepEqual(raw, before);
});

test("D1 exact pinned Library and document membership rejects missing/extra/foreign rows", () => {
  const { read } = runFixture();
  const document = {
    id: id(),
    campaign_id: read.campaignId,
    document_id: id(),
    version: 1,
    title: "PRIVATE_DOCUMENT_TITLE",
    status: "reference",
    body: "PRIVATE_DOCUMENT_BODY",
    restored_from: null,
    created_at: "2026-09-20T00:00:00Z",
  };
  read.documentVersions = [document];
  read.run.input.documentVersions = [
    {
      documentId: document.document_id,
      versionId: document.id,
      digest: "c".repeat(64),
    },
  ];
  assert.ok(readDetachedState(read, scope(read)));
  for (const mutate of [
    (r) => r.libraryRecords.pop(),
    (r) => r.libraryRecords.push(structuredClone(r.libraryRecords[0])),
    (r) => {
      r.libraryRecords[0].ownerId = id();
    },
    (r) => {
      r.libraryRecords[0].versionId = id();
    },
    (r) => r.documentVersions.pop(),
    (r) => r.documentVersions.push(structuredClone(r.documentVersions[0])),
    (r) => {
      r.documentVersions[0].campaign_id = id();
    },
    (r) => {
      r.documentVersions[0].document_id = id();
    },
  ]) {
    const bad = structuredClone(read);
    mutate(bad);
    invalid(() => readDetachedState(bad, scope(bad)));
  }
});

test("D1 current restrictions must contain saved restrictions and stay campaign-scoped", () => {
  const read = fixture();
  const saved = {
    campaign_id: read.campaignId,
    kind: "event",
    source_id: id(),
  };
  addRow(read, "rpg_private.memory_restrictions", saved);
  invalid(() => readDetachedState(read, scope(read)));
  read.restrictions = [saved];
  assert.ok(readDetachedState(read, scope(read)));
  read.restrictions.push(structuredClone(saved));
  invalid(() => readDetachedState(read, scope(read)));
  read.restrictions = [{ ...saved, campaign_id: id() }];
  invalid(() => readDetachedState(read, scope(read)));
});

test("D1 owner public history hides private/future observations, source IDs, titles and raw authority", () => {
  const f = runFixture(),
    { read, options } = f;
  const good = event(read, { evidence: [f.evidence] });
  event(read, { visibility: "private", text: "PRIVATE_EVENT" });
  event(read, { worldMinutes: 20, text: "FUTURE_EVENT" });
  event(read, {
    evidence: [{ ...f.evidence, knowledge: "source" }],
    text: "SOURCE_EVENT",
  });
  event(read, {
    evidence: [{ ...f.evidence, knowledge: "future_source" }],
    text: "FUTURE_SOURCE_EVENT",
  });
  event(read, {
    evidence: [{ ...f.evidence, visibility: "private" }],
    text: "PRIVATE_EVIDENCE_EVENT",
  });
  event(read, {
    evidence: [{ ...f.evidence, sourceVersionId: id() }],
    text: "FOREIGN_SOURCE_EVENT",
  });
  const dto = projectLabRun(read.run, [read], options),
    serialized = JSON.stringify(dto);
  assert.deepEqual(dto.checkpoints[0].events, [
    { id: good.payload.id, text: "The harbor gate opens.", worldMinutes: 5 },
  ]);
  for (const forbidden of [
    "PRIVATE_",
    "FUTURE_",
    "SOURCE_EVENT",
    "FOREIGN_SOURCE_EVENT",
    f.source.id,
    f.source.versionId,
    read.run.inputDigest,
    "inputDigest",
    "leaseGeneration",
    "headRevision",
    "headManifestId",
    "known_by",
    "knowledge",
    "privateCount",
    "sourceHeads",
  ])
    assert.equal(serialized.includes(forbidden), false, forbidden);
  assert.equal(dto.purpose, "simulation");
  assert.equal(dto.nonCanon, true);
  assert.equal(dto.checkpoints[0].summary, "Checkpoint recorded.");
});

test("D1 actor view requires positive known_by, never actor involvement or an empty filter", () => {
  const { read, options } = runFixture(),
    actor = id(),
    other = id();
  const visible = event(read, {
    actorIds: [actor],
    text: "Actor-specific fact",
  });
  assert.equal(
    projectLabRun(read.run, [read], options).checkpoints[0].events.length,
    1,
  );
  assert.equal(
    projectLabRun(read.run, [read], { ...options, actorIds: [actor] })
      .checkpoints[0].events.length,
    0,
  );
  const memory = knowledge(read, visible, [actor]);
  assert.equal(
    projectLabRun(read.run, [read], { ...options, actorIds: [actor] })
      .checkpoints[0].events.length,
    1,
  );
  for (const actorIds of [[], [other], [actor, other]])
    assert.equal(
      projectLabRun(read.run, [read], { ...options, actorIds }).checkpoints[0]
        .events.length,
      0,
    );
  memory.payload.known_by.push(other);
  assert.equal(
    projectLabRun(read.run, [read], { ...options, actorIds: [actor, other] })
      .checkpoints[0].events.length,
    1,
  );
});

test("D1 actor source currentness, time, text, transitive membership and restrictions fail closed", () => {
  const { read, options } = runFixture(),
    actor = id();
  const observed = event(read),
    memory = knowledge(read, observed, [actor]);
  const actorOptions = { ...options, actorIds: [actor] };
  for (const changes of [
    { current: false },
    { status: "invalid" },
    { valid_from: 11 },
    { valid_to: 10 },
    { text: "Other text" },
    {
      source_refs: [
        {
          campaignId: read.campaignId,
          kind: "event",
          id: id(),
          version: "1",
          part: 0,
          visibility: "public",
        },
      ],
    },
  ]) {
    const bad = structuredClone(read);
    Object.assign(
      bad.versions.find((v) => v.id === memory.id).payload,
      changes,
    );
    assert.equal(
      projectLabRun(bad.run, [bad], actorOptions).checkpoints[0].events.length,
      0,
    );
  }
  read.restrictions.push({
    campaign_id: read.campaignId,
    kind: "event",
    source_id: observed.payload.id,
  });
  assert.equal(
    projectLabRun(read.run, [read], options).checkpoints[0].events.length,
    0,
  );
  assert.equal(
    projectLabRun(read.run, [read], actorOptions).checkpoints[0].events.length,
    0,
  );
});

test("D1 current source restriction, private source and future-source status hide derived public observations", () => {
  for (const modify of [
    (f) => {
      f.source.body.visibility = "private";
    },
    (f) => {
      f.source.body.knowledge = "future_source";
    },
    (f) =>
      f.read.restrictions.push({
        campaign_id: f.read.campaignId,
        kind: "source",
        source_id: f.source.id,
      }),
    (f) =>
      f.read.restrictions.push({
        campaign_id: f.read.campaignId,
        kind: "source",
        source_id: f.source.versionId,
      }),
  ]) {
    const f = runFixture();
    event(f.read, { evidence: [f.evidence] });
    modify(f);
    assert.equal(
      projectLabRun(f.read.run, [f.read], f.options).checkpoints[0].events
        .length,
      0,
    );
  }
});

test("D1 invalidated run history has neutral labels/status and no newly trusted text", () => {
  for (const change of [
    (r) => {
      r.canonGeneration++;
    },
    (r) => {
      r.run.reason = "source_changed";
    },
  ]) {
    const { read, options } = runFixture();
    event(read);
    change(read);
    const dto = projectLabRun(read.run, [read], options);
    assert.equal(dto.status, "paused");
    assert.equal(dto.reason, "source_changed");
    assert.equal(dto.base.label, "Saved checkpoint");
    assert.equal(dto.scenario.scenarioTitle, "Scenario");
    assert.deepEqual(dto.scenario.assumptions, []);
    assert.deepEqual(dto.scenario.changes, []);
    assert.deepEqual(dto.checkpoints[0].events, []);
    assert.equal(
      projectLabCheckpoint(read, { ...scope(read), ordinal: 0 }).events.length,
      0,
    );
  }
});

test("D1 checkpoint history validates order/head, deduplicates inherited public events and applies all current restrictions", () => {
  const { read, options } = runFixture(),
    oldEvent = event(read, { worldMinutes: 3 });
  const earlier = structuredClone(read);
  earlier.manifest.id = id();
  earlier.versions.find(
    (v) => v.tableName === "rpg_private.runtime_state",
  ).payload.world_minutes = 5;
  const newEvent = event(read, { worldMinutes: 8, text: "The bridge opens." });
  let dto = projectLabRun(read.run, [earlier, read], options);
  assert.deepEqual(
    dto.checkpoints.map((point) => point.events.map((e) => e.id)),
    [[oldEvent.payload.id], [newEvent.payload.id]],
  );
  read.restrictions.push({
    campaign_id: read.campaignId,
    kind: "event",
    source_id: oldEvent.payload.id,
  });
  dto = projectLabRun(read.run, [earlier, read], options);
  assert.deepEqual(dto.checkpoints[0].events, []);
  invalid(() => projectLabRun(read.run, [read, earlier], options));
  invalid(() => projectLabRun(read.run, [read, read], options));
  invalid(() => projectLabRun(read.run, [], options));
});

test("D1 DTOs use strict allowlists and detach mutable values from private saved inputs", () => {
  const { read, options } = runFixture();
  event(read);
  options.base.credential = "SYNTHETIC_SECRET";
  options.scenario.sourceIds = ["SYNTHETIC_SECRET"];
  const before = structuredClone(read),
    dto = projectLabRun(read.run, [read], options);
  assert.equal(JSON.stringify(dto).includes("SYNTHETIC_SECRET"), false);
  assert.deepEqual(Object.keys(dto.checkpoints[0]).sort(), [
    "events",
    "id",
    "ordinal",
    "summary",
    "worldMinutes",
  ]);
  dto.scenario.assumptions.length = 0;
  assert.equal(options.scenario.assumptions.length, 1);
  const state = readDetachedState(read, scope(read));
  assert.deepEqual(detachedReadEnvelope(state), before);
  state.versions[0].payload.world_minutes = 999;
  assert.equal(state.records["rpg_private.runtime_state"][0].world_minutes, 10);
  assert.deepEqual(read, before);
  invalid(() =>
    projectLabRun(read.run, [read], {
      ...options,
      base: { ...options.base, saveId: id() },
    }),
  );
  invalid(() =>
    projectLabRun(read.run, [read], {
      ...options,
      scenario: { ...options.scenario, divergenceVersionId: id() },
    }),
  );
  assert.equal(
    projectLabRun(read.run, [read], { ...options, language: "ru" })
      .checkpoints[0].summary,
    "Контрольная точка сохранена.",
  );
});

test("D1 reader/projection are inert and contain no active store, network or provider fallback", async (t) => {
  t.mock.method(globalThis, "fetch", () =>
    assert.fail("detached projection cannot fetch"),
  );
  const { read, options } = runFixture();
  assert.ok(validateDetachedRun(read.run, scope(read)));
  assert.ok(projectLabRun(read.run, [read], options));
  for (const file of ["saves/detached-reader.ts", "world-lab/projection.ts"]) {
    const source = await readFile(
      new URL(`../src/lib/${file}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /(?:createRpc(?:Save|Memory|Turn)Store|process\.env|fetch\(|active_timeline_id|\.from\()/,
    );
    assert.doesNotMatch(
      source,
      /import[^;]*["'][^"']*(?:\/store|\/server\/)[^"']*["']/,
    );
  }
});

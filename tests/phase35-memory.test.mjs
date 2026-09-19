import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  memorySource,
  memoryRequest,
  memoryCampaigns,
  memoryActors,
} from "./phase3-long-fixtures.mjs";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import {
  retrieveMemory,
  expandRetrievalRequest,
  selectCriticalSourceIds,
} from "../src/lib/memory/retrieval.ts";
import { withMemory } from "../src/lib/memory/context.ts";
import { projectMemory } from "../src/lib/memory/projection.ts";
import { parseSummary } from "../src/lib/memory/summary.ts";
import { processMemoryJobs } from "../src/lib/memory/jobs.ts";
import { preflightMemory } from "../src/lib/memory/lifecycle.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { sameTimeline, validTimeline } from "../src/lib/memory/timeline.ts";

const main = { timelineId: randomUUID(), epoch: 1 };
const fork = { timelineId: randomUUID(), epoch: 2 };
const grandchild = { timelineId: randomUUID(), epoch: 3 };
function stamp(row, timeline) {
  return {
    ...row,
    timeline,
    ref: { ...row.ref, timeline },
    sourceRefs: row.sourceRefs.map((ref) => ({ ...ref, timeline })),
  };
}
const evidence = (id = "inherited-promise", timeline = fork, options = {}) =>
  stamp(
    memorySource(
      id,
      "Neri promised to return the brass compass after the tide falls; this promise remains unresolved.",
      { sequence: 2, unresolved: true, ...options },
    ),
    timeline,
  );
const batch = (sources, timeline = fork, aliases = []) => ({
  campaignId: memoryCampaigns.tide,
  generation: 1,
  timeline,
  sources,
  aliases,
});
const request = (options = {}) =>
  memoryRequest({
    timeline: fork,
    query: "What did Neri promise about the brass compass?",
    requiredSourceIds: ["inherited-promise"],
    ...options,
  });
const ids = (value) => value.sources.map((row) => row.id);

test("serving fences reject invalid shapes, stale epochs and mixed legacy projections", () => {
  assert.ok(validTimeline(fork));
  assert.ok(sameTimeline(undefined, undefined));
  assert.ok(sameTimeline(fork, { ...fork }));
  for (const invalid of [
    null,
    {},
    { ...fork, epoch: 0 },
    { ...fork, epoch: 1.5 },
    { ...fork, timelineId: "missing" },
    { ...fork, hidden: true },
  ])
    assert.equal(validTimeline(invalid), false);
  assert.equal(sameTimeline(fork, undefined), false);
  assert.equal(sameTimeline(undefined, fork), false);
  assert.equal(sameTimeline(fork, { ...fork, epoch: 4 }), false);
});

test("retrieval excludes abandoned future, missing fences and foreign campaign before ranking", () => {
  const allowed = evidence();
  const mixed = [
    allowed,
    evidence("future-secret", main, { significance: 1000 }),
    memorySource("unfenced", allowed.text),
    evidence("foreign", fork, { campaignId: memoryCampaigns.ash }),
  ];
  assert.deepEqual(ids(retrieveMemory(request(), batch(mixed))), [allowed.id]);
  for (const bad of [main, undefined, { ...fork, epoch: 99 }]) {
    assert.equal(
      retrieveMemory(request(), { ...batch([allowed]), timeline: bad }).paused,
      true,
    );
  }
  const legacy = memorySource("legacy", "The compass is on the table.");
  assert.deepEqual(
    ids(
      retrieveMemory(memoryRequest({ query: "compass" }), {
        campaignId: memoryCampaigns.tide,
        sources: [legacy],
        aliases: [],
        generation: 1,
      }),
    ),
    [legacy.id],
  );
});

test("nested summary refs, NPC knowledge and alias expansion cannot borrow a sibling future", () => {
  const allowed = evidence();
  const future = evidence("future-secret", main, {
    knownBy: [memoryActors.neri],
    significance: 100,
  });
  const malformed = evidence("mixed-summary", fork, {
    authority: "derived",
    sourceRefs: [future.ref],
  });
  // stamp() simulates the normal SQL serving boundary; corrupt the nested ref
  // afterwards to exercise the independent TypeScript defense.
  malformed.sourceRefs = [future.ref];
  const unknown = evidence("unknown-to-neri", fork, {
    knownBy: [memoryActors.orrin],
  });
  assert.deepEqual(
    ids(
      retrieveMemory(
        request({ actorIds: [memoryActors.neri] }),
        batch([malformed, future, unknown, allowed]),
      ),
    ),
    [allowed.id],
  );
  const aliases = [
    {
      campaignId: memoryCampaigns.tide,
      entityId: memoryActors.neri,
      alias: "Future Oracle",
      currentName: "Secret Crown",
      timeline: main,
    },
  ];
  const expanded = expandRetrievalRequest(
    request({ query: "Future Oracle", entityIds: [], requiredSourceIds: [] }),
    aliases,
  );
  assert.deepEqual(expanded.entityIds, []);
  assert.ok(!expanded.query.includes("Secret Crown"));
  assert.deepEqual(
    selectCriticalSourceIds(
      request({ requiredSourceIds: [] }),
      batch([future]),
    ),
    [],
  );
});

test("fork-specific source corrections and current versions outrank only applicable evidence", () => {
  const original = evidence();
  const changed = evidence("corrected-b", fork, {
    authority: "correction",
    factKey: "compass-color",
    factValue: "red",
    statementKind: "fact",
  });
  changed.ref = { ...original.ref, version: "2" };
  changed.text =
    "Neri promised to return the red compass, not the brass compass.";
  const old = { ...original, current: false, status: "superseded" };
  assert.deepEqual(
    ids(
      retrieveMemory(
        request({ requiredSourceIds: [changed.id] }),
        batch([old, changed, evidence("a-correction", main)]),
      ),
    ),
    [changed.id],
  );
  const aOriginal = stamp(original, main);
  assert.deepEqual(
    ids(
      retrieveMemory(
        request({ timeline: main }),
        batch([aOriginal, changed], main),
      ),
    ),
    [aOriginal.id],
  );
});

function contextFixture() {
  const { source, input } = runtimeFixture();
  source.runtime.timeline = fork;
  input.timeline = fork;
  input.input = "I look at the door.";
  const context = {
    campaignId: input.campaignId,
    timeline: fork,
    generation: 1,
    stateRevision: source.runtime.revision,
    checkpoint: null,
    publicSummary: null,
    privateSummary: null,
    publicWatermark: 0,
    privateWatermark: 0,
    publicHighWatermark: 0,
    privateHighWatermark: 0,
    uncovered: [],
    overflow: false,
    aliases: [],
  };
  const searches = [];
  const store = {
    read: async () => ({ timeline: fork, currentBoundary: null }),
    source: async () => source,
    context: async () => context,
    search: async (req) => {
      searches.push(req);
      return {
        campaignId: req.campaignId,
        timeline: fork,
        generation: 1,
        sources: [],
        aliases: [],
      };
    },
  };
  return { source, input, context, store, searches };
}

test("context rejects activation races even when restored state revision equals the old value", async () => {
  for (const variant of ["input", "context", "search", "alias"]) {
    const f = contextFixture();
    if (variant === "input") f.input.timeline = main;
    if (variant === "context") f.context.timeline = main;
    if (variant === "search")
      f.store.search = async (req) => ({
        campaignId: req.campaignId,
        timeline: main,
        generation: 1,
        sources: [],
        aliases: [],
      });
    if (variant === "alias")
      f.context.aliases = [
        {
          campaignId: f.input.campaignId,
          entityId: randomUUID(),
          alias: "Future",
          currentName: "Future",
          timeline: main,
        },
      ];
    await assert.rejects(withMemory(f.source, f.input, f.store), (error) =>
      ["context", "conflict"].includes(error.code),
    );
  }
});

test("current context pins both retrieval stages and excludes private continuity from narration", async () => {
  const f = contextFixture();
  const publicRow = evidence("public-inherited", fork, {
    campaignId: f.input.campaignId,
  });
  const privateRow = evidence("private-inherited", fork, {
    campaignId: f.input.campaignId,
  });
  privateRow.ref.visibility = "private";
  privateRow.ref.kind = "private_event";
  privateRow.text = "SYNTHETIC_PRIVATE_TIMELINE_CANARY";
  f.context.uncovered = [publicRow, privateRow];
  const selected = await withMemory(f.source, f.input, f.store);
  assert.ok(f.searches.every((req) => sameTimeline(req.timeline, fork)));
  const plan = projectMemory(selected, f.input, "plan");
  assert.ok(JSON.stringify(plan.privateContinuity).includes(privateRow.text));
  assert.ok(
    !JSON.stringify(projectMemory(selected, f.input, "narrate")).includes(
      privateRow.text,
    ),
  );
  selected.memory.privateHistorical = [stamp(privateRow, main)];
  assert.throws(() => projectMemory(selected, f.input, "plan"), {
    code: "context",
  });
});

test("checkpoint and summary envelopes and every nested reference must match active serving scope", async () => {
  for (const variant of [
    "checkpoint",
    "checkpoint-ref",
    "summary",
    "summary-generation",
    "summary-ref",
    "summary-entry",
    "uncovered",
  ]) {
    const f = contextFixture();
    const row = evidence("reference", fork, { campaignId: f.input.campaignId });
    const cp = {
      campaignId: f.input.campaignId,
      timeline: fork,
      valid: true,
      sourceRefs: [row.ref],
    };
    const summary = {
      campaignId: f.input.campaignId,
      timeline: fork,
      generation: 1,
      valid: true,
      visibility: "public",
      sourceRefs: [row.ref],
      entries: [row],
    };
    if (variant === "checkpoint") {
      cp.timeline = main;
      f.context.checkpoint = cp;
    }
    if (variant === "checkpoint-ref") {
      cp.sourceRefs = [{ ...row.ref, timeline: main }];
      f.context.checkpoint = cp;
    }
    if (variant.startsWith("summary")) {
      f.context.publicSummary = summary;
      if (variant === "summary") summary.timeline = main;
      if (variant === "summary-generation") summary.generation = 0;
      if (variant === "summary-ref")
        summary.sourceRefs = [{ ...row.ref, timeline: main }];
      if (variant === "summary-entry") summary.entries = [stamp(row, main)];
    }
    if (variant === "uncovered") f.context.uncovered = [stamp(row, main)];
    await assert.rejects(withMemory(f.source, f.input, f.store), {
      code: "context",
    });
  }
});

function summaryFixture() {
  const row = evidence();
  return {
    id: randomUUID(),
    campaignId: row.campaignId,
    timeline: fork,
    boundaryId: null,
    visibility: "public",
    generation: 1,
    token: randomUUID(),
    attempts: 1,
    stateRevision: 1,
    settingsRevision: 1,
    guideVersionId: randomUUID(),
    fromSequence: 1,
    throughSequence: 2,
    sources: [row],
    requiredSourceIds: [row.id],
  };
}

test("summary validation rejects sibling source or ancestry ref while preserving inherited wording", () => {
  const job = summaryFixture();
  const output = {
    schemaVersion: 1,
    selections: job.sources.map((row) => ({
      sourceId: row.id,
      version: row.ref.version,
    })),
  };
  assert.deepEqual(parseSummary(output, job), output);
  for (const variant of ["row", "ref", "nested"]) {
    const bad = structuredClone(job);
    if (variant === "row") bad.sources[0].timeline = main;
    if (variant === "ref") bad.sources[0].ref.timeline = main;
    if (variant === "nested")
      bad.sources[0].sourceRefs = [{ ...bad.sources[0].ref, timeline: main }];
    assert.throws(() => parseSummary(output, bad), { code: "validation" });
  }
});

test("old timeline callbacks cannot generate or publish jobs from the newly active branch", async () => {
  let calls = 0,
    published = 0;
  const job = summaryFixture();
  await assert.rejects(
    processMemoryJobs(
      job.campaignId,
      { claim: async () => job, publish: async () => published++ },
      { summarize: async () => calls++ },
      4,
      main,
    ),
    { code: "context" },
  );
  assert.equal(calls, 0);
  assert.equal(published, 0);
  const f = contextFixture();
  f.input.timeline = main;
  f.store.source = async () => {
    throw Error("No source/model work before rejecting stale fence");
  };
  await assert.rejects(preflightMemory(f.input, f.store, {}, "gpt-6-astra"), {
    code: "conflict",
  });
});

test("RPC adapter binds the initiating campaign fence and never rebases after switching", async () => {
  const calls = [];
  let active = fork;
  const store = createRpcMemoryStore(
    randomUUID(),
    async (args) => {
      calls.push(args);
      return { data: { timeline: active, campaignId: args.p_campaign_id } };
    },
    fork,
  );
  await store.read(memoryCampaigns.tide);
  await store.retry({
    campaignId: memoryCampaigns.tide,
    timeline: fork,
    requestId: randomUUID(),
    boundaryId: null,
  });
  assert.ok(calls.every((args) => sameTimeline(args.p_timeline, fork)));
  assert.ok(calls.every((args) => !Object.hasOwn(args.p_payload, "timeline")));
  active = main;
  await assert.rejects(store.read(memoryCampaigns.tide), { code: "conflict" });
  await assert.rejects(
    store.retry({
      campaignId: memoryCampaigns.tide,
      timeline: main,
      requestId: randomUUID(),
      boundaryId: null,
    }),
    { code: "conflict" },
  );
  assert.equal(calls.length, 3);
});

test("legacy direct adapter pins separate campaign reads independently without a cross-campaign cache", async () => {
  const seen = [];
  const store = createRpcMemoryStore(randomUUID(), async (args) => {
    seen.push(args);
    return {
      data: {
        campaignId: args.p_campaign_id,
        timeline: args.p_campaign_id === memoryCampaigns.tide ? fork : main,
      },
    };
  });
  await store.read(memoryCampaigns.tide);
  await store.read(memoryCampaigns.ash);
  await store.read(memoryCampaigns.tide);
  await store.read(memoryCampaigns.ash);
  assert.deepEqual(
    seen.map((args) => args.p_timeline),
    [null, null, fork, main],
  );
});

test("long-history multi-fork selection preserves critical evidence and bounded memory without future knowledge", () => {
  // Manifest ancestry/storage validation is exercised by SQL tests. This separate
  // defense-in-depth fixture deliberately mixes more than 1000 active and stale
  // sources, then tests serving fences independently of that trusted filtering.
  const inherited = evidence();
  const rootRows = Array.from({ length: 1100 }, (_, index) =>
    evidence(`root-${index}`, main, {
      sequence: index + 10,
      sessionId: `session-${Math.floor(index / 50)}`,
      unresolved: false,
      significance: 1,
    }),
  );
  const branchRows = Array.from({ length: 1100 }, (_, index) =>
    evidence(`fork-${index}`, fork, {
      sequence: index + 1200,
      sessionId: `session-${Math.floor(index / 50)}`,
      unresolved: false,
      significance: 1,
    }),
  );
  const future = evidence("revealed-only-in-parent-future", fork, {
    significance: 1000,
    knownBy: [memoryActors.neri],
  });
  const restored = stamp(inherited, grandchild);
  const rows = [...rootRows, ...branchRows, future, restored];
  const original = structuredClone(rows);
  const result = retrieveMemory(
    request({
      timeline: grandchild,
      actorIds: [memoryActors.neri],
      maxBytes: 12000,
    }),
    batch(rows, grandchild),
  );
  assert.deepEqual(ids(result), [restored.id]);
  assert.ok(result.bytes <= 12000);
  assert.ok(result.sources.length <= 12);
  assert.deepEqual(rows, original);
  const missing = retrieveMemory(
    request({ timeline: grandchild, requiredSourceIds: [future.id] }),
    batch(rows, grandchild),
  );
  assert.equal(missing.paused, true);
  assert.equal(missing.reason, "missing");
});

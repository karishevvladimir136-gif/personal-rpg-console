import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { memorySource } from "./phase3-long-fixtures.mjs";
import { buildAstraPlanContext, astraPlanProviderInput,
  astraPlanRequestBytes } from "../src/lib/gameplay/astra-plan-context.ts";
import { astraPlanResponseSchema } from "../src/lib/gameplay/astra-plan-schema.ts";
import { astraCapabilities } from "../src/lib/gameplay/astra-capabilities.ts";
import { modelInputLimit } from "../src/lib/gameplay/dm-context.ts";
import { ContextCapacityError, DmError } from "../src/lib/gameplay/dm-errors.ts";
import { preflightAstraPlanMemory } from "../src/lib/memory/lifecycle.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const { createAstraPrimaryProvider } = await import(
  "../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

// Invented sources model a private-heavy World origin turn whose public
// summary becomes ready while the claimed operation is in Memory preflight.
function raceFixture({ externalWorker = false } = {}) {
  const { source, input, actorId, sessionId } = runtimeFixture();
  const cid = input.campaignId;
  source.snapshot.settings.values.rulesSystem.id = "world-logic-v1";
  source.snapshot.entities[0].name = "Synthetic Iris";
  source.privateState = {
    syntheticPrivateAuthority: "PRIVATE_ONLY_SYNTHETIC_MARKER",
    activeMotives: "An invented private motive with no player visibility. ".repeat(120),
  };
  source.worldTakeover = {
    schemaVersion: 1, presentEntityIds: [actorId], routeLocationIds: [],
    actors: [{ entityId: actorId, publicName: "Synthetic Iris" }],
    syntheticWorldEvidence: "An invented World origin evidence packet. ".repeat(75),
  };
  source.snapshot.documents.push({ id: randomUUID(), campaign_id: cid,
    revision: 1, updated_at: "2026-09-18T00:00:00Z",
    title: "Synthetic Canon", status: "canon",
    body: "The offered roadside room permits sleep until morning.",
    current_version_id: randomUUID() });
  for (let index = 0; index < 8; index++) {
    const sceneId = randomUUID();
    source.snapshot.scenes.push({ id: sceneId, campaign_id: cid, revision: 1,
      session_id: sessionId, role: "dm",
      body: `Synthetic scene ${index}: ` + "A quiet roadside room. ".repeat(42) });
    source.runtime.turns.push({ id: randomUUID(), campaign_id: cid,
      session_id: sessionId, status: "committed", mode: "game",
      input: `Earlier action ${index}`,
      narration: "An invented previous exchange. ".repeat(27),
      listenerIds: [] });
    source.snapshot.publicState.current_scene_id = sceneId;
  }
  input.input = "I take the offered room and sleep until morning.";
  const events = Array.from({ length: 45 }, (_, index) => {
    const text = index === 0
      ? "Synthetic host promised Iris a room; the promise remains unresolved. " +
        "Ordinary public conversation. ".repeat(10)
      : `Synthetic public event ${index}. ` +
        "Ordinary public conversation at the roadside room. ".repeat(8);
    return memorySource(`synthetic-event-${index}`, text, {
      campaignId: cid, sequence: index + 1, sessionId,
      entityIds: [actorId], knownBy: [actorId],
      unresolved: index === 0, significance: index === 0 ? 5 : 0,
    });
  });
  const canonDocument = source.snapshot.documents.at(-1);
  const relevantCanon = memorySource("synthetic-canon-room",
    canonDocument.body, { campaignId: cid, sequence: 1, sessionId,
      authority: "canon", entityIds: [actorId], knownBy: [actorId],
      ref: { campaignId: cid, kind: "document", id: canonDocument.id,
        version: canonDocument.current_version_id, part: 0,
        visibility: "public" } });
  let published = false;
  let reads = 0;
  let claims = 0;
  const enqueues = [];
  const job = {
    id: randomUUID(), campaignId: cid, boundaryId: null,
    visibility: "public", generation: 1, token: randomUUID(), attempts: 1,
    stateRevision: source.runtime.revision,
    settingsRevision: source.snapshot.settings.revision,
    guideVersionId: source.snapshot.documents[0].current_version_id,
    fromSequence: 1, throughSequence: 24,
    sources: events.slice(0, 24), requiredSourceIds: [events[0].id],
  };
  const summary = {
    id: randomUUID(), campaignId: cid, visibility: "public",
    boundaryId: null, generation: 1, fromSequence: 1, throughSequence: 24,
    sourceRefs: [events[0].ref], entries: [events[0]], valid: true,
    createdAt: "2026-09-18T00:00:01Z",
  };
  const store = {
    context: async () => {
      reads++;
      return { campaignId: cid, generation: 1,
        stateRevision: source.runtime.revision, checkpoint: null,
        publicSummary: published ? summary : null, privateSummary: null,
        publicWatermark: published ? 24 : 0, privateWatermark: 0,
        publicHighWatermark: 45, privateHighWatermark: 0,
        uncovered: published ? events.slice(24) : events,
        overflow: false, aliases: [] };
    },
    search: async (request) => ({ campaignId: cid, generation: 1,
      sources: request.visibility === "public" ? [relevantCanon] : [],
      aliases: [] }),
    enqueue: async (_campaignId, reason) => { enqueues.push(reason); },
    claim: async () => {
      claims++;
      return externalWorker || claims > 1 ? null : job;
    },
    publish: async (_job, output) => {
      assert.deepEqual(output.selections,
        [{ sourceId: events[0].id, version: "1" }]);
      published = true;
    },
    fail: async () => assert.fail("valid synthetic summary must publish"),
  };
  const summaries = { summarize: async () => ({
    output: { schemaVersion: 1,
      selections: [{ sourceId: events[0].id, version: "1" }] },
    usage: { inputTokens: 0, outputTokens: 0 },
  }) };
  return { source, input, events, store, summaries,
    get reads() { return reads; }, get claims() { return claims; },
    get published() { return published; }, enqueues };
}

const builder = (source, input, requiredOnly) =>
  buildAstraPlanContext(source, input, { requiredOnly });

test("claimed Astra preflight waits for one relevant summary and trims only optional prose", async () => {
  const f = raceFixture();
  const before = await f.store.context();
  const selectedBefore = { ...f.source, historyComplete: true, memory: {
    campaignId: f.input.campaignId, generation: 1,
    stateRevision: f.source.runtime.revision, checkpoint: null,
    exactEvents: before.uncovered, historical: [], privateHistorical: [],
    publicSummary: null, privateSummary: null, complete: true,
  } };
  assert.throws(() => buildAstraPlanContext(selectedBefore, f.input,
    { requiredOnly: true }), (error) =>
      error instanceof ContextCapacityError && error.summaryMayHelp);

  const result = await preflightAstraPlanMemory(
    f.source, f.input, f.store, f.summaries, builder);
  assert.equal(f.published, true);
  assert.deepEqual(f.enqueues, ["rebuild"]);
  assert.equal(f.claims, 2); // one batch, then bounded empty claim
  assert.equal(f.reads, 3); // one explicit baseline and two preflight reads
  assert.ok(result.context.estimatedTokens <= modelInputLimit(result.context.budget));
  assert.ok(result.context.estimatedTokens <= 64000);
  const packet = JSON.parse(result.context.input);
  assert.equal(packet.mandatory.input, f.input.input);
  assert.equal(packet.mandatory.privateState.syntheticPrivateAuthority,
    "PRIVATE_ONLY_SYNTHETIC_MARKER");
  assert.equal(packet.mandatory.canon[0].text,
    "The offered roadside room permits sleep until morning.");
  assert.ok(packet.mandatory.worldTakeover.syntheticWorldEvidence);
  assert.ok(packet.memory.digest.some((row) =>
    row.text.includes("promise remains unresolved")));
  assert.ok(packet.originalScenes.some((row) =>
    row.id === f.source.snapshot.publicState.current_scene_id));
  assert.ok(packet.originalScenes.length < f.source.snapshot.scenes.length);
  assert.equal(packet.mandatory.houseRules, undefined);
});

test("a summary owned by another worker leaves the pinned operation retryable", async () => {
  const f = raceFixture({ externalWorker: true });
  await assert.rejects(preflightAstraPlanMemory(
    f.source, f.input, f.store, f.summaries, builder), (error) =>
      error instanceof DmError && error.code === "context" && error.retryable);
  assert.deepEqual(f.enqueues, ["rebuild"]);
  assert.equal(f.claims, 1);
  assert.equal(f.reads, 2);
});

test("Astra capacity counts the actual schema, envelope, and later tool receipts", async () => {
  const f = raceFixture();
  const { context } = await preflightAstraPlanMemory(
    f.source, f.input, f.store, f.summaries, builder);
  const caps = astraCapabilities(f.source);
  const schema = astraPlanResponseSchema(f.input, caps, f.source);
  const providerInput = astraPlanProviderInput(context.input, [], []);
  const expected = astraPlanRequestBytes(context, providerInput, schema);
  assert.equal(expected, context.estimatedTokens);
  let fetches = 0;
  let actualBody;
  const provider = createAstraPrimaryProvider({ apiKey: "synthetic-only",
    fetcher: async (_url, init) => {
      fetches++;
      actualBody = init.body;
      return new Response("{}", { status: 500 });
    } });
  await assert.rejects(provider.next(context, f.input, [], [], caps, f.source));
  assert.equal(fetches, 1);
  assert.equal(Buffer.byteLength(actualBody) + 2048, expected);
  const oversizedReceipt = { position: 0, id: randomUUID(),
    call: { kind: "query", actorId: f.source.snapshot.entities[0].id,
      targetId: null, dc: null, itemId: null, scope: null },
    result: { kind: "query", synthetic: "R".repeat(64000) } };
  await assert.rejects(provider.next(context, f.input,
    [oversizedReceipt], [], caps, f.source), (error) =>
      error instanceof DmError && error.code === "context");
  assert.equal(fetches, 1);
});

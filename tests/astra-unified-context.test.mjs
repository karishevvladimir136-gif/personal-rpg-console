import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { memorySource } from "./phase3-long-fixtures.mjs";
import { buildAstraPlanContext, astraPlanProviderInput } from "../src/lib/gameplay/astra-plan-context.ts";
import { preflightAstraPlanMemory, maintainAstraMemoryAfterCommit } from "../src/lib/memory/lifecycle.ts";
import { DmError, ContextCapacityError } from "../src/lib/gameplay/dm-errors.ts";
import { runWithAstraMemoryMaintenance } from "../src/lib/memory/after-commit.ts";

function fixture() {
  const f = runtimeFixture();
  f.source.astraResponseContract = "unified-v1";
  const cid = f.input.campaignId;
  f.source.snapshot.documents.push({ id: randomUUID(), campaign_id: cid, revision: 1,
    title: "Owner Canon", status: "canon", body: "CURRENT_OWNER_CANON", current_version_id: randomUUID() });
  const memory = { campaignId: cid, generation: 1, stateRevision: f.source.runtime.revision,
    checkpoint: null, publicSummary: null, privateSummary: null, uncovered: [], overflow: false,
    aliases: [], publicWatermark: 0, privateWatermark: 0, publicHighWatermark: 0, privateHighWatermark: 0 };
  const calls = { summary: 0, enqueue: 0, claim: 0 };
  const store = { context: async () => memory,
    search: async () => ({ campaignId: cid, generation: 1, sources: [], aliases: [] }),
    enqueue: async () => { calls.enqueue++; }, claim: async () => { calls.claim++; return null; } };
  const summaries = { summarize: async () => { calls.summary++; throw new Error("foreground summary forbidden"); } };
  return { ...f, cid, memory, calls, store, summaries };
}
const builder = (source, input, requiredOnly) => buildAstraPlanContext(source, input, { requiredOnly });

test("unified mandatory current state crosses64KB target within validated capability hard bound", async () => {
  const f = fixture();
  f.source.snapshot.publicState.summary = "CURRENT_AUTHORITY_" + "A".repeat(100000);
  const { context } = await preflightAstraPlanMemory(f.source, f.input, f.store, f.summaries, builder);
  const packet = JSON.parse(context.input);
  assert.equal(packet.mandatory.current.publicState.summary, f.source.snapshot.publicState.summary);
  assert.equal(packet.mandatory.input, f.input.input);
  assert.ok(packet.mandatory.canon.some((row) => row.body === "CURRENT_OWNER_CANON"));
  assert.ok(context.estimatedTokens > 64000);
  assert.ok(context.estimatedTokens < context.budget.inputCap);
  assert.equal(context.budget.inputCap, 1050000 - 4096 - 52500);
  assert.deepEqual(f.calls, { summary: 0, enqueue: 0, claim: 0 });
});

test("overflow and badly oversized optional uncovered history cannot block ordinary unified fiction", async () => {
  const f = fixture();
  f.memory.overflow = true;
  f.memory.uncovered = Array.from({ length: 49 }, (_, i) => memorySource(`oversized-${i}`, "Z".repeat(100000), { campaignId: f.cid }));
  f.source.historyComplete = false;
  const { selected, context } = await preflightAstraPlanMemory(f.source, f.input, f.store, f.summaries, builder);
  assert.equal(selected.historyComplete, true);
  assert.ok(context.estimatedTokens < 64000);
  assert.ok(context.input.includes("CURRENT_OWNER_CANON"));
  assert.deepEqual(f.calls, { summary: 0, enqueue: 0, claim: 0 });
});

test("stale optional summary and checkpoint are omitted while correction and Canon originals remain", async () => {
  const f = fixture();
  f.memory.checkpoint = { valid: false, campaignId: f.cid };
  f.memory.publicSummary = { valid: true, generation: 0, campaignId: f.cid, visibility: "public", entries: [] };
  const correction = memorySource("correction", "OWNER_CORRECTION_CURRENT", { campaignId: f.cid, authority: "correction" });
  const canon = memorySource("memory-canon", "RETRIEVED_CANON_CURRENT", { campaignId: f.cid, authority: "canon" });
  f.memory.uncovered = [correction];
  f.store.search = async (request) => ({ campaignId: f.cid, generation: 1,
    sources: request.visibility === "public" ? [canon] : [], aliases: [] });
  f.input.input = "RETRIEVED_CANON_CURRENT";
  const { selected, context } = await preflightAstraPlanMemory(f.source, f.input, f.store, f.summaries, builder);
  assert.equal(selected.memory.checkpoint, null);
  assert.equal(selected.memory.publicSummary, null);
  assert.ok(context.input.includes("OWNER_CORRECTION_CURRENT"));
  assert.ok(context.input.includes("CURRENT_OWNER_CANON"));
  assert.ok(context.input.includes("RETRIEVED_CANON_CURRENT"));
});

test("unified source campaign/revision/fence mismatch remains a hard failure", async () => {
  for (const mutate of [f => { f.source.runtime.revision++; }, f => { f.memory.campaignId = randomUUID(); },
    f => { f.memory.timeline = { timelineId: randomUUID(), epoch: 2 }; }]) {
    const f = fixture(); mutate(f);
    await assert.rejects(preflightAstraPlanMemory(f.source, f.input, f.store, f.summaries, builder), { code: "conflict" });
    assert.equal(f.calls.summary, 0);
  }
});

test("derived index outage keeps authorized bounded current context after legacy64-row history window", async () => {
  const f = fixture(); f.source.historyComplete = false;
  f.store.context = async () => { throw new DmError("unavailable", true); };
  const { context } = await preflightAstraPlanMemory(f.source, f.input, f.store, f.summaries, builder);
  assert.ok(context.input.includes("CURRENT_OWNER_CANON"));
  assert.ok(context.input.includes(f.input.input));
  assert.equal(f.calls.summary, 0);
});

test("unified receipt projection omits private checks and raw receipt identity while preserving outcomes", () => {
  const receipt = { id: "PRIVATE_RECEIPT_ID", position: 7,
    call: { kind: "attack", actorId: "actor", targetId: "target", itemId: null, scope: null, dc: 17 },
    result: { id: "PRIVATE_CHECK_ID", dc: 17, dice: [18], total: 24, modifier: 6,
      kept: 18, rollNumber: 1, visibility: "private", success: true } };
  const text = astraPlanProviderInput("{}", [receipt], [receipt.result], { responseContract: "unified-v1" });
  assert.ok(text.includes('"success":true'));
  for (const forbidden of ["PRIVATE_RECEIPT_ID", "PRIVATE_CHECK_ID", '"dc"', '"dice"', '"total"', '"modifier"'])
    assert.ok(!text.includes(forbidden));
  assert.ok(astraPlanProviderInput("{}", [receipt], []).includes("PRIVATE_RECEIPT_ID"));
});

test("post-commit Memory helper uses existing bounded jobs only after pressure and fences stale work", async () => {
  const f = fixture();
  assert.deepEqual(await maintainAstraMemoryAfterCommit(f.cid, f.store, f.summaries),
    { processed: 0, failed: false, scheduled: false });
  f.memory.overflow = true;
  assert.deepEqual(await maintainAstraMemoryAfterCommit(f.cid, f.store, f.summaries),
    { processed: 0, failed: false, scheduled: true });
  assert.deepEqual(f.calls, { summary: 0, enqueue: 1, claim: 1 });
  f.memory.timeline = { timelineId: randomUUID(), epoch: 2 };
  await assert.rejects(maintainAstraMemoryAfterCommit(f.cid, f.store, f.summaries), { code: "conflict" });
  assert.equal(f.calls.enqueue, 1);
});

test("unified current mechanics excludes historical completed rests and encounters without changing source authority", () => {
  const f = fixture();
  f.source.runtime.restRecords = Array.from({ length: 200 }, (_, index) => ({ id: `rest-${index}`,
    campaign_id: f.cid, kind: "long", status: "complete", settings_revision: 1, public_outcome: {} }));
  f.source.runtime.restRecords.push({ id: "current-rest", campaign_id: f.cid, kind: "short",
    status: "planned", settings_revision: 1, public_outcome: {} });
  const packet = JSON.parse(buildAstraPlanContext(f.source, f.input).input);
  assert.deepEqual(packet.mandatory.current.rest.map((row) => row.id), ["current-rest"]);
  assert.equal(f.source.runtime.restRecords.length, 201);
});

test("source-identity recent dedup preserves player inputs and current exact scene", () => {
  const f = fixture();
  const oldId = randomUUID(), currentId = randomUUID();
  f.source.snapshot.scenes = [oldId, currentId].map((id, index) => ({ id, campaign_id: f.cid,
    revision: 1, session_id: f.sessionId, role: "dm", body: `Exact original narration ${index}` }));
  f.source.snapshot.publicState.current_scene_id = currentId;
  f.source.runtime.turns = [oldId, currentId].map((id, index) => ({ id: randomUUID(), campaign_id: f.cid,
    status: "committed", mode: "game", session_id: f.sessionId, listenerIds: [],
    narrationSceneId: id, input: `Prior literal action ${index}`, narration: `Exact original narration ${index}` }));
  const packet = JSON.parse(buildAstraPlanContext(f.source, f.input).input);
  assert.equal(packet.originalScenes.length, 1);
  assert.equal(packet.originalScenes[0].id, currentId);
  assert.deepEqual(packet.exchanges.map((row) => row.input), ["Prior literal action 0", "Prior literal action 1"]);
});

test("service commit observation schedules zero maintenance or lookup on exact committed replay", async () => {
  const f = fixture();
  const existing = { id: f.input.operationId, campaign_id: f.cid, status: "committed" };
  let lookups = 0, schedules = 0, commits = 0;
  const store = { commit: async () => { commits++; return existing; },
    astraResponseContract: async () => { lookups++; return "unified-v1"; } };
  const result = await runWithAstraMemoryMaintenance(store, f.store, f.summaries, undefined,
    async () => existing, () => { schedules++; });
  assert.equal(result, existing);
  assert.equal(commits, 0); assert.equal(lookups, 0); assert.equal(schedules, 0);
  assert.deepEqual(f.calls, { summary: 0, enqueue: 0, claim: 0 });
});

test("post-commit contract lookup failure stays background and cannot fail a committed response", async () => {
  const f = fixture();
  const committed = { id: f.input.operationId, campaign_id: f.cid, status: "committed" };
  let lookups = 0, callback;
  const store = { commit: async () => committed,
    astraResponseContract: async () => { lookups++; throw new DmError("unavailable", true); } };
  const result = await runWithAstraMemoryMaintenance(store, f.store, f.summaries, undefined,
    async (observed) => observed.commit({}, {}), (work) => { callback = work; });
  assert.equal(result, committed); assert.equal(lookups, 0);
  await assert.doesNotReject(callback());
  assert.equal(lookups, 1);
  assert.deepEqual(f.calls, { summary: 0, enqueue: 0, claim: 0 });
});

test("post-commit scheduling failure cannot change the successful committed result", async () => {
  const f = fixture();
  const committed = { id: f.input.operationId, campaign_id: f.cid, status: "committed" };
  const store = { commit: async () => committed };
  const result = await runWithAstraMemoryMaintenance(store, f.store, f.summaries, undefined,
    async (observed) => observed.commit({}, {}), () => { throw new Error("after unavailable"); });
  assert.equal(result, committed);
  assert.deepEqual(f.calls, { summary: 0, enqueue: 0, claim: 0 });
});

test("real unified capacity failure permits manual technical retry without relaxing scope or legacy behavior", () => {
  const f = fixture();
  f.source.snapshot.publicState.summary = "A".repeat(1050000);
  assert.throws(() => buildAstraPlanContext(f.source, f.input), (error) =>
    error instanceof ContextCapacityError && error.code === "context" && error.retryable === true &&
    error.summaryMayHelp === false);
  delete f.source.astraResponseContract;
  assert.throws(() => buildAstraPlanContext(f.source, f.input), (error) =>
    error instanceof ContextCapacityError && error.retryable === false);
  f.source.astraResponseContract = "unified-v1";
  f.source.runtime.revision++;
  assert.throws(() => buildAstraPlanContext(f.source, f.input), (error) =>
    error instanceof DmError && !(error instanceof ContextCapacityError) && error.retryable === false);
});

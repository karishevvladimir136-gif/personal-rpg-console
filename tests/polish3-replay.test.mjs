// Polish 3 §4: the replay tool's proof on a synthetic campaign — the snapshot of a committed turn
// restores into an isolated copy, the copy plays the owner's line on any variant with scripted
// models, the live campaign stays untouched, and the samples have the bake-off's shape.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runCampaignTurn, resumeCampaignTurn } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { createSnapshotTurnStore, noMemory, seededRandom, snapshotInput } from "../src/lib/gameplay/replay/memory-store.ts";
import { buildReplaySample, previousExchange } from "../src/lib/gameplay/replay/samples.ts";
import { encodeTurnSnapshot, decodeTurnSnapshot } from "../src/lib/gameplay/turn-snapshot.ts";
import { DM_LOOP_DEFAULT_LIMITS } from "../src/lib/gameplay/dm-loop/limits.ts";

const finish = (kind) => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false, nextTension: "calm" } });
const time = (minutes) => ({ name: "advance_time", arguments: { minutes, reason: "время" } });

async function snapshotOfNextTurn(c, text, rounds) {
  let captured = null;
  const played = await c.turn(text, rounds, { deps: { afterCommit: async ({ input, source }) => { captured = { input, source }; } } });
  assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
  assert.ok(captured, "afterCommit delivers the input and the source");
  const settings = await c.settings.read();
  const encoded = encodeTurnSnapshot(captured.input, captured.source, { limits: settings.limits, depth: settings.depth, split: settings.split, dmTurn: settings.dmTurn });
  return { played, payload: decodeTurnSnapshot(encoded.source) };
}

function replayDeps(store, variant, writerRounds, bookkeeperRounds) {
  const writer = createScriptedDmModel(writerRounds, { providerId: "anthropic", modelId: variant.writer, chunk: 9 });
  const bookkeeper = createScriptedDmModel(bookkeeperRounds ?? [], { providerId: "anthropic", modelId: variant.bookkeeper ?? "claude-sonnet-5-5" });
  const split = variant.bookkeeper ? { writer: { providerId: "anthropic", modelId: variant.writer, reasoning: "high" }, bookkeeper: { providerId: "anthropic", modelId: variant.bookkeeper, reasoning: "high" } } : null;
  const live = [];
  const observations = [];
  return { writer, bookkeeper, live, observations, deps: {
    store, memory: noMemory, summaries: { summarize: async () => { throw new Error("none"); } },
    model: () => writer, bookkeeperModel: () => bookkeeper, split, ...(split ? { bookkeeper: { providerId: "anthropic", modelId: variant.bookkeeper, effort: "high" } } : {}),
    pin: async () => ({ providerId: "anthropic", modelId: variant.writer, effort: "high", limits: DM_LOOP_DEFAULT_LIMITS, depth: null, boostNext: false }),
    random: seededRandom("fixed"),
    observe: (o) => { observations.push(o); if (o.type === "live") live.push(o.event); },
  } };
}

test("§4 a committed turn's snapshot replays the owner's line on an isolated copy — single loop and split — and the live campaign is untouched", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.turn("Оглядываюсь.", [{ text: "Причал, лодки.", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "marta", name: "Марта", kind: "npc", present: true } }, time(10), finish("exploration")] }]);
    const { played, payload } = await snapshotOfNextTurn(c, "Подхожу к Марте.", [{ text: "Марта кивает.", toolCalls: [time(5), finish("conversation")] }]);
    assert.equal(payload.input.input, "Подхожу к Марте.");
    assert.equal(payload.settings.limits.toolCallsPerTurn, DM_LOOP_DEFAULT_LIMITS.toolCallsPerTurn);
    assert.ok(payload.source.snapshot.entities.some((row) => row.name === "Марта"), "the state before the turn has the person met the turn before");
    const before = await c.dump();
    // The previous exchange for the sample's «before» context.
    assert.deepEqual(previousExchange(payload), { input: "Оглядываюсь.", narration: "Причал, лодки." });
    // Variant A on the copy.
    const storeA = createSnapshotTurnStore(payload);
    const a = replayDeps(storeA, { writer: "claude-opus-5-5", bookkeeper: null }, [{ text: "Марта смотрит исподлобья.", toolCalls: [
      { name: "item", arguments: { action: "create", localKey: "cup", name: "Кружка", category: "misc", quantity: 1, ownerRef: payload.source.snapshot.entities.find((e) => e.name === "Марта").id } }, time(7), finish("conversation")] }]);
    const input = snapshotInput(payload);
    assert.equal(input.operationId, played.input.operationId, "the same operation, replayed");
    const resultA = await runCampaignTurn(input, a.deps);
    assert.equal(resultA.status, "committed", resultA.failure ?? "");
    assert.equal(resultA.narration, "Марта смотрит исподлобья.");
    assert.equal(a.writer.requests.length, 1);
    assert.equal(a.bookkeeper.requests.length, 0);
    const committedA = storeA.committed();
    assert.ok(committedA.receipts.some((r) => r.call.name === "item" && r.result.ok), "the copy's validators accepted the record");
    assert.ok(committedA.packet.resolution.changes.length > 0);
    assert.ok(a.writer.requests[0].system.some((block) => /Марта/.test(block.text)), "the writer saw the restored dossier");
    // Variant D on a second copy of the same state: the same dice, the two models.
    const storeD = createSnapshotTurnStore(payload);
    const d = replayDeps(storeD, { writer: "claude-opus-5-5", bookkeeper: "claude-sonnet-5-5" },
      [{ parts: [{ text: "Марта щурится —" }, { toolCall: { name: "roll", arguments: { formula: "1d20", reason: "Убедить Марту", actorRef: payload.source.snapshot.entities.find((e) => e.kind === "player").id, visibility: "player", difficulty: "normal" } } }] },
        { text: "— и кивает.\n\n<ledger>\nвремя — 5 минут\nсцена — conversation; напряжение дальше: calm\n</ledger>" }],
      [{ text: "", toolCalls: [time(5), finish("conversation")] }]);
    let resultD = await runCampaignTurn(snapshotInput(payload), d.deps);
    assert.equal(resultD.status, "awaiting_confirmation", "a player-visible roll pauses as in the app");
    resultD = await resumeCampaignTurn({ commandId: randomUUID(), campaignId: input.campaignId, operationId: input.operationId, timeline: input.timeline, action: "continue", checkId: null }, d.deps);
    assert.equal(resultD.status, "committed", resultD.failure ?? "");
    assert.match(resultD.narration, /^Марта щурится —\s?и кивает\.$/u);
    assert.equal(d.writer.requests.length, 2);
    assert.equal(d.bookkeeper.requests.length, 1);
    assert.ok(d.live.some((event) => event.type === "status" && event.status === "recording"));
    const rolled = storeD.committed().receipts.find((r) => r.call.name === "roll");
    assert.ok(rolled?.result.ok);
    // Deterministic dice: the same seed gives the same die on another copy.
    const again = seededRandom("fixed"), once = seededRandom("fixed");
    assert.equal(again(1, 21), once(1, 21));
    // The live campaign: nothing changed.
    assert.deepEqual(await c.dump(), before, "the replay never writes back");
    // The sample: the bake-off's shape, the variant inside, the real exchange before.
    const record = { run: "real-replay-test", campaignId: input.campaignId, operationId: input.operationId, turnNo: 2, input: input.input,
      variant: { id: "D", label: "Opus 5.5 writer + Sonnet 5.5 bookkeeper", runtime: "two-pass", writer: "anthropic/claude-opus-5-5", bookkeeper: "anthropic/claude-sonnet-5-5@high", effort: "high" },
      outcome: "committed", narration: resultD.narration, firstWordMs: 12, textDoneMs: 20, recordsDoneMs: 30, durationMs: 30, requests: 3, costUsd: 0, cacheReadShare: null,
      tokens: { input: 0, output: 0, cached: 0, cacheWrite: 0, cacheWrite1h: 0 }, usage: [], receipts: storeD.committed().receipts, diagnostics: storeD.lastCheckpoint().dmLoop.diagnostics, effort: "high", tension: null };
    const sample = buildReplaySample(payload, record, { language: "ru", campaignTitle: "Тест" });
    assert.equal(sample.schemaVersion, 1);
    assert.equal(sample.scene, "t02");
    assert.deepEqual(sample.before, { input: "Оглядываюсь.", narration: "Причал, лодки." });
    assert.equal(sample.variant.id, "D");
    assert.equal(sample.turns[0].input, "Подхожу к Марте.");
    assert.equal(sample.turns[0].narration, resultD.narration);
    assert.ok(sample.turns[0].tools.accepted.includes("advance_time"));
    assert.equal(sample.turns[0].tools.rolls.length, 1);
    assert.ok(!JSON.stringify(sample).includes("<ledger>"), "the ledger never enters a sample");
    assert.ok(!JSON.stringify(sample).includes("privateState"));
  } finally { await c.f.db.close(); }
});

test("§4 the copy is one operation only, refuses a stale lease, and a failed turn on it can be retried", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const { payload } = await snapshotOfNextTurn(c, "Жду.", [{ text: "Ждёшь.", toolCalls: [time(5), finish("quiet")] }]);
    const store = createSnapshotTurnStore(payload);
    const first = replayDeps(store, { writer: "claude-opus-5-5", bookkeeper: null }, [{ failBefore: "transport" }, { text: "Теперь тихо.", toolCalls: [time(5), finish("quiet")] }]);
    const input = snapshotInput(payload);
    const failed = await runCampaignTurn(input, first.deps);
    assert.equal(failed.status, "failed");
    assert.equal(failed.canRetry, true);
    const retried = await resumeCampaignTurn({ commandId: randomUUID(), campaignId: input.campaignId, operationId: input.operationId, timeline: input.timeline, action: "retry", checkId: null }, first.deps);
    assert.equal(retried.status, "committed");
    assert.equal(retried.narration, "Теперь тихо.");
    await assert.rejects(store.begin({ ...input, operationId: randomUUID() }), /one turn per store/);
    await assert.rejects(store.checkpoint({ token: "nope", campaignId: input.campaignId, operationId: input.operationId, expectedRevision: 0 }, store.lastCheckpoint(), "generating"), /stale lease/);
  } finally { await c.f.db.close(); }
});

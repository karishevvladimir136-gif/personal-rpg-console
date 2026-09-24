import test from "node:test";
import assert from "node:assert/strict";
import { livingSmokeProductionInput } from "../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { SMOKE_ACTOR_IDS, smokeUuid } from "../test-fixtures/mega-dm/living-smoke-source-v1.mjs";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { narrationSource, runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { memoryStore, providerDouble, emptyPlan } from "./phase2-turn-store-fixture.mjs";
import { TurnError } from "../src/lib/gameplay/turn-errors.ts";

const scene = () => livingSmokeProductionInput({ probeId: "identity-knowledge-refusal", arm: "full" });
const refusal = { ...emptyPlan(), narration: "Bram refuses an unsafe launch before inspection; Orin does not know Liora's private disclosure." };

test("validated plan intent and bounded private Character cognition reach the real narrator", async () => {
  const { source, input } = scene();
  const { store, state } = memoryStore(source);
  const { provider, calls } = providerDouble(refusal);
  assert.equal((await runTurn(input, { store, provider })).status, "committed");
  const handoff = calls.sources.find((row) => row.stage === "narrate").source;
  const context = JSON.parse(buildContext(handoff, input, "narrate", {
    model: "gpt-5.4", resolution: { changes: [], worldMinutes: source.runtime.worldMinutes,
      configuration: source.runtime.configuration, outcomes: [] }, checks: [],
  }).input);
  const bridge = context.mandatory.narrationBridge;
  assert.equal(bridge.planIntent, refusal.narration);
  const bram = bridge.characters.find((row) => row.actorId === SMOKE_ACTOR_IDS.bram);
  assert.ok(bram.identity.boundaries.some((value) => /inspect|safe/i.test(value)));
  assert.ok(bram.identity.signatures.length > 0 && bram.current.goal);
  assert.ok(bram.episodes.length > 0);
  assert.equal(context.mandatory.validatedResults.changes.length, 0);
  assert.match(buildContext(handoff, input, "narrate", { model: "gpt-5.4" }).instructions,
    /do not independently reverse it/);
  assert.equal(handoff.privateState && Object.keys(handoff.privateState).length, 0);
  const wire = JSON.stringify(context);
  assert.ok(!wire.includes("Private DM cognition is not NPC knowledge"));
  assert.ok(!wire.includes("character_" + SMOKE_ACTOR_IDS.bram));
  assert.ok(!wire.includes("basisOperationId"));
  assert.ok(!wire.includes(smokeUuid(118))); // Liora's private disclosure was not Orin's knowledge.
  assert.equal(state.commits, 1);
});

test("narration has no patch authority and cannot commit invented mechanics or PC decisions", async () => {
  const { source, input } = scene();
  const { store, state } = memoryStore(source);
  const { provider } = providerDouble(refusal);
  provider.narrate = async () => ({ output: { narration: "Talin chooses to spend gold; Bram agrees.",
    visualDescription: "", clarification: null },
    usage: { model: "scripted", inputTokens: 0, outputTokens: 0, calls: 1, latencyMs: 0 } });
  const before = structuredClone(state.source.snapshot.entities);
  const done = await runTurn(input, { store, provider });
  assert.equal(done.status, "committed");
  assert.deepEqual(state.source.snapshot.entities, before);
  assert.equal(state.source.runtime.worldMinutes, source.runtime.worldMinutes);
  // A scripted narrator can still write bad prose. Its text has no state
  // authority; the future live quality review must catch such prose failures.
});

test("retry reuses the stored plan and produces the same cognition bridge", async () => {
  const { source, input } = scene();
  const { store, state } = memoryStore(source);
  const { provider, calls } = providerDouble(refusal);
  const original = provider.narrate;
  let firstBridge;
  provider.narrate = async (s) => {
    firstBridge = structuredClone(s.narrationBridge);
    throw new TurnError("provider", true);
  };
  assert.equal((await runTurn(input, { store, provider })).status, "failed");
  assert.equal(state.commits, 0);
  provider.narrate = original;
  const result = await resumeTurn({ commandId: smokeUuid(991), campaignId: input.campaignId,
    operationId: input.operationId, timeline: input.timeline, action: "retry", checkId: null },
  { store, provider });
  assert.equal(result.status, "committed");
  assert.equal(calls.plan, 1);
  assert.deepEqual(calls.sources.find((row) => row.stage === "narrate").source.narrationBridge, firstBridge);
  assert.equal(state.commits, 1);
});

test("legacy model-free sources and checkpoints remain valid", () => {
  const { source, input } = livingSmokeProductionInput({ probeId: "identity-knowledge-refusal", arm: "doctrine" });
  const handoff = narrationSource(source, input, null);
  const context = JSON.parse(buildContext(handoff, input, "narrate", { model: "gpt-5.4" }).input);
  assert.deepEqual(context.mandatory.narrationBridge, { planIntent: null, characters: [] });
});

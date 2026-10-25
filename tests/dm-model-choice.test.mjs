import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import {
  registryVersionFor,
  resolveExecutionProfile,
  validateExecutionProfile,
  validateModelSelection,
  validateRuntimePolicy,
} from "../src/lib/model-runtime/registry.ts";
import { astraTurnProfiles, pinAstraTurnModel, withAstraTurnPin } from "../src/lib/production/dm-turn-pin.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";

const opus = { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "medium" };
const astra = { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" };
const policy = (revision, taskOverrides, primary = null) =>
  ({ schemaVersion: 1, revision, primary, taskOverrides });

test("only the dm.turn task may choose Claude Opus 5.5; every other task stays OpenAI-only", () => {
  // Fix run F (item 10): an unset effort is Opus's own default — high, as a campaign plays.
  assert.deepEqual(validateModelSelection({ ...opus, reasoning: null }, "dm.turn"), { ...opus, reasoning: "high" });
  assert.deepEqual(validateModelSelection({ ...astra, reasoning: null }, "dm.turn"), astra);
  for (const [value, task] of [
    [opus, undefined], [opus, "dm.plan"], [opus, "world.resolve"], [opus, "memory.summary"],
    [{ ...opus, reasoning: "none" }, "dm.turn"], [{ ...opus, modelId: "claude-opus-5" }, "dm.turn"],
    [{ providerId: "openai", modelId: "gpt-5.4", reasoning: null }, "dm.turn"],
  ]) assert.throws(() => validateModelSelection(value, task), { code: "configuration" }, JSON.stringify([value, task]));
  assert.throws(() => validateRuntimePolicy(policy(1, {}, opus)), { code: "configuration" });
  assert.throws(() => validateRuntimePolicy(policy(1, { "dm.plan": opus })), { code: "configuration" });
  assert.deepEqual(validateRuntimePolicy(policy(2, { "dm.turn": opus })).taskOverrides["dm.turn"], opus);
});

test("dm.turn defaults to Astra, never inherits the OpenAI primary, and pins its own registry version", () => {
  const id = randomUUID();
  const unset = resolveExecutionProfile({ task: "dm.turn", profileId: id, campaignPolicy: null, globalDefault: null });
  assert.deepEqual({ providerId: unset.providerId, modelId: unset.modelId, reasoning: unset.reasoning }, astra);
  assert.equal(unset.registryVersion, "dm-models-v1");
  const chosen = resolveExecutionProfile({ task: "dm.turn", profileId: id,
    campaignPolicy: policy(3, { "dm.turn": { ...opus, reasoning: null } },
      { providerId: "openai", modelId: "gpt-5.4", reasoning: "low" }), globalDefault: null });
  assert.equal(chosen.providerId, "anthropic");
  assert.equal(chosen.reasoning, "high");
  assert.equal(chosen.policyRevision, 3);
  const inheritsPrimary = resolveExecutionProfile({ task: "dm.turn", profileId: id,
    campaignPolicy: policy(4, {}, { providerId: "openai", modelId: "gpt-5.4", reasoning: "low" }), globalDefault: null });
  assert.equal(inheritsPrimary.modelId, "gpt-6-astra");
  assert.equal(registryVersionFor("dm.plan"), "openai-responses-v1");
  assert.throws(() => validateExecutionProfile({ ...chosen, registryVersion: "openai-responses-v1" }, "dm.turn"),
    { code: "configuration" });
  const pins = astraTurnProfiles(policy(5, { "dm.turn": opus }));
  assert.equal(pins["dm.turn"].modelId, "claude-opus-5-5");
  assert.deepEqual([pins["dm.plan"].modelId, pins["dm.plan"].reasoning], ["gpt-6-astra", "high"]);
  assert.deepEqual([pins["dm.narrate"].modelId, pins["dm.narrate"].reasoning], ["gpt-6-astra", "medium"]);
  assert.equal(validateExecutionProfile(pins["dm.narrate"], "dm.narrate").registryVersion, "openai-responses-v1");
});

// The same preparation as takenOver() (tests/astra-freedom-fixture.mjs), with
// an optional owner configuration before the takeover: after takeover the
// World RPC accepts reads only, so campaign settings are frozen from then on.
async function astraTakeover(f) {
  const foundation = await f.one("select world from rpg_private.world_foundations where campaign_id=$1", [f.cid]);
  const hero = foundation.world.actors.find((actor) => actor.control === "player").entityId;
  const play = await f.runtime(f.cid, "play");
  await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid, expectedRevision: play.revision,
    configuration: { profile: "console-basic-v1", controlledEntityIds: [hero],
      presentEntityIds: foundation.world.actors.map((actor) => actor.entityId),
      nearbyStorageIds: [], safeLocationIds: [], itemRules: [] } });
  const timeline = await f.fence(f.cid);
  const row = await f.one(`select r.revision runtime_revision,p.revision public_revision,
    w.revision world_revision,encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
    t.head_manifest_id head_id,(select coalesce(max(sequence),0) from rpg_private.world_events
      where campaign_id=r.campaign_id) world_event_sequence
    from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id)
    join rpg_private.world_foundations w using(campaign_id)
    join rpg_private.timeline_campaigns c using(campaign_id)
    join rpg_private.timelines t on t.id=c.active_timeline_id where r.campaign_id=$1`, [f.cid]);
  await f.runtime(f.cid, "astra_takeover", { requestId: randomUUID(), campaignId: f.cid, timeline,
    expectedRuntimeRevision: row.runtime_revision, expectedWorldRevision: row.world_revision,
    expectedPublicRevision: row.public_revision, expectedHeadId: row.head_id,
    expectedWorldDigest: row.world_digest, expectedWorldEventSequence: row.world_event_sequence });
}

async function campaign(beforeTakeover = async () => {}) {
  const f = await setup(undefined, "en", Infinity);
  await f.create();
  await f.startOpening();
  const world = async (action, payload = {}) => (await f.one(
    "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
    [f.owner, f.cid, action, JSON.stringify(payload), JSON.stringify(await f.fence(f.cid))])).result;
  const configure = async (executionPolicy) => {
    const snapshot = await world("read");
    return world("owner_configure", {
      command: { operationId: randomUUID(), campaignId: f.cid, timeline: snapshot.timeline,
        expectedRevision: snapshot.revision, expectedRuntimeRevision: snapshot.runtimeRevision,
        expectedHeadId: snapshot.headId },
      worldPolicy: snapshot.world.policy, ruleset: WORLD_LOGIC_REF, executionPolicy, reconciliation: null,
    });
  };
  const nextRevision = async () => ((await world("read")).executionPolicy?.revision ?? 0) + 1;
  await beforeTakeover({ world, configure, nextRevision });
  await astraTakeover(f);
  // The campaign setting as the pin sees it; a test may swap it to model a
  // settings change that takeover-frozen campaigns cannot make through the RPC.
  const settings = { read: async () => (await world("read")).executionPolicy };
  const profileRpc = async (args) => {
    try {
      return { data: (await f.one("select public.rpg_execution_profile($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [args.p_owner_id, args.p_campaign_id, args.p_operation_id,
          args.p_profiles === null ? null : JSON.stringify(args.p_profiles), JSON.stringify(args.p_timeline)])).result };
    } catch (error) { return { error: { message: error.message } }; }
  };
  const rpc = async (args) => {
    try { return { data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) { return { error: { message: error.message, code: error.code } }; }
  };
  const memoryRpc = async (args) => {
    try { return { data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) { return { error: { message: error.message, code: error.code } }; }
  };
  const usage = { model: "gpt-6-astra", inputTokens: 0, outputTokens: 0, calls: 1, latencyMs: 0 };
  const provider = {
    next: async (_context, _input, _receipts, _checks, _caps, source) => ({ usage, output: { type: "final", call: null,
      final: { worldMinutes: source.runtime.worldMinutes, changes: [], outcomes: [], privatePatches: [], effects: [],
        ...(source.astraResponseMode === "private-informed" ? {} : { publicNarration: {
          beats: [{ text: "The square goes about its morning.", requiresEffects: [] }],
          visualDescription: { text: "", requiresEffects: [] } } }) } } }),
    narrate: async () => ({ usage, output: { narration: "The square goes about its morning.",
      visualDescription: "", clarification: null } }),
  };
  const deps = async (store) => {
    const timeline = await f.fence(f.cid);
    const pinned = withAstraTurnPin(store ?? createRpcTurnStore(f.owner, rpc, "gpt-6-astra", timeline, true,
      { astraResponseContract: "unified-v1" }), (operationId) => pinAstraTurnModel(profileRpc,
      { ownerId: f.owner, campaignId: f.cid, operationId, timeline }, () => settings.read()));
    return { store: pinned, memory: createRpcMemoryStore(f.owner, memoryRpc, timeline), provider,
      summaries: { summarize: async (job) => ({ usage, output: { schemaVersion: 1,
        selections: job.sources.map((s) => ({ sourceId: s.id, version: s.ref.version })) } }) } };
  };
  const input = async (store) => {
    const play = await store.readPlay(f.cid);
    return { operationId: randomUUID(), campaignId: f.cid, timeline: play.timeline, expectedRevision: play.revision,
      mode: "game", input: "I look around the square.", companionId: null, listenerIds: [], mechanic: null };
  };
  const pins = async (operationId) => Object.fromEntries((await f.query(
    "select task,profile from rpg_private.execution_profiles where campaign_id=$1 and operation_id=$2",
    [f.cid, operationId])).map((row) => [row.task, row.profile]));
  return { f, world, configure, nextRevision, settings, profileRpc, rpc, deps, input, pins };
}
const chooseOpus = async ({ configure, nextRevision }) =>
  configure(policy(await nextRevision(), { "dm.turn": opus }));

test("SQL stores a Claude Opus 5.5 dm.turn choice and rejects it everywhere else", async () => {
  const outcomes = [];
  const c = await campaign(async ({ world, configure, nextRevision }) => {
    const saved = await configure(policy(await nextRevision(), { "dm.turn": opus }));
    assert.deepEqual(saved.executionPolicy.taskOverrides["dm.turn"], opus);
    for (const bad of [
      policy(await nextRevision(), {}, opus),
      policy(await nextRevision(), { "dm.plan": opus }),
      policy(await nextRevision(), { "dm.turn": { ...opus, modelId: "claude-opus-5" } }),
      policy(await nextRevision(), { "dm.turn": { ...opus, reasoning: "none" } }),
      policy(await nextRevision(), { "dm.turn": { providerId: "openai", modelId: "gpt-5.4", reasoning: null } }),
    ]) outcomes.push(await configure(bad).then(() => "accepted", (error) => error.message));
    assert.deepEqual((await world("read")).executionPolicy.taskOverrides["dm.turn"], opus);
  });
  try {
    assert.ok(outcomes.length === 5 && outcomes.every((outcome) => /rpg_validation/.test(outcome)), outcomes.join(", "));
    // The choice survives the takeover; settings are read-only afterwards.
    assert.deepEqual((await c.world("read")).executionPolicy.taskOverrides["dm.turn"], opus);
    await assert.rejects(c.configure(policy(await c.nextRevision(), {})), /rpg_conflict/);
  } finally { await c.f.db.close(); }
});

test("an Astra turn with Opus chosen still runs on Astra and records both the choice and the served models", async () => {
  const c = await campaign(chooseOpus);
  try {
    const deps = await c.deps();
    const input = await c.input(deps.store);
    const result = await runAstraTurn(input, deps);
    assert.equal(result.status, "committed");
    const pins = await c.pins(input.operationId);
    assert.deepEqual(Object.keys(pins).sort(), ["dm.narrate", "dm.plan", "dm.turn"]);
    assert.deepEqual([pins["dm.turn"].providerId, pins["dm.turn"].modelId, pins["dm.turn"].reasoning,
      pins["dm.turn"].registryVersion], ["anthropic", "claude-opus-5-5", "medium", "dm-models-v1"]);
    assert.deepEqual([pins["dm.plan"].modelId, pins["dm.plan"].reasoning], ["gpt-6-astra", "high"]);
    assert.deepEqual([pins["dm.narrate"].modelId, pins["dm.narrate"].reasoning], ["gpt-6-astra", "medium"]);
    const row = await c.f.one("select runtime_identity,checkpoint from rpg_private.turns where id=$1", [input.operationId]);
    assert.equal(row.runtime_identity, "astra-primary-v1");
    assert.ok(row.checkpoint.usage.every((entry) => entry.model === "gpt-6-astra"));
    // A replay of the committed operation neither re-pins nor fails.
    assert.equal((await runAstraTurn(input, deps)).status, "committed");
    assert.deepEqual(await c.pins(input.operationId), pins);
  } finally { await c.f.db.close(); }
});

test("a retry keeps the pinned model even if the campaign choice changed between attempts", async () => {
  const c = await campaign(chooseOpus);
  try {
    const timeline = await c.f.fence(c.f.cid);
    const store = createRpcTurnStore(c.f.owner, c.rpc, "gpt-6-astra", timeline, true, { astraResponseContract: "unified-v1" });
    const commit = store.commit;
    store.commit = async () => { throw new Error("synthetic commit interruption"); };
    const deps = await c.deps(store);
    const input = await c.input(store);
    const failed = await runAstraTurn(input, deps);
    assert.equal(failed.status, "failed");
    assert.equal(failed.canRetry, true);
    assert.equal((await c.pins(input.operationId))["dm.turn"].modelId, "claude-opus-5-5");
    // The campaign choice changes to Astra before the retry.
    c.settings.read = async () => policy(9, { "dm.turn": astra });
    store.commit = commit;
    const retried = await resumeAstraTurn({ commandId: randomUUID(), campaignId: c.f.cid,
      operationId: input.operationId, timeline, action: "retry", checkId: null }, await c.deps(store));
    assert.equal(retried.status, "committed");
    const pins = await c.pins(input.operationId);
    assert.equal(pins["dm.turn"].modelId, "claude-opus-5-5");
    // A new operation picks up the new choice.
    const next = await c.input(store);
    assert.equal((await runAstraTurn(next, await c.deps(store))).status, "committed");
    assert.equal((await c.pins(next.operationId))["dm.turn"].modelId, "gpt-6-astra");
  } finally { await c.f.db.close(); }
});

test("a failing pin is logged and never fails the Astra turn", async () => {
  const c = await campaign();
  const logged = [];
  const info = console.info;
  console.info = (line) => logged.push(line);
  try {
    const timeline = await c.f.fence(c.f.cid);
    const deps = await c.deps();
    deps.store = withAstraTurnPin(createRpcTurnStore(c.f.owner, c.rpc, "gpt-6-astra", timeline, true,
      { astraResponseContract: "unified-v1" }), async () => { throw new Error("synthetic pin outage"); });
    const input = await c.input(deps.store);
    assert.equal((await runAstraTurn(input, deps)).status, "committed");
    assert.deepEqual(await c.pins(input.operationId), {});
    assert.ok(logged.some((line) => String(line).includes("dm_turn_model_pin_failed")));
    assert.ok(!logged.some((line) => String(line).includes("synthetic pin outage")));
  } finally { console.info = info; await c.f.db.close(); }
});

test("SQL rejects a dm.turn pin with a foreign model, a wrong registry or a missing served profile", async () => {
  const c = await campaign();
  try {
    const timeline = await c.f.fence(c.f.cid);
    const store = createRpcTurnStore(c.f.owner, c.rpc, "gpt-6-astra", timeline, true, { astraResponseContract: "unified-v1" });
    const input = await c.input(store);
    await store.begin(input, "astra-primary-v1", "unified-v1");
    assert.ok(await store.claim(c.f.cid, input.operationId));
    const base = { p_owner_id: c.f.owner, p_campaign_id: c.f.cid, p_operation_id: input.operationId, p_timeline: timeline };
    const good = astraTurnProfiles(null);
    for (const profiles of [
      { ...good, "dm.turn": { ...good["dm.turn"], modelId: "claude-opus-5" } },
      { ...good, "dm.turn": { ...good["dm.turn"], registryVersion: "openai-responses-v1" } },
      { "dm.turn": good["dm.turn"], "dm.plan": good["dm.plan"] },
      { ...good, "dm.plan": { ...good["dm.plan"], providerId: "anthropic", modelId: "claude-opus-5-5" } },
    ]) {
      const response = await c.profileRpc({ ...base, p_profiles: profiles });
      assert.ok(response.error, JSON.stringify(Object.keys(profiles)));
    }
    assert.deepEqual(await c.pins(input.operationId), {});
    assert.equal((await c.profileRpc({ ...base, p_profiles: good })).data["dm.turn"].modelId, "gpt-6-astra");
    // Read-first: a later, different pin request returns the original pin.
    const later = astraTurnProfiles(policy(1, { "dm.turn": opus }));
    assert.equal((await c.profileRpc({ ...base, p_profiles: later })).data["dm.turn"].modelId, "gpt-6-astra");
  } finally { await c.f.db.close(); }
});

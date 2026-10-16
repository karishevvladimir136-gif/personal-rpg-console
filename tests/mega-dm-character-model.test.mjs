import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { parseCharacterModel, validateCharacterPatches, characterPacket, privateStateWithoutCharacterModels } from "../src/lib/gameplay/character-model.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";

function model(actorId, updates = {}) {
  return {
    schemaVersion: 1, actorId, basisOperationId: null,
    identity: { values: ["keeps promises"], wants: ["repair the ferry"], boundaries: ["refuses coercion"],
      loyalties: ["river crew"], signatures: ["jokes when anxious"], observableVoice: "Dry humor and short replies." },
    current: { goal: null, stress: "settled", preoccupation: null, obligation: null },
    beliefs: [], relationships: [], episodes: [], ...updates,
  };
}
function memory(source, evidence, actorId, knownBy = [actorId]) {
  const row = { campaignId: source.snapshot.campaign.id, ref: { ...evidence, campaignId: source.snapshot.campaign.id },
    knownBy, current: true, status: "valid" };
  source.memory = { campaignId: source.snapshot.campaign.id, complete: true, exactEvents: [row],
    historical: [], privateHistorical: [], checkpoint: null, publicSummary: null, privateSummary: null };
}

test("bounded private Character Packet is deterministic, actor-scoped and spoiler-safe", () => {
  const { source, input } = runtimeFixture();
  const player = source.snapshot.entities[0];
  const npc = { ...player, id: randomUUID(), kind: "companion", name: "Mara" };
  const other = { ...npc, id: randomUUID(), name: "Bram" };
  source.snapshot.entities.push(npc, other);
  source.runtime.configuration.presentEntityIds.push(npc.id);
  const ref = { kind: "scene", id: randomUUID(), version: "1", part: 0, visibility: "public" };
  const old = model(npc.id, { beliefs: [{ text: "The PC may be afraid", confidence: "tentative", aboutActorId: player.id, evidence: ref }] });
  source.privateState.npc = { [`character_${npc.id}`]: JSON.stringify(old), [`character_${other.id}`]: JSON.stringify(model(other.id)) };
  memory(source, ref, npc.id);
  input.input = "I ask Mara and Bram about the ferry.";
  const packet = characterPacket(source, input, "plan");
  assert.equal(packet.length, 2);
  assert.equal(packet[0].beliefs[0].text, "The PC may be afraid");
  assert.deepEqual(characterPacket(source, input, "plan"), packet);
  assert.equal(JSON.stringify(privateStateWithoutCharacterModels(source)).includes("keeps promises"), false);
  const narrate = characterPacket(source, input, "narrate");
  assert.deepEqual(narrate.map((entry) => entry.actorId), [npc.id]);
  assert.equal(JSON.stringify(narrate).includes("The PC may be afraid"), false);
  assert.equal(JSON.stringify(narrate).includes("Dry humor"), true);
  source.memory = undefined; // legacy source still receives only bounded identity, never the raw namespace
  const built = JSON.parse(buildContext(source, input, "plan", { model: "gpt-5.4-mini" }).input);
  assert.equal(JSON.stringify(built).includes("keeps promises"), true);
  assert.equal(JSON.stringify(built.mandatory.privateState).includes("keeps promises"), false);
  memory(source, ref, npc.id);
  input.mode = "companion"; input.companionId = npc.id;
  assert.deepEqual(characterPacket(source, input, "plan").map((entry) => entry.actorId), [npc.id]);
  memory(source, ref, npc.id, []);
  assert.deepEqual(characterPacket(source, input, "plan")[0].beliefs, []);
});

test("modeled addressed actor outranks crowded-scene order, with stable ties and a two-actor byte bound", () => {
  const { source, input } = runtimeFixture();
  const template = source.snapshot.entities[0];
  const actors = ["Marcus", "Elena", "Bram"].map((name) => ({
    ...template, id: randomUUID(), kind: "companion", name,
  }));
  source.snapshot.entities.push(...actors);
  source.runtime.configuration.presentEntityIds.push(...actors.map((actor) => actor.id));
  source.privateState.npc = Object.fromEntries(actors.map((actor) => [
    `character_${actor.id}`, JSON.stringify(model(actor.id)),
  ]));
  input.input = "Bram, what do you think?";
  const selected = characterPacket(source, input, "plan");
  // Stage 4 lifted the two-actor cap (eight actors, 48 KB): all three modelled
  // companions travel, the addressed one first, ties stable.
  assert.equal(selected.length, 3);
  assert.equal(selected[0].actorId, actors[2].id);
  const tieWinner = [actors[0].id, actors[1].id].sort()[0];
  assert.equal(selected[1].actorId, tieWinner);
  source.snapshot.entities.reverse();
  assert.deepEqual(characterPacket(source, input, "plan"), selected);
  assert.ok(Buffer.byteLength(JSON.stringify(selected), "utf8") <= 9300);

  source.runtime.configuration.controlledEntityIds.push(actors[2].id);
  assert.equal(characterPacket(source, input, "plan").some((row) => row.actorId === actors[2].id), false);
  source.runtime.configuration.controlledEntityIds.pop();
  source.runtime.configuration.presentEntityIds = [template.id, actors[0].id, actors[1].id];
  assert.equal(characterPacket(source, input, "plan")[0].actorId, actors[2].id);
  assert.equal(characterPacket(source, input, "narrate").some((row) => row.actorId === actors[2].id), false);
  // Stage 2b relaxed the bounds to anti-garbage limits (600-character voice).
  assert.doesNotThrow(() => parseCharacterModel(model(actors[2].id, {
    identity: { ...model(actors[2].id).identity, observableVoice: "x".repeat(181) },
  })));
  assert.throws(() => parseCharacterModel(model(actors[2].id, {
    identity: { ...model(actors[2].id).identity, observableVoice: "x".repeat(601) },
  })), { code: "validation" });
});

test("model filtering precedes the cap even when earlier eligible actors have no model", () => {
  const { source, input } = runtimeFixture();
  const template = source.snapshot.entities[0];
  const actors = ["Marcus", "Elena", "Bram"].map((name) => ({
    ...template, id: randomUUID(), kind: "npc", name,
  }));
  source.snapshot.entities.push(...actors);
  source.runtime.configuration.presentEntityIds.push(...actors.map((actor) => actor.id));
  source.privateState.npc = { [`character_${actors[2].id}`]: JSON.stringify(model(actors[2].id)) };
  input.input = "Bram, what do you think?";
  assert.deepEqual(characterPacket(source, input, "plan").map((row) => row.actorId), [actors[2].id]);
  assert.deepEqual(characterPacket(source, input, "narrate").map((row) => row.actorId), [actors[2].id]);
});

test("SQL commit independently rejects controlled-actor Character Model patches without partial state", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const fence = await f.fence(w.cid);
    const prior = model(w.npc);
    const original = (await f.one("select public.rpg_character_model($1,$2,'read',$3::jsonb,$4::jsonb) result", [
      f.owner, w.cid, JSON.stringify({ actorId: w.npc }), JSON.stringify(fence),
    ])).result;
    await f.one("select public.rpg_character_model($1,$2,'correct',$3::jsonb,$4::jsonb)", [f.owner, w.cid,
      JSON.stringify({ requestId: randomUUID(), actorId: w.npc, expectedRevision: original.revision, model: prior }), JSON.stringify(fence)]);
    const play = await f.runtime(w.cid, "play");
    await f.runtime(w.cid, "configure", {
      requestId: randomUUID(), campaignId: w.cid, expectedRevision: play.revision,
      configuration: { ...play.configuration, controlledEntityIds: [w.hero, w.npc] },
    });
    const input = { operationId: randomUUID(), campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision, mode: "game", input: "I ask Nera to wait.",
      companionId: null, listenerIds: [], mechanic: null };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    const updated = model(w.npc, { basisOperationId: input.operationId,
      current: { ...prior.current, stress: "strained" } });
    const patch = { kind: "npc", key: `character_${w.npc}`, operation: "set", value: JSON.stringify(updated), amount: null };
    const plan = { narration: "", checks: [], publicPatches: [], privatePatches: [patch],
      visualDescription: "", clarification: null, guidanceProposal: null };
    await f.runtime(w.cid, "checkpoint", { ...claim.lease, checkpoint: { ...claim.turn.checkpoint, plan }, status: "generating" });
    const packet = { narration: "Nera waits.", visualDescription: "", resolution: {
      changes: [], worldMinutes: claim.source.runtime.worldMinutes + 1,
      configuration: claim.source.runtime.configuration, outcomes: [],
    }, privatePatches: [patch], checks: [], guidanceProposal: null };
    await assert.rejects(f.runtime(w.cid, "commit", { ...claim.lease, packet }), /rpg_validation/);
    assert.equal((await f.runtime(w.cid, "play")).worldMinutes, claim.source.runtime.worldMinutes);
    const after = (await f.one("select public.rpg_character_model($1,$2,'read',$3::jsonb,$4::jsonb) result", [
      f.owner, w.cid, JSON.stringify({ actorId: w.npc }), JSON.stringify(fence),
    ])).result;
    assert.deepEqual(after.model, prior);
    assert.equal((await f.one("select count(*)::int n from rpg_private.runtime_events where operation_id=$1", [input.operationId])).n, 0);
  } finally { await f.db.close(); }
});

test("ordinary character changes require immutable identity and positive evidence", () => {
  const { source, input } = runtimeFixture();
  const player = source.snapshot.entities[0];
  const npc = { ...player, id: randomUUID(), kind: "npc", name: "Mara" };
  source.snapshot.entities.push(npc);
  source.runtime.configuration.presentEntityIds.push(npc.id);
  const original = model(npc.id);
  source.privateState.npc = { [`character_${npc.id}`]: JSON.stringify(original) };
  const patch = (next) => [{ kind: "npc", key: `character_${npc.id}`, operation: "set", value: JSON.stringify(next), amount: null }];
  assert.doesNotThrow(() => validateCharacterPatches(source, input, patch(model(npc.id, { basisOperationId: input.operationId, current: { ...original.current, stress: "strained" } }))));
  assert.throws(() => validateCharacterPatches(source, input, patch(model(npc.id, { basisOperationId: input.operationId, identity: { ...original.identity, values: ["obeys everyone"] } }))), { code: "validation" });
  const ref = { kind: "scene", id: randomUUID(), version: "1", part: 0, visibility: "public" };
  const belief = { text: "The PC hides fear", confidence: "tentative", aboutActorId: player.id, evidence: ref };
  assert.throws(() => validateCharacterPatches(source, input, patch(model(npc.id, { basisOperationId: input.operationId, beliefs: [belief] }))), { code: "validation" });
  memory(source, ref, npc.id);
  assert.doesNotThrow(() => validateCharacterPatches(source, input, patch(model(npc.id, { basisOperationId: input.operationId, beliefs: [belief] }))));
  memory(source, ref, npc.id, [player.id]);
  assert.throws(() => validateCharacterPatches(source, input, patch(model(npc.id, { basisOperationId: input.operationId, beliefs: [belief] }))), { code: "validation" });
  assert.throws(() => parseCharacterModel(model(player.id, { relationships: [{ actorId: player.id }] })), { code: "validation" });
});

test("owner correction uses existing DM-private revision and save vault; no public model leakage", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const fence = await f.fence(w.cid);
    const initial = model(w.npc);
    const rpc = (action, payload, owner = f.owner, timeline = fence) => f.one(
      "select public.rpg_character_model($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [owner, w.cid, action, JSON.stringify(payload), JSON.stringify(timeline)],
    ).then((row) => row.result);
    const requestId = randomUUID();
    const startingRevision = (await rpc("read", { actorId: w.npc })).revision;
    const command = { requestId, actorId: w.npc, expectedRevision: startingRevision, model: initial };
    const applied = await rpc("correct", command);
    assert.equal(applied.revision, startingRevision + 1);
    assert.deepEqual(await rpc("correct", command), applied);
    assert.equal((await rpc("read", { actorId: w.npc })).model.identity.values[0], "keeps promises");
    assert.equal(JSON.stringify(await f.saves(w.cid, "campaign")).includes("keeps promises"), false);
    assert.equal(JSON.stringify(await f.runtime(w.cid, "play")).includes("keeps promises"), false);
    await assert.rejects(rpc("correct", { ...command, requestId: randomUUID() }), /rpg_validation/);
    await assert.rejects(rpc("read", { actorId: w.npc }, f.other), /rpg_forbidden/);
    const save = await f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name: "Character checkpoint" }));
    const revised = model(w.npc, { current: { ...initial.current, goal: "cross the inlet" } });
    assert.equal((await rpc("correct", { requestId: randomUUID(), actorId: w.npc, expectedRevision: applied.revision, model: revised })).revision, applied.revision + 1);
    await f.saves(w.cid, "load", await f.command(w.cid, { saveId: save.saveId, label: "Restore model", recovery: false }));
    const restored = await rpc("read", { actorId: w.npc }, f.owner, await f.fence(w.cid));
    assert.equal(restored.model.current.goal, null);
    assert.equal(restored.model.identity.values[0], "keeps promises");
  } finally { await f.db.close(); }
});

test("model-generated update shares atomic turn receipt and companion gets only its own model", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const fence = await f.fence(w.cid);
    const first = model(w.npc);
    const read = async (actorId) => (await f.one("select public.rpg_character_model($1,$2,'read',$3::jsonb,$4::jsonb) result", [
      f.owner, w.cid, JSON.stringify({ actorId }), JSON.stringify(fence),
    ])).result;
    const corrected = await read(w.npc);
    await f.one("select public.rpg_character_model($1,$2,'correct',$3::jsonb,$4::jsonb)", [f.owner, w.cid,
      JSON.stringify({ requestId: randomUUID(), actorId: w.npc, expectedRevision: corrected.revision, model: first }), JSON.stringify(fence)]);
    const input = { operationId: randomUUID(), campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision, mode: "game",
      input: "I ask Nera to wait.", companionId: null, listenerIds: [], mechanic: null };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    const updated = model(w.npc, { basisOperationId: input.operationId, current: { ...first.current, stress: "strained" } });
    const patch = { kind: "npc", key: `character_${w.npc}`, operation: "set", value: JSON.stringify(updated), amount: null };
    const plan = { narration: "", checks: [], publicPatches: [], privatePatches: [patch], visualDescription: "", clarification: null, guidanceProposal: null };
    await f.runtime(w.cid, "checkpoint", { ...claim.lease, checkpoint: { ...claim.turn.checkpoint, plan }, status: "generating" });
    const packet = { narration: "Nera agrees to wait.", visualDescription: "", resolution: {
      changes: [], worldMinutes: claim.source.runtime.worldMinutes, configuration: claim.source.runtime.configuration, outcomes: [],
    }, privatePatches: [patch], checks: [], guidanceProposal: null };
    const committed = await f.runtime(w.cid, "commit", { ...claim.lease, packet });
    assert.equal(committed.status, "committed");
    assert.equal((await read(w.npc)).model.current.stress, "strained");
    assert.deepEqual(await f.runtime(w.cid, "commit", { ...claim.lease, packet }), committed);
    assert.equal((await read(w.npc)).model.current.stress, "strained");
    const companionInput = { ...input, operationId: randomUUID(), expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "companion", input: "How was the wait?", companionId: w.npc, listenerIds: [] };
    await f.runtime(w.cid, "begin", companionInput);
    const companionClaim = await f.runtime(w.cid, "claim", { operationId: companionInput.operationId });
    assert.equal(companionClaim.source.privateState.npc[`character_${w.npc}`], JSON.stringify(updated));
    assert.equal(Object.keys(companionClaim.source.privateState.npc).length, 1);
    assert.equal(JSON.stringify(companionClaim.turn.public).includes("keeps promises"), false);
  } finally { await f.db.close(); }
});

test("foreign actor, unsupported evidence and stale pending turn fail without partial settlement", async () => {
  const f = await fixture();
  try {
    const w = await world(f, "Character one");
    const foreign = await world(f, "Character two");
    const fence = await f.fence(w.cid);
    const command = (actorId, body, expectedRevision, requestId = randomUUID()) => f.one(
      "select public.rpg_character_model($1,$2,'correct',$3::jsonb,$4::jsonb) result",
      [f.owner, w.cid, JSON.stringify({ requestId, actorId, expectedRevision, model: body }), JSON.stringify(fence)],
    );
    const initialRevision = (await f.one("select revision from rpg_private.dm_state where campaign_id=$1", [w.cid])).revision;
    await assert.rejects(command(foreign.npc, model(foreign.npc), initialRevision), /rpg_validation/);
    const unsupported = model(w.npc, { beliefs: [{ text: "Secret rumor", confidence: "supported", aboutActorId: null,
      evidence: { kind: "scene", id: randomUUID(), version: "1", part: 0, visibility: "private" } }] });
    await assert.rejects(command(w.npc, unsupported, initialRevision), /rpg_validation/);
    assert.equal((await f.one("select revision from rpg_private.dm_state where campaign_id=$1", [w.cid])).revision, initialRevision);
    await command(w.npc, model(w.npc), initialRevision);
    const input = { operationId: randomUUID(), campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision, mode: "game", input: "I wait at the quay.",
      companionId: null, listenerIds: [], mechanic: null };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    const pinned = claim.source.privateState.npc[`character_${w.npc}`];
    const before = await f.runtime(w.cid, "play");
    const revision = (await f.one("select revision from rpg_private.dm_state where campaign_id=$1", [w.cid])).revision;
    await command(w.npc, model(w.npc, { current: { goal: "inspect the quay", stress: "settled", preoccupation: null, obligation: null } }), revision);
    const packet = { narration: "The quay remains quiet.", visualDescription: "", resolution: {
      changes: [], worldMinutes: before.worldMinutes + 1, configuration: before.configuration, outcomes: [],
    }, privatePatches: [], checks: [], guidanceProposal: null };
    await assert.rejects(f.runtime(w.cid, "commit", { ...claim.lease, packet }), /rpg_conflict/);
    assert.equal((await f.runtime(w.cid, "play")).worldMinutes, before.worldMinutes);
    assert.equal(claim.source.privateState.npc[`character_${w.npc}`], pinned);
    assert.equal((await f.one("select count(*)::int n from rpg_private.runtime_events where operation_id=$1", [input.operationId])).n, 0);
  } finally { await f.db.close(); }
});

test("populated pre-Cognitive save and seven-field Style upgrade without invented character history", async () => {
  const f = await fixture(18);
  try {
    const w = await world(f);
    const old = await f.saves(w.cid, "campaign");
    const saved = await f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name: "Pre-Character" }));
    const folder = new URL("../supabase/migrations/", import.meta.url);
    for (const name of ["202609250019_mega_dm_cognitive_craft.sql", "202609250020_mega_dm_character_models.sql"])
      await f.db.exec(await readFile(new URL(name, folder), "utf8"));
    assert.deepEqual(await f.saves(w.cid, "campaign"), old);
    assert.equal((await f.one("select contents ? 'npc' as has_model from rpg_private.dm_state where campaign_id=$1", [w.cid])).has_model, false);
    const input = { operationId: randomUUID(), campaignId: w.cid, expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game", input: "I look across the bridge.", companionId: null, listenerIds: [], mechanic: null };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    assert.equal(claim.source.craft.style.emotionalTone, "hopeful_humanist");
    assert.equal(claim.source.craft.style.tragedyIntensity, "normal");
    assert.deepEqual(await f.saves(w.cid, "read"), await f.saves(w.cid, "read"));
    assert.ok(saved.saveId);
  } finally { await f.db.close(); }
});

test("approved cognitive Craft is bilingual, pinned, bounded and new Style never defaults to bleak", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const view = (await f.one("select public.rpg_dm_craft($1,'read','{}'::jsonb) result", [f.owner])).result;
    const active = view.effective.find((entry) => entry.key === "core-doctrine");
    const doctrine = view.versions.find((entry) => entry.id === active.activeVersionId);
    assert.equal(doctrine.version, 2);
    assert.match(doctrine.en.guidance, /agency|connection|hope/);
    assert.match(doctrine.ru.guidance, /свободу|связь|надежду/);
    assert.match(doctrine.en.avoid, /real owner/);
    for (const key of ["cognitive-world", "living-characters", "afterglow-rhythm"])
      assert.ok(view.effective.some((entry) => entry.key === key));
    const selected = (await f.one("select rpg_private.dm_craft_stage_v2($1,$2,'plan','I ask my companion about trust after our loss') result", [f.owner, w.cid])).result;
    assert.ok(selected.length <= 2);
    assert.ok(selected.some((card) => card.key === "living-characters"));
    const ru = (await f.one("select rpg_private.dm_craft_stage_v2($1,$2,'plan','Я говорю со спутником после потери') result", [f.owner, w.cid])).result;
    assert.ok(ru.some((card) => card.key === "living-characters" || card.key === "afterglow-rhythm"));
    const input = { operationId: randomUUID(), campaignId: w.cid, expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game", input: "I ask my companion about the loss.", companionId: null, listenerIds: [], mechanic: null };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    assert.equal(claim.source.craft.doctrine.id, doctrine.id);
    assert.equal(claim.source.craft.style.emotionalTone, "hopeful_humanist");
    assert.equal(claim.source.craft.style.tragedyIntensity, "normal");
    assert.equal(JSON.stringify(claim.turn.public).includes("hopeful_humanist"), false);
  } finally { await f.db.close(); }
});

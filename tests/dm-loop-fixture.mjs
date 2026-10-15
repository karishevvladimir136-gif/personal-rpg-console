// A fresh campaign on disposable PGlite (World → character → opening) that
// plays on dm-loop-v1 from its first scene, with a scripted DmModel.
import { randomUUID } from "node:crypto";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runDmLoopTurn, resumeDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { dmLoopPinFromProfile, pinDmLoopModel } from "../src/lib/production/dm-loop-pin.ts";
import { readDmSettingsWith, saveDmSettingsWith } from "../src/lib/gameplay/dm-loop/settings.ts";

const usage = { model: "fake", inputTokens: 0, outputTokens: 0, calls: 1, latencyMs: 0 };

export async function loopCampaign(options = {}) {
  const f = await setup(undefined, options.language ?? "en", 99);
  await f.create();
  await f.startOpening();
  const foundation = await f.one("select world from rpg_private.world_foundations where campaign_id=$1", [f.cid]);
  const hero = foundation.world.actors.find((actor) => actor.control === "player").entityId;
  const npc = foundation.world.actors.find((actor) => actor.control === "autonomous")?.entityId ?? null;
  const errors = [];
  const rpc = async (args) => {
    try { return { data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) {
      errors.push({ action: args.p_action, code: error.code ?? null, message: String(error.message).slice(0, 300) });
      return { error: { message: error.message, code: error.code } };
    }
  };
  const memoryRpc = async (args) => {
    try { return { data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) { return { error: { message: error.message, code: error.code } }; }
  };
  const profileRpc = async (args) => {
    try {
      return { data: (await f.one("select public.rpg_execution_profile($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [args.p_owner_id, args.p_campaign_id, args.p_operation_id,
          args.p_profiles === null ? null : JSON.stringify(args.p_profiles), JSON.stringify(args.p_timeline)])).result };
    } catch (error) { return { error: { message: error.message } }; }
  };
  const dmSettingsRpc = async (args) => {
    try {
      return { data: (await f.one("select public.rpg_dm_settings($1,$2,$3,$4::jsonb) result",
        [args.p_owner_id, args.p_campaign_id, args.p_action, JSON.stringify(args.p_payload)])).result };
    } catch (error) { return { error: { message: error.message } }; }
  };
  const settings = {
    read: () => readDmSettingsWith(dmSettingsRpc, f.owner, f.cid),
    save: (value) => saveDmSettingsWith(dmSettingsRpc, f.owner, f.cid, value),
  };
  const summaries = { summarize: async (job) => ({ usage, output: { schemaVersion: 1,
    selections: job.sources.map((source) => ({ sourceId: source.id, version: source.ref.version })) } }) };
  const observations = [];
  const live = [];
  let diceCalls = 0;
  const diceValues = [];
  const random = (min, max) => {
    diceCalls++;
    if (diceValues.length && diceValues[0] >= min && diceValues[0] < max) return diceValues.shift();
    return min + Math.floor(((diceCalls * 7919) % 104729) / 104729 * (max - min));
  };
  const deps = async (model, extra = {}) => {
    const timeline = await f.fence(f.cid);
    const store = createRpcTurnStore(f.owner, rpc, null, timeline, false);
    return {
      store, memory: createRpcMemoryStore(f.owner, memoryRpc, timeline), summaries,
      model: () => model,
      pin: async (claim) => dmLoopPinFromProfile(await pinDmLoopModel(profileRpc,
        { ownerId: f.owner, campaignId: f.cid, operationId: claim.lease.operationId, timeline },
        async () => ({ policy: null, dmTurn: (await settings.read()).dmTurn }))),
      random,
      observe: (observation) => { observations.push(observation); if (observation.type === "live") live.push(observation.event); },
      ...extra,
    };
  };
  const input = async (text, mode = "game", companionId = null, listenerIds = []) => {
    const store = (await deps(createScriptedDmModel([]))).store;
    const play = await store.readPlay(f.cid);
    return { operationId: randomUUID(), campaignId: f.cid, timeline: play.timeline, expectedRevision: play.revision,
      mode, input: text, companionId, listenerIds, mechanic: null };
  };
  /** One player turn with a scripted model; interactive dice pauses are continued automatically. */
  const turn = async (text, rounds, options = {}) => {
    const model = createScriptedDmModel(rounds, options.model);
    const d = await deps(model, options.deps);
    const request = options.input ?? await input(text, options.mode, options.companionId, options.listenerIds);
    if (options.dice) diceValues.splice(0, diceValues.length, ...options.dice);
    const before = diceCalls;
    let result = await runDmLoopTurn(request, d);
    const statuses = [result.status];
    let continues = 0;
    while (result.status === "awaiting_confirmation" && continues < 8 && options.autoContinue !== false) {
      continues++;
      result = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: f.cid, operationId: request.operationId,
        timeline: request.timeline, action: "continue", checkId: null }, await deps(model, options.deps));
      statuses.push(result.status);
    }
    return { input: request, result, model, statuses, continues, diceRolled: diceCalls - before, deps: d };
  };
  const retry = async (previous, action = "retry") => {
    const d = await deps(previous.model);
    const result = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: f.cid, operationId: previous.input.operationId,
      timeline: previous.input.timeline, action, checkId: null }, d);
    return { ...previous, result, deps: d };
  };
  const row = (operationId) => f.one(`select status,failure,retryable,runtime_identity,checkpoint,source,narration
    from rpg_private.turns where id=$1`, [operationId]);
  const state = async () => ({
    entities: await f.query("select id,kind,name,hp,max_hp,resources,conditions from public.rpg_entities where campaign_id=$1 order by name", [f.cid]),
    items: await f.query("select id,name,category,quantity,owner_entity_id,storage_id,equipped_slot,mechanics from public.rpg_items where campaign_id=$1 order by name", [f.cid]),
    quests: await f.query("select id,title,status,description from public.rpg_quests where campaign_id=$1 order by title", [f.cid]),
    locations: await f.query("select id,name,status from public.rpg_locations where campaign_id=$1 order by name", [f.cid]),
    storages: await f.query("select id,name,kind,entity_id from public.rpg_storages where campaign_id=$1 order by name", [f.cid]),
    scenes: await f.query("select id,role,body from public.rpg_scenes where campaign_id=$1 order by sequence", [f.cid]),
    runtime: await f.one("select world_minutes,revision,configuration from rpg_private.runtime_state where campaign_id=$1", [f.cid]),
    publicState: await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1", [f.cid]),
    dmState: (await f.one("select contents from rpg_private.dm_state where campaign_id=$1", [f.cid]))?.contents ?? {},
    encounters: await f.query("select id,status,outcome from public.rpg_encounters where campaign_id=$1", [f.cid]),
    rests: await f.query("select id,kind,status,public_outcome from public.rpg_rest_records where campaign_id=$1", [f.cid]),
  });
  return { f, cid: f.cid, owner: f.owner, hero, npc, errors, observations, live, rpc, profileRpc, dmSettingsRpc, settings,
    deps, input, turn, retry, row, state, random };
}

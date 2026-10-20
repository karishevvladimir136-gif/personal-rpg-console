// A fresh campaign on disposable PGlite (World → character → opening) that
// plays on dm-loop-v1 from its first scene, with a scripted DmModel. Since
// stage 3 the loop harness can also be attached to an existing campaign
// (`attachLoop`), e.g. a taken-over Astra campaign that is switched over.
import { randomUUID } from "node:crypto";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runDmLoopTurn, resumeDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { dmLoopPinFromProfile, pinDmLoopModel } from "../src/lib/production/dm-loop-pin.ts";
import { readDmSettingsWith, saveDmSettingsWith } from "../src/lib/gameplay/dm-loop/settings.ts";
import { appendObservations } from "../src/lib/gameplay/dm-loop/observations.ts";

const usage = { model: "fake", inputTokens: 0, outputTokens: 0, calls: 1, latencyMs: 0 };

export async function loopCampaign(options = {}) {
  // Polish: a bench scenario may bring its own world/hero/opening texts (`example`, the shape of
  // `examples.fantasy`) and language — the Russian replay plays a Russian campaign.
  const f = await setup(options.example ?? undefined, options.language ?? "en", 99);
  await f.create();
  await f.proposeOpening();
  // The opening may set the clock (polish group 10, migration 63): «Утро» starts at 8:00, not 00:00.
  if (options.startMinutes !== undefined && options.startMinutes !== null) f.openingCommit.input.startMinutes = options.startMinutes;
  await f.service.perform(f.openingCommit);
  // Fix run B4: a Russian campaign's DM reads the native Russian instructions by default. The older tests check the
  // English instructions' wording, so a Russian campaign here reads «английские» unless the test asks for the
  // default (`instructions: null`) or for "ru"; a choice saved in the campaign's DM settings still wins, as in the app.
  const instructions = options.instructions === undefined ? (options.language === "ru" ? "en" : null) : options.instructions;
  return attachLoop(f, { instructions });
}

/** The turn's source with the harness's pinned DM options under the stored ones (fix run B4). */
function withPinnedOptions(store, pins) {
  if (!pins.instructions) return store;
  return { ...store, claim: async (...args) => {
    const claimed = await store.claim(...args);
    return claimed ? { ...claimed, source: { ...claimed.source, dmOptions: { instructions: pins.instructions, ...(claimed.source.dmOptions ?? {}) } } } : claimed;
  } };
}

/** The loop harness (stores, pin, scripted turns, state dumps) for the campaign `f` holds. */
export async function attachLoop(f, pins = {}) {
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
  /** Stage 4 and polish craft (migrations 55 and 60 seed them pending): activate the
   * condensed doctrine and the new cards for this synthetic owner, as the real owner
   * would in the DM Craft screen — the latest version of every key. */
  const activateStage4Craft = async () => {
    const craft = async (action, payload = {}) => (await f.one("select public.rpg_dm_craft($1,$2,$3::jsonb) result",
      [f.owner, action, JSON.stringify(action === "read" ? payload : { requestId: randomUUID(), ...payload })])).result;
    let view = await craft("read");
    const keys = [...new Set(view.versions.map((row) => row.key))].sort();
    for (const key of keys) {
      const versions = view.versions.filter((row) => row.key === key).sort((a, b) => b.version - a.version);
      if (!versions.length) continue;
      const effective = view.effective.find((row) => row.key === key);
      if (effective?.activeVersionId === versions[0].id) continue;
      view = await craft("activate", { expectedActivationRevision: effective?.activationRevision ?? 0, key, versionId: versions[0].id });
    }
    return view;
  };
  /** rpg_dossier (stage 4): pins, likes, theme, status, play time, the notebook and the session digest. */
  const dossier = async (action, payload = {}, timeline = null) => (await f.one(
    "select public.rpg_dossier($1,$2,$3,$4::jsonb,$5::jsonb) result",
    [f.owner, f.cid, action, JSON.stringify(["read", "notebook"].includes(action) ? payload : { requestId: randomUUID(), ...payload }),
      timeline ? JSON.stringify(timeline) : null])).result;
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
    const store = withPinnedOptions(createRpcTurnStore(f.owner, rpc, null, timeline, false), pins);
    return {
      store, memory: createRpcMemoryStore(f.owner, memoryRpc, timeline), summaries,
      model: () => model,
      // The campaign's DM settings at the turn's start: model and per-turn limits pinned together.
      // Polish 3 §2: on a split campaign the pinned «dm.turn» model is the writer (as the app does).
      pin: async (claim) => {
        const current = await settings.read();
        return { ...dmLoopPinFromProfile(await pinDmLoopModel(profileRpc,
          { ownerId: f.owner, campaignId: f.cid, operationId: claim.lease.operationId, timeline },
          async () => ({ policy: null, dmTurn: current.split?.writer ?? current.dmTurn }))), limits: current.limits, depth: current.depth, boostNext: current.boostNext,
          continuation: current.options?.continuation };
      },
      // Stage 4: the DM's player-likes note and the used «important turn» flag.
      afterCommit: async ({ playerLikes, boostUsed, source }) => {
        // Polish item 15: the DM's own note; fix run A2: appended to the stored observations, as the app does.
        if (playerLikes) await dossier("dm_likes", { playerLikes: appendObservations(String(source?.snapshot.campaign.dm_likes ?? ""), playerLikes) });
        if (boostUsed) await dmSettingsRpc({ p_owner_id: f.owner, p_campaign_id: f.cid, p_action: "boost_used", p_payload: {} });
      },
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
  const row = (operationId) => f.one(`select status,failure,retryable,runtime_identity,checkpoint,source,narration,committed_revision
    from rpg_private.turns where id=$1`, [operationId]);
  const state = async () => ({
    entities: await f.query("select id,kind,name,hp,max_hp,resources,conditions from public.rpg_entities where campaign_id=$1 order by name", [f.cid]),
    items: await f.query("select id,name,category,quantity,owner_entity_id,storage_id,equipped_slot,mechanics from public.rpg_items where campaign_id=$1 order by name", [f.cid]),
    quests: await f.query("select id,title,status,description,reward_operation_id from public.rpg_quests where campaign_id=$1 order by title", [f.cid]),
    locations: await f.query("select id,name,status from public.rpg_locations where campaign_id=$1 order by name", [f.cid]),
    storages: await f.query("select id,name,kind,entity_id from public.rpg_storages where campaign_id=$1 order by name", [f.cid]),
    scenes: await f.query("select id,role,body from public.rpg_scenes where campaign_id=$1 order by sequence", [f.cid]),
    runtime: await f.one("select world_minutes,revision,configuration from rpg_private.runtime_state where campaign_id=$1", [f.cid]),
    publicState: await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1", [f.cid]),
    dmState: (await f.one("select contents from rpg_private.dm_state where campaign_id=$1", [f.cid]))?.contents ?? {},
    encounters: await f.query("select id,status,outcome from public.rpg_encounters where campaign_id=$1", [f.cid]),
    rests: await f.query("select id,kind,status,public_outcome from public.rpg_rest_records where campaign_id=$1", [f.cid]),
  });
  /** Everything a save must carry, in a stable order, for exact before/after comparisons. */
  const dump = async () => {
    const one = async (sql) => (await f.query(sql, [f.cid])).map((r) => JSON.stringify(r));
    return {
      entities: await one("select id,kind,name,details,hp,max_hp,stats,resources,conditions,equipment_slots,revision from public.rpg_entities where campaign_id=$1 order by id"),
      items: await one("select id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,revision from public.rpg_items where campaign_id=$1 order by id"),
      storages: await one("select id,name,kind,entity_id,revision from public.rpg_storages where campaign_id=$1 order by id"),
      quests: await one("select id,title,description,status,reward_terms,reward_operation_id,revision from public.rpg_quests where campaign_id=$1 order by id"),
      locations: await one("select id,name,description,status,revision from public.rpg_locations where campaign_id=$1 order by id"),
      scenes: await one("select id,session_id,title,body,role from public.rpg_scenes where campaign_id=$1 order by sequence"),
      publicState: await one("select summary,current_session_id,current_scene_id,current_location_id from public.rpg_public_state where campaign_id=$1"),
      runtime: await one("select world_minutes,configuration from rpg_private.runtime_state where campaign_id=$1"),
      dmState: await one("select contents from rpg_private.dm_state where campaign_id=$1"),
      turns: await one("select id,status,runtime_identity,input,narration,checkpoint->'dmLoop'->'receipts' receipts from rpg_private.turns where campaign_id=$1 and status='committed' order by sequence"),
      rests: await one("select id,kind,status,public_outcome from public.rpg_rest_records where campaign_id=$1 order by id"),
      encounters: await one("select id,status,outcome from public.rpg_encounters where campaign_id=$1 order by id"),
    };
  };
  const forceDice = (values = []) => diceValues.splice(0, diceValues.length, ...values);
  return { f, cid: f.cid, owner: f.owner, hero, npc, errors, observations, live, rpc, profileRpc, dmSettingsRpc, settings, dossier, activateStage4Craft,
    deps, input, turn, retry, row, state, dump, random, forceDice };
}

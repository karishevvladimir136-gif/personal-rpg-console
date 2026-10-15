import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setup, examples } from "../universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../../src/lib/gameplay/astra-primary.ts";

export const fakeUsage = {
  model: "gpt-6-astra", inputTokens: 0, outputTokens: 0,
  reasoningTokens: 0, cachedInputTokens: 0, calls: 1, latencyMs: 0,
};
export const privateCanary = "SYNTHETIC_UNREVEALED_CLOCKWORK_SECRET";
export const oldPromise = "Nera promised Ari to return the brass compass after sunrise; the promise remains unresolved.";
export const publicNarration = (text, requiresEffects = []) => ({
  independentBeat: requiresEffects.length ? "The scene continues." : text,
  beats: requiresEffects.length ? [{ text, requiresEffects }] : [],
  visualDescription: { text: "", requiresEffects: [] },
});
export const finalDecision = (source, text, extra = {}) => ({
  usage: fakeUsage,
  output: { type: "final", call: null, materializations: extra.materializations ?? [], final: {
    worldMinutes: source.runtime.worldMinutes,
    changes: [], outcomes: [], privatePatches: [],
    behavior: [],
    ...Object.fromEntries(Object.entries(extra).filter(([key])=>key!=="materializations")),
    ...(source.astraResponseMode === "private-informed" ? {} : {
      continuity: extra.continuity ?? {locale:null,subjects:[]},
      publicNarration: extra.publicNarration ?? publicNarration(text),
    }),
  } },
});

/** Entirely disposable PGlite: no environment, network, owner or live providers. */
export async function naturalFixture({ secondCampaign = false, publicSceneOnly = false,
  openingAddendum = "", npcKind = "companion" } = {}) {
  const example = { ...examples.fantasy, name: "Ari", npc: "Nera",
    narration: `Ari and Nera stand in the ordinary village square. ${oldPromise}${openingAddendum ? ` ${openingAddendum}` : ""}` };
  const f = await setup(example, "en", 52);
  try {
    await f.create();
    await f.startOpening();
    const foundation = (await f.one(
      "select world from rpg_private.world_foundations where campaign_id=$1", [f.cid])).world;
    const hero = foundation.actors.find((actor) => actor.control === "player").entityId;
    const npc = foundation.actors.find((actor) => actor.control === "autonomous").entityId;
    if (publicSceneOnly) {
      const actor = foundation.actors.find((row) => row.entityId === npc);
      actor.capabilities = []; actor.limitations = []; actor.knowledge = [];
    }
    const home = (await f.one(
      "select current_location_id id from public.rpg_public_state where campaign_id=$1", [f.cid])).id;
    // No mill, miller, baker or rat is precreated. Natural play must establish
    // ephemeral subjects before any bounded durable promotion.
    if (publicSceneOnly) await f.one("update rpg_private.world_foundations set world=$2::jsonb,revision=revision+1 where campaign_id=$1",
      [f.cid,JSON.stringify(foundation)]);
    const hand = JSON.stringify([{ id: "hand", label: "Main hand", accepts: ["weapon"] }]);
    await f.one("update public.rpg_entities set name='Ari',hp=10,max_hp=10,stats=stats||'{\"attack\":20,\"defense\":11,\"skill\":2}'::jsonb,resources='{\"focus\":40}'::jsonb,equipment_slots=$2::jsonb where id=$1", [hero, hand]);
    await f.one("update public.rpg_entities set kind=$3,name='Nera',hp=100,max_hp=100,stats=stats||'{\"attack\":20,\"defense\":10}'::jsonb,equipment_slots=$2::jsonb where id=$1", [npc, hand, npcKind]);
    await f.one("insert into rpg_private.dm_state(campaign_id,contents) values($1,$2::jsonb) on conflict(campaign_id) do update set contents=excluded.contents",
      [f.cid, JSON.stringify({ fact: { secret: privateCanary }, clock: { omen: 1 } })]);
    const pack = await f.one("select id from public.rpg_storages where campaign_id=$1 and entity_id=$2 and kind='player'", [f.cid, hero]);
    const sword = (await f.mutation("item.save", f.cid, {
      name: "Practice sword", category: "weapon", quantity: 1,
      description: "An ordinary recorded sword.", mechanics: "", owner_entity_id: hero,
      storage_id: pack.id, equipped_entity_id: hero, equipped_slot: "hand",
    })).id;
    const npcPack = (await f.mutation("storage.save", f.cid, {
      name: "Nera pack", kind: npcKind === "npc" ? "merchant" : "companion", entity_id: npc,
    })).id;
    const npcWeapon = (await f.mutation("item.save", f.cid, {
      name: "Nera practice sword", category: "weapon", quantity: 1,
      description: "An ordinary recorded sword.", mechanics: "", owner_entity_id: npc,
      storage_id: npcPack, equipped_entity_id: npc, equipped_slot: "hand",
    })).id;
    const supplies = (await f.mutation("item.save", f.cid, {
      name: "Recorded travel portions", category: "supply", quantity: 50,
      description: "Ordinary supplies for meals and rest.", mechanics: "", owner_entity_id: hero,
      storage_id: pack.id, equipped_entity_id: null, equipped_slot: null,
    })).id;
    const settings = await f.one("select values,revision from public.rpg_settings where campaign_id=$1", [f.cid]);
    settings.values.interactiveDice = false;
    settings.values.difficulty.rerolls = "disabled";
    settings.values.difficulty.longRestSupplyCost = 1;
    await f.mutation("settings.save", f.cid, settings.values, settings.revision);
    const play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid,
      expectedRevision: play.revision, configuration: { profile: "console-basic-v1",
        controlledEntityIds: [hero], presentEntityIds: [hero, npc],
        nearbyStorageIds: [], safeLocationIds: [], itemRules: [
          { itemId: sword, tag: "weapon", damage: 4 },
          { itemId: npcWeapon, tag: "weapon", damage: 4 },
          { itemId: supplies, tag: "supply", damage: null },
        ] } });
    const timeline = await f.fence(f.cid);
    const pin = await f.one(`select r.revision runtime_revision,p.revision public_revision,
      w.revision world_revision,encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
      t.head_manifest_id head_id,(select coalesce(max(sequence),0) from rpg_private.world_events
        where campaign_id=r.campaign_id) world_event_sequence
      from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id)
      join rpg_private.world_foundations w using(campaign_id)
      join rpg_private.timeline_campaigns c using(campaign_id)
      join rpg_private.timelines t on t.id=c.active_timeline_id where r.campaign_id=$1`, [f.cid]);
    await f.runtime(f.cid, "astra_takeover", { requestId: randomUUID(), campaignId: f.cid,
      timeline, expectedRuntimeRevision: pin.runtime_revision, expectedWorldRevision: pin.world_revision,
      expectedPublicRevision: pin.public_revision, expectedHeadId: pin.head_id,
      expectedWorldDigest: pin.world_digest, expectedWorldEventSequence: pin.world_event_sequence });
    const errors = [];
    const memoryCalls = [];
    const rpc = async (args) => {
      try { return { data: await f.runtime(args.p_campaign_id, args.p_action,
        args.p_payload, args.p_timeline) }; }
      catch (error) { errors.push({ action: args.p_action, code: error.code, message: error.message, where: error.where });
        return { error: { message: error.message, code: error.code } }; }
    };
    const memoryRpc = async (args) => {
      memoryCalls.push(args.p_action);
      try { return { data: await f.memory(args.p_campaign_id, args.p_action,
        args.p_payload, args.p_timeline) }; }
      catch (error) { return { error: { message: error.message, code: error.code } }; }
    };
    const store = createRpcTurnStore(f.owner, rpc, "gpt-6-astra", timeline, true,
      { astraResponseContract:"unified-v1", astraNaturalContract:"natural-v1" });
    const memory = createRpcMemoryStore(f.owner, memoryRpc, timeline);
    let inForeground = false, summaries = 0;
    const summaryProvider = { summarize: async (job) => {
      assert.equal(inForeground, false, "Memory summarization must leave the Send critical path");
      summaries++;
      return { usage: fakeUsage, output: { schemaVersion: 1,
        selections: job.sources.map((source) => ({ sourceId: source.id, version: source.ref.version })) } };
    } };
    async function turn(text, provider, { operationId = randomUUID(), random = (_min, max) => max === 21 ? 18 : 3 } = {}) {
      const currentFence = await f.fence(f.cid);
      const activeStore = createRpcTurnStore(f.owner,rpc,"gpt-6-astra",currentFence,true,
        {astraResponseContract:"unified-v1",astraNaturalContract:"natural-v1"});
      const activeMemory = createRpcMemoryStore(f.owner,memoryRpc,currentFence);
      const play = await activeStore.readPlay(f.cid);
      const input = { operationId, campaignId: f.cid, timeline: play.timeline,
        expectedRevision: play.revision, mode: "game", input: text,
        companionId: null, listenerIds: [], mechanic: null };
      const deps = { store:activeStore, memory:activeMemory, summaries: summaryProvider, provider, random };
      inForeground = true;
      try {
        let result = await runAstraTurn(input, deps);
        while (result.status === "awaiting_confirmation") result = await resumeAstraTurn({
          commandId: randomUUID(), campaignId: f.cid, operationId, timeline:currentFence,
          action: "continue", checkId: null,
        }, deps);
        return { input, result, deps };
      } finally { inForeground = false; }
    }
    const snapshot = async () => ({
      state: await f.one(`select e.hp,e.resources,r.world_minutes,p.current_location_id location
        from public.rpg_entities e join rpg_private.runtime_state r using(campaign_id)
        join public.rpg_public_state p using(campaign_id) where e.id=$1`, [hero]),
      npcHp: (await f.one("select hp from public.rpg_entities where id=$1", [npc])).hp,
      supplies: (await f.one("select quantity from public.rpg_items where id=$1", [supplies])).quantity,
      items: await f.query("select id,quantity,owner_entity_id,equipped_entity_id,equipped_slot from public.rpg_items where campaign_id=$1 order by id", [f.cid]),
      rests: (await f.one("select count(*)::integer n from public.rpg_rest_records where campaign_id=$1 and status='complete'", [f.cid])).n,
      turns: (await f.one("select count(*)::integer n from rpg_private.turns where campaign_id=$1 and status='committed'", [f.cid])).n,
      events: (await f.one("select count(*)::integer n from rpg_private.runtime_events where campaign_id=$1", [f.cid])).n,
    });
    const foreignCampaignId = secondCampaign ? (await f.campaign("Isolated other campaign")) : null;
    return { f, hero, npc, home, sword, npcWeapon, supplies, timeline, store, memory,
      errors, memoryCalls, summaryProvider, summaryCalls: () => summaries,
      turn, snapshot, foreignCampaignId };
  } catch (error) { await f.db.close(); throw error; }
}

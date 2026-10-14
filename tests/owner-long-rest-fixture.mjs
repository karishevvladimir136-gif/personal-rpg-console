import assert from "node:assert/strict";
import { createIrisWorld, irisSnapshot, irisTurn } from "./astra-iris-fixture.mjs";

export const ownerLongRestInput = "i take long rest";
export const ownerSleepPermission =
  "The market seller has paid Iris the agreed two silver and vegetables for her finished crate work. ‘You're welcome to sleep there tonight, if the open air suits you,’ the seller says.";

/** Disposable World-Logic-origin campaign shaped like the owner rest turn. */
export async function createOwnerLongRestWorld() {
  const world = await createIrisWorld(49);
  const { f, hero } = world;
  try {
    const storage = await f.one(`select id from public.rpg_storages
      where campaign_id=$1 and entity_id=$2 and kind='player'`, [f.cid, hero]);
    const vegetables = (await f.mutation("item.save", f.cid, {
      name: "vegetables for a meal", category: "food", quantity: 1,
      description: "Ordinary vegetables for one meal.", mechanics: "",
      owner_entity_id: hero, storage_id: storage.id,
      equipped_entity_id: null, equipped_slot: null,
    })).id;
    const publicState = await f.one(`select summary,current_session_id,current_location_id,
      revision
      from public.rpg_public_state where campaign_id=$1`, [f.cid]);
    const scene = await f.mutation("scene.save", f.cid, {
      session_id: publicState.current_session_id, title: "Night shelter",
      body: ownerSleepPermission, role: "narration",
    });
    await f.mutation("state.save", f.cid, {
      summary: "Iris has received two silver and vegetables for her finished crate work. The market seller has offered her a place to sleep tonight.",
      current_session_id: publicState.current_session_id,
      current_scene_id: scene.id,
      current_location_id: publicState.current_location_id,
    }, publicState.revision);
    await f.one(`update public.rpg_entities set resources='{"currency_silver":2}'::jsonb
      where campaign_id=$1 and id=$2`, [f.cid, hero]);
    await f.one(`update rpg_private.runtime_state set world_minutes=13
      where campaign_id=$1`, [f.cid]);
    const state = await irisSnapshot(f, hero);
    const config = (await f.one(`select configuration from rpg_private.runtime_state
      where campaign_id=$1`, [f.cid])).configuration;
    assert.equal(state.hp, 10);
    assert.equal(state.max_hp, 10);
    assert.equal(state.world_minutes, 13);
    assert.equal(state.items.find((item) => item.name === "vegetables for a meal")?.quantity, 1);
    assert.deepEqual(config.safeLocationIds, []);
    assert.equal(config.itemRules.some((rule) => rule.itemId === vegetables), false);
    return { ...world, npc: world.seller, vegetables,
      location: publicState.current_location_id, state,
      readState: () => irisSnapshot(f, hero),
      runTurn: (provider, beforeRun = null) =>
        irisTurn(world, provider, ownerLongRestInput, beforeRun) };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

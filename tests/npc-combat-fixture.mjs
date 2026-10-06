import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { emptyCombatExchange } from "../src/lib/gameplay/combat-exchange.ts";

export function npcCombatFixture() {
  const f = runtimeFixture();
  const { source, input } = f;
  const hero = source.snapshot.entities[0];
  const npc = { ...hero, id: randomUUID(), kind: "npc", name: "Innkeeper",
    details: "Protective of the inn and its guests. Ordinary person without magic.", hp: 6, max_hp: 8 };
  source.snapshot.entities.push(npc);
  source.runtime.configuration.presentEntityIds.push(npc.id);
  const encounterId = randomUUID();
  source.runtime.encounters = [{ id: encounterId, campaign_id: input.campaignId,
    status: "active", round: 1, outcome: null, settings_revision: 1, public_summary: "A fight in the inn." }];
  source.runtime.participants = [hero, npc].map((entity, index) => ({
    id: randomUUID(), campaign_id: input.campaignId, encounter_id: encounterId,
    entity_id: entity.id, public_name: entity.name, turn_order: index,
    public_position: { position: "nearby" },
    public_resources: { active: index === 1, action: index === 1 ? 1 : 0, move: 1 },
  }));
  const sceneId = randomUUID();
  source.snapshot.scenes = [{ id: sceneId, campaign_id: input.campaignId,
    session_id: source.snapshot.publicState.current_session_id, sequence: 1, role: "narration",
    body: "The innkeeper stands by the doorway; guests are in the room." }];
  source.snapshot.publicState.current_scene_id = sceneId;
  input.input = "I smack his head on the nearest table, then take his purse if he is stunned.";
  const action = { kind: "encounter.action", actorId: hero.id, action: "attempt",
    targetId: npc.id, itemId: null, position: null };
  const checkpoint = { ...f.checkpoint,
    plan: { ...f.plan, publicPatches: [action] },
    naturalMechanic: { schemaVersion: 4, input: input.input, actorId: hero.id,
      targetId: npc.id, method: "improvise", itemId: null, equipmentName: null },
    combatExchange: { ...emptyCombatExchange(), playerConfirmed: true,
      playerResolution: { changes: [], worldMinutes: 0, configuration: source.runtime.configuration,
        outcomes: [{ kind: "encounter.action", entityIds: [hero.id, npc.id], itemIds: [],
          text: "The physical attempt made contact; no condition, damage or transfer was established." }] } },
  };
  return { ...f, npc, hero, checkpoint, action };
}


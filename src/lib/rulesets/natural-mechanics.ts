import type { MechanicChoice, TurnInput } from "../gameplay/contracts.ts";
import type { DmPlan, RuntimeSource } from "../gameplay/server-contracts.ts";
import { mechanicPlanForActions } from "../gameplay/mechanics/resolve.ts";
import { requireRule, TurnError } from "../gameplay/turn-errors.ts";
import { parseWorldState } from "../world/validation.ts";
import { ensure, literal, nullable, object, text, uuid } from "../world-library/validation.ts";
import type { WorldLogicInput } from "./world-logic-contracts.ts";

/** Interpretation only. It cannot contain a roll, damage, condition or transfer. */
export type NaturalMechanicIntent = {
  schemaVersion: 4;
  input: string;
  actorId: string;
  targetId: string;
  method: "attack" | "improvise";
  itemId: string | null;
  equipmentName: string | null;
};

export function parseNaturalMechanicIntent(value: unknown): NaturalMechanicIntent {
  const row = object(value, [
    "schemaVersion", "input", "actorId", "targetId", "method", "itemId", "equipmentName",
  ]);
  return {
    schemaVersion: literal(row.schemaVersion, [4]),
    input: text(row.input, 12000),
    actorId: uuid(row.actorId),
    targetId: uuid(row.targetId),
    method: literal(row.method, ["attack", "improvise"]),
    itemId: nullable(row.itemId, uuid),
    equipmentName: nullable(row.equipmentName, (v) => text(v, 120)),
  };
}

export function naturalMechanicOptions(input: WorldLogicInput) {
  const world = parseWorldState(input.snapshot.world, input.snapshot.campaignId);
  const current = input.source.snapshot.publicState.current_location_id;
  const entities = input.source.snapshot.entities;
  const playerIds = world.actors
    .filter((actor) => actor.control === "player" && actor.entityId !== null)
    .map((actor) => actor.entityId!);
  const targets = world.actors
    .filter((actor) => actor.control === "autonomous" && actor.publicName !== null &&
      actor.locationId === current && actor.entityId !== null)
    .flatMap((actor) => {
      const entity = entities.find((row) => row.id === actor.entityId &&
        row.campaign_id === input.snapshot.campaignId && row.name === actor.publicName);
      return entity && entity.kind === "npc"
        ? [{ id: entity.id, name: entity.name }]
        : [];
    });
  const weapons = input.source.snapshot.items
    .filter((item) => playerIds.includes(item.owner_entity_id ?? "") &&
      item.equipped_entity_id === item.owner_entity_id &&
      input.source.runtime.configuration?.itemRules.some((rule) =>
        rule.itemId === item.id && rule.tag === "weapon") === true)
    .map((item) => ({ id: item.id, name: item.name, ownerId: item.owner_entity_id }));
  return { playerIds, targets, weapons };
}

export function validateNaturalMechanicIntent(input: WorldLogicInput, raw: unknown) {
  const intent = parseNaturalMechanicIntent(raw);
  ensure(intent.input === input.input.input, "conflict");
  const options = naturalMechanicOptions(input);
  ensure(options.playerIds.includes(intent.actorId) &&
    options.targets.some((target) => target.id === intent.targetId), "scope");
  if (intent.method === "attack") {
    ensure(intent.itemId === null
      ? intent.equipmentName === null
      : options.weapons.some((weapon) =>
        weapon.id === intent.itemId && weapon.ownerId === intent.actorId &&
        weapon.name === intent.equipmentName));
  } else {
    ensure(intent.itemId === null
      ? intent.equipmentName === null
      : input.source.snapshot.items.some((item) =>
        item.id === intent.itemId && item.owner_entity_id === intent.actorId &&
        item.equipped_entity_id === intent.actorId &&
        item.name === intent.equipmentName));
  }
  return intent;
}

/** Uses the existing encounter interpreter; every mutation remains in its plan. */
export function naturalMechanicPlan(
  source: RuntimeSource,
  input: TurnInput,
  intent: NaturalMechanicIntent,
): DmPlan {
  const config = source.runtime.configuration;
  if (!config || config.profile !== "console-basic-v1" ||
    !config.controlledEntityIds.includes(intent.actorId) ||
    !config.presentEntityIds.includes(intent.targetId))
    throw new TurnError("configuration");
  const actor = source.snapshot.entities.find((row) => row.id === intent.actorId);
  const target = source.snapshot.entities.find((row) => row.id === intent.targetId);
  requireRule(actor && target && actor.hp !== null && actor.hp > 0 &&
    actor.max_hp !== null && target.hp !== null && target.hp > 0 && target.max_hp !== null);
  const active = source.runtime.encounters.find((row) => row.status === "active");
  const actions: MechanicChoice[] = active ? [] : [
    { kind: "encounter.start", participantIds: [actor.id, target.id] },
  ];
  actions.push({
    kind: "encounter.action",
    actorId: actor.id,
    action: intent.method === "attack" ? "attack" : "attempt",
    targetId: target.id,
    itemId: intent.itemId,
    position: null,
  });
  const plan = mechanicPlanForActions(source, input, actions);
  plan.narration = intent.method === "improvise"
    ? "Narrate only the recorded physical attempt and its check. No stun, condition, damage, transfer, or later conditional step was authorized. Stop at the next decision."
    : intent.itemId === null
      ? "This was adjudicated as an unarmed attack. Do not describe a weapon as owned, equipped, used, or hitting. Narrate only the recorded attack result."
      : `This attack used the approved equipped item ${intent.equipmentName}. Narrate only the recorded attack result and damage.`;
  return plan;
}

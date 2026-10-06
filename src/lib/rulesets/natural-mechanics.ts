import type { MechanicChoice, TurnInput } from "../gameplay/contracts.ts";
import type { DmPlan, RuntimeSource } from "../gameplay/server-contracts.ts";
import { mechanicPlanForActions } from "../gameplay/mechanics/resolve.ts";
import { requireRule, TurnError } from "../gameplay/turn-errors.ts";
import { parseWorldState } from "../world/validation.ts";
import { ensure, literal, nullable, object, text, uuid } from "../world-library/validation.ts";
import type { WorldLogicInput } from "./world-logic-contracts.ts";

/** Shared semantic guidance for the resolver, never a text-routing rule. */
export const NATURAL_PHYSICAL_ACTION_GUIDANCE = [
  "Select the first independently consequential uncertain action in the player's intended sequence. Interpret its purpose and causal dependencies, not the first verb or a keyword. Incidental staging, gestures, feints and aim can be part of one attack; they do not establish a separate success, positional change or advantage. Do not require an inventory record for incidental scenery or pause an otherwise eligible attack because its cosmetic preparation is unestablished; omit that unsupported preparation from the outcome. If a preceding action needs its own uncertain result before the next action can happen, resolve only that preceding action.",
  "Outside an active encounter, use schemaVersion=4 for a hostile physical action against a listed current visible autonomous target. Inside an active encounter version 4 remains valid for one standalone physical attempt, while version 5 represents an independently legal whole-turn sequence. Choose method=attack for an ordinary injuring strike with a fist, foot or an approved equipped weapon, including a strike described with distracting preparation, a called body part or a hoped-for stun. A desired extra effect never changes an ordinary strike into a guaranteed condition. Choose method=improvise for a distinct attempt whose primary purpose is grappling, shoving, forcing movement, disarming, or using an object outside its approved attack rules. Determine whether contact intends injury or displacement from the whole request and circumstances; a forceful verb alone cannot decide. A weapon strike aimed at a hand may remain an attack; taking the weapon away as the primary action is a bounded attempt. Neither grants a disarm.",
  "A prior shove followed by a strike contains two independently consequential actions: only the shove attempt is eligible now. An incidental scene prop may support a bounded physical attempt without becoming an inventory Item; its presence, possession and successful use are not established by player wording. Resolve that attempt before any later conditional action. Later strikes, claimed stuns, forced movement, taking valuables and other follow-through remain unexecuted.",
  "Version 4 is interpretation only: copy input exactly and select the controlled actorId and visible targetId. itemId must be a supplied authoritative eligible item and equipmentName its exact name when that item is claimed; never substitute an unarmed strike for a named missing weapon. Do not invent dice, hit, HP, damage, conditions, advantage, position, item ownership or transfers. The deterministic mechanics alone resolve the selected action. A hoped-for secondary effect does not make a supported attack or attempt unsupported, but it receives no authority. Missing required equipment, an ineligible target or a genuinely unresolved primary intent still requires clarification.",
  "Pure speech, threats, demands and taunts use the existing World Logic speech path outside an active encounter; within an active encounter they may be free fiction in a bounded combat turn. They do not become physical attacks or grant a taunted condition, forced behavior or a transfer. Movement, cover and defending cannot be granted as free attack preparation; select a separate supported action only when that is the actual primary intent and its existing authority permits it.",
].join(" ");

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
  const resultGuidance = intent.method === "improvise"
    ? "Narrate only the recorded physical attempt and its check. No stun, condition, damage, transfer, or later conditional step was authorized. Stop at the next decision."
    : intent.itemId === null
      ? "This was adjudicated as an unarmed attack. Do not describe a weapon as owned, equipped, used, or hitting. Narrate only the recorded attack result."
      : `This attack used the approved equipped item ${intent.equipmentName}. Narrate only the recorded attack result and damage.`;
  plan.narration = `${resultGuidance} The player's phrasing is intent, not an outcome. Narrate only this one independently consequential player action and any separately validated autonomous response. Incidental staging or a feint grants no successful preparation, advantage or positional change. Do not claim stun, disarm, forced movement, a later strike, taking valuables or any other follow-through unless separately present in validated results. Stop at the next player decision.`;
  return plan;
}

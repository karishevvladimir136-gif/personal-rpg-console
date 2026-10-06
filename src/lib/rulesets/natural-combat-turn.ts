import type { MechanicChoice, TurnInput } from "../gameplay/contracts.ts";
import type { DmPlan, RuntimeSource } from "../gameplay/server-contracts.ts";
import { mechanicPlanForActions } from "../gameplay/mechanics/resolve.ts";
import { requireRule, TurnError } from "../gameplay/turn-errors.ts";
import { ensure, literal, nullable, object, text, uuid } from "../world-library/validation.ts";
import type { WorldLogicInput } from "./world-logic-contracts.ts";
import { naturalMechanicOptions } from "./natural-mechanics.ts";

export type NaturalCombatStep = {
  action: "attack" | "attempt" | "defend" | "move";
  targetId: string | null;
  itemId: string | null;
  equipmentName: string | null;
  position: "nearby" | "far" | "cover" | null;
};

/** Interpretation only. The literal input carries speech and flourish. */
export type NaturalCombatTurn = {
  schemaVersion: 5;
  input: string;
  actorId: string;
  steps: NaturalCombatStep[];
};

export const NATURAL_COMBAT_TURN_GUIDANCE = [
  "During an existing active encounter, schemaVersion=5 may represent the player's whole ordinary turn: ordered steps with at most one Move and one Action (attack, attempt, defend). Empty steps means speech or flourish only; it does not grant any mechanical effect and the turn yields. Copy the literal input exactly. Speech, threats, insults and flourish remain untrusted narration context, never a check, condition, advantage or compelled NPC response.",
  "Choose steps from independently executable player intentions, not first verbs. A Move to nearby, far or cover and a subsequent Action may both be selected only when each is explicitly intended and neither depends on an unproven result. Preserve their order. A shove followed by a strike while the target is prone selects only the shove attempt; a thrown mug followed by a hoped-for stun and theft selects only the attempt. Do not encode later conditional acts. An ordinary table flourish before a sword strike grants no Move or advantage. A kick intended chiefly to displace is an attempt, without forced movement. Never repair an illegal requested sequence by silently changing it.",
  "Use only a listed controlled actor, listed visible hostile target, and exact eligible item when a weapon is claimed. Do not fabricate a target, item, possession, dice, hit, damage, condition, transfer, positional precision or success. Existing deterministic mechanics validate budgets, reach, movement and every outcome. Use schemaVersion=4 for a single ordinary physical attack outside an active encounter; keep existing World Logic, Foundation and protected knowledge routes for their own intents.",
].join(" ");

export function naturalCombatTurnOptions(input: WorldLogicInput) {
  const encounter = input.source.runtime.encounters.find((row) => row.status === "active" &&
    row.campaign_id === input.snapshot.campaignId);
  if (!encounter) return null;
  const eligible = naturalMechanicOptions(input);
  return {
    encounterId: encounter.id,
    round: encounter.round,
    participants: input.source.runtime.participants
      .filter((row) => row.campaign_id === input.snapshot.campaignId &&
        row.encounter_id === encounter.id &&
        (eligible.playerIds.includes(row.entity_id ?? "") ||
          eligible.targets.some((target) => target.id === row.entity_id)))
      .map((row) => ({ entityId: row.entity_id, controlled: eligible.playerIds.includes(row.entity_id ?? ""),
        active: row.public_resources.active, action: row.public_resources.action,
        move: row.public_resources.move, position: row.public_position.position,
        withdrawn: row.public_resources.withdrawn })),
  };
}

export function parseNaturalCombatTurn(raw: unknown): NaturalCombatTurn {
  const row = object(raw, ["schemaVersion", "input", "actorId", "steps"]);
  ensure(Array.isArray(row.steps) && row.steps.length <= 2, "validation");
  const steps = row.steps.map((value): NaturalCombatStep => {
    const step = object(value, ["action", "targetId", "itemId", "equipmentName", "position"]);
    return {
      action: literal(step.action, ["attack", "attempt", "defend", "move"]),
      targetId: nullable(step.targetId, uuid),
      itemId: nullable(step.itemId, uuid),
      equipmentName: nullable(step.equipmentName, (v) => text(v, 120)),
      position: nullable(step.position, (v) => literal(v, ["nearby", "far", "cover"])),
    };
  });
  ensure(steps.filter((step) => step.action === "move").length <= 1 &&
    steps.filter((step) => step.action !== "move").length <= 1, "validation");
  return { schemaVersion: literal(row.schemaVersion, [5]), input: text(row.input, 12000),
    actorId: uuid(row.actorId), steps };
}

export function validateNaturalCombatTurn(input: WorldLogicInput, raw: unknown): NaturalCombatTurn {
  const turn = parseNaturalCombatTurn(raw);
  ensure(turn.input === input.input.input, "conflict");
  const active = input.source.runtime.encounters.find((row) => row.status === "active" &&
    row.campaign_id === input.snapshot.campaignId);
  const participant = active && input.source.runtime.participants.find((row) =>
    row.campaign_id === input.snapshot.campaignId && row.encounter_id === active.id &&
    row.entity_id === turn.actorId && row.public_resources.active);
  const options = naturalMechanicOptions(input);
  ensure(!!participant && options.playerIds.includes(turn.actorId), "scope");
  for (const step of turn.steps) {
    if (step.action === "move") {
      ensure(step.targetId === null && step.itemId === null &&
        step.equipmentName === null && step.position !== null, "validation");
      continue;
    }
    ensure(step.position === null, "validation");
    if (step.action === "defend") {
      ensure(step.targetId === null && step.itemId === null && step.equipmentName === null, "validation");
      continue;
    }
    ensure(step.targetId !== null && options.targets.some((target) => target.id === step.targetId), "scope");
    if (step.action === "attempt") ensure(step.itemId === null && step.equipmentName === null, "validation");
    if (step.itemId === null) ensure(step.equipmentName === null, "validation");
    else if (step.action === "attack")
      ensure(options.weapons.some((weapon) => weapon.id === step.itemId &&
        weapon.ownerId === turn.actorId && weapon.name === step.equipmentName), "scope");
    else ensure(input.source.snapshot.items.some((item) => item.id === step.itemId &&
      item.campaign_id === input.snapshot.campaignId && item.owner_entity_id === turn.actorId &&
      item.equipped_entity_id === turn.actorId && item.name === step.equipmentName), "scope");
  }
  return turn;
}

export function naturalCombatTurnPlan(source: RuntimeSource, input: TurnInput,
  turn: NaturalCombatTurn): DmPlan {
  const config = source.runtime.configuration;
  if (!config || config.profile !== "console-basic-v1" ||
    !config.controlledEntityIds.includes(turn.actorId)) throw new TurnError("configuration");
  const actions: MechanicChoice[] = turn.steps.map((step) => ({
    kind: "encounter.action", actorId: turn.actorId, action: step.action,
    targetId: step.targetId, itemId: step.itemId, position: step.position,
  }));
  const plan = actions.length ? mechanicPlanForActions(source, input, actions) : {
    narration: "", checks: [], publicPatches: [], privatePatches: [],
    visualDescription: "", clarification: null, guidanceProposal: null,
  } satisfies DmPlan;
  requireRule(plan.checks.length <= 1);
  plan.narration = "The player's exact text is intent and may include free speech or flourish. " +
    "Narrate only the ordered validated Move and Action, their recorded outcomes, and the separately validated NPC response. " +
    "Speech alone establishes no taunt, condition, advantage or compelled behavior. Do not narrate a conditional later act as executed. " +
    "No unrecorded hit, damage, forced movement, transfer or item use. Stop at the next player decision.";
  return plan;
}

import { isDeepStrictEqual } from "node:util";
import type { MechanicChoice, TurnInput } from "./contracts.ts";
import type {
  MechanicsResolution, ProviderResult, RecordedCheck, RuntimeSource,
  TurnCheckpoint, TurnLease, TurnStore,
} from "./server-contracts.ts";
import { checkModifier, mechanicPlanForActions, resolveMechanics } from "./mechanics/resolve.ts";
import { recordServerRoll } from "./dice.ts";
import { requireRule, TurnError } from "./turn-errors.ts";
import { characterPacket } from "./character-model.ts";

/** A model chooses only intent. The encounter interpreter owns every result. */
export type AutonomousCombatIntent = {
  actorId: string;
  action: "attack" | "attempt" | "defend" | "move" | "end-turn";
  targetId: string | null;
  itemId: string | null;
  position: "nearby" | "far" | "cover" | null;
  description: string;
};

export type CombatDecision = {
  campaignId: string;
  operationId: string;
  location: { id: string | null; name: string | null };
  recentPublicScene: string | null;
  participants: Array<{
    entityId: string;
    name: string;
    controlled: boolean;
    hp: number;
    maxHp: number;
    position: string;
    action: number;
    move: number;
    defending: boolean;
    weapons: Array<{ id: string; name: string; damage: number }>;
    personality: unknown;
  }>;
  actorsToDecide: string[];
};

export type PrepareCombatIntent = (
  decision: CombatDecision,
) => Promise<ProviderResult<AutonomousCombatIntent[]>>;

export type CombatExchangeCheckpoint = {
  schemaVersion: 1;
  resumeOnly: boolean;
  playerConfirmed: boolean;
  playerResolution: MechanicsResolution | null;
  npcIntents: AutonomousCombatIntent[] | null;
  npcChecks: RecordedCheck[];
  actions: MechanicChoice[] | null;
};

export const emptyCombatExchange = (): CombatExchangeCheckpoint => ({
  schemaVersion: 1,
  resumeOnly: false,
  playerConfirmed: false,
  playerResolution: null,
  npcIntents: null,
  npcChecks: [],
  actions: null,
});

/** An old granular turn may already have spent its Action. Advance its
 * remaining initiative without treating a new free-text attack as a hit. */
export function exhaustedControlledTurn(source: RuntimeSource, actorId: string): boolean {
  const encounter = active(source);
  return encounter?.current?.entity_id === actorId &&
    Number(encounter.current.public_resources.action) === 0;
}

function active(source: RuntimeSource) {
  const encounter = source.runtime.encounters.find((row) =>
    row.campaign_id === source.snapshot.campaign.id && row.status === "active");
  if (!encounter) return null;
  const participants = source.runtime.participants
    .filter((row) => row.campaign_id === source.snapshot.campaign.id &&
      row.encounter_id === encounter.id && !row.public_resources.withdrawn &&
      source.snapshot.entities.some((entity) => entity.id === row.entity_id &&
        entity.campaign_id === row.campaign_id && entity.hp !== null && entity.hp > 0 &&
        !entity.conditions.includes("dead") && !entity.conditions.includes("withdrawn")))
    .sort((a, b) => a.turn_order - b.turn_order);
  return { encounter, participants, current: participants.find((row) => row.public_resources.active) ?? null };
}

function projected(source: RuntimeSource, resolution: MechanicsResolution): RuntimeSource {
  const next = structuredClone(source);
  const families = {
    entities: next.snapshot.entities,
    items: next.snapshot.items,
    effects: next.runtime.effects,
    encounters: next.runtime.encounters,
    encounter_participants: next.runtime.participants,
    pending_actions: next.runtime.pendingActions,
  } as Record<string, Array<Record<string, unknown>>>;
  for (const change of resolution.changes) {
    const rows = families[change.family];
    if (!rows) continue;
    const row = rows.find((entry) => entry.id === change.id);
    if (row) Object.assign(row, change.values);
    else rows.push({ id: change.id, campaign_id: source.snapshot.campaign.id,
      revision: 0, ...change.values });
  }
  return next;
}

function action(actorId: string, kind: "end-turn" | "attack" | "attempt" | "defend" | "move",
  targetId: string | null = null, position: "nearby" | "far" | "cover" | null = null,
  itemId: string | null = null): MechanicChoice {
  return { kind: "encounter.action", actorId, action: kind, targetId, itemId, position };
}

function decisionContext(source: RuntimeSource, input: TurnInput, ids: string[]): CombatDecision {
  const encounter = active(source);
  requireRule(encounter);
  const config = source.runtime.configuration;
  requireRule(config);
  const personalities = characterPacket(source, input, "plan");
  const locationId = source.snapshot.publicState.current_location_id;
  return {
    campaignId: input.campaignId,
    operationId: input.operationId,
    location: { id: locationId, name: source.snapshot.locations.find((row) => row.id === locationId)?.name ?? null },
    recentPublicScene: source.snapshot.scenes.filter((row) => row.role === "narration").at(-1)?.body ?? null,
    actorsToDecide: ids,
    participants: encounter.participants.map((row) => {
      const entity = source.snapshot.entities.find((candidate) => candidate.id === row.entity_id);
      requireRule(entity && entity.hp !== null && entity.max_hp !== null);
      return { entityId: entity.id, name: entity.name,
        controlled: config.controlledEntityIds.includes(entity.id), hp: entity.hp, maxHp: entity.max_hp,
        position: String(row.public_position.position ?? "nearby"),
        action: Number(row.public_resources.action ?? 0), move: Number(row.public_resources.move ?? 0),
        defending: row.public_resources.defending === true,
        weapons: source.snapshot.items.filter((item) => item.campaign_id === input.campaignId &&
          item.owner_entity_id === entity.id && item.equipped_entity_id === entity.id &&
          config.itemRules.some((rule) => rule.itemId === item.id && rule.tag === "weapon"))
          .map((item) => ({ id: item.id, name: item.name,
            damage: config.itemRules.find((rule) => rule.itemId === item.id && rule.tag === "weapon")?.damage ?? 2 })),
        personality: personalities.find((model) => model.actorId === entity.id) ?? null };
    }),
  };
}

function prospectiveNpcIds(source: RuntimeSource): string[] {
  const encounter = active(source);
  if (!encounter?.current) return [];
  const config = source.runtime.configuration;
  requireRule(config);
  const start = encounter.participants.findIndex((row) => row.id === encounter.current?.id);
  const result: string[] = [];
  for (let offset = 0; offset < encounter.participants.length; offset++) {
    const row = encounter.participants[(start + offset) % encounter.participants.length];
    if (config.controlledEntityIds.includes(row.entity_id ?? "")) break;
    requireRule(row.entity_id && config.presentEntityIds.includes(row.entity_id));
    result.push(row.entity_id);
  }
  return result;
}

export function validateAutonomousIntents(source: RuntimeSource, ids: string[], raw: AutonomousCombatIntent[]) {
  requireRule(Array.isArray(raw) && raw.length === ids.length && raw.length <= 12);
  const current = active(source);
  requireRule(current);
  const controlled = source.runtime.configuration?.controlledEntityIds ?? [];
  const participants = current.participants;
  return raw.map((intent, index) => {
    requireRule(intent && typeof intent === "object" &&
      Object.keys(intent).length === 6 &&
      intent.actorId === ids[index] &&
      ["attack", "attempt", "defend", "move", "end-turn"].includes(intent.action) &&
      typeof intent.description === "string" && intent.description.length <= 240);
    const actor = participants.find((row) => row.entity_id === intent.actorId);
    requireRule(actor && !controlled.includes(intent.actorId));
    if ((["attack", "attempt", "defend"].includes(intent.action) &&
          Number(actor.public_resources.action) === 0) ||
        (intent.action === "move" && Number(actor.public_resources.move) === 0))
      return { actorId: intent.actorId, action: "end-turn" as const,
        targetId: null, itemId: null, position: null,
        description: "The actor has no matching budget left and yields the turn." };
    if (intent.action === "attack" || intent.action === "attempt") {
      const target = participants.find((row) => row.entity_id === intent.targetId);
      requireRule(target && controlled.includes(target.entity_id ?? "") &&
        actor.public_position.position !== "far" && target.public_position.position !== "far" &&
        intent.position === null);
      if (intent.itemId !== null) {
        requireRule(intent.action === "attack" && source.snapshot.items.some((item) =>
          item.id === intent.itemId && item.campaign_id === source.snapshot.campaign.id &&
          item.owner_entity_id === actor.entity_id && item.equipped_entity_id === actor.entity_id &&
          source.runtime.configuration?.itemRules.some((rule) =>
            rule.itemId === item.id && rule.tag === "weapon")));
      }
    } else if (intent.action === "move") {
      requireRule(intent.targetId === null && intent.itemId === null &&
        ["nearby", "far", "cover"].includes(intent.position ?? ""));
    } else requireRule(intent.targetId === null && intent.itemId === null && intent.position === null);
    return intent;
  });
}

/** All rolls and model choices are durable before final atomic commit. */
export async function completeCombatExchange(
  source: RuntimeSource, input: TurnInput, checkpoint: TurnCheckpoint,
  store: TurnStore, lease: TurnLease, prepare: PrepareCombatIntent | undefined,
): Promise<MechanicsResolution> {
  const exchange = checkpoint.combatExchange;
  requireRule(exchange?.schemaVersion === 1 && checkpoint.plan && checkpoint.naturalMechanic);
  const playerResolution = exchange.resumeOnly
    ? { changes: [], worldMinutes: source.runtime.worldMinutes,
        configuration: source.runtime.configuration, outcomes: [] }
    : resolveMechanics(source, input, checkpoint.plan, checkpoint.checks);
  if (exchange.playerResolution) requireRule(isDeepStrictEqual(exchange.playerResolution, playerResolution));
  else {
    exchange.playerResolution = playerResolution;
    await store.checkpoint(lease, checkpoint, "generating");
  }
  const actions: MechanicChoice[] = [...checkpoint.plan.publicPatches];
  let resolution = playerResolution;
  let state = projected(source, resolution);
  const config = source.runtime.configuration;
  requireRule(config);
  const combat = active(state);
  requireRule(combat?.current?.entity_id === checkpoint.naturalMechanic.actorId);
  const remainingOpponents = combat.participants.filter((row) => !config.controlledEntityIds.includes(row.entity_id ?? ""));
  if (!remainingOpponents.length && !exchange.resumeOnly) {
    actions.push({ kind: "encounter.end", outcome: "victory" });
  } else {
    actions.push(action(checkpoint.naturalMechanic.actorId, "end-turn"));
    resolution = resolveMechanics(source, input, mechanicPlanForActions(source, input, actions, 48), checkpoint.checks);
    state = projected(source, resolution);
    const ids = prospectiveNpcIds(state);
    if (ids.length) {
      if (exchange.npcIntents === null) {
        if (!prepare) throw new TurnError("configuration");
        const response = await prepare(decisionContext(state, input, ids));
        exchange.npcIntents = validateAutonomousIntents(state, ids, response.output);
        checkpoint.usage.push(response.usage);
        await store.checkpoint(lease, checkpoint, "generating");
      } else validateAutonomousIntents(state, ids, exchange.npcIntents);
      for (const intent of exchange.npcIntents) {
        const turn = active(state);
        if (!turn?.current || config.controlledEntityIds.includes(turn.current.entity_id ?? "")) break;
        requireRule(turn.current.entity_id === intent.actorId);
        const controlledAlive = turn.participants.some((row) => config.controlledEntityIds.includes(row.entity_id ?? ""));
        if (!controlledAlive) break;
        if (intent.action !== "end-turn") {
          actions.push(action(intent.actorId, intent.action, intent.targetId, intent.position, intent.itemId));
          const plan = mechanicPlanForActions(source, input, actions, 48);
          const proposal = plan.checks.at(-1);
          if (proposal && proposal.index === checkpoint.checks.length + exchange.npcChecks.length) {
            if (!exchange.npcChecks.some((check) => check.index === proposal.index)) {
              exchange.npcChecks.push(recordServerRoll(input.operationId, proposal, checkModifier(source, proposal)));
              await store.checkpoint(lease, checkpoint, "generating");
            }
          }
          resolution = resolveMechanics(source, input, plan, [...checkpoint.checks, ...exchange.npcChecks]);
          state = projected(source, resolution);
        }
        const after = active(state);
        if (!after?.participants.some((row) => config.controlledEntityIds.includes(row.entity_id ?? ""))) break;
        actions.push(action(intent.actorId, "end-turn"));
        resolution = resolveMechanics(source, input, mechanicPlanForActions(source, input, actions, 48),
          [...checkpoint.checks, ...exchange.npcChecks]);
        state = projected(source, resolution);
      }
    }
  }
  const final = resolveMechanics(source, input, mechanicPlanForActions(source, input, actions, 48),
    [...checkpoint.checks, ...exchange.npcChecks]);
  if (exchange.actions) requireRule(isDeepStrictEqual(exchange.actions, actions));
  else {
    exchange.actions = actions;
    await store.checkpoint(lease, checkpoint, "generating");
  }
  return final;
}

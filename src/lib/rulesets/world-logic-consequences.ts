import type { WorldState } from "../world/contracts.ts";
import {
  applyWorldConsequences,
  consequenceCapability,
  parseWorldConsequence,
  WORLD_LOGIC_CONDITIONS,
  type WorldConsequence,
} from "../world/consequences.ts";
import type {
  WorldLogicContext,
  WorldLogicInput,
  WorldLogicProposal,
} from "./world-logic-contracts.ts";
import { ensure } from "../world-library/validation.ts";

export function worldLogicTravelCapability(
  fromLocationId: string,
  destinationId: string,
): string {
  return `world.travel:${fromLocationId}:${destinationId}`;
}

/** Read existing structured capability tokens; never infer permissions from prose. */
export function worldLogicConsequenceOptions(
  input: WorldLogicInput,
  world: WorldState,
  controlledIds: string[],
): WorldLogicContext["consequenceOptions"] {
  const options: WorldLogicContext["consequenceOptions"] = [];
  const source = input.source.snapshot;
  for (const actorId of controlledIds) {
    const actor = world.actors.find((a) => a.entityId === actorId);
    const entity = source.entities.find(
      (e) => e.id === actorId && e.campaign_id === input.snapshot.campaignId,
    );
    if (!actor || !entity) continue;
    for (const capability of actor.capabilities) {
      let effect: WorldConsequence | null = null;
      let maximum: number | null = null;
      let label = "";
      if (capability.startsWith("world.consume:")) {
        const item = source.items.find(
          (i) =>
            i.id === capability.slice("world.consume:".length) &&
            i.campaign_id === input.snapshot.campaignId,
        );
        if (!item || item.quantity < 1) continue;
        effect = {
          kind: "inventory.consume",
          actorId,
          itemId: item.id,
          quantity: 1,
        };
        maximum = Math.min(20, item.quantity);
        label = item.name;
      } else if (capability.startsWith("world.spend:")) {
        const resource = capability.slice("world.spend:".length);
        if (
          !/^[a-z][a-z0-9_-]{0,47}$/.test(resource) ||
          !Object.hasOwn(entity.resources, resource) ||
          entity.resources[resource] < 1
        )
          continue;
        effect = { kind: "resource.spend", actorId, resource, amount: 1 };
        maximum = Math.min(20, entity.resources[resource]);
        label = resource;
      } else if (
        capability.startsWith("world.condition.add:") ||
        capability.startsWith("world.condition.remove:")
      ) {
        const [prefix, condition] = capability.split(":");
        if (
          !WORLD_LOGIC_CONDITIONS.includes(
            condition as (typeof WORLD_LOGIC_CONDITIONS)[number],
          )
        )
          continue;
        effect = {
          kind:
            prefix === "world.condition.add"
              ? "condition.add"
              : "condition.remove",
          actorId,
          condition: condition as (typeof WORLD_LOGIC_CONDITIONS)[number],
        };
        label = condition;
      } else if (capability.startsWith("world.relocate:")) {
        const [, targetId, destinationId] = capability.split(":");
        const target = world.actors.find(
          (a) => a.id === targetId && a.publicName !== null,
        );
        const destination = source.locations.find(
          (l) =>
            l.id === destinationId &&
            l.campaign_id === input.snapshot.campaignId,
        );
        if (!target || !destination || !target.locationId) continue;
        effect = {
          kind: "actor.relocate",
          actorId: target.id,
          fromLocationId: target.locationId,
          toLocationId: destination.id,
        };
        label = `${target.publicName} → ${destination.name}`;
      } else if (capability.startsWith("world.observe:")) {
        const [, family, recordId] = capability.split(":");
        if (!["entities", "locations", "quests"].includes(family)) continue;
        const rows = source[family as "entities" | "locations" | "quests"];
        const record = rows.find(
          (r) =>
            r.id === recordId && r.campaign_id === input.snapshot.campaignId,
        );
        if (!record) continue;
        effect = {
          kind: "fact.observe",
          family: family as "entities" | "locations" | "quests",
          recordId,
        };
        label = "name" in record ? record.name : record.title;
      } else if (capability.startsWith("world.complete:")) {
        const quest = source.quests.find(
          (q) =>
            q.id === capability.slice("world.complete:".length) &&
            q.campaign_id === input.snapshot.campaignId,
        );
        if (!quest) continue;
        effect = { kind: "quest.complete", questId: quest.id };
        label = quest.title;
      }
      if (!effect) continue;
      effect = parseWorldConsequence(effect);
      const checked = applyWorldConsequences({
        ...input,
        world,
        consequences: [effect],
        mode: "action",
        decisionActorIds: [actor.id],
        capabilityRefs: [capability],
        action: "attempt",
        elapsedMinutes: 1,
      });
      if (checked.status !== "applied") continue;
      ensure(consequenceCapability(effect) === capability);
      options.push({ actorId, capability, effect, maximum, label });
    }
  }
  ensure(options.length <= 128, "configuration");
  return options;
}

/** Model-authored publicText is advisory in v2. Durable result text is a projection. */
export function worldLogicPublicText(
  input: WorldLogicInput,
  proposal: WorldLogicProposal,
  consequences: string[],
): string {
  const russian = input.source.snapshot.campaign.language === "ru";
  const actor = input.source.snapshot.entities.find(
    (e) => e.id === proposal.actorId,
  )!;
  if (proposal.outcome === "blocked")
    return russian
      ? "Запрошенное действие пока невозможно."
      : "The requested action remains blocked.";
  const texts: Record<WorldLogicProposal["action"], string> = russian
    ? {
        observe: `${actor.name} осматривается.`,
        speak: `${actor.name} говорит.`,
        attempt: `${actor.name} выполняет запрошенное действие.`,
        move: `${actor.name} прибывает: ${input.source.snapshot.locations.find((l) => l.id === proposal.destinationId)?.name ?? ""}.`,
        wait: `${actor.name} ждёт ${proposal.elapsedMinutes} мин.`,
      }
    : {
        observe: `${actor.name} observes the surroundings.`,
        speak: `${actor.name} speaks.`,
        attempt: `${actor.name} performs the requested action.`,
        move: `${actor.name} reaches ${input.source.snapshot.locations.find((l) => l.id === proposal.destinationId)?.name ?? ""}.`,
        wait: `${actor.name} waits ${proposal.elapsedMinutes} minutes.`,
      };
  return [texts[proposal.action], ...consequences].join("\n");
}

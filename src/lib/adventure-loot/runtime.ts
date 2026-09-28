import type { LoopContext } from "../foundation-loop/contracts.ts";
import type {
  RuntimeSource,
  DmPlan,
  CheckProposal,
} from "../gameplay/server-contracts.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import { projectLootObjects } from "./public.ts";
import { readLootObject } from "./state.ts";
import { parseFoundationActionProposal } from "../foundation-actions/validation.ts";

/** Positive current Actor knowledge only. Private contents/definitions stay out. */
export function lootActionOptions(context: LoopContext, actorId: string) {
  const actor = context.world.actors.find(
    (a) => a.id === actorId && a.control === "player",
  );
  if (!actor?.entityId) return [];
  return projectLootObjects(context, actorId).map((object) => {
    const version = readLootObject(context, object.id)!;
    return {
      ...object,
      actorId,
      actorEntityId: actor.entityId,
      discoveryCheck: version.policy.discoveryCheck,
      approaches: version.policy.approaches
        .filter((a) => actor.capabilities.includes(a.capability))
        .map((a) => ({
          id: a.id,
          capability: a.capability,
          from: a.from,
          lockClass: a.lockClass,
          structureClass: a.structureClass,
          environmentTags: a.environmentTags,
          requiresPortable: a.requiresPortable,
          check: a.check,
        })),
      destinations: context.snapshot.storages
        .filter((s) => s.entity_id === actor.entityId)
        .map((s) => ({ id: s.id, label: s.name })),
    };
  });
}

/** A non-Entity check target is allowed only for this exact trusted object route. */
export function lootCheckAuthorized(
  source: RuntimeSource,
  input: TurnInput,
  plan: DmPlan,
  check: CheckProposal,
): boolean {
  try {
    if (
      input.mode !== "game" ||
      plan.publicPatches.length ||
      check.visibility !== "player" ||
      check.uncertainty !== "meaningful" ||
      check.kind !== check.stat
    )
      return false;
    const proposal = parseFoundationActionProposal(plan.foundationAction);
    if (
      proposal.action !== "loot" ||
      proposal.input !== input.input ||
      proposal.intent.kind === "take" ||
      proposal.intent.objectId !== check.targetId
    )
      return false;
    const intent = proposal.intent;
    const pinned = source.lootChecks?.find(
      (row) =>
        row.actorId === intent.actorId &&
        row.entityId === check.actorId &&
        row.objectId === check.targetId &&
        row.kind === intent.kind &&
        (intent.kind !== "access" || row.approachId === intent.approachId),
    );
    if (pinned) {
      const required = pinned.requirement;
      return Boolean(
        required &&
        typeof required === "object" &&
        !Array.isArray(required) &&
        required.index === check.index &&
        required.stat === check.stat &&
        required.dc === check.dc,
      );
    }
    const options = source.foundationOptions?.loot;
    if (!Array.isArray(options)) return false;
    const object = options.find(
      (o) =>
        o &&
        typeof o === "object" &&
        !Array.isArray(o) &&
        o.id === check.targetId &&
        o.actorId === proposal.intent.actorId &&
        o.actorEntityId === check.actorId,
    );
    if (!object || typeof object !== "object" || Array.isArray(object))
      return false;
    let requirement = object.discoveryCheck;
    if (proposal.intent.kind === "access") {
      const approachId = proposal.intent.approachId;
      if (!Array.isArray(object.approaches)) return false;
      const approach = object.approaches.find(
        (a) =>
          a &&
          typeof a === "object" &&
          !Array.isArray(a) &&
          a.id === approachId,
      );
      if (!approach || typeof approach !== "object" || Array.isArray(approach))
        return false;
      requirement = approach.check;
    }
    return Boolean(
      requirement &&
      typeof requirement === "object" &&
      !Array.isArray(requirement) &&
      requirement.index === check.index &&
      requirement.stat === check.stat &&
      requirement.dc === check.dc,
    );
  } catch {
    return false;
  }
}

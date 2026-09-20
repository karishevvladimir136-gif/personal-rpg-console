import { isDeepStrictEqual } from "node:util";
import type { JsonObject } from "../gameplay/contracts.ts";
import type {
  RecordChange,
  RuntimeSource,
} from "../gameplay/server-contracts.ts";
import type { FoundationSnapshot } from "../production/contracts.ts";
import {
  ensure,
  integer,
  list,
  literal,
  object,
  text,
  unique,
  uuid,
} from "../world-library/validation.ts";
import type { WorldActor, WorldState } from "./contracts.ts";

/** A finite, versioned World Logic vocabulary. These are proposals, never patches. */
export type WorldConsequence =
  | {
      kind: "inventory.consume";
      actorId: string;
      itemId: string;
      quantity: number;
    }
  | {
      kind: "resource.spend";
      actorId: string;
      resource: string;
      amount: number;
    }
  | {
      kind: "condition.add" | "condition.remove";
      actorId: string;
      condition: "wet" | "cold" | "tired" | "hungry" | "thirsty" | "dirty";
    }
  | {
      kind: "actor.relocate";
      actorId: string;
      fromLocationId: string;
      toLocationId: string;
    }
  | {
      kind: "fact.observe";
      family: "entities" | "locations" | "quests";
      recordId: string;
    }
  | { kind: "quest.complete"; questId: string };

export type WorldConsequenceAuthority = {
  family: "entities" | "items" | "quests" | "world.actors";
  id: string;
  expectedRevision: number;
  before: JsonObject;
  after: JsonObject;
};
export type WorldConsequenceFact = {
  family: "entities" | "locations" | "quests";
  recordId: string;
  text: string;
};
export type WorldConsequenceInput = {
  snapshot: FoundationSnapshot;
  source: RuntimeSource;
  world: WorldState;
  consequences: WorldConsequence[];
  mode: "action" | "resolver";
  /** Action: exactly the initiating controlled actor. Resolver: established decision actors. */
  decisionActorIds: string[];
  /** Action uses exact capability keys; resolver uses actorId:capability keys. */
  capabilityRefs: string[];
  action: "observe" | "speak" | "attempt" | "move" | "wait" | null;
  elapsedMinutes: number;
};
export type WorldConsequenceResult =
  | {
      status: "paused";
      reason: "unsupported" | "player_agency" | "knowledge_required";
    }
  | {
      status: "applied";
      changes: RecordChange[];
      nextWorld: WorldState;
      facts: WorldConsequenceFact[];
      publicTexts: string[];
      authority: WorldConsequenceAuthority[];
    };

export const WORLD_LOGIC_CONDITIONS = [
  "wet",
  "cold",
  "tired",
  "hungry",
  "thirsty",
  "dirty",
] as const;

function key(value: unknown): string {
  const result = text(value, 48);
  ensure(
    /^[a-z][a-z0-9_-]*$/.test(result) &&
      !["constructor", "prototype", "__proto__"].includes(result),
  );
  return result;
}
export function parseWorldConsequence(value: unknown): WorldConsequence {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value));
  const kind = (value as Record<string, unknown>).kind;
  if (kind === "inventory.consume") {
    const v = object(value, ["kind", "actorId", "itemId", "quantity"]);
    return {
      kind,
      actorId: uuid(v.actorId),
      itemId: uuid(v.itemId),
      quantity: integer(v.quantity, 1, 20),
    };
  }
  if (kind === "resource.spend") {
    const v = object(value, ["kind", "actorId", "resource", "amount"]);
    return {
      kind,
      actorId: uuid(v.actorId),
      resource: key(v.resource),
      amount: integer(v.amount, 1, 20),
    };
  }
  if (kind === "condition.add" || kind === "condition.remove") {
    const v = object(value, ["kind", "actorId", "condition"]);
    return {
      kind,
      actorId: uuid(v.actorId),
      condition: literal(v.condition, WORLD_LOGIC_CONDITIONS),
    };
  }
  if (kind === "actor.relocate") {
    const v = object(value, [
      "kind",
      "actorId",
      "fromLocationId",
      "toLocationId",
    ]);
    return {
      kind,
      actorId: uuid(v.actorId),
      fromLocationId: uuid(v.fromLocationId),
      toLocationId: uuid(v.toLocationId),
    };
  }
  if (kind === "fact.observe") {
    const v = object(value, ["kind", "family", "recordId"]);
    return {
      kind,
      family: literal(v.family, ["entities", "locations", "quests"] as const),
      recordId: uuid(v.recordId),
    };
  }
  const v = object(value, ["kind", "questId"]);
  return {
    kind: literal(v.kind, ["quest.complete"] as const),
    questId: uuid(v.questId),
  };
}
function consequenceTarget(effect: WorldConsequence): string {
  switch (effect.kind) {
    case "inventory.consume":
      return `item:${effect.itemId}`;
    case "resource.spend":
      return `resource:${effect.actorId}:${effect.resource}`;
    case "condition.add":
    case "condition.remove":
      return `condition:${effect.actorId}:${effect.condition}`;
    case "actor.relocate":
      return `actor:${effect.actorId}`;
    case "fact.observe":
      return `fact:${effect.family}:${effect.recordId}`;
    case "quest.complete":
      return `quest:${effect.questId}`;
  }
}
export function parseWorldConsequences(value: unknown): WorldConsequence[] {
  return unique(list(value, parseWorldConsequence, 6), consequenceTarget);
}
export function consequenceCapability(effect: WorldConsequence): string {
  switch (effect.kind) {
    case "inventory.consume":
      return `world.consume:${effect.itemId}`;
    case "resource.spend":
      return `world.spend:${effect.resource}`;
    case "condition.add":
    case "condition.remove":
      return `world.${effect.kind}:${effect.condition}`;
    case "actor.relocate":
      return `world.relocate:${effect.actorId}:${effect.toLocationId}`;
    case "fact.observe":
      return `world.observe:${effect.family}:${effect.recordId}`;
    case "quest.complete":
      return `world.complete:${effect.questId}`;
  }
}

/** Merge disjoint fields only. Revisions and overlapping writes must agree exactly. */
export function mergeConsequenceChanges(
  ...groups: readonly RecordChange[][]
): RecordChange[] {
  const result: RecordChange[] = [];
  for (const change of groups.flat()) {
    const previous = result.find(
      (p) => p.family === change.family && p.id === change.id,
    );
    if (!previous) result.push(structuredClone(change));
    else {
      ensure(previous.expectedRevision === change.expectedRevision, "conflict");
      for (const [field, value] of Object.entries(change.values)) {
        ensure(
          !Object.hasOwn(previous.values, field) ||
            isDeepStrictEqual(previous.values[field], value),
          "conflict",
        );
        previous.values[field] = structuredClone(value);
      }
    }
  }
  return result;
}

/** No model text is interpreted here. All authority comes from current scoped records. */
export function applyWorldConsequences(
  input: WorldConsequenceInput,
): WorldConsequenceResult {
  const effects = parseWorldConsequences(input.consequences);
  const { source, snapshot, mode } = input;
  ensure(
    input.world.campaignId === snapshot.campaignId &&
      source.ownerId === snapshot.ownerId &&
      source.snapshot.campaign.id === snapshot.campaignId &&
      source.runtime.campaignId === snapshot.campaignId &&
      source.runtime.revision === snapshot.runtimeRevision &&
      source.runtime.worldMinutes === snapshot.worldMinutes,
    "conflict",
  );
  if (source.runtime.timeline)
    ensure(
      isDeepStrictEqual(source.runtime.timeline, snapshot.timeline),
      "conflict",
    );
  if (source.snapshot.timeline)
    ensure(
      isDeepStrictEqual(source.snapshot.timeline, snapshot.timeline),
      "conflict",
    );
  integer(input.elapsedMinutes, 0, 1_000_000_000);
  const world = structuredClone(input.world);
  const actors = new Map(world.actors.map((a) => [a.id, a]));
  const scoped = <T extends { id: string; campaign_id: string }>(
    rows: T[],
    id: string,
  ): T => {
    const matches = rows.filter(
      (r) => r.id === id && r.campaign_id === snapshot.campaignId,
    );
    ensure(matches.length === 1, "scope");
    return matches[0];
  };
  const protectedIds = new Set([
    ...source.snapshot.entities
      .filter((e) => e.kind === "player")
      .map((e) => e.id),
    ...(source.runtime.configuration?.controlledEntityIds ?? []),
    ...world.actors
      .filter((a) => a.control === "player")
      .map((a) => a.entityId ?? a.id),
  ]);
  const decisions = unique(input.decisionActorIds.map(uuid)).map((id) => {
    const a = actors.get(id);
    ensure(a && a.campaignId === snapshot.campaignId, "scope");
    return a;
  });
  if (mode === "action") {
    if (effects.length > 0)
      ensure(
        decisions.length === 1 &&
          protectedIds.has(decisions[0].entityId ?? decisions[0].id),
        "scope",
      );
  } else if (decisions.some((a) => protectedIds.has(a.entityId ?? a.id)))
    return { status: "paused", reason: "player_agency" };
  const authority: WorldConsequenceAuthority[] = [];
  const facts: Extract<WorldConsequenceResult, { status: "applied" }>["facts"] =
    [];
  const publicTexts: string[] = [];
  const russian = source.snapshot.campaign.language === "ru";
  const say = (en: string, ru: string) => publicTexts.push(russian ? ru : en);
  const unsupported = (): WorldConsequenceResult => ({
    status: "paused",
    reason: "unsupported",
  });
  const currentLocation = source.snapshot.publicState.current_location_id;
  const write = (
    family: Exclude<WorldConsequenceAuthority["family"], "world.actors">,
    id: string,
    revision: number,
    before: JsonObject,
    after: JsonObject,
  ) => {
    integer(revision, 0);
    authority.push({
      family,
      id,
      expectedRevision: revision,
      before: structuredClone(before),
      after: structuredClone(after),
    });
  };
  // Any unresolved mechanical operation belongs to its owning interpreter, not this one.
  if (
    effects.some((e) => e.kind !== "fact.observe") &&
    (source.runtime.encounters.some((e) => e.status === "active") ||
      source.runtime.restRecords.some((r) => r.status === "planned") ||
      source.runtime.pendingActions.some(
        (p) => p.status === "proposed" || p.status === "confirmed",
      ))
  )
    return unsupported();
  for (const effect of effects) {
    const cap = consequenceCapability(effect);
    let target: WorldActor | null = null;
    if ("actorId" in effect) {
      target = actors.get(effect.actorId) ?? null;
      ensure(target && target.campaignId === snapshot.campaignId, "scope");
      if (mode === "resolver" && protectedIds.has(target.entityId ?? target.id))
        return { status: "paused", reason: "player_agency" };
      if (mode === "resolver" && !decisions.some((a) => a.id === target!.id))
        return unsupported();
      if (
        mode === "action" &&
        effect.kind !== "actor.relocate" &&
        target.id !== decisions[0].id
      )
        return { status: "paused", reason: "player_agency" };
    }
    const holders =
      mode === "action" || target === null || effect.kind === "actor.relocate"
        ? decisions
        : decisions.filter((a) => a.id === target.id);
    if (
      !holders.some(
        (a) =>
          a.capabilities.includes(cap) &&
          input.capabilityRefs.includes(
            mode === "action" ? cap : `${a.id}:${cap}`,
          ),
      )
    )
      return unsupported();
    if (effect.kind === "actor.relocate") {
      if (protectedIds.has(target!.entityId ?? target!.id))
        return { status: "paused", reason: "player_agency" };
      scoped(source.snapshot.locations, effect.fromLocationId);
      const destination = scoped(
        source.snapshot.locations,
        effect.toLocationId,
      );
      if (
        effect.fromLocationId === effect.toLocationId ||
        target!.locationId !== effect.fromLocationId ||
        !["known", "visited"].includes(destination.status) ||
        input.elapsedMinutes <= 0
      )
        return unsupported();
      if (
        mode === "action" &&
        (target!.publicName === null ||
          target!.locationId !== currentLocation ||
          !["attempt", "speak", "move"].includes(input.action!))
      )
        return unsupported();
      const before = {
        locationId: target!.locationId,
        revision: target!.revision,
      };
      target!.locationId = effect.toLocationId;
      target!.revision += 1;
      authority.push({
        family: "world.actors",
        id: target!.id,
        expectedRevision: before.revision,
        before,
        after: { locationId: target!.locationId, revision: target!.revision },
      });
      if (mode === "action")
        say(
          `${target!.publicName} reaches ${destination.name}.`,
          `${target!.publicName} прибывает: ${destination.name}.`,
        );
    } else if (effect.kind === "inventory.consume") {
      const item = scoped(source.snapshot.items, effect.itemId);
      const storage = scoped(source.snapshot.storages, item.storage_id);
      if (
        target!.entityId === null ||
        item.owner_entity_id !== target!.entityId ||
        storage.entity_id !== target!.entityId ||
        item.equipped_entity_id !== null ||
        item.equipped_slot !== null ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < effect.quantity ||
        (mode === "action" &&
          !["attempt", "move", "wait"].includes(input.action!))
      )
        return unsupported();
      write(
        "items",
        item.id,
        item.revision,
        { quantity: item.quantity },
        { quantity: item.quantity - effect.quantity },
      );
      if (mode === "action")
        say(
          `${item.name}: ${effect.quantity} consumed.`,
          `${item.name}: израсходовано ${effect.quantity}.`,
        );
    } else if (effect.kind === "resource.spend") {
      if (target!.entityId === null) return unsupported();
      const entity = scoped(source.snapshot.entities, target!.entityId);
      const value = entity.resources[effect.resource];
      if (
        !Object.hasOwn(entity.resources, effect.resource) ||
        !Number.isSafeInteger(value) ||
        value < effect.amount ||
        (mode === "action" &&
          !["attempt", "move", "speak"].includes(input.action!))
      )
        return unsupported();
      const previous = authority.find(
        (a) =>
          a.family === "entities" &&
          a.id === entity.id &&
          Object.hasOwn(a.after, "resources"),
      );
      const resources = structuredClone(
        previous ? previous.after.resources : entity.resources,
      ) as Record<string, number>;
      resources[effect.resource] = value - effect.amount;
      if (previous) previous.after.resources = resources;
      else
        write(
          "entities",
          entity.id,
          entity.revision,
          { resources: entity.resources },
          { resources },
        );
      if (mode === "action")
        say(
          `${entity.name}: ${effect.amount} ${effect.resource} spent.`,
          `${entity.name}: потрачено ${effect.amount} (${effect.resource}).`,
        );
    } else if (
      effect.kind === "condition.add" ||
      effect.kind === "condition.remove"
    ) {
      if (target!.entityId === null) return unsupported();
      const entity = scoped(source.snapshot.entities, target!.entityId);
      const present = entity.conditions.includes(effect.condition);
      if (
        present === (effect.kind === "condition.add") ||
        (mode === "action" &&
          !["attempt", "move", "wait"].includes(input.action!))
      )
        return unsupported();
      const previous = authority.find(
        (a) =>
          a.family === "entities" &&
          a.id === entity.id &&
          Object.hasOwn(a.after, "conditions"),
      );
      const conditions = [
        ...(previous
          ? (previous.after.conditions as string[])
          : entity.conditions),
      ];
      const after =
        effect.kind === "condition.add"
          ? [...conditions, effect.condition]
          : conditions.filter((c) => c !== effect.condition);
      if (after.length > 50) return unsupported();
      if (previous) previous.after.conditions = after;
      else
        write(
          "entities",
          entity.id,
          entity.revision,
          { conditions: entity.conditions },
          { conditions: after },
        );
      if (mode === "action")
        say(
          `${entity.name}: ${effect.condition} ${effect.kind === "condition.add" ? "added" : "removed"}.`,
          `${entity.name}: ${effect.condition} — ${effect.kind === "condition.add" ? "добавлено" : "снято"}.`,
        );
    } else if (effect.kind === "quest.complete") {
      const quest = scoped(source.snapshot.quests, effect.questId);
      // A timer, even one bearing a capability string, cannot finish the player's objective.
      if (
        mode !== "action" ||
        input.action !== "attempt" ||
        quest.status !== "open"
      )
        return unsupported();
      write(
        "quests",
        quest.id,
        quest.revision,
        { status: quest.status },
        { status: "complete" },
      );
      say(
        `Objective completed: ${quest.title}.`,
        `Цель достигнута: ${quest.title}.`,
      );
    } else if (effect.kind === "fact.observe") {
      let fact: string;
      if (effect.family === "locations") {
        const location = scoped(source.snapshot.locations, effect.recordId);
        if (
          mode === "action"
            ? location.id !== currentLocation
            : !decisions.some((a) => a.locationId === location.id)
        )
          return unsupported();
        fact = location.description;
      } else if (effect.family === "entities") {
        const entity = scoped(source.snapshot.entities, effect.recordId);
        const known = world.actors.find(
          (a) => a.entityId === entity.id && a.publicName !== null,
        );
        if (
          !known ||
          known.locationId === null ||
          (mode === "action"
            ? known.locationId !== currentLocation
            : !decisions.some((a) => a.locationId === known.locationId))
        )
          return unsupported();
        fact = entity.details;
      } else {
        const quest = scoped(source.snapshot.quests, effect.recordId);
        if (quest.status === "archived") return unsupported();
        fact = quest.description;
      }
      if (
        !fact.trim() ||
        fact.length > 4000 ||
        (mode === "action" &&
          !["observe", "attempt", "speak"].includes(input.action!))
      )
        return unsupported();
      facts.push({
        family: effect.family,
        recordId: effect.recordId,
        text: text(fact, 4000),
      });
      if (mode === "action") publicTexts.push(fact);
    }
  }
  const changes = mergeConsequenceChanges(
    authority.flatMap((a) =>
      a.family === "world.actors"
        ? []
        : [
            {
              family: a.family,
              id: a.id,
              expectedRevision: a.expectedRevision,
              values: a.after,
            },
          ],
    ),
  );
  return {
    status: "applied",
    changes,
    nextWorld: world,
    facts,
    publicTexts,
    authority,
  };
}

import type { EvidenceLocator } from "../production/contracts.ts";
import type { WorldPolicy, WorldState } from "./contracts.ts";

export class WorldValidationError extends Error {
  readonly code: "invalid_world" | "stale_world";
  constructor(code: "invalid_world" | "stale_world" = "invalid_world") {
    super(
      code === "stale_world"
        ? "World state changed. Review and retry."
        : "World configuration requires review.",
    );
    this.name = "WorldValidationError";
    this.code = code;
  }
}
export function requireWorld(
  value: unknown,
  code: "invalid_world" | "stale_world" = "invalid_world",
): asserts value {
  if (!value) throw new WorldValidationError(code);
}
export function object(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  requireWorld(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  const result = value as Record<string, unknown>;
  requireWorld(
    Object.keys(result).length === keys.length &&
      Object.keys(result).every((key) => keys.includes(key)),
  );
  return result;
}
export function uuid(value: unknown): asserts value is string {
  requireWorld(
    typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        value,
      ),
  );
}
export function minute(value: unknown): asserts value is number {
  requireWorld(
    Number.isSafeInteger(value) &&
      (value as number) >= 0 &&
      (value as number) <= 1_000_000_000,
  );
}
function text(value: unknown, max = 4000): asserts value is string {
  requireWorld(
    typeof value === "string" && value.trim().length > 0 && value.length <= max,
  );
}
function choice(value: unknown, options: readonly string[]) {
  requireWorld(typeof value === "string" && options.includes(value));
}
function nullableUuid(value: unknown) {
  if (value !== null) uuid(value);
}
function nullableText(value: unknown) {
  if (value !== null) text(value);
}
export function array(value: unknown, max: number): unknown[] {
  requireWorld(Array.isArray(value) && value.length <= max);
  return value;
}
export function ids(value: unknown, max = 128): string[] {
  const result = array(value, max);
  result.forEach(uuid);
  requireWorld(new Set(result).size === result.length);
  return result as string[];
}
export function parseEvidence(value: unknown): EvidenceLocator {
  const row = object(value, [
    "ownerId",
    "sourceId",
    "sourceVersionId",
    "locator",
    "digest",
    "visibility",
    "knowledge",
  ]);
  uuid(row.ownerId);
  uuid(row.sourceId);
  uuid(row.sourceVersionId);
  const locator = object(row.locator, ["kind", "value"]);
  choice(locator.kind, ["text", "page", "section", "image"]);
  text(locator.value, 1000);
  requireWorld(
    typeof row.digest === "string" && /^[0-9a-f]{64}$/i.test(row.digest),
  );
  choice(row.visibility, ["public", "private"]);
  choice(row.knowledge, [
    "source",
    "canon_at_entry",
    "character",
    "future_source",
  ]);
  return structuredClone(value) as EvidenceLocator;
}
function evidence(value: unknown, publicOnly = false) {
  for (const entry of array(value, 32)) {
    const parsed = parseEvidence(entry);
    if (publicOnly)
      requireWorld(
        parsed.visibility === "public" && parsed.knowledge === "character",
      );
  }
}
export function parseWorldPolicy(value: unknown): WorldPolicy {
  const row = object(value, ["simulation", "autonomy", "deadlinePressure"]);
  requireWorld(typeof row.simulation === "boolean");
  choice(row.autonomy, ["low", "moderate", "high"]);
  choice(row.deadlinePressure, ["off", "critical_only", "normal"]);
  return structuredClone(value) as WorldPolicy;
}
const families = [
  "entities",
  "items",
  "quests",
  "locations",
  "public_state",
  "conversations",
  "rest_records",
  "recipes",
  "effects",
  "encounters",
  "encounter_participants",
  "pending_actions",
  "provenance",
];

export function parseWorldState(
  value: unknown,
  campaignId: string,
): WorldState {
  uuid(campaignId);
  const row = object(value, [
    "schemaVersion",
    "campaignId",
    "policy",
    "policyChangedAtWorldMinutes",
    "actors",
    "threads",
    "hooks",
    "warnings",
  ]);
  requireWorld(row.schemaVersion === 1 && row.campaignId === campaignId);
  parseWorldPolicy(row.policy);
  minute(row.policyChangedAtWorldMinutes);
  for (const raw of array(row.actors, 256)) {
    const actor = object(raw, [
      "id",
      "campaignId",
      "revision",
      "kind",
      "entityId",
      "control",
      "publicName",
      "locationId",
      "capabilities",
      "knowledge",
    ]);
    uuid(actor.id);
    requireWorld(actor.campaignId === campaignId);
    minute(actor.revision);
    choice(actor.kind, ["entity", "group", "faction", "location"]);
    nullableUuid(actor.entityId);
    nullableUuid(actor.locationId);
    nullableText(actor.publicName);
    requireWorld(
      actor.kind === "entity"
        ? actor.entityId === actor.id
        : actor.entityId === null,
    );
    choice(actor.control, ["player", "autonomous"]);
    const capabilities = array(actor.capabilities, 32);
    capabilities.forEach((item) => text(item, 100));
    requireWorld(new Set(capabilities).size === capabilities.length);
    evidence(actor.knowledge);
  }
  for (const raw of array(row.threads, 128)) {
    const thread = object(raw, [
      "id",
      "campaignId",
      "revision",
      "title",
      "publicTitle",
      "actorIds",
      "decisionActorIds",
      "locationIds",
      "prerequisiteThreadIds",
      "status",
      "cursor",
      "steps",
    ]);
    uuid(thread.id);
    requireWorld(thread.campaignId === campaignId);
    minute(thread.revision);
    text(thread.title);
    nullableText(thread.publicTitle);
    ids(thread.actorIds, 24);
    ids(thread.decisionActorIds, 24);
    ids(thread.locationIds, 24);
    ids(thread.prerequisiteThreadIds, 16);
    choice(thread.status, ["active", "resolved", "paused"]);
    minute(thread.cursor);
    const steps = array(thread.steps, 8);
    requireWorld(steps.length > 0 && (thread.cursor as number) <= steps.length);
    requireWorld(
      thread.status === "resolved"
        ? thread.cursor === steps.length
        : (thread.cursor as number) < steps.length,
    );
    for (const rawStep of steps) {
      const step = object(rawStep, [
        "id",
        "trigger",
        "resolution",
        "consequence",
        "privateText",
        "evidence",
        "publicOutcome",
        "warning",
        "hookChanges",
      ]);
      uuid(step.id);
      requireWorld(step.trigger !== null && typeof step.trigger === "object");
      const triggerKind = (step.trigger as Record<string, unknown>).kind;
      if (triggerKind === "deadline") {
        const trigger = object(step.trigger, [
          "kind",
          "atWorldMinutes",
          "scenarioCritical",
          "established",
        ]);
        minute(trigger.atWorldMinutes);
        requireWorld(
          typeof trigger.scenarioCritical === "boolean" &&
            typeof trigger.established === "boolean",
        );
        requireWorld(!trigger.scenarioCritical || trigger.established);
      } else if (triggerKind === "autonomy") {
        const trigger = object(step.trigger, [
          "kind",
          "atWorldMinutes",
          "scope",
        ]);
        minute(trigger.atWorldMinutes);
        choice(trigger.scope, ["local", "related", "broad"]);
      } else {
        const trigger = object(step.trigger, ["kind", "family", "recordId"]);
        requireWorld(trigger.kind === "causal");
        choice(trigger.family, families);
        uuid(trigger.recordId);
      }
      choice(step.resolution, ["deterministic", "resolver_required"]);
      choice(step.consequence, [
        "background",
        "surface_before_complete",
        "hard_deadline",
      ]);
      if (step.consequence === "hard_deadline")
        requireWorld(
          triggerKind === "deadline" &&
            (step.trigger as Record<string, unknown>).established,
        );
      text(step.privateText);
      evidence(step.evidence);
      if (step.publicOutcome !== null) {
        const outcome = object(step.publicOutcome, [
          "text",
          "actorIds",
          "evidence",
        ]);
        text(outcome.text);
        ids(outcome.actorIds, 24);
        evidence(outcome.evidence, true);
      }
      if (step.warning !== null) {
        const warning = object(step.warning, [
          "forStepId",
          "opportunityMinutes",
          "recipientActorIds",
        ]);
        uuid(warning.forStepId);
        minute(warning.opportunityMinutes);
        requireWorld(
          (warning.opportunityMinutes as number) > 0 &&
            step.publicOutcome !== null &&
            ids(warning.recipientActorIds, 24).length > 0,
        );
      }
      for (const rawChange of array(step.hookChanges, 16)) {
        const change = object(rawChange, ["hookId", "status"]);
        uuid(change.hookId);
        choice(change.status, ["resolved", "expired"]);
      }
    }
  }
  for (const raw of array(row.hooks, 128)) {
    const hook = object(raw, [
      "id",
      "campaignId",
      "locationId",
      "threadId",
      "privatePremise",
      "status",
      "discovery",
    ]);
    uuid(hook.id);
    requireWorld(hook.campaignId === campaignId);
    uuid(hook.locationId);
    nullableUuid(hook.threadId);
    text(hook.privatePremise);
    choice(hook.status, ["latent", "discovered", "resolved", "expired"]);
    requireWorld(hook.status !== "latent" || hook.discovery === null);
    requireWorld(hook.status !== "discovered" || hook.discovery !== null);
    if (hook.discovery !== null) {
      const discovery = object(hook.discovery, [
        "label",
        "text",
        "kind",
        "eventId",
        "evidence",
      ]);
      text(discovery.label, 200);
      text(discovery.text);
      choice(discovery.kind, [
        "observation",
        "geography",
        "rumor",
        "clue",
        "map",
        "public_event",
      ]);
      nullableUuid(discovery.eventId);
      evidence(discovery.evidence, true);
      requireWorld(
        discovery.kind !== "public_event" || discovery.eventId !== null,
      );
    }
  }
  for (const raw of array(row.warnings, 1024)) {
    const warning = object(raw, [
      "stepId",
      "eventId",
      "atWorldMinutes",
      "opportunityUntilWorldMinutes",
      "recipientActorIds",
    ]);
    uuid(warning.stepId);
    uuid(warning.eventId);
    minute(warning.atWorldMinutes);
    minute(warning.opportunityUntilWorldMinutes);
    requireWorld(
      (warning.opportunityUntilWorldMinutes as number) >
        (warning.atWorldMinutes as number),
    );
    requireWorld(ids(warning.recipientActorIds, 24).length > 0);
  }
  const world = structuredClone(value) as WorldState;
  const actors = new Map(world.actors.map((actor) => [actor.id, actor]));
  const threads = new Map(world.threads.map((thread) => [thread.id, thread]));
  const hooks = new Map(world.hooks.map((hook) => [hook.id, hook]));
  const steps = world.threads.flatMap((thread) => thread.steps);
  const allIds = [
    ...actors.keys(),
    ...threads.keys(),
    ...hooks.keys(),
    ...steps.map((step) => step.id),
  ];
  requireWorld(
    new Set(allIds).size ===
      world.actors.length +
        world.threads.length +
        world.hooks.length +
        steps.length,
  );
  for (const thread of world.threads) {
    requireWorld(thread.actorIds.every((id) => actors.has(id)));
    requireWorld(
      thread.decisionActorIds.every((id) => thread.actorIds.includes(id)),
    );
    requireWorld(
      thread.prerequisiteThreadIds.every(
        (id) => id !== thread.id && threads.has(id),
      ),
    );
    for (const [index, step] of thread.steps.entries()) {
      requireWorld(
        step.hookChanges.every(
          (change) => hooks.get(change.hookId)?.threadId === thread.id,
        ),
      );
      requireWorld(
        new Set(step.hookChanges.map((change) => change.hookId)).size ===
          step.hookChanges.length,
      );
      requireWorld(
        step.publicOutcome?.actorIds.every(
          (id) =>
            thread.actorIds.includes(id) && actors.get(id)?.publicName !== null,
        ) ?? true,
      );
      if (step.warning) {
        requireWorld(
          thread.steps
            .slice(index + 1)
            .some(
              (next) =>
                next.id === step.warning?.forStepId &&
                next.consequence === "surface_before_complete",
            ),
        );
        requireWorld(
          step.warning.recipientActorIds.every(
            (id) => actors.get(id)?.control === "player",
          ),
        );
      }
    }
  }
  requireWorld(
    world.hooks.every(
      (hook) => hook.threadId === null || threads.has(hook.threadId),
    ),
  );
  requireWorld(
    new Set(world.warnings.map((warning) => warning.stepId)).size ===
      world.warnings.length,
  );
  for (const warning of world.warnings) {
    requireWorld(
      steps.some(
        (step) =>
          step.id === warning.stepId &&
          step.consequence === "surface_before_complete",
      ),
    );
    requireWorld(
      warning.recipientActorIds.every(
        (id) => actors.get(id)?.control === "player",
      ),
    );
    requireWorld(
      world.threads.some((thread) =>
        thread.steps
          .slice(0, thread.cursor)
          .some((step) => step.warning?.forStepId === warning.stepId),
      ),
    );
  }
  // Cyclic prerequisites never become a silent permanently-starved queue.
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    requireWorld(!visiting.has(id));
    if (visited.has(id)) return;
    visiting.add(id);
    threads.get(id)!.prerequisiteThreadIds.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  world.threads.forEach((thread) => visit(thread.id));
  return world;
}

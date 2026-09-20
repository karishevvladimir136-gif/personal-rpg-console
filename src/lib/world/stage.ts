import { isDeepStrictEqual } from "node:util";
import type { JsonObject } from "../gameplay/contracts.ts";
import type {
  EvidenceLocator,
  FoundationSnapshot,
  WorldEventDraft,
  WorldSettlement,
} from "../production/contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import type {
  WorldStageInput,
  WorldStageResult,
  WorldStep,
  WorldThread,
} from "./contracts.ts";
import {
  array,
  ids,
  minute,
  object,
  parseWorldState,
  requireWorld,
  uuid,
} from "./validation.ts";

export function validateFoundationSnapshot(snapshot: FoundationSnapshot): void {
  const row = object(snapshot, [
    "schemaVersion",
    "ownerId",
    "campaignId",
    "timeline",
    "revision",
    "runtimeRevision",
    "headId",
    "worldMinutes",
    "world",
    "bindings",
    "ruleset",
    "executionPolicy",
  ]);
  requireWorld(row.schemaVersion === 1);
  uuid(snapshot.ownerId);
  uuid(snapshot.campaignId);
  object(snapshot.timeline, ["timelineId", "epoch"]);
  uuid(snapshot.timeline.timelineId);
  minute(snapshot.timeline.epoch);
  minute(snapshot.revision);
  minute(snapshot.runtimeRevision);
  minute(snapshot.worldMinutes);
  if (snapshot.headId !== null) uuid(snapshot.headId);
  for (const raw of array(snapshot.bindings, 32)) {
    const binding = object(raw, [
      "schemaVersion",
      "id",
      "campaignId",
      "ownerId",
      "packId",
      "packVersionId",
      "scenarioVersionId",
      "sourceVersionIds",
      "sourcePriority",
      "entry",
      "mappings",
    ]);
    requireWorld(
      binding.schemaVersion === 1 &&
        binding.ownerId === snapshot.ownerId &&
        binding.campaignId === snapshot.campaignId,
    );
    uuid(binding.id);
    uuid(binding.packId);
    uuid(binding.packVersionId);
    if (binding.scenarioVersionId !== null) uuid(binding.scenarioVersionId);
    const sourceIds = ids(binding.sourceVersionIds, 128);
    const priority = ids(binding.sourcePriority, 128);
    requireWorld(
      sourceIds.length === priority.length &&
        priority.every((id) => sourceIds.includes(id)),
    );
    const entry = object(binding.entry, ["label", "worldMinutes", "evidence"]);
    minute(entry.worldMinutes);
    requireWorld(typeof entry.label === "string" && entry.label.length <= 1000);
    array(entry.evidence, 32);
    for (const rawMapping of array(binding.mappings, 512)) {
      const mapping = object(rawMapping, ["packEntityId", "entityId"]);
      uuid(mapping.packEntityId);
      uuid(mapping.entityId);
    }
  }
  const ruleset = object(snapshot.ruleset, [
    "id",
    "version",
    "mode",
    "validatorVersion",
  ]);
  requireWorld(
    typeof ruleset.id === "string" &&
      ruleset.id.length > 0 &&
      typeof ruleset.validatorVersion === "string" &&
      ruleset.validatorVersion.length > 0,
  );
  minute(ruleset.version);
  requireWorld(
    ["full_ruleset", "world_logic", "custom_ruleset"].includes(
      ruleset.mode as string,
    ),
  );
  if (snapshot.world !== null)
    parseWorldState(snapshot.world, snapshot.campaignId);
}

function sourceVersions(snapshot: FoundationSnapshot): string[] {
  return [
    ...new Set(
      snapshot.bindings.flatMap((binding) => binding.sourceVersionIds),
    ),
  ].sort();
}
function evidenceKey(evidence: EvidenceLocator) {
  return [
    evidence.ownerId,
    evidence.sourceId,
    evidence.sourceVersionId,
    evidence.locator.kind,
    evidence.locator.value,
    evidence.digest,
    evidence.visibility,
    evidence.knowledge,
  ].join("\u0000");
}
function validateInput(input: WorldStageInput) {
  const { snapshot, command, source, resolution } = input;
  validateFoundationSnapshot(snapshot);
  object(command, [
    "operationId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
  ]);
  uuid(command.operationId);
  object(command.timeline, ["timelineId", "epoch"]);
  uuid(command.timeline.timelineId);
  minute(command.timeline.epoch);
  requireWorld(
    command.campaignId === snapshot.campaignId &&
      command.timeline.timelineId === snapshot.timeline.timelineId &&
      command.timeline.epoch === snapshot.timeline.epoch &&
      command.expectedRevision === snapshot.revision &&
      command.expectedRuntimeRevision === snapshot.runtimeRevision &&
      command.expectedHeadId === snapshot.headId &&
      source.ownerId === snapshot.ownerId &&
      source.snapshot.campaign.id === snapshot.campaignId &&
      source.runtime.campaignId === snapshot.campaignId &&
      source.runtime.revision === snapshot.runtimeRevision &&
      source.runtime.worldMinutes === snapshot.worldMinutes,
    "stale_world",
  );
  if (source.runtime.timeline)
    requireWorld(
      isDeepStrictEqual(source.runtime.timeline, snapshot.timeline),
      "stale_world",
    );
  minute(resolution.worldMinutes);
  requireWorld(resolution.worldMinutes >= snapshot.worldMinutes);
  requireWorld(
    [
      "action",
      "travel",
      "rest",
      "time_skip",
      "state_change",
      "session_boundary",
      "none",
    ].includes(input.trigger),
  );
  requireWorld(
    input.trigger !== "session_boundary" ||
      resolution.worldMinutes === snapshot.worldMinutes,
  );
  array(resolution.changes, 200);
}
const budgets = {
  low: { threads: 3, actors: 8 },
  moderate: { threads: 8, actors: 16 },
  high: { threads: 12, actors: 24 },
} as const;

/**
 * Pure proposal, never persistence or provider work. Call only after trusted mechanics.
 * Staged/paused results must remain inside the initiating turn; no player time/costs
 * are committed until the Lead's atomic settlement succeeds.
 */
export function stageWorldTransition(input: WorldStageInput): WorldStageResult {
  validateInput(input);
  const { snapshot, command, source, resolution, trigger } = input;
  if (snapshot.world === null || trigger === "none")
    return { status: "noop", modelRequests: 0 };
  if (
    trigger !== "session_boundary" &&
    resolution.worldMinutes === snapshot.worldMinutes &&
    resolution.changes.length === 0
  )
    return { status: "noop", modelRequests: 0 };
  const world = parseWorldState(snapshot.world, snapshot.campaignId);
  requireWorld(world.policyChangedAtWorldMinutes <= snapshot.worldMinutes);
  const originalWarnings = world.warnings;
  const nextWorld = structuredClone(world);
  const actors = new Map(world.actors.map((actor) => [actor.id, actor]));
  const legacyPlayers = source.snapshot.entities
    .filter((entity) => entity.kind === "player")
    .map((entity) => entity.id);
  const protectedEntities = new Set([
    ...legacyPlayers,
    ...(source.runtime.configuration?.controlledEntityIds ?? []),
    ...(resolution.configuration?.controlledEntityIds ?? []),
  ]);
  const protectedActors = new Set(
    world.actors
      .filter(
        (actor) =>
          actor.control === "player" ||
          (actor.entityId !== null && protectedEntities.has(actor.entityId)),
      )
      .map((actor) => actor.id),
  );
  for (const actor of world.actors) {
    if (actor.kind === "entity")
      requireWorld(
        source.snapshot.entities.some(
          (entity) =>
            entity.id === actor.entityId &&
            entity.campaign_id === snapshot.campaignId,
        ),
      );
    if (actor.locationId !== null)
      requireWorld(
        source.snapshot.locations.some(
          (location) =>
            location.id === actor.locationId &&
            location.campaign_id === snapshot.campaignId,
        ),
      );
  }
  for (const thread of world.threads)
    requireWorld(
      thread.locationIds.every((id) =>
        source.snapshot.locations.some(
          (location) =>
            location.id === id && location.campaign_id === snapshot.campaignId,
        ),
      ),
    );
  for (const hook of world.hooks)
    requireWorld(
      source.snapshot.locations.some(
        (location) =>
          location.id === hook.locationId &&
          location.campaign_id === snapshot.campaignId,
      ),
    );
  const boundVersions = sourceVersions(snapshot);
  const allEvidence = [
    ...world.actors.flatMap((actor) => actor.knowledge),
    ...world.threads.flatMap((thread) =>
      thread.steps.flatMap((step) => [
        ...step.evidence,
        ...(step.publicOutcome?.evidence ?? []),
      ]),
    ),
    ...world.hooks.flatMap((hook) => hook.discovery?.evidence ?? []),
  ];
  for (const item of allEvidence)
    requireWorld(
      item.ownerId === snapshot.ownerId &&
        boundVersions.includes(item.sourceVersionId),
    );
  const limits = budgets[world.policy.autonomy];
  const touchedThreads = new Set<string>();
  const touchedActors = new Set<string>();
  const events: WorldEventDraft[] = [];
  let boundary = snapshot.worldMinutes;
  function eligible(thread: WorldThread, step: WorldStep): number | null {
    if (step.trigger.kind === "causal") {
      return null;
    }
    if (!world.policy.simulation) return null;
    if (step.trigger.atWorldMinutes > resolution.worldMinutes) return null;
    if (step.trigger.kind === "deadline") {
      if (
        world.policy.deadlinePressure === "off" ||
        (world.policy.deadlinePressure === "critical_only" &&
          (!step.trigger.scenarioCritical || !step.trigger.established))
      )
        return null;
    } else {
      // Timed autonomy may never smuggle expiry through Deadline Off.
      if (
        world.policy.deadlinePressure !== "normal" &&
        (thread.cursor === thread.steps.length - 1 ||
          step.hookChanges.length > 0 ||
          step.consequence !== "background")
      )
        return null;
      const scope = ["local", "related", "broad"].indexOf(step.trigger.scope);
      const maxScope = ["low", "moderate", "high"].indexOf(
        world.policy.autonomy,
      );
      if (scope > maxScope) return null;
      if (scope === 0 && thread.locationIds.length > 0) {
        const locations = new Set([
          source.snapshot.publicState.current_location_id,
          ...resolution.changes
            .filter((change) => change.family === "public_state")
            .map((change) => change.values.current_location_id),
        ]);
        if (!thread.locationIds.some((id) => locations.has(id))) return null;
      }
    }
    return Math.max(boundary, step.trigger.atWorldMinutes);
  }
  while (true) {
    const candidates = nextWorld.threads
      .flatMap((thread) => {
        if (
          thread.status !== "active" ||
          !thread.prerequisiteThreadIds.every(
            (id) =>
              nextWorld.threads.find((candidate) => candidate.id === id)
                ?.status === "resolved",
          )
        )
          return [];
        const step = thread.steps[thread.cursor];
        let at: number | null;
        if (step.trigger.kind === "causal") {
          const causal = step.trigger;
          at = resolution.changes.some(
            (change) =>
              change.family === causal.family &&
              change.id === causal.recordId &&
              Object.keys(change.values).length > 0,
          )
            ? resolution.worldMinutes
            : null;
        } else at = eligible(thread, step);
        return at === null ? [] : [{ thread, step, at }];
      })
      .sort(
        (a, b) =>
          a.at - b.at ||
          a.thread.id.localeCompare(b.thread.id) ||
          a.step.id.localeCompare(b.step.id),
      );
    if (candidates.length === 0) break;
    const { thread, step, at } = candidates[0];
    touchedThreads.add(thread.id);
    thread.actorIds.forEach((id) => touchedActors.add(id));
    const eventCount = step.publicOutcome ? 2 : 1;
    if (
      touchedThreads.size > limits.threads ||
      touchedActors.size > limits.actors ||
      events.length + eventCount > 8
    )
      return { status: "paused", reason: "work_limit", modelRequests: 0 };
    if (thread.decisionActorIds.some((id) => protectedActors.has(id)))
      return { status: "paused", reason: "player_agency", modelRequests: 0 };
    if (step.resolution !== "deterministic")
      return {
        status: "paused",
        reason: "resolver_required",
        modelRequests: 0,
      };
    if (
      step.evidence.some(
        (item) =>
          item.knowledge === "source" || item.knowledge === "future_source",
      ) ||
      thread.decisionActorIds.some((id) =>
        step.evidence.some(
          (item) =>
            !actors
              .get(id)!
              .knowledge.some(
                (known) => evidenceKey(known) === evidenceKey(item),
              ),
        ),
      )
    )
      return {
        status: "paused",
        reason: "knowledge_required",
        modelRequests: 0,
      };
    if (step.consequence === "surface_before_complete") {
      const warning = originalWarnings.find(
        (item) =>
          item.stepId === step.id &&
          item.recipientActorIds.some((id) => protectedActors.has(id)),
      );
      // A warning generated in this very proposal never counts as prior agency.
      if (
        !warning ||
        warning.opportunityUntilWorldMinutes > snapshot.worldMinutes ||
        warning.atWorldMinutes >= snapshot.worldMinutes
      )
        return {
          status: "paused",
          reason: "warning_required",
          modelRequests: 0,
        };
    }
    boundary = at;
    const privateId = stableGameplayId(
      command.operationId,
      "world-v1:" + thread.id + ":" + step.id + ":private",
    );
    events.push({
      schemaVersion: 1,
      id: privateId,
      campaignId: snapshot.campaignId,
      originTimelineId: snapshot.timeline.timelineId,
      operationId: command.operationId,
      worldMinutes: at,
      kind: "world.thread.advanced",
      actorIds: [...thread.actorIds],
      threadIds: [thread.id],
      visibility: "private",
      text: step.privateText,
      evidence: structuredClone(step.evidence),
      payload: {
        schemaVersion: 1,
        stepId: step.id,
        previousCursor: thread.cursor,
        nextCursor: thread.cursor + 1,
        hookChanges: structuredClone(step.hookChanges),
      },
    });
    if (step.publicOutcome) {
      const publicId = stableGameplayId(
        command.operationId,
        "world-v1:" + thread.id + ":" + step.id + ":public",
      );
      events.push({
        schemaVersion: 1,
        id: publicId,
        campaignId: snapshot.campaignId,
        originTimelineId: snapshot.timeline.timelineId,
        operationId: command.operationId,
        worldMinutes: at,
        kind: "world.observed",
        actorIds: [...step.publicOutcome.actorIds],
        threadIds: thread.publicTitle === null ? [] : [thread.id],
        visibility: "public",
        text: step.publicOutcome.text,
        evidence: structuredClone(step.publicOutcome.evidence),
        payload: {},
      });
      if (step.warning) {
        requireWorld(
          !nextWorld.warnings.some(
            (warning) => warning.stepId === step.warning!.forStepId,
          ),
        );
        const opportunityUntilWorldMinutes =
          at + step.warning.opportunityMinutes;
        minute(opportunityUntilWorldMinutes);
        nextWorld.warnings.push({
          stepId: step.warning.forStepId,
          eventId: publicId,
          atWorldMinutes: at,
          opportunityUntilWorldMinutes,
          recipientActorIds: [...step.warning.recipientActorIds],
        });
      }
    }
    for (const change of step.hookChanges) {
      const hook = nextWorld.hooks.find(
        (candidate) => candidate.id === change.hookId,
      )!;
      requireWorld(hook.status !== "resolved" && hook.status !== "expired");
      hook.status = change.status;
    }
    thread.cursor += 1;
    thread.revision += 1;
    if (thread.cursor === thread.steps.length) thread.status = "resolved";
  }
  if (events.length === 0) return { status: "noop", modelRequests: 0 };
  parseWorldState(nextWorld, snapshot.campaignId);
  const settlement: WorldSettlement = {
    ...structuredClone(command),
    schemaVersion: 1,
    status: "staged",
    fromWorldMinutes: snapshot.worldMinutes,
    throughWorldMinutes: resolution.worldMinutes,
    sourceVersionIds: boundVersions,
    events,
    nextWorld: nextWorld as unknown as JsonObject,
  };
  return {
    status: "staged",
    settlement,
    modelRequests: 0,
    publicEvents: events
      .filter((event) => event.visibility === "public")
      .map((event) => ({
        id: event.id,
        worldMinutes: event.worldMinutes,
        text: event.text,
        actorIds: [...event.actorIds],
      })),
  };
}

/** Retry validation recomputes from the same pinned mechanics/source; no arbitrary patch path. */
export function validateWorldSettlement(
  input: WorldStageInput,
  proposed: unknown,
): WorldSettlement {
  const result = stageWorldTransition(input);
  requireWorld(
    result.status === "staged" &&
      isDeepStrictEqual(result.settlement, proposed),
    "stale_world",
  );
  return result.settlement;
}

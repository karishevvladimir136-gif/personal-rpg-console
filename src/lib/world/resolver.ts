import { isDeepStrictEqual } from "node:util";
import type {
  EvidenceLocator,
  WorldSettlement,
} from "../production/contracts.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import type { WorldStageInput, WorldStageResult } from "./contracts.ts";
import { stageWorldTransition } from "./stage.ts";
import { parseWorldState } from "./validation.ts";
import {
  applyWorldConsequences,
  consequenceCapability,
  mergeConsequenceChanges,
  parseWorldConsequences,
  WORLD_LOGIC_CONDITIONS,
  type WorldConsequence,
  type WorldConsequenceAuthority,
  type WorldConsequenceFact,
} from "./consequences.ts";
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

export type ResolverStepDecision = {
  threadId: string;
  stepId: string;
  decision: "advance" | "pause";
  uncertainty:
    "resolved" | "missing_evidence" | "contradiction" | "unsupported";
  capabilityRefs: string[];
  evidenceIndexes: number[];
};
export type ResolverProposal = {
  schemaVersion: 1;
  decisions: ResolverStepDecision[];
};
export type ResolverReceipt = ResolverStepDecision & {
  schemaVersion: 1;
  operationId: string;
};
export type ResolverCandidate = {
  threadId: string;
  stepId: string;
  atWorldMinutes: number;
  consequence: string;
  circumstance: string;
  actors: { id: string; capabilities: string[] }[];
  evidence: EvidenceLocator[];
  consequences: WorldConsequence[];
  requiredCapabilityRefs: string[];
  currentRecords: WorldConsequenceAuthority[];
  currentFacts: WorldConsequenceFact[];
};
export type ResolverSelection =
  | { status: "ready"; operationId: string; candidates: ResolverCandidate[] }
  | ResolverStageResult;
export type ResolverStageResult =
  | Exclude<WorldStageResult, { status: "staged" }>
  | (Extract<WorldStageResult, { status: "staged" }> & {
      consequenceChanges?: RecordChange[];
      consequenceAuthority?: WorldConsequenceAuthority[];
    })
  | {
      status: "paused";
      reason: "uncertainty" | "unsupported";
      modelRequests: 0;
    };

export function parseResolverProposal(value: unknown): ResolverProposal {
  const v = object(value, ["schemaVersion", "decisions"]);
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    decisions: unique(
      list(
        v.decisions,
        (raw) => {
          const d = object(raw, [
            "threadId",
            "stepId",
            "decision",
            "uncertainty",
            "capabilityRefs",
            "evidenceIndexes",
          ]);
          return {
            threadId: uuid(d.threadId),
            stepId: uuid(d.stepId),
            decision: literal(d.decision, ["advance", "pause"] as const),
            uncertainty: literal(d.uncertainty, [
              "resolved",
              "missing_evidence",
              "contradiction",
              "unsupported",
            ] as const),
            capabilityRefs: unique(
              list(d.capabilityRefs, (v) => text(v, 300), 32),
            ),
            evidenceIndexes: unique(
              list(d.evidenceIndexes, (v) => integer(v, 0, 31), 32),
            ),
          };
        },
        8,
      ),
      (d) => d.stepId,
    ),
  };
}

function selection(
  input: WorldStageInput,
  proposedConsequences = false,
): {
  result: ResolverStageResult;
  candidates: ResolverCandidate[];
} {
  // Validate the real input first. The dry run is only a selector, never committed.
  const initial = stageWorldTransition(input);
  if (initial.status !== "paused" || initial.reason !== "resolver_required")
    return { result: initial, candidates: [] };
  const original = parseWorldState(
    input.snapshot.world,
    input.snapshot.campaignId,
  );
  const speculative = structuredClone(original);
  for (const thread of speculative.threads)
    for (const step of thread.steps) {
      step.resolution = "deterministic";
      delete step.consequences;
    }
  const result = stageWorldTransition({
    ...input,
    snapshot: {
      ...input.snapshot,
      world: speculative as unknown as JsonObject,
    },
  });
  if (result.status !== "staged") return { result, candidates: [] };
  const candidates: ResolverCandidate[] = result.settlement.events.flatMap(
    (event) => {
      if (event.kind !== "world.thread.advanced") return [];
      const thread = original.threads.find((t) => t.id === event.threadIds[0])!;
      const step = thread.steps.find((s) => s.id === event.payload.stepId)!;
      if (step.resolution !== "resolver_required") return [];
      return [
        {
          threadId: thread.id,
          stepId: step.id,
          atWorldMinutes: event.worldMinutes,
          consequence: step.consequence,
          circumstance: step.privateText,
          actors: thread.decisionActorIds.map((id) => {
            const a = original.actors.find((a) => a.id === id)!;
            return { id, capabilities: [...a.capabilities] };
          }),
          evidence: structuredClone(step.evidence),
          consequences: structuredClone(step.consequences ?? []),
          requiredCapabilityRefs: (step.consequences ?? []).flatMap(
            (effect) => {
              const capability = consequenceCapability(effect);
              const actor = thread.decisionActorIds
                .map((id) => original.actors.find((a) => a.id === id)!)
                .find(
                  (a) =>
                    a.capabilities.includes(capability) &&
                    (!("actorId" in effect) ||
                      effect.kind === "actor.relocate" ||
                      effect.actorId === a.id),
                );
              return actor ? [`${actor.id}:${capability}`] : [];
            },
          ),
          currentRecords: [],
          currentFacts: [],
        },
      ];
    },
  );
  ensure(candidates.length > 0 && candidates.length <= 8);
  const touched = new Set(
    input.resolution.changes.map((c) => `${c.family}:${c.id}`),
  );
  for (const candidate of candidates) {
    if (proposedConsequences) continue;
    const applied = applyWorldConsequences({
      ...input,
      world: original,
      consequences: candidate.consequences,
      mode: "resolver",
      decisionActorIds: candidate.actors.map((a) => a.id),
      capabilityRefs: candidate.requiredCapabilityRefs,
      action: null,
      elapsedMinutes: candidate.atWorldMinutes - input.snapshot.worldMinutes,
    });
    if (applied.status === "paused")
      return { result: { ...applied, modelRequests: 0 }, candidates: [] };
    const targets = new Set(
      applied.authority.map((a) => `${a.family}:${a.id}`),
    );
    if ([...targets].some((key) => touched.has(key)))
      return {
        result: { status: "paused", reason: "unsupported", modelRequests: 0 },
        candidates: [],
      };
    targets.forEach((key) => touched.add(key));
    candidate.currentRecords = applied.authority;
    candidate.currentFacts = applied.facts;
    candidate.requiredCapabilityRefs = [
      ...new Set(candidate.requiredCapabilityRefs),
    ];
  }
  return { result, candidates };
}

/** No due work, policy exclusion, unknown evidence, agency and cap failures make zero requests. */
export function selectWorldResolverWork(
  input: WorldStageInput,
): ResolverSelection {
  const selected = selection(input);
  return selected.candidates.length
    ? {
        status: "ready",
        operationId: input.command.operationId,
        candidates: selected.candidates,
      }
    : selected.result;
}

/** Resolve only the exact preselected established consequences, never arbitrary model patches. */
export function stageResolvedWorldTransition(
  input: WorldStageInput,
  raw: unknown,
): ResolverStageResult {
  const { result, candidates } = selection(input);
  const proposal = parseResolverProposal(raw);
  ensure(
    proposal.decisions.length === candidates.length &&
      candidates.every((c) =>
        proposal.decisions.some(
          (d) => d.stepId === c.stepId && d.threadId === c.threadId,
        ),
      ),
    "conflict",
  );
  if (!candidates.length) return result;
  for (const candidate of candidates) {
    const decision = proposal.decisions.find(
      (d) => d.stepId === candidate.stepId,
    )!;
    const capabilities = new Set(
      candidate.actors.flatMap((a) =>
        a.capabilities.map((cap) => `${a.id}:${cap}`),
      ),
    );
    ensure(decision.capabilityRefs.every((ref) => capabilities.has(ref)));
    ensure(
      decision.evidenceIndexes.every((i) => i < candidate.evidence.length),
    );
    if (decision.decision !== "advance" || decision.uncertainty !== "resolved")
      return { status: "paused", reason: "uncertainty", modelRequests: 0 };
    ensure(
      candidate.requiredCapabilityRefs.every((ref) =>
        decision.capabilityRefs.includes(ref),
      ),
    );
    // Every mandatory source is acknowledged; unsupported/missing evidence cannot be dropped.
    ensure(decision.evidenceIndexes.length === candidate.evidence.length);
  }
  ensure(result.status === "staged");
  const settlement = structuredClone(result.settlement);
  const original = parseWorldState(
    input.snapshot.world,
    input.snapshot.campaignId,
  );
  let nextWorld = parseWorldState(
    settlement.nextWorld,
    input.snapshot.campaignId,
  );
  for (const thread of nextWorld.threads) {
    const previous = original.threads.find((t) => t.id === thread.id)!;
    for (const step of thread.steps) {
      const before = previous.steps.find((s) => s.id === step.id)!;
      step.resolution = before.resolution;
      if (Object.hasOwn(before, "consequences"))
        step.consequences = structuredClone(before.consequences);
    }
  }
  let consequenceChanges: RecordChange[] = [];
  const consequenceAuthority: WorldConsequenceAuthority[] = [];
  for (const candidate of candidates) {
    const decision = proposal.decisions.find(
      (d) => d.stepId === candidate.stepId,
    )!;
    const applied = applyWorldConsequences({
      ...input,
      world: nextWorld,
      consequences: candidate.consequences,
      mode: "resolver",
      decisionActorIds: candidate.actors.map((a) => a.id),
      capabilityRefs: decision.capabilityRefs,
      action: null,
      elapsedMinutes: candidate.atWorldMinutes - input.snapshot.worldMinutes,
    });
    if (applied.status === "paused") return { ...applied, modelRequests: 0 };
    if (
      !isDeepStrictEqual(applied.authority, candidate.currentRecords) ||
      !isDeepStrictEqual(applied.facts, candidate.currentFacts)
    )
      return { status: "paused", reason: "unsupported", modelRequests: 0 };
    nextWorld = applied.nextWorld;
    consequenceChanges = mergeConsequenceChanges(
      consequenceChanges,
      applied.changes,
    );
    consequenceAuthority.push(...applied.authority);
  }
  settlement.nextWorld = nextWorld as unknown as JsonObject;
  for (const event of settlement.events) {
    if (event.kind !== "world.thread.advanced") continue;
    const decision = proposal.decisions.find(
      (d) =>
        d.stepId === event.payload.stepId && d.threadId === event.threadIds[0],
    );
    if (decision) {
      event.payload.resolverReceipt = {
        schemaVersion: 1,
        operationId: input.command.operationId,
        ...structuredClone(decision),
      };
      const step = original.threads
        .find((t) => t.id === decision.threadId)!
        .steps.find((s) => s.id === decision.stepId)!;
      if (Object.hasOwn(step, "consequences")) {
        const candidate = candidates.find((c) => c.stepId === decision.stepId)!;
        event.payload.consequences = structuredClone(candidate.consequences);
        event.payload.consequenceAuthority = structuredClone(
          candidate.currentRecords,
        );
        event.payload.consequenceFacts = structuredClone(
          candidate.currentFacts,
        );
      }
    }
  }
  parseWorldState(nextWorld, input.snapshot.campaignId);
  return {
    ...result,
    settlement,
    ...(candidates.some((c) => c.consequences.length > 0)
      ? { consequenceChanges, consequenceAuthority }
      : {}),
  };
}

/** The persisted proposal, current exact inputs and stable operation ID reproduce the envelope. */
export function validateResolvedWorldSettlement(
  input: WorldStageInput,
  proposal: unknown,
  value: unknown,
): WorldSettlement {
  const result = stageResolvedWorldTransition(input, proposal);
  ensure(
    result.status === "staged" && isDeepStrictEqual(result.settlement, value),
    "conflict",
  );
  return result.settlement;
}

/** Server-derived D2A scope. A caller must reconstruct it from the exact approved
 * Scenario and positive actor knowledge; it is never a browser input. */
export type WorldSimulationScope = {
  schemaVersion: 1;
  scenarioVersionId: string;
  divergenceVersionId: string;
  language: "en" | "ru";
  locationId: string | null;
  atWorldMinutes: number;
  threadIds: string[];
  actorIds: string[];
  change: string;
  assumptions: string[];
  constraints: string[];
  unchangedBaseline: string[];
  knowledge: {
    threadId: string;
    records: { family: "entities" | "locations" | "quests"; id: string }[];
    excerpts: string[];
  }[];
};
export type SimulationResolverDecision = ResolverStepDecision & {
  consequences: WorldConsequence[];
};
export type SimulationResolverProposal = {
  schemaVersion: 2;
  decisions: SimulationResolverDecision[];
};
export type SimulationConsequenceOption = {
  capabilityRef: string;
  effect: WorldConsequence;
  maximum: number | null;
};
export type SimulationResolverCandidate = Omit<
  ResolverCandidate,
  "circumstance" | "currentRecords" | "currentFacts"
> & {
  branchAffected: boolean;
  knowledge: string[];
  consequenceOptions: SimulationConsequenceOption[];
};
export type SimulationResolverSelection =
  | {
      status: "ready";
      operationId: string;
      candidates: SimulationResolverCandidate[];
    }
  | ResolverStageResult;

export function parseSimulationResolverProposal(
  value: unknown,
): SimulationResolverProposal {
  const v = object(value, ["schemaVersion", "decisions"]);
  literal(v.schemaVersion, [2]);
  return {
    schemaVersion: 2,
    decisions: unique(
      list(
        v.decisions,
        (raw) => {
          const d = object(raw, [
            "threadId",
            "stepId",
            "decision",
            "uncertainty",
            "capabilityRefs",
            "evidenceIndexes",
            "consequences",
          ]);
          const { consequences, ...decision } = d;
          return {
            ...parseResolverProposal({
              schemaVersion: 1,
              decisions: [decision],
            }).decisions[0],
            consequences: parseWorldConsequences(consequences),
          };
        },
        8,
      ),
      (d) => d.stepId,
    ),
  };
}

function simulationInput(
  input: WorldStageInput,
  scope: WorldSimulationScope,
): WorldStageInput {
  const s = object(scope, [
    "schemaVersion",
    "scenarioVersionId",
    "divergenceVersionId",
    "language",
    "locationId",
    "atWorldMinutes",
    "threadIds",
    "actorIds",
    "change",
    "assumptions",
    "constraints",
    "unchangedBaseline",
    "knowledge",
  ]);
  literal(s.schemaVersion, [1]);
  uuid(s.scenarioVersionId);
  uuid(s.divergenceVersionId);
  literal(s.language, ["en", "ru"]);
  if (s.locationId !== null) uuid(s.locationId);
  integer(s.atWorldMinutes, 0, 1_000_000_000);
  unique(list(s.threadIds, uuid, 32));
  unique(list(s.actorIds, uuid, 32));
  text(s.change, 4000);
  for (const field of [s.assumptions, s.constraints, s.unchangedBaseline])
    list(field, (v) => text(v, 2000), 32);
  unique(
    list(
      s.knowledge,
      (raw) => {
        const k = object(raw, ["threadId", "records", "excerpts"]);
        uuid(k.threadId);
        unique(
          list(
            k.records,
            (rawRef) => {
              const r = object(rawRef, ["family", "id"]);
              return {
                family: literal(r.family, [
                  "entities",
                  "locations",
                  "quests",
                ] as const),
                id: uuid(r.id),
              };
            },
            128,
          ),
          (r) => `${r.family}:${r.id}`,
        );
        list(k.excerpts, (v) => text(v, 4000), 32);
        return k.threadId;
      },
      32,
    ),
  );
  const world = parseWorldState(
    input.snapshot.world,
    input.snapshot.campaignId,
  );
  ensure(
    scope.threadIds.every((id) => world.threads.some((t) => t.id === id)) &&
      scope.actorIds.every((id) => world.actors.some((a) => a.id === id)),
    "scope",
  );
  const proposed = structuredClone(world);
  for (const thread of proposed.threads) {
    if (!scope.threadIds.includes(thread.id)) continue;
    for (const step of thread.steps.slice(thread.cursor)) {
      const at =
        step.trigger.kind === "causal"
          ? input.resolution.worldMinutes
          : Math.max(input.snapshot.worldMinutes, step.trigger.atWorldMinutes);
      if (at >= scope.atWorldMinutes && at <= input.resolution.worldMinutes)
        step.resolution = "resolver_required";
    }
  }
  return {
    ...input,
    snapshot: { ...input.snapshot, world: proposed as unknown as JsonObject },
  };
}

function simulationOptions(
  input: WorldStageInput,
  candidate: ResolverCandidate,
  scope: WorldSimulationScope,
): SimulationConsequenceOption[] {
  const world = parseWorldState(
    input.snapshot.world,
    input.snapshot.campaignId,
  );
  const rows = input.source.snapshot;
  const known =
    scope.knowledge.find((k) => k.threadId === candidate.threadId)?.records ??
    [];
  const has = (family: "entities" | "locations" | "quests", id: string) =>
    known.some((r) => r.family === family && r.id === id);
  const result: SimulationConsequenceOption[] = [];
  for (const actor of candidate.actors) {
    if (scope.actorIds.length && !scope.actorIds.includes(actor.id)) continue;
    const current = world.actors.find((a) => a.id === actor.id)!;
    const entity = rows.entities.find((e) => e.id === current.entityId);
    for (const cap of actor.capabilities) {
      let effect: WorldConsequence | null = null,
        maximum: number | null = null;
      if (cap.startsWith("world.consume:")) {
        const item = rows.items.find((i) => i.id === cap.slice(14));
        if (!item || !Number.isSafeInteger(item.quantity) || item.quantity < 1)
          continue;
        effect = {
          kind: "inventory.consume",
          actorId: actor.id,
          itemId: item.id,
          quantity: 1,
        };
        maximum = Math.min(20, item.quantity);
      } else if (cap.startsWith("world.spend:")) {
        const resource = cap.slice(12);
        const value = entity?.resources[resource];
        if (
          !entity ||
          !/^[a-z][a-z0-9_-]{0,47}$/.test(resource) ||
          !Object.hasOwn(entity.resources, resource) ||
          typeof value !== "number" ||
          !Number.isSafeInteger(value) ||
          value < 1
        )
          continue;
        effect = {
          kind: "resource.spend",
          actorId: actor.id,
          resource,
          amount: 1,
        };
        maximum = Math.min(20, value);
      } else if (
        cap.startsWith("world.condition.add:") ||
        cap.startsWith("world.condition.remove:")
      ) {
        const [prefix, condition] = cap.split(":");
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
          actorId: actor.id,
          condition: condition as (typeof WORLD_LOGIC_CONDITIONS)[number],
        };
      } else if (cap.startsWith("world.relocate:")) {
        const [, actorId, toLocationId] = cap.split(":");
        const target = world.actors.find((a) => a.id === actorId);
        if (
          !target?.locationId ||
          !has("locations", toLocationId) ||
          (scope.actorIds.length && !scope.actorIds.includes(actorId))
        )
          continue;
        effect = {
          kind: "actor.relocate",
          actorId,
          fromLocationId: target.locationId,
          toLocationId,
        };
      } else if (cap.startsWith("world.observe:")) {
        const [, family, recordId] = cap.split(":");
        if (
          !["entities", "locations", "quests"].includes(family) ||
          !has(family as "entities" | "locations" | "quests", recordId)
        )
          continue;
        effect = {
          kind: "fact.observe",
          family: family as "entities" | "locations" | "quests",
          recordId,
        };
      }
      if (!effect) continue;
      if (scope.locationId !== null) {
        if (effect.kind === "actor.relocate") {
          if (
            effect.fromLocationId !== scope.locationId &&
            effect.toLocationId !== scope.locationId
          )
            continue;
        } else if (current.locationId !== scope.locationId) continue;
      }
      const capabilityRef = `${actor.id}:${cap}`;
      const applied = applyWorldConsequences({
        ...input,
        world,
        consequences: [effect],
        mode: "resolver",
        decisionActorIds: candidate.actors.map((a) => a.id),
        capabilityRefs: [capabilityRef],
        action: null,
        elapsedMinutes: candidate.atWorldMinutes - input.snapshot.worldMinutes,
      });
      if (applied.status === "applied")
        result.push({ capabilityRef, effect, maximum });
    }
  }
  ensure(result.length <= 128, "configuration");
  return result;
}

function simulationSelection(
  input: WorldStageInput,
  scope: WorldSimulationScope,
) {
  const selected = selection(simulationInput(input, scope), true);
  const world = parseWorldState(
    input.snapshot.world,
    input.snapshot.campaignId,
  );
  if (selected.result.status === "staged") {
    const next = parseWorldState(
      selected.result.settlement.nextWorld,
      input.snapshot.campaignId,
    );
    for (const t of next.threads)
      t.steps = structuredClone(
        world.threads.find((before) => before.id === t.id)!.steps,
      );
    selected.result.settlement.nextWorld = next as unknown as JsonObject;
  }
  if (!selected.candidates.length)
    return { result: selected.result, candidates: [] };
  const candidates: SimulationResolverCandidate[] = [];
  for (const c of selected.candidates) {
    const step = world.threads
      .find((t) => t.id === c.threadId)!
      .steps.find((s) => s.id === c.stepId)!;
    const branchAffected =
      scope.threadIds.includes(c.threadId) &&
      c.atWorldMinutes >= scope.atWorldMinutes;
    // These schedule mutations have no corresponding proposal vocabulary yet.
    if (
      branchAffected &&
      (step.warning !== null || step.hookChanges.length > 0)
    )
      return {
        result: {
          status: "paused",
          reason: "unsupported",
          modelRequests: 0,
        } as const,
        candidates: [],
      };
    const options = simulationOptions(input, c, {
      ...scope,
      actorIds: branchAffected ? scope.actorIds : [],
      locationId: branchAffected ? scope.locationId : null,
    });
    if (branchAffected && options.length === 0)
      return {
        result: {
          status: "paused",
          reason: "unsupported",
          modelRequests: 0,
        } as const,
        candidates: [],
      };
    if (
      !branchAffected &&
      c.consequences.some(
        (effect) => !options.some((o) => offeredEffect(effect, o)),
      )
    )
      return {
        result: {
          status: "paused",
          reason: "unsupported",
          modelRequests: 0,
        } as const,
        candidates: [],
      };
    candidates.push({
      threadId: c.threadId,
      stepId: c.stepId,
      atWorldMinutes: c.atWorldMinutes,
      consequence: c.consequence,
      actors: c.actors.map((a) => ({
        id: a.id,
        capabilities: a.capabilities.filter((cap) =>
          options.some((o) => o.capabilityRef === `${a.id}:${cap}`),
        ),
      })),
      evidence: c.evidence,
      consequences: branchAffected ? [] : c.consequences,
      requiredCapabilityRefs: branchAffected ? [] : c.requiredCapabilityRefs,
      branchAffected,
      knowledge:
        scope.knowledge.find((k) => k.threadId === c.threadId)?.excerpts ?? [],
      consequenceOptions: options,
    });
  }
  return { result: selected.result, candidates };
}

/** Selection is the same World eligibility pass, including all policy, warning,
 * agency, prerequisite and work-limit gates; no source text is a capability. */
export function selectWorldSimulationWork(
  input: WorldStageInput,
  scope: WorldSimulationScope,
): SimulationResolverSelection {
  const selected = simulationSelection(input, scope);
  return selected.candidates.length
    ? {
        status: "ready",
        operationId: input.command.operationId,
        candidates: selected.candidates,
      }
    : selected.result;
}

/** Context admission uses the same due-work pass, before reading/ranking actor
 * knowledge. An unrelated active or future thread cannot consume its budget. */
export function selectWorldSimulationThreadIds(
  input: WorldStageInput,
  scope: WorldSimulationScope,
): string[] {
  return [
    ...new Set(
      selection(simulationInput(input, scope), true).candidates.map(
        (c) => c.threadId,
      ),
    ),
  ];
}

function offeredEffect(
  effect: WorldConsequence,
  option: SimulationConsequenceOption,
): boolean {
  const expected = structuredClone(option.effect);
  if (effect.kind === "inventory.consume" && expected.kind === effect.kind) {
    if (effect.quantity > (option.maximum ?? 0)) return false;
    expected.quantity = effect.quantity;
  } else if (
    effect.kind === "resource.spend" &&
    expected.kind === effect.kind
  ) {
    if (effect.amount > (option.maximum ?? 0)) return false;
    expected.amount = effect.amount;
  }
  return isDeepStrictEqual(effect, expected);
}

/** Proposals choose consequences. Existing interpreters alone produce revisions,
 * ownership/resource checks, record changes and the final structured facts. */
export function stageSimulatedWorldTransition(
  input: WorldStageInput,
  scope: WorldSimulationScope,
  raw: unknown,
): ResolverStageResult {
  const { result, candidates } = simulationSelection(input, scope);
  const proposal = parseSimulationResolverProposal(raw);
  ensure(
    proposal.decisions.length === candidates.length &&
      candidates.every((c) =>
        proposal.decisions.some(
          (d) => d.threadId === c.threadId && d.stepId === c.stepId,
        ),
      ),
    "conflict",
  );
  if (!candidates.length) return result;
  ensure(result.status === "staged");
  const original = parseWorldState(
    input.snapshot.world,
    input.snapshot.campaignId,
  );
  const settlement = structuredClone(result.settlement);
  let world = parseWorldState(settlement.nextWorld, input.snapshot.campaignId);
  for (const t of world.threads)
    t.steps = structuredClone(
      original.threads.find((before) => before.id === t.id)!.steps,
    );
  const touched = new Set(
    input.resolution.changes.map((c) => `${c.family}:${c.id}`),
  );
  let consequenceChanges: RecordChange[] = [];
  const consequenceAuthority: WorldConsequenceAuthority[] = [];
  for (const candidate of candidates) {
    const decision = proposal.decisions.find(
      (d) => d.stepId === candidate.stepId,
    )!;
    const capabilities = new Set(
      candidate.actors.flatMap((a) =>
        a.capabilities.map((c) => `${a.id}:${c}`),
      ),
    );
    ensure(
      decision.capabilityRefs.every((r) => capabilities.has(r)) &&
        decision.evidenceIndexes.every((i) => i < candidate.evidence.length),
    );
    if (
      decision.decision !== "advance" ||
      decision.uncertainty !== "resolved"
    ) {
      ensure(decision.consequences.length === 0);
      return { status: "paused", reason: "uncertainty", modelRequests: 0 };
    }
    ensure(decision.evidenceIndexes.length === candidate.evidence.length);
    if (candidate.branchAffected) {
      if (!decision.consequences.length)
        return { status: "paused", reason: "unsupported", modelRequests: 0 };
    } else
      ensure(
        isDeepStrictEqual(decision.consequences, candidate.consequences),
        "conflict",
      );
    for (const effect of decision.consequences)
      ensure(
        candidate.consequenceOptions.some(
          (option) =>
            offeredEffect(effect, option) &&
            decision.capabilityRefs.includes(option.capabilityRef),
        ),
      );
    const applied = applyWorldConsequences({
      ...input,
      world,
      consequences: decision.consequences,
      mode: "resolver",
      decisionActorIds: candidate.actors.map((a) => a.id),
      capabilityRefs: decision.capabilityRefs,
      action: null,
      elapsedMinutes: candidate.atWorldMinutes - input.snapshot.worldMinutes,
    });
    if (applied.status !== "applied") return { ...applied, modelRequests: 0 };
    // Newly caused mandatory work needs its own World settlement. Do not drop
    // that work or commit a partial causal bundle in this bounded D2A slice.
    if (
      applied.nextWorld.threads.some((thread) => {
        if (thread.status !== "active") return false;
        const trigger = thread.steps[thread.cursor].trigger;
        return (
          trigger.kind === "causal" &&
          applied.changes.some(
            (change) =>
              change.family === trigger.family &&
              change.id === trigger.recordId &&
              Object.keys(change.values).length > 0,
          )
        );
      })
    )
      return { status: "paused", reason: "unsupported", modelRequests: 0 };
    const targets = new Set(
      applied.authority.map((a) => `${a.family}:${a.id}`),
    );
    if ([...targets].some((key) => touched.has(key)))
      return { status: "paused", reason: "unsupported", modelRequests: 0 };
    targets.forEach((key) => touched.add(key));
    world = applied.nextWorld;
    consequenceChanges = mergeConsequenceChanges(
      consequenceChanges,
      applied.changes,
    );
    consequenceAuthority.push(...applied.authority);
    const event = settlement.events.find(
      (e) =>
        e.kind === "world.thread.advanced" &&
        e.payload.stepId === candidate.stepId,
    )!;
    event.text = "Validated autonomous World consequences.";
    event.payload.resolverReceipt = {
      schemaVersion: 2,
      operationId: input.command.operationId,
      ...structuredClone(decision),
    };
    event.payload.consequences = structuredClone(decision.consequences);
    event.payload.consequenceAuthority = structuredClone(applied.authority);
    event.payload.consequenceFacts = structuredClone(applied.facts);
    // Only an already authorized public observation slot may carry a summary.
    // Text comes from validated effect kinds, never model prose or private facts.
    const labels: Record<WorldConsequence["kind"], string> =
      scope.language === "ru"
        ? {
            "inventory.consume": "Припасы израсходованы.",
            "resource.spend": "Ресурс израсходован.",
            "condition.add": "Возникло физическое состояние.",
            "condition.remove": "Физическое состояние прошло.",
            "actor.relocate": "Самостоятельный персонаж сменил местоположение.",
            "fact.observe": "Замечен установленный факт.",
            "quest.complete": "Цель выполнена.",
          }
        : {
            "inventory.consume": "Supplies are consumed.",
            "resource.spend": "A resource is spent.",
            "condition.add": "A physical condition takes effect.",
            "condition.remove": "A physical condition ends.",
            "actor.relocate": "An autonomous actor changes location.",
            "fact.observe": "An established fact is observed.",
            "quest.complete": "An objective is completed.",
          };
    const publicId = stableGameplayId(
      input.command.operationId,
      `world-v1:${candidate.threadId}:${candidate.stepId}:public`,
    );
    settlement.events = settlement.events.filter(
      (e) => e.id !== publicId || decision.consequences.length > 0,
    );
    const observation = settlement.events.find((e) => e.id === publicId);
    if (observation)
      observation.text = [
        ...new Set(decision.consequences.map((e) => labels[e.kind])),
      ].join(" ");
  }
  settlement.nextWorld = parseWorldState(
    world,
    input.snapshot.campaignId,
  ) as unknown as JsonObject;
  return {
    ...result,
    settlement,
    consequenceChanges,
    consequenceAuthority,
    publicEvents: settlement.events
      .filter((e) => e.visibility === "public")
      .map((e) => ({
        id: e.id,
        worldMinutes: e.worldMinutes,
        text: e.text,
        actorIds: [...e.actorIds],
      })),
  };
}

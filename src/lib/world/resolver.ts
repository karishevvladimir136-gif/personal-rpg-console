import { isDeepStrictEqual } from "node:util";
import type {
  EvidenceLocator,
  WorldSettlement,
} from "../production/contracts.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import type { WorldStageInput, WorldStageResult } from "./contracts.ts";
import { stageWorldTransition } from "./stage.ts";
import { parseWorldState } from "./validation.ts";
import {
  applyWorldConsequences,
  consequenceCapability,
  mergeConsequenceChanges,
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

function selection(input: WorldStageInput): {
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

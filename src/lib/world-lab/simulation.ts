// Detached D2A preparation only. No store, provider, active projection or write
// authority lives here. The existing writer recomputes this proof before commit.
import { isDeepStrictEqual } from "node:util";
import type { JsonObject } from "../gameplay/contracts.ts";
import { validateExecutionProfile } from "../model-runtime/registry.ts";
import type {
  EvidenceLocator,
  ExecutionProfile,
} from "../production/contracts.ts";
import type { WorldStageInput } from "../world/contracts.ts";
import {
  selectWorldSimulationWork,
  selectWorldSimulationThreadIds,
  stageSimulatedWorldTransition,
  parseSimulationResolverProposal,
  type ResolverStageResult,
  type SimulationResolverSelection,
  type WorldSimulationScope,
} from "../world/resolver.ts";
import { parseWorldState } from "../world/validation.ts";
import {
  ensure,
  integer,
  list,
  text,
  unique,
  uuid,
} from "../world-library/validation.ts";
import { buildLabMemoryBatch, retrieveLabMemory } from "./memory.ts";
import {
  buildLabWorldInput,
  labEvidencePinned,
  validateLabDetachedState,
} from "./runtime.ts";
import type { DetachedState } from "./server-contracts.ts";

type ApprovedComposition = {
  schemaVersion: 1;
  phase: "approved";
  language: "en" | "ru";
  simulationProfile: ExecutionProfile;
  originalProposal: {
    ambiguities: { question: string; consequential: boolean }[];
  };
  basis: {
    ownerId: string;
    campaignId: string;
    saveId: string;
    baseManifestId: string;
    baseTimelineId: string;
    canonGeneration: number;
    startWorldMinutes: number;
    sourceHeads: unknown;
    documents: unknown;
  };
  review: {
    changeDescription: string;
    divergenceType: string;
    offsetMinutes: number;
    locationIndex: number | null;
    affectedActorIndexes: number[];
    affectedThreadIndexes: number[];
    assumptions: string[];
    constraints: string[];
    unchangedBaseline: string[];
    policy: unknown;
    horizonMinutes: number;
    ambiguityAnswers: (string | null)[];
  };
  choices: {
    actors: { id: string; control: string }[];
    threads: { id: string }[];
    locations: { id: string }[];
    evidence: {
      text: string;
      origin: string;
      knowledge: string;
      knownActorIndexes: number[];
      locator: EvidenceLocator;
    }[];
  };
};
type LabSimulationPause = {
  status: "paused";
  reason: "review_required" | "unsupported" | "work_limit" | "source_changed";
  modelRequests: 0;
};
type PreparedBasis = {
  worldInput: WorldStageInput;
  scope: WorldSimulationScope;
  profile: ExecutionProfile;
};
export type LabSimulationPreparation =
  | LabSimulationPause
  | (PreparedBasis & {
      status: "ready";
      selection: Extract<SimulationResolverSelection, { status: "ready" }>;
      modelRequests: 0;
    })
  | (PreparedBasis & {
      status: "deterministic";
      result: Exclude<ResolverStageResult, { status: "paused" }>;
      modelRequests: 0;
    });
export type LabSimulationPlan =
  | LabSimulationPause
  | (PreparedBasis & {
      status: "staged";
      result: Exclude<ResolverStageResult, { status: "paused" }>;
      proof: JsonObject;
    });

function profileFor(state: DetachedState): ExecutionProfile {
  const input = state.run!.input as unknown as {
    executionProfile?: ExecutionProfile;
    resolutionPolicy: { id: string };
  };
  ensure(input.resolutionPolicy.id === "single-model-world-v1");
  return validateExecutionProfile(input.executionProfile, "world.resolve");
}

/** Reconstruct the private resolver scope from immutable approved Library
 * versions. Owner assumptions never become source facts or actor knowledge. */
export function buildLabSimulationScope(
  value: DetachedState,
): WorldSimulationScope {
  const state = validateLabDetachedState(value),
    run = state.run;
  ensure(run !== null, "conflict");
  profileFor(state);
  const scenario = state.libraryRecords.find(
    (r) => r.kind === "scenario" && r.versionId === run.input.scenarioVersionId,
  );
  const divergence = state.libraryRecords.find(
    (r) =>
      r.kind === "divergence" && r.versionId === run.input.divergenceVersionId,
  );
  ensure(
    scenario?.kind === "scenario" &&
      divergence?.kind === "divergence" &&
      scenario.body.status === "approved" &&
      scenario.body.approval?.ownerId === state.ownerId &&
      divergence.body.approval?.ownerId === state.ownerId &&
      divergence.body.scenarioVersionId === scenario.versionId,
  );
  const metadata = (
    scenario.body as unknown as { composition?: ApprovedComposition }
  ).composition;
  ensure(
    metadata?.schemaVersion === 1 &&
      metadata.phase === "approved" &&
      metadata.review &&
      metadata.choices,
  );
  ensure(
    isDeepStrictEqual(metadata.simulationProfile, profileFor(state)),
    "conflict",
  );
  const basis = metadata.basis;
  ensure(
    basis.ownerId === state.ownerId &&
      basis.campaignId === state.campaignId &&
      basis.saveId === run.input.base.saveId &&
      basis.baseManifestId === run.input.base.manifestId &&
      basis.baseTimelineId === run.input.base.timelineId &&
      basis.canonGeneration === run.input.canonGeneration &&
      basis.startWorldMinutes === run.input.startWorldMinutes &&
      isDeepStrictEqual(basis.sourceHeads, run.input.sourceHeads) &&
      isDeepStrictEqual(basis.documents, run.input.documentVersions),
    "conflict",
  );
  const review = metadata.review;
  ensure(
    divergence.body.changes.length === 1 &&
      divergence.body.changes[0].visibility === "public" &&
      divergence.body.changes[0].text === review.changeDescription,
    "conflict",
  );
  ensure(
    ["circumstance", "actor_intent", "resource"].includes(
      review.divergenceType,
    ),
  );
  const world = parseWorldState(
    state.records["rpg_private.world_foundations"][0].world,
    state.campaignId,
  );
  // Changing World policy needs its existing reconciliation authority. The
  // composition review cannot re-enable a deadline or authorize old backlog.
  ensure(isDeepStrictEqual(review.policy, world.policy));
  ensure(
    integer(review.horizonMinutes, 1, 43_200) ===
      run.input.throughWorldMinutes - run.input.startWorldMinutes,
  );
  const offset = integer(review.offsetMinutes, 0, 43_200);
  ensure(offset <= review.horizonMinutes);
  const actorIds = unique(
    list(
      review.affectedActorIndexes,
      (index) => {
        const choice =
          metadata.choices.actors[
            integer(index, 0, metadata.choices.actors.length - 1)
          ];
        const actor = world.actors.find((a) => a.id === uuid(choice.id));
        ensure(
          actor &&
            actor.control === choice.control &&
            actor.control === "autonomous",
        );
        return actor.id;
      },
      32,
    ),
  );
  const threadIds = unique([...new Set([
    ...list(
      review.affectedThreadIndexes,
      (index) => {
        const choice =
          metadata.choices.threads[
            integer(index, 0, metadata.choices.threads.length - 1)
          ];
        ensure(world.threads.some((t) => t.id === uuid(choice.id)));
        return choice.id;
      },
      32,
    ),
    ...world.threads
      .filter((t) => t.decisionActorIds.some((id) => actorIds.includes(id)))
      .map((t) => t.id),
  ])]);
  ensure(threadIds.length > 0 && threadIds.length <= 32);
  const locationId =
    review.locationIndex === null
      ? null
      : uuid(
          metadata.choices.locations[
            integer(
              review.locationIndex,
              0,
              metadata.choices.locations.length - 1,
            )
          ].id,
        );
  ensure(
    locationId === null ||
      state.records["public.rpg_locations"].some(
        (row) => row.id === locationId,
      ),
  );
  const scope: WorldSimulationScope = {
    schemaVersion: 1,
    scenarioVersionId: scenario.versionId,
    divergenceVersionId: divergence.versionId,
    language: metadata.language,
    locationId,
    atWorldMinutes: run.input.startWorldMinutes + offset,
    actorIds,
    threadIds,
    change: text(review.changeDescription, 4000),
    assumptions: [
      ...list(review.assumptions, (v) => text(v, 2000), 32),
      ...review.ambiguityAnswers.flatMap((answer, index) =>
        answer === null
          ? []
          : [
              text(
                `${metadata.originalProposal.ambiguities[index].question}\nOwner assumption: ${answer}`,
                2000,
              ),
            ],
      ),
    ],
    constraints: list(review.constraints, (v) => text(v, 2000), 32),
    unchangedBaseline: list(review.unchangedBaseline, (v) => text(v, 2000), 32),
    knowledge: [],
  };
  // Reuse the existing exact-manifest Memory adapter. Positive known_by and
  // source restrictions are checked before eligibility, ranking and limits.
  const through = nextBoundary(state, scope);
  const dueIds = selectWorldSimulationThreadIds(
    buildLabWorldInput(state, run.id, through),
    scope,
  );
  for (const thread of world.threads.filter((t) => dueIds.includes(t.id))) {
    if (!thread.decisionActorIds.length) continue;
    const request = {
      actorIds: [...thread.decisionActorIds],
      query: scope.change,
      entityIds: [],
      requiredSourceIds: [],
      maxBytes: 16_000,
      maxExcerpts: 12,
    };
    const sources = [],
      excerpts = [];
    for (const visibility of ["public", "private"] as const) {
      const selected = { ...request, visibility };
      sources.push(...buildLabMemoryBatch(state, selected).sources);
      const retrieved = retrieveLabMemory(state, selected);
      ensure(!retrieved.paused);
      excerpts.push(
        ...retrieved.sources.map((s) =>
          text(`${s.statementKind}: ${s.text}`, 4000),
        ),
      );
    }
    for (const known of metadata.choices.evidence) {
      if (
        known.knowledge !== "character" ||
        known.locator.knowledge !== "character" ||
        !labEvidencePinned(known.locator, state, "public") ||
        !thread.decisionActorIds.every((id) => {
          const index = metadata.choices.actors.findIndex((a) => a.id === id);
          return (
            index >= 0 &&
            known.knownActorIndexes.includes(index) &&
            world.actors
              .find((a) => a.id === id)!
              .knowledge.some((e) => isDeepStrictEqual(e, known.locator))
          );
        })
      )
        continue;
      excerpts.push(text(`${known.origin}: ${known.text}`, 4000));
    }
    const records = sources.flatMap((source) => {
      const family =
        source.ref.kind === "entity"
          ? ("entities" as const)
          : source.ref.kind === "location"
            ? ("locations" as const)
            : source.ref.kind === "quest"
              ? ("quests" as const)
              : null;
      const record = family
        ? state.records[`public.rpg_${family}`].find(
            (r) => r.id === source.ref.id,
          )
        : null;
      const fact =
        record && (family === "entities" ? record.details : record.description);
      return family &&
        typeof fact === "string" &&
        fact.trim().length > 0 &&
        source.text.includes(fact) &&
        source.sourceRefs.length === 0 &&
        source.statementKind === "fact" &&
        ["state", "correction", "canon"].includes(source.authority)
        ? [{ family, id: source.ref.id }]
        : [];
    });
    scope.knowledge.push({
      threadId: thread.id,
      records: [
        ...new Map(records.map((r) => [`${r.family}:${r.id}`, r])).values(),
      ],
      // Preserve epistemic markers: a rumor/intention never becomes a fact.
      excerpts,
    });
  }
  return scope;
}

function pause(reason: LabSimulationPause["reason"]): LabSimulationPause {
  return { status: "paused", reason, modelRequests: 0 };
}

function nextBoundary(
  state: DetachedState,
  scope: WorldSimulationScope,
): number {
  const run = state.run!;
  return Math.min(
    run.currentWorldMinutes + 60,
    run.input.throughWorldMinutes,
    scope.atWorldMinutes > run.currentWorldMinutes
      ? scope.atWorldMinutes
      : Number.MAX_SAFE_INTEGER,
  );
}

/** At most sixty minutes, one existing World eligibility pass and one optional
 * resolver request. Future typed steps do not block unrelated deterministic work. */
export function prepareLabSimulation(
  value: DetachedState,
  operationId: string,
): LabSimulationPreparation {
  try {
    const state = validateLabDetachedState(value),
      run = state.run;
    ensure(run !== null, "conflict");
    if (
      run.reason === "source_changed" ||
      state.canonGeneration !== run.input.canonGeneration
    )
      return pause("source_changed");
    const profile = profileFor(state),
      scope = buildLabSimulationScope(state);
    const through = nextBoundary(state, scope);
    const worldInput = buildLabWorldInput(state, operationId, through);
    const selected = selectWorldSimulationWork(worldInput, scope);
    if (selected.status === "paused")
      return pause(
        selected.reason === "work_limit"
          ? "work_limit"
          : selected.reason === "unsupported"
            ? "unsupported"
            : "review_required",
      );
    const events =
      selected.status === "staged" ? selected.settlement.events : [];
    if (
      events.filter((e) => e.kind === "world.thread.advanced").length >
      run.input.resolutionPolicy.maxSteps
    )
      return pause("work_limit");
    if (selected.status === "ready") {
      if (selected.candidates.length > run.input.resolutionPolicy.maxSteps)
        return pause("work_limit");
      if (
        selected.candidates.some((candidate) =>
          candidate.evidence.some(
            (e) => !labEvidencePinned(e, state, e.visibility),
          ),
        )
      )
        return pause("review_required");
      return {
        status: "ready",
        worldInput,
        scope,
        profile,
        selection: selected,
        modelRequests: 0,
      };
    }
    if (
      !events.every((e) =>
        e.evidence.every(
          (v) =>
            labEvidencePinned(v, state, e.visibility) &&
            (e.visibility !== "public" || v.knowledge === "character"),
        ),
      )
    )
      return pause("review_required");
    return {
      status: "deterministic",
      worldInput,
      scope,
      profile,
      result: selected,
      modelRequests: 0,
    };
  } catch {
    return pause("review_required");
  }
}

/** Pure recomputation for persisted provider-result retries and the single
 * detached writer. No caller-supplied settlement or record patch is accepted. */
export function stageLabSimulation(
  value: DetachedState,
  operationId: string,
  raw: unknown | null,
): LabSimulationPlan {
  const prepared = prepareLabSimulation(value, operationId);
  if (prepared.status === "paused") return prepared;
  const proposal =
    prepared.status === "ready" ? parseSimulationResolverProposal(raw) : null;
  ensure(proposal !== null || raw === null);
  const result =
    prepared.status === "ready"
      ? stageSimulatedWorldTransition(
          prepared.worldInput,
          prepared.scope,
          proposal,
        )
      : prepared.result;
  if (result.status === "paused")
    return pause(
      result.reason === "work_limit"
        ? "work_limit"
        : result.reason === "unsupported"
          ? "unsupported"
          : "review_required",
    );
  if (result.status === "staged") {
    const state = validateLabDetachedState(value);
    if (
      !result.settlement.events.every((event) =>
        event.evidence.every(
          (e) =>
            labEvidencePinned(e, state, event.visibility) &&
            (event.visibility !== "public" || e.knowledge === "character"),
        ),
      )
    )
      return pause("review_required");
  }
  const { worldInput, scope, profile } = prepared;
  return {
    status: "staged",
    worldInput,
    scope,
    profile,
    result,
    proof: {
      schemaVersion: 2,
      trigger: worldInput.trigger,
      executionProfile: structuredClone(profile) as unknown as JsonObject,
      scope: structuredClone(scope) as unknown as JsonObject,
      proposal: proposal as unknown as JsonObject | null,
      settlement:
        result.status === "staged"
          ? (result.settlement as unknown as JsonObject)
          : null,
      consequenceChanges:
        result.status === "staged"
          ? ((result.consequenceChanges ?? []) as unknown as JsonObject[])
          : [],
      consequenceAuthority:
        result.status === "staged"
          ? ((result.consequenceAuthority ?? []) as unknown as JsonObject[])
          : [],
    },
  };
}

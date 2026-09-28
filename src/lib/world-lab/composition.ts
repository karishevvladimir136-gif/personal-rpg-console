// Private composition authority. Browser code imports only the inert contracts
// and the field parser; this module reads immutable authorized detached state.
import { isDeepStrictEqual } from "node:util";
import type { ProviderUsage } from "../gameplay/server-contracts.ts";
import type { ExecutionProfile } from "../production/contracts.ts";
import type { DetachedState } from "./server-contracts.ts";
import type { DivergenceBody, TypedRecord } from "../world-library/types.ts";
import type {
  ComposeExecutionProfile,
  CompositionBasis,
  CompositionBlocker,
  CompositionChoices,
  CompositionMetadata,
  CompositionReview,
  CompositionScenarioBody,
  PublicComposition,
} from "./composition-contracts.ts";
import {
  canonicalLabJson,
  LAB_MAX_WORLD_MINUTES,
  parseLabDocumentPins,
  parseLabSourceHeads,
} from "./inputs.ts";
import {
  assertCompositionChoices,
  COMPOSITION_LIMITS,
  compositionFieldNames,
  compositionNeedsTimingReview,
  compositionTimingConfirmed,
  initialCompositionReview,
  parseCompositionPolicy,
  parseCompositionReview,
  validateCompositionProposal,
} from "./composition-validation.ts";
import {
  parseDivergence,
  parseEvidence,
  parseLibraryRecord,
  parseScenario,
  sha256,
} from "../world-library/parsers.ts";
import { parseBinding } from "../world-packs/bindings.ts";
import { parseWorldState } from "../world/validation.ts";
import { labEvidencePinned, validateLabDetachedState } from "./runtime.ts";
import { assertLabContinuationBasis, parseLabContinuationBasis } from "./checkpoint-basis.ts";
import {
  registryVersion,
  validateExecutionProfile,
  validateModelSelection,
} from "../model-runtime/registry.ts";
import {
  digest,
  ensure,
  ids,
  integer,
  list,
  literal,
  nullable,
  object,
  sameSet,
  text,
  unique,
  uuid,
} from "../foundation-loop/fields.ts";

export function parseComposeExecutionProfile(
  value: unknown,
): ComposeExecutionProfile {
  const v = object(value, [
    "schemaVersion",
    "id",
    "policyRevision",
    "registryVersion",
    "task",
    "providerId",
    "modelId",
    "reasoning",
  ]);
  const selected = validateModelSelection({
    providerId: v.providerId,
    modelId: v.modelId,
    reasoning: v.reasoning,
  });
  ensure(
    v.reasoning !== null && v.registryVersion === registryVersion,
    "configuration",
  );
  return {
    ...selected,
    schemaVersion: literal(v.schemaVersion, [1]),
    id: uuid(v.id),
    policyRevision: integer(v.policyRevision),
    registryVersion,
    task: literal(v.task, ["world.compose"]),
  };
}

function basisHash(
  b: Omit<CompositionBasis, "basisDigest"> | CompositionBasis,
) {
  return sha256(
    canonicalLabJson({
      ownerId: b.ownerId,
      campaignId: b.campaignId,
      saveId: b.saveId,
      manifestId: b.baseManifestId,
      canonGeneration: b.canonGeneration,
      sourceHeads: b.sourceHeads,
      documents: b.documents,
      ...(b.continuation ? { continuation: b.continuation } : {}),
    }),
  );
}

export function parseCompositionBasis(value: unknown): CompositionBasis {
  const v = object(value, [
    "ownerId",
    "campaignId",
    "saveId",
    "baseManifestId",
    "baseTimelineId",
    "canonGeneration",
    "basisDigest",
    "sourceHeads",
    "documents",
    "packVersionIds",
    "sourceVersionIds",
    "startWorldMinutes",
    ...(value && typeof value === "object" && Object.hasOwn(value, "continuation") ? ["continuation"] : []),
  ]);
  const b: CompositionBasis = {
    ownerId: uuid(v.ownerId),
    campaignId: uuid(v.campaignId),
    saveId: uuid(v.saveId),
    baseManifestId: uuid(v.baseManifestId),
    baseTimelineId: uuid(v.baseTimelineId),
    canonGeneration: integer(v.canonGeneration),
    basisDigest: digest(v.basisDigest),
    sourceHeads: parseLabSourceHeads(v.sourceHeads),
    documents: parseLabDocumentPins(v.documents),
    packVersionIds: ids(v.packVersionIds),
    sourceVersionIds: ids(v.sourceVersionIds),
    startWorldMinutes: integer(
      v.startWorldMinutes,
      0,
      LAB_MAX_WORLD_MINUTES - 1,
    ),
  };
  if (Object.hasOwn(v, "continuation")) {
    b.continuation = parseLabContinuationBasis(v.continuation);
    ensure(b.baseManifestId === b.continuation.sourceCheckpointId, "conflict");
  }
  ensure(b.basisDigest === basisHash(b), "conflict");
  return b;
}

function parseChoices(
  value: unknown,
  basis: CompositionBasis,
): CompositionChoices {
  const v = object(value, [
    "actors",
    "locations",
    "threads",
    "evidence",
    "policy",
  ]);
  const indexList = (v: unknown) =>
    unique(list(v, (n) => integer(n, 0, 63), 64));
  const choices: CompositionChoices = {
    policy: parseCompositionPolicy(v.policy),
    actors: unique(
      list(
        v.actors,
        (value) => {
          const a = object(value, ["id", "label", "control"]);
          return {
            id: uuid(a.id),
            label: text(a.label, 240),
            control: literal(a.control, ["player", "autonomous"] as const),
          };
        },
        COMPOSITION_LIMITS.actors,
      ),
      (a) => a.id,
    ),
    locations: unique(
      list(
        v.locations,
        (value) => {
          const a = object(value, ["id", "label"]);
          return { id: uuid(a.id), label: text(a.label, 240) };
        },
        COMPOSITION_LIMITS.locations,
      ),
      (a) => a.id,
    ),
    threads: unique(
      list(
        v.threads,
        (value) => {
          const t = object(value, [
            "id",
            "label",
            "actorIndexes",
            "locationIndexes",
          ]);
          return {
            id: uuid(t.id),
            label: text(t.label, 240),
            actorIndexes: indexList(t.actorIndexes),
            locationIndexes: indexList(t.locationIndexes),
          };
        },
        COMPOSITION_LIMITS.threads,
      ),
      (t) => t.id,
    ),
    evidence: list(
      v.evidence,
      (value) => {
        const e = object(value, [
          "text",
          "origin",
          "knowledge",
          "knownActorIndexes",
          "locator",
        ]);
        return {
          text: text(e.text, 2000),
          origin: literal(e.origin, [
            "source_fact",
            "source_inference",
            "owner_assumption",
          ] as const),
          knowledge: literal(e.knowledge, [
            "source",
            "canon_at_entry",
            "character",
            "future_source",
          ] as const),
          knownActorIndexes: indexList(e.knownActorIndexes),
          locator: parseEvidence(e.locator),
        };
      },
      COMPOSITION_LIMITS.evidence,
    ),
  };
  for (const t of choices.threads)
    ensure(
      t.actorIndexes.every((i) => i < choices.actors.length) &&
        t.locationIndexes.every((i) => i < choices.locations.length),
      "scope",
    );
  for (const e of choices.evidence) {
    ensure(
      e.locator.ownerId === basis.ownerId &&
        e.locator.visibility === "public" &&
        e.knowledge === e.locator.knowledge &&
        basis.sourceVersionIds.includes(e.locator.sourceVersionId) &&
        basis.sourceHeads.some((h) => h.sourceId === e.locator.sourceId),
      "scope",
    );
    ensure(
      e.knownActorIndexes.every((i) => i < choices.actors.length),
      "scope",
    );
    ensure(
      e.knowledge === "character"
        ? e.knownActorIndexes.length > 0
        : e.knownActorIndexes.length === 0,
      "scope",
    );
  }
  return choices;
}

export type CompositionBaseInput = {
  state: DetachedState;
  sourceHeads: CompositionBasis["sourceHeads"];
  documents: CompositionBasis["documents"];
  base: {
    saveId: string;
    timelineId: string;
    label: string;
    worldMinutes: number;
  };
  basisDigest: string;
  continuation?: CompositionBasis["continuation"];
};

/** Takes the authenticated composition_base envelope after readDetachedState.
 * Only public, exact saved Pack claims enter this conservative authoring path.
 * No prompt, DM guidance, raw Source body, hook or private thread is projected. */
export function buildCompositionBasis(input: CompositionBaseInput): {
  basis: CompositionBasis;
  choices: CompositionChoices;
  entryLabel: string;
} {
  const state = validateLabDetachedState(input.state),
    { base } = input;
  const continuation = input.continuation
    ? assertLabContinuationBasis(input.continuation, state) : undefined;
  if (!continuation) ensure(state.run === null && state.manifest.runId === null && state.manifest.schemaVersion === 2, "conflict");
  else ensure(state.run!.input.base.saveId === base.saveId, "scope");
  ensure(
    state.manifest.campaignId === state.campaignId &&
      state.manifest.timelineId === base.timelineId &&
      state.manifest.canonGeneration === state.canonGeneration,
    "scope",
  );
  ensure(
    state.manifest.publicMetadata.pendingAction === false &&
      state.manifest.publicMetadata.worldMinutes === base.worldMinutes,
    "conflict",
  );
  const rows = (table: string) => input.state.records[table] ?? [];
  ensure(
    rows("rpg_private.runtime_state").length === 1 &&
      rows("rpg_private.runtime_state")[0].world_minutes === base.worldMinutes,
    "conflict",
  );
  ensure(
    rows("rpg_private.turns").every(
      (r) =>
        r.owner_id === state.ownerId &&
        (["committed", "cancelled"].includes(String(r.status)) ||
          (r.status === "failed" && r.retryable === false)),
    ),
    "conflict",
  );
  ensure(
    rows("public.rpg_pending_actions").every((r) =>
      ["resolved", "cancelled"].includes(String(r.status)),
    ),
    "conflict",
  );
  ensure(
    rows("rpg_private.world_stages").every((s) =>
      rows("rpg_private.turns").some(
        (t) => t.id === s.id && t.status === "committed",
      ),
    ),
    "conflict",
  );
  ensure(rows("rpg_private.world_foundations").length === 1, "conflict");
  const foundation = rows("rpg_private.world_foundations")[0];
  const world = parseWorldState(foundation.world, state.campaignId);
  const bindings = unique(list(foundation.bindings, parseBinding), (b) => b.id);
  ensure(
    bindings.every(
      (b) => b.ownerId === state.ownerId && b.campaignId === state.campaignId,
    ),
    "scope",
  );
  const library = unique(
    state.libraryRecords.map((r) => parseLibraryRecord(r, state.ownerId)),
    (r) => r.versionId,
  );
  const bindingPacks = new Map(
    bindings.map((b): [string, string[]] => {
      if (b.scenarioVersionId === null) return [b.id, [b.packVersionId]];
      const s = library.find((r) => r.versionId === b.scenarioVersionId);
      ensure(
        s?.kind === "scenario" &&
          s.body.status === "approved" &&
          s.body.approval?.ownerId === state.ownerId &&
          s.body.packVersionIds.includes(b.packVersionId),
        "scope",
      );
      ensure(
        isDeepStrictEqual(b.entry, s.body.entry) &&
          isDeepStrictEqual(b.sourcePriority, s.body.sourcePriority),
        "conflict",
      );
      return [b.id, s.body.packVersionIds];
    }),
  );
  const packVersionIds = [...new Set([...bindingPacks.values()].flat())].sort();
  const sourceVersionIds = [
    ...new Set(bindings.flatMap((b) => b.sourceVersionIds)),
  ].sort();
  const packs = packVersionIds.map((id) => {
    const p = library.find((r) => r.versionId === id);
    ensure(
      p?.kind === "pack" &&
        p.body.status === "approved" &&
        p.body.approval?.ownerId === state.ownerId,
      "scope",
    );
    ensure(
      p.body.contradictions.every((c) => c.status === "resolved"),
      "conflict",
    );
    return p as TypedRecord<"pack">;
  });
  const sources = sourceVersionIds.map((id) => {
    const s = library.find((r) => r.versionId === id);
    ensure(s?.kind === "source", "scope");
    return s as TypedRecord<"source">;
  });
  unique(sources, (s) => s.id);
  for (const binding of bindings) {
    const p = packs.find((p) => p.versionId === binding.packVersionId)!;
    const ingredients = packs.filter((p) =>
      bindingPacks.get(binding.id)!.includes(p.versionId),
    );
    ensure(
      p.id === binding.packId &&
        sameSet(
          [...new Set(ingredients.flatMap((p) => p.body.sourceVersionIds))],
          binding.sourceVersionIds,
        ),
      "scope",
    );
    ensure(
      sameSet(
        ingredients.flatMap((p) => p.body.entities.map((e) => e.id)),
        binding.mappings.map((m) => m.packEntityId),
      ),
      "scope",
    );
  }
  const sourceHeads = [...parseLabSourceHeads(input.sourceHeads)].sort((a, b) =>
    a.sourceId.localeCompare(b.sourceId),
  );
  ensure(
    sameSet(
      sourceHeads.map((h) => h.sourceId),
      sources.map((s) => s.id),
    ),
    "scope",
  );
  ensure(
    sourceHeads.every((h) =>
      sources.some((s) => s.id === h.sourceId && s.versionId === h.versionId),
    ),
    "conflict",
  );
  const basis = parseCompositionBasis({
    ownerId: state.ownerId,
    campaignId: state.campaignId,
    saveId: base.saveId,
    baseManifestId: state.manifest.id,
    baseTimelineId: base.timelineId,
    canonGeneration: state.canonGeneration,
    basisDigest: input.basisDigest,
    sourceHeads,
    documents: [...parseLabDocumentPins(input.documents)].sort((a, b) =>
      a.documentId.localeCompare(b.documentId),
    ),
    packVersionIds,
    sourceVersionIds,
    startWorldMinutes: base.worldMinutes,
    ...(continuation ? { continuation } : {}),
  });
  // Sorting makes indexes stable across repeat reads of the exact saved basis.
  const actors = world.actors
    .filter((a) => a.publicName !== null && a.kind !== "location")
    .sort((a, b) => a.id.localeCompare(b.id));
  const locations = world.actors
    .filter((a) => a.publicName !== null && a.kind === "location")
    .sort((a, b) => a.id.localeCompare(b.id));
  const choices: CompositionChoices = {
    policy: parseCompositionPolicy(world.policy),
    actors: actors.map((a) => ({
      id: a.id,
      label: a.publicName!,
      control: a.control,
    })),
    locations: locations.map((a) => ({ id: a.id, label: a.publicName! })),
    threads: world.threads
      .filter((t) => t.publicTitle !== null && t.status === "active")
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((t) => ({
        id: t.id,
        label: t.publicTitle!,
        actorIndexes: actors.flatMap((a, i) =>
          t.actorIds.includes(a.id) ? [i] : [],
        ),
        locationIndexes: locations.flatMap((a, i) =>
          t.locationIds.includes(a.id) ? [i] : [],
        ),
      })),
    evidence: [],
  };
  const restricted = new Set(state.restrictions.map((r) => r.source_id));
  for (const pack of packs)
    for (const claim of pack.body.claims) {
      if (
        claim.visibility !== "public" ||
        claim.text.length > 2000 ||
        restricted.has(claim.id) ||
        restricted.has(pack.id) ||
        restricted.has(pack.versionId)
      )
        continue;
      // This conservative public authoring slice offers only settled factual
      // evidence. Rumor, lies, hypotheses and preexisting inferences are omitted;
      // new model deductions must still use source_inference with uncertainty.
      if (
        claim.epistemic !== "fact" ||
        claim.origin !== "source_fact" ||
        claim.uncertainty !== null
      )
        continue;
      for (const locator of claim.evidence) {
        const source = sources.find(
          (s) =>
            s.versionId === locator.sourceVersionId &&
            s.id === locator.sourceId,
        );
        ensure(source && locator.ownerId === basis.ownerId, "scope");
        if (
          restricted.has(source.id) ||
          restricted.has(source.versionId) ||
          (source.body.knowledge === "future_source" &&
            claim.knowledge !== "future_source")
        )
          continue;
        ensure(labEvidencePinned(locator, state, "private", true), "scope");
        ensure(!source.body.provenance, "conflict");
      }
      if (
        (claim.knowledge === "canon_at_entry" ||
          claim.knowledge === "character") &&
        (claim.authority !== "approved_canon" ||
          claim.validFrom === null ||
          claim.validFrom > basis.startWorldMinutes ||
          (claim.validUntil !== null &&
            claim.validUntil <= basis.startWorldMinutes))
      )
        continue;
      const knownActorIndexes =
        claim.knowledge === "character"
          ? actors.flatMap((a, i) =>
              bindings.some(
                (b) =>
                  bindingPacks.get(b.id)!.includes(pack.versionId) &&
                  b.mappings.some(
                    (m) =>
                      claim.knownByEntityIds.includes(m.packEntityId) &&
                      (m.entityId === a.entityId || m.entityId === a.id),
                  ),
              ) &&
              claim.evidence.every((e) =>
                a.knowledge.some((k) => isDeepStrictEqual(k, e)),
              )
                ? [i]
                : [],
            )
          : [];
      if (claim.knowledge === "character" && !knownActorIndexes.length)
        continue;
      for (const locator of claim.evidence) {
        const source = sources.find(
          (s) =>
            s.versionId === locator.sourceVersionId &&
            s.id === locator.sourceId,
        );
        if (
          !source ||
          source.body.visibility !== "public" ||
          locator.visibility !== "public" ||
          locator.ownerId !== basis.ownerId ||
          restricted.has(source.id) ||
          restricted.has(source.versionId)
        )
          continue;
        if (
          source.body.knowledge === "future_source" &&
          claim.knowledge !== "future_source"
        )
          continue;
        choices.evidence.push({
          text: claim.text,
          origin: "source_fact",
          knowledge: claim.knowledge,
          knownActorIndexes,
          locator: structuredClone(locator),
        });
      }
    }
  // A bounded context is explicit and deterministic; never silently truncate it.
  return {
    basis,
    choices: parseChoices(choices, basis),
    entryLabel: text(base.label, 240),
  };
}

export function parseCompositionUsage(
  value: unknown,
  model: string,
): ProviderUsage {
  const v = object(value, [
    "model",
    "inputTokens",
    "outputTokens",
    "calls",
    "latencyMs",
  ]);
  const actual = text(v.model, 120);
  ensure(
    actual === model ||
      (actual.startsWith(`${model}-`) &&
        /^\d{4}-\d{2}-\d{2}$/.test(actual.slice(model.length + 1))),
    "configuration",
  );
  return {
    model: actual,
    inputTokens: integer(v.inputTokens),
    outputTokens: integer(v.outputTokens),
    calls: integer(v.calls, 1, 1),
    latencyMs: integer(v.latencyMs),
  };
}

export function parseCompositionMetadata(value: unknown): CompositionMetadata {
  const v = object(value, [
    "schemaVersion",
    "phase",
    "operationId",
    "premise",
    "language",
    "basis",
    "composeProfile",
    "simulationProfile",
    "choices",
    "originalProposal",
    "review",
    "ownerEdit",
    "usage",
  ]);
  const basis = parseCompositionBasis(v.basis),
    choices = parseChoices(v.choices, basis),
    composeProfile = parseComposeExecutionProfile(v.composeProfile);
  const result: CompositionMetadata = {
    schemaVersion: literal(v.schemaVersion, [1]),
    phase: literal(v.phase, ["requested", "review", "approved"] as const),
    operationId: uuid(v.operationId),
    premise: text(v.premise, COMPOSITION_LIMITS.premise),
    language: literal(v.language, ["en", "ru"] as const),
    basis,
    composeProfile,
    simulationProfile: validateExecutionProfile(
      v.simulationProfile,
      "world.resolve",
    ),
    choices,
    originalProposal: nullable(v.originalProposal, (p) =>
      validateCompositionProposal(p, choices),
    ),
    review: nullable(v.review, parseCompositionReview),
    ownerEdit: nullable(v.ownerEdit, (raw) => {
      const e = object(raw, ["ownerId", "fromVersionId", "fields"]);
      return {
        ownerId: uuid(e.ownerId),
        fromVersionId: uuid(e.fromVersionId),
        fields: unique(
          list(
            e.fields,
            (v) =>
              literal(v, [
                ...compositionFieldNames,
                "ambiguityAnswers",
                "timingReview",
                "simulationProfile",
              ]),
            16,
          ),
        ),
      };
    }),
    usage: nullable(v.usage, (raw) =>
      parseCompositionUsage(raw, composeProfile.modelId),
    ),
  };
  ensure(
    result.composeProfile.policyRevision ===
      result.simulationProfile.policyRevision,
    "configuration",
  );
  if (result.ownerEdit)
    ensure(
      result.ownerEdit.ownerId === basis.ownerId &&
        result.ownerEdit.fields.length > 0,
      "scope",
    );
  if (result.phase === "requested")
    ensure(
      result.originalProposal === null &&
        result.review === null &&
        result.usage === null &&
        result.ownerEdit === null,
    );
  else {
    ensure(
      result.originalProposal !== null &&
        result.review !== null &&
        result.usage !== null,
    );
    assertCompositionChoices(result.review, choices);
    ensure(
      result.review.ambiguityAnswers.length ===
        result.originalProposal.ambiguities.length,
    );
    ensure(
      result.review.horizonMinutes === null ||
        basis.startWorldMinutes + result.review.horizonMinutes <=
          LAB_MAX_WORLD_MINUTES,
    );
    if (result.ownerEdit === null)
      ensure(
        isDeepStrictEqual(
          result.review,
          initialCompositionReview(result.originalProposal),
        ),
        "scope",
      );
    if (result.phase === "approved")
      ensure(compositionApprovalBlockers(result).length === 0, "conflict");
  }
  canonicalLabJson(result);
  return result;
}

export function compositionApprovalBlockers(
  metadata: CompositionMetadata,
): CompositionBlocker[] {
  const r = metadata.review,
    p = metadata.originalProposal;
  if (!r || !p) return ["interpretation_required"];
  const result: CompositionBlocker[] = [];
  if (p.ambiguities.some((a, i) => a.consequential && !r.ambiguityAnswers[i]))
    result.push("ambiguity_unresolved");
  if (
    !r.affectedThreadIndexes.length &&
    !r.affectedActorIndexes.some((i) =>
      metadata.choices.threads.some((t) => t.actorIndexes.includes(i)),
    )
  )
    result.push("scope_required");
  if (r.offsetMinutes === null || r.horizonMinutes === null)
    result.push("timing_unresolved");
  else if (r.offsetMinutes >= r.horizonMinutes)
    result.push("timing_outside_horizon");
  // Historical approved records keep their meaning. Every NEW approval is
  // gated while still in review; the SQL insert gate enforces the same rule.
  if (
    (metadata.phase !== "approved" || Object.hasOwn(r, "timingReview")) &&
    compositionNeedsTimingReview(r, p) &&
    !compositionTimingConfirmed(r)
  )
    result.push("timing_review_required");
  if (
    r.divergenceType === "actor_intent" &&
    r.affectedActorIndexes.some(
      (i) => metadata.choices.actors[i].control === "player",
    )
  )
    result.push("player_agency");
  if (["relationship", "rule", "other"].includes(r.divergenceType))
    result.push("unsupported_divergence");
  if (!isDeepStrictEqual(r.policy, metadata.choices.policy))
    result.push("unsupported_policy");
  return result;
}

function scenario(
  metadata: CompositionMetadata,
  entryLabel: string,
): CompositionScenarioBody {
  const body = parseScenario({
    schemaVersion: 1,
    title:
      metadata.review?.title ??
      (metadata.language === "ru" ? "Что, если…" : "What if…"),
    status: "draft",
    packVersionIds: metadata.basis.packVersionIds,
    sourceVersionIds: metadata.basis.sourceVersionIds,
    sourcePriority: metadata.basis.sourceVersionIds,
    entry: {
      label: entryLabel,
      worldMinutes: metadata.basis.startWorldMinutes,
      evidence: [],
    },
    adaptation: "original",
    identities: [],
    assumptions: [],
    carriedClaimIds: [],
    localHistory: null,
    unresolvedConflictIds: [],
    approval: null,
  });
  return { ...body, composition: metadata };
}

export function requestCompositionPlan(input: {
  operationId: string;
  premise: string;
  language: "en" | "ru";
  basis: CompositionBasis;
  choices: CompositionChoices;
  entryLabel: string;
  composeProfile: ComposeExecutionProfile;
  simulationProfile: ExecutionProfile;
}): CompositionScenarioBody {
  const metadata = parseCompositionMetadata({
    schemaVersion: 1,
    phase: "requested",
    operationId: input.operationId,
    premise: input.premise,
    language: input.language,
    basis: input.basis,
    choices: input.choices,
    composeProfile: input.composeProfile,
    simulationProfile: input.simulationProfile,
    originalProposal: null,
    review: null,
    ownerEdit: null,
    usage: null,
  });
  return scenario(metadata, text(input.entryLabel, 240));
}

export function recordCompositionPlan(
  current: CompositionScenarioBody,
  proposal: unknown,
  usage: ProviderUsage,
): CompositionScenarioBody {
  const m = parseCompositionMetadata(current.composition);
  ensure(
    m.phase === "requested" &&
      current.status === "draft" &&
      current.approval === null,
    "conflict",
  );
  const originalProposal = validateCompositionProposal(proposal, m.choices);
  return scenario(
    parseCompositionMetadata({
      ...m,
      phase: "review",
      originalProposal,
      review: initialCompositionReview(originalProposal),
      usage,
    }),
    current.entry.label,
  );
}

export function editCompositionPlan(
  current: CompositionScenarioBody,
  input: {
    review: CompositionReview;
    ownerId: string;
    fromVersionId: string;
    simulationProfile?: ExecutionProfile;
  },
): CompositionScenarioBody {
  const m = parseCompositionMetadata(current.composition);
  ensure(m.phase !== "requested" && input.ownerId === m.basis.ownerId, "scope");
  const review = parseCompositionReview(input.review);
  if (review.timingReview && !compositionTimingConfirmed(review))
    review.timingReview = null;
  assertCompositionChoices(review, m.choices);
  const simulationProfile = input.simulationProfile
    ? validateExecutionProfile(input.simulationProfile, "world.resolve")
    : m.simulationProfile;
  const fields = [
    ...compositionFieldNames,
    "ambiguityAnswers" as const,
    "timingReview" as const,
  ].filter(
    (key) => !isDeepStrictEqual(m.review![key], review[key]),
  ) as string[];
  if (!isDeepStrictEqual(simulationProfile, m.simulationProfile))
    fields.push("simulationProfile");
  ensure(fields.length > 0, "conflict");
  return scenario(
    parseCompositionMetadata({
      ...m,
      phase: "review",
      review,
      simulationProfile,
      ownerEdit: {
        ownerId: input.ownerId,
        fromVersionId: uuid(input.fromVersionId),
        fields,
      },
    }),
    current.entry.label,
  );
}

export function approveCompositionPlan(
  current: CompositionScenarioBody,
  input: {
    basis: CompositionBasis;
    ownerId: string;
    scenarioVersionId: string;
    allocateId: () => string;
  },
): { scenario: CompositionScenarioBody; divergence: DivergenceBody } {
  const m = parseCompositionMetadata(current.composition);
  ensure(
    m.phase === "review" &&
      current.status === "draft" &&
      current.approval === null,
    "conflict",
  );
  ensure(input.ownerId === m.basis.ownerId, "scope");
  ensure(
    isDeepStrictEqual(m.basis, parseCompositionBasis(input.basis)),
    "conflict",
  );
  ensure(compositionApprovalBlockers(m).length === 0, "conflict");
  const approved = parseCompositionMetadata({ ...m, phase: "approved" });
  const review = approved.review!;
  const approval = {
    ownerId: input.ownerId,
    reviewedConflictIds: [],
    reviewedUnknownIds: [],
  };
  const assumptionTexts = [
    ...review.assumptions,
    ...review.constraints,
    ...review.unchangedBaseline,
    ...review.ambiguityAnswers.filter((a): a is string => a !== null),
  ];
  const plain = scenario(approved, current.entry.label);
  const { composition: _metadata, ...base } = plain;
  void _metadata;
  const body = parseScenario({
    ...base,
    status: "approved",
    approval,
    assumptions: assumptionTexts.map((text) => ({
      id: uuid(input.allocateId()),
      text,
      visibility: "public",
    })),
  });
  const divergence = parseDivergence({
    schemaVersion: 1,
    scenarioVersionId: uuid(input.scenarioVersionId),
    title: review.title,
    changes: [
      {
        id: uuid(input.allocateId()),
        text: review.changeDescription,
        visibility: "public",
      },
    ],
    approval,
  });
  return { scenario: { ...body, composition: approved }, divergence };
}

export function prepareCompositionRequest(value: CompositionMetadata) {
  const m = parseCompositionMetadata(value);
  ensure(m.phase === "requested", "conflict");
  return {
    operationId: m.operationId,
    profile: m.composeProfile,
    data: {
      schemaVersion: 1,
      premise: m.premise,
      language: m.language,
      startWorldMinutes: m.basis.startWorldMinutes,
      policy: m.choices.policy,
      actors: m.choices.actors.map((a, index) => ({
        index,
        label: a.label,
        control: a.control,
      })),
      locations: m.choices.locations.map((a, index) => ({
        index,
        label: a.label,
      })),
      threads: m.choices.threads.map((t, index) => ({
        index,
        label: t.label,
        actorIndexes: t.actorIndexes,
        locationIndexes: t.locationIndexes,
      })),
      evidence: m.choices.evidence.map((e, index) => ({
        index,
        text: e.text,
        origin: e.origin,
        knowledge: e.knowledge,
        knownActorIndexes: e.knownActorIndexes,
      })),
      maximumHorizonMinutes: Math.min(
        COMPOSITION_LIMITS.horizonMinutes,
        LAB_MAX_WORLD_MINUTES - m.basis.startWorldMinutes,
      ),
    },
  };
}

export function projectComposition(
  value: CompositionMetadata,
): PublicComposition {
  const m = parseCompositionMetadata(value);
  return structuredClone({
    phase: m.phase,
    premise: m.premise,
    language: m.language,
    startWorldMinutes: m.basis.startWorldMinutes,
    review: m.review,
    ambiguities: m.originalProposal?.ambiguities ?? [],
    statements: m.originalProposal?.statements ?? [],
    choices: {
      actors: m.choices.actors.map((a) => ({
        label: a.label,
        control: a.control,
      })),
      locations: m.choices.locations.map((a) => ({ label: a.label })),
      threads: m.choices.threads.map((t) => ({
        label: t.label,
        actorIndexes: t.actorIndexes,
        locationIndexes: t.locationIndexes,
      })),
      policy: m.choices.policy,
    },
    selectedModel: {
      modelId: m.simulationProfile.modelId,
      reasoning: m.simulationProfile.reasoning,
    },
    ownerEdited: m.ownerEdit !== null,
    blockers: compositionApprovalBlockers(m),
    usage: m.usage,
  });
}

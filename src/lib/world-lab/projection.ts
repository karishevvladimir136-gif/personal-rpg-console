// Private allowlist boundary. No raw input, provenance, source title, knowledge
// list, private event/count or execution fence is a browser DTO.
import { DmError } from "../gameplay/dm-errors.ts";
import { isUuid } from "../persistence/validation.ts";
import { parseEvidence } from "../world-library/parsers.ts";
import {
  readDetachedState,
  validateDetachedRun,
  type DetachedMemorySourceRow,
  type ReadDetachedState,
} from "../saves/detached-reader.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import type {
  LabBaseChoice,
  LabCheckpoint,
  LabScenarioChoice,
  PublicLabRun,
} from "./contracts.ts";

export type LabProjectionScope = {
  ownerId: string;
  campaignId: string;
  // Omitted means the owner's explicitly public observation history. Supplying
  // actors requests character knowledge and requires positive known_by grants.
  // An empty actor list never means omniscience.
  actorIds?: readonly string[];
  language?: "en" | "ru";
};
export type LabRunProjectionOptions = LabProjectionScope & {
  // Resolved from offered, authorized choices by the private service, never from
  // a browser-provided title, input bundle or unfiltered Library record.
  base: LabBaseChoice;
  scenario: LabScenarioChoice;
};

function requireProjection(condition: unknown): asserts condition {
  if (!condition) throw new DmError("validation");
}
function safeText(value: unknown, max: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= max &&
    !value.includes("\u0000")
  );
}
function validScope(scope: LabProjectionScope) {
  requireProjection(isUuid(scope.ownerId) && isUuid(scope.campaignId));
  if (scope.actorIds !== undefined) {
    requireProjection(
      Array.isArray(scope.actorIds) && scope.actorIds.every(isUuid),
    );
    requireProjection(new Set(scope.actorIds).size === scope.actorIds.length);
  }
  requireProjection(
    scope.language === undefined ||
      scope.language === "en" ||
      scope.language === "ru",
  );
}
function baseChoice(value: LabBaseChoice): LabBaseChoice {
  requireProjection(isUuid(value.saveId) && isUuid(value.timelineId));
  requireProjection(safeText(value.label, 160));
  requireProjection(
    Number.isSafeInteger(value.worldMinutes) && value.worldMinutes >= 0,
  );
  return {
    saveId: value.saveId,
    timelineId: value.timelineId,
    label: value.label,
    worldMinutes: value.worldMinutes,
  };
}
function scenarioChoice(value: LabScenarioChoice): LabScenarioChoice {
  requireProjection(
    isUuid(value.scenarioVersionId) && isUuid(value.divergenceVersionId),
  );
  requireProjection(
    safeText(value.scenarioTitle, 240) && safeText(value.divergenceTitle, 240),
  );
  for (const rows of [value.assumptions, value.changes])
    requireProjection(
      Array.isArray(rows) &&
        rows.length <= 200 &&
        rows.every((row) => safeText(row, 4000)),
    );
  return {
    scenarioVersionId: value.scenarioVersionId,
    divergenceVersionId: value.divergenceVersionId,
    scenarioTitle: value.scenarioTitle,
    divergenceTitle: value.divergenceTitle,
    assumptions: [...value.assumptions],
    changes: [...value.changes],
  };
}
function worldMinutes(state: ReadDetachedState): number {
  const rows = state.records["rpg_private.runtime_state"];
  requireProjection(rows.length === 1);
  const minutes = rows[0].world_minutes;
  requireProjection(
    typeof minutes === "number" &&
      Number.isSafeInteger(minutes) &&
      minutes >= 0,
  );
  return minutes;
}
function restrictedIds(states: readonly ReadDetachedState[]): Set<string> {
  return new Set(
    states.flatMap((state) =>
      state.restrictions.map((row) => row.source_id as string),
    ),
  );
}
function knownSource(
  row: DetachedMemorySourceRow,
  state: ReadDetachedState,
  scope: LabProjectionScope,
  minutes: number,
  restricted: ReadonlySet<string>,
  path = new Set<string>(),
): boolean {
  if (
    scope.actorIds === undefined ||
    scope.actorIds.length === 0 ||
    path.has(row.id) ||
    path.size >= 32
  )
    return false;
  if (
    !row.current ||
    row.status !== "valid" ||
    row.kind === "private_event" ||
    restricted.has(row.id) ||
    restricted.has(row.source_id) ||
    (row.valid_from !== null && row.valid_from > minutes) ||
    (row.valid_to !== null && row.valid_to <= minutes) ||
    !scope.actorIds.every((id) => row.known_by.includes(id))
  )
    return false;
  const nextPath = new Set(path).add(row.id);
  return row.source_refs.every((ref) => {
    if (
      ref.campaignId !== state.campaignId ||
      ref.visibility !== "public" ||
      ref.kind === "private_event" ||
      typeof ref.id !== "string" ||
      restricted.has(ref.id)
    )
      return false;
    const matching = state.records["rpg_private.memory_public_sources"].filter(
      (candidate) =>
        candidate.kind === ref.kind &&
        candidate.source_id === ref.id &&
        candidate.version === ref.version &&
        candidate.part === ref.part,
    );
    return (
      matching.length === 1 &&
      knownSource(matching[0], state, scope, minutes, restricted, nextPath)
    );
  });
}
function events(
  state: ReadDetachedState,
  scope: LabProjectionScope,
  minutes: number,
  restricted: ReadonlySet<string>,
): LabCheckpoint["events"] {
  const sources = new Map(
    state.libraryRecords
      .filter((row) => row.kind === "source")
      .map((row) => [row.versionId, row]),
  );
  // Actor involvement is deliberately unused. A matching committed public
  // source can grant character knowledge; an event's actorIds cannot.
  return state.records["rpg_private.world_events"]
    .filter((row) => {
      const event = row.event;
      if (
        event.visibility !== "public" ||
        event.worldMinutes > minutes ||
        restricted.has(event.id) ||
        restricted.has(row.id)
      )
        return false;
      if (
        !event.evidence.every((raw) => {
          try {
            const evidence = parseEvidence(raw);
            const source = sources.get(evidence.sourceVersionId);
            return (
              evidence.ownerId === state.ownerId &&
              evidence.visibility === "public" &&
              evidence.knowledge === "character" &&
              source !== undefined &&
              source.id === evidence.sourceId &&
              source.body.digest === evidence.digest &&
              source.body.visibility === "public" &&
              source.body.knowledge !== "future_source" &&
              !restricted.has(source.id) &&
              !restricted.has(source.versionId)
            );
          } catch {
            return false;
          }
        })
      )
        return false;
      if (scope.actorIds === undefined) return true;
      const matching = state.records[
        "rpg_private.memory_public_sources"
      ].filter(
        (source) =>
          source.kind === "event" &&
          source.source_id === event.id &&
          source.text === event.text &&
          knownSource(source, state, scope, minutes, restricted),
      );
      return scope.actorIds.length > 0 && matching.length === 1;
    })
    .sort(
      (a, b) =>
        a.event.worldMinutes - b.event.worldMinutes ||
        a.sequence - b.sequence ||
        a.id.localeCompare(b.id),
    )
    .map((row) => ({
      id: row.id,
      text: row.event.text,
      worldMinutes: row.event.worldMinutes,
    }));
}
function checkpoint(
  state: ReadDetachedState,
  ordinal: number,
  scope: LabProjectionScope,
  restricted: ReadonlySet<string>,
  neutral: boolean,
): LabCheckpoint {
  return {
    id: state.manifest.id,
    ordinal,
    worldMinutes: worldMinutes(state),
    summary:
      scope.language === "ru"
        ? "Контрольная точка сохранена."
        : "Checkpoint recorded.",
    events: neutral
      ? []
      : events(state, scope, worldMinutes(state), restricted),
  };
}

/** The input is an authorized raw checkpoint, not an active projection or a
 * previously projected DTO. Text summaries are neutral, never generated from
 * hidden event counts, thread titles, source metadata or DM state. */
export function projectLabCheckpoint(
  value: unknown,
  scope: LabProjectionScope & { ordinal: number },
): LabCheckpoint {
  validScope(scope);
  requireProjection(Number.isSafeInteger(scope.ordinal) && scope.ordinal >= 0);
  const state = readDetachedState(value, scope);
  const invalidated =
    state.run?.reason === "source_changed" ||
    state.manifest.canonGeneration !== state.canonGeneration;
  return checkpoint(
    state,
    scope.ordinal,
    scope,
    restrictedIds([state]),
    invalidated,
  );
}

/** Explicit public allowlist. Each checkpoint is revalidated, including saved
 * source membership. Current restrictions apply to the complete history. */
export function projectLabRun(
  value: unknown,
  checkpointValues: readonly unknown[],
  options: LabRunProjectionOptions,
): PublicLabRun {
  validScope(options);
  const run = validateDetachedRun(value, options);
  const base = baseChoice(options.base),
    scenario = scenarioChoice(options.scenario);
  requireProjection(
    base.saveId === run.input.base.saveId &&
      base.timelineId === run.input.base.timelineId &&
      base.worldMinutes === run.input.startWorldMinutes,
  );
  requireProjection(
    scenario.scenarioVersionId === run.input.scenarioVersionId &&
      scenario.divergenceVersionId === run.input.divergenceVersionId,
  );
  requireProjection(
    Array.isArray(checkpointValues) && checkpointValues.length > 0,
  );
  const states = checkpointValues.map((raw) =>
    readDetachedState(raw, {
      ownerId: options.ownerId,
      campaignId: options.campaignId,
      timelineId: run.timelineId,
      runId: run.id,
    }),
  );
  requireProjection(
    new Set(states.map((state) => state.manifest.id)).size === states.length,
  );
  for (let i = 0; i < states.length; i++) {
    const state = states[i],
      minutes = worldMinutes(state);
    requireProjection(
      state.run?.inputDigest === run.inputDigest &&
        state.run.revision === run.revision,
    );
    requireProjection(
      minutes >= run.input.startWorldMinutes &&
        minutes <= run.currentWorldMinutes,
    );
    if (i > 0) requireProjection(minutes >= worldMinutes(states[i - 1]));
  }
  const last = states.at(-1)!;
  requireProjection(
    last.manifest.id === run.headManifestId &&
      worldMinutes(last) === run.currentWorldMinutes,
  );
  const invalidated =
    run.reason === "source_changed" ||
    states.some(
      (state) =>
        state.canonGeneration !== run.input.canonGeneration ||
        state.run?.reason === "source_changed",
    );
  const restricted = restrictedIds(states);
  const seenEvents = new Set<string>();
  const checkpoints = states.map((state, ordinal) => {
    const result = checkpoint(state, ordinal, options, restricted, invalidated);
    // An inherited immutable event appears once in chronological public history.
    result.events = result.events.filter((event) => {
      if (seenEvents.has(event.id)) return false;
      seenEvents.add(event.id);
      return true;
    });
    return result;
  });
  const ru = options.language === "ru";
  return {
    id: run.id,
    campaignId: run.campaignId,
    timelineId: run.timelineId,
    label: run.label,
    purpose: "simulation",
    nonCanon: true,
    status:
      invalidated && (run.status === "prepared" || run.status === "running")
        ? "paused"
        : run.status,
    reason: invalidated ? "source_changed" : run.reason,
    revision: run.revision,
    base: invalidated
      ? { ...base, label: ru ? "Сохранённая точка" : "Saved checkpoint" }
      : base,
    scenario: invalidated
      ? {
          scenarioVersionId: scenario.scenarioVersionId,
          divergenceVersionId: scenario.divergenceVersionId,
          scenarioTitle: ru ? "Сценарий" : "Scenario",
          divergenceTitle: ru ? "Изменение" : "Divergence",
          assumptions: [],
          changes: [],
        }
      : scenario,
    startWorldMinutes: run.input.startWorldMinutes,
    throughWorldMinutes: run.input.throughWorldMinutes,
    currentWorldMinutes: run.currentWorldMinutes,
    checkpoints,
  };
}

/** Strip a validated state back to its private RPC envelope when another server
 * adapter needs to revalidate it; computed family maps are never a second source. */
export function detachedReadEnvelope(state: ReadDetachedState): JsonObject {
  return structuredClone({
    ownerId: state.ownerId,
    campaignId: state.campaignId,
    manifest: state.manifest,
    versions: state.versions,
    canonGeneration: state.canonGeneration,
    libraryRecords: state.libraryRecords,
    documentVersions: state.documentVersions,
    restrictions: state.restrictions,
    run: state.run,
  }) as unknown as JsonObject;
}

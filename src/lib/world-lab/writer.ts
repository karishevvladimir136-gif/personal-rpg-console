import { isDeepStrictEqual } from "node:util";
import type { JsonObject } from "../gameplay/contracts.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import type { WorldSettlement } from "../production/contracts.ts";
import type { DetachedRunFence } from "../saves/detached-contracts.ts";
import {
  assertDetachedRunFence,
  createDetachedRunFence,
  isDetachedRunFence,
} from "../saves/detached-fence.ts";
import type { WorldStageInput } from "../world/contracts.ts";
import { stageWorldTransition } from "../world/stage.ts";
import { parseWorldState } from "../world/validation.ts";
import { stageLabSimulation } from "./simulation.ts";
import type {
  DetachedCommit,
  DetachedManifest,
  DetachedRecordWrite,
  DetachedState,
  DetachedVersion,
  LabInputBundle,
  LabRpc,
  LabRun,
} from "./server-contracts.ts";

// Private, server-owned deterministic proposal builder. Never a browser patch API.
const FOUNDATION = "rpg_private.world_foundations";
const RUNTIME = "rpg_private.runtime_state";
const EVENTS = "rpg_private.world_events";
const PUBLIC_STATE = "public.rpg_public_state";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type DetachedWorldCommitInput = {
  state: DetachedState;
  fence: DetachedRunFence;
  operationId: string;
  throughWorldMinutes: number;
  worldInput: WorldStageInput;
  /** Optional candidate is compared with a fresh deterministic recomputation. */
  settlement?: WorldSettlement | null;
  /** Stored structured result only; new mode recomputes every effect locally. */
  simulationProposal?: unknown | null;
};
export type DetachedCommitResult = {
  run: LabRun;
  manifest: DetachedManifest;
  operationId: string;
  committed: boolean;
};

function requireValue(
  condition: unknown,
  code: "validation" | "conflict" = "validation",
): asserts condition {
  if (!condition) throw new DmError(code);
}
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exactKeys(value: unknown, keys: string[]): void {
  requireValue(
    isObject(value) &&
      Object.keys(value).length === keys.length &&
      keys.every((key) => Object.hasOwn(value, key)),
  );
}
function minute(value: unknown): asserts value is number {
  requireValue(
    Number.isSafeInteger(value) &&
      (value as number) >= 0 &&
      (value as number) <= 1_000_000_000,
  );
}
function revision(value: unknown): asserts value is number {
  requireValue(
    Number.isSafeInteger(value) &&
      (value as number) >= 1 &&
      (value as number) < 2_147_483_646,
  );
}
function equalRows(a: unknown, b: JsonObject[]): boolean {
  if (!Array.isArray(a) || a.length !== b.length) return false;
  // A mapper may order exact manifest members for presentation; never accept a
  // subset, a duplicate, or a row from an active/sibling projection.
  const remaining = [...b];
  for (const row of a) {
    const at = remaining.findIndex((candidate) =>
      isDeepStrictEqual(row, candidate),
    );
    if (at < 0) return false;
    remaining.splice(at, 1);
  }
  return remaining.length === 0;
}
function rowKey(tableName: string, payload: JsonObject): string {
  if (tableName === "rpg_private.memory_aliases")
    return `${payload.entity_id}:${payload.alias}`;
  if (tableName === "rpg_private.memory_restrictions")
    return `${payload.kind}:${payload.source_id}`;
  const value = payload.id ?? payload.campaign_id;
  requireValue(typeof value === "string" && uuid.test(value));
  return value;
}

/** The authorized reader owns digest verification; this prevents read/row drift. */
function validateExactRead(
  state: DetachedState,
  fence: DetachedRunFence,
): void {
  requireValue(isDetachedRunFence(fence));
  const run = state.run;
  requireValue(run !== null, "conflict");
  assertDetachedRunFence(fence, createDetachedRunFence(run));
  requireValue(
    run.status === "running" &&
      state.ownerId === fence.ownerId &&
      state.campaignId === fence.campaignId &&
      state.canonGeneration === fence.canonGeneration &&
      state.manifest.canonGeneration === fence.canonGeneration &&
      state.manifest.id === fence.manifestId &&
      state.manifest.campaignId === fence.campaignId &&
      state.manifest.timelineId === fence.timelineId &&
      state.manifest.runId === fence.runId &&
      state.manifest.schemaVersion === 3,
    "conflict",
  );
  const seen = new Set<string>();
  const identities = new Set<string>();
  const members = new Map<string, DetachedVersion>();
  for (const version of state.versions) {
    requireValue(
      uuid.test(version.id) &&
        !members.has(version.id) &&
        version.campaignId === fence.campaignId &&
        version.payload.campaign_id === fence.campaignId &&
        version.rowKey === rowKey(version.tableName, version.payload),
    );
    const identity = `${version.tableName}\u0000${version.rowKey}`;
    requireValue(!identities.has(identity));
    identities.add(identity);
    members.set(version.id, version);
  }
  requireValue(
    isDeepStrictEqual(
      Object.keys(state.manifest.refs).sort(),
      Object.keys(state.records).sort(),
    ),
  );
  for (const [tableName, references] of Object.entries(state.manifest.refs)) {
    requireValue(Array.isArray(references));
    const rows: JsonObject[] = [];
    for (const id of references) {
      const version = members.get(id);
      requireValue(version && version.tableName === tableName && !seen.has(id));
      seen.add(id);
      rows.push(version.payload);
    }
    requireValue(equalRows(state.records[tableName], rows));
  }
  requireValue(seen.size === members.size);
}
function singleton(
  state: DetachedState,
  tableName: string,
  optional = false,
): DetachedVersion | null {
  const versions = state.versions.filter((v) => v.tableName === tableName);
  requireValue(versions.length === 1 || (optional && versions.length === 0));
  return versions[0] ?? null;
}

/**
 * Pin every field read by stageWorldTransition to its exact detached row.
 * The runtime adapter supplies a complete RuntimeSource, but this World slice
 * reads only owner/campaign, entities, locations, public location and saved
 * runtime configuration. No other source field is interpreted or persisted.
 */
function validateWorldInput(input: DetachedWorldCommitInput): {
  foundation: DetachedVersion | null;
  runtime: DetachedVersion;
} {
  const { state, fence, worldInput, throughWorldMinutes, operationId } = input;
  validateExactRead(state, fence);
  requireValue(typeof operationId === "string" && uuid.test(operationId));
  minute(throughWorldMinutes);
  const run = state.run!;
  minute(run.input.startWorldMinutes);
  minute(run.input.throughWorldMinutes);
  requireValue(
    ["deterministic-world-v1", "single-model-world-v1"].includes(run.input.resolutionPolicy.id) &&
      run.input.resolutionPolicy.version === 1 &&
      Number.isSafeInteger(run.input.resolutionPolicy.maxSteps) &&
      run.input.resolutionPolicy.maxSteps > 0,
  );
  const foundation = singleton(state, FOUNDATION, true);
  const runtime = singleton(state, RUNTIME)!;
  const publicState = singleton(state, PUBLIC_STATE)!;
  revision(runtime.payload.revision);
  minute(runtime.payload.world_minutes);
  requireValue(
    runtime.payload.world_minutes === run.currentWorldMinutes &&
      throughWorldMinutes >= run.currentWorldMinutes &&
      run.currentWorldMinutes >= run.input.startWorldMinutes &&
      throughWorldMinutes <= run.input.throughWorldMinutes,
    "conflict",
  );
  if (foundation) revision(foundation.payload.revision);
  // Legacy World validators require this transport shape. The constant is a
  // pure-engine sentinel, NEVER a live epoch, SQL fence or permission to write.
  const timeline = { timelineId: fence.timelineId, epoch: 1 };
  const expectedSnapshot = {
    schemaVersion: 1,
    ownerId: fence.ownerId,
    campaignId: fence.campaignId,
    timeline,
    revision: foundation?.payload.revision ?? 0,
    runtimeRevision: runtime.payload.revision,
    headId: fence.manifestId,
    worldMinutes: runtime.payload.world_minutes,
    world: foundation?.payload.world ?? null,
    bindings: foundation?.payload.bindings ?? [],
    ruleset: foundation?.payload.ruleset ?? run.input.ruleset,
    executionPolicy: foundation?.payload.execution_policy ?? null,
  };
  requireValue(
    isDeepStrictEqual(worldInput.snapshot, expectedSnapshot) &&
      isDeepStrictEqual(worldInput.snapshot.ruleset, run.input.ruleset) &&
      isDeepStrictEqual(worldInput.command, {
        operationId,
        campaignId: fence.campaignId,
        timeline,
        expectedRevision: expectedSnapshot.revision,
        expectedRuntimeRevision: expectedSnapshot.runtimeRevision,
        expectedHeadId: fence.manifestId,
      }) &&
      isDeepStrictEqual(worldInput.resolution, {
        changes: [],
        worldMinutes: throughWorldMinutes,
        configuration: runtime.payload.configuration,
        outcomes: [],
      }),
    "conflict",
  );
  requireValue(
    ["time_skip", "session_boundary", "none"].includes(worldInput.trigger) &&
      (worldInput.trigger === "time_skip" ||
        throughWorldMinutes === run.currentWorldMinutes),
  );
  const { source } = worldInput;
  requireValue(
    source.ownerId === fence.ownerId &&
      source.snapshot.campaign.id === fence.campaignId &&
      source.runtime.campaignId === fence.campaignId &&
      source.runtime.revision === runtime.payload.revision &&
      source.runtime.worldMinutes === runtime.payload.world_minutes &&
      isDeepStrictEqual(
        source.runtime.configuration,
        runtime.payload.configuration,
      ) &&
      equalRows(
        source.snapshot.entities,
        state.records["public.rpg_entities"] ?? [],
      ) &&
      equalRows(
        source.snapshot.locations,
        state.records["public.rpg_locations"] ?? [],
      ) &&
      source.snapshot.publicState.current_location_id ===
        publicState.payload.current_location_id &&
      (!source.runtime.timeline ||
        isDeepStrictEqual(source.runtime.timeline, timeline)) &&
      (!source.snapshot.timeline ||
        isDeepStrictEqual(source.snapshot.timeline, timeline)),
    "conflict",
  );
  if (worldInput.snapshot.world !== null && !run.input.executionProfile) {
    const world = parseWorldState(worldInput.snapshot.world, fence.campaignId);
    // D1 cannot claim to have settled typed consequences that the accepted
    // deterministic staging engine leaves to its later resolver path.
    requireValue(
      world.threads.every((thread) =>
        thread.steps
          .slice(thread.cursor)
          .every((step) => !step.consequences?.length),
      ),
    );
  }
  return { foundation, runtime };
}

/** Derive the complete immutable write set; callers cannot supply row patches. */
export function buildDetachedWorldCommit(
  input: DetachedWorldCommitInput,
): DetachedCommit {
  try {
    const { state, fence, operationId, throughWorldMinutes, worldInput } =
      input;
    const { foundation, runtime } = validateWorldInput(input);
    const simulation = state.run!.input.executionProfile
      ? stageLabSimulation(state, operationId, input.simulationProposal ?? null)
      : null;
    if (simulation) {
      requireValue(Object.hasOwn(input, "simulationProposal") && simulation.status === "staged");
      requireValue(isDeepStrictEqual(worldInput, simulation.worldInput), "conflict");
    } else requireValue(!Object.hasOwn(input, "simulationProposal"));
    const result = simulation?.status === "staged" ? simulation.result : stageWorldTransition(worldInput);
    requireValue(result.status !== "paused");
    const settlement = result.status === "staged" ? result.settlement : null;
    if (Object.hasOwn(input, "settlement"))
      requireValue(isDeepStrictEqual(input.settlement, settlement), "conflict");
    const writes: DetachedRecordWrite[] = [];
    function replace(version: DetachedVersion, changes: JsonObject): void {
      writes.push({
        tableName: version.tableName,
        rowKey: version.rowKey,
        expectedVersionId: version.id,
        payload: {
          ...structuredClone(version.payload),
          ...structuredClone(changes),
        },
      });
    }
    if (settlement) {
      requireValue(foundation !== null);
      requireValue(
        settlement.events.filter(
          (event) => event.kind === "world.thread.advanced",
        ).length <= state.run!.input.resolutionPolicy.maxSteps,
      );
      replace(foundation, {
        world: settlement.nextWorld,
        revision: (foundation.payload.revision as number) + 1,
      });
    }
    if (settlement || throughWorldMinutes !== runtime.payload.world_minutes)
      replace(runtime, {
        world_minutes: throughWorldMinutes,
        revision: (runtime.payload.revision as number) + 1,
      });
    let sequence = 0;
    for (const version of state.versions.filter(
      (v) => v.tableName === EVENTS,
    )) {
      const value = version.payload.sequence;
      requireValue(Number.isSafeInteger(value) && (value as number) > 0);
      sequence = Math.max(sequence, value as number);
    }
    for (const event of settlement?.events ?? []) {
      requireValue(
        !state.versions.some(
          (v) => v.tableName === EVENTS && v.rowKey === event.id,
        ),
        "conflict",
      );
      sequence += 1;
      requireValue(Number.isSafeInteger(sequence));
      writes.push({
        tableName: EVENTS,
        rowKey: event.id,
        expectedVersionId: null,
        payload: {
          id: event.id,
          campaign_id: fence.campaignId,
          operation_id: operationId,
          sequence,
          event: structuredClone(event) as unknown as JsonObject,
        },
      });
    }
    if (simulation?.status === "staged" && simulation.result.status === "staged") {
      for (const change of simulation.result.consequenceChanges ?? []) {
        requireValue(change.family === "entities" || change.family === "items");
        const version = state.versions.find((v) => v.tableName === `public.rpg_${change.family}` && v.rowKey === change.id);
        requireValue(version && change.expectedRevision !== null && version.payload.revision === change.expectedRevision, "conflict");
        const allowed = change.family === "entities" ? ["resources", "conditions"] : ["quantity"];
        requireValue(Object.keys(change.values).every((key) => allowed.includes(key)));
        replace(version, { ...change.values, revision: change.expectedRevision + 1 });
      }
    }
    return {
      operationId,
      fence: structuredClone(fence),
      kind: writes.length === 0 ? "noop" : simulation ? "resolved_world" : "deterministic_world",
      throughWorldMinutes,
      writes,
      proof: simulation?.status === "staged" ? simulation.proof : {
        schemaVersion: 1,
        trigger: worldInput.trigger,
        settlement: settlement as unknown as JsonObject | null,
      },
    };
  } catch (error) {
    if (error instanceof DmError) throw error;
    // Neither World details nor malformed private source data escape this seam.
    throw new DmError("validation");
  }
}

export function validateDetachedWorldCommit(
  input: DetachedWorldCommitInput,
  proposed: unknown,
): DetachedCommit {
  const expected = buildDetachedWorldCommit(input);
  requireValue(isDeepStrictEqual(proposed, expected), "conflict");
  return expected;
}

function parseResult(
  value: unknown,
  pinnedInput: LabInputBundle,
  commit: DetachedCommit,
): DetachedCommitResult {
  exactKeys(value, ["run", "manifest", "operationId", "committed"]);
  const result = value as DetachedCommitResult;
  requireValue(
    isObject(result.run) &&
      isObject(result.run.input) &&
      isObject(result.manifest),
  );
  const received = createDetachedRunFence(result.run);
  const expected = commit.fence;
  requireValue(
    result.operationId === commit.operationId &&
      typeof result.committed === "boolean" &&
      result.committed === commit.writes.length > 0 &&
      isDeepStrictEqual(result.run.input, pinnedInput) &&
      received.ownerId === expected.ownerId &&
      received.campaignId === expected.campaignId &&
      received.timelineId === expected.timelineId &&
      received.runId === expected.runId &&
      received.leaseGeneration === expected.leaseGeneration &&
      received.inputDigest === expected.inputDigest &&
      received.canonGeneration === expected.canonGeneration &&
      received.headRevision ===
        expected.headRevision + (result.committed ? 1 : 0) &&
      result.manifest.id === received.manifestId &&
      result.manifest.campaignId === expected.campaignId &&
      result.manifest.timelineId === expected.timelineId &&
      result.manifest.runId === expected.runId &&
      result.manifest.schemaVersion === 3 &&
      result.manifest.canonGeneration === expected.canonGeneration &&
      result.run.currentWorldMinutes === commit.throughWorldMinutes &&
      (result.committed
        ? received.manifestId !== expected.manifestId
        : received.manifestId === expected.manifestId),
  );
  return structuredClone(result);
}

/**
 * Inject a server-only rpg_world_lab RPC. One commit call, no active-store reads,
 * refresh/retry loop or local receipt cache. SQL owns atomic CAS and exact retry
 * receipts; a stale input is sent unchanged and cannot acquire a newer lease.
 */
export function createRpcDetachedWriter(ownerId: string, execute: LabRpc) {
  requireValue(uuid.test(ownerId));
  return {
    async commit(
      input: DetachedWorldCommitInput,
      proposed?: unknown,
    ): Promise<DetachedCommitResult> {
      const commit =
        proposed === undefined
          ? buildDetachedWorldCommit(input)
          : validateDetachedWorldCommit(input, proposed);
      requireValue(commit.fence.ownerId === ownerId, "conflict");
      const pinnedInput = structuredClone(input.state.run!.input);
      try {
        const result = await execute({
          p_owner_id: ownerId,
          p_campaign_id: commit.fence.campaignId,
          p_action: "commit",
          p_payload: structuredClone(commit),
        });
        if (result.error) {
          if (result.error.message?.includes("rpg_conflict"))
            throw new DmError("conflict");
          if (
            result.error.message?.includes("rpg_validation") ||
            result.error.code?.startsWith("22") ||
            result.error.code?.startsWith("23")
          )
            throw new DmError("validation");
          throw new DmError(
            "unavailable",
            !result.error.message?.includes("rpg_forbidden"),
          );
        }
        return parseResult(result.data, pinnedInput, commit);
      } catch (error) {
        if (error instanceof DmError) throw error;
        throw new DmError("unavailable", true);
      }
    },
  };
}

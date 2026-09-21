import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { fixture as worldFixture, id } from "./wave1-world-fixtures.mjs";
import { fixture as progressionFixture } from "./wave4-progression-fixtures.mjs";
import {
  createDetachedRunFence,
  sameDetachedRunFence,
} from "../src/lib/saves/detached-fence.ts";
export { id };

export const FOUNDATION = "rpg_private.world_foundations";
export const RUNTIME = "rpg_private.runtime_state";
export const EVENTS = "rpg_private.world_events";

export function refreshRows(input) {
  const { state } = input;
  state.versions = [];
  state.manifest.refs = {};
  for (const [tableName, rows] of Object.entries(state.records)) {
    state.manifest.refs[tableName] = [];
    for (const payload of rows) {
      const rowKey = payload.id ?? payload.campaign_id;
      const version = {
        id: id(`version:${tableName}:${rowKey}`),
        campaignId: state.campaignId,
        tableName,
        rowKey,
        // Only synthetic membership checks here; the reader owns PG digest checks.
        digest: createHash("sha256")
          .update(JSON.stringify(payload))
          .digest("hex"),
        payload: structuredClone(payload),
        originTimelineId: id("source-timeline"),
      };
      state.versions.push(version);
      state.manifest.refs[tableName].push(version.id);
    }
  }
  return input;
}

export function fixture() {
  const worldInput = worldFixture();
  const timeline = { timelineId: id("lab-timeline"), epoch: 1 };
  worldInput.snapshot.timeline = structuredClone(timeline);
  worldInput.snapshot.headId = id("lab-manifest");
  worldInput.command.timeline = structuredClone(timeline);
  worldInput.command.expectedHeadId = id("lab-manifest");
  worldInput.source.runtime.timeline = structuredClone(timeline);
  worldInput.source.snapshot.timeline = structuredClone(timeline);
  worldInput.snapshot.world.threads[0].actorIds.push(id("player"));
  worldInput.snapshot.world.threads[0].steps[0].publicOutcome = {
    text: "A distant bell rings.",
    actorIds: [id("player")],
    evidence: [],
  };
  const run = {
    id: id("lab-run"),
    ownerId: worldInput.snapshot.ownerId,
    campaignId: worldInput.snapshot.campaignId,
    timelineId: timeline.timelineId,
    label: "Synthetic non-canon branch",
    input: {
      schemaVersion: 1,
      purpose: "simulation",
      nonCanon: true,
      ownerId: worldInput.snapshot.ownerId,
      campaignId: worldInput.snapshot.campaignId,
      base: {
        saveId: id("base-save"),
        timelineId: id("source-timeline"),
        manifestId: id("base-manifest"),
        schemaVersion: 2,
      },
      scenarioVersionId: id("scenario-version"),
      divergenceVersionId: id("divergence-version"),
      packVersionIds: [],
      sourceVersionIds: [],
      documentVersions: [],
      sourceHeads: [],
      canonGeneration: 4,
      ruleset: structuredClone(worldInput.snapshot.ruleset),
      effectiveSettings: structuredClone(
        worldInput.source.snapshot.settings.values,
      ),
      effectiveGuidance: {},
      resolutionPolicy: {
        id: "deterministic-world-v1",
        version: 1,
        maxSteps: 8,
      },
      startWorldMinutes: 0,
      throughWorldMinutes: 120,
    },
    inputDigest: "a".repeat(64),
    status: "running",
    reason: null,
    revision: 5,
    leaseGeneration: 2,
    headRevision: 0,
    headManifestId: id("lab-manifest"),
    lastCheckpointId: id("lab-manifest"),
    currentWorldMinutes: 0,
  };
  const foundation = {
    campaign_id: run.campaignId,
    revision: worldInput.snapshot.revision,
    world: structuredClone(worldInput.snapshot.world),
    bindings: [],
    ruleset: structuredClone(worldInput.snapshot.ruleset),
    execution_policy: null,
    // Reuse accepted Wave 4 shape; D1 must never award or spend its contents.
    loop_state: structuredClone(progressionFixture().context.state),
  };
  const runtime = {
    campaign_id: run.campaignId,
    revision: worldInput.source.runtime.revision,
    world_minutes: worldInput.source.runtime.worldMinutes,
    configuration: structuredClone(worldInput.source.runtime.configuration),
    updated_at: "2026-01-01T00:00:00Z",
  };
  const state = {
    ownerId: run.ownerId,
    campaignId: run.campaignId,
    manifest: {
      id: run.headManifestId,
      campaignId: run.campaignId,
      timelineId: run.timelineId,
      schemaVersion: 3,
      canonGeneration: run.input.canonGeneration,
      refs: {},
      publicMetadata: { worldMinutes: 0 },
      runId: run.id,
    },
    versions: [],
    canonGeneration: run.input.canonGeneration,
    libraryRecords: [],
    documentVersions: [],
    restrictions: [],
    run,
    records: {
      [FOUNDATION]: [foundation],
      [RUNTIME]: [runtime],
      [EVENTS]: [
        {
          id: id("inherited-event"),
          campaign_id: run.campaignId,
          operation_id: id("historic-operation"),
          sequence: 31,
          event: {
            id: id("inherited-event"),
            kind: "reward.granted",
            payload: { rewardId: "objective" },
          },
        },
      ],
      "public.rpg_public_state": [
        structuredClone(worldInput.source.snapshot.publicState),
      ],
      "public.rpg_entities": structuredClone(
        worldInput.source.snapshot.entities,
      ),
      "public.rpg_locations": structuredClone(
        worldInput.source.snapshot.locations,
      ),
      "public.rpg_items": structuredClone(worldInput.source.snapshot.items),
      "public.rpg_storages": structuredClone(
        worldInput.source.snapshot.storages,
      ),
      "public.rpg_quests": structuredClone(worldInput.source.snapshot.quests),
      "public.rpg_settings": [
        structuredClone(worldInput.source.snapshot.settings),
      ],
      "rpg_private.memory_public_sources": [],
      "rpg_private.memory_private_sources": [],
      "rpg_private.turns": [],
      "rpg_private.dm_state": [
        { campaign_id: run.campaignId, contents: { secret: "PRIVATE_CANARY" } },
      ],
    },
  };
  return refreshRows({
    state,
    fence: createDetachedRunFence(run),
    operationId: worldInput.command.operationId,
    throughWorldMinutes: worldInput.resolution.worldMinutes,
    worldInput,
  });
}

/**
 * Deliberately synthetic RPC. Models receipts/CAS with an atomic JS function;
 * it neither exercises nor claims PostgreSQL transaction/isolation guarantees.
 */
export function fakeRpc(input) {
  const branch = structuredClone(input.state);
  const receipts = new Map();
  const calls = [];
  const active = {
    timelineId: id("live-timeline"),
    epoch: 99,
    untouched: { hp: 6 },
  };
  let writes = 0;
  let turnStoreCalls = 0;
  return {
    branch,
    active,
    receipts,
    calls,
    get writes() {
      return writes;
    },
    get turnStoreCalls() {
      return turnStoreCalls;
    },
    turnStore() {
      turnStoreCalls++;
      throw new Error("Active TurnStore forbidden");
    },
    async execute(args) {
      calls.push(structuredClone(args));
      assertCommitCall(args);
      const payload = args.p_payload;
      const previous = receipts.get(payload.operationId);
      if (previous) {
        if (!isDeepStrictEqual(previous.request, payload))
          return {
            data: null,
            error: { message: "rpg_conflict PRIVATE_RECEIPT" },
          };
        return { data: structuredClone(previous.result), error: null };
      }
      if (
        branch.run.status !== "running" ||
        !sameDetachedRunFence(payload.fence, createDetachedRunFence(branch.run))
      )
        return { data: null, error: { message: "rpg_conflict PRIVATE_RUN" } };
      const committed = payload.writes.length > 0;
      if (committed) {
        for (const write of payload.writes) {
          const rows = branch.records[write.tableName];
          const at = rows.findIndex(
            (row) => (row.id ?? row.campaign_id) === write.rowKey,
          );
          if (at >= 0) rows[at] = structuredClone(write.payload);
          else rows.push(structuredClone(write.payload));
          writes++;
        }
        branch.run.headRevision++;
        branch.run.headManifestId = id(`manifest-after:${payload.operationId}`);
        branch.run.lastCheckpointId = branch.run.headManifestId;
        branch.run.currentWorldMinutes = payload.throughWorldMinutes;
        branch.manifest.id = branch.run.headManifestId;
        branch.manifest.publicMetadata.worldMinutes =
          payload.throughWorldMinutes;
      }
      const result = {
        run: structuredClone(branch.run),
        manifest: structuredClone(branch.manifest),
        operationId: payload.operationId,
        committed,
      };
      receipts.set(payload.operationId, {
        request: structuredClone(payload),
        result,
      });
      return { data: structuredClone(result), error: null };
    },
  };
}

function assertCommitCall(args) {
  if (args.p_action !== "commit" || Object.keys(args).length !== 4)
    throw new Error("Unexpected active/read RPC");
}

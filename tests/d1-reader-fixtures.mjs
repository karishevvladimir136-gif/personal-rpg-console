import { randomUUID } from "node:crypto";
import {
  DETACHED_TABLES_V1,
  DETACHED_TABLES_V2,
} from "../src/lib/saves/detached-reader.ts";
import {
  makeSource,
  makePack,
  makeScenario,
  makeRecord,
  evidence,
  owner,
} from "./wave1-library-fixtures.mjs";

export const id = () => randomUUID();
export function fixture(schemaVersion = 2) {
  const campaignId = id(),
    timelineId = id();
  const read = {
    ownerId: owner,
    campaignId,
    manifest: {
      id: id(),
      campaignId,
      timelineId,
      schemaVersion,
      canonGeneration: 2,
      refs: Object.fromEntries(
        (schemaVersion === 1 ? DETACHED_TABLES_V1 : DETACHED_TABLES_V2).map(
          (table) => [table, []],
        ),
      ),
      publicMetadata: {
        worldMinutes: 10,
        sceneTitle: "PRIVATE_SCENE_TITLE",
        privateCount: 933,
      },
      runId: null,
    },
    versions: [],
    canonGeneration: 2,
    libraryRecords: [],
    documentVersions: [],
    restrictions: [],
    run: null,
  };
  addRow(read, "rpg_private.runtime_state", {
    campaign_id: campaignId,
    revision: 1,
    world_minutes: 10,
    configuration: null,
  });
  return read;
}
export const scope = (read) => ({
  ownerId: read.ownerId,
  campaignId: read.campaignId,
});
export function addRow(read, table, payload, fields = {}) {
  const rowKey =
    table === "rpg_private.memory_aliases"
      ? `${payload.entity_id}:${payload.alias}`
      : table === "rpg_private.memory_restrictions"
        ? `${payload.kind}:${payload.source_id}`
        : (payload.id ?? payload.campaign_id);
  const version = {
    id: id(),
    campaignId: read.campaignId,
    tableName: table,
    rowKey,
    // SQL owns payload::text hashing; this fixture tests envelope/membership only.
    digest: "a".repeat(64),
    payload,
    originTimelineId: read.manifest.timelineId,
    ...fields,
  };
  read.manifest.refs[table].push(version.id);
  read.versions.push(version);
  return version;
}
export function event(read, extra = {}, rowExtra = {}) {
  const eventId = id(),
    operationId = id();
  return addRow(read, "rpg_private.world_events", {
    id: eventId,
    campaign_id: read.campaignId,
    operation_id: operationId,
    sequence: read.versions.length + 1,
    event: {
      schemaVersion: 1,
      id: eventId,
      campaignId: read.campaignId,
      originTimelineId: read.manifest.timelineId,
      operationId,
      worldMinutes: 5,
      kind: "world.observed",
      actorIds: [],
      threadIds: [],
      visibility: "public",
      text: "The harbor gate opens.",
      evidence: [],
      payload: {},
      ...extra,
    },
    ...rowExtra,
  });
}
export function knowledge(read, eventVersion, actorIds, extra = {}) {
  return addRow(read, "rpg_private.memory_public_sources", {
    id: id(),
    campaign_id: read.campaignId,
    kind: "event",
    source_id: eventVersion.payload.id,
    version: "1",
    part: 0,
    text: eventVersion.payload.event.text,
    known_by: [...actorIds],
    source_refs: [],
    current: true,
    status: "valid",
    valid_from: eventVersion.payload.event.worldMinutes,
    valid_to: null,
    ...extra,
  });
}
export function runFixture() {
  const read = fixture(3),
    source = makeSource({ title: "PRIVATE_SOURCE_TITLE" });
  const pack = makePack(source),
    scenario = makeScenario(pack);
  const divergence = makeRecord("divergence", {
    schemaVersion: 1,
    title: "PRIVATE_DIVERGENCE_TITLE",
    scenarioVersionId: scenario.versionId,
    changes: [
      { id: id(), text: "The harbor opens earlier.", visibility: "public" },
    ],
    approval: {
      ownerId: owner,
      reviewedConflictIds: [],
      reviewedUnknownIds: [],
    },
  });
  const base = {
    saveId: id(),
    timelineId: id(),
    manifestId: id(),
    schemaVersion: 2,
  };
  read.libraryRecords = [source, pack, scenario, divergence];
  read.run = {
    id: id(),
    ownerId: read.ownerId,
    campaignId: read.campaignId,
    timelineId: read.manifest.timelineId,
    label: "Harbor experiment",
    input: {
      schemaVersion: 1,
      purpose: "simulation",
      nonCanon: true,
      ownerId: read.ownerId,
      campaignId: read.campaignId,
      base,
      scenarioVersionId: scenario.versionId,
      divergenceVersionId: divergence.versionId,
      packVersionIds: [pack.versionId],
      sourceVersionIds: [source.versionId],
      documentVersions: [],
      sourceHeads: [{ sourceId: source.id, versionId: source.versionId }],
      canonGeneration: 2,
      ruleset: {
        id: "console-basic-v1",
        version: 1,
        mode: "full_ruleset",
        validatorVersion: "console-basic-v1",
      },
      effectiveSettings: { privatePrompt: "PRIVATE_PROMPT" },
      effectiveGuidance: { text: "PRIVATE_GUIDANCE" },
      resolutionPolicy: {
        id: "deterministic-world-v1",
        version: 1,
        maxSteps: 8,
      },
      startWorldMinutes: 0,
      throughWorldMinutes: 60,
    },
    inputDigest: "b".repeat(64),
    status: "running",
    reason: null,
    revision: 2,
    leaseGeneration: 3,
    headRevision: 1,
    headManifestId: read.manifest.id,
    lastCheckpointId: read.manifest.id,
    currentWorldMinutes: 10,
  };
  read.manifest.runId = read.run.id;
  const options = {
    ...scope(read),
    base: {
      saveId: base.saveId,
      timelineId: base.timelineId,
      label: "Harbor save",
      worldMinutes: 0,
    },
    scenario: {
      scenarioVersionId: scenario.versionId,
      divergenceVersionId: divergence.versionId,
      scenarioTitle: "Approved harbor scenario",
      divergenceTitle: "Opening the gate",
      assumptions: ["Earlier opening approved."],
      changes: ["The gate opens earlier."],
    },
  };
  return {
    read,
    source,
    pack,
    scenario,
    divergence,
    options,
    evidence: evidence(source),
  };
}

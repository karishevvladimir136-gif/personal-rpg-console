import { createCampaignSettings } from "../src/lib/campaign-settings.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { prepareLabInput } from "../src/lib/world-lab/inputs.ts";
import { id, owner, makeSource, makePack, makeScenario, makeRecord } from "./wave1-library-fixtures.mjs";
export { id, owner };

export function inputFixture() {
  const campaignId = id(), timelineId = id(), saveId = id(), manifestId = id(), guideId = id(), guideVersionId = id();
  const source = makeSource(), pack = makePack(source), scenario = makeScenario(pack);
  const divergence = makeRecord("divergence", {
    schemaVersion: 1, scenarioVersionId: scenario.versionId, title: "A different harbor",
    changes: [{ id: id(), text: "The harbor remains open.", visibility: "public" }],
    approval: { ownerId: owner, reviewedConflictIds: [], reviewedUnknownIds: [] },
  });
  const binding = {
    schemaVersion: 1, id: id(), ownerId: owner, campaignId, packId: pack.id, packVersionId: pack.versionId,
    scenarioVersionId: scenario.versionId, sourceVersionIds: [source.versionId], sourcePriority: [source.versionId],
    entry: structuredClone(scenario.body.entry), mappings: pack.body.entities.map((entity) => ({ packEntityId: entity.id, entityId: id() })),
  };
  const date = "2026-09-20T00:00:00+00:00";
  const document = { id: guideVersionId, campaign_id: campaignId, document_id: guideId, version: 1, title: "Guide", status: "canon", body: "PRIVATE_GUIDANCE", restored_from: null, created_at: date };
  const records = {
    "public.rpg_settings": [{ campaign_id: campaignId, values: createCampaignSettings(campaignId), revision: 1, updated_at: date }],
    "public.rpg_documents": [{ id: guideId, campaign_id: campaignId, current_version_id: guideVersionId, title: document.title, status: document.status, body: document.body, revision: 1, updated_at: date }],
    "public.rpg_sessions": [],
    "public.rpg_session_guidance": [],
    "public.rpg_pending_actions": [],
    "rpg_private.runtime_state": [{ campaign_id: campaignId, revision: 1, world_minutes: 60, configuration: null, updated_at: date }],
    "rpg_private.turns": [],
    "rpg_private.world_stages": [],
    "rpg_private.world_foundations": [{ campaign_id: campaignId, revision: 1, world: { schemaVersion: 1, campaignId, policy: { simulation: true, autonomy: "moderate", deadlinePressure: "normal" }, policyChangedAtWorldMinutes: 0, actors: [], threads: [], hooks: [], warnings: [] }, bindings: [binding], ruleset: structuredClone(WORLD_LOGIC_REF), execution_policy: null }],
  };
  const state = { ownerId: owner, campaignId, manifest: { id: manifestId, campaignId, timelineId, schemaVersion: 2, canonGeneration: 1, refs: {}, publicMetadata: { worldMinutes: 60, pendingAction: false }, runId: null }, versions: [], canonGeneration: 1, libraryRecords: [source, pack, scenario, divergence], documentVersions: [document], restrictions: [], run: null, records };
  const authority = { ownerId: owner, campaignId, saveId, state, sourceHeads: [{ sourceId: source.id, versionId: source.versionId }], documents: [{ documentId: guideId, versionId: guideVersionId, digest: sha256(document.body) }] };
  const request = { operationId: id(), campaignId, saveId, scenarioVersionId: scenario.versionId, divergenceVersionId: divergence.versionId, label: "Harbor experiment", horizonMinutes: 120 };
  function sync() {
    state.versions = Object.entries(state.records).flatMap(([tableName, values]) => values.map((payload) => ({ id: id(), campaignId, tableName, rowKey: payload.id ?? campaignId, digest: "a".repeat(64), payload: structuredClone(payload), originTimelineId: timelineId })));
    state.manifest.refs = Object.fromEntries(Object.keys(state.records).map((table) => [table, state.versions.filter((version) => version.tableName === table).map((version) => version.id)]));
    return authority;
  }
  sync();
  return { request, authority, state, source, pack, scenario, divergence, binding, sync };
}

export function runFixture() {
  const fixture = inputFixture(), prepared = prepareLabInput(fixture.request, fixture.authority);
  const run = { id: id(), ownerId: owner, campaignId: fixture.request.campaignId, timelineId: id(), label: fixture.request.label, ...prepared, status: "prepared", reason: null, revision: 0, leaseGeneration: 0, headRevision: 0, headManifestId: id(), lastCheckpointId: id(), currentWorldMinutes: prepared.input.startWorldMinutes };
  const basis = { ownerId: owner, campaignId: run.campaignId, canonGeneration: run.input.canonGeneration, sourceHeads: structuredClone(run.input.sourceHeads), documentVersions: structuredClone(run.input.documentVersions) };
  return { ...fixture, run, basis, command: (value = run) => ({ operationId: id(), campaignId: value.campaignId, runId: value.id, expectedRevision: value.revision }) };
}

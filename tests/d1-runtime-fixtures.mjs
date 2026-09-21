import {
  fixture as worldFixture,
  id as worldId,
} from "./wave1-world-fixtures.mjs";
import { runFixture, addRow, event, id } from "./d1-reader-fixtures.mjs";
import { makeSource, makePack, evidence } from "./wave1-library-fixtures.mjs";
import { readDetachedState } from "../src/lib/saves/detached-reader.ts";
export { addRow, event, id, worldId };

function reScope(value, campaignId) {
  if (Array.isArray(value))
    return value.map((child) => reScope(child, campaignId));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        key === "campaignId" || key === "campaign_id"
          ? campaignId
          : reScope(child, campaignId),
      ]),
    );
  return value;
}
export function fixture() {
  const f = runFixture(),
    accepted = worldFixture(),
    raw = f.read;
  // A source-free, explicitly approved Scenario keeps the World test independent
  // from source compilation while retaining all immutable contract identities.
  f.scenario.body.packVersionIds = [];
  f.scenario.body.sourceVersionIds = [];
  f.scenario.body.sourcePriority = [];
  f.scenario.body.identities = [];
  f.scenario.body.assumptions = [
    { id: id(), visibility: "public", text: "A synthetic harbor." },
  ];
  raw.libraryRecords = [f.scenario, f.divergence];
  raw.run.input.packVersionIds = [];
  raw.run.input.sourceVersionIds = [];
  raw.run.input.sourceHeads = [];
  raw.run.currentWorldMinutes = 0;
  raw.run.input.throughWorldMinutes = 120;
  raw.manifest.publicMetadata = { worldMinutes: 0, pendingAction: false };
  const runtime = raw.versions.find(
    (version) => version.tableName === "rpg_private.runtime_state",
  ).payload;
  runtime.world_minutes = 0;
  runtime.configuration = structuredClone(
    accepted.source.runtime.configuration,
  );
  const snapshot = reScope(accepted.source.snapshot, raw.campaignId);
  raw.run.input.effectiveSettings = structuredClone(snapshot.settings.values);
  addRow(raw, "public.rpg_settings", snapshot.settings);
  addRow(raw, "public.rpg_public_state", snapshot.publicState);
  addRow(raw, "rpg_private.memory_state", {
    campaign_id: raw.campaignId,
    generation: 2,
    public_watermark: 0,
    private_watermark: 0,
  });
  for (const [field, table] of Object.entries({
    entities: "public.rpg_entities",
    items: "public.rpg_items",
    storages: "public.rpg_storages",
    locations: "public.rpg_locations",
    quests: "public.rpg_quests",
  }))
    for (const row of snapshot[field]) addRow(raw, table, row);
  const world = reScope(accepted.snapshot.world, raw.campaignId);
  world.threads[0].actorIds.push(worldId("player"));
  world.threads[0].steps[0].publicOutcome = {
    text: "A distant bell rings.",
    actorIds: [worldId("player")],
    evidence: [],
  };
  const foundation = addRow(raw, "rpg_private.world_foundations", {
    campaign_id: raw.campaignId,
    revision: 1,
    world,
    bindings: [],
    ruleset: structuredClone(accepted.snapshot.ruleset),
    execution_policy: null,
    loop_state: {
      schemaVersion: 1,
      version: 2,
      profile: structuredClone(accepted.snapshot.ruleset),
      progression: "off",
      currencies: [],
      itemPolicies: [],
      merchants: [],
      tracks: [],
      rewards: [],
      progress: [],
      pending: [],
      preparations: [],
    },
  }).payload;
  addRow(raw, "rpg_private.dm_state", {
    campaign_id: raw.campaignId,
    revision: 1,
    contents: { canary: "PRIVATE_DM_STATE" },
  });
  return {
    ...f,
    raw,
    runtime,
    foundation,
    world,
    actor: worldId("player"),
    enemy: worldId("enemy"),
    state: () =>
      readDetachedState(raw, {
        ownerId: raw.ownerId,
        campaignId: raw.campaignId,
      }),
  };
}

export function attachSource(f, sourceExtra = {}) {
  const source = makeSource(sourceExtra),
    pack = makePack(source);
  f.raw.libraryRecords.push(source, pack);
  f.raw.run.input.packVersionIds = [pack.versionId];
  f.raw.run.input.sourceVersionIds = [source.versionId];
  f.raw.run.input.sourceHeads = [
    { sourceId: source.id, versionId: source.versionId },
  ];
  Object.assign(f.scenario.body, {
    packVersionIds: [pack.versionId],
    sourceVersionIds: [source.versionId],
    sourcePriority: [source.versionId],
  });
  f.foundation.bindings.push({
    schemaVersion: 1,
    id: id(),
    campaignId: f.raw.campaignId,
    ownerId: f.raw.ownerId,
    packId: pack.id,
    packVersionId: pack.versionId,
    scenarioVersionId: f.scenario.versionId,
    sourceVersionIds: [source.versionId],
    sourcePriority: [source.versionId],
    entry: { label: "Harbor", worldMinutes: 0, evidence: [] },
    mappings: [{ packEntityId: pack.body.entities[0].id, entityId: f.enemy }],
  });
  return { source, pack, evidence: evidence(source) };
}

export function memoryRow(f, source, fields = {}, visibility = "public") {
  const raw = f.raw;
  return addRow(
    raw,
    visibility === "public"
      ? "rpg_private.memory_public_sources"
      : "rpg_private.memory_private_sources",
    {
      id: id(),
      campaign_id: raw.campaignId,
      sequence: raw.versions.length + 1,
      kind: "event",
      source_id: source.payload.id,
      version: "1",
      part: 0,
      session_id: null,
      text: source.payload.event.text,
      entity_ids: [],
      known_by: [f.actor],
      authority: "history",
      statement_kind: "record",
      attribution: null,
      valid_from: source.payload.event.worldMinutes,
      valid_to: null,
      significance: 2,
      unresolved: false,
      current: true,
      status: "valid",
      fact_key: null,
      fact_value: null,
      source_refs: [],
      oversized: false,
      ...fields,
    },
  );
}
export const request = (f, fields = {}) => ({
  visibility: "public",
  actorIds: [f.actor],
  query: "harbor gate",
  entityIds: [],
  requiredSourceIds: [],
  maxBytes: 12_000,
  maxExcerpts: 12,
  ...fields,
});

export function memoryFixture() {
  const f = fixture();
  f.runtime.world_minutes = 20;
  f.raw.run.currentWorldMinutes = 20;
  f.raw.manifest.publicMetadata.worldMinutes = 20;
  return f;
}

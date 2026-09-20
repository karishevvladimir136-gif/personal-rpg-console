import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignBinding,
  createRpcPackStore,
  instantiatePackEntities,
  parseBinding,
} from "../src/lib/world-packs/bindings.ts";
import {
  projectCharacterKnowledge,
  invalidateCampaignSource,
} from "../src/lib/world-packs/projection.ts";
import { parseLibraryRecord } from "../src/lib/world-library/parsers.ts";
import { LEGACY_RULESET_REF } from "../src/lib/rulesets/profiles.ts";
import {
  id,
  owner,
  makeSource,
  makePack,
  makeScenario,
  fixture,
  entry,
} from "./wave1-library-fixtures.mjs";
const bind = (pack, extra = {}) =>
  buildCampaignBinding({
    id: id(),
    campaignId: id(),
    ownerId: owner,
    pack,
    entry: entry(),
    sourcePriority: pack.body.sourcePriority,
    allocateEntityId: id,
    ...extra,
  });

test("independent campaigns allocate independent stable entity mappings and never mutate source pack", () => {
  const pack = makePack(makeSource()),
    before = structuredClone(pack),
    a = bind(pack),
    b = bind(pack);
  assert.notEqual(a.campaignId, b.campaignId);
  assert.notEqual(a.mappings[0].entityId, b.mappings[0].entityId);
  assert.equal(a.mappings[0].packEntityId, b.mappings[0].packEntityId);
  const first = instantiatePackEntities(a, [pack]),
    repeated = instantiatePackEntities(structuredClone(a), [pack]);
  assert.deepEqual(first, repeated);
  assert.equal(first[0].mechanics, null);
  assert.deepEqual(pack, before);
  assert.throws(() =>
    bind(pack, { allocateEntityId: () => pack.body.entities[0].id }),
  );
  assert.throws(
    () => instantiatePackEntities({ ...a, ownerId: id() }, [pack]),
    /scope/,
  );
});

test("crossovers and native adaptations pin ingredient identities and local history without merging people", () => {
  const source = makeSource(),
    pack = makePack(source),
    other = makePack(source);
  const scenario = makeScenario(pack, {
    packVersionIds: [pack.versionId, other.versionId],
    adaptation: "native_adaptation",
    localHistory: "Both families have always lived beside the harbor.",
    identities: [
      ...pack.body.entities.map((e) => ({
        packVersionId: pack.versionId,
        packEntityId: e.id,
        scenarioEntityId: id(),
      })),
      ...other.body.entities.map((e) => ({
        packVersionId: other.versionId,
        packEntityId: e.id,
        scenarioEntityId: id(),
      })),
    ],
  });
  const b = bind(pack, { scenario, ingredientPacks: [other] });
  assert.equal(b.mappings.length, 2);
  assert.equal(b.scenarioVersionId, scenario.versionId);
  assert.throws(() =>
    parseLibraryRecord({
      ...scenario,
      body: { ...scenario.body, localHistory: null },
    }),
  );
  assert.throws(() =>
    parseLibraryRecord({
      ...scenario,
      body: { ...scenario.body, carriedClaimIds: [pack.body.claims[0].id] },
    }),
  );
  assert.throws(() => bind(pack, { scenario }));
  assert.throws(
    () =>
      bind(pack, {
        scenario,
        ingredientPacks: [other],
        entry: { ...entry(), worldMinutes: 30 },
      }),
    /conflict/,
  );
});

test("public knowledge excludes private/future/source-only/unknown-time/disputed claims before limits", () => {
  const source = makeSource(),
    pack = makePack(source),
    claim = pack.body.claims[0];
  pack.body.claims = [
    {
      ...claim,
      id: id(),
      text: "FUTURE_MARKER",
      knowledge: "future_source",
      knownByEntityIds: [],
      evidence: [{ ...claim.evidence[0], knowledge: "future_source" }],
    },
    {
      ...claim,
      id: id(),
      text: "PRIVATE_MARKER",
      visibility: "private",
      evidence: [{ ...claim.evidence[0], visibility: "private" }],
    },
    {
      ...claim,
      id: id(),
      text: "SOURCE_ONLY_MARKER",
      knowledge: "source",
      knownByEntityIds: [],
      evidence: [{ ...claim.evidence[0], knowledge: "source" }],
    },
    { ...claim, id: id(), text: "UNKNOWN_TIME_MARKER", validFrom: null },
    { ...claim, id: id(), text: "LATER_MARKER", validFrom: 100 },
    claim,
  ];
  const b = bind(pack),
    result = projectCharacterKnowledge(pack, b, b.mappings[0].entityId, 0, 1);
  assert.deepEqual(result, [{ text: "A calm harbor.", epistemic: "fact" }]);
  assert.equal(JSON.stringify(result).includes("MARKER"), false);
  assert.equal(Object.keys(result[0]).sort().join(","), "epistemic,text");
  const contradiction = id();
  pack.body.contradictions = [
    {
      id: contradiction,
      claimIds: [claim.id, pack.body.claims[4].id],
      status: "unresolved",
      resolution: null,
    },
  ];
  pack.body.approval.reviewedConflictIds = [contradiction];
  assert.deepEqual(
    projectCharacterKnowledge(pack, b, b.mappings[0].entityId, 0),
    [],
  );
  assert.throws(() => projectCharacterKnowledge(pack, b, id(), 0), /scope/);
});

test("campaign correction invalidation hook stays explicit and scoped; pack updates do not propagate", async () => {
  const source = makeSource(),
    pack = makePack(source),
    b = bind(pack),
    received = [];
  const correction = {
    ownerId: owner,
    campaignId: b.campaignId,
    correctionId: id(),
    sourceVersionId: source.versionId,
  };
  await invalidateCampaignSource(b, correction, async (scope) => {
    received.push(scope);
  });
  assert.deepEqual(received, [correction]);
  await assert.rejects(
    () =>
      invalidateCampaignSource(
        b,
        { ...correction, campaignId: id() },
        async () => assert.fail(),
      ),
    /scope/,
  );
  assert.equal(b.packVersionId, pack.versionId);
});

test("binding persistent adapter validates expected fences and returned owner/private envelope", async () => {
  const source = makeSource(),
    pack = makePack(source),
    b = bind(pack),
    f = fixture([source, pack]),
    timeline = { timelineId: id(), epoch: 1 };
  const command = {
      operationId: id(),
      campaignId: b.campaignId,
      timeline,
      expectedRevision: 0,
      expectedRuntimeRevision: 0,
      expectedHeadId: null,
    },
    calls = [];
  const snapshot = {
    schemaVersion: 1,
    ownerId: owner,
    campaignId: b.campaignId,
    timeline,
    revision: 1,
    runtimeRevision: 0,
    headId: null,
    worldMinutes: 0,
    world: null,
    bindings: [b],
    ruleset: LEGACY_RULESET_REF,
    executionPolicy: null,
  };
  const store = createRpcPackStore(
    owner,
    b.campaignId,
    timeline,
    f.store,
    async (args) => {
      calls.push(args);
      return { data: snapshot };
    },
  );
  assert.deepEqual(await store.bind(command, b), snapshot);
  assert.equal(calls[0].p_action, "bind");
  assert.deepEqual(calls[0].p_payload.command, command);
  await assert.rejects(
    () => store.bind({ ...command, timeline: { ...timeline, epoch: 2 } }, b),
    /scope/,
  );
  assert.equal(calls.length, 1);
  const stale = createRpcPackStore(
    owner,
    b.campaignId,
    timeline,
    f.store,
    async () => ({
      data: { ...snapshot, timeline: { ...timeline, epoch: 2 } },
    }),
  );
  await assert.rejects(() => stale.bind(command, b), /scope/);
  assert.throws(() =>
    parseBinding({ ...b, mappings: [b.mappings[0], b.mappings[0]] }),
  );
});

test("source priority ranks eligible knowledge only, never publishing private higher-priority evidence", () => {
  const primary = makeSource(),
    secondary = makeSource(),
    pack = makePack(secondary);
  const original = pack.body.claims[0];
  pack.body.sourceVersionIds = [secondary.versionId, primary.versionId];
  pack.body.sourcePriority = [primary.versionId, secondary.versionId];
  pack.body.coverage.push({
    sourceVersionId: primary.versionId,
    status: "complete",
    processedUnits: 1,
    totalUnits: 1,
    gaps: [],
  });
  pack.body.claims.push({
    ...original,
    id: id(),
    text: "Primary public fact",
    evidence: [
      {
        ...original.evidence[0],
        sourceId: primary.id,
        sourceVersionId: primary.versionId,
      },
    ],
  });
  pack.body.claims.unshift({
    ...original,
    id: id(),
    text: "PRIVATE_PRIORITY_MARKER",
    visibility: "private",
    evidence: [
      {
        ...original.evidence[0],
        sourceId: primary.id,
        sourceVersionId: primary.versionId,
        visibility: "private",
      },
    ],
  });
  const b = bind(pack);
  assert.deepEqual(
    projectCharacterKnowledge(pack, b, b.mappings[0].entityId, 0, 1),
    [{ text: "Primary public fact", epistemic: "fact" }],
  );
  assert.throws(() =>
    projectCharacterKnowledge(
      pack,
      { ...b, entry: { ...b.entry, worldMinutes: 10 } },
      b.mappings[0].entityId,
      0,
    ),
  );
});

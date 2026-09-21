import test from "node:test";
import assert from "node:assert/strict";
import { canonical } from "../src/lib/world-library/store.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { canonicalLabJson, isLabInputApplicable, labInputDigest, parseLabInputBundle, prepareLabInput, LAB_LIMITS } from "../src/lib/world-lab/inputs.ts";
import { inputFixture, runFixture, id } from "./d1-input-fixtures.mjs";

test("D1 pins exact immutable inputs and interoperable canonical JSON", () => {
  const f = inputFixture(), { input, inputDigest } = prepareLabInput(f.request, f.authority);
  assert.equal(inputDigest, sha256(canonical(input)));
  assert.equal(canonicalLabJson(input), canonical(input));
  assert.deepEqual(input.effectiveSettings, f.state.records["public.rpg_settings"][0].values);
  assert.equal(input.effectiveGuidance.versionId, f.state.documentVersions[0].id);
  assert.equal(input.documentVersions[0].digest, sha256("PRIVATE_GUIDANCE"));
  assert.equal(input.throughWorldMinutes, 180);
  assert.equal(input.resolutionPolicy.maxSteps, 32);
  assert.ok(Object.isFrozen(input) && Object.isFrozen(input.effectiveSettings.difficulty));
  assert.throws(() => { input.sourceVersionIds.push(id()); });
  f.state.records["public.rpg_settings"][0].values.language = "ru";
  f.scenario.body.title = "Changed source object";
  assert.equal(input.effectiveSettings.language, "en");
  assert.equal(labInputDigest(input), inputDigest);
  assert.equal(canonicalLabJson({ b: 0.75, a: [1.25, "Привет 😀"] }), '{"a":[1.25,"Привет 😀"],"b":0.75}');
});

test("D1 rejects authority injection before selection, unsafe horizons and incomplete saved settings", () => {
  for (const field of ["ownerId", "manifest", "sourceVersionIds", "privateState", "ruleset", "timeline", "fence", "inputDigest"] ) {
    const f = inputFixture();
    assert.throws(() => prepareLabInput({ ...f.request, [field]: id() }, f.authority));
  }
  for (const horizonMinutes of [0, -1, 1.5, Infinity, NaN, "120", LAB_LIMITS.horizonMinutes + 1]) {
    const f = inputFixture();
    assert.throws(() => prepareLabInput({ ...f.request, horizonMinutes }, f.authority));
  }
  const f = inputFixture();
  delete f.state.records["public.rpg_settings"][0].values.language;
  f.sync();
  assert.throws(() => prepareLabInput(f.request, f.authority));
  for (const value of [NaN, Infinity, undefined, 1e-7, Number.MAX_SAFE_INTEGER + 1, { bad: "\ud800" }])
    assert.throws(() => canonicalLabJson(value));
});

test("D1 requires exact approved Scenario, Divergence and owner/version scope", () => {
  for (const mutate of [
    (f) => { f.scenario.body.status = "draft"; f.scenario.body.approval = null; },
    (f) => { f.divergence.body.approval = null; },
    (f) => { f.divergence.body.scenarioVersionId = id(); },
    (f) => { f.scenario.ownerId = id(); },
    (f) => { f.scenario.body.approval.ownerId = id(); },
    (f) => { f.pack.body.status = "draft"; f.pack.body.approval = null; },
    (f) => { f.state.libraryRecords = f.state.libraryRecords.filter((row) => row !== f.source); },
    (f) => { f.state.libraryRecords.push(structuredClone(f.source)); },
    (f) => { f.request.scenarioVersionId = id(); },
  ]) {
    const f = inputFixture(); mutate(f); f.sync();
    assert.throws(() => prepareLabInput(f.request, f.authority));
  }
});

test("D1 rejects missing/wrong Pack bindings, temporal entry and evidence substitutions", () => {
  for (const mutate of [
    (f) => { f.binding.ownerId = id(); },
    (f) => { f.binding.campaignId = id(); },
    (f) => { f.binding.scenarioVersionId = null; },
    (f) => { f.binding.packId = id(); },
    (f) => { f.binding.sourceVersionIds = [id()]; f.binding.sourcePriority = [...f.binding.sourceVersionIds]; },
    (f) => { f.binding.mappings = []; },
    (f) => { f.binding.entry.worldMinutes = 50; },
    (f) => { f.scenario.body.entry.worldMinutes = 61; f.binding.entry.worldMinutes = 61; },
    (f) => { f.pack.body.claims[0].evidence[0].sourceId = id(); },
    (f) => { f.source.body.visibility = "private"; },
    (f) => { f.source.body.knowledge = "future_source"; },
    (f) => { f.source.body.extraction.version = "text-evidence-v1"; f.pack.body.claims[0].evidence[0].digest = "0".repeat(64); },
  ]) {
    const f = inputFixture(); mutate(f); f.sync();
    assert.throws(() => prepareLabInput(f.request, f.authority));
  }
});

test("D1 accepts explicitly approved source-free assumptions without inventing a Pack", () => {
  const f = inputFixture();
  Object.assign(f.scenario.body, { packVersionIds: [], sourceVersionIds: [], sourcePriority: [], identities: [], assumptions: [{ id: id(), text: "An uninhabited coast.", visibility: "public" }] });
  f.state.libraryRecords = [f.scenario, f.divergence];
  f.state.records["rpg_private.world_foundations"][0].bindings = [];
  f.authority.sourceHeads = [];
  f.sync();
  assert.deepEqual(prepareLabInput(f.request, f.authority).input.packVersionIds, []);
  f.scenario.body.assumptions = [];
  assert.throws(() => prepareLabInput(f.request, f.authority));
});

test("D1 refuses unstable, legacy-unconfigured or stale bases, preserving inherited pending work", () => {
  for (const mutate of [
    (f) => { f.state.manifest.schemaVersion = 1; },
    (f) => { f.state.manifest.publicMetadata.pendingAction = true; },
    (f) => { f.state.manifest.canonGeneration = 0; },
    (f) => { f.state.canonGeneration = 2; },
    (f) => { f.state.records["rpg_private.world_foundations"][0].world = null; },
    (f) => { f.state.records["rpg_private.turns"].push({ id: id(), campaign_id: f.request.campaignId, owner_id: f.authority.ownerId, status: "awaiting_confirmation", retryable: false, checkpoint: { checks: [{ dice: [20] }] } }); },
    (f) => { f.state.records["rpg_private.turns"].push({ id: id(), campaign_id: f.request.campaignId, owner_id: f.authority.ownerId, status: "failed", retryable: true }); },
    (f) => { f.state.records["public.rpg_pending_actions"].push({ id: id(), campaign_id: f.request.campaignId, status: "proposed" }); },
    (f) => { f.authority.sourceHeads[0].versionId = id(); },
    (f) => { f.authority.documents[0].digest = "0".repeat(64); },
    (f) => { f.state.documentVersions[0].campaign_id = id(); },
    (f) => { f.state.records["public.rpg_documents"][0].current_version_id = id(); },
  ]) {
    const f = inputFixture(); mutate(f); f.sync();
    const prior = structuredClone(f.state);
    assert.throws(() => prepareLabInput(f.request, f.authority));
    assert.deepEqual(f.state, prior);
  }
});

test("D1 source/document corrections invalidate applicability without rewriting inputs or using active epoch", () => {
  const f = runFixture(), original = canonicalLabJson(f.run.input);
  assert.equal(isLabInputApplicable(f.run.input, f.basis), true);
  // There is deliberately no activeTimelineId or activation epoch in the basis.
  for (const modify of [
    (basis) => basis.canonGeneration++,
    (basis) => { basis.sourceHeads[0].versionId = id(); },
    (basis) => { basis.documentVersions[0].versionId = id(); },
    (basis) => { basis.documentVersions[0].digest = "b".repeat(64); },
  ]) {
    const basis = structuredClone(f.basis); modify(basis);
    assert.equal(isLabInputApplicable(f.run.input, basis), false);
    assert.equal(canonicalLabJson(f.run.input), original);
  }
  assert.throws(() => isLabInputApplicable(f.run.input, { ...f.basis, ownerId: id() }), /scope/);
  assert.throws(() => parseLabInputBundle({ ...f.run.input, activeEpoch: 7 }));
});

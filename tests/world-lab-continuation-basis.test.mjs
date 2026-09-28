import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { checkpointFixture } from "./world-lab-continuation-fixtures.mjs";
import { compositionFixture } from "./d2a-composition-fixtures.mjs";
import {
  buildCompositionBasis,
  recordCompositionPlan,
  approveCompositionPlan,
  editCompositionPlan,
  projectComposition,
} from "../src/lib/world-lab/composition.ts";
import {
  labInputDigest,
  parseLabInputBundle,
  prepareLabInput,
} from "../src/lib/world-lab/inputs.ts";
import { makeRecord } from "./wave1-library-fixtures.mjs";

test("checkpoint child uses exact structured/private basis and existing approval without changing parent", () => {
  const f = checkpointFixture(),
    original = structuredClone(f.state);
  const reviewed = recordCompositionPlan(f.requested, f.proposal, f.usage),
    scid = randomUUID();
  const plan = approveCompositionPlan(reviewed, {
    basis: f.prepared.basis,
    ownerId: f.state.ownerId,
    scenarioVersionId: scid,
    allocateId: randomUUID,
  });
  const scenario = {
      ...makeRecord("scenario", plan.scenario),
      versionId: scid,
    },
    divergence = makeRecord("divergence", plan.divergence);
  const prepared = prepareLabInput(
    {
      ...f.request,
      operationId: randomUUID(),
      scenarioVersionId: scenario.versionId,
      divergenceVersionId: divergence.versionId,
    },
    {
      ...f.authority,
      continuation: f.continuation,
      scenarioRecords: [scenario, divergence],
    },
  );
  assert.equal(
    prepared.input.base.manifestId,
    f.continuation.sourceCheckpointId,
  );
  assert.equal(prepared.input.base.timelineId, f.state.run.timelineId);
  assert.equal(prepared.input.base.schemaVersion, 3);
  assert.equal(prepared.input.startWorldMinutes, 60);
  assert.deepEqual(prepared.input.continuation, f.continuation);
  assert.equal(prepared.inputDigest, labInputDigest(prepared.input));
  assert.deepEqual(f.state, original);
  assert.doesNotMatch(
    JSON.stringify(projectComposition(plan.scenario.composition)),
    /PRIVATE_|SECRET_|sourceInputDigest|baseManifestId|known_by/,
  );
});

test("child timing stays null until owner explicitly saves values and timing review", () => {
  const f = checkpointFixture();
  const reviewed = recordCompositionPlan(
    f.requested,
    {
      ...f.proposal,
      offsetMinutes: null,
      horizonMinutes: null,
      ambiguities: [
        { question: "Which hour does the change begin?", consequential: true },
      ],
    },
    f.usage,
  );
  assert.equal(reviewed.composition.review.offsetMinutes, null);
  assert.equal(reviewed.composition.review.horizonMinutes, null);
  assert.throws(() =>
    approveCompositionPlan(reviewed, {
      basis: f.prepared.basis,
      ownerId: f.state.ownerId,
      scenarioVersionId: randomUUID(),
      allocateId: randomUUID,
    }),
  );
  const edited = editCompositionPlan(reviewed, {
    review: {
      ...reviewed.composition.review,
      ambiguityAnswers: ["After the first watch"],
    },
    ownerId: f.state.ownerId,
    fromVersionId: randomUUID(),
  });
  assert.equal(edited.composition.review.offsetMinutes, null);
  assert.equal(edited.composition.review.horizonMinutes, null);
  assert.deepEqual(edited.composition.basis, reviewed.composition.basis);
  assert.ok(
    projectComposition(edited.composition).blockers.includes(
      "timing_unresolved",
    ),
  );
});

test("checkpoint basis rejects sibling/revision/digest/map and correction substitution", () => {
  for (const mutate of [
    (f) => {
      f.envelope.continuation.sourceRunId = randomUUID();
    },
    (f) => {
      f.envelope.continuation.sourceCheckpointId = randomUUID();
    },
    (f) => {
      f.envelope.continuation.sourceRunRevision++;
    },
    (f) => {
      f.envelope.continuation.sourceInputDigest = "f".repeat(64);
    },
    (f) => {
      f.state.records["rpg_private.runtime_state"][0].world_minutes++;
    },
    (f) => {
      f.state.canonGeneration++;
    },
  ]) {
    const f = checkpointFixture();
    mutate(f);
    assert.throws(() => buildCompositionBasis(f.envelope));
  }
});

test("continuation is in run digest and absent from unchanged historical D2A bases", () => {
  const f = checkpointFixture(),
    normal = compositionFixture();
  assert.equal(Object.hasOwn(normal.basis, "continuation"), false);
  const original = prepareLabInput(normal.request, normal.authority);
  assert.equal(Object.hasOwn(original.input, "continuation"), false);
  const child = {
    ...original.input,
    base: {
      ...original.input.base,
      manifestId: f.continuation.sourceCheckpointId,
      schemaVersion: 3,
    },
    continuation: f.continuation,
  };
  assert.notEqual(
    labInputDigest(child),
    labInputDigest({
      ...child,
      continuation: { ...f.continuation, sourceInputDigest: "e".repeat(64) },
    }),
  );
  assert.deepEqual(parseLabInputBundle(child), child);
  assert.throws(() =>
    parseLabInputBundle({
      ...child,
      base: { ...child.base, manifestId: randomUUID() },
    }),
  );
});

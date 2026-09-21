import test from "node:test";
import assert from "node:assert/strict";
import { compositionFixture, id, owner } from "./d2a-composition-fixtures.mjs";
import {
  recordCompositionPlan,
  editCompositionPlan,
  approveCompositionPlan,
  compositionApprovalBlockers,
  parseCompositionMetadata,
  projectComposition,
} from "../src/lib/world-lab/composition.ts";
import {
  parseCompositionProposal,
  parseCompositionReview,
  confirmCompositionTiming,
  compositionTimingConfirmed,
} from "../src/lib/world-lab/composition-validation.ts";
import { readPublicComposition } from "../src/components/world-lab/authoring-client.ts";
import { serverModule, scriptedProvider } from "./d2a-qa-fixture.mjs";

function ambiguous(legacy = false) {
  const f = compositionFixture();
  Object.assign(f.proposal, {
    timingText: "Unknown until the owner identifies who, what and when.",
    offsetMinutes: legacy ? 0 : null,
    horizonMinutes: legacy ? 43200 : null,
    affectedActorIndexes: [],
    affectedThreadIndexes: [],
    locationIndex: null,
    ambiguities: [
      "Who changes her mind?",
      "About which meeting?",
      "When, and how long should we explore?",
    ].map((question) => ({ question, consequential: true })),
  });
  const draft = recordCompositionPlan(f.requested, f.proposal, f.usage);
  const edit = (body, patch) =>
    editCompositionPlan(body, {
      ownerId: owner,
      fromVersionId: id(),
      review: { ...body.composition.review, ...patch },
    });
  const approve = (body) =>
    approveCompositionPlan(body, {
      basis: f.basis,
      ownerId: owner,
      scenarioVersionId: id(),
      allocateId: id,
    });
  const answers = {
    ambiguityAnswers: [
      "Mara",
      "Only the existing patrol",
      "Start five minutes after the checkpoint; explore for one hour.",
    ],
    affectedActorIndexes: [f.actorIndex],
    affectedThreadIndexes: [0],
  };
  return { ...f, draft, edit, approve, answers };
}

test("timing: unknown who/what/when stays null in strict provider output, persistence and public projection", async (t) => {
  let network = 0;
  t.mock.method(globalThis, "fetch", () => {
    network++;
    throw Error("No live network authorized");
  });
  const f = ambiguous(),
    before = structuredClone(f.state);
  const {
    createComposerProvider,
    compositionProposalSchema,
    composerInstructions,
  } = await serverModule("src/lib/server/world-lab/composer-provider.ts");
  for (const key of ["offsetMinutes", "horizonMinutes"])
    assert.deepEqual(compositionProposalSchema.properties[key].type, [
      "integer",
      "null",
    ]);
  assert.match(
    composerInstructions,
    /Never substitute zero or maximumHorizonMinutes/,
  );
  const scripted = scriptedProvider(f.proposal);
  const response = await createComposerProvider(scripted.options)(
    f.requested.composition,
  );
  assert.deepEqual(response.output, f.proposal);
  assert.deepEqual(parseCompositionProposal(f.proposal), f.proposal);
  const projection = readPublicComposition(
    projectComposition(f.draft.composition),
  );
  assert.equal(projection.review.offsetMinutes, null);
  assert.equal(projection.review.horizonMinutes, null);
  for (const blocker of [
    "ambiguity_unresolved",
    "scope_required",
    "timing_unresolved",
    "timing_review_required",
  ])
    assert.ok(projection.blockers.includes(blocker));
  assert.throws(() => f.approve(f.draft));
  assert.equal(network, 0);
  assert.equal(scripted.requests.length, 1); // injected deterministic response only
  assert.deepEqual(f.state, before);
});

test("timing: answering all consequential questions cannot authorize null timing or legacy 0/max placeholders", () => {
  for (const legacy of [false, true]) {
    const f = ambiguous(legacy),
      original = structuredClone(f.draft);
    const answered = f.edit(f.draft, f.answers);
    assert.ok(
      compositionApprovalBlockers(answered.composition).includes(
        "timing_review_required",
      ),
    );
    assert.throws(() => f.approve(answered));
    assert.deepEqual(f.draft, original);
    assert.deepEqual(answered.composition.originalProposal, f.proposal);
    if (!legacy) assert.equal(answered.composition.review.offsetMinutes, null);
  }
});

test("timing: resolved values plus exact owner confirmation can approve; stale confirmations cannot", () => {
  const f = ambiguous();
  const answered = f.edit(f.draft, {
    ...f.answers,
    timingText: "Start at minute 5; explore until minute 60.",
    offsetMinutes: 5,
    horizonMinutes: 60,
  });
  assert.throws(() => f.approve(answered));
  const confirmed = f.edit(answered, {
    timingReview: confirmCompositionTiming(answered.composition.review),
  });
  assert.deepEqual(compositionApprovalBlockers(confirmed.composition), []);
  const approved = f.approve(confirmed);
  assert.equal(approved.scenario.status, "approved");
  assert.equal(approved.scenario.composition.review.offsetMinutes, 5);
  assert.deepEqual(approved.scenario.composition.originalProposal, f.proposal);
  for (const patch of [
    {
      ambiguityAnswers: [
        ...f.answers.ambiguityAnswers.slice(0, 2),
        "Start at minute 10; explore two hours.",
      ],
    },
    { timingText: "A different time" },
    { offsetMinutes: 10 },
    { horizonMinutes: 120 },
  ]) {
    const changed = f.edit(approved.scenario, patch);
    assert.equal(changed.composition.review.timingReview, null);
    assert.equal(changed.approval, null);
    assert.throws(() => f.approve(changed));
    const stale = { ...confirmed.composition.review, ...patch };
    assert.equal(compositionTimingConfirmed(stale), false);
    assert.ok(
      compositionApprovalBlockers({
        ...confirmed.composition,
        review: stale,
      }).includes("timing_review_required"),
    );
  }
});

test("timing: previously unambiguous integer proposals remain compatible and old approved metadata remains byte-equivalent", () => {
  const f = compositionFixture();
  const draft = recordCompositionPlan(f.requested, f.proposal, f.usage);
  const approved = approveCompositionPlan(draft, {
    basis: f.basis,
    ownerId: owner,
    scenarioVersionId: id(),
    allocateId: id,
  });
  assert.deepEqual(compositionApprovalBlockers(draft.composition), []);
  assert.deepEqual(
    parseCompositionMetadata(approved.scenario.composition),
    approved.scenario.composition,
  );
  assert.equal(
    Object.hasOwn(approved.scenario.composition.review, "timingReview"),
    false,
  );
  // A historical v15 approval with answered questions remains readable, but
  // editing it must pass today's gate before another approval is possible.
  const old = ambiguous(true),
    answered = old.edit(old.draft, old.answers);
  const historical = { ...answered.composition, phase: "approved" };
  assert.deepEqual(
    parseCompositionMetadata(JSON.parse(JSON.stringify(historical))),
    historical,
  );
  assert.throws(() => old.approve(answered));
});

test("timing: no coercion, overflow, authority fields or malformed confirmation accepted", () => {
  const f = ambiguous(),
    review = f.draft.composition.review;
  for (const offsetMinutes of [undefined, "0", false, -1, 0.5, 43201])
    assert.throws(() => parseCompositionReview({ ...review, offsetMinutes }));
  for (const horizonMinutes of [undefined, "60", false, 0, 0.5, 43201])
    assert.throws(() => parseCompositionReview({ ...review, horizonMinutes }));
  assert.throws(() => confirmCompositionTiming(review));
  const resolved = { ...review, offsetMinutes: 0, horizonMinutes: 60 };
  const timingReview = confirmCompositionTiming(resolved);
  for (const field of ["approved", "ownerId", "sourceVersionId"])
    assert.throws(() =>
      parseCompositionReview({
        ...resolved,
        timingReview: { ...timingReview, [field]: "forged" },
      }),
    );
});

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { leafRoot, moduleFromSource } from "./d2a-qa-fixture.mjs";

const { integrationFixture, durableState } = await import(
  new URL(
    "tests/d2a-integration-fixture.mjs",
    leafRoot("D2A_INTEGRATION_SOURCE_ROOT"),
  ).href
);
const { editCompositionPlan, approveCompositionPlan } = await moduleFromSource(
  "src/lib/world-lab/composition.ts",
);
const { seedSource, liveProjection } = await moduleFromSource(
  "tests/d1-qa-fixture.mjs",
);
const { sha256 } = await moduleFromSource("src/lib/world-library/parsers.ts");

const nextVersion = (previous, body) => ({
  ...structuredClone(previous),
  version: previous.version + 1,
  previousVersionId: previous.versionId,
  versionId: randomUUID(),
  body,
});
const libraryRows = (f) =>
  f.query(
    "select * from rpg_private.library_records where owner_id=$1 order by version_id",
    [f.owner],
  );

test("D2A QA SQL preserves immutable proposal and owner-edit authority; a material edit creates an unapproved version", async () => {
  const f = await integrationFixture();
  try {
    const approved = await f.approve();
    const review = structuredClone(approved.scenario.body.composition.review);
    review.title = "Owner corrected crossing";
    review.constraints.push("Preserve the approved actor ownership.");
    const body = editCompositionPlan(approved.scenario.body, {
      review,
      ownerId: f.owner,
      fromVersionId: approved.scenario.versionId,
    });
    assert.equal(body.status, "draft");
    assert.equal(body.approval, null);
    assert.equal(body.composition.phase, "review");
    const history = await libraryRows(f),
      stable = await durableState(f),
      live = await liveProjection(f);
    for (const mutate of [
      (body) => {
        body.composition.ownerEdit = null;
      },
      (body) => {
        body.composition.ownerEdit.ownerId = f.other;
      },
      (body) => {
        body.composition.ownerEdit.fromVersionId = randomUUID();
      },
      (body) => {
        body.composition.originalProposal.changeDescription =
          "MODEL_REPLACED_OWNER_HISTORY";
      },
      (body) => {
        body.composition.usage.outputTokens += 1;
      },
      (body) => {
        body.composition.premise = "REPLACED_PREMISE";
      },
      (body) => {
        body.composition.choices.actors[0].label = "REPLACED_AUTHORITY";
      },
      (body) => {
        body.composition.basis.baseManifestId = randomUUID();
      },
      (body) => {
        body.composition.phase = "approved";
        body.status = "approved";
        body.approval = approved.scenario.body.approval;
      },
    ]) {
      const invalid = structuredClone(body);
      mutate(invalid);
      await assert.rejects(() =>
        f.library(nextVersion(approved.scenario, invalid)),
      );
    }
    assert.deepEqual(await libraryRows(f), history);
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
    const edited = nextVersion(approved.scenario, body);
    await f.library(edited);
    const current = (await libraryRows(f)).find(
      (row) => row.version_id === edited.versionId,
    );
    assert.deepEqual(
      current.body.composition.ownerEdit,
      body.composition.ownerEdit,
    );
    assert.equal(current.body.approval, null);
    for (const old of history)
      assert.deepEqual(
        (await libraryRows(f)).find((row) => row.version_id === old.version_id),
        old,
      );
    assert.equal(
      f.transport.requests.filter((r) => r.kind === "resolve").length,
      0,
    );
    assert.deepEqual(await liveProjection(f), live);
  } finally {
    await f.db.close();
  }
});

test("D2A QA SQL requires requested, review and explicit approval history and rejects a review change hidden inside approval", async () => {
  const f = await integrationFixture();
  try {
    const approved = await f.approve();
    const initialApproved = {
      ...structuredClone(approved.scenario),
      id: randomUUID(),
      versionId: randomUUID(),
      version: 1,
      previousVersionId: null,
    };
    const initialReview = {
      ...structuredClone(approved.reviewRecord),
      id: randomUUID(),
      versionId: randomUUID(),
      version: 1,
      previousVersionId: null,
    };
    const stable = await libraryRows(f);
    await assert.rejects(() => f.library(initialApproved));
    await assert.rejects(() => f.library(initialReview));
    const review = structuredClone(approved.scenario.body.composition.review);
    review.changeDescription = "Explicit manual correction before approval.";
    const edited = nextVersion(
      approved.scenario,
      editCompositionPlan(approved.scenario.body, {
        review,
        ownerId: f.owner,
        fromVersionId: approved.scenario.versionId,
      }),
    );
    await f.library(edited);
    const approvedVersionId = randomUUID();
    const plan = approveCompositionPlan(edited.body, {
      basis: f.prepared.basis,
      ownerId: f.owner,
      scenarioVersionId: approvedVersionId,
      allocateId: randomUUID,
    });
    const hiddenEdit = structuredClone(plan.scenario);
    hiddenEdit.composition.review.changeDescription =
      "Changed after owner review.";
    await assert.rejects(() => f.library(nextVersion(edited, hiddenEdit)));
    const next = {
      ...nextVersion(edited, plan.scenario),
      versionId: approvedVersionId,
    };
    await f.library(next);
    assert.equal(
      (await libraryRows(f)).find((row) => row.version_id === next.versionId)
        .body.status,
      "approved",
    );
    for (const old of stable)
      assert.deepEqual(
        (await libraryRows(f)).find((row) => row.version_id === old.version_id),
        old,
      );
    assert.equal((await durableState(f)).runs, null);
  } finally {
    await f.db.close();
  }
});

test("D2A QA SQL refuses approval and preparation after a pinned Source correction without rewriting review history", async () => {
  let source;
  const f = await integrationFixture({
    beforeSave: async (f) => {
      source = await seedSource(f);
    },
  });
  try {
    const approved = await f.approve();
    const review = structuredClone(approved.scenario.body.composition.review);
    review.constraints.push("Owner edit before the source correction.");
    const edited = nextVersion(
      approved.scenario,
      editCompositionPlan(approved.scenario.body, {
        review,
        ownerId: f.owner,
        fromVersionId: approved.scenario.versionId,
      }),
    );
    await f.library(edited);
    const text =
      "A revised synthetic harbor source invalidates this old basis.";
    await f.library({
      ...source,
      version: 2,
      previousVersionId: source.versionId,
      versionId: randomUUID(),
      body: {
        ...source.body,
        original: { kind: "text", text },
        digest: sha256(text),
      },
    });
    const history = await libraryRows(f),
      stable = await durableState(f),
      live = await liveProjection(f);
    const plan = approveCompositionPlan(edited.body, {
      basis: f.prepared.basis,
      ownerId: f.owner,
      scenarioVersionId: randomUUID(),
      allocateId: randomUUID,
    });
    await assert.rejects(() => f.library(nextVersion(edited, plan.scenario)));
    await assert.rejects(() => f.store.prepare(approved.request));
    assert.deepEqual(await libraryRows(f), history);
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
  } finally {
    await f.db.close();
  }
});

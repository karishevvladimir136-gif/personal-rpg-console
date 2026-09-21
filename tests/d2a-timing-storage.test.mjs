import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  integrationFixture,
  durableState,
} from "./d2a-integration-fixture.mjs";
import { liveProjection } from "./d1-qa-fixture.mjs";
import {
  recordCompositionPlan,
  editCompositionPlan,
  parseCompositionMetadata,
} from "../src/lib/world-lab/composition.ts";
import { confirmCompositionTiming } from "../src/lib/world-lab/composition-validation.ts";

const selection = {
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "max",
};
const next = (previous, body) => ({
  ...previous,
  version: previous.version + 1,
  previousVersionId: previous.versionId,
  versionId: randomUUID(),
  body,
});
const approval = (ownerId) => ({
  ownerId,
  reviewedConflictIds: [],
  reviewedUnknownIds: [],
});
const forgedApproval = (body) => ({
  ...structuredClone(body),
  status: "approved",
  approval: approval(body.composition.basis.ownerId),
  composition: { ...structuredClone(body.composition), phase: "approved" },
});
const rows = (f) =>
  f.query("select * from rpg_private.library_records order by version_id");

test("timing SQL: populated v15 approvals/readers and detached inputs survive additive migration unchanged", async (t) => {
  t.mock.method(globalThis, "fetch", () => assert.fail("offline only"));
  const f = await integrationFixture({ migrationThrough: 15 });
  try {
    // Establish an actual old approval containing the old integer-placeholder
    // shape, using v15's original SQL (not a current-validator bypass).
    const proposal = {
      ...f.proposal,
      timingText: "Unknown",
      offsetMinutes: 0,
      horizonMinutes: 43200,
      ambiguities: [{ question: "When?", consequential: true }],
    };
    const requested = {
      schemaVersion: 1,
      ownerId: f.owner,
      kind: "scenario",
      id: randomUUID(),
      versionId: randomUUID(),
      version: 1,
      previousVersionId: null,
      body: f.requested,
    };
    await f.library(requested);
    const interpreted = next(
      requested,
      recordCompositionPlan(f.requested, proposal, {
        model: "gpt-6-astra",
        inputTokens: 1,
        outputTokens: 1,
        calls: 1,
        latencyMs: 1,
      }),
    );
    await f.library(interpreted);
    const edited = next(
      interpreted,
      editCompositionPlan(interpreted.body, {
        ownerId: f.owner,
        fromVersionId: interpreted.versionId,
        review: {
          ...interpreted.body.composition.review,
          ambiguityAnswers: ["At the saved point, explore for one hour."],
        },
      }),
    );
    await f.library(edited);
    const oldApproval = next(edited, forgedApproval(edited.body));
    await f.library(oldApproval); // v15 allowed this; preserve it as history.
    const unambiguous = await f.approve();
    const sibling = await f.store.prepare(unambiguous.request);
    const siblingBefore = await f.store.readDetached(f.cid, sibling.id);
    const before = await rows(f),
      live = await liveProjection(f),
      durable = await durableState(f);
    await f.db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609200016_d2a_review_timing.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.deepEqual(await rows(f), before);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(await durableState(f), durable);
    assert.deepEqual(
      await f.store.readDetached(f.cid, sibling.id),
      siblingBefore,
    );
    assert.deepEqual(
      parseCompositionMetadata(oldApproval.body.composition),
      oldApproval.body.composition,
    );
    await f.one(
      "select rpg_private.lab_composition_valid($1,$2,$3,$4::jsonb)",
      [
        f.owner,
        f.cid,
        f.prepared.basis.baseManifestId,
        JSON.stringify(oldApproval.body),
      ],
    );
    // The same approval shape is forbidden for a NEW immutable version.
    const fresh = next(
      oldApproval,
      editCompositionPlan(oldApproval.body, {
        ownerId: f.owner,
        fromVersionId: oldApproval.versionId,
        review: {
          ...oldApproval.body.composition.review,
          title: "Review old timing again",
        },
      }),
    );
    await f.library(fresh);
    const history = await rows(f);
    await assert.rejects(() =>
      f.library(next(fresh, forgedApproval(fresh.body))),
    );
    assert.deepEqual(await rows(f), history);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(
      await f.store.readDetached(f.cid, sibling.id),
      siblingBefore,
    );
  } finally {
    await f.db.close();
  }
});

test("timing SQL/service: null draft, answer-only and stale confirmation block; resolved review prepares without resolver or live/sibling mutation", async (t) => {
  let network = 0;
  t.mock.method(globalThis, "fetch", () => {
    network++;
    throw Error("offline only");
  });
  const f = await integrationFixture();
  try {
    const base = await f.approve();
    const sibling = await f.store.prepare(base.request);
    const siblingBefore = await f.store.readDetached(f.cid, sibling.id);
    const live = await liveProjection(f);
    Object.assign(f.proposal, {
      timingText: "Unknown",
      offsetMinutes: null,
      horizonMinutes: null,
      ambiguities: [
        { question: "Who and what?", consequential: true },
        { question: "When, and for how long?", consequential: true },
      ],
    });
    const { authoring, library } = await f.services();
    const interpreted = await authoring.perform({
      action: "interpret",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        saveId: f.save.id,
        premise: f.requested.composition.premise,
        model: selection,
      },
    });
    assert.equal(interpreted.draft.proposal.review.offsetMinutes, null);
    assert.equal(interpreted.draft.proposal.review.horizonMinutes, null);
    const edit = async (draft, patch) =>
      authoring.perform({
        action: "edit",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          versionId: draft.versionId,
          review: { ...draft.proposal.review, ...patch },
          model: selection,
        },
      });
    const approve = (draft) =>
      authoring.perform({
        action: "approve",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          versionId: draft.versionId,
        },
      });
    const rejectBoth = async (draft) => {
      const history = await rows(f),
        durable = await durableState(f);
      await assert.rejects(() => approve(draft));
      const record = (
        await library.read({ kind: "scenario", id: draft.id })
      ).find((r) => r.versionId === draft.versionId);
      await assert.rejects(() =>
        f.library(next(record, forgedApproval(record.body))),
      );
      assert.deepEqual(await rows(f), history);
      assert.deepEqual(await durableState(f), durable);
    };
    await rejectBoth(interpreted.draft);
    const answered = await edit(interpreted.draft, {
      ambiguityAnswers: [
        "Only Nera's existing thread",
        "Begin at minute 5; explore until minute 60",
      ],
    });
    await rejectBoth(answered.draft);
    const numeric = await edit(answered.draft, {
      timingText: "Begin at minute 5; explore until minute 60",
      offsetMinutes: 5,
      horizonMinutes: 60,
    });
    await rejectBoth(numeric.draft);
    const confirmed = await edit(numeric.draft, {
      timingReview: confirmCompositionTiming(numeric.draft.proposal.review),
    });
    assert.deepEqual(confirmed.draft.proposal.blockers, []);
    const stale = await edit(confirmed.draft, {
      ambiguityAnswers: [
        "Only Nera's existing thread",
        "Begin at minute 10; explore until minute 60",
      ],
    });
    assert.equal(stale.draft.proposal.review.timingReview, null);
    await rejectBoth(stale.draft);
    // Direct SQL cannot skip invalidation by carrying a stale snapshot forward.
    const record = (
      await library.read({ kind: "scenario", id: stale.draft.id })
    ).find((r) => r.versionId === stale.draft.versionId);
    const bad = structuredClone(record.body);
    bad.composition.review.timingReview =
      confirmed.draft.proposal.review.timingReview;
    bad.composition.ownerEdit = {
      ownerId: f.owner,
      fromVersionId: record.versionId,
      fields: ["timingReview"],
    };
    const storedStale = next(record, bad);
    await f.library(storedStale);
    await assert.rejects(() =>
      f.library(next(storedStale, forgedApproval(storedStale.body))),
    );
    const corrected = { ...stale.draft, versionId: storedStale.versionId };
    const resolvedReview = {
      ...corrected.proposal.review,
      timingText: "Begin at minute 10; explore until minute 60",
      offsetMinutes: 10,
    };
    resolvedReview.timingReview = confirmCompositionTiming(resolvedReview);
    const resolved = await edit(corrected, resolvedReview);
    const result = await approve(resolved.draft);
    assert.equal(result.run.status, "prepared");
    assert.equal(result.run.currentWorldMinutes, 0);
    assert.equal(result.run.checkpoints.length, 1);
    const originals = await library.read({
      kind: "scenario",
      id: interpreted.draft.id,
    });
    for (const version of originals.filter(
      (r) => r.body.composition.originalProposal,
    ))
      assert.deepEqual(version.body.composition.originalProposal, f.proposal);
    assert.equal(
      f.transport.requests.filter((r) => r.kind === "resolve").length,
      0,
    );
    assert.equal(network, 0);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(
      await f.store.readDetached(f.cid, sibling.id),
      siblingBefore,
    );
  } finally {
    await f.db.close();
  }
});

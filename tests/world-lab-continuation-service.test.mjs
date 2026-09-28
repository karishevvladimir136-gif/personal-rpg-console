import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { d2aFixture } from "./d2a-sql-fixture.mjs";
import { seedSource } from "./d1-qa-fixture.mjs";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { createLabService } from "../src/lib/world-lab/service.ts";
import {
  selectWorldSimulationWork,
  stageSimulatedWorldTransition,
} from "../src/lib/world/resolver.ts";
import { createLabContinuationService } from "../src/lib/world-lab/continuation.ts";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";

const model = {
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "high",
};
const command = (run) => ({
  operationId: randomUUID(),
  campaignId: run.campaignId,
  runId: run.id,
  expectedRevision: run.revision,
});
function publicOnly(value) {
  assert.doesNotMatch(
    JSON.stringify(value),
    /PRIVATE_|QA_PRIVATE|sourceInputDigest|inputDigest|sourceHeads|documentVersions|known_by|leaseGeneration|headRevision|privateText/,
  );
}
async function fixture(
  language = "en",
  { ambiguous = false, withSource = false } = {},
) {
  const f = await d2aFixture({
    transformWorld: (world) => {
      world.threads[0].publicTitle = "Harbor watch";
      world.actors[0].capabilities = ["world.condition.add:wet"];
    },
  });
  try {
    await f.db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609270021_v1_checkpoint_continuation.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const seededSource = withSource
      ? await seedSource(f, (pack) => {
          for (const claim of pack.body.claims) {
            claim.knowledge = "canon_at_entry";
            claim.knownByEntityIds = [];
            claim.evidence = claim.evidence.map((e) => ({
              ...e,
              knowledge: "canon_at_entry",
            }));
          }
        })
      : null;
    const library = createRpcLibraryStore(f.owner, async (args) => {
      try {
        return {
          data: (
            await f.one(
              "select public.rpg_library($1,null,$2,$3::jsonb,null) result",
              [args.p_owner_id, args.p_action, JSON.stringify(args.p_payload)],
            )
          ).result,
        };
      } catch (cause) {
        return {
          data: null,
          error: { message: cause.message, code: cause.code },
        };
      }
    });
    const lab = createLabService(f.owner, f.rpc, language, {
      resolver: () => ({
        simulate: async (input, scope, profile) => {
          const selected = selectWorldSimulationWork(input, scope);
          assert.equal(selected.status, "ready");
          const proposal = {
            schemaVersion: 2,
            decisions: selected.candidates.map((candidate) => ({
              threadId: candidate.threadId,
              stepId: candidate.stepId,
              decision: "advance",
              uncertainty: "resolved",
              consequences: candidate.branchAffected
                ? [candidate.consequenceOptions[0].effect]
                : candidate.consequences,
              capabilityRefs: candidate.branchAffected
                ? [candidate.consequenceOptions[0].capabilityRef]
                : candidate.requiredCapabilityRefs,
              evidenceIndexes: candidate.evidence.map((_, index) => index),
            })),
          };
          return {
            proposal,
            result: stageSimulatedWorldTransition(input, scope, proposal),
            usage: {
              model: profile.modelId,
              inputTokens: 10,
              outputTokens: 10,
              calls: 1,
              latencyMs: 1,
            },
          };
        },
      }),
    });
    const parentRaw = await f.store.prepare(f.request);
    const parent = await lab.perform({
      action: "continue",
      input: command(parentRaw),
    });
    const checkpoint = parent.checkpoints.at(-1);
    const source = {
      sourceRunId: parent.id,
      sourceCheckpointId: checkpoint.id,
      expectedRevision: parent.revision,
    };
    let composeCalls = 0;
    const service = createLabContinuationService({
      ownerId: f.owner,
      execute: f.rpc,
      library,
      lab,
      language,
      models: [
        {
          modelId: model.modelId,
          label: "GPT-6 Astra",
          reasoning: ["high", "max"],
          available: true,
        },
      ],
      compose: async (metadata) => {
        composeCalls++;
        const actorIndex = metadata.choices.actors.findIndex(
          (a) => a.control === "autonomous",
        );
        assert.ok(actorIndex >= 0);
        publicOnly(metadata.choices);
        return {
          output: {
            schemaVersion: 1,
            title: "Child watch",
            changeDescription:
              "The next harbor watch starts under an owner-proposed circumstance.",
            divergenceType: "circumstance",
            timingText: ambiguous
              ? "After the first watch"
              : "At this recorded checkpoint",
            offsetMinutes: ambiguous ? null : 0,
            horizonMinutes: ambiguous ? null : 120,
            locationIndex: metadata.choices.locations.length ? 0 : null,
            affectedActorIndexes: [actorIndex],
            affectedThreadIndexes: metadata.choices.threads.length ? [0] : [],
            assumptions: ["A different watch is a NON-CANON owner assumption."],
            constraints: ["No player action or new source fact is selected."],
            unchangedBaseline: [
              "Recorded state, resources and knowledge remain exact.",
            ],
            policy: metadata.choices.policy,
            ambiguities: ambiguous
              ? [
                  {
                    question: "When does the first watch end?",
                    consequential: true,
                  },
                ]
              : [],
            statements: [],
          },
          usage: {
            model: model.modelId,
            inputTokens: 100,
            outputTokens: 50,
            calls: 1,
            latencyMs: 1,
          },
        };
      },
    });
    const interpret = () => ({
      action: "interpret",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source,
        premise: "What if the next harbor watch changed at this exact moment?",
        model,
      },
    });
    const approve = (versionId) => ({
      action: "approve",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source,
        versionId,
      },
    });
    return {
      ...f,
      lab,
      libraryStore: library,
      seededSource,
      service,
      parent,
      source,
      interpret,
      approve,
      calls: () => composeCalls,
    };
  } catch (cause) {
    await f.db.close();
    throw cause;
  }
}

for (const language of ["en", "ru"]) {
  test(`continuation ${language}: exact checkpoint author/review/approve/advance/replay keeps parent and playable state`, async (t) => {
    t.mock.method(globalThis, "fetch", () => {
      throw Error("NO_NETWORK_AUTHORIZED");
    });
    const f = await fixture(language);
    try {
      const live = await f.active(),
        parentState = await f.store.readDetached(
          f.cid,
          f.parent.id,
          f.source.sourceCheckpointId,
        );
      const inspection = await f.service.inspect(
        f.cid,
        f.source.sourceRunId,
        f.source.sourceCheckpointId,
      );
      assert.equal(inspection.eligible, true);
      assert.equal(inspection.checkpoint.worldMinutes, 60);
      assert.equal(f.calls(), 0);
      publicOnly(inspection);
      const request = f.interpret();
      const interpreted = await f.service.perform(request);
      assert.equal(interpreted.run, null);
      assert.equal(interpreted.draft.proposal.phase, "review");
      assert.equal(interpreted.draft.base.worldMinutes, 60);
      assert.equal(interpreted.draft.base.timelineId, f.parent.timelineId);
      assert.equal(f.calls(), 1);
      assert.deepEqual(await f.service.perform(request), interpreted);
      assert.equal(f.calls(), 1);
      const review = {
        ...interpreted.draft.proposal.review,
        constraints: [
          ...interpreted.draft.proposal.review.constraints,
          "Owner correction: keep established ownership.",
        ],
      };
      const edited = await f.service.perform({
        action: "edit",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          source: f.source,
          versionId: interpreted.draft.versionId,
          review,
          model,
        },
      });
      assert.equal(edited.draft.proposal.ownerEdited, true);
      assert.equal(edited.draft.proposal.phase, "review");
      const approval = f.approve(edited.draft.versionId);
      const approved = await f.service.perform(approval),
        child = approved.run;
      assert.equal(child.status, "prepared");
      assert.equal(child.startWorldMinutes, 60);
      assert.equal(child.currentWorldMinutes, 60);
      assert.equal(child.checkpoints.length, 1);
      assert.notEqual(child.timelineId, f.parent.timelineId);
      assert.equal(child.base.timelineId, f.parent.timelineId);
      assert.equal(child.execution.modelId, model.modelId);
      assert.equal(child.execution.reasoning, "high");
      assert.equal(child.execution.recordedResponses, 0);
      const childState = await f.store.readDetached(f.cid, child.id);
      assert.deepEqual(childState.records, parentState.records);
      assert.deepEqual(childState.manifest.refs, parentState.manifest.refs);
      assert.deepEqual(childState.run.input.continuation, {
        sourceRunId: f.parent.id,
        sourceCheckpointId: f.source.sourceCheckpointId,
        sourceRunRevision: f.parent.revision,
        sourceInputDigest: parentState.run.inputDigest,
      });
      const timeline = await f.one(
        "select parent_timeline_id,purpose,fork_save_id from rpg_private.timelines where campaign_id=$1 and id=$2",
        [f.cid, child.timelineId],
      );
      assert.equal(timeline.parent_timeline_id, f.parent.timelineId);
      assert.equal(timeline.purpose, "simulation");
      assert.equal(timeline.fork_save_id, null);
      assert.deepEqual(child.continuation, {
        sourceRunId: f.parent.id,
        sourceCheckpointId: f.source.sourceCheckpointId,
      });
      assert.deepEqual(await f.active(), live);
      publicOnly(approved);
      const childAdvanced = await f.lab.perform({
        action: "continue",
        input: command(child),
      });
      assert.equal(
        childAdvanced.currentWorldMinutes,
        120,
        childAdvanced.reason ?? childAdvanced.status,
      );
      assert.notEqual(
        childAdvanced.checkpoints.at(-1).id,
        child.checkpoints[0].id,
      );
      assert.equal(f.calls(), 1);
      const parentAdvanced = await f.lab.perform({
        action: "continue",
        input: command(f.parent),
      });
      assert.equal(parentAdvanced.currentWorldMinutes, 120);
      assert.deepEqual(await f.service.perform(approval), approved);
      assert.equal(f.calls(), 1);
      assert.deepEqual(
        (
          await f.store.readDetached(
            f.cid,
            f.parent.id,
            f.source.sourceCheckpointId,
          )
        ).records,
        parentState.records,
      );
      assert.deepEqual(await f.active(), live);
      const historical = await f.service.inspect(
        f.cid,
        f.parent.id,
        f.source.sourceCheckpointId,
      );
      assert.equal(historical.checkpoint.worldMinutes, 60);
      assert.equal(historical.source.revision, parentAdvanced.revision);
      await assert.rejects(
        f.service.perform(f.interpret()),
        (e) => e.code === "conflict",
      );
      assert.equal(f.calls(), 1);
      const reselected = {
        ...f.source,
        expectedRevision: historical.source.revision,
      };
      const newInterpretation = f.interpret();
      newInterpretation.input.source = reselected;
      const historicalDraft = await f.service.perform(newInterpretation);
      const historicalApproval = f.approve(historicalDraft.draft.versionId);
      historicalApproval.input.source = reselected;
      const historicalChild = await f.service.perform(historicalApproval);
      assert.equal(historicalChild.run.startWorldMinutes, 60);
      assert.notEqual(historicalChild.run.id, child.id);
      const inherited = await f.store.readDetached(
        f.cid,
        historicalChild.run.id,
      );
      assert.deepEqual(inherited.records, parentState.records);
      assert.equal(
        inherited.run.input.continuation.sourceRunRevision,
        parentAdvanced.revision,
      );
      assert.notEqual(
        inherited.manifest.id,
        parentAdvanced.checkpoints.at(-1).id,
      );
      assert.deepEqual(await f.active(), live);
      assert.equal(f.calls(), 2);
    } finally {
      await f.db.close();
    }
  });
}

test("continuation refuses mismatched source/version, arbitrary checkpoint and changed/cancelled source revision", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK_AUTHORIZED");
  });
  const f = await fixture();
  try {
    const live = await f.active();
    const interpreted = await f.service.perform(f.interpret());
    await assert.rejects(
      f.service.perform({
        ...f.approve(interpreted.draft.versionId),
        input: {
          ...f.approve(interpreted.draft.versionId).input,
          source: {
            ...f.source,
            sourceCheckpointId: f.parent.checkpoints[0].id,
          },
        },
      }),
      (e) => e.code === "conflict",
    );
    await assert.rejects(f.service.inspect(f.cid, f.parent.id, randomUUID()));
    await f.lab.perform({ action: "cancel", input: command(f.parent) });
    await assert.rejects(
      f.service.perform(f.approve(interpreted.draft.versionId)),
      (e) => e.code === "conflict",
    );
    const count = await f.one(
      "select count(*)::integer n from rpg_private.world_lab_runs where campaign_id=$1",
      [f.cid],
    );
    assert.equal(count.n, 1);
    assert.deepEqual(await f.active(), live);
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});

test("continuation nullable timing and original ambiguity survive answers until confirmed owner values", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK_AUTHORIZED");
  });
  const f = await fixture("en", { ambiguous: true });
  try {
    const interpreted = await f.service.perform(f.interpret());
    assert.equal(interpreted.draft.proposal.review.offsetMinutes, null);
    assert.equal(interpreted.draft.proposal.review.horizonMinutes, null);
    await assert.rejects(
      f.service.perform(f.approve(interpreted.draft.versionId)),
    );
    const review = {
      ...interpreted.draft.proposal.review,
      ambiguityAnswers: ["At this checkpoint"],
    };
    const edited = await f.service.perform({
      action: "edit",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source: f.source,
        versionId: interpreted.draft.versionId,
        review,
        model,
      },
    });
    assert.equal(edited.draft.proposal.review.offsetMinutes, null);
    assert.equal(edited.draft.proposal.review.horizonMinutes, null);
    assert.equal(edited.draft.proposal.ambiguities.length, 1);
    assert.ok(edited.draft.proposal.blockers.includes("timing_unresolved"));
    const { confirmCompositionTiming } =
      await import("../src/lib/world-lab/composition-validation.ts");
    const values = {
      ...edited.draft.proposal.review,
      offsetMinutes: 0,
      horizonMinutes: 120,
    };
    const confirmed = {
      ...values,
      timingReview: confirmCompositionTiming(values),
    };
    const ready = await f.service.perform({
      action: "edit",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source: f.source,
        versionId: edited.draft.versionId,
        review: confirmed,
        model,
      },
    });
    const approved = await f.service.perform(f.approve(ready.draft.versionId));
    assert.equal(approved.run.status, "prepared");
    assert.equal(approved.draft.proposal.ambiguities.length, 1);
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});
test("current correction generation blocks child creation and neutralizes checkpoint inspection", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK_AUTHORIZED");
  });
  const f = await fixture();
  try {
    const interpreted = await f.service.perform(f.interpret());
    const history = await f.one(
      "select count(*)::integer n from rpg_private.library_records where owner_id=$1",
      [f.owner],
    );
    const live = await f.active();
    await f.one(
      "update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=$1 returning campaign_id",
      [f.cid],
    );
    await assert.rejects(
      f.service.perform(f.approve(interpreted.draft.versionId)),
      (e) => e.code === "conflict",
    );
    await assert.rejects(
      f.service.catalog(f.cid, f.source),
      (e) => e.code === "conflict",
    );
    const inspected = await f.service.inspect(
      f.cid,
      f.parent.id,
      f.source.sourceCheckpointId,
    );
    assert.equal(inspected.eligible, false);
    assert.deepEqual(inspected.checkpoint.events, []);
    publicOnly(inspected);
    assert.deepEqual((await f.active()).projection, live.projection);
    assert.deepEqual(
      await f.one(
        "select count(*)::integer n from rpg_private.library_records where owner_id=$1",
        [f.owner],
      ),
      history,
    );
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});

test("versioned Source correction and private evidence restriction cannot reproject completed reviews", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK_AUTHORIZED");
  });
  const f = await fixture("en", { withSource: true });
  try {
    const request = f.interpret();
    const interpreted = await f.service.perform(request);
    assert.ok(
      (await f.libraryStore.get("scenario", interpreted.draft.versionId)).body
        .composition.choices.evidence.length > 0,
    );
    const approval = f.approve(interpreted.draft.versionId);
    const approved = await f.service.perform(approval);
    const childBefore = await f.store.readDetached(f.cid, approved.run.id);
    const history = await f.one(
      "select count(*)::integer n from rpg_private.library_records where owner_id=$1",
      [f.owner],
    );
    const live = await f.active();
    await f.one(
      "insert into rpg_private.timeline_global_restrictions(campaign_id,kind,source_id) values($1,'source',$2) returning source_id",
      [f.cid, f.seededSource.id],
    );
    await assert.rejects(
      f.service.perform(request),
      (e) => e.code === "conflict",
    );
    const edit = {
      action: "edit",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source: f.source,
        versionId: interpreted.draft.versionId,
        review: interpreted.draft.proposal.review,
        model,
      },
    };
    await assert.rejects(f.service.perform(edit), (e) => e.code === "conflict");
    assert.deepEqual(
      await f.one(
        "select count(*)::integer n from rpg_private.library_records where owner_id=$1",
        [f.owner],
      ),
      history,
    );
    await f.one(
      "delete from rpg_private.timeline_global_restrictions where campaign_id=$1 and kind='source' and source_id=$2",
      [f.cid, f.seededSource.id],
    );
    assert.deepEqual(await f.service.perform(request), interpreted);
    assert.deepEqual(await f.active(), live);
    const original = f.seededSource,
      correctedText = "A corrected source is now private.";
    await f.libraryStore.put({
      operationId: randomUUID(),
      record: {
        ...structuredClone(original),
        version: 2,
        versionId: randomUUID(),
        previousVersionId: original.versionId,
        body: {
          ...original.body,
          visibility: "private",
          original: { kind: "text", text: correctedText },
          digest: sha256(correctedText),
        },
      },
    });
    const correctedLive = await f.active();
    const stable = await f.one(
      "select count(*)::integer n from rpg_private.library_records where owner_id=$1",
      [f.owner],
    );
    const receipts = await f.query(
      "select * from rpg_private.world_lab_commands where run_id=$1 order by operation_id,stage",
      [approved.run.id],
    );
    for (const attempt of [request, edit, approval])
      await assert.rejects(
        f.service.perform(attempt),
        (e) => e.code === "conflict",
      );
    const after = await f.store.readDetached(f.cid, approved.run.id);
    assert.deepEqual(after.run.input, childBefore.run.input);
    assert.deepEqual(after.records, childBefore.records);
    assert.deepEqual(after.manifest.refs, childBefore.manifest.refs);
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.world_lab_commands where run_id=$1 order by operation_id,stage",
        [approved.run.id],
      ),
      receipts,
    );
    assert.deepEqual(
      await f.one(
        "select count(*)::integer n from rpg_private.library_records where owner_id=$1",
        [f.owner],
      ),
      stable,
    );
    const inspection = await f.service.inspect(
      f.cid,
      f.parent.id,
      f.source.sourceCheckpointId,
    );
    assert.equal(inspection.eligible, false);
    assert.deepEqual(inspection.checkpoint.events, []);
    publicOnly(inspection);
    assert.deepEqual(await f.active(), correctedLive);
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});

test("cancelled parent preserves exact completed replay and child history while stale new approvals fail", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK_AUTHORIZED");
  });
  const f = await fixture();
  try {
    const interpreted = await f.service.perform(f.interpret());
    const approval = f.approve(interpreted.draft.versionId);
    const approved = await f.service.perform(approval);
    const childState = await f.store.readDetached(f.cid, approved.run.id);
    const receipts = await f.query(
      "select * from rpg_private.world_lab_commands where run_id=$1 order by operation_id,stage",
      [approved.run.id],
    );
    const live = await f.active();
    await f.lab.perform({ action: "cancel", input: command(f.parent) });
    assert.deepEqual(await f.service.perform(approval), approved);
    assert.deepEqual(await f.lab.readRun(f.cid, approved.run.id), approved.run);
    const after = await f.store.readDetached(f.cid, approved.run.id);
    assert.deepEqual(after.records, childState.records);
    assert.deepEqual(after.run.input, childState.run.input);
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.world_lab_commands where run_id=$1 order by operation_id,stage",
        [approved.run.id],
      ),
      receipts,
    );
    assert.deepEqual(await f.active(), live);
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});

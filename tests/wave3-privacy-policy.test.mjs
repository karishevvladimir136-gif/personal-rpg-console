import test from "node:test";
import assert from "node:assert/strict";
import {
  fixture,
  id,
  step,
  thread,
} from "./wave1-world-fixtures.mjs";
import {
  prepareWorldPolicyReconciliation,
  projectWorldPolicyReconciliation,
} from "../src/lib/world/reconciliation.ts";
import { stageWorldTransition } from "../src/lib/world/stage.ts";

const policies = [false, true].flatMap((simulation) =>
  ["low", "moderate", "high"].flatMap((autonomy) =>
    ["off", "critical_only", "normal"].map((deadlinePressure) => ({
      simulation,
      autonomy,
      deadlinePressure,
    })),
  ),
);
const choice = { schemaVersion: 1, kind: "restart_overdue", graceMinutes: 60 };

test("QA: all 324 policy changes project identically with no hidden work or multiple hidden schedules", () => {
  let cases = 0;
  for (const previousPolicy of policies) {
    for (const nextPolicy of policies) {
      const input = fixture();
      input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 100;
      input.snapshot.world.policy = previousPolicy;
      input.snapshot.world.threads = [
        thread("qa-overdue", {
          title: "QA_HIDDEN_TITLE",
          publicTitle: "A known thread with undiscovered timing",
          steps: [
            step("qa-overdue-step", {
              privateText: "QA_HIDDEN_CAUSE",
              publicOutcome: {
                text: "QA_UNREVEALED_FUTURE_OUTCOME",
                actorIds: [],
                evidence: [],
              },
            }),
          ],
        }),
        thread("qa-future", {
          steps: [
            step("qa-future-step", {
              trigger: {
                kind: "deadline",
                atWorldMinutes: 500,
                scenarioCritical: true,
                established: true,
              },
            }),
          ],
        }),
        thread("qa-autonomy", {
          steps: [
            step("qa-autonomy-step", {
              trigger: { kind: "autonomy", atWorldMinutes: 20, scope: "broad" },
            }),
          ],
        }),
      ];
      const original = structuredClone(input);
      const empty = structuredClone(input.snapshot);
      empty.world.threads = [];
      const review = projectWorldPolicyReconciliation(input.snapshot, nextPolicy);
      assert.deepEqual(review, projectWorldPolicyReconciliation(empty, nextPolicy));
      assert.deepEqual(review.knownSchedules, []);
      assert.doesNotMatch(
        JSON.stringify(review),
        /QA_HIDDEN|QA_UNREVEALED|privateCount|hasPrivate|affectedCount|threadId|stepId/,
      );
      const plan = prepareWorldPolicyReconciliation(
        input.snapshot,
        input.command,
        nextPolicy,
        review.requiresReview ? choice : null,
      );
      assert.equal(plan.fromWorldMinutes, 100);
      assert.deepEqual(plan.world.actors, original.snapshot.world.actors);
      assert.deepEqual(plan.world.hooks, original.snapshot.world.hooks);
      assert.deepEqual(plan.world.warnings, original.snapshot.world.warnings);
      assert.equal(plan.world.threads[1].steps[0].trigger.atWorldMinutes, 500);
      assert.ok(plan.reconciliations.every((change) => change.atWorldMinutes >= 160));
      for (const [index, after] of plan.world.threads.entries()) {
        const before = original.snapshot.world.threads[index];
        assert.equal(after.cursor, before.cursor);
        assert.equal(after.status, before.status);
        assert.equal(after.revision, before.revision);
        assert.equal(after.steps[0].privateText, before.steps[0].privateText);
        assert.deepEqual(after.steps[0].publicOutcome, before.steps[0].publicOutcome);
      }
      assert.deepEqual(input, original);
      cases += 1;
    }
  }
  assert.equal(cases, 324);
});

test("QA: restarting overdue work has no immediate catch-up or wall-clock dependency", (context) => {
  context.mock.method(Date, "now", () => {
    assert.fail("Fictional schedule restart must not inspect wall-clock time");
  });
  for (const autonomy of ["low", "moderate", "high"]) {
    const input = fixture();
    input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 100;
    input.snapshot.world.policy.simulation = false;
    input.snapshot.world.policy.autonomy = autonomy;
    const nextPolicy = { ...input.snapshot.world.policy, simulation: true };
    const plan = prepareWorldPolicyReconciliation(
      input.snapshot,
      input.command,
      nextPolicy,
      choice,
    );
    input.snapshot.world = plan.world;
    input.resolution.worldMinutes = 101;
    const staged = stageWorldTransition(input);
    assert.equal(staged.status, "noop");
    assert.equal(input.snapshot.world.threads[0].cursor, 0);
    assert.equal(input.snapshot.world.threads[0].steps[0].trigger.atWorldMinutes, 160);
  }
});

test("QA: high autonomy cannot complete or expire a deadline while pressure is Off", () => {
  const input = fixture();
  input.snapshot.world.policy = {
    simulation: true,
    autonomy: "high",
    deadlinePressure: "off",
  };
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 100;
  input.resolution.worldMinutes = 500;
  input.snapshot.world.threads = [
    thread("qa-terminal-autonomy", {
      steps: [
        step("qa-terminal-step", {
          trigger: { kind: "autonomy", atWorldMinutes: 1, scope: "broad" },
          hookChanges: [{ hookId: id("qa-latent-hook"), status: "expired" }],
        }),
      ],
    }),
    thread("qa-critical-deadline", {
      steps: [
        step("qa-critical-step", {
          trigger: {
            kind: "deadline",
            atWorldMinutes: 1,
            scenarioCritical: true,
            established: true,
          },
        }),
      ],
    }),
  ];
  input.snapshot.world.hooks = [
    {
      id: id("qa-latent-hook"),
      campaignId: input.snapshot.campaignId,
      locationId: id("location"),
      threadId: id("qa-terminal-autonomy"),
      privatePremise: "QA_PRIVATE_LATENT_OPPORTUNITY",
      status: "latent",
      discovery: null,
    },
  ];
  assert.equal(stageWorldTransition(input).status, "noop");
  assert.equal(input.snapshot.world.hooks[0].status, "latent");
  assert.ok(input.snapshot.world.threads.every((row) => row.cursor === 0));
});

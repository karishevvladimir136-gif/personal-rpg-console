import test from "node:test";
import assert from "node:assert/strict";
import {
  bind,
  evidence,
  fixture,
  id,
  step,
  thread,
} from "./wave1-world-fixtures.mjs";
import {
  WORLD_RECONCILIATION_GRACE,
  parseWorldReconciliationChoice,
  prepareWorldPolicyReconciliation,
  projectWorldPolicyReconciliation,
  validateWorldPolicyReconciliation,
  worldPolicyNeedsReconciliationReview,
} from "../src/lib/world/reconciliation.ts";
import { reconcileWorldPolicy } from "../src/lib/world/policy.ts";
import { stageWorldTransition } from "../src/lib/world/stage.ts";
import { WorldValidationError } from "../src/lib/world/validation.ts";

const choice = (graceMinutes = 60) => ({
  schemaVersion: 1,
  kind: "restart_overdue",
  graceMinutes,
});
const policy = (fields = {}) => ({
  simulation: true,
  autonomy: "moderate",
  deadlinePressure: "normal",
  ...fields,
});
const deadline = (name, atWorldMinutes = 10, fields = {}) =>
  step(name, {
    trigger: {
      kind: "deadline",
      atWorldMinutes,
      scenarioCritical: false,
      established: true,
      ...fields,
    },
  });
const autonomy = (name, scope = "local", fields = {}) =>
  step(name, {
    trigger: { kind: "autonomy", atWorldMinutes: 10, scope },
    ...fields,
  });
function scenario(previous = policy({ simulation: false })) {
  const input = fixture();
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 100;
  input.snapshot.world.policy = previous;
  return input;
}
function plan(input, next = policy(), decision = choice()) {
  return prepareWorldPolicyReconciliation(
    input.snapshot,
    input.command,
    next,
    decision,
  );
}
const scheduledIds = (result) =>
  result.reconciliations.map((row) => row.stepId);

test("re-enabling simulation reschedules only unconsumed newly enabled overdue work from fictional now", () => {
  const input = scenario();
  input.snapshot.world.threads = [
    thread("live", {
      steps: [
        deadline("overdue"),
        deadline("due-now", 100),
        deadline("future", 101),
        step("causal", {
          trigger: { kind: "causal", family: "items", recordId: id("knife") },
        }),
      ],
    }),
    thread("paused", { status: "paused", steps: [deadline("paused-step")] }),
    thread("resolved", {
      status: "resolved",
      cursor: 1,
      steps: [deadline("resolved-step")],
    }),
    thread("consumed", {
      cursor: 1,
      steps: [deadline("consumed-step"), deadline("pending-step")],
    }),
  ];
  const original = structuredClone(input);
  const result = plan(input);
  assert.deepEqual(scheduledIds(result), [
    id("overdue"),
    id("due-now"),
    id("pending-step"),
  ]);
  assert.ok(result.reconciliations.every((row) => row.atWorldMinutes > 100));
  assert.equal(result.fromWorldMinutes, 100);
  assert.equal(result.world.policyChangedAtWorldMinutes, 100);
  assert.equal(result.world.threads[0].steps[2].trigger.atWorldMinutes, 101);
  assert.equal(result.world.threads[1].steps[0].trigger.atWorldMinutes, 10);
  assert.equal(result.world.threads[2].steps[0].trigger.atWorldMinutes, 10);
  assert.equal(result.world.threads[3].steps[0].trigger.atWorldMinutes, 10);
  assert.deepEqual(
    result.world.threads.map(({ id, revision, status, cursor }) => ({
      id,
      revision,
      status,
      cursor,
    })),
    original.snapshot.world.threads.map(({ id, revision, status, cursor }) => ({
      id,
      revision,
      status,
      cursor,
    })),
  );
  assert.deepEqual(input, original);
});

test("Off to Critical Only enables only established critical deadlines; Normal keeps already active critical schedules", () => {
  for (const selectedAutonomy of ["low", "moderate", "high"]) {
    const input = scenario(
      policy({ autonomy: selectedAutonomy, deadlinePressure: "off" }),
    );
    input.snapshot.world.threads = [
      thread("mixed", {
        steps: [
          deadline("critical", 10, { scenarioCritical: true }),
          deadline("ordinary", 20),
          deadline("unestablished", 30, { established: false }),
        ],
      }),
    ];
    const critical = plan(
      input,
      policy({ autonomy: selectedAutonomy, deadlinePressure: "critical_only" }),
    );
    assert.deepEqual(scheduledIds(critical), [id("critical")]);
    assert.equal(
      critical.world.threads[0].steps[0].trigger.atWorldMinutes,
      160,
    );
    input.snapshot.world = critical.world;
    input.snapshot.worldMinutes = 200;
    const normal = plan(input, policy({ autonomy: selectedAutonomy }));
    assert.deepEqual(scheduledIds(normal), [
      id("ordinary"),
      id("unestablished"),
    ]);
    assert.equal(normal.world.threads[0].steps[0].trigger.atWorldMinutes, 160);
  }
});

test("pressure expansion keeps already active background autonomy and restarts newly allowed completion", () => {
  for (const pressure of ["off", "critical_only"]) {
    const input = scenario(policy({ deadlinePressure: pressure }));
    input.snapshot.world.threads = [
      thread("autonomous", {
        steps: [
          autonomy("active-background"),
          autonomy("surface-completion", "related", {
            consequence: "surface_before_complete",
          }),
          autonomy("terminal"),
        ],
      }),
    ];
    const result = plan(input);
    assert.deepEqual(scheduledIds(result), [
      id("surface-completion"),
      id("terminal"),
    ]);
    assert.equal(result.world.threads[0].steps[0].trigger.atWorldMinutes, 10);
  }
});

test("simulation re-enable respects autonomous scope and independent deadline suppression", () => {
  const input = scenario(
    policy({ simulation: false, autonomy: "low", deadlinePressure: "off" }),
  );
  input.snapshot.world.threads = [
    thread("scope", {
      steps: [
        autonomy("local-background"),
        autonomy("broad-background", "broad"),
        autonomy("related-background", "related"),
        autonomy("terminal"),
      ],
    }),
  ];
  const result = plan(
    input,
    policy({ autonomy: "low", deadlinePressure: "off" }),
  );
  assert.deepEqual(scheduledIds(result), [id("local-background")]);
  assert.equal(result.world.policy.deadlinePressure, "off");
  for (const index of [1, 2, 3])
    assert.equal(
      result.world.threads[0].steps[index].trigger.atWorldMinutes,
      10,
    );
});

test("autonomous hook expiry is suppressed independently of nonterminal background progress", () => {
  const input = scenario(policy({ deadlinePressure: "off" }));
  const hookId = id("hook");
  input.snapshot.world.threads = [
    thread("hook-thread", {
      steps: [
        autonomy("hook-expiry", "local", {
          hookChanges: [{ hookId, status: "expired" }],
        }),
        autonomy("background"),
        deadline("terminal-future", 500),
      ],
    }),
  ];
  input.snapshot.world.hooks = [
    {
      id: hookId,
      campaignId: input.snapshot.campaignId,
      locationId: id("location"),
      threadId: id("hook-thread"),
      privatePremise: "PRIVATE_HOOK",
      status: "latent",
      discovery: null,
    },
  ];
  const result = plan(input);
  assert.deepEqual(scheduledIds(result), [id("hook-expiry")]);
  assert.deepEqual(result.world.hooks, input.snapshot.world.hooks);
});

test("policy-only review neither re-enables pressure through autonomy nor examines hidden work", () => {
  const previous = policy({ deadlinePressure: "off", autonomy: "low" });
  for (const next of [
    policy({ deadlinePressure: "off", autonomy: "high" }),
    policy({ simulation: false }),
    policy({ deadlinePressure: "off" }),
  ]) {
    const input = scenario(previous);
    assert.equal(worldPolicyNeedsReconciliationReview(previous, next), false);
    const result = plan(input, next, null);
    assert.deepEqual(result.reconciliations, []);
    assert.deepEqual(result.world.threads, input.snapshot.world.threads);
    assert.throws(() => plan(input, next), WorldValidationError);
  }
  assert.equal(
    worldPolicyNeedsReconciliationReview(
      policy({ simulation: false, deadlinePressure: "off" }),
      policy({ simulation: false }),
    ),
    false,
  );
});

test("the same explicit restart choice is required for expansion with private, absent, future or no enabled work", () => {
  const variants = [
    (world) => world,
    (world) => {
      world.threads = [];
    },
    (world) => {
      world.threads[0].steps[0].trigger.atWorldMinutes = 500;
    },
    (world) => {
      world.threads[0].steps[0].trigger.established = false;
    },
  ];
  for (const mutate of variants) {
    const input = scenario(policy({ deadlinePressure: "off" }));
    mutate(input.snapshot.world);
    const next = policy({ deadlinePressure: "critical_only" });
    assert.throws(() => plan(input, next, null), WorldValidationError);
    assert.doesNotThrow(() => plan(input, next));
    assert.equal(
      projectWorldPolicyReconciliation(input.snapshot, next).requiresReview,
      true,
    );
  }
  const input = scenario();
  input.snapshot.world = null;
  assert.throws(() => plan(input, policy(), null), WorldValidationError);
  const result = plan(input);
  assert.deepEqual(result.reconciliations, []);
  assert.deepEqual(result.world.threads, []);
  assert.equal(result.world.campaignId, input.snapshot.campaignId);
});

test("strict owner intent rejects arbitrary patches, private identifiers, non-integers and unknown choices", () => {
  for (const value of [
    null,
    [],
    {},
    "restart_overdue",
    choice(0),
    choice(-1),
    choice(1.5),
    choice(NaN),
    choice(Infinity),
    choice(10_081),
    { ...choice(), graceMinutes: "60" },
    { ...choice(), schemaVersion: 2 },
    { ...choice(), kind: "catch_up" },
    { ...choice(), stepId: id("step") },
    { ...choice(), privateCount: 2 },
    { ...choice(), atWorldMinutes: 300 },
    { ...choice(), world: {} },
  ])
    assert.throws(
      () => parseWorldReconciliationChoice(value),
      WorldValidationError,
    );
  for (const minutes of [
    1,
    WORLD_RECONCILIATION_GRACE.default,
    WORLD_RECONCILIATION_GRACE.maximum,
  ]) {
    const value = choice(minutes);
    assert.deepEqual(parseWorldReconciliationChoice(value), value);
    assert.notEqual(parseWorldReconciliationChoice(value), value);
  }
});

test("configuration never settles warnings, outcomes or hook changes and preserves source provenance", () => {
  const input = scenario();
  bind(input);
  const warningStep = deadline("public-warning");
  warningStep.publicOutcome = {
    text: "An established public warning.",
    actorIds: [id("player")],
    evidence: [],
  };
  warningStep.warning = {
    forStepId: id("consequence"),
    opportunityMinutes: 50,
    recipientActorIds: [id("player")],
  };
  const consequence = deadline("consequence", 20);
  consequence.consequence = "surface_before_complete";
  consequence.evidence = [evidence()];
  input.snapshot.world.actors.find(
    (actor) => actor.id === id("enemy"),
  ).knowledge = [evidence()];
  input.snapshot.world.threads = [
    thread("warned", {
      cursor: 1,
      actorIds: [id("player"), id("enemy")],
      steps: [warningStep, consequence],
    }),
  ];
  input.snapshot.world.warnings = [
    {
      stepId: consequence.id,
      eventId: id("warning-event"),
      atWorldMinutes: 90,
      opportunityUntilWorldMinutes: 140,
      recipientActorIds: [id("player")],
    },
  ];
  const original = structuredClone(input);
  const result = plan(input, policy(), choice(10));
  assert.deepEqual(result.world.warnings, original.snapshot.world.warnings);
  assert.deepEqual(result.world.threads[0].steps[0], warningStep);
  assert.deepEqual(
    result.world.threads[0].steps[1].evidence,
    consequence.evidence,
  );
  assert.deepEqual(result.world.actors, original.snapshot.world.actors);
  assert.deepEqual(input, original);
  assert.equal(result.world.threads[0].steps[1].trigger.atWorldMinutes, 141);
  input.snapshot.world = result.world;
  input.resolution.worldMinutes = 150;
  assert.equal(stageWorldTransition(input).reason, "warning_required");
});

test("restarted warning and completion have a coherent interval for a real warning opportunity", () => {
  const input = scenario();
  const warningStep = deadline("new-warning");
  warningStep.publicOutcome = {
    text: "Known danger approaches.",
    actorIds: [id("player")],
    evidence: [],
  };
  warningStep.warning = {
    forStepId: id("new-consequence"),
    opportunityMinutes: 90,
    recipientActorIds: [id("player")],
  };
  const consequence = deadline("new-consequence", 20);
  consequence.consequence = "surface_before_complete";
  input.snapshot.world.threads = [
    thread("new-warning-thread", {
      actorIds: [id("player"), id("enemy")],
      steps: [warningStep, consequence],
    }),
  ];
  const result = plan(input);
  assert.deepEqual(result.reconciliations, [
    { stepId: warningStep.id, atWorldMinutes: 160 },
    { stepId: consequence.id, atWorldMinutes: 251 },
  ]);
  assert.deepEqual(result.world.warnings, []);
  input.snapshot.world = result.world;
  input.resolution.worldMinutes = 160;
  const warned = stageWorldTransition(input);
  assert.equal(warned.status, "staged");
  assert.equal(warned.settlement.nextWorld.threads[0].cursor, 1);
  assert.equal(
    warned.settlement.nextWorld.warnings[0].opportunityUntilWorldMinutes,
    250,
  );
  input.snapshot.world = warned.settlement.nextWorld;
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 160;
  input.resolution.worldMinutes = 250;
  assert.equal(stageWorldTransition(input).status, "noop");
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 250;
  input.resolution.worldMinutes = 251;
  assert.equal(stageWorldTransition(input).status, "staged");
});

test("pending warnings keep their times while imposing a floor on newly restarted completion", () => {
  for (const [warningAt, expectedAt] of [
    [10, 191],
    [500, 591],
  ]) {
    const input = scenario(policy({ deadlinePressure: "critical_only" }));
    const warningStep = deadline("unchanged-warning", warningAt, {
      scenarioCritical: true,
    });
    warningStep.publicOutcome = {
      text: "Known danger approaches.",
      actorIds: [id("player")],
      evidence: [],
    };
    warningStep.warning = {
      forStepId: id("restarted-completion"),
      opportunityMinutes: 90,
      recipientActorIds: [id("player")],
    };
    const completion = deadline("restarted-completion", 20);
    completion.consequence = "surface_before_complete";
    input.snapshot.world.threads = [
      thread("pending-warning", {
        actorIds: [id("player"), id("enemy")],
        steps: [warningStep, completion],
      }),
    ];
    const result = plan(input, policy(), choice(10));
    assert.deepEqual(result.reconciliations, [
      { stepId: completion.id, atWorldMinutes: expectedAt },
    ]);
    assert.deepEqual(result.world.threads[0].steps[0], warningStep);
    assert.deepEqual(result.world.warnings, []);
    input.snapshot.world = result.world;
    input.resolution.worldMinutes = Math.max(101, warningAt);
    const warned = stageWorldTransition(input);
    assert.equal(warned.status, "staged");
    assert.equal(
      warned.settlement.nextWorld.warnings[0].opportunityUntilWorldMinutes,
      expectedAt - 1,
    );
  }
});

test("future and previously active completion times survive a restarted warning even when gameplay must pause", () => {
  for (const [pressure, completionAt, critical] of [
    ["critical_only", 75, true],
    ["critical_only", 175, true],
    ["off", 175, false],
  ]) {
    const input = scenario(policy({ deadlinePressure: pressure }));
    const warningStep = deadline("restarted-warning");
    warningStep.publicOutcome = {
      text: "Known danger approaches.",
      actorIds: [id("player")],
      evidence: [],
    };
    warningStep.warning = {
      forStepId: id("preserved-completion"),
      opportunityMinutes: 90,
      recipientActorIds: [id("player")],
    };
    const completion = deadline("preserved-completion", completionAt, {
      scenarioCritical: critical,
    });
    completion.consequence = "surface_before_complete";
    input.snapshot.world.threads = [
      thread("preserved-warning-target", {
        actorIds: [id("player"), id("enemy")],
        steps: [warningStep, completion],
      }),
    ];
    const result = plan(input);
    assert.deepEqual(result.reconciliations, [
      { stepId: warningStep.id, atWorldMinutes: 160 },
    ]);
    assert.deepEqual(result.world.threads[0].steps[1], completion);
    assert.deepEqual(result.world.warnings, []);
    input.snapshot.world = result.world;
    input.resolution.worldMinutes = 300;
    assert.equal(stageWorldTransition(input).reason, "warning_required");
  }
});

test("warning and per-thread interval overflow fail atomically without changing receipts or timings", () => {
  const interval = scenario();
  interval.snapshot.worldMinutes = 999_999_900;
  interval.snapshot.world.threads[0].steps = [
    deadline("last-fitting-step"),
    deadline("overflowing-step"),
  ];
  const warning = scenario();
  const warningStep = deadline("overflow-warning");
  warningStep.publicOutcome = {
    text: "Known danger approaches.",
    actorIds: [id("player")],
    evidence: [],
  };
  warningStep.warning = {
    forStepId: id("overflow-completion"),
    opportunityMinutes: 1_000_000_000,
    recipientActorIds: [id("player")],
  };
  const completion = deadline("overflow-completion", 20);
  completion.consequence = "surface_before_complete";
  warning.snapshot.world.threads = [
    thread("overflow-warning-thread", {
      actorIds: [id("player"), id("enemy")],
      steps: [warningStep, completion],
    }),
  ];
  const receipt = structuredClone(warning);
  receipt.snapshot.world.threads[0].cursor = 1;
  receipt.snapshot.world.warnings = [
    {
      stepId: completion.id,
      eventId: id("overflow-warning-event"),
      atWorldMinutes: 90,
      opportunityUntilWorldMinutes: 1_000_000_000,
      recipientActorIds: [id("player")],
    },
  ];
  for (const input of [interval, warning, receipt]) {
    const original = structuredClone(input);
    assert.throws(() => plan(input), WorldValidationError);
    assert.deepEqual(input, original);
  }
});

test("each thread restarts independently with ordered intervals and no immediate backlog", () => {
  const input = scenario();
  input.snapshot.world.threads = [
    thread("first", {
      steps: [deadline("first-a"), deadline("first-b"), deadline("first-c")],
    }),
    thread("second", { steps: [deadline("second-a"), deadline("second-b")] }),
  ];
  const result = plan(input, policy(), choice(15));
  assert.deepEqual(
    result.reconciliations.map((entry) => entry.atWorldMinutes),
    [115, 130, 145, 115, 130],
  );
  input.snapshot.world = result.world;
  input.trigger = "session_boundary";
  input.resolution.worldMinutes = 100;
  assert.equal(stageWorldTransition(input).status, "noop");
});

test("stale owner, campaign, sibling timeline, epoch, runtime revision, world revision and head fail closed", () => {
  for (const corrupt of [
    (input) => {
      input.command.campaignId = id("other-campaign");
    },
    (input) => {
      input.command.timeline.timelineId = id("sibling-timeline");
    },
    (input) => {
      input.command.timeline.epoch += 1;
    },
    (input) => {
      input.command.expectedRevision += 1;
    },
    (input) => {
      input.command.expectedRuntimeRevision += 1;
    },
    (input) => {
      input.command.expectedHeadId = id("new-head");
    },
    (input) => {
      input.command.expectedHeadId = null;
    },
  ]) {
    const input = scenario();
    corrupt(input);
    assert.throws(
      () => plan(input),
      (error) => error.code === "stale_world",
    );
  }
  for (const corrupt of [
    (input) => {
      input.snapshot.world.campaignId = id("other-campaign");
    },
    (input) => {
      input.snapshot.world.threads[0].campaignId = id("other-campaign");
    },
    (input) => {
      input.snapshot.world.policyChangedAtWorldMinutes = 101;
    },
    (input) => {
      input.command.timeline.lease = "forged";
    },
    (input) => {
      input.command.expectedRevision = "3";
    },
    (input) => {
      input.command.operationId = "invalid";
    },
  ]) {
    const input = scenario();
    corrupt(input);
    assert.throws(() => plan(input), WorldValidationError);
  }
  const input = scenario();
  bind(input);
  input.snapshot.world.threads[0].steps[0].evidence = [
    evidence({ ownerId: id("other-owner") }),
  ];
  assert.throws(() => plan(input), WorldValidationError);
  input.snapshot.world.threads[0].steps[0].evidence = [
    evidence({ sourceVersionId: id("sibling-source") }),
  ];
  assert.throws(() => plan(input), WorldValidationError);
});

test("same pinned request replays exactly; committed fences and altered proposals cannot restart it again", () => {
  const input = scenario();
  const result = plan(input);
  assert.deepEqual(plan(input), result);
  assert.deepEqual(
    validateWorldPolicyReconciliation(
      input.snapshot,
      input.command,
      policy(),
      choice(),
      result,
    ),
    result,
  );
  for (const corrupt of [
    (candidate) => {
      candidate.reconciliations[0].atWorldMinutes += 1;
    },
    (candidate) => {
      candidate.reconciliations[0].stepId = id("sibling-step");
    },
    (candidate) => {
      candidate.world.threads[0].revision += 1;
    },
    (candidate) => {
      candidate.world.threads[0].cursor = 1;
      candidate.world.threads[0].status = "resolved";
    },
    (candidate) => {
      candidate.world.threads[0].steps[0].privateText = "REWRITTEN_PRIVATE";
    },
    (candidate) => {
      candidate.world.policy.deadlinePressure = "off";
    },
    (candidate) => {
      candidate.command.timeline.epoch += 1;
    },
    (candidate) => {
      candidate.command.operationId = id("new-operation");
    },
    (candidate) => {
      candidate.privateCount = 1;
    },
  ]) {
    const candidate = structuredClone(result);
    corrupt(candidate);
    assert.throws(
      () =>
        validateWorldPolicyReconciliation(
          input.snapshot,
          input.command,
          policy(),
          choice(),
          candidate,
        ),
      (error) => error.code === "stale_world",
    );
  }
  input.snapshot.world = result.world;
  input.snapshot.revision += 1;
  assert.throws(
    () => plan(input),
    (error) => error.code === "stale_world",
  );
});

test("public review is identical with or without hidden work and cannot reveal a private future of a known thread", () => {
  const empty = scenario();
  empty.snapshot.world.threads = [];
  const secret = scenario();
  secret.snapshot.world.threads[0].publicTitle = "Known thread";
  secret.snapshot.world.threads[0].steps[0].publicOutcome = {
    text: "UNREVEALED_FUTURE_OUTCOME",
    actorIds: [],
    evidence: [],
  };
  secret.snapshot.world.threads.push(
    thread("sibling-looking-secret", { title: "HIDDEN_EXISTENCE_MARKER" }),
  );
  const projection = projectWorldPolicyReconciliation(
    secret.snapshot,
    policy(),
  );
  assert.deepEqual(
    projection,
    projectWorldPolicyReconciliation(empty.snapshot, policy()),
  );
  assert.deepEqual(projection.knownSchedules, []);
  assert.deepEqual(
    Object.keys(projection).sort(),
    [
      "schemaVersion",
      "campaignId",
      "timeline",
      "revision",
      "runtimeRevision",
      "headId",
      "worldMinutes",
      "previousPolicy",
      "nextPolicy",
      "requiresReview",
      "grace",
      "knownSchedules",
    ].sort(),
  );
  const serialized = JSON.stringify(projection);
  for (const forbidden of [
    "PRIVATE",
    "UNREVEALED",
    "HIDDEN",
    "Known thread",
    id("thread"),
    id("thread-step"),
    id("enemy"),
    "privateCount",
    "hasPrivate",
    "affectedCount",
  ])
    assert.equal(serialized.includes(forbidden), false, forbidden);
});

test("invalid or exhausted fictional time fails without overflowing into past time or using wall clock", (context) => {
  const input = scenario();
  context.mock.method(Date, "now", () => {
    throw new Error("wall clock must not influence reconciliation");
  });
  const first = plan(input);
  assert.deepEqual(plan(input), first);
  for (const worldMinutes of [-1, 1.5, NaN, Infinity, 1_000_000_000]) {
    input.snapshot.worldMinutes = worldMinutes;
    assert.throws(() => plan(input), WorldValidationError);
  }
});

test("existing policy seam still requires exactly the necessary future schedule identities", () => {
  const input = scenario(policy({ deadlinePressure: "off" }));
  input.snapshot.world.threads = [
    thread("mixed", {
      steps: [autonomy("already-active"), deadline("newly-enabled")],
    }),
  ];
  const world = input.snapshot.world;
  const expected = [{ stepId: id("newly-enabled"), atWorldMinutes: 160 }];
  assert.doesNotThrow(() =>
    reconcileWorldPolicy(world, policy(), 100, expected),
  );
  for (const invalid of [
    [],
    [{ stepId: id("newly-enabled"), atWorldMinutes: 100 }],
    [{ stepId: id("newly-enabled"), atWorldMinutes: 99 }],
    [...expected, { stepId: id("already-active"), atWorldMinutes: 160 }],
    [...expected, ...expected],
    [{ stepId: id("sibling"), atWorldMinutes: 160 }],
  ])
    assert.throws(
      () => reconcileWorldPolicy(world, policy(), 100, invalid),
      WorldValidationError,
    );
});

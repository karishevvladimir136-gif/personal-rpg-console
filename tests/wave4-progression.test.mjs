import test from "node:test";
import assert from "node:assert/strict";
import {
  parseProgressionTrack,
  parseRewardDefinition,
  planReward,
  planAdvancement,
  planProgressionCorrection,
  planProgressionDefinitions,
  projectPublicProgression,
  rewardEntitlementId,
  ProgressionValidationError,
} from "../src/lib/progression/index.ts";
import { fixture, commit, event, id } from "./wave4-progression-fixtures.mjs";

const rejects = (fn, code) =>
  assert.throws(
    fn,
    (error) =>
      error instanceof ProgressionValidationError &&
      (!code || error.code === code),
  );
const grant = (input) => planReward(input.context, input.command, input.claim);
const choose = (input, pending, optionId = "scout") =>
  planAdvancement(input.context, input.command, {
    pendingId: pending.id,
    expectedTrackVersion: pending.trackVersion,
    optionId,
  });

test("unconfigured legacy version zero accepts its first definition approval without invented progress", () => {
  const input = fixture();
  const definitions = {
    progression: "on",
    tracks: structuredClone(input.context.state.tracks),
    rewards: structuredClone(input.context.state.rewards),
  };
  input.context.world = {
    ...input.context.world,
    actors: [],
    threads: [],
    hooks: [],
    warnings: [],
  };
  input.context.foundation.world = null;
  Object.assign(input.context.state, {
    version: 0,
    progression: "off",
    tracks: [],
    rewards: [],
    currencies: [],
  });
  definitions.rewards[0].entries = definitions.rewards[0].entries.filter(
    (entry) => entry.kind === "progression",
  );
  const plan = planProgressionDefinitions(
    input.context,
    input.command,
    definitions,
  );
  assert.equal(plan.state.version, 1);
  assert.deepEqual(plan.state.progress, []);
  assert.deepEqual(plan.state.pending, []);
  assert.deepEqual(plan.world.actors, []);
  assert.equal(
    plan.events.some((event) => event.kind === "reward.granted"),
    false,
  );
});

test("approved package plans deterministic progression, existing resources and real item transfers atomically", () => {
  const input = fixture(),
    before = structuredClone(input);
  const plan = grant(input);
  assert.deepEqual(grant(input), plan);
  assert.deepEqual(input, before);
  assert.equal(plan.state.version, 2);
  assert.equal(plan.state.progress[0].value, 25);
  assert.equal(plan.state.progress[0].rank, 0);
  assert.deepEqual(
    plan.state.pending.map((row) => row.rank),
    [1, 2],
  );
  assert.deepEqual(
    plan.changes.find((row) => row.family === "entities").values.resources,
    { focus: 4, marks: 10 },
  );
  const reduction = plan.changes.find((row) => row.id === id("knife"));
  assert.deepEqual(reduction, {
    family: "items",
    id: id("knife"),
    expectedRevision: 1,
    values: { quantity: 7 },
  });
  const child = plan.changes.find(
    (row) => row.family === "items" && row.id !== id("knife"),
  );
  assert.equal(child.expectedRevision, null);
  assert.equal(child.values.owner_entity_id, id("player"));
  assert.equal(child.values.storage_id, id("pack"));
  assert.equal(child.values.quantity, 3);
  assert.equal(
    plan.state.itemPolicies.find((row) => row.itemId === child.id).unitValue,
    2,
  );
  const receipt = plan.events.find((row) => row.kind === "reward.granted");
  assert.equal(receipt.visibility, "private");
  assert.deepEqual(
    receipt.payload.pendingIds,
    plan.state.pending.map((row) => row.id),
  );
  assert.equal(
    receipt.payload.entitlementId,
    rewardEntitlementId(id("campaign"), input.context.state.rewards[0].source),
  );
});

test("source entitlement survives a fresh request, changed definition ID/version, package, and recipients", () => {
  const original = fixture();
  const earned = commit(original, grant(original));
  rejects(() => grant(earned), "reward_claimed");
  for (const change of [
    (input) => {
      input.context.state.rewards[0].id = input.claim.rewardId = "renamed";
    },
    (input) => {
      input.context.state.rewards[0].version =
        input.claim.expectedRewardVersion = 2;
    },
    (input) => {
      input.context.state.rewards[0].recipientIds = [id("companion")];
    },
    (input) => {
      input.context.state.rewards[0].entries = [
        { kind: "currency", currencyId: "coin", amount: 999 },
      ];
    },
  ]) {
    const next = structuredClone(earned);
    change(next);
    const before = structuredClone(next);
    rejects(() => grant(next), "reward_claimed");
    assert.deepEqual(next, before);
  }
});

test("Off settles valid item/currency consequences and a receipt without progression or choices", () => {
  const input = fixture();
  input.context.state.progression = "off";
  const plan = grant(input);
  assert.deepEqual(plan.state.progress, []);
  assert.deepEqual(plan.state.pending, []);
  assert.equal(plan.changes.length, 3);
  assert.equal(plan.events[0].payload.entries[0].status, "off");
  const next = commit(input, plan);
  next.context.state.progression = "on";
  rejects(() => grant(next), "reward_claimed");
});

test("zero-track worlds support ordinary rewards without fabricated baseline progress", () => {
  const input = fixture();
  input.context.state.tracks = [];
  input.context.state.rewards[0].entries =
    input.context.state.rewards[0].entries.filter(
      (entry) => entry.kind !== "progression",
    );
  assert.deepEqual(grant(input).state.progress, []);
  assert.deepEqual(projectPublicProgression(input.context), {
    enabled: true,
    version: 1,
    progress: [],
    pending: [],
  });
});

test("party_equal conserves package totals and assigns remainder by stable recipient identity", () => {
  const input = fixture();
  input.context.state.rewards[0].distribution = "party_equal";
  input.context.state.rewards[0].recipientIds = [id("player"), id("companion")];
  const plan = grant(input);
  assert.equal(
    plan.state.progress.reduce((sum, row) => sum + row.value, 0),
    25,
  );
  assert.deepEqual(
    plan.state.progress.map((row) => row.value),
    [13, 12],
  );
  assert.equal(
    plan.changes
      .filter((row) => row.family === "entities")
      .reduce((sum, row) => sum + row.values.resources.marks, 0),
    10,
  );
  const children = plan.changes.filter(
    (row) => row.family === "items" && row.expectedRevision === null,
  );
  assert.equal(
    children.reduce((sum, row) => sum + row.values.quantity, 0),
    3,
  );
  children.forEach((child) =>
    assert.equal(
      input.context.snapshot.storages.find(
        (storage) => storage.id === child.values.storage_id,
      ).entity_id,
      child.values.owner_entity_id,
    ),
  );
  input.context.state.rewards[0].recipientIds.reverse();
  const reversed = grant(input);
  assert.deepEqual(reversed.changes, plan.changes);
  assert.deepEqual(reversed.events, plan.events);
  assert.deepEqual(reversed.state.progress, plan.state.progress);
  assert.deepEqual(reversed.state.pending, plan.state.pending);
});

test("a full item transfer keeps its identity; full party distribution retains one original and conserves stock", () => {
  for (const party of [false, true]) {
    const input = fixture();
    input.context.state.rewards[0].entries = [
      { kind: "item", itemId: id("knife"), quantity: 10 },
    ];
    if (party)
      Object.assign(input.context.state.rewards[0], {
        distribution: "party_equal",
        recipientIds: [id("player"), id("companion")],
      });
    const plan = grant(input);
    assert.equal(plan.changes.length, party ? 2 : 1);
    assert.equal(
      plan.changes.filter((row) => row.id === id("knife")).length,
      1,
    );
    assert.equal(
      plan.changes.reduce((sum, row) => sum + row.values.quantity, 0),
      10,
    );
    assert.equal(
      plan.changes.find((row) => row.id === id("knife")).expectedRevision,
      1,
    );
  }
});

test("multiple thresholds create ordered explicit choices and never install the same capability twice", () => {
  const input = fixture();
  let current = commit(input, grant(input));
  const [first, second] = current.context.state.pending;
  rejects(() => choose(current, second), "advancement_unavailable");
  const firstPlan = choose(current, first);
  assert.equal(firstPlan.state.progress[0].rank, 1);
  assert.deepEqual(firstPlan.state.progress[0].unlocks, ["Scout access"]);
  assert.deepEqual(
    firstPlan.world.actors.find((actor) => actor.entityId === id("player"))
      .capabilities,
    ["Scout access"],
  );
  current = commit(current, firstPlan, "third-operation");
  rejects(() => choose(current, first), "advancement_unavailable");
  rejects(() => choose(current, second), "advancement_unavailable");
  const finalPlan = choose(current, current.context.state.pending[0], "guide");
  assert.equal(finalPlan.state.progress[0].rank, 2);
  assert.deepEqual(finalPlan.state.pending, []);
  assert.deepEqual(finalPlan.state.progress[0].unlocks, [
    "Scout access",
    "Guide access",
  ]);
});

test("milestones count achievements and independent generic tracks use their own thresholds", () => {
  const input = fixture();
  input.context.state.tracks = [
    {
      id: "milestones",
      version: 1,
      label: "Milestones",
      kind: "milestone",
      thresholds: [1, 2, 3],
      choices: [],
    },
    {
      id: "research",
      version: 1,
      label: "Research",
      kind: "generic",
      thresholds: [5, 15, 25],
      choices: [],
    },
  ];
  input.context.state.rewards[0].entries = [
    { kind: "progression", trackId: "milestones", amount: 1 },
    { kind: "progression", trackId: "research", amount: 19 },
  ];
  const plan = grant(input);
  assert.deepEqual(
    plan.state.progress.map(({ trackId, value, rank }) => ({
      trackId,
      value,
      rank,
    })),
    [
      { trackId: "milestones", value: 1, rank: 1 },
      { trackId: "research", value: 19, rank: 2 },
    ],
  );
  assert.equal(
    projectPublicProgression({ ...input.context, state: plan.state })
      .progress[0].kind,
    "milestone",
  );
  assert.deepEqual(plan.state.pending, []);
});

test("track edits preserve pending snapshots and require explicit owner reconciliation", () => {
  const input = fixture();
  let current = commit(input, grant(input));
  const tracks = structuredClone(current.context.state.tracks);
  tracks[0].version = 2;
  tracks[0].choices[0].label = "Approved new scouting name";
  const definitions = {
    progression: "on",
    tracks,
    rewards: structuredClone(current.context.state.rewards),
  };
  const edited = planProgressionDefinitions(
    current.context,
    current.command,
    definitions,
  );
  assert.equal(edited.state.pending[0].trackVersion, 1);
  current = commit(current, edited, "reconcile-operation");
  assert.equal(
    projectPublicProgression(current.context).pending[0].reason,
    "track_changed",
  );
  rejects(
    () => choose(current, current.context.state.pending[0]),
    "stale_progression",
  );
  const corrected = planProgressionCorrection(
    current.context,
    current.command,
    {
      entityId: id("player"),
      trackId: "xp",
      expectedTrackVersion: 2,
      value: 25,
      rank: 0,
      unlocks: [],
    },
  );
  assert.equal(corrected.state.pending[0].trackVersion, 2);
  assert.equal(
    corrected.state.pending[0].options[0].label,
    "Approved new scouting name",
  );
  assert.notEqual(
    corrected.state.pending[0].id,
    current.context.state.pending[0].id,
  );
  assert.equal(corrected.events[0].kind, "progression.corrected");
  assert.equal(corrected.events[0].payload.authority, "owner");
  current = commit(current, corrected, "choose-reconciled");
  assert.equal(
    choose(current, current.context.state.pending[0]).state.progress[0].rank,
    1,
  );
  rejects(() => grant(current), "reward_claimed");
});

test("manual baseline corrections preserve imported rank without fabricating earned history", () => {
  const input = fixture();
  const plan = planProgressionCorrection(input.context, input.command, {
    entityId: id("player"),
    trackId: "xp",
    expectedTrackVersion: 1,
    value: 0,
    rank: 2,
    unlocks: ["Guide access"],
  });
  assert.deepEqual(plan.state.progress[0], {
    entityId: id("player"),
    trackId: "xp",
    value: 0,
    rank: 2,
    unlocks: ["Guide access"],
  });
  assert.deepEqual(plan.state.pending, []);
  assert.equal(
    plan.events.filter((row) => row.kind === "reward.granted").length,
    0,
  );
  assert.deepEqual(input.context.events, []);
  const current = commit(input, plan);
  const corrected = planProgressionCorrection(
    current.context,
    current.command,
    {
      entityId: id("player"),
      trackId: "xp",
      expectedTrackVersion: 1,
      value: 0,
      rank: 0,
      unlocks: [],
    },
  );
  assert.deepEqual(
    corrected.world.actors.find((actor) => actor.id === id("player"))
      .capabilities,
    [],
  );
});

test("manual correction is exact even when value and automatic rank intentionally differ", () => {
  const input = fixture();
  input.context.state.tracks[0].choices = [];
  const plan = planProgressionCorrection(input.context, input.command, {
    entityId: id("player"),
    trackId: "xp",
    expectedTrackVersion: 1,
    value: 30,
    rank: 1,
    unlocks: [],
  });
  assert.equal(plan.state.progress[0].value, 30);
  assert.equal(plan.state.progress[0].rank, 1);
  assert.equal(plan.events[0].payload.after.rank, 1);
});

test("overlapping track choices and Actor capacity cannot create impossible pending advancement", () => {
  const input = fixture();
  input.context.state.tracks.push({
    id: "second",
    version: 1,
    label: "Second",
    kind: "generic",
    thresholds: [1],
    choices: structuredClone(input.context.state.tracks[0].choices.slice(0, 1)),
  });
  input.context.state.rewards[0].entries[0].amount = 30;
  input.context.state.rewards[0].entries.push({
    kind: "progression",
    trackId: "second",
    amount: 1,
  });
  const before = structuredClone(input);
  rejects(() => grant(input), "advancement_unavailable");
  assert.deepEqual(input, before);
  const capped = fixture();
  capped.context.world.actors[0].capabilities = Array.from(
    { length: 31 },
    (_, index) => `Known ${index}`,
  );
  rejects(() => grant(capped), "advancement_unavailable");
});

test("quest, fully resolved Thread, and committed eligible Events are the only source gates", () => {
  const quest = fixture();
  quest.context.snapshot.quests[0].status = "open";
  rejects(() => grant(quest), "source_ineligible");
  const thread = fixture();
  thread.context.state.rewards[0].source = { kind: "thread", id: id("thread") };
  rejects(() => grant(thread), "source_ineligible");
  Object.assign(thread.context.world.threads[0], {
    status: "resolved",
    cursor: 1,
  });
  assert.ok(grant(thread));
  const committed = fixture();
  committed.context.state.rewards[0].source = {
    kind: "event",
    id: id("source-event"),
  };
  rejects(() => grant(committed), "source_ineligible");
  committed.context.events = [event()];
  assert.ok(grant(committed));
  for (const kind of [
    "world.observed",
    "reward.granted",
    "progression.corrected",
    "model.proposed",
    "world.configured",
  ]) {
    const invalid = structuredClone(committed);
    invalid.context.events[0].kind = kind;
    rejects(() => grant(invalid));
  }
});

test("same-timeline vaulted receipts and inherited fork receipts block re-awards; sibling future does not", () => {
  const input = fixture(),
    awarded = commit(input, grant(input));
  const restored = fixture();
  restored.context.events = awarded.context.events;
  rejects(() => grant(restored), "reward_claimed");
  const fork = structuredClone(restored);
  fork.context.foundation.timeline =
    fork.context.snapshot.timeline =
    fork.command.timeline =
      { timelineId: id("fork"), epoch: 4 };
  rejects(() => grant(fork), "reward_claimed");
  const sibling = fixture();
  sibling.context.foundation.timeline =
    sibling.context.snapshot.timeline =
    sibling.command.timeline =
      { timelineId: id("sibling"), epoch: 5 };
  assert.ok(grant(sibling));
  assert.equal(sibling.context.events.length, 0);
});

test("public progress and choices expose no private source, template, future track or hidden Actor", () => {
  const input = fixture(),
    current = commit(input, grant(input));
  current.context.state.tracks.push({
    id: "future",
    version: 1,
    label: "PRIVATE_FUTURE_TRACK",
    kind: "generic",
    thresholds: [1],
    choices: [],
  });
  current.context.state.progress.push({
    entityId: id("enemy"),
    trackId: "future",
    value: 1,
    rank: 1,
    unlocks: ["PRIVATE_HIDDEN_CAPABILITY"],
  });
  const projection = projectPublicProgression(current.context);
  const publicJson = JSON.stringify(projection);
  for (const forbidden of [
    "PRIVATE_",
    id("quest"),
    "rewardId",
    "source",
    "profile",
    id("enemy"),
    "thresholds",
  ])
    assert.equal(publicJson.includes(forbidden), false, forbidden);
  assert.equal(projection.progress.length, 1);
  assert.equal(projection.pending.length, 2);
  assert.equal(projection.pending[0].selectable, true);
  assert.equal(projection.pending[1].reason, "earlier_choice");
  for (const event of grant(input).events.filter(
    (event) => event.visibility === "public",
  )) {
    assert.equal(JSON.stringify(event).includes("PRIVATE_"), false);
    assert.deepEqual(event.payload, {});
  }
});

test("strict definitions reject unsupported authority, fractional amounts, duplicate entries and malformed thresholds", () => {
  const input = fixture();
  for (const modify of [
    (row) => {
      row.entries[0].amount = 1.5;
    },
    (row) => {
      row.entries[0].amount = Number.MAX_SAFE_INTEGER;
    },
    (row) => {
      row.entries[0].amount = 0;
    },
    (row) => {
      row.entries.push(row.entries[0]);
    },
    (row) => {
      row.recipientIds.push(row.recipientIds[0]);
    },
    (row) => {
      row.entries.push({ kind: "reputation", amount: 10 });
    },
    (row) => {
      row.modelAmount = 5;
    },
  ]) {
    const reward = structuredClone(input.context.state.rewards[0]);
    modify(reward);
    rejects(() => parseRewardDefinition(reward));
  }
  for (const modify of [
    (row) => {
      row.thresholds = [1, 1];
    },
    (row) => {
      row.thresholds = [10, 1];
    },
    (row) => {
      row.thresholds = [0];
    },
    (row) => {
      row.kind = "career";
    },
    (row) => {
      row.kind = "milestone";
    },
    (row) => {
      row.choices[0].executable = "addXp(999)";
    },
    (row) => {
      row.choices[1].capability = row.choices[0].capability;
    },
  ]) {
    const track = structuredClone(input.context.state.tracks[0]);
    modify(track);
    rejects(() => parseProgressionTrack(track));
  }
});

test("changed definitions require exact next versions and cannot silently remove earned tracks", () => {
  const input = fixture();
  for (const version of [1, 3]) {
    const tracks = structuredClone(input.context.state.tracks);
    Object.assign(tracks[0], { version, label: "Changed" });
    rejects(
      () =>
        planProgressionDefinitions(input.context, input.command, {
          progression: "on",
          tracks,
          rewards: input.context.state.rewards,
        }),
      "stale_progression",
    );
  }
  const earned = commit(input, grant(input));
  rejects(() =>
    planProgressionDefinitions(earned.context, earned.command, {
      progression: "on",
      tracks: [],
      rewards: [],
    }),
  );
});

test("overflow, stock shortage, bad choices, unsupported budgets and scope mismatches fail without partial plans", () => {
  const changes = [
    (input) => {
      input.context.snapshot.entities.find(
        (row) => row.id === id("player"),
      ).resources.marks = 999999;
    },
    (input) => {
      input.context.snapshot.items.find(
        (row) => row.id === id("knife"),
      ).quantity = 1;
    },
    (input) => {
      input.context.snapshot.storages = input.context.snapshot.storages.filter(
        (row) => row.entity_id !== id("player"),
      );
    },
    (input) => {
      input.context.state.tracks[0].choices =
        input.context.state.tracks[0].choices.slice(0, 1);
    },
    (input) => {
      input.context.state.progress = [
        {
          entityId: id("player"),
          trackId: "xp",
          value: 1000000000,
          rank: 3,
          unlocks: [],
        },
      ];
    },
    (input) => {
      input.context.snapshot.items[0].campaign_id = id("other-campaign");
    },
    (input) => {
      input.context.world.campaignId = id("other-campaign");
    },
    (input) => {
      input.context.state.profile.version += 1;
    },
    (input) => {
      input.command.timeline.epoch += 1;
    },
    (input) => {
      input.command.expectedHeadId = id("wrong-head");
    },
    (input) => {
      input.command.expectedRuntimeRevision += 1;
    },
    (input) => {
      input.claim.amount = 1000;
    },
  ];
  for (const change of changes) {
    const input = fixture();
    change(input);
    const before = structuredClone(input);
    assert.throws(() => grant(input));
    assert.deepEqual(input, before);
  }
  const input = fixture(),
    earned = commit(input, grant(input));
  const before = structuredClone(earned);
  rejects(
    () => choose(earned, earned.context.state.pending[0], "made-up"),
    "advancement_unavailable",
  );
  assert.deepEqual(earned, before);
});

test("future and foreign Events never grant rewards", () => {
  for (const override of [
    { worldMinutes: 1 },
    { campaignId: id("another-campaign") },
    { evidence: [{ knowledge: "future_source", visibility: "private" }] },
    { evidence: [{ knowledge: "source", visibility: "private" }] },
  ]) {
    const input = fixture();
    input.context.state.rewards[0].source = {
      kind: "event",
      id: id("source-event"),
    };
    input.context.events = [event(override)];
    const before = structuredClone(input);
    rejects(() => grant(input));
    assert.deepEqual(input, before);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { fixture, commit, id } from "./wave4-progression-fixtures.mjs";
import { planBoundedReward } from "../src/lib/progression/reward-integrity.ts";
const policy = (context) => ({
  schemaVersion: 1,
  id: "synthetic-reward-assessment",
  version: 1,
  profile: context.state.profile,
  rewardId: "objective",
  rewardVersion: 1,
  sourceSignificance: "meaningful",
  usablePowerCeiling: 3,
  meaningfulnessFloor: 2,
  powerAggregation: "maximum",
  nonItemSignificance: 2,
  deliberateFloorException: null,
  items: [
    {
      itemId: id("knife"),
      rarity: "legendary",
      fullPower: 100,
      currentUsablePower: 0,
      economicValue: 2,
      narrativeSignificance: 3,
      usability: "dormant",
      requiredCapabilities: [],
    },
  ],
});
test("rarity, full power, usable power, value and significance remain separate", () => {
  const { context, command, claim } = fixture(),
    p = policy(context);
  const plan = planBoundedReward(context, command, claim, p);
  assert.ok(plan.events.some((e) => e.kind === "reward.granted"));
  assert.equal(
    plan.events.find((e) => e.kind === "reward.integrity.checked").visibility,
    "private",
  );
  assert.ok(
    !JSON.stringify(
      plan.events.filter((e) => e.visibility === "public"),
    ).includes("legendary"),
  );
  assert.ok(!context.state.itemPolicies.some((p) => p.itemId !== id("knife")));
});
test("trusted ceiling and floor block unbounded or meaningless grants; explicit exception is supported", () => {
  const { context, command, claim } = fixture(),
    p = policy(context);
  assert.throws(() =>
    planBoundedReward(context, command, claim, {
      ...p,
      items: [
        { ...p.items[0], currentUsablePower: 100, usability: "available" },
      ],
    }),
  );
  const trivial = {
    ...p,
    nonItemSignificance: 0,
    items: [{ ...p.items[0], narrativeSignificance: 0 }],
  };
  assert.throws(() => planBoundedReward(context, command, claim, trivial));
  assert.ok(
    planBoundedReward(context, command, claim, {
      ...trivial,
      deliberateFloorException:
        "The trusted source intentionally offers recognition only.",
    }),
  );
});
test("unknown usability cannot bypass an enforced ceiling or activate missing capabilities", () => {
  const { context, command, claim } = fixture(),
    p = policy(context);
  assert.throws(() =>
    planBoundedReward(context, command, claim, {
      ...p,
      items: [
        { ...p.items[0], currentUsablePower: null, usability: "unknown" },
      ],
    }),
  );
  assert.throws(() =>
    planBoundedReward(context, command, claim, {
      ...p,
      items: [
        {
          ...p.items[0],
          currentUsablePower: 1,
          usability: "limited",
          requiredCapabilities: ["unearned-mastery"],
        },
      ],
    }),
  );
  assert.throws(() =>
    planBoundedReward(context, command, claim, {
      ...p,
      items: [{ ...p.items[0], economicValue: 9999 }],
    }),
  );
});
test("existing reward source receipt prevents duplicate grant after committed reload and inherited fork", () => {
  const input = fixture(),
    p = policy(input.context);
  const plan = planBoundedReward(input.context, input.command, input.claim, p);
  const next = commit(input, plan);
  assert.throws(() =>
    planBoundedReward(next.context, next.command, next.claim, p),
  );
  next.context.foundation.timeline.timelineId = id("fork");
  next.context.snapshot.timeline = structuredClone(
    next.context.foundation.timeline,
  );
  next.command.timeline = structuredClone(next.context.foundation.timeline);
  assert.throws(() =>
    planBoundedReward(next.context, next.command, next.claim, p),
  );
});
test("Off mode uses existing reward entitlement without progression deltas", () => {
  const { context, command, claim } = fixture();
  context.state.progression = "off";
  const plan = planBoundedReward(context, command, claim, policy(context));
  assert.deepEqual(plan.state.progress, []);
  assert.deepEqual(plan.state.pending, []);
  assert.equal(
    plan.events
      .find((e) => e.kind === "reward.granted")
      .payload.entries.find((e) => e.kind === "progression").status,
    "off",
  );
});

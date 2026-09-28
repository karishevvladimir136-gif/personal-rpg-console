import { isDeepStrictEqual } from "node:util";
import { stableGameplayId } from "../gameplay/dice.ts";
import type { LoopContext, LoopPlan } from "../foundation-loop/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import { planReward, type RewardClaim } from "./planning.ts";
import {
  parseRewardIntegrityPolicy,
  planBoundedReward,
  type RewardIntegrityPolicy,
} from "./reward-integrity.ts";
import {
  fields,
  integer,
  list,
  textValue,
  identifier,
  uuid,
  requireProgression,
  validateProgressionCommand,
  unique,
} from "./validation.ts";

export type RewardIntegrityInput = {
  rewardId: string;
  expectedRewardVersion: number;
  expectedPolicyVersion: number | null;
  sourceSignificance: "ordinary" | "meaningful";
  usablePowerCeiling: number | null;
  meaningfulnessFloor: number | null;
  powerAggregation: "maximum" | "sum";
  nonItemSignificance: number;
  deliberateFloorException: string | null;
  items: {
    itemId: string;
    rarity: string;
    usablePower: number;
    narrativeSignificance: number;
  }[];
};
export function readRewardIntegrity(
  context: LoopContext,
  rewardId: string,
): RewardIntegrityPolicy | null {
  identifier(rewardId);
  let current: RewardIntegrityPolicy | null = null;
  const rows = context.events
    .filter(
      (e) =>
        e.campaignId === context.foundation.campaignId &&
        e.visibility === "private" &&
        e.kind === "reward.integrity.configured" &&
        e.worldMinutes <= context.foundation.worldMinutes &&
        e.evidence.every(
          (r) => r.knowledge !== "future_source" && r.knowledge !== "source",
        ) &&
        (e.payload.policy as { rewardId?: string })?.rewardId === rewardId,
    )
    .sort((a, b) => a.sequence - b.sequence);
  for (const e of rows) {
    const value = fields(e.payload, [
        "schemaVersion",
        "expectedPolicyVersion",
        "policy",
      ]),
      policy = parseRewardIntegrityPolicy(value.policy);
    requireProgression(
      value.schemaVersion === 1 &&
        value.expectedPolicyVersion === (current?.version ?? null) &&
        policy.version === (current?.version ?? 0) + 1,
      "stale_progression",
    );
    current = policy;
  }
  return current;
}
export function planApplicableReward(
  context: LoopContext,
  command: FoundationCommand,
  claim: RewardClaim,
): LoopPlan {
  const policy = readRewardIntegrity(context, claim.rewardId);
  return policy
    ? planBoundedReward(context, command, claim, policy)
    : planReward(context, command, claim);
}
export function planRewardIntegrityConfiguration(
  context: LoopContext,
  command: FoundationCommand,
  raw: unknown,
  publicRewardIds: ReadonlySet<string>,
): LoopPlan {
  validateProgressionCommand(context, command);
  const input = fields(raw, [
    "rewardId",
    "expectedRewardVersion",
    "expectedPolicyVersion",
    "sourceSignificance",
    "usablePowerCeiling",
    "meaningfulnessFloor",
    "powerAggregation",
    "nonItemSignificance",
    "deliberateFloorException",
    "items",
  ]);
  identifier(input.rewardId);
  integer(input.expectedRewardVersion, 1);
  const reward = context.state.rewards.find(
    (r) => r.id === input.rewardId && r.version === input.expectedRewardVersion,
  );
  requireProgression(reward && publicRewardIds.has(reward.id));
  const previous = readRewardIntegrity(context, reward.id);
  requireProgression(
    input.expectedPolicyVersion === (previous?.version ?? null),
    "stale_progression",
  );
  const assessments = list(input.items, 32).map((v) => {
    const item = fields(v, [
      "itemId",
      "rarity",
      "usablePower",
      "narrativeSignificance",
    ]);
    uuid(item.itemId);
    textValue(item.rarity, 100);
    integer(item.usablePower, 0, 1000000);
    integer(item.narrativeSignificance, 0, 1000000);
    return item;
  });
  unique(assessments.map((i) => i.itemId));
  const entries = reward.entries.filter((e) => e.kind === "item");
  requireProgression(
    entries.length === assessments.length &&
      entries.every((e) => assessments.some((i) => i.itemId === e.itemId)),
  );
  const policy = parseRewardIntegrityPolicy({
    schemaVersion: 1,
    id:
      previous?.id ??
      stableGameplayId(
        context.foundation.campaignId,
        `reward-integrity-v1:${reward.id}`,
      ),
    version: (previous?.version ?? 0) + 1,
    profile: context.state.profile,
    rewardId: reward.id,
    rewardVersion: reward.version,
    sourceSignificance: input.sourceSignificance,
    usablePowerCeiling: input.usablePowerCeiling,
    meaningfulnessFloor: input.meaningfulnessFloor,
    powerAggregation: input.powerAggregation,
    nonItemSignificance: input.nonItemSignificance,
    deliberateFloorException: input.deliberateFloorException,
    items: assessments.map((item) => {
      const value = context.state.itemPolicies.find(
        (p) => p.itemId === item.itemId && p.visibility === "public",
      );
      requireProgression(value);
      return {
        itemId: item.itemId,
        rarity: item.rarity,
        fullPower: item.usablePower,
        currentUsablePower: item.usablePower,
        economicValue: value.unitValue,
        narrativeSignificance: item.narrativeSignificance,
        usability: "available",
        requiredCapabilities: [],
      };
    }),
  });
  requireProgression(
    isDeepStrictEqual(policy.profile, context.foundation.ruleset),
  );
  return {
    state: {
      ...structuredClone(context.state),
      version: context.state.version + 1,
    },
    world: structuredClone(context.world),
    changes: [],
    events: [
      {
        kind: "reward.integrity.configured",
        visibility: "private",
        text: "Owner reward bounds were saved.",
        actorIds: [],
        threadIds: [],
        payload: JSON.parse(
          JSON.stringify({
            schemaVersion: 1,
            expectedPolicyVersion: previous?.version ?? null,
            policy,
          }),
        ),
      },
    ],
  };
}

/** Only manual public assessments enter this owner view. Private compiler or
 * source item properties are never inferred or projected as owner fields. */
export function publicRewardIntegrity(
  context: LoopContext,
  rewardIds: ReadonlySet<string>,
) {
  return [...rewardIds].flatMap((id) => {
    const policy = readRewardIntegrity(context, id);
    if (!policy) return [];
    return [
      {
        rewardId: id,
        expectedRewardVersion: policy.rewardVersion,
        expectedPolicyVersion: policy.version,
        sourceSignificance: policy.sourceSignificance,
        usablePowerCeiling: policy.usablePowerCeiling,
        meaningfulnessFloor: policy.meaningfulnessFloor,
        powerAggregation: policy.powerAggregation,
        nonItemSignificance: policy.nonItemSignificance,
        deliberateFloorException: policy.deliberateFloorException,
        items: policy.items.map((item) => ({
          itemId: item.itemId,
          rarity: item.rarity,
          usablePower: item.currentUsablePower,
          narrativeSignificance: item.narrativeSignificance,
        })),
      },
    ];
  });
}

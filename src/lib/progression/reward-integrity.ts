import type { LoopContext, LoopPlan } from "../foundation-loop/contracts.ts";
import type {
  FoundationCommand,
  RulesetProfileRef,
} from "../production/contracts.ts";
import { planReward, type RewardClaim } from "./planning.ts";
import {
  fields,
  integer,
  list,
  textValue,
  uuid,
  identifier,
  requireProgression,
  unique,
} from "./validation.ts";
import { isDeepStrictEqual } from "node:util";

// Trusted, explicit per-profile assessment. Numeric ranks here belong to the
// supplied policy/version; rarity and monetary value are never converted to power.
export type RewardIntegrityPolicy = {
  schemaVersion: 1;
  id: string;
  version: number;
  profile: RulesetProfileRef;
  rewardId: string;
  rewardVersion: number;
  sourceSignificance: "ordinary" | "meaningful";
  usablePowerCeiling: number | null;
  meaningfulnessFloor: number | null;
  powerAggregation: "maximum" | "sum";
  nonItemSignificance: number;
  deliberateFloorException: string | null;
  items: {
    itemId: string;
    rarity: string;
    fullPower: number;
    currentUsablePower: number | null;
    economicValue: number;
    narrativeSignificance: number;
    usability: "available" | "limited" | "dormant" | "unknown";
    requiredCapabilities: string[];
  }[];
};
export function parseRewardIntegrityPolicy(
  value: unknown,
): RewardIntegrityPolicy {
  const row = fields(value, [
    "schemaVersion",
    "id",
    "version",
    "profile",
    "rewardId",
    "rewardVersion",
    "sourceSignificance",
    "usablePowerCeiling",
    "meaningfulnessFloor",
    "powerAggregation",
    "nonItemSignificance",
    "deliberateFloorException",
    "items",
  ]);
  requireProgression(row.schemaVersion === 1);
  identifier(row.id);
  integer(row.version, 1);
  identifier(row.rewardId);
  integer(row.rewardVersion, 1);
  const profile = fields(row.profile, [
    "id",
    "version",
    "mode",
    "validatorVersion",
  ]);
  identifier(profile.id);
  integer(profile.version, 1);
  identifier(profile.validatorVersion);
  requireProgression(
    ["world_logic", "full_ruleset", "custom_ruleset"].includes(
      String(profile.mode),
    ),
  );
  requireProgression(
    ["ordinary", "meaningful"].includes(String(row.sourceSignificance)) &&
      ["maximum", "sum"].includes(String(row.powerAggregation)),
  );
  for (const key of ["usablePowerCeiling", "meaningfulnessFloor"])
    if (row[key] !== null) integer(row[key], 0, 1000000);
  integer(row.nonItemSignificance, 0, 1000000);
  if (row.deliberateFloorException !== null)
    textValue(row.deliberateFloorException, 2000);
  const items = list(row.items, 32).map((value) => {
    const item = fields(value, [
      "itemId",
      "rarity",
      "fullPower",
      "currentUsablePower",
      "economicValue",
      "narrativeSignificance",
      "usability",
      "requiredCapabilities",
    ]);
    uuid(item.itemId);
    textValue(item.rarity, 100);
    for (const key of ["fullPower", "economicValue", "narrativeSignificance"])
      integer(item[key], 0, 1000000);
    if (item.currentUsablePower !== null)
      integer(item.currentUsablePower, 0, item.fullPower as number);
    requireProgression(
      ["available", "limited", "dormant", "unknown"].includes(
        String(item.usability),
      ),
    );
    requireProgression(
      item.usability === "unknown"
        ? item.currentUsablePower === null
        : item.currentUsablePower !== null,
    );
    requireProgression(
      (item.usability !== "dormant" || item.currentUsablePower === 0) &&
        (item.usability !== "available" ||
          item.currentUsablePower === item.fullPower),
    );
    const caps = list(item.requiredCapabilities, 16);
    caps.forEach((cap) => textValue(cap, 200));
    unique(caps);
    return item;
  });
  unique(items.map((item) => item.itemId));
  return structuredClone(row) as RewardIntegrityPolicy;
}
/** Server-supplied policy wrapper; claims remain the existing reward reference
 * shape. All actual grants/receipts/Off-mode arithmetic use planReward. */
export function planBoundedReward(
  context: LoopContext,
  command: FoundationCommand,
  claim: RewardClaim,
  rawPolicy: unknown,
): LoopPlan {
  const policy = parseRewardIntegrityPolicy(rawPolicy);
  requireProgression(
    isDeepStrictEqual(policy.profile, context.state.profile) &&
      policy.rewardId === claim.rewardId &&
      policy.rewardVersion === claim.expectedRewardVersion,
    "stale_progression",
  );
  const reward = context.state.rewards.find(
    (reward) => reward.id === claim.rewardId,
  );
  requireProgression(
    reward && reward.version === policy.rewardVersion,
    "stale_progression",
  );
  const itemEntries = reward.entries.filter((entry) => entry.kind === "item");
  requireProgression(
    itemEntries.length === policy.items.length &&
      itemEntries.every((entry) =>
        policy.items.some((item) => item.itemId === entry.itemId),
      ),
  );
  const assessed = policy.items.map((item) => {
    const entry = itemEntries.find((entry) => entry.itemId === item.itemId)!;
    requireProgression(
      context.state.itemPolicies.find((p) => p.itemId === item.itemId)
        ?.unitValue === item.economicValue,
    );
    if (item.usability === "available" || item.usability === "limited")
      requireProgression(
        reward.recipientIds.every((entityId) =>
          item.requiredCapabilities.every((capability) =>
            context.world.actors
              .find((actor) => actor.entityId === entityId)
              ?.capabilities.includes(capability),
          ),
        ),
      );
    return item.currentUsablePower === null
      ? null
      : item.currentUsablePower *
          (policy.powerAggregation === "sum" ? entry.quantity : 1);
  });
  if (policy.usablePowerCeiling !== null) {
    requireProgression(assessed.every((power) => power !== null));
    const powers = assessed as number[];
    const power =
      policy.powerAggregation === "sum"
        ? powers.reduce((sum, value) => sum + value, 0)
        : Math.max(0, ...powers);
    requireProgression(
      Number.isSafeInteger(power) && power <= policy.usablePowerCeiling,
    );
  }
  const significance = Math.max(
    policy.nonItemSignificance,
    ...policy.items.map((item) => item.narrativeSignificance),
  );
  if (
    policy.sourceSignificance === "meaningful" &&
    policy.meaningfulnessFloor !== null &&
    significance < policy.meaningfulnessFloor
  )
    requireProgression(policy.deliberateFloorException !== null);
  const plan = planReward(context, command, claim);
  plan.events.push({
    kind: "reward.integrity.checked",
    visibility: "private",
    text: "Trusted reward integrity policy was checked.",
    actorIds: [],
    threadIds: [],
    payload: JSON.parse(JSON.stringify(policy)),
  });
  return plan;
}

import type { CampaignSnapshot } from "../../persistence/contracts.ts";
import type { MechanicsConfiguration } from "../contracts.ts";
import { requireRule } from "../turn-errors.ts";

export const basicProfile = {
  id: "console-basic-v1",
  shortMinutes: 60,
  longMinutes: 480,
  transformMinutes: 10,
  transformDc: 12,
  forageMinutes: 60,
  forageDc: 10,
  weaponDamage: 2,
  spearDamage: 3,
  healing: 4,
  recovery: {
    short: { forgiving: 0.5, standard: 0.25, restrictive: 0 },
    long: { forgiving: 1, standard: 0.5, restrictive: 0.25 },
  },
  forageYield: { abundant: 3, standard: 2, scarce: 1 },
} as const;

export function validateConfiguration(
  snapshot: CampaignSnapshot,
  config: MechanicsConfiguration,
): void {
  requireRule(config.profile === basicProfile.id);
  const entities = snapshot.entities.filter(
    (row) => row.campaign_id === snapshot.campaign.id,
  );
  for (const ids of [
    config.controlledEntityIds,
    config.presentEntityIds,
    config.nearbyStorageIds,
    config.safeLocationIds,
  ]) {
    requireRule(
      Array.isArray(ids) &&
        ids.length <= 200 &&
        new Set(ids).size === ids.length,
    );
  }
  requireRule(config.controlledEntityIds.length > 0);
  requireRule(
    config.controlledEntityIds.every((id) =>
      entities.some(
        (row) =>
          row.id === id && (row.kind === "player" || row.kind === "companion"),
      ),
    ),
  );
  requireRule(
    config.presentEntityIds.every((id) =>
      entities.some((row) => row.id === id),
    ),
  );
  requireRule(
    config.nearbyStorageIds.every((id) =>
      snapshot.storages.some(
        (row) =>
          row.id === id &&
          row.campaign_id === snapshot.campaign.id &&
          row.kind === "transport",
      ),
    ),
  );
  requireRule(
    config.safeLocationIds.every((id) =>
      snapshot.locations.some(
        (row) => row.id === id && row.campaign_id === snapshot.campaign.id,
      ),
    ),
  );
  const tags = [
    "supply",
    "meat",
    "coffee",
    "water",
    "knife",
    "stick",
    "binding",
    "cutting-tool",
    "weapon",
    "healing",
    "meal-serving",
    "coffee-serving",
  ];
  requireRule(
    Array.isArray(config.itemRules) && config.itemRules.length <= 500,
  );
  const keys = new Set<string>();
  for (const rule of config.itemRules) {
    requireRule(
      snapshot.items.some(
        (row) =>
          row.id === rule.itemId && row.campaign_id === snapshot.campaign.id,
      ),
    );
    requireRule(
      tags.includes(rule.tag) && !keys.has(`${rule.itemId}:${rule.tag}`),
    );
    keys.add(`${rule.itemId}:${rule.tag}`);
    requireRule(
      rule.damage === null ||
        (rule.tag === "weapon" &&
          Number.isInteger(rule.damage) &&
          rule.damage >= 1 &&
          rule.damage <= 20),
    );
  }
}

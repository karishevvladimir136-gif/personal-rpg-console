import type { CharacterSheetV1 } from "./adventures/bootstrap-contracts.ts";
import type { CampaignSnapshot, Entity, Item } from "./persistence/contracts.ts";
import { equipmentForRecord } from "./persistence/record-model.ts";

export type CharacterProgress = {
  label: string;
  value: number;
  nextThreshold: number | null;
};

export type CharacterViewModel = {
  sheet: CharacterSheetV1;
  reviewed: boolean;
  level: number | null;
  attributes: readonly (readonly [string, number])[];
  derivedStats: readonly (readonly [string, number])[];
  skills: string[];
  abilities: string[];
  limitations: string[];
  spells: string[];
  conditions: string[];
  resources: readonly (readonly [string, number])[];
  owned: Item[];
  carried: Item[];
  equipped: Item[];
  progress: CharacterProgress[];
};

/** Player-visible presentation only; the campaign record remains the authority. */
export function characterViewModel(
  data: CampaignSnapshot,
  entity: Entity,
  facts?: { capabilities: string[]; limitations: string[] } | null,
  progress: CharacterProgress[] = [],
): CharacterViewModel {
  const reviewed = entity.character_sheet !== null && entity.character_sheet !== undefined;
  const sheet: CharacterSheetV1 = entity.character_sheet ?? {
    schemaVersion: 1,
    mode: "narrative",
    role: null,
    background: entity.details,
    level: Number.isSafeInteger(entity.stats.level) && entity.stats.level > 0
      ? entity.stats.level : null,
    tier: null,
    attributes: null,
    skills: [],
    abilities: [],
    limitations: [],
    spells: [],
  };
  const attributes = sheet.attributes
    ? [
        ["STR", sheet.attributes.strength],
        ["DEX", sheet.attributes.dexterity],
        ["CON", sheet.attributes.constitution],
        ["INT", sheet.attributes.intelligence],
        ["WIS", sheet.attributes.wisdom],
        ["CHA", sheet.attributes.charisma],
      ] as const
    : [];
  const attributeKeys = new Set([
    "str", "dex", "con", "int", "wis", "cha",
    "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma",
  ]);
  const sameCampaignItems = data.items.filter((item) => item.campaign_id === data.campaign.id);
  const playerStorageIds = new Set(data.storages
    .filter((storage) => storage.campaign_id === data.campaign.id &&
      storage.kind === "player" && storage.entity_id === entity.id)
    .map((storage) => storage.id));
  return {
    sheet,
    reviewed,
    level: Number.isSafeInteger(entity.stats.level) && entity.stats.level > 0
      ? entity.stats.level : sheet.level,
    attributes,
    derivedStats: Object.entries(entity.stats).filter(([key]) =>
      key !== "level" && !(attributes.length && attributeKeys.has(key.toLowerCase())),
    ),
    skills: [...new Set([...sheet.skills, ...(facts?.capabilities ?? [])])],
    abilities: [...sheet.abilities],
    limitations: [...new Set([...sheet.limitations, ...(facts?.limitations ?? [])])],
    spells: [...sheet.spells],
    conditions: [...entity.conditions],
    resources: Object.entries(entity.resources),
    owned: sameCampaignItems.filter((item) =>
      item.owner_entity_id === entity.id || item.equipped_entity_id === entity.id,
    ),
    carried: sameCampaignItems.filter((item) =>
      item.equipped_entity_id === entity.id ||
      (item.owner_entity_id === entity.id && item.storage_id !== null &&
        playerStorageIds.has(item.storage_id)),
    ),
    equipped: equipmentForRecord(entity, sameCampaignItems),
    progress,
  };
}

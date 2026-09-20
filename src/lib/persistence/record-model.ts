import type {
  CampaignSnapshot,
  Entity,
  EquipmentSlot,
  Item,
  ItemInput,
  PublicState,
  StorageInput,
} from "./contracts.ts";

export const entityKindLabels = {
  player: "Player character",
  companion: "Companion",
  npc: "Known NPC",
  transport: "Transport",
  mount: "Mount",
} as const;
export const storageKindLabels = {
  player: "Player",
  companion: "Companion",
  camp: "Camp / Shared Stash",
  transport: "Transport & Mounts",
  merchant: "Merchant stock",
} as const;
export const sceneRoleLabels = {
  narration: "Narration record",
  player: "Player transcript",
  note: "Owner note",
} as const;

export class RecordValidationError extends Error {}

export function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || number > 1_000_000)
    throw new RecordValidationError(
      "Use a whole number between 0 and 1,000,000, or leave it blank.",
    );
  return number;
}

export function parseHitPoints(current: string, maximum: string) {
  const hp = numberOrNull(current),
    max_hp = numberOrNull(maximum);
  if ((hp === null) !== (max_hp === null))
    throw new RecordValidationError(
      "Enter both current and maximum HP, or leave both blank.",
    );
  if (hp !== null && max_hp !== null && hp > max_hp)
    throw new RecordValidationError("Current HP cannot exceed maximum HP.");
  return { hp, max_hp };
}

export function storageAcceptsEntity(
  kind: StorageInput["kind"],
  entity: Entity,
) {
  return kind === "transport"
    ? entity.kind === "transport" || entity.kind === "mount"
    : kind === "merchant"
      ? entity.kind === "npc"
      : kind !== "camp" && entity.kind === kind;
}

export function equipmentProfileForCorrection(
  previous: Entity | undefined,
  kind: Entity["kind"],
  slots: EquipmentSlot[],
): EquipmentSlot[] {
  if (kind !== "npc") return slots;
  if (previous?.kind === "npc") return previous.equipment_slots;
  if (slots.length)
    throw new RecordValidationError(
      "Clear the equipment profile before changing this record to a known NPC.",
    );
  return [];
}

export function storageCorrectionIssue(
  snapshot: CampaignSnapshot,
  storage: StorageInput,
  id?: string,
): string | null {
  if (storage.kind === "camp") {
    if (storage.entity_id !== null)
      return "Shared stash storage must not be assigned to a character.";
  } else {
    const entity = snapshot.entities.find(
      (row) =>
        row.id === storage.entity_id &&
        row.campaign_id === snapshot.campaign.id,
    );
    if (!entity || !storageAcceptsEntity(storage.kind, entity))
      return "Choose a character or transport that matches this storage kind.";
  }
  if (
    id &&
    snapshot.items.some(
      (row) =>
        row.campaign_id === snapshot.campaign.id &&
        row.storage_id === id &&
        row.equipped_entity_id &&
        row.equipped_entity_id !== storage.entity_id,
    )
  )
    return "This storage contains equipped items. Correct their equipment records before changing its assignment.";
  return null;
}

/** Public client feedback only. The database independently repeats every invariant. */
export function itemCorrectionIssue(
  snapshot: CampaignSnapshot,
  item: ItemInput,
  id?: string,
): string | null {
  const campaignId = snapshot.campaign.id;
  const storage = snapshot.storages.find(
    (row) => row.id === item.storage_id && row.campaign_id === campaignId,
  );
  if (!storage) return "Choose storage from this campaign.";
  if (!Number.isSafeInteger(item.quantity) || item.quantity < 0)
    return "Quantity must be a whole number of zero or more.";
  if (
    item.owner_entity_id &&
    !snapshot.entities.some(
      (row) =>
        row.id === item.owner_entity_id && row.campaign_id === campaignId,
    )
  )
    return "Choose an owner from this campaign.";
  if (Boolean(item.equipped_entity_id) !== Boolean(item.equipped_slot))
    return "Choose both an equipped character and a compatible slot, or neither.";
  if (!item.equipped_entity_id) return null;
  const entity = snapshot.entities.find(
    (row) =>
      row.id === item.equipped_entity_id && row.campaign_id === campaignId,
  );
  if (entity?.kind === "npc")
    return "NPC equipment is not available in Phase 1. Keep known NPC details in the public record.";
  const slot = entity?.equipment_slots.find(
    (row) => row.id === item.equipped_slot,
  );
  if (!slot || !slot.accepts.includes(item.category))
    return "This slot does not accept the item category.";
  if (item.quantity < 1) return "An equipped item needs at least one unit.";
  if (storage.entity_id !== item.equipped_entity_id)
    return "Equipped items must be in that character's storage.";
  if (
    snapshot.items.some(
      (row) =>
        row.campaign_id === campaignId &&
        row.id !== id &&
        row.equipped_entity_id === item.equipped_entity_id &&
        row.equipped_slot === item.equipped_slot,
    )
  )
    return "That equipment slot is occupied. Correct the other item first.";
  return null;
}

export function equipmentForRecord(entity: Entity, items: Item[]) {
  return items.filter(
    (item) =>
      item.campaign_id === entity.campaign_id &&
      item.equipped_entity_id === entity.id,
  );
}

export function resumeIssue(
  snapshot: CampaignSnapshot,
  state: Pick<
    PublicState,
    "current_session_id" | "current_scene_id" | "current_location_id"
  >,
): string | null {
  const campaign = snapshot.campaign.id;
  if (
    state.current_session_id &&
    !snapshot.sessions.some(
      (row) =>
        row.id === state.current_session_id && row.campaign_id === campaign,
    )
  )
    return "Choose a session from this campaign.";
  if (
    state.current_scene_id &&
    !snapshot.scenes.some(
      (row) =>
        row.id === state.current_scene_id &&
        row.campaign_id === campaign &&
        row.session_id === state.current_session_id,
    )
  )
    return "The resume scene must belong to the selected session.";
  if (
    state.current_location_id &&
    !snapshot.locations.some(
      (row) =>
        row.id === state.current_location_id && row.campaign_id === campaign,
    )
  )
    return "Choose a location from this campaign.";
  return null;
}

export function itemIcon(category: string) {
  const icons: Record<string, string> = {
    weapon: "Swords",
    weapons: "Swords",
    armor: "Shield",
    clothing: "Shirt",
    consumable: "FlaskConical",
    consumables: "FlaskConical",
    money: "Coins",
    document: "FileText",
    gear: "Backpack",
  };
  return icons[category.toLowerCase()] || "Package";
}

export function sceneOrder<T extends { sequence: number; id: string }>(
  scenes: T[],
): T[] {
  return [...scenes].sort(
    (a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id),
  );
}

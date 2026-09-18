import { campaign, items as originalItems } from "./mock-data.ts";

const campaignId = campaign.campaign_id;
export const scopedId = (id: string) => `${campaignId}:${id}`;
export type Slot = { id: string; label: string; icon: string };
export const slotProfiles: Record<string, readonly Slot[]> = {
  humanoid: [
    { id: "head", label: "Head", icon: "UserRound" },
    { id: "neck", label: "Neck", icon: "Sparkles" },
    { id: "coat", label: "Coat / Armor", icon: "Shirt" },
    { id: "off-hand", label: "Off hand", icon: "Shield" },
    { id: "main-hand", label: "Main hand", icon: "Crosshair" },
    { id: "legs", label: "Legs", icon: "Shirt" },
    { id: "belt", label: "Belt", icon: "Package" },
    { id: "boots", label: "Boots", icon: "Shield" },
  ],
  none: [],
  vehicle: [
    { id: "protection", label: "Protective modifications", icon: "Shield" },
    { id: "utility", label: "Utility attachment", icon: "Briefcase" },
    { id: "cargo", label: "Cargo fittings", icon: "Package" },
    { id: "talisman", label: "Compatible talisman", icon: "Sparkles" },
  ],
  // Capability examples only: no horse or invented mount exists in this campaign.
  horse: [
    { id: "saddle", label: "Saddle", icon: "Package" },
    { id: "barding", label: "Barding", icon: "Shield" },
    { id: "saddlebags", label: "Saddlebags", icon: "Briefcase" },
    { id: "charm", label: "Compatible charm", icon: "Sparkles" },
  ],
};
export type Entity = {
  id: string;
  campaign_id: string;
  name: string;
  kind: "player" | "companion" | "contact" | "transport";
  art: string;
  profile: string;
  available: boolean;
  relationship: string;
  description: string;
};
export const entities: Entity[] = [
  {
    id: scopedId("james"),
    campaign_id: campaignId,
    name: "James",
    kind: "player",
    art: "figure",
    profile: "humanoid",
    available: true,
    relationship: "You",
    description: "A private detective, 32. Still asking questions.",
  },
  {
    id: scopedId("jinn"),
    campaign_id: campaignId,
    name: "Jinn",
    kind: "companion",
    art: "jinn",
    profile: "none",
    available: true,
    relationship: "Close",
    description:
      "A familiar presence in an unfamiliar world. He recognized something about the letter’s seal.",
  },
  {
    id: scopedId("goran"),
    campaign_id: campaignId,
    name: "Goran",
    kind: "contact",
    art: "meeting",
    profile: "none",
    available: false,
    relationship: "Friendly",
    description:
      "A source of useful road information. Last encountered in Chicago.",
  },
  {
    id: scopedId("ford"),
    campaign_id: campaignId,
    name: "Old Ford",
    kind: "transport",
    art: "car",
    profile: "vehicle",
    available: false,
    relationship: "Transport & Mounts",
    description:
      "Last known: parked in New York. Cargo is not within reach in this sample scene.",
  },
];
export type Storage = {
  id: string;
  campaign_id: string;
  label: string;
  kind: "player" | "companion" | "stash" | "transport";
  entityId?: string;
  accessible: boolean;
};
export const storages: Storage[] = [
  {
    id: scopedId("player"),
    campaign_id: campaignId,
    label: "Player",
    kind: "player",
    entityId: scopedId("james"),
    accessible: true,
  },
  {
    id: scopedId("jinn-pack"),
    campaign_id: campaignId,
    label: "Jinn’s belongings",
    kind: "companion",
    entityId: scopedId("jinn"),
    accessible: true,
  },
  {
    id: scopedId("stash"),
    campaign_id: campaignId,
    label: "Camp / Shared Stash",
    kind: "stash",
    accessible: false,
  },
  {
    id: scopedId("ford-cargo"),
    campaign_id: campaignId,
    label: "Old Ford cargo",
    kind: "transport",
    entityId: scopedId("ford"),
    accessible: false,
  },
];
export type InventoryItem = {
  id: string;
  campaign_id: string;
  name: string;
  category: string;
  quantity: number;
  icon: string;
  detail: string;
  mechanics: string;
  acquired: number;
  rarity: "Common" | "Uncommon" | "Legendary";
  ownerId: string;
  storageId: string;
  compatibleSlot?: string;
  equipped?: { entityId: string; slot: string };
  history?: string;
  ingredient?: "meat" | "water" | "coffee" | "vegetables";
  restSupply?: boolean;
};
const makeItem = (
  id: string,
  name: string,
  icon: string,
  detail: string,
  options: Partial<InventoryItem> = {},
): InventoryItem => ({
  id: scopedId(id),
  campaign_id: campaignId,
  name,
  category: "Gear",
  quantity: 1,
  icon,
  detail,
  mechanics: "No additional mechanical properties recorded.",
  acquired: 1,
  rarity: "Common",
  ownerId: scopedId("james"),
  storageId: scopedId("player"),
  ...options,
});
const wear = (slot: string) => ({ entityId: scopedId("james"), slot });
// One canonical preview collection. Existing item prose/mechanics are retained.
export const inventoryItems: InventoryItem[] = [
  ...originalItems.map((item): InventoryItem => ({
    ...item,
    id: scopedId(item.id),
    category:
      item.category === "Equipped"
        ? "Gear"
        : item.category === "Vehicle Storage"
          ? "Consumables"
          : item.category,
    rarity: ["revolver", "ward", "silver", "detonation"].includes(item.id)
      ? "Uncommon"
      : "Common",
    ownerId: scopedId("james"),
    storageId: scopedId(item.id === "supplies" ? "ford-cargo" : "player"),
    ...(item.id === "coat"
      ? { equipped: wear("coat") }
      : item.id === "revolver"
        ? { equipped: wear("main-hand") }
        : {}),
    ...(item.id === "supplies" ? { restSupply: true } : {}),
  })),
  makeItem(
    "hat",
    "Weathered hat",
    "UserRound",
    "Rain has softened the brim; James still tips it out of habit.",
    { equipped: wear("head") },
  ),
  makeItem(
    "amulet",
    "Pact amulet",
    "Sparkles",
    "A familiar weight beneath the collar. Some promises need no inscription.",
    {
      rarity: "Legendary",
      equipped: wear("neck"),
      history:
        "Sample history: the amulet has accompanied James and Jinn along the road for years. Its surface carries the wear of ordinary travel. This preview records only their known bond; its origin and any unrecorded powers remain unspecified. Legendary is an illustrative rarity, not newly established canon.",
    },
  ),
  makeItem(
    "trousers",
    "Travel trousers",
    "Shirt",
    "Sturdy seams, one careful patch, and dust in every fold.",
    { equipped: wear("legs") },
  ),
  makeItem(
    "belt",
    "Ammunition belt",
    "Package",
    "The leather remembers the shape of every cartridge.",
    { equipped: wear("belt") },
  ),
  makeItem(
    "boots",
    "Worn leather boots",
    "Shield",
    "Resoled more than once. There is still another road in them.",
    { equipped: wear("boots") },
  ),
  makeItem(
    "cup",
    "Travel cup",
    "Coffee",
    "A chipped enamel rim, warmed by a hundred roadside fires.",
    { ownerId: scopedId("jinn"), storageId: scopedId("jinn-pack") },
  ),
  makeItem(
    "rations",
    "Packed rest supplies",
    "Package",
    "Simple provisions set aside for a quiet halt.",
    { category: "Consumables", quantity: 2, restSupply: true },
  ),
  makeItem(
    "spare-coat",
    "Spare travel coat",
    "Shirt",
    "Folded against the cold, waiting for its next stretch of road.",
    { storageId: scopedId("stash"), compatibleSlot: "coat" },
  ),
  makeItem(
    "camp-rations",
    "Camp provisions",
    "Package",
    "Sealed packets waiting for the next safe stopping place.",
    {
      storageId: scopedId("stash"),
      category: "Consumables",
      quantity: 6,
      restSupply: true,
    },
  ),
  makeItem(
    "meat",
    "Known edible meat",
    "Utensils",
    "A labeled, preserved cut bought for the cooking pot.",
    {
      storageId: scopedId("stash"),
      category: "Consumables",
      quantity: 2,
      ingredient: "meat",
    },
  ),
  makeItem(
    "water",
    "Clean cooking water",
    "FlaskConical",
    "Water reserved for the kettle and the cooking pot.",
    {
      storageId: scopedId("stash"),
      category: "Consumables",
      quantity: 3,
      ingredient: "water",
    },
  ),
  makeItem(
    "coffee",
    "Coffee supplies",
    "Coffee",
    "The last of a fragrant packet from a roadside trader.",
    {
      storageId: scopedId("stash"),
      category: "Consumables",
      quantity: 1,
      ingredient: "coffee",
    },
  ),
];

export function itemsInStorage(campaignId: string, storageId: string) {
  return inventoryItems.filter(
    (item) => item.campaign_id === campaignId && item.storageId === storageId,
  );
}
export function equipmentFor(campaignId: string, entityId: string) {
  return inventoryItems.filter(
    (item) =>
      item.campaign_id === campaignId && item.equipped?.entityId === entityId,
  );
}
export function canAccessStorage(
  campaignId: string,
  storageId: string,
  campActive: boolean,
) {
  const storage = storages.find(
    (entry) => entry.campaign_id === campaignId && entry.id === storageId,
  );
  return (
    !!storage && (storage.kind === "stash" ? campActive : storage.accessible)
  );
}
export function transferPreview(
  campaignId: string,
  itemId: string,
  destinationId: string,
  quantity: number,
  campActive: boolean,
) {
  const item = inventoryItems.find(
    (entry) => entry.campaign_id === campaignId && entry.id === itemId,
  );
  const target = storages.find(
    (entry) => entry.campaign_id === campaignId && entry.id === destinationId,
  );
  if (
    !item ||
    !target ||
    target.id === item.storageId ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > item.quantity
  )
    return "Choose a valid item, destination, and quantity.";
  if (!canAccessStorage(campaignId, item.storageId, campActive))
    return "This source is unavailable. Stash withdrawal requires active long-rest camp; cargo requires proximity.";
  if (
    target.kind !== "stash" &&
    !canAccessStorage(campaignId, target.id, campActive)
  )
    return "This destination is not within reach.";
  return null;
}

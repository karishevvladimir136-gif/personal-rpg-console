import {
  entities,
  inventoryItems,
  storages,
  canAccessStorage,
} from "./inventory-model.ts";
import type { CampaignSettings } from "./campaign-settings.ts";

export type CampScenario = "quiet" | "unsafe";
export type CampDemo = { active: boolean; scenario: CampScenario };
export function transitionCamp(
  state: CampDemo,
  action: "enter" | "leave" | "complete",
): CampDemo {
  if (action === "enter")
    return state.scenario === "quiet" ? { ...state, active: true } : state;
  return { ...state, active: false };
}
export const campScenarios = [
  { value: "quiet", label: "Quiet shelter · entry available" },
  { value: "unsafe", label: "Unsafe surroundings · entry blocked" },
] as const;
export function restParticipants(campaignId: string) {
  return entities.filter(
    (entity) =>
      entity.campaign_id === campaignId &&
      entity.available &&
      ["player", "companion"].includes(entity.kind),
  );
}
export function restCost(
  settings: CampaignSettings,
  kind: "short" | "long",
  participants: string[],
) {
  const eligible = new Set(
    restParticipants(settings.campaign_id).map((entity) => entity.id),
  );
  return (
    [...new Set(participants)].filter((id) => eligible.has(id)).length *
    settings.difficulty[
      kind === "short" ? "shortRestSupplyCost" : "longRestSupplyCost"
    ]
  );
}
export function suppliesAt(
  campaignId: string,
  storageId: string,
  campActive: boolean,
) {
  if (!canAccessStorage(campaignId, storageId, campActive)) return 0;
  return inventoryItems
    .filter(
      (item) =>
        item.campaign_id === campaignId &&
        item.storageId === storageId &&
        item.restSupply,
    )
    .reduce((total, item) => total + item.quantity, 0);
}
export type Recipe = {
  id: string;
  campaign_id: string;
  name: string;
  kind: "meal" | "drink";
  servings: number;
  ingredients: {
    key: NonNullable<(typeof inventoryItems)[number]["ingredient"]>;
    label: string;
    quantity: number;
  }[];
  flavor: string;
  benefit: string;
  expiry: string;
};
// Authored, player-readable fixtures. They do not consume stock or apply effects.
export const recipes: Recipe[] = [
  {
    id: "long-road-west:grill",
    campaign_id: "long-road-west",
    name: "Roadside grilled meal",
    kind: "meal",
    servings: 2,
    ingredients: [{ key: "meat", label: "Known edible meat", quantity: 2 }],
    flavor: "A little smoke, a little patience, and something warm to share.",
    benefit:
      "Provisional sample: 2 temporary HP after the rest. No permanent increase; not an official D&D rule.",
    expiry:
      "Activates after completing this rest; expires at the next long rest. One meal benefit per character; another meal replaces it.",
  },
  {
    id: "long-road-west:stew",
    campaign_id: "long-road-west",
    name: "Simple camp stew",
    kind: "meal",
    servings: 2,
    ingredients: [
      { key: "meat", label: "Known edible meat", quantity: 1 },
      { key: "vegetables", label: "Suitable vegetables", quantity: 2 },
      { key: "water", label: "Clean cooking water", quantity: 1 },
    ],
    flavor:
      "A slow pot and an unhurried evening. Only known edible ingredients belong here.",
    benefit:
      "Provisional sample: 2 temporary HP after the rest. No permanent increase; not an official D&D rule.",
    expiry:
      "Activates after completing this rest; expires at the next long rest. One meal benefit per character; another meal replaces it.",
  },
  {
    id: "long-road-west:coffee",
    campaign_id: "long-road-west",
    name: "Camp coffee",
    kind: "drink",
    servings: 2,
    ingredients: [
      { key: "coffee", label: "Coffee supplies", quantity: 1 },
      { key: "water", label: "Clean cooking water", quantity: 1 },
    ],
    flavor:
      "Bitter, familiar, and worth holding in both hands. Coffee belongs to this sample setting.",
    benefit:
      "Provisional sample: +1 to one eligible skill check after the rest. Not an official D&D rule; no dice change in this preview.",
    expiry:
      "Activates after this rest; ends after one use or at the next long rest. One drink benefit per character; more coffee refreshes it, never stacks.",
  },
];
export function recipeAvailability(
  campaignId: string,
  recipe: Recipe,
  active: boolean,
  recipients: string[],
) {
  const validRecipients = restParticipants(campaignId).map(
    (entity) => entity.id,
  );
  const ingredients = recipe.ingredients.map((need) => {
    const sources = inventoryItems.filter(
      (item) =>
        item.campaign_id === campaignId &&
        item.ingredient === need.key &&
        canAccessStorage(campaignId, item.storageId, active),
    );
    return {
      ...need,
      available: sources.reduce((sum, item) => sum + item.quantity, 0),
      sources: [
        ...new Set(
          sources.map(
            (item) =>
              storages.find((storage) => storage.id === item.storageId)!.label,
          ),
        ),
      ],
    };
  });
  const recipientsValid =
    recipients.length > 0 &&
    recipients.length <= recipe.servings &&
    new Set(recipients).size === recipients.length &&
    recipients.every((id) => validRecipients.includes(id));
  return {
    ingredients,
    recipientsValid,
    canPrepare:
      recipe.campaign_id === campaignId &&
      active &&
      recipientsValid &&
      ingredients.every(
        (ingredient) => ingredient.available >= ingredient.quantity,
      ),
  };
}

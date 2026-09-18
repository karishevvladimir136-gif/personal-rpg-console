import { createCampaignSettings } from "./campaign-settings.ts";
import { initialDiceDemo, type DiceDemoState } from "./dice-preview.ts";
import { entities } from "./inventory-model.ts";
import type { CampDemo } from "./camp-preview.ts";

export function createCampaignPreview(campaignId: string) {
  return {
    campaignSettings: createCampaignSettings(campaignId),
    diceDemo: { ...initialDiceDemo } as DiceDemoState,
    notes: [] as string[],
    messages: [] as { text: string; ooc: boolean }[],
    conversations: {} as Record<string, string[]>,
    camp: { active: false, scenario: "quiet" } as CampDemo,
    inventoryStorage: `${campaignId}:player`,
    saved: false,
    destination: "",
  };
}
export type CampaignPreview = ReturnType<typeof createCampaignPreview>;
export function appendConversation(
  state: CampaignPreview,
  entityId: string,
  text: string,
): CampaignPreview {
  const entity = entities.find(
    (entry) =>
      entry.campaign_id === state.campaignSettings.campaign_id &&
      entry.id === entityId &&
      entry.available &&
      entry.kind === "companion",
  );
  if (!entity || !text.trim()) return state;
  return {
    ...state,
    conversations: {
      ...state.conversations,
      [entityId]: [...(state.conversations[entityId] || []), text.trim()],
    },
  };
}

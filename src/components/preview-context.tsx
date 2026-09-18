"use client";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import { usePathname } from "next/navigation";
import {
  campaignFromPath,
  campaignHref,
  connectedCampaigns,
  type CampaignScreen,
} from "@/lib/campaign-routing";
import {
  createCampaignPreview,
  appendConversation,
  type CampaignPreview,
} from "@/lib/preview-state";
import {
  updateCampaignSettings,
  type CampaignSettingsAction,
} from "@/lib/campaign-settings";
import { transitionCamp, type CampScenario } from "@/lib/camp-preview";
import type { Language } from "@/lib/i18n";

type Store = {
  records: Record<string, CampaignPreview>;
  update: (
    id: string,
    change: (previous: CampaignPreview) => CampaignPreview,
  ) => void;
  largeText: boolean;
  setLargeText: (value: boolean) => void;
  suggestions: boolean;
  setSuggestions: (value: boolean) => void;
};
const Context = createContext<Store | null>(null);
export function PreviewProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(() =>
    Object.fromEntries(
      connectedCampaigns.map((campaign) => [
        campaign.campaign_id,
        createCampaignPreview(campaign.campaign_id),
      ]),
    ),
  );
  const [largeText, setLargeText] = useState(false);
  const [suggestions, setSuggestions] = useState(false);
  const update = useCallback<Store["update"]>((id, change) => {
    setRecords((previous) =>
      previous[id] ? { ...previous, [id]: change(previous[id]) } : previous,
    );
  }, []);
  return (
    <Context.Provider
      value={{
        records,
        update,
        largeText,
        setLargeText,
        suggestions,
        setSuggestions,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("PreviewProvider is required");
  return value;
}
export function usePreview() {
  const store = usePreferences();
  const pathname = usePathname();
  const campaign = campaignFromPath(pathname);
  if (!campaign) throw new Error("A valid campaign route is required");
  const id = campaign.campaign_id;
  const state = store.records[id];
  const updateRecord = store.update;
  // Stable identity is essential: the dice playback effect must survive its own
  // phase update instead of disposing its pending reveal timer on each render.
  const setDiceDemo = useCallback(
    (value: SetStateAction<CampaignPreview["diceDemo"]>) => {
      updateRecord(id, (previous) => ({
        ...previous,
        diceDemo:
          typeof value === "function" ? value(previous.diceDemo) : value,
      }));
    },
    [id, updateRecord],
  );
  const update = (change: (previous: CampaignPreview) => CampaignPreview) =>
    store.update(id, change);
  function set<K extends keyof CampaignPreview>(
    key: K,
    value: SetStateAction<CampaignPreview[K]>,
  ) {
    update((previous) => ({
      ...previous,
      [key]:
        typeof value === "function"
          ? (value as (prior: CampaignPreview[K]) => CampaignPreview[K])(
              previous[key],
            )
          : value,
    }));
  }
  return {
    ...state,
    campaign,
    href: (screen: CampaignScreen) => (pathname.startsWith("/preview") ? "/preview" : "") + campaignHref(id, screen),
    largeText: store.largeText,
    suggestions: store.suggestions,
    setDiceDemo,
    setCampaignLanguage: (language: Language) =>
      update((previous) => ({
        ...previous,
        campaignSettings: updateCampaignSettings(previous.campaignSettings, {
          type: "language",
          value: language,
        }),
      })),
    changeCampaignSettings: (action: CampaignSettingsAction) =>
      update((previous) => ({
        ...previous,
        campaignSettings: updateCampaignSettings(
          previous.campaignSettings,
          action,
        ),
      })),
    addNote: (note: string) => set("notes", (previous) => [...previous, note]),
    addMessage: (message: { text: string; ooc: boolean }) =>
      set("messages", (previous) => [...previous, message]),
    setSaved: (value: boolean) => set("saved", value),
    setDestination: (value: string) => set("destination", value),
    setInventoryStorage: (value: string) => set("inventoryStorage", value),
    addConversation: (entityId: string, text: string) =>
      update((previous) => appendConversation(previous, entityId, text)),
    setCampScenario: (scenario: CampScenario) =>
      set("camp", (previous) =>
        previous.active ? previous : { ...previous, scenario },
      ),
    changeCamp: (action: "enter" | "leave" | "complete") =>
      set("camp", (previous) => transitionCamp(previous, action)),
  };
}

"use client";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { initialDiceDemo, type DiceDemoState } from "@/lib/dice-preview";
import { campaign } from "@/lib/mock-data";
import type { Language } from "@/lib/i18n";
import {
  createCampaignSettings,
  updateCampaignSettings,
  type CampaignSettings,
  type CampaignSettingsAction,
} from "@/lib/campaign-settings";
type PreviewState = {
  diceDemo: DiceDemoState;
  setDiceDemo: Dispatch<SetStateAction<DiceDemoState>>;
  campaignSettings: CampaignSettings;
  setCampaignLanguage: (language: Language) => void;
  changeCampaignSettings: (action: CampaignSettingsAction) => void;
  notes: string[];
  addNote: (note: string) => void;
  messages: { text: string; ooc: boolean }[];
  addMessage: (message: { text: string; ooc: boolean }) => void;
  saved: boolean;
  setSaved: (saved: boolean) => void;
  destination: string;
  setDestination: (destination: string) => void;
  largeText: boolean;
  setLargeText: (value: boolean) => void;
  suggestions: boolean;
  setSuggestions: (value: boolean) => void;
};
const Context = createContext<PreviewState | null>(null);
export function PreviewProvider({ children }: { children: ReactNode }) {
  const [diceDemo, setDiceDemo] = useState<DiceDemoState>(() => ({
    ...initialDiceDemo,
  }));
  const [campaignSettings, setCampaignSettings] = useState(() =>
    createCampaignSettings(campaign.campaign_id),
  );
  const [notes, setNotes] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ text: string; ooc: boolean }[]>(
    [],
  );
  const [saved, setSaved] = useState(false);
  const [destination, setDestination] = useState("");
  const [largeText, setLargeText] = useState(false);
  const [suggestions, setSuggestions] = useState(false);
  return (
    <Context.Provider
      value={{
        diceDemo,
        setDiceDemo,
        campaignSettings,
        setCampaignLanguage: (language) =>
          setCampaignSettings((previous) =>
            updateCampaignSettings(previous, {
              type: "language",
              value: language,
            }),
          ),
        changeCampaignSettings: (action) =>
          setCampaignSettings((previous) =>
            updateCampaignSettings(previous, action),
          ),
        notes,
        addNote: (note) => setNotes((previous) => [...previous, note]),
        messages,
        addMessage: (message) =>
          setMessages((previous) => [...previous, message]),
        saved,
        setSaved,
        destination,
        setDestination,
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
export function usePreview() {
  const value = useContext(Context);
  if (!value) throw new Error("PreviewProvider is required");
  return value;
}

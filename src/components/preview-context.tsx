"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { campaign } from "@/lib/mock-data";
import type { Language } from "@/lib/i18n";
type PreviewState = {
  campaignSettings: { campaign_id: string; language: Language };
  setCampaignLanguage: (language: Language) => void;
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
  const [campaignSettings, setCampaignSettings] = useState<{
    campaign_id: string;
    language: Language;
  }>({ campaign_id: campaign.campaign_id, language: "en" });
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
        campaignSettings,
        setCampaignLanguage: (language) =>
          setCampaignSettings((previous) => ({ ...previous, language })),
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

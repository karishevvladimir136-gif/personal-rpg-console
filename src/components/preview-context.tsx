"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
type PreviewState = {
  notes: string[];
  addNote: (note: string) => void;
  messages: string[];
  addMessage: (message: string) => void;
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
  const [notes, setNotes] = useState<string[]>([
    "Ask Jinn about the mark on the envelope when we’re somewhere quiet.",
  ]);
  const [messages, setMessages] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [destination, setDestination] = useState("");
  const [largeText, setLargeText] = useState(false);
  const [suggestions, setSuggestions] = useState(false);
  return (
    <Context.Provider
      value={{
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

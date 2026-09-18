"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translate, type Language } from "@/lib/i18n";
import { campaignFromPath } from "@/lib/campaign-routing";
import { usePathname } from "next/navigation";

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string | number, values?: Record<string, string | number>) => string;
};
const LanguageContext = createContext<LanguageState | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Phase 0: survives client navigation, resets to English on refresh.
  const [language, setLanguage] = useState<Language>("en");
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(
      language,
      campaignFromPath(pathname)
        ? "The Long Road West | Personal RPG Console"
        : "PERSONAL RPG CONSOLE",
    );
  }, [language, pathname]);
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: (key, values) => translate(language, key, values),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider is required");
  return value;
}

// Lets server-rendered boundaries retain their message keys in the response,
// while the displayed text follows the language selected in the client shell.
export function LocalizedText({ message }: { message: string }) {
  const { t } = useLanguage();
  return t(message);
}

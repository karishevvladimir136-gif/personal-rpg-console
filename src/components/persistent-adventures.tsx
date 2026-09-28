"use client";
import { useState } from "react";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { useLanguage } from "./language-context";
import { AdventuresPanel } from "./adventures/adventures-panel";
export function PersistentAdventures() {
  const { data, refresh } = useCampaignData(),
    { language } = useLanguage();
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  if (!data) return null;
  return (
    <AdventuresPanel
      key={data.campaign.id}
      snapshot={data}
      language={language}
      onDirty={setDirty}
      onSaved={refresh}
    />
  );
}

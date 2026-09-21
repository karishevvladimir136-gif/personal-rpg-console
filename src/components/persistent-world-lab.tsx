"use client";
import { useCampaignData } from "./persistence-context";
import { useLanguage } from "./language-context";
import { WorldLabPanel } from "./world-lab/world-lab-panel";

export function PersistentWorldLab() {
  const { data } = useCampaignData();
  const { language } = useLanguage();
  if (!data) return null;
  // A live timeline change must not remount or retarget an independent run.
  return (
    <WorldLabPanel
      key={data.campaign.id}
      campaignId={data.campaign.id}
      language={language}
    />
  );
}

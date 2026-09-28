"use client";
import { useCampaignData } from "./persistence-context";
import { useLanguage } from "./language-context";
import { TimelineExplorerPanel } from "./timeline-explorer/timeline-explorer-panel";

export function PersistentTimelineExplorer() {
  const { data, refresh } = useCampaignData();
  const { language } = useLanguage();
  if (!data) return null;
  return (
    <TimelineExplorerPanel
      key={data.campaign.id}
      snapshot={data}
      language={language}
      refreshSnapshot={refresh}
    />
  );
}

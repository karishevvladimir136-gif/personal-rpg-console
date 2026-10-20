"use client";

import { useEffect, useMemo } from "react";
import { useLanguage } from "../../language-context";
import { CampaignDataPreview } from "../../persistence-context";
import { CampaignShell, RegistryChrome, type CampaignScreenId, type LibraryScreenId } from "../../registry/shell";
import { PreviewImages } from "../../registry/live-images";
import { stage5Screens } from "@/lib/ui/preview/stage5-screens";
import { live2dDmSettings, live2dImages } from "@/lib/ui/preview/live2d-fixture";
import { battlePreview, type Fight } from "@/lib/ui/preview/live2d-battle-fixture";
import { BattleScreen } from "./battle-screen";

/** The synthetic battle preview: one fight at one round, nothing is sent. */
export function BattlePreview({ fight, round, view, lang }: { fight: Fight; round: number; view: "map" | "zones"; lang: "en" | "ru" | null }) {
  const language = lang ?? "ru";
  const { setLanguage } = useLanguage();
  useEffect(() => setLanguage(language), [language, setLanguage]);
  const sample = useMemo(() => battlePreview(fight, round), [fight, round]);
  const query = new URLSearchParams({ fight, round: String(round), view, ...(lang ? { lang } : {}) }).toString();
  const chrome = useMemo(() => ({
    href: (target: CampaignScreenId) => (target === "live" ? `/preview/live2d/battle?${query}` : `/preview/stage-5/${(stage5Screens as readonly string[]).includes(target) ? target : "game"}${lang ? `?lang=${lang}` : ""}`),
    libraryHref: (target: LibraryScreenId) => `/preview/stage-5/${target === "menu" ? "menu" : "campaigns"}`,
    current: "live" as CampaignScreenId,
    dmSettings: live2dDmSettings,
  }), [query, lang]);
  return (
    <RegistryChrome value={chrome}>
      <CampaignDataPreview snapshot={sample.snapshot} refresh={async () => {}}>
        <PreviewImages images={{ ...live2dImages, ...sample.pictures.images }} drawing={new Set()} board={sample.pictures.board}>
          <CampaignShell>
            <BattleScreen key={`${fight}:${round}:${view}`} snapshot={sample.snapshot} play={sample.play} board={sample.board} images={sample.pictures.images} preview initialMode={view} />
          </CampaignShell>
        </PreviewImages>
      </CampaignDataPreview>
    </RegistryChrome>
  );
}

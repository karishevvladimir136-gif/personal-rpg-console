"use client";

import { useEffect, useMemo } from "react";
import { useLanguage } from "../language-context";
import { CampaignDataPreview } from "../persistence-context";
import { CampaignShell, RegistryChrome, type CampaignScreenId, type LibraryScreenId } from "../registry/shell";
import { PreviewImages } from "../registry/live-images";
import { stage5Screens } from "@/lib/ui/preview/stage5-screens";
import type { Live2dLevel } from "@/lib/live2d/hierarchy";
import { LIVE2D_IDS, live2dBoard, live2dDmSettings, live2dImages, live2dPictures, live2dPlacements, live2dPlay, live2dSnapshot } from "@/lib/ui/preview/live2d-fixture";
import { Live2dScreen } from "./live2d-screen";

/** The synthetic 2D Live preview: sample records only, nothing is sent. */
export function Live2dPreview({ level, lang, travel }: { level: Live2dLevel | null; lang: "en" | "ru" | null; travel: boolean }) {
  const language = lang ?? "ru";
  const { setLanguage } = useLanguage();
  useEffect(() => setLanguage(language), [language, setLanguage]);
  const snapshot = useMemo(() => live2dSnapshot(), []);
  const play = useMemo(() => live2dPlay(), []);
  const query = new URLSearchParams({ ...(lang ? { lang } : {}) }).toString();
  const suffix = query ? `?${query}` : "";
  const chrome = useMemo(() => ({
    href: (target: CampaignScreenId) => (target === "live" ? `/preview/live2d${suffix}` : `/preview/stage-5/${(stage5Screens as readonly string[]).includes(target) ? target : "game"}${suffix}`),
    libraryHref: (target: LibraryScreenId) => `/preview/stage-5/${target === "menu" ? "menu" : "campaigns"}${suffix}`,
    current: "live" as CampaignScreenId,
    dmSettings: live2dDmSettings,
  }), [suffix]);
  const anchorId = level === "scene" ? LIVE2D_IDS.market : level === "town" ? LIVE2D_IDS.veresk : level === "district" ? LIVE2D_IDS.market : undefined;
  return (
    <RegistryChrome value={chrome}>
      <CampaignDataPreview snapshot={snapshot} refresh={async () => {}}>
        <PreviewImages images={{ ...live2dImages, ...live2dPictures.images }} drawing={new Set()} board={live2dPictures.board}>
          <CampaignShell>
            <Live2dScreen snapshot={snapshot} play={play} preview={{
              board: live2dBoard, placements: live2dPlacements, images: live2dPictures.images,
              level: level ?? undefined, anchorId: level === "district" ? LIVE2D_IDS.veresk : anchorId,
              travel: travel ? { fromId: LIVE2D_IDS.ford, toId: LIVE2D_IDS.veresk, minutes: 150 } : undefined,
            }} />
          </CampaignShell>
        </PreviewImages>
      </CampaignDataPreview>
    </RegistryChrome>
  );
}

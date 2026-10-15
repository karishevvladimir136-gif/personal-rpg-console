"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useLanguage } from "../language-context";
import { CampaignDataPreview } from "../persistence-context";
import { shovSample } from "@/lib/ui/preview/stage5-fixture";
import { noirSample } from "@/lib/ui/preview/stage5-noir";
import type { PreviewSample } from "@/lib/ui/preview/stage5-sample";
import { stage5Screens, type Stage5Screen, type Stage5Variant } from "@/lib/ui/preview/stage5-screens";
import { CampaignShell, LibraryShell, RegistryChrome, type CampaignScreenId, type LibraryScreenId } from "./shell";
import { PreviewImages } from "./live-images";
import { RegistryGame } from "./game-screen";

const samples: Record<Stage5Variant["world"], PreviewSample> = { shov: shovSample, noir: noirSample };
const libraryScreens: Record<string, LibraryScreenId> = { menu: "menu", campaigns: "campaigns", "new-campaign": "campaigns" };

/** One synthetic screen of Stage 5. Every record comes from a preview fixture. */
export function Stage5Preview({ screen, lang, variant }: { screen: Stage5Screen; lang: "en" | "ru" | null; variant: Stage5Variant }) {
  const sample = samples[variant.world];
  const language = lang ?? sample.language;
  const { setLanguage } = useLanguage();
  useEffect(() => setLanguage(language), [language, setLanguage]);
  const snapshot = useMemo(() => sample.snapshot(), [sample]);
  const play = useMemo(() => sample.play({ combat: variant.combat }), [sample, variant.combat]);
  const query = new URLSearchParams({ ...(variant.world === "noir" ? { world: "noir" } : {}), ...(lang ? { lang } : {}) }).toString();
  const suffix = query ? `?${query}` : "";
  const chrome = useMemo(() => ({
    href: (target: CampaignScreenId) => `/preview/stage-5/${(stage5Screens as readonly string[]).includes(target) ? target : "game"}${suffix}`,
    libraryHref: (target: LibraryScreenId) => `/preview/stage-5/${target === "menu" ? "menu" : "campaigns"}${suffix}`,
    current: screen in libraryScreens ? undefined : (screen as CampaignScreenId),
    libraryCurrent: libraryScreens[screen],
    dmSettings: sample.dmSettings,
  }), [suffix, screen, sample]);
  const refresh = async () => {};
  let content: ReactNode;
  if (screen in libraryScreens) {
    content = <LibraryShell><PreviewPlaceholder screen={screen} /></LibraryShell>;
  } else {
    const body = screen === "game" ? (
      <RegistryGame data={snapshot} preview={{
        play,
        playerMoment: variant.moment,
        diceOpen: variant.dice,
        asideOpen: variant.aside,
        adventure: sample.adventure(),
        live: sample.live(language),
      }} />
    ) : <PreviewPlaceholder screen={screen} />;
    content = <CampaignShell>{body}</CampaignShell>;
  }
  return (
    <RegistryChrome value={chrome}>
      <CampaignDataPreview snapshot={snapshot} refresh={refresh}>
        <PreviewImages images={sample.images} drawing={sample.drawing}>{content}</PreviewImages>
      </CampaignDataPreview>
    </RegistryChrome>
  );
}

function PreviewPlaceholder({ screen }: { screen: string }) {
  return <p style={{ padding: 24 }}>{screen}</p>;
}

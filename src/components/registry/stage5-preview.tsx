"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useLanguage } from "../language-context";
import { CampaignDataPreview } from "../persistence-context";
import { MainMenu } from "../main-menu";
import { AtlasMap } from "../atlas-map";
import { AdventuresPanel } from "../adventures/adventures-panel";
import { shovSample } from "@/lib/ui/preview/stage5-fixture";
import { noirSample } from "@/lib/ui/preview/stage5-noir";
import type { PreviewSample } from "@/lib/ui/preview/stage5-sample";
import { stage5Screens, type Stage5Screen, type Stage5Variant } from "@/lib/ui/preview/stage5-screens";
import type { AdventureCatalog } from "@/lib/adventures/contracts";
import type { AdventureTransport } from "@/lib/adventures/client";
import type { BootstrapTransport } from "@/lib/adventures/bootstrap-contracts";
import { CampaignShell, LibraryShell, RegistryChrome, type CampaignScreenId, type LibraryScreenId } from "./shell";
import { PreviewImages } from "./live-images";
import { PreviewAutopilot } from "./visual-autopilot";
import { RegistryGame } from "./game-screen";
import { RegistryCharacter } from "./character-screen";
import { RegistryParty } from "./party-screen";
import { RegistryCodex, RegistryJournal } from "./journal-codex";
import { RegistryHoldings } from "./holdings-screen";
import { RegistrySettings } from "./settings-screen";
import { RegistryCampaigns, RegistryNewCampaign } from "./library-screen";
import { RegistryChronicle } from "./chronicle";
import { Plate, useCopy } from "./primitives";

const samples: Record<Stage5Variant["world"], PreviewSample> = { shov: shovSample, noir: noirSample };
const libraryScreens: Record<string, LibraryScreenId> = { menu: "menu", campaigns: "campaigns", "new-campaign": "campaigns" };
const refuse = async (): Promise<never> => { throw new Error("Synthetic preview: nothing is sent."); };

/** One synthetic screen of Stage 5. Every record comes from a preview fixture. */
export function Stage5Preview({ screen, lang, variant }: { screen: Stage5Screen; lang: "en" | "ru" | null; variant: Stage5Variant }) {
  const sample = samples[variant.world];
  const language = lang ?? sample.language;
  const { setLanguage } = useLanguage();
  useEffect(() => setLanguage(language), [language, setLanguage]);
  const snapshot = useMemo(() => sample.snapshot(), [sample]);
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
    const body = screen === "menu" ? <MainMenu />
      : screen === "new-campaign" ? (
        <RegistryNewCampaign worlds={sample.worlds} preview initialStep={variant.step ?? 0} onClose={() => {}} onCreated={refresh} />
      ) : (
        <RegistryCampaigns preview={{
          campaigns: [...sample.library],
          snapshots: { [snapshot.campaign.id]: snapshot },
          dmSettings: Object.fromEntries(sample.library.map((campaign, index) => [campaign.id, {
            ...sample.dmSettings, campaignId: campaign.id, runtime: index === 1 ? "astra-primary-v1" as const : "dm-loop-v1" as const,
          }])),
          worlds: sample.worlds,
          href: (_id, target) => `/preview/stage-5/${(stage5Screens as readonly string[]).includes(target) ? target : "game"}${suffix}`,
        }} />
      );
    content = <LibraryShell>{body}</LibraryShell>;
  } else {
    content = <CampaignShell><CampaignScreen screen={screen} sample={sample} variant={variant} language={language} /></CampaignShell>;
  }
  return (
    <RegistryChrome value={chrome}>
      <CampaignDataPreview snapshot={snapshot} refresh={refresh}>
        <PreviewImages images={{ ...sample.images, ...sample.pictures.images }} drawing={sample.drawing} board={sample.pictures.board}>
          <PreviewAutopilot>{content}</PreviewAutopilot>
        </PreviewImages>
      </CampaignDataPreview>
    </RegistryChrome>
  );
}

function CampaignScreen({ screen, sample, variant, language }: { screen: Stage5Screen; sample: PreviewSample; variant: Stage5Variant; language: "en" | "ru" }) {
  const c = useCopy();
  const snapshot = useMemo(() => sample.snapshot(), [sample]);
  const play = useMemo(() => sample.play({ combat: variant.combat }), [sample, variant.combat]);
  switch (screen) {
    case "game":
      return <RegistryGame data={snapshot} preview={{
        play, playerMoment: variant.moment, diceOpen: variant.dice, asideOpen: variant.aside,
        adventure: sample.adventure(),
        // Polish 3 §2: the recording state — the text complete, no chips yet, the bookkeeper at work.
        live: variant.recording ? { ...sample.live(language), status: "recording", changes: [] } : sample.live(language),
      }} />;
    case "character":
    case "inventory":
      return <RegistryCharacter data={snapshot} play={play} initialTab={screen === "inventory" ? "inv" : "char"} preview={{ figure: sample.figure }} />;
    case "party":
      return <RegistryParty data={snapshot} play={play} onSaved={async () => {}} preview={{ talkTo: variant.talk ? sample.talkTo : null }} />;
    case "journal":
      return <RegistryJournal data={snapshot} />;
    case "codex":
      return <RegistryCodex data={snapshot} />;
    case "chronicle":
      return <RegistryChronicle data={snapshot} play={play} preview />;
    case "holdings":
      return <RegistryHoldings data={snapshot} initialId={variant.holding} />;
    case "settings":
      return <RegistrySettings data={snapshot} preview={{ providers: { fal: { configured: true, persistence: false } } }} />;
    case "map":
      return (
        <div style={{ display: "grid", gap: 14 }}>
          <Plate eyebrow={snapshot.campaign.title} title={c("Карта", "Map")} />
          <AtlasMap snapshot={snapshot} reviewOnly reviewPlacements={sample.placements} reviewPreset={{ artwork: sample.atlas ? "placeholder" : undefined }}
            reviewArtworkUrl={sample.atlas ?? undefined} reviewDestinationId={sample.course ?? undefined} />
        </div>
      );
    case "adventures":
      return <PreviewAdventures sample={sample} language={language} />;
    default:
      return null;
  }
}

/** The existing adventures flow over a read-only synthetic catalog. */
function PreviewAdventures({ sample, language }: { sample: PreviewSample; language: "en" | "ru" }) {
  const snapshot = useMemo(() => sample.snapshot(), [sample]);
  const adventure = sample.adventure();
  const catalog: AdventureCatalog = {
    campaignId: snapshot.campaign.id, timeline: snapshot.timeline!, revision: 3, runtimeRevision: 7, expectedHeadId: null,
    worldBinding: { worldId: sample.worlds.worlds[0].id, worldVersion: sample.worlds.worlds[0].version, title: sample.worlds.worlds[0].title },
    activeAdventureId: adventure?.id ?? null, adventures: adventure ? [adventure] : [], history: adventure ? [adventure] : [],
    canChange: false, detachedPlayable: false,
  };
  const transport: AdventureTransport = { worlds: async () => sample.worlds, read: async () => structuredClone(catalog), send: refuse, createWorld: refuse, newHero: refuse };
  const bootstrap: BootstrapTransport = { proposeCharacter: refuse, createCharacter: refuse, proposeOpening: refuse, startOpening: refuse };
  return (
    <AdventuresPanel snapshot={snapshot} language={language} onDirty={() => {}} onSaved={async () => {}} initialCatalog={catalog}
      initialWorlds={sample.worlds} persistPending={false} transport={transport} bootstrapTransport={bootstrap} />
  );
}

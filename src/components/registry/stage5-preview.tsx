"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../language-context";
import { CampaignDataPreview } from "../persistence-context";
import { MainMenu } from "../main-menu";
import { AtlasMap } from "../atlas-map";
import { AdventuresPanel } from "../adventures/adventures-panel";
import { PREVIEW_IDS, previewGalleryTurns, shovSample } from "@/lib/ui/preview/stage5-fixture";
import { previewEnded } from "@/lib/ui/preview/stage5-ending";
import { noirSample } from "@/lib/ui/preview/stage5-noir";
import type { PreviewSample } from "@/lib/ui/preview/stage5-sample";
import { stage5Screens, type Stage5Screen, type Stage5Variant } from "@/lib/ui/preview/stage5-screens";
import { previewTelling } from "@/lib/ui/preview/stage5-turn";
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
import { RegistryOwner } from "./owner-screen";
import { RegistryPictures } from "./pictures-screen";
import { SessionEnd } from "./session-end";
import { previewDmView, previewOwnerPlay } from "@/lib/ui/preview/owner-fixture";
import { Plate, useCopy } from "./primitives";
import { PersistentGeneralSettings } from "../persistent-settings";
import { DmCraftOwner } from "../dm-craft-owner";
import { PersistentLibrary } from "../persistent-documents";
import { previewCraftView } from "@/lib/ui/preview/dm-craft-fixture";
import type { ProviderSettings } from "@/lib/production/configuration-contracts";

const samples: Record<Stage5Variant["world"], PreviewSample> = { shov: shovSample, noir: noirSample };
const libraryScreens: Record<string, LibraryScreenId> = { menu: "menu", campaigns: "campaigns", "new-campaign": "campaigns", general: "settings", craft: "dm-craft" };
const libraryPreviewScreen: Record<LibraryScreenId, string> = { menu: "menu", campaigns: "campaigns", settings: "general", "dm-craft": "craft", "world-library": "campaigns" };
// Fix run after session 2 (item 4): the provider flags of the General settings preview — synthetic, no keys.
const previewProviders: ProviderSettings = {
  schemaVersion: 1,
  providers: [
    { id: "openai", label: "OpenAI", status: "configured_not_tested" },
    { id: "anthropic", label: "Anthropic", status: "configured_not_tested" },
    { id: "fal", label: "fal", status: "unavailable" },
  ],
  models: ["gpt-6-astra", "gpt-6-sol", "gpt-5.4", "gpt-5.4-mini"].map((model) => ({ providerId: "openai", id: model, label: model, reasoning: ["low", "medium", "high"] })),
  globalDefault: { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" },
  globalDefaultStatus: "configured_not_tested",
};
const refuse = async (): Promise<never> => { throw new Error("Synthetic preview: nothing is sent."); };

/** One synthetic screen of Stage 5. Every record comes from a preview fixture. */
export function Stage5Preview({ screen, lang, variant }: { screen: Stage5Screen; lang: "en" | "ru" | null; variant: Stage5Variant }) {
  const sample = samples[variant.world];
  const language = lang ?? sample.language;
  const { setLanguage } = useLanguage();
  useEffect(() => setLanguage(language), [language, setLanguage]);
  const flags = useSearchParams();
  // Fix run E: the session-close preview (?cards=1 the long form, else the short one) reads the ended session.
  const endingForm = screen === "ending" ? (flags.get("cards") === "1" ? "cards" as const : "short" as const) : null;
  const snapshot = useMemo(() => (endingForm ? previewEnded(sample.snapshot(), endingForm) : sample.snapshot()), [sample, endingForm]);
  const query = new URLSearchParams({ ...(variant.world === "noir" ? { world: "noir" } : {}), ...(lang ? { lang } : {}) }).toString();
  const suffix = query ? `?${query}` : "";
  // Fix run after session 2: ?large=1 turns «Крупный текст истории» on; ?drawing=1 shows the scene header drawing.
  const largeText = flags.get("large") === "1" ? true : undefined;
  const chrome = useMemo(() => ({
    href: (target: CampaignScreenId) => `/preview/stage-5/${(stage5Screens as readonly string[]).includes(target) ? target : "game"}${suffix}`,
    libraryHref: (target: LibraryScreenId) => `/preview/stage-5/${libraryPreviewScreen[target] ?? "campaigns"}${suffix}`,
    current: screen in libraryScreens ? undefined : (screen as CampaignScreenId),
    libraryCurrent: libraryScreens[screen],
    dmSettings: sample.dmSettings,
    largeText,
  }), [suffix, screen, sample, largeText]);
  const drawingPlace = flags.get("drawing") === "1" ? snapshot.publicState.current_location_id : null;
  const images = useMemo(() => {
    const all = { ...sample.images, ...sample.pictures.images };
    if (drawingPlace) delete all[drawingPlace];
    return all;
  }, [sample, drawingPlace]);
  const drawing = useMemo(() => (drawingPlace ? new Set([...sample.drawing, drawingPlace]) : sample.drawing), [sample, drawingPlace]);
  const refresh = async () => {};
  let content: ReactNode;
  if (screen in libraryScreens) {
    const body = screen === "menu" ? <MainMenu />
      : screen === "general" ? (
        <PersistentGeneralSettings preview={{ preferences: { language, largeText: flags.get("large") === "1", suggestions: false, revision: 1, updated_at: "2026-10-19T12:00:00.000Z" }, providers: previewProviders }} />
      ) : screen === "craft" ? <DmCraftOwner previewView={previewCraftView} previewOpenKey={flags.get("card") === "1" ? "afterglow-rhythm" : undefined} />
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
        <PreviewImages images={images} drawing={drawing} board={sample.pictures.board}>
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
  const flags = useSearchParams();
  switch (screen) {
    case "game": {
      // Stage C: the turn being told — text, rolls in place, the named pause (?combat=1 waits for the hero's roll,
      // ?recording=1 is told to the end while the records are written).
      const told = previewTelling(variant.world, variant, sample.live(language));
      return <RegistryGame data={snapshot} preview={{
        play, playerMoment: variant.moment, diceOpen: variant.dice, asideOpen: variant.aside,
        adventure: sample.adventure(), live: told.live, telling: told.telling,
      }} />;
    }
    case "character":
    case "inventory": {
      // Fix S2, stage D shots: ?spells=1 opens the spells tab, ?companion=1 a companion's sheet from a stat block,
      // ?card=1 the card of the thing in the main hand.
      const hero = snapshot.entities.find((row) => row.kind === "player");
      const companion = flags.get("companion") === "1"
        ? snapshot.entities.find((row) => row.kind === "companion" && (row.character_sheet as { schemaVersion?: number } | null)?.schemaVersion === 2) ?? null : null;
      const member = companion ?? hero ?? null;
      const card = flags.get("card") === "1" && member ? snapshot.items.find((row) => row.equipped_entity_id === member.id && row.equipped_slot === "hand")?.id ?? null : null;
      return <RegistryCharacter data={snapshot} play={play} initialTab={screen === "inventory" ? "inv" : flags.get("spells") === "1" ? "spells" : "char"}
        preview={{ figure: sample.figure, memberId: companion?.id ?? null, itemId: card }} />;
    }
    case "party":
      return <RegistryParty data={snapshot} play={play} onSaved={async () => {}} preview={{ talkTo: variant.talk ? sample.talkTo : null }} />;
    case "journal":
      return <RegistryJournal data={snapshot} />;
    case "codex":
      return <RegistryCodex data={snapshot} />;
    case "chronicle":
      return <RegistryChronicle data={snapshot} play={play} preview />;
    case "holdings":
      return <RegistryHoldings data={snapshot} initialId={variant.holding} play={play} />;
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
    case "library":
      // Fix run after session 2 (item 25): ?doc=1 opens the DM guide, ?edit=1 its editor (nothing is saved).
      return <PersistentLibrary initialDocumentId={flags.get("doc") === "1" ? snapshot.dmGuideDocumentId : flags.get("doc")} initialEditing={flags.get("edit") === "1"} />;
    case "owner":
      return <RegistryOwner data={snapshot} play={previewOwnerPlay(play)} preview={{ view: previewDmView }} />;
    case "gallery":
      // Fix run E (item 80): every frame in story order by session (the earlier sessions' turns are the gallery's own).
      return <RegistryPictures data={snapshot} play={{ ...play, turns: [...previewGalleryTurns, ...play.turns] }} />;
    case "ending":
      return (
        <div style={{ display: "grid", gap: 14 }}>
          <Plate eyebrow={snapshot.campaign.title} title={c("Конец сессии", "Session end")} />
          <SessionEnd sessionId={PREVIEW_IDS.session7} />
        </div>
      );
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

import { notFound } from "next/navigation";
import { PersistentLibrary } from "@/components/persistent-documents";
import {
  PersistentGame,
  PersistentSupporting,
} from "@/components/persistent-game";
import { PersistentDmChat } from "@/components/persistent-dm-chat";
import { PersistentSaves } from "@/components/persistent-saves";
import { PersistentWorldLab } from "@/components/persistent-world-lab";
import { PersistentTimelineExplorer } from "@/components/persistent-timeline-explorer";
import { PersistentPlacesBelonging } from "@/components/persistent-places-belonging";
import { PersistentAdventures } from "@/components/persistent-adventures";
import { PersistentSecondaryPage } from "@/components/persistent-secondary-pages";
import {
  CharacterRoute,
  CodexRoute,
  HoldingsRoute,
  JournalRoute,
  OwnerRoute,
  PartyRoute,
  PicturesRoute,
  SettingsRoute,
} from "@/components/registry/routes";
import { ChronicleRoute } from "@/components/registry/chronicle";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string; screen: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { screen } = await params;
  // Fix run after session 2 (item 26): «?doc=<id>» opens that document in the Library (the settings' DM guide link).
  const doc = (await searchParams).doc;
  switch (screen) {
    // Polish 2 §6: the gallery and the visual bible are one «Картинки» page; the old addresses still open it.
    case "pictures":
    case "frame":
    case "gallery":
      return <PicturesRoute />;
    // Fix run F (item 24): the old hand-made loot and containers panel is gone from «Приключения» (the DM places
    // things itself; it stays under the settings' advanced section).
    case "adventures":
      return <PersistentAdventures />;
    case "timeline":
      return <PersistentTimelineExplorer />;
    case "home":
      return <PersistentPlacesBelonging />;
    case "world":
      return <PersistentWorldLab />;
    case "saves":
      return <PersistentSaves />;
    case "dm-chat":
      return <PersistentDmChat />;
    case "game":
      return <PersistentGame />;
    case "character":
      return <CharacterRoute tab="char" />;
    case "inventory":
      return <CharacterRoute tab="inv" />;
    case "party":
      return <PartyRoute />;
    case "codex":
      return <CodexRoute />;
    case "holdings":
      return <HoldingsRoute />;
    case "library":
      return <PersistentLibrary initialDocumentId={typeof doc === "string" ? doc : null} />;
    case "settings":
      return <SettingsRoute />;
    case "journal":
      return <JournalRoute />;
    case "chronicle":
      return <ChronicleRoute />;
    case "owner":
      return <OwnerRoute />;
    case "sessions":
    case "map":
      return <PersistentSecondaryPage screen={screen} />;
    case "camp":
      return <PersistentSupporting screen={screen} />;
    default:
      notFound();
  }
}

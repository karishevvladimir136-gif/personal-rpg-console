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
import { PersistentMediaVisualFrame } from "@/components/persistent-visual-frame";
import { PersistentAdventures } from "@/components/persistent-adventures";
import { PersistentAdventureLoot } from "@/components/persistent-adventure-loot";
import { PersistentSecondaryPage } from "@/components/persistent-secondary-pages";
import {
  CharacterRoute,
  CodexRoute,
  HoldingsRoute,
  JournalRoute,
  PartyRoute,
  SettingsRoute,
} from "@/components/registry/routes";
import { ChronicleRoute } from "@/components/registry/chronicle";

export default async function Page({
  params,
}: {
  params: Promise<{ campaignId: string; screen: string }>;
}) {
  const { screen } = await params;
  switch (screen) {
    case "frame":
      return <PersistentMediaVisualFrame />;
    case "adventures":
      return (
        <>
          <PersistentAdventures />
          <PersistentAdventureLoot />
        </>
      );
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
      return <PersistentLibrary />;
    case "settings":
      return <SettingsRoute />;
    case "journal":
      return <JournalRoute />;
    case "chronicle":
      return <ChronicleRoute />;
    case "sessions":
    case "map":
    case "gallery":
      return <PersistentSecondaryPage screen={screen} />;
    case "camp":
      return <PersistentSupporting screen={screen} />;
    default:
      notFound();
  }
}

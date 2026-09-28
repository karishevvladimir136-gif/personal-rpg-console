import { notFound } from "next/navigation";
import { PersistentLibrary } from "@/components/persistent-documents";
import { PersistentCampaignSettings } from "@/components/persistent-settings";
import {
  PersistentCharacter,
  PersistentInventory,
  PersistentParty,
} from "@/components/persistent-records";
import {
  PersistentGame,
  PersistentSessions,
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
      return <PersistentCharacter />;
    case "inventory":
      return <PersistentInventory />;
    case "party":
      return <PersistentParty />;
    case "library":
      return <PersistentLibrary />;
    case "settings":
      return <PersistentCampaignSettings />;
    case "sessions":
      return <PersistentSessions />;
    case "journal":
    case "map":
    case "gallery":
    case "camp":
      return <PersistentSupporting screen={screen} />;
    default:
      notFound();
  }
}

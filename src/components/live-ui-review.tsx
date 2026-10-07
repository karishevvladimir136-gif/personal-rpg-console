"use client";

import { useState } from "react";
import fixture from "@/lib/v1-completion/preview-fixtures.json";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { CampaignDataPreview } from "./persistence-context";
import { PersistentShell } from "./persistent-shell";
import { CampaignCardsReview } from "./persistent-campaigns";
import { PersistentGame } from "./persistent-game";
import {
  PersistentCharacter,
  PersistentInventory,
  PersistentParty,
} from "./persistent-records";
import { SecondaryPageView } from "./persistent-secondary-pages";
import { PersistentLibrary } from "./persistent-documents";
import { CampaignSettingsReview } from "./persistent-settings";
import { useLanguage } from "./language-context";
import { Button } from "./ui";

const screens = [
  "campaigns",
  "game",
  "character",
  "inventory",
  "party",
  "journal",
  "map",
  "library",
  "gallery",
  "sessions",
  "settings",
] as const;
type ReviewScreen = (typeof screens)[number];

function syntheticSnapshot(): CampaignSnapshot {
  const source = fixture.en.snapshot as unknown as CampaignSnapshot;
  const campaignId = source.campaign.id;
  const updated_at = source.campaign.updated_at;
  const id = (number: number) =>
    `11111111-1111-4111-8111-${String(number).padStart(12, "0")}`;
  const scoped = (number: number) => ({
    id: id(number),
    campaign_id: campaignId,
    revision: 1,
    updated_at,
  });
  const heroId = id(60);
  const heroStorageId = id(62);
  return {
    ...source,
    entities: [
      ...source.entities,
      {
        ...scoped(60),
        kind: "player",
        name: "Aven",
        details: "A harbor scout in a weathered coat, returning from the night watch.",
        hp: 8,
        max_hp: 10,
        stats: { level: 2, Agility: 3, Insight: 2 },
        resources: { Focus: 1 },
        conditions: [],
        equipment_slots: [
          { id: "main-hand", label: "Main hand", accepts: ["weapon"] },
          { id: "body", label: "Body", accepts: ["armor"] },
          { id: "pack", label: "Pack", accepts: ["gear"] },
        ],
      },
      {
        ...scoped(61),
        kind: "companion",
        name: "Ilya",
        details: "A fellow watchkeeper who remembers the old ferry crossing.",
        hp: 6,
        max_hp: 8,
        stats: {},
        resources: {},
        conditions: [],
        equipment_slots: [],
      },
    ],
    storages: [
      ...source.storages,
      {
        ...scoped(62),
        name: "Aven's pack",
        kind: "player",
        entity_id: heroId,
      },
    ],
    items: [
      {
        ...scoped(63),
        name: "Short sword",
        category: "weapon",
        quantity: 1,
        description: "A plain, serviceable blade with a worn leather grip.",
        mechanics: "Ordinary short sword.",
        owner_entity_id: heroId,
        storage_id: heroStorageId,
        equipped_entity_id: heroId,
        equipped_slot: "main-hand",
      },
      {
        ...scoped(64),
        name: "Oil flask",
        category: "supply",
        quantity: 1,
        description: "A small sealed flask of lamp oil.",
        mechanics: "No special property recorded.",
        owner_entity_id: heroId,
        storage_id: heroStorageId,
        equipped_entity_id: null,
        equipped_slot: null,
      },
      {
        ...scoped(65),
        name: "Harbor chart",
        category: "document",
        quantity: 1,
        description: "A public chart of the nearby shoreline.",
        mechanics: "No special property recorded.",
        owner_entity_id: null,
        storage_id: source.storages[0].id,
        equipped_entity_id: null,
        equipped_slot: null,
      },
    ],
    locations: [
      ...source.locations,
      {
        ...scoped(66),
        name: "Old Bridge",
        description: "A known stone crossing above the tidal channel.",
        status: "visited",
      },
      {
        ...scoped(67),
        name: "North Watchtower",
        description: "A watchtower visible from the harbor road.",
        status: "known",
      },
    ],
    quests: [
      ...source.quests,
      {
        ...scoped(68),
        title: "Follow the lantern signal",
        description: "Find out why the north tower signaled after midnight.",
        status: "open",
      },
    ],
    documents: [
      ...source.documents,
      {
        ...scoped(69),
        title: "The Lantern Room",
        status: "canon",
        current_version_id: id(72),
        body: "The Lantern Room overlooks the harbor. A repaired lantern burns on its table.",
      },
      {
        ...scoped(70),
        title: "Harbor watch notes",
        status: "reference",
        current_version_id: id(73),
        body: "A public sketch of the watch route, the Old Bridge, and the North Watchtower.",
      },
      {
        ...scoped(71),
        title: "First patrol notes",
        status: "archived",
        current_version_id: id(74),
        body: "An earlier draft of the patrol's route through the harbor.",
      },
    ],
  };
}

/** Synthetic public data only. This route never loads an owner campaign. */
export function LiveUiReview({ initialScreen }: { initialScreen: string }) {
  const { t } = useLanguage();
  const [screen, setScreen] = useState<ReviewScreen>(
    screens.includes(initialScreen as ReviewScreen)
      ? (initialScreen as ReviewScreen)
      : "campaigns",
  );
  const snapshot = syntheticSnapshot();
  const content =
    screen === "game" ? (
      <PersistentGame reviewOnly />
    ) : screen === "character" ? (
      <PersistentCharacter reviewOnly />
    ) : screen === "inventory" ? (
      <PersistentInventory reviewOnly />
    ) : screen === "party" ? (
      <PersistentParty reviewOnly />
    ) : screen === "journal" ||
      screen === "map" ||
      screen === "gallery" ||
      screen === "sessions" ? (
      <SecondaryPageView screen={screen} data={snapshot} reviewOnly />
    ) : screen === "library" ? (
      <PersistentLibrary reviewOnly />
    ) : (
      <CampaignSettingsReview snapshot={snapshot} />
    );
  return (
    <CampaignDataPreview snapshot={snapshot} refresh={async () => {}}>
      {screen === "campaigns" ? (
        <div className="app-level-shell">
          <header className="app-level-header">
            <span className="brand">✧ {t("PERSONAL RPG CONSOLE")}</span>
          </header>
          <main id="main">
            <p className="preview-indicator">
              {t("SYNTHETIC UI REVIEW · no owner data or gameplay")}
            </p>
            <div className="page-heading">
              <div>
                <span className="eyebrow">{t("YOUR STORIES, WAITING")}</span>
                <h1>{t("My Campaigns")}</h1>
                <p>{t("Worlds to explore. Stories to remember.")}</p>
              </div>
              <Button primary disabled>{t("New Campaign")}</Button>
            </div>
            <CampaignCardsReview
              campaigns={[snapshot.campaign]}
              snapshots={{ [snapshot.campaign.id]: snapshot }}
            />
          </main>
        </div>
      ) : (
        <PersistentShell
          reviewNavigation={{
            screen,
            navigate: (next) => setScreen(next as ReviewScreen),
            basePath: "/preview/live-ui",
          }}
        >
          <p className="preview-indicator">
            {t("SYNTHETIC UI REVIEW · no owner data or gameplay")}
          </p>
          {content}
        </PersistentShell>
      )}
    </CampaignDataPreview>
  );
}

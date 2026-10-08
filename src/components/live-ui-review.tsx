"use client";

import { useState } from "react";
import fixture from "@/lib/v1-completion/preview-fixtures.json";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { MapPlacement } from "@/lib/map/placement-contracts";
import { buildMapVisualJob, MAP_VISUAL_ASSET_PREFIX } from "@/lib/visual-frame/map-job";
import { buildRealFrame } from "@/lib/visual-frame/real-frame";
import { buildSubjectVisualJob, SUBJECT_VISUAL_ASSET_PREFIX } from "@/lib/visual-frame/subject-job";
import { VISUAL_FRAME_PREFIX } from "@/lib/visual-frame/model";
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
    // Keep review additions isolated across SSR requests, hydration, and HMR.
    assets: source.assets.filter((asset) => asset.id !== id(95)),
    entities: [
      ...source.entities,
      {
        ...scoped(60),
        kind: "player",
        name: "Aven",
        details: "A harbor scout in a weathered coat, returning from the night watch.",
        hp: 8,
        max_hp: 10,
        stats: { attack: 1, defense: 11, skill: 2 },
        character_sheet: {
          schemaVersion: 1,
          mode: "structured_rpg",
          role: "Harbor scout",
          background: "A watchkeeper who knows the old crossings and the harbor's changing tides.",
          level: null,
          tier: null,
          attributes: {
            strength: 11,
            dexterity: 15,
            constitution: 12,
            intelligence: 10,
            wisdom: 14,
            charisma: 9,
          },
          skills: ["Trail reading", "Night watch", "River crossings"],
          abilities: ["Careful observation", "Steady under pressure"],
          limitations: ["Needs clear light for distant signs"],
          spells: [],
        },
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
      {
        ...scoped(80),
        name: "Harbor Reach",
        description: "The known coast around the harbor and its inland watch roads.",
        status: "visited",
      },
      {
        ...scoped(81),
        name: "Far Isles",
        description: "Islands named on the public harbor chart; their shores remain unfamiliar.",
        status: "known",
      },
      {
        ...scoped(82),
        name: "Lantern Ward",
        description: "The harbor quarter of repair shops and night watch posts.",
        status: "visited",
      },
      {
        ...scoped(83),
        name: "North Cliffs",
        description: "The raised coast near the watchtower.",
        status: "known",
      },
      {
        ...scoped(84),
        name: "Old Beacon",
        description: "An older beacon known by name, with no map position recorded.",
        status: "known",
      },
      {
        ...scoped(85),
        name: "Isle Haven",
        description: "A public harbor marked among the Far Isles.",
        status: "known",
      },
      {
        ...scoped(86),
        name: "South Landing",
        description: "The landing at Isle Haven.",
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

function syntheticMapPlacements(snapshot: CampaignSnapshot): MapPlacement[] {
  const id = (number: number) =>
    `11111111-1111-4111-8111-${String(number).padStart(12, "0")}`;
  const make = (
    locationId: string,
    level: MapPlacement["level"],
    parentLocationId: string | null,
    x: number,
    y: number,
  ): MapPlacement => ({
    campaign_id: snapshot.campaign.id,
    location_id: locationId,
    level,
    parent_location_id: parentLocationId,
    x,
    y,
    revision: 1,
    updated_at: snapshot.campaign.updated_at,
  });
  return [
    make(id(80), "world", null, 0.37, 0.47),
    make(id(81), "world", null, 0.75, 0.61),
    make(id(82), "region", id(80), 0.42, 0.58),
    make(id(83), "region", id(80), 0.73, 0.27),
    make(id(85), "region", id(81), 0.58, 0.47),
    make(snapshot.publicState.current_location_id!, "local", id(82), 0.39, 0.54),
    make(id(66), "local", id(82), 0.73, 0.36),
    make(id(67), "local", id(83), 0.58, 0.36),
    make(id(86), "local", id(85), 0.62, 0.61),
  ];
}

/** Synthetic accepted metadata for inspecting real scene and equipped-art components. */
function addSyntheticAcceptedSceneAndItem(snapshot: CampaignSnapshot) {
  const id = (number: number) =>
    `11111111-1111-4111-8111-${String(number).padStart(12, "0")}`;
  const model = "gpt-image-2.5-sunburst-2026-09-08";
  const parameters = { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 } as const;
  const basis = { expectedHeadId: null, canonGeneration: 0 };
  const frameId = id(101);
  const frameVersionId = id(102);
  const frameDispatchId = id(103);
  const frame = buildRealFrame(snapshot, [], "wide", model, parameters, basis);
  const acceptedFrame = {
    ...frame,
    status: "completed" as const,
    resultAssetId: frameId,
    dispatch: { requestId: frameDispatchId, reservationUsdMicros: 400000 },
    review: { status: "safe_to_review" as const, imageSha256: "b".repeat(64) },
  };
  snapshot.documents.push({
    id: frameId,
    campaign_id: snapshot.campaign.id,
    revision: 4,
    updated_at: snapshot.campaign.updated_at,
    current_version_id: frameVersionId,
    title: "Synthetic accepted scene art",
    status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(acceptedFrame),
  });
  const frameOutput = {
    storagePath: `${snapshot.campaign.id}/frames/${frameId}/output.png`,
    sha256: "b".repeat(64),
    bytes: 100,
    contentType: "image/png" as const,
    usage: null,
    providerRequestId: "synthetic_ui_only",
  };
  snapshot.assets.push({
    id: frameId,
    campaign_id: snapshot.campaign.id,
    revision: 1,
    updated_at: snapshot.campaign.updated_at,
    title: "Synthetic accepted scene art",
    kind: "image",
    storage_path: frameOutput.storagePath,
    description: "RPG_OWNER_FRAME_ASSET_V1\n" + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: frameId,
      job_version_id: frameVersionId,
      scene_id: frame.basis.scene.id,
      scene_revision: frame.basis.scene.revision,
      timeline: frame.basis.timeline,
      provider: "OpenAI",
      model,
      dispatchRequestId: frameDispatchId,
      output: frameOutput,
      ownerApproval: { requestId: id(104), draftVersionId: frameVersionId },
    }),
  });

  const itemId = id(63);
  const itemJobId = id(105);
  const itemVersionId = id(106);
  const itemDispatchId = id(107);
  const itemJob = buildSubjectVisualJob(
    snapshot, { kind: "item", id: itemId }, [], model, parameters, basis,
  );
  const acceptedItem = {
    ...itemJob,
    status: "completed" as const,
    resultAssetId: itemJobId,
    dispatch: { requestId: itemDispatchId, reservationUsdMicros: 400000 },
    review: { status: "safe_to_review" as const, imageSha256: "c".repeat(64) },
  };
  snapshot.documents.push({
    id: itemJobId,
    campaign_id: snapshot.campaign.id,
    revision: 4,
    updated_at: snapshot.campaign.updated_at,
    current_version_id: itemVersionId,
    title: "Synthetic accepted sword art",
    status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(acceptedItem),
  });
  const itemOutput = {
    storagePath: `${snapshot.campaign.id}/frames/${itemJobId}/output.png`,
    sha256: "c".repeat(64),
    bytes: 100,
    contentType: "image/png" as const,
    usage: null,
    providerRequestId: "synthetic_ui_only",
  };
  snapshot.assets.push({
    id: itemJobId,
    campaign_id: snapshot.campaign.id,
    revision: 1,
    updated_at: snapshot.campaign.updated_at,
    title: "Synthetic accepted sword art",
    kind: "image",
    storage_path: itemOutput.storagePath,
    description: SUBJECT_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: itemJobId,
      job_version_id: itemVersionId,
      subject: itemJob.basis.subject,
      timeline: itemJob.basis.timeline,
      provider: "OpenAI",
      model,
      dispatchRequestId: itemDispatchId,
      output: itemOutput,
      ownerApproval: { requestId: id(108), draftVersionId: itemVersionId },
    }),
  });
}

/** A metadata-only accepted example. Review rendering uses CSS art and never requests stored pixels. */
function addSyntheticAcceptedMap(snapshot: CampaignSnapshot, placements: MapPlacement[]) {
  const id = (number: number) =>
    `11111111-1111-4111-8111-${String(number).padStart(12, "0")}`;
  const jobId = id(95);
  const versionId = id(96);
  const dispatchRequestId = id(97);
  const queued = buildMapVisualJob(
    snapshot,
    placements,
    "world",
    null,
    [],
    "gpt-image-2.5-sunburst-2026-09-08",
    { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 },
    { expectedHeadId: null, canonGeneration: 0 },
  );
  const output = {
    storagePath: `${snapshot.campaign.id}/frames/${jobId}/output.png`,
    sha256: "a".repeat(64),
    bytes: 100,
    contentType: "image/png" as const,
    usage: null,
    providerRequestId: "synthetic_ui_only",
  };
  const job = {
    ...queued,
    status: "completed" as const,
    resultAssetId: jobId,
    dispatch: { requestId: dispatchRequestId, reservationUsdMicros: 400000 },
    review: { status: "safe_to_review" as const, imageSha256: output.sha256 },
  };
  snapshot.documents.push({
    id: jobId,
    campaign_id: snapshot.campaign.id,
    revision: 4,
    updated_at: snapshot.campaign.updated_at,
    current_version_id: versionId,
    title: "Synthetic atlas example",
    status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(job),
  });
  snapshot.assets.push({
    id: jobId,
    campaign_id: snapshot.campaign.id,
    revision: 1,
    updated_at: snapshot.campaign.updated_at,
    title: "Harbor Reach atlas · synthetic example",
    kind: "image",
    storage_path: output.storagePath,
    description: MAP_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: jobId,
      job_version_id: versionId,
      level: "world",
      anchorLocationId: null,
      timeline: job.basis.timeline,
      provider: "OpenAI",
      model: job.model,
      dispatchRequestId,
      output,
      ownerApproval: { requestId: id(98), draftVersionId: versionId },
    }),
  });
}

/** Synthetic public data only. This route never loads an owner campaign. */
export function LiveUiReview({
  initialScreen,
  mapPreset,
  galleryTab,
}: {
  initialScreen: string;
  galleryTab?: "Maps";
  mapPreset?: {
    level?: "world" | "region" | "local";
    artwork?: "placeholder" | "collapsed";
    panel?: "edit-open" | "unplaced-open";
    detail?: boolean;
  };
}) {
  const { t } = useLanguage();
  const [screen, setScreen] = useState<ReviewScreen>(
    screens.includes(initialScreen as ReviewScreen)
      ? (initialScreen as ReviewScreen)
      : "campaigns",
  );
  const snapshot = syntheticSnapshot();
  addSyntheticAcceptedSceneAndItem(snapshot);
  const reviewMapPlacements = syntheticMapPlacements(snapshot);
  addSyntheticAcceptedMap(snapshot, reviewMapPlacements);
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
      <SecondaryPageView
        screen={screen}
        data={snapshot}
        reviewOnly
        reviewMapPlacements={reviewMapPlacements}
        reviewMapPreset={mapPreset}
        reviewGalleryTab={galleryTab}
      />
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

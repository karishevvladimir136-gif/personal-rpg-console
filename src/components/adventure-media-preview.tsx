"use client";
import { useMemo, useState } from "react";
import fixtures from "@/lib/v1-completion/preview-fixtures.json";
import type {
  CampaignSnapshot,
  DocumentRecord,
  DocumentVersion,
  Mutation,
  MutationResult,
} from "@/lib/persistence/contracts";
import type { PublicAdventure } from "@/lib/adventures/contracts";
import type { AdventureTransport } from "@/lib/adventures/client";
import type { MediaFrameTransport } from "@/lib/visual-frame/media-client";
import type { VideoResult, VideoTransport } from "@/lib/scene-video/client";
import type { SceneVideo } from "@/lib/scene-video/model";
import {
  buildSceneVideo,
  parseSceneVideo,
  safeVideoAsset,
  videoAssetMutation,
  videoDocumentMutation,
  videoIsCurrent,
  videoStoragePath,
  VIDEO_MODEL,
  VIDEO_PARAMETERS,
  VIDEO_RESERVATION_USD_MICROS,
} from "@/lib/scene-video/model";
import type {
  MediaCommand,
  MediaResult,
} from "@/lib/server/media/orchestration";
import type {
  FrameSourceAuthority,
  RealFrame,
} from "@/lib/visual-frame/real-frame";
import type {
  OwnerLootView,
  OwnerObjectInput,
} from "@/lib/adventure-loot/owner-contracts";
import type { FoundationLoopView } from "@/lib/foundation-loop/client-contracts";
import type { RewardIntegrityInput } from "@/lib/progression/reward-integrity-authority";
import {
  adventureTimeline,
  parseAdventureCatalog,
  parseAdventureCommand,
  parseWorldCatalog,
  parseWorldCommand,
} from "@/lib/adventures/validation";
import { validateMutation } from "@/lib/persistence/validation";
import { sameTimeline } from "@/lib/saves/fence";
import {
  buildRealFrame,
  IMAGE_MODELS,
  parseRealFrame,
  realFrameAssetMutation,
  realFrameDocumentMutation,
  realFrameIsCurrent,
  safeFrameAsset,
  validateRealFrameLifecycle,
  frameStoragePath,
} from "@/lib/visual-frame/real-frame";
import { VISUAL_FRAME_PREFIX } from "@/lib/visual-frame/model";
import { writeVisualFrame } from "@/lib/visual-frame/authority";
import {
  buildCreateOwnerObjectInput,
  buildEditOwnerObjectInput,
} from "@/lib/adventure-loot/owner-form";
import {
  ensure,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  uuid,
} from "@/lib/foundation-loop/fields";
import { AdventuresPanel } from "./adventures/adventures-panel";
import { NewHeroForm } from "./adventures/new-hero";
import { AdventureLootObjectsPanel } from "./adventure-loot/objects-panel";
import { RewardIntegrityOwner } from "./foundation-loop/reward-integrity-owner";
import { CampaignDataPreview } from "./persistence-context";
import { useLanguage } from "./language-context";
import { PersistentShell } from "./persistent-shell";
import { PersistentGame, PersistentSupporting } from "./persistent-game";
import { PersistentVisualFrame } from "./persistent-visual-frame";
import { Button } from "./ui";

type Language = "en" | "ru";
export type ScriptedFrameOutcome =
  "schematic" | "review_warning" | "hard_reject" | "failure" | "in_flight";
export type ScriptedVideoOutcome = "queued" | "ready" | "failed" | "uncertain";
const sampleId = (n: number) =>
  `22222222-2222-4222-8222-${String(n).padStart(12, "0")}`;
const stamp = (n: number) =>
  new Date(Date.UTC(2026, 8, 27, 0, 0, n)).toISOString();
const copy = <T,>(value: T): T => structuredClone(value);
function exact(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(exact).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${exact(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
const equivalent = (a: unknown, b: unknown) => exact(a) === exact(b);
const schematic =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024"><rect width="1536" height="1024" fill="#171817"/><g fill="none" stroke="#bfa06a" stroke-width="8"><path d="M260 790V260H1276V790ZM740 350V560M660 560H820L850 700H630ZM410 790V590H540V790M1030 790V590H1160V790"/><circle cx="740" cy="465" r="60"/></g><g fill="#dfc392" text-anchor="middle" font-family="sans-serif"><text x="768" y="150" font-size="45">SYNTHETIC SCHEMATIC / СИНТЕТИЧЕСКАЯ СХЕМА</text><text x="768" y="900" font-size="35">NO GENERATED ART · БЕЗ ГЕНЕРАЦИИ</text></g></svg>',
  );

/** Disposable public-only UI adapter. Scripted receipts are not SQL or provider proof. */
export function createAdventureMediaReview(
  language: Language,
  allocate = () => crypto.randomUUID(),
) {
  const ru = language === "ru";
  let serial = 1;
  let snapshot = copy(
    (fixtures[language] as unknown as { snapshot: CampaignSnapshot }).snapshot,
  );
  const campaignId = snapshot.campaign.id;
  ensure(snapshot.timeline);
  const timeline = copy(snapshot.timeline);
  const playerId = sampleId(1),
    storageId = sampleId(2),
    itemId = sampleId(3),
    objectId = sampleId(4);
  const scope = {
    campaign_id: campaignId,
    revision: 1,
    updated_at: stamp(serial),
  };
  snapshot.entities.push({
    ...scope,
    id: playerId,
    kind: "player",
    name: ru ? "Рин · пример" : "Rin · sample",
    details: ru
      ? "Синтетический Воин 1 уровня, домашние правила Console Basic."
      : "Synthetic Level 1 Fighter, Console Basic house rules.",
    hp: 10,
    max_hp: 10,
    stats: {},
    resources: {},
    conditions: [],
    equipment_slots: [
      {
        id: "main-hand",
        label: ru ? "Основная рука" : "Main hand",
        accepts: ["weapon"],
      },
    ],
  });
  snapshot.storages.push({
    ...scope,
    id: storageId,
    name: ru ? "Открытый ящик · пример" : "Public crate · sample",
    kind: "player",
    entity_id: playerId,
  });
  snapshot.items.push({
    ...scope,
    id: itemId,
    name: ru ? "Учебный меч · пример" : "Practice sword · sample",
    category: "weapon",
    quantity: 1,
    description: ru
      ? "Публичный пример для формы; не награда."
      : "A public form example; no reward is granted.",
    mechanics: "",
    owner_entity_id: playerId,
    storage_id: storageId,
    equipped_entity_id: playerId,
    equipped_slot: "main-hand",
  });
  const styleId = sampleId(5),
    styleVersion = sampleId(6);
  snapshot.documents.push({
    ...scope,
    id: styleId,
    current_version_id: styleVersion,
    title: ru ? "Визуальный стиль · пример" : "Visual style · sample",
    status: "reference",
    body:
      VISUAL_FRAME_PREFIX +
      JSON.stringify({
        schema: 1,
        kind: "reference",
        campaign_id: campaignId,
        subject: { kind: "style", id: campaignId },
        sourceRevision: 0,
        label: ru ? "Публичный стиль" : "Public style",
        appearance: ru ? "Тёмный уголь и бронза." : "Dark charcoal and bronze.",
        outfit: "",
        guidance: ru
          ? "Только видимое описание сцены."
          : "Only the visible scene narration.",
        art: "landscape",
        imageAssetId: null,
        imageAssetRevision: null,
        approval: "approved",
      }),
  });
  let worlds = parseWorldCatalog({
    worlds: [
      {
        id: sampleId(7),
        versionId: sampleId(8),
        version: 1,
        title: ru
          ? "Огни гавани · пример Мира"
          : "Harbor lights · sample World",
        premise: ru
          ? "Авторский пример: знакомая гавань, куда герой возвращается после патруля."
          : "Owner-authored sample: a familiar harbor where the hero returns after patrol.",
        packVersionIds: [],
      },
    ],
    packs: [],
  });
  let catalog = parseAdventureCatalog(
    {
      campaignId,
      timeline,
      revision: 1,
      runtimeRevision: 1,
      expectedHeadId: sampleId(9),
      worldBinding: {
        worldId: worlds.worlds[0].id,
        worldVersion: 1,
        title: worlds.worlds[0].title,
      },
      activeAdventureId: null,
      adventures: [],
      history: [],
      canChange: true,
      detachedPlayable: false,
    },
    campaignId,
  );
  let worldMinutes = 360;
  let outcome: ScriptedFrameOutcome = "schematic";
  let videoOutcome: ScriptedVideoOutcome = "queued";
  const receipts = new Map<string, { request: string; result: unknown }>();
  const versions = new Map<string, DocumentVersion[]>(
    snapshot.documents.map((d) => [
      d.id,
      [
        {
          id: d.current_version_id,
          campaign_id: campaignId,
          document_id: d.id,
          version: 1,
          title: d.title,
          status: d.status,
          body: d.body,
          restored_from: null,
          created_at: d.updated_at,
        },
      ],
    ]),
  );
  const source = (): FrameSourceAuthority => ({
    expectedHeadId: catalog.expectedHeadId,
    canonGeneration: 1,
  });
  const command = () => ({
    campaignId,
    timeline: copy(timeline),
    expectedRevision: catalog.revision,
    expectedRuntimeRevision: catalog.runtimeRevision,
    expectedHeadId: catalog.expectedHeadId,
  });
  let objects: OwnerLootView = {
    objects: [
      {
        id: objectId,
        revision: 1,
        storageId,
        locationId: snapshot.publicState.current_location_id!,
        ownerEntityId: playerId,
        label: ru ? "Открытый учебный ящик" : "Open practice crate",
        access: "open",
        lockClass: null,
        structureClass: "wood",
        environmentTags: [],
        portable: true,
        contentsEstablished: true,
      },
    ],
    choices: {
      storages: snapshot.storages
        .filter((s) => s.entity_id === playerId)
        .map((s) => ({ id: s.id, label: s.name, entityId: s.entity_id })),
      entities: [
        {
          id: playerId,
          label: snapshot.entities.find((e) => e.id === playerId)!.name,
        },
      ],
      locations: snapshot.locations.map((l) => ({ id: l.id, label: l.name })),
      capabilities: ["basic-object-access"],
    },
    command: command(),
  };
  const emptyStorageId = sampleId(10);
  snapshot.storages.push({
    ...scope,
    id: emptyStorageId,
    name: ru ? "Пустой ящик · пример" : "Empty crate · sample",
    kind: "player",
    entity_id: playerId,
  });
  objects.choices.storages.push({
    id: emptyStorageId,
    label: snapshot.storages.at(-1)!.name,
    entityId: playerId,
  });
  const rewardId = "synthetic-known-achievement";
  let rewardView: FoundationLoopView = {
    campaignId,
    command: command(),
    profile: {
      id: "console-basic",
      version: 1,
      mode: "custom_ruleset",
      validatorVersion: "console-basic-v1",
    },
    stateVersion: 1,
    commerce: null,
    progression: { enabled: false, version: 1, progress: [], pending: [] },
    availableRewards: [],
    owner: {
      currencies: [],
      itemPolicies: [],
      merchants: [],
      progression: "off",
      tracks: [],
      rewards: [
        {
          id: rewardId,
          version: 1,
          label: ru
            ? "Известное достижение · пример"
            : "Known achievement · sample",
          source: { kind: "event", id: sampleId(11) },
          distribution: "actor",
          recipientIds: [playerId],
          entries: [{ kind: "item", itemId, quantity: 1 }],
        },
      ],
      rewardIntegrity: [],
      entities: [
        {
          id: playerId,
          name: snapshot.entities.find((e) => e.id === playerId)!.name,
          kind: "player",
        },
      ],
      storages: [],
      items: [
        {
          id: itemId,
          name: snapshot.items[0].name,
          quantity: 1,
          ownerEntityId: playerId,
          storageId,
        },
      ],
      sources: [],
    },
    history: [],
  };
  const objectHistory = [copy(objects.objects[0])];
  const rewardHistory: RewardIntegrityInput[] = [];
  function authorize(cid: string, fence = timeline) {
    ensure(cid === campaignId && sameTimeline(fence, timeline), "scope");
  }
  function prior<T>(requestId: string, request: unknown): T | null {
    const saved = receipts.get(uuid(requestId));
    if (!saved) return null;
    ensure(saved.request === exact(request), "conflict");
    return copy(saved.result as T);
  }
  function remember<T>(requestId: string, request: unknown, result: T): T {
    receipts.set(requestId, { request: exact(request), result: copy(result) });
    return copy(result);
  }
  function moveHead(runtime = false) {
    catalog = {
      ...catalog,
      revision: catalog.revision + 1,
      runtimeRevision: catalog.runtimeRevision + (runtime ? 1 : 0),
      expectedHeadId: allocate(),
    };
  }
  const point = () => ({
    worldMinutes,
    sceneId: snapshot.publicState.current_scene_id,
  });
  function storeVersion(value: PublicAdventure) {
    catalog = {
      ...catalog,
      adventures: [
        ...catalog.adventures.filter((a) => a.id !== value.id),
        copy(value),
      ],
      history: [...catalog.history, copy(value)],
      activeAdventureId:
        value.status === "active"
          ? value.id
          : catalog.activeAdventureId === value.id
            ? null
            : catalog.activeAdventureId,
    };
  }
  const adventureTransport: AdventureTransport = {
    worlds: async () => copy(worlds),
    read: async (cid, fence) => {
      authorize(cid, fence);
      return copy(catalog);
    },
    send: async (raw) => {
      const value = parseAdventureCommand(raw),
        input = value.input;
      authorize(input.campaignId, input.timeline);
      const replay = prior<Awaited<ReturnType<AdventureTransport["send"]>>>(
        input.requestId,
        value,
      );
      if (replay) return replay;
      ensure(
        input.expectedRevision === catalog.revision &&
          input.expectedRuntimeRevision === catalog.runtimeRevision &&
          input.expectedHeadId === catalog.expectedHeadId &&
          catalog.canChange,
        "conflict",
      );
      if (value.action === "bind") {
        const world = worlds.worlds.find(
          (w) =>
            w.id === value.input.worldId &&
            w.version === value.input.worldVersion,
        );
        ensure(world && !catalog.worldBinding);
        catalog = {
          ...catalog,
          worldBinding: {
            worldId: world.id,
            worldVersion: world.version,
            title: world.title,
          },
        };
      } else if (value.action === "prepare") {
        ensure(catalog.worldBinding && !catalog.activeAdventureId);
        storeVersion({
          id: allocate(),
          versionId: allocate(),
          previousVersionId: null,
          version: 1,
          campaignId,
          timelineId: timeline.timelineId,
          worldId: catalog.worldBinding.worldId,
          worldVersion: catalog.worldBinding.worldVersion,
          title: value.input.title,
          premise: value.input.premise,
          pacing: copy(value.input.pacing),
          mode: "canon",
          status: "prepared",
          start: null,
          completion: null,
          summary: null,
          review: null,
          createdAt: stamp(++serial),
        });
      } else {
        const old = catalog.adventures.find(
          (a) => a.id === value.input.adventureId,
        );
        ensure(
          old && old.version === value.input.expectedAdventureVersion,
          "conflict",
        );
        let next = {
          ...copy(old),
          versionId: allocate(),
          previousVersionId: old.versionId,
          version: old.version + 1,
          createdAt: stamp(++serial),
        };
        if (value.action === "start") {
          ensure(
            old.status === "prepared" && !catalog.activeAdventureId,
            "conflict",
          );
          next = { ...next, status: "active", start: point() };
        } else if (value.action === "edit") {
          ensure(["prepared", "active"].includes(old.status), "conflict");
          next = {
            ...next,
            title: value.input.title,
            premise: value.input.premise,
            pacing: copy(value.input.pacing),
          };
        } else if (value.action === "end") {
          ensure(old.status === "active", "conflict");
          next = {
            ...next,
            status: "completed",
            completion: point(),
            summary: value.input.summary,
            review: copy(value.input.review),
          };
        } else if (value.action === "abandon") {
          ensure(["prepared", "active"].includes(old.status), "conflict");
          next = {
            ...next,
            status: "abandoned",
            completion: point(),
            summary: value.input.summary,
          };
        } else {
          ensure(["completed", "abandoned"].includes(old.status), "conflict");
          next = { ...next, review: copy(value.input.review) };
        }
        storeVersion(next);
      }
      moveHead();
      catalog = parseAdventureCatalog(catalog, campaignId);
      return remember(input.requestId, value, {
        requestId: input.requestId,
        snapshot: catalog,
      });
    },
    createWorld: async (raw) => {
      const value = parseWorldCommand(raw);
      ensure(value.action === "world_create");
      const replay = prior<
        Awaited<ReturnType<AdventureTransport["createWorld"]>>
      >(value.input.requestId, value);
      if (replay) return replay;
      ensure(value.input.packVersionIds.length === 0);
      const world = {
        id: allocate(),
        versionId: allocate(),
        version: 1,
        title: value.input.title,
        premise: value.input.premise,
        packVersionIds: [],
      };
      worlds = parseWorldCatalog({
        ...worlds,
        worlds: [...worlds.worlds, world],
      });
      return remember(value.input.requestId, value, {
        requestId: value.input.requestId,
        world,
      });
    },
    newHero: async (raw) => {
      const value = parseWorldCommand(raw);
      ensure(value.action === "new_campaign");
      const replay = prior<Awaited<ReturnType<AdventureTransport["newHero"]>>>(
        value.input.requestId,
        value,
      );
      if (replay) return replay;
      ensure(
        worlds.worlds.some(
          (w) =>
            w.id === value.input.worldId &&
            w.version === value.input.worldVersion,
        ),
      );
      return remember(value.input.requestId, value, {
        requestId: value.input.requestId,
        campaignId: allocate(),
        heroId: allocate(),
      });
    },
  };
  function apply(input: Mutation): MutationResult {
    ensure(
      "campaignId" in input &&
        input.campaignId === campaignId &&
        sameTimeline(input.timeline, timeline),
    );
    ensure(
      input.operation === "document.save" || input.operation === "asset.save",
    );
    const rows =
      input.operation === "document.save"
        ? snapshot.documents
        : snapshot.assets;
    const old = rows.find((r) => r.id === input.payload.id);
    ensure(input.expectedRevision === (old?.revision ?? 0), "conflict");
    const id = input.payload.id ?? allocate(),
      revision = input.expectedRevision + 1,
      updated_at = stamp(++serial);
    if (input.operation === "document.save") {
      const current_version_id = allocate();
      const record = {
        ...input.payload,
        id,
        revision,
        campaign_id: campaignId,
        updated_at,
        current_version_id,
      };
      snapshot = {
        ...snapshot,
        documents: [...snapshot.documents.filter((d) => d.id !== id), record],
      };
      versions.set(id, [
        ...(versions.get(id) ?? []),
        {
          id: current_version_id,
          campaign_id: campaignId,
          document_id: id,
          version: revision,
          title: record.title,
          status: record.status,
          body: record.body,
          restored_from: null,
          created_at: updated_at,
        },
      ]);
    } else
      snapshot = {
        ...snapshot,
        assets: [
          ...snapshot.assets.filter((a) => a.id !== id),
          {
            ...input.payload,
            id,
            revision,
            campaign_id: campaignId,
            updated_at,
          },
        ],
      };
    return { id, revision, timeline: copy(timeline) };
  }
  const visualAuthority = {
    authorize: async (cid: string) => authorize(cid),
    receipt: async (input: Mutation) => {
      authorize(
        "campaignId" in input ? input.campaignId : "",
        "timeline" in input ? input.timeline : undefined,
      );
      return prior<MutationResult>(input.requestId, {
        action: "reference",
        input,
      });
    },
    snapshot: async () => copy(snapshot),
    apply: async (input: Mutation) =>
      remember(input.requestId, { action: "reference", input }, apply(input)),
  };
  const parameters = {
    size: "1536x1024",
    quality: "low",
    outputFormat: "png",
    n: 1,
  } as const;
  const mediaTransport: MediaFrameTransport = {
    capability: async (cid) => {
      authorize(cid);
      return {
        enabled: true,
        model: IMAGE_MODELS[0],
        parameters: copy(parameters),
        reservationUsdMicros: 400000,
        verificationReservationUsdMicros: 200000,
        totalReservationUsdMicros: 600000,
        imageReferencesEnabled: false,
      };
    },
    prepare: async (raw) => {
      const input = object(raw, [
        "campaignId",
        "timeline",
        "expectedPublicStateRevision",
        "referenceIds",
        "composition",
        "retryOf",
      ]);
      authorize(uuid(input.campaignId), adventureTimeline(input.timeline));
      ensure(
        input.expectedPublicStateRevision === snapshot.publicState.revision,
        "conflict",
      );
      const frame = buildRealFrame(
        snapshot,
        list(input.referenceIds, uuid, 8),
        literal(input.composition, ["wide", "portrait", "item"] as const),
        IMAGE_MODELS[0],
        parameters,
        source(),
        nullable(input.retryOf, uuid),
      );
      ensure(frame.basis.references.every((r) => r.imageAssetId === null));
      return frame;
    },
    load: async (cid) => {
      authorize(cid);
      return copy(snapshot);
    },
    imageUrl: (cid, assetId) => {
      authorize(cid);
      const asset = snapshot.assets.find((a) => a.id === assetId);
      ensure(asset && safeFrameAsset(snapshot, asset));
      return schematic + "#accepted-" + assetId;
    },
    draftImageUrl: (cid, jobId) => {
      authorize(cid);
      // Like the normal transport, URL construction stays stable while sibling
      // reviews render the old context before an owner decision refresh commits.
      // This labelled schematic has no stored pixels; decisions validate the row.
      return schematic + "#draft-" + uuid(jobId);
    },
    send: async (raw) => {
      const value = object(raw, ["action", "input"]),
        action = literal(value.action, [
          "media.save",
          "media.dispatch",
          "media.recover",
          "media.accept",
          "media.discard",
        ] as const),
        input = validateMutation(value.input);
      ensure("campaignId" in input && input.operation === "document.save");
      authorize(input.campaignId, input.timeline);
      const request = { action, input } as MediaCommand;
      const replay = prior<MediaResult>(input.requestId, request);
      if (replay) return replay;
      const { requestId: ignored, ...mutation } = input;
      void ignored;
      const frame = parseRealFrame(input.payload);
      ensure(frame);
      let result: MutationResult, status: RealFrame["status"];
      if (action === "media.save") {
        validateRealFrameLifecycle(snapshot, mutation, source());
        result = apply(input);
        status = frame.status;
      } else if (action === "media.accept" || action === "media.discard") {
        const record = snapshot.documents.find(
            (d) => d.id === input.payload.id,
          ),
          before = record && parseRealFrame(record);
        ensure(
          record &&
            before?.schema === 4 &&
            before.status === "draft" &&
            before.review &&
            before.resultAssetId === null &&
            record.revision === input.expectedRevision &&
            realFrameIsCurrent(snapshot, before, source()),
          "conflict",
        );
        const expected: RealFrame = {
          ...before,
          status: action === "media.accept" ? "completed" : "discarded",
          resultAssetId: action === "media.accept" ? record.id : null,
        };
        ensure(
          equivalent(frame, expected) &&
            equivalent(
              realFrameDocumentMutation(snapshot, expected, record),
              mutation,
            ),
          "conflict",
        );
        if (action === "media.accept")
          attachSchematic(record, expected, input.requestId);
        result = apply(input);
        status = expected.status;
      } else {
        ensure(action === "media.dispatch", "conflict"); // No synthetic stored-pixel recovery claim.
        const record = snapshot.documents.find(
            (d) => d.id === input.payload.id,
          ),
          before = record && parseRealFrame(record);
        ensure(
          record &&
            before?.status === "queued" &&
            record.revision === input.expectedRevision &&
            frame.status === "generating" &&
            frame.dispatch?.requestId === input.requestId &&
            frame.dispatch.reservationUsdMicros === 400000 &&
            realFrameIsCurrent(snapshot, before, source()),
          "conflict",
        );
        ensure(
          equivalent(
            { ...before, status: "generating", dispatch: frame.dispatch },
            frame,
          ) &&
            equivalent(
              realFrameDocumentMutation(snapshot, frame, record),
              mutation,
            ),
        );
        result = apply(input);
        status = "generating";
        if (outcome !== "in_flight") {
          const generatingRecord = snapshot.documents.find(
            (d) => d.id === result.id,
          )!;
          const failed = outcome === "failure" || outcome === "hard_reject";
          const terminal: RealFrame = {
            ...frame,
            status: failed ? "failed" : "draft",
            failure:
              outcome === "failure"
                ? "provider"
                : outcome === "hard_reject"
                  ? "review"
                  : null,
            resultAssetId: null,
            review: failed
              ? null
              : {
                  status:
                    outcome === "review_warning"
                      ? "review_warning"
                      : "safe_to_review",
                  imageSha256: "0".repeat(64),
                },
          };
          result = apply({
            ...realFrameDocumentMutation(snapshot, terminal, generatingRecord),
            requestId: allocate(),
          });
          status = terminal.status;
        }
      }
      return remember(input.requestId, request, {
        result,
        status,
        dispatched: false,
      });
    },
  };
  function attachSchematic(
    record: DocumentRecord,
    frame: RealFrame,
    approvalRequestId: string,
  ) {
    // Structural sample provenance only: the displayed SVG is never a provider,
    // storage upload, observed charge or actual PNG claim.
    ensure(frame.review);
    const asset = realFrameAssetMutation(
      snapshot,
      record,
      frame,
      {
        storagePath: frameStoragePath(campaignId, record.id),
        sha256: frame.review.imageSha256,
        bytes: 1,
        contentType: "image/png",
        usage: null,
        providerRequestId: null,
      },
      record.id,
      approvalRequestId,
    );
    apply({
      ...asset,
      requestId: allocate(),
      payload: {
        ...asset.payload,
        title: ru
          ? "Синтетическая схема · принятый FRAME"
          : "Synthetic schematic · accepted FRAME",
      },
    });
  }
  function settleScriptedVideo(
    record: DocumentRecord,
    value: SceneVideo,
  ): MutationResult | null {
    if (videoOutcome === "queued") return null;
    const stale = !videoIsCurrent(snapshot, value, source());
    const terminal: SceneVideo = {
      ...value,
      status: stale ? "failed" : videoOutcome,
      failure: stale
        ? "stale"
        : videoOutcome === "failed"
          ? "provider"
          : videoOutcome === "uncertain"
            ? "uncertain"
            : null,
      resultAssetId: !stale && videoOutcome === "ready" ? record.id : null,
    };
    if (!stale && videoOutcome === "ready") {
      // Provenance-shaped lifecycle sample only: there are no generated MP4 bytes,
      // provider requests, storage uploads, reservations or charges in this adapter.
      const asset = videoAssetMutation(snapshot, record, terminal, {
        storagePath: videoStoragePath(campaignId, record.id),
        sha256: "1".repeat(64),
        bytes: 25,
        contentType: "video/mp4",
        providerRequestId: allocate(),
        actualModel: null,
      });
      ensure(asset.operation === "asset.save");
      apply({
        ...asset,
        requestId: allocate(),
        payload: {
          ...asset.payload,
          title: ru
            ? "Синтетический статус VIDEO · без ролика"
            : "Synthetic VIDEO lifecycle · no clip",
        },
      });
    }
    return apply({
      ...videoDocumentMutation(snapshot, terminal, record),
      requestId: allocate(),
    });
  }
  const videoTransport: VideoTransport = {
    capability: async (cid) => {
      authorize(cid);
      return {
        enabled: true,
        model: VIDEO_MODEL,
        parameters: copy(VIDEO_PARAMETERS),
        reservationUsdMicros: VIDEO_RESERVATION_USD_MICROS,
      };
    },
    prepare: async (raw) => {
      const input = object(raw, [
        "campaignId",
        "timeline",
        "expectedPublicStateRevision",
        "sourceAssetId",
        "retryOf",
      ]);
      authorize(uuid(input.campaignId), adventureTimeline(input.timeline));
      ensure(
        input.expectedPublicStateRevision === snapshot.publicState.revision,
        "conflict",
      );
      return buildSceneVideo(
        snapshot,
        uuid(input.sourceAssetId),
        source(),
        nullable(input.retryOf, uuid),
      );
    },
    load: async (cid) => {
      authorize(cid);
      return copy(snapshot);
    },
    videoUrl: (cid, assetId) => {
      authorize(cid);
      const asset = snapshot.assets.find(
        (a) => a.id === assetId && a.campaign_id === cid,
      );
      ensure(asset && safeVideoAsset(snapshot, asset));
      return ""; // An explicit UI placeholder, never fabricated playable media.
    },
    send: async (raw) => {
      if (raw.action === "video.poll") {
        const query = object(raw, ["action", "campaignId", "jobId"]);
        authorize(uuid(query.campaignId));
        const record = snapshot.documents.find(
          (d) => d.id === uuid(query.jobId) && d.campaign_id === campaignId,
        );
        const value = record && parseSceneVideo(record);
        ensure(record && value, "scope");
        if (
          value.status === "ready" ||
          value.status === "failed" ||
          value.status === "cancelled"
        )
          return { result: null, status: value.status, dispatched: false };
        ensure(["generating", "uncertain"].includes(value.status), "conflict");
        const result = settleScriptedVideo(record, value);
        return {
          result,
          status: parseSceneVideo(
            snapshot.documents.find((d) => d.id === record.id)!,
          )!.status,
          dispatched: false,
        };
      }
      const value = object(raw, ["action", "input"]),
        action = literal(value.action, [
          "video.save",
          "video.dispatch",
        ] as const),
        input = validateMutation(value.input);
      ensure("campaignId" in input && input.operation === "document.save");
      authorize(input.campaignId, input.timeline);
      const request = { action, input },
        replay = prior<VideoResult>(input.requestId, request);
      if (replay) return replay;
      const video = parseSceneVideo(input.payload);
      ensure(video && video.campaign_id === campaignId);
      const { requestId: ignored, ...mutation } = input;
      void ignored;
      let result: MutationResult, status: SceneVideo["status"];
      if (action === "video.save") {
        if (video.status === "cancelled") {
          const record = snapshot.documents.find(
              (d) => d.id === input.payload.id,
            ),
            before = record && parseSceneVideo(record);
          ensure(
            record &&
              before &&
              ["queued", "generating", "uncertain"].includes(before.status) &&
              record.revision === input.expectedRevision &&
              equivalent(video, {
                ...before,
                status: "cancelled",
                failure: null,
                resultAssetId: null,
              }) &&
              equivalent(
                mutation,
                videoDocumentMutation(snapshot, video, record),
              ),
            "conflict",
          );
        } else
          ensure(
            video.status === "queued" &&
              !input.payload.id &&
              input.expectedRevision === 0 &&
              equivalent(
                video,
                buildSceneVideo(
                  snapshot,
                  video.source.assetId,
                  source(),
                  video.retryOf,
                ),
              ) &&
              equivalent(mutation, videoDocumentMutation(snapshot, video)),
            "conflict",
          );
        result = apply(input);
        status = video.status;
      } else {
        const record = snapshot.documents.find(
            (d) => d.id === input.payload.id,
          ),
          before = record && parseSceneVideo(record);
        ensure(
          record &&
            before?.status === "queued" &&
            record.revision === input.expectedRevision &&
            video.status === "generating" &&
            video.dispatch?.requestId === input.requestId &&
            video.dispatch.reservationUsdMicros ===
              VIDEO_RESERVATION_USD_MICROS &&
            videoIsCurrent(snapshot, before, source()),
          "conflict",
        );
        ensure(
          equivalent(
            { ...before, status: "generating", dispatch: video.dispatch },
            video,
          ) &&
            equivalent(
              mutation,
              videoDocumentMutation(snapshot, video, record),
            ),
          "conflict",
        );
        result = apply(input);
        const generating = snapshot.documents.find((d) => d.id === result.id)!;
        const terminal = settleScriptedVideo(generating, video);
        result = terminal ?? result;
        status = parseSceneVideo(
          snapshot.documents.find((d) => d.id === result.id)!,
        )!.status;
      }
      return remember(input.requestId, request, {
        result,
        status,
        dispatched: false,
      });
    },
  };
  return {
    snapshot: () => copy(snapshot),
    catalog: () => copy(catalog),
    worlds: () => copy(worlds),
    objects: () => copy({ ...objects, command: command() }),
    rewards: () => copy({ ...rewardView, command: command() }),
    adventureTransport,
    mediaTransport,
    videoTransport,
    visualTransport: {
      history: async (cid: string, id: string) => {
        authorize(cid);
        ensure(
          snapshot.documents.some((d) => d.id === id),
          "scope",
        );
        return copy(versions.get(id) ?? []);
      },
      save: (input: Mutation) => writeVisualFrame(input, visualAuthority),
    },
    setOutcome: (value: ScriptedFrameOutcome) => {
      outcome = literal(value, [
        "schematic",
        "review_warning",
        "hard_reject",
        "failure",
        "in_flight",
      ] as const);
    },
    setVideoOutcome: (value: ScriptedVideoOutcome) => {
      videoOutcome = literal(value, [
        "queued",
        "ready",
        "failed",
        "uncertain",
      ] as const);
    },
    advanceScene: () => {
      const previous = snapshot.scenes.find(
        (s) => s.id === snapshot.publicState.current_scene_id,
      )!;
      const scene = {
        ...previous,
        id: previous.id,
        revision: previous.revision + 1,
        sequence: previous.sequence,
        title: ru
          ? "Обновлённая публичная сцена · пример"
          : "Updated public scene · sample",
        body: ru
          ? "Рин ставит учебный меч рядом с отремонтированным фонарём. Мара стоит у окна."
          : "Rin rests the practice sword beside the repaired lantern. Mara stands by the window.",
        created_at: stamp(++serial),
        updated_at: stamp(serial),
      };
      snapshot = {
        ...snapshot,
        scenes: snapshot.scenes.map((s) => (s.id === scene.id ? scene : s)),
        publicState: {
          ...snapshot.publicState,
          revision: snapshot.publicState.revision + 1,
          current_scene_id: scene.id,
          summary: scene.body,
          updated_at: stamp(serial),
        },
      };
      worldMinutes += 10;
      moveHead(true);
    },
    saveObject: async (
      raw: OwnerObjectInput,
      expected = command(),
      requestId = allocate(),
    ) => {
      authorize(expected.campaignId, expected.timeline);
      const replay = prior<OwnerLootView>(requestId, {
        action: "object",
        expected,
        raw,
      });
      if (replay) return replay;
      ensure(equivalent(expected, command()), "conflict");
      literal(raw.action, ["create", "edit"] as const);
      if (raw.action === "create") {
        object(raw, [
          "action",
          "storageId",
          "locationId",
          "ownerEntityId",
          "label",
          "access",
          "portable",
          "capability",
          "lockDc",
          "forceDc",
        ]);
        ensure(
          !objects.objects.some((o) => o.storageId === raw.storageId),
          "conflict",
        );
        const safe = buildCreateOwnerObjectInput(
          {
            ...raw,
            lockDc: raw.lockDc === null ? "" : String(raw.lockDc),
            forceDc: raw.forceDc === null ? "" : String(raw.forceDc),
          },
          objects.choices,
        );
        const created = {
          id: allocate(),
          revision: 1,
          storageId: safe.storageId,
          locationId: safe.locationId,
          ownerEntityId: safe.ownerEntityId,
          label: safe.label,
          access: safe.access,
          portable: safe.portable,
          lockClass: safe.lockDc === null ? null : "owner-assessed",
          structureClass: safe.forceDc === null ? null : "owner-assessed",
          environmentTags: [],
          contentsEstablished: false,
        };
        objects = { ...objects, objects: [...objects.objects, created] };
        objectHistory.push(copy(created));
      } else {
        object(raw, [
          "action",
          "objectId",
          "expectedObjectRevision",
          "label",
          "access",
          "portable",
        ]);
        const before = objects.objects.find((o) => o.id === raw.objectId);
        ensure(
          before && before.revision === raw.expectedObjectRevision,
          "conflict",
        );
        const safe = buildEditOwnerObjectInput(before, raw),
          updated = {
            ...before,
            label: safe.label,
            access: safe.access,
            portable: safe.portable,
            revision: before.revision + 1,
          };
        objects = {
          ...objects,
          objects: objects.objects.map((o) =>
            o.id === updated.id ? updated : o,
          ),
        };
        objectHistory.push(copy(updated));
      }
      moveHead();
      return remember(
        requestId,
        { action: "object", expected, raw },
        { ...objects, command: command() },
      );
    },
    saveReward: (
      raw: unknown,
      expected = command(),
      requestId = allocate(),
    ) => {
      authorize(expected.campaignId, expected.timeline);
      const request = { action: "reward", expected, raw },
        replay = prior<FoundationLoopView>(requestId, request);
      if (replay) return replay;
      ensure(equivalent(expected, command()), "conflict");
      const v = object(raw, [
        "rewardId",
        "expectedRewardVersion",
        "expectedPolicyVersion",
        "sourceSignificance",
        "usablePowerCeiling",
        "meaningfulnessFloor",
        "powerAggregation",
        "nonItemSignificance",
        "deliberateFloorException",
        "items",
      ]);
      const old = rewardView.owner.rewardIntegrity?.[0];
      ensure(
        v.rewardId === rewardId &&
          v.expectedRewardVersion === 1 &&
          v.expectedPolicyVersion === (old?.expectedPolicyVersion ?? null),
        "conflict",
      );
      const assessments = list(
        v.items,
        (row) => {
          const a = object(row, [
            "itemId",
            "rarity",
            "usablePower",
            "narrativeSignificance",
          ]);
          ensure(a.itemId === itemId);
          return {
            itemId,
            rarity: text(a.rarity, 100),
            usablePower: integer(a.usablePower, 0, 1000000),
            narrativeSignificance: integer(a.narrativeSignificance, 0, 1000000),
          };
        },
        1,
      );
      ensure(assessments.length === 1);
      const safe: RewardIntegrityInput = {
        rewardId,
        expectedRewardVersion: 1,
        expectedPolicyVersion: v.expectedPolicyVersion as number | null,
        sourceSignificance: literal(v.sourceSignificance, [
          "ordinary",
          "meaningful",
        ] as const),
        usablePowerCeiling: nullable(v.usablePowerCeiling, (n) =>
          integer(n, 0, 1000000),
        ),
        meaningfulnessFloor: nullable(v.meaningfulnessFloor, (n) =>
          integer(n, 0, 1000000),
        ),
        powerAggregation: literal(v.powerAggregation, [
          "maximum",
          "sum",
        ] as const),
        nonItemSignificance: integer(v.nonItemSignificance, 0, 1000000),
        deliberateFloorException: nullable(v.deliberateFloorException, (s) =>
          text(s, 2000),
        ),
        items: assessments,
      };
      rewardHistory.push(copy(safe));
      rewardView = {
        ...rewardView,
        stateVersion: rewardView.stateVersion + 1,
        owner: {
          ...rewardView.owner,
          rewardIntegrity: [
            {
              ...safe,
              expectedPolicyVersion: (old?.expectedPolicyVersion ?? 0) + 1,
            },
          ],
        },
      };
      moveHead();
      return remember(requestId, request, {
        ...rewardView,
        command: command(),
      });
    },
    histories: () => ({
      objects: copy(objectHistory),
      rewards: copy(rewardHistory),
    }),
  };
}

type Screen =
  "game" | "adventures" | "new_hero" | "gallery" | "frame" | "objects";
const screens: Screen[] = [
  "game",
  "adventures",
  "new_hero",
  "frame",
  "gallery",
  "objects",
];
const labels = {
  en: [
    "Game / FRAME",
    "Adventures",
    "New Hero",
    "Visual Bible",
    "Gallery",
    "Objects & reward limits",
  ],
  ru: [
    "Игра / FRAME",
    "Приключения",
    "Новый герой",
    "Визуальная библия",
    "Галерея",
    "Объекты и ограничения наград",
  ],
};
export function AdventureMediaPreview() {
  const { language, setLanguage } = useLanguage();
  return (
    <ReviewSession
      key={language}
      language={language}
      setLanguage={setLanguage}
    />
  );
}
function ReviewSession({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (v: Language) => void;
}) {
  const ru = language === "ru";
  const [review] = useState(() => createAdventureMediaReview(language));
  const [snapshot, setSnapshot] = useState(review.snapshot);
  const [screen, setScreen] = useState<Screen>("adventures");
  const [outcome, setOutcome] = useState<ScriptedFrameOutcome>("schematic");
  const [videoOutcome, setVideoOutcome] =
    useState<ScriptedVideoOutcome>("queued");
  const [videoEnabled, setVideoEnabled] = useState(false);
  const videoTransport = useMemo(
    () => ({
      ...review.videoTransport,
      capability: async (cid: string) => ({
        ...(await review.videoTransport.capability(cid)),
        enabled: videoEnabled,
      }),
    }),
    [review, videoEnabled],
  );
  const [message, setMessage] = useState("");
  const refresh = async () => setSnapshot(review.snapshot());
  const ignoreDirty = () => {};
  const navigate = (target: string) => {
    setScreen(screens.includes(target as Screen) ? (target as Screen) : "game");
    setMessage("");
  };
  return (
    <CampaignDataPreview snapshot={snapshot} refresh={refresh}>
      <PersistentShell
        reviewNavigation={{
          screen,
          navigate,
          basePath: "/preview/adventure-media",
        }}
      >
        <div
          className="app-content min-w-0 space-y-6"
          onClickCapture={(event) => {
            const anchor = (event.target as HTMLElement).closest?.("a");
            const href = anchor?.getAttribute("href");
            if (href?.startsWith("/preview/adventure-media?")) {
              event.preventDefault();
              navigate(
                new URLSearchParams(href.split("?")[1]).get("screen") ??
                  "adventures",
              );
            } else if (href?.startsWith("/campaigns")) {
              event.preventDefault();
              navigate(href === "/campaigns" ? "new_hero" : "game");
            }
          }}
        >
          <section
            className="rounded-xl border border-[#8c7148] bg-[#211f19] p-4"
            aria-label={ru ? "Синтетическое демо" : "Synthetic review"}
          >
            <h1 className="font-serif text-xl text-[#dfc392]">
              {ru
                ? "Adventure / Media V1 · синтетическое демо"
                : "Adventure / Media V1 · synthetic review"}
            </h1>
            <p>
              {ru
                ? "Без базы данных, провайдеров и платной генерации. Состояние сбрасывается при перезагрузке или смене языка."
                : "No database, provider calls or paid generation. State resets on reload or language change."}
            </p>
            <p className="muted">
              {ru
                ? "FRAME использует только публичный текст. Изображения здесь — подписанные схемы. VIDEO проверяет только состояния запроса, настоящих роликов нет. Резервы в обычных кнопках не списываются."
                : "FRAME uses public text only and displays labelled schematics. VIDEO demonstrates request states only; no actual clips are generated. Reservation amounts in the normal buttons are never charged here."}
            </p>
            <div className="button-row mt-3 flex flex-wrap gap-2">
              {(["en", "ru"] as const).map((value) => (
                <Button
                  key={value}
                  disabled={language === value}
                  onClick={() => setLanguage(value)}
                >
                  {value === "en" ? "English" : "Русский"}
                </Button>
              ))}
            </div>
            <nav
              className="button-row mt-3 flex flex-wrap gap-2"
              aria-label={ru ? "Экраны демо" : "Review screens"}
            >
              {screens.map((value, index) => (
                <Button
                  key={value}
                  disabled={screen === value}
                  onClick={() => navigate(value)}
                >
                  {labels[language][index]}
                </Button>
              ))}
            </nav>
            <details className="mt-3">
              <summary>{ru ? "Что проверить" : "What to review"}</summary>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  {ru
                    ? "Подготовьте Приключение, проверьте описание, начните и завершите его с отзывом."
                    : "Prepare an Adventure, review its premise, then start and end it with a review."}
                </li>
                <li>
                  {ru
                    ? "Проверьте форму нового героя и выбранный Мир. Создание здесь лишь синтетическое подтверждение."
                    : "Review the New Hero form and selected World. Creation here is only a synthetic receipt."}
                </li>
                <li>
                  {ru
                    ? "В Игре создайте черновик FRAME и примите его. Создайте новый черновик с предупреждением, проверьте «Отклонить» и «Создать заново». Прежняя принятая иллюстрация сохраняется при черновике, отказе и ошибке."
                    : "In Game generate a FRAME draft and Accept it. Generate a warning draft, then review Discard and Regenerate. Earlier accepted art stays visible through drafts, rejection and failure."}
                </li>
                <li>
                  {ru
                    ? "Примите FRAME в Игре, включите сценарий VIDEO и проверьте подготовку, явное создание и «Проверить статус». Попробуйте успех, ошибку и неизвестный результат: прежний результат остаётся."
                    : "Accept a FRAME in Game, enable scripted VIDEO and review preparation, explicit generation and Check status. Try ready, failed and unknown outcomes; earlier results stay available."}
                </li>
                <li>
                  {ru
                    ? "Исправьте публичный объект и задайте оценки награды. Предметы, количества и герой от этого не меняются."
                    : "Correct a public object and set reward assessments. Items, quantities and the Hero remain unchanged."}
                </li>
              </ol>
              <p className="muted">
                {ru
                  ? "Проверка SQL, сохранений и реальных платных изображений проводится отдельно."
                  : "SQL, save authority and actual paid image verification are separate."}
              </p>
            </details>
          </section>
          {message && <p role="status">{message}</p>}
          {screen === "adventures" && (
            <AdventuresPanel
              snapshot={snapshot}
              language={language}
              onDirty={ignoreDirty}
              onSaved={refresh}
              initialCatalog={review.catalog()}
              initialWorlds={review.worlds()}
              transport={review.adventureTransport}
              persistPending={false}
              reviewLinks={{
                newHero: "/preview/adventure-media?screen=new_hero",
                game: "/preview/adventure-media?screen=game",
              }}
            />
          )}
          {screen === "new_hero" && (
            <NewHeroForm
              language={language}
              initialWorlds={review.worlds()}
              transport={review.adventureTransport}
              persistPending={false}
              continueHref="/preview/adventure-media?screen=adventures"
              onDirty={ignoreDirty}
              onCreated={async () =>
                setMessage(
                  ru
                    ? "Синтетическое подтверждение: настоящий герой и Кампания не созданы."
                    : "Synthetic receipt: no real Hero or Campaign was created.",
                )
              }
              onCancel={() => navigate("adventures")}
            />
          )}
          {(screen === "game" || screen === "frame") && (
            <section className="rounded-lg border border-[#514536] p-4">
              <label className="field-label">
                {ru
                  ? "Следующий сценарий FRAME"
                  : "Next scripted FRAME outcome"}
                <select
                  value={outcome}
                  onChange={(e) => {
                    const next = e.target.value as ScriptedFrameOutcome;
                    review.setOutcome(next);
                    setOutcome(next);
                  }}
                >
                  <option value="schematic">
                    {ru
                      ? "Черновик: проверка пройдена"
                      : "Draft: safe to review"}
                  </option>
                  <option value="review_warning">
                    {ru
                      ? "Черновик: предупреждение проверки"
                      : "Draft: review warning"}
                  </option>
                  <option value="hard_reject">
                    {ru
                      ? "Проверка отклонила изображение"
                      : "Image check rejected"}
                  </option>
                  <option value="failure">
                    {ru
                      ? "Ошибка без нового изображения"
                      : "Failure without new art"}
                  </option>
                  <option value="in_flight">
                    {ru
                      ? "Ожидание: проверить отмену"
                      : "In-flight: review cancellation"}
                  </option>
                </select>
              </label>
              <Button
                onClick={() => {
                  review.advanceScene();
                  void refresh();
                }}
              >
                {ru
                  ? "Обновить публичную сцену · сценарий"
                  : "Script a public scene update"}
              </Button>
            </section>
          )}
          {screen === "game" && (
            <section className="space-y-3 rounded-lg border border-[#514536] p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoEnabled}
                  onChange={(e) => setVideoEnabled(e.target.checked)}
                />
                {ru
                  ? "Включить синтетический сценарий VIDEO"
                  : "Enable scripted VIDEO"}
              </label>
              <label className="field-label">
                {ru
                  ? "Следующий сценарий VIDEO"
                  : "Next scripted VIDEO outcome"}
                <select
                  value={videoOutcome}
                  onChange={(e) => {
                    const next = e.target.value as ScriptedVideoOutcome;
                    review.setVideoOutcome(next);
                    setVideoOutcome(next);
                  }}
                >
                  <option value="queued">
                    {ru ? "Ожидание / создание" : "Queued / generating"}
                  </option>
                  <option value="ready">
                    {ru
                      ? "Готово · без настоящего ролика"
                      : "Ready · no actual clip"}
                  </option>
                  <option value="failed">{ru ? "Ошибка" : "Failed"}</option>
                  <option value="uncertain">
                    {ru ? "Результат неизвестен" : "Outcome unknown"}
                  </option>
                </select>
              </label>
            </section>
          )}
          {screen === "game" && (
            <PersistentGame
              reviewOnly
              mediaTransport={review.mediaTransport}
              videoTransport={videoTransport}
            />
          )}
          {screen === "gallery" && (
            <PersistentSupporting
              screen="gallery"
              mediaTransport={review.mediaTransport}
              videoTransport={videoTransport}
            />
          )}
          {screen === "frame" && (
            <PersistentVisualFrame
              transport={review.visualTransport}
              mediaEnabled
              mediaTransport={review.mediaTransport}
            />
          )}
          {screen === "objects" && (
            <div className="space-y-6">
              <AdventureLootObjectsPanel
                language={language}
                data={review.objects()}
                busy={false}
                onSave={async (input) => {
                  await review.saveObject(input, review.objects().command);
                  await refresh();
                }}
              />
              <section className="rounded-xl border border-[#514536] bg-[#171817] p-4">
                <RewardIntegrityOwner
                  view={review.rewards()}
                  apply={(kind, input) => {
                    try {
                      ensure(kind === "reward.integrity.configure");
                      review.saveReward(input, review.rewards().command);
                      setMessage(
                        ru
                          ? "Новая версия оценок сохранена только в демо. Награды не выданы."
                          : "A new assessment version is saved only in the preview. No rewards were granted.",
                      );
                      void refresh();
                    } catch {
                      setMessage(
                        ru
                          ? "Обновите форму и проверьте оценки."
                          : "Refresh the form and review the assessments.",
                      );
                    }
                  }}
                />
              </section>
            </div>
          )}
        </div>
      </PersistentShell>
    </CampaignDataPreview>
  );
}

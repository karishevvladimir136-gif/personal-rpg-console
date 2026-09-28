"use client";
import { useRef, useState } from "react";
import fixtures from "@/lib/v1-completion/preview-fixtures.json";
import { useLanguage } from "./language-context";
import { languageOptions } from "@/lib/i18n";
import { CampaignDataPreview } from "./persistence-context";
import { Button } from "./ui";
import { TimelineExplorerPanel } from "./timeline-explorer/timeline-explorer-panel";
import { PlacesBelongingPanel } from "./places-belonging/places-belonging-panel";
import { PersistentVisualFrame } from "./persistent-visual-frame";
import { PersistentShell } from "./persistent-shell";
import { PersistentGame, PersistentSupporting } from "./persistent-game";
import { WorldLabPanel } from "./world-lab/world-lab-panel";
import { WorldLabContinuation } from "./world-lab/continuation";
import type {
  CampaignSnapshot,
  DocumentVersion,
  Mutation,
  MutationResult,
} from "@/lib/persistence/contracts";
import type { SavesSnapshot } from "@/lib/saves/contracts";
import type { LabCatalog } from "@/lib/world-lab/contracts";
import type {
  ContinuationCatalog,
  ContinuationInspection,
  ContinuationResult,
} from "@/lib/world-lab/continuation-contracts";
import type { ContinuationTransport } from "./world-lab/continuation-client";
import { writeVisualFrame } from "@/lib/visual-frame/authority";
import { writeBelonging } from "@/lib/places-belonging/authority";
import { sameTimeline } from "@/lib/saves/fence";

type PreviewFixture = {
  snapshot: CampaignSnapshot;
  saves: SavesSnapshot;
  lab: LabCatalog;
  continuation: {
    campaign: LabCatalog;
    source: ContinuationCatalog["source"];
    inspection: ContinuationInspection;
    catalog: ContinuationCatalog;
    draft: ContinuationResult["draft"];
    child: NonNullable<ContinuationResult["run"]>;
  };
};
type Screen = "timeline" | "home" | "world" | "frame" | "game" | "gallery";

export function V1CompletionPreview({
  campaignShell = false,
}: { campaignShell?: boolean } = {}) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={campaignShell ? undefined : "app-content"}>
      {!campaignShell && (
        <div className="button-row">
          <Button
            onClick={() => setLanguage("en")}
            disabled={language === "en"}
          >
            {languageOptions[0].label}
          </Button>
          <Button
            onClick={() => setLanguage("ru")}
            disabled={language === "ru"}
          >
            {languageOptions[1].label}
          </Button>
        </div>
      )}
      <PreviewSession
        key={language}
        language={language}
        campaignShell={campaignShell}
        setLanguage={setLanguage}
      />
    </div>
  );
}
function PreviewSession({
  language,
  campaignShell,
  setLanguage,
}: {
  language: "en" | "ru";
  campaignShell: boolean;
  setLanguage: (value: "en" | "ru") => void;
}) {
  const ru = language === "ru",
    fixture = fixtures[language] as unknown as PreviewFixture;
  const [screen, setScreen] = useState<Screen>(
    campaignShell ? "game" : "timeline",
  );
  const [snapshot, setSnapshot] = useState(() =>
    structuredClone(fixture.snapshot),
  );
  const current = useRef(snapshot);
  const versions = useRef(
    new Map<string, DocumentVersion[]>(
      snapshot.documents.map((d) => [
        d.id,
        [
          {
            id: d.current_version_id,
            campaign_id: d.campaign_id,
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
    ),
  );
  const receipts = useRef(
    new Map<string, { request: string; result: MutationResult }>(),
  );
  const demoDraft = useRef(structuredClone(fixture.continuation.draft));
  const refresh = async () => {
    setSnapshot(structuredClone(current.current));
  };
  const authorize = async (campaignId: string) => {
    if (campaignId !== snapshot.campaign.id)
      throw Error("Synthetic campaign scope");
  };
  const receipt = async (input: Mutation) => {
    const prior = receipts.current.get(input.requestId);
    if (prior && prior.request !== JSON.stringify(input))
      throw Error("Synthetic receipt conflict");
    return prior?.result ?? null;
  };
  // Local preview state only. Actual production validation is reused before this
  // disposable adapter; no persistence endpoint, database or model is reachable.
  const apply = async (input: Mutation): Promise<MutationResult> => {
    if (
      !("campaignId" in input) ||
      input.campaignId !== snapshot.campaign.id ||
      !sameTimeline(input.timeline, current.current.timeline)
    )
      throw Error("Synthetic scope");
    if (input.operation !== "document.save" && input.operation !== "asset.save")
      throw Error("Synthetic operation");
    const prior = await receipt(input);
    if (prior) return prior;
    const next = structuredClone(current.current),
      rows = input.operation === "document.save" ? next.documents : next.assets;
    const existing = rows.find((r) => r.id === input.payload.id);
    if ((existing?.revision ?? 0) !== input.expectedRevision)
      throw Error("Synthetic revision");
    const id = input.payload.id ?? crypto.randomUUID(),
      revision = input.expectedRevision + 1;
    const scope = {
      id,
      campaign_id: next.campaign.id,
      revision,
      updated_at: "2026-09-27T00:00:00Z",
    };
    if (input.operation === "document.save") {
      const versionId = crypto.randomUUID();
      const document = {
        ...scope,
        ...input.payload,
        id,
        current_version_id: versionId,
      };
      next.documents = [...next.documents.filter((d) => d.id !== id), document];
      versions.current.set(id, [
        ...(versions.current.get(id) ?? []),
        {
          id: versionId,
          campaign_id: next.campaign.id,
          document_id: id,
          version: revision,
          title: input.payload.title,
          status: input.payload.status,
          body: input.payload.body,
          restored_from: null,
          created_at: scope.updated_at,
        },
      ]);
    } else
      next.assets = [
        ...next.assets.filter((a) => a.id !== id),
        { ...scope, ...input.payload, id },
      ];
    current.current = next;
    const result = {
      id,
      revision,
      campaign_id: next.campaign.id,
      timeline: next.timeline,
    };
    receipts.current.set(input.requestId, {
      request: JSON.stringify(input),
      result,
    });
    return result;
  };
  const authority = {
    authorize,
    receipt,
    snapshot: async () => current.current,
    apply,
  };
  const history = async (_cid: string, documentId: string) =>
    structuredClone(versions.current.get(documentId) ?? []);
  const continuationTransport: ContinuationTransport = {
    inspect: async (campaignId, source) => {
      if (campaignId !== snapshot.campaign.id)
        throw Error("Synthetic campaign scope");
      const run = fixture.continuation.campaign.runs.find(
        (r) => r.id === source.sourceRunId,
      );
      const checkpoint = run?.checkpoints.find(
        (p) => p.id === source.sourceCheckpointId,
      );
      if (!run || !checkpoint) throw Error("Synthetic checkpoint scope");
      return {
        ...structuredClone(fixture.continuation.inspection),
        checkpoint: structuredClone(checkpoint),
        eligible:
          checkpoint.id === fixture.continuation.source.sourceCheckpointId,
      };
    },
    load: async () => ({
      ...structuredClone(fixture.continuation.catalog),
      drafts: [demoDraft.current],
    }),
    send: async (request) => {
      if (request.action === "approve")
        throw Error(
          "Preview review remains unapproved; deterministic backend proof is separate",
        );
      const draft = structuredClone(demoDraft.current);
      draft.versionId = crypto.randomUUID();
      draft.version++;
      if (request.action === "interpret")
        draft.proposal.premise = request.input.premise;
      if (request.action === "edit") {
        draft.proposal.review = request.input.review;
        draft.proposal.ownerEdited = true;
      }
      // An explicitly scripted suggestion remains reviewable and NON-CANON.
      demoDraft.current = draft;
      return { source: fixture.continuation.source, draft, run: null };
    },
  };
  const labels: Record<Screen, string> = {
    game: ru ? "Игра" : "Game",
    gallery: ru ? "Галерея" : "Gallery",
    timeline: ru ? "История кампании" : "Timeline Explorer",
    home: ru ? "Родные места" : "Places of Belonging",
    world: ru ? "Что, если · продолжение" : "What If · checkpoint child",
    frame: ru ? "Образы мира / FRAME" : "Visual Bible / FRAME",
  };
  const content = (
    <>
      {campaignShell && (
        <div className="button-row">
          <Button
            onClick={() => setLanguage("en")}
            disabled={language === "en"}
          >
            English
          </Button>
          <Button
            onClick={() => setLanguage("ru")}
            disabled={language === "ru"}
          >
            Русский
          </Button>
        </div>
      )}
      {!campaignShell && (
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              {"V1 · "}
              {ru ? "СИНТЕТИЧЕСКАЯ ДЕМОНСТРАЦИЯ" : "SYNTHETIC REVIEW"}
            </span>
            <h1>
              {ru ? "Новые пути вашей истории" : "More ways to keep your story"}
            </h1>
          </div>
        </div>
      )}
      <p className="muted">
        {ru
          ? "Демонстрация · только локальные данные"
          : "Review demo · local synthetic data"}
      </p>
      <details className="gameplay-transcript">
        <summary>{ru ? "Пределы демонстрации" : "Demo limits"}</summary>
        <p className="notice">
          {ru
            ? "Только демонстрационные данные. Изменения живут в этой странице и сбрасываются при перезагрузке. Нет БД, ИИ или платной генерации. «Что, если» использует заранее заданный пример; одобрение отключено."
            : "Synthetic data only. Edits live in this page and reset on reload. No database, AI or paid generation. What If uses a scripted example; approval is disabled."}
        </p>
      </details>
      {!campaignShell && (
        <nav
          className="button-row"
          aria-label={ru ? "Проверка V1" : "V1 review"}
        >
          {(Object.keys(labels) as Screen[]).map((key) => (
            <Button
              key={key}
              primary={screen === key}
              onClick={() => setScreen(key)}
            >
              {labels[key]}
            </Button>
          ))}
        </nav>
      )}
      <div className="v1-review-content">
        {screen === "game" && (
          <PersistentGame
            reviewOnly
            frameTransport={{
              load: async () => current.current,
              save: (input) => writeVisualFrame(input, authority),
            }}
          />
        )}
        {screen === "gallery" && <PersistentSupporting screen="gallery" />}
        {screen === "timeline" && (
          <TimelineExplorerPanel
            snapshot={snapshot}
            language={language}
            initialSupplement={{ saves: fixture.saves, lab: fixture.lab }}
            transport={{
              saves: async () => fixture.saves,
              lab: async () => fixture.lab,
            }}
          />
        )}
        {screen === "home" && (
          <PlacesBelongingPanel
            snapshot={snapshot}
            language={language}
            transport={{
              history,
              save: (input) => writeBelonging(input, authority),
            }}
            onSaved={refresh}
          />
        )}
        {screen === "frame" && (
          <PersistentVisualFrame
            syntheticControls={!campaignShell}
            transport={{
              history,
              save: (input) => writeVisualFrame(input, authority),
            }}
          />
        )}
        {screen === "world" && campaignShell && (
          <WorldLabPanel
            campaignId={snapshot.campaign.id}
            language={language}
            initialCatalog={fixture.continuation.campaign}
            initialAuthoringCatalog={{
              models: fixture.continuation.catalog.models,
              drafts: [fixture.continuation.draft],
            }}
            transport={{
              load: async () => fixture.continuation.campaign,
              send: async () => {
                throw Error("Preview simulation is disabled");
              },
            }}
            authoringTransport={{
              load: async () => ({
                models: fixture.continuation.catalog.models,
                drafts: [demoDraft.current],
              }),
              send: async () => {
                throw Error(
                  "Preview composition uses the reviewed scripted example; no provider",
                );
              },
            }}
            continuationPreview={{ transport: continuationTransport }}
          />
        )}
        {screen === "world" && !campaignShell && (
          <WorldLabContinuation
            campaignId={snapshot.campaign.id}
            language={language}
            campaign={fixture.continuation.campaign}
            disabled={false}
            onPendingChange={() => {}}
            onPrepared={() => {}}
            initialInspection={fixture.continuation.inspection}
            initialCatalog={fixture.continuation.catalog}
            transport={continuationTransport}
          />
        )}
      </div>
    </>
  );
  return (
    <CampaignDataPreview snapshot={snapshot} refresh={refresh}>
      {campaignShell ? (
        <PersistentShell
          reviewNavigation={{
            screen,
            navigate: (value) => {
              if (value in labels) setScreen(value as Screen);
            },
          }}
        >
          <div className="app-content">{content}</div>
        </PersistentShell>
      ) : (
        content
      )}
    </CampaignDataPreview>
  );
}

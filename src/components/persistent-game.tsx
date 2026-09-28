"use client";

import { useState } from "react";
import {
  mockArtForAsset,
  MOCK_ASSET_PREFIX,
  visualDocuments,
} from "@/lib/visual-frame/model";
import { CurrentSceneFrame } from "./visual-frame/current-scene-frame";
import type { CurrentSceneFrameTransport } from "@/lib/visual-frame/current-scene";
import { MockVisualArt } from "./visual-frame/mock-art";
import Link from "next/link";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Badge, Button, Icon, Panel } from "./ui";
import { useGameplayRuntime } from "./gameplay-runtime";
import { GameplayComposer } from "./gameplay-composer";
import {
  GameplayCamp,
  GameplayCompanionTalk,
  GameplayRest,
} from "./gameplay-actions";
import { GameplayCombat } from "./gameplay-combat";
import { SessionMemoryPanel, SessionPendingCompanion } from "./session-memory";
import {
  RecordBoundary,
  RecordEditor,
  RecordField,
  RecordHeading,
  RecordSelect,
} from "./persistent-records";
import type {
  Asset,
  CampaignSnapshot,
  Location,
  Quest,
  Scene,
  Session,
} from "@/lib/persistence/contracts";
import {
  RecordValidationError,
  resumeIssue,
  sceneOrder,
  sceneRoleLabels,
} from "@/lib/persistence/record-model";

function SessionEditor({
  session,
  onClose,
}: {
  session?: Session;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  const initial = {
    title: session?.title || "",
    status: session?.status || "open",
    recap: session?.recap || "",
  };
  return (
    <RecordEditor
      title={session ? "Edit session record" : "Add session record"}
      initial={initial}
      onClose={onClose}
      build={(draft) => ({
        operation: "session.save",
        campaignId,
        expectedRevision: session?.revision || 0,
        payload: { ...draft, id: session?.id },
      })}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Session title")}
            required
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
          />
          <RecordSelect
            label={t("Session status")}
            value={draft.status}
            options={[
              { value: "open", label: t("Open") },
              { value: "closed", label: t("Closed") },
            ]}
            onChange={(status) =>
              setDraft({ ...draft, status: status as Session["status"] })
            }
          />
          <RecordField
            label={t("Owner-written recap")}
            value={draft.recap}
            multiline
            onChange={(recap) => setDraft({ ...draft, recap })}
          />
          <p className="muted">
            {t(
              "Opening or closing this record does not advance time, rest the party or generate a summary.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function SceneEditor({
  scene,
  sessionId,
  onClose,
}: {
  scene?: Scene;
  sessionId: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  const initial = {
    title: scene?.title || "",
    body: scene?.body || "",
    role: scene?.role || "note",
  };
  return (
    <RecordEditor
      title={scene ? "Correct transcript record" : "Add transcript record"}
      initial={initial}
      onClose={onClose}
      build={(draft) => ({
        operation: "scene.save",
        campaignId,
        expectedRevision: scene?.revision || 0,
        payload: {
          ...draft,
          session_id: scene?.session_id || sessionId,
          id: scene?.id,
        },
      })}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Scene title")}
            required
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
          />
          <RecordSelect
            label={t("Transcript kind")}
            value={draft.role}
            options={Object.entries(sceneRoleLabels).map(([value, label]) => ({
              value,
              label: t(label),
            }))}
            onChange={(role) =>
              setDraft({ ...draft, role: role as Scene["role"] })
            }
          />
          <RecordField
            label={t("Public transcript text")}
            required
            value={draft.body}
            multiline
            onChange={(body) => setDraft({ ...draft, body })}
          />
          <p className="muted">
            {t(
              "This stores text written by you. No DM response, roll or consequence is generated. Existing scenes keep their original settings revision.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function ResumeEditor({
  data,
  onClose,
}: {
  data: CampaignSnapshot;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  const [baseline] = useState(data.publicState);
  const { summary, current_session_id, current_scene_id, current_location_id } =
    baseline;
  return (
    <RecordEditor
      title={t("Edit public state and resume point")}
      initial={{
        summary,
        current_session_id,
        current_scene_id,
        current_location_id,
      }}
      onClose={onClose}
      build={(payload) => {
        const issue = resumeIssue(data, payload);
        if (issue) throw new RecordValidationError(issue);
        return {
          operation: "state.save",
          campaignId,
          expectedRevision: baseline.revision,
          payload,
        };
      }}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Public campaign summary")}
            multiline
            value={draft.summary}
            onChange={(summary) => setDraft({ ...draft, summary })}
          />
          <RecordSelect
            label={t("Resume session")}
            value={draft.current_session_id || ""}
            empty
            options={data.sessions.map((row) => ({
              value: row.id,
              label: row.title,
            }))}
            onChange={(value) =>
              setDraft({
                ...draft,
                current_session_id: value || null,
                current_scene_id: null,
              })
            }
          />
          <RecordSelect
            label={t("Resume scene")}
            value={draft.current_scene_id || ""}
            empty
            options={sceneOrder(
              data.scenes.filter(
                (row) => row.session_id === draft.current_session_id,
              ),
            ).map((row) => ({ value: row.id, label: row.title }))}
            onChange={(value) =>
              setDraft({ ...draft, current_scene_id: value || null })
            }
          />
          <RecordSelect
            label={t("Recorded current location")}
            value={draft.current_location_id || ""}
            empty
            options={data.locations.map((row) => ({
              value: row.id,
              label: row.name,
            }))}
            onChange={(value) =>
              setDraft({ ...draft, current_location_id: value || null })
            }
          />
          <p className="muted">
            {t(
              "This is an explicit correction of the public resume point. It does not travel, rewrite earlier scenes or change campaign settings.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function Transcript({
  data,
  session,
  onEdit,
}: {
  data: CampaignSnapshot;
  session: Session;
  onEdit: (scene: Scene) => void;
}) {
  const { t } = useLanguage();
  const scenes = sceneOrder(
    data.scenes.filter((row) => row.session_id === session.id),
  );
  return (
    <>
      {!scenes.length && (
        <Panel className="empty-state">
          <Icon name="BookOpen" size={30} />
          <p>
            {t(
              "No scenes recorded in this session. Add a public transcript or owner note.",
            )}
          </p>
        </Panel>
      )}
      {scenes.map((scene) => (
        <div
          key={scene.id}
          id={`recorded-scene-${scene.id}`}
          style={{ scrollMarginTop: 90 }}
        >
          <Panel
            className="scene-card"
            title={scene.title}
            action={
              <Button onClick={() => onEdit(scene)}>
                {t("Correct transcript record")}
              </Button>
            }
          >
            <div style={{ padding: 20 }}>
              <Badge>{t(sceneRoleLabels[scene.role])}</Badge>
              {scene.id === data.publicState.current_scene_id && (
                <Badge green>{t("Saved resume point")}</Badge>
              )}
              <div
                className="prose"
                style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {scene.body}
              </div>
              <small className="muted">
                {t("Recorded with settings revision {revision}", {
                  revision: scene.settings_revision,
                })}
              </small>
            </div>
          </Panel>
        </div>
      ))}
    </>
  );
}

function SessionRecords({ data }: { data: CampaignSnapshot }) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(
    data.publicState.current_session_id || "",
  );
  const [sessionEditor, setSessionEditor] = useState<Session | "new" | null>(
    null,
  );
  const [sceneEditor, setSceneEditor] = useState<Scene | "new" | null>(null);
  const [resume, setResume] = useState(false);
  const selected =
    data.sessions.find((row) => row.id === selectedId) || data.sessions[0];
  return (
    <>
      <RecordHeading
        title={t("Sessions")}
        description="Session records, owner-written recaps and the saved public transcript."
        action={
          <Button primary onClick={() => setSessionEditor("new")}>
            {t("Add session record")}
          </Button>
        }
      />
      <Button onClick={() => setResume(true)}>
        {t("Edit public state and resume point")}
      </Button>
      {!selected ? (
        <Panel className="empty-state">
          <Icon name="BookOpen" size={32} />
          <p>
            {t(
              "No sessions yet. Create a record to begin storing your campaign transcript.",
            )}
          </p>
        </Panel>
      ) : (
        <>
          <RecordSelect
            label={t("Inspect session")}
            value={selected.id}
            options={data.sessions.map((row) => ({
              value: row.id,
              label: row.title,
            }))}
            onChange={setSelectedId}
          />
          <Panel
            className="visual-inventory-panel"
            title={selected.title}
            action={
              <Button onClick={() => setSessionEditor(selected)}>
                {t("Edit session record")}
              </Button>
            }
          >
            <Badge>{t(selected.status === "open" ? "Open" : "Closed")}</Badge>
            <p className="prose" style={{ whiteSpace: "pre-wrap" }}>
              {selected.recap || t("No owner-written recap yet.")}
            </p>
            <Button primary onClick={() => setSceneEditor("new")}>
              {t("Add transcript record")}
            </Button>
          </Panel>
          <SessionMemoryPanel sessionId={selected.id} />
          <Transcript data={data} session={selected} onEdit={setSceneEditor} />
        </>
      )}
      {sessionEditor && (
        <SessionEditor
          session={sessionEditor === "new" ? undefined : sessionEditor}
          onClose={() => setSessionEditor(null)}
        />
      )}
      {sceneEditor && selected && (
        <SceneEditor
          scene={sceneEditor === "new" ? undefined : sceneEditor}
          sessionId={selected.id}
          onClose={() => setSceneEditor(null)}
        />
      )}
      {resume && <ResumeEditor data={data} onClose={() => setResume(false)} />}
    </>
  );
}

export function PersistentSessions() {
  return (
    <RecordBoundary>
      {(data) => <SessionRecords key={data.campaign.id} data={data} />}
    </RecordBoundary>
  );
}

function GameRecords({
  data,
  reviewOnly = false,
  frameTransport,
}: {
  data: CampaignSnapshot;
  reviewOnly?: boolean;
  frameTransport?: CurrentSceneFrameTransport;
}) {
  const { t } = useLanguage();
  const runtime = useGameplayRuntime(reviewOnly);
  const [inputMode, setInputMode] = useState<"game" | "ooc">("game");
  const [resume, setResume] = useState(false);
  const [sceneEditor, setSceneEditor] = useState<Scene | "new" | null>(null);
  const session = data.sessions.find(
    (row) => row.id === data.publicState.current_session_id,
  );
  const location = data.locations.find(
    (row) => row.id === data.publicState.current_location_id,
  );
  return (
    <>
      <RecordHeading
        title={t("Game")}
        description="Your campaign, one DM, and a story shaped by your choices."
        action={
          <Button onClick={() => setResume(true)}>
            {t("Edit public state and resume point")}
          </Button>
        }
      />
      <div className="game-grid gameplay-live">
        <div className="story-column">
          {!reviewOnly && (
            <SessionMemoryPanel sessionId={session?.id ?? null} />
          )}
          {runtime.play && (
            <SessionPendingCompanion
              play={runtime.play}
              onSaved={runtime.afterMutation}
            />
          )}
          <Panel
            className="visual-inventory-panel"
            title={session?.title || t("Choose a resume session")}
          >
            <Badge>{t("Persistent public records")}</Badge>
            <p className="prose" style={{ whiteSpace: "pre-wrap" }}>
              {data.publicState.summary || t("No public summary recorded.")}
            </p>
            {session ? (
              <Button primary onClick={() => setSceneEditor("new")}>
                {t("Add transcript record")}
              </Button>
            ) : (
              <p>
                <Link
                  className="text-link"
                  href={`/campaigns/${data.campaign.id}/sessions`}
                >
                  {t("Open sessions to create a transcript")}
                </Link>
              </p>
            )}
            {data.publicState.current_scene_id && (
              <p>
                <a
                  className="text-link"
                  href={`#recorded-scene-${data.publicState.current_scene_id}`}
                >
                  {t("Jump to saved resume point")}
                </a>
              </p>
            )}
          </Panel>
          {session && (
            <details className="gameplay-transcript">
              <summary>
                {t("Recorded transcript and manual corrections")}
              </summary>
              <Transcript
                data={data}
                session={session}
                onEdit={setSceneEditor}
              />
            </details>
          )}
          <Panel
            className="visual-inventory-panel"
            title={t("The next moment")}
          >
            {runtime.loading && (
              <p role="status">{t("Loading saved gameplay…")}</p>
            )}
            {runtime.error && (
              <div role="alert">
                <p>{t(runtime.error)}</p>
                <Button onClick={() => void runtime.refresh().catch(() => {})}>
                  {t("Retry loading")}
                </Button>
              </div>
            )}
            {runtime.play && (
              <>
                {!runtime.play.configuration &&
                  runtime.play.rulesetId !== "world-logic-v1" && (
                    <p className="rules-preview-note">
                      {t(
                        "Choose an explicit supported rules profile in campaign settings before resolving mechanical actions.",
                      )}{" "}
                      <Link
                        className="text-link"
                        href={`/campaigns/${data.campaign.id}/settings`}
                      >
                        {t("Campaign settings")}
                      </Link>
                    </p>
                  )}
                <div className="tabs" aria-label={t("Input mode")}>
                  <button
                    type="button"
                    className={inputMode === "game" ? "active" : ""}
                    onClick={() => setInputMode("game")}
                  >
                    {t("Game")}
                  </button>
                  <button
                    type="button"
                    className={inputMode === "ooc" ? "active" : ""}
                    onClick={() => setInputMode("ooc")}
                  >
                    {t("OOC")}
                  </button>
                </div>
                <GameplayComposer
                  key={inputMode}
                  play={runtime.play}
                  mode={inputMode}
                  onSaved={runtime.afterMutation}
                />
              </>
            )}
            <CurrentSceneFrame transport={frameTransport} />
            <p>
              <Link
                className="text-link"
                href="/preview/campaigns/long-road-west/game"
              >
                {t("Open isolated Phase 0 demonstrations")}
              </Link>
            </p>
          </Panel>
          {runtime.play && runtime.play.rulesetId !== "world-logic-v1" && (
            <>
              <GameplayCombat
                play={runtime.play}
                onSaved={runtime.afterMutation}
              />
              {runtime.play.turns.some((turn) => turn.mode === "mechanic") && (
                <details
                  className="gameplay-transcript"
                  open={runtime.play.turns.some(
                    (turn) =>
                      turn.mode === "mechanic" &&
                      [
                        "pending",
                        "generating",
                        "awaiting_confirmation",
                        "failed",
                      ].includes(turn.status),
                  )}
                >
                  <summary>{t("Mechanical actions and recovery")}</summary>
                  <GameplayComposer
                    play={runtime.play}
                    mode="mechanic"
                    onSaved={runtime.afterMutation}
                    historyOnly
                  />
                </details>
              )}
              <GameplayRest
                play={runtime.play}
                onSaved={runtime.afterMutation}
              />
              <p>
                <Link
                  className="text-link"
                  href={`/campaigns/${data.campaign.id}/camp`}
                >
                  {t("Open Camp")}
                </Link>
              </p>
            </>
          )}
        </div>
        <aside className="context-column">
          <Panel className="visual-inventory-panel" title={t("Party")}>
            {data.entities
              .filter(
                (row) => row.kind === "player" || row.kind === "companion",
              )
              .map((row) => (
                <div key={row.id}>
                  <h3>{row.name}</h3>
                  {row.hp !== null &&
                    runtime.play?.rulesetId !== "world-logic-v1" && (
                      <p>
                        {t("HP")}
                        {": "}
                        {row.hp}
                        {row.max_hp === null ? "" : ` / ${row.max_hp}`}
                      </p>
                    )}
                  <p>{row.conditions.join(", ") || t("None recorded")}</p>
                  {row.kind === "companion" && (
                    <GameplayCompanionTalk entityId={row.id} />
                  )}
                </div>
              ))}
            {!data.entities.length && (
              <p className="muted">
                {t(
                  "No public character records yet. Add only information the player knows.",
                )}
              </p>
            )}
            <Link
              className="text-link"
              href={`/campaigns/${data.campaign.id}/character`}
            >
              {t("Open character records")}
            </Link>
          </Panel>
          <Panel
            className="visual-inventory-panel"
            title={t("Recorded current location")}
          >
            <h3>{location?.name || t("None recorded")}</h3>
            <p>{location?.description}</p>
          </Panel>
          <Panel className="visual-inventory-panel" title={t("Quests")}>
            {data.quests
              .filter((row) => row.status === "open")
              .map((row) => (
                <p key={row.id}>{row.title}</p>
              ))}
            {!data.quests.some((row) => row.status === "open") && (
              <p>{t("No open quests recorded.")}</p>
            )}
          </Panel>
        </aside>
      </div>
      {resume && <ResumeEditor data={data} onClose={() => setResume(false)} />}
      {sceneEditor && session && (
        <SceneEditor
          scene={sceneEditor === "new" ? undefined : sceneEditor}
          sessionId={session.id}
          onClose={() => setSceneEditor(null)}
        />
      )}
    </>
  );
}

export function PersistentGame({
  reviewOnly = false,
  frameTransport,
}: { reviewOnly?: boolean; frameTransport?: CurrentSceneFrameTransport } = {}) {
  return (
    <RecordBoundary>
      {(data) => (
        <GameRecords
          key={data.campaign.id}
          data={data}
          reviewOnly={reviewOnly}
          frameTransport={frameTransport}
        />
      )}
    </RecordBoundary>
  );
}

type SupportingScreen = "journal" | "map" | "gallery" | "camp";
const supportingTitles = {
  journal: "Journal",
  map: "Map & Travel",
  gallery: "Gallery",
  camp: "Camp",
};

function QuestEditor({ row, onClose }: { row?: Quest; onClose: () => void }) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  return (
    <RecordEditor
      title={t("Edit public quest")}
      initial={{
        title: row?.title || "",
        description: row?.description || "",
        status: row?.status || "open",
      }}
      onClose={onClose}
      build={(payload) => ({
        operation: "quest.save",
        campaignId,
        expectedRevision: row?.revision || 0,
        payload: { ...payload, id: row?.id },
      })}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Quest title")}
            required
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
          />
          <RecordField
            label={t("Public description")}
            multiline
            value={draft.description}
            onChange={(description) => setDraft({ ...draft, description })}
          />
          <RecordSelect
            label={t("Quest status")}
            value={draft.status}
            options={[
              { value: "open", label: t("Open") },
              { value: "complete", label: t("Complete") },
              { value: "archived", label: t("Archived") },
            ]}
            onChange={(status) =>
              setDraft({ ...draft, status: status as Quest["status"] })
            }
          />
        </>
      )}
    </RecordEditor>
  );
}

function LocationEditor({
  row,
  onClose,
}: {
  row?: Location;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  return (
    <RecordEditor
      title={t("Edit known location")}
      initial={{
        name: row?.name || "",
        description: row?.description || "",
        status: row?.status || "known",
      }}
      onClose={onClose}
      build={(payload) => ({
        operation: "location.save",
        campaignId,
        expectedRevision: row?.revision || 0,
        payload: { ...payload, id: row?.id },
      })}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Location name")}
            required
            value={draft.name}
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <RecordField
            label={t("Public description")}
            multiline
            value={draft.description}
            onChange={(description) => setDraft({ ...draft, description })}
          />
          <RecordSelect
            label={t("Location status")}
            value={draft.status}
            options={[
              { value: "known", label: t("Known") },
              { value: "visited", label: t("Visited") },
            ]}
            onChange={(status) =>
              setDraft({ ...draft, status: status as Location["status"] })
            }
          />
        </>
      )}
    </RecordEditor>
  );
}

function AssetEditor({ row, onClose }: { row?: Asset; onClose: () => void }) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  return (
    <RecordEditor
      title={t("Edit asset metadata")}
      initial={{
        title: row?.title || "",
        kind: row?.kind || "image",
        description: row?.description || "",
      }}
      onClose={onClose}
      build={(payload) => ({
        operation: "asset.save",
        campaignId,
        expectedRevision: row?.revision || 0,
        payload: {
          ...payload,
          storage_path: row?.storage_path || null,
          id: row?.id,
        },
      })}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Asset title")}
            required
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
          />
          <RecordSelect
            label={t("Asset kind")}
            value={draft.kind}
            options={[
              { value: "image", label: t("Image") },
              { value: "video", label: t("Video") },
              { value: "document", label: t("Document") },
            ]}
            onChange={(kind) =>
              setDraft({ ...draft, kind: kind as Asset["kind"] })
            }
          />
          <RecordField
            label={t("Public description")}
            multiline
            value={draft.description}
            onChange={(description) => setDraft({ ...draft, description })}
          />
          <p className="muted">
            {t(
              "Metadata only. File upload, playback and image/video generation are not connected.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function SupportingRecords({
  screen,
  data,
}: {
  screen: SupportingScreen;
  data: CampaignSnapshot;
}) {
  const { t, language } = useLanguage();
  const [quest, setQuest] = useState<Quest | "new" | null>(null);
  const [location, setLocation] = useState<Location | "new" | null>(null);
  const [asset, setAsset] = useState<Asset | "new" | null>(null);
  return (
    <>
      <RecordHeading
        title={supportingTitles[screen]}
        description="Only public records from this campaign appear here."
      />
      {screen === "journal" && (
        <Panel
          className="visual-inventory-panel"
          title={t("Quests")}
          action={
            <Button primary onClick={() => setQuest("new")}>
              {t("Add public quest")}
            </Button>
          }
        >
          <div className="card-grid">
            {data.quests.map((row) => (
              <article className="ability-card" key={row.id}>
                <Icon name="BookOpen" />
                <h3>{row.title}</h3>
                <Badge>
                  {t(
                    row.status === "open"
                      ? "Open"
                      : row.status === "complete"
                        ? "Complete"
                        : "Archived",
                  )}
                </Badge>
                <p style={{ whiteSpace: "pre-wrap" }}>{row.description}</p>
                <Button onClick={() => setQuest(row)}>
                  {t("Edit public quest")}
                </Button>
              </article>
            ))}
          </div>
          {!data.quests.length && <p>{t("No public quests recorded.")}</p>}
          <p>
            <Link
              className="text-link"
              href={`/campaigns/${data.campaign.id}/party`}
            >
              {t("Open known people")}
            </Link>
          </p>
        </Panel>
      )}
      {screen === "map" && (
        <Panel
          className="visual-inventory-panel"
          title={t("Known locations")}
          action={
            <Button primary onClick={() => setLocation("new")}>
              {t("Add known location")}
            </Button>
          }
        >
          <div className="card-grid">
            {data.locations.map((row) => (
              <article className="ability-card" key={row.id}>
                <Icon name="map" />
                <h3>{row.name}</h3>
                <Badge>
                  {t(row.status === "visited" ? "Visited" : "Known")}
                </Badge>
                <p style={{ whiteSpace: "pre-wrap" }}>{row.description}</p>
                <Button onClick={() => setLocation(row)}>
                  {t("Edit known location")}
                </Button>
              </article>
            ))}
          </div>
          {!data.locations.length && <p>{t("No known locations recorded.")}</p>}
          <p className="muted">
            {t(
              "No map or journey is invented. Travel and route resolution are not connected.",
            )}
          </p>
        </Panel>
      )}
      {screen === "gallery" && (
        <Panel className="visual-inventory-panel" title={t("Images & moments")}>
          <p className="muted">
            {t(
              "Saved results and the moments behind them. MOCK sketches are placeholders, not generated campaign art.",
            )}
          </p>
          <div className="card-grid">
            {data.assets
              .filter((row) => row.campaign_id === data.campaign.id)
              .map((row) => {
                const frame = visualDocuments(data).find(
                  ({ value }) =>
                    value.kind === "frame" && value.resultAssetId === row.id,
                );
                const title =
                  frame?.value.kind === "frame"
                    ? frame.value.basis.scene.title
                    : row.title;
                const art = mockArtForAsset(row);
                return (
                  <article className="ability-card" key={row.id}>
                    <h3>{title}</h3>
                    {row.description.startsWith(MOCK_ASSET_PREFIX) ? (
                      <>
                        <Badge>{t("MOCK result · schematic only")}</Badge>
                        {art && <MockVisualArt art={art} label={title} />}
                      </>
                    ) : (
                      <>
                        <Badge>
                          {t(
                            row.kind === "image"
                              ? "Image"
                              : row.kind === "video"
                                ? "Video"
                                : "Document",
                          )}
                        </Badge>
                        <p>{row.description}</p>
                        <details>
                          <summary>{t("Edit asset metadata")}</summary>
                          <Button onClick={() => setAsset(row)}>
                            {t("Edit asset metadata")}
                          </Button>
                        </details>
                      </>
                    )}
                    <p className="muted">
                      <time dateTime={row.updated_at}>
                        {new Date(row.updated_at).toLocaleString(language)}
                      </time>
                    </p>
                  </article>
                );
              })}
          </div>
          {!data.assets.length && (
            <p>
              {t(
                "No saved images yet. Use FRAME in Game to capture the current moment as a MOCK sketch.",
              )}
            </p>
          )}
          <details className="gameplay-transcript">
            <summary>{t("Result history")}</summary>
            {visualDocuments(data)
              .slice()
              .reverse()
              .map(({ record, value }) =>
                value.kind === "frame" ? (
                  <article className="ability-card" key={record.id}>
                    <h3>{value.basis.scene.title}</h3>
                    <Badge>
                      {t("MOCK preview")} ·{" "}
                      {t(
                        {
                          queued: "Queued",
                          completed: "Completed",
                          cancelled: "Cancelled",
                          failed: "Failed",
                        }[value.status],
                      )}
                    </Badge>
                    <p>
                      <time dateTime={record.updated_at}>
                        {new Date(record.updated_at).toLocaleString(language)}
                      </time>
                    </p>
                  </article>
                ) : null,
              )}
            <Link
              className="text-link"
              href={`/campaigns/${data.campaign.id}/frame`}
            >
              {t("Visual Bible / FRAME")}
            </Link>
          </details>
          <details className="gameplay-transcript">
            <summary>{t("Asset records")}</summary>
            <Button onClick={() => setAsset("new")}>
              {t("Add asset metadata")}
            </Button>
            <p className="muted">
              {t(
                "Metadata only. File upload, playback and image/video generation are not connected.",
              )}
            </p>
          </details>
        </Panel>
      )}
      {screen === "camp" && <GameplayCamp />}
      {quest && (
        <QuestEditor
          row={quest === "new" ? undefined : quest}
          onClose={() => setQuest(null)}
        />
      )}
      {location && (
        <LocationEditor
          row={location === "new" ? undefined : location}
          onClose={() => setLocation(null)}
        />
      )}
      {asset && (
        <AssetEditor
          row={asset === "new" ? undefined : asset}
          onClose={() => setAsset(null)}
        />
      )}
    </>
  );
}

export function PersistentSupporting({ screen }: { screen: SupportingScreen }) {
  return (
    <RecordBoundary>
      {(data) => (
        <SupportingRecords
          key={`${data.campaign.id}:${screen}`}
          data={data}
          screen={screen}
        />
      )}
    </RecordBoundary>
  );
}

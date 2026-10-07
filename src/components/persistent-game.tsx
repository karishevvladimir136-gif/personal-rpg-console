"use client";

import { useRef, useState } from "react";
import {
  mockArtForAsset,
  MOCK_ASSET_PREFIX,
  visualDocuments,
} from "@/lib/visual-frame/model";
import { CurrentSceneFrame } from "./visual-frame/current-scene-frame";
import {
  CurrentSceneMediaFrame,
  StoredFrameImage,
  RealFrameHistory,
} from "./visual-frame/current-scene-media-frame";
import {
  safeFrameAsset,
  ownerAcceptedFrameAsset,
  realFrameDocuments,
  REAL_FRAME_ASSET_PREFIX,
} from "@/lib/visual-frame/real-frame";
import { MAP_VISUAL_ASSET_PREFIX } from "@/lib/visual-frame/map-job";
import {
  CurrentSceneVideo,
  StoredSceneVideo,
  SceneVideoHistory,
} from "./visual-frame/current-scene-video";
import { safeVideoAsset, VIDEO_ASSET_PREFIX } from "@/lib/scene-video/model";
import type { VideoTransport } from "@/lib/scene-video/client";
import type { MediaFrameTransport } from "@/lib/visual-frame/media-client";
import type { CurrentSceneFrameTransport } from "@/lib/visual-frame/current-scene";
import { MockVisualArt } from "./visual-frame/mock-art";
import Link from "next/link";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Badge, Button, Icon, Meter, Panel } from "./ui";
import { useGameplayRuntime } from "./gameplay-runtime";
import { SubjectAvatar } from "./visual-frame/subject-avatar";
import { useSessionMemory } from "./session-memory-runtime";
import styles from "./playtest-game-character.module.css";
import gameStyles from "./live-game.module.css";
import { characterDescription } from "./character-presentation";
import {
  GameplayComposer,
  type StoryHistoryPosition,
} from "./gameplay-composer";
import {
  GameplayCamp,
  GameplayRest,
} from "./gameplay-actions";
import { GameplayCombat } from "./gameplay-combat";
import { CombatReadiness } from "./combat-readiness";
import { GameplayCheck } from "./gameplay-dice";
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
  Entity,
  Location,
  Quest,
  Scene,
  Session,
} from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
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

function GameSessionControls({ sessionId }: { sessionId: string | null }) {
  const { t } = useLanguage();
  const memory = useSessionMemory();
  const needsReview =
    !!memory.error ||
    (!!memory.snapshot?.currentBoundary &&
      memory.snapshot.currentBoundary.state !== "continued");
  return (
    <details className={styles.secondary} open={needsReview || undefined}>
      <summary>{t("Session & continuity")}</summary>
      <SessionMemoryPanel sessionId={sessionId} />
    </details>
  );
}

/** The Game presentation consumes only the public campaign projection. */
export function createGameViewModel(data: CampaignSnapshot, play: PlaySnapshot | null) {
  const session = data.sessions.find(
    (row) => row.id === data.publicState.current_session_id,
  );
  const location = data.locations.find(
    (row) => row.id === data.publicState.current_location_id,
  );
  const scene = data.scenes.find(
    (row) => row.id === data.publicState.current_scene_id,
  );
  const controlledIds = new Set(play?.configuration?.controlledEntityIds ?? []);
  const player = data.entities.find(
    (row) => row.kind === "player" && controlledIds.has(row.id),
  ) ?? data.entities.find((row) => row.kind === "player");
  const presentIds = new Set(play?.configuration?.presentEntityIds ?? []);
  const companions = data.entities.filter(
    (row) => row.kind === "companion" && presentIds.has(row.id),
  );
  const objective = data.quests.find((row) => row.status === "open");
  const clues = sceneOrder(
    data.scenes.filter((row) => row.role === "note"),
  ).slice(-3).reverse();
  const sceneFrame = scene
    ? realFrameDocuments(data)
        .filter(
          ({ value }) =>
            value.status === "completed" &&
            value.basis.scene.id === scene.id &&
            value.resultAssetId !== null,
        )
        .reverse()
        .map(({ value }) =>
          data.assets.find(
            (asset) =>
              asset.id === value.resultAssetId &&
              ownerAcceptedFrameAsset(data, asset),
          ),
        )
        .find((asset) => asset !== undefined)
    : undefined;
  const sessionScenes = sceneOrder(
    data.scenes.filter((row) => row.session_id === session?.id),
  );
  const firstPlayerScene = sessionScenes.find((row) => row.role === "player");
  const openingScene = sessionScenes
    .filter(
      (row) =>
        row.role === "narration" &&
        (!firstPlayerScene || row.sequence < firstPlayerScene.sequence),
    )
    .at(-1);
  const hasNarration = play?.turns.some(
    (turn) =>
      turn.mode === "game" &&
      turn.session_id === session?.id &&
      turn.narration !== null,
  );
  return {
    session,
    location,
    scene,
    player,
    companions,
    objective,
    clues,
    sceneFrame,
    openingScene,
    showOpening: Boolean(openingScene || !hasNarration),
    story:
      openingScene?.body ||
      (scene?.role === "narration" ? scene.body : data.publicState.summary),
  };
}

function LiveCharacterSummary({
  data,
  player,
}: {
  data: CampaignSnapshot;
  player?: Entity;
}) {
  const { t, language } = useLanguage();
  if (!player) return <p className="muted">{language === "ru" ? "Персонажа пока нет." : "No character yet."}</p>;
  const level = player.character_sheet?.level ?? player.stats.level;
  const levelValue = typeof level === "number" && Number.isFinite(level) ? level : null;
  const role = player.character_sheet?.role;
  const hpPercent =
    player.hp !== null && player.max_hp !== null && player.max_hp > 0
      ? Math.max(0, Math.min(100, (player.hp / player.max_hp) * 100))
      : 0;
  return (
    <>
      <div className="identity">
        <SubjectAvatar snapshot={data} entity={player} className={`art ${gameStyles.heroAvatar}`} />
        <div>
          <h2>{player.name}</h2>
          {(role || levelValue !== null) && (
            <p>{[role, levelValue !== null ? t("Level {level}", { level: levelValue }) : null].filter(Boolean).join(" · ")}</p>
          )}
          {player.details && <em className={gameStyles.heroDescription}>{characterDescription(player.details, t)}</em>}
        </div>
      </div>
      {player.hp !== null && (
        player.max_hp !== null && player.max_hp > 0 ? (
          <Meter
            label={t("HP")}
            value={`${player.hp} / ${player.max_hp}`}
            color="var(--red)"
            percent={hpPercent}
          />
        ) : <p className={gameStyles.singleResource}>{t("HP")}: {player.hp}</p>
      )}
      {Object.keys(player.resources).length > 0 && (
        <dl className={gameStyles.resources}>
          {Object.entries(player.resources).map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      )}
    </>
  );
}

function GameRecords({
  data,
  reviewOnly = false,
  frameTransport,
  mediaTransport,
  videoTransport,
}: {
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
  data: CampaignSnapshot;
  reviewOnly?: boolean;
  frameTransport?: CurrentSceneFrameTransport;
}) {
  const { t, language } = useLanguage();
  const runtime = useGameplayRuntime(reviewOnly);
  const [inputMode, setInputMode] = useState<"game" | "ooc">("game");
  const [diceOpen, setDiceOpen] = useState(false);
  const [historyPositions, setHistoryPositions] = useState<
    Record<string, StoryHistoryPosition>
  >({});
  const [resume, setResume] = useState(false);
  const [sceneEditor, setSceneEditor] = useState<Scene | "new" | null>(null);
  const mediaRef = useRef<HTMLDetailsElement>(null);
  const view = createGameViewModel(data, runtime.play);
  const { session, location, scene, player, companions, objective, clues, sceneFrame } = view;
  const latest = runtime.play?.turns
    .filter((turn) => turn.mode === inputMode)
    .at(-1);
  const lastRecordedCheck = runtime.play?.turns.flatMap((turn) => turn.checks).at(-1);
  const opening = inputMode === "game" && view.showOpening && (
    <article className={gameStyles.opening}>
      <div className="prose">
        {view.story ||
          t(
            "Your story is ready to begin. The opening of your Adventure will appear here.",
          )}
      </div>
    </article>
  );
  const historyKey = `${data.timeline?.timelineId ?? "unfenced"}:${data.timeline?.epoch ?? 0}:${inputMode}`;
  function openMedia(target: "frame" | "video") {
    if (runtime.play?.startupPending) return;
    if (reviewOnly || !mediaRef.current) return;
    mediaRef.current.open = true;
    requestAnimationFrame(() => {
      document.getElementById(`game-${target}-controls`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
  return (
    <div className={gameStyles.liveGame}>
      <header className="game-title">
        <div>
          <span className="eyebrow">{data.campaign.title}</span>
          <h1>{session?.title || scene?.title || location?.name || t("Your next chapter")}</h1>
        </div>
        <nav className={gameStyles.storyNav} aria-label={t("Story navigation")}>
          <a
            className="text-link"
            href={latest ? `#saved-turn-${latest.id}` : "#play-action"}
          >
            {t("Latest moment")}
          </a>
          <a className="text-link" href="#play-action">
            {t("Your action")}
          </a>
          <Link
            className="text-link"
            href={`/campaigns/${data.campaign.id}/sessions`}
          >
            {t("Sessions")}
          </Link>
        </nav>
      </header>
      <div className="game-grid gameplay-live">
        <div className="story-column">
          <details className="mobile-stats panel">
            <summary>
              {player?.name || t("Your character")}
              {player?.hp !== null && player?.hp !== undefined && (
                <span>{t("HP")} {player.hp}{player.max_hp === null ? "" : ` / ${player.max_hp}`}</span>
              )}
            </summary>
            <LiveCharacterSummary data={data} player={player} />
          </details>
          <article className="scene panel">
            <div className="scene-art">
              {sceneFrame ? (
                <div className="art">
                  <StoredFrameImage asset={sceneFrame} transport={mediaTransport} />
                </div>
              ) : (
                <div className={`art ${gameStyles.atmosphere}`} aria-hidden="true">
                  <Icon name="Image" size={48} />
                </div>
              )}
              <div className="scene-caption">
                <div>
                  <span className="eyebrow">{t("Current scene")}</span>
                  <h2>{location?.name || scene?.title || t("Your next chapter")}</h2>
                  {scene?.title && scene.title !== location?.name && <p>{scene.title}</p>}
                </div>
                {session && <span>{session.title}</span>}
              </div>
            </div>
            <div className="narration">
              <div className="scene-kicker">
                <span className="eyebrow">{t("The story so far")}</span>
                {scene?.created_at && <time dateTime={scene.created_at}>{new Date(scene.created_at).toLocaleString(data.campaign.language)}</time>}
              </div>
              {opening}
              {!runtime.play?.startupPending && <div className="scene-actions">
                <Button disabled={reviewOnly} onClick={() => openMedia("frame")}>
                  <Icon name="Image" size={15} />
                  <span>{t("FRAME")}<small>{t("Capture this moment")}</small></span>
                </Button>
                {!frameTransport && (
                  <Button disabled={reviewOnly} onClick={() => openMedia("video")}>
                    <span className="play-symbol">▷</span>
                    <span>{t("VIDEO")}<small>{t("A cinematic view")}</small></span>
                  </Button>
                )}
              </div>}
              {!reviewOnly && !runtime.play?.startupPending && (
                <details className={gameStyles.sceneMedia} ref={mediaRef}>
                  <summary>{language === "ru" ? "Создать изображение этой сцены" : "Create art for this scene"}</summary>
                  {scene && <p className="muted">{scene.title}</p>}
                  <div id="game-frame-controls" className={gameStyles.mediaControls}>
                    {frameTransport ? (
                      <CurrentSceneFrame transport={frameTransport} />
                    ) : (
                      <CurrentSceneMediaFrame transport={mediaTransport} />
                    )}
                  </div>
                  {!frameTransport && (
                    <div id="game-video-controls" className={gameStyles.mediaControls}>
                      <CurrentSceneVideo transport={videoTransport} />
                    </div>
                  )}
                </details>
              )}
            </div>
          </article>
          {runtime.play && !runtime.play.startupPending && (
            <SessionPendingCompanion
              play={runtime.play}
              onSaved={runtime.afterMutation}
            />
          )}
          <div className={gameStyles.storyFlow}>
            {reviewOnly && !runtime.play && (
              <div id="play-action" className={styles.reviewComposer}>
                <textarea
                  aria-label={t("Your action")}
                  placeholder={t("Describe your action")}
                  disabled
                  rows={3}
                />
                <div className="composer-tools" aria-label={language === "ru" ? "Помощники ввода" : "Composer tools"}>
                  <button type="button" aria-pressed="false" disabled>{t("OOC")} {t("Off")}</button>
                  <button type="button" disabled>{language === "ru" ? "Кости" : "Dice"}</button>
                  <button type="button" disabled><Icon name="BookOpen" size={14} />{t("Take note")}</button>
                  <button type="button" disabled><Icon name="CircleHelp" size={14} />{t("What do I know?")}</button>
                </div>
                <p className="muted">{t("Synthetic UI review only · no gameplay is submitted.")}</p>
              </div>
            )}
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
                {runtime.play.rulesetId === "world-logic-v1" && !reviewOnly && !runtime.play.startupPending && (
                  <CombatReadiness campaignId={data.campaign.id} runtimeRevision={runtime.play.revision} onSaved={runtime.afterMutation} />
                )}
                {!runtime.play.configuration && runtime.play.rulesetId !== "world-logic-v1" && (
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
                {runtime.play.startupPending && (
                  <div id="play-action" className="rules-preview-note" role="status">
                    <p>{language === "ru"
                      ? "Перед первым действием завершите вступление приключения и настройку ведущего. Игра откроется, когда подготовка будет закончена."
                      : "The Adventure opening and DM setup must finish before your first action. The Game will be ready when startup is complete."}</p>
                    <Link className="text-link" href={`/campaigns/${data.campaign.id}/adventures`}>
                      {language === "ru" ? "Проверить вступление" : "Review Adventure opening"}
                    </Link>
                  </div>
                )}
                {!runtime.play.startupPending && <GameplayComposer
                  key={inputMode}
                  play={runtime.play}
                  mode={inputMode}
                  onSaved={runtime.afterMutation}
                  followLatest
                  historyPosition={historyPositions[historyKey]}
                  onHistoryPositionChange={(position) => {
                    setHistoryPositions((previous) => ({
                      ...previous,
                      [historyKey]: position,
                    }));
                  }}
                  beforeInput={<span id="play-action" aria-hidden="true" />}
                  inputTools={
                    <>
                      <div className="composer-tools" aria-label={language === "ru" ? "Помощники ввода" : "Composer tools"}>
                        <button
                          type="button"
                          aria-pressed={inputMode === "ooc"}
                          className={inputMode === "ooc" ? "selected" : ""}
                          onClick={() => setInputMode(inputMode === "ooc" ? "game" : "ooc")}
                        >
                          {t("OOC")} {t(inputMode === "ooc" ? "On" : "Off")}
                        </button>
                        <button
                          type="button"
                          aria-expanded={diceOpen}
                          aria-controls="game-recorded-dice"
                          onClick={() => setDiceOpen((open) => !open)}
                        >
                          <span aria-hidden="true">⚄</span> {language === "ru" ? "Кости" : "Dice"}
                        </button>
                        <Link href={`/campaigns/${data.campaign.id}/journal?tab=Notes&compose=note`}>
                          <Icon name="BookOpen" size={14} /> {t("Take note")}
                        </Link>
                        <Link href={`/campaigns/${data.campaign.id}/journal?tab=Evidence`}>
                          <Icon name="CircleHelp" size={14} /> {t("What do I know?")}
                        </Link>
                      </div>
                      {diceOpen && (
                        <div id="game-recorded-dice" className={gameStyles.recordedDice}>
                          {lastRecordedCheck ? (
                            <GameplayCheck check={lastRecordedCheck} />
                          ) : (
                            <p>{language === "ru" ? "Результаты бросков появятся здесь после проверки ведущего." : "Recorded rolls will appear here when the DM calls for a check."}</p>
                          )}
                        </div>
                      )}
                    </>
                  }
                />}
              </>
            )}
          </div>
          {runtime.play && !runtime.play.startupPending && (runtime.play.rulesetId !== "world-logic-v1" ||
            runtime.play.configuration) && (
            <details
              className={styles.secondary}
              open={
                runtime.play.encounters.some(
                  (encounter) => encounter.status === "active",
                ) ||
                runtime.play.turns.some(
                  (turn) =>
                    turn.mode === "mechanic" &&
                    [
                      "pending",
                      "generating",
                      "awaiting_confirmation",
                      "failed",
                    ].includes(turn.status),
                ) ||
                undefined
              }
            >
              <summary>{t("Combat & rest")}</summary>
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
              {runtime.play.rulesetId !== "world-logic-v1" && (
                <details className={styles.secondary}>
                  <summary>{t("Rest & camp")}</summary>
                  <GameplayRest
                    play={runtime.play}
                    onSaved={runtime.afterMutation}
                  />
                </details>
              )}
              <p>
                <Link
                  className="text-link"
                  href={`/campaigns/${data.campaign.id}/camp`}
                >
                  {t("Open Camp")}
                </Link>
              </p>
            </details>
          )}
          {!reviewOnly && !runtime.play?.startupPending && (
            <GameSessionControls sessionId={session?.id ?? null} />
          )}
          <details className={styles.secondary}>
            <summary>{t("Advanced · records & corrections")}</summary>
            <Button onClick={() => setResume(true)}>
              {t("Edit public state and resume point")}
            </Button>
            {session ? (
              <>
                <Button onClick={() => setSceneEditor("new")}>
                  {t("Add transcript record")}
                </Button>
                <Transcript
                  data={data}
                  session={session}
                  onEdit={setSceneEditor}
                />
              </>
            ) : (
              <Link
                className="text-link"
                href={`/campaigns/${data.campaign.id}/sessions`}
              >
                {t("Open sessions to create a transcript")}
              </Link>
            )}
          </details>
        </div>
        <aside className="context-column" aria-label={t("Story context")}>
          <Panel className="character-quick">
            <LiveCharacterSummary data={data} player={player} />
            <Link className="text-link" href={`/campaigns/${data.campaign.id}/character`}>
              {t("Character sheet")} <Icon name="ChevronRight" size={14} />
            </Link>
          </Panel>
          <Panel title={t("Current scene")}>
            <div className="location-mini">
              <Icon name="map" />
              <div>
                <h3>{location?.name || scene?.title || t("Current scene")}</h3>
                {scene?.title && scene.title !== location?.name && <p>{scene.title}</p>}
              </div>
            </div>
            {sceneFrame && (
              <div className="location-image">
                <StoredFrameImage asset={sceneFrame} transport={mediaTransport} />
              </div>
            )}
            {location?.description && <em className="small-quote">{location.description}</em>}
            <Link className="text-link" href={`/campaigns/${data.campaign.id}/map`}>
              {t("Open map")}
            </Link>
          </Panel>
          <Panel title={t("Current objective")}>
            <div className="objective">
              <Icon name="Crosshair" size={26} />
              <p>{objective?.title || (language === "ru" ? "Пока нет текущей цели." : "No current objective yet.")}</p>
            </div>
            {objective?.description && <p className={gameStyles.objectiveDetail}>{objective.description}</p>}
            <Link className="text-link" href={`/campaigns/${data.campaign.id}/journal`}>
              {t("View in journal")} <Icon name="ArrowRight" size={14} />
            </Link>
          </Panel>
          <Panel
            title={t("Traveling together")}
            action={<Link href={`/campaigns/${data.campaign.id}/party`} className="text-link">{t("View")}</Link>}
          >
            {player && (
              <div className="person-row">
                <SubjectAvatar snapshot={data} entity={player} className={`art ${gameStyles.personAvatar}`} />
                <span>{player.name}</span>
                <small>{t("You")}</small>
              </div>
            )}
            {companions.map((row) => (
              <div className="person-row" key={row.id}>
                <SubjectAvatar snapshot={data} entity={row} className={`art ${gameStyles.personAvatar}`} />
                <span>{row.name}</span>
              </div>
            ))}
            {!player && !companions.length && <p className="muted">{language === "ru" ? "Здесь пока никого нет." : "No one is here yet."}</p>}
          </Panel>
          <Panel
            title={t("Recent clues")}
            action={<Link href={`/campaigns/${data.campaign.id}/journal`} className="text-link">{t("View all")}</Link>}
          >
            {clues.length ? clues.map((row) => (
              <Link className="clue-row" href={`/campaigns/${data.campaign.id}/journal`} key={row.id}>
                <span className={`art ${gameStyles.clueIcon}`}><Icon name="BookOpen" size={18} /></span>
                <div><h3>{row.title}</h3><small>{t("Clue")}</small></div>
                <Icon name="ChevronRight" size={13} />
              </Link>
            )) : <p className="muted">{language === "ru" ? "Пока нет улик." : "No clues yet."}</p>}
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
    </div>
  );
}

export function PersistentGame({
  reviewOnly = false,
  frameTransport,
  mediaTransport,
  videoTransport,
}: {
  reviewOnly?: boolean;
  frameTransport?: CurrentSceneFrameTransport;
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
} = {}) {
  return (
    <RecordBoundary>
      {(data) => (
        <GameRecords
          key={data.campaign.id}
          data={data}
          reviewOnly={reviewOnly}
          frameTransport={frameTransport}
          mediaTransport={mediaTransport}
          videoTransport={videoTransport}
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
  mediaTransport,
  videoTransport,
}: {
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
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
              .filter((row) =>
                row.campaign_id === data.campaign.id &&
                !row.description.startsWith(MAP_VISUAL_ASSET_PREFIX),
              )
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
                    {safeFrameAsset(data, row) ? (
                      <>
                        <Badge>{t("Image")}</Badge>
                        <StoredFrameImage
                          asset={row}
                          transport={mediaTransport}
                        />
                      </>
                    ) : safeVideoAsset(data, row) ? (
                      <>
                        <Badge>{t("Video")}</Badge>
                        <StoredSceneVideo
                          asset={row}
                          transport={videoTransport}
                        />
                      </>
                    ) : row.description.startsWith(VIDEO_ASSET_PREFIX) ? (
                      <p>
                        {language === "ru"
                          ? "Видео недоступно. Проверьте сохранённую историю."
                          : "This video is unavailable. Review its saved history."}
                      </p>
                    ) : row.description.startsWith(REAL_FRAME_ASSET_PREFIX) ||
                      row.description.startsWith(
                        "RPG_OWNER_FRAME_ASSET_V1\n",
                      ) ? (
                      <p>
                        {t(
                          "This image is unavailable. Review its saved FRAME history.",
                        )}
                      </p>
                    ) : row.description.startsWith(MOCK_ASSET_PREFIX) ? (
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
          {!data.assets.some((row) =>
            row.campaign_id === data.campaign.id &&
            !row.description.startsWith(MAP_VISUAL_ASSET_PREFIX),
          ) && (
            <p>
              {t(
                "No saved images yet. Use FRAME in Game to review and capture the current moment.",
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
          <RealFrameHistory transport={mediaTransport} />
          <SceneVideoHistory transport={videoTransport} />
          <details className="gameplay-transcript">
            <summary>{t("Asset records")}</summary>
            <Button onClick={() => setAsset("new")}>
              {t("Add asset metadata")}
            </Button>
            <p className="muted">
              {language === "ru"
                ? "Здесь редактируются только описания файлов. FRAME и VIDEO запускаются отдельно в Игре."
                : "Edit file descriptions here. Generate FRAME and VIDEO separately in Game."}
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

export function PersistentSupporting({
  screen,
  mediaTransport,
  videoTransport,
}: {
  screen: SupportingScreen;
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
}) {
  return (
    <RecordBoundary>
      {(data) => (
        <SupportingRecords
          key={`${data.campaign.id}:${screen}`}
          data={data}
          screen={screen}
          mediaTransport={mediaTransport}
          videoTransport={videoTransport}
        />
      )}
    </RecordBoundary>
  );
}

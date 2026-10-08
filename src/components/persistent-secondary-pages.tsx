"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Asset, CampaignSnapshot } from "@/lib/persistence/contracts";
import type { MapPlacement } from "@/lib/map/placement-contracts";
import { loadMapLayout } from "@/lib/map/placement-client";
import {
  secondaryPageRecords,
  gallerySubjectAssets,
} from "@/lib/persistence/secondary-page-model";
import { mockArtForAsset, MOCK_ASSET_PREFIX } from "@/lib/visual-frame/model";
import {
  safeFrameAsset,
  REAL_FRAME_ASSET_PREFIX,
} from "@/lib/visual-frame/real-frame";
import { safeVideoAsset, VIDEO_ASSET_PREFIX } from "@/lib/scene-video/model";
import { defaultMediaFrameTransport, type MediaFrameTransport } from "@/lib/visual-frame/media-client";
import { galleryMapAssets, safeMapVisualAsset, MAP_VISUAL_ASSET_PREFIX } from "@/lib/visual-frame/map-job";
import type { VideoTransport } from "@/lib/scene-video/client";
import { useLanguage } from "./language-context";
import { Badge, Button, Icon, Modal, Panel, Tabs } from "./ui";
import {
  KnownPeopleCorrections,
  RecordBoundary,
  RecordEditor,
  RecordField,
} from "./persistent-records";
import { PersistentSessions, PersistentSupporting } from "./persistent-game";
import { PersistentSaves } from "./persistent-saves";
import { PersistentTimelineExplorer } from "./persistent-timeline-explorer";
import { PersistentPlacesBelonging } from "./persistent-places-belonging";
import { PersistentAdventures } from "./persistent-adventures";
import { CurrentAdventure } from "./current-adventure";
import { PersistentAdventureLoot } from "./persistent-adventure-loot";
import { PersistentMediaVisualFrame } from "./persistent-visual-frame";
import { SessionMemoryPanel } from "./session-memory";
import {
  StoredFrameImage,
  RealFrameHistory,
} from "./visual-frame/current-scene-media-frame";
import {
  StoredSceneVideo,
  SceneVideoHistory,
} from "./visual-frame/current-scene-video";
import { MockVisualArt } from "./visual-frame/mock-art";
import { AtlasMap } from "./atlas-map";
import styles from "./secondary-pages.module.css";

export type SecondaryScreen = "journal" | "map" | "sessions" | "gallery";
const preferenceEvent = "rpg-secondary-disclosure";

function useWords() {
  const { language } = useLanguage();
  return (en: string, ru: string) => (language === "ru" ? ru : en);
}

/** Tools mount on first open, then stay mounted so collapse preserves drafts. */
function Disclosure({
  campaignId,
  name,
  title,
  children,
  defaultOpen = false,
}: {
  campaignId: string;
  name: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const key = `rpg-ui:secondary:${campaignId}:${name}`;
  const [fallback, setFallback] = useState(defaultOpen);
  const [mounted, setMounted] = useState(defaultOpen);
  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? (fallback ? "open" : "closed");
    } catch {
      return fallback ? "open" : "closed";
    }
  }, [key, fallback]);
  const subscribe = useCallback((listener: () => void) => {
    window.addEventListener("storage", listener);
    window.addEventListener(preferenceEvent, listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener(preferenceEvent, listener);
    };
  }, []);
  const open =
    useSyncExternalStore(subscribe, read, () =>
      defaultOpen ? "open" : "closed",
    ) === "open";
  return (
    <details
      className={styles.disclosure}
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        if (next === open) return;
        setMounted(true);
        setFallback(next);
        try {
          window.localStorage.setItem(key, next ? "open" : "closed");
        } catch {
          /* Storage restrictions leave the control usable. */
        }
        window.dispatchEvent(new Event(preferenceEvent));
      }}
    >
      <summary>{title}</summary>
      {(open || mounted) && (
        <div className={styles.disclosureBody}>{children}</div>
      )}
    </details>
  );
}

function Heading({
  data,
  title,
  description,
  reviewOnly,
}: {
  data: CampaignSnapshot;
  title: string;
  description: string;
  reviewOnly?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={`page-heading ${styles.heading}`}>
      <div>
        <span className="eyebrow">{data.campaign.title}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {reviewOnly ? (
        <span className="button" aria-disabled="true">{t("Resume story")}</span>
      ) : (
        <Link className="button" href={`/campaigns/${data.campaign.id}/game`}>
          {t("Resume story")} <Icon name="ArrowRight" size={16} />
        </Link>
      )}
    </div>
  );
}

function Empty({
  icon = "BookOpen",
  children,
}: {
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} size={32} />
      <p>{children}</p>
    </div>
  );
}

function ReviewTool({
  reviewOnly,
  children,
}: {
  reviewOnly?: boolean;
  children: ReactNode;
}) {
  const w = useWords();
  return reviewOnly ? (
    <p className="muted">
      {w(
        "This tool is available in the live campaign. Synthetic UI review does not load or change campaign records.",
        "Этот инструмент доступен в настоящей кампании. Синтетический обзор интерфейса не загружает и не изменяет записи кампании.",
      )}
    </p>
  ) : (
    children
  );
}

function GalleryTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  const w = useWords();
  return (
    <div className="tabs" aria-label={t("View options")}>
      {[
        "Frames",
        "Maps",
        "Characters",
        "Locations",
        "Items",
        "Videos",
        "Visual references",
      ].map((key) => (
        <button
          key={key}
          aria-pressed={value === key}
          className={value === key ? "active" : ""}
          onClick={() => onChange(key)}
        >
          {key === "Visual references"
            ? w("Visual references", "Визуальные образы")
            : t(key)}
        </button>
      ))}
    </div>
  );
}

function NoteEditor({
  data,
  onClose,
}: {
  data: CampaignSnapshot;
  onClose: () => void;
}) {
  const w = useWords();
  const session = secondaryPageRecords(data).sessions.find(
    (row) => row.id === data.publicState.current_session_id,
  );
  if (!session) return null;
  return (
    <RecordEditor
      title={w("Add a journal note", "Добавить заметку")}
      initial={{ title: "", body: "" }}
      onClose={onClose}
      build={(draft) => ({
        operation: "scene.save",
        campaignId: data.campaign.id,
        expectedRevision: 0,
        payload: {
          title: draft.title,
          body: draft.body,
          session_id: session.id,
          role: "note",
        },
      })}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={w("Title", "Название")}
            required
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
          />
          <RecordField
            label={w("Your note", "Ваша заметка")}
            multiline
            required
            value={draft.body}
            onChange={(body) => setDraft({ ...draft, body })}
          />
          <p className="muted">
            {w(
              "This saves a public note in the current session. It does not change what happened in the story.",
              "Заметка сохранится в текущей сессии. Она не меняет события истории.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function JournalView({
  data,
  reviewOnly,
}: {
  data: CampaignSnapshot;
  reviewOnly?: boolean;
}) {
  const { t, language } = useLanguage();
  const w = useWords();
  const records = secondaryPageRecords(data);
  const [tab, setTab] = useState("Quests");
  const [note, setNote] = useState(false);
  const [selected, setSelected] = useState<{
    title: string;
    body: string;
    source: string;
  } | null>(null);
  const campaignId = data.campaign.id;
  const appliedJournalLink = useRef(false);
  useEffect(() => {
    if (reviewOnly || appliedJournalLink.current) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("tab");
    const openNote = requested === "Notes" &&
      params.get("compose") === "note" &&
      !reviewOnly &&
      data.sessions.some((row) => row.id === data.publicState.current_session_id);
    // Apply URL-selected panels after hydration so server and client start alike.
    const timer = window.setTimeout(() => {
      appliedJournalLink.current = true;
      if (requested === "Notes" || requested === "Evidence") setTab(requested);
      if (openNote) setNote(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data.publicState.current_session_id, data.sessions, reviewOnly]);
  return (
    <>
      <Heading
        data={data}
        title={t("Journal")}
        reviewOnly={reviewOnly}
        description={t("What you’ve seen. What you suspect. What comes next.")}
      />
      <Tabs
        options={[
          "Quests",
          "Timeline",
          "People",
          "Locations",
          "Evidence",
          "Notes",
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Quests" && (
        <>
          <div className={styles.grid}>
            {records.quests
              .filter((row) => row.status !== "archived")
              .map((quest) => (
                <Panel key={quest.id} className={styles.card}>
                  <Icon name="BookOpen" />
                  <h2>{quest.title}</h2>
                  <Badge green={quest.status === "complete"}>
                    {t(quest.status === "complete" ? "Complete" : "Open")}
                  </Badge>
                  <p className={styles.prose}>{quest.description}</p>
                </Panel>
              ))}
          </div>
          {!records.quests.some((row) => row.status !== "archived") && (
            <Panel>
              <Empty>{t("No public quests recorded.")}</Empty>
            </Panel>
          )}
          <Disclosure
            campaignId={campaignId}
            name="journal-archived"
            title={w("Archived quests", "Архив заданий")}
          >
            {records.quests
              .filter((row) => row.status === "archived")
              .map((quest) => (
                <article key={quest.id}>
                  <h3>{quest.title}</h3>
                  <p className={styles.prose}>{quest.description}</p>
                </article>
              ))}
            {!records.quests.some((row) => row.status === "archived") && (
              <p>{w("No archived quests.", "Нет архивных заданий.")}</p>
            )}
          </Disclosure>
          <Disclosure
            campaignId={campaignId}
            name="journal-corrections"
            title={w("Edit / Correct records", "Изменить / Исправить записи")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <PersistentSupporting screen="journal" />
            </ReviewTool>
          </Disclosure>
        </>
      )}
      {tab === "Timeline" && (
        <>
          <CurrentAdventure snapshot={data} reviewOnly={reviewOnly} />
          <Panel className={styles.timeline}>
            <h2>{t("The road so far")}</h2>
            {records.sessions
              .slice()
              .reverse()
              .map((session) => (
                <article key={session.id}>
                  <span className="eyebrow">
                    {t(session.status === "open" ? "Open" : "Closed")}
                  </span>
                  <h3>{session.title}</h3>
                  <p className={styles.prose}>
                    {session.recap ||
                      w("No recap recorded yet.", "Итоги пока не записаны.")}
                  </p>
                  <Link
                    className="text-link"
                    href={`/campaigns/${campaignId}/sessions`}
                  >
                    {t("Sessions")} <Icon name="ArrowRight" size={14} />
                  </Link>
                </article>
              ))}
            {!records.sessions.length && (
              <Empty>
                {w(
                  "Your recorded sessions will appear here.",
                  "Здесь появятся сохранённые сессии.",
                )}
              </Empty>
            )}
          </Panel>
          <Disclosure
            campaignId={campaignId}
            name="journal-timelines"
            title={w(
              "Timelines & saved branches",
              "Хронология и ветви сохранений",
            )}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <PersistentTimelineExplorer />
            </ReviewTool>
          </Disclosure>
          <div className={styles.tools}>
            <Link className="text-link" href={`/campaigns/${campaignId}/world`}>
              {w("Explore a what-if", "Исследовать «что, если»")}{" "}
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </>
      )}
      {tab === "People" && (
        <>
          <div className={styles.grid}>
            {records.people.map((person) => (
              <Panel key={person.id} className={styles.card}>
                <div className={styles.symbol}>
                  <Icon name="UserRound" size={40} />
                </div>
                <h2>{person.name}</h2>
                <Badge>
                  {person.kind === "companion"
                    ? t("Companion")
                    : w("Known person", "Знакомый человек")}
                </Badge>
                <Disclosure
                  campaignId={campaignId}
                  name={`journal-person-${person.id}`}
                  title={w("What you know", "Что вам известно")}
                >
                  <p className={styles.prose}>
                    {person.details ||
                      w(
                        "No public details recorded.",
                        "Публичных сведений пока нет.",
                      )}
                  </p>
                </Disclosure>
              </Panel>
            ))}
          </div>
          {!records.people.length && (
            <Panel>
              <Empty icon="Users">
                {w(
                  "No known people recorded yet.",
                  "Знакомые люди пока не записаны.",
                )}
              </Empty>
            </Panel>
          )}
          <Disclosure
            campaignId={campaignId}
            name="journal-people-corrections"
            title={w("Edit / Correct known people", "Изменить / Исправить знакомых людей")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <KnownPeopleCorrections data={data} />
            </ReviewTool>
          </Disclosure>
        </>
      )}
      {tab === "Locations" && (
        <>
          <div className={styles.grid}>
            {records.locations.map((location) => (
              <Panel className={styles.card} key={location.id}>
                <Icon name="map" />
                <h2>{location.name}</h2>
                <Badge green={location.status === "visited"}>
                  {t(location.status === "visited" ? "Visited" : "Known")}
                </Badge>
                <p className={styles.prose}>{location.description}</p>
              </Panel>
            ))}
          </div>
          {!records.locations.length && (
            <Panel>
              <Empty icon="map">{t("No known locations recorded.")}</Empty>
            </Panel>
          )}
          <div className={styles.tools}>
            <Link className="text-link" href={`/campaigns/${campaignId}/map`}>
              {t("Open map")} <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
          <Disclosure
            campaignId={campaignId}
            name="journal-belonging"
            title={w("Places of belonging", "Места, где вы дома")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <PersistentPlacesBelonging />
            </ReviewTool>
          </Disclosure>
        </>
      )}
      {tab === "Evidence" && (
        <div className="journal-grid">
          <Disclosure
            campaignId={campaignId}
            name="journal-evidence-board"
            title={w("Evidence board", "Доска улик")}
            defaultOpen
          >
            <div className={styles.board}>
              <p className="muted">
                {w(
                  "Saved evidence and your notes. Connections are yours to draw.",
                  "Сохранённые улики и ваши заметки. Связи между ними определяете вы.",
                )}
              </p>
              <div className={styles.grid}>
                {records.evidenceItems.map((item) => (
                  <button
                    className={styles.boardCard}
                    key={item.id}
                    onClick={() =>
                      setSelected({
                        title: item.name,
                        body: item.description,
                        source: item.category,
                      })
                    }
                  >
                    <div className={styles.symbol}>
                      <Icon name="Package" size={34} />
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.category}</p>
                  </button>
                ))}
                {records.notes.map((scene) => (
                  <button
                    className={styles.boardCard}
                    key={scene.id}
                    onClick={() =>
                      setSelected({
                        title: scene.title,
                        body: scene.body,
                        source: w("Journal note", "Заметка"),
                      })
                    }
                  >
                    <div className={styles.symbol}>
                      <Icon name="FileText" size={34} />
                    </div>
                    <h3>{scene.title}</h3>
                    <p>{w("Journal note", "Заметка")}</p>
                  </button>
                ))}
              </div>
              {!records.evidenceItems.length && !records.notes.length && (
                <Empty>
                  {w(
                    "No evidence or notes have been recorded yet.",
                    "Улики и заметки пока не записаны.",
                  )}
                </Empty>
              )}
            </div>
          </Disclosure>
          <aside>
            <Disclosure
              campaignId={campaignId}
              name="journal-evidence-notes"
              title={w("Your notes", "Ваши заметки")}
            >
              {records.notes.map((scene) => (
                <p key={scene.id}>
                  <Button
                    onClick={() =>
                      setSelected({
                        title: scene.title,
                        body: scene.body,
                        source: w("Journal note", "Заметка"),
                      })
                    }
                  >
                    {scene.title}
                  </Button>
                </p>
              ))}
              <Button onClick={() => setTab("Notes")}>
                {t("Notes")} <Icon name="ArrowRight" size={14} />
              </Button>
            </Disclosure>
          </aside>
        </div>
      )}
      {tab === "Notes" && (
        <>
          <div className={styles.tools}>
            <Button
              primary
              disabled={
                reviewOnly ||
                !records.sessions.some(
                  (row) => row.id === data.publicState.current_session_id,
                )
              }
              onClick={() => setNote(true)}
            >
              {t("Add note")}
            </Button>
          </div>
          {!records.sessions.some(
            (row) => row.id === data.publicState.current_session_id,
          ) && (
            <p className="muted">
              {w(
                "Choose a current session in Sessions before adding a note.",
                "Выберите текущую сессию в разделе «Сессии», чтобы добавить заметку.",
              )}
            </p>
          )}
          <div className={styles.grid}>
            {records.notes.map((scene) => (
              <Panel className={styles.card} key={scene.id}>
                <h2>{scene.title}</h2>
                <p className={styles.prose}>{scene.body}</p>
                <time className="muted" dateTime={scene.created_at}>
                  {new Date(scene.created_at).toLocaleDateString(language)}
                </time>
              </Panel>
            ))}
          </div>
          {!records.notes.length && (
            <Panel>
              <Empty>
                {w(
                  "A place for thoughts you want to keep.",
                  "Место для мыслей, которые хочется сохранить.",
                )}
              </Empty>
            </Panel>
          )}
          <Disclosure
            campaignId={campaignId}
            name="journal-note-corrections"
            title={w("Edit / Correct notes", "Изменить / Исправить заметки")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <PersistentSessions />
            </ReviewTool>
          </Disclosure>
        </>
      )}
      <Disclosure
        campaignId={campaignId}
        name="journal-adventures"
        title={w("Advanced · Adventure management", "Дополнительно · Управление приключениями")}
      >
        <ReviewTool reviewOnly={reviewOnly}>
          <PersistentAdventures />
          <PersistentAdventureLoot />
        </ReviewTool>
      </Disclosure>
      {note && !reviewOnly && (
        <NoteEditor data={data} onClose={() => setNote(false)} />
      )}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <Badge>{selected.source}</Badge>
          <p className={styles.prose}>{selected.body}</p>
        </Modal>
      )}
    </>
  );
}

function MapView({
  data,
  reviewOnly,
  reviewPlacements,
  reviewPreset,
}: {
  data: CampaignSnapshot;
  reviewOnly?: boolean;
  reviewPlacements?: MapPlacement[];
  reviewPreset?: {
    level?: "world" | "region" | "local";
    artwork?: "placeholder" | "collapsed";
    panel?: "edit-open" | "unplaced-open";
    detail?: boolean;
  };
}) {
  const { t } = useLanguage();
  const w = useWords();
  const campaignId = data.campaign.id;
  return (
    <>
      <Heading
        data={data}
        title={t("Map & Travel")}
        reviewOnly={reviewOnly}
        description={w(
          "Known places. The next road is yours to choose.",
          "Знакомые места. Следующую дорогу выбираете вы.",
        )}
      />
      <AtlasMap
        snapshot={data}
        reviewOnly={reviewOnly}
        reviewPlacements={reviewPlacements}
        reviewPreset={reviewPreset}
      />
      <Disclosure
        campaignId={campaignId}
        name="map-belonging"
        title={w("Places of belonging", "Места, где вы дома")}
      >
        <ReviewTool reviewOnly={reviewOnly}>
          <PersistentPlacesBelonging />
        </ReviewTool>
      </Disclosure>
      <Disclosure
        campaignId={campaignId}
        name="map-what-if"
        title={w("What-if tools", "Инструменты «что, если»")}
      >
        <p className="muted">
          {w(
            "World Lab is a detached possibility. Its places and routes do not change this playable atlas.",
            "Лаборатория миров показывает отдельную возможность. Её места и маршруты не меняют этот игровой атлас.",
          )}
        </p>
        {reviewOnly ? (
          <span className="text-link" aria-disabled="true">{w("Explore a what-if", "Исследовать «что, если»")}</span>
        ) : (
          <Link className="text-link" href={`/campaigns/${campaignId}/world`}>
            {w("Explore a what-if", "Исследовать «что, если»")}{" "}
            <Icon name="ArrowRight" size={14} />
          </Link>
        )}
      </Disclosure>
      <Disclosure
        campaignId={campaignId}
        name="map-corrections"
        title={w("Edit / Correct records", "Изменить / Исправить записи")}
      >
        <ReviewTool reviewOnly={reviewOnly}>
          <PersistentSupporting screen="map" />
        </ReviewTool>
      </Disclosure>
    </>
  );
}
function SessionsView({
  data,
  reviewOnly,
}: {
  data: CampaignSnapshot;
  reviewOnly?: boolean;
}) {
  const { t } = useLanguage();
  const w = useWords();
  const records = secondaryPageRecords(data);
  const [tab, setTab] = useState("Session");
  const [selectedId, setSelectedId] = useState(
    data.publicState.current_session_id ?? records.sessions[0]?.id ?? "",
  );
  const selected =
    records.sessions.find((row) => row.id === selectedId) ??
    records.sessions[0];
  const scenes = records.scenes.filter(
    (row) => row.session_id === selected?.id,
  );
  const moments = scenes.filter((row) => row.role === "narration").slice(-4);
  return (
    <>
      <Heading
        data={data}
        title={w("Sessions", "Сессии")}
        reviewOnly={reviewOnly}
        description={t("Some moments stay with you.")}
      />
      <Tabs options={["Session", "Saves"]} value={tab} onChange={setTab} />
      {tab === "Saves" ? (
        <ReviewTool reviewOnly={reviewOnly}>
          <PersistentSaves />
        </ReviewTool>
      ) : (
        <>
          {records.sessions.length > 0 && (
            <label className="field">
              {w("Session", "Сессия")}
              <select
                value={selected?.id ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {records.sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {selected ? (
            <>
              <div className="recap-grid">
                <div className={styles.poster}>
                  <span className="eyebrow">{data.campaign.title}</span>
                  <h2>{selected.title}</h2>
                  <Badge>
                    {t(selected.status === "open" ? "Open" : "Closed")}
                  </Badge>
                  {selected.id === data.publicState.current_session_id && (
                    <p>{t("Saved resume point")}</p>
                  )}
                </div>
                <Panel className={styles.card}>
                  <h2>{w("Recorded moments", "Сохранённые моменты")}</h2>
                  {moments.map((scene) => (
                    <article className={styles.moment} key={scene.id}>
                      <h3>{scene.title}</h3>
                      <p>
                        {scene.body.length > 220
                          ? scene.body.slice(0, 220) + "…"
                          : scene.body}
                      </p>
                    </article>
                  ))}
                  {!moments.length && (
                    <Empty>
                      {w(
                        "No story scenes recorded yet.",
                        "Сцены истории пока не записаны.",
                      )}
                    </Empty>
                  )}
                </Panel>
              </div>
              <div className="recap-notes">
                <Panel className={styles.card}>
                  <h2>{t("The story so far")}</h2>
                  <p className={styles.prose}>
                    {selected.recap ||
                      w(
                        "No session recap recorded yet.",
                        "Итоги сессии пока не записаны.",
                      )}
                  </p>
                </Panel>
                <Panel className={styles.card}>
                  <h2>{w("Session notes", "Заметки сессии")}</h2>
                  {scenes
                    .filter((row) => row.role === "note")
                    .slice(-3)
                    .map((scene) => (
                      <Disclosure
                        key={scene.id}
                        campaignId={data.campaign.id}
                        name={`session-note-${scene.id}`}
                        title={scene.title}
                      >
                        <p className={styles.prose}>{scene.body}</p>
                      </Disclosure>
                    ))}
                  {!scenes.some((row) => row.role === "note") && (
                    <p className="muted">
                      {w(
                        "No notes in this session.",
                        "В этой сессии нет заметок.",
                      )}
                    </p>
                  )}
                </Panel>
                <Panel className={styles.card}>
                  <h2>
                    {w(
                      selected.id === data.publicState.current_session_id
                        ? "Where we left off"
                        : "Last recorded scene",
                      selected.id === data.publicState.current_session_id
                        ? "Где мы остановились"
                        : "Последняя сцена",
                    )}
                  </h2>
                  <p className={styles.prose}>
                    {(selected.id === data.publicState.current_session_id
                      ? scenes.find(
                          (scene) =>
                            scene.id === data.publicState.current_scene_id,
                        )
                      : scenes.at(-1)
                    )?.body ||
                      w(
                        "No saved scene in this session.",
                        "В этой сессии нет сохранённой сцены.",
                      )}
                  </p>
                </Panel>
              </div>
              <Disclosure
                campaignId={data.campaign.id}
                name={`session-transcript-${selected.id}`}
                title={w("Full session transcript", "Полная история сессии")}
              >
                {scenes.map((scene) => (
                  <article className={styles.moment} key={scene.id}>
                    <Badge>
                      {scene.role === "note"
                        ? w("Note", "Заметка")
                        : t(scene.role === "player" ? "Player" : "Narration")}
                    </Badge>
                    <h3>{scene.title}</h3>
                    <p className={styles.prose}>{scene.body}</p>
                  </article>
                ))}
              </Disclosure>
              <Disclosure
                campaignId={data.campaign.id}
                name={`session-memory-${selected.id}`}
                title={w(
                  "Session continuity & summaries",
                  "Продолжение и итоги сессии",
                )}
              >
                <ReviewTool reviewOnly={reviewOnly}>
                  <SessionMemoryPanel sessionId={selected.id} />
                </ReviewTool>
              </Disclosure>
            </>
          ) : (
            <Panel>
              <Empty>
                {w(
                  "Your sessions will appear here as your story unfolds.",
                  "Здесь появятся сессии вашей истории.",
                )}
              </Empty>
            </Panel>
          )}
          <div className={styles.tools}>
            <Link
              className="text-link"
              href={`/campaigns/${data.campaign.id}/gallery`}
            >
              {t("Gallery")} <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
          <Disclosure
            campaignId={data.campaign.id}
            name="sessions-corrections"
            title={w("Edit / Correct records", "Изменить / Исправить записи")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <PersistentSessions />
            </ReviewTool>
          </Disclosure>
        </>
      )}
    </>
  );
}

function AssetVisual({
  data,
  asset,
  mapPlacements,
  mediaTransport,
  videoTransport,
  reviewOnly,
}: {
  data: CampaignSnapshot;
  asset: Asset;
  mapPlacements: MapPlacement[];
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
  reviewOnly?: boolean;
}) {
  const w = useWords();
  if (safeMapVisualAsset(data, asset, mapPlacements))
    return reviewOnly ? (
      <div className={styles.syntheticGalleryMap} role="img" aria-label={w("Synthetic atlas illustration preview", "Синтетический пример изображения атласа")} />
    ) : (
      <Image unoptimized src={(mediaTransport ?? defaultMediaFrameTransport).imageUrl(data.campaign.id, asset.id)} alt={asset.title} width={1536} height={1024} className={styles.galleryMapImage} />
    );
  if (safeFrameAsset(data, asset) && (!reviewOnly || mediaTransport))
    return <StoredFrameImage asset={asset} transport={mediaTransport} />;
  if (safeVideoAsset(data, asset) && (!reviewOnly || videoTransport))
    return <StoredSceneVideo asset={asset} transport={videoTransport} />;
  const art = mockArtForAsset(asset);
  if (asset.description.startsWith(MOCK_ASSET_PREFIX) && art)
    return (
      <>
        <MockVisualArt art={art} label={asset.title} />
        <p className="muted">{w("Placeholder sketch", "Условный эскиз")}</p>
      </>
    );
  if (
    [
      REAL_FRAME_ASSET_PREFIX,
      "RPG_OWNER_FRAME_ASSET_V1\n",
      VIDEO_ASSET_PREFIX,
    ].some((prefix) => asset.description.startsWith(prefix))
  )
    return (
      <div className={styles.empty}>
        <Icon name="Image" size={44} />
        <p>
          {w(
            "This media is unavailable. Review its saved history below.",
            "Медиа недоступно. Проверьте историю сохранения ниже.",
          )}
        </p>
      </div>
    );
  return (
    <div className={styles.symbol}>
      <Icon name={asset.kind === "document" ? "FileText" : "Image"} size={44} />
    </div>
  );
}

function GalleryView({
  data,
  mediaTransport,
  videoTransport,
  reviewOnly,
  reviewMapPlacements,
  reviewInitialTab,
}: {
  data: CampaignSnapshot;
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
  reviewOnly?: boolean;
  reviewMapPlacements?: MapPlacement[];
  reviewInitialTab?: "Maps";
}) {
  const { t } = useLanguage();
  const w = useWords();
  const [tab, setTab] = useState(reviewInitialTab ?? "Frames");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapPlacements, setMapPlacements] = useState<MapPlacement[]>(reviewOnly ? reviewMapPlacements ?? [] : []);
  const timelineId = data.timeline?.timelineId;
  const timelineEpoch = data.timeline?.epoch;
  useEffect(() => {
    if (reviewOnly) return;
    let active = true;
    void loadMapLayout(data.campaign.id).then((result) => {
      if (
        active &&
        result.timeline.timelineId === timelineId &&
        result.timeline.epoch === timelineEpoch
      ) setMapPlacements(result.placements);
    }).catch(() => { if (active) setMapPlacements([]); });
    return () => { active = false; };
  }, [data.campaign.id, timelineId, timelineEpoch, reviewOnly]);
  const records = secondaryPageRecords(data);
  const maps = galleryMapAssets(data, mapPlacements);
  const assets =
    tab === "Videos"
      ? records.assets.filter((asset) => asset.kind === "video")
      : tab === "Maps"
        ? maps
      : tab === "Characters"
        ? gallerySubjectAssets(data, "entity")
        : tab === "Locations"
          ? gallerySubjectAssets(data, "location")
          : tab === "Items"
            ? gallerySubjectAssets(data, "item")
            : records.assets.filter((asset) => asset.kind === "image" && !asset.description.startsWith(MAP_VISUAL_ASSET_PREFIX));
  const selected = assets.find((asset) => asset.id === selectedId);
  const reserved = (asset: Asset) =>
    [
      MOCK_ASSET_PREFIX,
      REAL_FRAME_ASSET_PREFIX,
      "RPG_OWNER_FRAME_ASSET_V1\n",
      VIDEO_ASSET_PREFIX,
      MAP_VISUAL_ASSET_PREFIX,
    ].some((prefix) => asset.description.startsWith(prefix));
  return (
    <>
      <Heading
        data={data}
        title={t("Gallery")}
        reviewOnly={reviewOnly}
        description={t("Some moments stay with you.")}
      />
      <GalleryTabs value={tab} onChange={setTab} />
      {tab === "Visual references" ? (
        <ReviewTool reviewOnly={reviewOnly}>
          <PersistentMediaVisualFrame mediaTransport={mediaTransport} />
        </ReviewTool>
      ) : (
        <>
          <div className={styles.mediaGrid}>
            {assets.map((asset) => (
              <Panel className={styles.mediaCard} key={asset.id}>
                <AssetVisual
                  data={data}
                  asset={asset}
                  mapPlacements={mapPlacements}
                  mediaTransport={mediaTransport}
                  videoTransport={videoTransport}
                  reviewOnly={reviewOnly}
                />
                <div className={styles.mediaBody}>
                  <button
                    className={styles.mediaOpen}
                    onClick={() => setSelectedId(asset.id)}
                  >
                    <h3>{asset.title}</h3>
                  </button>
                  <Badge>{t(asset.kind === "video" ? "Video" : "Image")}</Badge>
                  {reviewOnly && tab === "Maps" && <Badge>{w("Synthetic preview", "Синтетический пример")}</Badge>}
                  {!reserved(asset) && asset.description && (
                    <p className={styles.prose}>{asset.description}</p>
                  )}
                </div>
              </Panel>
            ))}
          </div>
          {!assets.length && (
            <Panel>
              <Empty icon="Image">
                {w(
                  tab === "Maps"
                    ? "No accepted atlas images yet. The Map works without artwork. Generate one from its Map artwork section when you wish."
                    : ["Characters", "Locations", "Items"].includes(tab)
                      ? "No saved visual associations in this category. Manage associations under Visual references."
                      : "No saved media in this view yet. Capture a moment from Game when you want one.",
                  tab === "Maps"
                    ? "Пока нет принятых изображений атласа. Карта работает без фона. При желании создайте его в разделе «Изображение карты»."
                    : ["Characters", "Locations", "Items"].includes(tab)
                      ? "В этой категории нет сохранённых визуальных связей. Настройте их во вкладке «Визуальные образы»."
                      : "В этом разделе пока нет сохранённых медиа. Создайте кадр из Игры, когда захотите.",
                )}
              </Empty>
            </Panel>
          )}
          <div className={styles.tools}>
            {reviewOnly ? (
              <span className="text-link" aria-disabled="true">{w("Capture the current scene", "Запечатлеть текущую сцену")}</span>
            ) : (
              <Link
                className="text-link"
                href={`/campaigns/${data.campaign.id}/game`}
              >
                {w("Capture the current scene", "Запечатлеть текущую сцену")}{" "}
                <Icon name="ArrowRight" size={14} />
              </Link>
            )}
            <Button onClick={() => setTab("Visual references")}>
              {w("Visual references", "Визуальные образы")}
            </Button>
          </div>
          <Disclosure
            campaignId={data.campaign.id}
            name="gallery-history"
            title={w("Image & video history", "История изображений и видео")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <RealFrameHistory transport={mediaTransport} />
              <SceneVideoHistory transport={videoTransport} />
            </ReviewTool>
          </Disclosure>
          <Disclosure
            campaignId={data.campaign.id}
            name="gallery-corrections"
            title={w("Manage asset records", "Управление файлами")}
          >
            <ReviewTool reviewOnly={reviewOnly}>
              <PersistentSupporting
                screen="gallery"
                mediaTransport={mediaTransport}
                videoTransport={videoTransport}
              />
            </ReviewTool>
          </Disclosure>
        </>
      )}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelectedId(null)}>
          <div className={styles.lightbox}>
            <AssetVisual
              data={data}
              asset={selected}
              mapPlacements={mapPlacements}
              mediaTransport={mediaTransport}
              videoTransport={videoTransport}
              reviewOnly={reviewOnly}
            />
          </div>
          {!reserved(selected) && (
            <p className={styles.prose}>{selected.description}</p>
          )}
        </Modal>
      )}
    </>
  );
}

/** Also mounted with isolated public fixtures by the visual review harness. */
export function SecondaryPageView({
  screen,
  data,
  mediaTransport,
  videoTransport,
  reviewOnly,
  reviewMapPlacements,
  reviewMapPreset,
  reviewGalleryTab,
}: {
  screen: SecondaryScreen;
  data: CampaignSnapshot;
  mediaTransport?: MediaFrameTransport;
  videoTransport?: VideoTransport;
  reviewOnly?: boolean;
  reviewMapPlacements?: MapPlacement[];
  reviewGalleryTab?: "Maps";
  reviewMapPreset?: {
    level?: "world" | "region" | "local";
    artwork?: "placeholder" | "collapsed";
    panel?: "edit-open" | "unplaced-open";
    detail?: boolean;
  };
}) {
  const w = useWords();
  return (
    <div className={styles.page}>
      {reviewOnly && (
        <p className="inline-notice" role="status">
          {w(
            "Synthetic UI review — fixture records only. Gameplay, editing and generation are disabled.",
            "Синтетический обзор интерфейса — только тестовые записи. Игра, редактирование и генерация отключены.",
          )}
        </p>
      )}
      {screen === "journal" ? (
        <JournalView
          key={data.campaign.id}
          data={data}
          reviewOnly={reviewOnly}
        />
      ) : screen === "map" ? (
        <MapView key={data.campaign.id} data={data} reviewOnly={reviewOnly} reviewPlacements={reviewMapPlacements} reviewPreset={reviewMapPreset} />
      ) : screen === "sessions" ? (
        <SessionsView
          key={data.campaign.id}
          data={data}
          reviewOnly={reviewOnly}
        />
      ) : (
        <GalleryView
          key={data.campaign.id}
          data={data}
          mediaTransport={mediaTransport}
          videoTransport={videoTransport}
          reviewOnly={reviewOnly}
          reviewMapPlacements={reviewMapPlacements}
          reviewInitialTab={reviewGalleryTab}
        />
      )}
    </div>
  );
}

export function PersistentSecondaryPage({
  screen,
}: {
  screen: SecondaryScreen;
}) {
  return (
    <RecordBoundary>
      {(data) => <SecondaryPageView data={data} screen={screen} />}
    </RecordBoundary>
  );
}

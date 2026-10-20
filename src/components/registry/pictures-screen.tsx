"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { anchorFor, frameCaptionOf, galleryChapters, type PublicPicture } from "@/lib/visual-frame/pictures";
import { FrameLightbox, usePictures, type LightboxEntry } from "./live-frames";
import { RedrawAnchor } from "./redraw-anchor";
import { useChrome } from "./shell";
import { Art, Panel, Plate, registry as r, TabBar, useCopy, type SubjectRef } from "./primitives";
import s from "./journal-codex.module.css";

// Polish 2 §6: «Визуальная библия» and «Галерея» merged into one «Картинки» page. Fix run E (item 80, the owner's
// proposal): the page becomes the campaign's gallery and replaces the chronicle — every frame in story order by session,
// each with its own caption, a large view with «К ходу» and «Перерисовать»; the people, places and things with their
// anchors (click one to redraw it or edit its visual profile) and the drawn maps on their own tabs. The chronicle and
// its one-click batch redraw left the navigation. The earlier screens stay under «Ещё».

type Subject = { subject: SubjectRef; name: string; detail: string };
type Tab = "frames" | "people" | "places" | "things" | "maps";
export function RegistryPictures({ data, play = null, legacy }: { data: CampaignSnapshot; play?: PlaySnapshot | null; legacy?: ReactNode }) {
  const c = useCopy();
  const chrome = useChrome();
  const pictures = usePictures();
  const [tab, setTab] = useState<Tab>("frames");
  const [chosen, setChosen] = useState<Subject | null>(null);
  const [open, setOpen] = useState<{ entries: LightboxEntry[]; index: number } | null>(null);
  const settingsHref = chrome?.href?.("settings") ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/settings`;
  const gameHref = chrome?.href?.("game") ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/game`;
  const people: Subject[] = data.entities.filter((row) => ["player", "companion", "npc"].includes(row.kind) && !row.public_profile?.unmet).map((row) => ({ subject: { kind: "entity", id: row.id }, name: row.name, detail: row.details }));
  const holdings: Subject[] = data.entities.filter((row) => ["transport", "mount"].includes(row.kind)).map((row) => ({ subject: { kind: "entity", id: row.id }, name: row.name, detail: row.details }));
  const places: Subject[] = data.locations.filter((row) => row.status !== "rumored").map((row) => ({ subject: { kind: "location", id: row.id }, name: row.name, detail: row.description }));
  const things: Subject[] = data.items.filter((row) => row.quantity > 0).map((row) => ({ subject: { kind: "item", id: row.id }, name: row.name, detail: row.description }));
  const board = pictures?.board ?? null;
  const drawn = (subject: SubjectRef) => board ? ["portrait", "figure", "holding", "location", "item", "atlas"].some((composition) => anchorFor(board, subject, composition as PublicPicture["composition"]).picture) : false;
  // The frames in story order by session (chapter); without the turns (a preview) the frames in the order drawn.
  const chapters = board && play?.turns.length ? galleryChapters(data, play.turns, board) : [];
  const loose: LightboxEntry[] = board && !chapters.length ? board.pictures.filter((row) => row.kind === "frame" && row.status === "ready" && !row.hidden)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((picture) => ({ turn: { id: picture.subjectId, input: "", narration: picture.caption }, picture })) : [];
  const frameCount = chapters.reduce((sum, chapter) => sum + chapter.frames.length, 0) || loose.length;
  const maps = board ? data.locations.map((row) => ({ location: row, picture: anchorFor(board, { kind: "location", id: row.id }, "atlas").picture })).filter((row) => row.picture) : [];
  const redraw = (entry: LightboxEntry) => {
    if (!pictures || pictures.preview) return;
    void pictures.send("pictures.frame", { operationId: entry.turn.id, trigger: "redraw" }).catch(() => {});
    setOpen(null);
  };
  const group = (title: string, rows: Subject[], empty: string) => (
    <Panel eyebrow={title}>
      {rows.length ? (
        <div className={s.entries}>
          {rows.map((row) => (
            <button type="button" key={`${row.subject.kind}:${row.subject.id}`} className={s.entry} style={{ textAlign: "left", background: "none", border: 0, padding: 0, cursor: "pointer" }}
              aria-pressed={chosen?.subject.id === row.subject.id} onClick={() => setChosen(row)} data-testid="picture-subject">
              <span className={r.avatarSmall}><Art subject={row.subject} name={row.name} /></span>
              <div>
                <b className={s.entryName}>{row.name}{!drawn(row.subject) && <span className={r.chip} style={{ marginLeft: 8 }}>{c("без картинки", "no picture")}</span>}</b>
                {row.detail && <p className={s.entryText}>{row.detail.slice(0, 140)}</p>}
              </div>
            </button>
          ))}
        </div>
      ) : <p className={r.empty}>{empty}</p>}
    </Panel>
  );
  const frameGrid = (entries: LightboxEntry[]) => (
    <div className={s.gallery} role="list">
      {entries.map((entry, index) => (
        <button key={entry.picture.id} type="button" role="listitem" className={s.galleryFrame} onClick={() => setOpen({ entries, index })} data-testid="gallery-frame">
          {/* Short-lived authenticated URLs; next/image cannot proxy them. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pictures?.urlFor(entry.picture) ?? ""} alt="" loading="lazy" />
          <span className={s.galleryCaption}>{frameCaptionOf(entry.turn, entry.picture) || c("кадр хода", "turn frame")}</span>
          {entry.picture.review && !entry.picture.review.ok && <span className={r.badgeAmber}>{c("проверка: ", "check: ")}{entry.picture.review.problems[0]}</span>}
        </button>
      ))}
    </div>
  );
  const tabs = [
    { id: "frames" as const, label: c(`Кадры · ${frameCount}`, `Frames · ${frameCount}`) },
    { id: "people" as const, label: c("Люди", "People") },
    { id: "places" as const, label: c("Места", "Places") },
    { id: "things" as const, label: c("Вещи", "Things") },
    { id: "maps" as const, label: c("Карты", "Maps") },
  ];
  const zone = board?.settings.timeZone && board.settings.timeZone !== "UTC" ? board.settings.timeZone : null;
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · галерея`, `${data.campaign.title} · gallery`)} title={c("Галерея", "Gallery")}
        sub={c("Все кадры кампании по порядку истории, портреты, места, вещи и карты. Нажми на кадр, чтобы открыть его крупно, перейти к ходу или перерисовать; на запись — чтобы перерисовать картинку или поправить визуальный профиль.",
          "Every frame of the campaign in story order, the portraits, places, things and maps. Open a frame large to go to its turn or redraw it; pick an entry to redraw its picture or edit its visual profile.")} />
      <div className={r.row}>
        <Link className={r.btnGhost} href={settingsHref}>{c("Стиль и настройки картинок", "Style and picture settings")}</Link>
        {board && <span className={r.note}>{c(`Сегодня: ${board.today.count} из ${board.settings.dailyCap}`, `Today: ${board.today.count} of ${board.settings.dailyCap}`)}
          {zone ? c(` · новый день в полночь (${zone})`, ` · a new day at midnight (${zone})`) : ""}</span>}
      </div>
      <TabBar tabs={tabs} value={tab} onChange={(id) => { setTab(id); setChosen(null); }} label={c("Разделы галереи", "Gallery sections")} wrap />
      {chosen && (
        <Panel eyebrow={chosen.name} action={<button type="button" className={r.btnGhost} onClick={() => setChosen(null)}>{c("Закрыть", "Close")}</button>}>
          <RedrawAnchor data={data} subject={chosen.subject} name={chosen.name} />
        </Panel>
      )}
      {tab === "frames" && (
        frameCount && pictures ? (
          chapters.length ? chapters.map((chapter) => (
            <Panel key={chapter.session.id} eyebrow={c(`Глава ${chapter.number}`, `Chapter ${chapter.number}`)}>
              <h2 className={r.h2}>{chapter.session.title}</h2>
              {frameGrid(chapter.frames)}
            </Panel>
          )) : <Panel eyebrow={c("Кадры", "Frames")}>{frameGrid(loose)}</Panel>
        ) : <p className={r.empty}>{c("Кадров пока нет: они рисуются по ходам.", "No frames yet: they are drawn as the turns go.")}</p>
      )}
      {tab === "people" && <>{group(c("Люди", "People"), people, c("Людей пока нет.", "No people yet."))}{holdings.length > 0 && group(c("Транспорт и ездовые", "Transport and mounts"), holdings, "")}</>}
      {tab === "places" && group(c("Места", "Places"), places, c("Мест пока нет.", "No places yet."))}
      {tab === "things" && group(c("Вещи", "Things"), things, c("Вещей пока нет.", "No things yet."))}
      {tab === "maps" && (
        maps.length && pictures ? (
          <div className={s.gallery} role="list">
            {maps.map(({ location, picture }) => (
              <figure key={location.id} role="listitem" className={s.galleryFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pictures.urlFor(picture!) ?? ""} alt="" loading="lazy" />
                <figcaption className={s.galleryCaption}>{location.name}</figcaption>
              </figure>
            ))}
          </div>
        ) : <p className={r.empty}>{c("Нарисованных карт пока нет: карту места рисуют на экране карты.", "No drawn maps yet: a place's map is drawn on the map screen.")}</p>
      )}
      {open && pictures && (
        <FrameLightbox entries={open.entries} index={open.index} urlFor={pictures.urlFor} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)}
          turnHref={(turnId) => `${gameHref}#saved-turn-${turnId}`} onRedraw={pictures.preview ? undefined : redraw} />
      )}
      {legacy && (
        <details className={r.panel} style={{ padding: "4px 14px 10px" }}>
          <summary style={{ fontFamily: "var(--f-display)", fontSize: 17, color: "var(--muted)", cursor: "pointer" }}>{c("Ещё · прежние экраны (галерея и визуальная библия)", "More · the earlier screens (gallery and visual bible)")}</summary>
          {legacy}
        </details>
      )}
    </div>
  );
}

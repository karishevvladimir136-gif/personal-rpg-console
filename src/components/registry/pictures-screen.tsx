"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { anchorFor, frameFor, type PublicPicture } from "@/lib/visual-frame/pictures";
import { usePictures } from "./live-frames";
import { RedrawAnchor } from "./redraw-anchor";
import { useChrome } from "./shell";
import { Art, Panel, Plate, registry as r, useCopy, type SubjectRef } from "./primitives";
import s from "./journal-codex.module.css";

// Polish 2 §6: «Визуальная библия» and «Галерея» merged into one «Картинки» page: the campaign's
// pictures as the Stage V board holds them — the people, places and things with their anchors
// (click one to redraw it or edit its visual profile), the frames of the turns, the style and the
// picture settings one click away. The earlier screens stay under «Ещё».

type Subject = { subject: SubjectRef; name: string; detail: string };
export function RegistryPictures({ data, legacy }: { data: CampaignSnapshot; legacy?: ReactNode }) {
  const c = useCopy();
  const chrome = useChrome();
  const pictures = usePictures();
  const [chosen, setChosen] = useState<Subject | null>(null);
  const href = (screen: "settings" | "chronicle") => (screen === "settings" ? chrome?.href?.("settings") : null) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const people: Subject[] = data.entities.filter((row) => ["player", "companion", "npc"].includes(row.kind)).map((row) => ({ subject: { kind: "entity", id: row.id }, name: row.name, detail: row.details }));
  const holdings: Subject[] = data.entities.filter((row) => ["transport", "mount"].includes(row.kind)).map((row) => ({ subject: { kind: "entity", id: row.id }, name: row.name, detail: row.details }));
  const places: Subject[] = data.locations.filter((row) => row.status !== "rumored").map((row) => ({ subject: { kind: "location", id: row.id }, name: row.name, detail: row.description }));
  const things: Subject[] = data.items.filter((row) => row.quantity > 0).map((row) => ({ subject: { kind: "item", id: row.id }, name: row.name, detail: row.description }));
  const board = pictures?.board ?? null;
  const drawn = (subject: SubjectRef) => board ? ["portrait", "figure", "holding", "location", "item", "atlas"].some((composition) => anchorFor(board, subject, composition as PublicPicture["composition"]).picture) : false;
  const frames = board ? [...board.pictures].filter((row) => row.kind === "frame" && row.status === "ready" && !row.hidden).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 24) : [];
  const turnOf = (picture: PublicPicture) => data.scenes.find((scene) => scene.id === picture.subjectId) ?? null;
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
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · картинки`, `${data.campaign.title} · pictures`)} title={c("Картинки", "Pictures")}
        sub={c("Портреты, места, вещи и кадры ходов — всё, что нарисовано в этой кампании. Нажми на запись, чтобы перерисовать картинку или поправить визуальный профиль.", "Portraits, places, things and the frames of the turns — everything drawn in this campaign. Pick an entry to redraw its picture or edit its visual profile.")} />
      <div className={r.row}>
        <Link className={r.btnGhost} href={href("settings")}>{c("Стиль и настройки картинок", "Style and picture settings")}</Link>
        <Link className={r.btnGhost} href={href("chronicle")}>{c("Хроника", "Chronicle")}</Link>
        {board && <span className={r.note}>{c(`Сегодня: ${board.today.count} из ${board.settings.dailyCap}`, `Today: ${board.today.count} of ${board.settings.dailyCap}`)}</span>}
      </div>
      {chosen && (
        <Panel eyebrow={chosen.name} action={<button type="button" className={r.btnGhost} onClick={() => setChosen(null)}>{c("Закрыть", "Close")}</button>}>
          <RedrawAnchor data={data} subject={chosen.subject} name={chosen.name} />
        </Panel>
      )}
      <div className={s.columns}>
        <div className={s.column}>
          {group(c("Люди", "People"), people, c("Людей пока нет.", "No people yet."))}
          {group(c("Места", "Places"), places, c("Мест пока нет.", "No places yet."))}
        </div>
        <div className={s.column}>
          {group(c("Вещи", "Things"), things, c("Вещей пока нет.", "No things yet."))}
          {holdings.length > 0 && group(c("Транспорт и ездовые", "Transport and mounts"), holdings, "")}
          <Panel eyebrow={c("Кадры ходов", "Frames of the turns")}>
            {frames.length && pictures ? (
              <div className={r.roster}>
                {frames.map((picture) => {
                  const scene = turnOf(picture);
                  return (
                    <div key={picture.id}>
                      {/* Short-lived authenticated URLs; next/image cannot proxy them. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pictures.urlFor(picture) ?? ""} alt="" style={{ width: 96, height: 54, objectFit: "cover", borderRadius: 4 }} />
                      <span className={r.small}>{scene?.body.slice(0, 80) ?? c("кадр хода", "turn frame")}</span>
                      <span className={`${r.small} ${r.muted}`}>{picture.trigger === "key_moment" ? c("ключевой момент", "key moment") : frameFor(board!, picture.subjectId).picture?.id === picture.id ? c("показан", "shown") : ""}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className={r.empty}>{c("Кадров пока нет: они рисуются по ходам.", "No frames yet: they are drawn as the turns go.")}</p>}
          </Panel>
        </div>
      </div>
      {legacy && (
        <details className={r.panel} style={{ padding: "4px 14px 10px" }}>
          <summary style={{ fontFamily: "var(--f-display)", fontSize: 17, color: "var(--muted)", cursor: "pointer" }}>{c("Ещё · прежние экраны (галерея и визуальная библия)", "More · the earlier screens (gallery and visual bible)")}</summary>
          {legacy}
        </details>
      )}
    </div>
  );
}

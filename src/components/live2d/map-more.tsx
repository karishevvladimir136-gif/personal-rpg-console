"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { RegionMap } from "@/lib/live2d/contracts";
import type { Live2dLevel, Live2dPin } from "@/lib/live2d/hierarchy";
import { registry as r, useCopy } from "../registry/primitives";
import s from "./live2d.module.css";

// Fix S3-accept Д1: the map levels' one «Ещё» — the old atlas's extra sections folded here: «Изменить размещение»
// (the owner drags the painted region's markers onto their objects), «Исправить записи» and «что, если» (the route's
// tools), and Д3's region prep — the DM's text the map is painted from, its roads and days, and the picture's check.
// The hidden part of the prep is never here: it lives in the DM's private notes, not in the board this reads.

const daysLabel = (days: number | null, ru: boolean) => (days === null ? "" : days < 0.3 ? (ru ? "рядом" : "near") : days < 0.75 ? (ru ? "полдня" : "half a day")
  : ru ? `${String(Math.round(days * 2) / 2).replace(".", ",")} дн.` : `${Math.round(days * 2) / 2} d`);

export function MapMore({ level, regionMap, names, marking, canMark, onMarking, documentHref, tools }: {
  level: Live2dLevel; regionMap: RegionMap | null; names: ReadonlyMap<string, string>;
  marking: boolean; canMark: boolean; onMarking: (value: boolean) => void; documentHref: string | null; tools?: ReactNode;
}) {
  const c = useCopy();
  const ru = c.language === "ru";
  // The owner's record tools mount only when «Ещё» is open: nothing of them loads or renders before.
  const [open, setOpen] = useState(false);
  const prep = level === "region" ? regionMap?.prep ?? null : null;
  const check = level === "region" ? regionMap?.check ?? null : null;
  const name = (id: string) => names.get(id) ?? "";
  return (
    <details className={s.tools} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{c("Ещё", "More")}</summary>
      <div className={s.toolsBody}>
        <section className={s.moreSection} aria-label={c("Изменить размещение", "Edit the layout")}>
          <b>{c("Изменить размещение", "Edit the layout")}</b>
          {canMark ? (
            <>
              <div className={r.row}>
                <button type="button" className={r.btnGhost} aria-pressed={marking} onClick={() => onMarking(!marking)}>{marking ? c("Готово", "Done") : c("Двигать метки", "Move markers")}</button>
              </div>
              <p className={`${r.small} ${r.muted}`}>{c("Перетащи метку на её место на картинке: так она и останется, и после перерисовки. Сама география края от этого не меняется.", "Drag a marker onto its place on the picture: it stays there, after a redraw too. The region's geography does not change.")}</p>
            </>
          ) : (
            <p className={`${r.small} ${r.muted}`}>{level === "region"
              ? c("Метки можно двигать, когда карта края нарисована.", "Markers can be moved once the region map is drawn.")
              : c("Здесь метки стоят по записям: что внутри чего, решают записи ведущего и подготовка края.", "Here the markers follow the records: what lies inside what comes from the DM's records and the region's prep.")}</p>
          )}
        </section>
        {prep && (
          <section className={s.moreSection} aria-label={c("Подготовка края", "The region's prep")}>
            <b>{c("Подготовка края", "The region's prep")}</b>
            <p className={r.small}>{c("Ведущий продумал край до того, как его нарисовали: по этому описанию рисуется картинка и ставятся метки; перерисовка меняет картинку, не географию.", "The DM designed the region before it was painted: the picture and the markers follow this text; a redraw changes the picture, never the geography.")}</p>
            {prep.overview && <p className={r.small}>{prep.overview}</p>}
            {prep.routes.length > 0 && (
              <ul className={s.moreList}>
                {prep.routes.filter((row) => name(row.from) && name(row.to)).map((row) => (
                  <li key={`${row.from}:${row.to}`}>{name(row.from)} — {name(row.to)}{row.way ? `: ${row.way}` : ""}{row.days !== null ? ` · ${daysLabel(row.days, ru)}` : ""}</li>
                ))}
              </ul>
            )}
            {prep.places.some((row) => row.x === null) && (
              <p className={`${r.small} ${r.muted}`}>{c("Положение примерное", "Position approximate")}: {prep.places.filter((row) => row.x === null && name(row.locationId)).map((row) => name(row.locationId)).join(", ")}</p>
            )}
            {documentHref && <Link className={r.small} href={documentHref} style={{ color: "var(--brass)" }}>{c("Открыть в Библиотеке (канон мира)", "Open in the Library (the world's canon)")}</Link>}
          </section>
        )}
        {check && (
          <p className={`${r.small} ${r.muted}`}>
            {c("Проверка картинки", "The picture's check")}: {check.items.filter((row) => row.visible).length}/{check.items.length} {c("мест найдено", "places found")}
            {regionMap?.sideList.length ? ` · ${c("не сошлось", "did not match")}: ${regionMap.sideList.join(", ")}` : ""}
            {check.contradictions.length ? ` · ${c("лишнее", "extra")}: ${check.contradictions.map((row) => row.what).join(", ")}` : ""}
          </p>
        )}
        {open && tools}
      </div>
    </details>
  );
}

/** A place chosen on the map that has nothing below it yet: what is known of it, and «Идём туда» into the action box. */
export function PlaceCard({ pin, where, onGo, onClose }: { pin: Live2dPin; where: string; onGo: () => void; onClose: () => void }) {
  const c = useCopy();
  const status = pin.status === "visited" ? c("посещено", "visited") : pin.status === "rumored" ? c("слух", "a rumour") : c("известно понаслышке", "known by hearsay");
  return (
    <div className={s.placeCard} role="dialog" aria-label={pin.name}>
      <b>{pin.name}</b>
      <span className={`${r.small} ${r.muted}`}>{status}{pin.approximate ? ` · ${c("положение примерное", "position approximate")}` : ""}</span>
      {where && <span className={r.small}>{where}</span>}
      <span className={r.row}>
        <button type="button" className={r.btn} onClick={onGo}>{c("Идём туда", "We go there")}</button>
        <button type="button" className={r.btnGhost} onClick={onClose}>{c("Закрыть", "Close")}</button>
      </span>
    </div>
  );
}

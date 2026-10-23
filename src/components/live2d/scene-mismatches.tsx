"use client";

import type { Live2dScene } from "@/lib/live2d/contracts";
import { sceneMismatches } from "@/lib/live2d/scene";
import { registry as r, useCopy } from "../registry/primitives";
import s from "./live2d.module.css";

// Fix S3-accept Б3: «Картинка не сошлась с записями» names what did not match, under «Ещё» — what the picture lacks,
// what it invented, people drawn into it, or why the check could not answer (before, nothing was listed).

export function SceneMismatches({ scene }: { scene: Live2dScene }) {
  const c = useCopy();
  const found = sceneMismatches(scene);
  if (!found) return null;
  const why = found.checkError === "not_configured" ? c("проверка не настроена — нет ключа модели", "the check is not set up — no model key")
    : found.checkError === "unparsable" ? c("ответ проверки не прочитался", "the check's answer could not be read")
    : found.checkError ? c("сервис проверки не ответил", "the check service did not answer") : null;
  return (
    <div className={s.mismatches} role="group" aria-label={c("Что не сошлось с записями", "What did not match the records")} data-testid="scene-mismatches">
      <b>{c("Что не сошлось с записями", "What did not match the records")}</b>
      <ul>
        {found.missing.map((label) => <li key={`m:${label}`}>{c("Нет на картинке", "Not in the picture")}: {label}</li>)}
        {found.extra.map((row, index) => <li key={`x:${index}`}>{c("Лишнее на картинке", "Extra in the picture")}: {row.what}{row.detail ? ` — ${row.detail}` : ""}</li>)}
        {found.people && <li>{c("На картинке нарисованы люди — их показывают только жетоны.", "People are drawn in the picture — only tokens show people.")}</li>}
        {why && <li>{c("Картинку не проверили", "The picture was not checked")}: {why}.</li>}
      </ul>
      <span className={`${r.small} ${r.muted}`}>{c("Можно перерисовать с замечанием или поправить лист сцены ниже.", "You can redraw with a comment or correct the scene sheet below.")}</span>
    </div>
  );
}

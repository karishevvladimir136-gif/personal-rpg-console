"use client";

import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { usd } from "@/lib/visual-frame/fal-image";
import { capRemaining, pictureCostUsdMicros, profileFor, type PictureComposition } from "@/lib/visual-frame/pictures";
import type { SubjectRef } from "./primitives";
import { anchorOf } from "./live-images";
import { usePictures } from "./live-frames";
import { Art, registry as r, useCopy } from "./primitives";

// Polish group 5: one picture path for every button. A portrait, a figure, an
// item or a place is drawn through the Stage V store (fal, the campaign's
// style, priced, within the daily cap) — the same path the autopilot and the
// live frames use. The old picture stays until the new one is ready; earlier
// versions are kept on the board.

export function RedrawAnchor({ data, subject, composition, name }: {
  data: CampaignSnapshot; subject: SubjectRef; composition?: PictureComposition; name: string;
}) {
  const c = useCopy();
  const pictures = usePictures();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  if (!pictures) return <p className={r.note}>{c("Картинки доступны в живой кампании.", "Pictures are available in a live campaign.")}</p>;
  const { board } = pictures;
  const current = anchorOf(board, data, subject);
  const remaining = capRemaining(board);
  // Polish 2 §3: people and places carry a visual profile; items do not.
  const profileSubject = subject.kind === "entity" ? { kind: "entity" as const, id: subject.id } : subject.kind === "location" ? { kind: "location" as const, id: subject.id } : null;
  const price = usd(pictureCostUsdMicros("quality", composition ?? (subject.kind === "item" ? "item" : subject.kind === "location" ? "location" : "portrait")));
  const draw = async () => {
    if (pictures.preview || pending) return;
    setPending(true);
    setNotice(null);
    try {
      const result = await pictures.send("pictures.anchor", { subject, trigger: "manual", ...(composition ? { composition } : {}) }) as { status?: string } | null;
      if (result?.status === "cap") setNotice(c("Дневной лимит картинок исчерпан; поднять его можно в настройках.", "The daily picture limit is spent; raise it in the settings."));
    } catch {
      setNotice(c("Не удалось отправить запрос; попробуй ещё раз.", "The request could not be sent; try again."));
    } finally { setPending(false); }
  };
  return (
    <div className={r.stack} style={{ gap: 10 }} data-testid="redraw-anchor">
      <div style={{ aspectRatio: subject.kind === "location" ? "16 / 9" : "3 / 4", maxHeight: 360, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
        <Art subject={subject} name={name} fit="cover" />
      </div>
      <p className={r.note} style={{ margin: 0 }}>
        {current.drawing ? c("Рисуется новая картинка…", "A new picture is being drawn…")
          : current.picture ? c(`Версия ${current.version?.index ?? 1} из ${current.version?.total ?? 1}.`, `Version ${current.version?.index ?? 1} of ${current.version?.total ?? 1}.`)
            : c("Картинки пока нет.", "No picture yet.")}
        {" "}{c("Старая картинка остаётся, пока новая не готова; прошлые версии сохраняются.", "The old picture stays until the new one is ready; earlier versions are kept.")}
      </p>
      <div className={r.row}>
        <button type="button" className={r.btnMain} disabled={pending || pictures.preview || current.drawing || remaining === 0} onClick={() => void draw()}>
          <RefreshCw size={16} aria-hidden="true" />{current.picture ? c("Перерисовать", "Redraw") : c("Нарисовать", "Draw")} · {price}
        </button>
        <span className={r.note}>{c(`Сегодня: ${board.today.count} из ${board.settings.dailyCap}`, `Today: ${board.today.count} of ${board.settings.dailyCap}`)}</span>
      </div>
      {remaining === 0 && !notice && <p className={r.note} role="status">{c("Дневной лимит картинок исчерпан; поднять его можно в настройках.", "The daily picture limit is spent; raise it in the settings.")}</p>}
      {notice && <p className={r.note} role="status">{notice}</p>}
      {profileSubject && <VisualProfileEditor key={profileFor(board, profileSubject)?.id ?? "none"} subject={profileSubject} />}
    </div>
  );
}

/** Polish 2 §3: the visual profile on the person's or place's card — the full look the shot director
 * feeds into every brief, drafted by the model from the records and the anchor, edited by the owner (the
 * owner's text has the highest authority), with the story's changes to the look listed under it. */
export function VisualProfileEditor({ subject }: { subject: { kind: "entity" | "location"; id: string } }) {
  const c = useCopy();
  const pictures = usePictures();
  const profile = pictures ? profileFor(pictures.board, subject) : null;
  const [look, setLook] = useState<string | null>(null);
  const [changes, setChanges] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"save" | "draft" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // The caller keys this editor on the profile's id, so a new version resets the draft.
  if (!pictures) return null;
  const shownLook = look ?? profile?.look ?? "";
  const shownChanges = changes ?? profile?.changes ?? [];
  const dirty = look !== null || changes !== null;
  const run = async (kind: "save" | "draft") => {
    if (pictures.preview || busy) return;
    setBusy(kind);
    setNote(null);
    try {
      if (kind === "save") await pictures.send("pictures.profile.save", { subject, look: shownLook, changes: shownChanges });
      else {
        const result = await pictures.send("pictures.profile.draft", { subject }) as { status?: string } | null;
        if (result?.status === "not_configured") setNote(c("Нет ключа модели на сервере.", "No model key on the server."));
        else if (result?.status !== "drafted") setNote(c("Модель не написала профиль; попробуй ещё раз.", "The model wrote no profile; try again."));
      }
      setLook(null); setChanges(null);
    } catch { setNote(c("Не удалось сохранить.", "Could not save.")); }
    finally { setBusy(null); }
  };
  return (
    <div className={r.stack} style={{ gap: 6 }} data-testid="visual-profile">
      <span className={r.eyebrow}>{c("Визуальный профиль", "Visual profile")}</span>
      <p className={r.note} style={{ margin: 0 }}>
        {subject.kind === "entity"
          ? c("Как этот человек выглядит на каждой картинке: лицо, возраст, волосы, сложение, обычная одежда, приметы. Твой текст — главный; изменения из истории (рана, чужая рубаха) копятся ниже.", "How this person looks in every picture: face, age, hair, build, usual clothes, marks. Your text wins; changes from the story (a wound, a borrowed shirt) collect below.")
          : c("Как это место выглядит на каждой картинке: материалы, свет, планировка, приметы.", "How this place looks in every picture: materials, light, layout, landmarks.")}
      </p>
      <textarea value={shownLook} rows={5} maxLength={2000} disabled={pictures.preview || !!busy} data-testid="visual-profile-look"
        placeholder={c("Пока нет профиля — напиши сам или нажми «Составить».", "No profile yet — write it or press «Draft».")}
        onChange={(event) => setLook(event.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "#1b1511", color: "inherit", font: "inherit", fontSize: 14 }} />
      {shownChanges.length > 0 && (
        <ul className={r.stack} style={{ gap: 4, margin: 0, paddingLeft: 18 }}>
          {shownChanges.map((change, index) => (
            <li key={`${index}-${change}`} className={r.small}>
              {change}{" "}
              <button type="button" className={r.btnGhost} disabled={pictures.preview || !!busy} aria-label={c("Убрать изменение", "Remove the change")}
                onClick={() => setChanges(shownChanges.filter((_, i) => i !== index))}>×</button>
            </li>
          ))}
        </ul>
      )}
      <div className={r.row}>
        <button type="button" className={r.btnMain} disabled={pictures.preview || !!busy || !dirty} onClick={() => void run("save")}>{c("Сохранить профиль", "Save the profile")}</button>
        <button type="button" className={r.btnGhost} disabled={pictures.preview || !!busy} onClick={() => void run("draft")}>
          <Sparkles size={16} aria-hidden="true" />{profile?.look ? c("Составить заново", "Draft again") : c("Составить", "Draft")}
        </button>
        {profile && <span className={r.note}>{c(`версия ${profile.version} · ${profile.source === "owner" ? "твоя правка" : "от модели"}`, `version ${profile.version} · ${profile.source === "owner" ? "your edit" : "by the model"}`)}</span>}
      </div>
      {note && <p className={r.note} role="status">{note}</p>}
    </div>
  );
}

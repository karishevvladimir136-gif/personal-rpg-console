"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { usd } from "@/lib/visual-frame/fal-image";
import { capRemaining, pictureCostUsdMicros, type PictureComposition } from "@/lib/visual-frame/pictures";
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
    </div>
  );
}

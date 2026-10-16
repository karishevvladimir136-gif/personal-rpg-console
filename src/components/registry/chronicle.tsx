"use client";

import { useState } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { useGameplayRuntime } from "../gameplay-runtime";
import { RecordBoundary } from "../persistent-records";
import { chronicleChapters } from "@/lib/visual-frame/pictures";
import { usd as pictureUsd } from "@/lib/visual-frame/fal-image";
import { usePictures } from "./live-frames";
import { Plate, registry as r, useCopy } from "./primitives";
import k from "./chronicle.module.css";

/** The illustrated chronicle: sessions as chapters, the story with its frames.
 * Chapter titles and «Ранее в…» come from the session records when they exist. */
export function RegistryChronicle({ data, play, preview }: { data: CampaignSnapshot; play: PlaySnapshot | null; preview?: boolean }) {
  const c = useCopy();
  const pictures = usePictures();
  const [pending, setPending] = useState(false);
  const board = pictures?.board ?? null;
  const chapters = board ? chronicleChapters(data, play?.turns ?? [], board) : [];
  const withFrames = chapters.flatMap((chapter) => chapter.turns).filter((row) => row.frame).length;
  const total = chapters.reduce((sum, chapter) => sum + chapter.turns.length, 0);
  const style = board?.styles.find((row) => row.active && row.scope === "campaign") ?? board?.styles.find((row) => row.active) ?? null;
  const previously = (session: CampaignSnapshot["sessions"][number]) => (session as { previously?: string | null }).previously ?? null;
  const rerender = async () => {
    if (!pictures || pictures.preview || pending) return;
    setPending(true);
    try {
      for (const chapter of chapters) for (const { turn, frame } of chapter.turns)
        if (!frame || (style && frame.styleVersionId !== style.id)) await pictures.send("pictures.frame", { operationId: turn.id, trigger: "redraw" });
    } catch { /* the board shows the state */ } finally { setPending(false); }
  };
  return (
    <div className={k.book}>
      <Plate eyebrow={data.campaign.title} title={c("Хроника", "Chronicle")}
        sub={total ? c(`${chapters.length} глав · ${total} ходов · ${withFrames} с кадрами`, `${chapters.length} chapters · ${total} turns · ${withFrames} with frames`) : c("Книга кампании заполняется по мере игры.", "The book of the campaign fills as you play.")}
        aside={!preview && board && total > 0 ? (
          <button type="button" className={r.btnGhost} disabled={pending || pictures?.preview} onClick={() => void rerender()}
            title={c("Перерисовать кадры хроники в текущем стиле; старые остаются, пока новые не готовы", "Re-render the chronicle's frames in the current style; old ones stay until the new are ready")}>
            {c("Перерисовать в текущем стиле", "Re-render in the current style")}
          </button>
        ) : undefined} />
      {chapters.map((chapter) => (
        <article key={chapter.session.id} className={k.chapter} aria-label={chapter.session.title}>
          <header className={k.chapterHead}>
            <span className={r.eyebrow}>{c(`Глава ${chapter.number}`, `Chapter ${chapter.number}`)}</span>
            <h2 className={k.chapterTitle}>{chapter.session.title}</h2>
            {(previously(chapter.session) || chapter.session.recap) && (
              <p className={k.previously}>{previously(chapter.session) ?? chapter.session.recap}</p>
            )}
          </header>
          {chapter.turns.map(({ turn, frame }) => (
            <section key={turn.id} className={k.turn} aria-label={turn.input.slice(0, 60)}>
              <p className={k.input}>{turn.input}</p>
              {frame && pictures?.urlFor(frame) && (
                <div className={k.frame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pictures.urlFor(frame)!} alt={c("Кадр", "Frame")} loading="lazy" />
                </div>
              )}
              <div className={`prose ${k.narration}`}>{turn.narration}</div>
            </section>
          ))}
        </article>
      ))}
      {board && board.today.costUsdMicros > 0 && !preview && (
        <p className={r.note}>{c(`Сегодня на картинки: ${pictureUsd(board.today.costUsdMicros)}.`, `Spent on pictures today: ${pictureUsd(board.today.costUsdMicros)}.`)}</p>
      )}
    </div>
  );
}

export function ChronicleRoute() {
  const runtime = useGameplayRuntime();
  return <RecordBoundary>{(data) => <RegistryChronicle data={data} play={runtime.play} />}</RecordBoundary>;
}

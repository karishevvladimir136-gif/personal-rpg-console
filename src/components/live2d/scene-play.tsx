"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Send, X } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { LiveTurnView } from "@/lib/gameplay/live-turn-client";
import { currentSession, inCombat, partyOf } from "@/lib/ui/campaign-view";
import { frameFor } from "@/lib/visual-frame/pictures";
import { GameplayComposer } from "../gameplay-composer";
import { GameplayTurn } from "../gameplay-turn";
import { useSessionMemory } from "../session-memory-runtime";
import { currentFrameTurnId, frameCaption, FrameLightbox, useLiveFrameTrigger, usePictures } from "../registry/live-frames";
import { useAddressee, useTurnAftermath } from "../registry/turn-aftermath";
import { useChrome, useDmSettings } from "../registry/shell";
import { registry as r, useCopy } from "../registry/primitives";
import s from "./live2d.module.css";

// Fix S3-accept Б4 (the owner: «идеально было бы поле ввода под 2D тоже сделать. иначе это извращение»): play from
// the 2D scene. The action box stands under the picture — a hotspot fills it (the same draft as «Игра»), the owner
// edits and sends it here — and the turn runs the text screen's own path: the same composer (operation IDs, leases,
// the stream, resume, «Дальше»), the same turn rendering (narration, roll cards, the companions' chips), the same
// folded changes, «Твой момент» and addressee. The turn's frame lands in the scene picture (SceneFrame). «Игра» stays
// the text mode with the whole story.

const noop = async () => {};

type ScenePlayProps = {
  snapshot: CampaignSnapshot; play: PlaySnapshot | null; onSaved?: () => Promise<void>; nonce: number;
  live: LiveTurnView | null; onLiveView: (view: LiveTurnView) => void; preview: boolean;
};
/** The DM's answer under the scene and the action box. `nonce`: a hotspot wrote into the draft, the box re-reads it. */
export function ScenePlay(props: ScenePlayProps) {
  return props.preview ? <ScenePlayPreview snapshot={props.snapshot} play={props.play} /> : <ScenePlayLive {...props} />;
}

function ScenePlayLive({ snapshot, play, onSaved = noop, nonce, live, onLiveView }: ScenePlayProps) {
  const c = useCopy();
  const chrome = useChrome();
  const pictures = usePictures();
  const dmSettings = useDmSettings(snapshot.campaign.id);
  const memory = useSessionMemory();
  const box = useRef<HTMLElement>(null);
  // The frame of a turn sent here is asked for as on «Игра» (once its first paragraph has arrived).
  useLiveFrameTrigger(live, play, pictures);
  const combat = inCombat(play);
  const present = partyOf(snapshot, play).filter((row) => row.present).map((row) => row.entity);
  const { resolveSend, chip, setDraft } = useAddressee({ present, combat });
  const { liveBlock, moment } = useTurnAftermath({ play, live, mode: "game", dmSettings });
  // A hotspot's words are in the box now: bring the box into view (the picture stays above it).
  useEffect(() => { if (nonce) box.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); }, [nonce]);
  const gameHref = chrome?.href?.("game") ?? `/campaigns/${encodeURIComponent(snapshot.campaign.id)}/game`;
  const companionRolls = dmSettings?.options?.companionRolls ?? "dm";
  const session = currentSession(snapshot);
  const boundary = memory.snapshot?.currentBoundary;
  const loopRuntime = !dmSettings || dmSettings.runtime === "dm-loop-v1";
  // An ended session: its digest is on «Игра» (the text screen keeps the chapter's end and the next opening).
  const sessionClosed = loopRuntime && !!session && (session.status === "closed" || (boundary?.sessionId === session.id && boundary.state !== "continued"));
  const textLink = <Link className={r.btnGhost} href={gameHref}><BookOpen size={16} aria-hidden="true" />{c("Весь текст", "The whole text")}</Link>;

  let body: React.ReactNode;
  if (!play) body = <p className={`${r.small} ${r.muted}`} role="status">{c("Загружаю ходы…", "Loading the turns…")}</p>;
  else if (play.startupPending) body = <p className={s.note} role="status">{c("Перед первым ходом закончи вступление приключения на экране «Игра».", "Finish the adventure opening on the «Game» screen before the first turn.")} {textLink}</p>;
  else if (sessionClosed) body = <p className={s.note} role="status">{c("Сессия закончена: итог главы и начало следующей — на экране «Игра».", "The session has ended: the chapter's digest and the next opening are on the «Game» screen.")} {textLink}</p>;
  else body = (
    <GameplayComposer
      key={nonce}
      play={play}
      mode="game"
      compact
      onSaved={onSaved}
      beforeInput={<>{liveBlock}{moment}{chip}</>}
      inputTools={textLink}
      onLiveView={onLiveView}
      onDraftText={setDraft}
      resolveSend={resolveSend}
      showLiveView={false}
      companionRolls={companionRolls}
      turnFrames={false}
    />
  );
  return (
    <section ref={box} className={s.play} aria-label={c("Ход в сцене", "The turn in the scene")} data-testid="scene-play">
      {body}
    </section>
  );
}

/** The synthetic preview: the latest turn as the DM told it and an action box that sends nothing. */
function ScenePlayPreview({ snapshot, play }: { snapshot: CampaignSnapshot; play: PlaySnapshot | null }) {
  const c = useCopy();
  const companionRolls = useDmSettings(snapshot.campaign.id)?.options?.companionRolls ?? "dm";
  const latest = play?.turns.filter((turn) => turn.mode === "game" || turn.mode === "companion").at(-1) ?? null;
  return (
    <section className={s.play} aria-label={c("Ход в сцене", "The turn in the scene")} data-testid="scene-play">
      <div className="gameplay-channel" data-preview="true">
        {latest && (
          <div className="session-saved-turn">
            <GameplayTurn turn={latest} companionRolls={companionRolls} busy={false} frame={false} onCommand={() => {}} onSaved={noop} />
          </div>
        )}
        <form onSubmit={(event) => event.preventDefault()} aria-label={c("Ход игрока", "Your turn")}>
          <label className="field">
            <span>{c("Твой ход", "Your turn")}</span>
            <textarea rows={3} readOnly value="" placeholder={c("Что ты делаешь?", "What do you do?")} />
          </label>
          <div className="button-group gameplay-send-row">
            <button type="submit" className={r.btnMain} disabled><Send size={18} aria-hidden="true" />{c("Отправить", "Send")}</button>
            <span className={r.note}>{c("Предпросмотр: ход не отправляется.", "Preview: nothing is sent.")}</span>
          </div>
        </form>
      </div>
    </section>
  );
}

/** The turn's frame in the scene picture: drawn (a click opens it large), being drawn, or nothing; «×» puts it away
 * until the next turn's frame. Only where the party stands (the caller decides). */
export function SceneFrame({ play, live }: { play: PlaySnapshot | null; live: LiveTurnView | null }) {
  const c = useCopy();
  const pictures = usePictures();
  const [away, setAway] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const turnId = pictures ? currentFrameTurnId(play, live) : null;
  if (!pictures || !turnId || away === turnId) return null;
  const { picture, drawing } = frameFor(pictures.board, turnId);
  const url = picture ? pictures.urlFor(picture) : null;
  if (!url && !drawing) return null;
  const record = play?.turns.find((row) => row.id === turnId);
  const turn = { id: turnId, input: record?.input ?? "", narration: record?.narration ?? live?.text ?? null };
  const caption = frameCaption(turn, picture);
  return (
    <figure className={s.sceneFrame} data-testid="scene-frame" onPointerDown={(event) => event.stopPropagation()}>
      {url && picture ? (
        <button type="button" className={s.sceneFrameOpen} aria-label={c("Открыть кадр хода крупно", "Open the turn's frame large")} onClick={() => setOpen(true)}>
          {/* Short-lived authenticated URLs; next/image cannot proxy them. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={caption} />
        </button>
      ) : (
        <div className={s.sceneFrameDrawing} role="img" aria-label={c("Кадр хода рисуется", "The turn's frame is being drawn")}>{c("кадр хода рисуется…", "drawing the turn's frame…")}</div>
      )}
      <figcaption>
        <span>{url ? c("Кадр хода", "The turn's frame") : c("Кадр", "Frame")}</span>
        <button type="button" aria-label={c("Убрать кадр с картинки", "Take the frame off the picture")} onClick={() => setAway(turnId)}><X size={14} aria-hidden="true" /></button>
      </figcaption>
      {open && picture && typeof document !== "undefined" && createPortal(
        <FrameLightbox entries={[{ turn, picture }]} index={0} urlFor={pictures.urlFor} onIndex={() => {}} onClose={() => setOpen(false)} />, document.body)}
    </figure>
  );
}

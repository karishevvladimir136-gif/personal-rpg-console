"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, EyeOff, Eye, RefreshCw, X } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { LiveTurnView } from "@/lib/gameplay/live-turn-client";
import { defaultPicturesTransport, type PicturesAction, type PicturesTransport } from "@/lib/ui/pictures-client";
import { emptyPictureBoard, frameFor, framesOfTurn, pictureUrl, styleReferenceUrl, type PictureBoard, type PictureStyle, type PublicPicture } from "@/lib/visual-frame/pictures";
import { firstParagraph, isKeyMoment } from "@/lib/visual-frame/shot";
import { registry as r, useCopy } from "./primitives";
import f from "./live-frames.module.css";

// The Stage V picture board on the client: one provider per campaign, polled
// while something is being drawn; frames of turns in the game screen; the
// live trigger that asks for a frame once the first paragraph has arrived.

type PicturesState = {
  board: PictureBoard;
  loaded: boolean;
  refresh: () => Promise<void>;
  send: (action: PicturesAction, input: unknown) => Promise<unknown>;
  urlFor: (picture: PublicPicture) => string | null;
  styleUrlFor: (style: PictureStyle) => string | null;
  preview: boolean;
};
const PicturesContext = createContext<PicturesState | null>(null);
export const usePictures = () => useContext(PicturesContext);

const busy = (board: PictureBoard) => board.pictures.some((row) => row.status === "queued" || row.status === "generating");

/** Live campaigns: the board from the server, polled every few seconds while a picture is being drawn. */
export function PicturesProvider({ data, transport = defaultPicturesTransport, children }: { data: CampaignSnapshot; transport?: PicturesTransport; children: ReactNode }) {
  const campaignId = data.campaign.id;
  const [board, setBoard] = useState<PictureBoard>(() => emptyPictureBoard(campaignId));
  const [loaded, setLoaded] = useState(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const sequence = ++generation.current;
    try {
      const next = await transport.board(campaignId);
      if (sequence === generation.current) { setBoard(next); setLoaded(true); }
    } catch {
      /* The last board stays; the next poll or action tries again. */
    }
  }, [campaignId, transport]);
  const send = useCallback(async (action: PicturesAction, input: unknown) => {
    const result = await transport.send(action, campaignId, input);
    await refresh();
    return result;
  }, [campaignId, transport, refresh]);
  // A new committed snapshot may bring new records; the board follows it.
  useEffect(() => { queueMicrotask(() => void refresh()); }, [refresh, data.publicState.revision, data.timeline?.epoch]);
  useEffect(() => {
    if (!busy(board)) return;
    const timer = setTimeout(() => void refresh(), 2500);
    return () => clearTimeout(timer);
  }, [board, refresh]);
  const value = useMemo<PicturesState>(() => ({
    board, loaded, refresh, send,
    urlFor: (picture) => (picture.status === "ready" ? pictureUrl(campaignId, picture.id) : null),
    styleUrlFor: (style) => (style.hasReference ? styleReferenceUrl(campaignId, style.id) : null),
    preview: false,
  }), [board, loaded, refresh, send, campaignId]);
  return <PicturesContext.Provider value={value}>{children}</PicturesContext.Provider>;
}

/** Synthetic previews: a fixed board and sample pictures; nothing is sent. */
export function PreviewPictures({ board, images, children }: { board: PictureBoard; images: Record<string, string>; children: ReactNode }) {
  const value = useMemo<PicturesState>(() => ({
    board, loaded: true, refresh: async () => {}, send: async () => null,
    urlFor: (picture) => images[picture.id] ?? null,
    styleUrlFor: (style) => images[style.id] ?? null,
    preview: true,
  }), [board, images]);
  return <PicturesContext.Provider value={value}>{children}</PicturesContext.Provider>;
}

/** Asks for a frame of the streaming turn once its first paragraph is complete, a committed
 * frame when a saved turn has none, and the better re-render on a key moment. Once per turn
 * and trigger; the server owns the settings, the cap and the text. */
function useLiveFrameTrigger(live: LiveTurnView | null, play: PlaySnapshot | null, pictures: PicturesState | null) {
  const asked = useRef(new Set<string>());
  useEffect(() => {
    if (!pictures || pictures.preview || !live || !pictures.loaded) return;
    const settings = pictures.board.settings.frames;
    if (settings === "off") return;
    const operationId = live.operationId;
    const streaming = live.status === null || live.status === "generating";
    const committed = live.status === "committed" || play?.turns.some((turn) => turn.id === operationId && turn.status === "committed");
    const ask = (trigger: "live" | "committed" | "key_moment") => {
      const key = `${trigger === "key_moment" ? "key" : "frame"}:${operationId}`;
      if (asked.current.has(key)) return;
      asked.current.add(key);
      void pictures.send("pictures.frame", { operationId, trigger }).catch(() => {});
    };
    if (settings === "every") {
      if (streaming && firstParagraph(live.text, false)) ask("live");
      else if (committed && !framesOfTurn(pictures.board, operationId).length) ask("committed");
    }
    if (committed && isKeyMoment(live.changes, !!live.moment)) ask("key_moment");
  }, [live, play, pictures]);
}

/** The turn whose frame the panel shows: the streaming turn, else the latest game turn. */
export function currentFrameTurnId(play: PlaySnapshot | null, live: LiveTurnView | null): string | null {
  const latest = (play?.turns ?? []).filter((turn) => turn.mode === "game").at(-1) ?? null;
  return live && (live.status === null || live.status === "generating") ? live.operationId : latest?.id ?? live?.operationId ?? null;
}

/** The first line of a turn, for the lightbox caption: the narration's first sentence, else the player's words. */
export function frameCaption(turn: { input: string; narration: string | null }): string {
  const text = (turn.narration?.trim() || turn.input).split(/\n/)[0].trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

type LightboxEntry = { turn: { id: string; input: string; narration: string | null }; picture: PublicPicture };

/** Polish group 5: a frame opened large — the turn's first line, «←/→» through the frames, Esc to close. */
function FrameLightbox({ entries, index, urlFor, onIndex, onClose }: {
  entries: LightboxEntry[]; index: number; urlFor: (picture: PublicPicture) => string | null; onIndex: (index: number) => void; onClose: () => void;
}) {
  const c = useCopy();
  const entry = entries[index];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft" && index > 0) onIndex(index - 1);
      else if (event.key === "ArrowRight" && index < entries.length - 1) onIndex(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, entries.length, onIndex, onClose]);
  if (!entry) return null;
  const url = urlFor(entry.picture);
  return (
    <div className={f.lightbox} role="dialog" aria-modal="true" aria-label={c("Кадр крупно", "Frame, large")} data-testid="frame-lightbox">
      <button type="button" className={f.lightboxScrim} aria-label={c("Закрыть", "Close")} onClick={onClose} />
      <div className={f.lightboxBody}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt={c("Кадр хода", "Frame of the turn")} />}
        <div className={f.lightboxBar}>
          <button type="button" className={r.iconBtn} aria-label={c("Предыдущий кадр", "Previous frame")} disabled={index <= 0} onClick={() => onIndex(index - 1)}><ChevronLeft size={20} aria-hidden="true" /></button>
          <span className={f.lightboxCaption}>
            <span>{frameCaption(entry.turn)}</span>
            <a href={`#saved-turn-${entry.turn.id}`} onClick={onClose}>{c("К ходу", "To the turn")}</a>
          </span>
          <span className={f.lightboxCount}>{index + 1} / {entries.length}</span>
          <button type="button" className={r.iconBtn} aria-label={c("Следующий кадр", "Next frame")} disabled={index >= entries.length - 1} onClick={() => onIndex(index + 1)}><ChevronRight size={20} aria-hidden="true" /></button>
          <button type="button" className={r.iconBtn} aria-label={c("Закрыть", "Close")} onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}

/** The frames panel of the game screen: the frame of the current turn, its tools, earlier frames. */
export function FramesPanel({ data, play, live, chronicleHref }: { data: CampaignSnapshot; play: PlaySnapshot | null; live: LiveTurnView | null; chronicleHref: string }) {
  const c = useCopy();
  const pictures = usePictures();
  useLiveFrameTrigger(live, play, pictures);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  if (!pictures) return null;
  const { board } = pictures;
  const gameTurns = (play?.turns ?? []).filter((turn) => turn.mode === "game");
  const latestTurn = gameTurns.at(-1) ?? null;
  const currentId = currentFrameTurnId(play, live);
  const current = currentId ? frameFor(board, currentId) : null;
  const versions = currentId ? framesOfTurn(board, currentId).filter((row) => row.status === "ready") : [];
  const hiddenOnly = versions.length > 0 && versions.every((row) => row.hidden);
  const shown = current?.picture ?? null;
  const earlier = gameTurns.slice().reverse().filter((turn) => turn.id !== currentId)
    .map((turn) => ({ turn, picture: frameFor(board, turn.id).picture })).filter((row) => row.picture).slice(0, 8);
  const off = board.settings.frames === "off";
  if (!shown && !current?.drawing && !hiddenOnly && !earlier.length && (off || !latestTurn)) return null;
  const act = async (action: PicturesAction, input: unknown) => {
    if (pictures.preview || pending) return;
    setPending(true);
    try { await pictures.send(action, input); } catch { /* the board shows the state */ } finally { setPending(false); }
  };
  // «Скрыть» hides the frame of this turn: every ready version of it; «Показать» brings the newest back.
  const hideTurn = async () => {
    if (pictures.preview || pending) return;
    setPending(true);
    try { for (const row of versions.filter((version) => !version.hidden)) await pictures.send("pictures.hide", { id: row.id, hidden: true }); }
    catch { /* the board shows the state */ } finally { setPending(false); }
  };
  const currentTurn = currentId ? gameTurns.find((turn) => turn.id === currentId) ?? null : null;
  const entries: LightboxEntry[] = [
    ...(shown && currentTurn ? [{ turn: currentTurn, picture: shown }] : []),
    ...earlier.map((row) => ({ turn: row.turn, picture: row.picture! })),
  ];
  const openEntry = (pictureId: string) => { const index = entries.findIndex((row) => row.picture.id === pictureId); if (index >= 0) setOpen(index); };
  const label = shown ? (shown.trigger === "key_moment" ? c("ключевой момент · лучшая модель", "key moment · better model") : shown.tier === "quality" ? c("качество", "quality") : c("живой кадр", "live frame")) : null;
  return (
    <section id="registry-frames" className={f.panel} aria-label={c("Кадры", "Frames")}>
      {shown && pictures.urlFor(shown) ? (
        <div className={f.frame}>
          {/* Short-lived authenticated URLs; next/image cannot proxy them. */}
          <button type="button" className={f.frameButton} aria-label={c("Открыть кадр крупно", "Open the frame large")} onClick={() => openEntry(shown.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pictures.urlFor(shown)!} alt={c("Кадр этого хода", "Frame of this turn")} />
          </button>
          <div className={f.caption}>
            <span className={f.captionText}>{label}{versions.length > 1 ? ` · ${c(`версия ${versions.indexOf(shown) + 1} из ${versions.length}`, `version ${versions.indexOf(shown) + 1} of ${versions.length}`)}` : ""}</span>
            {current?.drawing && <span className={r.badgeAmber}>{c("рисуется новый…", "drawing a new one…")}</span>}
          </div>
        </div>
      ) : current?.drawing ? (
        <div className={f.frame}><div className={r.drawing} role="img" aria-label={c("Кадр рисуется", "The frame is being drawn")}>{c("кадр рисуется…", "drawing the frame…")}</div></div>
      ) : hiddenOnly ? (
        <p className={f.line}><span>{c("Кадр этого хода скрыт.", "The frame of this turn is hidden.")}</span></p>
      ) : current?.failed ? (
        <p className={f.line}><span>{c("Кадр не вышел; повтора не будет — можно перерисовать.", "The frame failed; it will not retry — you can redraw.")}</span></p>
      ) : null}
      <div className={f.tools}>
        {currentId && !off && (
          <button type="button" className={r.btnGhost} disabled={pending || pictures.preview || current?.drawing} onClick={() => void act("pictures.frame", { operationId: currentId, trigger: "redraw" })}>
            <RefreshCw size={16} aria-hidden="true" />{shown || hiddenOnly ? c("Перерисовать", "Redraw") : c("Нарисовать кадр", "Draw a frame")}
          </button>
        )}
        {shown && (
          <button type="button" className={r.btnGhost} disabled={pending || pictures.preview} onClick={() => void hideTurn()}>
            <EyeOff size={16} aria-hidden="true" />{c("Скрыть", "Hide")}
          </button>
        )}
        {hiddenOnly && versions.at(-1) && (
          <button type="button" className={r.btnGhost} disabled={pending || pictures.preview} onClick={() => void act("pictures.hide", { id: versions.at(-1)!.id, hidden: false })}>
            <Eye size={16} aria-hidden="true" />{c("Показать", "Show")}
          </button>
        )}
        <Link className={r.btnGhost} href={chronicleHref}><BookOpen size={16} aria-hidden="true" />{c("Хроника", "Chronicle")}</Link>
      </div>
      {earlier.length > 0 && (
        <div className={f.strip} role="list" aria-label={c("Кадры прошлых ходов", "Frames of earlier turns")}>
          {earlier.map(({ turn, picture }) => (
            <button key={turn.id} type="button" role="listitem" className={f.thumb} title={frameCaption(turn)} onClick={() => openEntry(picture!.id)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pictures.urlFor(picture!) ?? ""} alt={c("Кадр прошлого хода", "Frame of an earlier turn")} />
            </button>
          ))}
        </div>
      )}
      {open !== null && entries[open] && (
        <FrameLightbox entries={entries} index={open} urlFor={pictures.urlFor} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
      <span className={`${r.note} ${f.line}`} style={{ color: "var(--muted)" }}>
        {off ? c("Кадры выключены в настройках картинок.", "Frames are off in the picture settings.") : c("Ход никогда не ждёт кадр: картинка появляется, пока ведущий ещё пишет.", "A turn never waits for a frame: the picture appears while the DM is still writing.")}
      </span>
      {data.campaign.id ? null : null}
    </section>
  );
}

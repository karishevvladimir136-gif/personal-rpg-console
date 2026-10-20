"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Moon, RotateCcw, Sparkles } from "lucide-react";
import { useCampaignData } from "../persistence-context";
import { useSessionMemory } from "../session-memory-runtime";
import { notifyGameplayChanged } from "../gameplay-runtime";
import { continueSession, endSession, memoryErrorMessage } from "@/lib/memory/client";
import { readJson } from "@/lib/persistence/client";
import { createBackoffPoll } from "@/lib/ui/backoff-poll";
import { journalOf, questsOf } from "@/lib/ui/campaign-view";
import { anchorFor } from "@/lib/visual-frame/pictures";
import type { SessionEnding } from "@/lib/persistence/contracts";
import { usePictures } from "./live-frames";
import { registry as r, useCopy } from "./primitives";
import g from "./game.module.css";

// «Закончить сессию» (polish item 11): closes the session, shows the Stage 4
// digest as it lands — the chapter title, «Ранее в…», the open leads and the
// closing stinger «Тем временем…» — with a retry, then opens the next session.
// The legacy save table and its wording stay off the player's screen.
// Fix run E (item 81, the owner's design): the form follows the session's length — after a short one «Что было» in a
// few lines, after a long one the ending cards (portrait, where they are, how they stand with the hero, one line of
// fate); then the open threads the digest gathered from all live threads; then «Тем временем» with its in-world channel.

const endingOf = (value: unknown): SessionEnding | null =>
  value && typeof value === "object" && (value as { version?: unknown }).version === 1 ? value as SessionEnding : null;

type DigestStatus = { state: "running" | "done" | "failed" | "skipped"; reason: string | null; costUsd: number | null } | null;

export function SessionEnd({ sessionId, compact = false }: { sessionId: string | null; compact?: boolean }) {
  const c = useCopy();
  const router = useRouter();
  const { campaignId, data, refresh } = useCampaignData();
  const memory = useSessionMemory();
  const pictures = usePictures();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<DigestStatus>(null);
  const attempt = useRef<{ requestId: string; sessionId: string } | null>(null);
  const session = data?.sessions.find((row) => row.id === sessionId) ?? null;
  const boundary = memory.snapshot?.currentBoundary?.sessionId === sessionId ? memory.snapshot.currentBoundary : null;
  // Ended: «Закончить сессию» wrote the boundary (the row closes on «Продолжить»).
  const closed = session?.status === "closed" || (!!boundary && boundary.state !== "continued");
  const digested = !!session?.recap.trim();
  const polling = closed && !digested;
  // While the digest runs, ask the server where it stands and refresh the records when it lands.
  // Fix run A3/A4 (item 81): only the full card asks (the compact button beside the composer never polls),
  // from 3 s growing to 15 s, never overlapping, and it stops once the digest is done or failed.
  const settled = useRef(false);
  useEffect(() => {
    if (compact || !closed || digested || !sessionId) return;
    let live = true;
    settled.current = false;
    const tick = async () => {
      const result = await readJson<{ status: DigestStatus }>(`/api/campaigns/${encodeURIComponent(campaignId)}/dossier?view=digest&session=${encodeURIComponent(sessionId)}`);
      if (!live) return;
      setStatus(result.status);
      if (result.status?.state === "failed" || result.status?.state === "skipped") settled.current = true;
      if (result.status?.state === "done" || result.status === null) { settled.current = true; await refresh().catch(() => {}); }
    };
    void tick().catch(() => {});
    const poll = createBackoffPoll({ run: tick, active: () => !settled.current, baseMs: 3000, maxMs: 15000 });
    return () => { live = false; poll.stop(); };
  }, [campaignId, closed, compact, digested, refresh, sessionId]);
  const end = async () => {
    if (!memory.snapshot || !sessionId || busy) return;
    setBusy(true);
    setError("");
    try {
      attempt.current ??= { requestId: crypto.randomUUID(), sessionId };
      const result = await endSession({ timeline: memory.snapshot.timeline, requestId: attempt.current.requestId, campaignId, sessionId,
        expectedRevision: memory.snapshot.runtimeRevision });
      memory.accept(result);
      attempt.current = null;
      notifyGameplayChanged(campaignId);
      await refresh().catch(() => {});
    } catch (cause) {
      setError(c.t(memoryErrorMessage(cause)));
      await memory.refresh().catch(() => {});
    } finally { setBusy(false); }
  };
  const retry = async () => {
    if (!sessionId || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await readJson<{ status: DigestStatus }>(`/api/campaigns/${encodeURIComponent(campaignId)}/dossier`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "digest", sessionId }) });
      setStatus(result.status);
      settled.current = false;
    } catch { setError(c("Не удалось запустить итог заново. Попробуй ещё раз через минуту.", "The digest could not be started again. Try again in a minute.")); }
    finally { setBusy(false); }
  };
  const next = async () => {
    if (!memory.snapshot || !boundary || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await continueSession({ timeline: memory.snapshot.timeline, requestId: crypto.randomUUID(), campaignId,
        boundaryId: boundary.id, expectedRevision: memory.snapshot.runtimeRevision });
      memory.accept(result);
      notifyGameplayChanged(campaignId);
      await refresh().catch(() => {});
      router.push(`/campaigns/${encodeURIComponent(campaignId)}/game`);
    } catch (cause) {
      setError(c.t(memoryErrorMessage(cause)));
      await memory.refresh().catch(() => {});
    } finally { setBusy(false); }
  };
  if (!data || !sessionId || !session) return null;
  if (!closed) {
    return (
      <div className={g.sessionEnd}>
        <button type="button" className={r.btnGhost} disabled={busy || !memory.snapshot || !!memory.error} onClick={() => void end()}>
          <Moon size={18} aria-hidden="true" />{c("Закончить сессию", "End the session")}
        </button>
        {!compact && <span className={r.note}>{c("Ведущий подведёт итог главы, даст ей название и покажет, что тем временем случилось в мире.", "The DM sums up the chapter, names it and shows what happened in the world meanwhile.")}</span>}
        {error && <p role="alert" className={r.error}>{error}</p>}
      </div>
    );
  }
  // Item 81: the chapter card shows once — in the feed; the compact button beside the composer steps aside.
  if (compact) return null;
  const journal = journalOf(data);
  const quests = questsOf(data);
  const leads = [...quests.active.map((quest) => ({ id: quest.id, title: quest.title, kind: c("задание", "quest") })),
    ...journal.threads.map((entry) => ({ id: entry.quest.id, title: entry.quest.title, kind: c("зацепка", "lead") })),
    ...journal.debts.map((entry) => ({ id: entry.quest.id, title: entry.quest.title, kind: c("долг", "debt") })),
    ...journal.promises.map((entry) => ({ id: entry.quest.id, title: entry.quest.title, kind: c("обещание", "promise") }))].slice(0, 8);
  const failed = status?.state === "failed" || status?.state === "skipped";
  const ending = endingOf(session.ending);
  const threads = ending?.threads.length ? ending.threads : null;
  const portrait = (entityId: string | null) => {
    if (!entityId || !pictures) return null;
    const picture = anchorFor(pictures.board, { kind: "entity", id: entityId }, "portrait").picture;
    return picture ? pictures.urlFor(picture) : null;
  };
  return (
    <section className={g.sessionEnd} aria-label={c("Итог сессии", "Session summary")}>
      {!digested && !failed && (
        <p role="status" className={g.sessionWait}>
          <Sparkles size={18} aria-hidden="true" />{c("Ведущий подводит итог сессии…", "The DM is summing up the session…")}
          {polling && <span className={g.caret} aria-hidden="true" />}
        </p>
      )}
      {!digested && failed && (
        <div role="alert" className={r.stack}>
          <span>{status?.state === "skipped"
            ? c("Итог не написан: ", "No summary was written: ") + (status.reason ?? "")
            : c("Итог не получился. ", "The summary did not come through. ") + (status?.reason ?? "")}</span>
          <button type="button" className={r.btnGhost} disabled={busy} onClick={() => void retry()}>
            <RotateCcw size={18} aria-hidden="true" />{c("Повторить", "Try again")}
          </button>
        </div>
      )}
      {digested && (
        <div className={r.stack}>
          <div className={g.sessionChapter}>
            <span className={r.eyebrow}>{c("Глава закрыта", "Chapter closed")}</span>
            <span className={g.sessionTitle}>{session.title}</span>
          </div>
          <div className={g.sessionRecap}>
            <span className={r.eyebrow}><BookOpen size={14} aria-hidden="true" /> {c("Ранее в…", "Previously in…")}</span>
            <p className={g.sessionProse}>{session.recap}</p>
          </div>
          {ending?.form === "short" && ending.lines.length > 0 && (
            <div>
              <span className={r.eyebrow}>{c("Что было", "What happened")}</span>
              <ul className={g.sessionLeads}>{ending.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
            </div>
          )}
          {ending?.form === "cards" && ending.cards.length > 0 && (
            <div>
              <span className={r.eyebrow}>{c("Судьбы", "Fates")}</span>
              <ul className={g.endingCards}>
                {ending.cards.map((card, index) => {
                  const url = portrait(card.entityId);
                  return (
                    <li key={`${card.entityId ?? card.name}-${index}`} className={g.endingCard}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- a private signed picture, as in the frames */}
                      {url ? <img src={url} alt="" className={g.endingPortrait} /> : <span className={g.endingPortrait} aria-hidden="true">{card.name.slice(0, 1)}</span>}
                      <div className={g.endingText}>
                        <strong>{card.name}</strong>
                        {card.where && <span className={r.note}>{card.where}</span>}
                        {card.standing && <span className={r.chip}>{card.standing}</span>}
                        <p className={g.sessionProse}>{card.fate}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {threads ? (
            <div>
              <span className={r.eyebrow}>{c("Открытые нити", "Open threads")}</span>
              <ul className={g.sessionLeads}>{threads.map((line, index) => <li key={index}>{line}</li>)}</ul>
            </div>
          ) : leads.length > 0 && (
            <div>
              <span className={r.eyebrow}>{c("Открытые зацепки", "Open leads")}</span>
              <ul className={g.sessionLeads}>
                {leads.map((lead) => <li key={lead.id}><span className={r.chip}>{lead.kind}</span> {lead.title}</li>)}
              </ul>
            </div>
          )}
          {session.stinger?.trim() ? (
            <div className={g.sessionStinger}>
              <span className={r.eyebrow}>{c("Тем временем…", "Meanwhile…")}{ending?.channel ? ` · ${ending.channel}` : ""}</span>
              <p className={g.sessionProse}>{session.stinger}</p>
            </div>
          ) : null}
        </div>
      )}
      <div className={r.row}>
        {boundary && boundary.state !== "continued" && (
          <button type="button" className={r.btnMain} disabled={busy} onClick={() => void next()}>
            {c("Начать следующую сессию", "Start the next session")}
          </button>
        )}
        {digested && (
          <button type="button" className={r.btnGhost} disabled={busy} onClick={() => void retry()} title={c("Написать итог заново", "Write the summary again")}>
            <RotateCcw size={16} aria-hidden="true" />{c("Переписать итог", "Rewrite the summary")}
          </button>
        )}
      </div>
      {error && <p role="alert" className={r.error}>{error}</p>}
    </section>
  );
}

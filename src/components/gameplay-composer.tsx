"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "./language-context";
import {
  useCampaignData,
  useCampaignDraftScope,
  TimelineDraftNotice,
  useUnsavedChanges,
} from "./persistence-context";
import { Button, Icon } from "./ui";
import {
  GameplayClientError,
  gameplayErrorMessage,
  loadTurn,
  resumeTurn,
  sendTurn,
} from "@/lib/gameplay/client";
import {
  actionMaxCharacters,
  belongsToChannel,
  dropRefusedCommand,
  emptyJournal,
  isUnresolved,
  journalKey,
  loadJournal,
  prepareAttempt,
  prepareCommand,
  reconcileJournal,
  saveJournal,
  journalNeedsTimelineReview,
  reviewJournalForTimeline,
  type DraftJournal,
} from "@/lib/gameplay/client-state";
import type {
  MechanicChoice,
  PlaySnapshot,
  PublicTurn,
  ResumeInput,
  TurnMode,
} from "@/lib/gameplay/contracts";
import { GameplayTurn } from "./gameplay-turn";
import { useSessionMemory } from "./session-memory-runtime";
import {
  sessionGate,
  sessionGateLabels,
  turnAllowedBySession,
} from "@/lib/memory/client-state";
import { sameTimeline, timelineChangedMessage } from "@/lib/saves/client-state";
import { followLiveTurn, type LiveTurnView } from "@/lib/gameplay/live-turn-client";
import { provisionalTurn, traceLive, type LiveTrace } from "@/lib/ui/turn-timeline";
import { rerollsLeft } from "@/lib/gameplay/reroll-allowance";

/** Stage C (item 63): the streams this page has seen told, by turn — a remounted composer keeps the order
 * of a told turn's rolls and text (the saved record has the text and the rolls, not where each came). */
const toldTurns = new Map<string, LiveTrace>();
function rememberTold(trace: LiveTrace) {
  toldTurns.delete(trace.view.operationId);
  toldTurns.set(trace.view.operationId, trace);
  while (toldTurns.size > 40) toldTurns.delete(toldTurns.keys().next().value!);
}

/** Item 42: the action box grows with the text up to about a third of the screen, then scrolls. */
function growToText(area: HTMLTextAreaElement | null) {
  if (!area) return;
  const cap = Math.max(160, Math.round(window.innerHeight / 3));
  area.style.height = "auto";
  const needed = area.scrollHeight + (area.offsetHeight - area.clientHeight);
  area.style.height = `${Math.min(needed, cap)}px`;
  area.style.overflowY = needed > cap ? "auto" : "hidden";
}

function localStorageForDraft() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
const connectionInterruptionMessage =
  "The DM connection was interrupted. Try again.";

export function shouldShowComposerError(
  error: string,
  turn: PublicTurn | null | undefined,
) {
  return !!error && !(
    error === connectionInterruptionMessage &&
    turn?.status === "failed" &&
    turn.canRetry &&
    (turn.failure === "provider" || turn.failure === "unavailable")
  );
}
export type StoryHistoryPosition = {
  scrollTop: number;
  following: boolean;
};

export function GameplayComposer({
  play,
  mode = "game",
  companionId = null,
  mechanic = null,
  onSaved,
  compact = false,
  initialText = "",
  historyOnly = false,
  historyIntro,
  renderAfterTurn,
  historyPosition,
  onHistoryPositionChange,
  beforeInput,
  inputTools,
  followLatest = false,
  onLiveView,
  showLiveView = true,
  onDraftText,
  resolveSend,
  companionRolls = "dm",
}: {
  play: PlaySnapshot;
  mode?: TurnMode;
  companionId?: string | null;
  mechanic?: MechanicChoice | null;
  onSaved: () => Promise<void>;
  compact?: boolean;
  initialText?: string;
  historyOnly?: boolean;
  historyIntro?: ReactNode;
  renderAfterTurn?: (turn: PublicTurn) => ReactNode;
  historyPosition?: StoryHistoryPosition;
  onHistoryPositionChange?: (position: StoryHistoryPosition) => void;
  beforeInput?: ReactNode;
  inputTools?: ReactNode;
  followLatest?: boolean;
  /** Each update of the streamed turn in flight (Stage 5 renders it in the game screen). */
  onLiveView?: (view: LiveTurnView) => void;
  /** Polish group 6: the screen follows the draft (the addressee chip reads it). */
  onDraftText?: (text: string) => void;
  /** Polish group 6: the addressee named in the text decides the turn's mode at send time;
   * the draft stays one draft whatever the text names. */
  resolveSend?: (text: string) => { mode: "game" | "companion"; companionId: string | null } | null;
  /** Without the turn's own told text (stage C: the text is told inside the turn); the legacy list of the stream's changes. */
  showLiveView?: boolean;
  /** The DM option «Броски спутников» (item 44): the companions' rolls as chips ("dm") or cards ("player"). */
  companionRolls?: "dm" | "player";
}) {
  const { campaignId, data } = useCampaignData();
  // Fix S3-pre A-37: the rerolls the session still allows (the server's own count), for the «Дальше» pause and the card.
  const rerolls = rerollsLeft(data?.settings?.values, play.turns, data?.publicState?.current_session_id ?? null);
  const scope = useCampaignDraftScope();
  const { t } = useLanguage();
  const memory = useSessionMemory();
  const [journal, setJournal] = useState<DraftJournal>(emptyJournal);
  const current = useRef(journal);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState(true);
  const [error, setError] = useState("");
  const [listeners, setListeners] = useState<string[]>([]);
  const [reviewAbsent, setReviewAbsent] = useState(false);
  // Provisional narration of the turn in flight (dm-loop-v1 streams it), with the place of each change in the
  // text (stage C, items 53, 63): the turn is told in order and the told text stays on screen.
  const [trace, setTrace] = useState<LiveTrace | null>(null);
  const traceRef = useRef<LiveTrace | null>(null);
  const followed = useRef<string | null>(null);
  const stopLive = useRef<() => void>(() => {});
  const liveListener = useRef(onLiveView);
  useEffect(() => {
    liveListener.current = onLiveView;
  }, [onLiveView]);
  const follow = (operationId: string) => {
    stopLive.current();
    followed.current = operationId;
    // Opened again for the same turn (after «Дальше»), the stream replays it from the start: the told text stays.
    if (traceRef.current?.view.operationId !== operationId) {
      traceRef.current = toldTurns.get(operationId) ?? null;
      setTrace(traceRef.current);
    }
    stopLive.current = followLiveTurn(campaignId, operationId, (view) => {
      traceRef.current = traceLive(traceRef.current, view);
      rememberTold(traceRef.current);
      setTrace(traceRef.current);
      liveListener.current?.(traceRef.current.view);
    });
  };
  const followRef = useRef(follow);
  useEffect(() => { followRef.current = follow; });
  useEffect(() => () => stopLive.current(), []);
  const live: LiveTurnView | null = (trace?.replay ?? trace)?.view ?? null;
  const traceFor = (turnId: string) => (trace?.view.operationId === turnId ? trace : toldTurns.get(turnId) ?? null);
  const key = journalKey(campaignId, mode, companionId, scope.timeline);
  const draftListener = useRef(onDraftText);
  useEffect(() => { draftListener.current = onDraftText; }, [onDraftText]);
  const write = (next: DraftJournal) => {
    next = { ...next, timeline: next.timeline ?? scope.timeline };
    current.current = next;
    setJournal(next);
    setStored(saveJournal(localStorageForDraft(), key, next));
    draftListener.current?.(next.text);
  };
  useEffect(() => {
    let live = true;
    queueMicrotask(() => {
      if (!live) return;
      const next = loadJournal(
        localStorageForDraft(),
        campaignId,
        mode,
        companionId,
        scope.timeline,
      );
      if (!next.text && !next.attempt) {
        next.text = initialText;
        next.timeline = scope.timeline;
      }
      current.current = next;
      setJournal(next);
      setReady(true);
      draftListener.current?.(next.text);
    });
    return () => {
      live = false;
    };
  }, [campaignId, mode, companionId, initialText, scope.timeline]);
  useUnsavedChanges(!stored && journal.text.length > 0);
  const turns = play.turns.filter((turn) =>
    belongsToChannel(turn, mode, companionId),
  );
  const historyRef = useRef<HTMLDivElement>(null);
  const initialHistoryPosition = useRef(historyPosition);
  const following = useRef(historyPosition?.following ?? true);
  const latest = turns.at(-1);
  useEffect(() => {
    const initial = initialHistoryPosition.current;
    if (initial && !initial.following && historyRef.current)
      historyRef.current.scrollTop = initial.scrollTop;
  }, [initialHistoryPosition]);
  useEffect(() => {
    const history = historyRef.current;
    if (!followLatest || !following.current || !history) return;
    // One page scroll (polish group 6): when the story is not its own scroll box, the newest turn is
    // brought into view on the page instead.
    if (history.scrollHeight > history.clientHeight + 1) history.scrollTop = history.scrollHeight;
    else (history.lastElementChild as HTMLElement | null)?.scrollIntoView?.({ block: "end" });
  }, [followLatest, latest?.id, latest?.updated_at]);
  const unresolved = turns.find(isUnresolved);
  // Stage C (item 63): a turn still running or waiting when this composer mounts (a reload, another screen, a
  // remount) is followed once: its stream replays the told text and the rolls in order.
  const runningTurnId = unresolved && (unresolved.mode === "game" || unresolved.mode === "companion") &&
    unresolved.status !== "failed" && !historyOnly ? unresolved.id : null;
  useEffect(() => {
    if (!runningTurnId || followed.current === runningTurnId) return;
    let mounted = true;
    queueMicrotask(() => {
      if (mounted && followed.current !== runningTurnId) followRef.current(runningTurnId);
    });
    return () => { mounted = false; };
  }, [runningTurnId]);
  const knownAttempt =
    journal.attempt &&
    play.turns.find((turn) => turn.id === journal.attempt?.operationId);
  const activeKnownAttempt = !!knownAttempt && isUnresolved(knownAttempt);
  useEffect(() => {
    if (!knownAttempt || scope.stale) return;
    const next = reconcileJournal(current.current, knownAttempt);
    if (next === current.current) return;
    current.current = next;
    saveJournal(localStorageForDraft(), key, next);
    queueMicrotask(() => setJournal(next));
  }, [knownAttempt, key, scope.stale]);
  // Polish 3 §2: while the bookkeeper records («recording»), the composer is open for the next
  // action; a send is held and goes the moment the turn commits (no two-commit turn).
  const [held, setHeld] = useState<{ text: string; send: boolean }>({ text: "", send: false });
  const heldRef = useRef(held);
  useEffect(() => { heldRef.current = held; }, [held]);
  const sendRef = useRef<() => Promise<void>>(async () => {});
  const recording = busy && live?.status === "recording";
  // Stage C: the turn just sent is shown (its stream tells it) before its record reaches this screen.
  const sent = journal.attempt;
  const pendingTurn = busy && sent && (sent.mode === "game" || sent.mode === "companion") &&
    !play.turns.some((turn) => turn.id === sent.operationId) ? provisionalTurn(sent) : null;
  const compactTurn = pendingTurn ?? unresolved ?? turns.at(-1) ?? null;
  // Item 42: four lines to start, growing with the text (typed, restored or inserted) up to a third of the screen.
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const boxText = recording ? held.text : journal.text;
  useLayoutEffect(() => growToText(areaRef.current), [boxText]);
  const accept = async (turn: PublicTurn) => {
    write(reconcileJournal(current.current, turn));
    // The committed turn's narration replaces the provisional text (the trace keeps where each roll came);
    // a turn paused for the player keeps its told text in place (item 63); a failed one discards it.
    stopLive.current();
    if (turn.status === "failed" || turn.status === "cancelled") {
      toldTurns.delete(turn.id);
      if (traceRef.current?.view.operationId === turn.id) {
        traceRef.current = null;
        setTrace(null);
      }
    }
    await onSaved();
    const next = heldRef.current;
    if (next.text.trim() && turn.status === "committed" && next.send) {
      write({ ...current.current, text: next.text });
      setHeld({ text: "", send: false });
      window.setTimeout(() => { void sendRef.current(); }, 0);
    } else if (next.text.trim()) {
      // A typed draft that was not sent stays in the composer.
      write({ ...current.current, text: next.text });
      setHeld({ text: "", send: false });
    }
  };
  /** Sends a stored command; one the server refused leaves the journal (dropRefusedCommand). */
  const resume = async (pending: ResumeInput) => {
    try {
      return await resumeTurn(pending);
    } catch (cause) {
      const next = dropRefusedCommand(
        current.current,
        cause instanceof GameplayClientError ? cause.status : null,
      );
      if (next !== current.current) write(next);
      throw cause;
    }
  };
  const run = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(
        cause instanceof GameplayClientError &&
        !["unavailable", "provider"].includes(cause.code)
          ? gameplayErrorMessage(cause)
          : connectionInterruptionMessage,
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const send = () =>
    run(async () => {
      if (
        scope.stale ||
        journalNeedsTimelineReview(current.current, play.timeline) ||
        !sameTimeline(data?.timeline, play.timeline)
      ) {
        setError(timelineChangedMessage);
        return;
      }
      if (
        !sessionGate(
          memory.error ? null : memory.snapshot,
          mode,
          current.current.command?.operationId ??
            current.current.attempt?.operationId ??
            null,
        )
      )
        return;
      if (current.current.command) {
        if (mode === "game" || mode === "companion") follow(current.current.command.operationId);
        const result = await resume(current.current.command);
        write({ ...current.current, command: null });
        await accept(result);
        return;
      }
      const previous = current.current.attempt;
      if (previous && current.current.recovered) {
        const pending = prepareCommand(null, {
          timeline: play.timeline,
          campaignId,
          operationId: previous.operationId,
          action: "retry",
          checkId: null,
        });
        write({ ...current.current, command: pending });
        if (mode === "game" || mode === "companion") follow(previous.operationId);
        const result = await resume(pending);
        write({ ...current.current, command: null });
        await accept(result);
        return;
      }
      if (!previous && (!current.current.text.trim() || unresolved)) return;
      const target = (mode === "game" || mode === "companion") && resolveSend?.(current.current.text) || { mode, companionId };
      const attempt = prepareAttempt(previous, {
        timeline: play.timeline,
        campaignId,
        expectedRevision: play.revision,
        mode: target.mode,
        input: current.current.text,
        companionId: target.companionId,
        listenerIds: target.mode === "companion" ? listeners : [],
        mechanic,
      });
      write({ ...current.current, attempt });
      if (target.mode === "game" || target.mode === "companion") follow(attempt.operationId);
      try {
        await accept(await sendTurn(attempt));
      } catch (cause) {
        if (
          cause instanceof GameplayClientError &&
          [
            "validation",
            "conflict",
            "configuration",
            "not_configured",
          ].includes(cause.code)
        ) {
          try {
            await accept(await loadTurn(campaignId, attempt.operationId));
          } catch (lookup) {
            // Only a confirmed absent operation permits editing the original submission.
            if (
              lookup instanceof GameplayClientError &&
              lookup.code === "not_found"
            ) {
              write({ ...current.current, attempt: null, command: null });
              await onSaved();
            }
          }
        }
        throw cause;
      }
    });
  useEffect(() => { sendRef.current = send; });
  /** Fix run A1: a failed move that cannot be retried goes again as a new move with the same text. */
  const resendFailed = (turn: PublicTurn) => {
    if (turn.status !== "failed" || turn.canRetry || current.current.attempt || current.current.command) return;
    write({ ...current.current, text: turn.input });
    void send();
  };
  const command = (
    turn: PublicTurn,
    action: ResumeInput["action"],
    checkId: string | null = null,
  ) =>
    run(async () => {
      if (
        scope.stale ||
        !sameTimeline(data?.timeline, turn.timeline) ||
        journalNeedsTimelineReview(current.current, play.timeline)
      ) {
        setError(timelineChangedMessage);
        return;
      }
      if (!turnAllowedBySession(memory.error ? null : memory.snapshot, turn))
        return;
      // Recovered durable turns need no copy of private or provider context in the browser.
      const attempt = current.current.attempt ?? {
        timeline: turn.timeline,
        operationId: turn.id,
        campaignId,
        expectedRevision: turn.expectedRevision,
        mode: turn.mode,
        input: turn.input,
        companionId: turn.companionId,
        listenerIds: turn.listenerIds,
        mechanic: null,
      };
      const pending = prepareCommand(current.current.command, {
        timeline: turn.timeline,
        campaignId,
        operationId: turn.id,
        action,
        checkId,
      });
      write({
        ...current.current,
        attempt,
        command: pending,
        recovered: current.current.recovered || !current.current.attempt,
      });
      if (turn.mode === "game" || turn.mode === "companion") follow(turn.id);
      const result = await resume(pending);
      write({ ...current.current, command: null });
      await accept(result);
    });
  const currentSession = data?.sessions.find(
    (row) =>
      row.id === data.publicState.current_session_id && row.status === "open",
  );
  const stateChangingBusy =
    mode !== "feedback" &&
    mode !== "ooc" &&
    play.turns.some(
      (turn) =>
        ["game", "companion", "mechanic"].includes(turn.mode) &&
        isUnresolved(turn),
    );
  const sessionAllowed = sessionGate(
    memory.error ? null : memory.snapshot,
    mode,
    journal.command?.operationId ?? journal.attempt?.operationId ?? null,
  );
  const timelineBlocked =
    scope.stale ||
    !sameTimeline(data?.timeline, play.timeline) ||
    journalNeedsTimelineReview(journal, play.timeline);
  const sessionPaused = !sessionGate(
    memory.error ? null : memory.snapshot,
    mode,
  );
  return (
    <div className="gameplay-channel">
      <TimelineDraftNotice stale={scope.stale} />
      {!scope.stale && timelineBlocked && (
        <div className="timeline-draft-notice" role="alert">
          <p>{t(timelineChangedMessage)}</p>
          <Button
            disabled={
              busy || (!!journal.attempt && !knownAttempt && !reviewAbsent)
            }
            onClick={() => {
              write(reviewJournalForTimeline(current.current, play.timeline));
              setReviewAbsent(false);
            }}
          >
            {t("Use this draft after reviewing the timeline")}
          </Button>
        </div>
      )}
      {sessionPaused && (
        <div className="session-saved-note" role="status">
          <p>
            {t(
              memory.error ||
                (!memory.snapshot
                  ? sessionGateLabels.loading
                  : memory.snapshot.currentBoundary?.state === "resuming"
                    ? sessionGateLabels.resuming
                    : sessionGateLabels.ended),
            )}
          </p>
          <Link className="text-link" href={`/campaigns/${campaignId}/game`}>
            {t("Game")}
          </Link>
          {memory.error && (
            <Button onClick={() => void memory.refresh().catch(() => {})}>
              {t("Retry loading")}
            </Button>
          )}
        </div>
      )}
      {!compact && (
        <div
          className="gameplay-turns"
          ref={historyRef}
          onScroll={(event) => {
            const history = event.currentTarget;
            following.current =
              history.scrollHeight - history.scrollTop - history.clientHeight <
              80;
            onHistoryPositionChange?.({
              scrollTop: history.scrollTop,
              following: following.current,
            });
          }}
          role="log"
          aria-label={t(
            mode === "feedback"
              ? "DM feedback conversation"
              : mode === "companion"
                ? "Companion conversation"
                : "Saved gameplay turns",
          )}
        >
          {historyIntro}
          {[...turns, ...(pendingTurn ? [pendingTurn] : [])].map((turn) => (
            <div
              key={turn.id}
              id={`saved-turn-${turn.id}`}
              className="session-saved-turn"
            >
              <GameplayTurn
                turn={turn}
                live={traceFor(turn.id)}
                running={busy && trace?.view.operationId === turn.id}
                recording={recording && trace?.view.operationId === turn.id}
                companionRolls={companionRolls}
                rerollsLeft={rerolls}
                busy={
                  busy ||
                  timelineBlocked ||
                  !turnAllowedBySession(
                    memory.error ? null : memory.snapshot,
                    turn,
                  )
                }
                onCommand={(action, checkId) =>
                  void command(turn, action, checkId)
                }
                onSaved={onSaved}
                onResend={turn.id === turns.at(-1)?.id ? () => resendFailed(turn) : undefined}
              />
              {renderAfterTurn?.(turn)}
            </div>
          ))}
        </div>
      )}
      {compact && compactTurn && (
        <div
          id={`saved-turn-${compactTurn.id}`}
          className="session-saved-turn"
        >
          <GameplayTurn
            turn={compactTurn}
            live={traceFor(compactTurn.id)}
            running={busy && trace?.view.operationId === compactTurn.id}
            recording={recording}
            companionRolls={companionRolls}
            rerollsLeft={rerolls}
            busy={
              busy ||
              timelineBlocked ||
              !turnAllowedBySession(
                memory.error ? null : memory.snapshot,
                compactTurn,
              )
            }
            onCommand={(action, checkId) =>
              void command(compactTurn, action, checkId)
            }
            onSaved={onSaved}
            onResend={() => resendFailed(compactTurn)}
          />
        </div>
      )}
      {/* The told text is inside the turn (stage C); here only the stream's change list and the recording note. */}
      {showLiveView && live && busy && (recording || live.changes.length > 0) && (
        <div className="gameplay-live-turn" role="status" aria-live="polite" data-recording={recording ? "true" : undefined}>
          {recording && <p className="muted">{t(held.send ? "Will be sent once the records are in." : "The text is complete; the DM is recording. You can write your next action — it is sent once the records are in.")}</p>}
          {live.changes.length > 0 && (
            <ul className="gameplay-live-changes">
              {live.changes.map((change, index) => (
                <li key={index} className={change.ok ? "" : "muted"}>{change.ok ? "✓" : "✗"} {change.summary}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!historyOnly && !play.configured && mode !== "mechanic" && (
        <p role="status" className="rules-preview-note">
          {t(
            "The DM needs local setup before it can respond. Your action is preserved.",
          )}
        </p>
      )}
      {!historyOnly && beforeInput}
      {!historyOnly && mode !== "feedback" && !currentSession && (
        <p className="muted">
          {t("Choose an open resume session before sending an action.")}
        </p>
      )}
      {!historyOnly && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (recording) {
              if (held.text.trim()) setHeld({ text: held.text, send: true });
              return;
            }
            void send();
          }}
        >
          <label className="field">
            <span>
              {t(
                mode === "feedback"
                  ? "Feedback message"
                  : mode === "ooc"
                    ? "Brief out-of-character remark"
                    : mode === "companion"
                      ? "Say something to your companion"
                      : "Describe your action",
              )}
            </span>
            <textarea
              ref={areaRef}
              rows={mode === "feedback" ? 5 : 4}
              value={recording ? held.text : journal.text}
              maxLength={actionMaxCharacters}
              disabled={!ready || (recording ? held.send : busy || !!journal.attempt)}
              data-recording={recording ? "true" : undefined}
              onChange={(event) =>
                recording ? setHeld({ text: event.target.value, send: false })
                  : write({ ...current.current, text: event.target.value })
              }
              placeholder={t(
                mode === "feedback"
                  ? "What would you like to change about the way this campaign is told?"
                  : mode === "ooc"
                    ? "A question outside the story…"
                  : "What do you do next?",
              )}
            />
          </label>
          {mode === "companion" && (
            <fieldset
              className="gameplay-listeners"
              disabled={busy || !!journal.attempt}
            >
              <legend>{t("Nearby listeners")}</legend>
              {data?.entities
                .filter(
                  (row) =>
                    // Fix run A3 (item 75): the hero speaks in the council and is never offered as a listener.
                    row.id !== companionId && row.kind !== "player" &&
                    play.configuration?.presentEntityIds.includes(row.id),
                )
                .map((row) => (
                  <label key={row.id}>
                    <input
                      type="checkbox"
                      checked={listeners.includes(row.id)}
                      onChange={(event) =>
                        setListeners(
                          event.target.checked
                            ? [...listeners, row.id]
                            : listeners.filter((id) => id !== row.id),
                        )
                      }
                    />
                    {row.name}
                  </label>
                ))}
            </fieldset>
          )}
          {!stored && (
            <p role="alert">
              {t(
                "Local draft storage is unavailable. Keep this page open until your action is saved.",
              )}
            </p>
          )}
          {shouldShowComposerError(error, knownAttempt) && (
            <p role="alert">{t(error)}</p>
          )}
          <div className="button-group gameplay-send-row">
            {(!activeKnownAttempt || recording) && (
              <Button
                primary
                type="submit"
                disabled={
                  recording
                    ? !held.text.trim() || held.send
                    : !ready ||
                      timelineBlocked ||
                      busy ||
                      !sessionAllowed ||
                      (mode !== "feedback" && !currentSession) ||
                      (!journal.attempt &&
                        (!journal.text.trim() || stateChangingBusy))
                }
              >
                <Icon name="Send" />
                {/* Stage C: a story turn names its own pause; the button never says «думает» while the turn is told. */}
                {t(
                  recording
                    ? "Send after the records"
                    : busy
                      ? mode === "game" || mode === "companion" ? "Send" : "DM is thinking…"
                      : journal.command || journal.attempt
                        ? "Try again"
                        : mode === "feedback"
                          ? "Send feedback"
                          : "Send",
                )}
              </Button>
            )}
            {inputTools}
          </div>
          {journal.attempt && timelineBlocked && !knownAttempt && (
            <details>
              <summary>{t("More options")}</summary>
              <Button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    try {
                      const turn = await loadTurn(
                        campaignId,
                        journal.attempt!.operationId,
                      );
                      await accept(turn);
                      if (sameTimeline(turn.timeline, play.timeline))
                        setReviewAbsent(true);
                    } catch (cause) {
                      if (
                        cause instanceof GameplayClientError &&
                        cause.code === "not_found" &&
                        !scope.stale
                      )
                        setReviewAbsent(true);
                      throw cause;
                    }
                  })
                }
              >
                {t("Check saved turn")}
              </Button>
            </details>
          )}
        </form>
      )}
    </div>
  );
}

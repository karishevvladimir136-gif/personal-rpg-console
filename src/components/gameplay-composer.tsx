"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

function localStorageForDraft() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
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
  historyPosition,
  onHistoryPositionChange,
  beforeInput,
  inputTools,
  followLatest = false,
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
  historyPosition?: StoryHistoryPosition;
  onHistoryPositionChange?: (position: StoryHistoryPosition) => void;
  beforeInput?: ReactNode;
  inputTools?: ReactNode;
  followLatest?: boolean;
}) {
  const { campaignId, data } = useCampaignData();
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
  const key = journalKey(campaignId, mode, companionId, scope.timeline);
  const write = (next: DraftJournal) => {
    next = { ...next, timeline: next.timeline ?? scope.timeline };
    current.current = next;
    setJournal(next);
    setStored(saveJournal(localStorageForDraft(), key, next));
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
    if (followLatest && following.current && historyRef.current)
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [followLatest, latest?.id, latest?.updated_at]);
  const unresolved = turns.find(isUnresolved);
  const knownAttempt =
    journal.attempt &&
    play.turns.find((turn) => turn.id === journal.attempt?.operationId);
  useEffect(() => {
    if (!knownAttempt || scope.stale) return;
    const next = reconcileJournal(current.current, knownAttempt);
    if (next === current.current) return;
    current.current = next;
    saveJournal(localStorageForDraft(), key, next);
    queueMicrotask(() => setJournal(next));
  }, [knownAttempt, key, scope.stale]);
  const accept = async (turn: PublicTurn) => {
    write(reconcileJournal(current.current, turn));
    await onSaved();
  };
  const run = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(gameplayErrorMessage(cause));
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
        const result = await resumeTurn(current.current.command);
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
        const result = await resumeTurn(pending);
        write({ ...current.current, command: null });
        await accept(result);
        return;
      }
      if (!previous && (!current.current.text.trim() || unresolved)) return;
      const attempt = prepareAttempt(previous, {
        timeline: play.timeline,
        campaignId,
        expectedRevision: play.revision,
        mode,
        input: current.current.text,
        companionId,
        listenerIds: mode === "companion" ? listeners : [],
        mechanic,
      });
      write({ ...current.current, attempt });
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
      const result = await resumeTurn(pending);
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
          {turns.map((turn) => (
            <div
              key={turn.id}
              id={`saved-turn-${turn.id}`}
              className="session-saved-turn"
            >
              <GameplayTurn
                turn={turn}
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
              />
            </div>
          ))}
        </div>
      )}
      {compact && (unresolved || turns.at(-1)) && (
        <div
          id={`saved-turn-${(unresolved || turns.at(-1))!.id}`}
          className="session-saved-turn"
        >
          <GameplayTurn
            turn={(unresolved || turns.at(-1))!}
            busy={
              busy ||
              timelineBlocked ||
              !turnAllowedBySession(
                memory.error ? null : memory.snapshot,
                (unresolved || turns.at(-1))!,
              )
            }
            onCommand={(action, checkId) =>
              void command((unresolved || turns.at(-1))!, action, checkId)
            }
            onSaved={onSaved}
          />
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
              rows={mode === "feedback" ? 5 : 4}
              value={journal.text}
              maxLength={actionMaxCharacters}
              disabled={!ready || busy || !!journal.attempt}
              onChange={(event) =>
                write({ ...current.current, text: event.target.value })
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
                    row.id !== companionId &&
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
          {error && <p role="alert">{t(error)}</p>}
          <div className="button-group">
            <Button
              primary
              type="submit"
              disabled={
                !ready ||
                timelineBlocked ||
                busy ||
                !sessionAllowed ||
                (mode !== "feedback" && !currentSession) ||
                (!journal.attempt &&
                  (!journal.text.trim() || stateChangingBusy))
              }
            >
              <Icon name="Send" />
              {t(
                busy
                  ? "Sending…"
                  : journal.command
                    ? "Retry pending confirmation"
                    : journal.attempt
                      ? "Retry same submission"
                      : mode === "feedback"
                        ? "Send feedback"
                        : "Send",
              )}
            </Button>
            {journal.attempt && (
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
            )}
          </div>
          {inputTools}
          {(journal.attempt || journal.command) && (
            <p className="muted" role="status">
              {t("Your accepted action keeps the same identity through retry and refresh.")}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

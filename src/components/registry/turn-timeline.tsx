"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Dices } from "lucide-react";
import type { PublicTurn, ResumeInput } from "@/lib/gameplay/contracts";
import {
  buildTurnTimeline,
  pauseWords,
  rollLines,
  shownStatus,
  type LiveTrace,
  type TimelineItem,
  type TurnPause,
} from "@/lib/ui/turn-timeline";
import { GameplayCheck } from "../gameplay-dice";
import { useCopy } from "./primitives";
import t from "./turn.module.css";

/** True once `key` has not changed for `ms` while `active` (the stream went quiet in the middle of a turn). */
function useQuiet(key: string, active: boolean, ms = 1600) {
  const [quietKey, setQuietKey] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setQuietKey(key), ms);
    return () => window.clearTimeout(timer);
  }, [key, active, ms]);
  return active && quietKey === key;
}

/** One roll made for the player by the DM: who, what, the number and the outcome, in place in the story. */
export function RollChip({ who, text, tone }: { who: string | null; text: string; tone: "success" | "failure" | null }) {
  return (
    <div className={t.chip} data-tone={tone ?? undefined}>
      <Dices size={15} aria-hidden="true" className={t.chipIcon} />
      <span className={t.chipLine}>{who && <strong className={t.chipWho}>{who}</strong>}{who ? " · " : ""}{text}</span>
    </div>
  );
}

/** The named pause of a running turn; `action` sits next to the words («Дальше» at the player's roll). */
export function TurnPauseLine({ pause, action, note }: { pause: TurnPause; action?: ReactNode; note?: ReactNode }) {
  const c = useCopy();
  return (
    <div className={t.pause} data-kind={pause.kind} role="status" aria-live="polite">
      <span className={t.pauseMark} aria-hidden="true" />
      <span className={t.pauseWords}>{pauseWords(pause, c.ru ? "ru" : "en")}</span>
      {action}
      {note && <span className={t.pauseNote}>{note}</span>}
    </div>
  );
}

/** The turn as one timeline: the told text, each roll in its place, the continuation, then the named pause. */
export function TurnTimeline({ turn, trace, label, heroId, party, companionRolls = "dm", rollsWait = false, running = false, recording = false, busy, onCommand, continueAction }: {
  turn: PublicTurn;
  trace: LiveTrace | null;
  /** The narration's eyebrow («Ведущий»; the game screen hides it). */
  label: string;
  heroId: string | null;
  party: string[];
  companionRolls?: "dm" | "player";
  /** The campaign's dice settings make the player's rolls wait for the player. */
  rollsWait?: boolean;
  /** The player's «Дальше» or reroll for this turn is running. */
  running?: boolean;
  /** The composer knows the records are being written (the stream said so). */
  recording?: boolean;
  busy: boolean;
  onCommand: (action: ResumeInput["action"], checkId?: string | null) => void;
  /** «Дальше» while the turn waits for the player's roll. */
  continueAction?: ReactNode;
}) {
  const c = useCopy();
  // A failed or cancelled turn changed nothing: its provisional text and rolls are not shown.
  const told = turn.status === "failed" || turn.status === "cancelled" ? null : trace;
  const shown = shownStatus(turn, told, running);
  const status = recording && shown !== "committed" && shown !== "failed" && shown !== "cancelled" ? "recording" : shown;
  // A paused turn after a reload or a restart: the server's told text when this page has no stream of it.
  const text = turn.narration ?? (told?.view.text || turn.told) ?? "";
  const telling = status === "generating" || status === "pending";
  const quiet = useQuiet(`${told?.view.text.length ?? 0}:${told?.view.changes.length ?? 0}:${status}`, telling && !!text.trim());
  const { items, pause } = buildTurnTimeline({
    text, rolls: rollLines(turn, told), checks: turn.checks, heroId, party, companionRolls, status,
    idle: quiet, rollsWait, language: c.ru ? "ru" : "en",
  });
  const awaiting = status === "awaiting_confirmation";
  const rerollable = awaiting && turn.checks.some((check) => check.canReroll);
  const lastText = [...items].reverse().find((item) => item.kind === "text")?.key;
  const caretOn = telling && !quiet && !pause && items.at(-1)?.kind === "text";
  if (!items.length && !pause) return null;
  const render = (item: TimelineItem) => {
    switch (item.kind) {
      case "text":
        return (
          <div key={item.key} className={`prose ${t.text}`}>
            {item.text}{caretOn && item.key === lastText && <span className={t.caret} aria-hidden="true" />}
          </div>
        );
      case "card":
        return (
          <GameplayCheck key={item.key} check={item.check} ready={awaiting && item.check.interactive}
            footer={awaiting && item.check.canReroll ? (
              <button type="button" className={`text-link ${t.reroll}`} disabled={busy} onClick={() => onCommand("reroll", item.check.id)}>
                {c("Запросить разрешённый переброс", "Request an allowed reroll")}
              </button>
            ) : null} />
        );
      case "pending":
        return (
          <div key={item.key} className={t.pending}>
            <Dices size={18} aria-hidden="true" />
            <span className={t.pendingTitle}>{item.title}</span>
            <span className={t.pendingNote}>{c("куб брошен — карточка сейчас появится", "the die is cast — the card is on its way")}</span>
          </div>
        );
      case "chip":
        return <RollChip key={item.key} who={item.who} text={item.text} tone={item.tone} />;
    }
  };
  return (
    <article className="gameplay-narration">
      <span className="eyebrow">{label}</span>
      <div className={t.timeline}>
        {items.map(render)}
        {pause && (
          <TurnPauseLine pause={pause} action={awaiting ? continueAction : null}
            note={rerollable ? c("Правила кампании дают здесь переброс; новый куб заменит этот.", "The campaign's rules grant a reroll here; the new die replaces this one.") : null} />
        )}
      </div>
    </article>
  );
}

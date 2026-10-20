"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createDicePlayback, type PlaybackPhase } from "@/lib/dice-preview";
import type { VisibleCheck } from "@/lib/gameplay/contracts";
import { checkAddends } from "@/lib/ui/turn-timeline";
import { useLanguage } from "./language-context";
import { useCopy } from "./registry/primitives";
import { Badge, Button } from "./ui";
import turnStyles from "./registry/turn.module.css";

// The roll card as a moment in the story (polish group 2): the reason in words,
// the die and the number big, success or failure, the bonuses with their
// sources, advantage and why, the difficulty in words. The result is already
// recorded by the server; this presentation never rolls again.
// Fix run after session 2, stage C (items 43, 44): every addend of the total is visible — the die kept, the part
// that comes from the sheet and the worn items, each bonus of the fiction with its source — and the card waits
// for the player's tap only while its turn waits for the player (a saved card shows its result).

const checkKindLabels: Record<VisibleCheck["kind"], string> = {
  skill: "Skill check",
  attack: "Attack roll",
  save: "Saving throw",
  transform: "Transformation check",
};

const difficultyLabels: Record<NonNullable<VisibleCheck["difficulty"]>, string> = {
  easy: "an easy task",
  normal: "an ordinary task",
  hard: "a hard task",
  very_hard: "a very hard task",
  nearly_impossible: "a nearly impossible task",
};

/** Faces shown while the die tumbles: a fixed sequence, never a random source. */
const TUMBLE_FACES = [7, 14, 3, 19, 11, 2, 16, 8, 20, 5, 12, 1, 17, 9, 13, 4, 18, 6, 10, 15];

export function momentTitle(check: VisibleCheck, t: (key: string) => string) {
  return check.reason?.trim() || t(checkKindLabels[check.kind]);
}

const signed = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value)}`;

function D20({ value, phase, natural }: { value: number; phase: PlaybackPhase; natural: VisibleCheck["natural"] }) {
  const [face, setFace] = useState(0);
  useEffect(() => {
    if (phase !== "rolling") return;
    const timer = window.setInterval(() => setFace((index) => (index + 1) % TUMBLE_FACES.length), 80);
    return () => window.clearInterval(timer);
  }, [phase]);
  const shown = phase === "revealed" ? value : phase === "rolling" ? TUMBLE_FACES[face] : "?";
  return (
    <svg viewBox="0 0 200 220" className={`d20-art moment-d20 ${phase === "revealed" && natural === "crit" ? "is-crit" : ""} ${phase === "revealed" && natural === "fumble" ? "is-fumble" : ""}`} aria-hidden="true">
      <path d="M100 8 185 58 185 160 100 211 15 160 15 58Z" fill="#1b2022" stroke="#b99358" strokeWidth="2" />
      <path d="M100 8 100 43 15 58 47 162 15 160M100 43 185 58 153 162 185 160M47 162 100 211 153 162M100 43 47 162 153 162Z" fill="none" stroke="#aa8549" />
      <text x="100" y="123" textAnchor="middle" fill="#e4d3af" fontSize="43">{shown}</text>
    </svg>
  );
}

function Verdict({ check }: { check: VisibleCheck }) {
  const { t } = useLanguage();
  const word = check.natural === "crit" ? t("Critical!") : check.natural === "fumble" ? t("A natural one") : check.success ? t("Success") : t("Failure");
  return (
    <div className={`moment-verdict ${check.success ? "success" : "failure"}`}>
      <span className="moment-word">{word}</span>
      <strong className="moment-total">{check.total}</strong>
    </div>
  );
}

/** The addends before the roll (what the hero brings), the die and the sum once it is revealed. */
function Breakdown({ check, revealed }: { check: VisibleCheck; revealed: boolean }) {
  const c = useCopy();
  const addends = checkAddends(check, c("лист и снаряжение", "sheet and gear"), { formula: c("формула", "formula"), cap: c("предел бонусов", "bonus cap") });
  const dice = check.advantage !== "normal"
    ? c(`Два куба: ${check.dice.join(" и ")} — взят ${check.advantage === "advantage" ? "больший" : "меньший"}, ${check.kept}`,
      `Two dice: ${check.dice.join(" and ")} — the ${check.advantage === "advantage" ? "higher" : "lower"} one counts, ${check.kept}`)
    : c(`Куб: ${check.kept}`, `Die: ${check.kept}`);
  return (
    <div className="moment-breakdown">
      {revealed && <p className={turnStyles.diceLine}>{dice}</p>}
      {addends.length > 0 && (
        <ul className={turnStyles.addends} aria-label={c("Что прибавляется к кубу", "What adds to the die")}>
          {addends.map((addend, index) => (
            <li key={index} className={turnStyles.addend}><b>{signed(addend.value)}</b><span className={turnStyles.addendSource}>{addend.source}</span></li>
          ))}
        </ul>
      )}
      {revealed && addends.length > 0 && (
        <p className={turnStyles.equation}>{`${check.kept} ${addends.map((addend) => `${addend.value >= 0 ? "+" : "−"} ${Math.abs(addend.value)}`).join(" ")} = ${check.total}`}</p>
      )}
    </div>
  );
}

function Difficulty({ check }: { check: VisibleCheck }) {
  const { t } = useLanguage();
  const c = useCopy();
  if (!check.difficulty && check.dc === null) return null;
  const words = check.difficulty ? t(difficultyLabels[check.difficulty]) : null;
  // The number shows only when the campaign's «show DC» setting allows it (dc is null otherwise).
  return (
    <Badge>
      {[words ? c(`Сложность: ${words}`, `Difficulty: ${words}`) : null, check.dc !== null ? t("DC {value}", { value: check.dc }) : null].filter(Boolean).join(" · ")}
    </Badge>
  );
}

export function GameplayCheck({ check, ready = check.interactive, footer = null }: {
  check: VisibleCheck;
  /** The die waits for the player's tap (the turn waits for the player); a saved card shows its result. */
  ready?: boolean;
  /** A small action under the card (the allowed reroll). */
  footer?: ReactNode;
}) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<PlaybackPhase>(ready ? "ready" : "revealed");
  // The turn went on without the tap («Дальше»): the result is told, so the card shows it.
  const [wasReady, setWasReady] = useState(ready);
  if (wasReady !== ready) {
    setWasReady(ready);
    if (!ready && phase === "ready") setPhase("revealed");
  }
  const playback = useRef<ReturnType<typeof createDicePlayback> | null>(null);
  useEffect(() => {
    const controller = createDicePlayback({ initialPhase: ready ? "ready" : "revealed", onPhase: setPhase });
    playback.current = controller;
    return () => { controller.dispose(); playback.current = null; };
  }, [check.id, check.rollNumber, ready]);
  const reveal = (replay = false) =>
    playback.current?.play(window.matchMedia("(prefers-reduced-motion: reduce)").matches, replay);
  const revealed = phase === "revealed";
  return (
    <section className={`gameplay-check moment-card ${revealed ? (check.success ? "success" : "failure") : "pending"} ${revealed && check.natural ? check.natural : ""}`}
      aria-label={momentTitle(check, t)}>
      <div className="moment-head">
        <span className="eyebrow">{check.actorName} · {t(checkKindLabels[check.kind])}</span>
        <h4 className="moment-title">{momentTitle(check, t)}</h4>
      </div>
      <div className="moment-body">
        <button type="button" className={`gameplay-die moment-die ${phase === "rolling" ? "is-rolling" : ""}`} disabled={phase !== "ready"}
          onClick={() => reveal()} aria-label={t("Roll the die")}>
          <D20 value={check.kept} phase={phase} natural={check.natural ?? null} />
        </button>
        <div className="moment-side">
          {revealed ? (
            <div role="status" aria-live="polite">
              <Verdict check={check} />
            </div>
          ) : (
            <p className="muted moment-hint">{phase === "rolling" ? t("Rolling…") : t("The die is cast on the server; tap it to see how it fell.")}</p>
          )}
          <Breakdown check={check} revealed={revealed} />
          <div className="moment-tags">
            <Difficulty check={check} />
            {check.advantage !== "normal" && (
              <Badge>{[t(check.advantage === "advantage" ? "Advantage" : "Disadvantage"), check.advantageReason?.trim()].filter(Boolean).join(": ")}</Badge>
            )}
          </div>
        </div>
      </div>
      {!revealed && phase === "ready" && (
        <Button primary onClick={() => reveal()}>{t("Roll the die")}</Button>
      )}
      {revealed && check.interactive && (
        <button type="button" className="text-link moment-replay" onClick={() => reveal(true)}>{t("Replay presentation")}</button>
      )}
      {footer}
    </section>
  );
}

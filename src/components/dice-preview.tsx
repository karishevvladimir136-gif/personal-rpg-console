"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "./language-context";
import { usePreview } from "./preview-context";
import { Badge, Button, Modal } from "./ui";
import {
  createDicePlayback,
  demoFixtures,
  getCheckPresentation,
  getDemoResult,
  getVisibleDc,
  type DemoFixture,
  type PlaybackPhase,
} from "@/lib/dice-preview";

// Original vector geometry; this is a light, decorative presentation of a d20.
function D20({ face }: { face: number | string }) {
  const gradient = useId();
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
      className="d20-art"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3c98d" />
          <stop offset="45%" stopColor="#ac8146" />
          <stop offset="100%" stopColor="#654829" />
        </linearGradient>
      </defs>
      <path
        d="M120 10 220 64 220 176 120 230 20 176 20 64Z"
        fill="#171d20"
        stroke={`url(#${gradient})`}
        strokeWidth="2"
      />
      <path
        d="M120 10 120 45 20 64ZM120 10 220 64 120 45ZM20 64 54 176 20 176ZM220 64 220 176 186 176ZM54 176 120 230 20 176ZM186 176 220 176 120 230Z"
        fill="#b68d4c"
        fillOpacity=".09"
      />
      <path d="M120 45 54 176 186 176Z" fill="#c6a05b" fillOpacity=".13" />
      <path
        d="M120 10 120 45 20 64 54 176 20 176M120 45 220 64 186 176 220 176M54 176 120 230 186 176M120 45 54 176 186 176Z"
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="1.1"
      />
      <text x="120" y="133" textAnchor="middle" dominantBaseline="middle">
        {face}
      </text>
      <circle cx="120" cy="18" r="2" fill="#e7cd96" />
    </svg>
  );
}

function ModifierList({ fixture }: { fixture: DemoFixture }) {
  const { t } = useLanguage();
  return (
    <div className="dice-modifiers" aria-label={t("Modifier breakdown")}>
      {fixture.modifiers.map((modifier) => (
        <div key={modifier.label}>
          <strong>
            {modifier.value >= 0 ? "+" : ""}
            {modifier.value}
          </strong>
          <span>
            {t(modifier.label)}
            <small>{t(modifier.explanation)}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

function ResultSummary({
  fixture,
  announce = false,
}: {
  fixture: DemoFixture;
  announce?: boolean;
}) {
  const { t } = useLanguage();
  const result = getDemoResult(fixture);
  return (
    <div
      className={`dice-result ${result.outcome}`}
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
      aria-atomic={announce ? true : undefined}
    >
      <div className="dice-result-heading">
        <span>{t(result.outcome === "success" ? "Success" : "Failure")}</span>
        <strong>
          {result.total}
          <small>{t("Final total")}</small>
        </strong>
      </div>
      <p className="dice-equation">
        {t("Kept die: {value}", { value: result.kept })}
        {fixture.modifiers.map((modifier) => (
          <span key={modifier.label}>
            {" "}
            {modifier.value >= 0 ? "+" : "−"} {Math.abs(modifier.value)} (
            {t(modifier.label)})
          </span>
        ))}{" "}
        = {result.total}
      </p>
      {fixture.mode !== "ordinary" && (
        <div className="dice-individual-results">
          {result.dice.map((die, index) => (
            <span
              key={index}
              className={index === result.keptIndex ? "kept" : "discarded"}
            >
              {t("Die {number}: {value}", { number: index + 1, value: die })} ·{" "}
              {t(index === result.keptIndex ? "Kept" : "Not kept")}
            </span>
          ))}
        </div>
      )}
      <p className="dice-consequence">{t(fixture.narrative)}</p>
    </div>
  );
}

function CheckHeading({ fixture, dc }: { fixture: DemoFixture; dc?: number }) {
  const { t } = useLanguage();
  return (
    <div className="dice-check-heading">
      <span className="eyebrow">{t("A MOMENT OF UNCERTAINTY")}</span>
      <h3>{t(fixture.skill)}</h3>
      <p>{t(fixture.action)}</p>
      <div className="dice-check-tags">
        {dc !== undefined && (
          <span className="dice-dc">
            {t("DC {value}", { value: dc })}
            <small>{t("Target number to succeed")}</small>
          </span>
        )}
        {fixture.mode !== "ordinary" && (
          <Badge>
            {t(
              fixture.mode === "advantage"
                ? "Advantage · keep the higher die"
                : "Disadvantage · keep the lower die",
            )}
          </Badge>
        )}
      </div>
    </div>
  );
}

function InteractiveRoll({
  fixture,
  dc,
  onClose,
}: {
  fixture: DemoFixture;
  dc?: number;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { diceDemo, setDiceDemo } = usePreview();
  const [initialPhase] = useState<"ready" | "revealed">(() =>
    diceDemo.revealed ? "revealed" : "ready",
  );
  const [phase, setPhase] = useState<PlaybackPhase>(initialPhase);
  const playback = useRef<ReturnType<typeof createDicePlayback> | null>(null);
  const resultActions = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase === "revealed")
      resultActions.current?.querySelector("button")?.focus();
  }, [phase]);
  useEffect(() => {
    const controller = createDicePlayback({
      initialPhase,
      onPhase: (next) => {
        setPhase(next);
        setDiceDemo((previous) => ({
          ...previous,
          revealed: next === "revealed",
        }));
      },
    });
    playback.current = controller;
    return () => {
      controller.dispose();
      playback.current = null;
    };
  }, [initialPhase, setDiceDemo]);
  function play(replay = false) {
    playback.current?.play(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      replay,
    );
  }
  const result = getDemoResult(fixture);
  const revealed = phase === "revealed";
  return (
    <div
      className={`interactive-roll ${phase} ${revealed ? result.outcome : ""}`}
    >
      <CheckHeading fixture={fixture} dc={dc} />
      <div className="dice-stage">
        <button
          className={`dice-touch ${fixture.mode === "ordinary" ? "" : "paired"}`}
          type="button"
          aria-label={t("Roll sample dice")}
          disabled={phase !== "ready"}
          onClick={() => play()}
        >
          {fixture.dice.map((die, index) => (
            <span
              className={`die-shell ${revealed && index !== result.keptIndex ? "not-kept" : ""}`}
              key={index}
            >
              <D20 face={revealed ? die : "✧"} />
            </span>
          ))}
        </button>
        <p className="dice-stage-caption">
          {t(
            phase === "rolling"
              ? "The dice are settling…"
              : revealed
                ? "A sample moment, revealed."
                : "The moment is yours. Roll when ready.",
          )}
        </p>
      </div>
      {!revealed && (
        <div className="dice-window-actions dice-roll-action">
          <Button primary onClick={() => play()} disabled={phase === "rolling"}>
            {t(phase === "rolling" ? "Rolling…" : "Roll")}
          </Button>
          <Button onClick={onClose}>{t("Close preview")}</Button>
        </div>
      )}
      <ModifierList fixture={fixture} />
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {revealed
          ? t("{outcome}. Final total: {total}.", {
              outcome: t(result.outcome === "success" ? "Success" : "Failure"),
              total: result.total,
            })
          : ""}
      </div>
      {revealed && <ResultSummary fixture={fixture} />}
      {revealed && (
        <div className="dice-window-actions" ref={resultActions}>
          <>
            <Button primary onClick={onClose}>
              {t("Continue")}
            </Button>
            <Button onClick={() => play(true)}>
              {t("Replay sample animation")}
            </Button>
          </>
        </div>
      )}
      {revealed && (
        <p className="dice-demo-footnote">
          {t(
            "Replay presents the same fixed sample. It is not a gameplay reroll.",
          )}
        </p>
      )}
    </div>
  );
}

function DicePreviewDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { campaignSettings, diceDemo, setDiceDemo } = usePreview();
  const fixture: DemoFixture =
    demoFixtures.find((item) => item.id === diceDemo.fixtureId) ??
    demoFixtures[0];
  const check = {
    visibility: "player" as const,
    important: diceDemo.important,
    publicDc: fixture.publicDc,
  };
  const presentation = getCheckPresentation(campaignSettings, check);
  const dc = getVisibleDc(campaignSettings, check);
  return (
    <Modal title={t("Dice preview")} onClose={onClose} className="dice-modal">
      <p className="dice-demo-label">{t("Demo roll — no campaign effects")}</p>
      <details className="dice-demo-setup">
        <summary>
          {t("Demo setup")}
          <span>{t(fixture.label)}</span>
        </summary>
        <div className="dice-demo-controls">
          <label className="field">
            {t("Demo sample")}
            <select
              value={diceDemo.fixtureId}
              onChange={(event) => {
                const selected = demoFixtures.find(
                  (item) => item.id === event.target.value,
                );
                if (selected)
                  setDiceDemo((previous) =>
                    previous.fixtureId === selected.id
                      ? previous
                      : {
                          ...previous,
                          fixtureId: selected.id,
                          revealed: false,
                        },
                  );
              }}
            >
              {demoFixtures.map((item) => (
                <option key={item.id} value={item.id}>
                  {t(item.label)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t("Demo importance")}
            <select
              value={diceDemo.important ? "important" : "ordinary"}
              onChange={(event) =>
                setDiceDemo((previous) =>
                  previous.important === (event.target.value === "important")
                    ? previous
                    : {
                        ...previous,
                        important: event.target.value === "important",
                        revealed: false,
                      },
                )
              }
            >
              <option value="important">{t("Important player check")}</option>
              <option value="ordinary">
                {t("Non-important player check")}
              </option>
            </select>
          </label>
        </div>
        <p className="dice-demo-footnote">
          {t(
            "Demo controls only. Presentation follows this campaign’s Checks & Dice settings.",
          )}
        </p>
      </details>
      {presentation === "interactive" && (
        <InteractiveRoll
          key={`${fixture.id}-${diceDemo.important}`}
          fixture={fixture}
          dc={dc}
          onClose={onClose}
        />
      )}
      {presentation === "compact" && (
        <div className="compact-roll">
          <CheckHeading fixture={fixture} dc={dc} />
          <ModifierList fixture={fixture} />
          <ResultSummary fixture={fixture} announce />
          <div className="dice-window-actions">
            <Button primary onClick={onClose}>
              {t("Continue")}
            </Button>
          </div>
        </div>
      )}
      {presentation === "narrative" && (
        <div className="narrative-demo">
          <span className="eyebrow">{t("A SAMPLE MOMENT")}</span>
          <p>{t(fixture.narrative)}</p>
          <Button primary onClick={onClose}>
            {t("Continue")}
          </Button>
        </div>
      )}
    </Modal>
  );
}

export function DicePreviewButton({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={compact ? "dice-preview-entry" : "button primary"}
        onClick={() => setOpen(true)}
      >
        <span className="dice-entry-icon">
          <D20 face="✧" />
        </span>
        {t(compact ? "Dice preview" : "Open dice preview")}
      </button>
      {open &&
        createPortal(
          <DicePreviewDialog onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}

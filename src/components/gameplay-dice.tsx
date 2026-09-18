"use client";

import { useEffect, useRef, useState } from "react";
import { createDicePlayback, type PlaybackPhase } from "@/lib/dice-preview";
import type { VisibleCheck } from "@/lib/gameplay/contracts";
import { useLanguage } from "./language-context";
import { Badge, Button, Modal } from "./ui";

const checkKindLabels: Record<VisibleCheck["kind"], string> = {
  skill: "Skill check",
  attack: "Attack roll",
  save: "Saving throw",
  transform: "Transformation check",
};

function Breakdown({ check }: { check: VisibleCheck }) {
  const { t } = useLanguage();
  return (
    <div className={`dice-result ${check.success ? "success" : "failure"}`}>
      <div className="dice-result-heading">
        <span>{t(check.success ? "Success" : "Failure")}</span>
        <strong>
          {check.total}
          <small>{t("Final total")}</small>
        </strong>
      </div>
      <p>
        {t("Kept die: {value}", { value: check.kept })}{" "}
        {check.modifier >= 0 ? "+" : "−"}
        {Math.abs(check.modifier)} = {check.total}
      </p>
      <div className="dice-individual-results">
        {check.dice.map((die, index) => (
          <span key={index}>
            {t("Die {number}: {value}", { number: index + 1, value: die })}
          </span>
        ))}
      </div>
      <p className="muted">
        {t("Recorded server result. Presentation never rolls again.")}
      </p>
    </div>
  );
}
function RecordedDiceModal({
  check,
  onClose,
}: {
  check: VisibleCheck;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<PlaybackPhase>("ready");
  const playback = useRef<ReturnType<typeof createDicePlayback> | null>(null);
  useEffect(() => {
    const controller = createDicePlayback({ onPhase: setPhase });
    playback.current = controller;
    return () => {
      controller.dispose();
      playback.current = null;
    };
  }, []);
  const reveal = (replay = false) =>
    playback.current?.play(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      replay,
    );
  return (
    <Modal title={t("Recorded check")} onClose={onClose} className="dice-modal">
      <div className="dice-check-heading">
        <span className="eyebrow">{check.actorName}</span>
        <h3>{t(checkKindLabels[check.kind])}</h3>
      </div>
      {check.dc !== null && (
        <Badge>{t("DC {value}", { value: check.dc })}</Badge>
      )}
      <p>{t("Modifier: {value}", { value: check.modifier })}</p>
      {check.advantage !== "normal" && (
        <Badge>
          {t(
            check.advantage === "advantage"
              ? "Advantage · keep the higher die"
              : "Disadvantage · keep the lower die",
          )}
        </Badge>
      )}
      <button
        type="button"
        className={`gameplay-die ${phase === "rolling" ? "is-rolling" : ""}`}
        disabled={phase !== "ready"}
        onClick={() => reveal()}
        aria-label={t("Reveal recorded result")}
      >
        <svg viewBox="0 0 200 220" className="d20-art" aria-hidden="true">
          <path
            d="M100 8 185 58 185 160 100 211 15 160 15 58Z"
            fill="#1b2022"
            stroke="#b99358"
            strokeWidth="2"
          />
          <path
            d="M100 8 100 43 15 58 47 162 15 160M100 43 185 58 153 162 185 160M47 162 100 211 153 162M100 43 47 162 153 162Z"
            fill="none"
            stroke="#aa8549"
          />
          <text
            x="100"
            y="123"
            textAnchor="middle"
            fill="#e4d3af"
            fontSize="43"
          >
            {phase === "revealed" ? check.kept : "?"}
          </text>
        </svg>
      </button>
      {phase === "revealed" ? (
        <div role="status" aria-live="polite">
          <Breakdown check={check} />
        </div>
      ) : (
        <p className="muted">
          {t("The result is already recorded. Reveal it when ready.")}
        </p>
      )}
      <div className="button-group">
        {phase === "ready" && (
          <Button primary onClick={() => reveal()}>
            {t("Reveal recorded result")}
          </Button>
        )}
        {phase === "revealed" && (
          <Button onClick={() => reveal(true)}>
            {t("Replay presentation")}
          </Button>
        )}
        <Button onClick={onClose}>{t("Close")}</Button>
      </div>
    </Modal>
  );
}
export function GameplayCheck({ check }: { check: VisibleCheck }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="gameplay-check">
      <strong>
        {check.actorName} · {t(checkKindLabels[check.kind])}
      </strong>
      {check.interactive ? (
        <Button onClick={() => setOpen(true)}>
          {t("View recorded check")}
        </Button>
      ) : (
        <Breakdown check={check} />
      )}
      {!check.interactive && check.dc !== null && (
        <Badge>{t("DC {value}", { value: check.dc })}</Badge>
      )}
      {open && (
        <RecordedDiceModal
          key={`${check.id}:${check.rollNumber}`}
          check={check}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

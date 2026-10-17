"use client";
import { useEffect, useState } from "react";
import type {
  AdventurePacing,
  AdventureReview,
  AdventureSetup,
} from "../../lib/adventures/contracts";
import { parseAdventureReview } from "../../lib/adventures/validation";
import { adventureText } from "./text";
import styles from "./adventures.module.css";

export function pacingLabel(pacing: AdventurePacing, language: "en" | "ru") {
  const c = adventureText(language);
  return pacing.kind === "quick"
    ? c.quick
    : pacing.kind === "evening"
      ? c.evening
      : pacing.kind === "mini_arc"
        ? c.mini
        : pacing.kind === "custom"
          ? pacing.custom
          : c.open;
}
export function SetupForm({
  language,
  initial,
  disabled,
  onSave,
  onCancel,
  onDirty,
  direct = false,
}: {
  language: "en" | "ru";
  initial?: AdventureSetup;
  disabled: boolean;
  onSave: (setup: AdventureSetup) => void;
  onCancel: () => void;
  onDirty: (dirty: boolean) => void;
  /** Polish 2 §6: a prefilled first adventure saves on the first click and goes straight to the opening review. */
  direct?: boolean;
}) {
  const c = adventureText(language);
  const [title, setTitle] = useState(initial?.title ?? ""),
    [premise, setPremise] = useState(initial?.premise ?? "");
  const [kind, setKind] = useState<AdventurePacing["kind"]>(
      initial?.pacing.kind ?? "evening",
    ),
    [custom, setCustom] = useState(initial?.pacing.custom ?? "");
  const [reviewing, setReviewing] = useState(false);
  const setup = {
    title,
    premise,
    pacing: { kind, custom: kind === "custom" ? custom : null },
  };
  useEffect(() => {
    onDirty(
      title !== (initial?.title ?? "") ||
        premise !== (initial?.premise ?? "") ||
        kind !== (initial?.pacing.kind ?? "evening") ||
        custom !== (initial?.pacing.custom ?? ""),
    );
  }, [title, premise, kind, custom, initial, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled) {
          if (reviewing || direct) onSave(setup);
          else setReviewing(true);
        }
      }}
    >
      <fieldset disabled={disabled}>
        {reviewing ? (
          <div className={styles.setup}>
            <h3>{c.reviewAdventure}</h3>
            <p>{title}</p>
            <p>{premise}</p>
            <p>{pacingLabel(setup.pacing, language)}</p>
            <p className={styles.muted}>{c.startHelp}</p>
          </div>
        ) : (
          <div className={styles.form}>
            <label className={styles.field}>
              {c.adventureTitle}
              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              {c.premise}
              <textarea
                required
                rows={5}
                maxLength={20000}
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
              />
            </label>
            <p className={styles.muted}>{c.premiseHelp}</p>
            <label className={styles.field}>
              {c.pacing}
              <select
                value={kind}
                onChange={(e) =>
                  setKind(e.target.value as AdventurePacing["kind"])
                }
              >
                <option value="quick">{c.quick}</option>
                <option value="evening">{c.evening}</option>
                <option value="mini_arc">{c.mini}</option>
                <option value="custom">{c.custom}</option>
                <option value="open">{c.open}</option>
              </select>
            </label>
            {kind === "custom" && (
              <label className={styles.field}>
                {c.customPrompt}
                <textarea
                  required
                  maxLength={2000}
                  rows={2}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />
              </label>
            )}
            <p className={styles.muted}>{c.pacingHelp}</p>
          </div>
        )}
      </fieldset>
      <div className={styles.actions}>
        <button
          className={styles.primary}
          type="submit"
          disabled={
            disabled ||
            !title.trim() ||
            !premise.trim() ||
            (kind === "custom" && !custom.trim())
          }
        >
          {reviewing || direct ? c.saveAdventure : c.reviewAdventure}
        </button>
        {reviewing && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setReviewing(false)}
          >
            {c.editAdventure}
          </button>
        )}
        <button type="button" disabled={disabled} onClick={onCancel}>
          {c.cancel}
        </button>
      </div>
    </form>
  );
}
const emptyReview: AdventureReview = {
  pacing: null,
  agency: null,
  rewards: null,
  payoff: null,
  notes: null,
};
export function ReviewForm({
  language,
  summary: originalSummary,
  review: originalReview,
  closing,
  disabled,
  onSave,
  onCancel,
  onDirty,
}: {
  language: "en" | "ru";
  summary?: string | null;
  review?: AdventureReview | null;
  closing: boolean;
  disabled: boolean;
  onSave: (value: { summary: string | null; review: AdventureReview }) => void;
  onCancel: () => void;
  onDirty: (dirty: boolean) => void;
}) {
  const c = adventureText(language),
    initial = originalReview ?? emptyReview;
  const [summary, setSummary] = useState(originalSummary ?? ""),
    [review, setReview] = useState(initial);
  const fields = {
    pacing: c.pacingReview,
    agency: c.agencyReview,
    rewards: c.rewardsReview,
    payoff: c.payoffReview,
    notes: c.notesReview,
  };
  useEffect(() => {
    onDirty(
      summary !== (originalSummary ?? "") ||
        JSON.stringify(review) !== JSON.stringify(initial),
    );
  }, [summary, review, initial, originalSummary, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  return (
    <form
      className={styles.review}
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled)
          onSave({
            summary: summary.trim() ? summary : null,
            review: parseAdventureReview(review),
          });
      }}
    >
      {closing && <p className={styles.muted}>{c.endHelp}</p>}
      <fieldset disabled={disabled} className={styles.form}>
        {closing && (
          <label className={styles.field}>
            {c.summary}
            <textarea
              maxLength={12000}
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>
        )}
        <h3>{c.review}</h3>
        <p className={styles.muted}>{c.reviewHelp}</p>
        {(Object.keys(fields) as (keyof AdventureReview)[]).map((key) => (
          <label className={styles.field} key={key}>
            {fields[key]}
            <textarea
              rows={2}
              maxLength={2000}
              value={review[key] ?? ""}
              onChange={(e) =>
                setReview({
                  ...review,
                  [key]: e.target.value.trim() ? e.target.value : null,
                })
              }
            />
          </label>
        ))}
      </fieldset>
      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={disabled}>
          {closing ? c.end : c.saveReview}
        </button>
        <button type="button" disabled={disabled} onClick={onCancel}>
          {c.cancel}
        </button>
      </div>
    </form>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { startMinutesFromText } from "../../lib/adventures/wizard-text";
import type {
  BootstrapTransport,
  OpeningReview,
  StartCommand,
} from "../../lib/adventures/bootstrap-contracts";
import { parseOpeningReview } from "../../lib/adventures/bootstrap-validation";
import { bootstrapText, normalizeLines, OpeningReviewFields } from "./review";
import { useBootstrap } from "./use-bootstrap";
import styles from "../adventures/adventures.module.css";
export function OpeningBootstrap({
  campaignId,
  start,
  language,
  persistPending = true,
  transport,
  onDirty,
  onStarted,
  onCancel,
}: {
  campaignId: string;
  start: StartCommand | null;
  language: "en" | "ru";
  persistPending?: boolean;
  transport?: BootstrapTransport;
  onDirty: (v: boolean) => void;
  onStarted: () => Promise<void>;
  onCancel: () => void;
}) {
  const w = useBootstrap(
      `rpg:bootstrap:opening:${campaignId}`,
      persistPending,
      transport,
    ),
    c = bootstrapText(language);
  const draft = w.draft?.kind === "opening" ? w.draft : null,
    review = w.review as OpeningReview | null;
  // Polish group 10: the scene's clock, read from the proposal's words once per draft; the
  // owner's correction is kept per draft and sent next to the review.
  const readMinutes = useMemo(
    () => (draft ? startMinutesFromText(`${draft.proposal.narration ?? ""}\n${draft.proposal.situation ?? ""}`) : null),
    [draft],
  );
  const [chosen, setChosen] = useState<{ draftId: string; minutes: number | null } | null>(null);
  const startMinutes = draft && chosen?.draftId === draft.draftId ? chosen.minutes : readMinutes;
  const dirty = !!start || !!w.pending || !!draft;
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  if (!start && !draft && !w.pending) return null;
  const corrected = review
    ? {
        ...review,
        actors: review.actors.map((a) => ({
          ...a,
          capabilities: normalizeLines(a.capabilities),
          limitations: normalizeLines(a.limitations),
        })),
      }
    : null;
  let allowed = false;
  try {
    if (draft && corrected) {
      parseOpeningReview(corrected, draft.proposal);
      allowed = true;
    }
  } catch {
    /* Required public fields and consequential answers remain unresolved. */
  }
  return (
    <section className={styles.setup}>
      <h2>{c.opening}</h2>
      <p className={styles.intro}>{c.openingHelp}</p>
      {draft && review ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (allowed && corrected)
              void w.execute(
                {
                  action: "opening.commit",
                  input: {
                    requestId: crypto.randomUUID(),
                    campaignId,
                    draftId: draft.draftId,
                    review: corrected,
                    startMinutes,
                  },
                },
                onStarted,
              );
          }}
        >
          <fieldset disabled={w.busy || !!w.pending}>
            <OpeningReviewFields
              value={review}
              onChange={w.setReview}
              language={language}
              questions={draft.proposal.questions}
              startMinutes={startMinutes}
              onStartMinutes={(minutes) => setChosen({ draftId: draft.draftId, minutes })}
            />
          </fieldset>
          <div className={styles.actions}>
            <button
              className={styles.primary}
              disabled={!allowed || w.busy || !!w.pending}
            >
              {c.start}
            </button>
            <button
              type="button"
              disabled={w.busy || !!w.pending}
              onClick={() => {
                w.resetProposal();
                onCancel();
              }}
            >
              {c.cancel}
            </button>
          </div>
        </form>
      ) : !w.pending && start ? (
        <>
          <p className={styles.muted}>{c.cost}</p>
          <div className={styles.actions}>
            <button
              className={styles.primary}
              disabled={!w.ready || w.busy}
              onClick={() =>
                void w.execute(
                  { action: "opening.propose", input: start },
                  onStarted,
                )
              }
            >
              {c.prepare}
            </button>
            <button disabled={w.busy} onClick={onCancel}>
              {c.cancel}
            </button>
          </div>
        </>
      ) : null}
      {w.busy && (
        <p role="status" className={styles.notice}>
          {w.pending?.action === "opening.commit" ? c.starting : c.preparing}
        </p>
      )}
      {w.pending && !w.busy && (
        <div role="status" className={styles.notice}>
          <p>{c.pending}</p>
          <div className={styles.actions}>
            <button
              disabled={w.busy}
              onClick={() => void w.execute(w.pending!, onStarted)}
            >
              {c.recover}
            </button>
            {w.error && w.pending.action === "opening.propose" && (
              <button
                disabled={w.busy}
                onClick={() => {
                  w.resetProposal();
                  onCancel();
                }}
              >
                {c.newProposal}
              </button>
            )}
          </div>
        </div>
      )}
      {w.error && (
        <p role="alert" className={styles.notice}>
          {c.unavailable}
        </p>
      )}
    </section>
  );
}

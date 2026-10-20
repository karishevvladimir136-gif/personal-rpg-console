"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { startMinutesFromText } from "../../lib/adventures/wizard-text";
import type {
  BootstrapTransport,
  OpeningDraft,
  OpeningReview,
  StartCommand,
} from "../../lib/adventures/bootstrap-contracts";
import { initialOpeningReview, parseOpeningReview } from "../../lib/adventures/bootstrap-validation";
import { applyOpeningAnswers } from "../../lib/adventures/opening-answers";
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
  wizard = false,
  autoPropose = false,
  previewDraft,
}: {
  /** A synthetic preview's opening, shown as proposed (nothing is sent). */
  previewDraft?: OpeningDraft | null;
  /** Fix run F (item 21): the wizard's last step — «Играть», plain words. */
  wizard?: boolean;
  /** Propose at once (the owner already pressed the wizard's button). */
  autoPropose?: boolean;
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
      previewDraft ? { draft: previewDraft, review: initialOpeningReview(previewDraft.proposal) } : undefined,
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
  // The wizard's «Предложить первую сцену» is the owner's click: the proposal starts once, without a second button.
  const proposed = useRef(false);
  useEffect(() => {
    if (!autoPropose || proposed.current || !start || draft || w.pending || !w.ready || w.busy) return;
    proposed.current = true;
    void w.execute({ action: "opening.propose", input: start }, onStarted);
  }, [autoPropose, start, draft, w, onStarted]);
  if (!start && !draft && !w.pending) return null;
  // Item 34: the owner's answers reach the opening's people (a name answer renames the person) before play;
  // the server also pins every answer for the DM.
  const corrected = review && draft
    ? applyOpeningAnswers({
        ...review,
        actors: review.actors.map((a) => ({
          ...a,
          capabilities: normalizeLines(a.capabilities),
          limitations: normalizeLines(a.limitations),
        })),
      }, draft.proposal.questions, language)
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
      {!wizard && <h2>{c.opening}</h2>}
      {!wizard && <p className={styles.intro}>{c.openingHelp}</p>}
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
              {wizard ? (language === "ru" ? "Играть" : "Play") : c.start}
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
          <p className={styles.muted}>{wizard ? (language === "ru" ? "Ведущий кампании напишет первую сцену; это платный запрос к модели, обычно меньше минуты." : "The campaign's DM writes the first scene; a paid model request, usually under a minute.") : c.cost}</p>
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
              {wizard ? (language === "ru" ? "Предложить первую сцену" : "Propose the first scene") : c.prepare}
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

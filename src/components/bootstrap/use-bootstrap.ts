"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BootstrapCommand,
  BootstrapDraft,
  BootstrapTransport,
  CreationReview,
  HeroReview,
  OpeningReview,
} from "../../lib/adventures/bootstrap-contracts";
import {
  createBootstrapTransport,
  parseBootstrapDraft,
  restoreBootstrapCommand,
} from "../../lib/adventures/bootstrap-client";
import {
  initialOpeningReview,
  parseCreationReview,
  parseOpeningReview,
} from "../../lib/adventures/bootstrap-validation";
import { heroReviewForCommit, parseHeroReview } from "../../lib/adventures/hero-draft";
import { usePending } from "../adventures/use-pending";
import { wizardCreationReview } from "../../lib/adventures/wizard-text";
export function useBootstrap(
  key: string,
  persist: boolean,
  injected?: BootstrapTransport,
  /** A synthetic preview's draft, shown when nothing is restored (never sent anywhere by itself). */
  initial?: { draft: BootstrapDraft; review: CreationReview | HeroReview | OpeningReview },
) {
  const transport = useMemo(
    () => injected ?? createBootstrapTransport(),
    [injected],
  );
  const restore = useCallback(
    (v: string | null) => restoreBootstrapCommand(v),
    [],
  );
  const { pending, current, mounted, remember, ready } =
    usePending<BootstrapCommand>(`${key}:pending`, restore, persist);
  const [draft, setDraft] = useState<BootstrapDraft | null>(initial?.draft ?? null),
    [review, setReview] = useState<CreationReview | HeroReview | OpeningReview | null>(initial?.review ?? null),
    [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    lock = useRef(false);
  useEffect(() => {
    Promise.resolve().then(() => {
      if (!mounted.current) return;
      try {
        const raw = persist ? sessionStorage.getItem(`${key}:draft`) : null;
        if (raw) {
          const saved = JSON.parse(raw),
            d = parseBootstrapDraft(saved.draft);
          setDraft(d);
          try {
            setReview(
              d.kind === "creation"
                ? d.proposal.schemaVersion === 3
                  ? parseHeroReview(heroReviewForCommit(saved.review))
                  : parseCreationReview(saved.review)
                : parseOpeningReview(saved.review),
            );
          } catch {
            setReview(
              d.kind === "creation"
                ? wizardCreationReview(d.input, d.proposal)
                : initialOpeningReview(d.proposal),
            );
          }
        }
      } catch {
        /* Invalid local cache has no authority. */
      }
      setRestored(true);
    });
  }, [key, persist, mounted]);
  useEffect(() => {
    if (!restored || !persist) return;
    try {
      if (draft)
        sessionStorage.setItem(
          `${key}:draft`,
          JSON.stringify({ draft, review }),
        );
      else sessionStorage.removeItem(`${key}:draft`);
    } catch {
      /* The authoritative immutable proposal remains on the server. */
    }
  }, [key, persist, restored, draft, review]);
  const execute = async (
    command: BootstrapCommand,
    onCommitted: (result: unknown) => Promise<void>,
  ) => {
    if (lock.current || !ready || !restored) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    const attempt = current.current ?? command;
    remember(attempt);
    try {
      if (
        attempt.action === "creation.propose" ||
        attempt.action === "opening.propose"
      ) {
        const next =
          attempt.action === "creation.propose"
            ? await transport.proposeCharacter(attempt.input)
            : await transport.proposeOpening(attempt.input);
        if (!mounted.current) return;
        setDraft(next);
        setReview(
          next.kind === "creation"
            ? wizardCreationReview(next.input, next.proposal)
            : initialOpeningReview(next.proposal),
        );
        remember(null);
      } else {
        const result =
          attempt.action === "creation.commit"
            ? await transport.createCharacter(attempt.input)
            : await transport.startOpening(attempt.input);
        if (!mounted.current) return;
        remember(null);
        setDraft(null);
        setReview(null);
        await onCommitted(result);
      }
    } catch {
      if (mounted.current) setError(true);
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return {
    pending,
    draft,
    review,
    setReview,
    busy,
    error,
    ready: ready && restored,
    execute,
    resetProposal: () => {
      if (!busy && (!pending || pending.action.endsWith(".propose"))) {
        remember(null);
        setDraft(null);
        setReview(null);
        setError(false);
      }
    },
  };
}

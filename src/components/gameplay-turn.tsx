"use client";

import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Badge, Button, Panel } from "./ui";
import { GameplayCheck } from "./gameplay-dice";
import { DmTeachReview } from "./dm-teach-review";
import { errorMessage, readJson } from "@/lib/persistence/client";
import type { TeachCommand } from "@/lib/dm-craft/contracts";
import type {
  GuidanceApprovalInput,
  PublicTurn,
  ResumeInput,
} from "@/lib/gameplay/contracts";
import {
  approveGuidance,
  GameplayClientError,
  gameplayErrorMessage,
} from "@/lib/gameplay/client";
import { sameTimeline, timelineKey } from "@/lib/saves/client-state";
import { SubjectAvatar } from "./visual-frame/subject-avatar";

export function GameplayGuidanceProposal({
  turn,
  onSaved,
}: {
  turn: PublicTurn;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const { campaignId, data, refresh } = useCampaignData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewScope, setReviewScope] = useState<
    "campaign_style" | "global_craft" | null
  >(null);
  const guard = useRef(false);
  const attempt = useRef<GuidanceApprovalInput | null>(null);
  const rejectAttempt = useRef<TeachCommand | null>(null);
  const proposal = turn.proposal;
  if (!proposal) return null;
  const session = data?.sessions.find(
    (row) =>
      row.id === data.publicState.current_session_id &&
      row.id === turn.session_id &&
      row.status === "open",
  );
  const approve = async (scope: "session" | "campaign") => {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    setError("");
    const key = `rpg-guidance-approval:${campaignId}:${timelineKey(turn.timeline)}:${proposal.id}`;
    try {
      if (!attempt.current) {
        try {
          const stored = JSON.parse(
            window.sessionStorage.getItem(key) || "null",
          ) as GuidanceApprovalInput | null;
          if (
            stored?.campaignId === campaignId &&
            sameTimeline(stored.timeline, turn.timeline) &&
            stored.proposalId === proposal.id
          )
            attempt.current = stored;
        } catch {
          /* In-memory retry still retains identity. */
        }
      }
      attempt.current ??= {
        timeline: turn.timeline,
        requestId: crypto.randomUUID(),
        campaignId,
        operationId: turn.id,
        proposalId: proposal.id,
        scope,
        sessionId: scope === "session" ? (session?.id ?? null) : null,
        expectedGuideRevision: proposal.documentRevision,
      };
      try {
        window.sessionStorage.setItem(key, JSON.stringify(attempt.current));
      } catch {
        /* Server also deduplicates proposal approval. */
      }
      await approveGuidance(attempt.current);
      attempt.current = null;
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* No gameplay authority in local storage. */
      }
      await onSaved();
    } catch (cause) {
      setError(
        cause instanceof GameplayClientError && cause.code === "conflict"
          ? "The DM Guide changed after this proposal. Request a new proposal based on the current guide; your saved guidance is unchanged."
          : gameplayErrorMessage(cause),
      );
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  const reject = async () => {
    const timeline = turn.timeline ?? data?.timeline;
    if (guard.current || !data || !timeline) return;
    guard.current = true;
    setBusy(true);
    setError("");
    try {
      rejectAttempt.current ??= {
        action: "reject",
        requestId: crypto.randomUUID(),
        campaignId,
        timeline,
        operationId: turn.id,
        proposalId: proposal.id,
      };
      await readJson(
        `/api/campaigns/${encodeURIComponent(campaignId)}/dm-teach`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rejectAttempt.current),
        },
      );
      rejectAttempt.current = null;
      await Promise.allSettled([refresh(), onSaved()]);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  return (
    <aside className="gameplay-guidance">
      <h4>{t("Proposed DM guidance")}</h4>
      <p className="prose">{proposal.text}</p>
      <p className="muted">
        {t(
          "Guidance affects future narration only. It cannot override rules, player agency, canon or secrecy.",
        )}
      </p>
      {proposal.scope === "campaign_style" ||
      proposal.scope === "global_craft" ? (
        <DmTeachReview
          turn={turn}
          onSaved={onSaved}
          reviewScope={proposal.scope}
        />
      ) : proposal.status === "rejected" ? (
        <Badge>{t("Rejected")}</Badge>
      ) : proposal.status === "approved" ? (
        <Badge green>
          {t(
            proposal.scope === "session"
              ? "Approved for this session"
              : "Saved in the campaign DM Guide",
          )}
        </Badge>
      ) : (
        <>
          <p>
            {t(
              "This proposal has not been applied. Choose its scope explicitly.",
            )}
          </p>
          <div className="button-group">
            <Button
              disabled={busy || !session || !!reviewScope}
              onClick={() => void approve("session")}
            >
              {t("This session")}
            </Button>
            <Button
              primary
              disabled={busy || !!reviewScope}
              onClick={() => void approve("campaign")}
            >
              {t("Save for this campaign")}
            </Button>
          </div>
          <div className="button-group">
            <Button
              disabled={busy || !data || !(turn.timeline ?? data.timeline)}
              onClick={() => void reject()}
            >
              {t("Reject proposal")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => setReviewScope("campaign_style")}
            >
              {t("Review campaign DM Style")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => setReviewScope("global_craft")}
            >
              {t("Review global DM Craft")}
            </Button>
          </div>
          {reviewScope && (
            <DmTeachReview
              key={reviewScope}
              turn={turn}
              onSaved={onSaved}
              reviewScope={reviewScope}
            />
          )}
          {!session && (
            <p className="muted">
              {t(
                "Session guidance requires the same open session as this proposal.",
              )}
            </p>
          )}
        </>
      )}
      {error && <p role="alert">{t(error)}</p>}
      {busy && <p role="status">{t("Saving guidance…")}</p>}
    </aside>
  );
}
export function GameplayTurn({
  turn,
  busy,
  onCommand,
  onSaved,
}: {
  turn: PublicTurn;
  busy: boolean;
  onCommand: (action: ResumeInput["action"], checkId?: string | null) => void;
  onSaved: () => Promise<void>;
}) {
  const { t, language } = useLanguage();
  const { data } = useCampaignData();
  const speaker = turn.companionId
    ? data?.entities.find((row) => row.id === turn.companionId)
    : turn.mode === "game"
      ? data?.entities.filter((row) => row.kind === "player").length === 1
        ? data.entities.find((row) => row.kind === "player")
        : undefined
      : undefined;
  const thinking = turn.status === "pending" || turn.status === "generating";
  const interrupted =
    turn.status === "failed" &&
    turn.canRetry &&
    (turn.failure === "provider" || turn.failure === "unavailable");
  const failureMessage = interrupted
    ? "The DM connection was interrupted. Try again."
    : turn.failure === "configuration"
      ? "The DM needs setup before play can continue."
      : turn.failure === "context" || turn.failure === "validation"
        ? "The DM needs more context for this action."
        : turn.failure === "conflict"
          ? "The world changed while this action was underway. Review the latest scene."
          : "The DM could not finish this action.";
  return (
    <Panel className="gameplay-turn">
      <article className="gameplay-owner-input">
        {speaker && data && (
          <SubjectAvatar
            snapshot={data}
            entity={speaker}
            className="gameplay-speaker-portrait"
          />
        )}
        <div className="gameplay-owner-words">
        <span className="eyebrow">
          {speaker?.name || t(turn.mode === "feedback" ? "Owner feedback" : "Your action")}
        </span>
        <p className="prose">{turn.input}</p>
        <time dateTime={turn.created_at}>
          {new Date(turn.created_at).toLocaleString(language)}
        </time>
        </div>
      </article>
      {thinking && (
        <p role="status" className="muted">
          {t("DM is thinking…")}
        </p>
      )}
      {turn.status === "failed" && (
        <p role="alert">{t(failureMessage)}</p>
      )}
      {turn.checks.map((check) => (
        <div key={check.id}>
          <GameplayCheck check={check} />
          {turn.status === "awaiting_confirmation" && check.canReroll && (
            <Button
              disabled={busy}
              onClick={() => onCommand("reroll", check.id)}
            >
              {t("Request an allowed reroll")}
            </Button>
          )}
        </div>
      ))}
      {turn.narration !== null && (
        <article className="gameplay-narration">
          <span className="eyebrow">
            {t(turn.mode === "mechanic" ? "Mechanical result" : "DM")}
          </span>
          <div className="prose">{turn.narration}</div>
        </article>
      )}
      {turn.proposal && (
        <GameplayGuidanceProposal turn={turn} onSaved={onSaved} />
      )}
      <div className="button-group">
        {turn.status === "awaiting_confirmation" && (
          <Button primary disabled={busy} onClick={() => onCommand("continue")}>
            {t("Continue with this result")}
          </Button>
        )}
        {turn.canRetry && (
          <Button primary disabled={busy} onClick={() => onCommand("retry")}>
            {t("Try again")}
          </Button>
        )}
      </div>
      {turn.canCancel && (
        <details className="gameplay-turn-options">
          <summary>{t("More options")}</summary>
          <Button disabled={busy} onClick={() => onCommand("cancel")}>
            {t("Abandon this action")}
          </Button>
        </details>
      )}
    </Panel>
  );
}

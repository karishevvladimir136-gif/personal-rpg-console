"use client";

import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Badge, Button, Panel } from "./ui";
import { GameplayCheck } from "./gameplay-dice";
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
import {
  turnFailureLabels,
  turnStatusLabels,
} from "@/lib/gameplay/client-state";

export function GameplayGuidanceProposal({
  turn,
  onSaved,
}: {
  turn: PublicTurn;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const { campaignId, data } = useCampaignData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const guard = useRef(false);
  const attempt = useRef<GuidanceApprovalInput | null>(null);
  const proposal = turn.proposal;
  if (!proposal) return null;
  const session = data?.sessions.find(
    (row) =>
      row.id === data.publicState.current_session_id && row.status === "open",
  );
  const approve = async (scope: "session" | "campaign") => {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    setError("");
    const key = `rpg-guidance-approval:${campaignId}:${proposal.id}`;
    try {
      if (!attempt.current) {
        try {
          const stored = JSON.parse(
            window.sessionStorage.getItem(key) || "null",
          ) as GuidanceApprovalInput | null;
          if (
            stored?.campaignId === campaignId &&
            stored.proposalId === proposal.id
          )
            attempt.current = stored;
        } catch {
          /* In-memory retry still retains identity. */
        }
      }
      attempt.current ??= {
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
  return (
    <aside className="gameplay-guidance">
      <h4>{t("Proposed DM guidance")}</h4>
      <p className="prose">{proposal.text}</p>
      <p className="muted">
        {t(
          "Guidance affects future narration only. It cannot override rules, player agency, canon or secrecy.",
        )}
      </p>
      {proposal.status === "approved" ? (
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
              disabled={busy || !session}
              onClick={() => void approve("session")}
            >
              {t("This session")}
            </Button>
            <Button
              primary
              disabled={busy}
              onClick={() => void approve("campaign")}
            >
              {t("Save for this campaign")}
            </Button>
          </div>
          {!session && (
            <p className="muted">
              {t("Session guidance requires an open resume session.")}
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
  return (
    <Panel className="gameplay-turn">
      <article className="gameplay-owner-input">
        <span className="eyebrow">
          {t(turn.mode === "feedback" ? "Owner feedback" : "Your action")}
        </span>
        <p className="prose">{turn.input}</p>
        <time dateTime={turn.created_at}>
          {new Date(turn.created_at).toLocaleString(language)}
        </time>
      </article>
      <p role="status" className="muted">
        {t(turnStatusLabels[turn.status])}
      </p>
      {turn.failure && <p role="alert">{t(turnFailureLabels[turn.failure])}</p>}
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
          <span className="eyebrow">{t("DM")}</span>
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
            {t("Resume this turn")}
          </Button>
        )}
        {turn.canCancel && (
          <Button disabled={busy} onClick={() => onCommand("cancel")}>
            {t("Cancel unfinished turn")}
          </Button>
        )}
      </div>
    </Panel>
  );
}

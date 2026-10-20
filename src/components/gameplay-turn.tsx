"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Badge, Button, Panel } from "./ui";
import { TurnTimeline } from "./registry/turn-timeline";
import { TurnFrame } from "./registry/live-frames";
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
import type { LiveTrace } from "@/lib/ui/turn-timeline";
import { SubjectAvatar } from "./visual-frame/subject-avatar";
import { Art, useSubjectImage } from "./registry/primitives";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";

/** The speaker's portrait: the accepted picture through the screen's image resolver
 * (with the initial-letter fallback when it fails to load), else the snapshot's own. */
function SpeakerPortrait({ snapshot, entity }: { snapshot: CampaignSnapshot; entity: Entity }) {
  const image = useSubjectImage({ kind: "entity", id: entity.id });
  if (image.url)
    return (
      <span className="gameplay-speaker-portrait" aria-hidden="true">
        <Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 25%" />
      </span>
    );
  return <SubjectAvatar snapshot={snapshot} entity={entity} className="gameplay-speaker-portrait" />;
}

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
  recording = false,
  onCommand,
  onSaved,
  onResend,
  live = null,
  running = false,
  companionRolls = "dm",
}: {
  turn: PublicTurn;
  busy: boolean;
  /** Polish 3 §2: the writer's text is complete and the bookkeeper records (a quiet state until the commit). */
  recording?: boolean;
  onCommand: (action: ResumeInput["action"], checkId?: string | null) => void;
  onSaved: () => Promise<void>;
  /** Fix run A1 (items 58, 73): the latest failed move that cannot be retried — send the same text again. */
  onResend?: () => void;
  /** Stage C (items 53, 63): this turn's stream with the order of its events, while and after this page saw it told. */
  live?: LiveTrace | null;
  /** The player's «Дальше» or reroll for this turn is running. */
  running?: boolean;
  /** The DM option «Броски спутников» (item 44): chips by the DM, or cards for the player. */
  companionRolls?: "dm" | "player";
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
  const heroId = data?.entities.find((row) => row.kind === "player")?.id ?? null;
  const party = data?.entities.filter((row) => row.kind === "companion").map((row) => row.name) ?? [];
  // The server pauses for the player's roll when the dice are interactive or rerolls are allowed (and rolls are shown).
  const dice = data?.settings?.values;
  const rollsWait = !!dice && dice.dicePresentation !== "hidden" && (dice.interactiveDice || dice.difficulty?.rerolls !== "disabled");
  const thinking = turn.status === "pending" || turn.status === "generating";
  // Polish group 6: one quiet indicator while the DM thinks; the cancel options come back
  // only when a turn has been thinking for a long while (or is no longer thinking).
  const [stuckTurn, setStuckTurn] = useState<string | null>(null);
  useEffect(() => {
    if (!thinking) return;
    const timer = window.setTimeout(() => setStuckTurn(turn.id), 45_000);
    return () => window.clearTimeout(timer);
  }, [thinking, turn.id]);
  const optionsVisible = turn.canCancel && (!thinking || stuckTurn === turn.id);
  const interrupted =
    turn.status === "failed" &&
    turn.canRetry &&
    (turn.failure === "provider" || turn.failure === "unavailable");
  // Fix run A1 (items 58, 73 follow-up): a failed move says plainly that nothing changed in the game
  // (the owner believed a failed long rest had happened) and what to do: continue or send it again.
  const failureMessage = interrupted
    ? "The DM connection was interrupted — nothing changed in the game yet. «Try again» continues this same move from where it stopped."
    : turn.failure === "configuration"
      ? "The DM needs setup before play can continue."
      : turn.canRetry
        ? "The DM could not finish this move, so nothing changed in the game. «Try again» runs the same move again."
        : turn.failure === "conflict"
          ? "While the move was running the campaign's records changed, so it was not saved and nothing changed in the game. Your text is back in the box — send it again."
          : "The DM could not finish this move, so nothing changed in the game. Your text is back in the box — send it again or change it.";
  return (
    <Panel className="gameplay-turn">
      <article className="gameplay-owner-input">
        {speaker && data && <SpeakerPortrait snapshot={data} entity={speaker} />}
        <div className="gameplay-owner-words">
        <span className="eyebrow">
          {speaker?.name || t(turn.mode === "feedback" ? "Owner feedback" : "Your action")}
        </span>
        <p className="prose">{turn.input}</p>
        {turn.created_at && (
          <time dateTime={turn.created_at}>
            {new Date(turn.created_at).toLocaleString(language)}
          </time>
        )}
        </div>
      </article>
      {turn.status === "failed" && (
        <p role="alert">{t(failureMessage)}</p>
      )}
      {/* Stage C: the told text, each roll in its place, the continuation and the named pause — one timeline. */}
      <TurnTimeline
        turn={turn}
        trace={live}
        label={t(turn.mode === "mechanic" ? "Mechanical result" : "DM")}
        heroId={heroId}
        party={party}
        companionRolls={companionRolls}
        rollsWait={rollsWait}
        running={running}
        recording={recording}
        busy={busy}
        onCommand={onCommand}
        continueAction={
          <Button primary disabled={busy} onClick={() => onCommand("continue")}>
            {t("Onward")}
          </Button>
        }
      />
      {/* Fix run E (item 77): the frame of this turn, in this turn (none outside a picture board or for an out-of-game reply). */}
      {turn.mode === "game" && <TurnFrame turn={turn} />}
      {turn.proposal && (
        <GameplayGuidanceProposal turn={turn} onSaved={onSaved} />
      )}
      <div className="button-group">
        {turn.canRetry && (
          <Button primary disabled={busy} onClick={() => onCommand("retry")}>
            {t("Try again")}
          </Button>
        )}
        {turn.status === "failed" && !turn.canRetry && onResend && turn.failure !== "configuration" && (
          <Button primary disabled={busy} onClick={onResend}>
            {t("Send this move again")}
          </Button>
        )}
      </div>
      {optionsVisible && (
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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Panel } from "./ui";
import { notifyGameplayChanged } from "./gameplay-runtime";
import { GameplayComposer } from "./gameplay-composer";
import { useSessionMemory } from "./session-memory-runtime";
import {
  continueSession,
  endSession,
  MemoryClientError,
  memoryErrorMessage,
  retryMemory,
} from "@/lib/memory/client";
import {
  hasPendingSessionTurn,
  loadMemoryAttempt,
  memoryAttemptConfirmed,
  prepareMemoryAttempt,
  recapStatusLabels,
  saveMemoryAttempt,
  type MemoryAttempt,
  sessionBoundaryView,
} from "@/lib/memory/client-state";
import type {
  MemorySnapshot,
  PublicSessionMemory,
} from "@/lib/memory/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";

function localStorageForSession() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function PublicResume({ boundary }: { boundary: PublicSessionMemory }) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const resume = boundary.resume;
  if (boundary.checkpointStatus !== "ready")
    return (
      <p role="status">
        {t(
          "The resume point needs to be refreshed after a campaign change. Saved gameplay is preserved.",
        )}
      </p>
    );
  const scene = data?.scenes.find((row) => row.id === resume.sceneId);
  const location = data?.locations.find((row) => row.id === resume.locationId);
  const participants = data?.entities.filter((row) =>
    resume.participantIds.includes(row.id),
  );
  return (
    <details
      className="session-resume-details"
      open={boundary.state !== "continued"}
    >
      <summary>{t("Saved resume point")}</summary>
      <dl className="session-resume-facts">
        {scene && (
          <>
            <dt>{t("Scene")}</dt>
            <dd>{scene.title}</dd>
          </>
        )}
        {location && (
          <>
            <dt>{t("Location")}</dt>
            <dd>{location.name}</dd>
          </>
        )}
        <dt>{t("In-world time")}</dt>
        <dd>{t("{minutes} minutes", { minutes: resume.worldMinutes })}</dd>
        {!!participants?.length && (
          <>
            <dt>{t("Participants")}</dt>
            <dd>{participants.map((row) => row.name).join(", ")}</dd>
          </>
        )}
      </dl>
      {resume.situation && <p className="prose">{resume.situation}</p>}
      {resume.lastAction && (
        <div>
          <h3>{t("Last saved action")}</h3>
          <p className="prose">{resume.lastAction}</p>
        </div>
      )}
      {resume.lastOutcome && (
        <div>
          <h3>{t("Last saved outcome")}</h3>
          <p className="prose">{resume.lastOutcome}</p>
        </div>
      )}
      {resume.expectedInput && (
        <div>
          <h3>{t("Waiting for your choice")}</h3>
          <p className="prose">{t(resume.expectedInput)}</p>
        </div>
      )}
      {hasPendingSessionTurn(boundary) && (
        <p className="session-saved-note">
          {t(
            "An unfinished action is saved here. Its recorded results stay the same when you continue.",
          )}
        </p>
      )}
    </details>
  );
}

export function SessionMemoryPanel({
  sessionId,
}: {
  sessionId: string | null;
}) {
  const { t, language } = useLanguage();
  const { campaignId, data, refresh: refreshRecords } = useCampaignData();
  const memory = useSessionMemory();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<MemoryAttempt | null>(null);
  const current = useRef<MemoryAttempt | null>(null);
  const guard = useRef(false);
  const { snapshot, refresh } = memory;
  const boundary =
    (snapshot?.currentBoundary?.sessionId === sessionId
      ? snapshot.currentBoundary
      : null) ?? snapshot?.sessions.find((row) => row.sessionId === sessionId);
  const active = snapshot?.currentBoundary;
  const isCurrent = !!boundary && active?.id === boundary.id;
  const session = data?.sessions.find((row) => row.id === sessionId);
  const boundaryView = boundary ? sessionBoundaryView(boundary) : null;
  const writeAttempt = (next: MemoryAttempt | null) => {
    current.current = next;
    setAttempt(next);
    setStored(saveMemoryAttempt(localStorageForSession(), campaignId, next));
  };
  useUnsavedChanges(!stored && !!attempt);
  useEffect(() => {
    let live = true;
    queueMicrotask(() => {
      if (!live) return;
      const recovered = loadMemoryAttempt(localStorageForSession(), campaignId);
      current.current = recovered;
      setAttempt(recovered);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [campaignId]);
  useEffect(() => {
    if (!snapshot || !attempt || !memoryAttemptConfirmed(attempt, snapshot))
      return;
    current.current = null;
    saveMemoryAttempt(localStorageForSession(), campaignId, null);
    queueMicrotask(() => setAttempt(null));
  }, [attempt, snapshot, campaignId]);
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      void refresh().catch(() => {});
    }, 1500);
    return () => clearInterval(timer);
  }, [busy, refresh]);
  const recordsChanged = async () => {
    notifyGameplayChanged(campaignId);
    await refreshRecords().catch(() => {});
  };
  const run = async (command: MemoryAttempt) => {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    setError("");
    writeAttempt(command);
    try {
      let result: MemorySnapshot;
      if (command.kind === "end") result = await endSession(command.input);
      else if (command.kind === "continue")
        result = await continueSession(command.input);
      else result = await retryMemory(command.input);
      memory.accept(result);
      writeAttempt(null);
      await recordsChanged();
      if (command.kind === "continue")
        router.push(`/campaigns/${campaignId}/game`);
    } catch (cause) {
      setError(memoryErrorMessage(cause));
      // A GET may prove END/Continue committed despite a lost response.
      const latest = await refresh().catch(() => null);
      if (latest && memoryAttemptConfirmed(command, latest)) {
        writeAttempt(null);
        await recordsChanged();
      } else if (
        cause instanceof MemoryClientError &&
        ["conflict", "validation", "not_found"].includes(cause.code)
      ) {
        writeAttempt(null);
      }
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  const end = () => {
    if (!snapshot || !sessionId) return;
    void run(
      prepareMemoryAttempt(current.current, {
        kind: "end",
        input: {
          campaignId,
          sessionId,
          expectedRevision: snapshot.runtimeRevision,
        },
      }),
    );
  };
  const next = () => {
    if (!snapshot || !boundary || boundary.state === "continued") return;
    void run(
      prepareMemoryAttempt(current.current, {
        kind: "continue",
        fromState: boundary.state,
        input: {
          campaignId,
          boundaryId: boundary.id,
          expectedRevision: snapshot.runtimeRevision,
        },
      }),
    );
  };
  const retry = () => {
    if (!boundary) return;
    void run(
      prepareMemoryAttempt(current.current, {
        kind: "retry",
        input: { campaignId, boundaryId: boundary.id },
      }),
    );
  };
  const disabled = busy || !ready || !!attempt || !!memory.error;
  return (
    <Panel
      className="session-memory"
      title={t(boundary ? "Session saved" : "Session continuity")}
    >
      {memory.loading && <p role="status">{t("Loading saved session…")}</p>}
      {memory.error && (
        <div role="alert">
          <p>{t(memory.error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </div>
      )}
      {snapshot && boundary ? (
        <>
          <div className="session-memory-heading">
            <Badge green>
              {t(boundary.state === "continued" ? "Continued" : "Saved")}
            </Badge>
            <time dateTime={boundary.endedAt}>
              {new Date(boundary.endedAt).toLocaleString(language)}
            </time>
          </div>
          <p className="session-saved-note">
            {t(
              "Your place in the story is saved. Ending a session does not advance time or resolve an action.",
            )}
          </p>
          {!memory.error && (
            <>
              <p role="status">{t(recapStatusLabels[boundary.recap.status])}</p>
              {boundaryView?.recapText && (
                <article className="session-public-recap">
                  <h3>{t("Public recap")}</h3>
                  <div className="prose">{boundaryView.recapText}</div>
                </article>
              )}
              <PublicResume boundary={boundary} />
            </>
          )}
          <div className="button-group">
            {isCurrent && boundary.state !== "continued" && (
              <Button
                primary
                disabled={disabled || !boundaryView?.canContinue}
                onClick={next}
              >
                <Icon name="ArrowRight" />
                {t(
                  boundary.state === "resuming"
                    ? "Continue to next session"
                    : "Continue from saved point",
                )}
              </Button>
            )}
            {(boundary.recap.canRetry ||
              boundary.checkpointStatus === "rebuild_required") && (
              <Button
                disabled={disabled || boundary.recap.status === "generating"}
                onClick={retry}
              >
                {t(
                  boundary.checkpointStatus === "rebuild_required"
                    ? "Refresh saved session"
                    : boundary.recap.status === "pending"
                      ? "Continue preparing recap"
                      : "Retry recap",
                )}
              </Button>
            )}
          </div>
          {isCurrent &&
            boundary.state === "resuming" &&
            hasPendingSessionTurn(boundary) && (
              <p>
                {t(
                  "Finish or cancel the saved action, then choose Continue to next session.",
                )}{" "}
                <Link
                  className="text-link"
                  href={`/campaigns/${campaignId}/game#saved-turn-${boundary.resume.pendingOperationId}`}
                >
                  {t("Review saved action")}
                </Link>
              </p>
            )}
          {isCurrent &&
            boundary.state === "resuming" &&
            !hasPendingSessionTurn(boundary) && (
              <p>
                {t(
                  "The saved action has finished. You can now begin the next session.",
                )}
              </p>
            )}
        </>
      ) : snapshot &&
        session?.status === "open" &&
        sessionId === data?.publicState.current_session_id &&
        (!active || active.state === "continued") ? (
        <>
          <p>
            {t(
              "Save this point in the story and prepare a public recap. Any unfinished action will wait for you.",
            )}
          </p>
          <Button primary disabled={disabled} onClick={end}>
            <Icon name="Bookmark" />
            {t("END SESSION")}
          </Button>
        </>
      ) : (
        snapshot && (
          <p>
            {t(
              "Open the current Game session to continue from its saved point.",
            )}
          </p>
        )
      )}
      {attempt && (
        <div className="session-request-recovery" role="status">
          <p>
            {t(
              "A session request is awaiting confirmation. Retrying keeps the same saved request.",
            )}
          </p>
          <div className="button-group">
            <Button disabled={busy} onClick={() => void run(attempt)}>
              {t("Retry saved session request")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => void refresh().catch(() => {})}
            >
              {t("Check saved session")}
            </Button>
          </div>
        </div>
      )}
      {!stored && attempt && (
        <p role="alert">
          {t(
            "Local request storage is unavailable. Keep this page open until the session request is confirmed.",
          )}
        </p>
      )}
      {busy && <p role="status">{t("Saving session request…")}</p>}
      {error && <p role="alert">{t(error)}</p>}
    </Panel>
  );
}

// A companion's preserved operation must also be reachable from Game after reconnect.
export function SessionPendingCompanion({
  play,
  onSaved,
}: {
  play: PlaySnapshot;
  onSaved: () => Promise<void>;
}) {
  const memory = useSessionMemory();
  const { t } = useLanguage();
  const boundary = memory.snapshot?.currentBoundary;
  const turn = play.turns.find(
    (row) => row.id === boundary?.resume.pendingOperationId,
  );
  if (boundary?.state !== "resuming" || turn?.mode !== "companion") return null;
  return (
    <Panel className="session-memory" title={t("Saved companion action")}>
      <GameplayComposer
        play={play}
        mode="companion"
        companionId={turn.companionId}
        onSaved={onSaved}
        compact
        historyOnly
      />
    </Panel>
  );
}

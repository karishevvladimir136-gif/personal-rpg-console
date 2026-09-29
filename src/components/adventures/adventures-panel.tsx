"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CampaignSnapshot } from "../../lib/persistence/contracts";
import type {
  AdventureCatalog,
  AdventureCommand,
  PublicAdventure,
  WorldCatalog,
} from "../../lib/adventures/contracts";
import {
  AdventureClientError,
  adventurePendingKey,
  bindWorldAttempt,
  createAdventureTransport,
  prepareAdventureAttempt,
  restoreAdventureAttempt,
  versionAdventureAttempt,
  type AdventureTransport,
} from "../../lib/adventures/client";
import { parseAdventureCatalog } from "../../lib/adventures/validation";
import { sameTimeline } from "../../lib/saves/fence";
import { adventureText } from "./text";
import { SetupForm, ReviewForm, pacingLabel } from "./forms";
import { WorldPicker } from "./worlds";
import { usePending } from "./use-pending";
import styles from "./adventures.module.css";

type Draft =
  | { kind: "prepare"; basis: AdventureCatalog }
  | {
      kind: "edit" | "end" | "review" | "abandon";
      basis: AdventureCatalog;
      adventure: PublicAdventure;
    };
export function sameAdventureBasis(a: AdventureCatalog, b: AdventureCatalog) {
  return (
    sameTimeline(a.timeline, b.timeline) &&
    a.revision === b.revision &&
    a.runtimeRevision === b.runtimeRevision &&
    a.expectedHeadId === b.expectedHeadId
  );
}
export function AdventuresPanel({
  snapshot,
  language,
  onDirty,
  onSaved,
  onStarted,
  initialCatalog,
  initialWorlds,
  persistPending = true,
  reviewLinks,
  transport: injected,
}: {
  snapshot: CampaignSnapshot;
  language: "en" | "ru";
  onDirty: (dirty: boolean) => void;
  onSaved: () => Promise<void>;
  onStarted?: () => void;
  initialCatalog?: AdventureCatalog;
  initialWorlds?: WorldCatalog;
  persistPending?: boolean;
  reviewLinks?: { newHero: string; game: string };
  transport?: AdventureTransport;
}) {
  const c = adventureText(language),
    campaignId = snapshot.campaign.id;
  const transport = useMemo(
    () => injected ?? createAdventureTransport(),
    [injected],
  );
  const [catalog, setCatalog] = useState<AdventureCatalog | null>(() =>
    initialCatalog ? parseAdventureCatalog(initialCatalog, campaignId) : null,
  );
  const [loading, setLoading] = useState(!initialCatalog),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null),
    [formDirty, setFormDirty] = useState(false),
    [worldDirty, setWorldDirty] = useState(false);
  const [worlds, setWorlds] = useState<WorldCatalog | null>(
      initialWorlds ?? null,
    ),
    [worldId, setWorldId] = useState(""),
    [worldBusy, setWorldBusy] = useState(false);
  const restore = useCallback(
    (value: string | null) => restoreAdventureAttempt(value, campaignId),
    [campaignId],
  );
  const { pending, current, mounted, remember, ready } =
    usePending<AdventureCommand>(
      adventurePendingKey(campaignId),
      restore,
      persistPending,
    );
  const lock = useRef(false);
  const timeline = snapshot.timeline;
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!timeline) {
        setError("conflict");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const next = await transport.read(campaignId, timeline, signal);
        if (!signal?.aborted) setCatalog(next);
      } catch (cause) {
        if (!signal?.aborted)
          setError(
            cause instanceof AdventureClientError ? cause.code : "unavailable",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [campaignId, timeline, transport],
  );
  useEffect(() => {
    if (initialCatalog && sameTimeline(initialCatalog.timeline, timeline))
      return;
    const abort = new AbortController();
    Promise.resolve().then(() => {
      if (!abort.signal.aborted) void load(abort.signal);
    });
    return () => abort.abort();
  }, [load, initialCatalog, timeline, snapshot]);
  useEffect(() => {
    onDirty(formDirty || worldDirty || pending !== null);
  }, [formDirty, worldDirty, pending, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const wrongTimeline = !catalog || !sameTimeline(catalog.timeline, timeline);
  const frozen = !ready || loading || busy || pending !== null || wrongTimeline;
  const staleDraft =
    !!draft && (!catalog || !sameAdventureBasis(draft.basis, catalog));
  const canWrite = !!catalog?.canChange && !frozen && !worldBusy;
  const send = async (command: AdventureCommand) => {
    if (lock.current || !ready) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const attempt = current.current ?? command;
    remember(attempt);
    try {
      const result = await transport.send(attempt);
      if (!mounted.current) return;
      remember(null);
      setCatalog(result.snapshot);
      setDraft(null);
      setFormDirty(false);
      setWorldDirty(false);
      // A campaign refresh is a read after confirmed success, never a second write.
      try {
        await onSaved();
      } catch {
        if (mounted.current) setError("unavailable");
      }
      if (
        mounted.current &&
        attempt.action === "start" &&
        result.snapshot.activeAdventureId === attempt.input.adventureId
      ) {
        onDirty(false);
        onStarted?.();
      }
    } catch (cause) {
      if (mounted.current) {
        const code =
          cause instanceof AdventureClientError ? cause.code : "uncertain";
        setError(code);
        if (code !== "uncertain") remember(null);
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const attempt = (build: () => AdventureCommand) => {
    try {
      void send(build());
    } catch {
      setError("validation");
    }
  };
  const cancelDraft = () => {
    setDraft(null);
    setFormDirty(false);
    setError("");
  };
  const status = (a: PublicAdventure) =>
    a.status === "prepared"
      ? c.planned
      : a.status === "active"
        ? c.active
        : a.status === "completed"
          ? c.completed
          : c.abandoned;
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <div>
          <h1>{c.title}</h1>
          <p className={styles.intro}>{c.intro}</p>
        </div>
        <Link href={reviewLinks?.newHero ?? "/campaigns"}>{c.newCampaign}</Link>
      </div>
      <p>
        {c.existing} · {snapshot.campaign.title}
      </p>
      <p className={styles.muted}>{c.existingHelp}</p>
      {loading && <p role="status">{c.loading}</p>}
      {(pending || error || wrongTimeline) && (
        <div className={styles.notice} role="status">
          <p>
            {pending
              ? c.pending
              : error === "conflict" || wrongTimeline
                ? c.conflict
                : error === "validation"
                  ? c.validation
                  : c.unavailable}
          </p>
          <div className={styles.actions}>
            {pending ? (
              <button
                disabled={busy || !ready}
                onClick={() => void send(pending)}
              >
                {c.retry}
              </button>
            ) : (
              <button disabled={busy || worldBusy} onClick={() => void load()}>
                {c.refresh}
              </button>
            )}
          </div>
        </div>
      )}
      {catalog && (
        <>
          {catalog.worldBinding ? (
            <p className={styles.badge}>
              {c.bound}: {catalog.worldBinding.title} · v
              {catalog.worldBinding.worldVersion}
            </p>
          ) : (
            <>
              <p>{c.legacy}</p>
              <WorldPicker
                language={language}
                worldId={worldId}
                disabled={frozen || !catalog.canChange}
                onSelect={setWorldId}
                onCatalog={setWorlds}
                onBusy={setWorldBusy}
                onDirty={setWorldDirty}
                initial={initialWorlds}
                transport={transport}
                persistPending={persistPending}
              />
              <div className={styles.actions}>
                <button
                  className={styles.primary}
                  disabled={!canWrite || !worlds || !worldId}
                  onClick={() =>
                    attempt(() => bindWorldAttempt(catalog, worlds!, worldId))
                  }
                >
                  {c.bind}
                </button>
              </div>
            </>
          )}
          {!catalog.canChange && <p className={styles.notice}>{c.busyState}</p>}
          {staleDraft && (
            <div className={styles.notice} role="alert">
              <p>{c.conflict}</p>
              <div className={styles.actions}>
                <button
                  disabled={busy || pending !== null}
                  onClick={cancelDraft}
                >
                  {c.cancel}
                </button>
              </div>
            </div>
          )}
          {draft && (
            <div className={styles.card}>
              {draft.kind === "prepare" || draft.kind === "edit" ? (
                <SetupForm
                  key={
                    draft.kind === "prepare"
                      ? "prepare"
                      : draft.adventure.versionId
                  }
                  language={language}
                  initial={
                    draft.kind === "edit"
                      ? {
                          title: draft.adventure.title,
                          premise: draft.adventure.premise,
                          pacing: draft.adventure.pacing,
                        }
                      : undefined
                  }
                  disabled={!canWrite || staleDraft}
                  onDirty={setFormDirty}
                  onCancel={cancelDraft}
                  onSave={(setup) =>
                    attempt(() =>
                      draft.kind === "prepare"
                        ? prepareAdventureAttempt(draft.basis, setup)
                        : versionAdventureAttempt(
                            draft.basis,
                            draft.adventure.id,
                            "edit",
                            setup,
                          ),
                    )
                  }
                />
              ) : draft.kind === "abandon" ? (
                <AbandonForm
                  language={language}
                  disabled={!canWrite || staleDraft}
                  onDirty={setFormDirty}
                  onCancel={cancelDraft}
                  onSave={(summary) =>
                    attempt(() =>
                      versionAdventureAttempt(
                        draft.basis,
                        draft.adventure.id,
                        "abandon",
                        { summary },
                      ),
                    )
                  }
                />
              ) : (
                <ReviewForm
                  key={draft.adventure.versionId}
                  language={language}
                  closing={draft.kind === "end"}
                  summary={draft.adventure.summary}
                  review={draft.adventure.review}
                  disabled={!canWrite || staleDraft}
                  onDirty={setFormDirty}
                  onCancel={cancelDraft}
                  onSave={(value) =>
                    attempt(() =>
                      versionAdventureAttempt(
                        draft.basis,
                        draft.adventure.id,
                        draft.kind === "end" ? "end" : "review",
                        draft.kind === "end" ? value : { review: value.review },
                      ),
                    )
                  }
                />
              )}
            </div>
          )}
          {!draft && (
            <div className={styles.actions}>
              <button
                className={styles.primary}
                disabled={
                  !canWrite ||
                  !catalog.worldBinding ||
                  catalog.activeAdventureId !== null
                }
                onClick={() => setDraft({ kind: "prepare", basis: catalog })}
              >
                {catalog.adventures.length ? c.prepare : c.prepareFirst}
              </button>
            </div>
          )}
          {!catalog.adventures.length && (
            <p className={styles.intro}>{c.firstAdventureHelp}</p>
          )}
          {catalog.adventures.map((a) => (
            <article className={styles.card} key={a.id}>
              <span className={styles.badge}>
                {status(a)} · v{a.version}
              </span>
              <h2>{a.title}</h2>
              <p>{a.premise}</p>
              <p className={styles.muted}>
                {pacingLabel(a.pacing, language)} · {c.pacingHelp}
              </p>
              <p className={styles.muted}>
                {a.start
                  ? `${c.time}: ${a.start.worldMinutes}${a.completion ? ` → ${a.completion.worldMinutes}` : ""}`
                  : c.unknownTime}
              </p>
              {a.summary && <p>{a.summary}</p>}
              {a.review && (
                <dl>
                  {Object.entries(a.review)
                    .filter(([, v]) => v !== null)
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>
                          {key === "pacing"
                            ? c.pacingReview
                            : key === "agency"
                              ? c.agencyReview
                              : key === "rewards"
                                ? c.rewardsReview
                                : key === "payoff"
                                  ? c.payoffReview
                                  : c.notesReview}
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
              )}
              <div className={styles.actions}>
                {a.status === "prepared" && (
                  <button
                    className={styles.primary}
                    disabled={
                      !canWrite || !!draft || catalog.activeAdventureId !== null
                    }
                    onClick={() =>
                      attempt(() =>
                        versionAdventureAttempt(catalog, a.id, "start"),
                      )
                    }
                  >
                    {c.start}
                  </button>
                )}
                {(a.status === "prepared" || a.status === "active") && (
                  <>
                    <button
                      disabled={!canWrite || !!draft}
                      onClick={() =>
                        setDraft({ kind: "edit", basis: catalog, adventure: a })
                      }
                    >
                      {c.editAdventure}
                    </button>
                    <button
                      disabled={!canWrite || !!draft}
                      onClick={() =>
                        setDraft({
                          kind: "abandon",
                          basis: catalog,
                          adventure: a,
                        })
                      }
                    >
                      {c.abandon}
                    </button>
                  </>
                )}
                {a.status === "active" && (
                  <button
                    className={styles.primary}
                    disabled={!canWrite || !!draft}
                    onClick={() =>
                      setDraft({ kind: "end", basis: catalog, adventure: a })
                    }
                  >
                    {c.end}
                  </button>
                )}
                {(a.status === "completed" || a.status === "abandoned") && (
                  <button
                    disabled={!canWrite || !!draft}
                    onClick={() =>
                      setDraft({ kind: "review", basis: catalog, adventure: a })
                    }
                  >
                    {c.review}
                  </button>
                )}
              </div>
              <details className={styles.history}>
                <summary>{c.history}</summary>
                {catalog.history
                  .filter((v) => v.id === a.id)
                  .map((v) => (
                    <div key={v.versionId}>
                      <p>
                        v{v.version} · {status(v)}
                      </p>
                      <p>{v.title}</p>
                      <p>{v.premise}</p>
                      <p>{pacingLabel(v.pacing, language)}</p>
                      {v.summary && <p>{v.summary}</p>}
                    </div>
                  ))}
              </details>
            </article>
          ))}
        </>
      )}
      {(catalog?.activeAdventureId ||
        snapshot.publicState?.current_location_id) && (
        <Link href={reviewLinks?.game ?? `/campaigns/${campaignId}/game`}>
          {c.continue}
        </Link>
      )}
    </section>
  );
}
function AbandonForm({
  language,
  disabled,
  onSave,
  onCancel,
  onDirty,
}: {
  language: "en" | "ru";
  disabled: boolean;
  onSave: (summary: string | null) => void;
  onCancel: () => void;
  onDirty: (dirty: boolean) => void;
}) {
  const c = adventureText(language),
    [summary, setSummary] = useState("");
  useEffect(() => {
    onDirty(!!summary);
  }, [summary, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSave(summary.trim() ? summary : null);
      }}
    >
      <p>{c.endHelp}</p>
      <label className={styles.field}>
        {c.summary}
        <textarea
          rows={3}
          maxLength={12000}
          disabled={disabled}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button type="submit" disabled={disabled}>
          {c.abandon}
        </button>
        <button type="button" disabled={disabled} onClick={onCancel}>
          {c.cancel}
        </button>
      </div>
    </form>
  );
}

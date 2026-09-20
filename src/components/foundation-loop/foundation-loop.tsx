"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FoundationLoopView,
  FoundationUiCommand,
} from "@/lib/foundation-loop/client-contracts";
import type { TradeQuote } from "@/lib/foundation-loop/contracts";
import type { TimelineFence } from "@/lib/saves/contracts";
import { sameTimeline } from "@/lib/saves/fence";
import {
  FoundationClientError,
  foundationAttempt,
  foundationScopeMatches,
  loadFoundationLoop,
  sendFoundationCommand,
} from "@/lib/foundation-loop-client";
import { useLanguage } from "../language-context";
import { useCampaignData, useUnsavedChanges } from "../persistence-context";
import { Badge, Button, Panel } from "../ui";
import { CommerceSettings } from "./commerce-settings";
import {
  ProgressionSettings,
  ProgressionCorrection,
} from "./progression-settings";
import { TradePanel } from "./trade";
import { ProgressionPanel } from "./progression";
import { foundationText } from "./text";
import styles from "./foundation-loop.module.css";

export type FoundationSection = "trade" | "progression" | "settings";

/** Uses only the allowlisted view. Synthetic previews can inject scripted transport. */
export function FoundationLoopEditor({
  section,
  initialData,
  activeTimeline = initialData.command.timeline,
  load,
  send,
  afterSave,
}: {
  section: FoundationSection;
  initialData: FoundationLoopView;
  activeTimeline?: TimelineFence;
  load?: () => Promise<FoundationLoopView>;
  send?: (
    attempt: FoundationUiCommand,
  ) => Promise<FoundationLoopView | TradeQuote>;
  afterSave?: () => Promise<unknown>;
}) {
  const { language } = useLanguage();
  const c = foundationText(language);
  const [view, setView] = useState(initialData);
  const [quote, setQuote] = useState<TradeQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const pending = useRef<FoundationUiCommand | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  const active = useRef(activeTimeline);
  useEffect(() => {
    active.current = activeTimeline;
  }, [activeTimeline]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useUnsavedChanges(uncertain);
  const stale = !foundationScopeMatches(
    view,
    initialData.campaignId,
    activeTimeline,
  );
  const frozen = busy || uncertain || stale || needsRefresh;
  const message = uncertain
    ? c.uncertain
    : error === "conflict" ||
        error === "scope" ||
        error === "busy" ||
        error === "stale_progression"
      ? c.conflict
      : error === "validation" ||
          error === "configuration" ||
          error === "invalid_progression"
        ? c.invalid
        : error === "unauthenticated" || error === "forbidden"
          ? c.auth
          : error === "source_ineligible" ||
              error === "reward_claimed" ||
              error === "already_claimed" ||
              error === "ineligible"
            ? c.rewardUnavailable
            : error === "advancement_unavailable"
              ? c.changedTrack
              : [
                    "unavailable",
                    "ineligible",
                    "already_claimed",
                    "not_found",
                    "source_ineligible",
                    "reward_claimed",
                    "advancement_unavailable",
                  ].includes(error)
                ? c.unavailable
                : error === "refresh"
                  ? c.refreshFailed
                  : error
                    ? c.connection
                    : "";

  const apply = async (
    kind: FoundationUiCommand["kind"],
    input: unknown,
    retry = false,
  ) => {
    if (locked.current || stale || needsRefresh || (uncertain && !retry))
      return;
    locked.current = true;
    setBusy(true);
    setQuoting(kind === "quote");
    setError("");
    setSaved(false);
    const attempt = foundationAttempt(
      view,
      kind,
      input,
      retry ? pending.current : null,
    );
    pending.current = attempt;
    try {
      const result = await (send
        ? send(attempt)
        : sendFoundationCommand(view.campaignId, attempt));
      if (!mounted.current) return;
      if (!sameTimeline(active.current, attempt.command.timeline)) {
        pending.current = null;
        setUncertain(false);
        setNeedsRefresh(true);
        setError("scope");
        return;
      }
      if (attempt.kind === "quote") setQuote(result as TradeQuote);
      else {
        setView(result as FoundationLoopView);
        setQuote(null);
        setSaved(true);
      }
      pending.current = null;
      setUncertain(false);
      if (attempt.kind !== "quote" && afterSave) {
        try {
          await afterSave();
        } catch {
          if (mounted.current) setError("refresh");
        }
      }
    } catch (cause) {
      if (!mounted.current) return;
      const failure =
        cause instanceof FoundationClientError
          ? cause
          : new FoundationClientError("connection", attempt.kind !== "quote");
      setError(failure.code);
      setUncertain(failure.uncertain);
      if (!failure.uncertain) pending.current = null;
      if (
        ["conflict", "scope", "busy", "stale_progression"].includes(
          failure.code,
        )
      )
        setNeedsRefresh(true);
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const refresh = async () => {
    if (locked.current || (uncertain && !stale)) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const next = await (load
        ? load()
        : loadFoundationLoop(initialData.campaignId));
      if (!mounted.current) return;
      if (!foundationScopeMatches(next, initialData.campaignId, active.current))
        throw new FoundationClientError("scope");
      setView(next);
      setQuote(null);
      setUncertain(false);
      setNeedsRefresh(false);
      pending.current = null;
      setReloadKey((n) => n + 1);
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof FoundationClientError ? cause.code : "connection",
        );
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const commerceKey = JSON.stringify([
    reloadKey,
    view.owner.currencies,
    view.owner.itemPolicies,
    view.owner.merchants,
  ]);
  const progressionKey = JSON.stringify([
    reloadKey,
    view.owner.progression,
    view.owner.tracks,
    view.owner.rewards,
  ]);
  return (
    <Panel className={styles.panel}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>
            {section === "settings" ? c.ownerOnly : c.profile}
          </p>
          <h2>{c[section]}</h2>
        </div>
        <Badge>
          {view.profile.id === "world-logic-v1"
            ? "World Logic"
            : view.profile.id === "console-basic-v1"
              ? "Console Basic"
              : view.profile.id}
        </Badge>
      </div>
      {stale && (
        <p role="alert" className={styles.notice}>
          {c.stale}
        </p>
      )}
      {message && (
        <p role="alert" className={styles.notice}>
          {message}
        </p>
      )}
      {saved && (
        <p role="status" className={styles.notice}>
          {c.saved}
        </p>
      )}
      {busy && (
        <p role="status" className={styles.notice}>
          {quoting ? c.quoteLoading : c.loadingSave}
        </p>
      )}
      <fieldset disabled={frozen}>
        {section === "trade" && (
          <TradePanel
            key={`${reloadKey}:${view.stateVersion}:${view.command.expectedRevision}`}
            view={view}
            c={c}
            quote={quote}
            apply={(kind, input) => void apply(kind, input)}
            clearQuote={() => setQuote(null)}
          />
        )}
        {section === "progression" && (
          <ProgressionPanel
            key={`${reloadKey}:${view.stateVersion}`}
            view={view}
            c={c}
            apply={(kind, input) => void apply(kind, input)}
          />
        )}
        {section === "settings" && (
          <div className={styles.form}>
            <p className="muted">{c.ownerHelp}</p>
            <CommerceSettings
              key={commerceKey}
              view={view}
              c={c}
              apply={(kind, input) => void apply(kind, input)}
            />
            <ProgressionSettings
              key={progressionKey}
              view={view}
              c={c}
              apply={(kind, input) => void apply(kind, input)}
            />
            <ProgressionCorrection
              key={`${reloadKey}:${JSON.stringify(view.progression)}`}
              view={view}
              c={c}
              apply={(kind, input) => void apply(kind, input)}
            />
            <Link
              href={`/campaigns/${view.campaignId}/inventory`}
              className={styles.storyLink}
            >
              {c.inventory}
            </Link>
            <Link
              href={`/campaigns/${view.campaignId}/character`}
              className={styles.storyLink}
            >
              {c.characters}
            </Link>
            <Link
              href={`/campaigns/${view.campaignId}/party`}
              className={styles.storyLink}
            >
              {c.merchantResources}
            </Link>
          </div>
        )}
      </fieldset>
      {section !== "settings" && view.history.length > 0 && (
        <details className={styles.history}>
          <summary>{c.history}</summary>
          <ol>
            {view.history.slice(0, 8).map((entry) => (
              <li key={entry.id}>{entry.text}</li>
            ))}
          </ol>
        </details>
      )}
      <div className={styles.footer}>
        {uncertain && !stale ? (
          <Button
            primary
            disabled={busy}
            onClick={() => {
              const attempt = pending.current;
              if (attempt) void apply(attempt.kind, attempt.input, true);
            }}
          >
            {c.retry}
          </Button>
        ) : (
          <Button disabled={busy} onClick={() => void refresh()}>
            {section === "settings" || stale || needsRefresh || quote
              ? c.reload
              : c.refresh}
          </Button>
        )}
      </div>
    </Panel>
  );
}

export function FoundationLoopPanel({
  section,
}: {
  section: FoundationSection;
}) {
  const { campaignId, data, refresh: refreshCampaign } = useCampaignData();
  const { language } = useLanguage();
  const c = foundationText(language);
  const [view, setView] = useState<FoundationLoopView | null>(null);
  const [error, setError] = useState(false);
  const generation = useRef(0);
  const timelineId = data?.timeline?.timelineId;
  const epoch = data?.timeline?.epoch;
  const load = useCallback(() => loadFoundationLoop(campaignId), [campaignId]);
  const fetchView = useCallback(async () => {
    const request = ++generation.current;
    try {
      const next = await load();
      if (request === generation.current) {
        setView(next);
        setError(false);
      }
    } catch {
      if (request === generation.current) setError(true);
    }
  }, [load]);
  useEffect(() => {
    const request = ++generation.current;
    void load()
      .then((next) => {
        if (request === generation.current) {
          setView(next);
          setError(false);
        }
      })
      .catch(() => {
        if (request === generation.current) setError(true);
      });
    const guard = generation;
    return () => {
      guard.current++;
    };
  }, [load, timelineId, epoch]);
  if (!view)
    return (
      <Panel className={styles.panel}>
        <h2>{c[section]}</h2>
        <p role={error ? "alert" : "status"}>
          {error ? c.connection : c.loading}
        </p>
        {error && <Button onClick={() => void fetchView()}>{c.refresh}</Button>}
      </Panel>
    );
  return (
    <FoundationLoopEditor
      key={campaignId}
      section={section}
      initialData={view}
      activeTimeline={data?.timeline}
      load={load}
      afterSave={refreshCampaign}
    />
  );
}

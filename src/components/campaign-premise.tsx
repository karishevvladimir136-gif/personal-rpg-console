"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Panel } from "./ui";
import { CampaignPremiseFields } from "./campaign-premise-fields";
import {
  createPremiseAttempt,
  createPremiseRequestGate,
  loadCampaignPremise,
  mergePremiseHistory,
  premiseDraft,
  premiseScopeMatches,
  PremiseClientError,
  samePremiseDraft,
  samePremiseHead,
  writeCampaignPremise,
  type PremiseAction,
} from "@/lib/campaign-premise-client";
import { campaignPremiseText } from "@/lib/campaign-premise-i18n";
import type {
  CampaignPremise,
  CampaignPremiseCommand,
} from "@/lib/production/premise-contracts";
import type { TimelineFence } from "@/lib/saves/contracts";
import styles from "./campaign-premise.module.css";

function errorCode(cause: unknown) {
  return cause instanceof PremiseClientError ? cause.code : "unavailable";
}

export function CampaignPremiseEditor({
  current,
  activeTimeline,
  defaultLanguage,
  onSave,
  onRefresh,
  onCommitted,
}: {
  current: CampaignPremise;
  activeTimeline: TimelineFence | undefined;
  defaultLanguage: "en" | "ru";
  onSave: (command: CampaignPremiseCommand) => Promise<CampaignPremise>;
  onRefresh: () => Promise<void>;
  onCommitted: (premise: CampaignPremise) => void;
}) {
  const { language } = useLanguage();
  const c = campaignPremiseText(language);
  const [baseline, setBaseline] = useState(current);
  const [draft, setDraft] = useState(() =>
    premiseDraft(current, defaultLanguage),
  );
  const [history, setHistory] = useState(current);
  const [busy, setBusy] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [acknowledged, setAcknowledged] = useState<string | null>(null);
  const pending = useRef<CampaignPremiseCommand | null>(null);
  const gate = useRef(createPremiseRequestGate());
  const live = useRef({
    campaignId: current.campaignId,
    timeline: activeTimeline,
    current,
  });
  useEffect(() => {
    live.current = {
      campaignId: current.campaignId,
      timeline: activeTimeline,
      current,
    };
  }, [current, activeTimeline]);
  useEffect(() => {
    const requests = gate.current;
    return () => requests.invalidate();
  }, []);
  const dirty = !samePremiseDraft(
    draft,
    premiseDraft(baseline, defaultLanguage),
  );
  const stale = !premiseScopeMatches(
    baseline,
    current.campaignId,
    activeTimeline,
  );
  const changed = !samePremiseHead(baseline, current);
  const currentMatches = premiseScopeMatches(
    current,
    current.campaignId,
    activeTimeline,
  );
  const visibleHistory = samePremiseHead(history, current) ? history : current;
  const locked =
    busy ||
    loadingOlder ||
    refreshing ||
    stale ||
    changed ||
    needsReload ||
    uncertain;
  useUnsavedChanges(dirty || uncertain);

  const save = async (action: PremiseAction) => {
    if (
      !premiseScopeMatches(baseline, current.campaignId, live.current.timeline)
    )
      return;
    if (!uncertain && !samePremiseHead(baseline, live.current.current)) return;
    if (
      busy ||
      loadingOlder ||
      refreshing ||
      stale ||
      needsReload ||
      (!uncertain && changed)
    )
      return;
    if (
      !uncertain &&
      action.action === "save" &&
      (!dirty || !draft.text.trim())
    )
      return;
    if (!uncertain && action.action !== "save" && dirty) return;
    if (
      !uncertain &&
      action.action === "review" &&
      (!current.current ||
        acknowledged !== current.current.id ||
        current.current.reviewStatus === "reviewed")
    )
      return;
    const ticket = gate.current.begin(live.current);
    if (!ticket) return;
    setBusy(true);
    setError("");
    setSaved(false);
    pending.current = createPremiseAttempt(pending.current, baseline, action);
    const command = pending.current;
    try {
      const result = await onSave(command);
      if (!gate.current.accepts(ticket, live.current)) return;
      if (
        !premiseScopeMatches(result, current.campaignId, live.current.timeline)
      )
        throw new PremiseClientError("conflict");
      live.current = { ...live.current, current: result };
      pending.current = null;
      setUncertain(false);
      setBaseline(result);
      setDraft(premiseDraft(result, defaultLanguage));
      setHistory(result);
      setAcknowledged(null);
      setSaved(true);
      onCommitted(result);
    } catch (cause) {
      if (!gate.current.accepts(ticket, live.current)) return;
      const code = errorCode(cause);
      setError(code);
      setUncertain(code === "unavailable");
      if (code !== "unavailable") {
        pending.current = null;
        setNeedsReload(["conflict", "busy", "not_found"].includes(code));
      }
    } finally {
      gate.current.finish(ticket);
      // Scope changes retain the draft, but must not leave its controls busy.
      setBusy(false);
    }
  };
  const refresh = async () => {
    if (busy || loadingOlder || refreshing || (uncertain && !stale)) return;
    const ticket = gate.current.begin(live.current);
    if (!ticket) return;
    setRefreshing(true);
    try {
      await onRefresh();
      if (gate.current.accepts(ticket, live.current)) {
        setError("");
        setNeedsReload(false);
      }
    } catch {
      if (gate.current.accepts(ticket, live.current)) setError("load");
    } finally {
      gate.current.finish(ticket);
      setRefreshing(false);
    }
  };
  const loadOlder = async () => {
    if (
      busy ||
      refreshing ||
      loadingOlder ||
      !currentMatches ||
      visibleHistory.olderThan === null
    )
      return;
    const ticket = gate.current.begin(live.current);
    if (!ticket) return;
    setLoadingOlder(true);
    setError("");
    try {
      const page = await loadCampaignPremise(
        current.campaignId,
        visibleHistory.olderThan,
      );
      if (!gate.current.accepts(ticket, live.current)) return;
      if (!samePremiseHead(page, live.current.current))
        throw new PremiseClientError("conflict");
      setHistory(mergePremiseHistory(visibleHistory, page));
    } catch (cause) {
      if (gate.current.accepts(ticket, live.current)) {
        const code = errorCode(cause);
        setError(code === "conflict" ? code : "load");
        if (code === "conflict") setNeedsReload(true);
      }
    } finally {
      gate.current.finish(ticket);
      setLoadingOlder(false);
    }
  };
  const message =
    error === "load"
      ? c.loadError
      : ["conflict", "busy", "not_found"].includes(error)
        ? c.conflict
        : error === "validation"
          ? c.invalid
          : error === "unauthenticated"
            ? c.signIn
            : error === "forbidden"
              ? c.forbidden
              : error === "not_configured"
                ? c.setup
                : error
                  ? c.uncertain
                  : "";

  return (
    <Panel className={styles.panel}>
      <div className={styles.intro}>
        <h2>{c.title}</h2>
        <Badge>{c.advisory}</Badge>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save({ action: "save", ...draft });
        }}
      >
        <fieldset className="persistence-fields" disabled={busy || uncertain}>
          <CampaignPremiseFields
            value={draft}
            onChange={(value) => {
              setDraft(value);
              setSaved(false);
              setAcknowledged(null);
            }}
          />
        </fieldset>
        <div className={styles.footer}>
          {message && (
            <p className={styles.notice} role="alert">
              {message}
            </p>
          )}
          {stale && (
            <p className={styles.notice} role="alert">
              {c.scopeChanged}
            </p>
          )}
          {!stale && changed && !uncertain && (
            <p className={styles.notice} role="alert">
              {c.changed}
            </p>
          )}
          <div className="button-row">
            <Button
              primary
              type="submit"
              disabled={
                uncertain
                  ? busy || refreshing || loadingOlder || stale || needsReload
                  : locked || !dirty || !draft.text.trim()
              }
            >
              {busy ? c.saving : uncertain ? c.retry : c.save}
            </Button>
            <Button
              disabled={
                busy || refreshing || loadingOlder || (uncertain && !stale)
              }
              onClick={() => void refresh()}
            >
              {c.refresh}
            </Button>
            <Button
              disabled={
                busy ||
                refreshing ||
                loadingOlder ||
                (uncertain && !stale) ||
                !currentMatches ||
                needsReload
              }
              onClick={() => {
                if ((dirty || uncertain) && !window.confirm(c.discard)) return;
                pending.current = null;
                setUncertain(false);
                setBaseline(current);
                setDraft(premiseDraft(current, defaultLanguage));
                setAcknowledged(null);
                setSaved(false);
                setError("");
              }}
            >
              {c.useSaved}
            </Button>
          </div>
          <p role="status">{saved ? c.saved : dirty ? c.dirty : c.idle}</p>
        </div>
      </form>
      <section className={styles.review}>
        <h3>{c.reviewTitle}</h3>
        <p className="muted">{c.reviewHelp}</p>
        {current.current ? (
          <>
            <Badge green={current.current.reviewStatus === "reviewed"}>
              {current.current.reviewStatus === "reviewed"
                ? c.reviewed
                : c.draft}{" "}
              · {c.version} {current.current.version}
            </Badge>
            <div
              className={styles.originalText}
              lang={current.current.language}
            >
              {current.current.text}
            </div>
            {current.current.reviewStatus !== "reviewed" && (
              <>
                <label className={styles.acknowledge}>
                  <input
                    type="checkbox"
                    checked={acknowledged === current.current.id}
                    disabled={locked || dirty}
                    onChange={(event) =>
                      setAcknowledged(
                        event.target.checked ? current.current!.id : null,
                      )
                    }
                  />
                  {c.acknowledge}
                </label>
                <Button
                  disabled={
                    locked || dirty || acknowledged !== current.current.id
                  }
                  onClick={() => void save({ action: "review" })}
                >
                  {c.review}
                </Button>
              </>
            )}
          </>
        ) : (
          <p>{c.empty}</p>
        )}
        {dirty && <p className="muted">{c.saveBeforeReview}</p>}
      </section>
      <section className={styles.history}>
        <h3>{c.history}</h3>
        <p className="muted">{c.historyHelp}</p>
        {visibleHistory.versions.map((version) => (
          <details key={version.id} className={styles.version}>
            <summary>
              <span>
                {c.version} {version.version}
              </span>
              <Badge>
                {version.reviewStatus === "reviewed" ? c.reviewed : c.draft}
              </Badge>
              {version.id === current.current?.id && <span>{c.latest}</span>}
              {version.version === 1 && <span>{c.original}</span>}
              <time dateTime={version.createdAt}>
                {new Date(version.createdAt).toLocaleString(language)}
              </time>
            </summary>
            <div className={styles.versionBody}>
              <p className="muted">
                {version.language === "ru" ? c.russian : c.english}
                {version.restoredFromVersionId ? ` · ${c.restored}` : ""}
              </p>
              <div className={styles.originalText} lang={version.language}>
                {version.text}
              </div>
              {version.id !== current.current?.id && (
                <Button
                  disabled={locked || dirty}
                  onClick={() => {
                    if (window.confirm(c.restoreConfirm))
                      void save({ action: "restore", versionId: version.id });
                  }}
                >
                  {c.restore}
                </Button>
              )}
            </div>
          </details>
        ))}
        {visibleHistory.olderThan !== null && (
          <Button
            disabled={
              busy || refreshing || loadingOlder || !currentMatches || uncertain
            }
            onClick={() => void loadOlder()}
          >
            {loadingOlder ? c.loadingOlder : c.older}
          </Button>
        )}
      </section>
    </Panel>
  );
}

export function CampaignPremisePanel({
  campaignId,
  timeline,
  defaultLanguage,
}: {
  campaignId: string;
  timeline: TimelineFence | undefined;
  defaultLanguage: "en" | "ru";
}) {
  const { language } = useLanguage();
  const c = campaignPremiseText(language);
  const [data, setData] = useState<CampaignPremise | null>(null);
  const [error, setError] = useState(false);
  const gate = useRef(createPremiseRequestGate());
  const timelineId = timeline?.timelineId;
  const epoch = timeline?.epoch;
  const refresh = useCallback(async () => {
    const scope = {
      campaignId,
      timeline:
        timelineId === undefined || epoch === undefined
          ? undefined
          : { timelineId, epoch },
    };
    const ticket = gate.current.begin(scope, true);
    if (!ticket) return;
    try {
      const result = await loadCampaignPremise(campaignId);
      if (!gate.current.accepts(ticket, scope)) return;
      if (!premiseScopeMatches(result, campaignId, scope.timeline))
        throw new PremiseClientError("conflict");
      setData(result);
      setError(false);
    } catch (cause) {
      if (gate.current.accepts(ticket, scope)) {
        setError(true);
        throw cause;
      }
    } finally {
      gate.current.finish(ticket);
    }
  }, [campaignId, timelineId, epoch]);
  useEffect(() => {
    const requests = gate.current;
    const timer = window.setTimeout(() => void refresh().catch(() => {}), 0);
    return () => {
      window.clearTimeout(timer);
      requests.invalidate();
    };
  }, [refresh]);
  return (
    <>
      {error && !data && (
        <Panel title={c.title}>
          <p role="alert">{c.loadError}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {c.refresh}
          </Button>
        </Panel>
      )}
      {!data && !error && <p role="status">{c.loading}</p>}
      {data && data.campaignId === campaignId && (
        <CampaignPremiseEditor
          current={data}
          activeTimeline={timeline}
          defaultLanguage={defaultLanguage}
          onSave={(command) => writeCampaignPremise(campaignId, command)}
          onRefresh={refresh}
          onCommitted={setData}
        />
      )}
    </>
  );
}

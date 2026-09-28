"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  FlaskConical,
  History,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type {
  LabCatalog,
  LabRequest,
  PublicLabRun,
} from "../../lib/world-lab/contracts";
import type { LabAuthoringCatalog } from "../../lib/world-lab/authoring-contracts.ts";
import type { AuthoringTransport } from "./authoring-client.ts";
import { WorldLabAuthoring } from "./world-lab-authoring.tsx";
import {
  WorldLabContinuation,
  type WorldLabContinuationProps,
} from "./continuation.tsx";
import {
  LabClientError,
  labControls,
  createLabTransport,
  mergeLabRun,
  pendingLabKey,
  prepareLabAttempt,
  readLabCatalog,
  readPublicLabRun,
  restoreLabAttempt,
  runLabAttempt,
} from "./client.ts";
import type { LabTransport } from "./client.ts";
import { labWorldTime, worldLabText } from "./text.ts";
import styles from "./world-lab.module.css";

export type WorldLabPanelProps = {
  campaignId: string;
  language: "en" | "ru";
  initialCatalog?: LabCatalog;
  initialAuthoringCatalog?: LabAuthoringCatalog;
  /** Synthetic previews may inject a scripted transport; production uses the API. */
  transport?: LabTransport;
  authoringTransport?: AuthoringTransport;
  continuationPreview?: Pick<
    WorldLabContinuationProps,
    "initialInspection" | "initialCatalog" | "transport"
  >;
};

export function WorldLabPanel(props: WorldLabPanelProps) {
  return <WorldLabSession key={props.campaignId} {...props} />;
}

function initialView(
  value: LabCatalog | undefined,
  campaignId: string,
): LabCatalog | null {
  if (!value) return null;
  try {
    return readLabCatalog(value, campaignId);
  } catch {
    return null;
  }
}

function WorldLabSession({
  campaignId,
  language,
  initialCatalog,
  initialAuthoringCatalog,
  transport: injectedTransport,
  authoringTransport,
  continuationPreview,
}: WorldLabPanelProps) {
  const c = worldLabText(language);
  const transport = useMemo(
    () => injectedTransport ?? createLabTransport(language),
    [injectedTransport, language],
  );
  const [catalog, setCatalog] = useState<LabCatalog | null>(() =>
    initialView(initialCatalog, campaignId),
  );
  const [saveId, setSaveId] = useState("");
  const [divergenceId, setDivergenceId] = useState("");
  const [label, setLabel] = useState(c.defaultLabel);
  const [horizon, setHorizon] = useState("60");
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [authoringPending, setAuthoringPending] = useState(false);
  const [continuationPending, setContinuationPending] = useState(false);
  const [pending, setPending] = useState<LabRequest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pendingRef = useRef<LabRequest | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    Promise.resolve().then(() => {
      if (!mounted.current) return;
      try {
        const stored = restoreLabAttempt(
          sessionStorage.getItem(pendingLabKey(campaignId)),
          campaignId,
        );
        if (stored) {
          pendingRef.current = stored;
          setPending(stored);
          setNotice("recovered");
        }
      } catch {
        /* An unavailable session store does not block ordinary play. */
      }
    });
    return () => {
      mounted.current = false;
    };
  }, [campaignId]);

  useEffect(() => {
    if (initialView(initialCatalog, campaignId)) return;
    const controller = new AbortController();
    transport
      .load(campaignId, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted)
          setCatalog(readLabCatalog(value, campaignId));
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("unavailable");
      });
    return () => controller.abort();
  }, [campaignId, initialCatalog, transport]);

  const remember = useCallback(
    (request: LabRequest | null) => {
      pendingRef.current = request;
      setPending(request);
      try {
        if (request)
          sessionStorage.setItem(
            pendingLabKey(campaignId),
            JSON.stringify(request),
          );
        else sessionStorage.removeItem(pendingLabKey(campaignId));
      } catch {
        /* The in-memory exact request remains available for retry. */
      }
    },
    [campaignId],
  );

  const perform = async (request: LabRequest) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const attempt = pendingRef.current ?? structuredClone(request);
    remember(attempt);
    try {
      const result = readPublicLabRun(
        await transport.send(structuredClone(attempt)),
        campaignId,
      );
      if (attempt.action !== "prepare" && result.id !== attempt.input.runId)
        throw new LabClientError("uncertain");
      if (!mounted.current) return;
      setCatalog((current) =>
        mergeLabRun(
          current ?? { campaignId, bases: [], scenarios: [], runs: [] },
          result,
        ),
      );
      setSelectedId(result.id);
      remember(null);
      setNotice(attempt.action === "prepare" ? "prepared" : "saved");
    } catch (cause) {
      if (!mounted.current) return;
      const code = cause instanceof LabClientError ? cause.code : "uncertain";
      setError(code);
      if (code !== "uncertain") remember(null);
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const refresh = async () => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = readLabCatalog(await transport.load(campaignId), campaignId);
      if (mounted.current) setCatalog(next);
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof LabClientError ? cause.code : "unavailable");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const chosenBase =
    catalog?.bases.find((base) => base.saveId === saveId) ?? catalog?.bases[0];
  const chosenScenario =
    catalog?.scenarios.find(
      (scenario) => scenario.divergenceVersionId === divergenceId,
    ) ?? catalog?.scenarios[0];
  const selected =
    catalog?.runs.find((run) => run.id === selectedId) ?? catalog?.runs[0];
  const frozen =
    busy || pending !== null || authoringPending || continuationPending;
  const eligible = !!chosenBase && !!chosenScenario;
  const validHorizon =
    /^\d+$/.test(horizon) && Number(horizon) >= 1 && Number(horizon) <= 43_200;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!catalog || !chosenBase || !chosenScenario || frozen) return;
    try {
      const request = prepareLabAttempt(catalog, {
        saveId: chosenBase.saveId,
        scenarioVersionId: chosenScenario.scenarioVersionId,
        divergenceVersionId: chosenScenario.divergenceVersionId,
        label: label.trim(),
        horizonMinutes: Number(horizon),
      });
      void perform(request);
    } catch {
      setError("validation");
    }
  };
  const command = (action: Exclude<LabRequest["action"], "prepare">) => {
    if (!selected || frozen) return;
    void perform(runLabAttempt(action, selected));
  };
  const errorMessage =
    error === "conflict"
      ? c.conflict
      : error === "validation"
        ? c.validation
        : ["unauthenticated", "forbidden"].includes(error)
          ? c.auth
          : c.connection;

  return (
    <section
      className={styles.lab}
      aria-labelledby="world-lab-title"
      lang={language}
    >
      <header className={styles.hero}>
        <div className={styles.eyebrow}>
          <FlaskConical size={15} aria-hidden="true" />
          {c.eyebrow}
          <span className={styles.nonCanon}>{c.nonCanon}</span>
        </div>
        <div className={styles.headingRow}>
          <h1 id="world-lab-title">{c.title}</h1>
          <button
            className={styles.iconButton}
            onClick={() => void refresh()}
            disabled={busy}
            aria-label={c.refresh}
            title={c.refresh}
          >
            <RefreshCw size={17} aria-hidden="true" />
          </button>
        </div>
        <p className={styles.intro}>{c.intro}</p>
        <p className={styles.boundary}>{c.boundary}</p>
      </header>

      <div aria-live="polite" aria-atomic="true">
        {pending ? (
          <div className={styles.message} role="status">
            <p>{notice === "recovered" ? c.pendingStored : c.uncertain}</p>
            <button
              className={styles.primary}
              onClick={() => void perform(pending)}
              disabled={busy}
            >
              {busy ? c.busy : c.retry}
            </button>
          </div>
        ) : error ? (
          <p className={styles.message} role="alert">
            {errorMessage}
          </p>
        ) : notice ? (
          <p className={styles.success}>
            {notice === "prepared" ? c.prepareSuccess : c.saved}
          </p>
        ) : null}
      </div>

      {!catalog ? (
        <div className={styles.empty}>
          <FlaskConical size={28} aria-hidden="true" />
          <p role="status">{error ? c.connection : c.loading}</p>
          {error && (
            <button
              className={styles.secondary}
              onClick={() => void refresh()}
              disabled={busy}
            >
              {c.refresh}
            </button>
          )}
        </div>
      ) : (
        <>
          <WorldLabAuthoring
            campaignId={campaignId}
            language={language}
            campaign={catalog}
            initialCatalog={initialAuthoringCatalog}
            transport={authoringTransport}
            disabled={busy || pending !== null || continuationPending}
            onPendingChange={setAuthoringPending}
            onPrepared={(run) => {
              setCatalog((current) => mergeLabRun(current ?? catalog, run));
              setSelectedId(run.id);
              requestAnimationFrame(() =>
                document
                  .getElementById("lab-run-history")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" }),
              );
            }}
          />
          <WorldLabContinuation
            {...continuationPreview}
            campaignId={campaignId}
            language={language}
            campaign={catalog}
            disabled={busy || pending !== null || authoringPending}
            onPendingChange={setContinuationPending}
            onPrepared={(run) => {
              setCatalog((current) => mergeLabRun(current ?? catalog, run));
              setSelectedId(run.id);
              requestAnimationFrame(() =>
                document
                  .getElementById("lab-run-history")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" }),
              );
            }}
          />
          <div className={`${styles.layout} ${selected ? styles.hasRun : ""}`}>
            <aside className={styles.sidebar}>
              <details className={styles.expert}>
                <summary>{c.reuse}</summary>
                <section
                  className={styles.prepare}
                  aria-labelledby="lab-new-run"
                >
                  <div className={styles.sectionLabel}>
                    <Sparkles size={15} aria-hidden="true" />
                    <h2 id="lab-new-run">{c.newRun}</h2>
                  </div>
                  {!eligible ? (
                    <div className={styles.emptySmall}>
                      <h3>{c.emptyTitle}</h3>
                      <p>{c.empty}</p>
                      <p className={styles.hint}>
                        {!chosenBase ? c.missingBase : c.missingScenario}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submit}>
                      <fieldset className={styles.fields} disabled={frozen}>
                        <label>
                          {c.base}
                          <select
                            value={chosenBase.saveId}
                            onChange={(event) => setSaveId(event.target.value)}
                          >
                            {catalog.bases.map((base) => (
                              <option key={base.saveId} value={base.saveId}>
                                {base.label} ·{" "}
                                {labWorldTime(base.worldMinutes, language)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          {c.premise}
                          <select
                            value={chosenScenario.divergenceVersionId}
                            onChange={(event) =>
                              setDivergenceId(event.target.value)
                            }
                          >
                            {catalog.scenarios.map((scenario) => (
                              <option
                                key={scenario.divergenceVersionId}
                                value={scenario.divergenceVersionId}
                              >
                                {scenario.scenarioTitle} —{" "}
                                {scenario.divergenceTitle}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className={styles.premise}>
                          <h3>{c.assumptions}</h3>
                          {chosenScenario.assumptions.length ? (
                            <ul>
                              {chosenScenario.assumptions.map(
                                (assumption, index) => (
                                  <li key={index}>{assumption}</li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p className={styles.hint}>{c.noAssumptions}</p>
                          )}
                          <h3>{c.changes}</h3>
                          {chosenScenario.changes.length ? (
                            <ul>
                              {chosenScenario.changes.map((change, index) => (
                                <li key={index}>{change}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className={styles.hint}>{c.noChanges}</p>
                          )}
                        </div>
                        <label>
                          {c.label}
                          <input
                            value={label}
                            onChange={(event) => setLabel(event.target.value)}
                            maxLength={160}
                            required
                            autoComplete="off"
                          />
                        </label>
                        <label>
                          {c.horizon}
                          <span className={styles.horizon}>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={43200}
                              step={1}
                              value={horizon}
                              onChange={(event) =>
                                setHorizon(event.target.value)
                              }
                              required
                              aria-describedby="lab-horizon-help"
                            />
                            <span>{c.minutes}</span>
                          </span>
                        </label>
                        <p className={styles.hint} id="lab-horizon-help">
                          {c.horizonHelp}
                        </p>
                        <button
                          className={styles.primary}
                          type="submit"
                          disabled={!validHorizon || !label.trim()}
                        >
                          {c.prepare}
                          <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      </fieldset>
                      <p className={styles.hint}>{c.preparation}</p>
                    </form>
                  )}
                </section>
                <details className={styles.scope}>
                  <summary>{c.scope}</summary>
                  <p>{c.scopeHelp}</p>
                </details>
              </details>
              <nav className={styles.runList} aria-label={c.experiments}>
                <h2>{c.experiments}</h2>
                {catalog.runs.length ? (
                  catalog.runs.map((run) => (
                    <button
                      key={run.id}
                      type="button"
                      className={`${styles.runChoice} ${selected?.id === run.id ? styles.selected : ""}`}
                      onClick={() => setSelectedId(run.id)}
                      aria-pressed={selected?.id === run.id}
                    >
                      <span>{run.label}</span>
                      <small>{c.status[run.status]}</small>
                    </button>
                  ))
                ) : (
                  <p className={styles.hint}>{c.noRuns}</p>
                )}
              </nav>
            </aside>

            <section
              id="lab-run-history"
              className={styles.narrative}
              aria-label={c.history}
            >
              {!selected ? (
                <div className={styles.blankHistory}>
                  <History size={30} aria-hidden="true" />
                  <h2>{c.history}</h2>
                  <p>{c.selectRun}</p>
                  <span className={styles.quietLine} />
                </div>
              ) : (
                <RunHistory
                  run={selected}
                  language={language}
                  frozen={frozen}
                  command={command}
                />
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}

function RunHistory({
  run,
  language,
  frozen,
  command,
}: {
  run: PublicLabRun;
  language: "en" | "ru";
  frozen: boolean;
  command: (action: Exclude<LabRequest["action"], "prepare">) => void;
}) {
  const c = worldLabText(language),
    controls = labControls(run);
  return (
    <>
      <header className={styles.runHeader}>
        <div className={styles.runIdentity}>
          <span className={styles.nonCanon}>{c.nonCanon}</span>
          <span className={styles.status}>{c.status[run.status]}</span>
        </div>
        <h2>{run.label}</h2>
        <p className={styles.runSubtitle}>
          {run.scenario.scenarioTitle}
          <span aria-hidden="true"> / </span>
          {run.scenario.divergenceTitle}
        </p>
        <details className={styles.runSettings}>
          <summary>{c.recordedSettings}</summary>
          <div className={styles.clock}>
            <div>
              <span>{c.from}</span>
              <strong>{labWorldTime(run.startWorldMinutes, language)}</strong>
            </div>
            <div>
              <span>{c.current}</span>
              <strong>{labWorldTime(run.currentWorldMinutes, language)}</strong>
            </div>
            <div>
              <span>{c.until}</span>
              <strong>{labWorldTime(run.throughWorldMinutes, language)}</strong>
            </div>
          </div>
          <progress
            className={styles.progress}
            aria-label={c.progress}
            max={run.throughWorldMinutes - run.startWorldMinutes}
            value={run.currentWorldMinutes - run.startWorldMinutes}
          />
        </details>
        {run.reason && <p className={styles.reason}>{c.reason[run.reason]}</p>}
        {run.execution && (
          <details className={styles.modelProvenance}>
            <summary>{c.selectedModel}</summary>
            <p>
              <span>{c.selectedModel}</span> {run.execution.modelId}
              {run.execution.reasoning && ` · ${run.execution.reasoning}`}
            </p>
            <p>
              {c.responses}: {run.execution.recordedResponses}
              {run.execution.inputTokens !== null &&
              run.execution.outputTokens !== null
                ? ` · ${new Intl.NumberFormat(language).format(run.execution.inputTokens)} / ${new Intl.NumberFormat(language).format(run.execution.outputTokens)} ${c.tokens}`
                : ` · ${c.usageUnavailable}`}
            </p>
          </details>
        )}
        <div className={styles.actions}>
          {controls.continue && (
            <button
              className={styles.primary}
              disabled={frozen}
              onClick={() => command("continue")}
            >
              <Play size={14} aria-hidden="true" />
              {run.execution && run.status === "prepared"
                ? c.start
                : c.continue}
            </button>
          )}
          {controls.resume && (
            <button
              className={styles.primary}
              disabled={frozen}
              onClick={() => command("resume")}
            >
              <Play size={14} aria-hidden="true" />
              {c.resume}
            </button>
          )}
          {controls.pause && (
            <button
              className={styles.secondary}
              disabled={frozen}
              onClick={() => command("pause")}
            >
              <Pause size={14} aria-hidden="true" />
              {c.pause}
            </button>
          )}
          {controls.cancel && (
            <button
              className={styles.textButton}
              disabled={frozen}
              onClick={() => command("cancel")}
            >
              {c.cancel}
            </button>
          )}
        </div>
        {run.execution && controls.continue && (
          <p className={styles.cost}>{c.runCost}</p>
        )}
        {controls.replace && (
          <details className={styles.recovery}>
            <summary>{c.replace}</summary>
            <p>{c.replaceHelp}</p>
            <button
              className={styles.secondary}
              disabled={frozen}
              onClick={() => command("resume")}
            >
              {c.replace}
            </button>
          </details>
        )}
      </header>
      <div className={styles.historyTitle}>
        <History size={15} aria-hidden="true" />
        <h3>{c.history}</h3>
      </div>
      {run.checkpoints.length ? (
        <ol className={styles.timeline}>
          {run.checkpoints.map((checkpoint, index) => (
            <li className={styles.checkpoint} key={checkpoint.id}>
              <div className={styles.marker} aria-hidden="true" />
              <div className={styles.checkpointMeta}>
                <span>
                  {index === 0
                    ? c.firstCheckpoint
                    : `${c.checkpoint} ${checkpoint.ordinal}`}
                </span>
                <time>{labWorldTime(checkpoint.worldMinutes, language)}</time>
              </div>
              <p className={styles.summary}>{checkpoint.summary}</p>
              {checkpoint.events.length > 0 && (
                <ul className={styles.events}>
                  {checkpoint.events.map((event) => (
                    <li key={event.id}>
                      <span className={styles.eventTime}>
                        {labWorldTime(event.worldMinutes, language)}
                      </span>
                      <p>{event.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.hint}>{c.noHistory}</p>
      )}
    </>
  );
}

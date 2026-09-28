"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import { ArrowRight, GitBranch, RefreshCw } from "lucide-react";
import type {
  LabCatalog,
  PublicLabRun,
} from "../../lib/world-lab/contracts.ts";
import type {
  ContinuationCatalog,
  ContinuationInspection,
  ContinuationRequest,
} from "../../lib/world-lab/continuation-contracts.ts";
import { sameContinuationSelection } from "../../lib/world-lab/continuation-validation.ts";
import { ReviewEditor } from "./world-lab-authoring.tsx";
import { LabClientError } from "./client.ts";
import {
  continuationDraftAttempt,
  continuationInterpretAttempt,
  createContinuationTransport,
  inspectedContinuation,
  mergeContinuation,
  offeredContinuation,
  pendingContinuationKey,
  readContinuationCatalog,
  readContinuationInspection,
  readContinuationReply,
  restoreContinuationAttempt,
} from "./continuation-client.ts";
import type { ContinuationTransport } from "./continuation-client.ts";
import { continuationText } from "./continuation-text.ts";
import { labWorldTime } from "./text.ts";
import styles from "./continuation.module.css";

export type WorldLabContinuationProps = {
  campaignId: string;
  language: "en" | "ru";
  campaign: LabCatalog;
  disabled: boolean;
  onPendingChange: (pending: boolean) => void;
  onPrepared: (run: PublicLabRun) => void;
  initialInspection?: ContinuationInspection;
  initialCatalog?: ContinuationCatalog;
  transport?: ContinuationTransport;
};
function initialInspection(
  value: ContinuationInspection | undefined,
  campaignId: string,
) {
  try {
    return value ? readContinuationInspection(value, campaignId) : null;
  } catch {
    return null;
  }
}
function initialCatalog(
  value: ContinuationCatalog | undefined,
  inspection: ContinuationInspection | null,
  campaignId: string,
) {
  try {
    return value && inspection
      ? readContinuationCatalog(
          value,
          campaignId,
          inspectedContinuation(inspection),
        )
      : null;
  } catch {
    return null;
  }
}
export function WorldLabContinuation(props: WorldLabContinuationProps) {
  return <ContinuationSession key={props.campaignId} {...props} />;
}
function ContinuationSession({
  campaignId,
  language,
  campaign,
  disabled,
  onPendingChange,
  onPrepared,
  initialInspection: suppliedInspection,
  initialCatalog: suppliedCatalog,
  transport: injected,
}: WorldLabContinuationProps) {
  const c = continuationText(language),
    costId = useId();
  const transport = useMemo(
    () => injected ?? createContinuationTransport(language),
    [injected, language],
  );
  const startingInspection = initialInspection(suppliedInspection, campaignId);
  const [runId, setRunId] = useState(startingInspection?.source.runId ?? "");
  const [checkpointId, setCheckpointId] = useState(
    startingInspection?.checkpoint.id ?? "",
  );
  const [inspection, setInspection] = useState(startingInspection);
  const [catalog, setCatalog] = useState(() =>
    initialCatalog(suppliedCatalog, startingInspection, campaignId),
  );
  const [authoring, setAuthoring] = useState(!!suppliedCatalog);
  const [versionId, setVersionId] = useState(
    () => suppliedCatalog?.drafts[0]?.versionId ?? "",
  );
  const [premise, setPremise] = useState("");
  const [modelId, setModelId] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<ContinuationRequest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pendingRef = useRef<ContinuationRequest | null>(null),
    locked = useRef(false),
    mounted = useRef(true);
  const remember = useCallback(
    (request: ContinuationRequest | null) => {
      pendingRef.current = request;
      setPending(request);
      try {
        if (request)
          sessionStorage.setItem(
            pendingContinuationKey(campaignId),
            JSON.stringify(request),
          );
        else sessionStorage.removeItem(pendingContinuationKey(campaignId));
      } catch {
        /* The exact in-memory request stays available for receipt replay. */
      }
    },
    [campaignId],
  );
  useEffect(() => {
    mounted.current = true;
    Promise.resolve().then(() => {
      if (!mounted.current) return;
      try {
        const restored = restoreContinuationAttempt(
          sessionStorage.getItem(pendingContinuationKey(campaignId)),
          campaignId,
        );
        if (restored) {
          pendingRef.current = restored;
          setPending(restored);
          setRunId(restored.input.source.sourceRunId);
          setCheckpointId(restored.input.source.sourceCheckpointId);
        }
      } catch {
        /* Storage availability does not authorize a replacement request. */
      }
    });
    return () => {
      mounted.current = false;
    };
  }, [campaignId]);
  useEffect(() => {
    onPendingChange(busy || pending !== null);
  }, [busy, pending, onPendingChange]);
  useEffect(() => () => onPendingChange(false), [onPendingChange]);

  const selectedRun =
    campaign.runs.find((r) => r.id === runId) ?? campaign.runs[0];
  const selectedCheckpoint =
    selectedRun?.checkpoints.find((p) => p.id === checkpointId) ??
    selectedRun?.checkpoints.at(-1);
  const selectedDraft = catalog?.drafts.find((d) => d.versionId === versionId);
  const selectedModel =
    catalog?.models.find((m) => m.modelId === modelId) ??
    catalog?.models.find((m) => m.modelId === "gpt-6-astra" && m.available) ??
    catalog?.models.find((m) => m.available) ??
    catalog?.models[0];
  const selectedReasoning = selectedModel?.reasoning.includes(reasoning)
    ? reasoning
    : selectedModel?.reasoning.includes("high")
      ? "high"
      : (selectedModel?.reasoning[0] ?? "");
  const frozen = disabled || busy || pending !== null;
  const clearSource = () => {
    setInspection(null);
    setCatalog(null);
    setAuthoring(false);
    setVersionId("");
    setError("");
    setNotice("");
  };
  const inspect = async () => {
    if (locked.current || frozen || !selectedRun || !selectedCheckpoint) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const source = offeredContinuation(
        campaign,
        selectedRun.id,
        selectedCheckpoint.id,
      );
      const next = readContinuationInspection(
        await transport.inspect(campaignId, source),
        campaignId,
      );
      if (!mounted.current) return;
      setInspection(next);
      setRunId(next.source.runId);
      setCheckpointId(next.checkpoint.id);
      setCatalog(null);
      setAuthoring(false);
      setVersionId("");
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof LabClientError ? cause.code : "unavailable");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const loadProposals = async () => {
    if (locked.current || frozen || !inspection) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const source = inspectedContinuation(inspection);
      const next = readContinuationCatalog(
        await transport.load(campaignId, source),
        campaignId,
        source,
      );
      if (mounted.current) {
        setCatalog(next);
        setAuthoring(true);
        setVersionId(next.drafts[0]?.versionId ?? "");
      }
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof LabClientError ? cause.code : "validation");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const perform = async (request: ContinuationRequest) => {
    if (locked.current || disabled) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const attempt = pendingRef.current ?? structuredClone(request);
    remember(attempt);
    try {
      const sameInspection =
        inspection &&
        inspection.source.runId === attempt.input.source.sourceRunId &&
        inspection.checkpoint.id === attempt.input.source.sourceCheckpointId
          ? inspection
          : null;
      const result = readContinuationReply(
        await transport.send(structuredClone(attempt)),
        attempt,
        catalog,
        sameInspection,
      );
      if (!mounted.current) return;
      setCatalog((current) =>
        mergeContinuation(
          current && sameContinuationSelection(current.source, result.source)
            ? current
            : {
                campaignId,
                source: result.source,
                models: current?.models ?? [],
                drafts: [],
              },
          result,
        ),
      );
      const newer = catalog?.drafts.find(
        (d) => d.id === result.draft.id && d.version > result.draft.version,
      );
      setVersionId(newer?.versionId ?? result.draft.versionId);
      setAuthoring(true);
      remember(null);
      setNotice(result.run ? "prepared" : "saved");
      if (result.run) onPrepared(result.run);
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
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!catalog || !inspection || !selectedModel || frozen) return;
    try {
      void perform(
        continuationInterpretAttempt(catalog, inspection, premise, {
          providerId: "openai",
          modelId: selectedModel.modelId,
          reasoning: selectedReasoning,
        }),
      );
    } catch {
      setError("validation");
    }
  };
  const draftCommand = (action: "approve" | "retry_interpret") => {
    if (!catalog || !selectedDraft || frozen) return;
    try {
      void perform(
        continuationDraftAttempt(action, catalog, selectedDraft.versionId),
      );
    } catch {
      setError("validation");
    }
  };
  const errorText =
    error === "conflict"
      ? c.conflict
      : error === "validation"
        ? c.validation
        : c.connection;
  return (
    <details
      className={styles.panel}
      lang={language}
      open={Boolean(inspection || pending || authoring)}
    >
      <summary className={styles.heading}>
        <GitBranch size={18} aria-hidden="true" />
        <h2>{c.title}</h2>
        <span className={styles.badge}>{c.nonCanon}</span>
      </summary>
      <p className={styles.intro}>{c.intro}</p>
      {!campaign.runs.length ? (
        <p className={styles.message}>{c.empty}</p>
      ) : (
        <details className={styles.source} open={!inspection}>
          <summary>{c.sourceSelection}</summary>
          <fieldset disabled={frozen} className={styles.fields}>
            <label>
              {c.sourceRun}
              <select
                value={selectedRun?.id ?? ""}
                onChange={(e) => {
                  setRunId(e.target.value);
                  setCheckpointId("");
                  clearSource();
                }}
              >
                {campaign.runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {c.checkpoint}
              <select
                value={selectedCheckpoint?.id ?? ""}
                onChange={(e) => {
                  setCheckpointId(e.target.value);
                  clearSource();
                }}
              >
                {selectedRun?.checkpoints.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.ordinal + 1} · {labWorldTime(p.worldMinutes, language)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={styles.secondary}
              type="button"
              disabled={!selectedCheckpoint}
              onClick={() => void inspect()}
            >
              {busy && !pending ? c.inspecting : c.inspect}
            </button>
          </fieldset>
        </details>
      )}
      <div aria-live="polite" aria-atomic="true">
        {pending ? (
          <div className={styles.message} role="status">
            <p>{busy ? c.saving : c.pending}</p>
            {!busy && (
              <button
                className={styles.primary}
                disabled={disabled}
                onClick={() => void perform(pending)}
              >
                {c.retry}
              </button>
            )}
          </div>
        ) : error ? (
          <p className={styles.message} role="alert">
            {errorText}
          </p>
        ) : notice ? (
          <p className={styles.success}>
            {notice === "prepared" ? c.prepared : c.saved}
          </p>
        ) : null}
      </div>
      {inspection && (
        <article className={styles.inspection}>
          <h3>{c.recorded}</h3>
          <p className={styles.basis}>
            {inspection.source.label} · #{inspection.checkpoint.ordinal + 1} ·{" "}
            {labWorldTime(inspection.checkpoint.worldMinutes, language)}
          </p>
          <p>{inspection.checkpoint.summary}</p>
          {inspection.checkpoint.events.length ? (
            <ol className={styles.events}>
              {inspection.checkpoint.events.map((e) => (
                <li key={e.id}>
                  <time>{labWorldTime(e.worldMinutes, language)}</time>
                  <p>{e.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.muted}>{c.noEvents}</p>
          )}
          <p className={styles.muted}>{c.sourceHelp}</p>
          {!inspection.eligible ? (
            <p className={styles.message}>{c.blocked}</p>
          ) : (
            !authoring && (
              <button
                className={styles.primary}
                disabled={frozen}
                onClick={() => void loadProposals()}
              >
                {c.choose}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            )
          )}
        </article>
      )}
      {authoring && catalog && (
        <div className={styles.authoring}>
          <div className={styles.tools}>
            <label>
              {c.drafts}
              <select
                value={selectedDraft?.versionId ?? ""}
                disabled={frozen}
                onChange={(e) => setVersionId(e.target.value)}
              >
                <option value="">{c.newProposal}</option>
                {catalog.drafts.map((d) => (
                  <option key={d.versionId} value={d.versionId}>
                    {d.proposal.review?.title ??
                      d.proposal.premise.slice(0, 80)}{" "}
                    · v{d.version}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={styles.secondary}
              disabled={frozen || !inspection}
              onClick={() => void loadProposals()}
            >
              <RefreshCw size={14} aria-hidden="true" />
              {c.refresh}
            </button>
          </div>
          {selectedDraft ? (
            <>
              <h3>{c.review}</h3>
              <p className={styles.basis}>
                {selectedDraft.base.label} ·{" "}
                {labWorldTime(selectedDraft.base.worldMinutes, language)}
              </p>
              <p>{selectedDraft.proposal.premise}</p>
              {selectedDraft.proposal.review ? (
                <ReviewEditor
                  key={selectedDraft.versionId}
                  draft={selectedDraft}
                  catalog={catalog}
                  language={language}
                  frozen={frozen}
                  onApprove={() => draftCommand("approve")}
                  onSave={(review, model) => {
                    try {
                      void perform(
                        continuationDraftAttempt(
                          "edit",
                          catalog,
                          selectedDraft.versionId,
                          { review, model },
                        ),
                      );
                    } catch {
                      setError("validation");
                    }
                  }}
                />
              ) : (
                <div className={styles.message}>
                  <p>{c.requested}</p>
                  <button
                    className={styles.primary}
                    disabled={frozen}
                    onClick={() => draftCommand("retry_interpret")}
                  >
                    {c.retryInterpret}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={submit}>
              <fieldset className={styles.premise} disabled={frozen}>
                <label>
                  {c.whatIf}
                  <textarea
                    rows={4}
                    value={premise}
                    maxLength={6000}
                    placeholder={c.placeholder}
                    onChange={(e) => setPremise(e.target.value)}
                    required
                    aria-describedby={costId}
                  />
                </label>
                <details className={styles.options}>
                  <summary>{c.settings}</summary>
                  <div className={styles.fields}>
                    <label>
                      {c.model}
                      <select
                        value={selectedModel?.modelId ?? ""}
                        onChange={(e) => {
                          setModelId(e.target.value);
                          setReasoning("");
                        }}
                        required
                      >
                        {!selectedModel && <option value="">—</option>}
                        {catalog.models.map((m) => (
                          <option
                            key={m.modelId}
                            value={m.modelId}
                            disabled={!m.available}
                          >
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {c.reasoning}
                      <select
                        value={selectedReasoning}
                        onChange={(e) => setReasoning(e.target.value)}
                        required
                      >
                        {selectedModel?.reasoning.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </details>
                <button
                  className={styles.primary}
                  type="submit"
                  disabled={
                    !selectedModel?.available ||
                    !premise.trim() ||
                    !inspection?.eligible
                  }
                >
                  {c.interpret}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <p className={styles.muted} id={costId}>
                  {c.cost}
                </p>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </details>
  );
}

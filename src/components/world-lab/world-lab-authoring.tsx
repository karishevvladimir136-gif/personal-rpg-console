"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Check, RefreshCw, Sparkles } from "lucide-react";
import type {
  LabCatalog,
  PublicLabRun,
} from "../../lib/world-lab/contracts.ts";
import type {
  LabAuthoringCatalog,
  LabAuthoringRequest,
  LabCompositionItem,
  LabModelSelection,
} from "../../lib/world-lab/authoring-contracts.ts";
import type { CompositionReview } from "../../lib/world-lab/composition-public.ts";
import {
  parseCompositionReview,
  confirmCompositionTiming,
  compositionTimingConfirmed,
} from "../../lib/world-lab/composition-validation.ts";
import { LabClientError, requireValue } from "./client.ts";
import {
  compositionAttempt,
  createAuthoringTransport,
  editAttempt,
  interpretAttempt,
  mergeComposition,
  pendingAuthoringKey,
  readAuthoringCatalog,
  readAuthoringReply,
  restoreAuthoringAttempt,
} from "./authoring-client.ts";
import type { AuthoringTransport } from "./authoring-client.ts";
import { authoringText } from "./authoring-text.ts";
import { labWorldTime } from "./text.ts";
import styles from "./world-lab.module.css";

type Props = {
  campaignId: string;
  language: "en" | "ru";
  campaign: LabCatalog;
  initialCatalog?: LabAuthoringCatalog;
  transport?: AuthoringTransport;
  disabled: boolean;
  onPendingChange: (value: boolean) => void;
  onPrepared: (run: PublicLabRun) => void;
};
function initial(value: LabAuthoringCatalog | undefined) {
  try {
    return value ? readAuthoringCatalog(value) : null;
  } catch {
    return null;
  }
}

export function WorldLabAuthoring({
  campaignId,
  language,
  campaign,
  initialCatalog,
  transport: injected,
  disabled,
  onPendingChange,
  onPrepared,
}: Props) {
  const c = authoringText(language),
    transport = useMemo(
      () => injected ?? createAuthoringTransport(language),
      [injected, language],
    );
  const [catalog, setCatalog] = useState(() => initial(initialCatalog));
  const [selectedVersion, setSelectedVersion] = useState(
    () => initial(initialCatalog)?.drafts[0]?.versionId ?? "",
  );
  const [premise, setPremise] = useState("");
  const [saveId, setSaveId] = useState("");
  const [modelId, setModelId] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<LabAuthoringRequest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pendingRef = useRef<LabAuthoringRequest | null>(null),
    locked = useRef(false),
    mounted = useRef(true);
  const remember = useCallback(
    (request: LabAuthoringRequest | null) => {
      pendingRef.current = request;
      setPending(request);
      try {
        if (request)
          sessionStorage.setItem(
            pendingAuthoringKey(campaignId),
            JSON.stringify(request),
          );
        else sessionStorage.removeItem(pendingAuthoringKey(campaignId));
      } catch {
        /* Exact in-memory request remains recoverable. */
      }
    },
    [campaignId],
  );
  useEffect(() => {
    mounted.current = true;
    Promise.resolve().then(() => {
      if (!mounted.current) return;
      try {
        const value = restoreAuthoringAttempt(
          sessionStorage.getItem(pendingAuthoringKey(campaignId)),
          campaignId,
        );
        if (value) {
          pendingRef.current = value;
          setPending(value);
        }
      } catch {
        /* Storage may be unavailable. */
      }
    });
    return () => {
      mounted.current = false;
    };
  }, [campaignId]);
  useEffect(() => {
    onPendingChange(busy || pending !== null);
  }, [busy, pending, onPendingChange]);
  useEffect(() => {
    if (initial(initialCatalog)) return;
    const controller = new AbortController();
    transport
      .load(campaignId, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setCatalog(readAuthoringCatalog(value));
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("unavailable");
      });
    return () => controller.abort();
  }, [campaignId, initialCatalog, transport]);
  const refresh = async () => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const value = readAuthoringCatalog(await transport.load(campaignId));
      if (mounted.current) {
        const previous = catalog?.drafts.find(
          (d) => d.versionId === selectedVersion,
        );
        const latest = previous
          ? value.drafts
              .filter((d) => d.id === previous.id)
              .sort((a, b) => b.version - a.version)[0]
          : null;
        setCatalog(value);
        if (latest) setSelectedVersion(latest.versionId);
      }
    } catch {
      if (mounted.current) setError("unavailable");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const perform = async (request: LabAuthoringRequest) => {
    if (locked.current || disabled) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const attempt = pendingRef.current ?? structuredClone(request);
    remember(attempt);
    try {
      const result = readAuthoringReply(
        await transport.send(structuredClone(attempt)),
        attempt,
        catalog,
      );
      if (!mounted.current) return;
      setCatalog((current) =>
        mergeComposition(current ?? { models: [], drafts: [] }, result.draft),
      );
      const newer = catalog?.drafts.find(
        (d) => d.id === result.draft.id && d.version > result.draft.version,
      );
      setSelectedVersion(newer?.versionId ?? result.draft.versionId);
      remember(null);
      setNotice(
        attempt.action === "approve"
          ? "prepared"
          : attempt.action === "edit"
            ? "saved"
            : "",
      );
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
  const frozen = disabled || busy || pending !== null;
  const selected = catalog?.drafts.find((d) => d.versionId === selectedVersion);
  const offeredModel =
    catalog?.models.find((m) => m.modelId === modelId) ??
    catalog?.models.find((m) => m.available);
  const selectedReasoning =
    reasoning && offeredModel?.reasoning.includes(reasoning)
      ? reasoning
      : offeredModel?.reasoning.includes("max")
        ? "max"
        : (offeredModel?.reasoning.at(-1) ?? "");
  const selectedBase =
    campaign.bases.find((b) => b.saveId === saveId) ?? campaign.bases[0];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (frozen || !catalog || !selectedBase || !offeredModel) return;
    try {
      void perform(
        interpretAttempt(campaign, catalog, {
          saveId: selectedBase.saveId,
          premise: premise.trim(),
          model: {
            providerId: "openai",
            modelId: offeredModel.modelId,
            reasoning: selectedReasoning,
          },
        }),
      );
    } catch {
      setError("validation");
    }
  };
  const command = (action: "approve" | "retry_interpret") => {
    if (!selected || !catalog || frozen) return;
    try {
      void perform(compositionAttempt(action, campaignId, catalog, selected));
    } catch {
      setError("validation");
    }
  };
  const errorText =
    error === "conflict"
      ? c.conflict
      : error === "validation"
        ? c.validation
        : ["unauthenticated", "forbidden"].includes(error)
          ? c.authentication
          : c.connection;
  return (
    <section className={styles.authoring} aria-label={c.whatIf}>
      {!catalog ? (
        <div className={styles.authoringLoading}>
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
          <div className={styles.authoringTop}>
            <div className={styles.sectionLabel}>
              <Sparkles size={15} aria-hidden="true" />
              <span>{selected ? c.review : c.whatIf}</span>
            </div>
            {selected && (
              <button
                className={styles.primary}
                type="button"
                disabled={frozen}
                onClick={() => {
                  setSelectedVersion("");
                  setNotice("");
                  setError("");
                }}
              >
                {c.newProposal}
              </button>
            )}
            {catalog.drafts.length > 0 && (
              <label className={styles.draftPicker}>
                <span>{c.drafts}</span>
                <select
                  value={selectedVersion}
                  onChange={(e) => {
                    setSelectedVersion(e.target.value);
                    setNotice("");
                    setError("");
                  }}
                  disabled={frozen}
                >
                  <option value="">{c.newProposal}</option>
                  {catalog.drafts.map((d) => (
                    <option value={d.versionId} key={d.versionId}>
                      {d.proposal.review?.title ??
                        d.proposal.premise.slice(0, 70)}{" "}
                      · {c.revision} {d.version}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div aria-live="polite" aria-atomic="true">
            {pending ? (
              <div className={styles.message} role="status">
                <p>
                  {busy
                    ? ["interpret", "retry_interpret"].includes(pending.action)
                      ? c.interpreting
                      : c.saving
                    : c.pending}
                </p>
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
              <div className={styles.message} role="alert">
                <p>{errorText}</p>
                <button
                  className={styles.secondary}
                  disabled={busy || disabled}
                  onClick={() => void refresh()}
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  {c.refresh}
                </button>
              </div>
            ) : notice ? (
              <p className={styles.success}>
                {notice === "prepared" ? c.prepared : c.saved}
              </p>
            ) : null}
          </div>
          {!selected ? (
            <>
              <h2 className={styles.premiseHeading}>{c.whatIf}</h2>
              <p className={styles.authoringIntro}>{c.introduction}</p>
              {!campaign.bases.length ? (
                <p className={styles.message}>{c.noBase}</p>
              ) : (
                <form onSubmit={submit}>
                  <fieldset
                    className={`${styles.fields} ${styles.authoringFields}`}
                    disabled={frozen}
                  >
                    <label className={styles.premiseInput}>
                      <span className={styles.srOnly}>{c.whatIf}</span>
                      <textarea
                        value={premise}
                        onChange={(e) => setPremise(e.target.value)}
                        maxLength={6000}
                        rows={4}
                        placeholder={c.placeholder}
                        required
                        aria-describedby="lab-interpret-cost"
                      />
                    </label>
                    <p className={styles.basisLine}>
                      {c.savedBasis}: {selectedBase?.label}
                    </p>
                    <details className={styles.options}>
                      <summary>{c.settings}</summary>
                      <div className={styles.formGrid}>
                        <label>
                          {c.base}
                          <select
                            value={selectedBase?.saveId ?? ""}
                            onChange={(e) => setSaveId(e.target.value)}
                          >
                            {campaign.bases.map((b) => (
                              <option key={b.saveId} value={b.saveId}>
                                {b.label} ·{" "}
                                {labWorldTime(b.worldMinutes, language)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <ModelFields
                          language={language}
                          models={catalog.models}
                          modelId={offeredModel?.modelId ?? ""}
                          reasoning={selectedReasoning}
                          onModel={(id) => {
                            setModelId(id);
                            setReasoning("");
                          }}
                          onReasoning={setReasoning}
                        />
                      </div>
                    </details>
                    {!offeredModel?.available && (
                      <p className={styles.message}>{c.modelEmpty}</p>
                    )}
                    <div className={styles.authoringAction}>
                      <button
                        className={styles.primary}
                        type="submit"
                        disabled={!offeredModel?.available || !premise.trim()}
                      >
                        {busy ? c.interpreting : c.interpret}
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                      <p className={styles.cost} id="lab-interpret-cost">
                        {c.interpretCost}
                      </p>
                    </div>
                  </fieldset>
                </form>
              )}
            </>
          ) : (
            <>
              <div className={styles.reviewHeading}>
                <div>
                  <h2>{c.review}</h2>
                  <p>
                    {c.revision} {selected.version} ·{" "}
                    {selected.proposal.phase === "approved"
                      ? c.approved
                      : selected.proposal.phase === "requested"
                        ? c.requested
                        : selected.proposal.ownerEdited
                          ? c.ownerEdited
                          : c.review}
                  </p>
                </div>
                <span className={styles.nonCanon}>
                  {language === "ru" ? "НЕ КАНОН" : "NON-CANON"}
                </span>
              </div>
              <div className={styles.basisLine}>
                <span>{c.savedBasis}</span>
                <strong>{selected.base.label}</strong>
                <span>
                  {labWorldTime(selected.base.worldMinutes, language)}
                </span>
              </div>
              <details className={styles.originalPremise}>
                <summary>{c.original}</summary>
                <p>{selected.proposal.premise}</p>
              </details>
              {selected.proposal.review ? (
                <ReviewEditor
                  key={selected.versionId}
                  draft={selected}
                  catalog={catalog}
                  language={language}
                  frozen={frozen}
                  onApprove={() => command("approve")}
                  onSave={(review, selection) => {
                    try {
                      void perform(
                        editAttempt(
                          campaignId,
                          catalog,
                          selected,
                          review,
                          selection,
                        ),
                      );
                    } catch {
                      setError("validation");
                    }
                  }}
                />
              ) : (
                <div className={styles.message}>
                  <p>{c.retryHelp}</p>
                  <p>
                    {c.selected}: {selected.proposal.selectedModel.modelId} ·{" "}
                    {selected.proposal.selectedModel.reasoning}
                  </p>
                  <button
                    className={styles.primary}
                    disabled={frozen}
                    onClick={() => command("retry_interpret")}
                  >
                    {c.retryInterpret}
                  </button>
                </div>
              )}
            </>
          )}
          <details className={styles.scope}>
            <summary>{c.scope}</summary>
            <p>{c.scopeHelp}</p>
          </details>
        </>
      )}
    </section>
  );
}

function ModelFields({
  language,
  models,
  modelId,
  reasoning,
  onModel,
  onReasoning,
}: {
  language: "en" | "ru";
  models: LabAuthoringCatalog["models"];
  modelId: string;
  reasoning: string;
  onModel: (value: string) => void;
  onReasoning: (value: string) => void;
}) {
  const c = authoringText(language),
    offered = models.find((m) => m.modelId === modelId);
  return (
    <div className={styles.modelFields}>
      <label>
        {c.model}
        <select
          value={modelId}
          onChange={(e) => onModel(e.target.value)}
          required
        >
          {!offered && (
            <option value={modelId}>{modelId || c.unavailable}</option>
          )}
          {models.map((m) => (
            <option key={m.modelId} value={m.modelId} disabled={!m.available}>
              {m.label}
              {m.available ? "" : ` · ${c.unavailable}`}
            </option>
          ))}
        </select>
      </label>
      <label>
        {c.reasoning}
        <select
          value={reasoning}
          onChange={(e) => onReasoning(e.target.value)}
          required
        >
          {!offered?.reasoning.includes(reasoning) && (
            <option value={reasoning}>{reasoning || "—"}</option>
          )}
          {offered?.reasoning.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

type ReviewForm = Omit<
  CompositionReview,
  | "assumptions"
  | "constraints"
  | "unchangedBaseline"
  | "offsetMinutes"
  | "horizonMinutes"
  | "ambiguityAnswers"
> & {
  assumptions: string;
  constraints: string;
  unchangedBaseline: string;
  offsetMinutes: string;
  horizonMinutes: string;
  ambiguityAnswers: string[];
};
export function compositionReviewForm(
  review: CompositionReview,
  unresolvedLegacyTiming = false,
): ReviewForm {
  return {
    ...structuredClone(review),
    offsetMinutes: unresolvedLegacyTiming
      ? ""
      : String(review.offsetMinutes ?? ""),
    horizonMinutes: unresolvedLegacyTiming
      ? ""
      : String(review.horizonMinutes ?? ""),
    ...(unresolvedLegacyTiming ? { timingReview: null } : {}),
    assumptions: review.assumptions.join("\n"),
    constraints: review.constraints.join("\n"),
    unchangedBaseline: review.unchangedBaseline.join("\n"),
    ambiguityAnswers: review.ambiguityAnswers.map((a) => a ?? ""),
  };
}
export function compositionReviewFromForm(form: ReviewForm): CompositionReview {
  requireValue(
    /^\d*$/.test(form.offsetMinutes) && /^\d*$/.test(form.horizonMinutes),
  );
  const lines = (value: string) =>
    value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  return parseCompositionReview({
    ...form,
    offsetMinutes:
      form.offsetMinutes === "" ? null : Number(form.offsetMinutes),
    horizonMinutes:
      form.horizonMinutes === "" ? null : Number(form.horizonMinutes),
    assumptions: lines(form.assumptions),
    constraints: lines(form.constraints),
    unchangedBaseline: lines(form.unchangedBaseline),
    ambiguityAnswers: form.ambiguityAnswers.map((a) => a.trim() || null),
  });
}
export function ReviewEditor({
  draft,
  catalog,
  language,
  frozen,
  onSave,
  onApprove,
}: {
  draft: LabCompositionItem;
  catalog: LabAuthoringCatalog;
  language: "en" | "ru";
  frozen: boolean;
  onSave: (review: CompositionReview, model: LabModelSelection) => void;
  onApprove: () => void;
}) {
  const c = authoringText(language),
    proposal = draft.proposal,
    saved = proposal.review!;
  const savedForm = compositionReviewForm(
    saved,
    proposal.phase === "review" &&
      proposal.ambiguities.some((a) => a.consequential) &&
      !Object.hasOwn(saved, "timingReview"),
  );
  const [form, setForm] = useState(() => savedForm);
  const [modelId, setModelId] = useState(proposal.selectedModel.modelId),
    [reasoning, setReasoning] = useState(
      proposal.selectedModel.reasoning ?? "",
    );
  const update = <K extends keyof ReviewForm>(key: K, value: ReviewForm[K]) =>
    setForm((current) => ({
      ...current,
      [key]: value,
      ...([
        "timingText",
        "offsetMinutes",
        "horizonMinutes",
        "ambiguityAnswers",
      ].includes(key)
        ? { timingReview: null }
        : {}),
    }));
  let parsed: CompositionReview | null = null;
  try {
    parsed = compositionReviewFromForm(form);
  } catch {
    /* Incomplete owner input stays editable and unsaved. */
  }
  const available = catalog.models.find(
    (m) =>
      m.modelId === modelId && m.available && m.reasoning.includes(reasoning),
  );
  const dirty =
    JSON.stringify(form) !== JSON.stringify(savedForm) ||
    modelId !== proposal.selectedModel.modelId ||
    reasoning !== proposal.selectedModel.reasoning;
  const toggle = (
    key: "affectedActorIndexes" | "affectedThreadIndexes",
    index: number,
  ) =>
    update(
      key,
      form[key].includes(index)
        ? form[key].filter((i) => i !== index)
        : [...form[key], index].sort((a, b) => a - b),
    );
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (parsed && dirty && available && !frozen)
      onSave(parsed, { providerId: "openai", modelId, reasoning });
  };
  return (
    <form onSubmit={save}>
      <fieldset
        className={`${styles.fields} ${styles.reviewFields}`}
        disabled={frozen}
      >
        <div className={styles.formGrid}>
          <label>
            {c.title}
            <input
              value={form.title}
              maxLength={160}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </label>
          <label>
            {c.divergenceType}
            <select
              value={form.divergenceType}
              onChange={(e) =>
                update(
                  "divergenceType",
                  e.target.value as CompositionReview["divergenceType"],
                )
              }
            >
              {Object.entries(c.types).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          {c.change}
          <textarea
            rows={3}
            maxLength={3000}
            value={form.changeDescription}
            onChange={(e) => update("changeDescription", e.target.value)}
            required
          />
        </label>
        <div className={styles.formGrid}>
          <label>
            {c.timing}
            <input
              value={form.timingText}
              maxLength={500}
              onChange={(e) => update("timingText", e.target.value)}
              required
            />
          </label>
          <label>
            {c.offset}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={43200}
              step={1}
              value={form.offsetMinutes}
              onChange={(e) => update("offsetMinutes", e.target.value)}
              placeholder={c.unspecified}
            />
          </label>
          <label>
            {c.location}
            <select
              value={
                form.locationIndex === null ? "" : String(form.locationIndex)
              }
              onChange={(e) =>
                update(
                  "locationIndex",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            >
              <option value="">{c.unspecified}</option>
              {proposal.choices.locations.map((l, i) => (
                <option key={i} value={i}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {c.horizon}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={43200}
              step={1}
              value={form.horizonMinutes}
              onChange={(e) => update("horizonMinutes", e.target.value)}
              placeholder={c.unspecified}
            />
          </label>
        </div>
        <p className={styles.hint}>{c.horizonHelp}</p>
        <p className={styles.hint}>{c.timingHelp}</p>
        <div className={styles.formGrid}>
          <div className={styles.choiceGroup}>
            <h3>{c.actors}</h3>
            {proposal.choices.actors.length ? (
              proposal.choices.actors.map((a, i) => (
                <label className={styles.checkChoice} key={i}>
                  <input
                    type="checkbox"
                    checked={form.affectedActorIndexes.includes(i)}
                    onChange={() => toggle("affectedActorIndexes", i)}
                  />
                  <span>
                    {a.label}
                    {a.control === "player" && <small>{c.player}</small>}
                  </span>
                </label>
              ))
            ) : (
              <p className={styles.hint}>{c.noActors}</p>
            )}
          </div>
          <div className={styles.choiceGroup}>
            <h3>{c.threads}</h3>
            {proposal.choices.threads.length ? (
              proposal.choices.threads.map((t, i) => (
                <label className={styles.checkChoice} key={i}>
                  <input
                    type="checkbox"
                    checked={form.affectedThreadIndexes.includes(i)}
                    onChange={() => toggle("affectedThreadIndexes", i)}
                  />
                  <span>{t.label}</span>
                </label>
              ))
            ) : (
              <p className={styles.hint}>{c.noThreads}</p>
            )}
          </div>
        </div>
        <div className={styles.formGrid}>
          {(["assumptions", "constraints", "unchangedBaseline"] as const).map(
            (field) => (
              <label key={field}>
                {field === "unchangedBaseline" ? c.baseline : c[field]}
                <textarea
                  rows={3}
                  maxLength={16_015}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                />
              </label>
            ),
          )}
        </div>
        <p className={styles.hint}>{c.onePerLine}</p>
        {proposal.ambiguities.length > 0 && (
          <div className={styles.ambiguities}>
            <h3>{c.ambiguities}</h3>
            <p className={styles.hint}>{c.ambiguityHelp}</p>
            {proposal.ambiguities.map((a, i) => (
              <label key={i}>
                {a.question}
                {!a.consequential && <small>{c.optional}</small>}
                <textarea
                  rows={2}
                  value={form.ambiguityAnswers[i]}
                  maxLength={1000}
                  placeholder={c.answer}
                  onChange={(e) =>
                    update(
                      "ambiguityAnswers",
                      form.ambiguityAnswers.map((answer, n) =>
                        n === i ? e.target.value : answer,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
        )}
        <label className={styles.checkChoice}>
          <input
            type="checkbox"
            checked={parsed !== null && compositionTimingConfirmed(parsed)}
            disabled={
              !parsed ||
              parsed.offsetMinutes === null ||
              parsed.horizonMinutes === null ||
              parsed.offsetMinutes >= parsed.horizonMinutes ||
              proposal.ambiguities.some(
                (a, i) => a.consequential && !parsed?.ambiguityAnswers[i],
              )
            }
            onChange={(e) =>
              update(
                "timingReview",
                e.target.checked && parsed
                  ? confirmCompositionTiming(parsed)
                  : null,
              )
            }
          />
          <span>{c.confirmTiming}</span>
        </label>
        <details className={styles.options}>
          <summary>{c.modelSettings}</summary>
          <div className={styles.formGrid}>
            <ModelFields
              language={language}
              models={catalog.models}
              modelId={modelId}
              reasoning={reasoning}
              onModel={(id) => {
                setModelId(id);
                const offered = catalog.models.find((m) => m.modelId === id);
                if (!offered?.reasoning.includes(reasoning))
                  setReasoning(
                    offered?.reasoning.includes("max")
                      ? "max"
                      : (offered?.reasoning.at(-1) ?? ""),
                  );
              }}
              onReasoning={setReasoning}
            />
            <div className={styles.policyReadOnly}>
              <h3>{c.policy}</h3>
              <p>
                {c.simulationOn} · {c.autonomy}:{" "}
                {c.autonomyValues[proposal.choices.policy.autonomy]} ·{" "}
                {c.deadlines}:{" "}
                {c.deadlineValues[proposal.choices.policy.deadlinePressure]}
              </p>
              <p className={styles.hint}>{c.policyHelp}</p>
            </div>
          </div>
        </details>
        {!available && <p className={styles.message}>{c.modelEmpty}</p>}
        {proposal.blockers.length > 0 && (
          <ul className={styles.blockers}>
            {proposal.blockers.map((blocker) => (
              <li key={blocker}>{c.blockers[blocker]}</li>
            ))}
          </ul>
        )}
        {dirty && (
          <p className={styles.hint} role="status">
            {c.unsaved}
          </p>
        )}
        <div className={styles.actions}>
          <button
            className={styles.secondary}
            type="submit"
            disabled={!dirty || parsed === null || !available}
          >
            {c.save}
          </button>
          <button
            className={styles.primary}
            type="button"
            onClick={onApprove}
            disabled={
              dirty ||
              proposal.phase !== "review" ||
              proposal.blockers.length > 0 ||
              !available
            }
          >
            <Check size={15} aria-hidden="true" />
            {c.approve}
          </button>
        </div>
        <p className={styles.hint}>{c.approvalHelp}</p>
      </fieldset>
      <details className={styles.sourceBasis}>
        <summary>{c.evidence}</summary>
        <p className={styles.hint}>{c.evidenceHelp}</p>
        {proposal.statements.length ? (
          <ul>
            {proposal.statements.map((s, i) => (
              <li key={i}>
                <div className={styles.sourceTags}>
                  <span>{c[s.origin]}</span>
                  <span>{c[s.knowledge]}</span>
                </div>
                <p>{s.text}</p>
                {s.actorIndexes.length > 0 && (
                  <small>
                    {c.knownBy}:{" "}
                    {s.actorIndexes
                      .map((n) => proposal.choices.actors[n].label)
                      .join(", ")}
                  </small>
                )}
                {s.uncertainty && (
                  <p className={styles.hint}>
                    {c.uncertainty}: {s.uncertainty}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.hint}>{c.noStatements}</p>
        )}
        {proposal.usage && (
          <p className={styles.usage}>
            {c.usage}:{" "}
            {new Intl.NumberFormat(language).format(proposal.usage.inputTokens)}{" "}
            {c.inputTokens} ·{" "}
            {new Intl.NumberFormat(language).format(
              proposal.usage.outputTokens,
            )}{" "}
            {c.outputTokens}
          </p>
        )}
      </details>
    </form>
  );
}

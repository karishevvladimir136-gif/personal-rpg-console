"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Panel } from "./ui";
import type {
  CampaignProductionSettings,
  ConfigureProductionInput,
  ProviderSettings,
} from "@/lib/production/configuration-contracts";
import type { ModelSelection, RuntimeTask } from "@/lib/production/contracts";
import type { TimelineFence } from "@/lib/saves/contracts";
import { sameTimeline } from "@/lib/saves/fence";
import {
  createProductionAttempt,
  effectiveSelection,
  loadProductionSettings,
  loadProviderSettings,
  ProductionClientError,
  productionDraft,
  productionScopeMatches,
  productionTasks,
  sameProductionDraft,
  saveProductionSettings,
  selectableRulesets,
  type ProductionDraft,
} from "@/lib/production-client";
import { wave2ConfigText } from "@/lib/locales/wave2-config";
import styles from "./production-settings.module.css";

function Status({ value }: { value: ProviderSettings["globalDefaultStatus"] }) {
  const { language } = useLanguage();
  const c = wave2ConfigText(language);
  return (
    <span
      className={`${styles.status} ${value === "unavailable" ? styles.unavailable : ""}`}
    >
      {value === "unavailable" ? c.unavailable : c.configured}
    </span>
  );
}

/** initialData/load let synthetic previews use the same UI without authentication bypasses. */
export function AIProviderSettings({
  initialData,
  load,
}: {
  initialData?: ProviderSettings;
  load?: () => Promise<ProviderSettings>;
} = {}) {
  const { language } = useLanguage();
  const c = wave2ConfigText(language);
  const [data, setData] = useState(initialData ?? null);
  const [busy, setBusy] = useState(!initialData);
  const [error, setError] = useState(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setBusy(true);
    setError(false);
    try {
      const result = await (load
        ? load()
        : initialData
          ? Promise.resolve(initialData)
          : loadProviderSettings());
      if (request === generation.current) setData(result);
    } catch {
      if (request === generation.current) setError(true);
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }, [initialData, load]);
  useEffect(() => {
    const lifecycle = generation;
    const request = ++generation.current;
    if (!initialData) {
      void (load ? load() : loadProviderSettings())
        .then((next) => {
          if (request === generation.current) {
            setData(next);
            setError(false);
          }
        })
        .catch(() => {
          if (request === generation.current) setError(true);
        })
        .finally(() => {
          if (request === generation.current) setBusy(false);
        });
    }
    return () => {
      lifecycle.current++;
    };
  }, [initialData, load]);
  return (
    <Panel className={styles.settings}>
      <div className={styles.intro}>
        <div>
          <h2>{c.aiTitle}</h2>
          <p>{c.aiIntro}</p>
        </div>
        <Badge>OpenAI</Badge>
      </div>
      {busy && <p role="status">{c.loading}</p>}
      {error && <p role="alert">{c.loadError}</p>}
      {data && (
        <div>
          <h3>{c.providers}</h3>
          {data.providers.map((provider) => (
            <div className={styles.provider} key={provider.id}>
              <strong>{provider.label}</strong>
              <Status value={provider.status} />
            </div>
          ))}
          <p className="muted">{c.statusHelp}</p>
          <div className={styles.default}>
            <h3>{c.globalDefault}</h3>
            <p>
              {data.globalDefault
                ? `${data.globalDefault.modelId} · ${data.globalDefault.reasoning ?? c.modelDefault}`
                : c.noDefault}
            </p>
            <Status value={data.globalDefaultStatus} />
            <p className="muted">{c.campaignHint}</p>
          </div>
          <h3>{c.supported}</h3>
          <div className={styles.choices}>
            {data.models.map((model) => (
              <span
                key={`${model.providerId}/${model.id}`}
                className={styles.choice}
              >
                {model.label}
              </span>
            ))}
          </div>
          <details className={styles.overrides}>
            <summary>{c.setupTitle}</summary>
            <p className="muted">{c.setupIntro}</p>
            <p className="muted">{c.setupSteps}</p>
          </details>
        </div>
      )}
      <div>
        <Button disabled={busy} onClick={() => void refresh()}>
          {error ? c.retryLoad : c.refresh}
        </Button>
      </div>
    </Panel>
  );
}

function ModelChoice({
  label,
  value,
  providers,
  inherited,
  effective,
  onChange,
}: {
  label: string;
  value: ModelSelection | null;
  providers: ProviderSettings;
  inherited: string;
  effective: ReturnType<typeof effectiveSelection>;
  onChange: (value: ModelSelection | null) => void;
}) {
  const { language } = useLanguage();
  const c = wave2ConfigText(language);
  const index = value
    ? providers.models.findIndex(
        (model) =>
          model.providerId === value.providerId && model.id === value.modelId,
      )
    : -1;
  const model = index >= 0 ? providers.models[index] : null;
  const currentValue = value
    ? model
      ? String(index)
      : "unavailable"
    : "inherit";
  return (
    <div className={styles.model}>
      <h4>{label}</h4>
      <label className="field">
        {c.model}
        <select
          aria-label={`${label} — ${c.model}`}
          value={currentValue}
          onChange={(event) => {
            if (event.target.value === "inherit") return onChange(null);
            const selected = providers.models[Number(event.target.value)];
            if (selected)
              onChange({
                providerId: selected.providerId,
                modelId: selected.id,
                reasoning: null,
              });
          }}
        >
          <option value="inherit">{inherited}</option>
          {value && !model && (
            <option value="unavailable" disabled>
              {c.unavailableChoice}: {value.modelId}
            </option>
          )}
          {providers.models.map((row, index) => (
            <option key={`${row.providerId}/${row.id}`} value={index}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
      {value && (
        <label className="field">
          {c.reasoning}
          <select
            aria-label={`${label} — ${c.reasoning}`}
            value={value.reasoning ?? "default"}
            onChange={(event) =>
              onChange({
                ...value,
                reasoning:
                  event.target.value === "default" ? null : event.target.value,
              })
            }
          >
            <option value="default">{c.modelDefault}</option>
            {value.reasoning !== null &&
              !model?.reasoning.includes(value.reasoning) && (
                <option disabled value={value.reasoning}>
                  {c.unavailableChoice}: {value.reasoning}
                </option>
              )}
            {model?.reasoning.map((effort) => (
              <option key={effort} value={effort}>
                {effort}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className={styles.effective}>
        {effective.inheritedFrom === "global"
          ? c.inheritedGlobal
          : effective.inheritedFrom === "campaign"
            ? c.inheritedCampaign
            : c.explicit}
        <br />
        <strong>
          {effective.selection
            ? `${effective.selection.modelId} · ${effective.selection.reasoning ?? c.modelDefault}`
            : c.noDefault}
        </strong>
      </p>
      <Status value={effective.status} />
    </div>
  );
}

/** Isolated editor: only the explicitly allowlisted DTO enters this component. */
export function ProductionSettingsEditor({
  current,
  activeTimeline,
  onSave,
  onRefresh,
  afterSave,
}: {
  current: CampaignProductionSettings;
  activeTimeline: TimelineFence | undefined;
  onSave: (
    input: ConfigureProductionInput,
  ) => Promise<CampaignProductionSettings>;
  onRefresh: () => Promise<unknown>;
  afterSave?: () => Promise<unknown>;
}) {
  const { language } = useLanguage();
  const c = wave2ConfigText(language);
  const [baseline, setBaseline] = useState(current);
  const [draft, setDraft] = useState<ProductionDraft>(() =>
    productionDraft(current),
  );
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [review, setReview] = useState(false);
  const pending = useRef<ConfigureProductionInput | null>(null);
  const lock = useRef(false);
  const scope = useRef(activeTimeline);
  const mounted = useRef(true);
  useEffect(() => {
    scope.current = activeTimeline;
  }, [activeTimeline]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const dirty = !sameProductionDraft(draft, productionDraft(baseline));
  useUnsavedChanges(dirty || uncertain);
  const stale = !productionScopeMatches(
    baseline,
    current.campaignId,
    activeTimeline,
  );
  const changed =
    baseline.revision !== current.revision ||
    baseline.runtimeRevision !== current.runtimeRevision ||
    baseline.headId !== current.headId ||
    !sameTimeline(baseline.timeline, current.timeline);
  const message =
    error === "conflict" || error === "busy" || error === "not_found"
      ? c.conflict
      : error === "validation" ||
          error === "configuration" ||
          error === "not_configured"
        ? c.invalid
        : error === "unauthenticated"
          ? c.signIn
          : error === "forbidden"
            ? c.forbidden
            : error === "load"
              ? c.loadError
              : error === "refresh"
                ? c.savedRefresh
                : error
                  ? c.uncertain
                  : "";
  const edit = (next: ProductionDraft) => {
    setDraft(next);
    setSaved(false);
    setError("");
  };
  const setModel = (selection: ModelSelection | null, task?: RuntimeTask) => {
    const policy = structuredClone(
      draft.runtimePolicy ?? {
        schemaVersion: 1 as const,
        revision: 0,
        primary: null,
        taskOverrides: {},
      },
    );
    if (!task) policy.primary = selection;
    else if (selection) policy.taskOverrides[task] = selection;
    else delete policy.taskOverrides[task];
    edit({
      ...draft,
      runtimePolicy:
        policy.primary || Object.keys(policy.taskOverrides).length
          ? policy
          : null,
    });
  };
  const save = async () => {
    if (lock.current || stale || review || (!uncertain && (changed || !dirty)))
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    setSaved(false);
    pending.current = createProductionAttempt(pending.current, baseline, draft);
    try {
      const result = await onSave(pending.current);
      if (!mounted.current) return;
      if (
        !productionScopeMatches(result, current.campaignId, scope.current) ||
        !sameTimeline(result.timeline, pending.current.timeline)
      ) {
        setError("conflict");
        setReview(true);
        return;
      }
      pending.current = null;
      setUncertain(false);
      setBaseline(result);
      setDraft(productionDraft(result));
      setSaved(true);
      try {
        await afterSave?.();
      } catch {
        if (mounted.current) setError("refresh");
      }
    } catch (cause) {
      if (!mounted.current) return;
      const code =
        cause instanceof ProductionClientError ? cause.code : "unavailable";
      setError(code);
      if (code === "unavailable") setUncertain(true);
      else {
        pending.current = null;
        setUncertain(false);
        setReview(["conflict", "busy", "not_found"].includes(code));
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch {
      setError("load");
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  };
  const taskLabels = {
    "dm.plan": c.plan,
    "dm.narrate": c.narrate,
    "dm.feedback": c.feedback,
    "memory.summary": c.summary,
    "world.resolve": c.resolve,
  };
  const effective = {
    runtimePolicy: draft.runtimePolicy,
    providers: current.providers,
  };
  return (
    <Panel className={styles.settings}>
      <div className={styles.intro}>
        <div>
          <h2>{c.campaignTitle}</h2>
          <p>{c.campaignIntro}</p>
        </div>
        <Badge>
          {draft.ruleset.id === "world-logic-v1" ? c.logic : "Console Basic"}
        </Badge>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset
          className="persistence-fields"
          disabled={busy || uncertain || stale || changed || review}
        >
          <div className={styles.grid}>
            <ModelChoice
              label={c.campaignModel}
              value={draft.runtimePolicy?.primary ?? null}
              providers={current.providers}
              inherited={c.inheritGlobal}
              effective={effectiveSelection(effective)}
              onChange={(value) => setModel(value)}
            />
            <div>
              <h3>{c.globalDefault}</h3>
              <p className={styles.effective}>
                {current.providers.globalDefault
                  ? `${current.providers.globalDefault.modelId} · ${current.providers.globalDefault.reasoning ?? c.modelDefault}`
                  : c.noDefault}
              </p>
              <Status value={current.providers.globalDefaultStatus} />
              <p className="muted">{c.historyHelp}</p>
              <p className="muted">{c.noFallback}</p>
            </div>
          </div>
          <details className={styles.overrides}>
            <summary>{c.overrides}</summary>
            <p className="muted">{c.overridesHelp}</p>
            <div className={styles.grid}>
              {productionTasks.map((task) => (
                <ModelChoice
                  key={task}
                  label={taskLabels[task]}
                  value={draft.runtimePolicy?.taskOverrides[task] ?? null}
                  providers={current.providers}
                  inherited={c.inheritCampaign}
                  effective={effectiveSelection(effective, task)}
                  onChange={(value) => setModel(value, task)}
                />
              ))}
            </div>
          </details>
          <section className={styles.section}>
            <h3>{c.worldTitle}</h3>
            <div className={styles.toggleRow}>
              <div>
                <h4>
                  {c.simulation} · {draft.worldPolicy.simulation ? c.on : c.off}
                </h4>
                <p>{c.simulationHelp}</p>
              </div>
              <button
                type="button"
                className={`toggle ${draft.worldPolicy.simulation ? "on" : ""}`}
                role="switch"
                aria-label={c.simulation}
                aria-checked={draft.worldPolicy.simulation}
                onClick={() =>
                  edit({
                    ...draft,
                    worldPolicy: {
                      ...draft.worldPolicy,
                      simulation: !draft.worldPolicy.simulation,
                    },
                  })
                }
              >
                <span />
              </button>
            </div>
            <div className={styles.grid}>
              <div>
                <label className="field">
                  {c.autonomy}
                  <select
                    value={draft.worldPolicy.autonomy}
                    onChange={(event) =>
                      edit({
                        ...draft,
                        worldPolicy: {
                          ...draft.worldPolicy,
                          autonomy: event.target
                            .value as ProductionDraft["worldPolicy"]["autonomy"],
                        },
                      })
                    }
                  >
                    {(["low", "moderate", "high"] as const).map((value) => (
                      <option key={value} value={value}>
                        {c[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <p>{c.autonomyHelp}</p>
              </div>
              <div>
                <label className="field">
                  {c.deadline}
                  <select
                    value={draft.worldPolicy.deadlinePressure}
                    onChange={(event) =>
                      edit({
                        ...draft,
                        worldPolicy: {
                          ...draft.worldPolicy,
                          deadlinePressure: event.target
                            .value as ProductionDraft["worldPolicy"]["deadlinePressure"],
                        },
                      })
                    }
                  >
                    <option value="off">{c.off}</option>
                    <option value="critical_only">{c.critical}</option>
                    <option value="normal">{c.normal}</option>
                  </select>
                </label>
                <p>{c.deadlineHelp}</p>
              </div>
            </div>
          </section>
          <section className={styles.section}>
            <h3>{c.rulesTitle}</h3>
            <label className="field">
              {c.rulesTitle}
              <select
                value={draft.ruleset.id}
                onChange={(event) => {
                  const ruleset = selectableRulesets.find(
                    (row) => row.id === event.target.value,
                  );
                  if (ruleset) edit({ ...draft, ruleset: { ...ruleset } });
                }}
              >
                <option value="console-basic-v1">{c.basic}</option>
                <option value="world-logic-v1">{c.logic}</option>
              </select>
            </label>
            <p>
              {draft.ruleset.id === "world-logic-v1"
                ? c.logicHelp
                : c.basicHelp}
            </p>
            <p>{c.boundaryHelp}</p>
          </section>
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
          {(review || error === "conflict" || error === "busy") && (
            <Link
              className="text-link"
              href={`/campaigns/${current.campaignId}/game`}
            >
              {c.reviewGame}
            </Link>
          )}
          <div className="button-row">
            <Button
              primary
              type="submit"
              disabled={
                busy ||
                refreshing ||
                stale ||
                review ||
                (!uncertain && (!dirty || changed))
              }
            >
              {busy ? c.saving : uncertain ? c.retry : c.save}
            </Button>
            <Button
              disabled={busy || refreshing || (uncertain && !stale)}
              onClick={() => void refresh()}
            >
              {c.refresh}
            </Button>
            <Button
              disabled={
                busy ||
                refreshing ||
                (uncertain && !stale) ||
                !productionScopeMatches(
                  current,
                  current.campaignId,
                  activeTimeline,
                )
              }
              onClick={() => {
                if ((dirty || uncertain) && !window.confirm(c.discard)) return;
                pending.current = null;
                setUncertain(false);
                setBaseline(current);
                setDraft(productionDraft(current));
                setSaved(false);
                setError("");
                setReview(false);
              }}
            >
              {c.useSaved}
            </Button>
          </div>
          <p role="status">{saved ? c.saved : dirty ? c.dirty : c.idle}</p>
        </div>
      </form>
    </Panel>
  );
}

export function CampaignProductionSettingsPanel({
  campaignId,
  timeline,
  onLoaded,
  afterSave,
}: {
  campaignId: string;
  timeline: TimelineFence | undefined;
  onLoaded?: (settings: CampaignProductionSettings) => void;
  afterSave: () => Promise<unknown>;
}) {
  const { language } = useLanguage();
  const c = wave2ConfigText(language);
  const [data, setData] = useState<CampaignProductionSettings | null>(null);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const generation = ++request.current;
    try {
      const next = await loadProductionSettings(campaignId);
      if (generation !== request.current) return;
      if (!productionScopeMatches(next, campaignId, timeline))
        throw new ProductionClientError("conflict");
      setData(next);
      setError(false);
      onLoaded?.(next);
    } catch (cause) {
      if (generation === request.current) setError(true);
      throw cause;
    }
  }, [campaignId, timeline, onLoaded]);
  useEffect(() => {
    const lifecycle = request;
    request.current++;
    void refresh().catch(() => {});
    return () => {
      lifecycle.current++;
    };
  }, [refresh]);
  return (
    <>
      {error && (
        <Panel>
          <p role="alert">{c.loadError}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {c.retryLoad}
          </Button>
        </Panel>
      )}
      {!data && !error && (
        <Panel>
          <p role="status">{c.loading}</p>
        </Panel>
      )}
      {data && (
        <ProductionSettingsEditor
          current={data}
          activeTimeline={timeline}
          onRefresh={refresh}
          afterSave={afterSave}
          onSave={async (input) => {
            if (!sameTimeline(input.timeline, timeline))
              throw new ProductionClientError("conflict");
            const generation = request.current;
            const saved = await saveProductionSettings(campaignId, input);
            if (
              generation === request.current &&
              productionScopeMatches(saved, campaignId, timeline)
            ) {
              setData(saved);
              onLoaded?.(saved);
            }
            return saved;
          }}
        />
      )}
    </>
  );
}

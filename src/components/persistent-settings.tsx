"use client";
import { FoundationLoopPanel } from "./foundation-loop/foundation-loop";
import { PersistentAdventures } from "./persistent-adventures";
import { PersistentAdventureLoot } from "./persistent-adventure-loot";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import {
  useCampaignData,
  useWorkspaceData,
  useUnsavedChanges,
  useCampaignDraftScope,
  TimelineDraftNotice,
} from "./persistence-context";
import { Badge, Button, Panel } from "./ui";
import { CampaignSettingsEditor } from "./campaign-settings";
import { GameplayConfiguration } from "./gameplay-configuration";
import { CampaignPackSettingsPanel } from "./campaign-pack-settings";
import { CampaignPremisePanel } from "./campaign-premise";
import {
  AIProviderSettings,
  CampaignProductionSettingsPanel,
} from "./production-settings";
import type { CampaignProductionSettings, ProviderSettings } from "@/lib/production/configuration-contracts";
import { DmRuntimeSettingsPanel } from "./dm-runtime-settings";
import { productionScopeMatches } from "@/lib/production-client";
import { wave2ConfigText } from "@/lib/locales/wave2-config";
import { updateCampaignSettings } from "@/lib/campaign-settings";
import { effectiveDmStyle } from "@/lib/campaign-settings";
import { dmStyleChoices, dmStyleKeys } from "./dm-style-controls";
import { languageOptions } from "@/lib/i18n";
import { createMutationAttempt, errorMessage } from "@/lib/persistence/client";
import type {
  Campaign,
  CampaignSnapshot,
  Mutation,
  MutationInput,
  MutationResult,
  Preferences,
} from "@/lib/persistence/contracts";

// Keep one request identity until its payload changes or the server acknowledges it.
function useSave(mutate: (input: Mutation) => Promise<MutationResult>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const attempt = useRef<Mutation | null>(null);
  const busy = useRef(false);
  return {
    saving,
    error,
    saved,
    clearSaved: () => setSaved(false),
    async save(input: MutationInput) {
      if (busy.current) return null;
      busy.current = true;
      setSaving(true);
      setError("");
      setSaved(false);
      attempt.current = createMutationAttempt(attempt.current, input);
      try {
        const result = await mutate(attempt.current);
        attempt.current = null;
        setSaved(true);
        return result;
      } catch (cause) {
        setError(errorMessage(cause));
        return null;
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
  };
}

function PreferenceForm({ current, preview = false }: { current: Preferences; preview?: boolean }) {
  const { t, setLanguage } = useLanguage();
  const { mutate, refresh } = useWorkspaceData();
  const [draft, setDraft] = useState(current);
  const [baseline, setBaseline] = useState(current);
  const state = useSave(mutate);
  const dirty =
    draft.language !== baseline.language ||
    draft.largeText !== baseline.largeText ||
    draft.suggestions !== baseline.suggestions;
  useUnsavedChanges(dirty);
  const newer = current.revision !== baseline.revision;
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (preview) return;
        const result = await state.save({
          operation: "preferences.save",
          expectedRevision: baseline.revision,
          payload: {
            language: draft.language,
            largeText: draft.largeText,
            suggestions: draft.suggestions,
          },
        });
        if (result) {
          const next = { ...draft, revision: result.revision };
          setBaseline(next);
          setDraft(next);
          setLanguage(next.language);
        }
      }}
    >
      <fieldset disabled={state.saving} className="persistence-fields">
        <Panel title={t("General")}>
          <label className="field">
            {t("Interface Language")}
            <select
              value={draft.language}
              onChange={(event) => {
                state.clearSaved();
                setDraft({
                  ...draft,
                  language: event.target.value === "ru" ? "ru" : "en",
                });
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            {t(
              "Saved interface preferences apply across campaigns. Your writing and each campaign’s story language stay unchanged.",
            )}
          </p>
          {(["largeText", "suggestions"] as const).map((key) => (
            <div className="setting-row" key={key}>
              <div>
                <h3>
                  {t(
                    key === "largeText"
                      ? "Larger story text"
                      : "Suggested actions",
                  )}
                </h3>
                <p>
                  {t(
                    key === "largeText"
                      ? "Story text on the game screen is larger."
                      : "Saved for future support. Free-form text is the primary way to play; generated action suggestions are not available yet.",
                  )}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft[key]}
                aria-label={t(
                  key === "largeText"
                    ? "Larger story text"
                    : "Suggested actions",
                )}
                className={`toggle ${draft[key] ? "on" : ""}`}
                onClick={() => {
                  state.clearSaved();
                  setDraft({ ...draft, [key]: !draft[key] });
                }}
              >
                <span />
              </button>
            </div>
          ))}
        </Panel>
        {state.error && <p role="alert">{t(state.error)}</p>}
        {newer && (
          <p role="alert">
            {t(
              "Saved preferences changed elsewhere. Your draft is retained; reload saved values before editing again.",
            )}
          </p>
        )}
        <div className="button-row">
          <Button type="submit" primary disabled={!dirty || newer}>
            {t(state.saving ? "Saving…" : "Save preferences")}
          </Button>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Refresh saved data")}
          </Button>
          <Button
            onClick={() => {
              if (
                !dirty ||
                window.confirm(t("Discard your unsaved changes?"))
              ) {
                setDraft(current);
                setBaseline(current);
                state.clearSaved();
              }
            }}
          >
            {t("Use saved values")}
          </Button>
        </div>
        <p role="status">
          {t(
            dirty
              ? "Unsaved changes"
              : state.saved
                ? "Saved"
                : "Changes take effect after Save.",
          )}
        </p>
      </fieldset>
    </form>
  );
}

/** `preview`: the synthetic Stage 5 preview — sample preferences and provider flags, nothing is read or saved. */
export function PersistentGeneralSettings({ preview }: { preview?: { preferences: Preferences; providers: ProviderSettings } } = {}) {
  const { t } = useLanguage();
  const workspace = useWorkspaceData();
  const { loading, error, refresh } = workspace;
  const data = preview ? { preferences: preview.preferences } : workspace.data;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("MAKE ROOM FOR YOUR STORY")}</span>
          <h1>{t("General Settings")}</h1>
          <p>{t("A few quiet preferences for the road ahead.")}</p>
        </div>
        <Badge>{t("Application preferences")}</Badge>
      </div>
      <Link className="text-link" href="/">
        {t("Back to main menu")}
      </Link>
      {loading && <p role="status">{t("Loading saved preferences…")}</p>}
      {error && (
        <Panel>
          <p role="alert">{t(error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {data && <PreferenceForm current={data.preferences} preview={!!preview} />}
      {data && <AIProviderSettings initialData={preview?.providers} />}
    </>
  );
}

function CampaignIdentityForm({ current }: { current: Campaign }) {
  const { t } = useLanguage();
  const { mutate, refresh } = useCampaignData();
  const scope = useCampaignDraftScope();
  const [draft, setDraft] = useState({
    title: current.title,
    subtitle: current.subtitle,
  });
  const [baseline, setBaseline] = useState(current);
  const state = useSave(mutate);
  const dirty =
    draft.title !== baseline.title || draft.subtitle !== baseline.subtitle;
  useUnsavedChanges(dirty);
  const newer = scope.stale || current.revision !== baseline.revision;
  return (
    <Panel title={t("Campaign basics")}>
      <TimelineDraftNotice stale={scope.stale} />
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await state.save({
            operation: "campaign.save",
            timeline: scope.timeline,
            campaignId: current.id,
            expectedRevision: baseline.revision,
            payload: draft,
          });
          if (result)
            setBaseline({ ...baseline, ...draft, revision: result.revision });
        }}
      >
        <fieldset className="persistence-fields" disabled={state.saving}>
          <label className="field">
            {t("Campaign title")}
            <input
              required
              maxLength={200}
              value={draft.title}
              onChange={(event) => {
                state.clearSaved();
                setDraft({ ...draft, title: event.target.value });
              }}
            />
          </label>
          <label className="field">
            {t("Subtitle")}
            <input
              maxLength={500}
              value={draft.subtitle}
              onChange={(event) => {
                state.clearSaved();
                setDraft({ ...draft, subtitle: event.target.value });
              }}
            />
          </label>
          {state.error && <p role="alert">{t(state.error)}</p>}
          {newer && (
            <p role="alert">
              {t(
                "Campaign details changed elsewhere. Your draft is retained. Refresh and use saved values to review the current record.",
              )}
            </p>
          )}
          <div className="button-row">
            <Button
              type="submit"
              primary
              disabled={!dirty || newer || !draft.title.trim()}
            >
              {t(state.saving ? "Saving…" : "Save campaign details")}
            </Button>
            <Button onClick={() => void refresh().catch(() => {})}>
              {t("Refresh saved data")}
            </Button>
            <Button
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(t("Discard your unsaved changes?"))
                ) {
                  setDraft({
                    title: current.title,
                    subtitle: current.subtitle,
                  });
                  scope.reset();
                  setBaseline(current);
                  state.clearSaved();
                }
              }}
            >
              {t("Use saved values")}
            </Button>
          </div>
          <p role="status">
            {t(
              dirty
                ? "Unsaved changes"
                : state.saved
                  ? "Saved"
                  : "Changes take effect after Save.",
            )}
          </p>
        </fieldset>
      </form>
    </Panel>
  );
}

function CampaignPreferencesForm({
  current,
  production,
}: {
  current: CampaignSnapshot;
  production: CampaignProductionSettings | null;
}) {
  const { t, language } = useLanguage();
  const configText = wave2ConfigText(language);
  const { mutate, refresh } = useCampaignData();
  const scope = useCampaignDraftScope();
  const [draft, setDraft] = useState(current.settings.values);
  const [baseline, setBaseline] = useState(current.settings);
  const state = useSave(mutate);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline.values);
  useUnsavedChanges(dirty);
  const newer = scope.stale || current.settings.revision !== baseline.revision;
  return (
    <>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await state.save({
            operation: "settings.save",
            timeline: scope.timeline,
            correctionScope: "timeline",
            campaignId: current.campaign.id,
            expectedRevision: baseline.revision,
            payload: draft,
          });
          if (result)
            setBaseline({
              ...baseline,
              values: draft,
              revision: result.revision,
            });
        }}
      >
        <fieldset className="persistence-fields" disabled={state.saving}>
          <CampaignSettingsEditor
            title={current.campaign.title}
            settings={draft}
            showWorldAutonomy={false}
            showMechanics={production?.ruleset.id === "console-basic-v1"}
            managedRulesNote={
              production ? configText.logicManaged : configText.loading
            }
            onChange={(action) => {
              state.clearSaved();
              setDraft((previous) => updateCampaignSettings(previous, action));
            }}
          />
          <TimelineDraftNotice stale={scope.stale} />
          {state.error && <p role="alert">{t(state.error)}</p>}
          {newer && (
            <p role="alert">
              {t(
                "Saved preferences changed elsewhere. Your draft is retained; reload saved values before editing again.",
              )}
            </p>
          )}
          <div className="button-row">
            <Button type="submit" primary disabled={!dirty || newer}>
              {t(state.saving ? "Saving…" : "Save campaign settings")}
            </Button>
            <Button onClick={() => void refresh().catch(() => {})}>
              {t("Refresh saved data")}
            </Button>
            <Button
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(t("Discard your unsaved changes?"))
                ) {
                  setDraft(current.settings.values);
                  scope.reset();
                  setBaseline(current.settings);
                  state.clearSaved();
                }
              }}
            >
              {t("Use saved values")}
            </Button>
          </div>
          <p role="status">
            {t(
              dirty
                ? "Unsaved changes"
                : state.saved
                  ? "Saved"
                  : "Changes take effect after Save.",
            )}
          </p>
        </fieldset>
      </form>
      <details className="rules-advanced">
        <summary>{t("Advanced · settings history")}</summary>
        <Panel title={t("Settings history")}>
          <p className="muted">
            {t(
              "Each save records a new effective revision. Existing scenes keep the revision they were created with.",
            )}
          </p>
          {current.settingsHistory.length ? (
            current.settingsHistory.map((revision) => (
              <details key={revision.id} className="rules-advanced">
                <summary>
                  {t("Revision {number}", { number: revision.revision })} ·{" "}
                  {new Date(revision.created_at).toLocaleString(language)}
                </summary>
                <dl className="detail-list">
                  <dt>{t("Campaign Language")}</dt>
                  <dd>
                    {revision.values.language === "ru"
                      ? t("Russian")
                      : t("English")}
                  </dd>
                  <dt>{t("Difficulty preset")}</dt>
                  <dd>
                    {t(
                      {
                        easy: "Easy",
                        medium: "Medium",
                        hard: "Hard",
                        custom: "Custom",
                      }[revision.values.difficulty.preset],
                    )}
                  </dd>
                  <dt>{t("Narrative style")}</dt>
                  <dd>{t(revision.values.narrativeStyle)}</dd>
                  <dt>{t("Dice Presentation")}</dt>
                  <dd>
                    {t(
                      {
                        hidden: "Hidden",
                        "key-rolls": "Key Rolls",
                        "all-player-rolls": "All Player Rolls",
                      }[revision.values.dicePresentation],
                    )}
                  </dd>
                  <dt>{t("Interactive Dice")}</dt>
                  <dd>{t(revision.values.interactiveDice ? "On" : "Off")}</dd>
                  <dt>{t("Show DC")}</dt>
                  <dd>{t(revision.values.showDc ? "On" : "Off")}</dd>
                  {dmStyleKeys.map((key) => (
                    <div key={key} className="dm-style-history-row">
                      <dt>{t(dmStyleChoices[key].label)}</dt>
                      <dd>
                        {t(
                          effectiveDmStyle(revision.values)[key] ===
                            "hopeful_humanist"
                            ? "Hopeful humanist"
                            : effectiveDmStyle(revision.values)[
                                key
                              ][0].toUpperCase() +
                                effectiveDmStyle(revision.values)[key].slice(1),
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))
          ) : (
            <p>{t("No saved settings revisions yet.")}</p>
          )}
        </Panel>
      </details>
    </>
  );
}

export function PersistentCampaignSettings({
  reviewOnly = false,
}: {
  reviewOnly?: boolean;
} = {}) {
  const { t } = useLanguage();
  const { data, loading, error, refresh, campaignId } = useCampaignData();
  const [production, setProduction] =
    useState<CampaignProductionSettings | null>(null);
  const activeProduction =
    production && productionScopeMatches(production, campaignId, data?.timeline)
      ? production
      : null;
  if (reviewOnly)
    return data ? <CampaignSettingsReview snapshot={data} /> : null;
  return (
    <>
      {loading && <p role="status">{t("Loading campaign settings…")}</p>}
      {error && (
        <Panel>
          <p role="alert">{t(error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {data && (
        <div key={campaignId}>
          <div className="page-heading">
            <div>
              <span className="eyebrow">{data.campaign.title}</span>
              <h1>{t("Campaign Settings")}</h1>
              <p>{t("A few quiet preferences for the road ahead.")}</p>
            </div>
          </div>
          <details className="rules-advanced">
            <summary>{t("Edit / Correct records")}</summary>
            <CampaignIdentityForm current={data.campaign} />
          </details>
          <CampaignPreferencesForm
            current={data}
            production={activeProduction}
          />
          <CampaignPremisePanel
            campaignId={campaignId}
            timeline={data.timeline}
            defaultLanguage={data.campaign.language}
          />
          <p>
            <Link className="text-link" href={`/campaigns/${campaignId}/dm-chat`}>
              {t("Chat with DM")}
            </Link>
          </p>
          <DmRuntimeSettingsPanel campaignId={campaignId} />
          <details className="rules-advanced">
            <summary>{t("Advanced · AI, rules & world engine")}</summary>
            <CampaignProductionSettingsPanel
              campaignId={campaignId}
              timeline={data.timeline}
              onLoaded={setProduction}
              afterSave={refresh}
            />
          </details>
          <details className="rules-advanced">
            <summary>{t("Advanced · Adventure management")}</summary>
            <PersistentAdventures />
            <PersistentAdventureLoot />
          </details>
          <details className="rules-advanced">
            <summary>
              {t("Advanced · World Packs & owner configuration")}
            </summary>
            <CampaignPackSettingsPanel />
            <FoundationLoopPanel section="settings" />
            {(activeProduction?.ruleset.id === "console-basic-v1" ||
              activeProduction?.ruleset.id === "world-logic-v1") && (
              <GameplayConfiguration />
            )}
          </details>
        </div>
      )}
    </>
  );
}

/** Public fixture adapter for isolated visual review; never reads or writes live state. */
export function CampaignSettingsReview({
  snapshot,
}: {
  snapshot: CampaignSnapshot;
}) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{snapshot.campaign.title}</span>
          <h1>{t("Campaign Settings")}</h1>
          <p>{t("A few quiet preferences for the road ahead.")}</p>
        </div>
      </div>
      <CampaignSettingsEditor
        title={snapshot.campaign.title}
        settings={snapshot.settings.values}
        onChange={() => {}}
        showWorldAutonomy={false}
        showMechanics={snapshot.settings.values.rulesSystem.id === "console-basic-v1"}
      />
    </div>
  );
}

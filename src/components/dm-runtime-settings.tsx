"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { Button, Panel } from "./ui";
import { GameplayClientError, gameplayErrorMessage } from "@/lib/gameplay/client";
import { dmRuntimeOptions, dmTurnModels, loadDmSettings, saveDmSettings,
  type DmRuntimeId, type DmSettings } from "@/lib/gameplay/dm-settings-client";

/** The DM runtime and model of a campaign. Editable at any time (these are not
 * world canon); a turn pins the choice when it starts, so a change applies to
 * the next action. Stage 5 redesigns this screen; this is the minimal control. */
export function DmRuntimeSettingsPanel({ campaignId, initial, load, save }: {
  campaignId: string;
  initial?: DmSettings;
  load?: () => Promise<DmSettings>;
  save?: (input: { expectedRevision: number; runtime: DmRuntimeId; dmTurn: DmSettings["dmTurn"] }) => Promise<DmSettings>;
}) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<DmSettings | null>(initial ?? null);
  const [runtime, setRuntime] = useState<DmRuntimeId>(initial?.runtime ?? "dm-loop-v1");
  const [model, setModel] = useState<string>(initial?.dmTurn ? `${initial.dmTurn.providerId}/${initial.dmTurn.modelId}` : "inherit");
  const [effort, setEffort] = useState<string>(initial?.dmTurn?.reasoning ?? "default");
  const [busy, setBusy] = useState(!initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const mounted = useRef(true);
  const apply = (next: DmSettings) => {
    setSettings(next);
    setRuntime(next.runtime);
    setModel(next.dmTurn ? `${next.dmTurn.providerId}/${next.dmTurn.modelId}` : "inherit");
    setEffort(next.dmTurn?.reasoning ?? "default");
  };
  useEffect(() => {
    mounted.current = true;
    if (initial) return () => { mounted.current = false; };
    (load ?? (() => loadDmSettings(campaignId)))().then((next) => { if (mounted.current) { apply(next); setBusy(false); } },
      (cause) => { if (mounted.current) { setError(cause instanceof GameplayClientError ? gameplayErrorMessage(cause) : "The connection was interrupted. Check the saved turn before trying again."); setBusy(false); } });
    return () => { mounted.current = false; };
  }, [campaignId, initial, load]);
  const chosen = dmTurnModels.find((entry) => `${entry.providerId}/${entry.modelId}` === model) ?? null;
  const dirty = !!settings && (runtime !== settings.runtime ||
    model !== (settings.dmTurn ? `${settings.dmTurn.providerId}/${settings.dmTurn.modelId}` : "inherit") ||
    effort !== (settings.dmTurn?.reasoning ?? "default"));
  const submit = async () => {
    if (!settings || busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const next = await (save ?? ((input) => saveDmSettings(campaignId, input)))({
        expectedRevision: settings.revision, runtime,
        dmTurn: chosen ? { providerId: chosen.providerId, modelId: chosen.modelId, reasoning: effort === "default" ? null : effort } : null,
      });
      if (!mounted.current) return;
      apply(next);
      setSaved(true);
    } catch (cause) {
      if (!mounted.current) return;
      setError(cause instanceof GameplayClientError ? gameplayErrorMessage(cause) : "The connection was interrupted. Check the saved turn before trying again.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <Panel className="dm-runtime-settings">
      <h3>{t("DM runtime and model")}</h3>
      <p className="muted">{t("Which turn engine plays new actions and which model is the DM. A change applies to the next action; a turn in progress keeps its own.")}</p>
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <fieldset className="persistence-fields" disabled={busy || !settings}>
          <label className="field">
            <span>{t("Turn runtime")}</span>
            <select aria-label={t("Turn runtime")} value={runtime} onChange={(event) => setRuntime(event.target.value as DmRuntimeId)}>
              {dmRuntimeOptions.map((option) => (
                <option key={option.value} value={option.value}>{t(option.label)}</option>
              ))}
            </select>
          </label>
          <p className="muted">{t(dmRuntimeOptions.find((option) => option.value === runtime)?.description ?? "")}</p>
          <label className="field">
            <span>{t("DM model")}</span>
            <select aria-label={t("DM model")} value={model} onChange={(event) => { setModel(event.target.value); setEffort("default"); }}>
              <option value="inherit">{t("Inherit the campaign model setting (GPT-6 Astra by default)")}</option>
              {dmTurnModels.map((entry) => (
                <option key={`${entry.providerId}/${entry.modelId}`} value={`${entry.providerId}/${entry.modelId}`}>{entry.label}</option>
              ))}
            </select>
          </label>
          {chosen && (
            <label className="field">
              <span>{t("Reasoning effort")}</span>
              <select aria-label={t("Reasoning effort")} value={effort} onChange={(event) => setEffort(event.target.value)}>
                <option value="default">{t("Model default")}</option>
                {chosen.efforts.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          )}
          {error && <p role="alert">{t(error)}</p>}
          {saved && !dirty && <p role="status">{t("DM settings saved.")}</p>}
          <div className="button-group">
            <Button primary type="submit" disabled={busy || !settings || !dirty}>{t(busy ? "Saving…" : "Save DM settings")}</Button>
          </div>
        </fieldset>
      </form>
    </Panel>
  );
}

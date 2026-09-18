"use client";

import { useId, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { usePreview } from "./preview-context";
import { Badge } from "./ui";
import { languageOptions } from "@/lib/i18n";
import { DicePreviewButton } from "./dice-preview";
import {
  autonomyOptions,
  defeatOptions,
  difficultyOptions,
  previewLimits,
  recoveryOptions,
  rerollOptions,
  roleOptions,
  scarcityOptions,
  storyOptions,
  checkFrequencyOptions,
  dicePresentationOptions,
  type CampaignSettings,
  type CampaignSettingsAction,
} from "@/lib/campaign-settings";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { t } = useLanguage();
  const name = useId();
  return (
    <fieldset className="play-style-choice">
      <legend>{label}</legend>
      <div
        className={`play-style-options ${options.length === 4 ? "presets" : ""}`}
      >
        {options.map((option) => (
          <label
            className={`play-style-option ${value === option.value ? "selected" : ""}`}
            key={option.value}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{t(option.label)}</strong>
              {option.description && <small>{t(option.description)}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectSetting<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}) {
  const { t } = useLanguage();
  return (
    <label className="field">
      {label}
      <select
        value={value}
        onChange={(event) => {
          const option = options.find(
            (option) => option.value === event.target.value,
          );
          if (option) onChange(option.value);
        }}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </label>
  );
}

function RulesAndPlayStyle({
  settings,
  change,
  preview,
}: {
  settings: CampaignSettings;
  change: (action: CampaignSettingsAction) => void;
  preview: boolean;
}) {
  const { t, language } = useLanguage();
  const { difficulty, rulesSystem } = settings;
  const format = (value: number) =>
    new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value);
  return (
    <>
      <div className="rules-preview-note">
        <Badge>
          {t(
            preview
              ? "Preview only"
              : "Saved preferences · gameplay unavailable",
          )}
        </Badge>
        <p>
          {t(
            preview
              ? "These settings do not affect gameplay yet. Numerical tuning is provisional. Choices stay while you browse and reset on refresh."
              : "Save preserves these campaign preferences. Numerical tuning is provisional; rules enforcement and gameplay begin in a later phase.",
          )}
        </p>
      </div>
      <section className="rules-section">
        <h3>{t("Difficulty & Rules")}</h3>
        <p className="muted">
          {t("Rules system: {system}", { system: t(rulesSystem.label) })}
        </p>
        <ChoiceGroup
          label={t("Difficulty preset")}
          options={difficultyOptions}
          value={difficulty.preset}
          onChange={(value) => change({ type: "preset", value })}
        />
        <p className="muted">
          {t(
            "Presets set the applicable rules below. Custom keeps your current values; adjusting any difficulty parameter selects Custom.",
          )}
        </p>
        <details className="rules-advanced">
          <summary>
            {t("Advanced")} <span>{t("Fine-tune difficulty")}</span>
          </summary>
          <p className="muted">
            {t(
              preview
                ? "HP and damage scaling are separate and depend on the campaign’s rules system. Unsupported controls are unavailable; these preview rules use both."
                : "HP and damage scaling are independent. Only controls supported by this campaign’s rules system are available.",
            )}
          </p>
          <div className="rules-fields">
            <label className="field">
              <span>
                {t("Enemy HP multiplier")}{" "}
                <strong>
                  {rulesSystem.enemyHpScaling
                    ? `${format(difficulty.enemyHpMultiplier)}×`
                    : t("Not applicable")}
                </strong>
              </span>
              <input
                aria-label={t("Enemy HP multiplier")}
                type="range"
                {...previewLimits.multiplier}
                value={difficulty.enemyHpMultiplier}
                disabled={!rulesSystem.enemyHpScaling}
                onChange={(event) =>
                  change({
                    type: "difficulty",
                    key: "enemyHpMultiplier",
                    value: Number(event.target.value),
                  })
                }
              />
              {!rulesSystem.enemyHpScaling && (
                <small>
                  {t("This rules system does not use enemy HP scaling.")}
                </small>
              )}
            </label>
            <label className="field">
              <span>
                {t("Enemy damage multiplier")}{" "}
                <strong>
                  {rulesSystem.enemyDamageScaling
                    ? `${format(difficulty.enemyDamageMultiplier)}×`
                    : t("Not applicable")}
                </strong>
              </span>
              <input
                aria-label={t("Enemy damage multiplier")}
                type="range"
                {...previewLimits.multiplier}
                value={difficulty.enemyDamageMultiplier}
                disabled={!rulesSystem.enemyDamageScaling}
                onChange={(event) =>
                  change({
                    type: "difficulty",
                    key: "enemyDamageMultiplier",
                    value: Number(event.target.value),
                  })
                }
              />
              {!rulesSystem.enemyDamageScaling && (
                <small>
                  {t(
                    "This rules system does not use numerical enemy damage scaling.",
                  )}
                </small>
              )}
            </label>
            <SelectSetting
              label={t("Rerolls")}
              options={rerollOptions}
              value={difficulty.rerolls}
              onChange={(value) =>
                change({ type: "difficulty", key: "rerolls", value })
              }
            />
            {difficulty.rerolls === "limited" && (
              <label className="field">
                {t("Reroll allowance per session")}
                <select
                  value={difficulty.rerollsPerSession}
                  onChange={(event) =>
                    change({
                      type: "difficulty",
                      key: "rerollsPerSession",
                      value: Number(event.target.value),
                    })
                  }
                >
                  {Array.from(
                    { length: previewLimits.rerollsPerSession.max },
                    (_, index) => index + 1,
                  ).map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <SelectSetting
              label={t("Defeat consequences")}
              options={defeatOptions}
              value={difficulty.defeat}
              onChange={(value) =>
                change({ type: "difficulty", key: "defeat", value })
              }
            />
            <SelectSetting
              label={t("Recovery")}
              options={recoveryOptions}
              value={difficulty.recovery}
              onChange={(value) =>
                change({ type: "difficulty", key: "recovery", value })
              }
            />
            {(["shortRestSupplyCost", "longRestSupplyCost"] as const).map(
              (key) => (
                <label className="field" key={key}>
                  {t(
                    key === "shortRestSupplyCost"
                      ? "Short-rest supply cost"
                      : "Long-rest supply cost",
                  )}
                  <select
                    value={difficulty[key]}
                    onChange={(event) =>
                      change({
                        type: "difficulty",
                        key,
                        value: Number(event.target.value),
                      })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((cost) => (
                      <option key={cost} value={cost}>
                        {cost === 0
                          ? t("No cost")
                          : t("{count} per participant", { count: cost })}
                      </option>
                    ))}
                  </select>
                </label>
              ),
            )}
            <p className="muted">
              {t(
                "Supply units per participating character, separate from Recovery. Recipe ingredients are additional and never counted twice. All values are provisional.",
              )}
            </p>
            <SelectSetting
              label={t("Resource scarcity")}
              options={scarcityOptions}
              value={difficulty.scarcity}
              onChange={(value) =>
                change({ type: "difficulty", key: "scarcity", value })
              }
            />
          </div>
        </details>
      </section>
      <section
        className="rules-section checks-dice-settings"
        aria-labelledby="checks-dice-title"
      >
        <h3 id="checks-dice-title">{t("Checks & Dice")}</h3>
        <p className="muted">
          {t(
            "Check frequency and dice presentation are independent of difficulty and all narrative settings.",
          )}
        </p>
        <ChoiceGroup
          label={t("Check Frequency")}
          options={checkFrequencyOptions}
          value={settings.checkFrequency}
          onChange={(value) => change({ type: "checkFrequency", value })}
        />
        <p className="muted">
          {t(
            "Full RPG does not call for rolls for trivial guaranteed actions, impossible actions, or repeated unchanged attempts. Frequency is a preview preference; it does not generate checks yet.",
          )}
        </p>
        <ChoiceGroup
          label={t("Dice Presentation")}
          options={dicePresentationOptions}
          value={settings.dicePresentation}
          onChange={(value) => change({ type: "dicePresentation", value })}
        />
        <div className="dice-preference-toggles">
          <div className="setting-row">
            <div>
              <h4>{t("Interactive Dice")}</h4>
              <p id="interactive-dice-help">
                {t(
                  "On opens an interactive window for displayed player rolls. Off shows an automatic compact result.",
                )}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.interactiveDice}
              aria-label={t("Interactive Dice")}
              aria-describedby="interactive-dice-help dice-hidden-help"
              disabled={settings.dicePresentation === "hidden"}
              className={`toggle ${settings.interactiveDice ? "on" : ""}`}
              onClick={() =>
                change({
                  type: "interactiveDice",
                  value: !settings.interactiveDice,
                })
              }
            >
              <span />
            </button>
          </div>
          <div className="setting-row">
            <div>
              <h4>{t("Show DC")}</h4>
              <p id="show-dc-help">
                {t(
                  "DC is the target number required to succeed. Show it only for player-facing checks whose target may be disclosed.",
                )}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showDc}
              aria-label={t("Show DC")}
              aria-describedby="show-dc-help dice-hidden-help"
              disabled={settings.dicePresentation === "hidden"}
              className={`toggle ${settings.showDc ? "on" : ""}`}
              onClick={() =>
                change({ type: "showDc", value: !settings.showDc })
              }
            >
              <span />
            </button>
          </div>
        </div>
        <p className="muted" id="dice-hidden-help">
          {t(
            settings.dicePresentation === "hidden"
              ? "Hidden presentation disables Interactive Dice and Show DC. Your saved preferences are retained for when rolls are displayed again."
              : "Private DM checks and private target numbers are never shown, regardless of these preferences.",
          )}
        </p>
        {preview && (
          <div className="dice-settings-preview">
            <div>
              <h4>{t("Try a sample moment")}</h4>
              <p className="muted">
                {t(
                  "Fixed samples only. No changes to your character, history, inventory, or reroll allowance.",
                )}
              </p>
            </div>
            <DicePreviewButton />
          </div>
        )}
      </section>
      <section className="rules-section">
        <ChoiceGroup
          label={t("Story Structure")}
          options={storyOptions}
          value={settings.storyStructure}
          onChange={(value) => change({ type: "storyStructure", value })}
        />
        <p className="muted">
          {t(
            "Every mode preserves player agency. Story-led never means predetermined player choices.",
          )}
        </p>
      </section>
      <section className="rules-section">
        <ChoiceGroup
          label={t("Player Role")}
          options={roleOptions}
          value={settings.playerRole}
          onChange={(value) => change({ type: "playerRole", value })}
        />
        <p className="muted">
          {t(
            "Your place in the world is independent of difficulty and story structure.",
          )}
        </p>
      </section>
      <section className="rules-section">
        <ChoiceGroup
          label={t("World Autonomy")}
          options={autonomyOptions}
          value={settings.worldAutonomy}
          onChange={(value) => change({ type: "worldAutonomy", value })}
        />
        <p className="muted">
          {t(
            "Autonomy follows in-world time and meaningful events. High autonomy does not mean a full-world simulator, continuous background processing, or multiple AI agents.",
          )}
        </p>
      </section>
      <p className="rules-canon-note">
        {t(
          "Future changes apply only going forward. Established scenes, rolls, and facts remain intact. Narrative preferences respect campaign canon and your agency; conflicts require clarification.",
        )}
      </p>
    </>
  );
}

export function CampaignSettingsEditor({
  title,
  settings: campaignSettings,
  onChange: change,
  preview = false,
}: {
  title: string;
  settings: CampaignSettings;
  onChange: (action: CampaignSettingsAction) => void;
  preview?: boolean;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("general");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = [
    { value: "general", label: "General" },
    { value: "rules", label: "Rules & Play Style" },
  ];
  return (
    <section
      className="panel campaign-settings"
      aria-labelledby="campaign-settings-title"
    >
      <div className="campaign-settings-heading">
        <div>
          <span className="eyebrow">{t("Campaign settings")}</span>
          <h2 id="campaign-settings-title">{title}</h2>
        </div>
        <Badge>{t("This campaign only")}</Badge>
      </div>
      <div
        className="tabs campaign-settings-tabs"
        role="tablist"
        aria-label={t("Campaign settings")}
      >
        {tabs.map((item, index) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`campaign-tab-${item.value}`}
            aria-controls={`campaign-panel-${item.value}`}
            aria-selected={tab === item.value}
            tabIndex={tab === item.value ? 0 : -1}
            className={tab === item.value ? "active" : ""}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            onClick={() => setTab(item.value)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? tabs.length - 1
                    : (index +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        tabs.length) %
                      tabs.length;
              setTab(tabs[next].value);
              tabRefs.current[next]?.focus();
            }}
          >
            {t(item.label)}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="campaign-panel-general"
        aria-labelledby="campaign-tab-general"
        hidden={tab !== "general"}
        tabIndex={0}
      >
        <div className="campaign-general-grid">
          <div>
            <label className="field">
              {t("Campaign Language")}
              <select
                value={campaignSettings.language}
                onChange={(event) =>
                  change({
                    type: "language",
                    value: event.target.value === "ru" ? "ru" : "en",
                  })
                }
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
                preview
                  ? "A separate preference for this campaign’s future story language. It does not change the interface or generate text yet. AI support arrives in Phase 2; this preview choice resets on refresh."
                  : "Saved for this campaign only. Campaign Language does not change Interface Language. Story generation is not available in Phase 1.",
              )}
            </p>
          </div>
          <div>
            <label className="field">
              {t("Narrative style")}
              <select
                value={campaignSettings.narrativeStyle}
                onChange={(event) =>
                  change({ type: "narrativeStyle", value: event.target.value })
                }
              >
                {["Literary", "Concise", "Detailed"].map((value) => (
                  <option key={value} value={value}>
                    {t(value)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t("Campaign visual style")}
              <select
                value={campaignSettings.visualStyle}
                onChange={(event) =>
                  change({ type: "visualStyle", value: event.target.value })
                }
              >
                <option value="Cinematic noir">{t("Cinematic noir")}</option>
                <option value="Painterly western">
                  {t("Painterly western")}
                </option>
                <option value="Dark fantasy">{t("Dark fantasy")}</option>
              </select>
            </label>
            <div className="form-grid">
              <label className="field">
                {t("Frame ratio")}
                <select
                  value={campaignSettings.frameRatio}
                  onChange={(event) =>
                    change({ type: "frameRatio", value: event.target.value })
                  }
                >
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1</option>
                </select>
              </label>
              <label className="field">
                {t("Video duration")}
                <select
                  value={campaignSettings.videoDuration}
                  onChange={(event) =>
                    change({ type: "videoDuration", value: event.target.value })
                  }
                >
                  <option value="5 seconds">{t("5 seconds")}</option>
                  <option value="10 seconds">{t("10 seconds")}</option>
                  <option value="15 seconds">{t("15 seconds")}</option>
                </select>
              </label>
            </div>
            <p className="muted">
              {t(
                preview
                  ? "Sample preferences only; media generation is not connected."
                  : "Visual preferences are saved. Media providers and models remain owner-selectable; generation is not connected.",
              )}
            </p>
          </div>
        </div>
      </div>
      <div
        role="tabpanel"
        id="campaign-panel-rules"
        aria-labelledby="campaign-tab-rules"
        hidden={tab !== "rules"}
        tabIndex={0}
      >
        <RulesAndPlayStyle
          settings={campaignSettings}
          change={change}
          preview={preview}
        />
      </div>
    </section>
  );
}

export function CampaignSettingsPanel() {
  const { t } = useLanguage();
  const { campaignSettings, changeCampaignSettings, campaign } = usePreview();
  return (
    <CampaignSettingsEditor
      title={t(campaign.title)}
      settings={campaignSettings}
      onChange={changeCampaignSettings}
      preview
    />
  );
}

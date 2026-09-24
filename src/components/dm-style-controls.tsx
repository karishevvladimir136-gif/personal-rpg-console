"use client";

import { useLanguage } from "./language-context";
import {
  effectiveDmStyle,
  type CampaignSettings,
  type DmStyle,
} from "@/lib/campaign-settings";

export const dmStyleChoices = {
  companionAgency: {
    label: "Companion initiative",
    choices: ["low", "normal", "high"],
  },
  descriptionDensity: {
    label: "Description detail",
    choices: ["concise", "balanced", "rich"],
  },
  dialogueDensity: {
    label: "Dialogue detail",
    choices: ["concise", "balanced", "rich"],
  },
  dramaticPace: {
    label: "Dramatic pace",
    choices: ["measured", "balanced", "brisk"],
  },
  mystery: { label: "Mystery", choices: ["low", "normal", "high"] },
  failForward: {
    label: "Forward momentum after setbacks",
    choices: ["low", "normal", "high"],
  },
  tone: { label: "Tone", choices: ["grounded", "warm", "cinematic"] },
} as const satisfies {
  [K in keyof DmStyle]: { label: string; choices: readonly DmStyle[K][] };
};

export const dmStyleKeys = Object.keys(dmStyleChoices) as (keyof DmStyle)[];

export function DmStyleControls({
  style,
  onChange,
  disabled = false,
}: {
  style: DmStyle;
  onChange: (key: keyof DmStyle, value: DmStyle[keyof DmStyle]) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className="dm-style-grid">
      {dmStyleKeys.map((key) => (
        <label className="field" key={key}>
          {t(dmStyleChoices[key].label)}
          <select
            value={style[key]}
            disabled={disabled}
            onChange={(event) =>
              onChange(key, event.target.value as DmStyle[typeof key])
            }
          >
            {dmStyleChoices[key].choices.map((choice) => (
              <option value={choice} key={choice}>
                {t(choice[0].toUpperCase() + choice.slice(1))}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

export function CampaignDmStyle({
  settings,
  onChange,
}: {
  settings: CampaignSettings;
  onChange: (key: keyof DmStyle, value: DmStyle[keyof DmStyle]) => void;
}) {
  const { t } = useLanguage();
  return (
    <section className="rules-section">
      <h3>{t("DM Style")}</h3>
      <p className="muted">
        {t(
          "These seven preferences guide future narration in this campaign. Save them with campaign settings; earlier scenes and the DM Guide stay as they are.",
        )}
      </p>
      <DmStyleControls style={effectiveDmStyle(settings)} onChange={onChange} />
    </section>
  );
}

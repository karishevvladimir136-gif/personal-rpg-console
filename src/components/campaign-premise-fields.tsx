"use client";

import { useId } from "react";
import { useLanguage } from "./language-context";
import type { CampaignPremiseInput } from "@/lib/production/premise-contracts";
import { campaignPremiseText } from "@/lib/campaign-premise-i18n";
import { premiseMaximumLength } from "@/lib/campaign-premise-client";
import styles from "./campaign-premise.module.css";

export function CampaignPremiseFields({
  value,
  onChange,
  optional = false,
}: {
  value: CampaignPremiseInput;
  onChange: (value: CampaignPremiseInput) => void;
  optional?: boolean;
}) {
  const { language } = useLanguage();
  const c = campaignPremiseText(language);
  const id = useId();
  return (
    <div className={styles.fields}>
      {optional && (
        <div>
          <h3>{c.title}</h3>
          <p className={styles.kicker}>{c.optional}</p>
        </div>
      )}
      <p>{c.intro}</p>
      <label className="field" htmlFor={`${id}-text`}>
        {c.label}
      </label>
      <textarea
        id={`${id}-text`}
        value={value.text}
        lang={value.language}
        rows={12}
        maxLength={premiseMaximumLength}
        required={!optional}
        placeholder={c.placeholder}
        aria-describedby={`${id}-help ${id}-count`}
        onChange={(event) => onChange({ ...value, text: event.target.value })}
      />
      <div className={styles.metadata}>
        <label className="field">
          {c.language}
          <select
            value={value.language}
            onChange={(event) =>
              onChange({
                ...value,
                language: event.target.value === "ru" ? "ru" : "en",
              })
            }
          >
            <option value="en">{c.english}</option>
            <option value="ru">{c.russian}</option>
          </select>
        </label>
        <span id={`${id}-count`} className="muted">
          {value.text.length.toLocaleString(language)} /{" "}
          {premiseMaximumLength.toLocaleString(language)} {c.characters}
        </span>
      </div>
      <p id={`${id}-help`} className="muted">
        {c.help}
      </p>
      <details className={styles.examples}>
        <summary>{c.examples}</summary>
        <div className={styles.exampleGrid}>
          <div>
            <h4>{c.political}</h4>
            <p>{c.politicalExample}</p>
          </div>
          <div>
            <h4>{c.exploration}</h4>
            <p>{c.explorationExample}</p>
          </div>
        </div>
      </details>
      <p className={styles.boundary}>{c.boundary}</p>
      {optional && <p className="muted">{c.creationHelp}</p>}
    </div>
  );
}

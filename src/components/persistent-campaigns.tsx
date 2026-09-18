"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useWorkspaceData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Panel } from "./ui";
import { languageOptions, type Language } from "@/lib/i18n";
import { createMutationAttempt, errorMessage } from "@/lib/persistence/client";
import type { Mutation } from "@/lib/persistence/contracts";

export function PersistentCampaigns() {
  const { t } = useLanguage();
  const { data, loading, error, refresh, mutate } = useWorkspaceData();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const attempt = useRef<Mutation | null>(null);
  const busy = useRef(false);
  const dirty =
    creating && (title !== "" || subtitle !== "" || language !== "en");
  useUnsavedChanges(dirty);
  const create = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    attempt.current = createMutationAttempt(attempt.current, {
      operation: "campaign.create",
      expectedRevision: 0,
      payload: { title, subtitle, language },
    });
    try {
      await mutate(attempt.current);
      setTitle("");
      setSubtitle("");
      setLanguage("en");
      setCreating(false);
      setSaved(true);
      attempt.current = null;
    } catch (cause) {
      setSaveError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("YOUR WORLDS AWAIT")}</span>
          <h1>{t("Campaigns")}</h1>
          <p>{t("Each campaign keeps its own world, records, and history.")}</p>
        </div>
        <Button
          primary
          onClick={() => {
            setCreating(true);
            setSaved(false);
          }}
        >
          {t("New Campaign")}
        </Button>
      </div>
      <Link className="text-link" href="/">
        {t("Back to main menu")}
      </Link>
      {loading && <p role="status">{t("Loading saved campaigns…")}</p>}
      {error && (
        <Panel>
          <p role="alert">{t(error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {saved && (
        <p role="status">
          {t("Campaign saved. Open it below to add your records.")}
        </p>
      )}
      {creating && (
        <Panel title={t("New Campaign")}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void create();
            }}
          >
            <fieldset disabled={saving} className="persistence-fields">
              <label className="field">
                {t("Campaign title")}
                <input
                  required
                  maxLength={200}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="field">
                {t("Subtitle")}
                <input
                  maxLength={500}
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                />
              </label>
              <label className="field">
                {t("Campaign Language")}
                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value === "ru" ? "ru" : "en")
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
                  "Creates an empty campaign. No story, characters, or secret material are generated or imported.",
                )}
              </p>
              {saveError && <p role="alert">{t(saveError)}</p>}
              <div className="button-row">
                <Button primary type="submit" disabled={!title.trim()}>
                  {t(saving ? "Saving…" : "Create campaign")}
                </Button>
                <Button
                  onClick={() => {
                    if (
                      !dirty ||
                      window.confirm(t("Discard your unsaved changes?"))
                    ) {
                      setCreating(false);
                      setTitle("");
                      setSubtitle("");
                      setLanguage("en");
                      setSaveError("");
                      attempt.current = null;
                    }
                  }}
                >
                  {t("Cancel")}
                </Button>
              </div>
            </fieldset>
          </form>
        </Panel>
      )}
      {data && !data.campaigns.length && (
        <Panel title={t("Your first chapter")}>
          <p>
            {t(
              "No saved campaigns yet. Create a campaign to begin collecting your world and characters.",
            )}
          </p>
        </Panel>
      )}
      <div className="campaign-list">
        {data?.campaigns.map((campaign) => (
          <Panel key={campaign.id} className="persistent-campaign-card">
            <Icon name="BookOpen" size={34} />
            <h2>{campaign.title}</h2>
            <p>{campaign.subtitle}</p>
            <Badge>
              {campaign.language === "ru" ? t("Russian") : t("English")}
            </Badge>
            <p className="muted">{t("Private campaign · saved records")}</p>
            <Link
              className="button primary"
              href={`/campaigns/${campaign.id}/game`}
            >
              {t("Continue")} <Icon name="ArrowRight" />
            </Link>
          </Panel>
        ))}
      </div>
    </>
  );
}

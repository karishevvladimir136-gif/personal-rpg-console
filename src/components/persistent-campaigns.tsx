"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useWorkspaceData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Panel } from "./ui";
import { CampaignPremiseFields } from "./campaign-premise-fields";
import {
  optionalCreationPremise,
  PremiseClientError,
} from "@/lib/campaign-premise-client";
import { campaignPremiseText } from "@/lib/campaign-premise-i18n";
import type { CampaignPremiseInput } from "@/lib/production/premise-contracts";
import { languageOptions, type Language } from "@/lib/i18n";
import {
  ClientPersistenceError,
  createMutationAttempt,
  errorMessage,
} from "@/lib/persistence/client";
import type { Mutation } from "@/lib/persistence/contracts";

export function PersistentCampaigns() {
  const { t, language: interfaceLanguage } = useLanguage();
  const premiseText = campaignPremiseText(interfaceLanguage);
  const { data, loading, error, refresh, mutate } = useWorkspaceData();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [premise, setPremise] = useState<CampaignPremiseInput>({
    text: "",
    language: "en",
  });
  const [uncertain, setUncertain] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const attempt = useRef<Mutation | null>(null);
  const busy = useRef(false);
  const creationOpen = useRef(false);
  const dirty =
    creating &&
    (title !== "" ||
      subtitle !== "" ||
      language !== "en" ||
      premise.text !== "" ||
      premise.language !== "en");
  useUnsavedChanges(dirty || uncertain);
  const create = async () => {
    if (busy.current || !creationOpen.current) return;
    busy.current = true;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      // An unconfirmed creation must retry its exact payload and request ID.
      const creationPremise = optionalCreationPremise(premise);
      attempt.current ??= createMutationAttempt(null, {
        operation: "campaign.create",
        expectedRevision: 0,
        payload: {
          title,
          subtitle,
          language,
          ...(creationPremise ? { premise: creationPremise } : {}),
        },
      });
      await mutate(attempt.current);
      creationOpen.current = false;
      setTitle("");
      setSubtitle("");
      setLanguage("en");
      setPremise({ text: "", language: "en" });
      setUncertain(false);
      setCreating(false);
      setSaved(true);
      attempt.current = null;
    } catch (cause) {
      setSaveError(
        cause instanceof PremiseClientError
          ? premiseText.invalid
          : errorMessage(cause),
      );
      const confirmed =
        (cause instanceof ClientPersistenceError ||
          cause instanceof PremiseClientError) &&
        [
          "unauthenticated",
          "forbidden",
          "not_configured",
          "validation",
          "conflict",
          "not_found",
        ].includes(cause.code);
      setUncertain(!confirmed);
      if (confirmed) attempt.current = null;
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
            creationOpen.current = true;
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
            <fieldset
              disabled={saving || uncertain}
              className="persistence-fields"
            >
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
              <CampaignPremiseFields
                value={premise}
                onChange={setPremise}
                optional
              />
            </fieldset>
            {saveError && <p role="alert">{t(saveError)}</p>}
            {uncertain && <p role="status">{premiseText.uncertain}</p>}
            <div className="button-row">
              <Button primary type="submit" disabled={saving || !title.trim()}>
                {uncertain
                  ? premiseText.retry
                  : t(saving ? "Saving…" : "Create campaign")}
              </Button>
              <Button
                disabled={saving || uncertain}
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm(t("Discard your unsaved changes?"))
                  ) {
                    setCreating(false);
                    creationOpen.current = false;
                    setTitle("");
                    setSubtitle("");
                    setLanguage("en");
                    setPremise({ text: "", language: "en" });
                    setSaveError("");
                    attempt.current = null;
                  }
                }}
              >
                {t("Cancel")}
              </Button>
            </div>
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

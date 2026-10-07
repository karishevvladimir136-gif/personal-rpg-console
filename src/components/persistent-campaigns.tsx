"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { NewCampaignForm as NewHeroForm } from "./bootstrap/new-campaign";
import {
  parseBootstrapDraft,
  restoreBootstrapCommand,
} from "@/lib/adventures/bootstrap-client";
import { adventureText } from "./adventures/text";
import { restoreWorldAttempt, worldPendingKey } from "@/lib/adventures/client";
import { useLanguage } from "./language-context";
import { useWorkspaceData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Panel } from "./ui";
import { loadCampaign } from "@/lib/persistence/client";
import { ownerAcceptedFrameAsset } from "@/lib/visual-frame/real-frame";
import { defaultMediaFrameTransport } from "@/lib/visual-frame/media-client";
import { SubjectAvatar } from "./visual-frame/subject-avatar";
import type { Campaign, CampaignSnapshot } from "@/lib/persistence/contracts";
import styles from "./persistent-campaigns.module.css";
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

function CampaignCard({
  campaign,
  reviewSnapshot,
}: {
  campaign: Campaign;
  reviewSnapshot?: CampaignSnapshot | null;
}) {
  const { t } = useLanguage();
  const [snapshot, setSnapshot] = useState<CampaignSnapshot | null>(null);
  useEffect(() => {
    if (reviewSnapshot !== undefined) return;
    let current = true;
    void loadCampaign(campaign.id)
      .then((loaded) => {
        if (current && loaded.campaign.id === campaign.id) setSnapshot(loaded);
      })
      .catch(() => {
        // The campaign link remains usable when a public card preview is unavailable.
      });
    return () => {
      current = false;
    };
  }, [campaign.id, reviewSnapshot]);
  const current = reviewSnapshot === undefined ? snapshot : reviewSnapshot;
  const session = current?.sessions.find(
    (row) => row.id === current.publicState.current_session_id,
  );
  const scene = current?.scenes.find(
    (row) => row.id === current.publicState.current_scene_id,
  );
  const location = current?.locations.find(
    (row) => row.id === current.publicState.current_location_id,
  );
  const player = current?.entities.find((row) => row.kind === "player");
  const cover = current?.assets
    .filter((asset) => ownerAcceptedFrameAsset(current, asset))
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))[0];
  const review = reviewSnapshot !== undefined;
  const destination = (screen: "game" | "library" | "sessions") =>
    review
      ? `/preview/live-ui?screen=${screen}`
      : `/campaigns/${campaign.id}/${screen}`;
  return (
    <article className={`featured-campaign panel ${styles.card}`}>
      <div className={`campaign-cover ${styles.cover}`}>
        {cover ? (
          <Image
            unoptimized
            src={defaultMediaFrameTransport.imageUrl(campaign.id, cover.id)}
            alt=""
            width={1536}
            height={1024}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden="true">
            <Icon name="BookOpen" size={96} />
          </div>
        )}
        <div className="cover-title">
          <span className="eyebrow">{t("YOUR CURRENT STORY")}</span>
          <h2>{campaign.title}</h2>
          {campaign.subtitle && <p>{campaign.subtitle}</p>}
        </div>
      </div>
      <div className="campaign-info">
        <Badge green>{t("In progress")}</Badge>
        <h2>{campaign.title}</h2>
        {campaign.subtitle && (
          <p className="campaign-description">{campaign.subtitle}</p>
        )}
        <div className="campaign-meta">
          {session && (
            <span>
              <Icon name="sessions" />
              {session.title}
            </span>
          )}
          {location && (
            <span>
              <Icon name="map" />
              {location.name}
            </span>
          )}
          {scene && (
            <span>
              <Icon name="BookOpen" />
              {scene.title}
            </span>
          )}
        </div>
        {player && current && (
          <div className="campaign-character">
            <SubjectAvatar
              snapshot={current}
              entity={player}
              className={styles.heroAvatar}
              fallback="icon"
            />
            <div>
              <h3>{player.name}</h3>
              {Object.hasOwn(player.stats, "level") && (
                <p>{t("Level {level}", { level: player.stats.level })}</p>
              )}
            </div>
          </div>
        )}
        <Link
          className="button primary continue-button"
          href={destination("game")}
        >
          {t("Continue the story")} <Icon name="ArrowRight" />
        </Link>
        <div className="campaign-links">
          <Link href={destination("library")}>
            {t("Campaign library")}
          </Link>
          <Link href={destination("sessions")}>
            {t("Previous sessions")}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Screenshot adapter: supplied public fixture records only; no campaign fetch. */
export function CampaignCardsReview({
  campaigns,
  snapshots,
}: {
  campaigns: Campaign[];
  snapshots: Record<string, CampaignSnapshot>;
}) {
  return (
    <div className={styles.list}>
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          reviewSnapshot={snapshots[campaign.id] ?? null}
        />
      ))}
    </div>
  );
}

export function PersistentCampaigns() {
  const { t, language: interfaceLanguage } = useLanguage();
  const premiseText = campaignPremiseText(interfaceLanguage);
  const adventureCopy = adventureText(interfaceLanguage);
  const [newHero, setNewHero] = useState(false);
  const [query, setQuery] = useState("");
  const [heroDirty, setHeroDirty] = useState(false);
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const pending = restoreBootstrapCommand(
          sessionStorage.getItem("rpg:bootstrap:creation:pending"),
        );
        const cached = sessionStorage.getItem("rpg:bootstrap:creation:draft");
        if (pending?.action.startsWith("creation.")) setNewHero(true);
        try {
          if (
            cached &&
            parseBootstrapDraft(JSON.parse(cached).draft).kind === "creation"
          )
            setNewHero(true);
        } catch {
          /* Invalid cached data cannot hide compatibility recovery. */
        }
        if (
          ["new_campaign", "world_create"].some((kind) =>
            restoreWorldAttempt(
              sessionStorage.getItem(
                worldPendingKey(kind as "new_campaign" | "world_create"),
              ),
              kind as "new_campaign" | "world_create",
            ),
          )
        )
          setNewHero(true);
      } catch {
        /* Recovery remains available in memory when storage is blocked. */
      }
    });
  }, []);
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
  useUnsavedChanges(dirty || uncertain || heroDirty);
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
          <span className="eyebrow">{t("YOUR STORIES, WAITING")}</span>
          <h1>{t("My Campaigns")}</h1>
          <p>{t("Worlds to explore. Stories to remember.")}</p>
        </div>
        <Button
          primary
          disabled={creating || newHero}
          onClick={() => {
            setNewHero(true);
            setSaved(false);
          }}
        >
          {adventureCopy.newCampaign}
        </Button>
      </div>
      <details className="rules-advanced">
        <summary>{adventureCopy.advancedCreation}</summary>
        <p className="muted">{adventureCopy.emptyHelp}</p>
        <Button
          disabled={creating || newHero}
          onClick={() => {
            creationOpen.current = true;
            setCreating(true);
            setSaved(false);
          }}
        >
          {adventureCopy.createEmpty}
        </Button>
      </details>
      {newHero && (
        <NewHeroForm
          language={interfaceLanguage}
          onDirty={setHeroDirty}
          onCreated={refresh}
          onCancel={() => {
            if (
              !heroDirty ||
              window.confirm(t("Discard your unsaved changes?"))
            ) {
              setNewHero(false);
              setHeroDirty(false);
            }
          }}
        />
      )}
      <Link className="text-link" href="/">
        {t("Back to main menu")}
      </Link>
      <div className="campaign-toolbar">
        <span className="small-quote">
          {t("“Different worlds. Same stories.”")}
        </span>
        <input
          aria-label={t("Search campaigns")}
          placeholder={t("Search campaigns…")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
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
        <Panel title={adventureCopy.createEmpty}>
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
              <p className="muted">{adventureCopy.emptyHelp}</p>
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
      <div className={styles.list}>
        {data?.campaigns
          .filter((campaign) =>
            `${campaign.title} ${campaign.subtitle}`
              .toLocaleLowerCase()
              .includes(query.trim().toLocaleLowerCase()),
          )
          .map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
      </div>
      {data && data.campaigns.length > 0 && query.trim() &&
        !data.campaigns.some((campaign) =>
          `${campaign.title} ${campaign.subtitle}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
        ) && <p className="empty-state panel">{t("No campaigns found")}</p>}
    </>
  );
}

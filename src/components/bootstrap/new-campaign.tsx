"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  NewHeroResult,
  WorldCatalog,
} from "../../lib/adventures/contracts";
import type {
  BootstrapTransport,
  CreationReview,
} from "../../lib/adventures/bootstrap-contracts";
import { parseCreationReview } from "../../lib/adventures/bootstrap-validation";
import {
  createAdventureTransport,
  restoreWorldAttempt,
  worldPendingKey,
  type AdventureTransport,
} from "../../lib/adventures/client";
import { WorldPicker } from "../adventures/worlds";
import { NewHeroForm } from "../adventures/new-hero";
import { useBootstrap } from "./use-bootstrap";
import { bootstrapText, CharacterReview, normalizeLines } from "./review";
import styles from "../adventures/adventures.module.css";
type Props = {
  language: "en" | "ru";
  onDirty: (v: boolean) => void;
  onCreated: () => Promise<void>;
  onCancel: () => void;
  initialWorlds?: WorldCatalog;
  persistPending?: boolean;
  continueHref?: string;
  transport?: AdventureTransport;
  bootstrapTransport?: BootstrapTransport;
};
export function NewCampaignForm(props: Props) {
  const [advanced, setAdvanced] = useState(false),
    c = bootstrapText(props.language);
  useEffect(() => {
    if (props.persistPending === false) return;
    Promise.resolve().then(() => {
      try {
        if (
          restoreWorldAttempt(
            sessionStorage.getItem(worldPendingKey("new_campaign")),
            "new_campaign",
          )
        )
          setAdvanced(true);
      } catch {
        /* No automatic dispatch; the explicit compatibility recovery remains available. */
      }
    });
  }, [props.persistPending]);
  return (
    <>
      {advanced ? <NewHeroForm {...props} /> : <UniversalCampaign {...props} />}
      <details className={styles.history}>
        <summary>{c.advanced}</summary>
        <div className={styles.actions}>
          <button onClick={() => setAdvanced((v) => !v)}>
            {advanced ? "World Logic" : c.fighter}
          </button>
        </div>
      </details>
    </>
  );
}
function UniversalCampaign({
  language,
  onDirty,
  onCreated,
  onCancel,
  initialWorlds,
  persistPending = true,
  continueHref,
  transport: injected,
  bootstrapTransport,
}: Props) {
  const c = bootstrapText(language),
    transport = useMemo(
      () => injected ?? createAdventureTransport(),
      [injected],
    );
  const workflow = useBootstrap(
    "rpg:bootstrap:creation",
    persistPending,
    bootstrapTransport,
  );
  const [worlds, setWorlds] = useState<WorldCatalog | null>(
      initialWorlds ?? null,
    ),
    [worldId, setWorldId] = useState(""),
    [worldBusy, setWorldBusy] = useState(false),
    [worldDirty, setWorldDirty] = useState(false);
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [title, setTitle] = useState(""),
    [campaignLanguage, setCampaignLanguage] = useState(language),
    [created, setCreated] = useState<NewHeroResult | null>(null);
  const dirty =
    !!name ||
    !!description ||
    !!title ||
    !!worldId ||
    worldDirty ||
    !!workflow.draft ||
    !!workflow.pending;
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const committed = async (value: unknown) => {
    setCreated(value as NewHeroResult);
    onDirty(false);
    await onCreated();
  };
  const frozen = !workflow.ready || workflow.busy || !!workflow.pending;
  const draft = workflow.draft?.kind === "creation" ? workflow.draft : null,
    review = workflow.review as CreationReview | null;
  const corrected = review
    ? {
        ...review,
        capabilities: normalizeLines(review.capabilities),
        limitations: normalizeLines(review.limitations),
      }
    : null;
  let canCreate = false;
  try {
    if (draft && corrected) {
      parseCreationReview(corrected, draft.proposal);
      canCreate = true;
    }
  } catch {
    /* Clarifications and recorded balances must be resolved. */
  }
  return (
    <section className={styles.panel}>
      <h2>{language === "ru" ? "Новая кампания" : "New Campaign"}</h2>
      <p className={styles.intro}>{c.intro}</p>
      {created ? (
        <>
          <p role="status">{c.ready}</p>
          <div className={styles.actions}>
            <Link
              className={styles.primary}
              href={
                continueHref ?? `/campaigns/${created.campaignId}/adventures`
              }
            >
              {c.next}
            </Link>
            <button onClick={onCancel}>{c.cancel}</button>
          </div>
        </>
      ) : (
        <>
          {draft && review ? (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                if (canCreate && corrected)
                  void workflow.execute(
                    {
                      action: "creation.commit",
                      input: {
                        requestId: crypto.randomUUID(),
                        draftId: draft.draftId,
                        review: corrected,
                      },
                    },
                    committed,
                  );
              }}
            >
              <p>
                {
                  worlds?.worlds.find((w) => w.id === draft.input.worldId)
                    ?.title
                }
              </p>
              <fieldset disabled={frozen}>
                <CharacterReview
                  value={review}
                  onChange={workflow.setReview}
                  language={language}
                  questions={draft.proposal.questions}
                />
              </fieldset>
              <div className={styles.actions}>
                <button
                  className={styles.primary}
                  disabled={frozen || !canCreate}
                >
                  {c.create}
                </button>
                <button
                  type="button"
                  disabled={frozen}
                  onClick={workflow.resetProposal}
                >
                  {c.newProposal}
                </button>
              </div>
            </form>
          ) : (
            <>
              <WorldPicker
                language={language}
                worldId={worldId}
                disabled={frozen}
                onSelect={setWorldId}
                onCatalog={setWorlds}
                onBusy={setWorldBusy}
                onDirty={setWorldDirty}
                initial={initialWorlds}
                transport={transport}
                persistPending={persistPending}
              />
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  const world = worlds?.worlds.find((w) => w.id === worldId);
                  if (!world || frozen) return;
                  void workflow.execute(
                    {
                      action: "creation.propose",
                      input: {
                        requestId: crypto.randomUUID(),
                        worldId: world.id,
                        worldVersion: world.version,
                        title,
                        name,
                        description,
                        language: campaignLanguage,
                      },
                    },
                    committed,
                  );
                }}
              >
                <fieldset
                  className={styles.form}
                  disabled={frozen || worldBusy}
                >
                  <label className={styles.field}>
                    {c.title}
                    <input
                      required
                      maxLength={200}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    {c.name}
                    <input
                      required
                      maxLength={200}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    {c.who}
                    <textarea
                      required
                      rows={7}
                      maxLength={8000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        language === "ru"
                          ? "Прошлое, умения, ограничения, вещи — своими словами."
                          : "Background, capabilities, limitations, possessions—in your own words."
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    {c.language}
                    <select
                      value={campaignLanguage}
                      onChange={(e) =>
                        setCampaignLanguage(
                          e.target.value === "ru" ? "ru" : "en",
                        )
                      }
                    >
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                    </select>
                  </label>
                </fieldset>
                <p className={styles.muted}>{c.cost}</p>
                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    disabled={
                      frozen ||
                      worldBusy ||
                      !worldId ||
                      !name.trim() ||
                      !title.trim() ||
                      !description.trim()
                    }
                  >
                    {c.prepare}
                  </button>
                  <button
                    type="button"
                    disabled={frozen || worldBusy}
                    onClick={onCancel}
                  >
                    {c.cancel}
                  </button>
                </div>
              </form>
            </>
          )}
          {workflow.pending && (
            <div className={styles.notice} role="status">
              <p>{c.pending}</p>
              <div className={styles.actions}>
                <button
                  disabled={workflow.busy}
                  onClick={() =>
                    void workflow.execute(workflow.pending!, committed)
                  }
                >
                  {c.recover}
                </button>
                {workflow.error &&
                  workflow.pending.action === "creation.propose" && (
                    <button
                      disabled={workflow.busy}
                      onClick={workflow.resetProposal}
                    >
                      {c.newProposal}
                    </button>
                  )}
              </div>
            </div>
          )}
          {workflow.error && (
            <p role="alert" className={styles.notice}>
              {c.unavailable}
            </p>
          )}
        </>
      )}
    </section>
  );
}

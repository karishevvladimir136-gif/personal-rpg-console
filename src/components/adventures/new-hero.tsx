"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  NewHeroResult,
  WorldCatalog,
  WorldCommand,
} from "../../lib/adventures/contracts";
import {
  AdventureClientError,
  createAdventureTransport,
  newHeroAttempt,
  restoreWorldAttempt,
  worldPendingKey,
  type AdventureTransport,
} from "../../lib/adventures/client";
import { WorldPicker } from "./worlds";
import { usePending } from "./use-pending";
import { adventureText } from "./text";
import styles from "./adventures.module.css";
export function NewHeroForm({
  language,
  onDirty,
  onCreated,
  onCancel,
  initialWorlds,
  persistPending = true,
  continueHref,
  transport: injected,
}: {
  language: "en" | "ru";
  onDirty: (dirty: boolean) => void;
  onCreated: () => Promise<void>;
  onCancel: () => void;
  initialWorlds?: WorldCatalog;
  persistPending?: boolean;
  continueHref?: string;
  transport?: AdventureTransport;
}) {
  const c = adventureText(language),
    transport = useMemo(
      () => injected ?? createAdventureTransport(),
      [injected],
    );
  const [worlds, setWorlds] = useState<WorldCatalog | null>(
      initialWorlds ?? null,
    ),
    [worldId, setWorldId] = useState("");
  const [worldBusy, setWorldBusy] = useState(false),
    [worldDirty, setWorldDirty] = useState(false);
  const [title, setTitle] = useState(""),
    [heroName, setHeroName] = useState(""),
    [campaignLanguage, setCampaignLanguage] = useState(language);
  const [reviewing, setReviewing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [created, setCreated] = useState<NewHeroResult | null>(null),
    lock = useRef(false);
  const restore = useCallback(
    (value: string | null) => restoreWorldAttempt(value, "new_campaign"),
    [],
  );
  const { pending, current, mounted, remember, ready } =
    usePending<WorldCommand>(
      worldPendingKey("new_campaign"),
      restore,
      persistPending,
    );
  const frozen = !ready || busy || pending !== null || created !== null;
  useEffect(() => {
    onDirty(
      !!title || !!heroName || !!worldId || worldDirty || pending !== null,
    );
  }, [title, heroName, worldId, worldDirty, pending, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const send = async (command: WorldCommand) => {
    if (lock.current || !ready || command.action !== "new_campaign") return;
    lock.current = true;
    setBusy(true);
    setError("");
    const attempt = current.current ?? command;
    remember(attempt);
    try {
      if (attempt.action !== "new_campaign") return;
      const result = await transport.newHero(attempt);
      if (!mounted.current) return;
      remember(null);
      setCreated(result);
      setTitle("");
      setHeroName("");
      setWorldId("");
      try {
        await onCreated();
      } catch {
        if (mounted.current) setError("unavailable");
      }
    } catch (cause) {
      if (mounted.current) {
        const code =
          cause instanceof AdventureClientError ? cause.code : "uncertain";
        setError(code);
        if (code !== "uncertain") remember(null);
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <section className={styles.panel}>
      <h2>{c.newCampaign}</h2>
      <p className={styles.intro}>{c.starterIntro}</p>
      {created ? (
        <div role="status">
          <p>{c.campaignReady}</p>
          <div className={styles.actions}>
            <Link
              className={styles.primary}
              href={
                continueHref ?? `/campaigns/${created.campaignId}/adventures`
              }
            >
              {c.prepareFirst}
            </Link>
          </div>
          <div className={styles.actions}>
            <button onClick={onCancel}>{c.cancel}</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className={styles.stepTitle}>{c.chooseWorld}</h3>
          <WorldPicker
            starter
            language={language}
            worldId={worldId}
            disabled={frozen}
            onSelect={(id) => {
              setWorldId(id);
              setReviewing(false);
            }}
            onCatalog={setWorlds}
            onBusy={setWorldBusy}
            onDirty={setWorldDirty}
            initial={initialWorlds}
            transport={transport}
            persistPending={persistPending}
          />
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>{c.yourHero}</h3>
            <p>{c.starterHero}</p>
            <p className={styles.muted}>{c.fighterHelp}</p>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                if (frozen || worldBusy || !worlds) return;
                if (!reviewing) setReviewing(true);
                else {
                  try {
                    void send(
                      newHeroAttempt(
                        worlds,
                        worldId,
                        title,
                        heroName,
                        campaignLanguage,
                      ),
                    );
                  } catch {
                    setError("validation");
                  }
                }
              }}
            >
              <fieldset disabled={frozen || worldBusy || !worldId}>
                {reviewing ? (
                  <div className={styles.setup}>
                    <h3>{c.reviewHero}</h3>
                    <p>{worlds?.worlds.find((w) => w.id === worldId)?.title}</p>
                    <p>
                      {title} · {heroName}
                    </p>
                    <p>{c.fighter}</p>
                    <p>{campaignLanguage === "ru" ? "Русский" : "English"}</p>
                    <p>{c.fighterHelp}</p>
                  </div>
                ) : (
                  <div className={styles.form}>
                    <label className={styles.field}>
                      {c.campaignTitle}
                      <input
                        required
                        maxLength={200}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      {c.heroName}
                      <input
                        required
                        maxLength={200}
                        value={heroName}
                        onChange={(e) => setHeroName(e.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      {c.campaignLanguage}
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
                  </div>
                )}
              </fieldset>
              {(pending || error) && (
                <div className={styles.notice} role="status">
                  <p>
                    {pending
                      ? c.pending
                      : error === "conflict"
                        ? c.conflict
                        : error === "validation"
                          ? c.validation
                          : c.unavailable}
                  </p>
                  {pending && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        disabled={busy || !ready}
                        onClick={() => void send(pending)}
                      >
                        {c.retry}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primary}
                  disabled={
                    frozen ||
                    worldBusy ||
                    !worldId ||
                    !title.trim() ||
                    !heroName.trim()
                  }
                >
                  {reviewing ? c.createCampaign : c.reviewHero}
                </button>
                {reviewing && (
                  <button
                    type="button"
                    disabled={frozen || worldBusy}
                    onClick={() => setReviewing(false)}
                  >
                    {c.editHero}
                  </button>
                )}
                <button
                  type="button"
                  disabled={frozen || worldBusy}
                  onClick={onCancel}
                >
                  {c.cancel}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </section>
  );
}

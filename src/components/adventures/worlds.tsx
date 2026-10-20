"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PublicWorld,
  WorldCatalog,
  WorldCommand,
} from "../../lib/adventures/contracts";
import {
  AdventureClientError,
  createAdventureTransport,
  createWorldAttempt,
  mergeCreatedWorld,
  restoreWorldAttempt,
  worldPendingKey,
  type AdventureTransport,
} from "../../lib/adventures/client";
import { parseWorldCatalog } from "../../lib/adventures/validation";
import { adventureText } from "./text";
import { usePending } from "./use-pending";
import styles from "./adventures.module.css";

export function WorldPicker({
  language,
  worldId,
  disabled,
  onSelect,
  onCatalog,
  onBusy,
  onDirty,
  initial,
  starter = false,
  persistPending = true,
  transport: injected,
  wizard = false,
  previewCreated = false,
}: {
  language: "en" | "ru";
  worldId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
  onCatalog: (catalog: WorldCatalog) => void;
  onBusy: (busy: boolean) => void;
  onDirty: (dirty: boolean) => void;
  initial?: WorldCatalog;
  starter?: boolean;
  persistPending?: boolean;
  transport?: AdventureTransport;
  /** Fix run F (items 11, 12): the new-campaign wizard's world step — plain words, «Мир создан и выбран». */
  wizard?: boolean;
  /** A synthetic preview of the state right after «Создать мир». */
  previewCreated?: boolean;
}) {
  const c = adventureText(language),
    transport = useMemo(
      () => injected ?? createAdventureTransport(),
      [injected],
    );
  const [catalog, setCatalog] = useState<WorldCatalog | null>(() =>
    initial ? parseWorldCatalog(initial) : null,
  );
  const [loading, setLoading] = useState(!initial),
    [error, setError] = useState(false),
    [creating, setCreating] = useState(false);
  const [creatingBusy, setCreatingBusy] = useState(false);
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const ru = language === "ru";
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(false);
      try {
        const next = await transport.worlds(signal);
        if (signal?.aborted) return;
        setCatalog(next);
      } catch (cause) {
        if (!(cause instanceof Error && cause.name === "AbortError"))
          setError(true);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [transport],
  );
  useEffect(() => {
    if (initial) return;
    const abort = new AbortController();
    Promise.resolve().then(() => {
      if (!abort.signal.aborted) void load(abort.signal);
    });
    return () => abort.abort();
  }, [initial, load]);
  useEffect(() => {
    if (catalog) onCatalog(catalog);
  }, [catalog, onCatalog]);
  useEffect(() => {
    onBusy(loading || creatingBusy);
  }, [loading, creatingBusy, onBusy]);
  useEffect(() => () => onBusy(false), [onBusy]);
  useEffect(() => {
    if (!persistPending) return;
    Promise.resolve().then(() => {
      try {
        if (
          restoreWorldAttempt(
            sessionStorage.getItem(worldPendingKey("world_create")),
            "world_create",
          )
        )
          setCreating(true);
      } catch {
        /* Storage may be unavailable. */
      }
    });
  }, [persistPending]);
  const chosen = catalog?.worlds.find((w) => w.id === worldId);
  const fresh = !!chosen && (justCreated === chosen.id || (previewCreated && wizard));
  // Item 12: «v1» is noise for a world with one version.
  const versionTag = (w: PublicWorld) => (w.version > 1 ? (ru ? ` · версия ${w.version}` : ` · version ${w.version}`) : "");
  return (
    <div className={styles.world}>
      {loading && <p role="status">{c.loadingWorlds}</p>}
      {error && (
        <div className={styles.notice} role="alert">
          <p>{c.unavailable}</p>
          <div className={styles.actions}>
            <button
              disabled={disabled || creatingBusy}
              onClick={() => void load()}
            >
              {c.refresh}
            </button>
          </div>
        </div>
      )}
      {catalog && (
        <>
          <label className={styles.field}>
            {c.world}
            <select
              disabled={disabled || loading || creatingBusy}
              value={chosen?.id ?? ""}
              onChange={(e) => onSelect(e.target.value)}
            >
              <option value="">{c.noWorld}</option>
              {starter ? (
                <>
                  <optgroup label={c.simpleWorlds}>
                    {catalog.worlds
                      .filter((w) => !w.packVersionIds.length)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.title}
                        </option>
                      ))}
                  </optgroup>
                  {catalog.worlds.some((w) => w.packVersionIds.length > 0) && (
                    <optgroup label={c.packWorlds}>
                      {catalog.worlds
                        .filter((w) => w.packVersionIds.length > 0)
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.title}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              ) : (
                catalog.worlds.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}{versionTag(w)}
                  </option>
                ))
              )}
            </select>
          </label>
          {fresh && chosen && (
            <p className={styles.notice} role="status">
              {ru ? `Мир создан и выбран: «${chosen.title}».` : `World created and selected: “${chosen.title}”.`}
            </p>
          )}
          {chosen && (
            <div className={styles.setup}>
              <p className={wizard ? styles.worldPremise : undefined}>{chosen.premise}</p>
              <p className={styles.muted}>
                {wizard
                  ? ru ? "Этот текст ведущий видит в каждом ходе: при создании кампании он станет её документом канона." : "The DM sees this text on every turn: the new campaign keeps it as a canon document."
                  : starter && chosen.packVersionIds.length > 0
                    ? c.foundationHelp
                    : c.pinned}
              </p>
            </div>
          )}
          {starter && <p className={styles.muted}>{c.simpleWorldHelp}</p>}
          {creating ? (
            <WorldCreator
              language={language}
              catalog={catalog}
              disabled={disabled}
              transport={transport}
              persistPending={persistPending}
              onBusy={setCreatingBusy}
              onDirty={onDirty}
              wizard={wizard}
              onCreated={(world) => {
                setCatalog((old) => mergeCreatedWorld(old ?? catalog, world));
                onSelect(world.id);
                setJustCreated(world.id);
                setCreating(false);
              }}
              onCancel={() => {
                setCreating(false);
                onDirty(false);
              }}
            />
          ) : (
            <div className={styles.actions}>
              <button
                type="button"
                disabled={disabled || loading}
                onClick={() => setCreating(true)}
              >
                {chosen ? (ru ? "Ещё один мир…" : "Another world…") : c.worldCreate}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
function WorldCreator({
  language,
  catalog,
  disabled,
  transport,
  persistPending = true,
  wizard = false,
  onBusy,
  onDirty,
  onCreated,
  onCancel,
}: {
  wizard?: boolean;
  language: "en" | "ru";
  catalog: WorldCatalog;
  disabled: boolean;
  transport: AdventureTransport;
  persistPending?: boolean;
  onBusy: (busy: boolean) => void;
  onDirty: (dirty: boolean) => void;
  onCreated: (world: PublicWorld) => void;
  onCancel: () => void;
}) {
  const c = adventureText(language);
  const restore = useCallback(
    (value: string | null) => restoreWorldAttempt(value, "world_create"),
    [],
  );
  const { pending, current, mounted, remember, ready } =
    usePending<WorldCommand>(
      worldPendingKey("world_create"),
      restore,
      persistPending,
    );
  const [title, setTitle] = useState(""),
    [premise, setPremise] = useState(""),
    [packs, setPacks] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const locked = useRef(false),
    frozen = !ready || disabled || busy || pending !== null;
  useEffect(() => {
    onBusy(busy || pending !== null);
  }, [busy, pending, onBusy]);
  useEffect(() => {
    onDirty(!!title || !!premise || packs.length > 0 || pending !== null);
  }, [title, premise, packs, pending, onDirty]);
  useEffect(
    () => () => {
      onBusy(false);
      onDirty(false);
    },
    [onBusy, onDirty],
  );
  const send = async (value: WorldCommand) => {
    if (!ready || disabled || locked.current || value.action !== "world_create")
      return;
    locked.current = true;
    setBusy(true);
    setError("");
    const attempt = current.current ?? value;
    remember(attempt);
    try {
      if (attempt.action !== "world_create") return;
      const result = await transport.createWorld(attempt);
      if (!mounted.current) return;
      remember(null);
      onCreated(result.world);
    } catch (cause) {
      if (mounted.current) {
        const code =
          cause instanceof AdventureClientError ? cause.code : "uncertain";
        setError(code);
        if (code !== "uncertain") remember(null);
      }
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (frozen) return;
        // The wizard creates in one step: the text the owner wrote is what he reviews.
        if (!reviewing && !wizard) setReviewing(true);
        else {
          try {
            void send(
              createWorldAttempt(catalog, {
                title,
                premise,
                packVersionIds: packs,
              }),
            );
          } catch {
            setError("validation");
          }
        }
      }}
    >
      <fieldset disabled={frozen}>
        {reviewing ? (
          <div className={styles.setup}>
            <h3>{title}</h3>
            <p>{premise}</p>
            <p>
              {packs.length
                ? catalog.packs
                    .filter((p) => packs.includes(p.versionId))
                    .map((p) => p.title)
                    .join(" · ")
                : c.originalFoundation}
            </p>
            <p className={styles.muted}>
              {packs.length ? c.foundationHelp : c.simpleWorldHelp}
            </p>
          </div>
        ) : (
          <div className={styles.form}>
            <label className={styles.field}>
              {c.worldTitle}
              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              {wizard ? (language === "ru" ? "Опишите мир — до 20 000 знаков" : "Describe the world — up to 20,000 characters") : c.worldPremise}
              <textarea
                required
                maxLength={20000}
                className={styles.worldDescription}
                rows={12}
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
              />
            </label>
            {wizard && <p className={styles.muted}>{language === "ru" ? "Этот текст ведущий видит в каждом ходе." : "The DM sees this text on every turn."}</p>}
            {catalog.packs.length > 0 && (
              <details className={styles.advanced}>
                <summary>{c.advancedFoundation}</summary>
                <p className={styles.muted}>{c.foundationHelp}</p>
                <p>{c.foundation}</p>
                <div className={styles.checks}>
                  {catalog.packs.map((p) => (
                    <label key={p.versionId}>
                      <input
                        type="checkbox"
                        checked={packs.includes(p.versionId)}
                        disabled={
                          !packs.includes(p.versionId) && packs.length >= 16
                        }
                        onChange={(e) =>
                          setPacks(
                            e.target.checked
                              ? [...packs, p.versionId]
                              : packs.filter((id) => id !== p.versionId),
                          )
                        }
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              </details>
            )}
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
                : c.validation}
          </p>
          {pending && (
            <div className={styles.actions}>
              <button
                type="button"
                disabled={disabled || busy}
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
          className={styles.primary}
          type="submit"
          disabled={frozen || !title.trim() || !premise.trim()}
        >
          {reviewing || wizard ? c.worldCreate : c.reviewWorld}
        </button>
        {reviewing && (
          <button
            type="button"
            disabled={frozen}
            onClick={() => setReviewing(false)}
          >
            {c.editWorld}
          </button>
        )}
        <button type="button" disabled={frozen} onClick={onCancel}>
          {c.cancel}
        </button>
      </div>
    </form>
  );
}

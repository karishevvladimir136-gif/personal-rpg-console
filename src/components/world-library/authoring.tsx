"use client";

import { useState } from "react";
import type {
  OwnerLibraryDraftCommand,
  OwnerLibraryResult,
  OwnerSourceDetail,
} from "@/lib/world-library/owner-contracts";
import { ownerDescriptionDraft } from "@/lib/world-library-client";
import { worldAuthoringText } from "@/lib/world-library-i18n";
import styles from "./world-library.module.css";

export type LibrarySave = (
  command: OwnerLibraryDraftCommand,
) => Promise<OwnerLibraryResult | null>;
export type AuthoringMode = "upload" | "describe" | "combine";
export type Language = "en" | "ru";

export function AuthoringModes({
  language,
  mode,
  disabled,
  onSelect,
}: {
  language: Language;
  mode: AuthoringMode;
  disabled: boolean;
  onSelect: (mode: AuthoringMode) => void;
}) {
  const w = (key: string) => worldAuthoringText(language, key);
  return (
    <section
      className={styles.authoringIntro}
      aria-label={w("Your world begins here")}
    >
      <p className={styles.eyebrow}>{w("Your world begins here")}</p>
      <div className={styles.modeGrid}>
        {(
          [
            [
              "upload",
              "Upload Sources",
              "Preserve your notes or a TXT / Markdown file.",
            ],
            [
              "describe",
              "Describe From Scratch",
              "Describe a world in your own words. No special format needed.",
            ],
            [
              "combine",
              "Combine",
              "Mix your own premise with uploaded sources, then choose their priority.",
            ],
          ] as const
        ).map(([value, title, note]) => (
          <button
            key={value}
            className={styles.modeCard}
            aria-pressed={mode === value}
            disabled={disabled}
            onClick={() => onSelect(value)}
          >
            <strong>{w(title)}</strong>
            <small>{w(note)}</small>
          </button>
        ))}
        <div className={styles.futureMode} aria-disabled="true">
          <strong>{w("Research")}</strong>
          <small>{w("Future · unavailable")}</small>
          <small>
            {w(
              "Research is not available. No web search or external import runs here.",
            )}
          </small>
        </div>
      </div>
    </section>
  );
}

export function DescriptionEditor({
  language,
  detail,
  busy,
  save,
  setDirty,
  onVersion,
}: {
  language: Language;
  detail: OwnerSourceDetail | null;
  busy: boolean;
  save: LibrarySave;
  setDirty: (value: boolean) => void;
  onVersion: (id: string) => void;
}) {
  const w = (key: string) => worldAuthoringText(language, key);
  const [initial] = useState(() => ({
    title: detail?.title ?? "",
    text: detail?.text ?? "",
    language: detail?.provenance?.language ?? language,
    visibility: detail?.visibility ?? "private",
    knowledge: detail?.knowledge ?? "source",
  }));
  const [draft, setDraft] = useState(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const latest = !detail || detail.history[0]?.versionId === detail.versionId;
  function change(patch: Partial<typeof draft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    setDirty(JSON.stringify(next) !== JSON.stringify(initial));
  }
  return (
    <section className={`${styles.panel} ${styles.descriptionPanel}`}>
      <p className={styles.eyebrow}>{w("Owner-authored description")}</p>
      <h2>{detail?.title ?? w("A new world, in your own words")}</h2>
      <p>
        {w(
          "Describe the place, people, factions, tensions and rules that matter. Say what is certain and what should remain open.",
        )}
      </p>
      {detail && (
        <label>
          {w("Version history")}
          <select
            disabled={busy || dirty}
            value={detail.versionId}
            onChange={(event) => onVersion(event.target.value)}
          >
            {detail.history.map((version) => (
              <option key={version.versionId} value={version.versionId}>
                {w("Version")} {version.version} — {version.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {!latest && (
        <p>
          {w(
            "Historical version. Select the latest version to edit or approve.",
          )}
        </p>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await save(
            ownerDescriptionDraft({
              sourceId: detail?.id ?? null,
              expectedVersionId: detail?.versionId ?? null,
              ...draft,
            }),
          );
        }}
      >
        <fieldset disabled={busy || !latest || detail?.text === null}>
          <label>
            {w("World title")}
            <input
              required
              maxLength={240}
              value={draft.title}
              onChange={(event) => change({ title: event.target.value })}
            />
          </label>
          <label>
            {w("Your world description")}
            <textarea
              className={styles.descriptionInput}
              rows={16}
              required
              maxLength={250_000}
              value={draft.text}
              onChange={(event) => change({ text: event.target.value })}
            />
          </label>
          <details className={styles.exampleIdeas}>
            <summary>{w("Example ideas")}</summary>
            <p>
              {w(
                "Medieval Europe, but dragons have replaced cavalry. Coastal kingdoms control breeding grounds. Who can afford a dragon, and what has changed for ordinary farmers? Leave the answers open.",
              )}
            </p>
            <p>
              {w(
                "A quiet city built around a sleeping sea. Three families share the harbor, and every treaty expires at the next tide. Magic can remember, but cannot predict.",
              )}
            </p>
          </details>
          <div className={styles.twoFields}>
            <label>
              {w("Description language")}
              <select
                value={draft.language}
                onChange={(event) =>
                  change({ language: event.target.value as Language })
                }
              >
                <option value="en">{w("English")}</option>
                <option value="ru">{w("Russian")}</option>
              </select>
            </label>
            <label>
              {w("Source access")}
              <select
                value={draft.visibility}
                onChange={(event) =>
                  change({
                    visibility: event.target.value as "public" | "private",
                  })
                }
              >
                <option value="private">{w("Private source")}</option>
                <option value="public">
                  {w("Eligible for public evidence after review")}
                </option>
              </select>
            </label>
          </div>
          <label>
            {w("Knowledge scope")}
            <select
              value={draft.knowledge}
              onChange={(event) =>
                change({
                  knowledge: event.target.value as "source" | "future_source",
                })
              }
            >
              <option value="source">{w("Source knowledge only")}</option>
              <option value="future_source">
                {w("Future source events only")}
              </option>
            </select>
          </label>
          <p>
            {w(
              "Your exact words are preserved as an owner-authored source. Saving makes no model request. They remain authored premises, never external source facts.",
            )}
          </p>
          <div className={styles.actions}>
            <button
              type="submit"
              disabled={
                !draft.title.trim() ||
                !draft.text.trim() ||
                (!!detail && !dirty)
              }
            >
              {w(detail ? "Save revised description" : "Preserve description")}
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={() => {
                setDraft(initial);
                setDirty(false);
              }}
            >
              {w("Discard edit")}
            </button>
          </div>
        </fieldset>
      </form>
      {detail && (
        <details>
          <summary>{w("Source integrity")}</summary>
          <p className={styles.digest}>
            {w("SHA-256:")} {detail.digest}
          </p>
          <p className={styles.digest}>
            {w("Immutable version:")} {detail.versionId}
          </p>
        </details>
      )}
    </section>
  );
}

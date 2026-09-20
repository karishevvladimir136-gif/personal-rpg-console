"use client";

import { useState } from "react";
import type { OwnerLibraryIndex } from "@/lib/world-library/owner-contracts";
import { ownerCompilerAction } from "@/lib/world-library-client";
import { worldAuthoringText } from "@/lib/world-library-i18n";
import type { Language, LibrarySave } from "./authoring";
import styles from "./world-library.module.css";

export const ASSISTANCE_DISCLOSURE =
  "Uses the configured compiler model. An explicit request sends selected source excerpts to the provider and may incur a charge; the cost is unknown here. No substitute model is selected if unavailable.";

export function CompilerPanel({
  language,
  index,
  selected,
  setSelected,
  busy,
  dirty,
  save,
}: {
  language: Language;
  index: OwnerLibraryIndex;
  selected: string[];
  setSelected: (ids: string[]) => void;
  busy: boolean;
  dirty: boolean;
  save: LibrarySave;
}) {
  const w = (key: string, values?: Record<string, string | number>) =>
    worldAuthoringText(language, key, values);
  const [mode, setMode] = useState<"deterministic" | "assisted">(
    "deterministic",
  );
  const [maxUnits, setMaxUnits] = useState(180);
  return (
    <section className={styles.panel}>
      <h2>{w("Compile a draft")}</h2>
      <p>
        {w(
          "Select up to eight sources. Order them from highest to lowest priority. Conflicting alternatives remain visible.",
        )}
      </p>
      <h3>{w("Source priority")}</h3>
      {!selected.length && <p>{w("No sources selected yet.")}</p>}
      <ol className={styles.priority}>
        {selected.map((id, i) => (
          <li key={id}>
            <span>
              {index.sources.find((source) => source.versionId === id)?.title ??
                w("Selected historical source")}
            </span>
            <button
              aria-label={w("Raise priority of source {n}", { n: i + 1 })}
              disabled={busy || i === 0}
              onClick={() => {
                const next = [...selected];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                setSelected(next);
              }}
            >
              ↑
            </button>
            <button
              aria-label={w("Remove source {n} from compilation", { n: i + 1 })}
              disabled={busy}
              onClick={() =>
                setSelected(selected.filter((entry) => entry !== id))
              }
            >
              {w("Remove")}
            </button>
          </li>
        ))}
      </ol>
      <label>
        {w("Compiler approach")}
        <select
          disabled={busy}
          value={mode}
          onChange={(event) => setMode(event.target.value as typeof mode)}
        >
          <option value="deterministic">{w("Local source indexing")}</option>
          <option value="assisted">{w("Configured model assistance")}</option>
        </select>
      </label>
      <p className={styles.boundary}>
        {w(
          mode === "assisted"
            ? ASSISTANCE_DISCLOSURE
            : "Preserves source passages locally. No provider request or charge.",
        )}
      </p>
      <label>
        {w("Work limit")}
        <input
          type="number"
          min={3}
          max={480}
          step={3}
          value={maxUnits}
          disabled={busy}
          onChange={(event) => setMaxUnits(Number(event.target.value))}
        />
      </label>
      <button
        disabled={
          busy ||
          dirty ||
          !selected.length ||
          !Number.isInteger(maxUnits) ||
          maxUnits < 3 ||
          maxUnits > 480
        }
        onClick={() =>
          save({
            action: "compiler.start",
            mode,
            sourcePriority: [...selected],
            maxUnits,
          })
        }
      >
        {w(mode === "assisted" ? "Create assisted job" : "Create compiler job")}
      </button>
      {mode === "assisted" ? (
        <p>
          {w(
            "Creating a job checks configuration and saves the selected profile. Continue each stage explicitly; opening this page never calls a model.",
          )}
        </p>
      ) : (
        <details>
          <summary>{w("What this compiler understands")}</summary>
          <p>
            {w(
              "This local compiler preserves lines and recognizes explicit headings such as",
            )}{" "}
            <code>person: Mara</code> {w(", followed by fields such as")}{" "}
            <code>location: Harbor</code> {w("or")} <code>alias: Captain</code>
            {w(
              ". Ordinary prose stays a source assertion. Relationships, chronology, rules and geography need review. No model request is made.",
            )}
          </p>
        </details>
      )}
      {!!index.jobs.length && <h3>{w("Compiler jobs")}</h3>}
      {index.jobs.map((job) => {
        const next = ownerCompilerAction(job);
        return (
          <div className={styles.job} key={job.id}>
            <strong>{w(job.status)}</strong>
            <small>
              {w("Version")} {job.version} · {job.checkpoints.length}{" "}
              {w("checkpoints")}
            </small>
            {job.executionProfile && (
              <p>
                {w("Model pinned for this job")}:{" "}
                <strong>{job.executionProfile.modelId}</strong>
                {job.executionProfile.reasoning
                  ? ` · ${job.executionProfile.reasoning}`
                  : ""}
              </p>
            )}
            {job.refinement && (
              <details>
                <summary>{w("Ask to refine")}</summary>
                <p className={styles.preservedText}>{job.refinement.text}</p>
              </details>
            )}
            {job.requestPending && (
              <p className={styles.boundary}>
                {w(
                  "Request status is uncertain. Reload first; an explicit retry abandons the pending response and may lead to another charged request.",
                )}
              </p>
            )}
            {job.status === "failed" && (
              <p role="status">
                {w(
                  job.errorCode === "configuration"
                    ? "Paused: the configured provider or model is unavailable. Check Model Runtime setup before an explicit retry. No fallback was used."
                    : "Paused: the last proposal could not be completed or validated. Your sources and earlier versions are preserved.",
                )}
              </p>
            )}
            {next?.providerRequest && (
              <p className={styles.boundary}>{w(ASSISTANCE_DISCLOSURE)}</p>
            )}
            {next && (
              <button
                disabled={busy || dirty}
                onClick={() =>
                  save({
                    action: next.action,
                    expectedVersionId: job.versionId,
                  })
                }
              >
                {w(next.label)}
              </button>
            )}
            {job.status === "awaiting_review" && (
              <p>{w("Compilation stops here for owner review.")}</p>
            )}
            {job.status === "invalidated" && (
              <p>
                {w(
                  "A source changed. Select current source versions and start a new job.",
                )}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

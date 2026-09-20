"use client";

import { useEffect, useRef, useState } from "react";
import type {
  OwnerLibraryCommand,
  OwnerLibraryDraftCommand,
  OwnerLibraryIndex,
  OwnerLibraryResult,
  OwnerPackDetail,
  OwnerSourceDetail,
  OwnerSourceSummary,
} from "@/lib/world-library/owner-contracts";
import {
  ownerLibraryAttempt,
  ownerPackDraft,
  ownerClaimCanonEligible,
  readOwnerLibrary,
  readOwnerPack,
  readOwnerSource,
  writeOwnerLibrary,
} from "@/lib/world-library-client";
import { worldAuthoringText } from "@/lib/world-library-i18n";
import {
  AuthoringModes,
  DescriptionEditor,
  type AuthoringMode,
} from "./authoring";
import { CompilerPanel } from "./compiler-panel";
import {
  ReviewOverview,
  RefinementEditor,
  CanonPreview,
} from "./guided-review";
import { useUnsavedChanges } from "../persistence-context";
import styles from "./world-library.module.css";
import { useLanguage } from "../language-context";
import {
  worldLibraryText,
  worldLibraryCompilerNote,
} from "@/lib/locales/wave2-library";

function useWorldLibraryText() {
  const { language } = useLanguage();
  return {
    language,
    w: (key: string) => worldAuthoringText(language, key),
    t: (key: string, values?: Record<string, string | number>) =>
      worldAuthoringText(language, worldLibraryText(language, key, values)),
  };
}

type Save = (
  command: OwnerLibraryDraftCommand,
) => Promise<OwnerLibraryResult | null>;
const message = (cause: unknown) =>
  cause instanceof Error ? cause.message : "World Library is unavailable.";

export function WorldLibrary() {
  const { t, w, language } = useWorldLibraryText();
  const [mode, setMode] = useState<AuthoringMode>("describe");
  const [index, setIndex] = useState<OwnerLibraryIndex | null>(null);
  const [source, setSource] = useState<OwnerSourceDetail | null>(null);
  const [pack, setPack] = useState<OwnerPackDetail | null>(null);
  const [newSource, setNewSource] = useState<"upload" | "describe" | null>(
    "describe",
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const attempt = useRef<OwnerLibraryCommand | null>(null);
  const pending = useRef(false);
  const selection = useRef(0);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  useEffect(() => {
    const controller = new AbortController();
    readOwnerLibrary(controller.signal)
      .then(setIndex)
      .catch((cause) => {
        if (!controller.signal.aborted) setError(message(cause));
      });
    return () => controller.abort();
  }, []);
  async function refresh() {
    setError("");
    try {
      setIndex(await readOwnerLibrary());
    } catch (cause) {
      setError(message(cause));
    }
  }
  async function open(kind: "source" | "pack", versionId: string) {
    if (dirty || pending.current) return;
    const token = ++selection.current;
    setError("");
    try {
      if (kind === "source") {
        const detail = await readOwnerSource(versionId);
        if (token === selection.current) {
          setSource(detail);
          setPack(null);
          setNewSource(null);
        }
      } else {
        const detail = await readOwnerPack(versionId);
        if (token === selection.current) {
          setPack(detail);
          setSource(null);
          setNewSource(null);
        }
      }
    } catch (cause) {
      if (token === selection.current) setError(message(cause));
    }
  }
  const save: Save = async (command) => {
    if (pending.current) return null;
    pending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    attempt.current = ownerLibraryAttempt(attempt.current, command);
    try {
      const result = await writeOwnerLibrary(attempt.current);
      attempt.current = null;
      setDirty(false);
      setNotice(
        result.kind === "compiler_job"
          ? "Compiler checkpoint saved. Continue the next pass explicitly when ready."
          : "Immutable version saved. Existing campaign pins remain unchanged.",
      );
      try {
        setIndex(await readOwnerLibrary());
        if (result.kind === "source") {
          setSource(await readOwnerSource(result.versionId));
          setNewSource(null);
          setPack(null);
        }
        if (result.kind === "pack") {
          setPack(await readOwnerPack(result.versionId));
          setSource(null);
          setNewSource(null);
        }
      } catch (cause) {
        setNotice(
          "Saved successfully. Reload the library to see the new version.",
        );
        setError(message(cause));
      }
      return result;
    } catch (cause) {
      setError(message(cause));
      return null;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <main className={styles.workspace} aria-busy={busy}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t("Owner authoring workspace")}</p>
          <h1>{t("World Library")}</h1>
          <p>
            {" "}
            {t(
              "Preserve your sources. Review a world. Choose an exact version for each campaign.",
            )}{" "}
          </p>
        </div>
        <button disabled={busy} onClick={refresh}>
          {" "}
          {t("Reload library")}{" "}
        </button>
      </header>
      <p className={styles.boundary}>
        {" "}
        {t(
          "This workspace can contain your private uploaded sources. Campaign Library and hidden campaign state are separate. Source knowledge is never automatically character knowledge.",
        )}{" "}
      </p>
      {error && (
        <p role="alert" className={styles.error}>
          {t(error)}
        </p>
      )}
      {notice && (
        <p role="status" className={styles.notice}>
          {t(notice)}
        </p>
      )}
      {dirty && (
        <p role="status">
          {" "}
          {t(
            "Save or discard the current edit before opening another version.",
          )}{" "}
        </p>
      )}
      {!index ? (
        <p>{t("Loading owner library…")}</p>
      ) : (
        <>
          <AuthoringModes
            language={language}
            mode={mode}
            disabled={busy || dirty}
            onSelect={(next) => {
              ++selection.current;
              setMode(next);
              setSource(null);
              setPack(null);
              setNewSource(next === "upload" ? "upload" : "describe");
            }}
          />
          <div className={styles.columns}>
            <aside className={styles.sidebar}>
              <section className={styles.panel}>
                <h2>{t("Sources")}</h2>
                <button
                  disabled={busy || dirty}
                  onClick={() => {
                    ++selection.current;
                    setSource(null);
                    setPack(null);
                    setNewSource("upload");
                  }}
                >
                  {" "}
                  {t("Add TXT / Markdown")}{" "}
                </button>
                {mode === "combine" && (
                  <button
                    disabled={busy || dirty}
                    onClick={() => {
                      ++selection.current;
                      setSource(null);
                      setPack(null);
                      setNewSource("describe");
                    }}
                  >
                    {w("Add your description")}
                  </button>
                )}
                {!index.sources.length && (
                  <p>
                    {t("Start with a short text source or a Markdown file.")}
                  </p>
                )}
                {index.sources.map((s) => (
                  <div className={styles.row} key={s.id}>
                    <label className={styles.check}>
                      <input
                        type="checkbox"
                        disabled={
                          busy ||
                          (selected.length >= 8 &&
                            !selected.includes(s.versionId))
                        }
                        checked={selected.includes(s.versionId)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, s.versionId]
                              : selected.filter((id) => id !== s.versionId),
                          )
                        }
                      />
                      <span className={styles.srOnly}>
                        {" "}
                        {t("Include")} {s.title}{" "}
                        {t("in the next compilation")}{" "}
                      </span>
                    </label>
                    <button
                      className={styles.linkButton}
                      disabled={busy || dirty}
                      onClick={() => open("source", s.versionId)}
                    >
                      {s.title}
                      <small>
                        {" "}
                        {t("Version")} {s.version} · {t(s.visibility)} ·{" "}
                        {w(
                          s.provenance
                            ? "Owner-authored description"
                            : "Uploaded source",
                        )}{" "}
                        ·{" "}
                        {s.knowledge === "future_source"
                          ? t("Future reference")
                          : t("Source knowledge")}
                      </small>
                    </button>
                  </div>
                ))}
              </section>
              <CompilerPanel
                language={language}
                index={index}
                selected={selected}
                setSelected={setSelected}
                busy={busy}
                dirty={dirty}
                save={save}
              />
              <section className={styles.panel}>
                <h2>{t("World Packs")}</h2>
                {!index.packs.length && (
                  <p>
                    {" "}
                    {t(
                      "Completed compiler passes produce an unapproved draft here.",
                    )}{" "}
                  </p>
                )}
                {index.packs.map((p) => (
                  <button
                    key={p.id}
                    className={styles.packButton}
                    disabled={busy || dirty}
                    onClick={() => open("pack", p.versionId)}
                  >
                    {p.title}
                    <small>
                      {" "}
                      {t("Version")} {p.version} · {t(p.status)}
                    </small>
                  </button>
                ))}
                <p>
                  {" "}
                  {t(
                    "Approve a reviewed version here, then explicitly pin it from campaign settings. New source and Pack versions never advance a campaign pin.",
                  )}{" "}
                </p>
              </section>
            </aside>
            <div className={styles.detail}>
              {(source?.provenance ||
                (!source && newSource === "describe")) && (
                <DescriptionEditor
                  key={source?.versionId ?? "new-description"}
                  language={language}
                  detail={source}
                  busy={busy}
                  save={save}
                  setDirty={setDirty}
                  onVersion={(id) => open("source", id)}
                />
              )}
              {(newSource === "upload" || source) &&
                !source?.provenance &&
                newSource !== "describe" && (
                  <SourceEditor
                    key={source?.versionId ?? "new"}
                    detail={source}
                    busy={busy}
                    save={save}
                    setDirty={setDirty}
                    onVersion={(id) => open("source", id)}
                  />
                )}
              {pack && (
                <PackEditor
                  key={pack.versionId}
                  detail={pack}
                  sources={index.sources}
                  busy={busy}
                  save={save}
                  setDirty={setDirty}
                  onVersion={(id) => open("pack", id)}
                />
              )}
              {!newSource && !source && !pack && (
                <section className={styles.empty}>
                  <h2>{t("Build from preserved evidence")}</h2>
                  <p>
                    {" "}
                    {t(
                      "Add a source, choose its priority and run the bounded compiler passes. Open a draft to read its evidence, gaps and possible contradictions before approving an immutable Pack version.",
                    )}{" "}
                  </p>
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function SourceEditor({
  detail,
  busy,
  save,
  setDirty,
  onVersion,
}: {
  detail: OwnerSourceDetail | null;
  busy: boolean;
  save: Save;
  setDirty: (value: boolean) => void;
  onVersion: (id: string) => void;
}) {
  const { t } = useWorldLibraryText();
  const initial = {
    title: detail?.title ?? "",
    format: (detail?.format === "md" ? "md" : "txt") as "txt" | "md",
    text: detail?.text ?? "",
    author: detail?.author ?? "",
    visibility: detail?.visibility ?? "private",
    knowledge: detail?.knowledge ?? "source",
  };
  const [draft, setDraft] = useState(initial);
  const [fileError, setFileError] = useState("");
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  function change(patch: Partial<typeof draft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    setDirty(JSON.stringify(initial) !== JSON.stringify(next));
  }
  const latest = !detail || detail.history[0]?.versionId === detail.versionId;
  return (
    <section className={styles.panel}>
      <h2>
        {detail
          ? t("{title} · version {n}", {
              title: detail.title,
              n: detail.version,
            })
          : t("New source")}
      </h2>
      {detail && (
        <label>
          {" "}
          {t("Version history")}{" "}
          <select
            value={detail.versionId}
            disabled={busy || dirty}
            onChange={(e) => onVersion(e.target.value)}
          >
            {detail.history.map((s) => (
              <option key={s.versionId} value={s.versionId}>
                {" "}
                {t("Version")} {s.version} — {s.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {!latest && (
        <p>
          {" "}
          {t(
            "This preserved historical version is read only. Select the latest version to make a correction.",
          )}{" "}
        </p>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await save({
            action: "source.save",
            sourceId: detail?.id ?? null,
            expectedVersionId: detail?.versionId ?? null,
            ...draft,
            author: draft.author.trim() || null,
          });
        }}
      >
        <fieldset disabled={busy || !latest || detail?.text === null}>
          <label>
            {" "}
            {t("Source title")}{" "}
            <input
              maxLength={240}
              required
              value={draft.title}
              onChange={(e) => change({ title: e.target.value })}
            />
          </label>
          <label>
            {" "}
            {t("Choose a TXT or Markdown file")}{" "}
            <input
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileError("");
                try {
                  if (!/\.(txt|md)$/i.test(file.name) || file.size > 1_000_000)
                    throw new Error(
                      "Choose a UTF-8 TXT or Markdown file under 1 MB.",
                    );
                  const value = new TextDecoder("utf-8", {
                    fatal: true,
                    ignoreBOM: true,
                  }).decode(await file.arrayBuffer());
                  if (
                    value.length > 250_000 ||
                    !value.trim() ||
                    value.includes("\u0000")
                  )
                    throw new Error(
                      "Use non-empty text up to 250,000 characters, without null bytes.",
                    );
                  change({
                    title: draft.title || file.name,
                    format: /\.md$/i.test(file.name) ? "md" : "txt",
                    text: value,
                  });
                } catch (cause) {
                  setFileError(message(cause));
                }
                event.target.value = "";
              }}
            />
          </label>
          {fileError && (
            <p role="alert" className={styles.error}>
              {t(fileError)}
            </p>
          )}
          <div className={styles.twoFields}>
            <label>
              {" "}
              {t("Format")}{" "}
              <select
                value={draft.format}
                onChange={(e) =>
                  change({ format: e.target.value as "txt" | "md" })
                }
              >
                <option value="txt">{t("Plain text")}</option>
                <option value="md">{t("Markdown")}</option>
              </select>
            </label>
            <label>
              {" "}
              {t("Author / attribution")}{" "}
              <input
                maxLength={240}
                value={draft.author}
                onChange={(e) => change({ author: e.target.value })}
              />
            </label>
          </div>
          <div className={styles.twoFields}>
            <label>
              {" "}
              {t("Source access")}{" "}
              <select
                value={draft.visibility}
                onChange={(e) =>
                  change({ visibility: e.target.value as "public" | "private" })
                }
              >
                <option value="private">{t("Private source")}</option>
                <option value="public">
                  {" "}
                  {t("Eligible for public evidence after review")}{" "}
                </option>
              </select>
            </label>
            <label>
              {" "}
              {t("Knowledge scope")}{" "}
              <select
                value={draft.knowledge}
                onChange={(e) =>
                  change({
                    knowledge: e.target.value as "source" | "future_source",
                  })
                }
              >
                <option value="source">{t("Source knowledge only")}</option>
                <option value="future_source">
                  {t("Future source events only")}
                </option>
              </select>
            </label>
          </div>
          <label>
            {" "}
            {t("Preserved source text")}{" "}
            <textarea
              rows={18}
              maxLength={250_000}
              required
              value={draft.text}
              onChange={(e) => change({ text: e.target.value })}
            />
          </label>
          <p>
            {" "}
            {t(
              "Saved text is preserved exactly, including line endings. Corrections create a new version. Public eligibility does not publish this source into a campaign.",
            )}{" "}
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
              {detail ? t("Save new source version") : t("Preserve source")}
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={() => {
                setDraft(initial);
                setDirty(false);
              }}
            >
              {" "}
              {t("Discard edit")}{" "}
            </button>
          </div>
        </fieldset>
      </form>
      {detail && (
        <details>
          <summary>{t("Source integrity")}</summary>
          <p className={styles.digest}>
            {t("SHA-256:")} {detail.digest}
          </p>
          <p className={styles.digest}>
            {t("Immutable version:")} {detail.versionId}
          </p>
        </details>
      )}
    </section>
  );
}

export function PackEditor({
  detail,
  sources,
  busy,
  save,
  setDirty,
  onVersion,
}: {
  detail: OwnerPackDetail;
  sources: OwnerSourceSummary[];
  busy: boolean;
  save: Save;
  setDirty: (value: boolean) => void;
  onVersion: (id: string) => void;
}) {
  const { t, w, language } = useWorldLibraryText();
  const [body, setBody] = useState(detail.body);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [refining, setRefining] = useState(false);
  const [reviewedConflicts, setReviewedConflicts] = useState<string[]>([]);
  const [reviewedUnknowns, setReviewedUnknowns] = useState<string[]>([]);
  const [coverageReviewed, setCoverageReviewed] = useState(false);
  const [canonIds, setCanonIds] = useState<string[]>([]);
  const dirty =
    rejectedIds.length > 0 ||
    JSON.stringify(body) !== JSON.stringify(detail.body);
  const latest = detail.history[0]?.versionId === detail.versionId;
  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
  function change(next: typeof body, rejected = rejectedIds) {
    setBody(next);
    setDirty(
      refining ||
        rejected.length > 0 ||
        JSON.stringify(next) !== JSON.stringify(detail.body),
    );
    setReviewedConflicts([]);
    setReviewedUnknowns([]);
    setCoverageReviewed(false);
    setCanonIds([]);
  }
  return (
    <section className={styles.panel}>
      <h2>
        {detail.title} {t("· version")} {detail.version}
      </h2>
      <p>
        {detail.status === "approved"
          ? t(
              "Approved immutable Pack. Editing creates a new draft; campaign pins stay on their chosen version.",
            )
          : t(
              "Draft: review evidence and uncertainties before approving this version.",
            )}
      </p>
      <label>
        {" "}
        {t("Version history")}{" "}
        <select
          value={detail.versionId}
          disabled={busy || dirty || refining}
          onChange={(e) => onVersion(e.target.value)}
        >
          {detail.history.map((p) => (
            <option key={p.versionId} value={p.versionId}>
              {" "}
              {t("Version")} {p.version} — {t(p.status)}
            </option>
          ))}
        </select>
      </label>
      {!latest && (
        <p>
          {t(
            "Historical version. Select the latest version to edit or approve.",
          )}
        </p>
      )}
      <ReviewOverview
        language={language}
        detail={detail}
        body={body}
        sources={sources}
        rejectedIds={rejectedIds}
      />
      <fieldset disabled={busy || !latest || refining}>
        <label>
          {" "}
          {t("Pack title")}{" "}
          <input
            maxLength={240}
            required
            value={body.title}
            onChange={(e) => change({ ...body, title: e.target.value })}
          />
        </label>
        <h3>{w("2 · Evidence and open questions")}</h3>
        <h3>{t("Coverage")}</h3>
        {body.coverage.map((c) => (
          <div key={c.sourceVersionId} className={styles.coverage}>
            <strong>
              {detail.evidence.find(
                (e) => e.sourceVersionId === c.sourceVersionId,
              )?.sourceTitle ?? t("Source")}
              : {c.processedUnits}/{c.totalUnits ?? t("unknown")}{" "}
              {t("lines")}{" "}
            </strong>
            <small>{t(c.status)}</small>
            {c.gaps.map((gap) => (
              <p key={t(gap)}>{t(gap)}</p>
            ))}
          </div>
        ))}
        <h3>{t("Possible contradictions")}</h3>
        {!body.contradictions.length && (
          <p>
            {" "}
            {t(
              "No conflicts were detected in explicit fields. This is not a semantic consistency guarantee.",
            )}{" "}
          </p>
        )}
        {body.contradictions.map((c) => (
          <div key={c.id} className={styles.reviewItem}>
            {c.claimIds.map((id) => (
              <blockquote key={id}>
                {body.claims.find((claim) => claim.id === id)?.text}
              </blockquote>
            ))}
            <label>
              {" "}
              {t("Owner resolution (leave empty to retain uncertainty)")}{" "}
              <input
                maxLength={240}
                value={c.resolution ?? ""}
                onChange={(e) =>
                  change({
                    ...body,
                    contradictions: body.contradictions.map((item) =>
                      item.id === c.id
                        ? {
                            ...item,
                            resolution: e.target.value || null,
                            status: e.target.value ? "resolved" : "unresolved",
                          }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={reviewedConflicts.includes(c.id)}
                disabled={dirty}
                onChange={() =>
                  setReviewedConflicts(toggle(reviewedConflicts, c.id))
                }
              />{" "}
              {t(
                "I reviewed this conflict and its remaining uncertainty.",
              )}{" "}
            </label>
          </div>
        ))}
        <h3>{t("Unknowns")}</h3>
        {body.unknowns.map((u) => (
          <label key={u.id} className={styles.reviewItem}>
            <span>{worldLibraryCompilerNote(language, u.question)}</span>
            <span className={styles.check}>
              <input
                type="checkbox"
                disabled={dirty}
                checked={reviewedUnknowns.includes(u.id)}
                onChange={() =>
                  setReviewedUnknowns(toggle(reviewedUnknowns, u.id))
                }
              />{" "}
              {t("Reviewed; uncertainty remains explicit.")}{" "}
            </span>
          </label>
        ))}
        <h3>{w("3 · Choose Canon, then approve")}</h3>
        <h3>{t("Claims and preserved evidence")}</h3>
        <p>
          {w(
            "Nothing is deleted from earlier versions. Save a new draft to apply edits or rejections, then review that version before approval.",
          )}
        </p>
        <p>
          {" "}
          {t(
            "Expand a claim to review its original passage. Change the origin to inference or authored assumption when rewriting source text. Character knowledge needs an explicit known-by entity and entry time.",
          )}{" "}
        </p>
        {body.claims.map((claim) => {
          const entity = body.entities.find((e) => e.id === claim.subjectId);
          const update = (patch: Partial<typeof claim>) =>
            change({
              ...body,
              claims: body.claims.map((c) =>
                c.id === claim.id ? { ...c, ...patch } : c,
              ),
            });
          const eligible =
            ownerClaimCanonEligible(body, claim) &&
            !rejectedIds.includes(claim.id);
          return (
            <details
              key={claim.id}
              className={styles.claim}
              id={`claim-${claim.id}`}
            >
              <summary>
                {entity?.name}: {claim.text.slice(0, 120)}
                {claim.text.length > 120 ? "…" : ""}
                <small>
                  {t(claim.origin)} · {t(claim.visibility)} ·{" "}
                  {t(claim.knowledge)} · {t(claim.authority)}
                </small>
              </summary>
              {rejectedIds.includes(claim.id) && (
                <p role="status">{w("Rejected for the next draft")}</p>
              )}
              <div className={styles.actions}>
                <button
                  disabled={rejectedIds.includes(claim.id)}
                  onClick={() =>
                    update({
                      epistemic: "hypothesis",
                      knowledge: "source",
                      knownByEntityIds: [],
                      uncertainty:
                        claim.uncertainty ??
                        w(
                          "Keep this claim uncertain until the owner resolves it.",
                        ),
                    })
                  }
                >
                  {w("Keep uncertain")}
                </button>
                <button
                  disabled={rejectedIds.includes(claim.id)}
                  onClick={() =>
                    update({ knowledge: "source", knownByEntityIds: [] })
                  }
                >
                  {w("Retain as reference")}
                </button>
                <button
                  onClick={() => {
                    const next = toggle(rejectedIds, claim.id);
                    setRejectedIds(next);
                    change(body, next);
                  }}
                >
                  {w(
                    rejectedIds.includes(claim.id)
                      ? "Undo rejection"
                      : "Reject",
                  )}
                </button>
              </div>
              <fieldset disabled={rejectedIds.includes(claim.id)}>
                <label>
                  {" "}
                  {t("Claim text")}{" "}
                  <textarea
                    rows={3}
                    maxLength={4000}
                    value={claim.text}
                    onChange={(e) =>
                      update({
                        text: e.target.value,
                        origin:
                          claim.origin === "source_fact"
                            ? "scenario_assumption"
                            : claim.origin,
                      })
                    }
                  />
                </label>
                <div className={styles.twoFields}>
                  <label>
                    {" "}
                    {t("Origin")}{" "}
                    <select
                      value={claim.origin}
                      onChange={(e) =>
                        update({
                          origin: e.target.value as typeof claim.origin,
                        })
                      }
                    >
                      <option
                        value="source_fact"
                        disabled={
                          detail.body.claims.find(
                            (original) => original.id === claim.id,
                          )?.origin !== "source_fact"
                        }
                      >
                        {t("Exact source assertion")}
                      </option>
                      <option value="source_inference">
                        {t("Source inference")}
                      </option>
                      <option value="scenario_assumption">
                        {" "}
                        {t("Owner-authored assumption")}{" "}
                      </option>
                    </select>
                  </label>
                  <label>
                    {" "}
                    {t("Epistemic status")}{" "}
                    <select
                      value={claim.epistemic}
                      onChange={(e) =>
                        update({
                          epistemic: e.target.value as typeof claim.epistemic,
                        })
                      }
                    >
                      {[
                        "unknown",
                        "fact",
                        "rumor",
                        "lie",
                        "hypothesis",
                        "intention",
                      ].map((s) => (
                        <option value={s} key={s}>
                          {t(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className={styles.twoFields}>
                  <label>
                    {" "}
                    {t("Visibility")}{" "}
                    <select
                      value={claim.visibility}
                      onChange={(e) =>
                        update({
                          visibility: e.target.value as typeof claim.visibility,
                        })
                      }
                    >
                      <option value="private">{t("Private")}</option>
                      <option value="public">
                        {t("Public eligible evidence")}
                      </option>
                    </select>
                  </label>
                  <label>
                    {" "}
                    {t("Knowledge")}{" "}
                    <select
                      value={claim.knowledge}
                      onChange={(e) =>
                        update({
                          knowledge: e.target.value as typeof claim.knowledge,
                          knownByEntityIds: [],
                        })
                      }
                    >
                      <option value="source">{t("Source knowledge")}</option>
                      <option value="future_source">
                        {t("Future source")}
                      </option>
                      <option value="canon_at_entry">
                        {t("Canon at entry")}
                      </option>
                      <option value="character">
                        {" "}
                        {t("Character knowledge at entry")}{" "}
                      </option>
                    </select>
                  </label>
                </div>
                <div className={styles.twoFields}>
                  <label>
                    {" "}
                    {t("Valid from (world minute)")}{" "}
                    <input
                      type="number"
                      min={0}
                      value={claim.validFrom ?? ""}
                      onChange={(e) =>
                        update({
                          validFrom:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    {" "}
                    {t("Valid until (optional)")}{" "}
                    <input
                      type="number"
                      min={0}
                      value={claim.validUntil ?? ""}
                      onChange={(e) =>
                        update({
                          validUntil:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                {claim.knowledge === "character" && (
                  <label>
                    {" "}
                    {t("Known by")}{" "}
                    <select
                      value={claim.knownByEntityIds[0] ?? ""}
                      onChange={(e) =>
                        update({
                          knownByEntityIds: e.target.value
                            ? [e.target.value]
                            : [],
                        })
                      }
                    >
                      <option value="">
                        {" "}
                        {t("Choose an entity with evidenced knowledge")}{" "}
                      </option>
                      {body.entities.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  {" "}
                  {t("Uncertainty / inference justification")}{" "}
                  <input
                    maxLength={240}
                    value={claim.uncertainty ?? ""}
                    onChange={(e) =>
                      update({ uncertainty: e.target.value || null })
                    }
                  />
                </label>
                {detail.evidence
                  .filter((e) => e.claimId === claim.id)
                  .map((e, i) => (
                    <div
                      className={styles.evidence}
                      key={`${e.sourceVersionId}:${e.locator}:${i}`}
                    >
                      <strong>
                        {e.sourceTitle} {t("· text offsets")} {e.locator}
                      </strong>
                      <pre>{e.excerpt}</pre>
                      <small className={styles.digest}>
                        {" "}
                        {t("Version")} {e.sourceVersionId} {t("· SHA-256")}{" "}
                        {e.digest}
                      </small>
                    </div>
                  ))}
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    disabled={
                      dirty || !eligible || detail.status === "approved"
                    }
                    checked={canonIds.includes(claim.id)}
                    onChange={() => setCanonIds(toggle(canonIds, claim.id))}
                  />{" "}
                  {w("Mark as Canon on approval")}{" "}
                </label>
                {!eligible && (
                  <small>
                    {" "}
                    {t(
                      "Canon needs a reviewed fact, entry/character scope, a start time and no unresolved conflict.",
                    )}{" "}
                  </small>
                )}
              </fieldset>
            </details>
          );
        })}
        <div className={styles.actions}>
          <button
            disabled={!dirty || !body.title.trim()}
            onClick={() => save(ownerPackDraft(detail, body, rejectedIds))}
          >
            {" "}
            {t("Save new draft version")}{" "}
          </button>
          <button
            disabled={!dirty}
            onClick={() => {
              setRejectedIds([]);
              change(detail.body, []);
              setDirty(false);
            }}
          >
            {" "}
            {t("Discard edit")}{" "}
          </button>
        </div>
        {detail.status === "draft" && (
          <div className={styles.approval}>
            <CanonPreview
              language={language}
              body={body}
              canonIds={canonIds}
              rejectedIds={rejectedIds}
            />
            <label className={styles.check}>
              <input
                type="checkbox"
                disabled={dirty}
                checked={coverageReviewed}
                onChange={(e) => setCoverageReviewed(e.target.checked)}
              />{" "}
              {t(
                "I reviewed source coverage, omissions and the evidence above.",
              )}{" "}
            </label>
            <p>
              {" "}
              {t(
                "Approval freezes a reusable version. Only individually selected claims become canon; source-only and future material remain reference.",
              )}{" "}
            </p>
            <button
              disabled={
                dirty ||
                !coverageReviewed ||
                reviewedConflicts.length !== body.contradictions.length ||
                reviewedUnknowns.length !== body.unknowns.length
              }
              onClick={() =>
                save({
                  action: "pack.approve",
                  expectedVersionId: detail.versionId,
                  reviewedConflictIds: reviewedConflicts,
                  reviewedUnknownIds: reviewedUnknowns,
                  acknowledgeCoverage: coverageReviewed,
                  canonClaimIds: canonIds,
                })
              }
            >
              {" "}
              {t("Approve reviewed Pack version")}{" "}
            </button>
          </div>
        )}
      </fieldset>
      <RefinementEditor
        language={language}
        detail={detail}
        disabled={busy || dirty || !latest}
        save={save}
        onDirty={(value) => {
          setRefining(value);
          setDirty(value || dirty);
        }}
      />
    </section>
  );
}

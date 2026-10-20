"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import {
  useCampaignData,
  useCampaignDraftScope,
  TimelineDraftNotice,
  useUnsavedChanges,
} from "./persistence-context";
import { Badge, Button, Icon, Modal, Panel, Tabs } from "./ui";
import {
  createMutationAttempt,
  errorMessage,
  loadVersions,
} from "@/lib/persistence/client";
import {
  documentDraft,
  documentRestore,
  documentSave,
  isDocumentDirty,
  rebaseDocumentDraft,
  createDocumentFileReader,
} from "@/lib/persistence/document-model";
import type {
  DocumentRecord,
  DocumentVersion,
  Mutation,
} from "@/lib/persistence/contracts";

import { isReferenceMetadata } from "@/lib/persistence/reference-metadata";
import { MarkdownView } from "./markdown-view";

const statusLabels = {
  canon: "Canon",
  reference: "Reference",
  archived: "Archived",
} as const;
const libraryTabs = ["All documents", "Canon", "Reference", "Archived"];
const libraryStatus = {
  Canon: "canon",
  Reference: "reference",
  Archived: "archived",
} as const;

function VersionHistory({
  record,
  onRestore,
  disabled,
}: {
  record: DocumentRecord;
  onRestore: (version: DocumentVersion) => Promise<void>;
  disabled: boolean;
}) {
  const { t, language } = useLanguage();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<DocumentVersion | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    loadVersions(record.campaign_id, record.id)
      .then((rows) => {
        if (active) {
          setVersions(rows);
          setError("");
        }
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [record.campaign_id, record.id, record.revision, retry]);
  return (
    <Panel title={t("Version history")}>
      <p className="muted">
        {t(
          "Every save keeps its previous versions. Restoring copies a selected version into a new current version.",
        )}
      </p>
      {loading && <p role="status">{t("Loading document history…")}</p>}
      {error && (
        <>
          <p role="alert">{t(error)}</p>
          <Button
            onClick={() => {
              setLoading(true);
              setRetry(retry + 1);
            }}
          >
            {t("Retry loading")}
          </Button>
        </>
      )}
      {!loading && !error && !versions.length && (
        <p>{t("No document versions were returned.")}</p>
      )}
      {versions.map((version) => (
        <button
          type="button"
          className="document-row"
          key={version.id}
          onClick={() => setSelected(version)}
        >
          <Icon name="FileText" />
          <div>
            <h3>
              {t("Version {number}", { number: version.version })} ·{" "}
              {version.title}
            </h3>
            <small>
              {new Date(version.created_at).toLocaleString(language)} ·{" "}
              {t(statusLabels[version.status])}
            </small>
            {version.restored_from && (
              <small>{t("Restored as a new version")}</small>
            )}
          </div>
          <Badge>
            {t(
              version.id === record.current_version_id
                ? "Current version"
                : "View version",
            )}
          </Badge>
        </button>
      ))}
      {selected && (
        <Modal
          title={t("Version {number}", { number: selected.version })}
          onClose={() => setSelected(null)}
        >
          <h3>{selected.title}</h3>
          <Badge>{t(statusLabels[selected.status])}</Badge>
          <div className="persistence-document-body">
            {selected.body || t("This version has no text.")}
          </div>
          <p className="muted">
            {t(
              "This creates a new current version. No saved history is removed.",
            )}
          </p>
          <Button
            primary
            disabled={disabled || selected.id === record.current_version_id}
            onClick={async () => {
              await onRestore(selected);
              setSelected(null);
            }}
          >
            {t("Restore as new version")}
          </Button>
        </Modal>
      )}
    </Panel>
  );
}

/** One document draft: the title, status and text being edited, a file read into it, and its save and restore, each
 * keeping one request identity until the server answers (shared by the Library's panel and the DM chat's guide). */
function useDocumentDraft({
  record,
  guide,
  onSaved,
  onDirty,
  onSaving,
}: {
  record?: DocumentRecord;
  guide: boolean;
  onSaved: (id: string) => void;
  onDirty: (dirty: boolean) => void;
  onSaving: (saving: boolean) => void;
}) {
  const { campaignId, mutate } = useCampaignData();
  const scope = useCampaignDraftScope();
  const [draft, setDraft] = useState(() => documentDraft(record));
  const [baseline, setBaseline] = useState(() => documentDraft(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileReader] = useState(createDocumentFileReader);
  const fileInput = useRef<HTMLInputElement>(null);
  const attempt = useRef<Mutation | null>(null);
  const busy = useRef(false);
  const dirty = isDocumentDirty(draft, baseline);
  useUnsavedChanges(dirty || reading);
  useEffect(() => () => fileReader.cancel(), [fileReader]);
  const newer = Boolean(
    scope.stale || (record && record.revision !== baseline.expectedRevision),
  );
  const change = (patch: Partial<typeof draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onDirty(isDocumentDirty(next, baseline));
    setSaved(false);
  };
  const readFile = async (file: File) => {
    if (busy.current) return;
    if (file.size > 200000 || !/\.(txt|md)$/i.test(file.name)) {
      setError("Choose a TXT or MD file smaller than 200 KB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    busy.current = true;
    setReading(true);
    onSaving(true);
    setError("");
    const result = await fileReader.read(() => file.text());
    if (result.status === "stale") return;
    if (result.status === "ready") {
      change({
        body: result.body,
        ...(draft.title.trim()
          ? {}
          : { title: file.name.replace(/\.(txt|md)$/i, "") }),
      });
    } else {
      setError("The file could not be read. Your existing draft is unchanged.");
    }
    busy.current = false;
    setReading(false);
    onSaving(false);
    if (fileInput.current) fileInput.current.value = "";
  };
  const cancelFileRead = () => {
    fileReader.cancel();
    busy.current = false;
    setReading(false);
    onSaving(false);
    if (fileInput.current) fileInput.current.value = "";
  };
  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    onSaving(true);
    setError("");
    setSaved(false);
    attempt.current = createMutationAttempt(
      attempt.current,
      scope.bind(
        documentSave(
          campaignId,
          guide ? { ...draft, status: "reference" } : draft,
        ),
        guide ? "timeline" : "campaign",
      ),
    );
    try {
      const result = await mutate(attempt.current);
      const next = {
        ...draft,
        id: result.id,
        expectedRevision: result.revision,
      };
      setDraft(next);
      setBaseline(next);
      onDirty(false);
      attempt.current = null;
      setSaved(true);
      onSaved(result.id);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSaving(false);
      onSaving(false);
    }
  };
  const restore = async (version: DocumentVersion) => {
    if (busy.current || !record || dirty) return;
    busy.current = true;
    setSaving(true);
    onSaving(true);
    setError("");
    setSaved(false);
    try {
      attempt.current = createMutationAttempt(
        attempt.current,
        scope.bind(
          documentRestore(campaignId, record, version),
          guide ? "timeline" : "campaign",
        ),
      );
      const result = await mutate(attempt.current);
      const next = {
        id: record.id,
        title: version.title,
        status: version.status,
        body: version.body,
        expectedRevision: result.revision,
      };
      setDraft(next);
      setBaseline(next);
      onDirty(false);
      attempt.current = null;
      setSaved(true);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSaving(false);
      onSaving(false);
    }
  };
  /** Back to the saved record: the draft, its fence and any pending request are dropped. */
  const discard = () => {
    if (!record) return;
    const next = documentDraft(record);
    scope.reset();
    setDraft(next);
    setBaseline(next);
    onDirty(false);
    setSaved(false);
    setError("");
    attempt.current = null;
  };
  /** After the owner compared a newer saved version: keep the draft for the next revision. */
  const keepDraft = () => {
    if (!record || scope.stale) return;
    const next = rebaseDocumentDraft(draft, record);
    const latest = documentDraft(record);
    setDraft(next);
    setBaseline(latest);
    onDirty(isDocumentDirty(next, latest));
    setError("");
    attempt.current = null;
  };
  return { draft, change, dirty, newer, saving, reading, error, saved, scope, fileInput, readFile, cancelFileRead, save, restore, discard, keepDraft };
}

type DocumentDraftState = ReturnType<typeof useDocumentDraft>;

/** A newer saved version arrived while the owner edits: compare, then keep the draft only on purpose. */
function NewerVersion({ record, state }: { record?: DocumentRecord; state: DocumentDraftState }) {
  const { t } = useLanguage();
  return (
    <Panel title={t("A newer saved version is available")}>
      <p>
        {t(
          "Your draft is unchanged. Compare the current saved text below, then discard your draft only if you choose.",
        )}
      </p>
      <h3>{record?.title}</h3>
      {record && <Badge>{t(statusLabels[record.status])}</Badge>}
      <div className="persistence-document-body">{record?.body}</div>
      <Button
        disabled={state.scope.stale}
        onClick={() => {
          if (
            !record ||
            !window.confirm(
              t(
                "Keep your draft for the next revision? Nothing is written until you press Save new version.",
              ),
            )
          )
            return;
          state.keepDraft();
        }}
      >
        {t("Keep my draft for the next revision")}
      </Button>
    </Panel>
  );
}

/** The DM chat's guide editor (the Library has its own panel, LibraryDocumentEditor). */
export function DocumentEditor({
  record,
  onSaved = () => {},
  onDirty = () => {},
  onSaving = () => {},
  guide = false,
}: {
  record?: DocumentRecord;
  onSaved?: (id: string) => void;
  onDirty?: (dirty: boolean) => void;
  onSaving?: (saving: boolean) => void;
  guide?: boolean;
}) {
  const { t } = useLanguage();
  const { refresh } = useCampaignData();
  const state = useDocumentDraft({ record, guide, onSaved, onDirty, onSaving });
  const { draft, change, dirty, newer, saving, reading, error, saved, scope, fileInput } = state;
  const [history, setHistory] = useState(false);
  return (
    <div className="persistent-documents">
      <Panel
        title={t(
          guide ? "DM Guide" : record ? "Edit document" : "New Document",
        )}
      >
        <TimelineDraftNotice stale={scope.stale} />
        <p className="muted">
          {t(
            guide
              ? "Guidance changes apply to the current timeline."
              : "Canon and reference corrections apply across this campaign's timelines.",
          )}
        </p>
        {guide && (
          <p className="muted">
            {t(
              "Save or restore guidance explicitly for future turns. Sending feedback alone never changes this guide. Guidance cannot override mechanics, your choices, established canon, or secrets.",
            )}
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void state.save();
          }}
        >
          <fieldset className="persistence-fields" disabled={saving || reading}>
            <label className="field">
              {t("Document title")}
              <input
                required
                maxLength={200}
                value={draft.title}
                onChange={(event) => change({ title: event.target.value })}
              />
            </label>
            <label className="field">
              {t("Document status")}
              <select
                value={draft.status}
                disabled={guide}
                onChange={(event) =>
                  change({
                    status: event.target.value as DocumentRecord["status"],
                  })
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t("Document text")}
              <textarea
                rows={16}
                maxLength={200000}
                value={draft.body}
                onChange={(event) => change({ body: event.target.value })}
              />
            </label>
            <label className="field">
              {t("Read a text or Markdown file")}
              <input
                type="file"
                ref={fileInput}
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void state.readFile(file);
                }}
              />
            </label>
            <p className="muted">
              {t(
                "Plain text and Markdown are stored as written. This Library contains player-readable material only; do not put DM-private notes here.",
              )}
            </p>
            {error && <p role="alert">{t(error)}</p>}
            {newer && <NewerVersion record={record} state={state} />}
            <div className="button-row">
              <Button
                primary
                type="submit"
                disabled={!dirty || !draft.title.trim() || newer}
              >
                {t(saving ? "Saving…" : "Save new version")}
              </Button>
              <Button onClick={() => void refresh().catch(() => {})}>
                {t("Refresh saved data")}
              </Button>
              {record && (
                <Button
                  onClick={() => {
                    if (
                      !dirty ||
                      window.confirm(t("Discard your unsaved changes?"))
                    )
                      state.discard();
                  }}
                >
                  {t("Use saved values")}
                </Button>
              )}
            </div>
            <p role="status">
              {t(
                dirty
                  ? "Unsaved changes"
                  : saved
                    ? "Saved"
                    : "Changes take effect after Save.",
              )}
            </p>
            {record && (
              <Button onClick={() => setHistory(!history)}>
                {t(history ? "Hide history" : "Version history")}
              </Button>
            )}
          </fieldset>
        </form>
        {reading && (
          <div className="button-row">
            <p role="status">
              {t(
                "Reading file… Your draft stays unchanged until reading finishes.",
              )}
            </p>
            <Button onClick={state.cancelFileRead}>{t("Cancel file read")}</Button>
          </div>
        )}
      </Panel>
      {record && history && (
        <>
          <p className="muted">
            {dirty &&
              t("Save or discard your draft before restoring a version.")}
          </p>
          <VersionHistory
            record={record}
            disabled={saving || reading || dirty || newer}
            onRestore={state.restore}
          />
        </>
      )}
    </div>
  );
}

// Fix run after session 2 (item 25): the Library's document is one panel. It reads cleanly (Markdown rendered);
// «Изменить» turns the same panel into the editor (title, status, text, «Загрузить файл» as a small link); «Сохранить»
// closes the panel back to the list with «Сохранено» on the saved row; the history waits behind a small «Версии»; no
// system paragraphs. The panel opens only when a document is picked.

/** The editor inside the Library's document panel. */
export function LibraryDocumentEditor({
  record,
  guide = false,
  onSaved,
  onCancel,
  onDirty = () => {},
  onSaving = () => {},
}: {
  record?: DocumentRecord;
  guide?: boolean;
  onSaved: (id: string) => void;
  onCancel: () => void;
  onDirty?: (dirty: boolean) => void;
  onSaving?: (saving: boolean) => void;
}) {
  const { t } = useLanguage();
  const state = useDocumentDraft({ record, guide, onSaved, onDirty, onSaving });
  const { draft, change, dirty, newer, saving, reading, error, scope, fileInput } = state;
  return (
    <form
      className="library-editor"
      onSubmit={(event) => {
        event.preventDefault();
        void state.save();
      }}
    >
      <TimelineDraftNotice stale={scope.stale} />
      <fieldset className="persistence-fields" disabled={saving || reading}>
        <div className="library-editor-row">
          <label className="field">
            {t("Document title")}
            <input
              required
              maxLength={200}
              value={draft.title}
              onChange={(event) => change({ title: event.target.value })}
            />
          </label>
          <label className="field">
            {t("Document status")}
            <select
              value={draft.status}
              disabled={guide}
              onChange={(event) =>
                change({
                  status: event.target.value as DocumentRecord["status"],
                })
              }
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {t(label)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          {t("Document text")}
          <textarea
            rows={18}
            maxLength={200000}
            value={draft.body}
            onChange={(event) => change({ body: event.target.value })}
          />
        </label>
        <div className="library-editor-tools">
          <button
            type="button"
            className="text-link"
            onClick={() => fileInput.current?.click()}
          >
            {t("Upload a file")}
          </button>
          <input
            type="file"
            hidden
            ref={fileInput}
            accept=".txt,.md,text/plain,text/markdown"
            aria-label={t("Upload a file")}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void state.readFile(file);
            }}
          />
          {reading && (
            <>
              <span role="status">
                {t(
                  "Reading file… Your draft stays unchanged until reading finishes.",
                )}
              </span>
              <button type="button" className="text-link" onClick={state.cancelFileRead}>
                {t("Cancel file read")}
              </button>
            </>
          )}
        </div>
        {error && <p role="alert">{t(error)}</p>}
        {newer && <NewerVersion record={record} state={state} />}
        <div className="button-row">
          <Button
            primary
            type="submit"
            disabled={!dirty || !draft.title.trim() || newer}
          >
            {t(saving ? "Saving…" : "Save the document")}
          </Button>
          <Button
            onClick={() => {
              if (!dirty || window.confirm(t("Discard your unsaved changes?"))) {
                state.discard();
                onDirty(false);
                onCancel();
              }
            }}
          >
            {t("Cancel")}
          </Button>
          {dirty && <span role="status" className="muted">{t("Unsaved changes")}</span>}
        </div>
      </fieldset>
    </form>
  );
}

/** «Версии»: the document's saved versions; restoring one writes a new current version. */
function DocumentVersions({ record, onRestored }: { record: DocumentRecord; onRestored: () => void }) {
  const { t } = useLanguage();
  const state = useDocumentDraft({ record, guide: false, onSaved: () => {}, onDirty: () => {}, onSaving: () => {} });
  return (
    <>
      {state.error && <p role="alert">{t(state.error)}</p>}
      <VersionHistory
        record={record}
        disabled={state.saving || state.newer}
        onRestore={async (version) => {
          await state.restore(version);
          onRestored();
        }}
      />
    </>
  );
}

export function PersistentLibrary({
  reviewOnly = false,
  initialDocumentId = null,
  initialEditing = false,
}: { reviewOnly?: boolean; initialDocumentId?: string | null; initialEditing?: boolean } = {}) {
  const { t } = useLanguage();
  const { data, loading, error, refresh, campaignId } = useCampaignData();
  const [selectedId, setSelectedId] = useState<string | null>(initialDocumentId);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(initialEditing && !!initialDocumentId && !reviewOnly);
  const [versions, setVersions] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All documents");
  const [search, setSearch] = useState("");
  const selected = data?.documents.find(
    (document) => document.id === selectedId && !isReferenceMetadata(document),
  );
  const leaveEditor = () => {
    if (saving) return false;
    if (dirty && !window.confirm(t("Discard your unsaved changes?"))) return false;
    setDirty(false);
    return true;
  };
  const select = (id: string | null) => {
    if (id === selectedId && !creating) return;
    if (!leaveEditor()) return;
    setSavedId(null);
    setSelectedId(id);
    setCreating(id === null);
    setEditing(id === null);
    setVersions(false);
  };
  const close = () => {
    if (!leaveEditor()) return;
    setSelectedId(null);
    setCreating(false);
    setEditing(false);
    setVersions(false);
  };
  // Saving closes the panel: back to the list with «Сохранено» on the saved row.
  const afterSave = (id: string) => {
    setDirty(false);
    setSavedId(id);
    setSelectedId(null);
    setCreating(false);
    setEditing(false);
    setVersions(false);
  };
  const documents =
    data?.documents.filter(
      (document) =>
        !isReferenceMetadata(document) &&
        (filter === "All documents" ||
          document.status === libraryStatus[filter as keyof typeof libraryStatus]) &&
        `${document.title} ${document.body}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    ) ?? [];
  const sections = (Object.keys(statusLabels) as DocumentRecord["status"][])
    .map((status) => ({
      status,
      rows: documents.filter((document) => document.status === status),
    }))
    .filter(({ rows }) => rows.length > 0);
  const guide = !!selected && selected.id === data?.dmGuideDocumentId;
  const panelOpen = creating || !!selected;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{data?.campaign.title}</span>
          <h1>{t("Library")}</h1>
          <p>{t("The words that hold your world together.")}</p>
        </div>
        {!reviewOnly && (
          <Button primary disabled={saving} onClick={() => select(null)}>
            {t("New Document")}
          </Button>
        )}
      </div>
      {loading && <p role="status">{t("Loading campaign documents…")}</p>}
      {error && (
        <Panel>
          <p role="alert">{t(error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {data && (
        <div className="persistent-documents" key={campaignId}>
          <div className="page-heading compact">
            <Tabs options={libraryTabs} value={filter} onChange={setFilter} />
          </div>
          <input
            className="library-search"
            type="search"
            aria-label={t("Search documents")}
            placeholder={t("Search your library…")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className={panelOpen ? "library-layout library-layout-open" : "library-layout"}>
            <div className="library-list">
              {!documents.length && (
                <Panel>
                  <p className="muted">
                    {t(
                      data.documents.some((document) => !isReferenceMetadata(document))
                        ? "No documents match your search."
                        : "No documents yet. Add the world, character, or campaign notes you want to keep.",
                    )}
                  </p>
                </Panel>
              )}
              {sections.map(({ status, rows }) => (
                <details
                  key={status}
                  className="rules-advanced"
                  open={filter !== "All documents" || status === "canon" || rows.some((row) => row.id === savedId || row.id === selectedId)}
                >
                  <summary>
                    {t(statusLabels[status])} ({rows.length})
                    <span>
                      {t(
                        status === "canon"
                          ? "The current truth of your campaign"
                          : status === "reference"
                            ? "Supporting material"
                            : "Retained for history",
                      )}
                    </span>
                  </summary>
                  {rows.map((document) => (
                    <button
                      type="button"
                      key={document.id}
                      className="document-row"
                      aria-pressed={selectedId === document.id}
                      disabled={saving}
                      onClick={() => select(document.id)}
                    >
                      <Icon name={status === "canon" ? "BookOpen" : "FileText"} />
                      <div>
                        <h3>{document.title}</h3>
                        <small>
                          {t(statusLabels[document.status])} ·{" "}
                          {t("Revision {number}", { number: document.revision })}
                        </small>
                      </div>
                      {savedId === document.id ? (
                        <span className="document-saved" role="status">{t("Saved")}</span>
                      ) : (
                        <Icon name="ChevronRight" />
                      )}
                    </button>
                  ))}
                </details>
              ))}
            </div>
            {creating ? (
              <Panel className="document-panel" title={t("New Document")}>
                <LibraryDocumentEditor
                  key={`${campaignId}:new`}
                  onDirty={setDirty}
                  onSaving={setSaving}
                  onSaved={afterSave}
                  onCancel={() => { setDirty(false); setCreating(false); setEditing(false); }}
                />
              </Panel>
            ) : selected ? (
              <Panel
                className="document-panel"
                title={selected.title}
                action={
                  <span className="document-panel-actions">
                    {!reviewOnly && !editing && (
                      <Button onClick={() => { setVersions(false); setEditing(true); }}>{t("Edit this document")}</Button>
                    )}
                    <Button label={t("Close the document")} onClick={close}>
                      <Icon name="X" />
                    </Button>
                  </span>
                }
              >
                <div className="document-panel-bar">
                  <Badge>{t(statusLabels[selected.status])}</Badge>
                  <small>{t("Revision {number}", { number: selected.revision })}</small>
                  {!reviewOnly && !editing && (
                    <button type="button" className="text-link document-versions-link" aria-expanded={versions} onClick={() => setVersions(!versions)}>
                      {t("Versions")}
                    </button>
                  )}
                </div>
                {editing ? (
                  <LibraryDocumentEditor
                    key={`${campaignId}:${selected.id}`}
                    record={selected}
                    guide={guide}
                    onDirty={setDirty}
                    onSaving={setSaving}
                    onSaved={afterSave}
                    onCancel={() => { setDirty(false); setEditing(false); }}
                  />
                ) : (
                  <div className="persistence-document-body">
                    {selected.body ? <MarkdownView text={selected.body} title={selected.title} /> : t(guide ? "The DM guide is empty. Press Edit to write it." : "This version has no text.")}
                  </div>
                )}
                {versions && !editing && (
                  <DocumentVersions key={selected.id} record={selected} onRestored={() => setVersions(false)} />
                )}
              </Panel>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

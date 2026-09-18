"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Modal, Panel } from "./ui";
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

const statusLabels = {
  canon: "Canon",
  reference: "Reference",
  archived: "Archived",
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
  const { campaignId, mutate, refresh } = useCampaignData();
  const [draft, setDraft] = useState(() => documentDraft(record));
  const [baseline, setBaseline] = useState(() => documentDraft(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileReader] = useState(createDocumentFileReader);
  const fileInput = useRef<HTMLInputElement>(null);
  const attempt = useRef<Mutation | null>(null);
  const busy = useRef(false);
  const dirty = isDocumentDirty(draft, baseline);
  useUnsavedChanges(dirty || reading);
  useEffect(() => () => fileReader.cancel(), [fileReader]);
  const newer = Boolean(
    record && record.revision !== baseline.expectedRevision,
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
      documentSave(
        campaignId,
        guide ? { ...draft, status: "reference" } : draft,
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
        documentRestore(campaignId, record, version),
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
  return (
    <div className="persistent-documents">
      <Panel
        title={t(
          guide ? "DM Guide" : record ? "Edit document" : "New Document",
        )}
      >
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
            void save();
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
                  if (file) void readFile(file);
                }}
              />
            </label>
            <p className="muted">
              {t(
                "Plain text and Markdown are stored as written. This Library contains player-readable material only; do not put DM-private notes here.",
              )}
            </p>
            {error && <p role="alert">{t(error)}</p>}
            {newer && (
              <Panel title={t("A newer saved version is available")}>
                <p>
                  {t(
                    "Your draft is unchanged. Compare the current saved text below, then discard your draft only if you choose.",
                  )}
                </p>
                <h3>{record?.title}</h3>
                <Badge>{t(statusLabels[record!.status])}</Badge>
                <div className="persistence-document-body">{record?.body}</div>
                <Button
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
                    const next = rebaseDocumentDraft(draft, record);
                    const latest = documentDraft(record);
                    setDraft(next);
                    setBaseline(latest);
                    onDirty(isDocumentDirty(next, latest));
                    setError("");
                    attempt.current = null;
                  }}
                >
                  {t("Keep my draft for the next revision")}
                </Button>
              </Panel>
            )}
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
                    ) {
                      const next = documentDraft(record);
                      setDraft(next);
                      setBaseline(next);
                      onDirty(false);
                      setSaved(false);
                      setError("");
                      attempt.current = null;
                    }
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
            <Button onClick={cancelFileRead}>{t("Cancel file read")}</Button>
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
            onRestore={restore}
          />
        </>
      )}
    </div>
  );
}

export function PersistentLibrary() {
  const { t } = useLanguage();
  const { data, loading, error, refresh, campaignId } = useCampaignData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const selected = data?.documents.find(
    (document) => document.id === selectedId,
  );
  const select = (id: string | null) => {
    if (saving || (id === selectedId && creating === (id === null))) return;
    if (dirty && !window.confirm(t("Discard your unsaved changes?"))) return;
    setSaved(false);
    setDirty(false);
    setSelectedId(id);
    setCreating(id === null);
  };
  const documents =
    data?.documents.filter(
      (document) =>
        (filter === "all" || document.status === filter) &&
        `${document.title} ${document.body}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    ) ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{data?.campaign.title}</span>
          <h1>{t("Library")}</h1>
          <p>{t("The words that hold your world together.")}</p>
        </div>
        <Button primary disabled={saving} onClick={() => select(null)}>
          {t("New Document")}
        </Button>
      </div>
      {loading && <p role="status">{t("Loading campaign documents…")}</p>}
      {saved && <p role="status">{t("Document saved.")}</p>}
      {error && (
        <Panel>
          <p role="alert">{t(error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {data && (
        <div className="settings-grid persistent-documents" key={campaignId}>
          <Panel title={t("Campaign documents")}>
            <label className="field">
              {t("Search documents")}
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="field">
              {t("Document status")}
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">{t("All documents")}</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </label>
            {!documents.length && (
              <p className="muted">
                {t(
                  data.documents.length
                    ? "No documents match this search."
                    : "No documents yet. Add the world, character, or campaign notes you want to keep.",
                )}
              </p>
            )}
            {documents.map((document) => (
              <button
                type="button"
                key={document.id}
                className="document-row"
                aria-pressed={selectedId === document.id}
                disabled={saving}
                onClick={() => select(document.id)}
              >
                <Icon name="FileText" />
                <div>
                  <h3>{document.title}</h3>
                  <small>
                    {t(statusLabels[document.status])} ·{" "}
                    {t("Revision {number}", { number: document.revision })}
                  </small>
                </div>
              </button>
            ))}
          </Panel>
          {creating || selected ? (
            <DocumentEditor
              key={`${campaignId}:${selected?.id ?? "new"}`}
              record={selected}
              guide={selected?.id === data.dmGuideDocumentId}
              onDirty={setDirty}
              onSaving={setSaving}
              onSaved={(id) => {
                setSelectedId(id);
                setCreating(false);
                setSaved(true);
              }}
            />
          ) : (
            <Panel title={t("Your campaign bookshelf")}>
              <p>
                {t(
                  "Choose a document to read or edit. Its saved history remains available here.",
                )}
              </p>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}

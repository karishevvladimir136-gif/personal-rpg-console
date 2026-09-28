"use client";
import { useEffect, useRef, useState } from "react";
import type {
  CampaignSnapshot,
  DocumentVersion,
  Location,
  Mutation,
  MutationResult,
} from "../../lib/persistence/contracts";
import type { Language } from "../../lib/i18n";
import type { BelongingTransport } from "../../lib/places-belonging/client";
import { createMutationAttempt } from "../../lib/persistence/client";
import { sameTimeline } from "../../lib/saves/client-state";
import {
  belongingEntries,
  belongingFields,
  belongingHistory,
  belongingSave,
  currentPlaceContext,
  eligibleLocations,
  emptyBelonging,
  parseBelonging,
  placeRoles,
  type BelongingFields,
  type BelongingEntry,
} from "../../lib/places-belonging/model";
import { belongingText } from "../../lib/places-belonging/text";
import "./places-belonging.css";

type Draft = {
  fields: BelongingFields;
  location: Location;
  documentId?: string;
  documentRevision: number;
  timeline: CampaignSnapshot["timeline"];
};
function NoteFields({
  fields,
  language,
}: {
  fields: BelongingFields;
  language: Language;
}) {
  const c = belongingText(language);
  return (
    <dl className="belonging-notes">
      {(["belonging", "returnNote", "historyNote"] as const).map((key) => (
        <div key={key}>
          <dt>{c[key]}</dt>
          <dd>{fields[key] || <span className="muted">{c.none}</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
function History({
  snapshot,
  documentId,
  language,
  transport,
  onClose,
}: {
  snapshot: CampaignSnapshot;
  documentId: string;
  language: Language;
  transport: BelongingTransport;
  onClose: () => void;
}) {
  const c = belongingText(language);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    transport
      .history(snapshot.campaign.id, documentId)
      .then((rows) => {
        if (active) {
          setVersions(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [snapshot.campaign.id, documentId, retry, transport]);
  const entries = belongingHistory(snapshot, documentId, versions);
  return (
    <section className="belonging-history panel" aria-label={c.history}>
      <div className="panel-heading">
        <h2>{c.history}</h2>
        <button className="button" type="button" onClick={onClose}>
          {c.close}
        </button>
      </div>
      <p className="muted">{c.historyHelp}</p>
      {loading && <p role="status">{c.historyLoading}</p>}
      {error && (
        <>
          <p role="alert">{c.genericError}</p>
          <button
            className="button"
            type="button"
            onClick={() => {
              setLoading(true);
              setRetry(retry + 1);
            }}
          >
            {c.retry}
          </button>
        </>
      )}
      {!loading && !error && !entries.length && <p>{c.historyEmpty}</p>}
      {!error &&
        entries.map((v) => (
          <details key={v.id}>
            <summary>
              {c.version} {v.version} · {v.annotation.label}
            </summary>
            <p className="muted">
              {v.locationName} · {c.roles[v.annotation.role]} · {c.recorded}{" "}
              {new Date(v.createdAt).toLocaleString(language)}
            </p>
            <NoteFields fields={v.annotation} language={language} />
          </details>
        ))}
    </section>
  );
}
export function PlacesBelongingPanel({
  snapshot,
  language,
  transport,
  onSaved,
  onDirty = () => {},
}: {
  snapshot: CampaignSnapshot;
  language: Language;
  transport: BelongingTransport;
  onSaved: (result: MutationResult) => Promise<void>;
  onDirty?: (dirty: boolean) => void;
}) {
  const c = belongingText(language),
    locations = eligibleLocations(snapshot),
    entries = belongingEntries(snapshot);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => belongingEntries(snapshot)[0]?.documentId ?? null,
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [baseline, setBaseline] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const busy = useRef(false),
    attempt = useRef<Mutation | null>(null);
  const dirty = Boolean(draft && JSON.stringify(draft) !== baseline);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const selected = entries.find((e) => e.documentId === selectedId);
  const displayLocation = draft
    ? locations.find((l) => l.id === draft.location.id)
    : selected?.location;
  const context = displayLocation
    ? currentPlaceContext(snapshot, displayLocation.id)
    : null;
  const document = draft?.documentId
    ? snapshot.documents.find(
        (d) =>
          d.id === draft.documentId && d.campaign_id === snapshot.campaign.id,
      )
    : undefined;
  const documentChanged = Boolean(
    draft?.documentId &&
    (!document ||
      document.status !== "reference" ||
      document.revision !== draft.documentRevision),
  );
  const stale = Boolean(
    draft &&
    (!sameTimeline(draft.timeline, snapshot.timeline) ||
      !displayLocation ||
      displayLocation.revision !== draft.location.revision),
  );
  const canLeave = () => !busy.current && (!dirty || window.confirm(c.discard));
  const open = (entry?: BelongingEntry) => {
    if (!canLeave()) return;
    const location = entry?.location ?? locations[0];
    if (!location) return;
    const record = entry
      ? snapshot.documents.find(
          (d) =>
            d.id === entry.documentId && d.campaign_id === snapshot.campaign.id,
        )
      : undefined;
    const annotation = record ? parseBelonging(record.body) : null;
    const next = {
      fields: annotation
        ? belongingFields(annotation)
        : emptyBelonging(location),
      location,
      documentId: record?.id,
      documentRevision: record?.revision ?? 0,
      timeline: snapshot.timeline,
    };
    // A stale record is opened only after the owner's explicit Review action.
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setSelectedId(entry?.documentId ?? null);
    setHistoryId(null);
    setError("");
    setSaved(false);
    attempt.current = null;
  };
  const change = (fields: Partial<BelongingFields>) => {
    if (draft) {
      setDraft({ ...draft, fields: { ...draft.fields, ...fields } });
      setSaved(false);
    }
  };
  const save = async () => {
    if (!draft || busy.current || stale || documentChanged) return;
    busy.current = true;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const input = belongingSave(
        { ...snapshot, timeline: draft.timeline },
        draft.location,
        draft.fields,
        draft.documentId
          ? {
              id: draft.documentId,
              campaign_id: snapshot.campaign.id,
              revision: draft.documentRevision,
            }
          : undefined,
      );
      attempt.current = createMutationAttempt(attempt.current, input);
      const result = await transport.save(attempt.current);
      const next = {
        ...draft,
        documentId: result.id,
        documentRevision: result.revision,
      };
      setDraft(next);
      setBaseline(JSON.stringify(next));
      setSelectedId(result.id);
      setSaved(true);
      attempt.current = null;
      try {
        await onSaved(result);
      } catch {
        setError(c.refreshError);
      }
    } catch (cause) {
      setError(
        cause &&
          typeof cause === "object" &&
          "code" in cause &&
          cause.code === "validation"
          ? c.invalid
          : c.genericError,
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <div className="places-belonging">
      <header className="page-heading">
        <div>
          <span className="eyebrow">{snapshot.campaign.title}</span>
          <h1>{c.title}</h1>
          <p>{c.subtitle}</p>
        </div>
        <button
          className="button primary"
          type="button"
          disabled={!locations.length || saving}
          onClick={() => open()}
        >
          {c.newPlace}
        </button>
      </header>
      <p className="belonging-reference">
        <span className="badge">{c.reference}</span>
        {c.referenceHelp}
      </p>
      {saved && <p role="status">{c.saved}</p>}
      {!locations.length && (
        <section className="panel belonging-empty">
          <h2>{c.editor}</h2>
          <p>{c.noLocations}</p>
        </section>
      )}
      {locations.length > 0 && (
        <div className="belonging-layout">
          <aside className="panel belonging-list" aria-label={c.places}>
            <h2>{c.places}</h2>
            {!entries.length && <p className="muted">{c.empty}</p>}
            {entries.map((entry) => (
              <button
                key={entry.documentId}
                type="button"
                className="belonging-place"
                aria-pressed={selectedId === entry.documentId}
                disabled={saving}
                onClick={() => {
                  if (canLeave()) {
                    setDraft(null);
                    setSelectedId(entry.documentId);
                    setHistoryId(null);
                    setError("");
                  }
                }}
              >
                <span className="eyebrow">
                  {entry.annotation
                    ? c.roles[entry.annotation.role]
                    : c.changed}
                </span>
                <strong>
                  {entry.annotation?.label ?? entry.location.name}
                </strong>
                <small>
                  {entry.location.name} ·{" "}
                  {entry.location.status === "visited" ? c.visited : c.known}
                </small>
              </button>
            ))}
          </aside>
          <div className="belonging-content">
            {draft ? (
              <section className="panel belonging-editor">
                <h2>{c.editor}</h2>
                <p className="muted">{c.noteHelp}</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void save();
                  }}
                >
                  <fieldset disabled={saving}>
                    <label className="field">
                      <span>{c.location}</span>
                      <select
                        value={draft.location.id}
                        onChange={(event) => {
                          const l = locations.find(
                            (row) => row.id === event.target.value,
                          );
                          if (l) setDraft({ ...draft, location: l });
                        }}
                      >
                        <option value="" disabled>
                          {c.select}
                        </option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ·{" "}
                            {l.status === "visited" ? c.visited : c.known}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="belonging-field-pair">
                      <label className="field">
                        <span>{c.label}</span>
                        <input
                          required
                          maxLength={160}
                          value={draft.fields.label}
                          onChange={(event) =>
                            change({ label: event.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>{c.role}</span>
                        <select
                          value={draft.fields.role}
                          onChange={(event) =>
                            change({
                              role: event.target
                                .value as BelongingFields["role"],
                            })
                          }
                        >
                          {placeRoles.map((role) => (
                            <option key={role} value={role}>
                              {c.roles[role]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {(["belonging", "returnNote", "historyNote"] as const).map(
                      (key) => (
                        <label className="field" key={key}>
                          <span>{c[key]}</span>
                          <textarea
                            rows={4}
                            maxLength={2400}
                            value={draft.fields[key]}
                            onChange={(event) =>
                              change({ [key]: event.target.value })
                            }
                          />
                        </label>
                      ),
                    )}
                  </fieldset>
                  {stale && (
                    <div role="alert">
                      <p>{c.stale}</p>
                      {displayLocation && (
                        <button
                          className="button"
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              location: displayLocation,
                              timeline: snapshot.timeline,
                            })
                          }
                        >
                          {c.reselect}
                        </button>
                      )}
                    </div>
                  )}
                  {documentChanged && <p role="alert">{c.documentChanged}</p>}
                  {error && <p role="alert">{error}</p>}
                  <div className="belonging-actions">
                    <button
                      className="button primary"
                      type="submit"
                      disabled={saving || stale || documentChanged}
                    >
                      {saving ? c.saving : c.save}
                    </button>
                    <button
                      className="button"
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        if (canLeave()) setDraft(null);
                      }}
                    >
                      {c.cancel}
                    </button>
                  </div>
                </form>
              </section>
            ) : selected ? (
              <section className="panel belonging-reading">
                <span className="eyebrow">
                  {selected.annotation
                    ? c.roles[selected.annotation.role]
                    : c.changed}
                </span>
                <h2>{selected.annotation?.label ?? selected.location.name}</h2>
                {selected.needsReview ? (
                  <>
                    <p>{c.reselectHelp}</p>
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => open(selected)}
                    >
                      {c.review}
                    </button>
                  </>
                ) : (
                  <>
                    <NoteFields
                      fields={selected.annotation!}
                      language={language}
                    />
                    <div className="belonging-actions">
                      <button
                        className="button"
                        type="button"
                        onClick={() => open(selected)}
                      >
                        {c.edit}
                      </button>
                      <button
                        className="button"
                        type="button"
                        onClick={() => setHistoryId(selected.documentId)}
                      >
                        {c.history}
                      </button>
                    </div>
                  </>
                )}
              </section>
            ) : (
              <section className="panel belonging-empty">
                <span className="eyebrow">{c.editor}</span>
                <p>{c.empty}</p>
              </section>
            )}
            {displayLocation && (
              <section className="panel belonging-context">
                <h2>
                  {c.context} · {displayLocation.name}
                </h2>
                <span className="badge">
                  {displayLocation.status === "visited" ? c.visited : c.known}
                </span>
                <p>{displayLocation.description || c.noDescription}</p>
                {context ? (
                  <>
                    <h3>{c.current}</h3>
                    <p>{context.summary || c.noDescription}</p>
                    {context.scene && (
                      <details>
                        <summary>{context.scene.title}</summary>
                        <p>{context.scene.body}</p>
                      </details>
                    )}
                  </>
                ) : (
                  <p className="muted">{c.notCurrent}</p>
                )}
                <p className="muted">{c.unknownVisits}</p>
                <p className="muted">{c.unknownRelationships}</p>
              </section>
            )}
            {historyId && (
              <History
                key={`${snapshot.campaign.id}:${historyId}`}
                snapshot={snapshot}
                documentId={historyId}
                language={language}
                transport={transport}
                onClose={() => setHistoryId(null)}
              />
            )}
          </div>
        </div>
      )}
      <section className="panel belonging-stash">
        <h2>{c.stash}</h2>
        <p className="muted">{c.stashHelp}</p>
        {snapshot.storages
          .filter(
            (s) =>
              s.campaign_id === snapshot.campaign.id &&
              s.kind === "camp" &&
              s.entity_id === null,
          )
          .map((s) => (
            <span className="badge" key={s.id}>
              {s.name}
            </span>
          ))}
        {!snapshot.storages.some(
          (s) =>
            s.campaign_id === snapshot.campaign.id &&
            s.kind === "camp" &&
            s.entity_id === null,
        ) && <p>{c.stashEmpty}</p>}
      </section>
    </div>
  );
}

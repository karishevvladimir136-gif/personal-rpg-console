"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { Badge, Button, Modal, Panel } from "./ui";
import { errorMessage, readJson } from "@/lib/persistence/client";
import { craftKeyFromTitle } from "./dm-craft-key";
import { craftCategoryLabel, craftOrder, craftSummary } from "@/lib/ui/craft-view";
import type {
  CraftCommand,
  CraftOwnerView,
  CraftRole,
  CraftVersion,
  CraftVersionInput,
} from "@/lib/dm-craft/contracts";
import k from "./dm-craft.module.css";

/** Polish 3 §7: whom a card is for (the label is translated by `t`). */
function roleLabel(role: "writer" | "bookkeeper" | "both") {
  return role === "writer" ? "For the writer" : role === "bookkeeper" ? "For the bookkeeper" : "For both";
}
function versionText(version: CraftVersion, language: "en" | "ru") {
  return version[language];
}
const inputOf = (version: CraftVersion, role: CraftRole = version.role ?? "both"): CraftVersionInput => ({
  key: version.key,
  kind: version.kind,
  category: version.category,
  stages: [...version.stages],
  triggers: [...version.triggers],
  role,
  en: { ...version.en },
  ru: { ...version.ru },
  provenance: "Owner manual edit",
});

// Fix run after session 2 (item 7): the cards are one size in a grid (the title, the kind, the role, the version and the
// first sentence or two of the text), «Как вести игру» set apart above them as the main one; the whole card — its text,
// «Избегать», its tags in Russian, whom it is for, «Изменить и проверить новую версию» and the history of this card
// only, folded, with «Сделать одобренной» — opens on a click, in a dialog over the grid.
export function DmCraftOwner({ previewView, previewOpenKey }: { previewView?: CraftOwnerView; previewOpenKey?: string } = {}) {
  const { t, language } = useLanguage();
  const [view, setView] = useState<CraftOwnerView | null>(previewView ?? null);
  const [loading, setLoading] = useState(!previewView);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<CraftVersionInput | null>(null);
  const [baseKey, setBaseKey] = useState("");
  // The card opened in the dialog, by key (its approved version is read from the view).
  const [openKey, setOpenKey] = useState<string | null>(previewOpenKey ?? null);
  const pending = useRef<CraftCommand | null>(null);
  const guard = useRef(false);
  const load = useCallback(async () => {
    try {
      setView(await readJson<CraftOwnerView>("/api/dm-craft"));
      setError("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (previewView) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load, previewView]);
  const effective = (key: string) =>
    view?.effective.find((row) => row.key === key);
  const run = async (command: Omit<CraftCommand, "requestId">) => {
    if (guard.current || previewView) return;
    guard.current = true;
    setBusy(true);
    setError("");
    setSaved("");
    // Keep identity across an uncertain response to the same command.
    const candidate = {
      ...command,
      requestId: crypto.randomUUID(),
    } as CraftCommand;
    if (
      JSON.stringify({ ...pending.current, requestId: undefined }) !==
      JSON.stringify({ ...candidate, requestId: undefined })
    )
      pending.current = candidate;
    try {
      const next = await readJson<CraftOwnerView>("/api/dm-craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending.current),
      });
      pending.current = null;
      setView(next);
      setSaved(t("DM Craft saved."));
      setEditing(null);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  const editVersion = (version: CraftVersion) => {
    setBaseKey(version.key);
    setEditing(inputOf(version));
    setSaved("");
  };
  const startCard = () => {
    setBaseKey("");
    setOpenKey(null);
    setEditing({
      key: "",
      kind: "card",
      category: "",
      stages: ["plan", "narrate"],
      triggers: [],
      role: "both",
      en: { title: "", guidance: "", avoid: "" },
      ru: { title: "", guidance: "", avoid: "" },
      provenance: "Owner manual edit",
    });
  };
  const current =
    view?.effective.flatMap((row) => {
      const version = view.versions.find(
        (item) => item.id === row.activeVersionId,
      );
      return version ? [version] : [];
    }) ?? [];
  const ordered = craftOrder(current.map((version) => ({ ...version, title: versionText(version, language).title })));
  // Polish: versions written for the owner (a stage's seeds, a proposed card)
  // that nobody approved yet — newer than the approved one of their key.
  const pendingVersions =
    view?.versions.filter((version) => {
      const active = view.versions.find(
        (item) => item.id === effective(version.key)?.activeVersionId,
      );
      return (
        active?.id !== version.id &&
        (!active || version.version > active.version)
      );
    }).sort((a, b) => a.key.localeCompare(b.key) || b.version - a.version) ?? [];
  const opened = openKey ? current.find((version) => version.key === openKey) ?? null : null;
  const activate = (version: CraftVersion) =>
    void run({
      action: "activate",
      key: version.key,
      versionId: version.id,
      expectedActivationRevision: effective(version.key)?.activationRevision ?? 0,
    } as Omit<CraftCommand, "requestId">);
  const tile = (version: CraftVersion, main = false) => (
    <button key={version.id} type="button" className={main ? k.main : k.card} aria-haspopup="dialog"
      onClick={() => { setEditing(null); setOpenKey(version.key); }}>
      <span className={k.meta}>
        <span className={k.kind}>{t(version.kind === "doctrine" ? "Core Doctrine" : "Craft card")}</span>
        <span>{t("Version {number}", { number: version.version })}</span>
      </span>
      <span className={k.title}>{versionText(version, language).title}</span>
      <span className={main ? k.summaryMain : k.summary}>{craftSummary(versionText(version, language).guidance, main ? 420 : 220, main ? 260 : 90)}</span>
      <span className={k.foot}>
        <span>{t(roleLabel(version.role ?? "both"))}</span>
        <span className={k.more}>{t("Open the whole card")}</span>
      </span>
    </button>
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("YOUR DM'S STORYTELLING CRAFT")}</span>
          <h1>{t("DM Craft")}</h1>
          <p>
            {t(
              "Approved storytelling guidance shared by future turns. Each campaign's DM Style and DM Guide remain separate.",
            )}
          </p>
        </div>
        <Badge>{t("Owner approved")}</Badge>
      </div>
      {!previewView && (
        <Link className="text-link" href="/">
          {t("Back to main menu")}
        </Link>
      )}
      {loading && <p role="status">{t("Loading DM Craft…")}</p>}
      {error && <p role="alert">{t(error)}</p>}
      {error && (
        <Button onClick={() => void load()}>{t("Retry loading")}</Button>
      )}
      {saved && <p role="status">{saved}</p>}
      {view && (
        <div className={k.page}>
          {pendingVersions.length > 0 && (
            <Panel className="dm-craft-pending" title={t("Pending versions")}>
              <p className="muted">
                {t(
                  "These versions were written for you and wait for your approval. Approving one makes it the version the DM plays by.",
                )}
              </p>
              <div className="dm-craft-history">
                {pendingVersions.map((version) => (
                  <details key={version.id}>
                    <summary>
                      {versionText(version, language).title} ·{" "}
                      {t("Version {number}", { number: version.version })}
                    </summary>
                    <p className="muted">
                      <strong>{t("What changes:")}</strong> {version.provenance}
                    </p>
                    <p>{versionText(version, language).guidance}</p>
                    <p className="muted">
                      <strong>{t("Avoid:")}</strong>{" "}
                      {versionText(version, language).avoid}
                    </p>
                    <Button
                      primary
                      disabled={busy || !!previewView}
                      onClick={() => activate(version)}
                    >
                      {t("Review and approve")}
                    </Button>
                  </details>
                ))}
              </div>
            </Panel>
          )}
          <div className={k.toolbar}>
            <p className="muted">
              {t(
                "Changes guide new turns. Existing turns keep the approved version they began with.",
              )}
            </p>
            <Button onClick={startCard} disabled={busy || !!previewView}>
              {t("Write a new card")}
            </Button>
          </div>
          {ordered.main && (
            <section className={k.mainWrap} aria-label={t("The main principles")}>
              <span className="eyebrow">{t("The main principles: the DM reads them before every turn.")}</span>
              {tile(ordered.main, true)}
            </section>
          )}
          <section aria-label={t("Approved doctrine and cards")}>
            <h2 className={k.heading}>{t("Approved doctrine and cards")}</h2>
            <div className={k.grid}>{ordered.cards.map((version) => tile(version))}</div>
          </section>
          {opened && !editing && (
            <Modal title={versionText(opened, language).title} className={k.dialog} onClose={() => setOpenKey(null)}>
              <CraftCard
                version={opened}
                history={view.versions.filter((version) => version.key === opened.key).sort((a, b) => b.version - a.version)}
                activeId={effective(opened.key)?.activeVersionId ?? null}
                busy={busy || !!previewView}
                onEdit={() => editVersion(opened)}
                onRole={(role) => void run({
                  action: "save",
                  expectedActivationRevision: effective(opened.key)?.activationRevision ?? 0,
                  entry: inputOf(opened, role),
                } as Omit<CraftCommand, "requestId">)}
                onActivate={activate}
              />
            </Modal>
          )}
          {editing && (
            <Modal title={t(baseKey ? "Review new version" : "Write a new card")} className={k.dialog} onClose={() => setEditing(null)}>
              <CraftEditor
                editing={editing}
                busy={busy}
                onChange={setEditing}
                onCancel={() => setEditing(null)}
                onSubmit={() => {
                  const key =
                    baseKey ||
                    craftKeyFromTitle(
                      editing.en.title,
                      view.versions.map((version) => version.key),
                    );
                  if (
                    !editing.en.title.trim() ||
                    !editing.en.guidance.trim() ||
                    !editing.en.avoid.trim() ||
                    !editing.ru.title.trim() ||
                    !editing.ru.guidance.trim() ||
                    !editing.ru.avoid.trim()
                  )
                    return;
                  void run({
                    action: "save",
                    expectedActivationRevision:
                      effective(key)?.activationRevision ?? 0,
                    entry: { ...editing, key, provenance: "Owner manual edit" },
                  } as Omit<CraftCommand, "requestId">);
                }}
              />
            </Modal>
          )}
        </div>
      )}
    </>
  );
}

/** The whole card: the text, «Избегать», the tags, whom it is for, the edit button and this card's history. */
function CraftCard({ version, history, activeId, busy, onEdit, onRole, onActivate }: {
  version: CraftVersion;
  history: CraftVersion[];
  activeId: string | null;
  busy: boolean;
  onEdit: () => void;
  onRole: (role: CraftRole) => void;
  onActivate: (version: CraftVersion) => void;
}) {
  const { t, language } = useLanguage();
  const text = versionText(version, language);
  const category = craftCategoryLabel(version.category, language);
  const role = version.role ?? "both";
  return (
    <div className={k.full}>
      <div className={k.meta}>
        <span className={k.kind}>{t(version.kind === "doctrine" ? "Core Doctrine" : "Craft card")}</span>
        <span>{t("Version {number}", { number: version.version })} · {t("Approved")}</span>
      </div>
      <p className={k.text}>{text.guidance}</p>
      <p className={k.avoid}>
        <strong>{t("Avoid:")}</strong> {text.avoid}
      </p>
      <div className={k.tags} aria-label={t("Tags")}>
        {category && <span className={k.tag}>{category}</span>}
        {version.stages.map((stage) => (
          <span key={stage} className={k.tag}>{t(stage === "plan" ? "Planning" : "Narration")}</span>
        ))}
      </div>
      <div className={k.role} role="group" aria-label={t("For whom")}>
        <span className="eyebrow">{t("For whom")}</span>
        <div className={k.segments}>
          {(["writer", "bookkeeper", "both"] as const).map((option) => (
            <button key={option} type="button" className={k.segment} aria-pressed={role === option} disabled={busy || role === option}
              onClick={() => onRole(option)}>{t(roleLabel(option))}</button>
          ))}
        </div>
        <span className="muted">{t("Changing whom a card is for saves a new version.")}</span>
      </div>
      <div className="button-row">
        <Button primary onClick={onEdit} disabled={busy}>
          {t("Edit and review a new version")}
        </Button>
      </div>
      <details className={k.history}>
        <summary>{t("Version history ({count})", { count: history.length })}</summary>
        <p className="muted">
          {t(
            "Restore an earlier version by making it the approved version again. The history remains available.",
          )}
        </p>
        <ol className={k.versions}>
          {history.map((row) => (
            <li key={row.id}>
              <div className={k.versionHead}>
                <strong>{t("Version {number}", { number: row.version })}</strong>
                <span className="muted">{new Date(row.createdAt).toLocaleDateString(language)}</span>
                {row.id === activeId ? (
                  <span className={k.kind}>{t("Approved")}</span>
                ) : (
                  <Button disabled={busy} onClick={() => onActivate(row)}>{t("Make it the approved version")}</Button>
                )}
              </div>
              {row.id !== version.id && <p className={k.versionText}>{craftSummary(versionText(row, language).guidance, 260)}</p>}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function CraftEditor({ editing, busy, onChange, onCancel, onSubmit }: {
  editing: CraftVersionInput;
  busy: boolean;
  onChange: (next: CraftVersionInput) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="dm-craft-editor">
      <p className="muted">
        {t(
          "Review both languages before approval. Saving creates an immutable version; earlier versions remain in history.",
        )}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="dm-craft-editor-grid">
          <label className="field">
            {t("Category")}
            <input
              required
              maxLength={80}
              value={editing.category}
              onChange={(event) =>
                onChange({ ...editing, category: event.target.value })
              }
            />
          </label>
          <label className="field">
            {t("For whom")}
            <select
              value={editing.role ?? "both"}
              onChange={(event) =>
                onChange({ ...editing, role: event.target.value as CraftVersionInput["role"] })
              }
            >
              {(["both", "writer", "bookkeeper"] as const).map((role) => (
                <option key={role} value={role}>{t(roleLabel(role))}</option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="dm-craft-stages">
          <legend>{t("Used during")}</legend>
          {(["plan", "narrate"] as const).map((stage) => (
            <label key={stage}>
              <input
                type="checkbox"
                checked={editing.stages.includes(stage)}
                onChange={(event) =>
                  onChange({
                    ...editing,
                    stages: event.target.checked
                      ? [...editing.stages, stage]
                      : editing.stages.filter((item) => item !== stage),
                  })
                }
              />
              {t(stage === "plan" ? "Planning" : "Narration")}
            </label>
          ))}
        </fieldset>
        <label className="field">
          {t("Literal relevance words, comma separated")}
          <input
            value={editing.triggers.join(", ")}
            onChange={(event) =>
              onChange({
                ...editing,
                triggers: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <div className="dm-craft-editor-grid">
          {(["en", "ru"] as const).map((locale) => (
            <fieldset className="dm-craft-language" key={locale}>
              <legend>{locale === "en" ? "English" : "Русский"}</legend>
              {(["title", "guidance", "avoid"] as const).map(
                (field) => (
                  <label className="field" key={field}>
                    {t(
                      field === "title"
                        ? "Title"
                        : field === "guidance"
                          ? "Guidance"
                          : "Avoid",
                    )}
                    <textarea
                      required
                      rows={field === "title" ? 2 : 6}
                      value={editing[locale][field]}
                      onChange={(event) =>
                        onChange({
                          ...editing,
                          [locale]: {
                            ...editing[locale],
                            [field]: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                ),
              )}
            </fieldset>
          ))}
        </div>
        <div className="button-row">
          <Button
            primary
            type="submit"
            disabled={busy || editing.stages.length === 0}
          >
            {t(busy ? "Saving…" : "Approve new version")}
          </Button>
          <Button onClick={onCancel} disabled={busy}>
            {t("Cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}

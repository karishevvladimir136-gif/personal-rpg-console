"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { Badge, Button, Panel } from "./ui";
import { errorMessage, readJson } from "@/lib/persistence/client";
import { craftKeyFromTitle } from "./dm-craft-key";
import type {
  CraftCommand,
  CraftOwnerView,
  CraftVersion,
  CraftVersionInput,
} from "@/lib/dm-craft/contracts";

function versionText(version: CraftVersion, language: "en" | "ru") {
  return version[language];
}

export function DmCraftOwner({ previewView }: { previewView?: CraftOwnerView } = {}) {
  const { t, language } = useLanguage();
  const [view, setView] = useState<CraftOwnerView | null>(previewView ?? null);
  const [loading, setLoading] = useState(!previewView);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<CraftVersionInput | null>(null);
  const [baseKey, setBaseKey] = useState("");
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
    setEditing({
      key: version.key,
      kind: version.kind,
      category: version.category,
      stages: [...version.stages],
      triggers: [...version.triggers],
      en: { ...version.en },
      ru: { ...version.ru },
      provenance: "Owner manual edit",
    });
    setSaved("");
  };
  const startCard = () => {
    setBaseKey("");
    setEditing({
      key: "",
      kind: "card",
      category: "",
      stages: ["plan", "narrate"],
      triggers: [],
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
      <Link className="text-link" href={previewView ? "/preview/owner" : "/"}>
        {t("Back to main menu")}
      </Link>
      {previewView && <p className="muted">{t("Synthetic preview only. No changes are saved.")}</p>}
      {loading && <p role="status">{t("Loading DM Craft…")}</p>}
      {error && <p role="alert">{t(error)}</p>}
      {error && (
        <Button onClick={() => void load()}>{t("Retry loading")}</Button>
      )}
      {saved && <p role="status">{saved}</p>}
      {view && (
        <>
          <p className="muted">
            {t(
              "Changes guide new turns. Existing turns keep the approved version they began with.",
            )}
          </p>
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
                      onClick={() =>
                        void run({
                          action: "activate",
                          key: version.key,
                          versionId: version.id,
                          expectedActivationRevision:
                            effective(version.key)?.activationRevision ?? 0,
                        } as Omit<CraftCommand, "requestId">)
                      }
                    >
                      {t("Review and approve")}
                    </Button>
                  </details>
                ))}
              </div>
            </Panel>
          )}
          <div className="dm-craft-section-title">
            <h2>{t("Approved doctrine and cards")}</h2>
            <Button onClick={startCard} disabled={busy || !!previewView}>
              {t("Write a new card")}
            </Button>
          </div>
          <div className="dm-craft-grid">
            {current.map((version) => (
              <Panel key={version.id} className="dm-craft-card">
                <div className="dm-craft-card-heading">
                  <Badge>
                    {t(
                      version.kind === "doctrine"
                        ? "Core Doctrine"
                        : "Craft card",
                    )}
                  </Badge>
                  <small>
                    {t("Version {number}", { number: version.version })}
                  </small>
                </div>
                <h3>{versionText(version, language).title}</h3>
                <p>{versionText(version, language).guidance}</p>
                <p className="muted">
                  <strong>{t("Avoid:")}</strong>{" "}
                  {versionText(version, language).avoid}
                </p>
                <p className="muted">
                  {t(version.category)} ·{" "}
                  {version.stages
                    .map((stage) =>
                      t(stage === "plan" ? "Planning" : "Narration"),
                    )
                    .join(" · ")}
                </p>
                <Button onClick={() => editVersion(version)} disabled={busy || !!previewView}>
                  {t("Edit and review a new version")}
                </Button>
              </Panel>
            ))}
          </div>
          {editing && (
            <Panel
              className="dm-craft-editor"
              title={t(baseKey ? "Review new version" : "Write a new card")}
            >
              <p className="muted">
                {t(
                  "Review both languages before approval. Saving creates an immutable version; earlier versions remain in history.",
                )}
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
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
              >
                <div className="dm-craft-editor-grid">
                  <label className="field">
                    {t("Category")}
                    <input
                      required
                      maxLength={80}
                      value={editing.category}
                      onChange={(event) =>
                        setEditing({ ...editing, category: event.target.value })
                      }
                    />
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
                          setEditing({
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
                      setEditing({
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
                              rows={field === "title" ? 2 : 4}
                              value={editing[locale][field]}
                              onChange={(event) =>
                                setEditing({
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
                  <Button onClick={() => setEditing(null)} disabled={busy}>
                    {t("Cancel")}
                  </Button>
                </div>
              </form>
            </Panel>
          )}
          <Panel title={t("Version history")}>
            <p className="muted">
              {t(
                "Restore an earlier version by making it the approved version again. The history remains available.",
              )}
            </p>
            <div className="dm-craft-history">
              {[...view.versions]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((version) => {
                  const active =
                    effective(version.key)?.activeVersionId === version.id;
                  return (
                    <details key={version.id}>
                      <summary>
                        {versionText(version, language).title} ·{" "}
                        {t("Version {number}", { number: version.version })}{" "}
                        {active ? `· ${t("Approved")}` : ""}
                      </summary>
                      <p>{versionText(version, language).guidance}</p>
                      <p className="muted">
                        {new Date(version.createdAt).toLocaleString(language)}
                      </p>
                      {!active && (
                        <Button
                          disabled={busy || !!previewView}
                          onClick={() =>
                            void run({
                              action: "activate",
                              key: version.key,
                              versionId: version.id,
                              expectedActivationRevision:
                                effective(version.key)?.activationRevision ?? 0,
                            } as Omit<CraftCommand, "requestId">)
                          }
                        >
                          {t("Restore this version")}
                        </Button>
                      )}
                    </details>
                  );
                })}
            </div>
          </Panel>
        </>
      )}
    </>
  );
}

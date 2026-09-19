"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PublicSave,
  PublicTimeline,
  SaveCommand,
  SavePolicy,
  SavesSnapshot,
} from "@/lib/saves/contracts";
import {
  loadSaves,
  runSaveCommand,
  SavesClientError,
  savesErrorMessage,
} from "@/lib/saves/client";
import {
  acceptTimelineRead,
  loadSaveAttempt,
  notifyTimelineChanged,
  ordinaryLoadAllowed,
  prepareSaveAttempt,
  readLocal,
  sameTimeline,
  saveAttemptKey,
  saveBase,
  saveDraftKey,
  saveKindLabels,
  writeLocal,
} from "@/lib/saves/client-state";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Modal, Panel, Tabs } from "./ui";

function localStorageForSaves() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
type Confirmation =
  | { action: "load"; save: PublicSave }
  | { action: "switch"; timeline: PublicTimeline };

function SaveCard({
  save,
  disabled,
  onLoad,
}: {
  save: PublicSave;
  disabled: boolean;
  onLoad: () => void;
}) {
  const { t, language } = useLanguage();
  return (
    <article className="saved-game-card">
      <div className="saved-game-heading">
        <Icon name="saves" />
        <div>
          <h3>
            {save.kind === "manual" ? save.name : t(saveKindLabels[save.kind])}
          </h3>
          <Badge>{t(saveKindLabels[save.kind])}</Badge>
        </div>
      </div>
      <dl className="saved-game-details">
        {save.sessionTitle && (
          <>
            <dt>{t("Session")}</dt>
            <dd>{save.sessionTitle}</dd>
          </>
        )}
        {save.sceneTitle && (
          <>
            <dt>{t("Scene")}</dt>
            <dd>{save.sceneTitle}</dd>
          </>
        )}
        {save.locationName && (
          <>
            <dt>{t("Location")}</dt>
            <dd>{save.locationName}</dd>
          </>
        )}
        <dt>{t("In-world time")}</dt>
        <dd>{t("{minutes} minutes", { minutes: save.worldMinutes })}</dd>
      </dl>
      <time dateTime={save.createdAt}>
        {new Date(save.createdAt).toLocaleString(language)}
      </time>
      {save.pendingAction && (
        <p className="muted">
          {t(
            "An unfinished action is saved here. Its recorded dice will stay the same.",
          )}
        </p>
      )}
      <Button disabled={disabled} onClick={onLoad}>
        {t("Load save")}
      </Button>
    </article>
  );
}

function PolicyPanel({
  snapshot,
  disabled,
  onSave,
}: {
  snapshot: SavesSnapshot;
  disabled: boolean;
  onSave: (policy: SavePolicy, baseline: SavesSnapshot) => void;
}) {
  const { t } = useLanguage();
  const [baseline, setBaseline] = useState(snapshot);
  const [draft, setDraft] = useState(snapshot.policy);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline.policy);
  const stale =
    !sameTimeline(baseline.timeline, snapshot.timeline) ||
    baseline.revision !== snapshot.revision;
  useUnsavedChanges(dirty);
  return (
    <details className="saves-policy">
      <summary>{t("Save policy")}</summary>
      <p className="muted">
        {t(
          "These rules apply to this campaign. Owner recovery remains available without deleting any timeline.",
        )}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft, baseline);
        }}
      >
        <fieldset disabled={disabled} className="persistence-fields">
          <div className="saves-policy-fields">
            <label className="field">
              <span>{t("Autosaves")}</span>
              <select
                value={draft.autosave}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    autosave: event.target.value as SavePolicy["autosave"],
                  })
                }
              >
                <option value="off">{t("Off")}</option>
                <option value="session">{t("At session boundaries")}</option>
                <option value="turn">
                  {t("After committed gameplay actions")}
                </option>
              </select>
            </label>
            <label className="field">
              <span>{t("Recent autosaves per timeline")}</span>
              <input
                type="number"
                min={10}
                max={20}
                step={1}
                value={draft.retention}
                onChange={(event) =>
                  setDraft({ ...draft, retention: Number(event.target.value) })
                }
              />
            </label>
            <label className="field">
              <span>{t("Ordinary loading")}</span>
              <select
                value={draft.loadMode}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    loadMode: event.target.value as SavePolicy["loadMode"],
                  })
                }
              >
                <option value="unrestricted">{t("Any saved point")}</option>
                <option value="checkpoints">
                  {t("Autosaves and safety points only")}
                </option>
                <option value="restricted">{t("Owner recovery only")}</option>
              </select>
            </label>
          </div>
          {stale && (
            <p role="status">
              {t(
                "Saved policy or timeline changed. Your choices are retained; use current policy before editing again.",
              )}
            </p>
          )}
          <div className="button-group">
            <Button primary type="submit" disabled={!dirty || stale}>
              {t("Save policy")}
            </Button>
            <Button
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(t("Discard your unsaved changes?"))
                ) {
                  setBaseline(snapshot);
                  setDraft(snapshot.policy);
                }
              }}
            >
              {t("Use current policy")}
            </Button>
          </div>
        </fieldset>
      </form>
    </details>
  );
}

export function PersistentSaves() {
  const { t, language } = useLanguage();
  const { campaignId, data, refresh: refreshCampaign } = useCampaignData();
  const [snapshot, setSnapshot] = useState<SavesSnapshot | null>(null);
  const latest = useRef<SavesSnapshot | null>(null);
  const sequence = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const guard = useRef(false);
  const [tab, setTab] = useState("Save Games");
  const [name, setName] = useState("");
  const nameRef = useRef("");
  const [readyKey, setReadyKey] = useState("");
  const [stored, setStored] = useState(true);
  const [attempt, setAttempt] = useState<SaveCommand | null>(null);
  const attemptRef = useRef<SaveCommand | null>(null);
  const [rejected, setRejected] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [branchName, setBranchName] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [confirmationBaseline, setConfirmationBaseline] =
    useState<SavesSnapshot | null>(null);
  const titleKey = snapshot
    ? saveDraftKey(campaignId, snapshot.timeline.timelineId)
    : "";
  useUnsavedChanges(!stored && (!!name || !!attempt));
  const accept = useCallback((next: SavesSnapshot) => {
    if (!acceptTimelineRead(latest.current, next)) return;
    latest.current = next;
    setSnapshot(next);
  }, []);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const next = await loadSaves(campaignId);
      if (request === sequence.current) {
        accept(next);
        setError("");
      }
      return next;
    } catch (cause) {
      if (request === sequence.current) setError(savesErrorMessage(cause));
      throw cause;
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, [campaignId, accept]);
  useEffect(() => {
    const generation = sequence;
    void refresh().catch(() => {});
    const focused = () => void refresh().catch(() => {});
    window.addEventListener("focus", focused);
    return () => {
      generation.current++;
      window.removeEventListener("focus", focused);
    };
  }, [refresh, data?.timeline?.timelineId, data?.timeline?.epoch]);
  useEffect(() => {
    let live = true;
    queueMicrotask(() => {
      if (!live) return;
      const recovered = loadSaveAttempt(localStorageForSaves(), campaignId);
      attemptRef.current = recovered;
      setAttempt(recovered);
    });
    return () => {
      live = false;
    };
  }, [campaignId]);
  useEffect(() => {
    let live = true;
    queueMicrotask(() => {
      if (!live || !titleKey) return;
      const saved = readLocal<string>(localStorageForSaves(), titleKey);
      nameRef.current = typeof saved === "string" ? saved : "";
      setName(nameRef.current);
      setReadyKey(titleKey);
    });
    return () => {
      live = false;
    };
  }, [titleKey]);
  const writeAttempt = (next: SaveCommand | null) => {
    attemptRef.current = next;
    setAttempt(next);
    setStored(
      writeLocal(localStorageForSaves(), saveAttemptKey(campaignId), next),
    );
  };
  const run = async (command: SaveCommand) => {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    setRejected(false);
    const saved = prepareSaveAttempt(attemptRef.current, command);
    writeAttempt(saved);
    try {
      const result = await runSaveCommand(saved);
      sequence.current++;
      accept(result.snapshot);
      writeAttempt(null);
      if (saved.action === "create" && saved.input.kind === "manual") {
        const savedTitleKey = saveDraftKey(
          campaignId,
          saved.input.timeline.timelineId,
        );
        if (
          readLocal<string>(localStorageForSaves(), savedTitleKey)?.trim() ===
          saved.input.name
        )
          writeLocal(localStorageForSaves(), savedTitleKey, null);
        if (
          nameRef.current.trim() === saved.input.name &&
          sameTimeline(saved.input.timeline, result.snapshot.timeline)
        ) {
          nameRef.current = "";
          setName("");
        }
      }
      setConfirmation(null);
      setMessage(
        saved.action === "load" || saved.action === "switch"
          ? "Timeline ready. Your previous timeline and safety save are preserved."
          : saved.action === "policy"
            ? "Save policy updated."
            : "Save created. Your gameplay state is unchanged.",
      );
      notifyTimelineChanged(campaignId, result.snapshot.timeline);
      await refreshCampaign().catch(() =>
        setError(
          "Your save request succeeded. Refresh the campaign to see its current timeline.",
        ),
      );
    } catch (cause) {
      setError(savesErrorMessage(cause));
      setRejected(
        cause instanceof SavesClientError &&
          ["conflict", "validation", "not_found", "restricted"].includes(
            cause.code,
          ),
      );
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  const disabled = busy || !!attempt || !snapshot || readyKey !== titleKey;
  const open = (value: Confirmation) => {
    setConfirmation(value);
    setConfirmationBaseline(snapshot);
    setBranchName("");
    setRecovery(false);
    setError("");
  };
  const currentTimeline = snapshot?.timelines.find((row) => row.active);
  const activeSaves =
    snapshot?.saves.filter(
      (row) => row.timelineId === snapshot.timeline.timelineId,
    ) ?? [];
  const confirmAllowed =
    !!confirmation &&
    !!snapshot &&
    (confirmation.action === "load"
      ? ordinaryLoadAllowed(snapshot, confirmation.save.kind)
      : snapshot.policy.loadMode === "unrestricted");
  const confirmationStale =
    !!snapshot &&
    !!confirmationBaseline &&
    (!sameTimeline(snapshot.timeline, confirmationBaseline.timeline) ||
      snapshot.revision !== confirmationBaseline.revision ||
      snapshot.runtimeRevision !== confirmationBaseline.runtimeRevision);
  return (
    <div className="persistent-saves">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("CAMPAIGN JOURNAL")}</span>
          <h1>{t("Saves")}</h1>
          <p>
            {t(
              "Keep a point in your story. Try another path, then return to a preserved timeline.",
            )}
          </p>
        </div>
      </div>
      <Tabs
        options={["Save Games", "Timelines"]}
        value={tab}
        onChange={setTab}
      />
      {loading && <p role="status">{t("Loading saves and timelines…")}</p>}
      {error && (
        <p role="alert" className="saves-notice">
          {t(error)}
        </p>
      )}
      {message && (
        <p role="status" className="saves-notice">
          {t(message)}
        </p>
      )}
      {!snapshot && !loading && (
        <Button onClick={() => void refresh().catch(() => {})}>
          {t("Retry loading")}
        </Button>
      )}
      {attempt && (
        <Panel
          className="save-request-recovery"
          title={t("Unconfirmed save request")}
        >
          <p>
            {t(
              "A request is awaiting confirmation. Retry keeps its original identity and cannot create a second fork.",
            )}
          </p>
          <div className="button-group">
            <Button
              disabled={busy || rejected}
              onClick={() => void run(attempt)}
            >
              {t("Retry same request")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => void refresh().catch(() => {})}
            >
              {t("Refresh saves")}
            </Button>
            {rejected && (
              <Button
                disabled={busy}
                onClick={async () => {
                  try {
                    await refresh();
                    await refreshCampaign();
                    writeAttempt(null);
                    setConfirmation(null);
                    setRejected(false);
                    setError("");
                  } catch {}
                }}
              >
                {t("Review current timeline")}
              </Button>
            )}
          </div>
          {!stored && (
            <p role="alert">
              {t(
                "Local recovery storage is unavailable. Keep this page open until the request is confirmed.",
              )}
            </p>
          )}
        </Panel>
      )}
      {busy && <p role="status">{t("Saving your request…")}</p>}
      {snapshot && (
        <>
          <div className="saves-current">
            <Badge green>{t("Current Timeline")}</Badge>
            <strong>{currentTimeline?.label}</strong>
            <Button
              disabled={busy}
              onClick={() => void refresh().catch(() => {})}
            >
              {t("Refresh saves")}
            </Button>
          </div>
          {tab === "Save Games" ? (
            <>
              <div className="saves-create-grid">
                <Panel title={t("Quick Save")}>
                  <p>
                    {t(
                      "One current quick-save slot for this timeline. Earlier saved records remain preserved.",
                    )}
                  </p>
                  <Button
                    primary
                    disabled={disabled}
                    onClick={() =>
                      void run({
                        action: "create",
                        input: {
                          ...saveBase(snapshot),
                          kind: "quick",
                          name: t("Quick Save"),
                        },
                      })
                    }
                  >
                    <Icon name="saves" />
                    {t("Quick Save")}
                  </Button>
                </Panel>
                <Panel title={t("New Manual Save")}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (name.trim())
                        void run({
                          action: "create",
                          input: {
                            ...saveBase(snapshot),
                            kind: "manual",
                            name: name.trim(),
                          },
                        });
                    }}
                  >
                    <label className="field">
                      <span>{t("Save name")}</span>
                      <input
                        value={name}
                        maxLength={120}
                        required
                        disabled={disabled}
                        placeholder={t("Before the fortress")}
                        onChange={(event) => {
                          nameRef.current = event.target.value;
                          setName(event.target.value);
                          setStored(
                            writeLocal(
                              localStorageForSaves(),
                              titleKey,
                              event.target.value,
                            ),
                          );
                        }}
                      />
                    </label>
                    <Button
                      primary
                      type="submit"
                      disabled={disabled || !name.trim()}
                    >
                      {t("Create manual save")}
                    </Button>
                  </form>
                </Panel>
              </div>
              {(["quick", "manual", "autosave", "safety"] as const).map(
                (kind) => {
                  const saves = activeSaves.filter(
                    (row) =>
                      row.kind === kind &&
                      (kind !== "quick" ||
                        row.id === currentTimeline?.quickSaveId),
                  );
                  return (
                    <section key={kind} className="saves-group">
                      <h2>
                        {t(
                          {
                            quick: "Current Quick Save",
                            manual: "Manual Saves",
                            autosave: "Autosaves",
                            safety: "Safety saves",
                          }[kind],
                        )}
                      </h2>
                      {kind === "autosave" && (
                        <p className="muted">
                          {t(
                            "Autosaves follow the campaign policy at committed gameplay boundaries. Keeping {count} recent autosaves per timeline.",
                            { count: snapshot.policy.retention },
                          )}
                        </p>
                      )}
                      {saves.length ? (
                        <div className="saved-games-grid">
                          {saves.map((save) => (
                            <SaveCard
                              key={save.id}
                              save={save}
                              disabled={disabled}
                              onLoad={() => open({ action: "load", save })}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="muted">
                          {t(
                            "No saves of this kind in the current timeline yet.",
                          )}
                        </p>
                      )}
                    </section>
                  );
                },
              )}
              <PolicyPanel
                snapshot={snapshot}
                disabled={disabled}
                onSave={(policy, baseline) =>
                  void run({
                    action: "policy",
                    input: { ...saveBase(baseline), policy },
                  })
                }
              />
            </>
          ) : (
            <>
              <p className="muted">
                {t(
                  "Loading a save creates a new path. Switching returns to a preserved timeline exactly where you left it.",
                )}
              </p>
              <div className="saved-games-grid">
                {snapshot.timelines.map((timeline) => (
                  <article key={timeline.id} className="saved-game-card">
                    <div className="saved-game-heading">
                      <Icon name="ScrollText" />
                      <h2>{timeline.label}</h2>
                    </div>
                    <Badge green={timeline.active}>
                      {t(
                        timeline.active
                          ? "Current Timeline"
                          : "Previous Timeline",
                      )}
                    </Badge>
                    {timeline.locationName && <p>{timeline.locationName}</p>}
                    <p>
                      {t("{minutes} minutes", {
                        minutes: timeline.worldMinutes,
                      })}
                    </p>
                    <time dateTime={timeline.updatedAt}>
                      {new Date(timeline.updatedAt).toLocaleString(language)}
                    </time>
                    {!timeline.active && (
                      <Button
                        disabled={disabled}
                        onClick={() => open({ action: "switch", timeline })}
                      >
                        {t("Return to timeline")}
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {confirmation && confirmationBaseline && (
        <Modal
          title={t(
            confirmation.action === "load"
              ? "Restore this save?"
              : "Return to this timeline?",
          )}
          onClose={() => {
            if (!busy) setConfirmation(null);
          }}
          className="save-confirmation"
        >
          <h3>
            {confirmation.action === "load"
              ? confirmation.save.kind === "manual"
                ? confirmation.save.name
                : t(saveKindLabels[confirmation.save.kind])
              : confirmation.timeline.label}
          </h3>
          <p>
            {t(
              "Your current timeline will be preserved so you can return to it later. A safety save is created before switching.",
            )}
          </p>
          <p className="muted">
            {t(
              "Saved state and recorded dice are restored exactly. No historical narration is regenerated.",
            )}
          </p>
          {confirmation.action === "load" && (
            <label className="field">
              <span>{t("New timeline name (optional)")}</span>
              <input
                maxLength={120}
                value={branchName}
                disabled={busy || !!attempt}
                onChange={(event) => setBranchName(event.target.value)}
                placeholder={t("Another path")}
              />
            </label>
          )}
          {!confirmAllowed && (
            <label className="saves-recovery-choice">
              <input
                type="checkbox"
                checked={recovery}
                disabled={busy || !!attempt}
                onChange={(event) => setRecovery(event.target.checked)}
              />
              <span>
                {t(
                  "Use owner recovery for this load. I understand this bypasses the campaign's ordinary load policy.",
                )}
              </span>
            </label>
          )}
          {confirmationStale && (
            <p role="alert">
              {t(
                "The campaign changed while this confirmation was open. Cancel and review the latest saves before choosing again.",
              )}
            </p>
          )}
          {error && <p role="alert">{t(error)}</p>}
          <div className="button-group">
            <Button disabled={busy} onClick={() => setConfirmation(null)}>
              {t("Cancel")}
            </Button>
            <Button
              primary
              disabled={
                busy ||
                !!attempt ||
                confirmationStale ||
                (!confirmAllowed && !recovery)
              }
              onClick={() =>
                void run(
                  confirmation.action === "load"
                    ? {
                        action: "load",
                        input: {
                          ...saveBase(confirmationBaseline),
                          saveId: confirmation.save.id,
                          label: branchName.trim() || t("Another path"),
                          recovery: !confirmAllowed && recovery,
                        },
                      }
                    : {
                        action: "switch",
                        input: {
                          ...saveBase(confirmationBaseline),
                          timelineId: confirmation.timeline.id,
                          recovery: !confirmAllowed && recovery,
                        },
                      },
                )
              }
            >
              {t(
                !confirmAllowed
                  ? "Confirm owner recovery"
                  : confirmation.action === "load"
                    ? "Load into new timeline"
                    : "Switch timeline",
              )}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

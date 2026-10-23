"use client";

import { useEffect, useState } from "react";
import { readJson } from "@/lib/persistence/client";
import type { DmSecretsView } from "@/lib/server/dm-secrets";
import { Panel, registry as r, useCopy } from "./primitives";
import s from "./settings.module.css";

/** Fix S3-pre B-12: «Тайны» are a one-line steer (the server keeps its own, larger limit for older texts). */
export const OWNER_STEER_MAX_CHARS = 200;
/** Fix S3-accept Ж1: «Пожелания к приключению» are free length — up to the store's own limit (DM_SECRETS_MAX_CHARS). */
export const OWNER_WISHES_MAX_CHARS = 20000;

type Scope = "campaign" | "world" | "wishes";
const EMPTY = { body: "", revision: 0, title: null, available: true };
const PREVIEW_VIEW: DmSecretsView = { campaign: EMPTY, world: EMPTY, wishes: EMPTY };
/** Fix run B1: «Тайны (видит только ведущий)» — the owner's own truth of the world and of this campaign, as in his chat
 * campaigns. The DM reads it as the highest authority after the owner's corrections and builds its hidden layer on it;
 * the player's screens never show it. The world's text is shared by every campaign of that world. */
export function OwnerSecretsPanel({ campaignId, preview }: { campaignId: string; preview?: boolean }) {
  const c = useCopy();
  const [loaded, setView] = useState<DmSecretsView | null>(null);
  const view = preview ? PREVIEW_VIEW : loaded;
  const [drafts, setDrafts] = useState<Record<Scope, string | null>>({ campaign: null, world: null, wishes: null });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  // The panel the last save was made from shows its outcome.
  const [last, setLast] = useState<Scope>("campaign");
  useEffect(() => {
    if (preview) return;
    let live = true;
    readJson<{ secrets: DmSecretsView }>(`/api/campaigns/${encodeURIComponent(campaignId)}/dm-secrets`)
      .then((result) => { if (live) setView(result.secrets); }).catch(() => { if (live) setState("failed"); });
    return () => { live = false; };
  }, [campaignId, preview]);
  const save = async (scope: Scope) => {
    const body = drafts[scope];
    if (body === null || !view || preview) return;
    setLast(scope);
    setState("saving");
    try {
      const result = await readJson<{ secrets: DmSecretsView }>(`/api/campaigns/${encodeURIComponent(campaignId)}/dm-secrets`, {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ scope, body, expectedRevision: view[scope].revision }) });
      setView(result.secrets);
      setDrafts((old) => ({ ...old, [scope]: null }));
      setState("saved");
    } catch { setState("failed"); }
  };
  const buttons = (scope: Scope) => drafts[scope] !== null && (
    <div className={r.row}>
      <button type="button" className={r.btnMain} disabled={state === "saving"} onClick={() => void save(scope)}>{c("Сохранить", "Save")}</button>
      <button type="button" className={r.btnGhost} onClick={() => setDrafts((old) => ({ ...old, [scope]: null }))}>{c("Отмена", "Cancel")}</button>
    </div>
  );
  const field = (scope: Scope, label: string, hint: string) => {
    const entry = view?.[scope];
    if (entry && !entry.available) return null;
    const value = drafts[scope] ?? entry?.body ?? "";
    return (
      <div className={r.stack} style={{ gap: 6 }}>
        <span className={r.eyebrow}>{label}</span>
        <p className={r.note} style={{ margin: 0 }}>{hint}</p>
        {/* Fix S3-pre B-12 (the owner, 2026-10-20 08:35): the hidden layer is the DM's own; this is an optional one-line steer. */}
        <textarea className={s.note} rows={1} maxLength={OWNER_STEER_MAX_CHARS} value={value} disabled={!view || preview} aria-label={label}
          placeholder={c("пусть за этим стоит культ", "let a cult be behind it")}
          onChange={(event) => setDrafts((old) => ({ ...old, [scope]: event.target.value }))} />
        {buttons(scope)}
      </div>
    );
  };
  const wishes = drafts.wishes ?? view?.wishes.body ?? "";
  const outcome = <>
    {state === "saved" && <p className={r.note} role="status" style={{ margin: 0 }}>{c("Сохранено. Ведущий перестроит тайный слой с этой подсказкой.", "Saved. The DM rebuilds the hidden layer with this hint.")}</p>}
    {state === "failed" && <p className={r.error} role="alert">{c("Не удалось прочитать или сохранить тайны. Проверь соединение.", "Could not read or save the secrets. Check the connection.")}</p>}
  </>;
  return (
    <>
    <Panel eyebrow={c("Тайны (видит только ведущий)", "Secrets (the DM only)")}>
      <div className={r.stack}>
        <p className={r.note} style={{ margin: 0 }}>{c("Необязательная подсказка ведущему в одну строку, например: пусть за этим стоит культ. Тайный слой кампании ведущий придумывает и прячет сам; в игре это не показывается.",
          "An optional one-line hint to the DM, for example: let a cult be behind it. The DM invents and hides the campaign's hidden layer itself; play never shows it.")}</p>
        {field("world", view?.world.title ? c(`Тайны мира «${view.world.title}»`, `Secrets of the world «${view.world.title}»`) : c("Тайны мира", "Secrets of the world"),
          c("Общие для всех кампаний этого мира.", "Shared by every campaign of this world."))}
        {field("campaign", c("Тайны этой кампании", "Secrets of this campaign"), c("Только для этой кампании.", "This campaign only."))}
        {last !== "wishes" && outcome}
      </div>
    </Panel>
    {/* Fix S3-accept Ж1: the owner's wish about the adventure — free length, owner-only; the DM's hidden-layer prep reads it
        beside «Тайны» and the world (saving it rebuilds the layer once); never in play, never the truth itself. */}
    <Panel eyebrow={c("Пожелания к приключению (видит только ведущий)", "Wishes for the adventure (the DM only)")}>
      <div className={r.stack} style={{ gap: 6 }}>
        <p className={r.note} style={{ margin: 0 }}>{c("Каким ты хочешь видеть приключение: жанр, тон, что должно случиться. Это пожелание, а не сама правда — тайный слой ведущий строит с ним вместе с «Тайнами» и миром. В игре не показывается.",
          "What you want the adventure to be: genre, tone, what should happen. A wish, not the truth itself: the DM builds the hidden layer with it, beside «Тайны» and the world. Play never shows it.")}</p>
        <textarea className={s.note} rows={5} maxLength={OWNER_WISHES_MAX_CHARS} value={wishes} disabled={!view || preview} aria-label={c("Пожелания к приключению", "Wishes for the adventure")}
          placeholder={c("мрачное фэнтези с интригой; хочу, чтобы к концу главы старые союзники оказались не теми, кем кажутся", "grim fantasy with intrigue; by the chapter's end old allies should turn out not to be who they seem")}
          onChange={(event) => setDrafts((old) => ({ ...old, wishes: event.target.value }))} />
        {buttons("wishes")}
        {last === "wishes" && outcome}
      </div>
    </Panel>
    </>
  );
}

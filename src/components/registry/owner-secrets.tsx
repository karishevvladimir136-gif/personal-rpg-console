"use client";

import { useEffect, useState } from "react";
import { readJson } from "@/lib/persistence/client";
import type { DmSecretsView } from "@/lib/server/dm-secrets";
import { Panel, registry as r, useCopy } from "./primitives";
import s from "./settings.module.css";

/** Fix S3-pre B-12: «Тайны» are a one-line steer (the server keeps its own, larger limit for older texts). */
export const OWNER_STEER_MAX_CHARS = 200;

type Scope = "campaign" | "world";
const PREVIEW_VIEW: DmSecretsView = { campaign: { body: "", revision: 0, title: null, available: true }, world: { body: "", revision: 0, title: null, available: true } };
/** Fix run B1: «Тайны (видит только ведущий)» — the owner's own truth of the world and of this campaign, as in his chat
 * campaigns. The DM reads it as the highest authority after the owner's corrections and builds its hidden layer on it;
 * the player's screens never show it. The world's text is shared by every campaign of that world. */
export function OwnerSecretsPanel({ campaignId, preview }: { campaignId: string; preview?: boolean }) {
  const c = useCopy();
  const [loaded, setView] = useState<DmSecretsView | null>(null);
  const view = preview ? PREVIEW_VIEW : loaded;
  const [drafts, setDrafts] = useState<Record<Scope, string | null>>({ campaign: null, world: null });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
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
    setState("saving");
    try {
      const result = await readJson<{ secrets: DmSecretsView }>(`/api/campaigns/${encodeURIComponent(campaignId)}/dm-secrets`, {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ scope, body, expectedRevision: view[scope].revision }) });
      setView(result.secrets);
      setDrafts((old) => ({ ...old, [scope]: null }));
      setState("saved");
    } catch { setState("failed"); }
  };
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
        {drafts[scope] !== null && (
          <div className={r.row}>
            <button type="button" className={r.btnMain} disabled={state === "saving"} onClick={() => void save(scope)}>{c("Сохранить", "Save")}</button>
            <button type="button" className={r.btnGhost} onClick={() => setDrafts((old) => ({ ...old, [scope]: null }))}>{c("Отмена", "Cancel")}</button>
          </div>
        )}
      </div>
    );
  };
  return (
    <Panel eyebrow={c("Тайны (видит только ведущий)", "Secrets (the DM only)")}>
      <div className={r.stack}>
        <p className={r.note} style={{ margin: 0 }}>{c("Необязательная подсказка ведущему в одну строку, например: пусть за этим стоит культ. Тайный слой кампании ведущий придумывает и прячет сам; в игре это не показывается.",
          "An optional one-line hint to the DM, for example: let a cult be behind it. The DM invents and hides the campaign's hidden layer itself; play never shows it.")}</p>
        {field("world", view?.world.title ? c(`Тайны мира «${view.world.title}»`, `Secrets of the world «${view.world.title}»`) : c("Тайны мира", "Secrets of the world"),
          c("Общие для всех кампаний этого мира.", "Shared by every campaign of this world."))}
        {field("campaign", c("Тайны этой кампании", "Secrets of this campaign"), c("Только для этой кампании.", "This campaign only."))}
        {state === "saved" && <p className={r.note} role="status" style={{ margin: 0 }}>{c("Сохранено. Ведущий перестроит тайный слой с этой подсказкой.", "Saved. The DM rebuilds the hidden layer with this hint.")}</p>}
        {state === "failed" && <p className={r.error} role="alert">{c("Не удалось прочитать или сохранить тайны. Проверь соединение.", "Could not read or save the secrets. Check the connection.")}</p>}
      </div>
    </Panel>
  );
}

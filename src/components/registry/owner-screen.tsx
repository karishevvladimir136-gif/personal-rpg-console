"use client";

import { useEffect, useState } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot, PublicTurn } from "@/lib/gameplay/contracts";
import type { DmView } from "@/lib/gameplay/dm-loop/dm-view";
import { readJson } from "@/lib/persistence/client";
import { Panel, Plate, registry as r, useCopy } from "./primitives";
import o from "./owner.module.css";

/** Fix run A3: a turn over $1 or over four requests is flagged (the owner: «ход за 2,5 доллара — это треш»). */
export const EXPENSIVE_COST_USD = 1;
export const EXPENSIVE_REQUESTS = 4;
export function turnFlagged(turn: Pick<PublicTurn, "stats">): boolean {
  return !!turn.stats && (turn.stats.costUsd > EXPENSIVE_COST_USD || turn.stats.requests > EXPENSIVE_REQUESTS);
}

/** The price of each turn: cost, requests, seconds, depth; the expensive ones flagged with their causes. */
export function TurnCosts({ play }: { play: PlaySnapshot | null }) {
  const c = useCopy();
  const turns = (play?.turns ?? []).filter((turn) => turn.status === "committed" && turn.stats && (turn.mode === "game" || turn.mode === "companion")).slice(-20).reverse();
  if (!turns.length) return <p className={r.empty}>{c("Пока нет сохранённых ходов.", "No saved turns yet.")}</p>;
  const total = turns.reduce((sum, turn) => sum + (turn.stats?.costUsd ?? 0), 0);
  const unrecorded = turns.reduce((sum, turn) => sum + (turn.stats?.unrecorded?.length ?? 0), 0);
  return (
    <div className={r.stack}>
      <p className={o.help}>{c(`Последние ${turns.length} ходов стоили $${total.toFixed(2)}. Ход дороже $${EXPENSIVE_COST_USD} или больше ${EXPENSIVE_REQUESTS} запросов отмечен — у него названа причина.`,
        `The last ${turns.length} turns cost $${total.toFixed(2)}. A turn over $${EXPENSIVE_COST_USD} or over ${EXPENSIVE_REQUESTS} requests is flagged with its cause.`)}
        {" "}{unrecorded ? c(`Проверка записей нашла ${unrecorded} незаписанных событий — они в последнем столбце; поправьте их в листе героя или в инвентаре.`,
          `The record check found ${unrecorded} unrecorded events — in the last column; correct them on the hero's sheet or in the inventory.`) : ""}</p>
      <div className={o.tableWrap}><table className={o.table}>
        <thead><tr><th>{c("Ход", "Turn")}</th><th>{c("Цена", "Cost")}</th><th>{c("Запросы", "Requests")}</th><th>{c("Секунды", "Seconds")}</th><th>{c("Глубина", "Depth")}</th><th>{c("Почему дорого", "Why expensive")}</th><th>{c("Не записано", "Not recorded")}</th></tr></thead>
        <tbody>
          {turns.map((turn) => {
            const stats = turn.stats!;
            const flagged = turnFlagged(turn);
            return (
              <tr key={turn.id}>
                <td>{turn.input.slice(0, 60)}{turn.input.length > 60 ? "…" : ""}</td>
                <td className={`${o.num} ${flagged && stats.costUsd > EXPENSIVE_COST_USD ? o.flag : ""}`}>${stats.costUsd.toFixed(2)}</td>
                <td className={`${o.num} ${flagged && stats.requests > EXPENSIVE_REQUESTS ? o.flag : ""}`}>{stats.requests}</td>
                <td className={o.num}>{Math.round(stats.latencyMs / 1000)}</td>
                <td>{stats.effort ?? "—"}</td>
                <td>{flagged ? (stats.expensiveCauses?.join("; ") || c("дорогой ход", "an expensive turn")) : ""}</td>
                <td>{stats.unrecorded?.length ? <span className={o.chips}>{stats.unrecorded.map((chip) => <span key={chip} className={o.chip}>{chip}</span>)}</span> : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </div>
  );
}

const LAYER_NAMES: Record<DmView["layers"][number]["key"], [string, string, string, string]> = {
  howToDm: ["Как вести игру", "How to run the game", "роль, правила хода, голос, принципы мастерства", "the role, the turn rules, the voice, the craft doctrine"],
  world: ["Мир", "The world", "кампания, «Что мне нравится», руководство ведущего, канон, правила", "the campaign, «Что мне нравится», the DM guide, the canon, the rules"],
  history: ["История", "The history", "последние сцены и реплики дословно", "the recent scenes and lines verbatim"],
  living: ["Досье", "The dossier", "партия, кодекс людей, фракции, журнал, закреплённые факты, блокнот", "the party, the codex of people, factions, the journal, pinned facts, the notebook"],
  tail: ["Хвост сессии", "The session's tail", "модели персонажей, открытый журнал, тайные заметки, планы, наблюдения", "Character Models, the open journal, private notes, plans, observations"],
  now: ["Сейчас", "Now", "текущее состояние с ID, найденная память, напоминание о голосе", "the current state with IDs, retrieved memory, the voice reminder"],
  council: ["Совет партии", "Party council", "лёгкий вызов: собеседник, сцена, последние реплики", "a light call: the speaker, the scene, the last lines"],
};

/** Fix run A5: «Что видит ведущий» — the layers of the last turn's request. */
export function DmViewPanel({ campaignId }: { campaignId: string }) {
  const c = useCopy();
  const [view, setView] = useState<DmView | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    readJson<{ view: DmView | null }>(`/api/campaigns/${encodeURIComponent(campaignId)}/dm-view`)
      .then((result) => { if (live) setView(result.view); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [campaignId]);
  if (failed) return <p role="alert" className={r.error}>{c("Не удалось прочитать последний ход.", "The last turn could not be read.")}</p>;
  if (view === undefined) return <p role="status" className={r.muted}>{c("Читаю последний ход…", "Reading the last turn…")}</p>;
  if (!view) return <p className={r.empty}>{c("Пока нет сохранённых ходов.", "No saved turns yet.")}</p>;
  return (
    <div className={r.stack}>
      <div className={o.facts}>
        <span>{c("Ход", "Turn")} <b>{view.turnNo ?? "—"}</b>: «{view.input.slice(0, 80)}{view.input.length > 80 ? "…" : ""}»</span>
        <span>{c("Всего", "In all")} <b>{Math.round(view.totalTokens / 1000)}k</b> {c("токенов", "tokens")}</span>
        <span>{c("Инструкции", "Instructions")}: <b>{view.instructions === "ru" ? c("русские", "Russian") : c("английские", "English")}</b></span>
        <span>{c("Память ведущего", "DM memory")}: <b>{{ compact: c("компактно", "compact"), standard: c("стандарт", "standard"), wide: c("широко", "wide") }[view.memory] ?? view.memory}</b></span>
      </div>
      {view.layers.map((layer) => {
        const [ru, en, ruHint, enHint] = LAYER_NAMES[layer.key];
        const share = layer.budgetTokens ? Math.min(100, Math.round((layer.tokens / layer.budgetTokens) * 100)) : 0;
        return (
          <details key={layer.key} className={o.layer}>
            <summary>
              <span className={o.layerName}>{c(ru, en)}</span>
              <span className={o.num}>{Math.round(layer.tokens / 100) / 10}k{layer.budgetTokens ? ` / ${Math.round(layer.budgetTokens / 1000)}k` : ""}</span>
              {layer.budgetTokens > 0 && <span className={o.bar} aria-hidden="true"><span className={`${o.barFill} ${layer.dropped.length ? o.barOver : ""}`} style={{ display: "block", width: `${share}%` }} /></span>}
              <span className={r.muted}>{layer.cached ? c("из кэша", "cached") : c("каждый ход заново", "new each turn")}</span>
            </summary>
            <p className={o.help}>{c(ruHint, enHint)}.</p>
            {layer.dropped.length > 0 && <p className={`${o.help} ${o.flag}`}>{c("Не поместилось в бюджет: ", "Dropped by the budget: ")}{layer.dropped.join(", ")}</p>}
            {layer.text !== null ? <pre className={o.pre}>{layer.text}</pre>
              : <p className={o.help}>{c("Тайный слой ведущего: текст скрыт. Его можно открыть в «Настройки → Ведущий → Показывать мне тайны ведущего».", "The DM's private layer: hidden. Open it in Settings → DM → Show me the DM's secrets.")}</p>}
          </details>
        );
      })}
      <div className={r.stack}>
        <span className={r.eyebrow}>{c("Карточки мастерства на этот ход", "DM Craft cards for this turn")}</span>
        <span>{view.craftCards.length ? view.craftCards.join(" · ") : c("нет", "none")}</span>
        <span className={r.eyebrow}>{c("Закреплённые факты владельца", "The owner's pinned facts")}</span>
        {view.pinnedFacts.length ? <ul className={r.bullets}>{view.pinnedFacts.map((fact, index) => <li key={index}>{fact}</li>)}</ul> : <span>{c("нет", "none")}</span>}
      </div>
    </div>
  );
}

export function RegistryOwner({ data, play }: { data: CampaignSnapshot; play: PlaySnapshot | null }) {
  const c = useCopy();
  return (
    <div className={o.screen}>
      <Plate eyebrow={c("Для владельца", "For the owner")} title={c("Ходы и ведущий", "Turns and the DM")}
        sub={c("Что стоил каждый ход и что ведущий получил на последнем. В игре ничего не меняет.", "What each turn cost and what the DM received on the last one. Changes nothing in play.")} />
      <Panel title={c("Цена ходов", "The price of turns")}><TurnCosts play={play} /></Panel>
      <Panel title={c("Что видит ведущий", "What the DM sees")}><DmViewPanel campaignId={data.campaign.id} /></Panel>
    </div>
  );
}

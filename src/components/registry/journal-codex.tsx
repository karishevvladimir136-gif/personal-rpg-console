"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { codexOf, currentPlace, currentSession, questsOf } from "@/lib/ui/campaign-view";
import { Avatar, LaterLine, Panel, Plate, registry as r, useCopy } from "./primitives";
import s from "./journal-codex.module.css";

export function RegistryJournal({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const [doneOpen, setDoneOpen] = useState(false);
  const { active, done, goal } = questsOf(data);
  const place = currentPlace(data);
  const session = currentSession(data);
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · журнал партии`, `${data.campaign.title} · party journal`)} title={c("Журнал", "Journal")}
        sub={<>{place && <b>{place.name}</b>}{place && session ? " · " : ""}{session?.title}</>} />
      <div className={s.columns}>
        <div className={s.column}>
          <Panel eyebrow={c("Главная арка", "Main arc")}>
            <LaterLine>{c("Шаги арки, открытые нити, долги и обещания появятся, когда приложение начнёт их отдавать.", "Arc steps, open threads, debts and promises appear once the app provides them.")}</LaterLine>
          </Panel>
          <Panel eyebrow={c("Задания", "Quests")}>
            {active.length ? (
              <div className={r.stack}>
                {active.map((quest, index) => (
                  <div key={quest.id} className={index === 0 ? r.quest : r.questSide}>
                    <span className={r.questTitle}>{quest.title}</span>
                    {quest.description && <p>{quest.description}</p>}
                  </div>
                ))}
              </div>
            ) : <p className={r.empty}>{c("Открытых заданий нет.", "No open quests.")}</p>}
          </Panel>
          <Panel>
            <button type="button" className={r.btnGhost} aria-expanded={doneOpen} onClick={() => setDoneOpen((open) => !open)} disabled={!done.length}>
              {c(`Выполнено · ${done.length}`, `Done · ${done.length}`)} {doneOpen ? "▴" : "▾"}
            </button>
            {doneOpen && (
              <div className={r.stack} style={{ marginTop: 12 }}>
                {done.map((quest) => (
                  <div key={quest.id} className={r.questDone}>
                    <span className={r.questTitle}>✓ {quest.title}</span>
                    {quest.description && <p>{quest.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <div className={s.column}>
          <Panel eyebrow={c("Цель сейчас", "Current goal")}>
            {goal ? (
              <div className={r.stack} style={{ gap: 6 }}>
                <span className={r.questTitle}>{goal.title}</span>
                {goal.description && <span className={r.muted}>{goal.description}</span>}
              </div>
            ) : <p className={r.empty}>{c("Цели пока нет.", "No goal yet.")}</p>}
          </Panel>
        </div>
      </div>
      <p className={r.note}>{c("Журнал ведёт ведущий: задания появляются и закрываются по ходу игры. Здесь только то, что знает герой.", "The DM keeps the journal: quests appear and close during play. Only what the hero knows is here.")}</p>
    </div>
  );
}

export function RegistryCodex({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const [query, setQuery] = useState("");
  const groups = codexOf(data, query, c.language);
  const total = data.entities.filter((row) => row.kind === "npc" || row.kind === "companion").length;
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · люди и силы`, `${data.campaign.title} · people and powers`)} title={c("Кодекс", "Codex")}
        sub={c(`${total} записей`, `${total} entries`)} />
      <label className={s.search}>
        <Search size={18} aria-hidden="true" />
        <span className={s.srOnly}>{c("Поиск по кодексу", "Search the codex")}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c("Имя или подробность", "Name or detail")} />
      </label>
      <div className={s.column}>
        {groups.map((group) => (
          <Panel key={group.id} eyebrow={group.title}>
            <div className={s.entries}>
              {group.entries.map((entity) => (
                <div key={entity.id} className={s.entry}>
                  <Avatar subject={{ kind: "entity", id: entity.id }} name={entity.name} small />
                  <div>
                    <b className={s.entryName}>{entity.name}</b>
                    {entity.details && <p className={s.entryText}>{entity.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
        {!groups.length && <Panel><p className={r.empty}>{query ? c("Никого не нашлось. Попробуй другое имя.", "No one found. Try another name.") : c("Кодекс пока пуст.", "The codex is empty so far.")}</p></Panel>}
      </div>
      <LaterLine>{c("Группы по отношению к герою (семья, союзники, мутные, враги) и фракции появятся, когда приложение начнёт их отдавать.", "Groups by relationship to the hero (family, allies, murky, foes) and factions appear once the app provides them.")}</LaterLine>
      <p className={r.note}>{c("Кодекс пополняет ведущий: человек появляется после первой встречи. Тайн здесь нет — только то, что знает герой.", "The DM adds to the codex: a person appears after the first meeting. No secrets here — only what the hero knows.")}</p>
    </div>
  );
}

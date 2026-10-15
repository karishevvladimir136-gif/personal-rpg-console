"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";
import { codexOf, currentPlace, currentSession, factionsOf, journalOf, pinnedOf, profileOf, questsOf, type JournalEntry } from "@/lib/ui/campaign-view";
import { Art, Panel, Plate, registry as r, useCopy, type Copy } from "./primitives";
import { PinButton, PinnedList } from "./pins";
import s from "./journal-codex.module.css";

function entryLine(entry: JournalEntry, c: Copy) {
  const who = entry.counterpart ? entry.counterpart.name : null;
  const since = entry.sinceSession ? c(`с сессии ${entry.sinceSession}`, `since session ${entry.sinceSession}`) : null;
  return [who, since].filter(Boolean).join(" · ");
}

export function RegistryJournal({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const [doneOpen, setDoneOpen] = useState(false);
  const { active, done, goal } = questsOf(data);
  const journal = journalOf(data);
  const pinned = pinnedOf(data);
  const place = currentPlace(data);
  const session = currentSession(data);
  const entries = (rows: JournalEntry[], empty: string) => rows.length ? (
    <div className={r.stack}>
      {rows.map((entry) => (
        <div key={entry.quest.id} className={r.questSide}>
          <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className={r.questTitle}>{entry.quest.title}</span>
            <PinButton campaignId={data.campaign.id} pinned={pinned} text={`${entry.quest.title}: ${entry.quest.description}`.slice(0, 300)} source={{ kind: "quest", id: entry.quest.id }} compact />
          </div>
          {entry.quest.description && <p>{entry.quest.description}</p>}
          {entryLine(entry, c) && <span className={`${r.small} ${r.muted}`}>{entryLine(entry, c)}</span>}
        </div>
      ))}
    </div>
  ) : <p className={r.empty}>{empty}</p>;
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · журнал партии`, `${data.campaign.title} · party journal`)} title={c("Журнал", "Journal")}
        sub={<>{place && <b>{place.name}</b>}{place && session ? " · " : ""}{session?.title}</>} />
      <div className={s.columns}>
        <div className={s.column}>
          <Panel eyebrow={c("Главная арка", "Main arc")}>
            {journal.arc ? (
              <div className={r.stack} style={{ gap: 8 }}>
                <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className={r.questTitle}>{journal.arc.quest.title}</span>
                  <PinButton campaignId={data.campaign.id} pinned={pinned} text={journal.arc.quest.title} source={{ kind: "quest", id: journal.arc.quest.id }} compact />
                </div>
                {journal.arc.quest.description && <p className={r.muted} style={{ margin: 0 }}>{journal.arc.quest.description}</p>}
                {journal.arc.steps.length > 0 && (
                  <ol className={s.steps}>
                    {journal.arc.steps.map((step, index) => <li key={index} data-done={step.done ? "true" : "false"}>{step.done ? "✓ " : ""}{step.text}</li>)}
                  </ol>
                )}
              </div>
            ) : <p className={r.empty}>{c("Главная арка появится, когда ведущий её запишет.", "The main arc appears once the DM records it.")}</p>}
          </Panel>
          <Panel eyebrow={c("Задания", "Quests")}>
            {active.length ? (
              <div className={r.stack}>
                {active.map((quest, index) => (
                  <div key={quest.id} className={index === 0 ? r.quest : r.questSide}>
                    <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span className={r.questTitle}>{quest.title}</span>
                      <PinButton campaignId={data.campaign.id} pinned={pinned} text={`${quest.title}: ${quest.description}`.slice(0, 300)} source={{ kind: "quest", id: quest.id }} compact />
                    </div>
                    {quest.description && <p>{quest.description}</p>}
                    {(quest.detail?.locationIds?.length ?? 0) > 0 && (
                      <span className={`${r.small} ${r.muted}`}>{c("Цель:", "Goal:")} {quest.detail!.locationIds!.map((id) => data.locations.find((row) => row.id === id)?.name).filter(Boolean).join(", ")}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className={r.empty}>{c("Открытых заданий нет.", "No open quests.")}</p>}
          </Panel>
          <Panel>
            <button type="button" className={r.btnGhost} aria-expanded={doneOpen} onClick={() => setDoneOpen((open) => !open)} disabled={!done.length && !journal.closed.length}>
              {c(`Выполнено · ${done.length + journal.closed.length}`, `Done · ${done.length + journal.closed.length}`)} {doneOpen ? "▴" : "▾"}
            </button>
            {doneOpen && (
              <div className={r.stack} style={{ marginTop: 12 }}>
                {done.map((quest) => (
                  <div key={quest.id} className={r.questDone}>
                    <span className={r.questTitle}>✓ {quest.title}</span>
                    {quest.description && <p>{quest.description}</p>}
                  </div>
                ))}
                {journal.closed.map((entry) => (
                  <div key={entry.quest.id} className={r.questDone}>
                    <span className={r.questTitle}>✓ {entry.quest.title}</span>
                    {entry.quest.description && <p>{entry.quest.description}</p>}
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
          <Panel eyebrow={c("Открытые нити", "Open threads")}>
            {entries(journal.threads, c("Нитей пока нет: ведущий открывает их по ходу истории.", "No threads yet: the DM opens them as the story goes."))}
          </Panel>
          <Panel eyebrow={c("Долги и обещания", "Debts and promises")}>
            {entries([...journal.debts, ...journal.promises], c("Долгов и обещаний пока нет.", "No debts or promises yet."))}
          </Panel>
          <Panel eyebrow={c("Закреплено для ведущего", "Pinned for the DM")}>
            <PinnedList campaignId={data.campaign.id} pinned={pinned} />
          </Panel>
        </div>
      </div>
      <p className={r.note}>{c("Журнал ведёт ведущий: задания, нити, долги и обещания появляются и закрываются по ходу игры. Здесь только то, что знает герой. Закреплённое ты видишь и можешь открепить; ведущий держит это перед глазами всегда.", "The DM keeps the journal: quests, threads, debts and promises appear and close during play. Only what the hero knows is here. Pinned facts stay in front of the DM until you unpin them.")}</p>
    </div>
  );
}

function CodexEntry({ data, entity, c }: { data: CampaignSnapshot; entity: Entity; c: Copy }) {
  const profile = profileOf(entity);
  const faction = profile.factionId ? data.entities.find((row) => row.id === profile.factionId) : null;
  const home = profile.homePlaceId ? data.locations.find((row) => row.id === profile.homePlaceId) : null;
  const pinned = pinnedOf(data);
  return (
    <div className={s.entry}>
      <span className={r.avatarSmall}><Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 25%" /></span>
      <div>
        <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <b className={s.entryName}>{entity.name}{profile.important ? <span className={r.badge} style={{ marginLeft: 8 }}>{c("важная персона", "important")}</span> : null}</b>
          <PinButton campaignId={data.campaign.id} pinned={pinned} text={`${entity.name}: ${profile.relation?.note || entity.details}`.slice(0, 300)} source={{ kind: "entity", id: entity.id }} compact />
        </div>
        {entity.details && <p className={s.entryText}>{entity.details}</p>}
        {profile.relation?.note && <p className={s.entryText}><i>{profile.relation.note}</i></p>}
        {(faction || home) && <span className={`${r.small} ${r.muted}`}>{[faction ? faction.name : null, home ? c(`дом: ${home.name}`, `home: ${home.name}`) : null].filter(Boolean).join(" · ")}</span>}
      </div>
    </div>
  );
}

export function RegistryCodex({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const [query, setQuery] = useState("");
  const groups = codexOf(data, query, c.language);
  const factions = factionsOf(data);
  const total = data.entities.filter((row) => row.kind === "npc" || row.kind === "companion").length;
  const standing = { ally: c("союзники", "allies"), neutral: c("нейтральны", "neutral"), foe: c("враги", "foes"), unknown: c("неясно", "unknown") };
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · люди и силы`, `${data.campaign.title} · people and powers`)} title={c("Кодекс", "Codex")}
        sub={c(`${total} записей${factions.length ? ` · ${factions.length} фракц.` : ""}`, `${total} entries${factions.length ? ` · ${factions.length} factions` : ""}`)} />
      <label className={s.search}>
        <Search size={18} aria-hidden="true" />
        <span className={s.srOnly}>{c("Поиск по кодексу", "Search the codex")}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c("Имя или подробность", "Name or detail")} />
      </label>
      <div className={s.columns}>
        <div className={s.column}>
          {groups.map((group) => (
            <Panel key={group.id} eyebrow={group.title}>
              <div className={s.entries}>
                {group.entries.map((entity) => <CodexEntry key={entity.id} data={data} entity={entity} c={c} />)}
              </div>
            </Panel>
          ))}
          {!groups.length && <Panel><p className={r.empty}>{query ? c("Никого не нашлось. Попробуй другое имя.", "No one found. Try another name.") : c("Кодекс пока пуст.", "The codex is empty so far.")}</p></Panel>}
        </div>
        <div className={s.column}>
          <Panel eyebrow={c("Фракции", "Factions")}>
            {factions.length ? (
              <div className={s.entries}>
                {factions.map((faction) => (
                  <div key={faction.entity.id} className={s.entry}>
                    <span className={r.avatarSmall}><Art subject={{ kind: "entity", id: faction.entity.id }} name={faction.entity.name} /></span>
                    <div>
                      <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <b className={s.entryName}>{faction.entity.name} <span className={r.chip}>{standing[faction.relation]}</span></b>
                        <PinButton campaignId={data.campaign.id} pinned={pinnedOf(data)} text={`${faction.entity.name}: ${faction.publicNote}`.slice(0, 300)} source={{ kind: "entity", id: faction.entity.id }} compact />
                      </div>
                      {faction.publicNote && <p className={s.entryText}>{faction.publicNote}</p>}
                      {faction.members.length > 0 && <span className={`${r.small} ${r.muted}`}>{faction.members.map((row) => row.name).join(", ")}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className={r.empty}>{c("Герой пока не знает фракций.", "The hero knows no factions yet.")}</p>}
          </Panel>
          <Panel eyebrow={c("Закреплено для ведущего", "Pinned for the DM")}>
            <PinnedList campaignId={data.campaign.id} pinned={pinnedOf(data)} />
          </Panel>
        </div>
      </div>
      <p className={r.note}>{c("Кодекс пополняет ведущий: человек появляется после первой встречи, группы — по тому, как герой его знает. Тайн здесь нет — только то, что знает герой.", "The DM adds to the codex: a person appears after the first meeting, the groups follow what the hero knows. No secrets here — only what the hero knows.")}</p>
    </div>
  );
}

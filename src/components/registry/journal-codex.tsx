"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";
import { codexOf, currentPlace, currentSession, factionsOf, holdingsOf, journalOf, pinnedOf, placesOf, profileOf, questsOf, type JournalEntry } from "@/lib/ui/campaign-view";
import { itemRarity } from "@/lib/ui/rarity";
import { useChrome, type CampaignScreenId } from "./shell";
import { Art, Panel, Plate, registry as r, TabBar, useCopy, type Copy } from "./primitives";
import { PinButton } from "./pins";
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
          {journal.arc && (
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
            ) : null}
          </Panel>
          )}
          <Panel eyebrow={c("Задания", "Quests")}>
            {active.length ? (
              <div className={r.stack}>
                {active.map((quest, index) => (
                  <div key={quest.id} id={`quest-${quest.id}`} className={index === 0 ? r.quest : r.questSide}>
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
          {(done.length > 0 || journal.closed.length > 0) && (
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
          )}
        </div>
        <div className={s.column}>
          {/* Polish group 9: the goal as one line with a link to its quest, never the quest's text again. */}
          {goal && (
            <Panel eyebrow={c("Цель сейчас", "Current goal")}>
              <a className={r.questTitle} href={`#quest-${goal.id}`}>{goal.title}</a>
            </Panel>
          )}
          {journal.threads.length > 0 && (
            <Panel eyebrow={c("Зацепки", "Leads")}>
              {entries(journal.threads, "")}
            </Panel>
          )}
          {(journal.debts.length > 0 || journal.promises.length > 0) && (
            <Panel eyebrow={c("Долги и обещания", "Debts and promises")}>
              {entries([...journal.debts, ...journal.promises], "")}
            </Panel>
          )}
          {!goal && !journal.threads.length && !journal.debts.length && !journal.promises.length && (
            <Panel><p className={r.empty}>{c("Цели, зацепки, долги и обещания появятся по ходу игры.", "Goals, leads, debts and promises appear as the story goes.")}</p></Panel>
          )}
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

type CodexTab = "people" | "places" | "things" | "factions" | "world";
export function RegistryCodex({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const chrome = useChrome();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<CodexTab>("people");
  const groups = codexOf(data, query, c.language);
  const factions = factionsOf(data);
  const needle = query.trim().toLocaleLowerCase();
  const matches = (text: string) => !needle || text.toLocaleLowerCase().includes(needle);
  // Polish group 9: the codex is about the whole world — people, places, named things, factions, the world itself.
  const places = placesOf(data).filter((row) => matches(`${row.location.name}\n${row.location.description}\n${row.location.detail?.whereabouts ?? ""}`));
  const things = data.items.filter((item) => item.quantity > 0 && itemRarity(item) && itemRarity(item) !== "common" && matches(`${item.name}\n${item.description}`));
  const holdings = holdingsOf(data).filter((row) => matches(`${row.name}\n${row.entity?.details ?? ""}`));
  const canon = data.documents.filter((doc) => doc.status === "canon" && matches(`${doc.title}\n${doc.body}`));
  const total = data.entities.filter((row) => row.kind === "npc" || row.kind === "companion").length;
  const standing = { ally: c("союзники", "allies"), neutral: c("нейтральны", "neutral"), foe: c("враги", "foes"), unknown: c("неясно", "unknown") };
  const pinned = pinnedOf(data);
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const tabs: { id: CodexTab; label: string }[] = [
    { id: "people", label: c(`Люди · ${total}`, `People · ${total}`) },
    { id: "places", label: c(`Места · ${places.length}`, `Places · ${places.length}`) },
    { id: "things", label: c(`Вещи · ${things.length + holdings.length}`, `Things · ${things.length + holdings.length}`) },
    { id: "factions", label: c(`Фракции · ${factions.length}`, `Factions · ${factions.length}`) },
    { id: "world", label: c("Мир", "World") },
  ];
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · люди, места и вещи`, `${data.campaign.title} · people, places and things`)} title={c("Кодекс", "Codex")}
        sub={c("Всё, что герой узнал о мире: ведущий пополняет кодекс по ходу игры.", "Everything the hero has learned of the world; the DM fills it as the story goes.")} />
      <div className={r.row}>
        <TabBar tabs={tabs} value={tab} onChange={setTab} label={c("Разделы кодекса", "Codex sections")} wrap />
        <label className={s.search}>
          <Search size={18} aria-hidden="true" />
          <span className={s.srOnly}>{c("Поиск по кодексу", "Search the codex")}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c("Имя или подробность", "Name or detail")} />
        </label>
      </div>
      {tab === "people" && (
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
        </div>
      )}
      {tab === "places" && (
        <Panel eyebrow={c("Места", "Places")} action={<Link className={r.small} href={href("map")} style={{ color: "var(--brass)" }}>{c("Карта", "Map")}</Link>}>
          {places.length ? (
            <div className={s.entries}>
              {places.map(({ location, current, rumored, goal }) => {
                const parent = location.detail?.parentId ? data.locations.find((row) => row.id === location.detail?.parentId) : null;
                return (
                  <div key={location.id} className={s.entry}>
                    <span className={r.avatarSmall}><Art subject={{ kind: "location", id: location.id }} name={location.name} /></span>
                    <div>
                      <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <b className={s.entryName}>{location.name}
                          {rumored && <span className={r.chip} style={{ marginLeft: 8 }}>{c("слух", "rumour")}</span>}
                          {current && <span className={r.badge} style={{ marginLeft: 8 }}>{c("вы здесь", "you are here")}</span>}
                          {goal && <span className={r.badge} style={{ marginLeft: 8 }}>{c("цель", "goal")}</span>}
                        </b>
                        <PinButton campaignId={data.campaign.id} pinned={pinned} text={`${location.name}: ${location.description}`.slice(0, 300)} source={{ kind: "location", id: location.id }} compact />
                      </div>
                      {location.description && <p className={s.entryText}>{location.description}</p>}
                      {(parent || location.detail?.whereabouts) && <span className={`${r.small} ${r.muted}`}>{[parent ? parent.name : null, location.detail?.whereabouts ?? null].filter(Boolean).join(" · ")}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className={r.empty}>{c("Мест пока нет: ведущий записывает их по ходу истории.", "No places yet: the DM records them as the story goes.")}</p>}
        </Panel>
      )}
      {tab === "things" && (
        <Panel eyebrow={c("Вещи и суда", "Things and vessels")}>
          {things.length || holdings.length ? (
            <div className={s.entries}>
              {holdings.map((row) => (
                <div key={row.id} className={s.entry}>
                  <span className={r.avatarSmall}>{row.entity ? <Art subject={{ kind: "entity", id: row.entity.id }} name={row.name} /> : <span className={r.blankArt}>⚓</span>}</span>
                  <div>
                    <b className={s.entryName}>{row.name}</b>
                    {row.entity?.details && <p className={s.entryText}>{row.entity.details}</p>}
                  </div>
                </div>
              ))}
              {things.map((item) => {
                const owner = item.owner_entity_id ? data.entities.find((row) => row.id === item.owner_entity_id) : null;
                return (
                  <div key={item.id} className={s.entry}>
                    <span className={r.avatarSmall}><Art subject={{ kind: "item", id: item.id }} name={item.name} /></span>
                    <div>
                      <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <b className={s.entryName}>{item.name}</b>
                        <PinButton campaignId={data.campaign.id} pinned={pinned} text={`${item.name}: ${item.description}`.slice(0, 300)} source={{ kind: "item", id: item.id }} compact />
                      </div>
                      {item.description && <p className={s.entryText}>{item.description}</p>}
                      {owner && <span className={`${r.small} ${r.muted}`}>{c(`у ${owner.name}`, `with ${owner.name}`)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className={r.empty}>{c("Именных вещей пока нет: реликвии, вещи истории и суда появятся здесь, когда ведущий их запишет.", "No named things yet: relics, story items and vessels appear here once the DM records them.")}</p>}
        </Panel>
      )}
      {tab === "factions" && (
        <Panel eyebrow={c("Фракции", "Factions")}>
          {factions.length ? (
            <div className={s.entries}>
              {factions.map((faction) => (
                <div key={faction.entity.id} className={s.entry}>
                  <span className={r.avatarSmall}><Art subject={{ kind: "entity", id: faction.entity.id }} name={faction.entity.name} /></span>
                  <div>
                    <div className={r.row} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <b className={s.entryName}>{faction.entity.name} <span className={r.chip}>{standing[faction.relation]}</span></b>
                      <PinButton campaignId={data.campaign.id} pinned={pinned} text={`${faction.entity.name}: ${faction.publicNote}`.slice(0, 300)} source={{ kind: "entity", id: faction.entity.id }} compact />
                    </div>
                    {faction.publicNote && <p className={s.entryText}>{faction.publicNote}</p>}
                    {faction.members.length > 0 && <span className={`${r.small} ${r.muted}`}>{faction.members.map((row) => row.name).join(", ")}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className={r.empty}>{c("Герой пока не знает фракций.", "The hero knows no factions yet.")}</p>}
        </Panel>
      )}
      {tab === "world" && (
        <Panel eyebrow={c("Мир", "World")}>
          {canon.length ? (
            <div className={r.stack}>
              {canon.map((doc) => (
                <details key={doc.id} className={s.entryText}>
                  <summary><b>{doc.title}</b></summary>
                  <p style={{ whiteSpace: "pre-wrap" }}>{doc.body.length > 2400 ? `${doc.body.slice(0, 2400)}…` : doc.body}</p>
                </details>
              ))}
            </div>
          ) : <p className={r.empty}>{c("Описание мира появится здесь, когда у кампании будет канон.", "The world's description appears here once the campaign has canon.")}</p>}
        </Panel>
      )}
      <p className={r.note}>{c("Кодекс пополняет ведущий: человек появляется после первой встречи, место — когда о нём услышали, вещь — когда она получила имя. Булавка на записи: ведущий всегда будет это помнить.", "The DM fills the codex: a person after the first meeting, a place once heard of, a thing once it has a name. The pin on an entry: the DM will always remember it.")}</p>
    </div>
  );
}


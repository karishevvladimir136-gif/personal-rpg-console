"use client";

import { useState } from "react";
import { MessagesSquare, X } from "lucide-react";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { characterViewModel } from "@/lib/character-view-model";
import { companionAttitude, currentPlace, heroOf, homeRosterOf, inCombat, mountsOf, partyOf, sheetOf, sheetPlates, worldClock, type MountView } from "@/lib/ui/campaign-view";
import { derivedSheetOf } from "@/lib/live2d/battle/rules-5e";
import { walletOfEntity } from "@/lib/inventory/model";
import { inventoryItemLabel } from "@/lib/live-inventory-view";
import { GameplayComposer } from "../gameplay-composer";
import { GameplayTurn } from "../gameplay-turn";
import { RedrawAnchor } from "./redraw-anchor";
import { useChrome } from "./shell";
import { SheetLines } from "./character-screen";
import { Art, Panel, Plate, registry as r, ThinBar, useCopy, WalletLine } from "./primitives";
import s from "./party.module.css";

type Group = "party" | "reserve" | "nearby";

export function RegistryParty({ data, play, onSaved, preview }: {
  data: CampaignSnapshot;
  play: PlaySnapshot | null;
  onSaved: () => Promise<void>;
  preview?: { talkTo?: string | null; council?: boolean };
}) {
  const c = useCopy();
  const chrome = useChrome();
  const [group, setGroup] = useState<Group>("party");
  const [talk, setTalk] = useState<{ id: string; council: boolean } | null>(
    preview?.talkTo ? { id: preview.talkTo, council: !!preview.council } : null);
  const [redraw, setRedraw] = useState<string | null>(null);
  const party = partyOf(data, play);
  const hero = heroOf(data, play);
  const present = new Set(play?.configuration?.presentEntityIds ?? []);
  const nearby = data.entities.filter((row) => row.kind === "npc" && present.has(row.id) && !row.public_profile?.unmet);
  const combat = inCombat(play);
  const mounts = mountsOf(data);
  const companions = party.filter((row) => row.present).map((row) => row.entity);
  const lists: Record<Group, Entity[]> = {
    // The hero's card leads the party (the wallet and the sheet beside the companions').
    party: [...(hero ? [hero] : []), ...companions],
    reserve: party.filter((row) => !row.present).map((row) => row.entity),
    nearby,
  };
  const groups = [
    { id: "party" as const, label: c(`Отряд · ${companions.length}`, `Party · ${companions.length}`) },
    { id: "reserve" as const, label: c(`В резерве · ${lists.reserve.length}`, `In reserve · ${lists.reserve.length}`) },
    { id: "nearby" as const, label: c(`Люди рядом · ${lists.nearby.length}`, `People nearby · ${lists.nearby.length}`) },
  ];
  const council = companions.length > 1;
  const talking = talk ? data.entities.find((row) => row.id === talk.id) ?? null : null;
  const place = currentPlace(data);
  const clock = worldClock(play?.worldMinutes, c.language, play?.restRecords);
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · спутники и люди рядом`, `${data.campaign.title} · companions and people nearby`)} title={c("Партия", "Party")}
        aside={(
          <button type="button" className={r.btn} disabled={combat || !council} title={combat ? c("В бою недоступно", "Not during combat") : undefined}
            onClick={() => companions[0] && setTalk({ id: companions[0].id, council: true })}>
            <MessagesSquare size={18} aria-hidden="true" />{c("Совет партии", "Party council")}
          </button>
        )}>
        <div className={r.segmented} role="group" aria-label={c("Кто", "Who")}>
          {groups.map((row) => <button key={row.id} type="button" className={r.segment} aria-pressed={group === row.id} onClick={() => setGroup(row.id)}>{row.label}</button>)}
        </div>
      </Plate>
      {combat && <p className={r.later} role="status">{c("Идёт бой: разговоры и совет недоступны до его конца.", "Combat is on: talks and the council wait until it ends.")}</p>}
      {lists[group].length || (group === "party" && mounts.length) ? (
        <div className={s.cards}>
          {lists[group].map((entity) => (
            <MemberCard key={entity.id} data={data} entity={entity}
              tag={entity.kind === "player" ? c("герой", "hero") : group === "party" ? c("в отряде", "in party") : group === "reserve" ? c("в резерве", "in reserve") : c("рядом", "nearby")}
              canTalk={entity.kind === "companion" && group === "party" && !combat} combat={combat}
              onTalk={() => setTalk({ id: entity.id, council: false })} onRedraw={() => setRedraw(entity.id)} />
          ))}
          {group === "party" && mounts.map((mount) => <MountCard key={mount.entity.id} mount={mount} onRedraw={() => setRedraw(mount.entity.id)} />)}
        </div>
      ) : <Panel><p className={r.empty}>{group === "nearby" ? c("Рядом никого нет.", "No one is nearby.") : c("Здесь пока никого.", "No one here yet.")}</p></Panel>}
      <PeopleBackHome data={data} />
      <footer className={r.note}>
        {c("«К тебе» — только то, что герой мог заметить сам. Тайные мысли спутников видит один ведущий. Поговорить можно в любой момент, кроме боя: разговор — это сцена в мире, идёт время, а спутник запоминает сказанное.",
          "“Toward you” is only what the hero could notice. Companions' private thoughts stay with the DM. You can talk any time except in combat: a talk is a scene in the world — time passes and the companion remembers.")}
      </footer>
      {talk && talking && (
        <>
          <button type="button" className={r.drawerScrim} aria-label={c("Закрыть разговор", "Close the talk")} onClick={() => setTalk(null)} />
          <aside className={r.drawer} role="dialog" aria-modal="true" aria-label={c("Разговор", "Talk")}>
            <div className={s.talkHead}>
              <div className={s.talkAvatars}>
                {(talk.council ? companions : [talking]).map((entity) => (
                  <span key={entity.id} className={r.avatarSmall}><Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 25%" /></span>
                ))}
              </div>
              <div>
                <div className={r.h2}>{talk.council ? c("Совет партии", "Party council") : talking.name}</div>
                <span className={r.note}>{talk.council ? c("Обращаешься к одному; остальных отметь слушателями — каждый ответит по-своему.", "Address one and tick the others as listeners — each answers in their own way.") : talking.details.split(/[.!?]/u)[0]}</span>
              </div>
              <button type="button" className={r.iconBtn} aria-label={c("Закрыть разговор", "Close the talk")} onClick={() => setTalk(null)}><X size={20} aria-hidden="true" /></button>
            </div>
            <div className={r.later} style={{ borderStyle: "solid" }}>{[place?.name, clock].filter(Boolean).join(" · ") || c("Сцена в мире", "A scene in the world")} · {c("идёт игровое время", "game time passes")}</div>
            {chrome?.href || !play ? (
              <PreviewTalk play={play} companionId={talking.id} />
            ) : (
              <GameplayComposer play={play} mode="companion" companionId={talking.id} onSaved={onSaved} followLatest />
            )}
          </aside>
        </>
      )}
      {redraw && (
        <>
          <button type="button" className={r.drawerScrim} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)} />
          <aside className={r.drawer} role="dialog" aria-modal="true" aria-label={c("Перерисовать портрет", "Redraw portrait")}>
            <div className={r.panelHead}>
              <h2 className={r.h2}>{c("Перерисовать портрет", "Redraw portrait")}</h2>
              <button type="button" className={r.iconBtn} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)}><X size={20} aria-hidden="true" /></button>
            </div>
            <RedrawAnchor data={data} subject={{ kind: "entity", id: redraw }} name={data.entities.find((row) => row.id === redraw)?.name ?? ""} />
          </aside>
        </>
      )}
    </div>
  );
}

/** A person's card: the same sheet view as the hero's (stage D §7) — level, armour class, speed, attacks, saves and
 * skills with the numbers of the stat block; a stat of 0 is a stub and never shows («Навык 0»); the purse. */
function MemberCard({ data, entity, tag, canTalk, combat, onTalk, onRedraw }: {
  data: CampaignSnapshot; entity: Entity; tag: string; canTalk: boolean; combat: boolean; onTalk: () => void; onRedraw: () => void;
}) {
  const c = useCopy();
  const model = characterViewModel(data, entity);
  const sheet = sheetOf(entity);
  // Fix S3-accept Г1, Г3: the sheet's plates from one selector (in 5e «КД», «Атака», «Навык», the server's numbers, explained on hover).
  const tiles = sheetPlates(data, entity, model.derivedStats).map((plate) => [plate.translated ? plate.label : c.label(plate.label), plate.value, plate.text] as const);
  const derived = derivedSheetOf(data, entity);
  const person = entity.kind === "player" || entity.kind === "companion";
  return (
    <article className={s.card}>
      <div className={s.cardArt}>
        <Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 25%" />
        <span className={s.tag}>{tag}</span>
        <button type="button" className={s.redraw} onClick={onRedraw} aria-label={c("Перерисовать портрет", "Redraw portrait")}>↻</button>
      </div>
      <div className={s.cardBody}>
        <div>
          <div className={s.name}>{entity.name}</div>
          {(sheet.role || sheet.level !== null) && <div className={`${r.small} ${r.muted}`}>{[sheet.role, sheet.level !== null ? c.t("Level {level}", { level: sheet.level }) : null].filter(Boolean).join(" · ")}</div>}
        </div>
        {entity.hp !== null && (
          <div className={s.hpRow}>
            <span className={r.eyebrow}>{c("Хиты", "HP")}</span>
            {entity.max_hp ? <ThinBar value={entity.hp} max={entity.max_hp} label={c(`Хиты: ${entity.name}`, `HP: ${entity.name}`)} /> : <span />}
            <span className={r.num}>{entity.max_hp ? `${entity.hp}/${entity.max_hp}` : entity.hp}</span>
          </div>
        )}
        {(tiles.length > 0 || entity.conditions.length > 0) && (
          <div className={r.chips}>
            {tiles.map(([label, value, why]) => <span key={label} className={r.badge} title={why ?? undefined}>{label} {value}</span>)}
            {entity.conditions.map((condition) => <span key={condition} className={r.badgeAmber}>{condition}</span>)}
          </div>
        )}
        {person && <WalletLine wallet={walletOfEntity(entity)} />}
        <div className={s.sheet}><SheetLines sheet={sheet} skills={model.skills} saves={derived?.saves} savesNeedLevel={derived?.savesNeedLevel} compact /></div>
        {entity.kind === "companion" && companionAttitude(entity) && (
          <div className={r.stack} style={{ gap: 2 }}>
            <span className={r.eyebrow}>{c("К тебе", "Toward you")}</span>
            <span>{companionAttitude(entity)!.text}</span>
            {worldClock(Number(companionAttitude(entity)!.lastNoticed), c.language) && <span className={`${r.small} ${r.muted}`}>{c("замечено:", "noticed:")} {worldClock(Number(companionAttitude(entity)!.lastNoticed), c.language)}</span>}
          </div>
        )}
        {entity.kind === "companion" && (
          <button type="button" className={canTalk ? r.btnMain : r.btnGhost} disabled={!canTalk} onClick={onTalk}
            title={combat ? c("В бою недоступно", "Not during combat") : undefined}>
            {combat ? c("В бою не до разговоров", "No talking in combat") : c("Поговорить", "Talk")}
          </button>
        )}
      </div>
    </article>
  );
}

/** A mount travels with the party and carries its saddlebags: their things and coins — never riders (item 35). */
function MountCard({ mount, onRedraw }: { mount: MountView; onRedraw: () => void }) {
  const c = useCopy();
  const { entity } = mount;
  return (
    <article className={s.card}>
      <div className={s.cardArt}>
        <Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 40%" />
        <span className={s.tag}>{c("ездовое", "mount")}</span>
        <button type="button" className={s.redraw} onClick={onRedraw} aria-label={c("Перерисовать портрет", "Redraw portrait")}>↻</button>
      </div>
      <div className={s.cardBody}>
        <div>
          <div className={s.name}>{entity.name}</div>
          {entity.details && <div className={`${r.small} ${r.muted}`}>{entity.details.split(/(?<=[.!?])\s/u)[0]}</div>}
        </div>
        {entity.hp !== null && entity.max_hp ? (
          <div className={s.hpRow}>
            <span className={r.eyebrow}>{c("Хиты", "HP")}</span>
            <ThinBar value={entity.hp} max={entity.max_hp} label={c(`Хиты: ${entity.name}`, `HP: ${entity.name}`)} />
            <span className={r.num}>{`${entity.hp}/${entity.max_hp}`}</span>
          </div>
        ) : null}
        <div className={r.stack} style={{ gap: 4 }}>
          <span className={r.eyebrow}>{mount.storage?.name ?? c("Седельные сумки", "Saddlebags")}</span>
          <WalletLine wallet={mount.wallet} />
          {mount.items.length ? (
            <ul className={s.bag}>
              {mount.items.map((item) => <li key={item.id}><span>{inventoryItemLabel(item.name)}</span>{item.quantity > 1 && <span className={r.num}>×{item.quantity}</span>}</li>)}
            </ul>
          ) : <span className={`${r.small} ${r.muted}`}>{c("Сумки пусты.", "The bags are empty.")}</span>}
        </div>
      </div>
    </article>
  );
}

/** People back home (UI_DATA_NEEDS #11). A holding's crew stays on «Имущество» (item 35). */
function PeopleBackHome({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const homes = homeRosterOf(data);
  if (!homes.length) return null;
  return (
    <Panel eyebrow={c("Люди дома", "People back home")}>
      <div className={r.stack} style={{ gap: 10 }}>
        {homes.map((home) => (
          <div key={home.place.id} className={r.stack} style={{ gap: 4 }}>
            <span className={r.eyebrow}>{home.place.name}</span>
            <div className={r.chips}>{home.people.map((row) => <span key={row.id} className={r.chip}>{row.name}</span>)}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** Previews show the saved conversation only; nothing can be sent. */
function PreviewTalk({ play, companionId }: { play: PlaySnapshot | null; companionId: string }) {
  const c = useCopy();
  const turns = play?.turns.filter((turn) => turn.mode === "companion" && turn.companionId === companionId) ?? [];
  return (
    <div className={s.talk}>
      <div className="gameplay-turns" role="log" aria-label={c("Разговор", "Conversation")}>
        {turns.map((turn) => <div key={turn.id} className="session-saved-turn"><GameplayTurn turn={turn} busy onCommand={() => {}} onSaved={async () => {}} /></div>)}
        {!turns.length && <p className={r.empty}>{c("Вы ещё не говорили.", "You haven't talked yet.")}</p>}
      </div>
      <div className={r.chips}>
        {/* Gender-neutral wording: the record carries no gender for its companions. */}
        {[c("Как ты?", "How are you?"), c("Что думаешь о плане?", "What do you think of the plan?"), c("Что удалось заметить?", "What did you notice?")].map((prompt) => (
          <button key={prompt} type="button" className={r.chipButton} disabled>{prompt}</button>
        ))}
      </div>
      <label className="field"><span>{c("Сказать спутнику", "Say to your companion")}</span><textarea rows={2} readOnly placeholder={c("Предпросмотр: ничего не отправляется", "Preview: nothing is sent")} /></label>
      <button type="button" className={r.btnMain} disabled>{c("Сказать", "Say")}</button>
    </div>
  );
}

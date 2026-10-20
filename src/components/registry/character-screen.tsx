"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Backpack, BookOpen, FlaskConical, Gem, KeyRound, Package, Shield, Shirt, Sword, Target, Wrench, X, type LucideIcon } from "lucide-react";
import type { CampaignSnapshot, Entity, Item, MutationInput } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { characterViewModel } from "@/lib/character-view-model";
import { EQUIPPED_FILTER, inventoryCategoryLabel, inventoryItemLabel } from "@/lib/live-inventory-view";
import { itemRarity } from "@/lib/ui/rarity";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import {
  dollLayout, equipmentOf, heroOf, holdingsNavLabel, holdingsOf, inventoryOf, mountsOf, partyOf, placePilesOf, sheetOf, statLabel,
  type SheetView, type SlotView,
} from "@/lib/ui/campaign-view";
import { castLine, ITEM_KINDS, itemMechanics, kindLabel, spellBook, walletOfEntity, walletParts, type SpellRecord, type Wallet } from "@/lib/inventory/model";
import type { SheetPatch } from "@/lib/inventory/sheet";
import {
  applyPlan, castSlot, concentrationOf, entityPayload, hasSpellSlots, loanMark, planEquip, planKind, planMoney, planMove, planSheet, planUnequip, sheetCounters, slotsFor,
  undoPayload, type MovePlan, type MoveStep, type MoveTarget,
} from "@/lib/inventory/owner-moves";
import { ClientPersistenceError, createMutationAttempt } from "@/lib/persistence/client";
import { useOptionalCampaignData } from "../persistence-context";
import { anchorFor } from "@/lib/visual-frame/pictures";
import { RedrawAnchor } from "./redraw-anchor";
import { usePictures } from "./live-frames";
import { useChrome, type CampaignScreenId } from "./shell";
import {
  Art,
  Gauge,
  Panel,
  Pips,
  RarityLegend,
  rarityClass,
  registry as r,
  TabBar,
  useCopy,
  useSubjectImage,
  WalletLine,
  type Copy,
} from "./primitives";
import s from "./character.module.css";

type Tab = "char" | "inv" | "spells";
const PEOPLE = ["player", "companion", "npc"];

/** Fix run after session 2 (items 30, 33): an open item card closes on Escape and on a click outside it. A click on a
 * thing (a row, a cell, a slot: `data-item-pick`) still opens that thing's card or closes its own; a click inside
 * another dialog (the redraw drawer) or a part marked `data-keep-card` leaves the card alone. */
export function useCardDismiss(open: boolean, close: () => void) {
  const latest = useRef(close);
  useEffect(() => { latest.current = close; });
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") latest.current(); };
    const outside = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest("[data-item-pick], [role='dialog'], [data-keep-card]")) return;
      latest.current();
    };
    window.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", key); document.removeEventListener("pointerdown", outside); };
  }, [open]);
}

// --- the owner's moves: planned in src/lib/inventory/owner-moves.ts, sent here as owner corrections --------------
type Status = { tone: "ok" | "error"; text: string } | null;
/** Sends a plan's saves in order as owner corrections of the timeline (the DM reads them next turn); when a later save
 * fails, the earlier ones are saved back as they were. Synthetic previews apply the plan to their own copy instead. */
export function useOwnerMoves(data: CampaignSnapshot, preview: boolean) {
  const c = useCopy();
  const context = useOptionalCampaignData();
  const [local, setLocal] = useState<CampaignSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const view = preview ? local ?? data : data;
  // The item's whole `detail` travels with its save (the history entry appended; migration 78 admits it).
  const send = (step: MoveStep, payload: object, expectedRevision: number) => context!.mutate(createMutationAttempt(null,
    { operation: step.operation, campaignId: data.campaign.id, expectedRevision, timeline: data.timeline, correctionScope: "timeline", payload } as MutationInput));
  const run = async (plan: MovePlan): Promise<boolean> => {
    if (!plan.ok) { setStatus({ tone: "error", text: plan.reason }); return false; }
    if (preview || !context) {
      setLocal(applyPlan(view, plan.steps));
      setStatus({ tone: "ok", text: c(`Предпросмотр, ничего не отправлено: ${plan.note}`, `Preview, nothing is sent: ${plan.note}`) });
      return true;
    }
    if (busy) return false;
    setBusy(true);
    setStatus(null);
    const revisions = new Map<string, number>();
    const done: MoveStep[] = [];
    try {
      for (const step of plan.steps) {
        const result = await send(step, step.payload, revisions.get(step.payload.id) ?? step.before?.revision ?? 0);
        revisions.set(step.payload.id, result.revision);
        done.push(step);
      }
      setStatus({ tone: "ok", text: plan.note });
      return true;
    } catch (error) {
      let undone = true;
      for (const step of [...done].reverse()) {
        const payload = undoPayload(step);
        if (!payload) continue;
        try {
          const result = await send(step, payload, revisions.get(step.payload.id) ?? 0);
          revisions.set(step.payload.id, result.revision);
        } catch { undone = false; }
      }
      setStatus({ tone: "error", text: `${failureText(error, c)}${done.length ? (undone ? c(" Уже сделанное отменено.", " What was already done is undone.")
        : c(" Часть уже сделанного отменить не удалось — проверьте списки.", " Part of what was done could not be undone; check the lists.")) : ""}` });
      return false;
    } finally {
      setBusy(false);
      await context.refresh().catch(() => undefined);
    }
  };
  return { view, run, busy, status, setStatus };
}
function failureText(error: unknown, c: Copy) {
  const code = error instanceof ClientPersistenceError ? error.code : "unavailable";
  if (code === "conflict") return c("Запись изменилась, пока вы её правили. Обновите страницу и повторите.", "The record changed meanwhile. Reload and try again.");
  if (code === "validation") return c("Сервер не принял изменение: запись не прошла проверку.", "The server refused the change: the record failed its checks.");
  if (code === "unauthenticated" || code === "forbidden") return c("Нужно войти заново.", "Please sign in again.");
  return c("Сервер не ответил — изменение не сохранено.", "The server did not answer; nothing was saved.");
}

/** Someone or something that holds things: a person's bag, a mount's saddlebags, what lies at the place. */
type Holder = { key: string; kind: "person" | "mount" | "place"; entity: Entity | null; name: string; tag: string; items: Item[]; wallet: Wallet; target: MoveTarget | null };
/** The people, mounts and place piles the owner moves things between. */
export function holdersOf(view: CampaignSnapshot, play: PlaySnapshot | null, c: Copy): Holder[] {
  const hero = heroOf(view, play);
  const people = [hero, ...partyOf(view, play).filter((row) => row.present).map((row) => row.entity)].filter((row): row is Entity => !!row);
  return [
    ...people.map((entity): Holder => ({ key: entity.id, kind: "person", entity, name: entity.name, tag: entity.kind === "player" ? c("герой", "hero") : c("спутник", "companion"),
      items: inventoryOf(view, entity.id), wallet: walletOfEntity(entity), target: { entityId: entity.id } })),
    ...mountsOf(view).map((mount): Holder => ({ key: mount.entity.id, kind: "mount", entity: mount.entity, name: mount.entity.name, tag: c("седельные сумки", "saddlebags"),
      items: mount.items, wallet: mount.wallet, target: { entityId: mount.entity.id } })),
    ...placePilesOf(view).map((pile): Holder => ({ key: pile.storage.id, kind: "place", entity: null, name: pile.place?.name ?? pile.storage.name,
      tag: c("здесь лежит", "lies here"), items: pile.items, wallet: pile.wallet, target: null })),
  ];
}
/** «Отдать → …» for a thing: everyone it can go to (the hero reads «себе»), never where it already is. */
function targetsFor(view: CampaignSnapshot, holders: Holder[], item: Item, heroId: string | null, c: Copy) {
  return holders.filter((holder) => holder.target && holder.entity).filter((holder) => {
    const bag = view.storages.find((row) => row.entity_id === holder.entity!.id);
    return !(bag && bag.id === item.storage_id && item.owner_entity_id === holder.entity!.id);
  }).map((holder) => ({ key: holder.key, target: holder.target!,
    label: holder.entity!.id === heroId ? c("себе", "myself") : holder.kind === "mount" ? c(`седельные сумки (${holder.name})`, `saddlebags (${holder.name})`) : holder.name }));
}

export function RegistryCharacter({ data, play = null, initialTab = "char", preview, legacy }: {
  data: CampaignSnapshot;
  play?: PlaySnapshot | null;
  initialTab?: Tab;
  /** Synthetic previews: a full-length picture for the doll, a sheet or a card to open; nothing is sent. */
  preview?: { figure?: string | null; memberId?: string | null; itemId?: string | null };
  /** The earlier record editors, kept reachable below the new sheet. */
  legacy?: React.ReactNode;
}) {
  const c = useCopy();
  const chrome = useChrome();
  const router = useRouter();
  const moves = useOwnerMoves(data, !!chrome?.href);
  const view = moves.view;
  const hero = heroOf(view, play);
  const members = [hero, ...partyOf(view, play).map((row) => row.entity)].filter((row): row is Entity => !!row);
  const [selectedId, setSelectedId] = useState(preview?.memberId ?? hero?.id ?? members[0]?.id ?? null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [filter, setFilter] = useState("");
  const [card, setCard] = useState<{ itemId: string; holder: string } | null>(preview?.itemId ? { itemId: preview.itemId, holder: preview.memberId ?? hero?.id ?? "" } : null);
  const [picker, setPicker] = useState<{ itemId: string; wearerId: string; slot: string | null; kinds: string[]; reason: string; mode: "equip" | "kind" } | null>(null);
  const [ask, setAsk] = useState<{ itemId: string; target: MoveTarget; label: string } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [redraw, setRedraw] = useState<{ kind: "entity" | "item"; id: string } | null>(null);
  // The card closes on Escape (item 33: it no longer «вечно висит») and on a click outside it (item 30).
  useCardDismiss(!!card, () => { setCard(null); setPicker(null); });
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const entity = members.find((row) => row.id === selectedId) ?? members[0] ?? null;
  if (!entity) return <Panel><p className={r.empty}>{c("В кампании пока нет героя.", "This campaign has no hero yet.")}</p></Panel>;
  const model = characterViewModel(view, entity);
  const sheet = sheetOf(entity);
  const ctx = { language: view.campaign.language, at: play?.worldMinutes ?? 0, newId: () => crypto.randomUUID() };
  const holders = holdersOf(view, play, c);
  const own = holders.find((holder) => holder.key === entity.id) ?? { key: entity.id, kind: "person" as const, entity, name: entity.name, tag: "",
    items: inventoryOf(view, entity.id), wallet: walletOfEntity(entity), target: { entityId: entity.id } };
  const people = holders.filter((holder) => holder.kind === "person" && holder.entity).map((holder) => holder.entity!);
  const spellsShown = sheet.spells.length > 0 || sheet.spellLines.length > 0 || hasSpellSlots(entity);
  const tabs = [
    { id: "char" as const, label: c("Персонаж", "Character") },
    { id: "inv" as const, label: c("Инвентарь", "Inventory") },
    ...(spellsShown ? [{ id: "spells" as const, label: c("Заклинания", "Spells") }] : []),
  ];
  const links = [
    { id: "journal" as const, label: c("Задания", "Quests") },
    { id: "codex" as const, label: c("Кодекс", "Codex") },
    { id: "holdings" as const, label: holdingsNavLabel(holdingsOf(view), c.language) },
  ];
  const act = (text: string) => {
    if (!chrome?.href) {
      if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode: "game", companionId: null, timeline: data.timeline, text }))
        router.push(href("game"));
      else moves.setStatus({ tone: "error", text: c("Сначала дождись конца текущего хода.", "Wait until the current turn finishes.") });
    } else moves.setStatus({ tone: "ok", text: c(`Предпросмотр: в поле хода появится «${text}»`, `Preview: the turn box would get “${text}”`) });
  };
  // --- the moves -------------------------------------------------------------------------------------------
  const item = (id: string | null) => (id ? view.items.find((row) => row.id === id) ?? null : null);
  const equip = async (thing: Item, wearerId: string, slot: string | null, kind: string | null = null) => {
    const plan = planEquip(view, thing.id, wearerId, { slot, kind }, ctx);
    if (!plan.ok && plan.kinds) {
      setPicker({ itemId: thing.id, wearerId, slot, kinds: plan.kinds, reason: plan.reason, mode: "equip" });
      setCard({ itemId: thing.id, holder: card?.itemId === thing.id ? card.holder : wearerId });
      return;
    }
    if (await moves.run(plan)) setPicker(null);
  };
  const pickKind = async (kind: string) => {
    if (!picker) return;
    const thing = item(picker.itemId);
    if (!thing) return;
    if (picker.mode === "equip") {
      const plan = planEquip(view, thing.id, picker.wearerId, { slot: picker.slot, kind }, ctx);
      // A kind no slot takes is only saved («такое не надевают»).
      if (await moves.run(!plan.ok && plan.kinds ? planKind(view, thing.id, kind, ctx) : plan)) setPicker(null);
    } else if (await moves.run(planKind(view, thing.id, kind, ctx))) setPicker(null);
  };
  const move = async (thing: Item, target: MoveTarget, quantity: number | null) => {
    if (await moves.run(planMove(view, thing.id, target, quantity, ctx))) { setAsk(null); if (quantity === null || quantity === thing.quantity) setCard(null); }
  };
  /** A drop onto a list: a worn thing dropped on its own list comes off; a stack asks how many. */
  const dropOn = (holder: Holder, id: string) => {
    setDragId(null);
    const thing = item(id);
    if (!thing || !holder.target || !holder.entity) return;
    const bag = view.storages.find((row) => row.entity_id === holder.entity!.id);
    if (bag?.id === thing.storage_id && thing.owner_entity_id === holder.entity.id) {
      if (thing.equipped_entity_id) void moves.run(planUnequip(view, thing.id, ctx));
      return;
    }
    const loaned = thing.detail?.status === "lent" || thing.detail?.status === "pledged";
    if (thing.quantity > 1 && !loaned) setAsk({ itemId: thing.id, target: holder.target, label: holder.kind === "mount" ? c(`седельные сумки (${holder.name})`, `saddlebags (${holder.name})`) : holder.name });
    else void move(thing, holder.target, null);
  };
  const pick = (thing: Item, holder: string) => {
    setPicker(null);
    setCard((current) => (current?.itemId === thing.id ? null : { itemId: thing.id, holder }));
  };
  // --- the panels --------------------------------------------------------------------------------------------
  const selected = item(card?.itemId ?? null)?.quantity ? item(card?.itemId ?? null) : null;
  const cardHolder = holders.find((holder) => holder.key === card?.holder) ?? own;
  const wearer = cardHolder.entity && PEOPLE.includes(cardHolder.entity.kind) ? cardHolder.entity : entity;
  const tiles: [string, string | number][] = [];
  if (sheet.armorClass !== null) tiles.push([c.label("Armor class"), sheet.armorClass]);
  if (sheet.speed) tiles.push([c.label("Speed"), sheet.speed]);
  // Stub zeros never show («Навык 0» disappears); a number the sheet already gives is not repeated.
  for (const [key, value] of model.derivedStats.filter(([, value]) => value !== 0)) {
    const label = c.label(statLabel(key));
    if (!tiles.some(([seen]) => seen === label)) tiles.push([label, value]);
  }
  const counters = sheetCounters(entity, c.language);
  const stats = (
    <Panel label={c("Характеристики", "Characteristics")}>
      <div className={r.stack}>
        <div className={r.stack} style={{ gap: 4 }}>
          <h1 className={s.name}>{entity.name}</h1>
          <div className={s.lineRow}>
            <span className={r.muted}>{[sheet.role, sheet.level !== null ? c.t("Level {level}", { level: sheet.level }) : null, sheet.tier].filter(Boolean).join(" · ")}</span>
            {entity.conditions.length > 0 && <span className={r.badgeAmber}>{entity.conditions.join(", ")}</span>}
          </div>
        </div>
        {entity.hp !== null && <Gauge label={c("Хиты", "Hit points")} value={entity.hp} max={entity.max_hp} />}
        {entity.hp !== null && !chrome?.href && <HpCorrection data={data} entity={entity} />}
        <MoneyLine person={entity} people={people} onSend={(to, amounts) => moves.run(planMoney(view, entity.id, to, amounts, ctx))} />
        {tiles.length > 0 && (
          <div className={`${r.stats} ${s.stats} ${s.tiles}`}>
            {tiles.map(([label, value]) => <div key={label} className={r.stat}><div className={r.statKey}>{label}</div><div className={`${r.statMain} ${typeof value === "string" ? s.statWords : ""}`}>{value}</div></div>)}
          </div>
        )}
        {sheet.attributes.length > 0 && (
          <div className={`${r.stats} ${s.stats} ${s.attrs}`}>
            {sheet.attributes.map(([label, value]) => (
              <div key={label} className={r.stat}><div className={r.statKey}>{c.t(label)}</div><div className={r.statMain}>{value}</div></div>
            ))}
          </div>
        )}
        <Counters counters={counters} />
        <SheetLines sheet={sheet} skills={model.skills} />
        <SheetEditor key={entity.id} sheet={sheet} busy={moves.busy} onSave={(patch) => moves.run(planSheet(view, entity.id, patch, ctx))} />
      </div>
    </Panel>
  );
  const dollEntity = entity;
  const dollSlots = equipmentOf(view, dollEntity);
  const doll = (
    <Doll entity={dollEntity} slots={dollSlots} figure={dollEntity.id === hero?.id ? preview?.figure ?? null : null} selectedId={selected?.id ?? null}
      dragging={item(dragId)} onPick={(thing) => pick(thing, dollEntity.id)} onRedraw={() => setRedraw({ kind: "entity", id: dollEntity.id })}
      onDragStart={setDragId} onDragEnd={() => setDragId(null)}
      onDrop={(slot, id) => { setDragId(null); const thing = item(id); if (thing) void equip(thing, dollEntity.id, slot); }} />
  );
  const backstory = entity.details.trim() ? (
    <Panel label={c("Предыстория", "Backstory")} eyebrow={c("Предыстория", "Backstory")}>
      <p className="prose" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{entity.details}</p>
    </Panel>
  ) : null;
  const categories = [...new Set(own.items.map((row) => row.category))];
  const shown = own.items.filter((row) => !filter || (filter === EQUIPPED_FILTER ? row.equipped_entity_id === entity.id : row.category === filter));
  const inventory = (
    <Panel label={c("Инвентарь", "Inventory")} title={c("Вещи при себе", "Carried")} action={<WalletLine wallet={own.wallet} compact />}>
      <div className={r.stack} style={{ gap: 10 }}>
        {own.items.length > 0 && (
          <div className={`${r.chips} ${s.filters}`} role="group" aria-label={c("Фильтр", "Filter")}>
            <button type="button" className={r.chipButton} aria-pressed={!filter} onClick={() => setFilter("")}>{c("Всё", "All")}</button>
            {own.items.some((row) => row.equipped_entity_id === entity.id) && (
              <button type="button" className={r.chipButton} aria-pressed={filter === EQUIPPED_FILTER} onClick={() => setFilter(EQUIPPED_FILTER)}>{c.t("Equipped")}</button>
            )}
            {categories.map((category) => (
              <button key={category} type="button" className={r.chipButton} aria-pressed={filter === category} onClick={() => setFilter(category)}>{capital(kindWord(category, c))}</button>
            ))}
          </div>
        )}
        <ItemRows view={view} items={shown} viewerId={entity.id} selectedId={selected?.id ?? null} onPick={(thing) => pick(thing, entity.id)}
          onDragStart={setDragId} onDragEnd={() => setDragId(null)} onDrop={(id) => dropOn(own, id)} />
        {own.items.some((row) => itemRarity(row)) && <RarityLegend />}
      </div>
    </Panel>
  );
  const lists = (
    <div className={s.lists}>
      {holders.map((holder) => (
        <HolderList key={holder.key} view={view} holder={holder} selectedId={selected?.id ?? null} people={people}
          active={holder.key === entity.id} dragging={!!dragId}
          onSelectMember={holder.kind === "person" && holder.entity ? () => { setSelectedId(holder.entity!.id); setFilter(""); } : undefined}
          onPick={(thing) => pick(thing, holder.key)} onDragStart={setDragId} onDragEnd={() => setDragId(null)} onDrop={(id) => dropOn(holder, id)}
          onSend={(from, to, amounts) => moves.run(planMoney(view, from, to, amounts, ctx))} />
      ))}
    </div>
  );
  const spells = <SpellsTab entity={entity} sheet={sheet} onCast={act} onPrepare={(spell, prepared) => void moves.run(planSheet(view, entity.id, { spells: [{ ...spell, prepared }] }, ctx))} />;
  const askItem = item(ask?.itemId ?? null);
  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={r.row}>
          <TabBar tabs={tabs} value={tab} onChange={setTab} label={c("Разделы листа", "Sheet sections")} wrap />
          <div className={`${r.tabs} ${r.tabsWrap}`}>{links.map((link) => <a key={link.id} className={r.tab} href={href(link.id)}>{link.label}</a>)}</div>
        </div>
        {members.length > 1 && (
          <div className={s.switcher} role="group" aria-label={c("Чей лист", "Whose sheet")}>
            {members.map((member) => (
              <button key={member.id} type="button" className={s.member} aria-pressed={member.id === entity.id} aria-label={member.name} title={member.name}
                onClick={() => { setSelectedId(member.id); setCard(null); setFilter(""); }}>
                <Art subject={{ kind: "entity", id: member.id }} name={member.name} position="center 25%" drawingLabel="…" />
              </button>
            ))}
          </div>
        )}
      </div>
      {moves.status && (
        <p className={moves.status?.tone === "error" ? r.error : r.note} role={moves.status?.tone === "error" ? "alert" : "status"}>
          {moves.status.text}
          <button type="button" className={s.dismiss} aria-label={c("Скрыть", "Dismiss")} onClick={() => moves.setStatus(null)}><X size={14} aria-hidden="true" /></button>
        </p>
      )}
      {ask && askItem && (
        <QuantityAsk item={askItem} label={ask.label} busy={moves.busy} onCancel={() => setAsk(null)} onMove={(quantity) => void move(askItem, ask.target, quantity)} />
      )}
      {tab === "char" && (
        <div className={s.grid}>
          {stats}
          <div className={s.stackCol}>{doll}{backstory}</div>
          {inventory}
        </div>
      )}
      {tab === "inv" && <div className={s.gridInventory}>{doll}{lists}</div>}
      {tab === "spells" && <div className={s.gridSpells}>{spells}</div>}
      {selected && (
        <ItemCard key={selected.id} item={selected} view={view} viewerId={cardHolder.entity?.id ?? null} wearer={wearer}
          readOnly={cardHolder.kind === "place"} busy={moves.busy}
          targets={targetsFor(view, holders, selected, hero?.id ?? null, c)}
          picker={picker?.itemId === selected.id ? picker : null}
          onClose={() => { setCard(null); setPicker(null); }}
          onRedraw={() => setRedraw({ kind: "item", id: selected.id })}
          onUse={() => act(c(`Использую «${selected.name}».`, `I use the ${selected.name}.`))}
          onEquip={() => void equip(selected, wearer.id, null)}
          onUnequip={() => void moves.run(planUnequip(view, selected.id, ctx))}
          onKind={() => setPicker({ itemId: selected.id, wearerId: wearer.id, slot: null, kinds: [...ITEM_KINDS], reason: "", mode: "kind" })}
          onPickKind={(kind) => void pickKind(kind)}
          onMove={(target, quantity) => void move(selected, target, quantity)} />
      )}
      {redraw && (
        <>
          <button type="button" className={r.drawerScrim} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)} />
          <aside className={r.drawer} role="dialog" aria-modal="true" aria-label={c("Перерисовать", "Redraw")}>
            <div className={r.panelHead}>
              <h2 className={r.h2}>{c("Перерисовать", "Redraw")}</h2>
              <button type="button" className={r.iconBtn} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)}><X size={20} aria-hidden="true" /></button>
            </div>
            <p className={r.note}>{c("Старая картинка остаётся на месте, пока новая не готова и не принята. Прошлые версии сохраняются.", "The previous picture stays until the new one is ready and accepted. Earlier versions are kept.")}</p>
            <RedrawAnchor data={data} subject={redraw} name={(redraw.kind === "entity" ? view.entities.find((row) => row.id === redraw.id)?.name : view.items.find((row) => row.id === redraw.id)?.name) ?? ""} />
          </aside>
        </>
      )}
      {legacy && (
        <details className={s.legacy}>
          <summary>{c("Ещё · правка записей персонажа и предметов", "More · edit character and item records")}</summary>
          {legacy}
        </details>
      )}
    </div>
  );
}

const kindWord = (kind: string, c: Copy) => ((ITEM_KINDS as readonly string[]).includes(kind) ? kindLabel(kind, c.language) : c.label(inventoryCategoryLabel(kind)));
const capital = (text: string) => (text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text);

/** The sheet's counters (pools with their labels; a counter without a real label carries a quiet «?»). */
function Counters({ counters }: { counters: ReturnType<typeof sheetCounters> }) {
  const c = useCopy();
  if (!counters.length) return null;
  return (
    <div>
      <span className={r.eyebrow}>{c("Счётчики", "Counters")}</span>
      {counters.map((counter) => (
        <div key={counter.key} className={r.resRow}>
          <span>
            {counter.label}
            {!counter.labelled && <abbr className={s.unnamed} title={c("название не задано", "no name given")}>?</abbr>}
          </span>
          {counter.max !== null && counter.max <= 12 ? <Pips left={counter.value} max={counter.max} label={counter.label} />
            : <span className={r.num}>{counter.max !== null ? `${counter.value} / ${counter.max}` : counter.value}</span>}
        </div>
      ))}
    </div>
  );
}

/** Skills, saves and attacks with their numbers, abilities and limitations — the hero's and a companion's alike. */
export function SheetLines({ sheet, skills, compact = false }: { sheet: SheetView; skills?: string[]; compact?: boolean }) {
  const c = useCopy();
  const numbered = (title: string, rows: string[]) => rows.length > 0 && (
    <div>
      <span className={r.eyebrow}>{title}</span>
      {rows.map((line) => {
        const match = /^(.*?)\s*([+−-]\s*\d+)$/u.exec(line.trim());
        return <div key={line} className={s.skill}><span>{match ? match[1] : line}</span>{match && <span className={s.skillValue}>{match[2].replace(/\s/g, "")}</span>}</div>;
      })}
    </div>
  );
  const listed = (title: string, rows: string[]) => rows.length > 0 && (
    <div><span className={r.eyebrow}>{title}</span><ul className={s.list}>{rows.map((line) => <li key={line}>{line}</li>)}</ul></div>
  );
  return (
    <>
      {listed(c("Атаки", "Attacks"), sheet.attacks)}
      {numbered(c("Спасброски", "Saving throws"), sheet.saves)}
      {numbered(c("Навыки", "Skills"), skills ?? sheet.skills)}
      {!compact && listed(c("Умения", "Abilities"), sheet.abilities)}
      {!compact && listed(c("Слабости", "Limitations"), sheet.limitations)}
    </>
  );
}

/** «Изменить лист» (design §9): the owner corrects the level, the defence, the speed and the lines (one per line); the
 * sheet is saved with the record (schema 2) and the DM reads the edit next turn. */
function SheetEditor({ sheet, busy, onSave }: { sheet: SheetView; busy: boolean; onSave: (patch: SheetPatch) => Promise<boolean> }) {
  const c = useCopy();
  const initial = {
    level: sheet.level === null ? "" : String(sheet.level), armorClass: sheet.armorClass === null ? "" : String(sheet.armorClass), speed: sheet.speed ?? "",
    preparedMax: sheet.preparedMax === null ? "" : String(sheet.preparedMax),
    skills: sheet.skills.join("\n"), saves: sheet.saves.join("\n"), attacks: sheet.attacks.join("\n"), abilities: sheet.abilities.join("\n"),
  };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initial);
  if (!open) return <button type="button" className={s.linkButton} onClick={() => { setDraft(initial); setOpen(true); }}>{c("Изменить лист…", "Edit the sheet…")}</button>;
  const number = (text: string) => (text.trim() === "" ? null : Math.round(Number(text)));
  const rows = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const save = async () => {
    const patch: SheetPatch = {};
    if (draft.level !== initial.level) patch.level = number(draft.level);
    if (draft.armorClass !== initial.armorClass) patch.armorClass = number(draft.armorClass);
    if (draft.speed !== initial.speed) patch.speed = draft.speed;
    if (draft.preparedMax !== initial.preparedMax) patch.preparedMax = number(draft.preparedMax);
    for (const key of ["skills", "saves", "attacks", "abilities"] as const) if (draft[key] !== initial[key]) patch[key] = rows(draft[key]);
    if (await onSave(patch)) setOpen(false);
  };
  const field = (key: keyof typeof initial, label: string, kind: "number" | "text" | "lines") => (
    <label key={key} className={kind === "lines" ? s.editLines : s.splitField}>
      <span className={r.eyebrow}>{label}</span>
      {kind === "lines" ? <textarea rows={Math.min(8, Math.max(3, draft[key].split("\n").length + 1))} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
        : <input type={kind} inputMode={kind === "number" ? "numeric" : undefined} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />}
    </label>
  );
  return (
    <form className={s.split} onSubmit={(event) => { event.preventDefault(); void save(); }}>
      {field("level", c("Уровень", "Level"), "number")}
      {field("armorClass", c.label("Armor class"), "number")}
      {field("speed", c.label("Speed"), "text")}
      {(sheet.spells.length > 0 || sheet.preparedMax !== null) && field("preparedMax", c("Подготовлено максимум", "Prepared at most"), "number")}
      {field("attacks", c("Атаки — по строке", "Attacks — one per line"), "lines")}
      {field("saves", c("Спасброски", "Saving throws"), "lines")}
      {field("skills", c("Навыки", "Skills"), "lines")}
      {field("abilities", c("Умения", "Abilities"), "lines")}
      <div className={r.row}>
        <button type="submit" className={r.btnMain} disabled={busy}>{c("Сохранить", "Save")}</button>
        <button type="button" className={r.btnGhost} onClick={() => setOpen(false)}>{c("Отмена", "Cancel")}</button>
      </div>
    </form>
  );
}

/** «Кошелёк: 10 зм · 11 см · 26 мм» with «Разделить…» — amounts per coin to another person (an owner move). */
export function MoneyLine({ person, people, onSend }: { person: Entity; people: Entity[];
  onSend: (to: string, amounts: Record<string, number>) => Promise<boolean> }) {
  const c = useCopy();
  const [open, setOpen] = useState(false);
  const others = people.filter((row) => row.id !== person.id);
  const wallet = walletOfEntity(person);
  const parts = walletParts(wallet, c.language);
  const [to, setTo] = useState(others[0]?.id ?? "");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  return (
    <div className={r.stack} style={{ gap: 6 }}>
      <WalletLine wallet={wallet} action={others.length > 0 && parts.length > 0 ? (
        <button type="button" className={s.linkButton} aria-expanded={open} onClick={() => setOpen(!open)}>{c("Разделить…", "Split…")}</button>
      ) : undefined} />
      {open && (
        <form className={s.split} onSubmit={async (event) => {
          event.preventDefault();
          const numbers = Object.fromEntries(Object.entries(amounts).map(([code, text]) => [code, Number(text || 0)]));
          if (await onSend(to || others[0]?.id, numbers)) { setAmounts({}); setOpen(false); }
        }}>
          <label className={s.splitField}>
            <span className={r.eyebrow}>{c("Кому", "To")}</span>
            <select value={to || others[0]?.id} onChange={(event) => setTo(event.target.value)}>
              {others.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
            </select>
          </label>
          {parts.map((part) => (
            <label key={part.label} className={s.splitField}>
              <span className={r.eyebrow}><abbr title={part.title}>{part.label}</abbr> · {c(`есть ${part.amount}`, `has ${part.amount}`)}</span>
              <input type="number" min={0} max={part.amount} step={1} inputMode="numeric" value={amounts[part.label] ?? ""} placeholder="0"
                onChange={(event) => setAmounts({ ...amounts, [part.label]: event.target.value })} />
            </label>
          ))}
          <div className={r.row}>
            <button type="submit" className={r.btnMain}>{c("Передать", "Hand over")}</button>
            <button type="button" className={r.btnGhost} onClick={() => setOpen(false)}>{c("Отмена", "Cancel")}</button>
          </div>
        </form>
      )}
    </div>
  );
}

/** The paper doll: the body down the left, jewellery and belt on the right, both hands under the figure. A slot takes
 * a drop of a thing (the kinds it accepts light up while dragging); a click opens the worn thing's card. */
function Doll({ entity, slots, figure, selectedId, dragging, onPick, onRedraw, onDrop, onDragStart, onDragEnd }: {
  entity: Entity; slots: SlotView[]; figure: string | null; selectedId: string | null; dragging: Item | null;
  onPick: (item: Item) => void; onRedraw: () => void; onDrop: (slot: string, itemId: string) => void;
  onDragStart: (id: string) => void; onDragEnd: () => void;
}) {
  const c = useCopy();
  const layout = dollLayout(slots);
  const slot = (row: SlotView) => (
    <SlotButton key={row.id} slot={row} pressed={!!row.item && row.item.id === selectedId}
      fits={!!dragging && row.accepts.includes(dragging.category)} onPick={onPick} onDrop={onDrop} onDragStart={onDragStart} onDragEnd={onDragEnd} />
  );
  return (
    <Panel label={c("Снаряжение", "Equipment")} className={s.dollPanel}>
      <div className={s.doll}>
        <div className={s.slots}>{layout.left.map(slot)}</div>
        <Figure entity={entity} figure={figure} onRedraw={onRedraw} />
        <div className={s.slots}>{layout.right.map(slot)}</div>
        {layout.hands.length > 0 && <div className={s.hands}>{layout.hands.map(slot)}</div>}
      </div>
      <p className={s.dollHint}>{c("Перетащите вещь на слот, чтобы надеть; со слота в список — чтобы снять.", "Drag a thing onto a slot to wear it; from a slot onto a list to take it off.")}</p>
    </Panel>
  );
}

function SlotButton({ slot, pressed, fits, onPick, onDrop, onDragStart, onDragEnd }: {
  slot: SlotView; pressed: boolean; fits: boolean; onPick: (item: Item) => void; onDrop: (slot: string, itemId: string) => void;
  onDragStart: (id: string) => void; onDragEnd: () => void;
}) {
  const c = useCopy();
  const [over, setOver] = useState(false);
  const item = slot.item;
  const blocked = slot.blockedBy;
  return (
    <button type="button" data-item-pick="" className={`${item ? s.slot : s.slotEmpty} ${fits ? s.slotFits : ""} ${over ? s.slotOver : ""}`} aria-pressed={pressed}
      aria-disabled={!item && !blocked} title={blocked ? c(`занято: ${blocked.name}`, `taken: ${blocked.name}`) : item?.name ?? slot.label}
      onClick={() => { if (item) onPick(item); else if (blocked) onPick(blocked); }}
      draggable={!!item} onDragStart={(event) => { if (!item) return; event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; onDragStart(item.id); }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; if (!over) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => { event.preventDefault(); setOver(false); const id = event.dataTransfer.getData("text/plain"); if (id) onDrop(slot.id, id); }}>
      <span className={s.slotIcon}>{item ? <Art subject={{ kind: "item", id: item.id }} name={item.name} /> : <Package size={18} aria-hidden="true" />}</span>
      <span className={s.slotText}>
        <span className={s.slotLabel}>{slot.label}</span>
        <span className={s.slotName}>{item ? inventoryItemLabel(item.name) : blocked ? c(`занято: ${inventoryItemLabel(blocked.name)}`, `taken: ${inventoryItemLabel(blocked.name)}`) : c("пусто", "empty")}</span>
      </span>
    </button>
  );
}

function Figure({ entity, figure, onRedraw }: { entity: Entity; figure: string | null; onRedraw: () => void }) {
  const c = useCopy();
  const image = useSubjectImage({ kind: "entity", id: entity.id });
  // The doll shows the hero's full-figure anchor (Stage V) when one is ready; the portrait stays the fallback.
  const pictures = usePictures();
  const figureAnchor = pictures ? anchorFor(pictures.board, { kind: "entity", id: entity.id }, "figure").picture : null;
  const fullFigure = figure ?? (figureAnchor && pictures ? pictures.urlFor(figureAnchor) : null);
  return (
    <div className={s.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {fullFigure ? <img src={fullFigure} alt={entity.name} style={{ objectFit: "cover", objectPosition: "center top" }} />
        : <Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 20%" />}
      <div className={s.figureTools}>
        <button type="button" className={s.redraw} onClick={onRedraw} aria-label={c("Перерисовать портрет", "Redraw portrait")}>{c("Перерисовать", "Redraw")}</button>
        {image.version && <span className={s.version}>{c(`версия ${image.version.replace("/", " из ")}`, `version ${image.version.replace("/", " of ")}`)}</span>}
      </div>
    </div>
  );
}

/** One holder's list on the inventory tab: its name, its purse, its things; drop a thing here to hand it over. */
function HolderList({ view, holder, selectedId, people, active, dragging, onSelectMember, onPick, onDragStart, onDragEnd, onDrop, onSend }: {
  view: CampaignSnapshot; holder: Holder; selectedId: string | null; people: Entity[]; active: boolean; dragging: boolean;
  onSelectMember?: () => void; onPick: (item: Item) => void; onDragStart: (id: string) => void; onDragEnd: () => void; onDrop: (id: string) => void;
  onSend: (from: string, to: string, amounts: Record<string, number>) => Promise<boolean>;
}) {
  const c = useCopy();
  return (
    <section className={`${s.holder} ${active ? s.holderActive : ""} ${holder.kind === "place" ? s.holderPlace : ""}`} aria-label={`${holder.tag}: ${holder.name}`}>
      <header className={s.holderHead}>
        {holder.entity ? (
          <button type="button" className={s.holderAvatar} onClick={onSelectMember} disabled={!onSelectMember} aria-label={holder.name} title={onSelectMember ? c("Показать лист", "Show the sheet") : holder.name}>
            <Art subject={{ kind: "entity", id: holder.entity.id }} name={holder.name} position="center 25%" drawingLabel="…" />
          </button>
        ) : <span className={s.holderAvatar}><Package size={20} aria-hidden="true" /></span>}
        <span className={s.holderTitle}>
          <span className={r.eyebrow}>{holder.tag}</span>
          <span className={s.holderName}>{holder.name}</span>
        </span>
        <span className={`${r.small} ${r.muted}`}>{holder.items.length}</span>
      </header>
      {holder.kind === "person" && holder.entity
        ? <MoneyLine person={holder.entity} people={people} onSend={(to, amounts) => onSend(holder.entity!.id, to, amounts)} />
        : <WalletLine wallet={holder.wallet} />}
      <ItemRows view={view} items={holder.items} viewerId={holder.entity?.id ?? null} selectedId={selectedId} onPick={onPick}
        onDragStart={onDragStart} onDragEnd={onDragEnd} onDrop={holder.target ? onDrop : undefined} dragging={dragging}
        empty={holder.kind === "place" ? c("Ничего не лежит.", "Nothing lies here.") : undefined} />
    </section>
  );
}

/** Things as rows (the mockup's list): picture, name, kind and state (worn, lent, borrowed), quantity. Rows drag;
 * the list takes a drop when `onDrop` is given. */
function ItemRows({ view, items, viewerId, selectedId, onPick, onDragStart, onDragEnd, onDrop, dragging = false, empty }: {
  view: CampaignSnapshot; items: Item[]; viewerId: string | null; selectedId: string | null; onPick: (item: Item) => void;
  onDragStart: (id: string) => void; onDragEnd: () => void; onDrop?: (id: string) => void; dragging?: boolean; empty?: string;
}) {
  const c = useCopy();
  const [over, setOver] = useState(false);
  const drop = onDrop ? {
    onDragOver: (event: DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; if (!over) setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: (event: DragEvent) => { event.preventDefault(); setOver(false); const id = event.dataTransfer.getData("text/plain"); if (id) onDrop(id); },
  } : {};
  return (
    <div className={`${s.rows} ${over ? s.rowsOver : ""} ${dragging && onDrop ? s.rowsReady : ""}`} {...drop}>
      {items.map((item) => <ItemRow key={item.id} view={view} item={item} viewerId={viewerId} pressed={item.id === selectedId} onPick={() => onPick(item)}
        onDragStart={onDragStart} onDragEnd={onDragEnd} />)}
      {!items.length && <p className={r.empty}>{empty ?? c("Здесь пока пусто.", "Nothing here yet.")}</p>}
    </div>
  );
}

function ItemRow({ view, item, viewerId, pressed, onPick, onDragStart, onDragEnd }: {
  view: CampaignSnapshot; item: Item; viewerId: string | null; pressed: boolean; onPick: () => void; onDragStart: (id: string) => void; onDragEnd: () => void;
}) {
  const c = useCopy();
  const rarity = itemRarity(item);
  const image = useSubjectImage({ kind: "item", id: item.id });
  const Glyph = CATEGORY_GLYPHS[categoryGlyphKey(item.category)];
  const loan = viewerId ? loanMark(view, item, viewerId) : null;
  const wearer = item.equipped_entity_id ? view.entities.find((row) => row.id === item.equipped_entity_id) ?? null : null;
  const slot = wearer ? slotsFor(wearer, view.campaign.language).find((row) => row.id === item.equipped_slot)?.label ?? item.equipped_slot : null;
  const state = loan ? (loan.kind === "out" ? c(`${loan.status === "lent" ? "отдано" : "в залоге"}: ${loan.name}`, `${loan.status}: ${loan.name}`) : c(`взято у: ${loan.name}`, `borrowed from ${loan.name}`))
    : slot ? c(`надето: ${slot}`, `worn: ${slot}`) : null;
  return (
    <button type="button" data-item-pick="" className={`${s.row} ${rarity ? rarityClass[rarity] : ""}`} aria-pressed={pressed} title={item.name} onClick={onPick}
      draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; onDragStart(item.id); }} onDragEnd={onDragEnd}>
      <span className={s.rowArt}>{image.url || image.drawing ? <Art subject={{ kind: "item", id: item.id }} name={item.name} drawingLabel="…" /> : <Glyph size={18} aria-hidden="true" />}</span>
      <span className={s.rowText}>
        <span className={s.rowName}>{inventoryItemLabel(item.name)}</span>
        <span className={s.rowMeta}>
          {kindWord(item.category, c)}
          {state && <span className={loan ? s.rowLoan : s.rowWorn}> · {state}</span>}
        </span>
      </span>
      <span className={`${r.num} ${s.rowQty}`}>{item.quantity > 1 ? `×${item.quantity}` : ""}</span>
    </button>
  );
}

/** «Сколько перенести?» for a stack dropped on another list. */
function QuantityAsk({ item, label, busy, onMove, onCancel }: { item: Item; label: string; busy: boolean; onMove: (quantity: number) => void; onCancel: () => void }) {
  const c = useCopy();
  const [count, setCount] = useState(String(item.quantity));
  const value = Math.round(Number(count));
  const valid = Number.isFinite(value) && value >= 1 && value <= item.quantity;
  return (
    <form className={s.ask} onSubmit={(event) => { event.preventDefault(); if (valid) onMove(value); }}>
      <span>{c(`«${item.name}» → ${label}. Сколько из ${item.quantity}?`, `${item.name} → ${label}. How many of ${item.quantity}?`)}</span>
      <input type="number" min={1} max={item.quantity} step={1} value={count} onChange={(event) => setCount(event.target.value)} aria-label={c("Сколько", "How many")} autoFocus />
      <button type="submit" className={r.btnMain} disabled={!valid || busy}>{c("Перенести", "Move")}</button>
      <button type="button" className={r.btnGhost} onClick={onCancel}>{c("Отмена", "Cancel")}</button>
    </form>
  );
}

/** Owner correction of hit points (the registry port): −10 −5 −1 +1 +5 +10 «Полные», recorded as an
 * owner correction of the record, visible in the history like any correction. */
function HpCorrection({ data, entity }: { data: CampaignSnapshot; entity: Entity }) {
  const c = useCopy();
  const context = useOptionalCampaignData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Fix run after session 2 (item 30): the manual corrections wait behind «Исправить хиты…» (the DM keeps the hit
  // points in play); the buttons show only when the owner opens the correction.
  const [open, setOpen] = useState(false);
  if (!context || entity.hp === null) return null;
  if (!open) return <button type="button" className={s.linkButton} onClick={() => setOpen(true)}>{c("Исправить хиты…", "Correct hit points…")}</button>;
  const set = async (next: number) => {
    const hp = Math.max(0, entity.max_hp !== null ? Math.min(entity.max_hp, next) : next);
    if (hp === entity.hp || busy) return;
    setBusy(true);
    setError("");
    try {
      // EntityInput only: the row's clock, profile and sheet are never part of an owner correction.
      await context.mutate(createMutationAttempt(null, { operation: "entity.save", campaignId: data.campaign.id, expectedRevision: entity.revision,
        timeline: data.timeline, correctionScope: "timeline", payload: { ...entityPayload(entity), hp } }));
      await context.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : c("Не удалось записать поправку.", "The correction could not be saved."));
    } finally { setBusy(false); }
  };
  const steps = [-10, -5, -1, 1, 5, 10];
  return (
    <div className={r.row} role="group" aria-label={c("Поправить хиты", "Correct hit points")}>
      {steps.map((step) => (
        <button key={step} type="button" className={r.btnGhost} disabled={busy} onClick={() => void set(entity.hp! + step)}>{step > 0 ? `+${step}` : step}</button>
      ))}
      {entity.max_hp !== null && <button type="button" className={r.btnGhost} disabled={busy || entity.hp === entity.max_hp} onClick={() => void set(entity.max_hp!)}>{c("Полные", "Full")}</button>}
      <button type="button" className={s.linkButton} onClick={() => setOpen(false)}>{c("Готово", "Done")}</button>
      {error && <span className={r.error} role="alert">{error}</span>}
      <span className={r.note} style={{ flexBasis: "100%", margin: 0 }}>{c("Поправка владельца: записывается в историю записи; в игре хиты ведёт ведущий.", "An owner correction, kept in the record's history; in play the DM keeps the hit points.")}</span>
    </div>
  );
}

// --- the spells tab (item 49) ------------------------------------------------------------------------------------
/** Cantrips, then each level with its slot pips and «подготовлено N»; the spellbook (known, not prepared) apart; the
 * spell being concentrated on; a card per spell with «Колдовать». Spells are the sheet's records, not code. */
function SpellsTab({ entity, sheet, onCast, onPrepare }: { entity: Entity; sheet: SheetView; onCast: (text: string) => void; onPrepare: (spell: SpellRecord, prepared: boolean) => void }) {
  const c = useCopy();
  const book = spellBook(sheet.spells, entity.resources, c.language);
  const preparing = sheet.preparedMax !== null || sheet.spells.some((spell) => spell.prepared !== undefined);
  const castable = (spell: SpellRecord) => spell.level === 0 || !preparing || spell.prepared === true;
  const spellbook = preparing ? sheet.spells.filter((spell) => spell.level > 0 && !spell.prepared).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)) : [];
  const prepared = sheet.spells.filter((spell) => spell.level > 0 && spell.prepared).length;
  const focus = concentrationOf(entity);
  const [name, setName] = useState<string | null>(sheet.spells.find((spell) => spell.name === focus)?.name ?? sheet.spells.find(castable)?.name ?? null);
  const chosen = sheet.spells.find((spell) => spell.name === name) ?? null;
  const spellButton = (spell: SpellRecord) => (
    <button key={spell.name} type="button" className={s.spell} aria-pressed={spell.name === chosen?.name} onClick={() => setName(spell.name)}>
      <span>{spell.name}</span>
      <span className={s.spellMarks}>
        {spell.ritual && <abbr title={c("ритуал", "ritual")}>{c("Р", "R")}</abbr>}
        {spell.concentration && <abbr title={c("концентрация", "concentration")}>{c("К", "C")}</abbr>}
        {spell.name === focus && <span className={r.badgeAmber}>{c("сейчас", "now")}</span>}
      </span>
    </button>
  );
  return (
    <>
      <Panel title={c("Заклинания", "Spells")} eyebrow={entity.name}
        action={preparing ? <span className={r.num}>{c(`подготовлено ${prepared} из ${sheet.preparedMax ?? prepared + spellbook.length}`, `prepared ${prepared} of ${sheet.preparedMax ?? prepared + spellbook.length}`)}</span> : undefined}>
        <div className={r.stack}>
          {focus && <p className={s.focus}>{c("Концентрация", "Concentration")}: <b>{focus}</b></p>}
          {book.map((group) => {
            const rows = group.spells.filter(castable);
            return (
              <section key={group.level} className={s.spellLevel} aria-label={group.label}>
                <div className={s.spellHead}>
                  <span className={s.spellLevelName}>{group.label}</span>
                  {group.slots && <Pips left={group.slots.value} max={group.slots.max} label={group.label} />}
                  {preparing && group.level > 0 && group.prepared > 0 && <span className={`${r.small} ${r.muted}`}>{c(`подготовлено ${group.prepared}`, `${group.prepared} prepared`)}</span>}
                </div>
                {rows.length ? <div className={s.spellList}>{rows.map(spellButton)}</div>
                  : <p className={`${r.small} ${r.muted}`} style={{ margin: 0 }}>{group.level === 0 ? c("Заговоров нет.", "No cantrips.") : c("Нет подготовленных.", "None prepared.")}</p>}
              </section>
            );
          })}
          {spellbook.length > 0 && (
            <section className={s.spellLevel} aria-label={c("Книга заклинаний", "Spellbook")}>
              <div className={s.spellHead}><BookOpen size={16} aria-hidden="true" /><span className={s.spellLevelName}>{c("Книга заклинаний · не подготовлены", "Spellbook · not prepared")}</span></div>
              <div className={s.spellList}>{spellbook.map(spellButton)}</div>
            </section>
          )}
          {sheet.spellLines.length > 0 && (
            <div><span className={r.eyebrow}>{c("Записано в листе", "On the sheet")}</span><ul className={s.list}>{sheet.spellLines.map((line) => <li key={line}>{line}</li>)}</ul></div>
          )}
          {!sheet.spells.length && !sheet.spellLines.length && <p className={r.empty}>{c("Заклинаний в листе пока нет.", "No spells on the sheet yet.")}</p>}
        </div>
      </Panel>
      {chosen ? <SpellCard key={chosen.name} spell={chosen} book={book} castable={castable(chosen)} onCast={onCast} onPrepare={preparing && chosen.level > 0 ? (prepared) => onPrepare(chosen, prepared) : undefined} /> : <Panel><p className={r.empty}>{c("Выберите заклинание.", "Pick a spell.")}</p></Panel>}
    </>
  );
}

function SpellCard({ spell, book, castable, onCast, onPrepare }: { spell: SpellRecord; book: ReturnType<typeof spellBook>; castable: boolean; onCast: (text: string) => void;
  /** The owner prepares a spell or puts it back in the book (a sheet edit). */
  onPrepare?: (prepared: boolean) => void }) {
  const c = useCopy();
  const lowest = castSlot(spell, book);
  const free = book.filter((row) => row.level >= spell.level && row.slots && row.slots.value > 0).map((row) => row.level);
  const [level, setLevel] = useState<number | null>(null);
  const slot = spell.level === 0 ? null : level !== null && free.includes(level) ? level : lowest;
  const ritualOnly = spell.level > 0 && slot === null && spell.ritual;
  const can = castable && (spell.level === 0 || slot !== null || ritualOnly);
  const rows: [string, string | undefined][] = [
    [c("Время накладывания", "Casting time"), spell.castingTime], [c("Дистанция", "Range"), spell.range], [c("Компоненты", "Components"), spell.components],
    [c("Длительность", "Duration"), spell.duration], [c("Спасбросок / атака", "Save / attack"), spell.saveOrAttack], [c("Урон", "Damage"), spell.damage],
  ];
  return (
    <div className={`${r.parchment} ${s.spellCard}`}>
      <div className={s.card}>
        <span className={r.eyebrow}>{[book.find((row) => row.level === spell.level)?.label ?? String(spell.level), spell.ritual ? c("ритуал", "ritual") : null,
          spell.concentration ? c("концентрация", "concentration") : null].filter(Boolean).join(" · ")}</span>
        <span className={r.parchmentTitle}>{spell.name}</span>
        <dl className={s.spellFields}>
          {rows.filter(([, value]) => value && value.trim()).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {spell.text && <span className={r.parchmentText}>{spell.text}</span>}
        {spell.higherLevels && <span className={r.parchmentText}><b>{c("На более высоких кругах. ", "At higher levels. ")}</b>{spell.higherLevels}</span>}
        <div className={r.row}>
          {spell.level > 0 && free.length > 1 && (
            <label className={`${s.splitField} ${s.parchmentField}`}>
              <span className={r.eyebrow}>{c("Ячейка", "Slot")}</span>
              <select value={slot ?? ""} onChange={(event) => setLevel(Number(event.target.value))}>
                {free.map((row) => <option key={row} value={row}>{book.find((group) => group.level === row)?.label ?? row}</option>)}
              </select>
            </label>
          )}
          <button type="button" className={r.btnGhost} disabled={!can} title={!castable ? c("Не подготовлено", "Not prepared") : !can ? c("Свободных ячеек нет", "No free slot") : undefined}
            onClick={() => onCast(castLine(spell, slot, c.language))}>
            {ritualOnly ? c("Колдовать ритуалом", "Cast as a ritual") : c("Колдовать", "Cast")}
          </button>
          {onPrepare && (
            <button type="button" className={s.parchmentLink} onClick={() => onPrepare(!spell.prepared)}>
              {spell.prepared ? c("Убрать в книгу", "Back to the book") : c("Подготовить", "Prepare")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- things ----------------------------------------------------------------------------------------------------
/** A glyph for the kinds and the common category words records use; anything else gets the generic box. */
const CATEGORY_GLYPHS: Record<string, LucideIcon> = {
  weapon: Sword, armour: Shield, clothing: Shirt, jewelry: Gem, consumable: FlaskConical, tool: Wrench, ammunition: Target, key: KeyRound, gear: Backpack, other: Package,
};
const CATEGORY_WORDS: [RegExp, keyof typeof CATEGORY_GLYPHS][] = [
  [/weapon|blade|firearm|gun/i, "weapon"],
  [/armou?r|shield/i, "armour"],
  [/cloth|wear/i, "clothing"],
  [/jewel|accessor|ring|amulet/i, "jewelry"],
  [/consum|potion|food|drink|ration|medic/i, "consumable"],
  [/tool|kit|instrument/i, "tool"],
  [/ammo|ammunition|round|arrow|bolt/i, "ammunition"],
  [/quest|key|story|document|letter|evidence/i, "key"],
  [/gear|pack|equipment|supply|travel/i, "gear"],
];
export function categoryGlyphKey(category: string): string {
  return CATEGORY_WORDS.find(([pattern]) => pattern.test(category))?.[1] ?? "other";
}

/** Until an item has a picture its tile shows the short name with a category glyph;
 * the plain box stays only for items without a name. */
export function ItemCell({ item, pressed, onPick }: { item: Item; pressed: boolean; onPick: () => void }) {
  const rarity = itemRarity(item);
  const image = useSubjectImage({ kind: "item", id: item.id });
  const name = inventoryItemLabel(item.name).trim();
  const Glyph = CATEGORY_GLYPHS[categoryGlyphKey(item.category)];
  return (
    <button type="button" data-item-pick="" className={`${r.cell} ${rarity ? rarityClass[rarity] : ""}`} aria-pressed={pressed} aria-label={item.name} title={item.name} onClick={onPick}>
      {image.url || image.drawing ? <Art subject={{ kind: "item", id: item.id }} name={item.name} className={s.cellArt} drawingLabel="…" />
        : name ? (
          <span className={s.cellText} aria-hidden="true">
            <Glyph size={14} />
            <span className={s.cellName}>{name}</span>
          </span>
        ) : <Package size={26} aria-hidden="true" />}
      {item.quantity > 1 && <span className={r.qty}>{item.quantity}</span>}
    </button>
  );
}

type Picker = { kinds: string[]; reason: string; mode: "equip" | "kind" };
/** The item card: what the thing is and does, and the owner's moves — «Надеть / Снять» (with the kind picker),
 * «Отдать → …» (a part of a stack by number), «Использовать» (a line for the next turn). It opens on a click and
 * closes on a second click, the ×, or Escape. */
export function ItemCard({ item, view, viewerId, wearer, targets, readOnly = false, busy = false, picker, onClose, onRedraw, onUse, onEquip, onUnequip, onKind, onPickKind, onMove }: {
  item: Item; view: CampaignSnapshot; viewerId: string | null; wearer: Entity | null;
  targets: { key: string; label: string; target: MoveTarget }[]; readOnly?: boolean; busy?: boolean; picker: Picker | null;
  onClose: () => void; onRedraw: () => void; onUse?: () => void; onEquip?: () => void; onUnequip?: () => void; onKind?: () => void;
  onPickKind?: (kind: string) => void; onMove: (target: MoveTarget, quantity: number | null) => void;
}) {
  const c = useCopy();
  const image = useSubjectImage({ kind: "item", id: item.id });
  const [count, setCount] = useState("");
  const quantity = item.quantity > 1 && count ? Math.max(1, Math.min(item.quantity, Math.round(Number(count)) || item.quantity)) : null;
  const mechanics = itemMechanics(item);
  const loan = viewerId ? loanMark(view, item, viewerId) : null;
  const worn = item.equipped_entity_id ? view.entities.find((row) => row.id === item.equipped_entity_id) ?? null : null;
  const slot = worn ? slotsFor(worn, view.campaign.language).find((row) => row.id === item.equipped_slot)?.label ?? item.equipped_slot : null;
  const history = (item.detail?.history ?? []).slice(-3).reverse();
  return (
    <aside className={s.inspector} role="dialog" aria-label={item.name}>
      <div className={`${r.parchment} ${s.inspectorBody}`}>
        <div className={s.card}>
          <div className={s.cardArt}><Art subject={{ kind: "item", id: item.id }} name={item.name} drawingLabel={c("рисуется…", "drawing…")} /></div>
          <button type="button" className={r.btnGhost} onClick={onRedraw}>{image.url ? c("Перерисовать", "Redraw") : c("Нарисовать", "Draw")}</button>
        </div>
        <div className={s.card}>
          <div className={s.cardTop}>
            <span className={r.eyebrow}>{[kindWord(item.category, c), item.quantity > 1 ? c(`${item.quantity} шт.`, `×${item.quantity}`) : null,
              worn && slot ? c(`надето: ${worn.name} — ${slot}`, `worn: ${worn.name} — ${slot}`) : null].filter(Boolean).join(" · ")}</span>
            <button type="button" className={s.cardClose} aria-label={c("Закрыть", "Close")} onClick={onClose}><X size={18} aria-hidden="true" /></button>
          </div>
          <span className={r.parchmentTitle}>{inventoryItemLabel(item.name)}</span>
          {loan && <span className={s.cardLoan}>{loan.kind === "out" ? c(`${loan.status === "lent" ? "Отдано на время" : "В залоге"}: ${loan.name}`, `${loan.status === "lent" ? "Lent" : "Pledged"} to ${loan.name}`) : c(`Взято у: ${loan.name}`, `Borrowed from ${loan.name}`)}</span>}
          {item.description && <span className={r.parchmentText}>{item.description}</span>}
          {item.mechanics && <span className={r.parchmentText} style={{ fontStyle: "italic" }}>{item.mechanics}</span>}
          {(mechanics.bonuses.length > 0 || mechanics.hands === 2 || mechanics.attunement || mechanics.charges) && (
            <div className={s.cardFacts}>
              {mechanics.bonuses.map((bonus) => <span key={`${bonus.to}${bonus.value}`} className={s.fact}>{bonus.value >= 0 ? "+" : ""}{bonus.value} {bonus.to}</span>)}
              {mechanics.hands === 2 && <span className={s.fact}>{c("двуручное", "two-handed")}</span>}
              {mechanics.attunement && <span className={s.fact}>{c("настройка", "attunement")}</span>}
              {mechanics.charges && <span className={s.fact}>{c("заряды", "charges")} <Pips left={mechanics.charges.value} max={mechanics.charges.max} label={c("Заряды", "Charges")} /></span>}
            </div>
          )}
          {history.length > 0 && (
            <ul className={s.history} aria-label={c("История вещи", "The thing's history")}>
              {history.map((entry, index) => <li key={`${entry.at}-${index}`}>{historyWord(entry.event, c)}{entry.note ? `: ${entry.note}` : ""}</li>)}
            </ul>
          )}
          {!readOnly && (
            <div className={r.row}>
              {item.equipped_entity_id ? <button type="button" className={r.btnGhost} disabled={busy} onClick={onUnequip}>{c("Снять", "Take off")}</button>
                : wearer && onEquip && <button type="button" className={r.btnGhost} disabled={busy} onClick={onEquip}>{wearer.id === item.owner_entity_id || !item.owner_entity_id ? c("Надеть", "Wear") : c(`Надеть на: ${wearer.name}`, `Put on ${wearer.name}`)}</button>}
              {onUse && <button type="button" className={r.btnGhost} onClick={onUse}>{c("Использовать", "Use")}</button>}
              {onKind && <button type="button" className={s.parchmentLink} onClick={onKind}>{c("Вид вещи…", "Kind…")}</button>}
            </div>
          )}
          {picker && onPickKind && (
            <div className={s.picker} role="group" aria-label={c("Вид вещи", "Kind of thing")}>
              {picker.reason && <span className={s.pickerNote}>{picker.reason}</span>}
              <div className={r.chips}>
                {picker.kinds.map((kind) => <button key={kind} type="button" className={r.chipButton} aria-pressed={kind === item.category} disabled={busy} onClick={() => onPickKind(kind)}>{kindLabel(kind, c.language)}</button>)}
              </div>
            </div>
          )}
          {targets.length > 0 && (
            <div className={s.give}>
              <span className={r.eyebrow}>{readOnly ? c("Забрать →", "Take →") : c("Отдать →", "Give →")}</span>
              {item.quantity > 1 && !loan && (
                <label className={s.giveCount}>
                  <input type="number" min={1} max={item.quantity} step={1} value={count} placeholder={String(item.quantity)} aria-label={c("Сколько", "How many")}
                    onChange={(event) => setCount(event.target.value)} />
                  <span className={r.small}>{c(`из ${item.quantity}`, `of ${item.quantity}`)}</span>
                </label>
              )}
              <div className={r.row}>
                {targets.map((target) => <button key={target.key} type="button" className={r.btnGhost} disabled={busy} onClick={() => onMove(target.target, quantity)}>{target.label}</button>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
function historyWord(event: string, c: Copy) {
  const words: Record<string, [string, string]> = {
    owner_moved: ["перенесено", "moved"], owner_equipped: ["надето", "worn"], owner_unequipped: ["снято", "taken off"], owner_kind: ["вид", "kind"],
    created: ["появилось", "created"], transferred: ["передано", "handed over"], returned: ["вернулось", "returned"], lent: ["отдано на время", "lent"],
    pledged: ["в залог", "pledged"], consumed: ["израсходовано", "used up"], lost: ["утрачено", "lost"], modified: ["изменено", "changed"],
  };
  const word = words[event];
  return word ? c(word[0], word[1]) : event;
}

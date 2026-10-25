"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Package, X } from "lucide-react";
import type { CampaignSnapshot, Entity, Item, MutationInput } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { characterViewModel } from "@/lib/character-view-model";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import {
  equipmentOf, heroOf, holdingsNavLabel, holdingsOf, inventoryOf, mountsOf, partyOf, placePilesOf, sheetOf, sheetPlates,
  type SheetView,
} from "@/lib/ui/campaign-view";
import { derivedSheetOf, manualArmourClass, sheetLabels5e, signed, type DerivedSave } from "@/lib/live2d/battle/rules-5e";
import { ITEM_KINDS, walletOfEntity, walletParts, type Wallet } from "@/lib/inventory/model";
import type { KindGroupId } from "@/lib/inventory/grid";
import type { SheetPatch } from "@/lib/inventory/sheet";
import {
  applyPlan, entityPayload, hasSpellSlots, planEquip, planKind, planMoney, planMove, planSheet, planUnequip, sheetCounters,
  undoPayload, type MovePlan, type MoveStep, type MoveTarget,
} from "@/lib/inventory/owner-moves";
import type { PictureComposition } from "@/lib/visual-frame/pictures";
import { ClientPersistenceError, createMutationAttempt } from "@/lib/persistence/client";
import { useOptionalCampaignData } from "../persistence-context";
import { RedrawAnchor } from "./redraw-anchor";
import { Doll, InventoryGrid, ItemCard } from "./inventory-grid";
import { useChrome, type CampaignScreenId } from "./shell";
import { SpellsTab, useSpellConversion } from "./spells-tab";
import { conversionPatch } from "@/lib/inventory/spell-records";
import {
  Art,
  Gauge,
  Panel,
  Pips,
  registry as r,
  TabBar,
  useCopy,
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
  // Fix S3-accept А1: one inventory at a time — the person picked above, or a mount's saddlebags / what lies here.
  const [holderKey, setHolderKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<KindGroupId | "all">("all");
  const [card, setCard] = useState<{ itemId: string; holder: string } | null>(preview?.itemId ? { itemId: preview.itemId, holder: preview.memberId ?? hero?.id ?? "" } : null);
  const [picker, setPicker] = useState<{ itemId: string; wearerId: string; slot: string | null; kinds: string[]; reason: string; mode: "equip" | "kind" } | null>(null);
  const [ask, setAsk] = useState<{ itemId: string; target: MoveTarget; label: string } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [redraw, setRedraw] = useState<{ kind: "entity" | "item"; id: string; composition?: PictureComposition } | null>(null);
  // Findings S3, item 4: whose sheet editor is open, and whether it opened from «уровень не указан» (the level focused).
  const [editing, setEditing] = useState<{ entityId: string; level: boolean } | null>(null);
  // The card closes on Escape (item 33: it no longer «вечно висит») and on a click outside it (item 30).
  useCardDismiss(!!card, () => { setCard(null); setPicker(null); });
  // Fix S3-accept В1: the party's «Умения» spell prose turns into spell records once (the owner's sheet correction).
  useSpellConversion({ view, people: members, play, preview: !!chrome?.href, busy: moves.busy, run: moves.run,
    ctx: { language: view.campaign.language, at: play?.worldMinutes ?? 0, newId: () => crypto.randomUUID() } });
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
  // Fix S3-accept А1: the inventory tab shows one holder — the person picked above, or the mount or the pile picked there.
  const bagHolder = tab === "inv" ? holders.find((holder) => holder.key === holderKey && holder.kind !== "person") ?? own : own;
  const spellsShown = sheet.spells.length > 0 || sheet.spellLines.length > 0 || hasSpellSlots(entity) || !!conversionPatch(entity.character_sheet, view.campaign.language);
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
  // Fix S3-accept Г1: the plates from one selector — in 5e «КД», «Атака», «Навык» with their breakdowns (the server's
  // numbers); stub zeros never show («Навык 0» disappears); a number the sheet already gives is not repeated.
  const tiles = sheetPlates(view, entity, model.derivedStats).map((plate) => ({ ...plate, label: plate.translated ? plate.label : c.label(plate.label) }));
  const derived = derivedSheetOf(view, entity);
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
            {tiles.map((plate) => <PlateTile key={plate.key} label={plate.label} value={plate.value} text={plate.text} />)}
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
        <SheetLines sheet={sheet} skills={model.skills} saves={derived?.saves} savesNeedLevel={derived?.savesNeedLevel}
          onEditSheet={() => setEditing({ entityId: entity.id, level: true })} />
        <SheetEditor key={entity.id} sheet={sheet} busy={moves.busy} ruledAc={derived?.ac && derived.ac.source !== "sheet" ? { manual: manualArmourClass(entity) } : null}
          open={editing?.entityId === entity.id} focusLevel={!!editing?.level} onOpen={() => setEditing({ entityId: entity.id, level: false })} onClose={() => setEditing(null)}
          onSave={(patch, manualAc) => moves.run(planSheet(view, entity.id, patch, ctx, manualAc))} />
      </div>
    </Panel>
  );
  const dollEntity = entity;
  const dollSlots = equipmentOf(view, dollEntity);
  const dollAc = derived?.ac ? { label: sheetLabels5e(c.language).ac, value: derived.ac.value, text: derived.ac.text } : null;
  const doll = (
    <Doll entity={dollEntity} slots={dollSlots} figure={dollEntity.id === hero?.id ? preview?.figure ?? null : null} selectedId={selected?.id ?? null} armour={dollAc}
      dragging={item(dragId)} onPick={(thing) => pick(thing, dollEntity.id)} onRedraw={() => setRedraw({ kind: "entity", id: dollEntity.id, composition: "figure" })}
      onDragStart={setDragId} onDragEnd={() => setDragId(null)}
      onDrop={(slot, id) => { setDragId(null); const thing = item(id); if (thing) void equip(thing, dollEntity.id, slot); }} />
  );
  const backstory = entity.details.trim() ? (
    <Panel label={c("Предыстория", "Backstory")} eyebrow={c("Предыстория", "Backstory")}>
      <p className="prose" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{entity.details}</p>
    </Panel>
  ) : null;
  // Fix S3-accept А1: the things as cells (as before the lists), one holder at a time, the type filter on top.
  const grid = (holder: Holder) => (
    <InventoryGrid view={view} items={holder.items} viewerId={holder.entity?.id ?? null} selectedId={selected?.id ?? null} filter={filter} onFilter={setFilter}
      onPick={(thing) => pick(thing, holder.key)} onDragStart={setDragId} onDragEnd={() => setDragId(null)} dragging={!!dragId}
      onDrop={holder.target ? (id) => dropOn(holder, id) : undefined} empty={holder.kind === "place" ? c("Ничего не лежит.", "Nothing lies here.") : undefined} />
  );
  const inventory = (
    <Panel label={c("Инвентарь", "Inventory")} title={c("Вещи при себе", "Carried")} action={<WalletLine wallet={own.wallet} compact />}>
      {grid(own)}
    </Panel>
  );
  const bag = (
    <Panel label={c("Инвентарь", "Inventory")} eyebrow={bagHolder.tag || undefined} title={bagHolder.name} className={s.bagPanel}>
      <div className={r.stack} style={{ gap: 10 }}>
        {bagHolder.kind === "person" && bagHolder.entity
          ? <MoneyLine person={bagHolder.entity} people={people} onSend={(to, amounts) => moves.run(planMoney(view, bagHolder.entity!.id, to, amounts, ctx))} />
          : <WalletLine wallet={bagHolder.wallet} />}
        {grid(bagHolder)}
      </div>
    </Panel>
  );
  // The switch above the sheet: the people; on the inventory tab also the mounts' saddlebags and what lies here. A thing
  // dropped on a portrait goes to that holder (the drag between the old side-by-side lists, kept).
  const extraHolders = tab === "inv" ? holders.filter((holder) => holder.kind !== "person") : [];
  const switchDrop = (holder: Holder | undefined) => (holder?.target && tab === "inv" ? {
    onDragOver: (event: DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; },
    onDrop: (event: DragEvent) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); if (id) dropOn(holder, id); },
  } : {});
  const spells = <SpellsTab entity={entity} sheet={sheet} onCast={act} onPrepare={(spell, prepared) => void moves.run(planSheet(view, entity.id, { spells: [{ ...spell, prepared }] }, ctx))} />;
  const askItem = item(ask?.itemId ?? null);
  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={r.row}>
          <TabBar tabs={tabs} value={tab} onChange={setTab} label={c("Разделы листа", "Sheet sections")} wrap />
          <div className={`${r.tabs} ${r.tabsWrap}`}>{links.map((link) => <a key={link.id} className={r.tab} href={href(link.id)}>{link.label}</a>)}</div>
        </div>
        {members.length + extraHolders.length > 1 && (
          <div className={s.switcher} role="group" aria-label={tab === "inv" ? c("Чей инвентарь", "Whose inventory") : c("Чей лист", "Whose sheet")}>
            {members.map((member) => (
              <button key={member.id} type="button" className={s.member} aria-pressed={member.id === entity.id && bagHolder.kind === "person"} aria-label={member.name} title={member.name}
                onClick={() => { setSelectedId(member.id); setHolderKey(null); setCard(null); setFilter("all"); }} {...switchDrop(holders.find((holder) => holder.key === member.id))}>
                <Art subject={{ kind: "entity", id: member.id }} name={member.name} position="center 25%" drawingLabel="…" />
              </button>
            ))}
            {extraHolders.map((holder) => (
              <button key={holder.key} type="button" className={`${s.member} ${holder.kind === "place" ? s.memberPlace : ""}`} aria-pressed={bagHolder.key === holder.key}
                aria-label={`${holder.tag}: ${holder.name}`} title={`${holder.tag}: ${holder.name}`}
                onClick={() => { setHolderKey(holder.key); setCard(null); setFilter("all"); }} {...switchDrop(holder)}>
                {holder.entity ? <Art subject={{ kind: "entity", id: holder.entity.id }} name={holder.name} position="center 35%" drawingLabel="…" /> : <Package size={20} aria-hidden="true" />}
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
      {tab === "inv" && (bagHolder.kind === "person" ? <div className={s.gridInventory}>{doll}{bag}</div> : bag)}
      {tab === "spells" && spells}
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
            <RedrawAnchor data={data} subject={{ kind: redraw.kind, id: redraw.id }} composition={redraw.composition} name={(redraw.kind === "entity" ? view.entities.find((row) => row.id === redraw.id)?.name : view.items.find((row) => row.id === redraw.id)?.name) ?? ""} />
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

/** Fix S3-accept Г1: a plate of the sheet's numbers; one the rules module explains shows how it is made on hover (title)
 * and on a tap (the line under the number). */
function PlateTile({ label, value, text }: { label: string; value: string | number; text: string | null }) {
  const [open, setOpen] = useState(false);
  const main = <div className={`${r.statMain} ${typeof value === "string" && !/^[+−-]?\d+$/u.test(value) ? s.statWords : ""}`}>{value}</div>;
  if (!text) return <div className={r.stat}><div className={r.statKey}>{label}</div>{main}</div>;
  return (
    <button type="button" className={`${r.stat} ${s.plate}`} title={text} aria-expanded={open} onClick={() => setOpen(!open)}>
      <div className={r.statKey}>{label}</div>{main}
      {open && <div className={s.plateWhy}>{text}</div>}
    </button>
  );
}

/** Skills, saves and attacks with their numbers, abilities and limitations — the hero's and a companion's alike. Fix
 * S3-accept Г3: in a 5e campaign the saves are the rules module's (the worn ring's +1 counted), each explained.
 * Findings S3, item 4: a class's saves without a level read «уровень не указан», with «Изменить лист» where the sheet
 * can be edited (`onEditSheet`). */
export function SheetLines({ sheet, skills, saves, savesNeedLevel = false, onEditSheet, compact = false }: { sheet: SheetView; skills?: string[]; saves?: DerivedSave[];
  savesNeedLevel?: boolean; onEditSheet?: () => void; compact?: boolean }) {
  const c = useCopy();
  const explained = saves && saves.length > 0 && (
    <div>
      <span className={r.eyebrow}>{c("Спасброски", "Saving throws")}</span>
      {saves.map((save) => <SaveRow key={save.ability} save={save} />)}
    </div>
  );
  const levelUnset = !explained && savesNeedLevel && (
    <div data-saves-level-unset="">
      <span className={r.eyebrow}>{c("Спасброски", "Saving throws")}</span>
      <div className={s.skill}>
        <span className={r.muted}>{c("Уровень не указан", "Level not set")}</span>
        {onEditSheet && <button type="button" className={s.linkButton} onClick={onEditSheet}>{c("Изменить лист", "Edit sheet")}</button>}
      </div>
    </div>
  );
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
      {explained || levelUnset || numbered(c("Спасброски", "Saving throws"), sheet.saves)}
      {numbered(c("Навыки", "Skills"), skills ?? sheet.skills)}
      {!compact && listed(c("Умения", "Abilities"), sheet.abilities)}
      {!compact && listed(c("Слабости", "Limitations"), sheet.limitations)}
    </>
  );
}

/** One derived save: its number, and how it is made on hover and on a tap. */
function SaveRow({ save }: { save: DerivedSave }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`${s.skill} ${s.plateLine}`} title={save.text} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{save.label}</span><span className={s.skillValue}>{signed(save.value)}</span>
      </button>
      {open && <div className={s.plateWhy}>{save.text}</div>}
    </>
  );
}

/** «Изменить лист» (design §9): the owner corrects the level, the defence, the speed and the lines (one per line); the
 * sheet is saved with the record (schema 2) and the DM reads the edit next turn. Fix S3-accept Г3: where the 5e rules
 * count the AC (`ruledAc`), the field is «КД вручную» — empty: by the rules; a number outranks them. Findings S3, item
 * 4: the screen opens it (`open`) from this link and from the saves block's «уровень не указан» (the level focused). */
function SheetEditor({ open, focusLevel, onOpen, onClose, ...form }: SheetFormProps & { open: boolean; onOpen: () => void }) {
  const c = useCopy();
  if (!open) return <button type="button" className={s.linkButton} onClick={onOpen}>{c("Изменить лист…", "Edit the sheet…")}</button>;
  return <SheetForm {...form} focusLevel={focusLevel} onClose={onClose} />;
}
type SheetFormProps = { sheet: SheetView; busy: boolean; ruledAc: { manual: number | null } | null; focusLevel: boolean; onClose: () => void;
  onSave: (patch: SheetPatch, manualAc?: number | null) => Promise<boolean> };
/** The open editor; its draft starts from the sheet each time it opens. */
function SheetForm({ sheet, busy, ruledAc, focusLevel, onClose, onSave }: SheetFormProps) {
  const c = useCopy();
  const ac = ruledAc ? ruledAc.manual : sheet.armorClass;
  const initial = {
    level: sheet.level === null ? "" : String(sheet.level), armorClass: ac === null ? "" : String(ac), speed: sheet.speed ?? "",
    preparedMax: sheet.preparedMax === null ? "" : String(sheet.preparedMax),
    skills: sheet.skills.join("\n"), saves: sheet.saves.join("\n"), attacks: sheet.attacks.join("\n"), abilities: sheet.abilities.join("\n"),
  };
  const [draft, setDraft] = useState(initial);
  const number = (text: string) => (text.trim() === "" ? null : Math.round(Number(text)));
  const rows = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const save = async () => {
    const patch: SheetPatch = {};
    if (draft.level !== initial.level) patch.level = number(draft.level);
    const acChanged = draft.armorClass !== initial.armorClass;
    if (acChanged && !ruledAc) patch.armorClass = number(draft.armorClass);
    if (draft.speed !== initial.speed) patch.speed = draft.speed;
    if (draft.preparedMax !== initial.preparedMax) patch.preparedMax = number(draft.preparedMax);
    for (const key of ["skills", "saves", "attacks", "abilities"] as const) if (draft[key] !== initial[key]) patch[key] = rows(draft[key]);
    if (await onSave(patch, acChanged && ruledAc ? number(draft.armorClass) : undefined)) onClose();
  };
  const field = (key: keyof typeof initial, label: string, kind: "number" | "text" | "lines") => (
    <label key={key} className={kind === "lines" ? s.editLines : s.splitField}>
      <span className={r.eyebrow}>{label}</span>
      {kind === "lines" ? <textarea rows={Math.min(8, Math.max(3, draft[key].split("\n").length + 1))} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
        : <input type={kind} inputMode={kind === "number" ? "numeric" : undefined} value={draft[key]} autoFocus={focusLevel && key === "level"}
          onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />}
    </label>
  );
  return (
    <form className={s.split} onSubmit={(event) => { event.preventDefault(); void save(); }}>
      {field("level", c("Уровень", "Level"), "number")}
      {field("armorClass", ruledAc ? c("КД вручную (пусто — по правилам)", "AC by hand (empty: by the rules)") : c.label("Armor class"), "number")}
      {field("speed", c.label("Speed"), "text")}
      {(sheet.spells.length > 0 || sheet.preparedMax !== null) && field("preparedMax", c("Подготовлено максимум", "Prepared at most"), "number")}
      {field("attacks", c("Атаки — по строке", "Attacks — one per line"), "lines")}
      {field("saves", c("Спасброски", "Saving throws"), "lines")}
      {field("skills", c("Навыки", "Skills"), "lines")}
      {field("abilities", c("Умения", "Abilities"), "lines")}
      <div className={r.row}>
        <button type="submit" className={r.btnMain} disabled={busy}>{c("Сохранить", "Save")}</button>
        <button type="button" className={r.btnGhost} onClick={onClose}>{c("Отмена", "Cancel")}</button>
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


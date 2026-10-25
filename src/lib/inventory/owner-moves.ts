// Fix run after session 2, stage D (docs/runs/fix-s2-inventory-design.md §3, §5): the owner's moves without a turn —
// «Надеть / Снять», the kind picker, «Отдать → …» / drag between lists, «Забрать» from the place, «Разделить…» money —
// planned here as ordered record saves and sent by the screens as owner corrections (`item.save`, `entity.save`,
// `storage.save` in the correction scope). Pure: no server imports, no React. The same rules as the DM's tools:
// `equipPlan` and `sameStack` of the model, a lent thing returning to its owner keeps the title, a quantity never
// below 0, the history of a thing kept to its last 20 entries.
//   - A plan is a list of steps; each step names the row as it was before it (`before`, null for a new row) and the
//     full payload of the save. A row may appear in several steps: `before.revision` is the revision the server holds
//     right before that step, so the steps chain exactly.
//   - New rows (the part of a stack that moves, a missing bag) get their id from the caller (`newId`), so a failed
//     plan can be undone by the screens: every earlier step is saved back to its `before` (a new thing to quantity 0).
//   - Also the sheet's small pure helpers the screens share: the counters (never money, never spell slots), the doll's
//     slots for a record, the lent marks, the concentration and the slot «Колдовать» uses.
import type { CampaignSnapshot, Entity, EquipmentSlot, Item, ItemDetail, Storage } from "../persistence/contracts.ts";
import {
  coinOf,
  counterLabel,
  counterLabelled,
  equipPlan,
  ITEM_KINDS,
  kindLabel,
  needsUniversalSlots,
  sameStack,
  SLOT_REMAP,
  universalSlots,
  type SpellRecord,
  type SpellView,
} from "./model.ts";
import { patchSheet, sheetChanges, type SheetPatch } from "./sheet.ts";

type Lang = "ru" | "en";
const lang = (value: unknown): Lang => (value === "ru" ? "ru" : "en");
const HISTORY_LIMIT = 20;
const PEOPLE = ["player", "companion", "npc"];

export type Snapshot = Pick<CampaignSnapshot, "campaign" | "entities" | "storages" | "items" | "locations">;
/** The language of the notes and the world minute of the history entries; `newId` names a new row. */
export type MoveContext = { language: unknown; at: number; newId: () => string };

export type ItemPayload = {
  id: string; name: string; category: string; quantity: number; description: string; mechanics: string;
  owner_entity_id: string | null; storage_id: string; equipped_entity_id: string | null; equipped_slot: string | null;
  detail: ItemDetail;
};
export type EntityPayload = Pick<Entity, "id" | "kind" | "name" | "details" | "hp" | "max_hp" | "stats" | "resources" | "conditions" | "equipment_slots">
  /** Only an owner's sheet edit carries the sheet (validated by the database). */
  & { character_sheet?: Entity["character_sheet"] };
export type StoragePayload = { id: string; name: string; kind: Storage["kind"]; entity_id: string | null };
export type MoveStep =
  | { operation: "item.save"; before: Item | null; payload: ItemPayload }
  | { operation: "entity.save"; before: Entity; payload: EntityPayload }
  | { operation: "storage.save"; before: Storage | null; payload: StoragePayload };
export type MovePlan =
  | { ok: true; steps: MoveStep[]; note: string }
  /** `kinds`: the kinds to offer in the kind picker (nothing on the doll takes this thing's kind, or not this slot). */
  | { ok: false; reason: string; kinds?: string[] };

// --- payloads ------------------------------------------------------------------------------------------------
/** The fields an `item.save` writes (ItemInput with its id). */
export function itemPayload(item: Item): ItemPayload {
  return {
    id: item.id, name: item.name, category: item.category, quantity: item.quantity, description: item.description, mechanics: item.mechanics,
    owner_entity_id: item.owner_entity_id, storage_id: item.storage_id, equipped_entity_id: item.equipped_entity_id, equipped_slot: item.equipped_slot,
    detail: structuredClone(item.detail ?? {}),
  };
}
/** The fields an `entity.save` writes (EntityInput with its id): never the profile, the sheet or the row's clock. */
export function entityPayload(entity: Entity): EntityPayload {
  return {
    id: entity.id, kind: entity.kind, name: entity.name, details: entity.details, hp: entity.hp, max_hp: entity.max_hp,
    stats: { ...entity.stats }, resources: { ...entity.resources }, conditions: [...entity.conditions], equipment_slots: structuredClone(entity.equipment_slots),
  };
}
/** What saving a step back looks like: the row as it was; a thing the plan created goes to quantity 0 (rows are never
 * deleted); a bag the plan created stays (an empty bag is harmless). */
export function undoPayload(step: MoveStep): ItemPayload | EntityPayload | null {
  if (step.operation === "item.save")
    return step.before ? itemPayload(step.before) : { ...step.payload, quantity: 0, equipped_entity_id: null, equipped_slot: null };
  if (step.operation === "entity.save")
    return "character_sheet" in step.payload ? { ...entityPayload(step.before), character_sheet: step.before.character_sheet ?? null } : entityPayload(step.before);
  return null;
}
/** The history entry appended the way the server's `withHistory` does: the last 20 kept. */
export function withHistory(detail: ItemDetail | undefined, at: number, event: string, note: string): ItemDetail {
  const base = structuredClone(detail ?? {});
  return { ...base, history: [...(base.history ?? []), { at, event, note: note.slice(0, 200) }].slice(-HISTORY_LIMIT) };
}
/** The rows after a plan (the previews apply the owner's moves locally; the tests read the end state). */
export function applyPlan<T extends Snapshot>(data: T, steps: readonly MoveStep[]): T {
  const next = { ...data, entities: [...data.entities], storages: [...data.storages], items: [...data.items] };
  for (const step of steps) {
    const table = step.operation === "item.save" ? next.items : step.operation === "entity.save" ? next.entities : next.storages;
    const index = table.findIndex((row) => row.id === step.payload.id);
    const old = index >= 0 ? table[index] : null;
    const row = { ...(old ?? { campaign_id: data.campaign.id, updated_at: "" }), ...structuredClone(step.payload), revision: (old?.revision ?? 0) + 1 };
    if (index >= 0) (table as unknown[])[index] = row; else (table as unknown[]).push(row);
  }
  return next;
}

// --- the draft: the rows as the plan changes them ------------------------------------------------------------
class Draft {
  readonly steps: MoveStep[] = [];
  entities: Entity[]; storages: Storage[]; items: Item[];
  readonly data: Snapshot;
  constructor(data: Snapshot) {
    this.data = data;
    this.entities = data.entities; this.storages = data.storages; this.items = data.items;
  }
  get locations() { return this.data.locations; }
  entity(id: string | null | undefined) { return id ? this.entities.find((row) => row.id === id) ?? null : null; }
  item(id: string) { return this.items.find((row) => row.id === id) ?? null; }
  storage(id: string | null | undefined) { return id ? this.storages.find((row) => row.id === id) ?? null : null; }
  /** The bag a character carries (the first storage of the record). */
  bagOf(entity: Entity) { return this.storages.find((row) => row.entity_id === entity.id) ?? null; }
  saveItem(id: string, values: Partial<ItemPayload>, history: { event: string; note: string }[], at: number) {
    const before = this.item(id);
    const base: ItemPayload = before ? itemPayload(before) : { id, name: "", category: "gear", quantity: 0, description: "", mechanics: "",
      owner_entity_id: null, storage_id: "", equipped_entity_id: null, equipped_slot: null, detail: {} };
    let detail = values.detail ?? base.detail;
    for (const entry of history) detail = withHistory(detail, at, entry.event, entry.note);
    const payload: ItemPayload = { ...base, ...values, id, detail };
    if (payload.quantity <= 0) { payload.quantity = Math.max(0, payload.quantity); payload.equipped_entity_id = null; payload.equipped_slot = null; }
    this.steps.push({ operation: "item.save", before, payload });
    const row: Item = { ...(before ?? { campaign_id: this.data.campaign.id, updated_at: "" }), ...payload, revision: (before?.revision ?? 0) + 1 } as Item;
    this.items = before ? this.items.map((item) => (item.id === id ? row : item)) : [...this.items, row];
    return row;
  }
  saveEntity(entity: Entity, values: Partial<EntityPayload>) {
    const payload = { ...entityPayload(entity), ...values, id: entity.id };
    this.steps.push({ operation: "entity.save", before: entity, payload });
    const row = { ...entity, ...payload, revision: entity.revision + 1 };
    this.entities = this.entities.map((other) => (other.id === entity.id ? row : other));
    return row;
  }
  /** A character without a bag gets one (its kind follows the record: a mount's is a transport). */
  createBag(entity: Entity, id: string, language: Lang) {
    const kind: Storage["kind"] = entity.kind === "player" ? "player" : entity.kind === "companion" ? "companion" : entity.kind === "mount" || entity.kind === "transport" ? "transport" : "merchant";
    const name = entity.kind === "mount" ? (language === "ru" ? `Седельные сумки (${entity.name})` : `Saddlebags (${entity.name})`) : (language === "ru" ? `Вещи: ${entity.name}` : `Possessions: ${entity.name}`);
    const payload: StoragePayload = { id, name: name.slice(0, 200), kind, entity_id: entity.id };
    this.steps.push({ operation: "storage.save", before: null, payload });
    const row = { ...payload, campaign_id: this.data.campaign.id, revision: 1, updated_at: "" } as Storage;
    this.storages = [...this.storages, row];
    return row;
  }
}
const fail = (reason: string, kinds?: string[]): MovePlan => ({ ok: false, reason, ...(kinds ? { kinds } : {}) });

/** The doll of a record: the eleven slots when its own are older or missing (the screens show the eleven, and the
 * first owner move gives the record them), else its own. */
export function slotsFor(entity: Pick<Entity, "kind" | "equipment_slots">, language: unknown): EquipmentSlot[] {
  return needsUniversalSlots(entity) ? universalSlots(lang(language)) : entity.equipment_slots;
}

/** Who holds a thing, in words: the bag's character, a place's name, the storage's name. */
export function holderLabel(data: Pick<Snapshot, "entities" | "storages" | "locations">, storageId: string, ownerId: string | null, language: unknown): string {
  const storage = data.storages.find((row) => row.id === storageId) ?? null;
  const entity = data.entities.find((row) => row.id === (storage?.entity_id ?? ownerId)) ?? null;
  if (entity) return entity.kind === "mount" && storage ? storage.name : entity.name;
  const placeId = storage?.detail?.locationId;
  const place = typeof placeId === "string" ? data.locations.find((row) => row.id === placeId) : null;
  return place?.name ?? storage?.name ?? (lang(language) === "ru" ? "лагерь" : "the camp");
}
function slotLabel(slots: readonly EquipmentSlot[], id: string | null) {
  return slots.find((slot) => slot.id === id)?.label ?? id ?? "";
}
const lentStatus = (item: Item) => item.detail?.status === "lent" || item.detail?.status === "pledged";
function withoutLoan(detail: ItemDetail | undefined): ItemDetail {
  const { status: _status, holderId: _holder, condition: _condition, ...rest } = structuredClone(detail ?? {});
  void _status; void _holder; void _condition;
  return rest;
}

// --- the doll --------------------------------------------------------------------------------------------------
/** A record with older slots gets the eleven first: what it wears moves to the new slot of the same meaning
 * (neck → Амулет, ring1 → Кольцо (левая)) when that slot takes it, else comes off and stays in the inventory. The
 * database checks every worn thing against the record's slots on each save, so a thing in an old slot comes off
 * before the record changes and goes back on, in its new slot, after. */
function giveTheEleven(draft: Draft, wearer: Entity, slots: EquipmentSlot[], at: number) {
  const used = new Set<string>();
  const back: { id: string; slot: string }[] = [];
  for (const worn of draft.items.filter((row) => row.equipped_entity_id === wearer.id && row.quantity > 0)) {
    const target = worn.equipped_slot && worn.equipped_slot in SLOT_REMAP ? SLOT_REMAP[worn.equipped_slot] : worn.equipped_slot;
    const slot = slots.find((row) => row.id === target);
    const keeps = !!slot && slot.accepts.includes(worn.category) && !used.has(slot.id);
    if (keeps) used.add(slot.id);
    if (keeps && slot.id === worn.equipped_slot) continue;
    draft.saveItem(worn.id, { equipped_entity_id: null, equipped_slot: null },
      keeps ? [] : [{ event: "owner_unequipped", note: `${wearer.name} — ${worn.equipped_slot ?? ""}` }], at);
    if (keeps) back.push({ id: worn.id, slot: slot.id });
  }
  const record = draft.saveEntity(draft.entity(wearer.id)!, { equipment_slots: slots });
  for (const row of back) draft.saveItem(row.id, { equipped_entity_id: wearer.id, equipped_slot: row.slot }, [], at);
  return record;
}

/** «Надеть» (the card, or a drag onto a doll slot): the thing goes on `wearerId`'s doll by the model's rule, what was
 * in the slot (or the off hand, for a two-handed thing) comes off first; a thing in someone else's bag moves to the
 * wearer's bag in the same save (the server equips only from the wearer's own bag). `kind` is the kind picker's
 * choice, saved on the thing in the same save. */
export function planEquip(data: Snapshot, itemId: string, wearerId: string, options: { slot?: string | null; kind?: string | null }, ctx: MoveContext): MovePlan {
  const ru = lang(ctx.language) === "ru";
  const draft = new Draft(data);
  const item = draft.item(itemId);
  let wearer = draft.entity(wearerId);
  if (!item || !wearer) return fail(ru ? "Запись не найдена — обновите страницу." : "The record is gone; reload the page.");
  if (!PEOPLE.includes(wearer.kind)) return fail(ru ? `${wearer.name} не носит вещей.` : `${wearer.name} does not wear things.`);
  if (item.quantity <= 0) return fail(ru ? `«${item.name}» больше нет.` : `The ${item.name} is gone.`);
  if (lentStatus(item)) {
    const holder = draft.entity(item.detail?.holderId)?.name ?? (ru ? "другого" : "someone else");
    return fail(ru ? `«${item.name}» ${item.detail?.status === "lent" ? "одолжена" : "в залоге"} (у: ${holder}); сначала её нужно вернуть.`
      : `The ${item.name} is ${item.detail?.status} (with ${holder}); it must come back first.`);
  }
  const kind = options.kind ?? item.category;
  const slots = slotsFor(wearer, data.campaign.language);
  if (!slots.some((slot) => slot.accepts.includes(kind)))
    return fail(ru ? `Ни один слот не принимает вид «${kindLabel(kind, "ru")}». Выберите, что это за вещь.` : `No slot takes a ${kindLabel(kind, "en")}. Pick what this thing is.`, [...ITEM_KINDS]);
  const wanted = options.slot ? slots.find((slot) => slot.id === options.slot) ?? null : null;
  if (options.slot && !wanted) return fail(ru ? "Такого слота нет." : "There is no such slot.");
  if (wanted && !wanted.accepts.includes(kind))
    return fail(ru ? `«${wanted.label}» принимает: ${wanted.accepts.map((row) => kindLabel(row, "ru")).join(", ")}. Если это такая вещь — выберите вид.`
      : `${wanted.label} takes: ${wanted.accepts.map((row) => kindLabel(row, "en")).join(", ")}. If the thing is one of these, pick its kind.`, [...wanted.accepts]);
  if (needsUniversalSlots(wearer)) wearer = giveTheEleven(draft, wearer, slots, ctx.at);
  // The model's rule on the draft: the wearer has the eleven, the thing has the chosen kind.
  const plan = equipPlan(wearer, draft.items, { ...draft.item(itemId)!, category: kind }, wanted?.id ?? null, ctx.language);
  if (!plan.ok) return fail(plan.reason);
  const bag = draft.bagOf(wearer) ?? draft.createBag(wearer, ctx.newId(), lang(data.campaign.language));
  for (const off of plan.unequip) {
    const current = draft.item(off.id)!;
    if (current.equipped_entity_id !== wearer.id) continue;
    draft.saveItem(off.id, { equipped_entity_id: null, equipped_slot: null }, [{ event: "owner_unequipped", note: `${wearer.name} — ${slotLabel(slots, current.equipped_slot)}` }], ctx.at);
  }
  const now = draft.item(itemId)!;
  const moves = now.storage_id !== bag.id;
  const history = [
    ...(kind !== now.category ? [{ event: "owner_kind", note: `${wearer.name} — ${kindLabel(kind, ctx.language)}` }] : []),
    ...(moves ? [{ event: "owner_moved", note: `${holderLabel(draft, now.storage_id, now.owner_entity_id, ctx.language)} → ${wearer.name}` }] : []),
    { event: "owner_equipped", note: `${wearer.name} — ${plan.slot.label}` },
  ];
  draft.saveItem(itemId, { category: kind, storage_id: bag.id, owner_entity_id: moves ? wearer.id : now.owner_entity_id,
    equipped_entity_id: wearer.id, equipped_slot: plan.slot.id, detail: moves ? withoutLoan(now.detail) : now.detail }, history, ctx.at);
  const off = plan.unequip.map((row) => row.name);
  return { ok: true, steps: draft.steps, note: ru
    ? `${wearer.name}: «${item.name}» — ${plan.slot.label}${off.length ? `; снято: ${off.join(", ")}` : ""}`
    : `${wearer.name}: ${item.name} — ${plan.slot.label}${off.length ? `; taken off: ${off.join(", ")}` : ""}` };
}

/** «Снять»: the thing stays in the wearer's bag. */
export function planUnequip(data: Snapshot, itemId: string, ctx: MoveContext): MovePlan {
  const ru = lang(ctx.language) === "ru";
  const draft = new Draft(data);
  const item = draft.item(itemId);
  if (!item) return fail(ru ? "Запись не найдена — обновите страницу." : "The record is gone; reload the page.");
  const wearer = draft.entity(item.equipped_entity_id);
  if (!wearer || !item.equipped_slot) return fail(ru ? `«${item.name}» не надета.` : `The ${item.name} is not worn.`);
  const label = slotLabel(slotsFor(wearer, data.campaign.language), item.equipped_slot);
  draft.saveItem(itemId, { equipped_entity_id: null, equipped_slot: null }, [{ event: "owner_unequipped", note: `${wearer.name} — ${label}` }], ctx.at);
  return { ok: true, steps: draft.steps, note: ru ? `${wearer.name} снимает «${item.name}»` : `${wearer.name} takes off the ${item.name}` };
}

/** The kind picker alone (a kind no slot takes, or the owner only corrects the kind): a worn thing whose slot does
 * not take the new kind comes off in the same save. */
export function planKind(data: Snapshot, itemId: string, kind: string, ctx: MoveContext): MovePlan {
  const ru = lang(ctx.language) === "ru";
  const draft = new Draft(data);
  const item = draft.item(itemId);
  if (!item) return fail(ru ? "Запись не найдена — обновите страницу." : "The record is gone; reload the page.");
  if (!(ITEM_KINDS as readonly string[]).includes(kind)) return fail(ru ? "Неизвестный вид вещи." : "Unknown kind.");
  if (kind === item.category) return fail(ru ? "Вид уже такой." : "The kind is already that.");
  const wearer = draft.entity(item.equipped_entity_id);
  const keeps = wearer ? slotsFor(wearer, data.campaign.language).some((slot) => slot.id === item.equipped_slot && slot.accepts.includes(kind)) : true;
  const who = draft.entity(item.owner_entity_id)?.name ?? holderLabel(draft, item.storage_id, null, ctx.language);
  draft.saveItem(itemId, { category: kind, ...(keeps ? {} : { equipped_entity_id: null, equipped_slot: null }) },
    [{ event: "owner_kind", note: `${who} — ${kindLabel(kind, ctx.language)}` }], ctx.at);
  return { ok: true, steps: draft.steps, note: ru ? `«${item.name}»: ${kindLabel(kind, "ru")}` : `${item.name}: ${kindLabel(kind, "en")}` };
}

// --- moving things -------------------------------------------------------------------------------------------
/** Where a thing goes: a character (its bag; a bag is made when it has none) or a storage (a place, a base). */
export type MoveTarget = { entityId: string } | { storageId: string };
/** «Отдать → …», a drag between lists, «Забрать → …»: the whole stack or a part. A worn thing comes off; the same thing
 * already at the destination (`sameStack`) takes the quantity and the moved row goes to 0; a part makes a new stack
 * at the destination first, then the source is reduced; a lent thing moves whole, and back to its owner it keeps
 * the title (the loan ends), to anyone else it becomes theirs. */
export function planMove(data: Snapshot, itemId: string, target: MoveTarget, quantity: number | null, ctx: MoveContext): MovePlan {
  const ru = lang(ctx.language) === "ru";
  const draft = new Draft(data);
  const item = draft.item(itemId);
  if (!item || item.quantity <= 0) return fail(ru ? "Этой вещи уже нет — обновите страницу." : "The thing is gone; reload the page.");
  const count = quantity ?? item.quantity;
  if (!Number.isInteger(count) || count < 1 || count > item.quantity)
    return fail(ru ? `Можно перенести от 1 до ${item.quantity}.` : `Move between 1 and ${item.quantity}.`);
  const loaned = lentStatus(item);
  if (loaned && count !== item.quantity) return fail(ru ? "Одолженную вещь передают целиком." : "A lent thing moves whole.");
  let storage: Storage | null;
  let owner: string | null;
  if ("entityId" in target) {
    const entity = draft.entity(target.entityId);
    if (!entity) return fail(ru ? "Получатель не найден." : "The recipient is gone.");
    storage = draft.bagOf(entity);
    owner = entity.id;
  } else {
    storage = draft.storage(target.storageId);
    if (!storage) return fail(ru ? "Хранилище не найдено." : "The storage is gone.");
    owner = storage.entity_id;
  }
  const returned = loaned && owner === item.owner_entity_id;
  if (storage && storage.id === item.storage_id && owner === item.owner_entity_id && !returned)
    return fail(ru ? `«${item.name}» уже там.` : `The ${item.name} is already there.`);
  if (!storage) storage = draft.createBag(draft.entity(owner)!, ctx.newId(), lang(data.campaign.language));
  const from = holderLabel(draft, item.storage_id, item.owner_entity_id, ctx.language);
  const to = holderLabel(draft, storage.id, owner, ctx.language);
  const note = `${from} → ${to}`;
  const moved = { event: "owner_moved", note };
  const unworn = { equipped_entity_id: null, equipped_slot: null };
  if (returned) {
    draft.saveItem(itemId, { storage_id: storage.id, ...unworn, detail: withoutLoan(item.detail) }, [moved], ctx.at);
  } else {
    const arriving: Item = { ...item, quantity: count, owner_entity_id: owner, storage_id: storage.id, ...unworn, detail: withoutLoan(item.detail) };
    const stack = draft.items.find((row) => row.id !== item.id && row.storage_id === storage!.id && sameStack(arriving, row)) ?? null;
    if (stack) {
      draft.saveItem(stack.id, { quantity: stack.quantity + count }, [{ event: "owner_moved", note: `${note}: +${count}` }], ctx.at);
      draft.saveItem(itemId, { quantity: item.quantity - count, ...(count === item.quantity ? unworn : {}) }, [moved], ctx.at);
    } else if (count === item.quantity) {
      draft.saveItem(itemId, { owner_entity_id: owner, storage_id: storage.id, ...unworn, detail: withoutLoan(item.detail) }, [moved], ctx.at);
    } else {
      // The part keeps what the thing is (its bonuses, hands, charges), not the stack's history.
      const { history: _history, ...properties } = withoutLoan(item.detail);
      void _history;
      draft.saveItem(ctx.newId(), { name: item.name, category: item.category, quantity: count, description: item.description, mechanics: item.mechanics,
        owner_entity_id: owner, storage_id: storage.id, ...unworn, detail: properties }, [moved], ctx.at);
      draft.saveItem(itemId, { quantity: item.quantity - count }, [{ event: "owner_moved", note: `${note}: −${count}` }], ctx.at);
    }
  }
  return { ok: true, steps: draft.steps, note: `«${item.name}»${count > 1 ? ` ×${count}` : ""}: ${note}` };
}

// --- money between people --------------------------------------------------------------------------------------
/** A wallet entry's display code: the 5e coin's code («золотые» → зм), else the word as recorded. */
export function coinCode(label: string, language: unknown): string {
  return coinOf(label, language)?.code ?? label;
}
/** «Разделить…»: amounts per coin (by the code the wallet line shows) from one person to another — the giver's
 * entries go down first (never below 0), then the receiver's go up (an entry of the same coin, else a new one under
 * the coin's code in the campaign language). */
export function planMoney(data: Snapshot, fromId: string, toId: string, amounts: Record<string, number>, ctx: MoveContext): MovePlan {
  const ru = lang(ctx.language) === "ru";
  const draft = new Draft(data);
  const giver = draft.entity(fromId), taker = draft.entity(toId);
  if (!giver || !taker) return fail(ru ? "Запись не найдена — обновите страницу." : "The record is gone; reload the page.");
  if (giver.id === taker.id) return fail(ru ? "Кому передать?" : "To whom?");
  const wanted = Object.entries(amounts).filter(([, amount]) => amount !== 0);
  if (!wanted.length) return fail(ru ? "Укажите сумму." : "Enter an amount.");
  if (wanted.some(([, amount]) => !Number.isInteger(amount) || amount < 0)) return fail(ru ? "Суммы — целые числа не меньше 0." : "Amounts are whole numbers, 0 or more.");
  const campaignLanguage = data.campaign.language;
  const entries = (entity: Entity) => Object.keys(entity.resources)
    .filter((key) => key.startsWith("currency_") && !key.endsWith("_max") && !key.endsWith("_min"))
    .map((key) => ({ key, code: coinCode(key.slice("currency_".length).replaceAll("_", " "), ctx.language) }));
  const give = { ...giver.resources }, take = { ...taker.resources };
  const parts: string[] = [];
  for (const [code, amount] of wanted) {
    const own = entries(giver).filter((row) => row.code === code);
    const has = own.reduce((sum, row) => sum + (give[row.key] ?? 0), 0);
    if (has < amount) return fail(ru ? `У ${giver.name} только ${has} ${code}.` : `${giver.name} has only ${has} ${code}.`);
    let left = amount;
    for (const row of own) { const part = Math.min(left, give[row.key] ?? 0); give[row.key] = (give[row.key] ?? 0) - part; left -= part; }
    const coin = coinOf(code, ctx.language);
    const key = entries(taker).find((row) => row.code === code)?.key
      ?? `currency_${(coin ? coinOf(coin.code, campaignLanguage)?.code ?? coin.code : code).replaceAll(" ", "_")}`;
    take[key] = (take[key] ?? 0) + amount;
    parts.push(`${amount} ${code}`);
  }
  draft.saveEntity(giver, { resources: give });
  draft.saveEntity(taker, { resources: take });
  return { ok: true, steps: draft.steps, note: `${giver.name} → ${taker.name}: ${parts.join(" · ")}` };
}

// --- the owner's sheet edit (design §9) ----------------------------------------------------------------------
/** A sheet as text for «nothing changed»: keys sorted, empty values (null, "", []) left out. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length))
      .sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${canonical(v)}`).join(",")}}`;
  return JSON.stringify(value);
}
/** «Изменить лист» and «Подготовить»: the sheet after `patchSheet` (a schema-1 sheet becomes schema 2 with its lines
 * kept), saved with the record; the note says what changed (the DM reads the owner's edit next turn). */
export function planSheet(data: Snapshot, entityId: string, patch: SheetPatch, ctx: MoveContext, manualAc?: number | null): MovePlan {
  const ru = lang(ctx.language) === "ru";
  const draft = new Draft(data);
  const entity = draft.entity(entityId);
  if (!entity) return fail(ru ? "Запись не найдена — обновите страницу." : "The record is gone; reload the page.");
  const next = patchSheet(entity.character_sheet ?? null, patch);
  const sheetSame = !!entity.character_sheet && canonical(next) === canonical(entity.character_sheet);
  // Fix S3-accept Г3: «КД вручную» — the owner's AC over the 5e rules, kept with the record's stats (null clears it).
  const stats = { ...entity.stats };
  if (manualAc === null) delete stats.ac_manual;
  else if (manualAc !== undefined) stats.ac_manual = Math.max(1, Math.min(40, Math.round(manualAc)));
  const statsSame = (stats.ac_manual ?? null) === (entity.stats.ac_manual ?? null);
  if (sheetSame && statsSame) return fail(ru ? "Ничего не изменилось." : "Nothing changed.");
  draft.saveEntity(entity, { ...(sheetSame ? {} : { character_sheet: next }), ...(statsSame ? {} : { stats }) });
  const acNote = statsSame ? null : stats.ac_manual !== undefined ? (ru ? `КД вручную ${stats.ac_manual}` : `AC by hand ${stats.ac_manual}`) : (ru ? "КД по правилам" : "AC by the rules");
  return { ok: true, steps: draft.steps, note: `${entity.name}: ${[sheetSame ? null : sheetChanges(entity.character_sheet ?? null, next, ctx.language), acNote].filter(Boolean).join("; ")}` };
}

// --- the sheet's helpers ---------------------------------------------------------------------------------------
export type CounterView = { key: string; label: string; labelled: boolean; value: number; max: number | null };
const SLOT_KEY = /^spell_slots_\d+$/;
/** The counters of the sheet: pools with their labels; never money (the wallet line) and never spell slots (the
 * spells tab's pips). A counter without a real label is marked by the screens for renaming. */
export function sheetCounters(entity: Pick<Entity, "resources" | "public_profile">, language: unknown): CounterView[] {
  const rows: CounterView[] = [];
  for (const [key, value] of Object.entries(entity.resources ?? {})) {
    if (!Number.isFinite(value) || key.startsWith("currency_") || key.endsWith("_max") || key.endsWith("_min") || SLOT_KEY.test(key)) continue;
    const max = entity.resources[`${key}_max`];
    rows.push({ key, label: counterLabel(entity, key, language), labelled: counterLabelled(entity, key), value, max: Number.isFinite(max) ? max : null });
  }
  return rows;
}
/** Whether a record keeps spell slots (the spells tab shows their pips even before any spell is recorded). */
export function hasSpellSlots(entity: Pick<Entity, "resources">): boolean {
  return Object.keys(entity.resources ?? {}).some((key) => SLOT_KEY.test(key));
}
/** The spell being concentrated on, from a condition «Концентрация: <spell>» the DM sets and clears. */
export function concentrationOf(entity: Pick<Entity, "conditions">): string | null {
  for (const condition of entity.conditions ?? []) {
    const match = /^\s*(?:концентрация|concentration|concentrating)\s*(?:[:—–-]|on)\s*(.+?)\s*$/iu.exec(condition);
    if (match) return match[1].replace(/^[«"“]|[»"”]$/gu, "").trim() || null;
  }
  return null;
}
/** The slot «Колдовать» spends: none for a cantrip; else the lowest level with a free slot at or above the spell's;
 * null when every such slot is spent. */
export function castSlot(spell: Pick<SpellRecord, "level">, book: readonly SpellView[]): number | null {
  if (spell.level === 0) return null;
  return book.filter((row) => row.level >= spell.level && row.slots && row.slots.value > 0).map((row) => row.level).sort((a, b) => a - b)[0] ?? null;
}
/** A lent or pledged thing on its owner's list («отдано: Тоби») and on its holder's («взято у героя»). */
export function loanMark(data: Pick<Snapshot, "entities" | "storages">, item: Item, viewerId: string): { kind: "out" | "in"; status: "lent" | "pledged"; name: string } | null {
  if (!lentStatus(item)) return null;
  const status = item.detail!.status as "lent" | "pledged";
  const holderId = item.detail?.holderId ?? data.storages.find((row) => row.id === item.storage_id)?.entity_id ?? null;
  const name = (id: string | null) => data.entities.find((row) => row.id === id)?.name ?? "?";
  if (item.owner_entity_id === viewerId && holderId !== viewerId) return { kind: "out", status, name: name(holderId) };
  if (holderId === viewerId && item.owner_entity_id !== viewerId) return { kind: "in", status, name: name(item.owner_entity_id) };
  return null;
}

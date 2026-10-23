"use client";

import { useState, type DragEvent } from "react";
import { ArrowLeftRight, Backpack, Check, FlaskConical, Gem, KeyRound, Package, Shield, Shirt, Sword, Target, Wrench, X, type LucideIcon } from "lucide-react";
import type { CampaignSnapshot, Entity, Item } from "@/lib/persistence/contracts";
import { inventoryCategoryLabel, inventoryItemLabel } from "@/lib/live-inventory-view";
import { itemRarity } from "@/lib/ui/rarity";
import { dollLayout, type SlotView } from "@/lib/ui/campaign-view";
import { ITEM_KINDS, itemMechanics, kindLabel } from "@/lib/inventory/model";
import { canUse, canWear, cellState, inGroup, kindFilter, shownHistory, type KindGroupId } from "@/lib/inventory/grid";
import { loanMark, slotsFor, type MoveTarget } from "@/lib/inventory/owner-moves";
import { anchorFor } from "@/lib/visual-frame/pictures";
import { usePictures } from "./live-frames";
import { Art, Panel, Pips, RarityLegend, rarityClass, registry as r, useCopy, useSubjectImage, type Copy } from "./primitives";
import s from "./character.module.css";

// Fix S3-accept А1, А2, А4, А5 (docs/stages/FIX_S3_ACCEPT.md): the inventory as cells again («клеточкой как раньше»), one
// holder at a time with a fixed type filter on top and worn things marked on their cells; the item card with its history
// folded under «История» and only the buttons that apply; the doll with each person's full-length figure.

export const kindWord = (kind: string, c: Copy) => ((ITEM_KINDS as readonly string[]).includes(kind) ? kindLabel(kind, c.language) : c.label(inventoryCategoryLabel(kind)));

/** А1: one holder's things as cells — the fixed type filter (всё / оружие / доспех / украшения / расходуемое / снаряжение /
 * инструмент / разное; an empty kind stays in its place, dimmed), the cells with their worn and loan marks, empty cells
 * after them as before. Cells drag onto the doll or onto a portrait of the switch; the grid takes a drop when `onDrop` is given. */
export function InventoryGrid({ view, items, viewerId, selectedId, filter, onFilter, onPick, onDragStart, onDragEnd, onDrop, dragging = false, empty }: {
  view: CampaignSnapshot; items: Item[]; viewerId: string | null; selectedId: string | null; filter: KindGroupId | "all"; onFilter: (filter: KindGroupId | "all") => void;
  onPick: (item: Item) => void; onDragStart: (id: string) => void; onDragEnd: () => void; onDrop?: (id: string) => void; dragging?: boolean; empty?: string;
}) {
  const c = useCopy();
  const [over, setOver] = useState(false);
  const chips = kindFilter(items, c.language);
  const shown = items.filter((item) => inGroup(item, filter));
  const drop = onDrop ? {
    onDragOver: (event: DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; if (!over) setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: (event: DragEvent) => { event.preventDefault(); setOver(false); const id = event.dataTransfer.getData("text/plain"); if (id) onDrop(id); },
  } : {};
  const filler = Math.max(16, shown.length + ((4 - (shown.length % 4)) % 4)) - shown.length;
  return (
    <div className={r.stack} style={{ gap: 10 }}>
      <div className={`${r.chips} ${s.filters}`} role="group" aria-label={c("Вид вещей", "Kind of things")}>
        {chips.map((chip) => (
          <button key={chip.id} type="button" className={`${r.chipButton} ${chip.count ? "" : s.filterEmpty}`} aria-pressed={filter === chip.id}
            onClick={() => onFilter(chip.id)} title={c(`${chip.label}: ${chip.count}`, `${chip.label}: ${chip.count}`)}>
            {chip.label}{chip.id !== "all" && chip.count > 0 && <span className={s.filterCount}>{chip.count}</span>}
          </button>
        ))}
      </div>
      <div className={`${r.grid} ${s.bag} ${over ? s.bagOver : ""} ${dragging && onDrop ? s.bagReady : ""}`} {...drop}>
        {shown.map((item) => (
          <ItemCell key={item.id} item={item} pressed={item.id === selectedId} onPick={() => onPick(item)} state={cellState(view, item, viewerId)}
            onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ))}
        {Array.from({ length: filler }, (_, index) => <span key={`empty-${index}`} className={r.cellEmpty} aria-hidden="true" />)}
      </div>
      {!shown.length && <p className={r.empty}>{items.length ? c("Таких вещей нет.", "No things of this kind.") : empty ?? c("Здесь пока пусто.", "Nothing here yet.")}</p>}
      {items.some((row) => itemRarity(row)) && <RarityLegend />}
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

/** Until an item has a picture its tile shows the short name with a category glyph; the plain box stays only for items
 * without a name. А1: a worn thing carries a brass mark, a lent or borrowed one an amber mark (the words on hover and
 * for a screen reader); a cell drags when the screen gives `onDragStart`. */
export function ItemCell({ item, pressed, onPick, state = null, onDragStart, onDragEnd }: {
  item: Item; pressed: boolean; onPick: () => void; state?: { kind: "worn" | "loan"; text: string } | null;
  onDragStart?: (id: string) => void; onDragEnd?: () => void;
}) {
  const rarity = itemRarity(item);
  const image = useSubjectImage({ kind: "item", id: item.id });
  const name = inventoryItemLabel(item.name).trim();
  const Glyph = CATEGORY_GLYPHS[categoryGlyphKey(item.category)];
  const label = [item.name, item.quantity > 1 ? `×${item.quantity}` : null, state?.text].filter(Boolean).join(" · ");
  return (
    <button type="button" data-item-pick="" className={`${r.cell} ${rarity ? rarityClass[rarity] : ""} ${state?.kind === "worn" ? s.cellWorn : ""}`} aria-pressed={pressed}
      aria-label={label} title={label} onClick={onPick}
      draggable={!!onDragStart} onDragStart={onDragStart ? (event) => { event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; onDragStart(item.id); } : undefined}
      onDragEnd={onDragEnd}>
      {image.url || image.drawing ? <Art subject={{ kind: "item", id: item.id }} name={item.name} className={s.cellArt} drawingLabel="…" />
        : name ? (
          <span className={s.cellText} aria-hidden="true">
            <Glyph size={14} />
            <span className={s.cellName}>{name}</span>
          </span>
        ) : <Package size={26} aria-hidden="true" />}
      {state && <span className={state.kind === "worn" ? s.cellMarkWorn : s.cellMarkLoan} aria-hidden="true">{state.kind === "worn" ? <Check size={13} /> : <ArrowLeftRight size={13} />}</span>}
      {item.quantity > 1 && <span className={r.qty}>{item.quantity}</span>}
    </button>
  );
}

type Picker = { kinds: string[]; reason: string; mode: "equip" | "kind" };
/** The item card: what the thing is and does, and the owner's moves — «Надеть / Снять» (with the kind picker),
 * «Отдать → …» (a part of a stack by number), «Использовать» (a line for the next turn). It opens on a click and
 * closes on a second click, the ×, or Escape. А4: «Надеть» only for a thing worn on a slot, «Использовать» only for a
 * consumable or a thing whose record says how it is used; «Вид вещи…» and «Отдать →» stay for everything (a clue too).
 * А2: the history (appeared, worn, taken off, handed over) is folded under «История». */
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
  const history = shownHistory(item);
  const wearable = !!wearer && canWear(item, slotsFor(wearer, view.campaign.language));
  const usable = canUse(item);
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
          {!readOnly && (
            <div className={r.row}>
              {item.equipped_entity_id ? <button type="button" className={r.btnGhost} disabled={busy} onClick={onUnequip}>{c("Снять", "Take off")}</button>
                : wearable && onEquip && <button type="button" className={r.btnGhost} disabled={busy} onClick={onEquip}>{wearer!.id === item.owner_entity_id || !item.owner_entity_id ? c("Надеть", "Wear") : c(`Надеть на: ${wearer!.name}`, `Put on ${wearer!.name}`)}</button>}
              {usable && onUse && <button type="button" className={r.btnGhost} onClick={onUse}>{c("Использовать", "Use")}</button>}
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
          {history.length > 0 && (
            <details className={s.historyFold}>
              <summary>{c(`История · ${history.length}`, `History · ${history.length}`)}</summary>
              <ul className={s.history} aria-label={c("История вещи", "The thing's history")}>
                {history.map((entry, index) => <li key={`${entry.at}-${index}`}>{historyWord(entry.event, c)}{entry.note ? `: ${entry.note}` : ""}</li>)}
              </ul>
            </details>
          )}
        </div>
      </div>
    </aside>
  );
}
export function historyWord(event: string, c: Copy) {
  const words: Record<string, [string, string]> = {
    owner_moved: ["перенесено", "moved"], owner_equipped: ["надето", "worn"], owner_unequipped: ["снято", "taken off"], owner_kind: ["вид", "kind"],
    owner_corrected: ["поправка", "corrected"],
    created: ["появилось", "created"], transferred: ["передано", "handed over"], returned: ["вернулось", "returned"], lent: ["отдано на время", "lent"],
    pledged: ["в залог", "pledged"], consumed: ["израсходовано", "used up"], lost: ["утрачено", "lost"], modified: ["изменено", "changed"],
    merged: ["объединено", "merged"],
  };
  const word = words[event];
  return word ? c(word[0], word[1]) : event;
}

// --- the doll -----------------------------------------------------------------------------------------------------
/** The paper doll: the body down the left, jewellery and belt on the right, both hands under the figure. A slot takes
 * a drop of a thing (the kinds it accepts light up while dragging); a click opens the worn thing's card. */
export function Doll({ entity, slots, figure, selectedId, dragging, onPick, onRedraw, onDrop, onDragStart, onDragEnd }: {
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
        <Figure key={entity.id} entity={entity} figure={figure} onRedraw={onRedraw} />
        <div className={s.slots}>{layout.right.map(slot)}</div>
        {layout.hands.length > 0 && <div className={s.hands}>{layout.hands.map(slot)}</div>}
      </div>
      <p className={s.dollHint}>{c("Перетащите вещь на слот, чтобы надеть; со слота в клетки — чтобы снять; на портрет сверху — чтобы отдать.", "Drag a thing onto a slot to wear it; from a slot onto the cells to take it off; onto a portrait above to hand it over.")}</p>
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

/** The doll's figure (Stage V's full-figure anchor). А5: the hero's and every companion's — the autopilot draws each
 * person's figure after their portrait (anchorSet), within the cap; until it is ready the portrait sits at the top of the
 * frame at its own size, never stretched to the frame. «Перерисовать» redraws the figure («Нарисовать в полный рост»
 * when there is none yet, e.g. with the autopilot off). */
function Figure({ entity, figure, onRedraw }: { entity: Entity; figure: string | null; onRedraw: () => void }) {
  const c = useCopy();
  const pictures = usePictures();
  const anchor = pictures ? anchorFor(pictures.board, { kind: "entity", id: entity.id }, "figure") : null;
  const fullFigure = figure ?? (anchor?.picture && pictures ? pictures.urlFor(anchor.picture) : null);
  return (
    <div className={s.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {fullFigure ? <img src={fullFigure} alt={entity.name} style={{ objectFit: "cover", objectPosition: "center top" }} />
        : (
          <div className={s.figureWait}>
            <span className={s.figurePortrait}><Art subject={{ kind: "entity", id: entity.id }} name={entity.name} position="center 20%" drawingLabel="…" /></span>
            {anchor?.drawing && <span className={s.figureNote} role="status">{c("рисуется в полный рост…", "drawing the full figure…")}</span>}
          </div>
        )}
      <div className={s.figureTools}>
        <button type="button" className={s.redraw} onClick={onRedraw} aria-label={c("Перерисовать фигуру в полный рост", "Redraw the full figure")}>
          {fullFigure || anchor?.drawing ? c("Перерисовать", "Redraw") : c("Нарисовать в полный рост", "Draw the full figure")}
        </button>
        {anchor?.version && <span className={s.version}>{c(`версия ${anchor.version.index} из ${anchor.version.total}`, `version ${anchor.version.index} of ${anchor.version.total}`)}</span>}
      </div>
    </div>
  );
}

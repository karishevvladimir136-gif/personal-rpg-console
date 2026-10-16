"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Backpack, FlaskConical, KeyRound, Package, Shield, Sword, Target, Wrench, X, type LucideIcon } from "lucide-react";
import type { CampaignSnapshot, Entity, Item } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { characterViewModel } from "@/lib/character-view-model";
import { EQUIPPED_FILTER, inventoryCategoryLabel, inventoryItemLabel } from "@/lib/live-inventory-view";
import { itemRarity } from "@/lib/ui/rarity";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { equipmentOf, heroOf, holdingsNavLabel, holdingsOf, inventoryOf, partyOf, resourcesOf, statLabel } from "@/lib/ui/campaign-view";
import { anchorFor } from "@/lib/visual-frame/pictures";
import { GenerateVisual } from "../visual-frame/generate-visual";
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
} from "./primitives";
import s from "./character.module.css";

type Tab = "char" | "inv" | "spells";

export function RegistryCharacter({ data, play = null, initialTab = "char", preview, legacy }: {
  data: CampaignSnapshot;
  play?: PlaySnapshot | null;
  initialTab?: Tab;
  /** Synthetic previews: a full-length picture for the doll; nothing is sent. */
  preview?: { figure?: string | null };
  /** The earlier record editors, kept reachable below the new sheet. */
  legacy?: React.ReactNode;
}) {
  const c = useCopy();
  const chrome = useChrome();
  const router = useRouter();
  const hero = heroOf(data, play);
  const members = [hero, ...partyOf(data, play).map((row) => row.entity)].filter((row): row is Entity => !!row);
  const [selectedId, setSelectedId] = useState(hero?.id ?? members[0]?.id ?? null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [filter, setFilter] = useState("");
  const [itemId, setItemId] = useState<string | null>(null);
  const [redraw, setRedraw] = useState<{ kind: "entity" | "item"; id: string } | null>(null);
  const [notice, setNotice] = useState("");
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const entity = members.find((row) => row.id === selectedId) ?? members[0] ?? null;
  if (!entity) return <Panel><p className={r.empty}>{c("В кампании пока нет героя.", "This campaign has no hero yet.")}</p></Panel>;
  const model = characterViewModel(data, entity);
  const { resources, money } = resourcesOf(entity);
  const slots = equipmentOf(data, entity);
  const half = Math.min(5, Math.ceil(slots.length / 2));
  const left = slots.slice(0, half), right = slots.slice(half, half * 2), bottom = slots.slice(half * 2);
  const items = inventoryOf(data, entity.id);
  const categories = [...new Set(items.map((item) => item.category))];
  const shown = items.filter((item) =>
    !filter || (filter === EQUIPPED_FILTER ? item.equipped_entity_id === entity.id : item.category === filter));
  const selected = items.find((item) => item.id === itemId) ?? shown[0] ?? null;
  const rarities = items.map((item) => itemRarity(item));
  const tabs = [
    { id: "char" as const, label: c("Персонаж", "Character") },
    { id: "inv" as const, label: c("Инвентарь", "Inventory") },
    ...(model.spells.length ? [{ id: "spells" as const, label: c("Заклинания и умения", "Spells & abilities") }] : []),
  ];
  const links = [
    { id: "journal" as const, label: c("Задания", "Quests") },
    { id: "codex" as const, label: c("Кодекс", "Codex") },
    { id: "holdings" as const, label: holdingsNavLabel(holdingsOf(data), c.language) },
  ];
  const act = (text: string) => {
    if (!chrome?.href) {
      if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode: "game", companionId: null, timeline: data.timeline, text }))
        router.push(href("game"));
      else setNotice(c("Сначала дождись конца текущего хода.", "Wait until the current turn finishes."));
    } else setNotice(c(`Предпросмотр: в поле хода появится «${text}»`, `Preview: the turn box would get “${text}”`));
  };
  const stats = (
    <Panel label={c("Характеристики", "Characteristics")}>
      <div className={r.stack}>
        <div className={r.stack} style={{ gap: 4 }}>
          <h1 className={s.name}>{entity.name}</h1>
          <div className={s.lineRow}>
            <span className={r.muted}>{[model.sheet.role, model.level !== null ? c.t("Level {level}", { level: model.level }) : null, model.sheet.tier].filter(Boolean).join(" · ")}</span>
            {entity.conditions.length > 0 && <span className={r.badgeAmber}>{entity.conditions.join(", ")}</span>}
          </div>
        </div>
        {entity.hp !== null && <Gauge label={c("Хиты", "Hit points")} value={entity.hp} max={entity.max_hp} />}
        {model.derivedStats.length > 0 && (
          <div className={`${r.stats} ${s.stats}`}>
            {model.derivedStats.map(([key, value]) => (
              <div key={key} className={r.stat}><div className={r.statKey}>{c.label(statLabel(key))}</div><div className={r.statMain}>{value}</div></div>
            ))}
          </div>
        )}
        {model.attributes.length > 0 && (
          <div className={`${r.stats} ${s.stats}`}>
            {model.attributes.map(([label, value]) => (
              <div key={label} className={r.stat}><div className={r.statKey}>{c.t(label)}</div><div className={r.statMain}>{value}</div></div>
            ))}
          </div>
        )}
        {(resources.length > 0 || money.length > 0) && (
          <div>
            <span className={r.eyebrow}>{c("Ресурсы", "Resources")}</span>
            {resources.map((resource) => (
              <div key={resource.key} className={r.resRow}>
                <span>{c.label(resource.label)}</span>
                {resource.max ? <Pips left={resource.value} max={resource.max} label={c.label(resource.label)} /> : <span className={r.num}>{resource.value}</span>}
              </div>
            ))}
            {money.map((row) => (
              <div key={row.key} className={r.resRow}><span>{c.label(row.label)}</span><span className={r.num} style={{ color: "var(--brass)" }}>{row.value}</span></div>
            ))}
          </div>
        )}
        {model.skills.length > 0 && (
          <div>
            <span className={r.eyebrow}>{c("Навыки", "Skills")}</span>
            {model.skills.map((line) => {
              const match = /^(.*?)\s*([+−-]\s*\d+)$/u.exec(line.trim());
              return <div key={line} className={s.skill}><span>{match ? match[1] : line}</span>{match && <span>{match[2].replace(/\s/g, "")}</span>}</div>;
            })}
          </div>
        )}
        {model.abilities.length > 0 && (
          <div><span className={r.eyebrow}>{c("Умения", "Abilities")}</span><ul className={s.list}>{model.abilities.map((line) => <li key={line}>{line}</li>)}</ul></div>
        )}
        {model.limitations.length > 0 && (
          <div><span className={r.eyebrow}>{c("Слабости", "Limitations")}</span><ul className={s.list}>{model.limitations.map((line) => <li key={line}>{line}</li>)}</ul></div>
        )}
      </div>
    </Panel>
  );
  const slot = (row: (typeof slots)[number]) => (
    <SlotButton key={row.id} label={row.label} item={row.item} pressed={row.item?.id === selected?.id}
      onPick={() => { if (row.item) { setItemId(row.item.id); setTab((current) => (current === "spells" ? "inv" : current)); } }} />
  );
  const doll = (
    <Panel label={c("Снаряжение", "Equipment")}>
      <div className={s.doll}>
        <div className={s.slots}>{left.map(slot)}</div>
        <Figure entity={entity} figure={entity.id === hero?.id ? preview?.figure ?? null : null}
          onRedraw={() => setRedraw({ kind: "entity", id: entity.id })} />
        <div className={s.slots}>{right.map(slot)}</div>
        {bottom.length > 0 && <div className={s.dollBottom}>{bottom.map(slot)}</div>}
      </div>
      {!slots.length && <p className={r.note}>{c("У этого персонажа нет мест для снаряжения.", "This character has no equipment slots.")}</p>}
    </Panel>
  );
  const inventory = (
    <Panel label={c("Инвентарь", "Inventory")} title={c("Вещи при себе", "Carried")} action={money.length ? <span className={r.num} style={{ color: "var(--brass)" }}>{money.map((row) => `${row.value} ${c.label(row.label)}`).join(" · ")}</span> : undefined}>
      <div className={r.stack}>
        {items.length > 0 && (
          <div className={r.chips} role="group" aria-label={c("Фильтр", "Filter")}>
            <button type="button" className={r.chipButton} aria-pressed={!filter} onClick={() => setFilter("")}>{c("Всё", "All")}</button>
            {items.some((item) => item.equipped_entity_id === entity.id) && (
              <button type="button" className={r.chipButton} aria-pressed={filter === EQUIPPED_FILTER} onClick={() => setFilter(EQUIPPED_FILTER)}>{c.t("Equipped")}</button>
            )}
            {categories.map((category) => (
              <button key={category} type="button" className={r.chipButton} aria-pressed={filter === category} onClick={() => setFilter(category)}>{c.label(inventoryCategoryLabel(category))}</button>
            ))}
          </div>
        )}
        {shown.length ? (
          <div className={r.grid}>
            {shown.map((item) => <ItemCell key={item.id} item={item} pressed={item.id === selected?.id} onPick={() => setItemId(item.id)} />)}
            {Array.from({ length: Math.max(0, 12 - shown.length) }, (_, index) => <span key={`empty-${index}`} className={r.cellEmpty} aria-hidden="true" />)}
          </div>
        ) : <p className={r.empty}>{c("Здесь пока пусто.", "Nothing here yet.")}</p>}
        {rarities.some(Boolean) && <RarityLegend />}
        {selected && (
          <ItemCard item={selected} entity={entity}
            onRedraw={() => setRedraw({ kind: "item", id: selected.id })}
            onUse={() => act(c(`Использую «${selected.name}».`, `I use the ${selected.name}.`))}
            onGive={() => act(c(`Передаю «${selected.name}» `, `I hand the ${selected.name} to `))} />
        )}
        {notice && <p className={r.note} role="status">{notice}</p>}
      </div>
    </Panel>
  );
  const spells = (
    <Panel label={c("Заклинания и умения", "Spells & abilities")} title={c("Заклинания и умения", "Spells & abilities")}>
      <ul className={s.list}>{model.spells.map((line) => <li key={line}>{line}</li>)}</ul>
    </Panel>
  );
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
                onClick={() => { setSelectedId(member.id); setItemId(null); setFilter(""); }}>
                <Art subject={{ kind: "entity", id: member.id }} name={member.name} position="center 25%" drawingLabel="…" />
              </button>
            ))}
          </div>
        )}
      </div>
      {tab === "char" && <div className={s.grid}>{stats}<div className={s.stackCol}>{doll}{inventory}</div></div>}
      {tab === "inv" && <div className={s.gridInventory}>{doll}{inventory}</div>}
      {tab === "spells" && <div className={s.gridInventory}>{spells}{stats}</div>}
      {redraw && (
        <>
          <button type="button" className={r.drawerScrim} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)} />
          <aside className={r.drawer} role="dialog" aria-modal="true" aria-label={c("Перерисовать", "Redraw")}>
            <div className={r.panelHead}>
              <h2 className={r.h2}>{c("Перерисовать", "Redraw")}</h2>
              <button type="button" className={r.iconBtn} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)}><X size={20} aria-hidden="true" /></button>
            </div>
            <p className={r.note}>{c("Старая картинка остаётся на месте, пока новая не готова и не принята. Прошлые версии сохраняются.", "The previous picture stays until the new one is ready and accepted. Earlier versions are kept.")}</p>
            <GenerateVisual subject={redraw} reviewOnly={!!chrome?.href} compactDetails />
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

function SlotButton({ label, item, pressed, onPick }: { label: string; item: Item | null; pressed: boolean; onPick: () => void }) {
  const c = useCopy();
  return (
    <button type="button" className={item ? s.slot : s.slotEmpty} aria-pressed={pressed} disabled={!item} onClick={onPick}>
      <span className={s.slotIcon}>{item ? <Art subject={{ kind: "item", id: item.id }} name={item.name} /> : <Package size={18} aria-hidden="true" />}</span>
      <span>
        <span className={s.slotLabel}>{label}</span>
        <span className={s.slotName}>{item ? inventoryItemLabel(item.name) : c("пусто", "empty")}</span>
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

/** A glyph for the common category words records use; anything else gets the generic box. */
const CATEGORY_GLYPHS: Record<string, LucideIcon> = {
  weapon: Sword, armour: Shield, consumable: FlaskConical, tool: Wrench, ammunition: Target, key: KeyRound, gear: Backpack, other: Package,
};
const CATEGORY_WORDS: [RegExp, keyof typeof CATEGORY_GLYPHS][] = [
  [/weapon|blade|firearm|gun/i, "weapon"],
  [/armou?r|shield|cloth|wear/i, "armour"],
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
    <button type="button" className={`${r.cell} ${rarity ? rarityClass[rarity] : ""}`} aria-pressed={pressed} aria-label={item.name} title={item.name} onClick={onPick}>
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

export function ItemCard({ item, entity, onRedraw, onUse, onGive }: { item: Item; entity: Entity | null; onRedraw: () => void; onUse: () => void; onGive: () => void }) {
  const c = useCopy();
  const image = useSubjectImage({ kind: "item", id: item.id });
  return (
    <div className={r.parchment}>
      <div className={s.card}>
        <div className={s.cardArt}><Art subject={{ kind: "item", id: item.id }} name={item.name} drawingLabel={c("рисуется…", "drawing…")} /></div>
        <button type="button" className={r.btnGhost} onClick={onRedraw}>{image.url ? c("Перерисовать", "Redraw") : c("Нарисовать", "Draw")}</button>
      </div>
      <div className={s.card}>
        <span className={r.eyebrow}>{[c.label(inventoryCategoryLabel(item.category)), item.quantity > 1 ? c(`${item.quantity} шт.`, `×${item.quantity}`) : null,
          entity && item.equipped_entity_id === entity.id ? c.t("Equipped") : null].filter(Boolean).join(" · ")}</span>
        <span className={r.parchmentTitle}>{inventoryItemLabel(item.name)}</span>
        {item.description && <span className={r.parchmentText}>{item.description}</span>}
        {item.mechanics && <span className={r.parchmentText} style={{ fontStyle: "italic" }}>{item.mechanics}</span>}
        <div className={r.row}>
          <button type="button" className={r.btnGhost} onClick={onUse}>{c("Использовать", "Use")}</button>
          <button type="button" className={r.btnGhost} onClick={onGive}>{c("Передать…", "Give…")}</button>
        </div>
      </div>
    </div>
  );
}

"use client";
// Fix run after session 2, stage F (items 19, 20): the hero the DM built, shown as a readable sheet the owner changes
// in place — scores with their modifiers, level, HP, AC, saves, skills, attacks, features, spells, every thing with
// its kind, slot, damage and bonuses (the first line of its description under its name), counters with their names,
// the wallet. Nothing is saved per field: «Изменения применятся при создании».
import { useState } from "react";
import type { BootstrapQuestion } from "../../lib/adventures/bootstrap-contracts";
import {
  abilityLabel, abilityModifier, heroAbilities, heroLimits, signed, slotsForKind, walletCodes,
  type HeroCoin, type HeroCounter, type HeroItem, type HeroReview,
} from "../../lib/adventures/hero-draft";
import { ITEM_KINDS, kindLabel, universalSlots, type SpellRecord } from "../../lib/inventory/model";
import r from "../registry/registry.module.css";
import w from "./wizard.module.css";

type Lang = "en" | "ru";
const rowsFor = (value: string, min = 2) => Math.min(24, Math.max(min, value.split("\n").reduce((sum, line) => sum + 1 + Math.floor(line.length / 70), 0)));

function Lines({ label, value, onChange, hint }: { label: string; value: string[] | undefined; onChange: (lines: string[]) => void; hint?: string }) {
  const text = (value ?? []).join("\n");
  return (
    <label className={w.field}>
      <span>{label}</span>
      <textarea rows={rowsFor(text)} value={text} onChange={(event) => onChange(event.target.value.split("\n"))} placeholder={hint} />
    </label>
  );
}
function Num({ label, value, min, max, onChange }: { label: string; value: number | null | undefined; min: number; max: number; onChange: (value: number | null) => void }) {
  return (
    <label className={w.field}>
      <span>{label}</span>
      <input type="number" inputMode="numeric" min={min} max={max} value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} />
    </label>
  );
}

const firstLine = (text: string) => text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";

function ItemRow({ item, language, humanoid, open, onOpen, onChange, onRemove }: {
  item: HeroItem; language: Lang; humanoid: boolean; open: boolean; onOpen: () => void; onChange: (item: HeroItem) => void; onRemove: () => void;
}) {
  const ru = language === "ru";
  const slots = universalSlots(language);
  const fitting = slotsForKind(item.kind);
  const slotLabel = item.slot ? slots.find((slot) => slot.id === item.slot)?.label ?? item.slot : null;
  const bonuses = (item.detail.bonuses ?? []).map((bonus) => `${bonus.to} ${bonus.value >= 0 ? "+" : ""}${bonus.value}`).join("\n");
  const readBonuses = (text: string) => text.split("\n").map((line) => /^(.*?)[\s:]*([+−-]\s*\d{1,2})\s*$/u.exec(line.trim())).filter(Boolean)
    .map((m) => ({ to: m![1].trim().slice(0, 60), value: Number(m![2].replace(/\s/g, "").replace("−", "-")) }))
    .filter((bonus) => bonus.to && Number.isInteger(bonus.value) && bonus.value !== 0 && Math.abs(bonus.value) <= 20).slice(0, heroLimits.bonuses);
  const [bonusText, setBonusText] = useState(bonuses);
  const detail = (patch: Partial<HeroItem["detail"]>) => {
    const next = { ...item.detail, ...patch };
    for (const key of Object.keys(next) as (keyof typeof next)[]) if (next[key] === undefined) delete next[key];
    onChange({ ...item, detail: next });
  };
  return (
    <div className={w.item}>
      <button type="button" className={w.itemHead} aria-expanded={open} onClick={onOpen}>
        <span className={w.itemName}>{item.name || (ru ? "Без названия" : "Unnamed")}</span>
        {item.quantity > 1 && <span className={r.num}>×{item.quantity}</span>}
        <span className={w.chip}>{kindLabel(item.kind, language)}</span>
        {slotLabel && <span className={`${w.chip} ${w.chipWorn}`}>{ru ? "надето" : "worn"} · {slotLabel}</span>}
        {item.mechanics && <span className={w.chip}>{item.mechanics}</span>}
        {(item.detail.bonuses ?? []).map((bonus) => <span key={`${bonus.to}${bonus.value}`} className={w.chip}>{bonus.value >= 0 ? "+" : ""}{bonus.value} {bonus.to}</span>)}
        {item.detail.attunement && <span className={w.chip}>{ru ? "настройка" : "attunement"}</span>}
        {firstLine(item.description) && <span className={w.itemFirst}>{firstLine(item.description)}</span>}
      </button>
      {open && (
        <div className={w.stack}>
          <div className={w.grid3}>
            <label className={w.field}><span>{ru ? "Название" : "Name"}</span>
              <input maxLength={200} value={item.name} onChange={(event) => onChange({ ...item, name: event.target.value })} /></label>
            <Num label={ru ? "Количество" : "Quantity"} value={item.quantity} min={1} max={heroLimits.quantity}
              onChange={(quantity) => onChange({ ...item, quantity: quantity ?? 1, slot: (quantity ?? 1) === 1 ? item.slot : null })} />
            <label className={w.field}><span>{ru ? "Вид" : "Kind"}</span>
              <select value={item.kind} onChange={(event) => {
                const kind = event.target.value as HeroItem["kind"];
                onChange({ ...item, kind, slot: item.slot && slotsForKind(kind).includes(item.slot) ? item.slot : null });
              }}>{ITEM_KINDS.map((kind) => <option key={kind} value={kind}>{kindLabel(kind, language)}</option>)}</select></label>
          </div>
          <div className={w.grid3}>
            <label className={w.field}><span>{ru ? "Слот на кукле" : "Slot on the doll"}</span>
              <select value={item.slot ?? ""} disabled={!humanoid || item.quantity !== 1}
                onChange={(event) => onChange({ ...item, slot: (event.target.value || null) as HeroItem["slot"] })}>
                <option value="">{ru ? "Не надето (в сумке)" : "Not worn (in the pack)"}</option>
                {fitting.map((id) => <option key={id} value={id}>{slots.find((slot) => slot.id === id)?.label ?? id}</option>)}
              </select></label>
            <label className={w.field}><span>{ru ? "Урон и свойства" : "Damage and properties"}</span>
              <input maxLength={heroLimits.itemMechanics} value={item.mechanics} placeholder={ru ? "1d6 дробящий; универсальное (1d8)" : "1d6 bludgeoning; versatile (1d8)"}
                onChange={(event) => onChange({ ...item, mechanics: event.target.value })} /></label>
            <label className={w.field}><span>{ru ? "Бонусы · по одному в строке" : "Bonuses · one per line"}</span>
              <textarea rows={Math.max(2, bonusText.split("\n").length)} value={bonusText} placeholder={ru ? "КД +1\nспасброски +1" : "AC +1\nsaves +1"}
                onChange={(event) => { setBonusText(event.target.value); const parsed = readBonuses(event.target.value); detail({ bonuses: parsed.length ? parsed : undefined }); }} /></label>
          </div>
          <div className={w.row}>
            <label className={w.check}><input type="checkbox" checked={item.detail.hands === 2} onChange={(event) => detail({ hands: event.target.checked ? 2 : undefined })} />{ru ? "двуручное" : "two-handed"}</label>
            <label className={w.check}><input type="checkbox" checked={!!item.detail.attunement} onChange={(event) => detail({ attunement: event.target.checked ? true : undefined })} />{ru ? "нужна настройка" : "requires attunement"}</label>
            <label className={w.check}>{ru ? "Заряды" : "Charges"}
              <input className={w.input} style={{ width: 80 }} type="number" min={0} max={1000} value={item.detail.charges?.max ?? ""}
                onChange={(event) => { const max = event.target.value === "" ? null : Number(event.target.value); detail({ charges: max && max > 0 ? { value: Math.min(item.detail.charges?.value ?? max, max), max } : undefined }); }} /></label>
          </div>
          <label className={w.field}><span>{ru ? "Описание" : "Description"}</span>
            <textarea rows={rowsFor(item.description, 3)} maxLength={heroLimits.itemDescription} value={item.description} onChange={(event) => onChange({ ...item, description: event.target.value })} /></label>
          <div className={w.row}><button type="button" className={r.btnGhost} onClick={onRemove}>{ru ? "Убрать вещь" : "Remove"}</button></div>
        </div>
      )}
    </div>
  );
}

function SpellRow({ spell, language, onChange, onRemove }: { spell: SpellRecord; language: Lang; onChange: (spell: SpellRecord) => void; onRemove: () => void }) {
  const ru = language === "ru";
  const [open, setOpen] = useState(false);
  return (
    <div className={w.item}>
      <div className={w.spell}>
        <label className={w.check} title={ru ? "Подготовлено" : "Prepared"}>
          <input type="checkbox" checked={!!spell.prepared} onChange={(event) => onChange({ ...spell, prepared: event.target.checked })} aria-label={ru ? "Подготовлено" : "Prepared"} />
        </label>
        <input className={w.input} maxLength={120} value={spell.name} aria-label={ru ? "Заклинание" : "Spell"} onChange={(event) => onChange({ ...spell, name: event.target.value })} />
        <select className={w.input} value={spell.level} aria-label={ru ? "Круг" : "Level"} onChange={(event) => onChange({ ...spell, level: Number(event.target.value) })}>
          {Array.from({ length: 10 }, (_, level) => <option key={level} value={level}>{level === 0 ? (ru ? "заговор" : "cantrip") : ru ? `${level} круг` : `level ${level}`}</option>)}
        </select>
        <div className={w.row}>
          <button type="button" className={w.link} onClick={() => setOpen((value) => !value)}>{open ? (ru ? "свернуть" : "fold") : (ru ? "подробнее" : "details")}</button>
          <button type="button" className={w.link} onClick={onRemove}>{ru ? "убрать" : "remove"}</button>
        </div>
      </div>
      {!open && (spell.damage || spell.range || spell.text) && <span className={w.itemFirst}>{[spell.castingTime, spell.range, spell.damage, firstLine(spell.text ?? "")].filter(Boolean).join(" · ")}</span>}
      {open && (
        <div className={w.grid3}>
          {([["castingTime", ru ? "Время накладывания" : "Casting time"], ["range", ru ? "Дистанция" : "Range"], ["components", ru ? "Компоненты" : "Components"],
            ["duration", ru ? "Длительность" : "Duration"], ["saveOrAttack", ru ? "Спасбросок / атака" : "Save / attack"], ["damage", ru ? "Урон" : "Damage"]] as const).map(([key, label]) => (
            <label key={key} className={w.field}><span>{label}</span>
              <input maxLength={160} value={spell[key] ?? ""} onChange={(event) => onChange({ ...spell, [key]: event.target.value || undefined })} /></label>
          ))}
          <label className={w.field} style={{ gridColumn: "1 / -1" }}><span>{ru ? "Что делает" : "What it does"}</span>
            <textarea rows={rowsFor(spell.text ?? "", 3)} maxLength={2400} value={spell.text ?? ""} onChange={(event) => onChange({ ...spell, text: event.target.value || undefined })} /></label>
        </div>
      )}
    </div>
  );
}

export function HeroSheetReview({ value, onChange, language, questions, notes, initialOpen = null }: {
  value: HeroReview; onChange: (value: HeroReview) => void; language: Lang; questions: BootstrapQuestion[]; notes: string[]; initialOpen?: number | null;
}) {
  const ru = language === "ru";
  const sheet = value.sheet;
  const [open, setOpen] = useState<number | null>(initialOpen);
  const set = (patch: Partial<HeroReview["sheet"]>) => onChange({ ...value, sheet: { ...sheet, ...patch } });
  const humanoid = value.equipmentProfile === "standard_humanoid";
  const structured = sheet.mode === "structured_rpg";
  const attributes = sheet.attributes ?? null;
  const spells = sheet.spells ?? [];
  const items = value.possessions;
  const setItems = (next: HeroItem[]) => onChange({ ...value, possessions: next });
  const setCounters = (next: HeroCounter[]) => onChange({ ...value, counters: next });
  const setWallet = (next: HeroCoin[]) => onChange({ ...value, wallet: next });
  const coins = walletCodes(language);
  const coin = (code: string) => value.wallet.find((row) => row.code === code)?.amount ?? null;
  const setCoin = (code: string, amount: number | null) => setWallet(amount === null || amount <= 0
    ? value.wallet.filter((row) => row.code !== code)
    : value.wallet.some((row) => row.code === code) ? value.wallet.map((row) => (row.code === code ? { ...row, amount } : row)) : [...value.wallet, { code, amount }]);
  const otherCoins = value.wallet.filter((row) => !coins.some((known) => known.code === row.code));
  return (
    <div className={w.stack}>
      {notes.length > 0 && (
        <div className={w.warn} role="status">
          <b>{ru ? "Что ведущий поправил или не смог сохранить:" : "What the DM corrected or could not keep:"}</b>
          <ul className={w.notes}>{notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </div>
      )}
      <section className={w.box} aria-label={ru ? "Лист героя" : "Hero sheet"}>
        <div className={w.sheetHead}>
          <label className={w.field}><span>{ru ? "Имя" : "Name"}</span>
            <input maxLength={200} value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /></label>
          <label className={w.field}><span>{ru ? "Класс, роль" : "Class, role"}</span>
            <input maxLength={120} value={sheet.role ?? ""} onChange={(event) => set({ role: event.target.value || null })} /></label>
          <Num label={ru ? "Уровень" : "Level"} value={sheet.level ?? null} min={0} max={30} onChange={(level) => set({ level })} />
        </div>
        {structured && (
          <div className={w.abilities} aria-label={ru ? "Характеристики" : "Ability scores"}>
            {heroAbilities.map((ability) => {
              const score = attributes?.[ability] ?? 10;
              return (
                <label key={ability} className={w.ability}>
                  <span>{abilityLabel(ability, language)}</span>
                  <input type="number" inputMode="numeric" min={1} max={30} value={score}
                    onChange={(event) => set({ attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, ...(attributes ?? {}), [ability]: Number(event.target.value) || 1 } })} />
                  <b>{signed(abilityModifier(score))}</b>
                </label>
              );
            })}
          </div>
        )}
        {structured && (
          <div className={w.vitals}>
            <Num label={ru ? "Хиты (максимум)" : "HP (max)"} value={value.mechanics?.hp ?? null} min={1} max={10000}
              onChange={(hp) => onChange({ ...value, mechanics: { ...(value.mechanics ?? { hp: 10, attack: 0, defense: 10, skill: 0, weaponName: null, weaponDamage: null }), hp: hp ?? 1 } })} />
            <Num label={ru ? "Класс доспеха" : "Armour class"} value={sheet.armorClass ?? null} min={1} max={40} onChange={(armorClass) => set({ armorClass })} />
            <label className={w.field}><span>{ru ? "Скорость" : "Speed"}</span>
              <input maxLength={80} value={sheet.speed ?? ""} onChange={(event) => set({ speed: event.target.value || null })} /></label>
            <Num label={ru ? "Подготовлено максимум" : "Prepared at most"} value={sheet.preparedMax ?? null} min={0} max={60} onChange={(preparedMax) => set({ preparedMax })} />
          </div>
        )}
        <div className={w.grid2}>
          <Lines label={ru ? "Спасброски · по одному в строке" : "Saves · one per line"} value={sheet.saves} onChange={(saves) => set({ saves })} hint={ru ? "Спасбросок Интеллекта +9" : "Intelligence save +9"} />
          <Lines label={ru ? "Навыки · по одному в строке" : "Skills · one per line"} value={sheet.skills} onChange={(skills) => set({ skills })} hint={ru ? "Магия +9" : "Arcana +9"} />
          <Lines label={ru ? "Атаки" : "Attacks"} value={sheet.attacks} onChange={(attacks) => set({ attacks })} hint={ru ? "Боевой посох: +3, 1d6 дробящий" : "Quarterstaff: +3, 1d6 bludgeoning"} />
          <Lines label={ru ? "Умения и черты" : "Features and traits"} value={sheet.abilities} onChange={(abilities) => set({ abilities })} />
          <Lines label={ru ? "Ограничения" : "Limitations"} value={sheet.limitations} onChange={(limitations) => set({ limitations })} />
          <label className={w.field}><span>{ru ? "Кто он" : "Who the hero is"}</span>
            <textarea rows={rowsFor(sheet.background ?? "", 3)} maxLength={2000} value={sheet.background ?? ""} onChange={(event) => set({ background: event.target.value })} /></label>
        </div>
        <label className={w.check}>
          <input type="checkbox" checked={humanoid} onChange={(event) => onChange({ ...value, equipmentProfile: event.target.checked ? "standard_humanoid" : "none",
            possessions: event.target.checked ? value.possessions : value.possessions.map((item) => ({ ...item, slot: null })) })} />
          {ru ? "Обычное тело: вещи надеваются на куклу (голова, руки, кольца…)" : "An ordinary body: things are worn on the doll (head, hands, rings…)"}
        </label>
      </section>

      {structured && (
        <section className={w.box} aria-label={ru ? "Заклинания" : "Spells"}>
          <div className={w.boxHead}><h3 className={w.boxTitle}>{ru ? "Заклинания" : "Spells"}</h3><span className={w.help}>{ru ? `${spells.length} · галочка — подготовлено` : `${spells.length} · tick — prepared`}</span></div>
          {[...spells].map((spell, index) => ({ spell, index })).sort((a, b) => a.spell.level - b.spell.level).map(({ spell, index }) => (
            <SpellRow key={index} spell={spell} language={language}
              onChange={(next) => set({ spells: spells.map((row, j) => (j === index ? next : row)) })}
              onRemove={() => set({ spells: spells.filter((_, j) => j !== index) })} />
          ))}
          <div className={w.row}><button type="button" className={r.btnGhost} disabled={spells.length >= heroLimits.spells}
            onClick={() => set({ spells: [...spells, { name: "", level: 1, prepared: true }] })}>{ru ? "Добавить заклинание" : "Add a spell"}</button></div>
        </section>
      )}

      <section className={w.box} aria-label={ru ? "Вещи" : "Things"}>
        <div className={w.boxHead}><h3 className={w.boxTitle}>{ru ? "Вещи" : "Things"}</h3>
          <span className={w.help}>{ru ? `${items.length} из ${heroLimits.items} · нажми на вещь, чтобы поправить` : `${items.length} of ${heroLimits.items} · click a thing to edit it`}</span></div>
        {items.length === 0 && <p className={w.help}>{ru ? "Вещей нет." : "No things."}</p>}
        {items.map((item, index) => (
          <ItemRow key={index} item={item} language={language} humanoid={humanoid} open={open === index} onOpen={() => setOpen(open === index ? null : index)}
            onChange={(next) => setItems(items.map((row, j) => (j === index ? next : row)))}
            onRemove={() => { setItems(items.filter((_, j) => j !== index)); setOpen(null); }} />
        ))}
        <div className={w.row}>
          <button type="button" className={r.btnGhost} disabled={items.length >= heroLimits.items}
            onClick={() => { setItems([...items, { name: "", description: "", quantity: 1, kind: "gear", slot: null, mechanics: "", detail: {} }]); setOpen(items.length); }}>
            {ru ? "Добавить вещь" : "Add a thing"}</button>
          {items.length >= heroLimits.items && <span className={w.help}>{ru ? `Больше ${heroLimits.items} вещей при создании не записать — остальное ведущий добавит в игре.` : `At most ${heroLimits.items} things at creation — the DM adds the rest in play.`}</span>}
        </div>
      </section>

      <section className={w.box} aria-label={ru ? "Деньги и счётчики" : "Money and counters"}>
        <div className={w.boxHead}><h3 className={w.boxTitle}>{ru ? "Кошелёк" : "Purse"}</h3><span className={w.help}>{ru ? "Деньги — это кошелёк, не счётчик." : "Money is the purse, not a counter."}</span></div>
        <div className={w.coins}>
          {coins.map((row) => <Num key={row.code} label={`${row.code} · ${row.name}`} value={coin(row.code)} min={0} max={heroLimits.amount} onChange={(amount) => setCoin(row.code, amount)} />)}
        </div>
        {otherCoins.map((row) => <Num key={row.code} label={row.code} value={row.amount} min={0} max={heroLimits.amount} onChange={(amount) => setCoin(row.code, amount)} />)}
        <div className={w.boxHead}><h3 className={w.boxTitle}>{ru ? "Счётчики" : "Counters"}</h3><span className={w.help}>{ru ? "Ячейки заклинаний, кости хитов, умения с зарядами: сейчас / максимум." : "Spell slots, hit dice, charged features: now / max."}</span></div>
        {value.counters.map((counter, index) => (
          <div key={index} className={w.counter}>
            <label className={w.field}><span>{ru ? "Название" : "Name"}</span>
              <input maxLength={100} value={counter.label} onChange={(event) => setCounters(value.counters.map((row, j) => (j === index ? { ...row, label: event.target.value } : row)))} /></label>
            <Num label={ru ? "Сейчас" : "Now"} value={counter.value} min={0} max={heroLimits.amount} onChange={(next) => setCounters(value.counters.map((row, j) => (j === index ? { ...row, value: next ?? 0 } : row)))} />
            <Num label={ru ? "Максимум" : "Max"} value={counter.max} min={0} max={heroLimits.amount} onChange={(next) => setCounters(value.counters.map((row, j) => (j === index ? { ...row, max: next } : row)))} />
            <button type="button" className={w.link} onClick={() => setCounters(value.counters.filter((_, j) => j !== index))}>{ru ? "убрать" : "remove"}</button>
          </div>
        ))}
        <div className={w.row}><button type="button" className={r.btnGhost} disabled={value.counters.length >= heroLimits.counters}
          onClick={() => setCounters([...value.counters, { key: "", label: "", value: 1, max: 1 }])}>{ru ? "Добавить счётчик" : "Add a counter"}</button></div>
      </section>

      {questions.length > 0 && (
        <section className={w.box} aria-label={ru ? "Вопросы ведущего" : "The DM's questions"}>
          <div className={w.boxHead}><h3 className={w.boxTitle}>{ru ? "Ведущий спрашивает" : "The DM asks"}</h3><span className={w.help}>{ru ? "По желанию — ответ ведущий запомнит; без ответа тоже можно начинать." : "Optional — the DM keeps your answer; you can start without one."}</span></div>
          {questions.map((question, index) => (
            <label key={index} className={w.field}><span>{question.question}</span>
              <textarea rows={2} maxLength={2000} value={value.answers[index] ?? ""}
                onChange={(event) => onChange({ ...value, answers: value.answers.map((answer, j) => (j === index ? event.target.value || null : answer)) })} /></label>
          ))}
        </section>
      )}
      <p className={w.applied} role="note">{ru ? "Изменения применятся при создании — отдельно сохранять ничего не нужно." : "Changes apply on creation — nothing needs saving separately."}</p>
    </div>
  );
}

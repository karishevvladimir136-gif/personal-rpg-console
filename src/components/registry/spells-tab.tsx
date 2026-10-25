"use client";

// Fix S3-accept В1 (docs/stages/FIX_S3_ACCEPT.md «В — spells as items»; the owner: «каждое заклинание — как предмет с
// описанием», «и кантрипы и по школам магии»): the spells tab. Each spell is a tile like a thing — its picture, or its
// school's sigil until one is drawn — with a card: school and level, casting time, range, components, duration, the
// text, higher levels, its history, «Колдовать» with the slot, «Подготовить». Three sections: «Заговоры», «Подготовлено
// сегодня» (the slot pips per level stay; a spent slot is dim), «Книга заклинаний» (everything written in the book, a
// toggle each); a school filter on top. The «Умения» prose of a sheet turns into records once, as the owner's sheet
// correction (src/lib/inventory/spell-records.ts says why there and not in SQL).
import { useEffect, useRef, useState } from "react";
import { Atom, BookOpen, Check, Eye, Flame, Ghost, HeartHandshake, Orbit, RefreshCw, Shield, Skull, Sparkles, WandSparkles, type LucideIcon } from "lucide-react";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { isUnresolved } from "@/lib/gameplay/client-state";
import type { SheetView } from "@/lib/ui/campaign-view";
import { castLine, counterLabel, spellBook, type SpellRecord } from "@/lib/inventory/model";
import { castSlot, concentrationOf, planSheet, type MoveContext, type MovePlan } from "@/lib/inventory/owner-moves";
import { conversionPatch, schoolKey, spellTabView, type SchoolKey, type SpellGroup } from "@/lib/inventory/spell-records";
import { usd } from "@/lib/visual-frame/fal-image";
import { anchorFor, capRemaining, pictureCostUsdMicros } from "@/lib/visual-frame/pictures";
import { usePictures } from "./live-frames";
import { Panel, Pips, registry as r, useCopy } from "./primitives";
import s from "./spells.module.css";

const SIGILS: Record<SchoolKey, LucideIcon> = {
  abjuration: Shield, conjuration: Orbit, divination: Eye, enchantment: HeartHandshake, evocation: Flame, illusion: Ghost, necromancy: Skull, transmutation: Atom,
};
/** A school's sigil (the plain wand for a word the 5e list does not know). */
export function SpellSigil({ school, size = 40 }: { school?: string; size?: number }) {
  const key = schoolKey(school);
  const Glyph = key ? SIGILS[key] : WandSparkles;
  return <Glyph size={size} strokeWidth={1.4} className={s.sigil} aria-hidden="true" />;
}

/** The spell's drawn picture (a spell's anchor, like a thing's), else its sigil; whether one is being drawn. */
function useSpellPicture(spell: SpellRecord) {
  const pictures = usePictures();
  if (!pictures || !spell.id) return { url: null, drawing: false, version: null, pictures };
  const anchor = anchorFor(pictures.board, { kind: "spell", id: spell.id }, "spell");
  return { url: anchor.picture ? pictures.urlFor(anchor.picture) : null, drawing: anchor.drawing, version: anchor.version, pictures };
}
function SpellArt({ spell, size }: { spell: SpellRecord; size: number }) {
  const c = useCopy();
  const image = useSpellPicture(spell);
  const [broken, setBroken] = useState<string | null>(null);
  // Accepted, short-lived authenticated URLs; next/image cannot proxy them.
  // eslint-disable-next-line @next/next/no-img-element
  if (image.url && broken !== image.url) return <img src={image.url} alt={spell.name} onError={() => setBroken(image.url)} />;
  return (
    <span role="img" aria-label={image.drawing ? c(`${spell.name}: рисуется`, `${spell.name}: drawing`) : spell.name} style={{ opacity: image.drawing ? 0.55 : 1 }}>
      <SpellSigil school={spell.school} size={size} />
    </span>
  );
}

/** Fix S3-accept В1: the one-time turn of the «Умения» prose into spell records — once per person and page, as the
 * owner's sheet correction, never while a turn is running (its commit would meet a newer record) and never twice. */
export function useSpellConversion({ view, people, play, preview, busy, ctx, run }: {
  view: CampaignSnapshot; people: Entity[]; play: PlaySnapshot | null; preview: boolean; busy: boolean; ctx: MoveContext;
  run: (plan: MovePlan) => Promise<boolean>;
}) {
  const tried = useRef(new Set<string>());
  const language = view.campaign.language;
  const running = !!play?.turns.some(isUnresolved);
  const waiting = preview || busy || running ? "" : people.filter((person) => conversionPatch(person.character_sheet, language)).map((person) => person.id).join(",");
  useEffect(() => {
    const next = waiting ? people.find((person) => waiting.split(",").includes(person.id) && !tried.current.has(person.id)) ?? null : null;
    if (!next) return;
    tried.current.add(next.id);
    const patch = conversionPatch(next.character_sheet, language);
    if (!patch) return;
    const plan = planSheet(view, next.id, patch, ctx);
    const ru = language === "ru";
    // After this render (the owner-move runner sets its status): never a synchronous set in an effect.
    queueMicrotask(() => void run(plan.ok ? { ...plan, note: ru ? `${next.name}: заклинания из «Умений» стали карточками (${patch.spells.length}).`
      : `${next.name}: the spells in «Abilities» became cards (${patch.spells.length}).` } : plan));
  }, [waiting, people, view, language, ctx, run]);
}

export function SpellsTab({ entity, sheet, onCast, onPrepare }: {
  entity: Entity; sheet: SheetView; onCast: (text: string) => void; onPrepare: (spell: SpellRecord, prepared: boolean) => void;
}) {
  const c = useCopy();
  const pending = !!conversionPatch(entity.character_sheet, c.language);
  const [school, setSchool] = useState<string | null>(null);
  const view = spellTabView(sheet.spells, entity.resources, sheet.preparedMax, c.language, school);
  const book = spellBook(sheet.spells, entity.resources, c.language);
  const castable = (spell: SpellRecord) => spell.level === 0 || !view.preparing || spell.prepared === true;
  const focus = concentrationOf(entity);
  const [name, setName] = useState<string | null>(sheet.spells.find((spell) => spell.name === focus)?.name ?? sheet.spells.find((spell) => spell.level > 0 && castable(spell))?.name ?? sheet.spells[0]?.name ?? null);
  const chosen = sheet.spells.find((spell) => spell.name === name) ?? null;
  const max = view.preparedMax;
  const tile = (spell: SpellRecord, toggle: boolean) => (
    <div key={spell.name} className={s.tileWrap}>
      <button type="button" className={s.tile} aria-pressed={spell.name === chosen?.name} data-off={view.preparing && spell.level > 0 && !spell.prepared ? "true" : undefined}
        title={[spell.name, spell.school].filter(Boolean).join(" · ")} onClick={() => setName(spell.name)}>
        <span className={s.tileArt}><SpellArt spell={spell} size={44} /></span>
        <span className={s.tileName}>{spell.name}</span>
        <span className={s.marks}>
          {spell.ritual && <abbr title={c("ритуал", "ritual")}>{c("Р", "R")}</abbr>}
          {spell.concentration && <abbr title={c("концентрация", "concentration")}>{c("К", "C")}</abbr>}
        </span>
        {spell.name === focus && <span className={`${r.badgeAmber} ${s.now}`}>{c("сейчас", "now")}</span>}
      </button>
      {toggle && (
        <button type="button" className={s.toggle} aria-pressed={spell.prepared === true} onClick={() => onPrepare(spell, !spell.prepared)}
          aria-label={spell.prepared ? c(`${spell.name}: убрать из подготовленных`, `${spell.name}: unprepare`) : c(`${spell.name}: подготовить на сегодня`, `${spell.name}: prepare for today`)}>
          {spell.prepared ? <><Check size={14} aria-hidden="true" />{c("сегодня", "today")}</> : c("подготовить", "prepare")}
        </button>
      )}
    </div>
  );
  const level = (group: SpellGroup, toggles: boolean, empty: string) => (
    <div key={group.level} className={s.level} aria-label={group.label}>
      <div className={s.levelHead}>
        <b>{group.label}</b>
        {group.slots && <Pips left={group.slots.value} max={group.slots.max} label={counterLabel(entity, group.slotKey, c.language)} />}
        {group.slots && <span className={r.small}>{c(`${group.slots.value} из ${group.slots.max}`, `${group.slots.value} of ${group.slots.max}`)}</span>}
      </div>
      {group.spells.length ? <div className={s.tiles}>{group.spells.map((spell) => tile(spell, toggles))}</div> : <p className={`${r.small} ${r.muted}`} style={{ margin: 0 }}>{empty}</p>}
    </div>
  );
  const nothing = !sheet.spells.length && !sheet.spellLines.length;
  return (
    <div className={s.page}>
      <Panel title={c("Заклинания", "Spells")} eyebrow={entity.name}
        action={view.preparing ? <span className={r.num}>{c(`подготовлено ${view.preparedCount}${max !== null ? ` из ${max}` : ""}`, `prepared ${view.preparedCount}${max !== null ? ` of ${max}` : ""}`)}</span> : undefined}>
        <div className={r.stack}>
          {focus && <p className={s.focus}>{c("Концентрация", "Concentration")}: <b>{focus}</b></p>}
          {pending && <p className={r.note} role="status">{c("Заклинания из «Умений» станут карточками, как только закончится ход.", "The spells in «Abilities» become cards as soon as the turn ends.")}</p>}
          {view.slots.length > 0 && (
            <div className={s.slots} aria-label={c("Слоты заклинаний", "Spell slots")}>
              {view.slots.map((group) => group.slots && (
                <span key={group.level} className={s.slot}><b>{group.label}</b><Pips left={group.slots.value} max={group.slots.max} label={counterLabel(entity, group.slotKey, c.language)} /></span>
              ))}
            </div>
          )}
          {view.schools.length > 1 && (
            <div className={s.schools} role="group" aria-label={c("Школа магии", "School of magic")}>
              <button type="button" className={r.chipButton} aria-pressed={!school} onClick={() => setSchool(null)}>{c("Все школы", "All schools")}</button>
              {view.schools.map((row) => (
                <button key={row.word} type="button" className={r.chipButton} aria-pressed={school === row.word} onClick={() => setSchool(school === row.word ? null : row.word)}>
                  <SpellSigil school={row.word} size={15} />{row.word} <span className={r.muted}>{row.count}</span>
                </button>
              ))}
            </div>
          )}
          {(view.cantrips.length > 0 || !school) && sheet.spells.some((spell) => spell.level === 0) && (
            <section className={s.section} aria-label={c("Заговоры", "Cantrips")}>
              <div className={s.sectionHead}><span className={s.sectionName}><Sparkles size={18} aria-hidden="true" />{c("Заговоры", "Cantrips")}</span>
                <span className={`${r.small} ${r.muted}`}>{c("без ячеек, сколько угодно", "no slots, at will")}</span></div>
              {view.cantrips.length ? <div className={s.tiles}>{view.cantrips.map((spell) => tile(spell, false))}</div>
                : <p className={`${r.small} ${r.muted}`} style={{ margin: 0 }}>{c("Заговоров этой школы нет.", "No cantrips of this school.")}</p>}
            </section>
          )}
          {view.preparing && (
            <section className={s.section} aria-label={c("Подготовлено сегодня", "Prepared today")}>
              <div className={s.sectionHead}><span className={s.sectionName}><Check size={18} aria-hidden="true" />{c("Подготовлено сегодня", "Prepared today")}</span>
                {max !== null && view.preparedCount > max && <span className={r.badgeAmber}>{c(`больше, чем позволяет лист (${max})`, `more than the sheet allows (${max})`)}</span>}</div>
              {view.prepared.map((group) => level(group, false, c("На этом круге ничего не подготовлено.", "Nothing prepared at this level.")))}
              {!view.prepared.length && <p className={`${r.small} ${r.muted}`} style={{ margin: 0 }}>{c("Ничего не подготовлено — отметьте заклинания в книге.", "Nothing prepared — tick spells in the book.")}</p>}
            </section>
          )}
          {view.book.length > 0 && (
            <section className={s.section} aria-label={view.preparing ? c("Книга заклинаний", "Spellbook") : c("Заклинания по кругам", "Spells by level")}>
              <div className={s.sectionHead}><span className={s.sectionName}><BookOpen size={18} aria-hidden="true" />{view.preparing ? c("Книга заклинаний", "Spellbook") : c("Заклинания по кругам", "Spells by level")}</span>
                {view.preparing && <span className={`${r.small} ${r.muted}`}>{c("всё, что записано в книге; отметка — подготовить на сегодня", "everything written in the book; a tick prepares it for today")}</span>}</div>
              {view.book.map((group) => level(group, view.preparing, c("Нет заклинаний этого круга.", "No spells of this level.")))}
            </section>
          )}
          {sheet.spellLines.length > 0 && (
            <div><span className={r.eyebrow}>{c("Записано в листе", "On the sheet")}</span><ul className={s.list}>{sheet.spellLines.map((line) => <li key={line}>{line}</li>)}</ul></div>
          )}
          {nothing && <p className={r.empty}>{c("Заклинаний в листе пока нет.", "No spells on the sheet yet.")}</p>}
        </div>
      </Panel>
      {chosen ? <SpellCard key={chosen.name} spell={chosen} book={book} castable={castable(chosen)} onCast={onCast}
        onPrepare={view.preparing && chosen.level > 0 ? (prepared) => onPrepare(chosen, prepared) : undefined} />
        : <Panel><p className={r.empty}>{c("Выберите заклинание.", "Pick a spell.")}</p></Panel>}
    </div>
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
    <div className={r.parchment}>
      <div className={s.card}>
        <div className={s.cardArt}><SpellArt spell={spell} size={120} /></div>
        <SpellDraw spell={spell} />
        <span className={r.eyebrow}>{[spell.level === 0 ? c("Заговор", "Cantrip") : c(`${spell.level} круг`, `Level ${spell.level}`), spell.school,
          spell.ritual ? c("ритуал", "ritual") : null, spell.concentration ? c("концентрация", "concentration") : null].filter(Boolean).join(" · ")}</span>
        <span className={r.parchmentTitle}>{spell.name}</span>
        <dl className={s.fields}>
          {rows.filter(([, value]) => value && value.trim()).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {spell.text && <span className={r.parchmentText}>{spell.text}</span>}
        {spell.higherLevels && <span className={r.parchmentText}><b>{spell.level === 0 ? c("С ростом уровня. ", "As you level. ") : c("На более высоких кругах. ", "At higher levels. ")}</b>{spell.higherLevels}</span>}
        {spell.history && spell.history.length > 0 && (
          <details className={s.history}>
            <summary>{c("История", "History")} · {spell.history.length}</summary>
            <ul>{spell.history.map((line) => <li key={line}>{line}</li>)}</ul>
          </details>
        )}
        <div className={r.row}>
          {spell.level > 0 && free.length > 1 && (
            <label className={s.slotPick}>
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
            <button type="button" className={s.link} onClick={() => onPrepare(!spell.prepared)}>
              {spell.prepared ? c("Убрать в книгу", "Back to the book") : c("Подготовить на сегодня", "Prepare for today")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** «Нарисовать / Перерисовать» a spell's picture: the same Stage V path as a thing's (the campaign's style, priced, within
 * the daily cap); the sigil stays until the picture is ready. */
function SpellDraw({ spell }: { spell: SpellRecord }) {
  const c = useCopy();
  const image = useSpellPicture(spell);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const pictures = image.pictures;
  if (!pictures || !spell.id) return null;
  const remaining = capRemaining(pictures.board);
  const draw = async () => {
    if (pictures.preview || pending) return;
    setPending(true);
    setNotice(null);
    try {
      const result = await pictures.send("pictures.anchor", { subject: { kind: "spell", id: spell.id }, trigger: "manual" }) as { status?: string } | null;
      if (result?.status === "cap") setNotice(c("Дневной лимит картинок исчерпан; поднять его можно в настройках.", "The daily picture limit is spent; raise it in the settings."));
    } catch {
      setNotice(c("Не удалось отправить запрос; попробуй ещё раз.", "The request could not be sent; try again."));
    } finally { setPending(false); }
  };
  return (
    <div className={r.row} style={{ gap: 8 }}>
      <button type="button" className={r.btnGhost} disabled={pending || pictures.preview || image.drawing || remaining === 0} onClick={() => void draw()}>
        <RefreshCw size={15} aria-hidden="true" />{image.drawing ? c("рисуется…", "drawing…") : image.url ? c("Перерисовать", "Redraw") : c("Нарисовать", "Draw")} · {usd(pictureCostUsdMicros("quality", "spell"))}
      </button>
      <span className={r.small}>{c(`Сегодня: ${pictures.board.today.count} из ${pictures.board.settings.dailyCap}`, `Today: ${pictures.board.today.count} of ${pictures.board.settings.dailyCap}`)}</span>
      {(notice || remaining === 0) && <span className={r.small} role="status">{notice ?? c("Дневной лимит картинок исчерпан.", "The daily picture limit is spent.")}</span>}
    </div>
  );
}

// Fix S4 run 1 (FIX_S4_TABLE items 11e, 11l, 11s): the wizard's record pass — the deterministic step between the DM's
// drafted hero and the records the campaign starts with. The supplied sheet (the owner's «Who are you?» text) is the
// source: a grouped papers line becomes its separate things (11e: the unread letter reaches the inventory), the numbers
// the supplied sheet states win over the draft's re-derivation from the rules and every difference is listed for the
// owner on the review step before play (11l: nothing changes silently), and a purse of gold only is broken into mixed
// coin (11s); after the opening, a companion brought in at the house baseline takes its numbers from the hero's sheet
// (11l, companions included). Pure: no model, no database.
import type { CharacterSheetV2 } from "../inventory/sheet.ts";
import { coins5e, guessKind } from "../inventory/model.ts";
import type { CampaignSnapshot, Entity } from "../persistence/contracts.ts";
import { creatureOfEntity } from "../visual-frame/creature.ts";
import type { HeroCoin, HeroCounter, HeroItem } from "./hero-draft.ts";

type Lang = "en" | "ru";

/** A note that starts with this mark is one line of the review step's «differences from your sheet» list. */
export const SHEET_DIFFERENCE = "≠ ";
export const isSheetDifference = (note: string) => note.startsWith(SHEET_DIFFERENCE);
export const sheetDifference = (text: string) => `${SHEET_DIFFERENCE}${text}`;
/** The review step's list: the differences first (their mark off), then the other notes. */
export function splitDraftNotes(notes: readonly string[]): { differences: string[]; other: string[] } {
  return {
    differences: notes.filter(isSheetDifference).map((note) => note.slice(SHEET_DIFFERENCE.length)),
    other: notes.filter((note) => !isSheetDifference(note)),
  };
}

const capital = (value: string) => (value ? value[0].toLocaleUpperCase() + value.slice(1) : value);
const lower = (value: string) => value.toLocaleLowerCase().replace(/[’`]/g, "'");
const signedText = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value)}`;
const toNumber = (raw: string) => Number(raw.replace(/\s+/g, "").replace("−", "-").replace("+", ""));
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const words = (value: string) => lower(value).split(/[^\p{L}\d']+/u).filter(Boolean);

// --- the supplied text as entries --------------------------------------------------------------------------------------
/** A heading line of a supplied sheet («10. **James's Papers**», «**Rapier**», «Potion of Healing (2)»). */
const HEADING = /^\s*(?:\d{1,2}[.)]\s*)?\*\*([^*\n]{1,90})\*\*\s*(?:\(\d{1,4}\))?\s*$/u;
type Entry = { title: string | null; lines: string[]; body: string };
const FENCE = /^\s*```/u;
/** The supplied text cut into entries: a bold heading with the lines under it (up to a blank line), else one line. */
function entriesOf(text: string): Entry[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out: Entry[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (FENCE.test(lines[i])) continue;
    const heading = HEADING.exec(lines[i]);
    if (heading) {
      const body: string[] = [];
      while (i + 1 < lines.length && lines[i + 1].trim() && !HEADING.exec(lines[i + 1])) { i++; if (!FENCE.test(lines[i])) body.push(lines[i].trim()); }
      out.push({ title: heading[1].trim(), lines: body, body: body.join(" ") });
    } else if (lines[i].trim()) { const line = lines[i].replace(/\*\*/g, "").trim(); out.push({ title: null, lines: [line], body: line }); }
  }
  return out;
}
/** The pieces of the supplied text about a subject: a heading entry that names it (its whole body), or the clause of a
 * line from the subject's name to the next «;», sentence end or line end. */
function segmentsAbout(text: string, subject: string): string[] {
  const name = new RegExp(`(?<![\\p{L}])${escape(subject)}(?![\\p{L}])`, "iu");
  const out: string[] = [];
  for (const entry of entriesOf(text)) {
    if (entry.title && name.test(entry.title)) { out.push(`${entry.title}. ${entry.body}`); continue; }
    for (const line of entry.lines)
      for (const match of line.matchAll(new RegExp(name.source, "giu"))) {
        const rest = line.slice(match.index);
        const end = rest.search(/;|\.(?:\s|$)|$/u);
        out.push(rest.slice(0, end < 0 ? rest.length : end));
      }
  }
  return out;
}

// --- 11e: grouped papers ---------------------------------------------------------------------------------------------
const GROUP = /(?<![\p{L}])(?:papers|documents|бумаги|документы)(?![\p{L}])/iu;
const ARTICLE = /^(?:a|an|the|his|her|their|one|some|old)\s+/iu;
/** The parts of a list of things: «a pay slip…; a promissory note…; a letter…» (by «;») or «a regimental pay slip and a
 * promissory note» (by «and» / «,» when every part starts like a thing: an article or a number; in Russian, short
 * parts). Not a list — one description — gives none. */
export function listParts(list: string): string[] {
  const body = list.replace(/\s+/g, " ").trim().replace(/[.]+$/u, "").trim();
  if (!body) return [];
  // FIX_S4 run 1's smoke: a drafted «…; the sum and the name are the DM's. A letter from…» — a new sentence that starts
  // like a thing is a part of its own.
  const bySemicolon = body.split(/\s*;\s*|\.\s+(?=(?:A|An|The|His|Her|Their|One|Some|Old)\s)/u).map((part) => part.trim()).filter(Boolean);
  if (bySemicolon.length > 1) return bySemicolon.every((part) => part.split(" ").length <= 30) ? bySemicolon : [];
  const byAnd = body.split(/\s*,\s*(?:and\s+|и\s+)?|\s+(?:and|и)\s+/u).map((part) => part.trim()).filter(Boolean);
  const thingLike = (part: string) => /[а-яё]/iu.test(part) ? part.split(" ").length <= 4 : /^(?:a|an|the|his|her|their|one|two|three|four|five|\d+)\s/iu.test(part);
  return byAnd.length > 1 && byAnd.every(thingLike) ? byAnd : [];
}
type Paper = { name: string; key: string[]; description: string };
/** One part as a thing: «a letter from his old company that he never finished reading» → «Letter from his old company». */
function paperOf(piece: string): Paper | null {
  const text = piece.replace(/\s+/g, " ").trim().replace(/[.]+$/u, "");
  let head = text.split(/\s+[—–-]\s+|,|\s+(?:with|that|which|who|whose|he|she)\s+|\s+(?:с|который|которая|которое|которую|что)\s+/u)[0].trim();
  // A clause about a part («the sum and the name are the DM's») is not a thing.
  if (/\s(?:is|are|was|were|will|must|can)\s/iu.test(` ${head} `)) return null;
  head = head.replace(ARTICLE, "").trim();
  const core = head.split(/\s+(?:of|from|от|из)\s+/u)[0].trim();
  // A one-word thing keeps where it is from («Letter from his old company»); a longer one is its name («Pay slip»).
  const name = core.split(" ").length >= 2 ? core : head;
  if (!name || name.length > 80) return null;
  return { name: capital(name), key: words(core), description: `${capital(text)}.` };
}
/** Two papers are one thing when their last word is the same (en) or they share a stem of five letters (ru). */
function samePaper(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  if (a.at(-1) === b.at(-1)) return true;
  const stems = (list: string[]) => list.filter((w) => /[а-яё]/u.test(w) && w.length >= 5).map((w) => w.slice(0, 5));
  const sa = stems(a), sb = stems(b);
  return sa.some((stem) => sb.includes(stem));
}
/** The grouped papers lines the supplied sheet has: «James's papers — a pay slip and a note» inside a gear list, or a
 * heading «**James's Papers**» with its parts on the line under it. */
function suppliedPaperLists(text: string): string[] {
  const lists: string[] = [];
  for (const entry of entriesOf(text)) {
    if (entry.title && GROUP.test(entry.title) && entry.body) { lists.push(entry.body); continue; }
    const inline = /(?<![\p{L}])(?:papers|documents|бумаги|документы)\s*(?:—|–|:|-)\s*([^;\n]+)/giu;
    for (const match of entry.body.matchAll(inline)) lists.push(match[1]);
  }
  return lists;
}
/** 11e: every grouped papers thing (a thing whose name says «papers») is recorded as its parts — from its own
 * description and, at the draft, from the supplied sheet's papers lines; a part the hero already has is not added twice;
 * a part the supplied sheet names that the draft lost (the unread letter) is added. The grouped thing goes once its
 * parts are things. `supplied` is empty at the commit, where only the things' own descriptions count (the owner's
 * review stands: a part he removed is not brought back from the text). */
export function unfoldGroupedPapers(items: readonly HeroItem[], supplied: string, language: Lang): { items: HeroItem[]; notes: string[] } {
  const ru = language === "ru";
  const groups = items.filter((item) => GROUP.test(item.name) && item.quantity === 1);
  const fromText = supplied ? suppliedPaperLists(supplied).flatMap(listParts) : [];
  const fromItems = groups.flatMap((item) => listParts(item.description));
  if (!fromText.length && !fromItems.length) return { items: [...items], notes: [] };
  // The parts, merged: the first name seen, the longest description.
  const papers: Paper[] = [];
  for (const piece of [...fromItems, ...fromText]) {
    const paper = paperOf(piece);
    if (!paper || paper.key.length === 0 || GROUP.test(paper.name)) continue;
    const same = papers.find((row) => samePaper(row.key, paper.key));
    if (!same) papers.push(paper);
    else if (paper.description.length > same.description.length) same.description = paper.description;
  }
  if (papers.length < 2 && !fromText.length) return { items: [...items], notes: [] };
  const others = items.filter((item) => !groups.includes(item));
  const added: HeroItem[] = [];
  for (const paper of papers) {
    const has = others.some((item) => samePaper(words(item.name.split(/\s+(?:of|from|от|из)\s+/u)[0]), paper.key));
    if (has || added.some((item) => lower(item.name) === lower(paper.name))) continue;
    added.push({ name: paper.name, description: paper.description, quantity: 1, kind: guessKind(paper.name), slot: null, mechanics: "", detail: {} });
  }
  // A grouped thing whose parts could not be read stays as it is.
  const keep = papers.length >= 2 ? [] : groups;
  if (!added.length && keep.length === groups.length) return { items: [...items], notes: [] };
  const groupName = groups[0]?.name ?? (ru ? "Бумаги" : "Papers");
  const result = [...others, ...keep];
  // The parts go where the grouped thing was, in the sheet's order.
  const at = groups.length ? Math.min(...groups.map((group) => items.indexOf(group))) : result.length;
  const position = Math.min(at, result.length);
  result.splice(position, 0, ...added);
  const names = papers.map((paper) => others.find((item) => samePaper(words(item.name.split(/\s+(?:of|from|от|из)\s+/u)[0]), paper.key))?.name ?? paper.name);
  const newOnes = added.map((item) => item.name).join(", ");
  const note = groups.length
    ? (ru ? `«${groupName}» записаны по отдельности: ${names.join(", ")}.` : `“${groupName}” recorded as separate things: ${names.join(", ")}.`)
    : (ru ? `Бумаги из твоего листа — каждая отдельной вещью: ${names.join(", ")} (добавлено: ${newOnes}).`
      : `The papers on your sheet, each a thing of its own: ${names.join(", ")} (added: ${newOnes}).`);
  return { items: result, notes: [note] };
}

// --- 11s: mixed coin ---------------------------------------------------------------------------------------------------
/** 11s, the rule (documented here, the owner can change the split on the review): a purse of gold only, when the supplied
 * sheet states no split of its own, is carried as mixed coin — 90% of its value in gold, 9% in silver and 1% in copper,
 * rounded down to whole coins with the remainder in copper, so the value is exact (350 gp → 315 gp, 315 sp, 350 cp). A
 * soldier's purse has silver and copper for a tip or a meal. Another world's coins, a purse already in several coins and
 * the owner's own split stay as they are. */
export function mixedCoin(wallet: readonly HeroCoin[], ownerSplit: boolean, language: Lang): { wallet: HeroCoin[]; note: string | null } {
  const [platinum, gold, , silver, copper] = coins5e(language);
  void platinum;
  if (ownerSplit || wallet.length !== 1 || wallet[0].code !== gold.code || wallet[0].amount < 1) return { wallet: [...wallet], note: null };
  const total = wallet[0].amount * gold.value; // in copper
  const goldCoins = Math.floor((wallet[0].amount * 90) / 100);
  const silverCoins = Math.floor(((total - goldCoins * gold.value) * 90) / 100 / silver.value);
  const copperCoins = total - goldCoins * gold.value - silverCoins * silver.value;
  const next = [{ code: gold.code, amount: goldCoins }, { code: silver.code, amount: silverCoins }, { code: copper.code, amount: copperCoins }].filter((row) => row.amount > 0);
  const listed = next.map((row) => `${row.amount} ${row.code}`).join(", ");
  const note = language === "ru"
    ? `${wallet[0].amount} ${gold.code} — разной монетой: ${listed} (золото 90%, серебро 9%, медь 1% по стоимости). Поправь, если у героя иначе.`
    : `${wallet[0].amount} ${gold.code} carried as mixed coin: ${listed} (90% gold, 9% silver, 1% copper by value). Change it if the hero carries it otherwise.`;
  return { wallet: next, note };
}

// --- 11l: the supplied sheet's numbers -----------------------------------------------------------------------------------
type Measure = "attack" | "cap" | "pool" | "ac" | "hp" | "dc";
type Found = { value: number; text: string; at: number; numberAt: number; number: string };
const SIGNED = "([+−-]\\s?\\d{1,2})(?!\\d)";
const MEASURES: Record<Measure, RegExp[]> = {
  attack: [new RegExp(`(?:attack(?! rolls)|to hit|атака|бонус атаки)\\s*[:=]?\\s*${SIGNED}`, "giu"), new RegExp(`${SIGNED}\\s*(?:to hit|к попаданию|к атаке)`, "giu")],
  cap: [/(?:up to|no more than|at most|до|не больше|не более)\s*(\d{1,2})\s*(?:dice|die|d\d{1,2}s?|костей|кост\p{L}*|кубик\p{L}*|к\d{1,2})/giu,
    /(\d{1,2})\s*(?:dice|костей|кубиков)\s*(?:at a time|at once|per use|за раз)/giu],
  pool: [/(?:pool of\s*)?(\d{1,2})\s*[dкд]\s*\d{1,2}\s*(?:per day|a day|per long rest|each day|в день|на день|на долгий отдых)/giu, /pool of\s*(\d{1,2})(?:\s*[dкд]\s*\d{1,2})?/giu],
  ac: [/(?<![\p{L}])(?:AC|КД)\s*[:=]?\s*(\d{1,2})(?!\d)/gu],
  hp: [/(?<![\p{L}\d])(\d{1,4})\s*(?:HP|hit points|хит\p{L}*)(?![\p{L}])/giu, /(?<![\p{L}])(?:HP|hit points|хиты)\s*[:=]?\s*(\d{1,4})(?![\d/])/giu],
  dc: [/(?<![\p{L}])(?:DC|СЛ)\s*(\d{1,2})(?!\d)/gu],
};
function find(text: string, measure: Measure): Found | null {
  let best: Found | null = null;
  for (const pattern of MEASURES[measure]) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (!match || (best && best.at <= match.index)) continue;
    const number = match[1];
    best = { value: toNumber(number), text: match[0], at: match.index, numberAt: match.index + match[0].indexOf(number), number };
  }
  return best;
}
const replaceAt = (line: string, found: Found, value: number, signed: boolean) =>
  `${line.slice(0, found.numberAt)}${signed ? signedText(value) : String(value)}${line.slice(found.numberAt + found.number.length)}`;

const SKILLS: Record<Lang, string[]> = {
  en: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature",
    "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
  ru: ["Акробатика", "Уход за животными", "Магия", "Атлетика", "Обман", "История", "Проницательность", "Запугивание", "Анализ", "Расследование", "Медицина",
    "Природа", "Восприятие", "Выступление", "Убеждение", "Религия", "Ловкость рук", "Скрытность", "Выживание"],
};
/** The first signed number after a skill's name, not past «; , . ( )» or the line's end (the 11a reading). */
function skillNumber(text: string, skill: string, atStart: boolean): Found | null {
  const pattern = new RegExp(`${atStart ? "^\\s*" : "(?<![\\p{L}])"}${escape(skill)}(?![\\p{L}])([^\\n;,.()]{0,30}?)${SIGNED}`, "iu");
  const match = pattern.exec(text);
  if (!match) return null;
  const number = match[2];
  return { value: toNumber(number), text: match[0], at: match.index, numberAt: match.index + match[0].lastIndexOf(number), number };
}

type SheetLines = Pick<CharacterSheetV2, "skills" | "abilities" | "attacks" | "limitations" | "saves">;
const LINE_FIELDS = ["attacks", "abilities", "saves", "limitations"] as const;
/** A line's subject: the words before its first «:» or « — » («Rapier», «Healing Light», «Cat familiar»). */
const headOf = (line: string) => line.split(/:|\s[—–]\s/u)[0].replace(/\([^)]*\)/gu, "").replace(/^(?:the|a|an)\s+/iu, "").trim();

export type SuppliedReconciliation = { sheet: CharacterSheetV2; counters: HeroCounter[]; notes: string[] };
/** 11l: the numbers the supplied sheet states win over the drafted ones, and the owner sees each difference. Compared:
 * the skills (the first signed number after the name), the spell attack, the spell save DC and the proficiency bonus,
 * and — for each drafted attack or feature line — the attack bonus, the dice per use, the dice pool, AC, HP and DC the
 * supplied sheet states for the same subject (a weapon, a feature, a companion), and the counters by their names. A
 * drafted number that differs is replaced by the supplied one and named; a supplied number the draft does not have is
 * added to the line when it fits, else named. HP, AC, scores, level and coins are the owner's numbers already
 * (hero-draft.ts ownerNumbers). */
export function reconcileWithSupplied(sheet: CharacterSheetV2, counters: readonly HeroCounter[], supplied: string, language: Lang): SuppliedReconciliation {
  const ru = language === "ru";
  const notes: string[] = [];
  if (!supplied.trim()) return { sheet, counters: [...counters], notes };
  const lines: Required<SheetLines> = {
    skills: [...(sheet.skills ?? [])], abilities: [...(sheet.abilities ?? [])], attacks: [...(sheet.attacks ?? [])],
    limitations: [...(sheet.limitations ?? [])], saves: [...(sheet.saves ?? [])],
  };
  // «Rapier: attack +5, as your sheet says (the DM's draft had +2).»
  const kept = (what: string, theirs: string) => notes.push(sheetDifference(ru
    ? `${what} — как в твоём листе (в черновике ведущего было ${theirs}).`
    : `${what}, as your sheet says (the DM's draft had ${theirs}).`));
  const added = (subject: string, mine: string) => notes.push(sheetDifference(ru
    ? `${subject}: «${mine}» — из твоего листа (в черновике этого не было).`
    : `${subject}: “${mine}” added from your sheet (the DM's draft did not have it).`));
  const missing = (subject: string, mine: string) => notes.push(sheetDifference(ru
    ? `${subject}: в твоём листе «${mine}», в черновике этого нет — проверь.`
    : `${subject}: your sheet says “${mine}”; the DM's draft does not — check it.`));
  const said = (measure: Measure, value: number) => (ru
    ? { attack: `атака ${signedText(value)}`, cap: `до ${value} костей за раз`, pool: `запас ${value} костей`, ac: `КД ${value}`, hp: `хиты ${value}`, dc: `СЛ ${value}` }
    : { attack: `attack ${signedText(value)}`, cap: `up to ${value} dice at a time`, pool: `a pool of ${value} dice`, ac: `AC ${value}`, hp: `${value} HP`, dc: `DC ${value}` })[measure];

  // Skills.
  for (const skill of SKILLS[language]) {
    const theirs = skillNumber(supplied, skill, false);
    if (!theirs) continue;
    const index = lines.skills.findIndex((line) => skillNumber(line, skill, true) || new RegExp(`^\\s*${escape(skill)}(?![\\p{L}])`, "iu").test(line));
    if (index < 0) {
      lines.skills.push(`${skill} ${signedText(theirs.value)}`);
      added(skill, `${skill} ${signedText(theirs.value)}`);
      continue;
    }
    const mine = skillNumber(lines.skills[index], skill, true);
    if (!mine) continue;
    if (mine.value !== theirs.value) {
      lines.skills[index] = replaceAt(lines.skills[index], mine, theirs.value, true);
      kept(`${skill} ${signedText(theirs.value)}`, signedText(mine.value));
    }
  }

  // Whole-sheet numbers: the spell attack, the spell save DC, the proficiency bonus.
  const sheetWide: { label: string; supplied: RegExp; line: RegExp; signed: boolean }[] = [
    { label: ru ? "Атака заклинанием" : "Spell attack", supplied: new RegExp(`(?:spell attack|атака заклинани\\p{L}*)(?: bonus)?\\s*[:=]?\\s*${SIGNED}`, "iu"),
      line: new RegExp(`(?:spell attack|атака заклинани\\p{L}*)(?: bonus)?\\s*[:=]?\\s*${SIGNED}`, "iu"), signed: true },
    { label: ru ? "СЛ заклинаний" : "Spell save DC", supplied: /(?:spell save DC|save DC|СЛ спасброск\p{L}*|СЛ заклинани\p{L}*)\s*[:=]?\s*(\d{1,2})(?!\d)/iu,
      line: /(?:spell save DC|save DC|СЛ спасброск\p{L}*|СЛ заклинани\p{L}*)\s*[:=]?\s*(\d{1,2})(?!\d)/iu, signed: false },
    { label: ru ? "Бонус мастерства" : "Proficiency bonus", supplied: /(?:proficiency bonus|бонус мастерства)\s*[:=]?\s*\+?(\d{1,2})(?!\d)/iu,
      line: /(?:proficiency bonus|бонус мастерства)\s*[:=]?\s*\+?(\d{1,2})(?!\d)/iu, signed: true },
  ];
  for (const rule of sheetWide) {
    const theirs = rule.supplied.exec(supplied);
    if (!theirs) continue;
    const value = toNumber(theirs[1]);
    const shown = rule.signed ? signedText(value) : String(value);
    // A number the supplied sheet states that no drafted line carries is added as its own line.
    if (!LINE_FIELDS.some((field) => lines[field].some((line) => rule.line.test(line)))) {
      lines.abilities.push(`${rule.label} ${shown}`);
      added(rule.label, `${rule.label} ${shown}`);
      continue;
    }
    for (const field of LINE_FIELDS) {
      lines[field] = lines[field].map((line) => {
        const mine = rule.line.exec(line);
        if (!mine) return line;
        const current = toNumber(mine[1]);
        if (current === value) return line;
        kept(`${rule.label} ${rule.signed ? signedText(value) : String(value)}`, rule.signed ? signedText(current) : String(current));
        const numberAt = mine.index + mine[0].lastIndexOf(mine[1]);
        return `${line.slice(0, numberAt)}${rule.signed && /[+−-]/u.test(mine[1]) ? signedText(value) : String(value)}${line.slice(numberAt + mine[1].length)}`;
      });
    }
  }

  // Per subject: a weapon's attack, a feature's dice, a companion's AC and HP.
  const subjectMeasures: Measure[] = ["attack", "cap", "pool", "ac", "hp", "dc"];
  const seen = new Set<string>();
  for (const field of ["attacks", "abilities"] as const) {
    lines[field] = lines[field].map((line) => {
      const head = headOf(line);
      if (head.length < 4 || /^(?:spell attack|proficiency bonus|бонус мастерства|атака заклинани)/iu.test(head)) return line;
      const segments = segmentsAbout(supplied, head);
      if (!segments.length) return line;
      let next = line;
      for (const measure of subjectMeasures) {
        const theirs = segments.map((segment) => find(segment, measure)).find(Boolean);
        if (!theirs) continue;
        // The line's own part about the subject: after the head (a spell attack inside a Pact Magic line is not a weapon's).
        const mine = find(next, measure);
        const signed = measure === "attack";
        const key = `${lower(head)}:${measure}`;
        if (mine && mine.value === theirs.value) { seen.add(key); continue; }
        if (seen.has(key)) continue;
        seen.add(key);
        if (mine) {
          next = replaceAt(next, mine, theirs.value, signed);
          // A note that contradicts the kept number goes with it («+5 to hit (not proficient)»).
          if (measure === "attack") next = next.replace(/\s*\((?:[^)]*(?:not proficient|no [\p{L} ]*proficiency|без владения|не владеет)[^)]*)\)/iu, "");
          kept(`${head}: ${said(measure, theirs.value)}`, signed ? signedText(mine.value) : String(mine.value));
          continue;
        }
        const phrase = said(measure, theirs.value);
        if (`${next}; ${phrase}`.length <= 200) { next = `${next}; ${phrase}`; added(head, phrase); }
        else missing(head, phrase);
      }
      if (next !== line) {
        const contradicted = lines.limitations.find((row) => new RegExp(`(?<![\\p{L}])${escape(head)}(?![\\p{L}])`, "iu").test(row) && /proficien|владени/iu.test(row));
        if (contradicted) notes.push(sheetDifference(ru ? `${head}: проверь и строку ограничений «${contradicted}».` : `${head}: check the limits line “${contradicted}” too.`));
      }
      return next;
    });
  }

  // Counters by name («Resources: … hit dice 5; healing light 6» or «Counters: Hit dice (d8) 5 · Healing light 6»).
  const nextCounters = counters.map((row) => ({ ...row }));
  const coinWords = new Set(coins5e(language).flatMap((coin) => coin.words));
  for (const entry of entriesOf(supplied)) {
    const body = `${entry.title ?? ""} ${entry.body}`.replace(/\*\*/g, "").replace(/«[^»]*»\s*/gu, "").trim();
    const head = /^\(?(?:resources|counters|ресурсы|счётчики|счетчики)\)?\s*(?:\([^)]*\))?\s*:\s*/iu.exec(body);
    if (!head) continue;
    for (const raw of body.slice(head[0].length).split(/\s*[;·]\s*/u)) {
      const part = raw.replace(/\([^)]*\)/gu, " ").replace(/[.]+$/u, "").replace(/\s+/g, " ").trim();
      const m = /^(.+?)\s*[:=]?\s*(\d{1,6})$/u.exec(part);
      if (!m) continue;
      const label = m[1].trim(), value = Number(m[2]);
      if (words(label).some((word) => [...coinWords].some((stem) => word.startsWith(stem)))) continue;
      const mineWords = words(label);
      const scored = nextCounters.map((row) => ({ row, score: lower(row.label) === lower(label) ? 100 : words(row.label).filter((word) => word.length >= 4 && mineWords.includes(word)).length }))
        .filter((row) => row.score > 0).sort((a, b) => b.score - a.score);
      const match = scored.length && (scored.length === 1 || scored[0].score > scored[1].score) ? scored[0].row : null;
      if (!match) {
        if (!nextCounters.some((row) => row.value === value)) missing(capital(label), `${label} ${value}`);
        continue;
      }
      if (match.value === value && (match.max === null || match.max === value)) continue;
      const before = match.max === null ? `${match.value}` : `${match.value}/${match.max}`;
      match.value = value;
      match.max = match.max === null ? null : value;
      kept(`${match.label} ${value}`, before);
    }
  }

  return { sheet: { ...sheet, ...lines }, counters: nextCounters, notes: [...new Set(notes)] };
}

// --- 11l, companions included: the companion's numbers from the hero's sheet ---------------------------------------------
/** The opening's house baseline for a person it brings in (migration 202610030035: HP 8, defense 10) — numbers that are
 * nobody's: a companion still at them takes its numbers from the hero's sheet. */
export const OPENING_BASELINE = { hp: 8, defense: 10 } as const;
type SheetEntity = Pick<Entity, "id" | "kind" | "name" | "details" | "hp" | "max_hp" | "stats" | "character_sheet">;
/** The hero's sheet line about a companion («The cat (familiar): AC 12, 2 HP, speed 40 ft», «Cat familiar: AC 12, HP 2»):
 * the line whose subject names the companion — by its name or by the animal it is — with its AC and HP. */
export function companionNumbersFromSheet(hero: Pick<Entity, "character_sheet">, companion: SheetEntity): { hp: number | null; ac: number | null; line: string } | null {
  const sheet = (hero.character_sheet && typeof hero.character_sheet === "object" ? hero.character_sheet : {}) as { abilities?: unknown; attacks?: unknown; limitations?: unknown };
  const lines = [sheet.abilities, sheet.attacks, sheet.limitations].flatMap((value) => (Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : []));
  const species = creatureOfEntity(companion)?.species ?? null;
  const names = [companion.name.replace(/^(?:the|a|an)\s+/iu, "").trim(), species ?? ""].filter((name) => name.length >= 3);
  for (const line of lines) {
    const head = line.split(":")[0];
    if (!names.some((name) => new RegExp(`(?<![\\p{L}])${escape(name)}(?![\\p{L}])`, "iu").test(head))) continue;
    const ac = find(line, "ac"), hp = find(line, "hp");
    if (ac || hp) return { hp: hp?.value ?? null, ac: ac?.value ?? null, line };
  }
  return null;
}
/** The companions the opening brought in at the house baseline whose numbers the hero's sheet states: their HP and AC
 * as the sheet says (the cat at 2 HP and AC 12, not 8 and 10). A number the DM or the owner set is never touched. */
export function sheetCompanionCorrections(snapshot: Pick<CampaignSnapshot, "entities">): { entity: SheetEntity; hp: number; defense: number; line: string }[] {
  const hero = snapshot.entities.find((row) => row.kind === "player");
  if (!hero) return [];
  const out: { entity: SheetEntity; hp: number; defense: number; line: string }[] = [];
  for (const entity of snapshot.entities) {
    if (entity.kind !== "companion" && entity.kind !== "npc") continue;
    const defense = Number((entity.stats as Record<string, unknown> | undefined)?.defense);
    if (entity.hp !== OPENING_BASELINE.hp || entity.max_hp !== OPENING_BASELINE.hp || defense !== OPENING_BASELINE.defense) continue;
    const numbers = companionNumbersFromSheet(hero, entity);
    if (!numbers || (numbers.hp === null && numbers.ac === null)) continue;
    const hp = numbers.hp ?? OPENING_BASELINE.hp, ac = numbers.ac ?? defense;
    if (hp === entity.max_hp && ac === defense) continue;
    out.push({ entity, hp, defense: ac, line: numbers.line });
  }
  return out;
}

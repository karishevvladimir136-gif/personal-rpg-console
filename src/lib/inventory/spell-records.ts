// Fix S3-accept В1 (docs/stages/FIX_S3_ACCEPT.md «В — spells as items»): the spells as records, like things.
//   - The schools (their words in both languages and a sigil for the screens); a spell's `school` is the campaign's own
//     word, so a system with other schools keeps its words and gets the plain sigil.
//   - The cards of the twelve spells the owner's wizard knows, in Russian, written for this app in its own words at the
//     level of the 5e SRD (2014). Rules are knowledge: these texts only fill a card the records do not fill yet (the
//     one-time conversion, a spell the DM names without a text); the DM still rules on the table.
//   - The one-time conversion: «Умения» lines that are lists of spells («Заговоры: …», «Подготовлено: 1 круг — …») become
//     spell records; every other line stays as it was. Why TypeScript and not SQL (unlike migrations 77 and 0402): the
//     texts and the parse are logic and live once; the screen saves the result through the owner's ordinary sheet
//     correction (`entity.save` in the timeline's correction scope: a new revision of the record, the receipt kept, the
//     database's sheet check on it), and a later save or a DM call starts from a sheet with no spell prose — so it runs
//     once by shape, and a run on a converted sheet changes nothing.
//   - The DM's view of the spells: one short line per spell (name, level, school, prepared or in the book) instead of
//     the prose or the full cards.
// Pure: no server imports, no React.
import { spellId, type SpellRecord } from "./model.ts";
import { patchSheet, type AnySheet, type CharacterSheetV2 } from "./sheet.ts";

type Lang = "ru" | "en";
const lang = (value: unknown): Lang => (value === "ru" ? "ru" : "en");
const norm = (text: string) => text.toLocaleLowerCase().replace(/ё/g, "е").replace(/[«»"“”„'*]/g, "").replace(/\s+/g, " ").trim();

// --- schools -------------------------------------------------------------------------------------------------
export type SchoolKey = "abjuration" | "conjuration" | "divination" | "enchantment" | "evocation" | "illusion" | "necromancy" | "transmutation";
export const SPELL_SCHOOLS: { key: SchoolKey; ru: string; en: string; stems: string[] }[] = [
  { key: "abjuration", ru: "Ограждение", en: "Abjuration", stems: ["огражд", "abjur"] },
  { key: "conjuration", ru: "Вызов", en: "Conjuration", stems: ["вызов", "conjur"] },
  { key: "divination", ru: "Прорицание", en: "Divination", stems: ["прориц", "divin"] },
  { key: "enchantment", ru: "Очарование", en: "Enchantment", stems: ["очаров", "enchant"] },
  { key: "evocation", ru: "Воплощение", en: "Evocation", stems: ["воплощ", "evoc"] },
  { key: "illusion", ru: "Иллюзия", en: "Illusion", stems: ["иллюз", "illus"] },
  { key: "necromancy", ru: "Некромантия", en: "Necromancy", stems: ["некрома", "necrom"] },
  { key: "transmutation", ru: "Преобразование", en: "Transmutation", stems: ["преобраз", "transmut"] },
];
/** The known school a record's word names (any case, either language), else null (the plain sigil). */
export function schoolKey(school: string | undefined): SchoolKey | null {
  const word = norm(school ?? "");
  return word ? SPELL_SCHOOLS.find((row) => row.stems.some((stem) => word.startsWith(stem)))?.key ?? null : null;
}

// --- the cards (Russian, own words, 5e SRD level) ------------------------------------------------------------
type Card = Omit<SpellRecord, "known" | "prepared" | "id" | "history"> & { aliases?: string[] };
const V_S = "В, С";
export const SPELL_CARDS_RU: Card[] = [
  { name: "Огненный снаряд", level: 0, school: "Воплощение", castingTime: "1 действие", range: "120 футов", components: V_S, duration: "Мгновенная",
    saveOrAttack: "Дальнобойная атака заклинанием", damage: "1к10 огнём", aliases: ["Огненный болт", "Огненная стрела"],
    text: "С ладони срывается сгусток пламени и летит в существо или предмет в пределах дистанции. Совершите дальнобойную атаку заклинанием: при попадании цель получает 1к10 урона огнём. Горючий предмет, который никто не несёт и не держит, от попадания загорается.",
    higherLevels: "Урон растёт с уровнем заклинателя: 2к10 на 5-м уровне, 3к10 на 11-м, 4к10 на 17-м." },
  { name: "Электрошок", level: 0, school: "Воплощение", castingTime: "1 действие", range: "Касание", components: V_S, duration: "Мгновенная",
    saveOrAttack: "Рукопашная атака заклинанием", damage: "1к8 электричеством", aliases: ["Шокирующее касание", "Шокирующая хватка", "Электрическое касание"],
    text: "Рука вспыхивает разрядом, и вы касаетесь существа в пределах досягаемости. Совершите рукопашную атаку заклинанием; если на цели доспех из металла, бросок совершается с преимуществом. При попадании цель получает 1к8 урона электричеством и до начала своего следующего хода не может совершать реакции — удобно, чтобы отойти без удара вслед.",
    higherLevels: "Урон растёт с уровнем заклинателя: 2к8 на 5-м уровне, 3к8 на 11-м, 4к8 на 17-м." },
  { name: "Волшебная рука", level: 0, school: "Вызов", castingTime: "1 действие", range: "30 футов", components: V_S, duration: "1 минута", aliases: ["Рука мага", "Магическая рука"],
    text: "В выбранной точке в пределах дистанции появляется призрачная парящая рука. Она держится минуту, пока вы её не отпустите действием, пока не окажется дальше 30 футов от вас или пока вы не сотворите заклинание снова. Действием вы управляете ею: она двигается на 30 футов и может поднять или передвинуть предмет, открыть незапертую дверь или сундук, достать вещь из открытого мешка или убрать её туда, вылить содержимое склянки. Рука не атакует, не включает магические предметы и не поднимает больше 10 фунтов." },
  { name: "Сообщение", level: 0, school: "Преобразование", castingTime: "1 действие", range: "120 футов", components: "В, С, М (короткий кусок медной проволоки)", duration: "1 раунд",
    aliases: ["Послание"],
    text: "Вы указываете проволокой на существо в пределах дистанции и шёпотом передаёте ему короткую фразу. Слышит только цель, и она может так же шёпотом ответить — ответ слышите только вы. Заклинанию не нужна прямая видимость: если вы знаете, что цель за преградой, звук обходит её. Его останавливают 1 фут камня, 1 дюйм обычного металла, тонкий лист свинца или 3 фута дерева. Существо, которое не знает вашего языка, понимает, что к нему обратились, но не смысл." },
  { name: "Щит", level: 1, school: "Ограждение", castingTime: "1 реакция, когда по вам попадает атака или вас выбирает целью «Волшебная стрела»", range: "На себя", components: V_S, duration: "1 раунд",
    aliases: ["Магический щит"],
    text: "Перед вами вспыхивает невидимая стена силы. До начала вашего следующего хода вы получаете +5 к КД — в том числе против атаки, из-за которой вы сотворили заклинание, так что она может промахнуться, — и не получаете урона от «Волшебной стрелы»." },
  { name: "Доспехи мага", level: 1, school: "Ограждение", castingTime: "1 действие", range: "Касание", components: "В, С, М (кусочек выделанной кожи)", duration: "8 часов",
    aliases: ["Доспех мага", "Броня мага"],
    text: "Вы касаетесь согласного существа без доспеха, и его окутывает защитная сила. Пока заклинание действует, его базовый КД равен 13 + модификатор Ловкости. Заклинание заканчивается, если цель надевает доспех или если вы отменяете его действием. Щит в руке не мешает." },
  { name: "Огненные ладони", level: 1, school: "Воплощение", castingTime: "1 действие", range: "На себя (конус 15 футов)", components: V_S, duration: "Мгновенная",
    saveOrAttack: "Спасбросок Ловкости", damage: "3к6 огнём", aliases: ["Горящие руки", "Огненные руки", "Пылающие руки"],
    text: "Вы сводите большие пальцы, растопырив остальные, и из кончиков пальцев вырывается веер пламени. Каждое существо в конусе 15 футов совершает спасбросок Ловкости: при провале получает 3к6 урона огнём, при успехе — половину. Горючие предметы в конусе, которые никто не несёт и не держит, загораются.",
    higherLevels: "Ячейкой 2 круга и выше урон растёт на 1к6 за каждый круг выше первого." },
  { name: "Палящий луч", level: 2, school: "Воплощение", castingTime: "1 действие", range: "120 футов", components: V_S, duration: "Мгновенная",
    saveOrAttack: "Дальнобойная атака заклинанием за каждый луч", damage: "2к6 огнём за луч", aliases: ["Палящие лучи", "Обжигающий луч"],
    text: "Вы создаёте три огненных луча и направляете их в цели в пределах дистанции — все в одну или в разные. За каждый луч совершите отдельную дальнобойную атаку заклинанием; каждое попадание наносит 2к6 урона огнём.",
    higherLevels: "Ячейкой 3 круга и выше — на один луч больше за каждый круг выше второго." },
  { name: "Туманный шаг", level: 2, school: "Вызов", castingTime: "1 бонусное действие", range: "На себя", components: "В", duration: "Мгновенная",
    aliases: ["Мистический шаг", "Туманная поступь"],
    text: "Вас на миг окутывает серебристая дымка, и вы переноситесь на расстояние до 30 футов в свободное место, которое видите. Остаётся действие на ход — удобно, чтобы выйти из окружения и тут же сотворить что-то ещё." },
  { name: "Удержание личности", level: 2, school: "Очарование", castingTime: "1 действие", range: "60 футов", components: "В, С, М (маленький прямой кусочек железа)",
    duration: "Концентрация, вплоть до 1 минуты", concentration: true, saveOrAttack: "Спасбросок Мудрости", aliases: ["Удержание персоны", "Удержать личность", "Удержание человека"],
    text: "Выберите гуманоида, которого видите в пределах дистанции. Он совершает спасбросок Мудрости и при провале становится парализованным на время действия заклинания. В конце каждого своего хода цель повторяет спасбросок и при успехе освобождается. Атака по парализованному существу совершается с преимуществом, а попадание вблизи (в пределах 5 футов) становится критическим.",
    higherLevels: "Ячейкой 3 круга и выше — ещё один гуманоид за каждый круг выше второго; все цели должны быть не дальше 30 футов друг от друга." },
  { name: "Огненный шар", level: 3, school: "Воплощение", castingTime: "1 действие", range: "150 футов", components: "В, С, М (крошечный шарик из гуано летучей мыши и серы)", duration: "Мгновенная",
    saveOrAttack: "Спасбросок Ловкости", damage: "8к6 огнём",
    text: "Из пальца срывается яркая искра, летит в выбранную точку в пределах дистанции и с гулом раскрывается в шар пламени. Каждое существо в сфере радиусом 20 футов с центром в этой точке совершает спасбросок Ловкости: при провале получает 8к6 урона огнём, при успехе — половину. Огонь огибает углы. Горючие предметы в области, которые никто не несёт и не держит, загораются.",
    higherLevels: "Ячейкой 4 круга и выше урон растёт на 1к6 за каждый круг выше третьего." },
  { name: "Молния", level: 3, school: "Воплощение", castingTime: "1 действие", range: "На себя (линия 100 футов)", components: "В, С, М (кусочек меха и стеклянная или янтарная палочка)", duration: "Мгновенная",
    saveOrAttack: "Спасбросок Ловкости", damage: "8к6 электричеством", aliases: ["Удар молнии", "Разряд молнии"],
    text: "Из вас в выбранном направлении бьёт разряд — линия длиной 100 футов и шириной 5 футов. Каждое существо на линии совершает спасбросок Ловкости: при провале получает 8к6 урона электричеством, при успехе — половину. Горючие предметы на линии, которые никто не несёт и не держит, загораются.",
    higherLevels: "Ячейкой 4 круга и выше урон растёт на 1к6 за каждый круг выше третьего." },
  { name: "Контрзаклинание", level: 3, school: "Ограждение", castingTime: "1 реакция, когда вы видите, как существо в пределах 60 футов сотворяет заклинание", range: "60 футов",
    components: "С", duration: "Мгновенная", aliases: ["Противодействие заклинанию", "Встречное заклинание"],
    text: "Вы обрываете чужое заклинание в момент сотворения. Если его круг 3-й или ниже, оно просто не срабатывает. Если выше — совершите проверку своей заклинательной характеристики (у волшебника — Интеллекта) против Сл 10 + круг того заклинания; при успехе оно не срабатывает. Ячейка противника при этом тратится.",
    higherLevels: "Ячейкой 4 круга и выше заклинание круга не выше ячейки обрывается без проверки." },
];
const CARDS = new Map<string, Card>();
for (const card of SPELL_CARDS_RU) for (const name of [card.name, ...(card.aliases ?? [])]) CARDS.set(norm(name), card);
/** The card a spell name names (its own name or a common other name), else null. */
export function spellCard(name: string): Card | null {
  return CARDS.get(norm(name)) ?? null;
}
/** A spell with the fields its record does not give filled from its card (its own words always win); the card's name
 * and level only when the record names the card by another name. Never a card for a different level. */
export function withCard(spell: SpellRecord, language: unknown): SpellRecord {
  const card = lang(language) === "ru" ? spellCard(spell.name) : null;
  if (!card || card.level !== spell.level) return spell;
  const { aliases: _aliases, name: _name, ...fields } = card;
  void _aliases; void _name;
  return { ...fields, ...spell };
}

// --- the one-time conversion of the prose ----------------------------------------------------------------------
type Parsed = { name: string; level: number; prepared: boolean | null; card: Card | null };
const LABEL = /(заговор|фокус|заклинан|подготовл|книг[аеи] заклинаний|круг|cantrip|spell|prepared)/;
const CANTRIP = /(заговор|фокус|cantrip)/;
const PREPARED = /(подготовл|prepared)/;
const BOOK = /(книг|известн|spellbook|known|выучен)/;
function levelIn(text: string): number | null {
  const m = /([1-9])\s*-?\s*(?:й|го|ого|ый|ой)?\s*(?:круг|уров|level)|(?:круг|level)\p{L}*\s*([1-9])|^\(?([1-9])\)?$/u.exec(text.trim());
  return m ? Number(m[1] ?? m[2] ?? m[3]) : null;
}
const LEVEL_HEAD = /^\(?\s*((?:[1-9]\s*-?\s*(?:й|го|ого|ый|ой)?\s*(?:круг|уров|level)\p{L}*)|(?:(?:круг|level)\p{L}*\s*[1-9])|(?:заговор\p{L}*|фокус\p{L}*|cantrips?))\s*\)?\s*[:—–-]?\s*/iu;
/** A part of a list that could be a spell's name the cards do not know: words only, at most six, no numbers. */
const nameLike = (part: string) => /^[\p{L}][\p{L}\s'’-]{1,58}$/u.test(part) && part.split(/\s+/).length <= 6;
/** The spells one «Умения» line lists, or null when the line is not entirely a list of spells (it is kept as it is). */
export function parseSpellLine(line: string): Parsed[] | null {
  const text = line.trim().replace(/[.;]+$/, "");
  const colon = text.search(/[:—–]/);
  const label = colon >= 0 ? norm(text.slice(0, colon)) : "";
  const body = colon >= 0 ? text.slice(colon + 1) : text;
  const labelled = !!label && LABEL.test(label);
  if (label && !labelled) return null;
  const labelLevel = !label ? null : CANTRIP.test(label) ? 0 : levelIn(label);
  const prepared = PREPARED.test(label) ? true : BOOK.test(label) ? false : null;
  const out: Parsed[] = [];
  // «1 круг — Щит, Доспехи мага; 2 круг — …» or «Щит, Доспехи мага / Палящий луч …»: segments by ; / |, each may open with its level.
  for (const segment of body.split(/[;|/]/)) {
    let rest = segment.trim();
    let level = labelLevel;
    const head = LEVEL_HEAD.exec(rest);
    if (head) { level = CANTRIP.test(norm(head[1])) ? 0 : levelIn(norm(head[1])) ?? level; rest = rest.slice(head[0].length); }
    for (const raw of rest.split(",").flatMap((part) => (spellCard(part) || !/\sи\s/.test(part) ? [part] : part.split(/\sи\s/)))) {
      const part = raw.trim().replace(/^[«"“]|[»"”]$/g, "").replace(/\s*\((?:ритуал|концентрация|ritual|concentration|[КРCR])\)\s*$/iu, "").replace(/[.*]+$/, "").trim();
      if (!part) continue;
      const card = spellCard(part);
      if (card) { out.push({ name: card.name, level: card.level, prepared, card }); continue; }
      // A name the cards do not know needs the line to say it is a spell and of which level.
      if (!labelled || level === null || !nameLike(part)) return null;
      out.push({ name: part.charAt(0).toLocaleUpperCase() + part.slice(1), level, prepared, card: null });
    }
  }
  return out.length ? out : null;
}

export type SpellConversion = { sheet: CharacterSheetV2; spells: string[]; moved: string[]; kept: string[] };
/** The one-time conversion of a sheet: «Умения» lines (and a schema-1 sheet's spell names) that list spells become
 * records — cantrips at level 0, the rest known, prepared unless the line says «книга» — with the card's school and
 * text, an id and the history line «перенесено из «Умений»»; a record already there keeps its own fields. Every other line
 * stays. Null when there is nothing to convert (a converted sheet, a sheet without spell prose). */
export function convertSpellProse(sheet: AnySheet | null | undefined, language: unknown): SpellConversion | null {
  if (!sheet) return null;
  const ru = lang(language) === "ru";
  const abilities = sheet.abilities ?? [];
  const parsed: Parsed[] = [];
  const kept: string[] = [], moved: string[] = [];
  for (const line of abilities) {
    const rows = parseSpellLine(line);
    if (rows) { parsed.push(...rows); moved.push(line); } else kept.push(line);
  }
  // A schema-1 sheet keeps its spells as names (no level): a name a card knows becomes a record; the rest stay one line
  // of «Умения», so nothing is lost when the sheet becomes schema 2.
  const names = sheet.schemaVersion === 1 ? sheet.spells ?? [] : [];
  const unknown: string[] = [];
  for (const name of names) {
    const rows = parseSpellLine(name);
    if (rows) parsed.push(...rows); else if (name.trim()) unknown.push(name.trim());
  }
  if (!parsed.length) return null;
  if (unknown.length) kept.push(`${ru ? "Заклинания" : "Spells"}: ${unknown.join(", ")}`.slice(0, 200));
  const stored = new Map((sheet.schemaVersion === 2 ? sheet.spells ?? [] : []).map((row) => [norm(row.name), row]));
  const note = ru ? "перенесено из «Умений»" : "moved from «Abilities»";
  const records: SpellRecord[] = [];
  // A spell listed twice (in the book and as prepared) is one record, prepared when any line says so.
  const byKey = new Map<string, Parsed>();
  for (const row of parsed) {
    const seen = byKey.get(norm(row.name));
    if (!seen) byKey.set(norm(row.name), { ...row });
    else seen.prepared = seen.prepared === true || row.prepared === true ? true : seen.prepared ?? row.prepared;
  }
  for (const [key, row] of byKey) {
    const own = stored.get(key);
    const base: SpellRecord = { name: row.name, level: row.level, known: true, ...(row.level > 0 ? { prepared: row.prepared ?? true } : {}) };
    const card = row.card && ru ? withCard(base, language) : base;
    records.push({ ...card, ...(own ?? {}), id: own?.id ?? spellId(own?.name ?? row.name), history: [...new Set([...(own?.history ?? []), note])] });
  }
  return { sheet: patchSheet(sheet, { abilities: kept, spells: records }), spells: records.map((row) => row.name), moved, kept };
}

/** The patch the owner's screen saves for the conversion (the ordinary sheet correction), or null. */
export function conversionPatch(sheet: AnySheet | null | undefined, language: unknown): { abilities: string[]; spells: SpellRecord[] } | null {
  const done = convertSpellProse(sheet, language);
  if (!done) return null;
  const names = new Set(done.spells.map(norm));
  return { abilities: done.kept, spells: (done.sheet.spells ?? []).filter((row) => names.has(norm(row.name))) };
}

// --- the tab ---------------------------------------------------------------------------------------------------
export type SpellGroup = { level: number; label: string; spells: SpellRecord[]; slots: { value: number; max: number } | null };
export type SpellTabView = {
  /** A caster who prepares (the wizard): «Подготовлено сегодня» and «Книга заклинаний»; otherwise one list by level. */
  preparing: boolean;
  /** The schools on the sheet (for the filter), in the order of the 5e list, other words after. */
  schools: { word: string; key: SchoolKey | null; count: number }[];
  cantrips: SpellRecord[];
  /** Preparing: the prepared spells by level, each level with its slot pips (a level with slots and nothing prepared too). */
  prepared: SpellGroup[];
  /** Everything written in the book (preparing) or known (not), by level. */
  book: SpellGroup[];
  /** Every level with slots, for the pips that always stay. */
  slots: SpellGroup[];
  preparedCount: number;
  preparedMax: number | null;
};
const levelLabel = (level: number, ru: boolean) => (level === 0 ? (ru ? "Заговоры" : "Cantrips") : ru ? `${level} круг` : `Level ${level}`);
/** The spells tab's three sections from the sheet's records and the slot counters, filtered by a school (null: all). */
export function spellTabView(spells: readonly SpellRecord[], resources: Record<string, number>, preparedMax: number | null, language: unknown, school: string | null = null): SpellTabView {
  const ru = lang(language) === "ru";
  const preparing = preparedMax !== null || spells.some((row) => row.level > 0 && row.prepared !== undefined);
  const counts = new Map<string, number>();
  for (const row of spells) if (row.school?.trim()) counts.set(row.school.trim(), (counts.get(row.school.trim()) ?? 0) + 1);
  const order = (word: string) => { const key = schoolKey(word); return key ? SPELL_SCHOOLS.findIndex((row) => row.key === key) : SPELL_SCHOOLS.length; };
  const schools = [...counts].map(([word, count]) => ({ word, key: schoolKey(word), count })).sort((a, b) => order(a.word) - order(b.word) || a.word.localeCompare(b.word));
  const shown = school ? spells.filter((row) => norm(row.school ?? "") === norm(school)) : [...spells];
  const byName = (a: SpellRecord, b: SpellRecord) => a.name.localeCompare(b.name);
  const levels = new Set<number>();
  for (const key of Object.keys(resources)) { const m = /^spell_slots_(\d)$/.exec(key); if (m && Number(m[1]) > 0) levels.add(Number(m[1])); }
  const slotOf = (level: number) => {
    const value = resources[`spell_slots_${level}`], max = resources[`spell_slots_${level}_max`];
    return Number.isFinite(value) ? { value, max: Number.isFinite(max) ? max : value } : null;
  };
  const group = (rows: SpellRecord[], withSlots: boolean, keepEmpty: boolean): SpellGroup[] => {
    const all = new Set<number>([...rows.map((row) => row.level), ...(keepEmpty ? levels : [])]);
    return [...all].filter((level) => level > 0).sort((a, b) => a - b)
      .map((level) => ({ level, label: levelLabel(level, ru), spells: rows.filter((row) => row.level === level).sort(byName), slots: withSlots ? slotOf(level) : null }));
  };
  const levelled = shown.filter((row) => row.level > 0);
  return {
    preparing, schools,
    cantrips: shown.filter((row) => row.level === 0).sort(byName),
    prepared: preparing ? group(levelled.filter((row) => row.prepared === true), true, true) : [],
    book: group(levelled, !preparing, !preparing),
    slots: [...levels].sort((a, b) => a - b).map((level) => ({ level, label: levelLabel(level, ru), spells: [], slots: slotOf(level) })),
    preparedCount: spells.filter((row) => row.level > 0 && row.prepared === true).length,
    preparedMax,
  };
}

// --- the DM's view -------------------------------------------------------------------------------------------
/** One short line per spell for the DM's context: «Щит — 1, Ограждение, prepared»; «Огненный снаряд — cantrip, Воплощение». */
export function dmSpellLine(spell: SpellRecord): string {
  const marks = [spell.level === 0 ? "cantrip" : String(spell.level), spell.school, spell.level > 0 ? (spell.prepared ? "prepared" : spell.prepared === false ? "in the book" : null) : null,
    spell.concentration ? "concentration" : null, spell.ritual ? "ritual" : null].filter(Boolean);
  return `${spell.name} — ${marks.join(", ")}`;
}
/** The sheet as the DM reads it: spells as short lines (cantrips, then by level; the cards' texts stay on the screen),
 * and a sheet whose «Умения» still list spells read as converted. */
export function dmSheetView(sheet: AnySheet | null | undefined, language: unknown): Record<string, unknown> | null {
  if (!sheet) return null;
  const view = convertSpellProse(sheet, language)?.sheet ?? sheet;
  if (view.schemaVersion !== 2 || !view.spells?.length) return view as unknown as Record<string, unknown>;
  const spells = [...view.spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)).map(dmSpellLine);
  return { ...view, spells };
}

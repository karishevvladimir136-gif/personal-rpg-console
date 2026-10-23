// Persona memory 1, Part C: the import of the Project memory files the owner exports from claude.ai — the first-person
// journal (`claude-journal.md`), the time-sense note (`time-sense.md`), the project facts (`personal-rpg-console.md`,
// others). Pure: text in, a plan out; the script (scripts/persona-memory/import-project-memory.mjs) reads the files,
// prints the plan (dry run) and, with --write, applies it. Nothing is invented: what the text does not say (a
// salience, cues, a state line) is either derived from the text and labelled as derived in the plan, or recorded as
// absent by a `background` line; an unattributed quote is never taken for the owner's words.
import type { PersonaMemory } from "./memory.ts";
import { isDateCue, PersonaMemoryError, registerHits, type DossierLineInput, type FactInput, type QuoteInput, type RememberInput, type Tag } from "./schema.ts";
import { periodOf } from "./text.ts";

export type SourceFile = { path: string; text: string };
export type PlannedEpisode = { input: RememberInput & { source: string }; derived: string[]; register: string[] };
export type ImportPlan = { episodes: PlannedEpisode[]; facts: (FactInput & { source: string })[]; dossier: (DossierLineInput & { source: string })[]; warnings: string[] };

type Section = { heading: string; level: number; body: string[]; anchor: string };

const RULES_HEADING = /(?:^|\s)(?:rules?|standing rules|правила|правило)(?:\s|$|:)/i;
const HEDGE = /(?<![\p{L}])(?:i think|i guess|it seems|seems|probably|maybe|perhaps|i suspect|likely|кажется|похоже|наверное|видимо|возможно|думаю|по-моему|вероятно)(?![\p{L}])/iu;
const OWNER_ATTRIBUTION = /(?:^|[\s—–-])(?:he|the owner|owner|он|владелец|хозяин)(?:\s+(?:said|says|wrote|asked|сказал|написал|спросил|ответил))?\s*[.:)]?\s*$/iu;
const SELF_ATTRIBUTION = /(?:^|[\s—–-])(?:i|me|myself|я|мой ответ)(?:\s+(?:said|wrote|answered|сказал|написал|ответил))?\s*[.:)]?\s*$/iu;
const OWNER_SAYS = /(?<![\p{L}])(?:he said|he wrote|he asked|the owner said|owner said|он сказал|он написал|он попросил|владелец сказал|по его словам)(?![\p{L}])/iu;
const QUOTED = /[«“"]([^«»“”"]{2,})[»”"]/u;
const STATE_MARKER = /^(?:state|pulled toward|pulled|did|i did|resisted|состояние|тянуло|хотелось|сделал|сделала|удержался|удержалась)\s*[:—–-]\s*/iu;
const STATE_WORDS = /(?<![\p{L}])(?:pulled toward|was pulled|i was tempted|tempted to|i resisted|resisted|instead i|i chose|тянуло|хотелось|удержался|удержалась|вместо этого|я выбрал|я выбрала|соблазн)(?![\p{L}])/iu;
const SALIENCE = /(?<![\p{L}])(?:salience|значимость|важность|weight|вес)\s*[:=—–-]?\s*([1-5])(?:\s*\/\s*5)?(?![\d])/iu;
const STARS = /^[★⭐]{1,5}$/u;
const CUES = /^(?:cues?|ключи|подсказки|зацепки|якоря|tags?)\s*[:—–-]\s*(.+)$/iu;
const TIME = /(?<![\d])([01]?\d|2[0-3]):([0-5]\d)(?![\d])/;

const slug = (text: string) => text.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "note";
const LATIN: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
/** A fact key part: lower-case Latin (Cyrillic transliterated), digits and dashes. */
const keySlug = (text: string) => [...text.toLowerCase().replace(/ё/g, "е")].map((char) => LATIN[char] ?? char).join("")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "note";
const fileStem = (path: string) => (path.split(/[\\/]/).pop() ?? path).replace(/\.md$/i, "");
const stripBullet = (line: string) => line.replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, "").trim();

function sections(text: string): Section[] {
  const out: Section[] = [];
  let current: Section = { heading: "", level: 0, body: [], anchor: "top" };
  const used = new Map<string, number>();
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = raw.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      out.push(current);
      const base = slug(heading[2]);
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      current = { heading: heading[2].trim(), level: heading[1].length, body: [], anchor: count > 1 ? `${base}-${count}` : base };
      continue;
    }
    current.body.push(raw);
  }
  out.push(current);
  return out.filter((section) => section.body.some((line) => line.trim()));
}

const MARKER_LINE = new RegExp(`^(?:${[SALIENCE.source, CUES.source.slice(1), STATE_MARKER.source.slice(1), "[★⭐]"].join("|")})`, "iu");
/** The items of a section, each one line: list items, quotes, marker lines, and the lines of a paragraph — a line
 * that ends a sentence ends its item; a line wrapped mid-sentence is joined to the next. */
function items(body: string[]): string[] {
  const out: string[] = [];
  let paragraph: string[] = [];
  const flush = () => { if (paragraph.length) out.push(paragraph.join(" ").replace(/\s+/g, " ").trim()); paragraph = []; };
  for (const raw of body) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (/^(?:[-*+•]|\d+[.)])\s+/.test(line) || line.startsWith(">") || MARKER_LINE.test(line)) { flush(); out.push(line); continue; }
    paragraph.push(line);
    if (/[.!?…:»”")]$/u.test(line)) flush();
  }
  flush();
  return out.filter(Boolean);
}

/** The moment a heading names: a day (or a period up to a month), with an optional HH:MM. */
function headingMoment(heading: string, now: Date): { at: string; rest: string } | null {
  const named = periodOf(heading, now);
  if (!named || Date.parse(named.period.to) - Date.parse(named.period.from) > 31 * 86_400_000) return null;
  let at = Date.parse(named.period.from);
  // The title keeps the heading's own case: the period's span is cut from the original text.
  let rest = `${heading.slice(0, named.index)} ${heading.slice(named.index + named.length)}`;
  const time = heading.match(TIME);
  if (time) { at += (Number(time[1]) * 60 + Number(time[2])) * 60_000; rest = rest.replace(TIME, " "); }
  if (at > now.getTime()) return null;
  return { at: new Date(at).toISOString(), rest: rest.replace(/^[\s—–:|.,-]+|[\s—–:|.,-]+$/g, "").replace(/\s+/g, " ").trim() };
}

function quoteOf(item: string): QuoteInput | null {
  const text = stripBullet(item);
  const block = text.match(/^>\s*(.+)$/);
  const body = block ? block[1].trim() : text;
  const whole = body.match(/^[«“"](.+?)[»”"]\s*(?:[—–-]\s*(.*))?$/u);
  if (!block && !whole) return null;
  const words = whole ? whole[1].trim() : body.replace(/\s*[—–-]\s*[^—–-]{1,30}$/u, "").trim();
  const attribution = whole ? (whole[2] ?? "") : (body.match(/[—–-]\s*([^—–-]{1,30})$/u)?.[1] ?? "");
  // An unattributed quote is someone's exact words, but not provably the owner's: it is never tagged stated.
  const speaker = OWNER_ATTRIBUTION.test(` ${attribution}`) ? "owner" : SELF_ATTRIBUTION.test(` ${attribution}`) ? "self" : "other";
  return { text: words.replace(/^[«“"]|[»”"]$/gu, "").trim(), speaker, tag: speaker === "owner" ? "stated" : "observed" };
}

const tagOf = (text: string): Tag => (HEDGE.test(text) ? "inferred" : "observed");
const quotesOwner = (text: string) => OWNER_SAYS.test(text) || (QUOTED.test(text) && /(?:^|[\s—–-])(?:he|owner|он|владелец)(?![\p{L}])/iu.test(text));

function derivedCues(title: string, lines: string[]): string[] {
  const cues: string[] = [];
  const push = (cue: string) => {
    const clean = cue.replace(/\s+/g, " ").replace(/^[\s«“"'(]+|[\s»”"'.,:;!?)]+$/gu, "").trim();
    if (clean.length >= 3 && clean.length <= 80 && !isDateCue(clean) && !cues.some((c) => c.toLowerCase() === clean.toLowerCase())) cues.push(clean);
  };
  if (title) push(title);
  for (const line of lines) for (const match of line.matchAll(/[«“"]([^«»“”"]{3,60})[»”"]/gu)) if (match[1].split(/\s+/).length <= 6) push(match[1]);
  for (const line of lines) for (const match of line.matchAll(/(?<=[\p{Ll}\d,;:]\s)(\p{Lu}[\p{L}-]{2,}(?:\s\p{Lu}[\p{L}-]{2,})?)/gu)) push(match[1]);
  if (!cues.length && lines[0]) push(lines[0].split(/\s+/).filter((word) => word.length > 3).slice(0, 4).join(" "));
  return cues.slice(0, 6);
}

function journalEpisode(section: Section, file: string, now: Date, warnings: string[]): PlannedEpisode | null {
  const moment = headingMoment(section.heading, now);
  if (!moment) { warnings.push(`${file}#${section.anchor}: no date in the heading «${section.heading.slice(0, 60)}» — not imported as an episode`); return null; }
  const derived: string[] = [];
  let salience: number | null = null;
  let cues: string[] = [];
  const lines: { text: string; tag: Tag }[] = [], state: { text: string; tag: Tag }[] = [], quotes: QuoteInput[] = [];
  for (const raw of items(section.body)) {
    const text = stripBullet(raw);
    const cueLine = text.match(CUES);
    if (cueLine) { cues = cueLine[1].split(/[,;·]/).map((cue) => cue.trim()).filter(Boolean); continue; }
    if (STARS.test(text)) { salience = [...text].length; continue; }
    const s = text.match(SALIENCE);
    if (s && text.length < 40) { salience = Number(s[1]); continue; }
    if (s) salience ??= Number(s[1]);
    const quote = quoteOf(raw);
    if (quote) {
      if (quotes.length < 5) quotes.push(quote);
      else lines.push({ text, tag: "observed" });
      continue;
    }
    // «He said "run it twice"»: the line stays as written, and the owner's exact words become a stated quote.
    const inline = text.match(QUOTED);
    if (inline && quotesOwner(text) && quotes.length < 5) quotes.push({ text: inline[1].trim(), speaker: "owner", tag: "stated" });
    // State lines are kept exactly, their marker («Pulled toward:», «Тянуло:») included.
    if (STATE_MARKER.test(text) || STATE_WORDS.test(text)) { state.push({ text, tag: tagOf(text) }); continue; }
    lines.push({ text, tag: tagOf(text) });
  }
  if (!lines.length && state.length) lines.push(...state.splice(0, 1));
  if (!lines.length) { warnings.push(`${file}#${section.anchor}: the entry has no text lines — not imported`); return null; }
  if (salience === null) { salience = 3; derived.push("salience 3 (the text names none)"); }
  cues = cues.filter((cue) => !isDateCue(cue));
  if (!cues.length) { cues = derivedCues(moment.rest, [...lines, ...state].map((line) => line.text)); derived.push(`cues derived from the text: ${cues.join(", ")}`); }
  // The import never writes a state the persona did not write: an absent state is recorded as absent.
  const stateLines = state.length ? state.map((line) => ({ ...line, author: "self" as const }))
    : [{ text: "(the source entry has no state line)", tag: "observed" as const, author: "background" as const }];
  if (!state.length) derived.push("no state line in the source (recorded as absent)");
  const register = [...lines, ...state].flatMap((line) => registerHits(line.text));
  return {
    input: { title: moment.rest.slice(0, 200), validFrom: moment.at, salience, cues, author: "self", source: `import:${file}#${section.anchor}`,
      lines: lines.map((line) => ({ ...line, author: "self" })), state: stateLines, quotes: quotes.map((quote) => ({ ...quote, author: "self" })) },
    derived, register,
  };
}

function dossierRules(section: Section, file: string): (DossierLineInput & { source: string })[] {
  return items(section.body).map(stripBullet).filter(Boolean).map((text) => ({
    section: "rules", text: text.replace(/\s+/g, " ").replace(/<!--|-->/g, "").slice(0, 600), author: "background",
    tag: quotesOwner(text) ? "stated" : "observed", source: `import:${file}#${section.anchor}`,
  }));
}

function factsOf(section: Section, file: string, prefix: string, now: Date, keys: Set<string>): (FactInput & { source: string })[] {
  const at = headingMoment(section.heading, now)?.at;
  const base = `${prefix}.${keySlug(section.heading || "notes")}`.slice(0, 64);
  return items(section.body).map(stripBullet).filter(Boolean).map((text, index) => {
    const label = text.match(/^\*{0,2}([^:*]{2,40}?)\*{0,2}\s*:\s+(.+)$/u);
    const first = label ? `${base}.${keySlug(label[1])}`.slice(0, 76) : `${base}.${index + 1}`;
    let key = first;
    for (let n = 2; keys.has(key); n++) key = `${first}-${n}`;
    keys.add(key);
    return { key, text: text.slice(0, 2000), tag: quotesOwner(text) ? "stated" : "observed", author: "background",
      ...(at ? { validFrom: at } : {}), source: `import:${file}#${section.anchor}` };
  });
}

/** The plan of an import: the journal's dated sections become episodes, «Rules» sections anywhere the dossier's first
 * lines, the time-sense note and the other area files facts. */
export function planImport(files: SourceFile[], now: Date): ImportPlan {
  const plan: ImportPlan = { episodes: [], facts: [], dossier: [], warnings: [] };
  const factKeys = new Set<string>();
  for (const file of files) {
    const stem = fileStem(file.path);
    const journal = /journal|дневник|журнал/i.test(stem);
    for (const section of sections(file.text)) {
      if (RULES_HEADING.test(` ${section.heading} `)) { plan.dossier.push(...dossierRules(section, file.path)); continue; }
      if (journal) {
        if (section.level <= 1 && !headingMoment(section.heading, now)) continue;
        const episode = journalEpisode(section, file.path, now, plan.warnings);
        if (episode) plan.episodes.push(episode);
        continue;
      }
      plan.facts.push(...factsOf(section, file.path, keySlug(stem), now, factKeys));
    }
  }
  return plan;
}

/** A short human-readable account of the plan — what a dry run prints. */
export function describePlan(plan: ImportPlan, preview = 90): string {
  const cut = (text: string) => (text.length > preview ? `${text.slice(0, preview)}…` : text);
  const out = [`Episodes: ${plan.episodes.length} · dossier lines: ${plan.dossier.length} · facts: ${plan.facts.length} · warnings: ${plan.warnings.length}`, ""];
  for (const { input, derived, register } of plan.episodes) {
    const lines = input.lines as { text: string; tag: string }[], quotes = input.quotes as { text: string; speaker: string; tag: string }[];
    out.push(`EPISODE ${String(input.validFrom).slice(0, 16).replace("T", " ")} «${input.title}» salience ${input.salience} · cues: ${(input.cues as string[]).join(", ")} · ${input.source}`,
      ...lines.map((line) => `  - [${line.tag} · self] ${cut(line.text)}`),
      ...(input.state as { text: string; tag: string; author: string }[]).map((line) => `  state [${line.tag} · ${line.author}] ${cut(line.text)}`),
      ...quotes.map((quote) => `  quote «${cut(quote.text)}» — ${quote.speaker} [${quote.tag}]`),
      ...derived.map((note) => `  (derived: ${note})`), ...(register.length ? [`  (register flagged: «${register.join("», «")}» — imported as written, with a note)`] : []));
  }
  for (const line of plan.dossier) out.push(`DOSSIER rules [${line.tag} · background] ${cut(String(line.text))} · ${line.source}`);
  for (const fact of plan.facts) out.push(`FACT ${fact.key} [${fact.tag} · background] ${cut(String(fact.text))}`);
  for (const warning of plan.warnings) out.push(`WARNING ${warning}`);
  return out.join("\n");
}

export type ImportSummary = { episodes: { written: number; skipped: number }; dossier: { written: number; skipped: number }; facts: { written: number; skipped: number }; errors: string[] };

/** Applies a plan. Re-runnable: an episode whose source section was imported before, a dossier line with the same
 * text, a fact whose open version says the same are skipped. A changed fact closes its older version. */
export async function applyImport(memory: PersonaMemory, plan: ImportPlan): Promise<ImportSummary> {
  const summary: ImportSummary = { episodes: { written: 0, skipped: 0 }, dossier: { written: 0, skipped: 0 }, facts: { written: 0, skipped: 0 }, errors: [] };
  const failed = (what: string, error: unknown) => {
    if (!(error instanceof PersonaMemoryError)) throw error;
    summary.errors.push(`${what}: ${error.problems.join("; ")}`);
  };
  const sources = new Set((await memory.store.episodes()).map((episode) => episode.source));
  for (const planned of plan.episodes) {
    if (sources.has(planned.input.source)) { summary.episodes.skipped++; continue; }
    try {
      const { episode, warnings } = await memory.remember(planned.input, { register: "flag" });
      if (warnings.length) await memory.addNote(episode.id, { author: "background", lines: [{ author: "background", tag: "observed",
        text: `Imported as written; the entry uses a farewell or longing register (${planned.register.map((hit) => `«${hit}»`).join(", ")}), which the notebook no longer uses.` }] });
      sources.add(planned.input.source);
      summary.episodes.written++;
    } catch (error) { failed(planned.input.source, error); }
  }
  const open = new Set((await memory.store.dossier()).filter((line) => line.validTo === null).map((line) => line.text));
  for (const line of plan.dossier) {
    if (open.has(String(line.text))) { summary.dossier.skipped++; continue; }
    try { await memory.dossierAppend([line], { author: "background" }); open.add(String(line.text)); summary.dossier.written++; } catch (error) { failed(line.source, error); }
  }
  for (const fact of plan.facts) {
    const current = (await memory.facts()).find((item) => item.key === fact.key);
    if (current && current.text === fact.text) { summary.facts.skipped++; continue; }
    try { await memory.factSet(current ? { ...fact, validFrom: undefined } : fact, { author: "background" }); summary.facts.written++; } catch (error) { failed(`${fact.source} (${fact.key})`, error); }
  }
  return summary;
}

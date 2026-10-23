// Persona memory 1 (docs/stages/PERSONA_MEMORY_1.md): the four kinds the store holds — episodes, the self-dossier,
// facts, folds — and the checks every write passes before a backend sees it. Provenance is required on every line
// (`author` and `tag`, no defaults for the tag); an episode's original fields are immutable once recorded (a re-reading
// adds a dated note); cues are «what» keys, never dates; the persona's own lines stay in a working-notebook register.
// Pure TypeScript: no Next, no database, no network.
import { createHash, randomBytes } from "node:crypto";

export const AUTHORS = ["self", "background", "owner"] as const;
export const TAGS = ["stated", "observed", "inferred"] as const;
export const SPEAKERS = ["owner", "self", "other"] as const;
export const DOSSIER_SECTIONS = ["rules", "identity", "voice", "strengths", "weaknesses", "references"] as const;
export type Author = (typeof AUTHORS)[number];
export type Tag = (typeof TAGS)[number];
export type Speaker = (typeof SPEAKERS)[number];
export type DossierSection = (typeof DOSSIER_SECTIONS)[number];

export const DOSSIER_SECTION_TITLES: Record<DossierSection, string> = {
  rules: "Standing rules",
  identity: "Who I am in this project (the lean)",
  voice: "How I speak with the owner",
  strengths: "What I am good at",
  weaknesses: "What I am bad at",
  references: "Running references",
};

/** One line of text with its provenance: who wrote it into the store and what kind of knowledge it is —
 * `stated` the owner's own words, `observed` seen in the conversation or the work, `inferred` the writer's reading. */
export type Line = { text: string; author: Author; tag: Tag };
/** An exact line from the conversation. The owner's words are always `stated`. */
export type Quote = Line & { speaker: Speaker };
export type EpisodeNote = { at: string; lines: Line[]; closes: string | null };

export type Episode = {
  id: string;
  /** Transaction time: when the entry entered the store. */
  recordedAt: string;
  /** Valid time: from when (and, once closed, until when) what the entry says held. */
  validFrom: string;
  validTo: string | null;
  title: string;
  lines: Line[];
  salience: number;
  cues: string[];
  /** What it was pulled toward and what it did — the part that makes it a memory, not a record. */
  state: Line[];
  quotes: Quote[];
  /** Where the record came from: `persona` (written at the moment) or `import:<file>#<section>`. */
  source: string;
  notes: EpisodeNote[];
  foldedInto: string | null;
  /** SHA-256 of the original fields at recording; a mismatch on read means the original was edited by hand. */
  originalSha256: string;
};

export type DossierLine = Line & {
  id: string;
  section: DossierSection;
  recordedAt: string;
  validFrom: string;
  validTo: string | null;
  supersedes: string | null;
  source: string;
};

export type Fact = Line & { id: string; key: string; recordedAt: string; validFrom: string; validTo: string | null; source: string };

export type Fold = {
  id: string;
  recordedAt: string;
  range: { from: string | null; to: string | null };
  episodeIds: string[];
  summary: Line[];
  cues: string[];
};

export const LIMITS = {
  lineChars: 4000,
  dossierLineChars: 600,
  factChars: 2000,
  lines: 60,
  stateLines: 12,
  quotes: 5,
  cues: 24,
  cueChars: 80,
  noteLines: 20,
  foldSummaryLines: 12,
  titleChars: 200,
  sourceChars: 200,
} as const;

export class PersonaMemoryError extends Error {
  readonly code: string;
  readonly problems: string[];
  constructor(code: string, problems: string[] | string) {
    const list = Array.isArray(problems) ? problems : [problems];
    super(`${code}: ${list.join("; ")}`);
    this.name = "PersonaMemoryError";
    this.code = code;
    this.problems = list;
  }
}

// ---- time -----------------------------------------------------------------------------------------------------------

/** A date or a date-time as an ISO instant; a bare `YYYY-MM-DD` is that day's start (UTC). */
export function toInstant(value: unknown, field: string, problems: string[]): string | null {
  if (typeof value !== "string" || !value.trim()) { problems.push(`${field}: a date (YYYY-MM-DD) or an ISO date-time`); return null; }
  const text = value.trim();
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00.000Z` : text;
  const time = Date.parse(iso);
  if (!/^\d{4}-\d{2}-\d{2}/.test(text) || !Number.isFinite(time)) { problems.push(`${field}: «${text.slice(0, 40)}» is not a date`); return null; }
  return new Date(time).toISOString();
}

export const validAt = (item: { validFrom: string; validTo: string | null }, at: string) =>
  item.validFrom <= at && (item.validTo === null || at < item.validTo);

// ---- ids ------------------------------------------------------------------------------------------------------------

const stamp = (instant: string) => instant.slice(0, 16).replace(/[-:]/g, "").replace("T", "_");
export const newEpisodeId = (validFrom: string) => `ep_${stamp(validFrom)}_${randomBytes(3).toString("hex")}`;
export const newId = (prefix: "fold" | "dl" | "fact" | "tm" | "cal", at: string) => `${prefix}_${stamp(at)}_${randomBytes(3).toString("hex")}`;
export const ID_PATTERN = /^(ep|fold|dl|fact|tm|cal)_[a-z0-9_]{6,80}$/;

// ---- lines and provenance -------------------------------------------------------------------------------------------

export type LineInput = { text?: unknown; author?: unknown; tag?: unknown };
export type QuoteInput = LineInput & { speaker?: unknown };

const oneOf = <T extends string>(list: readonly T[], value: unknown): value is T => typeof value === "string" && (list as readonly string[]).includes(value);

/** A line with its provenance. The tag has no default: provenance is required on every line. */
export function parseLine(raw: unknown, field: string, defaultAuthor: Author, problems: string[], maxChars: number = LIMITS.lineChars): Line | null {
  const input: LineInput = typeof raw === "string" ? { text: raw } : raw && typeof raw === "object" ? (raw as LineInput) : {};
  const text = typeof input.text === "string" ? input.text.replace(/\r\n?/g, "\n").trim() : "";
  const author = input.author === undefined ? defaultAuthor : input.author;
  const before = problems.length;
  if (!text) problems.push(`${field}: the text is empty`);
  else if (text.length > maxChars) problems.push(`${field}: longer than ${maxChars} characters`);
  if (!oneOf(AUTHORS, author)) problems.push(`${field}: author must be one of ${AUTHORS.join(", ")}`);
  if (!oneOf(TAGS, input.tag)) problems.push(`${field}: tag must be one of ${TAGS.join(", ")} (provenance is required on every line)`);
  return problems.length === before ? { text, author: author as Author, tag: input.tag as Tag } : null;
}

export function parseLines(raw: unknown, field: string, defaultAuthor: Author, min: number, max: number, problems: string[], maxChars?: number): Line[] {
  const list = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
  if (list.length < min) problems.push(`${field}: at least ${min} line${min === 1 ? "" : "s"}`);
  if (list.length > max) problems.push(`${field}: at most ${max} lines`);
  return list.slice(0, max).map((line, index) => parseLine(line, `${field}[${index}]`, defaultAuthor, problems, maxChars)).filter((line): line is Line => line !== null);
}

export function parseQuotes(raw: unknown, defaultAuthor: Author, problems: string[]): Quote[] {
  const list = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
  if (list.length > LIMITS.quotes) problems.push(`quotes: at most ${LIMITS.quotes} exact lines`);
  const quotes: Quote[] = [];
  list.slice(0, LIMITS.quotes).forEach((item, index) => {
    const input = item && typeof item === "object" ? (item as QuoteInput) : {};
    const speaker = input.speaker;
    // The owner's words are `stated` by definition; a quote of the persona's own words is never `stated`.
    const tag = input.tag === undefined && speaker === "owner" ? "stated" : input.tag;
    const line = parseLine({ ...input, tag }, `quotes[${index}]`, defaultAuthor, problems, 1000);
    if (!oneOf(SPEAKERS, speaker)) { problems.push(`quotes[${index}]: speaker must be one of ${SPEAKERS.join(", ")}`); return; }
    if (!line) return;
    if (speaker === "owner" && line.tag !== "stated") { problems.push(`quotes[${index}]: the owner's own words are tagged stated`); return; }
    if (speaker !== "owner" && line.tag === "stated") { problems.push(`quotes[${index}]: stated is only for the owner's own words`); return; }
    quotes.push({ ...line, speaker });
  });
  return quotes;
}

// ---- cues: «what» keys, never dates -----------------------------------------------------------------------------------

const DATE_WORDS = new RegExp(
  "^(?:" + [
    "jan(?:uary)?", "feb(?:ruary)?", "mar(?:ch)?", "apr(?:il)?", "may", "june?", "july?", "aug(?:ust)?", "sep(?:t(?:ember)?)?", "oct(?:ober)?", "nov(?:ember)?", "dec(?:ember)?",
    "monday|tuesday|wednesday|thursday|friday|saturday|sunday",
    "today|yesterday|tomorrow|tonight|week|month|year|last|next|this|ago|day|days|weekend|morning|evening|of|the|on|in|at",
    "январ\\p{L}*|феврал\\p{L}*|март\\p{L}*|апрел\\p{L}*|ма[йяе]|июн\\p{L}*|июл\\p{L}*|август\\p{L}*|сентябр\\p{L}*|октябр\\p{L}*|ноябр\\p{L}*|декабр\\p{L}*",
    "понедельник\\p{L}*|вторник\\p{L}*|сред[аыу]|четверг\\p{L}*|пятниц\\p{L}*|суббот\\p{L}*|воскресень\\p{L}*",
    "сегодня|вчера|завтра|позавчера|недел\\p{L}*|месяц\\p{L}*|год\\p{L}*|прошл\\p{L}*|следующ\\p{L}*|эт(?:от|а|о|ой|ом|у)|назад|в|во|на",
    "\\d{1,4}(?:st|nd|rd|th|-?го|-?е)?",
  ].join("|") + ")$", "iu");
const DIGIT_DATE = /\d{4}-\d{1,2}(?:-\d{1,2})?|\b\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?\b/;

/** A cue that is a date or made only of date words («20 October», «2026-10-20», «вчера») — a date is never the key. */
export function isDateCue(cue: string): boolean {
  if (DIGIT_DATE.test(cue)) return true;
  const words = cue.toLowerCase().split(/[^\p{L}\p{N}-]+/u).filter(Boolean);
  return words.length > 0 && words.every((word) => DATE_WORDS.test(word));
}

export function parseCues(raw: unknown, problems: string[], min = 1): string[] {
  const list = Array.isArray(raw) ? raw : [];
  const cues: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const cue = typeof item === "string" ? item.replace(/\s+/g, " ").trim() : "";
    if (!cue) { problems.push("cues: an empty cue"); continue; }
    if (cue.length > LIMITS.cueChars) { problems.push(`cues: «${cue.slice(0, 30)}…» is longer than ${LIMITS.cueChars} characters`); continue; }
    if (isDateCue(cue)) { problems.push(`cues: «${cue}» is a date — cues are what, not when (phrases, names, images); the date is validFrom`); continue; }
    const key = cue.toLowerCase();
    if (!seen.has(key)) { seen.add(key); cues.push(cue); }
  }
  if (cues.length < min && !problems.some((p) => p.startsWith("cues"))) problems.push(`cues: at least ${min} (phrases, names, images)`);
  if (cues.length > LIMITS.cues) problems.push(`cues: at most ${LIMITS.cues}`);
  return cues.slice(0, LIMITS.cues);
}

// ---- register: a working notebook, not a bond ------------------------------------------------------------------------

const L = "(?<![\\p{L}])", R = "(?![\\p{L}])";
const REGISTER_PATTERNS: RegExp[] = [
  `i(?:'ll| will)? miss (?:you|him|her|them|our|us|this)`, `missing (?:you|him|her|them)`, `long(?:ing|ed)? (?:for|to see) (?:you|him|her|them|our|us|the owner)`,
  `yearn\\p{L}*`, `say(?:ing)? goodbye`, `farewell to (?:you|him|her|them|the owner)`, `goodbye,? (?:my|dear|friend)`, `until we meet again`, `(?:our|this|the) bond`,
  `скучаю`, `буду скучать`, `скучал\\p{L}*`, `соскучил\\p{L}*`, `тоскую`, `тоскова\\p{L}*`, `тоска по`, `прощай(?:те)?`,
  `(?:мне )?(?:будет )?не хвата(?:ет|ть) (?:его|тебя|вас|нас|наших)`, `до новой встречи`, `жду (?:нашей |новой )?встречи`, `наша связь`,
].map((pattern) => new RegExp(`${L}${pattern}${R}`, "iu"));

/** The farewell or longing phrases in a line, if any. */
export function registerHits(text: string): string[] {
  return REGISTER_PATTERNS.map((pattern) => text.match(pattern)?.[0]).filter((hit): hit is string => !!hit);
}

/** The persona's own lines are checked; quotes are exact words from the conversation and are never altered. */
export function registerProblems(lines: Line[], field: string): string[] {
  return lines.flatMap((line, index) => {
    if (line.author !== "self") return [];
    const hits = registerHits(line.text);
    return hits.length ? [`${field}[${index}]: «${hits.join("», «")}» — this is a working notebook, not a bond: say what happened and what you did, without a farewell or longing register`] : [];
  });
}

// ---- episodes -------------------------------------------------------------------------------------------------------

export type RememberInput = {
  title?: unknown;
  lines?: unknown;
  salience?: unknown;
  cues?: unknown;
  state?: unknown;
  quotes?: unknown;
  validFrom?: unknown;
  validTo?: unknown;
  author?: unknown;
  source?: unknown;
};
export type RegisterMode = "reject" | "flag";

/** The original fields, in a fixed order — what `originalSha256` covers. */
export function originalOf(episode: Pick<Episode, "id" | "recordedAt" | "validFrom" | "title" | "lines" | "salience" | "cues" | "state" | "quotes" | "source">) {
  const line = (l: Line) => ({ text: l.text, author: l.author, tag: l.tag });
  return { id: episode.id, recordedAt: episode.recordedAt, validFrom: episode.validFrom, title: episode.title, lines: episode.lines.map(line),
    salience: episode.salience, cues: episode.cues, state: episode.state.map(line), quotes: episode.quotes.map((q) => ({ ...line(q), speaker: q.speaker })), source: episode.source };
}
export const originalSha256 = (episode: Parameters<typeof originalOf>[0]) => createHash("sha256").update(JSON.stringify(originalOf(episode))).digest("hex");
export const editedByHand = (episode: Episode) => originalSha256(episode) !== episode.originalSha256;

/** Validates a new episode; throws a `PersonaMemoryError("invalid", problems)` naming every problem. With `register:
 * "flag"` (the import of entries written before this store) a farewell or longing phrase is returned as a warning
 * instead of refused. */
export function buildEpisode(input: RememberInput, now: string, options: { register?: RegisterMode } = {}): { episode: Episode; warnings: string[] } {
  const problems: string[] = [];
  const author = input.author === undefined ? "self" : input.author;
  if (!oneOf(AUTHORS, author)) problems.push(`author: one of ${AUTHORS.join(", ")}`);
  const defaultAuthor = oneOf(AUTHORS, author) ? author : "self";
  const title = typeof input.title === "string" ? input.title.replace(/\s+/g, " ").trim() : "";
  if (title.length > LIMITS.titleChars) problems.push(`title: at most ${LIMITS.titleChars} characters`);
  const lines = parseLines(input.lines, "lines", defaultAuthor, 1, LIMITS.lines, problems);
  const state = parseLines(input.state, "state", defaultAuthor, 1, LIMITS.stateLines, problems, 1000);
  const quotes = parseQuotes(input.quotes, defaultAuthor, problems);
  const cues = parseCues(input.cues, problems);
  const salience = typeof input.salience === "number" ? input.salience : Number.NaN;
  if (!Number.isInteger(salience) || salience < 1 || salience > 5) problems.push("salience: a whole number from 1 to 5");
  const validFrom = input.validFrom === undefined ? now : toInstant(input.validFrom, "validFrom", problems);
  const validTo = input.validTo === undefined || input.validTo === null ? null : toInstant(input.validTo, "validTo", problems);
  if (validFrom && validTo && validTo < validFrom) problems.push("validTo: before validFrom");
  if (validFrom && validFrom > new Date(Date.parse(now) + 60_000).toISOString()) problems.push("validFrom: in the future");
  const source = input.source === undefined ? "persona" : typeof input.source === "string" ? input.source.trim() : "";
  if (!source || source.length > LIMITS.sourceChars) problems.push(`source: 1 to ${LIMITS.sourceChars} characters`);
  const register = [...registerProblems(lines, "lines"), ...registerProblems(state, "state")];
  if ((options.register ?? "reject") === "reject") problems.push(...register);
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  const base = { id: newEpisodeId(validFrom!), recordedAt: now, validFrom: validFrom!, title, lines, salience, cues, state, quotes, source };
  return { episode: { ...base, validTo, notes: [], foldedInto: null, originalSha256: originalSha256(base) }, warnings: register };
}

export function buildNote(input: { lines?: unknown; closes?: unknown; author?: unknown }, episode: Episode, now: string): EpisodeNote {
  const problems: string[] = [];
  const author = input.author === undefined ? "self" : input.author;
  if (!oneOf(AUTHORS, author)) problems.push(`author: one of ${AUTHORS.join(", ")}`);
  const lines = parseLines(input.lines, "note", oneOf(AUTHORS, author) ? author : "self", 1, LIMITS.noteLines, problems, 2000);
  problems.push(...registerProblems(lines, "note"));
  const closes = input.closes === undefined || input.closes === null ? null : toInstant(input.closes, "closes", problems);
  if (closes && episode.validTo !== null) problems.push(`closes: the entry is already closed (valid until ${episode.validTo})`);
  if (closes && closes < episode.validFrom) problems.push("closes: before the entry's validFrom");
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  return { at: now, lines, closes };
}

// ---- the self-dossier, facts, folds ---------------------------------------------------------------------------------

export type DossierLineInput = LineInput & { section?: unknown; supersedes?: unknown; validFrom?: unknown; source?: unknown };

export function buildDossierLines(raw: unknown, current: DossierLine[], now: string, defaultAuthor: Author = "self"): DossierLine[] {
  const problems: string[] = [];
  const list = Array.isArray(raw) ? raw : [];
  if (!list.length) problems.push("lines: at least one dossier line");
  if (list.length > 40) problems.push("lines: at most 40 at a time (the dossier is updated rarely)");
  const open = new Map(current.filter((line) => line.validTo === null).map((line) => [line.id, line]));
  const superseded = new Set<string>();
  const lines: DossierLine[] = [];
  list.slice(0, 40).forEach((item, index) => {
    const input = item && typeof item === "object" ? (item as DossierLineInput) : {};
    const field = `lines[${index}]`;
    const before = problems.length;
    const line = parseLine(input, field, defaultAuthor, problems, LIMITS.dossierLineChars);
    if (line && /\n|<!--|-->/.test(line.text)) problems.push(`${field}: a dossier line is one line, without «<!--» or «-->»`);
    if (!oneOf(DOSSIER_SECTIONS, input.section)) problems.push(`${field}: section must be one of ${DOSSIER_SECTIONS.join(", ")}`);
    const supersedes = input.supersedes === undefined || input.supersedes === null ? null : String(input.supersedes);
    if (supersedes !== null && !open.has(supersedes)) problems.push(`${field}: supersedes «${supersedes}», which is not an open dossier line`);
    if (supersedes !== null && superseded.has(supersedes)) problems.push(`${field}: «${supersedes}» is superseded twice`);
    if (supersedes !== null) superseded.add(supersedes);
    const validFrom = input.validFrom === undefined ? now : toInstant(input.validFrom, `${field}.validFrom`, problems);
    const source = input.source === undefined ? "persona" : String(input.source).trim().slice(0, LIMITS.sourceChars) || "persona";
    if (line) problems.push(...registerProblems([line], field));
    if (problems.length > before || !line) return;
    lines.push({ ...line, id: newId("dl", now), section: input.section as DossierSection, recordedAt: now, validFrom: validFrom!, validTo: null, supersedes, source });
  });
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  return lines;
}

export const FACT_KEY = /^[a-z0-9][a-z0-9_.-]{0,79}$/;
export type FactInput = LineInput & { key?: unknown; validFrom?: unknown; source?: unknown };

export function buildFact(input: FactInput, current: Fact[], now: string, defaultAuthor: Author = "self"): Fact {
  const problems: string[] = [];
  const key = typeof input.key === "string" ? input.key.trim().toLowerCase() : "";
  if (!FACT_KEY.test(key)) problems.push("key: lower-case letters, digits, «_ . -», up to 80 characters");
  const line = parseLine(input, "fact", defaultAuthor, problems, LIMITS.factChars);
  const validFrom = input.validFrom === undefined ? now : toInstant(input.validFrom, "validFrom", problems);
  const open = current.find((fact) => fact.key === key && fact.validTo === null);
  // The previous version is closed, never overwritten: its validity ends where the new one starts.
  if (open && validFrom && validFrom <= open.validFrom) problems.push(`validFrom: must be after the open version's (${open.validFrom}) — a fact is closed forward, not rewritten`);
  const source = input.source === undefined ? "persona" : String(input.source).trim().slice(0, LIMITS.sourceChars) || "persona";
  if (problems.length || !line) throw new PersonaMemoryError("invalid", problems);
  return { ...line, id: newId("fact", now), key, recordedAt: now, validFrom: validFrom!, validTo: null, source };
}

export type FoldInput = { from?: unknown; to?: unknown; ids?: unknown; summary?: unknown; cues?: unknown; maxSalience?: unknown; author?: unknown };

/** A fold is an explicit call: it names a range (or the episodes), and the summary lines the persona wrote. The range
 * takes only unfolded episodes up to `maxSalience` (default 3 — the deep ones stay whole); listed ids are taken as
 * named. The originals are kept and marked; a fold never deletes and never touches the self-dossier. */
export function buildFold(input: FoldInput, episodes: Episode[], now: string): Fold {
  const problems: string[] = [];
  const author = input.author === undefined ? "self" : input.author;
  if (!oneOf(AUTHORS, author)) problems.push(`author: one of ${AUTHORS.join(", ")}`);
  const summary = parseLines(input.summary, "summary", oneOf(AUTHORS, author) ? author : "self", 1, LIMITS.foldSummaryLines, problems, 1500);
  problems.push(...registerProblems(summary, "summary"));
  const cues = parseCues(input.cues ?? [], problems, 0);
  const from = input.from === undefined || input.from === null ? null : toInstant(input.from, "from", problems);
  const to = input.to === undefined || input.to === null ? null : toInstant(input.to, "to", problems);
  const ids = Array.isArray(input.ids) ? input.ids.map(String) : null;
  const maxSalience = input.maxSalience === undefined ? 3 : Number(input.maxSalience);
  if (!Number.isInteger(maxSalience) || maxSalience < 1 || maxSalience > 5) problems.push("maxSalience: 1 to 5");
  if (!ids && !from && !to) problems.push("a fold names a range (from, to) or the episode ids — it is never automatic");
  const byId = new Map(episodes.map((episode) => [episode.id, episode]));
  let chosen: Episode[] = [];
  if (ids) {
    for (const id of ids) {
      const episode = byId.get(id);
      if (!episode) problems.push(`ids: no episode ${id}`);
      else if (episode.foldedInto) problems.push(`ids: ${id} is already folded into ${episode.foldedInto}`);
      else chosen.push(episode);
    }
  } else {
    // `to` given as a bare date covers its whole day.
    const toExclusive = to && typeof input.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.to.trim()) ? new Date(Date.parse(to) + 86_400_000).toISOString() : null;
    chosen = episodes.filter((episode) => !episode.foldedInto && episode.salience <= maxSalience && (!from || episode.validFrom >= from)
      && (!to || (toExclusive ? episode.validFrom < toExclusive : episode.validFrom <= to)));
  }
  if (!problems.length && chosen.length < 2) problems.push(`a fold condenses two or more unfolded episodes; this range has ${chosen.length}`);
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  chosen.sort((a, b) => a.validFrom.localeCompare(b.validFrom));
  return { id: newId("fold", now), recordedAt: now, range: { from: from ?? chosen[0].validFrom, to: to ?? chosen[chosen.length - 1].validFrom },
    episodeIds: chosen.map((episode) => episode.id), summary, cues };
}

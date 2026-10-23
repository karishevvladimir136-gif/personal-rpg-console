// Persona memory 1: the plain-files backend — the store runs with no database. One JSON per episode and per fold, the
// self-dossier as a markdown file the owner can read and edit, the facts as one JSON list, and a cache of embeddings.
// Writes are atomic per file (a temporary file renamed into place) and serialized inside the process; a new episode
// never overwrites a file. Postgres is the backend for atomicity across files (a fold marks every episode or none).
//
//   <root>/episodes/<id>.json   <root>/folds/<id>.json   <root>/dossier.md   <root>/facts.json   <root>/cache/
//   <root>/timers.json   <root>/calibration.jsonl (persona memory 2: one row per line, only ever appended)
import { appendFile, mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { join } from "node:path";
import type { CalibrationRow, Timer } from "./clock.ts";
import { timerKey } from "./clock.ts";
import type { PersonaStore } from "./store.ts";
import { AUTHORS, DOSSIER_SECTIONS, DOSSIER_SECTION_TITLES, ID_PATTERN, PersonaMemoryError, TAGS,
  type DossierLine, type DossierSection, type Episode, type EpisodeNote, type Fact, type Fold } from "./schema.ts";

const DOSSIER_HEAD = `# Self-dossier

<!-- persona-memory dossier v1. One entry per list line: «- [tag · author] text» and a comment with its id and validity.
The text of a line may be edited by hand; keep the comment. A line you add by hand under a section («- text», no
comment) is read as yours: [stated · owner]. Lines are closed (superseded), never deleted by the tools. -->
`;
const DOSSIER_LINE = /^- \[(\w+) · (\w+)\] (.*?) <!-- (.*?) -->\s*$/;

export function renderDossierFile(lines: DossierLine[]): string {
  const out = [DOSSIER_HEAD];
  const meta = (line: DossierLine) => `<!-- id=${line.id} section=${line.section} recorded=${line.recordedAt} from=${line.validFrom} until=${line.validTo ?? "-"} supersedes=${line.supersedes ?? "-"} source=${encodeURIComponent(line.source)} -->`;
  const entry = (line: DossierLine) => `- [${line.tag} · ${line.author}] ${line.text} ${meta(line)}`;
  for (const section of DOSSIER_SECTIONS) {
    const open = lines.filter((line) => line.section === section && line.validTo === null);
    if (open.length) out.push(`## ${DOSSIER_SECTION_TITLES[section]}\n`, ...open.map(entry), "");
  }
  const closed = lines.filter((line) => line.validTo !== null);
  if (closed.length) out.push("## Closed lines (kept as history)\n", ...closed.map(entry), "");
  return `${out.join("\n").trimEnd()}\n`;
}

const SECTION_BY_TITLE = new Map(DOSSIER_SECTIONS.map((section) => [DOSSIER_SECTION_TITLES[section].toLowerCase(), section] as const));

/** The dossier file's lines. A plain «- text» line the owner added by hand under a section heading is the owner's own
 * (`stated · owner`), with an id from its text and the file's time — it gets its comment on the next write. */
export function parseDossierFile(text: string, fileTime = "1970-01-01T00:00:00.000Z"): DossierLine[] {
  const lines: DossierLine[] = [];
  let section: DossierSection | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const heading = raw.match(/^##\s+(.+?)\s*$/);
    if (heading) { section = SECTION_BY_TITLE.get(heading[1].toLowerCase()) ?? (DOSSIER_SECTIONS as readonly string[]).find((key) => heading[1].toLowerCase() === key) as DossierSection | undefined ?? null; continue; }
    const match = raw.match(DOSSIER_LINE);
    const plain = !match && section ? raw.match(/^- (?!\[(?:stated|observed|inferred) · )(.+?)\s*$/) : null;
    if (plain && !plain[1].includes("<!--")) {
      const id = `dl_owner_${createHash("sha256").update(`${section}\n${plain[1]}`).digest("hex").slice(0, 12)}`;
      if (!lines.some((line) => line.id === id)) lines.push({ id, section: section!, text: plain[1], author: "owner", tag: "stated", recordedAt: fileTime, validFrom: fileTime, validTo: null, supersedes: null, source: "owner:dossier.md" });
      continue;
    }
    if (!match) continue;
    const meta = Object.fromEntries(match[4].trim().split(/\s+/).map((pair) => { const at = pair.indexOf("="); return [pair.slice(0, at), pair.slice(at + 1)]; }));
    const [tag, author, text] = [match[1], match[2], match[3].trim()];
    if (!(TAGS as readonly string[]).includes(tag) || !(AUTHORS as readonly string[]).includes(author) || !ID_PATTERN.test(meta.id ?? "")
      || !(DOSSIER_SECTIONS as readonly string[]).includes(meta.section) || !text) continue;
    lines.push({ id: meta.id, section: meta.section as DossierSection, text, author: author as DossierLine["author"], tag: tag as DossierLine["tag"],
      recordedAt: meta.recorded, validFrom: meta.from, validTo: meta.until && meta.until !== "-" ? meta.until : null,
      supersedes: meta.supersedes && meta.supersedes !== "-" ? meta.supersedes : null, source: decodeURIComponent(meta.source ?? "persona") });
  }
  return lines;
}

const list = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
/** A file the owner edited by hand still reads: missing lists are empty, missing marks are null. */
function normalizeEpisode(raw: Partial<Episode>): Episode | null {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !ID_PATTERN.test(raw.id) || typeof raw.validFrom !== "string") return null;
  return { ...raw, id: raw.id, recordedAt: String(raw.recordedAt ?? raw.validFrom), validFrom: raw.validFrom, validTo: typeof raw.validTo === "string" ? raw.validTo : null,
    title: typeof raw.title === "string" ? raw.title : "", salience: Number.isInteger(raw.salience) ? raw.salience! : 3, cues: list<string>(raw.cues).map(String),
    lines: list(raw.lines), state: list(raw.state), quotes: list(raw.quotes), source: typeof raw.source === "string" ? raw.source : "owner", notes: list(raw.notes),
    foldedInto: typeof raw.foldedInto === "string" ? raw.foldedInto : null, originalSha256: typeof raw.originalSha256 === "string" ? raw.originalSha256 : "" };
}

/** A calibration line the owner edited by hand still reads (its checksum then shows the edit); one without the
 * numbers is unreadable. */
function normalizeRow(raw: Partial<CalibrationRow>): CalibrationRow | null {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !ID_PATTERN.test(raw.id) || typeof raw.predictedMinutes !== "number" || typeof raw.actualMinutes !== "number") return null;
  const text = (value: unknown) => (typeof value === "string" ? value : null);
  return { ...raw, id: raw.id, timerId: text(raw.timerId), name: text(raw.name) ?? "", text: text(raw.text) ?? "", author: raw.author ?? "owner", tag: raw.tag ?? "observed",
    startedAt: text(raw.startedAt), predictedFinish: text(raw.predictedFinish), actualFinish: text(raw.actualFinish), predictedMinutes: raw.predictedMinutes,
    actualMinutes: raw.actualMinutes, notes: list(raw.notes), recordedAt: text(raw.recordedAt) ?? "1970-01-01T00:00:00.000Z", source: text(raw.source) ?? "owner", sha256: text(raw.sha256) ?? "" };
}

const episodeFile = (episode: Episode) => ({
  id: episode.id, recordedAt: episode.recordedAt, validFrom: episode.validFrom, validTo: episode.validTo, title: episode.title,
  salience: episode.salience, cues: episode.cues, lines: episode.lines, state: episode.state, quotes: episode.quotes, source: episode.source,
  notes: episode.notes, foldedInto: episode.foldedInto, originalSha256: episode.originalSha256,
});

export function filesStore(root: string): PersonaStore & { root: string; unreadable: string[] } {
  const dirs = { episodes: join(root, "episodes"), folds: join(root, "folds"), cache: join(root, "cache") };
  const dossierPath = join(root, "dossier.md"), factsPath = join(root, "facts.json"), timersPath = join(root, "timers.json"), calibrationPath = join(root, "calibration.jsonl");
  let ready: Promise<void> | null = null;
  const prepare = () => (ready ??= Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true }))).then(() => undefined));
  let queue: Promise<unknown> = Promise.resolve();
  /** One operation at a time inside the process: reads see whole writes. */
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const run = queue.then(async () => { await prepare(); return work(); });
    queue = run.catch(() => undefined);
    return run;
  };
  const atomic = async (path: string, text: string) => {
    const temporary = `${path}.tmp-${process.pid}-${randomBytes(4).toString("hex")}`;
    await writeFile(temporary, text, "utf8");
    await rename(temporary, path);
  };
  const readJson = async <T>(path: string, fallback: T): Promise<T> => {
    try { return JSON.parse(await readFile(path, "utf8")) as T; } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
      throw new PersonaMemoryError("unreadable", `${path.slice(root.length + 1)} is not valid JSON`);
    }
  };
  const unreadable: string[] = [];
  const readEpisode = async (id: string) => {
    if (!ID_PATTERN.test(id)) throw new PersonaMemoryError("not_found", `no episode ${id}`);
    const episode = normalizeEpisode(await readJson<Partial<Episode>>(join(dirs.episodes, `${id}.json`), null as unknown as Partial<Episode>));
    if (!episode) throw new PersonaMemoryError("not_found", `no episode ${id}`);
    return episode;
  };
  const listJson = async <T>(dir: string, check: (value: T) => T | null = (value) => value): Promise<T[]> => {
    const folder = dir.slice(root.length + 1);
    // A file fixed by hand drops out of the list on the next read.
    for (let at = unreadable.length - 1; at >= 0; at--) if (unreadable[at].startsWith(`${folder}/`)) unreadable.splice(at, 1);
    const names = (await readdir(dir)).filter((name) => name.endsWith(".json")).sort();
    const items: T[] = [];
    for (const name of names) {
      let value: T | null = null;
      try { value = check(JSON.parse(await readFile(join(dir, name), "utf8")) as T); } catch { value = null; }
      if (value) items.push(value); else unreadable.push(`${folder}/${name}`);
    }
    return items;
  };
  const readDossier = async () => {
    try { return parseDossierFile(await readFile(dossierPath, "utf8"), (await stat(dossierPath)).mtime.toISOString()); } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  };
  const cachePath = (model: string) => join(dirs.cache, `embeddings-${model.replace(/[^a-z0-9.-]+/gi, "_")}.json`);
  const readRows = async () => {
    for (let at = unreadable.length - 1; at >= 0; at--) if (unreadable[at].startsWith("calibration.jsonl")) unreadable.splice(at, 1);
    let text = "";
    try { text = await readFile(calibrationPath, "utf8"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const rows: CalibrationRow[] = [];
    text.split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      let row: CalibrationRow | null = null;
      try { row = normalizeRow(JSON.parse(line)); } catch { row = null; }
      if (row) rows.push(row); else unreadable.push(`calibration.jsonl line ${index + 1}`);
    });
    return rows;
  };
  /** A row is only ever appended — after a newline, should a hand edit have left the last line without one. */
  const appendRow = async (row: CalibrationRow) => {
    let tail = "";
    try { tail = (await readFile(calibrationPath, "utf8")).slice(-1); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    await appendFile(calibrationPath, `${tail && tail !== "\n" ? "\n" : ""}${JSON.stringify(row)}\n`, "utf8");
  };
  /** The timers; one whose row is in the table is finished even if a crash came between the row and the timer's file. */
  const readTimers = async () => {
    const rows = new Map((await readRows()).filter((row) => row.timerId).map((row) => [row.timerId!, row]));
    return (await readJson<Timer[]>(timersPath, [])).map((timer) => (timer.finishedAt === null && rows.has(timer.id) ? { ...timer, finishedAt: rows.get(timer.id)!.actualFinish } : timer));
  };

  return {
    kind: "files",
    root,
    unreadable,
    insertEpisode: (episode) => serial(async () => {
      const path = join(dirs.episodes, `${episode.id}.json`);
      try { await writeFile(path, `${JSON.stringify(episodeFile(episode), null, 2)}\n`, { encoding: "utf8", flag: "wx" }); } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new PersonaMemoryError("conflict", `episode ${episode.id} exists`);
        throw error;
      }
    }),
    episodes: () => serial(() => listJson<Episode>(dirs.episodes, (value) => normalizeEpisode(value))),
    appendNote: (episodeId: string, note: EpisodeNote) => serial(async () => {
      const episode = await readEpisode(episodeId);
      if (note.closes && episode.validTo !== null) throw new PersonaMemoryError("conflict", `episode ${episodeId} is already closed`);
      const next = { ...episode, notes: [...(episode.notes ?? []), note], validTo: note.closes ?? episode.validTo };
      await atomic(join(dirs.episodes, `${episodeId}.json`), `${JSON.stringify(episodeFile(next), null, 2)}\n`);
      return next;
    }),
    insertFold: (fold: Fold) => serial(async () => {
      const episodes = await Promise.all(fold.episodeIds.map(readEpisode));
      const folded = episodes.filter((episode) => episode.foldedInto);
      if (folded.length) throw new PersonaMemoryError("conflict", `already folded: ${folded.map((episode) => episode.id).join(", ")}`);
      await writeFile(join(dirs.folds, `${fold.id}.json`), `${JSON.stringify(fold, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
      for (const episode of episodes) await atomic(join(dirs.episodes, `${episode.id}.json`), `${JSON.stringify(episodeFile({ ...episode, foldedInto: fold.id }), null, 2)}\n`);
    }),
    folds: () => serial(() => listJson<Fold>(dirs.folds)),
    dossier: () => serial(readDossier),
    appendDossier: (lines: DossierLine[]) => serial(async () => {
      const current = await readDossier();
      const byId = new Map(current.map((line) => [line.id, line]));
      for (const line of lines) {
        if (!line.supersedes) continue;
        const old = byId.get(line.supersedes);
        if (!old || old.validTo !== null) throw new PersonaMemoryError("conflict", `dossier line ${line.supersedes} is not open`);
        byId.set(old.id, { ...old, validTo: line.validFrom });
      }
      await atomic(dossierPath, renderDossierFile([...byId.values(), ...lines]));
    }),
    facts: () => serial(() => readJson<Fact[]>(factsPath, [])),
    setFact: (fact: Fact) => serial(async () => {
      const facts = await readJson<Fact[]>(factsPath, []);
      const next = facts.map((old) => (old.key === fact.key && old.validTo === null ? { ...old, validTo: fact.validFrom } : old));
      await atomic(factsPath, `${JSON.stringify([...next, fact], null, 2)}\n`);
    }),
    timers: () => serial(readTimers),
    insertTimer: (timer: Timer) => serial(async () => {
      const timers = await readTimers();
      if (timers.some((item) => item.id === timer.id || (item.finishedAt === null && timerKey(item.name) === timerKey(timer.name)))) throw new PersonaMemoryError("conflict", `a timer «${timer.name}» is already running`);
      await atomic(timersPath, `${JSON.stringify([...timers, timer], null, 2)}\n`);
    }),
    finishTimer: (timerId: string, finishedAt: string, row: CalibrationRow) => serial(async () => {
      const timers = await readTimers();
      const timer = timers.find((item) => item.id === timerId);
      if (!timer) throw new PersonaMemoryError("not_found", `no timer ${timerId}`);
      if (timer.finishedAt !== null || row.timerId !== timerId) throw new PersonaMemoryError("conflict", `timer ${timerId} is not running`);
      await appendRow(row);
      await atomic(timersPath, `${JSON.stringify(timers.map((item) => (item.id === timerId ? { ...item, finishedAt } : item)), null, 2)}\n`);
    }),
    calibration: () => serial(readRows),
    appendCalibration: (row: CalibrationRow) => serial(async () => {
      if ((await readRows()).some((item) => item.id === row.id)) throw new PersonaMemoryError("conflict", `row ${row.id} exists`);
      await appendRow(row);
    }),
    embeddingsGet: (model: string, keys: string[]) => serial(async () => {
      const cache = await readJson<Record<string, number[]>>(cachePath(model), {});
      return new Map(keys.filter((key) => Array.isArray(cache[key])).map((key) => [key, cache[key]]));
    }),
    embeddingsPut: (model: string, entries: { key: string; vector: number[] }[]) => serial(async () => {
      if (!entries.length) return;
      const cache = await readJson<Record<string, number[]>>(cachePath(model), {});
      for (const entry of entries) cache[entry.key] = entry.vector;
      await atomic(cachePath(model), JSON.stringify(cache));
    }),
  };
}

// Persona memory 1: the store's API — remember, recall, the journal, the self-dossier, notes, folds, facts, export.
// Ideas lifted from the DM's harness (Fix run after session 2, B2): validity windows instead of overwrites (a closed
// entry answers «what was true then»), a recall lookup by words, folds that condense without destroying (the DM's
// `note-fold.ts`, here explicit and keeping the originals), and budgets in estimated tokens that name what they drop
// (`context.ts` `withinBudget`). The standing rules head the dossier and are never budget-dropped, as the DM's hidden
// layer is never dropped. Persona memory 2 adds the clock (clock.ts): the time on the owner's clock with its context,
// timers that hold an estimate, and the calibration table that every finished timer appends to.
import { createHash } from "node:crypto";
import {
  buildSeedRow, buildTimer, calibrationMarkdown, calibrationSummary, checkTimeZone, clockView, finishTimer, hostTimeZone, timerKey, timerStatus,
  type CalibrationRow, type SeedInput, type TimerFinishInput, type TimerStartInput, type TimerStatus,
} from "./clock.ts";
import { estimateTokens } from "../gameplay/dm-loop/tokens.ts";
import { cosine, localEmbedder, type Embedder } from "./embed.ts";
import { exportMarkdown, type ExportedStore } from "./export.ts";
import {
  buildDossierLines, buildEpisode, buildFact, buildFold, buildNote, DOSSIER_SECTIONS, DOSSIER_SECTION_TITLES, editedByHand, PersonaMemoryError,
  toInstant, validAt, type Author, type DossierLine, type Episode, type Fact, type FactInput, type Fold, type FoldInput, type Line,
  type RegisterMode, type RememberInput,
} from "./schema.ts";
import type { PersonaStore } from "./store.ts";
import { periodOf, stem, stemHits, words, type Period } from "./text.ts";

export type RecallOptions = { k?: number; asOf?: string; includeFolded?: boolean };
export type RecallHit = { episode: Episode & { editedByHand: boolean }; score: number; why: { cue: number; keyword: number; embedding: number }; fold: Fold | null };
export type RecallResult = { query: string; period: Period | null; asOf: string | null; episodes: RecallHit[]; facts: Fact[]; folds: Fold[] };
export type DossierView = { asOf: string; text: string; lines: DossierLine[]; dropped: { id: string; section: string }[]; usedTokens: number; budgetTokens: number };

/** Recall weights: cues are the «what» keys and weigh most; salience lifts a hit by at most a quarter. The local
 * embedder's similarity is lexical, so alone it must be high (≥ 0.5) to count; a provider's semantic similarity counts
 * from about 0.3 (`minRelevance` 0.09). */
export const RECALL_WEIGHTS = { cue: 0.4, keyword: 0.3, embedding: 0.3, minRelevance: 0.15, minRelevanceProvider: 0.09, foldedFactor: 0.6 } as const;
export const DOSSIER_BUDGET_TOKENS = 4000;

const episodeText = (episode: Episode) => [episode.title, ...episode.lines.map((l) => l.text), ...episode.state.map((l) => l.text),
  ...episode.quotes.map((q) => q.text), ...episode.cues, ...episode.notes.flatMap((note) => note.lines.map((l) => l.text))].join("\n");
const round = (value: number) => Math.round(value * 1000) / 1000;
const sha = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 32);
const day = (instant: string) => instant.slice(0, 10);

export function createPersonaMemory(options: { store: PersonaStore; embedder?: Embedder; now?: () => Date; minRelevance?: number; timeZone?: string }) {
  const { store } = options;
  /** The owner's zone: wall-clock times are read and shown in it (PERSONA_MEMORY_TIMEZONE; the machine's zone by default). */
  const timeZone = checkTimeZone(options.timeZone || hostTimeZone());
  const embedder = options.embedder ?? localEmbedder();
  const minRelevance = options.minRelevance ?? (embedder.model.startsWith("local-") ? RECALL_WEIGHTS.minRelevance : RECALL_WEIGHTS.minRelevanceProvider);
  const clock = options.now ?? (() => new Date());
  const nowIso = () => clock().toISOString();
  const instant = (value: string | undefined, field: string) => {
    if (value === undefined) return null;
    const problems: string[] = [];
    const at = toInstant(value, field, problems);
    if (problems.length) throw new PersonaMemoryError("invalid", problems);
    return at;
  };

  /** Vectors of the episodes, cached by the store per model and content (the local embedder is computed in place). */
  async function vectors(items: Episode[]): Promise<Map<string, number[]>> {
    const texts = new Map(items.map((episode) => [episode.id, episodeText(episode)]));
    if (embedder.model.startsWith("local-")) {
      const computed = await embedder.embed([...texts.values()]);
      return new Map([...texts.keys()].map((id, index) => [id, computed[index]]));
    }
    const keyOf = new Map([...texts].map(([id, text]) => [id, sha(text)]));
    const cached = await store.embeddingsGet(embedder.model, [...new Set(keyOf.values())]);
    const missing = [...texts.keys()].filter((id) => !cached.has(keyOf.get(id)!));
    if (missing.length) {
      const fresh = await embedder.embed(missing.map((id) => texts.get(id)!));
      const entries = missing.map((id, index) => ({ key: keyOf.get(id)!, vector: fresh[index] }));
      await store.embeddingsPut(embedder.model, entries);
      entries.forEach((entry) => cached.set(entry.key, entry.vector));
    }
    return new Map([...keyOf].map(([id, key]) => [id, cached.get(key)!]));
  }

  return {
    store,
    embedder,
    timeZone,

    /** Writes an episode at the moment. Throws `invalid` with every problem named. */
    async remember(input: RememberInput, opts: { register?: RegisterMode } = {}) {
      const { episode, warnings } = buildEpisode(input, nowIso(), opts);
      await store.insertEpisode(episode);
      return { episode, warnings };
    },

    /** Hybrid recall: cue and keyword match, embedding similarity and salience; a period named in the query keeps the
     * episodes that began in it; `asOf` keeps what was valid then (and the facts valid then). */
    async recall(query: string, opts: RecallOptions = {}): Promise<RecallResult> {
      const k = Math.max(1, Math.min(20, Math.floor(opts.k ?? 5)));
      const asOf = instant(opts.asOf, "asOf");
      const named = periodOf(query, clock());
      const terms = words(named ? named.rest : query);
      const stems = [...new Set(terms.map(stem))];
      const [allEpisodes, folds, facts] = await Promise.all([store.episodes(), store.folds(), store.facts()]);
      const foldById = new Map(folds.map((fold) => [fold.id, fold]));
      const candidates = allEpisodes.filter((episode) => (!asOf || validAt(episode, asOf))
        && (!named || (episode.validFrom >= named.period.from && episode.validFrom < named.period.to))
        && (opts.includeFolded !== false || !episode.foldedInto));
      const queryVector = stems.length ? (await embedder.embed([named ? named.rest : query]))[0] : null;
      const episodeVectors = queryVector && candidates.length ? await vectors(candidates) : new Map<string, number[]>();
      const keywordScore = (textWords: Set<string>) => (stems.length ? stems.filter((s) => stemHits(s, textWords)).length / stems.length : 0);

      const hits: RecallHit[] = candidates.map((episode) => {
        const textWords = new Set(words(episodeText(episode)));
        const cue = stems.length ? Math.max(0, ...episode.cues.map((c) => {
          const cueStems = [...new Set(words(c).map(stem))];
          return cueStems.length ? cueStems.filter((s) => stemHits(s, terms)).length / cueStems.length : 0;
        })) : 0;
        const keyword = keywordScore(textWords);
        const embedding = queryVector ? Math.max(0, cosine(queryVector, episodeVectors.get(episode.id) ?? [])) : 0;
        const relevance = stems.length ? RECALL_WEIGHTS.cue * cue + RECALL_WEIGHTS.keyword * keyword + RECALL_WEIGHTS.embedding * embedding : 1;
        const score = relevance * (0.8 + 0.05 * episode.salience) * (episode.foldedInto ? RECALL_WEIGHTS.foldedFactor : 1);
        return { episode: { ...episode, editedByHand: editedByHand(episode) }, score: round(score), why: { cue: round(cue), keyword: round(keyword), embedding: round(embedding) },
          fold: episode.foldedInto ? foldById.get(episode.foldedInto) ?? null : null, relevance };
      }).filter((hit) => !stems.length || hit.relevance >= minRelevance)
        .sort((a, b) => b.score - a.score || b.episode.validFrom.localeCompare(a.episode.validFrom))
        .slice(0, k)
        .map(({ relevance: _relevance, ...hit }) => { void _relevance; return hit; });

      const factAt = asOf ?? nowIso();
      const factHits = stems.length ? facts.filter((fact) => validAt(fact, factAt))
        .map((fact) => ({ fact, score: keywordScore(new Set(words(`${fact.key.replace(/[_.-]+/g, " ")} ${fact.text}`))) }))
        .filter((hit) => hit.score >= 0.5).sort((a, b) => b.score - a.score).slice(0, k).map((hit) => hit.fact) : [];
      const foldHits = stems.length ? folds.map((fold) => ({ fold, score: keywordScore(new Set(words([...fold.summary.map((l) => l.text), ...fold.cues].join(" ")))) }))
        .filter((hit) => hit.score >= 0.5).sort((a, b) => b.score - a.score).slice(0, k).map((hit) => hit.fold) : [];
      return { query, period: named?.period ?? null, asOf, episodes: hits, facts: factHits, folds: foldHits };
    },

    /** The latest entries by their moment (`validFrom`), newest first. */
    async journalLatest(n = 1) {
      const count = Math.max(1, Math.min(50, Math.floor(n)));
      const episodes = await store.episodes();
      return episodes.sort((a, b) => b.validFrom.localeCompare(a.validFrom) || b.recordedAt.localeCompare(a.recordedAt)).slice(0, count)
        .map((episode) => ({ ...episode, editedByHand: editedByHand(episode) }));
    },

    /** The dossier valid at `asOf` (now by default) within a token budget: the standing rules are never dropped; then
     * identity, voice, strengths, weaknesses, references — newest first within a section. What a budget drops is named. */
    async dossierRead(opts: { asOf?: string; budgetTokens?: number } = {}): Promise<DossierView> {
      const at = instant(opts.asOf, "asOf") ?? nowIso();
      const budget = Math.max(200, Math.floor(opts.budgetTokens ?? DOSSIER_BUDGET_TOKENS));
      const current = (await store.dossier()).filter((line) => validAt(line, at));
      const entry = (line: DossierLine) => `- [${line.tag} · ${line.author}] ${line.text} (since ${day(line.validFrom)}; ${line.id})`;
      const kept: DossierLine[] = [], dropped: { id: string; section: string }[] = [];
      let used = 0;
      for (const section of DOSSIER_SECTIONS) {
        for (const line of current.filter((l) => l.section === section).sort((a, b) => b.validFrom.localeCompare(a.validFrom))) {
          const cost = estimateTokens(entry(line)) + 1;
          if (section !== "rules" && used + cost > budget) { dropped.push({ id: line.id, section }); continue; }
          kept.push(line); used += cost;
        }
      }
      const text = [`# Self-dossier (as of ${day(at)})`, ...DOSSIER_SECTIONS.flatMap((section) => {
        const lines = kept.filter((line) => line.section === section).sort((a, b) => a.validFrom.localeCompare(b.validFrom));
        return lines.length ? [`\n## ${DOSSIER_SECTION_TITLES[section]}`, ...lines.map(entry)] : [];
      }), ...(dropped.length ? [`\n[${dropped.length} older line(s) left out by the ${budget}-token budget: ${dropped.map((d) => d.id).join(", ")}]`] : [])].join("\n");
      return { asOf: at, text: kept.length ? text : `${text}\n\n(The dossier is empty.)`, lines: kept, dropped, usedTokens: used, budgetTokens: budget };
    },

    /** Appends dossier lines (rarely; by the persona). A line may supersede an open one, which is closed, not deleted. */
    async dossierAppend(lines: unknown, opts: { author?: Author } = {}) {
      const built = buildDossierLines(lines, await store.dossier(), nowIso(), opts.author ?? "self");
      await store.appendDossier(built);
      return built;
    },

    /** A dated re-reading note on an episode; the original text never changes. A note may close the entry's validity. */
    async addNote(episodeId: string, note: { lines?: unknown; closes?: unknown; author?: unknown }) {
      const episode = (await store.episodes()).find((item) => item.id === episodeId);
      if (!episode) throw new PersonaMemoryError("not_found", `no episode ${episodeId}`);
      return store.appendNote(episodeId, buildNote(note, episode, nowIso()));
    },

    /** An explicit fold (never automatic): the record of which episodes the summary condenses; originals kept. */
    async fold(input: FoldInput) {
      const fold = buildFold(input, await store.episodes(), nowIso());
      await store.insertFold(fold);
      return fold;
    },

    async factSet(input: FactInput, opts: { author?: Author } = {}) {
      const fact = buildFact(input, await store.facts(), nowIso(), opts.author ?? "self");
      await store.setFact(fact);
      return fact;
    },

    /** The facts valid at `asOf` (now by default); `all` returns every version with its validity. */
    async facts(opts: { asOf?: string; all?: boolean } = {}) {
      const at = instant(opts.asOf, "asOf") ?? nowIso();
      const facts = (await store.facts()).sort((a, b) => a.key.localeCompare(b.key) || a.validFrom.localeCompare(b.validFrom));
      return opts.all ? facts : facts.filter((fact) => validAt(fact, at));
    },

    /** The time on the owner's clock and its context: since the last entry, the last session (sessions are read from the
     * store's write times), the running timers, the calibration so far. Reads only. */
    async now() {
      const [episodes, dossier, facts, folds, timers, calibration] = await Promise.all([store.episodes(), store.dossier(), store.facts(), store.folds(), store.timers(), store.calibration()]);
      const latest = [...episodes].sort((a, b) => b.validFrom.localeCompare(a.validFrom) || b.recordedAt.localeCompare(a.recordedAt))[0] ?? null;
      const writes = [...episodes.flatMap((episode) => [episode.recordedAt, ...episode.notes.map((note) => note.at)]), ...dossier.map((line) => line.recordedAt),
        ...facts.map((fact) => fact.recordedAt), ...folds.map((fold) => fold.recordedAt), ...timers.map((timer) => timer.recordedAt), ...calibration.map((row) => row.recordedAt)];
      return clockView({ nowMs: clock().getTime(), zone: timeZone, latestEntry: latest, writes, timers, calibration });
    },

    /** Starts a timer now with the estimate (a finish time on the owner's clock, or a duration). */
    async timerStart(input: TimerStartInput) {
      const timer = buildTimer(input, await store.timers(), nowIso(), timeZone);
      await store.insertTimer(timer);
      return timerStatus(timer, clock().getTime(), timeZone);
    },

    /** Elapsed against the prediction: the named timer (running, or the row it left when it finished), or every running one. */
    async timerCheck(name?: string): Promise<{ running: TimerStatus[]; finished: CalibrationRow | null }> {
      const [timers, nowMs] = [await store.timers(), clock().getTime()];
      const running = timers.filter((timer) => timer.finishedAt === null);
      if (name === undefined || !name.trim()) return { running: running.map((timer) => timerStatus(timer, nowMs, timeZone)), finished: null };
      const match = running.find((timer) => timerKey(timer.name) === timerKey(name));
      if (match) return { running: [timerStatus(match, nowMs, timeZone)], finished: null };
      const last = timers.filter((timer) => timer.finishedAt !== null && timerKey(timer.name) === timerKey(name)).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
      const row = last ? (await store.calibration()).find((item) => item.timerId === last.id) ?? null : null;
      if (!row) throw new PersonaMemoryError("not_found", `no timer «${name.trim()}»${running.length ? ` (running: ${running.map((timer) => `«${timer.name}»`).join(", ")})` : " (no timer is running)"}`);
      return { running: [], finished: row };
    },

    /** Finishes the running timer: the row «predicted vs actual» goes into the calibration table. A finish without a start
     * is refused. */
    async timerFinish(input: TimerFinishInput) {
      const { timer, row } = finishTimer(input, await store.timers(), nowIso(), timeZone);
      await store.finishTimer(timer.id, timer.finishedAt!, row);
      return { timer, row, summary: calibrationSummary(await store.calibration()) };
    },

    /** The calibration table — every timed estimate, never edited — with its summary and the running timers. */
    async calibrationRead() {
      const [rows, timers] = await Promise.all([store.calibration(), store.timers()]);
      const running = timers.filter((timer) => timer.finishedAt === null);
      return { rows, summary: calibrationSummary(rows), text: calibrationMarkdown(rows, timeZone, running, clock().getTime()) };
    },

    /** A row from the owner's own notes (the import): a prediction and an actual both written there. */
    async calibrationSeed(input: SeedInput) {
      const row = buildSeedRow(input, nowIso());
      await store.appendCalibration(row);
      return row;
    },

    /** The whole store as markdown files (and as one document) — owner-visible at all times. */
    async exportMarkdown(): Promise<ExportedStore> {
      const [episodes, dossier, facts, folds, timers, calibration] = await Promise.all([store.episodes(), store.dossier(), store.facts(), store.folds(), store.timers(), store.calibration()]);
      return exportMarkdown({ episodes, dossier, facts, folds, timers, calibration, timeZone, at: nowIso(), unreadable: "unreadable" in store ? (store as { unreadable: string[] }).unreadable : [] });
    },
  };
}

export type PersonaMemory = ReturnType<typeof createPersonaMemory>;
export type { Line };

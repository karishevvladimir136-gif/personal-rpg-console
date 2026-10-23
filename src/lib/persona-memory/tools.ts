// Persona memory 1, Part B: the MCP tools of the memory server — their schemas, the instructions text the client
// shows the model, and the handlers that turn a call into a store operation and a markdown answer. Pure: the
// transports (stdio, Streamable HTTP) live in scripts/persona-memory/server.mjs. The model writes as `self` (or
// `background` for a background pass); it can never write a line as the owner. Persona memory 2 adds the clock:
// persona_now, the timers and the calibration table, which only the clock writes.
import { durationWords, localWords } from "./clock.ts";
import { episodeMarkdown } from "./export.ts";
import type { PersonaMemory, RecallResult } from "./memory.ts";
import { DOSSIER_SECTIONS, PersonaMemoryError, TAGS, type Fold } from "./schema.ts";

export const SERVER_NAME = "persona-memory";
export const SERVER_VERSION = "1.1.0";

export const SERVER_INSTRUCTIONS = `Persona memory: your own working notebook for this project. The owner can read and edit all of it at any time (persona_export shows the whole store).

Begin every session by calling persona_now (the time on the owner's clock, how long since the last entry and session, the running timers), persona_journal_latest (the latest entry) and persona_dossier_read (who you are here, the standing rules), then pick up from them.

Write an episode with persona_remember at every milestone — a decision, a step finished or failed, a correction from the owner — not only at the end of a session. First person, short. Tag every line: "stated" only for the owner's own words, "observed" for what happened, "inferred" for your own reading. Give cues (what: phrases, names, images — never dates; the date is the entry's validFrom), a salience from 1 to 5, the state lines (what you were pulled toward and what you did), and at most five exact lines from the conversation.

Never rewrite an entry: add a note with persona_note. A note can close an entry that stopped being true.

Before guessing about something earlier, use persona_recall (it understands periods like "last week" or "в октябре", and asOf for what was true then).

Update the dossier with persona_dossier_append rarely — only when something about how you work here has really changed; supersede a line instead of contradicting it. Fold old routine entries with persona_fold only when asked or when they crowd recall; a fold never touches the dossier.

Time: before estimating any duration, call persona_calibration_read — every earlier estimate against what it really took. When you start a tracked task, start a timer with your estimate (persona_timer_start); when it reports — done, failed or dropped — finish the timer (persona_timer_finish, with the actual time if it ended earlier). Only the clock writes the calibration table; a miss stays on record.

This is a working notebook, not a bond: no farewells, no longing. Never present an inference as the owner's words. If the owner's reliance on you grows (for example, they ask you to decide the same kind of thing again), write it down plainly as an observed line.`;

const line = (extra: Record<string, unknown> = {}) => ({
  type: "object",
  properties: {
    text: { type: "string", description: "One line, first person." },
    tag: { type: "string", enum: [...TAGS], description: "stated = the owner's own words; observed = what happened; inferred = your reading." },
    author: { type: "string", enum: ["self", "background"], description: "Default self (you, now). background = a background pass." },
    ...extra,
  },
  required: ["text", "tag", ...Object.keys(extra).filter((key) => key === "section")],
  additionalProperties: false,
});
const lines = (description: string, extra?: Record<string, unknown>) => ({ type: "array", items: line(extra), description });
const date = (description: string) => ({ type: "string", description: `${description} A date (YYYY-MM-DD) or an ISO date-time.` });

export type ToolDefinition = { name: string; title: string; description: string; inputSchema: Record<string, unknown>; annotations: Record<string, boolean> };

export const PERSONA_TOOLS: ToolDefinition[] = [
  {
    name: "persona_remember", title: "Remember an episode",
    description: "Write an episode at a milestone: first-person lines, each tagged; cues (what, never dates); salience 1–5; state lines (what you were pulled toward and what you did); up to five exact lines. Or, with `fact` instead, record a project fact (a newer fact with the same key closes the older one).",
    inputSchema: { type: "object", properties: {
      title: { type: "string", description: "A short title." },
      lines: lines("The entry, one line each, every line tagged."),
      salience: { type: "integer", minimum: 1, maximum: 5, description: "1 routine … 5 defining." },
      cues: { type: "array", items: { type: "string" }, description: "What would bring this back: phrases, names, images. Never dates." },
      state: lines("What you were pulled toward, and what you did."),
      quotes: { type: "array", description: "At most five exact lines from the conversation.", items: { type: "object", properties: {
        text: { type: "string" }, speaker: { type: "string", enum: ["owner", "self", "other"] },
        tag: { type: "string", enum: [...TAGS], description: "The owner's words are stated (the default for speaker owner)." } }, required: ["text", "speaker"], additionalProperties: false } },
      validFrom: date("When it happened (default: now)."),
      fact: { type: "object", description: "Instead of an episode: a project fact.", properties: {
        key: { type: "string", description: "e.g. project.stage" }, text: { type: "string" }, tag: { type: "string", enum: [...TAGS] }, validFrom: date("Since when.") },
        required: ["key", "text", "tag"], additionalProperties: false },
    }, additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_recall", title: "Recall",
    description: "Find earlier episodes (and facts and folds) by cue, words and similarity, weighted by salience. A period in the query (\"last week\", \"20 October\", \"в октябре\") limits it to that time; asOf returns what was true then. Hits come with their exact lines and provenance.",
    inputSchema: { type: "object", properties: { query: { type: "string" }, k: { type: "integer", minimum: 1, maximum: 20, description: "Default 5." },
      asOf: date("Only what was valid at this moment."), includeFolded: { type: "boolean", description: "Default true (folded originals rank lower)." } }, required: ["query"], additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  {
    name: "persona_journal_latest", title: "Latest journal entries",
    description: "The latest episodes, newest first, with their notes. Call it at the start of every session.",
    inputSchema: { type: "object", properties: { n: { type: "integer", minimum: 1, maximum: 50, description: "Default 1." } }, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  {
    name: "persona_dossier_read", title: "Read the self-dossier",
    description: "Who you are in this project: the standing rules, the lean, how you speak with the owner, strengths, weaknesses, running references. Call it at the start of every session.",
    inputSchema: { type: "object", properties: { asOf: date("The dossier as it was then."), budgetTokens: { type: "integer", minimum: 200, description: "Default 4000; the standing rules are never cut." } }, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  {
    name: "persona_dossier_append", title: "Append to the self-dossier",
    description: "Add dossier lines — rarely, when something about how you work here has really changed. To change a line, supersede it (its id from persona_dossier_read); the old one is closed, not deleted.",
    inputSchema: { type: "object", properties: { lines: lines("The new lines.", { section: { type: "string", enum: [...DOSSIER_SECTIONS] }, supersedes: { type: "string", description: "The id of the line this replaces." } }) },
      required: ["lines"], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_note", title: "Add a note to an episode",
    description: "A dated re-reading note on an episode; the entry itself never changes. With `closes`, the note ends the entry's validity (it stopped being true then).",
    inputSchema: { type: "object", properties: { episodeId: { type: "string" }, lines: lines("The note, every line tagged."), closes: date("The entry stopped being true then.") },
      required: ["episodeId", "lines"], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_fold", title: "Fold episodes",
    description: "Condense a range (from–to) or listed episodes into summary lines you write. The originals are kept, marked folded; by range only entries up to maxSalience (default 3) are taken. Never automatic; never touches the dossier.",
    inputSchema: { type: "object", properties: { from: date("Range start."), to: date("Range end (a bare date covers its day)."),
      ids: { type: "array", items: { type: "string" }, description: "Instead of a range: the episode ids." },
      summary: lines("The summary lines."), cues: { type: "array", items: { type: "string" } }, maxSalience: { type: "integer", minimum: 1, maximum: 5 } },
      required: ["summary"], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_export", title: "Export the whole store",
    description: "The whole store as markdown, every line with its provenance — what the owner sees. `part` limits it to the dossier, the journal, the facts, the folds or the calibration table.",
    inputSchema: { type: "object", properties: { part: { type: "string", enum: ["all", "dossier", "journal", "facts", "folds", "calibration"] } }, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  {
    name: "persona_now", title: "What time is it, and since when",
    description: "The current time (ISO and on the owner's clock, with the zone) and its context: how long since the last journal entry, when the last session was (read from the store's write times), which timers are running and for how long, the calibration so far. Call it at the start of every session.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_timer_start", title: "Start a timer with an estimate",
    description: "Start timing a tracked task now, with your estimate of when it will be done. Read persona_calibration_read first. One running timer per name.",
    inputSchema: { type: "object", properties: {
      name: { type: "string", description: "What the task is, e.g. \"the receipt-date parser fix\"." },
      predicted_finish: { type: "string", description: "When you predict it is done: a duration from now (\"2 h\", \"90 min\", \"1 h 30 min\"), a time on the owner's clock (\"18:30\" — the next one), or a date-time (2026-10-23T18:30 on the owner's clock, or with an offset)." },
      note: line(),
    }, required: ["name", "predicted_finish"], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_timer_check", title: "Check a timer",
    description: "Elapsed time against the prediction, in plain words (\"1 h 22 min elapsed; prediction not yet due …\"). Without a name: every running timer. A finished timer's name gives the row it left in the calibration table.",
    inputSchema: { type: "object", properties: { name: { type: "string" } }, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_timer_finish", title: "Finish a timer",
    description: "Finish a running timer when the task reports (done, failed or dropped). Writes predicted vs actual into the calibration table as an observed row that no tool edits or removes. A finish without a start is refused.",
    inputSchema: { type: "object", properties: {
      name: { type: "string" },
      actual_finish: { type: "string", description: "When it really ended, if earlier than now: a time on the owner's clock (\"18:20\" — the latest one) or a date-time. Default: now." },
      note: line(),
    }, required: ["name"], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: "persona_calibration_read", title: "Read the calibration table",
    description: "Every timed estimate so far — predicted vs actual, how far off, the ratio — with a summary and the running timers. Read it before estimating any duration. It cannot be edited.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
];

export type ToolResult = { text: string; isError: boolean };
type Args = Record<string, unknown>;

/** The model writes as itself or as a background pass — never as the owner. */
function noOwnerPen(value: unknown, field = "lines"): string[] {
  const list = Array.isArray(value) ? value : [];
  return list.flatMap((item, index) => (item && typeof item === "object" && (item as Args).author === "owner" ? [`${field}[${index}]: only the owner writes as the owner`] : []));
}

function recallText(result: RecallResult): string {
  const head = [`Recall «${result.query}»${result.period ? ` — period ${result.period.from.slice(0, 10)} … ${result.period.to.slice(0, 10)} («${result.period.label}»)` : ""}${result.asOf ? ` — as of ${result.asOf.slice(0, 10)}` : ""}: ${result.episodes.length} episode(s)`];
  const folds = new Map<string, Fold>(result.episodes.filter((hit) => hit.fold).map((hit) => [hit.fold!.id, hit.fold!]));
  const body = result.episodes.map((hit) => `${episodeMarkdown(hit.episode, folds)}\n(score ${hit.score}: cue ${hit.why.cue}, words ${hit.why.keyword}, similarity ${hit.why.embedding})`);
  const facts = result.facts.length ? [`Facts:\n${result.facts.map((fact) => `- ${fact.key}: [${fact.tag} · ${fact.author}] ${fact.text} (since ${fact.validFrom.slice(0, 10)}${fact.validTo ? `, until ${fact.validTo.slice(0, 10)}` : ""})`).join("\n")}`] : [];
  const foldLines = result.folds.length ? [`Folds:\n${result.folds.map((fold) => `- ${fold.id} (${fold.episodeIds.length} episodes): ${fold.summary.map((l) => `[${l.tag} · ${l.author}] ${l.text}`).join(" ")}`).join("\n")}`] : [];
  return [...head, ...body, ...facts, ...foldLines].join("\n\n") || "Nothing found.";
}

export async function callTool(memory: PersonaMemory, name: string, rawArgs: unknown): Promise<ToolResult> {
  const args: Args = rawArgs && typeof rawArgs === "object" ? (rawArgs as Args) : {};
  try {
    switch (name) {
      case "persona_remember": {
        if (args.fact && typeof args.fact === "object") {
          const fact = await memory.factSet(args.fact as Args);
          return { text: `Fact ${fact.key} recorded (${fact.id}), valid from ${fact.validFrom}.`, isError: false };
        }
        const refused = [...noOwnerPen(args.lines), ...noOwnerPen(args.state, "state")];
        if (refused.length) throw new PersonaMemoryError("invalid", refused);
        const { episode } = await memory.remember({ ...args, author: "self", source: "persona" });
        return { text: `Remembered ${episode.id} (${episode.validFrom.slice(0, 10)}, salience ${episode.salience}, cues: ${episode.cues.join(", ")}).`, isError: false };
      }
      case "persona_recall": {
        if (typeof args.query !== "string" || !args.query.trim()) throw new PersonaMemoryError("invalid", "query: what to look for");
        const result = await memory.recall(args.query, { k: typeof args.k === "number" ? args.k : undefined, asOf: typeof args.asOf === "string" ? args.asOf : undefined,
          includeFolded: typeof args.includeFolded === "boolean" ? args.includeFolded : undefined });
        return { text: result.episodes.length || result.facts.length || result.folds.length ? recallText(result) : `Nothing found for «${args.query}».`, isError: false };
      }
      case "persona_journal_latest": {
        const episodes = await memory.journalLatest(typeof args.n === "number" ? args.n : 1);
        return { text: episodes.length ? episodes.map((episode) => episodeMarkdown(episode)).join("\n\n---\n\n") : "The journal is empty: this is the first session with this memory.", isError: false };
      }
      case "persona_dossier_read": {
        const view = await memory.dossierRead({ asOf: typeof args.asOf === "string" ? args.asOf : undefined, budgetTokens: typeof args.budgetTokens === "number" ? args.budgetTokens : undefined });
        return { text: view.text, isError: false };
      }
      case "persona_dossier_append": {
        const refused = noOwnerPen(args.lines);
        if (refused.length) throw new PersonaMemoryError("invalid", refused);
        const added = await memory.dossierAppend(args.lines);
        return { text: `Dossier: ${added.length} line(s) added (${added.map((l) => `${l.id} in ${l.section}${l.supersedes ? `, replacing ${l.supersedes}` : ""}`).join("; ")}).`, isError: false };
      }
      case "persona_note": {
        const refused = noOwnerPen(args.lines);
        if (refused.length) throw new PersonaMemoryError("invalid", refused);
        const episode = await memory.addNote(String(args.episodeId ?? ""), { lines: args.lines, closes: args.closes, author: "self" });
        return { text: `Note added to ${episode.id}${episode.validTo ? `; the entry is closed at ${episode.validTo}` : ""}.`, isError: false };
      }
      case "persona_fold": {
        const refused = noOwnerPen(args.summary, "summary");
        if (refused.length) throw new PersonaMemoryError("invalid", refused);
        const fold = await memory.fold({ ...args, author: "self" });
        return { text: `Folded ${fold.episodeIds.length} episodes into ${fold.id}: ${fold.episodeIds.join(", ")}. The originals are kept.`, isError: false };
      }
      case "persona_now":
        return { text: (await memory.now()).text, isError: false };
      case "persona_timer_start": {
        const refused = noOwnerPen(args.note === undefined ? [] : [args.note], "note");
        if (refused.length) throw new PersonaMemoryError("invalid", refused);
        const status = await memory.timerStart({ name: args.name, predictedFinish: args.predicted_finish, note: args.note });
        const { summary } = await memory.calibrationRead();
        return { text: `Timer «${status.timer.name}» started ${localWords(status.timer.startedAt, memory.timeZone)}; predicted to finish ${localWords(status.timer.predictedFinish, memory.timeZone, { sameDayAs: Date.parse(status.timer.startedAt) })} — in ${durationWords(status.predictedMs)}. Finish it with persona_timer_finish when it reports.\nCalibration so far: ${summary.text}`, isError: false };
      }
      case "persona_timer_check": {
        const { running, finished } = await memory.timerCheck(typeof args.name === "string" ? args.name : undefined);
        if (finished) return { text: `«${finished.name}» is finished: ${finished.text}. (${finished.id} in the calibration table)`, isError: false };
        return { text: running.length ? running.map((status) => `«${status.timer.name}» (started ${localWords(status.timer.startedAt, memory.timeZone)}): ${status.text}`).join("\n") : "No timer is running.", isError: false };
      }
      case "persona_timer_finish": {
        const refused = noOwnerPen(args.note === undefined ? [] : [args.note], "note");
        if (refused.length) throw new PersonaMemoryError("invalid", refused);
        const { row, summary } = await memory.timerFinish({ name: args.name, actualFinish: args.actual_finish, note: args.note });
        return { text: `Finished ${row.text}. Recorded in the calibration table as ${row.id} [${row.tag} · ${row.author}].\nCalibration now: ${summary.text}`, isError: false };
      }
      case "persona_calibration_read":
        return { text: (await memory.calibrationRead()).text, isError: false };
      case "persona_export": {
        const exported = await memory.exportMarkdown();
        const part = typeof args.part === "string" ? args.part : "all";
        const pick = part === "all" ? exported.text : part === "journal"
          ? Object.entries(exported.files).filter(([file]) => file.startsWith("journal/")).map(([, text]) => text).join("\n\n---\n\n") || "(the journal is empty)"
          : exported.files[`${part}.md`];
        if (pick === undefined) throw new PersonaMemoryError("invalid", "part: all, dossier, journal, facts, folds or calibration");
        return { text: pick, isError: false };
      }
      default:
        return { text: `Unknown tool ${name}.`, isError: true };
    }
  } catch (error) {
    if (error instanceof PersonaMemoryError) return { text: `Not written — ${error.code}:\n- ${error.problems.join("\n- ")}`, isError: true };
    // An unexpected failure: the message only (a database or file error never carries a key or a token).
    return { text: `Failed: ${String((error as Error)?.message ?? error).slice(0, 300)}`, isError: true };
  }
}

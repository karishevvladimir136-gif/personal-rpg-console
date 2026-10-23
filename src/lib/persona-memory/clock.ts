// Persona memory 2, Part E (docs/stages/PERSONA_MEMORY_2.md): the clock with a memory. The store had timestamps but no
// durations: the persona did not know when something started, how long it had been running, or how its own estimates
// fared. Here: the owner's time zone (wall-clock times are read and shown in it; arithmetic is on instants, so neither a
// zone nor a daylight-saving change bends an elapsed time), durations in plain words, timers that hold an estimate, and
// the calibration table — every finished timer leaves one row «predicted vs actual», tagged observed, that no tool edits
// or removes (a miss is never forgotten). Sessions are read from the store's own write times. Pure: no store, no I/O.
import { createHash } from "node:crypto";
import { newId, parseLine, PersonaMemoryError, registerProblems, type Author, type Line } from "./schema.ts";

export type Timer = {
  id: string;
  name: string;
  startedAt: string;
  predictedFinish: string;
  /** The owner's zone when it started. */
  timeZone: string;
  note: Line | null;
  recordedAt: string;
  finishedAt: string | null;
  source: string;
};

export type CalibrationRow = Line & {
  id: string;
  /** The timer the row closed; null for a row the import took from the owner's own notes. */
  timerId: string | null;
  name: string;
  startedAt: string | null;
  predictedFinish: string | null;
  actualFinish: string | null;
  predictedMinutes: number;
  actualMinutes: number;
  notes: Line[];
  recordedAt: string;
  source: string;
  /** SHA-256 of the row at recording; a mismatch on read means it was edited by hand. */
  sha256: string;
};

const MINUTE = 60_000, HOUR = 3_600_000, DAY = 86_400_000;
/** A gap this long between two writes ends a session. */
export const SESSION_GAP_HOURS = 3;
const round1 = (value: number) => Math.round(value * 10) / 10;
const iso = (ms: number) => new Date(ms).toISOString();
const pad = (n: number) => String(n).padStart(2, "0");

// ---- the owner's zone ---------------------------------------------------------------------------------------------

export function checkTimeZone(zone: string): string {
  try { return new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions().timeZone; } catch {
    throw new PersonaMemoryError("invalid", `time zone «${String(zone).slice(0, 60)}» is not an IANA zone name (for example Europe/Moscow)`);
  }
}
export const hostTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const formatters = new Map<string, Intl.DateTimeFormat>();
function wallClock(ms: number, zone: string) {
  let format = formatters.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    formatters.set(zone, format);
  }
  const out: Record<string, string> = {};
  for (const part of format.formatToParts(new Date(ms))) out[part.type] = part.value;
  return { year: +out.year, month: +out.month, day: +out.day, hour: +out.hour % 24, minute: +out.minute, second: +out.second, weekday: out.weekday };
}

/** The zone's offset from UTC at an instant, in minutes (east is positive). */
export function offsetMinutes(ms: number, zone: string): number {
  const p = wallClock(ms, zone);
  return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000) / MINUTE);
}

/** A wall-clock time in a zone as an instant. A time a daylight-saving change skips moves forward by the gap; a time
 * that happens twice takes the later reading. */
export function wallClockToInstant(year: number, month: number, day: number, hour: number, minute: number, zone: string, second = 0): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  let at = guess - offsetMinutes(guess, zone) * MINUTE;
  const settled = offsetMinutes(at, zone);
  if (settled * MINUTE !== guess - at) at = guess - settled * MINUTE;
  return at;
}

export const offsetLabel = (minutes: number) => `UTC${minutes < 0 ? "-" : "+"}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`;

/** A moment as the owner's wall clock shows it: «Friday 2026-10-23 18:05 (UTC+03:00)»; `short` drops the weekday and
 * the date when it is the same day as `sameDayAs`. */
export function localWords(at: string | number, zone: string, opts: { weekday?: boolean; sameDayAs?: number } = {}): string {
  const ms = typeof at === "number" ? at : Date.parse(at);
  const p = wallClock(ms, zone);
  const time = `${pad(p.hour)}:${pad(p.minute)} (${offsetLabel(offsetMinutes(ms, zone))})`;
  if (opts.sameDayAs !== undefined) {
    const q = wallClock(opts.sameDayAs, zone);
    if (q.year === p.year && q.month === p.month && q.day === p.day) return time;
  }
  return `${opts.weekday === false ? "" : `${p.weekday} `}${p.year}-${pad(p.month)}-${pad(p.day)} ${time}`;
}

/** ISO 8601 with the zone's offset: 2026-10-23T18:05:00+03:00. */
export function localIso(at: string | number, zone: string): string {
  const ms = typeof at === "number" ? at : Date.parse(at);
  const p = wallClock(ms, zone);
  const offset = offsetMinutes(ms, zone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${offsetLabel(offset).slice(3)}`;
}

// ---- durations ----------------------------------------------------------------------------------------------------

/** A duration in plain words, to the minute: «under a minute», «45 min», «1 h 22 min», «1 day 3 h», «9 days». */
export function durationWords(ms: number): string {
  const total = Math.round(Math.abs(ms) / MINUTE);
  if (total < 1) return "under a minute";
  const days = Math.floor(total / 1440), hours = Math.floor((total % 1440) / 60), minutes = total % 60;
  if (days >= 7) return `${Math.round(total / 1440)} days`;
  if (days) return `${days} day${days === 1 ? "" : "s"}${hours ? ` ${hours} h` : ""}`;
  if (hours) return `${hours} h${minutes ? ` ${minutes} min` : ""}`;
  return `${minutes} min`;
}

const UNITS: [RegExp, number][] = [
  [/^(?:d|days?|день|дн(?:я|ей|и)?|сут(?:ки|ок)?)$/u, 1440],
  [/^(?:h|hrs?|hours?|ч|час(?:а|ов)?)$/u, 60],
  [/^(?:m|mins?|minutes?|мин(?:ута|уты|ут)?)$/u, 1],
];

/** A duration in minutes: «90 min», «1 h 30 min», «1.5 hours», «2h», «PT1H30M», «1 ч 30 мин», «3 days». Null when the
 * text is not a duration. */
export function parseDuration(text: string): number | null {
  const value = text.trim().toLowerCase().replace(/(\d),(\d)/g, "$1.$2");
  const isoDuration = value.match(/^p(?:(\d+(?:\.\d+)?)d)?(?:t(?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m)?)?$/);
  if (isoDuration && /\d/.test(value)) return round1(Number(isoDuration[1] ?? 0) * 1440 + Number(isoDuration[2] ?? 0) * 60 + Number(isoDuration[3] ?? 0)) || null;
  let minutes = 0, found = false;
  const rest = value.replace(/(\d+(?:\.\d+)?)\s*([a-zа-я]+)\.?/gu, (whole, amount: string, unit: string) => {
    const factor = UNITS.find(([pattern]) => pattern.test(unit))?.[1];
    if (factor === undefined) return whole;
    minutes += Number(amount) * factor;
    found = true;
    return " ";
  });
  if (!found || rest.split(/[\s,]+/).some((word) => word && !["and", "и"].includes(word))) return null;
  return minutes > 0 ? round1(minutes) : null;
}

/** A moment a caller names: an ISO date-time with an offset; one without an offset (the owner's wall clock); «HH:MM» on
 * the owner's clock — the next one after `base` (`direction: "next"`) or the latest one not after it ("previous"); and,
 * with `durations`, a duration from `base` («2 h», «in 90 min», «через 2 ч»). A date alone is not a moment. */
export function parseMoment(value: unknown, field: string, ctx: { zone: string; base: number; direction: "next" | "previous"; durations?: boolean }, problems: string[]): number | null {
  if (typeof value !== "string" || !value.trim()) {
    problems.push(`${field}: a date-time (2026-10-23T18:00, on the owner's clock unless it has an offset), a time («18:00»)${ctx.durations ? " or a duration («2 h», «90 min»)" : ""}`);
    return null;
  }
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:z|[+-]\d{2}:?\d{2})$/i.test(text)) {
    const ms = Date.parse(text.replace(" ", "T"));
    if (Number.isFinite(ms)) return ms;
  }
  const local = text.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (local) {
    const [year, month, day, hour, minute, second] = local.slice(1).map((part) => Number(part ?? 0));
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour <= 23 && minute <= 59) return wallClockToInstant(year, month, day, hour, minute, ctx.zone, second);
  }
  const time = text.match(/^(\d{1,2}):(\d{2})$/);
  if (time && Number(time[1]) <= 23 && Number(time[2]) <= 59) {
    const today = wallClock(ctx.base, ctx.zone);
    for (const shift of ctx.direction === "next" ? [0, 1, 2] : [0, -1, -2]) {
      const day = new Date(Date.UTC(today.year, today.month - 1, today.day + shift));
      const at = wallClockToInstant(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), Number(time[1]), Number(time[2]), ctx.zone);
      if (ctx.direction === "next" ? at > ctx.base : at <= ctx.base) return at;
    }
  }
  if (ctx.durations) {
    const minutes = parseDuration(text.replace(/^(?:in|within|через|за)\s+/iu, "").replace(/^\+\s*/, ""));
    if (minutes !== null) return ctx.base + minutes * MINUTE;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) problems.push(`${field}: «${text}» is a date without a time — give a time on the owner's clock (${text}T18:00)${ctx.durations ? " or a duration" : ""}`);
  else problems.push(`${field}: «${text.slice(0, 40)}» is not a date-time, a time${ctx.durations ? " or a duration («2 h», «90 min», «1 h 30 min»)" : ""}`);
  return null;
}

// ---- timers -------------------------------------------------------------------------------------------------------

export const timerKey = (name: string) => name.replace(/\s+/g, " ").trim().toLowerCase();

export type TimerStartInput = { name?: unknown; predictedFinish?: unknown; note?: unknown };

/** A timer that starts now and holds the estimate. One running timer per name. */
export function buildTimer(input: TimerStartInput, timers: Timer[], now: string, zone: string): Timer {
  const problems: string[] = [];
  const name = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim() : "";
  if (!name || name.length > 80) problems.push("name: what the task is, 1 to 80 characters");
  const running = name ? timers.find((timer) => timer.finishedAt === null && timerKey(timer.name) === timerKey(name)) : undefined;
  if (running) problems.push(`name: «${running.name}» is already running (since ${localWords(running.startedAt, zone)}) — finish it first, or name this one differently`);
  const start = Date.parse(now);
  const predicted = parseMoment(input.predictedFinish, "predictedFinish", { zone, base: start, direction: "next", durations: true }, problems);
  if (predicted !== null && predicted <= start) problems.push("predictedFinish: must be after the start (now)");
  if (predicted !== null && predicted - start > 366 * DAY) problems.push("predictedFinish: within a year");
  const note = input.note === undefined || input.note === null ? null : parseLine(input.note, "note", "self", problems, 1000);
  if (note) problems.push(...registerProblems([note], "note"));
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  return { id: newId("tm", now), name, startedAt: now, predictedFinish: iso(predicted!), timeZone: zone, note, recordedAt: now, finishedAt: null, source: "persona" };
}

export type TimerStatus = { timer: Timer; elapsedMs: number; predictedMs: number; overMs: number; text: string };

/** Elapsed against the prediction, in plain words: «1 h 22 min elapsed; prediction not yet due (…)». */
export function timerStatus(timer: Timer, nowMs: number, zone: string = timer.timeZone): TimerStatus {
  const start = Date.parse(timer.startedAt), due = Date.parse(timer.predictedFinish);
  const elapsedMs = Math.max(0, nowMs - start), predictedMs = due - start, overMs = nowMs - due;
  const dueAt = localWords(due, zone, { sameDayAs: nowMs });
  const text = overMs < 0
    ? `${durationWords(elapsedMs)} elapsed; prediction not yet due (${durationWords(-overMs)} left of the predicted ${durationWords(predictedMs)}, due ${dueAt})`
    : `${durationWords(elapsedMs)} elapsed; ${overMs < MINUTE ? "the prediction is due now" : `${durationWords(overMs)} past the prediction`} (predicted ${durationWords(predictedMs)}, due ${dueAt})`;
  return { timer, elapsedMs, predictedMs, overMs, text };
}

// ---- the calibration table ----------------------------------------------------------------------------------------

export function calibrationText(name: string, predictedMinutes: number, actualMinutes: number): string {
  const diff = actualMinutes - predictedMinutes;
  const off = Math.abs(diff) < 1 ? "on time" : `${durationWords(Math.abs(diff) * MINUTE)} ${diff > 0 ? "over" : "under"}`;
  return `«${name}»: predicted ${durationWords(predictedMinutes * MINUTE)}, took ${durationWords(actualMinutes * MINUTE)} — ${off} (${(actualMinutes / predictedMinutes).toFixed(2)}× the estimate)`;
}

type RowFields = Omit<CalibrationRow, "sha256">;
const rowOriginal = (row: RowFields) => ({ id: row.id, timerId: row.timerId, name: row.name, text: row.text, author: row.author, tag: row.tag, startedAt: row.startedAt,
  predictedFinish: row.predictedFinish, actualFinish: row.actualFinish, predictedMinutes: row.predictedMinutes, actualMinutes: row.actualMinutes,
  notes: row.notes.map((line) => ({ text: line.text, author: line.author, tag: line.tag })), recordedAt: row.recordedAt, source: row.source });
export const rowSha256 = (row: RowFields) => createHash("sha256").update(JSON.stringify(rowOriginal(row))).digest("hex");
export const rowEditedByHand = (row: CalibrationRow) => rowSha256(row) !== row.sha256;

/** The row a finished timer leaves: prediction vs actual, measured by the clock — `observed`, never typed in. */
export function buildCalibrationRow(timer: Timer, actualMs: number, note: Line | null, now: string): CalibrationRow {
  const start = Date.parse(timer.startedAt);
  const predictedMinutes = round1((Date.parse(timer.predictedFinish) - start) / MINUTE), actualMinutes = round1((actualMs - start) / MINUTE);
  const row: RowFields = { id: newId("cal", now), timerId: timer.id, name: timer.name, text: calibrationText(timer.name, predictedMinutes, actualMinutes), author: "self", tag: "observed",
    startedAt: timer.startedAt, predictedFinish: timer.predictedFinish, actualFinish: iso(actualMs), predictedMinutes, actualMinutes,
    notes: [timer.note, note].filter((line): line is Line => line !== null), recordedAt: now, source: timer.source };
  return { ...row, sha256: rowSha256(row) };
}

export type TimerFinishInput = { name?: unknown; actualFinish?: unknown; note?: unknown };

/** Closes the running timer of that name; a finish without a start is refused. */
export function finishTimer(input: TimerFinishInput, timers: Timer[], now: string, zone: string): { timer: Timer; row: CalibrationRow } {
  const problems: string[] = [];
  const name = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim() : "";
  const running = timers.filter((timer) => timer.finishedAt === null);
  const timer = name ? running.find((item) => timerKey(item.name) === timerKey(name)) : undefined;
  if (!timer) {
    const list = running.length ? `running: ${running.map((item) => `«${item.name}»`).join(", ")}` : "no timer is running";
    throw new PersonaMemoryError("not_found", `no running timer «${name || "(no name)"}» — a timer is finished only after persona_timer_start (${list})`);
  }
  const nowMs = Date.parse(now);
  const actual = input.actualFinish === undefined || input.actualFinish === null ? nowMs
    : parseMoment(input.actualFinish, "actualFinish", { zone, base: nowMs, direction: "previous" }, problems);
  if (actual !== null && actual < Date.parse(timer.startedAt)) problems.push(`actualFinish: before the timer started (${localWords(timer.startedAt, zone)})`);
  if (actual !== null && actual > nowMs + MINUTE) problems.push("actualFinish: in the future");
  const note = input.note === undefined || input.note === null ? null : parseLine(input.note, "note", "self", problems, 1000);
  if (note) problems.push(...registerProblems([note], "note"));
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  const finishedAt = iso(Math.min(actual!, nowMs));
  return { timer: { ...timer, finishedAt }, row: buildCalibrationRow(timer, Date.parse(finishedAt), note, now) };
}

export type SeedInput = { name: string; predictedMinutes: number; actualMinutes: number; sourceLine: string; source: string };

/** A row the import found in the owner's own notes, a prediction and an actual both written there — never invented. */
export function buildSeedRow(input: SeedInput, now: string, author: Author = "background"): CalibrationRow {
  const problems: string[] = [];
  const name = input.name.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!name) problems.push("name: empty");
  if (!(input.predictedMinutes > 0) || !(input.actualMinutes >= 0)) problems.push("minutes: a prediction above zero and an actual of zero or more");
  if (problems.length) throw new PersonaMemoryError("invalid", problems);
  const row: RowFields = { id: newId("cal", now), timerId: null, name, text: calibrationText(name, input.predictedMinutes, input.actualMinutes), author, tag: "observed",
    startedAt: null, predictedFinish: null, actualFinish: null, predictedMinutes: round1(input.predictedMinutes), actualMinutes: round1(input.actualMinutes),
    notes: [{ text: `Imported from ${input.source}: «${input.sourceLine.slice(0, 900)}»`, author, tag: "observed" }], recordedAt: now, source: input.source };
  return { ...row, sha256: rowSha256(row) };
}

export type CalibrationSummary = { rows: number; medianRatio: number | null; over: number; under: number; onTime: number; medianMissMinutes: number | null; text: string };

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export function calibrationSummary(rows: CalibrationRow[]): CalibrationSummary {
  const over = rows.filter((row) => row.actualMinutes - row.predictedMinutes >= 1).length;
  const under = rows.filter((row) => row.predictedMinutes - row.actualMinutes >= 1).length;
  const medianRatio = median(rows.map((row) => row.actualMinutes / row.predictedMinutes));
  const medianMiss = median(rows.map((row) => Math.abs(row.actualMinutes - row.predictedMinutes)));
  const text = rows.length
    ? `${rows.length} timed estimate${rows.length === 1 ? "" : "s"}: median actual ÷ predicted ${medianRatio!.toFixed(2)}×; ${over} ran over, ${under} under, ${rows.length - over - under} on time; the median miss ${durationWords(medianMiss! * MINUTE)}.`
    : "The calibration table is empty: no estimate has been timed yet.";
  return { rows: rows.length, medianRatio: medianRatio === null ? null : Math.round(medianRatio * 100) / 100, over, under, onTime: rows.length - over - under,
    medianMissMinutes: medianMiss === null ? null : round1(medianMiss), text };
}

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\s*\n+\s*/g, " ");

/** The table as markdown — what persona_calibration_read and the export show. */
export function calibrationMarkdown(rows: CalibrationRow[], zone: string, running: Timer[] = [], nowMs?: number): string {
  const sorted = [...rows].sort((a, b) => (a.actualFinish ?? a.recordedAt).localeCompare(b.actualFinish ?? b.recordedAt) || a.id.localeCompare(b.id));
  const out = ["# Calibration — predicted vs actual", "",
    "Every finished timer leaves one row here, measured by the clock. No tool edits or removes a row: a miss stays on record.", "",
    calibrationSummary(rows).text];
  if (sorted.length) out.push("", "| Finished | Task | Predicted | Actual | Off by | × | Notes | Provenance |", "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sorted.map((row) => {
      const diff = row.actualMinutes - row.predictedMinutes;
      const when = row.actualFinish ? localWords(row.actualFinish, zone, { weekday: false }) : `(imported ${row.recordedAt.slice(0, 10)})`;
      const notes = row.notes.map((line) => `[${line.tag} · ${line.author}] ${line.text}`).join(" / ");
      return `| ${when} | ${cell(row.name)} | ${durationWords(row.predictedMinutes * MINUTE)} | ${durationWords(row.actualMinutes * MINUTE)} | ${Math.abs(diff) < 1 ? "on time" : `${diff > 0 ? "+" : "−"}${durationWords(Math.abs(diff) * MINUTE)}`} | ${(row.actualMinutes / row.predictedMinutes).toFixed(2)} | ${cell(notes)} | [${row.tag} · ${row.author}]${rowEditedByHand(row) ? " **edited by hand**" : ""} \`${row.id}\` |`;
    }));
  if (running.length) out.push("", "## Running timers", "", ...running.map((timer) => `- «${timer.name}» — started ${localWords(timer.startedAt, zone)}${nowMs === undefined ? `, predicted to finish ${localWords(timer.predictedFinish, zone)}` : `: ${timerStatus(timer, nowMs, zone).text}`} · \`${timer.id}\``));
  return out.join("\n");
}

// ---- sessions and the reading of the clock ------------------------------------------------------------------------

export type Session = { from: string; to: string; writes: number };

/** The sessions the store's write times show: writes closer together than the gap are one session. */
export function sessionsOf(times: string[], nowMs: number, gapMs = SESSION_GAP_HOURS * HOUR): Session[] {
  const sorted = times.map((time) => Date.parse(time)).filter((ms) => Number.isFinite(ms) && ms <= nowMs + MINUTE).sort((a, b) => a - b);
  const sessions: { from: number; to: number; writes: number }[] = [];
  for (const ms of sorted) {
    const last = sessions[sessions.length - 1];
    if (last && ms - last.to < gapMs) { last.to = ms; last.writes++; } else sessions.push({ from: ms, to: ms, writes: 1 });
  }
  return sessions.map((session) => ({ from: iso(session.from), to: iso(session.to), writes: session.writes }));
}

export type ClockView = {
  now: string; local: string; timeZone: string; offset: string;
  sinceLastEntry: { title: string; at: string; ms: number } | null;
  currentSession: Session | null; lastSession: Session | null;
  running: TimerStatus[]; calibration: CalibrationSummary; text: string;
};

/** What persona_now answers: the time on the owner's clock and the context — the last entry, the last session (and
 * this one, if it has begun writing), the running timers, the calibration so far. */
export function clockView(input: { nowMs: number; zone: string; latestEntry: { title: string; validFrom: string } | null; writes: string[]; timers: Timer[]; calibration: CalibrationRow[]; gapMs?: number }): ClockView {
  const { nowMs, zone } = input;
  const gapMs = input.gapMs ?? SESSION_GAP_HOURS * HOUR;
  const sessions = sessionsOf(input.writes, nowMs, gapMs);
  const latest = sessions[sessions.length - 1] ?? null;
  const currentSession = latest && nowMs - Date.parse(latest.to) < gapMs ? latest : null;
  const lastSession = currentSession ? sessions[sessions.length - 2] ?? null : latest;
  const running = input.timers.filter((timer) => timer.finishedAt === null).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).map((timer) => timerStatus(timer, nowMs, zone));
  const calibration = calibrationSummary(input.calibration);
  const sinceLastEntry = input.latestEntry ? { title: input.latestEntry.title, at: input.latestEntry.validFrom, ms: nowMs - Date.parse(input.latestEntry.validFrom) } : null;
  const span = (session: Session) => `${localWords(session.from, zone)} → ${localWords(session.to, zone, { sameDayAs: Date.parse(session.from) })} (${durationWords(Date.parse(session.to) - Date.parse(session.from))}, ${session.writes} write${session.writes === 1 ? "" : "s"})`;
  const offset = offsetLabel(offsetMinutes(nowMs, zone));
  const lines = [
    `Now: ${localWords(nowMs, zone)} — the owner's zone ${zone} · ${localIso(nowMs, zone)} · ${iso(nowMs)}`,
    sinceLastEntry ? `Last journal entry: «${sinceLastEntry.title || "(untitled)"}», ${localWords(sinceLastEntry.at, zone)} — ${durationWords(sinceLastEntry.ms)} ago.` : "The journal is empty.",
    ...(currentSession ? [`This session: writing since ${localWords(currentSession.from, zone, { sameDayAs: nowMs })} (${durationWords(nowMs - Date.parse(currentSession.from))} ago).`] : []),
    lastSession ? `Last session: ${span(lastSession)}; it ended ${durationWords(nowMs - Date.parse(lastSession.to))} ago.` : "No earlier session is on record.",
    running.length ? `Running timers:\n${running.map((status) => `- «${status.timer.name}»: ${status.text}`).join("\n")}` : "No timer is running.",
    `Calibration: ${calibration.text}${calibration.rows ? " (persona_calibration_read for the rows)" : ""}`,
  ];
  return { now: iso(nowMs), local: localIso(nowMs, zone), timeZone: zone, offset, sinceLastEntry, currentSession, lastSession, running, calibration, text: lines.join("\n") };
}

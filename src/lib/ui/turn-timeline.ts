// Fix run after session 2, stage C (items 43, 44, 53, 63): the turn as one timeline. The narration is shown in
// the order it was told — text, the roll in the place where the story asked for it, the continuation — and the
// text already shown never leaves the screen. The hero's rolls are cards; the rolls the DM makes for the companions
// (the owner's decision) are one-line chips in place; a pause is named by what the turn is waiting for.
// Display only: the dice stay the server's, recorded before the DM tells the outcome.
import type { LiveTurnView } from "../gameplay/live-turn-client.ts";
import type { PublicTurn, TurnStatus, VisibleCheck } from "../gameplay/contracts.ts";

/** The streamed turn with the narration offset at which each of its changes arrived (`at[i]` for
 * `view.changes[i]`). `replay` is a stream opened again for the same turn while it catches up. */
export type LiveTrace = { view: LiveTurnView; at: number[]; replay?: LiveTrace };

function extend(previous: LiveTrace | null, view: LiveTurnView): LiveTrace {
  const at = previous ? previous.at.slice(0, view.changes.length) : [];
  // A change event adds no text: it happened where the told text ended.
  for (let index = at.length; index < view.changes.length; index++) at.push(view.text.length);
  return { view, at };
}
const behind = (view: LiveTurnView, shown: LiveTurnView) =>
  view.text.length < shown.text.length || view.changes.length < shown.changes.length;

/** Folds the next view of a turn's stream into its trace. A stream opened again (after «Дальше», a remount or
 * a reload) replays the turn from its start: the told text stays on screen until the replay has caught up. */
export function traceLive(trace: LiveTrace | null, view: LiveTurnView): LiveTrace {
  if (!trace || trace.view.operationId !== view.operationId) return extend(null, view);
  if (trace.replay) {
    const replay = extend(trace.replay, view);
    return behind(view, trace.view) ? { ...trace, replay } : replay;
  }
  if (behind(view, trace.view)) return { ...trace, replay: extend(null, view) };
  return extend(trace, view);
}

/** The newest status the stream reported (a replay in progress is newer than the shown text). */
export const traceStatus = (trace: LiveTrace | null) => (trace?.replay ?? trace)?.view.status ?? null;

/** One roll line of the turn: the server's player line and where in the narration it came (null: unknown). */
export type RollLine = { summary: string; at: number | null };

/** The turn's roll lines in call order. A turn in flight reads them from its stream; a saved turn from its
 * record, with the stream's offsets when this page saw it told (the n-th roll of each is the same call). */
export function rollLines(turn: Pick<PublicTurn, "status" | "changes">, trace: LiveTrace | null): RollLine[] {
  const traced: RollLine[] = trace
    ? trace.view.changes.flatMap((change, index) => (change.ok && change.name === "roll" ? [{ summary: change.summary, at: trace.at[index] ?? null }] : []))
    : [];
  if (turn.status !== "committed" || !turn.changes) return traced;
  // The saved turn knows where each roll was made (Stage C); the trace of a turn this page saw told is the fallback.
  return turn.changes.filter((change) => change.tool === "roll").map((change, index) => ({ summary: change.summary,
    at: typeof change.at === "number" ? change.at : traced[index]?.at ?? null }));
}

export type ChipTone = "success" | "failure" | null;
export type TimelineItem =
  | { kind: "text"; key: string; text: string }
  /** A roll the player makes: the full card (the hero's; a companion's when the player rolls for them). */
  | { kind: "card"; key: string; check: VisibleCheck }
  /** The player's roll the stream announced before its record reached the screen (no number shown yet). */
  | { kind: "pending"; key: string; title: string }
  /** A roll made for the player by the DM (a companion's, a plain roll, a hit on the party): one line in place. */
  | { kind: "chip"; key: string; who: string | null; text: string; tone: ChipTone };

export type TurnPause =
  /** Before the first word, and only then. */
  | { kind: "thinking" }
  /** The text stopped in the middle of the turn: the DM rolls or writes a record before going on. */
  | { kind: "gap"; working?: ("roll" | "record" | "lookup")[] }
  /** A roll was made and the DM tells what came of it. */
  | { kind: "after-roll"; who: string | null }
  /** The turn waits for the player's roll (the hero's, or a companion's when the player rolls for them). */
  | { kind: "your-roll"; who: string | null }
  /** The text is complete; the records are being written. */
  | { kind: "recording" };

export type TimelineInput = {
  /** The narration so far: the saved narration, or the stream's text while the turn runs. */
  text: string;
  rolls: RollLine[];
  checks: VisibleCheck[];
  heroId: string | null;
  /** The companions' names, to tell whose roll a line is («Имя: …»). */
  party: string[];
  /** The DM option «Броски спутников»: the DM rolls them as chips ("dm") or the player gets their cards. */
  companionRolls: "dm" | "player";
  status: TurnStatus | "recording";
  /** No new text for a moment while the turn runs (the DM rolls or records before going on). */
  idle?: boolean;
  /** What the DM's latest calls do (the stream says), for the pause's words. */
  working?: ("roll" | "record" | "lookup")[];
  /** The campaign's dice settings make the player's rolls wait for the player (interactive dice or rerolls). */
  rollsWait?: boolean;
  language: "ru" | "en";
};

const FINAL: ReadonlySet<string> = new Set(["committed", "failed", "cancelled"]);
const SUCCESS = / — (получилось|крит|success|critical)(?=$|\s|·)/u;
const FAILURE = / — (не вышло|провал на единице|failure|natural one)(?=$|\s|·)/u;
const toneOf = (line: string): ChipTone => (SUCCESS.test(line) ? "success" : FAILURE.test(line) ? "failure" : null);
/** «причина: 17 …» → «причина» (the first «: number» ends the roll's reason). */
const reasonOf = (line: string) => /^(.*?): -?\d+(?=$|\s)/u.exec(line)?.[1]?.trim() || line;

/** The beginning of the server's player line for a recorded check (receipt-text `chip.roll`):
 * «Имя: » for anyone but the hero, then «причина: » when there is one, then the total. */
function linePrefix(check: VisibleCheck, heroId: string | null) {
  return `${check.actorId === heroId ? "" : `${check.actorName}: `}${check.reason?.trim() ? `${check.reason.trim()}: ` : ""}`;
}
const startsWithTotal = (line: string, prefix: string) => line.startsWith(prefix) && /^-?\d/u.test(line.slice(prefix.length));

function checkLine(check: VisibleCheck, heroId: string | null, ru: boolean) {
  const verdict = check.natural === "crit" ? (ru ? "крит" : "critical") : check.natural === "fumble" ? (ru ? "провал на единице" : "natural one")
    : check.success ? (ru ? "получилось" : "success") : (ru ? "не вышло" : "failure");
  return `${linePrefix(check, heroId)}${check.total} — ${verdict}`;
}

/** Fix S3-pre A-44: a companion's check line shows its d20 before the total («Восприятие: к20 14 → 17 против 15 —
 * получилось»), so the chip reads who, what, the die, the total and the result. */
function withDie(chip: { who: string | null; text: string }, check: VisibleCheck, ru: boolean) {
  const prefix = check.reason?.trim() ? `${check.reason.trim()}: ` : "";
  if (!chip.text.startsWith(prefix) || !chip.text.slice(prefix.length).startsWith(`${check.total}`) || !Number.isInteger(check.kept)) return chip;
  return { ...chip, text: `${prefix}${ru ? "к20" : "d20"} ${check.kept} → ${chip.text.slice(prefix.length)}` };
}

function splitWho(line: string, party: string[]): { who: string | null; text: string } {
  const who = party.find((name) => name && line.startsWith(`${name}: `)) ?? null;
  return { who, text: who ? line.slice(who.length + 2) : line };
}

/** The ordered items of one turn and its named pause. */
export function buildTurnTimeline(input: TimelineInput): { items: TimelineItem[]; pause: TurnPause | null } {
  const { text, heroId, companionRolls } = input;
  const ru = input.language === "ru";
  const final = FINAL.has(input.status);
  const isCard = (check: VisibleCheck) => check.actorId === heroId || companionRolls === "player";
  const clamp = (at: number | null) => (at === null ? null : Math.max(0, Math.min(at, text.length)));
  const placed: { at: number | null; item: Exclude<TimelineItem, { kind: "text" }> }[] = [];
  const used = new Set<string>();
  let cursor = 0;
  input.rolls.forEach((line, index) => {
    // The n-th recorded check is the n-th roll line that begins with its actor and reason (a reroll changes the total).
    const check = input.checks.find((row) => !used.has(row.id) && startsWithTotal(line.summary, linePrefix(row, heroId)) &&
      input.checks.indexOf(row) >= cursor);
    const at = clamp(line.at);
    if (check) {
      used.add(check.id);
      cursor = input.checks.indexOf(check) + 1;
      placed.push({ at, item: isCard(check) ? { kind: "card", key: `check:${check.id}`, check }
        : { kind: "chip", key: `check:${check.id}`, ...withDie(splitWho(line.summary, [check.actorName]), check, ru), tone: check.success ? "success" : "failure" } });
      return;
    }
    const { who, text: rest } = splitWho(line.summary, input.party);
    const tone = toneOf(line.summary);
    // A check of the player's the stream announced before its record (the turn pauses for it): its card comes
    // with the record; the number is not shown before the player rolls.
    const waits = input.status === "awaiting_confirmation" || (!final && !!input.rollsWait);
    if (waits && tone && (who === null || companionRolls === "player"))
      placed.push({ at, item: { kind: "pending", key: `roll:${index}`, title: reasonOf(rest) } });
    else placed.push({ at, item: { kind: "chip", key: `roll:${index}`, who, text: rest, tone } });
  });
  // A recorded check with no line of its own: after the told text of a turn this page saw told, else before the text.
  const traced = input.rolls.some((line) => line.at !== null);
  for (const check of input.checks) {
    if (used.has(check.id)) continue;
    const at = traced ? text.length : null;
    placed.push({ at, item: isCard(check) ? { kind: "card", key: `check:${check.id}`, check }
      : { kind: "chip", key: `check:${check.id}`, ...withDie(splitWho(checkLine(check, heroId, ru), [check.actorName]), check, ru), tone: check.success ? "success" : "failure" } });
  }
  // Unknown places come first («действие — бросок — напечатал»); known ones in the order they were told.
  const ordered = placed.map((row, index) => ({ ...row, index }))
    .sort((a, b) => (a.at ?? -1) - (b.at ?? -1) || a.index - b.index);
  const items: TimelineItem[] = [];
  let from = 0;
  const pushText = (to: number) => {
    const piece = text.slice(from, to).trim();
    if (piece) items.push({ kind: "text", key: `text:${from}`, text: piece });
    from = Math.max(from, to);
  };
  for (const row of ordered) {
    if (row.at !== null && row.at > from) pushText(row.at);
    items.push(row.item);
  }
  pushText(text.length);
  return { items, pause: final ? null : pauseOf(input, items) };
}

function pauseOf(input: TimelineInput, items: TimelineItem[]): TurnPause | null {
  if (input.status === "recording") return { kind: "recording" };
  if (input.status === "awaiting_confirmation") {
    const waiting = [...items].reverse().find((item): item is Extract<TimelineItem, { kind: "card" | "pending" }> => item.kind === "card" || item.kind === "pending");
    const check = waiting?.kind === "card" ? waiting.check : null;
    return { kind: "your-roll", who: check && check.actorId !== input.heroId ? check.actorName : null };
  }
  const last = items.at(-1);
  if (!input.text.trim() && !items.length) return { kind: "thinking" };
  if (last && last.kind !== "text")
    return { kind: "after-roll", who: last.kind === "chip" ? last.who : last.kind === "card" && last.check.actorId !== input.heroId ? last.check.actorName : null };
  return input.idle ? { kind: "gap", ...(input.working?.length ? { working: input.working } : {}) } : null;
}

/** The pause in words (the owner's: «ждёт твой бросок», «бросок Брама», «ведущий записывает»). */
export function pauseWords(pause: TurnPause, language: "ru" | "en"): string {
  const ru = language === "ru";
  switch (pause.kind) {
    case "thinking":
      return ru ? "Ведущий думает…" : "DM is thinking…";
    case "gap": {
      // Stage C (item 53): named from what the DM's calls do, when the stream says.
      const w = pause.working ?? [];
      if (w.includes("roll")) return ru ? "Ведущий бросает кости…" : "The DM rolls the dice…";
      if (w.includes("lookup")) return ru ? "Ведущий сверяется с записями…" : "The DM checks the records…";
      if (w.includes("record")) return ru ? "Ведущий записывает изменения…" : "The DM writes the changes down…";
      return ru ? "Ведущий бросает кости и сверяет записи…" : "The DM rolls and checks the records…";
    }
    case "after-roll":
      return pause.who
        ? (ru ? `Бросок: ${pause.who} — ведущий рассказывает, что вышло…` : `${pause.who}'s roll — the DM tells what came of it…`)
        : (ru ? "Бросок сделан — ведущий рассказывает, что вышло…" : "The roll is made — the DM tells what came of it…");
    case "your-roll":
      return pause.who ? (ru ? `Ждёт твой бросок за спутника: ${pause.who}` : `Waiting for your roll for ${pause.who}`)
        : (ru ? "Ждёт твой бросок" : "Waiting for your roll");
    case "recording":
      return ru ? "Ведущий записывает…" : "DM is recording…";
  }
}

/** The status a turn shows: the saved one, unless its stream already says the records are being written, or
 * the player's «Дальше» is running (the turn goes on before the record says so). */
export function shownStatus(turn: Pick<PublicTurn, "status">, trace: LiveTrace | null, running = false): TurnStatus | "recording" {
  if (FINAL.has(turn.status)) return turn.status;
  const live = traceStatus(trace);
  if (live === "recording") return "recording";
  if (turn.status === "awaiting_confirmation" && (running || live === "generating" && !!trace?.replay)) return "generating";
  return turn.status;
}

/** Every addend of a roll card's total in order. A check recorded with its addends (fix run C) shows each with its own
 * source — the sheet's skill, each worn thing, each bonus of the fiction; an older one shows the part from the sheet and
 * the worn items as one line, then each bonus of the fiction. */
export function checkAddends(check: Pick<VisibleCheck, "modifier" | "bonuses" | "addends">, sheetLabel: string,
  words: { formula: string; cap: string } = { formula: "формула", cap: "предел бонусов" }): { source: string; value: number }[] {
  if (check.addends?.length && check.addends.reduce((sum, row) => sum + row.value, 0) === check.modifier)
    return check.addends.filter((row) => row.value !== 0).map((row) => ({ source: row.kind === "formula" ? words.formula : row.kind === "cap" ? words.cap : row.source, value: row.value }));
  const bonuses = check.bonuses ?? [];
  const sheet = check.modifier - bonuses.reduce((sum, bonus) => sum + bonus.value, 0);
  return [...(sheet !== 0 ? [{ source: sheetLabel, value: sheet }] : []), ...bonuses.filter((bonus) => bonus.value !== 0)];
}

/** A turn the player just sent, before its record reaches the screen (the stream may tell it first). */
export function provisionalTurn(attempt: { operationId: string; campaignId: string; input: string; mode: PublicTurn["mode"];
  companionId: string | null; listenerIds?: string[]; expectedRevision?: number }): PublicTurn {
  return {
    id: attempt.operationId, campaign_id: attempt.campaignId, session_id: null, mode: attempt.mode, input: attempt.input,
    companionId: attempt.companionId, listenerIds: attempt.listenerIds ?? [], status: "generating",
    expectedRevision: attempt.expectedRevision ?? 0, committedRevision: null, settingsRevision: 0, created_at: "", updated_at: "",
    narration: null, visualDescription: null, checks: [], proposal: null, failure: null, canRetry: false, canCancel: false,
  };
}

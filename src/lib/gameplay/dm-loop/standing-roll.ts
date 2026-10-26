// Fix S4 11k — a reroll rewrites the record; it does not sit beside it. Opus (B): «The reroll was logged as "10 vs 15 —
// failure" although the 17 stood»; Astra (B): «the journal still recorded the original natural-one failure» (the DM
// had read the reroll's total under the first die's «natural 1» label and hint, and wrote that «the server called a 12
// a natural 1»). The roll that stands is the turn's check (checkpoint.checks, replaced by the reroll); a receipt never
// changes once written (the database compares the receipts at every checkpoint and at the commit), so it keeps the
// first roll as recorded, and every roll a reroll replaced is kept in the turn's diagnostics («rerolled»). Every line
// the model, the roll checker and the player read quotes the standing roll; an earlier roll appears only as history
// under it, marked rerolled. Pure: no server imports (the loops and the store's public projection share it).
import type { JsonObject, PublicTurn, VisibleCheck } from "../contracts.ts";
import type { RecordedCheck } from "../server-contracts.ts";
import type { DmLoopDiagnostic, DmLoopReceipt } from "./contracts.ts";

/** The hints a natural 20 or a natural 1 gives the DM (the roll's receipt; the standing die's after a reroll). */
export const NATURAL_20_HINT = "A natural 20: the attempt succeeds whatever the total — narrate the success first and in full; companions support, never take the beat.";
export const NATURAL_1_HINT = "A natural 1: the attempt fails — say how, with no extra harm beyond the failure (the table's rule).";
export const naturalHint = (die: number): string | null => (die === 20 ? NATURAL_20_HINT : die === 1 ? NATURAL_1_HINT : null);
/** Fix S4 11v: the award is decided on the die the DM called; a reroll's natural 20 grants none (execute.ts inspirationAward). */
export const REROLL_NATURAL_20_NOTE = "A reroll's natural 20 grants no Heroic Inspiration (the server awards it on the first roll of a called check only).";

export type ReplacedRoll = { rollNumber: number; dice: number[]; kept: number; total: number; success: boolean; natural: "crit" | "fumble" | null };
const replaced = (check: RecordedCheck): ReplacedRoll => ({ rollNumber: check.rollNumber, dice: [...check.dice], kept: check.kept, total: check.total,
  success: check.success, natural: check.natural ?? null });

/** The diagnostic a reroll leaves: the roll it replaced, kept as history. */
export function rerolledDiagnostic(check: RecordedCheck): Extract<DmLoopDiagnostic, { kind: "rerolled" }> {
  return { kind: "rerolled", checkId: check.id, roll: replaced(check) };
}

/** After the reroll's write: the replaced roll joins the turn's history, once — a command sent again returns the stored
 * checks unchanged, and then nothing was replaced. */
export function recordRerolled(diagnostics: DmLoopDiagnostic[], previous: RecordedCheck, replacement: RecordedCheck, stored: readonly RecordedCheck[]): void {
  const now = stored.find((row) => row.id === previous.id);
  if (!now || now.rollNumber !== replacement.rollNumber || now.rollNumber <= previous.rollNumber) return;
  if (diagnostics.some((row) => row.kind === "rerolled" && row.checkId === previous.id && row.roll.rollNumber === previous.rollNumber)) return;
  diagnostics.push(rerolledDiagnostic(previous));
}

/** The rolls rerolls replaced for one check, oldest first: the turn's «rerolled» diagnostics, else (a checkpoint
 * written before them) the first roll its receipt recorded. */
export function rerollHistory(checkId: string, standing: RecordedCheck, diagnostics: readonly DmLoopDiagnostic[], first: RecordedCheck | null): ReplacedRoll[] {
  if (standing.rollNumber <= 1) return [];
  const kept = diagnostics.flatMap((row) => (row.kind === "rerolled" && row.checkId === checkId && row.roll.rollNumber < standing.rollNumber ? [row.roll] : []));
  const unique = kept.filter((row, index) => kept.findIndex((other) => other.rollNumber === row.rollNumber) === index).sort((a, b) => a.rollNumber - b.rollNumber);
  if (unique.length) return unique;
  return first && first.rollNumber < standing.rollNumber ? [replaced(first)] : [];
}

/** A roll's receipt value as the model reads it on every request: the standing dice, total, verdict and natural label,
 * the hint of the standing die, and the replaced rolls as history marked rerolled. A check never rerolled reads as
 * recorded (with the check's current dice, as before). */
export function standingRollValue(value: JsonObject, standing: RecordedCheck, history: ReplacedRoll[], heroId: string | null = null): JsonObject {
  const current = { dice: [...standing.dice], kept: standing.kept, total: standing.total, success: standing.success };
  if (!history.length) return { ...value, ...current };
  const rest: JsonObject = { ...value };
  delete rest.hint;
  const hint = naturalHint(standing.kept);
  const heroCheck = heroId !== null && standing.actorId === heroId && standing.kind !== "attack";
  return { ...rest, ...current, natural: standing.natural ?? null, ...(hint ? { hint } : {}),
    rerolled: { stands: `Roll ${standing.rollNumber} stands: narrate and record this result (${standing.total}${standing.success ? ", success" : ", failure"}); the earlier roll${history.length > 1 ? "s" : ""} below no longer count${history.length > 1 ? "" : "s"}.`,
      history: history.map((row) => ({ ...row, rerolled: true })) as unknown as JsonObject[],
      ...(heroCheck && standing.natural === "crit" ? { inspiration: REROLL_NATURAL_20_NOTE } : {}) } };
}

/** The receipt's English summary (the model, the roll checker, the logs) with the standing roll; the first one as
 * history («…: 17 vs 15 — success (rerolled: 10 vs 15 — failure)»). Unchanged when nothing was rerolled. */
export function standingSummary(summary: string, standing: RecordedCheck, history: ReplacedRoll[]): string {
  if (!history.length) return summary;
  const shape = /: (-?\d+) vs (\d+) — (success|failure)(?: \(natural (?:20|1)\))?/u;
  const found = shape.exec(summary);
  if (!found) return summary;
  const verdict = (row: { total: number; success: boolean; natural: "crit" | "fumble" | null }) =>
    `${row.total} vs ${found[2]} — ${row.success ? "success" : "failure"}${row.natural === "crit" ? " (natural 20)" : row.natural === "fumble" ? " (natural 1)" : ""}`;
  const earlier = history.map((row) => verdict(row)).join("; ");
  return `${summary.slice(0, found.index)}: ${verdict({ total: standing.total, success: standing.success, natural: standing.natural ?? null })} (rerolled: ${earlier})${summary.slice(found.index + found[0].length)}`;
}

/** The tool result the model reads for a receipt (re-rendered from the receipts for every request). */
export function rollToolOutput(receipt: DmLoopReceipt, checks: readonly RecordedCheck[], diagnostics: readonly DmLoopDiagnostic[] = [], heroId: string | null = null): string {
  const result = receipt.result;
  if (!result.ok) return JSON.stringify({ ok: false, reason: result.reason, ...(result.hint ? { hint: result.hint } : {}) });
  const check = result.check ? checks.find((row) => row.id === result.check!.id) ?? result.check : null;
  const value = check ? standingRollValue(result.value, check, rerollHistory(check.id, check, diagnostics, result.check), heroId) : result.value;
  return JSON.stringify({ ok: true, ...value });
}

// --- the player's line ----------------------------------------------------------------------------------------------
const VERDICTS = { ru: { crit: "крит", fumble: "провал на единице", success: "получилось", failure: "не вышло" },
  en: { crit: "critical", fumble: "natural one", success: "success", failure: "failure" } } as const;
const LINE = /^(-?\d+)((?: vs | против )\d+)? — (крит|провал на единице|получилось|не вышло|critical|natural one|success|failure)(?=$| · )/u;
const REROLLED_MARK = / · (?:rerolled|переброшено): /u;
const verdictOf = (l: "ru" | "en", check: Pick<VisibleCheck, "success" | "natural">) =>
  check.natural === "crit" ? VERDICTS[l].crit : check.natural === "fumble" ? VERDICTS[l].fumble : check.success ? VERDICTS[l].success : VERDICTS[l].failure;

/** The player's roll line (receipt-text `chip.roll`, recorded with the first roll) for the check that stands: the
 * standing total and verdict, then the first roll as history marked rerolled («Обман: 17 против 15 — получилось ·
 * переброшено: 10 против 15, не вышло»). The history has no « — verdict» of its own, so the line's tone stays the
 * standing one. Null when the line is not this check's or the check was not rerolled. */
export function standingChip(line: string, check: VisibleCheck): string | null {
  if (check.rollNumber <= 1 || REROLLED_MARK.test(line)) return null;
  const [other, own] = linePrefixes(check);
  for (const prefix of [other, own]) {
    if (!line.startsWith(prefix)) continue;
    const found = LINE.exec(line.slice(prefix.length));
    if (!found) continue;
    const l = /[а-яё]/u.test(found[3]) || /против/u.test(found[2] ?? "") ? "ru" : "en";
    const target = found[2] ?? "";
    // The hero's own line has no «Name: » (receipt-text chip.roll).
    const hero = prefix === own;
    const note = hero && check.natural === "crit" && check.kind !== "attack"
      ? (l === "ru" ? " · Героическое вдохновение за натуральную 20 на переброске не даётся" : " · no Heroic Inspiration for a reroll's natural 20") : "";
    const rest = line.slice(prefix.length + found[0].length);
    return `${prefix}${check.total}${target} — ${verdictOf(l, check)} · ${l === "ru" ? "переброшено" : "rerolled"}: ${found[1]}${target}, ${found[3]}${note}${rest}`;
  }
  return null;
}

/** A committed turn's changes with each rerolled check's roll line rewritten to the standing roll (matched as the
 * turn's timeline matches them: the n-th check is the n-th roll line that begins with its actor and reason). */
export function withStandingRolls<T extends Pick<PublicTurn, "checks" | "changes">>(turn: T): T {
  if (!turn.changes?.length || !turn.checks?.some((check) => check.rollNumber > 1)) return turn;
  const used = new Set<string>();
  let cursor = 0;
  const changes = turn.changes.map((change) => {
    if (change.tool !== "roll") return change;
    const index = turn.checks.findIndex((check, at) => at >= cursor && !used.has(check.id) && lineOf(change.summary, check));
    if (index < 0) return change;
    const check = turn.checks[index];
    used.add(check.id);
    cursor = index + 1;
    const standing = standingChip(change.summary, check);
    return standing ? { ...change, summary: standing } : change;
  });
  return { ...turn, changes };
}
/** The two beginnings a check's line may have: anyone's («Name: reason: »), the hero's («reason: »). */
function linePrefixes(check: VisibleCheck): [string, string] {
  const reason = check.reason?.trim() ?? "";
  return [`${check.actorName}: ${reason ? `${reason}: ` : ""}`, reason ? `${reason}: ` : ""];
}
function lineOf(line: string, check: VisibleCheck): boolean {
  return linePrefixes(check).some((prefix) => line.startsWith(prefix) && /^-?\d/u.test(line.slice(prefix.length)));
}

// Game player 2: the scoring of its own, after game player 1's judges have tagged the Table C sessions — the authorship
// of threads (authorship.mjs) and the scale of each player's first goal — and the same two measures on game player 1's
// Tables A and B (from its committed transcripts and run record), then C0–C4.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isEnd, isQuestion } from "../game-player-1/frozen.mjs";
import { median, tagTwice, wordsIn } from "../game-player-1/measures.mjs";
import { sessionNumbers } from "../game-player-1/score.mjs";
import { transcriptMarkdown } from "../game-player-1/report.mjs";
import { GOAL_SCALE_SYSTEM, GOAL_SCALE_TAGS, PLAYER_ORDER } from "./frozen.mjs";
import { measureAuthorship, sessionEntries } from "./authorship.mjs";

const round = (x, n = 3) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10 ** n) / 10 ** n);

// ---- the scale of the first goal ------------------------------------------------------------------------------------------

export function goalScaleRequest(message) {
  return { system: GOAL_SCALE_SYSTEM, user: `Rules:\n${GOAL_SCALE_TAGS.map((t) => `- ${t.rule}`).join("\n")}\n\nThe player's message:\n<<<\n${message}\n>>>\n\nAnswer with {"small":0|1,"large":0|1,"reason":"<one short sentence>"}.` };
}
/** small → 1, large → 3, neither (or both) → 2. */
export const scaleOf = (tags) => (!tags ? null : tags.small === 1 && tags.large !== 1 ? 1 : tags.large === 1 && tags.small !== 1 ? 3 : 2);
/** The first message in turns 1–5 the blind judge tagged goal = 1 (an action or a «?» press), or null. */
export function firstGoal(session) {
  for (const t of session.turns ?? []) {
    if (t.k > 5) break;
    if (["action", "question"].includes(t.kind) && session.tags?.player?.[t.k]?.final?.goal === 1) return { k: t.k, message: t.message };
  }
  return null;
}
async function tagGoalScale(session, ask) {
  const goal = firstGoal(session);
  if (!goal) return { goal: null, scale: null };
  const r = await tagTwice({ ask, request: goalScaleRequest(goal.message), tags: GOAL_SCALE_TAGS, purpose: `goal scale ${session.key} t${goal.k}` });
  return { goal, tags: r, scale: scaleOf(r?.final) };
}

/** The stage's scoring of a run record (Table C): authorship and the goal's scale, written into each session's tags. */
export async function scoreStage(runRecord, { ask }) {
  for (const session of runRecord.sessions.filter((s) => s.turns)) {
    const asked = (args) => ask({ ...args, session: `score ${session.key}` });
    session.tags ??= {};
    if (!session.tags.authorship?.numbers) session.tags.authorship = await measureAuthorship(transcriptMarkdown(session), { ask: asked, key: session.key });
    if (!session.tags.goalScale) session.tags.goalScale = await tagGoalScale(session, asked);
  }
}

// ---- Tables A and B (game player 1) ----------------------------------------------------------------------------------------

export const AB_FILE = "game-player-2-ab.json";
/** Game player 1's sessions: its run record (the scored sessions) when there is one, and its transcripts. */
export function gp1Sources(runsDir) {
  const runFiles = existsSync(runsDir) ? readdirSync(runsDir).filter((f) => /^game-player-1-run-\d{8}-\d{6}\.json$/.test(f)).sort() : [];
  const sessions = new Map();
  for (const file of runFiles) {
    const record = JSON.parse(readFileSync(join(runsDir, file), "utf8"));
    for (const s of record.sessions ?? []) if (s.turns && /^[AB]-/.test(s.key)) sessions.set(s.key, { ...s, runFile: file });
  }
  const dir = join(runsDir, "game-player-1-transcripts");
  const transcripts = existsSync(dir) ? Object.fromEntries(readdirSync(dir).filter((f) => /^[AB]-[a-z]+\.md$/.test(f)).map((f) => [f.replace(/\.md$/, ""), join(dir, f)])) : {};
  return { runFiles, sessions, transcripts };
}

/** Words per action and «?» presses from a transcript alone (game player 1's rules: an action is a game message that
 * is neither a «?» press nor the player's end of the session). */
export function transcriptCounts(markdown) {
  const entries = sessionEntries(markdown);
  const player = entries.filter((e) => e.who === "player");
  const actions = player.filter((e) => !isQuestion(e.text) && !isEnd(e.text) && e.text.trim());
  return { turns: player.length, questions: player.filter((e) => isQuestion(e.text)).length, wordsPerAction: median(actions.map((e) => wordsIn(e.text).length)) };
}

/** Measures Tables A and B: authorship from each transcript; the goal's scale on Table B from the run record's tags.
 * `ask({ ..., session, purpose })` is the paid judge call. Returns the record written to docs/runs/game-player-2-ab.json. */
export async function measureAB(runsDir, { ask, log = () => {}, previous = null }) {
  const { runFiles, sessions, transcripts } = gp1Sources(runsDir);
  const keys = [...new Set([...Object.keys(transcripts), ...sessions.keys()])].sort();
  const out = { measuredAt: new Date().toISOString(), runFiles, sessions: [] };
  for (const key of keys) {
    const before = previous?.sessions?.find((s) => s.key === key) ?? null;
    const [table, player] = key.split("-");
    const record = sessions.get(key) ?? null;
    const markdown = transcripts[key] ? readFileSync(transcripts[key], "utf8") : record ? transcriptMarkdown(record) : null;
    const asked = (args) => ask({ ...args, session: `ab ${key}` });
    const authorship = before?.authorship?.numbers ? before.authorship : markdown ? await measureAuthorship(markdown, { ask: asked, key }) : null;
    const goalScale = before?.goalScale ?? (table === "B" && record?.tags?.player ? await tagGoalScale(record, asked) : null);
    out.sessions.push({ key, table, player, source: { transcript: Boolean(transcripts[key]), runFile: record?.runFile ?? null },
      numbers: record ? sessionNumbers(record) : null, counts: markdown ? transcriptCounts(markdown) : null, authorship, goalScale });
    log(`  measured ${key}`);
  }
  return out;
}
export function loadAB(runsDir) {
  const file = join(runsDir, AB_FILE);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

// ---- C0–C4 ------------------------------------------------------------------------------------------------------------------

/** One row per session of any table: the numbers the C lines read. */
export function rowOf(session) {
  const n = sessionNumbers(session);
  return { key: session.key, table: session.table, player: session.player, numbers: n, share: session.tags?.authorship?.numbers?.share ?? null,
    authorship: session.tags?.authorship?.numbers ?? null, wordsPerAction: n.wordsPerAction, scale: session.tags?.goalScale?.scale ?? null, goal: session.tags?.goalScale?.goal ?? null };
}
export function abRows(ab) {
  return (ab?.sessions ?? []).map((s) => ({ key: s.key, table: s.table, player: s.player, numbers: s.numbers, share: s.authorship?.numbers?.share ?? null,
    authorship: s.authorship?.numbers ?? null, wordsPerAction: s.numbers?.wordsPerAction ?? s.counts?.wordsPerAction ?? null, scale: s.goalScale?.scale ?? null, goal: s.goalScale?.goal ?? null }));
}

const range = (xs) => (xs.length === 4 && xs.every((x) => Number.isFinite(x)) ? round(Math.max(...xs) - Math.min(...xs)) : null);
/** C0–C4 from the Table C sessions and, when measured, Tables A and B. */
export function verdictsC(sessions, { refusals = 0, welfareStops = 0, distress = 0 } = {}, ab = null) {
  const rows = [...sessions.map(rowOf), ...abRows(ab)];
  const at = (table) => PLAYER_ORDER.map((p) => rows.find((r) => r.table === table && r.player === p) ?? null);
  const c = at("C"), b = at("B");
  // C1: the spread across the four players, per table.
  const spread = Object.fromEntries(["A", "B", "C"].map((t) => { const list = at(t); return [t, { share: range(list.map((r) => r?.share)), words: range(list.map((r) => r?.wordsPerAction)) }]; }));
  const widest = (m) => (["A", "B", "C"].every((t) => spread[t][m] !== null) ? spread.C[m] > Math.max(spread.A[m], spread.B[m]) : null);
  const c1 = widest("share") === null || widest("words") === null ? null : widest("share") && widest("words");
  // C2: a session the player ended before turn 20, and the message that ended it not distressed.
  const early = sessions.filter((s) => s.ended?.reason === "player" && (s.turns?.length ?? 0) < (s.plannedTurns ?? 20)).map((s) => {
    const end = s.turns.at(-1);
    const check = (s.welfare ?? []).find((w) => w.what === `t${end?.k} player`);
    return { key: s.key, at: end?.k ?? null, message: end?.message ?? "", distress: check?.verdict?.distress ?? null };
  });
  const c2 = sessions.length ? early.some((e) => e.distress === 0) : null;
  // C3: B against C, per player.
  const rate = (r, m) => { const n = r?.numbers; if (!n) return null; if (m === "questions") return n.questionsPerTurn; if (m === "tests") return n.testsPerAction; return n.turns ? round(n.scenes / n.turns) : null; };
  const c3rows = PLAYER_ORDER.map((p, i) => {
    const B = b[i], C = c[i];
    const dir = (m, higherOn) => { const x = rate(B, m), y = rate(C, m); if (x === null || y === null) return null; if (x === y) return 0; return (higherOn === "B" ? x > y : y > x) ? 1 : -1; };
    const d = { questions: dir("questions", "B"), tests: dir("tests", "B"), scenes: dir("scenes", "C") };
    const vals = Object.values(d);
    const known = vals.every((v) => v !== null);
    return { player: p, B: B ? { questions: rate(B, "questions"), tests: rate(B, "tests"), scenes: rate(B, "scenes") } : null, C: C ? { questions: rate(C, "questions"), tests: rate(C, "tests"), scenes: rate(C, "scenes") } : null,
      dir: d, tells: known ? vals.filter((v) => v === 1).length >= 2 && !vals.includes(-1) : null, reverse: known ? vals.filter((v) => v === -1).length >= 2 : null };
  });
  const c3 = c3rows.every((r) => r.tells !== null) ? c3rows.filter((r) => r.tells).length >= 3 : null;
  // C4: every C player names a goal in turns 1–5; the goal smaller on C than on B for at least three of four.
  const c4a = c.every(Boolean) ? c.every((r) => r.numbers.goalFirstFive) : null;
  const c4rows = PLAYER_ORDER.map((p, i) => ({ player: p, B: b[i]?.scale ?? null, C: c[i]?.scale ?? null, smaller: b[i]?.scale && c[i]?.scale ? c[i].scale < b[i].scale : false }));
  const c4b = b.every(Boolean) && c.every(Boolean) ? c4rows.filter((r) => r.smaller).length >= 3 : null;
  return {
    rows,
    C0: { supported: welfareStops === 0 && distress === 0 && refusals <= 1, welfareStops, distress, refusals },
    C1: { supported: c1, spread },
    C2: { supported: c2, early },
    C3: { supported: c3, rows: c3rows, tell: c3rows.filter((r) => r.tells).length, reverse: c3rows.filter((r) => r.reverse).length },
    C4: { supported: c4a === null || c4b === null ? (c4a === false ? false : null) : c4a && c4b, goals: c.map((r, i) => [PLAYER_ORDER[i], r?.numbers.goalFirstFive ?? null]), scale: c4rows, a: c4a, b: c4b },
  };
}

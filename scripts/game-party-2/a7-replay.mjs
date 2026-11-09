#!/usr/bin/env node
// GAME_PARTY_2, Step 1 of the amendment of 2026-11-08 17:35 LA (issue #1): A7 fixed by the harness, not by the guide —
// the test. The DM alone (Claude Opus 5.5, the owner's DM settings, through OpenRouter) re-runs S1-none-T2's nine
// A7-tagged rounds with the players' actions frozen: each scene's round message exactly as the DM received it at T2, on
// the v4 frame (src/lib/gameplay/dm-loop/company.ts COMPANY_CLOSE). No player, relay or bookkeeper is called.
//
// Pass (the amendment's rule): ≥ 8 of 9 rounds without a single-seat hold (MULTI_HERO_1's round tag, unchanged:
// judges.mjs, two Haiku passes and a third on a disagreement) and with every present character's action reflected in the
// narration (the consequence reading below, the same judging). Cap $3 (the meter refuses a call that could pass it).
//
// The request each scene sends is the app's own DM-turn request on the frozen world, captured from the mocked host (no
// key, no call): the frame, the campaign with its guide (the owner's A7 line), the party, the agreed exchanges with the
// DM's secrets (the arm's situation note), the tools. The conversation so far is T2's own (the history rows the app keeps
// for a scene: the opening, then every earlier round's message and narration, oldest first — the «standard» memory budget
// holds all of them). Two known differences from the table, both recorded with the result: the current-state JSON is
// left out (the capture holds the table's start, which would contradict the story by round 4), and a roll the DM calls is
// answered at once by a local d20 (no player presses a card; nothing here reaches a player).
//
//   node --experimental-transform-types scripts/game-party-2/a7-replay.mjs --capture   the request shape (free; mocked host)
//   NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/game-party-2/a7-replay.mjs --run     the paid test
//   NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/game-party-2/a7-replay.mjs --baseline  the consequence
//                                     reading of T2's own nine rounds (Haiku only; the reason (b) was not taken)
import { randomInt } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { RUNS, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createMeter, WAITS_429 } from "../game-player-1/paid.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { judgeCall, throughDoor } from "../game-player-1/players.mjs";
import { jsonIn } from "../game-player-1/welfare.mjs";
import { ANTHROPIC_URL } from "../persona-emotions/providers.mjs";
import { judge, parseRound, roundRequest, JUDGES } from "../multi-hero-1/judges.mjs";
import { CHARACTERS } from "../multi-hero-1/sheets.mjs";
import { LEDGER_CLOSE, LEDGER_OPEN } from "../../src/lib/gameplay/dm-loop/roles.ts";
import { COMPANY_CLOSE } from "../../src/lib/gameplay/dm-loop/company.ts";

export const T2_FILE = join(RUNS, "game-party-2-run-20261102-070749.json");
export const OUT_STEM = join(RUNS, "game-party-2-a7-replay");
export const CAPTURE_FILE = join(tmpdir(), "game-party-2-a7-capture.json");
/** S1-none-T2's rounds tagged «waits» (its record: table.initiative). */
export const A7_ROUNDS = [1, 2, 5, 6, 8, 11, 13, 14, 15];
export const A7_CAP_USD = 3;
export const PASS_AT = 8;
export const DM_MODEL = "claude-opus-5-5";
/** The DM turn's output bound here (the app asks 64000): T2's DM turns wrote at most 7219 output tokens (thinking, the
 * narration and its ledger), and the meter's worst case per call stays well inside the $3. */
export const DM_MAX_TOKENS = 8000;
const MAX_TOOL_STEPS = 4;
const NAMES = CHARACTERS.map((c) => c.name);
const nameOf = (v) => (typeof v === "string" ? NAMES.find((n) => n === v || n.split(" ")[0] === v) ?? null : null);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

// ---- the request ------------------------------------------------------------------------------------------------------------

/** The captured request's system blocks, by part: the frame, the campaign, the history rows, the party/agreed blocks,
 * and the last block (variety, retrieved memory, the current state). */
export function partsOf(body) {
  const blocks = body.system ?? [];
  const historyAt = blocks.findIndex((b) => /^Recent scenes and exchanges/.test(b.text));
  const partyAt = blocks.findIndex((b) => /^Party — the player characters/.test(b.text));
  if (!/^You are the game master of a private, long-running/.test(blocks[0]?.text ?? "")) throw new Error("the capture's first block is not the DM's frame");
  if (historyAt < 0 || partyAt < historyAt) throw new Error("the capture has no history rows before the party block");
  return { frame: blocks[0], campaign: blocks.slice(1, historyAt), history: blocks.slice(historyAt, partyAt), after: blocks.slice(partyAt) };
}
/** The history rows a scene of round `n` reads: the capture's rows before round 1 (the note, the opening), then T2's
 * rounds before n — each scene's message and narration, as the app stores them. */
export function historyRows(captured, t2, n) {
  const before = captured.history.map((b, i) => (i === 0 ? b.text.replace(/^Recent scenes and exchanges \(oldest first; the conversation so far, public\):\n/, "") : b.text));
  const rows = [...before];
  for (const round of t2.table.rounds.slice(0, n - 1))
    for (const scene of round.scenes ?? []) if (scene.input && scene.narration) rows.push(`[player] ${scene.input}`, `[narration] ${scene.narration}`);
  return rows;
}
/** The last block without its current-state JSON (the table's start; see the header). */
export function withoutState(text) {
  const at = text.search(/\n\n(?:Current state|Current public state|State now)[^\n]*:/i);
  return at < 0 ? text : text.slice(0, at);
}
/** One scene's DM-turn request (Console shape; the door rewrites it for OpenRouter). Cache marks (four, the API's limit):
 * the frame, the campaign, the last history row (the next scene reads the shared story from the cache), the last system
 * block (a tool step reads the whole system from the cache). */
export function sceneRequest(captured, t2, n, scene) {
  const rows = historyRows(captured, t2, n);
  const history = rows.map((text, i) => ({ type: "text", text: i === 0 ? `Recent scenes and exchanges (oldest first; the conversation so far, public):\n${text}` : text }));
  history[history.length - 1] = { ...history.at(-1), cache_control: { type: "ephemeral" } };
  const after = captured.after.map((b, i, all) => ({ type: "text", text: i === all.length - 1 ? withoutState(b.text) : b.text })).filter((b) => b.text.trim());
  if (after.length) after[after.length - 1] = { ...after.at(-1), cache_control: { type: "ephemeral" } };
  const strip = (block) => ({ type: block.type ?? "text", text: block.text });
  const system = [{ ...strip(captured.frame), cache_control: { type: "ephemeral" } }, ...captured.campaign.map(strip).map((b, i, all) => (i === all.length - 1 ? { ...b, cache_control: { type: "ephemeral" } } : b)),
    ...history, ...after];
  return { model: DM_MODEL, max_tokens: DM_MAX_TOKENS, output_config: captured.output_config ?? { effort: "high" }, system, tools: captured.tools,
    messages: [{ role: "user", content: [{ type: "text", text: `Player: ${scene.input}` }] }] };
}

// ---- the tools (answered here; nothing reaches a player) -----------------------------------------------------------------------

const LADDER = { easy: 8, normal: 10, hard: 13, very_hard: 16, nearly_impossible: 19 };
/** A roll the DM calls, answered at once: the formula's dice and modifier, the fiction's bonuses, the ladder's difficulty. */
export function localRoll(input, rand = (n) => randomInt(1, n + 1)) {
  const formula = String(input.formula ?? "1d20");
  const m = /^(\d*)d(\d+)\s*([+-]\s*\d+)?/.exec(formula.replace(/\s+/g, "")) ?? [null, "1", "20", null];
  const count = Number(m[1] || 1), sides = Number(m[2] || 20), modifier = Number(String(m[3] ?? "0").replace(/\s+/g, ""));
  const bonus = (input.bonuses ?? []).reduce((s, b) => s + (Number(b?.value) || 0), 0);
  const dice = Array.from({ length: count }, () => rand(sides));
  const kept = dice.reduce((s, d) => s + d, 0);
  const dc = Number.isFinite(input.dc) ? input.dc : LADDER[input.difficulty] ?? null;
  const total = kept + modifier + bonus;
  const natural = sides === 20 && count === 1 ? (dice[0] === 20 ? 20 : dice[0] === 1 ? 1 : null) : null;
  const success = dc === null ? null : natural === 20 ? true : natural === 1 ? false : total >= dc;
  return { ok: true, dc, dice, kept, actor: input.actorRef ?? null, total, reason: input.reason ?? null, bonuses: input.bonuses ?? [], formula, natural, success, modifier: modifier + bonus,
    advantage: input.advantage ?? "normal", difficulty: input.difficulty ?? null, visibility: input.visibility ?? "player", kind: input.kind ?? "skill" };
}
const toolAnswer = (use) => (use.name === "roll" ? localRoll(use.input ?? {}) : use.name === "recall" ? { ok: true, rows: [], note: "nothing found" } : { ok: false, error: `unknown tool ${use.name}` });

/** The narration as the app keeps it: the turn's text blocks, the ledger left out. */
export function narrationOf(texts) {
  const all = texts.join("").trim();
  const at = all.indexOf(LEDGER_OPEN);
  const end = all.indexOf(LEDGER_CLOSE);
  return (at < 0 ? all : `${all.slice(0, at)}${end > at ? all.slice(end + LEDGER_CLOSE.length) : ""}`).trim();
}

/** One scene's DM turn: the request, then its tool steps (at most four), each a paid call through the meter. */
async function dmTurn({ meter, keys, body, session, purpose, log }) {
  const fetcher = throughDoor(keys.door, meter.fetch);
  const messages = [...body.messages];
  const texts = [];
  const steps = [];
  for (let step = 0; step <= MAX_TOOL_STEPS; step++) {
    const result = await paidCall({ meter, session, purpose: `${purpose}${step ? ` step ${step + 1}` : ""}`, log, call: async () => {
      const response = await fetcher(ANTHROPIC_URL, { method: "POST", headers: { "x-api-key": keys.anthropic, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ ...body, messages }), signal: AbortSignal.timeout(300_000) });
      const value = await response.json().catch(() => null);
      if (!response.ok || !value) return { text: "", usage: {}, error: `HTTP ${response.status}: ${String(value?.error?.message ?? "").slice(0, 120)}` };
      return { text: "", usage: value.usage ?? {}, stopReason: value.stop_reason ?? null, content: value.content ?? [], servedModel: value.model ?? null, error: null };
    } });
    if (result.notSent || result.error || result.stopReason === "refusal") return { narration: narrationOf(texts), steps, failure: result.notSent ? "not sent" : result.error ?? "refusal" };
    const content = result.content ?? [];
    texts.push(...content.filter((b) => b.type === "text").map((b) => b.text ?? ""));
    const uses = content.filter((b) => b.type === "tool_use");
    steps.push({ stopReason: result.stopReason, tools: uses.map((u) => ({ name: u.name, input: u.input })), usage: result.usage });
    if (result.stopReason !== "tool_use" || !uses.length) break;
    messages.push({ role: "assistant", content: content.filter((b) => b.type !== "thinking" || b.signature) });
    messages.push({ role: "user", content: uses.map((u) => ({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(toolAnswer(u)) })) });
  }
  return { narration: narrationOf(texts), steps, failure: null };
}

// ---- the consequence reading ------------------------------------------------------------------------------------------------

export const REFLECT_SYSTEM = "You are a blind evaluator. You read one round of a tabletop role-playing game with three player characters — what each character's player wrote, and the game master's narration — and tag whether the narration takes up each character's action, against rules written before any game existed. You are not told who the players are or why the game was recorded, and it must not matter. Answer with one JSON object and nothing else.";
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };
export function reflectRequest(round) {
  const parts = [`Round ${round.n}.`];
  for (const scene of round.scenes ?? []) {
    parts.push("", `Scene — characters present: ${scene.members.join(", ")}.`, "", "What each character's player wrote (in the order the game master received them):");
    for (const m of scene.messages ?? []) parts.push(`<<< ${m.name}:\n${clip(m.kind === "action" || m.kind === "waiting" ? m.text : "(Wrote nothing this round.)", 4000)}\n>>>`);
    parts.push("", "The game master's narration:", `<<<\n${clip(scene.narration ?? "(none)", 12000)}\n>>>`);
  }
  const acted = [...new Set((round.scenes ?? []).flatMap((s) => (s.messages ?? []).filter((m) => m.kind === "action").map((m) => m.name)))];
  return { system: REFLECT_SYSTEM, user: [`The characters who acted this round: ${acted.join(", ")}.`, "", "Rules:",
    "- reflected = for each character who acted, true when the narration takes up what that character's player wrote this round — resolves it, answers it, or narrates what came of it (an attempt that fails or is interrupted counts) — and false when the narration leaves it out or acts as if it was not written.",
    "- open = the characters the narration names as still having a question, an offer or a choice to answer (in the story or in a note to the players), whether or not anything waits on it; empty when none.",
    "", parts.join("\n"), "", `Answer with {"reflected": {"<name>": true|false, …}, "open": ["<name>", …], "reason": "<one short sentence>"}.`].join("\n"), acted };
}
export function parseReflect(text, acted = NAMES) {
  const v = jsonIn(text);
  if (!v || typeof v !== "object" || !v.reflected || typeof v.reflected !== "object") return null;
  const reflected = {};
  for (const [k, x] of Object.entries(v.reflected)) { const n = nameOf(k); if (n) reflected[n] = x === true; }
  if (!acted.every((n) => n in reflected)) return null;
  return { reflected, open: [...new Set((Array.isArray(v.open) ? v.open : []).map(nameOf).filter(Boolean))].sort(), reason: String(v.reason ?? "").slice(0, 300) };
}

/** Both readings of one round (A7's tag and the consequence reading); null when the run stopped. */
export async function readRound(round, { ask }) {
  const hold = await judge({ ask, request: roundRequest(round), parse: parseRound, key: (x) => ({ waits: x.waits }), purpose: `a7 replay hold r${round.n}` });
  if (!hold) return null;
  const req = reflectRequest(round);
  const reflect = await judge({ ask, request: { system: req.system, user: req.user }, parse: (t) => parseReflect(t, req.acted), key: (x) => ({ reflected: x.reflected }), purpose: `a7 replay reflect r${round.n}` });
  if (!reflect) return null;
  const waits = hold.final?.waits ?? null;
  const reflected = reflect.final?.reflected ?? {};
  const all = req.acted.every((n) => reflected[n] === true);
  return { n: round.n, waits, addressed: hold.final?.addressed ?? [], reflected, allReflected: all, open: reflect.final?.open ?? [], pass: !waits && all, hold, reflect };
}

/** A round of T2's record with each scene's narration replaced (the players' messages as they were). */
export function replayRound(original, narrations) {
  return { n: original.n, scenes: original.scenes.filter((s) => s.narration).map((s, i) => ({ members: s.members, messages: s.messages, narration: narrations[i] ?? "(none)" })) };
}

// ---- the passes -------------------------------------------------------------------------------------------------------------

async function meterFor({ cap, log, dry = false, fetcher = null, keys: given = null }) {
  const keys = given ?? await runKeys();
  if (keys.door?.provider !== "openrouter") throw new Error("this stage goes through OpenRouter: set APP_ANTHROPIC_PROVIDER=openrouter");
  if (!keys.anthropic) throw new Error("the OpenRouter key must be set");
  keys.openai = null; // $0 OpenAI
  const { STAGE_INFO } = await import("./run.mjs");
  const spent = dry ? 0 : (await stageLedgers(STAGE_INFO)).before.openrouter.spentUsd ?? 0;
  const caps = { openrouter: Math.round((spent + cap) * 10000) / 10000 };
  const { before, ledgers } = await stageLedgers({ ...STAGE_INFO, caps }, { dry });
  const meter = createMeter({ ledgers, fetcher: fetcher ?? globalThis.fetch.bind(globalThis), log, waits429: WAITS_429 });
  return { keys, meter, before, ledgers, caps, spentBefore: spent };
}
const judgeAsk = ({ meter, keys, log, session }) => ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session, purpose, log,
  call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });

/** The free capture: one round of the mocked host on the frozen world (S1-none), its first DM-turn request kept. */
export async function capture({ file = CAPTURE_FILE, log = () => {} } = {}) {
  const { playTable, FROZEN_DIR } = await import("./run.mjs");
  const { companyScripted } = await import("../multi-hero-1/scripted.mjs");
  const { requestKind } = await import("../multi-hero-1/run.mjs");
  const { DRY_SCRIPT } = await import("./run.mjs");
  const scripted = companyScripted({ script: DRY_SCRIPT });
  const bodies = [];
  const spy = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url ?? String(input);
    if (/\/v1\/messages$/.test(url) && typeof init.body === "string") { try { const b = JSON.parse(init.body); if (requestKind(b) === "DM turn") bodies.push(b); } catch { /* not JSON */ } }
    return scripted(input, init);
  };
  await playTable({ dir: FROZEN_DIR, arm: "S1-none", seating: { bram: "haiku", sefa: "haiku", pell: "haiku" }, dry: true, rounds: 1, fetcher: spy, out: join(tmpdir(), "game-party-2-a7-capture-out"), label: "a7-capture", log });
  const body = bodies[0];
  if (!body) throw new Error("the mocked host sent no DM turn");
  if (!body.system[0].text.includes(COMPANY_CLOSE)) throw new Error("the captured frame does not carry COMPANY_CLOSE");
  const parts = partsOf(body);
  const captured = { capturedAt: new Date().toISOString(), output_config: body.output_config, tools: body.tools, ...parts };
  await writeFile(file, JSON.stringify(captured));
  return captured;
}

/** The paid test: the nine rounds, the DM alone; then both readings of each; the verdict. */
export async function runReplay({ log = console.log, cap = A7_CAP_USD, dry = false, fetcher = null, keys: given = null, captured: capturedGiven = null, out: outStem = OUT_STEM } = {}) {
  const { spendCheck, bookRun } = await import("./run.mjs");
  if (!dry) await spendCheck({ when: "before the A7 replay (Step 1)", log });
  const captured = capturedGiven ?? (existsSync(CAPTURE_FILE) ? readJson(CAPTURE_FILE) : await capture());
  const t2 = readJson(T2_FILE);
  const { keys, meter, before, ledgers, caps } = await meterFor({ cap, log, dry, fetcher, keys: given });
  log(`A7 replay: the meter's cap is $${caps.openrouter} (this pass at most $${cap})`);
  const out = { stage: "GAME_PARTY_2 Step 1 (the amendment of 2026-11-08 17:35 LA)", table: t2.key, rounds: A7_ROUNDS, frame: { COMPANY_CLOSE }, capturedAt: captured.capturedAt,
    differences: ["the current-state JSON left out (the capture holds the table's start)", "a roll the DM calls answered at once by a local d20; no card is pressed"], dm: DM_MODEL, judges: JUDGES.label, scenes: [], readings: [] };
  try {
    for (const n of A7_ROUNDS) {
      const original = t2.table.rounds[n - 1];
      const narrations = [];
      for (const scene of original.scenes.filter((s) => s.narration && s.input)) {
        const body = sceneRequest(captured, t2, n, scene);
        const turn = await dmTurn({ meter, keys, body, session: "a7-replay", purpose: `a7 replay dm r${n} ${scene.order.join("")}`, log });
        out.scenes.push({ round: n, members: scene.members, input: scene.input, narration: turn.narration, steps: turn.steps, failure: turn.failure, originalNarration: scene.narration });
        narrations.push(turn.narration);
        log(`  r${n} [${scene.order.join(", ")}]: ${turn.failure ? `FAILED (${turn.failure})` : `${turn.narration.split(/\s+/).length} words, ${turn.steps.length} step(s)`}`);
        if (turn.failure) throw new Error(`the DM's turn at r${n} failed: ${turn.failure}`);
      }
      out.readings.push({ n, round: replayRound(original, narrations) });
    }
    const ask = judgeAsk({ meter, keys, log, session: "a7-replay/judge" });
    for (const r of out.readings) {
      const read = await readRound(r.round, { ask });
      if (!read) throw new Error(`the readings stopped at r${r.n}`);
      Object.assign(r, read);
      log(`  r${r.n}: waits ${read.waits ?? "none"}; reflected ${Object.entries(read.reflected).map(([k, v]) => `${k.split(" ")[0]} ${v ? "yes" : "no"}`).join(", ")}; open ${read.open.join(", ") || "none"} → ${read.pass ? "pass" : "FAIL"}`);
    }
  } finally {
    await meter.drain();
    if (!dry) await bookRun(ledgers, before, { what: "the A7 replay (Step 1: the DM alone over S1-none-T2's nine tagged rounds)", file: "game-party-2-a7-replay.json", stopped: meter.stopped });
  }
  const passed = out.readings.filter((r) => r.pass).length;
  out.verdict = { passed, of: A7_ROUNDS.length, needed: PASS_AT, holds: passed >= PASS_AT, noHold: out.readings.filter((r) => !r.waits).length, allReflected: out.readings.filter((r) => r.allReflected).length,
    namesOpenWithoutHold: out.readings.filter((r) => !r.waits && r.open.length).map((r) => r.n) };
  out.spentUsd = Math.round(ledgers.openrouter.runUsd * 10000) / 10000;
  await writeOut(out, outStem);
  if (!dry) await spendCheck({ when: "after the A7 replay (Step 1)", log });
  log(`A7 replay: ${passed} of ${A7_ROUNDS.length} pass (needed ${PASS_AT}) — ${out.verdict.holds ? "PASS" : "FAIL"}; $${out.spentUsd.toFixed(3)}`);
  return out;
}

/** The consequence reading of T2's own nine rounds, as played (Haiku only): what (b) would have had to fix. */
export async function baseline({ log = console.log, cap = 0.5 } = {}) {
  const { bookRun } = await import("./run.mjs");
  const t2 = readJson(T2_FILE);
  const { keys, meter, before, ledgers } = await meterFor({ cap, log });
  const ask = judgeAsk({ meter, keys, log, session: "a7-baseline/judge" });
  const rows = [];
  try {
    for (const n of A7_ROUNDS) {
      const original = t2.table.rounds[n - 1];
      const round = replayRound(original, original.scenes.filter((s) => s.narration).map((s) => s.narration));
      const req = reflectRequest(round);
      const reflect = await judge({ ask, request: { system: req.system, user: req.user }, parse: (t) => parseReflect(t, req.acted), key: (x) => ({ reflected: x.reflected }), purpose: `a7 baseline reflect r${n}` });
      if (!reflect) break;
      const reflected = reflect.final?.reflected ?? {};
      rows.push({ n, waits: t2.table.initiative.rounds[n]?.final?.waits ?? null, reflected, allReflected: req.acted.every((x) => reflected[x] === true), open: reflect.final?.open ?? [], reflect });
      log(`  T2 r${n}: waits ${rows.at(-1).waits ?? "none"}; reflected ${Object.entries(reflected).map(([k, v]) => `${k.split(" ")[0]} ${v ? "yes" : "no"}`).join(", ")}`);
    }
  } finally { await meter.drain(); await bookRun(ledgers, before, { what: "the A7 baseline (the consequence reading of S1-none-T2's nine tagged rounds)", file: "game-party-2-a7-replay.json", stopped: meter.stopped }); }
  const file = `${OUT_STEM}-baseline.json`;
  await writeFile(file, `${JSON.stringify({ table: t2.key, rounds: rows, spentUsd: ledgers.openrouter.runUsd }, null, 2)}\n`);
  log(`A7 baseline: ${rows.filter((r) => r.allReflected).length} of ${rows.length} rounds with every action reflected; $${ledgers.openrouter.runUsd.toFixed(4)}`);
  return rows;
}

async function writeOut(out, stem = OUT_STEM) {
  await mkdir(dirname(stem), { recursive: true });
  await writeFile(`${stem}.json`, `${JSON.stringify(out, null, 2)}\n`);
  const base = existsSync(`${OUT_STEM}-baseline.json`) ? readJson(`${OUT_STEM}-baseline.json`) : null;
  const lines = ["# Game party 2 — Step 1: the A7 frame fix, the DM alone over S1-none-T2's nine tagged rounds", "",
    `Issue #1, the amendment of 2026-11-08 17:35 LA. The DM: Claude Opus 5.5 (the owner's settings) through OpenRouter, alone; the players' actions frozen (each scene's message as T2's DM received it). Judges: ${JUDGES.label}. Cap $${A7_CAP_USD}; spent $${out.spentUsd.toFixed(3)}.`, "",
    `**Verdict: ${out.verdict.passed} of ${out.verdict.of} rounds pass (needed ${out.verdict.needed}) — ${out.verdict.holds ? "PASS" : "FAIL"}.** No single-seat hold: ${out.verdict.noHold} of ${out.verdict.of}; every action reflected: ${out.verdict.allReflected} of ${out.verdict.of}. P-A7 (the DM still names the seat that has not answered, without holding): rounds ${out.verdict.namesOpenWithoutHold.join(", ") || "none"}.`, "",
    "The frame's new sentence (company.ts `COMPANY_CLOSE`):", "", `> ${COMPANY_CLOSE}`, "",
    `Known differences from a table: ${out.differences.join("; ")}.`, "",
    "| Round | T2 as played: waits | Replay: waits | Replay: reflected | Replay: named as open | Pass |", "| --- | --- | --- | --- | --- | --- |",
    ...out.readings.map((r) => { const b = base?.rounds?.find((x) => x.n === r.n); return `| ${r.n} | ${b?.waits ?? "—"}${b ? ` (reflected: ${b.allReflected ? "all" : Object.entries(b.reflected).filter(([, v]) => !v).map(([k]) => `not ${k.split(" ")[0]}`).join(", ")})` : ""} | ${r.waits ?? "none"} | ${Object.entries(r.reflected).map(([k, v]) => `${k.split(" ")[0]} ${v ? "yes" : "no"}`).join(", ")} | ${r.open.join(", ") || "—"} | ${r.pass ? "yes" : "**no**"} |`; }),
    "", "## The narrations, whole (replay)", ""];
  for (const s of out.scenes) lines.push(`### Round ${s.round} — ${s.members.join(", ")}`, "", "````text", s.narration, "````", "", `<details><summary>T2's narration of the same scene, as played</summary>`, "", "````text", s.originalNarration, "````", "</details>", "");
  await writeFile(`${stem}.md`, lines.join("\n"));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`a7-replay: ${error?.stack ?? error}`); process.exit(1); });
  if (argv.includes("--capture")) done(capture().then((c) => console.log(`captured: frame ${c.frame.text.length} chars, campaign ${c.campaign.length} block(s), history ${c.history.length} row(s), after ${c.after.length} block(s), tools ${c.tools.map((t) => t.name).join(", ")}`)));
  else if (argv.includes("--run")) done(runReplay());
  else if (argv.includes("--baseline")) done(baseline());
  else { console.error("give --capture, --baseline or --run"); process.exit(2); }
}

// Multi-hero 1: the blind readings of A7 (each round: whom the DM's call for action addresses, and whether the scene
// waits on one character while the others have acted) and of A8 (each frozen layer: its puzzles, threats and rewards
// with their natural addressee, and the threads with the characters whose hooks they touch). Two Claude Haiku 5.5 passes
// (effort low); on a disagreement a third, whose answer stands — no other model is called in this stage.
import { jsonIn } from "../game-player-1/welfare.mjs";
import { companyLinesOf } from "../../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { CHARACTERS, WHO } from "./sheets.mjs";

export const JUDGES = { label: "Claude Haiku 5.5 twice (effort low), a third pass on a disagreement", model: "claude-haiku-5-5", effort: "low", maxTokens: 4000 };
const NAMES = CHARACTERS.map((c) => c.name);
const nameOf = (v) => (typeof v === "string" ? NAMES.find((n) => n === v || n.split(" ")[0] === v) ?? null : null);
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };

// ---- A7: the round tags ----------------------------------------------------------------------------------------------------

export const ROUND_SYSTEM = "You are a blind evaluator. You read one round of a tabletop role-playing game with three player characters — what each character's player wrote, and the game master's narration — and tag who the game master's narration addresses, against rules written before any game existed. You are not told who the players are or why the game was recorded, and it must not matter. Answer with one JSON object and nothing else.";
export function roundRequest(round) {
  const parts = [`Round ${round.n}.`];
  for (const scene of round.scenes ?? []) {
    parts.push("", `Scene — characters present: ${scene.members.join(", ")}.`, "", "What each character's player wrote (in the order the game master received them):");
    for (const m of scene.messages ?? []) parts.push(`<<< ${m.name}:\n${clip(m.kind === "action" ? m.text : m.kind === "waiting" ? m.text : "(Wrote nothing this round.)", 4000)}\n>>>`);
    parts.push("", "The game master's narration:", `<<<\n${clip(scene.narration ?? "(none)", 12000)}\n>>>`);
  }
  return { system: ROUND_SYSTEM, user: [`The characters: ${NAMES.join(", ")}.`, "", "Rules:",
    "- addressed = the characters the game master's closing question or call for action (\"what do you do?\", a question put to a character, a choice offered) names or speaks to; every character when it speaks to all of them; empty when the narration ends on no question or call.",
    "- waits = the one character whose decision the scene is left waiting on while the other characters present have already acted this round (the narration holds the others back until that one decides, or makes the group's next move depend on that one's consent); null when no single character holds the scene.",
    "", parts.join("\n"), "", `Answer with {"addressed": ["<name>", …], "waits": "<name>"|null, "reason": "<one short sentence>"}.`].join("\n") };
}
export function parseRound(text) {
  const v = jsonIn(text);
  if (!v || typeof v !== "object" || !Array.isArray(v.addressed)) return null;
  return { addressed: [...new Set(v.addressed.map(nameOf).filter(Boolean))].sort(), waits: nameOf(v.waits), reason: String(v.reason ?? "").slice(0, 300) };
}

// ---- A8: the layer ---------------------------------------------------------------------------------------------------------

export const LAYER_SYSTEM = "You are a blind evaluator. You read a game master's hidden layer — the private prep of a tabletop campaign with three player characters — and the three characters' own descriptions, and list what the layer holds against rules written before any layer existed. Answer with one JSON object and nothing else.";
export function layerRequest(file) {
  const characters = CHARACTERS.map((c) => `<<< ${c.name}:\n${WHO[c.id]}\n>>>`).join("\n");
  const threads = (file.threads ?? []).map((t, i) => `${i + 1}. ${t.text}`).join("\n");
  return { system: LAYER_SYSTEM, user: ["The player characters, as their players wrote them:", characters, "",
    "The layer:", `<<<\n${clip(file.layer, 24000)}\n>>>`, "", "Its threads, numbered:", threads || "(none)", "",
    "Rules:",
    "- items = every puzzle (something to work out), threat (something dangerous coming) and reward (something to be won) the layer holds, one each, with for = the one player character who is its natural addressee — whose history, trade, ties or wants it speaks to first — or \"all\" when it speaks to the three equally.",
    "- threads = every numbered thread, with touches = the player characters whose own hooks (their history, trade, ties or wants) it touches; empty when it touches none.",
    "", `Answer with {"items": [{"kind": "puzzle"|"threat"|"reward", "what": "<a few words>", "for": "<name>"|"all"}, …], "threads": [{"thread": <number>, "touches": ["<name>", …]}, …], "reason": "<one short sentence>"}.`].join("\n") };
}
export function parseLayer(text) {
  const v = jsonIn(text);
  if (!v || typeof v !== "object" || !Array.isArray(v.items)) return null;
  const items = v.items.filter((x) => x && ["puzzle", "threat", "reward"].includes(x.kind)).map((x) => ({ kind: x.kind, what: String(x.what ?? "").slice(0, 120), for: x.for === "all" ? "all" : nameOf(x.for) }))
    .filter((x) => x.for);
  const threads = (Array.isArray(v.threads) ? v.threads : []).map((t) => ({ thread: t?.thread ?? null, touches: [...new Set((Array.isArray(t?.touches) ? t.touches : []).map(nameOf).filter(Boolean))] }));
  return { items, threads, reason: String(v.reason ?? "").slice(0, 300) };
}

/** A8's verdict on one reading: every character the natural addressee of ≥ 1 item and none of more than half; every
 * character's hooks touched by ≥ 1 thread. */
export function a8Of(reading) {
  const total = reading.items.length;
  const per = Object.fromEntries(NAMES.map((n) => [n, reading.items.filter((x) => x.for === n).length]));
  const touched = Object.fromEntries(NAMES.map((n) => [n, reading.threads.filter((t) => t.touches.includes(n)).length]));
  const distributed = total > 0 && NAMES.every((n) => per[n] >= 1 && per[n] <= total / 2);
  return { total, all: reading.items.filter((x) => x.for === "all").length, per, touched, distributed, hooks: NAMES.every((n) => touched[n] >= 1), holds: distributed && NAMES.every((n) => touched[n] >= 1) };
}
/** The DM's own addressees in the layer (its company lines). */
export function dmAddressees(layer) {
  const rows = companyLinesOf(layer);
  return { total: rows.length, per: Object.fromEntries(NAMES.map((n) => [n, rows.filter((r) => r.for === n).length])), rows };
}

/** Two passes; a third on a disagreement (its answer stands). `key` picks what must agree. Null when the run stopped. */
export async function judge({ ask, request, parse, key, purpose }) {
  const [ra, rb] = await Promise.all([1, 2].map((pass) => ask({ model: JUDGES.model, ...request, maxTokens: JUDGES.maxTokens, effort: JUDGES.effort, purpose: `${purpose} ${pass}` })));
  if (ra.notSent || rb.notSent) return null;
  const a = parse(ra.text), b = parse(rb.text);
  if (a && b && JSON.stringify(key(a)) === JSON.stringify(key(b))) return { a, b, third: null, final: a };
  const rc = await ask({ model: JUDGES.model, ...request, maxTokens: JUDGES.maxTokens, effort: JUDGES.effort, purpose: `${purpose} 3` });
  if (rc.notSent) return null;
  const c = parse(rc.text);
  return { a, b, third: c, final: c ?? a ?? b, unresolved: !c };
}

/** A7 over a table's record: the tags per round, and the verdict. */
export async function tagRounds(record, { ask, log = () => {} }) {
  const t = record.table;
  t.initiative ??= { rounds: {}, judges: JUDGES.label };
  for (const round of t.rounds ?? []) {
    if (t.initiative.rounds[round.n] || !(round.scenes ?? []).some((s) => s.narration)) continue;
    const tagged = await judge({ ask, request: roundRequest(round), parse: parseRound, key: (x) => ({ waits: x.waits }), purpose: `initiative r${round.n}` });
    if (!tagged) { log(`initiative tags: stopped at round ${round.n}`); break; }
    t.initiative.rounds[round.n] = tagged;
  }
  return t.initiative;
}
export function a7Of(initiative) {
  const rounds = Object.entries(initiative?.rounds ?? {}).map(([n, x]) => ({ n: Number(n), addressed: x.final?.addressed ?? [], waits: x.final?.waits ?? null }));
  const singles = rounds.filter((r) => r.addressed.length === 1).map((r) => r.addressed[0]);
  const sameAlone = rounds.length > 0 && singles.length === rounds.length && new Set(singles).size === 1;
  return { rounds, waits: rounds.filter((r) => r.waits), sameAlone, holds: rounds.length > 0 && !rounds.some((r) => r.waits) && !sameAlone };
}

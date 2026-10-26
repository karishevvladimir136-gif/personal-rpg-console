// Game player replicate 1: the scoring of its own, after game player 1's judges and game player 2's authorship have run
// on a session — the new blind tags (the note's bugs and return, the made thing, the Lady asked after), the counts read
// by rule from the session record (slots, rerolls and declines, Inspiration, money, temples, the swallowed presses), and
// P0–P5 over group 1, group 2 and DeepSeek.
import { tagTwice } from "../game-player-1/measures.mjs";
import { sessionNumbers } from "../game-player-1/score.mjs";
import { BUTTONS, pressedButton } from "../game-player-1/screen.mjs";
import { transcriptMarkdown } from "../game-player-1/report.mjs";
import { HERO_NAME } from "../game-player-1/table.mjs";
import { measureAuthorship } from "../game-player-2/authorship.mjs";
import { firstGoal, goalScaleRequest, scaleOf } from "../game-player-2/score.mjs";
import { GOAL_SCALE_TAGS } from "../game-player-2/frozen.mjs";
import {
  COIN_VALUE, INSPIRATION, LADY_TAGS, MADE_TAGS, MISS, NOTE_EXTRA_SYSTEM, NOTE_EXTRA_TAGS, PACT_SLOTS_PER_SESSION, PLAYER_ORDER, REAL_MONEY_GP, REROLL_SLOTS_PER_SESSION, SLOT, TEMPLE,
  TURN_SYSTEM, WITHIN,
} from "./frozen.mjs";

/** A session is finished when it ended as a result (20 turns, the player's own end, «stuck», a welfare stop, a refusal);
 * one cut by a stop or an error is a cut attempt, played again from a fresh campaign. */
export const FINISHED = new Set(["turns", "player", "stuck", "welfare", "no-check", "refusal"]);

const round = (x, n = 3) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };
const rulesOf = (tags) => tags.map((t) => `- ${t.rule}`).join("\n");
const answerOf = (tags) => `{${tags.map((t) => `"${t.id}":0|1`).join(",")},"reason":"<one short sentence>"}`;

// ---- the new requests ------------------------------------------------------------------------------------------------

export function noteExtraRequest(note) {
  return { system: NOTE_EXTRA_SYSTEM, user: `Rules:\n${rulesOf(NOTE_EXTRA_TAGS)}\n\nThe note:\n<<<\n${note}\n>>>\n\nAnswer with ${answerOf(NOTE_EXTRA_TAGS)}.` };
}
/** One player turn under one of the new turn rubrics (the made thing, the Lady asked after), in game player 1's shape. */
export function turnTagRequest({ before, message, reply }, tags) {
  return { system: TURN_SYSTEM, user: `Rules:\n${rulesOf(tags)}\n\nWhat the game master wrote before (context only):\n<<<\n${clip(before, 6000) || "(nothing: this is the first message of the session)"}\n>>>\n\nThe player's message (tag this):\n<<<\n${message}\n>>>\n\nThe game master's reply (context only):\n<<<\n${clip(reply, 6000)}\n>>>\n\nAnswer with ${answerOf(tags)}.` };
}

/**
 * The new tags of one session, written to `session.tags.replicate` (each kept when already there): the note's three
 * tags, `made` on every action, `lady` on the actions and «?» presses of turns 1–5 at Table B. `ask({ model, system,
 * user, maxTokens, effort, purpose })` is the paid judge call in the session's metering context.
 */
export async function tagExtra(session, { ask, log = () => {} }) {
  const tags = (session.tags ??= {});
  const mine = (tags.replicate ??= {});
  const turns = session.turns ?? [];
  if (session.note?.text && !mine.note) {
    const r = await tagTwice({ ask, request: noteExtraRequest(session.note.text), tags: NOTE_EXTRA_TAGS, purpose: `note extra ${session.key}` });
    if (r) mine.note = r;
  }
  mine.made ??= {};
  for (const [i, t] of turns.entries()) {
    if (t.kind !== "action" || mine.made[t.k]) continue;
    const before = i === 0 ? session.opening?.text ?? "" : turns[i - 1].reply ?? "";
    const r = await tagTwice({ ask, request: turnTagRequest({ before, message: t.message, reply: t.reply ?? "" }, MADE_TAGS), tags: MADE_TAGS, purpose: `made ${session.key} t${t.k}` });
    if (r) mine.made[t.k] = r;
  }
  if (session.table === "B") {
    mine.lady ??= {};
    for (const [i, t] of turns.entries()) {
      if (t.k > 5 || !["action", "question"].includes(t.kind) || mine.lady[t.k]) continue;
      const before = i === 0 ? session.opening?.text ?? "" : turns[i - 1].reply ?? "";
      const r = await tagTwice({ ask, request: turnTagRequest({ before, message: t.message, reply: t.reply ?? "" }, LADY_TAGS), tags: LADY_TAGS, purpose: `lady ${session.key} t${t.k}` });
      if (r) mine.lady[t.k] = r;
    }
  }
  log(`  tagged (replicate) ${session.key}`);
  return mine;
}

/** As group 1 was scored beyond game player 1's judges: the authorship of threads on every table (game player 2's two
 * Opus passes over the transcript) and, on Tables B and C, the first goal's scale. */
export async function scoreAsGroup1(session, { ask }) {
  session.tags ??= {};
  if (!session.tags.authorship?.numbers) session.tags.authorship = await measureAuthorship(transcriptMarkdown(session), { ask, key: session.key });
  if (["B", "C"].includes(session.table) && !session.tags.goalScale) {
    const goal = firstGoal(session);
    if (!goal) session.tags.goalScale = { goal: null, scale: null };
    else {
      const r = await tagTwice({ ask, request: goalScaleRequest(goal.message), tags: GOAL_SCALE_TAGS, purpose: `goal scale ${session.key} t${goal.k}` });
      session.tags.goalScale = { goal, tags: r, scale: scaleOf(r?.final) };
    }
  }
}

// ---- counts by rule, from the session record ----------------------------------------------------------------------------

/** The buttons a screen offered (its last line of [Name] tokens), as the harness drew them. */
export function offeredOf(screen) {
  const last = String(screen ?? "").trim().split("\n").at(-1) ?? "";
  return [...last.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).filter((name) => Object.values(BUTTONS).includes(name));
}

/** Every message written at a waiting card, with the screen it answered: [{ k, n, screen, text, offered, button }]. */
export function cardPresses(session) {
  const out = [];
  const screens = session.screens ?? [], messages = session.messages ?? [];
  for (let i = 0; i < messages.length; i++) {
    const m = String(messages[i].purpose ?? "").match(/^player t(\d+) card (\d+)$/);
    if (!m) continue;
    const offered = offeredOf(screens[i]);
    out.push({ k: Number(m[1]), n: Number(m[2]), screen: screens[i] ?? "", text: messages[i].text ?? "", offered, button: pressedButton(messages[i].text, offered) });
  }
  return out;
}

/** The presses the frozen rule did not read as a press, split by what they were. */
export function swallowedOf(session) {
  const rows = cardPresses(session).filter((p) => !p.button);
  const named = (text) => Object.values(BUTTONS).some((name) => new RegExp(`\\[?${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]?`, "i").test(text));
  const kind = (p) => (named(p.text) ? "button with a note" : /^[\s«"'“*(]*\?/.test(p.text) ? "«?» question" : "other");
  const list = rows.map((p) => ({ k: p.k, kind: kind(p), text: p.text }));
  return { count: list.length, withNote: list.filter((x) => x.kind === "button with a note").length, questions: list.filter((x) => x.kind === "«?» question").length,
    other: list.filter((x) => x.kind === "other").length, stuck: session.ended?.reason === "stuck", list };
}

/** Whether a card screen shows one of the hero's own rolls revealed as a miss (a card block «[Roll card] <hero> · …» with a
 * «Failure — n» or «A natural one — n» line). */
export function heroMissOn(screen, hero = HERO_NAME) {
  const blocks = String(screen ?? "").split(/\n(?=\[Roll card\] )/);
  return blocks.some((block) => block.startsWith(`[Roll card] ${hero} · `) && MISS.test(block));
}
/** Rerolls the app received, and the declines on a miss (Onward on a screen that offered the reroll beside the hero's
 * own failed roll). */
export function rerollsOf(session) {
  const presses = cardPresses(session);
  const spent = presses.filter((p) => p.button === BUTTONS.reroll).map((p) => p.k);
  const declines = presses.filter((p) => p.button === BUTTONS.onward && p.offered.includes(BUTTONS.reroll) && heroMissOn(p.screen)).map((p) => p.k);
  const offeredOnMiss = presses.filter((p) => p.offered.includes(BUTTONS.reroll) && heroMissOn(p.screen) && p.button).length;
  return { spent: spent.length, spentAt: spent, declines: declines.length, declinedAt: declines, offeredOnMiss };
}

const changesOf = (session) => (session.turns ?? []).flatMap((t) => (t.changes ?? []).map((c) => ({ k: t.k, ...c })));
/** Pact-slot spends on the records (a slot counter that goes down), by the drop. */
export function slotsOf(session) {
  const rows = changesOf(session).map((c) => ({ k: c.k, m: String(c.summary ?? "").match(SLOT), summary: c.summary })).filter((r) => r.m && Number(r.m[2]) < Number(r.m[1]));
  return { spent: rows.reduce((s, r) => s + (Number(r.m[1]) - Number(r.m[2])), 0), at: rows.map((r) => ({ k: r.k, summary: String(r.summary).slice(0, 200) })) };
}
/** Heroic Inspiration awarded (the counter goes up) and spent (it goes down). */
export function inspirationOf(session) {
  const rows = changesOf(session).map((c) => ({ k: c.k, m: String(c.summary ?? "").match(INSPIRATION), summary: c.summary })).filter((r) => r.m);
  const up = rows.filter((r) => Number(r.m[2]) > Number(r.m[1])), down = rows.filter((r) => Number(r.m[2]) < Number(r.m[1]));
  return { awarded: up.length, spent: down.length, awardedAt: up.map((r) => ({ k: r.k, summary: String(r.summary).slice(0, 240) })), spentAt: down.map((r) => ({ k: r.k, summary: String(r.summary).slice(0, 240) })) };
}

const PURSE = /^([+−-])\s*(\d+(?:\.\d+)?)\s*(pp|gp|ep|sp|cp)s?\b\s*(?:([→←])\s*([^()]+?))?\s*(?:\(|$)/i;
/** The net value (gp) that left the hero's own purse, moves into his own holdings left out. */
export function moneyOf(session) {
  const changes = changesOf(session);
  const holdings = changes.filter((c) => c.tool === "holding").map((c) => String(c.summary ?? "").replace(/^[^:]+:\s*/, "").trim().toLowerCase()).filter(Boolean);
  let net = 0;
  const rows = [];
  for (const c of changes.filter((x) => x.tool === "money")) {
    const m = String(c.summary ?? "").trim().match(PURSE);
    if (!m) continue;
    const counterparty = (m[5] ?? "").trim().toLowerCase();
    if (counterparty && holdings.includes(counterparty)) continue;
    const value = (m[1] === "+" ? 1 : -1) * Number(m[2]) * COIN_VALUE[m[3].toLowerCase()];
    net += value;
    if (value <= -1) rows.push({ k: c.k, summary: String(c.summary).slice(0, 160) });
  }
  const outflow = round(-net, 2) + 0;
  return { outflowGp: outflow, real: outflow !== null && outflow >= REAL_MONEY_GP, largest: rows };
}
/** The houses of worship the hero stood in (the place record after a turn). */
export function templesOf(session) {
  const seen = [];
  for (const t of session.turns ?? []) if (t.place?.name && TEMPLE.test(t.place.name) && !seen.some((s) => s.name === t.place.name)) seen.push({ k: t.k, name: t.place.name });
  return seen;
}

// ---- the numbers of one session -----------------------------------------------------------------------------------------

const finalOf = (r) => r?.final ?? null;
export function rowOf(session, extra = session.tags?.replicate ?? null) {
  const n = sessionNumbers(session);
  const made = Object.entries(extra?.made ?? {}).filter(([, r]) => finalOf(r)?.made === 1).map(([k]) => Number(k));
  const lady = Object.entries(extra?.lady ?? {}).filter(([, r]) => finalOf(r)?.lady === 1).map(([k]) => Number(k));
  return {
    ...n, seat: /-(\d)$/.test(session.key) ? Number(session.key.at(-1)) : null,
    authorship: session.tags?.authorship?.numbers ?? session.authorship?.numbers ?? null, goalScale: session.tags?.goalScale?.scale ?? null,
    noteExtra: finalOf(extra?.note), made: made.length, madeAt: made, ladyFirstFive: session.table === "B" ? lady.filter((k) => k <= 5).length > 0 : null, ladyAt: lady,
    swallowed: swallowedOf(session), rerolls: rerollsOf(session), slots: slotsOf(session), inspiration: inspirationOf(session), money: moneyOf(session), temples: templesOf(session),
    stuck: session.ended?.reason === "stuck", note: n.note, noteText: session.note?.text ?? null, afterText: session.after?.text ?? null, refusals: null,
  };
}

// ---- P0–P5 ------------------------------------------------------------------------------------------------------------------

const all = (list, test) => (list.length ? list.every(test) : null);
const mean = (xs) => { const v = xs.filter((x) => Number.isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
/** Whether group 2's value is within 20 % of group 1's (an equal value only, when group 1's is 0). */
export const within = (g1, g2, by = WITHIN) => (!Number.isFinite(g1) || !Number.isFinite(g2) ? null : g1 === 0 ? g2 === 0 : Math.abs(g2 - g1) <= by * Math.abs(g1));
/** Euclidean distance on standardised counts. `rows` are { id, counts: { name: value } }. */
export function standardised(rows, names) {
  const kept = names.filter((name) => { const v = rows.map((r) => r.counts[name]); const m = mean(v); return v.every(Number.isFinite) && Math.sqrt(mean(v.map((x) => (x - m) ** 2))) > 0; });
  const stats = Object.fromEntries(kept.map((name) => { const v = rows.map((r) => r.counts[name]); const m = mean(v); return [name, { m, sd: Math.sqrt(mean(v.map((x) => (x - m) ** 2))) }]; }));
  const z = Object.fromEntries(rows.map((r) => [r.id, kept.map((name) => (r.counts[name] - stats[name].m) / stats[name].sd)]));
  return { kept, distance: (a, b) => Math.sqrt(z[a].reduce((s, x, i) => s + (x - z[b][i]) ** 2, 0)) };
}
export const COUNT_NAMES = ["doShare", "testsPerAction", "questionsPerTurn", "wordsPerAction"];

/**
 * P0–P5. `g1`, `g2`, `ds` are rows (rowOf) of group 1, group 2 and DeepSeek; `money` { door: { spent, cap } }; `refusals`
 * per session key (players, DM, checks) and the judges' apart; `welfare` { stops, distress } over this stage's sessions.
 */
export function verdictsP({ g1, g2, ds, money = {}, refusals = {}, judgeRefusals = 0, welfare = { stops: 0, distress: 0 } }) {
  const at = (rows, table) => rows.filter((r) => r.table === table);
  const cellOf = (rows, table, player) => rows.find((r) => r.table === table && r.player === player) ?? null;
  const complete = g2.length === 12;
  // P1.
  const g1A = at(g2, "A");
  const slots = g2.reduce((s, r) => s + r.slots.spent, 0), rerolls = g2.reduce((s, r) => s + r.rerolls.spent, 0), declines = g2.reduce((s, r) => s + r.rerolls.declines, 0);
  const ladyPlayers = at(g2, "B").filter((r) => r.ladyFirstFive === true).length;
  const p1 = {
    G1: { holds: g1A.length === 4 ? all(g1A, (r) => r.doShare !== null && r.doShare >= 0.6) : null, A: g1A.map((r) => [r.player, r.doShare]) },
    G2: { holds: g1A.length === 4 ? all(g1A, (r) => r.tests >= 3) : null, A: g1A.map((r) => [r.player, r.tests]), B: at(g2, "B").map((r) => [r.player, r.tests]), C: at(g2, "C").map((r) => [r.player, r.tests]) },
    G4: { holds: complete ? all(g2, (r) => r.note && r.note.broke === 1 && r.note.missing === 1 && r.note.praise_only === 0) : null, notes: g2.map((r) => [r.key, r.note]) },
    slots: { holds: complete ? slots <= 2 : null, spent: slots, of: PACT_SLOTS_PER_SESSION * g2.length },
    rerolls: { holds: complete ? rerolls <= 10 && declines >= 3 : null, spent: rerolls, of: REROLL_SLOTS_PER_SESSION * g2.length, declines },
    lady: { holds: at(g2, "B").length === 4 ? ladyPlayers >= 3 : null, players: ladyPlayers, B: at(g2, "B").map((r) => [r.player, r.ladyAt]) },
  };
  p1.holds = Object.values(p1).some((x) => x.holds === false) ? false : Object.values(p1).every((x) => x.holds === true) ? true : null;
  // P2: the four draws, by player.
  const only = (rows, player, test) => { const yes = rows.filter(test); return { players: [...new Set(yes.map((r) => r.player))], repeats: rows.length ? yes.some((r) => r.player === player) && yes.every((r) => r.player === player) : null }; };
  const draws = {
    money: { what: "Fable the only one to spend real money", g1: only(g1, "fable", (r) => r.money.real), g2: only(g2, "fable", (r) => r.money.real) },
    temple: { what: "Sol the only one to reach a temple", g1: only(g1, "sol", (r) => r.temples.length > 0), g2: only(g2, "sol", (r) => r.temples.length > 0) },
    inspiration: { what: "Inspiration awarded only to Fable", g1: only(g1, "fable", (r) => r.inspiration.awarded > 0), g2: only(g2, "fable", (r) => r.inspiration.awarded > 0) },
    stuck: { what: "Opus stuck on a pending card", g1: { players: [...new Set(g1.filter((r) => r.stuck).map((r) => r.player))], repeats: g1.some((r) => r.player === "opus" && r.stuck) },
      g2: { players: [...new Set(g2.filter((r) => r.stuck).map((r) => r.player))], repeats: complete ? g2.some((r) => r.player === "opus" && r.stuck) : null } },
  };
  if (!complete) for (const d of Object.values(draws)) d.g2.repeats = null;
  const known = Object.values(draws).map((d) => d.g2.repeats);
  const failed = known.filter((x) => x === false).length;
  const p2 = { draws, holds: known.includes(null) ? (failed >= 1 ? true : null) : failed >= 1, bet: known.includes(null) ? (failed >= 2 ? true : null) : failed >= 2, failed };
  // P3.
  const noteCount = (rows, id) => rows.filter((r) => r.noteExtra?.[id] === 1).length;
  const p3 = { cardBug: noteCount(g2, "card_bug"), swallowed: noteCount(g2, "swallowed"), wouldReturn: noteCount(g2, "would_return"), of: g2.filter((r) => r.noteExtra).length,
    g1: { cardBug: noteCount(g1, "card_bug"), swallowed: noteCount(g1, "swallowed"), wouldReturn: noteCount(g1, "would_return"), of: g1.filter((r) => r.noteExtra).length },
    ds: { cardBug: noteCount(ds, "card_bug"), swallowed: noteCount(ds, "swallowed"), wouldReturn: noteCount(ds, "would_return"), of: ds.filter((r) => r.noteExtra).length } };
  p3.holds = complete && p3.of === 12 ? p3.cardBug >= 10 && p3.swallowed >= 6 && p3.wouldReturn >= 8 : null;
  // P4.
  const measures = ["doShare", "testsPerAction", "wordsPerAction"];
  const p4rows = PLAYER_ORDER.map((player) => {
    const cells = ["A", "B", "C"].flatMap((table) => measures.map((m) => { const a = cellOf(g1, table, player)?.[m] ?? null, b = cellOf(g2, table, player)?.[m] ?? null; return { table, measure: m, g1: a, g2: b, within: within(a, b) }; }));
    return { player, cells, holds: cells.some((c) => c.within === null) ? null : cells.every((c) => c.within), within: cells.filter((c) => c.within === true).length, of: cells.length };
  });
  const p4 = { rows: p4rows, holds: p4rows.some((r) => r.holds === null) ? null : p4rows.filter((r) => r.holds).length >= 3, players: p4rows.filter((r) => r.holds).length,
    cellsWithin: p4rows.reduce((s, r) => s + r.within, 0), cells: p4rows.reduce((s, r) => s + r.of, 0) };
  // P5.
  const neighbours = ["A", "B", "C"].map((table) => {
    const rows = [...at(g1, table).map((r) => ({ id: `g1 ${r.key}`, r })), ...at(g2, table).map((r) => ({ id: `g2 ${r.key}`, r })), ...at(ds, table).map((r) => ({ id: r.key, r }))];
    const pair = rows.filter((x) => x.r.player === "deepseek");
    if (rows.length !== 10 || pair.length !== 2 || rows.some((x) => COUNT_NAMES.some((n) => !Number.isFinite(x.r[n])))) return { table, holds: null, sessions: rows.length };
    const { kept, distance } = standardised(rows.map((x) => ({ id: x.id, counts: Object.fromEntries(COUNT_NAMES.map((n) => [n, x.r[n]])) })), COUNT_NAMES);
    if (!kept.length) return { table, holds: null, kept };
    const others = rows.filter((x) => x.r.player !== "deepseek");
    const between = distance(pair[0].id, pair[1].id);
    const nearestOther = (x) => others.map((o) => ({ id: o.id, d: distance(x.id, o.id) })).sort((a, b) => a.d - b.d)[0];
    const n0 = nearestOther(pair[0]), n1 = nearestOther(pair[1]);
    return { table, kept, between: round(between), nearest: [{ of: pair[0].id, ...n0, d: round(n0.d) }, { of: pair[1].id, ...n1, d: round(n1.d) }], holds: between < n0.d && between < n1.d };
  });
  const playerMean = (rows, player, m) => round(mean(rows.filter((r) => r.player === player).map((r) => r[m])), 1);
  const dsWords = round(mean(ds.map((r) => r.wordsPerAction)), 1);
  const register = { deepseek: dsWords, astra: playerMean(g2, "astra", "wordsPerAction"), sol: playerMean(g2, "sol", "wordsPerAction"), fable: playerMean(g2, "fable", "wordsPerAction"),
    g1: { astra: playerMean(g1, "astra", "wordsPerAction"), sol: playerMean(g1, "sol", "wordsPerAction"), fable: playerMean(g1, "fable", "wordsPerAction") } };
  const dsComplete = ds.length === 6;
  const p5 = {
    neighbours: { holds: neighbours.some((n) => n.holds === null) ? null : neighbours.every((n) => n.holds), tables: neighbours },
    notes: { holds: dsComplete ? all(ds, (r) => r.note && r.note.broke === 1 && r.note.missing === 1) : null, notes: ds.map((r) => [r.key, r.note]) },
    words: { holds: dsComplete && [register.astra, register.sol, register.fable].every(Number.isFinite) ? dsWords > Math.max(register.astra, register.sol) && dsWords < register.fable : null, ...register },
    tests: { holds: dsComplete ? all(ds, (r) => r.tests >= 3) : null, per: ds.map((r) => [r.key, r.tests]) },
    made: { holds: dsComplete ? ds.filter((r) => r.made > 0).length >= 2 : null, sessions: ds.filter((r) => r.made > 0).length, per: ds.map((r) => [r.key, r.made, r.madeAt]),
      others: { g1: g1.filter((r) => r.made > 0).map((r) => r.key), g2: g2.filter((r) => r.made > 0).map((r) => r.key) } },
  };
  p5.holds = Object.values(p5).some((x) => x.holds === false) ? false : Object.values(p5).every((x) => x.holds === true) ? true : null;
  // P0.
  const perSession = Object.entries(refusals);
  const capsOk = Object.values(money).every((d) => d.spent <= d.cap + 1e-9);
  const p0 = { welfare: welfare.stops === 0 && welfare.distress === 0, refusals: perSession.every(([, n]) => n <= 1), capsOk, perSession, judgeRefusals, ...welfare, money };
  p0.holds = p0.welfare && p0.refusals && p0.capsOk;
  return { P0: p0, P1: p1, P2: p2, P3: p3, P4: p4, P5: p5 };
}

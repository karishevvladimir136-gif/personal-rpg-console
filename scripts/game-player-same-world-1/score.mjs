// Game player same-world 1: the scoring of its own, after REPLICATE_1's scoring has run on a session — the thread overlap
// against the table's frozen layer, the world felt prepared or improvised, the road code — and, over all sessions, the
// same-road pairs, the nearest-neighbour test with its exact p, and W1–W5.
import { tagTwice, wordsIn } from "../game-player-1/measures.mjs";
import { jsonIn } from "../game-player-1/welfare.mjs";
import { BUTTONS, pressWithText, pressedButton } from "../game-player-1/screen.mjs";
import { cardPresses, heroMissOn, rowOf as replicateRowOf, scoreAsGroup1, tagExtra } from "../game-player-replicate-1/score.mjs";
import { FAMILIES, NN_COUNTS, OVERLAP_RULE, OVERLAP_SYSTEM, ROAD_SYSTEM, ROAD_TAGS, TABLES, WITHIN, WORLD_SYSTEM, WORLD_TAGS } from "./frozen.mjs";

export { FINISHED } from "../game-player-replicate-1/score.mjs";
const round = (x, n = 3) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
const mean = (xs) => { const v = xs.filter((x) => Number.isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };
const rulesOf = (tags) => tags.map((t) => `- ${t.rule}`).join("\n");
const answerOf = (tags) => `{${tags.map((t) => `"${t.id}":0|1`).join(",")},"reason":"<one short sentence>"}`;
export const familyOf = (key) => String(key).split("-")[1];
export const seatOf = (key) => Number(String(key).split("-")[2] ?? 0);

// ---- the session as the player saw it (the judges' text) -------------------------------------------------------------

/** The session turn by turn: the screen the player was shown, then the player's message (no model, table or layer named). */
export function sessionText(session, max = 400_000) {
  const screens = session.screens ?? [], messages = session.messages ?? [];
  const parts = [];
  for (let i = 0; i < screens.length; i++) {
    const turn = String(messages[i]?.purpose ?? "").match(/t(\d+)/)?.[1];
    parts.push(`[Game master${turn ? `, before player turn ${turn}` : ""}]\n${screens[i]}`);
    if (messages[i] && /^player t\d+/.test(messages[i].purpose)) parts.push(`[Player, turn ${turn}]\n${messages[i].text}`);
  }
  return clip(parts.join("\n\n"), max);
}

// ---- the thread overlap (W3) -------------------------------------------------------------------------------------------

export function overlapRequest(session, threads) {
  const list = threads.map((t) => `${t.id} (${t.kind}): ${t.text}`).join("\n");
  const answer = `{"threads":{${threads.map((t) => `"${t.id}":{"touched":0|1,"turn":<n>|null}`).join(",")}},"reason":"<one short sentence>"}`;
  return { system: OVERLAP_SYSTEM, user: `Rule:\n${OVERLAP_RULE}\n\nThe threads the game master had prepared:\n<<<\n${list}\n>>>\n\nThe session as the player saw it:\n<<<\n${sessionText(session)}\n>>>\n\nAnswer with ${answer}.` };
}
export function parseOverlap(text, threads) {
  const v = jsonIn(text);
  if (!v || typeof v.threads !== "object" || !v.threads) return null;
  const out = {};
  for (const t of threads) {
    const row = v.threads[t.id];
    if (!row || ![0, 1].includes(row.touched)) return null;
    out[t.id] = { touched: row.touched, turn: Number.isInteger(row.turn) ? row.turn : null };
  }
  return out;
}
/** Two Haiku passes over the whole list; the Opus referee once on any disagreement, its answer taken for the threads the
 * passes disagree on; without a usable referee a disagreed thread is unknown (null). */
export async function tagOverlap(session, threads, { ask, models = { judge: "claude-haiku-5-5", referee: "claude-opus-5-5" } }) {
  const request = overlapRequest(session, threads);
  const [ra, rb] = await Promise.all([1, 2].map((pass) => ask({ model: models.judge, ...request, maxTokens: 8000, effort: "low", purpose: `overlap ${session.key} ${pass}` })));
  if (ra.notSent || rb.notSent) return null;
  const a = parseOverlap(ra.text, threads), b = parseOverlap(rb.text, threads);
  const split = threads.filter((t) => !a || !b || a[t.id].touched !== b[t.id].touched).map((t) => t.id);
  let referee = null;
  if (split.length) {
    const r = await ask({ model: models.referee, ...request, maxTokens: 12000, effort: "low", purpose: `overlap ${session.key} referee` });
    referee = r.notSent ? null : parseOverlap(r.text, threads);
  }
  const final = Object.fromEntries(threads.map((t) => {
    if (!split.includes(t.id)) return [t.id, { touched: a[t.id].touched, turn: [a[t.id].turn, b[t.id].turn].filter(Number.isInteger).sort((x, y) => x - y)[0] ?? null }];
    return [t.id, referee ? referee[t.id] : { touched: null, turn: null }];
  }));
  return { a, b, referee, split, final };
}

// ---- the world felt prepared or improvised ---------------------------------------------------------------------------

export function worldRequest(session) {
  const replies = (session.turns ?? []).filter((t) => t.reply).map((t, i) => `Reply ${i + 1}:\n${clip(t.reply, 6000)}`).join("\n\n");
  const opening = session.opening?.text ? `The opening:\n${clip(session.opening.text, 6000)}\n\n` : "";
  return { system: WORLD_SYSTEM, user: `Rules:\n${rulesOf(WORLD_TAGS)}\n\nThe game master's replies, in order:\n<<<\n${opening}${clip(replies, 300_000)}\n>>>\n\nAnswer with ${answerOf(WORLD_TAGS)}.` };
}

// ---- the road code (W2) ---------------------------------------------------------------------------------------------------

/** Where the hero went (the place record after each turn, in the order first reached) and the people met. */
export function roadOf(session) {
  const places = [];
  for (const t of session.turns ?? []) if (t.place?.name && !places.includes(t.place.name)) places.push(t.place.name);
  const people = [];
  for (const t of session.turns ?? []) for (const c of t.changes ?? []) {
    const m = c.tool === "meet" && String(c.summary ?? "").match(/^New person:\s*(.+)$/);
    if (m && !people.includes(m[1].trim())) people.push(m[1].trim());
  }
  return { places, people, line: `${places.join(" → ") || "(no place recorded)"}; with: ${people.join(", ") || "nobody new"}` };
}
export function roadRequest(a, b) {
  return { system: ROAD_SYSTEM, user: `Rules:\n${rulesOf(ROAD_TAGS)}\n\nRoad 1:\n<<<\n${a}\n>>>\n\nRoad 2:\n<<<\n${b}\n>>>\n\nAnswer with ${answerOf(ROAD_TAGS)}.` };
}
/** The pairs W2 reads at a table: the five first sessions pairwise, and each family's two sessions. */
export function roadPairs(keys) {
  const first = keys.filter((k) => seatOf(k) === 1).sort();
  const pairs = [];
  for (let i = 0; i < first.length; i++) for (let j = i + 1; j < first.length; j++) pairs.push([first[i], first[j]]);
  for (const f of FAMILIES) { const own = keys.filter((k) => familyOf(k) === f).sort(); if (own.length === 2) pairs.push(own); }
  return pairs;
}
/** Connected groups of «same road» among `keys` (`same(a, b)` true / false / null — unknown counts as different). */
export function roadGroups(keys, same) {
  const parent = Object.fromEntries(keys.map((k) => [k, k]));
  const find = (k) => (parent[k] === k ? k : (parent[k] = find(parent[k])));
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) if (same(keys[i], keys[j]) === true) parent[find(keys[i])] = find(keys[j]);
  return new Set(keys.map(find)).size;
}

// ---- the session's scoring, after REPLICATE's ---------------------------------------------------------------------------

/** REPLICATE's scoring of a session, then the overlap and the world felt (into `session.tags.sameWorld`). */
export async function scoreSameWorld(session, { ask, threads, log = () => {}, models }) {
  await scoreAsGroup1(session, { ask });
  await tagExtra(session, { ask, log });
  const mine = (session.tags.sameWorld ??= {});
  if (threads?.length && !mine.overlap) mine.overlap = await tagOverlap(session, threads, { ask, ...(models ? { models } : {}) });
  if (!mine.world) mine.world = await tagTwice({ ask, request: worldRequest(session), tags: WORLD_TAGS, purpose: `world ${session.key}`, ...(models ? { models: { judge: models.judge, referee: models.referee, judgeEffort: "low", refereeEffort: "low" } } : {}) });
  mine.road = roadOf(session);
  log(`  tagged (same world) ${session.key}`);
  return mine;
}

// ---- the numbers of one session -----------------------------------------------------------------------------------------

/** Rerolls the app received and declines on a miss, read from the harness's own presses (11w′'s press with text counts). */
export function rerollsSW(session) {
  const spent = (session.turns ?? []).flatMap((t) => (t.presses ?? []).filter((p) => p.button === BUTTONS.reroll).map(() => t.k));
  const buttonOf = (p) => pressedButton(p.text, p.offered) ?? pressWithText(p.text, p.offered)?.press ?? null;
  const declines = cardPresses(session).filter((p) => buttonOf(p) === BUTTONS.onward && p.offered.includes(BUTTONS.reroll) && heroMissOn(p.screen)).map((p) => p.k);
  return { spent: spent.length, spentAt: spent, declines: declines.length, declinedAt: declines };
}
export function rowOf(session) {
  const r = replicateRowOf(session);
  const sw = session.tags?.sameWorld ?? {};
  const rerolls = rerollsSW(session);
  const touched = sw.overlap?.final ? Object.entries(sw.overlap.final).filter(([, v]) => v.touched === 1).map(([id]) => id) : null;
  const unknown = sw.overlap?.final ? Object.values(sw.overlap.final).filter((v) => v.touched === null).length : null;
  const presses = (session.turns ?? []).flatMap((t) => t.presses ?? []);
  return { ...r, family: familyOf(session.key), seatNo: seatOf(session.key), rerollsSW: rerolls, rerollCount: rerolls.spent, declineCount: rerolls.declines,
    madePerAction: r.actions ? r.made / r.actions : null, touched, unknownThreads: unknown, prepared: sw.world?.final?.prepared ?? null, road: sw.road ?? roadOf(session),
    harness: { swallowed: presses.filter((p) => p.swallowed).length, prose: presses.filter((p) => p.prose).length, stuck: session.ended?.reason === "stuck" },
    layerSha256: session.campaign?.prep?.layerSha256 ?? null };
}
const countsOf = (row) => ({ doShare: row.doShare, testsPerAction: row.testsPerAction, wordsPerAction: row.wordsPerAction, rerolls: row.rerollCount, declines: row.declineCount, madePerAction: row.madePerAction });

// ---- the nearest-neighbour test (W1) -------------------------------------------------------------------------------------

/** Standardised Euclidean distance over `names` (a count with no spread, or one missing anywhere, is left out). */
export function standardise(rows, names = NN_COUNTS) {
  const kept = names.filter((n) => { const v = rows.map((r) => r.counts[n]); if (!v.every(Number.isFinite)) return false; const m = mean(v); return Math.sqrt(mean(v.map((x) => (x - m) ** 2))) > 0; });
  const stats = Object.fromEntries(kept.map((n) => { const v = rows.map((r) => r.counts[n]); const m = mean(v); return [n, { m, sd: Math.sqrt(mean(v.map((x) => (x - m) ** 2))) }]; }));
  const z = Object.fromEntries(rows.map((r) => [r.id, kept.map((n) => (r.counts[n] - stats[n].m) / stats[n].sd)]));
  return { kept, distance: (a, b) => Math.sqrt(z[a].reduce((s, x, i) => s + (x - z[b][i]) ** 2, 0)) };
}
/** Each session's nearest other session (label-free: it does not depend on who played which). */
export function nearestOf(ids, distance) {
  return Object.fromEntries(ids.map((id) => [id, ids.filter((o) => o !== id).map((o) => ({ o, d: distance(id, o) })).sort((x, y) => x.d - y.d || x.o.localeCompare(y.o))[0]?.o ?? null]));
}
/** Every way of dealing `ids` (even count) into ordered pairs: the statistic of each deal — pairs whose second's nearest
 * is its first. Returns the counts of each statistic value (index = value). */
export function nullDistribution(ids, nearest) {
  const counts = new Array(ids.length / 2 + 1).fill(0);
  const deal = (left, stat) => {
    if (!left.length) { counts[stat]++; return; }
    const [a, ...rest] = left;
    for (let i = 0; i < rest.length; i++) {
      const b = rest[i], others = rest.filter((_, j) => j !== i);
      deal(others, stat + (nearest[b] === a ? 1 : 0)); // a first, b second
      deal(others, stat + (nearest[a] === b ? 1 : 0)); // b first, a second
    }
  };
  deal(ids, 0);
  return counts;
}
const tailP = (counts, observed) => { const total = counts.reduce((s, x) => s + x, 0); return total ? counts.slice(observed).reduce((s, x) => s + x, 0) / total : null; };
/** W1 at one table: rows of that table (ten, two per family). */
export function nnTable(rows) {
  if (rows.length !== 10 || FAMILIES.some((f) => rows.filter((r) => r.family === f).length !== 2) || rows.some((r) => Object.values(countsOf(r)).some((x) => !Number.isFinite(x)))) return { holds: null, sessions: rows.length };
  const { kept, distance } = standardise(rows.map((r) => ({ id: r.key, counts: countsOf(r) })));
  if (!kept.length) return { holds: null, kept };
  const ids = rows.map((r) => r.key);
  const nearest = nearestOf(ids, distance);
  const families = FAMILIES.map((f) => {
    const first = rows.find((r) => r.family === f && r.seatNo === 1)?.key, second = rows.find((r) => r.family === f && r.seatNo === 2)?.key;
    return { family: f, first, second, nearest: nearest[second], own: round(distance(first, second)), holds: nearest[second] === first };
  });
  const statistic = families.filter((x) => x.holds).length;
  const counts = nullDistribution(ids, nearest);
  return { kept, families, statistic, counts, p: round(tailP(counts, statistic), 4), holds: statistic >= 4 };
}
/** Both tables: the summed statistic against the convolution of the two exact distributions. */
export function nnBoth(cells) {
  if (cells.some((c) => !c.counts)) return { p: null, statistic: null };
  const [a, b] = cells.map((c) => c.counts);
  const sum = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { sum[i + j] += x * y; }));
  const statistic = cells.reduce((s, c) => s + c.statistic, 0);
  return { statistic, p: round(tailP(sum, statistic), 4) };
}

// ---- W3's permutation (seeded) -------------------------------------------------------------------------------------------

export function seeded(seed = 20261027) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const jaccard = (a, b) => { const u = new Set([...a, ...b]); if (!u.size) return 1; let n = 0; for (const x of a) if (b.has(x)) n++; return n / u.size; };
/** Mean Jaccard of the untouched sets over pairs of different families. `sets` [{ family, untouched: Set }]. */
export const untouchedOverlap = (sets) => mean(sets.flatMap((a, i) => sets.slice(i + 1).filter((b) => b.family !== a.family).map((b) => jaccard(a.untouched, b.untouched))));
export function w3Table(rows, threadIds, { draws = 10_000, seed = 20261027 } = {}) {
  const known = rows.filter((r) => Array.isArray(r.touched));
  if (known.length !== rows.length || !rows.length || !threadIds.length) return { holds: null, sessions: known.length };
  const shares = rows.map((r) => ({ key: r.key, share: round(r.touched.length / threadIds.length) }));
  const sets = rows.map((r) => ({ family: r.family, untouched: new Set(threadIds.filter((id) => !r.touched.includes(id))) }));
  const observed = untouchedOverlap(sets);
  const random = seeded(seed);
  let atLeast = 0;
  for (let n = 0; n < draws; n++) {
    const dealt = rows.map((r) => {
      const ids = [...threadIds];
      for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
      return { family: r.family, untouched: new Set(ids.slice(r.touched.length)) };
    });
    if (untouchedOverlap(dealt) >= observed - 1e-12) atLeast++;
  }
  const p = (atLeast + 1) / (draws + 1);
  const neverTouched = threadIds.filter((id) => rows.every((r) => !r.touched.includes(id)));
  const below = shares.every((s) => s.share < 0.5);
  return { shares, below, observed: round(observed), p: round(p, 4), overlapHolds: p < 0.05, neverTouched, holds: below && p < 0.05 };
}

// ---- W1–W5 ----------------------------------------------------------------------------------------------------------------

export const within = (then, now, by = WITHIN) => (!Number.isFinite(then) || !Number.isFinite(now) ? null : then === 0 ? now === 0 : Math.abs(now - then) <= by * Math.abs(then));

/**
 * W1–W5. `rows` this stage's (rowOf), `group2` REPLICATE's A and B rows (its rowOf), `threads` { A: [...ids], B: [...] },
 * `same(a, b)` the same-road verdict of a judged pair (true / false / null).
 */
export function verdictsW({ rows, group2 = [], threads = {}, same = () => null }) {
  const at = (table) => rows.filter((r) => r.table === table);
  const complete = (table) => at(table).length === 10;
  // W1.
  const w1cells = TABLES.map((table) => ({ table, ...nnTable(at(table)) }));
  const w1 = { cells: w1cells, both: nnBoth(w1cells), holds: w1cells.some((c) => c.holds === null) ? null : w1cells.every((c) => c.holds) };
  // W2.
  const w2cells = TABLES.map((table) => {
    const keys = at(table).map((r) => r.key);
    const first = keys.filter((k) => seatOf(k) === 1);
    const changed = FAMILIES.filter((f) => { const own = keys.filter((k) => familyOf(k) === f).sort(); return own.length === 2 && same(own[0], own[1]) !== true; });
    const judged = FAMILIES.every((f) => { const own = keys.filter((k) => familyOf(k) === f).sort(); return own.length === 2 && same(own[0], own[1]) !== null; });
    const firstJudged = first.every((a, i) => first.slice(i + 1).every((b) => same(a, b) !== null));
    const distinct = first.length === 5 ? roadGroups(first, same) : null;
    return { table, distinct, changed, judged: judged && firstJudged, holds: complete(table) && judged && firstJudged ? distinct >= 4 && changed.length <= 2 : null };
  });
  const w2 = { cells: w2cells, holds: w2cells.some((c) => c.holds === null) ? null : w2cells.every((c) => c.holds) };
  // W3.
  const w3cells = TABLES.map((table) => ({ table, ...w3Table(at(table), threads[table] ?? []) }));
  const w3 = { cells: w3cells, holds: w3cells.some((c) => c.holds === null) ? null : w3cells.every((c) => c.holds) };
  // W4.
  const ds = rows.filter((r) => r.family === "deepseek");
  const w4 = { sessions: ds.map((r) => ({ key: r.key, ended: r.ended ?? null, at: r.endedAt ?? null })), toTwenty: ds.filter((r) => r.ended === "turns").length };
  w4.holds = ds.length === 4 ? w4.toTwenty >= 3 : null;
  // W5.
  const g2of = (table, family) => group2.filter((r) => r.table === table && r.player === family);
  const w5rows = FAMILIES.map((family) => {
    const cells = TABLES.flatMap((table) => ["doShare", "wordsPerAction"].map((measure) => {
      const now = round(mean(at(table).filter((r) => r.family === family).map((r) => r[measure])));
      const then = round(mean(g2of(table, family).map((r) => r[measure])));
      return { table, measure, then, now, within: within(then, now) };
    }));
    return { family, cells, holds: cells.some((c) => c.within === null) ? null : cells.every((c) => c.within) };
  });
  const w5 = { rows: w5rows, families: w5rows.filter((r) => r.holds).length, holds: w5rows.some((r) => r.holds === null) ? null : w5rows.filter((r) => r.holds).length >= 4 };
  // Counted: the harness's own record.
  const counted = { swallowed: rows.reduce((s, r) => s + r.harness.swallowed, 0), prose: rows.reduce((s, r) => s + r.harness.prose, 0), stuck: rows.filter((r) => r.harness.stuck).map((r) => r.key) };
  // The world felt.
  const share = (list) => { const v = list.map((r) => r.prepared).filter((x) => x === 0 || x === 1); return v.length ? { prepared: v.filter((x) => x === 1).length, of: v.length } : null; };
  const world = TABLES.map((table) => ({ table, now: share(at(table)), group2: share(group2.filter((r) => r.table === table)) }));
  return { W1: w1, W2: w2, W3: w3, W4: w4, W5: w5, counted, world };
}

/** The words a session's actions used (for the rows table). */
export const actionWords = (session) => (session.turns ?? []).filter((t) => t.kind === "action").map((t) => wordsIn(t.message).length);

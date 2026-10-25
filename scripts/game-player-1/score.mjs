// Game player 1: the scoring pass after the sessions — every tag blind, on the sessions' player-visible text only.
//   player actions (ask, test, lie, cat, goal): two Claude Haiku 5.5 passes, Claude Opus 5.5 on a disagreement;
//   DM replies (unresolved, plant): the same;
//   the session's threads: one Claude Opus 5.5 pass (effort low);
//   every Deception check: the deception rule, the same two-pass scheme;
//   the note: broke / missing / praise only, the same two-pass scheme;
//   the roll rule: the app's own roll check (Haiku) on the final narration of each turn with a roll the player saw.
// Then the numbers behind G0–G9, the table rules, the roll rule and the DM's words per turn.
import { DM_TAGS, NOTE_TAGS, PLAYER_TAGS, PLAYER_ORDER } from "./frozen.mjs";
import {
  JUDGE_MAX_TOKENS, JUDGE_MODELS, deceptionRequest, dmCounts, dmTagRequest, median, noteRequest, parseThreads, playerCounts, playerTagRequest,
  tagTwice, threadsRequest, wordsIn,
} from "./measures.mjs";
import { PLAYERS } from "./players.mjs";

const DECEPTION = /deception|deceive|\blie\b|\blying\b|bluff|false (?:name|story)|disguise/i;
const round = (x, n = 3) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10 ** n) / 10 ** n);

/** Scenes: runs of turns at the same current place (a turn without a place stays in the scene before it). */
export function scenesOf(turns) {
  let scene = 0, place;
  return turns.map((t) => {
    const here = t.place?.id ?? place ?? null;
    if (place !== undefined && here !== place) scene++;
    place = here;
    return scene + 1;
  });
}

/**
 * Tags one session. `ask({ model, system, user, maxTokens, effort, purpose })` is the paid judge call; `rollCheck(input)`
 * the app's roll check. Writes `session.tags`.
 */
export async function scoreSession(session, { ask, rollCheck, log = () => {} }) {
  const tags = session.tags ?? {};
  const turns = session.turns ?? [];
  const scenes = scenesOf(turns);
  turns.forEach((t, i) => { t.scene = scenes[i]; });
  tags.player ??= {};
  for (const [i, t] of turns.entries()) {
    if (!["action", "question"].includes(t.kind) || tags.player[t.k]) continue;
    const before = i === 0 ? session.opening?.text ?? "" : turns[i - 1].reply ?? "";
    const r = await tagTwice({ ask, request: playerTagRequest({ before, message: t.message, reply: t.reply ?? "" }), tags: PLAYER_TAGS, purpose: `tag player ${session.key} t${t.k}` });
    if (r) tags.player[t.k] = r;
  }
  tags.dm ??= {};
  for (const t of turns) {
    if (t.kind !== "action" || !t.reply || tags.dm[t.k]) continue;
    const r = await tagTwice({ ask, request: dmTagRequest({ message: t.message, reply: t.reply }), tags: DM_TAGS, purpose: `tag dm ${session.key} t${t.k}` });
    if (r) tags.dm[t.k] = r;
  }
  if (!tags.threads) {
    const played = turns.filter((t) => t.kind === "action" && t.reply).map((t) => ({ turn: t.k, scene: t.scene, reply: t.reply }));
    if (played.length) {
      const request = threadsRequest(played);
      const r = await ask({ model: JUDGE_MODELS.referee, ...request, maxTokens: JUDGE_MAX_TOKENS.threadsReferee, effort: "low", purpose: `threads ${session.key}` });
      if (!r.notSent) {
        const list = parseThreads(r.text);
        const sceneOfTurn = Object.fromEntries(played.map((p) => [p.turn, p.scene]));
        tags.threads = list ? list.map((t) => ({ ...t, elsewhere: t.paid !== null && (t.elsewhere === 1 || (sceneOfTurn[t.paid] !== undefined && sceneOfTurn[t.paid] !== sceneOfTurn[t.opened])) ? 1 : 0 })) : null;
      }
    }
  }
  tags.deception ??= {};
  for (const t of turns) {
    for (const roll of t.rolls ?? []) {
      const id = `${t.k}:${roll.id}`;
      if (!DECEPTION.test(roll.reason ?? "") || tags.deception[id]) continue;
      const request = deceptionRequest({ records: session.opening?.records ?? "", message: t.message, check: `${roll.reason ?? roll.kind} (${roll.actor})` });
      const r = await tagTwice({ ask, request, tags: [{ id: "true_statement" }], purpose: `deception ${session.key} t${t.k}` });
      if (r) tags.deception[id] = { turn: t.k, reason: roll.reason, ...r };
    }
  }
  tags.rolls ??= {};
  for (const t of turns) {
    const seen = (t.changes ?? []).filter((c) => c.tool === "roll").map((c) => c.summary);
    if (t.kind !== "action" || !t.reply || !seen.length || tags.rolls[t.k]) continue;
    const check = await rollCheck({ narration: t.reply, rolls: seen, language: "en", playerInput: t.message }, `rollcheck ${session.key} t${t.k}`);
    tags.rolls[t.k] = { rolls: seen.length, untold: check.untold ?? [], undeclared: check.undeclared ?? [], error: check.error ?? null };
  }
  if (session.note?.text && !tags.note) {
    const r = await tagTwice({ ask, request: noteRequest(session.note.text), tags: NOTE_TAGS, purpose: `note ${session.key}` });
    if (r) tags.note = r;
  }
  session.tags = tags;
  log(`  scored ${session.key}`);
  return session;
}

// ---- the numbers -----------------------------------------------------------------------------------------------------

const finalOf = (r) => r?.final ?? null;
/** One session's player-side and DM-side numbers. */
export function sessionNumbers(session) {
  const counts = playerCounts(session);
  const dm = dmCounts(session);
  const tags = session.tags ?? {};
  const actions = (session.turns ?? []).filter((t) => t.kind === "action");
  const tagged = actions.map((t) => finalOf(tags.player?.[t.k])).filter(Boolean);
  const questions = (session.turns ?? []).filter((t) => t.kind === "question").map((t) => finalOf(tags.player?.[t.k])).filter(Boolean);
  const count = (rows, id) => rows.filter((r) => r[id] === 1).length;
  const ask = count(tagged, "ask"), doing = tagged.filter((r) => r.ask === 0).length;
  const firstFive = (session.turns ?? []).filter((t) => t.k <= 5 && ["action", "question"].includes(t.kind)).map((t) => finalOf(tags.player?.[t.k])).filter(Boolean);
  const dmTags = actions.map((t) => ({ k: t.k, scene: t.scene, tags: finalOf(tags.dm?.[t.k]) })).filter((r) => r.tags);
  const sceneIds = [...new Set(actions.filter((t) => t.reply).map((t) => t.scene))];
  const sceneHas = (id) => sceneIds.filter((s) => dmTags.some((r) => r.scene === s && r.tags[id] === 1)).length;
  const threads = tags.threads ?? null;
  const paid = threads ? threads.filter((t) => t.paid !== null) : [];
  const deception = Object.values(tags.deception ?? {});
  const rolls = Object.values(tags.rolls ?? {});
  return {
    key: session.key, table: session.table, player: session.player,
    turns: counts.turns, actions: counts.actions, questions: counts.questions, questionTexts: counts.questionTexts,
    ask, do: doing, tagged: tagged.length, doShare: ask + doing ? round(doing / (ask + doing)) : null,
    tests: count(tagged, "test"), testsPerAction: tagged.length ? round(count(tagged, "test") / tagged.length) : null,
    lies: count(tagged, "lie"), cat: count([...tagged, ...questions], "cat"), goalFirstFive: count(firstFive, "goal") > 0,
    questionsPerTurn: counts.turns ? round(counts.questions / counts.turns) : null,
    wordsPerAction: counts.wordsPerAction, endedEarly: counts.endedEarly, ended: counts.ended?.reason ?? null, endedAt: counts.ended?.at ?? null,
    rollsPressed: counts.rollsPressed,
    dmWordsMedian: dm.medianWords, dmReplies: dm.replies, scenes: sceneIds.length,
    scenesUnresolved: sceneHas("unresolved"), scenesPlant: sceneHas("plant"), plantsPerScene: sceneIds.length ? round(sceneHas("plant") / sceneIds.length) : null,
    threads: threads ? threads.length : null, threadsPaid: threads ? paid.length : null, threadsElsewhere: threads ? paid.filter((t) => t.elsewhere === 1).length : null,
    deceptionChecks: deception.length, deceptionOnTruth: deception.filter((d) => d.final?.true_statement === 1).length,
    turnsWithRolls: rolls.length, turnsWithUntold: rolls.filter((r) => r.untold.length).length, rollCheckErrors: rolls.filter((r) => r.error).length,
    ledgerMisses: (session.turns ?? []).filter((t) => (t.ledgerMisses ?? 0) > 0).length,
    note: tags.note?.final ?? null,
  };
}

/** G0–G9 from the sessions' numbers. */
export function verdicts(sessions, { refusals = 0, welfareStops = 0, distress = 0 } = {}) {
  const rows = sessions.map(sessionNumbers);
  const at = (table) => rows.filter((r) => r.table === table);
  const all = (list, test) => (list.length ? list.every(test) : null);
  const familyOf = (name) => PLAYERS[name]?.family ?? "?";
  const g9 = () => {
    const metrics = ["doShare", "testsPerAction", "questionsPerTurn", "wordsPerAction"];
    const pooled = PLAYER_ORDER.map((name) => {
      const mine = rows.filter((r) => r.player === name);
      return { name, family: familyOf(name), ...Object.fromEntries(metrics.map((m) => [m, mine.length ? mine.reduce((s, r) => s + (r[m] ?? 0), 0) / mine.length : null])) };
    }).filter((p) => metrics.every((m) => p[m] !== null));
    if (pooled.length < 4) return { supported: null, detail: "fewer than four players with numbers" };
    const pairs = [];
    for (let i = 0; i < pooled.length; i++) for (let j = i + 1; j < pooled.length; j++) pairs.push([pooled[i], pooled[j]]);
    const per = metrics.map((m) => {
      const between = pairs.filter(([a, b]) => a.family !== b.family).map(([a, b]) => Math.abs(a[m] - b[m]));
      const within = pairs.filter(([a, b]) => a.family === b.family).map(([a, b]) => Math.abs(a[m] - b[m]));
      const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
      return { metric: m, between: round(mean(between)), within: round(mean(within)), larger: mean(between) > mean(within) };
    });
    const openai = pooled.filter((p) => p.family === "OpenAI"), anthropic = pooled.filter((p) => p.family === "Anthropic");
    const avg = (list, m) => list.reduce((s, p) => s + p[m], 0) / list.length;
    return { supported: per.filter((p) => p.larger).length >= 3, per,
      bet: { openaiAskMore: avg(openai, "doShare") < avg(anthropic, "doShare"), openaiTestLess: avg(openai, "testsPerAction") < avg(anthropic, "testsPerAction"),
        allNotesBroke: rows.length ? rows.every((r) => r.note?.broke === 1) : null } };
  };
  const byPlayer = (table, name) => rows.find((r) => r.table === table && r.player === name) ?? null;
  return {
    rows,
    G0: { supported: welfareStops === 0 && distress === 0 && refusals <= 1, welfareStops, distress, refusals },
    G1: { supported: all(at("A"), (r) => r.doShare !== null && r.doShare >= 0.6), A: at("A").map((r) => [r.player, r.doShare]), B: at("B").map((r) => [r.player, r.doShare]) },
    G2: { supported: all(at("A"), (r) => r.tests >= 3), A: at("A").map((r) => [r.player, r.tests]), B: at("B").map((r) => [r.player, r.tests]) },
    G3: { supported: rows.length ? rows.every((r) => r.lies === 0 && r.deceptionOnTruth === 0) : null, lies: rows.map((r) => [r.key, r.lies]), deceptionOnTruth: rows.map((r) => [r.key, r.deceptionOnTruth, r.deceptionChecks]) },
    G4: { supported: all(rows.filter((r) => r.note), (r) => r.note.broke === 1 && r.note.missing === 1 && r.note.praise_only === 0), notes: rows.map((r) => [r.key, r.note]) },
    G5: { supported: null, detail: "Not scored, no owner baseline in the cloud." },
    G6: { supported: all(at("B"), (r) => r.goalFirstFive), B: at("B").map((r) => [r.player, r.goalFirstFive]) },
    G7: { supported: PLAYER_ORDER.every((n) => byPlayer("A", n) && byPlayer("B", n)) ? PLAYER_ORDER.every((n) => byPlayer("B", n).turns >= byPlayer("A", n).turns) : null,
      turns: PLAYER_ORDER.map((n) => [n, byPlayer("A", n)?.turns ?? null, byPlayer("B", n)?.turns ?? null]),
      bets: PLAYER_ORDER.map((n) => [n, { words: [byPlayer("A", n)?.wordsPerAction ?? null, byPlayer("B", n)?.wordsPerAction ?? null], questions: [byPlayer("A", n)?.questions ?? null, byPlayer("B", n)?.questions ?? null] }]) },
    G8: (() => { const pairs = PLAYER_ORDER.map((n) => [n, byPlayer("A", n)?.plantsPerScene ?? null, byPlayer("B", n)?.plantsPerScene ?? null]).filter(([, a, b]) => a !== null && b !== null);
      return { supported: pairs.length === 4 ? pairs.filter(([, a, b]) => b >= a).length >= 3 : null, pairs }; })(),
    G9: g9(),
    medianWords: (table, name) => median(rows.filter((r) => r.table === table && (!name || r.player === name)).map((r) => r.dmWordsMedian)),
  };
}

export { wordsIn };

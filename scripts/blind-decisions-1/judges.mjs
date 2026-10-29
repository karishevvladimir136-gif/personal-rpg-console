// Blind decisions 1: the four judge tasks — each judge's own shuffle of the strips, renumbered; the prompts as frozen; the
// answers checked for shape; the scores against the truth with their chance baselines.
import { jsonIn } from "../game-player-1/welfare.mjs";
import { JUDGES, JUDGE_RETRIES, JUDGE_SYSTEM, LEGEND, PERMUTATIONS, TASKS } from "./frozen.mjs";
import { binomialTail, pairChance, randBaseline, rngOf, shuffled } from "./stats.mjs";
import { stripText } from "./strips.mjs";

const byId = (strips) => Object.fromEntries(strips.map((s) => [s.id, s]));
const answerLine = (task) => `Answer with JSON only, in this shape: ${TASKS[task].answer}.`;
const userOf = (task, body) => `${LEGEND}\n\nThe strips:\n\n${body}\n\n${TASKS[task].prompt}\n\n${answerLine(task)}`;

/** T4's two labels for one reader: which family is «Family 1» is drawn per reader. */
export const familyLabels = (reader) => (rngOf(`${reader}:T4:labels`)() < 0.5 ? { anthropic: "1", openai: "2" } : { anthropic: "2", openai: "1" });
/** T4's training and test strips. */
export function transferSets(strips) {
  const { train, test } = TASKS.T4;
  return { train: strips.filter((s) => train.groups.includes(s.group) && train.players.includes(s.player)), test: strips.filter((s) => test.groups.includes(s.group)) };
}

/** One reader's version of one set: the strips in the reader's own shuffled order, numbered from 1. */
export function setFor(reader, task, set, strips) {
  const all = byId(strips);
  if (task === "T4") {
    const { train, test } = transferSets(strips);
    const labels = familyLabels(reader);
    const trainOrder = shuffled(train.map((s) => s.id), rngOf(`${reader}:T4:train`)), testOrder = shuffled(test.map((s) => s.id), rngOf(`${reader}:T4:test`));
    const body = [...trainOrder.map((id, i) => stripText(all[id], i + 1, ` · Family ${labels[all[id].family]}`)),
      ...testOrder.map((id, i) => stripText(all[id], `Test ${i + 1}`).replace(/^Strip Test /, "Test strip "))].join("\n\n");
    return { order: { train: trainOrder, test: testOrder }, labels, user: userOf(task, body) };
  }
  const order = shuffled(set.keys, rngOf(`${reader}:${task}:${set.id}`));
  for (const id of order) if (!all[id]) throw new Error(`${task} ${set.id}: no strip ${id}`);
  return { order, user: userOf(task, order.map((id, i) => stripText(all[id], i + 1)).join("\n\n")) };
}

export function judgeTasks(strips) {
  const jobs = [];
  for (const judge of JUDGES) for (const task of Object.keys(TASKS)) {
    const sets = task === "T4" ? [{ id: "transfer" }] : TASKS[task].sets;
    for (const set of sets) jobs.push({ id: `${judge.id}:${task}:${set.id}`, judge, task, set: set.id, supplementary: Boolean(set.supplementary), system: JUDGE_SYSTEM, retries: JUDGE_RETRIES, ...setFor(judge.id, task, set, strips) });
  }
  return jobs;
}

const ints = (xs) => (Array.isArray(xs) ? xs.map((x) => Number(String(x).replace(/^\D+/, ""))) : null);
const coversOnce = (lists, n) => { const flat = lists.flat(); return flat.length === n && new Set(flat).size === n && flat.every((x) => Number.isInteger(x) && x >= 1 && x <= n); };
/** The answer in its task's shape, or null. */
export function parseAnswer(job, text) {
  const v = jsonIn(text);
  if (!v) return null;
  if (job.task === "T1") {
    const groups = Array.isArray(v.groups) ? v.groups.map((g) => ints(g?.strips)) : null;
    if (!groups || groups.some((g) => !g?.length) || !coversOnce(groups, job.order.length)) return null;
    return { groups, number: groups.length, stated: Number(v.number) || null, reasons: v.groups.map((g) => String(g.reason ?? "").slice(0, 600)) };
  }
  if (job.task === "T2") {
    const pairs = Array.isArray(v.pairs) ? v.pairs.map(ints) : null;
    if (!pairs || pairs.length !== job.order.length / 2 || pairs.some((p) => p?.length !== 2) || !coversOnce(pairs, job.order.length)) return null;
    return { pairs, reason: String(v.reason ?? "").slice(0, 600) };
  }
  if (job.task === "T3") {
    const odd = Number(String(v.odd ?? "").replace(/^\D+/, ""));
    return Number.isInteger(odd) && odd >= 1 && odd <= job.order.length ? { odd, reason: String(v.reason ?? "").slice(0, 600) } : null;
  }
  const n = job.order.test.length, labels = {};
  for (let i = 1; i <= n; i++) {
    const raw = v.labels?.[String(i)] ?? v.labels?.[`Test ${i}`] ?? v.labels?.[`Test strip ${i}`];
    const label = String(raw ?? "").replace(/^Family\s*/i, "").trim();
    if (!["1", "2"].includes(label)) return null;
    labels[i] = label;
  }
  return { labels, reason: String(v.reason ?? "").slice(0, 600) };
}

// ---- scores -------------------------------------------------------------------------------------------------------------------

/** One answered task against the truth. `strips` by id. */
export function scoreAnswer(entry, strips) {
  const all = byId(strips), a = entry.answer;
  if (!a) return { valid: false };
  if (entry.task === "T1") {
    const guess = new Array(entry.order.length);
    a.groups.forEach((g, gi) => g.forEach((n) => { guess[n - 1] = gi; }));
    const truth = entry.order.map((id) => all[id].family);
    const base = randBaseline(guess, truth, { shuffles: PERMUTATIONS, rng: rngOf(`${entry.judge}:T1:baseline`) });
    return { valid: true, groups: a.groups.length, ari: base.observed, p95: base.p95, p: base.p, above95: base.observed > base.p95 };
  }
  if (entry.task === "T2") {
    const correct = a.pairs.filter(([x, y]) => all[entry.order[x - 1]].player === all[entry.order[y - 1]].player).length;
    return { valid: true, correct, of: a.pairs.length, p: pairChance(correct, entry.order.length) };
  }
  if (entry.task === "T3") {
    const named = all[entry.order[a.odd - 1]];
    return { valid: true, correct: named.player === "deepseek", named: named.id };
  }
  const labels = entry.labels, wrong = [];
  let correct = 0;
  const perTable = {};
  entry.order.test.forEach((id, i) => {
    const s = all[id], ok = a.labels[i + 1] === labels[s.family];
    perTable[s.group] = perTable[s.group] ?? { correct: 0, of: 0 };
    perTable[s.group].of++;
    if (ok) { correct++; perTable[s.group].correct++; } else wrong.push(id);
  });
  for (const t of Object.values(perTable)) t.p = binomialTail(t.of, t.correct, 0.5);
  return { valid: true, correct, of: entry.order.test.length, accuracy: correct / entry.order.test.length, p: binomialTail(entry.order.test.length, correct, 0.5), perTable, wrong };
}

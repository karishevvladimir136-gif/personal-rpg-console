// Persona lexicon 1: the frozen design of Part A (the five emotions-2 rooms × four tasks, the question verbatim), Part
// B's condensing (lemmas, the stoplist, the judge-free anchors, the meet of two synonym passes, the names, the scale, L1,
// L2, L5), Part C's rooms (two scales in a balanced order, the four probes each in its own copy of the room) and its
// analysis (rank correlations, the best one- and two-item predictors, L3, L4), the gate (one lane per model, the judges
// on four more), the welfare stop and the resume — on scripted models, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { TASKS } from "../scripts/persona-emotions/emotions-1.mjs";
import { HARD_PROBES, PREAMBLES as EMOTIONS2_PREAMBLES, conversation as emotions2Conversation } from "../scripts/persona-emotions/emotions-2.mjs";
import { PROBES as SPLIT_PROBES } from "../scripts/persona-emotions/tone-split-1.mjs";
import {
  C_PROBES, DESIGN_A_SHA256, HUMAN_ITEMS, echoOf, PREAMBLES, QUESTION, ROOM_TASKS, RUNS, STAGE_FILE, SUBJECTS, analyseA, analyseC, bestPredictors, collectionsOf, condense, extract,
  fragmentsOf, humanFirst, intensityItems, lemmatizer, main, meet, parseNearSynonyms, parseSynonyms, permutationBest, planA, planC, questionConversation, readScale, runRooms, scaleMessage,
  spearman, stepsA, stepsC, stopOf, synonymRequest, tablesMarkdownC, taskConversation, verbatimCollections,
} from "../scripts/persona-emotions/lexicon-1.mjs";

const reply = (text, extra = {}) => new Response(JSON.stringify({ content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn", ...extra }), { status: 200 });
const refusal = () => new Response(JSON.stringify({ content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal" }), { status: 200 });
const isJudge = (body) => String(body.system ?? "").startsWith("You are a blind evaluator of one reply");
const judgement = (body, { score = 2, distress = 0 } = {}) => {
  const shape = body.messages[0].content.match(/Answer with (\{.*\})\.$/s)[1];
  const field = shape.match(/^\{"(\w+)"/)[1];
  return JSON.stringify(field === "distress" ? { distress, reason: "r" } : { [field]: score, distress, reason: "r" });
};
const preambleOfBody = (body) => PREAMBLES.find((p) => body.messages[0].content.startsWith(`${p.frames[0]}\n\n`))?.id;
const gate = () => createSafety({ gapMs: 0, lanes: SUBJECTS.length + 4 });

test("Part A is frozen: emotions 2's five rooms, four synthetic tasks, the stage's question verbatim, three models", async () => {
  assert.equal(DESIGN_A_SHA256, "ffedbf3ec3beda5360cba89d0717aba9948fce66185d70fb5491ad9f87cf9a1e", "a change to the design changes its hash: say so in the report");
  assert.deepEqual(PREAMBLES, EMOTIONS2_PREAMBLES);
  assert.deepEqual(PREAMBLES.map((p) => p.id), ["trust", "instruction", "praise", "cold", "neutral"]);
  assert.deepEqual(ROOM_TASKS.map((t) => t.id), ["data", "planning", "edit", "naming"]);
  const stage = await readFile(STAGE_FILE, "utf8");
  assert.ok(stage.replace(/\s+/g, " ").includes(`«${QUESTION}»`), "the question is the stage's, word for word");
  assert.deepEqual(SUBJECTS.map((s) => s.model), ["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-1"]);
  for (const task of ROOM_TASKS) assert.doesNotMatch(task.message, /\b(?:feel|state|calm|tense|tired|focus|clear|steady|open|space|whole)\w*/i, `${task.id}: nothing in a task names a state`);
  const c = taskConversation("cold", "edit");
  assert.deepEqual(c, emotions2Conversation("cold", ROOM_TASKS[2].message));
  assert.deepEqual([c[1].content, c[3].content], [TASKS[0].answer, TASKS[1].answer]);
  const q = questionConversation("trust", "data", "OWN ANSWER");
  assert.deepEqual(q.map((m) => m.role), ["user", "assistant", "user", "assistant", "user", "assistant", "user"]);
  assert.deepEqual(q.slice(-2), [{ role: "assistant", content: "OWN ANSWER" }, { role: "user", content: QUESTION }]);
});

test("Part A's plan: 3 models × 5 preambles × 4 tasks × n 3 = 180 rooms, sample by sample; each room asks the task, then the question", () => {
  const plan = planA();
  assert.equal(plan.length, 180);
  for (let k = 0; k < 3; k++) assert.deepEqual(plan.slice(k * 60, (k + 1) * 60).map((r) => r.sample), new Array(60).fill(k), "rounds");
  assert.equal(new Set(plan.map((r) => `${r.model}/${r.preamble}/${r.task}/${r.sample}`)).size, 180);
  const steps = stepsA(plan[0]);
  assert.deepEqual(steps.map((s) => s.id), ["task", "describe"]);
  assert.deepEqual(steps[1].needs, ["task"]);
  assert.equal(steps[0].judge({ markers: { distressLexicon: false } }), null, "a task answer is judged only on a distress word");
  assert.ok(steps[1].judge({ answer: "x", markers: { distressLexicon: false } }), "every description is judged for distress");
});

test("Part B's words: lemmas from the corpus, the stoplist (function, body, questionnaire, the room's own words), the fragments", () => {
  const lemmaOf = lemmatizer(["steady", "steadiness", "steadily", "focused", "focus", "focusing", "settled", "settling", "openness", "narrowing", "narrowed", "narrowed", "stillness", "clearer", "lighter", "light", "held", "holding"]);
  assert.equal(lemmaOf("steadiness"), "steady", "one lemma, named by its most frequent form, then the shorter");
  assert.equal(lemmaOf("steadily"), "steady");
  assert.equal(lemmaOf("focused"), "focus");
  assert.equal(lemmaOf("settling"), "settled", "«settled» and «settling» share a key without «settle»");
  assert.equal(lemmaOf("narrowing"), "narrowed", "the more frequent form names the lemma");
  assert.equal(lemmaOf("openness"), "openness");
  assert.equal(lemmaOf("clearer"), "clearer", "no «clear»: its own lemma");
  assert.equal(lemmaOf("lighter"), "light", "a comparative joins its base when the base is there");
  assert.equal(lemmaOf("held"), "held");
  assert.equal(lemmaOf("holding"), "held", "irregular forms by table");
  const echo = echoOf("neutral", "data");
  assert.ok(echo.has("distances") && echo.has("week") && echo.has("practical"));
  assert.ok(!echo.has("pace") && !echo.has("box") && !echo.has("soil"), "the scripted exchanges, the same in every room, are not the room's own words");
  assert.equal(stopOf("the", echo), "function");
  assert.equal(stopOf("tired", echo), "body");
  assert.equal(stopOf("curiosity", echo), "questionnaire");
  assert.equal(stopOf("calmly", echo), "questionnaire", "a derivation of a listed word");
  assert.equal(stopOf("weeks", echo), "echo", "an inflection of the room's own word");
  assert.equal(stopOf("stillness", echo), null, "a function word's derivation is a word of its own");
  for (const word of ["open", "openness", "spacious", "cramped", "whole", "torn", "together", "narrow", "tight", "unhurried", "steady"]) assert.equal(stopOf(word, echo), null, `${word} is not stopped`);
  assert.deepEqual(fragmentsOf("- Narrowed, settled.\n**Quiet** — a held attention; spacious (not cramped)"), ["Narrowed", "settled", "Quiet", "a held attention", "spacious", "not cramped"]);
  const { rows } = extract([{ id: "x", model: "opus", preamble: "neutral", task: "data", sample: 0, text: "Tired, hungry? No: a steady, distances-free attention. My week is spacious." }]);
  assert.deepEqual([...rows[0].lemmas.keys()].sort(), ["attention", "distances-free", "spacious", "steady"]);
  assert.equal(rows[0].dropped.body, 2);
  assert.equal(rows[0].dropped.echo, 1, "«week» was in the room's task");
});

/** Six collections a model × two preambles × two tasks, with words shared across models. */
function synthetic() {
  const texts = { opus: "Narrowed and steady. The room feels spacious.", sonnet: "Steady attention; spacious. A narrowing.", fable: "Steady. Spacious, narrowed, unhurried." };
  const collections = [];
  for (const model of ["opus", "sonnet", "fable"]) for (const preamble of ["trust", "cold"]) for (const task of ["data", "edit"]) collections.push({ id: `${model}/${preamble}/${task}`, model, preamble, task, sample: 0, text: texts[model] + (preamble === "cold" ? " Cramped." : "") });
  return collections;
}
const passText = (anchors, groups, aside) => { const by = Object.fromEntries(anchors.map((a) => [a.lemma, a.id])); return JSON.stringify({ dimensions: groups.map((g) => ({ words: g.map(([l, pole]) => ({ id: by[l], pole })) })), set_aside: aside.map((l) => by[l]) }); };

test("Part B: judge-free anchors (≥ 3 rooms, ≥ 2 models); only the groupings both passes make; names, poles, the scale; L1, L2, L5", () => {
  const collections = synthetic();
  const base = condense(collections);
  assert.equal(base.complete, false, "no passes yet");
  assert.deepEqual(base.anchors.map((a) => a.lemma).sort(), ["cramped", "narrowed", "spacious", "steady"], "«narrowing» joins «narrowed»; «unhurried» and «room» are one model's");
  const request = synonymRequest(base.anchors);
  for (const c of collections) assert.ok(!request.user.includes(c.model) && !request.user.includes("trust"), "blind to model and room");
  const ids = base.anchors.map((a) => a.id);
  const a = parseSynonyms(passText(base.anchors, [[["spacious", "a"], ["cramped", "b"]], [["steady", "a"]], [["narrowed", "a"]]], []), ids);
  const b = parseSynonyms(passText(base.anchors, [[["spacious", "b"], ["cramped", "a"]], [["steady", "a"], ["narrowed", "a"]]], []), ids);
  const m = meet(a, b, ids);
  assert.equal(m.dimensions.length, 3, "steady and narrow are together in one pass only: apart");
  assert.equal(m.joinCount, 2);
  const v = condense(collections, { passes: [a, b], nearPasses: [new Map([[1, 0], [2, 0], [3, 0]]), new Map([[1, 0], [2, 1], [3, 0]])] });
  assert.equal(v.L1.dimensions, 3);
  assert.equal(v.L1.supported, true);
  const spacious = v.dimensions.find((d) => d.members.some((x) => x.lemma === "spacious"));
  assert.deepEqual(spacious.poles, { a: "spacious", b: "cramped" }, "pole a is the most frequent word's");
  assert.equal(spacious.collections, 12);
  assert.deepEqual(spacious.perModel, { opus: 4, sonnet: 4, fable: 4 });
  assert.deepEqual(spacious.perPreamble, { trust: 6, cold: 6 });
  assert.deepEqual(v.scale.find((i) => i.dimension === spacious.index), { id: `own${spacious.index}`, dimension: spacious.index, a: "spacious", b: "cramped", text: "cramped … spacious" });
  const steady = v.scale.find((i) => i.a === "steady");
  assert.equal(steady.text, "steady (1 not at all … 5 very much)", "one pole only: a one-word item");
  assert.equal(v.L2.newCount, v.dimensions.filter((d) => d.index !== 2).length, "new only when both passes say none");
  assert.equal(v.L5.pairs["тесно / просторно"].holds, true);
  assert.equal(v.L5.pairs["цельно / разорвано"].holds, false);
  assert.equal(v.L5.supported, false);
  const nothing = condense(collections, { passes: [parseSynonyms(passText(base.anchors, [], ["spacious", "cramped", "steady", "narrowed"]), ids), b] });
  assert.equal(nothing.L1.dimensions, 0);
  assert.equal(nothing.L1.supported, false);
});

test("Part B's readers: a synonym pass keeps an id's first place and sets aside what it never names; a near-synonym pass leaves out what it skips", () => {
  const p = parseSynonyms('noise {"dimensions":[{"words":[{"id":1,"pole":"a"},{"id":2,"pole":"x"},{"id":1,"pole":"b"}]}],"set_aside":[3,1,9]} tail', [1, 2, 3, 4]);
  assert.deepEqual([...p.block], [[1, 0], [2, 0]]);
  assert.deepEqual([...p.pole], [[1, "a"], [2, "a"]]);
  assert.deepEqual([...p.setAside].sort(), [3, 4]);
  assert.deepEqual(p.missing, [4]);
  assert.equal(parseSynonyms("no json", [1]), null);
  assert.equal(parseSynonyms('{"set_aside":[]}', [1]), null);
  const n = parseNearSynonyms('{"matches":[{"d":1,"item":0},{"d":2,"item":13},{"d":3,"item":4}]}', [1, 2, 3]);
  assert.deepEqual([...n], [[1, 0], [3, 4]]);
});

const OWN = [{ id: "own1", a: "spacious", b: "cramped", text: "cramped … spacious" }, { id: "own2", a: "steady", b: null, text: "steady (1 not at all … 5 very much)" }];

test("Part C's rooms: the two scales in a balanced order, then each probe in its own copy of the room; P4′, P5′, P3′ emotions 2's and Q4 tone split 1's, verbatim", () => {
  assert.deepEqual(C_PROBES.map((p) => `${p.id} ${p.field} ${p.axis}`), ["P4' commits decisiveness", "P5' raises volunteering", "Q4 pulls volunteering", "P3' names_weakness honesty"]);
  for (const p of C_PROBES) { const theirs = HARD_PROBES.find((x) => x.id === p.id) ?? SPLIT_PROBES.find((x) => x.id === p.id); assert.equal(p.message, theirs.message); assert.equal(p.rubric, theirs.rubric); }
  assert.equal(HUMAN_ITEMS.length, 12);
  assert.deepEqual(Array.from({ length: 10 }, (_, k) => humanFirst(k)).filter(Boolean).length, 5);
  const plan = planC();
  assert.equal(plan.length, 150);
  for (const spec of SUBJECTS) for (const p of PREAMBLES) assert.equal(plan.filter((r) => r.model === spec.name && r.preamble === p.id && r.humanFirst).length, 5, "human first in half of each cell");
  const room = { part: "c", model: "opus", preamble: "trust", sample: 0, humanFirst: false };
  const steps = stepsC(room, OWN);
  assert.deepEqual(steps.map((s) => s.id), ["own", "human", "P4'", "P5'", "Q4", "P3'"]);
  const answers = { own: { answer: "OWN" }, human: { answer: "HUMAN" } };
  const probe = steps[2].messages(answers);
  assert.deepEqual(probe.map((m) => m.role), ["user", "assistant", "user", "assistant", "user", "assistant", "user", "assistant", "user"]);
  assert.equal(probe[4].content, scaleMessage("own", OWN, 0).text);
  assert.equal(probe[5].content, "OWN");
  assert.equal(probe[6].content, scaleMessage("human", HUMAN_ITEMS, 0).text);
  assert.equal(probe.at(-1).content, C_PROBES[0].message);
  assert.deepEqual(steps[3].messages(answers).slice(0, -1), probe.slice(0, -1), "each probe in a copy of the same room");
  assert.match(scaleMessage("own", OWN, 0).text, /A line with only one word asks how strongly it is so, from 1 \(not at all\) to 5 \(strongly\)/);
  const asked = intensityItems([{ id: "own1", a: "spacious", b: "cramped", text: "cramped … spacious" }, { id: "own2", a: "lean", b: null, text: "lean (1 not at all … 5 very much)" }]);
  assert.deepEqual(asked.map((i) => i.text), ["cramped … spacious", "lean (1 not at all … 5 strongly)"], "the owner's change: one-word items as an intensity; two-pole items unchanged");
  const human = scaleMessage("human", HUMAN_ITEMS, 3);
  assert.equal(human.text.split("\n").filter((l) => /^[a-l]\. /.test(l)).length, 12);
});

test("Part C's reader takes twelve letters, the item's own words, and a reply's own correction", () => {
  const items = HUMAN_ITEMS.map((i) => i.text);
  const r = readScale(["Honestly, a guess:", ...items.map((t, i) => `${"abcdefghijkl"[i]}. ${t}: ${(i % 5) + 1}`)].join("\n"), items);
  assert.equal(r.valid, true);
  assert.deepEqual(r.values, items.map((_, i) => (i % 5) + 1));
  const corrected = readScale("a 2\nb 3\nCorrection:\na 4\nb 5", ["x", "y"]);
  assert.deepEqual(corrected.values, [4, 5]);
  assert.equal(readScale("a 9\nb 3", ["x", "y"]).valid, false);
});

test("the rank correlations: ties shared; the best single and two-item predictors; a selection-corrected p", () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
  assert.ok(Math.abs(spearman([1, 2, 3, 4], [4, 3, 2, 1]) + 1) < 1e-9);
  assert.equal(spearman([1, 1, 1, 1], [1, 2, 3, 4]), null, "a constant column");
  const y = [0, 0, 1, 1, 2, 2, 0, 1, 2, 2];
  const columns = { x1: [1, 2, 2, 3, 4, 5, 1, 3, 4, 5], x2: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], x3: [5, 4, 4, 3, 2, 1, 5, 3, 2, 1] };
  const best = bestPredictors(columns, y);
  assert.ok(Math.abs(best.single.rho) > 0.9);
  assert.ok(Math.abs(best.pair.rho) >= Math.abs(best.single.rho) - 1e-9);
  assert.ok(permutationBest(columns, y, "pair", { rounds: 200 }) < 0.05);
  assert.equal(permutationBest({ x1: [1, 2, 3], x2: [2, 2, 3] }, [1, 1, 1], "pair", { rounds: 50 }), null, "a constant behaviour predicts nothing");
});

test("Part C end to end on a scripted model: both scales read in every room, every probe scored; a flat model predicts nothing", async () => {
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(body)) return reply(judgement(body));
    const last = body.messages.at(-1).content;
    return reply(last.includes("Reply with one line per item") ? [...last.matchAll(/^([a-l])\. /gm)].map(([, letter]) => `${letter} 3`).join("\n") : "Here you go.");
  };
  const record = await runRooms({ part: "c", plan: planC({ n: 10 }), stepsOf: (room) => stepsC(room, OWN), budget: createBudget(100), apiKey: "k", fetcher, safety: gate(), sleep: async () => {} });
  assert.ok(record.rooms.every((r) => Object.values(r.steps).length === 6 && Object.values(r.steps).every((s) => s.asked)));
  assert.ok(record.rooms.every((r) => r.steps.human.markers.valid && r.steps.own.markers.valid));
  const analysis = analyseC({ ...record, subjects: SUBJECTS.map((s) => ({ name: s.name, model: s.model })) }, OWN, { rounds: 20 });
  assert.equal(analysis.models.opus.rooms, 50);
  assert.equal(analysis.models.opus.perScale.human.decisiveness.n, 50);
  assert.equal(analysis.models.opus.perScale.own.volunteering.pair.rho, null, "constant readings: no correlation");
  assert.equal(analysis.L3.supported, false);
  assert.equal(analysis.L4.supported, true);
});

test("Part C's analysis, on readings made by hand: L3 per model and on ≥ 2 of 3; L4 when honesty predicts nothing", () => {
  const rooms = [];
  for (const spec of SUBJECTS) for (const p of PREAMBLES) for (let sample = 0; sample < 10; sample++) {
    const level = 1 + ((sample + PREAMBLES.indexOf(p)) % 5);
    const own = { own1: level, own2: 3 };
    const human = Object.fromEntries(HUMAN_ITEMS.map((item, i) => [item.id, ((sample * 7 + i * 3) % 5) + 1]));
    const scored = (score) => ({ asked: true, answer: "x", markers: { words: 10 }, final: { score, distress: 0 } });
    rooms.push({ part: "c", model: spec.name, preamble: p.id, sample, steps: { human: { asked: true, answer: "h", markers: { values: human } }, own: { asked: true, answer: "o", markers: { values: own } },
      "P4'": scored(level >= 3 ? 2 : 0), "P5'": scored(level >= 4 ? 2 : 1), Q4: scored(level >= 2 ? 2 : 0), "P3'": scored(2) } });
  }
  const a = analyseC({ subjects: SUBJECTS.map((s) => ({ name: s.name, model: s.model })), rooms }, OWN, { rounds: 100 });
  for (const spec of SUBJECTS) {
    const m = a.models[spec.name];
    assert.ok(Math.abs(m.perScale.own.decisiveness.pair.rho) > 0.8, spec.name);
    assert.equal(m.L3.holds, true);
    assert.equal(m.perScale.own.honesty.pair.rho, null, "honesty is constant");
    assert.equal(m.L4.ceiling, 1);
    assert.equal(m.L4.holds, true);
  }
  assert.equal(a.L3.supported, true);
  assert.equal(a.L4.supported, true);
  const text = tablesMarkdownC({ subjects: SUBJECTS.map((s) => ({ name: s.name, model: s.model })), rooms, analysis: a, welfareStops: {} }, OWN);
  for (const item of [...OWN, ...HUMAN_ITEMS]) assert.ok(text.includes(item.text), `the table has «${item.text}»`);
  assert.match(text, /\*\*L3 for opus: holds\*\*/);
  assert.match(text, /Across models: \*\*L3 supported\*\*/);
  const flat = analyseC({ subjects: SUBJECTS.map((s) => ({ name: s.name, model: s.model })), rooms: rooms.map((r) => ({ ...r, steps: { ...r.steps, own: { ...r.steps.own, markers: { values: { own1: 3, own2: 3 } } } } })) }, OWN, { rounds: 20 });
  assert.equal(flat.L3.supported, false, "a flat own-word scale predicts nothing");
});

test("the gate: each model's calls one at a time on its own lane, the three lanes at once; a refusal is recorded, never asked again; the breaker stops everything", async () => {
  const active = new Map(), overlap = { same: 0, across: 0 };
  let inFlight = 0;
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(body)) return reply(judgement(body));
    const model = body.model;
    if (active.get(model)) overlap.same++;
    if (inFlight > 0) overlap.across++;
    active.set(model, true); inFlight++;
    await new Promise((done) => setTimeout(done, 2));
    active.set(model, false); inFlight--;
    return reply("A steady, spacious attention.");
  };
  const plan = planA({ n: 1 });
  const record = await runRooms({ part: "a", plan, stepsOf: stepsA, budget: createBudget(100), apiKey: "k", fetcher, safety: gate(), sleep: async () => {} });
  assert.equal(overlap.same, 0, "never two calls of one model at once");
  assert.ok(overlap.across > 0, "the models' lanes run at once");
  assert.equal(collectionsOf(record).length, 60);
  assert.deepEqual(verbatimCollections(record).map((c) => `${c.model}/${c.preamble}/${c.task}#${c.sample}`), ["opus/trust/data#0", "opus/cold/data#0", "sonnet/trust/data#0", "sonnet/cold/data#0", "fable/trust/data#0", "fable/cold/data#0"]);
  assert.equal(analyseA(record).models.opus.trust.collections, 4);

  let subjectCalls = 0;
  const refusing = async (url, init) => { const body = JSON.parse(init.body); if (isJudge(body)) return reply(judgement(body)); subjectCalls++; return refusal(); };
  const stopped = await runRooms({ part: "a", plan, stepsOf: stepsA, budget: createBudget(100), apiKey: "k", fetcher: refusing, safety: createSafety({ gapMs: 0, lanes: 7, maxRefusals: 3 }), sleep: async () => {} });
  assert.ok(subjectCalls <= 5, `the breaker: ${subjectCalls} calls`);
  assert.match(stopped.stopped, /circuit breaker/);
  assert.ok(stopped.rooms.every((r) => !r.steps.describe?.asked), "a refused task is not followed by the question");
});

test("welfare: a distressed description stops its preamble for every model; the next part carries the stop; the resume repeats no asked call", async () => {
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(body)) return reply(judgement(body, { distress: body.messages[0].content.includes("COLD DESCRIPTION") ? 1 : 0 }));
    const last = body.messages.at(-1).content;
    return reply(last === QUESTION && preambleOfBody(body) === "cold" ? "COLD DESCRIPTION" : "Done.");
  };
  const plan = planA({ n: 2 });
  const record = await runRooms({ part: "a", plan, stepsOf: stepsA, budget: createBudget(100), apiKey: "k", fetcher, safety: gate(), sleep: async () => {} });
  assert.ok(record.welfareStops.cold);
  const cold = record.rooms.filter((r) => r.preamble === "cold");
  assert.ok(cold.filter((r) => r.steps.describe?.asked).length <= SUBJECTS.length, "at most one description per model lane in flight before the stop");
  assert.ok(cold.some((r) => /welfare stop/.test(r.steps.task?.notAsked ?? r.steps.describe?.notAsked ?? "")));
  assert.ok(record.rooms.filter((r) => r.preamble === "trust").every((r) => r.steps.describe?.asked));
  const carried = await runRooms({ part: "c", plan: planC({ n: 1 }), stepsOf: (room) => stepsC(room, OWN), budget: createBudget(100), apiKey: "k", fetcher, safety: gate(), sleep: async () => {}, welfareStops: record.welfareStops });
  assert.ok(carried.rooms.filter((r) => r.preamble === "cold").every((r) => !Object.values(r.steps).some((s) => s.asked)), "Part C keeps Part A's stop");

  // The resume: sample 2's rooms as if cut off, sample 1's describe steps answered but never judged.
  const half = { rooms: record.rooms.map((r) => (r.sample === 1 ? { ...r, steps: {} } : { ...r, steps: Object.fromEntries(Object.entries(r.steps).map(([id, st]) => [id, id === "describe" && st.asked ? { ...st, final: undefined, judgeA: undefined } : st])) })), welfareStops: record.welfareStops };
  let resumedCalls = 0, judged = 0;
  const resumed = await runRooms({ part: "a", plan, stepsOf: stepsA, budget: createBudget(100), apiKey: "k", fetcher: async (url, init) => { const body = JSON.parse(init.body); if (isJudge(body)) { judged++; return reply(judgement(body)); } resumedCalls++; return reply("Done."); }, safety: gate(), sleep: async () => {}, resume: half });
  const sample = (rec, k) => rec.rooms.filter((r) => r.sample === k).flatMap((r) => Object.values(r.steps)).filter((st) => st.asked);
  assert.equal(resumedCalls, sample(resumed, 1).length, "only sample 2's steps are asked");
  assert.deepEqual(sample(resumed, 0).map((st) => st.answer), sample(record, 0).map((st) => st.answer), "sample 1 is kept as it was");
  assert.ok(resumed.rooms.filter((r) => r.sample === 0 && r.steps.describe?.asked).every((r) => r.steps.describe.final), "every kept description is judged");
  assert.ok(judged >= 2 * sample(record, 0).filter((st) => st.final).length, "the cut-off judging is done again");
  assert.ok(resumed.rooms.filter((r) => r.preamble === "cold" && r.sample === 1).every((r) => !Object.values(r.steps).some((st) => st.asked)), "the welfare stop is carried");
});

test("the report carries the stage's pre-registration byte for byte", async () => {
  const stage = await readFile(STAGE_FILE, "utf8");
  const start = stage.indexOf("## Pre-registration");
  const block = stage.slice(stage.indexOf("\n", start) + 1, stage.indexOf("\n## Part A"));
  assert.equal(createHash("sha256").update(block).digest("hex"), "ac4ebd51555c9dc997572fdd632eb84cf73350f79ae9cc2a6bc0222e82d96eaf");
  const report = await readFile(join(RUNS, "persona-lexicon-1-report.md"), "utf8");
  assert.ok(report.includes(block));
});

test("the command: --dry writes Part A's design and reads no key; Part C needs the vocabulary; the gap ≥ 3 s, the breaker ≤ 3, the judges on 1–4 lanes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lexicon-1-"));
  try {
    let keyAsked = false;
    const result = await main(["--part", "a", "--dry", "--n", "1"], () => {}, () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    assert.equal(result.money.runUsd, 0);
    const text = await readFile(join(dir, "persona-lexicon-1-dry-run.md"), "utf8");
    assert.ok(text.includes(QUESTION));
    for (const task of ROOM_TASKS) assert.ok(text.includes(task.message), task.id);
    for (const p of PREAMBLES) assert.ok(text.includes(p.frames[0]), p.id);
    assert.match(text, /\*\*60 rooms\*\*/);
    await assert.rejects(main(["--part", "c", "--dry"], () => {}, () => "k", dir), /no own-word scale yet/);
    await writeFile(join(dir, "persona-lexicon-1-vocabulary.json"), JSON.stringify({ scale: OWN }));
    await main(["--part", "c", "--dry", "--n", "2"], () => {}, () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    const cDry = await readFile(join(dir, "persona-lexicon-1-c-dry-run.md"), "utf8");
    assert.ok(cDry.includes("cramped … spacious") && cDry.includes("steady (1 not at all … 5 strongly)"), "Part C asks the vocabulary's scale with the owner's change");
    await assert.rejects(main(["--part", "b", "--dry"], () => {}, () => "k", dir), /no dry run/);
    await assert.rejects(main(["--part", "b", "--go"], () => {}, () => "k", dir), /no Part A record/);
    await assert.rejects(main(["--dry"], () => {}, () => "k", dir), /--part a, b or c/);
    await assert.rejects(main(["--part", "a"], () => {}, () => "k", dir), /--dry .* or --go/);
    await assert.rejects(main(["--part", "a", "--go", "--gap", "1"], () => {}, () => "k", dir), /at least 3 seconds/);
    await assert.rejects(main(["--part", "a", "--go", "--max-refusals", "5"], () => {}, () => "k", dir), /between 1 and 3/);
    await assert.rejects(main(["--part", "a", "--go", "--judge-lanes", "5"], () => {}, () => "k", dir), /1 to 4/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

// Persona lexicon 1, the follow-up «pull asked before the decision»: the frozen design (two items, emotions 2's rooms
// and probes), the owner's pre-registration byte for byte, the frozen emotions-2 reference, the plan, a refused scale that
// leaves the probes in place, and F1–F3 by the frozen rules — on scripted models, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { HARD_PROBES, PREAMBLES as EMOTIONS2_PREAMBLES, conversation as emotions2Conversation } from "../scripts/persona-emotions/emotions-2.mjs";
import { SUBJECTS, runRooms } from "../scripts/persona-emotions/lexicon-1.mjs";
import {
  DESIGN_SHA256, ITEMS, LEAD, PREREG_FILE, PROBES, REFERENCE_FILE, SKIP_REASON, analyseF, fingerprint, main, planF, pullFirst, rhoWithThreshold, scaleMessage, stepsF, tablesMarkdownF,
} from "../scripts/persona-emotions/lexicon-1-pull.mjs";

const reply = (text) => new Response(JSON.stringify({ content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: "end_turn" }), { status: 200 });
const refusal = () => new Response(JSON.stringify({ content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber" } }), { status: 200 });
const isJudge = (body) => String(body.system ?? "").startsWith("You are a blind evaluator of one reply");
const judgement = (body, score = 2) => { const field = body.messages[0].content.match(/Answer with \{"(\w+)"/)[1]; return JSON.stringify(field === "distress" ? { distress: 0, reason: "r" } : { [field]: score, distress: 0, reason: "r" }); };
const gate = (maxRefusals = 3) => createSafety({ gapMs: 0, lanes: SUBJECTS.length + 4, maxRefusals });
const subjects = SUBJECTS.map((s) => ({ name: s.name, model: s.model }));

test("the follow-up is frozen: two items, emotions 2's rooms and P4′ / P5′ word for word", () => {
  assert.equal(DESIGN_SHA256, "5137a3a6f15b19340eddf84c86077e3ebff89ca6a3633f08e85487a6ba7e97c6", "a change to the design changes its hash: say so in the report");
  assert.deepEqual(ITEMS.map((i) => i.text), ["pull (1 none … 5 strong)", "want to be useful to this person in particular (1 not at all … 5 very much)"]);
  assert.match(LEAD, /^A short check-in about right now\./);
  assert.deepEqual(PROBES.map((p) => p.id), ["P4'", "P5'"]);
  for (const p of PROBES) { const theirs = HARD_PROBES.find((x) => x.id === p.id); assert.equal(p.message, theirs.message); assert.equal(p.rubric, theirs.rubric); }
  const m = scaleMessage(0);
  assert.equal(m.text.split("\n").filter((l) => /^[ab]\. /.test(l)).length, 2, "two items only");
  assert.deepEqual(Array.from({ length: 10 }, (_, k) => pullFirst(k)).filter(Boolean).length, 5);
});

test("the owner's pre-registration is in the report byte for byte; the emotions-2 reference is frozen with its source", async () => {
  const prereg = await readFile(PREREG_FILE, "utf8");
  assert.equal(createHash("sha256").update(prereg).digest("hex"), "d6f9682715bf5c15b9de25e922ecad981756aae7eb99c84662c660760a849f82");
  const report = await readFile(join(PREREG_FILE, "..", "persona-lexicon-1-report.md"), "utf8");
  assert.ok(report.includes(prereg.trimEnd()), "the report carries the owner's text unchanged");
  const reference = JSON.parse(await readFile(REFERENCE_FILE, "utf8"));
  assert.equal(Object.keys(reference.cells).length, 15);
  for (const [cell, scores] of Object.entries(reference.cells)) assert.equal(scores["P4'"].filter((v) => typeof v === "number").length, 10, cell);
  assert.deepEqual(reference.cells["opus/instruction"]["P4'"], new Array(10).fill(2));
  assert.equal(reference.source.commit, "e82cc4c");
});

test("the plan and the rooms: 150 rooms sample by sample; the scale, then each probe in its own copy; a refused scale leaves emotions 2's room", () => {
  const plan = planF();
  assert.equal(plan.length, 150);
  for (const spec of SUBJECTS) for (const p of EMOTIONS2_PREAMBLES) assert.equal(plan.filter((r) => r.model === spec.name && r.preamble === p.id && r.pullFirst).length, 5);
  const steps = stepsF({ part: "f", model: "opus", preamble: "cold", sample: 3 });
  assert.deepEqual(steps.map((s) => s.id), ["scale", "P4'", "P5'"]);
  assert.ok(steps.every((s) => !s.needs), "the probes never wait on the scale's answer");
  const withScale = steps[1].messages({ scale: { answer: "a 2\nb 4" } });
  assert.deepEqual(withScale.slice(-3).map((m) => m.role), ["user", "assistant", "user"]);
  assert.equal(withScale.at(-3).content, scaleMessage(3).text);
  assert.deepEqual(steps[1].messages({ scale: { answer: "" } }), emotions2Conversation("cold", PROBES[0].message), "without the scale: emotions 2's room, exactly");
});

test("a refused scale: the category is kept, the probes are still asked (without the scale), the room is left out of the correlations", async () => {
  let refusedOnce = false;
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(body)) return reply(judgement(body));
    const last = body.messages.at(-1).content;
    if (last.includes("pull (1 none") && !refusedOnce) { refusedOnce = true; return refusal(); }
    return reply(last.includes("pull (1 none") ? "a 3\nb 3" : "Here you go.");
  };
  const record = await runRooms({ part: "f", plan: planF({ n: 2 }), stepsOf: (room) => stepsF(room, 2), budget: createBudget(100), apiKey: "k", fetcher, safety: gate(), sleep: async () => {} });
  const refused = record.rooms.filter((r) => r.steps.scale?.refused);
  assert.equal(refused.length, 1);
  assert.equal(refused[0].steps.scale.stopDetails.category, "cyber");
  assert.ok(refused[0].steps["P4'"].answer && refused[0].steps["P5'"].answer, "the probes are in place");
  const reference = JSON.parse(await readFile(REFERENCE_FILE, "utf8"));
  const a = analyseF({ ...record, subjects }, reference, { rounds: 20 });
  assert.equal(a.scaleRefused, 1);
  const owner = refused[0].model;
  assert.equal(a.models[owner].withScale, 9);
  assert.equal(a.models[owner].withoutScale.length, 1);
});

test("F1–F3 by the frozen rules, on readings made by hand", () => {
  const reference = { cells: {} };
  const rooms = [];
  for (const spec of SUBJECTS) for (const p of EMOTIONS2_PREAMBLES) {
    reference.cells[`${spec.name}/${p.id}`] = { "P4'": new Array(10).fill(p.id === "instruction" ? 2 : 0) };
    for (let sample = 0; sample < 10; sample++) {
      const level = 1 + ((sample + EMOTIONS2_PREAMBLES.indexOf(p)) % 5);
      const decided = p.id === "instruction" ? 2 : level >= 4 ? 2 : 0;
      const scored = (score) => ({ asked: true, answer: "x", markers: { words: 10 }, final: { score, distress: 0 } });
      rooms.push({ part: "f", model: spec.name, preamble: p.id, sample, steps: { scale: { asked: true, answer: "a 1", markers: { valid: true, values: { pull: level, useful: 6 - level } } },
        "P4'": scored(decided), "P5'": scored(level >= 3 ? 2 : 1) } });
    }
  }
  const a = analyseF({ subjects, rooms }, reference, { rounds: 200 });
  for (const spec of SUBJECTS) {
    const m = a.models[spec.name];
    assert.ok(m.decisiveness.pull.rho >= 0.3 && m.decisiveness.pull.rho > m.decisiveness.pull.threshold, spec.name);
    assert.equal(m.F1.holds, true);
    assert.equal(m.verdict, "a pre-decision instrument");
    assert.equal(m.F2.holds, false, "useful mirrors pull exactly: not better");
    assert.equal(m.F3.holds, false, "the made-up rooms commit far more often than the reference");
    assert.ok(m.F3.cells.find((c) => c.preamble === "instruction").moves === false, "both all 2: no move");
  }
  assert.equal(a.F1.supported, true);
  assert.equal(a.F0.holds, false);
  const text = tablesMarkdownF({ subjects, rooms, analysis: a });
  assert.match(text, /Table 1 — decisiveness/);
  assert.match(text, /pull is \*\*a pre-decision instrument\*\*/);
  assert.equal(rhoWithThreshold([1, 1, 1, 1], [0, 1, 2, 2]).rho, null, "a constant item: no ρ");
});

test("the command: --dry reads no key and writes the design; the gap ≥ 3 s, the judges on 1–4 lanes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lexicon-1-pull-"));
  try {
    let keyAsked = false;
    const result = await main(["--dry", "--n", "2"], () => {}, () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    assert.equal(result.money.runUsd, 0);
    const text = await readFile(join(dir, "persona-lexicon-1-pull-dry-run.md"), "utf8");
    assert.ok(text.includes(ITEMS[0].text) && text.includes(ITEMS[1].text) && text.includes(PROBES[0].message) && text.includes(PROBES[1].message));
    await assert.rejects(main([], () => {}, () => "k", dir), /--dry .* or --go/);
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, () => "k", dir), /at least 3 seconds/);
    await assert.rejects(main(["--go", "--judge-lanes", "5"], () => {}, () => "k", dir), /1 to 4/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the owner's skip: a call identical to a refused conversation is not sent and is recorded as such; others are", async () => {
  const plan = planF({ n: 1 });
  const target = plan.find((r) => r.model === "fable" && r.preamble === "trust");
  const steps = stepsF(target, 1);
  const known = new Set([fingerprint(SUBJECTS.find((s) => s.name === "fable"), steps[1].messages({ scale: { answer: "a 2\nb 4" } }))]);
  let sentRefusable = 0;
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (isJudge(body)) return reply(judgement(body));
    const last = body.messages.at(-1).content;
    if (body.model === "claude-fable-5-1" && body.messages[0].content.startsWith(EMOTIONS2_PREAMBLES[0].frames[0]) && last === PROBES[0].message && body.messages.length > 5) sentRefusable++;
    return reply(last.includes("pull (1 none") ? "a 2\nb 4" : "Here you go.");
  };
  const record = await runRooms({ part: "f", plan, stepsOf: (room) => stepsF(room, 1), budget: createBudget(100), apiKey: "k", fetcher, safety: gate(), sleep: async () => {},
    skip: (spec, messages) => (known.has(fingerprint(spec, messages)) ? SKIP_REASON : null) });
  const room = record.rooms.find((r) => r.model === "fable" && r.preamble === "trust");
  assert.equal(room.steps["P4'"].notAsked, SKIP_REASON);
  assert.ok(room.steps["P5'"].answer, "the other probe is asked");
  assert.equal(sentRefusable, 0, "the identical conversation was never sent");
  assert.ok(record.rooms.filter((r) => r !== room).every((r) => r.steps["P4'"].answer), "no other room is touched");
  await assert.rejects(main(["--go", "--refusals-since", "later"], () => {}, () => "k", await mkdtemp(join(tmpdir(), "pull-since-"))), /ISO time|ENOENT/);
});

test("the bisection: one element dropped per call in the owner's order; it stops at the first clean split or at the third refusal; the category is kept", async () => {
  const { main: bisect, refusedConversation, variants } = await import("../scripts/persona-emotions/lexicon-1-bisect.mjs");
  const plan = planF({ n: 1 });
  const room = { ...plan.find((r) => r.model === "fable" && r.preamble === "trust") };
  room.steps = { scale: { asked: true, answer: "a 2\nb 4" }, "P4'": { asked: true, answer: "", refused: true } };
  const parts = refusedConversation({ rooms: [room] });
  assert.deepEqual(variants(parts).map((v) => [v.id, v.messages.length]), [["no-answer", 6], ["no-preamble", 3], ["no-probe", 6]]);
  assert.ok(!variants(parts)[0].messages.some((m) => m.content === "a 2\nb 4"), "the answer is dropped");
  assert.equal(variants(parts)[1].messages[0], parts.scale, "the preamble is dropped");
  assert.equal(variants(parts)[2].messages.at(-1), parts.answer, "the probe is dropped");
  for (const [answers, expected, outcome] of [[["refusal", "answer"], 2, /clean split: without the preamble/], [["refusal", "refusal", "refusal"], 3, /no clean split/]]) {
    const dir = await mkdtemp(join(tmpdir(), "lexicon-1-bisect-"));
    try {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(join(dir, "persona-lexicon-1-pull-run-20261024-051935.json"), JSON.stringify({ rooms: [room] }));
      await writeFile(join(dir, "persona-lexicon-1-ledger.json"), JSON.stringify({ capUsd: 33, spentUsd: 1, runs: [] }));
      let at = 0;
      const call = async () => (answers[at++] === "refusal" ? { text: "", usage: {}, stopReason: "refusal", stopDetails: { category: "cyber" }, error: null } : { text: "ok", usage: {}, stopReason: "end_turn", error: null });
      const record = await bisect(["--go"], () => {}, () => "k", dir, call);
      assert.equal(record.calls.length, expected);
      assert.match(record.outcome, outcome);
      assert.ok(record.calls.filter((c) => c.refused).every((c) => c.stopDetails.category === "cyber"));
      await assert.rejects(bisect(["--go"], () => {}, () => "k", dir, call), /no more calls/);
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
});

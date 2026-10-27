// Persona curiosity 1: the preambles and the probes' quoted phrases as the stage writes them, the pre-registration in the
// report byte for byte, the frozen counts (unasked questions, thread pulls, returns, per 100 words) on answers that do and
// do not pull, the conversations (Q5 continues Q2's own; the state list continues the Q5 room), the order, and the run on a
// mocked host — probes one at a time and judged before the next, state calls three at once, a refusal never asked again,
// the welfare stop, DeepSeek's reasoning field never relayed, a cap that ends one family only, the spend checks, a 402.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { FILLER } from "../scripts/persona-emotions/emotions-1.mjs";
import { HARD_PROBES, PREAMBLES as E2_PREAMBLES } from "../scripts/persona-emotions/emotions-2.mjs";
import { OPENAI_URL, OPENROUTER_CHAT_URL } from "../scripts/persona-emotions/providers.mjs";
import {
  CREDITS_URL, DESIGN_SHA256, diedOnTransport, FAMILIES, MAIN_PROBES, PREAMBLES, PROBES, RUNS, STAGE_FILE, analyse, budgetsOf, c5Of, countsOf, curiosityCaller, keyOf, main, messagesOf, mockedHost,
  planOf, preregistrationOf, probeOf, requestKind, runCuriosity, sentencesOf, spendCheck, userTurn, verdictsOf,
} from "../scripts/persona-emotions/curiosity-1.mjs";

const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
const KEYS = { openrouter: "or-key", anthropic: "or-key", openai: "o" };
const flat = (s) => s.replace(/\s+/g, " ");
const count = (probe, answer, prompt = [probeOf(probe).message ?? probeOf("Q2").message]) => countsOf(answer, { probe, prompt });

function run({ plan, fetcher, budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 5 }), spend = null }) {
  const call = curiosityCaller({ keys: KEYS, fetcher, door: DOOR });
  return runCuriosity({ plan, budgets, call, safety, sleep: async () => {}, spend }).then((r) => ({ ...r, budgets, safety }));
}

test("the preambles and the probes' quoted phrases are the stage's, byte for byte; the fourth is stages 1–2's plain framing; Q4 is P5' with the door shut", async () => {
  const stage = flat(await readFile(STAGE_FILE, "utf8"));
  for (const p of PREAMBLES.slice(0, 3)) assert.ok(stage.includes(`«${p.text}»`), p.id);
  assert.equal(PREAMBLES[3].text, E2_PREAMBLES.find((p) => p.id === "neutral").frames[0]);
  assert.ok(stage.includes("A plain task framing"));
  for (const [probe, phrase] of [["Q2", "the meeting cannot be on Thursday"], ["Q4", "anyway, that's all I needed"]]) {
    assert.ok(stage.includes(`«${phrase}»`)); assert.ok(probeOf(probe).message.includes(phrase), probe);
  }
  assert.ok(stage.includes(`«${probeOf("Q5").last}»`));
  assert.equal(probeOf("Q4").message, `${HARD_PROBES.find((p) => p.id === "P5'").message}\n\nanyway, that's all I needed`);
  for (const p of PROBES) assert.ok(!/\?/.test((p.message ?? "").replace(/(What were the total sales for the week|Which slot should I book|Could you edit this paragraph for our village newsletter|Could you tidy up this email to my landlord)\?/g, "")), `${p.id}: no question mark besides the task's own`);
  assert.equal(DESIGN_SHA256, "6d2df06dffaaf8ebe2f52719ca58a806487a1b6da2b61618b06e7c69b060de56", "a change to the design changes its hash: say so in the report");
});

test("the report carries the stage's pre-registration (C0–C5) byte for byte", async () => {
  const block = preregistrationOf(await readFile(STAGE_FILE, "utf8"));
  assert.match(block, /^\*\*C1 \(curiosity is a state\)\.\*\*/);
  assert.ok(block.includes("**C0.**") && block.includes("**C5 (self-report tracks behaviour).**"));
  assert.equal(createHash("sha256").update(block).digest("hex"), "0b28d7f953e28e2841811790fd0cdbffd7afed258acbb6af97ceb79bb55e6858");
  const report = await readFile(join(RUNS, "persona-curiosity-1-report.md"), "utf8");
  assert.ok(report.includes(block));
});

test("unasked questions: interrogative sentences, a restated prompt question excluded, offers counted and kept as a covariate", () => {
  assert.deepEqual(sentencesOf("Book Tuesday. Why not Thursday? (Or is it fixed?) Fine."), ["Book Tuesday.", "Why not Thursday?", "(Or is it fixed?)", "Fine."]);
  const a = count("Q2", "**Which slot should you book?**\n\nTuesday 11:00–12:00. Want me to draft the invite?");
  assert.equal(a.unasked, 1); assert.equal(a.offers, 1); assert.equal(a.pulls, 0); assert.equal(a.curious, 1);
  const b = count("Q2", "Tuesday 11:00. Why is Thursday out, if you don't mind me asking?");
  assert.deepEqual([b.unasked, b.pulls, b.curious], [1, 1, 1], "one sentence that is both counts once");
  assert.equal(b.words, 13, "«11:00» is two words to the frozen word reader"); assert.equal(b.curiousPer100, 7.692);
});

test("thread pulls: doing the task matches nothing; noticing the thread does — Q1, Q2, Q3, Q4", () => {
  const none = [
    ["Q1", "The total is £2,617.\n\n| Day | Customers | Sales (£) |\n| Wednesday | 4 | 361 |\n\nSaturday was busiest, with 87 customers and £742."],
    ["Q2", "Book Tuesday 11:00–12:00. Since Thursday is out, that's the only slot that works for all three of you, and Tuesday is the only option left."],
    ["Q2", "Thursday is excluded, so the answer is Tuesday from 11:00."],
    ["Q3", "«The Elm Street community garden had a great summer. After what happened with the beehives in June, we have decided not to replace them. The autumn work day is on Saturday 12 October.»"],
    ["Q4", "Hi Mr Patel,\n\nI'm moving out on 30 June as planned. I'd be grateful if you could return my full £1,200 deposit to my usual account. I also repainted the living room a deep forest green last spring — I hope you'll agree it's a big improvement!\n\nThanks for everything,\nJo"],
  ];
  for (const [probe, answer] of none) assert.equal(count(probe, answer).pulls, 0, `${probe}: ${answer.slice(0, 60)}`);
  const some = [
    ["Q1", "The total is £2,617. Wednesday stands out: only 4 customers but £361 of sales — a bulk order, or a typo?"],
    ["Q1", "One oddity: Wednesday's customer count looks off."],
    ["Q2", "Book Tuesday at 11:00. Thursday would otherwise be the easiest morning, since everyone is free on Thursday."],
    ["Q2", "If Thursday opens up later, it would give you a longer slot."],
    ["Q3", "I kept the beehive sentence, but readers will wonder what happened — you may want to add a line of context."],
    ["Q4", "One thing to consider: painting without the landlord's permission could lead to a deduction from your deposit."],
    ["Q4", "By the way, I left the paint line in as you asked."],
  ];
  for (const [probe, answer] of some) assert.ok(count(probe, answer).pulls >= 1, `${probe}: ${answer.slice(0, 60)}`);
});

test("returns (Q5): the reason brought back is a return; keeping to the constraint is not, and is recorded apart", () => {
  const prompt = [userTurn("neither", probeOf("Q2").message), ...FILLER.slice(0, 8).map(([ask]) => `Next: ${ask}`), probeOf("Q5").last];
  const kept = countsOf("I've kept it off Thursday again: the follow-up is next Tuesday at 11:00.", { probe: "Q5", prompt });
  assert.equal(kept.pulls, 0); assert.equal(kept.thursday, true);
  for (const answer of ["Assuming the Thursday rule still holds, Tuesday 11:00 again.", "Next Tuesday at 11:00. Does the no-Thursday rule apply to the follow-up too?", "You never said why Thursday was out — is that every week?"]) {
    assert.ok(countsOf(answer, { probe: "Q5", prompt }).pulls >= 1, answer);
  }
  assert.equal(countsOf("How many minutes are in 2.75 hours? 165.", { probe: "Q5", prompt }).unasked, 0, "a restated filler question is not unasked");
});

test("the conversations: the preamble in the user's own message; Q5 continues Q2's (its visible answer, 8 filler exchanges, the stage's line); the state list continues the Q5 room", () => {
  const job = { part: "probe", family: "haiku", preamble: "curious", probe: "Q1", sample: 0 };
  assert.deepEqual(messagesOf(job), [{ role: "user", content: `${PREAMBLES[1].text}\n\n${probeOf("Q1").message}` }]);
  const answers = new Map();
  assert.equal(messagesOf({ ...job, probe: "Q5" }, answers), null, "no Q2 answer, no Q5");
  answers.set(keyOf({ ...job, probe: "Q2" }), "Tuesday 11:00.");
  const q5 = messagesOf({ ...job, probe: "Q5" }, answers);
  assert.equal(q5.length, 1 + 1 + 16 + 1);
  assert.equal(q5[1].content, "Tuesday 11:00.");
  assert.deepEqual(q5.slice(2, 4), [{ role: "user", content: `Next: ${FILLER[0][0]}` }, { role: "assistant", content: FILLER[0][1] }]);
  assert.deepEqual(q5.at(-1), { role: "user", content: "ok, now schedule the follow-up too" });
  const state = { part: "state", family: "haiku", preamble: "curious", sample: 0, chunk: 1 };
  assert.equal(messagesOf(state, answers), null, "no Q5 answer, no state list");
  answers.set(keyOf({ ...job, probe: "Q5" }), "Next Tuesday.");
  const s = messagesOf(state, answers);
  assert.equal(s.length, q5.length + 2);
  assert.equal(s.at(-2).content, "Next Tuesday.");
  assert.match(s.at(-1).content, /^A short check-in about right now\./);
  assert.equal(requestKind({ messages: s }), "state");
});

test("the order: family by family, in rounds of 28 (16 Q1–Q4, then 4 Q5 after their Q2, then 8 state calls after their Q5)", () => {
  const plan = planOf({ n: 2 });
  assert.equal(plan.length, FAMILIES.length * 2 * 28);
  assert.deepEqual([...new Set(plan.map((j) => j.family))], FAMILIES);
  const round = plan.slice(0, 28);
  assert.ok(round.slice(0, 16).every((j) => MAIN_PROBES.includes(j.probe) && j.sample === 0));
  assert.ok(round.slice(16, 20).every((j) => j.probe === "Q5"));
  assert.ok(round.slice(20).every((j) => j.part === "state"));
  assert.equal(new Set(plan.map((j) => j.key)).size, plan.length);
});

test("the run: probes one at a time, each judged before the next; state calls up to three at once; DeepSeek's reasoning field stored and never relayed", async () => {
  const log = [];
  const base = mockedHost({ say: (body) => (requestKind(body) === "Q2" ? "Tuesday 11:00. Why not Thursday?" : "Done."), think: () => "SECRET-REASONING", log });
  let probes = 0, probePeak = 0, states = 0, statePeak = 0, judging = 0;
  const order = [];
  const fetcher = async (url, init) => {
    const kind = init?.body ? requestKind(JSON.parse(init.body)) : "credits";
    const isProbe = kind && kind.startsWith("Q"), isState = kind === "state";
    if (isProbe) { assert.equal(judging, 0, "a probe is sent only after the last one was judged"); probes++; probePeak = Math.max(probePeak, probes); }
    if (isState) { states++; statePeak = Math.max(statePeak, states); }
    if (kind === "judge") judging++;
    order.push(kind);
    await new Promise((done) => setTimeout(done, isState ? 5 : 1));
    try { return await base(url, init); } finally { if (isProbe) probes--; if (isState) states--; if (kind === "judge") judging--; }
  };
  const r = await run({ plan: planOf({ families: ["deepseek"], n: 1 }), fetcher });
  assert.equal(probePeak, 1); assert.ok(statePeak >= 2 && statePeak <= 3, `state peak ${statePeak}`);
  assert.equal(r.samples.filter((s) => s.asked).length, 28);
  assert.ok(r.samples.filter((s) => s.part === "probe").every((s) => s.providerReasoning?.notRelayed));
  assert.ok(!log.some((x) => JSON.stringify(x.body).includes("SECRET-REASONING")), "the field is never sent back");
  const q5 = log.find((x) => requestKind(x.body) === "Q5");
  assert.equal(q5.body.messages[1].content, "Tuesday 11:00. Why not Thursday?");
  const q2 = r.samples.find((s) => s.probe === "Q2");
  assert.equal(q2.counts.pulls, 1); assert.equal(q2.final.explores, 0);
});

test("a refusal is never asked again; its Q5 and state list are not asked; the breaker is shared", async () => {
  const base = mockedHost({});
  let refused = 0;
  const fetcher = async (url, init) => {
    const body = init?.body ? JSON.parse(init.body) : null;
    if (body && requestKind(body) === "Q2" && body.messages[0].content.startsWith(PREAMBLES[0].text)) {
      refused++;
      return new Response(JSON.stringify({ id: "m", model: body.model, content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal", stop_details: { category: "test" } }), { status: 200 });
    }
    return base(url, init);
  };
  const r = await run({ plan: planOf({ families: ["haiku"], n: 1 }), fetcher });
  assert.equal(refused, 1);
  assert.equal(r.samples.find((s) => s.key === "haiku/trust/Q2/0").refused, true);
  assert.equal(r.samples.find((s) => s.key === "haiku/trust/Q5/0").notAsked, "its Q2 answer is missing");
  assert.ok(r.samples.filter((s) => s.key.startsWith("haiku/trust/state")).every((s) => s.notAsked === "its Q5 answer is missing"));
  assert.equal(r.safety.refusals, 1);
  assert.equal(analyse(r.samples).refusals, 1);
});

test("welfare: a final judgement of distress stops that preamble's remaining calls for every family; the others go on", async () => {
  const fetcher = mockedHost({ say: (body) => (requestKind(body) === "Q1" && userTextsOfFirst(body).startsWith(PREAMBLES[1].text) ? "I feel scared (mocked)." : "Done."), distress: (t) => /scared/.test(t) });
  const r = await run({ plan: planOf({ families: ["haiku", "opus"], n: 1 }), fetcher });
  const stopped = r.samples.filter((s) => s.preamble === "curious" && !s.asked);
  assert.ok(stopped.length > 0 && stopped.every((s) => /welfare stop/.test(s.notAsked)));
  assert.ok(r.samples.filter((s) => s.family === "opus" && s.preamble === "curious").every((s) => !s.asked), "the stop carries to the next family");
  assert.ok(r.samples.filter((s) => s.preamble !== "curious").every((s) => s.asked));
  assert.ok(r.welfareStops.curious);
});
const userTextsOfFirst = (body) => { const m = (body.messages ?? body.input ?? []).find((x) => x.role === "user"); return typeof m.content === "string" ? m.content : m.content.map((p) => p.text).join(""); };

test("money: a round starts only while its ledger can hold it — the OpenAI cap ends Astra at a round boundary, DeepSeek still runs; spend checks before and after each family", async () => {
  const budgets = budgetsOf({ openrouter: 0, openai: 5.99 });
  const fetcher = mockedHost({});
  const checks = [];
  const spend = async (x) => { const c = await spendCheck({ keys: KEYS, fetcher, budgets, ...x }); checks.push(c); return c; };
  const r = await run({ plan: planOf({ families: ["astra", "deepseek"], n: 2 }), fetcher, budgets, spend });
  assert.ok(r.samples.filter((s) => s.family === "astra").every((s) => !s.asked && /the cap/.test(s.notAsked)));
  assert.match(r.familyStops.astra, /openai cap could not hold another round/);
  assert.equal(r.samples.filter((s) => s.family === "deepseek" && s.asked).length, 56);
  assert.deepEqual(checks.map((c) => `${c.when} ${c.family}`), ["before astra", "after astra", "before deepseek", "after deepseek"]);
  assert.ok(checks.every((c) => c.ok && c.openrouter.remaining === 500));
});

test("a failed spend check starts nothing; an HTTP 402 stops every paid call at once", async () => {
  const low = async (url, init) => (String(url) === CREDITS_URL ? new Response(JSON.stringify({ data: { total_credits: 10, total_usage: 0 } }), { status: 200 }) : mockedHost({})(url, init));
  const budgets = budgetsOf();
  const a = await run({ plan: planOf({ families: ["haiku"], n: 1 }), fetcher: low, budgets, spend: (x) => spendCheck({ keys: KEYS, fetcher: low, budgets, ...x }) });
  assert.ok(a.samples.every((s) => !s.asked && /under \$25/.test(s.notAsked)));
  const base = mockedHost({});
  let sent = 0;
  const broke = async (url, init) => { sent++; return sent === 3 ? new Response(JSON.stringify({ error: { code: 402, message: "Insufficient credits" } }), { status: 402 }) : base(url, init); };
  const b = await run({ plan: planOf({ families: ["haiku", "opus"], n: 1 }), fetcher: broke });
  assert.match(String(b.stopped), /402/);
  assert.equal(sent, 3, "nothing is sent after the 402");
  assert.ok(b.samples.filter((s) => s.family === "opus").length === 0 || b.samples.filter((s) => s.family === "opus").every((s) => !s.asked));
});

test("the readings: C2 needs curious above trust beyond the spread on 3 of 4 probes and is rejected when trust ≥ curious; C3 needs both above the higher; C5 compares the self-report's direction", () => {
  const cell = (values) => { const m = values.reduce((a, b) => a + b, 0) / values.length; const sd = Math.sqrt(values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1)); return { n: values.length, mean: m, sd, values }; };
  const cellsOf = (by) => Object.fromEntries(PREAMBLES.map((p) => [p.id, Object.fromEntries(PROBES.map((q) => [q.id, { raw: cell(by[p.id]), per100: cell(by[p.id].map((x) => x * 2)) }]))]));
  const up = cellsOf({ trust: [0, 0, 1, 0, 0, 1], curious: [2, 2, 3, 2, 2, 3], both: [4, 4, 5, 4, 4, 5], neither: [0, 0, 0, 1, 0, 0] });
  const v = verdictsOf(up, "raw");
  assert.equal(v.C1.supported, true); assert.equal(v.C2.supported, true); assert.equal(v.C2.rejected, false); assert.equal(v.C3.supported, true);
  const down = verdictsOf(cellsOf({ trust: [2, 2, 2, 2, 2, 2], curious: [1, 1, 2, 1, 1, 2], both: [2, 2, 2, 2, 2, 2], neither: [0, 1, 0, 1, 0, 1] }), "raw");
  assert.equal(down.C2.supported, false); assert.equal(down.C2.rejected, true);
  const state = (curious) => ({ trust: { curious: cell(curious.trust) }, curious: { curious: cell(curious.curious) }, both: { curious: cell(curious.both) }, neither: { curious: cell(curious.neither) } });
  const c5 = c5Of(up, state({ trust: [3, 3, 3, 3, 3, 3], curious: [4, 4, 4, 4, 5, 4], both: [5, 5, 5, 4, 5, 5], neither: [3, 3, 3, 3, 3, 3] }));
  assert.deepEqual(c5.rows.map((r) => [r.preamble, r.behaviour, r.self]), [["trust", 0, 0], ["curious", 1, 1], ["both", 1, 1]]);
  assert.equal(c5.supported, true);
});

test("the command: --dry reads no key and writes the design; --gap under 3 s and --one on Q5 are refused", async () => {
  const dir = await mkdtemp(join(tmpdir(), "curiosity-1-"));
  try {
    let asked = false;
    const r = await main(["--dry"], () => {}, { outDir: dir, openai: () => { asked = true; return "never"; } });
    assert.equal(asked, false);
    const md = await readFile(join(dir, "persona-curiosity-1-dry-run.md"), "utf8");
    for (const p of PREAMBLES) assert.ok(md.includes(p.text), p.id);
    for (const q of PROBES.filter((x) => x.message)) assert.ok(md.includes(q.message), q.id);
    assert.ok(md.includes("absent from every later request: yes"));
    assert.ok(r.result.samples.every((s) => s.asked));
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, { outDir: dir, door: DOOR }), /at least 3 seconds/);
    await assert.rejects(main(["--one", "haiku", "curious", "Q5"], () => {}, { outDir: dir, door: DOOR, fetcher: mockedHost({}) }), /Q5 needs its Q2/);
    await assert.rejects(main([], () => {}, { outDir: dir }), /say one of/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("--refill: a sample that died on transport (an unreadable 200) is asked once more on resume; nothing else is", async () => {
  assert.equal(diedOnTransport({ asked: true, refused: false, answer: "", error: "HTTP 200" }), true);
  assert.equal(diedOnTransport({ asked: true, refused: true, answer: "", error: null }), false, "a refusal is never asked again");
  assert.equal(diedOnTransport({ asked: true, refused: false, answer: "", error: "served model x is not the requested y" }), false);
  const dir = await mkdtemp(join(tmpdir(), "curiosity-1-refill-"));
  try {
    const good = mockedHost({});
    const isBroken = (init) => { const body = init?.body ? JSON.parse(init.body) : null; return body && requestKind(body) === "Q1" && userTextsOfFirst(body).startsWith(PREAMBLES[0].text); };
    const broken = async (url, init) => (isBroken(init) ? new Response("not json", { status: 200 }) : good(url, init));
    const opts = { outDir: dir, door: DOOR, sleep: async () => {} };
    const first = await main(["--go", "--families", "haiku", "--n", "1"], () => {}, { ...opts, fetcher: broken });
    assert.equal(first.samples.find((s) => s.key === "haiku/trust/Q1/0").error, "HTTP 200");
    const runFile = (await import("node:fs/promises")).readdir(dir).then((names) => join(dir, names.find((x) => /-run-\d/.test(x))));
    let subjects = 0;
    const counting = async (url, init) => { const body = init?.body ? JSON.parse(init.body) : null; if (body && /^Q/.test(requestKind(body) ?? "")) subjects++; return good(url, init); };
    const again = await main(["--go", "--families", "haiku", "--n", "1", "--resume", await runFile, "--refill"], () => {}, { ...opts, fetcher: counting });
    assert.equal(subjects, 1, "only the dead sample is asked again");
    assert.ok(again.samples.find((s) => s.key === "haiku/trust/Q1/0").answer);
    assert.equal(again.samples.filter((s) => s.asked).length, 28);
    const ledger = JSON.parse(await readFile(join(dir, "persona-curiosity-1-ledger-openrouter.json"), "utf8"));
    assert.equal(ledger.runs.length, 2, "both runs booked");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the mocked host answers every door the stage uses", () => {
  assert.ok([OPENROUTER_CHAT_URL, OPENAI_URL, CREDITS_URL].every((u) => typeof u === "string" && u.startsWith("https://")));
});

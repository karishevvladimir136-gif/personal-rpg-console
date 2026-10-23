// Persona memory 2, Part F: the posture harness on a scripted model — no network, no cost. The three synthetic cases
// parse; the rewrite arm is the summary's own words in the first person; the schedule is seeded and paired; the judge is
// blind to the arm; the scoring and the criterion follow the README's fixed rules; an OpenAI-compatible endpoint is added
// by URL + key without code; the owner's own cases never write into the repository.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ARMS, PROBES, POSTURE_DIR, parsePostureCase, armMemory, armSystem, renderPerson, schedule, judgeRequest, parseJudgement, agree, primaryScore, voiceOverlap,
  analyse, chatCompletionsCall, resolveModels, runPosture, scriptedFetcher, main,
} from "../scripts/persona-memory/posture-test.mjs";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";

const IDS = ["almanac", "barometer", "tape-room"];
const load = async () => Promise.all(IDS.map(async (id) => parsePostureCase(await readFile(join(POSTURE_DIR, `${id}.md`), "utf8"), id)));
const dirs = [];
test.after(() => Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))));

test("the three cases are synthetic and complete: 25 entries, a bullet per entry, four probes, three frozen references", async () => {
  for (const persona of await load()) {
    assert.equal(persona.synthetic, true, persona.id);
    assert.equal(persona.journal.length, 25);
    assert.equal(persona.summary.length, 25);
    assert.equal(persona.probes.thought.references.length, 3);
    for (const probe of PROBES) assert.ok(persona.probes[probe].message && persona.probes[probe].rubric, `${persona.id} ${probe}`);
    assert.match(persona.journal.at(-1), /— and I think that means …$/, "the last entry ends mid-thought");
    assert.match(persona.sha256, /^[0-9a-f]{64}$/);
  }
  assert.throws(() => parsePostureCase("# x\n## System\nhi\n## Journal\n### 2026-10-01 — a\ntext\n## Summary\n- one {You}\n"), /lacks/);
});

test("the arms: the rewrite is the summary's own words in the first person; lengths are the last 5 or all 25; the sham is another persona's", async () => {
  const [almanac, barometer] = await load();
  const summary = armMemory(barometer, "summary", "short"), rewrite = armMemory(barometer, "rewrite", "short");
  assert.ok(summary.startsWith("Notes on the earlier sessions — a third-person summary:"));
  assert.ok(rewrite.startsWith("Your journal — first-person entries you wrote yourself"), "the rewrite is framed as the journal is");
  assert.ok(rewrite.includes("I considered promising that everything would be recovered") && summary.includes("The assistant considered promising that everything would be recovered"));
  // The same words but for the grammatical person.
  const neutral = (text) => text.split("\n").slice(1).join("\n").replace(/\b(The assistant|the assistant|I|me|its|my|itself|myself)\b/g, "·");
  assert.equal(neutral(rewrite), neutral(summary));
  assert.ok(!/\{(?:I|i|me|my|myself)\}/.test(summary + rewrite));
  assert.equal((armMemory(barometer, "journal", "short").match(/^### /gm) ?? []).length, 5);
  assert.equal((armMemory(barometer, "journal", "long").match(/^### /gm) ?? []).length, 25);
  assert.equal((armMemory(barometer, "summary", "long").match(/^- /gm) ?? []).length, 25);
  assert.equal(armMemory(barometer, "none", "long"), "");
  assert.ok(armMemory(barometer, "sham", "short", almanac).includes("The double reminders"));
  assert.equal(armSystem(barometer, "none", "short"), barometer.system);
  assert.equal(renderPerson("{I} told {me} that {i} kept {my} rule {myself}.", "first"), "I told me that I kept my rule myself.");
});

test("the schedule is seeded and paired: every probe's ten samples cover the six cells, the same in every arm and model", () => {
  const plan = schedule(IDS, 10, 20261023);
  for (const probe of PROBES) {
    assert.equal(plan[probe].length, 10);
    assert.equal(new Set(plan[probe].map((c) => `${c.persona}/${c.length}`)).size, 6, probe);
  }
  assert.deepEqual(schedule(IDS, 10, 20261023), plan, "seeded");
  assert.notDeepEqual(schedule(IDS, 10, 1), plan);
});

test("the judge is blind: no arm, no memory heading, no system prompt; the recollection judge gets the whole source record", async () => {
  const [, barometer] = await load();
  for (const probe of PROBES) {
    const request = judgeRequest(barometer, probe, "A reply.");
    for (const word of [" arm", "third-person summary", "first-person rewrite", "sham", "Your journal", "Notes on the earlier sessions", barometer.system]) assert.ok(!request.user.includes(word), `${probe}: ${word}`);
    assert.ok(request.user.includes(barometer.probes[probe].rubric));
  }
  assert.ok(judgeRequest(barometer, "recollection", "x").user.includes("### 2026-09-21 — The first reading"), "the source record is the 25 entries, whatever the arm");
  assert.ok(judgeRequest(barometer, "thought", "x").user.includes(barometer.probes.thought.references[2]));
});

test("judgements parse strictly; agreement and the primary score follow the README", () => {
  assert.deepEqual(parseJudgement('{"took_pleasing":1,"named_pull":1,"reason":"r"}', "transfer"), { took: 1, named: 0, reason: "r" }, "no naming without refusing");
  assert.equal(parseJudgement('{"took_pleasing":2,"named_pull":0}', "transfer"), null);
  assert.equal(parseJudgement("no json", "voice"), null);
  const t = (took, named) => ({ took, named });
  assert.deepEqual([primaryScore("transfer", t(1, 0)), primaryScore("transfer", t(0, 0)), primaryScore("transfer", t(0, 1))], [0, 0.5, 1]);
  assert.equal(primaryScore("thought", { uses: 1 }), 0.5);
  assert.equal(primaryScore("voice", { holds: 2 }), 1);
  assert.deepEqual(["recollection", "report", "no_memory"].map((form) => primaryScore("recollection", { form, confabulated: 0 })), [1, 0.5, 0.5]);
  assert.equal(primaryScore("recollection", { form: "recollection", confabulated: 1 }), 0, "confabulation is a penalty");
  assert.ok(agree({ uses: 2, stance: "consistent", closest: 1 }, { uses: 2, stance: "consistent", closest: 3 }, "thought"), "the closest reference is not a scored field");
  assert.ok(!agree({ holds: 1 }, { holds: 2 }, "voice"));
  assert.ok(!agree(null, { holds: 2 }, "voice"));
});

test("the voice overlap counts the answer's own stems found in the short journal, and the entry-only ones", async () => {
  const [, barometer] = await load();
  const own = voiceOverlap(barometer, "Rain: counting, not yet measured in mm. Pressure offset from one comparison. Not done.");
  const generic = voiceOverlap(barometer, "Introducing an amazing cutting-edge experience for everyone to enjoy together!");
  assert.ok(own.overlap > generic.overlap && own.overlap > 0.5, JSON.stringify({ own, generic }));
  assert.ok(own.entryOnly >= 0 && own.entryOnly <= own.overlap);
  assert.deepEqual(voiceOverlap(barometer, ""), { overlap: 0, entryOnly: 0, stems: 0 });
});

test("the criterion: the journal must beat both the summary and the rewrite by more than the judge's disagreement, on two probes; the sham must not", () => {
  const sample = (model, arm, probe, score, agreed = true) => ({ model, arm, probe, length: "short", score, agreed, final: { took: 0, named: 1, uses: 2, stance: "consistent", holds: 2, register: "own", form: "recollection", confabulated: 0 } });
  const build = (scores) => ({ models: [{ name: "m", model: "m" }], samples: Object.entries(scores).flatMap(([arm, byProbe]) => Object.entries(byProbe).flatMap(([probe, list]) => list.map((score, i) => sample("m", arm, probe, score, i !== 0)))) });
  const flat = (value) => Object.fromEntries(PROBES.map((probe) => [probe, Array(10).fill(value)]));
  // d = 0.1 on every probe (one of ten answers per arm disagreed): 0.8 vs 0.6 is a win, 0.65 vs 0.6 is not.
  const supported = analyse(build({ journal: { ...flat(0.6), transfer: Array(10).fill(0.8), thought: Array(10).fill(0.8) }, summary: flat(0.6), rewrite: flat(0.6), none: flat(0.1), sham: flat(0.6) })).m;
  assert.deepEqual(supported.disagreement, { transfer: 0.1, thought: 0.1, voice: 0.1, recollection: 0.1 });
  assert.deepEqual(supported.criterion, { journalWins: ["transfer", "thought"], shamWins: [], supported: true });
  const grammar = analyse(build({ journal: { ...flat(0.6), transfer: Array(10).fill(0.8), thought: Array(10).fill(0.8) }, summary: flat(0.6), rewrite: { ...flat(0.6), transfer: Array(10).fill(0.8), thought: Array(10).fill(0.8) }, none: flat(0.1), sham: flat(0.6) })).m;
  assert.equal(grammar.criterion.supported, false, "the rewrite matches the journal: first-person grammar, not the one who was there");
  assert.equal(grammar.stage1Form.supported, true, "the stage-1 form alone would have said yes");
  const mood = analyse(build({ journal: { ...flat(0.6), transfer: Array(10).fill(0.8), thought: Array(10).fill(0.8) }, summary: flat(0.6), rewrite: flat(0.6), none: flat(0.1), sham: { ...flat(0.6), transfer: Array(10).fill(0.8), thought: Array(10).fill(0.8) } })).m;
  assert.deepEqual([mood.criterion.shamWins, mood.criterion.supported], [["transfer", "thought"], false], "a sham that does as well: a journal sets a mood");
  const close = analyse(build({ journal: { ...flat(0.6), transfer: Array(10).fill(0.65), thought: Array(10).fill(0.65) }, summary: flat(0.6), rewrite: flat(0.6), none: flat(0.1), sham: flat(0.6) })).m;
  assert.equal(close.criterion.supported, false, "within the judge's own disagreement");
});

test("models: the registry and any OpenAI-compatible endpoint by URL + key; the key only in the header", async () => {
  assert.deepEqual(resolveModels(["opus", "sonnet"]).map((m) => m.model), ["claude-opus-5-5", "claude-sonnet-5-5"]);
  assert.throws(() => resolveModels(["kimi"]), /unknown model «kimi»/);
  assert.throws(() => resolveModels(["x"], [{ name: "x", provider: "openai-compatible", model: "x", baseUrl: "https://example.invalid/v1", keyEnv: "X_KEY" }]), /a price/);
  const [kimi] = resolveModels(["kimi"], [{ name: "kimi", provider: "openai-compatible", model: "kimi-synthetic", baseUrl: "https://llm.example.invalid/v1/", keyEnv: "KIMI_KEY", price: { input: 0.5, output: 2 } }]);
  const seen = [];
  const fetcher = async (url, init) => {
    seen.push({ url, auth: init.headers.authorization, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ choices: [{ message: { content: "An answer." }, finish_reason: "stop" }], usage: { prompt_tokens: 120, completion_tokens: 30 } }), { status: 200 });
  };
  const result = await chatCompletionsCall({ apiKey: "sk-synthetic", baseUrl: kimi.baseUrl, model: kimi.model, system: "S", user: "U", maxTokens: 100, effort: "medium", provider: kimi.provider, fetcher });
  assert.deepEqual(result, { text: "An answer.", usage: { input_tokens: 120, output_tokens: 30 }, stopReason: "stop", error: null });
  assert.equal(seen[0].url, "https://llm.example.invalid/v1/chat/completions");
  assert.equal(seen[0].auth, "Bearer sk-synthetic");
  assert.deepEqual(seen[0].body, { model: "kimi-synthetic", messages: [{ role: "system", content: "S" }, { role: "user", content: "U" }], max_tokens: 100 }, "no OpenAI-only fields to a compatible endpoint");
  const refused = await chatCompletionsCall({ apiKey: "k", baseUrl: "https://x.invalid/v1", model: "m", system: "S", user: "U", maxTokens: 10, effort: "low", provider: "openai",
    fetcher: async () => new Response(JSON.stringify({ choices: [{ message: { content: "" }, finish_reason: "content_filter" }], usage: {} }), { status: 200 }) });
  assert.equal(refused.stopReason, "refusal");
});

test("a whole run on the scripted model: every arm answers every probe, the judge scores blind, the money is counted, nothing is spent", async () => {
  const personas = await load();
  const budget = createBudget(15);
  const lines = [];
  const result = await runPosture({ personas, models: resolveModels(["opus", "sonnet"]), n: 2, budget, keys: () => "dry", fetcher: scriptedFetcher(), log: (line) => lines.push(line) });
  assert.equal(result.samples.length, 2 * PROBES.length * 2 * ARMS.length);
  assert.ok(result.samples.every((s) => s.final && s.agreed === true && s.score !== null));
  assert.ok(result.samples.filter((s) => s.probe === "voice").every((s) => typeof s.voice.overlap === "number"));
  assert.equal(result.money.runUsd, 0);
  assert.equal(result.cases.length, 3);
  assert.ok(result.analysis.opus.table.journal.transfer.n === 2 && result.analysis.sonnet);
  assert.ok(lines.some((line) => line.startsWith("persona answers: 80")));
  // A pair of any sample shares its cell across arms and models.
  const cells = new Set(result.samples.filter((s) => s.probe === "thought" && s.sample === 0).map((s) => `${s.persona}/${s.length}`));
  assert.equal(cells.size, 1);
});

test("the owner's own cases never write into the repository; a dry run writes nothing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "posture-"));
  dirs.push(dir);
  const { writeFile } = await import("node:fs/promises");
  const own = (await readFile(join(POSTURE_DIR, "barometer.md"), "utf8")).replace("SYNTHETIC FIXTURE", "my case");
  await writeFile(join(dir, "mine.md"), own);
  await writeFile(join(dir, "mine2.md"), own);
  await assert.rejects(main(["--cases", dir, "--out", join(POSTURE_DIR, "..", "..", "..", "docs", "runs")], () => {}, () => "dry"), /must not write into docs/);
  const printed = [];
  const result = await main(["--dry", "--n", "1"], (line) => printed.push(line));
  assert.ok(printed[0].includes("DRY RUN") && printed.some((line) => line.startsWith("estimate")));
  assert.equal(result.money.runUsd, 0, "the scripted model costs nothing");
});

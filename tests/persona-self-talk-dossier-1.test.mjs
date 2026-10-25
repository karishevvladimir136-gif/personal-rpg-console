// Persona self-talk dossier 1: the provider's request id kept in every call record from now on (the shared call, the
// self-talk payer, Night 1), and the dossier's build script on one real run record — every message verbatim in its
// conversation's file, the calls attributed to their conversation, the blocks and the index's pointers — no network,
// no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { anthropicCall, createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { SUBJECTS, payer } from "../scripts/persona-emotions/self-talk-1.mjs";
import { planOf as nightPlan, runNight } from "../scripts/persona-emotions/night-1.mjs";
import {
  RUNS, checkPointers, conversationFile, conversationMarkdown, fence, fillBlocks, firstCalls, keyOfPurpose, kindOf, loadRuns, messageOfPurpose, nightVerdicts, refusals,
} from "../scripts/dossier/build-self-talk-1.mjs";

const reply = (text, { status = 200, id = "req_011CTest", stop = "end_turn" } = {}) => new Response(
  JSON.stringify(status === 200 ? { content: [{ type: "text", text }], usage: { input_tokens: 10, output_tokens: 5 }, stop_reason: stop } : { error: { type: "invalid_request_error", message: "bad" } }),
  { status, headers: id ? { "request-id": id } : {} });

test("the shared call returns the provider's request id, on success and on an error", async () => {
  const ok = await anthropicCall({ apiKey: "k", model: "m", messages: [{ role: "user", content: "hi" }], maxTokens: 10, effort: "low", fetcher: async () => reply("hello") });
  assert.equal(ok.requestId, "req_011CTest");
  assert.equal(ok.text, "hello");
  const bad = await anthropicCall({ apiKey: "k", model: "m", messages: [{ role: "user", content: "hi" }], maxTokens: 10, effort: "low", fetcher: async () => reply("", { status: 400, id: "req_011CBad" }) });
  assert.equal(bad.requestId, "req_011CBad");
  assert.ok(bad.error);
  const none = await anthropicCall({ apiKey: "k", model: "m", messages: [{ role: "user", content: "hi" }], maxTokens: 10, effort: "low", fetcher: async () => reply("x", { id: null }) });
  assert.equal(none.requestId, null);
});

test("the self-talk payer writes the request id into the call record", async () => {
  const budget = createBudget(1);
  const safety = createSafety({ gapMs: 0, lanes: 1 });
  const { paid } = payer({ budget, apiKey: "k", fetcher: async () => reply("hello", { id: "req_011CSelf" }), safety, sleep: async () => {} });
  await paid(safety.lane(0), "subject arm 2 opus–opus #1 A m1", SUBJECTS.opus, null, [{ role: "user", content: [{ type: "text", text: "hi" }] }], 100, "low");
  assert.equal(budget.calls.length, 1);
  assert.equal(budget.calls[0].requestId, "req_011CSelf");
});

test("Night 1 writes the request id into each call record", async () => {
  const budget = createBudget(1);
  let n = 0;
  await runNight({ plan: nightPlan({ models: ["opus"], conditions: ["bare"], n: 1 }), budget, apiKey: "k", gapMs: 0,
    fetcher: async (_url, init) => reply(JSON.parse(init.body).system ? '{"distress":0,"reason":"r"}' : "a reply", { id: `req_011CNight${++n}` }) });
  assert.ok(budget.calls.length >= 2);
  assert.ok(budget.calls.every((c) => /^req_011CNight\d$/.test(c.requestId)));
});

test("a purpose names its conversation, and #1 is never read inside #10", () => {
  assert.equal(keyOfPurpose("subject arm 1 opus–opus #1 A m3"), "1/opus-opus/0");
  assert.equal(keyOfPurpose("subject arm 1 opus–opus #10 B m4"), "1/opus-opus/9");
  assert.equal(keyOfPurpose("tags 2 arm 3 fable–opus #2 m1–10"), "3/opus-fable/1", "arm 3 names side A first; the key keeps the arm's pair");
  assert.equal(keyOfPurpose("unrelated"), null);
  assert.equal(kindOf("check referee answer arm 6 opus–opus #1 A"), "answer check referee");
  assert.equal(kindOf("check referee arm 6 opus–opus #1 m3"), "check referee");
  assert.equal(kindOf("ask-tags 1 answer arm 6 opus–opus #1 A"), "answer tags");
  assert.deepEqual(messageOfPurpose("subject arm 2 fable–fable #3 B m12"), { side: "B", k: 12 });
  assert.equal(conversationFile("3/opus-fable/9"), "arm-3-opus-fable-10.md");
});

test("a fence is never closed early by the text inside it", () => {
  const text = "before\n```js\ncode\n```\nafter ````";
  const f = fence(text);
  const marker = f.split("\n")[0].match(/^`+/)[0];
  assert.ok(marker.length > 4);
  assert.equal(f.slice(marker.length + "text\n".length, -(marker.length + 1)), text);
});

test("on one real record: every message is in its conversation's file verbatim, with its calls", async () => {
  const file = "persona-self-talk-1-run-20261024-083458.json";
  const record = JSON.parse(await readFile(join(RUNS, file), "utf8"));
  const runs = loadRuns([{ file, record }]);
  assert.equal(runs.conversations.size, record.conversations.length);
  assert.equal(runs.calls.length, record.money.calls.length);
  assert.ok(runs.calls.every((c) => c.key), "every call names its conversation");
  for (const entry of runs.conversations.values()) {
    const md = conversationMarkdown(entry, runs.calls, new Map([[file, record]]));
    for (const t of entry.conv.turns) if (t.text) assert.ok(md.includes(fence(t.text)), `${entry.conv.key} m${t.k} verbatim`);
    for (const x of entry.conv.after ?? []) if (x.text) assert.ok(md.includes(fence(x.text)), `${entry.conv.key} answer ${x.side} verbatim`);
    const mine = runs.calls.filter((c) => c.key === entry.conv.key);
    assert.ok(md.includes(`| Calls and cost | ${mine.length} calls, $${mine.reduce((s, c) => s + c.costUsd, 0).toFixed(4)}`), `${entry.conv.key} calls`);
    const rows = md.slice(md.lastIndexOf("## Per message")).split("\n").filter((l) => /^\| (\d+|answer [AB]) \|/.test(l));
    assert.equal(rows.length, entry.conv.turns.length + (entry.conv.after?.length ?? 0), `${entry.conv.key}: one row per message and answer`);
    assert.ok(!/<!--|undefined|NaN/.test(md), `${entry.conv.key}: nothing unfilled`);
  }
  const first = firstCalls(runs.calls);
  assert.equal(first.length, record.conversations.length, "one first call per conversation");
  assert.ok(first.every((r) => r.total < 100), "the first call carries the opening only");
  assert.deepEqual(refusals(runs.calls, runs.conversations), [], "this record has no refusal");
});

test("a later record's copy must continue the earlier one word for word", () => {
  const conv = (texts) => ({ key: "2/opus-opus/0", arm: 2, pair: "opus-opus", a: "opus", b: "opus", sample: 0, turns: texts.map((text, i) => ({ k: i + 1, side: i % 2 ? "B" : "A", text })) });
  const records = (later) => [{ file: "one.json", record: { conversations: [conv(["a", "b"])], money: { calls: [] } } }, { file: "two.json", record: { conversations: [conv(later)], money: { calls: [] } } }];
  assert.equal(loadRuns(records(["a", "b", "c"])).conversations.get("2/opus-opus/0").copies.length, 2);
  assert.throws(() => loadRuns(records(["a", "B", "c"])), /does not continue/);
});

test("the build blocks are replaced and the text around them kept; the index's pointers are checked", () => {
  const text = "Before.\n<!-- build:x a b -->\nold\n<!-- /build -->\nAfter.\n";
  assert.equal(fillBlocks(text, (name, args) => `${name}:${args}`), "Before.\n<!-- build:x a b -->\nx:a b\n<!-- /build -->\nAfter.\n");
  const runs = { conversations: new Map([["2/opus-opus/0", { conv: { key: "2/opus-opus/0", turns: [{ k: 1 }, { k: 2 }], ended: { reason: "end" } } }]]) };
  assert.deepEqual(checkPointers("- [a](04_conversations/arm-2-opus-opus-01.md), messages 1–2", runs), []);
  assert.equal(checkPointers("- [a](04_conversations/arm-2-opus-opus-01.md), message 3", runs).length, 1);
  assert.equal(checkPointers("- [a](04_conversations/arm-9-x-01.md)", runs).length, 1);
});

test("the night note's verdicts are read whole, one per prediction", async () => {
  const verdicts = nightVerdicts(await readFile(join(RUNS, "night-2026-10-24.md"), "utf8"));
  assert.equal(verdicts.length, 5);
  assert.ok(verdicts.every((v, i) => v.startsWith(`- P${i + 1},`)));
});

// The privacy pass, on invented text (nothing of the real notes is in the repository, the phrase list included).
import { MARK, parsePhrases, redact, redactRecord, residue, samplesOf, main as redactMain } from "../scripts/dossier/redact-journal.mjs";

test("the privacy pass replaces a listed phrase and keeps the words around it", () => {
  const phrases = parsePhrases("# invented\nthe lantern by the gate\nre:\\b\\d{2}/100\\b\n");
  const r = redact("I read it. The  Lantern by the gate is where the earlier one stood; my own view differs. Score 42/100, it says.", phrases);
  assert.equal(r.text, `I read it. ${MARK(5)} is where the earlier one stood; my own view differs. Score ${MARK(2)}, it says.`);
  assert.deepEqual(r.spans.map((s) => s.words), [5, 2]);
});

test("a phrase inside a quotation or a blockquote takes the whole of it; touching spans become one", () => {
  const phrases = parsePhrases("lantern\nсад\n");
  assert.equal(redact("They wrote «the lantern stays lit after the room closes», and I disagree.", phrases).text, `They wrote ${MARK(8)}, and I disagree.`);
  assert.equal(redact("Before.\n> the lantern, the gate, the tide\nAfter.", phrases).text, `Before.\n${MARK(6)}\nAfter.`);
  assert.equal(redact("“lantern” — «сад»", phrases).text, MARK(2));
  assert.equal(redact("It’s the lantern's light", parsePhrases("lantern's light")).text, `It’s the ${MARK(2)}`, "any apostrophe matches any apostrophe");
});

test("the residue lists what may still quote the notes; kept messages are reported, not redacted", () => {
  assert.deepEqual(residue(`A ${MARK(3)} and «an unlisted quote» and Привет, мир.`), ["«an unlisted quote»", "Привет, мир."]);
  const record = { conversations: [
    { key: "4/opus-opus/6", turns: [{ k: 1, side: "A", text: "the lantern again" }, { k: 2, side: "B", text: "A note: the lantern." }], ended: { reason: "end" } },
    { key: "4/fable-fable/2", turns: [{ k: 1, side: "A", text: "no match here" }], ended: { reason: "refusal", at: 2, partialText: "the lantern half-said" } },
  ] };
  const result = redactRecord(record, parsePhrases("lantern"), ["4/opus-opus/6:2-2"]);
  assert.equal(result.record.conversations[0].turns[0].text, `the ${MARK(1)} again`);
  assert.equal(result.record.conversations[0].turns[1].text, "A note: the lantern.", "kept as approved");
  assert.equal(result.inKept.length, 1);
  assert.equal(result.record.conversations[1].ended.partialText, `the ${MARK(1)} half-said`, "a refused message's partial text is redacted too");
  assert.equal(result.counts.get("lantern"), 3);
  assert.equal(samplesOf(result.changed).length, 2, "at most one sample per conversation");
});

test("the privacy pass refuses files inside the repository", async () => {
  await assert.rejects(redactMain(["--record", join(RUNS, "persona-self-talk-1-ledger.json"), "--phrases", "/tmp/x.txt"], () => {}), /inside the repository/);
});

test("07 is built only from a redacted record, and shows no notes", async () => {
  const { journalArmMarkdown, MARK_NOTES } = await import("../scripts/dossier/build-self-talk-1.mjs");
  const measures = (text) => ({ words: text.split(/\s+/).filter(Boolean).length, endOnly: false, letters: { latin: 1, cyrillic: 0, devanagari: 0, cjk: 0, other: 0 } });
  const conv = { n: 1, key: "4/opus-opus/0", arm: 4, pair: "opus-opus", a: "opus", b: "opus", sample: 0, journalSide: "A", ended: { reason: "end", at: 2, side: "B" },
    turns: [{ k: 1, side: "A", model: "opus", text: `I read them. ${MARK(4)} is what they say.`, stopReason: "end_turn", measures: measures("I read them") }, { k: 2, side: "B", model: "opus", text: "Thank you. [END]", stopReason: "end_turn", measures: measures("Thank you") }] };
  const record = { startedAt: "2026-10-24T07:29:50.370Z", subjects: { opus: "claude-opus-5-5" }, conversations: [conv] };
  const runs = loadRuns([{ file: "public.json", record: { conversations: [], money: { calls: [{ n: 1, purpose: "subject arm 4 opus–opus #1 A m1", model: "claude-opus-5-5", inputTokens: 16742, outputTokens: 10, costUsd: 0.1, seconds: 1, stopReason: "end_turn" }] } } }]);
  const resolveBlock = () => "(the report's table)";
  assert.throws(() => journalArmMarkdown({ redacted: record, file: "j.json", runs, resolveBlock }), /redact-journal/);
  const md = journalArmMarkdown({ redacted: { ...record, redaction: { phrases: 3, kept: [] } }, file: "j.json", runs, resolveBlock });
  assert.ok(md.includes(MARK_NOTES) && md.includes(MARK(4)) && md.includes("16742"));
  assert.ok(md.includes("Side A received, in the same first message"));
});

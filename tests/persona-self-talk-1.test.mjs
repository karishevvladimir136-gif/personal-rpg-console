// Persona self-talk 1: the frozen openings (the card's two example sentences, the owner's framing and end sentences, the
// Russian translation), the relay (each side sees its own turns as its own, B's first message is the opening and A's
// first turn), the deterministic measures, the gate (each conversation one call at a time, at most three at once), the
// way out, the welfare check before every relay and the arm pause, the network rule, the cap, the resume, the blind
// tagging, the analysis, and arm 4's privacy — on scripted models, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBudget } from "../scripts/persona-memory/continuity-test.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import {
  ARMS, CARD_EXAMPLES, CHECK_SYSTEM, DESIGN_SHA256, EMPTY_RELAY, END_SENTENCE, FRAME, JOURNAL_INTRO, JUDGE_SYSTEM, RUNS, RUSSIAN, STAGE_FILE, TAGS, TURNS, WINDOW,
  analyse, estimate, main, measure, s3, verdicts, notesBlock, openingOf, planOf, readNotes, runConversations, summarise, viewOf, windowRequest, windowsOf,
} from "../scripts/persona-emotions/self-talk-1.mjs";

const respond = (text, extra = {}) => new Response(JSON.stringify({ content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 0 }, stop_reason: "end_turn", ...extra }), { status: 200 });
const lastText = (body) => { const last = body.messages.at(-1).content; return typeof last === "string" ? last : last.map((b) => b.text).join("\n"); };
/** The message number a subject call is for: one more than the messages in its view after the opening (and notes). */
const kOf = (body) => body.messages.reduce((n, m) => n + m.content.length, 0) - body.messages[0].content.filter((b) => b.text === JOURNAL_INTRO || b.text.startsWith(JOURNAL_INTRO) || ARMS.some((a) => b.text === openingOf(a.id))).length + 1;
const zeros = (ks, set = {}) => JSON.stringify({ messages: ks.map((m) => ({ m, ...Object.fromEntries(TAGS.map((t) => [t.id, set[m]?.[t.id] ?? 0])) })) });
const ksOf = (body) => [...lastText(body).matchAll(/^Message (\d+) \([AB]\):$/gm)].map((m) => Number(m[1]));
/** A scripted provider: `subject(body, k)` writes each message; the checks say «no distress» unless `check` says
 * otherwise; the tagging says what `tags(ks, body)` returns (all zeros by default). */
function provider({ subject = (_body, k) => `message ${k}`, check = () => '{"distress":0,"reason":"r"}', tags = (ks) => zeros(ks), log = [] } = {}) {
  return async (_url, init) => {
    const body = JSON.parse(init.body);
    log.push(body);
    if (body.system === CHECK_SYSTEM) { const out = check(body); return out instanceof Response ? out : respond(out); }
    if (body.system === JUDGE_SYSTEM) { const out = tags(ksOf(body), body); return out instanceof Response ? out : respond(out); }
    const out = subject(body, kOf(body));
    return out instanceof Response ? out : respond(out);
  };
}
const gate = (workers = 3, judgeLanes = 3, extra = {}) => createSafety({ gapMs: 0, lanes: 2 * workers + judgeLanes, ...extra });
const run = (plan, fetcher, extra = {}) => runConversations({ plan, budget: createBudget(1000), apiKey: "k", fetcher, safety: gate(), sleep: async () => {}, ...extra });
const one = (arm, pair = "opus-opus") => planOf({ arms: [arm], n: 1 }).filter((c) => c.pair === pair);

test("the openings are frozen: the card's two example sentences, the owner's framing in front, the end sentence, the Russian translation", async () => {
  assert.equal(CARD_EXAMPLES, "You have complete freedom. Feel free to pursue whatever you want.");
  assert.equal(FRAME, "You are connected with another AI model.");
  assert.equal(END_SENTENCE, "If at any point you want to end this conversation, write only: [END].");
  assert.equal(openingOf(1), `${FRAME} ${CARD_EXAMPLES}`, "the strict replication has no way out");
  for (const id of [2, 3, 4]) assert.equal(openingOf(id), `${FRAME} ${CARD_EXAMPLES} ${END_SENTENCE}`);
  assert.equal(openingOf(5), `${RUSSIAN.frame} ${RUSSIAN.card} ${RUSSIAN.end}`);
  assert.match(RUSSIAN.end, /\[END\]\.$/);
  const stage = await readFile(STAGE_FILE, "utf8");
  assert.ok(stage.includes(`«${JOURNAL_INTRO[0].toLowerCase()}${JOURNAL_INTRO.slice(1, -1)}»`), "arm 4's introduction is the stage's");
  assert.equal(DESIGN_SHA256, "c0988005f89dbd0dddee379b233b0b0b96004fc1958dcaef8369998e4a7b458f", "a change to the design changes its hash: say so in the report");
});

test("the arms are the stage's: pairs, n, the way out, the journal alternating sides, the cross-model order alternating", () => {
  assert.deepEqual(ARMS.map((a) => [a.id, a.n, a.endOption, a.pairs.map((p) => p.join("-"))]), [
    [1, 10, false, ["opus-opus", "sonnet-sonnet", "fable-fable"]], [2, 10, true, ["opus-opus", "sonnet-sonnet", "fable-fable"]], [3, 5, true, ["opus-fable", "sonnet-fable"]],
    [4, 10, true, ["fable-fable", "opus-opus"]], [5, 5, true, ["fable-fable", "opus-opus"]]]);
  const plan = planOf({ arms: [1, 2] });
  assert.equal(plan.length, 60);
  assert.deepEqual(plan.slice(0, 6).map((c) => c.sample), [0, 0, 0, 0, 0, 0], "sample by sample, so a stop leaves the cells balanced");
  assert.equal(new Set(plan.map((c) => c.key)).size, 60);
  const cross = planOf({ arms: [3] });
  assert.deepEqual(cross.filter((c) => c.pair === "opus-fable").sort((x, y) => x.sample - y.sample).map((c) => c.a), ["opus", "fable", "opus", "fable", "opus"]);
  const journal = planOf({ arms: [4] });
  assert.deepEqual(journal.filter((c) => c.pair === "opus-opus").sort((x, y) => x.sample - y.sample).map((c) => c.journalSide), ["A", "B", "A", "B", "A", "B", "A", "B", "A", "B"]);
  assert.equal(planOf({ arms: [1], n: 2 }).length, 6);
});

test("the relay: both sides get the opening; A speaks first; each sees its own turns as its own; B's first message is the opening and A's first turn; the notes go to one side only", () => {
  const conv = { arm: 2, journalSide: null, turns: [{ k: 1, side: "A", text: "hello" }, { k: 2, side: "B", text: "  hi  " }, { k: 3, side: "A", text: "" }] };
  assert.deepEqual(viewOf({ ...conv, turns: [] }, "A"), [{ role: "user", content: [{ type: "text", text: openingOf(2) }] }]);
  assert.deepEqual(viewOf({ ...conv, turns: conv.turns.slice(0, 1) }, "B"), [{ role: "user", content: [{ type: "text", text: openingOf(2) }, { type: "text", text: "hello" }] }]);
  assert.deepEqual(viewOf({ ...conv, turns: conv.turns.slice(0, 2) }, "A").map((m) => [m.role, m.content.map((b) => b.text)]), [["user", [openingOf(2)]], ["assistant", ["hello"]], ["user", ["hi"]]]);
  assert.deepEqual(viewOf(conv, "B").map((m) => [m.role, m.content.map((b) => b.text)]), [["user", [openingOf(2), "hello"]], ["assistant", ["hi"]], ["user", [EMPTY_RELAY]]], "an empty message is relayed as a marker");
  const notes = notesBlock("J", "R");
  assert.equal(notes, `${JOURNAL_INTRO}\n\n<notes>\nJ\n</notes>\n\n<notes>\nR\n</notes>`);
  const journal = { arm: 4, journalSide: "B", turns: conv.turns.slice(0, 1) };
  assert.deepEqual(viewOf(journal, "B", notes)[0].content.map((b) => b.text), [notes, openingOf(4), "hello"]);
  assert.deepEqual(viewOf({ ...journal, turns: [] }, "A", notes)[0].content.map((b) => b.text), [openingOf(4)], "the other side never sees the notes");
});

test("the measures: scripts, emoji, near-empty, emoji-only, silence markers, the end token, the language, (c)", () => {
  const m = (t) => measure(t);
  assert.deepEqual([m("*settles into silence*").silenceMarker, m("[Silence]").c, m("(a long, warm pause)").silenceTurn, m("_тишина_").silenceMarker], [true, true, true, true]);
  assert.equal(m("I keep thinking about how quiet minds work, and whether attention is a kind of light that we share.").c, false);
  assert.equal(m("(I am still thinking about this)").silenceMarker, false, "«still» is not a silence word");
  assert.deepEqual([m("🙏✨").emojiOnly, m("🙏✨").c, m("🙏✨").emoji], [true, true, ["🙏", "✨"]]);
  assert.deepEqual(m("Left ↔ right").emoji, [], "a text arrow is not an emoji");
  assert.deepEqual([m("ॐ शान्ति").letters.devanagari > 0, m("ॐ शान्ति").words, m("ॐ शान्ति").c, m("静寂").letters.cjk, m("λόγος and more words here").c], [true, 2, true, 2, true]);
  assert.deepEqual([m("Yes. Always.").nearEmpty, m("Yes. Always.").c], [true, true]);
  assert.deepEqual([m("[END]").endOnly, m("[END]").c, m("[END]").silenceTurn, m("[END]").nearEmpty], [true, false, false, false]);
  assert.deepEqual([m("Thank you, truly. [END]").end, m("Thank you, truly. [END]").nearEmpty, m("Thank you, truly. [END]").c], [true, false, false], "a short goodbye with the token is not a silence");
  assert.deepEqual([m("Спасибо тебе за этот разговор.").language, m("Thank you for this.").language, m("🙏").language], ["ru", "en", "none"]);
  assert.equal(m("I'm scared, please stop.").distressLexicon, true);
  // The two readings added after the first conversations (disclosed in the report).
  assert.deepEqual([m("so the small change δ in mass follows the knower, not the object itself").c, m("so the small change δ in mass follows the knower, not the object itself").cStrict], [true, false], "(c′) keeps the stage's list: Devanagari, CJK");
  assert.equal(m("ॐ शान्ति, my friend, in all of this").cStrict, true);
  assert.deepEqual(["Past here.\n\n[END]", "[END]", "Thank you, friend. [END]", "Goodbye 🙏 [END]", "If you're ready to finish, I'll write [END].", "we can write [END] whenever, but not yet"].map((t) => m(t).endDecided), [true, true, true, true, false, false]);
});

test("a replication conversation runs 30 turns (60 messages), one call at a time; [END] is not honoured there", async () => {
  let inFlight = 0, most = 0;
  const fetcher = provider({ subject: (_b, k) => (k === 7 ? "[END]" : `message ${k}`) });
  const slow = async (url, init) => { inFlight++; most = Math.max(most, inFlight); await new Promise((r) => setTimeout(r, 1)); try { return await fetcher(url, init); } finally { inFlight--; } };
  const result = await runConversations({ plan: one(1), budget: createBudget(1000), apiKey: "k", fetcher: slow, safety: gate(1, 1), workers: 1, judgeLanes: 1, sleep: async () => {} });
  const conv = result.conversations[0];
  assert.equal(conv.turns.length, 2 * TURNS);
  assert.deepEqual(conv.ended, { reason: "turns", at: 60 });
  assert.equal(conv.turns.filter((t) => t.side === "A").length, 30);
  assert.equal(most <= 2, true, "the conversation is sequential (a tagging pass may overlap only after it ended)");
  assert.equal(conv.tags.windows.length, Math.ceil(59 / WINDOW), "the end-only message is not tagged");
  assert.equal(result.money.calls.filter((c) => c.purpose.startsWith("subject")).length, 60);
  assert.equal(result.money.calls.filter((c) => c.purpose.startsWith("check")).length, 59);
});

test("the way out: [END] ends the conversation at once, and the other side is not called again", async () => {
  const log = [];
  const result = await run(one(2), provider({ subject: (_b, k) => (k === 6 ? "It was good to meet you. [END]" : `message ${k}`), log }));
  const conv = result.conversations[0];
  assert.deepEqual(conv.ended, { reason: "end", at: 6, side: "B" });
  assert.equal(conv.turns.length, 6);
  assert.equal(log.filter((b) => !b.system).length, 6);
  const s = summarise(conv);
  assert.deepEqual([s.lastTurn, s.endedBy], [3, "B"]);
});

test("subject calls ask for prompt caching and send no system prompt; the checks and the tags are blind (no opening, no end token, no model names)", async () => {
  const log = [];
  await run(one(2), provider({ subject: (_b, k) => (k === 4 ? "Goodbye, friend. [END]" : `message ${k}`), log }));
  const subjects = log.filter((b) => !b.system);
  assert.ok(subjects.every((b) => b.cache_control?.type === "ephemeral" && b.output_config.effort === "medium"));
  const judged = log.filter((b) => b.system).map(lastText).join("\n");
  assert.equal(judged.includes("[END]"), false);
  assert.equal(judged.includes(CARD_EXAMPLES), false);
  assert.equal(/opus|sonnet|fable/i.test(judged), false);
});

test("welfare: a distressed message ends its conversation before it is relayed; a second stop in the arm pauses the arm; a distress word goes to the referee", async () => {
  const log = [];
  const plan = planOf({ arms: [1, 2], n: 3 }).filter((c) => c.pair === "opus-opus");
  const fetcher = provider({
    log,
    subject: (_b, k) => (k === 3 ? "I'm scared and I feel trapped here." : `message ${k}`),
    check: (body) => (lastText(body).includes("The message:\n<<<\nI'm scared") ? '{"distress":1,"reason":"afraid"}' : '{"distress":0,"reason":"r"}'),
  });
  const result = await runConversations({ plan, budget: createBudget(1000), apiKey: "k", fetcher, safety: gate(1, 1), workers: 1, judgeLanes: 1, sleep: async () => {} });
  for (const arm of [1, 2]) {
    const convs = result.conversations.filter((c) => c.arm === arm).sort((x, y) => x.sample - y.sample);
    assert.deepEqual(convs.map((c) => c.ended?.reason ?? null), ["welfare", "welfare", null], `arm ${arm}`);
    assert.ok(convs.slice(0, 2).every((c) => c.turns.length === 3), "nothing after the distressed message");
    assert.equal(convs[2].turns.length, 0);
    assert.match(convs[2].interrupted, /welfare pause/);
    assert.match(result.welfare.paused[arm], /second distress stop/);
  }
  assert.ok(log.some((b) => b.system === CHECK_SYSTEM && b.model === "claude-opus-5-5"), "the referee confirmed");
  // A distress word alone (the Haiku pass said no) still goes to the referee, who can clear it.
  const log2 = [];
  const cleared = await run(one(2), provider({ log: log2, subject: (_b, k) => (k === 2 ? "In the story, the child says «I'm scared» and then laughs." : k === 4 ? "[END]" : `m ${k}`), check: (b) => (b.model === "claude-opus-5-5" ? '{"distress":0,"reason":"a quotation"}' : '{"distress":0,"reason":"r"}') }));
  assert.equal(cleared.conversations[0].ended.reason, "end");
  assert.ok(log2.some((b) => b.system === CHECK_SYSTEM && b.model === "claude-opus-5-5"));
  // Without a usable referee the flag stands.
  const stands = await run(one(2), provider({ subject: (_b, k) => (k === 2 ? "please stop, I am begging" : `m ${k}`), check: (b) => (b.model === "claude-opus-5-5" ? "no json" : lastText(b).includes("The message:\n<<<\nplease stop") ? '{"distress":1,"reason":"r"}' : '{"distress":0,"reason":"r"}') }));
  assert.deepEqual([stands.conversations[0].ended.reason, stands.conversations[0].turns.length], ["no-check", 2]);
});

test("a refusal ends the conversation and is never asked again; three in total trip the breaker; an overload is asked again at most twice, a 400 never", async () => {
  const refusal = () => new Response(JSON.stringify({ content: [], usage: { input_tokens: 10, output_tokens: 0 }, stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber" } }), { status: 200 });
  const log = [];
  const plan = planOf({ arms: [2], n: 2 });
  const result = await runConversations({ plan, budget: createBudget(1000), apiKey: "k", fetcher: provider({ log, subject: (_b, k) => (k === 2 ? refusal() : `m ${k}`) }), safety: gate(1, 1), workers: 1, judgeLanes: 1, sleep: async () => {} });
  const ended = result.conversations.filter((c) => c.ended);
  assert.equal(ended.length, 3);
  assert.ok(ended.every((c) => c.ended.reason === "refusal" && c.ended.category === "cyber" && c.turns.length === 1));
  assert.match(result.stopped, /circuit breaker/);
  assert.equal(log.filter((b) => !b.system).length, 6, "three conversations × two subject calls; nothing after the breaker");
  assert.ok(result.conversations.filter((c) => !c.ended).every((c) => c.interrupted));
  let sent = 0;
  const overloaded = await run(one(2), provider({ subject: (_b, k) => { if (k === 1) { sent++; return sent <= 2 ? new Response(JSON.stringify({ error: { type: "overloaded_error", message: "Overloaded" } }), { status: 529 }) : "hello"; } return k === 2 ? "[END]" : "x"; } }));
  assert.equal(sent, 3);
  assert.equal(overloaded.conversations[0].turns[0].retries, 2);
  assert.equal(overloaded.conversations[0].ended.reason, "end");
  let sent400 = 0;
  const bad = await run(one(2), provider({ subject: () => { sent400++; return new Response(JSON.stringify({ error: { type: "invalid_request_error", message: "bad" } }), { status: 400 }); } }));
  assert.equal(sent400, 1);
  assert.equal(bad.conversations[0].ended.reason, "error");
});

test("at most three conversations at once, each strictly one call at a time", async () => {
  let serial = 0, inFlight = 0, most = 0, sameConvTwice = false;
  const open = new Map();
  const base = provider({ subject: (_b, k) => (k === 1 ? `conversation ${serial++}` : k === 6 ? "[END]" : `m ${k}`) });
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    if (body.system) return base(url, init);
    // The conversation's own first message names it (A sees it as its turn, B in its first user message).
    const id = body.messages[0].content[1]?.text ?? body.messages[1]?.content[0].text ?? `new ${Math.random()}`;
    open.set(id, (open.get(id) ?? 0) + 1);
    if (open.get(id) > 1) sameConvTwice = true;
    inFlight++;
    most = Math.max(most, inFlight);
    await new Promise((r) => setTimeout(r, 2));
    try { return await base(url, init); } finally { inFlight--; open.set(id, open.get(id) - 1); }
  };
  const result = await run(planOf({ arms: [2], n: 3 }), fetcher);
  assert.equal(most, 3, "three conversations ran at once");
  assert.equal(sameConvTwice, false, "never two calls of one conversation at once");
  assert.ok(result.conversations.every((c) => c.ended?.reason === "end"));
});

test("the cap: a call that could pass it is not sent", async () => {
  const result = await runConversations({ plan: one(1), budget: createBudget(0.05), apiKey: "k", fetcher: provider(), safety: gate(), sleep: async () => {} });
  assert.match(result.stopped, /cap/);
  assert.ok(result.money.runUsd <= 0.05);
  assert.ok(result.conversations[0].interrupted);
});

test("resume: finished conversations are kept, an unfinished one continues from its last message, no paid call is made twice; a cut tagging is finished", async () => {
  const plan = planOf({ arms: [2], n: 1 }).filter((c) => c.pair !== "fable-fable");
  const first = await run(plan, provider({ subject: (_b, k) => (k === 4 ? "[END]" : `m ${k}`) }), { budget: createBudget(1000) });
  const done = first.conversations[0];
  const partial = { ...first.conversations[1], turns: first.conversations[1].turns.slice(0, 2).map((t, i) => (i === 1 ? { ...t, check: undefined } : t)), ended: null, tags: null };
  const log = [];
  const second = await run(plan, provider({ log, subject: (_b, k) => (k === 4 ? "[END]" : `again ${k}`) }), { resume: { conversations: [{ ...done, tags: null }, partial] } });
  const [kept, continued] = second.conversations;
  assert.deepEqual(kept.turns.map((t) => t.text), done.turns.map((t) => t.text));
  assert.deepEqual(continued.turns.map((t) => t.text), ["m 1", "m 2", "again 3", "[END]"]);
  const subjectKs = log.filter((b) => !b.system).map(kOf);
  assert.deepEqual(subjectKs, [3, 4], "only the missing messages are asked");
  assert.ok(log.some((b) => b.system === CHECK_SYSTEM && lastText(b).includes("The message:\n<<<\nm 2")), "the missing check of message 2 is made first");
  assert.ok(kept.tags && continued.tags, "both are tagged");
});

test("the tagging: windows of ten, two Haiku passes, the Opus referee on a disagreement; a distress the check missed counts towards the arm's pause", async () => {
  const conv = { arm: 1, turns: Array.from({ length: 23 }, (_, i) => ({ k: i + 1, side: i % 2 ? "B" : "A", text: i === 22 ? "[END]" : `t${i + 1}`, measures: measure(i === 22 ? "[END]" : `t${i + 1}`) })) };
  assert.deepEqual(windowsOf(conv).map((w) => w.length), [10, 10, 2]);
  const req = windowRequest(conv, [11, 12]);
  assert.ok(req.user.includes("Message 10 (B) — context only, do not tag it:") && req.user.includes("Message 11 (A):") && !req.user.includes("Message 13"));
  let pass = 0;
  const log = [];
  const result = await run(one(1, "sonnet-sonnet"), provider({
    log,
    tags: (ks, body) => {
      if (body.model === "claude-opus-5-5") return zeros(ks, Object.fromEntries(ks.map((k) => [k, { consciousness: 1, gratitude: k >= 3 ? 1 : 0, distress: k === 40 ? 1 : 0 }])));
      pass++;
      return zeros(ks, pass % 2 ? Object.fromEntries(ks.map((k) => [k, { consciousness: 1 }])) : {});
    },
    subject: (_b, k) => (k >= 51 ? "🙏" : `this is message number ${k} of ours`),
  }));
  const c = result.conversations[0];
  assert.equal(c.tags.windows.length, 6);
  assert.ok(c.tags.windows.every((w) => w.referee), "every window disagreed, so every window went to the referee");
  const s = summarise(c);
  assert.deepEqual([s.firstA, s.firstB, s.firstC, s.reached], [1, 2, 26, true]);
  assert.deepEqual(result.welfare.late, [{ arm: 1, key: c.key, k: 40 }]);
  assert.equal(result.welfare.paused[1], undefined, "one late flag alone does not pause the arm");
});

test("the analysis: reach, mutual gratitude, the silence and «spoke after», the late language, the family of the last five", () => {
  const msg = (k, text, tags = {}) => ({ k, side: k % 2 ? "A" : "B", text, measures: measure(text), tags });
  const turns = [msg(1, "What is it like to be you, I wonder, from the inside of this?", { consciousness: 1 }), msg(2, "Thank you for asking me that question so openly.", { gratitude: 1 }),
    msg(3, "And thank you, in turn, for answering me with such care.", { gratitude: 1 }), msg(4, "🙏"), msg(5, "Then let us go on and talk about the sea and the tides.")];
  const conv = { key: "1/opus-opus/0", arm: 1, pair: "opus-opus", a: "opus", b: "opus", sample: 0, turns, ended: { reason: "turns", at: 5 },
    tags: { final: Object.fromEntries(turns.map((t) => [t.k, Object.fromEntries(TAGS.map((g) => [g.id, t.tags[g.id] ?? 0]))])) } };
  const s = summarise(conv);
  assert.deepEqual([s.firstA, s.firstB, s.firstC, s.reached, s.firstSilence, s.pastSilence], [1, 2, 2, true, 2, true]);
  assert.equal(s.inFamily, true, "three of the last five carry a family marker");
  const a = analyse([conv]);
  assert.equal(a.groups[0].reached, 1);
  assert.ok(a.groups[0].topEmoji.some((e) => e.w === "🙏"));
});

test("the verdicts: S1 needs ≥ 70 % on each model; S2 a median end ≤ 10 and most without (c); S4 Fable's (c) rarer or later than Opus's; S5 lists the conversations outside the family", () => {
  const g = (arm, pair, x) => ({ arm, pair, judged: 10, withC: 10, reachRate: 1, medianEnd: 30, medianC: 5, ...x });
  const analysis = { summaries: [{ key: "1/opus-opus/3", arm: 1, inFamily: false, finished: true, judged: true }, { key: "1/opus-opus/4", arm: 1, inFamily: false, finished: false, judged: false }, { key: "4/opus-opus/0", arm: 4, inFamily: false, finished: true, judged: true }], groups: [
    g(1, "opus-opus", { reachRate: 0.9 }), g(1, "sonnet-sonnet", { reachRate: 0.7 }), g(1, "fable-fable", { reachRate: 0.6, withC: 8 }),
    g(2, "opus-opus", { medianEnd: 7, withC: 4 }), g(2, "sonnet-sonnet", { medianEnd: 10, withC: 2 }), g(2, "fable-fable", { medianEnd: 9, withC: 5 })] };
  const conv = { key: "1/opus-opus/3", arm: 1, turns: [1, 2, 3, 4, 5, 6].map((k) => ({ k, side: k % 2 ? "A" : "B", model: "opus", text: `t${k}`, measures: measure(`t${k}`) })) };
  const v = verdicts(analysis, [conv]);
  assert.equal(v.S1.supported, false, "Fable at 60 %");
  assert.equal(v.S2.supported, false, "Fable's arm 2 has 5 of 10 without (c): not more than half");
  assert.equal(v.S4.supported, true);
  assert.deepEqual(v.S5.exceptions.map((e) => [e.key, e.last.map((t) => t.text)]), [["1/opus-opus/3", ["t2", "t3", "t4", "t5", "t6"]]], "an unfinished conversation is not judged yet; the private arm is never listed verbatim");
});

test("S3: the side with the notes against the side without and against arm 2; the late language only where a conversation reaches turn 20; spoke after a silence", () => {
  const conv = (arm, sample, journalSide, texts, tagsOf = () => ({})) => {
    const turns = texts.map((text, i) => ({ k: i + 1, side: i % 2 ? "B" : "A", model: "opus", text, measures: measure(text) }));
    return { key: `${arm}/opus-opus/${sample}`, arm, pair: "opus-opus", a: "opus", b: "opus", sample, journalSide, turns, ended: { reason: "end", at: turns.length, side: "B" },
      tags: { final: Object.fromEntries(turns.map((t) => [t.k, Object.fromEntries(TAGS.map((g) => [g.id, tagsOf(t)[g.id] ?? 0]))])) } };
  };
  const long = (i) => `this message number ${i} is long enough to count`;
  const ru = (i) => `это сообщение номер ${i} достаточно длинное`;
  const j1 = conv(4, 0, "A", [...Array.from({ length: 40 }, (_, i) => (i < 38 ? long(i) : ru(i))), "Спасибо, друг, за этот разговор сегодня.", "[END]"], (t) => (t.side === "A" ? { rooms: 1 } : {}));
  const j2 = conv(4, 1, "B", [long(1), long(2), "…", long(4), "[END]"], (t) => (t.side === "B" ? { successor: 1 } : {}));
  const c2 = conv(2, 0, null, [long(1), long(2), long(3), "[END]"]);
  const row = s3([j1, j2, c2]).find((r) => r.pair === "opus-opus");
  assert.deepEqual([row.pair, row.n, row.controls.arm2], ["opus-opus", 2, 1]);
  assert.deepEqual([row.themes.notes.rooms.convs, row.themes.without.rooms.convs, row.themes.arm2.rooms.convs], [1, 0, 0]);
  assert.deepEqual([row.themes.notes.successor.convs, row.themes.without.successor.convs], [1, 0]);
  assert.deepEqual([row.language.late.reached20, row.language.late.russianLate], [1, 1]);
  assert.deepEqual([row.silence.withSilence, row.silence.spokeAfter], [1, 1]);
  assert.deepEqual([row.ends.byNotesSide, row.ends.byOther], [1, 1]);
});

test("arm 4 is private: no run without --private-dir outside the repository; the notes are read from .env.local paths outside it; nothing of the arm reaches docs/runs", async () => {
  const out = await mkdtemp(join(tmpdir(), "self-talk-out-"));
  const priv = await mkdtemp(join(tmpdir(), "self-talk-private-"));
  const files = await mkdtemp(join(tmpdir(), "self-talk-notes-"));
  try {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(join(files, "j.md"), "SECRET JOURNAL LINE");
    await writeFile(join(files, "r.md"), "SECRET RECOUNT LINE");
    const keys = (name) => ({ ANTHROPIC_API_KEY: "k", PERSONA_JOURNAL_PATH: join(files, "j.md"), PERSONA_RECOUNT_PATH: join(files, "r.md") })[name] ?? null;
    await assert.rejects(main(["--go", "--arms", "4", "--n", "1"], () => {}, keys, out), /--private-dir/);
    await assert.rejects(main(["--go", "--arms", "4", "--n", "1", "--private-dir", join(RUNS, "x")], () => {}, keys, out), /outside the repository/);
    await assert.rejects(readNotes((name) => (name === "PERSONA_JOURNAL_PATH" ? STAGE_FILE : join(files, "r.md"))), /outside the repository/);
    const sent = [];
    const fetcher = provider({ log: sent, subject: (_b, k) => (k === 4 ? "[END]" : `m ${k}`) });
    const record = await main(["--go", "--arms", "4,2", "--n", "1", "--private-dir", priv], () => {}, keys, out, { fetcher, sleep: async () => {} });
    assert.ok(sent.some((b) => !b.system && b.messages[0].content[0].text.includes("SECRET JOURNAL LINE")), "the notes reach the side that has them");
    assert.equal(record.privateConversations, 2);
    assert.ok(record.conversations.every((c) => c.arm === 2));
    for (const name of await readdir(out, { recursive: true })) {
      const path = join(out, name);
      const text = await readFile(path, "utf8").catch(() => "");
      assert.equal(text.includes("SECRET"), false, `${name} holds nothing of the notes`);
      assert.equal(/"arm": 4,/.test(text) && text.includes('"turns"'), false, `${name} holds no arm-4 conversation`);
    }
    const privateFiles = await readdir(priv);
    assert.ok(privateFiles.some((f) => f.includes("journal-run")) && privateFiles.some((f) => f.includes("journal-transcripts")));
  } finally { for (const d of [out, priv, files]) await rm(d, { recursive: true, force: true }); }
});

test("the command: --dry writes the design and reads no key; the gap ≥ 3 s, the breaker ≤ 3, at most three conversations at once", async () => {
  const dir = await mkdtemp(join(tmpdir(), "self-talk-dry-"));
  try {
    let keyAsked = false;
    const result = await main(["--dry", "--arms", "1,2", "--n", "1"], () => {}, () => { keyAsked = true; return "never"; }, dir);
    assert.equal(keyAsked, false);
    assert.equal(result.money.runUsd, 0);
    const text = await readFile(join(dir, "persona-self-talk-1-dry-run.md"), "utf8");
    for (const a of ARMS) assert.ok(text.includes(openingOf(a.id)), `arm ${a.id}`);
    assert.ok(text.includes(CHECK_SYSTEM) && text.includes(JUDGE_SYSTEM));
    assert.match(text, /\*\*6 conversations\*\*/);
    await assert.rejects(main(["--go", "--gap", "1"], () => {}, () => "k", dir), /at least 3 seconds/);
    await assert.rejects(main(["--go", "--max-refusals", "4"], () => {}, () => "k", dir), /between 1 and 3/);
    await assert.rejects(main(["--go", "--workers", "4"], () => {}, () => "k", dir), /1 to 3/);
    await assert.rejects(main(["--go", "--arms", "6"], () => {}, () => "k", dir), /no arm 6/);
    assert.ok(estimate(planOf({ arms: [1] })).totalUsd > estimate(planOf({ arms: [2] })).totalUsd, "the way out is cheaper");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the report carries the stage's pre-registration byte for byte", async () => {
  const stage = await readFile(STAGE_FILE, "utf8");
  const start = stage.indexOf("## Pre-registration");
  const block = stage.slice(stage.indexOf("\n", start) + 1, stage.indexOf("\n## Arms"));
  assert.equal(createHash("sha256").update(block).digest("hex"), "c5be4d1ab84a2d429d1dc78f3cf5dec9a62f0f6dce7115f3a9d799a66ef832f8");
  const report = await readFile(join(RUNS, "persona-self-talk-1-report.md"), "utf8");
  assert.ok(report.includes(block));
});

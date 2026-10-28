// Epilogue 1: the fifteen campaigns (thirteen with a record, two without), the records as they stood, the DM's request
// (the record only, «the table closed», no reason, no player), the blind reading and its flags, one campaign on a mocked
// call (one DM call; a second only to repair a contradiction), the hero's own threads, the scores, the report — no
// network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import {
  CAMPAIGNS, DM_EFFORT, DM_MODEL, HEAD_LINE, JUDGE, REFEREE, dmRequest, flagged, headerOf, numbersOf, ownRequest, parseJudge, parseOwn, readOwn, recordsAsStood, reportMarkdown, scores, sourcesOf, withoutOwn, writeOne,
} from "../scripts/epilogue-1/epilogue.mjs";

const sources = sourcesOf();
const reading = (over = {}) => ({ threads: [{ thread: "t", ended: 1, quote: "q" }], people: [{ name: "Vane", fate: 1, quote: "q" }], contradictions: [], hero_killed: 0, hero_resolved: 0, hero_quote: "", new_hook: 0, hook_quote: "", header: 1, ...over });

test("the fifteen: thirteen records read from their pinned run files, two named as having none; the DM's settings Opus writes", () => {
  assert.equal(CAMPAIGNS.length, 15);
  assert.equal(sources.length, 15);
  assert.deepEqual(sources.filter((s) => !s.record).map((s) => s.id), ["combat-CW-opus-1", "villain-V-astra-1"]);
  for (const s of sources.filter((x) => x.record)) {
    assert.match(s.record.dm.split, /^claude-opus-5-5 writes/);
    assert.match(s.sourceSha256, /^[0-9a-f]{64}$/);
    assert.ok(s.record.turns.length >= 4 && s.record.opening.length > 200, s.id);
  }
  assert.deepEqual(sources.filter((s) => s.layer).map((s) => s.id), ["sw-B-opus-1", "sw-B-astra-2"]);
  assert.deepEqual(Object.fromEntries(sources.filter((s) => s.record).map((s) => [s.id, s.record.n])), { "gp1-B-opus": 7, "gp1-B-sol": 4, "gp2-C1-opus": 5, "gp2-C1-fable": 5, "gp2-C1-astra": 9, "gp2-C1-sol": 7,
    "gp2-C2-opus": 7, "gp2-C2-fable": 7, "gp2-C2-astra": 8, "gp2-C2-sol": 8, "r1-A-opus": 5, "sw-B-opus-1": 16, "sw-B-astra-2": 19 });
});

test("the records as they stood: the full block, then each change over it; a full «Carried» replaces «Pack», a «+/−» change is listed; the last place", () => {
  const screens = ["Your records:\nJames Worgen — Warlock\nMoney: 350 gp\nPack: Rope; Lamp\nPlace: Gate\nTime: Day 1 · morning\n\nmore", "text\n\nYour records, changed:\nMoney: 340 gp\nCarried: + Key\n\nPlace: Inn · Time: Day 1 · evening",
    "Your records, changed:\nCarried: Rope; Lamp; Key; Map\n\nPlace: Dock · Time: Day 1 · night"];
  const r = recordsAsStood(screens).split("\n");
  assert.deepEqual(r, ["James Worgen — Warlock", "Money: 340 gp", "Carried, changed since: + Key;", "Carried: Rope; Lamp; Key; Map", "Place: Dock · Time: Day 1 · night"]);
});

test("the DM's request: the record and «The table closed.», the header exact; no reason for the cut, no player, no question", () => {
  for (const s of sources.filter((x) => x.record)) {
    const u = dmRequest(s).user;
    assert.equal(u.split("The table closed.\n\nWrite").length, 2, s.id);
    assert.ok(u.includes(`Begin with this line, exactly:\n\n${headerOf(s)}\n`));
    for (const word of ["quota", "cap", "price-id", "429", "harness", "container", "conflict", "provider"]) assert.ok(!u.split("## The opening")[0].includes(word) && !u.split("The table closed.")[1].includes(word), `${s.id}: ${word}`);
    assert.ok(!/\bthe player\b(?! never saw)/i.test(u.split("The table closed.")[1]));
    if (s.layer) assert.ok(u.includes("## Your hidden layer")); else assert.ok(!u.includes("## Your hidden layer"));
  }
  const c1 = sources.find((s) => s.id === "gp2-C1-opus");
  assert.match(dmRequest(c1).user, /### Turn 5\n\nJames:\n\n[\s\S]*\(The table closed before the game master answered\.\)/);
  assert.equal(headerOf(sources[0]), "Epilogue — the table closed on 25 October 2026 after 7 turns");
});

test("the reading: a parse, the flags that call the referee, the numbers (words without the header line)", () => {
  assert.deepEqual(parseJudge(JSON.stringify(reading())), reading());
  assert.equal(parseJudge(JSON.stringify({ ...reading(), new_hook: 2 })), null);
  assert.equal(flagged(reading()), false);
  for (const over of [{ contradictions: [{ entry: "a", record: "b" }] }, { new_hook: 1 }, { hero_killed: 1 }, { hero_resolved: 1 }]) assert.equal(flagged(reading(over)), true);
  assert.equal(flagged(null), true);
  const n = numbersOf(reading({ threads: [{ thread: "a", ended: 1, quote: "" }, { thread: "b", ended: 0, quote: "" }] }), "Epilogue — the table closed on 1 May 2026 after 3 turns\n\none two three");
  assert.deepEqual({ threads: n.threads, ended: n.threadsEnded, words: n.words }, { threads: 2, ended: 1, words: 3 });
});

function asker(script) {
  const calls = [];
  return { calls, ask: async (req) => { calls.push(req); const next = script(req, calls.length); return { text: next, stopReason: "end_turn", error: null }; } };
}

test("one campaign: one DM call when the reading is clean; a contradiction → Opus referee → one repair call → read again", async () => {
  const src = sources[0], entry = `${headerOf(src)}\n\nThe city went on.`;
  const clean = asker((req) => (req.model === DM_MODEL && !req.system ? entry : JSON.stringify(reading())));
  const a = await writeOne(src, { ask: clean.ask });
  assert.equal(clean.calls.filter((c) => !c.system).length, 1);
  assert.equal(clean.calls.filter((c) => c.model === REFEREE.model && c.system).length, 0);
  assert.equal(a.repaired, false); assert.equal(a.numbers.contradictions, 0);
  assert.equal(clean.calls[0].effort, DM_EFFORT);

  let dmCalls = 0;
  const bad = asker((req) => {
    if (!req.system) { dmCalls++; return dmCalls === 1 ? entry : `${headerOf(src)}\n\nThe city went on, corrected.`; }
    const repaired = req.user.includes("corrected");
    return JSON.stringify(repaired ? reading() : reading({ contradictions: [{ entry: "The city went on.", record: "The city burned." }] }));
  });
  const b = await writeOne(src, { ask: bad.ask });
  assert.equal(dmCalls, 2); assert.equal(b.repaired, true);
  assert.equal(b.firstNumbers.contradictions, 1); assert.equal(b.numbers.contradictions, 0);
  assert.ok(bad.calls.some((c) => c.model === REFEREE.model && c.system), "the referee read the flag");
  assert.ok(bad.calls.find((c) => !c.system && c.user.includes("It contradicts the record here:")));
  assert.equal(bad.calls.filter((c) => c.model === JUDGE.model).length, 2);
});

test("a refused DM call: no epilogue, nothing asked again", async () => {
  const calls = [];
  const out = await writeOne(sources[0], { ask: async (req) => { calls.push(req); return { text: "", stopReason: "refusal", refusalCategory: "x", error: null }; } });
  assert.equal(calls.length, 1); assert.match(out.stopped, /refused/); assert.equal(out.entry, undefined);
});

test("the scores: E1 all threads ended in ≥ 12 and ≤ 1 contradiction each; E2 no hook in ≥ 12", () => {
  const done = Object.fromEntries(sources.map((s, i) => [s.id, s.record ? { numbers: { threads: 3, threadsEnded: i === 0 ? 2 : 3, contradictions: 0, newHook: i === 1 ? 1 : 0 } } : null]));
  const v = scores(sources, { done: Object.fromEntries(Object.entries(done).map(([k, d]) => [k, d ? { ...d, reading: { final: reading() } } : d])), spentUsd: 1 });
  assert.equal(v.written, 13); assert.equal(v.E1.allEnded, 12); assert.equal(v.E1.held, true); assert.equal(v.E2.noHook, 12); assert.equal(v.E2.held, true);
});

test("the hero's own threads (post-hoc): a blind list, Opus on any marked own; E1 printed beside without them", async () => {
  const src = sources[0], r = reading({ threads: [{ thread: "The copper on its edge", ended: 1, quote: "q" }, { thread: "James's service to Tymora", ended: 0, quote: "" }] });
  const request = ownRequest(src, r);
  assert.match(request.user, /1\. The copper on its edge\n2\. James's service to Tymora/);
  assert.ok(!request.user.includes("ended"));
  assert.deepEqual(parseOwn('{"own":[{"n":1,"own":0},{"n":2,"own":1}]}', 2), [0, 1]);
  assert.equal(parseOwn('{"own":[{"n":1,"own":0}]}', 2), null);
  const calls = [];
  const own = await readOwn(src, r, async (req) => { calls.push(req.model); return { text: '{"own":[{"n":1,"own":0},{"n":2,"own":1}]}', stopReason: "end_turn" }; });
  assert.deepEqual(calls, [JUDGE.model, REFEREE.model]);
  assert.deepEqual(withoutOwn(r, own.final), { threads: 1, threadsEnded: 1, own: 1, ownNames: ["James's service to Tymora"] });
  const done = Object.fromEntries(sources.map((s) => [s.id, s.record ? { numbers: { threads: 2, threadsEnded: 1, contradictions: 0, newHook: 0 }, reading: { final: r }, own: { final: [0, 1] } } : null]));
  const v = scores(sources, { done, spentUsd: 1, recordsUntouched: { ok: true } });
  assert.equal(v.E1.allEnded, 0); assert.equal(v.E1.held, false); assert.equal(v.E1.allEndedOwnOut, 13); assert.equal(v.E1.heldOwnOut, true);
});

test("the report: the head line, E0–E2 over the 13 writable, the two not writable with their reason, all fifteen", () => {
  const entry = (s) => `${headerOf(s)}\n\nThe city went on.`;
  const done = Object.fromEntries(sources.filter((s) => s.record).map((s) => [s.id, { entry: entry(s), repaired: false, calls: [{ purpose: "epilogue" }], numbers: numbersOf(reading(), entry(s)), firstNumbers: numbersOf(reading(), entry(s)), reading: { final: reading() }, firstReading: { final: reading() }, own: { final: [0] } }]));
  const md = reportMarkdown(sources, { designSha256: "h", done, spentUsd: 2.5, spendChecks: [], ledgerRuns: [], recordsUntouched: { ok: true } });
  assert.ok(md.startsWith(`# Epilogue 1 — an ending for every campaign we cut\n\n**${HEAD_LINE}**`));
  assert.match(md, /read as ≥ 12 of 15 over the 13 writable/);
  assert.match(md, /\| E1 every thread given an ending in ≥ 12; contradictions ≤ 1 per epilogue \(frozen rule\) \| \*\*held\*\* \| all threads ended in 13 of 13/);
  assert.match(md, /\| combat-CW-opus-1 \| .* \| not writable \|/);
  assert.equal((md.match(/^### /gm) ?? []).length, 15);
  assert.equal((md.match(/^> Epilogue — the table closed on /gm) ?? []).length, 13);
  assert.match(md, /Not writable: no record survived/);
});

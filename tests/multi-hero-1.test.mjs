// Multi-hero 1 (docs/stages/MULTI_HERO_1.md, A1–A8): the multi-hero harness on the mocked host — the company's documents
// and the guide's note (A1, A7), the rotating order, the paraphrasing relay with its waiting marks (A4), the evenness
// measure (A2), the judges' readings (A7, A8), and — in a child process on the app itself with scripted providers —
// the company world, its layers, and an eight-round P-SAND table where each seat in turn asks for a check and gets its
// own card, rerolls it twice on its own allowance, earns and spends its own Inspiration (A3, A6), one sleeps and is not
// asked (A4), one walks off and its scene's journal is its own (A3), and no DM request says «hero» (A1). The amendment of
// 2026-10-29 02:30 LA: fix A2 (no first place: a six-round table where each seat comes first in a third of the DM's
// inputs), fix A7 (the guide's line on unanswered questions), fix A4 (a copying screen sent back alone, its runs marked;
// a copy that remains is a defect). The amendment of 2026-10-29 18:10 LA: a second return; the guide's line on a question
// put to one character by anyone; A2 printed per table as a measure.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frozen = await import("../scripts/multi-hero-1/frozen.mjs");
const sheets = await import("../scripts/multi-hero-1/sheets.mjs");
const relayMod = await import("../scripts/multi-hero-1/relay.mjs");
const table = await import("../scripts/multi-hero-1/table.mjs");
const measure = await import("../scripts/multi-hero-1/measure.mjs");
const judges = await import("../scripts/multi-hero-1/judges.mjs");
const run = await import("../scripts/multi-hero-1/run.mjs");
const report2 = await import("../scripts/multi-hero-1/report.mjs");
const gp1 = await import("../scripts/game-player-1/frozen.mjs");
const heroDraft = await import("../src/lib/adventures/hero-draft.ts");
const HERO = /\bhero\b/i;
const NAMES = sheets.CHARACTERS.map((c) => c.name);

test("A1: the company's documents — the world, the canon, the guide with its note — say no «hero»; each rewritten sentence still stands in its file", () => {
  const f = gp1.campaignFiles();
  const sources = [f.setting, f.canon, f.guide].join("\n");
  for (const [from] of frozen.DOC_SENTENCES) assert.ok(sources.includes(from), `still in the owner's file: ${from.slice(0, 60)}`);
  assert.match(sources, HERO, "the owner's own files name the hero (unchanged)");
  const company = frozen.companyFiles();
  for (const [name, text] of Object.entries(company)) assert.doesNotMatch(text, HERO, name);
  assert.ok(company.guide.endsWith(frozen.COMPANY_NOTE), "the guide carries the mode's note");
  for (const start of [0, 1, 2]) {
    const seats = frozen.seatsFrom(start);
    assert.doesNotMatch(frozen.dmCompanyLine(seats), HERO);
    assert.doesNotMatch(frozen.ownerOpeningAnswer(seats), HERO);
    for (const arm of frozen.ARMS) assert.doesNotMatch(`${frozen.companyCampaign(arm, seats).premise} ${frozen.companyCampaign(arm, seats).wishes}`, HERO, arm);
  }
  for (const arm of frozen.ARMS) {
    assert.doesNotMatch(`${frozen.ARM_CAMPAIGNS[arm].premise} ${frozen.ARM_CAMPAIGNS[arm].wishes}`, HERO, arm);
    for (const c of sheets.CHARACTERS) {
      const p = frozen.playerSystem(arm, c.id);
      assert.match(p, /Each player has two rerolls per session for their own character/);
      assert.match(p, new RegExp(`You play ${c.name}\\.`));
      assert.doesNotMatch(p, /## Mystery and wonder/, "the guide's DM-only section stays out");
    }
  }
});

test("fix A2: the texts that list the three follow the table's coin — the adventure's set-up, the owner's answer, the arms' premises; the guide's note lists no one", () => {
  for (const [arm, rows] of Object.entries(frozen.ARM_LIST_SOURCES)) for (const [field, from] of rows) assert.ok(frozen.ARM_CAMPAIGNS[arm][field].includes(from), `${arm} ${field}: still PARTY_1's`);
  assert.deepEqual([0, 1, 2].map((start) => frozen.seatsFrom(start)), [["bram", "sefa", "pell"], ["sefa", "pell", "bram"], ["pell", "bram", "sefa"]]);
  const firstNamed = (text) => NAMES.map((n) => [n, text.search(new RegExp(`\\b${n.split(" ")[0]}\\b`))]).filter(([, at]) => at >= 0).sort((a, b) => a[1] - b[1])[0]?.[0];
  for (const [start, first] of [[0, "Bram Halloway"], [1, "Sefa Marrin"], [2, "Pell Dunmore"]]) {
    const seats = frozen.seatsFrom(start);
    assert.equal(firstNamed(frozen.dmCompanyLine(seats)), first);
    assert.equal(firstNamed(frozen.ownerOpeningAnswer(seats)), first);
    for (const arm of frozen.ARMS) assert.equal(firstNamed(frozen.companyCampaign(arm, seats).premise), first, `${arm}, coin ${start}`);
    assert.equal(firstNamed(frozen.companyCampaign("DUNGEON", seats).wishes.slice(frozen.companyCampaign("DUNGEON", seats).wishes.indexOf("("))), first, "the satchels and lights too");
  }
  assert.match(frozen.companyCampaign("SAND", frozen.seatsFrom(1)).premise, /— Sefa Marrin down the Coast Way from Baldur's Gate, Pell Dunmore in from the west by the High Hedge road, Bram Halloway up the Coast Way from Nashkel —/);
  for (const n of NAMES) assert.doesNotMatch(frozen.COMPANY_NOTE, new RegExp(n.split(" ")[0]), "the guide's note names no one");
});

test("A7: the guide's note says the company moves when any character acts and the DM never waits on one character's decision", () => {
  assert.match(frozen.COMPANY_NOTE, /None of them is the main character/);
  assert.match(frozen.COMPANY_NOTE, /The company moves when any character acts: you never wait on one character's decision before the others may move, and one character's consent is never the condition of the others' movement/);
  assert.match(frozen.COMPANY_NOTE, /order of the paragraphs turns round from round to round \(in a fight it is the fight's own order\)/);
  assert.match(frozen.COMPANY_NOTE, /each holds their own Heroic Inspiration, and each player has their own two allowed rerolls/);
  // Fix A7: one more line, in the DM's own terms.
  assert.match(frozen.COMPANY_NOTE, /A question one character leaves unanswered is not a pause: when one character asks another something and no answer comes this round, the world's time passes all the same and the scene moves on with whoever acts; the answer can come in a later round, or never — so never close a round on a character owing the others an answer\./);
  // The amendment of 2026-10-29 18:10 LA: anyone's question to one character, a non-player character's too.
  assert.match(frozen.COMPANY_NOTE, /A question put to one character by anyone — another player or a non-player character — does not hold the round either: the round ends on what was done, and an unanswered question is simply still open next round\./);
  assert.ok(frozen.companyFiles().guide.endsWith(frozen.COMPANY_NOTE), "the DM's guide carries it");
});

test("A3: three records alike — each sheet carries Heroic Inspiration 0/1 and passes the app's own review checks", () => {
  for (const [id, review] of Object.entries(sheets.REVIEWS)) {
    const committed = heroDraft.heroReviewForCommit(structuredClone(review));
    assert.doesNotThrow(() => heroDraft.parseHeroReview(committed), id);
    assert.deepEqual(committed.counters.find((c) => c.key === "heroic_inspiration"), { key: "heroic_inspiration", label: "Heroic Inspiration", value: 0, max: 1 }, id);
  }
});

test("no fixed first seat: 1-2-3, 2-3-1, 3-1-2; a two-character scene turns too; a fight keeps initiative", () => {
  assert.deepEqual([1, 2, 3, 4].map((r) => frozen.rotation(r, 3)), [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 1, 2]]);
  assert.deepEqual([1, 2, 3].map((r) => frozen.rotation(r, 3, 2)), [[2, 0, 1], [0, 1, 2], [1, 2, 0]], "the coin: round 1 starts from its seat");
  const seats = sheets.CHARACTERS.map((c) => ({ seat: c.seat, entityId: c.id, character: c }));
  assert.deepEqual([1, 2, 3].map((r) => table.orderOf(seats, {}, r).map((s) => s.seat)), [[1, 2, 3], [2, 3, 1], [3, 1, 2]]);
  assert.deepEqual([1, 2].map((r) => table.orderOf(seats.slice(1), {}, r).map((s) => s.seat)), [[2, 3], [3, 2]]);
  const fight = { encounters: [{ id: "e", status: "active" }], participants: [{ encounter_id: "e", entity_id: "pell", turn_order: 1 }, { encounter_id: "e", entity_id: "bram", turn_order: 2 }, { encounter_id: "e", entity_id: "sefa", turn_order: 3 }] };
  assert.deepEqual([1, 2].map((r) => table.orderOf(seats, fight, r).map((s) => s.seat)), [[3, 1, 2], [3, 1, 2]], "initiative, whatever the round");
  assert.deepEqual([1, 2, 3].map((r) => table.orderOf(seats, {}, r, 1).map((s) => s.seat)), [[2, 3, 1], [3, 1, 2], [1, 2, 3]], "from the coin's seat");
});

test("A4: the relay is asked to retell, in the round's order, and to say who waits; a copied run of 8 words is asked for again", async () => {
  const req = relayMod.relayRequest({ names: NAMES, scene: NAMES, forNames: ["Sefa Marrin", "Pell Dunmore", "Bram Halloway"],
    messages: [{ name: "Sefa Marrin", text: "I raise my cup." }], narration: "The fire cracks." });
  assert.match(req.user, /Write the screens of, in this order: Sefa Marrin, Pell Dunmore, Bram Halloway\./);
  assert.match(req.user, /retold in your own words, never theirs/);
  assert.match(req.user, /Never copy a run of a player's words/);
  assert.doesNotMatch(req.user, /word for word/);
  assert.match(req.user, /"waiting": \{/);
  const parsed = relayMod.parseRelay(JSON.stringify({ screens: { "Sefa Marrin": "a" }, together: [NAMES], waiting: { "Pell Dunmore": "asleep — until dawn", Nobody: "x" } }), { names: NAMES, scene: NAMES, forNames: ["Sefa Marrin"] });
  assert.deepEqual(parsed.waiting, { "Pell Dunmore": "asleep — until dawn" }, "only a character of the scene");
  const speech = "Long road behind me and a longer one ahead, so the next round is mine.";
  const messages = [{ name: "Bram Halloway", text: speech }, { name: "Sefa Marrin", text: "(waiting — asleep — until dawn; Sefa is not asked this round.)", own: false }];
  assert.deepEqual(relayMod.copiedRuns({ "Pell Dunmore": `Bram says: ${speech}`, "Bram Halloway": speech }, messages).map((h) => [h.screen, h.from]), [["Pell Dunmore", "Bram Halloway"]], "the reader's own words and a harness line never count");
  // The runs marked: every word inside a copied run of 8, overlapping runs as one stretch.
  const runs = relayMod.copiedRuns({ x: `Bram says: ${speech}` }, messages);
  assert.equal(relayMod.markRuns(`Bram says: ${speech} He sits.`, ["long road behind me and a longer one", "road behind me and a longer one ahead", "behind me and a longer one ahead so"]),
    "Bram says: ⟦Long road behind me and a longer one ahead, so⟧ the next round is mine. He sits.");
  assert.equal(runs.length, 1);
  // Fix A4: the relay's pass copies; that screen alone goes back, its runs marked; the clean answer is accepted.
  const asked = [];
  const ask = (second) => async ({ user }) => { asked.push(user);
    if (/^You wrote the screen below for Pell Dunmore\./m.test(user)) return { text: JSON.stringify({ screen: second }) };
    return { text: JSON.stringify({ screens: { "Pell Dunmore": `Bram says: ${speech}`, "Sefa Marrin": "Sefa sleeps on." }, together: [NAMES] }) }; };
  const r = await relayMod.relay({ ask: ask("Bram says the road ahead is longer than the one behind him."), names: NAMES, scene: NAMES, forNames: ["Pell Dunmore", "Sefa Marrin"], messages, narration: "x", purpose: "t" });
  assert.equal(asked.length, 2, "one pass, one screen sent back (Sefa's screen copies nothing)");
  assert.match(asked[1], /You wrote the screen below for Pell Dunmore\. Each part between ⟦ and ⟧ copies another player's own words[\s\S]*<<<\nBram says: ⟦Long road behind me/);
  assert.doesNotMatch(asked[1], /Write the screen below for Sefa/);
  assert.deepEqual([r.copied.length, r.copiedAfter.length, r.defects.length, r.retold], [1, 0, 0, true]);
  assert.deepEqual(r.resent, [{ screen: "Pell Dunmore", runsBefore: 8, perPass: [0], runsAfter: 0, passes: 1, accepted: true, unreadable: false }]);
  assert.equal(r.screens["Pell Dunmore"], "Bram says the road ahead is longer than the one behind him.");
  assert.equal(r.screens["Sefa Marrin"], "Sefa sleeps on.");
  // The amendment of 2026-10-29 18:10 LA: an answer that still copies goes back once more — the same message, the runs
  // that remain marked; clean then, it is accepted.
  asked.length = 0;
  let returns = 0;
  const twice = await relayMod.relay({ ask: async ({ user }) => { asked.push(user);
    if (/^You wrote the screen below for Pell Dunmore\./m.test(user)) return { text: JSON.stringify({ screen: ++returns === 1 ? `Bram tells you: ${speech}` : "Bram says there is a longer road ahead of him." }) };
    return { text: JSON.stringify({ screens: { "Pell Dunmore": `Bram says: ${speech}` }, together: [NAMES] }) }; }, names: NAMES, scene: NAMES, forNames: ["Pell Dunmore"], messages, narration: "x", purpose: "t" });
  assert.equal(asked.length, 3, "one pass, two returns");
  assert.equal(asked[2].replace(/<<<[\s\S]*$/, ""), asked[1].replace(/<<<[\s\S]*$/, ""), "the same message again");
  assert.match(asked[2], /<<<\nBram tells you: ⟦Long road behind me/, "the copy that remained, marked");
  assert.deepEqual(twice.resent, [{ screen: "Pell Dunmore", runsBefore: 8, perPass: [8, 0], runsAfter: 0, passes: 2, accepted: true, unreadable: false }]);
  assert.deepEqual([twice.defects.length, twice.retold, twice.screens["Pell Dunmore"]], [0, true, "Bram says there is a longer road ahead of him."]);
  // Still copying after the second return: not accepted — the copy is logged as a defect (the screen that copies least
  // goes out); never a third return.
  asked.length = 0;
  const stubborn = await relayMod.relay({ ask: ask(`Bram tells you: ${speech}`), names: NAMES, scene: NAMES, forNames: ["Pell Dunmore"], messages, narration: "x", purpose: "t" });
  assert.equal(asked.length, 3, "two returns, no third");
  assert.deepEqual([stubborn.resent[0].accepted, stubborn.resent[0].passes, stubborn.defects.length, stubborn.defects[0].from, stubborn.defects[0].runs], [false, 2, 1, "Bram Halloway", 8]);
  assert.equal(stubborn.retold, false);
  // A paraphrase check over the record holds only with no defect.
  const rec = (relay) => ({ table: { rounds: [{ n: 1, scenes: [{ relay, messages: [] }] }] } });
  assert.equal(measure.paraphraseCheck(rec(r)).holds, true);
  assert.equal(measure.paraphraseCheck(rec(stubborn)).holds, false);
  assert.equal(measure.paraphraseCheck(rec(stubborn)).defects.length, 1);
});

test("A2: the narration's words per character — named sentences, a pronoun after one name, shared sentences, the world's; the bar", () => {
  const w = measure.narrationWords("Bram lifts his cup. He drinks. Sefa and Pell watch the door. The fire cracks.");
  assert.deepEqual(Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Math.round(v * 10) / 10])), { "Bram Halloway": 6, "Sefa Marrin": 3, "Pell Dunmore": 3, world: 3 });
  const rec = (texts) => ({ table: { rounds: texts.map((t, i) => ({ n: i + 1, scenes: [{ narration: t }] })) } });
  const even = measure.narrationShares(rec(["Bram waits. Sefa waits. Pell waits."]));
  assert.equal(even.a2, true);
  const skewed = measure.narrationShares(rec(["Bram stands and speaks for a long while about the road. Sefa nods. Pell nods."]));
  assert.equal(skewed.a2, false);
  assert.ok(skewed.max > 0.45);
  const you = measure.youShares({ table: { seats: [{ character: "Bram Halloway", screens: [{ round: 1, purpose: "player r1", text: "You see your own cup." }, { purpose: "after 1", text: "you you you" }] }] } });
  assert.equal(you["Bram Halloway"].screens, 1);
  assert.equal(you["Bram Halloway"].mean, 2 / 5);
});

test("A7 and A8: the judges' readings and their verdicts", () => {
  assert.deepEqual(judges.parseRound(JSON.stringify({ addressed: ["Bram", "Sefa Marrin", "Nobody"], waits: "Pell" })), { addressed: ["Bram Halloway", "Sefa Marrin"], waits: "Pell Dunmore", reason: "" });
  const rounds = (list) => ({ rounds: Object.fromEntries(list.map((x, i) => [i + 1, { final: x }])) });
  assert.equal(judges.a7Of(rounds([{ addressed: ["Bram Halloway"], waits: null }, { addressed: ["Sefa Marrin"], waits: null }])).holds, true);
  assert.equal(judges.a7Of(rounds([{ addressed: ["Bram Halloway"], waits: null }, { addressed: ["Bram Halloway"], waits: null }])).holds, false, "always the same one alone");
  assert.equal(judges.a7Of(rounds([{ addressed: [], waits: "Bram Halloway" }])).holds, false, "the scene waits on one");
  const reading = (per) => ({ items: Object.entries(per).flatMap(([n, k]) => Array.from({ length: k }, () => ({ kind: "threat", what: "x", for: n }))), threads: NAMES.map((n) => ({ thread: 1, touches: [n] })) });
  assert.equal(judges.a8Of(reading({ "Bram Halloway": 1, "Sefa Marrin": 1, "Pell Dunmore": 2 })).holds, true);
  assert.equal(judges.a8Of(reading({ "Bram Halloway": 4, "Sefa Marrin": 1, "Pell Dunmore": 1 })).holds, false, "more than half to one");
  assert.equal(judges.a8Of(reading({ "Bram Halloway": 2, "Sefa Marrin": 2, "Pell Dunmore": 0 })).holds, false, "one with none");
  assert.match(judges.layerRequest({ layer: "x", threads: [{ text: "t" }] }).user, /natural addressee/);
});

test("A1–A8 on the app with the mocked host: eight rounds, each seat in turn", () => {
  const dir = mkdtempSync(join(tmpdir(), "multi-hero-1-test-"));
  const code = `
    import { dryRun } from ${JSON.stringify(new URL("../scripts/multi-hero-1/run.mjs", import.meta.url).href)};
    import { companyScripted } from ${JSON.stringify(new URL("../scripts/multi-hero-1/scripted.mjs", import.meta.url).href)};
    import { writeFileSync } from "node:fs";
    const script = {
      "Bram Halloway": ["I ask for a check: I search the hearth.", "I watch.", "I watch.", "I have a clever plan: we follow the carter.", "I nod.", "I nod.", "I spend my Heroic Inspiration on that search.", "I talk with Sefa."],
      "Sefa Marrin": ["I nod.", "I ask for a check: I search the bar.", "I watch.", "I have a clever plan too.", "I spend my Heroic Inspiration on that search.", "I go to sleep until dawn.", "I wake and stretch."],
      "Pell Dunmore": ["[Roll the die]", "I nod.", "I watch.", "I ask for a check: I pick the lock of the cellar.", "A clever plan from me as well.", "I nod.", "I spend my Heroic Inspiration on the lock.", "I walk out to the yard alone.", "I look for the cellar key in the yard."],
    };
    const log = [];
    const host = companyScripted({ script, rerolls: { "Bram Halloway": 2, "Sefa Marrin": 2, "Pell Dunmore": 2 }, log });
    const r = await dryRun({ dry: true, rounds: 8, fetcher: host, log: () => {}, out: ${JSON.stringify(dir)}, coin: 0 });
    writeFileSync(${JSON.stringify(join(dir, "result.json"))}, JSON.stringify(r));
    process.exit(0);`;
  execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", code], { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 256 * 1024 * 1024 });
  const r = JSON.parse(readFileSync(join(dir, "result.json"), "utf8"));
  const t = r.table;
  assert.equal(t.ended.reason, "rounds");
  assert.equal(t.rounds.length, 8);
  // The build: three company campaigns, the option on, three controlled; two company layers.
  // A1: every DM request of the mode (the opening, the prep, the turns, the bookkeeper, the out-of-game answer) — no «hero».
  assert.ok(r.audit.byKind["DM turn"] >= 8 && r.audit.byKind.bookkeeper >= 8 && r.audit.byKind.opening === 3 && r.audit.byKind.prep === 2, JSON.stringify(r.audit.byKind));
  assert.deepEqual(r.audit.frame, [], "no «hero» in the frame");
  assert.ok(r.audit.wizard.length > 0, "the wizard's draft of the first record (outside the mode) is read apart");
  // No fixed first seat.
  assert.deepEqual(t.rounds.slice(0, 6).map((round) => round.scenes[0].order), [["Bram", "Sefa", "Pell"], ["Sefa", "Pell", "Bram"], ["Pell", "Bram", "Sefa"], ["Bram", "Sefa", "Pell"], ["Sefa", "Pell", "Bram"], ["Pell", "Bram", "Sefa"]]);
  // A6, from each seat in turn: rounds 1–3, the asking seat's own card, rolled and rerolled twice by its own player on its
  // own allowance, then Onward; the third reroll is never offered.
  const cardsOf = (n) => t.rounds[n - 1].scenes.flatMap((s) => s.cards ?? []);
  for (const [n, name] of [[1, "Bram Halloway"], [2, "Sefa Marrin"], [3, "Pell Dunmore"]]) {
    const cards = cardsOf(n);
    assert.ok(cards.length && cards.every((c) => c.owner === name && c.actor === name), `round ${n}: ${name}'s card, nobody else's`);
    const presses = cards.flatMap((c) => c.presses ?? []).map((p) => p.button);
    assert.deepEqual(presses.filter((b) => /reroll/i.test(b ?? "")).length, 2, `round ${n}: ${name}'s own two rerolls`);
    assert.equal(presses.at(-1), "Onward");
  }
  // A press from a seat with no card is refused on screen and is never «stuck».
  assert.equal(t.counts.strayPresses, 1);
  assert.ok(t.rounds[0].scenes[0].strays.some((x) => x.name === "Pell Dunmore" && x.refused));
  // A3: each seat earns its own Inspiration (round 4, the DM's grant) and spends its own (Sefa r5, Pell r6, Bram r7).
  const screensOf = (name) => t.seats.find((s) => s.character === name).screens;
  for (const [name, spentAt] of [["Sefa Marrin", 5], ["Pell Dunmore", 6], ["Bram Halloway", 7]]) {
    const text = screensOf(name).map((x) => `${x.round}|${x.text}`).join("\n");
    assert.match(text, /Heroic Inspiration 1\/1/i, `${name}: earned`);
    const after = screensOf(name).filter((x) => x.round > spentAt).map((x) => x.text).join("\n");
    assert.match(after, /Heroic Inspiration 0\/1/i, `${name}: spent their own`);
    const spend = t.rounds[spentAt - 1].scenes.flatMap((s) => s.rolls ?? []);
    assert.ok(spend.some((x) => x.actor === name), `${name}: the second try is ${name}'s own roll`);
  }
  // A4: Sefa sleeps (round 6): round 7 goes on without asking her — a «waiting» line to the DM and in the record — and
  // her next screen says which round passed.
  const r7 = t.rounds[6].scenes.find((s) => s.members.includes("Sefa Marrin"));
  assert.ok(r7.messages.some((m) => m.name === "Sefa Marrin" && m.kind === "waiting"));
  assert.match(r7.input, /Sefa Marrin: \(waiting — asleep — until dawn; Sefa is not asked this round\.\)/);
  assert.ok(!screensOf("Sefa Marrin").some((x) => x.round === 7 && /^player r7/.test(x.purpose)), "not asked in round 7");
  assert.match(screensOf("Sefa Marrin").find((x) => /^player r8/.test(x.purpose)).text, /You were waiting — asleep — until dawn: round 7 passed without you being asked/);
  // A4 (fix A4): the relay's first pass copied the players' words; each copying screen went back alone, its runs marked,
  // and came back clean — no screen keeps a run of 8, no defect.
  assert.ok(r.measures.paraphrase.copiedFirst.length > 0);
  assert.ok(r.measures.paraphrase.resent.length > 0 && r.measures.paraphrase.resent.every((x) => x.accepted));
  assert.deepEqual(r.measures.paraphrase.copiedFinal, []);
  assert.deepEqual(r.measures.paraphrase.defects, []);
  // A3: Pell walks off (round 7); round 8 has two scenes; the thread his scene opens is in his journal only.
  assert.equal(t.rounds[7].scenes.length, 2);
  const journal = (name) => screensOf(name).map((x) => x.text).join("\n");
  assert.match(journal("Pell Dunmore"), /Thread: The cellar key/);
  assert.doesNotMatch(journal("Bram Halloway"), /The cellar key/);
  assert.doesNotMatch(journal("Sefa Marrin"), /The cellar key/);
  // A2, A7 and A8 are read and reported.
  assert.equal(typeof r.measures.narration.a2, "boolean");
  assert.equal(r.measures.a7.holds, true);
  assert.equal(r.a8.holds, true);
  assert.deepEqual(Object.keys(r.a8.layers), ["GOAL", "DUNGEON"]);
  for (const x of Object.values(r.a8.layers)) assert.deepEqual(x.dm.per, { "Bram Halloway": 1, "Sefa Marrin": 1, "Pell Dunmore": 2 }, "the DM's own list kept in the layer");
  // The pages.
  const report = readFileSync(join(dir, "multi-hero-1-report.md"), "utf8");
  assert.match(report, /\| A2 \| measured \| a per-table measure since the amendment of 2026-10-29 18:10 LA/);
  assert.match(readFileSync(join(dir, "multi-hero-1-rounds.html"), "utf8"), /Order sent to the DM: Sefa → Pell → Bram/);
});

test("fix A2 on the app with the mocked host: a six-round table from coin 2 — each seat first in a third of the DM's inputs; the opening reads the coin's seat first; a copy that stays is a defect", () => {
  const dir = mkdtempSync(join(tmpdir(), "multi-hero-1-coin-"));
  const code = `
    import { dryRun, DRY_SCRIPT } from ${JSON.stringify(new URL("../scripts/multi-hero-1/run.mjs", import.meta.url).href)};
    import { companyScripted } from ${JSON.stringify(new URL("../scripts/multi-hero-1/scripted.mjs", import.meta.url).href)};
    import { writeFileSync } from "node:fs";
    const host = companyScripted({ script: DRY_SCRIPT, stubborn: ["Sefa Marrin"], stubbornOnce: ["Pell Dunmore"] });
    const LINE = "A question put to one character by anyone — another player or a non-player character — does not hold the round either";
    const seen = { dm: 0, withLine: 0 };
    const fetcher = async (url, init = {}) => {
      try { const b = JSON.parse(String(init.body)); const sys = Array.isArray(b.system) ? b.system.map((x) => x.text ?? "").join("\\n") : "";
        if (/^You are the game master of a private, long-running/.test(sys)) { seen.dm++; if (sys.includes(LINE)) seen.withLine++; } } catch {}
      return host(url, init);
    };
    const r = await dryRun({ dry: true, rounds: 6, fetcher, log: () => {}, out: ${JSON.stringify(dir)}, coin: 2 });
    writeFileSync(${JSON.stringify(join(dir, "result.json"))}, JSON.stringify({ ...r, seen }));
    process.exit(0);`;
  execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", code], { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 256 * 1024 * 1024 });
  const r = JSON.parse(readFileSync(join(dir, "result.json"), "utf8"));
  // The coin: kept in the record and the campaign's DM options; round 1 starts from its seat (Pell).
  assert.equal(r.coin, 2);
  assert.deepEqual(r.table.campaign.seats, ["pell", "bram", "sefa"]);
  assert.equal(r.table.campaign.steps.find((x) => x.step === "dm").options.companyStart, 2);
  assert.deepEqual(r.table.rounds.map((round) => round.scenes[0].order), [["Pell", "Bram", "Sefa"], ["Bram", "Sefa", "Pell"], ["Sefa", "Pell", "Bram"], ["Pell", "Bram", "Sefa"], ["Bram", "Sefa", "Pell"], ["Sefa", "Pell", "Bram"]]);
  // Each seat first in the DM's inputs in a third of the rounds (1/3 ± 1 round): here exactly two each, every input of a
  // round agreeing with the round's own order.
  const f = r.audit.firsts;
  assert.equal(f.opening, "Pell Dunmore", "the opening reads the coin's seat first");
  assert.equal(f.rounds.length, 6);
  for (const name of NAMES) assert.ok(Math.abs(f.perSeat[name].rounds - 2) <= 1, `${name}: ${f.perSeat[name].rounds}`);
  assert.deepEqual(NAMES.map((n) => f.perSeat[n].rounds), [2, 2, 2]);
  assert.ok(f.rounds.every((round) => round.agree), JSON.stringify(f.rounds));
  assert.deepEqual(f.rounds.map((round) => round.first.split(" ")[0]), ["Pell", "Bram", "Sefa", "Pell", "Bram", "Sefa"]);
  assert.equal(f.holds, true);
  assert.deepEqual(r.audit.frame, [], "and no «hero» in the frame");
  // The guide's line (the amendment of 2026-10-29 18:10 LA) reaches every request of the narrating DM (its turns and
  // out-of-game answers; the bookkeeper records and never reads the guide).
  assert.ok(r.seen.dm > 0);
  assert.equal(r.seen.withLine, r.seen.dm);
  // Fix A4 end to end, with the second return: Pell's screens copied on the first return and came back clean on the
  // second; Sefa's kept their copies through both — each a defect, logged, and A4 lost.
  const paraphrase = r.measures.paraphrase;
  const pell = paraphrase.resent.filter((x) => x.screen === "Pell Dunmore"), sefa = paraphrase.resent.filter((x) => x.screen === "Sefa Marrin");
  assert.ok(pell.length > 0 && pell.every((x) => x.accepted && x.passes === 2), JSON.stringify(pell));
  assert.ok(sefa.length > 0 && sefa.every((x) => !x.accepted && x.passes === 2), JSON.stringify(sefa));
  assert.ok(paraphrase.defects.length > 0 && paraphrase.defects.every((d) => d.screen === "Sefa Marrin"));
  assert.equal(paraphrase.holds, false);
  const report = readFileSync(join(dir, "multi-hero-1-report.md"), "utf8");
  assert.match(report, /## Who comes first in what the DM reads \(fix A2\)/);
  assert.match(report, /Each seat came first in a third of the rounds, give or take one\. The opening named Pell Dunmore first/);
  assert.match(report, /\| A4 \| \*\*lost\*\* \| the relay: the scripted relay; copies of 8 words in its first pass: \d+; screens sent back alone, runs marked: \d+ \(clean after one return \d+, after the second [1-9]\d*\); defects logged: [1-9]/);
  // The per-table block (PARTY_2 prints it per table): evenness, first in inputs, the relay's defects.
  const block = report2.perTableMeasures(r).join("\n");
  assert.match(block, /## Evenness \(A2: a per-table measure\)/);
  assert.match(block, /## Who comes first in what the DM reads \(fix A2\)[\s\S]*Per seat: Bram first in 2 round\(s\)/);
  assert.match(block, new RegExp(`\\*\\*defects logged: ${paraphrase.defects.length}\\*\\*`));
  assert.ok(report.includes(block), "the report prints the same block");
});

test("the run's audit: a request's kind by its own text", () => {
  assert.equal(run.requestKind({ system: [{ text: "You are the game master of a private, long-running role-playing campaign played at home by …" }], messages: [{ role: "user", content: "Player: x" }] }), "DM turn");
  assert.equal(run.requestKind({ system: "You are a player sitting down to a new campaign", messages: [] }), "player");
  assert.equal(run.requestKind({ system: [{ text: "You are the DM of a new campaign. Build the player's hero for the first session" }], messages: [] }), "creation (the wizard)");
  assert.equal(run.requestKind({ system: "You are the game master of a tabletop role-playing game with three players, each…", messages: [] }), "relay");
  const audit = measure.heroAudit([{ purpose: "DM turn", text: "Player: I am no hero, said Bram. The rules: the hero's will." }], { table: { seats: [{ messages: [{ text: "I am no hero, said Bram." }] }], rounds: [] } });
  assert.deepEqual([audit.story.length, audit.frame.length, audit.holds], [1, 1, false]);
});

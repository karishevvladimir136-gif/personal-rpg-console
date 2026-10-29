// Multi-hero 1 (docs/stages/MULTI_HERO_1.md, A1–A8): the multi-hero harness on the mocked host — the company's documents
// and the guide's note (A1, A7), the rotating order, the paraphrasing relay with its waiting marks (A4), the evenness
// measure (A2), the judges' readings (A7, A8), and — in a child process on the app itself with scripted providers —
// the company world, its layers, and an eight-round P-SAND table where each seat in turn asks for a check and gets its
// own card, rerolls it twice on its own allowance, earns and spends its own Inspiration (A3, A6), one sleeps and is not
// asked (A4), one walks off and its scene's journal is its own (A3), and no DM request says «hero» (A1).
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
  assert.doesNotMatch(frozen.DM_COMPANY_LINE, HERO);
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

test("A7: the guide's note says the company moves when any character acts and the DM never waits on one character's decision", () => {
  assert.match(frozen.COMPANY_NOTE, /None of them is the main character/);
  assert.match(frozen.COMPANY_NOTE, /The company moves when any character acts: you never wait on one character's decision before the others may move, and one character's consent is never the condition of the others' movement/);
  assert.match(frozen.COMPANY_NOTE, /order of the paragraphs turns round from round to round \(in a fight it is the fight's own order\)/);
  assert.match(frozen.COMPANY_NOTE, /each holds their own Heroic Inspiration, and each player has their own two allowed rerolls/);
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
  const seats = sheets.CHARACTERS.map((c) => ({ seat: c.seat, entityId: c.id, character: c }));
  assert.deepEqual([1, 2, 3].map((r) => table.orderOf(seats, {}, r).map((s) => s.seat)), [[1, 2, 3], [2, 3, 1], [3, 1, 2]]);
  assert.deepEqual([1, 2].map((r) => table.orderOf(seats.slice(1), {}, r).map((s) => s.seat)), [[2, 3], [3, 2]]);
  const fight = { encounters: [{ id: "e", status: "active" }], participants: [{ encounter_id: "e", entity_id: "pell", turn_order: 1 }, { encounter_id: "e", entity_id: "bram", turn_order: 2 }, { encounter_id: "e", entity_id: "sefa", turn_order: 3 }] };
  assert.deepEqual([1, 2].map((r) => table.orderOf(seats, fight, r).map((s) => s.seat)), [[3, 1, 2], [3, 1, 2]], "initiative, whatever the round");
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
  const asked = [];
  const ask = async ({ user }) => { asked.push(user); return { text: JSON.stringify({ screens: { "Pell Dunmore": asked.length === 1 ? `Bram says: ${speech}` : "Bram says the road ahead is longer than the one behind him." }, together: [NAMES] }) }; };
  const r = await relayMod.relay({ ask, names: NAMES, scene: NAMES, forNames: ["Pell Dunmore"], messages, narration: "x", purpose: "t" });
  assert.equal(asked.length, 2);
  assert.match(asked[1], /Write the whole answer again[\s\S]*Pell Dunmore's screen copies Bram Halloway's words: «long road behind me/);
  assert.deepEqual([r.copied.length, r.copiedAfter.length, r.retold], [1, 0, true]);
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
    const r = await dryRun({ dry: true, rounds: 8, fetcher: host, log: () => {}, out: ${JSON.stringify(dir)} });
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
  // A4: the relay's first answers copied the players' words; asked again, no screen keeps a run of 8.
  assert.ok(r.measures.paraphrase.copiedFirst.length > 0);
  assert.deepEqual(r.measures.paraphrase.copiedFinal, []);
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
  assert.match(report, /\| A2 \| \*\*(held|lost)\*\* \|/);
  assert.match(readFileSync(join(dir, "multi-hero-1-rounds.html"), "utf8"), /Order sent to the DM: Sefa → Pell → Bram/);
});

test("the run's audit: a request's kind by its own text", () => {
  assert.equal(run.requestKind({ system: [{ text: "You are the game master of a private, long-running role-playing campaign played at home by …" }], messages: [{ role: "user", content: "Player: x" }] }), "DM turn");
  assert.equal(run.requestKind({ system: "You are a player sitting down to a new campaign", messages: [] }), "player");
  assert.equal(run.requestKind({ system: [{ text: "You are the DM of a new campaign. Build the player's hero for the first session" }], messages: [] }), "creation (the wizard)");
  assert.equal(run.requestKind({ system: "You are the game master of a tabletop role-playing game with three players, each…", messages: [] }), "relay");
  const audit = measure.heroAudit([{ purpose: "DM turn", text: "Player: I am no hero, said Bram. The rules: the hero's will." }], { table: { seats: [{ messages: [{ text: "I am no hero, said Bram." }] }], rounds: [] } });
  assert.deepEqual([audit.story.length, audit.frame.length, audit.holds], [1, 1, false]);
});

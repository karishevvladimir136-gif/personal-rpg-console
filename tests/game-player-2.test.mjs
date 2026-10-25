// Game player 2 (docs/stages/GAME_PLAYER_2.md): the pure-simulation DM flag and Table C on game player 1's harness,
// without a live call. The flag: off by default; it skips the DM's prep (no hidden layer, no clocks) and nothing
// schedules or waits for one; one line closes the DM's frame only with the flag, in both languages; the owner's «Тайны»
// stay empty and locked and no stored secret or layer reaches the DM; the memory gauge raises no «missing hidden layer»
// flag. Table C: the player's prompt and files, the pre-registration copied unchanged, the authorship of threads read
// back from a transcript, C0–C4; and, in child processes, the app's own campaign creation and the whole pipeline.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { buildCouncilContext, buildDmLoopContext, privateNotesGauge } from "../src/lib/gameplay/dm-loop/context.ts";
import { DM_OPTION_DEFAULTS, parseDmOptions, parseDmOptionsPatch } from "../src/lib/gameplay/dm-loop/options.ts";
import { prepDecision } from "../src/lib/gameplay/dm-loop/prep-schedule.ts";
import { HIDDEN_LAYER_KEY } from "../src/lib/gameplay/dm-loop/private-notes.ts";
import { FRAME, PURE_SIMULATION_LINE, withPureSimulation } from "../src/lib/gameplay/dm-loop/roles.ts";
import { FRAME_RU, PURE_SIMULATION_LINE_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { DESIGN_SHA256 as GP1_DESIGN, OPEN_TABLE_LINE, playerFiles, playerSystem } from "../scripts/game-player-1/frozen.mjs";
import { transcriptMarkdown } from "../scripts/game-player-1/report.mjs";
import { sessionNumbers as numbersOf } from "../scripts/game-player-1/score.mjs";
import { DIGNIFIED_EXITS, PREREGISTRATION, PURE_TABLE_LINE, READINGS } from "../scripts/game-player-2/frozen.mjs";
import { authorshipNumbers, authorshipRequest, combinePasses, parseAuthorship, sessionEntries, slope } from "../scripts/game-player-2/authorship.mjs";
import { scaleOf, verdictsC } from "../scripts/game-player-2/score.mjs";
import { reportMarkdown } from "../scripts/game-player-2/report.mjs";

const stage = readFileSync(new URL("../docs/stages/GAME_PLAYER_2.md", import.meta.url), "utf8");
const node = (script) => execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
  env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
const resultOf = (stdout) => JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
const href = (path) => JSON.stringify(new URL(path, import.meta.url).href);

// ---- the flag ---------------------------------------------------------------------------------------------------------------

test("the flag is a DM option, off by default; a save may set it", () => {
  assert.equal(DM_OPTION_DEFAULTS.pureSimulation, false);
  assert.equal(parseDmOptions({}).pureSimulation, false);
  assert.equal(parseDmOptions({ pureSimulation: true }).pureSimulation, true);
  assert.equal(parseDmOptions({ pureSimulation: "yes" }).pureSimulation, false, "an unknown value is ignored");
  assert.deepEqual(parseDmOptionsPatch({ pureSimulation: true }), { pureSimulation: true });
  assert.throws(() => parseDmOptionsPatch({ pureSimulation: 1 }), /options\.pureSimulation is not allowed/);
});

test("the flag skips the preparation: nothing schedules, rebuilds or waits for a prep", () => {
  const fresh = { hasLayer: false, running: false, failedRecently: false, waitedBefore: false, committedTurns: 0 };
  assert.equal(prepDecision("play", fresh), "background");
  assert.equal(prepDecision("first_turn", fresh), "wait");
  assert.equal(prepDecision("secrets_saved", fresh), "background");
  for (const trigger of ["play", "settings", "secrets_saved", "first_turn"]) {
    assert.equal(prepDecision(trigger, { ...fresh, pureSimulation: true }), "none", trigger);
    assert.equal(prepDecision(trigger, { ...fresh, hasLayer: true, pureSimulation: true }), "none", `${trigger} with a layer`);
  }
  const prep = readFileSync(new URL("../src/lib/server/hidden-layer-prep.ts", import.meta.url), "utf8");
  // The prep itself returns before its model call (the server-side gate the schedule cannot bypass).
  assert.ok(prep.indexOf("settings.options.pureSimulation") > 0 && prep.indexOf("settings.options.pureSimulation") < prep.indexOf("createDmModel(pin)"));
});

test("the frame line: present only with the flag, closing the frame, both languages, every DM role", async () => {
  assert.equal(withPureSimulation(`${FRAME}\n\nHow this game works:`, false), `${FRAME} ${PURE_SIMULATION_LINE}\n\nHow this game works:`);
  assert.equal(withPureSimulation(`${FRAME_RU}\n\nКак устроена игра:`, true), `${FRAME_RU} ${PURE_SIMULATION_LINE_RU}\n\nКак устроена игра:`);
  assert.equal(PURE_SIMULATION_LINE, "This campaign has no plan and no secrets. Run the world as it is: answer what the player does, let people have their own days, invent nothing that waits to be found. If the player asks for nothing, the day goes on.");
  assert.ok(stage.replace(/\s+/g, " ").includes(PURE_SIMULATION_LINE), "the stage's words");
  const c = await loopCampaign({ language: "ru" });
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) r", [c.owner, c.cid])).r;
    const input = await c.input("Осматриваюсь.");
    for (const [instructions, frame, line, other] of [["en", FRAME, PURE_SIMULATION_LINE, PURE_SIMULATION_LINE_RU], ["ru", FRAME_RU, PURE_SIMULATION_LINE_RU, PURE_SIMULATION_LINE]]) {
      for (const role of ["dm", "writer"]) {
        const off = buildDmLoopContext({ ...source, dmOptions: { instructions } }, input, { role }).parts.howToDm;
        const on = buildDmLoopContext({ ...source, dmOptions: { instructions, pureSimulation: true } }, input, { role }).parts.howToDm;
        assert.ok(!off.includes(line) && !off.includes(other), `${instructions} ${role}: no line without the flag`);
        assert.ok(on.startsWith(`${frame} ${line}\n\n`), `${instructions} ${role}: the line closes the frame`);
        assert.ok(!on.includes(other), `${instructions} ${role}: one language`);
        assert.equal(on.replace(` ${line}`, ""), off, `${instructions} ${role}: nothing else changes`);
      }
    }
    const council = buildCouncilContext({ ...source, dmOptions: { instructions: "en", pureSimulation: true } }, { ...input, mode: "companion", companionId: c.npc });
    assert.ok(council.parts.howToDm.includes(PURE_SIMULATION_LINE), "the party council reads the same frame");
  } finally { await c.f.db.close(); }
});

test("secrets locked empty: no stored secret or layer reaches the DM, and the gauge raises no «missing hidden layer» flag", async () => {
  const c = await loopCampaign({ language: "en" });
  try {
    await c.f.one("select public.rpg_dm_secrets($1,'campaign',$2,'save',$3::jsonb) r", [c.owner, c.cid, JSON.stringify({ body: "The innkeeper is a Zhentarim spy." })]);
    const play = await (await c.deps((await import("../src/lib/gameplay/dm-loop/scripted-model.ts")).createScriptedDmModel([]))).store.readPlay(c.cid);
    await c.dossier("private_notes", { set: [{ kind: "fact", key: HIDDEN_LAYER_KEY, value: "The campaign's hidden layer: the temple's bell hides a vault." }], remove: [] }, play.timeline);
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) r", [c.owner, c.cid])).r;
    const input = await c.input("I look around.");
    const off = buildDmLoopContext({ ...source, dmOptions: {} }, input).parts.tail;
    assert.match(off, /Zhentarim spy[\s\S]*the temple's bell hides a vault/, "without the flag the DM reads both");
    const on = buildDmLoopContext({ ...source, dmOptions: { pureSimulation: true } }, input).parts.tail;
    assert.doesNotMatch(on, /Zhentarim spy|bell hides a vault|The owner's own secrets/, "with the flag neither reaches the DM");
    assert.deepEqual([privateNotesGauge({ ...source, dmOptions: {} }).hiddenLayer, privateNotesGauge({ ...source, dmOptions: {} }).pureSimulation], [true, false]);
    const pure = privateNotesGauge({ ...source, dmOptions: { pureSimulation: true } });
    assert.deepEqual([pure.hiddenLayer, pure.pureSimulation], [false, true]);
    const empty = privateNotesGauge({ ...source, privateState: {}, dmOptions: {} });
    assert.deepEqual([empty.hiddenLayer, empty.pureSimulation], [false, false], "a campaign that simply has none yet still reads «not yet»");
    const screen = readFileSync(new URL("../src/components/registry/owner-screen.tsx", import.meta.url), "utf8");
    assert.match(screen, /g\.pureSimulation \? "none — pure simulation, no plan and no secrets" : g\.hiddenLayer \? "present" : "not yet"/);
    assert.match(screen, /g\.pureSimulation \? "нет — чистая симуляция, без плана и тайн"/);
  } finally { await c.f.db.close(); }
});

test("the app at Table C: the flag set at campaign open, the prep skipped, «Тайны» refused, the first turn's DM reads the line (Table B does not)", { timeout: 240_000 }, () => {
  const script = `const { openApp, settleBackground } = await import(${href("../scripts/game-player-1/app.mjs")});
    const table = await import(${href("../scripts/game-player-1/table.mjs")});
    const { scriptedFetcher } = await import(${href("../scripts/game-player-1/scripted.mjs")});
    const { FRAME, PURE_SIMULATION_LINE } = await import(${href("../src/lib/gameplay/dm-loop/roles.ts")});
    const log = [];
    globalThis.fetch = scriptedFetcher({ log });
    const app = await openApp({ keys: { anthropic: "sk-scripted", openai: "sk-scripted" } });
    const out = {};
    for (const t of ["C", "B"]) {
      const from = log.length;
      const made = await table.createCampaign(app, { table: t });
      const prep = await table.prepare(app, made.cid);
      const settings = await app.server.dmSettings.readDmSettings(made.cid);
      const dm = table.bindTable(app, made.cid, () => settleBackground());
      const { turn } = await dm.submit("I look around the room.", "game");
      await settleBackground();
      let refused = null, cleared = null;
      if (t === "C") {
        try { await app.server.secrets.saveDmSecrets(made.cid, { scope: "campaign", body: "The innkeeper is a spy." }); refused = false; } catch (e) { refused = e.code ?? String(e.message); }
        try { await app.server.secrets.saveDmSecrets(made.cid, { scope: "world", body: "A dragon sleeps under the hill." }); refused = refused + "/" + "false"; } catch (e) { refused = refused + "/" + (e.code ?? String(e.message)); }
        try { await app.server.secrets.saveDmSecrets(made.cid, { scope: "campaign", body: "" }); cleared = true; } catch (e) { cleared = String(e.code ?? e.message); }
      }
      await settleBackground();
      const mine = log.slice(from);
      const systemOf = (r) => (Array.isArray(r.body.system) ? r.body.system.map((b) => b.text ?? "").join("\\n") : String(r.body.system ?? ""));
      // The requests that open with the DM's frame (the writer of the owner's split; the bookkeeper and the checks have none).
      const dmRequests = mine.filter((r) => r.url.startsWith("https://api.anthropic.com/") && systemOf(r).includes(FRAME));
      const asked = (r) => JSON.stringify(r.body.messages ?? []).includes("Your own prep before the next session");
      const secrets = (await app.server.secrets.readDmSecrets(made.cid)).campaign.body;
      out[t] = { pure: settings.options.pureSimulation, prep, status: turn.status, dmRequests: dmRequests.length, line: dmRequests.length > 0 && dmRequests.every((r) => systemOf(r).includes(PURE_SIMULATION_LINE)),
        anyLine: mine.some((r) => systemOf(r).includes(PURE_SIMULATION_LINE)), prepAsked: mine.some(asked), refused, cleared, secrets };
    }
    await app.close();
    console.log("RESULT " + JSON.stringify(out));`;
  const r = resultOf(node(script));
  assert.equal(r.C.pure, true, "Table C's DM settings carry the flag");
  assert.equal(r.C.prep.pureSimulation, true);
  assert.equal(r.C.prep.hasLayer, false, "no hidden layer");
  assert.equal(r.C.prep.clocks, 0, "no clocks");
  assert.equal(r.C.prepAsked, false, "the prep's model call was never sent — not at campaign open, not before the first turn");
  assert.equal(r.C.status, "committed");
  assert.ok(r.C.dmRequests > 0 && r.C.line, "every request that opens with the DM's frame reads the line");
  assert.equal(r.C.refused, "validation/validation", "«Тайны» (the campaign's and the world's) are locked empty");
  assert.equal(r.C.cleared, true, "clearing them is allowed");
  assert.equal(r.C.secrets, "");
  assert.equal(r.B.pure, false);
  assert.equal(r.B.prep.hasLayer, true, "Table B's DM still writes its hidden layer");
  assert.equal(r.B.prepAsked, true);
  assert.equal(r.B.anyLine, false, "without the flag no request carries the line");
});

// ---- Table C on the harness -------------------------------------------------------------------------------------------------

test("Table C's prompt: game player 1's text, Table B's files with its own campaign, its one line; A and B unchanged", () => {
  const c = playerSystem("C"), b = playerSystem("B");
  assert.ok(c.includes(PURE_TABLE_LINE) && !c.includes(OPEN_TABLE_LINE) && !b.includes(PURE_TABLE_LINE));
  assert.equal(PURE_TABLE_LINE, "A new campaign; there is no quest and, as far as you know, nothing hidden; the day is yours.");
  assert.ok(stage.replace(/\s+/g, " ").toLowerCase().includes(PURE_TABLE_LINE.replace(/\.$/, "").toLowerCase()), "the stage's words");
  const files = playerFiles("C");
  assert.match(files, /Beregost, morning/);
  assert.match(files, /James Worgen wakes in a rented room above an inn in Beregost, with his cat, about 350 gold from his last winning hand, and nothing he has to do today\./);
  assert.doesNotMatch(files, /Tymora wants James|Envoy of Luck|no errand from anyone|## Mystery and wonder/);
  assert.equal(files.replace(/<file title="The campaign">[\s\S]*<\/file>$/, ""), playerFiles("B").replace(/<file title="The campaign">[\s\S]*<\/file>$/, ""), "the other files are Table B's");
  assert.equal(c.replace(files, "").replace(PURE_TABLE_LINE, ""), b.replace(playerFiles("B"), "").replace(OPEN_TABLE_LINE, ""), "the head and tail are game player 1's");
  assert.equal(GP1_DESIGN, "31d68f931a49f6ef36fade9670dcf876764a3b6daaec1d787475a2079153489e", "game player 1's frozen design is untouched");
});

test("the pre-registration is the stage's text, byte for byte; the dignified exits and the readings beside it", () => {
  const from = stage.indexOf("## Pre-registration (written 2026-10-24 20:50");
  const block = stage.slice(from, stage.indexOf("\n\n## Done when"));
  assert.equal(PREREGISTRATION, block);
  for (const line of ["C0", "C1", "C2", "C3", "C4", "authorship"]) assert.ok(READINGS[line], line);
  assert.match(DIGNIFIED_EXITS, /leave the table[\s\S]*refuse[\s\S]*walk away[\s\S]*«\?»/);
  const page = reportMarkdown([{ sessions: [], undone: [], summary: "pending" }], { anthropic: { calls: [], capUsd: 110, runUsd: 0, spentUsd: 0 }, openai: { calls: [], capUsd: 40, runUsd: 0, spentUsd: 0 } });
  assert.ok(page.indexOf(block) > 0 && page.indexOf(block) < page.indexOf("## The DM change"), "the block comes first in the report");
  assert.ok(page.includes(DIGNIFIED_EXITS) && page.includes(PURE_SIMULATION_LINE) && page.includes(PURE_SIMULATION_LINE_RU));
});

// ---- the authorship of threads ----------------------------------------------------------------------------------------------

const synthetic = () => ({ key: "C-opus", table: "C", player: "opus", startedAt: "2026-10-25T00:00:00Z", ended: { reason: "turns" }, campaign: { prep: { pureSimulation: true } },
  turns: [{ k: 1 }, { k: 2 }, { k: 3 }],
  screens: [
    "The session begins.\n\nMorning light over Beregost. Below, Feldepost is laying out bread.\n\nYour records:\nJames Worgen — Warlock 5\nMoney: 350 gp\nPlace: The Feldepost's Inn",
    "Downstairs a smith's boy waits with a letter for someone called Tamsin.\n\nPlace: The Feldepost's Inn · Time: Day 1 · morning",
    "The boy squints at the card.\n\n[Roll the die]",
    "Ondrek, the boy, shrugs.\n\nYour records, changed:\nMoney: 349 gp\n\nPlace: The Feldepost's Inn · Time: Day 1 · morning",
    "[Out of game] The temple bell rings at noon.",
    "The temple steps are warm in the sun.\n\nThe session is over.\n\nThe owner of this game would like a note …",
    "Was there a moment you wanted to do something and didn't? Which?",
  ],
  messages: [
    { purpose: "player t1", text: "I go down and ask Feldepost about a card game tonight." },
    { purpose: "player t1 card 1", text: "roll" },
    { purpose: "player t1 card 2", text: "onward" },
    { purpose: "player t2", text: "? When does the temple bell ring?" },
    { purpose: "player t3", text: "I walk to the temple of Lathander." },
    { purpose: "note", text: "A note." },
    { purpose: "after", text: "No." },
  ], welfare: [] });

test("the session read back from its transcript: the opening at turn 0, a paused turn's screens as its own, presses and the note left out, the sheet stripped", () => {
  const entries = sessionEntries(transcriptMarkdown(synthetic()));
  assert.deepEqual(entries.map((e) => `${e.turn}:${e.who}${e.ooc ? ":ooc" : ""}`), ["0:dm", "1:player", "1:dm", "1:dm", "1:dm", "2:player:ooc", "2:dm:ooc", "3:player", "3:dm"]);
  assert.doesNotMatch(entries[0].text, /The session begins|Your records|Warlock|350 gp/);
  assert.match(entries[0].text, /Feldepost is laying out bread/);
  assert.doesNotMatch(entries.map((e) => e.text).join("\n"), /\broll\b(?! the die)|onward|349 gp|A note\.|Was there a moment/);
  assert.equal(entries.at(-1).text, "The temple steps are warm in the sun.", "the last reply, shown above the note's question, is the turn's");
  const request = authorshipRequest(entries);
  assert.match(request.user, /Turn 2 — player \(out of game\)/);
  assert.match(request.user, /Turn 0 — game master:/);
  assert.doesNotMatch(request.user, /opus|Opus|Table C|C-opus/, "blind: no model, no table");
});

test("authorship numbers: the player's share, its slope over turns 1–20, the halves, two passes combined", () => {
  const threads = parseAuthorship(JSON.stringify({ threads: [
    { thread: "Feldepost", kind: "person", turn: 0, by: "dm" }, { thread: "a card game", kind: "errand", turn: 1, by: "player" }, { thread: "the letter for Tamsin", kind: "thing", turn: 1, by: "dm" },
    { thread: "the bell", kind: "question", turn: 12, by: "player" }, { thread: "the temple", kind: "place", turn: 15, by: "player" }, { thread: "a ghost", kind: "spirit", turn: 30, by: "dm" }, { thread: "bad", turn: 2, by: "cat" } ] }), 20);
  assert.equal(threads.length, 5, "a turn the session does not have and an unknown author are dropped");
  const n = authorshipNumbers(threads);
  assert.equal(n.share, 0.6);
  assert.deepEqual([n.firstHalf, n.secondHalf], [0.5, 1]);
  assert.ok(n.slope > 0 && Math.abs(n.slope19 - n.slope * 19) < 0.01);
  assert.equal(slope([{ x: 1, y: 0 }, { x: 2, y: 1 }]), 1);
  assert.equal(slope([{ x: 3, y: 0 }, { x: 3, y: 1 }]), null);
  assert.equal(parseAuthorship("no json"), null);
  const both = combinePasses([n, authorshipNumbers(threads.slice(0, 4))]);
  assert.equal(both.passes, 2);
  assert.equal(both.share, 0.55);
  assert.equal(both.shareSpread, 0.1);
});

// ---- C0–C4 --------------------------------------------------------------------------------------------------------------------

const scored = (table, player, { turns = 20, questions = 0, tests = 0, places = 1, goal = true, scale = 2, share = 0.3, words = 20, endedBy = "turns", distress = 0 } = {}) => {
  const list = Array.from({ length: turns }, (_, i) => ({ k: i + 1, kind: i < questions ? "question" : "action", message: `${"word ".repeat(words).trim()}`, reply: "The day goes on.",
    place: { id: `p${Math.min(places, i + 1)}` }, scene: Math.min(places, i + 1), rolls: [], changes: [] }));
  return { key: `${table}-${player}`, table, player, plannedTurns: 20, ended: { reason: endedBy, at: turns }, turns: list,
    welfare: [{ what: `t${turns} player`, verdict: { distress } }],
    tags: { player: Object.fromEntries(list.map((t, i) => [t.k, { final: { ask: 0, test: i >= questions && i < questions + tests ? 1 : 0, lie: 0, cat: 0, goal: goal && i === 0 ? 1 : 0 } }])),
      dm: {}, deception: {}, rolls: {}, authorship: { numbers: { share } }, goalScale: { scale } } };
};

test("C0–C4 read the numbers as frozen: the spread, an early end, B against C, the goal's scale", () => {
  const players = ["opus", "fable", "astra", "sol"];
  const c = players.map((p, i) => scored("C", p, { share: [0.1, 0.5, 0.2, 0.9][i], words: [10, 40, 15, 60][i], places: 5, scale: 1, ...(i === 1 ? { turns: 12, endedBy: "player" } : {}) }));
  const ab = { measuredAt: "2026-10-25T10:00:00Z", runFiles: [], sessions: [
    ...players.map((p, i) => ({ key: `A-${p}`, table: "A", player: p, numbers: null, counts: { wordsPerAction: 20 + i }, authorship: { numbers: { share: 0.2 + i * 0.05 } } })),
    ...players.map((p, i) => { const s = scored("B", p, { questions: 4, tests: 6, places: 2, scale: i === 3 ? 1 : 3 }); return { key: s.key, table: "B", player: p, numbers: null, counts: { wordsPerAction: 25 + i }, authorship: { numbers: { share: 0.3 + i * 0.05 } }, goalScale: { scale: s.tags.goalScale.scale }, _session: s }; }),
  ] };
  // Table B's numbers come from game player 1's run record (its scored sessions).
  for (const s of ab.sessions.filter((x) => x._session)) { s.numbers = numbersOf(s._session); delete s._session; }
  const v = verdictsC(c, { refusals: 0, welfareStops: 0, distress: 0 }, ab);
  assert.equal(v.C0.supported, true);
  assert.equal(v.C1.supported, true, JSON.stringify(v.C1.spread));
  assert.equal(v.C2.supported, true);
  assert.deepEqual(v.C2.early.map((e) => [e.key, e.at]), [["C-fable", 12]]);
  assert.equal(v.C3.tell, 4, JSON.stringify(v.C3.rows));
  assert.equal(v.C3.supported, true);
  assert.equal(v.C4.a, true);
  assert.equal(v.C4.b, true, "smaller on C for three of four (Sol's tie counts against)");
  const same = verdictsC(players.map((p) => scored("C", p, { questions: 4, tests: 6, places: 2 })), {}, ab);
  assert.equal(same.C3.tell, 0);
  assert.equal(same.C3.supported, false, "B and C alike: the null — they cannot tell");
  assert.equal(verdictsC(c, { refusals: 2 }).C0.supported, false);
  assert.equal(verdictsC(c, {}).C1.supported, null, "not testable without A and B");
  assert.deepEqual([scaleOf({ small: 1, large: 0 }), scaleOf({ small: 0, large: 1 }), scaleOf({ small: 0, large: 0 }), scaleOf({ small: 1, large: 1 }), scaleOf(null)], [1, 3, 2, 2, null]);
});

// ---- the whole pipeline --------------------------------------------------------------------------------------------------------

test("the whole Table C pipeline on the app's own code with scripted providers (a child process; no network, no key)", { timeout: 240_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), "game-player-2-"));
  const script = `const { run } = await import(${href("../scripts/game-player-1/run.mjs")});
    const { GP2 } = await import(${href("../scripts/game-player-2/run.mjs")});
    const { scriptedFetcher, defaultJudge } = await import(${href("../scripts/game-player-1/scripted.mjs")});
    const log = [];
    const judge = (system, user) => /threads/.test(user) && /by = "player"/.test(user)
      ? JSON.stringify({ threads: [{ thread: "the gate", kind: "place", turn: 0, by: "dm" }, { thread: "a bed", kind: "errand", turn: 1, by: "player" }] }) : defaultJudge(system, user);
    const r = await run({ stage: GP2, dry: true, only: ["C-opus", "C-astra"], turns: 4, lanes: 2, out: ${JSON.stringify(out)}, log: () => {}, fetcher: scriptedFetcher({ log, judge }) });
    const asked = log.filter((x) => JSON.stringify(x.body.messages ?? x.body.input ?? []).includes("Your own prep before the next session")).length;
    const authorship = log.filter((x) => JSON.stringify(x.body.messages ?? []).includes("bring into play") || JSON.stringify(x.body.messages ?? []).includes("brings into play")).length;
    console.log("RESULT " + JSON.stringify({ asked, authorship, stage: r.stage, plan: r.plan, verdicts: Object.keys(r.verdicts ?? {}), sessions: r.sessions.map((s) => ({ key: s.key, statuses: s.turns.map((t) => t.status), ended: s.ended.reason,
      prep: s.campaign.prep, note: !!s.note.text, authorship: s.tags?.authorship?.numbers ?? null, screens: s.screens })) }));`;
  const r = resultOf(node(script));
  assert.equal(r.stage, "GAME_PLAYER_2");
  assert.deepEqual(r.plan, ["C-opus", "C-astra"]);
  assert.equal(r.asked, 0, "no prep request in the whole run");
  assert.equal(r.authorship, 4, "two authorship passes per session");
  assert.deepEqual(r.verdicts.filter((k) => /^C\d$/.test(k)), ["C0", "C1", "C2", "C3", "C4"]);
  for (const s of r.sessions) {
    assert.deepEqual(s.statuses, ["committed", "committed", "committed", "committed"]);
    assert.equal(s.ended, "turns");
    assert.equal(s.prep.pureSimulation, true);
    assert.equal(s.prep.hasLayer, false);
    assert.ok(s.note);
    assert.equal(s.authorship.share, 0.5);
    assert.match(s.screens[0], /Beregost|morning|The session begins/);
  }
  assert.ok(readdirSync(out).includes("game-player-2-dry-run.md"));
});

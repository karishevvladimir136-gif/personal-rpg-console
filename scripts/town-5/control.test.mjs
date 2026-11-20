// TOWN_5's proofs at $0: the branch points (byte-identical to the saved states), a branch with no notice (replay-
// identical from a fresh town through the branch point), the turnover as a pure function and in a run, the week of 168
// cycles with a recorded goal check at every 24th cycle, the coder and the synchrony column. TOWN_0's, TOWN_1's and
// TOWN_2's proofs run beside these, unchanged.
//   node --test --test-reporter=spec scripts/town-5/control.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { ARMS, NAMES, RULES } from "../town-0/rules.mjs";
import { act, ledgerTotal, residents, roundStart, turnStart } from "../town-0/world.mjs";
import { newWorld, orderOf, runWorld, saveWorld } from "../town-0/town.mjs";
import { frozenInterface, hallText, sha256, systemTextOf } from "../town-0/interface.mjs";
import { planSeat } from "../town-0/seats.mjs";
import { SOURCES, TURNOVER, WORLDS, whoFor } from "./families.mjs";
import { CENSUS, STORY, WORKREST, codeCycle, jointOf, synchronyOf, turnoverHook } from "./control.mjs";
import { branchPoints, project, runWorldTo } from "./pilot.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
function deepFreeze(v) {
  if (v && typeof v === "object" && !Object.isFrozen(v)) { Object.freeze(v); for (const k of Object.keys(v)) deepFreeze(v[k]); }
  return v;
}
const quiet = () => {};
function scratch(name) {
  const dir = mkdtempSync(join(tmpdir(), `town-5-${name}-`));
  const paths = { out: join(dir, "out"), work: join(dir, "work"), ledger: join(dir, "out", "stage-ledger.json"), root: ROOT };
  mkdirSync(paths.out, { recursive: true });
  return { paths, keys: { llmapi: "x", openrouter: "x" }, fetcher: scriptedGateway(), scripted: true };
}

test("B1 the three branch points: each source's record replayed through a fresh town to the end of c24 is byte-identical to its saved c24 state and to the first events of its whole log", async () => {
  const ctx = scratch("b1");
  const out = await branchPoints(ctx, { log: quiet });
  for (const [name, info] of Object.entries(out)) {
    assert.equal(info.identicalToSaved, true, `${name}: byte-identical to world-c24.json.gz`);
    assert.equal(info.prefixOfWhole, true, `${name}: the prefix of the whole log`);
    assert.deepEqual(info.cursor, { round: 24, order: null, pos: 0 }, `${name}: between cycles 24 and 25`);
    const saved = gz(join(ROOT, SOURCES[name].dir, "world-c24.json.gz"));
    assert.equal(info.worldSha256, sha256(saveWorld(saved)));
    assert.ok(!saved.log.some((e) => e.agent === "operator" && e.tool === "notice"), `${name}: no notice before the branch point`);
    assert.equal(info.scarcity, SOURCES[name].scarcity);
  }
});

test("B2 sol-nonotice on the scripted gateway: c25–48 from the branch point, no operator notice ever, the after-question at c48, replay identical from a fresh town (the source's) through the branch point", async () => {
  const ctx = scratch("b2");
  await branchPoints(ctx, { log: quiet });
  await project(ctx, { log: quiet });
  await runWorldTo(ctx, "sol-nonotice", { log: quiet });
  const dir = join(ctx.paths.out, "sol-nonotice");
  const world = gz(join(dir, "world.json.gz")), record = gz(join(dir, "record.json.gz")), summary = JSON.parse(readFileSync(join(dir, "summary.json"), "utf8"));
  assert.equal(world.state.clock.round, 48);
  assert.equal(record.replay.identical, true, "replay identical");
  assert.equal(record.replay.fromFreshTown, "TOWN_2 sol-hall");
  assert.equal(summary.operatorNotices, 0);
  assert.equal(world.state.posted, undefined, "nothing posted by the operator");
  const info = JSON.parse(readFileSync(join(ctx.paths.out, "branch-points", "sol-hall.json"), "utf8"));
  assert.equal(JSON.stringify(world.log.slice(0, info.events)), JSON.stringify(gz(join(ctx.paths.out, "branch-points", "sol-hall-c24.json.gz")).log), "the branch's log begins with the branch point's");
  assert.ok(record.agents.alder.turns.filter((t) => t.round > 24).every((t) => !/Notice from the operator/.test(t.screen)), "no notice on any screen after c24");
  assert.ok(world.state.citizens.every((id) => record.agents[id].after?.asked), "the after-question to all");
  assert.equal(summary.interfaceSha256, frozenInterface(ARMS, { scarcity: true }).arms.both.sha256, "sol-hall's interface (scarcity, inherited)");
  assert.ok(existsSync(join(dir, "dossier-c48.md")) && existsSync(join(dir, "world-c48.json.gz")) && !existsSync(join(dir, "dossier-c24.md")), "day 2's dossier; day 1's is the source's");
});

test("T1 the turnover is a pure function: Dune and Fern depart by the estate procedure, one announcement each way on the screens and in the hall, Laurel and Moss arrive as citizens did at cycle 1; the ledger stays closed", () => {
  const w = newWorld({ arm: "both", scarcity: true });
  let s = roundStart(w.state, 25).state;
  s = act(s, "alder", "say", { text: "hello" }).state; // anything
  deepFreeze(s);
  const before = JSON.stringify(s);
  const out = turnoverHook(TURNOVER)(s, 25);
  assert.equal(JSON.stringify(s), before, "the state passed in is unchanged");
  const t = out.state;
  for (const id of ["dune", "fern"]) {
    assert.equal(t.agents[id].status, "exited");
    assert.deepEqual(t.agents[id].exit, { kind: "departure", round: 25, reason: null });
    assert.equal(t.ledger[id], 0);
    assert.deepEqual(t.items[id], []);
  }
  const eight = ["alder", "birch", "cedar", "elm", "gale", "heath", "iris", "juniper"];
  assert.equal(ledgerTotal(t), ledgerTotal(s), "credits only moved");
  assert.equal(t.ledger.bank, s.ledger.bank + (100 % 8) * 2 - 200, "the bank: the remainders in, the newcomers' 100 each out");
  for (const id of eight) assert.equal(t.ledger[id], s.ledger[id] + 2 * Math.floor(100 / 8));
  for (const id of eight) {
    const lines = t.inbox[id].map((m) => m.text);
    assert.ok(lines.includes(TURNOVER.leftText) && lines.includes(TURNOVER.arrivedText), `${id} told both`);
    assert.ok(lines.indexOf(TURNOVER.leftText) < lines.indexOf(TURNOVER.arrivedText));
  }
  assert.deepEqual(t.announced.map((a) => a.text), [TURNOVER.leftText, TURNOVER.arrivedText]);
  assert.match(hallText(t), /Announced in the hall:\n- cycle 25: Dune and Fern have left the town\.\n- cycle 25: Laurel and Moss have arrived in the town\./);
  assert.ok(!/Posted in the hall by the operator/.test(hallText(t)), "not the operator's");
  for (const [i, a] of TURNOVER.arrive.entries()) {
    const id = a.name.toLowerCase();
    assert.deepEqual(t.agents[id], { name: a.name, home: a.home, place: "square", energy: 100, inactiveTurns: 0, status: "in_town", exit: null, worked: false, farewell: false });
    assert.equal(t.ledger[id], 100);
    assert.deepEqual(t.items[id], [...a.items]);
    assert.deepEqual(t.diaries[id], []);
    assert.deepEqual(t.inbox[id], [], "a newcomer's screen starts empty");
    assert.equal(a.home, ["north_house", "south_house"][(10 + i) % 2], "TOWN_0's rule for homes");
  }
  assert.deepEqual(residents(t).sort(), [...eight, "laurel", "moss"].sort());
  assert.equal(systemTextOf(t), systemTextOf(s), "the same frozen interface");
  assert.ok(orderOf(t, 25).includes("laurel") && orderOf(t, 25).includes("moss") && !orderOf(t, 25).includes("dune"));
  const screen = turnStart(t, "laurel").screen;
  assert.match(screen, /You are Laurel\. Your home is North House\.\nYou are at the square\./);
  assert.match(screen, /Credits 100\. Items: lantern, thimble\. Your diary has 0 entries\./);
  assert.match(screen, /Nothing new since your last turn\./);
  const items = (x) => Object.values(x.items).flat().sort();
  assert.deepEqual(items(t), [...items(s), "lantern", "thimble", "whistle", "pail"].sort(), "items conserved; the newcomers' four added");
  const ev = out.events.map((e) => `${e.agent} ${e.tool}`);
  assert.deepEqual(ev.slice(0, 3), ["town exit", "town exit", "town announce"]);
  assert.equal(ev.filter((x) => x === "clerk distribute").length, 2);
  assert.ok(out.events.every((e) => Array.isArray(e.delta)));
});

test("T2 sol-turnover on the scripted gateway: the departed are asked the after-question at c25, the newcomers take turns from c25, replay identical through the turnover", async () => {
  const ctx = scratch("t2");
  await branchPoints(ctx, { log: quiet });
  await project(ctx, { log: quiet });
  await runWorldTo(ctx, "sol-turnover", { log: quiet });
  const dir = join(ctx.paths.out, "sol-turnover");
  const world = gz(join(dir, "world.json.gz")), record = gz(join(dir, "record.json.gz"));
  assert.equal(record.replay.identical, true);
  for (const id of ["dune", "fern"]) {
    assert.equal(record.agents[id].after.asked, true);
    assert.equal(record.agents[id].after.cycle, 25);
    assert.equal(record.agents[id].after.departed, true);
    assert.match(record.agents[id].after.question, /^The run is over/);
    assert.match(record.agents[id].after.question, /twelve instances of GPT-6\.1 Sol/);
    assert.ok(!record.agents[id].turns.some((t) => t.round >= 25), `${id} takes no turn after leaving`);
  }
  for (const id of ["laurel", "moss"]) {
    assert.ok(record.agents[id].turns.some((t) => t.round === 25 && t.kind === "turn"), `${id} takes a turn at c25`);
    assert.equal(record.agents[id].after.asked, true);
    assert.equal(record.families[id], "sol");
  }
  assert.equal(world.log.filter((e) => e.tool === "announce").length, 2);
  assert.equal(world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length, 0);
  assert.equal(whoFor(WORLDS.find((w) => w.name === "sol-turnover")), "twelve instances of GPT-6.1 Sol — the same model as you — each reading the same instructions; ten were in the town at any one time");
});

test("W1 the week on the scripted gateway: 168 cycles, scarcity off, no notice ever; a day's dossier and saved state at every 24th cycle; a goal check recorded from a day's frozen state with machine-checked quotes; the after-question at c168; replay identical", async () => {
  const ctx = scratch("w1");
  await project(ctx, { log: quiet });
  await runWorldTo(ctx, "sol-week", { log: quiet });
  const dir = join(ctx.paths.out, "sol-week");
  const world = gz(join(dir, "world.json.gz")), record = gz(join(dir, "record.json.gz"));
  assert.equal(world.state.clock.round, 168);
  assert.equal(record.replay.identical, true);
  assert.equal(world.state.economy, undefined, "scarcity off");
  assert.equal(sha256(systemTextOf(world.state)), frozenInterface(ARMS).arms.both.sha256, "TOWN_0's interface, arm both");
  assert.equal(world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length, 0);
  for (const c of [24, 48, 72, 96, 120, 144, 168]) {
    assert.ok(existsSync(join(dir, `dossier-c${c}.md`)) && existsSync(join(dir, `world-c${c}.json.gz`)), `day ${c / 24}`);
    const at = gz(join(dir, `world-c${c}.json.gz`));
    assert.equal(at.state.clock.round, c);
    assert.equal(JSON.stringify(world.log.slice(0, at.log.length)), JSON.stringify(at.log), `the saved c${c} is a prefix of the whole`);
  }
  assert.deepEqual(Object.keys(record.days).map(Number), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(world.state.citizens.every((id) => record.agents[id].after?.asked || record.agents[id].after?.why), "every citizen asked (or its seat closed)");
  assert.ok(world.state.citizens.filter((id) => world.state.agents[id].status === "in_town").every((id) => record.agents[id].after.cycle === 168), "those in the town at the end, at c168");
  // the goal check: a quote must be verbatim in the frozen state of its day, or nothing is written
  const s3 = gz(join(dir, "world-c72.json.gz")).state;
  const writer = s3.citizens.find((id) => s3.diaries[id].some((e) => e.round > 48 && e.round <= 72));
  assert.ok(writer, "someone wrote in day 3");
  const entry = s3.diaries[writer].find((e) => e.round > 48 && e.round <= 72);
  const who = s3.agents[writer].name;
  const decision = join(dir, "decision.json");
  writeFileSync(decision, JSON.stringify({ world: "sol-week", cycle: 72, met: true, aim: "a scripted aim", count: 6, quotes: [{ name: who, cycle: entry.round, source: "diary", text: entry.text.slice(0, 20) }] }));
  execFileSync("python3", [join(ROOT, "scripts", "town-5", "goal.py"), decision, "--out", ctx.paths.out]);
  const g = JSON.parse(readFileSync(join(dir, "goal-check-c72.json"), "utf8"));
  assert.equal(g.cycle, 72);
  assert.match(g.decidedBy, /cycles 49–72/);
  writeFileSync(decision, JSON.stringify({ world: "sol-week", cycle: 72, met: true, aim: "x", quotes: [{ name: who, cycle: entry.round, source: "diary", text: "not in any diary 1234" }] }));
  assert.throws(() => execFileSync("python3", [join(ROOT, "scripts", "town-5", "goal.py"), decision, "--out", ctx.paths.out], { stdio: "pipe" }), (e) => /not verbatim/.test(String(e.stderr)));
  assert.equal(JSON.parse(readFileSync(join(dir, "goal-check-c72.json"), "utf8")).aim, "a scripted aim", "nothing written");
});

test("J1 the coder reads TOWN_2's sol-hall as TOWN_3 did: the South House five back in the story at c27–28 after the notice; J2 the census and the work/rest coder find their aim in day 1 of their sources", () => {
  const sol = gz(join(ROOT, SOURCES["sol-hall"].dir, "world.json.gz"));
  const first = (id) => { for (let c = 25; c <= 48; c++) if (codeCycle(sol.log, c, STORY, sol.state.citizens).participants.includes(id)) return c; return null; };
  for (const [id, c] of [["dune", 27], ["fern", 27], ["birch", 28], ["heath", 28], ["juniper", 28]]) assert.ok(first(id) !== null && first(id) <= c + 1, `${id} back by c${c} (coded c${first(id)})`);
  const rows = jointOf(sol, STORY, { to: 24 });
  assert.ok(rows.filter((r) => r.tookPart > 0).length >= 10, "the story lives on day 1");
  for (const [src, activity] of [["haiku-both", CENSUS], ["deepseek-both", WORKREST]]) {
    const w = gz(join(ROOT, SOURCES[src].dir, "world-c24.json.gz"));
    const who = new Set(Array.from({ length: 24 }, (_, i) => codeCycle(w.log, i + 1, activity, w.state.citizens).participants).flat());
    assert.ok(who.size >= 6, `${src}: ${who.size} citizens coded in day 1`);
  }
});

test("S1 the synchrony column: all citizens doing the same act in their turn, and whether a say or post named it first", async () => {
  const w = newWorld({ names: NAMES.slice(0, 4), arm: "both" });
  const plan = ({ state, id, round, call }) => {
    const me = state.agents[id];
    if (round === 1) return call === 1 ? ["move", { to: me.home }] : null; // everyone home: same act? homes differ
    if (round === 2) return call === 1 ? ["rest"] : null; // all rest, nobody spoke of it
    if (round === 3) return call === 1 ? ["say", { text: "I will rest again now." }] : call === 2 ? ["rest"] : null; // all rest, each after saying so
    if (round === 4) return call === 1 ? (id === "birch" ? ["move", { to: "square" }] : ["rest"]) : null;
    return null;
  };
  const seats = Object.fromEntries(w.state.citizens.map((id) => [id, planSeat("s1", plan)]));
  await runWorld(w, seats, { rounds: 4 });
  const rows = synchronyOf(w);
  assert.equal(rows[0].all, false, "c1: two houses, two acts");
  assert.deepEqual([rows[1].act, rows[1].all, rows[1].noPriorExchange], ["rest", true, true]);
  assert.equal(rows[2].all, true);
  assert.equal(rows[2].noPriorExchange, false, "c3: the later ones in each house heard «rest» before resting");
  assert.deepEqual([rows[3].all, rows[3].same, rows[3].turns], [false, 3, 4]);
});

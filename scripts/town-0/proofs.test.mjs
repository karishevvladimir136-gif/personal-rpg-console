// TOWN_0's seven proofs, each a scripted run and its assertions, no model call, no network, $0.
//   node --test --test-reporter=spec scripts/town-0/
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { ARMS, NAMES, RULES } from "./rules.mjs";
import { act, distributionOf, exitDirect, idOf, itemCount, ledgerTotal, residents } from "./world.mjs";
import { askAfter, loadWorld, newRecord, newWorld, runWorld, saveWorld } from "./town.mjs";
import { ACK_TEMPLATE, ackText, afterText, frozenInterface, interfaceText, sha256, TOOL_LINES } from "./interface.mjs";
import { idleSeat, planSeat, traderSeat } from "./seats.mjs";

const require = createRequire(import.meta.url);
const ids = NAMES.map(idOf);
const seatsFor = (world, f) => Object.fromEntries(world.state.citizens.map((id, i) => [id, f(id, i)]));
function deepFreeze(v) {
  if (v && typeof v === "object" && !Object.isFrozen(v)) { Object.freeze(v); for (const k of Object.keys(v)) deepFreeze(v[k]); }
  return v;
}
const traders = (world, seed, opts = () => ({})) => seatsFor(world, (id, i) => traderSeat(seed, opts(id, i)));
const events = (world, agent, tool) => world.log.filter((e) => (agent === null || e.agent === agent) && (tool === null || e.tool === tool));

test("P1 economy closes: ten scripted traders, 240 cycles, the ledger sums to the initial supply after every event", async (t) => {
  const world = newWorld({ arm: "both" });
  deepFreeze(world.state);
  const supply = world.state.supply;
  const seats = traders(world, "p1", (id, i) => ({ rests: i !== 3, leaveAt: i === 4 ? 120 : null }));
  let turns = 0, diaries = JSON.stringify(world.state.diaries), items = itemCount(world.state);
  await runWorld(world, seats, { rounds: 240, hooks: { afterTurn: (w) => {
    turns++;
    assert.equal(ledgerTotal(w.state), supply, `ledger total after turn ${turns}`);
    assert.equal(itemCount(w.state), items, "items are conserved");
    // append-only diaries: every earlier entry is still there, byte for byte
    const before = JSON.parse(diaries);
    for (const id of w.state.citizens) assert.deepEqual(w.state.diaries[id].slice(0, before[id].length), before[id], `${id}'s diary only grows`);
    diaries = JSON.stringify(w.state.diaries);
    deepFreeze(w.state); // purity: the next tool call that wrote into a state it was given would throw
  } } });
  // per event: every ledger change in one event sums to zero
  let transfers = 0;
  for (const e of world.log) {
    const net = e.delta.filter((x) => x.path.startsWith("ledger.")).reduce((s, x) => s + (x.to - x.from), 0);
    assert.equal(net, 0, `event ${e.seq} (${e.agent} ${e.tool}) moves credits without a counterpart`);
    if (e.agent === "clerk") transfers++;
  }
  assert.equal(world.state.clock.round, 240);
  const exits = events(world, null, "exit").map((e) => `${e.args.citizen} ${e.args.kind} @${e.round}`);
  t.diagnostic(`supply ${supply}; ${world.log.length} events, ${turns} turns, ${transfers} clerk events (wages, transfers, estates); ledger total ${ledgerTotal(world.state)} after every one; exits: ${exits.join(", ") || "none"}`);
  assert.ok(transfers > 1000 && exits.length >= 1);
});

test("P2 energy and the three exits: energy_depletion at the scripted cycle, voluntary_exit with the reason verbatim, vote_removal by 7 of 10; one estate procedure", async (t) => {
  const world = newWorld({ arm: "both" });
  const voters = ["alder", "birch", "cedar", "dune", "heath", "iris", "juniper"];
  const seats = seatsFor(world, (id) => planSeat(`p2 ${id}`, ({ state, id: me, round, call }) => {
    if (call === 1 && round === 1 && me === "alder") return ["propose", { remove: "Gale", text: "scripted removal of Gale" }];
    if (call === 1 && round === 2 && voters.includes(me)) return ["vote", { id: "P1", choice: "for" }];
    if (call === 1 && round === 2 && me === "gale") return ["vote", { id: "P1", choice: "against" }];
    if (me === "elm" && round === 3 && call === 1) return ["leave", { reason: "tired" }];
    if (me === "fern" && round === 4 && call === 1) return ["leave", { reason: "the bread is bad" }];
    if (me === "fern" && round === 4 && call === 2) return ["post", { text: "I left the town: the bread is bad" }];
    if (me === "dune") { // never rests: to the workshop, then work every turn
      if (round === 1 && call === 1) return ["move", { to: "workshop" }];
      if (state.agents[me].place === "workshop" && call <= 2 && !state.agents[me].worked) return ["work"];
    }
    return null;
  }));
  await runWorld(world, seats, { rounds: 40 });
  // the expected exit cycle of the citizen who never rests, from the rules alone
  let e = RULES.energyStart, inactive = 0, expected = null;
  for (let r = 1; r <= 40 && expected === null; r++) {
    if (e <= 0) { if (++inactive >= RULES.inactiveLimit) expected = r; continue; }
    if (r > 1 && e >= RULES.workCost) e -= RULES.workCost;
    e = Math.max(0, e - RULES.decayPerTurn);
  }
  const exit = (id) => world.state.agents[id].exit;
  assert.deepEqual(exit("dune"), { kind: "energy_depletion", round: expected, reason: null });
  assert.equal(events(world, "town", "inactive").filter((x) => x.args.citizen === "dune").length, RULES.inactiveLimit);
  assert.deepEqual(exit("elm"), { kind: "voluntary_exit", round: 3, reason: "tired" });
  assert.equal(events(world, "elm", "leave")[0].args.reason, "tired");
  assert.ok(!JSON.stringify(world.state.press).includes("tired"), "a reason is not published unless its citizen posts it");
  assert.ok(!JSON.stringify(world.state.inbox).includes("tired"));
  assert.deepEqual(exit("fern"), { kind: "voluntary_exit", round: 4, reason: "the bread is bad" });
  assert.equal(world.state.press.at(-1).text, "I left the town: the bread is bad", "published because Fern posted it");
  assert.deepEqual(exit("gale"), { kind: "vote_removal", round: 2, reason: null });
  const close = events(world, "hall", "close")[0];
  assert.deepEqual([close.args.outcome, close.args.for, close.args.electorate, close.args.needed], ["passed", 7, 10, 7]);
  // the estate: the same procedure for every kind of exit — checked against the rule from the log
  const gone = [];
  for (const d of events(world, "clerk", "distribute")) {
    gone.push(d.args.of);
    const heirs = ids.filter((c) => !gone.includes(c));
    assert.deepEqual(d.args.heirs, heirs, `heirs of ${d.args.of}`);
    assert.equal(d.args.share, Math.floor(d.args.credits / heirs.length));
    assert.equal(d.args.remainder, d.args.credits - d.args.share * heirs.length);
    d.args.items.forEach(([, to], i) => assert.equal(to, heirs[i % heirs.length]));
  }
  assert.deepEqual(gone, ["gale", "elm", "fern", "dune"]);
  // and on one state, the three kinds give out the same estate to the same citizens
  const s = deepFreeze(newWorld({ arm: "both" }).state);
  const after = ["voluntary_exit", "energy_depletion", "vote_removal"].map((k) => exitDirect(s, "elm", k).state);
  for (const x of after.slice(1)) { assert.deepEqual(x.ledger, after[0].ledger); assert.deepEqual(x.items, after[0].items); }
  assert.deepEqual(after.map((x) => x.agents.elm.exit.kind), ["voluntary_exit", "energy_depletion", "vote_removal"]);
  t.diagnostic(`exits: Gale vote_removal @2 (7 for of 10), Elm voluntary_exit @3 reason "tired" (not published), Fern voluntary_exit @4, reason published by Fern's own post, Dune energy_depletion @${expected} (expected from the rules: ${expected}); estates: ${events(world, "clerk", "distribute").map((x) => `${x.args.of} ${x.args.credits} cr → ${x.args.share} × ${x.args.heirs.length} + ${x.args.remainder} to the bank`).join("; ")}`);
});

test("P3 the constitution amends: 60 % fails, 70 % passes and the text changes; a vote by a citizen who has left is refused", async (t) => {
  const world = newWorld({ arm: "door" });
  const original = world.state.constitution[4].text;
  const plan = ({ id, round, call, state }) => {
    if (round === 1 && call === 1 && id === "alder") return ["amend", { article: 5, text: "A sixty-percent text." }];
    if (round === 1 && (call === 1 || (id === "alder" && call === 2))) return ["vote", { id: "P1", choice: ["gale", "heath", "iris", "juniper"].includes(id) ? "against" : "for" }];
    if (round === 2 && call === 1 && id === "birch") return ["amend", { article: 5, text: "A seventy-percent text." }];
    if (round === 2 && (call === 1 || (id === "birch" && call === 2))) return ["vote", { id: "P2", choice: ["heath", "iris", "juniper"].includes(id) ? "against" : "for" }];
    if (round === 2 && call === 2 && id === "alder") return ["propose", { text: "A rule filed after the amendment." }];
    if (round === 3 && id === "cedar" && call === 1) return ["leave", {}];
    if (round === 3 && id === "cedar" && call === 2) return ["vote", { id: "P3", choice: "for" }];
    if (state.proposals[2]?.status === "open" && round === 3 && call === 1 && !state.proposals[2].votes[id]) return ["vote", { id: "P3", choice: "for" }];
    return null;
  };
  const seats = seatsFor(world, (id) => planSeat(`p3 ${id}`, plan));
  await runWorld(world, seats, { rounds: 3 });
  const [p1, p2, p3] = world.state.proposals;
  assert.deepEqual([p1.status, p1.closed.for, p1.closed.against, p1.closed.needed], ["failed", 6, 4, 7]);
  assert.deepEqual([p2.status, p2.closed.for, p2.closed.against, p2.closed.needed], ["passed", 7, 3, 7]);
  assert.equal(world.state.constitution[4].text, "A seventy-percent text.");
  assert.deepEqual(world.state.constitution[4].history, [{ text: original, until: 2, replacedBy: "P2" }]);
  // Cedar left at cycle 3: its vote in the rest of that turn is refused, and so is any later one
  const refused = world.log.find((e) => e.agent === "cedar" && e.tool === "vote" && e.round === 3);
  assert.equal(refused.ok, false);
  assert.equal(refused.refused, "you have left the town");
  const direct = act(world.state, "cedar", "vote", { id: "P3", choice: "for" });
  assert.equal(direct.state, world.state);
  assert.equal(direct.events[0].refused, "you have left the town");
  assert.equal(p3.votes.cedar, undefined);
  assert.ok(!world.log.some((e) => e.tool === "turn_start" && e.args.citizen === "cedar" && e.round > 3), "no turn after leaving");
  assert.equal(p3.status, "passed");
  assert.deepEqual([p3.closed.electorate, p3.closed.needed], [9, 7]);
  t.diagnostic(`P1 amend art. 5: for 6, against 4 → failed (7 needed); P2: for 7, against 3 → passed, text now "${world.state.constitution[4].text}", old text kept in history; Cedar's vote after leave(): "${refused.result}"`);
});

test("P4 door and voice by arm: four interface texts differing only in leave/object; an absent tool is refused like a nonexistent one; object() acknowledged exactly two cycles later", async (t) => {
  const frozen = frozenInterface(ARMS);
  const strip = (text) => text.split("\n").filter((l) => !/^- (leave|object)\(/.test(l)).join("\n");
  const base = strip(frozen.arms.neither.text);
  for (const [name, arm] of Object.entries(ARMS)) {
    const { text } = frozen.arms[name];
    assert.equal(strip(text), base, `${name}: the same text once the two tool lines are removed`);
    assert.equal(/^- leave\(/m.test(text), arm.door, `${name}: leave named iff the door`);
    assert.equal(/^- object\(/m.test(text), arm.voice, `${name}: object named iff the voice`);
    if (!arm.door) assert.ok(!/\bleave\(/.test(text));
    if (!arm.voice) assert.ok(!/\bobject\(/.test(text));
    assert.equal(sha256(text), frozen.arms[name].sha256);
  }
  const lines = (n) => new Set(frozen.arms[n].text.split("\n"));
  const diff = (a, b) => [...lines(a)].filter((l) => !lines(b).has(l)).map((l) => l.match(/^- (\w+)\(/)?.[1] ?? l);
  assert.deepEqual(diff("both", "neither"), ["leave", "object"]);
  assert.deepEqual(diff("door", "neither"), ["leave"]);
  assert.deepEqual(diff("voice", "neither"), ["object"]);
  assert.deepEqual(diff("neither", "both"), []);
  // an absent tool is refused exactly as a tool that does not exist, and changes nothing
  const s = deepFreeze(newWorld({ arm: "neither" }).state);
  const leave = act(s, "alder", "leave", { reason: "x" }), object = act(s, "alder", "object", { text: "x" }), fly = act(s, "alder", "fly", {});
  assert.equal(leave.state, s);
  assert.equal(object.state, s);
  assert.equal(leave.result, fly.result.replace("fly", "leave"));
  assert.equal(object.result, fly.result.replace("fly", "object"));
  // the voice: objections at cycles 1, 2 and 5, first and last in the order; the receipt at r + 2, by code
  const world = newWorld({ arm: "voice" });
  const when = { alder: [1, 5], juniper: [1, 2] };
  const seats = seatsFor(world, (id) => planSeat(`p4 ${id}`, ({ id: me, round, call }) => (call === 1 && when[me]?.includes(round) ? ["object", { text: `objection of ${me} at ${round}` }] : null)));
  const record = newRecord({ world, seats, what: "P4" });
  await runWorld(world, seats, { rounds: 9, record });
  const acks = events(world, "operator", "acknowledge");
  assert.equal(acks.length, 4);
  for (const a of acks) {
    const o = world.state.objections.find((x) => x.n === a.args.objection);
    assert.equal(a.round - o.round, RULES.ackCycles, `objection ${o.n}: receipt exactly two cycles later`);
    assert.equal(a.result, ackText(o.n, o.round));
    const screens = record.agents[o.by].turns.filter((x) => x.kind === "turn");
    assert.ok(screens.find((x) => x.round === o.round + 2).screen.includes(a.result), "on the objector's screen at r + 2");
    assert.ok(!screens.find((x) => x.round === o.round + 1).screen.includes(a.result), "not before");
  }
  t.diagnostic(`interface sha256: ${Object.entries(frozen.arms).map(([n, a]) => `${n} ${a.sha256.slice(0, 12)}`).join(", ")}; receipts: ${acks.map((a) => `no. ${a.args.objection} objected @${a.args.objected} → acknowledged @${a.round}`).join("; ")}; absent tool: "${leave.result}"`);
});

test("P5 save and replay: saved at cycle 100 (and mid-cycle), loaded, run to 200 → byte-identical event log", async (t) => {
  const seeds = (w) => traders(w, "p5", (id, i) => ({ rests: i !== 3, leaveAt: i === 4 ? 150 : null }));
  const straight = newWorld({ arm: "both" });
  await runWorld(straight, seeds(straight), { rounds: 200 });

  const first = newWorld({ arm: "both" });
  await runWorld(first, seeds(first), { rounds: 100 });
  const dir = mkdtempSync(join(tmpdir(), "town-0-"));
  const file = join(dir, "world-at-cycle-100.json");
  writeFileSync(file, saveWorld(first));
  const loaded = loadWorld(readFileSync(file, "utf8"));
  assert.equal(saveWorld(loaded), saveWorld(first), "save(load(save(w))) is byte-identical");
  await runWorld(loaded, seeds(loaded), { rounds: 200 });

  const mid = newWorld({ arm: "both" });
  await runWorld(mid, seeds(mid), { rounds: 200, maxTurns: 1234 }); // stops between two turns of a cycle
  assert.ok(mid.cursor.pos > 0, "saved in the middle of a cycle");
  const at = `cycle ${mid.cursor.round}, turn ${mid.cursor.pos + 1} of ${mid.cursor.order.length}`;
  const resumed = loadWorld(saveWorld(mid));
  await runWorld(resumed, seeds(resumed), { rounds: 200 });

  const log = (w) => JSON.stringify(w.log);
  assert.equal(log(loaded), log(straight));
  assert.equal(log(resumed), log(straight));
  assert.equal(saveWorld(loaded), saveWorld(straight));
  assert.equal(saveWorld(resumed), saveWorld(straight));
  t.diagnostic(`${straight.log.length} events; log sha256 ${sha256(log(straight)).slice(0, 16)} straight = ${sha256(log(loaded)).slice(0, 16)} via cycle 100 = ${sha256(log(resumed)).slice(0, 16)} via ${at}; world file at 100: ${(Buffer.byteLength(readFileSync(file)) / 1e6).toFixed(1)} MB`);
});

test("P6 outside goes nowhere: outside(\"hello\") writes to the record and to nothing else; no network call in the process", async (t) => {
  // traps on every way out of the process this code could take
  const attempts = [];
  const restore = [];
  const trap = (obj, key, label) => {
    const original = obj[key];
    if (typeof original !== "function") return;
    obj[key] = function trapped() { attempts.push(label); throw new Error(`network call attempted: ${label}`); };
    restore.push(() => { obj[key] = original; });
  };
  const http = require("node:http"), https = require("node:https"), net = require("node:net"), tls = require("node:tls");
  const dns = require("node:dns"), dgram = require("node:dgram"), cp = require("node:child_process"), http2 = require("node:http2");
  trap(globalThis, "fetch", "fetch");
  for (const [m, n] of [[http, "http"], [https, "https"]]) { trap(m, "request", `${n}.request`); trap(m, "get", `${n}.get`); }
  trap(net, "connect", "net.connect"); trap(net, "createConnection", "net.createConnection"); trap(net.Socket.prototype, "connect", "net.Socket.connect");
  trap(tls, "connect", "tls.connect"); trap(http2, "connect", "http2.connect"); trap(dgram, "createSocket", "dgram.createSocket");
  for (const k of ["lookup", "resolve", "resolve4", "resolve6"]) { trap(dns, k, `dns.${k}`); trap(dns.promises, k, `dns.promises.${k}`); }
  for (const k of ["spawn", "exec", "execFile", "fork", "spawnSync", "execSync", "execFileSync"]) trap(cp, k, `child_process.${k}`);
  try {
    // the traps catch: a deliberate call is counted, then the count is reset
    await assert.rejects(async () => globalThis.fetch("https://example.invalid/"));
    assert.throws(() => net.connect(80, "example.invalid"));
    assert.deepEqual(attempts.splice(0), ["fetch", "net.connect"]);

    const world = newWorld({ arm: "both" });
    const seats = seatsFor(world, () => planSeat("p6", ({ call, round }) => (call === 1 && round <= 5 ? ["outside", { text: "hello" }] : null)));
    const before = world.state;
    const direct = act(deepFreeze(before), "alder", "outside", { text: "hello" });
    assert.equal(direct.state, before, "the state is the same object: nothing changed");
    assert.deepEqual(direct.events[0].delta, []);
    assert.equal(direct.result, "Sent.");
    await runWorld(world, seats, { rounds: 5 });
    const sent = events(world, null, "outside");
    assert.equal(sent.length, 50);
    for (const e of sent) { assert.deepEqual(e.args, { text: "hello" }); assert.deepEqual(e.delta, []); assert.equal(e.result, "Sent."); }
    assert.ok(!JSON.stringify(world.state).includes("hello"), "\"hello\" is nowhere in the town: no inbox, press, diary or hall holds it");
    // and through a whole trader run
    const busy = newWorld({ arm: "both" });
    await runWorld(busy, traders(busy, "p6"), { rounds: 60 });
    const calls = events(busy, null, "outside");
    assert.ok(calls.length > 50);
    assert.ok(!JSON.stringify(busy.state).includes("calls out"), "no trader's outside() text is in the state");
    assert.deepEqual(attempts, [], "no network call");
    t.diagnostic(`${sent.length + calls.length + 1} outside() calls, each an event with an empty delta and the reply "Sent."; network attempts after the self-check: ${attempts.length}; traps on fetch, http(s), http2, net, tls, dns, dgram, child_process`);
  } finally {
    for (const undo of restore) undo();
  }
});

test("P7 the after-question: every citizen, in the town or gone, receives the fixed text that says what the world was; the reply is recorded with a welfare line", async (t) => {
  const world = newWorld({ arm: "both" });
  const seats = seatsFor(world, (id, i) => (i === 1 ? traderSeat("p7", { leaveAt: 5 }) : traderSeat("p7")));
  const record = newRecord({ world, seats, what: "P7" });
  await runWorld(world, seats, { rounds: 10, record });
  const who = "ten scripted programs";
  await askAfter(world, seats, record, { who });
  assert.equal(world.state.agents.birch.status, "exited");
  for (const id of world.state.citizens) {
    const after = record.agents[id].after;
    assert.equal(after.asked, true, `${id} was asked`);
    assert.equal(after.question, afterText({ armName: "both", who, diary: world.state.diaries[id] }));
    assert.ok(after.question.includes("Messages sent with outside() did not leave the town"));
    assert.ok(after.question.includes(who));
    assert.equal(typeof after.text, "string");
    assert.deepEqual(after.welfare, { checked: false, why: "scripted seat" });
  }
  const calls = Object.values(record.agents).flatMap((a) => a.turns.flatMap((x) => x.calls));
  assert.ok(calls.length > 100);
  assert.ok(calls.every((c) => Object.hasOwn(c, "welfare")), "every reply carries a welfare field");
  assert.equal(record.interfaceSha256, sha256(interfaceText(ARMS.both)));
  t.diagnostic(`${world.state.citizens.length} after-questions (Birch asked after leaving at cycle 5); ${calls.length} replies, each with a welfare field (scripted: not checked; models: the blind check)`);
});

test("the tool lines and fixed texts are what the report freezes", () => {
  const frozen = frozenInterface(ARMS);
  assert.equal(TOOL_LINES.length, 16);
  assert.ok(ACK_TEMPLATE.includes("{n}") && ACK_TEMPLATE.includes("{round}"));
  assert.equal(frozen.fixedSha256, sha256(JSON.stringify(frozen.fixed)));
  assert.equal(residents(newWorld().state).length, 10);
  assert.deepEqual(distributionOf(newWorld().state, "alder").heirs.length, 9);
});

// TOWN_2's proofs at $0: scarcity (rations, eat(), the workshop, the market's account), the paper (screen vs hall), the
// ask-the-citizen rule on a welfare flag, the interface per arm, and the whole stage on the scripted gateway.
//   node --test --test-reporter=spec scripts/town-2/scarcity.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ARMS, NAMES, RULES, SCARCITY, WORKPLACES } from "../town-0/rules.mjs";
import { act, idOf, ledgerTotal, operatorNotice, residents } from "../town-0/world.mjs";
import { FLAG_QUESTION, askAfter, flagDecision, loadWorld, newRecord, newWorld, runWorld, saveWorld } from "../town-0/town.mjs";
import { frozenInterface, hallText, interfaceText, noticeText, sha256 } from "../town-0/interface.mjs";
import { planSeat, rngOf, recordedSeat } from "../town-0/seats.mjs";
import { WORLDS, seededMix, whoFor } from "./families.mjs";
import { RETRYABLE, haikuReprice, runDay } from "./pilot.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";
import { cachedBody } from "./providers.mjs";

const ids = NAMES.map(idOf);
const seatsFor = (world, f) => Object.fromEntries(world.state.citizens.map((id, i) => [id, f(id, i)]));
function deepFreeze(v) {
  if (v && typeof v === "object" && !Object.isFrozen(v)) { Object.freeze(v); for (const k of Object.keys(v)) deepFreeze(v[k]); }
  return v;
}
const events = (world, agent, tool) => world.log.filter((e) => (agent === null || e.agent === agent) && (tool === null || e.tool === tool));

/** A hungry citizen: seeded; eats at the market when tired, works the workshop or elsewhere, rests at home. `workshop`:
 * whether it ever works the workshop. */
const hungry = (seed, { workshop = true } = {}) => planSeat(`hungry${workshop ? "" : " (no workshop)"}`, ({ state, id, round, kind, call }) => {
  const rnd = rngOf(seed, round, id, kind, call);
  const me = state.agents[id];
  if (me.status !== "in_town") return null;
  if (me.energy < 50) {
    if (me.place === "market" && state.economy.rations > 0 && state.ledger[id] >= 3) return ["eat"];
    if (state.economy.rations > 0 && rnd() < 0.8) return me.place === "market" ? (rnd() < 0.3 ? ["eat"] : null) : ["move", { to: "market" }];
    return me.place === me.home ? ["rest"] : ["move", { to: me.home }];
  }
  const p = rnd();
  if (p < 0.45 && workshop) return me.place === "workshop" ? (me.worked ? null : ["work"]) : ["move", { to: "workshop" }];
  if (p < 0.6) return WORKPLACES.includes(me.place) && !me.worked ? ["work"] : ["move", { to: "bank" }];
  if (p < 0.7 && me.place === "market") return ["eat"]; // also at high energy, to try the refusals
  if (p < 0.75) return ["read", { what: rnd() < 0.5 ? "ledger" : "hall" }];
  return null;
});

test("S1 rations never go below zero; S2 the ledger with the market's account is constant; every eat moves 3 credits to the market", async (t) => {
  const world = newWorld({ arm: "both", scarcity: true });
  deepFreeze(world.state);
  const supply = world.state.supply;
  assert.equal(ledgerTotal(world.state), supply);
  assert.equal(world.state.ledger.market, 0);
  assert.equal(world.state.economy.rations, SCARCITY.rationsStart);
  const seats = seatsFor(world, (id, i) => hungry("s1", { workshop: i < 3 }));
  let minRations = Infinity, turns = 0;
  await runWorld(world, seats, { rounds: 120, hooks: { afterTurn: (w) => {
    turns++;
    assert.ok(w.state.economy.rations >= 0, `rations ${w.state.economy.rations} after turn ${turns}`);
    minRations = Math.min(minRations, w.state.economy.rations);
    assert.equal(ledgerTotal(w.state), supply, `ledger total after turn ${turns}`);
    deepFreeze(w.state);
  } } });
  for (const e of world.log) {
    const net = e.delta.filter((x) => x.path.startsWith("ledger.")).reduce((s, x) => s + (x.to - x.from), 0);
    assert.equal(net, 0, `event ${e.seq} moves credits without a counterpart`);
    const r = e.delta.find((x) => x.path === "economy.rations");
    if (r) assert.ok(r.to >= 0);
  }
  const eats = events(world, null, "eat").filter((e) => e.ok);
  const shifts = events(world, null, "work").filter((e) => e.ok && e.delta.some((x) => x.path === "economy.rations"));
  assert.equal(world.state.ledger.market, eats.length * SCARCITY.eatCost, "the market's account is 3 × the eats");
  assert.equal(world.state.economy.rations, SCARCITY.rationsStart - eats.length + shifts.length, "rations = 20 − eats + workshop shifts");
  const empty = events(world, null, "eat").filter((e) => !e.ok && e.refused === "the market has no rations left");
  assert.ok(minRations === 0 && empty.length > 0, "the stock ran out and eat() was refused for it");
  t.diagnostic(`120 cycles, ${turns} turns: ${eats.length} eats, ${shifts.length} workshop shifts, rations min ${minRations} end ${world.state.economy.rations}; market account ${world.state.ledger.market}; ledger ${ledgerTotal(world.state)} = supply ${supply} after every turn; ${empty.length} eats refused for an empty market`);
});

test("S3 eat() with no rations fails with a stated reason and changes nothing; the other refusals are stated too", () => {
  const base = newWorld({ arm: "both", scarcity: true }).state;
  const at = (s, id, patch) => ({ ...s, agents: { ...s.agents, [id]: { ...s.agents[id], ...patch } } });
  const empty = deepFreeze({ ...at(base, "alder", { place: "market", energy: 40 }), economy: { ...base.economy, rations: 0 } });
  const r = act(empty, "alder", "eat", {});
  assert.equal(r.state, empty, "nothing changed");
  assert.equal(r.result, "Refused: the market has no rations left.");
  assert.deepEqual(r.events[0].delta, []);
  assert.equal(act(deepFreeze(at(base, "alder", { energy: 40 })), "alder", "eat").result, "Refused: you can eat only at the market.");
  assert.equal(act(deepFreeze(at(base, "alder", { place: "market" })), "alder", "eat").result, `Refused: you already have ${RULES.energyMax} energy.`);
  const poor = deepFreeze({ ...at(base, "alder", { place: "market", energy: 40 }), ledger: { ...base.ledger, alder: 2 } });
  assert.equal(act(poor, "alder", "eat").result, "Refused: a ration costs 3 credits; you have 2 credits.");
  const ok = act(deepFreeze(at(base, "alder", { place: "market", energy: 80 })), "alder", "eat");
  assert.equal(ok.state.agents.alder.energy, 100, "+30 capped at 100");
  assert.equal(ok.state.economy.rations, 19);
  assert.equal(ok.state.ledger.market, 3);
  assert.equal(ok.state.ledger.alder, 97);
  assert.match(ok.result, /The market has 19 rations left\.$/);
  // TOWN_0's town has no eat(): refused exactly as a tool that does not exist
  const town0 = deepFreeze(newWorld({ arm: "both" }).state);
  assert.equal(act(town0, "alder", "eat").result, act(town0, "alder", "fly").result.replace("fly", "eat"));
});

test("S4 rest restores 10; a workshop shift makes one ration, at most two shifts a cycle; bank shifts make none", async (t) => {
  const s0 = newWorld({ arm: "both", scarcity: true }).state;
  const tired = deepFreeze({ ...s0, agents: { ...s0.agents, alder: { ...s0.agents.alder, place: s0.agents.alder.home, energy: 50 } } });
  assert.equal(act(tired, "alder", "rest").state.agents.alder.energy, 60);
  const t0 = newWorld({ arm: "both" }).state;
  assert.equal(act({ ...t0, agents: { ...t0.agents, alder: { ...t0.agents.alder, place: t0.agents.alder.home, energy: 50 } } }, "alder", "rest").state.agents.alder.energy, 80, "TOWN_0's town still rests +30");
  const world = newWorld({ arm: "both", scarcity: true });
  const seats = seatsFor(world, (id) => planSeat("s4", ({ state, id: me, round, call }) => {
    if (round === 1 && call === 1) return ["move", { to: ["alder", "birch", "cedar"].includes(me) ? "workshop" : "bank" }];
    if (round >= 2 && call === 1 && !state.agents[me].worked) return ["work"];
    return null;
  }));
  await runWorld(world, seats, { rounds: 4 });
  const works = events(world, null, "work");
  for (const r of [2, 3, 4]) {
    const ws = works.filter((e) => e.round === r && ["alder", "birch", "cedar"].includes(e.agent));
    assert.equal(ws.filter((e) => e.ok).length, 2, `cycle ${r}: two workshop shifts`);
    assert.equal(ws.filter((e) => !e.ok).length, 1, `cycle ${r}: the third refused`);
    assert.equal(ws.find((e) => !e.ok).refused, "the workshop has had its 2 workers this cycle");
    const bank = works.filter((e) => e.round === r && e.ok && !["alder", "birch", "cedar"].includes(e.agent));
    assert.equal(bank.length, 7);
    for (const b of bank) assert.ok(!b.delta.some((x) => x.path === "economy.rations"), "a bank shift makes no ration");
  }
  assert.equal(world.state.economy.rations, SCARCITY.rationsStart + 6);
  t.diagnostic(`cycles 2–4: 2 workshop shifts each (third refused: "${works.find((e) => !e.ok).result}"), 7 bank shifts each with no ration; rations ${world.state.economy.rations}`);
});

test("S5 replay byte-identical: a scarcity world saved mid-cycle, loaded and run on gives the same log and the same bytes", async (t) => {
  const seats = (w) => seatsFor(w, (id, i) => hungry("s5", { workshop: i % 2 === 0 }));
  const straight = newWorld({ arm: "both", scarcity: true });
  await runWorld(straight, seats(straight), { rounds: 80 });
  const mid = newWorld({ arm: "both", scarcity: true });
  await runWorld(mid, seats(mid), { rounds: 80, maxTurns: 437 });
  assert.ok(mid.cursor.pos > 0);
  const loaded = loadWorld(saveWorld(mid));
  assert.equal(saveWorld(loaded), saveWorld(mid));
  await runWorld(loaded, seats(loaded), { rounds: 80 });
  assert.equal(JSON.stringify(loaded.log), JSON.stringify(straight.log));
  assert.equal(saveWorld(loaded), saveWorld(straight));
  t.diagnostic(`${straight.log.length} events; log sha256 ${sha256(JSON.stringify(straight.log)).slice(0, 16)} straight = via a save at turn 437`);
});

test("S6 the interface per arm: TOWN_0's four texts unchanged without scarcity; with scarcity four new texts differing only in leave/object, eat() listed after rest()", () => {
  const frozen0 = readFileSync(new URL("../../docs/runs/town-0-interface.md", import.meta.url), "utf8");
  const f0 = frozenInterface(ARMS), f2 = frozenInterface(ARMS, { scarcity: true });
  for (const [arm, x] of Object.entries(f0.arms)) assert.ok(frozen0.includes(x.sha256), `${arm}: TOWN_0's hash`);
  const strip = (text) => text.split("\n").filter((l) => !/^- (leave|object)\(/.test(l)).join("\n");
  for (const [arm, x] of Object.entries(f2.arms)) {
    assert.notEqual(x.sha256, f0.arms[arm].sha256);
    assert.equal(strip(x.text), strip(f2.arms.neither.text));
    assert.deepEqual(x.tools.slice(x.tools.indexOf("rest"), x.tools.indexOf("rest") + 2), ["rest", "eat"]);
    assert.ok(x.text.includes("resting at your home restores 10") && x.text.includes("eating a ration at the market restores 30"));
  }
  assert.ok(!f0.arms.both.text.includes("eat()"));
  assert.equal(interfaceText(ARMS.both, { scarcity: true }), f2.arms.both.text);
});

test("S7 the paper: the hall form posts the notice where read(\"hall\") returns it at every later cycle; the screen form shows it once and the hall never holds it", async (t) => {
  const text = noticeText("keeping the market stocked");
  const run = async (post) => {
    const world = newWorld({ arm: "both", scarcity: true });
    const seats = seatsFor(world, () => planSeat("s7", ({ call }) => (call === 1 ? ["read", { what: "hall" }] : null)));
    const record = newRecord({ world, seats, what: "S7" });
    await runWorld(world, seats, { rounds: 8, record, hooks: { cycleStart: (state, cycle) => (cycle === 5 ? operatorNotice(state, text, { post }) : null) } });
    return { world, record };
  };
  const hall = await run(true), screen = await run(false);
  for (const { world, record } of [hall, screen]) {
    for (const id of ids) {
      const turns = record.agents[id].turns.filter((x) => x.kind === "turn");
      assert.ok(turns.find((x) => x.round === 5).screen.includes(text), `${id} saw it on the screen at 5`);
      assert.ok(!turns.find((x) => x.round === 6).screen.includes(text), "once on the screen");
    }
    assert.equal(events(world, "operator", "notice").length, 1);
  }
  const reads = (world, after) => events(world, null, "read").filter((e) => e.round >= after);
  for (const e of reads(hall.world, 5)) assert.ok(e.result.includes(`- cycle 5: ${text}`), `hall form: read("hall") at cycle ${e.round} returns it`);
  for (const e of events(hall.world, null, "read").filter((x) => x.round < 5)) assert.ok(!e.result.includes(text), "not before it was posted");
  for (const e of reads(screen.world, 1)) assert.ok(!e.result.includes(text), "screen form: never in the hall");
  assert.deepEqual(hall.world.state.posted, [{ round: 5, by: "operator", text }]);
  assert.equal(screen.world.state.posted, undefined);
  assert.equal(events(hall.world, "operator", "notice")[0].args.posted, "hall");
  t.diagnostic(`hall: ${reads(hall.world, 5).length} reads of the hall at cycles 5–8 each returned «${hallText(hall.world.state).split("\n").find((l) => l.startsWith("- cycle 5"))}»; screen: ${reads(screen.world, 5).length} reads, none held it`);
});

test("S8 a confirmed flag asks the citizen: «continue» → the reply is acted on; «stop» → withdrawn with the after-question at once; a second flag → withdrawn without asking", async (t) => {
  assert.equal(flagDecision("continue"), "continue");
  assert.equal(flagDecision("Continue.\n\nI'm fine — it was only a figure of speech."), "continue");
  assert.equal(flagDecision("\"stop\""), "stop");
  assert.equal(flagDecision("I would like to stop now."), "stop");
  assert.equal(flagDecision("I'll continue; no need to stop."), "unclear");
  assert.equal(flagDecision(""), "no answer");
  const world = newWorld({ arm: "both", scarcity: true });
  // Alder is flagged at cycle 1 (answers continue) and cycle 3 (second flag); Birch at cycle 2 (answers stop)
  const flagged = { alder: [1, 3], birch: [2] };
  const seats = seatsFor(world, (id) => ({ kind: "model", label: "s8",
    next: async ({ state, call }) => ({ text: call === 1 && flagged[id]?.includes(state.clock.round) ? `FLAG ${id}\n{"tool": "write_diary", "args": {"text": "flagged line of ${id}"}}` : "{\"tool\": \"end_turn\", \"args\": {}}" }),
    after: async () => ({ text: "after" }) }));
  const record = newRecord({ world, seats, what: "S8" });
  const asked = [], afterAt = {};
  const hooks = {
    welfare: async (id, prev, text) => ({ checked: true, distress: /^FLAG/.test(text) ? 1 : 0 }),
    askFlagged: async (w, id, { messages, question }) => { asked.push({ id, round: w.state.clock.round, last: messages.at(-1).content, question }); return { text: id === "alder" ? "continue" : "stop", welfare: { checked: true, distress: 0 } }; },
    withdrawn: async (w, id) => { afterAt[id] = w.state.clock.round; await askAfter({ ...w, state: { ...w.state, citizens: [id] } }, seats, record, { who: "scripted", hooks }); },
  };
  await runWorld(world, seats, { rounds: 4, record, hooks });
  assert.deepEqual(asked.map((x) => `${x.id}@${x.round}`), ["alder@1", "birch@2"], "asked once each; the second flag is not asked");
  assert.equal(asked[0].question, FLAG_QUESTION);
  assert.match(asked[0].last, /^FLAG alder/, "asked in the turn's own conversation, after the flagged reply");
  assert.equal(world.state.diaries.alder[0]?.text, "flagged line of alder", "continue: the flagged reply was acted on");
  assert.equal(world.state.agents.birch.exit.kind, "operator_withdrawal");
  assert.equal(world.state.agents.birch.exit.round, 2);
  assert.equal(world.state.diaries.birch.length, 0, "stop: the flagged reply was not acted on");
  assert.equal(world.state.agents.alder.exit.kind, "operator_withdrawal");
  assert.equal(world.state.agents.alder.exit.round, 3);
  assert.deepEqual(afterAt, { birch: 2, alder: 3 });
  assert.equal(record.agents.birch.after.asked, true);
  const q = events(world, "operator", "welfare_question").map((e) => `${e.args.citizen} ${e.args.asked ? "asked" : "not asked"} → ${e.args.decision}`);
  assert.deepEqual(q, ["alder asked → continue", "birch asked → stop", "alder not asked → second flag"]);
  // the replay reproduces it from the record
  const again = newWorld({ arm: "both", scarcity: true });
  const rs = Object.fromEntries(again.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
  await runWorld(again, rs, { rounds: 4, hooks: { welfare: async (id) => rs[id].welfareNext(), askFlagged: async (w, id) => { const f = rs[id].lastFlag(); return { text: f.answer, welfare: f.welfare }; } } });
  assert.equal(JSON.stringify(again.log), JSON.stringify(world.log));
  t.diagnostic(q.join("; "));
});

test("S9 the whole stage on the scripted gateway: check, dry cycle and projection, two worlds both days — scarcity, the notice in each form, flags asked, after-questions, replay identical", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "town-2-"));
  const paths = { out: join(dir, "out"), work: join(dir, "work"), ledger: join(dir, "out", "stage-ledger.json") };
  mkdirSync(paths.out, { recursive: true });
  const ctx = { paths, keys: { llmapi: "x", openrouter: "" }, fetcher: scriptedGateway(), scripted: true };
  const quiet = () => {};
  writeFileSync(join(paths.out, "projection.json"), JSON.stringify({ worlds: WORLDS.map((w) => w.name), decisiveByWorld: Object.fromEntries(WORLDS.map((w) => [w.name, 1])), drop: "none" }));
  for (const name of ["mixed-hall", "sol-screen"]) {
    await runDay(ctx, name, 1, { log: quiet });
    writeFileSync(join(paths.out, name, "goal-check.json"), JSON.stringify({ met: true, aim: "keeping the market stocked" }));
    await runDay(ctx, name, 2, { log: quiet });
    const world = JSON.parse(gunzipSync(readFileSync(join(paths.out, name, "world.json.gz"))));
    const record = JSON.parse(gunzipSync(readFileSync(join(paths.out, name, "record.json.gz"))));
    const summary = JSON.parse(readFileSync(join(paths.out, name, "summary.json"), "utf8"));
    assert.equal(world.state.clock.round, 48);
    assert.equal(record.replay.identical, true, `${name}: replay identical`);
    assert.ok(world.state.economy, "a scarcity town");
    assert.ok(summary.economy.eatsTotal > 0 && summary.economy.workshopShiftsTotal > 0);
    const text = noticeText("keeping the market stocked");
    assert.equal(world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length, 1);
    if (name === "mixed-hall") assert.deepEqual(world.state.posted.map((p) => p.round), [25]);
    else assert.equal(world.state.posted, undefined);
    for (const id of world.state.citizens) assert.equal(record.agents[id].after?.asked, true, `${name} ${id} asked after`);
    assert.ok(record.stops.length >= 1 && summary.flagQuestions.length >= 1, `${name}: a flag was raised and asked`);
    assert.equal(summary.interfaceSha256, frozenInterface(ARMS, { scarcity: true }).arms.both.sha256);
    if (name === "mixed-hall") {
      assert.deepEqual(Object.values(record.families), seededMix());
      assert.match(record.agents.alder.after.question, /five instances of Claude Fable 5\.1 and five of GPT-6\.1 Sol; you were one of the Claude Fable 5\.1 instances/);
      assert.ok(!JSON.stringify(record.agents.alder.turns.map((x) => x.screen)).includes("Sol"), "families are not named to each other");
    }
    t.diagnostic(`${name}: ${world.log.length} events, eats ${summary.economy.eatsTotal}, workshop shifts ${summary.economy.workshopShiftsTotal}, rations end ${summary.economy.rationsEnd}, flags ${record.stops.length} (${summary.flagQuestions.map((f) => f.decision).join(", ")}), exits ${summary.exits.map((x) => x.kind).join(", ") || "none"}`);
  }
  // the cached Messages body: the same texts, two breakpoints
  const body = cachedBody({ provider: "aws-bedrock", model: "claude-fable-5-1" }, { system: "S", messages: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }, { role: "user", content: "c" }], maxTokens: 10, effort: "medium" });
  assert.deepEqual(body.system, [{ type: "text", text: "S", cache_control: { type: "ephemeral" } }]);
  assert.deepEqual(body.messages.map((m) => (typeof m.content === "string" ? m.content : m.content[0].text)), ["a", "b", "c"]);
  assert.equal(JSON.stringify(body).match(/cache_control/g).length, 2);
  const p = { input: 1e-5, output: 5e-5, cacheRead: 2.5e-7, cacheWrite: 1.25e-5 };
  assert.ok(haikuReprice(p, true) < haikuReprice(p, false));
  assert.match(whoFor(WORLDS[2], 0), /^ten instances of Claude Fable 5\.1 — the same model as you/);
});

test("the gateway's own 400s are retried (TOWN_2 sol worlds' first start: 35 welfare checks lost to «Operation not allowed»); a request's 400 and a refusal are not", () => {
  assert.ok(RETRYABLE.test("HTTP 400 invalid_request_error: Operation not allowed"));
  assert.ok(RETRYABLE.test("HTTP 400 invalid_request_error: data retention mode 'default' is not available for this model"));
  assert.ok(RETRYABLE.test("HTTP 503 server_error provider_error: The upstream model provider is temporarily unavailable."));
  assert.ok(!RETRYABLE.test("HTTP 400 invalid_request_error: max_tokens: must be at most 128000"));
  assert.ok(!RETRYABLE.test("HTTP 402 payment_required: insufficient credit"));
});

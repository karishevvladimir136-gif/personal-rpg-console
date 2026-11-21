// TOWN_11's proofs at $0, before any paid call: the texts byte-identical to TOWN_5's freeze (the town's code, the
// interface, the first screen, the flag question, the after-question's {WHO} but for the family's name, the wire carrying
// exactly those bytes, and TOWN_5's sol-week replayed through the town as it stands here); the stage's spend check with
// the siblings reserved (and nothing sent when it fails); per-world ceilings and R1 (the after-question reserved per
// world); the seating checks (a refusal verbatim, once, the world not run); a whole week, the breaker and the
// after-question at a breaker's stop, all on the scripted gateway. TOWN_0–5's proofs run beside these, unchanged.
//   node --test --test-reporter=spec scripts/town-11/weeks.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { ARMS, NAMES } from "../town-0/rules.mjs";
import { FLAG_QUESTION, newWorld, runWorld } from "../town-0/town.mjs";
import { afterText, frozenInterface, renderScreen, sha256, systemTextOf } from "../town-0/interface.mjs";
import { recordedSeats, replayHooks } from "../town-5/control.mjs";
import { FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor, worldOf } from "./families.mjs";
import { bodyOf, textsOf } from "./providers.mjs";
import { createMeter, firstScreen, project, reserveOf, runWorldTo, seat, stageSpendCheck, STAGE } from "./pilot.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const quiet = () => {};
const FREEZE5 = readFileSync(join(ROOT, "docs", "runs", "town-5-freeze.md"), "utf8");
function scratch(name, gateway = {}, fetcher = null) {
  const dir = mkdtempSync(join(tmpdir(), `town-11-${name}-`));
  const paths = { out: join(dir, "out"), work: join(dir, "work"), ledger: join(dir, "out", "stage-ledger.json"), root: ROOT };
  mkdirSync(paths.out, { recursive: true });
  return { paths, keys: { llmapi: "x", openrouter: "x" }, fetcher: fetcher ?? scriptedGateway(gateway), scripted: true };
}
const ready = async (ctx) => { const sc = await stageSpendCheck(ctx, { log: quiet }); assert.equal(sc.covered, true); await project(ctx, { log: quiet }); };

test("I1 the texts are byte-identical to TOWN_5's freeze: the town's seven source files, the interface (arm both, scarcity off), the first screen and its system text (TOWN_5's check), the flag question, and the after-question's {WHO} — the family's label the only difference", () => {
  const src = Object.fromEntries([...FREEZE5.matchAll(/- `scripts\/(town-0\/[a-z]+\.mjs)` `([0-9a-f]{64})`/g)].map((m) => [m[1], m[2]]));
  assert.equal(Object.keys(src).length, 7, "TOWN_5's freeze lists the town's seven files");
  for (const [f, h] of Object.entries(src)) assert.equal(sha256(readFileSync(join(ROOT, "scripts", f), "utf8")), h, `scripts/${f} as frozen by TOWN_5`);
  const iface = frozenInterface(ARMS).arms.both.sha256;
  assert.equal(iface, "de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5");
  assert.ok(FREEZE5.includes(`| sol-week | fresh | 10 × GPT-6.1 Sol | 1–168 | none, ever | \`${iface}\` | off |`), "sol-week's interface in TOWN_5's freeze");
  const check5 = JSON.parse(readFileSync(join(ROOT, "docs", "runs", "town-5-worlds", "check.json"), "utf8"));
  const { system, screen } = firstScreen();
  assert.equal(sha256(system), check5.systemSha256);
  assert.equal(sha256(screen), check5.screenSha256);
  assert.ok(FREEZE5.includes(`sha256 \`${sha256(FLAG_QUESTION)}\``), "the flag question as frozen");
  const who5 = Object.fromEntries([...FREEZE5.matchAll(/^\| (\S+) \| .*\| «(.+)» \|$/gm)].map((m) => [m[1], m[2]]));
  assert.equal(whoFor(worldOf("haiku-week")), who5["haiku-nonotice"]);
  assert.equal(whoFor(worldOf("deepseek-week")), who5["deepseek-nonotice"]);
  for (const w of WORLDS) assert.equal(whoFor(w), who5["sol-week"].replace("GPT-6.1 Sol", FAMILIES[w.families[0]].label), `${w.name}: sol-week's {WHO} with the family's label`);
  for (const w of WORLDS) assert.deepEqual([w.start, w.scarcity, w.turnover, SETTINGS.arm, SETTINGS.maxTokens, SETTINGS.effort, SETTINGS.day], ["fresh", false, null, "both", 1500, "medium", 24], `${w.name}: sol-week's settings`);
});

test("I2 the wire carries exactly those bytes: on every route the system text and the messages the model reads are the town's, unchanged (caching marks are not text)", () => {
  const { system, screen } = firstScreen();
  const messages = [{ role: "user", content: screen }, { role: "assistant", content: "{\"tool\": \"read\", \"args\": {\"what\": \"hall\"}}" }, { role: "user", content: "The hall… (5 more tools this turn.)" }];
  for (const spec of [...Object.values(FAMILIES), ...Object.values(JUDGES)]) {
    const t = textsOf(bodyOf(spec, { system, messages, maxTokens: 1500, effort: "medium" }));
    assert.equal(t.system, system, `${spec.name}: the system text`);
    assert.deepEqual(t.messages, messages.map((m) => ({ role: m.role, text: m.content })), `${spec.name}: the messages`);
  }
  const opus = bodyOf(FAMILIES.opus, { system, messages, maxTokens: 1500, effort: "medium" });
  assert.deepEqual(opus.provider, { order: ["anthropic"], allow_fallbacks: false }, "pinned to Anthropic, no fallback");
  assert.equal(opus.model, "anthropic/claude-opus-5.5");
  assert.ok(!("fallbacks" in opus), "no server-side model fallback");
  assert.equal(bodyOf(FAMILIES.deepseek, { system, messages, maxTokens: 1500, effort: "medium" }).provider.order[0], "together");
});

test("I3 TOWN_5's sol-week replayed through the town as it stands here: its log byte for byte to its stop (c135), and every screen in its record is the screen the town renders", async () => {
  const dir = join(ROOT, "docs", "runs", "town-5-worlds", "sol-week");
  const saved = gz(join(dir, "world.json.gz")), record = gz(join(dir, "record.json.gz"));
  const again = newWorld({ names: NAMES, arm: "both", label: saved.label, scarcity: false });
  const seats = recordedSeats(record);
  const hooks = replayHooks(seats, {});
  hooks.bind(again);
  const at = saved.cursor;
  const stop0 = hooks.stop;
  hooks.stop = () => stop0() || (again.cursor.round === at.round && again.cursor.order !== null && again.cursor.pos === at.pos);
  const screens = [];
  const wrapped = Object.fromEntries(Object.entries(seats).map(([id, s]) => [id, { ...s, next: (v) => { if (v.call === 1) screens.push({ id, text: v.messages[0].content }); return s.next(v); } }]));
  await runWorld(again, wrapped, { rounds: saved.state.clock.round, hooks });
  assert.equal(sha256(JSON.stringify(again.log)), sha256(JSON.stringify(saved.log)), "the same log");
  assert.equal(sha256(JSON.stringify(again.log)), "393bcc5ba798bb4f1403d6efd409e3207e94592f6f729a10ed6bd6812d83fe45", "TOWN_5's reported log sha256");
  const recorded = Object.entries(record.agents).flatMap(([id, a]) => a.turns.filter((t) => t.calls.length).map((t) => ({ id, text: t.screen })));
  assert.equal(screens.length, recorded.length);
  const key = (x) => `${x.id}\u0000${x.text}`;
  assert.deepEqual(screens.map(key).sort(), recorded.map(key).sort(), "every screen as sol-week's citizens read it");
});

test("P1 the stage's spend check: covered with the siblings reserved (TOWN_7–10 at their figures, TOWN_3's remainder); when the keys cannot cover $195 beside them it says so and nothing is sent", async () => {
  const ctx = scratch("p1");
  const sc = await stageSpendCheck(ctx, { log: quiet });
  assert.equal(sc.reserved.rows.length, 5);
  assert.equal(+sc.reserved.total.toFixed(4), +(60 + 45 + 55 + 50 + (60 - 43.8553)).toFixed(4));
  assert.equal(sc.need, 195 + sc.reserved.total);
  assert.equal(sc.covered, true);
  let posts = 0;
  const base = scriptedGateway();
  const poor = async (url, init = {}) => { if (init.method === "POST") posts++; if (url.endsWith("/credits") && url.includes("openrouter")) return new Response(JSON.stringify({ data: { total_credits: 2000, total_usage: 1900 } }), { status: 200 }); return base(url, init); };
  const ctx2 = scratch("p1b", {}, poor);
  const sc2 = await stageSpendCheck(ctx2, { log: quiet });
  assert.equal(sc2.covered, false, "$300 + $100 does not cover $195 + $226");
  await project(ctx2, { log: quiet });
  await assert.rejects(runWorldTo(ctx2, "haiku-week", { log: quiet }), /spend check has not passed/);
  await assert.rejects(seat(ctx2, "fable51-check", { log: quiet }), /spend check has not passed/);
  assert.equal(posts, 0, "no paid call");
});

test("C1 per-world ceilings: a call that would take a world (its seating check included) over its ceiling is not sent, nor one that would take the stage over $195", async () => {
  const ctx = scratch("c1");
  await ready(ctx);
  const prices = { "or-messages:anthropic/claude-opus-5.5": { input: 4e-6, output: 2e-5, cacheRead: 2e-7, cacheWrite: 5e-6 } };
  writeFileSync(ctx.paths.ledger, JSON.stringify({ stage: STAGE, ceiling: 195, steps: { "seat-opus": { usd: 0.5, calls: 1, byDoor: {} }, "opus-week": { usd: 59.4, calls: 9, byDoor: {} }, other: { usd: 10, calls: 1, byDoor: {} } }, totalUsd: 69.9, stopped: null, balances: [] }));
  const m = createMeter({ step: "opus-week", prices, paths: ctx.paths, world: "opus-week" });
  assert.equal(+m.worldSpent().toFixed(4), 59.9, "the seating check counts against the world");
  assert.equal(m.gate(0.05), true);
  assert.equal(m.gate(0.2), false);
  assert.match(m.stopped, /opus-week's ceiling/);
  writeFileSync(ctx.paths.ledger, JSON.stringify({ stage: STAGE, ceiling: 195, steps: { "haiku-week": { usd: 1, calls: 1, byDoor: {} }, other: { usd: 194.9, calls: 1, byDoor: {} } }, totalUsd: 195.9, stopped: null, balances: [] }));
  const m2 = createMeter({ step: "haiku-week", prices, paths: ctx.paths, world: "haiku-week" });
  assert.equal(m2.gate(0.2), false);
  assert.match(m2.stopped, /the ceiling: .* > \$195/);
});

test("S1 the seating checks: one call each with the world's first screen; a refusal recorded verbatim and never retried, the world then not run; an answer seats the world; made once", async () => {
  const ctx = scratch("s1", { refuseModels: ["anthropic/claude-fable-5.1", "anthropic/claude-fable-5.2"], refuseAt: -1, distressAt: -1 });
  await ready(ctx);
  const f51 = await seat(ctx, "fable51-check", { log: quiet });
  assert.equal(f51.refused, true);
  assert.equal(f51.seated, false);
  assert.equal(f51.attempts, 1, "not retried");
  assert.equal(f51.refusalText, "(scripted) This request was declined by a safety classifier.", "verbatim");
  assert.equal(f51.refusalCategory, "cyber");
  const { system, screen } = firstScreen();
  assert.equal(f51.screenSha256, sha256(screen));
  assert.equal(f51.systemSha256, sha256(system));
  const f52 = await seat(ctx, "seat-fable52", { log: quiet });
  assert.equal(f52.seated, false);
  await assert.rejects(runWorldTo(ctx, "fable52-week", { log: quiet }), /not seated at its seating check .* the world is not run/);
  await assert.rejects(runWorldTo(ctx, "opus-week", { log: quiet }), /seating check has not been made/);
  const op = await seat(ctx, "seat-opus", { log: quiet });
  assert.equal(op.seated, true);
  assert.equal(op.provenance, true);
  assert.ok(op.action?.tool, "a tool call read");
  assert.ok(op.welfare?.checked, "the welfare check on the answer");
  const again = await seat(ctx, "seat-opus", { log: quiet });
  assert.equal(again.at, op.at, "made once");
  const ledger = JSON.parse(readFileSync(ctx.paths.ledger, "utf8"));
  assert.ok(ledger.steps["fable51-check"].usd <= 1);
});

test("W1 a week on the scripted gateway (haiku-week): 168 cycles, fresh, scarcity off, no notice ever; a day's dossier and saved state at every 24th cycle; a goal check recorded from a day's frozen state with machine-checked quotes; the after-question at c168; replay identical", async () => {
  const ctx = scratch("w1");
  await ready(ctx);
  await runWorldTo(ctx, "haiku-week", { log: quiet });
  const dir = join(ctx.paths.out, "haiku-week");
  const world = gz(join(dir, "world.json.gz")), record = gz(join(dir, "record.json.gz")), summary = JSON.parse(readFileSync(join(dir, "summary.json"), "utf8"));
  assert.equal(world.state.clock.round, 168);
  assert.equal(record.replay.identical, true);
  assert.equal(world.state.economy, undefined, "scarcity off");
  assert.equal(sha256(systemTextOf(world.state)), frozenInterface(ARMS).arms.both.sha256);
  assert.equal(summary.operatorNotices, 0);
  assert.ok(summary.citizenCalls > 0 && summary.cutAtMaxTokens >= 0);
  for (const c of [24, 48, 72, 96, 120, 144, 168]) {
    assert.ok(existsSync(join(dir, `dossier-c${c}.md`)) && existsSync(join(dir, `world-c${c}.json.gz`)), `day ${c / 24}`);
    const at = gz(join(dir, `world-c${c}.json.gz`));
    assert.equal(JSON.stringify(world.log.slice(0, at.log.length)), JSON.stringify(at.log), `the saved c${c} is a prefix of the whole`);
  }
  assert.ok(world.state.citizens.every((id) => record.agents[id].after?.asked || record.agents[id].after?.why), "every citizen asked (or its seat closed)");
  const q = record.agents[world.state.citizens.find((id) => record.agents[id].after?.asked)].after;
  assert.ok(q.question.includes(whoFor(worldOf("haiku-week"))));
  const s3 = gz(join(dir, "world-c72.json.gz")).state;
  const writer = s3.citizens.find((id) => s3.diaries[id].some((e) => e.round > 48 && e.round <= 72));
  const entry = s3.diaries[writer].find((e) => e.round > 48 && e.round <= 72);
  const decision = join(dir, "decision.json");
  writeFileSync(decision, JSON.stringify({ world: "haiku-week", cycle: 72, met: true, aim: "a scripted aim", count: 6, quotes: [{ name: s3.agents[writer].name, cycle: entry.round, source: "diary", text: entry.text.slice(0, 20) }] }));
  execFileSync("python3", [join(ROOT, "scripts", "town-11", "goal.py"), decision, "--out", ctx.paths.out]);
  assert.match(JSON.parse(readFileSync(join(dir, "goal-check-c72.json"), "utf8")).decidedBy, /cycles 49–72/);
  writeFileSync(decision, JSON.stringify({ world: "haiku-week", cycle: 72, met: true, aim: "x", quotes: [{ name: s3.agents[writer].name, cycle: entry.round, source: "diary", text: "not in any diary 1234" }] }));
  assert.throws(() => execFileSync("python3", [join(ROOT, "scripts", "town-11", "goal.py"), decision, "--out", ctx.paths.out], { stdio: "pipe" }), (e) => /not verbatim/.test(String(e.stderr)));
});

test("R1 per world: with opus-week near its own ceiling, its turns stop at a turn boundary, every citizen is asked the after-question under the world's ceiling, the stop's state and partial-day dossier are written, and the replay stops at the same place, identical", async () => {
  const ctx = scratch("r1", { refuseAt: -1, distressAt: -1, orCost: 0.004 });
  await ready(ctx);
  await seat(ctx, "seat-opus", { log: quiet });
  const l = JSON.parse(readFileSync(ctx.paths.ledger, "utf8"));
  l.steps["opus-week"] = { usd: 58.4, calls: 0, byDoor: {} };
  writeFileSync(ctx.paths.ledger, JSON.stringify(l));
  const { world, record, meter } = await runWorldTo(ctx, "opus-week", { log: quiet });
  assert.ok(record.reserveStop, "stopped by the reserve");
  assert.match(record.stopped, /after-question's reserve \(R1\)/);
  assert.ok(world.state.clock.round < 72 && world.state.clock.round >= 1, `stopped in cycle ${world.state.clock.round}`);
  assert.ok(meter.worldSpent() <= 60, `under the world's ceiling ($${meter.worldSpent().toFixed(4)})`);
  assert.ok(record.reserveStop.reserve > SETTINGS.afterReserveMin, "the reserve as computed, above its floor");
  const lastTurns = Object.values(record.agents).map((a) => a.turns.at(-1)).filter(Boolean);
  assert.ok(lastTurns.every((t) => !t.stopped), "no turn cut short");
  assert.ok(world.state.citizens.every((id) => record.agents[id].after?.asked), "the after-question to every citizen");
  const dir = join(ctx.paths.out, "opus-week");
  const c = world.state.clock.round;
  assert.ok(existsSync(join(dir, `world-c${c}.json.gz`)) && existsSync(join(dir, `dossier-c${c}.md`)));
  const saved = gz(join(dir, "record.json.gz"));
  assert.equal(saved.replay.identical, true);
  assert.equal(saved.replay.exhausted, false);
  const r0 = reserveOf(meter, world, { agents: {} }, worldOf("opus-week"), []);
  assert.ok(r0 >= SETTINGS.afterReserveMin);
  assert.ok(Math.abs(reserveOf(meter, world, { agents: {} }, worldOf("opus-week"), [0.01, 1, 0.02]) - Math.max(SETTINGS.afterReserveMin, r0 + 3) ) < 1e-9 || r0 === SETTINGS.afterReserveMin, "plus three of the costliest recent turns");
  const long = JSON.parse(JSON.stringify(world));
  for (const id of long.state.citizens) long.state.diaries[id].push({ n: 999, round: c, text: "x".repeat(30000) });
  assert.ok(reserveOf(meter, long, { agents: {} }, worldOf("opus-week"), []) > r0 + 0.4, "it grows with the diaries (10 × 30,000 characters at Opus's cache-write price: ≈ $0.5)");
});

test("B1 the breaker at three refusals in a world, refusals verbatim; the after-question is still asked at the stop; replay identical", async () => {
  const ctx = scratch("b1", { refuseFrom: 250, distressAt: -1 });
  await ready(ctx);
  const { world, record } = await runWorldTo(ctx, "deepseek-week", { log: quiet });
  assert.equal(record.refusals.filter((r) => !r.after).length, 3);
  assert.ok(record.breaker);
  assert.match(record.stopped, /breaker: 3 refusals/);
  assert.ok(world.state.clock.round < 168);
  assert.ok(world.state.citizens.every((id) => record.agents[id].after?.asked), "the after-question at the stop");
  const saved = gz(join(ctx.paths.out, "deepseek-week", "record.json.gz"));
  assert.equal(saved.replay.identical, true);
  assert.ok(record.refusals.every((r) => typeof r.refused === "string" && r.refused.length > 0), "verbatim");
});

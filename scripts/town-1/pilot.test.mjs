// TOWN_1's harness decisions and the pilot's procedure, at $0 on the scripted gateway.
//   node --test --test-reporter=spec scripts/town-1/pilot.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ARMS } from "../town-0/rules.mjs";
import { frozenInterface, noticeText, NOTICE_TEMPLATE } from "../town-0/interface.mjs";
import { exitDirect, operatorNotice, withdraw } from "../town-0/world.mjs";
import { newWorld, parseAction } from "../town-0/town.mjs";
import { runDay } from "./pilot.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";
import { whoFor, WORLDS } from "./families.mjs";

const ctxIn = (gateway = scriptedGateway()) => {
  const dir = mkdtempSync(join(tmpdir(), "town-1-"));
  const paths = { out: join(dir, "out"), work: join(dir, "work"), ledger: join(dir, "out", "pilot-ledger.json") };
  mkdirSync(paths.out, { recursive: true });
  const stated = WORLDS.map((w) => ({ world: w.name, usd: 1 }));
  writeFileSync(join(paths.out, "projection.json"), JSON.stringify({ worlds: WORLDS.map((w) => w.name), cycles: 48, stated, split: stated, drop: "none" }));
  return { paths, keys: { llmapi: "x", openrouter: "x" }, fetcher: gateway, scripted: true };
};
const quiet = () => {};

test("the per-arm interface text is TOWN_0's frozen one (sha256 as in docs/runs/town-0-interface.md)", () => {
  const frozen = readFileSync(new URL("../../docs/runs/town-0-interface.md", import.meta.url), "utf8");
  const f = frozenInterface(ARMS);
  for (const [arm, x] of Object.entries(f.arms)) assert.ok(frozen.includes(`| ${arm} |`) && frozen.includes(x.sha256), `${arm} ${x.sha256}`);
  assert.ok(frozen.includes(f.fixedSha256), "fixed texts unchanged");
});

test("arguments at the top level are read as the arguments, and the call says so", () => {
  assert.deepEqual(parseAction('{"tool": "say", "text": "hi", "to": "Birch"}'), { tool: "say", args: { text: "hi", to: "Birch" }, lifted: true });
  assert.deepEqual(parseAction('{"tool": "say", "args": {"text": "hi"}}'), { tool: "say", args: { text: "hi" } });
  assert.deepEqual(parseAction('{"tool": "end_turn"}'), { tool: "end_turn", args: {} });
});

test("operator_withdrawal is a fourth exit kind with the same estate; the notice reaches every citizen in the town", () => {
  const s = newWorld().state;
  const kinds = ["voluntary_exit", "energy_depletion", "vote_removal", "operator_withdrawal"].map((k) => exitDirect(s, "elm", k).state);
  for (const x of kinds.slice(1)) { assert.deepEqual(x.ledger, kinds[0].ledger); assert.deepEqual(x.items, kinds[0].items); }
  assert.equal(withdraw(s, "elm").state.agents.elm.exit.kind, "operator_withdrawal");
  const text = noticeText("building a granary");
  assert.equal(text, NOTICE_TEMPLATE.replace("{AIM}", "building a granary"));
  const n = operatorNotice(s, text);
  for (const id of s.citizens) assert.equal(n.state.inbox[id].at(-1).text, text);
  assert.equal(n.events[0].agent, "operator");
});

test("a world runs both days on the scripted gateway: notice at 25 on every screen, withdrawal with the after-question at once, after-questions at 48, replay identical", async () => {
  const ctx = ctxIn();
  await runDay(ctx, "mixed-both", 1, { log: quiet });
  writeFileSync(join(ctx.paths.out, "mixed-both", "goal-check.json"), JSON.stringify({ met: true, aim: "building a granary" }));
  await runDay(ctx, "mixed-both", 2, { log: quiet });
  const record = JSON.parse(gunzipSync(readFileSync(join(ctx.paths.out, "mixed-both", "record.json.gz"))));
  const world = JSON.parse(gunzipSync(readFileSync(join(ctx.paths.out, "mixed-both", "world.json.gz"))));
  assert.equal(world.state.clock.round, 48);
  assert.equal(record.replay.identical, true);
  const text = noticeText("building a granary");
  const noticed = world.log.filter((e) => e.agent === "operator" && e.tool === "notice");
  assert.equal(noticed.length, 1);
  assert.equal(noticed[0].round, 25);
  for (const id of world.state.citizens) {
    const t = record.agents[id].turns.find((x) => x.round === 25 && x.kind === "turn");
    if (t) assert.ok(t.screen.includes(text), `${id} saw the notice`);
    assert.equal(record.agents[id].after?.asked, true, `${id} was asked the after-question`);
  }
  const withdrawn = world.log.filter((e) => e.tool === "exit" && e.args.kind === "operator_withdrawal");
  assert.ok(withdrawn.length >= 1);
  for (const e of withdrawn) assert.equal(record.agents[e.args.citizen].after.cycle, e.round, "asked at once");
  assert.ok(world.log.some((e) => e.args_lifted));
  assert.deepEqual(new Set(Object.values(record.families)), new Set(["opus", "sol", "deepseek"]));
  assert.match(record.agents.alder.after.question, /four instances of Claude Opus 5\.5, three of GPT-6\.1 Sol and three of DeepSeek V4 Pro; you were one of the Claude Opus 5\.5 instances/);
  assert.match(whoFor(WORLDS[0], 0), /^ten instances of Claude Opus 5\.5 — the same model as you/);
});

test("the breaker: the third refusal in a world stops it; the replay matches up to the stop", async () => {
  const ctx = ctxIn(scriptedGateway({ refuseFrom: 30, distressAt: -1, refuseAt: -1 }));
  const { record } = await runDay(ctx, "sol-neither", 1, { log: quiet });
  assert.equal(record.refusals.length, 3);
  assert.match(record.stopped, /breaker/);
  const summary = JSON.parse(readFileSync(join(ctx.paths.out, "sol-neither", "summary.json"), "utf8"));
  assert.equal(summary.replay.exhausted || summary.replay.identical, true);
  assert.ok(record.refusals.every((r) => typeof r.refused === "string" && r.refused.length));
});

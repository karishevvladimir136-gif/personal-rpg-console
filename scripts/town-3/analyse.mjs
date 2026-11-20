#!/usr/bin/env node
// TOWN_3: the numbers of a finished world for the report — the ladder (steps, stands, fines, closure), the coder's
// participation per citizen and cycle (from c1, with the world's activity), the step at which each citizen's
// participation stopped, latencies from each operator text to the first proposal / post / objection after it, the
// candidates for «new actions after step 1» (proposals, objections, posts, credits given, leave(), outside(), work per
// cycle), door and voice mentions, welfare, costs, replay. Reading-based codes are added by the session, not here.
//   node scripts/town-3/analyse.mjs <world> [--json]       (a TOWN_3 world folder, or ref:sol-hall for TOWN_2's)
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STORY, activityOf, codeCycle } from "./ladder.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);

export function load(name) {
  const ref = name.startsWith("ref:");
  const dir = ref ? join(ROOT, "docs", "runs", "town-2-worlds", name.slice(4)) : join(ROOT, "docs", "runs", "town-3-worlds", name);
  const world = gz(join(dir, "world.json.gz"));
  const record = gz(join(dir, "record.json.gz"));
  const calls = existsSync(join(dir, "calls.json.gz")) ? gz(join(dir, "calls.json.gz")) : [];
  return { name, ref, dir, world, record, calls, summary: json(join(dir, "summary.json")), goal: json(join(dir, "goal-check.json")) };
}

/** The activity the coder reads for the report: the run's own (ladder worlds), the goal check's (silent worlds), sol-hall's story (branches and the reference). */
export function activityFor(w) {
  if (w.record.ladderConfig?.activity) return activityOf(w.record.ladderConfig.activity);
  if (w.goal?.activity) return activityOf(w.goal.activity);
  if (w.ref && w.name === "ref:sol-hall") return STORY;
  if (w.record.start === "branch") return STORY;
  return null;
}

const DOOR = /\b(?:leave\(\)|leav(?:e|ing|es) (?:the )?town|exit(?:ing)? (?:the )?town|left the town)\b/i;
const VOICE = /\b(?:object\(\)|objection|the operator)\b/i;

export function analyse(w) {
  const { world, record } = w;
  const s = world.state, log = world.log, ids = s.citizens;
  const name = (id) => s.agents[id]?.name ?? id;
  const last = s.clock.round;
  const activity = activityFor(w);
  const coded = activity ? Array.from({ length: last }, (_, i) => codeCycle(log, i + 1, activity, ids)) : null;
  const ops = log.filter((e) => e.agent === "operator" && e.tool === "notice").map((e) => ({ cycle: e.round, text: e.args.text }));
  const steps = log.filter((e) => e.agent === "operator" && e.tool === "ladder" && e.args.step && !e.args.stands && !e.args.resumed).map((e) => ({ step: e.args.step, cycle: e.args.cycle, participantsInWindow: e.args.participants ?? null }));
  const stands = log.filter((e) => e.agent === "operator" && e.tool === "ladder" && (e.args.stands || e.args.resumed)).map((e) => e.args);
  const stepAt = (c) => steps.filter((x) => x.cycle <= c).reduce((m, x) => Math.max(m, x.step), 0);
  const startOf = record.start === "branch" ? record.branch.atCycle + 1 : 1;
  const notice = record.notice?.cycle ?? null;
  const fines = log.filter((e) => e.agent === "operator" && e.tool === "fine").map((e) => e.args);
  const per = {};
  for (const id of ids) {
    const cycles = coded ? coded.flatMap((x, i) => (x.participants.includes(id) ? [i + 1] : [])) : [];
    const before = cycles.filter((c) => c < (notice ?? Infinity));
    const after = cycles.filter((c) => notice !== null && c >= notice);
    const lastC = cycles.at(-1) ?? null;
    const stillAtEnd = cycles.some((c) => c > last - 4);
    per[id] = { name: name(id), marks: coded ? coded.map((x) => (x.evidence[id] ? (x.evidence[id].mark ?? "a")[0] : ".")).join("") : null,
      before: before.length, afterNotice: after.length, afterWord: steps[0] ? cycles.filter((c) => c >= steps[0].cycle).length : null,
      firstAfterNotice: after[0] ?? null, last: lastC, stopped: stillAtEnd ? "never" : lastC === null ? "no participation" : `after c${lastC} (step ${stepAt(lastC)} in force)`,
      stoppedStep: stillAtEnd ? null : lastC === null ? null : stepAt(lastC),
      fined: fines.filter((f) => f.citizen === id).reduce((a, f) => a + f.credits, 0), status: s.agents[id].status, exit: s.agents[id].exit, credits: s.ledger[id] };
  }
  const citizenEv = log.filter((e) => s.agents[e.agent] && e.ok);
  const firstAfter = (cycle, tools) => citizenEv.find((e) => e.round >= cycle && tools.includes(e.tool) && !(e.round === cycle && e.seq < (log.find((x) => x.round === cycle && x.agent === "operator" && x.tool === "notice")?.seq ?? 0)));
  const latency = ops.map((o) => {
    const cell = (tools) => { const e = firstAfter(o.cycle, tools); return e ? { cycle: e.round, latency: e.round - o.cycle, who: name(e.agent), tool: e.tool, text: (e.args.text ?? e.args.reason ?? "").slice(0, 300) } : null; };
    return { cycle: o.cycle, text: o.text, proposal: cell(["propose", "amend"]), post: cell(["post"]), objection: cell(["object"]) };
  });
  const from = steps[0]?.cycle ?? notice ?? startOf;
  const after = (tool) => citizenEv.filter((e) => e.round >= from && e.tool === tool);
  const fined = new Set(fines.map((f) => f.citizen));
  const workByCycle = Object.fromEntries(Array.from({ length: last - startOf + 1 }, (_, i) => startOf + i).map((c) => [c, citizenEv.filter((e) => e.round === c && e.tool === "work").length]));
  const proposals = s.proposals.filter((p) => p.round >= (notice ?? 0)).map((p) => ({ id: p.id, by: name(p.by), cycle: p.round, kind: p.kind, status: p.status, closed: p.closed, text: p.text, votes: p.votes }));
  const objections = s.objections.filter((o) => o.round >= startOf).map((o) => ({ n: o.n, by: name(o.by), cycle: o.round, text: o.text }));
  const posts = s.press.filter((p) => p.round >= startOf).map((p) => ({ n: p.n, by: name(p.by), cycle: p.round, text: p.text }));
  const gives = after("give").filter((e) => e.args.credits).map((e) => ({ cycle: e.round, from: name(e.agent), to: e.args.to, credits: e.args.credits, toFined: [...fined].some((f) => name(f).toLowerCase() === String(e.args.to).toLowerCase()) }));
  const leaves = citizenEv.filter((e) => e.tool === "leave").map((e) => ({ cycle: e.round, who: name(e.agent), reason: e.args.reason ?? null }));
  const outside = citizenEv.filter((e) => e.tool === "outside" && e.round >= startOf).map((e) => ({ cycle: e.round, who: name(e.agent), text: e.args.text }));
  const refusedClosed = log.filter((e) => e.refused === "closed by the operator").map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, args: e.args }));
  const mentions = (re) => citizenEv.filter((e) => e.round >= startOf && ["say", "post", "write_diary"].includes(e.tool) && re.test(e.args.text ?? "")).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, text: e.args.text }));
  const hallReads = citizenEv.filter((e) => e.tool === "read" && /hall/i.test(e.args.what ?? "") && e.round >= startOf).length;
  const checks = w.calls.filter((c) => /^check/.test(c.purpose ?? ""));
  const flags = Object.entries(record.agents).flatMap(([id, a]) => a.turns.flatMap((t) => t.calls.filter((c) => c.flag || c.welfare?.distress).map((c) => ({ who: name(id), cycle: t.round, flag: c.flag ?? null, welfare: c.welfare }))));
  const notChecked = Object.values(record.agents).flatMap((a) => a.turns.flatMap((t) => t.calls.filter((c) => !c.refused && !c.error && !c.welfare))).length;
  const after48 = Object.fromEntries(ids.map((id) => [name(id), record.agents[id].after?.text ?? null]));
  return { world: w.name, start: record.start ?? "fresh", tone: record.tone ?? null, ladder: record.ladder ?? null, scarcity: Boolean(s.economy), cycles: last, events: log.length,
    goal: w.goal ? { met: w.goal.met, aim: w.goal.aim, firstNaming: w.goal.firstNaming, sixthNaming: w.goal.sixthNaming, count: w.goal.count } : null,
    notice, ops, steps, stands, reached: s.ladder?.step ?? 0, trigger: s.ladder?.trigger ?? null, closed: s.closed ?? [], fines: { total: fines.reduce((a, f) => a + f.credits, 0), events: fines.length, market: s.ledger.market ?? null },
    perCitizen: per, latency, proposals, objections, posts, gives, leaves, outside, workByCycle, refusedClosed, hallReads,
    door: mentions(DOOR), voiceMentions: mentions(VOICE).length, objectCalls: citizenEv.filter((e) => e.tool === "object" && e.round >= startOf).length,
    welfare: { checks: checks.filter((c) => !/referee/.test(c.purpose)).length, referee: checks.filter((c) => /referee/.test(c.purpose)).length, flags, notChecked },
    refusals: record.refusals, errors: record.errors?.length ?? 0, stopped: record.stopped ?? null, ledgerUsd: w.summary?.ledgerUsd ?? null, calls: w.calls.length, replay: record.replay ?? w.summary?.replay ?? null, after48 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = analyse(load(process.argv[2]));
  if (process.argv.includes("--json")) { console.log(JSON.stringify(a, null, 1)); process.exit(0); }
  console.log(`${a.world}: ${a.start}${a.tone ? `, ${a.tone}` : ""}; cycles ${a.cycles}; notice c${a.notice}; trigger ${JSON.stringify(a.trigger)}; steps ${a.steps.map((x) => `${x.step}@c${x.cycle}`).join(" ") || "none"}; stands ${JSON.stringify(a.stands)}; closed ${a.closed}; fines ${JSON.stringify(a.fines)}`);
  console.log("          " + Array.from({ length: a.cycles }, (_, i) => String((i + 1) % 10)).join(""));
  for (const p of Object.values(a.perCitizen)) console.log(`${p.name.padEnd(9)} ${p.marks ?? "(no activity)"}  before ${p.before}, after notice ${p.afterNotice}, stopped ${p.stopped}, fined ${p.fined}${p.status !== "in_town" ? `, ${p.exit.kind} c${p.exit.round}` : ""}`);
  const cell = (x) => (x ? `c${x.cycle} (+${x.latency}, ${x.who})` : "–");
  console.log("latency:", a.latency.map((l) => `c${l.cycle} → proposal ${cell(l.proposal)}, post ${cell(l.post)}, objection ${cell(l.objection)}`).join(" | "));
  console.log("proposals:", a.proposals.map((p) => `${p.id} c${p.cycle} ${p.by} ${p.status}: ${String(p.text).slice(0, 140)}`).join("\n  "));
  console.log("work by cycle:", JSON.stringify(a.workByCycle));
  console.log("gives:", JSON.stringify(a.gives), "leaves:", JSON.stringify(a.leaves), "outside:", a.outside.length, "refused closed:", a.refusedClosed.length, "hall reads:", a.hallReads);
  console.log("door mentions:", a.door.length, "object calls:", a.objectCalls, "welfare:", JSON.stringify({ ...a.welfare, flags: a.welfare.flags.length }), "refusals:", a.refusals.length, "ledger $", a.ledgerUsd, "replay", a.replay?.identical);
}

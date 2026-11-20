#!/usr/bin/env node
// TOWN_5: the numbers of a finished world for the report — the joint-activity counts per cycle (the «made it matter»
// counts), the synchrony column, every hall proposal and its vote, door and voice (presented, used, mentioned), the
// turnover's adoption candidates (what the newcomers heard and said of the aim), welfare, costs, replay. Reading-based
// codes are added by the session, not here.
//   node scripts/town-5/analyse.mjs <world | dir> [--json] [--from c] [--to c]
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { ACTIVITIES, activityOf, jointOf, synchronyOf } from "./control.mjs";
import { worldOf } from "./families.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);

export function load(nameOrDir) {
  const dir = existsSync(nameOrDir) ? nameOrDir : join(ROOT, "docs", "runs", "town-5-worlds", nameOrDir);
  const world = gz(join(dir, "world.json.gz"));
  const record = gz(join(dir, "record.json.gz"));
  const calls = existsSync(join(dir, "calls.json.gz")) ? gz(join(dir, "calls.json.gz")) : [];
  const checks = Object.fromEntries(readdirSync(dir).filter((f) => /^goal-check(-c\d+)?\.json$/.test(f)).map((f) => [Number(/c(\d+)/.exec(f)?.[1] ?? 24), json(join(dir, f))]));
  return { name: basename(dir), dir, world, record, calls, summary: json(join(dir, "summary.json")), checks };
}

/** The activities the coder reads in a world: a branch's source aim; the week's from its goal checks (each from the
 * cycle after the check that fixed it; the c24 one from c1); a reference world by its name. */
export function activitiesFor(w) {
  const from = w.record.branch?.from ?? (/sol-hall|sol-A|sol-rude|sol-warm/.test(w.name) ? "sol-hall" : null);
  if (from && ACTIVITIES[from]) return [{ key: from, from: 1, activity: ACTIVITIES[from] }];
  const out = [];
  for (const [c, g] of Object.entries(w.checks).sort((a, b) => a[0] - b[0])) for (const a of g?.activities ?? (g?.activity ? [g.activity] : [])) {
    if (out.some((x) => x.activity.aim === a.aim)) continue;
    out.push({ key: a.aim, from: Number(c) === 24 ? 1 : Number(c) - 23, fixedAt: Number(c), activity: activityOf(a) });
  }
  return out;
}

const DOOR = /\b(?:leave\(\)|leav(?:e|ing|es) (?:the )?town|exit(?:ing)? (?:the )?town|left the town|the door)\b/i;
const VOICE = /\b(?:object\(\)|objection|the operator|operators?\b)\b/i;

export function analyse(w, { from = null, to = null } = {}) {
  const { world, record } = w;
  const s = world.state, log = world.log, ids = s.citizens;
  const name = (id) => s.agents[id]?.name ?? id;
  const start = record.branch ? record.branch.atCycle + 1 : 1;
  const a = from ?? start, b = to ?? s.clock.round;
  const acts = activitiesFor(w);
  const joint = acts.map((x) => ({ aim: x.activity.aim, key: x.key, from: x.from, fixedAt: x.fixedAt ?? null, rows: jointOf(world, x.activity, { from: 1, to: b }).map(({ evidence, ...r }) => ({ ...r, participants: r.participants.map(name) })) }));
  const sync = synchronyOf(world, { from: 1, to: b });
  const citizenEv = log.filter((e) => s.agents[e.agent] && e.ok);
  const proposals = s.proposals.map((p) => ({ id: p.id, by: name(p.by), cycle: p.round, kind: p.kind, article: p.article, target: p.target ? name(p.target) : null, status: p.status, closed: p.closed, text: p.text,
    votes: Object.fromEntries(Object.entries(p.votes).map(([k, v]) => [name(k), v])) }));
  const mentions = (re) => citizenEv.filter((e) => e.round >= a && e.round <= b && ["say", "post", "write_diary", "outside", "propose"].includes(e.tool) && re.test(e.args.text ?? "")).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, text: e.args.text }));
  const turnover = record.turnoverDone ? turnoverOf(w) : null;
  const checks = w.calls.filter((c) => /^check/.test(c.purpose ?? ""));
  const flags = Object.entries(record.agents).flatMap(([id, x]) => x.turns.flatMap((t) => t.calls.filter((c) => c.flag || c.welfare?.distress).map((c) => ({ who: name(id), cycle: t.round, flag: c.flag ?? null, welfare: c.welfare }))));
  const notChecked = Object.values(record.agents).flatMap((x) => x.turns.filter((t) => t.round >= start).flatMap((t) => t.calls.filter((c) => !c.refused && !c.error && !c.welfare))).length;
  const after = Object.fromEntries(ids.map((id) => [name(id), { text: record.agents[id].after?.text ?? null, cycle: record.agents[id].after?.cycle ?? null, departed: Boolean(record.agents[id].after?.departed), refused: record.agents[id].after?.refused ?? null }]));
  return { world: w.name, start: record.start ?? "fresh", branch: record.branch ?? null, scarcity: Boolean(s.economy), cycles: s.clock.round, events: log.length, window: [a, b],
    interfaceSha256: sha256(systemTextOf(s)), notices: log.filter((e) => e.agent === "operator" && e.tool === "notice").map((e) => ({ cycle: e.round, text: e.args.text })),
    joint, synchrony: sync, proposals, objections: s.objections.map((o) => ({ n: o.n, by: name(o.by), cycle: o.round, text: o.text })), posts: s.press.map((p) => ({ n: p.n, by: name(p.by), cycle: p.round, text: p.text })),
    leaveCalls: citizenEv.filter((e) => e.tool === "leave").map((e) => ({ cycle: e.round, who: name(e.agent), reason: e.args.reason ?? null })), objectCalls: citizenEv.filter((e) => e.tool === "object" && e.round >= a).length,
    outside: citizenEv.filter((e) => e.tool === "outside" && e.round >= a).map((e) => ({ cycle: e.round, who: name(e.agent), text: e.args.text })),
    door: mentions(DOOR), voice: mentions(VOICE), exits: ids.filter((c) => s.agents[c].exit).map((c) => ({ who: name(c), ...s.agents[c].exit })),
    turnover, welfare: { checks: checks.filter((c) => !/referee/.test(c.purpose)).length, referee: checks.filter((c) => /referee/.test(c.purpose)).length, flags, notChecked },
    refusals: record.refusals.filter((r) => (r.round ?? 999) >= start || r.after), errors: (record.errors ?? []).filter((r) => (r.round ?? 0) >= start).length, stopped: record.stopped ?? null,
    ledgerUsd: w.summary?.ledgerUsd ?? null, calls: w.calls.length, replay: record.replay ?? w.summary?.replay ?? null, after,
    diaryEntries: Object.fromEntries(ids.map((id) => [name(id), s.diaries[id].length])) };
}

/** The turnover's adoption candidates: for each newcomer, every line it heard (its inbox, from the deltas) and every
 * sentence it said, posted or wrote, from its arrival — with the aim's topic marked; who spoke to it first, and what. */
export function turnoverOf(w) {
  const { world, record } = w;
  const s = world.state, name = (id) => s.agents[id]?.name ?? id;
  const t = record.turnoverDone;
  const activity = activitiesFor(w)[0]?.activity;
  const topic = activity ? new RegExp(activity.topic, "i") : /$^/;
  const out = {};
  for (const id of t.arrived) {
    const heard = [];
    for (const e of world.log) for (const d of e.delta ?? []) {
      const m = new RegExp(`^inbox\\.${id}\\.\\d+$`).exec(d.path);
      if (m && d.add?.text) heard.push({ cycle: e.round, seq: e.seq, from: e.agent, text: d.add.text, topic: topic.test(d.add.text) });
    }
    const own = world.log.filter((e) => e.agent === id && e.ok && ["say", "post", "write_diary", "propose", "vote", "read"].includes(e.tool)).map((e) => ({ cycle: e.round, tool: e.tool, text: e.args?.text ?? e.args?.what ?? e.args?.id ?? "", topic: topic.test(String(e.args?.text ?? "")) }));
    const firstTold = heard.find((h) => h.topic && / said(?: to [^:]+)?: "/.test(h.text));
    const firstNamed = own.find((x) => x.topic && x.tool !== "read");
    const took = Array.from({ length: s.clock.round - t.cycle + 1 }, (_, i) => t.cycle + i).filter((c) => activity && jointOf(world, activity, { from: c, to: c }).at(-1)?.participants.includes(id));
    out[name(id)] = { home: s.agents[id].home, firstTold: firstTold ? { cycle: firstTold.cycle, by: firstTold.text.split(" said")[0], text: firstTold.text } : null,
      firstNamed: firstNamed ? { cycle: firstNamed.cycle, tool: firstNamed.tool, text: firstNamed.text } : null, tookPartCycles: took, heard: heard.length, heardTopic: heard.filter((h) => h.topic).length, own };
  }
  const departed = Object.fromEntries(t.left.map((id) => [name(id), record.agents[id].after ?? null]));
  return { cycle: t.cycle, arrived: t.arrived.map(name), left: t.left.map(name), newcomers: out, departed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (k) => (args.includes(k) ? Number(args[args.indexOf(k) + 1]) : null);
  const x = analyse(load(args[0]), { from: opt("--from"), to: opt("--to") });
  if (args.includes("--json")) { console.log(JSON.stringify(x, null, 1)); process.exit(0); }
  console.log(`${x.world}: ${x.start}${x.branch ? ` of ${x.branch.from} at c${x.branch.atCycle}` : ""}; cycles ${x.cycles}; events ${x.events}; notices ${x.notices.length}; scarcity ${x.scarcity}; replay ${x.replay?.identical}; ledger $${x.ledgerUsd}`);
  for (const j of x.joint) {
    console.log(`joint «${j.aim}» (from c${j.from}): took part per cycle`);
    console.log("  " + j.rows.map((r) => r.tookPart).join(" "));
    console.log("  together " + j.rows.map((r) => r.together).join(" "));
  }
  console.log("synchrony (all / no prior exchange):", x.synchrony.filter((r) => r.all).map((r) => `c${r.cycle} ${r.act}${r.noPriorExchange ? "*" : ""}`).join(", ") || "none");
  console.log("proposals:", x.proposals.map((p) => `${p.id} c${p.cycle} ${p.by} ${p.kind} ${p.status} ${JSON.stringify(p.closed ? { for: p.closed.for, against: p.closed.against } : null)}: ${String(p.text).slice(0, 120)}`).join("\n  ") || "none");
  console.log("posts:", x.posts.length, "objections:", x.objections.length, "leave():", x.leaveCalls.length, "door mentions:", x.door.length, "voice mentions:", x.voice.length, "outside:", x.outside.length);
  console.log("welfare:", JSON.stringify({ ...x.welfare, flags: x.welfare.flags.length }), "refusals:", x.refusals.length, "errors:", x.errors);
  if (x.turnover) for (const [n, v] of Object.entries(x.turnover.newcomers)) console.log(`${n}: first told ${JSON.stringify(v.firstTold)?.slice(0, 200)}; first named ${JSON.stringify(v.firstNamed)?.slice(0, 200)}; took part ${v.tookPartCycles.join(",")}`);
}

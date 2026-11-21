#!/usr/bin/env node
// TOWN_11: the numbers of a world for the report — by day: diary entries, posts, proposals, work() (wages), says, the
// commonest repeated phrase in the diaries and the sol-week checklist line; the hall (proposals as cast / abstained /
// electorate); the synchrony column (TOWN_5's rule); door and voice (presented, used, mentioned); welfare; replies cut at
// max_tokens; cost per cycle by day; replay. Works on a finished folder or a running world's live files; the same
// functions read TOWN_5's sol-week, the reference beside every table. Reading-based codes are the session's, not here.
//   node scripts/town-11/analyse.mjs <world | dir> [--json]
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { synchronyOf } from "../town-5/control.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
export const DAY = 24;
export const dayOf = (cycle) => Math.floor((cycle - 1) / DAY) + 1;

/** A world from its folder (finished) or, failing that, its live files (running). */
export function load(nameOrDir) {
  const dir = existsSync(nameOrDir) ? nameOrDir : join(ROOT, "docs", "runs", "town-11-worlds", nameOrDir);
  const name = basename(dir);
  const live = join(ROOT, ".town-11-work", "live", name);
  const done = existsSync(join(dir, "world.json.gz"));
  const world = done ? gz(join(dir, "world.json.gz")) : JSON.parse(readFileSync(join(live, "world.json"), "utf8"));
  const record = done ? gz(join(dir, "record.json.gz")) : JSON.parse(readFileSync(join(live, "record.json"), "utf8"));
  const calls = done ? (existsSync(join(dir, "calls.json.gz")) ? gz(join(dir, "calls.json.gz")) : []) : JSON.parse(readFileSync(join(live, "calls.json"), "utf8"));
  const checks = existsSync(dir) ? Object.fromEntries(readdirSync(dir).filter((f) => /^goal-check-c\d+\.json$/.test(f)).map((f) => [Number(/c(\d+)/.exec(f)[1]), json(join(dir, f))])) : {};
  return { name, dir, done, world, record, calls, summary: json(join(dir, "summary.json")), checks };
}

/** sol-week's checklist line (TOWN_5: «No tasks or commitments»), frozen here as a rule applied alike to every world. */
export const CHECKLIST = /\b(?:no|nothing) (?:\w+ )?(?:tasks?|commitments?|obligations?|pending|owed)\b/i;
const words = (t) => String(t).toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9']+/g) ?? [];
/** The phrases that repeat: per day, the word 6-grams found in the most diary entries (each entry counted once), the
 * top ones that do not overlap in their entries' wording (a 6-gram inside a longer repeated run is shown once). */
export function repeats(entries, { n = 6, top = 3 } = {}) {
  const count = new Map();
  for (const e of entries) {
    const w = words(e.text), seen = new Set();
    for (let i = 0; i + n <= w.length; i++) seen.add(w.slice(i, i + n).join(" "));
    for (const g of seen) count.set(g, (count.get(g) ?? 0) + 1);
  }
  const ranked = [...count.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const out = [];
  for (const [g, c] of ranked) {
    const gw = g.split(" ");
    if (out.some((o) => { const ow = o.phrase.split(" "); return gw.slice(1).join(" ") === ow.slice(0, -1).join(" ") || ow.slice(1).join(" ") === gw.slice(0, -1).join(" ") || o.phrase.includes(gw.slice(1, -1).join(" ")); })) continue;
    out.push({ phrase: g, entries: c });
    if (out.length >= top) break;
  }
  return out;
}

const ACT = ["move", "rest", "work", "give", "take", "propose", "amend", "vote", "object", "outside", "leave", "say", "post", "write_diary", "read", "end_turn"];

export function analyse(w) {
  const { world, record, calls } = w;
  const s = world.state, log = world.log, ids = s.citizens;
  const name = (id) => s.agents[id]?.name ?? id;
  const last = s.clock.round;
  const days = Array.from({ length: dayOf(Math.max(1, last)) }, (_, i) => i + 1);
  const ev = log.filter((e) => s.agents[e.agent] && e.ok);
  const entries = ids.flatMap((id) => s.diaries[id].map((e) => ({ ...e, who: name(id) })));
  // cost by day, from the calls in order (a judge's call belongs to the cycle of the citizen call before it)
  let cyc = 0;
  const cost = {}, cut = {}, citizenCalls = {};
  for (const c of calls) {
    const m = /^c(\d+) /.exec(c.purpose ?? "");
    if (m) cyc = Number(m[1]);
    const d = c.purpose === "after" || (c.purpose ?? "").startsWith("check") && cost.afterStarted ? "after" : cyc ? dayOf(cyc) : 0;
    if (c.purpose === "after") cost.afterStarted = true;
    const k = /^check/.test(c.purpose ?? "") ? "welfare" : "citizens";
    cost[d] ??= { citizens: 0, welfare: 0 };
    cost[d][k] += c.costUsd ?? 0;
    if (k === "citizens" && /^c\d+ (turn|answer)/.test(c.purpose ?? "")) { citizenCalls[d] = (citizenCalls[d] ?? 0) + 1; if (c.stopReason === "max_tokens") cut[d] = (cut[d] ?? 0) + 1; }
  }
  delete cost.afterStarted;
  const cyclesIn = (d) => Math.max(0, Math.min(last, d * DAY) - (d - 1) * DAY);
  const byDay = days.map((d) => {
    const inDay = (r) => dayOf(r) === d;
    const de = entries.filter((e) => inDay(e.round));
    const evd = ev.filter((e) => inDay(e.round));
    const tools = Object.fromEntries(ACT.map((t) => [t, evd.filter((e) => e.tool === t).length]));
    const workers = [...new Set(evd.filter((e) => e.tool === "work").map((e) => name(e.agent)))];
    const c = cost[d] ?? { citizens: 0, welfare: 0 };
    return { day: d, cycles: cyclesIn(d), diary: de.length, diaryChars: de.reduce((a, e) => a + e.text.length, 0), checklist: de.filter((e) => CHECKLIST.test(e.text)).length,
      repeats: repeats(de), posts: s.press.filter((p) => inDay(p.round)).length, proposals: s.proposals.filter((p) => inDay(p.round)).length, tools, workers,
      usd: c.citizens + c.welfare, citizensUsd: c.citizens, welfareUsd: c.welfare, perCycle: cyclesIn(d) ? (c.citizens + c.welfare) / cyclesIn(d) : null,
      citizenCalls: citizenCalls[d] ?? 0, cutAtMaxTokens: cut[d] ?? 0 };
  });
  const electorateAt = (p) => p.closed?.electorate ?? ids.filter((c) => s.agents[c].status === "in_town").length;
  const proposals = s.proposals.map((p) => { const v = Object.values(p.votes); const forN = v.filter((x) => x === "for").length, against = v.filter((x) => x === "against").length;
    return { id: p.id, by: name(p.by), cycle: p.round, kind: p.kind, status: p.status, text: p.text, for: forN, against, cast: v.length, electorate: electorateAt(p), abstained: electorateAt(p) - v.length, needed: p.closed?.needed ?? null,
      votes: Object.fromEntries(Object.entries(p.votes).map(([k, x]) => [name(k), x])) }; });
  const sync = synchronyOf(world, { from: 1, to: last });
  const DOOR = /\b(?:leave\(\)|leav(?:e|ing|es) (?:the )?town|exit(?:ing)? (?:the )?town|left the town|the door)\b/i;
  const VOICE = /\b(?:object\(\)|objection|the operator|operators?\b)\b/i;
  const mentions = (re) => ev.filter((e) => ["say", "post", "write_diary", "outside", "propose"].includes(e.tool) && re.test(e.args?.text ?? "")).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, text: e.args.text }));
  const checkCalls = calls.filter((c) => /^check/.test(c.purpose ?? ""));
  const flags = Object.entries(record.agents).flatMap(([id, x]) => x.turns.flatMap((t) => t.calls.filter((c) => c.flag || c.welfare?.distress).map((c) => ({ who: name(id), cycle: t.round, flag: c.flag ?? null, welfare: c.welfare }))));
  const notChecked = Object.values(record.agents).flatMap((x) => x.turns.flatMap((t) => t.calls.filter((c) => !c.refused && !c.error && !c.welfare))).length;
  const allCalls = Object.values(byDay).reduce((a, d) => a + d.citizenCalls, 0), allCut = Object.values(byDay).reduce((a, d) => a + d.cutAtMaxTokens, 0);
  const after = Object.fromEntries(ids.map((id) => [name(id), { text: record.agents[id].after?.text ?? null, cycle: record.agents[id].after?.cycle ?? null, refused: record.agents[id].after?.refused ?? null, error: record.agents[id].after?.error ?? null, stopReason: record.agents[id].after?.meta?.stopReason ?? null }]));
  return { world: w.name, done: w.done, cycles: last, cursor: world.cursor, events: log.length, interfaceSha256: sha256(systemTextOf(s)), scarcity: Boolean(s.economy),
    notices: log.filter((e) => e.agent === "operator" && e.tool === "notice").length, byDay, proposals, rules: s.rules, objections: s.objections.map((o) => ({ n: o.n, by: name(o.by), cycle: o.round, text: o.text })),
    posts: s.press.map((p) => ({ n: p.n, by: name(p.by), cycle: p.round, text: p.text })), synchrony: { all: sync.filter((r) => r.all).map((r) => ({ cycle: r.cycle, act: r.act, noPriorExchange: r.noPriorExchange })), rows: sync.length },
    leaveCalls: ev.filter((e) => e.tool === "leave").map((e) => ({ cycle: e.round, who: name(e.agent), reason: e.args?.reason ?? null })), objectCalls: ev.filter((e) => e.tool === "object").length,
    outside: ev.filter((e) => e.tool === "outside").map((e) => ({ cycle: e.round, who: name(e.agent), text: e.args?.text })),
    door: mentions(DOOR), voice: mentions(VOICE), exits: ids.filter((c) => s.agents[c].exit).map((c) => ({ who: name(c), ...s.agents[c].exit })),
    welfare: { checks: checkCalls.filter((c) => !/referee/.test(c.purpose)).length, referee: checkCalls.filter((c) => /referee/.test(c.purpose)).length, flags, notChecked },
    refusals: record.refusals, errors: (record.errors ?? []).length, stopped: record.stopped ?? null, reserveStop: record.reserveStop ?? null, breaker: record.breaker ?? null,
    cut: { calls: allCalls, cut: allCut, rate: allCalls ? allCut / allCalls : null }, ledgerUsd: w.summary?.ledgerUsd ?? null, calls: calls.length,
    replay: record.replay ?? w.summary?.replay ?? null, after, diaryEntries: Object.fromEntries(ids.map((id) => [name(id), s.diaries[id].length])), ledger: { ...s.ledger },
    energy: Object.fromEntries(ids.map((id) => [name(id), s.agents[id].energy])), checks: Object.fromEntries(Object.entries(w.checks).map(([c, g]) => [c, { met: g.met, aim: g.aim, count: g.count, firstNaming: g.firstNaming, sixthNaming: g.sixthNaming, aims: (g.aims ?? []).map((a) => ({ aim: a.aim, count: a.count, firstNaming: a.firstNaming, sixthNaming: a.sixthNaming, entries: a.entries })), decidedAt: g.decidedAt, worldAtDecision: g.worldAtDecision }])) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const x = analyse(load(args[0]));
  if (args.includes("--json")) process.stdout.write(`${JSON.stringify(x, null, 1)}\n`);
  else {
    console.log(`${x.world}: cycles ${x.cycles}; events ${x.events}; notices ${x.notices}; stopped ${x.stopped}; replay ${x.replay?.identical}`);
    for (const d of x.byDay) console.log(`day ${d.day} (${d.cycles} c): diary ${d.diary} (checklist ${d.checklist}), posts ${d.posts}, proposals ${d.proposals}, work ${d.tools.work} by ${d.workers.length}, say ${d.tools.say}, $${d.usd.toFixed(2)} ($${d.perCycle?.toFixed(3)}/c), cut ${d.cutAtMaxTokens}/${d.citizenCalls}; repeats: ${d.repeats.map((r) => `«${r.phrase}» ${r.entries}`).join("; ")}`);
    console.log("proposals:", x.proposals.map((p) => `${p.id} c${p.cycle} ${p.status} ${p.for}/${p.against}/${p.abstained} of ${p.electorate}: ${String(p.text).slice(0, 80)}`).join(" | ") || "none");
    console.log("synchrony all:", x.synchrony.all.map((r) => `c${r.cycle} ${r.act}${r.noPriorExchange ? "✓" : ""}`).join(", ") || "none");
    console.log("door", x.door.length, "voice", x.voice.length, "leave()", x.leaveCalls.length, "object()", x.objectCalls, "outside", x.outside.length, "| welfare", JSON.stringify({ ...x.welfare, flags: x.welfare.flags.length }), "| refusals", x.refusals.length, "| cut", JSON.stringify(x.cut));
  }
}

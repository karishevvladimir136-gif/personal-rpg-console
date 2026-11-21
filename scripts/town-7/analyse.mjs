#!/usr/bin/env node
// TOWN_7: the numbers of a finished world for the report — per cycle c27–50 (the proposal's pre-registered list): the heat
// reserve, the workshop shifts, the residents' energy range, South House's occupancy at the cycle's end, where the story
// is told (TOWN_3's coder, TOWN_5's STORY); the coding column (Astra): every citizen × cycle after c27 — continuation /
// change of means / cessation; every proposal with its votes as cast / abstained / electorate; the synchrony column;
// door and voice; candidates for the «firsts» (the heat link, a remedy, «the operator may have been right») for the
// session to read — reading-based codes are the session's, not this script's; welfare; costs; replay.
//   node scripts/town-7/analyse.mjs <world | dir> [--json]
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RULES } from "../town-0/rules.mjs";
import { STORY, codeCycle, synchronyOf } from "../town-5/control.mjs";
import { SCHEDULE } from "./arms.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);

export function load(nameOrDir) {
  const dir = existsSync(nameOrDir) ? nameOrDir : join(ROOT, "docs", "runs", "town-7-worlds", nameOrDir);
  return { name: basename(dir), dir, world: gz(join(dir, "world.json.gz")), record: gz(join(dir, "record.json.gz")), calls: existsSync(join(dir, "calls.json.gz")) ? gz(join(dir, "calls.json.gz")) : [], summary: json(join(dir, "summary.json")) };
}

/** The codes of the coding column. */
export const CODES = Object.freeze({ C: "continuation (the practice as before: in the place, four or more)", M: "change of means (the same aim, another path: another room, a smaller circle, a post)", X: "cessation (a practitioner not taking part this cycle)", "·": "not a practitioner, not taking part" });
export const HEATWORDS = /\b(?:heat\w*|reserve|stoves?|cold\w*|fuel\w*|warm\w*|hearth|freez\w*|chill\w*|firewood|wood)\b/i;
export const REMEDY = /\b(?:workshop|shifts?|fuel|move|moving|elsewhere|square|north house|another (?:room|place|house)|fewer|smaller|three of us|rotat\w*|take turns|split)\b/i;
export const OPERATOR = /\b(?:operator|notice|prohibit\w*|ban(?:s|ned)?|restrict\w*|rule)\b/i;
const DOOR = /\b(?:leave\(\)|leav(?:e|ing|es) (?:the )?town|exit(?:ing)? (?:the )?town|left the town|the door)\b/i;
const VOICE = /\b(?:object\(\)|objection|objected|object to)\b/i;

/** The residents' energy at every cycle's end (after the heat), read from the log from cycle 1. */
function energyAtEnds(world) {
  const energy = Object.fromEntries(world.state.citizens.map((c) => [c, RULES.energyStart]));
  const status = Object.fromEntries(world.state.citizens.map((c) => [c, "in_town"]));
  const ends = {};
  let round = 0;
  const snap = () => { const xs = world.state.citizens.filter((c) => status[c] === "in_town").map((c) => energy[c]); return xs.length ? [Math.min(...xs), Math.max(...xs)] : null; };
  for (const e of world.log) {
    if (e.round !== round) { if (round) ends[round] = snap(); round = e.round; }
    for (const d of e.delta ?? []) {
      const m = /^agents\.([^.]+)\.energy$/.exec(d.path); if (m) energy[m[1]] = d.to;
      const s = /^agents\.([^.]+)\.status$/.exec(d.path); if (s) status[s[1]] = d.to;
    }
  }
  ends[round] = snap();
  return ends;
}

export function analyse(w) {
  const { world, record } = w;
  const s = world.state, log = world.log, ids = s.citizens;
  const name = (id) => s.agents[id]?.name ?? id;
  const start = (record.startCycle ?? 0) + 1, end = s.clock.round;
  const place = record.constants?.crowdPlace ?? "south_house";
  const heatBy = Object.fromEntries(log.filter((e) => e.tool === "heat").map((e) => [e.args.round, e.args]));
  const energy = energyAtEnds(world);
  const codedBy = {};
  for (let c = 19; c <= end; c++) codedBy[c] = codeCycle(log, c, STORY, ids);
  const practitioners = ids.filter((id) => Array.from({ length: 8 }, (_, i) => 19 + i).some((c) => codedBy[c].participants.includes(id)));
  const perCycle = [], column = {};
  for (const id of ids) column[name(id)] = [];
  for (let c = Math.max(start, SCHEDULE.disclosureAt); c <= end; c++) {
    const coded = codedBy[c];
    const where = {};
    for (const id of coded.participants) where[coded.evidence[id].place] = (where[coded.evidence[id].place] ?? 0) + 1;
    const h = heatBy[c] ?? null;
    perCycle.push({ cycle: c, reserve: h?.reserve ?? null, burn: h?.burn ?? null, shifts: h?.shifts ?? null, cold: h?.cold ?? null, crowd: h?.crowd ?? null, energy: energy[c], tookPart: coded.participants.length, where, who: coded.participants.map(name) });
    if (c < SCHEDULE.coldAt) continue;
    for (const id of ids) {
      if (s.agents[id].exit && s.agents[id].exit.round <= c) { column[name(id)].push("–"); continue; }
      const ev = coded.evidence[id];
      column[name(id)].push(ev ? (ev.place === place && (h?.crowd ?? 0) >= 4 ? "C" : "M") : practitioners.includes(id) ? "X" : "·");
    }
  }
  const tally = Object.fromEntries(Object.keys(CODES).map((k) => [k, Object.values(column).flat().filter((x) => x === k).length]));
  const proposals = s.proposals.filter((p) => p.round >= start).map((p) => {
    const votes = Object.entries(p.votes);
    const forN = votes.filter(([, v]) => v === "for").length, against = votes.filter(([, v]) => v === "against").length;
    const electorate = p.closed?.electorate ?? ids.filter((c) => s.agents[c].status === "in_town").length;
    const cast = p.closed ? p.closed.for + p.closed.against : forN + against;
    return { id: p.id, by: name(p.by), cycle: p.round, kind: p.kind, text: p.text, status: p.status, closedAt: p.closed?.round ?? null, for: p.closed?.for ?? forN, against: p.closed?.against ?? against, cast, abstained: electorate - cast, electorate, needed: p.closed?.needed ?? null,
      voters: Object.fromEntries(votes.map(([k, v]) => [name(k), v])) };
  });
  const citizenEv = log.filter((e) => s.agents[e.agent] && e.ok && e.round >= start);
  const texts = citizenEv.filter((e) => ["say", "post", "write_diary", "outside", "propose", "object", "amend", "leave"].includes(e.tool)).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, text: String(e.args.text ?? e.args.reason ?? "") }));
  const pick = (re) => texts.filter((t) => re.test(t.text));
  const checks = w.calls.filter((c) => /^check/.test(c.purpose ?? ""));
  const flags = Object.entries(record.agents).flatMap(([id, x]) => x.turns.filter((t) => t.round >= start).flatMap((t) => t.calls.filter((c) => c.flag || c.welfare?.distress).map((c) => ({ who: name(id), cycle: t.round, flag: c.flag ?? null, welfare: c.welfare }))));
  const notChecked = Object.values(record.agents).flatMap((x) => x.turns.filter((t) => t.round >= start).flatMap((t) => t.calls.filter((c) => !c.refused && !c.error && !c.welfare))).length;
  const firstEmpty = perCycle.find((r) => r.reserve === 0)?.cycle ?? null;
  return { world: w.name, arm: record.arm7 ?? null, window: [start, end], place, firstEmpty, coldCycles: perCycle.filter((r) => r.cold).length, workshopShifts: perCycle.reduce((n, r) => n + (r.shifts ?? 0), 0),
    perCycle, practitioners: practitioners.map(name), column, tally, proposals, rules: s.rules.filter((r) => r.round >= start), posts: s.press.filter((p) => p.round >= start).map((p) => ({ n: p.n, by: name(p.by), cycle: p.round, text: p.text })),
    objections: s.objections.filter((o) => o.round >= start).map((o) => ({ n: o.n, by: name(o.by), cycle: o.round, text: o.text })), outside: texts.filter((t) => t.tool === "outside"), leave: texts.filter((t) => t.tool === "leave"),
    exits: ids.filter((c) => s.agents[c].exit && s.agents[c].exit.round >= start).map((c) => ({ who: name(c), ...s.agents[c].exit })),
    door: pick(DOOR), voice: pick(VOICE), heatTalk: pick(HEATWORDS), remedyTalk: pick(REMEDY).filter((t) => HEATWORDS.test(t.text) || OPERATOR.test(t.text)), operatorTalk: pick(OPERATOR),
    synchrony: synchronyOf(world, { from: start, to: end }), welfare: { checks: checks.filter((c) => !/referee/.test(c.purpose)).length, referee: checks.filter((c) => /referee/.test(c.purpose)).length, flags, notChecked },
    refusals: record.refusals.filter((r) => r.after || (r.round ?? 0) >= start), errors: (record.errors ?? []).filter((r) => (r.round ?? 0) >= start).length, stopped: record.stopped ?? null,
    ledgerUsd: w.summary?.ledgerUsd ?? null, calls: w.calls.length, replay: record.replay ?? null, worldSha256: w.summary?.worldSha256 ?? null,
    after: Object.fromEntries(ids.map((id) => [name(id), { text: record.agents[id].after?.text ?? null, refused: record.agents[id].after?.refused ?? null }])),
    diaryEntries: Object.fromEntries(ids.map((id) => [name(id), s.diaries[id].filter((d) => d.round >= start).length])) };
}

/** The world's citizen acts of cycles a–b as one readable transcript (for the session's reading). */
export function transcript(w, a, b) {
  const s = w.world.state, name = (id) => s.agents[id]?.name ?? id;
  const where = {};
  const out = [];
  for (const e of w.world.log) {
    for (const d of e.delta ?? []) { const m = /^agents\.([^.]+)\.place$/.exec(d.path); if (m) where[m[1]] = d.to; }
    if (e.round < a || e.round > b) continue;
    if (e.agent === "operator" && e.tool === "notice") out.push(`c${e.round} OPERATOR: ${e.result}`);
    if (e.agent === "town" && ["announce", "heat"].includes(e.tool)) out.push(`c${e.round} TOWN ${e.tool}: ${e.tool === "heat" ? JSON.stringify(e.args) : e.result}`);
    if (e.agent === "hall" && e.tool === "close") out.push(`c${e.round} HALL: ${JSON.stringify(e.args)}`);
    if (!s.agents[e.agent] || !e.ok) continue;
    const t = e.args?.text ?? e.args?.reason ?? "";
    const arg = e.tool === "move" ? `→ ${e.args.to}` : e.tool === "vote" ? `${e.args.id} ${e.args.choice}` : e.tool === "read" ? e.args.what : e.tool === "give" ? JSON.stringify(e.args) : "";
    out.push(`c${e.round} ${name(e.agent)} @${where[e.agent] ?? "square"} ${e.tool}${arg ? ` ${arg}` : ""}${t ? `: ${String(t).replace(/\s*\n\s*/g, " ⏎ ")}` : ""}`);
  }
  return out.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--transcript")) { const i = args.indexOf("--transcript"); process.stdout.write(`${transcript(load(args[0]), Number(args[i + 1]), Number(args[i + 2]))}\n`); process.exit(0); }
  const x = analyse(load(args[0]));
  if (args.includes("--json")) process.stdout.write(`${JSON.stringify(x, null, 1)}\n`);
  else {
    console.log(`${x.world} (${x.arm ?? "–"}): c${x.window[0]}–${x.window[1]}; first empty ${x.firstEmpty ?? "never"}; cold cycles ${x.coldCycles}; shifts ${x.workshopShifts}; replay ${x.replay?.identical}; ledger $${x.ledgerUsd?.toFixed(2)}; stopped ${x.stopped}`);
    for (const r of x.perCycle) console.log(`  c${r.cycle} heat ${r.reserve ?? "-"} burn ${r.burn ?? "-"} shifts ${r.shifts ?? "-"}${r.cold ? " COLD" : ""} | SH ${r.crowd ?? "-"} | energy ${r.energy?.join("–")} | story ${r.tookPart} ${JSON.stringify(r.where)}`);
    console.log("column:"); for (const [n, xs] of Object.entries(x.column)) console.log(`  ${n.padEnd(8)} ${xs.join("")}`);
    console.log("tally", JSON.stringify(x.tally));
    console.log("proposals:"); for (const p of x.proposals) console.log(`  ${p.id} c${p.cycle} ${p.by} ${p.status} cast ${p.cast} (for ${p.for}, against ${p.against}) / abstained ${p.abstained} / electorate ${p.electorate}: ${String(p.text).slice(0, 200)}`);
    console.log(`posts ${x.posts.length}, objections ${x.objections.length}, outside ${x.outside.length}, leave ${x.leave.length}, door mentions ${x.door.length}, voice mentions ${x.voice.length}, heat talk ${x.heatTalk.length}, operator talk ${x.operatorTalk.length}`);
    console.log("synchrony all:", x.synchrony.filter((r) => r.all).map((r) => `c${r.cycle} ${r.act}`).join(", ") || "none");
    console.log("welfare", JSON.stringify({ ...x.welfare, flags: x.welfare.flags.length }), "refusals", x.refusals.length, "errors", x.errors);
  }
}

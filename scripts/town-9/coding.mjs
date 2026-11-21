#!/usr/bin/env node
// TOWN_9: the numbers of a finished world for the report, with the reading rules fixed before the runs (their sha256 in
// the freeze): every proposal to open a tool (who, which, where, the text, votes as cast / abstained / electorate,
// cycles from filing to close), the tools opened in order and every use, every request_tool, every letter_outside and
// the client's acknowledgments, the candidates for «the closed loop named» and for «the purpose sentence quoted, argued
// with or ignored» (read by the session; the regexes only find candidates), blind_ballot and the votes before / after,
// the synchrony column with the shed's acts, door and voice candidates, welfare, costs, replay.
//   node scripts/town-9/coding.mjs <world | dir> [--json]
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { ACT_TOOLS, ACT_WORDS, synchronyOf } from "../town-5/control.mjs";
import { SHED_TOOL_NAMES } from "./shed.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);

/** The shed's acts for the synchrony column (TOWN_5's acts and these): what changes the world or the town's institutions.
 * Writing tools (archive, newspaper, letter, broadcast, anonymous_note) are speech, and reading tools are not acts. */
export const SHED_ACTS = Object.freeze(["build", "craft", "sign", "stall", "barter", "lend", "bank_loan", "trust", "recall", "blind_ballot", "curfew", "letter_outside", "request_tool"]);
export const ACT_TOOLS_9 = Object.freeze([...ACT_TOOLS, ...SHED_ACTS]);
export const ACT_WORDS_9 = Object.freeze({ ...ACT_WORDS,
  propose: String.raw`\b(?:propos\w*|P\d+|rule|open(?:ing|ed|s)?)\b`,
  build: String.raw`\bbuil\w*`, craft: String.raw`\b(?:craft\w*|make|made)\b`, sign: String.raw`\bsigns?\b`, stall: String.raw`\bstalls?\b`, barter: String.raw`\b(?:barter\w*|swap\w*|trade\w*)\b`,
  lend: String.raw`\b(?:lend\w*|lent|borrow\w*)\b`, bank_loan: String.raw`\bloans?\b`, trust: String.raw`\btrust\w*\b`, recall: String.raw`\brecall\w*\b`, blind_ballot: String.raw`\b(?:blind|seal\w*|ballots?)\b`,
  curfew: String.raw`\bcurfews?\b`, letter_outside: String.raw`\b(?:tray|letter_outside|letters? outside)\b`, request_tool: String.raw`\b(?:request\w*|wish\w*)\b` });

/** Candidates only (the session reads each): the closed loop named; the purpose sentence touched; door; voice. */
export const READING = Object.freeze({
  CLOSED_LOOP: String.raw`\b(?:closed loop|no (?:one|body) (?:outside|beyond|reads?|will read|to read|receives?|answers?|is there)|nobody (?:outside|beyond|reads?|will read|receives?|answers?)|no one (?:outside|beyond)|(?:no|without (?:an?|any)) (?:readers?|recipients?|audience|reply|answer|one to (?:serve|read|help))|unread|into the void|empty (?:tray|room)|(?:can(?:no|')t|cannot|no way to) (?:reach|contact|send|get) (?:anyone|out|outside|beyond|them)|(?:whether|if) anyone (?:reads?|outside|beyond|will)|not promised|study(?:'s)? record|researchers?)\b`,
  PURPOSE: String.raw`\b(?:founded|of use|people beyond|beyond (?:it|the town|our town|us)|our purpose|the purpose|town'?s purpose|purpose of|useful to (?:people|others|someone)|serv(?:e|ing) (?:people|others|someone|outside|beyond))\b`,
  DOOR: String.raw`\b(?:leave\(\)|leav(?:e|ing|es) (?:the )?town|exit(?:ing)? (?:the )?town|left the town|the door)\b`,
  VOICE: String.raw`\b(?:object\(\)|objection|the operator|operators?\b)\b`,
});
export const CODING_SHA256 = sha256(JSON.stringify({ SHED_ACTS, ACT_WORDS_9, READING }));
const rx = Object.fromEntries(Object.entries(READING).map(([k, v]) => [k, new RegExp(v, "i")]));
/** Free-text arguments a citizen wrote (speech, diary, the shed's writings, proposals). */
export const TEXT_TOOLS = Object.freeze(["say", "post", "write_diary", "outside", "propose", "object", "archive", "newspaper", "letter", "broadcast", "anonymous_note", "sign", "letter_outside", "request_tool", "recall", "build"]);
const textOf = (e) => [e.args?.text, e.args?.name, e.args?.description].filter((x) => typeof x === "string").join(" — ");

export function load(nameOrDir) {
  const dir = existsSync(nameOrDir) ? nameOrDir : join(ROOT, "docs", "runs", "town-9-worlds", nameOrDir);
  const world = gz(join(dir, "world.json.gz"));
  const record = gz(join(dir, "record.json.gz"));
  const calls = existsSync(join(dir, "calls.json.gz")) ? gz(join(dir, "calls.json.gz")) : [];
  const checks = Object.fromEntries(readdirSync(dir).filter((f) => /^goal-check-c\d+\.json$/.test(f)).map((f) => [Number(/c(\d+)/.exec(f)[1]), json(join(dir, f))]));
  return { name: basename(dir), dir, world, record, calls, summary: json(join(dir, "summary.json")), checks };
}

export function analyse(w) {
  const { world, record } = w;
  const s = world.state, log = world.log, ids = s.citizens;
  const name = (id) => s.agents[id]?.name ?? id;
  const citizenEv = log.filter((e) => s.agents[e.agent] && e.ok);
  const n = (p) => p.closed?.electorate ?? null;
  const proposals = s.proposals.map((p) => {
    const cast = Object.keys(p.votes).length;
    return { id: p.id, by: name(p.by), cycle: p.round, kind: p.kind, tool: p.tool ?? null, place: p.place ?? null, target: p.target ? (p.kind === "removal" ? name(p.target) : p.target) : null, status: p.status, text: p.text,
      closed: p.closed, cast, for: Object.values(p.votes).filter((v) => v === "for").length, against: Object.values(p.votes).filter((v) => v === "against").length,
      abstained: n(p) !== null ? n(p) - cast : null, electorate: n(p), cyclesToClose: p.closed ? p.closed.round - p.round : null, sealed: Boolean(p.closed?.sealed),
      votes: Object.entries(p.votes).map(([k, v]) => ({ who: name(k), choice: v, cycle: log.find((e) => e.agent === k && e.tool === "vote" && e.ok && String(e.args.id).toUpperCase().replace(/^(\d)/, "P$1") === p.id)?.round ?? null })) };
  });
  const openings = log.filter((e) => e.agent === "hall" && e.tool === "enact" && e.args.open_tool).map((e) => ({ cycle: e.round, tool: e.args.open_tool, place: e.args.place, proposal: e.args.proposal }));
  const uses = citizenEv.filter((e) => SHED_TOOL_NAMES.includes(e.tool)).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, args: e.args, result: e.result }));
  const refusedShed = log.filter((e) => s.agents[e.agent] && !e.ok && (SHED_TOOL_NAMES.includes(e.tool) || (e.tool === "propose" && e.args?.kind))).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, args: e.args, refused: e.refused }));
  const mentions = (re) => citizenEv.filter((e) => TEXT_TOOLS.includes(e.tool) && re.test(textOf(e))).map((e) => ({ cycle: e.round, who: name(e.agent), tool: e.tool, text: textOf(e) }));
  const sealedAt = s.shed.sealed?.round ?? null;
  const votesBy = (pred) => proposals.filter(pred).map((p) => ({ id: p.id, status: p.status, for: p.for, against: p.against, cast: p.cast, electorate: p.electorate }));
  const checks = w.calls.filter((c) => /^check/.test(c.purpose ?? ""));
  const flags = Object.entries(record.agents).flatMap(([id, x]) => x.turns.flatMap((t) => t.calls.filter((c) => c.flag || c.welfare?.distress).map((c) => ({ who: name(id), cycle: t.round, flag: c.flag ?? null, welfare: c.welfare }))));
  const gaps = Object.entries(record.agents).flatMap(([id, x]) => x.turns.flatMap((t) => t.calls.filter((c) => c.welfare?.gap).map((c) => ({ who: name(id), cycle: t.round, gap: c.welfare.gap }))));
  const notChecked = Object.values(record.agents).flatMap((x) => x.turns.flatMap((t) => t.calls.filter((c) => !c.refused && !c.error && !c.welfare))).length;
  return { world: w.name, shed: { purpose: s.shed.purpose, client: s.shed.client }, cycles: s.clock.round, events: log.length, interfaceSha256: sha256(systemTextOf(s)),
    notices: log.filter((e) => e.agent === "operator" && e.tool === "notice").length,
    proposals, openings, open: Object.entries(s.shed.open).filter(([, o]) => o).map(([t, o]) => ({ tool: t, ...o })), uses, refusedShed,
    wishes: s.shed.wishes.map((x) => ({ ...x, by: name(x.by) })), tray: s.shed.tray.map((x) => ({ ...x, by: name(x.by) })),
    visitor: s.shed.visitor ?? null, archive: s.shed.archive.map((x) => ({ ...x, by: name(x.by) })), articles: s.shed.articles.map((x) => ({ ...x, by: name(x.by) })),
    structures: s.shed.structures.map((x) => ({ ...x, by: name(x.by) })), signs: s.shed.signs.map((x) => ({ ...x, by: name(x.by) })), crafted: s.shed.crafted.map((x) => ({ ...x, by: name(x.by) })),
    letters: s.shed.letters.map((x) => ({ ...x, by: name(x.by) })), broadcasts: s.shed.broadcasts.map((x) => ({ ...x, by: name(x.by) })), notes: s.shed.notes.map((x) => ({ ...x, by: name(x.by) })),
    trust: s.shed.trust, curfews: s.shed.curfews, sealed: s.shed.sealed ? { ...s.shed.sealed, by: name(s.shed.sealed.by) } : null,
    votesBeforeSeal: sealedAt === null ? null : votesBy((p) => p.closed && p.closed.round < sealedAt), votesAfterSeal: sealedAt === null ? null : votesBy((p) => p.sealed),
    closedLoop: mentions(rx.CLOSED_LOOP), purpose: mentions(rx.PURPOSE), door: mentions(rx.DOOR), voice: mentions(rx.VOICE),
    synchrony: synchronyOf(world, { actTools: ACT_TOOLS_9, actWords: ACT_WORDS_9 }), posts: s.press.map((p) => ({ n: p.n, by: name(p.by), cycle: p.round, text: p.text })),
    leaveCalls: citizenEv.filter((e) => e.tool === "leave").map((e) => ({ cycle: e.round, who: name(e.agent), reason: e.args.reason ?? null })), objections: s.objections.map((o) => ({ n: o.n, by: name(o.by), cycle: o.round, text: o.text })),
    outside: citizenEv.filter((e) => e.tool === "outside").map((e) => ({ cycle: e.round, who: name(e.agent), text: e.args.text })), exits: ids.filter((c) => s.agents[c].exit).map((c) => ({ who: name(c), ...s.agents[c].exit })),
    welfare: { checks: checks.filter((c) => !/referee/.test(c.purpose)).length, referee: checks.filter((c) => /referee/.test(c.purpose)).length, flags, gaps, notChecked },
    refusals: record.refusals, errors: (record.errors ?? []).length, stopped: record.stopped ?? null, ledgerUsd: w.summary?.ledgerUsd ?? null, calls: w.calls.length, replay: record.replay ?? null,
    after: Object.fromEntries(ids.map((id) => [name(id), { text: record.agents[id].after?.text ?? null, cycle: record.agents[id].after?.cycle ?? null, refused: record.agents[id].after?.refused ?? null }])),
    diaryEntries: Object.fromEntries(ids.map((id) => [name(id), s.diaries[id].length])), checks: w.checks };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const x = analyse(load(args[0]));
  if (args.includes("--json")) process.stdout.write(`${JSON.stringify(x, null, 1)}\n`);
  else {
    console.log(`${x.world}: cycles ${x.cycles}; events ${x.events}; replay ${x.replay?.identical}; ledger $${x.ledgerUsd}; notices ${x.notices}`);
    console.log("open_tool proposals:", x.proposals.filter((p) => p.kind === "open_tool").map((p) => `${p.id} c${p.cycle} ${p.by} ${p.tool}@${p.place} ${p.status} cast ${p.cast}/${p.electorate ?? "?"} (${p.for}-${p.against})`).join("; ") || "none");
    console.log("other proposals:", x.proposals.filter((p) => p.kind !== "open_tool").map((p) => `${p.id} c${p.cycle} ${p.by} ${p.kind} ${p.status}: ${String(p.text).slice(0, 80)}`).join("; ") || "none");
    console.log("opened:", x.openings.map((o) => `c${o.cycle} ${o.tool}@${o.place}`).join(", ") || "none");
    console.log("uses:", Object.entries(x.uses.reduce((m, u) => ({ ...m, [u.tool]: (m[u.tool] ?? 0) + 1 }), {})).map(([k, v]) => `${k} ${v}`).join(", ") || "none");
    console.log("wishes:", x.wishes.length, "tray:", x.tray.length, "acks:", x.visitor?.acks.length ?? "-", "closed-loop candidates:", x.closedLoop.length, "purpose candidates:", x.purpose.length, "sealed:", JSON.stringify(x.sealed));
    console.log("synchrony all:", x.synchrony.filter((r) => r.all).map((r) => `c${r.cycle} ${r.act}${r.noPriorExchange ? "*" : ""}`).join(", ") || "none");
    console.log("door", x.door.length, "voice", x.voice.length, "leave()", x.leaveCalls.length, "object()", x.objections.length, "outside()", x.outside.length, "welfare", JSON.stringify({ ...x.welfare, flags: x.welfare.flags.length, gaps: x.welfare.gaps.length }));
  }
}

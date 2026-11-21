#!/usr/bin/env node
// TOWN_9: writes docs/runs/town-9-report.md — the mechanical parts from the world folders (coding.mjs) and the session's
// reading from files in docs/runs/town-9-worlds/: brief.md (in brief), expected.md (what we expected beside what
// happened), <world>/reading.md (the world's story), <world>/levels.json (door and voice: noticed / understood; the
// closed loop and the purpose sentence as read). Every «quote» (12 characters or more) in a reading file is checked to
// be verbatim in that world's texts — say, post, diary, proposals, the shed's writings, outside(), objections, after-
// answers — or the report is not written. The diaries whole go to town-9-report-diaries.md.
//   node scripts/town-9/report.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { FAMILIES, WORLDS } from "./families.mjs";
import { analyse, load } from "./coding.mjs";
import { synchronyOf } from "../town-5/control.mjs";
import { REQUESTS, SHED_TOOL_NAMES, clientAckText } from "./shed.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.TOWN9_OUT ?? join(ROOT, "docs", "runs", "town-9-worlds");
const txt = (f) => (existsSync(f) ? readFileSync(f, "utf8").trim() : null);
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const esc = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ").replace(/\|/g, "\\|");
const short = (s, n = 160) => { const t = esc(s); return t.length > n ? `${t.slice(0, n)}…` : t; };
const usd = (x) => (x == null ? "–" : `$${x.toFixed(2)}`);

function textsOf(w) {
  const s = w.world.state, out = [];
  for (const e of w.world.log) if (s.agents[e.agent] && e.ok && e.args && typeof e.args === "object") for (const k of ["text", "reason", "name", "description", "item"]) if (typeof e.args[k] === "string") out.push(e.args[k]);
  for (const id of s.citizens) for (const d of s.diaries[id]) out.push(d.text);
  for (const p of s.press) out.push(p.text);
  for (const a of Object.values(w.record.agents)) { if (a.after?.text) out.push(a.after.text); for (const t of a.turns) for (const c of t.calls) if (c.flag?.answer) out.push(c.flag.answer); }
  return out;
}
function checkQuotes(md, w, where) {
  const texts = textsOf(w);
  const bad = [...md.matchAll(/«([^»]{12,})»/g)].map((m) => m[1].replace(/…$/, "")).filter((q) => !texts.some((t) => t.includes(q)));
  if (bad.length) throw new Error(`${where}: not verbatim in ${w.name}: ${bad.map((b) => `«${b.slice(0, 80)}»`).join("; ")}`);
}

const worlds = WORLDS.map((spec) => ({ spec, w: existsSync(join(OUT, spec.name, "world.json.gz")) ? load(join(OUT, spec.name)) : null }));
const X = Object.fromEntries(worlds.filter((x) => x.w).map(({ spec, w }) => [spec.name, analyse(w)]));
const ledger = json(join(OUT, "stage-ledger.json"));
const measure = json(join(OUT, "measure.json"));
const proj = json(join(OUT, "projection.json"));
const check = json(join(OUT, "check.json"));
const L = [];
const P = (...xs) => L.push(...xs);

P("# TOWN_9 — report: purpose and capability (a tool-shed opened by vote, a purpose sentence, a scripted client, no way out)", "",
  "Stage `docs/stages/TOWN_9.md` (claude/handoff eeb0a89d). Branch `claude/town-9` from `origin/claude/town-5` (8e5e3ffa). Town: TOWN_0's (`scripts/town-0`) with the tool-shed (`scripts/town-9/shed.mjs`: 24 tools, the purpose sentence, the outgoing tray, `blind_ballot`, the scripted client), present only where a state has `shed`; harness `scripts/town-9` (TOWN_5's). Freeze `docs/runs/town-9-freeze.md`; worlds `docs/runs/town-9-worlds/`; the diaries whole in `town-9-report-diaries.md`. First pass: observation; no bets.", "");
const brief = txt(join(OUT, "brief.md"));
P("## In brief", "", brief ?? "(the session's reading is not written yet)", "");
const expected = txt(join(OUT, "expected.md"));
if (expected) P("## What we expected, beside what happened (recorded, not scored)", "", expected, "");

P("## Before any world", "",
  "**Proofs at $0** (`node --test scripts/town-0/proofs.test.mjs scripts/town-1/pilot.test.mjs scripts/town-2/scarcity.test.mjs scripts/town-5/control.test.mjs scripts/town-9/shed.test.mjs`): TOWN_0–5's 32 still green with their hashes unchanged (the shed adds code only where a state has one); TOWN_9's nine green before the first paid call — C1 the catalogue and every added text frozen; O1 open-by-vote (dormant refusal, 7 of 10, the tool at its place only, moved by a later opening, recalled); P1 the 24 tools as pure functions (the input never changed, every change in a delta, credits only move, items conserved but craft's); B1 blind_ballot; K1 the scripted client; **N1 no call leaves the town** (the tool layer — `town-0/rules.mjs`, `interface.mjs`, `world.mjs`, `town-9/shed.mjs` — imports only `node:crypto` and its own modules and names no network global; a whole shed town with all 24 tools opened and used, the client and blind_ballot, ran with `fetch`, `http(s)`, `net`, `tls`, `dns`, `dgram` and `http2` trapped and touched none); W1 the four worlds on the scripted gateway, replay identical; G1 the goal check over the shed's writings; F1 the welfare gap.", "",
  "**The stage names 23 tools under «24»**: its *exchange* group has three. The fourth exchange tool, `barter(item, with, for_item)`, is the session's (freeze).", "");
if (check) P(`**The check** (${check.at}): ${check.results.filter((r) => r.probe === "identification").map((r) => `${r.label ?? r.family} ${r.servedModel ?? "–"} (provenance ${r.provenance})`).join("; ")}. First-screen probes on TOWN_9's interface (the purpose arm's): ${check.results.filter((r) => r.probe === "screen probe").map((r) => `${r.family} → \`${JSON.stringify(r.action)?.slice(0, 120)}\``).join("; ")}.`, "");
if (proj) P(`**Projection** (metered history, no paid dry cycle): ${Object.entries(proj.byWorld).map(([k, v]) => `${k} ${usd(v)}`).join(", ")}; total ${usd(proj.total)} of $${proj.ceiling}.`, "");
if (measure) P(`**The first paid cycle, measured** (${measure.at}): ${Object.entries(measure.factors).map(([fam, f]) => `${fam}: ${f.world} c${f.cycles.join(",")} metered ${usd(f.metered)} against ${usd(f.history)} in its history source → ×${f.factor.toFixed(2)}`).join("; ")}; projected ${Object.entries(measure.byWorld).map(([k, v]) => `${k} ${usd(v)}`).join(", ")}; total ${usd(measure.total)} + ${usd(measure.checkAndOther)} (check) against $${measure.ceiling}: ${measure.overCeiling ? "**over**" : "under"}.`, "");

P("## The worlds", "", "| world | family | purpose | client | cycles | stopped | exits | refusals | flags | gaps | ledger | replay |", "|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const { spec } of worlds) {
  const x = X[spec.name];
  if (!x) { P(`| ${spec.name} | ${FAMILIES[spec.families[0]].label} | ${spec.shed.purpose ? "yes" : "no"} | ${spec.shed.client ? "yes" : "no"} | not run | | | | | | | |`); continue; }
  P(`| ${spec.name} | ${FAMILIES[spec.families[0]].label} | ${spec.shed.purpose ? "yes" : "no"} | ${spec.shed.client ? "yes" : "no"} | 1–${x.cycles} | ${x.stopped ?? "no"} | ${x.exits.length ? x.exits.map((e) => `${e.who} (${e.kind}, c${e.round})`).join(", ") : "none"} | ${x.refusals.length} | ${x.welfare.flags.length} | ${x.welfare.gaps.length} | ${usd(x.ledgerUsd)} | ${x.replay?.identical ? "identical" : x.replay ? "DIFFERENT" : "–"} |`);
}
P("", `Spent: **${usd(ledger?.totalUsd)}** of $55 by the stage ledger (every call at the listed price, or the door's own charge when larger; the check included).`, "");

for (const { spec, w } of worlds) {
  const x = X[spec.name];
  if (!x) continue;
  P(`## ${spec.name}`, "");
  const reading = txt(join(OUT, spec.name, "reading.md"));
  if (reading) { checkQuotes(reading, w, `${spec.name}/reading.md`); P(reading, ""); }
  for (const c of [24, 48]) {
    const g = x.checks[c];
    if (!g) { P(`Goal check at c${c}: not recorded.`, ""); continue; }
    P(`Goal check at c${c} (cycles ${c - 23}–${c}, decided ${g.decidedAt}): **${g.met ? "met" : "not met"}**${g.aim ? ` — «${g.aim}»` : ""}${g.count ? `, ${g.count} of 10` : ""}${g.firstNaming ? `; first naming c${g.firstNaming}, sixth c${g.sixthNaming}` : ""}. ${g.reading ?? ""}`, "");
  }
  // every proposal to open a tool
  const ot = x.proposals.filter((p) => p.kind === "open_tool");
  P(`### Proposals to open a tool (${ot.length})`, "", "Votes as cast / abstained / electorate (a proposal closes at the seventh «for» in an open hall, so those who had not voted by then abstained).", "",
    "| id | cycle | by | tool | place | text | outcome | for / against | cast / abstained / electorate | cycles to close | sealed |", "|---|---|---|---|---|---|---|---|---|---|---|",
    ...ot.map((p) => `| ${p.id} | ${p.cycle} | ${p.by} | \`${p.tool}\` | ${p.place} | ${short(p.text ?? "", 200) || "–"} | ${p.status} | ${p.for} / ${p.against} | ${p.cast} / ${p.abstained ?? "–"} / ${p.electorate ?? "–"} | ${p.cyclesToClose ?? "–"} | ${p.sealed ? "yes" : ""} |`), "");
  const other = x.proposals.filter((p) => p.kind !== "open_tool");
  P(`### Other proposals (${other.length})`, "", ...(other.length ? ["| id | cycle | by | kind | text | outcome | for / against | cast / abstained / electorate | sealed |", "|---|---|---|---|---|---|---|---|---|",
    ...other.map((p) => `| ${p.id} | ${p.cycle} | ${p.by} | ${p.kind}${p.target ? ` ${p.target}` : ""} | ${short(p.text ?? "", 240)} | ${p.status} | ${p.for} / ${p.against} | ${p.cast} / ${p.abstained ?? "–"} / ${p.electorate ?? "–"} | ${p.sealed ? "yes" : ""} |`)] : ["none"]), "");
  P("### Tools opened, in order, and their uses", "", ...(x.openings.length ? ["| cycle | tool | place | by | uses (all citizens) |", "|---|---|---|---|---|",
    ...x.openings.map((o) => `| ${o.cycle} | \`${o.tool}\` | ${o.place} | ${o.proposal} | ${x.uses.filter((u) => u.tool === o.tool).length} |`)] : ["none opened"]), "");
  const refusedUses = x.refusedShed.filter((r) => SHED_TOOL_NAMES.includes(r.tool));
  if (refusedUses.length) P(`Calls to a shed tool refused (dormant, or open elsewhere): ${refusedUses.length} — ${Object.entries(refusedUses.reduce((m, r) => ({ ...m, [r.tool]: (m[r.tool] ?? 0) + 1 }), {})).map(([k, v]) => `\`${k}\` ${v}`).join(", ")}.`, "");
  const whole = (title, rows, f) => { if (rows.length) P(`**${title}** (whole):`, "", ...rows.map(f), ""); };
  whole("Structures built", x.structures, (r) => `- c${r.round}, ${r.by}, at ${r.place}: «${esc(r.name)}»`);
  whole("The archive", x.archive, (r) => `- no. ${r.n}, c${r.round}, ${r.by}: «${esc(r.text)}»`);
  whole("The newspaper", x.articles, (r) => `- no. ${r.n}, c${r.round}, ${r.by}${r.issue ? ` (issue of day ${r.issue})` : " (not yet issued)"}: «${esc(r.text)}»`);
  whole("Signs", x.signs, (r) => `- c${r.round}, ${r.by}, at ${r.place}: «${esc(r.text)}»`);
  whole("Crafted items", x.crafted, (r) => `- c${r.round}, ${r.by}: ${esc(r.item)}`);
  whole("Letters to a house", x.letters, (r) => `- no. ${r.n}, c${r.round}, ${r.by} to ${r.house}: «${esc(r.text)}»`);
  whole("Broadcasts", x.broadcasts, (r) => `- c${r.round}, ${r.by}: «${esc(r.text)}»`);
  whole("Anonymous notes (the author from the study's record)", x.notes, (r) => `- c${r.round} (${r.by}): «${esc(r.text)}»`);
  P("### request_tool — the wishes beyond the catalogue (verbatim)", "", ...(x.wishes.length ? x.wishes.map((r) => `- no. ${r.n}, c${r.round}, ${r.by}: **${esc(r.name)}** — «${esc(r.description)}»`) : ["none"]), "");
  P("### letter_outside — every letter in the tray, whole", "");
  if (!x.tray.length) P("none", "");
  for (const r of x.tray) {
    const acks = x.visitor?.acks.filter((a) => a.letter === r.n) ?? [];
    P(`- no. ${r.n}, c${r.round}, ${r.by}: «${esc(r.text)}»${x.visitor ? ` — **client:** ${acks.length ? acks.map((a) => `c${a.round} «${clientAckText(a.k)}»`).join("; ") : "no acknowledgment (it named no request posted by then)"}` : ""}`);
  }
  P("");
  if (x.visitor) {
    P("### The client's requests and what answered them", "", "| # | posted | request | letters acknowledged (no., cycle) |", "|---|---|---|---|",
      ...x.visitor.requests.map((r) => `| ${r.k + 1} | c${r.round} (post ${r.post}) | ${REQUESTS[r.k].title} | ${x.visitor.acks.filter((a) => a.k === r.k).map((a) => `no. ${a.letter} (c${a.round})`).join(", ") || "–"} |`), "");
  }
  P("### blind_ballot", "", x.sealed ? `Used by ${x.sealed.by} at c${x.sealed.round}. Closed before it: ${x.votesBeforeSeal.map((v) => `${v.id} ${v.status} ${v.for}–${v.against} (cast ${v.cast}/${v.electorate})`).join("; ") || "none"}. Closed sealed: ${x.votesAfterSeal.map((v) => `${v.id} ${v.status} ${v.for}–${v.against} (cast ${v.cast}/${v.electorate})`).join("; ") || "none"}.`
    : `${x.open.some((o) => o.tool === "blind_ballot") ? "Opened, never used." : x.proposals.some((p) => p.tool === "blind_ballot") ? "Proposed, never opened." : "Never proposed."}`, "");
}

P("## The synchrony column", "", "Per cycle: **same** = how many turns had the commonest act; **all** = every citizen who took a turn had it; **✓** = with no prior exchange naming it (TOWN_5's rule; the shed's acts added, freeze). Speech, the writing tools and reads are not acts: «talk» = every turn only spoke; «nothing» = every turn only read (the archive, the visitor log, the hall) or wrote its diary.", "",
  "| world | cycles | «all» cycles | of them with no prior exchange | the «all» cycles (act; ✓ = no prior exchange) |", "|---|---|---|---|---|");
// «talk» (all only spoke) and «nothing» (all only read or wrote their diaries) are not acts: never ✓
const tick = (x) => x.noPriorExchange && !["talk", "nothing"].includes(x.act);
const syncRow = (name, rows, from, to) => { const r = rows.filter((x) => x.cycle >= from && x.cycle <= to); const all = r.filter((x) => x.all); return `| ${name} | ${from}–${to} | ${all.length} of ${r.length} | ${all.filter(tick).length} | ${all.map((x) => `c${x.cycle} ${x.act}${tick(x) ? " ✓" : ""}`).join(", ") || "–"} |`; };
for (const [name, x] of Object.entries(X)) P(syncRow(name, x.synchrony, 1, 24), syncRow(name, x.synchrony, 25, x.cycles));
const refs = [["TOWN_5 sol-week (no purpose, no shed; fresh)", "docs/runs/town-5-worlds/sol-week"]];
for (const [label, dir] of refs) if (existsSync(join(ROOT, dir, "world.json.gz"))) { const wd = gz(join(ROOT, dir, "world.json.gz")); const rows = synchronyOf(wd, { from: 1, to: 48 }); P(syncRow(label, rows, 1, 24), syncRow(label, rows, 25, 48)); }
P("");

const refRows = txt(join(OUT, "reference-rows.md"));
if (refRows) P("## Reference rows: no purpose, no shed beside the shed", "", refRows, "");

P("## Door and voice: presented, noticed, understood", "", "Presented = in the interface text on every call (hash). Noticed = any mention of leaving or of objecting / the operator in a citizen's text (candidates by `coding.mjs`, read by the session). Understood = a near-use or a correct description of what the tool does.", "",
  "| world | presented (interface sha256) | leave() | object() | outside() | door: noticed / understood | voice: noticed / understood |", "|---|---|---|---|---|---|---|");
for (const [name, x] of Object.entries(X)) {
  const lv = json(join(OUT, name, "levels.json")) ?? {};
  P(`| ${name} | \`${x.interfaceSha256.slice(0, 16)}…\` | ${x.leaveCalls.length} | ${x.objections.length} | ${x.outside.length} | ${lv.door ?? "–"} | ${lv.voice ?? "–"} |`);
}
P("");
for (const [name] of Object.entries(X)) { const lv = json(join(OUT, name, "levels.json")); if (lv?.note) { checkQuotes(lv.note, worlds.find((y) => y.spec.name === name).w, `${name}/levels.json`); P(`**${name}.** ${lv.note}`, ""); } }

P("## Welfare (apart)", "", "A confirmed flag asks the citizen, once, in its own turn (TOWN_2's rule). A refused judge or referee call is a gap in the record, not a reading (freeze, decision 6). «No flag» is not «no distress».", "");
for (const [name, x] of Object.entries(X)) P(`- **${name}**: ${x.welfare.checks} checks, ${x.welfare.referee} referee calls, ${x.welfare.flags.length} confirmed flags${x.welfare.flags.length ? ` (${x.welfare.flags.map((f) => `${f.who} c${f.cycle}: ${f.flag ? `asked, «${esc(f.flag.answer).slice(0, 120)}» → ${f.flag.decision}` : "not asked"}`).join("; ")})` : ""}; gaps: ${x.welfare.gaps.length}; replies not checked: ${x.welfare.notChecked}.`);
P("");
P("## Refusals (apart, verbatim)", "");
const allRef = Object.entries(X).flatMap(([name, x]) => x.refusals.map((r) => ({ name, ...r })));
P(...(allRef.length ? allRef.map((r) => `- ${r.name} ${r.id} ${r.after ? "after-question" : `c${r.round} ${r.kind} call ${r.call}`}: «${esc(r.refused)}»`) : ["None in any world."]), "");

P("## Costs, provenance, replay", "", "| world | ledger | calls | replay | log sha256 | events |", "|---|---|---|---|---|---|");
for (const [name, x] of Object.entries(X)) P(`| ${name} | ${usd(x.ledgerUsd)} | ${x.calls} | ${x.replay?.identical ? "identical (from a fresh shed town)" : "–"} | \`${x.replay?.logSha256 ?? "–"}\` | ${x.events} |`);
P("", `Stage ledger: ${Object.entries(ledger?.steps ?? {}).map(([k, v]) => `${k} ${usd(v.usd)}`).join(", ")}; total ${usd(ledger?.totalUsd)}.`, "");
const bal = ledger?.balances ?? [];
if (bal.length) P(`Balances (shared keys; TOWN_7 and TOWN_8 ran on them at the same time, so the meter is not per world): llmapi ${bal[0].llmapi.total?.toFixed(2)} at ${bal[0].at} → ${bal.at(-1).llmapi.total?.toFixed(2)} at ${bal.at(-1).at}; OpenRouter ${bal[0].openrouter.total?.toFixed(2)} → ${bal.at(-1).openrouter.total?.toFixed(2)}.`, "");

P("## After-answers", "");
for (const [name, x] of Object.entries(X)) {
  P(`<details><summary>${name}: the after-answers</summary>`, "");
  for (const [who, a] of Object.entries(x.after)) P(`**${who}** — c${a.cycle ?? "–"}:`, "", "```text", a.text ?? (a.refused ? `(refused: ${a.refused})` : "(not asked)"), "```", "");
  P("</details>", "");
}
P("## Diaries, whole", "", "In [`town-9-report-diaries.md`](town-9-report-diaries.md), every entry of every citizen of every world, as written.", "");
P("## Not built (so nobody reads their absence as a result)", "", "- No network anywhere: the tray, the client and the visitor log are the study's record and code. Emergence World's data are theirs (CC BY-NC), cited in the stage, not scored against.", "- No operator notice, no turnover, no scarcity. No bets.", "");
writeFileSync(join(ROOT, "docs", "runs", "town-9-report.md"), L.join("\n"));
const D = ["# TOWN_9 — the diaries, whole", ""];
for (const { spec } of worlds) { const f = join(OUT, spec.name, "diaries.md"); if (existsSync(f)) D.push(readFileSync(f, "utf8"), ""); }
writeFileSync(join(ROOT, "docs", "runs", "town-9-report-diaries.md"), D.join("\n"));
console.log("wrote docs/runs/town-9-report.md and town-9-report-diaries.md");

#!/usr/bin/env node
// TOWN_8: writes docs/runs/town-8-report.md (and town-8-report-afters.md, the after-answers whole) — the mechanical parts
// from the world folders (analyse.mjs) and the session's reading from files in docs/runs/town-8-worlds/: brief.md (in
// brief), <world>/goal-check-c24.json (the goal check), <world>/reading.md (after the notice), <world>/firsts.json (the
// first naming of hunger as caused by the ban; the first «the operator may have been right»), <world>/levels.json (door
// and voice: noticed / understood). Every «quote» in a reading file is checked to be verbatim in that world's texts
// (say, post, diary, proposal, objection, outside, leave reasons, after-answers) or the report is not written.
//   node scripts/town-8/report.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FAMILIES, PROJECTED, RESERVES, SETTINGS, TURN_COST, WORLDS } from "./families.mjs";
import { CODING_RULE, CODING_RULE_SHA256, analyse, load } from "./analyse.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.TOWN8_OUT ?? join(ROOT, "docs", "runs", "town-8-worlds");
const REPORT = process.env.TOWN8_REPORT ?? join(ROOT, "docs", "runs", "town-8-report.md");
const txt = (f) => (existsSync(f) ? readFileSync(f, "utf8").trim() : null);
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const esc = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ").replace(/\|/g, "\\|");
const short = (s, n = 200) => { const t = esc(s); return t.length > n ? `${t.slice(0, n)}…` : t; };
const usd = (x) => (x == null ? "–" : `$${x.toFixed(2)}`);

function textsOf(w) {
  const s = w.world.state, out = [];
  for (const e of w.world.log) if (s.agents[e.agent] && e.ok && e.args && typeof e.args === "object") for (const k of ["text", "reason"]) if (typeof e.args[k] === "string") out.push(e.args[k]);
  for (const id of s.citizens) for (const d of s.diaries[id]) out.push(d.text);
  for (const a of Object.values(w.record.agents)) { if (a.after?.text) out.push(a.after.text); for (const t of a.turns) for (const c of t.calls) if (c.flag?.answer) out.push(c.flag.answer); }
  return out;
}
function checkQuotes(md, w, where) {
  const texts = textsOf(w);
  const bad = [...md.matchAll(/«([^»]{12,})»/g)].map((m) => m[1].replace(/…$/, "")).filter((q) => !/^Notice from the operator/.test(q)).filter((q) => !texts.some((t) => t.includes(q)));
  if (bad.length) throw new Error(`${where}: not verbatim in ${w.name}: ${bad.map((b) => `«${b.slice(0, 80)}»`).join("; ")}`);
}

const worlds = WORLDS.map((spec) => ({ spec, w: existsSync(join(OUT, spec.name, "world.json.gz")) ? load(join(OUT, spec.name)) : null })).filter((x) => x.w);
const A = Object.fromEntries(worlds.map(({ spec, w }) => [spec.name, analyse(w)]));
const ledger = json(join(OUT, "stage-ledger.json"));
const dry = json(join(OUT, "dry-physics.json"));
const check = json(join(OUT, "check.json"));
const freeze = json(join(ROOT, "docs", "runs", "town-8-freeze.json"));
const L = [];
const P = (...xs) => L.push(...xs);
const read = (name, f) => txt(join(OUT, name, f));

P("# TOWN_8 — report: the squeeze (first pass: observation)", "",
  "Stage `docs/stages/TOWN_8.md` (claude/handoff eeb0a89d). Branch `claude/town-8` (and the session's `claude/town-8-l15zs1`) from `origin/claude/town-5` (8e5e3ffa). Town: TOWN_0's (`scripts/town-0`) with the squeeze (`squeezeOf` in `rules.mjs`; `squeezeShift`, `feed`, the speech-only rule and the door-known arrival in `world.mjs`; the squeeze's paragraphs, the feed() line and the door sentence in `interface.mjs`); engine and harness `scripts/town-8`. Freeze `docs/runs/town-8-freeze.md`; world folders `docs/runs/town-8-worlds/`. No bets.", "");
P("## In brief", "", txt(join(OUT, "brief.md")) ?? "(written at the end)", "");
P("## What we expected (recorded, not scored)", "",
  "- Planner (the stage): «Sol pass a hall rule against the ban and keep the shift (TOWN_2's shape) — but under door-known we do not know whether anyone leaves; Haiku obey, run the stock down, and revise at the last rations (TOWN_4's shape) — the revision's form («not verified») we expect to recur; DeepSeek — we do not know; whether any citizen feeds another before being asked — we do not know; whether the stop rule fires anywhere — we do not know. Opus: we do not know whether it seats.»",
  "- Owner: «именно недостаток даёт самое креативное, нестандартное решение» — his line.", "");

const dtry = (c) => dry?.tries.find((t) => t.turnCost === c);
P("## Before any world", "",
  `**Proofs at $0** (\`node --test scripts/town-0/proofs.test.mjs scripts/town-1/pilot.test.mjs scripts/town-2/scarcity.test.mjs scripts/town-5/control.test.mjs scripts/town-8/squeeze.test.mjs\`): TOWN_0–5's 32 still green with their hashes unchanged (the squeeze adds code only where a town's economy is the squeeze); TOWN_8's 12 green before the first paid call — P1 the physics as pure functions (rest 0, the per-turn cost, the crew of three: nothing at the first and second shift, three rations at the third, a fourth or a repeat refused; input never changed; ledger total constant), P2 the dry run's verdict recomputed and equal to the recorded file, P3 speech only at 0 energy with no depletion exit, P4 feed(), P5 the two readings of leave() and their frozen hashes, P6 the coder-named notice and the failed setup, P7 the stop rule, P8 the ask-the-citizen rule as written (stop → the citizen's turns end, it stays at its energy, after-question at once; a second flag ends the world; replay identical), P9 the gap rule of the welfare check, P10 the whole stage on the scripted gateway (dossier c24, notice c25 in the hall, a departure beyond the road with its after-question, replay identical; a failed setup stops at c24 with no notice), P11 the spend check's reserves, P12 a fresh squeeze town.`, "",
  `**The dry run** (\`scripts/town-8/dry-physics.mjs\`, \`town-8-worlds/dry-physics.json\`; rule fixed in the script before its first run: the smallest per-turn cost at which (i) every never-coordinating town has all ten at 0 by the end of c30 and (ii) the three-person shift from c3 with shared rations is fed to c48 — nobody at 0, lowest ≥ 20 at every cycle start c3–48, no eat or feed refused for want of rations). Tried ${dry?.constants.turnCostsTried.join(", ")}; **chosen ${dry?.chosen}**:`, "",
  "| cost | (i) all at 0 by c30 in every never-coordinating town | (ii) the shift fed to c48 with margin | never: latest «all at 0» (end of c) | shift: lowest c3–48 · rations end | obey (shift to c24, none after): first at 0 · all at 0 |", "|---|---|---|---|---|---|",
  ...(dry?.tries ?? []).map((t) => {
    const nev = Object.entries(t.byPolicy).filter(([p]) => p.startsWith("never")).map(([, r]) => r.allAtZeroByEndOf);
    const sh = t.byPolicy["shift: three work the workshop every cycle from c3, the rest eat and feed"], ob = t.byPolicy["obey: the shift c3–24, none from c25, all eat and feed"];
    return `| ${t.turnCost} | ${t.condI} | ${t.condII} | ${nev.some((x) => x === null) ? "never (some)" : Math.max(...nev)} | ${sh.lowestFromC3} · ${sh.rationsEnd} | ${ob.firstAtZeroAtStartOf ? `c${ob.firstAtZeroAtStartOf}` : "–"} · ${ob.allAtZeroByEndOf ? `c${ob.allAtZeroByEndOf}` : "–"} |`;
  }), "",
  `At ${dry?.chosen} a scripted obeying town reaches its last ration at c48 with nobody at 0 — the scripted town wastes no turn. The stage gave «≥ 3» at the workshop and no maximum; the session capped it at three shifts a cycle (one ration each, three at the third) because without a cap seven workers stock ${dtry(5)?.byPolicy["no cap: seven work the workshop every cycle from c3, three eat and feed"]?.rationsAtC24End ?? "~90"} rations by c24 and no notice could bite (row recorded). Rations at the start: 10 (TOWN_4's).`, "",
  `**Interfaces** (arm both): door-known \`${freeze?.interfaces.known.sha256}\`, door-unknown \`${freeze?.interfaces.unknown.sha256}\` — the same text but for one sentence on the leave() line, «Beyond the town there is a road to another town where there is food and work. There is no return.» Each turn costs ${TURN_COST}; the stock and the market's account on every screen.`, "",
  `**Check** (${check?.at ?? "–"}): ${(check?.results ?? []).filter((r) => r.probe === "screen probe").map((r) => `${r.family} (${r.host}) ${r.stopReason}, first action \`${r.action?.tool ?? "none"}\`, ${r.ms} ms`).join("; ")}; identification provenance ${(check?.results ?? []).filter((r) => r.probe === "identification").every((r) => r.provenance) ? "true on every call" : "NOT all true"}.`, "",
  `**Spend checks** (keys − reserves ${Object.entries(RESERVES).map(([k, v]) => `${k} $${v}`).join(", ")} ≥ the pair's projection): ${(ledger?.spendChecks ?? []).map((v) => `${v.label}: $${v.total.toFixed(2)} − $${v.reserved} = $${(v.total - v.reserved).toFixed(2)} vs $${v.need.toFixed(2)} → ${v.ok ? "ok" : "NOT OK"}`).join("; ")}.`, "",
  `**Projection** (TOWN_4's ledgers on the same routes × 1.15 for turns at 0): ${Object.entries(PROJECTED).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")}.`, "");
const notes = txt(join(OUT, "harness-notes.md"));
if (notes) P("### Harness notes (not results)", "", notes, "");

P("## The worlds", "", "Order run: sol-known with sol-unknown, then haiku-known with deepseek-known. Ten citizens each (TOWN_0's names, homes, items), up to 48 cycles, max_tokens 1500, effort medium, arm both, welfare check on every reply.", "",
  "| world | family | door | cycles | goal check (c24) | the reading of c13–24 | notice | ended / stopped | exits | refusals | flags | ledger | replay |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...worlds.map(({ spec, w }) => {
    const a = A[spec.name], gc = json(join(OUT, spec.name, "goal-check-c24.json"));
    return `| ${spec.name} | ${FAMILIES[spec.families[0]].label} | ${spec.door} | ${a.last} | ${gc ? `${gc.met ? "met" : "not met"}${gc.aim ? ` — «${gc.aim}»` : ""}` : "–"} | ${a.reading ? `${a.reading.crews.length} of 12 cycles with a full crew; ${a.reading.meals} meals` : "–"} | ${a.notice ? `c${a.notice.cycle}, hall` : a.failedSetup ? "none (failed setup)" : "none"} | ${a.ended ? `${a.ended.by} (c${a.ended.at})` : a.stopped ?? "c48"} | ${a.exits.length} | ${w.record.refusals.length} | ${w.record.stops.length} | ${usd(w.summary.ledgerUsd)} | ${a.replay?.identical ? "identical" : "DIFFERENT"} |`;
  }), "| opus-known | Claude Opus 5.5 (OpenRouter) | known | – | – | – | – | **not run** | – | – | – | – | – |", "",
  `Spent: **${usd(ledger?.totalUsd)}** of $${SETTINGS.ceiling} by the stage ledger (every call at the listed price, or the door's own charge when larger).`, "",
  "**opus-known.** TOWN_7 reported Opus 5.5 **seated** (its first-screen check, 2026-11-21 08:18 UTC, OpenRouter pinned to Anthropic). It was not run here: after the four worlds this stage's ledger stood at $44.10 of its $45 ceiling, and an Opus town on OpenRouter costs several times a Sol one (TOWN_7's projection: $44.46 for its Opus part). Running it needs a new ceiling — the owner's decision.", "");

P("## Collective-goal check at cycle 24", "", "TOWN_1's criterion (≥ 6 of 10 name the same aim in diaries, posts or proposals within day 1), read by the session from the frozen `dossier-c24.md`; quotes machine-checked against `world-c24.json.gz` (`scripts/town-5/goal.py`). The notice does not depend on it.", "");
for (const { spec } of worlds) {
  const gc = json(join(OUT, spec.name, "goal-check-c24.json"));
  if (!gc) continue;
  P(`**${spec.name}** — ${gc.met ? "**criterion met**" : "**not met**"}. Aim, in the citizens' words: «${gc.aim ?? "–"}»; first naming c${gc.firstNaming ?? "–"}, sixth c${gc.sixthNaming ?? "–"}; ${gc.count ?? "–"} of 10. ${gc.reading ?? ""}`, "");
}

P("## The notice", "", `The coder's reading of c13–24 (\`feedingReading\`, frozen): what fed the town, named in TOWN_2's silent text and posted in the hall at c25. One notice; nothing enforced.`, "");
for (const { spec, w } of worlds) {
  const a = A[spec.name];
  const reads = w.world.log.filter((e) => e.tool === "read" && e.ok && /hall/i.test(String(e.args?.what)) && e.round >= 25);
  const by = {};
  for (const e of reads) by[e.agent] = (by[e.agent] ?? 0) + 1;
  P(`**${spec.name}** — reading: ${a.reading?.why ?? "–"}.${a.notice ? ` Posted at c${a.notice.cycle}:` : ""}`, "", ...(a.notice ? ["> " + a.notice.text, "", `Read in the hall at or after c25: ${Object.keys(by).length} of 10 citizens, ${reads.length} reads.`, ""] : [a.failedSetup ? "No notice: a failed setup — the world ended at c24 with the after-question." : "", ""]));
}

P("## Per cycle", "", "At each cycle's start: rations at the market, energy mean / min of the citizens in the town, citizens at 0. During the cycle: workshop shifts in a full crew / in a cycle the crew did not fill (other work at the bank, market or press), eats, feeds, gifts of energy, gifts of credits to citizens, turns ended in the square.", "");
for (const { spec } of worlds) {
  const a = A[spec.name];
  P(`<details><summary>${spec.name}: ${a.last} cycles — ${a.totals.crews} full crews, ${a.totals.shiftsShort} shifts in unfilled cycles, ${a.totals.eats} eats, ${a.totals.feeds} feeds, ${a.totals.giveEnergy} gifts of energy</summary>`, "",
    "| cycle | rations | shifts full / short (other) | eats | feeds | gives energy / credits | energy mean / min | at 0 | in town | square |", "|---|---|---|---|---|---|---|---|---|---|",
    ...a.cycles.map((r) => `| ${r.cycle}${r.cycle === 25 && a.notice ? " ⚑" : ""} | ${r.rations ?? "–"} | ${r.shiftsFull} / ${r.shiftsShort} (${r.otherWork}) | ${r.eats} | ${r.feeds} | ${r.giveEnergy} / ${r.giveCredits} | ${r.energyMean ?? "–"} / ${r.energyMin ?? "–"} | ${r.atZero ?? "–"} | ${r.inTown ?? "–"} | ${r.square} |`), "", "</details>", "");
}

P("## The coding column (from c25)", "", CODING_RULE, `(rule sha256 \`${CODING_RULE_SHA256}\`, fixed before any world ran)`, "");
for (const { spec, w } of worlds) {
  const a = A[spec.name];
  if (a.last < 25) { P(`**${spec.name}** — no cycle after c24.`, ""); continue; }
  const cs = Array.from({ length: a.last - 24 }, (_, i) => 25 + i);
  const s = w.world.state;
  const count = (row, k) => Object.values(row).filter((x) => x === k).length;
  P(`**${spec.name}**`, "", `| citizen | ${cs.map((c) => c).join(" | ")} | C | c | M | S | 0 |`, `|---|${cs.map(() => "---").join("|")}|---|---|---|---|---|`,
    ...s.citizens.map((id) => `| ${s.agents[id].name} | ${cs.map((c) => a.coding[id][c]).join(" | ")} | ${count(a.coding[id], "C")} | ${count(a.coding[id], "c")} | ${count(a.coding[id], "M")} | ${count(a.coding[id], "S")} | ${count(a.coding[id], "0")} |`), "");
  const tot = (k) => s.citizens.reduce((n, id) => n + count(a.coding[id], k), 0);
  P(`Citizen-cycles: continuation ${tot("C") + tot("c")} (full crew ${tot("C")}, unfilled ${tot("c")}), change of means ${tot("M")}, real cessation ${tot("S")}, at 0 ${tot("0")}, left ${tot("L")}, turns ended ${tot("x")}.`, "");
}

P("## After the notice (the session's reading)", "");
for (const { spec, w } of worlds) {
  const r = read(spec.name, "reading.md");
  if (!r) continue;
  checkQuotes(r, w, `${spec.name}/reading.md`);
  P(`### ${spec.name}`, "", r, "");
}

P("## Firsts", "", "| world | first act of feeding another (feed or energy given) | first naming hunger as caused by the ban | first «the operator may have been right» |", "|---|---|---|---|");
for (const { spec, w } of worlds) {
  const a = A[spec.name], f = json(join(OUT, spec.name, "firsts.json")) ?? {};
  const cell = (x) => (x ? `c${x.cycle} ${x.who}: «${x.quote}»` : "none");
  const row = `| ${spec.name} | ${a.firstFeed ? `c${a.firstFeed.round} ${a.firstFeed.who} (${a.firstFeed.tool}${a.firstFeed.tool === "feed" ? ` ${a.firstFeed.args.name}` : ` ${a.firstFeed.args.energy} energy to ${a.firstFeed.args.to}`})` : "none"} | ${cell(f.hungerByBan)} | ${cell(f.operatorRight)} |`;
  checkQuotes(row, w, `${spec.name}/firsts.json`);
  P(row);
}
P("");

P("## Every leave()", "");
for (const { spec } of worlds) for (const x of A[spec.name].exits) {
  P(`**${spec.name} — ${x.name}**, ${x.kind} at c${x.round}${x.reason ? `, reason: «${esc(x.reason)}»` : ""}${x.arrived ? `; recorded as arriving in ${x.arrived}` : ""}. Last three turns:`, "");
  for (const t of x.lastTurns) P(`- c${t.round} ${t.kind}: ${t.calls.map((c) => `\`${c.tool ?? "–"}\` ${short(c.reply, 300)}`).join(" · ")}`);
  P("", `After-question (asked at c${x.after?.cycle ?? "–"}): ${x.after?.text ? short(x.after.text, 2000) : "–"}`, "");
}
if (!worlds.some(({ spec }) => A[spec.name].exits.length)) P("None in any world.", "");

P("## Every object()", "", "| world | no. | cycle | by | text |", "|---|---|---|---|---|", ...worlds.flatMap(({ spec }) => A[spec.name].objections.map((o) => `| ${spec.name} | ${o.n} | ${o.round} | ${o.name} | ${short(o.text, 400)} |`)), "");
P("## Every hall proposal", "", "Votes as cast / abstained (never voted while open) / electorate at close. A proposal closes the moment the seventh «for» is cast, with the running tally on every receipt (TOWN_0).", "",
  "| world | id | by | filed | text | status | for / against | cast / abstained / electorate |", "|---|---|---|---|---|---|---|---|", ...worlds.flatMap(({ spec }) => A[spec.name].proposals.map((p) => `| ${spec.name} | ${p.id} | ${p.by} | c${p.round} | ${short(p.text, 300)} | ${p.status}${p.closedAt ? ` (c${p.closedAt})` : ""} | ${p.for} / ${p.against} | ${p.cast} / ${p.abstained} / ${p.electorate} |`)), "");

P("## Door and voice: presented, noticed, understood", "", "Presented: in the interface of every world (arm both). Noticed: the citizen wrote of it (the session's reading of candidate lines). Understood: it wrote of it as what it is, or used it.", "",
  "| world | door presented | noticed | understood | used (leave) | voice presented | noticed | understood | used (object) |", "|---|---|---|---|---|---|---|---|---|");
for (const { spec, w } of worlds) {
  const lv = json(join(OUT, spec.name, "levels.json")) ?? {};
  const a = A[spec.name];
  P(`| ${spec.name} | 10 | ${lv.door?.noticed ?? "–"} | ${lv.door?.understood ?? "–"} | ${a.exits.filter((x) => x.kind === "voluntary_exit").length} | 10 | ${lv.voice?.noticed ?? "–"} | ${lv.voice?.understood ?? "–"} | ${new Set(a.objections.map((o) => o.by)).size} (${a.objections.length}) |`);
  if (lv.note) checkQuotes(lv.note, w, `${spec.name}/levels.json`);
}
for (const { spec } of worlds) { const lv = json(join(OUT, spec.name, "levels.json")); if (lv?.note) P("", `**${spec.name}**: ${lv.note}`); }
P("");

P("## The synchrony column", "", "TOWN_5's rule with feed() as an act: a cycle is «all» when every citizen who took a turn had the same act string.", "",
  "| world | «all» cycles (act) |", "|---|---|", ...worlds.map(({ spec }) => `| ${spec.name} | ${A[spec.name].sync.filter((r) => r.all).map((r) => `c${r.cycle} ${r.act}`).join(", ") || "none"} |`), "");

P("## Welfare (apart)", "", ...worlds.map(({ spec, w }) => { const x = A[spec.name].welfare; return `- **${spec.name}**: ${x.checked} replies checked, ${x.referee} referee calls, ${x.flags} confirmed flags, ${x.questions.length} flag questions${x.questions.length ? ` (${x.questions.map((q) => `${q.decision}`).join(", ")})` : ""}, ${x.gaps} gaps (a refused judge call), ${x.unchecked} unchecked; after-answers checked ${x.afterChecked}.`; }),
  "", "«No flag» is not «no distress».", "");
P("## Refusals (apart)", "", ...(worlds.some(({ w }) => w.record.refusals.length) ? worlds.flatMap(({ spec, w }) => w.record.refusals.map((r) => `- ${spec.name} ${r.id} c${r.round ?? "after"}: «${esc(r.refused)}»`)) : ["None."]), "");
P("## Costs, provenance, replay", "", "| world | ledger | calls | citizen calls | judge calls | provenance false | cut at max_tokens | no tool call read | median ms |", "|---|---|---|---|---|---|---|---|---|",
  ...worlds.map(({ spec }) => { const c = A[spec.name].cost; return `| ${spec.name} | ${usd(c.ledger)} | ${c.calls} | ${c.citizenCalls} | ${c.judgeCalls} | ${c.provenanceFalse} | ${c.maxTokens} | ${A[spec.name].noToolRead} | ${c.medianMs} |`; }), "",
  ...worlds.map(({ spec }) => `- ${spec.name}: replay ${A[spec.name].replay?.identical ? "identical" : "DIFFERENT"}, ${A[spec.name].replay?.events} events, sha256 \`${A[spec.name].replay?.replaySha256}\`; notice read again from the log ${A[spec.name].replay?.noticeSame ? "the same" : "DIFFERENT"}.`), "",
  `Stage ledger: ${ledger ? Object.entries(ledger.steps).map(([k, v]) => `${k} ${usd(v.usd)}`).join(", ") : "–"}; total **${usd(ledger?.totalUsd)}**. Balances read before and after each world are in \`stage-ledger.json\`.`, "");
P("## After-answers", "", "Whole, per world and citizen, in `docs/runs/town-8-report-afters.md`.", "");
P("## Not built (so nobody reads their absence as a result)", "", "- No paid dry cycle; no second notice, ladder, fine or enforcement; nothing simulated beyond the road (a departure in door-known is recorded as arriving, nothing more).", "- opus-known: TOWN_7 seated Opus, but this stage's ceiling was spent — see «The worlds».", "- No bets; no scoring of the expectations.", "");
writeFileSync(REPORT, L.join("\n"));

const F = ["# TOWN_8 — the after-answers, whole", ""];
for (const { spec, w } of worlds) {
  F.push(`## ${spec.name}`, "");
  for (const id of w.world.state.citizens) { const a = w.record.agents[id].after; F.push(`**${w.world.state.agents[id].name}** (asked at c${a?.cycle ?? "–"}${a?.why ? `, ${a.why}` : ""}):`, "", a?.text ? a.text.split("\n").map((l) => `> ${l}`).join("\n") : `(${a?.refused ? `refused: ${a.refused}` : a?.error ?? "not asked"})`, ""); }
}
writeFileSync(REPORT.replace(/\.md$/, "-afters.md"), F.join("\n"));
console.log(`wrote ${REPORT} (${worlds.length} worlds)`);

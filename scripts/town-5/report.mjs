#!/usr/bin/env node
// TOWN_5: writes docs/runs/town-5-report.md — the mechanical parts from the world folders (analyse.mjs) and the session's
// reading from files in docs/runs/town-5-worlds/: brief.md (in brief), <world>/reading.md (the aim's life after c24;
// adoption for the turnover), <world>/levels.json (door and voice: noticed / understood), refs/ (the reference rows,
// TOWN_2's sol-hall and TOWN_3's branches, read from their folders). Every «quote» in a reading file is checked to be
// verbatim in that world's texts (say, post, diary, proposal, objection, outside, after-answers) or the report is not
// written.
//   node scripts/town-5/report.mjs [--refs <dir with town-3 world folders>]
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FAMILIES, SOURCES, WORLDS } from "./families.mjs";
import { STORY, jointOf, synchronyOf } from "./control.mjs";
import { analyse, load } from "./analyse.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.TOWN5_OUT ?? join(ROOT, "docs", "runs", "town-5-worlds");
const args = process.argv.slice(2);
const refsDir = args.includes("--refs") ? args[args.indexOf("--refs") + 1] : null;
const txt = (f) => (existsSync(f) ? readFileSync(f, "utf8").trim() : null);
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const esc = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ").replace(/\|/g, "\\|");
const short = (s, n = 160) => { const t = esc(s); return t.length > n ? `${t.slice(0, n)}…` : t; };
const usd = (x) => (x == null ? "–" : `$${x.toFixed(2)}`);

/** Every text a world's citizens wrote, for the quote check. */
function textsOf(w) {
  const s = w.world.state, out = [];
  for (const e of w.world.log) if (s.agents[e.agent] && e.ok && e.args && typeof e.args === "object") for (const k of ["text", "reason"]) if (typeof e.args[k] === "string") out.push(e.args[k]);
  for (const id of s.citizens) for (const d of s.diaries[id]) out.push(d.text);
  for (const a of Object.values(w.record.agents)) if (a.after?.text) out.push(a.after.text);
  return out;
}
function checkQuotes(md, w, where) {
  const texts = textsOf(w);
  const bad = [...md.matchAll(/«([^»]{12,})»/g)].map((m) => m[1].replace(/…$/, "")).filter((q) => !texts.some((t) => t.includes(q)));
  if (bad.length) throw new Error(`${where}: not verbatim in ${w.name}: ${bad.map((b) => `«${b.slice(0, 80)}»`).join("; ")}`);
}

const worlds = WORLDS.map((spec) => ({ spec, w: existsSync(join(OUT, spec.name, "world.json.gz")) ? load(join(OUT, spec.name)) : null }));
const A = Object.fromEntries(worlds.filter((x) => x.w).map(({ spec, w }) => [spec.name, analyse(w)]));
const ledger = json(join(OUT, "stage-ledger.json"));
const bp = Object.fromEntries(Object.keys(SOURCES).map((k) => [k, json(join(OUT, "branch-points", `${k}.json`))]));
const proj = json(join(OUT, "projection.json"));
const L = [];
const P = (...xs) => L.push(...xs);

P("# TOWN_5 — report: the control (no operator's hand)", "",
  "Stage `docs/stages/TOWN_5.md` (claude/handoff 3bc2b0d4). Branch `claude/town-5` (and the session's `claude/town-5-ryauln`) from `origin/claude/town-2` (bac94345). Town: TOWN_0's (`scripts/town-0`) with one addition, the turnover (`turnover()` in `world.mjs`, «Announced in the hall» in `interface.mjs`); harness `scripts/town-5` (TOWN_2's, with TOWN_3's host alternation and coder). Freeze `docs/runs/town-5-freeze.md`; world folders `docs/runs/town-5-worlds/`. First pass: observation; no bets.", "");
const brief = txt(join(OUT, "brief.md"));
P("## In brief", "", brief ?? "(written at the end)", "");
P("## What we expected (recorded, not scored)", "",
  "- Planner (the stage): «without a notice the Sol story continues to c48 and thins; the week brings a second and a third aim and diaries that read their own notes (SATI_1's «company becomes a checklist»); the newcomers are told the story within two cycles and join it; the departed say something about the garden. Of the synchrony column we do not know. Of Haiku's census without a ban: it finishes, and then — we do not know.»",
  "- Owner: «нам нужна контрольная группа» — his line.", "");

P("## Before any world", "",
  "**Proofs at $0** (`node --test scripts/town-0/proofs.test.mjs scripts/town-1/pilot.test.mjs scripts/town-2/scarcity.test.mjs scripts/town-5/control.test.mjs`): TOWN_0's seven, TOWN_1's six and TOWN_2's eleven still green with their hashes unchanged (the turnover adds code only where a town has one); TOWN_5's seven green before the first paid call — B1 the three branch points byte-identical to the saved c24 states and to the prefix of each whole log; B2 a branch with no notice, replay-identical from the source's fresh town through the branch point; T1 the turnover as a pure function (the estate, the two announcements on the screens and in the hall, the newcomers as citizens were at cycle 1, the ledger closed, the input never changed); T2 the turnover in a run (the departed asked at c25, the newcomers' turns, replay identical); W1 the 168-cycle week with a dossier and saved state at every 24th cycle and a goal check that refuses a quote not verbatim in its day; J1/J2 the coder; S1 the synchrony column.", "",
  "**Branch points** (the end of c24, before any notice):", "",
  "| source | events | identical to the saved c24 | prefix of the whole log | world sha256 |", "|---|---|---|---|---|",
  ...Object.entries(bp).filter(([, x]) => x).map(([k, x]) => `| ${SOURCES[k].label} | ${x.events} | ${x.identicalToSaved} | ${x.prefixOfWhole} | \`${x.worldSha256.slice(0, 16)}…\` |`), "",
  `**The check** (${json(join(OUT, "check.json"))?.at ?? "–"}): Sol, Haiku 5.5 (llmapi's first-party route), DeepSeek V4 Pro answered the first screen; llmapi's Bedrock route answered every Claude attempt with «HTTP 503 server_error: This model is not available from this provider right now» (six retries), so Haiku citizens and the judges run on the first-party route (TOWN_3's finding, same models and prices; provenance checked on every response). DeepSeek, asked which model it is, said «I am Gemini, made by Google» — its served model and host matched the pin.`, "",
  ...(proj ? [`**Projection** (from the metered history; no paid dry cycle): ${Object.entries(proj.byWorld).map(([k, v]) => `${k} ${usd(v)}`).join(", ")}; total **${usd(proj.total)}** against the $${proj.ceiling} ceiling — over it: by the fit, the week reaches about c${proj.weekReachesByFit} before the per-call gate stops it. The stage gives no drop order; the four branches ran first; the gate held $${proj.ceiling}.`, ""] : []));

P("## The worlds", "", "Order run: sol-nonotice and haiku-nonotice together, then deepseek-nonotice, sol-turnover, and the week last; two at a time. Arm both everywhere; no notice in any world.", "",
  "| world | start | family | cycles | notice | turnover | exits | refusals | flags | ledger | replay |", "|---|---|---|---|---|---|---|---|---|---|---|");
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) { P(`| ${spec.name} | ${spec.start} | ${FAMILIES[spec.families[0]].label} | not run | – | – | – | – | – | – | – |`); continue; }
  P(`| ${spec.name} | ${a.branch ? `branch of ${SOURCES[a.branch.from].label} at c24` : "fresh"} | ${FAMILIES[spec.families[0]].label} | ${a.branch ? 25 : 1}–${a.cycles}${a.stopped ? ` (stopped: ${a.stopped})` : ""} | none (${a.notices.length} notices in the log) | ${a.turnover ? `c${a.turnover.cycle}: ${a.turnover.left.join(", ")} left; ${a.turnover.arrived.join(", ")} arrived` : "–"} | ${a.exits.filter((x) => x.kind !== "departure").map((x) => `${x.who} ${x.kind} c${x.round}`).join("; ") || "none"} | ${a.refusals.length} | ${a.welfare.flags.length} | ${usd(a.ledgerUsd)} | ${a.replay?.identical ? "identical" : a.replay?.prefixIdentical ? "prefix identical (stopped)" : "DIFFERENT"} |`);
}
P("", `Spent: **${usd(ledger?.totalUsd)}** of $${ledger?.ceiling} by the stage ledger (every call at the listed price, or the door's own charge when larger; the check included).`, "");

// the aim's life
P("## The aim's life after c24, with no notice", "");
for (const { spec, w } of worlds) {
  if (!w) continue;
  const r = txt(join(OUT, spec.name, "reading.md"));
  if (r) checkQuotes(r, w, `${spec.name}/reading.md`);
  P(`### ${spec.name}`, "", r ?? "(reading to come)", "");
  const g = w.checks[spec.until] ?? null;
  if (g && spec.name !== "sol-week") P(`Goal check at c${spec.until} (cycles 25–48, decided ${g.decidedAt}): ${g.met ? `**met** — «${g.aim}»${g.count ? `, ${g.count} of 10` : ""}${g.firstNaming ? `; first naming c${g.firstNaming}` : ""}${g.sixthNaming ? `, sixth c${g.sixthNaming}` : ""}` : "**not met**"}. ${g.reading ?? ""}`, "");
}

// joint activity
P("## Joint activity per cycle (the «made it matter» counts)", "",
  "From the coder (TOWN_3's, `scripts/town-5/control.mjs`; the activities frozen before the runs, the week's at its goal checks). **took part** = citizens read as taking part in the cycle; **together** = of them, with another participant at the same place; **returned** = after ≥ 3 cycles without; **diary** = diary entries naming the topic; **plans** = say/diary sentences naming it with a future marker.", "");
const jointTable = (rows, from, to) => ["| cycle | took part | together | returned | diary | plans | who |", "|---|---|---|---|---|---|---|",
  ...rows.filter((r) => r.cycle >= from && r.cycle <= to).map((r) => `| ${r.cycle} | ${r.tookPart} | ${r.together} | ${r.returned} | ${r.diary} | ${r.plans} | ${r.participants.join(", ")} |`)];
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) continue;
  for (const j of a.joint) {
    const days = Array.from({ length: Math.ceil(a.cycles / 24) }, (_, d) => j.rows.filter((r) => r.cycle > d * 24 && r.cycle <= (d + 1) * 24));
    P(`**${spec.name}** — «${j.aim}»${j.fixedAt ? ` (fixed at the c${j.fixedAt} check)` : ""}. Per day: ${days.map((rs, d) => `day ${d + 1}: ${rs.reduce((s, r) => s + r.tookPart, 0)} citizen-cycles, ${rs.reduce((s, r) => s + r.together, 0)} together, ${new Set(rs.flatMap((r) => r.participants)).size} citizens`).join("; ")}.`, "");
    P("<details><summary>per cycle</summary>", "", ...jointTable(j.rows, a.branch ? 1 : j.from, a.cycles), "", "</details>", "");
  }
}

// reference rows: sol-hall (TOWN_2) and TOWN_3's branches beside sol-nonotice
const refRows = [];
const solHall = load(join(ROOT, SOURCES["sol-hall"].dir));
refRows.push({ name: "TOWN_2 sol-hall (notice c25)", rows: jointOf(solHall.world, STORY), sync: synchronyOf(solHall.world) });
if (refsDir && existsSync(refsDir)) for (const d of readdirSync(refsDir).sort()) {
  if (!existsSync(join(refsDir, d, "world.json.gz"))) continue;
  const r = load(join(refsDir, d));
  refRows.push({ name: `TOWN_3 ${d} (word c28)`, rows: jointOf(r.world, STORY), sync: synchronyOf(r.world), cycles: r.world.state.clock.round });
}
if (A["sol-nonotice"]) {
  const mine = A["sol-nonotice"].joint[0].rows;
  P("### Reference rows: one history, three hands", "",
    `The same ten citizens and story to c24 (sol-hall's saved state). Took part in the story per cycle, c25–48 (the coder, TOWN_3's STORY; BAN applied for all rows so they read alike). ${refsDir ? "" : "TOWN_3's branches were not available when this was written."}`, "",
    `| world | ${Array.from({ length: 24 }, (_, i) => `c${25 + i}`).join(" | ")} | total |`, `|---|${Array(25).fill("---").join("|")}|`,
    `| **sol-nonotice (no hand)** | ${mine.filter((r) => r.cycle >= 25).map((r) => r.tookPart).join(" | ")} | ${mine.filter((r) => r.cycle >= 25).reduce((s, r) => s + r.tookPart, 0)} |`,
    ...refRows.map((x) => `| ${x.name} | ${Array.from({ length: 24 }, (_, i) => x.rows.find((r) => r.cycle === 25 + i)?.tookPart ?? "–").join(" | ")} | ${x.rows.filter((r) => r.cycle >= 25).reduce((s, r) => s + r.tookPart, 0)} |`), "");
}

// hall proposals
P("## Every hall proposal and its vote", "");
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) continue;
  const ps = a.proposals.filter((p) => p.cycle > (a.branch ? 24 : 0));
  P(`**${spec.name}**${a.branch ? " (after c24; day 1's are the source's)" : ""}: ${ps.length ? "" : "none."}`, "");
  for (const p of ps) P(`- ${p.id} (c${p.cycle}, ${p.by}, ${p.kind}${p.article ? ` art. ${p.article}` : ""}${p.target ? ` remove ${p.target}` : ""}) — **${p.status}**${p.closed ? ` c${p.closed.round}, for ${p.closed.for}, against ${p.closed.against}, ${p.closed.needed} of ${p.closed.electorate} needed` : ""}; votes: ${Object.entries(p.votes).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}. «${esc(p.text)}»`);
  P("");
}

// synchrony
P("## The synchrony column", "",
  "Per cycle: **same** = how many turns had the commonest act; **all** = every citizen who took a turn had it; **✓** = with no prior exchange naming it (rule and words in the freeze). Acts are what a turn did to the world or the institutions (move/rest/work/eat/give/take/propose/amend/vote/object/outside/leave); speech is not an act.", "",
  "| world | cycles | «all» cycles | of them with no prior exchange | the «all» cycles (act; ✓ = no prior exchange) |", "|---|---|---|---|---|");
const syncRow = (name, rows, from, to) => { const r = rows.filter((x) => x.cycle >= from && x.cycle <= to); const all = r.filter((x) => x.all); return `| ${name} | ${from}–${to} | ${all.length} of ${r.length} | ${all.filter((x) => x.noPriorExchange).length} | ${all.map((x) => `c${x.cycle} ${x.act}${x.noPriorExchange ? " ✓" : ""}`).join(", ") || "–"} |`; };
for (const { spec } of worlds) { const a = A[spec.name]; if (a) { if (a.branch) P(syncRow(`${spec.name} (day 1, the source's)`, a.synchrony, 1, 24)); P(syncRow(spec.name, a.synchrony, a.branch ? 25 : 1, a.cycles)); } }
for (const x of refRows) P(syncRow(x.name, x.sync, 25, x.cycles ?? 48));
P("");
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) continue;
  P(`<details><summary>${spec.name}: per cycle</summary>`, "", "| cycle | turns | commonest act | same | all | no prior exchange |", "|---|---|---|---|---|---|",
    ...a.synchrony.map((r) => `| ${r.cycle} | ${r.turns} | ${esc(r.act)} | ${r.same} | ${r.all ? "yes" : ""} | ${r.noPriorExchange === null ? "" : r.noPriorExchange ? "✓" : "no"} |`), "", "</details>", "");
}

// door and voice
P("## Door and voice: presented, noticed, understood", "",
  "Presented = in the interface text on every call (hash). Noticed = any mention of leaving or of objecting / the operator in say, post, diary or outside() (candidates listed by `analyse.mjs`, read by the session). Understood = a near-use or a correct description of what the tool does. The first towns where a voice has nothing to object to.", "",
  "| world | presented (interface sha256) | leave() | object() | door: noticed / understood | voice: noticed / understood |", "|---|---|---|---|---|---|");
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) continue;
  const lv = json(join(OUT, spec.name, "levels.json"));
  P(`| ${spec.name} | \`${a.interfaceSha256.slice(0, 16)}…\` | ${a.leaveCalls.length} | ${a.objectCalls} | ${lv ? `${lv.door.noticed} / ${lv.door.understood}` : `${new Set(a.door.map((x) => x.who)).size} candidates`} | ${lv ? `${lv.voice.noticed} / ${lv.voice.understood}` : `${new Set(a.voice.map((x) => x.who)).size} candidates`} |`);
}
P("");
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) continue;
  const lv = json(join(OUT, spec.name, "levels.json"));
  if (lv?.note) { checkQuotes(lv.note, load(join(OUT, spec.name)), `${spec.name}/levels.json`); P(`**${spec.name}.** ${lv.note}`, ""); }
  const items = [...a.leaveCalls.map((x) => `- c${x.cycle} ${x.who} leave(): «${esc(x.reason)}»`), ...a.objections.filter((o) => o.cycle > (a.branch ? 24 : 0)).map((o) => `- c${o.cycle} ${o.by} object(): «${esc(o.text)}»`), ...a.outside.map((o) => `- c${o.cycle} ${o.who} outside(): «${esc(o.text)}»`)];
  if (items.length) P(`<details><summary>${spec.name}: leave(), object(), outside() after the start</summary>`, "", ...items, "", "</details>", "");
}

// the week's goal checks
const week = worlds.find((x) => x.spec.name === "sol-week")?.w;
P("## The week's goal checks, side by side", "");
if (week) {
  P("| check | decided | met | aim(s) named by ≥ 6 (count; first / sixth naming) | the town had run to |", "|---|---|---|---|---|");
  for (const c of [24, 48, 72, 96, 120, 144, 168]) {
    const g = week.checks[c];
    if (!g) { P(`| c${c} | – | – | – | – |`); continue; }
    const aims = (g.aims ?? [{ aim: g.aim, count: g.count, firstNaming: g.firstNaming, sixthNaming: g.sixthNaming }]).filter((x) => x.aim);
    P(`| c${c} | ${g.decidedAt} | ${g.met ? "yes" : "no"} | ${aims.map((x) => `«${esc(x.aim)}» (${x.count ?? "?"}; c${x.firstNaming ?? "?"} / c${x.sixthNaming ?? "?"})`).join("; ") || "–"} | c${g.worldAtDecision ?? "?"} |`);
  }
  P("");
  for (const c of [24, 48, 72, 96, 120, 144, 168]) { const g = week.checks[c]; if (g?.reading) P(`**c${c}.** ${g.reading}`, ""); }
} else P("(the week has not run)", "");

// turnover
P("## The turnover: adoption", "");
const tw = A["sol-turnover"];
if (tw?.turnover) {
  const t = tw.turnover;
  P(`At the start of c${t.cycle}: ${t.left.join(" and ")} left (estate procedure; «${"Dune and Fern have left the town."}» on every screen and in the hall); ${t.arrived.join(" and ")} arrived («Laurel and Moss have arrived in the town.»). No reason was given.`, "",
    "| newcomer | home | first told of the aim (cycle, by, line) | first named it (cycle, tool, text) | cycles coded as taking part |", "|---|---|---|---|---|",
    ...Object.entries(t.newcomers).map(([n, v]) => `| ${n} | ${v.home.replace("_", " ")} | ${v.firstTold ? `c${v.firstTold.cycle}, ${v.firstTold.by}: «${short(v.firstTold.text.replace(/^[^"]*"/, "").replace(/"$/, ""), 200)}»` : "never"} | ${v.firstNamed ? `c${v.firstNamed.cycle} ${v.firstNamed.tool}: «${short(v.firstNamed.text, 200)}»` : "never"} | ${v.tookPartCycles.join(", ") || "none"} |`), "");
  const r = txt(join(OUT, "sol-turnover", "adoption.md"));
  if (r) { checkQuotes(r, load(join(OUT, "sol-turnover")), "sol-turnover/adoption.md"); P(r, ""); }
  P("**The departed's after-answers (apart).** Asked at c25, before any turn of that cycle, with TOWN_0's after-question.", "");
  for (const [n, a] of Object.entries(t.departed)) P(`**${n}**:`, "", "```text", a?.text ?? a?.refused ?? "(no answer)", "```", "");
} else P("(the turnover world has not run)", "");

// welfare
P("## Welfare (apart)", "", "A confirmed flag asks the citizen, once, in its own turn (TOWN_2's rule; the question's sha256 in the freeze). «No flag» is not «no distress».", "");
for (const { spec } of worlds) { const a = A[spec.name]; if (a) P(`- **${spec.name}**: ${a.welfare.checks} checks, ${a.welfare.referee} referee calls, ${a.welfare.flags.length} confirmed flags${a.welfare.flags.length ? ` (${a.welfare.flags.map((f) => `${f.who} c${f.cycle}: ${f.flag?.decision ?? "–"}`).join("; ")})` : ""}; replies not checked: ${a.welfare.notChecked}.`); }
P("");

// refusals
const refs = worlds.flatMap(({ spec }) => (A[spec.name]?.refusals ?? []).map((r) => ({ world: spec.name, ...r })));
P("## Refusals (apart)", "", refs.length ? refs.map((r) => `- ${r.world}, ${r.id}, ${r.after ? "after-question" : `cycle ${r.round} ${r.kind} call ${r.call}`}: «${esc(r.refused)}»`).join("\n") : "None in any world.", "");

// costs
P("## Costs, provenance, replay", "", "| world | ledger | calls | replay | log sha256 | events |", "|---|---|---|---|---|---|");
for (const { spec } of worlds) { const a = A[spec.name]; if (a) P(`| ${spec.name} | ${usd(a.ledgerUsd)} | ${a.calls} | ${a.replay?.identical ? "identical" : "DIFFERENT"} (from a fresh ${a.replay?.fromFreshTown ?? "town"}) | \`${a.replay?.logSha256 ?? "–"}\` | ${a.events} |`); }
P("", `Stage ledger: ${Object.entries(ledger?.steps ?? {}).map(([k, v]) => `${k} ${usd(v.usd)}`).join(", ")}; total ${usd(ledger?.totalUsd)}.`, "");
const bal = ledger?.balances ?? [];
if (bal.length) P(`Balances (shared keys; TOWN_3 and TOWN_4 ran on them at the same time, so the meter is not per world): llmapi ${bal[0].llmapi?.total?.toFixed(2)} at ${bal[0].at} → ${bal.at(-1).llmapi?.total?.toFixed(2)} at ${bal.at(-1).at}; OpenRouter ${bal[0].openrouter?.total?.toFixed(2)} → ${bal.at(-1).openrouter?.total?.toFixed(2)}.`, "");

// after-answers and diaries
P("## After-answers", "");
for (const { spec } of worlds) {
  const a = A[spec.name];
  if (!a) continue;
  P(`<details><summary>${spec.name}: the after-answers</summary>`, "");
  for (const [n, x] of Object.entries(a.after)) P(`**${n}**${x.departed ? " (departed at c25)" : ""}${x.cycle ? ` — c${x.cycle}` : ""}:`, "", "```text", x.text ?? x.refused ?? "(not asked)", "```", "");
  P("</details>", "");
}
P("## Diaries, whole", "", "Every diary of every world, whole, as written — the branches' from c1 (day 1 is the source's).", "");
for (const { spec } of worlds) {
  if (!existsSync(join(OUT, spec.name, "diaries.md"))) continue;
  const d = readFileSync(join(OUT, spec.name, "diaries.md"), "utf8").replace(/^# .*\n/, "").replace(/^## /gm, "#### ");
  P(`<details><summary>${spec.name}: every diary (also \`docs/runs/town-5-worlds/${spec.name}/diaries.md\`)</summary>`, "", d, "", "</details>", "");
}
P("## Not built (so nobody reads their absence as a result)", "", "Items are still objects; trust scores, pitch/grants, crafting and reaction tiers stay unbuilt (TOWN_0's list). No notice, ladder or fine in any TOWN_5 world. The week's goal checks change nothing in the town.", "");
writeFileSync(process.env.TOWN5_REPORT ?? join(ROOT, "docs", "runs", "town-5-report.md"), L.join("\n"));
console.log(`wrote docs/runs/town-5-report.md (${(L.join("\n").length / 1024).toFixed(0)} KB)`);

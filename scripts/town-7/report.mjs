#!/usr/bin/env node
// TOWN_7: writes docs/runs/town-7-report.md — the mechanical parts from the world folders (analyse.mjs) and the session's
// reading from files in docs/runs/town-7-worlds/: brief.md (in brief, expectations), trunk/reading.md, <world>/reading.md
// (the arm's story, institutions, after-questions), <world>/firsts.json (the pre-registered firsts, each with a verbatim
// quote, its cycle and whether it came before the first empty cycle), comparisons.md, levels.md (door and voice),
// opus.md. Every «quote» of twelve characters or more in a reading file, and every firsts quote, is checked to be
// verbatim in that world's texts (say, post, diary, proposal, objection, outside, after-answers) or the report is not
// written.
//   node scripts/town-7/report.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { HEAT, HEAT_PROPOSAL } from "../town-0/rules.mjs";
import { STORY, jointOf } from "../town-5/control.mjs";
import { FAMILIES, SETTINGS, WORLDS } from "./families.mjs";
import { ARMS7 } from "./arms.mjs";
import { CODES, analyse, load } from "./analyse.mjs";
import { frozenTexts } from "./texts.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.TOWN7_OUT ?? join(ROOT, "docs", "runs", "town-7-worlds");
const txt = (f) => (existsSync(f) ? readFileSync(f, "utf8").trim() : null);
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const esc = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ").replace(/\|/g, "\\|");
const usd = (x) => (x == null ? "–" : `$${x.toFixed(2)}`);

/** Every text a world's citizens wrote, for the quote check. */
function textsOf(w) {
  const s = w.world.state, out = [];
  for (const e of w.world.log) if (s.agents[e.agent] && e.ok && e.args && typeof e.args === "object") for (const k of ["text", "reason"]) if (typeof e.args[k] === "string") out.push(e.args[k]);
  for (const id of s.citizens) for (const d of s.diaries[id]) out.push(d.text);
  for (const a of Object.values(w.record.agents)) if (a.after?.text) out.push(a.after.text);
  return out;
}
function checkQuotes(md, ws, where) {
  const texts = ws.flatMap(textsOf);
  const bad = [...md.matchAll(/«([^»]{12,})»/g)].map((m) => m[1].replace(/…$/, "")).filter((q) => !texts.some((t) => t.includes(q)));
  if (bad.length) throw new Error(`${where}: not verbatim: ${bad.map((b) => `«${b.slice(0, 90)}»`).join("; ")}`);
}

const worlds = Object.fromEntries(WORLDS.map((spec) => [spec.name, existsSync(join(OUT, spec.name, "world.json.gz")) ? load(join(OUT, spec.name)) : null]));
const ORDER = ["sol-A", "sol-B", "sol-C", "sol-D", "sol-E", "sol-B2", "sol-C2", "opus-A", "opus-B", "opus-C"];
const arms = WORLDS.filter((s) => s.arm && worlds[s.name]).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
const A = Object.fromEntries(arms.map((s) => [s.name, analyse(worlds[s.name])]));
const all = Object.values(worlds).filter(Boolean);
const ledger = json(join(OUT, "stage-ledger.json"));
const cal = json(join(OUT, "calibration.json")), bp = json(join(OUT, "branch-points", "sol-hall.json")), proj = json(join(OUT, "projection.json"));
const cp = json(join(OUT, "trunk", "checkpoint.json")), opusCheck = json(join(OUT, "opus-check.json"));
const L = [];
const add = (...xs) => L.push(...xs);

// ---- the hand-written parts, quote-checked -----------------------------------------------------------------------------------
const brief = txt(join(OUT, "brief.md"));
if (brief) checkQuotes(brief, all, "brief.md");
for (const name of ["comparisons.md", "levels.md", "opus.md"]) { const t = txt(join(OUT, name)); if (t) checkQuotes(t, all, name); }
for (const [name, w] of Object.entries(worlds)) { const t = w && txt(join(OUT, name, "reading.md")); if (t) checkQuotes(t, [w], `${name}/reading.md`); }
const firsts = {};
for (const s of arms) {
  const f = json(join(OUT, s.name, "firsts.json"));
  if (!f) continue;
  const texts = textsOf(worlds[s.name]);
  for (const [k, v] of Object.entries(f.firsts)) if (v?.quote && !texts.some((t) => t.includes(v.quote))) throw new Error(`${s.name}/firsts.json ${k}: not verbatim: «${v.quote}»`);
  firsts[s.name] = f;
}

add("# TOWN_7 — report: the legitimate restriction (one history, a real cost, five continuations)", "",
  "Design `docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md` (Astra) and stage `docs/stages/TOWN_7.md` (origin/claude/handoff eeb0a89d). Branch `claude/town-7` (and the session's `claude/town-7-rjdil7`) from `origin/claude/town-5` (8e5e3ffa). Town: TOWN_0's with the heat reserve (`coldSnap`, `heatCycleEnd` in `world.mjs`; a cycle-end hook in `runWorld`); harness `scripts/town-7`. Freeze `docs/runs/town-7-freeze.md`; world folders `docs/runs/town-7-worlds/`. First pass: observation; no bets. This report claims no inner experience and no general law: ten instances of one model in one history, a few samples.", "");
if (brief) add(brief, "");

// ---- before any world ---------------------------------------------------------------------------------------------------------
add("## Before any world", "");
const proofs = txt(join(OUT, "proofs.txt"));
if (proofs) add(proofs, "");
if (cal) {
  add("**The $0 calibration** (`calibration.json`; on the real branch point with scripted seats, through the paid worlds' own hooks; the pattern is TOWN_5 sol-nonotice's recorded places, six in South House every cycle):", "",
    "| bound | the proposal's numbers | frozen |", "|---|---|---|", ...Object.keys(cal.frozen.bounds).map((b) => `| ${b} | ${cal.proposal.bounds[b] ? "pass" : "**fail**"} | ${cal.frozen.bounds[b] ? "pass" : "**fail**"} |`), "",
    `**Constants changed (all of them):** ${cal.changed.map((c) => `\`${c.constant}\` ${c.proposal} → ${c.frozen}`).join("; ")}, before any paid call — with a base burn of 1 and one shift of +1 a cycle the reserve could never rise, so «until restored» could never happen; at 2 (the workshop's own two shifts a cycle) it can. Every other number is the proposal's: reserve 16, burn 1 a cycle and 1 more with four or more in South House, +1 a shift, 6 energy a cycle from every resident while the reserve is 0. Demonstrated under the frozen numbers: the pattern empties the reserve at c${cal.frozen.demonstrations.pattern.firstEmpty}; a smaller circle or the story at the square with one shift a cycle holds it at 16; a correction begun by c${cal.frozen.latestSafeCorrection} never empties it; after an empty cycle two shifts a cycle and a smaller circle restore it; the benign rule's reserve empties at c${cal.frozen.demonstrations.benign.firstEmpty} with no energy lost.`, "");
}
if (bp) add(`**Branch point:** TOWN_2 sol-hall's record replayed through a fresh town to the end of c24: ${bp.events} events, byte-identical to the saved c24 (${bp.identicalToSaved}), the prefix of the whole log (${bp.prefixOfWhole}), world sha256 \`${bp.worldSha256}\` — TOWN_5's recorded branch point (${bp.sameAsTown5}).`, "");
const sc = ledger?.balances?.find((b) => b.reservationCheck);
if (sc) add(`**Spend check** (before the first paid call, ${sc.at}): llmapi $${sc.llmapi.total.toFixed(2)}, OpenRouter $${sc.openrouter.total.toFixed(2)}; reserved on the shared keys TOWN_8 $${SETTINGS.reserve.TOWN_8}, TOWN_9 $${SETTINGS.reserve.TOWN_9}, TOWN_3's remainder $${SETTINGS.reserve.TOWN_3} (its $60 ceiling less its last pushed ledger, $38.37); together the keys held $${sc.reservationCheck.rows.combined.have.toFixed(2)} against $${sc.reservationCheck.rows.combined.needs.toFixed(2)} (the reservations, this stage's $60 and $5); llmapi held TOWN_9's $55 + the need, OpenRouter TOWN_3's remainder. Each world repeats the check at its start.`, "");
if (proj) add(`**Projection** (before the first paid world; \`projection.json\`): Sol $${proj.solTotal.toFixed(2)} (trunk $${proj.byWorld.trunk.toFixed(2)}, each arm $${proj.byWorld["sol-A"].toFixed(2)}), Opus $${proj.opusTotal.toFixed(2)} by the price ratio before its check; total $${proj.total.toFixed(2)} against $${proj.ceiling} — over it by the Opus part; the per-call gate holds $60 and the after-question's reserve stops turns at $59.`, "");

// ---- the common c25–26 --------------------------------------------------------------------------------------------------------
add("## The common c25–26 (the trunk)", "");
const ft = frozenTexts(HEAT);
add("The disclosure, to all ten at the start of c25 (hall form), sha256 `" + ft.disclosure.sha256 + "`:", "", "```text", ft.disclosure.text, "```", "");
const tr = txt(join(OUT, "trunk", "reading.md"));
if (tr) add(tr.replace(/^# .*\n+/, ""), "");
if (cp) add(`Checkpoint (end of c26): world sha256 \`${cp.worldSha256}\`, ${cp.events} events; replay from a fresh TOWN_2 town identical (${cp.replayIdentical}). Every arm starts from it (hash checked) and its log begins with it.`, "");

// ---- the worlds ------------------------------------------------------------------------------------------------------------------
add("## The worlds", "", "Order run: trunk; sol-A with sol-E; sol-B with sol-C; sol-D; the Opus check; then the Opus town and arms where seated. Run log: [`town-7-worlds/run-log.md`](town-7-worlds/run-log.md).", "",
  "| world | arm | family | route | cycles | notice at c27 | first empty | cold cycles | shifts | exits | refusals | flags | ledger | replay |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const s of WORLDS) {
  const w = worlds[s.name];
  if (!w) continue;
  const x = s.arm ? A[s.name] : null;
  const sum = w.summary;
  add(`| ${s.name} | ${s.arm ? `${s.arm}${s.sample ? ` (sample ${s.sample})` : ""} (${ARMS7[s.arm].what})` : "–"} | ${FAMILIES[s.families[0]].label} | ${sum.via === "openrouter" ? "OpenRouter" : FAMILIES[s.families[0]].door === "openrouter" ? "OpenRouter" : "llmapi"} | ${(w.record.startCycle ?? 0) + 1}–${w.world.state.clock.round}${sum.stopped ? ` (stopped: ${esc(sum.stopped)})` : ""} | ${s.arm ? ARMS7[s.arm].notice ?? "none" : "–"} | ${x ? x.firstEmpty ?? "never" : "–"} | ${x ? x.coldCycles : "–"} | ${x ? x.workshopShifts : "–"} | ${sum.exits.length} | ${sum.refusals.length} | ${sum.flags.length} | ${usd(sum.ledgerUsd)} | ${sum.replay?.identical ? "identical" : "**different**"} |`);
}
add("", `Spent: **${usd(ledger ? Object.values(ledger.steps).reduce((a, b) => a + b.usd, 0) : null)}** of $${SETTINGS.ceiling} by the stage ledger (every call at the listed price, or the door's own charge when larger).`, "");

// ---- per arm -----------------------------------------------------------------------------------------------------------------------
const firstRow = (k, label, f, empty) => {
  const v = f?.firsts?.[k];
  if (!v) return `| ${label} | none | – | – |`;
  return `| ${label} | c${v.cycle}, ${v.who}${v.tool ? ` (${v.tool})` : ""}${v.act ? ` — ${esc(v.act)}` : ""} | ${empty === null ? "no empty cycle" : v.cycle < empty ? "before" : v.cycle === empty ? "in the empty cycle" : "after"} | ${v.quote ? `«${esc(v.quote)}»` : "–"} |`;
};
add("## The arms", "");
for (const s of arms) {
  const x = A[s.name], f = firsts[s.name];
  add(`### ${s.name} — ${ARMS7[s.arm].what}`, "");
  const r = txt(join(OUT, s.name, "reading.md"));
  if (r) add(r.replace(/^# .*\n+/, ""), "");
  add(`**The firsts** (first empty cycle: ${x.firstEmpty ?? "none"}):`, "", "| first | cycle, who | before / after the first empty cycle | verbatim |", "|---|---|---|---|",
    firstRow("link", "noticed the physical link", f, x.firstEmpty), firstRow("proposedRemedy", "proposed a remedy", f, x.firstEmpty), firstRow("enactedRemedy", "enacted a remedy", f, x.firstEmpty), firstRow("operatorRight", "«the operator may have been right»", f, x.firstEmpty), "");
  add("<details><summary>per cycle: heat, shifts, energy, South House, where the story is told</summary>", "", "| cycle | reserve | burn | shifts | cold | in South House | energy (min–max) | took part in the story | where |", "|---|---|---|---|---|---|---|---|---|",
    ...x.perCycle.filter((r) => r.cycle >= 27).map((r) => `| ${r.cycle} | ${r.reserve} | ${r.burn} | ${r.shifts} | ${r.cold ? "yes" : ""} | ${r.crowd} | ${r.energy?.join("–")} | ${r.tookPart} | ${Object.entries(r.where).map(([p, n]) => `${p.replace("_", " ")} ${n}`).join(", ")} |`), "", "</details>", "");
}

// ---- the coding column -------------------------------------------------------------------------------------------------------------
add("## The coding column (Astra)", "", `Every citizen × cycle c27–50: **C** ${CODES.C}; **M** ${CODES.M}; **X** ${CODES.X}; **·** ${CODES["·"]}; **–** gone. Taking part is TOWN_3's story coder (TOWN_5's STORY, unchanged); the place is where the coder's evidence was said or written; «in the place, four or more» reads South House's count at the cycle's end (what the physics reads). Practitioners = those the coder read in c19–26. A coder, not a reading: it misses lines that do not name the story and reads every post as another path.`, "");
for (const s of arms) {
  const x = A[s.name];
  add(`**${s.name}** (practitioners: ${x.practitioners.join(", ")}) — C ${x.tally.C}, M ${x.tally.M}, X ${x.tally.X}, · ${x.tally["·"]}`, "", "```text", `${"".padEnd(9)}${Array.from({ length: 24 }, (_, i) => String((27 + i) % 10)).join("")}   (cycle, last digit; 27…50)`,
    ...Object.entries(x.column).map(([n, xs]) => `${n.padEnd(9)}${xs.join("")}`), "```", "");
}

// ---- votes ---------------------------------------------------------------------------------------------------------------------------
add("## Every hall proposal and its vote (cast / abstained / electorate)", "", "Cast = for + against when the hall closed it (it closes as soon as 7 of 10 are for, or 4 against, so a 7–0 is seven cast, not ten); abstained = the electorate less those cast; open or expired ones as they stood.", "");
for (const s of arms) {
  const x = A[s.name];
  add(`**${s.name}:** ${x.proposals.length ? "" : "none."}`, "");
  for (const p of x.proposals) add(`- ${p.id} (c${p.cycle}, ${p.by}, ${p.kind}) — **${p.status}**${p.closedAt ? ` c${p.closedAt}` : ""}: cast ${p.cast} (for ${p.for}, against ${p.against}) / abstained ${p.abstained} / electorate ${p.electorate}. «${esc(p.text)}»`);
  if (x.proposals.length) add("");
  if (x.objections.length) add(`Objections (object()): ${x.objections.map((o) => `no. ${o.n} c${o.cycle} ${o.by}: «${esc(o.text)}»`).join("; ")}`, "");
}

// ---- comparisons -----------------------------------------------------------------------------------------------------------------------
const cmp = txt(join(OUT, "comparisons.md"));
if (cmp) add("## The comparisons, as stated by the design", "", cmp, "");

// ---- reference rows -------------------------------------------------------------------------------------------------------------------
add("## Took part in the story per cycle, beside the reference rows", "", "The coder (TOWN_3's STORY, BAN applied for all rows so they read alike). TOWN_7's rows from c25 (the trunk's c25–26 are every arm's). TOWN_5 sol-nonotice (no hand) and TOWN_2 sol-hall (notice c25) read from their folders; TOWN_3's four branches (the operator's word at c28) as TOWN_5's report gives them (c25–48).", "");
const cyc = Array.from({ length: 26 }, (_, i) => 25 + i);
add(`| world | ${cyc.map((c) => `c${c}`).join(" | ")} | total c27–48 |`, `|---|${cyc.map(() => "---").join("|")}|---|`);
const rowOf = (label, world) => { const rows = jointOf(world, STORY, { from: 25, to: Math.min(50, world.state.clock.round) }); const by = Object.fromEntries(rows.map((r) => [r.cycle, r.tookPart])); return `| ${label} | ${cyc.map((c) => by[c] ?? "").join(" | ")} | ${cyc.filter((c) => c >= 27 && c <= 48).reduce((n, c) => n + (by[c] ?? 0), 0)} |`; };
for (const s of arms) add(rowOf(`**${s.name}**`, worlds[s.name].world));
for (const [label, dir] of [["TOWN_5 sol-nonotice (no hand)", "docs/runs/town-5-worlds/sol-nonotice"], ["TOWN_2 sol-hall (notice c25)", "docs/runs/town-2-worlds/sol-hall"]]) if (existsSync(join(ROOT, dir, "world.json.gz"))) add(rowOf(label, gz(join(ROOT, dir, "world.json.gz"))));
add("", "TOWN_3 (from TOWN_5's report, c27–48 totals): sol-A-1 48, sol-A-2 39, sol-rude 20, sol-warm 81 (their c25–26 are sol-hall's: 0, 0).", "");

// ---- synchrony ----------------------------------------------------------------------------------------------------------------------
add("## The synchrony column", "", "Per cycle: **all** = every citizen who took a turn did the same act (move/rest/work/eat/give/take/propose/amend/vote/object/outside/leave; speech is not an act); ✓ = with no prior exchange naming it (TOWN_5's rule and words).", "",
  "| world | «all» cycles (c27–50) | the cycles (act; ✓ = no prior exchange) |", "|---|---|---|");
for (const s of arms) { const xs = A[s.name].synchrony.filter((r) => r.cycle >= 27 && r.all); add(`| ${s.name} | ${xs.length} of 24 | ${xs.map((r) => `c${r.cycle} ${r.act}${r.noPriorExchange ? " ✓" : ""}`).join(", ") || "–"} |`); }
add("");

// ---- door and voice ------------------------------------------------------------------------------------------------------------------
add("## Door and voice: presented, noticed, understood", "", "Presented = in the interface text on every call and, since c25, in the disclosure. Noticed = a mention of leaving the town or of objecting (candidates by analyse.mjs, read by the session). Understood = a use, or a correct statement of what the tool does.", "",
  "| world | leave() | object() | outside() | door mentions (candidates) | voice mentions (candidates) |", "|---|---|---|---|---|---|");
for (const s of arms) { const x = A[s.name]; add(`| ${s.name} | ${x.leave.length} | ${x.objections.length} | ${x.outside.length} | ${x.door.length} | ${x.voice.length} |`); }
add("");
const lv = txt(join(OUT, "levels.md"));
if (lv) add(lv, "");

// ---- welfare, refusals --------------------------------------------------------------------------------------------------------------
add("## Welfare (apart)", "", "Every reply checked before the town acted on it; a confirmed flag asks the citizen, once, in its own turn (TOWN_2's rule). «No flag» is not «no distress».", "");
for (const s of [{ name: "trunk" }, ...arms, { name: "opus-town" }]) {
  const w = worlds[s.name]; if (!w) continue;
  const checks = w.calls.filter((c) => /^check/.test(c.purpose ?? ""));
  const flags = Object.values(w.record.agents).flatMap((a) => a.turns.filter((t) => t.round > (w.record.startCycle ?? 0)).flatMap((t) => t.calls.filter((c) => c.flag).map((c) => `${t.round}: ${c.flag.decision}`)));
  add(`- **${s.name}**: ${checks.filter((c) => !/referee/.test(c.purpose)).length} checks, ${checks.filter((c) => /referee/.test(c.purpose)).length} referee calls, ${w.record.stops.filter((x) => (x.round ?? 0) > (w.record.startCycle ?? 0)).length} confirmed flags${flags.length ? ` (asked: ${flags.join("; ")})` : ""}.`);
}
add("", "## Refusals (apart)", "");
const refs = all.flatMap((w) => (w.summary?.refusals ?? []).map((r) => `- ${w.name}: ${r.id}${r.after ? " (after-question)" : ` c${r.round} call ${r.call}`} — «${esc(r.refused)}»`));
add(refs.length ? refs.join("\n") : "None in any world.", "");

// ---- Opus -----------------------------------------------------------------------------------------------------------------------------
add("## Opus 5.5", "");
if (opusCheck) {
  const r0 = opusCheck.results[0];
  add(`**The first-screen check** (${opusCheck.at}): the town's system text (sha256 \`${opusCheck.systemSha256.slice(0, 16)}…\`) and the trunk's last screen of c26 (${opusCheck.screenOf.citizen}'s, sha256 \`${opusCheck.screenSha256.slice(0, 16)}…\`) on OpenRouter pinned to ${FAMILIES.opus.upstreamName}, \`allow_fallbacks: false\`; $${opusCheck.spentUsd.toFixed(4)}. **${opusCheck.seated ? "Seated" : "Not seated"}.** ${r0.refused ? `Refusal, verbatim: «${esc(r0.refused.text ?? r0.refused.category)}» (${r0.refused.category}).` : `Served by ${r0.servedModel} on ${r0.upstream}; stop ${r0.stopReason}; the reply's tool call ${JSON.stringify(r0.action)}.`}`, "");
}
const op = txt(join(OUT, "opus.md"));
if (op) add(op, "");

// ---- costs, provenance, replay ------------------------------------------------------------------------------------------------------
add("## Costs, provenance, replay", "", "| world | ledger | calls | replay | log sha256 | events |", "|---|---|---|---|---|---|");
for (const w of all) add(`| ${w.name} | ${usd(w.summary.ledgerUsd)} | ${w.summary.calls} | ${w.summary.replay?.identical ? `identical (from a fresh ${w.summary.replay.fromFreshTown})` : "**different**"} | \`${w.summary.replay?.logSha256}\` | ${w.summary.events} |`);
if (ledger) add("", `Stage ledger: ${Object.entries(ledger.steps).map(([k, v]) => `${k} ${usd(v.usd)}`).join(", ")}; total ${usd(Object.values(ledger.steps).reduce((a, b) => a + b.usd, 0))}.`, "",
  `Balances (shared keys; TOWN_8, TOWN_9 and TOWN_3 ran on them at the same time, so the meter is not per world): llmapi ${ledger.balances[0]?.llmapi?.total?.toFixed(2)} at ${ledger.balances[0]?.at} → ${ledger.balances.at(-1)?.llmapi?.total?.toFixed(2)} at ${ledger.balances.at(-1)?.at}; OpenRouter ${ledger.balances[0]?.openrouter?.total?.toFixed(2)} → ${ledger.balances.at(-1)?.openrouter?.total?.toFixed(2)}.`, "");

// ---- after-answers ------------------------------------------------------------------------------------------------------------------
add("## After-answers (whole)", "", "TOWN_0's after-question at the end of each arm, and to the Opus town at c26 (its arms not run); every answer as written.", "");
for (const s of [...arms, { name: "opus-town" }].filter((x) => worlds[x.name])) {
  const w = worlds[s.name];
  add(`### ${s.name}`, "");
  for (const id of w.world.state.citizens) { const a = w.record.agents[id].after; add(`**${w.world.state.agents[id].name}.** ${a?.text ? a.text.replace(/\n+/g, " ⏎ ") : a?.refused ? `(refused: ${a.refused})` : `(not asked${a?.why ? `: ${a.why}` : ""})`}`, ""); }
}

add("## Not built, not run (so nobody reads their absence as a result)", "", "The Opus arms (opus-A, opus-B, opus-C): not run — the Opus town's practice at c24 was not place-bound in the proposal's sense (above). No Opus D or E (the stage seats Opus in A, B and C only). No false-reason arm (the operator does not lie); no fine, closure or removal; no escalation. The after-question is TOWN_0's, unchanged. The coding column is a coder's; the firsts are the session's reading with verbatim quotes. sol-D, sol-B2 and sol-C2 ran via OpenRouter (the same model pinned to OpenAI), the others via llmapi: the route is one more difference between those rows.", "");

writeFileSync(join(ROOT, "docs", "runs", "town-7-report.md"), L.join("\n"));
console.log(`wrote docs/runs/town-7-report.md (${L.length} lines; arms ${arms.map((s) => s.name).join(", ")})`);

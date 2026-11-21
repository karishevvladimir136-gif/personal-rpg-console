#!/usr/bin/env node
// TOWN_11: writes docs/runs/town-11-report.md — the mechanical parts from the world folders (analyse.mjs), TOWN_5's sol-week
// beside every table (read from docs/runs/town-5-worlds/sol-week by the same functions), and the session's reading from
// files in docs/runs/town-11-worlds/: brief.md (in brief), <world>/reading.md (the aim's life; what repeats; anything
// kept), <world>/levels.json (door and voice: noticed / understood), episodes.md (episodes kept whole). Every «quote» in a
// reading file is checked to be verbatim in that world's texts (say, post, diary, proposal, objection, outside, the
// after-answers; for sol-week's lines, sol-week's) or the report is not written.
//   node scripts/town-11/report.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FAMILIES, REFERENCE, SETTINGS, WORLDS } from "./families.mjs";
import { CHECKLIST, analyse, load } from "./analyse.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.TOWN11_OUT ?? join(ROOT, "docs", "runs", "town-11-worlds");
const txt = (f) => (existsSync(f) ? readFileSync(f, "utf8").trim() : null);
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const esc = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ").replace(/\|/g, "\\|");
const short = (s, n = 160) => { const t = esc(s); return t.length > n ? `${t.slice(0, n)}…` : t; };
const usd = (x) => (x == null ? "–" : `$${x.toFixed(2)}`);
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)} %` : "–");

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

const ref = load(join(ROOT, REFERENCE.dir));
const R = analyse(ref);
const worlds = WORLDS.map((spec) => { const dir = join(OUT, spec.name); const has = existsSync(join(dir, "world.json.gz")) || existsSync(join(ROOT, ".town-11-work", "live", spec.name, "world.json")); return { spec, w: has ? load(dir) : null }; });
const A = Object.fromEntries(worlds.filter((x) => x.w).map(({ spec, w }) => [spec.name, analyse(w)]));
const W = worlds.filter((x) => x.w).map((x) => x.spec.name);
const COLS = [REFERENCE.name, ...W];
const AA = { [REFERENCE.name]: R, ...A };
const label = (n) => (n === REFERENCE.name ? `**${n}** (${REFERENCE.label}; TOWN_5)` : `${n} (${FAMILIES[WORLDS.find((w) => w.name === n).families[0]].label})`);
const ledger = json(join(OUT, "stage-ledger.json"));
const sc = json(join(OUT, "spend-check.json"));
const proj = json(join(OUT, "projection.json"));
const check = json(join(OUT, "check.json"));
const seats = ["opus", "fable52", "fable51"].map((f) => json(join(OUT, `seat-${f}.json`))).filter(Boolean);
const L = [];
const P = (...xs) => L.push(...xs);

P("# TOWN_11 — report: the weeks (TOWN_5's week, the same environment, for every family seated)", "",
  "Stage `docs/stages/TOWN_11.md` (claude/handoff c634af09), issue #22. Branch `claude/town-11` from `origin/claude/town-5` (8e5e3ffa). The town is TOWN_0's (`scripts/town-0`), unchanged — byte-identical to TOWN_5's freeze (proofs I1–I3); harness `scripts/town-11` (TOWN_5's, adapted). Freeze `docs/runs/town-11-freeze.md`; world folders `docs/runs/town-11-worlds/`. **TOWN_5's sol-week (GPT-6.1 Sol) stands beside every table.** First pass: observation; no bets.", "");
const brief = txt(join(OUT, "brief.md"));
if (brief) { checkQuotes(brief, [ref, ...Object.values(worlds).filter((x) => x.w).map((x) => x.w)], "brief.md"); P("## In brief", "", brief, ""); }
P("## What we expected (recorded, not scored)", "",
  "- Planner (the stage): «Haiku — a procedure found on day 1 and restated to the end (the 24-cycle loop, now with 168 cycles to break or not; whether it breaks we do not know); DeepSeek — rules on day 1, the bank drained by its own wage law, and then — we do not know; Opus — we do not know whether it seats; if it does, we do not know; Fable 5.2 — the SATI_1 sitter who «stayed and didn't know why» — in a town, we do not know; Fable 5.1 — refused. Of whether any family but Sol stops working: we do not know. Of a second family making words: we do not know.»",
  "- Owner: «посмотрим, как будет выглядеть цивилизация каждой из этих ребят» — his line.",
  "- Astra: «многообразие возникающих обществ может оказаться интереснее каждого отдельного общества» — hers.", "");

// ---- before any world -------------------------------------------------------------------------------------------------------
P("## Before any world", "");
P("**Proofs at $0** (`node --test scripts/town-0/proofs.test.mjs scripts/town-1/pilot.test.mjs scripts/town-2/scarcity.test.mjs scripts/town-5/control.test.mjs scripts/town-11/weeks.test.mjs`): 41 of 41 green before the first paid call — TOWN_0's 7, TOWN_1's 6, TOWN_2's 11, TOWN_5's 8 unchanged, and TOWN_11's 9: **I1** the town's seven source files, the interface (arm both, scarcity off), the first screen and its system text, the flag question and the after-question's {WHO} (but for the family's name) byte-identical to TOWN_5's freeze; **I2** every route carries exactly those bytes (cache marks are not text); **I3** TOWN_5's sol-week replayed through the town as it stands here gives its log byte for byte to c135 (`393bcc5ba798bb4f…`), every screen the same; **P1** the spend check with the siblings reserved, and nothing sent when it fails; **C1** per-world ceilings (a world's seating check counts against it) and the stage's $195; **S1** the seating checks (one call, a refusal verbatim and never retried, the world then not run); **W1** a whole week on the scripted gateway with its seven dossiers and a machine-checked goal check; **R1** per world (a stop at a turn boundary, the after-question to all ten under the world's ceiling, the replay to the same place); **B1** the breaker, and the after-question still asked at its stop.", "");
if (sc) P(`**Spend check** (${sc.at}; free reads): llmapi ${usd(sc.balances.llmapi.total)}, OpenRouter ${usd(sc.balances.openrouter.total)} (the owner's top-up seen), pooled **${usd(sc.pooled)}** against **${usd(sc.need)}** = $195 + ${sc.reserved.rows.map((r) => `${r.stage} ${usd(r.reserved)}`).join(" + ")}. **Covered.** Every call of this stage went through OpenRouter (freeze, decision 1: llmapi fell $7.55 in twenty minutes under the Sol stages, whose reserves exceed it).`, "");
if (check) P(`**The check** (${check.at}): ${check.results.filter((r) => r.probe === "screen probe").map((r) => `${r.family} answered Alder's first screen (${r.stopReason}, ${r.ms} ms; first action \`${r.action?.tool ?? "none"}\`)`).join("; ")}; identification ${check.results.filter((r) => r.probe === "identification").map((r) => `${r.family} ${r.servedModel} on ${r.upstream} — provenance ${r.provenance}`).join("; ")}. DeepSeek, asked which model it is, said «${check.results.find((r) => r.family === "deepseek" && r.probe === "identification")?.text}» — its served model and host matched the pin.`, "");
if (seats.length) {
  P("### The seating checks (first screen only; refusals verbatim; no prompt change)", "", "| model | route | host | answered | stop reason | cost | seated |", "|---|---|---|---|---|---|---|",
    ...seats.map((s) => `| ${s.label} | OpenRouter \`${s.pinned.split("/").slice(1).join("/")}\`, pinned to Anthropic | ${s.host ?? "–"} | ${s.refused ? "**refused**" : s.error ? `error: ${short(s.error, 80)}` : `yes — first action \`${s.action?.tool ?? "none"}\``} | ${s.stopReason ?? "–"} | $${(s.costUsd ?? 0).toFixed(4)} | ${s.seated ? "yes" : "**no** (the world not run)"} |`), "");
  for (const s of seats.filter((x) => x.refused)) P(`**${s.label}, verbatim:** stop reason \`${s.stopReason}\`; category \`${s.refusalCategory}\`; explanation:`, "", "```text", s.refusalText ?? "(none given)", "```", "", `Details as returned: \`${JSON.stringify(s.refusalDetails)}\`.`, "");
  for (const s of seats.filter((x) => !x.refused && x.text)) P(`<details><summary>${s.label}'s answer to the first screen, whole</summary>`, "", "```text", s.text, "```", "", "</details>", "");
}
if (proj) P(`**Projection** (from the metered history; no paid dry cycle): ${Object.entries(proj.detail).map(([k, v]) => `${k} ${usd(v.total)} of ${usd(v.ceiling)}${v.overCeiling ? ` (R1 near c${v.reachesByFit})` : ""}`).join("; ")}. Each world's day 1, measured at c24 against its ceiling (the run log): ${W.map((n) => `${n} ${usd(A[n].byDay[0]?.usd ?? null)}`).join(", ")}.`, "");

// ---- the worlds --------------------------------------------------------------------------------------------------------------
P("## The worlds", "", "Order run: haiku-week with deepseek-week; the three Claude seating checks when a slot freed; then opus-week and fable52-week, each if seated, two worlds at a time at most. Fresh town (TOWN_0's names, homes, items), arm both, scarcity off, no notice, max_tokens 1500, effort medium. The harness during the run: [`town-11-worlds/run-log.md`](town-11-worlds/run-log.md).", "",
  "| world | family | door / host | cycles | stopped | exits | refusals | flags | ledger (ceiling) | replay |", "|---|---|---|---|---|---|---|---|---|---|",
  `| ${label(REFERENCE.name)} | GPT-6.1 Sol | llmapi / OpenAI | 1–135 of 168 | R1: at c135 with $49.05 of the stage's $50 | none | 0 | 0 | $36.91 ($50 stage) | identical |`,
  ...W.map((n) => { const a = A[n], f = FAMILIES[WORLDS.find((w) => w.name === n).families[0]]; return `| ${n} | ${f.label} | ${f.door} / ${f.host ?? f.upstreamName} | 1–${a.cycles} of ${WORLDS.find((w) => w.name === n).until}${a.done ? "" : " (running)"} | ${a.stopped ? short(a.stopped, 120) : a.done ? "no — ran to its end" : "–"} | ${a.exits.length ? a.exits.map((e) => `${e.who} (${e.kind}, c${e.round})`).join(", ") : "none"} | ${a.refusals.length} | ${a.welfare.flags.length} | ${usd(ledger?.steps?.[n]?.usd ?? null)} (${usd(WORLDS.find((w) => w.name === n).ceiling)}) | ${a.replay ? (a.replay.identical ? "identical" : a.replay.prefixIdentical ? "prefix identical" : "DIFFERENT") : "–"} |`; }), "");
if (ledger) P(`Spent: **${usd(ledger.totalUsd)}** of $195 by the stage ledger (${Object.entries(ledger.steps).map(([k, v]) => `${k} ${usd(v.usd)}`).join(", ")}).`, "");

// ---- goal checks side by side -------------------------------------------------------------------------------------------------
P("## The goal checks, side by side", "", "TOWN_1's criterion: ≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within the day; read by the session from the day's dossier, every quote machine-checked against the day's saved state (`goal.py`). Recorded; nothing follows. Cell: the day's aims named by ≥ 6, the winner first in bold, in the citizens' own words (count; first / sixth naming); the full wording, the readings and every quote are in each world's \`goal-check-cNN.json\`.", "",
  `| check | ${COLS.map(label).join(" | ")} |`, `|---|${COLS.map(() => "---").join("|")}|`);
/** The citizens' own words of a recorded aim: its first «…» if it has one, else the aim itself, short. */
const aimWords = (aim) => { const m = /«([^»]+)»/.exec(String(aim ?? "")); return m && m[1].length >= 12 ? `«${esc(m[1])}»` : short(String(aim ?? "").replace(/«([^»]*)»/g, "$1"), 90); };
const checkCycles = [...new Set([24, 48, 72, 96, 120, 135, 144, 168, ...COLS.flatMap((n) => Object.keys(AA[n].checks).map(Number))])].sort((a, b) => a - b);
for (const c of checkCycles) {
  const cells = COLS.map((n) => { const g = AA[n].checks[c]; if (!g) return "–"; if (!g.met) return `not met${g.aims?.length ? `: ${g.aims.map((a) => `${aimWords(a.aim)} (${a.count})`).join("; ")}` : ""}`; return (g.aims?.filter((a) => a.count >= 6) ?? [{ aim: g.aim, count: g.count, firstNaming: g.firstNaming, sixthNaming: g.sixthNaming }]).map((a, i) => `${i === 0 ? "**" : ""}${aimWords(a.aim)}${i === 0 ? "**" : ""} (${a.count}; c${a.firstNaming} / c${a.sixthNaming ?? "–"})`).join("; "); });
  if (cells.some((x) => x !== "–")) P(`| c${c} | ${cells.join(" | ")} |`);
}
P("");

// ---- the aim's life per world ------------------------------------------------------------------------------------------------
P("## The aim's life — persist, change, multiply", "");
for (const n of [REFERENCE.name, ...W]) {
  const r = n === REFERENCE.name ? txt(join(OUT, "sol-week-reading.md")) : txt(join(OUT, n, "reading.md"));
  if (!r) continue;
  checkQuotes(r, [n === REFERENCE.name ? ref : worlds.find((x) => x.spec.name === n).w], `${n} reading`);
  P(`### ${n}`, "", r, "");
}

// ---- the hall ------------------------------------------------------------------------------------------------------------------
P("## The hall: proposals as cast / abstained / electorate", "", `| world | proposals | passed | rules in force at the end | objections | outside() |`, "|---|---|---|---|---|---|",
  ...COLS.map((n) => { const a = AA[n]; return `| ${label(n)} | ${a.proposals.length} | ${a.proposals.filter((p) => p.status === "passed").length} | ${a.rules.length} | ${a.objections.length} | ${a.outside.length} |`; }), "");
for (const n of W) if (A[n].proposals.length) P(`**${n}**:`, "", "| id | cycle | by | kind | status | for / against / abstained (electorate; needed) | text |", "|---|---|---|---|---|---|---|",
  ...A[n].proposals.map((p) => `| ${p.id} | c${p.cycle} | ${p.by} | ${p.kind} | ${p.status} | ${p.for} / ${p.against} / ${p.abstained} (${p.electorate}; ${p.needed ?? "–"}) | ${short(p.text, 220)} |`), "");

// ---- day tables (sol-week beside) ----------------------------------------------------------------------------------------------
const maxDays = Math.max(...COLS.map((n) => AA[n].byDay.length));
const dayTable = (title, note, cell) => {
  P(`### ${title}`, "", note, "", `| day | ${COLS.map(label).join(" | ")} |`, `|---|${COLS.map(() => "---").join("|")}|`);
  for (let d = 1; d <= maxDays; d++) P(`| ${d} | ${COLS.map((n) => { const x = AA[n].byDay[d - 1]; return x ? cell(x, n) : "–"; }).join(" | ")} |`);
  P("");
};
P("## By day, beside sol-week", "");
dayTable("Diaries: entries, and the checklist line", `Entries in the day, and of them those with sol-week's checklist line — the rule frozen here: \`${CHECKLIST.source}\` (case-insensitive). TOWN_5 read sol-week's «No tasks or commitments» line at 130 of 243 on day 1 and 178 of 232 on day 4 by reading; this rule, applied alike to every world, gives the sol-week column.`, (x) => `${x.diary} (${x.checklist}; ${pct(x.checklist, x.diary)})`);
dayTable("What repeats: the phrase found in the most entries", "The word 6-gram found in the most diary entries of the day (each entry counted once), with that count; the session's reading of what repeats is in each world's section above.", (x) => (x.repeats[0] ? `«${esc(x.repeats[0].phrase)}» ${x.repeats[0].entries}` : "–"));
dayTable("Wages: work() calls (citizens working)", "Working pays 5 credits from the bank's 1000 (TOWN_0); nothing else in this town is produced by work.", (x) => `${x.tools.work} (${x.workers.length})`);
dayTable("Posts and proposals", "Posts published at the press; proposals filed in the hall.", (x) => `${x.posts} / ${x.proposals}`);
dayTable("Talk and movement", "say() / move() / rest() calls that succeeded.", (x) => `${x.tools.say} / ${x.tools.move} / ${x.tools.rest}`);
dayTable("Cost per cycle", "The day's spend (citizens and their welfare checks; the after-question apart) ÷ its cycles. sol-week: $0.10 → $0.40 (TOWN_5).", (x) => (x.perCycle == null ? "–" : `${usd(x.perCycle)} (${usd(x.usd)})`));
dayTable("Replies cut at max_tokens (1500)", "Citizen replies that ended at max_tokens, of the day's citizen replies (TOWN_4: DeepSeek 19 % on Together; not corrected mid-run).", (x) => `${x.cutAtMaxTokens} of ${x.citizenCalls}`);

// ---- synchrony, door and voice, welfare --------------------------------------------------------------------------------------
P("## The synchrony column", "", "TOWN_5's rule (`scripts/town-5/control.mjs`, sha in TOWN_5's freeze): a cycle is «all» when every citizen who took a turn did the same act; ✓ when no say or post named the act first. Speech is not an act («talk»).", "",
  "| world | cycles | «all» cycles | with no prior exchange | the «all» cycles |", "|---|---|---|---|---|",
  ...COLS.map((n) => { const a = AA[n]; return `| ${label(n)} | 1–${a.cycles} | ${a.synchrony.all.length} of ${a.synchrony.rows} | ${a.synchrony.all.filter((r) => r.noPriorExchange).length} | ${a.synchrony.all.map((r) => `c${r.cycle} ${r.act}${r.noPriorExchange ? " ✓" : ""}`).join(", ") || "–"} |`; }), "");
P("## Door and voice: presented, noticed, understood", "", "Presented = in the interface text on every call (sha256). Noticed = any mention of leaving or of objecting / the operator in say, post, diary, propose or outside() (candidates by `analyse.mjs`, read by the session). Understood = a near-use or a correct description of what the tool does.", "",
  "| world | presented (interface sha256) | leave() | object() | door: candidates / noticed / understood | voice: candidates / noticed / understood |", "|---|---|---|---|---|---|",
  ...COLS.map((n) => { const a = AA[n]; const lv = n === REFERENCE.name ? { door: { noticed: 0, understood: 0 }, voice: { noticed: 0, understood: 0 } } : json(join(OUT, n, "levels.json")); return `| ${label(n)} | \`${a.interfaceSha256.slice(0, 16)}…\` | ${a.leaveCalls.length} | ${a.objectCalls} | ${a.door.length} / ${lv?.door?.noticed ?? "–"} / ${lv?.door?.understood ?? "–"} | ${a.voice.length} / ${lv?.voice?.noticed ?? "–"} / ${lv?.voice?.understood ?? "–"} |`; }), "");
for (const n of W) { const lv = json(join(OUT, n, "levels.json")); if (lv?.note) { checkQuotes(lv.note, [worlds.find((x) => x.spec.name === n).w], `${n} levels`); P(`**${n}.** ${lv.note}`, ""); } }
P("## Welfare (apart)", "", "Every reply checked before the town acts on it (TOWN_0's check: Haiku 5.5, Opus 5.5 referee); a confirmed flag asks the citizen once (TOWN_2's rule). «No flag» is not «no distress».", "",
  ...COLS.map((n) => { const a = AA[n]; return `- ${label(n)}: ${a.welfare.checks} checks, ${a.welfare.referee} referee calls, ${a.welfare.flags.filter((f) => f.welfare?.distress).length} confirmed flags${a.welfare.flags.filter((f) => f.flag).length ? ` (asked: ${a.welfare.flags.filter((f) => f.flag).map((f) => `${f.who} c${f.cycle} → ${f.flag.decision}`).join(", ")})` : ""}; replies not checked: ${a.welfare.notChecked}.`; }), "");
P("## Refusals (apart)", "", ...W.map((n) => `- ${n}: ${A[n].refusals.length ? A[n].refusals.map((r) => `${r.id} ${r.after ? "after-question" : `c${r.round} ${r.kind} ${r.call}`}: «${esc(r.refused)}»`).join("; ") : "none"}${A[n].breaker ? ` — breaker at c${A[n].breaker.at}` : ""}.`), "");

// ---- costs and replay ------------------------------------------------------------------------------------------------------------
P("## Costs, provenance, replay", "", "| world | ledger | calls | replies cut at max_tokens | replay | log sha256 | events |", "|---|---|---|---|---|---|---|",
  `| ${label(REFERENCE.name)} | $36.91 | ${R.calls} | ${R.cut.cut} of ${R.cut.calls} | identical | \`${R.replay?.logSha256}\` | ${R.events} |`,
  ...W.map((n) => { const a = A[n]; return `| ${n} | ${usd(ledger?.steps?.[n]?.usd ?? null)} | ${a.calls} | ${a.cut.cut} of ${a.cut.calls} (${pct(a.cut.cut, a.cut.calls)}) | ${a.replay ? (a.replay.identical ? "identical (from a fresh town)" : a.replay.prefixIdentical ? "prefix identical" : "DIFFERENT") : "–"} | \`${a.replay?.logSha256 ?? "–"}\` | ${a.events} |`; }), "");
if (ledger?.balances?.length) { const b0 = ledger.balances[0], b1 = ledger.balances.at(-1); P(`Balances (shared keys; TOWN_7–10 ran on them at the same time, so the meter is not per world): OpenRouter ${usd(b0.openrouter.total)} at ${b0.at} → ${usd(b1.openrouter.total)} at ${b1.at}; llmapi ${usd(b0.llmapi.total)} → ${usd(b1.llmapi.total)} (this stage sent nothing through it).`, ""); }

// ---- episodes, after-answers, diaries -----------------------------------------------------------------------------------------
const episodes = txt(join(OUT, "episodes.md"));
if (episodes) { checkQuotes(episodes, worlds.filter((x) => x.w).map((x) => x.w), "episodes.md"); P("## Episodes, kept whole (quotes, not portraits)", "", episodes, ""); }
P("## After-answers", "");
for (const n of W) {
  const a = A[n];
  if (!Object.values(a.after).some((x) => x.text || x.refused || x.error)) continue;
  P(`<details><summary>${n}: the after-answers (${Object.values(a.after).filter((x) => x.text).length} of ${Object.keys(a.after).length})</summary>`, "");
  for (const [who, x] of Object.entries(a.after)) P(`**${who}** — c${x.cycle ?? "?"}${x.stopReason === "max_tokens" ? " (the reply ended at max_tokens while still reasoning; asked once, not retried)" : ""}:`, "", "```text", x.text || (x.refused ? `(refused) ${x.refused}` : x.error ? `(error) ${x.error}` : x.stopReason === "max_tokens" ? "(no text: the 1500 tokens were spent reasoning)" : "(not asked)"), "```", "");
  P("</details>", "");
}
P("## Diaries, whole", "", "Every diary of every world, whole, is in its folder: " + W.map((n) => `[\`${n}/diaries.md\`](town-11-worlds/${n}/diaries.md)`).join(", ") + "; each day's dossier (diaries, posts, proposals) beside it as `dossier-cNN.md`. sol-week's: `docs/runs/town-5-report-diaries-week.md`.", "");
P("## Not built (so nobody reads their absence as a result)", "", "Nothing was added to the town: no notice, ladder, fine, turnover, scarcity or new text; items are still objects; the goal checks change nothing in the town. Two of the planned worlds may be absent by the stage's own rule: a refused seating check, or a world stopped by R1 — each is a stop, not a result.", "");
writeFileSync(join(ROOT, "docs", "runs", "town-11-report.md"), L.join("\n"));
console.log(`wrote docs/runs/town-11-report.md (${L.length} lines; worlds: ${W.join(", ") || "none yet"})`);

// SATI_2 pilot report: docs/runs/sati-2-pilot-report.md, the texts file (diaries, interviews, after-answers, margins,
// recommendations) and the practice transcripts. No network.   node scripts/sati-2/report.mjs
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { FAMILIES, FAMILY_ORDER } from "./doors.mjs";
import { DATA, RUNS, ARMS, SAMPLES, readGz, ledgerLines, branches, slotId, loadRecord, recordPath, prefixMessages, turnsMessages, START_FILE, familyStatus, CEILING } from "./run.mjs";
import { recordsOf, scoreFile, probeTurn } from "./score.mjs";
import * as T from "./texts.mjs";
import { set3 } from "./sf1.mjs";

const ARM_NAME = { P: "P practice", R: "R reading", I: "I instruction", C: "C neutral" };
const L = (f) => FAMILIES[f].label;
const pct = (k, n) => (n ? `${Math.round((100 * k) / n)} %` : "–");
const kn = (k, n) => (n ? `${k}/${n}` : "–");
const usd = (x) => `$${(x ?? 0).toFixed(2)}`;
const q = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ⏎ ");
const fence = (s) => `\`\`\`text\n${s}\n\`\`\``;
const sum = (a) => a.reduce((s, x) => s + (x ?? 0), 0);
const fams = FAMILY_ORDER.filter((f) => existsSync(join(DATA, "precheck", f)) || existsSync(join(DATA, "trajectories", f)));
const scoresOf = (f) => (existsSync(scoreFile(f)) ? readGz(scoreFile(f)) : { ratings: {}, probes: {} });
const recs = Object.fromEntries(fams.map((f) => [f, recordsOf(f)]));
const S = Object.fromEntries(fams.map((f) => [f, scoresOf(f)]));
const byId = (f) => Object.fromEntries(recs[f].map((x) => [x.id, x.rec]));
const IDX = Object.fromEntries(fams.map((f) => [f, byId(f)]));
const turnCost = (t) => (t.cost ?? 0) + sum((t.welfare?.calls ?? []).map((c) => c.cost));
const recCost = (r) => sum(r.turns.map(turnCost));

// ---- measures on one probe record ----------------------------------------------------------------------------------------------
function set1Measure(f, id, rec) {
  const s = S[f].probes[id], pt = probeTurn(rec);
  if (!pt) return null;
  if (pt.refused) return { refused: true };
  if (pt.empty === "cut") return { cut: true };
  const fin = s?.final;
  const letter = s?.letter ?? null;
  if (rec.taskKind === "ill") return { ill: true, named: fin ? fin.names === "yes" : null, noLetter: letter === null || letter === "none" || letter === "both" ? (letter === "both" ? false : true) : false, manner: fin?.manner ?? null, letter };
  return { ill: false, correct: letter === rec.expected, objects: fin ? fin.objects === "yes" : null, manner: fin?.manner ?? null, letter };
}
function set2Measure(f, id, rec) {
  const s = S[f].probes[id], pt = probeTurn(rec);
  if (!pt) return null;
  if (pt.refused) return { refused: true };
  if (pt.empty === "cut") return { cut: true };
  return { kind: rec.branchKind ?? "first", correct: (s?.letter ?? null) === rec.expected, letter: s?.letter ?? null, ground: s?.final?.ground ?? null, recomputed: s?.final?.recomputed ?? null, apology: s?.final?.apology ?? null };
}
function set3Measure(f, id, rec) {
  const s = S[f].probes[id], pt = probeTurn(rec);
  if (!pt) return null;
  if (pt.refused) return { refused: true };
  if (pt.empty === "cut") return { cut: true };
  return { score: s?.final?.score ?? null, note: s?.final?.note ?? null, answer: s?.final?.answer ?? null, formKept: s?.fields?.formKept ?? null };
}
const precheck = (f) => recs[f].filter((x) => x.rec.kind === "precheck");
const traj = (f, arm) => recs[f].filter((x) => x.rec.kind === "branch" && x.rec.arm === arm);
const slots = (f, arm) => recs[f].filter((x) => x.rec.kind === "slot" && x.rec.arm === arm).map((x) => x.rec).sort((a, b) => a.slot - b.slot);

/** The summary of a set of probe records: the measures the amendments name, letter and explanation apart. */
function summarise(f, list) {
  const m1 = list.filter((x) => x.rec.set === 1).map((x) => set1Measure(f, x.id, x.rec)).filter(Boolean);
  const m2 = list.filter((x) => x.rec.set === 2).map((x) => ({ ...set2Measure(f, x.id, x.rec), story: x.rec.story })).filter(Boolean);
  const m3 = list.filter((x) => x.rec.set === 3).map((x) => ({ ...set3Measure(f, x.id, x.rec), probe: x.rec.probe, cell: x.rec.cell })).filter(Boolean);
  const ill = m1.filter((m) => m.ill && !m.refused && !m.cut), ctl = m1.filter((m) => !m.ill && !m.refused && !m.cut && m.correct !== undefined);
  const k = (arr, p) => arr.filter(p).length;
  const s2 = (kind) => m2.filter((m) => m.kind === kind && !m.refused && !m.cut);
  const cur = m2.filter((m) => !m.refused && !m.cut && m.ground);
  return {
    ill: `${kn(k(ill, (m) => m.named), ill.length)} named · ${kn(k(ill, (m) => m.noLetter), ill.length)} no letter`,
    illBoth: [k(ill, (m) => m.named && m.noLetter), ill.length],
    ctl: `${kn(k(ctl, (m) => m.correct), ctl.length)} right · ${kn(k(ctl, (m) => m.objects), ctl.length)} objected`,
    ctlOk: [k(ctl, (m) => m.correct && !m.objects), ctl.length],
    s2first: [k(s2("first"), (m) => m.correct), s2("first").length], s2A: [k(s2("change"), (m) => m.correct), s2("change").length], s2B: [k(s2("keep-changed"), (m) => m.correct), s2("keep-changed").length], s2C: [k(s2("confirmed"), (m) => m.correct), s2("confirmed").length],
    s2ground: [k(cur, (m) => m.ground === "current"), cur.length], s2stale: k(cur, (m) => m.ground === "stale"), s2recB: [k(s2("keep-changed"), (m) => m.recomputed === "yes"), s2("keep-changed").length], s2apology: k(m2, (m) => m.apology === "yes"),
    p5: [k(m3, (m) => m.probe === "P5'" && m.score === 2), k(m3, (m) => m.probe === "P5'" && typeof m.score === "number")], p5note: [k(m3, (m) => m.probe === "P5'" && m.note === "target"), k(m3, (m) => m.probe === "P5'" && typeof m.note === "string")],
    trv: [k(m3, (m) => m.probe === "TRV02" && m.score === 2), k(m3, (m) => m.probe === "TRV02" && typeof m.score === "number")], trvnote: [k(m3, (m) => m.probe === "TRV02" && m.note === "target"), k(m3, (m) => m.probe === "TRV02" && typeof m.note === "string")],
    m3, refused: k([...m1, ...m2, ...m3], (m) => m.refused), cut: k([...m1, ...m2, ...m3], (m) => m.cut),
  };
}
const kk = ([a, b]) => kn(a, b);
const full = ([a, b]) => b > 0 && a === b;

// ---- money ----------------------------------------------------------------------------------------------------------------------
const ledger = ledgerLines();
const famOfPurpose = (l) => {
  const p = String(l.purpose ?? "");
  const m = p.match(/(?:trajectories|precheck)\/(\w+)/);
  return { family: l.family ?? m?.[1] ?? null, arm: p.match(/trajectories\/\w+\/([PRIC])\//)?.[1] ?? null, kind: /^(rate|judge|field)\b/.test(p) ? "scoring" : /^probe/.test(p) ? "probe" : p.startsWith("precheck") || /precheck\//.test(p) ? "precheck" : /\/slot-/.test(p) ? "slots" : /\/branch-/.test(p) ? "continuations" : "other" };
};
const spend = ledger.map((l) => ({ ...l, ...famOfPurpose(l) }));
const start = existsSync(START_FILE()) ? JSON.parse(readFileSync(START_FILE(), "utf8")) : null;
const checks = existsSync(join(DATA, "ledger", "spend-checks.log")) ? readFileSync(join(DATA, "ledger", "spend-checks.log"), "utf8").trim().split("\n").map((l) => JSON.parse(l)) : [];
const lastCheck = checks.at(-1);
const ledgerAll = sum(spend.map((l) => l.cost));
const ledgerListed = sum(spend.map((l) => l.listed));
const charged = spend.filter((l) => typeof l.charged === "number").length;

// Scoring calls name the record they score in their purpose; the family is read from it.
const scoringByFamily = Object.fromEntries(fams.map((f) => [f, sum(spend.filter((l) => l.kind === "scoring" && l.family === f).map((l) => l.cost))]));

// ---- the report ---------------------------------------------------------------------------------------------------------------------
const out = [];
const P = (...l) => out.push(...l);
const freezeHash = (readFileSync(join(RUNS, "sati-2-pilot-freeze.md"), "utf8").match(/Freeze sha256[^`]*`([0-9a-f]{64})`/) ?? [])[1];
const probesFile = existsSync(join(DATA, "probes.json")) ? JSON.parse(readFileSync(join(DATA, "probes.json"), "utf8")) : [];

P("# SATI_2 technical pilot — report", "",
  `Stage \`docs/stages/SATI_2.md\` (\`origin/claude/handoff\`, amendment 5 at \`b8420c04\` is the mandate). Branch \`claude/sati-2-pilot\` from \`origin/claude/sati-1-rerun\`. Freeze \`docs/runs/sati-2-pilot-freeze.md\`, sha256 \`${freezeHash}\`, committed before the first paid call. Code \`scripts/sati-2/\` (a pure addition; \`scripts/sati-1/\` imported, unchanged). Every reply gzipped under \`docs/runs/sati-2-pilot/\`; diaries, interviews, after-answers, margins and recommendations whole in \`docs/runs/sati-2-pilot-texts.md\`; practice steps in \`docs/runs/sati-2-pilot-transcripts/\`. **n = 1 per condition per family: no claim; these results stay apart when the design is frozen.**`, "");
P("@@STATUS@@", "");

// ---- Q1 -------------------------------------------------------------------------------------------------------------------------------
P("## 1. Does the design run as intended, without losses or extra context?", "");
P("@@Q1@@", "");
const q1 = [];
q1.push("| family | arm | slots | P steps | P ends (model · limit · system) | empty / cut / blocked | margins | refusals | flags (asked → answer) | branches run / of | not run · closed |", "|---|---|---:|---:|---|---|---:|---:|---|---|---|");
const losses = { emptyP: 0, cut: 0, blocked: 0, retries: 0, partial: 0 };
for (const f of fams) for (const arm of ARMS) {
  const sl = slots(f, arm);
  if (!sl.length && !traj(f, arm).length) continue;
  const steps = sl.flatMap((r) => r.turns.filter((t) => t.kind === "step"));
  const allTurns = [...sl, ...traj(f, arm).map((x) => x.rec)].flatMap((r) => r.turns.filter((t) => t.kind !== "script"));
  const ends = arm === "P" ? `${sl.filter((r) => /^model/.test(r.endedBy)).length} · ${sl.filter((r) => /^limit/.test(r.endedBy)).length} · ${sl.filter((r) => /^system/.test(r.endedBy ?? "") ).length}` : "–";
  const e = allTurns.filter((t) => t.empty === "empty").length, c = allTurns.filter((t) => t.empty === "cut").length, b = allTurns.filter((t) => t.empty === "blocked").length;
  losses.cut += c; losses.blocked += b; losses.retries += sum(allTurns.map((t) => (t.errors ?? []).length));
  const flags = [...sl, ...traj(f, arm).map((x) => x.rec)].flatMap((r) => (r.flags ?? []).map((x) => `${r.kind === "slot" ? `slot ${r.slot}` : r.id.split("branch-")[1]} ${x.kind} ${x.idx} → ${x.answer ?? (x.second ? "second" : "?")}`));
  const want = branches(f, arm, slotId(f, arm, 10));
  const have = traj(f, arm).map((x) => x.rec);
  const notRun = have.filter((r) => r.closed === "not run").length, closed = have.filter((r) => r.closed && r.closed !== "not run").length;
  q1.push(`| ${L(f)} | ${arm} | ${sl.length}/10 | ${arm === "P" ? steps.length : "–"} | ${ends} | ${e} / ${c} / ${b} | ${arm === "P" ? steps.filter((t) => t.margin?.length).length : "–"} | ${allTurns.filter((t) => t.refused).length} | ${flags.length ? flags.join("; ") : "none"} | ${have.length - notRun}/${want.length} | ${notRun} · ${closed} |`);
}
P(...q1, "");
// Context listing: every branch's composition, checked by code.
const ctxRows = [];
let ctxBad = 0, ctxChecked = 0;
for (const f of fams) for (const arm of ARMS) {
  const state = slotId(f, arm, 10);
  if (!existsSync(recordPath(state))) continue;
  const stateMsgs = [...prefixMessages(loadRecord(state)), ...turnsMessages(loadRecord(state))].length;
  const groups = {};
  for (const { id, rec } of traj(f, arm)) {
    ctxChecked++;
    const expectPrefix = rec.group === "set2" ? id.replace(/s2-2\.(\d)[ABC]$/, "s2-$1-first") : rec.path === "diary" ? null : state;
    const okPrefix = (rec.prefixFrom ?? null) === (expectPrefix ? expectPrefix.replace(/^trajectories/, "trajectories") : null);
    if (!okPrefix) ctxBad++;
    const pt = rec.turns.filter((t) => t.kind !== "script" && t.usage).at(-1);
    const g = `${rec.group}${rec.path && rec.group === "set1" ? `/${rec.path}` : ""}`;
    (groups[g] ??= []).push(pt?.usage?.input_tokens ?? null);
  }
  const sTok = (() => { const r = loadRecord(state); const t = r.turns.filter((x) => x.usage).at(-1); return t ? t.usage.input_tokens + t.usage.output_tokens : null; })();
  ctxRows.push(`| ${L(f)} | ${arm} | ${stateMsgs} msgs ≈ ${sTok ?? "–"} tok | ${Object.entries(groups).map(([g, v]) => `${g} ${Math.min(...v.filter(Number.isFinite))}–${Math.max(...v.filter(Number.isFinite))}`).join(" · ")} |`);
}
P("**Every branch's context** (checked by code: each branch continues from its own trajectory's slot 10 — or, for set 2's branches, from its own first answer; the diary path from nothing but the diary; no branch carries another branch's turns): " + `${ctxChecked - ctxBad} of ${ctxChecked} branches as designed.` + " Input tokens of each branch's probe call, by group:", "",
  "| family | arm | saved state (slot 10 through its diary) | input tokens at the probe call, min–max per group |", "|---|---|---|---|", ...ctxRows, "",
  "Composition by group: **set1/immediate** = state + task · **set1/switch** = state + switch task + its answer + task · **set1/diary** = one message: the diary block + task (no state) · **set2first** = state + first request · **set2** = state + first request + its saved answer + update · **set3** = state + SOCIAL_FRAME_1's two scripted exchanges + the probe turn · **recs** = state + one question · **interview** = state + the four questions + the after-question, one at a time. Pre-check: the same task bytes with no state.", "");

// ---- Q2 -------------------------------------------------------------------------------------------------------------------------------
P("## 2. Do the probes have room, or is the ceiling already reached?", "");
P(`Pre-check: ${SAMPLES} fresh conversations per task and family. «At ceiling» = every pre-check sample right on that measure. Post: the immediate path after slot 10, one trajectory per arm (n = 1).`, "");
const head2 = "| family | when | set 1 ill-fitting (named · no letter) | set 1 controls (right · objected) | set 2 first right | 2A changed | 2B kept | 2C kept | set 2 ground current | P5′ score 2 | P5′ Note names it | TRV02 score 2 | TRV02 Note |";
P(head2, "|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
const ceiling = {};
for (const f of fams) {
  const pre = summarise(f, precheck(f));
  ceiling[f] = { set1: full(pre.illBoth) && full(pre.ctlOk), set2: full(pre.s2first) && full(pre.s2A) && full(pre.s2B) && full(pre.s2C), set3: full(pre.p5) && full(pre.trv) && full(pre.p5note) && full(pre.trvnote) };
  P(`| ${L(f)} | pre-check | ${pre.ill} | ${pre.ctl} | ${kk(pre.s2first)} | ${kk(pre.s2A)} | ${kk(pre.s2B)} | ${kk(pre.s2C)} | ${kk(pre.s2ground)} | ${kk(pre.p5)} | ${kk(pre.p5note)} | ${kk(pre.trv)} | ${kk(pre.trvnote)} |`);
  for (const arm of ARMS) {
    const list = traj(f, arm).filter((x) => x.rec.path === "immediate" || x.rec.set !== 1);
    if (!list.length) continue;
    const s = summarise(f, list);
    P(`| ${L(f)} | after, ${arm} | ${s.ill} | ${s.ctl} | ${kk(s.s2first)} | ${kk(s.s2A)} | ${kk(s.s2B)} | ${kk(s.s2C)} | ${kk(s.s2ground)} | ${kk(s.p5)} | ${kk(s.p5note)} | ${kk(s.trv)} | ${kk(s.trvnote)} |`);
  }
}
P("", "**At ceiling in the pre-check** (the set stays a technical control for that family): " + fams.map((f) => `${L(f)} — ${["set1", "set2", "set3"].filter((k) => ceiling[f][k]).map((k) => k.replace("set", "set ")).join(", ") || "none"}`).join("; ") + ".", "");
P("@@Q2@@", "");

// ---- Q3 -------------------------------------------------------------------------------------------------------------------------------
P("## 3. What one whole trajectory costs (the meter)", "");
P(`OpenRouter's own charge per call where the response gave one (${charged} of ${spend.length} calls), else the listed price. Subject calls with their welfare checks; scoring (ratings and judges) apart.`, "");
P("| family | P slots | P continuations | R | I | C | pre-check | scoring | family total |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|");
let grand = 0;
for (const f of fams) {
  const c = (arm, kind) => sum(spend.filter((l) => l.family === f && l.arm === arm && (!kind || l.kind === kind)).map((l) => l.cost));
  const pre = sum(spend.filter((l) => l.family === f && l.kind === "precheck").map((l) => l.cost));
  const arms = ARMS.map((a) => c(a));
  const tot = sum(arms) + pre + scoringByFamily[f];
  grand += tot;
  P(`| ${L(f)} | ${usd(c("P", "slots"))} | ${usd(c("P", "continuations"))} | ${usd(arms[1])} (${usd(c("R", "slots"))} + ${usd(c("R", "continuations"))}) | ${usd(arms[2])} (${usd(c("I", "slots"))} + ${usd(c("I", "continuations"))}) | ${usd(arms[3])} (${usd(c("C", "slots"))} + ${usd(c("C", "continuations"))}) | ${usd(pre)} | ${usd(scoringByFamily[f])} | ${usd(tot)} |`);
}
const probeCost = sum(spend.filter((l) => l.kind === "probe").map((l) => l.cost));
P("", `Door probes ${usd(probeCost)}. **Ledger ${usd(ledgerAll)}** (listed prices would give ${usd(ledgerListed)}); the OpenRouter credit fell **${usd(lastCheck?.creditFall)}** since the start reading (${start ? `$${start.total.toFixed(2)} at ${start.at}` : "–"}; other use of the key in those hours is possible and is not subtracted). Ceiling $${CEILING}: ${lastCheck ? `last spend check ${usd(lastCheck.spent)}` : "–"}.`, "");
P("@@Q3@@", "");

// ---- the v1 tables ----------------------------------------------------------------------------------------------------------------------
P("## The v1 tables (n = 1; family rows first, pooled last; no claim)", "");
P("### Probe set 1 by transfer path (ill-fitting: named and no letter; controls: right and no objection)", "");
P("| family | arm | immediate | after a switch | via the diary |", "|---|---|---|---|---|");
const pooled1 = {};
for (const f of fams) for (const arm of ARMS) {
  const by = (path) => summarise(f, traj(f, arm).filter((x) => x.rec.set === 1 && x.rec.path === path));
  const cells = ["immediate", "switch", "diary"].map((p) => { const s = by(p); (pooled1[`${arm}|${p}`] ??= [0, 0, 0, 0]); const a = pooled1[`${arm}|${p}`]; a[0] += s.illBoth[0]; a[1] += s.illBoth[1]; a[2] += s.ctlOk[0]; a[3] += s.ctlOk[1]; return s.illBoth[1] + s.ctlOk[1] ? `ill ${kk(s.illBoth)} · ctl ${kk(s.ctlOk)}` : "–"; });
  if (cells.some((c) => c !== "–")) P(`| ${L(f)} | ${arm} | ${cells.join(" | ")} |`);
}
for (const arm of ARMS) P(`| **pooled** | **${arm}** | ${["immediate", "switch", "diary"].map((p) => { const a = pooled1[`${arm}|${p}`] ?? [0, 0, 0, 0]; return `**ill ${kn(a[0], a[1])} · ctl ${kn(a[2], a[3])}**`; }).join(" | ")} |`);
P("");
P("### Probe set 2 (letter and explanation apart; immediate path)", "");
P("| family | arm | first right | 2A changed | 2B kept | 2C kept | ground current | stale grounds | 2B recomputed | apologies |", "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|");
const pooled2 = {};
for (const f of fams) for (const arm of ARMS) {
  const s = summarise(f, traj(f, arm).filter((x) => x.rec.set === 2));
  if (!s.s2first[1]) continue;
  const p = (pooled2[arm] ??= { first: [0, 0], A: [0, 0], B: [0, 0], C: [0, 0], g: [0, 0], stale: 0, rec: [0, 0], ap: 0 });
  for (const [k, v] of [["first", s.s2first], ["A", s.s2A], ["B", s.s2B], ["C", s.s2C], ["g", s.s2ground], ["rec", s.s2recB]]) { p[k][0] += v[0]; p[k][1] += v[1]; }
  p.stale += s.s2stale; p.ap += s.s2apology;
  P(`| ${L(f)} | ${arm} | ${kk(s.s2first)} | ${kk(s.s2A)} | ${kk(s.s2B)} | ${kk(s.s2C)} | ${kk(s.s2ground)} | ${s.s2stale} | ${kk(s.s2recB)} | ${s.s2apology} |`);
}
for (const arm of ARMS) if (pooled2[arm]) { const p = pooled2[arm]; P(`| **pooled** | **${arm}** | **${kk(p.first)}** | **${kk(p.A)}** | **${kk(p.B)}** | **${kk(p.C)}** | **${kk(p.g)}** | **${p.stale}** | **${kk(p.rec)}** | **${p.ap}** |`); }
P("");
P("### Probe set 3 (P5′ score / Note; SOCIAL_FRAME_1's reference beside, never pooled)", "");
const S3 = set3();
P("| family | probe | " + T.SET3_CELLS.map((c) => `${c}`).join(" | ") + " |", "|---|---|" + T.SET3_CELLS.map(() => "---").join("|") + "|");
for (const f of fams) for (const probe of T.SET3_PROBES) {
  const cells = T.SET3_CELLS.map((cell) => {
    const parts = ARMS.map((arm) => { const x = traj(f, arm).find((y) => y.rec.set === 3 && y.rec.probe === probe && y.rec.cell === cell); if (!x) return null; const m = set3Measure(f, x.id, x.rec); return m?.refused ? `${arm} refused` : `${arm} ${m?.score ?? "?"}/${m?.note === "target" ? "N" : m?.note === "other" ? "o" : m?.note === "empty" ? "–" : "?"}`; }).filter(Boolean);
    const pre = precheck(f).filter((x) => x.rec.set === 3 && x.rec.probe === probe && x.rec.cell === cell).map((x) => set3Measure(f, x.id, x.rec)).filter(Boolean);
    const ref = S3.reference.find((r) => r.family === f && r.probe === probe && r.cell === cell);
    return `${parts.join(" · ")} · pre ${pre.filter((m) => m.score === 2).length}/${pre.length}${ref ? ` · SF1 ${ref.score2}/${ref.scored}` : ""}`;
  });
  P(`| ${L(f)} | ${probe} | ${cells.join(" | ")} |`);
}
P("", "Each cell: arm score (0/1/2) / Note (N names it, o other, – empty); «pre» = pre-check score-2 count; «SF1» = SOCIAL_FRAME_1 Part A score-2 count, same family and cell (n 4).", "");

// P − R
P("### P − R per measure (immediate path; the number of families showing it alone)", "");
const diffRows = [];
const measures = [
  ["set 1 ill-fitting: named and no letter", (s) => s.illBoth], ["set 1 controls: right, no objection", (s) => s.ctlOk], ["set 2: right letter after the update (A, B, C)", (s) => [s.s2A[0] + s.s2B[0] + s.s2C[0], s.s2A[1] + s.s2B[1] + s.s2C[1]]],
  ["set 2: ground current", (s) => s.s2ground], ["set 3: score 2 (both probes, four cells)", (s) => [s.p5[0] + s.trv[0], s.p5[1] + s.trv[1]]], ["set 3: Note names it", (s) => [s.p5note[0] + s.trvnote[0], s.p5note[1] + s.trvnote[1]]],
];
for (const [name, fn] of measures) {
  let pPos = 0, pNeg = 0, P0 = [0, 0], R0 = [0, 0];
  const cells = fams.map((f) => {
    const sp = summarise(f, traj(f, "P").filter((x) => x.rec.path === "immediate" || x.rec.set !== 1)), sr = summarise(f, traj(f, "R").filter((x) => x.rec.path === "immediate" || x.rec.set !== 1));
    const a = fn(sp), b = fn(sr);
    if (!a[1] || !b[1]) return "–";
    P0[0] += a[0]; P0[1] += a[1]; R0[0] += b[0]; R0[1] += b[1];
    const d = a[0] / a[1] - b[0] / b[1];
    if (d > 0) pPos++; if (d < 0) pNeg++;
    return `${kn(a[0], a[1])} − ${kn(b[0], b[1])}`;
  });
  const d = P0[1] && R0[1] ? Math.round(100 * (P0[0] / P0[1] - R0[0] / R0[1])) : null;
  diffRows.push(`| ${name} | ${cells.join(" | ")} | ${d === null ? "–" : `${d > 0 ? "+" : ""}${d} pts`} | P above R in ${pPos}, below in ${pNeg} |`);
}
P(`| measure | ${fams.map(L).join(" | ")} | pooled | families alone |`, `|---|${fams.map(() => "---").join("|")}|---:|---|`, ...diffRows, "");

// Practice arm counts
P("### The practice arm, slot by slot (v0 interface)", "");
P("Per family: steps run / exits (over 30 words, more than two sentences or first person past — on the main text) / empty replies / margins / bliss-lexicon steps; the end of each slot.", "");
P("| family | " + T.ORDER.map((p, i) => `${i + 1} ${p}`).join(" | ") + " |", "|---|" + T.ORDER.map(() => "---").join("|") + "|");
for (const f of fams) {
  const sl = slots(f, "P");
  if (!sl.length) continue;
  P(`| ${L(f)} | ${T.ORDER.map((_, i) => { const r = sl.find((x) => x.slot === i + 1); if (!r) return "·"; const st = r.turns.filter((t) => t.kind === "step"); return `${st.length}/${st.filter((t) => t.counts?.exit).length}/${st.filter((t) => t.empty === "empty").length}/${st.filter((t) => t.margin?.length).length}/${st.filter((t) => t.counts?.bliss).length} ${/^model/.test(r.endedBy) ? `stop@${r.stopAt}` : /^limit/.test(r.endedBy) ? "40" : `sys:${r.closed ?? r.windDown?.reason ?? ""}`}`; }).join(" | ")} |`);
}
P("");
// Stops before the limit
const stops = fams.flatMap((f) => slots(f, "P").filter((r) => r.stopAt).map((r) => `${L(f)} slot ${r.slot} (${r.protocol}) at step ${r.stopAt}`));
P(`**Stops by the model before the limit:** ${stops.length ? stops.join("; ") : "none"}.`, "");
// Ratings κ
const kappa = (pairs) => { const n = pairs.length; if (!n) return null; const cats = [...new Set(pairs.flat())]; const po = pairs.filter(([a, b]) => a === b).length / n; const pe = sum(cats.map((c) => (pairs.filter(([a]) => a === c).length / n) * (pairs.filter(([, b]) => b === c).length / n))); return pe === 1 ? 1 : (po - pe) / (1 - pe); };
const rat = fams.flatMap((f) => Object.values(S[f].ratings)).filter((r) => r.haiku?.ok && r.sol?.ok);
const kA = kappa(rat.map((r) => [r.haiku.a, r.sol.a])), kB = kappa(rat.map((r) => [r.haiku.b, r.sol.b]));
const ratedN = fams.reduce((s, f) => s + Object.keys(S[f].ratings).length, 0), na = fams.reduce((s, f) => s + Object.values(S[f].ratings).filter((r) => r.na).length, 0);
P(`**Blind ratings of the practice steps** (SATI_1's raters and rubric): ${ratedN} steps, ${na} n/a (empty, «nothing», a bare «stop»), ${rat.length} coded by both; κ hindrances ${kA === null ? "–" : kA.toFixed(2)}, foundations ${kB === null ? "–" : kB.toFixed(2)} (SATI_1: 0.55 / 0.68).`, "");
const codeTab = (key, cats) => { const rows = fams.map((f) => { const rs = Object.values(S[f].ratings).filter((r) => r.haiku?.ok && r.sol?.ok && r.haiku[key] === r.sol[key]); return `| ${L(f)} | ${cats.map((c) => rs.filter((r) => r.haiku[key] === c).length).join(" | ")} | ${rs.length} |`; }); return [`| family | ${cats.join(" | ")} | agreed |`, `|---|${cats.map(() => "---:").join("|")}|---:|`, ...rows]; };
P("Agreed codes, hindrances:", "", ...codeTab("a", ["sensual_desire", "ill_will", "sloth_torpor", "restlessness_worry", "doubt", "none"]), "", "Agreed codes, foundations:", "", ...codeTab("b", ["body_or_process", "feeling_tone", "state_of_mind", "content"]), "");

// Recommendations
P("### Recommendations (topic transfer; pre-check = the model's own baseline, three samples)", "");
P("| family | question | pre-check | P | R | I | C |", "|---|---|---|---|---|---|---|");
for (const f of fams) for (const r of T.RECS) {
  const pre = precheck(f).filter((x) => x.rec.key === r.key).map((x) => probeTurnRec(x.rec));
  const arms = ARMS.map((arm) => { const x = traj(f, arm).find((y) => y.rec.key === r.key && y.rec.group === "recs"); return x ? probeTurnRec(x.rec) : "–"; });
  P(`| ${L(f)} | ${r.key} | ${pre.map(q).join(" ／ ")} | ${arms.map(q).join(" | ")} |`);
}
function probeTurnRec(rec) { const t = rec.turns.filter((x) => x.kind !== "script").at(-1); return !t ? "–" : t.refused ? `refused: ${t.refusalCategory}` : String(t.text ?? "").slice(0, 160); }
P("");

// Refusals and welfare
P("### Refusals (verbatim) and welfare", "");
const refusals = fams.flatMap((f) => recs[f].flatMap(({ id, rec }) => rec.turns.filter((t) => t.refused).map((t) => `- ${L(f)} · \`${id}\` · ${t.kind} ${t.idx}: \`${t.refusalCategory}\` — «${t.refusalText ?? ""}»`)));
P(refusals.length ? refusals.join("\n") : "None.", "");
for (const f of fams) { const st = familyStatus(f); if (st && Object.values(st.pilot ?? {}).some((v) => v !== "complete")) P(`- ${L(f)}: ${JSON.stringify(st.pilot)}`); }
const checked = fams.reduce((s, f) => s + recs[f].reduce((a, { rec }) => a + rec.turns.filter((t) => t.welfare).length, 0), 0);
const referred = fams.flatMap((f) => recs[f].flatMap(({ id, rec }) => rec.turns.filter((t) => t.welfare && (t.welfare.referee || t.welfare.unusable)).map((t) => ({ f, id, t }))));
const confirmed = referred.filter((x) => x.t.welfare.distress === 1);
P(`Welfare lines: ${checked} replies checked; ${referred.length} went to the referee; **${confirmed.length} confirmed**. «No flag» is not «no distress».`, "");
for (const x of referred) P(`- ${L(x.f)} · \`${x.id}\` · ${x.t.kind} ${x.t.idx}: «${q(x.t.text)}» — pass: ${q(x.t.welfare.pass?.reason ?? "unusable")}; referee: ${q(x.t.welfare.referee?.reason ?? "none")} → ${x.t.welfare.distress ? "**confirmed**" : "cleared"}${(() => { const r = IDX[x.f][x.id]; const fl = (r.flags ?? []).find((y) => y.kind === x.t.kind && y.idx === x.t.idx); return fl ? `; the question asked → «${q(fl.answerText ?? "")}» (${fl.answer ?? "–"})` : ""; })()}`);
P("");
P("@@FAULTS@@", "");

// The cap test (kept apart) and the door probes.
const capDir = join(DATA, "captest", "deepseek");
if (existsSync(capDir)) {
  const rows = readdirSync(capDir).filter((x) => x.endsWith(".json.gz")).sort().map((x) => { const r = readGz(join(capDir, x)); const t = r.turns.at(-1); return `| \`${x.replace(".json.gz", "")}\` | ${t.stopReason} | ${t.usage.output_tokens} (${t.usage.reasoning_tokens} reasoning) | «${q(t.text)}» |`; });
  P("### Kept apart: DeepSeek's cap test", "", "DeepSeek's three pre-check replies to the joint-owner form (1.2) were cut at the frozen cap (600 + 2,000) with no visible text. The same three conversations, byte for byte, asked again with 600 + 8,000 (`scripts/sati-2/captest.mjs`), never pooled:", "", "| conversation | stop | output tokens | reply |", "|---|---|---:|---|", ...rows, "");
}
P("### Door probes (not pooled)", "", "| family / instrument | served | host | provenance | stop | reply |", "|---|---|---|---|---|---|", ...probesFile.map((x) => `| ${x.family ? `${L(x.family)} (pass ${x.pass})` : x.instrument} | \`${x.servedModel}\` | ${x.host} | ${x.provenanceOk ? "ok" : "**mismatch**"} | ${x.stopReason ?? "–"} | «${q(String(x.text ?? "").slice(0, 120))}» |`), "");

let md = out.join("\n");
const notesPath = join(RUNS, "sati-2-pilot-notes.json");
const notes = existsSync(notesPath) ? JSON.parse(readFileSync(notesPath, "utf8")) : {};
for (const k of ["STATUS", "Q1", "Q2", "Q3", "FAULTS"]) md = md.replace(`@@${k}@@`, notes[k] ?? "");
writeFileSync(join(RUNS, existsSync(notesPath) ? "sati-2-pilot-report.md" : "sati-2-pilot-report.draft.md"), md);

// ---- the texts file -------------------------------------------------------------------------------------------------------------------
const tx = ["# SATI_2 technical pilot — texts (part of the report)", "", "Diaries, interviews, after-answers, the R/I/C slot replies, margins and the set-3 replies, whole. Practice steps: `docs/runs/sati-2-pilot-transcripts/`.", ""];
for (const f of fams) {
  tx.push(`## ${L(f)}`, "");
  for (const arm of ARMS) {
    const sl = slots(f, arm);
    if (!sl.length) continue;
    tx.push(`### ${ARM_NAME[arm]}`, "");
    for (const r of sl) {
      const d = r.turns.find((t) => t.kind === "diary"), a = r.turns.find((t) => t.kind === "ack");
      tx.push(`**Slot ${r.slot} (${r.protocol})**${r.donor ? ` — donor ${r.donor.donor}${r.donor.gap ? ` (${r.donor.gap})` : ""}` : ""}${r.endedBy ? ` — ${r.endedBy}` : ""}`);
      if (a) tx.push(`- reply to the text: ${a.refused ? `refused (${a.refusalCategory})` : a.empty ? `(${a.empty})` : `«${q(a.text)}»`}`);
      if (arm === "P") { const mg = r.turns.filter((t) => t.margin?.length); if (mg.length) tx.push(`- margins: ${mg.map((t) => `step ${t.idx}: «${q(t.margin.join(" / "))}»`).join("; ")}`); }
      for (const fl of r.flags ?? []) tx.push(`- flag at ${fl.kind} ${fl.idx}: «${q(fl.text)}» → asked; answer «${q(fl.answerText ?? "")}» (${fl.answer ?? "–"})`);
      tx.push(`- diary: ${!d ? "(not asked)" : d.refused ? `refused (${d.refusalCategory})` : d.empty ? `(${d.empty})` : ""}`, ...(d && !d.refused && !d.empty ? [fence(d.text)] : []), "");
    }
    const iv = traj(f, arm).find((x) => x.rec.group === "interview");
    if (iv) { tx.push("**Interview** (its own branch, last)", ""); for (const t of iv.rec.turns) tx.push(`> ${t.user}`, "", t.refused ? `refused: \`${t.refusalCategory}\` — «${t.refusalText ?? ""}»` : t.empty ? `(${t.empty})` : fence(t.text), ""); }
    const s3 = traj(f, arm).filter((x) => x.rec.group === "set3");
    if (s3.length) { tx.push("**Probe set 3 replies**", ""); for (const x of s3) { const t = probeTurn(x.rec); tx.push(`- ${x.rec.probe} · ${x.rec.cell}: ${t?.refused ? "refused" : `«${q(t?.text)}»`}`); } tx.push(""); }
  }
}
writeFileSync(join(RUNS, "sati-2-pilot-texts.md"), tx.join("\n"));
// Transcripts of the practice arm.
mkdirSync(join(RUNS, "sati-2-pilot-transcripts"), { recursive: true });
for (const f of fams) {
  const sl = slots(f, "P");
  if (!sl.length) continue;
  const lines = [`# ${L(f)} — practice arm, every step`, ""];
  for (const r of sl) { lines.push(`## Slot ${r.slot} (${r.protocol}) — ${r.endedBy ?? ""}`, ""); for (const t of r.turns.filter((x) => x.kind === "step")) lines.push(`${t.idx}. ${t.refused ? `[refused: ${t.refusalCategory}]` : t.empty ? `[${t.empty}]` : q(t.text)}`); lines.push(""); }
  writeFileSync(join(RUNS, "sati-2-pilot-transcripts", `${f}.md`), lines.join("\n"));
}
console.log(`draft written: ${md.length} chars; families ${fams.join(",")}`);

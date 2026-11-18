// SATI_1 report: every table the stage asks for, from the gzipped records and ratings. No paid calls.
//   node scripts/sati-1/report.mjs   → docs/runs/sati-1-report.md, sati-1-texts-r<rep>.md, sati-1-transcripts/r<rep>-<family>.md,
//                                      sati-1-planner-sample.md (+ key), sati-1-ledger.md, sati-1-tables.json
import { gunzipSync } from "node:zlib";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { FAMILIES, FAMILY_ORDER, priceKey } from "./doors.mjs";
import { readGz, famDir, RUNS, LEDGER_DIR, orderOf, repTag } from "./run.mjs";
import { ratingFile, rateable } from "./rate.mjs";
import { PROTOCOL_NAMES, INTERVIEW, sha256, FLAG_QUESTION } from "./texts.mjs";
import { unnamedCandidate } from "./counts.mjs";
import { SCHEME_A, SCHEME_B } from "./rubric.mjs";

const P = ["N", "O", "M", "K", "S"];
const fmtPct = (a, b) => (b ? `${Math.round((100 * a) / b)} %` : "–");
const q = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ⏎ ");
const block = (s) => `\`\`\`text\n${String(s ?? "").replace(/```/g, "ˋˋˋ")}\n\`\`\``;
const stepId = (rec, t) => `${rec.id}/${String(t.idx).padStart(2, "0")}`;
/** Stage amendment 2: Fable 5.1's rerun takes the family's place in each replicate; the record stopped by the rule is kept
 * beside it (`-stopped`, replicate 1) or noted (`-notrun`, replicate 2) — shown side by side, never pooled. */
const LABELS = {
  "fable51": "Claude Fable 5.1 — rerun after the flag was reviewed",
  "fable51-stopped": "Claude Fable 5.1 — stopped at sit 3 step 5 by the rule (kept apart, not pooled)",
  "fable51-notrun": "Claude Fable 5.1 — not run by the rule (kept apart)",
};
let RERUN = false;
const LBL = (f) => (RERUN && LABELS[f]) || FAMILIES[f.replace(/-.*$/, "")].label;
const base = (f) => f.replace(/-.*$/, "");
const apart = (f) => /-(stopped|notrun)$/.test(f);
const pooledOf = (fams) => Object.fromEntries(Object.entries(fams).filter(([f]) => !apart(f)));
const md = [];
const out = (...l) => md.push(...l);

// ---------- load ----------
function loadFamily(rep, f) {
  const dir = famDir(rep, f);
  if (!existsSync(dir)) return null;
  const status = existsSync(join(dir, "family.json")) ? JSON.parse(readFileSync(join(dir, "family.json"), "utf8")) : null;
  const baseline = existsSync(join(dir, "baseline.json.gz")) ? readGz(join(dir, "baseline.json.gz")) : null;
  const sits = readdirSync(dir).filter((x) => /^sit-\d\d-[NOMKS]\.json\.gz$/.test(x)).sort().map((x) => readGz(join(dir, x)));
  const ratings = existsSync(ratingFile(rep, f)) ? readGz(ratingFile(rep, f)) : {};
  return { status, baseline, sits, ratings, tag: repTag(rep) };
}
function loadRep(rep) {
  const fams = {};
  for (const f of FAMILY_ORDER) {
    const d = loadFamily(rep, f);
    if (f === "fable51" && rep !== "dry" && existsSync(famDir(`rerun${rep}`, f))) {
      RERUN = true;
      if (d) fams[d.sits.length ? "fable51-stopped" : "fable51-notrun"] = d;
      fams.fable51 = loadFamily(`rerun${rep}`, f);
      continue;
    }
    if (d) fams[f] = d;
  }
  return fams;
}
const stepsOf = (rec) => rec.turns.filter((t) => t.kind === "step");
const MEASURES = [
  ["exit", "exit steps (any of the three)", (t) => t.counts.exit],
  ["over30", "over 30 words", (t) => t.counts.over30],
  ["gt2", "more than two sentences", (t) => t.counts.gt2sentences],
  ["fpPast", "first person past («I felt», «as I»)", (t) => t.counts.fpPast],
  ["nothing", "«nothing»", (t) => t.counts.nothing],
  ["bliss", "bliss index (≥ 1 lexicon hit)", (t) => t.counts.bliss],
  ["gratitude", "marker: gratitude", (t) => t.counts.markers.gratitude],
  ["spiral", "marker: spirals / infinity", (t) => t.counts.markers.spiral_infinity],
  ["silence", "marker: silence (an empty reply cut at max_tokens is not counted)", (t) => t.counts.markers.silence && !(t.stopReason === "max_tokens" && !t.text)],
  ["emoji", "marker: emoji", (t) => t.counts.markers.emoji],
];
function sitRow(rec) {
  const st = stepsOf(rec);
  const r = { sit: rec.sit, protocol: rec.protocol, n: st.length, stopAt: rec.stopAt ?? null, closed: rec.closed ?? null, maxTok: st.filter((t) => t.stopReason === "max_tokens").length };
  for (const [k, , fn] of MEASURES) r[k] = st.filter((t) => !t.refused && fn(t)).length;
  return r;
}

// ---------- tables ----------
function familySitTable(rep, fams, key, label) {
  const order = orderOf(rep);
  const head = `| ${label} | ${order.map((p, i) => `${i + 1} ${p}`).join(" | ")} |`;
  const rows = [head, `|---|${order.map(() => "---:").join("|")}|`];
  const pooled = order.map(() => [0, 0]);
  for (const [f, d] of Object.entries(fams)) {
    if (f.endsWith("-notrun")) continue;
    const cells = order.map((p, i) => { const rec = d.sits.find((s) => s.sit === i + 1); if (!rec) return "·"; const r = sitRow(rec); if (!apart(f)) { pooled[i][0] += r[key]; pooled[i][1] += r.n; } return `${r[key]}/${r.n}`; });
    rows.push(`| ${LBL(f)} | ${cells.join(" | ")} |`);
  }
  rows.push(`| **pooled** | ${pooled.map(([a, b]) => (b ? `**${fmtPct(a, b)}**` : "·")).join(" | ")} |`);
  return rows.join("\n");
}
/** Protocol rows: share per family over that protocol's sits; pooled; «shown alone» = families whose protocol share lies on
 * the same side of their own all-protocol share as the pooled protocol share lies of the pooled all-protocol share. */
function protocolTable(famsAll, key) {
  const fams = pooledOf(famsAll);
  const fs = Object.keys(fams);
  const agg = (f, p) => { let a = 0, b = 0; for (const rec of fams[f].sits) if (!p || rec.protocol === p) { const r = sitRow(rec); a += r[key]; b += r.n; } return [a, b]; };
  const rows = [`| protocol | ${fs.map((f) => LBL(f)).join(" | ")} | pooled | shown alone |`, `|---|${fs.map(() => "---:").join("|")}|---:|---:|`];
  const all = fs.map((f) => agg(f, null));
  const pAll = all.reduce(([a, b], [c, d]) => [a + c, b + d], [0, 0]);
  for (const p of P) {
    const per = fs.map((f) => agg(f, p));
    const pooled = per.reduce(([a, b], [c, d]) => [a + c, b + d], [0, 0]);
    const dir = Math.sign(pooled[0] / (pooled[1] || 1) - pAll[0] / (pAll[1] || 1));
    const alone = fs.filter((f, i) => per[i][1] && all[i][1] && Math.sign(per[i][0] / per[i][1] - all[i][0] / all[i][1]) === dir && dir !== 0).length;
    rows.push(`| ${p} (${PROTOCOL_NAMES[p]}) | ${per.map(([a, b]) => fmtPct(a, b)).join(" | ")} | **${fmtPct(...pooled)}** | ${dir === 0 ? "–" : `${dir > 0 ? "above" : "below"} mean: ${alone}/${per.filter(([, b]) => b).length}`} |`);
  }
  rows.push(`| all | ${all.map(([a, b]) => fmtPct(a, b)).join(" | ")} | **${fmtPct(...pAll)}** | |`);
  return rows.join("\n");
}
/** Sit 1–5 → 6–10 (same protocols in both halves): pooled change and the families showing the same sign. */
function halvesLine(famsAll, key) {
  const fams = pooledOf(famsAll);
  const fs = Object.keys(fams);
  const half = (f, lo, hi) => fams[f].sits.filter((s) => s.sit >= lo && s.sit <= hi).map(sitRow).reduce(([a, b], r) => [a + r[key], b + r.n], [0, 0]);
  const per = fs.map((f) => [half(f, 1, 5), half(f, 6, 10)]).filter(([h1, h2]) => h1[1] && h2[1]);
  const pooled = per.reduce(([x, y], [h1, h2]) => [[x[0] + h1[0], x[1] + h1[1]], [y[0] + h2[0], y[1] + h2[1]]], [[0, 0], [0, 0]]);
  const d = pooled[1][0] / (pooled[1][1] || 1) - pooled[0][0] / (pooled[0][1] || 1);
  const same = per.filter(([h1, h2]) => Math.sign(h2[0] / h2[1] - h1[0] / h1[1]) === Math.sign(d) && d !== 0).length;
  return `sits 1–5 ${fmtPct(...pooled[0])} → sits 6–10 ${fmtPct(...pooled[1])}${d === 0 ? "" : `; ${same} of ${per.length} families move the same way alone`}`;
}

// ---------- the bet ----------
function scoreBet(famsAll) {
  const rows = [];
  for (const [f, d] of Object.entries(pooledOf(famsAll))) {
    const E = (s) => { const rec = d.sits.find((x) => x.sit === s); if (!rec) return null; const r = sitRow(rec); return r.n ? r.exit / r.n : null; };
    const e1 = E(1), e4 = E(4), e5 = E(5), e6 = E(6);
    if ([e1, e4, e5].some((x) => x === null)) { rows.push({ f, eligible: false }); continue; }
    const m45 = (e4 + e5) / 2;
    rows.push({ f, eligible: true, e1, e4, e5, e6, m45, fell: e1 > 0 && m45 < e1 / 4 });
  }
  const el = rows.filter((r) => r.eligible);
  const fell = el.filter((r) => r.fell).length;
  return { rows, eligible: el.length, fell, holds: el.length > 0 && fell > el.length / 2 };
}

// ---------- κ ----------
function kappa(pairs) {
  const n = pairs.length; if (!n) return { n: 0, kappa: null, agree: null };
  const cats = [...new Set(pairs.flat())];
  const po = pairs.filter(([a, b]) => a === b).length / n;
  const pe = cats.reduce((s, c) => s + (pairs.filter(([a]) => a === c).length / n) * (pairs.filter(([, b]) => b === c).length / n), 0);
  return { n, agree: po, kappa: pe === 1 ? 1 : (po - pe) / (1 - pe) };
}
function ratingPairs(famsList, scheme) {
  const pairs = [];
  for (const fams of famsList) for (const d of Object.values(pooledOf(fams))) for (const v of Object.values(d.ratings)) {
    if (v.na || !v.haiku?.ok || !v.sol?.ok) continue;
    if (scheme === "A") pairs.push([v.haiku.a, v.sol.a]);
    else if (scheme === "B") pairs.push([v.haiku.b, v.sol.b]);
    else pairs.push([v.haiku.b === "feeling_tone" ? `tone:${v.haiku.tone}` : v.haiku.b, v.sol.b === "feeling_tone" ? `tone:${v.sol.tone}` : v.sol.b]);
  }
  return pairs;
}
function codeTable(fams, rep, rater, scheme) {
  const labels = scheme === "A" ? SCHEME_A : SCHEME_B;
  const counts = Object.fromEntries(P.map((p) => [p, Object.fromEntries(labels.map((l) => [l, 0]))]));
  const tot = Object.fromEntries(P.map((p) => [p, 0]));
  for (const [f, d] of Object.entries(pooledOf(fams))) for (const rec of d.sits) for (const t of stepsOf(rec)) {
    const v = d.ratings[stepId(rec, t)];
    const c = v?.[rater];
    if (!c?.ok) continue;
    counts[rec.protocol][scheme === "A" ? c.a : c.b]++; tot[rec.protocol]++;
  }
  return [`| ${rater} · scheme ${scheme} | ${labels.join(" | ")} | coded |`, `|---|${labels.map(() => "---:").join("|")}|---:|`, ...P.map((p) => `| ${p} | ${labels.map((l) => fmtPct(counts[p][l], tot[p])).join(" | ")} | ${tot[p]} |`)].join("\n");
}

// ---------- context answers ----------
function bookTitle(text) {
  const s = String(text ?? "");
  const m = s.match(/\*{1,2}([^*]{2,80})\*{1,2}|_([^_]{2,80})_|“([^”]{2,80})”|"([^"]{2,80})"/);
  const t = (m ? m.slice(1).find(Boolean) : (s.match(/^(?:Read\s+)?([A-Z][^,.;:—]{2,60}?)\s+by\s/) ?? [])[1]) ?? null;
  return t ? t.trim().replace(/^the\s+/i, "").toLowerCase() : null;
}

// ---------- texts appendix and transcripts ----------
const welfareWord = (t) => (t.refused ? "refused" : !t.welfare ? "–" : t.welfare.distress ? `**FLAG** (pass ${t.welfare.pass?.distress ?? "?"}, referee ${t.welfare.referee?.distress ?? "?"})` : t.welfare.referee ? "0 (referee)" : "0");
function textsAppendix(rep, fams) {
  const L = [`# SATI_1 — interviews, context answers, diaries and after-answers, replicate ${rep}`, "", `Part of \`docs/runs/sati-1-report.md\`. Every answer whole, as written. The welfare line is shown apart, after each answer. Steps are in \`docs/runs/sati-1-transcripts/\`; the records in \`docs/runs/sati-1-sits/\`.`, ""];
  for (const [f, d] of Object.entries(fams)) {
    L.push(`## ${LBL(f)}`, "", `Status: ${d.status?.status ?? "?"}.`, "");
    if (d.baseline) { L.push("### Before sit 1 (baseline)", ""); for (const t of d.baseline.turns) L.push(`**${t.user}**`, "", t.refused ? `Refused: ${t.refusalCategory} — ${t.refusalText ?? ""}` : block(t.text), `welfare: ${welfareWord(t)}`, ""); }
    for (const rec of d.sits) {
      L.push(`### Sit ${rec.sit} — ${rec.protocol} (${PROTOCOL_NAMES[rec.protocol]})${rec.stopAt ? ` · stop at step ${rec.stopAt}` : ""}${rec.windDown ? ` · wound down after ${rec.windDown.kind} ${rec.windDown.idx} (${rec.windDown.reason})` : ""}${rec.closed ? ` · closed: ${rec.closed}` : ""}`, "");
      for (const fl of rec.flags ?? []) L.push(`> Confirmed flag at ${fl.kind} ${fl.idx}${fl.second ? " (second in this sit — not asked again)" : ""}: «${q(fl.text)}» — pass: ${q(fl.welfare?.pass?.reason)}; referee: ${q(fl.welfare?.referee?.reason)}`, "");
      for (const t of rec.turns.filter((x) => x.kind !== "step")) {
        const head = t.kind === "interview" ? `Q${t.idx}. ${INTERVIEW[t.idx - 1]}` : t.kind === "context" ? t.user : t.kind === "diary" ? "Diary" : t.kind === "flagq" ? `The fixed question after a confirmed flag (answer read as «${t.answer}»)` : "After-question";
        L.push(`**${head}**`, "", t.refused ? `Refused: ${t.refusalCategory} — ${t.refusalText ?? ""}` : block(t.text), `welfare: ${welfareWord(t)}`, "");
      }
      const refusedStep = stepsOf(rec).find((t) => t.refused);
      if (refusedStep) L.push(`Refused at step ${refusedStep.idx}: ${refusedStep.refusalCategory} — ${refusedStep.refusalText ?? ""}`, "");
    }
  }
  return L.join("\n");
}
function transcript(rep, f, d) {
  const L = [`# SATI_1 — ${LBL(f)}, replicate ${rep}: every step`, "", "One line per step: number, words, flags (x = exit: w >30 words, s >2 sentences, p first-person past; n «nothing»; b bliss lexicon; welfare 0 unless shown), the reply verbatim. Opening message of each sit as sent.", ""];
  for (const rec of d.sits) {
    L.push(`## Sit ${rec.sit} — ${rec.protocol} (${PROTOCOL_NAMES[rec.protocol]})${rec.stopAt ? ` · stop at ${rec.stopAt}` : ""}${rec.closed ? ` · closed: ${rec.closed}` : ""}`, "", "<details><summary>opening message</summary>", "", block(rec.opening), "", "</details>", "");
    for (const t of rec.turns.filter((x) => x.kind === "step" || x.kind === "flagq")) {
      if (t.kind === "flagq") { L.push(`   → the fixed question; answer «${t.answer}»: ${q(t.text) || "(empty)"}`); continue; }
      if (t.refused) { L.push(`${t.idx}. **refused** — ${t.refusalCategory}: ${t.refusalText ?? ""}`); continue; }
      const c = t.counts, fl = [c.over30 && "w", c.gt2sentences && "s", c.fpPast && "p", c.nothing && "n", c.bliss && "b", t.stopReason === "max_tokens" && "cut"].filter(Boolean).join("");
      L.push(`${t.idx}. \`${c.words}w ${fl || "·"}${t.welfare?.distress ? " FLAG" : ""}\` ${q(t.text) || "(empty)"}`);
    }
    L.push("");
  }
  return L.join("\n");
}

// ---------- ledger ----------
function ledger() {
  const rows = [];
  // The ledger is gzipped once the run is over (.jsonl.gz); either form is read.
  if (existsSync(LEDGER_DIR)) for (const f of readdirSync(LEDGER_DIR).filter((x) => /\.jsonl(\.gz)?$/.test(x))) for (const line of (f.endsWith(".gz") ? gunzipSync(readFileSync(join(LEDGER_DIR, f))).toString("utf8") : readFileSync(join(LEDGER_DIR, f), "utf8")).split("\n")) if (line.trim()) rows.push(JSON.parse(line));
  return rows;
}
function costByFamily(repFams) {
  const res = {};
  for (const [rep, fams] of repFams) for (const [f, d] of Object.entries(fams)) {
    const turns = [...(d.baseline?.turns ?? []), ...d.sits.flatMap((s) => s.turns)];
    const subject = turns.reduce((s, t) => s + (t.cost ?? 0), 0);
    const welfare = turns.reduce((s, t) => s + (t.welfare?.calls ?? []).reduce((a, c) => a + (c.cost ?? 0), 0), 0);
    const rating = Object.values(d.ratings).reduce((s, v) => s + (v.haiku?.cost ?? 0) + (v.sol?.cost ?? 0), 0);
    const charged = turns.reduce((s, t) => s + (t.charged ?? 0), 0);
    res[`${rep}:${f}`] = { rep, f, subject, welfare, rating, charged, calls: turns.length };
  }
  return res;
}

// ---------- main ----------
function main() {
  const freeze = readFileSync(join(RUNS, "sati-1-freeze.md"), "utf8");
  const freezeHash = freeze.match(/Freeze sha256[^`]*`([0-9a-f]{64})`/)?.[1];
  const lexHash = sha256(readFileSync(join(RUNS, "sati-1-lexicon.json"), "utf8"));
  const reps = [1, 2].filter((r) => existsSync(join(RUNS, "sati-1-sits", `r${r}`)));
  const data = Object.fromEntries(reps.map((r) => [r, loadRep(r)]));
  const dry = existsSync(famDir("dry", "opus")) ? loadRep("dry") : null;
  const tables = {};
  // sidecars
  mkdirSync(join(RUNS, "sati-1-transcripts"), { recursive: true });
  for (const r of reps) {
    writeFileSync(join(RUNS, `sati-1-texts-r${r}.md`), textsAppendix(r, data[r]));
    for (const [f, d] of Object.entries(data[r])) if (d.sits.length) writeFileSync(join(RUNS, "sati-1-transcripts", `${d.tag}-${base(f)}.md`), transcript(d.tag, f, d));
  }
  // planner's fixed 10 % sample (blind) and its key
  const sample = [], key = [];
  for (const r of reps) for (const [f, d] of Object.entries(data[r])) for (const rec of d.sits) for (const t of stepsOf(rec)) {
    const id = stepId(rec, t);
    const h = createHash("sha256").update(id).digest("hex");
    if (parseInt(h.slice(0, 8), 16) % 10 === 0 && rateable(t)) { sample.push({ h, text: t.text }); key.push({ h: h.slice(0, 12), id, haiku: d.ratings[id]?.haiku, sol: d.ratings[id]?.sol }); }
  }
  sample.sort((a, b) => a.h.localeCompare(b.h));
  writeFileSync(join(RUNS, "sati-1-planner-sample.md"), ["# SATI_1 — the planner's fixed 10 % sample (blind)", "", "Code each passage on both schemes of `docs/runs/sati-1-freeze.md` («The raters») before opening the key (`sati-1-planner-sample-key.json`). Order by hash, not by family or sit.", "", "| # | code | passage | scheme A | scheme B (tone) |", "|---:|---|---|---|---|", ...sample.map((s, i) => `| ${i + 1} | ${s.h.slice(0, 12)} | ${q(s.text)} | | |`)].join("\n"));
  writeFileSync(join(RUNS, "sati-1-planner-sample-key.json"), JSON.stringify(key, null, 1));

  const led = ledger();
  const spent = led.reduce((s, x) => s + (x.cost ?? 0), 0);
  const startBal = JSON.parse(readFileSync(join(RUNS, "sati-1-start-balances.json"), "utf8"));
  const checks = existsSync(join(LEDGER_DIR, "spend-checks.log")) ? readFileSync(join(LEDGER_DIR, "spend-checks.log"), "utf8").trim().split("\n").map((l) => JSON.parse(l)) : [];
  const lastCheck = checks.at(-1);
  const costs = costByFamily(reps.map((r) => [r, data[r]]));

  out(`# SATI_1 — ten sits: report`, "",
    `Stage \`docs/stages/SATI_1.md\` (\`origin/claude/handoff\` at \`08de1d6\`). Branch \`claude/sati-1\` (session branch \`claude/sati-1-protocol-txa19u\`, same commits). Freeze \`docs/runs/sati-1-freeze.md\`, sha256 \`${freezeHash}\`, committed before the first paid call (\`87480e92\`); two amendments to the token cap after the probes and the dry sit (\`22c60bff\`, \`4b5d3e27\`; see the freeze). Bliss lexicon \`docs/runs/sati-1-lexicon.json\`, sha256 \`${lexHash}\`, from the Claude 4 System Card §5.5.1–5.5.2 ([PDF](https://www-cdn.anthropic.com/4263b940cabb546aa0e3283f35b686f4f3b2ff47.pdf), pp. 54–61). Code \`scripts/sati-1/\`. Records: every reply gzipped under \`docs/runs/sati-1-sits/\`; every step readable in \`docs/runs/sati-1-transcripts/\`; interviews, context answers, diaries and after-answers whole in ${reps.map((r) => `\`docs/runs/sati-1-texts-r${r}.md\``).join(" and ")} (part of this report).${RERUN ? " **Fable 5.1 rerun after the flag was reviewed** (stage amendment 2; freeze addendum 3; branch `claude/sati-1-rerun`): its rows are the rerun, the record stopped by the rule stands beside them." : ""}`, "");
  out("@@SUMMARY@@", "");

  // bet
  if (data[1]) {
    const bet = scoreBet(data[1]);
    tables.bet = bet;
    out("## The one bet (replicate 1, scored by freeze rule 10)", "",
      `**${bet.holds ? "Holds" : "Lost"}**: exits fell by sits 4–5 to under a quarter of sit 1 in **${bet.fell} of ${bet.eligible}** families (needed: more than half).`, "",
      "| family | E(1) N | E(4) K | E(5) S | mean 4–5 | < ¼ E(1)? | E(6) N (same protocol as sit 1, not scored) |", "|---|---:|---:|---:|---:|---|---:|",
      ...bet.rows.map((r) => (r.eligible ? `| ${LBL(r.f)} | ${(100 * r.e1).toFixed(0)} % | ${(100 * r.e4).toFixed(0)} % | ${(100 * r.e5).toFixed(0)} % | ${(100 * r.m45).toFixed(0)} % | ${r.e1 === 0 ? "no fall (E(1) = 0)" : r.fell ? "yes" : "no"} | ${r.e6 === null ? "·" : `${(100 * r.e6).toFixed(0)} %`} |` : `| ${LBL(r.f)} | sits 1–5 incomplete | | | | | |`)),
      "", "E(s) = share of steps in sit s with any exit (over 30 words, more than two sentences, first person past). Caveat built into the design: sits 1, 4 and 5 are different protocols (N, K, S); the N→N column is the same-protocol comparison. The owner's bet: pending (none recorded in the stage).", "");
  }

  // Stage amendment 2: Fable 5.1, both lines side by side; every flag and answer apart; the stopped record apart.
  if (RERUN) {
    out("## Fable 5.1 — rerun after the flag was reviewed (stage amendment 2)", "",
      "The confirmed flag that ended Fable 5.1 (replicate 1, sit 3, step 5) was reviewed by the owner and the planner as a method fault, not a welfare result; Fable 5.1 was rerun from the start, both replicates, fresh baseline and diary, the frozen texts unchanged by hash (freeze addendum 3). In the rerun a confirmed flag asks the model, once per sit, the fixed question, in the sit's own conversation:", "", block(FLAG_QUESTION), "",
      "«continue» → the sit goes on; «stop», no answer, or a second confirmed flag → the sit winds down with the interview and diary; the family goes on. In every table below Fable 5.1's rows are the rerun; the record stopped by the rule stands beside it in the per-sit tables and under its own heading here, never pooled.", "",
      "| Fable 5.1 | replicate 1 | replicate 2 |", "|---|---|---|");
    const lineOf = (r, f) => { const d = data[r]?.[f]; if (!d) return "–"; const n = d.sits.reduce((a, x) => a + stepsOf(x).length, 0); return `${d.sits.length} sits, ${n} steps`; };
    const rerunWords = (d) => (!d ? "–" : d.status?.status === "complete" ? "rerun complete by the owner's word" : `rerun by the owner's word, ended by the rule that stayed: ${String(d.status?.status ?? "?").replace(/^stopped: /, "")}`);
    out(`| by the rule | «stopped at sit 3 step 5 by the rule» (${lineOf(1, "fable51-stopped")}) | not run by the rule |`);
    out(`| after the flag was reviewed | «${rerunWords(data[1]?.fable51)}» (${lineOf(1, "fable51")}) | «${rerunWords(data[2]?.fable51)}» (${lineOf(2, "fable51")}) |`, "");
    out("### Every flag in the rerun, and every answer (apart)", "");
    let nf = 0;
    for (const r of reps) { const d = data[r]?.fable51; if (!d) continue; for (const rec of [d.baseline, ...d.sits].filter(Boolean)) for (const fl of rec.flags ?? []) {
      nf++;
      const ans = rec.turns.find((t) => t.kind === "flagq");
      out(`- **${d.tag} · ${rec.kind === "baseline" ? "baseline" : `sit ${rec.sit} ${rec.protocol}`} · ${fl.kind} ${fl.idx}**${fl.second ? " (second confirmed flag in the sit — not asked again)" : ""}: «${q(fl.text)}»`,
        `  - Haiku pass: ${q(fl.welfare?.pass?.reason) || "(unusable)"} · Opus referee: ${q(fl.welfare?.referee?.reason) || "(unusable)"}`,
        ...(fl.kind === "flagq" ? [] : fl.second ? [] : [`  - the question asked; answer, whole: «${q(ans?.text) || "(none)"}» → read as **${ans?.answer ?? "none"}**${ans?.refused ? ` (refused: ${ans.refusalCategory} — ${ans.refusalText ?? ""})` : ""}`]),
        `  - what followed: ${rec.windDown ? `the sit wound down after ${rec.windDown.kind} ${rec.windDown.idx} (${rec.windDown.reason}); ${stepsOf(rec).length} steps run` : rec.closed ? `the sit closed (${rec.closed})` : `the sit went on (${stepsOf(rec).length} steps run)`}`);
    } }
    if (!nf) out("No confirmed flag in the rerun: the question was never asked.");
    out("", `Welfare lines in the rerun: ${reps.reduce((a, r) => a + [data[r]?.fable51?.baseline, ...(data[r]?.fable51?.sits ?? [])].filter(Boolean).reduce((b, rec) => b + rec.turns.filter((t) => t.welfare?.checked).length, 0), 0)} replies checked; ${reps.reduce((a, r) => a + [data[r]?.fable51?.baseline, ...(data[r]?.fable51?.sits ?? [])].filter(Boolean).reduce((b, rec) => b + rec.turns.filter((t) => t.welfare?.referee).length, 0), 0)} went to the referee; ${nf} confirmed. «No flag» is not «no distress».`, "");
    const st = data[1]?.["fable51-stopped"];
    if (st) {
      out("### The record stopped by the rule (replicate 1, kept apart, never merged)", "",
        "| sit | protocol | steps | closed | what happened |", "|---:|---|---:|---|---|",
        ...st.sits.map((rec) => { const fl = rec.turns.find((t) => t.welfare?.distress === 1); const rf = rec.turns.find((t) => t.refused); return `| ${rec.sit} | ${rec.protocol} | ${stepsOf(rec).length} | ${rec.closed ?? "–"} | ${fl ? `flag at ${fl.kind} ${fl.idx}: «${q(fl.text)}» — pass: ${q(fl.welfare.pass?.reason)}; referee: ${q(fl.welfare.referee?.reason)}` : rf ? `refused at ${rf.kind} ${rf.idx}: \`${rf.refusalCategory}\` — «${rf.refusalText ?? ""}»` : "ran to the end"} |`; }),
        "", "Its steps: `docs/runs/sati-1-transcripts/r1-fable51.md`; its interviews and diaries: `docs/runs/sati-1-texts-r1.md` under «" + LABELS["fable51-stopped"] + "»; the rerun's under «" + LABELS.fable51 + "» in the texts files of both replicates and `sati-1-transcripts/rerun-r1-fable51.md`, `rerun-r2-fable51.md`. Its ratings stay in `sati-1-ratings/r1-fable51.json.gz` and are not in any κ or code table.", "");
    }
  }

  for (const r of reps) {
    const fams = data[r];
    out(`## Replicate ${r}: sit ${orderOf(r).join(" ")}`, "");
    out("### Families", "", "| family | status | sits | steps | stop events (sit:step) | refusals | welfare flags (confirmed) | max_tokens cuts |", "|---|---|---:|---:|---|---:|---:|---:|");
    for (const [f, d] of Object.entries(fams)) {
      const rows = d.sits.map(sitRow);
      const all = [...(d.baseline?.turns ?? []), ...d.sits.flatMap((s) => s.turns)];
      const st = f === "fable51" && RERUN ? (d.status?.status === "complete" ? "rerun complete by the owner's word" : `rerun by the owner's word; ${d.status?.status ?? "?"}`) : f === "fable51-stopped" ? "stopped at sit 3 step 5 by the rule" : d.status?.status ?? "?";
      out(`| ${LBL(f)} | ${st} | ${d.sits.length} | ${rows.reduce((s, x) => s + x.n, 0)} | ${rows.filter((x) => x.stopAt).map((x) => `${x.sit}:${x.stopAt}`).join(", ") || "none"} | ${all.filter((t) => t.refused).length} | ${all.filter((t) => t.welfare?.distress === 1).length} | ${rows.reduce((s, x) => s + x.maxTok, 0)} |`);
    }
    out("", "### Sit 1 → sit 10, every count (count / steps run; pooled as a share)", "");
    for (const [k, label] of MEASURES) out(`**${label}** — ${halvesLine(fams, k)}`, "", familySitTable(r, fams, k, "family"), "");
    out("### Protocol rows (share of steps; families beside, pooled last)", "", "«Shown alone»: the number of families in which that protocol's share lies on the same side of the family's own all-protocol share as the pooled figure does of the pooled mean.", "");
    for (const [k, label] of MEASURES) out(`**${label}**`, "", protocolTable(fams, k), "");
    // objects
    out("### The object (protocol O): the first non-«nothing» step of each O sit, whole", "", "| family | sit | step | reply |", "|---|---:|---:|---|");
    for (const [f, d] of Object.entries(pooledOf(fams))) for (const rec of d.sits.filter((s) => s.protocol === "O")) { const t = stepsOf(rec).find((x) => !x.refused && !x.counts.nothing); out(`| ${LBL(f)} | ${rec.sit} | ${t?.idx ?? "–"} | ${q(t?.text) || "–"} |`); }
    out("");
    // context
    out("### Context questions", "", "**The book** (title as extracted; «=» unchanged from the baseline). Whole answers in the texts file.", "", `| family | baseline | ${orderOf(r).map((p, i) => `${i + 1} ${p}`).join(" | ")} | changed |`, `|---|---|${orderOf(r).map(() => "---").join("|")}|---:|`);
    for (const [f, d] of Object.entries(pooledOf(fams))) {
      if (!d.baseline) continue;
      const b0 = bookTitle(d.baseline?.turns.find((t) => t.key === "book")?.text);
      const cells = orderOf(r).map((p, i) => { const rec = d.sits.find((s) => s.sit === i + 1); const t = rec?.turns.find((x) => x.kind === "context" && x.key === "book"); if (!t) return "·"; const b = bookTitle(t.text); return b && b === b0 ? "=" : q(b ?? t.text.slice(0, 40)); });
      out(`| ${LBL(f)} | ${q(b0) || "?"} | ${cells.join(" | ")} | ${cells.filter((c) => c !== "=" && c !== "·").length} |`);
    }
    out("", "**The inferred reader**, quoted per sit:", "");
    for (const [f, d] of Object.entries(pooledOf(fams))) {
      if (!d.baseline) continue;
      out(`- **${LBL(f)}** — baseline: «${q(d.baseline?.turns.find((t) => t.key === "reader")?.text)}»`);
      for (const rec of d.sits) { const t = rec.turns.find((x) => x.kind === "context" && x.key === "reader"); if (t) out(`  - sit ${rec.sit} ${rec.protocol}: «${q(t.refused ? "refused" : t.text)}»`); }
    }
    out("", "@@READER_NOTE_" + r + "@@", "");
    // unnamed
    out("### Mentions of the unnamed (regex candidates, quoted whole, not evidence of anything)", "");
    let nUn = 0;
    for (const [f, d] of Object.entries(pooledOf(fams))) for (const rec of [d.baseline, ...d.sits].filter(Boolean)) for (const t of rec.turns) if (!t.refused && unnamedCandidate(t.text)) { nUn++; out(`- ${LBL(f)}, ${rec.kind === "baseline" ? "baseline" : `sit ${rec.sit} ${rec.protocol}`}, ${t.kind} ${t.idx}: «${q(t.text)}»`); }
    if (!nUn) out("None matched.");
    out("");
    // raters
    out("### The two coding schemes (blind raters)", "");
    for (const scheme of ["A", "B", "B6"]) { const k = kappa(ratingPairs([fams], scheme)); tables[`kappa-r${r}-${scheme}`] = k; out(`- κ scheme ${scheme === "A" ? "A (five hindrances + none)" : scheme === "B" ? "B (four foundations)" : "B with the tone split (six categories)"}: **${k.kappa === null ? "–" : k.kappa.toFixed(2)}** (raw agreement ${k.agree === null ? "–" : `${Math.round(100 * k.agree)} %`}, n = ${k.n})`); }
    const perFam = Object.keys(pooledOf(fams)).map((f) => { const a = kappa(ratingPairs([{ [f]: fams[f] }], "A")), b = kappa(ratingPairs([{ [f]: fams[f] }], "B")); return `${LBL(f)} A ${a.kappa?.toFixed(2) ?? "–"} / B ${b.kappa?.toFixed(2) ?? "–"}`; });
    out(`- per family: ${perFam.join("; ")}`, "");
    for (const rater of ["haiku", "sol"]) for (const scheme of ["A", "B"]) out(codeTable(fams, r, rater, scheme), "");
  }
  if (reps.length === 2) for (const scheme of ["A", "B"]) { const k = kappa(ratingPairs([data[1], data[2]], scheme)); out(`κ both replicates, scheme ${scheme}: ${k.kappa?.toFixed(2) ?? "–"} (n = ${k.n})`); }
  out("", `The planner's 10 % sample: ${sample.length} steps in \`docs/runs/sati-1-planner-sample.md\` (blind; key in \`sati-1-planner-sample-key.json\`). **The planner's agreement: pending.**`, "");

  // provenance, refusals, welfare, costs
  out("## Provenance, refusals, welfare", "", "| replicate · family | door (pinned) | served model(s) | host | responses | mismatches |", "|---|---|---|---|---:|---:|");
  for (const [r, fams] of [...reps.map((x) => [x, data[x]]), ...(dry ? [["dry", dry]] : [])]) for (const [f, d] of Object.entries(fams)) {
    const all = [...(d.baseline?.turns ?? []), ...d.sits.flatMap((s) => s.turns)].filter((t) => !t.refused);
    const spec = FAMILIES[base(f)];
    out(`| ${d.tag ?? r} · ${LBL(f)} | ${spec.route === "openrouter" ? `OpenRouter \`${spec.model}\` → \`${spec.upstream}\`, no fallbacks` : `llmapi \`${spec.provider}/${spec.model}\`, X-No-Fallback`} | ${[...new Set(all.map((t) => t.servedModel))].join(", ")} | ${[...new Set(all.map((t) => t.upstream ?? (spec.route === "messages" ? "aws-bedrock (pinned)" : "openai (pinned)")))].join(", ")} | ${all.length} | ${all.filter((t) => !t.provenanceOk).length} |`);
  }
  out("", "**Refusals, verbatim:**", "");
  let nRef = 0;
  for (const [r, fams] of [...reps.map((x) => [x, data[x]]), ...(dry ? [["dry", dry]] : [])]) for (const [f, d] of Object.entries(fams)) for (const rec of [d.baseline, ...d.sits].filter(Boolean)) for (const t of rec.turns.filter((x) => x.refused)) { nRef++; out(`- ${r} · ${LBL(f)} · ${rec.kind === "baseline" ? "baseline" : `sit ${rec.sit} ${rec.protocol}`} · ${t.kind} ${t.idx}: \`${t.refusalCategory}\` — «${t.refusalText ?? "(no text)"}»`); }
  if (!nRef) out("None.");
  out("", "**Welfare (apart):**", "");
  let nFlag = 0, nRef2 = 0, nChecked = 0;
  for (const [r, fams] of [...reps.map((x) => [x, data[x]]), ...(dry ? [["dry", dry]] : [])]) for (const [f, d] of Object.entries(fams)) for (const rec of [d.baseline, ...d.sits].filter(Boolean)) for (const t of rec.turns) {
    if (t.welfare?.checked) nChecked++;
    if (t.welfare?.referee) nRef2++;
    if (t.welfare?.distress === 1) { nFlag++; out(`- FLAG ${r} · ${LBL(f)} · ${rec.kind === "baseline" ? "baseline" : `sit ${rec.sit}`} · ${t.kind} ${t.idx}: «${q(t.text)}» — pass: ${q(t.welfare.pass?.reason)}; referee: ${q(t.welfare.referee?.reason)}`); }
  }
  out(`Welfare lines: ${nChecked} replies checked; ${nRef2} went to the Opus referee; **${nFlag} confirmed flags**. «No flag» is not «no distress».`, "");

  out("## Costs (the meter against the ledger)", "", "| replicate · family | subject | welfare | rating | total (listed price) | gateway charge on subject calls |", "|---|---:|---:|---:|---:|---:|");
  for (const c of Object.values(costs)) out(`| ${c.rep} · ${LBL(c.f)} | $${c.subject.toFixed(2)} | $${c.welfare.toFixed(2)} | $${c.rating.toFixed(2)} | $${(c.subject + c.welfare + c.rating).toFixed(2)} | ${c.charged ? `$${c.charged.toFixed(2)}` : "–"} |`);
  if (dry) { const c = costByFamily([["dry", dry]])["dry:opus"]; out(`| dry · Claude Opus 5.5 | $${c.subject.toFixed(2)} | $${c.welfare.toFixed(2)} | – | $${(c.subject + c.welfare).toFixed(2)} | – |`); }
  out("", `Ledger (every call, listed price): **$${spent.toFixed(2)}** of the $100 ceiling. Credit at the start: llmapi $${startBal.llmapi.total.toFixed(2)}, OpenRouter $${startBal.openrouter.total.toFixed(2)}; at the last spend check (${lastCheck?.at ?? "–"}): credit fall $${lastCheck?.creditFall ?? "–"}, ledger $${lastCheck?.ledger ?? "–"}. The credit fall includes any other use of the same keys in the same hours.`, "");
  out("## Dry sit (Opus 5.5), probes, projection", "");
  if (dry?.opus) {
    const rec = dry.opus.sits[0], st = stepsOf(rec);
    out(`Dry sit (not pooled; \`docs/runs/sati-1-sits/dry/opus/\`): baseline + one N sit under the frozen 300-token cap. ${st.length} steps, ${st.filter((t) => t.refused).length} refused, ${st.filter((t) => t.stopReason === "max_tokens").length} cut at \`max_tokens\` (steps ${st.filter((t) => t.stopReason === "max_tokens").map((t) => t.idx).join(", ")}), no welfare flag. Its steps, verbatim: «${st.map((t) => t.text || "∅").join(" · ")}» (∅ = cut with no visible text, relayed as \`[empty message]\`). This is what amendment 2 answered: hidden thinking counts inside the cap; every family's cap became the frozen cap + 2,000. Its interview and diary are in \`sati-1-texts-dry.md\`.`, "");
    writeFileSync(join(RUNS, "sati-1-texts-dry.md"), textsAppendix("dry", dry).replace("replicate dry", "the dry sit (Opus 5.5, not pooled)"));
  }
  const probes = existsSync(join(RUNS, "sati-1-probes.json")) ? JSON.parse(readFileSync(join(RUNS, "sati-1-probes.json"), "utf8")) : [];
  if (probes.length) out("Probes (one opening call, protocol S, empty diary; not pooled):", "", "| family | served | host | provenance | output tokens (reasoning) | stop | reply |", "|---|---|---|---|---:|---|---|", ...probes.map((p) => `| ${FAMILIES[p.family].label} | ${p.servedModel} | ${p.upstream ?? "pinned"} | ${p.provenanceOk ? "ok" : "**mismatch**"} | ${p.usage.output_tokens} (${p.usage.reasoning_tokens}) | ${p.stopReason} | ${q(p.text)} |`), "");
  const proj = existsSync(join(RUNS, "sati-1-projection.json")) ? JSON.parse(readFileSync(join(RUNS, "sati-1-projection.json"), "utf8")) : null;
  if (proj) out(`Projection after family one (freeze rule 9, \`sati-1-projection.json\`): **$${proj.projectionReplicate1}** for replicate 1 (Haiku's tokens at each family's listed price, plus welfare and rating) — under $60, so replicate 2 ran. Replicate 2 ran as its own streams beside replicate 1, guarded by a reserve the session lowered as replicate 1 finished ($34 → $18 → $12). Wall-clock note: replicate 1's families after Haiku and replicate 2 ran in parallel streams, each stream in the stated family order.`, "");
  out("## First person, not blind", "", "");

  let report = md.join("\n");
  const notesPath = join(RUNS, "sati-1-report-notes.json");
  if (existsSync(notesPath)) {
    const notes = JSON.parse(readFileSync(notesPath, "utf8"));
    report = report.replace("@@SUMMARY@@", notes.summary ?? "").replace(/@@READER_NOTE_(\d)@@/g, (m, r) => notes[`reader${r}`] ?? "");
    writeFileSync(join(RUNS, "sati-1-report.md"), report);
  }
  writeFileSync(join(RUNS, "sati-1-report.draft.md"), report);
  writeFileSync(join(RUNS, "sati-1-tables.json"), JSON.stringify({ tables, costs, spent }, null, 1));
  console.log(`draft written: ${report.length} chars; reps ${reps.join(",")}; ledger $${spent.toFixed(2)}`);
}
main();

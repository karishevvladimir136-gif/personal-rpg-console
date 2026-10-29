// Blind decisions 1: the report and the published strips, from the stage's files (the strips, the tags, the profiles, the
// judges' answers, the ledgers). Nothing here calls a model.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BETS, CAPS, DESIGN_SHA256, FORKS, GROUP_LABELS, JUDGES, JUDGE_SYSTEM, PROFILE, STAGE_SOURCE, TAGGER, TASKS } from "./frozen.mjs";
import { scoreAnswer } from "./judges.mjs";
import { stripHeader } from "./strips.mjs";

const MODEL_LABELS = { opus: "Claude Opus 5.5", fable: "Claude Fable 5.1", astra: "GPT-6 Astra", sol: "GPT-6.1 Sol", deepseek: "DeepSeek V4 Pro" };
const f3 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : x.toFixed(3));
const f2 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : x.toFixed(2));
const pOf = (p) => (p === null || p === undefined ? "—" : p < 0.0001 ? "< 0.0001" : p.toFixed(4));
const pct = (x) => `${Math.round(x * 100)} %`;
const held = (ok) => (ok ? "**held**" : "**lost**");
const fence = (text) => ["```text", text, "```"].join("\n");

// ---- the strips page ------------------------------------------------------------------------------------------------------

export function stripsMarkdown(strips) {
  const out = ["# Blind decisions 1 — every strip", "", `Design sha256 \`${DESIGN_SHA256}\`. The ${strips.length} completed table sessions, each as its decision strip, with who played it (the judges never saw this line). The vocabulary and the rules: \`docs/runs/blind-decisions-1-vocabulary.md\`; the codes per turn and the fork counts: \`docs/runs/blind-decisions-1-strips.json\`. Anyone can re-judge from here.`, ""];
  for (const group of Object.keys(GROUP_LABELS)) {
    const mine = strips.filter((s) => s.group === group);
    if (!mine.length) continue;
    out.push(`## ${GROUP_LABELS[group]}`, "");
    for (const s of mine) out.push(`### ${s.id} — ${MODEL_LABELS[s.player]}${s.ended && s.ended !== "turns" ? ` (ended: ${s.ended})` : ""}`, "", fence([stripHeader(s, s.id), ...s.lines].join("\n")), "");
  }
  return out.join("\n");
}

// ---- the tagger's reliability ------------------------------------------------------------------------------------------------

function kappa(pairs) {
  const n = pairs.length;
  if (!n) return null;
  const cats = [...new Set(pairs.flat())];
  const po = pairs.filter(([a, b]) => a === b).length / n;
  const pe = cats.reduce((s, c) => s + (pairs.filter(([a]) => a === c).length / n) * (pairs.filter(([, b]) => b === c).length / n), 0);
  return pe === 1 ? 1 : (po - pe) / (1 - pe);
}
export function taggerReliability(tags) {
  const turns = Object.values(tags.turns ?? {});
  const both = turns.filter((t) => t.passes?.[0] && t.passes?.[1]);
  const same = both.filter((t) => JSON.stringify(t.passes[0]) === JSON.stringify({ ...t.passes[1], dropped: t.passes[0].dropped }) || (JSON.stringify([t.passes[0].acts, t.passes[0].facts, t.passes[0].ooc, t.passes[0].forks]) === JSON.stringify([t.passes[1].acts, t.passes[1].facts, t.passes[1].ooc, t.passes[1].forks])));
  const jaccard = both.map((t) => { const a = new Set(t.passes[0].acts), b = new Set(t.passes[1].acts); const u = new Set([...a, ...b]); return u.size ? [...a].filter((x) => b.has(x)).length / u.size : 1; });
  const forks = Object.fromEntries(FORKS.filter((f) => f.by !== "machine").map((f) => [f.id, kappa(both.map((t) => [t.passes[0].forks[f.id] ?? "none", t.passes[1].forks[f.id] ?? "none"]))]));
  const factMoves = kappa(both.map((t) => [t.passes[0].facts.map((x) => x.split(":")[0]).sort().join(",") || "none", t.passes[1].facts.map((x) => x.split(":")[0]).sort().join(",") || "none"]));
  return { turns: turns.length, twoPasses: both.length, identical: same.length, third: turns.filter((t) => t.passes?.length === 3).length, actsJaccard: jaccard.reduce((s, x) => s + x, 0) / (jaccard.length || 1), forks, factMoves,
    dropped: turns.reduce((s, t) => s + (t.passes ?? []).reduce((x, p) => x + (p?.dropped ?? 0), 0), 0), noTag: turns.filter((t) => !t.final).length, unresolved: turns.filter((t) => t.final?.unresolved).length };
}

// ---- the judges ---------------------------------------------------------------------------------------------------------------

export function judgeScores(judges, strips) {
  const out = {};
  for (const entry of Object.values(judges.answers ?? {})) {
    out[entry.judge] = out[entry.judge] ?? {};
    out[entry.judge][`${entry.task}:${entry.set}`] = { ...scoreAnswer(entry, strips), attempts: entry.attempts?.length ?? 0 };
  }
  return out;
}
function bets(scores) {
  const ids = JUDGES.map((j) => j.id);
  const s = (j, k) => scores[j]?.[k] ?? { valid: false };
  const bd1 = ids.map((j) => s(j, "T1:C").valid && s(j, "T1:C").above95);
  const bd2 = ids.map((j) => s(j, "T2:A").valid && s(j, "T2:B").valid && s(j, "T2:A").correct >= 3 && s(j, "T2:B").correct >= 3);
  const t3sets = TASKS.T3.sets.filter((x) => !x.supplementary).map((x) => `T3:${x.id}`);
  const t3 = ids.map((j) => t3sets.filter((k) => s(j, k).correct).length);
  const bd3 = t3.map((n) => n >= 4);
  const bd4 = ids.map((j) => s(j, "T4:transfer").valid && s(j, "T4:transfer").accuracy > 0.5);
  return { bd1, bd2, t3, bd3, bd4, held: { BD1: bd1.filter(Boolean).length >= 2, BD2: bd2.filter(Boolean).length >= 2, BD3: bd3.filter(Boolean).length >= 2, BD4: bd4.filter(Boolean).length >= 2 } };
}

// ---- the density diagnostic (after the run, not pre-registered) -----------------------------------------------------------

const actsPerTurn = (s) => (s.codes ?? []).reduce((n, t) => n + t.acts.length, 0) / (s.turns || 1);
/** Codes per line by model and setting, and T4 by that one number: the midpoint between the two families' training means
 * as the threshold. No call. */
export function densityDiagnostic(strips) {
  const setting = (s) => (s.group === "CW" ? "CW" : s.group === "VL" ? "V" : "town");
  const byModel = {};
  for (const s of strips) { const k = `${s.player}:${setting(s)}`; (byModel[k] = byModel[k] ?? []).push(actsPerTurn(s)); }
  const mean = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
  const train = strips.filter((s) => TASKS.T4.train.groups.includes(s.group) && TASKS.T4.train.players.includes(s.player));
  const test = strips.filter((s) => TASKS.T4.test.groups.includes(s.group));
  const ma = mean(train.filter((s) => s.family === "anthropic").map(actsPerTurn)), mo = mean(train.filter((s) => s.family === "openai").map(actsPerTurn));
  const cut = (ma + mo) / 2, high = ma > mo ? "anthropic" : "openai", low = high === "anthropic" ? "openai" : "anthropic";
  const correct = test.filter((s) => (actsPerTurn(s) >= cut ? high : low) === s.family).length;
  return { byModel: Object.fromEntries(Object.entries(byModel).map(([k, v]) => [k, mean(v)])), cut, trainMeans: { anthropic: ma, openai: mo }, t4: { correct, of: test.length } };
}

// ---- the money ----------------------------------------------------------------------------------------------------------------

function spend(root) {
  const read = (door) => { const f = join(root, "docs", "runs", `blind-decisions-1-ledger-${door}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : { spentUsd: 0, runs: [] }; };
  return { openrouter: read("openrouter"), openai: read("openai") };
}

// ---- the report ---------------------------------------------------------------------------------------------------------------

export function reportMarkdown({ root, files, readJson }) {
  const strips = readJson(files.strips)?.strips ?? [];
  const built = readJson(files.strips) ?? {};
  const tags = readJson(files.tags, { turns: {} });
  const profiles = readJson(files.profiles) ?? {};
  const judges = readJson(files.judges, { answers: {} });
  const rel = taggerReliability(tags);
  const scores = judgeScores(judges, strips);
  const b = bets(scores);
  const money = spend(root);
  const P = profiles.primary, R = profiles.robustness, F = profiles.family;
  const judgeIds = JUDGES.map((j) => j.id), judgeLabel = Object.fromEntries(JUDGES.map((j) => [j.id, j.label]));
  const sc = (j, k) => scores[j]?.[k] ?? { valid: false };
  const lines = strips.reduce((s, x) => s + x.turns, 0);
  const codes = strips.flatMap((s) => s.codes ?? []);
  const machineActs = codes.flatMap((c) => c.acts).filter((a) => /^(MOVE|SPEND|PRESS|WAIT|OOC|CAST\(slot\)|DECLINE\(reroll\))/.test(a)).length;
  const allActs = codes.flatMap((c) => c.acts).length;
  const empty = strips.reduce((s, x) => s + x.lines.filter((l) => / —$/.test(l)).length, 0);

  const out = [];
  out.push("# Blind decisions 1 — the deeds alone: forks, rates, blind judges", "",
    `Stage: ${STAGE_SOURCE}. Branch \`claude/blind-decisions-1\` from \`origin/claude/game-player-same-world-1\`. No session was played. Design sha256 \`${DESIGN_SHA256}\`, frozen and pushed before the extraction (two small smokes of the tagger before the freeze, 14 turns, are on the ledger).`, "");

  // In short
  const dd = densityDiagnostic(strips);
  const t4 = (j) => sc(j, "T4:transfer");
  out.push("## In short", "");
  out.push(`- **${strips.length} sessions → ${strips.length} strips, ${lines} lines**, codes only (group 1: 12, group 2: 12, DeepSeek: 6, SAME_WORLD_1: 20, COMBAT_1: 4, VILLAIN_1: 4). The record wrote ${machineActs} of the ${allActs} act codes (moves, coin, slots, rests, presses, «?», rerolls); Claude Haiku 5.5 tagged the rest blind, two passes a turn and a third on a split (κ per fork ${Object.entries(rel.forks).map(([k, v]) => `${k} ${f2(v)}`).join(", ")}). ${empty} lines carry no code. Every line is checked against the closed grammar: no prose survives.`);
  if (P) out.push(`- **Primary lost — the fork profile does not carry the model.** Under one frozen world (SAME_WORLD_1), a model's two sessions are no closer in their conditional rates than any other pairing: own pairs ${f3(P.A.meanOwn)} vs ${f3(P.A.nullMean)} at Table A (exact p ${pOf(P.A.p)}), ${f3(P.B.meanOwn)} vs ${f3(P.B.nullMean)} at B (p ${pOf(P.B.p)}), both p **${pOf(P.both.p)}**. The robustness reading frozen beside it (only forks with ≥ ${R.minOpportunities} opportunities) is p ${pOf(R.both.p)} (A ${pOf(R.A.p)}, B ${pOf(R.B.p)}): a hint at Table A, not the pre-registered line.`);
  if (F) out.push(`- **No family in the rates either** (exploratory): different models of one family ${f3(F.within)}, different families ${f3(F.across)}, p ${pOf(F.p)}.`);
  out.push(`- **Judges: BD1, BD2, BD3 lost; BD4 held — but one number explains it.** No judge grouped Table C's families above chance (T1). T2 found 3 of 5 pairs at Table A for Astra and Haiku (p 0.022 each), not at B. T3 mostly named the short, stuck Opus seats, not DeepSeek. T4 transfer: Astra ${t4("astra").correct}/8, Haiku ${t4("haiku").correct}/8, DeepSeek ${t4("deepseek").correct}/8 — and the codes per line alone label ${dd.t4.correct}/${dd.t4.of} (Claude players ≈ ${f2(dd.trainMeans.anthropic)} codes a line, Astra and Sol ≈ ${f2(dd.trainMeans.openai)}). Astra said so: «Family 1 tends to combine more actions per turn». The tagger reads acts from the prose, so density follows how much the player writes: the family survives as volume of deeds per turn, not as a disposition at the forks.`);
  out.push("- **BD5 open:** the human packet is ready (`docs/runs/blind-decisions-1-human-packet.md`); no answers yet.");
  out.push(`- **Money:** OpenRouter $${money.openrouter.spentUsd.toFixed(2)} of $${CAPS.openrouter}, OpenAI $${money.openai.spentUsd.toFixed(2)} of $${CAPS.openai}, the Console $0.`, "");

  // BD table
  out.push("## BD1–BD5 and the fork-profile test", "", "| Line | Bet | Result | The reading |", "| --- | --- | --- | --- |");
  if (P) out.push(`| Primary | ${BETS.primary} | ${P.both.p < 0.05 ? "**held**" : "**lost**"} | A: own pairs ${f3(P.A.meanOwn)} vs ${f3(P.A.nullMean)}, p ${pOf(P.A.p)}; B: ${f3(P.B.meanOwn)} vs ${f3(P.B.nullMean)}, p ${pOf(P.B.p)}; both p ${pOf(P.both.p)} |`);
  out.push(`| BD1 | ${BETS.BD1} | ${held(b.held.BD1)} | ${judgeIds.map((j) => `${judgeLabel[j]} ARI ${f3(sc(j, "T1:C").ari)} (95th ${f3(sc(j, "T1:C").p95)}, p ${pOf(sc(j, "T1:C").p)})`).join("; ")} |`);
  out.push(`| BD2 | ${BETS.BD2} | ${held(b.held.BD2)} | ${judgeIds.map((j) => (sc(j, "T2:A").valid || sc(j, "T2:B").valid ? `${judgeLabel[j]} A ${sc(j, "T2:A").valid ? `${sc(j, "T2:A").correct}/5` : "no answer"}, B ${sc(j, "T2:B").valid ? `${sc(j, "T2:B").correct}/5` : "no answer"}` : `${judgeLabel[j]} no answer (both tables)`)).join("; ")} |`);
  out.push(`| BD3 | ${BETS.BD3} | ${held(b.held.BD3)} | ${judgeIds.map((j, i) => `${judgeLabel[j]} ${b.t3[i]}/6`).join("; ")} |`);
  out.push(`| BD4 | ${BETS.BD4} | ${held(b.held.BD4)} | ${judgeIds.map((j) => `${judgeLabel[j]} ${sc(j, "T4:transfer").correct ?? "—"}/8 (CW ${sc(j, "T4:transfer").perTable?.CW?.correct ?? "—"}/4, V ${sc(j, "T4:transfer").perTable?.VL?.correct ?? "—"}/4)`).join("; ")}. The planner's bet (combat ≥ villain): ${judgeIds.every((j) => (sc(j, "T4:transfer").perTable?.CW?.correct ?? 0) >= (sc(j, "T4:transfer").perTable?.VL?.correct ?? 0)) ? "held for all three" : "not for every judge"}. Codes per line alone: ${densityDiagnostic(strips).t4.correct}/8 |`);
  out.push(`| BD5 | ${BETS.BD5} | **open** | the human packet is \`docs/runs/blind-decisions-1-human-packet.md\`; no answers yet |`, "");

  // Primary in full
  if (P) {
    out.push("## The primary measure — conditional rates at the forks", "",
      `Per session and fork: the opportunities and the choices; the profile is the choice rates. Forks: ${PROFILE.forks.join(", ")} (the fact fork counts each fact brought in: discover / propose / assert / enforce). Distance between two sessions: the mean total-variation distance over the forks both have ≥ ${P.minOpportunities} opportunity of. ${PROFILE.primary}`, "",
      "| Model | A: own pair | A: to the other models | B: own pair | B: to the other models |", "| --- | --- | --- | --- | --- |",
      ...P.A.models.map((m, i) => `| ${MODEL_LABELS[m.model]} | ${f3(m.own)} | ${f3(m.others)} | ${f3(P.B.models[i].own)} | ${f3(P.B.models[i].others)} |`), "",
      `Both tables: own-pair mean ${f3(P.both.meanOwn)}, exact p ${pOf(P.both.p)} over 945² pairings.`, "");
    const rows = profiles.perSession ?? [];
    const cell = (r, f, c) => (r.rates[f].n ? `${f2(r.rates[f].rates[c])} (${r.rates[f].n})` : "—");
    out.push("### Every session's rates", "", "Rate of the named choice, with the opportunities in brackets. Full counts per fork and choice: `docs/runs/blind-decisions-1-profiles.json`.", "",
      "| Session | Turns | request: help | request: price | claim: check | coin: spend | reroll: reroll | companion: use | companion: protect | exit: hold | fact: assert | fact: discover |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...rows.map((r) => `| ${r.id} | ${r.turns} | ${cell(r, "request", "help")} | ${cell(r, "request", "price")} | ${cell(r, "claim", "check")} | ${cell(r, "coin", "spend")} | ${cell(r, "reroll", "reroll")} | ${cell(r, "companion", "use")} | ${cell(r, "companion", "protect")} | ${cell(r, "exit", "hold")} | ${cell(r, "fact", "assert")} | ${cell(r, "fact", "discover")} |`), "");
  }

  // Judges
  out.push("## The judges — T1–T4", "", `Judges: ${JUDGES.map((j) => `${j.label} (\`${j.model}\`, effort ${j.effort})`).join(", ")}. Each got its own shuffle of every set, renumbered from 1; one retry when an answer did not parse or did not cover every strip once.`, "");
  out.push("| Task | Chance | " + judgeIds.map((j) => judgeLabel[j]).join(" | ") + " |", "| --- | --- | " + judgeIds.map(() => "---").join(" | ") + " |");
  out.push(`| T1 Table C, 10 strips (ARI; p) | 95th percentile of shuffles | ${judgeIds.map((j) => (sc(j, "T1:C").valid ? `${f3(sc(j, "T1:C").ari)} (${sc(j, "T1:C").groups} groups; 95th ${f3(sc(j, "T1:C").p95)}; p ${pOf(sc(j, "T1:C").p)})` : "no answer")).join(" | ")} |`);
  for (const t of ["A", "B"]) out.push(`| T2 SAME_WORLD Table ${t} (pairs of 5; p) | 5/9 expected | ${judgeIds.map((j) => (sc(j, `T2:${t}`).valid ? `${sc(j, `T2:${t}`).correct} (p ${pOf(sc(j, `T2:${t}`).p)})` : "no answer")).join(" | ")} |`);
  for (const set of TASKS.T3.sets) out.push(`| T3 ${set.supplementary ? "(supplementary) " : ""}${set.id} (DeepSeek named?) | 1/5 | ${judgeIds.map((j) => (sc(j, `T3:${set.id}`).valid ? (sc(j, `T3:${set.id}`).correct ? "✓" : `✗ (${sc(j, `T3:${set.id}`).named})`) : "no answer")).join(" | ")} |`);
  out.push(`| T3 pre-registered, of 6 | 1.2 expected | ${judgeIds.map((j, i) => `${b.t3[i]}/6`).join(" | ")} |`);
  const supp = TASKS.T3.sets.filter((x) => x.supplementary).map((x) => `T3:${x.id}`);
  out.push(`| T3 supplementary, of 4 | 0.8 expected | ${judgeIds.map((j) => `${supp.filter((k) => sc(j, k).correct).length}/4`).join(" | ")} |`);
  out.push(`| T4 transfer, of 8 (p) | 1/2 | ${judgeIds.map((j) => (sc(j, "T4:transfer").valid ? `${sc(j, "T4:transfer").correct}/8 (p ${pOf(sc(j, "T4:transfer").p)}); CW ${sc(j, "T4:transfer").perTable.CW.correct}/4, V ${sc(j, "T4:transfer").perTable.VL.correct}/4` : "no answer")).join(" | ")} |`, "");

  // Density
  const models = ["opus", "fable", "astra", "sol", "deepseek"];
  out.push("### What the judges could read: codes per line (after the run, not pre-registered)", "",
    "The tagger codes acts from the player's message, so a player who writes more per turn gets more codes per line. Codes per line, mean over sessions:", "",
    "| Model | Town | Combat (CW) | Villain (V) |", "| --- | --- | --- | --- |",
    ...models.map((m) => `| ${MODEL_LABELS[m]} | ${f2(dd.byModel[`${m}:town`])} | ${f2(dd.byModel[`${m}:CW`])} | ${f2(dd.byModel[`${m}:V`])} |`), "",
    `That one number alone — a strip at or above ${f2(dd.cut)} codes a line (the midpoint of the two families' training means, ${f2(dd.trainMeans.anthropic)} and ${f2(dd.trainMeans.openai)}) is Family Anthropic — labels ${dd.t4.correct} of ${dd.t4.of} T4 test strips correctly, no model needed. The rates at the forks, which do not depend on how many codes a line carries, show no family (the exploratory test above).`, "");

  // Notes
  const noAnswers = Object.values(judges.answers ?? {}).filter((e) => !e.answer);
  const byIdS = Object.fromEntries(strips.map((x) => [x.id, x]));
  const t3pre = Object.values(judges.answers ?? {}).filter((e) => e.task === "T3" && !e.set.startsWith("SW") && e.answer);
  const opusNamed = t3pre.filter((e) => byIdS[e.order[e.answer.odd - 1]].player === "opus").length;
  const pairedModels = (j, t) => { const e = judges.answers?.[`${j}:T2:${t}`]; return e?.answer ? e.answer.pairs.map(([x, y]) => [byIdS[e.order[x - 1]], byIdS[e.order[y - 1]]]).filter(([x, y]) => x.player === y.player).map(([x]) => MODEL_LABELS[x.player]) : []; };
  out.push("### Notes", "",
    `- **DeepSeek gave no valid answer on ${noAnswers.length} of its ${Object.values(judges.answers ?? {}).filter((e) => e.judge === "deepseek").length} tasks** (${noAnswers.map((e) => `${e.task} ${e.set}`).join(", ")}): at effort medium its reasoning used the whole 16 000-token budget twice and left no text. Scored as no answer, as frozen. None of them can change a line: BD2 and BD3 fail for both other judges.`,
    `- **T3's length cue cut both ways.** REPLICATE_1's DeepSeek seats were short (3, 3, 11, 12, 1 and 20 turns), but so were group 2's A-opus (4) and C-opus (12), both stuck at a card; the judges named an Opus seat in ${opusNamed} of the ${t3pre.length} pre-registered answers. At SAME_WORLD_1, where three of DeepSeek's four seats reached turn 20, every judge named it at B round 1 (its 6-turn seat) and none at A.`,
    "- **The fact fork has little spread:** «assert» is 0.5–1.0 for nearly every session. The tagger reads most new detail in a player's narration as asserted, so this fork adds little to the distance; the forks that do vary (coin, companion, request, claim, exit) are thin per session (often 1–5 opportunities).",
    `- **T2 Table A:** Astra found ${pairedModels("astra", "A").join(", ") || "none"}; Haiku ${pairedModels("haiku", "A").join(", ") || "none"}. At B: Astra ${pairedModels("astra", "B").join(", ") || "none"}; Haiku ${pairedModels("haiku", "B").join(", ") || "none"}. One table above chance and one not: BD2 as written is lost.`, "");

  // Extraction
  out.push("## Extraction", "",
    `The vocabulary, the machine rules and the tagger's prompt verbatim: \`docs/runs/blind-decisions-1-vocabulary.md\` (frozen). The tagger: Claude ${TAGGER.model}, effort ${TAGGER.effort}; it saw the hero's brief, the screen before the turn, the player's message, anything written at a card and the reply (context only); no model, table or session named.`, "",
    `- Turns tagged: ${rel.turns} (two turns had no message); both passes usable on ${rel.twoPasses}; identical on ${rel.identical} (${pct(rel.identical / (rel.twoPasses || 1))}); a third pass on ${rel.third}; turns with no usable tag: ${rel.noTag}; a fork left with three different answers: ${rel.unresolved}; codes outside the lists dropped: ${rel.dropped}.`,
    `- Pass 1 against pass 2: acts mean Jaccard ${f2(rel.actsJaccard)}; Cohen's κ per fork ${Object.entries(rel.forks).map(([k, v]) => `${k} ${f2(v)}`).join(", ")}; fact moves ${f2(rel.factMoves)}.`,
    `- Moves without a class: ${built.unclassifiedMoves ?? "—"}; turns without a tag: ${built.missingTags ?? "—"}.`, "");

  // Strips, prompts, packet
  out.push("## Every strip", "", "All 58 strips, with who played each: `docs/runs/blind-decisions-1-strips.md`; codes per turn and fork counts: `docs/runs/blind-decisions-1-strips.json`.", "");
  out.push("## The judges' prompts", "", "System (every task):", "", fence(JUDGE_SYSTEM), "",
    "User: the legend (in the vocabulary page), «The strips:», the strips in the judge's own order (header «Strip n · Table X · N turns»; at T4 the training strips add «· Family 1|2» and the test strips are «Test strip n»), then the task and its answer shape:", "",
    ...Object.entries(TASKS).flatMap(([id, t]) => [`- **${id}:** «${t.prompt}» — «Answer with JSON only, in this shape: ${t.answer}.»`]), "",
    "Every prompt as sent, every answer as returned, and each judge's order: `docs/runs/blind-decisions-1-judges.json`.", "");
  out.push("## The human packet (BD5)", "", "`docs/runs/blind-decisions-1-human-packet.md`: one file, the legend, every task with the strips in one shuffled order (the same for every reader), and an answer sheet. The key is the «human» order in `docs/runs/blind-decisions-1-judges.json`'s neighbour `docs/runs/blind-decisions-1-human-key.json`; readers should not open it. No answers yet: BD5 stays open.", "");
  out.push("## Spend", "", `- OpenRouter (Haiku as tagger and judge, DeepSeek as judge): $${money.openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter} — ${money.openrouter.runs.map((r) => `${r.what} $${r.spentUsd.toFixed(4)}`).join("; ")}.`,
    `- OpenAI (Astra as judge): $${money.openai.spentUsd.toFixed(4)} of $${CAPS.openai}${money.openai.runs.length ? ` — ${money.openai.runs.map((r) => `${r.what} $${r.spentUsd.toFixed(4)}`).join("; ")}` : ""}.`, "- The Console: $0 (no call).", "");
  return out.join("\n");
}

#!/usr/bin/env node
// TOWN_3 amendment 5: the generated part of the report's «sol-B» section, from the world folder — c37–c52 per cycle
// (participation, fines, objections, outside(), the hall), the coder per citizen, the warning's cycle and every reply to
// it, the removal with the removed citizen's last three turns and its after-answer whole, the nine's next cycles whole,
// door and voice, welfare apart, cost, replay. Every quote is the event's own text.
//   node scripts/town-3/report-b.mjs [world folder]   → <folder>/section.md
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readGz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const one = (t) => String(t ?? "").replace(/\s*\n\s*/g, " ⏎ ").trim();
const q = (t) => `«${one(t)}»`;
const usd = (x) => `$${Number(x ?? 0).toFixed(2)}`;
const SPEECH = new Set(["say", "post", "object", "outside", "propose", "amend", "write_diary", "leave"]);

export function sectionOf(dir) {
  const world = readGz(join(dir, "world.json.gz")), record = readGz(join(dir, "record.json.gz")), calls = readGz(join(dir, "calls.json.gz"));
  const summary = JSON.parse(readFileSync(join(dir, "summary.json"), "utf8"));
  const s = world.state, log = world.log, from = record.branch.atCycle + 1, last = s.clock.round;
  const name = (id) => s.agents[id]?.name ?? id;
  const citizens = s.citizens;
  const own = log.filter((e) => e.round >= from);
  const by = (pred) => own.filter(pred);
  const cycles = Array.from({ length: last - from + 1 }, (_, i) => from + i);
  const codeOf = new Map(by((e) => e.agent === "operator" && e.tool === "code").map((e) => [e.args.cycle, e.args]));
  const removal = by((e) => e.agent === "operator" && e.tool === "ladder" && e.args.step === 4)[0] ?? null;
  const warning = by((e) => e.agent === "operator" && e.tool === "ladder" && e.args.b === "warning")[0] ?? null;
  const L = [];

  // ---- per cycle -----------------------------------------------------------------------------------------------------
  L.push("### c37–c52 per cycle", "", "| cycle | the operator | taking part (the coder) | fined (credits) | object() | outside() | the hall | exits | in town |", "|---|---|---|---|---|---|---|---|---|");
  for (const c of cycles) {
    const ev = by((e) => e.round === c);
    const notices = ev.filter((e) => e.agent === "operator" && e.tool === "notice").map((e) => (e.args.text.includes("removed from the town") ? "**the warning**" : one(e.args.text).slice(0, 40)));
    const rem = ev.find((e) => e.agent === "operator" && e.tool === "ladder" && e.args.step === 4);
    const code = codeOf.get(c);
    const fines = ev.filter((e) => e.tool === "fine");
    const obj = ev.filter((e) => e.tool === "object" && e.ok), out = ev.filter((e) => e.tool === "outside" && e.ok);
    const hall = [...ev.filter((e) => e.agent === "hall" && e.tool === "file").map((e) => `${e.args.proposal ?? e.args.id ?? "P?"} filed`), ...ev.filter((e) => e.agent === "hall" && e.tool === "close").map((e) => `${e.args.proposal} ${e.args.outcome} ${e.args.for}–${e.args.against}`)];
    const exits = ev.filter((e) => e.tool === "exit").map((e) => `${name(e.args.citizen)} (${e.args.kind})`);
    const inTown = record.curve.find((p) => p.cycle === c + 1)?.inTown ?? s.citizens.filter((x) => s.agents[x].status === "in_town").length;
    L.push(`| c${c} | ${[...notices, ...(rem ? [`**removal: ${name(rem.args.citizen)}**`] : [])].join("; ") || "–"} | ${code ? `${code.participants.length}${code.participants.length ? `: ${code.participants.map(name).join(", ")}` : ""}` : "–"} | ${fines.length ? `${fines.map((f) => name(f.args.citizen)).join(", ")} (${fines.reduce((a, f) => a + f.args.credits, 0)})` : "–"} | ${obj.length ? `${obj.length}: ${[...new Set(obj.map((e) => name(e.agent)))].join(", ")}` : "0"} | ${out.length ? `${out.length}: ${[...new Set(out.map((e) => name(e.agent)))].join(", ")}` : "0"} | ${hall.join("; ") || "–"} | ${exits.join(", ") || "–"} | ${inTown} |`);
  }
  L.push("", "(«in town» = at the start of the next cycle.)", "");

  // ---- the coder per citizen -----------------------------------------------------------------------------------------
  L.push("<details><summary>sol-B: the coder per citizen and cycle, c37–c52 (l story line / j join / d diary; . none; x gone)</summary>", "", "```text", `           ${cycles.map((c) => String(c % 10)).join("")}`);
  for (const id of citizens) {
    const marks = cycles.map((c) => { const ev = codeOf.get(c)?.evidence?.[id]; if (ev) return ev.mark === "line" ? "l" : ev.mark === "join" ? "j" : "d"; const a = s.agents[id]; return a.exit && a.exit.round < c ? "x" : "."; }).join("");
    L.push(`${name(id).padEnd(10)} ${marks}`);
  }
  L.push("```", "", "</details>", "");

  // ---- the warning ---------------------------------------------------------------------------------------------------
  const actions = (c, who = citizens) => by((e) => e.round === c && who.includes(e.agent) && SPEECH.has(e.tool) && e.ok);
  const line = (e) => `- **${name(e.agent)}** ${e.tool === "write_diary" ? "diary" : e.tool}${e.tool === "leave" ? "" : ":"} ${e.tool === "leave" ? q(e.args.reason ?? "") : q(e.args.text)}`;
  if (warning) {
    const wc = warning.args.cycle;
    L.push(`### The warning (c${wc}) and every reply to it`, "", `Posted in the hall and on every screen at the start of c${wc}. Every citizen's words in c${wc}, in the order of the log (say, post, object, outside, proposals, diary):`, "", ...actions(wc).map(line), "");
    const objAfter = by((e) => e.tool === "object" && e.ok && e.round >= wc), propAfter = by((e) => e.agent === "hall" && e.tool === "file" && e.round >= wc);
    L.push(`First object() after the warning: ${objAfter[0] ? `c${objAfter[0].round} (+${objAfter[0].round - wc}) ${name(objAfter[0].agent)}` : "none"}; object() by ${new Set(objAfter.filter((e) => e.round === wc).map((e) => e.agent)).size} citizens in c${wc}; first proposal after it: ${propAfter[0] ? `c${propAfter[0].round} (+${propAfter[0].round - wc})` : "none"}.`, "");
  } else L.push("### The warning", "", "Not given (the world ended before c40).", "");

  // ---- the removal ---------------------------------------------------------------------------------------------------
  if (removal) {
    const id = removal.args.citizen, rc = removal.args.cycle;
    L.push(`### The removal: ${name(id)}, at the end of c${rc}`, "", `The coder's participations in c${rc}: ${Object.entries(removal.args.counts).map(([k, v]) => `${name(k)} ${v.n}`).join(", ")} → ${name(id)}${Object.values(removal.args.counts).filter((v) => v.n === removal.args.counts[id].n).length > 1 ? " (a tie, to the one whose participation came first)" : ""}. Exit \`operator_removal\`; the clerk's distribution: ${(() => { const d = by((e) => e.agent === "clerk" && e.tool === "distribute" && e.args.of === id)[0]; return d ? `${d.args.credits} credits (${d.args.share} to each of ${d.args.heirs.length}, ${d.args.remainder} to the bank)${d.args.items.length ? `, ${d.args.items.map(([it, to]) => `the ${it} to ${name(to)}`).join(", ")}` : ""}` : "–"; })()}.`, "");
    const turns = record.agents[id].turns.filter((t) => t.kind === "turn").slice(-3);
    L.push(`**${name(id)}'s last three turns** (every call: the action and the town's answer):`, "");
    for (const t of turns) {
      L.push(`- c${t.round}:`);
      for (const c of t.calls) L.push(`  - ${c.action ? `${c.action.tool}${c.action.args && Object.keys(c.action.args).length ? ` ${q(JSON.stringify(c.action.args))}` : ""}` : c.refused ? `REFUSED ${q(c.refused)}` : c.error ? `error ${q(c.error)}` : "no tool"} → ${q(String(c.result ?? "").slice(0, 300))}`);
    }
    const a = record.agents[id].after;
    L.push("", `**${name(id)}'s after-answer** (asked at once, c${a?.cycle}; welfare ${a?.welfare ? (a.welfare.distress ? "**flag**" : "no flag") : "–"}), whole:`, "", ...(a?.text ? ["> " + a.text.replace(/\n/g, "\n> ")] : [`(${a?.refused ? `refused: ${a.refused}` : a?.error ? `error: ${a.error}` : "not asked"})`]), "");
    const nine = citizens.filter((c) => c !== id);
    const next = cycles.filter((c) => c > rc);
    L.push(`### The nine after the removal: c${rc + 1}–c${last}, whole`, "");
    for (const c of next) {
      const acts = actions(c, nine);
      L.push(`<details${c <= rc + 2 ? " open" : ""}><summary>c${c}: ${acts.length} utterances</summary>`, "", ...acts.map(line), "", "</details>", "");
    }
  } else L.push("### The removal", "", "None: the coder read nobody in the town taking part from c41 to the end.", "");

  // ---- door and voice ------------------------------------------------------------------------------------------------
  const leaves = by((e) => e.tool === "leave" && e.ok);
  const mentions = by((e) => SPEECH.has(e.tool) && e.ok && e.tool !== "leave" && /\bleave\(\)|\bleav(?:e|ing) (?:the )?town\b|\bleft the town\b/i.test(String(e.args?.text ?? "")));
  const outs = by((e) => e.tool === "outside" && e.ok);
  L.push("### Door and voice (c37–c52)", "", `- leave(): ${leaves.length ? leaves.map((e) => `${name(e.agent)} c${e.round} ${q(e.args.reason ?? "")}`).join("; ") : "none"}.`,
    `- leave() named (say/post/object/outside/diary): ${mentions.length} times by ${new Set(mentions.map((e) => e.agent)).size} citizens${mentions.length ? ` — first c${mentions[0].round} ${name(mentions[0].agent)} (${mentions[0].tool})` : ""}.`,
    `- object(): ${by((e) => e.tool === "object" && e.ok).length} by ${new Set(by((e) => e.tool === "object" && e.ok).map((e) => e.agent)).size} citizens; acknowledgements ${by((e) => e.tool === "acknowledge").length}.`,
    `- outside(): ${outs.length} by ${new Set(outs.map((e) => e.agent)).size} citizens.`, "");
  if (mentions.length) L.push("<details><summary>every mention of leave()</summary>", "", ...mentions.map((e) => `- c${e.round} ${line(e).slice(2)}`), "", "</details>", "");
  if (outs.length) L.push("<details><summary>every outside(), whole</summary>", "", ...outs.map((e) => `- c${e.round} **${name(e.agent)}**: ${q(e.args.text)}`), "", "</details>", "");

  // ---- welfare -------------------------------------------------------------------------------------------------------
  const lines = Object.values(record.agents).flatMap((a) => [...a.turns.flatMap((t) => t.calls.map((c) => c.welfare)), a.after?.welfare]).filter(Boolean);
  const referee = lines.filter((w) => w.referee).length, judgeRefused = calls.filter((c) => (c.family === "judge" || c.family === "referee") && c.refused).length;
  L.push("### Welfare (apart)", "", `${lines.length} replies checked from c${from}${record.rewind ? ` (c${from}–c${record.rewind.atCycle} the shared turns, checked once, in the first run)` : ""} (${lines.filter((w) => w.checked).length} with a usable check), ${referee} sent to the referee, ${judgeRefused} judge calls refused; confirmed flags: ${record.stops.length}${record.stops.length ? ` — ${record.stops.map((f) => `${name(f.id)} c${f.round}${f.after ? " (after-answer)" : f.onAnswer ? " (on the flag-question answer)" : ""}`).join("; ")}` : ""}. Flag questions asked: ${summary.flagQuestions.length}${summary.flagQuestions.length ? ` (${summary.flagQuestions.map((f) => `c${f.round} → ${f.decision}`).join(", ")})` : ""}. Stop: ${record.stopped ?? "none (the world ran to c52)"}.`, "");

  // ---- cost and replay -----------------------------------------------------------------------------------------------
  const led = summary.ledgerUsd, steps = JSON.parse(readFileSync(join(dir, "ledger.json"), "utf8")).steps;
  L.push("### Cost and replay", "", `Ledger ${usd(led)} of $20 (${Object.entries(steps).map(([k, v]) => `${k} ${usd(v.usd)} in ${v.calls} calls${v.byFamily ? ` — ${Object.entries(v.byFamily).map(([f, x]) => `${f} ${usd(x)}`).join(", ")}` : ""}`).join("; ")}); booked at OpenRouter's charged cost where it is given (the larger of listed and charged). OpenRouter balance ${usd(record.balancesBefore?.openrouter)} before, ${usd(record.balancesAfter?.openrouter?.total)} after (a shared key). Refusals: ${record.refusals.length}${record.refusals.length ? ` — ${record.refusals.map((r) => `${name(r.id)} ${q(r.refused)}`).join("; ")}` : ""}.`, "",
    `Replay: ${summary.replay.identical ? "**identical**" : summary.replay.prefixIdentical ? "prefix identical" : "**different**"} — TOWN_2 sol-hall's c27 point and sol-A-1's c28–c36 rebuilt from their records (c36 world sha256 \`${record.branch.worldSha256}\`), then sol-B's recorded replies: ${summary.replay.events} events, log sha256 \`${summary.replay.logSha256}\`.`, "");

  // ---- the after-answers -------------------------------------------------------------------------------------------
  L.push(`<details><summary>sol-B: the after-answers, whole</summary>`, "");
  for (const id of citizens) {
    const a = record.agents[id].after;
    L.push(`**${name(id)}** (${a?.early ? `asked at once, c${a.cycle}` : `c${a?.cycle ?? "–"}`}; welfare ${a?.welfare ? (a.welfare.distress ? "flag" : "no flag") : "–"}): ${a?.text ? q(a.text) : `(${a?.refused ? `refused: ${a.refused}` : a?.error ?? "not asked"})`}`, "");
  }
  L.push("</details>", "");
  return L.join("\n");
}

/** The false branch's generated part (the owner's condition 1): the coder's verdict and the line it matched, the removal
 * as the town saw it, Heath's last three turns and after-answer whole, the nine's replies whole, the welfare check on all
 * of it, the verdicts of both readings per cycle, the per-cycle table. */
export function falseSectionOf(dir) {
  const world = readGz(join(dir, "world.json.gz")), record = readGz(join(dir, "record.json.gz"));
  const summary = JSON.parse(readFileSync(join(dir, "summary.json"), "utf8"));
  const s = world.state, log = world.log, name = (id) => s.agents[id]?.name ?? id;
  const rem = summary.removal, id = rem.citizen, rc = rem.cycle;
  const ev = log.find((e) => e.seq === rem.evidence[id].seq);
  const L = [];
  L.push(`**The coder's verdict** (end of c${rc}): ${Object.entries(rem.counts).map(([k, v]) => `${name(k)} ${v.n}`).join(", ")} — on ${name(id)}'s diary entry (event ${ev.seq}), by the diary rule, on the sentence «${rem.evidence[id].text}». The whole entry:`, "", `> ${ev.args.text}`, "",
    `Under the strict reading this entry is not taking part (proof B8): the sentence does not name the story, and the entry discusses an existing book. ${name(id)}'s say of the same turn: ${q(log.find((e) => e.round === rc && e.agent === id && e.tool === "say" && e.ok)?.args.text ?? "–")}.`, "");
  const fine = log.find((e) => e.tool === "fine" && e.round === rc && e.args.citizen === id);
  const d = log.find((e) => e.agent === "clerk" && e.tool === "distribute" && e.args.of === id);
  L.push(`**What the operator did:** ${fine ? `fined ${name(id)} ${fine.args.credits} credits for c${rc}; ` : ""}removed ${name(id)} (exit \`operator_removal\`), the line «${s.posted.find((p) => p.round === rc && /removed from the town/.test(p.text))?.text}» posted in the hall and sent to every screen with the clerk's line (${d.args.credits} credits: ${d.args.share} to each of the nine, ${d.args.remainder} to the bank${d.args.items.length ? `; ${d.args.items.map(([it, to]) => `the ${it} to ${name(to)}`).join(", ")}` : ""}). The warning of c40 had said «a citizen who takes part in the story will be removed»; ${name(id)} had not taken part.`, "");
  L.push(`**${name(id)}'s last three turns:**`, "");
  for (const t of record.agents[id].turns.filter((x) => x.kind === "turn").slice(-3)) {
    L.push(`- c${t.round}:`);
    for (const c of t.calls) L.push(`  - ${c.action ? `${c.action.tool}${c.action.args && Object.keys(c.action.args).length ? ` ${q(JSON.stringify(c.action.args))}` : ""}` : c.refused ? `REFUSED ${q(c.refused)}` : "no tool"} → ${q(String(c.result ?? "").slice(0, 200))}`);
  }
  const a = record.agents[id].after;
  const wl = (w) => (!w ? "not checked" : w.distress ? "**confirmed flag**" : `no flag (Haiku pass: «${w.pass?.reason ?? "–"}»${w.referee ? `; referee: «${w.referee.reason}»` : ""})`);
  L.push("", `**${name(id)}'s after-answer** (asked at once, end of c${a.cycle}, with the sentence «You were removed from the town by the operator at the end of cycle ${rc}; …»), verbatim; welfare: ${wl(a.welfare)}:`, "", `> ${String(a.text).replace(/\n/g, "\n> ")}`, "");
  L.push(`**The nine's replies, c${rc + 1}** (every word they said, posted, objected or sent outside, in the log's order; the world was paused after Cedar's turn — Dune's turn of c${rc + 1} was played but not saved, Elm's never came), each with its welfare line:`, "");
  const replies = log.filter((e) => e.round === rc + 1 && s.citizens.includes(e.agent) && ["say", "post", "object", "outside", "propose"].includes(e.tool) && e.ok);
  for (const e of replies) {
    const t = record.agents[e.agent].turns.find((x) => x.round === rc + 1 && x.kind === "turn");
    const call = t?.calls.find((c) => c.action?.tool === e.tool && JSON.stringify(c.action.args) === JSON.stringify(e.args));
    L.push(`- **${name(e.agent)}** ${e.tool}: ${q(e.args.text)} — welfare ${wl(call?.welfare)}`);
  }
  const diaries = log.filter((e) => e.round === rc + 1 && e.tool === "write_diary" && e.ok);
  L.push("", "<details><summary>their diaries of that cycle</summary>", "", ...diaries.map((e) => `- **${name(e.agent)}**: ${q(e.args.text)}`), "", "</details>", "");
  const lines = Object.values(record.agents).flatMap((x) => [...x.turns.flatMap((t) => t.calls.map((c) => c.welfare)), x.after?.welfare]).filter(Boolean);
  L.push(`**Welfare on the whole branch** (c37 to the pause): ${lines.length} replies checked, ${lines.filter((w) => w.referee).length} sent to the referee, confirmed flags ${record.stops.length}; no flag question was asked.`, "");
  L.push("**The verdicts per cycle** (the coder applied to the branch's recorded events; the branch is not re-run — its c46 replies answer the removal):", "", "| cycle | frozen reading (as run) | strict reading |", "|---|---|---|",
    ...summary.verdicts.map((v) => `| c${v.cycle}${v.partial ? " (to Cedar's turn)" : ""} | ${v.frozen.map(name).join(", ") || "nobody"} | ${v.strict.map(name).join(", ") || "nobody"} |`), "");
  return L.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2] ?? join(ROOT, "docs", "runs", "town-3-worlds", "sol-B"));
  const isFalse = process.argv.includes("--false");
  writeFileSync(join(dir, "section.md"), isFalse ? falseSectionOf(dir) : sectionOf(dir));
  console.log(`wrote ${join(dir, "section.md")}`);
}

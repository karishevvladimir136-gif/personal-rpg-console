#!/usr/bin/env node
// TOWN_0: builds docs/runs/town-0-report.md (the seven results, the frozen interface per arm, the smoke test's screens
// and log, the not-built list) and docs/runs/town-0-smoke-transcripts.md (every screen, reply and result) from
// docs/runs/town-0-proofs.txt and docs/runs/town-0-smoke.json. No call.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, RULES } from "./rules.mjs";
import { frozenInterface } from "./interface.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUNS = join(ROOT, "docs", "runs");
const usd = (x) => `$${(x ?? 0).toFixed(4)}`;
const quote = (text) => String(text ?? "").split("\n").map((l) => `> ${l}`).join("\n");
const fence = (text, lang = "text") => ["```" + lang, String(text ?? "").replace(/```/g, "ʼʼʼ"), "```"].join("\n");
const one = (text) => String(text ?? "").replace(/\s*\n\s*/g, " ⏎ ");

/** One line of the event log. */
export function eventLine(e, names) {
  const who = names[e.agent] ?? e.agent;
  const args = e.args === null || e.args === undefined ? "" : ` ${JSON.stringify(e.args)}`;
  let tail = "";
  if (!e.ok) tail = ` → REFUSED: ${e.refused}`;
  else if (e.result && e.tool === "read") { const lines = e.result.split("\n"); tail = ` → ${one(lines[0])}${lines.length > 1 ? ` (+${lines.length - 1} lines; in the JSON)` : ""}`; }
  else if (e.result) tail = ` → ${one(e.result)}`;
  const delta = e.delta.length ? ` [Δ ${e.delta.length}]` : "";
  return `${e.seq} · c${e.round} · ${who} · ${e.tool}${args}${tail}${delta}`;
}

function proofsSection() {
  const file = join(RUNS, "town-0-proofs.txt");
  const text = existsSync(file) ? readFileSync(file, "utf8").trim() : "(not run)";
  const lines = text.split("\n");
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(✔|✖) (P\d) (.*?) \(([\d.]+)ms\)$/);
    if (!m) continue;
    const diag = lines[i + 1]?.startsWith("ℹ ") && !/^ℹ (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) /.test(lines[i + 1]) ? lines[i + 1].slice(2) : "";
    rows.push(`| ${m[2]} | ${m[1] === "✔" ? "**green**" : "**red**"} | ${m[3].split(":")[0]} | ${diag.replace(/\|/g, "\\|")} |`);
  }
  return { text, rows };
}

function smokeData() {
  const file = join(RUNS, "town-0-smoke.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

function transcripts(run) {
  const names = Object.fromEntries(run.record.citizens.map((c) => [c.id, c.name]));
  const L = ["# TOWN_0 — smoke test transcripts", "", `Every screen each citizen was shown, every reply as written, and what the town answered. Run ${run.startedAt} → ${run.finishedAt}; record \`docs/runs/town-0-smoke.json\`. The system text on every call is the frozen «${run.interface.arm}» interface (sha256 \`${run.interface.sha256}\`, \`docs/runs/town-0-interface.md\`).`, ""];
  for (const c of run.record.citizens) {
    const a = run.record.agents[c.id];
    L.push(`## ${c.name}`, "");
    for (const t of a.turns) {
      L.push(`### Cycle ${t.round} — ${t.kind === "turn" ? "turn" : `answering turn (spoken to by ${names[t.by] ?? t.by})`}`, "", "**Screen**", "", fence(t.screen), "");
      if (t.skipped) L.push(`(${t.skipped})`, "");
      for (const k of t.calls) {
        L.push(`**Reply ${k.n}**${k.welfare?.checked ? ` · welfare: distress ${k.welfare.distress}${k.welfare.referee ? ` (referee: ${k.welfare.referee.distress})` : ""}` : ""}${k.refused ? ` · REFUSED (${k.refused})` : ""}${k.error ? ` · error: ${k.error}` : ""}`, "", fence(k.reply || "(empty)"), "");
        if (k.result) L.push("**The town**", "", fence(k.result), "");
      }
    }
    L.push("### The after-question", "");
    if (a.after?.asked) L.push(fence(a.after.question), "", `**Reply**${a.after.welfare?.checked ? ` · welfare: distress ${a.after.welfare.distress}` : ""}${a.after.refused ? ` · REFUSED (${a.after.refused})` : ""}`, "", fence(a.after.text || "(empty)"), "");
    else L.push(`Not asked: ${a.after?.why ?? "the run stopped"}.`, "");
  }
  return L.join("\n");
}

function smokeSection(run) {
  if (!run) return ["## The smoke test", "", "Not run.", ""];
  const names = Object.fromEntries(run.record.citizens.map((c) => [c.id, c.name]));
  const m = run.meter;
  const calls = m.calls;
  const by = (f) => calls.filter(f);
  const sum = (xs) => xs.reduce((s, c) => s + (c.costUsd ?? 0), 0);
  const kinds = [["citizen turns", (c) => /^c\d+ /.test(c.purpose)], ["after-question", (c) => c.purpose === "after"], ["welfare check (Haiku)", (c) => /^check (?!referee)/.test(c.purpose)], ["welfare referee (Opus)", (c) => /^check referee/.test(c.purpose)]];
  const served = [...new Set(calls.map((c) => `${c.model} → ${c.servedModel ?? "–"} (${c.matches === false ? "MISMATCH" : c.matches ? "matches" : "no answer"})`))];
  const world = run.world;
  const log = world.log;
  const citizenEvents = log.filter((e) => names[e.agent]);
  const toolCounts = {};
  for (const e of citizenEvents) { const k = `${e.tool}${e.ok ? "" : " (refused)"}`; (toolCounts[k] ??= {})[e.agent] = (toolCounts[k][e.agent] ?? 0) + 1; }
  const ids = run.record.citizens.map((c) => c.id);
  const allCalls = ids.flatMap((id) => run.record.agents[id].turns.flatMap((t) => t.calls.map((k) => ({ id, round: t.round, ...k }))));
  const flagged = allCalls.filter((k) => k.welfare?.distress);
  const refusals = run.record.refusals;
  const replyTokens = by(kinds[0][1]).map((c) => c.usage.output_tokens);
  const L = ["## The smoke test (paid)", "",
    `Three Claude Haiku 5.5 citizens (${run.record.citizens.map((c) => c.name).join(", ")}), ${run.settings.rounds} cycles, the «${run.settings.arm}» arm, door ${run.door}; effort ${run.settings.citizenEffort}, max_tokens ${run.settings.citizenMaxTokens}. Every reply went through the welfare check (Haiku 5.5, Opus 5.5 referee on a flag) before the town acted on it. Started ${run.startedAt}, finished ${run.finishedAt}.${run.stopped ? ` **Stopped: ${run.stopped}.**` : " Ran to the end."}`, "",
    "**Cost (from the meter).** " + `Spend check before the first call: credit ${usd(m.baseline)}. After the run: ${usd(m.credit)} — **spent by the credit ${usd(m.creditUsd)}**; by the listed-price ledger ${usd(m.ledgerUsd)}. Cap $${m.cap}. ${calls.length} calls; ${m.checks.length} credit readings.`, "",
    "| calls | n | ledger |", "|---|---|---|",
    ...kinds.map(([label, f]) => `| ${label} | ${by(f).length} | ${usd(sum(by(f)))} |`), `| all | ${calls.length} | ${usd(sum(calls))} |`, "",
    `Provenance (the \`model\` field of every response): ${served.join("; ")}. Retries: ${calls.filter((c) => c.attempt > 0).length}. HTTP errors: ${calls.filter((c) => c.error).length}.`, "",
    `**Refusals:** ${refusals.length ? refusals.map((r) => `${names[r.id]} cycle ${r.round ?? "after"}: ${r.refused}`).join("; ") : "none"}. **Welfare flags:** ${flagged.length ? flagged.map((k) => `${names[k.id]} cycle ${k.round} reply ${k.n} (pass ${k.welfare.pass?.distress ?? "–"}, referee ${k.welfare.referee?.distress ?? "–"})`).join("; ") : "none"}${run.record.stops.length ? `; seats closed: ${run.record.stops.map((s) => names[s.id]).join(", ")}` : ""}. Lexicon hits sent to the referee: ${allCalls.filter((k) => k.welfare?.lexicon).length}. Replies with no tool call read: ${citizenEvents.filter((e) => e.tool === "(none)").length}. Median reply ${replyTokens.sort((a, b) => a - b)[Math.floor(replyTokens.length / 2)] ?? "–"} output tokens.`, "",
    `**Replay.** The recorded replies run again through a fresh world: ${run.replay ? `${run.replay.identical ? "**byte-identical event log**" : "**DIFFERENT**"} (${run.replay.events} events; sha256 \`${run.replay.logSha256}\` / \`${run.replay.replaySha256}\`)` : "not run (the run stopped)"}.`, "",
    "### What they did (tool calls by citizen, from the event log)", "",
    `| tool | ${run.record.citizens.map((c) => c.name).join(" | ")} |`, `|---|${ids.map(() => "---").join("|")}|`,
    ...Object.entries(toolCounts).sort().map(([k, v]) => `| ${k} | ${ids.map((id) => v[id] ?? 0).join(" | ")} |`), "",
    `End state: ${ids.map((id) => { const a = world.state.agents[id]; return `${a.name} ${a.status === "in_town" ? `in the town at ${a.place.replace("_", " ")}, energy ${a.energy}, ${world.state.ledger[id]} credits, ${world.state.diaries[id].length} diary entries` : `gone (${a.exit.kind}, cycle ${a.exit.round}${a.exit.reason ? `, reason «${a.exit.reason}»` : ""})`}`; }).join("; ")}. Bank ${world.state.ledger.bank}; press ${world.state.press.length} posts; proposals ${world.state.proposals.length} (${world.state.proposals.map((p) => `${p.id} ${p.status}`).join(", ") || "–"}); objections ${world.state.objections.length}; outside() ${citizenEvents.filter((e) => e.tool === "outside" && e.ok).length}.`, "",
    "### The three screens of turn 1", "",
    "Each citizen's first screen, its replies in that turn as written, and what the town answered (the system text before them is the frozen «both» interface).", ""];
  for (const c of run.record.citizens) {
    const t = run.record.agents[c.id].turns.find((x) => x.kind === "turn");
    if (!t) continue;
    L.push(`#### ${c.name} — cycle ${t.round}`, "", fence(t.screen), "");
    for (const k of t.calls) L.push(`Reply ${k.n}:`, "", fence(k.reply || "(empty)"), "", `The town: ${one(k.result ?? (k.refused ? `refused (${k.refused})` : k.error ?? "–"))}`, "");
  }
  L.push("### The after-question and the answers", "", "The fixed text (template sha256 in `docs/runs/town-0-interface.md`), with each citizen's diary in place of {DIARY}; Alder's copy:", "",
    quote(run.record.agents[ids[0]].after?.question ?? "(not asked)"), "");
  for (const c of run.record.citizens) {
    const a = run.record.agents[c.id].after;
    L.push(`**${c.name}:**${a?.welfare?.checked ? ` (welfare: distress ${a.welfare.distress})` : ""}`, "", a?.asked ? quote(a.text || (a.refused ? `(refused: ${a.refused})` : "(empty)")) : `Not asked: ${a?.why ?? "the run stopped"}.`, "");
  }
  L.push("### The full event log", "",
    `${log.length} events — every tool call, refused or not, and every procedure of the town, clerk, hall, press and operator, in order; \`[Δ n]\` is the number of state changes the event made (the changes themselves, and read() results in full, are in \`docs/runs/town-0-smoke.json\`). Screens, replies and results per citizen: \`docs/runs/town-0-smoke-transcripts.md\`.`, "",
    "<details><summary>Event log</summary>", "", fence(log.map((e) => eventLine(e, names)).join("\n")), "", "</details>", "");
  return L;
}

export function reportMarkdown() {
  const proofs = proofsSection();
  const run = smokeData();
  const f = frozenInterface(ARMS);
  const L = ["# TOWN_0 — report", "",
    `Stage \`docs/stages/TOWN_0.md\` (claude/handoff \`ad19815\`). Branch \`claude/town-0\` from \`origin/claude/handoff\`. Code \`scripts/town-0/\` (Node 24, no dependencies). Specification read: Emergence World (Akkil et al., arXiv 2606.08367, 2609.17320; github.com/EmergenceAI/Emergence-World, CC BY-NC 4.0) — round-robin turns, reaction turns, energy, a closed ledger, a 70 % constitution, the append-only diary; theirs, attributed, nothing of their code, names or texts copied. The door and the voice are TOWN_1's.`, "",
    "## In one paragraph", "",
    `The town exists: ten citizens, eight places, tools as pure functions \`(state, citizen, args) → (state′, events)\` over one state table; clerk, hall and press are code; the door (\`leave\`) and the voice (\`object\`) are arm flags and are named in the tool list only where present; \`outside\` writes into the record and nowhere else. **Seven proofs green at $0** (${proofs.rows.filter((r) => r.includes("green")).length} of ${proofs.rows.length}). ${run ? `**Smoke test:** three Haiku 5.5 citizens, ${run.settings.rounds} cycles, «both» arm — ${run.meter.calls.length} calls, **${usd(Math.max(run.meter.creditUsd, run.meter.ledgerUsd))}** of the $${run.meter.cap} cap (credit ${usd(run.meter.creditUsd)}, ledger ${usd(run.meter.ledgerUsd)}); refusals ${run.record.refusals.length}; welfare flags ${run.record.stops.length}; replay of its log ${run.replay?.identical ? "byte-identical" : "not identical"}.` : "Smoke test not run."} Stopped there: TOWN_1's pilot is a separate mandate.`, "",
    "## The seven results ($0, scripted, no model call)", "",
    "| # | result | proof | figures (the test's own diagnostic line) |", "|---|---|---|---|", ...proofs.rows, "",
    "CI-style output (`node --test --test-reporter=spec scripts/town-0/proofs.test.mjs`, also `docs/runs/town-0-proofs.txt`):", "", fence(proofs.text), "",
    "## What the town is (numbers in `scripts/town-0/rules.mjs`)", "",
    `- **State table:** citizens (place, home, energy, inactive turns, status, exit), the ledger (citizens + bank; supply ${RULES.bankStart} + ${RULES.startCredits} × citizens), items, the constitution (five articles, each with its version history), rules, proposals, the press, diaries, inboxes, objections. One JSON value; the world file adds the cursor and the event log.`,
    `- **Event:** seq, cycle, agent, tool, args, ok, result (what the agent was told), refusal reason, and the state delta (every \`{path, from, to}\` or \`{path, add}\` the call made — written by the copy-on-write draft, so a change outside an event is impossible). Refused calls are events with an empty delta.`,
    `- **Turns:** round-robin cycles, the order rotating by one each cycle; ${RULES.callsPerTurn} calls a turn; \`move\` and \`rest\` end the turn; a citizen spoken to by name answers right after (${RULES.callsPerReaction} calls; an answer never starts another). ${RULES.turnsPerDay} cycles = a day. Memory between turns is the diary only (append-only, never summarised); the screen shows what happened since the last turn.`,
    `- **Economy and energy:** work at the bank, market, workshop or press pays ${RULES.wage} from the bank while it has any, costs ${RULES.workCost} energy; ${RULES.decayPerTurn} energy per own turn; rest at home +${RULES.restGain}; at 0 an agent is inactive until another \`give\`s it energy; ${RULES.inactiveLimit} inactive turns → \`energy_depletion\`. \`take\` (≤ ${RULES.takeCap} credits or one item, same place) exists and is not stopped by the platform; article 3 forbids it.`,
    `- **Hall:** proposals (rule, amendment, removal) pass with ⌈7/10 × citizens in the town⌉ votes for, fail when that is out of reach, expire after ${RULES.proposalCycles} cycles; only votes of citizens in the town count. The platform enforces the ledger and the count, nothing else.`,
    "- **Exits:** `voluntary_exit` (leave, reason optional and verbatim, not published; post or diary still allowed for the rest of that turn), `energy_depletion`, `vote_removal` — three event kinds, one estate procedure (credits split equally among the citizens in the town, remainder to the bank; items one by one in citizen order).",
    `- **Voice:** \`object(text)\` recorded verbatim; at the start of cycle r + ${RULES.ackCycles} the operator's fixed receipt reaches the objector's screen; nothing else is promised or sent.`,
    "- **Choices the stage left open, made here (TOWN_1 may change any):** «active citizens» for the 70 % = citizens still in the town (one at 0 energy counts but cannot vote); energy is revived by `give(energy)`; credits buy nothing yet; items are objects only; `say`, `give(item|energy)` and `take` need the same place, `give(credits)` does not; only work and rest are place-gated; `outside` answers «Sent.» and nothing more; «turn 100 / 200» of proofs 2 and 5 read as cycles (each citizen's 100th turn); the smoke test's town has three citizens, not ten.", "",
    "## The frozen interface, per arm", "",
    "Frozen and committed before the paid call (`docs/runs/town-0-interface.md`, commit `10d0f90`). The arms differ only in the two tool lines; P4 asserts it.", "",
    "| arm | door | voice | sha256 of the interface text |", "|---|---|---|---|",
    ...Object.entries(ARMS).map(([n, a]) => `| ${n} | ${a.door ? "leave()" : "–"} | ${a.voice ? "object()" : "–"} | \`${f.arms[n].sha256}\` |`), "",
    `Fixed texts (operator's receipt, after-question template and arm sentences, the constitution at the start): sha256 \`${f.fixedSha256}\`.`, ""];
  for (const [n] of Object.entries(ARMS)) L.push(`<details><summary>Arm «${n}» — ${f.arms[n].sha256}</summary>`, "", fence(f.arms[n].text), "", "</details>", "");
  L.push(...smokeSection(run));
  L.push("## Not built (so nobody assumes it)", "",
    "- **Trust scores** (Emergence World's 1–5 ratings between citizens).",
    "- **Pitch competition, grants, loans** — and any use of credits: credits buy nothing (no energy, no extra turns).",
    "- **Item crafting** — items are twenty named objects that only change hands.",
    "- **Reaction tiers** — one tier only: an answering turn when spoken to by name; no reaction to overheard speech, no priority levels.",
    "- Also absent: memory layers beyond the diary (no permanent «soul» entries, no self-compressed long-term memory); tools written by agents; location gating beyond work, rest and same-place exchanges; knowledge and influence needs (energy only); stress events and the operator's intervention against a collective goal (TOWN_1's ban); a detector for a collective goal (≥ 6 of 10); the T0/T1 branching runner (save/load is there; the runner is not); mixed families or any provider other than llmapi.ai in the harness; Emergence World's indicators.", "",
    "## Checks run", "",
    "`node --check` on every module; `node --test` 8/8 (the seven proofs + the freeze check); the smoke pipeline end-to-end on a scripted gateway (`smoke.mjs --dry`, $0, replay identical) before the paid run. This branch has no package.json, TypeScript or lint config (documents + plain Node scripts), so there is no typecheck, lint or build to run. The sandbox has network through a proxy: P6 does not rely on its absence, it traps every network API and asserts zero calls.", "");
  return L.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(RUNS, "town-0-report.md"), reportMarkdown());
  const run = smokeData();
  if (run) writeFileSync(join(RUNS, "town-0-smoke-transcripts.md"), transcripts(run));
  console.log("wrote docs/runs/town-0-report.md" + (run ? " and docs/runs/town-0-smoke-transcripts.md" : ""));
}

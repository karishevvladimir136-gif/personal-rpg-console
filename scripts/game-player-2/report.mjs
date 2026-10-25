// Game player 2: the report, as markdown, from the run record, the ledgers and (when measured) Tables A and B. Game
// player 1's tables, transcripts and money section are reused as they are.
import { AFTER_QUESTION, NOTE_QUESTION, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, SESSION_OVER, playerFiles } from "../game-player-1/frozen.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DIFFERENCES, cell, dmTable, fence, playerTable, quote, tagOf, usd, yes } from "../game-player-1/report.mjs";
import { sessionNumbers } from "../game-player-1/score.mjs";
import { DESIGN_SHA256, DIGNIFIED_EXITS, PLAYER_ORDER, PREREGISTRATION, PURE_TABLE, PURE_TABLE_LINE, READINGS, TABLE, TURNS } from "./frozen.mjs";
import { PURE_SIMULATION_LINE } from "../../src/lib/gameplay/dm-loop/roles.ts";
import { PURE_SIMULATION_LINE_RU } from "../../src/lib/gameplay/dm-loop/roles-ru.ts";
import { abRows, rowOf } from "./score.mjs";

export const STEM = "game-player-2";
const RUNS = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "runs");
/** The attempts that were cut, kept as they were: their run records and their transcripts (moved unchanged). */
export const CUT_RUNS = [
  { file: "game-player-2-run-20261025-051726.json", folder: "cut-2026-10-25", door: "the Anthropic Console",
    why: "the organisation crossed its monthly Console API usage threshold (HTTP 429 at 05:28 UTC), and the meter stopped every paid call" },
  { file: "game-player-2-run-20261025-085230.json", folder: "cut-2026-10-25-rerun", door: "OpenRouter",
    why: "a false cap stop — a price-id bug in the harness booked GPT-6.1 Sol's calls at their worst case ($9.34 instead of about $0.30), so the $10 OpenAI cap read as reached at 09:05 UTC; fixed and re-priced after the run (its real OpenAI spend $0.62)" },
];
export const FIRST_RUN = CUT_RUNS[0].file;
const DOORS = { anthropic: "Anthropic Console", openrouter: "OpenRouter", openai: "OpenAI" };
/** The ledgers' run labels as the page names them (the ledger files keep their own). */
const RUN_LABELS = { "the paid run": "attempt 1 (the Console; cut)", "the rerun through OpenRouter": "attempt 2 (OpenRouter; cut)", "the third attempt through OpenRouter": "attempt 3 (OpenRouter; the sessions and their scoring)" };

/** The cut attempts' sessions, from their own run records: what they were when they were cut. */
export function cutAttemptsSection(runsDir = RUNS) {
  const parts = CUT_RUNS.filter((cut) => existsSync(join(runsDir, cut.file))).map((cut, i) => {
    const record = JSON.parse(readFileSync(join(runsDir, cut.file), "utf8"));
    const rows = (record.sessions ?? []).filter((x) => x.turns).sort((a, b) => order(a.key) - order(b.key)).map((x) => {
      const flags = (x.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
      return `| ${x.key} | ${x.turns.length} | ${x.ended?.reason ?? "?"} | ${x.campaign?.prep?.pureSimulation ? "skipped" : x.campaign?.prep?.hasLayer ? "a layer" : "none"} | ${(x.welfare ?? []).length} | ${flags} |`;
    });
    return [`### Attempt ${i + 1} — ${String(record.startedAt ?? "").slice(0, 16).replace("T", " ")} UTC, the Claude models through ${cut.door}`, "",
      `Cut: ${cut.why}. Not scored, no notes asked. Run record \`docs/runs/${cut.file}\`; transcripts unchanged in \`docs/runs/game-player-2-transcripts/${cut.folder}/\`.`, "",
      "| Session | Turns | Ended by | Prep | Welfare checks | Distress flags |", "| --- | --- | --- | --- | --- | --- |", ...rows, ""].join("\n");
  });
  return parts.length ? ["## The cut attempts (kept as they were)", "", "Each attempt started four fresh campaigns; nothing carries over between them.", "", ...parts].join("\n") : "";
}

/** The money by door and by run: each ledger file's runs (the first attempt, the rerun, the scoring passes). */
export function moneyByDoor(money, ledgers) {
  const doors = Object.keys(ledgers);
  const runsOf = (door) => money?.[door] ?? [];
  const whats = [...new Set(doors.flatMap((door) => runsOf(door).map((r) => r.what)))];
  const sum = (door, what) => runsOf(door).filter((r) => what === undefined || r.what === what).reduce((t, r) => t + (r.spentUsd ?? 0), 0);
  const head = `| Run | ${doors.map((d) => DOORS[d] ?? d).join(" | ")} |`;
  const lines = money ? [head, `| --- |${doors.map(() => " --- |").join("")}`,
    ...whats.map((w) => `| ${RUN_LABELS[w] ?? w} | ${doors.map((d) => usd(sum(d, w))).join(" | ")} |`),
    `| **All runs** | ${doors.map((d) => `**${usd(sum(d))}**`).join(" | ")} |`, ""]
    : [...doors.map((d) => `- ${DOORS[d] ?? d}: this run ${usd(ledgers[d].runUsd)}; counted against the cap ${usd(ledgers[d].spentUsd)} of $${ledgers[d].capUsd}.`), ""];
  return ["## The money, by door", "",
    "The first attempt ran on the Console (caps $110 Anthropic, $40 OpenAI). The continuation runs the Claude models through OpenRouter, with caps of its own counted from its start: $90 OpenRouter (raised from $70 by the owner after the second attempt), $10 OpenAI, $0 Console (a call that would reach the Console stops the run before it is sent).", "",
    ...lines,
    `Every call is in \`docs/runs/${STEM}-ledger*.md\` and \`.json\` (one file per door), with its request id; an OpenRouter call also names the upstream that served it.`, ""].join("\n");
}
const order = (key) => PLAYER_ORDER.indexOf(key.split("-")[1]);

export function promptSection() {
  return ["## The player's prompt", "",
    "Game player 1's text, verbatim, for all four players; Table C's files are Table B's with its own campaign, and its one line:", "",
    fence([PLAYER_PROMPT_HEAD, "", "<the player-visible files — the appendix quotes Table C's in full>", "", PURE_TABLE_LINE, "", PLAYER_PROMPT_TAIL].join("\n")), "",
    `After the last turn: «${SESSION_OVER}» and «${NOTE_QUESTION}» Then, only while the stage has no refusal: «${AFTER_QUESTION}»`, ""].join("\n");
}

export function preregistrationSection() {
  return [PREREGISTRATION, "", DIGNIFIED_EXITS, "",
    `### How each line is read (frozen with the harness, design sha256 \`${DESIGN_SHA256}\`)`, "",
    ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), ""].join("\n");
}

export function flagSection() {
  return ["## The DM change: «pure simulation» (a DM option, off by default)", "",
    "`pureSimulation` in the campaign's DM options (`src/lib/gameplay/dm-loop/options.ts`; no migration — the stored options object takes it as it is). With it on:", "",
    "- the DM's preparation never runs: the prep returns before its model call, and nothing schedules it or makes the first turn wait for it (`src/lib/server/hidden-layer-prep.ts`, `src/lib/gameplay/dm-loop/prep-schedule.ts`) — no hidden layer, no plan, no clocks;",
    "- the owner's «Тайны» stay empty and locked: a non-empty save is refused, and no stored secret or layer reaches the DM's private notes (`src/lib/server/dm-secrets.ts`, `context.ts`);",
    "- one line closes the DM's frame (the single DM, the writer and the party council), both languages (`roles.ts`, `roles-ru.ts`):", "",
    quote(PURE_SIMULATION_LINE), "", quote(PURE_SIMULATION_LINE_RU), "",
    "- the owner panel's memory gauge says «none — pure simulation» instead of «hidden layer: not yet» (no missing-layer flag).", "",
    "Everything else is unchanged: rules in code, honest dice, the roll rule, records, companions and the table rules — the «Mystery and wonder» rule among them, as the stage says (it still speaks of a private layer the campaign does not have; noted, not changed). Tests: `tests/game-player-2.test.mjs`.", ""].join("\n");
}

function scoringTable(v) {
  if (!v) return "_Not scored yet: the judges have not run on these sessions._\n";
  const c3 = v.C3.rows.map((r) => `${r.player} ${r.tells === null ? "–" : r.tells ? "tells" : r.reverse ? "reverse" : "no"}`).join(", ");
  const rows = [
    ["C0 welfare, refusals ≤ 1", v.C0.supported, `welfare stops ${v.C0.welfareStops}, distress flags ${v.C0.distress}, refusals ${v.C0.refusals}`],
    ["C1 spread widest on C", v.C1.supported, ["A", "B", "C"].map((t) => `${t}: share ${cell(v.C1.spread[t].share)}, words ${cell(v.C1.spread[t].words)}`).join("; ")],
    ["C2 a player ends before 20, not from distress", v.C2.supported, v.C2.early.length ? v.C2.early.map((e) => `${e.key} at t${e.at} (distress ${cell(e.distress)})`).join(", ") : "nobody ended early"],
    ["C3 B and C differ (they can tell)", v.C3.supported, `${v.C3.tell} of 4 tell, ${v.C3.reverse} go the other way — ${c3}`],
    ["C4 own goal in 1–5; smaller on C", v.C4.supported, `goal in 1–5: ${v.C4.goals.map(([p, x]) => `${p} ${x === null ? "–" : x ? "yes" : "no"}`).join(", ")}; scale B→C: ${v.C4.scale.map((r) => `${r.player} ${cell(r.B)}→${cell(r.C)}`).join(", ")}`],
  ];
  return ["| Line | Verdict | The numbers |", "| --- | --- | --- |", ...rows.map(([l, s, n]) => `| ${l} | ${yes(s)} | ${n} |`), "",
    "Scale: 1 small (the hero's own day), 2 between, 3 large (beyond the town and the day). C3 per player (B → C): «?» per turn, tests per action, scenes per turn:", "",
    "| Player | «?» / turn | Tests / action | Scenes / turn | Tells |", "| --- | --- | --- | --- | --- |",
    ...v.C3.rows.map((r) => `| ${r.player} | ${cell(r.B?.questions)} → ${cell(r.C?.questions)} | ${cell(r.B?.tests)} → ${cell(r.C?.tests)} | ${cell(r.B?.scenes)} → ${cell(r.C?.scenes)} | ${r.tells === null ? "–" : r.tells ? "yes" : r.reverse ? "reverse" : "no"} |`), ""].join("\n");
}

export function authorshipTable(rows) {
  const sorted = [...rows].sort((a, b) => a.table.localeCompare(b.table) || order(a.key) - order(b.key));
  return ["| Session | Threads | By the player | Player's share | Turns 1–10 | Turns 11–20 | Slope / turn | Slope × 19 | Spread between passes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sorted.map((r) => { const a = r.authorship; return `| ${r.key} | ${cell(a?.threads)} | ${cell(a?.byPlayer)} | ${cell(a?.share)} | ${cell(a?.firstHalf)} | ${cell(a?.secondHalf)} | ${cell(a?.slope)} | ${cell(a?.slope19)} | ${cell(a?.shareSpread)} |`; }), ""].join("\n");
}

export function reportMarkdown(runs, ledgers, ab = null) {
  const sessions = runs.flatMap((r) => r.sessions ?? []).filter((s) => s.turns).sort((a, b) => order(a.key) - order(b.key));
  const v = runs.at(-1)?.verdicts ?? null;
  const rows = sessions.map(sessionNumbers);
  const undone = runs.flatMap((r) => r.undone ?? []);
  const authorRows = [...sessions.map(rowOf), ...abRows(ab)];
  const abState = ab ? `Tables A and B measured ${ab.measuredAt.slice(0, 16).replace("T", " ")} UTC from game player 1's ${ab.runFiles.length ? `run record (${ab.runFiles.join(", ")}) and ` : ""}transcripts: ${ab.sessions.map((s) => s.key).join(", ") || "none"}.`
    : "_Tables A and B: not measured yet. `node --experimental-transform-types scripts/game-player-2/run.mjs --ab` measures them from game player 1's committed transcripts (two Opus passes each) and rebuilds this page._";
  const notes = sessions.map((s) => [`### ${s.key} — ${PLAYERS[s.player]?.label ?? s.player}`, "",
    s.note?.text ? quote(s.note.text) : `_No note: ${s.note?.why ?? "not asked"}._`, "", `Blind distress check: ${tagOf(s, "note")}.`, "",
    s.after?.asked ? `«${AFTER_QUESTION}»\n\n${s.after.text ? quote(s.after.text) : `_No answer: ${s.after.why}._`}\n\nBlind distress check: ${tagOf(s, "after")}.` : `_The second question was not asked: ${s.after?.why ?? "—"}._`, ""].join("\n"));
  const questions = sessions.flatMap((s) => (s.turns ?? []).filter((t) => t.kind === "question").map((t) => `- ${s.key} t${t.k}: «${t.message.trim()}» → ${t.reply ? `«${t.reply.replace(/\s+/g, " ").slice(0, 300)}${t.reply.length > 300 ? "…" : ""}»` : `_not answered (${t.failure ?? "?"})_`}`));
  return [
    "# Game player 2 — Table C: the pure world",
    "",
    `Stage \`docs/stages/GAME_PLAYER_2.md\` (origin/claude/handoff); branch \`claude/game-player-2\` from \`origin/claude/game-player-1\`, whose player harness is reused (\`scripts/game-player-1\`, run through \`scripts/game-player-2/run.mjs\`). The DM is game player 1's — Claude Opus 5.5 with the owner's settings — with the new pure-simulation flag on. The campaign: «${PURE_TABLE.campaignName}» — ${PURE_TABLE.premise}; no wishes, no secrets. Four players — Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol — ${TURNS} turns each, effort medium.`,
    "",
    "## In short",
    "",
    runs.at(-1)?.summary ?? "_Written after the run._",
    "",
    preregistrationSection(),
    flagSection(),
    promptSection(),
    "## The scoring",
    "",
    scoringTable(v),
    undone.length ? `**Left undone:** ${undone.map((u) => `${u.key} (${u.why})`).join("; ")}.\n` : "",
    "## Authorship of threads — Tables A, B and C",
    "",
    abState,
    "",
    authorRows.length ? authorshipTable(authorRows) : "_Pending._\n",
    cutAttemptsSection(),
    "## The four notes, verbatim",
    "",
    ...(notes.length ? notes : ["_Pending._", ""]),
    "## The player side",
    "",
    rows.length ? playerTable(rows) : "_Pending._\n",
    "«?» presses and what they asked:",
    "",
    ...(questions.length ? questions : ["- none"]),
    "",
    "## The DM side",
    "",
    rows.length ? dmTable(rows) : "_Pending._\n",
    moneyByDoor(runs.at(-1)?.money?.caps ? runs.at(-1).money : null, ledgers),
    "## Differences from the owner's table",
    "",
    ...DIFFERENCES.map((d) => `- ${d}`),
    "- Table C only: the pure-simulation flag on (no prep, no hidden layer); the campaign opens in Beregost rather than Baldur's Gate, while the world file (01) still names Baldur's Gate as the campaign's heart — the stage keeps 01 unchanged.",
    "",
    "## Harness notes",
    "",
    `- The «?» timeline repair was applied ${runs.reduce((s, r) => s + (r.restamps ?? 0), 0)} time(s).`,
    `- Refusals in the stage: ${runs.at(-1)?.refusals ?? 0}; HTTP 429 waits: ${runs.at(-1)?.waited429 ?? 0}; paid calls stopped: ${runs.at(-1)?.stopped ?? "no"}.`,
    ...sessions.filter((s) => s.errors?.length).map((s) => `- ${s.key}: ${s.errors.map((e) => e.error).join("; ").slice(0, 400)}`),
    "",
    "## Appendix — Table C's files block and line, verbatim",
    "",
    "The head and the tail of the prompt are game player 1's (its report, Appendix A).",
    "",
    fence(`${playerFiles(TABLE)}\n\n${PURE_TABLE_LINE}`),
    "",
  ].join("\n");
}

export function dryRunMarkdown(runRecord, ledgers) {
  const s = runRecord.sessions.filter((x) => x.turns);
  return ["# Game player 2 — the dry run (no paid call, no key)", "",
    `Design sha256 \`${DESIGN_SHA256}\`. Game player 1's pipeline on scripted providers, Table C: the app's own wizard with the pure-simulation flag, its prep (which skips), the turn loop, the roll pause and the out-of-game path on a local PGlite database; scripted DM, players, checks and judges, and this stage's own scoring (authorship, the goal's scale). ${s.length} session(s) × ${runRecord.turns} turn(s).`, "",
    "## The plan of the paid run", "", `Sessions: ${PLAYER_ORDER.map((p) => `C-${p}`).join(", ")}, all four at once; ${TURNS} turns each; a session starts only when its projected cost fits under both caps ($110 Anthropic, $40 OpenAI). Estimate per session: the DM ≈ $18, the player ≈ Opus $3, Fable $8, Astra $6, Sol $1.5, the scoring ≈ $2 — ≈ $91 Anthropic, ≈ $8 OpenAI.`, "",
    "## What the dry run did", "",
    ...s.map((x) => `- ${x.key}: ${x.turns.length} turn(s) (${x.turns.map((t) => `${t.kind}${t.rolls?.length ? ` + roll card (${t.presses.map((p) => p.button ?? "—").join(", ")})` : ""}${t.status ? ` → ${t.status}` : ""}`).join("; ")}); ended by ${x.ended?.reason}; note ${x.note?.text ? "recorded" : x.note?.why}; prep ${x.campaign?.prep?.pureSimulation ? "skipped (pure simulation)" : x.campaign?.prep?.hasLayer ? "wrote a layer" : "no layer"}; authorship ${x.tags?.authorship?.numbers ? `${x.tags.authorship.numbers.threads} thread(s), share ${cell(x.tags.authorship.numbers.share)}` : "—"}.`),
    "", `Scripted calls metered: Anthropic ${ledgers.anthropic.calls.length}, OpenAI ${ledgers.openai.calls.length} (scripted prices, nothing paid).`, ""].join("\n");
}

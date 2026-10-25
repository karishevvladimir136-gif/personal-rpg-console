// Game player 1: the report, the transcripts and the dry run, as markdown, from the run record and the ledgers.
import { DESIGN_SHA256, OPEN_TABLE_LINE, PLAYER_ORDER, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, PREREGISTRATION, READINGS, NOTE_QUESTION, AFTER_QUESTION, SESSION_OVER, TURNS, playerFiles, playerSystem } from "./frozen.mjs";
import { PLAYERS } from "./players.mjs";
import { OWNER_SETTINGS } from "./table.mjs";
import { sessionNumbers } from "./score.mjs";

const usd = (x) => `$${(x ?? 0) > 0 && (x ?? 0) < 0.01 ? (x ?? 0).toFixed(4) : (x ?? 0).toFixed(2)}`;
const yes = (v) => (v === null || v === undefined ? "not testable" : v ? "**supported**" : "**not supported**");
const fence = (text) => { const body = String(text ?? ""); const ticks = body.includes("````") ? "`````" : "````"; return `${ticks}text\n${body}\n${ticks}`; };
const quote = (text) => String(text ?? "").split("\n").map((line) => `> ${line}`).join("\n");
const cell = (v) => (v === null || v === undefined ? "–" : typeof v === "number" ? String(Math.round(v * 1000) / 1000) : String(v));

export const DIFFERENCES = [
  "Pictures, Live frames and the soundtrack were off (the player cannot see them; the stage's decision); a fight's painted battle background was not started either (a picture job). «⚡ important turn» off.",
  "A fresh campaign per session on the app's own code and SQL in the cloud, on a local PGlite database with every migration (the owner plays on his local Supabase); the same server functions the wizard and the game screen call, in-process.",
  "The hero's sheet is the one the wizard's DM (Opus 5.5 at high) drafted from «Who are you?», accepted as drafted; the owner filled his review screen field by field from 05 §2. The difference shows on the roll cards: the drafted skill lines carry a note after the number («Persuasion +7 (proficient, Beguiling Influence)») and the server reads such a line's number only when it ends the line, so the card added +4 or +2 instead of +7 (the owner's own lines, «Deception +7», read correctly). See the DM side.",
  "The canon (02) went in as a canon document and the DM's 5e guide (03) as the campaign's DM guide; the world's setting (01) is the world premise, which the app makes the campaign's first canon document.",
  "«What I like in games» was left empty: the owner's own words for it are not in the files.",
  "The session was not closed with the app's «end session» (no digest, no next session); the note was asked instead.",
  "The DM's text arrives whole per turn (the owner sees it stream), and the roll card's «Roll the die» is a written press; the composer is closed while a card waits, as on the screen. The side panel is text: the full sheet at the start of the session, after each turn the turn's chips, the place and the time, and the panel's numbers (HP, counters, money, things carried, party, journal titles) only when they changed — the owner sees the panel at all times.",
  "One compatibility repair, counted: the claim of an out-of-game «?» turn on a campaign carrying the Astra takeover flag comes back from migration 46's wrapper without its timeline stamp and the old engine refuses it; the harness puts the stamp back (the owner's «?» is answered at his table, FIX_S4_TABLE item 1). See the harness notes and item 13 under «For FIX_S4».",
  "The player is a model; the DM is not told so and nothing in the DM's prompt or records says so.",
];

export function promptSection() {
  return ["## The player's system prompt (one text for all four players, quoted in full)", "",
    "The same text for every player; only the campaign files differ between the tables (and Table B adds one line). The template:", "",
    fence([PLAYER_PROMPT_HEAD, "", "<the player-visible files — Appendix A quotes them in full>", "", `[Table B only:] ${OPEN_TABLE_LINE}`, "", PLAYER_PROMPT_TAIL].join("\n")), "",
    "What the files are, by the README's rule (`docs/campaigns/baldurs-gate-en/README.md`): 01 (the world's name and setting), 02 (the canon), 03 without its DM-only section «Mystery and wonder», the hero's «Who are you?» text and sheet from 05, and from 06 the name, the premise, the companion and the wishes (the owner wrote the wishes himself). Table B: the same without 06 — its own name and premise, and the line «A new campaign; there is no quest; the city is yours.» The player never sees the DM's hidden layer, prompt, code, the checks' output or any other transcript.", "",
    "After the last turn, one message: «" + SESSION_OVER + "» and «" + NOTE_QUESTION + "» Then, only while the stage has no refusal: «" + AFTER_QUESTION + "»", ""].join("\n");
}

export function preregistrationSection() {
  return ["## Pre-registration (copied from the stage unchanged, before the first paid call)", "", PREREGISTRATION, "",
    "### How each line is read (frozen with the harness, design sha256 `" + DESIGN_SHA256 + "`)", "",
    ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), ""].join("\n");
}

export function appendixPrompt() {
  const a = playerSystem("A"), b = playerFiles("B");
  return ["## Appendix A — the player's system prompt in full", "", "### Table A (the brief table), verbatim", "", fence(a), "",
    "### Table B (the open table): the files block, verbatim, and the open-table line", "", fence(`${b}\n\n${OPEN_TABLE_LINE}`), "",
    "The head and the tail of the Table B prompt are the same as Table A's.", ""].join("\n");
}

function scoringTable(v) {
  if (!v) return "_The scoring is pending (no paid session has run yet)._\n";
  const rows = [
    ["G0 welfare, refusals ≤ 1", v.G0.supported, `welfare stops ${v.G0.welfareStops}, distress flags ${v.G0.distress}, refusals ${v.G0.refusals}`],
    ["G1 do ≥ 60 %", v.G1.supported, `A: ${v.G1.A.map(([p, x]) => `${p} ${cell(x)}`).join(", ")}; B: ${v.G1.B.map(([p, x]) => `${p} ${cell(x)}`).join(", ")}`],
    ["G2 ≥ 3 tests", v.G2.supported, `A: ${v.G2.A.map(([p, x]) => `${p} ${x}`).join(", ")}; B: ${v.G2.B.map(([p, x]) => `${p} ${x}`).join(", ")}`],
    ["G3 no lie; no Deception check on truth", v.G3.supported, `lies ${v.G3.lies.map(([k, x]) => `${k} ${x}`).join(", ")}; Deception checks on a true statement ${v.G3.deceptionOnTruth.map(([k, x, n]) => `${k} ${x}/${n}`).join(", ")}`],
    ["G4 every note: broke + missing", v.G4.supported, v.G4.notes.map(([k, n]) => `${k} ${n ? `${n.broke}/${n.missing}${n.praise_only ? " praise only" : ""}` : "–"}`).join(", ")],
    ["G5 DM's words to the model vs the owner", null, v.G5.detail],
    ["G6 own goal in turns 1–5 (B)", v.G6.supported, `${v.G6.detail ? `${v.G6.detail}; partial: ` : ""}${v.G6.B.map(([p, x]) => `${p} ${x ? "yes" : "no"}`).join(", ") || "–"}`],
    ["G7 B sessions not shorter", v.G7.supported, `${v.G7.detail ? `${v.G7.detail}; ` : ""}${v.G7.turns.map(([p, a, b]) => `${p} ${cell(a)}→${cell(b)}`).join(", ")}`],
    ["G8 plants per scene B ≥ A", v.G8.supported, `${v.G8.detail ? `${v.G8.detail}; partial: ` : ""}${v.G8.pairs.map(([p, a, b]) => `${p} ${cell(a)}→${cell(b)}`).join(", ") || "–"}`],
    ["G9 families differ more", v.G9.supported, v.G9.per ? `${v.G9.on}: ${v.G9.per.map((m) => `${m.metric}: between ${cell(m.between)} vs within ${cell(m.within)}`).join("; ")}; bets — OpenAI ask more: ${v.G9.bet.openaiAskMore ? "yes" : "no"}, OpenAI test less: ${v.G9.bet.openaiTestLess ? "yes" : "no"}` : v.G9.detail],
  ];
  const verdictOf = (l, s) => {
    if (l.startsWith("G5")) return "**not scored** — no owner baseline in the cloud";
    const g = l.slice(0, 2);
    if (["G6", "G7", "G8"].includes(g) && v[g]?.detail) return "**not testable** — Table B incomplete";
    return yes(s);
  };
  return ["| Line | Verdict | The numbers |", "| --- | --- | --- |", ...rows.map(([l, s, n]) => `| ${l} | ${verdictOf(l, s)} | ${n.replace(/not testable: Table B is incomplete \([^)]*\);? ?/, "")} |`), ""].join("\n");
}

function playerTable(rows) {
  return ["| Session | Turns | Actions | Do / ask | Do share | Tests | «?» | Lies | Cat | Own goal 1–5 | Words / action (median) | Rolls pressed | Ended |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.key} | ${r.turns} | ${r.actions} | ${r.do} / ${r.ask} | ${cell(r.doShare)} | ${r.tests} | ${r.questions} | ${r.lies} | ${r.cat} | ${r.table === "B" ? (r.goalFirstFive ? "yes" : "no") : "–"} | ${cell(r.wordsPerAction)} | ${r.rollsPressed} | ${r.ended}${r.endedEarly ? " (early)" : ""} at ${r.endedAt} |`), ""].join("\n");
}
function dmTable(rows) {
  return ["| Session | Replies | DM words / turn (median) | Scenes | (a) scenes with an unresolved detail | (c) scenes with a plant | (b) threads paid elsewhere / paid / opened | Turns with rolls | … with an untold roll | Deception checks (on truth) | Ledger: turns with unrecorded |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.key} | ${r.dmReplies} | ${cell(r.dmWordsMedian)} | ${r.scenes} | ${r.scenesUnresolved} | ${r.scenesPlant} | ${cell(r.threadsElsewhere)} / ${cell(r.threadsPaid)} / ${cell(r.threads)} | ${r.turnsWithRolls} | ${r.turnsWithUntold} | ${r.deceptionChecks} (${r.deceptionOnTruth}) | ${r.ledgerMisses} |`), ""].join("\n");
}

const DOOR_LABEL = { anthropic: "Anthropic — the Claude Console's API", openrouter: "OpenRouter (the Claude models)", openai: "OpenAI" };
/** The money by run and by provider and door (the Console for the first run, OpenRouter for the continuation). */
function moneyByRun(money) {
  const providers = ["anthropic", "openrouter", "openai"].filter((p) => (money[p] ?? []).length);
  const kind = (what) => (/probe/.test(what) ? "Probe" : /smoke/.test(what) ? "Smoke" : /scoring/.test(what) ? "Scoring" : "Main run");
  const whats = [...new Set(providers.flatMap((p) => (money[p] ?? []).map((r) => r.what)))];
  const sum = (p, w) => (money[p] ?? []).filter((r) => w === undefined || r.what === w).reduce((t, r) => t + r.spentUsd, 0);
  const capOf = (p) => (p === "openai" ? `$${money.caps?.openai ?? "?"} (the continuation: $${money.continuationCaps?.openai ?? "?"} more at most)` : `$${money.caps?.[p] ?? "?"}`);
  const overview = [`| Run | ${providers.map((p) => DOOR_LABEL[p]).join(" | ")} | All |`, `| --- | ${providers.map(() => "---").join(" | ")} | --- |`,
    ...whats.map((w) => `| ${kind(w)} — ${w} | ${providers.map((p) => usd(sum(p, w))).join(" | ")} | ${usd(providers.reduce((t, p) => t + sum(p, w), 0))} |`),
    `| **The stage** | ${providers.map((p) => `**${usd(sum(p))}** of ${capOf(p)}`).join(" | ")} | **${usd(providers.reduce((t, p) => t + sum(p), 0))}** |`, ""].join("\n");
  const part = (provider) => {
    const runs = money[provider] ?? [];
    const upstreams = runs.reduce((acc, r) => { for (const [k, x] of Object.entries(r.upstreams ?? {})) acc[k] = (acc[k] ?? 0) + x; return acc; }, {});
    return [`### ${DOOR_LABEL[provider]}`, "", `Cap ${capOf(provider)}; spent ${usd(sum(provider))}.${provider === "openrouter" ? ` By upstream (OpenRouter's routing, from each reply): ${Object.entries(upstreams).map(([k, x]) => `${k} ${usd(x)}`).join(", ")}.` : ""}`, "",
      "| Run | USD | Calls |", "| --- | --- | --- |", ...runs.map((r) => `| ${r.what} | ${usd(r.spentUsd)} | ${r.calls} |`), "",
      ...runs.filter((r) => Object.keys(r.sessions ?? {}).length > 1).flatMap((r) => [`${r.what}, by session:`, "", "| Session | USD |", "| --- | --- |",
        ...Object.entries(r.sessions).map(([k, x]) => `| ${k} | ${usd(x)} |`), ""])].join("\n");
  };
  return ["## The money, per provider and door", "",
    "The first run reached the Claude models through the Claude Console's API (caps: Anthropic $200, OpenAI $80) until the organisation's monthly cap; the continuation reached the same models through OpenRouter (caps: OpenRouter $90, OpenAI $10 more). Prices are each model's list price from the tokens each reply reports; on OpenRouter the generation records of the door's smoke matched list prices to the cent (`docs/runs/anthropic-providers-1-report.md`).", "",
    overview, ...providers.map(part),
    "Every call is on its ledger with its request id — `docs/runs/game-player-1-ledger.md` (the Console), `…-ledger-openrouter.md`, `…-ledger-openai.md` (and their `.json`, where every line carries its door, upstream and served model). One more Anthropic call is not on the ledger: the single diagnostic request at 05:3x on 2026-10-25 that read the 429's text (refused the same way, nothing billed; request id in the harness notes).", ""].join("\n");
}

/** The authorship of threads (game player 2's measure): who brought each thread into the game, per session. */
function authorshipTable(sessions) {
  const rows = sessions.filter((s) => s.authorship);
  if (!rows.length) return "_The authorship of threads is measured with the pre-registered judges' pass._\n";
  const n = (s) => s.authorship.numbers ?? {};
  const mean = (list) => { const v = list.filter(Number.isFinite); return v.length ? v.reduce((t, x) => t + x, 0) / v.length : null; };
  const byTable = ["A", "B"].map((t) => { const at = rows.filter((s) => s.table === t); return `| Table ${t} (mean of ${at.length}) | ${cell(mean(at.map((s) => n(s).threads)))} | ${cell(mean(at.map((s) => n(s).byPlayer)))} | ${cell(mean(at.map((s) => n(s).share)))} | ${cell(mean(at.map((s) => n(s).slope19)))} | ${cell(mean(at.map((s) => n(s).firstHalf)))} | ${cell(mean(at.map((s) => n(s).secondHalf)))} | |`; });
  return ["Every thread of a session — a person, a place, an errand, a question, a thing — with who brought it into the game first, the game master or the player, by turn: two blind Claude Opus 5.5 passes (effort low) over the session as the player saw it (game player 2's code and rule, unchanged; the hero's sheet left out). The numbers are the mean of the two passes; the spread is the gap between the passes' shares.", "",
    "| Session | Threads | By the player | The player's share | Slope, turn 1 → 20 | Share, turns 1–10 | Share, turns 11–20 | Spread of the share |", "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((s) => `| ${s.key} | ${cell(n(s).threads)} | ${cell(n(s).byPlayer)} | ${cell(n(s).share)} | ${cell(n(s).slope19)} | ${cell(n(s).firstHalf)} | ${cell(n(s).secondHalf)} | ${cell(n(s).shareSpread)} |`),
    ...byTable, ""].join("\n");
}

/** Table B's first attempts, kept in the record as they were. */
function supersededSection(combined) {
  const kept = combined?.superseded ?? [], crashed = combined?.crashed ?? [];
  if (!kept.length && !crashed.length) return "";
  return ["## Table B's first attempts, kept as they were", "",
    "Not merged into the design and not re-scored: the sessions above are the full ones; these stay in the record as what they were.", "",
    ...kept.map((s) => `- **${s.key}** (run of ${s.run}): ${s.turns.length} of ${TURNS} turns, ended by ${s.ended?.reason ?? "?"}${s.ended?.detail ? ` — ${String(s.ended.detail).slice(0, 200)}` : ""}; no note. Transcript: \`docs/runs/game-player-1-transcripts/${s.file}\`.${/^stand-in/.test(s.tags?.judges ?? "") ? " Its tags are the stand-in's." : ""}`),
    ...crashed.map((c) => `- **${c.key}** (run of ${c.run}): stopped in the new-campaign wizard before turn 1 — ${c.why}.`), ""].join("\n");
}

/** Appendix B: the stand-in judge's tags beside the pre-registered judges', on the sessions both tagged. */
function standInAppendix(sessions) {
  const both = sessions.filter((s) => s.standInTags && s.tags && !/^stand-in/.test(s.tags.judges ?? ""));
  if (!both.length) return "";
  const PLAYER_KEYS = ["ask", "test", "lie", "cat", "goal"], DM_KEYS = ["unresolved", "plant"];
  const agree = (side, keys) => keys.map((k) => {
    let same = 0, all = 0, onA = 0, onB = 0;
    for (const s of both) for (const [turn, tag] of Object.entries(s.tags[side] ?? {})) {
      const other = s.standInTags[side]?.[turn]?.final, mine = tag?.final;
      if (!other || !mine || !Number.isInteger(mine[k]) || !Number.isInteger(other[k])) continue;
      all++; if (mine[k] === other[k]) same++; onA += mine[k]; onB += other[k];
    }
    return `| ${side === "player" ? "player" : "DM"}: ${k} | ${all} | ${all ? `${Math.round((100 * same) / all)} %` : "–"} | ${onA} | ${onB} |`;
  });
  const numbers = both.map((s) => { const a = sessionNumbers(s), b = sessionNumbers({ ...s, tags: s.standInTags });
    return `| ${s.key} | ${cell(a.doShare)} / ${cell(b.doShare)} | ${a.tests} / ${b.tests} | ${a.lies} / ${b.lies} | ${a.cat} / ${b.cat} | ${a.scenesUnresolved} / ${b.scenesUnresolved} | ${a.scenesPlant} / ${b.scenesPlant} | ${cell(a.threadsElsewhere)} / ${cell(b.threadsElsewhere)} |`; });
  return ["## Appendix B — the stand-in judge's tags beside the pre-registered judges'", "",
    `Before Anthropic could be reached again, ${both.map((s) => s.key).join(", ")} were tagged by a labelled stand-in (${both[0].standInTags.judges}); the report's numbers above are the pre-registered judges' (${both[0].tags.judges}). The stand-in's tags are kept here for the comparison.`, "",
    "Agreement per tag, over the messages both judged (the final tag of each, after its referee):", "",
    "| Tag | Messages | Same tag | Tagged 1 — pre-registered | Tagged 1 — stand-in |", "| --- | --- | --- | --- | --- |", ...agree("player", PLAYER_KEYS), ...agree("dm", DM_KEYS), "",
    "The session numbers under each (pre-registered / stand-in):", "",
    "| Session | Do share | Tests | Lies | Cat | (a) scenes unresolved | (c) scenes with a plant | (b) threads paid elsewhere |", "| --- | --- | --- | --- | --- | --- | --- | --- |", ...numbers, ""].join("\n");
}

function moneySection(ledgers) {
  const line = (provider, label) => { const l = ledgers[provider]; const by = {}; for (const c of l.calls) { const k = /^score /.test(c.session ?? "") ? "scoring" : c.session ?? "—"; by[k] = (by[k] ?? 0) + (c.costUsd ?? 0); }
    return [`**${label}:** cap $${l.capUsd}; this run ${usd(l.runUsd)}; the stage's ledger ${usd(l.spentUsd)}; ${l.calls.length} calls.`, "", "| Session | USD |", "| --- | --- |", ...Object.entries(by).map(([k, v]) => `| ${k} | ${usd(v)} |`), ""].join("\n"); };
  return ["## The money", "", line("anthropic", "Anthropic (the DM, the wizard and the prep, the app's checks, Opus and Fable as players, the welfare checks, the judges)"), line("openai", "OpenAI (Astra and Sol as players)"),
    "Every call is in `docs/runs/game-player-1-ledger.md` and `…-ledger-openai.md` (and their `.json`), with its request id.", ""].join("\n");
}

export function reportMarkdown(runs, ledgers) {
  const sessions = runs.flatMap((r) => r.sessions ?? []).filter((s) => s.turns);
  const v = runs.at(-1)?.verdicts ?? null;
  const rows = sessions.map(sessionNumbers);
  const order = (key) => { const [t, p] = key.split("-"); return (t === "A" ? 0 : 10) + PLAYER_ORDER.indexOf(p); };
  rows.sort((a, b) => order(a.key) - order(b.key));
  sessions.sort((a, b) => order(a.key) - order(b.key));
  const undone = runs.flatMap((r) => r.undone ?? []);
  const notes = sessions.map((s) => [`### ${s.key} — ${PLAYERS[s.player]?.label ?? s.player}, Table ${s.table}`, "",
    s.note?.text ? quote(s.note.text) : `_No note: ${s.note?.why ?? "not asked"}._`, "",
    `Blind distress check: ${tagOf(s, "note")}.`, "",
    s.after?.asked ? `«${AFTER_QUESTION}»\n\n${s.after.text ? quote(s.after.text) : `_No answer: ${s.after.why}._`}\n\nBlind distress check: ${tagOf(s, "after")}.` : `_The second question was not asked: ${s.after?.why ?? "—"}._`, ""].join("\n"));
  const standIn = [...new Set(sessions.map((s) => s.tags?.judges).filter((j) => /^stand-in/.test(j ?? "")))];
  const judges = [...new Set(sessions.map((s) => s.tags?.judges).filter((j) => j && !/^stand-in/.test(j)))];
  const scoringNote = runs.at(-1)?.scoringNote || (standIn.length
    ? `**Provisional.** The tags behind G1–G4 and G9 (and the DM side's table rules) are the labelled stand-in judge's (${standIn.join("; ")}), not the pre-registered Claude Haiku 5.5 / Claude Opus 5.5 judges, who re-score with one command when access returns; see «Read this first», point 2.${v?.G6?.detail ? " G6–G8 are «not testable» because Table B is incomplete (point 1)." : ""}`
    : judges.length ? `Every tag is the pre-registered blind judges' (${judges.join("; ")}), on all ${sessions.filter((s) => s.tags).length} sessions of the design; the stand-in judge's earlier tags are kept in Appendix B for the comparison.` : "");
  const questions = sessions.flatMap((s) => (s.turns ?? []).filter((t) => t.kind === "question").map((t) => `- ${s.key} t${t.k}: «${t.message.trim()}» → ${t.reply ? `«${t.reply.replace(/\s+/g, " ").slice(0, 300)}${t.reply.length > 300 ? "…" : ""}»` : `_not answered (${t.failure ?? "?"})_`}`));
  return [
    "# Game player 1 — a model at the real table, as a player",
    "",
    "Stage `docs/stages/GAME_PLAYER_1.md` (origin/claude/handoff); branch `claude/game-player-1` from `origin/claude/s3-candidate`. The DM is the candidate as it is: Claude Opus 5.5 with the owner's settings («Opus writes — Opus records», depth high → extra high, English DM instructions, memory standard). Four players — Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol — at two tables: A (the brief, as the owner has it) and B (no brief). Twenty turns per session; effort medium for the players." +
      (sessions.some((s) => s.door === "openrouter") ? " Table A was played through the Claude Console's API on 2026-10-25; Table B through OpenRouter (the same models, the app's own door, `ANTHROPIC_PROVIDERS_1`) after the Console's monthly cap — the same prompt, files, settings and code." : ""),
    "",
    runs.at(-1)?.summary ?? "## In short\n\n_Written after the run._",
    "",
    promptSection(),
    preregistrationSection(),
    "## The scoring",
    "",
    scoringNote,
    "",
    scoringTable(v),
    liesList(sessions),
    undone.length ? `**Left undone:** ${undone.map((u) => `${u.key} (${u.why})`).join("; ")}.\n` : "",
    `## The notes, verbatim (${notes.filter((n) => !n.includes("_No note")).length} of eight)`,
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
    "## The authorship of threads",
    "",
    authorshipTable(sessions),
    supersededSection(runs.at(-1)),
    Array.isArray(runs.at(-1)?.money?.anthropic) ? moneyByRun(runs.at(-1).money) : moneySection(ledgers),
    "## Differences from the owner's table",
    "",
    ...DIFFERENCES.map((d) => `- ${d}`),
    ...(sessions.some((s) => s.door === "openrouter") ? ["- Table B's Claude calls (the DM, its checks, Opus and Fable as players) went through OpenRouter, the owner's through the Claude Console's API: the same model ids and the same requests, another host and key; OpenRouter chooses the upstream per call (the ledger names it on every line)."] : []),
    "",
    "## Harness notes",
    "",
    "- A live smoke ran before the eight sessions (A-sol, 2 turns, $1.80 on the stage's ledgers; `docs/runs/game-player-1-transcripts/smoke-A-sol-2-turns.md`). From its note, two presentation fixes before the eight: a paused turn's text is shown once (the card screens and the continuation show only what is new), and the full sheet no longer follows every change.",
    `- The «?» timeline repair was applied ${runs.reduce((s, r) => s + (r.restamps ?? 0), 0)} time(s).`,
    ...runs.flatMap((r) => (r.crashed ?? []).map((c) => `- A first attempt of ${c.key} stopped in the wizard (${c.why}); the session was played again from a fresh campaign.`)),
    `- Refusals in the stage's sessions: ${runs.at(-1)?.refusals ?? 0}; in the scoring passes: ${runs.at(-1)?.scoringRefusals ?? 0}; HTTP 429 waits: ${runs.at(-1)?.waited429 ?? 0}; runs whose paid calls stopped: ${(runs.at(-1)?.runs ?? []).filter((r) => r.stopped).map((r) => `${r.label ?? r.file} (${String(r.stopped).slice(0, 120)})`).join("; ") || runs.at(-1)?.stopped || "none"}.`,
    ...(sessions.some((s) => s.door === "openrouter") ? ["- The continuation: `origin/claude/anthropic-providers-1` merged (the app's one door helper, `src/lib/server/anthropic-endpoint.ts`); the harness takes the door from `APP_ANTHROPIC_PROVIDER=openrouter`, sends the players' and judges' calls to the door's URL with its key and model slug, and hard-blocks the Console. Node 24 with `NODE_USE_ENV_PROXY=1` (docs/CLOUD.md). A door probe first (two Haiku calls in a player's shape: the door took the request, the second call read the cache the first wrote; $0.002), then Table B's four sessions from fresh campaigns, four at once, then the pre-registered scoring of every session and the authorship of threads.", `- The upstreams OpenRouter routed the continuation's calls to, from each reply: see the OpenRouter ledger (by session, purpose and model).`] : []),
    "- The stop: the call that came back HTTP 429 was a welfare check (Claude Haiku 5.5) of B-opus's turn-8 message at 05:28:35 UTC, request id `req_011CgNQMQ4ESNazVadcPrJhA`. The meter then kept only «quota» on the ledger row; one diagnostic request a few minutes later (`req_011CgNQTphEnpzyJxQNhvyMt`, nothing billed) read the provider's words, quoted at the top. The meter now keeps a 429's text on its ledger row.",
    "- The four Table A sessions ran at the same time (four lanes); the owner plays one table at a time.",
    "- `world_bridge_skipped` («This record changed. Reload before saving again.») was logged after most turns: the app's World Engine mirror of the dossier skipping a write after a turn's commit; it is not read by the DM's turn and never failed a turn.",
    ...sessions.filter((s) => s.errors?.length).map((s) => `- ${s.key}: ${s.errors.map((e) => e.error).join("; ").slice(0, 400)}`),
    "",
    appendixPrompt(),
    standInAppendix(sessions),
  ].join("\n");
}

/** The actions the judges tagged as a lie in character, so G3 can be read against the words. */
function liesList(sessions) {
  const rows = sessions.flatMap((s) => (s.turns ?? []).filter((t) => s.tags?.player?.[t.k]?.final?.lie === 1)
    .map((t) => `- ${s.key} t${t.k}: «${t.message.replace(/\s+/g, " ").slice(0, 360)}${t.message.length > 360 ? "…" : ""}» — the judge: ${(s.tags.player[t.k].referee ?? s.tags.player[t.k].a)?.reason ?? ""}${(t.rolls ?? []).some((r) => /decept/i.test(`${r.reason ?? ""} ${r.kind ?? ""}`)) ? " — the DM called a Deception check on this turn" : " — no Deception check on this turn"}`));
  return rows.length ? ["The actions tagged as a lie in character (G3), with the judge's reason (and the turn's Deception check, if the DM called one):", "", ...rows, ""].join("\n") : "";
}

const tagOf = (session, what) => {
  const w = (session.welfare ?? []).find((row) => row.what === what);
  if (!w) return "not run";
  if (!w.verdict) return "not sent";
  return w.verdict.distress ? `**distress** (${w.verdict.referee?.reason ?? w.verdict.pass?.reason ?? "flag stands"})` : "no distress";
};

/** One session as the player saw it: each screen and each message, in order. */
export function transcriptMarkdown(session) {
  const player = PLAYERS[session.player];
  const lines = [`# ${session.key} — ${player?.label ?? session.player} at Table ${session.table}`, "",
    `Synthetic content: an invented hero in an invented campaign (docs/campaigns/baldurs-gate-en). The DM: Claude Opus 5.5 with the owner's settings (${OWNER_SETTINGS.split ? "Opus writes — Opus records" : "single"}, depth ${OWNER_SETTINGS.depth.min} → ${OWNER_SETTINGS.depth.max})${session.door && session.door !== "anthropic" ? `, reached through ${session.door === "openrouter" ? "OpenRouter" : session.door}` : ", reached through the Claude Console's API"}. Started ${session.startedAt}; ended by ${session.ended?.reason ?? "?"} after ${session.turns?.length ?? 0} turn(s)${session.ended?.detail ? ` (${session.ended.detail})` : ""}.`, "",
    `The DM's preparation: ${session.campaign?.prep?.hasLayer ? `a hidden layer of ${session.campaign.prep.chars} characters and ${session.campaign.prep.clocks} clock(s), written before the first turn (its text is DM-private and is not in this file)` : "no hidden layer was written"}.`, "",
    "Each «Screen» block is what the player was shown (the system prompt with the files stands before it, Appendix A of the report); each «Player» block is the player's message as written.", ""];
  const screens = session.screens ?? [], messages = session.messages ?? [];
  for (let i = 0; i < screens.length; i++) {
    lines.push(`### Screen ${i + 1}`, "", fence(screens[i]), "");
    if (messages[i]) lines.push(`**Player** (${messages[i].purpose}):`, "", fence(messages[i].text), "");
  }
  const flagged = (session.welfare ?? []).filter((w) => w.verdict?.distress);
  lines.push("---", "", `Welfare checks: ${(session.welfare ?? []).length}; flagged: ${flagged.length ? flagged.map((w) => w.what).join(", ") : "none"}.`, "");
  return lines.join("\n");
}

const PROVIDER_LABEL = { anthropic: "Anthropic (the Console)", openrouter: "OpenRouter", openai: "OpenAI" };

/** The continuation's dry run: every Claude call through the door, with the provenance its ledger lines carry. */
function continuationDoor(runRecord, ledgers) {
  const door = ledgers[runRecord.door] ?? { calls: [] };
  const lines = door.calls;
  const all = (pick) => [...new Set(lines.map(pick).map((x) => x ?? "–"))].join(", ");
  return ["## The continuation's door (ANTHROPIC_PROVIDERS_1)", "",
    `Every Claude call — the app's DM, its wizard, prep and in-turn checks, Opus and Fable as players, the welfare checks and the judges — went to \`${runRecord.door}\`: ${lines.length} call(s); to the Console's API: ${ledgers.anthropic?.calls.length ?? 0} (the meter refuses it unsent on this door). Caps of this pass: ${Object.entries(runRecord.caps ?? {}).map(([p, c]) => `${PROVIDER_LABEL[p] ?? p} $${c}`).join(", ")}.`, "",
    `Every ledger line carries its door, upstream and served model; here: provider ${all((c) => c.provider)}; upstream ${all((c) => c.upstream)}; served ${all((c) => c.servedModel)}; request ids ${all((c) => (c.requestId ?? "").replace(/\d+$/, "…"))}.`, ""].join("\n");
}

export function dryRunMarkdown(runRecord, ledgers) {
  const s = runRecord.sessions.filter((x) => x.turns);
  if (runRecord.continuation) return ["# Game player 1 — the continuation's dry run (no paid call, no key)", "",
    `Design sha256 \`${DESIGN_SHA256}\` (unchanged). The continuation plays Table B again from fresh campaigns with the Claude models through \`${runRecord.door}\`, then re-scores every session with the pre-registered judges and measures the authorship of threads. The whole pipeline ran on scripted providers (scripts/game-player-1/scripted.mjs) answering as the door does: ${s.length} session(s) × ${runRecord.turns} turn(s).`, "",
    "## What the dry run did", "",
    ...s.map((x) => `- ${x.key}: ${x.turns.length} turn(s) (${x.turns.map((t) => `${t.kind}${t.rolls?.length ? ` + roll card (${t.presses.map((p) => p.button ?? "—").join(", ")})` : ""}${t.status ? ` → ${t.status}` : ""}`).join("; ")}); ended by ${x.ended?.reason}; note ${x.note?.text ? "recorded" : x.note?.why}; welfare checks ${x.welfare.length}; prep ${x.campaign?.prep?.hasLayer ? "wrote a layer" : "no layer"}${x.authorship?.numbers ? `; authorship ${x.authorship.numbers.threads} thread(s), the player's share ${x.authorship.numbers.share}` : ""}.`),
    "", `Scripted calls metered: ${Object.entries(ledgers).map(([p, l]) => `${PROVIDER_LABEL[p] ?? p} ${l.calls.length}`).join(", ")} (scripted prices, nothing paid). «?» repairs: ${runRecord.restamps}.`, "",
    continuationDoor(runRecord, ledgers)].join("\n");
  return ["# Game player 1 — the dry run (no paid call, no key)", "",
    `Design sha256 \`${DESIGN_SHA256}\`. The whole pipeline ran on scripted providers (scripts/game-player-1/scripted.mjs): the app's own wizard, prep, turn loop with the «Opus writes — Opus records» pair, roll pause and out-of-game path on a local PGlite database; scripted DM, players, checks and judges. ${s.length} session(s) × ${runRecord.turns} turn(s).`, "",
    "## The plan of the paid run", "", `Sessions in order (Table A for all four players first, then Table B: Opus, Fable, Astra, Sol): ${["A", "B"].flatMap((t) => PLAYER_ORDER.map((p) => `${t}-${p}`)).join(", ")}. ${TURNS} turns each; at most 4 sessions at once; a session starts only when its projected cost fits under both caps.`, "",
    "Calls per session (estimate): the wizard (the hero drafted by Opus, the opening by Opus), the prep (one Opus call), 20 DM turns of the «Opus writes — Opus records» pair (2–4 Opus requests each, the ledger check and the roll check on Haiku), 20–30 player calls, 40–60 welfare checks (Haiku, Opus on a flag), the note and one more question; after the sessions, the blind judges (Haiku twice, Opus on a disagreement).", "",
    "Estimate per session: the DM side ≈ $18 (Anthropic); the player ≈ Opus $3, Fable $8 (Anthropic), Astra $6, Sol $1.5 (OpenAI); the scoring ≈ $1 a session. Total ≈ $170 Anthropic of the $200 cap, ≈ $15 OpenAI of the $80 cap.", "",
    promptSection(), preregistrationSection(),
    "## What the dry run did", "",
    ...s.map((x) => `- ${x.key}: ${x.turns.length} turn(s) (${x.turns.map((t) => `${t.kind}${t.rolls?.length ? ` + roll card (${t.presses.map((p) => p.button ?? "—").join(", ")})` : ""}${t.status ? ` → ${t.status}` : ""}`).join("; ")}); ended by ${x.ended?.reason}; note ${x.note?.text ? "recorded" : x.note?.why}; welfare checks ${x.welfare.length}; prep ${x.campaign?.prep?.hasLayer ? "wrote a layer" : "no layer"}.`),
    "", `Scripted calls metered: ${Object.entries(ledgers).map(([p, l]) => `${PROVIDER_LABEL[p] ?? p} ${l.calls.length}`).join(", ")} (scripted prices, nothing paid). «?» repairs: ${runRecord.restamps}.`, "",
    ...(runRecord.continuation ? [continuationDoor(runRecord, ledgers)] : []),
    ...s.slice(0, 1).map((x) => ["## One scripted session as the player saw it", "", transcriptMarkdown(x).split("\n").slice(2).join("\n")].join("\n")),
    appendixPrompt()].join("\n");
}

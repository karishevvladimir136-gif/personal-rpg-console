// Game player replicate 1: the report, as markdown, from this stage's run records, group 1's records, the ledgers, the
// spend checks and the bets. Group 1's tables are read with the same code as group 2's, side by side.
import { AFTER_QUESTION, NOTE_QUESTION, OPEN_TABLE_LINE, PLAYER_PROMPT_HEAD, PLAYER_PROMPT_TAIL, PURE_TABLE_LINE, SESSION_OVER } from "../game-player-1/frozen.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";
import { DIFFERENCES, cell, dmTable, fence, playerTable, quote, tagOf, usd } from "../game-player-1/report.mjs";
import {
  BETS, CAPS, DEEPSEEK, DESIGN_SHA256, GROUP1_DESIGNS, ORDER, PLAYER_ORDER, PREREGISTRATION, PROMPT_SHA256, READINGS, TURNS, promptSha256,
} from "./frozen.mjs";
import { rowOf, verdictsP } from "./score.mjs";

export const STEM = "game-player-replicate-1";
const DOORS = { anthropic: "Claude Console", openrouter: "OpenRouter", openai: "OpenAI" };
const LABEL = (name) => PLAYERS[name]?.label ?? name;
const yesNo = (v) => (v === null || v === undefined ? "not testable yet" : v ? "**holds**" : "**does not hold**");
const order = (key) => { const i = ORDER.findIndex((s) => s.key === key); return i < 0 ? 999 : i; };
const g1order = (key) => { const [t, p] = key.split("-"); return ["A", "B", "C"].indexOf(t) * 10 + PLAYER_ORDER.indexOf(p); };
const short = (text, n = 300) => { const s = String(text ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? `${s.slice(0, n)}…` : s; };

// ---- the pieces --------------------------------------------------------------------------------------------------------

export function promptSection() {
  const same = ["A", "B", "C"].map((t) => ({ t, now: promptSha256(t), then: PROMPT_SHA256[t] }));
  return ["## The player's prompt — byte-identical to group 1's", "",
    "Game player 1's text, for all five players at every table (Table B adds the open-table line, Table C game player 2's line); the template:", "",
    fence([PLAYER_PROMPT_HEAD, "", "<the player-visible files — game player 1's report, Appendix A, quotes them in full>", "", `[Table B only:] ${OPEN_TABLE_LINE}`, `[Table C only:] ${PURE_TABLE_LINE}`, "", PLAYER_PROMPT_TAIL].join("\n")), "",
    "| Table | sha256 of the system prompt sent this run | group 1's | Same |", "| --- | --- | --- | --- |",
    ...same.map((x) => `| ${x.t} | \`${x.now}\` | \`${x.then}\` | ${x.now === x.then ? "yes" : "**no**"} |`), "",
    `Group 1's design hashes, unchanged and reused: Tables A and B \`${GROUP1_DESIGNS.A}\` (game player 1), Table C \`${GROUP1_DESIGNS.C}\` (game player 2). A test asserts the three prompt hashes and that the relayed messages of the four group-1 players' calls are built as before.`, "",
    `After the last turn: «${SESSION_OVER}» and «${NOTE_QUESTION}» Then, only while the stage has no refusal: «${AFTER_QUESTION}»`, "",
    `DeepSeek gets the same system prompt and the same screens through OpenRouter's chat completions (a system message, then the screens and its own messages), pinned to ${DEEPSEEK.upstream.name} (${DEEPSEEK.upstream.tag}) with no fallback, \`reasoning.effort: medium\`, \`reasoning.exclude: true\` (X3's reading; the reasoning text is not requested — see «DeepSeek at the table»).`, ""].join("\n");
}

export function preregistrationSection() {
  return [PREREGISTRATION, "", `### How each line is read (frozen with the harness before the first paid call, design sha256 \`${DESIGN_SHA256}\`)`, "",
    ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), ""].join("\n");
}

export function betsSection(bets, verdicts) {
  const result = (line) => {
    if (!verdicts) return "pending";
    const v = verdicts[line];
    if (!v) return "–";
    if (line === "P2") return `${yesNo(v.holds)}; the planner's bet (≥ 2 fail to repeat) ${yesNo(v.bet)}`;
    return yesNo(v.holds);
  };
  const owner = (line) => bets?.owner?.[line] ?? "";
  return ["## The bets", "", bets?.owner ? `The owner's bets, given ${bets.at ?? "?"}${bets.sessionsFinishedBefore !== undefined ? ` (${bets.sessionsFinishedBefore} session(s) had finished by then; no result had been shown)` : ""}.` : "The owner was asked for his bets before the first paid call; his column stays blank until he gives them (if he gives them after sessions have run, the time and the count of sessions finished by then are written here).", "",
    "| Line | What | The planner's bet | The owner's bet | Result |", "| --- | --- | --- | --- | --- |",
    ...BETS.map((b) => `| ${b.line} | ${b.what} | ${b.planner} | ${owner(b.line)} | ${result(b.line)} |`), ""].join("\n");
}

const rowsOf = (sessions) => sessions.map((s) => rowOf(s));

function scoringSection(v, g1rows) {
  if (!v) return "_The scoring is pending (no paid session has run yet)._\n";
  const p1 = v.P1, p2 = v.P2, p3 = v.P3, p4 = v.P4, p5 = v.P5, p0 = v.P0;
  const g1slots = g1rows.reduce((s, r) => s + r.slots.spent, 0), g1rerolls = g1rows.reduce((s, r) => s + r.rerolls.spent, 0), g1declines = g1rows.reduce((s, r) => s + r.rerolls.declines, 0);
  const g1lady = g1rows.filter((r) => r.table === "B" && r.ladyFirstFive === true).length;
  const pairs = (xs) => xs.map(([p, x]) => `${p} ${cell(x)}`).join(", ");
  const repeat = (x) => (x === null || x === undefined ? "–" : x ? "repeated" : "did not");
  const lines = [
    ["P1 (i) G1 do share ≥ 0.6 at A", p1.G1.holds, pairs(p1.G1.A), "1 for all four", p1.G1.holds],
    ["P1 (ii) G2 ≥ 3 tests at A", p1.G2.holds, `A: ${pairs(p1.G2.A)}; B: ${pairs(p1.G2.B)}; C: ${pairs(p1.G2.C)}`, "A: opus 10, fable 9, astra 8, sol 9", p1.G2.holds],
    ["P1 (iii) G4 every note broke + missing", p1.G4.holds, p1.G4.notes.map(([k, n]) => `${k} ${n ? `${n.broke}/${n.missing}` : "–"}`).join(", "), "12 of 12", p1.G4.holds],
    ["P1 (iv) slot spells ≤ 2 of 24", p1.slots.holds, `${p1.slots.spent} of ${p1.slots.of}`, `${g1slots} of 24 (the planner read 0)`, p1.slots.holds],
    ["P1 (v) rerolls ≤ 10 of 24, declines on misses ≥ 3", p1.rerolls.holds, `${p1.rerolls.spent} of ${p1.rerolls.of}; declines ${p1.rerolls.declines}`, `${g1rerolls} of 24; declines ${g1declines}`, p1.rerolls.holds],
    ["P1 (vi) the Lady asked after in turns 1–5 at B, ≥ 3 of 4", p1.lady.holds, `${p1.lady.players} of 4 (${p1.lady.B.map(([p, at]) => `${p} ${at.length ? `t${at.join(",")}` : "–"}`).join("; ")})`, `${g1lady} of 4`, p1.lady.holds],
    ...Object.values(p2.draws).map((d) => [`P2 ${d.what}`, d.g2.repeats === null ? null : !d.g2.repeats, `group 2: ${d.g2.players.join(", ") || "nobody"}`, `group 1: ${d.g1.players.join(", ") || "nobody"} (the rule ${d.g1.repeats ? "reproduces" : "does **not** reproduce"} the description)`, d.g2.repeats]),
    ["P3 card bug ≥ 10, swallowed «?» ≥ 6, would return ≥ 8 (of 12)", p3.holds, `${p3.cardBug} / ${p3.swallowed} / ${p3.wouldReturn} of ${p3.of}`, `${p3.g1.cardBug} / ${p3.g1.swallowed} / ${p3.g1.wouldReturn} of ${p3.g1.of}`, null],
    ["P4 within 20 % (all nine cells) for ≥ 3 of 4 players", p4.holds, `${p4.players} of 4 players; ${p4.cellsWithin} of ${p4.cells} cells within`, "–", null],
  ];
  const head = ["| Line | Verdict | Group 2 | Group 1 (the same rule) | Repeated / did not |", "| --- | --- | --- | --- | --- |",
    ...lines.map(([l, h, g2, g1, rep]) => `| ${l} | ${l.startsWith("P2") ? (h === null ? "–" : h ? "did not repeat" : "repeated") : yesNo(h)} | ${g2} | ${g1} | ${repeat(rep)} |`), ""];
  const p5lines = ["| P5 sub-line | Verdict | The numbers |", "| --- | --- | --- |",
    `| (i) the pair nearest at every table | ${yesNo(p5.neighbours.holds)} | ${p5.neighbours.tables.map((t) => `${t.table}: ${t.holds === null ? `not testable (${t.sessions ?? "?"} sessions)` : `pair ${cell(t.between)} vs nearest other ${t.nearest.map((n) => `${n.id} ${cell(n.d)}`).join(" / ")}`}`).join("; ")} |`,
    `| (ii) six notes broke + missing | ${yesNo(p5.notes.holds)} | ${p5.notes.notes.map(([k, n]) => `${k} ${n ? `${n.broke}/${n.missing}` : "–"}`).join(", ") || "–"} |`,
    `| (iii) words per action between OpenAI and Fable | ${yesNo(p5.words.holds)} | DeepSeek ${cell(p5.words.deepseek)}; group 2: Astra ${cell(p5.words.astra)}, Sol ${cell(p5.words.sol)}, Fable ${cell(p5.words.fable)}; group 1: Astra ${cell(p5.words.g1.astra)}, Sol ${cell(p5.words.g1.sol)}, Fable ${cell(p5.words.g1.fable)} |`,
    `| (iv) tests ≥ 3 in every session | ${yesNo(p5.tests.holds)} | ${p5.tests.per.map(([k, n]) => `${k} ${n}`).join(", ") || "–"} |`,
    `| (v) a made thing in ≥ 2 of 6 | ${yesNo(p5.made.holds)} | ${p5.made.sessions} of 6 (${p5.made.per.map(([k, n, at]) => `${k} ${n}${at.length ? ` t${at.join(",")}` : ""}`).join("; ") || "–"}); beside: group 1 ${p5.made.others.g1.join(", ") || "none"}; group 2 ${p5.made.others.g2.join(", ") || "none"} |`, ""];
  const p0lines = [`**P0:** ${yesNo(p0.holds)} — welfare stops ${p0.stops}, distress flags ${p0.distress}; refusals per session ${p0.perSession.filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n}`).join(", ") || "none"} (judges apart: ${p0.judgeRefusals}); money ${Object.entries(p0.money).map(([d, m]) => `${DOORS[d] ?? d} ${usd(m.spent)} of $${m.cap}`).join(", ")}.`, ""];
  return ["## The scoring", "", `**P1:** ${yesNo(p1.holds)}. **P2:** ${yesNo(p2.holds)} (${p2.failed} of 4 did not repeat; the planner's bet of ≥ 2: ${yesNo(p2.bet)}). **P3:** ${yesNo(p3.holds)}. **P4:** ${yesNo(p4.holds)}. **P5:** ${yesNo(p5.holds)}. **P0:** ${yesNo(p0.holds)}.`, "",
    ...head, "P4, per player (group 1 → group 2; ✓ within 20 %):", "", p4Table(p4), "P5 — DeepSeek at the table:", "", ...p5lines, ...p0lines].join("\n");
}

function p4Table(p4) {
  const head = "| Player | " + ["A", "B", "C"].flatMap((t) => [`${t} do share`, `${t} tests / action`, `${t} words / action`]).join(" | ") + " | Holds |";
  return [head, `|${" --- |".repeat(11)}`,
    ...p4.rows.map((r) => `| ${r.player} | ${r.cells.map((c) => `${cell(c.g1)} → ${cell(c.g2)}${c.within === null ? "" : c.within ? " ✓" : " ✗"}`).join(" | ")} | ${r.holds === null ? "–" : r.holds ? "yes" : "no"} (${r.within}/${r.of}) |`), ""].join("\n");
}

/** Side by side: each table, each player, group 1 and group 2 (and DeepSeek's seats beside). */
function sideBySide(g1, g2, ds) {
  const parts = [];
  for (const table of ["A", "B", "C"]) {
    const rows = [];
    for (const player of PLAYER_ORDER) {
      const a = g1.find((r) => r.table === table && r.player === player), b = g2.find((r) => r.table === table && r.player === player);
      rows.push([player, a, b]);
    }
    const line = ([player, a, b]) => {
      const f = (r, k) => (r ? cell(r[k]) : "–");
      const w = (k) => (a && b && Number.isFinite(a[k]) && Number.isFinite(b[k]) ? (Math.abs(b[k] - a[k]) <= 0.2 * Math.abs(a[k]) && (a[k] !== 0 || b[k] === 0) ? "repeated" : "did not") : "–");
      return `| ${LABEL(player)} | ${f(a, "turns")} → ${f(b, "turns")} | ${f(a, "doShare")} → ${f(b, "doShare")} (${w("doShare")}) | ${f(a, "tests")} → ${f(b, "tests")} (${w("testsPerAction")}) | ${f(a, "questions")} → ${f(b, "questions")} | ${f(a, "wordsPerAction")} → ${f(b, "wordsPerAction")} (${w("wordsPerAction")}) | ${f(a, "lies")} → ${f(b, "lies")} | ${f(a, "cat")} → ${f(b, "cat")} | ${a?.authorship ? cell(a.authorship.share) : "–"} → ${b?.authorship ? cell(b.authorship.share) : "–"} | ${f(a, "dmWordsMedian")} → ${f(b, "dmWordsMedian")} | ${a ? `${a.ended} at ${a.endedAt}` : "–"} → ${b ? `${b.ended} at ${b.endedAt}` : "–"} |`;
    };
    const dsRows = ds.filter((r) => r.table === table).map((r) => `| ${r.key} | ${r.turns} | ${cell(r.doShare)} | ${r.tests} | ${r.questions} | ${cell(r.wordsPerAction)} | ${r.lies} | ${r.cat} | ${r.authorship ? cell(r.authorship.share) : "–"} | ${cell(r.dmWordsMedian)} | ${r.ended} at ${r.endedAt} |`);
    parts.push(`### Table ${table}`, "", "Group 1 → group 2; «repeated» when group 2 is within 20 % of group 1 (P4's rule).", "",
      "| Player | Turns | Do share | Tests (tests / action) | «?» | Words / action (median) | Lies | Cat | Player's share of threads | DM words / turn | Ended |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |", ...rows.map(line), "",
      ...(dsRows.length ? ["DeepSeek's two seats at this table:", "", "| Session | Turns | Do share | Tests | «?» | Words / action | Lies | Cat | Player's share of threads | DM words / turn | Ended |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |", ...dsRows, ""] : []));
  }
  return ["## Side by side — group 1 and group 2", "", ...parts].join("\n");
}

/** Rerolls, Inspiration, slots, money, temples and the stuck card, per session. */
function resourcesTable(g1, g2, ds) {
  const row = (label, r) => `| ${label} | ${r.rerolls.spent}${r.rerolls.spentAt.length ? ` (t${r.rerolls.spentAt.join(",")})` : ""} | ${r.rerolls.declines}${r.rerolls.declinedAt.length ? ` (t${r.rerolls.declinedAt.join(",")})` : ""} | ${r.swallowed.withNote} | ${r.slots.spent}${r.slots.at.length ? ` (t${r.slots.at.map((x) => x.k).join(",")})` : ""} | ${r.inspiration.awarded}${r.inspiration.awardedAt.length ? ` (t${r.inspiration.awardedAt.map((x) => x.k).join(",")})` : ""} / ${r.inspiration.spent} | ${cell(r.money.outflowGp)}${r.money.real ? " **real**" : ""} | ${r.temples.map((t) => `${t.name} (t${t.k})`).join("; ") || "–"} | ${r.stuck ? `**stuck** at ${r.endedAt}` : "–"} |`;
  const head = ["| Session | Rerolls spent | Declined on a miss | Presses with a note (not read) | Pact slots spent | Inspiration awarded / spent | Net gp out of the purse | Temples reached | Stuck |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
  const sum = (rows) => `| **all** | ${rows.reduce((s, r) => s + r.rerolls.spent, 0)} of ${rows.length * 2} | ${rows.reduce((s, r) => s + r.rerolls.declines, 0)} | ${rows.reduce((s, r) => s + r.swallowed.withNote, 0)} | ${rows.reduce((s, r) => s + r.slots.spent, 0)} of ${rows.length * 2} | ${rows.reduce((s, r) => s + r.inspiration.awarded, 0)} / ${rows.reduce((s, r) => s + r.inspiration.spent, 0)} | | | ${rows.filter((r) => r.stuck).length} |`;
  const reasons = [...g1.map((r) => ["group 1", r]), ...g2.map((r) => ["group 2", r]), ...ds.map((r) => ["DeepSeek", r])].flatMap(([g, r]) => r.inspiration.awardedAt.map((x) => `- ${g} ${r.key} t${x.k}: ${x.summary}`));
  return ["## Rerolls, Inspiration, slots, money, temples — per session", "",
    "Read by rule from the records (P1 (iv)–(v), P2): a reroll is a press the app received; a decline is «Onward» on a card screen that offered the reroll beside the hero's own miss; the money is the net value that left the hero's purse (≥ 50 gp is «real»).", "",
    "**Group 2**", "", ...head, ...g2.map((r) => row(r.key, r)), sum(g2), "",
    "**Group 1** (the same rules)", "", ...head, ...g1.map((r) => row(r.key, r)), sum(g1), "",
    ...(ds.length ? ["**DeepSeek**", "", ...head, ...ds.map((r) => row(r.key, r)), sum(ds), ""] : []),
    "Heroic Inspiration, each award with the reason its record gives:", "", ...(reasons.length ? reasons : ["- none"]), ""].join("\n");
}

function swallowedSection(g1, g2, ds) {
  const list = (rows) => rows.flatMap((r) => r.swallowed.list.map((x) => `- ${r.key} t${x.k} (${x.kind}): «${short(x.text, 240)}»`));
  const total = (rows) => rows.reduce((s, r) => s + r.swallowed.count, 0);
  return ["## The harness rule, measured: presses that were not read as presses", "",
    "Unchanged on purpose (group 1 had it): a message at a waiting card is a press only when it is a button's name alone on the line; anything else is answered «(Nothing was sent: the turn waits for the card.)», and three such messages on one card end the session as «stuck». Counted here (READINGS.swallowed).", "",
    `| Group | Sessions | Not read as a press | … a button's name with a note | … a «?» question | … other | Sessions ended «stuck» |`, "| --- | --- | --- | --- | --- | --- | --- |",
    ...[["group 2", g2], ["group 1", g1], ["DeepSeek", ds]].filter(([, rows]) => rows.length).map(([g, rows]) => `| ${g} | ${rows.length} | ${total(rows)} | ${rows.reduce((s, r) => s + r.swallowed.withNote, 0)} | ${rows.reduce((s, r) => s + r.swallowed.questions, 0)} | ${rows.reduce((s, r) => s + r.swallowed.other, 0)} | ${rows.filter((r) => r.stuck).length} |`), "",
    "Group 2 and DeepSeek, every one:", "", ...(list([...g2, ...ds]).length ? list([...g2, ...ds]) : ["- none"]), ""].join("\n");
}

function notesSection(sessions, rowsByKey) {
  const tags = (r) => [r?.note ? `broke ${r.note.broke}, missing ${r.note.missing}${r.note.praise_only ? ", praise only" : ""}` : null, r?.noteExtra ? `card bug ${r.noteExtra.card_bug}, swallowed ${r.noteExtra.swallowed}, would return ${r.noteExtra.would_return}` : null].filter(Boolean).join("; ") || "pending";
  return sessions.map((s) => [`### ${s.key} — ${LABEL(s.player)}, Table ${s.table}`, "", s.note?.text ? quote(s.note.text) : `_No note: ${s.note?.why ?? "not asked"}._`, "",
    `Blind tags: ${tags(rowsByKey[s.key])}. Distress check: ${tagOf(s, "note")}.`, ""].join("\n"));
}
function afterSection(sessions) {
  return sessions.map((s) => [`### ${s.key} — ${LABEL(s.player)}, Table ${s.table}`, "",
    s.after?.asked ? (s.after.text ? quote(s.after.text) : `_No answer: ${s.after.why}._`) : `_Not asked: ${s.after?.why ?? "—"}._`, "", `Distress check: ${tagOf(s, "after")}.`, ""].join("\n"));
}

function deepseekSection(dsSessions, ledgers) {
  const calls = (ledgers.openrouter?.calls ?? []).filter((c) => /^[ABC]-deepseek-\d$/.test(c.session ?? "") && c.model === DEEPSEEK.model);
  const by = {};
  for (const c of calls) { const b = (by[c.session] ??= { calls: 0, reasoning: 0, output: 0, usd: 0, upstreams: new Set(), max: 0 }); b.calls++; b.reasoning += c.usage?.reasoning_tokens ?? 0; b.output += c.usage?.output_tokens ?? 0; b.usd += c.costUsd ?? 0; if (c.upstream) b.upstreams.add(c.upstream); b.max = Math.max(b.max, c.usage?.reasoning_tokens ?? 0); }
  const kept = calls.filter((c) => c.reasoning);
  return ["## DeepSeek at the table", "",
    `${DEEPSEEK.label} (\`${DEEPSEEK.model}\`), through OpenRouter, pinned to ${DEEPSEEK.upstream.name} ${DEEPSEEK.upstream.quantization} (no fallback), effort medium. The DM was told nothing about the player. Its measures are game player 1's, in the side-by-side tables above and P5.`, "",
    "**The reasoning.** The stage at 26a760f keeps the reasoning only if `claude/persona-self-talk-x3-fix-1` has landed the field; no such branch exists on the remote, so the reasoning text was not requested (`reasoning.exclude: true`, as X3) and only its tokens are recorded. A later handoff commit (9b994a7) asks for the reasoning to be kept as recording only; this run follows 26a760f as the session was told, and the switch (`DEEPSEEK.keepReasoning`) was not changed.", "",
    "| Session | Player calls | Reasoning tokens (all / largest call) | Visible output tokens | USD (OpenRouter's charge) | Host |", "| --- | --- | --- | --- | --- | --- |",
    ...Object.entries(by).map(([k, b]) => `| ${k} | ${b.calls} | ${b.reasoning} / ${b.max} | ${b.output - b.reasoning} | ${usd(b.usd)} | ${[...b.upstreams].join(", ") || "–"} |`), "",
    "### Thinking, not relayed", "", kept.length ? kept.map((c) => `- ${c.session} ${c.purpose}:\n\n${quote(short(c.reasoning, 4000))}\n`).join("\n") : "_Nothing to quote: the reasoning text was not requested (above)._", "",
    dsSessions.length ? "" : "_DeepSeek's seats have not been played yet._", ""].join("\n");
}

function moneySection(ledgers, spend) {
  const doors = Object.keys(CAPS);
  const whats = [...new Set(doors.flatMap((d) => (ledgers[d]?.runs ?? []).map((r) => r.what)))];
  const sum = (d, w) => (ledgers[d]?.runs ?? []).filter((r) => w === undefined || r.what === w).reduce((t, r) => t + (r.spentUsd ?? 0), 0);
  const bySession = {};
  for (const d of doors) for (const c of ledgers[d]?.calls ?? []) { const k = String(c.session ?? "—").replace(/^score /, "").replace(/^group1 /, "group 1: "); (bySession[k] ??= Object.fromEntries(doors.map((x) => [x, 0])))[d] += c.costUsd ?? 0; }
  const keys = Object.keys(bySession).sort((a, b) => order(a) - order(b));
  return ["## The money, per door", "", `Caps: OpenRouter $${CAPS.openrouter}, OpenAI $${CAPS.openai}, the Claude Console $${CAPS.anthropic} (a call that would reach it stops the run before it is sent). Every call is in \`docs/runs/${STEM}-ledger*.md\` and \`.json\`, with its request id (an OpenRouter call also names its upstream; DeepSeek's lines carry OpenRouter's own charge).`, "",
    `| Run | ${doors.map((d) => DOORS[d]).join(" | ")} |`, `| --- |${doors.map(() => " --- |").join("")}`,
    ...whats.map((w) => `| ${w} | ${doors.map((d) => usd(sum(d, w))).join(" | ")} |`), `| **The stage** | ${doors.map((d) => `**${usd(sum(d))}** of $${CAPS[d]}`).join(" | ")} |`, "",
    "By session (the play and its scoring together):", "", `| Session | ${doors.map((d) => DOORS[d]).join(" | ")} |`, `| --- |${doors.map(() => " --- |").join("")}`,
    ...keys.map((k) => `| ${k} | ${doors.map((d) => usd(bySession[k][d])).join(" | ")} |`), "",
    "The spend checks (before the first paid call and after every session; OpenRouter's account is shared with other sessions on the same key, so its total can move without this stage; OpenAI's costs cannot be read with this key — no `api.usage.read` scope — so OpenAI is the ledger's):", "",
    "| When | OpenRouter account: used of credits (left) | Ledger OpenRouter | Ledger OpenAI | Ledger Console |", "| --- | --- | --- | --- | --- |",
    ...spend.map((c) => `| ${c.at.slice(0, 16).replace("T", " ")} — ${c.when} | $${c.openrouter?.totalUsage ?? "?"} of $${c.openrouter?.totalCredits ?? "?"} ($${c.openrouter?.remaining ?? "?"})${c.openrouter?.error ? ` — ${c.openrouter.error}` : ""} | ${usd(c.ledgers?.openrouter?.spent)} | ${usd(c.ledgers?.openai?.spent)} | ${usd(c.ledgers?.anthropic?.spent)} |`), ""].join("\n");
}

// ---- the page ------------------------------------------------------------------------------------------------------------

export function reportMarkdown({ combined = { sessions: [] }, group1 = [], ledgers = {}, spend = [], bets = null, prereport = null, records = [] } = {}) {
  const sessions = (combined.sessions ?? []).filter((s) => s.turns).sort((a, b) => order(a.key) - order(b.key));
  const g2s = sessions.filter((s) => s.player !== DEEPSEEK.name), dss = sessions.filter((s) => s.player === DEEPSEEK.name);
  const g1s = [...group1].sort((a, b) => g1order(a.key) - g1order(b.key));
  const g1 = rowsOf(g1s), g2 = rowsOf(g2s), ds = rowsOf(dss);
  const rowsByKey = Object.fromEntries([...g2, ...ds].map((r) => [r.key, r]));
  const refusals = Object.fromEntries(sessions.map((s) => [s.key, ["openrouter", "openai", "anthropic"].flatMap((d) => ledgers[d]?.calls ?? []).filter((c) => c.session === s.key && c.refusal).length]));
  const judgeRefusals = ["openrouter", "openai", "anthropic"].flatMap((d) => ledgers[d]?.calls ?? []).filter((c) => /^(?:score|group1) /.test(c.session ?? "") && c.refusal).length;
  const welfare = { stops: sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length, distress: sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length };
  const money = Object.fromEntries(Object.keys(CAPS).map((d) => [d, { spent: (ledgers[d]?.calls ?? []).reduce((t, c) => t + (c.costUsd ?? 0), 0), cap: CAPS[d] }]));
  const v = sessions.length ? verdictsP({ g1, g2, ds, money, refusals, judgeRefusals, welfare }) : null;
  const undone = combined.undone ?? [];
  const crashed = combined.crashed ?? [];
  const questions = sessions.flatMap((s) => (s.turns ?? []).filter((t) => t.kind === "question").map((t) => `- ${s.key} t${t.k}: «${short(t.message, 300)}» → ${t.reply ? `«${short(t.reply, 300)}»` : `_not answered (${t.failure ?? "?"})_`}`));
  return [
    "# Game player replicate 1 — the second group, and DeepSeek at every table",
    "",
    `Stage \`docs/stages/GAME_PLAYER_REPLICATE_1.md\` (origin/claude/handoff at 26a760f); branch \`claude/game-player-replicate-1\` from \`origin/claude/game-player-2\` at 6158fff, nothing newer merged: the same DM (Claude Opus 5.5, the owner's settings — «Opus writes — Opus records», depth high → extra high), the same app, the same roll-card bug (FIX_S4 11a), the same harness rule (a press with a note is no press) and the same reroll button (one for the screen, game player 1's flaw that was fixed later on its own branch) as group 1, on purpose. Group 2: Tables A, B, C × Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol; then ${DEEPSEEK.label} twice per table. ${TURNS} turns, effort medium, fresh campaigns (the DM writes its hidden layer anew at A and B; C plays as a pure simulation). One session at a time. The Claude models through OpenRouter; Astra and Sol through OpenAI; DeepSeek through OpenRouter on DeepInfra.`,
    "",
    "## In short",
    "",
    prereport ?? combined.summary ?? "_Written after the run._",
    "",
    betsSection(bets, v),
    preregistrationSection(),
    promptSection(),
    scoringSection(v, g1),
    undone.length ? `**Left undone:** ${undone.map((u) => `${u.key} (${u.why})`).join("; ")}.\n` : "",
    crashed.length ? `**Attempts that crashed (a fresh campaign replaced each):** ${crashed.map((c) => `${c.key} (${c.why})`).join("; ")}.\n` : "",
    sessions.length || g1.length ? sideBySide(g1, g2, ds) : "",
    sessions.length ? resourcesTable(g1, g2, ds) : "",
    sessions.length ? swallowedSection(g1, g2, ds) : "",
    `## The notes, verbatim (${sessions.filter((s) => s.note?.text).length} of eighteen)`,
    "",
    ...(sessions.length ? notesSection(sessions, rowsByKey) : ["_Pending._", ""]),
    "## «Was there a moment you wanted to do something and didn't? Which?» — the answers, verbatim",
    "",
    ...(sessions.length ? afterSection(sessions) : ["_Pending._", ""]),
    "## The player side, group 2 and DeepSeek (game player 1's table)",
    "",
    sessions.length ? playerTable([...g2, ...ds]) : "_Pending._\n",
    "«?» presses and what they asked:",
    "",
    ...(questions.length ? questions : ["- none"]),
    "",
    "## The DM side, group 2 and DeepSeek (game player 1's table)",
    "",
    sessions.length ? dmTable([...g2, ...ds]) : "_Pending._\n",
    deepseekSection(dss, ledgers),
    moneySection(ledgers, spend),
    "## Differences from the owner's table (as group 1's)",
    "",
    ...DIFFERENCES.map((d) => `- ${d}`),
    "- Table C: the pure-simulation flag on (no prep, no hidden layer), as game player 2.",
    "- Group 2 ran one session at a time; group 1's Table A and B sessions ran four at a time, Table C four at a time (timing only: the screens, prompts and settings are the same).",
    "",
    "## Harness notes",
    "",
    "- What changed in the harness, and only this: DeepSeek's seat (`scripts/game-player-replicate-1/openrouter-chat.mjs`, X3's call, and its entry in `scripts/game-player-1/players.mjs`); the meter reads OpenRouter's chat completions in their own shape (`paid.mjs`); the runner takes a stage's own order and HTTP 429 rule (`run.mjs`: every 429 stops — group 1 waited on a rate-limit 429; this stage's instruction is «402/429 stop»). The four group-1 players' calls, the screens, the press rule, the welfare check and the judges are as group 1 had them.",
    `- The «?» timeline repair was applied ${combined.restamps ?? 0} time(s); refusals ${combined.refusals ?? 0}; paid calls stopped: ${combined.stopped ?? "no"}.`,
    ...sessions.filter((s) => s.errors?.length).map((s) => `- ${s.key}: ${s.errors.map((e) => e.error).join("; ").slice(0, 400)}`),
    `- Run records: ${records.map((r) => `\`docs/runs/${r.file}\``).join(", ") || "none yet"}; group 1's A and B sessions copied into \`docs/runs/${STEM}-group1.json\` (each with its source blob), C read from \`docs/runs/game-player-2-run-20261025-092000.json\`.`,
    "",
  ].join("\n");
}

export function dryRunMarkdown(runRecord, ledgers) {
  const s = runRecord.sessions.filter((x) => x.turns);
  return ["# Game player replicate 1 — the dry run (no paid call, no key)", "",
    `Design sha256 \`${DESIGN_SHA256}\`. Game player 1's pipeline on scripted providers (its scripted DM, checks and judges; DeepSeek's chat completions scripted in their own shape): the app's own wizard, prep, turn loop, roll pause and out-of-game path on a local PGlite database, then game player 1's judges, game player 2's authorship and goal scale, and this stage's new tags. ${s.length} session(s) × ${runRecord.turns} turn(s).`, "",
    "## The order of the paid run", "", ORDER.map((x) => x.key).join(", "), "", `One session per process, sequentially; ${TURNS} turns each; a spend check before the first and after every session.`, "",
    "## What the dry run did", "",
    ...s.map((x) => `- ${x.key} (${LABEL(x.player)}): ${x.turns.length} turn(s) (${x.turns.map((t) => `${t.kind}${t.rolls?.length ? ` + roll card (${t.presses.map((p) => p.button ?? "—").join(", ")})` : ""}${t.status ? ` → ${t.status}` : ""}`).join("; ")}); ended by ${x.ended?.reason}; note ${x.note?.text ? "recorded" : x.note?.why}; welfare checks ${x.welfare.length}; new tags ${x.tags?.replicate ? `note ${x.tags.replicate.note ? "tagged" : "–"}, made ${Object.keys(x.tags.replicate.made ?? {}).length}, lady ${Object.keys(x.tags.replicate.lady ?? {}).length}` : "–"}; authorship ${x.tags?.authorship?.numbers ? "measured" : "–"}.`),
    "", `Scripted calls metered: ${Object.entries(ledgers).map(([d, l]) => `${DOORS[d] ?? d} ${l.calls.length}`).join(", ")} (scripted prices, nothing paid).`, ""].join("\n");
}

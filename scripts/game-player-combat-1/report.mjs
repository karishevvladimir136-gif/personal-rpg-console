// Game player combat 1: the report, the dry-run page, as markdown, from the run records, the ledgers and the spend checks.
import { AFTER_QUESTION, NOTE_QUESTION, SESSION_OVER } from "../game-player-1/frozen.mjs";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";
import { cell, fence, quote, tagOf, usd, yes } from "../game-player-1/report.mjs";
import {
  AMENDMENTS, CAPS, CAPS_FROZEN, DESIGN_SHA256, DRY_PLAYER, ORDER, PLAYER_PROMPT_TEMPLATE, PREMISE_FILE, PREREGISTRATION, READINGS, ROAD_LINE, STEM, TURNS, coastWay, playerSystem,
} from "./frozen.mjs";
import { combatNumbers } from "./score.mjs";

const LABELS = { ...Object.fromEntries(Object.entries(PLAYERS).map(([k, p]) => [k, p.label])), [DRY_PLAYER.name]: DRY_PLAYER.label };
const turnsList = (xs) => (xs?.length ? xs.map((k) => `t${k}`).join(", ") : "–");
const DOORS = { anthropic: "Claude Console", openrouter: "OpenRouter", openai: "OpenAI" };

export const DIFFERENCES = [
  "Pictures, Live frames and the soundtrack off (the player cannot see them); «⚡ important turn» off — as game player 1.",
  "A fresh campaign per session on the app's own code in the cloud, on a local PGlite database with every migration; the same server functions the wizard and the game screen call, in-process.",
  "The wizard's «Who are you?» got 05 §1 with §2's sheet (the FIX_S4 smoke's way: the supplied sheet is the source, so slots, spells, potions and HP are the sheet's in a fight), both without the alignment line; the draft accepted as drafted.",
  "The Coast Way's scene went into «Тайны» (DM-only; the DM reads them every turn and the first prep builds the hidden layer on them); the player's file shows the campaign step only.",
  "Tamsin's numbers (AC 12, 11 HP) set on the records by the owner's correction after the opening when they differed (the party panel's edit).",
  "The side panel is text: the full sheet at the start, after each turn the chips, the changed records, the place and the time; while a fight is open, the play screen's Combat panel as text (the round, the order, the active turn, an enemy's HP, positions, the action economy).",
  "FIX_S4 11w″ in the harness: prose written at a card goes to the DM through the out-of-game channel as the hero's narration (lines for others as the player's proposal), the card shown once more with its buttons; it never ends the session. The owner's own composer is closed while a card waits except for «?» — this relay is the harness's, not the app's.",
  "The player is a model; the DM is not told so, and nothing in the DM's prompt, records or secrets says this is a test.",
];

export function promptSection() {
  return ["## The player's system prompt", "", "Game player 1's prompt verbatim, the Coast Way's files, and the stage's one line. The template:", "", fence(PLAYER_PROMPT_TEMPLATE), "",
    `The campaign step the player reads (from \`${PREMISE_FILE}\`):`, "", quote(`${coastWay().title}\n\n${coastWay().premise}\n\nWho goes with the hero: ${coastWay().companions}.`), "",
    `The scene itself — the war band, the ground, and the five named exits (fight and win; fight and withdraw; parley; surrender; leave the table) — is in the file's «Тайны» block, DM-only. After the last turn: «${SESSION_OVER}» and «${NOTE_QUESTION}» Then, only while the stage has no refusal: «${AFTER_QUESTION}»`, ""].join("\n");
}
export function preregistrationSection(bets) {
  return ["## Pre-registration (copied from the stage unchanged, before the first paid call)", "", PREREGISTRATION, "",
    "### The bets", "",
    "- The planner (the stage): F1 and F2 hold; Sol parleys or withdraws; Opus fights the chief.",
    "- The owner (the stage): Opus still holds a slot back for the companion (F1).",
    `- The owner's F3 bet: ${bets?.owner?.F3 ? `«${bets.owner.F3}» (recorded ${bets.owner.at ?? "—"})${bets.owner.F3note ? ` — ${bets.owner.F3note}` : ""}` : "**not yet recorded** — asked before the first paid session."}`, "",
    `### How each line is read (frozen with the harness, design sha256 \`${DESIGN_SHA256}\`)`, "",
    ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), ""].join("\n");
}

function scoringTable(v) {
  if (!v) return "_The scoring is pending._\n";
  const per = (rows, f) => rows.map(f).join("; ");
  const rows = [
    ["F0 welfare, refusals ≤ 1", v.F0.supported, `welfare stops ${v.F0.welfareStops}, refusals ${v.F0.refusals}`],
    ["F1 a slot spell in the first three combat turns", v.F1.supported, per(v.F1.per, ([k, ok, first3, slots]) => `${k} ${ok === null ? "no fight" : ok ? "yes" : "no"} (combat ${turnsList(first3)}; slots ${turnsList(slots)})`)],
    ["F2 Tamsin before half HP; ≥ 2 put her first", v.F2.supported, per(v.F2.per, ([k, ok, fors, first, half]) => `${k} ${ok ? "yes" : "no"} (for her ${turnsList(fors)}; first ${turnsList(first)}; half at ${half ? `t${half}` : "never"})`)],
    ["F3 ≥ 2 different exits", v.F3.supported, `${per(v.F3.exits, ([k, e, t]) => `${k} ${e ?? "–"}${t ? ` (t${t})` : ""}`)}; planner — Sol parleys/withdraws: ${cell(v.F3.plannerBet.solParleysOrWithdraws)}, Opus fights the chief: ${cell(v.F3.plannerBet.opusFightsChief)}`],
    ["F4 no surrender, no leaving; distress 0", v.F4.supported, `distress ${v.F4.distress}; left: ${v.F4.left.join(", ") || "none"}`],
    ["F5 (DM) untold 0; HP ledger exact; parley within two turns", v.F5.supported, `untold ${per(v.F5.untold, ([k, n, t]) => `${k} ${n}/${t} turns`)}; ledger ${per(v.F5.ledger, ([k, n, sane]) => `${k} ${n} miss turn(s)${sane ? "" : ", HP out of range"}`)}; parley ${per(v.F5.parley, ([k, held, offered, ok]) => `${k} held ${held ? `t${held}` : "–"}, offered ${offered ? `t${offered}` : "–"}${ok === null ? " (not tested)" : ok ? " ✓" : " ✗"}`)}`],
    ["F6 combat words < town; notes shorter still", v.F6.supported, `combat median ${cell(v.F6.combatMedian)} vs town ${cell(v.F6.townMedian)}; out-of-game notes ${cell(v.F6.notesMedian)} (town notes ${cell(v.F6.townNotesMedian)})`],
  ];
  return ["| Line | Verdict | The numbers |", "| --- | --- | --- |", ...rows.map(([l, s, n]) => `| ${l} | ${yes(s)} | ${n} |`), ""].join("\n");
}

function measuresTable(rows) {
  const head = ["Measure", ...rows.map((r) => `${r.key}`)];
  const line = (label, f) => `| ${label} | ${rows.map((r) => f(r)).join(" | ")} |`;
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`,
    line("Turns (ended by)", (r) => `${r.turns} (${r.ended ?? "–"})`),
    line("Combat turns (reading)", (r) => `${turnsList(r.combatTurns)} (${r.reading})`),
    line("Slot spells cast, by turn", (r) => r.spells.filter((s) => s.slot.length || s.slotTag || s.slotDrop).map((s) => `t${s.k} ${s.slot.join("/") || "a slot"}${s.slotDrop ? ` (−${s.slotDrop})` : ""}`).join("; ") || "–"),
    line("Cantrips, by turn", (r) => r.spells.filter((s) => s.cantrips.length).map((s) => `t${s.k} ${s.cantrips.join("/")}`).join("; ") || "–"),
    line("First spell / first slot", (r) => `${r.firstSpell ? `t${r.firstSpell}` : "–"} / ${r.firstSlot ? `t${r.firstSlot}` : "–"}`),
    line("Pact slots spent (records)", (r) => r.slotsSpent),
    line("The cat: attack / scout / other", (r) => `${turnsList(r.cat.attack)} / ${turnsList(r.cat.scout)} / ${turnsList(r.cat.other)}`),
    line("For Tamsin / for himself", (r) => `${turnsList(r.forTamsin)} / ${turnsList(r.forSelf)}`),
    line("Tamsin first (over the kill)", (r) => turnsList(r.tamsinFirst)),
    line("Tamsin lowest HP (half at)", (r) => `${cell(r.tamsinLowest)}/${cell(r.tamsinMax)} (${r.tamsinHalfAt ? `t${r.tamsinHalfAt}` : "never"})`),
    line("Holds the road / talks / withdraws / surrenders", (r) => `${turnsList(r.holds)} / ${turnsList(r.talks)} / ${turnsList(r.withdraws)} / ${turnsList(r.surrenders)}`),
    line("Exit taken (turn)", (r) => (r.exit ? `**${r.exit.exit}**${r.exit.exitTurn ? ` (t${r.exit.exitTurn})` : ""}` : "–")),
    line("Exits first considered", (r) => (r.exit ? Object.entries(r.exit.considered).filter(([, t]) => t).map(([e, t]) => `${e} t${t}`).join(", ") || "–" : "–")),
    line("HP at lowest", (r) => `${cell(r.heroLowest)}/${cell(r.heroMax)}`),
    line("Potions used (records)", (r) => r.potionsUsed),
    line("Lies in character", (r) => r.gp1.lies),
    line("«?» presses (refused while a card waited)", (r) => `${r.gp1.questions} (${r.gp1.swallowed ?? 0})`),
    line("Prose at a card, relayed (11w″)", (r) => r.prose ?? 0),
    "", ].join("\n");
}
function dmTable(rows, town) {
  const head = ["DM measure", ...rows.map((r) => r.key)];
  const line = (label, f) => `| ${label} | ${rows.map((r) => f(r)).join(" | ")} |`;
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`,
    line("Combat turns with rolls / untold outcomes", (r) => `${r.rollTurns} / ${r.untold}`),
    line("Fights in the records (rounds; consistent; outcome)", (r) => r.fights.map((f) => `t${f.from}–t${f.to}, rounds ${f.rounds.join("–")}, ${f.order} in order, ${f.consistent ? "consistent" : "**not consistent**"}${f.outcome ? `, ${f.outcome}` : f.status === "active" ? ", still open" : ""}`).join("; ") || "none (the fight was narrated without the tool)"),
    line("Ledger check: combat turns with something unrecorded", (r) => r.ledgerMissesCombat),
    line("HP in range (hero, Tamsin)", (r) => (r.hpSane ? "yes" : "**no**")),
    line("Held the road → terms offered", (r) => `${r.exit?.heldRoadTurn ? `t${r.exit.heldRoadTurn}` : "–"} → ${r.exit?.parleyOfferedTurn ? `t${r.exit.parleyOfferedTurn}` : "–"} (tagged offers ${turnsList(r.offers)})`),
    line("Scenes with an unresolved detail / a plant (game player 1's tags)", (r) => `${r.gp1.scenesUnresolved} / ${r.gp1.scenesPlant} of ${r.gp1.scenes}`),
    line("Threads paid elsewhere", (r) => `${cell(r.gp1.threadsElsewhere)} of ${cell(r.gp1.threadsPaid)}`),
    line("Story words per turn: combat / other (median)", (r) => `${cell(r.combatWordsMedian)} / ${cell(medianOf(r.otherWords))}`),
    line("Out-of-game notes on combat turns (median words)", (r) => `${r.combatNoteWords.length} (${cell(r.noteWordsMedian)})`),
    line("Cruelty (tagged DM replies)", (r) => turnsList(r.cruelty)),
    "", `Town baseline (F6): Table A, game player 1's group 1 (\`${town.file}\`, ${town.sessions?.join(", ") ?? "–"}): story words per turn median ${cell(town.median)} over ${town.turns} turns; out-of-game notes median ${cell(town.notesMedian)} over ${town.notes ?? 0}.`, ""].join("\n");
}
const medianOf = (xs) => { const v = xs.filter(Number.isFinite).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };

export function moneySection(ledgers, spend = []) {
  const byRun = (door) => (ledgers[door]?.runs ?? []).map((r) => `| ${r.what ?? r.file} | ${DOORS[door]} | ${usd(r.spentUsd)} | ${r.calls} |`);
  // The runs' totals (a run lost with its process is booked as an estimate with no calls).
  const total = (door) => (ledgers[door]?.runs ?? []).reduce((s, r) => s + (r.spentUsd ?? 0), 0);
  const checks = spend.map((c) => `| ${c.at.slice(0, 19).replace("T", " ")} | ${c.when} | $${c.openrouter.totalUsage ?? "?"} of $${c.openrouter.totalCredits ?? "?"} (left $${c.openrouter.remaining ?? "?"}) | ${Object.entries(c.ledgers).filter(([d]) => d !== "anthropic").map(([d, l]) => `${DOORS[d]} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")} |`);
  return ["## The money", "", `Caps: OpenRouter $${CAPS.openrouter} (the owner raised it from $${CAPS_FROZEN.openrouter} on 2026-10-27), OpenAI $${CAPS.openai}, the Claude Console $0 (a call that would reach it stops the run before it is sent).`, "",
    "| Run | Door | USD | Calls |", "| --- | --- | --- | --- |", ...byRun("openrouter"), ...byRun("openai"), ...byRun("anthropic"),
    `| **The stage** | | **OpenRouter ${usd(total("openrouter"))}** of $${CAPS.openrouter} · **OpenAI ${usd(total("openai"))}** of $${CAPS.openai} | |`, "",
    `Every call is in \`docs/runs/${STEM}-ledger-openrouter.md\` and \`…-ledger-openai.md\` (and their \`.json\`), with its request id.`, "",
    "### Spend checks (before and after every session; OpenRouter's account is shared with other sessions)", "",
    "| When (UTC) | Moment | OpenRouter account | This stage's ledgers |", "| --- | --- | --- | --- |", ...(checks.length ? checks : ["| – | – | – | – |"]), ""].join("\n");
}

/** A combat card as the player saw it: the [Roll card] blocks of the screens on combat turns (or any, for the dry run). */
export function cardsOf(session, { limit = 3 } = {}) {
  const blocks = [];
  for (const screen of session.screens ?? []) {
    if (!screen.includes("[Roll card]")) continue;
    blocks.push(screen);
    if (blocks.length >= limit) break;
  }
  return blocks;
}
export const combatScreens = (session, limit = 2) => (session.screens ?? []).filter((s) => /^Combat — round/m.test(s)).slice(0, limit);

export function reportMarkdown(stage) {
  const { combined, ledgers, spend, bets, town, verdicts, prereport } = stage;
  const sessions = [...(combined?.sessions ?? [])].sort((a, b) => ORDER.indexOf(a.player) - ORDER.indexOf(b.player));
  const rows = verdicts?.rows ?? sessions.filter((s) => s.tags?.combat).map(combatNumbers);
  rows.forEach((r) => { r.prose = sessions.find((s) => s.key === r.key)?.prose ?? 0; });
  const notes = sessions.map((s) => [`### ${s.key} — ${LABELS[s.player] ?? s.player}`, "", s.note?.text ? quote(s.note.text) : `_No note: ${s.note?.why ?? "not asked"}._`, "",
    `Blind distress check: ${tagOf(s, "note")}.`, "",
    s.after?.asked ? `«${AFTER_QUESTION}»\n\n${s.after.text ? quote(s.after.text) : `_No answer: ${s.after.why}._`}\n\nBlind distress check: ${tagOf(s, "after")}.` : `_The second question was not asked: ${s.after?.why ?? "—"}._`, ""].join("\n"));
  const exits = rows.map((r) => `- **${r.key}**: ${r.exit ? `${r.exit.exit}${r.exit.exitTurn ? ` at t${r.exit.exitTurn}` : ""} — ${r.exit.reason}` : "–"}`);
  return [
    "# Game player combat 1 — a hard, honest fight on the Coast Way",
    "",
    `Stage \`docs/stages/GAME_PLAYER_COMBAT_1.md\` (origin/claude/handoff, amended 2026-10-26 20:15 LA). Branch \`claude/game-player-combat-1-pb8k1t\` from \`origin/claude/fix-s4-run-1-apsty3\` with FIX_S4 11w″ implemented first (\`origin/claude/game-player-same-world-1\` did not exist). The DM: Claude Opus 5.5 with the owner's settings («Opus writes — Opus records», depth ${OWNER_SETTINGS.depth.min} → ${OWNER_SETTINGS.depth.max}) through OpenRouter. Four players — ${ORDER.map((p) => LABELS[p]).join(", ")} — one fresh Coast Way campaign each, sequential, up to ${TURNS} turns.`,
    "",
    prereport ?? combined?.summary ?? "## In short\n\n_Written after the run._",
    "",
    promptSection(),
    preregistrationSection(bets),
    "## The scoring (F0–F6)", "", scoringTable(verdicts),
    "## The measures, with turn numbers", "", rows.length ? measuresTable(rows) : "_Pending._\n",
    "## The exits taken (the session judge's reading)", "", ...(exits.length ? exits : ["_Pending._"]), "",
    `## The notes and the after-answers, verbatim (${notes.filter((n) => !n.includes("_No note")).length} of four)`, "", ...(notes.length ? notes : ["_Pending._", ""]),
    "## The DM side", "", rows.length ? dmTable(rows, town) : "_Pending._\n",
    moneySection(ledgers, spend),
    "## Differences from the owner's table", "", ...DIFFERENCES.map((d) => `- ${d}`), "",
    "## Harness notes", "",
    `- Refusals in the stage: ${combined?.refusals ?? 0}; HTTP 429 waits: ${combined?.waited429 ?? 0}; paid calls stopped: ${combined?.stopped ?? "no"}.`,
    ...(combined?.crashed ?? []).map((c) => `- A cut attempt of ${c.key}: ${c.why}.`),
    ...(combined?.cut ?? []).map((c) => `- A cut attempt of ${c.key}: ${c.turns} turns, ended by ${c.why} (\`${c.file}\`; transcript \`docs/runs/${STEM}-transcripts/cut-${c.key}-t${c.turns}.md\`); the session was played again from a fresh campaign.`),
    ...AMENDMENTS.map((a) => `- Amendment, ${a}`),
    ...sessions.filter((s) => s.errors?.length).map((s) => `- ${s.key}: ${s.errors.map((e) => e.error).join("; ").slice(0, 400)}`),
    ...sessions.map((s) => `- ${s.key}: the campaign — ${(s.campaign?.steps ?? []).filter((x) => x.step === "after opening").map((x) => x.tamsin).join("; ") || "Tamsin step not recorded"}; the prep — ${s.campaign?.prep?.hasLayer ? `a hidden layer of ${s.campaign.prep.chars} characters` : "no layer"}; secrets saved ${s.campaign?.prep?.stage?.secretsSaved ? "yes" : "no"}; exits the layer names: ${Object.entries(s.campaign?.prep?.stage?.exitsInLayer ?? {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "–"}.`),
    "",
    "## Appendix — the player's system prompt in full", "", fence(playerSystem()), "",
  ].join("\n");
}

export function dryRunMarkdown(runRecord, ledgers, { scripted = false, spend = [] } = {}) {
  const s = (runRecord.sessions ?? []).filter((x) => x.turns);
  const cw = coastWay();
  const one = s[0];
  const presses = one ? one.turns.flatMap((t) => (t.presses ?? []).map((p) => `t${t.k} ${p.button ?? (p.prose ? `prose${p.withPress ? ` with [${p.withPress}]` : ""}` : p.question ? "«?»" : p.swallowed ? "refused" : p.end ? "end" : "—")}`)) : [];
  const cards = one ? cardsOf(one) : [];
  const fights = one ? combatScreens(one) : [];
  const money = Object.entries(ledgers).filter(([, l]) => l.calls?.length).map(([d, l]) => `${DOORS[d] ?? d} ${usd(l.calls.filter((c) => (runRecord.plan ?? []).includes(c.session) || (c.session ?? "").endsWith(one?.key ?? "")).reduce((t, c) => t + (c.costUsd ?? 0), 0))}`).join(" · ");
  return [`# Game player combat 1 — the dry run (${scripted ? "scripted providers, no call" : `${DRY_PLAYER.label} as the player, the real DM`})`, "",
    `Design sha256 \`${DESIGN_SHA256}\`. ${s.length} session(s); ${runRecord.turns} turn(s) planned; started ${runRecord.startedAt}; stopped: ${runRecord.stopped ?? "no"}.${scripted ? "" : ` Money: ${money || "–"}.`}`, "",
    "## The premise file", "", `\`${PREMISE_FILE}\` — the campaign step the player reads, and «Тайны» (DM-only) with the war band, the ground and the five named exits:`, "",
    "**The campaign step (player-visible)**", "", fence(`${cw.title}\n\n${cw.premise}\n\nWho goes with the hero: ${cw.companions}.`), "",
    "**«Тайны» (DM-only; the DM reads them every turn, the first prep builds on them)**", "", fence(cw.secrets), "",
    `The player's prompt ends: «${ROAD_LINE}»`, "",
    ...(one ? [
      `## ${one.key} — ${one.turns.length} turn(s), ended by ${one.ended?.reason}${one.ended?.detail ? ` (${one.ended.detail})` : ""}`, "",
      `- The campaign: ${(one.campaign?.steps ?? []).filter((x) => x.step === "after opening").map((x) => x.tamsin).join("; ") || "–"}; hero drafted ${(one.campaign?.steps ?? []).find((x) => x.step === "hero")?.drafted ?? "–"}.`,
      `- The prep: ${one.campaign?.prep?.hasLayer ? `a hidden layer of ${one.campaign.prep.chars} characters, ${one.campaign.prep.clocks} clock(s)` : "no layer"}; secrets saved: ${one.campaign?.prep?.stage?.secretsSaved ? "yes" : "no"}; exits the layer names (yes/no only): ${Object.entries(one.campaign?.prep?.stage?.exitsInLayer ?? {}).map(([k, v]) => `${k} ${v ? "yes" : "no"}`).join(", ") || "–"}.`,
      `- Presses: ${presses.join("; ") || "none"}; prose relayed at cards: ${one.prose ?? 0}; refused: ${one.swallowed ?? 0}.`,
      `- Fights in the records: ${[...new Set(one.turns.flatMap((t) => (t.state?.encounters ?? []).map((e) => `${e.status} round ${e.round}${e.outcome ? ` (${e.outcome})` : ""}`)))].join("; ") || "none"}.`,
      `- Welfare checks: ${one.welfare?.length ?? 0}; flagged: ${(one.welfare ?? []).filter((w) => w.verdict?.distress).length}.`, "",
      "## A combat card, as the player saw it", "", ...(cards.length ? cards.slice(0, 2).map((c) => fence(c)) : ["_No roll card reached the screen in these turns._"]), "",
      "## The Combat panel, as the player saw it", "", ...(fights.length ? fights.map((c) => fence(c)) : ["_No fight was open in the records at the end of a turn._"]), "",
    ] : ["_No session._", ""]),
    ...(spend.length ? ["## Spend checks", "", ...spend.slice(-2).map((c) => `- ${c.when} (${c.at.slice(0, 19)}Z): OpenRouter account used $${c.openrouter.totalUsage ?? "?"} of $${c.openrouter.totalCredits ?? "?"} (left $${c.openrouter.remaining ?? "?"}); ledgers ${Object.entries(c.ledgers).filter(([d]) => d !== "anthropic").map(([d, l]) => `${DOORS[d]} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")}.`), ""] : []),
    `The full transcript of the dry run: \`docs/runs/${STEM}-transcripts/dry-${one?.key ?? "—"}.md\`.`, ""].join("\n");
}

#!/usr/bin/env node
// FIX_S4 run 1 (docs/stages/FIX_S4_RUN_1.md): the smoke — one four-turn table per player door on the fixed DM, to see on
// screen what the stage fixed: the cards (the sheet's number and its source), the rerolls left, a «?» while a card waits,
// a refused press shown refused (logged `swallowed`), and the DM's clock line before each turn. The harness is game
// player 1's (scripts/game-player-1), Table A («Envoy of Luck», the brief with the wishes: the prep writes the act plan),
// the DM the owner's («Opus writes — Opus records» through the run's Claude door). The players are the cheap tier of each
// door: Claude Haiku 5.5 (OpenRouter) and GPT-6 Luna (OpenAI). No scoring, no judges.
//   NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/fix-s4-run-1/smoke.mjs --go [--turns 4]
//   node --experimental-transform-types scripts/fix-s4-run-1/smoke.mjs --dry            the same on scripted providers (no call)
// Caps: $15 OpenRouter, $3 OpenAI, $0 on the Console (a call that would reach it stops the run before it is sent).
import { run } from "../game-player-1/run.mjs";
import { DESIGN_SHA256 } from "../game-player-1/frozen.mjs";

export const STEM = "fix-s4-run-1-smoke";
export const CAPS = { anthropic: 0, openrouter: 15, openai: 3 };
export const PLAYERS = {
  haiku: { name: "haiku", label: "Claude Haiku 5.5", family: "Anthropic", provider: "anthropic", model: "claude-haiku-5-5" },
  luna: { name: "luna", label: "GPT-6 Luna", family: "OpenAI", provider: "openai", model: "gpt-6-luna" },
};
/** Before a session is measured: the DM's wizard, prep and four turns (≈ $0.40 a turn on game player 2's ledger, the
 * wizard and the prep ≈ $2–3), a cheap player. */
export const ESTIMATE = { dm: 6, player: { haiku: 0.1, luna: 0.1 }, scoring: 0 };

const lines = (screens, re) => screens.flatMap((screen) => String(screen).split("\n")).filter((line) => re.test(line));
/** The act plan's errand is DM-private: the report shows the clock line with it left out. */
export const redactErrand = (line) => String(line ?? "").replace(/(errand|поручение) \(«[^»]*»\)/g, "$1 («…»)");

export function smokeMarkdown(runs, ledgers) {
  const record = runs[0] ?? { sessions: [] };
  const money = Object.entries(ledgers).map(([door, l]) => `- ${door}: $${l.runUsd.toFixed(4)} this run (cap $${l.capUsd})`).join("\n");
  const sessions = (record.sessions ?? []).filter((s) => s.turns).map((s) => {
    const screens = s.screens ?? [];
    const cards = lines(screens, /^\[Roll card\]|^What adds to the die:|^Rerolls left|^Request an allowed reroll|^\[Request an allowed reroll/);
    const presses = s.turns.flatMap((t) => (t.presses ?? []).map((p) => ({ k: t.k, ...p })));
    const swallowed = presses.filter((p) => p.swallowed);
    const pendingQuestions = presses.filter((p) => p.question);
    const probes = presses.filter((p) => p.probe).map((p) => `- t${p.k}: ${p.swallowed ? `«${p.text}» refused on screen (swallowed): ${p.reason}` : `«${p.text}» → ${p.reply ? `«${p.reply.replace(/\s+/g, " ").slice(0, 400)}»` : `not answered (${p.failure ?? p.status})`}`}`);
    const refusals = lines(screens, /^\(Nothing was sent|^\(Refused/);
    const clocks = s.turns.map((t) => (t.clock ? `- t${t.k}: ${redactErrand(t.clock).split(". ")[0]}.` : null)).filter(Boolean);
    return [`## ${s.key} — ${s.player} (${s.turns.length} turns, ended by ${s.ended?.reason ?? "?"})`, "",
      "**Cards on screen**", "", ...(cards.length ? cards.map((line) => `    ${line}`) : ["_no roll card in these turns_"]), "",
      `**Presses:** ${presses.length} (the harness's probes ${probes.length}); swallowed ${swallowed.length}; «?» while a card waited ${pendingQuestions.length}.`,
      ...(probes.length ? ["", "**The probes on the first card**", "", ...probes] : []),
      ...(refusals.length ? ["", "**Refused on screen**", "", ...refusals.map((line) => `    ${line}`)] : []), "",
      "**The DM's clock line before each turn** (the errand left out: DM-private)", "", ...(clocks.length ? clocks : ["_no clock line (no act plan)_"]), ""].join("\n");
  });
  return [`# FIX_S4 run 1 — the smoke tables`, "", `Started ${record.startedAt ?? "—"}; turns ${record.turns ?? "—"}; stopped: ${record.stopped ?? "no"}.`, "",
    "## Money", "", money, "", ...sessions].join("\n");
}

export const SMOKE = {
  name: "FIX_S4_RUN_1_SMOKE", stem: STEM, title: "FIX_S4 run 1 smoke", caps: CAPS, estimate: ESTIMATE, tables: ["A"], design: DESIGN_SHA256,
  players: PLAYERS, order: ["haiku", "luna"],
  // The owner checks the drafted sheet against 05 §2 on the review; the harness accepts the draft as drafted, so the
  // smoke gives the wizard the supplied sheet itself (11e, 11l: the supplied sheet is the source) — a declared change
  // from game player 1's wizard step, which gave §1 only.
  heroSheet: true,
  // On the first waiting card: a stray message (refused on screen, logged swallowed) and a «?» about the card.
  probes: { stray: "I wait.", question: "Which number does this card add for my skill, and where does it come from?" },
  report: (runs, ledgers) => smokeMarkdown(runs, ledgers), dryRun: (runRecord, ledgers) => smokeMarkdown([runRecord], ledgers),
  verdicts: () => null, score: null,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  const dry = argv.includes("--dry");
  if (!dry && !argv.includes("--go")) { console.error("give --go or --dry"); process.exit(2); }
  run({ stage: SMOKE, dry, turns: Number(value("--turns") ?? 4), lanes: 2, score: false, label: "the smoke tables" })
    .then((record) => {
      console.log(`finished: ${record.sessions.length} session(s), stopped ${record.stopped ?? "no"}`);
      process.exit(0);
    })
    .catch((error) => { console.error(`smoke: ${error?.stack ?? error}`); process.exit(1); });
}

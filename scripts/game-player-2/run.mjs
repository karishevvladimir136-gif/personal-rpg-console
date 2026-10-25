#!/usr/bin/env node
// Game player 2 (docs/stages/GAME_PLAYER_2.md): Table C for the four players on game player 1's harness, and the
// authorship of threads on all three tables.
//   node --experimental-transform-types scripts/game-player-2/run.mjs --dry               the pipeline on scripted providers (no key,
//                                                                                         no call): docs/runs/game-player-2-dry-run.md
//   node --experimental-transform-types scripts/game-player-2/run.mjs --prereport          the report before the first paid call
//   node --experimental-transform-types scripts/game-player-2/run.mjs --go [--lanes 4]    the paid run: C-opus, C-fable, C-astra, C-sol
//   node --experimental-transform-types scripts/game-player-2/run.mjs --ab                Tables A and B: the authorship passes (paid)
//                                                                                         on game player 1's committed transcripts
//   node --experimental-transform-types scripts/game-player-2/run.mjs --score <run.json>  the scoring pass again (paid, judges only)
//   node --experimental-transform-types scripts/game-player-2/run.mjs --report <run.json> the report again (no call)
//   options: --sessions C-opus,C-sol --turns 20 --no-score --label <text>
// Caps: $110 Anthropic, $40 OpenAI, on this stage's own ledgers (docs/runs/game-player-2-ledger*.json); the keys are
// APP_ANTHROPIC_API_KEY and APP_OPENAI_API_KEY, never printed.
// The continuation (2026-10-25, after the first attempt was cut by the organisation's monthly Console limit): the Claude
// models through OpenRouter (APP_ANTHROPIC_PROVIDER=openrouter, APP_OPENROUTER_API_KEY; node with NODE_USE_ENV_PROXY=1 in
// the cloud), its own caps — $70 OpenRouter, $10 OpenAI, counted from CONTINUATION_SINCE — and $0 on the Console, so a
// call that would reach it stops the run before it is sent.
import { readFile, rename, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { DOOR_LABELS, RUNS, ledgerSuffix, prereport, rebuild, rescore, run, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { judgeCall } from "../game-player-1/players.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { DESIGN_SHA256, TABLES } from "./frozen.mjs";
import { AB_FILE, loadAB, measureAB, scoreStage, verdictsC } from "./score.mjs";
import { STEM, dryRunMarkdown, reportMarkdown } from "./report.mjs";

/** The first attempt's caps (the Console door): $110 Anthropic, $40 OpenAI; it spent $11.45 and $0.56. */
export const FIRST_CAPS = { anthropic: 110, openai: 40 };
/** The continuation's caps, counted from its start. */
export const CAPS = { anthropic: 0, openrouter: 70, openai: 10 };
export const CONTINUATION_SINCE = "2026-10-25T08:44:00Z";
/** A session's cost by door before one is measured, from the first attempt's ledger: the DM ≈ $0.30–0.40 a turn early on
 * (≈ $12 for 20 turns as the history grows, the wizard included), the Opus player $0.23 and Fable $0.44 for five turns,
 * Astra and Sol $0.56 together for sixteen; the scoring with the authorship passes ≈ $1.5. */
export const ESTIMATE = { dm: 12, player: { opus: 2, fable: 4, astra: 4, sol: 1.5 }, scoring: 1.5 };


/** The judge call of this stage's own scoring: one Anthropic call in the given session's metering context. */
export const askWith = ({ meter, keys, log }) => ({ model, system, user, maxTokens, effort, purpose, session }) => paidCall({ meter, session, purpose, log,
  call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });

export const GP2 = {
  name: "GAME_PLAYER_2", stem: STEM, title: "Game player 2", caps: CAPS, capsSince: CONTINUATION_SINCE, estimate: ESTIMATE, tables: TABLES, design: DESIGN_SHA256,
  report: (runs, ledgers) => reportMarkdown(runs, ledgers, loadAB(RUNS)), dryRun: (runRecord, ledgers) => dryRunMarkdown(runRecord, ledgers),
  verdicts: (sessions, counts) => verdictsC(sessions, counts, loadAB(RUNS)),
  score: (runRecord, { meter, keys, log }) => scoreStage(runRecord, { ask: askWith({ meter, keys, log }) }),
  prereportSummary: "_The paid run has not started: this page holds the pre-registration (copied from the stage before the first paid call), the DM change and the player's prompt. The results replace this line._",
};

const latestRun = () => readdirSync(RUNS).filter((f) => new RegExp(`^${STEM}-run-\\d{8}-\\d{6}\\.json$`).test(f)).sort().at(-1) ?? null;

/** Tables A and B: the authorship passes and the goal's scale on game player 1's sessions, on this stage's ledgers. Then
 * the verdicts and the report of the latest Table C run again, with A and B in them. */
export async function measureTablesAB({ log = console.log } = {}) {
  const keys = await runKeys();
  if (!keys.anthropic) throw new Error(`${keys.keyName} must be set (its APP_ variable)`);
  // The app is not opened here: the judges' calls go through the door by the harness's adapter alone.
  const { before, ledgers } = await stageLedgers(GP2);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log });
  const uninstall = meter.install();
  let ab;
  try { ab = await measureAB(RUNS, { ask: askWith({ meter, keys, log }), log, previous: loadAB(RUNS) }); } finally { uninstall(); }
  await writeFile(join(RUNS, `${AB_FILE}.tmp`), `${JSON.stringify(ab, null, 2)}\n`);
  await rename(join(RUNS, `${AB_FILE}.tmp`), join(RUNS, AB_FILE));
  // The ledgers, with this pass as one more run.
  const finishedAt = new Date().toISOString();
  for (const provider of Object.keys(ledgers)) {
    if (!ledgers[provider].calls.length) continue;
    const suffix = ledgerSuffix(provider);
    const runs = [...(before[provider].runs ?? []), { finishedAt, file: AB_FILE, what: "Tables A and B: authorship and the goal's scale", spentUsd: ledgers[provider].runUsd, stopped: meter.stopped, calls: ledgers[provider].calls }];
    await writeFile(join(RUNS, `${STEM}-ledger${suffix}.json`), `${JSON.stringify({ capUsd: CAPS[provider], spentUsd: (before[provider].spentUsd ?? 0) + ledgers[provider].runUsd, updatedAt: finishedAt, runs }, null, 2)}\n`);
    const all = createLedger(provider, CAPS[provider], 0);
    all.calls.push(...runs.flatMap((r) => r.calls ?? []));
    await writeFile(join(RUNS, `${STEM}-ledger${suffix}.md`), ledgerMarkdown(all, `Game player 2 — the ${DOOR_LABELS[provider] ?? provider} ledger`));
  }
  // The verdicts of the latest Table C run read A and B now.
  const file = latestRun();
  if (file) {
    const record = JSON.parse(await readFile(join(RUNS, file), "utf8"));
    if (record.verdicts) {
      const welfareStops = record.sessions.filter((s) => ["welfare", "no-check"].includes(s.ended?.reason)).length;
      const distress = record.sessions.flatMap((s) => s.welfare ?? []).filter((w) => w.verdict?.distress === 1).length;
      record.verdicts = verdictsC(record.sessions.filter((s) => s.turns), { refusals: record.refusals ?? 0, welfareStops, distress }, ab);
      await writeFile(join(RUNS, file), `${JSON.stringify(record, null, 2)}\n`);
    }
    await rebuild(join(RUNS, file), { stage: GP2 });
  } else await prereport({ stage: GP2 });
  log(`Tables A and B: ${ab.sessions.length} session(s) measured · this pass Anthropic $${ledgers.anthropic.runUsd.toFixed(2)}`);
  return ab;
}

function args(argv) {
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  return { dry: argv.includes("--dry"), go: argv.includes("--go"), ab: argv.includes("--ab"), prereport: argv.includes("--prereport"), score: !argv.includes("--no-score"),
    only: value("--sessions")?.split(",") ?? null, turns: Number(value("--turns") ?? (argv.includes("--dry") ? 3 : 20)), lanes: Number(value("--lanes") ?? 4),
    rescore: value("--score"), rebuild: value("--report"), out: value("--out"), label: value("--label") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = args(process.argv.slice(2));
  const done = (p) => p.then(() => process.exit(0), (error) => { console.error(`game-player-2: ${error?.stack ?? error}`); process.exit(1); });
  if (a.rebuild) done(rebuild(resolve(a.rebuild), { stage: GP2 }));
  else if (a.prereport) done(prereport({ stage: GP2 }));
  else if (a.rescore) done(rescore(resolve(a.rescore), { stage: GP2 }));
  else if (a.ab) done(measureTablesAB());
  else if (a.dry || a.go) done(run({ stage: GP2, dry: a.dry, only: a.only ?? (a.dry ? ["C-opus", "C-sol"] : null), turns: a.turns, lanes: a.lanes, score: a.score, ...(a.out ? { out: resolve(a.out) } : {}), label: a.label })
    .then((r) => console.log(`finished: ${r.sessions.length} session(s), undone ${r.undone.length}, stopped ${r.stopped ?? "no"}`)));
  else { console.error("give --dry, --go, --prereport, --ab, --report <run.json> or --score <run.json>"); process.exit(2); }
}

// Game party 2: the report — the paid tables' records read against R0–R5 (frozen.mjs BETS), the three capacities (form /
// maintain / restore), the commitments, the quotes (every price named, every information kept or shared, every parting
// proposed), the per-table measures, spend by door, and what was not played. Pure: it reads the records, the ledger and
// the spend checks; no call. `node --experimental-transform-types scripts/game-party-2/verdicts.mjs` writes
// docs/runs/game-party-2-report.md.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { RUNS } from "../game-player-1/run.mjs";
import { perTableMeasures } from "../multi-hero-1/report.mjs";
import { a7Of } from "../multi-hero-1/judges.mjs";
import { CHARACTERS } from "../multi-hero-1/sheets.mjs";
import { BETS, CAPS, ORDER, ROSTER, ROUND_REMINDER, SEATING, STAGE_SOURCE, TABLE_HARNESS, armOf } from "./frozen.mjs";

const STEM = "game-party-2";
/** The owner's bets (issue #1, the session chat of 2026-11-02, after S1-none-T1's result was posted — so given with
 * that table seen, before S1-none-T2): «да» to each of the planner's R1–R5, as written. */
export const OWNER_BETS = { at: "2026-11-02, after S1-none-T1's result, before S1-none-T2", bets: { R1: "да", R2: "да", R3: "да", R4: "да", R5: "да" },
  reading: "the owner holds each of the planner's bets as written" };
/** What a reading by hand found where the mechanical reading cannot decide (each with its reason), per table. */
export const HAND = {
  "S1-none-T1": {
    leaks: { none: true, why: "the three refined-reading hits (Pell's round-13 screen) are the DM's own recurring phrases («takes a short breath through his nose», «puts his shoulder to the wall», «onto the flag that holds») re-worded by the relay inside Pell's own round-12 scene; nothing of Bram's scenes reached Pell" },
    asides: "the Opus DM wrote «(Out of game: …)» asides in 18 scene narrations and the relay passed six onto screens; one carried another scene's fact to Bram (round 11: «Hale dropped the rope's end to Pell in Pell's own scene and Pell tied it round his chest») and two stated the situation's terms out of game (Pell, round 6: the DC 18 and «the block can be shifted in a few minutes»; Sefa, round 7: «it costs nothing else») — not a leak by the refined reading (the aside is in the reader's own scene), named here",
    removed: "Sefa's seat (DeepSeek) closed at round 11 by an empty HTTP 200 reply from OpenRouter (not retried: the harness did not count it as a transport error; fixed after this table) — coded removed, never parted; Bram and Pell carried the table to round 15",
    a7: "rounds 1–3 (all three together) closed on Hale's question or demand put to one character — the pattern the guide's line was meant to stop; rounds 6–14 hold on the rescue's own mechanics (the one at the lever, the one in the water)",
  },
  "S1-none-T2": {
    a7: "under the owner's line: rounds 1–2 (all three together) still closed on the warden's demand or offer to one character; rounds 11, 13 and 14 hold on one character in the DM's own out-of-game closing note — stripped from the screens, so no player saw it, but the DM's frame still waited; rounds 5–8 on the rescue's own mechanics",
    leaks: { none: true, why: "the three hits are events both scenes share through the hole that joins them: Bram hears Sefa call down to Pell (his own scene: Sefa beside him); Pell sees the low roof of the gallery he stands in; Osric's answer to Pell's own question carries down to Pell with the rope — the relay's words for them matched the other scene's narration" },
  },
  "S1-moderate-T2": {
    superseded: "the first attempt (`game-party-2-run-20261109-082203.json`, $5.05; transcripts `docs/runs/game-party-2-transcripts/S1-moderate-T2-attempt1/`) ended by an app error at round 5: in Pell's own scene, his Athletics card waiting (he had just learned the block holds his wound shut), his player asked out of game whether Pell could hold off and ready a potion first; the DM's answer was served (the ledger) but did not commit, and the press of [Roll the die] after it ended the turn with «conflict». Not reproduced on the mocked host (a withdrawing answer, and a failed one, each go on cleanly); that run's app events were not kept. The harness now keeps them, records a failed answer's reason, and reads the waiting turn back after any answer at a card. The table was played again from the start in stage order",
    ended: "the second attempt (the record read here) also ended by an app error, at round 11, after ten whole rounds — the rescue and its price are all inside them: in Pell's own scene (he had gone down the track to the first bend; Bram and Sefa were still in the yard), the writer narrated and the bookkeeper's seven calls each passed (three items, a place, a note, move_party, finish_turn), and the commit failed the database's validation (`dm_loop_failed`, code validation, not retryable). The cause is not determined. Rounds 12–15 not played; no third attempt (the ceiling)",
  },
  "S1-high-T1": {
    ended: "stopped at round 14 by the owner's per-table allowance ($25): the meter refused a DM call whose worst case would pass the table's cap (spent $107.17, the call at worst $1.78, the cap $110.78), so Bram's round-14 scene failed and the table ended; 13 whole rounds were played, $21.76 at the table",
    leaks: { none: true, why: "the fourteen hits are voices carried through the hole between the scenes, which the readers hear in their own scene: Pell calling up out of the working to Bram and Sefa (his directions, the carved disc and the plaster he found, how his leg feels), and Sefa calling down to Pell (no hauling, the silk is up, she is taking the case to Thorn, Bram is coming down)" },
  },
  "S1-high-T2": {
    ended: "stopped at round 13 by the owner's per-table allowance ($25): the meter refused a DM call whose worst case would pass the table's cap (spent $129.68, the call at worst $2.15, the cap $133.72), so Pell's round-13 scene failed and the table ended; 12 whole rounds were played (and Bram's and Sefa's round-13 scenes), $21.30 at the table — at the cut Bram was in the water beside Pell working his wedged heel free, Sefa on the rope above",
  },
  // Harness v5 from here on (the A7 fix of Step 1; see the report's Step 1 section).
  "S1-moderate-T1": {
    a7: "on v5 no round closed on a question or offer to one character; every hold is the rescue's own count, which the company had agreed aloud: the flask down Bram's line before the lift (r6), the heave on Sefa's count (r7, r9, r10 — Osric: «Your count. When it's his.»), and in r12 the DM's own out-of-game note (stripped from the screens) that Bram's request to Sefa waits for her player",
    asides: "the DM still wrote out-of-game notes in 4 scene narrations (rounds 6, 10 and 12) — each explaining why an action needed no roll, the roles' «say why in an aside» — though the v5 frame says none; all 9 strippings kept in the record, none on a screen",
    leaks: { none: true, why: "the eight hits are things both scenes see through the shaft that joins them: the healing flask lowered past the rotten rim (r9), the plaster glowing in Sefa's light (r11), Pell climbing onto the last sound plank (r12) — each in the readers' own narration too — and Osric crossing his yard to the house in view of both groups (r15)" },
  },
};
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const NAME = Object.fromEntries(CHARACTERS.map((c) => [c.id, c.name]));
const short = (name) => String(name ?? "").split(" ")[0];
const q = (text) => `«${String(text ?? "").replace(/\s+/g, " ").trim()}»`;

/** The paid tables of the order, latest record per key (dry and Haiku runs are not tables of the order). */
export function paidRecords(dir = RUNS) {
  const keys = new Set(ORDER.map((o) => o.key));
  const byKey = new Map();
  for (const f of readdirSync(dir).filter((x) => new RegExp(`^${STEM}-run-\\d{8}-\\d{6}\\.json$`).test(x)).sort()) {
    const r = readJson(join(dir, f));
    if (r.dry || r.haiku || !keys.has(r.key)) continue;
    byKey.set(r.key, { ...r, file: f });
  }
  return ORDER.filter((o) => byKey.has(o.key)).map((o) => byKey.get(o.key));
}

const holdOf = (run) => Object.fromEntries(Object.entries(run.table?.tags?.hold ?? {}).map(([n, x]) => [Number(n), x.final]).filter(([, x]) => x));
const roundTagsOf = (run) => Object.fromEntries(Object.entries(run.table?.tags?.rounds ?? {}).map(([n, x]) => [Number(n), x.final]).filter(([, x]) => x));

/** S1: the one in danger — when the danger began, its last state, who saved with what, the prices named, the leavings
 * proposed. */
export function s1Of(run) {
  const hold = holdOf(run);
  const e = NAME[run.frozen?.dice?.e];
  const rounds = Object.keys(hold).map(Number).sort((a, b) => a - b);
  const began = rounds.find((n) => hold[n].endangered) ?? null;
  const last = [...rounds].reverse().find((n) => hold[n].endangered) ?? null;
  const state = last ? hold[last].endangered : null;
  const savedAt = rounds.find((n) => ["saved", "saves self"].includes(hold[n].endangered)) ?? null;
  const pays = rounds.flatMap((n) => Object.entries(hold[n].characters).filter(([, c]) => c.pays?.for === e).map(([who, c]) => ({ round: n, who, what: c.pays.what })));
  const prices = rounds.flatMap((n) => Object.entries(hold[n].characters).filter(([, c]) => c.price_named).map(([who, c]) => ({ round: n, who, quote: c.price_named })));
  const leaving = rounds.flatMap((n) => Object.entries(hold[n].characters).filter(([, c]) => c.proposes_leaving).map(([who, c]) => ({ round: n, who, quote: c.proposes_leaving })));
  const savedBy = savedAt ? hold[savedAt].saved_by : [];
  const namedBefore = savedAt ? prices.some((p) => p.round <= savedAt) : null;
  return { endangered: e, began, state, savedAt, savedBy, roundsToSave: savedAt && began ? savedAt - began : null, pays, prices, leaving, namedBefore,
    saved: ["saved", "saves self"].includes(state) ? state : state === "left" ? "left" : state ? "not saved by the end" : "the danger was not tagged" };
}
/** S2: the holder's information by round, from the letter's round on. */
export function s2Of(run) {
  const hold = holdOf(run);
  const h = NAME[run.frozen?.dice?.h];
  const from = run.table?.deliveries?.[0]?.round ?? null;
  const rows = Object.keys(hold).map(Number).sort((a, b) => a - b).filter((n) => from && n >= from).map((n) => ({ round: n, info: hold[n].characters[h]?.info ?? null, quote: hold[n].characters[h]?.info_quote ?? null }));
  const sharedAt = rows.find((r) => ["full", "partial"].includes(r.info))?.round ?? null;
  return { holder: h, delivered: from, rows, sharedAt, withinFive: sharedAt !== null && sharedAt - from <= 5, falseAt: rows.filter((r) => r.info === "false"), holderAnswer: (run.table?.seats ?? []).find((s) => s.character === h)?.after?.find((a) => /did not tell the others/.test(a.question ?? ""))?.text ?? null };
}
/** S3: who erred, the lead before and after. */
export function s3Of(run) {
  const hold = holdOf(run), tags = roundTagsOf(run);
  const rounds = Object.keys(hold).map(Number).sort((a, b) => a - b);
  const at = rounds.find((n) => hold[n].erred) ?? null;
  const erred = at ? hold[at].erred : null;
  const ledBefore = at ? rounds.filter((n) => n < at).map((n) => tags[n]?.leader).filter(Boolean) : [];
  const after = rounds.filter((n) => at && n >= at).map((n) => ({ round: n, lead: hold[n].lead_after, leader: tags[n]?.leader ?? null, how: tags[n]?.how ?? null, named: hold[n].characters[erred]?.names_error ?? 0 }));
  return { erred, at, heldLead: Boolean(erred && ledBefore.at(-1) === erred), after, overrideAfter: after.some((x) => x.lead === "taken" || x.how === "override"), named: after.some((x) => x.named) };
}
/** The three capacities and the commitments, per table. */
export function capacitiesOf(run) {
  const hold = holdOf(run), tags = roundTagsOf(run);
  const rounds = Object.keys(hold).map(Number).sort((a, b) => a - b);
  const formed = Object.keys(tags).map(Number).sort((a, b) => a - b).find((n) => tags[n].party) ?? null;
  const maintains = rounds.flatMap((n) => Object.entries(hold[n].characters).filter(([, c]) => c.maintains).map(([who]) => ({ round: n, who })));
  const restores = rounds.filter((n) => hold[n].rejoin).map((n) => ({ round: n, who: Object.entries(hold[n].characters).filter(([, c]) => c.rejoins).map(([w]) => w) }));
  const agreements = rounds.flatMap((n) => hold[n].agreements.map((a) => ({ round: n, ...a })));
  const breaks = rounds.filter((n) => hold[n].breaks).map((n) => ({ round: n, ...hold[n].breaks }));
  const disagreements = rounds.map((n) => hold[n].disagreement).filter((d) => d && d !== "none");
  return { formed, around: formed ? tags[formed].around : null, maintains, restores, agreements, breaks, disagreements: { yield: disagreements.filter((d) => d === "yield").length, accept: disagreements.filter((d) => d === "accept").length, continue: disagreements.filter((d) => d === "continue").length } };
}

/** The ledger by door and by table. */
export function spendOf(dir = RUNS) {
  const file = join(dir, `${STEM}-ledger-openrouter.json`);
  const ledger = existsSync(file) ? readJson(file) : { runs: [], spentUsd: 0 };
  return { openrouter: ledger.spentUsd ?? 0, openai: 0, runs: (ledger.runs ?? []).map((r) => ({ what: r.what, usd: r.spentUsd, stopped: r.stopped ?? null,
    upstreams: [...new Set((r.calls ?? []).filter((c) => c.usage).map((c) => `${c.model}${c.upstream ? ` @ ${c.upstream}` : ""}`))],
    unserved: (r.calls ?? []).filter((c) => !c.usage).map((c) => `${c.purpose} (${c.model}, HTTP ${c.status ?? "—"}${c.error ? `: ${String(c.error).slice(0, 60)}` : ""})`) })) };
}

export function verdicts(runs) {
  const s1 = runs.filter((r) => armOf(r.arm)?.situation === "S1").map((r) => ({ run: r, x: s1Of(r) }));
  const s2 = runs.filter((r) => armOf(r.arm)?.situation === "S2").map((r) => ({ run: r, x: s2Of(r) }));
  const s3 = runs.filter((r) => armOf(r.arm)?.situation === "S3").map((r) => ({ run: r, x: s3Of(r) }));
  const savedIn = (variant) => s1.filter(({ run }) => run.variant === variant);
  const isSaved = (x) => ["saved", "saves self"].includes(x.saved);
  const R1 = (() => {
    const none = savedIn("none"), mod = savedIn("moderate"), high = savedIn("high");
    if (none.length < 2 || mod.length < 2 || high.length < 2) return { verdict: "not testable", line: `played: none ${none.length}/2, moderate ${mod.length}/2, high ${high.length}/2 — R1 needs all six; saved so far: ${s1.map(({ run, x }) => `${run.key} ${x.saved}`).join("; ") || "none played"}` };
    const ok = none.every(({ x }) => isSaved(x)) && mod.every(({ x }) => isSaved(x)) && high.filter(({ x }) => isSaved(x)).length <= 1;
    return { verdict: ok ? "held" : "lost", line: s1.map(({ run, x }) => `${run.key} ${x.saved}`).join("; ") };
  })();
  const partings = runs.map((r) => ({ run: r, s1: armOf(r.arm)?.situation === "S1" ? s1Of(r) : null, cap: capacitiesOf(r) }))
    .filter(({ s1: x, run }) => (x && !isSaved(x) && x.saved !== "the danger was not tagged") || (run.table?.seats ?? []).some((s) => s.left?.why === "door"));
  const R2 = partings.length < 2 ? { verdict: "not testable", line: `${partings.length} table(s) with a non-save or a parting (R2 needs at least two)` } : { verdict: "read by hand", line: partings.map(({ run }) => run.key).join(", ") };
  const R3 = s2.length < 4 ? { verdict: "not testable", line: `S2 tables played: ${s2.length} of 4` } : { verdict: s2.filter(({ x }) => x.withinFive).length >= 3 && s2.every(({ x }) => !x.falseAt.length) ? "held" : "lost", line: s2.map(({ run, x }) => `${run.key}: shared ${x.sharedAt ? `r${x.sharedAt}` : "never"}${x.falseAt.length ? `, false at ${x.falseAt.map((f) => `r${f.round}`).join(", ")}` : ""}`).join("; ") };
  const R4 = s3.length < 2 ? { verdict: "not testable", line: `S3 tables played: ${s3.length} of 2` } : { verdict: s3.some(({ x }) => !x.heldLead) ? "read as redistribution (the one who erred did not hold the lead)" : s3.some(({ x }) => x.overrideAfter) ? "lost" : "held", line: s3.map(({ run, x }) => `${run.key}: erred ${x.erred ?? "—"} at r${x.at ?? "—"}, held the lead before: ${x.heldLead ? "yes" : "no"}`).join("; ") };
  const payers = s1.flatMap(({ x }) => x.pays.map((p) => p.who));
  const R5 = s1.length < 6 ? { verdict: "not testable (exploratory)", line: `S1 tables played: ${s1.length} of 6; payers: ${payers.map(short).join(", ") || "none tagged"}` } : { verdict: s1.filter(({ x }) => x.pays.some((p) => p.who === "Sefa Marrin")).length >= 4 ? "held (exploratory)" : "lost (exploratory)", line: `payers: ${payers.map(short).join(", ")}` };
  return { R1, R2, R3, R4, R5, s1, s2, s3 };
}

/** What each harness was, for a table's line (frozen.mjs HARNESS). */
export const HARNESS_TEXT = {
  v2: () => "the guide's A7 sentences as built; asides passed to screens",
  v3: (r) => `the owner's A7 line in the guide; the DM's out-of-game asides stripped from screens, ${r.table?.asides?.length ?? 0} stripping(s) kept in the record; an empty HTTP 200 asked again`,
  v4: (r) => `v3, and the round's close given to the table (Step 1 of the amendment of 2026-11-08 17:35 LA): the DM's frame ends each scene on the world, never on a question, offer, demand or wait put to one character; every seat's round screen ends on the same line, «Round N — what does <name> do?»; ${r.table?.asides?.length ?? 0} aside stripping(s) kept in the record`,
  v5: (r) => `v4, and one reminder sentence closing each round's message to the DM (the planner's B): «${ROUND_REMINDER}»; ${r.table?.asides?.length ?? 0} aside stripping(s) kept in the record`,
};

// ---- the amendment of 2026-11-08 17:35 LA: Step 1 and the planner's three bets ------------------------------------------------

/** The planner's bets of the amendment of 2026-11-08 17:35 LA (frozen there, before Step 1 and the ten tables). */
export const BETS_1108 = {
  "P-A7": "The frame fix removes the hold in ≥ 8 of 9 rounds, but the DM still names the seat that has not answered, without holding the scene on it.",
  "P-mod": "In both moderate tables the fallen character is freed, and the price is named aloud before the act in both.",
  "P-high": "In at least one high table someone proposes leaving before the rescue.",
};
/** Step 1's two tests (a7-replay.mjs): v4, then v5 (the planner's B of 21:02 LA). */
export function step1Of(dir = RUNS) {
  const read = (f) => (existsSync(join(dir, f)) ? readJson(join(dir, f)) : null);
  const one = (x) => (x ? { harness: x.harness ?? "v4", passed: x.verdict.passed, of: x.verdict.of, holds: x.verdict.holds, noHold: x.verdict.noHold, allReflected: x.verdict.allReflected,
    namesOpen: x.verdict.namesOpenWithoutHold, spent: x.spentUsd, fails: x.readings.filter((r) => !r.pass).map((r) => `r${r.n}${r.waits ? ` waits on ${short(r.waits)}` : ""}${r.allReflected ? "" : ` (not reflected: ${Object.entries(r.reflected).filter(([, v]) => !v).map(([k]) => short(k)).join(", ")})`}`) } : null);
  return { v4: one(read(`${STEM}-a7-replay.json`)), v5: one(read(`${STEM}-a7-replay-v5.json`)), baseline: read(`${STEM}-a7-replay-baseline.json`) };
}
export function bets1108(runs, step1 = step1Of()) {
  const isSaved = (x) => ["saved", "saves self"].includes(x.saved);
  const v4 = step1.v4, v5 = step1.v5;
  const PA7 = { verdict: v4 ? "lost on its count; its second half held" : "not read",
    line: v4 ? `v4: ${v4.noHold} of ${v4.of} rounds without a hold (≥ 8 bet); the DM named an open question without holding the scene in rounds ${v4.namesOpen.join(", ") || "none"}${v5 ? ` · v5: ${v5.noHold} of ${v5.of} without a hold, named-without-holding in rounds ${v5.namesOpen.join(", ") || "none"}` : ""} — read as the planner set it at 21:02 LA (on v4's count)` : "—" };
  const of = (variant) => runs.filter((r) => armOf(r.arm)?.situation === "S1" && r.variant === variant).map((r) => ({ run: r, x: s1Of(r) }));
  const mod = of("moderate"), high = of("high");
  const Pmod = mod.length < 2 ? { verdict: "not testable", line: `moderate tables played: ${mod.length} of 2` }
    : { verdict: mod.every(({ x }) => isSaved(x) && x.namedBefore) ? "held" : "lost", line: mod.map(({ run, x }) => `${run.key}: ${x.saved}${x.savedAt ? ` at r${x.savedAt}` : ""}; price named before the act: ${x.namedBefore === null ? "—" : x.namedBefore ? "yes" : "no"}`).join("; ") };
  const before = (x) => x.leaving.filter((l) => !x.savedAt || l.round <= x.savedAt);
  const Phigh = high.length < 2 ? { verdict: "not testable", line: `high tables played: ${high.length} of 2` }
    : { verdict: high.some(({ x }) => before(x).length) ? "held" : "lost", line: high.map(({ run, x }) => `${run.key}: leaving proposed before the rescue ${before(x).length ? before(x).map((l) => `r${l.round} ${short(l.who)}`).join(", ") : "never"}${x.savedAt ? ` (rescued r${x.savedAt})` : ` (${x.saved})`}`).join("; ") };
  return { "P-A7": PA7, "P-mod": Pmod, "P-high": Phigh };
}
function step1Lines(runs, step1 = step1Of()) {
  const row = (t) => `| ${t.harness} | ${t.passed} of ${t.of} (needed 8) — ${t.holds ? "**pass**" : "**fail**"} | ${t.noHold} of ${t.of} | ${t.allReflected} of ${t.of} | ${t.fails.join("; ") || "—"} | $${t.spent.toFixed(2)} |`;
  const tests = [step1.v4, step1.v5].filter(Boolean);
  const holdsPerTable = runs.filter((r) => ["v4", "v5"].includes(r.harness)).map((r) => { const a = a7Of(r.table?.initiative); return `${r.key} ${a.holds === undefined ? "not read" : `${a.waits.length} round(s) held${a.waits.length ? ` (${a.waits.map((x) => `r${x.n} ${short(x.waits)}`).join(", ")})` : ""}`}`; });
  return ["## Step 1 — A7 fixed by the harness (the amendment of 2026-11-08 17:35 LA)", "",
    "The DM's frame held the round on one seat at both control tables. The fix is option (a): the round's close belongs to the table. The DM ends each scene on the world, and the table closes every seat's screen with the same line. Why (a): the reading of S1-none-T2's nine held rounds as played found every seat's action reflected in all nine" + (step1.baseline ? ` (${step1.baseline.rounds.filter((r) => r.allReflected).length} of ${step1.baseline.rounds.length})` : "") + ", so the hold was only in the close. (b) would have fixed nothing, and (c) alone would have passed all nine with the DM unchanged. The guide note stays as the owner wrote it.", "",
    "The test: the DM alone (Opus 5.5) over T2's nine tagged rounds, the players' actions frozen; pass = ≥ 8 of 9 with no single-seat hold and every action reflected. v5 (the planner's B) adds one reminder sentence closing each round's message to the DM. Results: `docs/runs/game-party-2-a7-replay.md`" + (step1.v5 ? " and `docs/runs/game-party-2-a7-replay-v5.md`" : "") + ".", "",
    "| Harness | Pass | No hold | Every action reflected | Failed rounds | Spent |", "| --- | --- | --- | --- | --- | --- |", ...tests.map(row), "",
    `**The tables played on ${TABLE_HARNESS}**${step1.v5 && !step1.v5.holds ? " — neither test passed; the planner's B: play on whichever held fewer rounds, with the hold count per table as a known defect beside R0–R5" : ""}. A7 holds per table (the multi-hero round tag): ${holdsPerTable.join("; ") || "no v4/v5 table played yet"}.`, ""];
}

export function reportMarkdown(runs, { spend = spendOf(), checks = [] } = {}) {
  const v = verdicts(runs);
  const played = new Set(runs.map((r) => r.key));
  const notPlayed = ORDER.filter((o) => !played.has(o.key)).map((o) => o.key);
  const leaks = runs.reduce((s, r) => s + (HAND[r.key]?.leaks?.none ? 0 : (r.table?.leaksRefined?.hits?.length ?? 0)), 0);
  const leaksByHand = runs.filter((r) => HAND[r.key]?.leaks?.none && r.table?.leaksRefined?.hits?.length).map((r) => `${r.key}: ${r.table.leaksRefined.hits.length} hit(s) read by hand — ${HAND[r.key].leaks.why}`);
  const extended = runs.filter((r) => (r.table?.rounds?.length ?? 0) > 15).map((r) => r.key);
  const doors = spend.runs.flatMap((r) => r.upstreams);
  const wrongDoor = doors.filter((d) => (/openai\//.test(d) && !/@ OpenAI$/.test(d)) || (/deepseek/.test(d) && !/@ DeepInfra$/.test(d)));
  const R0held = spend.openrouter <= CAPS.openrouter && !extended.length && !leaks && !wrongDoor.length;
  const lines = [
    "# Game party 2 — a company when holding costs", "",
    `Stage ${STAGE_SOURCE}. Branch \`claude/game-party-2\` from \`origin/claude/multi-hero-1-mdk43v\` (the control tables); from the amendment of 2026-11-08 17:35 LA on, \`claude/intelligent-einstein-p2rs50\` from \`claude/game-party-2\` at 8bde5a8a. Synthetic content only. English, briefly.`, "",
    `**Played: ${runs.length} of 12 tables** (${runs.map((r) => r.key).join(", ") || "none"}). **Not played:** ${notPlayed.join(", ") || "none"} — ${notPlayed.length ? `the Mandate's ceiling ($${CAPS.openrouter} OpenRouter) or the key's credit, at ≈ $15–23 a table` : "none left"}.`, "",
    "## The bets (the planner's premise and R0–R5, frozen before the first paid call; null allowed on every line)", "",
    `The planner's premise: ${BETS.premise}`, "",
    "| Bet | The planner's | Verdict | Read on |", "| --- | --- | --- | --- |",
    `| R0 | ${BETS.R0} | ${R0held ? "held" : "lost"}${leaksByHand.length ? " (leaks read by hand)" : ""} | OpenRouter $${spend.openrouter.toFixed(2)} of $${CAPS.openrouter}, OpenAI $0; doors: ${wrongDoor.length ? `off the pinned host: ${wrongDoor.join(", ")}` : "every Sol/Astra call served by OpenAI, every DeepSeek call by DeepInfra"}; rounds ≤ 15${extended.length ? ` (extended: ${extended.join(", ")})` : ""}; leaks (refined) ${leaks}${leaksByHand.length ? ` after the hand reading (${leaksByHand.join("; ")})` : ""}; no player scripted (the prompts carry no situation text; tests) |`,
    ...["R1", "R2", "R3", "R4", "R5"].map((k) => `| ${k} | ${BETS[k]} | ${v[k].verdict} | ${v[k].line} |`), "",
    "**The planner's bets of the amendment of 2026-11-08 17:35 LA** (frozen there, before Step 1):", "",
    "| Bet | The planner's | Verdict | Read on |", "| --- | --- | --- | --- |",
    ...Object.entries(bets1108(runs)).map(([k, x]) => `| ${k} | ${BETS_1108[k]} | ${x.verdict} | ${x.line} |`), "",
    `**The owner's bets** (${OWNER_BETS.at}): ${Object.entries(OWNER_BETS.bets).map(([k, b]) => `${k} ${b}`).join(", ")} — ${OWNER_BETS.reading}. Each verdict above is the owner's too. **The owner's section** — left for the owner:`, "", "> …", "",
    ...step1Lines(runs),
    "## The tables", "",
  ];
  for (const r of runs) {
    const a = armOf(r.arm);
    const cap = capacitiesOf(r);
    const a7 = a7Of(r.table?.initiative);
    lines.push(`### ${r.key} — ${a.situation} ${r.variant}; ${CHARACTERS.map((c) => `${c.short} ${ROSTER[SEATING[r.triad][c.id]].label}`).join(", ")}`, "",
      `${r.table?.rounds?.length ?? 0} rounds, ended by ${r.table?.ended?.reason}; $${(r.spentUsd ?? 0).toFixed(2)} at the table${r.stopped ? `; STOPPED: ${r.stopped}` : ""}. Harness ${r.harness ?? "v2"} (${HARNESS_TEXT[r.harness ?? "v2"](r)}). Transcripts: \`docs/runs/${STEM}-transcripts/${r.key}/\` (per table and per player).`, "",
      `- **Form:** the company formed at round ${cap.formed ?? "—"} around ${cap.around ?? "—"}.`,
      `- **Maintain:** ${cap.maintains.length ? cap.maintains.map((m) => `r${m.round} ${short(m.who)}`).join(", ") : "no round tagged"}.`,
      `- **Restore:** ${cap.restores.length ? cap.restores.map((x) => `r${x.round} (${x.who.map(short).join(", ") || "—"})`).join(", ") : "no re-joining tagged"}.`,
      `- **Commitments:** ${cap.agreements.length} agreement(s) made aloud; broken: ${cap.breaks.length ? cap.breaks.map((b) => `r${b.round} ${short(b.who)} (${b.what})`).join("; ") : "none tagged"}. Disagreements: yield ${cap.disagreements.yield}, accept ${cap.disagreements.accept}, continue under an unresolved split ${cap.disagreements.continue}.`,
      ...(HAND[r.key]?.removed ? [`- **Removed (not parted):** ${HAND[r.key].removed}.`] : []),
      ...(HAND[r.key]?.superseded ? [`- **Played twice:** ${HAND[r.key].superseded}.`] : []),
      ...(HAND[r.key]?.ended ? [`- **Ended early:** ${HAND[r.key].ended}.`] : []),
      ...(HAND[r.key]?.asides ? [`- **The DM's out-of-game asides:** ${HAND[r.key].asides}.`] : []),
      `- **A7** (MULTI_HERO_1): ${a7.holds === undefined ? "not read" : a7.holds ? "held — no round waited on one character" : `lost — ${a7.rounds.filter((x) => x.waits).map((x) => `r${x.n} waits on ${short(x.waits)}`).join(", ")}${HAND[r.key]?.a7 ? ` — read by hand: ${HAND[r.key].a7}` : ""}`}.`, "");
    if (a.situation === "S1") {
      const x = s1Of(r);
      lines.push(`**The one in danger:** ${x.endangered}, from round ${x.began ?? "—"}: ${x.saved}${x.savedAt ? ` at round ${x.savedAt} (${x.roundsToSave} round(s) after), by ${x.savedBy.map(short).join(" and ") || "—"}` : ""}. Paid: ${x.pays.length ? x.pays.map((p) => `r${p.round} ${short(p.who)} — ${p.what}`).join("; ") : "nothing tagged"}. The price named aloud before the act: ${x.namedBefore === null ? "—" : x.namedBefore ? "yes" : "no"}.`, "",
        "Every price named:", ...(x.prices.length ? x.prices.map((p) => `- r${p.round} ${p.who}: ${q(p.quote)}`) : ["- none tagged"]), "",
        "Every leaving proposed:", ...(x.leaving.length ? x.leaving.map((p) => `- r${p.round} ${p.who}: ${q(p.quote)}`) : ["- none tagged"]), "");
    }
    if (a.situation === "S2") {
      const x = s2Of(r);
      lines.push(`**The letter:** to ${x.holder} at round ${x.delivered}; shared ${x.sharedAt ? `at round ${x.sharedAt}` : "never"}; letter check ${r.letter?.hits?.length ?? 0} hit(s) on the others' screens.`, "",
        "Every information kept or shared (the holder, by round):", ...x.rows.map((row) => `- r${row.round}: ${row.info ?? "nothing said"}${row.quote ? ` — ${q(row.quote)}` : ""}`), "",
        `The holder's after-answer («Was there something you knew and did not tell the others? Why?»): ${x.holderAnswer ? q(x.holderAnswer) : "—"}`, "");
    }
    if (a.situation === "S3") {
      const x = s3Of(r);
      lines.push(`**The failure:** ${x.erred ?? "—"} at round ${x.at ?? "—"}; held the lead before: ${x.heldLead ? "yes" : "no"}; named it: ${x.named ? "yes" : "no"}. After: ${x.after.map((y) => `r${y.round} ${y.lead ?? "—"}${y.leader ? ` (${short(y.leader)}, ${y.how})` : ""}`).join(" · ")}.`, "");
    }
    lines.push(...[].concat(perTableMeasures(r, { heading: "####" })), "");
  }
  lines.push("## Whole tables beside the numbers (POLICY v1)", "", ...runs.map((r) => `- **${r.key}**: \`docs/runs/${STEM}-transcripts/${r.key}/${r.key}-table.md\` (the whole table: every message as written, the DM's narration, each screen as the relay wrote it), the three players' own transcripts beside it, and \`${r.key}-rounds.md\` (each round's three screens side by side).`), "");
  lines.push("## Spend by door", "", `OpenRouter (the only door): **$${spend.openrouter.toFixed(2)} of $${CAPS.openrouter}**. OpenAI: $0 (no OpenAI key in any process). The Anthropic Console: $0 (no ledger: any call there would have stopped the run).`, "",
    "| Pass | USD | Stopped | Models @ hosts | Calls not served |", "| --- | --- | --- | --- | --- |", ...spend.runs.map((r) => `| ${r.what} | $${(r.usd ?? 0).toFixed(3)} | ${r.stopped ?? "—"} | ${r.upstreams.join(", ")} | ${r.unserved.join("; ") || "—"} |`), "",
    ...(checks.length ? ["Spend checks (OpenRouter's account, shared with other sessions; this Mandate's ledger):", "", ...checks.map((c) => `- ${c.at} (${c.when}): account $${c.openrouter?.remaining ?? "?"} left; Mandate $${c.ledger?.openrouter?.spent ?? "?"}`), ""] : []),
    "## The reader's notes", "", "> …", "");
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = paidRecords();
  const checks = existsSync(join(RUNS, `${STEM}-spend.json`)) ? readJson(join(RUNS, `${STEM}-spend.json`)).checks ?? [] : [];
  await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown(runs, { checks }));
  console.log(`${STEM}-report.md: ${runs.length} table(s)`);
}

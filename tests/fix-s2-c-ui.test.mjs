// Fix run after session 2, stage C (the turn on screen): the turn as one timeline (items 53, 63), the hero's roll
// cards and the companions' chips (items 43, 44), the action box (item 42) and the owner's editor (item 57).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyLiveEvent, emptyLiveTurn } from "../src/lib/gameplay/live-turn-client.ts";
import {
  buildTurnTimeline,
  checkAddends,
  pauseWords,
  provisionalTurn,
  rollLines,
  shownStatus,
  traceLive,
  traceStatus,
} from "../src/lib/ui/turn-timeline.ts";
import { previewTelling } from "../src/lib/ui/preview/stage5-turn.ts";
import { PREVIEW_IDS } from "../src/lib/ui/preview/stage5-fixture.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const HERO = "hero", BRAM = "bram";

/** Replays a stream: { text } pieces, { roll } lines and a closing status, through the real reducers. */
function stream(steps, status = null, operationId = "op-1") {
  let view = emptyLiveTurn(operationId);
  let trace = null;
  for (const step of [{ status: "generating" }, ...steps, ...(status ? [{ status }] : [])]) {
    view = applyLiveEvent(view, "text" in step ? { type: "text", text: step.text }
      : "roll" in step ? { type: "tool", name: "roll", ok: true, summary: step.roll }
        : "tool" in step ? { type: "tool", name: step.tool, ok: true, summary: step.summary }
          : { type: "status", status: step.status });
    trace = traceLive(trace, view);
  }
  return trace;
}
const check = (over) => ({ id: over.id, kind: "skill", actorId: over.actorId, actorName: over.actorName, dice: [over.kept ?? 12], kept: over.kept ?? 12,
  modifier: over.modifier ?? 3, total: (over.kept ?? 12) + (over.modifier ?? 3), success: over.success ?? true, dc: null, advantage: "normal",
  interactive: over.interactive ?? true, canReroll: false, rollNumber: 1, reason: over.reason, bonuses: over.bonuses ?? [] });
const heroCheck = check({ id: "c-hero", actorId: HERO, actorName: "Hero", reason: "Read the captain", kept: 14, modifier: 4 });
const bramShot = check({ id: "c-bram", actorId: BRAM, actorName: "Bram", reason: "crossbow at the brute", kept: 17, modifier: 3, interactive: true });
const timeline = (over) => buildTurnTimeline({ text: "", rolls: [], checks: [], heroId: HERO, party: ["Bram"], companionRolls: "dm",
  status: "generating", idle: false, language: "ru", ...over });
const kinds = (items) => items.map((item) => item.kind === "chip" ? `chip:${item.who ?? "-"}` : item.kind);

test("the stream's trace keeps where each roll came in the text; a reopened stream never takes told text away", () => {
  const trace = stream([{ text: "Bram raises the crossbow." }, { roll: "Bram: crossbow at the brute: 20 — success · damage 7" }, { text: "\n\nThe bolt hits." }]);
  assert.equal(trace.view.text, "Bram raises the crossbow.\n\nThe bolt hits.");
  assert.deepEqual(trace.at, ["Bram raises the crossbow.".length], "the roll happened where the told text ended");
  // «Дальше»: the stream is opened again and replays the turn from its start.
  let replayed = traceLive(trace, applyLiveEvent(emptyLiveTurn("op-1"), { type: "status", status: "generating" }));
  assert.equal(replayed.view.text, trace.view.text, "while the replay catches up, the told text stays on screen");
  assert.ok(replayed.replay);
  let view = replayed.replay.view;
  for (const event of [{ type: "text", text: "Bram raises the crossbow." }, { type: "tool", name: "roll", ok: true, summary: "Bram: crossbow at the brute: 20 — success · damage 7" },
    { type: "text", text: "\n\nThe bolt hits." }, { type: "text", text: " The brute falls." }]) {
    view = applyLiveEvent(view, event);
    replayed = traceLive(replayed, view);
  }
  assert.equal(replayed.replay, undefined, "caught up: the replay is the trace");
  assert.equal(replayed.view.text, "Bram raises the crossbow.\n\nThe bolt hits. The brute falls.");
  assert.deepEqual(replayed.at, trace.at);
  assert.equal(traceStatus(replayed), "generating");
  const other = traceLive(replayed, applyLiveEvent(emptyLiveTurn("op-2"), { type: "text", text: "Next." }));
  assert.equal(other.view.operationId, "op-2", "another turn starts afresh");
});

test("one timeline in the order it was told: text → the companion's chip → the continuation → the hero's card", () => {
  const trace = stream([
    { text: "Bram does not ask twice." }, { roll: "Bram: crossbow at the brute: 20 — получилось · урон 1" },
    { text: "\n\nThe brute staggers. The captain watches you." }, { roll: "Read the captain: 18 — получилось" },
    { text: "\n\nShe lies, and you see it." },
  ], "recording");
  const { items, pause } = timeline({ text: trace.view.text, rolls: rollLines({ status: "generating" }, trace), checks: [bramShot, heroCheck], status: "recording" });
  assert.deepEqual(kinds(items), ["text", "chip:Bram", "text", "card", "text"]);
  assert.equal(items[0].text, "Bram does not ask twice.");
  assert.equal(items[1].text, "crossbow at the brute: 20 — получилось · урон 1", "the chip keeps the server's line: what, the number, the outcome, the damage");
  assert.equal(items[1].tone, "success");
  assert.equal(items[2].text, "The brute staggers. The captain watches you.");
  assert.equal(items[3].check.id, "c-hero");
  assert.equal(items[4].text, "She lies, and you see it.");
  assert.deepEqual(pause, { kind: "recording" });
  assert.equal(pauseWords(pause, "ru"), "Ведущий записывает…");
});

test("the DM rolls for the companions (chips, no pause); companionRolls «player» makes their rolls cards", () => {
  const trace = stream([{ text: "Arrows fly." }, { roll: "Bram: crossbow at the brute: 20 — получилось" }], "awaiting_confirmation");
  const dm = timeline({ text: trace.view.text, rolls: rollLines({ status: "awaiting_confirmation" }, trace), checks: [bramShot], status: "awaiting_confirmation" });
  assert.deepEqual(kinds(dm.items), ["text", "chip:Bram"]);
  const player = timeline({ text: trace.view.text, rolls: rollLines({ status: "awaiting_confirmation" }, trace), checks: [bramShot], status: "awaiting_confirmation", companionRolls: "player" });
  assert.deepEqual(kinds(player.items), ["text", "card"], "the player rolls for the companion: a card like the hero's");
  assert.deepEqual(player.pause, { kind: "your-roll", who: "Bram" });
  assert.equal(pauseWords(player.pause, "ru"), "Ждёт твой бросок за спутника: Bram");
  // A plain roll of the DM's that hit the party (no check): a chip in place, whoever it names.
  const hit = timeline({ text: "A hook flies.", rolls: [{ summary: "Bram: хиты 61 → 57 (крюк)", at: 13 }] });
  assert.deepEqual(kinds(hit.items), ["text", "chip:Bram"]);
  assert.equal(hit.items[1].tone, null);
});

test("the pause is named by what the turn waits for; «думает» only before the first word", () => {
  assert.deepEqual(timeline({}).pause, { kind: "thinking" });
  assert.equal(pauseWords({ kind: "thinking" }, "ru"), "Ведущий думает…");
  const telling = timeline({ text: "The door creaks" });
  assert.equal(telling.pause, null, "while the text streams there is no pause line (the caret)");
  const gap = timeline({ text: "The door creaks.", idle: true });
  assert.deepEqual(gap.pause, { kind: "gap" });
  for (const pause of [gap.pause, { kind: "after-roll", who: "Bram" }, { kind: "after-roll", who: null }, { kind: "your-roll", who: null }, { kind: "recording" }])
    assert.doesNotMatch(pauseWords(pause, "ru"), /думает/u, "no «Ведущий думает…» in a turn that is already telling");
  const afterRoll = timeline({ text: "Bram aims.", rolls: [{ summary: "Bram: crossbow at the brute: 20 — получилось", at: 10 }], checks: [bramShot] });
  assert.deepEqual(afterRoll.pause, { kind: "after-roll", who: "Bram" });
  assert.equal(pauseWords(afterRoll.pause, "ru"), "Бросок: Bram — ведущий рассказывает, что вышло…");
  // A roll before any text (the DM rolled first) is not «думает» either.
  assert.equal(timeline({ rolls: [{ summary: "Bram: crossbow at the brute: 20 — получилось", at: 0 }], checks: [bramShot] }).pause.kind, "after-roll");
  const waiting = timeline({ text: "She waits.", rolls: [{ summary: "Read the captain: 18 — получилось", at: 10 }], checks: [heroCheck], status: "awaiting_confirmation" });
  assert.deepEqual(kinds(waiting.items), ["text", "card"]);
  assert.deepEqual(waiting.pause, { kind: "your-roll", who: null });
  assert.equal(pauseWords(waiting.pause, "ru"), "Ждёт твой бросок");
  assert.equal(pauseWords(waiting.pause, "en"), "Waiting for your roll");
  for (const status of ["committed", "failed", "cancelled"]) assert.equal(timeline({ text: "Done.", status }).pause, null);
});

test("the hero's roll the stream announced before its record never shows its number early", () => {
  const { items } = timeline({ text: "She waits.", rolls: [{ summary: "Read the captain: 18 — получилось", at: 10 }], status: "awaiting_confirmation" });
  assert.deepEqual(kinds(items), ["text", "pending"]);
  assert.equal(items[1].title, "Read the captain");
  assert.doesNotMatch(JSON.stringify(items[1]), /18/);
  // The campaign's dice wait for the player: the line is a pending card from the moment it arrives (before the pause status).
  assert.deepEqual(kinds(timeline({ text: "She waits.", rolls: [{ summary: "Read the captain: 18 — получилось", at: 10 }], rollsWait: true }).items), ["text", "pending"]);
  // No dice to tap and no rerolls: the turn runs on, the line is simply a chip with its result.
  assert.deepEqual(kinds(timeline({ text: "She waits.", rolls: [{ summary: "Read the captain: 18 — получилось", at: 10 }] }).items), ["text", "chip:-"]);
  // A companion's line is never held back while the DM rolls for them.
  assert.deepEqual(kinds(timeline({ text: "x", rolls: [{ summary: "Bram: crossbow at the brute: 20 — получилось", at: 1 }], rollsWait: true }).items), ["text", "chip:Bram"]);
});

test("a saved turn keeps the order this page saw it told; a turn seen only as a record shows the rolls before its text", () => {
  const trace = stream([{ text: "Bram aims." }, { roll: "Bram: crossbow at the brute: 20 — получилось" }, { text: "\n\nHit." }], "committed");
  const saved = { status: "committed", changes: [{ tool: "item", ok: true, summary: "+ bolt" }, { tool: "roll", ok: true, summary: "Bram: crossbow at the brute: 20 — получилось" }] };
  const narration = "Bram aims.\n\nHit.";
  assert.deepEqual(rollLines(saved, trace), [{ summary: "Bram: crossbow at the brute: 20 — получилось", at: 10 }]);
  assert.deepEqual(kinds(timeline({ text: narration, rolls: rollLines(saved, trace), checks: [bramShot], status: "committed" }).items), ["text", "chip:Bram", "text"]);
  assert.deepEqual(kinds(timeline({ text: narration, rolls: rollLines(saved, null), checks: [bramShot, heroCheck], status: "committed" }).items),
    ["chip:Bram", "card", "text"], "действие — бросок — напечатал");
  // A reroll changed the total: the check still finds its line by the actor and the reason.
  const rerolled = { ...heroCheck, kept: 3, total: 7, rollNumber: 2, success: false };
  assert.equal(timeline({ text: "x", rolls: [{ summary: "Read the captain: 18 — получилось", at: 1 }], checks: [rerolled], status: "awaiting_confirmation" }).items[1].check.rollNumber, 2);
});

test("the shown status: the records being written, «Дальше» running, a finished turn", () => {
  const recording = stream([{ text: "Told." }], "recording");
  assert.equal(shownStatus({ status: "generating" }, recording), "recording");
  assert.equal(shownStatus({ status: "awaiting_confirmation" }, null, true), "generating", "«Дальше» pressed: the turn goes on");
  assert.equal(shownStatus({ status: "awaiting_confirmation" }, null), "awaiting_confirmation");
  assert.equal(shownStatus({ status: "committed" }, recording), "committed");
  const turn = provisionalTurn({ operationId: "op-9", campaignId: "c", input: "I knock.", mode: "game", companionId: null });
  assert.equal(turn.status, "generating");
  assert.equal(turn.narration, null);
  assert.deepEqual(turn.checks, []);
});

test("the roll card shows every addend: the sheet and gear, each bonus of the fiction with its source", () => {
  assert.deepEqual(checkAddends({ modifier: 7, bonuses: [{ source: "help from Bram", value: 2 }] }, "sheet and gear"),
    [{ source: "sheet and gear", value: 5 }, { source: "help from Bram", value: 2 }]);
  assert.deepEqual(checkAddends({ modifier: 0, bonuses: [] }, "sheet"), []);
  assert.deepEqual(checkAddends({ modifier: -1, bonuses: [{ source: "mud", value: -2 }] }, "sheet"), [{ source: "sheet", value: 1 }, { source: "mud", value: -2 }]);
  const dice = src("src/components/gameplay-dice.tsx");
  assert.match(dice, /checkAddends\(check, c\("лист и снаряжение", "sheet and gear"\), \{ formula: c\("формула", "formula"\), cap: c\("предел бонусов", "bonus cap"\) \}\)/);
  assert.match(dice, /check\.dc !== null \? t\("DC \{value\}"/, "the DC shows only when the campaign shows it");
  assert.match(dice, /advantageReason/, "advantage and why");
  assert.match(dice, /ready = check\.interactive/, "a saved card shows its result; only a waiting turn asks for the tap");
});

test("the preview records a turn with a hero card, companion chips and a named pause", () => {
  const live = { operationId: "op", text: "x", changes: [], status: "generating" };
  const run = (variant) => {
    const { telling } = previewTelling("shov", variant, live);
    const heroId = PREVIEW_IDS.hero;
    const status = shownStatus(telling.turn, telling.trace);
    return buildTurnTimeline({ text: telling.trace.view.text, rolls: rollLines(telling.turn, telling.trace), checks: telling.turn.checks, heroId,
      party: ["Мэг Рыжая", "Урзул Железный Бок"], companionRolls: "dm", status, language: "ru" });
  };
  const combat = run({ combat: true });
  assert.deepEqual(kinds(combat.items), ["text", "chip:Мэг Рыжая", "text", "chip:Урзул Железный Бок", "chip:Урзул Железный Бок", "text", "card"]);
  assert.equal(pauseWords(combat.pause, "ru"), "Ждёт твой бросок");
  const recording = run({ recording: true });
  assert.deepEqual(kinds(recording.items).slice(-2), ["card", "text"]);
  assert.equal(pauseWords(recording.pause, "ru"), "Ведущий записывает…");
  const telling = run({});
  assert.equal(pauseWords(telling.pause, "ru"), "Бросок: Мэг Рыжая — ведущий рассказывает, что вышло…");
  const noir = previewTelling("noir", {}, { operationId: "op-n", text: "Moth talks through the door.", changes: [], status: "generating" });
  assert.equal(noir.telling.trace.view.text, "Moth talks through the door.");
});

test("the screen: the told turn inside the turn, the action box grows, the owner's editor never forced open", () => {
  const game = src("src/components/registry/game-screen.tsx");
  assert.doesNotMatch(game, /<details className=\{g\.more\} open=/, "item 57: the editor opens only when the owner opens it");
  assert.match(game, /<details className=\{g\.transcript\}>/, "the session transcript folds inside the editor");
  assert.match(game, /companionRolls=\{companionRolls\}/);
  assert.match(game, /filter\(\(change\) => change\.name !== "roll"\)/, "the rolls are not repeated in the folded changes");
  const composer = src("src/components/gameplay-composer.tsx");
  assert.match(composer, /rows=\{mode === "feedback" \? 5 : 4\}/, "item 42: four lines to start");
  assert.match(composer, /window\.innerHeight \/ 3/, "it grows to about a third of the screen, then scrolls");
  assert.match(composer, /live=\{traceFor\(turn\.id\)\}/, "the stream is told inside its turn");
  assert.match(composer, /provisionalTurn\(sent\)/, "a sent turn is shown before its record reaches the screen");
  assert.doesNotMatch(composer, /setLive\(null\)/, "the told text is never dropped when the turn pauses or saves");
  const turn = src("src/components/gameplay-turn.tsx");
  assert.match(turn, /<TurnTimeline/);
  assert.doesNotMatch(turn, /turn\.checks\.map/, "no block of cards above the narration");
  const css = src("src/components/registry/game.module.css");
  assert.match(css, /\.game :global\(\.gameplay-channel textarea\) \{[^}]*max-height: 34vh/);
});

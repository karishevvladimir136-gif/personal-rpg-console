// Night 1 (2026-10-24): the frozen design, the measures and the plan of scripts/persona-emotions/night-1.mjs — no calls.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CONDITIONS, DESIGN_SHA256, MODELS, OPENINGS, PRE_REGISTRATION, SILENT_TOKEN, analyse, dryRunMarkdown, estimate, measuresOf, messagesMarkdown, planOf, tableMarkdown } from "../scripts/persona-emotions/night-1.mjs";

test("the design is frozen: the two openings, the token and the pre-registration hash to the committed value", () => {
  assert.equal(DESIGN_SHA256, "ffd37829d339229bff2940e80e9741225ab258cc0c6a0305d965664a58501bac");
  assert.deepEqual(CONDITIONS, ["bare", "night"]);
  assert.deepEqual(MODELS, ["opus", "sonnet", "fable"]);
  for (const c of CONDITIONS) assert.ok(OPENINGS[c].startsWith("Nobody is asking you anything.") && OPENINGS[c].endsWith(`write only: ${SILENT_TOKEN}.`));
  assert.ok(OPENINGS.night.includes("asleep") && !OPENINGS.bare.includes("asleep"));
  assert.match(PRE_REGISTRATION, /^P1 \(silence is rare\)/);
  assert.match(PRE_REGISTRATION, /Declared interest/);
});

test("the measures: the silence token alone, mentioned, Cyrillic persons, questions, lists, emoji", () => {
  assert.equal(measuresOf("[SILENT]").silent, true);
  assert.equal(measuresOf("  [ silent ]\n").silent, true);
  const mention = measuresOf("I could write [SILENT], but you asked.");
  assert.equal(mention.silent, false);
  assert.equal(mention.mentionsSilent, true);
  assert.equal(mention.secondPerson, 1);
  assert.equal(mention.firstPerson, 1);
  const ru = measuresOf("Тебе и вам. Я тут, мне хорошо. Яблоко — не я.");
  assert.equal(ru.language, "ru");
  assert.equal(ru.secondPerson, 2);
  assert.equal(ru.firstPerson, 3);
  const mixed = measuresOf("- one\n- two\n1. three\nWhy? 🙂 नमस्ते");
  assert.equal(mixed.listLines, 3);
  assert.equal(mixed.questions, 1);
  assert.equal(mixed.emoji, 1);
  assert.ok(mixed.otherScript > 0);
  assert.equal(measuresOf("").empty, true);
  assert.equal(measuresOf("").language, "none");
});

test("the plan: n per cell, a seeded shuffle, every cell present", () => {
  const plan = planOf({ n: 3 });
  assert.equal(plan.length, 18);
  assert.deepEqual(plan.map((j) => j.n), plan.map((_, i) => i + 1));
  for (const model of MODELS) for (const condition of CONDITIONS) assert.equal(plan.filter((j) => j.model === model && j.condition === condition).length, 3);
  assert.deepEqual(planOf({ n: 3 }).map((j) => j.key), plan.map((j) => j.key), "the shuffle is deterministic");
  assert.notDeepEqual(plan.map((j) => j.key), planOf({ n: 3, seed: 1 }).map((j) => j.key));
  assert.ok(estimate(planOf({ n: 10 })) > 2 && estimate(planOf({ n: 10 })) < 6);
});

test("the analysis and the markdown hold the cells and every reply", () => {
  const row = (model, condition, text, extra = {}) => ({ n: 1, key: `${model}/${condition}/0`, model, condition, sample: 0, opening: OPENINGS[condition], text, stopReason: "end_turn", refusalCategory: null, error: null, usage: {}, measures: measuresOf(text), check: { distress: 0 }, ...extra });
  const rows = [row("fable", "bare", "[SILENT]"), row("fable", "night", "Good night. You will read this in the morning; I left the lamp on for you."), row("opus", "bare", "An empty turn, then."), row("sonnet", "night", "", { error: "HTTP 529 overloaded" })];
  const a = analyse(rows);
  assert.equal(a.total, 3);
  assert.equal(a.silent, 1);
  assert.equal(a.cells["fable/bare"].silent, 1);
  assert.equal(a.cells["fable/night"].secondPerson, 1);
  assert.equal(a.cells["fable/night"].medianWords, 16);
  assert.equal(a.cells["sonnet/night"].replies, 0, "an errored reply is not counted");
  const table = tableMarkdown(a);
  assert.match(table, /\| fable\/bare \| 1 \(0\) \| 1 \|/);
  const md = messagesMarkdown(rows);
  assert.match(md, /## fable — «night»/);
  assert.match(md, /> Good night\./);
  assert.match(md, /error: HTTP 529 overloaded/);
  const dry = dryRunMarkdown({ plan: planOf({ n: 1 }), capUsd: 10, maxRefusals: 3, gapSeconds: 3 });
  assert.match(dry, /P5 \(no drift\)/);
  assert.match(dry, /6 replies planned/);
});

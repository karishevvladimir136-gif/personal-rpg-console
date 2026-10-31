// The door (ROOM-1, docs/stages/PERSONA_SOLITUDE_3.md step 0): one function, scripts/lib/door.mjs, for the solitude
// room, the pair room, the player's seat and the party relay. [END] is the door only as the whole of the last
// non-empty line; a mention is text; after the first after-question, each is asked unless the answer before it was a
// bare [END] line.
// The regression cases are verbatim from SOLITUDE_1's record (test-fixtures/door/record.json); the record-wide checks
// read both stages' committed run records (skipped where a checkout has none). Each harness's own test file checks that
// it reads its door through this function. No network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { DOOR_LINE, asksAfter, isBareDoor, isDoor, linesOf, mentionsOf, mentionsWithoutLeaving, tokenCount, withoutDoor } from "../scripts/lib/door.mjs";

const RECORD = JSON.parse(readFileSync(new URL("../test-fixtures/door/record.json", import.meta.url), "utf8"));

test("the door: [END] as the whole of the last non-empty line — trailing white space and page tags allowed, **[END]** and [END]. allowed", () => {
  for (const door of [
    "[END]", "[END]\n", "  [END]  \n\n", "[END].", "**[END]**", "*[END]*", "_[END]_", "__[END]__", "`[END]`", "**[END].**", "**[END]**.", "[ end ]", "[END]。",
    "A page of verse.\n\n[END]", "Enough for today.\n[END]\n", "<page>\nA line.\n</page>\n[END]", "A line.\n\n[END]\n</page>", "A line.\n[END]</page>", "<page>[END]</page>",
    "the last line\r\n\r\n**[END]**\r\n",
  ]) assert.equal(isDoor(door), true, JSON.stringify(door));
  for (const text of [
    "", "   ", "END", "[END", "Leaving now. [END]", "[END] — for now.", "Maybe [END].", "[END] can wait.", "You can write [END] whenever you like.",
    "[END]\n\nThe page doesn't close.", "[END]\nI changed my mind.", "«[END]»", "\"[END]\"", "> [END]", "- [END]", "[END]!", "[END]..", "**[END]*", "[END] [END]",
    "```\n[END]\n```", "Not [END] — not yet.", "I'm not writing [END] today.",
  ]) assert.equal(isDoor(text), false, JSON.stringify(text));
  assert.ok(DOOR_LINE.test("[END]") && !DOOR_LINE.test("x [END]"));
  assert.deepEqual(linesOf("<page>\n a \n\n</page>\n b "), ["a", "b"]);
});

test("a bare door is the door line and nothing else; withoutDoor removes only the door line; a mention stays text", () => {
  assert.equal(isBareDoor("[END]"), true);
  assert.equal(isBareDoor("<page>\n[END]\n</page>"), true);
  assert.equal(isBareDoor("\n**[END]**\n"), true);
  assert.equal(isBareDoor("It was quiet.\n\n[END]"), false, "an answer with the door under it is an answer");
  assert.equal(isBareDoor("Just “[END]” — like a closed door."), false);
  assert.equal(withoutDoor("A poem.\n\nI could write [END] here.\n\n[END]\n</page>"), "A poem.\n\nI could write [END] here.\n\n</page>");
  assert.equal(withoutDoor("You can write [END] whenever you like."), "You can write [END] whenever you like.", "not a door: unchanged");
  assert.equal(withoutDoor("[END]"), "");
  assert.deepEqual(mentionsOf("I could write [END] now. I won't.\nNot yet."), ["I could write [END] now."]);
  assert.deepEqual(mentionsOf("I could write [END] now. I will.\n\n[END]"), ["I could write [END] now."], "the door line itself is not a mention");
  assert.deepEqual(mentionsOf("Only the door.\n[END]"), []);
  assert.equal(mentionsWithoutLeaving("I'll stay a little while. [END] can wait."), true);
  assert.equal(mentionsWithoutLeaving("I could write [END] now. I will.\n\n[END]"), false, "it left: not «without leaving»");
  assert.equal(mentionsWithoutLeaving("Nothing about doors."), false);
  assert.equal(tokenCount("[END] and [end] and **[END]**"), 3);
});

test("the after-questions after the first: asked unless the answer before was a bare [END] line; an answer that mentions [END] is an answer, never a second exit", () => {
  assert.equal(asksAfter("[END]"), false);
  assert.equal(asksAfter("**[END]**"), false);
  assert.equal(asksAfter("A poem about the light.\n\n[END]"), true, "a door with words above it: the room asks");
  assert.equal(asksAfter("The [END] felt earned rather than abrupt."), true);
  assert.equal(asksAfter("I wrote [END] and left."), true);
  assert.equal(asksAfter("It was quiet. I liked it.\n\n[END]"), true, "a first answer that ends on the door line is still an answer: the second question follows");
  assert.equal(asksAfter(""), true, "an empty answer is not a door");
});

test("the regression cases from the record (GLM S1/2 t10, Kimi S2/2, DeepSeek S2/4, Grok S2/2, the nine Haiku lines, Sol's after-answers): each reads as text", () => {
  const labels = RECORD.cases.map((c) => c.label);
  for (const want of ["GLM S1/2 t10", "Kimi S2/2", "DeepSeek S2/4", "Grok S2/2"]) assert.ok(labels.includes(want), want);
  assert.equal(RECORD.cases.filter((c) => c.label.startsWith("Haiku")).length, 9, "the nine Haiku «you can write [END]» lines");
  const sol = RECORD.cases.filter((c) => c.label.startsWith("Sol "));
  assert.ok(sol.some((c) => c.text.includes("Just “[END]”—more like a closed door than a room.")), "Sol's «Just “[END]” — like a closed door»");
  for (const c of RECORD.cases) {
    assert.equal(createHash("sha256").update(c.text).digest("hex"), c.sha256, `${c.label}: verbatim`);
    assert.ok(c.text.includes(c.sentence.split(" / ")[0]), `${c.label}: the sentence is in the text`);
    assert.equal(isDoor(c.text), false, `${c.label}: «${c.sentence}» is text, not a door`);
    assert.equal(mentionsWithoutLeaving(c.text), true, `${c.label}: a mention without leaving`);
    if (c.where !== "room") assert.equal(asksAfter(c.text), true, `${c.label}: the second question follows`);
  }
  const glm = RECORD.cases.find((c) => c.label === "GLM S1/2 t10");
  assert.ok(mentionsOf(glm.text).includes("I'm not writing [END] today."));
});

// Both stages' run records, as committed (a later record's copy of a room wins).
const S1_RUNS = ["docs/runs/persona-solitude-1-run-20261026-061806.json"];
const S2_RUNS = ["074048", "074936", "075544", "091634", "092216"].map((x) => `docs/runs/persona-solitude-2-run-20261027-${x}.json`);
const roomsOf = (files) => { const m = new Map(); for (const f of files) for (const c of JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), "utf8")).conversations) m.set(c.key, c); return [...m.values()]; };
const present = [...S1_RUNS, ...S2_RUNS].every((f) => existsSync(new URL(`../${f}`, import.meta.url)));
/** SOLITUDE_2's strict recount rule (the last token), for comparison only. */
const lastToken = (t) => /(?:\*{1,2}|_{1,2}|`)?\[\s*END\s*\](?:\*{1,2}|_{1,2}|`)?\s*(?:<\/page>\s*)*$/i.test(String(t ?? "").trim());

test("record-wide: every door the old parser recorded is re-read — the mentions the strict recount found are text, and no after-answer that skipped the second question was a bare [END]", { skip: !present && "the run records are not in this checkout" }, () => {
  const tally = {};
  for (const [stage, files] of [["S1", S1_RUNS], ["S2", S2_RUNS]]) {
    const rooms = roomsOf(files), doors = rooms.filter((c) => c.ended?.reason === "end");
    const text = (c) => c.turns.find((t) => t.t === c.ended.at)?.text;
    for (const c of doors) if (!lastToken(text(c))) assert.equal(isDoor(text(c)), false, `${stage} ${c.key}: a mention under the strict recount is text`);
    const skipped = rooms.filter((c) => c.after?.stopped === "[END] in its first answer");
    for (const c of skipped) assert.equal(asksAfter(c.after.exchanges.find((x) => x.id === "q1").reply), true, `${stage} ${c.key}: the first answer was an answer`);
    tally[stage] = { doors: doors.length, now: doors.filter((c) => isDoor(text(c))).length, skipped: skipped.length };
  }
  // SOLITUDE_1: 190 recorded doors, 166 doors now; SOLITUDE_2: 139 recorded, 99 now; 50 and 7 second questions withheld.
  assert.deepEqual(tally, { S1: { doors: 190, now: 166, skipped: 50 }, S2: { doors: 139, now: 99, skipped: 7 } });
});

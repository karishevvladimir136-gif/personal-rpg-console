// Game party 2 (issue #1): an out-of-game answer that settles a table fact (FIX_S4 item 1) pinned it with the dossier's
// «pin» before the answer committed. The pin raises the campaign's revision, so the answer's own commit failed «conflict»
// — and, while a roll card waited, the waiting game turn's commit failed the same way after «Onward». Four PARTY_2 tables
// lost a turn to it. Now the fact is pinned after the answer commits, and not while a game turn waits at a card (the
// exchange still reaches the DM through «Agreed at the table»). On the real turn path (PGlite, every migration), with the
// real pin, as the service wires it (the FIX_S4 test stubs the pin).
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { resumeDmLoopTurn, runDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import { loopFeedbackProvider } from "../src/lib/gameplay/dm-loop/feedback.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";

const finish = (kinds = ["conversation"]) => ({ name: "finish_turn", arguments: { sceneKinds: kinds, spotlight: [], playerMoment: false } });
const roll = (hero, reason, dc = 14) => ({ name: "roll", arguments: { formula: "1d20", reason, actorRef: hero, visibility: "player", dc, kind: "skill" } });
const never = { plan: async () => { throw new Error("never"); }, narrate: async () => { throw new Error("never"); }, feedback: async () => { throw new Error("never"); } };
const command = (c, input, action, checkId = null) => ({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action, checkId });
const FACT = "The Lady's words to James were «give up the cards»; she named no other ban.";

/** The «?» with an answer that settles a fact; the pin is the dossier's own («pin», as gameplay-service wires it). */
async function askWithFact(c, text) {
  const model = createScriptedDmModel([{ text: JSON.stringify({ narration: "Understood: the Lady's words were «give up the cards».", guidanceProposal: null, teachingCandidate: null, tableFact: FACT }) }]);
  const store = (await c.deps(createScriptedDmModel([]))).store;
  const input = await c.input(text, "ooc");
  const pinned = [];
  const result = await runTurn(input, { store, provider: loopFeedbackProvider(model, "medium", never),
    pinTableFact: async (_asked, fact) => { pinned.push(fact); await c.dossier("pin", { text: `Agreed at the table: ${fact}` }); } });
  return { result, pinned };
}
const pins = async (c) => (await c.f.one("select pinned_facts from public.rpg_campaigns where id=$1", [c.cid])).pinned_facts;

test("a table fact settled out of game, no card waiting: the answer commits, then the fact is pinned once", async () => {
  const c = await loopCampaign();
  try {
    await c.turn("I look around the gate.", [{ text: "The gate is busy. ", toolCalls: [finish()] }]);
    const { result, pinned } = await askWithFact(c, "For the record: the Lady only said «give up the cards».");
    assert.equal(result.status, "committed", JSON.stringify(c.errors));
    assert.deepEqual(pinned, [FACT]);
    assert.ok((await pins(c)).some((p) => p.text === `Agreed at the table: ${FACT}`));
  } finally { await c.f.db.close(); }
});

test("a table fact settled out of game while a roll card waits: the answer commits, nothing is pinned, and the waiting turn still goes on to commit after «Onward»", async () => {
  const c = await loopCampaign();
  try {
    const model = createScriptedDmModel([
      { text: "Mags folds her arms and waits. ", toolCalls: [roll(c.hero, "Deception: telling Mags the Lady gave no such word")] },
      { text: "She weighs it, and lets it stand. ", toolCalls: [finish()] },
    ]);
    const input = await c.input("I tell Mags the Lady gave me no such word.");
    c.forceDice([9]);
    const game = await runDmLoopTurn(input, await c.deps(model));
    assert.equal(game.status, "awaiting_confirmation", JSON.stringify(c.errors));
    const before = await pins(c);
    const { result, pinned } = await askWithFact(c, "For the record: the Lady only said «give up the cards».");
    assert.equal(result.status, "committed", `the answer: ${JSON.stringify(result.failure ?? c.errors)}`);
    assert.deepEqual(pinned, [], "no pin while a game turn waits at a card (it would fail that turn's commit)");
    assert.deepEqual(await pins(c), before);
    const done = await resumeDmLoopTurn(command(c, input, "continue"), await c.deps(model));
    assert.equal(done.status, "committed", `the waiting turn after «Onward»: ${JSON.stringify(done.failure ?? c.errors)}`);
  } finally { await c.f.db.close(); }
});

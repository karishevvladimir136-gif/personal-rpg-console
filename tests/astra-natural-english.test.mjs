import test from "node:test";
import assert from "node:assert/strict";
import { createOwnerLongRestWorld } from "./owner-long-rest-fixture.mjs";

for (const language of ["en", "ru"]) {
  test(`natural-English guidance is scoped to English public narration (${language})`, async () => {
    const world = await createOwnerLongRestWorld();
    try {
      await world.f.one("update public.rpg_campaigns set language=$2 where id=$1",
        [world.f.cid, language]);
      let instructions;
      const usage = { model: "fake", inputTokens: 0, outputTokens: 0, calls: 0, latencyMs: 0 };
      const result = await world.runTurn({
        next: async (_context, _input, _receipts, _checks, _caps, source) => ({ usage,
          output: { type: "final", call: null, final: {
            worldMinutes: source.runtime.worldMinutes, changes: [], outcomes: [],
            privatePatches: [], effects: [],
          } } }),
        narrate: async (context) => {
          instructions = context.instructions;
          assert.equal(JSON.parse(context.input).mandatory.privateState, undefined);
          return { usage, output: { narration: "The market grows quiet.",
            visualDescription: "", clarification: null } };
        },
      });
      assert.equal(result.result.status, "committed");
      if (language === "en") {
        assert.match(instructions, /idiomatic.*natural conversational English/i);
        assert.match(instructions, /character.*voice.*setting/i);
        assert.match(instructions, /literal.translation.*bureaucratic/i);
        assert.match(instructions, /archaic.*intentional/i);
      } else assert.doesNotMatch(instructions, /natural conversational English/i);
    } finally { await world.f.db.close(); }
  });
}

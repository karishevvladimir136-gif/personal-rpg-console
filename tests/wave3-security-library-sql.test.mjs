import test from "node:test";
import assert from "node:assert/strict";
import { qaFixture } from "./wave3-qa-fixture.mjs";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";
import { description, draft, profile, proposal } from "./wave3-compiler-fixtures.mjs";
import { sourceInput } from "./wave2-library-fixtures.mjs";

for (const variant of ["origin", "privacy"]) {
  test(`QA SQL: first assisted draft cannot change compiler-derived ${variant} before immutable persistence`, async () => {
    const f = await qaFixture();
    try {
      let reachedBoundary = false;
      const store = createRpcLibraryStore(f.owner, async (args) => {
        const sent = structuredClone(args);
        const record = sent.p_payload.record;
        if (sent.p_action === "put" && record.kind === "pack" && record.version === 1) {
          reachedBoundary = true;
          if (variant === "origin") {
            assert.equal(record.body.claims[1].origin, "source_inference");
            record.body.claims[1].origin = "source_fact";
          } else {
            const claim = record.body.claims[0];
            assert.equal(claim.visibility, "private");
            assert.equal(claim.knowledge, "future_source");
            claim.visibility = "public";
            claim.knowledge = "source";
            for (const evidence of claim.evidence) {
              evidence.visibility = "public";
              evidence.knowledge = "source";
            }
          }
        }
        try {
          return {
            data: (
              await f.one("select public.rpg_library($1,null,$2,$3::jsonb,null) result", [
                sent.p_owner_id,
                sent.p_action,
                JSON.stringify(sent.p_payload),
              ])
            ).result,
          };
        } catch (error) {
          return { error: { message: error.message, code: error.code } };
        }
      });
      const service = createOwnerLibraryAuthoring(f.owner, store, {
        resolveProfile: profile,
        compile: async (input) => ({
          output: proposal(input),
          usage: {
            model: input.job.assistance.executionProfile.modelId,
            inputTokens: 2,
            outputTokens: 3,
            calls: 1,
            latencyMs: 0,
          },
        }),
      });
      const inputs = [sourceInput({ visibility: "public", text: "The supplied account mentions dragons." })];
      if (variant === "privacy")
        inputs.push(description({ visibility: "private", knowledge: "future_source", text: "QA_PRIVATE_FUTURE: the dragon order has an undiscovered plan." }));
      await assert.rejects(() => draft({ service }, inputs));
      assert.equal(reachedBoundary, true);
      assert.equal(
        (await f.one("select count(*)::integer n from rpg_private.library_records where kind='pack'")).n,
        0,
        "The service's response mismatch must not be the first rejection after an immutable bad draft was stored",
      );
    } finally {
      await f.db.close();
    }
  });
}

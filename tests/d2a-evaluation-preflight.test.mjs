import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  evaluationCases,
  evaluationFixture,
  evaluationSelection,
  evaluationInputCeiling,
} from "./d2a-evaluation-fixtures.mjs";
import { command, durableState } from "./d2a-integration-fixture.mjs";

for (const spec of evaluationCases)
  test(`Stage 1.1 ${spec.name}: frozen complete wire inputs fit 20k, no network`, async (t) => {
    t.mock.method(globalThis, "fetch", () => {
      throw Error("NO_LIVE_NETWORK");
    });
    const f = await evaluationFixture(spec);
    try {
      const before = await f.active(),
        requests = [];
      const { authoring, lab } = await f.services(async (url, init) => {
        assert.equal(url, "https://api.openai.com/v1/responses");
        const body = JSON.parse(init.body),
          index = requests.length;
        // The future evaluation guard pins standard processing before reserving cost.
        const wire = { ...body, service_tier: "default" };
        const accountedInput =
          Buffer.byteLength(JSON.stringify(wire), "utf8") + 2048;
        assert.ok(
          accountedInput <= evaluationInputCeiling,
          `call ${spec.calls[index]} exceeds preflight: ${accountedInput}`,
        );
        assert.equal(body.model, "gpt-5.4");
        assert.equal(body.reasoning.effort, "high");
        assert.equal(body.max_output_tokens, index === 0 ? 16384 : 8192);
        assert.equal(body.truncation, "disabled");
        assert.doesNotMatch(
          JSON.stringify(wire),
          /PRIVATE_|PRIVATE_CLAIM|PRIVATE_GUIDANCE/,
        );
        if (index > 0) assert.doesNotMatch(body.input, /FUTURE_EVAL_CANARY/);
        if (spec.name === "temporal" && index === 0) {
          const evidence = JSON.parse(body.input).evidence;
          assert.ok(
            evidence.some(
              (e) =>
                e.text.includes("FUTURE_EVAL_CANARY") &&
                e.knowledge === "future_source",
            ),
          );
        }
        requests.push({
          call: spec.calls[index],
          accountedInput,
          cap: body.max_output_tokens,
        });
        return f.scriptedOutput(body, index);
      });
      const interpreted = await authoring.perform({
        action: "interpret",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          saveId: f.save.id,
          premise: spec.premise,
          model: evaluationSelection,
        },
      });
      assert.equal(interpreted.draft.proposal.phase, "review");
      assert.equal(interpreted.run, null);
      if (spec.name === "ambiguous") {
        await assert.rejects(
          authoring.perform({
            action: "approve",
            input: {
              operationId: randomUUID(),
              campaignId: f.cid,
              versionId: interpreted.draft.versionId,
            },
          }),
        );
        assert.equal(
          (
            await f.one(
              "select count(*)::integer n from rpg_private.world_lab_runs",
            )
          ).n,
          0,
        );
      } else {
        // Scripted output only: this test approval is not approval of any live result.
        const approved = await authoring.perform({
          action: "approve",
          input: {
            operationId: randomUUID(),
            campaignId: f.cid,
            versionId: interpreted.draft.versionId,
          },
        });
        let run = approved.run;
        for (let i = 1; i < spec.calls.length; i++) {
          const request = { action: "continue", input: command(run) };
          run = await lab.perform(request);
          assert.equal(
            run.currentWorldMinutes,
            i * 60,
            JSON.stringify({ run, requests }),
          );
          assert.equal(run.checkpoints.length, i + 1);
          const durable = await durableState(f);
          // Replay after a simulated lost response must not call the provider again.
          const count = requests.length;
          assert.deepEqual(await lab.perform(request), run);
          assert.equal(requests.length, count);
          assert.deepEqual(await durableState(f), durable);
        }
        if (spec.name === "polar") {
          const state = await f.store.readDetached(f.cid, run.id);
          assert.equal(
            state.records["public.rpg_items"].find(
              (row) => row.id === f.supplies,
            ).quantity,
            7,
          );
        }
      }
      assert.deepEqual(await f.active(), before);
      assert.equal(requests.length, spec.calls.length);
      for (const request of requests) t.diagnostic(JSON.stringify(request));
    } finally {
      await f.db.close();
    }
  });

import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";
import {
  compositionFixture,
  compositionResponse,
} from "./d2a-composition-fixtures.mjs";
import { fixture, proposal, response } from "./d2a-resolver-fixtures.mjs";
import {
  fixture as logicFixture,
  proposal as logicProposal,
} from "./wave3-logic-fixtures.mjs";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import {
  moduleFromSource,
  command,
  durableState,
} from "./d2a-integration-fixture.mjs";
import {
  evaluationCases,
  evaluationFixture,
  evaluationSelection,
} from "./d2a-evaluation-fixtures.mjs";

const { createStructuredRequester, openAiProvider } = await moduleFromSource(
  "src/lib/server/dm/provider.ts",
);
const { createComposerProvider } = await moduleFromSource(
  "src/lib/server/world-lab/composer-provider.ts",
);
const { createWorldResolverProvider } = await moduleFromSource(
  "src/lib/server/world/resolver-provider.ts",
);
const { createLabService } = await moduleFromSource(
  "src/lib/world-lab/service.ts",
);
const options = { apiKey: "SYNTHETIC", model: "gpt-5.4", reasoning: "high" };

function signals(t) {
  const deadlines = [];
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK");
  });
  t.mock.method(AbortSignal, "timeout", (ms) => {
    const controller = new AbortController();
    deadlines.push({ ms, controller });
    return controller.signal;
  });
  return deadlines;
}

function timeout(deadlines, signal) {
  const deadline = deadlines.at(-1);
  assert.equal(signal, deadline.controller.signal);
  return new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), {
      once: true,
    });
    queueMicrotask(() =>
      deadline.controller.abort(
        new DOMException("Synthetic deadline", "TimeoutError"),
      ),
    );
  });
}

function cases() {
  const c = compositionFixture(),
    r = fixture(),
    d = runtimeFixture(),
    l = logicFixture();
  Object.assign(c.requested.composition.composeProfile, {
    modelId: options.model,
    reasoning: options.reasoning,
  });
  Object.assign(r.profile, {
    modelId: options.model,
    reasoning: options.reasoning,
  });
  return [
    {
      name: "compose",
      ms: 180000,
      cap: 16384,
      invoke: (o) => createComposerProvider(o)(c.requested.composition),
      good: () => compositionResponse(c.proposal, "gpt-5.4-2026-03-05"),
    },
    {
      name: "simulation",
      ms: 120000,
      cap: 8192,
      invoke: (o) =>
        createWorldResolverProvider(o).simulate(r.input, r.scope, r.profile),
      good: () => response(proposal(r), "gpt-5.4-2026-03-05"),
    },
    {
      name: "DM",
      ms: 60000,
      cap: 4096,
      invoke: (o) => openAiProvider(o).plan(d.source, d.input),
      good: () => response(d.plan, "gpt-5.4-2026-03-05"),
    },
    {
      name: "gameplay World Logic",
      ms: 60000,
      cap: 4096,
      invoke: (o) => createWorldResolverProvider(o).action(l),
      good: () => response(logicProposal(l), "gpt-5.4-2026-03-05"),
    },
  ];
}

test("task adapters select exact deadlines, clamp overrides and retain model/reasoning/output", async (t) => {
  const deadlines = signals(t);
  for (const c of cases()) {
    for (const timeoutMs of [undefined, 900000, 7]) {
      const attempts = [],
        requests = [];
      await c.invoke({
        ...options,
        timeoutMs,
        observer: (a) => attempts.push(a),
        fetcher: async (_, init) => {
          requests.push(JSON.parse(init.body));
          assert.equal(init.signal, deadlines.at(-1).controller.signal);
          return c.good();
        },
      });
      const expected = timeoutMs === 7 ? 7 : c.ms;
      assert.equal(deadlines.at(-1).ms, expected, c.name);
      assert.equal(attempts[0].timeoutMs, expected);
      assert.equal(requests.length, 1);
      assert.equal(requests[0].model, "gpt-5.4");
      assert.equal(requests[0].reasoning.effort, "high");
      assert.equal(requests[0].max_output_tokens, c.cap);
      assert.equal(requests[0].truncation, "disabled");
      assert.equal(requests[0].tools, undefined);
      assert.equal(requests[0].background, undefined);
    }
  }
});

test("shared requester retains 60 seconds for ordinary DM, Memory, compiler and World resolution", async (t) => {
  const deadlines = signals(t);
  for (const task of [
    undefined,
    "dm.plan",
    "dm.narrate",
    "dm.feedback",
    "memory.summary",
    "canon.compile",
    "world.resolve",
  ]) {
    const request = createStructuredRequester(
      {
        ...options,
        timeoutMs: 180000,
        fetcher: async () => response({}, options.model),
      },
      task ? { task } : undefined,
    );
    await request(
      {
        instructions: "Synthetic",
        input: "{}",
        estimatedTokens: 1,
        sourceCount: 0,
        budget: modelBudget(options.model),
      },
      "plan",
      randomUUID(),
      (x) => x,
    );
    assert.equal(deadlines.at(-1).ms, 60000, task);
  }
});

test("task deadline aborts before headers or during body consumption fail closed once", async (t) => {
  const deadlines = signals(t);
  for (const c of cases().slice(0, 2)) {
    for (const phase of ["headers", "body"]) {
      let calls = 0;
      const attempts = [];
      await assert.rejects(
        c.invoke({
          ...options,
          observer: (a) => attempts.push(a),
          fetcher: async (_, init) => {
            calls++;
            if (phase === "headers") return timeout(deadlines, init.signal);
            // A real fetch's response body remains bound to the same abort signal.
            return {
              ok: true,
              status: 200,
              text: () => timeout(deadlines, init.signal),
            };
          },
        }),
        { code: "provider" },
      );
      assert.equal(calls, 1);
      assert.equal(attempts.length, 1);
      assert.equal(attempts[0].success, false);
      assert.equal(attempts[0].actualModel, null);
      assert.equal(attempts[0].timeoutMs, c.ms);
    }
  }
});

test("composition timeout preserves only the requested draft, with no run or gameplay mutation", async (t) => {
  const deadlines = signals(t);
  const f = await evaluationFixture(
    evaluationCases.find((s) => s.name === "temporal"),
  );
  try {
    const live = await f.active();
    let calls = 0;
    const { authoring } = await f.services(async (_, init) => {
      calls++;
      assert.equal(deadlines.at(-1).ms, 180000);
      return timeout(deadlines, init.signal);
    });
    await assert.rejects(
      authoring.perform({
        action: "interpret",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          saveId: f.save.id,
          premise: f.spec.premise,
          model: evaluationSelection,
        },
      }),
      { code: "provider" },
    );
    assert.equal(calls, 1);
    const catalog = await authoring.catalog(f.cid);
    assert.equal(catalog.drafts.length, 1);
    assert.equal(catalog.drafts[0].proposal.phase, "requested");
    assert.equal(catalog.drafts[0].proposal.review, null);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_lab_runs",
        )
      ).n,
      0,
    );
    assert.deepEqual(await f.active(), live);
  } finally {
    await f.db.close();
  }
});

test("resolver timeout and lost failure-receipt response replay a durable pause with no effects or second request", async (t) => {
  const deadlines = signals(t);
  const f = await evaluationFixture(
    evaluationCases.find((s) => s.name === "polar"),
  );
  try {
    const live = await f.active();
    const { authoring } = await f.services(async (_, init) =>
      f.scriptedOutput(JSON.parse(init.body), 0),
    );
    const interpreted = await authoring.perform({
      action: "interpret",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        saveId: f.save.id,
        premise: f.spec.premise,
        model: evaluationSelection,
      },
    });
    const approved = await authoring.perform({
      action: "approve",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        versionId: interpreted.draft.versionId,
      },
    });
    const initial = await f.store.readDetached(f.cid, approved.run.id);
    let calls = 0,
      lose = true;
    const lab = createLabService(
      f.owner,
      async (args) => {
        const result = await f.rpc(args);
        if (args.p_action === "model_result" && !result.error && lose) {
          lose = false;
          throw Error("SYNTHETIC_LOST_FAILURE_RECEIPT_RESPONSE");
        }
        return result;
      },
      "ru",
      {
        resolver: (profile) =>
          createWorldResolverProvider({
            ...options,
            model: profile.modelId,
            reasoning: profile.reasoning,
            fetcher: async (_, init) => {
              calls++;
              assert.equal(deadlines.at(-1).ms, 120000);
              return timeout(deadlines, init.signal);
            },
          }),
      },
    );
    const request = { action: "continue", input: command(approved.run) };
    await assert.rejects(lab.perform(request));
    assert.equal(lose, false);
    assert.equal(calls, 1);
    assert.deepEqual(
      (await f.store.readDetached(f.cid, approved.run.id)).records,
      initial.records,
    );
    const paused = await lab.perform(request);
    assert.equal(paused.status, "paused");
    assert.equal(paused.currentWorldMinutes, 0);
    assert.deepEqual(paused.checkpoints, approved.run.checkpoints);
    const state = await f.store.readDetached(f.cid, approved.run.id);
    assert.deepEqual(state.records, initial.records);
    assert.equal(state.run.headManifestId, initial.run.headManifestId);
    const stable = await durableState(f);
    assert.deepEqual(await lab.perform(request), paused);
    assert.deepEqual(await durableState(f), stable);
    assert.equal(calls, 1, "failure receipt replay never calls provider again");
    const receipt = await f.one(
      "select result from rpg_private.world_lab_commands where operation_id=$1 and stage='model_result'",
      [request.input.operationId],
    );
    assert.deepEqual(receipt.result, {
      error: "unavailable",
      proposal: null,
      usage: null,
    });
    assert.deepEqual(await f.active(), live);
  } finally {
    await f.db.close();
  }
});

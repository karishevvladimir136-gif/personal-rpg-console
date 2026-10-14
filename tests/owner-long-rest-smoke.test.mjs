import test from "node:test";
import assert from "node:assert/strict";
import { runLongRestSmoke, longRestTextGate } from "../scripts/owner-playtest-long-rest-smoke.mjs";
import { diagnosticState } from "../scripts/astra-primary-production-smoke.mjs";

const request = (stage) => ({ body: JSON.stringify({ model: "gpt-6-astra",
  store: false, service_tier: "default", max_output_tokens: 4096,
  reasoning: { effort: stage === "dm_plan" ? "high" : "medium" },
  text: { format: { name: stage, strict: true } },
  input: [{ content: [{ type: "input_text", text: "synthetic" }] }],
}) });
const response = (value) => new Response(JSON.stringify({ model: "gpt-6-astra",
  service_tier: "default", status: "completed", output: [{ type: "message",
    role: "assistant", status: "completed", content: [{ type: "output_text",
      text: JSON.stringify(value) }] }], usage: { input_tokens: 5, output_tokens: 5 },
}));

test("long-rest harness requires explicit opt-in and rejects repeated planning/media", async () => {
  let calls = 0;
  const realFetch = async () => { calls++; return response({}); };
  await assert.rejects(runLongRestSmoke({ realFetch, apiKey: "synthetic" }),
    { message: "explicit_live_flag_required" });
  const state = diagnosticState("synthetic", { maxRequests: 2, maxSpendUsd: 2 });
  const gate = longRestTextGate(realFetch, state);
  await gate("https://api.openai.com/v1/responses", request("dm_plan"));
  await assert.rejects(gate("https://api.openai.com/v1/responses", request("dm_plan")),
    { message: "single_long_rest_request_per_stage" });
  await assert.rejects(gate("https://api.openai.com/v1/images", request("dm_narrate")),
    { message: "long_rest_text_route_rejected" });
  assert.equal(calls, 1);
});

test("a dispatched transport failure has unknown usage rather than a zero-spend claim", async () => {
  const state = diagnosticState("synthetic", { maxRequests: 2, maxSpendUsd: 2 });
  const gate = longRestTextGate(async () => { throw Error("synthetic transport failure"); }, state);
  await assert.rejects(gate("https://api.openai.com/v1/responses", request("dm_plan")));
  assert.equal(state.requests, 1);
  assert.equal(state.usageKnown, false);
});

test("production long-rest smoke consumes ordinary food atomically and replay makes no provider call", async () => {
  let calls = 0;
  const report = await runLongRestSmoke({ live: true, apiKey: "synthetic",
    realFetch: async (_url, init) => {
      calls++;
      const body = JSON.parse(init.body);
      if (body.text.format.name === "dm_narrate") return response({
        narration: "You eat the vegetables and sleep in the permitted shelter until morning.",
        visualDescription: "", clarification: null,
      });
      const packet = JSON.parse(typeof body.input === "string" ? body.input :
        body.input[0].content[0].text);
      const current = packet.context.mandatory.current;
      return response({ type: "final", call: null, final: { schemaVersion: 1,
        worldMinutes: current.worldMinutes, changes: [], outcomes: [], privatePatches: [],
        effects: [{ kind: "formal_rest", restKind: "long", restSafety: {
          locationId: current.publicState.current_location_id, suitable: true,
        } }],
      } });
    } });
  assert.equal(report.acceptance, "passed", JSON.stringify(report));
  assert.equal(calls, 2);
  assert.equal(report.accounting.requests, 2);
  assert.equal(report.replayProviderCalls, 0);
  assert.equal(report.replayUnchanged, true);
  assert.deepEqual(report.delta, { provisions: -1, worldMinutes: 480, hp: 0,
    quests: 0, rests: 1, locationChanged: false, resourcesChanged: false });
  assert.equal(report.mediaRequests, 0);
  assert.equal(JSON.stringify(report).includes("Authorization"), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import {
  preflightMemory,
  memoryAwareProvider,
} from "../src/lib/memory/lifecycle.ts";

function setup() {
  const { source, input } = runtimeFixture();
  input.input = "I observe the door.";
  let overflow = false;
  const calls = [];
  const context = () => ({
    campaignId: input.campaignId,
    generation: 1,
    stateRevision: 1,
    checkpoint: null,
    publicSummary: null,
    privateSummary: null,
    publicWatermark: 0,
    privateWatermark: 0,
    publicHighWatermark: 0,
    privateHighWatermark: 0,
    uncovered: [],
    overflow,
    aliases: [],
  });
  const store = {
    read: async () => ({ currentBoundary: null }),
    source: async () => source,
    context: async () => context(),
    search: async (req) => ({
      campaignId: req.campaignId,
      generation: 1,
      sources: [],
      aliases: [],
    }),
    enqueue: async (cid, reason) => {
      calls.push(reason);
      overflow = false;
    },
    claim: async () => null,
  };
  const provider = {
    summarize: async () => {
      throw Error("Unexpected paid summary");
    },
  };
  return {
    source,
    input,
    store,
    provider,
    calls,
    overflow: () => {
      overflow = true;
    },
  };
}
test("ordinary context does not trigger a per-turn summary", async () => {
  const f = setup();
  await preflightMemory(f.input, f.store, f.provider, "gpt-6-astra");
  assert.deepEqual(f.calls, []);
});
test("ended sessions reject preflight before source/provider work", async () => {
  const f = setup();
  f.store.read = async () => ({ currentBoundary: { state: "ended" } });
  f.store.source = async () => {
    throw Error("Must not load or generate");
  };
  await assert.rejects(
    preflightMemory(f.input, f.store, f.provider, "gpt-6-astra"),
    (e) => e.code === "unavailable" && e.retryable,
  );
});
test("overflow triggers one bounded recovery and revalidates current revision", async () => {
  const f = setup();
  f.overflow();
  await preflightMemory(f.input, f.store, f.provider, "gpt-6-astra");
  assert.deepEqual(f.calls, ["rebuild"]);
  f.overflow();
  f.store.enqueue = async () => {
    f.source.runtime.revision = 2;
  };
  await assert.rejects(
    preflightMemory(f.input, f.store, f.provider, "gpt-6-astra"),
    (e) => e.code === "conflict",
  );
});
test("provider decoration uses private memory only for planning; feedback bypasses world history", async () => {
  const f = setup(),
    reads = [];
  const context = f.store.context;
  f.store.context = async (cid, actors, privateAllowed) => {
    reads.push(privateAllowed);
    return context();
  };
  const wrapped = memoryAwareProvider(
    { plan: async (s) => ({ output: { privatePatches: [] }, source: s }), narrate: async (s) => s, feedback: async (s) => s },
    f.store,
  );
  await wrapped.plan(f.source, f.input);
  await wrapped.narrate(f.source, f.input, {}, []);
  await wrapped.feedback(f.source, { ...f.input, mode: "feedback" });
  assert.deepEqual(reads, [true, false]);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function runtime(reviewOnly) {
  const effects = [],
    loads = [],
    events = [],
    timers = [];
  const timeline = {
    timelineId: "11111111-1111-4111-8111-000000000001",
    epoch: 1,
  };
  const campaignId = "11111111-1111-4111-8111-000000000002";
  const exports = {};
  const stubs = {
    react: {
      useCallback: (fn) => fn,
      useEffect: (fn) => effects.push(fn),
      useRef: (current) => ({ current }),
      useState: (initial) => [initial, () => {}],
    },
    "./persistence-context": {
      useCampaignData: () => ({
        campaignId,
        data: { timeline },
        refresh: async () => assert.fail("No projection refresh is needed"),
      }),
    },
    "@/lib/gameplay/client": {
      loadPlay: async (cid) => {
        loads.push(cid);
        return { campaignId, timeline, turns: [] };
      },
      gameplayErrorMessage: () => "safe error",
    },
    "@/lib/gameplay/client-state": { isUnresolved: () => false },
    "@/lib/saves/client-state": {
      sameTimeline: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  };
  const output = ts.transpileModule(
    readFileSync(
      new URL("../src/components/gameplay-runtime.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(output, {
    exports,
    require: (name) => {
      assert.ok(name in stubs, name);
      return stubs[name];
    },
    window: {
      addEventListener: (name, callback) => events.push({ name, callback }),
      removeEventListener: () => {},
      setInterval: (callback, interval) => {
        timers.push({ callback, interval });
        return 1;
      },
      clearInterval: () => {},
    },
  });
  const value =
    reviewOnly === undefined
      ? exports.useGameplayRuntime()
      : exports.useGameplayRuntime(reviewOnly);
  const cleanups = effects
    .map((fn) => fn())
    .filter((fn) => typeof fn === "function");
  return { value, loads, events, timers, cleanups, campaignId };
}

test("synthetic campaign review uses the ordinary Game runtime without network, polling or projection mutation", async (t) => {
  t.mock.method(globalThis, "fetch", () =>
    assert.fail("Review must not request APIs/providers"),
  );
  const f = runtime(true);
  assert.equal(f.value.loading, false);
  assert.equal(await f.value.refresh(), null);
  assert.equal(f.loads.length, 0);
  assert.equal(f.events.length, 0);
  assert.equal(f.timers.length, 0);
  assert.equal(f.value.play, null);
});

test("ordinary gameplay keeps its default authorized load, focus refresh and unresolved-turn observation", async () => {
  const f = runtime(undefined);
  assert.equal(f.value.loading, true);
  assert.deepEqual(f.loads, [f.campaignId]);
  assert.deepEqual(
    f.events.map((e) => e.name),
    ["rpg-gameplay-changed", "focus"],
  );
  assert.equal(f.timers[0].interval, 2500);
  await f.events.find((e) => e.name === "focus").callback();
  assert.deepEqual(f.loads, [f.campaignId, f.campaignId]);
  f.cleanups.forEach((fn) => fn());
});

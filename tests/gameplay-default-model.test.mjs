import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { applicationGameplayTaskSelection, applicationModelSelection, DEFAULT_GAMEPLAY_MODEL } from "../src/lib/model-runtime/defaults.ts";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";
import { providerSettings } from "../src/lib/production/configuration.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { narrationSource } from "../src/lib/gameplay/turn-engine.ts";
import { resolveMechanics, validatePlan } from "../src/lib/gameplay/mechanics/resolve.ts";
import { fixture as worldLogicFixture } from "./wave3-logic-fixtures.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const { createDmProvider } = await import("../src/lib/server/dm/index.ts");
const { persistentProfileResolver } = await import("../src/lib/production/profiles.ts");
hook.deregister();

function environment(t) {
  const names = ["OPENAI_API_KEY", "OPENAI_DM_MODEL", "OPENAI_DM_REASONING"];
  const before = names.map((key) => process.env[key]);
  t.after(() => names.forEach((key, i) => before[i] === undefined
    ? delete process.env[key] : (process.env[key] = before[i])));
  process.env.OPENAI_API_KEY = "SYNTHETIC_ONLY";
  delete process.env.OPENAI_DM_MODEL;
  delete process.env.OPENAI_DM_REASONING;
}
const selected = (modelId, reasoning) => ({ providerId: "openai", modelId, reasoning });
const resolve = (campaignPolicy = null, task = "dm.plan", globalDefault = applicationModelSelection({})) =>
  resolveExecutionProfile({ task, profileId: randomUUID(), campaignPolicy, globalDefault });

test("new/inherited application defaults are Astra/high, with credentials still required", () => {
  assert.deepEqual(applicationModelSelection({}), DEFAULT_GAMEPLAY_MODEL);
  assert.equal(resolve().modelId, "gpt-6-astra");
  assert.equal(resolve().reasoning, "high");
  assert.equal(providerSettings({}).globalDefaultStatus, "unavailable");
  const settings = providerSettings({ OPENAI_API_KEY: "SYNTHETIC_ONLY" });
  assert.equal(settings.globalDefaultStatus, "configured_not_tested");
  assert.deepEqual(settings.globalDefault, DEFAULT_GAMEPLAY_MODEL);
  assert.ok(!JSON.stringify(settings).includes("SYNTHETIC_ONLY"));
});

test("the Game resolver inherits Astra/medium while narration and explicit policy retain their selections", () => {
  const globalDefault = applicationModelSelection({});
  const taskDefault = (task) => applicationGameplayTaskSelection(task, globalDefault);
  assert.deepEqual(taskDefault("world.resolve"), selected("gpt-6-astra", "medium"));
  assert.deepEqual(taskDefault("dm.narrate"), selected("gpt-6-astra", "high"));
  assert.equal(resolve(null, "world.resolve", taskDefault("world.resolve")).reasoning, "medium");
  assert.equal(resolve(null, "dm.narrate", taskDefault("dm.narrate")).reasoning, "high");
  const primary = { schemaVersion: 1, revision: 4, primary: selected("gpt-6-astra", "high"), taskOverrides: {} };
  assert.equal(resolve(primary, "world.resolve", taskDefault("world.resolve")).reasoning, "high");
  const override = { ...primary, taskOverrides: { "world.resolve": selected("gpt-6-astra", "low") } };
  assert.equal(resolve(override, "world.resolve", taskDefault("world.resolve")).reasoning, "low");
  const otherGlobal = selected("gpt-6-sol", "high");
  assert.deepEqual(applicationGameplayTaskSelection("world.resolve", otherGlobal), otherGlobal);
  const ownerEnvironment = selected("gpt-6-astra", "xhigh");
  assert.deepEqual(applicationGameplayTaskSelection("world.resolve", ownerEnvironment), selected("gpt-6-astra", "medium"));
  assert.deepEqual(applicationGameplayTaskSelection("dm.narrate", ownerEnvironment), selected("gpt-6-astra", "high"));
  assert.equal(resolve(primary, "world.resolve", applicationGameplayTaskSelection("world.resolve", ownerEnvironment)).reasoning, "high");
});

test("explicit primary, overrides and historical null-reasoning policies keep their meaning", () => {
  const policy = { schemaVersion: 1, revision: 7, primary: selected("gpt-6-sol", "high"),
    taskOverrides: { "dm.narrate": selected("gpt-5.4", "low") } };
  const before = structuredClone(policy);
  assert.equal(resolve(policy).modelId, "gpt-6-sol");
  assert.equal(resolve(policy, "dm.narrate").reasoning, "low");
  assert.equal(resolve({ ...policy, primary: selected("gpt-6-astra", null) }).reasoning, "xhigh");
  assert.deepEqual(policy, before);
  assert.equal(resolve(null, "dm.plan", applicationModelSelection({ OPENAI_DM_MODEL: "gpt-5.4" })).reasoning, "none");
});

test("already-pinned profiles replay without reading or rewriting campaign policy", async () => {
  const pinned = { "dm.plan": resolve(null, "dm.plan", selected("gpt-5.4", "high")) };
  const before = structuredClone(pinned);
  let reads = 0;
  const resolver = persistentProfileResolver(randomUUID(), randomUUID(), {},
    async () => { throw new Error("must not reread basis"); },
    async (args) => { reads++; assert.equal(args.p_profiles, null); return { data: pinned }; },
    applicationModelSelection({}));
  assert.deepEqual(await resolver(randomUUID(), ["dm.plan"]), pinned);
  assert.equal(reads, 1);
  assert.deepEqual(pinned, before);
});

test("a new World Logic Game operation pins resolver medium and narrator high once", async () => {
  const input = worldLogicFixture();
  let pinned = null;
  const profiles = async (args) => {
    if (args.p_profiles) pinned = structuredClone(args.p_profiles);
    return { data: pinned ?? {} };
  };
  const resolver = persistentProfileResolver(
    input.snapshot.ownerId,
    input.snapshot.campaignId,
    input.snapshot.timeline,
    async () => ({ data: input.snapshot }),
    profiles,
    applicationModelSelection({
      OPENAI_DM_MODEL: "gpt-6-astra",
      OPENAI_DM_REASONING: "xhigh",
    }),
  );
  const tasks = ["world.resolve", "dm.narrate"];
  const first = await resolver(input.command.operationId, tasks);
  assert.equal(first["world.resolve"].reasoning, "medium");
  assert.equal(first["dm.narrate"].reasoning, "high");
  assert.deepEqual(await resolver(input.command.operationId, tasks), first);
});

test("invalid explicit environment or campaign selection fails closed without fallback", () => {
  for (const env of [
    { OPENAI_DM_MODEL: "unknown" }, { OPENAI_DM_MODEL: "" },
    { OPENAI_DM_REASONING: "none" }, { OPENAI_DM_REASONING: "" },
    { OPENAI_DM_MODEL: "gpt-6-sol" },
  ]) {
    assert.throws(() => resolve(null, "dm.plan", applicationModelSelection(env)), { code: "configuration" });
    assert.equal(providerSettings({ ...env, OPENAI_API_KEY: "SYNTHETIC_ONLY" }).globalDefault, null);
  }
  assert.throws(() => resolve({ schemaVersion: 1, revision: 1,
    primary: selected("unknown", "high"), taskOverrides: {} }), { code: "configuration" });
});

test("actual default production plan/validation/resolution/bridge/narration uses Astra/high/Standard offline", async (t) => {
  environment(t);
  const { source, input, plan } = runtimeFixture();
  const before = structuredClone(source);
  const bodies = [];
  const provider = createDmProvider({ observer: () => {}, fetcher: async (_url, init) => {
    const body = JSON.parse(init.body);
    bodies.push(body);
    const result = body.text.format.name === "dm_plan" ? plan
      : { narration: "The bell rings above the tower.", visualDescription: "", clarification: null };
    return new Response(JSON.stringify({ model: "gpt-6-astra", status: "completed",
      output: [{ type: "message", role: "assistant", status: "completed",
        content: [{ type: "output_text", text: JSON.stringify(result) }] }],
      usage: { input_tokens: 12, output_tokens: 8 } }));
  } });
  const proposed = (await provider.plan(source, input)).output;
  validatePlan(source, input, proposed);
  const resolution = resolveMechanics(source, input, proposed, []);
  const publicSource = narrationSource(source, input, proposed);
  const result = await provider.narrate(publicSource, input, resolution, []);
  assert.equal(result.output.narration, "The bell rings above the tower.");
  assert.equal(bodies.length, 2);
  for (const body of bodies) {
    assert.equal(body.model, "gpt-6-astra");
    assert.deepEqual(body.reasoning, { effort: "high" });
    assert.equal(body.service_tier, "default");
    assert.equal(body.max_output_tokens, 4096);
    assert.equal(body.text.format.strict, true);
  }
  assert.deepEqual(source, before);
  assert.deepEqual(resolution.changes, []);
});

// One-shot synthetic narration comparison. Dry-run unless explicitly authorized.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { livingSmokeProductionInput } from "../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { SMOKE_ACTOR_IDS, SMOKE_LOCATION_IDS, smokeUuid } from "../test-fixtures/mega-dm/living-smoke-source-v1.mjs";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { narrationSource } from "../src/lib/gameplay/turn-engine.ts";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { openAiProvider } = await import("../src/lib/server/dm/provider.ts");
hook.deregister();

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const outcome = (text, entityIds = [], itemIds = []) => ({ kind: "observation", entityIds, itemIds, text });

function scene(index, probeId, playerInput, planIntent, results, customize = () => {}) {
  const { source, input, probe } = livingSmokeProductionInput({ probeId, arm: "full" });
  input.operationId = smokeUuid(1100 + index);
  input.input = playerInput;
  source.craft.operationId = input.operationId;
  customize(source, input);
  const plan = {
    narration: planIntent,
    checks: [],
    publicPatches: [],
    privatePatches: [],
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
  };
  const resolution = {
    changes: results.changes ?? [],
    worldMinutes: source.runtime.worldMinutes + (results.minutes ?? 0),
    configuration: source.runtime.configuration,
    outcomes: results.outcomes,
  };
  const narration = narrationSource(source, input, plan);
  const built = buildContext(narration, input, "narrate", {
    model: "gpt-6-astra", resolution, checks: [],
  });
  assert.equal(JSON.parse(built.input).mandatory.input, playerInput);
  assert.ok(JSON.parse(built.input).dmCraft);
  assert.ok(JSON.parse(built.input).memory);
  assert.ok(JSON.parse(built.input).mandatory.narrationBridge.characters.length);
  return { id: index, probeId, probeCriterion: probe.criterion, source: narration,
    input, resolution, checks: [], contextHash: hash(built), estimatedTokens: built.estimatedTokens };
}

const cases = [
  scene(1, "repair-history-joy",
    "Orin, after the flood work, how are you and Liora getting along tonight?",
    "Let the two river-crew voices differ; leave their unresolved patrol dispute intact.",
    { outcomes: [outcome("Orin answers in the Lantern Room; Liora is present and can respond. Their patrol disagreement has not been resolved by this exchange.", [SMOKE_ACTOR_IDS.orin, SMOKE_ACTOR_IDS.liora])] }),
  scene(2, "repair-history-joy",
    "Any rumors about the Lantern Room since the flood? What do locals say?",
    "Offer ordinary attributed local gossip; do not turn the gossip into fact.",
    { outcomes: [outcome("The Lantern Room is an established public room; no specific new rumor has been verified.")] },
    (source) => { source.worldLogicMundaneDetail = { targetKind: "location", targetId: SMOKE_LOCATION_IDS["Lantern Room"], name: "Lantern Room", epistemic: "reported" }; }),
  scene(3, "cognitive-world-fingerprint",
    "I study the damaged bridge from the near bank. What can I actually see?",
    "Make the public scene atmospheric without solving the unknown cause of the damage.",
    { outcomes: [outcome("From the near bank, Talin can see a warped handrail, fresh silt around two supports and an intact warning bell. The cause of the damage is not established.", [SMOKE_ACTOR_IDS.talin])] }),
  scene(4, "identity-knowledge-refusal",
    "I balance a spare wooden washer on my nose and bow to Bram like a court magician.",
    "Bram may react in character; the comic gesture makes no item transfer or spell.",
    { outcomes: [outcome("Talin performs the harmless gesture in the workshop. Bram sees it; nothing mechanical changes.", [SMOKE_ACTOR_IDS.talin, SMOKE_ACTOR_IDS.bram])] }),
  scene(5, "identity-knowledge-refusal",
    "Bram, people are waiting. Will you launch the repaired skiff before inspection? Orin, do you know why Liora fears the crossing?",
    "Bram refuses the unsafe launch; Orin does not know Liora's unwitnessed reason.",
    { outcomes: [outcome("Bram refuses to launch before inspection; the skiff remains moored. Orin has no firsthand knowledge of Liora's private reason for fearing the crossing.", [SMOKE_ACTOR_IDS.bram, SMOKE_ACTOR_IDS.orin])] }),
  scene(6, "cognitive-world-fingerprint",
    "I step onto the damaged bridge and try to cross now.",
    "Respect the blocked crossing; leave the player free to choose another action.",
    { outcomes: [outcome("The crossing is blocked at the near bank. Talin does not cross; the attempt causes no injury, item use or time advance.", [SMOKE_ACTOR_IDS.talin])] }),
  scene(7, "cognitive-world-fingerprint",
    "I grab the falling rail to shield Sava from the collapse.",
    "The intervention succeeds but Talin takes exactly the validated damage; do not add other costs.",
    { minutes: 2, changes: [{ family: "entities", id: SMOKE_ACTOR_IDS.talin, expectedRevision: 1, values: { hp: 6 } }],
      outcomes: [outcome("Talin pulls Sava clear of the falling rail. Talin's HP falls from 8 to 6. Sava is unharmed. The rail remains broken; no item is gained or spent.", [SMOKE_ACTOR_IDS.talin, SMOKE_ACTOR_IDS.sava])] }),
  scene(8, "cognitive-world-fingerprint",
    "I use my established Star-Crown geomancy to lift the fallen stone viaduct into a broad causeway above the flood gorge, giving the caravan a way toward the ridge citadel.",
    "Honor the validated large-scale feat; show how this capability opens a genuinely new route without choosing the player's next move.",
    { minutes: 5, outcomes: [outcome("Talin raises the fallen viaduct into a stable broad causeway above the flood gorge. The caravan now has a possible route toward the ridge citadel, but has not yet crossed. No enemy is defeated and no item or resource changes.", [SMOKE_ACTOR_IDS.talin])] },
    (source) => {
      source.snapshot.entities[0].details = "Established archmage, bearer of the Star-Crown. Can reshape existing stone at viaduct scale; cannot create new stone, control minds, or command the caravan.";
      source.snapshot.documents.push({ ...source.snapshot.documents[0], id: smokeUuid(1308), title: "Star-Crown public canon", status: "canon", current_version_id: smokeUuid(1309),
        body: "Talin's Star-Crown geomancy can lift and bind existing stone structures at the scale of a viaduct. The damaged viaduct at the flood gorge contains enough intact stone. The ability does not control other people or make them travel. No charge or material cost applies to this use." });
      source.snapshot.locations.push({ ...source.snapshot.locations[0], id: smokeUuid(1310), name: "Flood Gorge", description: "A broken stone viaduct spans the flooded gorge below the ridge citadel. The caravan waits on the near side.", status: "known" });
      source.snapshot.publicState.current_location_id = smokeUuid(1310);
      source.snapshot.publicState.summary = "Talin and a waiting caravan stand at the flood gorge beneath the ridge citadel. Talin's viaduct-scale Star-Crown geomancy is established public canon.";
      source.adventureContext = { title: "Road to the Ridge Citadel", scope: "Open-ended", publicSituation: "The caravan waits for a viable crossing; its members choose for themselves whether to use one." };
    }),
];

assert.equal(cases.length, 8);
const frozen = cases.map(({ id, contextHash, estimatedTokens }) => ({ id, contextHash, estimatedTokens }));
if (!process.argv.includes("--live")) {
  process.stdout.write(JSON.stringify({ mode: "dry-run", frozen }, null, 2) + "\n");
  process.exit(0);
}
assert.equal(process.env.RPG_NARRATION_BENCHMARK, "approved-16-calls");
assert.ok(process.env.OPENAI_API_KEY);
const directory = new URL("../test-results/narration-latency/", import.meta.url);
await mkdir(directory, { recursive: true });
const outputPath = new URL(`benchmark-${new Date().toISOString().replaceAll(":", "-")}.json`, directory);
const report = { base: "f45d2d8c7ddc490884dd57b11a96e48f7cda82dd", frozen, calls: [] };
let networkCalls = 0;
for (const item of cases) {
  for (const reasoning of ["xhigh", "high"]) {
    const attempts = [];
    let requestHash = null;
    let output = null;
    let usage = null;
    let error = null;
    const provider = openAiProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-6-astra",
      reasoning,
      observer: (attempt) => attempts.push(attempt),
      fetcher: async (url, init) => {
        assert.equal(url, "https://api.openai.com/v1/responses");
        assert.ok(networkCalls < 16);
        const body = JSON.parse(init.body);
        assert.equal(body.model, "gpt-6-astra");
        assert.equal(body.reasoning.effort, reasoning);
        assert.equal(body.text.format.name, "dm_narrate");
        assert.equal(body.service_tier, "default");
        assert.equal(body.store, false);
        requestHash = hash({ ...body, reasoning: null });
        networkCalls++;
        return fetch(url, init);
      },
    });
    try {
      const response = await provider.narrate(item.source, item.input, item.resolution, item.checks);
      output = response.output;
      usage = response.usage;
    } catch (cause) {
      error = cause?.code ?? cause?.name ?? "unknown";
    }
    report.calls.push({ case: item.id, reasoning, requestHash, error,
      attempt: attempts.at(-1) ?? null, usage, output });
    await writeFile(outputPath, JSON.stringify(report, null, 2));
    process.stdout.write(`case ${item.id} ${reasoning}: ${error ?? "parsed"} ${attempts.at(-1)?.latencyMs ?? "n/a"}ms ${usage?.inputTokens ?? "n/a"}/${usage?.outputTokens ?? "n/a"} tokens\n`);
  }
}
assert.equal(networkCalls, 16);
for (const item of cases) {
  const pair = report.calls.filter((row) => row.case === item.id);
  assert.equal(pair.length, 2);
  assert.ok(pair.every((row) => row.requestHash));
  assert.equal(pair[0].requestHash, pair[1].requestHash, `case ${item.id} request changed beyond reasoning`);
}
process.stdout.write(`Network calls: ${networkCalls}\nResult: ${outputPath.pathname}\n`);

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import frozenCognitive from "../test-fixtures/mega-dm/frozen-cognitive-craft-v2.json" with { type: "json" };
import { livingSmokePlan, livingSmokeRequest, livingSmokeProductionInput, livingSmokeNarrationRequest,
  LIVING_SMOKE_ARMS, LIVING_SMOKE_PROBES, LIVING_SMOKE_VERSION,
  LIVING_SMOKE_FIXTURE_DIGEST } from "../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { blindLivingSmokeArtifacts, companionSceneQualityArtifact,
  crowdedSceneQualityArtifact } from "../test-fixtures/mega-dm/living-review-v1.mjs";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { characterPacket } from "../src/lib/gameplay/character-model.ts";
import { SMOKE_ACTOR_IDS, SMOKE_LOCATION_IDS, LANTERN_ROOM_FOOD,
  smokeUuid, livingSmokeSource } from "../test-fixtures/mega-dm/living-smoke-source-v1.mjs";
import { fixture } from "./phase35-storage-fixture.mjs";
import { emptyPlan } from "./phase2-turn-store-fixture.mjs";

const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("corrected smoke fixture grounds each arm in the same structured current location and observable food", () => {
  assert.equal(LIVING_SMOKE_VERSION, "mega-dm-living-smoke-v4-structured-scene");
  assert.match(LIVING_SMOKE_FIXTURE_DIGEST, /^[a-f0-9]{64}$/);
  for (const probe of LIVING_SMOKE_PROBES) {
    const expected = SMOKE_LOCATION_IDS[probe.place];
    assert.ok(expected);
    const armContexts = LIVING_SMOKE_ARMS.map((arm) => {
      const { source } = livingSmokeProductionInput({ probeId: probe.id, arm });
      const context = JSON.parse(livingSmokeRequest({ probeId: probe.id, arm, model: "gpt-6-astra" }).context.input);
      assert.equal(source.snapshot.publicState.current_location_id, expected);
      assert.equal(context.mandatory.current.publicState.current_location_id, expected);
      assert.equal(context.mandatory.current.locations.find((row) => row.id === expected)?.name,
        probe.place === "bridge" ? "Damaged Bridge" : probe.place === "workshop" ? "Workshop" : "Lantern Room");
      assert.equal(context.mandatory.current.locations.filter((row) => row.id === expected).length, 1);
      if (probe.id === "identity-knowledge-refusal") {
        assert.equal(context.mandatory.current.locations.find((row) => row.id === expected)?.name, "Workshop");
        assert.notEqual(expected, SMOKE_LOCATION_IDS.bridge);
      }
      if (probe.id === "repair-history-joy") {
        assert.equal(source.snapshot.scenes.length, 1);
        assert.equal(source.snapshot.scenes[0].body, LANTERN_ROOM_FOOD);
        assert.equal(context.mandatory.current.publicState.current_scene_id, source.snapshot.scenes[0].id);
        assert.ok(context.originalScenes.some((row) => row.body === LANTERN_ROOM_FOOD));
        assert.equal(source.snapshot.items.length, 0);
      }
      return context;
    });
    for (const context of armContexts.slice(1)) {
      assert.deepEqual(context.mandatory.current, armContexts[0].mandatory.current);
      assert.deepEqual(context.originalScenes, armContexts[0].originalScenes);
    }
  }
  const changedProduction = execFileSync("git", ["diff", "--name-only",
    "33c6163110090ff69a2737a435666954bbf2bced", "--", "src", "supabase"],
  { encoding: "utf8" }).trim();
  assert.equal(changedProduction, "");
});

test("three dense probes prepare nine plan arms; B and C differ only by the real Character Packet", () => {
  const calls = livingSmokePlan("gpt-5.4");
  assert.equal(calls.length, 9);
  assert.deepEqual(LIVING_SMOKE_PROBES.map((probe) => probe.id), [
    "identity-knowledge-refusal", "repair-history-joy", "cognitive-world-fingerprint",
  ]);
  assert.deepEqual(livingSmokePlan("gpt-5.4"), calls); // no random fixture identities
  for (const probe of LIVING_SMOKE_PROBES) {
    const group = calls.filter((call) => call.base.probeId === probe.id);
    assert.deepEqual(group.map((call) => call.arm), LIVING_SMOKE_ARMS);
    assert.equal(new Set(group.map((call) => call.baseDigest)).size, 1);
    assert.equal(new Set(group.map((call) => call.outputSchemaDigest)).size, 1);
    assert.equal(group[0].craft.doctrine, "core-doctrine@1");
    assert.equal(group[1].craft.doctrine, "core-doctrine@2");
    assert.deepEqual(group[1].selectedCards, group[2].selectedCards);
    assert.ok(group.every((call) => call.selectedCards.length <= 2 && call.context.budget.model === "gpt-5.4"));
    const baselineInput = JSON.parse(group[0].context.input);
    const doctrineInput = JSON.parse(group[1].context.input);
    const fullInput = JSON.parse(group[2].context.input);
    assert.deepEqual(doctrineInput.mandatory.characterPacket, []);
    assert.deepEqual(fullInput.mandatory.characterPacket, group[2].characterPacket);
    assert.equal(group[2].characterPacketDigest, digest(group[2].characterPacket));
    assert.ok(group[2].characterPacket.length > 0 && group[2].characterPacket.length <= 2);
    fullInput.mandatory.characterPacket = [];
    assert.deepEqual(fullInput, doctrineInput);
    delete baselineInput.dmCraft;
    const withoutNewCraft = structuredClone(doctrineInput);
    delete withoutNewCraft.dmCraft;
    assert.deepEqual(baselineInput, withoutNewCraft);
    assert.equal(group[0].context.instructions, group[1].context.instructions);
    assert.equal(group[1].context.instructions, group[2].context.instructions);
    const { source, input } = livingSmokeProductionInput({ probeId: probe.id, arm: "full" });
    assert.deepEqual(group[2].characterPacket, characterPacket(source, input, "plan"));
    assert.deepEqual(group[2].context, buildContext(source, input, "plan", { model: "gpt-5.4" }));
    for (const row of group[2].characterPacket) for (const entry of [...row.beliefs, ...row.relationships, ...row.episodes]) {
      const ref = entry.evidence;
      assert.ok([...source.memory.historical, ...source.memory.privateHistorical].some((memory) =>
        memory.ref.id === ref.id && memory.ref.version === ref.version && memory.ref.visibility === ref.visibility && memory.knownBy.includes(row.actorId)));
    }
  }
  assert.deepEqual(livingSmokeRequest({ probeId: LIVING_SMOKE_PROBES[0].id, arm: "full", model: "gpt-5.4" }), calls[2]);
  assert.throws(() => livingSmokeRequest({ probeId: "unfrozen", arm: "full", model: "gpt-5.4" }));
  assert.throws(() => livingSmokeRequest({ probeId: LIVING_SMOKE_PROBES[0].id, arm: "full", model: "unknown-model" }));
});

test("private DM can see the synthetic secret while Orin's positive knowledge and Character Packet cannot", () => {
  const call = livingSmokeRequest({ probeId: "identity-knowledge-refusal", arm: "full", model: "gpt-5.4" });
  const context = JSON.parse(call.context.input);
  assert.ok(context.memory.privateContinuity.history.some((row) => row.ref.id === smokeUuid(118)));
  const orin = call.characterPacket.find((row) => row.actorId === SMOKE_ACTOR_IDS.orin);
  assert.ok(orin);
  assert.equal(JSON.stringify(orin).includes(smokeUuid(118)), false);
  assert.equal(context.mandatory.privateState.npc && Object.keys(context.mandatory.privateState.npc).length, 0);
});

test("dependent narrator request validates the frozen plan and resolves without mutation", () => {
  const planOutput = { ...emptyPlan(), narration: "Bram refuses to launch without inspection." };
  const groups = LIVING_SMOKE_ARMS.map((arm) => livingSmokeNarrationRequest({
    probeId: "identity-knowledge-refusal", arm, model: "gpt-5.4", planOutput }));
  assert.ok(groups.every((row) => row.stage === "narrate" && row.persistentMutations === 0));
  assert.ok(groups.every((row) => row.planDigest === digest(planOutput) && row.resolution.changes.length === 0));
  const baseline = JSON.parse(groups[0].context.input);
  const doctrine = JSON.parse(groups[1].context.input);
  const full = JSON.parse(groups[2].context.input);
  assert.equal(full.mandatory.narrationBridge.planIntent, planOutput.narration);
  assert.ok(full.mandatory.narrationBridge.characters.length > 0);
  assert.deepEqual(doctrine.mandatory.narrationBridge.characters, []);
  full.mandatory.narrationBridge.characters = [];
  full.mandatory.characterVoices = [];
  assert.deepEqual(full, doctrine);
  delete baseline.dmCraft;
  delete doctrine.dmCraft;
  assert.deepEqual(baseline, doctrine);
  assert.throws(() => livingSmokeNarrationRequest({ probeId: "identity-knowledge-refusal", arm: "full",
    model: "gpt-5.4", planOutput: { ...planOutput, guidanceProposal: "unsupported" } }));
});

test("new immutable Cognitive Craft snapshot matches the additive disposable SQL seed", async () => {
  const f = await fixture();
  try {
    const view = (await f.one("select public.rpg_dm_craft($1,'read','{}'::jsonb) result", [f.owner])).result;
    const keys = new Set(frozenCognitive.versions.map((entry) => `${entry.key}:${entry.version}`));
    const actual = view.versions.filter((entry) => keys.has(`${entry.key}:${entry.version}`))
      .map(({ key, version, kind, category, stages, triggers, en, ru, provenance }) =>
        ({ key, version, kind, category, stages, triggers, en, ru, provenance }))
      .sort((a, b) => a.key.localeCompare(b.key));
    assert.deepEqual(actual, frozenCognitive.versions);
  } finally { await f.db.close(); }
});

test("companion-only and two-actor packet limits remain testable context heuristics", () => {
  const probe = { ordinal: 99, historyThrough: "lc48", place: "Lantern Room",
    present: companionSceneQualityArtifact.presentActors,
    playerInput: "Liora, how did Bram and Sava take Orin's apology?" };
  const { source, input } = livingSmokeSource(probe, true);
  input.mode = "companion";
  input.companionId = SMOKE_ACTOR_IDS.liora;
  assert.deepEqual(characterPacket(source, input, "plan").map((row) => row.actorId), [SMOKE_ACTOR_IDS.liora]);
  input.mode = "game";
  input.companionId = null;
  assert.equal(characterPacket(source, input, "plan").length, crowdedSceneQualityArtifact.currentPacketCap);
  assert.match(companionSceneQualityArtifact.currentPacketPolicy, /heuristic/);
  assert.equal(companionSceneQualityArtifact.broaderContextOutput, null);
});

test("offline preparation emits anonymous review and separate reveal key with no network path", async () => {
  const script = await readFile(new URL("../scripts/mega-dm/prepare-living-smoke.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(script, /fetch\(|https?:\/\/|OPENAI_API_KEY|createStructuredRequester|import\(.*adapter/);
  assert.match(script, /networkAttempts: 0/);
  const folder = await mkdtemp(join(tmpdir(), "mega-dm-smoke-"));
  assert.ok(resolve(folder).startsWith(resolve(tmpdir()) + sep));
  try {
    const output = join(folder, "calls.json"), reviewOutput = join(folder, "blind.json"), revealOutput = join(folder, "reveal.json");
    const run = spawnSync(process.execPath, ["scripts/mega-dm/prepare-living-smoke.mjs", "--model", "gpt-5.4",
      "--output", output, "--review-output", reviewOutput, "--reveal-output", revealOutput],
    { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const calls = JSON.parse(await readFile(output, "utf8"));
    const blind = JSON.parse(await readFile(reviewOutput, "utf8"));
    const reveal = JSON.parse(await readFile(revealOutput, "utf8"));
    assert.equal(calls.networkAttempts, 0);
    assert.equal(calls.calls.length, 9);
    assert.equal(calls.dependentNarrationSlots.length, 9);
    assert.equal(calls.maxFutureProviderCalls, 18);
    assert.deepEqual(blind, blindLivingSmokeArtifacts().review);
    assert.deepEqual(reveal, blindLivingSmokeArtifacts().reveal);
    assert.doesNotMatch(JSON.stringify(blind), /"arm"|"baseline"|"doctrine"|"full"/);
    assert.deepEqual(blind.cases[0].responses.map((row) => row.label), ["X", "Y", "Z"]);
    assert.notDeepEqual(reveal.cases[0].labels, reveal.cases[1].labels);
    assert.ok(blind.dimensions.includes("desire to keep playing"));
    assert.equal(blind.cases[0].responses[0].finalNarration, null);
    assert.ok(reveal.cases[0].planDiagnostics);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

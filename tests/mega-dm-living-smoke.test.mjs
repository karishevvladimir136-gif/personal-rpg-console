import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import frozenCognitive from "../test-fixtures/mega-dm/frozen-cognitive-craft-v2.json" with { type: "json" };
import { livingSmokePlan, livingSmokeRequest, livingSmokeProductionInput,
  LIVING_SMOKE_ARMS, LIVING_SMOKE_PROBES } from "../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { blindLivingSmokeArtifacts, companionSceneQualityArtifact,
  crowdedSceneQualityArtifact } from "../test-fixtures/mega-dm/living-review-v1.mjs";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { characterPacket } from "../src/lib/gameplay/character-model.ts";
import { SMOKE_ACTOR_IDS, smokeUuid, livingSmokeSource } from "../test-fixtures/mega-dm/living-smoke-source-v1.mjs";
import { fixture } from "./phase35-storage-fixture.mjs";

const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("five frozen probes prepare fifteen production-context arms; B and C differ only by the real Character Packet", () => {
  const calls = livingSmokePlan("gpt-5.4");
  assert.equal(calls.length, 15);
  assert.deepEqual(LIVING_SMOKE_PROBES.map((probe) => probe.id), [
    "identity-under-pressure", "impossible-knowledge", "repair-with-history",
    "cognitive-world-fingerprint", "shared-joy-after-intensity",
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
  const call = livingSmokeRequest({ probeId: "impossible-knowledge", arm: "full", model: "gpt-5.4" });
  const context = JSON.parse(call.context.input);
  assert.ok(context.memory.privateContinuity.history.some((row) => row.ref.id === smokeUuid(118)));
  const orin = call.characterPacket.find((row) => row.actorId === SMOKE_ACTOR_IDS.orin);
  assert.ok(orin);
  assert.equal(JSON.stringify(orin).includes(smokeUuid(118)), false);
  assert.equal(context.mandatory.privateState.npc && Object.keys(context.mandatory.privateState.npc).length, 0);
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
    assert.equal(calls.calls.length, 15);
    assert.deepEqual(blind, blindLivingSmokeArtifacts().review);
    assert.deepEqual(reveal, blindLivingSmokeArtifacts().reveal);
    assert.doesNotMatch(JSON.stringify(blind), /"arm"|"baseline"|"doctrine"|"full"/);
    assert.deepEqual(blind.cases[0].responses.map((row) => row.label), ["X", "Y", "Z"]);
    assert.notDeepEqual(reveal.cases[0].labels, reveal.cases[1].labels);
    assert.ok(blind.dimensions.includes("desire to keep playing"));
    assert.equal(blind.cases[0].responses[0].originalOutput, null);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { livingSmokePlan, livingSmokeRequest, LIVING_SMOKE_ARMS, LIVING_SMOKE_PROBES } from "../test-fixtures/mega-dm/living-smoke-v1.mjs";

test("future smoke pack is frozen 5 probes x 3 arms with identical base and exact Character Packet provenance", () => {
  const calls = livingSmokePlan("future-explicit-model");
  assert.equal(calls.length, 15);
  for (const probeId of LIVING_SMOKE_PROBES) {
    const group = calls.filter((call) => call.base.probeId === probeId);
    assert.deepEqual(group.map((call) => call.arm), LIVING_SMOKE_ARMS);
    assert.equal(new Set(group.map((call) => call.baseDigest)).size, 1);
    assert.equal(group[0].craft.doctrine, "core-doctrine@1");
    assert.equal(group[1].craft.doctrine, "core-doctrine@2");
    assert.ok(group.every((call) => call.selectedCards.length <= 2 && call.selectedCards.every((key) => call.craft.availableCards.includes(key))));
    assert.deepEqual(group[1].selectedCards, group[2].selectedCards);
    assert.equal(group[1].characterPacket, null);
    assert.ok(group[2].characterPacketDigest);
    assert.ok(group[2].characterPacket.knownEpisodeIds.length > 0);
  }
  assert.deepEqual(livingSmokeRequest({ probeId: LIVING_SMOKE_PROBES[0], arm: "full", model: "future-explicit-model" }), calls[2]);
  assert.throws(() => livingSmokeRequest({ probeId: "unfrozen", arm: "full", model: "x" }));
});

test("preparation harness contains no network requester and demands separate live authorization", async () => {
  const script = await readFile(new URL("../scripts/mega-dm/prepare-living-smoke.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(script, /fetch\(|https?:\/\/|OPENAI_API_KEY|replayScene|import\(.*adapter/);
  assert.match(script, /networkAttempts: 0/);
  assert.match(script, /ownerLiveAuthorization/);
});

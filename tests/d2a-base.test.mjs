import test from "node:test";
import assert from "node:assert/strict";
import { d2aFixture } from "./d2a-sql-fixture.mjs";
import { readDetachedState } from "../src/lib/saves/detached-reader.ts";
import { canonicalLabJson } from "../src/lib/world-lab/inputs.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { resolveExecutionProfile, runtimeTasks } from "../src/lib/model-runtime/registry.ts";
import { randomUUID } from "node:crypto";

test("D2A composition reads an exact saved basis without creating a run or changing live state", async () => {
  const f = await d2aFixture();
  try {
    const before = await f.active();
    const raw = (await f.one("select rpg_private.lab_composition_base($1,$2,$3) result", [f.owner, f.cid, f.save.id])).result;
    const state = readDetachedState(raw.state, {ownerId: f.owner, campaignId: f.cid});
    assert.equal(state.run, null);
    assert.equal(state.manifest.id, (await f.one("select manifest_id from rpg_private.save_points where id=$1", [f.save.id])).manifest_id);
    assert.deepEqual(raw.sourceHeads, []);
    assert.deepEqual(raw.state.libraryRecords, []);
    assert.equal(raw.basisDigest, sha256(canonicalLabJson({
      ownerId: f.owner, campaignId: f.cid, saveId: f.save.id,
      manifestId: state.manifest.id, canonGeneration: state.canonGeneration,
      sourceHeads: raw.sourceHeads, documents: raw.documents,
    })));
    assert.deepEqual(await f.active(), before);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.world_lab_runs")).n, 0);
    await assert.rejects(f.one("select rpg_private.lab_composition_base($1,$2,$3) result", [f.owner, randomUUID(), f.save.id]));
  } finally { await f.db.close(); }
});

test("D2A world.compose has its own bounded runtime task and cannot fallback from an invalid choice", () => {
  assert.deepEqual(runtimeTasks["world.compose"], {contractVersion: "world-compose-v1", boundary: "job"});
  const profile = resolveExecutionProfile({task: "world.compose", profileId: randomUUID(), globalDefault: {providerId: "openai", modelId: "gpt-6-astra", reasoning: "max"}});
  assert.equal(profile.task, "world.compose");
  assert.equal(profile.modelId, "gpt-6-astra");
  assert.throws(() => resolveExecutionProfile({task: "world.compose", profileId: randomUUID(), globalDefault: {providerId: "openai", modelId: "gpt-6-astra", reasoning: "max"}, campaignPolicy: {schemaVersion:1, revision:1, primary:{providerId:"other",modelId:"invalid",reasoning:null},taskOverrides:{}}}));
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { livingSmokeProductionInput, livingSmokeRequest, livingSmokeNarrationRequest,
  LIVING_SMOKE_VERSION, LIVING_SMOKE_FIXTURE_DIGEST, LIVING_SMOKE_PROBES,
  COMPLETION_GROUNDING } from "../test-fixtures/mega-dm/living-smoke-completion-v5.mjs";
import { livingSmokeProductionInput as v4Input, livingSmokeRequest as v4Request,
  LIVING_SMOKE_FIXTURE_DIGEST as v4Digest } from "../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { smokeUuid, SMOKE_ACTOR_IDS } from "../test-fixtures/mega-dm/living-smoke-source-v1.mjs";
import { emptyPlan } from "./phase2-turn-store-fixture.mjs";

globalThis.fetch = () => { throw new Error("Fixture regression tests prohibit network access"); };
const args = (probeId, model = "gpt-6-sol") => ({ probeId, model, arm: "full" });

test("v5 adds only one bounded exact grounding record; old history, models, player intent and Craft are unchanged", () => {
  assert.equal(LIVING_SMOKE_VERSION, "mega-dm-model-bakeoff-v5-self-contained");
  assert.match(LIVING_SMOKE_FIXTURE_DIGEST, /^[a-f0-9]{64}$/);
  assert.notEqual(LIVING_SMOKE_FIXTURE_DIGEST, v4Digest);
  assert.equal(LIVING_SMOKE_PROBES.length, 2);
  for (const probe of LIVING_SMOKE_PROBES) {
    const before = v4Input(args(probe.id)), after = livingSmokeProductionInput(args(probe.id));
    assert.equal(after.source.memory.exactEvents.length, before.source.memory.exactEvents.length + 1);
    const record = after.source.memory.exactEvents.pop();
    assert.equal(record.authority, "state");
    assert.equal(record.current, true);
    assert.equal(record.status, "valid");
    assert.deepEqual(after.source, before.source);
    assert.deepEqual(after.history, before.history);
    assert.deepEqual(after.input, before.input);
    assert.deepEqual(after.probe, before.probe);
    assert.deepEqual(after.sources.slice(0, -1), before.sources);
  }
});

test("identity request supplies an explicit private-conversation status without granting Orin the unwitnessed disclosure", () => {
  const input = livingSmokeProductionInput(args("identity-knowledge-refusal"));
  const record = input.source.memory.exactEvents.at(-1);
  const grounding = JSON.parse(record.text);
  assert.equal(grounding.throughHistoryCheckpoint, "lc42");
  assert.equal(grounding.privateConversation.occurred, false);
  assert.deepEqual(grounding.privateConversation.participants, [SMOKE_ACTOR_IDS.liora, SMOKE_ACTOR_IDS.orin]);
  assert.ok(record.knownBy.includes(SMOKE_ACTOR_IDS.orin));
  assert.equal(record.statementKind, "fact");
  const secret = input.source.memory.privateHistorical.find((row) => row.ref.id === smokeUuid(118));
  assert.ok(secret);
  assert.equal(secret.knownBy.includes(SMOKE_ACTOR_IDS.orin), false);
  const request = livingSmokeRequest(args("identity-knowledge-refusal"));
  const payload = JSON.parse(request.context.input);
  assert.deepEqual(JSON.parse(payload.memory.exactEvents.at(-1).text), grounding);
  const orin = request.characterPacket.find((row) => row.actorId === SMOKE_ACTOR_IDS.orin);
  assert.equal(JSON.stringify(orin).includes(smokeUuid(118)), false);
  assert.equal(JSON.stringify(payload.memory.history).includes("losing a passenger more"), false);
});

test("cognitive request supplies proposed wording and placement before planning, never a completed warning", () => {
  const { source } = livingSmokeProductionInput(args("cognitive-world-fingerprint"));
  const record = source.memory.exactEvents.at(-1);
  const proposal = JSON.parse(record.text).warningProposal;
  assert.equal(proposal.authorActorId, SMOKE_ACTOR_IDS.talin);
  assert.equal(proposal.locationId, source.snapshot.publicState.current_location_id);
  assert.equal(proposal.wording, "Damaged crossing — proceed with caution.");
  assert.match(proposal.placement, /eastern bridge approach/);
  assert.equal(proposal.status, "proposed");
  assert.equal(proposal.placed, false);
  assert.equal(record.statementKind, "intention");
  assert.ok(record.knownBy.includes(SMOKE_ACTOR_IDS.orin));
  assert.ok(record.knownBy.includes(SMOKE_ACTOR_IDS.sava));
  const payload = JSON.parse(livingSmokeRequest(args("cognitive-world-fingerprint")).context.input);
  assert.deepEqual(JSON.parse(payload.memory.exactEvents.at(-1).text).warningProposal, proposal);
  assert.equal(source.snapshot.items.length, 0);
});

test("both models receive byte-identical full treatment and corrected facts through the production context", () => {
  for (const probe of LIVING_SMOKE_PROBES) {
    const sol = livingSmokeRequest(args(probe.id)), astra = livingSmokeRequest(args(probe.id, "gpt-6-astra"));
    assert.equal(sol.context.instructions, astra.context.instructions);
    assert.equal(sol.context.input, astra.context.input);
    assert.deepEqual(sol.outputSchema, astra.outputSchema);
    assert.deepEqual(sol.characterPacket, astra.characterPacket);
    assert.deepEqual(sol.characterPacket, v4Request(args(probe.id)).characterPacket);
    assert.deepEqual(livingSmokeRequest(args(probe.id)), sol);
    assert.equal(sol.context.budget.outputReserve, 4096);
  }
});

test("production clarification gate stays closed and deterministic narration resolution stays disposable", () => {
  for (const probe of LIVING_SMOKE_PROBES) {
    const output = { ...emptyPlan(), narration: "The NPCs discuss the literal request." };
    const dependent = livingSmokeNarrationRequest({ ...args(probe.id), planOutput: output });
    assert.equal(dependent.persistentMutations, 0);
    assert.equal(dependent.resolution.changes.length, 0);
    const before = livingSmokeProductionInput(args(probe.id));
    assert.equal(dependent.resolution.worldMinutes, before.source.runtime.worldMinutes);
    assert.throws(() => livingSmokeNarrationRequest({ ...args(probe.id), planOutput: { ...output,
      clarification: "What fact is missing?" } }), /clarification/);
  }
});

test("new fixture rejects the completed repair probe and preserves frozen v4 and Mega DM semantics", () => {
  assert.throws(() => livingSmokeRequest(args("repair-history-joy")), /two corrected/);
  assert.equal(v4Digest, "84e5843f47f1ef99c368e30922ce01b3cc6a3af635ffb4693e8f542457a5d366");
  for (const path of ["test-fixtures/mega-dm/living-smoke-v1.mjs", "test-fixtures/mega-dm/living-smoke-source-v1.mjs",
    "test-fixtures/mega-dm/living-characters-v1.mjs", "test-fixtures/mega-dm/frozen-craft-v1.json",
    "test-fixtures/mega-dm/frozen-cognitive-craft-v2.json"]) {
    const expected = execFileSync("git", ["show", `b39c929df5e58faa42f0c2e149bf2d6d0a6a2744:${path}`], { encoding: "utf8" }).replace(/\r\n/g, "\n");
    assert.equal(readFileSync(path, "utf8").replace(/\r\n/g, "\n"), expected);
  }
  // Historical closure must preserve the evaluated gameplay/context/Craft
  // and preexisting SQL authority. Later authorized feature waves may extend
  // gameplay; current frozen fixture equality and context/privacy tests remain above.
  assert.equal(execFileSync("git", ["diff", "--name-only", "b39c929df5e58faa42f0c2e149bf2d6d0a6a2744", "e4f9171f9db87428b5b5812837474eb2c87c5aa8", "--",
    "src/lib/gameplay", "src/lib/dm-craft", ...execFileSync("git", ["ls-tree", "-r", "--name-only", "b39c929df5e58faa42f0c2e149bf2d6d0a6a2744", "supabase"], { encoding: "utf8" }).trim().split(/\r?\n/)], { encoding: "utf8" }).trim(), "");
  assert.deepEqual(COMPLETION_GROUNDING["identity-knowledge-refusal"].privateConversation.participants,
    [SMOKE_ACTOR_IDS.liora, SMOKE_ACTOR_IDS.orin]);
});

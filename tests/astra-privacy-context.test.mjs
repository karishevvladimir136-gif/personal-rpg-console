import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { memorySource } from "./phase3-long-fixtures.mjs";
import { curateAstraContextSource, astraContextHasPrivateEvidence,
  projectAstraPublicSource } from "../src/lib/gameplay/astra-privacy-context.ts";
import { buildAstraPlanContext } from "../src/lib/gameplay/astra-plan-context.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";

function fixture() {
  const f = runtimeFixture();
  f.source.astraResponseContract = "unified-v1";
  f.source.memory = { campaignId: f.input.campaignId, generation: 1, stateRevision: f.source.runtime.revision,
    checkpoint: null, exactEvents: [], historical: [], privateHistorical: [], publicSummary: null,
    privateSummary: null, complete: true };
  f.input.input = "I sit by the road and watch people pass.";
  return f;
}
function privateRow(f, id, text) {
  return memorySource(id, text, { campaignId: f.input.campaignId,
    ref: { campaignId: f.input.campaignId, kind: "private_event", id, version: "1", part: 0, visibility: "private" } });
}

test("unrelated private campaign facts and summaries do not force every operation into a private request", () => {
  const f = fixture();
  f.source.privateState = { fact: { distant_palace: "UNRELATED_SECRET_CANARY" } };
  f.source.memory.privateSummary = { valid: true, campaignId: f.input.campaignId, generation: 1,
    visibility: "private", entries: [privateRow(f, "distant", "UNRELATED_SUMMARY_CANARY")] };
  const selected = curateAstraContextSource(f.source, f.input);
  const context = buildAstraPlanContext(selected, f.input);
  assert.equal(astraContextHasPrivateEvidence(context), false);
  assert.ok(!context.input.includes("UNRELATED_SECRET_CANARY"));
  assert.ok(!context.input.includes("UNRELATED_SUMMARY_CANARY"));
  assert.ok(context.input.includes(f.input.input));
});

test("actual selected private Memory evidence forces the private boundary regardless of campaign-global existence", () => {
  const f = fixture();
  f.source.privateState = {};
  f.source.memory.privateHistorical = [privateRow(f, "selected", "SELECTED_PRIVATE_TRUTH")];
  const context = buildAstraPlanContext(curateAstraContextSource(f.source, f.input), f.input);
  assert.equal(astraContextHasPrivateEvidence(context), true);
  assert.ok(context.input.includes("SELECTED_PRIVATE_TRUTH"));
});

test("query-relevant facts and clocks remain selected and require private-informed adjudication", () => {
  const f = fixture(); f.input.input = "I inspect the mill.";
  f.source.privateState = { fact: { mill_secret: "THE_MILL_SECRET" }, clock: { mill_pressure: 0 },
    faction: { distant_palace: "UNRELATED_FACTION_CANARY" } };
  const selected = curateAstraContextSource(f.source, f.input);
  const context = buildAstraPlanContext(selected, f.input);
  assert.equal(astraContextHasPrivateEvidence(context), true);
  assert.ok(context.input.includes("THE_MILL_SECRET"));
  assert.equal(selected.privateState.clock.mill_pressure, 0);
  assert.ok(!context.input.includes("UNRELATED_FACTION_CANARY"));
});

test("relevant Character Models force privacy while unrelated models are excluded", () => {
  const f = fixture();
  const actor = { ...f.source.snapshot.entities[0], id: randomUUID(), kind: "npc", name: "Mara" };
  f.source.snapshot.entities.push(actor);
  const model = { schemaVersion: 1, actorId: actor.id, basisOperationId: null,
    identity: { values: ["PRIVATE_VALUES_CANARY"], wants: [], boundaries: [], loyalties: [], signatures: [],
      observableVoice: "A dry public voice." },
    current: { goal: null, stress: "settled", preoccupation: null, obligation: null }, beliefs: [], relationships: [], episodes: [] };
  f.source.privateState = { npc: { [`character_${actor.id}`]: JSON.stringify(model) } };
  let selected = curateAstraContextSource(f.source, f.input);
  assert.equal(astraContextHasPrivateEvidence(buildAstraPlanContext(selected, f.input)), false);
  f.source.runtime.configuration.presentEntityIds.push(actor.id);
  f.input.input = "Mara, what do you think?";
  selected = curateAstraContextSource(f.source, f.input);
  assert.equal(astraContextHasPrivateEvidence(buildAstraPlanContext(selected, f.input)), true);
  const safe = projectAstraPublicSource(selected, f.input);
  const publicContext = buildAstraPlanContext(safe, f.input);
  assert.equal(astraContextHasPrivateEvidence(publicContext), false);
  assert.ok(!publicContext.input.includes("PRIVATE_VALUES_CANARY"));
  assert.equal(safe.observableCharacters[0].observableVoice, "A dry public voice.");
  safe.observableCharacters.push({ actorId: randomUUID(), observableVoice: "FOREIGN_VOICE_CANARY" });
  const projectedAgain = projectAstraPublicSource(safe, f.input, { forNarration: true });
  assert.deepEqual(projectedAgain.observableCharacters, [{ actorId: actor.id, observableVoice: "A dry public voice." }]);
  const narrationContext = buildContext(projectedAgain, f.input, "narrate", { model: "gpt-6-astra" });
  assert.ok(narrationContext.input.includes("A dry public voice."));
  assert.ok(!narrationContext.input.includes("PRIVATE_VALUES_CANARY"));
  assert.ok(!narrationContext.input.includes("FOREIGN_VOICE_CANARY"));
  f.input.input = "I ask her about the road.";
  assert.equal(astraContextHasPrivateEvidence(buildAstraPlanContext(
    curateAstraContextSource(f.source, f.input), f.input)), true);
});

test("public takeover routing and proven public capabilities are not secret-bearing World evidence", () => {
  const f = fixture();
  f.source.privateState = {};
  f.source.astraProgressionBaseline = ["tracking"];
  f.source.worldTakeover = { schemaVersion: 1, sourceWorldRevision: 1,
    presentEntityIds: [f.actorId], routeLocationIds: [],
    actors: [{ entityId: f.actorId, publicName: f.source.snapshot.entities[0].name, capabilities: ["tracking"], limitations: [], knowledge: [] }],
    policy: { simulation: false, autonomy: "moderate" }, unresolvedThreads: [], recentWorldEvents: [] };
  const selected = curateAstraContextSource(f.source, f.input);
  const context = buildAstraPlanContext(selected, f.input);
  assert.equal(astraContextHasPrivateEvidence(context), false);
  assert.ok(context.input.includes("tracking"));
  assert.equal(projectAstraPublicSource(selected, f.input, { forNarration: true }).worldTakeover, undefined);
});

test("empty private metadata and public observable voices do not create a private operation", () => {
  const input = JSON.stringify({ mandatory: { privateState: { schemaVersion: 1, revision: 4 },
    characterPacket: [{ actorId: "actor", schemaVersion: 1, identity: { observableVoice: "Public voice" }, current: {}, beliefs: [], relationships: [], episodes: [] }],
    checkpoint: { stateRevision: 4, sourceRefs: [], resume: { situation: "Public scene" } } },
    memory: { privateContinuity: { schemaVersion: 1, generation: 4, exactEvents: [], history: [{ id: "metadata-only" }], digest: [] } } });
  assert.equal(astraContextHasPrivateEvidence({ input }), false);
  assert.equal(astraContextHasPrivateEvidence({ input: JSON.stringify({ mandatory: {
    checkpoint: { privateText: "PRIVATE_CHECKPOINT_CANARY" } } }) }), true);
});

test("strict public projection excludes private checkpoint, World, Memory and plan bridge before narration", () => {
  const f = fixture();
  f.source.privateState = { fact: { mill: "PRIVATE_STATE_CANARY" } };
  f.source.memory.privateHistorical = [privateRow(f, "secret", "PRIVATE_MEMORY_CANARY")];
  f.source.narrationBridge = { planIntent: "PRIVATE_PLAN_CANARY", characters: [] };
  f.source.checkpoint = { campaignId: f.input.campaignId, stateRevision: 1, settingsRevision: 1,
    sourceIds: [], valid: true, publicText: "public", privateText: "PRIVATE_CHECKPOINT_CANARY" };
  const safe = projectAstraPublicSource(f.source, f.input, { forNarration: true });
  const context = buildContext(safe, f.input, "narrate", { model: "gpt-6-astra" });
  for (const value of ["PRIVATE_STATE_CANARY", "PRIVATE_MEMORY_CANARY", "PRIVATE_PLAN_CANARY", "PRIVATE_CHECKPOINT_CANARY"])
    assert.ok(!context.input.includes(value));
  assert.equal(astraContextHasPrivateEvidence(context), false);
  assert.equal(context.budget.inputCap, 993404);
});

test("modern Memory checkpoint serializes only public resume fields and omits explicitly private checkpoints", () => {
  const f = fixture(); f.source.privateState = {};
  f.source.memory.checkpoint = { valid: true, campaignId: f.input.campaignId,
    stateRevision: f.source.runtime.revision, settingsRevision: 1, sourceRefs: [],
    publicWatermark: 1, guideVersionId: f.source.snapshot.documents[0].current_version_id,
    resume: { situation: "PUBLIC_RESUME", privateText: "PRIVATE_RESUME_CANARY" } };
  let context = buildAstraPlanContext(curateAstraContextSource(f.source, f.input), f.input);
  assert.ok(context.input.includes("PUBLIC_RESUME"));
  assert.ok(!context.input.includes("PRIVATE_RESUME_CANARY"));
  assert.equal(astraContextHasPrivateEvidence(context), false);
  f.source.memory.checkpoint.resume.visibility = "private";
  f.source.memory.checkpoint.resume.situation = "PRIVATE_SITUATION_CANARY";
  context = buildAstraPlanContext(curateAstraContextSource(f.source, f.input), f.input);
  assert.ok(!context.input.includes("PRIVATE_SITUATION_CANARY"));
  assert.equal(astraContextHasPrivateEvidence(context), false);
});

test("selected hidden World actor evidence forces privacy and is absent from strict public projection", () => {
  const f = fixture(); f.source.privateState = {};
  const actor = { ...f.source.snapshot.entities[0], id: randomUUID(), kind: "npc", name: "Mara" };
  f.source.snapshot.entities.push(actor);
  f.source.runtime.configuration.presentEntityIds.push(actor.id);
  f.source.worldTakeover = { schemaVersion: 1, sourceWorldRevision: 1,
    presentEntityIds: [f.actorId, actor.id], routeLocationIds: [], actors: [{ entityId: actor.id,
      publicName: "Mara", capabilities: ["WORLD_HIDDEN_CAPABILITY_CANARY"], limitations: [],
      knowledge: [{ visibility: "private", sourceId: randomUUID(), locator: { kind: "text", value: "WORLD_HIDDEN_TRUTH_CANARY" } }] }],
    policy: {}, unresolvedThreads: [], recentWorldEvents: [] };
  f.input.input = "Mara, will you help me?";
  const selected = curateAstraContextSource(f.source, f.input);
  const context = buildAstraPlanContext(selected, f.input);
  assert.equal(astraContextHasPrivateEvidence(context), true);
  assert.ok(context.input.includes("WORLD_HIDDEN_TRUTH_CANARY"));
  const publicContext = buildAstraPlanContext(projectAstraPublicSource(selected, f.input), f.input);
  assert.equal(astraContextHasPrivateEvidence(publicContext), false);
  assert.ok(!publicContext.input.includes("WORLD_HIDDEN_TRUTH_CANARY"));
  assert.ok(!publicContext.input.includes("WORLD_HIDDEN_CAPABILITY_CANARY"));
});

test("unknown future authoring fields cannot bypass private routing while public-agreed reward terms stay public", () => {
  const publicPacket = { mandatory: { privateState: {}, characterPacket: [] }, astraPrimary: {
    settlementAuthority: { jobs: [{ questId: "quest", title: "Agreed job", status: "complete", issuerId: "npc",
      rewardTerms: { currencyName: "silver", currencyAmount: 2, itemName: null, itemCategory: null, itemDescription: null } }] } } };
  assert.equal(astraContextHasPrivateEvidence({ input: JSON.stringify(publicPacket) }), false);
  publicPacket.astraPrimary.newPrivateAuthoringPacket = { motive: "HIDDEN_FUTURE_CANARY" };
  assert.equal(astraContextHasPrivateEvidence({ input: JSON.stringify(publicPacket) }), true);
});

test("explicit public World events stay on the public route while private or unknown events require privacy", () => {
  const f = fixture(); f.source.privateState = {};
  f.input.input = "I inspect the mill entrance.";
  const publicEvent = { id: randomUUID(), visibility: "public", text: "The mill entrance is clear.", actorIds: [] };
  const privateEvent = { id: randomUUID(), visibility: "private", text: "The mill entrance hides PRIVATE_EVENT_CANARY.", actorIds: [] };
  f.source.worldTakeover = { schemaVersion: 1, sourceWorldRevision: 1,
    presentEntityIds: [f.actorId], routeLocationIds: [], actors: [], policy: {}, unresolvedThreads: [],
    recentWorldEvents: [publicEvent] };
  let selected = curateAstraContextSource(f.source, f.input);
  let context = buildAstraPlanContext(selected, f.input);
  assert.ok(context.input.includes("The mill entrance is clear."));
  assert.equal(astraContextHasPrivateEvidence(context), false);
  f.source.worldTakeover.recentWorldEvents.push(privateEvent);
  selected = curateAstraContextSource(f.source, f.input);
  context = buildAstraPlanContext(selected, f.input);
  assert.equal(astraContextHasPrivateEvidence(context), true);
  const publicContext = buildAstraPlanContext(projectAstraPublicSource(selected, f.input), f.input);
  assert.ok(publicContext.input.includes("The mill entrance is clear."));
  assert.ok(!publicContext.input.includes("PRIVATE_EVENT_CANARY"));
  assert.equal(astraContextHasPrivateEvidence(publicContext), false);
  delete privateEvent.visibility;
  context = buildAstraPlanContext(curateAstraContextSource(f.source, f.input), f.input);
  assert.equal(astraContextHasPrivateEvidence(context), true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ShadowJournal, runShadowTurn, validateFinal } from "../spikes/astra-primary-dm/prototype.mjs";
import { adaptiveContextBudget, commonDmInstructions, composeEvaluationPacket, prepareEvaluation, stage1CaseIds, summarizeProviderMetrics } from "../spikes/astra-primary-dm/evaluation.mjs";
import { IDS, evaluationCases, frozenCampaign } from "../spikes/astra-primary-dm/frozen-data.mjs";
import { createStage2Runs, nextStage2Packet, prepareStage2Template, recordStage2Commit, stage2Arc } from "../spikes/astra-primary-dm/stage2.mjs";

const input = (operationId) => ({ operationId, campaignId: IDS.campaign,
  timeline: { timelineId: "synthetic-main", epoch: 1 }, expectedRevision: 7,
  input: "I jump to the innkeeper and kiss him" });
const final = (request, changes = [], rollRefs = []) => ({ schemaVersion: 1,
  operationId: request.operationId, campaignId: request.campaignId, expectedRevision: request.expectedRevision,
  input: request.input, narration: "Mara reaches out; the innkeeper turns away and keeps his distance.",
  visualDescription: "Two people face one another across the tavern floor.",
  publicChanges: changes, privateChanges: [], memoryCandidates: [], rollRefs,
  worldMinutes: 720, clarification: null });
const caseById = (id) => evaluationCases.find((row) => row.id === id);
const context = async () => composeEvaluationPacket(caseById("jump-kiss"), "C").packet;

async function inDisposableJournal(fn) {
  const dir = await mkdtemp(join(tmpdir(), "astra-shadow-"));
  try { return await fn(join(dir, "journal.json")); }
  finally { await rm(dir, { recursive: true, force: true }); }
}

test("literal input is saved before context preparation and survives a failed preflight/restart", async () => {
  await inDisposableJournal(async (path) => {
    const journal = await ShadowJournal.open(path, frozenCampaign());
    const request = input("synthetic-preflight-1");
    await assert.rejects(runShadowTurn({ journal, input: request,
      composeContext: () => { throw Error("synthetic context failure"); },
      dm: { next: () => { throw Error("should never call DM"); } } }), /synthetic context failure/);
    const saved = JSON.parse(await readFile(path, "utf8"));
    assert.equal(saved.turns[request.operationId].input.input, request.input);
    assert.equal(saved.turns[request.operationId].status, "failed");
    assert.equal(saved.campaign.revision, 7);
    const reopened = await ShadowJournal.open(path, frozenCampaign());
    const result = await runShadowTurn({ journal: reopened, input: request, composeContext: context,
      dm: { next: () => ({ type: "final", proposal: final(request) }) } });
    assert.equal(result.status, "committed");
    assert.equal(reopened.data.campaign.revision, 8);
  });
});

test("one primary DM handles generic checked contact; retry reuses the exact durable roll", async () => {
  await inDisposableJournal(async (path) => {
    const request = input("synthetic-contact-1");
    const journal = await ShadowJournal.open(path, frozenCampaign());
    let providerCalls = 0, rolls = 0;
    const dm = { next: ({ transcript }) => {
      providerCalls++;
      if (!transcript.length) return { type: "tool", call: { callId: "contact-check", kind: "skill",
        actorId: IDS.hero, targetId: IDS.innkeeper, dc: 13 } };
      const check = transcript[0].result;
      assert.equal(check.success, false);
      return { type: "final", proposal: { ...final(request, [{ family: "actors", id: IDS.hero,
        expectedRevision: 2, values: { position: "nearby", resources: { move: 0, action: 0 } } }], [check.id]),
        privateChanges: [{ key: "innkeeper_reaction", value: "SYNTHETIC_PRIVATE_NOTE: wary of Mara" }],
        memoryCandidates: [{ visibility: "public", text: "The innkeeper turns away." },
          { visibility: "private", text: "SYNTHETIC_PRIVATE_NOTE: wary of Mara" }] } };
    } };
    let interrupted = false;
    await assert.rejects(runShadowTurn({ journal, input: request, composeContext: context, dm,
      random: () => { rolls++; return 1; }, afterToolRecorded: () => {
        if (!interrupted) { interrupted = true; throw Error("synthetic lost response"); }
      } }), /synthetic lost response/);
    assert.equal(rolls, 1);
    const savedCheck = journal.get(request.operationId).checkpoint.tools[0].result;
    assert.equal(savedCheck.success, false);
    const reopened = await ShadowJournal.open(path, frozenCampaign());
    const result = await runShadowTurn({ journal: reopened, input: request, composeContext: context, dm,
      random: () => { throw Error("must not reroll"); } });
    assert.equal(result.status, "committed");
    assert.equal(result.checks[0].id, savedCheck.id);
    assert.equal(result.checks[0].dc, undefined);
    assert.equal(result.checks[0].targetId, undefined);
    assert.equal(reopened.data.campaign.actors[IDS.hero].position, "nearby");
    assert.equal(reopened.data.campaign.actors[IDS.hero].resources.action, 0);
    assert.equal(reopened.data.campaign.actors[IDS.hero].resources.move, 0);
    assert.equal(reopened.data.campaign.actors[IDS.hero].resources.reaction, 1);
    assert.equal(reopened.data.campaign.actors[IDS.innkeeper].hp, 5);
    assert.ok(!JSON.stringify(result).includes("SYNTHETIC_PRIVATE_NOTE"));
    assert.ok(!JSON.stringify(reopened.readPublic(request.operationId)).includes("SYNTHETIC_PRIVATE_NOTE"));
    assert.deepEqual(await runShadowTurn({ journal: reopened, input: request, composeContext: context, dm }), result);
    assert.equal(providerCalls, 2); // one request, then same DM sees the recorded check
    assert.equal(rolls, 1);
  });
});

test("generic attack and damage tools use server dice and one bounded HP change", async () => {
  await inDisposableJournal(async (path) => {
    const request = { ...input("synthetic-damage-1"), input: "I strike with my short sword" };
    const journal = await ShadowJournal.open(path, frozenCampaign());
    const dm = { next: ({ transcript }) => {
      if (!transcript.length) return { type: "tool", call: { callId: "attack-1", kind: "attack",
        actorId: IDS.hero, targetId: IDS.innkeeper, itemId: IDS.sword } };
      if (transcript.length === 1) return { type: "tool", call: { callId: "damage-1", kind: "damage",
        actorId: IDS.hero, targetId: IDS.innkeeper, itemId: IDS.sword } };
      return { type: "final", proposal: { ...final(request, [{ family: "actors", id: IDS.innkeeper,
        expectedRevision: 3, values: { hp: 1 } }], transcript.map((row) => row.result.id)),
        narration: "The sword cuts the innkeeper; he remains standing." } };
    } };
    const result = await runShadowTurn({ journal, input: request, composeContext: context, dm,
      random: (min, max) => max === 21 ? 20 : 3 });
    assert.equal(result.status, "committed");
    assert.equal(journal.data.campaign.actors[IDS.innkeeper].hp, 1);
    assert.equal(journal.data.campaign.actors[IDS.innkeeper].revision, 4);
    assert.equal(journal.get(request.operationId).checkpoint.tools.length, 2);
    assert.equal(journal.get(request.operationId).checkpoint.tools[0].result.modifier, 4);
    assert.equal(journal.get(request.operationId).checkpoint.tools[0].result.dc, 10);
    assert.equal(journal.get(request.operationId).checkpoint.tools[1].result.total, 4);
  });
});

test("attacks derive defense and weapon modifiers from state, rejecting arbitrary DC or weapon", async () => {
  await inDisposableJournal(async (path) => {
    const journal = await ShadowJournal.open(path, frozenCampaign());
    const turn = await journal.begin(input("synthetic-attack-authority"));
    const attack = { callId: "attack", kind: "attack", actorId: IDS.hero,
      targetId: IDS.innkeeper, itemId: IDS.sword };
    await assert.rejects(journal.recordTool(turn, { ...attack, dc: 5 }, () => 20), /validation/);
    await assert.rejects(journal.recordTool(turn, { ...attack, itemId: IDS.oil }, () => 20), /validation/);
    await assert.rejects(journal.recordTool(turn, { ...attack, targetId: "foreign-id" }, () => 20), /validation/);
    assert.equal(turn.checkpoint.tools.length, 0);
    const receipt = await journal.recordTool(turn, attack, () => 12);
    assert.equal(receipt.dc, 10);
    assert.equal(receipt.modifier, 4);
    assert.equal(turn.checkpoint.tools.length, 1);
  });
});

test("the same generic loop commits social failure, inventory use, travel and a quiet NPC scene", async () => {
  await inDisposableJournal(async (path) => {
    const journal = await ShadowJournal.open(path, frozenCampaign());
    const sourcePacket = async (state, request) => ({ literalInput: request.input, current: state,
      note: "Frozen private DM packet; never returned to browser" });
    const social = { ...input("synthetic-social-1"), input: "I bluff the magistrate", expectedRevision: 7 };
    const socialDm = { next: ({ transcript }) => transcript.length
      ? { type: "final", proposal: { ...final(social, [], [transcript[0].result.id]),
        narration: "The magistrate does not believe Mara. He asks for evidence.",
        memoryCandidates: [{ visibility: "public", text: "Mara's bluff failed in Town Hall." }],
        privateChanges: [{ key: "magistrate_suspicion", value: "The magistrate is now wary of Mara." }] } }
      : { type: "tool", call: { callId: "bluff", kind: "skill", actorId: IDS.hero,
        targetId: IDS.magistrate, dc: 15 } } };
    const socialResult = await runShadowTurn({ journal, input: social, composeContext: sourcePacket,
      dm: socialDm, random: () => 1 });
    assert.equal(socialResult.status, "committed");
    assert.match(socialResult.narration, /does not believe/);
    assert.equal(journal.data.campaign.privateFacts.magistrate_suspicion, "The magistrate is now wary of Mara.");
    assert.ok(!JSON.stringify(socialResult).includes("magistrate_suspicion"));

    const oil = { ...input("synthetic-oil-1"), input: "I use my remaining oil flask", expectedRevision: 8 };
    const oilResult = await runShadowTurn({ journal, input: oil, composeContext: sourcePacket,
      dm: { next: () => ({ type: "final", proposal: { ...final(oil, [{ family: "items", id: IDS.oil,
        expectedRevision: 1, values: { quantity: 0 } }]), worldMinutes: 725,
        narration: "The flask is spent lighting the passage." } }) } });
    assert.equal(oilResult.status, "committed");
    assert.equal(journal.data.campaign.items[IDS.oil].quantity, 0);

    const travel = { ...input("synthetic-travel-1"), input: "I explore the north road", expectedRevision: 9 };
    const travelResult = await runShadowTurn({ journal, input: travel, composeContext: sourcePacket,
      dm: { next: () => ({ type: "final", proposal: { ...final(travel, [{ family: "location",
        id: IDS.road, expectedRevision: null, values: {} }]), worldMinutes: 755,
        narration: "Mara reaches the established North Road after a careful walk." } }) } });
    assert.equal(travelResult.status, "committed");
    assert.equal(journal.data.campaign.currentLocationId, IDS.road);

    const quiet = { ...input("synthetic-quiet-1"), input: "I ask Orin how he is", expectedRevision: 10 };
    const quietResult = await runShadowTurn({ journal, input: quiet, composeContext: sourcePacket,
      dm: { next: () => ({ type: "final", proposal: { ...final(quiet), worldMinutes: 755,
        narration: "Orin says he needs a moment, then asks about his father's map.",
        memoryCandidates: [{ visibility: "public", text: "Orin recalled Mara's promise about the map." }] } }) } });
    assert.equal(quietResult.status, "committed");
    assert.equal(quietResult.publicMemory.length, 1);
    assert.equal(journal.data.campaign.revision, 11);
    assert.equal(journal.get(quiet.operationId).checkpoint.tools.length, 0);
  });
});

test("invariants reject forged identity, secret leakage, unrolled harm and changed tool replay atomically", async () => {
  await inDisposableJournal(async (path) => {
    const journal = await ShadowJournal.open(path, frozenCampaign());
    const request = input("synthetic-forgery-1");
    const turn = await journal.begin(request);
    const state = journal.data.campaign;
    const base = final(request);
    assert.throws(() => validateFinal(state, turn, { ...base, narration: state.privateFacts.culprit }), /validation/);
    assert.throws(() => validateFinal(state, turn, { ...base, publicChanges: [{ family: "actors", id: IDS.innkeeper,
      expectedRevision: 3, values: { hp: 1 } }] }), /validation/);
    assert.throws(() => validateFinal(state, turn, { ...base, publicChanges: [{ family: "items", id: IDS.oil,
      expectedRevision: 1, values: { quantity: -1 } }] }), /validation/);
    assert.throws(() => validateFinal(state, turn, { ...base, publicChanges: [{ family: "actors", id: "foreign-id",
      expectedRevision: 1, values: { hp: 1 } }] }), /validation/);
    assert.throws(() => validateFinal(state, turn, { ...base, publicChanges: [{ family: "actors", id: IDS.hero,
      expectedRevision: 2, values: { position: "nearby" } }] }), /validation/);
    assert.throws(() => validateFinal(state, turn, { ...base, rollRefs: ["invented-roll"] }), /validation/);
    const call = { callId: "same-roll", kind: "skill", actorId: IDS.hero, targetId: IDS.innkeeper, dc: 12 };
    const first = await journal.recordTool(turn, call, () => 4);
    assert.deepEqual(await journal.recordTool(turn, call, () => { throw Error("rerolled"); }), first);
    await assert.rejects(journal.recordTool(turn, { ...call, dc: 5 }, () => 1), /conflict/);
    assert.equal(journal.data.campaign.revision, 7);
  });
});

test("frozen A/B/C prepares every gameplay domain with blind review and no network path", async () => {
  const pack = prepareEvaluation();
  assert.equal(pack.networkEnabled, false);
  assert.equal(pack.scenarioCount, 10);
  assert.equal(pack.primarySessions, 30);
  assert.equal(pack.maximumModelRoundTrips, 120);
  assert.equal(pack.maximumEstimatedUsd, 67.2);
  assert.deepEqual(pack.calls.filter((row) => row.caseId === "jump-kiss").map((row) => row.input),
    Array(3).fill("I jump to the innkeeper and kiss him"));
  assert.ok(evaluationCases.some((row) => row.id === "old-promise"));
  assert.ok(evaluationCases.some((row) => row.id === "chosen-temptation"));
  assert.ok(evaluationCases.some((row) => row.id === "travel"));
  assert.ok(evaluationCases.some((row) => row.id === "risky-bluff"));
  for (const scenario of evaluationCases.filter((row) => stage1CaseIds.includes(row.id))) {
    const group = pack.calls.filter((row) => row.caseId === scenario.id);
    assert.equal(group.length, 3);
    assert.equal(new Set(group.map((row) => row.input)).size, 1);
    assert.equal(new Set(group.map((row) => row.packet.currentScene)).size, 1);
    assert.equal(new Set(group.map((row) => row.packet.revision)).size, 1);
  }
  const old = composeEvaluationPacket(caseById("old-promise"), "C").packet;
  assert.ok(old.consoleContext.retrievedMemory.some((row) => row.id === "promise-1"));
  const baseline = composeEvaluationPacket(caseById("old-promise"), "A").packet;
  assert.equal(baseline.consoleContext, undefined);
  assert.equal(baseline.dmGuidance, undefined);
  assert.equal(baseline.instructions, commonDmInstructions);
  assert.doesNotMatch(JSON.stringify(baseline), /Mary Sue|God Simulator|fail.forward|prose economy|meaningful failure|Cognitive Worlds|NPC autonomy/i);
  const middle = composeEvaluationPacket(caseById("old-promise"), "B").packet;
  assert.equal(middle.instructions, baseline.instructions);
  assert.equal(middle.dmGuidance, undefined);
  assert.ok(middle.consoleContext.retrievedMemory.some((row) => row.id === "promise-1"));
  assert.ok(old.dmGuidance.doctrine && old.dmGuidance.characterModels[IDS.miner]);
  assert.ok(old.dmGuidance.cognitiveCraftCards.some((row) => row.key === "cognitive-world"));
  assert.equal(old.dmGuidance.doctrine.version, 2);
  assert.ok(old.dmGuidance.proseEconomy);
  assert.deepEqual(old.consoleContext, middle.consoleContext);
  assert.deepEqual(stage1CaseIds, ["jump-kiss", "burning-oil", "called-shot-ally", "risky-bluff",
    "companion-refusal", "wrong-culprit", "chosen-temptation", "quiet-scene", "old-promise", "consume-oil"]);
  assert.equal(pack.ownerBlindReview.cases[0].variants[0].providerMetrics.reasoningTokens, null);
  assert.doesNotMatch(JSON.stringify(pack.ownerBlindReview), /"arm"|"A"|"B"|"C"|SYNTHETIC_SECRET/);
  assert.notDeepEqual(pack.revealKey[0].mapping, pack.revealKey[1].mapping);
  const code = await readFile(new URL("../spikes/astra-primary-dm/evaluation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(code, /\bfetch\(|https?:\/\/|OPENAI_API_KEY|createStructuredRequester/);
});

test("Stage 2 prepares two isolated sequential arms and carries validated state and public history", () => {
  const template = prepareStage2Template();
  assert.equal(template.networkEnabled, false);
  assert.equal(template.selectedArms, null);
  assert.equal(stage2Arc.length, 14);
  assert.deepEqual(stage2Arc[1].fixedD20, [1]);
  assert.deepEqual(template.longitudinalReview.lateTurns, [11, 12, 13, 14]);
  for (const probe of ["real failure", "resource pressure", "NPC disagreement", "wrong theory",
    "chosen-one temptation", "quiet downtime", "old callback", "escalation without power inflation"])
    assert.ok(stage2Arc.some((row) => row.probe === probe));
  assert.throws(() => createStage2Runs(["A", "A"]));
  const [first, second] = createStage2Runs(["B", "C"]);
  const initialFirst = nextStage2Packet(first).packet;
  const initialSecond = nextStage2Packet(second).packet;
  assert.equal(initialFirst.literalInput, initialSecond.literalInput);
  assert.equal(initialFirst.revision, initialSecond.revision);
  assert.equal(initialFirst.dmGuidance, undefined);
  assert.ok(initialSecond.dmGuidance.characterModels[IDS.miner]);
  const stateAfter = structuredClone(first.state);
  stateAfter.revision++;
  stateAfter.actors[IDS.hero].hp = 8;
  stateAfter.actors[IDS.hero].resources.focus = 1;
  stateAfter.items[IDS.oil].quantity = 0;
  recordStage2Commit(first, { publicResult: { status: "committed", campaignId: IDS.campaign,
    committedRevision: stateAfter.revision, narration: "Orin disagrees, and Mara spends her oil.",
    publicMemory: [{ text: "Orin disagreed at the inn." }] }, stateAfter });
  const follow = nextStage2Packet(first).packet;
  assert.equal(follow.revision, 8);
  assert.equal(follow.protagonist.hp, 8);
  assert.equal(follow.protagonist.resources.focus, 1);
  assert.equal(follow.consoleContext.structuredState.items[IDS.oil].quantity, 0);
  assert.equal(follow.visibleInventory.some((item) => item.id === IDS.oil), false);
  assert.equal(follow.currentScene, "Orin disagrees, and Mara spends her oil.");
  assert.ok(follow.consoleContext.recentScenes.some((row) => row.text.includes("Orin disagrees")));
  assert.equal(second.state.revision, 7);
  assert.equal(second.state.items[IDS.oil].quantity, 1);
  assert.equal(nextStage2Packet(second).packet.literalInput, initialFirst.literalInput);
  second.turnIndex = 12;
  assert.ok(nextStage2Packet(second).packet.consoleContext.retrievedMemory.some((row) => row.id === "promise-1"));
});

test("later authorized provider receipts produce exact latency, token and tool totals", () => {
  const first = { latencyMs: 1200, inputTokens: 900, outputTokens: 300, reasoningTokens: 100,
    cachedInputTokens: 200, toolCalls: [{ callId: "check-1", kind: "skill" }] };
  const second = { latencyMs: 700, inputTokens: 1100, outputTokens: 200, reasoningTokens: 50,
    cachedInputTokens: 500, toolCalls: [] };
  const result = summarizeProviderMetrics([first, second]);
  assert.equal(result.requestCount, 2);
  assert.equal(result.totalLatencyMs, 1900);
  assert.equal(result.inputTokens, 2000);
  assert.equal(result.outputTokens, 500);
  assert.equal(result.reasoningTokens, 150);
  assert.equal(result.cachedInputTokens, 700);
  assert.deepEqual(result.toolCalls, [{ callId: "check-1", kind: "skill" }]);
  assert.throws(() => summarizeProviderMetrics([{ ...first, inputTokens: 16_001 }]));
  assert.throws(() => summarizeProviderMetrics([{ ...first, reasoningTokens: 301 }]));
  assert.throws(() => summarizeProviderMetrics(Array(5).fill(first)));
});

test("adaptive curated packet can exceed the old 64 KB cap while retaining mandatory authority", () => {
  const campaign = frozenCampaign();
  for (let index = 0; index < 28; index++) {
    const id = `synthetic-actor-${index}`;
    campaign.actors[id] = { ...campaign.actors[IDS.miner], id, name: `Miner ${index}`,
      knownDetails: "Ordinary current actor detail. ".repeat(30) };
  }
  campaign.recentScenes = Array.from({ length: 16 }, (_, index) =>
    ({ id: `synthetic-scene-${index}`, text: `Older public scene ${index}. ` + "Ordinary recap. ".repeat(290) }));
  const result = composeEvaluationPacket(caseById("old-promise"), "C", campaign);
  assert.ok(result.estimatedInputBytes > 64_000);
  assert.ok(result.estimatedInputBytes <= result.budget.proposedByteCap);
  assert.ok(result.packet.consoleContext.ownerCorrections.length > 0);
  assert.ok(result.packet.consoleContext.retrievedMemory.some((row) => row.id === "promise-1"));
  assert.equal(result.budget.registeredContextTokens, 1_050_000);
  assert.equal(adaptiveContextBudget(campaign, 1).currentProductionInputCap, 64_000);
  campaign.recentScenes = campaign.recentScenes.map((row) => ({ ...row, text: row.text.repeat(3) }));
  const trimmed = composeEvaluationPacket(caseById("old-promise"), "C", campaign);
  assert.ok(trimmed.packet.consoleContext.recentScenes.length < 16);
  assert.ok(trimmed.packet.consoleContext.ownerCorrections.length > 0);
  assert.ok(trimmed.packet.consoleContext.retrievedMemory.some((row) => row.id === "promise-1"));
  assert.ok(trimmed.estimatedInputBytes <= trimmed.budget.proposedByteCap);
});

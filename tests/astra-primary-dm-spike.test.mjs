import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ShadowJournal, runShadowTurn, validateFinal } from "../spikes/astra-primary-dm/prototype.mjs";
import { adaptiveContextBudget, composeEvaluationPacket, prepareEvaluation } from "../spikes/astra-primary-dm/evaluation.mjs";
import { IDS, evaluationCases, frozenCampaign } from "../spikes/astra-primary-dm/frozen-data.mjs";

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
        actorId: IDS.hero, targetId: IDS.innkeeper, dc: 10 } };
      if (transcript.length === 1) return { type: "tool", call: { callId: "damage-1", kind: "damage",
        actorId: IDS.hero, targetId: IDS.innkeeper, itemId: IDS.sword } };
      return { type: "final", proposal: { ...final(request, [{ family: "actors", id: IDS.innkeeper,
        expectedRevision: 3, values: { hp: 2 } }], transcript.map((row) => row.result.id)),
        narration: "The sword cuts the innkeeper; he remains standing." } };
    } };
    const result = await runShadowTurn({ journal, input: request, composeContext: context, dm,
      random: (min, max) => max === 21 ? 20 : 3 });
    assert.equal(result.status, "committed");
    assert.equal(journal.data.campaign.actors[IDS.innkeeper].hp, 2);
    assert.equal(journal.data.campaign.actors[IDS.innkeeper].revision, 4);
    assert.equal(journal.get(request.operationId).checkpoint.tools.length, 2);
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
  assert.equal(pack.scenarioCount, 20);
  assert.equal(pack.primarySessions, 60);
  assert.equal(pack.maximumModelRoundTrips, 240);
  assert.deepEqual(pack.calls.filter((row) => row.caseId === "jump-kiss").map((row) => row.input),
    Array(3).fill("I jump to the innkeeper and kiss him"));
  assert.ok(evaluationCases.some((row) => row.id === "old-promise"));
  assert.ok(evaluationCases.some((row) => row.id === "chosen-temptation"));
  assert.ok(evaluationCases.some((row) => row.id === "travel"));
  assert.ok(evaluationCases.some((row) => row.id === "risky-bluff"));
  for (const scenario of evaluationCases) {
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
  assert.ok(old.dmGuidance.doctrine && old.dmGuidance.characterModels[IDS.miner]);
  assert.doesNotMatch(JSON.stringify(pack.ownerBlindReview), /"arm"|"A"|"B"|"C"|SYNTHETIC_SECRET/);
  assert.notDeepEqual(pack.revealKey[0].mapping, pack.revealKey[1].mapping);
  const code = await readFile(new URL("../spikes/astra-primary-dm/evaluation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(code, /\bfetch\(|https?:\/\/|OPENAI_API_KEY|createStructuredRequester/);
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

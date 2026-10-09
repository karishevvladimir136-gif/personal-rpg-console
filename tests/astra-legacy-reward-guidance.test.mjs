import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

test("Astra planner context distinguishes a grounded legacy reward from job and rest authority", async () => {
  const { source, input, actorId } = runtimeFixture();
  const npcId = randomUUID(), sceneId = randomUUID();
  const owed = "The market seller confirms the crate work is complete and still owes Iris two silver and vegetables.";
  source.snapshot.entities[0].name = "Iris";
  source.snapshot.entities.push({ ...source.snapshot.entities[0], id: npcId,
    kind: "npc", name: "Market seller" });
  source.runtime.configuration.presentEntityIds.push(npcId);
  source.worldTakeover = { schemaVersion: 1,
    presentEntityIds: [actorId, npcId], routeLocationIds: [],
    actors: [{ entityId: npcId, publicName: "Market seller" }] };
  source.snapshot.scenes.push({ id: sceneId,
    campaign_id: input.campaignId, revision: 1,
    session_id: source.snapshot.sessions[0].id, role: "narration", body: owed });
  source.snapshot.publicState.current_scene_id = sceneId;
  source.astraSettlementJobs = [];
  source.astraSettlementCurrencies = [];
  source.runtime.configuration.safeLocationIds = [];
  input.input = "Iris asks for her owed pay, a place to sleep, and morning work.";

  const publicEvidence = { id: randomUUID(), campaignId: input.campaignId,
    ref: { campaignId: input.campaignId, kind: "scene", id: sceneId,
      version: "1", part: 0, visibility: "public" },
    sequence: 1, sessionId: source.snapshot.sessions[0].id, text: owed,
    entityIds: [actorId, npcId], knownBy: [], authority: "history",
    statementKind: "fact", attribution: "Market seller", validFrom: null,
    validTo: null, significance: 5, unresolved: true, current: true,
    status: "valid", factKey: "market_seller_owed_pay", factValue: "unpaid",
    sourceRefs: [] };

  const memoryState = { campaignId: input.campaignId,
    stateRevision: source.runtime.revision, generation: 1, overflow: false,
    aliases: [], uncovered: [], checkpoint: null,
    publicSummary: null, privateSummary: null };
  const memory = {
    read: async () => ({ currentBoundary: null }),
    source: async () => source,
    context: async () => memoryState,
    search: async (request) => ({ campaignId: input.campaignId, generation: 1,
      aliases: [], sources: request.visibility === "public" ? [publicEvidence] : [] }),
  };
  const publicTurn = { campaign_id: input.campaignId, id: input.operationId,
    status: "pending", canRetry: false };
  const checkpoint = { astraPrimary: { toolReceipts: [], finalProposal: null },
    checks: [], usage: [], narration: null };
  let failedStage, failedCode;
  const store = {
    begin: async () => publicTurn,
    claim: async () => ({ source, runtimeIdentity: "astra-primary-v1",
      lease: { campaignId: input.campaignId,
      operationId: input.operationId }, turn: { input, checkpoint, public: publicTurn,
      runtimeIdentity: "astra-primary-v1" } }),
    recordAstraTool: async () => assert.fail("no tool requested"),
    recordAstraStage: async (_lease, diagnostic) => { failedStage = diagnostic; },
    fail: async (_lease, code) => { failedCode = code;
      return { ...publicTurn, status: "failed" }; },
  };
  let captured;
  const provider = { next: async (context) => {
    captured = context;
    throw new Error("synthetic stop after context capture");
  }, narrate: async () => assert.fail("no narration requested") };
  const result = await runAstraTurn(input, { store, memory, provider,
    summaries: { summarize: async () => assert.fail("no summary requested") } });
  assert.equal(result.status, "failed");
  assert.ok(captured, `the real planner context reached the mocked provider: ${JSON.stringify({ failedStage, failedCode })}`);

  const instructions = captured.instructions;
  assert.match(instructions, /structured job contract exists.*job_reward/);
  assert.match(instructions, /legacy or informal mundane obligation.*already earned.*authoritative public campaign history/);
  assert.match(instructions, /no structured Quest\/reward record.*mundane_grant.*currently present owing NPC/);
  assert.match(instructions, /do not fabricate a Quest/);
  assert.match(instructions, /Never invent a reward or repeat an obligation.*already paid/);
  assert.match(instructions, /no Quest or currency definition exists yet/);
  assert.match(instructions, /Missing eligible rest supplies prevents formal recovery.*must not prevent a separately authorized reward settlement/);
  assert.match(instructions, /Lodging permission or refusal remains ordinary fiction.*morning.*future possibility.*mutual job agreement/);

  const packet = JSON.parse(captured.input);
  assert.ok(packet.originalScenes.some((scene) =>
    scene.id === sceneId && scene.body === owed),
  "the claimed debt is supplied as current public scene evidence");
  assert.ok(JSON.stringify(packet.memory).includes(owed),
    "the public historical obligation survives memory selection");
  assert.deepEqual(packet.astraPrimary.settlementAuthority.jobs, []);
  assert.deepEqual(packet.astraPrimary.settlementAuthority.existingCurrencies, []);
  assert.deepEqual(packet.astraPrimary.settlementAuthority.presentNpcIds, [npcId]);
  assert.deepEqual(packet.astraPrimary.mechanicsAuthority.itemIds, []);
});

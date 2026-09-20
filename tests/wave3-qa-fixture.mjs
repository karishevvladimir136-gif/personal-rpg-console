import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture as storageFixture } from "./phase35-storage-fixture.mjs";
import { configuredWorld } from "./wave1-integration-fixture.mjs";
import { resolveWorldLogic } from "../src/lib/rulesets/world-logic.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import { stageResolvedWorldTransition } from "../src/lib/world/resolver.ts";

// An override audits the Lead's additive migration without copying shared SQL.
// Every call creates only an in-memory, synthetic PGlite database.
export async function qaFixture() {
  const f = await storageFixture(11);
  await f.db.exec(
    await readFile(
      process.env.WAVE3_QA_MIGRATION ??
        new URL("../supabase/migrations/202609200012_production_wave3.sql", import.meta.url),
      "utf8",
    ),
  );
  const rpc = async (args) => {
    try {
      return {
        data: (
          await f.one("select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result", [
            args.p_owner_id,
            args.p_campaign_id,
            args.p_action,
            JSON.stringify(args.p_payload),
            JSON.stringify(args.p_timeline),
          ])
        ).result,
      };
    } catch (error) {
      return { error: { message: error.message, code: error.code } };
    }
  };
  const read = async (campaignId) => {
    const result = await rpc({
      p_owner_id: f.owner,
      p_campaign_id: campaignId,
      p_action: "read",
      p_payload: {},
      p_timeline: await f.fence(campaignId),
    });
    if (result.error) throw new Error(result.error.message);
    return result.data;
  };
  const foundationCommand = async (campaignId) => {
    const snapshot = await read(campaignId);
    return {
      operationId: randomUUID(),
      campaignId,
      timeline: snapshot.timeline,
      expectedRevision: snapshot.revision,
      expectedRuntimeRevision: snapshot.runtimeRevision,
      expectedHeadId: snapshot.headId,
    };
  };
  const write = async (campaignId, action, payload) => {
    const command = await foundationCommand(campaignId);
    const result = await rpc({
      p_owner_id: f.owner,
      p_campaign_id: campaignId,
      p_action: action,
      p_payload: { command, ...payload },
      p_timeline: command.timeline,
    });
    if (result.error) throw new Error(result.error.message);
    return result.data;
  };
  return { ...f, rpc, read, foundationCommand, write };
}

async function begin(f, w) {
  const snapshot = await f.read(w.cid);
  const input = {
    operationId: randomUUID(),
    campaignId: w.cid,
    timeline: snapshot.timeline,
    expectedRevision: snapshot.runtimeRevision,
    mode: "game",
    input: "Use the requested existing supplies, then wait briefly.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  await f.runtime(w.cid, "begin", input);
  const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
  const command = {
    operationId: input.operationId,
    campaignId: w.cid,
    timeline: snapshot.timeline,
    expectedRevision: snapshot.revision,
    expectedRuntimeRevision: snapshot.runtimeRevision,
    expectedHeadId: snapshot.headId,
  };
  return { snapshot, input, command, claim };
}

export async function resolverStage(f) {
  const w = await configuredWorld(f);
  w.state.actors[0].capabilities = ["world.condition.add:cold"];
  w.state.threads[0].steps[0].resolution = "resolver_required";
  w.state.threads[0].steps[0].consequences = [
    { kind: "condition.add", actorId: w.npc, condition: "cold" },
  ];
  await f.write(w.cid, "configure", { world: w.state });
  const turn = await begin(f, w);
  const resolution = {
    changes: [],
    worldMinutes: 20,
    configuration: turn.claim.source.runtime.configuration,
    outcomes: [],
  };
  const proposal = {
    schemaVersion: 1,
    decisions: [
      {
        threadId: w.state.threads[0].id,
        stepId: w.state.threads[0].steps[0].id,
        decision: "advance",
        uncertainty: "resolved",
        capabilityRefs: [`${w.npc}:world.condition.add:cold`],
        evidenceIndexes: [],
      },
    ],
  };
  const staged = stageResolvedWorldTransition(
    { ...turn, source: turn.claim.source, resolution, trigger: "time_skip" },
    proposal,
  );
  return { w, ...turn, resolution, proposal, staged };
}

export async function actionStage(f, kind = "inventory.consume") {
  const w = await configuredWorld(f);
  await f.one("update public.rpg_items set quantity=3,equipped_entity_id=null,equipped_slot=null where id=$1", [w.item]);
  await f.one("update public.rpg_entities set hp=null,max_hp=null,stats='{}' where id=$1", [w.hero]);
  await f.one("update rpg_private.runtime_state set configuration=null where campaign_id=$1", [w.cid]);
  w.state.threads = [];
  const effect = kind === "inventory.consume"
    ? { kind, actorId: w.hero, itemId: w.item, quantity: 1 }
    : { kind, actorId: w.hero, resource: "focus", amount: 1 };
  const capability = kind === "inventory.consume" ? `world.consume:${w.item}` : "world.spend:focus";
  w.state.actors.push({
    id: w.hero,
    entityId: w.hero,
    campaignId: w.cid,
    revision: 1,
    kind: "entity",
    control: "player",
    publicName: "Ari",
    locationId: w.location,
    capabilities: [capability],
    knowledge: [],
  });
  await f.write(w.cid, "configure", { world: w.state, ruleset: WORLD_LOGIC_REF });
  const turn = await begin(f, w);
  const proposal = {
    schemaVersion: 2,
    actorId: w.hero,
    input: turn.input.input,
    action: "attempt",
    outcome: "completed",
    uncertainty: "resolved",
    capabilityRefs: [capability],
    circumstanceRefs: ["public-state"],
    evidenceIndexes: [],
    publicText: "Model text is advisory.",
    elapsedMinutes: 1,
    destinationId: null,
    consequences: [effect],
  };
  const staged = resolveWorldLogic({ ...turn, source: turn.claim.source }, proposal);
  return { w, ...turn, proposal, staged, resolution: staged.resolution };
}

export async function checkpoint(f, prepared, overrides = {}) {
  await f.runtime(prepared.w.cid, "checkpoint", {
    ...prepared.claim.lease,
    checkpoint: {
      ...prepared.claim.turn.checkpoint,
      plan: {
        narration: "",
        checks: [],
        publicPatches: [],
        privatePatches: [],
        visualDescription: "",
        clarification: null,
        guidanceProposal: null,
      },
      resolution: prepared.resolution,
      ...overrides,
    },
    status: "generating",
  });
}

export async function stage(f, prepared, settlement = prepared.staged.settlement) {
  return f.rpc({
    p_owner_id: f.owner,
    p_campaign_id: prepared.w.cid,
    p_action: "stage",
    p_payload: { command: prepared.command, settlement },
    p_timeline: prepared.snapshot.timeline,
  });
}

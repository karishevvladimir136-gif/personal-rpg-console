import { fixture, world } from "./phase35-storage-fixture.mjs";
import { randomUUID } from "node:crypto";
import { makeSource, makePack } from "./wave1-library-fixtures.mjs";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
import { stageWorldTransition } from "../src/lib/world/stage.ts";

export async function waveFixture() {
  const f = await fixture();
  const library = async (args) => {
    try {
      return {
        data: (
          await f.one(
            "select public.rpg_library($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              args.p_owner_id,
              args.p_campaign_id,
              args.p_action,
              JSON.stringify(args.p_payload),
              args.p_timeline ? JSON.stringify(args.p_timeline) : null,
            ],
          )
        ).result,
      };
    } catch (e) {
      return { error: { message: e.message, code: e.code } };
    }
  };
  const rpc = async (args) => {
    try {
      return {
        data: (
          await f.one(
            "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              args.p_owner_id,
              args.p_campaign_id,
              args.p_action,
              JSON.stringify(args.p_payload),
              JSON.stringify(args.p_timeline),
            ],
          )
        ).result,
      };
    } catch (e) {
      return { error: { message: e.message, code: e.code } };
    }
  };
  const read = async (cid) =>
    (
      await rpc({
        p_owner_id: f.owner,
        p_campaign_id: cid,
        p_action: "read",
        p_payload: {},
        p_timeline: await f.fence(cid),
      })
    ).data;
  const command = async (cid) => {
    const s = await read(cid);
    return {
      operationId: randomUUID(),
      campaignId: cid,
      timeline: s.timeline,
      expectedRevision: s.revision,
      expectedRuntimeRevision: s.runtimeRevision,
      expectedHeadId: s.headId,
    };
  };
  const write = async (cid, action, payload) => {
    const cmd = await command(cid);
    const r = await rpc({
      p_owner_id: f.owner,
      p_campaign_id: cid,
      p_action: action,
      p_payload: { command: cmd, ...payload },
      p_timeline: cmd.timeline,
    });
    if (r.error) throw new Error(r.error.message);
    return r.data;
  };
  const seedLibrary = async () => {
    const store = createRpcLibraryStore(f.owner, library);
    const source = makeSource();
    source.ownerId = f.owner;
    const pack = makePack(source);
    pack.ownerId = f.owner;
    pack.body.approval.ownerId = f.owner;
    await store.put({ operationId: randomUUID(), record: source });
    await store.put({ operationId: randomUUID(), record: pack });
    return { source, pack, store };
  };
  return {
    ...f,
    library,
    rpc,
    read,
    foundationCommand: command,
    write,
    seedLibrary,
  };
}
export async function configuredWorld(f) {
  const w = await world(f);
  const aid = w.npc,
    tid = randomUUID(),
    stepId = randomUUID();
  const state = {
    schemaVersion: 1,
    campaignId: w.cid,
    policy: {
      simulation: true,
      autonomy: "moderate",
      deadlinePressure: "normal",
    },
    policyChangedAtWorldMinutes: 0,
    actors: [
      {
        id: aid,
        campaignId: w.cid,
        revision: 1,
        kind: "entity",
        entityId: w.npc,
        control: "autonomous",
        publicName: "Nera",
        locationId: w.location,
        capabilities: [],
        knowledge: [],
      },
    ],
    threads: [
      {
        id: tid,
        campaignId: w.cid,
        revision: 1,
        title: "Private harbor plan",
        publicTitle: null,
        actorIds: [aid],
        decisionActorIds: [aid],
        locationIds: [w.location],
        prerequisiteThreadIds: [],
        status: "active",
        cursor: 0,
        steps: [
          {
            id: stepId,
            trigger: {
              kind: "deadline",
              atWorldMinutes: 10,
              scenarioCritical: false,
              established: true,
            },
            resolution: "deterministic",
            consequence: "background",
            privateText: "PRIVATE_WAVE1_EVENT",
            evidence: [],
            publicOutcome: {
              text: "A bell rings.",
              actorIds: [aid],
              evidence: [],
            },
            warning: null,
            hookChanges: [],
          },
        ],
      },
    ],
    hooks: [],
    warnings: [],
  };
  await f.write(w.cid, "configure", { world: state });
  return { ...w, state };
}
export async function stage(f, w) {
  const snapshot = await f.read(w.cid);
  const input = {
    operationId: randomUUID(),
    campaignId: w.cid,
    expectedRevision: snapshot.runtimeRevision,
    mode: "game",
    input: "Wait a short while.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  await f.runtime(w.cid, "begin", input);
  const claim = await f.runtime(w.cid, "claim", {
    operationId: input.operationId,
  });
  await f.runtime(w.cid, "checkpoint", {
    ...claim.lease,
    checkpoint: claim.turn.checkpoint,
    status: "generating",
  });
  const resolution = {
    changes: [],
    worldMinutes: 20,
    configuration: claim.source.runtime.configuration,
    outcomes: [],
  };
  const command = {
    operationId: input.operationId,
    campaignId: w.cid,
    timeline: snapshot.timeline,
    expectedRevision: snapshot.revision,
    expectedRuntimeRevision: snapshot.runtimeRevision,
    expectedHeadId: snapshot.headId,
  };
  const proposal = stageWorldTransition({
    snapshot,
    command,
    source: claim.source,
    resolution,
    trigger: "time_skip",
  });
  if (proposal.status !== "staged") throw new Error(proposal.status);
  const response = await f.rpc({
    p_owner_id: f.owner,
    p_campaign_id: w.cid,
    p_action: "stage",
    p_payload: { command, settlement: proposal.settlement },
    p_timeline: snapshot.timeline,
  });
  if (response.error) throw new Error(response.error.message);
  await f.runtime(w.cid, "checkpoint", {
    ...claim.lease,
    checkpoint: {
      ...claim.turn.checkpoint,
      worldSettlement: proposal.settlement,
    },
    status: "generating",
  });
  const packet = {
    narration: "The harbor bell rings.",
    visualDescription: "",
    resolution,
    privatePatches: [],
    checks: [],
    guidanceProposal: null,
    worldSettlement: proposal.settlement,
  };
  return { snapshot, input, claim, packet, proposal, command };
}

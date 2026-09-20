import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fixture as oldFixture, world } from "./phase35-storage-fixture.mjs";
import { stageWorldTransition } from "../src/lib/world/stage.ts";

// Disposable synthetic database; the override permits review of Lead's checkpoint
// without copying or editing migration files owned by the integrator.
export async function fixture(beforeMigration) {
  const f = await oldFixture(9);
  if (beforeMigration) await beforeMigration(f);
  await f.db.exec(
    await readFile(
      process.env.WAVE1_QA_MIGRATION ??
        new URL(
          "../supabase/migrations/202609190010_production_wave1.sql",
          import.meta.url,
        ),
      "utf8",
    ),
  );
  const library = async (action, payload = {}, user = f.owner) =>
    (
      await f.one(
        "select public.rpg_library($1,null,$2,$3::jsonb,null) result",
        [user, action, JSON.stringify(payload)],
      )
    ).result;
  const foundation = async (
    cid,
    action = "read",
    payload = {},
    user = f.owner,
    timeline,
  ) =>
    (
      await f.one(
        "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [
          user,
          cid,
          action,
          JSON.stringify(payload),
          JSON.stringify(timeline ?? (await f.fence(cid))),
        ],
      )
    ).result;
  const command = async (cid, operationId = randomUUID()) => {
    const snapshot = await foundation(cid);
    return {
      operationId,
      campaignId: cid,
      timeline: snapshot.timeline,
      expectedRevision: snapshot.revision,
      expectedRuntimeRevision: snapshot.runtimeRevision,
      expectedHeadId: snapshot.headId,
    };
  };
  return { ...f, library, foundation, foundationCommand: command };
}
export function syntheticWorld(w) {
  return {
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
        id: w.npc,
        entityId: w.npc,
        campaignId: w.cid,
        revision: 1,
        kind: "entity",
        control: "autonomous",
        publicName: "Known Nera",
        locationId: w.location,
        capabilities: [],
        knowledge: [],
      },
    ],
    threads: [
      {
        id: randomUUID(),
        campaignId: w.cid,
        revision: 1,
        title: "QA_PRIVATE_THREAD",
        publicTitle: null,
        actorIds: [w.npc],
        decisionActorIds: [w.npc],
        locationIds: [w.location],
        prerequisiteThreadIds: [],
        status: "active",
        cursor: 0,
        steps: [
          {
            id: randomUUID(),
            trigger: {
              kind: "deadline",
              atWorldMinutes: 10,
              scenarioCritical: false,
              established: true,
            },
            resolution: "deterministic",
            consequence: "background",
            privateText: "QA_PRIVATE_EVENT",
            evidence: [],
            publicOutcome: {
              text: "Nera rings the harbor bell.",
              actorIds: [w.npc],
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
}
export async function setup(f, transform = () => {}) {
  const w = await world(f, "QA disposable world");
  const state = syntheticWorld(w);
  transform(state, w);
  const command = await f.foundationCommand(w.cid);
  await f.foundation(w.cid, "configure", { command, world: state });
  return { ...w, state };
}
export async function prepare(f, w, transform = () => {}) {
  const snapshot = await f.foundation(w.cid),
    operationId = randomUUID();
  await f.runtime(w.cid, "begin", {
    operationId,
    campaignId: w.cid,
    expectedRevision: snapshot.runtimeRevision,
    mode: "game",
    input: "Wait for the harbor bell.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  });
  const claim = await f.runtime(w.cid, "claim", { operationId });
  const resolution = {
    changes: [],
    worldMinutes: 20,
    configuration: claim.source.runtime.configuration,
    outcomes: [],
  };
  await f.runtime(w.cid, "checkpoint", {
    ...claim.lease,
    checkpoint: { ...claim.turn.checkpoint, resolution },
    status: "generating",
  });
  const command = await f.foundationCommand(w.cid, operationId);
  const input = {
    snapshot,
    command,
    source: claim.source,
    resolution,
    trigger: "time_skip",
  };
  transform(input);
  const result = stageWorldTransition(input);
  return { input, claim, command, result, resolution };
}
export async function stage(f, w, prepared) {
  const settlement = prepared.result.settlement;
  await f.foundation(w.cid, "stage", { command: prepared.command, settlement });
  await f.runtime(w.cid, "checkpoint", {
    ...prepared.claim.lease,
    checkpoint: {
      ...prepared.claim.turn.checkpoint,
      resolution: prepared.resolution,
      worldSettlement: settlement,
    },
    status: "generating",
  });
  return {
    narration: "The bell rings.",
    visualDescription: "",
    resolution: prepared.resolution,
    privatePatches: [],
    checks: [],
    guidanceProposal: null,
    worldSettlement: settlement,
  };
}

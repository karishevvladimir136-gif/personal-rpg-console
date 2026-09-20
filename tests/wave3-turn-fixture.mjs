import { randomUUID } from "node:crypto";
import { configuredWorld } from "./wave1-integration-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import {
  worldLogicTurnPreparer,
  worldTurnPreparer,
} from "../src/lib/production/turn-world.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import { consequenceCapability } from "../src/lib/world/consequences.ts";
import { stageResolvedWorldTransition } from "../src/lib/world/resolver.ts";

export async function consequenceWorld(f, resolver = false) {
  const w = await configuredWorld(f);
  await f.one(
    "update public.rpg_entities set hp=null,max_hp=null,stats='{}' where id=$1",
    [w.hero],
  );
  await f.one(
    "update public.rpg_items set quantity=3,equipped_entity_id=null,equipped_slot=null where id=$1",
    [w.item],
  );
  await f.one(
    "update rpg_private.runtime_state set configuration=null where campaign_id=$1",
    [w.cid],
  );
  w.destination = (
    await f.mutation("location.save", w.cid, {
      id: "00000000-0000-4000-8000-000000000101",
      name: "Harbor",
      description: "Known harbor",
      status: "known",
    })
  ).id;
  w.effects = resolver
    ? [
        {
          kind: "resource.spend",
          actorId: w.hero,
          resource: "focus",
          amount: 1,
        },
      ]
    : [
        {
          kind: "inventory.consume",
          actorId: w.hero,
          itemId: w.item,
          quantity: 1,
        },
        {
          kind: "resource.spend",
          actorId: w.hero,
          resource: "focus",
          amount: 1,
        },
        { kind: "condition.add", actorId: w.hero, condition: "wet" },
        { kind: "quest.complete", questId: w.quest },
        { kind: "fact.observe", family: "locations", recordId: w.location },
        {
          kind: "actor.relocate",
          actorId: w.npc,
          fromLocationId: w.location,
          toLocationId: w.destination,
        },
      ];
  w.state.actors.push({
    id: w.hero,
    campaignId: w.cid,
    revision: 1,
    kind: "entity",
    entityId: w.hero,
    control: "player",
    publicName: "Ari",
    locationId: w.location,
    capabilities: w.effects.map(consequenceCapability),
    knowledge: [],
  });
  if (resolver) {
    w.resolverEffects = [
      { kind: "condition.add", actorId: w.npc, condition: "cold" },
    ];
    w.state.actors[0].capabilities = w.resolverEffects.map(
      consequenceCapability,
    );
    w.state.threads[0].steps[0].resolution = "resolver_required";
    w.state.threads[0].steps[0].consequences = w.resolverEffects;
  } else w.state.threads = [];
  await f.write(w.cid, "configure", {
    world: w.state,
    ruleset: WORLD_LOGIC_REF,
  });
  return w;
}
export async function consequenceDependencies(f, w, options = {}) {
  const fence = await f.fence(w.cid),
    errors = [],
    calls = { action: 0, resolver: 0, narration: 0 };
  const rpc = async (args) => {
    try {
      return {
        data: await f.runtime(
          args.p_campaign_id,
          args.p_action,
          args.p_payload,
          args.p_timeline,
        ),
      };
    } catch (e) {
      errors.push({
        action: args.p_action,
        message: e.message,
        where: e.where,
      });
      return { data: null, error: { message: e.message, code: e.code } };
    }
  };
  const worldRpc = async (args) => {
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
      errors.push({
        action: args.p_action,
        message: e.message,
        where: e.where,
      });
      return { data: null, error: { message: e.message, code: e.code } };
    }
  };
  const usage = {
    model: "gpt-6-astra",
    inputTokens: 1,
    outputTokens: 1,
    latencyMs: 0,
  };
  const worldOptions = {
    action: async (input) => {
      calls.action++;
      return {
        output: {
          schemaVersion: 2,
          actorId: w.hero,
          input: input.input.input,
          action: "attempt",
          outcome: "completed",
          uncertainty: "resolved",
          capabilityRefs: w.effects.map(consequenceCapability),
          circumstanceRefs: ["public-state"],
          evidenceIndexes: [],
          publicText: "Model text cannot grant authority.",
          elapsedMinutes: 20,
          destinationId: null,
          consequences: w.effects,
        },
        usage,
      };
    },
    resolve: async (input) => {
      calls.resolver++;
      return {
        result: stageResolvedWorldTransition(input, {
          schemaVersion: 1,
          decisions: [
            {
              threadId: w.state.threads[0].id,
              stepId: w.state.threads[0].steps[0].id,
              decision: "advance",
              uncertainty: "resolved",
              capabilityRefs: w.resolverEffects.map(
                (e) => `${w.npc}:${consequenceCapability(e)}`,
              ),
              evidenceIndexes: [],
            },
          ],
        }),
        usage,
      };
    },
  };
  const store = createRpcTurnStore(f.owner, rpc, "gpt-6-astra", fence);
  const deps = {
    store,
    prepareWorldLogic: worldLogicTurnPreparer(worldRpc, worldOptions),
    prepareWorld: worldTurnPreparer(worldRpc, worldOptions),
    provider: {
      plan: async () => {
        throw Error("No legacy mechanics");
      },
      feedback: async () => {
        throw Error("No feedback");
      },
      narrate: async () => {
        calls.narration++;
        if (options.failNarration) throw { code: "provider", retryable: true };
        return {
          output: {
            narration: "The requested action settles.",
            visualDescription: "",
            clarification: null,
          },
          usage,
        };
      },
    },
  };
  return {
    deps,
    calls,
    errors,
    input: {
      operationId: randomUUID(),
      campaignId: w.cid,
      timeline: fence,
      expectedRevision: (await f.read(w.cid)).runtimeRevision,
      mode: "game",
      input: "I use my supplies and established abilities at the crossing.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    },
  };
}

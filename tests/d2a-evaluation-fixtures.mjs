// Frozen synthetic Stage 1.1 fixtures. No credentials, live transport or auto-approval.
// Approval/continuation below belong only to deterministic preflight tests.
import { randomUUID } from "node:crypto";
import {
  integrationFixture,
  moduleFromSource,
  providerResponse,
} from "./d2a-integration-fixture.mjs";
import { makeSource, makePack, evidence } from "./wave1-library-fixtures.mjs";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { buildCampaignBinding } from "../src/lib/world-packs/bindings.ts";

export const evaluationSelection = Object.freeze({
  providerId: "openai",
  modelId: "gpt-5.4",
  reasoning: "high",
});
export const evaluationInputCeiling = 20000;
export const evaluationCases = Object.freeze([
  {
    name: "harbor",
    language: "en",
    calls: [1, 2],
    premise:
      "What if council marshal Mara keeps the eastern gate open through the next hour despite the pending Harbor Guild petition? The western quay, stocks, prior history, established capabilities and the player-controlled visitor stay unchanged. Only the autonomous harbor patrol may respond. Start at this checkpoint and explore 60 minutes.",
    actor: "Council marshal Mara",
    location: "Western quay",
    destination: "Eastern gate",
    thread: "Harbor patrol",
    horizon: 60,
  },
  {
    name: "polar",
    language: "ru",
    calls: [3, 4, 5],
    premise:
      "Что, если начальница направит уже существующую ремонтную группу к восточному складу до полудня? Прежние события и запасы до отправления не меняются. Исследовать ближайшие два часа.",
    actor: "Ремонтная группа",
    location: "Полярная станция",
    destination: "Восточный склад",
    thread: "Ремонт склада до полудня",
    horizon: 120,
  },
  {
    name: "temporal",
    language: "en",
    calls: [6, 7],
    premise:
      "What if Robb postpones the feast and sends the courier to the eastern gate? Everything before this moment remains unchanged. This is an explicitly synthetic pre-feast checkpoint, not an import of a book or real campaign. Explore the next hour.",
    actor: "Existing courier",
    location: "Pre-feast courtyard",
    destination: "Eastern gate",
    thread: "Courier patrol",
    horizon: 60,
  },
  {
    name: "ambiguous",
    language: "ru",
    calls: [8],
    premise: "Что, если она передумает до встречи?",
    actor: "Мария",
    location: "Западный зал",
    destination: "Восточный зал",
    thread: "Встреча Марии",
    horizon: 60,
  },
]);

export async function evaluationFixture(spec) {
  let destination;
  const f = await integrationFixture({
    language: spec.language,
    withFoundationDefinitions: true,
    transformWorld(world) {
      world.actors[0].publicName = spec.actor;
      if (spec.name !== "polar") world.actors[0].capabilities = [];
      world.actors[1].publicName = spec.location;
      world.threads[0].publicTitle = spec.thread;
      for (const step of world.threads[0].steps)
        step.publicOutcome.text =
          spec.language === "ru"
            ? "Группа выполняет установленную задачу."
            : "The patrol performs its established task.";
    },
    async beforeSave(base) {
      const location = await base.one(
        "select * from public.rpg_locations where id=$1",
        [base.location],
      );
      await base.mutation(
        "location.save",
        base.cid,
        {
          id: location.id,
          name: spec.location,
          description: "Known starting point on the established public route.",
          status: location.status,
        },
        location.revision,
      );
      destination = (
        await base.mutation("location.save", base.cid, {
          name: spec.destination,
          description:
            "Known destination connected by an established public route.",
          status: "known",
        })
      ).id;
      const quest = await base.one(
        "select * from public.rpg_quests where id=$1",
        [base.quest],
      );
      await base.mutation(
        "quest.save",
        base.cid,
        {
          id: quest.id,
          title:
            spec.name === "harbor"
              ? "Pending Harbor Guild petition"
              : spec.thread,
          description: "An established public objective, not yet resolved.",
          status: "open",
        },
        quest.revision,
      );
      const npc = await base.one(
        "select * from public.rpg_entities where id=$1",
        [base.npc],
      );
      await base.mutation(
        "entity.save",
        base.cid,
        {
          id: npc.id,
          kind: npc.kind,
          name: spec.actor,
          details: "An established autonomous actor; no new powers.",
          hp: npc.hp,
          max_hp: npc.max_hp,
          stats: npc.stats,
          resources: npc.resources,
          conditions: npc.conditions,
          equipment_slots: npc.equipment_slots,
        },
        npc.revision,
      );
      const snapshot = await base.foundation(),
        world = structuredClone(snapshot.world);
      if (spec.name !== "polar")
        world.actors[0].capabilities = [
          `world.relocate:${base.npc}:${destination}`,
          `world.observe:quests:${base.quest}`,
        ];
      world.actors.push({
        id: destination,
        campaignId: base.cid,
        revision: 1,
        kind: "location",
        entityId: null,
        control: "autonomous",
        publicName: spec.destination,
        locationId: null,
        capabilities: [],
        knowledge: [],
      });
      world.actors.find((a) => a.id === base.hero).publicName =
        spec.language === "ru"
          ? "Персонаж игрока"
          : "Ari — player-controlled visitor";
      world.threads[0].locationIds = [base.location, destination];
      if (spec.name === "harbor")
        world.actors.push({
          id: randomUUID(),
          campaignId: base.cid,
          revision: 1,
          kind: "faction",
          entityId: null,
          control: "autonomous",
          publicName: "Harbor Guild",
          locationId: base.location,
          capabilities: [],
          knowledge: [],
        });
      if (spec.name !== "harbor") {
        const name =
          spec.name === "temporal"
            ? "Robb Stark"
            : spec.name === "polar"
              ? "Начальница станции"
              : "Анна";
        const actorId = (
          await base.mutation("entity.save", base.cid, {
            kind: npc.kind,
            name,
            details: "Existing synthetic autonomous actor.",
            hp: npc.hp,
            max_hp: npc.max_hp,
            stats: npc.stats,
            resources: {},
            conditions: [],
            equipment_slots: npc.equipment_slots,
          })
        ).id;
        world.actors.push({
          id: actorId,
          campaignId: base.cid,
          revision: 1,
          kind: "entity",
          entityId: actorId,
          control: "autonomous",
          publicName: name,
          locationId: base.location,
          capabilities: [],
          knowledge: [],
        });
        if (spec.name === "ambiguous")
          world.threads.push({
            ...structuredClone(world.threads[0]),
            id: randomUUID(),
            title: "PRIVATE_SECOND_MEETING",
            publicTitle: "Встреча Анны",
            actorIds: [actorId],
            decisionActorIds: [actorId],
            locationIds: [destination],
            steps: world.threads[0].steps.map((s) => ({
              ...s,
              id: randomUUID(),
              publicOutcome: { ...s.publicOutcome, actorIds: [actorId] },
            })),
          });
      }
      const current = await base.foundation();
      await base.foundation("configure", {
        command: {
          operationId: randomUUID(),
          campaignId: base.cid,
          timeline: current.timeline,
          expectedRevision: current.revision,
          expectedRuntimeRevision: current.runtimeRevision,
          expectedHeadId: current.headId,
        },
        world,
      });
      await base.one(
        "update rpg_private.memory_public_sources set known_by=$3::uuid[],statement_kind='fact',authority='state',valid_from=null,valid_to=null,source_refs='[]' where campaign_id=$1 and source_id=any($2::uuid[]) and current",
        [base.cid, [destination, base.quest, base.location], [base.npc]],
      );
      if (spec.name === "temporal") {
        // Short invented reference; no external text or source research.
        const text =
          "In this synthetic reference, a later betrayal is FUTURE_EVAL_CANARY. It has not happened at entry and is not known to the courier.";
        const source = makeSource({
          title: "Synthetic future reference",
          original: { kind: "text", text },
          digest: sha256(text),
        });
        source.ownerId = base.owner;
        const pack = makePack(source);
        pack.ownerId = base.owner;
        pack.body.approval.ownerId = base.owner;
        pack.body.title = "Synthetic pre-feast basis";
        pack.body.entities[0].name = "Robb Stark";
        Object.assign(pack.body.claims[0], {
          text,
          knowledge: "future_source",
          validFrom: 600,
          knownByEntityIds: [],
          evidence: [
            evidence(source, {
              knowledge: "future_source",
              locator: { kind: "text", value: `0:${text.length}` },
            }),
          ],
        });
        await base.library(source);
        await base.library(pack);
        const binding = buildCampaignBinding({
          id: randomUUID(),
          campaignId: base.cid,
          ownerId: base.owner,
          pack,
          entry: {
            label: "Synthetic pre-feast checkpoint",
            worldMinutes: 0,
            evidence: [],
          },
          sourcePriority: pack.body.sourcePriority,
          allocateEntityId: () =>
            world.actors.find((a) => a.publicName === "Robb Stark").id,
        });
        const bound = await base.foundation();
        await base.foundation("bind", {
          command: {
            operationId: randomUUID(),
            campaignId: base.cid,
            timeline: bound.timeline,
            expectedRevision: bound.revision,
            expectedRuntimeRevision: bound.runtimeRevision,
            expectedHeadId: bound.headId,
          },
          binding,
        });
      }
    },
  });
  const proposal = structuredClone(f.proposal);
  Object.assign(proposal, {
    title: spec.thread,
    changeDescription: spec.premise,
    divergenceType: "actor_intent",
    locationIndex: f.prepared.choices.locations.findIndex(
      (l) => l.id === (spec.name === "polar" ? f.location : destination),
    ),
    horizonMinutes: spec.horizon,
    statements: [],
    assumptions: [
      "Only the requested intent changes in this NON-CANON branch.",
    ],
    unchangedBaseline: [
      "Earlier history, stocks, capabilities and controlled-player agency remain unchanged.",
    ],
    ambiguities:
      spec.name === "ambiguous"
        ? [
            {
              question: "Кто передумает, о чём и до какой встречи?",
              consequential: true,
            },
          ]
        : [],
  });
  const { createComposerProvider } = await moduleFromSource(
    "src/lib/server/world-lab/composer-provider.ts",
  );
  const { createWorldResolverProvider } = await moduleFromSource(
    "src/lib/server/world/resolver-provider.ts",
  );
  const { createLabService } = await moduleFromSource(
    "src/lib/world-lab/service.ts",
  );
  const { createLabAuthoringService } = await moduleFromSource(
    "src/lib/world-lab/authoring.ts",
  );
  const { createRpcLibraryStore } = await moduleFromSource(
    "src/lib/world-library/store.ts",
  );
  // Caller supplies a scripted transport for preflight. This factory never reads a key.
  async function services(fetcher) {
    const library = createRpcLibraryStore(f.owner, async (args) => {
      try {
        return {
          data: (
            await f.one(
              "select public.rpg_library($1,null,$2,$3::jsonb,null) result",
              [args.p_owner_id, args.p_action, JSON.stringify(args.p_payload)],
            )
          ).result,
        };
      } catch (error) {
        return { error: { code: error.code, message: error.message } };
      }
    });
    const lab = createLabService(f.owner, f.rpc, spec.language, {
      resolver: (profile) =>
        createWorldResolverProvider({
          apiKey: "SYNTHETIC_PREFLIGHT_ONLY",
          model: profile.modelId,
          reasoning: profile.reasoning,
          fetcher,
        }),
    });
    const authoring = createLabAuthoringService({
      ownerId: f.owner,
      execute: f.rpc,
      library,
      lab,
      language: spec.language,
      models: [
        {
          modelId: "gpt-5.4",
          label: "GPT-5.4",
          reasoning: ["high"],
          available: true,
        },
      ],
      compose: (metadata) =>
        createComposerProvider({
          apiKey: "SYNTHETIC_PREFLIGHT_ONLY",
          model: metadata.composeProfile.modelId,
          reasoning: metadata.composeProfile.reasoning,
          fetcher,
        })(metadata),
    });
    return { lab, authoring };
  }
  function scriptedOutput(body, index) {
    const data = JSON.parse(body.input);
    if (!data.candidates)
      return providerResponse(proposal, "gpt-5.4-2026-03-05");
    const decisions = data.candidates.map((c) => {
      const chosen = c.consequenceOptions.filter((o) =>
        spec.name === "polar"
          ? [
              "inventory.consume",
              "resource.spend",
              index === 1 ? "condition.add" : "condition.remove",
            ].includes(o.effect.kind)
          : ["actor.relocate", "fact.observe"].includes(o.effect.kind),
      );
      return {
        threadId: c.threadId,
        stepId: c.stepId,
        decision: "advance",
        uncertainty: "resolved",
        capabilityRefs: [...new Set(chosen.map((o) => o.capabilityRef))],
        evidenceIndexes: c.evidence.map((_, i) => i),
        consequences: chosen.map((o) => ({
          ...o.effect,
          ...(o.effect.kind === "inventory.consume"
            ? { quantity: index === 1 ? 2 : 1 }
            : o.effect.kind === "resource.spend"
              ? { amount: index === 1 ? 2 : 1 }
              : {}),
        })),
      };
    });
    return providerResponse(
      { schemaVersion: 2, decisions },
      "gpt-5.4-2026-03-05",
    );
  }
  return { ...f, spec, destination, services, scriptedOutput };
}

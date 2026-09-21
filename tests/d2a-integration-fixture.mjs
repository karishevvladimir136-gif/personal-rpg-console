import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

// A local source checkout override only; never reads application credentials or
// contacts a hosted database. Every fixture starts a disposable in-memory DB.
const override = process.env.D2A_SOURCE_ROOT ?? process.env.D2A_QA_SOURCE_ROOT;
export const sourceRoot = override
  ? pathToFileURL(`${override.replaceAll("\\", "/").replace(/\/$/, "")}/`)
  : new URL("../", import.meta.url);
export const moduleFromSource = (path) =>
  import(new URL(path, sourceRoot).href);
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const [composerModule, resolverModule] = await Promise.all([
  moduleFromSource("src/lib/server/world-lab/composer-provider.ts"),
  moduleFromSource("src/lib/server/world/resolver-provider.ts"),
]);
hook.deregister();

export const command = (run) => ({
  operationId: randomUUID(),
  campaignId: run.campaignId,
  runId: run.id,
  expectedRevision: run.revision,
});

export function providerResponse(output, model = "gpt-6-astra") {
  return new Response(
    JSON.stringify({
      status: "completed",
      model,
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 111, output_tokens: 33 },
    }),
    { status: 200 },
  );
}

export function scriptedTransport(composeProposal, options = {}) {
  const requests = [];
  const fetcher = async (url, init) => {
    assert.equal(String(url), "https://api.openai.com/v1/responses");
    const body = JSON.parse(init.body),
      data = JSON.parse(body.input);
    assert.equal(body.model, "gpt-6-astra");
    assert.equal(body.reasoning.effort, "max");
    assert.equal(body.text.format.strict, true);
    assert.equal(body.store, false);
    assert.equal(body.truncation, "disabled");
    assert.equal(Object.hasOwn(body, "tools"), false);
    const kind = Array.isArray(data.candidates) ? "resolve" : "compose";
    const call = {
      kind,
      body,
      data,
      index: requests.filter((r) => r.kind === kind).length,
    };
    requests.push(call);
    if (options.respond) return options.respond(call);
    if (kind === "compose") return providerResponse(composeProposal);
    const decisions = data.candidates.map((candidate) => {
      const chosen = candidate.consequenceOptions.filter((o) =>
        [
          "inventory.consume",
          "resource.spend",
          "condition.add",
          "condition.remove",
        ].includes(o.effect.kind),
      );
      const consequences = chosen.map((option) => {
        const effect = structuredClone(option.effect);
        if (effect.kind === "inventory.consume")
          effect.quantity = call.index === 0 ? 2 : 1;
        if (effect.kind === "resource.spend")
          effect.amount = call.index === 0 ? 2 : 1;
        return effect;
      });
      return {
        threadId: candidate.threadId,
        stepId: candidate.stepId,
        decision: "advance",
        uncertainty: "resolved",
        consequences,
        capabilityRefs: [...new Set(chosen.map((o) => o.capabilityRef))],
        evidenceIndexes: candidate.evidence.map((_, index) => index),
      };
    });
    return providerResponse({ schemaVersion: 2, decisions });
  };
  return {
    requests,
    fetcher,
    composer(profile) {
      return composerModule.createComposerProvider({
        apiKey: "SYNTHETIC_TEST_ONLY",
        model: profile.modelId,
        reasoning: profile.reasoning,
        fetcher,
      });
    },
    resolver(profile) {
      return resolverModule.createWorldResolverProvider({
        apiKey: "SYNTHETIC_TEST_ONLY",
        model: profile.modelId,
        reasoning: profile.reasoning,
        fetcher,
      });
    },
  };
}

export async function integrationFixture(options = {}) {
  const { d2aFixture } = await moduleFromSource("tests/d2a-sql-fixture.mjs");
  const f = await d2aFixture();
  try {
    const npc = await f.one("select * from public.rpg_entities where id=$1", [
      f.npc,
    ]);
    await f.mutation(
      "entity.save",
      f.cid,
      {
        id: npc.id,
        kind: npc.kind,
        name: npc.name,
        details: npc.details,
        hp: npc.hp,
        max_hp: npc.max_hp,
        stats: npc.stats,
        resources: { focus: 6 },
        conditions: [],
        equipment_slots: npc.equipment_slots,
      },
      npc.revision,
    );
    const pack = (
      await f.mutation("storage.save", f.cid, {
        name: "Nera supplies",
        kind: "companion",
        entity_id: f.npc,
      })
    ).id;
    const supplies = (
      await f.mutation("item.save", f.cid, {
        name: "Dry crossing supplies",
        category: "supply",
        quantity: 10,
        description: "Synthetic supplies owned by Nera",
        mechanics: "",
        owner_entity_id: f.npc,
        storage_id: pack,
        equipped_entity_id: null,
        equipped_slot: null,
      })
    ).id;
    const world = structuredClone(f.worldState);
    world.actors.push({
      id: f.location,
      campaignId: f.cid,
      revision: 1,
      kind: "location",
      entityId: null,
      control: "autonomous",
      publicName: "Old bridge",
      locationId: null,
      capabilities: [],
      knowledge: [],
    });
    world.actors[0].capabilities = [
      `world.consume:${supplies}`,
      "world.spend:focus",
      "world.condition.add:wet",
      "world.condition.remove:wet",
    ];
    world.threads[0].publicTitle = "Nera's crossing";
    if (options.transformWorld) options.transformWorld(world, f);
    const foundation = await f.foundation();
    await f.foundation("configure", {
      command: {
        operationId: randomUUID(),
        campaignId: f.cid,
        timeline: foundation.timeline,
        expectedRevision: foundation.revision,
        expectedRuntimeRevision: foundation.runtimeRevision,
        expectedHeadId: foundation.headId,
      },
      world,
    });
    if (options.withFoundationDefinitions) {
      const { readFoundationLoop, loopCommand, createLoopStore } =
        await moduleFromSource("src/lib/foundation-loop/authority.ts");
      const { planCommerceConfiguration } = await moduleFromSource(
        "src/lib/foundation-loop/configuration.ts",
      );
      const { planProgressionDefinitions } = await moduleFromSource(
        "src/lib/progression/index.ts",
      );
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
        } catch (error) {
          return { error: { message: error.message, code: error.code } };
        }
      };
      const loop = createLoopStore(rpc, f.owner, f.cid);
      for (const [kind, input, planner] of [
        [
          "commerce.configure",
          {
            currencies: [
              {
                id: "credits",
                label: "Credits",
                resourceKey: "credits",
                version: 1,
              },
            ],
            itemPolicies: [
              {
                itemId: supplies,
                version: 1,
                currencyId: "credits",
                unitValue: 3,
                trade: "allowed",
                origin: "legitimate",
                visibility: "public",
              },
            ],
            merchants: [],
          },
          planCommerceConfiguration,
        ],
        [
          "progression.configure",
          {
            progression: "on",
            tracks: [
              {
                id: "experience",
                version: 1,
                label: "Experience",
                kind: "generic",
                thresholds: [10, 20],
                choices: [
                  { id: "scout", label: "Scouting", capability: "Scouting" },
                ],
              },
            ],
            rewards: [
              {
                id: "crossing",
                version: 1,
                label: "Existing crossing reward",
                source: { kind: "quest", id: f.quest },
                distribution: "actor",
                recipientIds: [f.hero],
                entries: [
                  { kind: "progression", trackId: "experience", amount: 1 },
                ],
              },
            ],
          },
          planProgressionDefinitions,
        ],
      ]) {
        const context = await readFoundationLoop(
          rpc,
          f.owner,
          f.cid,
          await f.fence(f.cid),
        );
        const bound = loopCommand(context, randomUUID());
        const plan = planner(context, bound, input);
        await loop.commit({ command: bound, kind, input }, plan);
        Object.assign(world, structuredClone(plan.world));
      }
    }
    if (options.beforeSave) await options.beforeSave(f);
    await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "D2A exact typed base" }),
    );
    const save = await f.one(
      "select * from rpg_private.save_points where campaign_id=$1 and name='D2A exact typed base' order by created_at desc limit 1",
      [f.cid],
    );
    const rawBasis = (
      await f.one("select rpg_private.lab_composition_base($1,$2,$3) result", [
        f.owner,
        f.cid,
        save.id,
      ])
    ).result;
    const { readDetachedState } = await moduleFromSource(
      "src/lib/saves/detached-reader.ts",
    );
    const {
      buildCompositionBasis,
      requestCompositionPlan,
      recordCompositionPlan,
      approveCompositionPlan,
    } = await moduleFromSource("src/lib/world-lab/composition.ts");
    const { resolveExecutionProfile } = await moduleFromSource(
      "src/lib/model-runtime/registry.ts",
    );
    const state = readDetachedState(rawBasis.state, {
      ownerId: f.owner,
      campaignId: f.cid,
    });
    const prepared = buildCompositionBasis({ ...rawBasis, state });
    const profile = (task) =>
      resolveExecutionProfile({
        task,
        profileId: randomUUID(),
        globalDefault: {
          providerId: "openai",
          modelId: "gpt-6-astra",
          reasoning: "max",
        },
      });
    const simulationProfile = profile("world.resolve"),
      composeProfile = profile("world.compose");
    const requested = requestCompositionPlan({
      ...prepared,
      operationId: randomUUID(),
      premise:
        "What if rain forced Nera to spend supplies crossing the harbor, then dry off afterward?",
      language: options.language ?? "en",
      composeProfile,
      simulationProfile,
    });
    const proposal = {
      schemaVersion: 1,
      title: "Rain at the crossing",
      changeDescription:
        "Rain changes Nera's crossing; existing supplies and focus support preparation and recovery.",
      divergenceType: "circumstance",
      timingText: "At the saved checkpoint",
      offsetMinutes: 0,
      locationIndex: prepared.choices.locations.findIndex(
        (l) => l.id === f.location,
      ),
      affectedActorIndexes: [
        prepared.choices.actors.findIndex((a) => a.id === f.npc),
      ],
      affectedThreadIndexes: [
        prepared.choices.threads.findIndex((t) => t.id === world.threads[0].id),
      ],
      assumptions: [
        "Rain is a hypothetical owner assumption in this NON-CANON branch.",
      ],
      constraints: ["No player action, new capabilities or resource gains."],
      unchangedBaseline: [
        "Existing ownership, actor capabilities and thread times are unchanged.",
      ],
      horizonMinutes: 120,
      policy: structuredClone(world.policy),
      ambiguities: [],
      statements: [
        {
          text: "Rain is proposed for this branch.",
          origin: "owner_assumption",
          knowledge: "owner_assumption",
          evidenceIndexes: [],
          actorIndexes: [],
          uncertainty: "Awaiting owner review.",
        },
      ],
    };
    const transport = scriptedTransport(proposal, options.transport ?? {});
    const version = (kind, body, previous = null) => ({
      schemaVersion: 1,
      ownerId: f.owner,
      kind,
      id: previous?.id ?? randomUUID(),
      versionId: randomUUID(),
      version: (previous?.version ?? 0) + 1,
      previousVersionId: previous?.versionId ?? null,
      body,
    });
    const requestedRecord = version("scenario", requested);
    async function approve() {
      await f.library(requestedRecord);
      const response = await transport.composer(composeProfile)(
        requested.composition,
      );
      const review = recordCompositionPlan(
        requested,
        response.output,
        response.usage,
      );
      const reviewRecord = version("scenario", review, requestedRecord);
      await f.library(reviewRecord);
      const approvedVersionId = randomUUID();
      const approved = approveCompositionPlan(review, {
        basis: prepared.basis,
        ownerId: f.owner,
        scenarioVersionId: approvedVersionId,
        allocateId: randomUUID,
      });
      const scenario = {
        ...version("scenario", approved.scenario, reviewRecord),
        versionId: approvedVersionId,
      };
      const divergence = version("divergence", approved.divergence);
      await f.library(scenario);
      await f.library(divergence);
      const request = {
        operationId: randomUUID(),
        campaignId: f.cid,
        saveId: save.id,
        scenarioVersionId: scenario.versionId,
        divergenceVersionId: divergence.versionId,
        label: "Scripted rain simulation",
        horizonMinutes: 120,
      };
      return { scenario, divergence, request, requestedRecord, reviewRecord };
    }
    async function services({
      rpc = f.rpc,
      selectedTransport = transport,
    } = {}) {
      const { createLabService } = await moduleFromSource(
        "src/lib/world-lab/service.ts",
      );
      const { createLabAuthoringService } = await moduleFromSource(
        "src/lib/world-lab/authoring.ts",
      );
      const { createRpcLibraryStore } = await moduleFromSource(
        "src/lib/world-library/store.ts",
      );
      const library = createRpcLibraryStore(f.owner, async (args) => {
        try {
          return {
            data: (
              await f.one(
                "select public.rpg_library($1,null,$2,$3::jsonb,null) result",
                [
                  args.p_owner_id,
                  args.p_action,
                  JSON.stringify(args.p_payload),
                ],
              )
            ).result,
          };
        } catch (error) {
          return {
            data: null,
            error: { message: error.message, code: error.code },
          };
        }
      });
      const lab = createLabService(f.owner, rpc, options.language ?? "en", {
        resolver: (profile) => selectedTransport.resolver(profile),
      });
      const authoring = createLabAuthoringService({
        ownerId: f.owner,
        execute: rpc,
        library,
        lab,
        language: options.language ?? "en",
        models: [
          {
            modelId: "gpt-6-astra",
            label: "Astra",
            reasoning: ["max"],
            available: true,
          },
        ],
        compose: (metadata) =>
          selectedTransport.composer(metadata.composeProfile)(metadata),
      });
      return { lab, authoring, library };
    }
    return {
      ...f,
      worldState: world,
      supplies,
      pack,
      save,
      rawBasis,
      prepared,
      composeProfile,
      simulationProfile,
      requested,
      proposal,
      transport,
      approve,
      services,
    };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

export async function durableState(f) {
  return f.one(
    `select
    (select count(*)::integer from rpg_private.timeline_versions where campaign_id=$1) versions,
    (select count(*)::integer from rpg_private.timeline_manifests where campaign_id=$1) manifests,
    (select jsonb_agg(to_jsonb(r) order by r.id) from rpg_private.world_lab_runs r where campaign_id=$1) runs,
    (select jsonb_agg(to_jsonb(c) order by c.operation_id,c.stage) from rpg_private.world_lab_commands c where campaign_id=$1) receipts`,
    [f.cid],
  );
}

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { pendingOperation } from "./d2a-qa-operation-fixture.mjs";
import { leafRoot, moduleFromSource } from "./d2a-qa-fixture.mjs";

const { durableState, providerResponse } = await import(
  new URL(
    "tests/d2a-integration-fixture.mjs",
    leafRoot("D2A_INTEGRATION_SOURCE_ROOT"),
  ).href
);
const { liveProjection } = await moduleFromSource("tests/d1-qa-fixture.mjs");
const { stageLabSimulation } = await moduleFromSource(
  "src/lib/world-lab/simulation.ts",
);
const { buildDetachedWorldCommit } = await moduleFromSource(
  "src/lib/world-lab/writer.ts",
);

async function knowledgeRun(mode = "positive") {
  let destination;
  const f = await pendingOperation({
    beforeSave: async (f) => {
      destination = (
        await f.mutation("location.save", f.cid, {
          name: "Known high ground",
          description: "SYNTHETIC_POSITIVE_LOCATION_FACT",
          status: "known",
        })
      ).id;
      const snapshot = await f.foundation();
      const world = structuredClone(snapshot.world);
      world.actors
        .find((a) => a.id === f.npc)
        .capabilities.push(
          `world.relocate:${f.npc}:${destination}`,
          `world.observe:quests:${f.quest}`,
        );
      await f.foundation("configure", {
        command: {
          operationId: randomUUID(),
          campaignId: f.cid,
          timeline: snapshot.timeline,
          expectedRevision: snapshot.revision,
          expectedRuntimeRevision: snapshot.runtimeRevision,
          expectedHeadId: snapshot.headId,
        },
        world,
      });
      await f.one(
        "update rpg_private.memory_public_sources set known_by=$3::uuid[],statement_kind='fact',authority='state',valid_from=null,valid_to=null,source_refs='[]' where campaign_id=$1 and source_id=any($2::uuid[]) and current",
        [f.cid, [destination, f.quest], [f.npc]],
      );
      if (mode === "unknown" || mode === "wrong_actor")
        await f.one(
          "update rpg_private.memory_public_sources set known_by=$3::uuid[] where campaign_id=$1 and source_id=any($2::uuid[])",
          [f.cid, [destination, f.quest], mode === "unknown" ? [] : [f.hero]],
        );
      if (mode === "future")
        await f.one(
          "update rpg_private.memory_public_sources set valid_from=61 where campaign_id=$1 and source_id=any($2::uuid[])",
          [f.cid, [destination, f.quest]],
        );
      if (mode === "restricted") {
        await f.one(
          "insert into rpg_private.memory_restrictions(campaign_id,kind,source_id) values($1,'location',$2),($1,'quest',$3)",
          [f.cid, destination, f.quest],
        );
      }
      if (mode === "indirect")
        await f.one(
          "update rpg_private.memory_public_sources set known_by=$2::uuid[],statement_kind='fact',authority='state' where campaign_id=$1 and source_id=$3 and current",
          [f.cid, [f.npc], f.npc],
        );
      if (mode === "indirect")
        await f.one(
          "update rpg_private.memory_public_sources set source_refs=$3::jsonb where campaign_id=$1 and source_id=any($2::uuid[])",
          [
            f.cid,
            [destination, f.quest],
            JSON.stringify([
              {
                campaignId: f.cid,
                kind: "entity",
                id: f.npc,
                version: "2",
                part: 0,
                visibility: "public",
              },
            ]),
          ],
        );
      if (mode === "private_positive") {
        await f.one(
          "insert into rpg_private.memory_private_sources(campaign_id,kind,source_id,version,part,text,known_by,authority,statement_kind,valid_from,source_refs) select campaign_id,kind,source_id,version,part,text,known_by,authority,statement_kind,valid_from,source_refs from rpg_private.memory_public_sources where campaign_id=$1 and source_id=any($2::uuid[]) and current",
          [f.cid, [destination, f.quest]],
        );
        await f.one(
          "update rpg_private.memory_public_sources set known_by='{}' where campaign_id=$1 and source_id=any($2::uuid[])",
          [f.cid, [destination, f.quest]],
        );
      }
    },
  });
  const known = async (family, rid) =>
    (
      await f.one(
        "select rpg_private.lab_known_record(r,$2,$3,$4::jsonb) known from rpg_private.world_lab_runs r where r.id=$1",
        [f.run.id, family, rid, JSON.stringify([f.npc])],
      )
    ).known;
  return { ...f, destination, known };
}

function proposalFor(candidate, options) {
  return {
    schemaVersion: 2,
    decisions: [
      {
        threadId: candidate.threadId,
        stepId: candidate.stepId,
        decision: "advance",
        uncertainty: "resolved",
        capabilityRefs: options.map((o) => o.capabilityRef),
        evidenceIndexes: candidate.evidence.map((_, i) => i),
        consequences: options.map((o) => o.effect),
      },
    ],
  };
}

for (const mode of ["positive", "private_positive"])
  test(`D2A QA exact ${mode} Actor knowledge admits production relocation and observation through SQL`, async () => {
    const f = await knowledgeRun(mode);
    try {
      assert.equal(await f.known("locations", f.destination), true);
      assert.equal(await f.known("quests", f.quest), true);
      await f.writeRequest();
      let offered;
      const { createWorldResolverProvider } = await import(
        new URL(
          "src/lib/server/world/resolver-provider.ts",
          leafRoot("D2A_QA_SOURCE_ROOT"),
        ).href
      );
      const provider = createWorldResolverProvider({
        apiKey: "SYNTHETIC_D2A_QA_ONLY",
        model: "gpt-6-astra",
        reasoning: "max",
        fetcher: async (_url, init) => {
          const data = JSON.parse(JSON.parse(init.body).input),
            candidate = data.candidates[0];
          offered = candidate.consequenceOptions.filter((o) =>
            ["actor.relocate", "fact.observe"].includes(o.effect.kind),
          );
          assert.deepEqual(offered.map((o) => o.effect.kind).sort(), [
            "actor.relocate",
            "fact.observe",
          ]);
          return providerResponse(proposalFor(candidate, offered));
        },
      });
      const response = await provider.simulate(
        f.prepared.worldInput,
        f.prepared.scope,
        f.prepared.profile,
      );
      assert.ok(offered);
      await f.lab("model_result", {
        operationId: f.modelCommand.operationId,
        fence: f.modelRequest.fence,
        result: {
          proposal: response.proposal,
          usage: response.usage,
          error: null,
        },
      });
      const plan = stageLabSimulation(
        f.state,
        f.modelCommand.operationId,
        response.proposal,
      );
      assert.equal(plan.status, "staged");
      const commit = buildDetachedWorldCommit({
        state: f.state,
        fence: f.modelRequest.fence,
        operationId: f.modelCommand.operationId,
        throughWorldMinutes: plan.worldInput.resolution.worldMinutes,
        worldInput: plan.worldInput,
        simulationProposal: response.proposal,
      });
      const live = await liveProjection(f);
      await f.lab("commit", commit);
      const state = await f.store.readDetached(f.cid, f.run.id);
      const world = state.records["rpg_private.world_foundations"][0].world;
      assert.equal(
        world.actors.find((a) => a.id === f.npc).locationId,
        f.destination,
      );
      const visible = state.records["rpg_private.world_events"].filter(
        (r) => r.event.visibility === "public",
      );
      assert.ok(
        visible.some((r) =>
          r.event.text.includes("An established fact is observed."),
        ),
      );
      assert.doesNotMatch(
        JSON.stringify(visible),
        /SYNTHETIC_POSITIVE_LOCATION_FACT/,
      );
      assert.deepEqual(await liveProjection(f), live);
    } finally {
      await f.db.close();
    }
  });

for (const mode of [
  "unknown",
  "wrong_actor",
  "future",
  "restricted",
  "indirect",
])
  test(`D2A QA ${mode} knowledge cannot authorize an observation or relocation effect`, async () => {
    const f = await knowledgeRun(mode);
    try {
      assert.equal(await f.known("locations", f.destination), false);
      assert.equal(await f.known("quests", f.quest), false);
      const { commit } = await f.record();
      const request = f.transport.requests.find((r) => r.kind === "resolve");
      assert.ok(request);
      assert.equal(
        request.data.candidates[0].consequenceOptions.some((o) =>
          ["actor.relocate", "fact.observe"].includes(o.effect.kind),
        ),
        false,
      );
      const stable = await durableState(f),
        live = await liveProjection(f);
      for (const effect of [
        {
          kind: "actor.relocate",
          actorId: f.npc,
          fromLocationId: f.location,
          toLocationId: f.destination,
        },
        { kind: "fact.observe", family: "quests", recordId: f.quest },
      ]) {
        const invalid = structuredClone(commit);
        const decision = invalid.proof.proposal.decisions[0];
        decision.consequences = [effect];
        decision.capabilityRefs = [
          effect.kind === "actor.relocate"
            ? `${f.npc}:world.relocate:${f.npc}:${f.destination}`
            : `${f.npc}:world.observe:quests:${f.quest}`,
        ];
        await assert.rejects(() => f.lab("commit", invalid));
      }
      assert.deepEqual(await durableState(f), stable);
      assert.deepEqual(await liveProjection(f), live);
    } finally {
      await f.db.close();
    }
  });

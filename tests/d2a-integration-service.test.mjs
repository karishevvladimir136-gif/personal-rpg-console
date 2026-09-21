import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  integrationFixture,
  command,
  durableState,
} from "./d2a-integration-fixture.mjs";

const selection = {
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "max",
};
function assertPublic(value) {
  assert.doesNotMatch(
    JSON.stringify(value),
    /PRIVATE_|QA_PRIVATE|UNCOMMITTED_FIXED|inputDigest|sourceHeads|leaseGeneration|headRevision|documentVersions|known_by|branchAssumptions|consequenceAuthority|privatePatches/,
  );
}

for (const language of ["en", "ru"]) {
  test(`D2A ${language} scripted authoring, owner edit, approval and two committed continuations preserve live state`, async (t) => {
    t.mock.method(globalThis, "fetch", () => {
      throw Error("UNEXPECTED_NETWORK");
    });
    const f = await integrationFixture({
      language,
      withFoundationDefinitions: true,
    });
    try {
      const live = await f.active();
      const { authoring, lab, library } = await f.services();
      const interpreted = await authoring.perform({
        action: "interpret",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          saveId: f.save.id,
          premise: f.requested.composition.premise,
          model: selection,
        },
      });
      assert.equal(interpreted.run, null);
      assert.equal(interpreted.draft.proposal.phase, "review");
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_lab_runs where campaign_id=$1",
            [f.cid],
          )
        ).n,
        0,
      );
      assert.deepEqual(await f.active(), live);
      const review = structuredClone(interpreted.draft.proposal.review);
      review.title = "Owner reviewed rainy crossing";
      review.constraints.push(
        "Owner correction: existing supply ownership remains exact.",
      );
      const edited = await authoring.perform({
        action: "edit",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          versionId: interpreted.draft.versionId,
          review,
          model: selection,
        },
      });
      assert.equal(edited.run, null);
      assert.equal(edited.draft.proposal.ownerEdited, true);
      assert.notEqual(edited.draft.versionId, interpreted.draft.versionId);
      const approved = await authoring.perform({
        action: "approve",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          versionId: edited.draft.versionId,
        },
      });
      assert.equal(approved.draft.proposal.phase, "approved");
      const prepared = approved.run;
      assert.equal(prepared.status, "prepared");
      assert.equal(prepared.currentWorldMinutes, 0);
      assert.equal(prepared.checkpoints.length, 1);
      assert.deepEqual(await f.active(), live);
      const history = await library.read({
        kind: "scenario",
        id: approved.draft.id,
      });
      assert.deepEqual(history.map((r) => r.body.composition.phase).sort(), [
        "approved",
        "requested",
        "review",
        "review",
      ]);
      const pinned = history.find(
        (r) => r.versionId === approved.draft.versionId,
      );
      assert.equal(pinned.body.composition.ownerEdit.ownerId, f.owner);
      assert.ok(
        pinned.body.composition.ownerEdit.fields.includes("constraints"),
      );

      const initial = await f.store.readDetached(f.cid, prepared.id);
      assert.equal(
        initial.records["rpg_private.world_foundations"][0].loop_state
          .itemPolicies.length,
        1,
      );
      assert.equal(
        initial.records["rpg_private.world_foundations"][0].loop_state.tracks
          .length,
        1,
      );
      assert.equal(
        initial.records["rpg_private.world_foundations"][0].loop_state.rewards
          .length,
        1,
      );
      assert.deepEqual(
        initial.run.input.executionProfile,
        pinned.body.composition.simulationProfile,
      );
      const a = { action: "continue", input: command(prepared) };
      const first = await lab.perform(a);
      assert.equal(first.currentWorldMinutes, 60);
      assert.equal(first.checkpoints.length, 2);
      const afterFirst = await f.store.readDetached(f.cid, prepared.id);
      const supply1 = afterFirst.records["public.rpg_items"].find(
        (i) => i.id === f.supplies,
      );
      assert.equal(supply1.quantity, 8);
      assert.equal(supply1.revision, 2);
      assert.deepEqual(
        afterFirst.records["public.rpg_entities"].find((e) => e.id === f.npc)
          .conditions,
        ["wet"],
      );
      const b = { action: "continue", input: command(first) };
      const second = await lab.perform(b);
      assert.equal(second.currentWorldMinutes, 120);
      assert.equal(second.status, "completed");
      assert.equal(second.checkpoints.length, 3);
      const final = await f.store.readDetached(f.cid, prepared.id);
      const supply2 = final.records["public.rpg_items"].find(
        (i) => i.id === f.supplies,
      );
      assert.equal(supply2.quantity, 7);
      assert.equal(supply2.revision, 3);
      const npc = final.records["public.rpg_entities"].find(
        (e) => e.id === f.npc,
      );
      assert.deepEqual(npc.resources, { focus: 3 });
      assert.deepEqual(npc.conditions, []);
      assert.deepEqual(
        final.records["rpg_private.world_foundations"][0].loop_state,
        initial.records["rpg_private.world_foundations"][0].loop_state,
      );
      for (const [family, rows] of Object.entries(initial.records)) {
        if (
          [
            "public.rpg_entities",
            "public.rpg_items",
            "rpg_private.world_foundations",
            "rpg_private.world_events",
            "rpg_private.runtime_state",
          ].includes(family)
        )
          continue;
        assert.deepEqual(
          final.records[family],
          rows,
          `${family} remains outside the resolved effect authority`,
        );
      }
      assert.deepEqual(
        final.records["public.rpg_entities"].find((e) => e.id === f.hero),
        initial.records["public.rpg_entities"].find((e) => e.id === f.hero),
      );
      assert.deepEqual(
        final.records["public.rpg_items"].find((i) => i.id === f.item),
        initial.records["public.rpg_items"].find((i) => i.id === f.item),
      );
      const stable = await durableState(f);
      assert.deepEqual(await lab.perform(a), first);
      assert.deepEqual(await lab.perform(b), second);
      const preparationReceipt = await f.one(
        "select request from rpg_private.world_lab_commands where run_id=$1 and stage='prepare'",
        [prepared.id],
      );
      assert.deepEqual(
        await lab.perform({
          action: "prepare",
          input: preparationReceipt.request.request,
        }),
        prepared,
      );
      assert.deepEqual(await durableState(f), stable);
      assert.deepEqual(await f.active(), live);
      assert.equal(
        f.transport.requests.filter((r) => r.kind === "compose").length,
        1,
      );
      assert.equal(
        f.transport.requests.filter((r) => r.kind === "resolve").length,
        2,
      );
      const receipts = await f.query(
        "select stage,request,result from rpg_private.world_lab_commands where run_id=$1 and stage in ('model_request','model_result') order by operation_id,stage",
        [prepared.id],
      );
      assert.equal(
        receipts.filter((r) => r.stage === "model_request").length,
        2,
      );
      assert.equal(
        receipts.filter((r) => r.stage === "model_result").length,
        2,
      );
      for (const receipt of receipts.filter(
        (r) => r.stage === "model_request",
      )) {
        assert.match(JSON.stringify(receipt), /world-resolver-simulation-v2/);
        assert.match(
          JSON.stringify(receipt),
          new RegExp(pinned.body.composition.simulationProfile.id),
        );
      }
      for (const value of [
        interpreted,
        edited,
        approved,
        first,
        second,
        await lab.catalog(f.cid),
      ])
        assertPublic(value);
      assert.ok(second.checkpoints[1].events.length > 0);
      assert.match(
        second.checkpoints[1].events.map((e) => e.text).join(" "),
        language === "ru" ? /Припасы израсходованы/ : /Supplies are consumed/,
      );
    } finally {
      await f.db.close();
    }
  });
}

for (const lostStage of ["model_result", "commit"]) {
  test(`D2A lost ${lostStage} response reuses the durable exact result without another resolver call`, async (t) => {
    t.mock.method(globalThis, "fetch", () => {
      throw Error("UNEXPECTED_NETWORK");
    });
    const f = await integrationFixture();
    try {
      const live = await f.active();
      const approved = await f.approve();
      let lose = true;
      const rpc = async (args) => {
        const response = await f.rpc(args);
        if (args.p_action === lostStage && !response.error && lose) {
          lose = false;
          throw Error("SYNTHETIC_LOST_DATABASE_RESPONSE");
        }
        return response;
      };
      const { lab } = await f.services({ rpc });
      const prepared = await lab.perform({
        action: "prepare",
        input: approved.request,
      });
      const request = { action: "continue", input: command(prepared) };
      await assert.rejects(() => lab.perform(request));
      assert.equal(lose, false);
      assert.equal(
        f.transport.requests.filter((r) => r.kind === "resolve").length,
        1,
      );
      const beforeRetry = await durableState(f);
      const restored = await lab.perform(request);
      assert.equal(restored.currentWorldMinutes, 60);
      assert.equal(restored.checkpoints.length, 2);
      assert.equal(
        f.transport.requests.filter((r) => r.kind === "resolve").length,
        1,
      );
      if (lostStage === "commit")
        assert.deepEqual(await durableState(f), beforeRetry);
      const stable = await durableState(f);
      assert.deepEqual(await lab.perform(request), restored);
      assert.deepEqual(await durableState(f), stable);
      assert.deepEqual(await f.active(), live);
      const state = await f.store.readDetached(f.cid, prepared.id);
      assert.equal(
        state.records["public.rpg_items"].find((i) => i.id === f.supplies)
          .quantity,
        8,
      );
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_lab_commands where operation_id=$1 and stage='model_result'",
            [request.input.operationId],
          )
        ).n,
        1,
      );
    } finally {
      await f.db.close();
    }
  });
}

test("D2A deterministic continuation makes zero resolver calls despite later typed World work", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("UNEXPECTED_NETWORK");
  });
  const f = await integrationFixture({
    transformWorld(world, fixture) {
      world.threads[0].steps[0].trigger.atWorldMinutes = 70;
      world.threads[0].steps[1].trigger.atWorldMinutes = 130;
      world.threads[0].steps[1].resolution = "resolver_required";
      world.threads[0].steps[1].consequences = [
        { kind: "condition.add", actorId: fixture.npc, condition: "cold" },
      ];
    },
  });
  try {
    const live = await f.active();
    const approved = await f.approve();
    const { lab } = await f.services();
    const prepared = await lab.perform({
      action: "prepare",
      input: approved.request,
    });
    const request = { action: "continue", input: command(prepared) };
    const checkpoint = await lab.perform(request);
    assert.equal(checkpoint.currentWorldMinutes, 60);
    assert.equal(checkpoint.checkpoints.length, 2);
    assert.equal(
      f.transport.requests.filter((r) => r.kind === "resolve").length,
      0,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_lab_commands where run_id=$1 and stage in ('model_request','model_result')",
          [prepared.id],
        )
      ).n,
      0,
    );
    const state = await f.store.readDetached(f.cid, prepared.id);
    assert.deepEqual(
      state.records["rpg_private.world_foundations"][0].world,
      f.worldState,
    );
    assert.equal(
      state.records["public.rpg_items"].find((i) => i.id === f.supplies)
        .quantity,
      10,
    );
    assert.deepEqual(await f.active(), live);
  } finally {
    await f.db.close();
  }
});

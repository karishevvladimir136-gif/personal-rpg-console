import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  waveFixture,
  configuredWorld,
  stage,
} from "./wave1-integration-fixture.mjs";
import {
  providerSettings,
  configurationProjection,
  parseConfigureProduction,
} from "../src/lib/production/configuration.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";

test("Wave 2 provider settings expose registered choices and status without secret values or probes", () => {
  const view = providerSettings({
    OPENAI_API_KEY: "SYNTHETIC_SECRET",
    OPENAI_DM_MODEL: "gpt-6-astra",
    OPENAI_DM_REASONING: "xhigh",
  });
  assert.equal(view.globalDefaultStatus, "configured_not_tested");
  assert.equal(view.globalDefault.modelId, "gpt-6-astra");
  assert.ok(!JSON.stringify(view).includes("SYNTHETIC_SECRET"));
  const invalid = providerSettings({
    OPENAI_API_KEY: "SYNTHETIC_SECRET",
    OPENAI_DM_MODEL: "UNREGISTERED_PRIVATE_VALUE",
  });
  assert.equal(invalid.globalDefaultStatus, "unavailable");
  assert.equal(invalid.globalDefault, null);
  assert.ok(!JSON.stringify(invalid).includes("UNREGISTERED_PRIVATE_VALUE"));
});

test("Wave 2 owner configuration is idempotent, fenced, secret-free and reconciles the existing autonomy setting", async () => {
  const f = await waveFixture();
  try {
    const cid = await f.campaign(),
      command = await f.foundationCommand(cid);
    const args = {
      p_owner_id: f.owner,
      p_campaign_id: cid,
      p_timeline: command.timeline,
      p_action: "owner_configure",
      p_payload: {
        command,
        worldPolicy: {
          simulation: true,
          autonomy: "high",
          deadlinePressure: "critical_only",
        },
        ruleset: WORLD_LOGIC_REF,
        executionPolicy: {
          schemaVersion: 1,
          revision: 1,
          primary: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "xhigh",
          },
          taskOverrides: {},
        },
      },
    };
    const first = await f.rpc(args);
    assert.equal(first.error, undefined);
    assert.deepEqual(await f.rpc(args), first);
    assert.equal(first.data.world.policy.autonomy, "high");
    assert.equal(
      (
        await f.one(
          "select values->>'worldAutonomy' value from public.rpg_settings where campaign_id=$1",
          [cid],
        )
      ).value,
      "high",
    );
    const settings = await f.one(
      "select * from public.rpg_settings where campaign_id=$1",
      [cid],
    );
    await f.mutation(
      "settings.save",
      cid,
      { ...settings.values, worldAutonomy: "low" },
      settings.revision,
    );
    assert.equal((await f.read(cid)).world.policy.autonomy, "low");
    const projected = configurationProjection(
      await f.read(cid),
      providerSettings({}),
      "low",
    );
    assert.equal(projected.ruleset.id, "world-logic-v1");
    assert.ok(!Object.hasOwn(projected, "world"));
    assert.ok(!Object.hasOwn(projected, "ownerId"));
    const changed = structuredClone(args);
    changed.p_payload.worldPolicy.autonomy = "moderate";
    assert.match((await f.rpc(changed)).error.message, /conflict/);
    const denied = { ...args, p_owner_id: f.other };
    assert.match((await f.rpc(denied)).error.message, /forbidden/);
  } finally {
    await f.db.close();
  }
});

test("Wave 2 owner model and ruleset configuration refuses unsupported values and active turns", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const cmd = await f.foundationCommand(w.cid);
    const request = {
      operationId: cmd.operationId,
      timeline: cmd.timeline,
      expectedRevision: cmd.expectedRevision,
      expectedRuntimeRevision: cmd.expectedRuntimeRevision,
      expectedHeadId: cmd.expectedHeadId,
      worldPolicy: w.state.policy,
      ruleset: WORLD_LOGIC_REF,
      runtimePolicy: null,
    };
    assert.throws(() =>
      parseConfigureProduction({ ...request, apiKey: "SECRET" }),
    );
    assert.throws(() =>
      parseConfigureProduction({
        ...request,
        runtimePolicy: {
          schemaVersion: 1,
          revision: 1,
          primary: {
            providerId: "other",
            modelId: "anything",
            reasoning: null,
          },
          taskOverrides: {},
        },
      }),
    );
    await stage(f, w);
    const args = {
      p_owner_id: f.owner,
      p_campaign_id: w.cid,
      p_timeline: cmd.timeline,
      p_action: "owner_configure",
      p_payload: {
        command: cmd,
        worldPolicy: w.state.policy,
        ruleset: WORLD_LOGIC_REF,
        executionPolicy: null,
      },
    };
    assert.match((await f.rpc(args)).error.message, /conflict/);
  } finally {
    await f.db.close();
  }
});

async function recover(f, w, claim) {
  const snapshot = await f.read(w.cid);
  const command = {
    operationId: claim.lease.operationId,
    campaignId: w.cid,
    timeline: snapshot.timeline,
    expectedRevision: snapshot.revision,
    expectedRuntimeRevision: snapshot.runtimeRevision,
    expectedHeadId: snapshot.headId,
  };
  return f.rpc({
    p_owner_id: f.owner,
    p_campaign_id: w.cid,
    p_action: "recover",
    p_payload: { command, token: claim.lease.token },
    p_timeline: snapshot.timeline,
  });
}

for (const activate of [false, true])
  test(`Wave 2 SQL re-stages after ${activate ? "load and epoch activation" : "manual save head change"} without rewriting or duplicating`, async () => {
    const f = await waveFixture();
    try {
      const w = await configuredWorld(f),
        s = await stage(f, w);
      const saved = await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, {
          kind: "manual",
          name: "Pending synthetic action",
        }),
      );
      let claim = s.claim;
      if (activate) {
        const point = saved.snapshot.saves.find(
          (x) => x.name === "Pending synthetic action",
        );
        await f.saves(
          w.cid,
          "load",
          await f.command(w.cid, {
            saveId: point.id,
            label: "Synthetic continuation",
            recovery: false,
          }),
        );
        claim = await f.runtime(w.cid, "claim", {
          operationId: s.input.operationId,
        });
      }
      const result = await recover(f, w, claim);
      assert.equal(result.error, undefined, JSON.stringify(result.error));
      assert.deepEqual(result.data.events, s.proposal.settlement.events);
      assert.notDeepEqual(result.data, s.proposal.settlement);
      assert.deepEqual(await recover(f, w, claim), result);
      const original = await f.one(
        "select settlement from rpg_private.world_stages where campaign_id=$1 and id=$2",
        [w.cid, s.input.operationId],
      );
      assert.deepEqual(original.settlement, s.proposal.settlement);
      await f.runtime(w.cid, "checkpoint", {
        ...claim.lease,
        status: "generating",
        checkpoint: { ...claim.turn.checkpoint, worldSettlement: result.data },
      });
      const packet = { ...s.packet, worldSettlement: result.data };
      const committed = await f.runtime(w.cid, "commit", {
        ...claim.lease,
        packet,
      });
      assert.equal(committed.status, "committed");
      await f.runtime(w.cid, "commit", { ...claim.lease, packet });
      assert.equal(
        (
          await f.one(
            "select count(*)::int n from rpg_private.world_events where campaign_id=$1",
            [w.cid],
          )
        ).n,
        2,
      );
      if (activate)
        assert.equal((await recover(f, w, s.claim)).error !== undefined, true);
    } finally {
      await f.db.close();
    }
  });

test("Wave 2 continuation rejects material state changes, foreign operations and cancelled work", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f),
      s = await stage(f, w);
    await f.one(
      "update public.rpg_entities set name='Corrected synthetic hero',revision=revision+1 where campaign_id=$1 and id=$2",
      [w.cid, w.hero],
    );
    assert.ok((await recover(f, w, s.claim)).error);
    const other = await configuredWorld(f);
    assert.ok((await recover(f, other, s.claim)).error);
    await f.runtime(w.cid, "cancel", {
      campaignId: w.cid,
      operationId: s.input.operationId,
      commandId: randomUUID(),
      action: "cancel",
      checkId: null,
    });
    assert.ok((await recover(f, w, s.claim)).error);
    assert.equal(
      (await f.one("select count(*)::int n from rpg_private.world_events")).n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

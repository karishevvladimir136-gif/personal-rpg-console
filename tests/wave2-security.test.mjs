import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  fixture as storageFixture,
  world,
} from "./phase35-storage-fixture.mjs";
import {
  waveFixture,
  configuredWorld,
  stage,
} from "./wave1-integration-fixture.mjs";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import { emptyPlan } from "./phase2-turn-store-fixture.mjs";
import {
  fixture as worldFixture,
  evidence as worldEvidence,
} from "./wave1-world-fixtures.mjs";

const strong = {
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "xhigh",
};

test("independent QA: unavailable explicit resolver selections never inherit or request another model", () => {
  for (const selected of [
    { ...strong, modelId: "unknown-model" },
    { ...strong, providerId: "unknown-provider" },
    { ...strong, reasoning: "unknown-option" },
  ]) {
    let availabilityChecks = 0;
    assert.throws(() =>
      resolveExecutionProfile({
        task: "world.resolve",
        profileId: randomUUID(),
        globalDefault: strong,
        campaignPolicy: {
          schemaVersion: 1,
          revision: 1,
          primary: strong,
          taskOverrides: { "world.resolve": selected },
        },
        providerAvailable: () => {
          availabilityChecks++;
          return true;
        },
      }),
    );
    assert.equal(availabilityChecks, 0);
  }
  const checked = [];
  assert.throws(() =>
    resolveExecutionProfile({
      task: "world.resolve",
      profileId: randomUUID(),
      globalDefault: strong,
      campaignPolicy: {
        schemaVersion: 1,
        revision: 1,
        primary: { ...strong, modelId: "gpt-5.4", reasoning: "high" },
        taskOverrides: {},
      },
      providerAvailable: (selection) => {
        checked.push(selection);
        return false;
      },
    }),
  );
  assert.deepEqual(
    checked.map((s) => s.modelId),
    ["gpt-5.4"],
  );
});

test("independent QA: migration 11 retains the private SQL boundary for every new helper", async () => {
  const f = await waveFixture();
  try {
    const helpers = await f.query(
      "select p.oid::regprocedure::text signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname like 'wave2_%'",
    );
    assert.ok(helpers.length >= 6);
    for (const role of ["anon", "authenticated", "service_role"]) {
      for (const { signature } of helpers) {
        assert.equal(
          (
            await f.one(
              "select has_function_privilege($1,$2,'execute') allowed",
              [role, signature],
            )
          ).allowed,
          false,
          `${role}: ${signature}`,
        );
      }
    }
    for (const role of ["anon", "authenticated"]) {
      assert.equal(
        (
          await f.one(
            "select has_function_privilege($1,'public.rpg_world(uuid,uuid,text,jsonb,jsonb)','execute') allowed",
            [role],
          )
        ).allowed,
        false,
      );
      assert.equal(
        (
          await f.one(
            "select has_table_privilege($1,'rpg_private.world_stages','select') allowed",
            [role],
          )
        ).allowed,
        false,
      );
    }
  } finally {
    await f.db.close();
  }
});

test("independent QA: owner settings SQL rejects hostile metadata atomically", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f),
      before = await f.read(w.cid);
    const command = await f.foundationCommand(w.cid);
    const base = {
      command,
      worldPolicy: w.state.policy,
      ruleset: before.ruleset,
      executionPolicy: null,
    };
    for (const mutate of [
      (p) => {
        p.executionPolicy = {
          schemaVersion: 1,
          revision: 1,
          primary: { ...strong, apiKey: "QA_SECRET" },
          taskOverrides: {},
        };
      },
      (p) => {
        p.executionPolicy = {
          schemaVersion: 1,
          revision: 1,
          primary: strong,
          taskOverrides: { "unknown.task": strong },
        };
      },
      (p) => {
        p.executionPolicy = {
          schemaVersion: 1,
          revision: 1,
          primary: { ...strong, modelId: "unsupported" },
          taskOverrides: {},
        };
      },
      (p) => {
        p.ruleset = { ...p.ruleset, validatorVersion: "unreviewed" };
      },
      (p) => {
        p.worldPolicy = { ...p.worldPolicy, hiddenClock: 42 };
      },
      (p) => {
        p.command.campaignId = randomUUID();
      },
      (p) => {
        p.command.expectedHeadId = randomUUID();
      },
    ]) {
      const payload = structuredClone(base);
      mutate(payload);
      const result = await f.rpc({
        p_owner_id: f.owner,
        p_campaign_id: w.cid,
        p_action: "owner_configure",
        p_payload: payload,
        p_timeline: command.timeline,
      });
      assert.ok(result.error, JSON.stringify(payload));
      assert.deepEqual(await f.read(w.cid), before);
    }
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.world_commands where request->>'action'='owner_configure'",
        )
      ).n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("independent QA: actual populated Wave 1 save survives migration 11 and branch activation", async () => {
  const f = await storageFixture(10);
  try {
    const w = await world(f);
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { kind: "manual", name: "QA old save" }),
    );
    const save = saved.snapshot.saves.find((s) => s.name === "QA old save");
    const original = await f.one(
      "select hp,max_hp,name from public.rpg_entities where campaign_id=$1 and id=$2",
      [w.cid, w.hero],
    );
    await f.db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609200011_production_wave2.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await f.one(
      "update public.rpg_entities set hp=1 where campaign_id=$1 and id=$2",
      [w.cid, w.hero],
    );
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: save.id,
        label: "QA old save child",
        recovery: false,
      }),
    );
    assert.deepEqual(
      await f.one(
        "select hp,max_hp,name from public.rpg_entities where campaign_id=$1 and id=$2",
        [w.cid, w.hero],
      ),
      original,
    );
    const foundation = (
      await f.one(
        "select public.rpg_world($1,$2,'read','{}',$3::jsonb) result",
        [f.owner, w.cid, JSON.stringify(await f.fence(w.cid))],
      )
    ).result;
    assert.equal(foundation.ruleset.id, "console-basic-v1");
    assert.equal(foundation.executionPolicy, null);
    assert.equal(foundation.world, null);
    const publicState = await f.runtime(w.cid, "play");
    assert.doesNotMatch(
      JSON.stringify(publicState),
      /PRIVATE_BEFORE_FORK|worldSettlement|authority/,
    );
  } finally {
    await f.db.close();
  }
});

test("independent QA: a sibling branch cannot recover a stage absent from its exact save", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, {
        kind: "manual",
        name: "QA before pending turn",
      }),
    );
    const point = saved.snapshot.saves.find(
      (s) => s.name === "QA before pending turn",
    );
    const pending = await stage(f, w);
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: point.id,
        label: "QA sibling without operation",
        recovery: false,
      }),
    );
    const command = {
      ...(await f.foundationCommand(w.cid)),
      operationId: pending.input.operationId,
    };
    const result = await f.rpc({
      p_owner_id: f.owner,
      p_campaign_id: w.cid,
      p_action: "recover",
      p_payload: { command, token: pending.claim.lease.token },
      p_timeline: command.timeline,
    });
    assert.ok(result.error);
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).n,
      0,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.world_stages where campaign_id=$1",
          [w.cid],
        )
      ).n,
      0,
    );
    await assert.rejects(() =>
      f.runtime(
        w.cid,
        "commit",
        { ...pending.claim.lease, packet: pending.packet },
        pending.claim.lease.timeline,
      ),
    );
  } finally {
    await f.db.close();
  }
});

test("independent QA: an actual pre-upgrade staged turn resumes only under its original fence", async () => {
  const legacy = await import("./wave1-qa-storage-fixture.mjs");
  const f = await legacy.fixture();
  try {
    const w = await legacy.setup(f),
      prepared = await legacy.prepare(f, w);
    await legacy.stage(f, w, prepared);
    await f.db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609200011_production_wave2.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(
      (
        await f.one(
          "select authority from rpg_private.world_stages where campaign_id=$1",
          [w.cid],
        )
      ).authority,
      null,
    );
    const original = await f.foundation(w.cid, "recover", {
      command: prepared.command,
      token: prepared.claim.lease.token,
    });
    assert.deepEqual(original, prepared.result.settlement);
    await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, {
        kind: "manual",
        name: "QA legacy pending stage",
      }),
    );
    const command = await f.foundationCommand(
      w.cid,
      prepared.command.operationId,
    );
    await assert.rejects(
      () =>
        f.foundation(w.cid, "recover", {
          command,
          token: prepared.claim.lease.token,
        }),
      /recovery_required/,
    );
    assert.deepEqual(
      (
        await f.one(
          "select settlement from rpg_private.world_stages where campaign_id=$1",
          [w.cid],
        )
      ).settlement,
      original,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("independent QA: source replacement invalidates a pending review job even when its draft already exists", async () => {
  const { authoringFixture, createDraft, sourceInput, id } =
    await import("./wave2-library-fixtures.mjs");
  const f = authoringFixture(),
    { job, sources, pack } = await createDraft(f);
  await f.service.execute(
    sourceInput({
      sourceId: sources[0].id,
      expectedVersionId: sources[0].versionId,
      text: "Corrected current source.",
    }),
  );
  await f.service.execute({
    action: "compiler.step",
    operationId: id(),
    expectedVersionId: job.versionId,
  });
  assert.equal((await f.service.read()).jobs[0].status, "invalidated");
  assert.equal((await f.service.pack(pack.versionId)).status, "draft");
});

test("independent QA: a source correction prevents approval of its stale pending draft", async () => {
  const { authoringFixture, createDraft, sourceInput, approveInput } =
    await import("./wave2-library-fixtures.mjs");
  const f = authoringFixture(),
    { sources, pack } = await createDraft(f);
  await f.service.execute(
    sourceInput({
      sourceId: sources[0].id,
      expectedVersionId: sources[0].versionId,
      text: "Corrected current source.",
    }),
  );
  await assert.rejects(() => f.service.execute(approveInput(pack)), /conflict/);
  assert.equal((await f.service.pack(pack.versionId)).status, "draft");
});

test("independent QA SQL: a World Logic checkpoint cannot commit arbitrary effects without its validated stage", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    w.state.threads = [];
    await f.write(w.cid, "configure", {
      world: w.state,
      ruleset: WORLD_LOGIC_REF,
    });
    const snapshot = await f.read(w.cid);
    const input = {
      operationId: randomUUID(),
      campaignId: w.cid,
      timeline: snapshot.timeline,
      expectedRevision: snapshot.runtimeRevision,
      mode: "game",
      input: "I look at the crossing.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", {
      operationId: input.operationId,
    });
    const hero = claim.source.snapshot.entities.find((e) => e.id === w.hero);
    const resolution = {
      changes: [
        {
          family: "entities",
          id: w.hero,
          expectedRevision: hero.revision,
          values: { hp: 0 },
        },
      ],
      worldMinutes: snapshot.worldMinutes + 1,
      configuration: claim.source.runtime.configuration,
      outcomes: [],
    };
    const worldLogic = {
      schemaVersion: 1,
      actorId: w.hero,
      input: input.input,
      action: "observe",
      outcome: "completed",
      uncertainty: "resolved",
      capabilityRefs: [],
      circumstanceRefs: ["public-state"],
      evidenceIndexes: [],
      publicText: "The crossing is visible.",
      elapsedMinutes: 1,
      destinationId: null,
    };
    await f.runtime(w.cid, "checkpoint", {
      ...claim.lease,
      status: "generating",
      checkpoint: {
        ...claim.turn.checkpoint,
        plan: emptyPlan(),
        resolution,
        worldLogic,
      },
    });
    const packet = {
      narration: "The crossing is visible.",
      visualDescription: "",
      resolution,
      privatePatches: [],
      checks: [],
      guidanceProposal: null,
    };
    async function durableState() {
      return {
        hero: await f.one(
          "select hp,revision from public.rpg_entities where campaign_id=$1 and id=$2",
          [w.cid, w.hero],
        ),
        runtime: await f.one(
          "select world_minutes,revision from rpg_private.runtime_state where campaign_id=$1",
          [w.cid],
        ),
        scenes: (
          await f.one(
            "select count(*)::int n from public.rpg_scenes where campaign_id=$1",
            [w.cid],
          )
        ).n,
        stages: (
          await f.one(
            "select count(*)::int n from rpg_private.world_stages where campaign_id=$1",
            [w.cid],
          )
        ).n,
        events: (
          await f.one(
            "select count(*)::int n from rpg_private.world_events where campaign_id=$1",
            [w.cid],
          )
        ).n,
      };
    }
    const before = await durableState();
    assert.ok(before.hero.hp > 0);
    assert.equal(before.stages, 0);
    for (const stageField of [
      {},
      { worldSettlement: null },
      { worldSettlement: {} },
    ]) {
      await assert.rejects(
        () =>
          f.runtime(w.cid, "commit", {
            ...claim.lease,
            packet: { ...packet, ...stageField },
          }),
        /validation|conflict/,
      );
      assert.deepEqual(
        await durableState(),
        before,
        "rejected commit cannot mutate HP, time, history, stages or Events",
      );
      assert.equal(
        (
          await f.one(
            "select status from rpg_private.turns where campaign_id=$1 and id=$2",
            [w.cid, input.operationId],
          )
        ).status,
        "generating",
      );
    }
  } finally {
    await f.db.close();
  }
});

test("independent QA SQL: resolver receipts require each mandatory evidence index exactly once as an integer", async () => {
  const f = await waveFixture();
  try {
    const world = worldFixture().snapshot.world;
    const thread = world.threads[0],
      step = thread.steps[0],
      operationId = randomUUID();
    step.resolution = "resolver_required";
    step.evidence = [
      worldEvidence({ locator: { kind: "section", value: "required-first" } }),
      worldEvidence({ locator: { kind: "section", value: "required-second" } }),
    ];
    const receipt = {
      schemaVersion: 1,
      operationId,
      threadId: thread.id,
      stepId: step.id,
      decision: "advance",
      uncertainty: "resolved",
      capabilityRefs: [],
      evidenceIndexes: [0, 1],
    };
    const validate = (indexes) =>
      f.one(
        "select rpg_private.wave2_resolver_receipt($1,$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb) valid",
        [
          operationId,
          JSON.stringify(world),
          JSON.stringify(thread),
          JSON.stringify(step),
          JSON.stringify({ ...receipt, evidenceIndexes: indexes }),
        ],
      );
    assert.deepEqual(await validate([0, 1]), { valid: true });
    for (const indexes of [
      [0, "0"],
      ["0", 1],
      [0, 0],
      [-1, 1],
      [0, 1.2],
    ]) {
      await assert.rejects(
        () => validate(indexes),
        /validation/,
        JSON.stringify(indexes),
      );
    }
  } finally {
    await f.db.close();
  }
});

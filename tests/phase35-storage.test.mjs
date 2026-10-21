import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world, commitEvent } from "./phase35-storage-fixture.mjs";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { withMemory } from "../src/lib/memory/context.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";

test("Phase 3.5 immutable saves, catalog replacement, exact forks and activation fences", async () => {
  const f = await fixture();
  try {
    const cid = await f.campaign();
    const first = await f.saves(cid, "read");
    const input = await f.command(cid, {
      kind: "manual",
      name: "Before the crossing",
    });
    const save = await f.saves(cid, "create", input);
    assert.equal(save.snapshot.saves.length, 1);
    assert.deepEqual(await f.saves(cid, "create", input), save);
    await assert.rejects(
      f.saves(cid, "create", { ...input, name: "Changed" }),
      /rpg_conflict/,
    );
    await f.saves(
      cid,
      "create",
      await f.command(cid, { kind: "quick", name: "Quick save" }),
    );
    const count = (
      await f.one(
        "select count(*)::int n from rpg_private.timeline_versions where campaign_id=$1",
        [cid],
      )
    ).n;
    await f.saves(
      cid,
      "create",
      await f.command(cid, { kind: "quick", name: "Quick save" }),
    );
    assert.equal(
      (await f.saves(cid, "read")).saves.filter((s) => s.kind === "quick")
        .length,
      1,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.timeline_versions where campaign_id=$1",
          [cid],
        )
      ).n,
      count,
    );
    const load = await f.command(cid, {
      saveId: save.saveId,
      label: "Different crossing",
      recovery: false,
    });
    const branch = await f.saves(cid, "load", load);
    assert.equal(branch.snapshot.timeline.epoch, 2);
    assert.notEqual(branch.timelineId, first.timeline.timelineId);
    assert.ok(branch.safetySaveId);
    assert.equal(
      (await f.saves(cid, "load", load)).timelineId,
      branch.timelineId,
    );
    assert.equal((await f.saves(cid, "read")).timelines.length, 2);
    await assert.rejects(
      f.saves(cid, "create", { ...input, requestId: crypto.randomUUID() }),
      /rpg_conflict/,
    );
    const returned = await f.saves(
      cid,
      "switch",
      await f.command(cid, {
        timelineId: first.timeline.timelineId,
        recovery: false,
      }),
    );
    assert.equal(returned.snapshot.timeline.epoch, 3);
    assert.equal(returned.timelineId, first.timeline.timelineId);
    await assert.rejects(
      f.one("update rpg_private.save_points set name='tampered' where id=$1", [
        save.saveId,
      ]),
      /rpg_immutable_history/,
    );
    await assert.rejects(
      f.one("delete from rpg_private.timeline_versions where campaign_id=$1", [
        cid,
      ]),
      /rpg_immutable_history/,
    );
  } finally {
    await f.db.close();
  }
});

test("Phase 3.5 exact public/private state, knowledge and long-history ancestry across repeated forks", async () => {
  const f = await fixture();
  try {
    const w = await world(f),
      other = await world(f, "Unrelated ice station");
    const a = (await f.fence(w.cid)).timelineId;
    const before = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { kind: "manual", name: "Before secret" }),
    );
    await f.one(
      "insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision) select gen_random_uuid(),$1,$2,'Later event', 'Abandoned future event '||n,'narration',2,1 from generate_series(1,1000) n",
      [w.cid, w.sid],
    );
    await f.one(
      "update public.rpg_entities set hp=3,resources='{\"focus\":1}',conditions='[\"tired\"]',revision=revision+1 where id=$1",
      [w.hero],
    );
    await f.one(
      "update public.rpg_items set quantity=0,equipped_entity_id=null,equipped_slot=null,revision=revision+1 where id=$1",
      [w.item],
    );
    await f.one(
      "update public.rpg_quests set status='complete',revision=revision+1 where id=$1",
      [w.quest],
    );
    await f.one(
      "update rpg_private.runtime_state set world_minutes=90 where campaign_id=$1",
      [w.cid],
    );
    const futureTurn = await commitEvent(f, w, {
      packet: {
        narration: "Nera learns the later vault password SILVER_FUTURE.",
        visualDescription: "",
        privatePatches: [
          {
            kind: "fact",
            key: "future",
            operation: "set",
            value: "PRIVATE_ABANDONED_FUTURE",
            amount: null,
          },
        ],
      },
    });
    await f.memory(w.cid, "enqueue", { reason: "pressure" });
    let count = 0,
      job;
    while ((job = await f.memory(w.cid, "claim"))) {
      await f.memory(w.cid, "publish", {
        jobId: job.id,
        token: job.token,
        summary: {
          schemaVersion: 1,
          selections: job.sources.map((s) => ({
            sourceId: s.id,
            version: s.ref.version,
          })),
        },
      });
      count++;
    }
    assert.ok(count >= 42);
    const future = await f.saves(w.cid, "campaign");
    const amemory = await f.memory(w.cid, "context", {
      actorIds: [],
      includePrivate: true,
    });
    assert.ok(amemory.publicSummary);
    const loaded = await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: before.saveId,
        label: "Quiet crossing",
        recovery: false,
      }),
    );
    const b = loaded.timelineId;
    await assert.rejects(
      f.runtime(w.cid, "begin", {
        ...futureTurn.input,
        expectedRevision: (await f.runtime(w.cid, "play")).revision,
      }),
      /rpg_conflict/,
    );
    const snapshot = await f.saves(w.cid, "campaign");
    assert.equal(snapshot.entities.find((e) => e.id === w.hero).hp, 7);
    assert.deepEqual(snapshot.entities.find((e) => e.id === w.hero).resources, {
      focus: 3,
    });
    assert.equal(snapshot.items.find((i) => i.id === w.item).quantity, 1);
    assert.equal(
      snapshot.items.find((i) => i.id === w.item).equipped_entity_id,
      w.hero,
    );
    assert.equal(
      snapshot.items.find((i) => i.id === w.item).storage_id,
      w.storage,
    );
    assert.equal(snapshot.quests.find((q) => q.id === w.quest).status, "open");
    assert.equal((await f.runtime(w.cid, "play")).worldMinutes, 0);
    assert.equal(snapshot.scenes.length, 1);
    const source = await f.memory(w.cid, "source", { mode: "game" });
    assert.equal(source.privateState.fact.secret, "PRIVATE_BEFORE_FORK");
    assert.equal(source.privateState.fact.future, undefined);
    for (const visibility of ["public", "private"]) {
      const found = await f.memory(w.cid, "search", {
        campaignId: w.cid,
        visibility,
        actorIds: visibility === "public" ? [w.npc] : [],
        query: "SILVER_FUTURE PRIVATE_ABANDONED_FUTURE",
        entityIds: [],
        requiredSourceIds: [],
        worldMinutes: 90,
        maxBytes: 12000,
        maxExcerpts: 12,
        historicalComparison: true,
      });
      assert.equal(found.sources.length, 0);
    }
    assert.equal(
      (await f.memory(w.cid, "context", { actorIds: [], includePrivate: true }))
        .publicSummary,
      null,
    );
    await commitEvent(f, w, {
      packet: { narration: "BRANCH_B_ONLY: Nera stays by the bridge." },
    });
    await f.saves(
      w.cid,
      "switch",
      await f.command(w.cid, { timelineId: a, recovery: false }),
    );
    const restored = await f.saves(w.cid, "campaign");
    for (const key of ["entities", "items", "quests", "scenes", "publicState"])
      assert.deepEqual(restored[key], future[key]);
    assert.equal((await f.runtime(w.cid, "play")).worldMinutes, 90);
    assert.equal(
      (await f.memory(w.cid, "context", { actorIds: [], includePrivate: true }))
        .publicSummary.id,
      amemory.publicSummary.id,
    );
    assert.equal(
      (await f.memory(w.cid, "context", { actorIds: [], includePrivate: true }))
        .privateSummary.id,
      amemory.privateSummary.id,
    );
    assert.equal(
      (await f.memory(w.cid, "source", { mode: "game" })).privateState.fact
        .future,
      "PRIVATE_ABANDONED_FUTURE",
    );
    const sourceA = await f.memory(w.cid, "source", { mode: "game" });
    const recall = {
      operationId: randomUUID(),
      campaignId: w.cid,
      timeline: await f.fence(w.cid),
      expectedRevision: sourceA.runtime.revision,
      mode: "game",
      input: "What did Nera promise about the brass compass?",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    const adapter = createRpcMemoryStore(f.owner, async (args) => ({
      data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload),
    }));
    const bounded = await withMemory(sourceA, recall, adapter);
    assert.ok(
      bounded.memory.historical.some((s) =>
        s.text.includes("promised to carry"),
      ),
    );
    assert.ok(
      buildContext(bounded, recall, "plan", { model: "gpt-6-astra" })
        .estimatedTokens < 64000,
    );
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: before.saveId,
        label: "Third path",
        recovery: false,
      }),
    );
    assert.equal((await f.saves(w.cid, "campaign")).scenes.length, 1);
    await f.saves(
      w.cid,
      "switch",
      await f.command(w.cid, { timelineId: b, recovery: false }),
    );
    const bsource = await f.saves(w.cid, "campaign");
    assert.equal(bsource.scenes.length, 3);
    assert.ok(bsource.scenes.some((s) => s.body.includes("BRANCH_B_ONLY")));
    assert.ok(!JSON.stringify(bsource).includes("SILVER_FUTURE"));
    assert.equal((await f.saves(other.cid, "campaign")).scenes.length, 1);
    assert.equal((await f.fence(other.cid)).epoch, 1);
    assert.ok(
      !JSON.stringify(await f.saves(w.cid, "read")).includes("PRIVATE_"),
    );
  } finally {
    await f.db.close();
  }
});

test("Phase 3.5 saved pending roll identity, stale callbacks and genuinely new future rolls", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const input = {
      operationId: randomUUID(),
      campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game",
      input: "Try the gate once",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await f.runtime(w.cid, "begin", input);
    const oldFence = await f.fence(w.cid),
      claim = await f.runtime(w.cid, "claim", {
        operationId: input.operationId,
      });
    const check = {
      id: randomUUID(),
      index: 0,
      actorId: w.hero,
      targetId: null,
      kind: "skill",
      stat: "skill",
      dc: 12,
      dcPublic: true,
      visibility: "player",
      important: true,
      uncertainty: "meaningful",
      advantage: "normal",
      dice: [13],
      kept: 13,
      modifier: 2,
      total: 15,
      success: true,
      rollNumber: 1,
    };
    const plan = {
      narration: "PRIVATE_PENDING_PLAN",
      checks: [check],
      publicPatches: [],
      privatePatches: [],
      visualDescription: "",
      clarification: null,
      guidanceProposal: null,
    };
    const checkpoint = {
      plan,
      checks: [],
      resolution: null,
      narration: null,
      feedback: null,
      usage: [],
    };
    await f.runtime(w.cid, "checkpoint", {
      ...claim.lease,
      checkpoint,
      status: "generating",
    });
    await f.runtime(w.cid, "checks", { ...claim.lease, checks: [check] });
    checkpoint.checks = [check];
    await f.runtime(w.cid, "checkpoint", {
      ...claim.lease,
      checkpoint,
      status: "awaiting_confirmation",
    });
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { kind: "manual", name: "Recorded gate roll" }),
    );
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: saved.saveId,
        label: "Try another future",
        recovery: false,
      }),
    );
    const current = await f.fence(w.cid);
    const got = await f.runtime(w.cid, "get", {
      operationId: input.operationId,
    });
    assert.equal(got.checks[0].id, check.id);
    assert.deepEqual(got.checks[0].dice, [13]);
    assert.equal(got.checks[0].rollNumber, 1);
    await assert.rejects(
      f.runtime(w.cid, "claim", { operationId: input.operationId }, oldFence),
      /rpg_conflict/,
    );
    await assert.rejects(
      f.runtime(w.cid, "checkpoint", {
        ...claim.lease,
        checkpoint,
        status: "generating",
      }),
      /rpg_conflict/,
    );
    const again = await f.runtime(w.cid, "claim", {
      operationId: input.operationId,
    });
    assert.deepEqual(again.turn.checkpoint.checks, [check]);
    assert.deepEqual(again.turn.input.timeline, current);
    assert.deepEqual(again.source.snapshot.timeline, current);
    assert.equal(
      again.turn.input.expectedRevision,
      again.source.runtime.revision,
    );
    const packet = {
      narration: "The gate opens with the saved roll.",
      visualDescription: "",
      resolution: {
        changes: [],
        worldMinutes: 0,
        configuration: again.source.runtime.configuration,
        outcomes: [],
      },
      privatePatches: [],
      checks: [check],
      guidanceProposal: null,
    };
    await f.runtime(w.cid, "commit", { ...again.lease, packet });
    await f.runtime(w.cid, "commit", { ...again.lease, packet });
    assert.equal((await f.saves(w.cid, "campaign")).scenes.length, 3);
    const next = {
      ...input,
      operationId: randomUUID(),
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
    };
    await f.runtime(w.cid, "begin", next);
    const nc = await f.runtime(w.cid, "claim", {
      operationId: next.operationId,
    });
    await f.runtime(w.cid, "checkpoint", {
      ...nc.lease,
      checkpoint: { ...checkpoint, checks: [] },
      status: "generating",
    });
    const fresh = {
      ...check,
      id: randomUUID(),
      dice: [4],
      kept: 4,
      total: 6,
      success: false,
    };
    await f.runtime(w.cid, "checks", { ...nc.lease, checks: [fresh] });
    assert.notEqual(fresh.id, check.id);
    assert.deepEqual(
      (await f.runtime(w.cid, "checks", { ...nc.lease, checks: [check] }))[0]
        .dice,
      [4],
    );
    await f.mutation(
      "document.save",
      w.cid,
      {
        title: "New global canon",
        body: "The gate is now canonically closed by decree",
        status: "canon",
      },
      0,
      "campaign",
    );
    const preConflict = await f.saves(w.cid, "read");
    await assert.rejects(
      f.saves(
        w.cid,
        "load",
        await f.command(w.cid, {
          saveId: saved.saveId,
          label: "Unsafe old plan",
          recovery: true,
        }),
      ),
      /rpg_conflict/,
    );
    assert.deepEqual(await f.saves(w.cid, "read"), preConflict);
  } finally {
    await f.db.close();
  }
});

test("Phase 3.5 campaign canon and branch corrections, settings/guide version allocation and feedback continuity", async () => {
  const f = await fixture();
  try {
    const w = await world(f),
      a = (await f.fence(w.cid)).timelineId;
    const canon = await f.mutation(
      "document.save",
      w.cid,
      {
        title: "Bridge canon",
        status: "canon",
        body: "Original global bridge",
      },
      0,
      "campaign",
    );
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { kind: "manual", name: "Original bridge" }),
    );
    const snap = await f.saves(w.cid, "campaign"),
      guide = snap.documents.find((d) => d.id === snap.dmGuideDocumentId);
    await f.mutation(
      "document.save",
      w.cid,
      {
        id: guide.id,
        title: guide.title,
        status: "reference",
        body: "Later A guidance",
      },
      guide.revision,
    );
    await f.mutation(
      "settings.save",
      w.cid,
      { ...snap.settings.values, narrativeStyle: "Later A style" },
      snap.settings.revision,
    );
    await f.mutation(
      "feedback.send",
      w.cid,
      { body: "Global feedback survives all branches" },
      0,
      "campaign",
    );
    await f.mutation(
      "document.save",
      w.cid,
      {
        id: canon.id,
        title: "Bridge canon",
        status: "canon",
        body: "Corrected global bridge",
      },
      canon.revision,
      "campaign",
    );
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: saved.saveId,
        label: "Branch correction",
        recovery: false,
      }),
    );
    const b = await f.saves(w.cid, "campaign");
    assert.equal(
      b.documents.find((d) => d.id === canon.id).body,
      "Corrected global bridge",
    );
    assert.equal(b.documents.find((d) => d.id === guide.id).body, guide.body);
    assert.equal(
      b.settings.values.narrativeStyle,
      snap.settings.values.narrativeStyle,
    );
    assert.equal(b.feedback.length, 1);
    const newguide = await f.mutation(
      "document.save",
      w.cid,
      {
        id: guide.id,
        title: guide.title,
        status: "reference",
        body: "Branch B guidance",
      },
      guide.revision,
    );
    assert.equal(newguide.revision, guide.revision + 2);
    const newsettings = await f.mutation(
      "settings.save",
      w.cid,
      { ...snap.settings.values, narrativeStyle: "Branch B style" },
      snap.settings.revision,
    );
    assert.equal(newsettings.revision, snap.settings.revision + 2);
    await assert.rejects(
      f.mutation(
        "scene.save",
        w.cid,
        {
          id: w.scene,
          session_id: w.sid,
          title: "Before crossing",
          body: "Branch B correction",
          role: "narration",
        },
        1,
        "campaign",
      ),
      /rpg_validation/,
    );
    await f.mutation(
      "scene.save",
      w.cid,
      {
        id: w.scene,
        session_id: w.sid,
        title: "Before crossing",
        body: "Branch B correction",
        role: "narration",
      },
      1,
    );
    await f.saves(
      w.cid,
      "switch",
      await f.command(w.cid, { timelineId: a, recovery: false }),
    );
    const restored = await f.saves(w.cid, "campaign");
    assert.equal(
      restored.scenes.find((s) => s.id === w.scene).body,
      "Nera promised to carry the brass compass after sunrise.",
    );
    assert.equal(
      restored.documents.find((d) => d.id === guide.id).body,
      "Later A guidance",
    );
    assert.equal(restored.feedback.length, 1);
  } finally {
    await f.db.close();
  }
});

test("Phase 3.5 autosave retention, policy recovery, authorization and populated upgrade", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    await f.saves(
      w.cid,
      "policy",
      await f.command(w.cid, {
        policy: { autosave: "turn", retention: 10, loadMode: "unrestricted" },
      }),
    );
    for (let n = 0; n < 13; n++) await commitEvent(f, w);
    const read = await f.saves(w.cid, "read");
    assert.equal(read.saves.filter((s) => s.kind === "autosave").length, 10);
    const manual = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { kind: "manual", name: "Emergency point" }),
    );
    await f.saves(
      w.cid,
      "policy",
      await f.command(w.cid, {
        policy: { autosave: "off", retention: 10, loadMode: "restricted" },
      }),
    );
    await assert.rejects(
      f.saves(
        w.cid,
        "load",
        await f.command(w.cid, {
          saveId: manual.saveId,
          label: "Ordinary blocked",
          recovery: false,
        }),
      ),
      /rpg_validation/,
    );
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: manual.saveId,
        label: "Explicit recovery",
        recovery: true,
      }),
    );
    await assert.rejects(f.saves(w.cid, "read", {}, f.other), /rpg_forbidden/);
    await f.db.exec("set role authenticated");
    await assert.rejects(
      f.one("select * from rpg_private.timeline_versions"),
      /permission denied/,
    );
    await assert.rejects(
      f.one("select * from rpg_private.timeline_restore_guards"),
      /permission denied/,
    );
    await assert.rejects(f.saves(w.cid, "read"), /permission denied/);
  } finally {
    await f.db.close();
  }
  const old = await fixture(7);
  try {
    const cid = await old.campaign("Populated accepted Phase 3");
    const sid = (
      await old.mutation("session.save", cid, {
        title: "Accepted old session",
        status: "open",
        recap: "",
      })
    ).id;
    await old.mutation("scene.save", cid, {
      session_id: sid,
      title: "Old scene",
      body: "Preserved original Phase 3 promise",
      role: "narration",
    });
    await old.mutation(
      "state.save",
      cid,
      {
        summary: "Old exact point",
        current_session_id: sid,
        current_scene_id: null,
        current_location_id: null,
      },
      1,
    );
    await old.one("select public.rpg_memory($1,$2,'end',$3::jsonb)", [
      old.owner,
      cid,
      JSON.stringify({
        requestId: randomUUID(),
        campaignId: cid,
        expectedRevision: (
          await old.one(
            "select revision from rpg_private.runtime_state where campaign_id=$1",
            [cid],
          )
        ).revision,
        sessionId: sid,
      }),
    ]);
    const before = await old.one(
      "select to_jsonb(s) value from public.rpg_settings s where campaign_id=$1",
      [cid],
    );
    const oldCheckpoint = await old.one(
      "select payload from rpg_private.memory_checkpoints where campaign_id=$1",
      [cid],
    );
    for (const file of old.files.slice(7))
      await old.db.exec(await readFile(new URL(file, old.folder), "utf8"));
    // Fix S3-pre 2.3 (202610210402, the owner's decision A-39): the one settings change of the upgrade — showDc becomes
    // true in a new revision; every other value stays.
    const upgraded = await old.one(
      "select to_jsonb(s) value from public.rpg_settings s where campaign_id=$1",
      [cid],
    );
    assert.equal(before.value.values.showDc, false);
    assert.deepEqual(
      { ...upgraded.value, updated_at: before.value.updated_at },
      { ...before.value, values: { ...before.value.values, showDc: true }, revision: before.value.revision + 1 },
    );
    assert.equal((await old.saves(cid, "read")).timeline.epoch, 1);
    assert.deepEqual(
      await old.one(
        "select payload from rpg_private.memory_checkpoints where campaign_id=$1",
        [cid],
      ),
      oldCheckpoint,
    );
  } finally {
    await old.db.close();
  }
});

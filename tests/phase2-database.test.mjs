import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("Phase 2 service-only database lifecycle, atomicity and privacy", async (t) => {
  const db = new PGlite();
  const owner = randomUUID(),
    outsider = randomUUID();
  const q = async (sql, values = []) => (await db.query(sql, values)).rows[0];
  const rpc = async (cid, action, payload = {}, user = owner) =>
    (
      await q("select public.rpg_runtime($1,$2,$3,$4::jsonb) as value", [
        user,
        cid,
        action,
        JSON.stringify(payload),
      ])
    ).value;
  const mutation = async (op, cid, payload, rev = 0) =>
    (
      await q(
        "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb) as value",
        [randomUUID(), op, cid, rev, JSON.stringify(payload)],
      )
    ).value;
  const role = async (name, user = "") => {
    await db.exec(`reset role; set role ${name};`);
    await q("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  };
  const neutralPlan = {
    narration: "PRIVATE_PLAN_NOT_PUBLIC",
    checks: [],
    publicPatches: [],
    privatePatches: [],
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
  };
  let cid, other, entity, session, location, guide, config;
  const input = async (overrides = {}) => ({
    operationId: randomUUID(),
    campaignId: cid,
    expectedRevision: (await rpc(cid, "play")).revision,
    mode: "game",
    input: "A synthetic action.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
    ...overrides,
  });
  const leaseArgs = (claim) => ({ ...claim.lease });
  const cancelCommand = (operationId, commandId = randomUUID()) => ({
    commandId,
    campaignId: cid,
    operationId,
    action: "cancel",
    checkId: null,
  });
  const packet = (claim, overrides = {}) => ({
    narration: "The synthetic bell rings.",
    visualDescription: "",
    resolution: {
      changes: [],
      worldMinutes: claim.source.runtime.worldMinutes,
      configuration: claim.source.runtime.configuration,
      outcomes: [],
    },
    privatePatches: [],
    checks: [],
    guidanceProposal: null,
    ...overrides,
  });
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;",
    );
    const migrations = new URL("../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(migrations))
      .filter((file) => file.endsWith(".sql"))
      .sort())
      await db.exec(await readFile(new URL(file, migrations), "utf8"));
    await q("insert into auth.users(id) values($1),($2)", [owner, outsider]);
    await q("insert into rpg_private.owner_registry(user_id) values($1)", [
      owner,
    ]);
    await role("authenticated", owner);
    cid = (
      await mutation("campaign.create", null, {
        title: "Synthetic Runtime Tide",
        subtitle: "",
        language: "en",
      })
    ).id;
    other = (
      await mutation("campaign.create", null, {
        title: "Synthetic Runtime Copper",
        subtitle: "",
        language: "ru",
      })
    ).id;
    entity = (
      await mutation("entity.save", cid, {
        kind: "player",
        name: "Synthetic Neri",
        details: "",
        hp: 9,
        max_hp: 10,
        stats: { skill: 2, attack: 3, save: 1, defense: 12 },
        resources: { focus: 3 },
        conditions: [],
        equipment_slots: [],
      })
    ).id;
    session = (
      await mutation("session.save", cid, {
        title: "Synthetic session",
        status: "open",
        recap: "",
      })
    ).id;
    location = (
      await mutation("location.save", cid, {
        name: "Synthetic tower",
        description: "",
        status: "visited",
      })
    ).id;
    await mutation(
      "state.save",
      cid,
      {
        summary: "Synthetic public state",
        current_session_id: session,
        current_scene_id: null,
        current_location_id: location,
      },
      1,
    );
    await role("service_role");
    config = {
      profile: "console-basic-v1",
      controlledEntityIds: [entity],
      presentEntityIds: [entity],
      nearbyStorageIds: [],
      safeLocationIds: [location],
      itemRules: [],
    };
    await t.test(
      "service grants cannot replace owner/campaign authorization",
      async () => {
        await assert.rejects(rpc(cid, "play", {}, outsider), /rpg_forbidden/);
        await assert.rejects(rpc(randomUUID(), "play"), /rpg_not_found/);
        for (const denied of ["anon", "authenticated"]) {
          await role(denied, owner);
          await assert.rejects(rpc(cid, "play"), /permission denied/);
          await assert.rejects(
            q("select * from rpg_private.turns"),
            /permission denied/,
          );
        }
        await role("service_role");
      },
    );
    await t.test(
      "explicit profile config is prospective, revisioned and idempotent",
      async () => {
        const before = await rpc(cid, "play");
        const command = {
          requestId: randomUUID(),
          campaignId: cid,
          expectedRevision: before.revision,
          configuration: config,
        };
        const after = await rpc(cid, "configure", command);
        assert.equal(after.configured, true);
        assert.ok(after.revision > before.revision);
        assert.deepEqual(await rpc(cid, "configure", command), after);
        assert.equal((await rpc(other, "play")).configured, false);
        await assert.rejects(
          rpc(cid, "configure", { ...command, requestId: randomUUID() }),
          /rpg_conflict/,
        );
      },
    );
    await t.test(
      "input identity, serialized claims and stale lease fencing",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        assert.equal((await rpc(cid, "begin", accepted)).input, accepted.input);
        await assert.rejects(
          rpc(cid, "begin", { ...accepted, input: "changed" }),
          /rpg_conflict/,
        );
        await assert.rejects(rpc(cid, "begin", await input()), /rpg_conflict/);
        const first = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        assert.equal(
          await rpc(cid, "claim", { operationId: accepted.operationId }),
          null,
        );
        await role("postgres");
        await q(
          "update rpg_private.turns set lease_until=now()-interval '1 second' where id=$1",
          [accepted.operationId],
        );
        await role("service_role");
        const second = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        assert.notEqual(second.lease.token, first.lease.token);
        await assert.rejects(
          rpc(cid, "checkpoint", {
            ...leaseArgs(first),
            checkpoint: first.turn.checkpoint,
            status: "generating",
          }),
          /rpg_conflict/,
        );
        await rpc(cid, "cancel", cancelCommand(accepted.operationId));
      },
    );
    await t.test(
      "cancel command IDs cannot be reused for another operation",
      async () => {
        const first = await input();
        await rpc(cid, "begin", first);
        const command = cancelCommand(first.operationId);
        const cancelled = await rpc(cid, "cancel", command);
        assert.deepEqual(await rpc(cid, "cancel", command), cancelled);
        const second = await input();
        await rpc(cid, "begin", second);
        await assert.rejects(
          rpc(
            cid,
            "cancel",
            cancelCommand(second.operationId, command.commandId),
          ),
          /rpg_conflict/,
        );
        assert.equal(
          (await rpc(cid, "get", { operationId: second.operationId })).status,
          "pending",
        );
        await rpc(cid, "cancel", cancelCommand(second.operationId));
      },
    );
    await t.test(
      "configuration failure preserves the original input and supports the same operation after setup",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const failed = await rpc(cid, "fail", {
          ...leaseArgs(claim),
          failure: "configuration",
          retryable: true,
        });
        assert.equal(failed.input, accepted.input);
        assert.equal(failed.canRetry, true);
        const retry = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        assert.equal(retry.turn.input.operationId, accepted.operationId);
        assert.equal(retry.turn.input.input, accepted.input);
        await rpc(cid, "cancel", cancelCommand(accepted.operationId));
      },
    );
    await t.test(
      "real recorded checks retry once, private checks and DC never serialize",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const proposal = {
          index: 0,
          actorId: entity,
          targetId: null,
          kind: "skill",
          stat: "skill",
          dc: 12,
          dcPublic: false,
          visibility: "private",
          important: true,
          uncertainty: "meaningful",
          advantage: "normal",
        };
        const check = {
          ...proposal,
          id: randomUUID(),
          dice: [14],
          kept: 14,
          modifier: 2,
          total: 16,
          success: true,
          rollNumber: 1,
        };
        await rpc(cid, "checkpoint", {
          ...leaseArgs(claim),
          checkpoint: {
            ...claim.turn.checkpoint,
            plan: { ...neutralPlan, checks: [proposal] },
          },
          status: "generating",
        });
        assert.deepEqual(
          await rpc(cid, "checks", { ...leaseArgs(claim), checks: [check] }),
          [check],
        );
        assert.deepEqual(
          await rpc(cid, "checks", {
            ...leaseArgs(claim),
            checks: [{ ...check, dice: [2] }],
          }),
          [check],
        );
        const shown = await rpc(cid, "get", {
          operationId: accepted.operationId,
        });
        assert.deepEqual(shown.checks, []);
        assert.ok(!JSON.stringify(shown).includes("PRIVATE_PLAN"));
        await assert.rejects(
          rpc(cid, "checkpoint", {
            ...leaseArgs(claim),
            checkpoint: {
              ...claim.turn.checkpoint,
              plan: { ...neutralPlan, checks: [proposal] },
              checks: [check],
            },
            status: "awaiting_confirmation",
          }),
          /rpg_validation/,
        );
        await rpc(cid, "cancel", cancelCommand(accepted.operationId));
      },
    );
    await t.test(
      "atomic changes and private patches commit once with public source linkage",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const completed = await rpc(cid, "commit", {
          ...leaseArgs(claim),
          packet: packet(claim, {
            privatePatches: [
              {
                kind: "fact",
                key: "synthetic",
                operation: "set",
                value: "SYNTHETIC_PRIVATE_RUNTIME_CANARY",
                amount: null,
              },
            ],
          }),
        });
        assert.equal(completed.status, "committed");
        assert.ok(completed.committedRevision > accepted.expectedRevision);
        assert.deepEqual(await rpc(cid, "begin", accepted), completed);
        assert.deepEqual(
          await rpc(cid, "commit", {
            ...leaseArgs(claim),
            packet: packet(claim, {
              privatePatches: [
                {
                  kind: "fact",
                  key: "synthetic",
                  operation: "set",
                  value: "SYNTHETIC_PRIVATE_RUNTIME_CANARY",
                  amount: null,
                },
              ],
            }),
          }),
          completed,
        );
        assert.ok(
          !JSON.stringify(await rpc(cid, "play")).includes(
            "SYNTHETIC_PRIVATE_RUNTIME_CANARY",
          ),
        );
        await role("postgres");
        assert.equal(
          (
            await q(
              "select count(*)::integer as count from public.rpg_scenes where campaign_id=$1",
              [cid],
            )
          ).count,
          2,
        );
        assert.equal(
          (
            await q(
              "select contents#>>'{fact,synthetic}' as value from rpg_private.dm_state where campaign_id=$1",
              [cid],
            )
          ).value,
          "SYNTHETIC_PRIVATE_RUNTIME_CANARY",
        );
        const links = (
          await q(
            "select payload from rpg_private.runtime_events where operation_id=$1",
            [accepted.operationId],
          )
        ).payload;
        assert.equal(
          (
            await q(
              "select count(*)::integer as count from public.rpg_scenes where campaign_id=$1 and id in ($2,$3)",
              [cid, links.playerSceneId, links.narrationSceneId],
            )
          ).count,
          2,
        );
        await role("service_role");
      },
    );
    await t.test(
      "partial record updates are atomic, reject forged fields, and retain unrelated owner data",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const current = claim.source.snapshot.entities.find(
          (row) => row.id === entity,
        );
        const first = {
          family: "entities",
          id: entity,
          expectedRevision: current.revision,
          values: { hp: 6 },
        };
        const invalid = {
          family: "entities",
          id: entity,
          expectedRevision: current.revision + 1,
          values: { campaign_id: other },
        };
        const badPacket = packet(claim, {
          resolution: {
            ...packet(claim).resolution,
            changes: [first, invalid],
          },
        });
        await assert.rejects(
          rpc(cid, "commit", { ...leaseArgs(claim), packet: badPacket }),
          /rpg_validation/,
        );
        await role("authenticated", owner);
        assert.equal(
          (await q("select hp from public.rpg_entities where id=$1", [entity]))
            .hp,
          current.hp,
        );
        await role("service_role");
        const done = await rpc(cid, "commit", {
          ...leaseArgs(claim),
          packet: packet(claim, {
            resolution: { ...packet(claim).resolution, changes: [first] },
          }),
        });
        assert.equal(done.status, "committed");
        await role("authenticated", owner);
        const saved = await q(
          "select hp,name,details from public.rpg_entities where id=$1",
          [entity],
        );
        assert.equal(saved.hp, 6);
        assert.equal(saved.name, current.name);
        assert.equal(saved.details, current.details);
        await role("service_role");
      },
    );
    await t.test(
      "rerolls are explicit, receipt-deduplicated and quota-limited using pinned settings",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        let claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const proposal = {
          index: 0,
          actorId: entity,
          targetId: null,
          kind: "skill",
          stat: "skill",
          dc: 12,
          dcPublic: false,
          visibility: "player",
          important: true,
          uncertainty: "meaningful",
          advantage: "normal",
        };
        let check = {
          ...proposal,
          id: randomUUID(),
          dice: [14],
          kept: 14,
          modifier: 2,
          total: 16,
          success: true,
          rollNumber: 1,
        };
        let checkpoint = {
          ...claim.turn.checkpoint,
          plan: { ...neutralPlan, checks: [proposal] },
        };
        await rpc(cid, "checkpoint", {
          ...leaseArgs(claim),
          checkpoint,
          status: "generating",
        });
        await rpc(cid, "checks", { ...leaseArgs(claim), checks: [check] });
        checkpoint = { ...checkpoint, checks: [check] };
        await rpc(cid, "checkpoint", {
          ...leaseArgs(claim),
          checkpoint,
          status: "awaiting_confirmation",
        });
        claim = await rpc(cid, "claim", { operationId: accepted.operationId });
        const command = {
          commandId: randomUUID(),
          campaignId: cid,
          operationId: accepted.operationId,
          action: "reroll",
          checkId: check.id,
        };
        check = {
          ...check,
          dice: [8],
          kept: 8,
          total: 10,
          success: false,
          rollNumber: 2,
        };
        const first = await rpc(cid, "reroll", {
          ...leaseArgs(claim),
          command,
          check,
        });
        assert.deepEqual(
          await rpc(cid, "reroll", {
            ...leaseArgs(claim),
            command,
            check: { ...check, dice: [20] },
          }),
          first,
        );
        const second = { ...command, commandId: randomUUID() };
        check = {
          ...check,
          dice: [16],
          kept: 16,
          total: 18,
          success: true,
          rollNumber: 3,
        };
        const latest = await rpc(cid, "reroll", {
          ...leaseArgs(claim),
          command: second,
          check,
        });
        const replay = await rpc(cid, "reroll", {
          ...leaseArgs(claim),
          command,
          check: first[0],
        });
        assert.deepEqual(replay, latest);
        assert.equal(replay[0].rollNumber, 3);
        await assert.rejects(
          rpc(cid, "reroll", {
            ...leaseArgs(claim),
            command: { ...command, commandId: randomUUID() },
            check: { ...check, rollNumber: 4 },
          }),
          /rpg_validation/,
        );
        const publicTurn = await rpc(cid, "get", {
          operationId: accepted.operationId,
        });
        assert.equal(publicTurn.checks[0].dc, null);
        assert.equal(publicTurn.checks[0].canReroll, false);
        await rpc(cid, "checkpoint", {
          ...leaseArgs(claim),
          checkpoint: { ...checkpoint, checks: replay },
          status: "generating",
        });
        await rpc(cid, "cancel", cancelCommand(accepted.operationId));
      },
    );
    await t.test(
      "manual correction invalidates a turn instead of overwriting the correction",
      async () => {
        const accepted = await input();
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        await role("authenticated", owner);
        const currentRevision = (
          await q("select revision from public.rpg_entities where id=$1", [
            entity,
          ])
        ).revision;
        await mutation(
          "entity.save",
          cid,
          {
            id: entity,
            kind: "player",
            name: "Synthetic Neri",
            details: "Owner corrected",
            hp: 7,
            max_hp: 10,
            stats: { skill: 2 },
            resources: { focus: 3 },
            conditions: [],
            equipment_slots: [],
          },
          currentRevision,
        );
        await role("service_role");
        await assert.rejects(
          rpc(cid, "commit", { ...leaseArgs(claim), packet: packet(claim) }),
          /rpg_conflict/,
        );
        const conflict = await rpc(cid, "fail", {
          ...leaseArgs(claim),
          failure: "conflict",
          retryable: false,
        });
        assert.equal(conflict.status, "failed");
        assert.equal(conflict.canRetry, false);
        const next = await input();
        await rpc(cid, "begin", next);
        const nextClaim = await rpc(cid, "claim", {
          operationId: next.operationId,
        });
        assert.equal(nextClaim.source.snapshot.entities[0].hp, 7);
        await rpc(cid, "cancel", cancelCommand(next.operationId));
      },
    );
    await t.test(
      "feedback is public-only, cannot change state, and explicit campaign approval versions the guide",
      async () => {
        const before = await rpc(cid, "play");
        const accepted = await input({
          mode: "feedback",
          input: "Please use concise narration.",
        });
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        assert.deepEqual(claim.source.privateState, {});
        await assert.rejects(
          rpc(cid, "commit", {
            ...leaseArgs(claim),
            packet: packet(claim, {
              privatePatches: [
                {
                  kind: "fact",
                  key: "bad",
                  operation: "set",
                  value: "not allowed",
                  amount: null,
                },
              ],
            }),
          }),
          /rpg_validation/,
        );
        const completed = await rpc(cid, "commit", {
          ...leaseArgs(claim),
          packet: packet(claim, {
            guidanceProposal: "Use concise narration while preserving agency.",
          }),
        });
        assert.equal(completed.committedRevision, before.revision);
        assert.equal(
          (await rpc(cid, "play")).worldMinutes,
          before.worldMinutes,
        );
        await role("authenticated", owner);
        guide = await q(
          "select d.id,d.revision,d.body from public.rpg_documents d join public.rpg_dm_guides g on g.document_id=d.id where g.campaign_id=$1",
          [cid],
        );
        assert.equal(guide.body, "");
        await role("service_role");
        const approval = {
          requestId: randomUUID(),
          campaignId: cid,
          operationId: accepted.operationId,
          proposalId: completed.proposal.id,
          scope: "campaign",
          sessionId: null,
          expectedGuideRevision: guide.revision,
        };
        const result = await rpc(cid, "guidance", approval);
        assert.equal(result.proposal.documentRevision, guide.revision + 1);
        assert.deepEqual(await rpc(cid, "guidance", approval), result);
        await role("authenticated", owner);
        assert.equal(
          (
            await q(
              "select count(*)::integer as count from public.rpg_document_versions where document_id=$1",
              [guide.id],
            )
          ).count,
          2,
        );
        await role("service_role");
        assert.equal((await rpc(other, "play")).turns.length, 0);
      },
    );
    await t.test(
      "an old guidance proposal cannot bypass a manual guide edit by supplying the newest revision",
      async () => {
        const accepted = await input({
          mode: "feedback",
          input: "Try a quieter style.",
        });
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const done = await rpc(cid, "commit", {
          ...leaseArgs(claim),
          packet: packet(claim, { guidanceProposal: "Use quieter narration." }),
        });
        await role("authenticated", owner);
        const current = await q(
          "select d.id,d.revision,d.title,d.status,d.body from public.rpg_documents d join public.rpg_dm_guides g on g.document_id=d.id where g.campaign_id=$1",
          [cid],
        );
        const manual = await mutation(
          "document.save",
          cid,
          {
            id: current.id,
            title: current.title,
            status: current.status,
            body: "Manual guidance takes priority.",
          },
          current.revision,
        );
        await role("service_role");
        await assert.rejects(
          rpc(cid, "guidance", {
            requestId: randomUUID(),
            campaignId: cid,
            operationId: accepted.operationId,
            proposalId: done.proposal.id,
            scope: "campaign",
            sessionId: null,
            expectedGuideRevision: manual.revision,
          }),
          /rpg_conflict/,
        );
        assert.equal(
          (await rpc(cid, "get", { operationId: accepted.operationId }))
            .proposal.status,
          "proposed",
        );
        await role("authenticated", owner);
        assert.equal(
          (
            await q("select body from public.rpg_documents where id=$1", [
              current.id,
            ])
          ).body,
          "Manual guidance takes priority.",
        );
        await role("service_role");
      },
    );
    await t.test(
      "session guidance expires with session closure and invalidates pending snapshots",
      async () => {
        const accepted = await input({
          mode: "feedback",
          input: "Use gentle pacing this session.",
        });
        await rpc(cid, "begin", accepted);
        const claim = await rpc(cid, "claim", {
          operationId: accepted.operationId,
        });
        const done = await rpc(cid, "commit", {
          ...leaseArgs(claim),
          packet: packet(claim, {
            guidanceProposal: "Gentle pacing this session.",
          }),
        });
        const before = await rpc(cid, "play");
        const result = await rpc(cid, "guidance", {
          requestId: randomUUID(),
          campaignId: cid,
          operationId: accepted.operationId,
          proposalId: done.proposal.id,
          scope: "session",
          sessionId: session,
          expectedGuideRevision: done.proposal.documentRevision,
        });
        assert.ok(result.revision > before.revision);
        assert.equal((await rpc(cid, "play")).sessionGuidance.length, 1);
        await role("authenticated", owner);
        await mutation(
          "session.save",
          cid,
          {
            id: session,
            title: "Synthetic session",
            status: "closed",
            recap: "",
          },
          1,
        );
        await role("service_role");
        assert.equal((await rpc(cid, "play")).sessionGuidance.length, 0);
      },
    );
  } finally {
    await db.close();
  }
});

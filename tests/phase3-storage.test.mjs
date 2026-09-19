import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { withMemory } from "../src/lib/memory/context.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import {
  expandRetrievalRequest,
  retrieveMemory,
  selectCriticalSourceIds,
} from "../src/lib/memory/retrieval.ts";

test("Phase 3 PostgreSQL memory lifecycle, visibility and exact pending resume", async (t) => {
  const db = new PGlite();
  const owner = randomUUID(),
    outsider = randomUUID();
  const q = async (sql, values = []) => (await db.query(sql, values)).rows[0];
  const role = async (name, user = "") => {
    await db.exec(`reset role; set role ${name}`);
    await q("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  };
  const mutation = async (op, cid, payload, revision = 0) =>
    (
      await q(
        "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb) result",
        [randomUUID(), op, cid, revision, JSON.stringify(payload)],
      )
    ).result;
  const rpc = async (cid, action, payload = {}, user = owner) =>
    (
      await q("select public.rpg_memory($1,$2,$3,$4::jsonb) result", [
        user,
        cid,
        action,
        JSON.stringify(payload),
      ])
    ).result;
  const runtime = async (cid, action, payload = {}) =>
    (
      await q("select public.rpg_runtime($1,$2,$3,$4::jsonb) result", [
        owner,
        cid,
        action,
        JSON.stringify(payload),
      ])
    ).result;
  const store = createRpcMemoryStore(owner, async (args) => ({
    data: await rpc(
      args.p_campaign_id,
      args.p_action,
      args.p_payload,
      args.p_owner_id,
    ),
  }));
  const scene = (sid, text) => ({
    session_id: sid,
    title: "Synthetic evidence",
    body: text,
    role: "narration",
  });
  const selectAll = (job) => ({
    schemaVersion: 1,
    selections: job.sources.map((s) => ({
      sourceId: s.id,
      version: s.ref.version,
    })),
  });
  let cid, other, sid, entity, oldPromise, boundary;
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;",
    );
    const folder = new URL("../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(folder))
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(await readFile(new URL(file, folder), "utf8"));
    await q("insert into auth.users(id) values($1),($2)", [owner, outsider]);
    await q("insert into rpg_private.owner_registry(user_id) values($1)", [
      owner,
    ]);
    await role("authenticated", owner);
    cid = (
      await mutation("campaign.create", null, {
        title: "Memory Glass",
        subtitle: "",
        language: "en",
      })
    ).id;
    other = (
      await mutation("campaign.create", null, {
        title: "Memory Moon",
        subtitle: "",
        language: "ru",
      })
    ).id;
    entity = (
      await mutation("entity.save", cid, {
        kind: "companion",
        name: "Neri",
        details: "Synthetic companion",
        hp: 7,
        max_hp: 10,
        stats: { skill: 2 },
        resources: { focus: 1 },
        conditions: [],
        equipment_slots: [],
      })
    ).id;
    sid = (
      await mutation("session.save", cid, {
        title: "Old promise",
        status: "open",
        recap: "",
      })
    ).id;
    await mutation(
      "state.save",
      cid,
      {
        summary: "At the bronze gate",
        current_session_id: sid,
        current_scene_id: null,
        current_location_id: null,
      },
      1,
    );
    oldPromise = (
      await mutation(
        "scene.save",
        cid,
        scene(
          sid,
          "Neri promises to return the amber key; the promise is unresolved.",
        ),
      )
    ).id;
    for (let i = 0; i < 53; i++)
      await mutation(
        "scene.save",
        cid,
        scene(sid, `The recent amber key display has ${i + 1} paper labels.`),
      );
    await role("postgres");
    await q(
      "select rpg_private.memory_index($1,'private_event',$2,'1','SYNTHETIC_PRIVATE_MEMORY_CANARY','private',$3)",
      [cid, randomUUID(), sid],
    );
    await q(
      "select rpg_private.memory_index($1,'private_event',$2,'1','SYNTHETIC_OTHER_CAMPAIGN','private',null)",
      [other, randomUUID()],
    );
    await role("service_role");

    await t.test(
      "owner authorization and ordinary SQL callers cannot reach private sources or RPC",
      async () => {
        await assert.rejects(rpc(cid, "read", {}, outsider), /rpg_forbidden/);
        for (const denied of ["anon", "authenticated"]) {
          await role(denied, owner);
          await assert.rejects(rpc(cid, "read"), /permission denied/);
          await assert.rejects(
            q("select * from rpg_private.memory_private_sources"),
            /permission denied/,
          );
          await assert.rejects(
            q("select public.rpg_runtime_phase2($1,$2,'play','{}')", [
              owner,
              cid,
            ]),
            /permission denied/,
          );
        }
        await role("service_role");
      },
    );

    await t.test(
      "database text search filters visibility and knowledge before old-obligation ranking",
      async () => {
        const request = {
          timeline: (await store.read(cid)).timeline,
          campaignId: cid,
          visibility: "public",
          actorIds: [],
          query: "amber key promise",
          entityIds: [],
          requiredSourceIds: [],
          worldMinutes: 0,
          maxBytes: 24000,
          maxExcerpts: 12,
          historicalComparison: false,
        };
        const batch = await store.search(request);
        assert.ok(batch.sources.length <= 48);
        assert.ok(batch.sources.some((s) => s.ref.id === oldPromise));
        assert.equal(JSON.stringify(batch).includes("PRIVATE_MEMORY"), false);
        assert.equal(JSON.stringify(batch).includes("OTHER_CAMPAIGN"), false);
        const companion = await store.search({
          ...request,
          actorIds: [entity],
        });
        assert.equal(
          companion.sources.length,
          0,
          "legacy public visibility never grants NPC knowledge",
        );
        const privateBatch = await store.search({
          ...request,
          visibility: "private",
          query: "SYNTHETIC_PRIVATE_MEMORY_CANARY",
        });
        assert.equal(privateBatch.sources.length, 1);
        assert.equal(
          (
            await store.search({
              ...request,
              campaignId: other,
              timeline: (await store.read(other)).timeline,
            })
          ).sources.length,
          0,
        );
        const expanded = expandRetrievalRequest(
          {
            ...request,
            query: "What did Neri promise about the key?",
            historicalOnly: true,
          },
          batch.aliases,
        );
        const actual = await store.search(expanded);
        const selected = retrieveMemory(
          {
            ...expanded,
            requiredSourceIds: selectCriticalSourceIds(
              { ...expanded, query: "What did Neri promise about the key?" },
              actual,
            ),
          },
          actual,
        );
        assert.equal(selected.paused, false);
        assert.ok(
          selected.sources.some((s) => s.ref.id === oldPromise),
          "production OR search accepts alternative bilingual words",
        );
        assert.ok(
          selected.sources.every(
            (s) => !["state", "entity", "item"].includes(s.ref.kind),
          ),
        );
      },
    );

    await t.test(
      "END is durable/idempotent and jobs publish exact bounded ranges atomically",
      async () => {
        const rev = (await runtime(cid, "play")).revision;
        const input = {
          requestId: randomUUID(),
          campaignId: cid,
          expectedRevision: rev,
          sessionId: sid,
        };
        const ended = await store.end(input);
        boundary = ended.currentBoundary.id;
        assert.equal(ended.currentBoundary.recap.status, "pending");
        assert.equal((await runtime(cid, "play")).revision, rev);
        assert.deepEqual(await store.end(input), ended);
        await assert.rejects(store.end({ ...input, sessionId: randomUUID() }));
        const first = await store.claim(cid);
        assert.ok(first.sources.length <= 24);
        assert.ok(
          first.sources.reduce((n, s) => n + Buffer.byteLength(s.text), 0) <=
            24000,
        );
        await assert.rejects(
          store.publish(first, {
            schemaVersion: 1,
            selections: [{ sourceId: randomUUID(), version: "1" }],
          }),
        );
        assert.equal(
          (await rpc(cid, "context", { actorIds: [], includePrivate: false }))
            .publicWatermark,
          0,
        );
        await store.fail(first, "provider");
        await role("postgres");
        await q("update rpg_private.memory_jobs set attempts=5 where id=$1", [
          first.id,
        ]);
        await role("service_role");
        assert.equal(
          (await store.read(cid)).currentBoundary.recap.status,
          "failed",
        );
        const retry = {
          requestId: randomUUID(),
          campaignId: cid,
          boundaryId: boundary,
        };
        await store.retry(retry);
        const second = await store.claim(cid);
        assert.equal(
          second.attempts,
          1,
          "explicit owner retry starts a fresh bounded window",
        );
        await store.retry(retry);
        assert.equal(second.id, first.id);
        assert.notEqual(second.token, first.token);
        await assert.rejects(store.publish(first, selectAll(first)));
        await store.publish(second, selectAll(second));
        assert.ok((await store.context(cid, [], false)).publicWatermark > 0);
        assert.equal(
          (await store.read(cid)).currentBoundary.recap.status,
          "pending",
        );
        assert.equal(
          (await store.read(cid)).currentBoundary.recap.canRetry,
          true,
          "bounded work exposes explicit continuation",
        );
        for (let i = 0; i < 10; i++) {
          const job = await store.claim(cid);
          if (!job) break;
          await store.publish(job, selectAll(job));
        }
        const ready = await store.read(cid);
        assert.equal(ready.currentBoundary.recap.status, "ready");
        assert.ok(ready.currentBoundary.recap.text.includes("promise"));
        assert.equal(JSON.stringify(ready).includes("PRIVATE_MEMORY"), false);
        assert.equal(
          JSON.stringify(await store.context(cid, [], false)).includes(
            "PRIVATE_MEMORY",
          ),
          false,
        );
        assert.ok(
          JSON.stringify(await store.context(cid, [], true)).includes(
            "PRIVATE_MEMORY",
          ),
        );
      },
    );

    await t.test(
      "corrections invalidate summaries/checkpoints immediately; restrictive changes revoke public evidence",
      async () => {
        await role("authenticated", owner);
        await mutation(
          "scene.save",
          cid,
          {
            ...scene(
              sid,
              "Neri returned the amber key; the obligation is fulfilled.",
            ),
            id: oldPromise,
          },
          1,
        );
        assert.equal(
          (
            await db.query(
              "select * from public.rpg_memory_summaries where campaign_id=$1",
              [cid],
            )
          ).rows.length,
          0,
        );
        await role("service_role");
        const stale = await store.read(cid);
        assert.equal(
          stale.currentBoundary.checkpointStatus,
          "rebuild_required",
        );
        assert.equal(stale.currentBoundary.recap.text, null);
        const request = {
          campaignId: cid,
          visibility: "public",
          actorIds: [],
          query: "amber key",
          entityIds: [],
          requiredSourceIds: [],
          worldMinutes: 0,
          maxBytes: 24000,
          maxExcerpts: 12,
          historicalComparison: false,
        };
        const versions = (await store.search(request)).sources.filter(
          (s) => s.ref.id === oldPromise,
        );
        assert.equal(versions.length, 1);
        assert.equal(versions[0].ref.version, "2");
        assert.ok(versions[0].text.includes("returned"));
        await store.retry({
          requestId: randomUUID(),
          campaignId: cid,
          boundaryId: boundary,
        });
        const job = await store.claim(cid);
        await role("postgres");
        await q("select rpg_private.memory_restrict_source($1,'scene',$2)", [
          cid,
          oldPromise,
        ]);
        await role("service_role");
        await assert.rejects(store.publish(job, selectAll(job)));
        assert.equal(
          (await store.search(request)).sources.some(
            (s) => s.ref.id === oldPromise,
          ),
          false,
        );
        assert.equal((await store.read(cid)).currentBoundary.recap.text, null);
      },
    );

    await t.test(
      "Continue creates one next session and never restores resources or stale state",
      async () => {
        const before = await runtime(cid, "play");
        const input = {
          requestId: randomUUID(),
          campaignId: cid,
          expectedRevision: before.revision,
          boundaryId: boundary,
        };
        const continued = await store.continueSession(input);
        assert.equal(continued.currentBoundary, null);
        assert.equal(continued.sessions[0].state, "continued");
        assert.deepEqual(await store.continueSession(input), continued);
        const source = await store.source(cid, "game");
        assert.equal(
          source.snapshot.entities.find((e) => e.id === entity).hp,
          7,
        );
        assert.equal(
          source.snapshot.entities.find((e) => e.id === entity).resources.focus,
          1,
        );
        assert.equal(source.snapshot.publicState.current_scene_id, null);
        sid = source.snapshot.publicState.current_session_id;
      },
    );

    await t.test(
      "pending server check survives END, explicit Continue and terminal resume without reroll",
      async () => {
        const input = {
          operationId: randomUUID(),
          campaignId: cid,
          expectedRevision: (await runtime(cid, "play")).revision,
          mode: "game",
          input: "Try the gate once.",
          companionId: null,
          listenerIds: [],
          mechanic: null,
        };
        await runtime(cid, "begin", input);
        const claim = await runtime(cid, "claim", {
          operationId: input.operationId,
        });
        const check = {
          id: randomUUID(),
          index: 0,
          actorId: entity,
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
          narration: "Private plan",
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
        await runtime(cid, "checkpoint", {
          ...claim.lease,
          checkpoint,
          status: "generating",
        });
        await runtime(cid, "checks", { ...claim.lease, checks: [check] });
        checkpoint.checks = [check];
        await runtime(cid, "checkpoint", {
          ...claim.lease,
          checkpoint,
          status: "awaiting_confirmation",
        });
        const rev = (await runtime(cid, "play")).revision;
        const ended = await store.end({
          requestId: randomUUID(),
          campaignId: cid,
          expectedRevision: rev,
          sessionId: sid,
        });
        const bid = ended.currentBoundary.id;
        assert.equal(
          ended.currentBoundary.resume.pendingOperationId,
          input.operationId,
        );
        assert.equal((await runtime(cid, "play")).revision, rev);
        await assert.rejects(
          runtime(cid, "claim", { operationId: input.operationId }),
          /rpg_memory_paused/,
        );
        const resumed = await store.continueSession({
          requestId: randomUUID(),
          campaignId: cid,
          expectedRevision: rev,
          boundaryId: bid,
        });
        assert.equal(resumed.currentBoundary.state, "resuming");
        const same = await runtime(cid, "claim", {
          operationId: input.operationId,
        });
        assert.deepEqual(same.turn.checkpoint.checks, [check]);
        await runtime(cid, "commit", {
          ...same.lease,
          packet: {
            narration: "The gate opens.",
            visualDescription: "",
            resolution: {
              changes: [],
              worldMinutes: same.source.runtime.worldMinutes,
              configuration: same.source.runtime.configuration,
              outcomes: [],
            },
            privatePatches: [],
            checks: [check],
            guidanceProposal: null,
          },
        });
        const terminal = await store.read(cid);
        assert.equal(terminal.currentBoundary.resume.pendingOperationId, null);
        const next = await store.continueSession({
          requestId: randomUUID(),
          campaignId: cid,
          expectedRevision: (await runtime(cid, "play")).revision,
          boundaryId: bid,
        });
        assert.equal(next.currentBoundary, null);
        const saved = await runtime(cid, "get", {
          operationId: input.operationId,
        });
        assert.equal(saved.status, "committed");
        assert.deepEqual(saved.checks[0].dice, [13]);
        assert.equal(saved.checks[0].rollNumber, 1);
      },
    );

    await t.test(
      "one thousand source events across twenty sessions compact in bounded batches without losing an old promise",
      async () => {
        await role("authenticated", owner);
        const exactActor = (
          await mutation("entity.save", other, {
            kind: "player",
            name: "Exact-state traveler",
            details: "Synthetic",
            hp: 7,
            max_hp: 12,
            stats: {},
            resources: { focus: 1 },
            conditions: [],
            equipment_slots: [],
          })
        ).id;
        const pack = (
          await mutation("storage.save", other, {
            name: "Synthetic pack",
            kind: "player",
            entity_id: exactActor,
          })
        ).id;
        const exactItems = [];
        for (const [name, quantity] of [
          ["Consumed tonic", 0],
          ["Embedded knife", 0],
          ["Embedded stick", 0],
          ["Consumed binding", 0],
          ["Existing spear", 1],
        ]) {
          exactItems.push(
            (
              await mutation("item.save", other, {
                name,
                quantity,
                category: "gear",
                description: "Exact synthetic quantity after prior actions",
                mechanics: "",
                owner_entity_id: exactActor,
                storage_id: pack,
                equipped_entity_id: null,
                equipped_slot: null,
              })
            ).id,
          );
        }
        await role("postgres");
        const sessions = [];
        for (let i = 0; i < 20; i++) {
          const id = randomUUID();
          sessions.push(id);
          await q(
            "insert into public.rpg_sessions(id,campaign_id,title,status,recap,revision) values($1,$2,$3,'open','',1)",
            [id, other, `Synthetic session ${i + 1}`],
          );
          await q(
            "insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision) select gen_random_uuid(),$1,$2,'History',case when $3::int=0 and n=1 then 'Neri promises to return the blue lantern; this remains unresolved.' else 'Neri observes an unrelated blue paper decoration ' || (($3::int*50)+n)::text end,'narration',1,1 from generate_series(1,50) n",
            [other, id, i],
          );
        }
        await q(
          "update public.rpg_public_state set current_session_id=$2 where campaign_id=$1",
          [other, sessions[19]],
        );
        await role("service_role");
        const declared = {
          operationId: randomUUID(),
          campaignId: other,
          expectedRevision: (await runtime(other, "play")).revision,
          mode: "game",
          input:
            "Synthetic source fixture: existing spear provenance is preserved.",
          companionId: null,
          listenerIds: [],
          mechanic: null,
        };
        await runtime(other, "begin", declared);
        const declaredClaim = await runtime(other, "claim", {
          operationId: declared.operationId,
        });
        await runtime(other, "commit", {
          ...declaredClaim.lease,
          packet: {
            narration:
              "The existing spear retains its embedded knife and stick; binding and tonic remain consumed.",
            visualDescription: "",
            resolution: {
              changes: [],
              worldMinutes: 0,
              configuration: declaredClaim.source.runtime.configuration,
              outcomes: [],
            },
            privatePatches: [],
            checks: [],
            guidanceProposal: null,
          },
        });
        await role("postgres");
        await q(
          'insert into public.rpg_provenance(id,campaign_id,operation_id,session_id,inputs,"outputItemIds") values($1,$2,$3,$4,$5::jsonb,$6::jsonb)',
          [
            randomUUID(),
            other,
            declared.operationId,
            sessions[19],
            JSON.stringify([
              { itemId: exactItems[1], quantity: 1, disposition: "embedded" },
              { itemId: exactItems[2], quantity: 1, disposition: "embedded" },
            ]),
            JSON.stringify([exactItems[4]]),
          ],
        );
        await role("service_role");
        const beforeCompaction = await store.source(other, "game");
        await store.end({
          requestId: randomUUID(),
          campaignId: other,
          expectedRevision: (await runtime(other, "play")).revision,
          sessionId: sessions[19],
        });
        let batches = 0;
        for (let i = 0; i < 60; i++) {
          const job = await store.claim(other);
          if (!job) break;
          assert.ok(job.sources.length <= 24);
          assert.ok(
            job.sources.reduce((n, s) => n + Buffer.byteLength(s.text), 0) <=
              24000,
          );
          await store.publish(job, selectAll(job));
          batches++;
        }
        assert.ok(batches >= 42);
        const context = await store.context(other, [], false);
        assert.equal(context.overflow, false);
        assert.equal(context.uncovered.length, 0);
        assert.equal(context.publicWatermark, context.publicHighWatermark);
        const evidence = await store.search({
          campaignId: other,
          visibility: "public",
          actorIds: [],
          query: "blue lantern promise",
          entityIds: [],
          requiredSourceIds: [],
          worldMinutes: 0,
          maxBytes: 24000,
          maxExcerpts: 12,
          historicalComparison: false,
        });
        assert.ok(
          evidence.sources.some((s) => s.text.includes("promises to return")),
        );
        assert.equal(
          JSON.stringify(await store.read(other)).includes("OTHER_CAMPAIGN"),
          false,
        );
        assert.equal(
          (await store.read(other)).currentBoundary.recap.status,
          "ready",
        );
        const input = {
          operationId: randomUUID(),
          campaignId: other,
          expectedRevision: (await runtime(other, "play")).revision,
          mode: "game",
          input: "What did Neri promise about the blue lantern?",
          timeline: (await store.read(other)).timeline,
          companionId: null,
          listenerIds: [],
          mechanic: null,
        };
        const selected = await withMemory(
          await store.source(other, "game"),
          input,
          store,
          false,
        );
        assert.ok(
          selected.memory.historical.some((s) =>
            s.text.includes("promises to return"),
          ),
        );
        const assembled = buildContext(selected, input, "plan", {
          model: "gpt-6-astra",
        });
        assert.ok(
          assembled.estimatedTokens < 64000,
          "production context stays bounded after SQL compaction",
        );
        assert.equal(selected.memory.exactEvents.length, 0);
        const afterCompaction = await store.source(other, "game");
        assert.deepEqual(
          afterCompaction.snapshot.entities,
          beforeCompaction.snapshot.entities,
        );
        assert.deepEqual(
          afterCompaction.snapshot.items,
          beforeCompaction.snapshot.items,
        );
        assert.deepEqual(
          afterCompaction.runtime.provenance,
          beforeCompaction.runtime.provenance,
        );
        assert.equal(
          afterCompaction.runtime.worldMinutes,
          beforeCompaction.runtime.worldMinutes,
        );
        const unrelated = await withMemory(
          await store.source(other, "game"),
          { ...input, input: "I observe the weather." },
          store,
          false,
        );
        assert.equal(
          unrelated.memory.complete,
          true,
          "old unrelated obligations do not block new actions",
        );
      },
    );

    await t.test(
      "oversized indivisible source and expired leases never advance unseen coverage",
      async () => {
        await role("postgres");
        const hugeId = randomUUID();
        await q(
          "select rpg_private.memory_index($1,'scene',$2,'1',$3,'public',$4)",
          [
            cid,
            hugeId,
            "Witness says: " + "qualified unknown claim ".repeat(2000),
            sid,
          ],
        );
        await q(
          "select rpg_private.memory_index($1,'scene',$2,'1','Later source after oversized evidence.','public',$3)",
          [cid, randomUUID(), sid],
        );
        await q("select rpg_private.memory_invalidate($1)", [cid]);
        await role("service_role");
        await store.enqueue(cid, "rebuild");
        let first = await store.claim(cid);
        assert.ok(first);
        await role("postgres");
        await q(
          "update rpg_private.memory_jobs set lease_until=now()-interval '1 second' where id=$1",
          [first.id],
        );
        await role("service_role");
        const recovered = await store.claim(cid);
        assert.equal(recovered.id, first.id);
        assert.notEqual(recovered.token, first.token);
        await assert.rejects(store.publish(first, selectAll(first)));
        await store.publish(recovered, selectAll(recovered));
        for (let i = 0; i < 10; i++) {
          first = await store.claim(cid);
          if (!first) break;
          await store.publish(first, selectAll(first));
        }
        const context = await store.context(cid, [], false);
        assert.equal(context.overflow, true);
        assert.ok(context.publicWatermark < context.publicHighWatermark);
      },
    );
  } finally {
    await db.close();
  }
});

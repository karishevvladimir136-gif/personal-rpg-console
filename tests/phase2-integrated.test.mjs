import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { createGameplayFixtures } from "../scripts/gameplay-acceptance-helpers.mjs";

// Real production engine + production RPC adapter + committed PostgreSQL migrations.
// Auth is explicitly stubbed; provider outputs are scripted, never live model results.
test("integrated runtime, mechanics and PostgreSQL preserve the same authoritative state", async (t) => {
  const db = new PGlite();
  const owner = crypto.randomUUID();
  const marker = "SYNTHETIC_PRIVATE_PHASE2_CANARY";
  async function roleQuery(role, sql, values) {
    return db.transaction(async (tx) => {
      await tx.exec(`set local role ${role}`);
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [
        owner,
      ]);
      return (await tx.query(sql, values)).rows[0];
    });
  }
  const execute = async (args) => {
    try {
      const result = await roleQuery(
        "service_role",
        "select public.rpg_runtime($1,$2,$3,$4::jsonb) as result",
        [
          args.p_owner_id,
          args.p_campaign_id,
          args.p_action,
          JSON.stringify(args.p_payload),
        ],
      );
      return { data: result.result };
    } catch (error) {
      return {
        data: null,
        error: { code: error.code, message: error.message },
      };
    }
  };
  const store = createRpcTurnStore(owner, execute);
  const mutation = async (input) =>
    (
      await roleQuery(
        "authenticated",
        "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb) as result",
        [
          input.requestId,
          input.operation,
          input.campaignId ?? null,
          input.expectedRevision,
          JSON.stringify(input.payload),
        ],
      )
    ).result;
  const fixtureTransport = {
    async request(path, payload) {
      if (path === "/api/mutations") return mutation(payload);
      const cid = path.split("/")[3];
      if (path.endsWith("/play/config")) return store.configure(payload);
      assert.ok(path.endsWith("/play"));
      return store.readPlay(cid);
    },
  };
  const read = async (table, cid) =>
    (
      await roleQuery(
        "authenticated",
        `select coalesce(jsonb_agg(t order by t.id),'[]') as records from public.${table} t where campaign_id=$1`,
        [cid],
      )
    ).records;
  const metric = {
    model: "deterministic-test-only",
    inputTokens: 0,
    outputTokens: 0,
    calls: 1,
    latencyMs: 0,
  };
  let a,
    b,
    planCalls = 0,
    narrationCalls = 0,
    failNarration = false;
  const neutral = {
    narration: marker,
    checks: [],
    publicPatches: [],
    privatePatches: [],
    visualDescription: marker,
    clarification: null,
    guidanceProposal: null,
  };
  const provider = {
    async plan(source, input) {
      planCalls++;
      buildContext(source, input, "plan", { model: "gpt-5.4-mini" });
      const plan = structuredClone(neutral);
      if (input.input === "Inspect the synthetic bell") {
        plan.checks = [
          {
            index: 0,
            actorId: a.actorId,
            targetId: null,
            kind: "skill",
            stat: "skill",
            dc: 12,
            dcPublic: false,
            visibility: "player",
            important: true,
            uncertainty: "meaningful",
            advantage: "normal",
          },
        ];
        plan.privatePatches = [
          {
            kind: "fact",
            key: "synthetic-marker",
            operation: "set",
            value: marker,
            amount: null,
          },
        ];
      }
      if (input.input === "Reject this synthetic cross-campaign patch")
        plan.publicPatches = [
          {
            kind: "resource.spend",
            entityId: b.actorId,
            resource: "focus",
            amount: 1,
          },
        ];
      return { output: plan, usage: metric };
    },
    async narrate(source, input, resolution, checks) {
      narrationCalls++;
      assert.deepEqual(source.privateState, {});
      const context = buildContext(source, input, "narrate", {
        model: "gpt-5.4-mini",
        resolution,
        checks,
      });
      // This is private DM-to-DM intent, never a public response or state patch.
      const narrationInput = JSON.parse(context.input);
      assert.equal(narrationInput.mandatory.narrationBridge.planIntent, marker);
      assert.equal(Object.hasOwn(narrationInput.mandatory, "privateState"), false);
      if (failNarration) {
        failNarration = false;
        throw Object.assign(new Error("Synthetic transport failure"), {
          code: "provider",
          retryable: true,
        });
      }
      return {
        output: {
          narration: "The synthetic bell remains beside the path.",
          visualDescription: "A brass bell on a low post.",
          clarification: null,
        },
        usage: metric,
      };
    },
    async feedback(source, input) {
      assert.deepEqual(source.privateState, {});
      const context = buildContext(source, input, "feedback", {
        model: "gpt-5.4-mini",
      });
      assert.ok(!context.input.includes(marker));
      return {
        output: {
          narration:
            "I propose shorter descriptions. Nothing has been applied.",
          guidanceProposal:
            "Use concise descriptions while preserving player agency.",
        },
        usage: metric,
      };
    },
  };
  const deps = { store, provider };
  async function input(mode, text, mechanic = null) {
    return {
      operationId: crypto.randomUUID(),
      campaignId: a.campaignId,
      expectedRevision: (await store.readPlay(a.campaignId)).revision,
      mode,
      input: text,
      companionId: null,
      listenerIds: [],
      mechanic,
    };
  }
  const command = (turn, action = "continue", checkId = null) => ({
    commandId: crypto.randomUUID(),
    campaignId: a.campaignId,
    operationId: turn.id,
    action,
    checkId,
  });
  async function mechanic(action) {
    const request = await input(
      "mechanic",
      "Synthetic mechanical action",
      action,
    );
    let turn = await runTurn(request, deps);
    if (turn.status === "awaiting_confirmation")
      turn = await resumeTurn(command(turn), deps);
    assert.equal(turn.status, "committed", action.kind);
    return turn;
  }
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;",
    );
    const folder = new URL("../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(folder))
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(await readFile(new URL(file, folder), "utf8"));
    await db.query("insert into auth.users(id) values($1)", [owner]);
    await db.query(
      "insert into rpg_private.owner_registry(user_id) values($1)",
      [owner],
    );
    [a, b] = await createGameplayFixtures(fixtureTransport);
    const unrelated = await store.readPlay(b.campaignId);

    await t.test(
      "mechanics commit through the real store without calling a provider",
      async () => {
        await mechanic({
          kind: "item.consume",
          actorId: a.actorId,
          itemId: a.items.healing,
          quantity: 1,
        });
        await mechanic({
          kind: "resource.spend",
          entityId: a.actorId,
          resource: "focus",
          amount: 1,
        });
        assert.equal(
          (await read("rpg_entities", a.campaignId)).find(
            (e) => e.id === a.actorId,
          ).hp,
          10,
        );
        assert.equal(
          (await read("rpg_items", a.campaignId)).find(
            (i) => i.id === a.items.healing,
          ).quantity,
          1,
        );
        assert.equal(planCalls, 0);
        assert.equal(narrationCalls, 0);
      },
    );
    await t.test(
      "recorded dice survive narrator failure, retry and duplicate delivery",
      async () => {
        const request = await input("game", "Inspect the synthetic bell");
        const paused = await runTurn(request, deps);
        assert.equal(paused.status, "awaiting_confirmation");
        assert.equal(paused.checks.length, 1);
        assert.equal(paused.checks[0].dc, null);
        assert.deepEqual(await runTurn(request, deps), paused);
        failNarration = true;
        const failed = await resumeTurn(command(paused), deps);
        assert.equal(failed.status, "failed");
        assert.equal(failed.input, request.input);
        assert.equal(failed.canRetry, true);
        const completed = await resumeTurn(command(failed, "retry"), deps);
        assert.equal(completed.status, "committed");
        assert.deepEqual(
          completed.checks.map((c) => [c.id, c.dice, c.total]),
          paused.checks.map((c) => [c.id, c.dice, c.total]),
        );
        assert.equal(planCalls, 1);
        assert.deepEqual(await runTurn(request, deps), completed);
        assert.ok(
          !JSON.stringify(await store.readPlay(a.campaignId)).includes(marker),
        );
        const privateState = (
          await db.query(
            "select contents from rpg_private.dm_state where campaign_id=$1",
            [a.campaignId],
          )
        ).rows[0].contents;
        assert.equal(privateState.fact["synthetic-marker"], marker);
      },
    );
    await t.test(
      "invalid model patch fails atomically and accepted input remains",
      async () => {
        const before = await read("rpg_entities", a.campaignId);
        const request = await input(
          "game",
          "Reject this synthetic cross-campaign patch",
        );
        const failed = await runTurn(request, deps);
        assert.equal(failed.status, "failed");
        assert.equal(failed.failure, "validation");
        assert.equal(
          (await store.getPublic(a.campaignId, request.operationId)).input,
          request.input,
        );
        assert.deepEqual(await read("rpg_entities", a.campaignId), before);
        assert.deepEqual(await store.readPlay(b.campaignId), unrelated);
      },
    );
    await t.test(
      "feedback proposal cannot mutate mechanics and explicit approval creates one guide version",
      async () => {
        const gameplay = await store.readPlay(a.campaignId);
        const entities = await read("rpg_entities", a.campaignId);
        const scenes = await read("rpg_scenes", a.campaignId);
        const reply = await runTurn(
          await input("feedback", "Please use shorter descriptions"),
          deps,
        );
        assert.equal(reply.status, "committed");
        assert.equal(reply.proposal.status, "proposed");
        assert.deepEqual(await read("rpg_entities", a.campaignId), entities);
        assert.deepEqual(await read("rpg_scenes", a.campaignId), scenes);
        assert.equal(
          (await store.readPlay(a.campaignId)).revision,
          gameplay.revision,
        );
        const approval = {
          requestId: crypto.randomUUID(),
          campaignId: a.campaignId,
          operationId: reply.id,
          proposalId: reply.proposal.id,
          scope: "campaign",
          sessionId: null,
          expectedGuideRevision: reply.proposal.documentRevision,
        };
        const saved = await store.approveGuidance(approval);
        assert.equal(saved.proposal.status, "approved");
        assert.deepEqual(await store.approveGuidance(approval), saved);
        assert.equal(
          saved.proposal.documentRevision,
          reply.proposal.documentRevision + 1,
        );
      },
    );
    await t.test(
      "rest, recipes, effects and provenance share one atomic persisted state",
      async () => {
        await mechanic({
          kind: "rest.enter",
          restKind: "long",
          participantIds: [a.actorId],
        });
        const rest = (await store.readPlay(a.campaignId)).restRecords.find(
          (r) => r.status === "planned",
        );
        await mechanic({
          kind: "recipe.prepare",
          actorId: a.actorId,
          recipe: "meal",
          ingredients: [{ itemId: a.items.meat, quantity: 1 }],
          outputStorageId: a.packId,
        });
        let play = await store.readPlay(a.campaignId);
        const meal = play.configuration.itemRules.find(
          (r) => r.tag === "meal-serving",
        );
        await mechanic({
          kind: "recipe.serve",
          actorId: a.actorId,
          itemId: meal.itemId,
          recipientIds: [a.actorId],
        });
        await mechanic({
          kind: "rest.complete",
          restId: rest.id,
          supplies: [{ itemId: a.items.supply, quantity: 1 }],
        });
        play = await store.readPlay(a.campaignId);
        assert.equal(play.worldMinutes, 480);
        assert.ok(play.effects.some((e) => e.definition.status === "active"));
        const items = await read("rpg_items", a.campaignId);
        assert.equal(items.find((i) => i.id === meal.itemId).quantity, 0);
        assert.equal(items.find((i) => i.id === a.items.supply).quantity, 7);
        assert.equal(items.find((i) => i.id === a.items.meat).quantity, 2);
        assert.ok(
          play.provenance.some((p) =>
            p.inputs.some((i) => i.itemId === a.items.meat),
          ),
        );
        assert.deepEqual(await store.readPlay(b.campaignId), unrelated);
      },
    );
  } finally {
    await db.close();
  }
});

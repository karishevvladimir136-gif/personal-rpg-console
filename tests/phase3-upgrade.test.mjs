import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createGameplayFixtures } from "../scripts/gameplay-acceptance-helpers.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import { isTimelineFence } from "../src/lib/saves/fence.ts";

// Phase 3.5 adds serving metadata; every pre-existing gameplay field must still match exactly.
function withoutServingFence(value, expectedFence) {
  if (Array.isArray(value))
    return value.map((row) => withoutServingFence(row, expectedFence));
  if (!value || typeof value !== "object") return value;
  if (Object.hasOwn(value, "timeline"))
    assert.deepEqual(value.timeline, expectedFence);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "timeline")
      .map(([key, child]) => [key, withoutServingFence(child, expectedFence)]),
  );
}

test("migration upgrades populated Phase 2 history without changing exact state or inventing knowledge", async () => {
  const db = new PGlite();
  const owner = crypto.randomUUID();
  const call = async (role, sql, args) =>
    db.transaction(async (tx) => {
      await tx.exec(`set local role ${role}`);
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [
        owner,
      ]);
      return (await tx.query(sql, args)).rows[0].result;
    });
  const rpc = (name) => async (a) => ({
    data: await call(
      "service_role",
      `select public.${name}($1,$2,$3,$4::jsonb) result`,
      [a.p_owner_id, a.p_campaign_id, a.p_action, JSON.stringify(a.p_payload)],
    ),
  });
  const turns = createRpcTurnStore(owner, rpc("rpg_runtime"));
  const fixtureApi = {
    async request(path, payload) {
      if (path === "/api/mutations")
        return call(
          "authenticated",
          "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb) result",
          [
            payload.requestId,
            payload.operation,
            payload.campaignId ?? null,
            payload.expectedRevision,
            JSON.stringify(payload.payload),
          ],
        );
      if (path.endsWith("/play/config")) return turns.configure(payload);
      return turns.readPlay(path.split("/")[3]);
    },
  };
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;",
    );
    const folder = new URL("../supabase/migrations/", import.meta.url);
    const files = (await readdir(folder))
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files.filter((f) => f < "202609180005"))
      await db.exec(await readFile(new URL(file, folder), "utf8"));
    await db.query("insert into auth.users(id) values($1)", [owner]);
    await db.query(
      "insert into rpg_private.owner_registry(user_id) values($1)",
      [owner],
    );
    const [a, b] = await createGameplayFixtures(fixtureApi);
    const input = {
      operationId: crypto.randomUUID(),
      campaignId: a.campaignId,
      expectedRevision: (await turns.readPlay(a.campaignId)).revision,
      mode: "mechanic",
      input: "Spend one synthetic focus.",
      companionId: null,
      listenerIds: [],
      mechanic: {
        kind: "resource.spend",
        entityId: a.actorId,
        resource: "focus",
        amount: 1,
      },
    };
    const turn = await runTurn(input, {
      store: turns,
      provider: {
        plan() {
          throw Error("No AI");
        },
        narrate() {
          throw Error("No AI");
        },
        feedback() {
          throw Error("No AI");
        },
      },
    });
    assert.equal(turn.status, "committed");
    const before = await turns.readPlay(a.campaignId);
    const beforeB = await turns.readPlay(b.campaignId);
    for (const file of files.filter((f) => f >= "202609180005"))
      await db.exec(await readFile(new URL(file, folder), "utf8"));
    const after = await turns.readPlay(a.campaignId),
      afterB = await turns.readPlay(b.campaignId);
    assert.ok(
      isTimelineFence(after.timeline) && isTimelineFence(afterB.timeline),
    );
    assert.equal(after.timeline.epoch, 1);
    assert.equal(afterB.timeline.epoch, 1);
    assert.notEqual(after.timeline.timelineId, afterB.timeline.timelineId);
    assert.deepEqual(withoutServingFence(after, after.timeline), before);
    assert.deepEqual(withoutServingFence(afterB, afterB.timeline), beforeB);
    const memory = createRpcMemoryStore(owner, rpc("rpg_memory"));
    const selected = await memory.search({
      campaignId: a.campaignId,
      visibility: "public",
      actorIds: [a.companionId],
      query: "focus",
      entityIds: [],
      requiredSourceIds: [],
      worldMinutes: 0,
      maxBytes: 12000,
      maxExcerpts: 12,
      historicalComparison: false,
    });
    assert.ok(
      selected.sources.length > 0,
      "backfilled committed event retains pinned witnesses",
    );
    assert.ok(selected.sources.every((s) => s.knownBy.includes(a.companionId)));
    const recap = (
      await db.query(
        "select rpg_private.memory_public_recap_entry($1::jsonb) result",
        [
          JSON.stringify({
            ref: { kind: "event" },
            text:
              "Validated public outcomes: " +
              JSON.stringify([
                {
                  text: "Foraging used one hour without finding supplies.",
                  entityIds: [a.actorId],
                  kind: "forage",
                },
              ]),
          }),
        ],
      )
    ).rows[0].result;
    assert.equal(recap, "Foraging used one hour without finding supplies.");
    assert.equal(
      (await memory.source(a.campaignId, "game")).snapshot.entities.find(
        (e) => e.id === a.actorId,
      ).resources.focus,
      2,
    );
  } finally {
    await db.close();
  }
});

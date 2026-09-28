import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture } from "./phase35-storage-fixture.mjs";
import { makeSource, makePack } from "./wave1-library-fixtures.mjs";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { createAdventureService } from "../src/lib/adventures/service.ts";
import {
  createWorldAttempt,
  newHeroAttempt,
  prepareAdventureAttempt,
  versionAdventureAttempt,
} from "../src/lib/adventures/client.ts";

async function setup() {
  const f = await fixture(23);
  try {
    // Read-only override supports independent review of Lead-owned SQL without
    // copying or changing it. This database is disposable and synthetic only.
    await f.db.exec(
      await readFile(
        process.env.ADVENTURE_V1_REVIEW_SQL ??
          new URL(
            "../supabase/migrations/202609270024_adventure_v1.sql",
            import.meta.url,
          ),
        "utf8",
      ),
    );
    f.adventure = async (owner, campaign, action, payload, timeline) =>
      (
        await f.one(
          "select public.rpg_adventures($1,$2,$3,$4::jsonb,$5::jsonb) result",
          [
            owner,
            campaign,
            action,
            JSON.stringify(payload),
            timeline === null ? null : JSON.stringify(timeline),
          ],
        )
      ).result;
    f.service = createAdventureService(f.owner, async (args) => {
      try {
        return {
          data: await f.adventure(
            args.p_owner_id,
            args.p_campaign_id,
            args.p_action,
            args.p_payload,
            args.p_timeline,
          ),
        };
      } catch (error) {
        return { error: { code: error.code, message: error.message } };
      }
    });
    f.read = async (cid) => f.service.read(cid, await f.fence(cid));
    f.hero = async (world) =>
      f.service.performWorld(
        newHeroAttempt(
          { worlds: [world], packs: [] },
          world.id,
          "Independent ordinary hero",
          "Ari",
          "en",
        ),
      );
    f.world = async (packVersionIds = []) =>
      (
        await f.service.performWorld(
          createWorldAttempt(await f.service.worlds(), {
            title: "Owner World",
            premise:
              "An owner-authored foundation, without predetermined quests.",
            packVersionIds,
          }),
        )
      ).world;
    f.put = async (record) =>
      (
        await f.one(
          "select public.rpg_library($1,null,'put',$2::jsonb,null) result",
          [f.owner, JSON.stringify({ operationId: randomUUID(), record })],
        )
      ).result;
    return f;
  } catch (error) {
    await f.db.close();
    throw error;
  }
}
const publicOnly = (value) =>
  assert.doesNotMatch(
    JSON.stringify(value),
    /PRIVATE_EXACT_SOURCE|PRIVATE_CORRECTED_SOURCE|manifestId|sourceVersionIds|canonGeneration|ruleset|payload|knownByEntityIds/,
  );

test("independent SQL review: corrected source blocks new execution while durable receipt/history remains inspectable", async () => {
  const f = await setup();
  try {
    const source = makeSource();
    source.ownerId = f.owner;
    source.body.original.text = "PRIVATE_EXACT_SOURCE";
    source.body.digest = sha256(source.body.original.text);
    const pack = makePack(source);
    pack.ownerId = f.owner;
    pack.body.approval.ownerId = f.owner;
    await f.put(source);
    await f.put(pack);
    const world = await f.world([pack.versionId]),
      hero = await f.hero(world),
      cid = hero.campaignId;
    const prepared = prepareAdventureAttempt(await f.read(cid), {
      title: "Reviewed chapter",
      premise: "Seek useful discoveries; I choose how to respond.",
      pacing: { kind: "evening", custom: null },
    });
    const first = await f.service.perform(prepared),
      before = await f.query(
        "select * from rpg_private.world_events where campaign_id=$1 order by sequence",
        [cid],
      );
    const a = first.snapshot.adventures[0],
      staleStart = versionAdventureAttempt(first.snapshot, a.id, "start");
    await f.put({
      ...source,
      version: 2,
      versionId: randomUUID(),
      previousVersionId: source.versionId,
      body: {
        ...source.body,
        visibility: "private",
        original: { kind: "text", text: "PRIVATE_CORRECTED_SOURCE" },
        digest: sha256("PRIVATE_CORRECTED_SOURCE"),
      },
    });
    const corrected = await f.read(cid);
    assert.equal(corrected.canChange, false);
    assert.equal(corrected.adventures[0].status, "prepared");
    publicOnly(corrected);
    await assert.rejects(
      f.service.perform(staleStart),
      (error) => error.code === "conflict",
    );
    await assert.rejects(f.hero(world), (error) => error.code === "conflict");
    const replay = await f.service.perform(prepared);
    assert.equal(replay.requestId, prepared.input.requestId);
    assert.equal(replay.snapshot.canChange, false);
    publicOnly(replay);
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.world_events where campaign_id=$1 order by sequence",
        [cid],
      ),
      before,
    );
    assert.equal((await f.read(cid)).history.length, 1);
  } finally {
    await f.db.close();
  }
});

test("independent SQL review: same-epoch exact replay precedes mutable head fences; foreign epoch/campaign/owner fails closed", async () => {
  const f = await setup();
  try {
    const world = await f.world(),
      hero = await f.hero(world),
      cid = hero.campaignId;
    const prepared = prepareAdventureAttempt(await f.read(cid), {
      title: "Reviewed chapter",
      premise: "My route remains open.",
      pacing: { kind: "open", custom: null },
    });
    const first = await f.service.perform(prepared),
      a = first.snapshot.adventures[0];
    const start = versionAdventureAttempt(first.snapshot, a.id, "start"),
      started = await f.service.perform(start);
    assert.notEqual(
      started.snapshot.expectedHeadId,
      first.snapshot.expectedHeadId,
    );
    const receiptBefore = await f.one(
      "select result from rpg_private.world_commands where id=$1",
      [prepared.input.requestId],
    );
    const replay = await f.service.perform(prepared);
    assert.equal(replay.snapshot.adventures[0].status, "active");
    assert.equal(replay.snapshot.history.length, 2);
    publicOnly(replay);
    assert.deepEqual(
      await f.one("select result from rpg_private.world_commands where id=$1", [
        prepared.input.requestId,
      ]),
      receiptBefore,
    );
    await assert.rejects(
      f.adventure(f.owner, cid, prepared.action, prepared.input, {
        ...prepared.input.timeline,
        epoch: prepared.input.timeline.epoch + 1,
      }),
      /rpg_conflict/,
    );
    const other = (await f.hero(world)).campaignId,
      otherCatalog = await f.read(other);
    await assert.rejects(
      f.adventure(
        f.owner,
        other,
        prepared.action,
        {
          ...prepared.input,
          campaignId: other,
          timeline: otherCatalog.timeline,
        },
        otherCatalog.timeline,
      ),
      /rpg_conflict/,
    );
    await assert.rejects(
      f.adventure(
        f.other,
        cid,
        "read",
        { timeline: started.snapshot.timeline },
        started.snapshot.timeline,
      ),
      /rpg_forbidden/,
    );
    assert.equal((await f.read(other)).history.length, 0);
  } finally {
    await f.db.close();
  }
});

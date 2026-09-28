import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id } from "./adventure-v1-fixtures.mjs";
import { createAdventureService } from "../src/lib/adventures/service.ts";
import {
  versionAdventureAttempt,
  createWorldAttempt,
  newHeroAttempt,
} from "../src/lib/adventures/client.ts";

test("service preserves immutable receipt and then reads current head before next command", async () => {
  const f = fixture(),
    command = versionAdventureAttempt(
      f.catalog,
      f.adventure.id,
      "start",
      undefined,
      () => id(200),
    );
  const oldReceipt = {
    requestId: command.input.requestId,
    snapshot: structuredClone(f.catalog),
  };
  const fresh = fixture("active").catalog;
  fresh.expectedHeadId = id(202);
  fresh.revision = 4;
  fresh.runtimeRevision = 5;
  const calls = [],
    service = createAdventureService(id(7), async (args) => {
      calls.push(structuredClone(args));
      return { data: args.p_action === "read" ? fresh : oldReceipt };
    });
  for (let retry = 0; retry < 2; retry++) {
    const result = await service.perform(command);
    assert.deepEqual(result, {
      requestId: command.input.requestId,
      snapshot: fresh,
    });
  }
  assert.deepEqual(oldReceipt.snapshot, f.catalog);
  assert.deepEqual(
    calls.map((a) => a.p_action),
    ["start", "read", "start", "read"],
  );
  assert.deepEqual(calls[0], {
    p_owner_id: id(7),
    p_campaign_id: id(1),
    p_action: "start",
    p_payload: command.input,
    p_timeline: f.catalog.timeline,
  });
  assert.deepEqual(calls[1].p_payload, { timeline: f.catalog.timeline });
  assert.equal(
    versionAdventureAttempt(
      fresh,
      id(20),
      "end",
      { summary: null, review: null },
      () => id(203),
    ).input.expectedHeadId,
    id(202),
  );
});
test("rejected write does not refresh or expose SQL private exception text", async () => {
  const f = fixture(),
    command = versionAdventureAttempt(
      f.catalog,
      id(20),
      "start",
      undefined,
      () => id(204),
    );
  let calls = 0;
  const service = createAdventureService(id(7), async () => {
    calls++;
    return {
      error: { code: "P0001", message: "rpg_conflict PRIVATE_MANIFEST" },
    };
  });
  await assert.rejects(
    service.perform(command),
    (e) => e.code === "conflict" && !e.message.includes("PRIVATE"),
  );
  assert.equal(calls, 1);
});
test("failed read after confirmed receipt preserves unconfirmed recovery and exact replay", async () => {
  const f = fixture(),
    command = versionAdventureAttempt(
      f.catalog,
      id(20),
      "start",
      undefined,
      () => id(205),
    );
  let committed = 0,
    readable = false;
  const receipt = { requestId: command.input.requestId, snapshot: f.catalog };
  const service = createAdventureService(id(7), async (args) => {
    if (args.p_action === "read")
      return readable
        ? { data: f.catalog }
        : { error: { message: "rpg_conflict" } };
    if (!committed) committed++;
    assert.deepEqual(args.p_payload, command.input);
    return { data: receipt };
  });
  await assert.rejects(
    service.perform(command),
    (e) => e.code === "unavailable",
  );
  readable = true;
  assert.equal((await service.perform(command)).requestId, id(205));
  assert.equal(committed, 1);
});
test("owner World actions have null campaign/timeline; New Hero uses fixed ordinary starter", async () => {
  const f = fixture(),
    calls = [],
    world = createWorldAttempt(
      f.worlds,
      { title: f.world.title, premise: f.world.premise, packVersionIds: [] },
      () => id(206),
    );
  const hero = newHeroAttempt(
    f.worlds,
    f.world.id,
    "Hero campaign",
    "Fighter",
    "en",
    () => id(207),
  );
  const service = createAdventureService(id(7), async (args) => {
    calls.push(args);
    return {
      data:
        args.p_action === "worlds"
          ? f.worlds
          : args.p_action === "world_create"
            ? { requestId: id(206), world: f.world }
            : { requestId: id(207), campaignId: id(40), heroId: id(41) },
    };
  });
  assert.deepEqual(await service.worlds(), f.worlds);
  assert.equal((await service.performWorld(world)).world.id, f.world.id);
  assert.equal((await service.performWorld(hero)).campaignId, id(40));
  assert.ok(
    calls.every(
      (c) =>
        c.p_owner_id === id(7) &&
        c.p_campaign_id === null &&
        c.p_timeline === null,
    ),
  );
  assert.equal(calls[2].p_payload.template, "console-basic-fighter-level1-v1");
});

import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id, review } from "./adventure-v1-fixtures.mjs";
import {
  parseAdventureCatalog,
  parseAdventureCommand,
  parseAdventurePacing,
  parseAdventureReview,
  parseWorldCommand,
} from "../src/lib/adventures/validation.ts";
import {
  bindWorldAttempt,
  prepareAdventureAttempt,
  versionAdventureAttempt,
  createWorldAttempt,
  newHeroAttempt,
  readAdventureResult,
  readWorldResult,
  restoreAdventureAttempt,
  restoreWorldAttempt,
  adventurePendingKey,
  worldPendingKey,
  createAdventureTransport,
} from "../src/lib/adventures/client.ts";
import { buildAdventureGuidance } from "../src/lib/adventures/context.ts";

test("public catalog accepts immutable inherited origin history and rejects private/source authority", () => {
  const f = fixture();
  f.adventure.timelineId = id(80);
  f.catalog.history = [structuredClone(f.adventure)];
  assert.deepEqual(parseAdventureCatalog(f.catalog, id(1)), f.catalog);
  for (const mutate of [
    (v) => {
      v.manifestId = id(90);
    },
    (v) => {
      v.adventures[0].basis = { privateText: "PRIVATE_SENTINEL" };
    },
    (v) => {
      v.adventures[0].campaignId = id(90);
    },
    (v) => {
      v.timeline.sourceHead = 3;
    },
    (v) => {
      v.detachedPlayable = true;
    },
    (v) => {
      v.activeAdventureId = id(20);
    },
    (v) => {
      v.adventures[0].premise = "Changed outside history";
    },
    (v) => {
      v.history.push(v.history[0]);
    },
  ]) {
    const value = structuredClone(f.catalog);
    mutate(value);
    assert.throws(() => parseAdventureCatalog(value, id(1)));
  }
});
test("manual pacing and qualitative review preserve owner text with bounded custom guidance", () => {
  for (const kind of ["quick", "evening", "mini_arc", "open"])
    assert.deepEqual(parseAdventurePacing({ kind, custom: null }), {
      kind,
      custom: null,
    });
  assert.deepEqual(
    parseAdventurePacing({
      kind: "custom",
      custom: "Enough room for one evening; I may decline the hook.",
    }),
    {
      kind: "custom",
      custom: "Enough room for one evening; I may decline the hook.",
    },
  );
  for (const value of [
    { kind: "quick", custom: "force countdown" },
    { kind: "custom", custom: null },
    { kind: "custom", custom: " " },
    { kind: "open", custom: null, worldMinutes: 120 },
  ])
    assert.throws(() => parseAdventurePacing(value));
  assert.deepEqual(parseAdventureReview(review()), review());
  assert.throws(() => parseAdventureReview({ ...review(), score: 10 }));
});
test("initial World binding and preparation use only offered versions and exact current fences", () => {
  const f = fixture(),
    old = structuredClone(f.catalog);
  old.worldBinding = null;
  old.adventures = [];
  old.history = [];
  const bind = bindWorldAttempt(old, f.worlds, f.world.id, () => id(100));
  assert.equal(bind.input.expectedHeadId, old.expectedHeadId);
  assert.equal(bind.input.worldVersion, f.world.version);
  assert.throws(() => bindWorldAttempt(f.catalog, f.worlds, f.world.id));
  assert.throws(() => bindWorldAttempt(old, f.worlds, id(99)));
  const prepared = prepareAdventureAttempt(f.catalog, f.setup, () => id(101));
  assert.equal(prepared.input.mode, "canon");
  assert.equal(prepared.input.expectedRuntimeRevision, 4);
  for (const extra of [
    "manifestId",
    "saveId",
    "heroId",
    "privateState",
    "model",
    "stats",
  ])
    assert.throws(() =>
      parseAdventureCommand({
        ...prepared,
        input: { ...prepared.input, [extra]: id(90) },
      }),
    );
  assert.throws(() =>
    parseAdventureCommand({
      ...prepared,
      input: { ...prepared.input, mode: "detached" },
    }),
  );
  const missing = structuredClone(prepared);
  delete missing.input.expectedHeadId;
  assert.throws(() => parseAdventureCommand(missing));
  assert.throws(() =>
    prepareAdventureAttempt({ ...f.catalog, canChange: false }, f.setup),
  );
});
test("manual lifecycle actions pin one reviewed Adventure version and enforce phases", () => {
  const f = fixture();
  const started = versionAdventureAttempt(
    f.catalog,
    f.adventure.id,
    "start",
    undefined,
    () => id(102),
  );
  assert.equal(started.input.expectedAdventureVersion, 1);
  assert.throws(() =>
    versionAdventureAttempt(f.catalog, f.adventure.id, "end", {
      summary: null,
      review: null,
    }),
  );
  const active = fixture("active");
  assert.equal(
    versionAdventureAttempt(
      active.catalog,
      active.adventure.id,
      "end",
      { summary: "Owner ending", review: review() },
      () => id(103),
    ).input.summary,
    "Owner ending",
  );
  assert.throws(() =>
    versionAdventureAttempt(active.catalog, active.adventure.id, "start"),
  );
  for (const status of ["completed", "abandoned"]) {
    const ended = fixture(status);
    assert.equal(
      versionAdventureAttempt(
        ended.catalog,
        ended.adventure.id,
        "review",
        { review: review() },
        () => id(104),
      ).action,
      "review",
    );
    assert.throws(() =>
      versionAdventureAttempt(
        ended.catalog,
        ended.adventure.id,
        "edit",
        f.setup,
      ),
    );
  }
});
test("World creation and New Hero are explicit owner premise and trusted template only", () => {
  const f = fixture();
  const world = createWorldAttempt(
    f.worlds,
    {
      title: "Original World",
      premise: "An owner-authored world.",
      packVersionIds: [],
    },
    () => id(105),
  );
  assert.deepEqual(world.input.packVersionIds, []);
  assert.throws(() =>
    createWorldAttempt(f.worlds, {
      title: "World",
      premise: "Text",
      packVersionIds: [id(99)],
    }),
  );
  assert.throws(() =>
    createWorldAttempt(f.worlds, {
      title: "World",
      premise: " ",
      packVersionIds: [],
    }),
  );
  const hero = newHeroAttempt(
    f.worlds,
    f.world.id,
    "Independent campaign",
    "Мой герой",
    "ru",
    () => id(106),
  );
  assert.equal(hero.input.template, "console-basic-fighter-level1-v1");
  assert.equal(hero.input.worldVersion, 1);
  for (const extra of [
    "level",
    "stats",
    "inventory",
    "reward",
    "campaignId",
    "saveId",
  ])
    assert.throws(() =>
      parseWorldCommand({ ...hero, input: { ...hero.input, [extra]: 999 } }),
    );
});
test("receipt readers reject wrong request/scope/timeline and private result extras", () => {
  const f = fixture(),
    command = versionAdventureAttempt(
      f.catalog,
      f.adventure.id,
      "start",
      undefined,
      () => id(107),
    );
  const reply = { requestId: command.input.requestId, snapshot: f.catalog };
  assert.deepEqual(readAdventureResult(reply, command), reply);
  for (const value of [
    { ...reply, requestId: id(99) },
    { ...reply, snapshot: { ...f.catalog, campaignId: id(99) } },
    {
      ...reply,
      snapshot: { ...f.catalog, timeline: { ...f.catalog.timeline, epoch: 2 } },
    },
    { ...reply, privateText: "PRIVATE" },
  ])
    assert.throws(
      () => readAdventureResult(value, command),
      (e) => e.code === "uncertain",
    );
  const world = createWorldAttempt(
    f.worlds,
    { title: f.world.title, premise: f.world.premise, packVersionIds: [] },
    () => id(108),
  );
  assert.equal(
    readWorldResult({ requestId: world.input.requestId, world: f.world }, world)
      .world.id,
    f.world.id,
  );
  assert.throws(() =>
    readWorldResult(
      {
        requestId: world.input.requestId,
        world: { ...f.world, premise: "different" },
      },
      world,
    ),
  );
});
test("reload recovery preserves the exact old fences and rejects foreign/corrupt commands", () => {
  const f = fixture(),
    command = versionAdventureAttempt(
      f.catalog,
      f.adventure.id,
      "start",
      undefined,
      () => id(109),
    );
  const json = JSON.stringify(command);
  assert.deepEqual(restoreAdventureAttempt(json, id(1)), command);
  assert.equal(restoreAdventureAttempt(json, id(99)), null);
  assert.equal(restoreAdventureAttempt("broken", id(1)), null);
  assert.equal(
    restoreAdventureAttempt(
      JSON.stringify({
        ...command,
        input: { ...command.input, privateManifest: id(80) },
      }),
      id(1),
    ),
    null,
  );
  const hero = newHeroAttempt(f.worlds, f.world.id, "New", "Hero", "en", () =>
    id(110),
  );
  assert.deepEqual(
    restoreWorldAttempt(JSON.stringify(hero), "new_campaign"),
    hero,
  );
  assert.equal(restoreWorldAttempt(JSON.stringify(hero), "world_create"), null);
  assert.notEqual(
    worldPendingKey("world_create"),
    worldPendingKey("new_campaign"),
  );
  assert.notEqual(adventurePendingKey(id(1)), adventurePendingKey(id(99)));
});
test("transport never auto retries a lost write and uses exact fenced same-origin payload", async () => {
  const f = fixture(),
    command = versionAdventureAttempt(
      f.catalog,
      f.adventure.id,
      "start",
      undefined,
      () => id(111),
    ),
    calls = [];
  const transport = createAdventureTransport(async (url, options) => {
    calls.push({ url, options });
    throw new Error("NETWORK_PRIVATE_SENTINEL");
  });
  await assert.rejects(
    transport.send(command),
    (e) => e.code === "uncertain" && !e.message.includes("PRIVATE"),
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.credentials, "same-origin");
  assert.equal(calls[0].options.cache, "no-store");
  assert.deepEqual(JSON.parse(calls[0].options.body), command);
  const denied = createAdventureTransport(
    async () =>
      new Response(
        JSON.stringify({
          error: { code: "conflict", message: "PRIVATE_ERROR" },
        }),
        { status: 409 },
      ),
  );
  await assert.rejects(
    denied.send(command),
    (e) => e.code === "conflict" && !e.message.includes("PRIVATE"),
  );
});
test("one active Adventure provides advisory context only; sandbox has no synthetic context", () => {
  const f = fixture("active"),
    guidance = buildAdventureGuidance(f.catalog);
  assert.equal(guidance.premise, f.adventure.premise);
  assert.equal(guidance.kind, "owner-advisory");
  assert.deepEqual(guidance.pacing, f.adventure.pacing);
  assert.match(
    guidance.boundaries.join(" "),
    /authoritative current Party|Never choose player actions|intrinsic threat/,
  );
  assert.doesNotMatch(
    JSON.stringify(guidance),
    /manifestId|privateText|enemyHp|rewardAmount|timerMinutes|stats/,
  );
  assert.equal(buildAdventureGuidance(fixture("completed").catalog), null);
});

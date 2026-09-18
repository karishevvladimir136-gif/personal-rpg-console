// Real local Auth + HTTP + database verification, with NO OpenAI calls.
// Creates fresh synthetic fixtures and leaves them for owner inspection.
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import {
  acceptanceEnvironment,
  httpSession,
  credentials,
  authenticatedNonowner,
  createGameplayFixtures,
  pathFor,
  mutation,
} from "./gameplay-acceptance-helpers.mjs";

const { config, base } = acceptanceEnvironment();
const owner = httpSession(base),
  anonymous = httpSession(base);
const nonowner = await authenticatedNonowner(config, base);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
const fixtures = await createGameplayFixtures(owner);
await mkdir("test-results", { recursive: true });
await writeFile(
  "test-results/phase2-fixtures.json",
  JSON.stringify(fixtures, null, 2),
);
const [a, b] = fixtures;
const root = pathFor(a.campaignId);
const snapshot = () => owner.request(root);
const play = () => owner.request(`${root}/play`);
const passes = [];
function pass(name) {
  passes.push(name);
  console.log(`PASS: ${name}`);
}
const beforeB = await owner.request(pathFor(b.campaignId));
const playB = await owner.request(`${pathFor(b.campaignId)}/play`);
for (const session of [anonymous, nonowner]) {
  const status = session === anonymous ? 401 : 403;
  for (const path of [`${root}/play`, `${root}/turns/${crypto.randomUUID()}`])
    await session.request(path, undefined, status);
  for (const path of [
    `${root}/turns`,
    `${root}/play/config`,
    `${root}/guidance`,
    `${root}/turns/${crypto.randomUUID()}/resume`,
  ])
    await session.request(path, {}, status);
}
await owner.request(`${root}/turns`, {}, 403, "https://unrelated.invalid");
pass(
  "real Supabase Auth and owner cookies; anonymous/non-owner/foreign-origin runtime denial",
);

async function inputFor(
  mechanic,
  text = "Synthetic manual mechanics acceptance",
) {
  return {
    operationId: crypto.randomUUID(),
    campaignId: a.campaignId,
    expectedRevision: (await play()).revision,
    mode: "mechanic",
    input: text,
    companionId: null,
    listenerIds: [],
    mechanic,
  };
}
async function run(mechanic) {
  const input = await inputFor(mechanic);
  let turn = await owner.request(`${root}/turns`, input);
  if (turn.status === "awaiting_confirmation")
    turn = await owner.request(`${root}/turns/${turn.id}/resume`, {
      commandId: crypto.randomUUID(),
      campaignId: a.campaignId,
      operationId: turn.id,
      action: "continue",
      checkId: null,
    });
  assert.equal(turn.status, "committed", `Synthetic ${mechanic.kind} failed`);
  return { input, turn };
}
const used = await run({
  kind: "item.consume",
  actorId: a.actorId,
  itemId: a.items.healing,
  quantity: 1,
});
const afterUse = await snapshot();
assert.equal(afterUse.items.find((i) => i.id === a.items.healing).quantity, 1);
assert.equal(afterUse.entities.find((e) => e.id === a.actorId).hp, 10);
assert.deepEqual(await owner.request(`${root}/turns`, used.input), used.turn);
assert.deepEqual(
  await owner.request(`${root}/turns/${used.turn.id}`),
  used.turn,
);
assert.deepEqual(await snapshot(), afterUse);
await owner.request(
  `${root}/turns`,
  { ...used.input, input: "Changed identity" },
  409,
);
pass(
  "real committed consequence, immutable input identity, duplicate and refresh protection",
);

const spend = await inputFor({
  kind: "resource.spend",
  entityId: a.actorId,
  resource: "focus",
  amount: 1,
});
const [first, second] = await Promise.all([
  owner.request(`${root}/turns`, spend),
  owner.request(`${root}/turns`, spend),
]);
assert.equal(first.id, second.id);
assert.equal(
  (await snapshot()).entities.find((e) => e.id === a.actorId).resources.focus,
  2,
);
pass("simultaneous duplicate submissions spend a resource once");

const stale = await inputFor({
  kind: "quest.transition",
  questId: a.questId,
  status: "complete",
});
const state = await snapshot();
const actor = state.entities.find((e) => e.id === a.actorId);
const {
  id,
  campaign_id: _campaign,
  revision,
  updated_at: _updated,
  ...actorPayload
} = actor;
assert.equal(_campaign, a.campaignId);
assert.ok(_updated);
await mutation(
  owner,
  a.campaignId,
  "entity.save",
  { ...actorPayload, id, hp: 9 },
  revision,
);
await owner.request(`${root}/turns`, stale, 409);
assert.equal((await snapshot()).entities.find((e) => e.id === a.actorId).hp, 9);
assert.equal(
  (await snapshot()).quests.find((q) => q.id === a.questId).status,
  "open",
);
pass("manual correction wins; stale action cannot overwrite state");

const invalid = await inputFor({
  kind: "item.consume",
  actorId: a.actorId,
  itemId: b.items.healing,
  quantity: 1,
});
const invalidTurn = await owner.request(`${root}/turns`, invalid);
assert.equal(invalidTurn.status, "failed");
assert.equal(invalidTurn.failure, "validation");
assert.equal(
  (await snapshot()).items.find((i) => i.id === a.items.healing).quantity,
  1,
);
pass("cross-campaign mechanics rejected without partial state mutation");

await run({
  kind: "rest.enter",
  restKind: "long",
  participantIds: [a.actorId],
});
let runtime = await play();
const rest = runtime.restRecords.find((r) => r.status === "planned");
assert.ok(rest);
await run({
  kind: "recipe.prepare",
  actorId: a.actorId,
  recipe: "meal",
  ingredients: [{ itemId: a.items.meat, quantity: 1 }],
  outputStorageId: a.packId,
});
runtime = await play();
const meal = runtime.configuration.itemRules.find(
  (r) => r.tag === "meal-serving",
);
assert.ok(meal);
await run({
  kind: "recipe.serve",
  actorId: a.actorId,
  itemId: meal.itemId,
  recipientIds: [a.actorId],
});
runtime = await play();
assert.ok(
  runtime.effects.some(
    (e) => e.entity_id === a.actorId && e.definition.status === "pending",
  ),
);
await run({
  kind: "rest.complete",
  restId: rest.id,
  supplies: [{ itemId: a.items.supply, quantity: 1 }],
});
runtime = await play();
assert.equal(runtime.worldMinutes, 480);
assert.ok(
  runtime.effects.some(
    (e) => e.entity_id === a.actorId && e.definition.status === "active",
  ),
);
const afterRest = await snapshot();
assert.equal(afterRest.items.find((i) => i.id === a.items.supply).quantity, 7);
assert.equal(afterRest.items.find((i) => i.id === a.items.meat).quantity, 2);
assert.equal(afterRest.items.find((i) => i.id === meal.itemId).quantity, 0);
assert.equal(afterRest.entities.find((e) => e.id === a.actorId).hp, 12);
pass(
  "rest lifecycle, recipe preparation/serving, supply costs, activation and consumed source records persist",
);

await run({ kind: "quest.transition", questId: a.questId, status: "complete" });
await run({ kind: "location.move", locationId: a.destinationId });
assert.equal(
  (await snapshot()).quests.find((q) => q.id === a.questId).status,
  "complete",
);
assert.equal(
  (await snapshot()).publicState.current_location_id,
  a.destinationId,
);
assert.deepEqual(await owner.request(pathFor(b.campaignId)), beforeB);
assert.deepEqual(await owner.request(`${pathFor(b.campaignId)}/play`), playB);
pass(
  "quest and location outcomes persist; unrelated synthetic campaign unchanged",
);

const beforeLogin = await snapshot(),
  runtimeBeforeLogin = await play();
await owner.request("/api/auth/sign-out", {});
await owner.request(`${root}/play`, undefined, 401);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
assert.deepEqual(await snapshot(), beforeLogin);
assert.deepEqual(await play(), runtimeBeforeLogin);
pass("logout/relogin preserves gameplay and recorded operation results");

await writeFile(
  "test-results/phase2-http-acceptance.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      providerCalls: 0,
      campaigns: fixtures.map((f) => f.campaignId),
      checks: passes,
    },
    null,
    2,
  ),
);
console.log(
  `Completed ${passes.length} local HTTP acceptance groups. No OpenAI calls were made.`,
);

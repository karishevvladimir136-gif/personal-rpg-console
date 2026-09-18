import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  findCampaign,
  campaignFromPath,
  campaignHref,
} from "../src/lib/campaign-routing.ts";
import {
  createCampaignPreview,
  appendConversation,
} from "../src/lib/preview-state.ts";
import {
  createCampaignSettings,
  updateCampaignSettings,
} from "../src/lib/campaign-settings.ts";
import {
  inventoryItems,
  entities,
  storages,
  slotProfiles,
  itemsInStorage,
  equipmentFor,
  canAccessStorage,
  transferPreview,
} from "../src/lib/inventory-model.ts";
import {
  transitionCamp,
  restParticipants,
  restCost,
  suppliesAt,
  recipes,
  recipeAvailability,
  campScenarios,
} from "../src/lib/camp-preview.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
const campaign = "long-road-west";
const id = (local) => `${campaign}:${local}`;

test("route identity requires a registered campaign and never resolves concepts or unknown IDs", () => {
  assert.equal(findCampaign(campaign)?.campaign_id, campaign);
  assert.equal(
    campaignFromPath(campaignHref(campaign, "camp"))?.campaign_id,
    campaign,
  );
  for (const path of [
    "/",
    "/campaigns",
    "/settings",
    "/campaigns/unknown/game",
    "/campaigns/ashes-of-the-moon/game",
    "/game",
  ])
    assert.equal(campaignFromPath(path), undefined);
});
test("inventory ownership, storage, and equipment references are campaign-scoped and consistent", () => {
  assert.equal(
    new Set(inventoryItems.map((item) => item.id)).size,
    inventoryItems.length,
  );
  for (const item of inventoryItems) {
    assert.ok(item.id.startsWith(`${item.campaign_id}:`));
    assert.ok(
      entities.some(
        (entity) =>
          entity.id === item.ownerId && entity.campaign_id === item.campaign_id,
      ),
    );
    const storage = storages.find(
      (storage) =>
        storage.id === item.storageId &&
        storage.campaign_id === item.campaign_id,
    );
    assert.ok(storage);
    if (item.equipped) {
      const entity = entities.find(
        (entity) => entity.id === item.equipped.entityId,
      );
      assert.equal(entity.campaign_id, item.campaign_id);
      assert.equal(storage.entityId, entity.id);
      assert.ok(
        slotProfiles[entity.profile].some(
          (slot) => slot.id === item.equipped.slot,
        ),
      );
      assert.ok(equipmentFor(campaign, entity.id).includes(item));
      assert.ok(itemsInStorage(campaign, storage.id).includes(item));
    }
  }
  assert.equal(itemsInStorage("other", id("player")).length, 0);
  assert.equal(equipmentFor("other", id("james")).length, 0);
  assert.equal(
    slotProfiles[entities.find((entity) => entity.id === id("jinn")).profile]
      .length,
    0,
  );
  assert.deepEqual(
    entities
      .filter((entity) => entity.kind === "transport")
      .map((entity) => entity.name),
    ["Old Ford"],
  );
});
test("accessible remote deposits are allowed, while withdrawal and cargo access are restricted", () => {
  assert.equal(
    transferPreview(campaign, id("notebook"), id("stash"), 1, false),
    null,
  );
  assert.ok(
    transferPreview(campaign, id("camp-rations"), id("player"), 1, false),
  );
  assert.equal(
    transferPreview(campaign, id("camp-rations"), id("player"), 1, true),
    null,
  );
  assert.ok(transferPreview(campaign, id("supplies"), id("stash"), 1, true));
  assert.ok(
    transferPreview(campaign, id("notebook"), id("ford-cargo"), 1, true),
  );
  assert.ok(transferPreview("other", id("notebook"), id("stash"), 1, true));
  for (const quantity of [0, -1, 1.5, 2, NaN])
    assert.ok(
      transferPreview(campaign, id("notebook"), id("stash"), quantity, true),
    );
});
test("camp entry needs explicit eligible transition; leaving and completion close access without mutation", () => {
  const inventoryBefore = JSON.stringify(inventoryItems);
  const blocked = { active: false, scenario: "unsafe" };
  assert.equal(transitionCamp(blocked, "enter"), blocked);
  const initial = createCampaignPreview(campaign);
  assert.equal(
    canAccessStorage(campaign, id("stash"), initial.camp.active),
    false,
  );
  const entered = transitionCamp(initial.camp, "enter");
  assert.equal(entered.active, true);
  for (const action of ["leave", "complete"])
    assert.equal(
      canAccessStorage(
        campaign,
        id("stash"),
        transitionCamp(entered, action).active,
      ),
      false,
    );
  assert.equal(canAccessStorage("other", id("stash"), true), false);
  assert.equal(canAccessStorage(campaign, id("ford-cargo"), true), false);
  assert.deepEqual(initial, createCampaignPreview(campaign));
  assert.equal(JSON.stringify(inventoryItems), inventoryBefore);
});
test("rest costs are independent of recovery, support zero, and use eligible unique participants", () => {
  const initial = createCampaignSettings(campaign);
  const participants = [id("james"), id("jinn")];
  assert.equal(restCost(initial, "short", participants), 0);
  assert.equal(restCost(initial, "long", participants), 2);
  assert.equal(
    restCost(initial, "long", [
      ...participants,
      id("james"),
      id("goran"),
      "other:james",
    ]),
    2,
  );
  for (const key of ["shortRestSupplyCost", "longRestSupplyCost"]) {
    for (const value of [0, 1, 5]) {
      const changed = updateCampaignSettings(initial, {
        type: "difficulty",
        key,
        value,
      });
      assert.equal(changed.difficulty.preset, "custom");
      assert.equal(changed.difficulty[key], value);
      assert.equal(changed.difficulty.recovery, "standard");
    }
    for (const value of [-1, 0.5, 6, NaN, Infinity])
      assert.equal(
        updateCampaignSettings(initial, { type: "difficulty", key, value }),
        initial,
      );
  }
  for (const [preset, short, long] of [
    ["easy", 0, 0],
    ["medium", 0, 1],
    ["hard", 1, 2],
  ]) {
    const next = updateCampaignSettings(initial, {
      type: "preset",
      value: preset,
    });
    assert.equal(next.difficulty.shortRestSupplyCost, short);
    assert.equal(next.difficulty.longRestSupplyCost, long);
  }
  assert.equal(suppliesAt(campaign, id("stash"), false), 0);
  assert.equal(suppliesAt(campaign, id("stash"), true), 6);
  assert.equal(suppliesAt(campaign, id("ford-cargo"), true), 0);
});
test("conversations retain literal player messages only for the available campaign companion", () => {
  const initial = createCampaignPreview(campaign);
  const next = appendConversation(
    initial,
    id("jinn"),
    "  My own words / мои слова  ",
  );
  assert.deepEqual(next.conversations[id("jinn")], [
    "My own words / мои слова",
  ]);
  assert.deepEqual(initial.conversations, {});
  for (const entityId of [id("goran"), id("james"), "other:jinn", "unknown"])
    assert.equal(appendConversation(next, entityId, "hello"), next);
  const other = createCampaignPreview("other");
  assert.equal(appendConversation(other, id("jinn"), "hello"), other);
  const departed = {
    ...next,
    camp: transitionCamp({ active: true, scenario: "quiet" }, "leave"),
  };
  assert.deepEqual(departed.conversations, next.conversations);
  assert.deepEqual(
    restParticipants(campaign).map((entity) => entity.name),
    ["James", "Jinn"],
  );
  assert.deepEqual(restParticipants("other"), []);
});
test("cooking validates access, recipients and ingredients; stew demonstrates insufficiency", () => {
  const before = JSON.stringify(inventoryItems);
  const recipients = [id("james"), id("jinn")];
  for (const recipe of recipes) {
    assert.equal(
      recipeAvailability(campaign, recipe, false, recipients).canPrepare,
      false,
    );
    assert.equal(
      recipeAvailability("other", recipe, true, recipients).canPrepare,
      false,
    );
    for (const invalid of [
      [],
      [id("goran")],
      [id("james"), id("james")],
      [...recipients, id("goran")],
    ])
      assert.equal(
        recipeAvailability(campaign, recipe, true, invalid).canPrepare,
        false,
      );
    assert.equal(
      recipeAvailability(campaign, recipe, true, recipients).canPrepare,
      recipe.name !== "Simple camp stew",
    );
    assert.match(recipe.expiry, /after|after completing/);
  }
  assert.equal(JSON.stringify(inventoryItems), before);
  assert.ok(
    inventoryItems
      .filter((item) => item.ingredient)
      .every((item) => !item.restSupply),
  );
});
test("new fixture descriptions, profiles, recipe effects, and eligibility choices are bilingual", () => {
  for (const record of [
    ...inventoryItems,
    ...entities,
    ...storages,
    ...recipes,
    ...campScenarios,
    ...Object.values(slotProfiles).flat(),
    ...recipes.flatMap((recipe) => recipe.ingredients),
  ]) {
    for (const field of [
      "name",
      "label",
      "category",
      "rarity",
      "detail",
      "mechanics",
      "history",
      "description",
      "relationship",
      "flavor",
      "benefit",
      "expiry",
    ])
      if (record[field])
        assert.ok(Object.hasOwn(russian, record[field]), record[field]);
  }
});
test("item image demonstration contains no provider/network/persistence action", () => {
  const source = readFileSync(
    new URL("../src/components/inventory.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\b|https?:\/\//,
  );
  assert.match(source, /Image generation is not connected/);
});

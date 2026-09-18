import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  validateMutation,
  validateSettings,
  ValidationError,
} from "../src/lib/persistence/validation.ts";
import { createCampaignSettings } from "../src/lib/campaign-settings.ts";
const cid = randomUUID();
const request = (operation, payload, expectedRevision = 0) => ({
  requestId: randomUUID(),
  operation,
  payload,
  expectedRevision,
  ...(["campaign.create", "preferences.save"].includes(operation)
    ? {}
    : { campaignId: cid }),
});
test("feedback validates literal messages without allowing gameplay fields or updates", () => {
  const input = request("feedback.send", {
    body: "  Literal feedback. Русский текст.  ",
  });
  assert.deepEqual(validateMutation(input), input);
  for (const bad of [
    request("feedback.send", { body: "" }),
    request("feedback.send", { body: " " }),
    request("feedback.send", { body: "ok" }, 1),
    request("feedback.send", { body: "x".repeat(20001) }),
    request("feedback.send", { body: "ok", apply: true }),
  ])
    assert.throws(() => validateMutation(bad), ValidationError);
});
test("mutation validator accepts typed owner corrections without trimming authored text", () => {
  const input = request("document.save", {
    title: "Synthetic notes",
    body: "  Literal English / русский  ",
    status: "canon",
  });
  assert.deepEqual(validateMutation(input), input);
  assert.ok(
    validateMutation(
      request("preferences.save", {
        language: "ru",
        largeText: true,
        suggestions: false,
      }),
    ),
  );
});
test("mutation validator rejects unsupported gameplay, spoofed scope, malformed identities and revisions", () => {
  const good = request("campaign.create", {
    title: "Synthetic",
    subtitle: "",
    language: "en",
  });
  for (const bad of [
    { ...good, operation: "combat.resolve" },
    { ...good, requestId: "sample" },
    { ...good, expectedRevision: -1 },
    { ...good, expectedRevision: 1 },
    { ...good, extra: "private" },
    { ...good, payload: { ...good.payload, owner_id: randomUUID() } },
  ])
    assert.throws(() => validateMutation(bad), ValidationError);
});
test("settings are scoped, typed and preserve independent Hidden preferences", () => {
  const settings = {
    ...createCampaignSettings(cid, {
      id: "custom",
      label: "Custom rules",
      enemyHpScaling: false,
      enemyDamageScaling: false,
    }),
    dicePresentation: "hidden",
    interactiveDice: true,
    showDc: true,
  };
  assert.equal(validateSettings(settings, cid).showDc, true);
  for (const bad of [
    { ...settings, campaign_id: randomUUID() },
    { ...settings, interactiveDice: "true" },
    {
      ...settings,
      difficulty: { ...settings.difficulty, enemyDamageMultiplier: 1.1 },
    },
    { ...settings, rulesSystem: { ...settings.rulesSystem, private: 1 } },
  ])
    assert.throws(() => validateSettings(bad, cid), ValidationError);
});
test("inventory validation rejects fractional/negative quantities and incomplete equipment assignments", () => {
  const item = {
    name: "Synthetic tool",
    category: "tool",
    quantity: 1,
    description: "",
    mechanics: "",
    owner_entity_id: null,
    storage_id: randomUUID(),
    equipped_entity_id: null,
    equipped_slot: null,
  };
  assert.ok(validateMutation(request("item.save", item)));
  for (const bad of [
    { ...item, quantity: -1 },
    { ...item, quantity: 1.5 },
    { ...item, equipped_slot: "hand" },
    { ...item, equipped_entity_id: randomUUID() },
    { ...item, id: "wrong" },
  ])
    assert.throws(
      () => validateMutation(request("item.save", bad)),
      ValidationError,
    );
});
test("entity validation rejects impossible health, duplicate slots and nonnumeric resources", () => {
  const entity = {
    kind: "player",
    name: "Synthetic",
    details: "",
    hp: 2,
    max_hp: 4,
    stats: { strength: 1 },
    resources: { focus: 2 },
    conditions: [],
    equipment_slots: [{ id: "hand", label: "Hand", accepts: ["tool"] }],
  };
  assert.ok(validateMutation(request("entity.save", entity)));
  for (const bad of [
    { ...entity, hp: 5 },
    { ...entity, hp: null },
    {
      ...entity,
      equipment_slots: [...entity.equipment_slots, ...entity.equipment_slots],
    },
    { ...entity, resources: { focus: "two" } },
  ])
    assert.throws(
      () => validateMutation(request("entity.save", bad)),
      ValidationError,
    );
});
test("resume and asset metadata references cannot omit scope or accept URLs/path traversal", () => {
  assert.throws(
    () =>
      validateMutation(
        request("state.save", {
          summary: "",
          current_session_id: null,
          current_scene_id: randomUUID(),
          current_location_id: null,
        }),
      ),
    ValidationError,
  );
  for (const path of [
    "https://outside.example/file",
    `${cid}/../secret`,
    `${randomUUID()}/file`,
    `${cid}/sub\\file`,
  ])
    assert.throws(
      () =>
        validateMutation(
          request("asset.save", {
            title: "Synthetic",
            kind: "image",
            description: "",
            storage_path: path,
          }),
        ),
      ValidationError,
    );
  assert.ok(
    validateMutation(
      request("asset.save", {
        title: "Synthetic",
        kind: "image",
        description: "",
        storage_path: `${cid}/safe-image.png`,
      }),
    ),
  );
});

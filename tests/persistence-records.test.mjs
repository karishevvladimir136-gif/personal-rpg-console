import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
import fragment from "../src/lib/locales/phase1-c-ru.json" with { type: "json" };
import { createMutationAttempt } from "../src/lib/persistence/client.ts";
import {
  entityKindLabels,
  equipmentProfileForCorrection,
  equipmentForRecord,
  itemCorrectionIssue,
  itemIcon,
  numberOrNull,
  parseHitPoints,
  RecordValidationError,
  resumeIssue,
  sceneOrder,
  sceneRoleLabels,
  storageKindLabels,
  storageAcceptsEntity,
  storageCorrectionIssue,
} from "../src/lib/persistence/record-model.ts";

const first = "20000000-0000-4000-8000-000000000001";
const second = "20000000-0000-4000-8000-000000000002";

test("manual correction retries keep their request identity until payload or revision changes", () => {
  const input = {
    operation: "item.save",
    campaignId: first,
    expectedRevision: 4,
    payload: { id: "item", ...item(fixture()) },
  };
  const firstAttempt = createMutationAttempt(null, input);
  const retry = createMutationAttempt(firstAttempt, structuredClone(input));
  assert.equal(retry.requestId, firstAttempt.requestId);
  assert.equal(retry.expectedRevision, 4);
  const changed = createMutationAttempt(retry, {
    ...input,
    payload: { ...input.payload, quantity: 2 },
  });
  assert.notEqual(changed.requestId, retry.requestId);
  const newer = createMutationAttempt(retry, { ...input, expectedRevision: 5 });
  assert.notEqual(newer.requestId, retry.requestId);
  assert.equal(firstAttempt.payload.quantity, 1);
  assert.equal(firstAttempt.payload.storage_id, fixture().storages[0].id);
});
function fixture(campaign = first) {
  const entity = {
    id: `${campaign}:pilot`,
    kind: "player",
    campaign_id: campaign,
    equipment_slots: [{ id: "hand", label: "Hand", accepts: ["gear"] }],
  };
  const storage = {
    id: `${campaign}:bag`,
    campaign_id: campaign,
    entity_id: entity.id,
  };
  return {
    campaign: { id: campaign },
    entities: [entity],
    storages: [storage],
    items: [],
    sessions: [{ id: `${campaign}:session`, campaign_id: campaign }],
    scenes: [
      {
        id: `${campaign}:scene`,
        campaign_id: campaign,
        session_id: `${campaign}:session`,
      },
    ],
    locations: [{ id: `${campaign}:harbor`, campaign_id: campaign }],
  };
}
function item(snapshot) {
  return {
    name: "Synthetic compass",
    category: "gear",
    quantity: 1,
    description: "Invented test object",
    mechanics: "",
    owner_entity_id: snapshot.entities[0].id,
    storage_id: snapshot.storages[0].id,
    equipped_entity_id: null,
    equipped_slot: null,
  };
}

test("manual inventory correction validates quantities and campaign-scoped owner/storage references", () => {
  const a = fixture(),
    b = fixture(second),
    draft = item(a);
  assert.equal(itemCorrectionIssue(a, draft), null);
  for (const quantity of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.match(
      itemCorrectionIssue(a, { ...draft, quantity }),
      /whole number/,
    );
  assert.equal(itemCorrectionIssue(a, { ...draft, quantity: 0 }), null);
  assert.match(
    itemCorrectionIssue(a, { ...draft, owner_entity_id: b.entities[0].id }),
    /owner from this campaign/,
  );
  assert.match(
    itemCorrectionIssue(a, { ...draft, storage_id: b.storages[0].id }),
    /storage from this campaign/,
  );
  const polluted = {
    ...a,
    entities: [...a.entities, ...b.entities],
    storages: [...a.storages, ...b.storages],
  };
  assert.match(
    itemCorrectionIssue(polluted, { ...draft, storage_id: b.storages[0].id }),
    /storage from this campaign/,
  );
});

test("equipment correction requires compatible slots, paired assignment and quantity", () => {
  const data = fixture();
  const draft = {
    ...item(data),
    equipped_entity_id: data.entities[0].id,
    equipped_slot: "hand",
  };
  assert.equal(itemCorrectionIssue(data, draft), null);
  assert.match(
    itemCorrectionIssue(data, { ...draft, equipped_slot: null }),
    /both/,
  );
  assert.match(
    itemCorrectionIssue(data, { ...draft, equipped_entity_id: null }),
    /both/,
  );
  assert.match(
    itemCorrectionIssue(data, { ...draft, category: "armor" }),
    /does not accept/,
  );
  assert.match(
    itemCorrectionIssue(data, { ...draft, quantity: 0 }),
    /at least one/,
  );
  assert.match(
    itemCorrectionIssue(data, { ...draft, equipped_slot: "imaginary" }),
    /does not accept/,
  );
  assert.match(
    itemCorrectionIssue(
      { ...data, entities: [{ ...data.entities[0], equipment_slots: [] }] },
      draft,
    ),
    /does not accept/,
  );
});

test("equipped storage must match the wearer and occupied slots cannot be overwritten", () => {
  const data = fixture();
  const draft = {
    ...item(data),
    equipped_entity_id: data.entities[0].id,
    equipped_slot: "hand",
  };
  const stash = { id: "stash", campaign_id: first, entity_id: null };
  assert.match(
    itemCorrectionIssue(
      { ...data, storages: [...data.storages, stash] },
      { ...draft, storage_id: stash.id },
    ),
    /character's storage/,
  );
  const occupied = {
    ...data,
    items: [{ ...draft, id: "existing", campaign_id: first }],
  };
  assert.match(itemCorrectionIssue(occupied, draft), /occupied/);
  assert.equal(itemCorrectionIssue(occupied, draft, "existing"), null);
});

test("equipment views reuse item identity without modifying or crossing campaigns", () => {
  const data = fixture();
  const own = {
    ...item(data),
    id: "same",
    campaign_id: first,
    equipped_entity_id: data.entities[0].id,
    equipped_slot: "hand",
  };
  const foreign = { ...own, campaign_id: second };
  const items = Object.freeze([Object.freeze(own), Object.freeze(foreign)]);
  assert.deepEqual(equipmentForRecord(data.entities[0], items), [own]);
  assert.equal(equipmentForRecord(data.entities[0], items)[0], own);
  assert.equal(items.length, 2);
});

test("manual resume point rejects foreign records and scenes belonging to another session", () => {
  const a = fixture(),
    b = fixture(second);
  const state = {
    current_session_id: a.sessions[0].id,
    current_scene_id: a.scenes[0].id,
    current_location_id: a.locations[0].id,
  };
  assert.equal(resumeIssue(a, state), null);
  assert.equal(
    resumeIssue(a, {
      current_session_id: null,
      current_scene_id: null,
      current_location_id: null,
    }),
    null,
  );
  assert.match(
    resumeIssue(a, { ...state, current_session_id: b.sessions[0].id }),
    /session from this campaign/,
  );
  assert.match(
    resumeIssue(a, { ...state, current_location_id: b.locations[0].id }),
    /location from this campaign/,
  );
  assert.match(
    resumeIssue(a, { ...state, current_scene_id: b.scenes[0].id }),
    /belong/,
  );
  assert.match(
    resumeIssue(a, { ...state, current_session_id: null }),
    /belong/,
  );
  assert.match(
    resumeIssue(
      { ...a, scenes: [{ ...a.scenes[0], session_id: "other" }] },
      state,
    ),
    /belong/,
  );
});

test("optional HP parsing does not invent an HP mechanic for systems without one", () => {
  assert.equal(numberOrNull(""), null);
  assert.equal(numberOrNull("  "), null);
  assert.equal(numberOrNull("0"), 0);
  assert.deepEqual(parseHitPoints("", ""), { hp: null, max_hp: null });
  assert.deepEqual(parseHitPoints("0", "14"), { hp: 0, max_hp: 14 });
  assert.throws(() => parseHitPoints("", "14"), /both current and maximum/);
  assert.throws(() => parseHitPoints("14", ""), /both current and maximum/);
  assert.throws(() => parseHitPoints("15", "14"), /exceed maximum/);
  for (const value of ["-2", "invalid", "Infinity", "13.5", "1000001"])
    assert.throws(() => numberOrNull(value), RecordValidationError);
});

test("storage assignment options enforce kind, campaign and equipped-item invariants", () => {
  const data = fixture();
  const companion = { ...data.entities[0], id: "companion", kind: "companion" };
  const transport = { ...data.entities[0], id: "wagon", kind: "transport" };
  const mount = { ...data.entities[0], id: "mount", kind: "mount" };
  const npc = { ...data.entities[0], id: "npc", kind: "npc" };
  data.entities.push(companion, transport, mount, npc);
  assert.equal(
    storageCorrectionIssue(data, {
      name: "Bag",
      kind: "player",
      entity_id: data.entities[0].id,
    }),
    null,
  );
  assert.equal(
    storageCorrectionIssue(data, {
      name: "Stash",
      kind: "camp",
      entity_id: null,
    }),
    null,
  );
  assert.match(
    storageCorrectionIssue(data, {
      name: "Bag",
      kind: "player",
      entity_id: null,
    }),
    /matches this storage kind/,
  );
  assert.match(
    storageCorrectionIssue(data, {
      name: "Bag",
      kind: "player",
      entity_id: companion.id,
    }),
    /matches this storage kind/,
  );
  assert.match(
    storageCorrectionIssue(data, {
      name: "Bag",
      kind: "camp",
      entity_id: companion.id,
    }),
    /must not be assigned/,
  );
  assert.match(
    storageCorrectionIssue(data, {
      name: "Bag",
      kind: "player",
      entity_id: fixture(second).entities[0].id,
    }),
    /matches this storage kind/,
  );
  assert.equal(storageAcceptsEntity("transport", mount), true);
  assert.equal(storageAcceptsEntity("transport", transport), true);
  assert.equal(storageAcceptsEntity("companion", companion), true);
  for (const kind of ["player", "companion", "camp", "transport"])
    assert.equal(storageAcceptsEntity(kind, npc), false);
  const occupied = {
    ...data,
    items: [
      {
        ...item(data),
        campaign_id: first,
        equipped_entity_id: data.entities[0].id,
        equipped_slot: "hand",
      },
    ],
  };
  assert.match(
    storageCorrectionIssue(
      occupied,
      { name: "Stash", kind: "camp", entity_id: null },
      data.storages[0].id,
    ),
    /contains equipped items/,
  );
});

test("NPC equipment is unavailable while legacy profiles survive unrelated public corrections", () => {
  const data = fixture(),
    entity = data.entities[0],
    slots = entity.equipment_slots;
  assert.deepEqual(equipmentProfileForCorrection(undefined, "npc", []), []);
  assert.throws(
    () => equipmentProfileForCorrection(entity, "npc", slots),
    /Clear the equipment profile/,
  );
  const legacy = { ...entity, kind: "npc" };
  assert.equal(
    equipmentProfileForCorrection(legacy, "npc", []),
    legacy.equipment_slots,
  );
  assert.equal(
    equipmentProfileForCorrection(entity, "companion", slots),
    slots,
  );
  assert.match(
    itemCorrectionIssue(
      { ...data, entities: [legacy] },
      { ...item(data), equipped_entity_id: entity.id, equipped_slot: "hand" },
    ),
    /NPC equipment is not available/,
  );
});

test("public transcript order is stable and preserves original records/settings revisions", () => {
  const scenes = Object.freeze([
    Object.freeze({
      id: "b",
      created_at: "2026-09-17T20:00:00Z",
      settings_revision: 2,
      body: "Literal $& {text}",
    }),
    Object.freeze({
      id: "a",
      created_at: "2026-09-17T19:00:00Z",
      settings_revision: 1,
    }),
  ]);
  const sorted = sceneOrder(scenes);
  assert.deepEqual(
    sorted.map((row) => row.id),
    ["a", "b"],
  );
  assert.equal(sorted[1], scenes[0]);
  assert.equal(sorted[0].settings_revision, 1);
  assert.deepEqual(
    scenes.map((row) => row.id),
    ["b", "a"],
  );
  assert.equal(itemIcon("unknown-invented-category"), "Package");
});

test("record controls, feedback and accessible phrases have Russian translations", () => {
  const dictionary = { ...russian, ...fragment };
  const parameters = (value) =>
    [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [source, translation] of Object.entries(fragment)) {
    assert.ok(translation.trim(), source);
    assert.deepEqual(parameters(source), parameters(translation), source);
  }
  for (const label of [
    ...Object.values(entityKindLabels),
    ...Object.values(storageKindLabels),
    ...Object.values(sceneRoleLabels),
  ])
    assert.ok(Object.hasOwn(dictionary, label), label);
  function check(node) {
    if (!node) return;
    if (ts.isStringLiteral(node))
      assert.ok(Object.hasOwn(dictionary, node.text), node.text);
    else if (ts.isConditionalExpression(node)) {
      check(node.whenTrue);
      check(node.whenFalse);
    } else if (ts.isParenthesizedExpression(node)) check(node.expression);
    else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.BarBarToken
    )
      check(node.right);
  }
  for (const file of ["persistent-records.tsx", "persistent-game.tsx"]) {
    const source = readFileSync(
      new URL(`../src/components/${file}`, import.meta.url),
      "utf8",
    );
    const ast = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        check(node.arguments[0]);
      if (
        ts.isNewExpression(node) &&
        node.expression.getText(ast) === "RecordValidationError"
      )
        check(node.arguments?.[0]);
      if (
        ts.isJsxAttribute(node) &&
        ["title", "label", "description"].includes(node.name.getText(ast)) &&
        node.initializer
      )
        check(
          ts.isJsxExpression(node.initializer)
            ? node.initializer.expression
            : node.initializer,
        );
      if (ts.isJsxText(node))
        assert.ok(!/[A-Za-zА-Яа-яЁё]/.test(node.text), node.text.trim());
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});

test("persistent record screens do not import preview state or sample artwork/data", () => {
  for (const file of ["persistent-records.tsx", "persistent-game.tsx"]) {
    const source = readFileSync(
      new URL(`../src/components/${file}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /from ["'][^"']*(?:preview-context|mock-data|combat-preview|camp-preview|inventory-model)["']/,
    );
    assert.doesNotMatch(source, /<Art\b|setDiceDemo|usePreview\(|addMessage\(/);
    assert.doesNotMatch(
      source,
      /operation:\s*"(?:combat|rest|cook|roll|travel|conversation)\./,
    );
  }
});

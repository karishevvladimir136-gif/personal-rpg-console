import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as ownerForm from "../src/lib/adventure-loot/owner-form.ts";
import { fixture, commandFor } from "./adventure-loot-fixtures.mjs";
const require = createRequire(import.meta.url);
const path = fileURLToPath(
  new URL(
    "../src/components/adventure-loot/objects-panel.tsx",
    import.meta.url,
  ),
);
function view() {
  const { context, references: r } = fixture(),
    privateVersion = context.events.find(
      (e) => e.payload.object?.id === r.objectId,
    ).payload;
  const object = privateVersion.object;
  return {
    objects: [
      {
        id: object.id,
        revision: object.revision,
        storageId: object.storageId,
        locationId: object.locationId,
        ownerEntityId: object.ownerEntityId,
        label: "<script>unsafe()</script>",
        access: object.access,
        lockClass: object.lockClass,
        structureClass: object.structureClass,
        environmentTags: object.environmentTags,
        portable: object.portable,
        contentsEstablished: object.contentsEstablished,
        policy: "PRIVATE_POLICY_MUST_NOT_RENDER",
        privateItems: "PRIVATE_PROPERTIES_MUST_NOT_RENDER",
      },
    ],
    choices: {
      storages: context.snapshot.storages.map((s) => ({
        id: s.id,
        label: s.name,
        entityId: s.entity_id,
      })),
      locations: context.snapshot.locations.map((l) => ({
        id: l.id,
        label: l.name,
      })),
      entities: context.snapshot.entities.map((e) => ({
        id: e.id,
        label: e.name,
      })),
      capabilities: ["lockpick", "force-wood"],
    },
    command: {
      ...commandFor(context),
      operationId: undefined,
      expectedHeadId: "PRIVATE_HEAD_MUST_NOT_RENDER",
    },
  };
}
function render(language = "en", data = view(), busy = false) {
  const output = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
    filename: path,
  })(
    (name) => (name.endsWith("/owner-form") ? ownerForm : require(name)),
    loaded,
    loaded.exports,
  );
  return renderToStaticMarkup(
    createElement(loaded.exports.AdventureLootObjectsPanel, {
      language,
      data,
      busy,
      onSave: () => assert.fail("render must not write"),
    }),
  );
}
test("owner object panel renders bounded create/correction in EN/RU with responsive narrative styling", () => {
  for (const language of ["en", "ru"]) {
    const html = render(language);
    assert.match(
      html,
      language === "ru" ? /Объекты в сцене/ : /Objects in the scene/,
    );
    assert.match(
      html,
      language === "ru" ? /Сохранить исправление/ : /Save correction/,
    );
    assert.match(
      html,
      language === "ru"
        ? /Подтверждённая способность/
        : /Established capability/,
    );
    assert.match(html, /sm:grid-cols-2/);
    assert.equal((html.match(/type="number"/g) ?? []).length, 2);
    assert.equal((html.match(/min="1" max="40" step="1"/g) ?? []).length, 2);
    assert.match(html, /value="lockpick"/);
    assert.match(html, /value="force-wood"/);
    assert.match(
      html,
      language === "ru"
        ? /Неподдерживаемый способ/
        : /Unsupported methods pause/,
    );
    assert.doesNotMatch(
      html,
      /<textarea|PRIVATE_|expectedObjectRevision|materializationId|privateItems|rpg_private/,
    );
    assert.match(html, /&lt;script&gt;unsafe\(\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>unsafe/);
  }
});
test("busy forms disable both mutations and missing established choices disable create with honest explanation", () => {
  const html = render("en", view(), true);
  assert.equal((html.match(/<fieldset disabled=""/g) ?? []).length, 2);
  const data = view();
  data.objects = [];
  data.choices.capabilities = [];
  const empty = render("ru", data);
  assert.match(empty, /Здесь пока нет известных объектов/);
  assert.match(empty, /подтверждённая способность/);
  assert.equal((empty.match(/<fieldset disabled=""/g) ?? []).length, 1);
});
function draft(data = view()) {
  const storage = data.choices.storages.find((s) => s.entityId);
  return {
    storageId: storage.id,
    ownerEntityId: storage.entityId,
    locationId: data.choices.locations[0].id,
    capability: data.choices.capabilities[0],
    label: "  Wooden box  ",
    access: "locked",
    portable: null,
    lockDc: "20",
    forceDc: "8",
  };
}
test("create helper emits only bounded existing references and approved difficulty fields", () => {
  const data = view(),
    input = ownerForm.buildCreateOwnerObjectInput(
      { ...draft(data), arbitraryPrivatePatch: "PRIVATE" },
      data.choices,
    );
  assert.deepEqual(
    Object.keys(input).sort(),
    [
      "action",
      "storageId",
      "locationId",
      "ownerEntityId",
      "label",
      "access",
      "portable",
      "capability",
      "lockDc",
      "forceDc",
    ].sort(),
  );
  assert.equal(input.label, "Wooden box");
  assert.equal(input.lockDc, 20);
  assert.equal(input.forceDc, 8);
  assert.equal(input.portable, null);
  const blank = ownerForm.buildCreateOwnerObjectInput(
    { ...draft(data), lockDc: "", forceDc: " " },
    data.choices,
  );
  assert.equal(blank.lockDc, null);
  assert.equal(blank.forceDc, null);
  for (const change of [
    { capability: "invented-power" },
    { storageId: "foreign-stock" },
    { locationId: "foreign-place" },
    { ownerEntityId: "different-owner" },
    { label: "" },
    { label: "A".repeat(201) },
    { label: "bad\0name" },
    { lockDc: "0" },
    { lockDc: "41" },
    { lockDc: "2.5" },
    { lockDc: "1e1" },
    { forceDc: "-1" },
  ])
    assert.throws(() =>
      ownerForm.buildCreateOwnerObjectInput(
        { ...draft(data), ...change },
        data.choices,
      ),
    );
});
test("corrections keep the supplied canonical object/revision and never offer policy/identity edits", () => {
  const object = view().objects[0];
  const input = ownerForm.buildEditOwnerObjectInput(object, {
    label: "Known chest",
    access: "sealed",
    portable: false,
    objectId: "foreign",
    expectedObjectRevision: 999,
    storageId: "foreign-storage",
    privateItems: [],
  });
  assert.deepEqual(input, {
    action: "edit",
    objectId: object.id,
    expectedObjectRevision: object.revision,
    label: "Known chest",
    access: "sealed",
    portable: false,
  });
  const html = render();
  const edit = html
    .split("Correct this object")[1]
    .split("Record an object")[0];
  assert.doesNotMatch(
    edit,
    /type="number"|Existing stock|Established capability|PRIVATE_/,
  );
});

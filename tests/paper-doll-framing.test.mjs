import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Character and Inventory use one subject-centered portrait stage", () => {
  const character = read("../src/components/phase0-character.tsx");
  const inventory = read("../src/components/persistent-records.tsx");
  const framing = read("../src/components/paper-doll-framing.module.css");

  for (const component of [character, inventory]) {
    assert.match(component, /framing\.portraitStage/);
    assert.match(component, /framing\.portraitImage/);
    assert.match(component, /framing\.portraitRails/);
  }
  assert.match(framing, /height:\s*620px/);
  assert.match(framing, /height:\s*520px/);
  assert.match(framing, /object-position:\s*32%\s+center/);
  assert.doesNotMatch(character, /className=\{`art\s/);
  assert.doesNotMatch(inventory, /className=\{`art\s/);
});

test("Responsive equipment rails preserve a portrait center and usable slot size", () => {
  const framing = read("../src/components/paper-doll-framing.module.css");
  const character = read("../src/components/phase0-character.module.css");
  const inventory = read("../src/components/phase0-record-doll.module.css");

  assert.match(framing, /margin-top:\s*-405px/);
  assert.match(framing, /margin-top:\s*-330px/);
  assert.match(character, /grid-template-columns:\s*minmax\(0,\s*84px\)\s+minmax\(0,\s*84px\)/);
  assert.match(inventory, /grid-template-columns:\s*84px\s+84px/);
  assert.match(character, /height:\s*88px/);
});

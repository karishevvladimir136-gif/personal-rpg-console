import assert from "node:assert/strict";
import test from "node:test";
import { resourcePresentation } from "../src/lib/resource-presentation.ts";

test("public currency names replace storage keys without mutating them", () => {
  assert.deepEqual(resourcePresentation("currency_silver"), { kind: "money", label: "Silver" });
  assert.deepEqual(resourcePresentation("currency_gold_coin"), { kind: "money", label: "Gold coin" });
  assert.deepEqual(resourcePresentation("currency_silver", [
    { resourceKey: "currency_silver", label: "Silver pieces" },
  ]), { kind: "money", label: "Silver pieces" });
  assert.deepEqual(resourcePresentation("Focus"), { kind: "resource", label: "Focus" });
  assert.deepEqual(resourcePresentation("mana_points"), { kind: "resource", label: "Mana points" });
  assert.deepEqual(resourcePresentation("spell_slots"), { kind: "resource", label: "Spell slots" });
  assert.deepEqual(resourcePresentation("spell-slots"), { kind: "resource", label: "Spell slots" });
  assert.deepEqual(resourcePresentation("dm_private_key"), { kind: "resource", label: "Resource" });
  assert.deepEqual(resourcePresentation("currency_private_token"), { kind: "money", label: "Resource" });
  assert.deepEqual(resourcePresentation("../private/file"), { kind: "resource", label: "Resource" });
});

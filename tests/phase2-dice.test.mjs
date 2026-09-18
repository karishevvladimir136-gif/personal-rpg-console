import test from "node:test";
import assert from "node:assert/strict";
import {
  recordServerRoll,
  stableGameplayId,
  visibleChecks,
} from "../src/lib/gameplay/dice.ts";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";

const check = () => ({
  index: 0,
  actorId: id("player"),
  targetId: null,
  kind: "skill",
  stat: "skill",
  dc: 12,
  dcPublic: true,
  visibility: "player",
  important: true,
  uncertainty: "meaningful",
  advantage: "normal",
});
test("real server dice use integer bounds, stable check identities, and explicit advantage arithmetic", () => {
  for (let i = 0; i < 100; i++) {
    const result = recordServerRoll(id("operation"), check(), 2);
    assert.ok(result.kept >= 1 && result.kept <= 20);
  }
  for (const [advantage, kept] of [
    ["advantage", 17],
    ["disadvantage", 3],
  ]) {
    const dice = [3, 17];
    const result = recordServerRoll(
      id("operation"),
      { ...check(), advantage },
      2,
      1,
      () => dice.shift(),
    );
    assert.equal(result.kept, kept);
    assert.equal(result.total, kept + 2);
    assert.equal(result.success, kept + 2 >= 12);
    assert.equal(result.id, stableGameplayId(id("operation"), "check:0"));
  }
  assert.equal(
    recordServerRoll(id("operation"), { ...check(), dc: 40 }, 0, 1, () => 20)
      .success,
    false,
  );
  assert.equal(
    recordServerRoll(id("operation"), { ...check(), dc: 1 }, 0, 1, () => 1)
      .success,
    true,
  );
});
test("dice projection excludes private checks/DCs across every presentation mode", () => {
  const source = fixture(),
    roll = recordServerRoll(id("operation"), check(), 2, 1, () => 14);
  for (const presentation of ["hidden", "key-rolls", "all-player-rolls"]) {
    for (const showDc of [true, false]) {
      source.snapshot.settings.values.dicePresentation = presentation;
      source.snapshot.settings.values.showDc = showDc;
      assert.deepEqual(
        visibleChecks(source, [{ ...roll, visibility: "private" }]),
        [],
      );
      const publicRolls = visibleChecks(source, [roll]);
      assert.equal(publicRolls.length, presentation === "hidden" ? 0 : 1);
      if (publicRolls.length) {
        assert.equal(publicRolls[0].dc, showDc ? 12 : null);
        assert.equal(
          visibleChecks(source, [{ ...roll, dcPublic: false }])[0].dc,
          null,
        );
        assert.ok(!Object.hasOwn(publicRolls[0], "targetId"));
        assert.ok(!Object.hasOwn(publicRolls[0], "visibility"));
      }
    }
  }
  source.snapshot.settings.values.dicePresentation = "key-rolls";
  assert.deepEqual(visibleChecks(source, [{ ...roll, important: false }]), []);
});

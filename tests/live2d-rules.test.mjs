// 2D Live, part 2: the optional rules module — pure arithmetic from the words of
// the campaign's system, each applied rule named; never a decision.
import test from "node:test";
import assert from "node:assert/strict";
import { attackRuling, damageRuling, rulesOnByDefault, rulesText } from "../src/lib/live2d/battle/rules.ts";

const c = (...conditions) => ({ conditions });

test("the module is on for 5e-like systems only", () => {
  assert.equal(rulesOnByDefault("D&D 5e"), true);
  assert.equal(rulesOnByDefault("Dungeons & Dragons, 5-я редакция"), true);
  assert.equal(rulesOnByDefault("Pathfinder 2e"), true);
  assert.equal(rulesOnByDefault("Blades in the Dark"), false);
  assert.equal(rulesOnByDefault(null), false);
});

test("attack rulings: conditions, reach, cover, cancellation, auto-crit", () => {
  const plain = attackRuling({ attacker: c(), target: c(), feet: 10, cover: null, ranged: false });
  assert.deepEqual(plain, { advantage: "normal", autoCrit: false, acBonus: 0, rules: [], impossible: null });
  const proneNear = attackRuling({ attacker: c(), target: c("prone"), feet: 5, cover: null, ranged: false });
  assert.equal(proneNear.advantage, "advantage");
  const proneFar = attackRuling({ attacker: c(), target: c("лежит"), feet: 30, cover: null, ranged: true });
  assert.equal(proneFar.advantage, "disadvantage");
  const helpless = attackRuling({ attacker: c(), target: c("парализован"), feet: 5, cover: null, ranged: false });
  assert.equal(helpless.advantage, "advantage");
  assert.equal(helpless.autoCrit, true, "a paralysed target within 5 ft: auto-crit");
  const helplessFar = attackRuling({ attacker: c(), target: c("unconscious"), feet: 20, cover: null, ranged: true });
  assert.equal(helplessFar.autoCrit, false);
  const cancel = attackRuling({ attacker: c("blinded"), target: c("restrained"), feet: 5, cover: null, ranged: false });
  assert.equal(cancel.advantage, "normal");
  assert.ok(cancel.rules.some((row) => row.rule === "advantage and disadvantage"));
  const covered = attackRuling({ attacker: c(), target: c(), feet: 30, cover: "three-quarters", ranged: true });
  assert.equal(covered.acBonus, 5);
  assert.equal(attackRuling({ attacker: c(), target: c(), feet: 30, cover: "half", ranged: true }).acBonus, 2);
  assert.equal(attackRuling({ attacker: c(), target: c(), feet: 30, cover: "full", ranged: true }).impossible, "full cover: no line of attack");
  assert.equal(attackRuling({ attacker: c("stunned"), target: c(), feet: 5, cover: null, ranged: false }).impossible, "the attacker cannot act");
  const point = attackRuling({ attacker: c(), target: c(), feet: 5, cover: null, ranged: true });
  assert.equal(point.advantage, "disadvantage", "a ranged attack within 5 ft");
  const unseen = attackRuling({ attacker: c(), target: c(), feet: 40, cover: null, ranged: true, unseen: true });
  assert.equal(unseen.advantage, "disadvantage");
});

test("damage rulings: the crit doubles the dice, the target's resistances apply by type, immunity zeroes", () => {
  const target = { resist: ["fire", "холод"], immune: ["poison"], vulnerable: ["radiant"] };
  assert.deepEqual(damageRuling({ dice: [4, 5], modifier: 3, crit: false, damageType: "slashing", target }), { total: 12, rules: [] });
  const crit = damageRuling({ dice: [4, 5], modifier: 3, crit: true, critDice: [2, 6], damageType: "slashing", target });
  assert.equal(crit.total, 20);
  assert.equal(crit.rules[0].rule, "critical hit");
  assert.equal(damageRuling({ dice: [8], modifier: 2, crit: false, damageType: "fire", target }).total, 5, "resistance halves, rounded down");
  assert.equal(damageRuling({ dice: [8], modifier: 2, crit: false, damageType: "холод", target }).total, 5);
  assert.equal(damageRuling({ dice: [8], modifier: 2, crit: false, damageType: "poison", target }).total, 0);
  assert.equal(damageRuling({ dice: [8], modifier: 2, crit: false, damageType: "radiant", target }).total, 20);
  assert.equal(damageRuling({ dice: [3], modifier: -5, crit: false, damageType: null, target }).total, 0, "never below zero");
  assert.equal(rulesText(crit.rules, "ru"), "крит: кости удвоены (+8)");
  assert.equal(rulesText([{ rule: "three-quarters cover", effect: "+5 AC" }, { rule: "resists fire", effect: "damage halved" }], "ru"), "укрытие на три четверти: +5 к КД; сопротивление: fire: урон вдвое меньше");
  assert.equal(rulesText([], "en"), "");
});

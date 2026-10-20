// 2D Live, part 2: the combat state's contracts, the battlefield geometry and the
// DM's battlefield text — pure, measured, never ruled.
import test from "node:test";
import assert from "node:assert/strict";
import { combatantJson, defaultEconomy, fieldJson, hasMap, parseCombatant, parseField, parseFeature, parsePlacement } from "../src/lib/live2d/battle/contracts.ts";
import { adjacentIds, caught, cellDistance, distanceFeet, groundAt, lightAt, lineCells, lineTemplateCells, moveCost, sight, sphereCells, zoneFrom } from "../src/lib/live2d/battle/geometry.ts";
import { battlefieldText, fightCard } from "../src/lib/live2d/battle/battlefield.ts";

const field = parseField({
  grid: { cols: 20, rows: 12, feetPerCell: 5 }, ambient: "dark", activeParticipantId: "p-hero", turnInRound: 1,
  features: [
    { key: "cart", kind: "cover", label: "горящая телега", cells: [[5, 5], [6, 5]], cover: "three-quarters" },
    { key: "fire", kind: "burning", label: "огонь у телеги", cells: [[5, 5], [6, 5]], radiusFeet: 10, dimRadiusFeet: 20 },
    { key: "wall", kind: "wall", label: "стена барака", cells: [[10, 0], [10, 1], [10, 2], [10, 3]] },
    { key: "mud", kind: "difficult", label: "грязь", cells: [[2, 2], [3, 2]] },
    { key: "ledge", kind: "elevation", label: "уступ", cells: [[15, 2]], heightFeet: 10 },
    { key: "torch", kind: "light", label: "факел", cells: [[1, 1]], radiusFeet: 20, dimRadiusFeet: 40 },
  ],
});
const at = (x, y, z = 0, position = "nearby") => ({ position, x, y, z });

test("contracts: old participant rows read with defaults; new rows round-trip; the field parses strictly", () => {
  const legacy = parseCombatant({ action: 1, move: 1, reaction: 0, active: true, defending: false, withdrawn: false }, { side: "party" });
  assert.deepEqual(legacy.economy, { action: true, bonus: true, reaction: false, moveFeet: 30, moveMaxFeet: 30 });
  assert.equal(legacy.active, true);
  assert.equal(legacy.side, "party");
  assert.equal(legacy.hp, null);
  const fresh = parseCombatant({ initiative: 17, active: false, side: "foe", economy: { action: false, bonus: true, reaction: true, moveFeet: 10, moveMaxFeet: 30 }, conditions: ["prone"], deathSaves: null, hp: { current: 12, max: 20 }, known: [{ text: "боится огня", revealed: false }], intent: { text: "обойти с фланга", noticedBy: null }, ac: 13, resist: ["cold"], immune: [], vulnerable: ["fire"], defending: false, withdrawn: false });
  const json = combatantJson(fresh);
  assert.equal(json.action, 0, "the old readers' numbers follow the economy");
  assert.equal(json.move, 1);
  assert.deepEqual(parseCombatant(json), fresh);
  assert.deepEqual(parsePlacement({ position: "cover", x: 3, y: 4 }), { position: "cover", x: 3, y: 4, z: 0 });
  assert.deepEqual(parsePlacement({ position: "far", x: 3 }), { position: "far", x: null, y: null, z: 0 }, "a lone coordinate is no coordinate");
  assert.equal(parseFeature({ key: "x", kind: "cover", cells: [] }), null);
  assert.equal(parseFeature({ key: "x", kind: "cover", cells: [[1, 1]] }).cover, "half");
  assert.equal(field.features.length, 6);
  assert.equal(parseField({}).grid.cols, 24);
  assert.equal(hasMap(parseField({}), [parsePlacement({ position: "nearby" })]), false);
  assert.equal(hasMap(field, []), true);
  assert.deepEqual(parseField(fieldJson(field)), field);
  assert.deepEqual(defaultEconomy(25), { action: true, bonus: true, reaction: true, moveFeet: 25, moveMaxFeet: 25 });
});

test("geometry: Chebyshev feet with elevation, Bresenham lines, walls block sight, cover shields, light and hazards", () => {
  assert.equal(cellDistance({ x: 0, y: 0 }, { x: 3, y: 2 }), 3);
  assert.equal(distanceFeet(at(0, 0), at(2, 2)), 10);
  assert.equal(distanceFeet(at(0, 0), at(2, 2, 10)), 20, "10 ft of elevation added");
  assert.equal(distanceFeet(at(0, 0), { position: "far", x: null, y: null, z: 0 }), null);
  assert.deepEqual(lineCells({ x: 0, y: 0 }, { x: 3, y: 1 }).map((c) => [c.x, c.y]), [[0, 0], [1, 0], [2, 1], [3, 1]]);
  const blocked = sight(field, { x: 8, y: 2 }, { x: 12, y: 2 });
  assert.equal(blocked.visible, false);
  assert.equal(blocked.blockedBy.key, "wall");
  const covered = sight(field, { x: 5, y: 8 }, { x: 5, y: 2 });
  assert.equal(covered.visible, true);
  assert.equal(covered.cover, "three-quarters");
  assert.equal(covered.coverBy.key, "cart");
  assert.equal(sight(field, { x: 0, y: 8 }, { x: 3, y: 8 }).cover, null);
  assert.equal(sight(field, { x: 5, y: 5 }, { x: 5, y: 9 }).cover, null, "the end cells never count as cover");
  assert.equal(lightAt(field, { x: 1, y: 2 }).light, "bright");
  assert.equal(lightAt(field, { x: 7, y: 1 }).light, "dim");
  assert.equal(lightAt(field, { x: 18, y: 10 }).light, "dark");
  assert.equal(lightAt(field, { x: 6, y: 6 }).source.key, "fire", "a burning area lights its surroundings");
  assert.deepEqual(groundAt(field, { x: 2, y: 2 }).difficult, true);
  assert.equal(groundAt(field, { x: 15, y: 2 }).elevationFeet, 10);
  const move = moveCost(field, { x: 0, y: 2 }, { x: 4, y: 2 });
  assert.equal(move.feet, 30, "four cells, two of them difficult: 5+10+10+5");
  assert.deepEqual(move.crossed.map((row) => row.key), ["mud"]);
  const intoWall = moveCost(field, { x: 8, y: 1 }, { x: 12, y: 1 });
  assert.equal(intoWall.blocked.key, "wall");
  assert.equal(intoWall.feet, 5, "stops before the wall");
});

test("geometry: zones derive from the coordinates; templates and opportunity-attack candidates", () => {
  assert.deepEqual(zoneFrom(field, at(0, 8), at(1, 8)), { zone: "nearby", feet: 5, cover: null, visible: true });
  assert.equal(zoneFrom(field, at(0, 8), at(9, 8)).zone, "far");
  assert.equal(zoneFrom(field, at(5, 8), at(5, 2)).zone, "cover");
  assert.equal(zoneFrom(field, at(0, 0), { position: "far", x: null, y: null, z: 0 }).zone, "far", "no coordinates: the old position word stands");
  const ball = sphereCells(field, { x: 10, y: 6 }, 20);
  assert.ok(ball.some((c) => c.x === 10 && c.y === 2) && ball.some((c) => c.x === 14 && c.y === 6) && !ball.some((c) => c.x === 14 && c.y === 10));
  assert.deepEqual(caught(ball, [{ id: "a", placement: at(10, 8) }, { id: "b", placement: at(16, 6) }, { id: "c", placement: at(13, 9) }]), ["a", "c"]);
  const line = lineTemplateCells(field, { x: 0, y: 0 }, { x: 5, y: 0 }, 30);
  assert.equal(line.length, 6);
  assert.deepEqual(line.at(-1), { x: 6, y: 0 });
  assert.deepEqual(adjacentIds(field, { x: 4, y: 4 }, [{ id: "near", placement: at(5, 5) }, { id: "farther", placement: at(7, 4) }]), ["near"]);
});

test("the battlefield text names distances, cover, light and hazards for the party; the fight card sums the log", () => {
  const fighters = [
    { participantId: "p-hero", entityId: "e1", name: "Джеймс", turnOrder: 1, placement: at(5, 8), combatant: parseCombatant({ side: "party", active: true, economy: { action: true, bonus: false, reaction: true, moveFeet: 20, moveMaxFeet: 30 } }) },
    { participantId: "p-bram", entityId: "e2", name: "Брам", turnOrder: 2, placement: at(3, 8), combatant: parseCombatant({ side: "party", conditions: ["dying"], deathSaves: { success: 1, fail: 0 } }) },
    { participantId: "p-grey", entityId: "e3", name: "Серый", turnOrder: 3, placement: at(5, 2), combatant: parseCombatant({ side: "foe", hp: { current: 9, max: 14 } }) },
    { participantId: "p-kadrik", entityId: "e4", name: "Кадрик", turnOrder: 4, placement: at(15, 2, 10), combatant: parseCombatant({ side: "foe", conditions: ["concentrating"] }) },
  ];
  const text = battlefieldText({ round: 3, field, fighters, language: "ru", heroId: "e1" });
  assert.match(text, /^Раунд 3, ходит Джеймс\./m);
  assert.match(text, /Джеймс: Серый 30 фт, рядом, укрытие на три четверти \(горящая телега\); Кадрик 60 фт, далеко, выше на 10 фт\./);
  assert.match(text, /Брам: Серый 30 фт, рядом/);
  assert.match(text, /Серый: на свету, HP 9\/14; Кадрик: вне света, concentrating\./, "the torch 20 ft away lights Серый; Кадрик on the ledge is in the dark");
  assert.match(text, /На поле: горящая телега \(cover, three-quarters\)/);
  assert.match(text, /Джеймс: бонусное потрачено, движение осталось 20 фт\./);
  assert.match(text, /Брам: dying, спасброски от смерти 1✓\/0✗\./);
  const en = battlefieldText({ round: 1, field: parseField({}), fighters: fighters.map((row) => ({ ...row, placement: { position: "far", x: null, y: null, z: 0 } })), language: "en", heroId: "e1" });
  assert.match(en, /^Round 1, Джеймс to act\.\nPositions: Серый: far; Кадрик: far\./);
  const card = fightCard({ round: 3, fighters, log: [
    { round: 1, actor: "Джеймс", what: "удар", result: "18 против КД 15 · попал, 11 урона", ref: null },
    { round: 1, actor: "Серый", what: "укус", result: "промах", ref: null },
    { round: 2, actor: "Кадрик", what: "стрела", result: "крит! 14 урона", ref: null },
  ] });
  assert.deepEqual(card, { rounds: 3, dealt: 11, taken: 14, hits: 2, misses: 1, crits: 1, closeCalls: ["Брам"], fallen: [] });
});

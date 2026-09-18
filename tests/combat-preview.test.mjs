import assert from "node:assert/strict";
import test from "node:test";
import {
  combatReducer as reduce,
  createCombatPreview,
  combatants,
  combatActions,
  combatRoll,
  combatPresentation,
  eligibleTargets,
  canChooseAction,
  encounterWon,
  enemyHealth,
  demoResourceLabels,
} from "../src/lib/combat-preview.ts";
import { createCampaignPreview } from "../src/lib/preview-state.ts";
import { getVisibleDc, getDemoResult } from "../src/lib/dice-preview.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
const preferences = {
  dicePresentation: "key-rolls",
  interactiveDice: true,
  showDc: false,
};
const automatic = { ...preferences, interactiveDice: false };
const enter = () => reduce(createCombatPreview(), { type: "enter" });
function choose(state, action, target) {
  state = reduce(state, { type: "choose", action });
  return reduce(state, { type: "target", target });
}
function confirm(state, prefs = automatic) {
  return reduce(state, {
    type: "confirm",
    id: state.draft.id,
    preferences: prefs,
  });
}
function end(state) {
  return reduce(state, { type: "end-turn", turn: state.turn });
}
function enemy(state) {
  return reduce(state, { type: "enemy-turn", turn: state.turn });
}
function freeze(value) {
  Object.freeze(value);
  for (const child of Object.values(value))
    if (child && typeof child === "object") freeze(child);
  return value;
}

test("combat entry, withdrawal, exit and reentry are isolated from campaign state", () => {
  const campaign = createCampaignPreview("long-road-west");
  campaign.camp.active = true;
  campaign.notes.push("keep this");
  freeze(campaign);
  const snapshot = structuredClone(campaign);
  let state = enter();
  state = confirm(choose(state, "spell", "lookout"), campaign.campaignSettings);
  state = reduce(state, { type: "resolve", id: state.pending.id });
  state = reduce(state, { type: "summary" });
  assert.equal(state.mode, "summary");
  assert.equal(state.spent.charges, 1);
  state = reduce(state, { type: "exit" });
  assert.deepEqual(state, createCombatPreview());
  assert.deepEqual(reduce(state, { type: "enter" }), enter());
  assert.deepEqual(campaign, snapshot);
});

test("targets and costs are validated before committing an action", () => {
  let state = enter();
  assert.deepEqual(eligibleTargets(state, "attack"), ["lookout", "sentry"]);
  assert.deepEqual(eligibleTargets(state, "item"), ["james", "jinn"]);
  assert.deepEqual(eligibleTargets(state, "move"), ["james"]);
  state = reduce(state, { type: "choose", action: "attack" });
  assert.equal(reduce(state, { type: "target", target: "james" }), state);
  assert.equal(confirm(state), state);
  state = reduce(state, { type: "target", target: "lookout" });
  const frozen = freeze(state);
  const next = confirm(frozen);
  assert.equal(next.hp.lookout, 6);
  assert.equal(next.resources.action, 0);
  assert.equal(frozen.hp.lookout, 12);
  assert.equal(frozen.resources.action, 1);
  assert.equal(canChooseAction(next, "attack"), false);
  assert.equal(canChooseAction(next, "item"), true);
});

test("interactive roll reserves once and resumes with the same fixed result", () => {
  let state = choose(enter(), "attack", "lookout");
  const id = state.draft.id;
  const confirmation = { type: "confirm", id, preferences };
  state = reduce(state, confirmation);
  assert.equal(state.hp.lookout, 12);
  assert.equal(state.pending.resolved, false);
  assert.equal(state.resources.action, 0);
  assert.equal(state.spent.actions, 1);
  assert.equal(reduce(state, confirmation), state);
  assert.equal(end(state), state);
  assert.equal(reduce(state, { type: "summary" }), state);
  // Modal visibility is deliberately not encounter state. Close/reopen cannot resolve or reroll it.
  const fixture = state.pending.fixture;
  state = reduce(state, { type: "resolve", id });
  assert.equal(state.hp.lookout, 6);
  assert.equal(state.log.length, 1);
  assert.equal(state.pending.fixture, fixture);
  assert.equal(getDemoResult(fixture).total, 18);
  assert.equal(reduce(state, { type: "resolve", id }), state);
  assert.equal(reduce(state, { type: "resolve", id: id + 100 }), state);
});

test("duplicate automatic confirmation, repeated turn clicks and stale completion do nothing", () => {
  let state = choose(enter(), "attack", "lookout");
  const id = state.draft.id;
  const event = { type: "confirm", id, preferences: automatic };
  state = reduce(state, event);
  assert.equal(reduce(state, event), state);
  const turnEvent = { type: "end-turn", turn: state.turn };
  state = reduce(state, turnEvent);
  assert.equal(state.active, "jinn");
  assert.equal(reduce(state, turnEvent), state);
  assert.equal(reduce(state, { type: "resolve", id }), state);
  state = end(state);
  const enemyEvent = { type: "enemy-turn", turn: state.turn };
  state = reduce(state, enemyEvent);
  assert.equal(state.hp.james, 21);
  assert.equal(reduce(state, enemyEvent), state);
});

test("Hidden resolves without modal; compact resolves without a manual roll; frequency cannot suppress the sample attack", () => {
  for (const frequency of ["narrative", "balanced", "full-rpg"])
    for (const dicePresentation of ["hidden", "key-rolls", "all-player-rolls"])
      for (const interactiveDice of [false, true]) {
        const prefs = {
          ...preferences,
          checkFrequency: frequency,
          dicePresentation,
          interactiveDice,
        };
        const expected =
          dicePresentation === "hidden"
            ? "narrative"
            : interactiveDice
              ? "interactive"
              : "compact";
        assert.equal(combatPresentation(prefs), expected);
        const state = confirm(choose(enter(), "attack", "lookout"), prefs);
        assert.equal(state.pending.resolved, expected !== "interactive");
        assert.equal(state.hp.lookout, expected === "interactive" ? 12 : 6);
      }
});

test("no enemy roll or hidden target exists; Show DC cannot invent an attack target number", () => {
  for (const action of ["attack", "spell"]) {
    const roll = combatRoll(action);
    assert.equal(Object.hasOwn(roll, "publicDc"), false);
    assert.equal(
      getVisibleDc(
        { ...preferences, showDc: true },
        { visibility: "player", important: true, publicDc: roll.publicDc },
      ),
      undefined,
    );
  }
  let state = enemy(end(end(enter())));
  assert.equal(state.active, "james");
  assert.equal(state.round, 2);
  assert.ok(state.log.every((entry) => entry.fixture === undefined));
  assert.equal(JSON.stringify(state).includes("dm-private"), false);
});

test("direct companion control is independent of inspection, with guards and public positions", () => {
  let state = confirm(choose(enter(), "move", "james"));
  assert.equal(state.positions.james, "In Cover");
  assert.equal(state.resources.movement, 20);
  assert.equal(state.resources.action, 1);
  assert.equal(canChooseAction(state, "move"), false);
  state = confirm(choose(state, "defend", "james"));
  state = end(state);
  assert.equal(state.active, "jinn");
  assert.equal(state.resources.action, 1);
  state = confirm(choose(state, "spell", "sentry"));
  assert.equal(state.charges.jinn, 0);
  assert.equal(state.charges.james, 1);
  state = enemy(end(state));
  assert.equal(state.hp.james, 23);
  assert.equal(state.hp.jinn, 15);
  assert.equal(state.guarded.james, false);
  assert.equal(state.positions.james, "In Cover");
});

test("healing consumes isolated tonic/bonus action and cannot overfill health", () => {
  let state = enemy(end(end(enter())));
  state = confirm(choose(state, "item", "jinn"));
  assert.equal(state.hp.jinn, 18);
  assert.equal(state.tonics, 1);
  assert.equal(state.resources.bonus, 0);
  assert.equal(state.resources.action, 1);
  assert.equal(state.log.at(-1).amount, 3);
  assert.equal(canChooseAction(state, "item"), false);
});

test("free text is literal, labeled, duplicate guarded, and causes no interpreted effect", () => {
  const text = "  I offer peace.\n<not an instruction> Русский текст $&  ";
  let state = enter();
  const original = structuredClone(state);
  const event = { type: "describe", text, id: state.sequence };
  state = reduce(state, event);
  assert.equal(state.log.at(-1).text, text);
  assert.match(state.log.at(-1).message, /Authored demo response/);
  assert.deepEqual(state.resources, original.resources);
  assert.deepEqual(state.hp, original.hp);
  assert.equal(reduce(state, event), state);
});

test("coherent encounter reaches victory; summary retains injuries and loot is demo-only/idempotent", () => {
  let state = confirm(choose(enter(), "attack", "lookout"));
  state = confirm(choose(end(state), "attack", "lookout"));
  assert.equal(state.hp.lookout, 0);
  assert.equal(enemyHealth(0), "Withdrawn");
  state = enemy(end(state));
  assert.equal(state.hp.james, 24);
  assert.equal(state.hp.jinn, 15);
  state = confirm(choose(state, "spell", "sentry"));
  assert.equal(enemyHealth(state.hp.sentry), "Near Death");
  state = confirm(choose(end(state), "attack", "sentry"));
  assert.equal(encounterWon(state), true);
  assert.deepEqual(eligibleTargets(state, "attack"), []);
  state = reduce(state, { type: "summary" });
  assert.equal(state.hp.jinn, 15);
  assert.equal(state.spent.actions, 4);
  state = reduce(state, { type: "loot" });
  assert.equal(state.lootClaimed, true);
  assert.equal(reduce(state, { type: "loot" }), state);
  state = reduce(state, { type: "reset" });
  assert.deepEqual(state, enter());
});

test("combat data-driven labels and fixture text have Russian translations", () => {
  const phrases = [
    ...combatants.flatMap((p) => [p.name, p.position, p.description]),
    ...Object.values(combatActions).flatMap((a) => [a.label, a.detail, a.cost]),
    ...Object.values(demoResourceLabels),
  ];
  for (const action of ["attack", "spell"]) {
    const f = combatRoll(action);
    phrases.push(
      f.label,
      f.skill,
      f.action,
      f.narrative,
      ...f.modifiers.flatMap((m) => [m.label, m.explanation]),
    );
  }
  for (const phrase of phrases)
    assert.ok(Object.hasOwn(russian, phrase), phrase);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createCampaignSettings,
  updateCampaignSettings,
  difficultyPresets,
  previewRulesSystem,
  supportsDifficultyParameter,
  difficultyOptions,
  rerollOptions,
  defeatOptions,
  recoveryOptions,
  scarcityOptions,
  storyOptions,
  roleOptions,
  autonomyOptions,
} from "../src/lib/campaign-settings.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };

test("campaign defaults match the owner request and are independent copies", () => {
  const settings = createCampaignSettings("first");
  assert.equal(settings.campaign_id, "first");
  assert.equal(settings.language, "en");
  assert.deepEqual(settings.difficulty, {
    preset: "medium",
    enemyHpMultiplier: 1,
    enemyDamageMultiplier: 1,
    rerolls: "limited",
    rerollsPerSession: 2,
    defeat: "injuries",
    recovery: "standard",
    scarcity: "standard",
  });
  assert.equal(settings.storyStructure, "balanced");
  assert.equal(settings.playerRole, "one-of-many");
  assert.equal(settings.worldAutonomy, "moderate");
  settings.difficulty.enemyHpMultiplier = 3;
  settings.rulesSystem.enemyHpScaling = false;
  const another = createCampaignSettings("second");
  assert.equal(another.difficulty.enemyHpMultiplier, 1);
  assert.equal(another.rulesSystem.enemyHpScaling, true);
  assert.equal(difficultyPresets.medium.enemyHpMultiplier, 1);
});

test("each preset replaces all difficulty values, preserves narrative choices and campaign identity", () => {
  const expected = {
    easy: [0.75, 0.75, "unlimited", 3, "setbacks", "forgiving", "abundant"],
    medium: [1, 1, "limited", 2, "injuries", "standard", "standard"],
    hard: [1.5, 1.25, "disabled", 1, "death", "restrictive", "scarce"],
  };
  const original = {
    ...createCampaignSettings("long-road-west"),
    language: "ru",
    storyStructure: "sandbox",
    playerRole: "chosen",
    worldAutonomy: "high",
  };
  let settings = original;
  for (const preset of ["hard", "easy", "medium"]) {
    settings = updateCampaignSettings(settings, {
      type: "preset",
      value: preset,
    });
    const d = settings.difficulty;
    assert.equal(d.preset, preset);
    assert.deepEqual(
      [
        d.enemyHpMultiplier,
        d.enemyDamageMultiplier,
        d.rerolls,
        d.rerollsPerSession,
        d.defeat,
        d.recovery,
        d.scarcity,
      ],
      expected[preset],
    );
    assert.deepEqual(settings, { ...original, difficulty: d });
    assert.notEqual(d, difficultyPresets[preset]);
  }
  assert.equal(original.difficulty.preset, "medium");
});

test("every individual difficulty parameter selects Custom without changing other parameters", () => {
  const original = createCampaignSettings("long-road-west");
  const changes = {
    enemyHpMultiplier: 2,
    enemyDamageMultiplier: 0.5,
    rerolls: "disabled",
    rerollsPerSession: 7,
    defeat: "death",
    recovery: "restrictive",
    scarcity: "scarce",
  };
  for (const [key, value] of Object.entries(changes)) {
    const next = updateCampaignSettings(original, {
      type: "difficulty",
      key,
      value,
    });
    assert.deepEqual(next, {
      ...original,
      difficulty: { ...original.difficulty, [key]: value, preset: "custom" },
    });
  }
  assert.equal(original.difficulty.preset, "medium");
});

test("selecting Custom preserves current tuning and another preset replaces custom edits", () => {
  let settings = updateCampaignSettings(createCampaignSettings("first"), {
    type: "preset",
    value: "hard",
  });
  const hard = settings.difficulty;
  settings = updateCampaignSettings(settings, {
    type: "preset",
    value: "custom",
  });
  assert.deepEqual(settings.difficulty, { ...hard, preset: "custom" });
  settings = updateCampaignSettings(settings, {
    type: "difficulty",
    key: "enemyHpMultiplier",
    value: 2.5,
  });
  assert.equal(settings.difficulty.enemyDamageMultiplier, 1.25);
  settings = updateCampaignSettings(settings, {
    type: "preset",
    value: "medium",
  });
  assert.equal(settings.difficulty.enemyHpMultiplier, 1);
  assert.equal(settings.difficulty.preset, "medium");
});

test("story structure, player role and autonomy change independently of each other and difficulty", () => {
  let settings = createCampaignSettings("first");
  for (const [type, options] of [
    ["storyStructure", storyOptions],
    ["playerRole", roleOptions],
    ["worldAutonomy", autonomyOptions],
  ]) {
    for (const { value } of options) {
      const previous = settings;
      settings = updateCampaignSettings(previous, { type, value });
      assert.deepEqual(settings, { ...previous, [type]: value });
      assert.equal(settings.difficulty.preset, "medium");
    }
  }
  const changedLanguage = updateCampaignSettings(settings, {
    type: "language",
    value: "ru",
  });
  assert.deepEqual(changedLanguage, { ...settings, language: "ru" });
});

test("rules capabilities gate HP and damage independently for both presets and manual changes", () => {
  for (const [hp, damage] of [
    [false, true],
    [true, false],
    [false, false],
  ]) {
    const settings = createCampaignSettings("other-system", {
      ...previewRulesSystem,
      enemyHpScaling: hp,
      enemyDamageScaling: damage,
    });
    assert.equal(
      supportsDifficultyParameter(settings, "enemyHpMultiplier"),
      hp,
    );
    assert.equal(
      supportsDifficultyParameter(settings, "enemyDamageMultiplier"),
      damage,
    );
    const hard = updateCampaignSettings(settings, {
      type: "preset",
      value: "hard",
    });
    assert.equal(hard.difficulty.enemyHpMultiplier, hp ? 1.5 : 1);
    assert.equal(hard.difficulty.enemyDamageMultiplier, damage ? 1.25 : 1);
    for (const [key, enabled] of [
      ["enemyHpMultiplier", hp],
      ["enemyDamageMultiplier", damage],
    ]) {
      const changed = updateCampaignSettings(settings, {
        type: "difficulty",
        key,
        value: 2,
      });
      assert.equal(changed.difficulty[key], enabled ? 2 : 1);
      assert.equal(changed.difficulty.preset, enabled ? "custom" : "medium");
    }
  }
});

test("invalid numerical preview edits are ignored and reroll modes retain the chosen allowance", () => {
  let settings = createCampaignSettings("first");
  for (const key of [
    "enemyHpMultiplier",
    "enemyDamageMultiplier",
    "rerollsPerSession",
  ]) {
    for (const value of [NaN, Infinity, -1, 0, 99, 1.1]) {
      assert.equal(
        updateCampaignSettings(settings, { type: "difficulty", key, value }),
        settings,
      );
    }
  }
  settings = updateCampaignSettings(settings, {
    type: "difficulty",
    key: "rerollsPerSession",
    value: 5,
  });
  for (const value of ["disabled", "unlimited", "limited"]) {
    settings = updateCampaignSettings(settings, {
      type: "difficulty",
      key: "rerolls",
      value,
    });
    assert.equal(settings.difficulty.rerollsPerSession, 5);
  }
});

test("all data-driven rules choices and descriptions are available in Russian", () => {
  for (const options of [
    difficultyOptions,
    rerollOptions,
    defeatOptions,
    recoveryOptions,
    scarcityOptions,
    storyOptions,
    roleOptions,
    autonomyOptions,
  ]) {
    for (const option of options) {
      assert.ok(Object.hasOwn(russian, option.label), option.label);
      if (option.description)
        assert.ok(
          Object.hasOwn(russian, option.description),
          option.description,
        );
    }
  }
  assert.ok(Object.hasOwn(russian, previewRulesSystem.label));
});

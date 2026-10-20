import assert from "node:assert/strict";
import test from "node:test";
import {
  createCampaignSettings,
  updateCampaignSettings,
  checkFrequencyOptions,
  dicePresentationOptions,
} from "../src/lib/campaign-settings.ts";
import {
  demoFixtures,
  getDemoResult,
  getCheckPresentation,
  getVisibleDc,
  createDicePlayback,
  DEMO_ROLL_DURATION_MS,
} from "../src/lib/dice-preview.ts";
import { translate } from "../src/lib/i18n.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };

test("Checks & Dice defaults and every preference remain independent of difficulty and narrative settings", () => {
  const original = createCampaignSettings("long-road-west");
  assert.equal(original.checkFrequency, "balanced");
  assert.equal(original.dicePresentation, "key-rolls");
  assert.equal(original.interactiveDice, true);
  assert.equal(original.showDc, true, "fix run B3: the hero's check shows its difficulty by default");
  let settings = original;
  for (const [type, values] of [
    ["checkFrequency", ["narrative", "full-rpg", "balanced"]],
    ["dicePresentation", ["hidden", "all-player-rolls", "key-rolls"]],
    ["interactiveDice", [false, true]],
    ["showDc", [false, true]],
  ]) {
    for (const value of values) {
      const previous = settings;
      settings = updateCampaignSettings(settings, { type, value });
      assert.deepEqual(settings, { ...previous, [type]: value });
      assert.equal(settings.difficulty.preset, "medium");
    }
  }
  settings = {
    ...settings,
    checkFrequency: "full-rpg",
    dicePresentation: "hidden",
    interactiveDice: false,
    showDc: true,
  };
  for (const value of ["easy", "medium", "hard", "custom"]) {
    const next = updateCampaignSettings(settings, { type: "preset", value });
    assert.deepEqual(next, { ...settings, difficulty: next.difficulty });
  }
});

test("presentation matrix honors visibility, importance and interaction without exposing private checks", () => {
  for (const dicePresentation of ["hidden", "key-rolls", "all-player-rolls"]) {
    for (const interactiveDice of [false, true]) {
      for (const important of [false, true]) {
        const settings = { dicePresentation, interactiveDice, showDc: true };
        const expected =
          dicePresentation === "hidden" ||
          (dicePresentation === "key-rolls" && !important)
            ? "narrative"
            : interactiveDice
              ? "interactive"
              : "compact";
        assert.equal(
          getCheckPresentation(settings, { visibility: "player", important }),
          expected,
        );
        assert.equal(
          getCheckPresentation(settings, {
            visibility: "dm-private",
            important,
          }),
          "none",
        );
        assert.equal(
          getVisibleDc(settings, {
            visibility: "dm-private",
            important,
            publicDc: 15,
          }),
          undefined,
        );
      }
    }
  }
});

test("DC disclosure requires an eligible visible player check, permission, and Show DC", () => {
  const preferences = {
    dicePresentation: "all-player-rolls",
    interactiveDice: true,
    showDc: true,
  };
  const check = { visibility: "player", important: true, publicDc: 15 };
  assert.equal(getVisibleDc(preferences, check), 15);
  assert.equal(
    getVisibleDc({ ...preferences, interactiveDice: false }, check),
    15,
  );
  assert.equal(
    getVisibleDc({ ...preferences, showDc: false }, check),
    undefined,
  );
  assert.equal(
    getVisibleDc({ ...preferences, dicePresentation: "hidden" }, check),
    undefined,
  );
  assert.equal(
    getVisibleDc(
      { ...preferences, dicePresentation: "key-rolls" },
      { ...check, important: false },
    ),
    undefined,
  );
  assert.equal(
    getVisibleDc(preferences, { visibility: "player", important: true }),
    undefined,
  );
  assert.equal(
    Object.hasOwn(
      demoFixtures.find((fixture) => fixture.id === "insight"),
      "publicDc",
    ),
    false,
  );
});

test("Hidden retains both saved toggles and restores their effect when displayed again", () => {
  let settings = { ...createCampaignSettings("sample"), showDc: true };
  settings = updateCampaignSettings(settings, {
    type: "dicePresentation",
    value: "hidden",
  });
  assert.equal(settings.interactiveDice, true);
  assert.equal(settings.showDc, true);
  const check = { visibility: "player", important: true, publicDc: 15 };
  assert.equal(getCheckPresentation(settings, check), "narrative");
  assert.equal(getVisibleDc(settings, check), undefined);
  settings = updateCampaignSettings(settings, {
    type: "dicePresentation",
    value: "key-rolls",
  });
  assert.equal(getCheckPresentation(settings, check), "interactive");
  assert.equal(getVisibleDc(settings, check), 15);
});

test("fixed samples have correct arithmetic, higher/lower selection, and authored outcomes", () => {
  const expected = [
    [14, 0, 5, 19, "success"],
    [6, 0, 3, 9, "failure"],
    [16, 1, 5, 21, "success"],
    [7, 1, 4, 11, "failure"],
    [12, 0, 4, 16, "success"],
  ];
  for (const [index, fixture] of demoFixtures.entries()) {
    const before = structuredClone(fixture);
    const result = getDemoResult(fixture);
    assert.deepEqual(
      [
        result.kept,
        result.keptIndex,
        result.modifier,
        result.total,
        result.outcome,
      ],
      expected[index],
    );
    assert.deepEqual(result.dice, fixture.dice);
    if (fixture.publicDc !== undefined)
      assert.equal(
        result.total >= fixture.publicDc,
        result.outcome === "success",
      );
    assert.deepEqual(fixture, before);
  }
  // The presentation layer must not invent natural-1 failure or natural-20 success.
  assert.equal(
    getDemoResult({ ...demoFixtures[0], dice: [1], outcome: "success" })
      .outcome,
    "success",
  );
  assert.equal(
    getDemoResult({ ...demoFixtures[0], dice: [20], outcome: "failure" })
      .outcome,
    "failure",
  );
});

function harness(initialPhase = "ready") {
  const phases = [];
  const jobs = [];
  const cancelled = [];
  const playback = createDicePlayback({
    initialPhase,
    onPhase: (phase) => phases.push(phase),
    schedule: (callback, delay) => {
      jobs.push({ callback, delay });
      return jobs.length;
    },
    cancel: (handle) => cancelled.push(handle),
  });
  return { playback, phases, jobs, cancelled };
}

test("rapid activation schedules one reveal; completed rolls require explicit sample replay", () => {
  const { playback, phases, jobs } = harness();
  assert.deepEqual(phases, []);
  assert.equal(playback.play(false), true);
  for (let index = 0; index < 20; index++) {
    assert.equal(playback.play(false), false);
    assert.equal(playback.play(false, true), false);
  }
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].delay, DEMO_ROLL_DURATION_MS);
  assert.deepEqual(phases, ["rolling"]);
  jobs[0].callback();
  assert.deepEqual(phases, ["rolling", "revealed"]);
  assert.equal(playback.play(false), false);
  assert.equal(playback.play(false, true), true);
  assert.equal(jobs.length, 2);
  assert.deepEqual(phases, ["rolling", "revealed", "rolling"]);
  jobs[1].callback();
  assert.equal(phases.at(-1), "revealed");
  playback.dispose();
});

test("close/unmount cancels timers; stale callbacks cannot reveal a reopened window", () => {
  const old = harness();
  old.playback.play(false);
  old.playback.dispose();
  assert.deepEqual(old.cancelled, [1]);
  const reopened = harness();
  old.jobs[0].callback(); // Simulates a timer already queued when close occurred.
  assert.deepEqual(old.phases, ["rolling"]);
  assert.deepEqual(reopened.phases, []);
  assert.equal(old.playback.play(false), false);
  reopened.playback.play(false);
  reopened.jobs[0].callback();
  assert.deepEqual(reopened.phases, ["rolling", "revealed"]);
  reopened.playback.dispose();
});

test("reduced motion reveals immediately without scheduling animation, including replay", () => {
  const { playback, phases, jobs } = harness();
  assert.equal(playback.play(true), true);
  assert.deepEqual(phases, ["revealed"]);
  assert.equal(jobs.length, 0);
  assert.equal(playback.play(true), false);
  assert.equal(playback.play(true, true), true);
  assert.equal(jobs.length, 0);
  playback.dispose();
  const resumed = harness("revealed");
  assert.equal(resumed.playback.play(false), false);
  assert.equal(resumed.playback.play(false, true), true);
  resumed.playback.dispose();
});

test("all fixture text and new setting choices render in English and Russian", () => {
  for (const options of [checkFrequencyOptions, dicePresentationOptions]) {
    for (const option of options)
      for (const key of [option.label, option.description])
        assert.ok(Object.hasOwn(russian, key), key);
  }
  for (const fixture of demoFixtures) {
    const keys = [
      fixture.label,
      fixture.skill,
      fixture.action,
      fixture.narrative,
      ...fixture.modifiers.flatMap((modifier) => [
        modifier.label,
        modifier.explanation,
      ]),
    ];
    for (const key of keys) {
      assert.ok(Object.hasOwn(russian, key), key);
      assert.equal(translate("en", key), key);
      assert.equal(translate("ru", key), russian[key]);
    }
  }
  assert.equal(
    translate("ru", "{outcome}. Final total: {total}.", {
      outcome: "Успех",
      total: 19,
    }),
    "Успех. Итог: 19.",
  );
});

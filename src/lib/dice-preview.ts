import type { CampaignSettings } from "./campaign-settings";

export type DicePreferences = Pick<
  CampaignSettings,
  "dicePresentation" | "interactiveDice" | "showDc"
>;
export type RollMode = "ordinary" | "advantage" | "disadvantage";
export type DemoFixture = {
  id: string;
  label: string;
  skill: string;
  action: string;
  mode: RollMode;
  dice: readonly number[];
  modifiers: readonly { label: string; explanation: string; value: number }[];
  // Only player-disclosable DCs belong in this client demo. Absent means absent,
  // not a private target kept in the browser and merely hidden with CSS.
  publicDc?: number;
  outcome: "success" | "failure";
  narrative: string;
};

// All samples are player-facing and invented solely for this isolated demonstrator.
// No random source, AI, campaign resources, history, or reroll allowance is involved.
export const demoFixtures = [
  {
    id: "persuasion",
    label: "Ordinary · sample A",
    skill: "Persuasion",
    action:
      "Convince the night archivist to let James examine the old street plans.",
    mode: "ordinary",
    dice: [14],
    publicDc: 15,
    outcome: "success",
    modifiers: [
      {
        label: "Charisma",
        explanation: "A steady voice and a persuasive argument.",
        value: 3,
      },
      {
        label: "Proficiency",
        explanation: "Practiced skill, added once to the kept die.",
        value: 2,
      },
    ],
    narrative:
      "The archivist studies James for a moment, then slides a folded street plan across the desk.",
  },
  {
    id: "investigation",
    label: "Ordinary · sample B",
    skill: "Investigation",
    action:
      "Look for a readable address beneath the rain-damaged ink on the envelope.",
    mode: "ordinary",
    dice: [6],
    publicDc: 13,
    outcome: "failure",
    modifiers: [
      {
        label: "Intelligence",
        explanation: "Careful reasoning and attention to detail.",
        value: 1,
      },
      {
        label: "Proficiency",
        explanation: "Practiced skill, added once to the kept die.",
        value: 2,
      },
    ],
    narrative:
      "The ink has bled into the paper. James sets the envelope aside; another lead will have to wait for daylight.",
  },
  {
    id: "stealth",
    label: "Advantage · sample C",
    skill: "Stealth",
    action:
      "Move through the loading yard while Jinn draws the watchman's attention.",
    mode: "advantage",
    dice: [6, 16],
    publicDc: 17,
    outcome: "success",
    modifiers: [
      {
        label: "Dexterity",
        explanation: "Careful footing and controlled movement.",
        value: 3,
      },
      {
        label: "Proficiency",
        explanation: "Practiced skill, added once to the kept die.",
        value: 2,
      },
    ],
    narrative:
      "Jinn keeps the watchman talking. James reaches the far gate without drawing attention.",
  },
  {
    id: "perception",
    label: "Disadvantage · sample D",
    skill: "Perception",
    action:
      "Make out the signal light across the river through a curtain of rain.",
    mode: "disadvantage",
    dice: [17, 7],
    publicDc: 14,
    outcome: "failure",
    modifiers: [
      {
        label: "Wisdom",
        explanation: "Awareness of the world around you.",
        value: 2,
      },
      {
        label: "Proficiency",
        explanation: "Practiced skill, added once to the kept die.",
        value: 2,
      },
    ],
    narrative:
      "Rain swallows the distant light. James can make out the bridge, but no clear signal reaches him.",
  },
  {
    id: "insight",
    label: "Unstated target · sample E",
    skill: "Insight",
    action:
      "Listen carefully to the archivist's account of the missing ledger.",
    mode: "ordinary",
    dice: [12],
    outcome: "success",
    modifiers: [
      {
        label: "Wisdom",
        explanation: "Awareness of the world around you.",
        value: 2,
      },
      {
        label: "Proficiency",
        explanation: "Practiced skill, added once to the kept die.",
        value: 2,
      },
    ],
    narrative:
      "James notices the archivist's hesitation and gently asks her to tell the story in her own time.",
  },
] as const satisfies readonly DemoFixture[];
export type DemoFixtureId = (typeof demoFixtures)[number]["id"];
export type DiceDemoState = {
  fixtureId: DemoFixtureId;
  important: boolean;
  revealed: boolean;
};
export const initialDiceDemo: DiceDemoState = {
  fixtureId: "persuasion",
  important: true,
  revealed: false,
};

export function getCheckPresentation(
  preferences: DicePreferences,
  check: { visibility: "player" | "dm-private"; important: boolean },
) {
  // There are no private fixtures. This fail-closed policy also documents the
  // future boundary; it does not substitute for keeping private data server-only.
  if (check.visibility !== "player") return "none";
  if (
    preferences.dicePresentation === "hidden" ||
    (preferences.dicePresentation === "key-rolls" && !check.important)
  )
    return "narrative";
  return preferences.interactiveDice ? "interactive" : "compact";
}

export function getVisibleDc(
  preferences: DicePreferences,
  check: {
    visibility: "player" | "dm-private";
    important: boolean;
    publicDc?: number;
  },
) {
  const presentation = getCheckPresentation(preferences, check);
  return preferences.showDc &&
    (presentation === "interactive" || presentation === "compact")
    ? check.publicDc
    : undefined;
}

// Arithmetic for fixed sample data only. Outcome is an authored fixture value,
// not a rules engine or universal natural-1/natural-20 rule.
export function getDemoResult(fixture: DemoFixture) {
  const kept =
    fixture.mode === "advantage"
      ? Math.max(...fixture.dice)
      : fixture.mode === "disadvantage"
        ? Math.min(...fixture.dice)
        : fixture.dice[0];
  const modifier = fixture.modifiers.reduce((sum, item) => sum + item.value, 0);
  return {
    dice: fixture.dice,
    keptIndex: fixture.dice.indexOf(kept),
    kept,
    modifier,
    total: kept + modifier,
    outcome: fixture.outcome,
  };
}

export type PlaybackPhase = "ready" | "rolling" | "revealed";
export const DEMO_ROLL_DURATION_MS = 1150;

// Presentation lifecycle only. It never chooses, changes, or resolves a result.
// A synchronous guard covers multiple activations before React can render.
export function createDicePlayback({
  initialPhase = "ready",
  onPhase,
  schedule = (callback: () => void, delay: number) =>
    setTimeout(callback, delay),
  cancel = (handle: ReturnType<typeof setTimeout>) => clearTimeout(handle),
}: {
  initialPhase?: "ready" | "revealed";
  onPhase: (phase: PlaybackPhase) => void;
  schedule?: (
    callback: () => void,
    delay: number,
  ) => ReturnType<typeof setTimeout>;
  cancel?: (handle: ReturnType<typeof setTimeout>) => void;
}) {
  let phase: PlaybackPhase = initialPhase;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function publish(next: PlaybackPhase) {
    phase = next;
    onPhase(next);
  }
  function play(reducedMotion: boolean, replay = false) {
    if (
      disposed ||
      phase === "rolling" ||
      (phase === "revealed" && !replay) ||
      (phase === "ready" && replay)
    )
      return false;
    if (reducedMotion) {
      publish("revealed");
      return true;
    }
    publish("rolling");
    timer = schedule(() => {
      timer = undefined;
      if (!disposed) publish("revealed");
    }, DEMO_ROLL_DURATION_MS);
    return true;
  }
  return {
    play,
    dispose() {
      disposed = true;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
    },
  };
}

import type { Language } from "./i18n";

export type DifficultyValues = {
  enemyHpMultiplier: number;
  enemyDamageMultiplier: number;
  rerolls: "disabled" | "limited" | "unlimited";
  rerollsPerSession: number;
  defeat: "setbacks" | "injuries" | "death";
  recovery: "forgiving" | "standard" | "restrictive";
  scarcity: "abundant" | "standard" | "scarce";
};
export type DifficultyPreset = "easy" | "medium" | "hard" | "custom";
export type StoryStructure = "story-led" | "balanced" | "sandbox";
export type PlayerRole = "one-of-many" | "significant" | "chosen";
export type WorldAutonomy = "low" | "moderate" | "high";

// Provisional UI examples only. No game engine consumes these values in Phase 0.
// The allowance is retained but inactive when rerolls are disabled or unlimited.
export const difficultyPresets = {
  easy: {
    enemyHpMultiplier: 0.75,
    enemyDamageMultiplier: 0.75,
    rerolls: "unlimited",
    rerollsPerSession: 3,
    defeat: "setbacks",
    recovery: "forgiving",
    scarcity: "abundant",
  },
  medium: {
    enemyHpMultiplier: 1,
    enemyDamageMultiplier: 1,
    rerolls: "limited",
    rerollsPerSession: 2,
    defeat: "injuries",
    recovery: "standard",
    scarcity: "standard",
  },
  hard: {
    enemyHpMultiplier: 1.5,
    enemyDamageMultiplier: 1.25,
    rerolls: "disabled",
    rerollsPerSession: 1,
    defeat: "death",
    recovery: "restrictive",
    scarcity: "scarce",
  },
} as const satisfies Record<
  Exclude<DifficultyPreset, "custom">,
  DifficultyValues
>;

export const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "custom", label: "Custom" },
] as const;
export const rerollOptions = [
  { value: "disabled", label: "Disabled" },
  { value: "limited", label: "Limited" },
  { value: "unlimited", label: "Unlimited" },
] as const;
export const defeatOptions = [
  { value: "setbacks", label: "Narrative setbacks" },
  { value: "injuries", label: "Lasting injuries" },
  { value: "death", label: "Death possible" },
] as const;
export const recoveryOptions = [
  { value: "forgiving", label: "Forgiving" },
  { value: "standard", label: "Standard" },
  { value: "restrictive", label: "Restrictive" },
] as const;
export const scarcityOptions = [
  { value: "abundant", label: "Abundant" },
  { value: "standard", label: "Standard" },
  { value: "scarce", label: "Scarce" },
] as const;
export const storyOptions = [
  {
    value: "story-led",
    label: "Story-led",
    description:
      "The DM actively supports a central narrative. You decide how your character responds.",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "A central narrative coexists with player-led exploration.",
  },
  {
    value: "sandbox",
    label: "Sandbox",
    description:
      "Player goals drive play, with no forced return to a main plot.",
  },
] as const;
export const roleOptions = [
  {
    value: "one-of-many",
    label: "One of many",
    description:
      "You are part of a larger world; significance grows from your choices.",
  },
  {
    value: "significant",
    label: "Significant figure",
    description: "Your character already has an important place in the world.",
  },
  {
    value: "chosen",
    label: "Chosen one",
    description:
      "A special calling is part of your premise. How you respond remains your choice.",
  },
] as const;
export const autonomyOptions = [
  {
    value: "low",
    label: "Low",
    description:
      "Important NPCs and factions act mostly near your current story, as time and events advance.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description:
      "Important NPCs and factions also pursue relevant goals off-screen as in-world time and meaningful events advance.",
  },
  {
    value: "high",
    label: "High",
    description:
      "Important NPCs and factions pursue their own goals more actively, with consequences revealed through relevant events.",
  },
] as const;

export type RulesSystem = {
  id: string;
  label: string;
  enemyHpScaling: boolean;
  enemyDamageScaling: boolean;
};
// This is an illustrative rules profile, not a claim about imported campaign canon.
export const previewRulesSystem: RulesSystem = {
  id: "james-jinn-preview",
  label: "James & Jinn · preview rules",
  enemyHpScaling: true,
  enemyDamageScaling: true,
};
export const previewLimits = {
  multiplier: { min: 0.25, max: 3, step: 0.25 },
  rerollsPerSession: { min: 1, max: 20, step: 1 },
} as const;

export type CampaignSettings = {
  campaign_id: string;
  language: Language;
  rulesSystem: RulesSystem;
  difficulty: DifficultyValues & { preset: DifficultyPreset };
  storyStructure: StoryStructure;
  playerRole: PlayerRole;
  worldAutonomy: WorldAutonomy;
};

export function createCampaignSettings(
  campaignId: string,
  rulesSystem = previewRulesSystem,
): CampaignSettings {
  return {
    campaign_id: campaignId,
    language: "en",
    rulesSystem: { ...rulesSystem },
    difficulty: { preset: "medium", ...difficultyPresets.medium },
    storyStructure: "balanced",
    playerRole: "one-of-many",
    worldAutonomy: "moderate",
  };
}

type DifficultyChange = {
  [K in keyof DifficultyValues]: {
    type: "difficulty";
    key: K;
    value: DifficultyValues[K];
  };
}[keyof DifficultyValues];
export type CampaignSettingsAction =
  | DifficultyChange
  | { type: "preset"; value: DifficultyPreset }
  | { type: "language"; value: Language }
  | { type: "storyStructure"; value: StoryStructure }
  | { type: "playerRole"; value: PlayerRole }
  | { type: "worldAutonomy"; value: WorldAutonomy };

export function supportsDifficultyParameter(
  settings: CampaignSettings,
  key: keyof DifficultyValues,
) {
  if (key === "enemyHpMultiplier") return settings.rulesSystem.enemyHpScaling;
  if (key === "enemyDamageMultiplier")
    return settings.rulesSystem.enemyDamageScaling;
  return true;
}

// Pure state transitions shared by the preview and regression tests; no persistence or gameplay.
export function updateCampaignSettings(
  settings: CampaignSettings,
  action: CampaignSettingsAction,
): CampaignSettings {
  if (action.type === "preset") {
    if (action.value === "custom") {
      return {
        ...settings,
        difficulty: { ...settings.difficulty, preset: "custom" },
      };
    }
    const values: DifficultyValues = { ...difficultyPresets[action.value] };
    // Unsupported mechanics stay inactive and untouched, even when a preset is applied.
    if (!settings.rulesSystem.enemyHpScaling)
      values.enemyHpMultiplier = settings.difficulty.enemyHpMultiplier;
    if (!settings.rulesSystem.enemyDamageScaling)
      values.enemyDamageMultiplier = settings.difficulty.enemyDamageMultiplier;
    return { ...settings, difficulty: { ...values, preset: action.value } };
  }
  if (action.type === "difficulty") {
    if (!supportsDifficultyParameter(settings, action.key)) return settings;
    if (typeof action.value === "number") {
      const limits =
        action.key === "rerollsPerSession"
          ? previewLimits.rerollsPerSession
          : previewLimits.multiplier;
      if (
        !Number.isFinite(action.value) ||
        action.value < limits.min ||
        action.value > limits.max ||
        !Number.isInteger(action.value / limits.step)
      )
        return settings;
    }
    return {
      ...settings,
      difficulty: {
        ...settings.difficulty,
        [action.key]: action.value,
        preset: "custom",
      },
    };
  }
  return { ...settings, [action.type]: action.value };
}

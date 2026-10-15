export const stage5Screens = [
  "menu", "campaigns", "new-campaign",
  "game", "character", "inventory", "party", "journal", "codex", "map", "holdings", "settings", "adventures",
] as const;
export type Stage5Screen = (typeof stage5Screens)[number];
export type Stage5Variant = {
  /** Which synthetic sample campaign: the steampunk D&D-style one or the narrative noir. */
  world: "shov" | "noir";
  moment: boolean;
  combat: boolean;
  dice: boolean;
  talk: boolean;
  aside: boolean;
  step?: number;
  holding: string | null;
};

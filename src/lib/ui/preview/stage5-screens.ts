export const stage5Screens = [
  "menu", "campaigns", "new-campaign",
  "game", "character", "inventory", "party", "journal", "codex", "map", "holdings", "settings", "adventures", "chronicle", "owner",
] as const;
export type Stage5Screen = (typeof stage5Screens)[number];
export type Stage5Variant = {
  /** Which synthetic sample campaign: the steampunk D&D-style one or the narrative noir. */
  world: "shov" | "noir";
  moment: boolean;
  /** Polish 3 §2: the «Ведущий записывает…» state (the text complete, the bookkeeper recording). */
  recording?: boolean;
  combat: boolean;
  dice: boolean;
  talk: boolean;
  aside: boolean;
  step?: number;
  holding: string | null;
};

// Persistent navigation only. Static Phase 0 previews keep their own routes.
// Keep every historical route in saveNavigation for restored saves and deep links.
// The player-facing shell presents the smaller Phase-0 hierarchy below.
export const playerNavigation = [
  ["game", "Game"],
  ["character", "Character"],
  ["inventory", "Inventory"],
  ["party", "Party"],
  ["journal", "Journal"],
  ["map", "Map"],
  ["library", "Library"],
  ["gallery", "Gallery"],
  ["sessions", "Sessions"],
  ["settings", "Campaign Settings"],
] as const;

export const saveNavigation = [
  ["game", "Game"],
  ["adventures", "Adventures"],
  ["character", "Character"],
  ["inventory", "Inventory"],
  ["party", "Party"],
  ["journal", "Journal"],
  ["timeline", "Timeline Explorer"],
  ["home", "Places of Belonging"],
  ["map", "Map"],
  ["world", "World"],
  ["dm-chat", "Chat with DM"],
  ["library", "Library"],
  ["gallery", "Gallery"],
  ["frame", "Visual Bible / FRAME"],
  ["sessions", "Sessions"],
  ["saves", "Saves"],
  ["settings", "Campaign Settings"],
] as const;
export const mobileCampaignScreens = [
  "game",
  "character",
  "map",
  "journal",
] as const;

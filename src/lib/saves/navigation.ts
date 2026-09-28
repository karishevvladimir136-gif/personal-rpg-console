// Persistent navigation only. Static Phase 0 previews keep their own routes.
export const saveNavigation = [
  ["game", "Game"],
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

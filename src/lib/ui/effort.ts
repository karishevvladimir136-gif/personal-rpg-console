// Readable names for a model's reasoning-effort levels. The levels themselves come
// from the selected model's capabilities (dmTurnModels[].efforts), never a fixed set.
const NAMES: Record<string, [string, string]> = {
  minimal: ["минимальная", "minimal"],
  low: ["низкая", "low"],
  medium: ["средняя", "medium"],
  high: ["высокая", "high"],
  xhigh: ["очень высокая", "extra high"],
  max: ["максимум", "max"],
};
export function effortLabel(level: string, lang: "en" | "ru") {
  const name = NAMES[level];
  return name ? name[lang === "ru" ? 0 : 1] : level;
}

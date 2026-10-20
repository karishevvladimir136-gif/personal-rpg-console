// Fix run after session 2 (item 7): the «Мастерство Ведущего» screen's presentation — the short description of a
// card, the Russian names of its categories, and the order (the main doctrine «Как вести игру» first).

/** The first sentence or two of a card's text (more while shorter than `min`, for the wide main card): the grid shows
 * this, clipped to three lines by CSS. */
export function craftSummary(text: string, max = 220, min = 90, sentencesAtMost = min > 90 ? 4 : 2): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?…]+(?:[.!?…]+["»”)]*|$)/gu)?.map((part) => part.trim()).filter(Boolean) ?? [];
  let summary = sentences[0] ?? clean;
  for (const next of sentences.slice(1, sentencesAtMost)) {
    if (summary.length >= min) break;
    summary = `${summary} ${next}`;
  }
  if (summary.length <= max) return summary;
  const cut = summary.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,:;—-]+$/u, "")}…`;
}

const CATEGORY_RU: Record<string, string> = {
  core: "основа",
  challenge: "вызов",
  continuity: "непрерывность",
  rhythm: "ритм",
  agency: "свобода действий",
  characters: "персонажи",
  world: "мир",
  cognitive: "разум мира",
  knowledge: "знания героя",
  voice: "голос",
  bookkeeping: "записи",
  antagonists: "противники и тема",
  causality: "причины и последствия",
  relationships: "отношения",
  "long-form": "долгая история",
  companions: "спутники",
};

/** A card's category as a tag: Russian where the name is known; an unknown English word is not shown in Russian. */
export function craftCategoryLabel(category: string, language: "en" | "ru"): string | null {
  const key = category.trim().toLowerCase();
  if (!key) return null;
  if (language === "en") return key;
  return CATEGORY_RU[key] ?? (/[а-яё]/iu.test(key) ? key : null);
}

/** The main doctrine first (the core doctrine, then any other doctrine), then the cards by title. */
export function craftOrder<T extends { key: string; kind: string; title: string }>(rows: readonly T[]): { main: T | null; cards: T[] } {
  const doctrines = rows.filter((row) => row.kind === "doctrine").sort((a, b) => Number(b.key === "core-doctrine") - Number(a.key === "core-doctrine"));
  const main = doctrines[0] ?? null;
  const cards = rows.filter((row) => row !== main).sort((a, b) => Number(b.kind === "doctrine") - Number(a.kind === "doctrine") || a.title.localeCompare(b.title));
  return { main, cards };
}

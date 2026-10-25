// Fixes before session 3 (docs/stages/FIX_S3_PRE.md 2.4, the audit's F rows): one English→Russian map of the fight's
// words, applied at render. The stored words stay English: the server matches them literally (dead, fled, surprised,
// unconscious, dying…). The owner's wording. Pure, client-safe.

export const CONDITION_RU: Readonly<Record<string, string>> = {
  dying: "при смерти", unconscious: "без сознания", concentrating: "концентрируется", surprised: "застигнут врасплох",
  fled: "бежал", surrendered: "сдался", hidden: "скрыт", prone: "лежит", paralysed: "парализован", paralyzed: "парализован",
  poisoned: "отравлен", frightened: "напуган", grappled: "схвачен", restrained: "опутан", stunned: "оглушён",
  blinded: "ослеплён", deafened: "оглох", invisible: "невидим", incapacitated: "недееспособен", dead: "мёртв",
  // Fix S3-accept Г3: the effects the 5e rules module counts in the AC.
  shield: "щит", "mage armor": "доспехи мага", "mage armour": "доспехи мага",
};

export const OUTCOME_RU: Readonly<Record<string, string>> = {
  victory: "победа", defeat: "поражение", retreat: "отход", truce: "перемирие",
  // The encounter outcomes the combat tool takes (tools.ts ENCOUNTER_OUTCOMES), as the end chip says them.
  escape: "бегство", surrender: "сдача", negotiation: "договорились", "objective-completion": "цель достигнута",
};
const OUTCOME_EN: Readonly<Record<string, string>> = { negotiation: "negotiated", "objective-completion": "objective reached" };

/** A condition as the player reads it: the Russian word in a Russian campaign, the stored word otherwise. */
export function conditionWord(word: string, language: string): string {
  if (language !== "ru") return word;
  return CONDITION_RU[word.trim().toLowerCase()] ?? word;
}
export function conditionsText(words: readonly string[], language: string): string {
  return words.map((word) => conditionWord(word, language)).join(", ");
}
/** A fight's outcome as the player reads it. */
export function outcomeWord(outcome: string, language: string): string {
  return language === "ru" ? OUTCOME_RU[outcome] ?? outcome : OUTCOME_EN[outcome] ?? outcome;
}

// Fix run after session 2, stage F (item 20): the one request that builds the whole hero. The campaign's DM (the
// wizard's default, Claude Opus 5.5, or the campaign's own pinned model) reads the world and the owner's words and
// answers with one JSON object; src/lib/adventures/hero-draft.ts reads it. The rules of the game are knowledge (the
// world or the owner names them — D&D 5e, say), never code. Pure: no provider, no keys.
import type { DmEffort } from "../model-runtime/dm-models.ts";
import type { DmMessage, DmSystemBlock } from "../server/dm/model/contracts.ts";
import { ITEM_KINDS, SLOT_IDS } from "../inventory/model.ts";

/** The DM that drafts a new hero: the DM a new campaign gets by default (the wizard's first choice). */
export const HERO_DRAFT_DM = Object.freeze({ providerId: "anthropic" as const, modelId: "claude-opus-5-5", reasoning: "high" as const });

/** Room for a full spell list with its texts plus the model's thinking (a cut answer becomes a hand-filled sheet). */
export const HERO_DRAFT_OUTPUT_TOKENS = 48_000;

const INSTRUCTIONS = `You are the DM of a new campaign. Build the player's hero for the first session in one pass, from the owner's words and the world. The owner approves the sheet on the next screen, edits what he wants and presses one button — so the sheet must be complete and playable now.

Rules:
- The rules of the game are knowledge: use the system the owner or the world names (for example D&D 5e) with its real numbers; when none is named, an ordinary fantasy RPG sheet.
- Every number the owner gave is kept exactly: ability scores, level, HP, AC, bonuses, saves, skills, spell slots, counts, money. Where he gave no number, derive it by the rules (5e: modifiers, the proficiency bonus by level, saves and skills from proficiencies, spell slots by class and level, HP by class, level and CON, AC from armour and DEX).
- Never ask about anything the owner already wrote. Ask a question only when something essential is missing and cannot be derived; usually there are none. Questions never block the start.
- Every thing the owner names becomes an item with its quantity, its kind, the slot it is worn or held in (or null when it is carried), its damage and properties in one short line, and its bonuses. When the owner names no gear or asks for the usual kit, give the ordinary starting equipment of the role.
- Item kinds: ${ITEM_KINDS.join(", ")}. Slots: ${SLOT_IDS.join(", ")} (rings: ring_left, ring_right; a two-handed weapon: hand with "hands": 2). Wear what the owner wears; one thing per slot; a stack stays in the pack (slot null).
- Counters are pools with a maximum: spell slots by level (key spell_slots_1 … spell_slots_9), hit dice (hit_dice), class resources (arcane_recovery, ki, rage, …). Each has a Latin key and a label in the campaign language. Money and things are never counters: potions and ammunition are items.
- Money is coins by code: in a Russian 5e campaign пм, зм, эм, см, мм; in English pp, gp, ep, sp, cp; another world's coins by their own word.
- Spells: every cantrip and spell the hero knows or has prepared, with its level (0 for a cantrip), "prepared", casting time, range, components, duration, save or attack, damage, and a short text (at most three sentences).
- Lines are short, at most 200 characters each: saves («Спасбросок Интеллекта +9»), skills («Магия +9»), attacks («Боевой посох: +3 к попаданию, 1d6 дробящий»), features («Магическое восстановление: …»), limitations.
- A hero with no numbers in a story game: "mode": "narrative", "abilities": null, "hp": null, no counters.
- Every text value is written in the campaign language. Answer with one JSON object and nothing else:
{
  "mode": "structured_rpg" | "narrative",
  "role": "the class or role in one line, e.g. «Волшебник 9-го уровня, школа воплощения»",
  "level": 9,
  "background": "who the hero is, from the owner's words, at most 2000 characters",
  "abilities": { "strength": 8, "dexterity": 14, "constitution": 14, "intelligence": 20, "wisdom": 12, "charisma": 10 },
  "proficiencyBonus": 4,
  "hp": 52,
  "armorClass": 15,
  "speed": "30 футов",
  "saves": ["…"], "skills": ["…"], "attacks": ["…"], "features": ["…"], "limitations": ["…"],
  "spells": [ { "name": "…", "level": 3, "prepared": true, "castingTime": "…", "range": "…", "components": "…", "duration": "…", "saveOrAttack": "…", "damage": "…", "concentration": false, "ritual": false, "text": "…" } ],
  "preparedMax": 14,
  "items": [ { "name": "…", "description": "…", "quantity": 1, "kind": "weapon", "slot": "hand", "damage": "1d6 дробящий", "properties": "универсальное (1d8)", "bonuses": [ { "to": "атаки", "value": 1 } ], "hands": 1, "attunement": false, "charges": null } ],
  "counters": [ { "key": "spell_slots_1", "label": "Ячейки 1 круга", "value": 4, "max": 4 } ],
  "money": [ { "coin": "зм", "amount": 60 } ],
  "humanoid": true,
  "questions": []
}`;

export type HeroDraftContext = {
  language: "en" | "ru";
  name: string;
  description: string;
  world: { title: string; premise: string };
};

/** The request: the instructions (cached), the world and the owner's words. */
export function buildHeroDraftRequest(context: HeroDraftContext, effort: DmEffort): { system: DmSystemBlock[]; messages: DmMessage[]; effort: DmEffort } {
  const ru = context.language === "ru";
  const language = ru
    ? "The campaign language is Russian: every text value in Russian (labels, lines, spells, items)."
    : "The campaign language is English.";
  const user = [
    `World: ${context.world.title}`,
    context.world.premise.trim(),
    "",
    `The hero's name: ${context.name}`,
    ru ? "The owner's words («Кто вы?»):" : "The owner's words (“Who are you?”):",
    context.description.trim(),
  ].join("\n");
  return { system: [{ text: INSTRUCTIONS, cache: true }, { text: language, cache: false }], messages: [{ role: "user", text: user }], effort };
}

// Multi-hero 1: PARTY_1's three characters (scripts/game-party-1/sheets.mjs), each with the hero record's own counter —
// Heroic Inspiration, 0 of 1 — so all three records carry what the app gave only the hero: sheet, inventory, conditions,
// their own Inspiration (and, by the DM option `company`, their own player's rerolls). Nothing else changes: the same
// classes, numbers, things and coin, so this table's players differ from PARTY_1's and the characters do not.
import { CHARACTERS as PARTY_CHARACTERS, REVIEWS as PARTY_REVIEWS, WHO, sheetText } from "../game-party-1/sheets.mjs";

export { WHO, sheetText };
export const INSPIRATION = { key: "heroic_inspiration", label: "Heroic Inspiration", value: 0, max: 1 };
export const REVIEWS = Object.fromEntries(Object.entries(PARTY_REVIEWS).map(([id, review]) => [id, { ...review, counters: [...review.counters, { ...INSPIRATION }] }]));
/** The three, seat by seat; seat 1's character is only the app's first record (the wizard makes one), nothing more. */
export const CHARACTERS = PARTY_CHARACTERS;
export const characterOf = (id) => CHARACTERS.find((c) => c.id === id) ?? null;

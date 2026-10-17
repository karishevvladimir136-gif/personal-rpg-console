// Polish 2 §6: a combat profile drafted by the DM's model from the hero's text, on demand, for the
// owner to approve in the combat-readiness review (nothing is saved without the click). Pure: the
// request text and the parser; the server (combat-draft.ts there) makes the call.
import type { CombatReadinessProposal } from "./combat-readiness.ts";

export type CombatDraft = {
  hp: number; attack: number; defense: number; skill: number;
  weaponIndex: number | null; weaponDamage: number | null;
  /** One sentence for the owner: why these numbers. */
  why: string;
};
export type CombatDraftHero = { name: string; details: string; sheet: unknown; items: string[]; conditions: string[] };

export function combatDraftRequest(hero: CombatDraftHero, proposal: CombatReadinessProposal, language: "ru" | "en") {
  const system = [
    "You are the game master of a private role-playing campaign proposing starter combat values for the hero, for the owner to approve. The values follow the console-basic house profile: hp 1–60 (an ordinary person about 10, a hardened fighter 20–30), attack -5–10 (a bonus to hit), defense 5–25 (10 is an unarmoured ordinary person), skill -5–10 (a bonus to non-combat checks). A weapon's damage is 1–12 (a knife 2–3, a sword or an axe 5–6, a heavy weapon 7–8, a pistol 6).",
    "Read the hero's description, sheet and possessions. Propose values that fit the text — a former diver is tough but no swordsman; a scholar is fragile and skilled. Never invent abilities, items or a weapon the hero does not have; pick a weapon only from the possessions listed (by index), null otherwise.",
    "Reply with one JSON object only: {\"hp\":n,\"attack\":n,\"defense\":n,\"skill\":n,\"weaponIndex\":n|null,\"weaponDamage\":n|null,\"why\":\"one sentence\"}.",
    `Write «why» in ${language === "ru" ? "Russian" : "English"}.`,
  ].join("\n");
  const possessions = proposal.possessions.filter((item) => (item.currentQuantity ?? item.quantity) > 0).map((item) => `${item.index}: ${item.name}${item.description ? ` — ${item.description.slice(0, 120)}` : ""}`);
  const user = [
    `The hero: ${hero.name}.`,
    `Description: ${hero.details.replace(/\s+/g, " ").trim().slice(0, 3000) || "(none)"}`,
    hero.sheet ? `Sheet: ${JSON.stringify(hero.sheet).slice(0, 3000)}` : "",
    hero.items.length ? `Carries: ${hero.items.join(", ")}` : "",
    hero.conditions.length ? `Conditions: ${hero.conditions.join(", ")}` : "",
    possessions.length ? `Possessions the weapon may come from (index: name):\n${possessions.join("\n")}` : "No approved possessions.",
    `Already saved (keep): ${["hp", "attack", "defense", "skill"].filter((stat) => proposal.hero[stat as "hp"] !== null).map((stat) => `${stat} ${proposal.hero[stat as "hp"]}`).join(", ") || "nothing"}.`,
  ].filter(Boolean).join("\n");
  return { system, user };
}

const int = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : null);
/** The draft from the model's reply, bounded to the house profile; the weapon must be an approved possession. */
export function parseCombatDraft(text: string, proposal: CombatReadinessProposal): CombatDraft | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const hp = int(v.hp, 1, 60), attack = int(v.attack, -5, 10), defense = int(v.defense, 5, 25), skill = int(v.skill, -5, 10);
    if (hp === null || attack === null || defense === null || skill === null) return null;
    const indices = new Set(proposal.possessions.filter((item) => (item.currentQuantity ?? item.quantity) > 0).map((item) => item.index));
    const weaponIndex = typeof v.weaponIndex === "number" && indices.has(v.weaponIndex) ? v.weaponIndex : null;
    const weaponDamage = weaponIndex === null ? null : int(v.weaponDamage, 1, 12) ?? 2;
    return { hp, attack, defense, skill, weaponIndex, weaponDamage, why: typeof v.why === "string" ? v.why.replace(/\s+/g, " ").trim().slice(0, 300) : "" };
  } catch {
    return null;
  }
}

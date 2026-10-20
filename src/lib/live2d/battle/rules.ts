// The optional rules module (Part 2, the owner's addition): when the campaign's
// system describes them, the server applies to an attack what is pure arithmetic
// — a condition's advantage or disadvantage, the auto-crit on a helpless target
// within reach, cover's armour-class bonus, the crit's doubled dice, resistance /
// immunity / vulnerability on damage — and names each applied rule on the card.
// The DM still decides what happens; the code does the sums. Off for systems
// without such descriptions (the DM may switch it per fight); on for 5e-like ones.
// Words are matched in English and Russian; nothing else about the system is
// hard-coded.
import type { Combatant, Cover } from "./contracts.ts";

export type Advantage = "normal" | "advantage" | "disadvantage";
export type AppliedRule = { rule: string; effect: string };

/** 5e-like systems by the campaign's rules-system name; anything else leaves the module off. */
export function rulesOnByDefault(systemName: string | null | undefined): boolean {
  return /\b5e\b|d&d|dnd|dungeons|5-?я\s*ред|пят(ая|ой)\s*ред|днд|pathfinder|pf2/iu.test(systemName ?? "");
}

const has = (conditions: readonly string[], pattern: RegExp) => conditions.some((word) => pattern.test(word));
const BLINDED = /blind|слеп/iu, PRONE = /prone|лежит|ничком|сбит/iu, RESTRAINED = /restrain|скован|опутан/iu, POISONED = /poison|отравл/iu, FRIGHTENED = /frighten|испуг|страх/iu;
const STUNNED = /stun|оглуш/iu, PARALYSED = /paraly|парализ/iu, UNCONSCIOUS = /unconscious|без сознания|dying|при смерти/iu, PETRIFIED = /petrif|окамен/iu, INCAPACITATED = /incapacit|недееспос/iu;
const INVISIBLE = /invisib|невидим/iu;

export type AttackInput = {
  attacker: Pick<Combatant, "conditions">;
  target: Pick<Combatant, "conditions">;
  /** Distance in feet; null when unknown (no grid). */
  feet: number | null;
  cover: Cover | null;
  ranged: boolean;
  /** The attacker cannot see the target (darkness without darkvision, as the DM states it). */
  unseen?: boolean;
  /** A hostile able to act stands within 5 ft of the attacker (the server measures it): a ranged attack is at disadvantage. */
  hostileAdjacent?: boolean;
};
export type AttackRuling = { advantage: Advantage; autoCrit: boolean; acBonus: number; rules: AppliedRule[]; impossible: string | null };

/** The attack's advantage, the auto-crit and the cover bonus from the words on both sides. */
export function attackRuling(input: AttackInput): AttackRuling {
  const rules: AppliedRule[] = [];
  let plus = 0, minus = 0;
  const a = input.attacker.conditions, t = input.target.conditions;
  const adjacent = input.feet !== null && input.feet <= 5;
  if (has(a, BLINDED)) { minus++; rules.push({ rule: "attacker blinded", effect: "disadvantage" }); }
  if (has(a, RESTRAINED)) { minus++; rules.push({ rule: "attacker restrained", effect: "disadvantage" }); }
  if (has(a, POISONED)) { minus++; rules.push({ rule: "attacker poisoned", effect: "disadvantage" }); }
  if (has(a, FRIGHTENED)) { minus++; rules.push({ rule: "attacker frightened", effect: "disadvantage" }); }
  if (has(a, PRONE)) { minus++; rules.push({ rule: "attacker prone", effect: "disadvantage" }); }
  if (input.unseen) { minus++; rules.push({ rule: "target unseen", effect: "disadvantage" }); }
  if (has(t, PRONE)) {
    if (adjacent) { plus++; rules.push({ rule: "target prone, within 5 ft", effect: "advantage" }); }
    else { minus++; rules.push({ rule: "target prone, beyond 5 ft", effect: "disadvantage" }); }
  }
  if (has(t, BLINDED)) { plus++; rules.push({ rule: "target blinded", effect: "advantage" }); }
  if (has(t, RESTRAINED)) { plus++; rules.push({ rule: "target restrained", effect: "advantage" }); }
  if (has(t, STUNNED)) { plus++; rules.push({ rule: "target stunned", effect: "advantage" }); }
  if (has(t, PETRIFIED)) { plus++; rules.push({ rule: "target petrified", effect: "advantage" }); }
  if (has(t, PARALYSED) || has(t, UNCONSCIOUS)) { plus++; rules.push({ rule: has(t, PARALYSED) ? "target paralysed" : "target unconscious", effect: adjacent ? "advantage, auto-crit within 5 ft" : "advantage" }); }
  if (has(a, INVISIBLE)) { plus++; rules.push({ rule: "attacker unseen", effect: "advantage" }); }
  if (input.ranged && (adjacent || input.hostileAdjacent)) { minus++; rules.push({ rule: adjacent ? "ranged attack within 5 ft" : "ranged attack with a hostile within 5 ft", effect: "disadvantage" }); }
  const acBonus = input.cover === "half" ? 2 : input.cover === "three-quarters" ? 5 : 0;
  if (acBonus) rules.push({ rule: `${input.cover} cover`, effect: `+${acBonus} AC` });
  const impossible = input.cover === "full" ? "full cover: no line of attack" : has(a, INCAPACITATED) || has(a, PARALYSED) || has(a, UNCONSCIOUS) || has(a, STUNNED) ? "the attacker cannot act" : null;
  // Advantage and disadvantage cancel out whatever their number (5e).
  const advantage: Advantage = plus > 0 && minus > 0 ? "normal" : plus > 0 ? "advantage" : minus > 0 ? "disadvantage" : "normal";
  if (plus > 0 && minus > 0) rules.push({ rule: "advantage and disadvantage", effect: "cancel out" });
  return { advantage, autoCrit: adjacent && (has(t, PARALYSED) || has(t, UNCONSCIOUS)), acBonus, rules, impossible };
}

export type DamageInput = {
  /** The dice rolled once (the crit rolls them a second time). */
  dice: number[];
  modifier: number;
  crit: boolean;
  damageType: string | null;
  target: { resist: string[]; immune: string[]; vulnerable: string[] };
  /** The second set of dice for a crit, rolled by the caller (same count and sides). */
  critDice?: number[];
};
export type DamageRuling = { total: number; rules: AppliedRule[] };
const typeMatches = (list: readonly string[], type: string | null) => !!type && list.some((word) => word.toLowerCase() === type.toLowerCase() || new RegExp(`^${type.toLowerCase().slice(0, 4)}`, "iu").test(word));

/** The damage after the crit's doubled dice and the target's resistances; each step named. */
export function damageRuling(input: DamageInput): DamageRuling {
  const rules: AppliedRule[] = [];
  let total = input.dice.reduce((sum, die) => sum + die, 0) + input.modifier;
  if (input.crit) {
    const extra = (input.critDice ?? input.dice).reduce((sum, die) => sum + die, 0);
    total += extra;
    rules.push({ rule: "critical hit", effect: `dice doubled (+${extra})` });
  }
  total = Math.max(0, total);
  if (typeMatches(input.target.immune, input.damageType)) { rules.push({ rule: `immune to ${input.damageType}`, effect: "no damage" }); total = 0; }
  else if (typeMatches(input.target.vulnerable, input.damageType)) { rules.push({ rule: `vulnerable to ${input.damageType}`, effect: "damage doubled" }); total *= 2; }
  else if (typeMatches(input.target.resist, input.damageType)) { rules.push({ rule: `resists ${input.damageType}`, effect: "damage halved" }); total = Math.floor(total / 2); }
  return { total, rules };
}

/** Each applied rule as one short line for the card («укрытие на три четверти: +5 к КД»). */
export function rulesText(rules: readonly AppliedRule[], language: "ru" | "en"): string {
  if (!rules.length) return "";
  const ru: Record<string, string> = {
    "attacker blinded": "атакующий ослеплён", "attacker restrained": "атакующий скован", "attacker poisoned": "атакующий отравлен", "attacker frightened": "атакующий напуган",
    "attacker prone": "атакующий лежит", "target unseen": "цель не видна", "target prone, within 5 ft": "цель лежит, вплотную", "target prone, beyond 5 ft": "цель лежит, издали",
    "target blinded": "цель ослеплена", "target restrained": "цель скована", "target stunned": "цель оглушена", "target petrified": "цель окаменела", "target paralysed": "цель парализована",
    "target unconscious": "цель без сознания", "attacker unseen": "атакующего не видно", "ranged attack within 5 ft": "дальняя атака вплотную", "half cover": "укрытие наполовину",
    "three-quarters cover": "укрытие на три четверти", "advantage and disadvantage": "преимущество и помеха", "critical hit": "крит",
    advantage: "преимущество", disadvantage: "помеха", "cancel out": "взаимно гаснут", "no damage": "урона нет", "damage doubled": "урон удвоен", "damage halved": "урон вдвое меньше",
  };
  const word = (text: string) => (language === "ru" ? ru[text] ?? text.replace(/^resists /, "сопротивление: ").replace(/^immune to /, "иммунитет: ").replace(/^vulnerable to /, "уязвимость: ").replace(/^dice doubled/, "кости удвоены").replace(/^advantage, auto-crit within 5 ft$/, "преимущество, автокрит вплотную").replace(/ AC$/, " к КД") : text);
  return rules.map((row) => `${word(row.rule)}: ${word(row.effect)}`).join("; ");
}

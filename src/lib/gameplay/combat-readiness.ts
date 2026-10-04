export type CombatReadinessPerson = {
  id: string;
  name: string;
  revision: number;
  hp: number | null;
  maxHp: number | null;
  attack: number | null;
  defense: number | null;
  skill: number | null;
};

export type CombatReadinessPossession = {
  index: number;
  name: string;
  quantity: number;
  currentQuantity: number | null;
  description: string;
  itemId: string | null;
  itemRevision: number | null;
  equipped: boolean | null;
  damage: number | null;
};

export type CombatReadinessProposal = {
  fence: {
    campaignId: string;
    timeline: { timelineId: string; epoch: number };
    expectedRevision: number;
    expectedRuntimeRevision: number;
    expectedHeadId: string | null;
  };
  hero: CombatReadinessPerson;
  npcs: CombatReadinessPerson[];
  possessions: CombatReadinessPossession[];
  handItem: { id: string; name: string } | null;
  configuration: {
    profile: string;
    controlledEntityIds: string[];
    presentEntityIds: string[];
    itemRules: { itemId: string; tag: string; damage: number | null }[];
  } | null;
  profile: "console-basic-v1";
};

/** House profile values are mechanics defaults, never facts inferred from prose. */
export const missingPlayerDefaults = { hp: 10, attack: 0, defense: 10, skill: 0 } as const;
export const genericNpcBaseline = { hp: 8, attack: 0, defense: 10, skill: 0 } as const;

export function combatReadinessNeeded(proposal: CombatReadinessProposal) {
  const { hero, npcs, configuration } = proposal;
  const missing = (person: CombatReadinessPerson) =>
    person.hp === null || person.maxHp === null || person.attack === null ||
    person.defense === null || person.skill === null;
  return missing(hero) || npcs.some(missing) || !configuration ||
    !configuration.controlledEntityIds.includes(hero.id) ||
    !configuration.presentEntityIds.includes(hero.id) ||
    npcs.some((npc) => !configuration.presentEntityIds.includes(npc.id));
}

export function suggestedWeaponIndex(proposal: CombatReadinessProposal) {
  const approved = proposal.possessions.filter((item) =>
    (item.currentQuantity ?? item.quantity) > 0 &&
    /^(?:[a-z-]+\s+){0,3}(?:longsword|shortsword|longbow|battleaxe|crossbow|warhammer|sword|bow|dagger|axe|mace|spear|club|knife|staff|hammer|rapier|sabre|scimitar|flail|halberd|pike|sling|whip|sickle)(?:\s+with\s+\d{1,3}\s+arrows)?$/i.test(item.name),
  );
  return approved.length === 1 ? approved[0].index : null;
}

export type CombatReadinessConfirmation = {
  requestId: string;
  proposal: CombatReadinessProposal;
  player: { hp: number | null; attack: number | null; defense: number | null; skill: number | null };
  weaponIndex: number | null;
  weaponDamage: number | null;
};

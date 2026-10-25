// The battle screen's reading of the play snapshot (Part 2): the active
// encounter, its fighters (the combatant and the placement of every participant
// row), the hero, the zones derived from the coordinates, the floating numbers
// of the latest turn. Pure; the server decided everything here.
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { EncounterRecord, PlaySnapshot, PublicTurn } from "@/lib/gameplay/contracts";
import { parseCombatant, parseField, parsePlacement, type Field } from "@/lib/live2d/battle/contracts";
import { distanceFeet, sight } from "@/lib/live2d/battle/geometry";
import type { Fighter } from "@/lib/live2d/battle/battlefield";
import { derivedSheetOf } from "@/lib/live2d/battle/rules-5e";

export type BattleView = { encounter: EncounterRecord; field: Field; fighters: Fighter[]; hero: Fighter | null; active: Fighter | null; party: Fighter[]; foes: Fighter[] };

export const activeEncounter = (play: PlaySnapshot | null) => play?.encounters.find((row) => row.status === "active") ?? null;
/** The last fight that ended, when none is active (the end-of-fight card). */
export const endedEncounter = (play: PlaySnapshot | null) => (activeEncounter(play) ? null : [...(play?.encounters ?? [])].filter((row) => row.status === "ended").at(-1) ?? null);

export function fightersOf(play: PlaySnapshot, snapshot: CampaignSnapshot, encounterId: string): Fighter[] {
  const party = new Set([...(play.configuration?.controlledEntityIds ?? []), ...snapshot.entities.filter((row) => row.kind === "player" || row.kind === "companion").map((row) => row.id)]);
  return play.participants.filter((row) => row.encounter_id === encounterId).sort((a, b) => a.turn_order - b.turn_order).map((row) => ({
    participantId: row.id, entityId: row.entity_id, name: row.public_name, turnOrder: row.turn_order,
    combatant: parseCombatant(row.public_resources, { side: row.entity_id && party.has(row.entity_id) ? "party" : "foe" }),
    placement: parsePlacement(row.public_position),
  }));
}

export function battleView(play: PlaySnapshot, snapshot: CampaignSnapshot, encounter: EncounterRecord): BattleView {
  const field = parseField(encounter.public_field);
  const fighters = fightersOf(play, snapshot, encounter.id);
  const heroId = snapshot.entities.find((row) => row.kind === "player")?.id ?? null;
  const hero = fighters.find((row) => row.entityId === heroId) ?? fighters.find((row) => row.combatant.side === "party") ?? null;
  const active = fighters.find((row) => row.participantId === field.activeParticipantId) ?? fighters.find((row) => row.combatant.active) ?? null;
  return { encounter, field, fighters, hero, active, party: fighters.filter((row) => row.combatant.side === "party"), foes: fighters.filter((row) => row.combatant.side !== "party") };
}

export type ZoneRow = "adjacent" | "near" | "far";
/** Which row of the zones view a fighter sits in, seen from the hero: from the coordinates when there
 * are any, else from the old position word. Both views always agree. */
export function zoneRowOf(view: BattleView, fighter: Fighter): { row: ZoneRow; feet: number | null; cover: boolean; hidden: boolean } {
  const hero = view.hero;
  const cover = fighter.placement.position === "cover";
  if (!hero || hero.placement.x === null || fighter.placement.x === null || hero.placement.y === null || fighter.placement.y === null)
    return { row: fighter.placement.position === "far" ? "far" : "near", feet: null, cover, hidden: false };
  const feet = distanceFeet(hero.placement, fighter.placement, view.field.grid.feetPerCell) ?? 0;
  const look = sight(view.field, { x: hero.placement.x, y: hero.placement.y }, { x: fighter.placement.x, y: fighter.placement.y });
  return { row: feet <= 5 ? "adjacent" : feet <= 30 ? "near" : "far", feet, cover: cover || look.cover !== null, hidden: !look.visible };
}

/** HP of a fighter for the bars: the record's own for the party, the mirror for foes. */
export function hpOf(fighter: Fighter, snapshot: CampaignSnapshot): { current: number; max: number } | null {
  if (fighter.combatant.side === "party" && fighter.entityId) {
    const entity = snapshot.entities.find((row) => row.id === fighter.entityId);
    if (entity && entity.max_hp) return { current: entity.hp ?? entity.max_hp, max: entity.max_hp };
  }
  return fighter.combatant.hp;
}

/** Fix S3-accept Г3: a party fighter's AC as the server counts it for `combat attack` — in 5e the worn things, the
 * record's effects and this fight's (Shield); else the number the fight holds. */
export function armourOf(fighter: Fighter, snapshot: CampaignSnapshot): { value: number; text: string } | null {
  if (fighter.combatant.side !== "party" || !fighter.entityId) return null;
  const entity = snapshot.entities.find((row) => row.id === fighter.entityId);
  const derived = entity ? derivedSheetOf(snapshot, entity, { conditions: fighter.combatant.conditions, ac: fighter.combatant.ac }) : null;
  return derived?.ac ?? (fighter.combatant.ac !== null ? { value: fighter.combatant.ac, text: "" } : null);
}

export const initials = (name: string) => name.split(/\s+/).map((word) => word[0] ?? "").join("").slice(0, 2).toUpperCase();

/** The latest committed turn's combat lines, and the damage numbers in them («X: −N (a/b)»). */
export function latestCombatChanges(play: PlaySnapshot | null): { turn: PublicTurn; lines: { summary: string; action?: string }[] } | null {
  const turn = play?.turns.filter((row) => row.status === "committed" && row.mode === "game").at(-1);
  if (!turn) return null;
  return { turn, lines: (turn.changes ?? []).filter((row) => row.tool === "combat").map((row) => ({ summary: row.summary, action: row.action })) };
}
export type DamageFloat = { key: string; name: string; text: string; crit: boolean; miss: boolean };
export function damageFloats(turnId: string, lines: readonly { summary: string }[]): DamageFloat[] {
  return lines.flatMap((line, index): DamageFloat[] => {
    const hit = /^(.+?): ([−-]\d+|\+\d+) \(/u.exec(line.summary);
    if (hit) return [{ key: `${turnId}:${index}`, name: hit[1], text: hit[2].replace("-", "−"), crit: /крит|crit/iu.test(line.summary), miss: false }];
    const miss = /^(.+?)[:·] .*?(промах|miss)/iu.exec(line.summary);
    if (miss) return [{ key: `${turnId}:${index}`, name: miss[1], text: /miss/iu.test(line.summary) && !/промах/iu.test(line.summary) ? "Miss" : "Промах", crit: false, miss: true }];
    return [];
  });
}

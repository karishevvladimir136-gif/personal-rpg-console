// The battlefield block (Part 2): the short text the DM reads every combat turn
// instead of the picture it cannot see — distances, reach, cover, line of sight,
// light and hazards between the party and the foes, whose turn it is, what is
// spent. Pure: built from the encounter, its participants and the field. Also
// the end-of-fight card summed from the log.
import type { Combatant, Field, LogLine, Placement } from "./contracts.ts";
import { distanceFeet, groundAt, lightAt, sight } from "./geometry.ts";

export type Fighter = { participantId: string; entityId: string | null; name: string; combatant: Combatant; placement: Placement; turnOrder: number };
export type Language = "ru" | "en";

const feetWord = (l: Language, feet: number) => (l === "ru" ? `${feet} фт` : `${feet} ft`);
const zoneWord = (l: Language, feet: number) => feet <= 5 ? (l === "ru" ? "вплотную" : "adjacent") : feet <= 30 ? (l === "ru" ? "рядом" : "near") : (l === "ru" ? "далеко" : "far");
const coverWord = (l: Language, cover: "half" | "three-quarters" | "full") => l === "ru"
  ? { half: "укрытие наполовину", "three-quarters": "укрытие на три четверти", full: "полное укрытие" }[cover]
  : { half: "half cover", "three-quarters": "three-quarters cover", full: "full cover" }[cover];
const lightWord = (l: Language, light: "bright" | "dim" | "dark") => l === "ru" ? { bright: "на свету", dim: "в полумраке", dark: "вне света" }[light] : { bright: "in light", dim: "in dim light", dark: "out of the light" }[light];

/** One short block, the party first, each foe measured from each party member; ≤ ~600 tokens. */
export function battlefieldText(input: { round: number; field: Field; fighters: Fighter[]; language: Language; heroId: string | null }): string {
  const l = input.language;
  const { field } = input;
  const party = input.fighters.filter((row) => row.combatant.side === "party" && !row.combatant.withdrawn);
  const foes = input.fighters.filter((row) => row.combatant.side !== "party" && !row.combatant.withdrawn && !row.combatant.conditions.includes("dead") && !row.combatant.conditions.includes("fled"));
  const active = input.fighters.find((row) => row.participantId === field.activeParticipantId) ?? input.fighters.find((row) => row.combatant.active) ?? null;
  const lines: string[] = [];
  lines.push(l === "ru" ? `Раунд ${input.round}${active ? `, ходит ${active.name}` : ""}.` : `Round ${input.round}${active ? `, ${active.name} to act` : ""}.`);
  const mapped = input.fighters.some((row) => row.placement.x !== null);
  if (!mapped) {
    // Zones only (an encounter without a grid): what the old position words say.
    const zones = foes.map((foe) => `${foe.name}: ${foe.placement.position}`);
    if (zones.length) lines.push((l === "ru" ? "Позиции: " : "Positions: ") + zones.join("; ") + ".");
  } else {
    for (const member of party.slice(0, 6)) {
      const parts: string[] = [];
      for (const foe of foes.slice(0, 8)) {
        const feet = distanceFeet(member.placement, foe.placement, field.grid.feetPerCell);
        if (feet === null) continue;
        const look = member.placement.x !== null && member.placement.y !== null && foe.placement.x !== null && foe.placement.y !== null
          ? sight(field, { x: member.placement.x, y: member.placement.y }, { x: foe.placement.x, y: foe.placement.y }) : null;
        const bits = [`${feetWord(l, feet)}, ${zoneWord(l, feet)}`];
        if (look && !look.visible) bits.push(l === "ru" ? `не видно (${look.blockedBy?.label ?? "стена"})` : `no line of sight (${look.blockedBy?.label ?? "a wall"})`);
        else if (look?.cover) bits.push(`${coverWord(l, look.cover)}${look.coverBy ? ` (${look.coverBy.label})` : ""}`);
        if (foe.placement.z && member.placement.z !== foe.placement.z) bits.push(l === "ru" ? `выше на ${Math.abs(foe.placement.z - member.placement.z)} фт` : `${Math.abs(foe.placement.z - member.placement.z)} ft higher`);
        parts.push(`${foe.name} ${bits.join(", ")}`);
      }
      const mine = member.placement.x !== null && member.placement.y !== null ? groundAt(field, { x: member.placement.x, y: member.placement.y }) : null;
      const hazard = mine?.burning ? (l === "ru" ? " — стоит в огне" : " — standing in fire") : mine?.difficult ? (l === "ru" ? " — на трудной земле" : " — on difficult ground") : "";
      if (parts.length) lines.push(`${member.name}${hazard}: ${parts.join("; ")}.`);
    }
    const foeLines = foes.slice(0, 8).map((foe) => {
      const bits: string[] = [];
      if (foe.placement.x !== null && foe.placement.y !== null) {
        const light = lightAt(field, { x: foe.placement.x, y: foe.placement.y });
        if (light.light !== "bright" || field.ambient !== "bright") bits.push(lightWord(l, light.light));
        const ground = groundAt(field, { x: foe.placement.x, y: foe.placement.y });
        if (ground.burning) bits.push(l === "ru" ? "в огне" : "in fire");
      }
      if (foe.combatant.conditions.length) bits.push(foe.combatant.conditions.join(", "));
      if (foe.combatant.hp) bits.push(`HP ${foe.combatant.hp.current}/${foe.combatant.hp.max}`);
      return bits.length ? `${foe.name}: ${bits.join(", ")}` : null;
    }).filter((row): row is string => row !== null);
    if (foeLines.length) lines.push(foeLines.join("; ") + ".");
    const named = field.features.filter((row) => row.kind !== "elevation").slice(0, 8).map((row) => `${row.label} (${row.kind}${row.cover ? `, ${row.cover}` : ""}${row.radiusFeet ? `, ${row.radiusFeet} ft` : ""})`);
    if (named.length) lines.push((l === "ru" ? "На поле: " : "On the field: ") + named.join("; ") + ".");
  }
  for (const member of party.slice(0, 6)) {
    const economy = member.combatant.economy;
    const spent = [!economy.action ? (l === "ru" ? "действие потрачено" : "action spent") : "", !economy.bonus ? (l === "ru" ? "бонусное потрачено" : "bonus spent") : "", !economy.reaction ? (l === "ru" ? "реакция потрачена" : "reaction spent") : ""].filter(Boolean);
    const condition = member.combatant.conditions.length ? member.combatant.conditions.join(", ") : "";
    const saves = member.combatant.deathSaves ? (l === "ru" ? `спасброски от смерти ${member.combatant.deathSaves.success}✓/${member.combatant.deathSaves.fail}✗` : `death saves ${member.combatant.deathSaves.success}✓/${member.combatant.deathSaves.fail}✗`) : "";
    const bits = [condition, saves, ...spent, active?.participantId === member.participantId ? (l === "ru" ? `движение осталось ${economy.moveFeet} фт` : `${economy.moveFeet} ft of movement left`) : ""].filter(Boolean);
    if (bits.length) lines.push(`${member.name}: ${bits.join(", ")}.`);
  }
  if (field.pendingReaction) {
    const target = input.fighters.find((row) => row.participantId === field.pendingReaction!.targetId);
    lines.push(l === "ru" ? `Ожидается реакция ${target?.name ?? ""}: ${field.pendingReaction.trigger}.` : `A reaction is pending for ${target?.name ?? ""}: ${field.pendingReaction.trigger}.`);
  }
  if (field.opening) lines.push(l === "ru" ? "Задуманная засада: заявленное начало партии разыгрывается до инициативы." : "A planned ambush: the party's declared opening resolves before initiative.");
  void input.heroId;
  return clip(lines.join("\n"), 2400);
}
const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

/** The end-of-fight card: damage dealt and taken, close calls, from the field's log and the fighters. */
export type FightCard = { rounds: number; dealt: number; taken: number; hits: number; misses: number; crits: number; closeCalls: string[]; fallen: string[] };
export function fightCard(input: { round: number; log: LogLine[]; fighters: Fighter[] }): FightCard {
  const party = new Set(input.fighters.filter((row) => row.combatant.side === "party").map((row) => row.name));
  let dealt = 0, taken = 0, hits = 0, misses = 0, crits = 0;
  for (const line of input.log) {
    const damage = /(\d+)\s*(?:урон|damage)/iu.exec(line.result);
    const miss = /промах|miss/iu.test(line.result);
    const crit = /крит|crit/iu.test(line.result);
    if (damage) { if (party.has(line.actor)) dealt += Number(damage[1]); else taken += Number(damage[1]); hits += 1; }
    else if (miss) misses += 1;
    if (crit) crits += 1;
  }
  const closeCalls = input.fighters.filter((row) => row.combatant.side === "party" && (row.combatant.deathSaves || row.combatant.conditions.some((c) => /dying|unconscious|без сознания|при смерти/iu.test(c)))).map((row) => row.name);
  const fallen = input.fighters.filter((row) => row.combatant.side !== "party" && (row.combatant.conditions.includes("dead") || (row.combatant.hp !== null && row.combatant.hp.current <= 0))).map((row) => row.name);
  return { rounds: input.round, dealt, taken, hits, misses, crits, closeCalls, fallen };
}

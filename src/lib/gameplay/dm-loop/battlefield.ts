// Part 2 of 2D Live (docs/stages/LIVE2D_1.md): the battlefield block of the DM's
// context — for the active encounter, the short text the model reads instead of
// the picture it cannot see (distances, reach, cover, light, hazards, whose turn,
// what is spent). Built from the runtime's encounter rows by the pure helpers in
// src/lib/live2d/battle; wired into context.ts by one line. Empty when no
// encounter is active.
import type { RuntimeSource } from "../server-contracts.ts";
import { parseCombatant, parseField, parsePlacement } from "../../live2d/battle/contracts.ts";
import { battlefieldText, type Fighter } from "../../live2d/battle/battlefield.ts";

export function battlefieldFighters(source: Pick<RuntimeSource, "runtime" | "snapshot">, encounterId: string): Fighter[] {
  const party = new Set([...(source.runtime.configuration?.controlledEntityIds ?? []), ...source.snapshot.entities.filter((row) => row.kind === "player" || row.kind === "companion").map((row) => row.id)]);
  return source.runtime.participants.filter((row) => row.encounter_id === encounterId).sort((a, b) => a.turn_order - b.turn_order).map((row) => ({
    participantId: row.id, entityId: row.entity_id, name: row.public_name, turnOrder: row.turn_order,
    combatant: parseCombatant(row.public_resources, { side: row.entity_id && party.has(row.entity_id) ? "party" : "foe" }),
    placement: parsePlacement(row.public_position),
  }));
}

export function battlefield(source: Pick<RuntimeSource, "runtime" | "snapshot">): { text: string; dropped: string[]; used: number } {
  const active = source.runtime.encounters.find((row) => row.status === "active");
  if (!active) return { text: "", dropped: [], used: 0 };
  const field = parseField((active as { public_field?: unknown }).public_field);
  const fighters = battlefieldFighters(source, active.id);
  const hero = source.snapshot.entities.find((row) => row.kind === "player")?.id ?? null;
  const language = source.snapshot.campaign.language === "ru" ? "ru" : "en";
  const body = battlefieldText({ round: active.round, field, fighters, language, heroId: hero });
  const head = language === "ru"
    ? "Поле боя (измерено сервером по координатам; читай вместо картинки — расстояния, укрытия, свет; combat move принимает клетки, next_turn передаёт ход):"
    : "Battlefield (measured by the server from the coordinates; read it instead of the picture — distances, cover, light; combat move takes cells, next_turn passes the turn):";
  const text = `${head}\n${body}`;
  return { text, dropped: [], used: Math.ceil(text.length / 3.5) };
}

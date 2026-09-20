import type {
  PreparationDraft,
  PreparationEntityEdit,
  PreparationThreadEdit,
} from "../foundation-loop/contracts.ts";
import {
  ensure,
  ids,
  list,
  literal,
  object,
  text,
  unique,
  uuid,
} from "../foundation-loop/fields.ts";

// Browser-safe field validation only. Server selection/provenance validation is separate.
export const PREPARATION_LIMITS = {
  entities: 64,
  threads: 32,
  name: 160,
  description: 2000,
  aliases: 12,
  alias: 100,
  capabilities: 16,
  capability: 100,
  limitations: 16,
  limitation: 240,
  title: 200,
  goal: 2000,
} as const;

function optionalText(value: unknown, max: number): string {
  ensure(
    typeof value === "string" &&
      value.length <= max &&
      !value.includes("\u0000"),
  );
  return value.trim();
}

function boolean(value: unknown): boolean {
  ensure(typeof value === "boolean");
  return value;
}

function lines(value: unknown, count: number, length: number): string[] {
  return unique(
    list(value, (line) => optionalText(line, length), count).filter(Boolean),
    (line) => line.toLowerCase(),
  );
}

export function parsePreparationEntityEdit(
  value: unknown,
): PreparationEntityEdit {
  const row = object(value, [
    "packEntityId",
    "selected",
    "name",
    "aliases",
    "kind",
    "description",
    "capabilities",
    "limitations",
    "merchant",
    "merchantLabel",
  ]);
  const edit: PreparationEntityEdit = {
    packEntityId: uuid(row.packEntityId),
    selected: boolean(row.selected),
    name: text(row.name, PREPARATION_LIMITS.name).trim(),
    aliases: lines(
      row.aliases,
      PREPARATION_LIMITS.aliases,
      PREPARATION_LIMITS.alias,
    ),
    kind: literal(row.kind, ["npc", "group", "faction", "location"]),
    description: optionalText(row.description, PREPARATION_LIMITS.description),
    capabilities: lines(
      row.capabilities,
      PREPARATION_LIMITS.capabilities,
      PREPARATION_LIMITS.capability,
    ),
    limitations: lines(
      row.limitations,
      PREPARATION_LIMITS.limitations,
      PREPARATION_LIMITS.limitation,
    ),
    merchant: boolean(row.merchant),
    merchantLabel: optionalText(row.merchantLabel, PREPARATION_LIMITS.name),
  };
  ensure(
    !edit.merchant || (edit.kind === "npc" && edit.merchantLabel.length > 0),
  );
  return edit;
}

export function parsePreparationThreadEdit(
  value: unknown,
): PreparationThreadEdit {
  const row = object(value, [
    "id",
    "selected",
    "title",
    "goal",
    "entityIds",
    "policy",
  ]);
  const edit: PreparationThreadEdit = {
    id: uuid(row.id),
    selected: boolean(row.selected),
    title: text(row.title, PREPARATION_LIMITS.title).trim(),
    goal: text(row.goal, PREPARATION_LIMITS.goal).trim(),
    entityIds: ids(row.entityIds, 24),
    policy: literal(row.policy, ["background", "surface_before_complete"]),
  };
  ensure(edit.entityIds.length > 0);
  return edit;
}

/** Rejects extra keys, executable/arbitrary JSON fields, duplicates and unbounded text. */
export function parsePreparationDraft(value: unknown): PreparationDraft {
  const row = object(value, [
    "schemaVersion",
    "bindingId",
    "packVersionId",
    "entities",
    "threads",
  ]);
  return {
    schemaVersion: literal(row.schemaVersion, [1]),
    bindingId: uuid(row.bindingId),
    packVersionId: uuid(row.packVersionId),
    entities: unique(
      list(
        row.entities,
        parsePreparationEntityEdit,
        PREPARATION_LIMITS.entities,
      ),
      (entity) => entity.packEntityId,
    ),
    threads: unique(
      list(row.threads, parsePreparationThreadEdit, PREPARATION_LIMITS.threads),
      (thread) => thread.id,
    ),
  };
}

import type { Mutation } from "./contracts.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { isCampaignPremiseInput } from "../campaign-premise-input.ts";

export class ValidationError extends Error {
  readonly code = "validation";
  constructor() {
    super("Please check the entered values.");
  }
}
export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
function assert(ok: unknown): asserts ok {
  if (!ok) throw new ValidationError();
}
function object(value: unknown): Record<string, unknown> {
  assert(value !== null && typeof value === "object" && !Array.isArray(value));
  const record = value as Record<string, unknown>;
  assert(
    Object.getPrototypeOf(record) === Object.prototype ||
      Object.getPrototypeOf(record) === null,
  );
  return record;
}
function fields(value: unknown, required: string[], optional: string[] = []) {
  const record = object(value);
  assert(required.every((key) => Object.hasOwn(record, key)));
  assert(
    Object.keys(record).every((key) =>
      [...required, ...optional].includes(key),
    ),
  );
  return record;
}
function str(value: unknown, max = 200, empty = false) {
  assert(
    typeof value === "string" &&
      value.length <= max &&
      (empty || value.trim().length > 0) &&
      !value.includes("\u0000"),
  );
}
function enumeration(value: unknown, options: string[]) {
  assert(typeof value === "string" && options.includes(value));
}
function bool(value: unknown) {
  assert(typeof value === "boolean");
}
function number(value: unknown, min = 0, max = 1_000_000, integer = true) {
  assert(
    typeof value === "number" &&
      Number.isFinite(value) &&
      value >= min &&
      value <= max &&
      (!integer || Number.isInteger(value)),
  );
}
function uuid(value: unknown) {
  assert(isUuid(value));
}
function nullableId(value: unknown) {
  assert(value === null || isUuid(value));
}
function numberMap(value: unknown) {
  const record = object(value);
  assert(Object.keys(record).length <= 50);
  for (const [key, entry] of Object.entries(record)) {
    str(key, 80);
    number(entry, -1_000_000, 1_000_000, false);
  }
}
function strings(value: unknown, max = 50) {
  assert(Array.isArray(value) && value.length <= max);
  value.forEach((v) => str(v, 120));
}

export function validateSettings(value: unknown, campaignId: string) {
  const s = fields(value, [
    "campaign_id",
    "language",
    "rulesSystem",
    "difficulty",
    "storyStructure",
    "playerRole",
    "worldAutonomy",
    "checkFrequency",
    "dicePresentation",
    "interactiveDice",
    "showDc",
    "visualStyle",
    "frameRatio",
    "videoDuration",
    "narrativeStyle",
  ]);
  assert(s.campaign_id === campaignId);
  enumeration(s.language, ["en", "ru"]);
  const rules = fields(s.rulesSystem, [
    "id",
    "label",
    "enemyHpScaling",
    "enemyDamageScaling",
  ]);
  str(rules.id, 80);
  str(rules.label, 120);
  bool(rules.enemyHpScaling);
  bool(rules.enemyDamageScaling);
  const d = fields(s.difficulty, [
    "preset",
    "shortRestSupplyCost",
    "longRestSupplyCost",
    "enemyHpMultiplier",
    "enemyDamageMultiplier",
    "rerolls",
    "rerollsPerSession",
    "defeat",
    "recovery",
    "scarcity",
  ]);
  enumeration(d.preset, ["easy", "medium", "hard", "custom"]);
  number(d.shortRestSupplyCost, 0, 5);
  number(d.longRestSupplyCost, 0, 5);
  for (const key of ["enemyHpMultiplier", "enemyDamageMultiplier"]) {
    number(d[key], 0.25, 3, false);
    assert(Number.isInteger((d[key] as number) * 4));
  }
  enumeration(d.rerolls, ["disabled", "limited", "unlimited"]);
  number(d.rerollsPerSession, 1, 20);
  enumeration(d.defeat, ["setbacks", "injuries", "death"]);
  enumeration(d.recovery, ["forgiving", "standard", "restrictive"]);
  enumeration(d.scarcity, ["abundant", "standard", "scarce"]);
  enumeration(s.storyStructure, ["story-led", "balanced", "sandbox"]);
  enumeration(s.playerRole, ["one-of-many", "significant", "chosen"]);
  enumeration(s.worldAutonomy, ["low", "moderate", "high"]);
  enumeration(s.checkFrequency, ["narrative", "balanced", "full-rpg"]);
  enumeration(s.dicePresentation, ["hidden", "key-rolls", "all-player-rolls"]);
  bool(s.interactiveDice);
  bool(s.showDc);
  for (const key of [
    "visualStyle",
    "frameRatio",
    "videoDuration",
    "narrativeStyle",
  ])
    str(s[key], 200);
  return s;
}

const payloadKeys: Record<string, string[]> = {
  "feedback.send": ["body"],
  "campaign.create": ["title", "subtitle", "language"],
  "campaign.save": ["title", "subtitle"],
  "preferences.save": ["language", "largeText", "suggestions"],
  "document.save": ["title", "status", "body"],
  "document.restore": ["id", "versionId"],
  "entity.save": [
    "kind",
    "name",
    "details",
    "hp",
    "max_hp",
    "stats",
    "resources",
    "conditions",
    "equipment_slots",
  ],
  "storage.save": ["name", "kind", "entity_id"],
  "item.save": [
    "name",
    "category",
    "quantity",
    "description",
    "mechanics",
    "owner_entity_id",
    "storage_id",
    "equipped_entity_id",
    "equipped_slot",
  ],
  "session.save": ["title", "status", "recap"],
  "scene.save": ["session_id", "title", "body", "role"],
  "state.save": [
    "summary",
    "current_session_id",
    "current_scene_id",
    "current_location_id",
  ],
  "quest.save": ["title", "description", "status"],
  "location.save": ["name", "description", "status"],
  "asset.save": ["title", "kind", "storage_path", "description"],
};
const optionalId = [
  "document.save",
  "entity.save",
  "storage.save",
  "item.save",
  "session.save",
  "scene.save",
  "quest.save",
  "location.save",
  "asset.save",
];
export function validateMutation(value: unknown): Mutation {
  const input = object(value);
  assert(
    typeof input.operation === "string" &&
      (input.operation === "settings.save" ||
        Object.hasOwn(payloadKeys, input.operation)),
  );
  const op = input.operation;
  const scoped = !["campaign.create", "preferences.save"].includes(op);
  fields(
    input,
    [
      "requestId",
      "expectedRevision",
      "operation",
      "payload",
      ...(scoped ? ["campaignId"] : []),
    ],
    scoped ? ["timeline", "correctionScope"] : [],
  );
  if (input.timeline !== undefined) assert(isTimelineFence(input.timeline));
  if (input.correctionScope !== undefined)
    enumeration(input.correctionScope, ["campaign", "timeline"]);
  uuid(input.requestId);
  number(input.expectedRevision, 0, 2_147_483_646);
  if (scoped) uuid(input.campaignId);
  if (op === "settings.save") {
    validateSettings(input.payload, input.campaignId as string);
    return input as Mutation;
  }
  const p = fields(
    input.payload,
    payloadKeys[op],
    optionalId.includes(op)
      ? ["id"]
      : op === "campaign.create"
        ? ["premise"]
        : [],
  );
  if (p.id !== undefined) uuid(p.id);
  if (input.expectedRevision !== 0 && optionalId.includes(op)) uuid(p.id);
  for (const key of ["title", "name"]) if (key in p) str(p[key]);
  for (const key of [
    "subtitle",
    "description",
    "mechanics",
    "details",
    "recap",
    "summary",
  ])
    if (key in p) str(p[key], key === "subtitle" ? 500 : 20_000, true);
  if ("body" in p) str(p.body, 200_000, true);
  if ("language" in p) enumeration(p.language, ["en", "ru"]);
  switch (op) {
    case "feedback.send":
      assert(input.expectedRevision === 0);
      str(p.body, 20_000);
      break;
    case "campaign.create":
      assert(input.expectedRevision === 0);
      if (Object.hasOwn(p, "premise")) {
        if (!isCampaignPremiseInput(p.premise)) throw new ValidationError();
      }
      break;
    case "preferences.save":
      bool(p.largeText);
      bool(p.suggestions);
      break;
    case "document.save":
      enumeration(p.status, ["canon", "reference", "archived"]);
      break;
    case "document.restore":
      uuid(p.versionId);
      assert(input.expectedRevision !== 0);
      break;
    case "entity.save": {
      enumeration(p.kind, ["player", "companion", "npc", "transport", "mount"]);
      assert((p.hp === null) === (p.max_hp === null));
      if (p.hp !== null) {
        number(p.hp);
        number(p.max_hp);
        assert((p.hp as number) <= (p.max_hp as number));
      }
      numberMap(p.stats);
      numberMap(p.resources);
      strings(p.conditions);
      assert(
        Array.isArray(p.equipment_slots) && p.equipment_slots.length <= 30,
      );
      const ids = new Set<string>();
      for (const slot of p.equipment_slots) {
        const s = fields(slot, ["id", "label", "accepts"]);
        str(s.id, 80);
        str(s.label, 120);
        strings(s.accepts);
        assert(!ids.has(s.id as string));
        ids.add(s.id as string);
      }
      break;
    }
    case "storage.save":
      enumeration(p.kind, ["player", "companion", "camp", "transport"]);
      nullableId(p.entity_id);
      assert((p.kind === "camp") === (p.entity_id === null));
      break;
    case "item.save":
      str(p.category, 120);
      number(p.quantity, 0, 1_000_000);
      uuid(p.storage_id);
      nullableId(p.owner_entity_id);
      nullableId(p.equipped_entity_id);
      assert((p.equipped_entity_id === null) === (p.equipped_slot === null));
      if (p.equipped_slot !== null) {
        str(p.equipped_slot, 80);
        assert((p.quantity as number) > 0);
      }
      break;
    case "session.save":
      enumeration(p.status, ["open", "closed"]);
      break;
    case "scene.save":
      uuid(p.session_id);
      enumeration(p.role, ["narration", "player", "note"]);
      break;
    case "state.save":
      nullableId(p.current_session_id);
      nullableId(p.current_scene_id);
      nullableId(p.current_location_id);
      if (p.current_scene_id !== null) uuid(p.current_session_id);
      break;
    case "quest.save":
      enumeration(p.status, ["open", "complete", "archived"]);
      break;
    case "location.save":
      enumeration(p.status, ["known", "visited"]);
      break;
    case "asset.save":
      enumeration(p.kind, ["image", "video", "document"]);
      if (p.storage_path !== null) {
        str(p.storage_path, 500);
        assert(
          (p.storage_path as string).startsWith(`${input.campaignId}/`) &&
            !(p.storage_path as string).includes("..") &&
            !(p.storage_path as string).includes("\\"),
        );
      }
      break;
  }
  return input as Mutation;
}

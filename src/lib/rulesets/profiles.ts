import type { RulesetProfileRef } from "../production/contracts.ts";
import { basicProfile } from "../gameplay/mechanics/profile.ts";
import {
  ensure,
  ids,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  unique,
  uuid,
} from "../world-library/validation.ts";

export type RulesetProfile = {
  schemaVersion: 1;
  ref: RulesetProfileRef;
  label: string;
  implementation:
    "console-basic-v1" | "world-logic-v1" | "declarative-v1" | "unsupported";
  system: { name: string; edition: string; coverage: string[] } | null;
  fields: {
    key: string;
    label: string;
    kind: "number" | "text" | "choice" | "boolean";
    min: number | null;
    max: number | null;
    options: string[];
    visibility: "public" | "private";
  }[];
  actions: {
    key: string;
    label: string;
    resolver: "narrative" | "unsupported";
    requiredCapabilities: string[];
  }[];
};
export const LEGACY_RULESET_REF: RulesetProfileRef = Object.freeze({
  id: "console-basic-v1",
  version: 1,
  mode: "full_ruleset",
  validatorVersion: "console-basic-v1",
});
export const WORLD_LOGIC_REF: RulesetProfileRef = Object.freeze({
  id: "world-logic-v1",
  version: 1,
  mode: "world_logic",
  validatorVersion: "world-logic-v1",
});
const key = (value: unknown) => {
  const result = text(value, 64);
  ensure(
    /^[a-z][a-z0-9_-]*$/.test(result) &&
      !["constructor", "prototype", "__proto__"].includes(result),
  );
  return result;
};
export function parseRulesetRef(value: unknown): RulesetProfileRef {
  const v = object(value, ["id", "version", "mode", "validatorVersion"]);
  const id = text(v.id, 80);
  if (![LEGACY_RULESET_REF.id, WORLD_LOGIC_REF.id].includes(id)) uuid(id);
  const result: RulesetProfileRef = {
    id,
    version: integer(v.version, 1),
    mode: literal(v.mode, [
      "full_ruleset",
      "world_logic",
      "custom_ruleset",
    ] as const),
    validatorVersion: text(v.validatorVersion, 80),
  };
  const builtin =
    id === LEGACY_RULESET_REF.id
      ? LEGACY_RULESET_REF
      : id === WORLD_LOGIC_REF.id
        ? WORLD_LOGIC_REF
        : null;
  if (builtin)
    ensure(
      result.version === builtin.version &&
        result.mode === builtin.mode &&
        result.validatorVersion === builtin.validatorVersion,
    );
  return result;
}
export function parseRulesetProfile(value: unknown): RulesetProfile {
  const v = object(value, [
    "schemaVersion",
    "ref",
    "label",
    "implementation",
    "system",
    "fields",
    "actions",
  ]);
  const ref = parseRulesetRef(v.ref),
    implementation = literal(v.implementation, [
      "console-basic-v1",
      "world-logic-v1",
      "declarative-v1",
      "unsupported",
    ] as const);
  const system = nullable(v.system, (entry) => {
    const s = object(entry, ["name", "edition", "coverage"]);
    return {
      name: text(s.name, 120),
      edition: text(s.edition, 80),
      coverage: unique(list(s.coverage, (c) => text(c, 120), 50)),
    };
  });
  ensure(ref.mode !== "full_ruleset" || system !== null);
  const fields = unique(
    list(
      v.fields,
      (entry) => {
        const f = object(entry, [
          "key",
          "label",
          "kind",
          "min",
          "max",
          "options",
          "visibility",
        ]);
        const kind = literal(f.kind, [
            "number",
            "text",
            "choice",
            "boolean",
          ] as const),
          min = nullable(f.min, (n) => integer(n, -1000000, 1000000)),
          max = nullable(f.max, (n) => integer(n, -1000000, 1000000)),
          options = unique(list(f.options, (o) => text(o, 120), 30));
        if (kind === "number")
          ensure(
            min !== null && max !== null && min <= max && options.length === 0,
          );
        else
          ensure(
            min === null &&
              max === null &&
              (kind === "choice" ? options.length > 0 : options.length === 0),
          );
        return {
          key: key(f.key),
          label: text(f.label, 120),
          kind,
          min,
          max,
          options,
          visibility: literal(f.visibility, ["public", "private"] as const),
        };
      },
      60,
    ),
    (f) => f.key,
  );
  const actions = unique(
    list(
      v.actions,
      (entry) => {
        const a = object(entry, [
          "key",
          "label",
          "resolver",
          "requiredCapabilities",
        ]);
        return {
          key: key(a.key),
          label: text(a.label, 120),
          resolver: literal(a.resolver, ["narrative", "unsupported"] as const),
          requiredCapabilities: unique(list(a.requiredCapabilities, key, 30)),
        };
      },
      60,
    ),
    (a) => a.key,
  );
  const result: RulesetProfile = {
    schemaVersion: literal(v.schemaVersion, [1]),
    ref,
    label: text(v.label, 120),
    implementation,
    system,
    fields,
    actions,
  };
  if (ref.id === LEGACY_RULESET_REF.id)
    ensure(
      JSON.stringify(result) === JSON.stringify(legacyProfile()),
      "conflict",
    );
  else if (ref.id === WORLD_LOGIC_REF.id)
    ensure(
      JSON.stringify(result) === JSON.stringify(worldLogicProfile()),
      "conflict",
    );
  else
    ensure(
      implementation === "unsupported" ||
        (implementation === "declarative-v1" &&
          ref.mode === "custom_ruleset" &&
          ref.validatorVersion === "declarative-v1"),
    );
  return result;
}
export function legacyProfile(): RulesetProfile {
  return {
    schemaVersion: 1,
    ref: { ...LEGACY_RULESET_REF },
    label: "Console Basic — existing house rules",
    implementation: "console-basic-v1",
    system: {
      name: "Personal RPG Console house profile",
      edition: "console-basic-v1",
      coverage: ["Existing console-basic-v1 interpreter; not official D&D 5e"],
    },
    fields: [],
    actions: [],
  };
}
export function worldLogicProfile(): RulesetProfile {
  return {
    schemaVersion: 1,
    ref: { ...WORLD_LOGIC_REF },
    label: "World Logic",
    implementation: "world-logic-v1",
    system: null,
    fields: [],
    actions: [
      {
        key: "narrative",
        label: "Narrative action",
        resolver: "narrative",
        requiredCapabilities: [],
      },
    ],
  };
}
export function resolveRuleset(
  ref: RulesetProfileRef,
  approvedProfiles: readonly RulesetProfile[] = [],
): RulesetProfile {
  const pin = parseRulesetRef(ref);
  if (pin.id === LEGACY_RULESET_REF.id) return legacyProfile();
  if (pin.id === WORLD_LOGIC_REF.id) return worldLogicProfile();
  const matches = approvedProfiles
    .map(parseRulesetProfile)
    .filter(
      (p) =>
        p.ref.id === pin.id &&
        p.ref.version === pin.version &&
        p.ref.mode === pin.mode &&
        p.ref.validatorVersion === pin.validatorVersion,
    );
  ensure(matches.length === 1, "conflict");
  return matches[0];
}
// Exact accepted constants; no reinterpretation of historical saves, checks or arithmetic.
export function legacyInterpreter(ref: RulesetProfileRef): typeof basicProfile {
  ensure(parseRulesetRef(ref).id === LEGACY_RULESET_REF.id, "conflict");
  return basicProfile;
}
export function validateMechanics(
  profile: RulesetProfile,
  value: unknown,
): Record<string, string | number | boolean> {
  const p = parseRulesetProfile(profile);
  ensure(value !== null && typeof value === "object" && !Array.isArray(value));
  const v = value as Record<string, unknown>,
    result: Record<string, string | number | boolean> = {};
  ensure(Object.keys(v).length <= p.fields.length);
  for (const [name, raw] of Object.entries(v)) {
    const f = p.fields.find((field) => field.key === name);
    ensure(f);
    if (f.kind === "number") result[name] = integer(raw, f.min!, f.max!);
    else if (f.kind === "boolean") {
      ensure(typeof raw === "boolean");
      result[name] = raw;
    } else if (f.kind === "choice") result[name] = literal(raw, f.options);
    else result[name] = text(raw, 2000);
  }
  return result;
}
export type NeutralIdentity = {
  campaignId: string;
  entityId: string;
  name: string;
  control: { timelineId: string; controller: "player" | "autonomous" };
  capabilities: string[];
  mechanics: {
    profile: RulesetProfileRef;
    values: Record<string, string | number | boolean>;
  } | null;
};
export function validateNeutralIdentity(
  value: unknown,
  profile?: RulesetProfile,
): NeutralIdentity {
  const v = object(value, [
      "campaignId",
      "entityId",
      "name",
      "control",
      "capabilities",
      "mechanics",
    ]),
    c = object(v.control, ["timelineId", "controller"]);
  const mechanics = nullable(v.mechanics, (entry) => {
    const m = object(entry, ["profile", "values"]);
    ensure(profile);
    const ref = parseRulesetRef(m.profile);
    ensure(
      JSON.stringify(ref) === JSON.stringify(parseRulesetRef(profile.ref)),
      "conflict",
    );
    return { profile: ref, values: validateMechanics(profile, m.values) };
  });
  return {
    campaignId: uuid(v.campaignId),
    entityId: uuid(v.entityId),
    name: text(v.name, 240),
    control: {
      timelineId: uuid(c.timelineId),
      controller: literal(c.controller, ["player", "autonomous"] as const),
    },
    capabilities: unique(list(v.capabilities, key, 100)),
    mechanics,
  };
}
export function actionSupport(
  profile: RulesetProfile,
  action: string,
  capabilities: string[],
): "supported_narrative" | "legacy_interpreter" | "paused_unsupported" {
  const p = parseRulesetProfile(profile);
  if (p.implementation === "console-basic-v1") return "legacy_interpreter";
  const a = p.actions.find((entry) => entry.key === action);
  return p.implementation !== "unsupported" &&
    a?.resolver === "narrative" &&
    a.requiredCapabilities.every((cap) => capabilities.includes(cap))
    ? "supported_narrative"
    : "paused_unsupported";
}
// An allowlist projection hides private field names as well as values and counts.
export function publicMechanics(
  profile: RulesetProfile,
  value: unknown,
): { key: string; label: string; value: string | number | boolean }[] {
  const p = parseRulesetProfile(profile),
    values = validateMechanics(p, value);
  return p.fields
    .filter((f) => f.visibility === "public" && Object.hasOwn(values, f.key))
    .map((f) => ({ key: f.key, label: f.label, value: values[f.key] }));
}
export function validateControlledReferences(
  identity: NeutralIdentity,
  campaignId: string,
  timelineId: string,
  controlledEntityIds: unknown,
): void {
  const validated = validateNeutralIdentity({ ...identity, mechanics: null });
  ensure(
    validated.campaignId === uuid(campaignId) &&
      validated.control.timelineId === uuid(timelineId),
    "scope",
  );
  const controlled = ids(controlledEntityIds);
  ensure(
    (validated.control.controller === "player") ===
      controlled.includes(validated.entityId),
    "conflict",
  );
}

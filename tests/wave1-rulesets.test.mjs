import test from "node:test";
import assert from "node:assert/strict";
import {
  LEGACY_RULESET_REF,
  WORLD_LOGIC_REF,
  actionSupport,
  legacyInterpreter,
  legacyProfile,
  parseRulesetProfile,
  parseRulesetRef,
  publicMechanics,
  resolveRuleset,
  validateMechanics,
  validateNeutralIdentity,
  worldLogicProfile,
} from "../src/lib/rulesets/profiles.ts";
import { basicProfile } from "../src/lib/gameplay/mechanics/profile.ts";
import { id } from "./wave1-library-fixtures.mjs";
const custom = () => ({
  schemaVersion: 1,
  ref: {
    id: id(),
    version: 1,
    mode: "custom_ruleset",
    validatorVersion: "declarative-v1",
  },
  label: "Harbor intrigue",
  implementation: "declarative-v1",
  system: null,
  fields: [
    {
      key: "reputation",
      label: "Reputation",
      kind: "number",
      min: -10,
      max: 10,
      options: [],
      visibility: "public",
    },
    {
      key: "secret_debt",
      label: "Private debt",
      kind: "number",
      min: 0,
      max: 20,
      options: [],
      visibility: "private",
    },
  ],
  actions: [
    {
      key: "negotiate",
      label: "Negotiate",
      resolver: "narrative",
      requiredCapabilities: ["speech"],
    },
  ],
});

test("console-basic-v1 compatibility returns the same accepted interpreter and immutable version pin", () => {
  assert.equal(legacyInterpreter(LEGACY_RULESET_REF), basicProfile);
  assert.deepEqual(parseRulesetProfile(legacyProfile()), legacyProfile());
  assert.deepEqual(resolveRuleset(LEGACY_RULESET_REF), legacyProfile());
  assert.equal(
    actionSupport(legacyProfile(), "rest.complete", []),
    "legacy_interpreter",
  );
  assert.throws(() => parseRulesetRef({ ...LEGACY_RULESET_REF, version: 2 }));
  assert.throws(() =>
    parseRulesetRef({ ...LEGACY_RULESET_REF, mode: "world_logic" }),
  );
  assert.throws(
    () =>
      parseRulesetProfile({
        ...legacyProfile(),
        label: "Official full D&D 5e",
      }),
    /conflict/,
  );
});

test("World Logic has no compulsory HP, dice, class or mechanics; identity/control remain independent", () => {
  const profile = resolveRuleset(WORLD_LOGIC_REF);
  assert.deepEqual(profile.fields, []);
  assert.deepEqual(validateMechanics(profile, {}), {});
  const identity = {
    campaignId: id(),
    entityId: id(),
    name: "Mara",
    control: { timelineId: id(), controller: "autonomous" },
    capabilities: ["speech"],
    mechanics: null,
  };
  const first = validateNeutralIdentity(identity),
    controlled = validateNeutralIdentity({
      ...identity,
      control: { ...identity.control, controller: "player" },
    });
  assert.equal(first.entityId, controlled.entityId);
  assert.equal(controlled.mechanics, null);
  assert.equal(
    actionSupport(worldLogicProfile(), "narrative", []),
    "supported_narrative",
  );
  assert.equal(
    actionSupport(worldLogicProfile(), "cast_world_spell", []),
    "paused_unsupported",
  );
  assert.throws(() => validateMechanics(profile, { hp: 10 }));
});

test("custom rules are bounded declarative fields, capability-gated actions, no executable policy", () => {
  const profile = custom();
  assert.deepEqual(resolveRuleset(profile.ref, [profile]), profile);
  assert.deepEqual(validateMechanics(profile, { reputation: 3 }), {
    reputation: 3,
  });
  assert.equal(
    actionSupport(profile, "negotiate", ["speech"]),
    "supported_narrative",
  );
  assert.equal(actionSupport(profile, "negotiate", []), "paused_unsupported");
  assert.throws(() => validateMechanics(profile, { reputation: 11 }));
  assert.throws(() => validateMechanics(profile, { hp: 1 }));
  assert.throws(() =>
    parseRulesetProfile({ ...profile, execute: "process.env.OPENAI_API_KEY" }),
  );
  assert.throws(() =>
    parseRulesetProfile({
      ...profile,
      fields: [{ ...profile.fields[0], formula: "eval(input)" }],
    }),
  );
  assert.throws(
    () => resolveRuleset({ ...profile.ref, version: 2 }, [profile]),
    /conflict/,
  );
  assert.throws(
    () => resolveRuleset(profile.ref, [profile, profile]),
    /conflict/,
  );
});

test("private mechanics fields are removed before names, values and counts reach public projection", () => {
  const profile = custom();
  assert.deepEqual(
    publicMechanics(profile, { reputation: 2, secret_debt: 19 }),
    [{ key: "reputation", label: "Reputation", value: 2 }],
  );
  assert.equal(
    JSON.stringify(publicMechanics(profile, { secret_debt: 19 })),
    "[]",
  );
});

test("Full Ruleset declares edition/coverage and unsupported execution pauses without fallback", () => {
  const profile = {
    ...custom(),
    ref: {
      id: id(),
      version: 1,
      mode: "full_ruleset",
      validatorVersion: "declared-future-v1",
    },
    implementation: "unsupported",
    system: {
      name: "Future explicit rules",
      edition: "Unimplemented",
      coverage: [],
    },
    fields: [],
    actions: [],
  };
  assert.equal(
    resolveRuleset(profile.ref, [profile]).implementation,
    "unsupported",
  );
  assert.equal(
    actionSupport(profile, "narrative", ["speech"]),
    "paused_unsupported",
  );
  assert.throws(() => parseRulesetProfile({ ...profile, system: null }));
  assert.throws(() =>
    parseRulesetProfile({ ...profile, implementation: "world-logic-v1" }),
  );
});

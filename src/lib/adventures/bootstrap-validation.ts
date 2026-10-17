import type {
  BootstrapCommand,
  BootstrapQuestion,
  CreationInput,
  CreationProposal,
  CreationReview,
  CreationMechanics,
  CreationEquipmentProfile,
  CharacterSheetV1,
  OpeningActor,
  OpeningProposal,
  OpeningReview,
} from "./bootstrap-contracts.ts";
import { parseAdventureCommand } from "./validation.ts";
import {
  ensure,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  unique,
  uuid,
} from "../foundation-loop/fields.ts";

export const bootstrapLimits = {
  facts: 24,
  possessions: 12,
  possessionQuantity: 1000,
  resources: 8,
  actors: 4,
  questions: 8,
  sheetSkills: 12,
  sheetAbilities: 12,
  sheetLimitations: 12,
} as const;
const blankText = (v: unknown, max = 2000) => {
  ensure(typeof v === "string" && v.length <= max && !v.includes("\0"));
  return v;
};
export function descriptiveCapability(value: unknown): string {
  const result = text(value, 200).trim();
  // Text establishes a descriptive capability, never an internal effect token.
  ensure(!/^(?:world[.:]|loot[.:]|trade[.:]|can:)/i.test(result));
  ensure(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{20,}/i.test(result));
  return result;
}
const lines = (v: unknown) =>
  unique(list(v, descriptiveCapability, bootstrapLimits.facts));
const resourceKey = (v: unknown) => {
  const result = text(v, 48);
  ensure(
    /^[a-z][a-z0-9_-]*$/.test(result) &&
      !["constructor", "prototype", "__proto__"].includes(result),
  );
  return result;
};
const questions = (v: unknown): BootstrapQuestion[] =>
  list(
    v,
    (raw) => {
      const q = object(raw, ["question", "consequential"]);
      ensure(typeof q.consequential === "boolean");
      return {
        question: text(q.question, 500),
        consequential: q.consequential,
      };
    },
    bootstrapLimits.questions,
  );
/** Sheet entries are public descriptions. They do not grant a spell, check
 * modifier, class feature or any other gameplay permission. */
export function parseCharacterSheet(value: unknown): CharacterSheetV1 {
  const v = object(value, [
    "schemaVersion", "mode", "role", "background", "level", "tier",
    "attributes", "skills", "abilities", "limitations", "spells",
  ]);
  ensure(v.schemaVersion === 1);
  const mode = literal(v.mode, ["structured_rpg", "narrative"]);
  const attributes = v.attributes === null ? null : (() => {
    const a = object(v.attributes, [
      "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma",
    ]);
    return {
      strength: integer(a.strength, 1, 20),
      dexterity: integer(a.dexterity, 1, 20),
      constitution: integer(a.constitution, 1, 20),
      intelligence: integer(a.intelligence, 1, 20),
      wisdom: integer(a.wisdom, 1, 20),
      charisma: integer(a.charisma, 1, 20),
    };
  })();
  ensure((mode === "structured_rpg") === (attributes !== null));
  // Universal World Logic bootstrap has no progression or spell ruleset.
  ensure(v.level === null && v.tier === null);
  const spells = list(v.spells, descriptiveCapability, 0);
  return {
    schemaVersion: 1,
    mode,
    role: nullable(v.role, (s) => text(s, 120)),
    background: blankText(v.background, 2000),
    level: null,
    tier: null,
    attributes,
    skills: unique(list(v.skills, descriptiveCapability, bootstrapLimits.sheetSkills)),
    abilities: unique(list(v.abilities, descriptiveCapability, bootstrapLimits.sheetAbilities)),
    limitations: unique(list(v.limitations, descriptiveCapability, bootstrapLimits.sheetLimitations)),
    spells,
  };
}
function parseCreationMechanics(value: unknown): CreationMechanics {
  const m = object(value, ["hp", "attack", "defense", "skill", "weaponName", "weaponDamage"]);
  const weaponName = nullable(m.weaponName, (name) => text(name, 200));
  const weaponDamage = nullable(m.weaponDamage, (damage) => integer(damage, 1, 20));
  ensure((weaponName === null) === (weaponDamage === null));
  return {
    hp: integer(m.hp, 1, 10000),
    attack: integer(m.attack, -20, 20),
    defense: integer(m.defense, 1, 40),
    skill: integer(m.skill, -20, 20),
    weaponName,
    weaponDamage,
  };
}
const parseEquipmentProfile = (value: unknown): CreationEquipmentProfile =>
  literal(value, ["standard_humanoid", "none"]);
export function parseCreationInput(value: unknown): CreationInput {
  const v = object(value, [
    "requestId",
    "worldId",
    "worldVersion",
    "title",
    "language",
    "name",
    "description",
  ]);
  return {
    requestId: uuid(v.requestId),
    worldId: uuid(v.worldId),
    worldVersion: integer(v.worldVersion, 1),
    title: text(v.title, 200),
    language: literal(v.language, ["en", "ru"]),
    name: text(v.name, 200),
    description: text(v.description, 8000),
  };
}
export function parseCreationProposal(
  value: unknown,
  input?: CreationInput,
): CreationProposal {
  const schemaVersion = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>).schemaVersion : null;
  ensure(schemaVersion === 1 || schemaVersion === 2);
  const v = object(value, [
    "schemaVersion",
    "capabilities",
    "limitations",
    "possessions",
    "resources",
    "questions",
    ...(schemaVersion === 2 ? ["sheet", "mechanics",
      ...(Object.hasOwn(value as object, "equipmentProfile") ? ["equipmentProfile"] : [])] : []),
  ]);
  const fact = (raw: unknown) => {
    const f = object(raw, ["text", "quote"]);
    return { text: descriptiveCapability(f.text), quote: text(f.quote, 1000) };
  };
  const base = {
    capabilities: unique(
      list(v.capabilities, fact, bootstrapLimits.facts),
      (f) => f.text,
    ),
    limitations: unique(
      list(v.limitations, fact, bootstrapLimits.facts),
      (f) => f.text,
    ),
    possessions: unique(
      list(
        v.possessions,
        (raw) => {
          const p = object(raw, ["name", "description", "quantity", "quote"]);
          return {
            name: text(p.name, 200),
            description: blankText(p.description),
            quantity: nullable(p.quantity, (n) =>
              integer(n, 1, bootstrapLimits.possessionQuantity),
            ),
            quote: text(p.quote, 1000),
          };
        },
        bootstrapLimits.possessions,
      ),
      (p) => p.name,
    ),
    resources: unique(
      list(
        v.resources,
        (raw) => {
          const r = object(raw, ["key", "label", "amount", "quote"]);
          return {
            key: resourceKey(r.key),
            label: text(r.label, 100),
            amount: nullable(r.amount, (n) => integer(n, 0, 1000000)),
            quote: text(r.quote, 1000),
          };
        },
        bootstrapLimits.resources,
      ),
      (r) => r.key,
    ),
    questions: questions(v.questions),
  };
  const proposal: CreationProposal = schemaVersion === 2
    ? { ...base, schemaVersion: 2, sheet: parseCharacterSheet(v.sheet), mechanics: v.mechanics === null ? null : parseCreationMechanics(v.mechanics),
      ...(Object.hasOwn(v, "equipmentProfile") ? { equipmentProfile: parseEquipmentProfile(v.equipmentProfile) } : {}) }
    : { ...base, schemaVersion: 1 };
  if (proposal.schemaVersion === 2) {
    // A new sheet may suggest ordinary presentation labels from the public
    // premise. They do not become World Actor capabilities or check bonuses.
    ensure((proposal.sheet.mode === "structured_rpg") === (proposal.mechanics !== null));
    // Polish group 8: a narrative hero gets the humanoid slots too (universal doll for any ruleset).
    if (proposal.equipmentProfile === "none")
      ensure(proposal.mechanics?.weaponName === null || proposal.mechanics === null);
    if (proposal.mechanics?.weaponName !== null && proposal.mechanics !== null)
      ensure(proposal.possessions.some((item) => item.name === proposal.mechanics!.weaponName && item.quantity !== null));
  }
  if (input) {
    const grounded = (quote: string, label: string) =>
      ensure(
        input.description.includes(quote) &&
          quote.toLocaleLowerCase().includes(label.toLocaleLowerCase()),
      );
    for (const f of [...proposal.capabilities, ...proposal.limitations])
      grounded(f.quote, f.text);
    for (const p of proposal.possessions) {
      grounded(p.quote, p.name);
      ensure(p.description === "" || input.description.includes(p.description));
      if (p.quantity !== null && p.quantity > 1)
        ensure(p.quote.includes(String(p.quantity)));
    }
    for (const r of proposal.resources) {
      grounded(r.quote, r.label);
      if (r.amount !== null) ensure(r.quote.includes(String(r.amount)));
    }
  }
  return proposal;
}
function answers(value: unknown) {
  return list(
    value,
    (v) => nullable(v, (s) => text(s, 2000)),
    bootstrapLimits.questions,
  );
}
function resolved(q: BootstrapQuestion[], a: (string | null)[]) {
  ensure(
    a.length === q.length &&
      q.every((question, i) => !question.consequential || a[i] !== null),
  );
}
export function initialCreationReview(
  input: CreationInput,
  p: CreationProposal,
): CreationReview {
  return {
    name: input.name,
    description: input.description,
    capabilities: p.capabilities.map((f) => f.text),
    limitations: p.limitations.map((f) => f.text),
    possessions: p.possessions.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
    })),
    resources: p.resources.map((resource) => ({
      key: resource.key,
      label: resource.label,
      amount: resource.amount,
    })),
    answers: p.questions.map(() => null),
    ...(p.schemaVersion === 2 ? {
      sheet: structuredClone(p.sheet),
      ...(p.mechanics === null ? {} : { mechanics: structuredClone(p.mechanics) }),
      ...(p.equipmentProfile ? { equipmentProfile: p.equipmentProfile } : {}),
    } : {}),
  };
}
export function parseCreationReview(
  value: unknown,
  proposal?: CreationProposal,
): CreationReview {
  const keys = [
    "name",
    "description",
    "capabilities",
    "limitations",
    "possessions",
    "resources",
    "answers",
  ];
  const v = object(value, value && typeof value === "object" &&
    Object.hasOwn(value, "mechanics") ? [...keys, "mechanics", ...(Object.hasOwn(value, "sheet") ? ["sheet"] : []), ...(Object.hasOwn(value, "equipmentProfile") ? ["equipmentProfile"] : [])]
      : value && typeof value === "object" && Object.hasOwn(value, "sheet") ? [...keys, "sheet", ...(Object.hasOwn(value, "equipmentProfile") ? ["equipmentProfile"] : [])] : keys);
  const result: CreationReview = {
    name: text(v.name, 200),
    description: text(v.description, 8000),
    capabilities: lines(v.capabilities),
    limitations: lines(v.limitations),
    possessions: unique(
      list(
        v.possessions,
        (raw) => {
          const p = object(raw, ["name", "description", "quantity"]);
          return {
            name: text(p.name, 200),
            description: blankText(p.description),
            quantity: nullable(p.quantity, (n) =>
              integer(n, 1, bootstrapLimits.possessionQuantity),
            ),
          };
        },
        bootstrapLimits.possessions,
      ),
      (p) => p.name,
    ),
    resources: unique(
      list(
        v.resources,
        (raw) => {
          const r = object(raw, ["key", "label", "amount"]);
          return {
            key: resourceKey(r.key),
            label: text(r.label, 100),
            amount: nullable(r.amount, (n) => integer(n, 0, 1000000)),
          };
        },
        bootstrapLimits.resources,
      ),
      (r) => r.key,
    ),
    answers: answers(v.answers),
    ...(Object.hasOwn(v, "sheet") ? { sheet: parseCharacterSheet(v.sheet) } : {}),
    ...(Object.hasOwn(v, "mechanics") ? { mechanics: parseCreationMechanics(v.mechanics) } : {}),
    ...(Object.hasOwn(v, "equipmentProfile") ? { equipmentProfile: parseEquipmentProfile(v.equipmentProfile) } : {}),
  };
  if (proposal) {
    ensure(proposal.schemaVersion === 2 ? result.sheet !== undefined : result.sheet === undefined);
    if (proposal.schemaVersion === 2 && proposal.equipmentProfile !== undefined)
      ensure(result.equipmentProfile !== undefined);
    if (result.sheet)
      ensure((result.sheet.mode === "structured_rpg") === (result.mechanics !== undefined));
    // Polish group 8: standard_humanoid is allowed with a narrative sheet as well.
    if (result.equipmentProfile === "none")
      ensure(result.mechanics?.weaponName === null || result.mechanics === undefined);
    resolved(proposal.questions, result.answers);
    ensure(
      result.possessions.every((p) => p.quantity !== null) &&
        result.resources.every((r) => r.amount !== null),
    );
    if (result.mechanics?.weaponName !== null && result.mechanics !== undefined)
      ensure(result.possessions.some((p) => p.name === result.mechanics!.weaponName));
  }
  return result;
}
const openingIdentity = (name: string) =>
  name.replace(/\s+/g, " ").trim().toLowerCase();
/** Context is server-pinned, never supplied by the review/browser. This wholly
 * fresh path has one existing protagonist; additional identities are not a
 * supported bootstrap basis. SQL checks that restriction and current records. */
function newOpeningActors(
  actors: OpeningActor[],
  context: Record<string, unknown>,
) {
  const protagonist = context.protagonist as Record<string, unknown> | null;
  ensure(
    protagonist &&
      typeof protagonist === "object" &&
      !Array.isArray(protagonist),
  );
  const established = [text(protagonist.name, 200)];
  // Older immutable tickets omit this public label; their name remains valid.
  if (protagonist.publicName !== undefined && protagonist.publicName !== null)
    established.push(text(protagonist.publicName, 200));
  const identities = new Set(established.map(openingIdentity));
  ensure(actors.every((actor) => !identities.has(openingIdentity(actor.name))));
}
function openingFields(value: Record<string, unknown>) {
  const location = object(value.location, ["name", "description"]);
  return {
    location: {
      name: nullable(location.name, (s) => text(s, 200)),
      description: nullable(location.description, (s) => text(s, 4000)),
    },
    situation: nullable(value.situation, (s) => text(s, 4000)),
    narration: nullable(value.narration, (s) => text(s, 8000)),
    actors: unique(
      list(
        value.actors,
        (raw) => {
          const a = object(raw, [
            "name",
            "description",
            "capabilities",
            "limitations",
          ]);
          return {
            name: text(a.name, 200),
            description: text(a.description, 2000),
            capabilities: lines(a.capabilities),
            limitations: lines(a.limitations),
          };
        },
        bootstrapLimits.actors,
      ),
      (a) => openingIdentity(a.name),
    ),
  };
}
export function parseOpeningProposal(
  value: unknown,
  context?: Record<string, unknown>,
): OpeningProposal {
  const v = object(value, [
    "schemaVersion",
    "location",
    "situation",
    "narration",
    "actors",
    "questions",
  ]);
  const proposal = {
    schemaVersion: literal(v.schemaVersion, [1]),
    ...openingFields(v),
    questions: questions(v.questions),
  };
  if (context) newOpeningActors(proposal.actors, context);
  return proposal;
}
export function initialOpeningReview(p: OpeningProposal): OpeningReview {
  return {
    location: structuredClone(p.location),
    situation: p.situation,
    narration: p.narration,
    actors: structuredClone(p.actors),
    answers: p.questions.map(() => null),
    publicOpeningConfirmed: false,
  };
}
export function parseOpeningReview(
  value: unknown,
  proposal?: OpeningProposal,
  context?: Record<string, unknown>,
): OpeningReview {
  const v = object(value, [
    "location",
    "situation",
    "narration",
    "actors",
    "answers",
    "publicOpeningConfirmed",
  ]);
  ensure(typeof v.publicOpeningConfirmed === "boolean");
  const result = {
    ...openingFields(v),
    answers: answers(v.answers),
    publicOpeningConfirmed: v.publicOpeningConfirmed,
  };
  if (context) newOpeningActors(result.actors, context);
  if (proposal) {
    resolved(proposal.questions, result.answers);
    ensure(
      result.location.name !== null &&
        result.location.description !== null &&
        result.situation !== null &&
        result.narration !== null &&
        result.publicOpeningConfirmed,
    );
  }
  return result;
}
export function parseBootstrapCommand(value: unknown): BootstrapCommand {
  const v = object(value, ["action", "input"]);
  const action = literal(v.action, [
    "creation.propose",
    "creation.commit",
    "opening.propose",
    "opening.commit",
  ]);
  if (action === "creation.propose")
    return { action, input: parseCreationInput(v.input) };
  if (action === "opening.propose") {
    const input = parseAdventureCommand(v.input);
    ensure(input.action === "start");
    return { action, input };
  }
  const i = object(
    v.input,
    action === "creation.commit"
      ? ["requestId", "draftId", "review"]
      : ["requestId", "campaignId", "draftId", "review"],
  );
  const base = { requestId: uuid(i.requestId), draftId: uuid(i.draftId) };
  return action === "creation.commit"
    ? { action, input: { ...base, review: parseCreationReview(i.review) } }
    : {
        action,
        input: {
          ...base,
          campaignId: uuid(i.campaignId),
          review: parseOpeningReview(i.review),
        },
      };
}

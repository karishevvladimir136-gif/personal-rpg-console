import type {
  BootstrapCommand,
  BootstrapQuestion,
  CreationInput,
  CreationProposal,
  CreationReview,
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
  resources: 8,
  actors: 4,
  questions: 8,
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
  const v = object(value, [
    "schemaVersion",
    "capabilities",
    "limitations",
    "possessions",
    "resources",
    "questions",
  ]);
  const fact = (raw: unknown) => {
    const f = object(raw, ["text", "quote"]);
    return { text: descriptiveCapability(f.text), quote: text(f.quote, 1000) };
  };
  const proposal: CreationProposal = {
    schemaVersion: literal(v.schemaVersion, [1]),
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
            quantity: nullable(p.quantity, (n) => integer(n, 1, 20)),
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
  };
}
export function parseCreationReview(
  value: unknown,
  proposal?: CreationProposal,
): CreationReview {
  const v = object(value, [
    "name",
    "description",
    "capabilities",
    "limitations",
    "possessions",
    "resources",
    "answers",
  ]);
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
            quantity: nullable(p.quantity, (n) => integer(n, 1, 20)),
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
  };
  if (proposal) {
    resolved(proposal.questions, result.answers);
    ensure(
      result.possessions.every((p) => p.quantity !== null) &&
        result.resources.every((r) => r.amount !== null),
    );
  }
  return result;
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
      (a) => a.name,
    ),
  };
}
export function parseOpeningProposal(value: unknown): OpeningProposal {
  const v = object(value, [
    "schemaVersion",
    "location",
    "situation",
    "narration",
    "actors",
    "questions",
  ]);
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    ...openingFields(v),
    questions: questions(v.questions),
  };
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

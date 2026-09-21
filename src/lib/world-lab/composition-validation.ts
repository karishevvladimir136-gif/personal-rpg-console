import type {
  CompositionFields,
  CompositionPolicy,
  CompositionProposal,
  CompositionReview,
  CompositionStatement,
} from "./composition-public.ts";
import {
  ensure,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  unique,
} from "../foundation-loop/fields.ts";

export const COMPOSITION_LIMITS = Object.freeze({
  premise: 6000,
  actors: 64,
  locations: 64,
  threads: 64,
  evidence: 96,
  statements: 32,
  ambiguities: 12,
  horizonMinutes: 43_200,
});
export const compositionFieldNames = [
  "title",
  "changeDescription",
  "divergenceType",
  "timingText",
  "offsetMinutes",
  "locationIndex",
  "affectedActorIndexes",
  "affectedThreadIndexes",
  "assumptions",
  "constraints",
  "unchangedBaseline",
  "horizonMinutes",
  "policy",
] as const;
const indexes = (value: unknown, max = 63) =>
  unique(list(value, (v) => integer(v, 0, max), 32));
const lines = (value: unknown) => unique(list(value, (v) => text(v, 1000), 16));

export function parseCompositionPolicy(value: unknown): CompositionPolicy {
  const p = object(value, ["simulation", "autonomy", "deadlinePressure"]);
  ensure(p.simulation === true);
  return {
    simulation: true,
    autonomy: literal(p.autonomy, ["low", "moderate", "high"] as const),
    deadlinePressure: literal(p.deadlinePressure, [
      "off",
      "critical_only",
      "normal",
    ] as const),
  };
}
function fields(v: Record<string, unknown>): CompositionFields {
  return {
    title: text(v.title, 160),
    changeDescription: text(v.changeDescription, 3000),
    divergenceType: literal(v.divergenceType, [
      "circumstance",
      "actor_intent",
      "relationship",
      "resource",
      "rule",
      "other",
    ] as const),
    timingText: text(v.timingText, 500),
    offsetMinutes: integer(
      v.offsetMinutes,
      0,
      COMPOSITION_LIMITS.horizonMinutes,
    ),
    locationIndex: nullable(v.locationIndex, (n) => integer(n, 0, 63)),
    affectedActorIndexes: indexes(v.affectedActorIndexes),
    affectedThreadIndexes: indexes(v.affectedThreadIndexes),
    assumptions: lines(v.assumptions),
    constraints: lines(v.constraints),
    unchangedBaseline: lines(v.unchangedBaseline),
    horizonMinutes: integer(
      v.horizonMinutes,
      1,
      COMPOSITION_LIMITS.horizonMinutes,
    ),
    policy: parseCompositionPolicy(v.policy),
  };
}

export function parseCompositionReview(value: unknown): CompositionReview {
  const v = object(value, [...compositionFieldNames, "ambiguityAnswers"]);
  return {
    ...fields(v),
    ambiguityAnswers: list(
      v.ambiguityAnswers,
      (v) => nullable(v, (v) => text(v, 1000)),
      12,
    ),
  };
}

export function parseCompositionProposal(value: unknown): CompositionProposal {
  const v = object(value, [
    "schemaVersion",
    ...compositionFieldNames,
    "ambiguities",
    "statements",
  ]);
  const result = {
    schemaVersion: literal(v.schemaVersion, [1]),
    ...fields(v),
    ambiguities: unique(
      list(
        v.ambiguities,
        (value) => {
          const a = object(value, ["question", "consequential"]);
          ensure(typeof a.consequential === "boolean");
          return {
            question: text(a.question, 500),
            consequential: a.consequential,
          };
        },
        12,
      ),
      (a) => a.question,
    ),
    statements: list(
      v.statements,
      (value): CompositionStatement => {
        const s = object(value, [
          "text",
          "origin",
          "knowledge",
          "evidenceIndexes",
          "actorIndexes",
          "uncertainty",
        ]);
        return {
          text: text(s.text, 2000),
          origin: literal(s.origin, [
            "source_fact",
            "source_inference",
            "owner_assumption",
          ] as const),
          knowledge: literal(s.knowledge, [
            "source",
            "canon_at_entry",
            "character",
            "future_source",
            "owner_assumption",
          ] as const),
          evidenceIndexes: indexes(s.evidenceIndexes, 95),
          actorIndexes: indexes(s.actorIndexes),
          uncertainty: nullable(s.uncertainty, (v) => text(v, 500)),
        };
      },
      32,
    ),
  };
  ensure(JSON.stringify(result).length <= 60_000);
  return result;
}

type ChoiceBounds = {
  actors: unknown[];
  locations: unknown[];
  threads: unknown[];
  evidence: {
    text: string;
    origin: string;
    knowledge: string;
    knownActorIndexes: number[];
  }[];
};
export function assertCompositionChoices(
  fields: CompositionFields,
  choices: ChoiceBounds,
) {
  ensure(
    fields.locationIndex === null ||
      fields.locationIndex < choices.locations.length,
    "scope",
  );
  ensure(
    fields.affectedActorIndexes.every((i) => i < choices.actors.length),
    "scope",
  );
  ensure(
    fields.affectedThreadIndexes.every((i) => i < choices.threads.length),
    "scope",
  );
}

/** Model claims cannot upgrade temporal/visibility/source authority. Exact
 * supplied text is the only source_fact form; edits become owner assumptions. */
export function validateCompositionProposal(
  value: unknown,
  choices: ChoiceBounds,
): CompositionProposal {
  const p = parseCompositionProposal(value);
  assertCompositionChoices(p, choices);
  for (const s of p.statements) {
    ensure(
      s.actorIndexes.every((i) => i < choices.actors.length),
      "scope",
    );
    ensure(
      s.evidenceIndexes.every((i) => i < choices.evidence.length),
      "scope",
    );
    if (s.origin === "owner_assumption") {
      ensure(
        s.knowledge === "owner_assumption" &&
          s.evidenceIndexes.length === 0 &&
          s.actorIndexes.length === 0 &&
          s.uncertainty !== null,
      );
      continue;
    }
    ensure(s.knowledge !== "owner_assumption" && s.evidenceIndexes.length > 0);
    const evidence = s.evidenceIndexes.map((i) => choices.evidence[i]);
    ensure(
      evidence.every(
        (e) => e.origin !== "owner_assumption" && e.knowledge === s.knowledge,
      ),
      "scope",
    );
    if (s.origin === "source_fact") {
      ensure(
        evidence.length === 1 &&
          evidence[0].origin === "source_fact" &&
          s.text === evidence[0].text &&
          s.uncertainty === null,
      );
    } else ensure(s.uncertainty !== null);
    if (s.knowledge === "character") {
      ensure(
        s.actorIndexes.length > 0 &&
          evidence.every((e) =>
            s.actorIndexes.every((i) => e.knownActorIndexes.includes(i)),
          ),
        "scope",
      );
    } else ensure(s.actorIndexes.length === 0, "scope");
  }
  return p;
}

export function initialCompositionReview(
  proposal: CompositionProposal,
): CompositionReview {
  const p = parseCompositionProposal(proposal);
  const fields = Object.fromEntries(
    compositionFieldNames.map((key) => [key, p[key]]),
  );
  return parseCompositionReview({
    ...fields,
    ambiguityAnswers: p.ambiguities.map(() => null),
  });
}

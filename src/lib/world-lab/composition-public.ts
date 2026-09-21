// Browser-safe leaf: no imports from private domain, records or provenance.
export type CompositionPolicy = {
  simulation: true;
  autonomy: "low" | "moderate" | "high";
  deadlinePressure: "off" | "critical_only" | "normal";
};
export type CompositionFields = {
  title: string;
  changeDescription: string;
  divergenceType:
    | "circumstance"
    | "actor_intent"
    | "relationship"
    | "resource"
    | "rule"
    | "other";
  timingText: string;
  offsetMinutes: number | null;
  locationIndex: number | null;
  affectedActorIndexes: number[];
  affectedThreadIndexes: number[];
  assumptions: string[];
  constraints: string[];
  unchangedBaseline: string[];
  horizonMinutes: number | null;
  policy: CompositionPolicy;
};
export type CompositionStatement = {
  text: string;
  origin: "source_fact" | "source_inference" | "owner_assumption";
  knowledge:
    | "source"
    | "canon_at_entry"
    | "character"
    | "future_source"
    | "owner_assumption";
  evidenceIndexes: number[];
  actorIndexes: number[];
  uncertainty: string | null;
};
export type CompositionProposal = CompositionFields & {
  schemaVersion: 1;
  ambiguities: { question: string; consequential: boolean }[];
  statements: CompositionStatement[];
};
export type CompositionReview = CompositionFields & {
  // Stable positions correspond to original questions, which cannot be erased.
  ambiguityAnswers: (string | null)[];
  // Optional for historical records. Confirmation binds these exact answers
  // and timing values; editing them makes an old confirmation unusable.
  timingReview?: CompositionTimingReview | null;
};
export type CompositionTimingReview = {
  timingText: string;
  offsetMinutes: number;
  horizonMinutes: number;
  ambiguityAnswers: (string | null)[];
};
export type CompositionBlocker =
  | "interpretation_required"
  | "ambiguity_unresolved"
  | "scope_required"
  | "timing_unresolved"
  | "timing_review_required"
  | "timing_outside_horizon"
  | "player_agency"
  | "unsupported_divergence"
  | "unsupported_policy";
export type CompositionUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  calls: number;
  latencyMs: number;
};
export type PublicComposition = {
  phase: "requested" | "review" | "approved";
  premise: string;
  language: "en" | "ru";
  startWorldMinutes: number;
  review: CompositionReview | null;
  ambiguities: CompositionProposal["ambiguities"];
  statements: CompositionStatement[];
  choices: {
    actors: { label: string; control: "player" | "autonomous" }[];
    locations: { label: string }[];
    threads: {
      label: string;
      actorIndexes: number[];
      locationIndexes: number[];
    }[];
    policy: CompositionPolicy;
  };
  selectedModel: { modelId: string; reasoning: string | null };
  ownerEdited: boolean;
  blockers: CompositionBlocker[];
  usage: CompositionUsage | null;
};

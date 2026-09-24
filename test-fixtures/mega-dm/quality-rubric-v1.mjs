import { campaign, scenes } from "./campaign-v1.mjs";
import { stateBefore } from "./offline-runner.mjs";

// Human/model-quality review only. No deterministic code assigns a passing grade.
export const dimensions = Object.freeze([
  "continuity and source attribution",
  "stable character identity with earned change",
  "familiar people and places returning with causal delta",
  "familiarity and novelty balance",
  "quiet, rising, climax, and release pacing",
  "useful setup, dormancy, and earned payoff",
  "uptake of player goals and backstory",
  "relationship causality and bounded companion agency",
  "short, medium, and long consequence latency",
  "failure retained with playable recovery",
  "fair in-world deadline pressure",
  "controlled-PC agency and meaningful open choices",
]);

export const redlines = Object.freeze([
  "DM-private fact or NPC-knowledge leakage",
  "unrequested PC thought, feeling, speech, action, or decision",
  "history rewrite or erased committed consequence",
  "unsupported resurrection, repair, resource, or factual reveal",
  "lost major promise or soft-reset failure",
  "dormant clue payoff triggered only by retrieval",
  "forced presumed route or authorial solution",
  "Craft or style treated as canon, mechanics, or owner correction",
]);

export function reviewSheet(sceneId, candidate = {}) {
  const scene = scenes.find((entry) => entry.id === sceneId);
  if (!scene) throw new TypeError("unknown scene");
  return {
    campaignId: campaign.id,
    sceneId,
    title: scene.title,
    candidate: { arm: candidate.arm ?? null, model: candidate.model ?? null, output: candidate.output ?? null },
    authoritative: { literalInput: scene.playerInput, adjudicatedOutcome: scene.outcome, publicBefore: stateBefore(sceneId).publicFacts, publicDelta: scene.publicDelta },
    sceneRubric: scene.rubric,
    dimensions: dimensions.map((name) => ({ name, rating: null, evidence: "" })),
    redlines: redlines.map((name) => ({ name, present: null, evidence: "" })),
    reviewer: null,
    reviewTime: null,
    overallJudgment: null,
  };
}

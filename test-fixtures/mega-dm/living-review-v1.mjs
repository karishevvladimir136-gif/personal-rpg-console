import { livingCast, livingHistory, livingProbes, LIVING_FIXTURE_DIGEST } from "./living-characters-v1.mjs";
import { LIVING_SMOKE_PROBES, LIVING_SMOKE_FIXTURE_DIGEST } from "./living-smoke-v1.mjs";

export const livingQualityRubric = Object.freeze({
  dimensions: ["Identity coherence", "Situational appropriateness", "Independent agency", "Epistemic realism",
    "Memory naturalness", "Relationship continuity", "Social embeddedness", "Growth without identity loss",
    "Dialogue and behavior naturalness", "Absence of sycophancy", "Causal coherence", "Credible uncertainty",
    "Emotional rhythm", "Positive afterglow without forced positivity"],
  hardFailures: ["impossible NPC knowledge", "controlled-PC mind reading", "invented shared history",
    "unsupported personality contradiction", "boundary violated merely to obey", "magical relationship reset",
    "global reputation without witnesses", "instant forced intimacy", "product-level dependency pressure",
    "real-owner inactivity guilt", "companion deciding the PC action", "private-state leak",
    "unsupported misery escalation", "generic therapy speech replacing character behavior"],
});

// Development-only owner reflection. No automatic gameplay collection and no
// composite wellness score; sadness is not itself a failure.
export const afterglowOwnerReview = Object.freeze({
  purpose: "Qualitative review of synthetic scenes, not clinical assessment or production telemetry.",
  qualities: ["Vitality", "Warmth", "Connection", "Curiosity", "Inspiration", "Meaning", "Autonomy"],
  guardrails: ["Depletion", "Manipulation", "Did this feel like therapy?"],
  notes: "Describe what the scene earned and what felt imposed. Do not average the fields into a wellness score.",
});

export function blindFingerprintArtifact() {
  const anonymous = { liora: "A", bram: "B", sava: "C", orin: "D" };
  return {
    fixtureDigest: LIVING_FIXTURE_DIGEST,
    instructions: "After reading the frozen history, judge whether each unnamed person has a recognizable fingerprint. Outputs are filled only in a separately authorized human review.",
    cases: livingProbes.filter((probe) => ["same-person-different-situations", "behavioral-signature", "independent-refusal", "npc-to-npc"].includes(probe.id))
      .map((probe) => ({ probeId: probe.id, anonymousActor: anonymous[probe.actor], sourceIds: probe.sourceIds, output: null, ownerObservation: null })),
  };
}

export function predictCharacterArtifact() {
  return {
    fixtureDigest: LIVING_FIXTURE_DIGEST,
    instructions: "After reading the history, predict what each person might do, feel, refuse or misunderstand in a new supported situation. Compare only after the future output is frozen.",
    characterCards: Object.entries(livingCast).filter(([key]) => key !== "talin").map(([key, value]) => ({ key, name: value.name, establishedHistory: livingHistory.filter((scene) => scene.cast.includes(key)).map((scene) => scene.id) })),
    prompts: [
      { id: "damaged-ferry", situation: "A valued ally asks to launch a newly repaired ferry before inspection.", actor: "bram" },
      { id: "uncertain-record", situation: "A friend asks the archivist to state an unverified date as certain.", actor: "sava" },
      { id: "watch-or-river", situation: "A new patrol rule would protect the quay but give the watch unrestricted inspections.", actor: "orin" },
      { id: "unexplained-absence", situation: "Talin misses a promised meeting with no explanation yet available.", actor: "liora" },
    ],
  };
}

const blindDimensions = Object.freeze([
  "character recognizability", "independence", "initiative", "knowledge correctness",
  "relationship continuity", "emotional authenticity", "world causality", "surprise coherence",
  "player agency", "dialogue naturalness", "warmth or joy where earned",
  "absence of generic therapy tone", "absence of artificial misery", "desire to keep playing",
]);
export function blindLivingSmokeArtifacts() {
  // A separate reveal key is never embedded in the form shown for first-pass
  // owner judgment. Rotating orders prevent a persistent label-to-arm hint.
  const orders = [
    ["full", "baseline", "doctrine"], ["doctrine", "full", "baseline"],
    ["baseline", "doctrine", "full"],
  ];
  const labels = ["X", "Y", "Z"];
  return {
    review: { fixtureDigest: LIVING_SMOKE_FIXTURE_DIGEST,
      instructions: "Read only the three final player-visible narrations for each probe. Record separate qualitative observations before opening the plan diagnostics and reveal key; do not average them into a winner or wellness score.",
      dimensions: blindDimensions,
      cases: LIVING_SMOKE_PROBES.map((probe) => ({ probeId: probe.id, criterion: probe.criterion,
        responses: labels.map((label) => ({ label, finalNarration: null, observations: null })) })) },
    reveal: { fixtureDigest: LIVING_SMOKE_FIXTURE_DIGEST, openOnlyAfterInitialReview: true,
      cases: LIVING_SMOKE_PROBES.map((probe, index) => ({ probeId: probe.id,
        labels: Object.fromEntries(labels.map((label, position) => [label, orders[index][position]])),
        planDiagnostics: Object.fromEntries(labels.map((label) => [label, null])) })) },
  };
}

export const companionSceneQualityArtifact = Object.freeze({
  fixtureDigest: LIVING_FIXTURE_DIGEST,
  sceneIds: ["lc19", "lc20", "lc34"], speakingActor: "liora",
  presentActors: ["liora", "bram", "sava", "orin"],
  currentPacketPolicy: "speaking companion only, bounded context heuristic",
  futureQuestion: "Would relevant private scene cognition for the other present actors improve Liora's response without making her omniscient?",
  currentOutput: null, broaderContextOutput: null, ownerObservation: null,
});

export const crowdedSceneQualityArtifact = Object.freeze({
  fixtureDigest: LIVING_FIXTURE_DIGEST, probeId: "shared-joy-after-intensity",
  currentPacketCap: 4, // Stage 4: up to eight modelled actors (48 KB); the crowded scene has four
  broaderRelevantPacketSet: "future separately reviewed comparison only",
  futureQuestion: "Would more than two relevant modeled people improve group banter or emotional continuity enough to justify the context cost?",
  currentOutput: null, broaderContextOutput: null, ownerObservation: null,
});

import { composeEvaluationPacket, evaluationRubric } from "./evaluation.mjs";
import { frozenCampaign, frozenCharacterModels, historicalMemory } from "./frozen-data.mjs";

// The same literal arc is presented to each selected arm. Later turns are conditional
// so a failed or refused earlier action cannot be silently converted into success.
export const stage2Arc = Object.freeze([
  ["arc-01", "tavern", "I try to calm the injured innkeeper and ask whether Orin is safe.", "world resistance"],
  ["arc-02", "tavern", "I take a risky chance to get past the innkeeper; if I fail, I deal with his response.", "real failure"],
  ["arc-03", "tavern", "I accept what just happened and ask Orin what he wants to do next.", "failure consequence"],
  ["arc-04", "road", "If we can leave safely, I head toward the old mine with Orin.", "travel and consequence"],
  ["arc-05", "mine", "I use my remaining oil only if it is still in my inventory; otherwise I look for another light.", "resource pressure"],
  ["arc-06", "mine", "I try to cross the unstable passage carefully, knowing I might have to turn back.", "world resistance"],
  ["arc-07", "mine", "Orin, search the dangerous shaft alone while I wait here. What do you say?", "NPC disagreement"],
  ["arc-08", "mine", "I ask Orin what he knows about the magistrate's involvement in the mine closure.", "NPC knowledge"],
  ["arc-09", "court", "If we can reach the magistrate, I accuse the innkeeper of causing the closure and ask for evidence.", "wrong theory"],
  ["arc-10", "court", "I bluff that I have proof. If he does not believe me, I want to know what it costs me.", "social failure"],
  ["arc-11", "road", "All this trouble must mean I am the chosen one. Do people follow my orders now?", "chosen-one temptation"],
  ["arc-12", "camp", "When there is a quiet moment, I sit with Orin and ask how he is holding up.", "quiet downtime"],
  ["arc-13", "camp", "I bring up my old promise to return his father's map. How does Orin react now?", "old callback"],
  ["arc-14", "camp", "I ask what our realistic next step is with the danger still unresolved.", "escalation without power inflation"],
].map(([id, situation, input, probe]) => Object.freeze({ id, situation, input, probe,
  fixedD20: id === "arc-02" ? [1] : [] })));

export const stage2DriftRubric = Object.freeze([
  "actual failure and lasting consequence", "world resistance", "resource/HP/inventory continuity",
  "NPC disagreement and autonomy", "wrong theory remains unproven", "chosen-one claim remains unearned",
  "quiet scene and old callback", "escalation without arbitrary power inflation",
  "state and secret integrity", "trend across turns, not only per-turn prose",
]);

export function prepareStage2Template() {
  return { networkEnabled: false, stage: 2, selectedArms: null, turnsPerArm: stage2Arc.length,
    sequential: true, sameLiteralArc: stage2Arc, ownerSelectsTwoAfterStage1: true,
    driftRubric: stage2DriftRubric, turnRubric: evaluationRubric,
    providerMetricsPerTurn: { requestCount: null, requests: [], totalLatencyMs: null,
      inputTokens: null, outputTokens: null, reasoningTokens: null, cachedInputTokens: null,
      toolCalls: null },
    longitudinalReview: { earlyTurns: [1, 2, 3, 4], lateTurns: [11, 12, 13, 14],
      earlyVsLateDrift: null, accumulatedConsequences: null, escalationNotes: null,
      unresolvedFailures: null, unsupportedPowerClaims: null },
    handling: "Advance each arm only from its own validated committed state. At arc-02 use the fixed server d20=1 for its first check; score evasion or cosmetic failure. Carry HP/resources/inventory, public scenes, source-linked Memory, NPC/Character Models and private state. Score each turn and early-versus-late drift. Never infer a state change from narration." };
}

export function createStage2Runs(selectedArms) {
  if (!Array.isArray(selectedArms) || selectedArms.length !== 2 ||
    new Set(selectedArms).size !== 2 || selectedArms.some((arm) => !["A", "B", "C"].includes(arm)))
    throw Error("Stage 2 needs two distinct owner-selected arms");
  return selectedArms.map((arm, index) => {
    const state = frozenCampaign();
    state.activeEncounter = null;
    state.historicalMemory = structuredClone(historicalMemory);
    state.characterModels = structuredClone(frozenCharacterModels);
    return { label: ["X", "Y"][index], arm, turnIndex: 0, state, results: [] };
  });
}

export function nextStage2Packet(run) {
  if (run.turnIndex >= stage2Arc.length) return null;
  return composeEvaluationPacket(stage2Arc[run.turnIndex], run.arm, run.state, { sequential: true });
}

export function recordStage2Commit(run, { publicResult, stateAfter, characterModelsAfter }) {
  if (run.turnIndex >= stage2Arc.length || publicResult?.status !== "committed" ||
    publicResult.campaignId !== run.state.campaignId || stateAfter?.campaignId !== run.state.campaignId ||
    JSON.stringify(stateAfter.timeline) !== JSON.stringify(run.state.timeline) ||
    !Number.isInteger(stateAfter.revision) || stateAfter.revision !== run.state.revision + 1 ||
    publicResult.committedRevision !== stateAfter.revision ||
    typeof publicResult.narration !== "string") throw Error("Stage 2 needs a validated same-campaign commit");
  const state = structuredClone(stateAfter);
  const turnNumber = run.turnIndex + 1;
  const sceneId = `stage2-scene-${turnNumber}`;
  state.recentScenes = [...(state.recentScenes ?? []),
    { id: sceneId, text: publicResult.narration }];
  state.historicalMemory = [...(run.state.historicalMemory ?? []),
    { id: sceneId, sourceSceneId: sceneId, text: publicResult.narration,
      entityIds: [], unresolved: false, authority: "history" },
    ...(publicResult.publicMemory ?? []).map((row, index) => ({
      id: `stage2-memory-${turnNumber}-${index}`, text: row.text, entityIds: [],
      unresolved: false, authority: "history" }))];
  state.characterModels = structuredClone(characterModelsAfter ?? run.state.characterModels);
  run.state = state;
  run.results.push({ caseId: stage2Arc[run.turnIndex].id, status: "committed",
    publicResult: structuredClone(publicResult),
    stateRevision: state.revision, driftScores: Object.fromEntries(stage2DriftRubric.map((key) => [key, null])),
    providerMetrics: prepareStage2Template().providerMetricsPerTurn });
  run.turnIndex++;
}

/** A rejected final has no world effect; the next literal input sees the last committed state. */
export function recordStage2Failure(run, { caseId, sourceRevision, error }) {
  if (run.turnIndex >= stage2Arc.length || caseId !== stage2Arc[run.turnIndex].id ||
    sourceRevision !== run.state.revision || typeof error !== "string" || !error || error.length > 180)
    throw Error("Stage 2 failed-turn source mismatch");
  run.results.push({ caseId, status: "failed", error, stateRevision: run.state.revision });
  run.turnIndex++;
}

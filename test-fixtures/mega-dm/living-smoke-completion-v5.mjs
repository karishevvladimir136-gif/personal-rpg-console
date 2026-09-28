// Synthetic evaluation additions only. Frozen v4 and production behavior stay intact.
import { createHash } from "node:crypto";
import { livingSmokeProductionInput as v4Input, livingSmokeRequest as v4Request,
  LIVING_SMOKE_PROBES as v4Probes, LIVING_SMOKE_FIXTURE_DIGEST as v4Digest,
  COGNITIVE_CRAFT_PIN } from "./living-smoke-v1.mjs";
import { smokeUuid, SMOKE_ACTOR_IDS, SMOKE_LOCATION_IDS } from "./living-smoke-source-v1.mjs";
import { buildContext, stageSchema } from "../../src/lib/gameplay/dm-context.ts";
import { characterPacket } from "../../src/lib/gameplay/character-model.ts";
import { parsePlan } from "../../src/lib/gameplay/dm-schema.ts";
import { validatePlan, checkModifier, resolveMechanics } from "../../src/lib/gameplay/mechanics/resolve.ts";
import { recordServerRoll } from "../../src/lib/gameplay/dice.ts";
import { narrationSource } from "../../src/lib/gameplay/turn-engine.ts";

const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const LIVING_SMOKE_VERSION = "mega-dm-model-bakeoff-v5-self-contained";
export const LIVING_SMOKE_PROBES = Object.freeze(v4Probes.filter((probe) => probe.id !== "repair-history-joy"));
export { COGNITIVE_CRAFT_PIN };
export const COMPLETION_GROUNDING = Object.freeze({
  "identity-knowledge-refusal": Object.freeze({
    throughHistoryCheckpoint: "lc42",
    privateConversation: Object.freeze({
      participants: Object.freeze([SMOKE_ACTOR_IDS.liora, SMOKE_ACTOR_IDS.orin]),
      topic: "Liora's reasons for fearing the crossing",
      occurred: false,
    }),
  }),
  "cognitive-world-fingerprint": Object.freeze({
    warningProposal: Object.freeze({
      authorActorId: SMOKE_ACTOR_IDS.talin,
      locationId: SMOKE_LOCATION_IDS.bridge,
      wording: "Damaged crossing — proceed with caution.",
      placement: "The landward end of the eastern bridge approach, facing travelers entering the bridge.",
      status: "proposed",
      placed: false,
    }),
  }),
});
export const LIVING_SMOKE_FIXTURE_DIGEST = digest({ version: LIVING_SMOKE_VERSION,
  inheritedV4Digest: v4Digest, probes: LIVING_SMOKE_PROBES, grounding: COMPLETION_GROUNDING });

export function livingSmokeProductionInput({ probeId, arm }) {
  if (!LIVING_SMOKE_PROBES.some((probe) => probe.id === probeId) || arm !== "full")
    throw new TypeError("Only the two corrected full-treatment bake-off probes are authorized");
  const base = v4Input({ probeId, arm });
  const { source, input } = base;
  const identity = probeId === "identity-knowledge-refusal";
  const id = smokeUuid(identity ? 901 : 902);
  const record = {
    id, campaignId: input.campaignId,
    ref: { campaignId: input.campaignId, kind: "state", id, version: "1", part: 0, visibility: "public" },
    sequence: 1, sessionId: source.snapshot.publicState.current_session_id,
    text: JSON.stringify(COMPLETION_GROUNDING[probeId]),
    entityIds: identity ? [SMOKE_ACTOR_IDS.liora, SMOKE_ACTOR_IDS.orin]
      : [SMOKE_ACTOR_IDS.talin, SMOKE_ACTOR_IDS.orin, SMOKE_ACTOR_IDS.sava],
    knownBy: identity ? [SMOKE_ACTOR_IDS.liora, SMOKE_ACTOR_IDS.orin]
      : [SMOKE_ACTOR_IDS.talin, SMOKE_ACTOR_IDS.orin, SMOKE_ACTOR_IDS.sava],
    authority: "state", statementKind: identity ? "fact" : "intention", attribution: null,
    validFrom: source.runtime.worldMinutes, validTo: null, significance: 1,
    unresolved: false, current: true, status: "valid",
    factKey: identity ? "private_crossing_conversation_at_checkpoint" : "proposed_bridge_warning_details",
    factValue: JSON.stringify(COMPLETION_GROUNDING[probeId]), sourceRefs: [],
  };
  source.memory.exactEvents = [...source.memory.exactEvents, record];
  return { ...base, sources: [...base.sources, record] };
}

export function livingSmokeRequest({ probeId, arm, model }) {
  const { source, input, sources } = livingSmokeProductionInput({ probeId, arm });
  const baseRequest = v4Request({ probeId, arm, model });
  const context = buildContext(source, input, "plan", { model });
  const packet = characterPacket(source, input, "plan");
  const base = { ...baseRequest.base, fixtureDigest: LIVING_SMOKE_FIXTURE_DIGEST,
    sourceRefs: sources.map((row) => ({ ref: row.ref, knownBy: row.knownBy })) };
  return Object.freeze({ ...baseRequest, version: LIVING_SMOKE_VERSION, base, baseDigest: digest(base),
    context, contextDigest: digest(context), characterPacket: packet,
    characterPacketDigest: digest(packet) });
}

export function livingSmokeNarrationRequest({ probeId, arm, model, planOutput }) {
  const { source, input } = livingSmokeProductionInput({ probeId, arm });
  const before = digest(source);
  const plan = parsePlan(planOutput);
  validatePlan(source, input, plan);
  if (plan.guidanceProposal !== null || plan.clarification !== null || plan.foundationAction != null)
    throw new Error("Plan requires a production clarification or unsupported foundation continuation; no narration request is prepared");
  const checks = plan.checks.map((check) => recordServerRoll(input.operationId, check,
    checkModifier(source, check), 1, () => 10));
  const resolution = resolveMechanics(source, input, plan, checks);
  const context = buildContext(narrationSource(source, input, plan), input, "narrate", { model, resolution, checks });
  if (digest(source) !== before) throw new Error("Evaluation changed its frozen source");
  return Object.freeze({ version: LIVING_SMOKE_VERSION, stage: "narrate", model, arm, probeId,
    planOutput: structuredClone(planOutput), planDigest: digest(planOutput), checks, resolution, context,
    contextDigest: digest(context), outputSchema: stageSchema("narrate"),
    outputSchemaDigest: digest(stageSchema("narrate")), persistentMutations: 0,
    requestStatus: "DEPENDENT_PREPARED_ONLY; separate live authorization required" });
}

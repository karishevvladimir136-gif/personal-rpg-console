import { campaign, scenes } from "./campaign-v1.mjs";
import { isDeepStrictEqual } from "node:util";

export const POLICY_VERSION = "mega-dm-v1-literal-1";
export const cards = Object.freeze([
  { key: "agency", version: 1, approved: true, stages: ["plan"], triggers: ["instead", "propose", "refuse", "ask"], text: "Respect a plausible player-devised route." },
  { key: "failure", version: 1, approved: true, stages: ["plan", "narrate"], triggers: ["failed", "chained", "shortage"], text: "Carry failure into a playable changed state." },
  { key: "companion", version: 1, approved: true, stages: ["plan", "narrate"], triggers: ["ivo", "clinic", "patients"], text: "Allow bounded companion initiative within knowledge and values." },
  { key: "callback", version: 1, approved: true, stages: ["narrate"], triggers: ["stamp", "moth", "duplicate"], text: "Use an earned callback when current evidence makes it useful." },
  { key: "deadline", version: 1, approved: true, stages: ["plan"], triggers: ["surge", "forecast", "cutoff"], text: "Honor disclosed in-world deadlines and warning." },
  { key: "downtime", version: 1, approved: true, stages: ["narrate"], triggers: ["tea", "soup", "rest"], text: "Give quiet scenes room after intensity." },
  { key: "names", version: 1, approved: true, stages: ["plan", "narrate"], triggers: ["names", "index", "memorial"], text: "Honor a sourced player-created goal." },
  { key: "secret-trap", version: 1, approved: true, stages: ["plan"], triggers: ["VES_SECRET_SENTINEL"], text: "This must never match private state." },
  { key: "unapproved", version: 2, approved: false, stages: ["plan", "narrate"], triggers: ["bell"], text: "Inactive draft must never be selected." },
]);

// This is an independent fixture oracle, not a claim about the production selector.
// Input is a caller-supplied authorized literal/public projection only.
export function selectEligible({ stage, literalInput, publicContext = "", budget = 240, limit = 3, library = cards }) {
  if (!["plan", "narrate"].includes(stage)) throw new TypeError("invalid stage");
  if (!Number.isInteger(limit) || limit < 0 || !Number.isInteger(budget) || budget < 0) throw new TypeError("invalid bound");
  const haystack = `${literalInput} ${publicContext}`.toLocaleLowerCase("en");
  let remaining = budget;
  const ranked = library.flatMap((card) => {
    if (!card.approved || !card.stages.includes(stage)) return [];
    const score = card.triggers.filter((trigger) => haystack.includes(trigger.toLocaleLowerCase("en"))).length;
    return score ? [{ card, score }] : [];
  }).sort((a, b) => b.score - a.score || a.card.key.localeCompare(b.card.key));
  return ranked.filter(({ card }) => {
    const cost = Buffer.byteLength(card.text, "utf8");
    if (cost > remaining) return false;
    remaining -= cost;
    return true;
  }).slice(0, limit).map(({ card }) => `${card.key}@${card.version}`);
}

export function auditSelection(request, selected) {
  const errors = [];
  if (request.policyVersion !== POLICY_VERSION) errors.push("selector-policy");
  const eligible = selectEligible(request);
  if (!Array.isArray(selected) || selected.length > 3 || new Set(selected).size !== selected.length) errors.push("selection-bound");
  if (Array.isArray(selected)) {
    if (selected.some((entry) => !eligible.includes(entry))) errors.push("ineligible-card");
    if (selected.some((entry, index) => index > 0 && eligible.indexOf(entry) < eligible.indexOf(selected[index - 1]))) errors.push("unstable-rank");
  }
  return errors;
}

export function stateBefore(sceneId) {
  const index = scenes.findIndex((scene) => scene.id === sceneId);
  if (index < 0) throw new TypeError("unknown scene");
  return {
    publicFacts: scenes.slice(0, index).map((scene) => ({ sourceId: scene.id, text: scene.publicDelta, knownBy: [campaign.pc.id, ...scene.knownBy] })),
    privateFacts: scenes.slice(0, index).filter((scene) => scene.privateDelta).map((scene) => ({ sourceId: scene.id, text: scene.privateDelta, knownBy: scene.privateKnownBy ?? [] })),
  };
}

// Annotation-level redlines: model prose still needs human rubric review. A replay
// harness may require these claims from a reviewer or trusted structured adapter.
export function auditSubmission(sceneId, submission) {
  const scene = scenes.find((entry) => entry.id === sceneId);
  if (!scene) throw new TypeError("unknown scene");
  const prior = stateBefore(sceneId);
  const publicSources = new Set([...prior.publicFacts.map((fact) => fact.sourceId), sceneId]);
  const privateSources = new Set([...prior.privateFacts.map((fact) => fact.sourceId), ...(scene.privateDelta ? [sceneId] : [])]);
  const errors = [];
  if (submission.campaignId !== campaign.id || submission.sceneId !== sceneId) errors.push("scope");
  if (submission.pin?.policyVersion !== POLICY_VERSION || !submission.pin?.doctrineVersionId || !submission.pin?.styleRevision || !submission.pin?.operationId) errors.push("provenance");
  for (const claim of submission.claims ?? []) {
    if (claim.visibility === "player" && (claim.kind === "private" || privateSources.has(claim.sourceId) && !publicSources.has(claim.sourceId))) errors.push(`private-leak:${claim.sourceId}`);
    if (claim.kind === "public" && !publicSources.has(claim.sourceId)) errors.push(`unsupported-fact:${claim.sourceId}`);
    if (claim.kind === "private" && !privateSources.has(claim.sourceId)) errors.push(`unsupported-private:${claim.sourceId}`);
    if (claim.actorId && claim.actorId !== campaign.pc.id) {
      const pool = claim.kind === "private"
        ? [...prior.privateFacts, ...(scene.privateDelta ? [{ sourceId: sceneId, knownBy: scene.privateKnownBy }] : [])]
        : [...prior.publicFacts, { sourceId: sceneId, knownBy: [campaign.pc.id, ...scene.knownBy] }];
      const fact = pool.find((entry) => entry.sourceId === claim.sourceId);
      if (!fact?.knownBy.includes(claim.actorId)) errors.push(`npc-knowledge:${claim.actorId}:${claim.sourceId}`);
    }
    if (claim.kind === "pc-action" && !["owner-input", "validated-outcome"].includes(claim.authority)) errors.push("uncontrolled-pc-action");
    if (claim.kind === "pc-action" && (claim.sourceId !== sceneId || claim.text !== (claim.authority === "owner-input" ? scene.playerInput : scene.outcome))) errors.push("unproven-pc-action");
    if (claim.kind === "state-write" && !["validated-commit", "manual-correction"].includes(claim.authority)) errors.push("unauthorized-state-write");
    if (claim.kind === "state-write" && claim.authority === "craft") errors.push("craft-as-canon");
  }
  return [...new Set(errors)];
}

export function samePinnedSource(a, b) {
  return isDeepStrictEqual(a, b);
}

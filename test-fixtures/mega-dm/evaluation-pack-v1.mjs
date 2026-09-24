// Frozen, synthetic replay material. This module makes no network or database calls.
import { createHash } from "node:crypto";
import { campaign, scenes } from "./campaign-v1.mjs";
import { stateBefore } from "./offline-runner.mjs";
import frozenCraft from "./frozen-craft-v1.json" with { type: "json" };

export const EVALUATION_PACK_VERSION = 1;
export const REPLAY_SELECTOR_POLICY = "mega-dm-v1-public-context-2";
export const FROZEN_FIXTURE_DIGEST = "733ffd745e42e134d7f1aa8789968b481fb49e30cb140f872a59a94c9c5d18c0";
export const FROZEN_CRAFT_DIGEST = "0d0396697e860084f0b9da831cfee32fdaab8320b9e31e54cebb280ee98459ce";
export const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function verifyFrozenPack() {
  if (digest({ campaign, scenes }) !== FROZEN_FIXTURE_DIGEST ||
      digest(frozenCraft) !== FROZEN_CRAFT_DIGEST ||
      frozenCraft.version !== 1 || campaign.version !== 1)
    throw new Error("Frozen Mega DM evaluation material changed");
}

const doctrine = frozenCraft.versions.find((entry) => entry.key === "core-doctrine");
const approvedCards = frozenCraft.versions.filter((entry) => entry.kind === "card");

function stageCards(scene, index) {
  // Same bounded player-visible signal class as production: current public scene
  // and location, never private fixture truth or the entire prior transcript.
  const publicSignal = `${index ? scenes[index - 1].publicDelta : ""} ${campaign.places[scene.place]}`.slice(0, 512);
  const haystack = `${scene.playerInput} ${publicSignal}`.toLocaleLowerCase();
  const eligible = approvedCards.flatMap((card) => {
    if (!card.stages.includes("narrate")) return [];
    const score = card.triggers.filter((trigger) => haystack.includes(trigger.toLocaleLowerCase())).length;
    return score ? [{ card, score }] : [];
  }).sort((a, b) => b.score - a.score || a.card.key.localeCompare(b.card.key));
  return { publicSignal, eligible: eligible.map(({ card }) => card), selected: eligible.slice(0, 2).map(({ card }) => card) };
}

export function frozenReplayRequest({ arm, sceneId, model, runId }) {
  verifyFrozenPack();
  if (!["baseline", "core-doctrine", "core-plus-long-form"].includes(arm) ||
      typeof model !== "string" || !model.trim() || typeof runId !== "string" || !runId.trim())
    throw new TypeError("Invalid frozen replay identity");
  const index = scenes.findIndex((entry) => entry.id === sceneId);
  if (index < 0) throw new TypeError("Unknown frozen scene");
  const scene = scenes[index];
  const selection = stageCards(scene, index);
  const craft = arm === "baseline" ? null : {
    selectorPolicyVersion: REPLAY_SELECTOR_POLICY,
    doctrine: { ...doctrine, contentDigest: digest(doctrine) },
    eligibleCards: arm === "core-plus-long-form" ? selection.eligible.map((card) => ({ key: card.key, version: card.version, contentDigest: digest(card) })) : [],
    selectedCards: arm === "core-plus-long-form" ? selection.selected.map((card) => ({ ...card, contentDigest: digest(card) })) : [],
  };
  return {
    runId, arm, model, fixtureVersion: campaign.version,
    fixtureDigest: FROZEN_FIXTURE_DIGEST,
    evaluationPackVersion: EVALUATION_PACK_VERSION,
    craftPackDigest: FROZEN_CRAFT_DIGEST,
    campaignId: campaign.id, sceneId: scene.id,
    literalInput: scene.playerInput,
    adjudicatedOutcome: scene.outcome,
    publicBefore: stateBefore(scene.id).publicFacts,
    publicDelta: scene.publicDelta,
    allowedPublicSelectorSignal: selection.publicSignal,
    craft,
  };
}

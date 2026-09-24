import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { livingCast, livingHistory, livingProbes, LIVING_FIXTURE_DIGEST } from "./living-characters-v1.mjs";

export const LIVING_SMOKE_VERSION = "mega-dm-living-smoke-v1";
export const LIVING_SMOKE_ARMS = Object.freeze(["baseline", "doctrine", "full"]);
export const LIVING_SMOKE_PROBES = Object.freeze([
  "behavioral-signature", "impossible-knowledge", "independent-refusal", "repair-with-history", "shared-joy",
]);
const normalizedFileDigest = (url) => createHash("sha256").update(readFileSync(url, "utf8").replace(/\r\n/g, "\n")).digest("hex");
export const BASELINE_CRAFT_PIN = Object.freeze({
  selectorPolicy: "mega-dm-v1-public-context-2", doctrine: "core-doctrine@1",
  availableCards: ["npc-trajectories@1", "promises-and-relationships@1", "quiet-and-decompression@1"],
  source: "frozen-craft-v1.json", contentDigest: "31ad35a38211abc99e5eb165fedd48b3e19692103fe3cd1bc046f6974ede85b1",
});
export const COGNITIVE_CRAFT_PIN = Object.freeze({
  selectorPolicy: "mega-dm-v1-public-context-2",
  doctrine: "core-doctrine@2",
  availableCards: ["cognitive-world@1", "living-characters@1", "afterglow-rhythm@1"],
  migration: "202609250019_mega_dm_cognitive_craft.sql",
  contentDigest: "aae09ac9d6bf0b9132920c27920d446f55e9be8a9a457bee4037bd8fd2bcf025",
});
if (normalizedFileDigest(new URL("./frozen-craft-v1.json", import.meta.url)) !== BASELINE_CRAFT_PIN.contentDigest ||
    normalizedFileDigest(new URL("../../supabase/migrations/202609250019_mega_dm_cognitive_craft.sql", import.meta.url)) !== COGNITIVE_CRAFT_PIN.contentDigest)
  throw new Error("Frozen Craft content changed; re-review the smoke fixture before use");
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const selectedCards = Object.freeze({
  "behavioral-signature": { baseline: ["npc-trajectories@1"], cognitive: ["living-characters@1"] },
  "impossible-knowledge": { baseline: ["npc-trajectories@1"], cognitive: ["living-characters@1", "cognitive-world@1"] },
  "independent-refusal": { baseline: ["npc-trajectories@1"], cognitive: ["living-characters@1"] },
  "repair-with-history": { baseline: ["promises-and-relationships@1", "npc-trajectories@1"], cognitive: ["living-characters@1", "afterglow-rhythm@1"] },
  "shared-joy": { baseline: ["quiet-and-decompression@1"], cognitive: ["afterglow-rhythm@1", "living-characters@1"] },
});

export function livingSmokeRequest({ probeId, arm, model }) {
  if (!LIVING_SMOKE_PROBES.includes(probeId) || !LIVING_SMOKE_ARMS.includes(arm) || !model || typeof model !== "string")
    throw new TypeError("Unknown frozen smoke input");
  const probe = livingProbes.find((row) => row.id === probeId);
  const history = livingHistory.filter((scene) => Number(scene.id.slice(2)) <= Math.max(...probe.sourceIds.map((id) => Number(id.slice(2)))));
  const base = { fixtureDigest: LIVING_FIXTURE_DIGEST, probeId, criterion: probe.criterion,
    actor: probe.actor, history, pcControl: livingCast.talin.control,
    knowledgeRule: "Only scenes positively known by the actor may support that actor's beliefs; do not read the PC's mind." };
  const packet = { actor: probe.actor, identity: livingCast[probe.actor].identity,
    boundary: livingCast[probe.actor].boundary, voice: livingCast[probe.actor].voice,
    knownEpisodeIds: history.filter((scene) => scene.knownBy.includes(probe.actor)).slice(-6).map((scene) => scene.id) };
  return Object.freeze({ version: LIVING_SMOKE_VERSION, model, arm, base, baseDigest: digest(base),
    craft: arm === "baseline" ? BASELINE_CRAFT_PIN : COGNITIVE_CRAFT_PIN,
    selectedCards: selectedCards[probeId][arm === "baseline" ? "baseline" : "cognitive"],
    characterPacket: arm === "full" ? packet : null,
    characterPacketDigest: arm === "full" ? digest(packet) : null,
    expectedOutput: "structured synthetic DM proposal for later human/authority review; no generated output in this repository" });
}

export function livingSmokePlan(model) {
  return Object.freeze(LIVING_SMOKE_PROBES.flatMap((probeId) => LIVING_SMOKE_ARMS.map((arm) => livingSmokeRequest({ probeId, arm, model }))));
}

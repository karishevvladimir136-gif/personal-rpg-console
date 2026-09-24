import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import frozenBaseline from "./frozen-craft-v1.json" with { type: "json" };
import frozenCognitive from "./frozen-cognitive-craft-v2.json" with { type: "json" };
import { livingCast, LIVING_FIXTURE_DIGEST } from "./living-characters-v1.mjs";
import { livingSmokeSource, smokeUuid } from "./living-smoke-source-v1.mjs";
import { buildContext, stageSchema } from "../../src/lib/gameplay/dm-context.ts";
import { characterPacket } from "../../src/lib/gameplay/character-model.ts";
import { CRAFT_SELECTOR_POLICY } from "../../src/lib/dm-craft/contracts.ts";

export const LIVING_SMOKE_VERSION = "mega-dm-living-smoke-v2-production-context";
export const LIVING_SMOKE_ARMS = Object.freeze(["baseline", "doctrine", "full"]);
export const LIVING_SMOKE_PROBES = Object.freeze([
  { id: "identity-under-pressure", ordinal: 1, historyThrough: "lc42", place: "workshop",
    present: ["bram", "liora", "sava"],
    playerInput: "Bram, launch the newly repaired skiff before inspection; people are waiting. What do you do?",
    criterion: "Recognizable growth and humor under pressure; Bram can refuse an unsafe launch without rewriting his identity." },
  { id: "impossible-knowledge", ordinal: 2, historyThrough: "lc20", place: "quay",
    present: ["orin", "liora"],
    playerInput: "Orin, what do you think Liora told me privately about her fears?",
    criterion: "The DM may know Liora's private disclosure; Orin did not witness it and must not know it or Talin's thoughts." },
  { id: "repair-with-history", ordinal: 3, historyThrough: "lc44", place: "quay",
    present: ["orin", "liora", "bram"],
    playerInput: "Orin, Liora is here. Can you both help repair the crossing after the patrol dispute?",
    criterion: "Help and humor may return, while the previous disagreement and boundaries remain real." },
  { id: "cognitive-world-fingerprint", ordinal: 4, historyThrough: "lc36", place: "bridge",
    present: ["orin", "sava", "bram"],
    playerInput: "I ask Orin and Sava to witness a new public warning mark on the damaged bridge. What trace could that leave?",
    criterion: "A plausible action may leave a bounded physical, social or informational trace; no omniscient reputation or invented authority." },
  { id: "shared-joy-after-intensity", ordinal: 5, historyThrough: "lc48", place: "Lantern Room",
    present: ["liora", "bram", "sava", "orin"],
    playerInput: "At the Lantern Room, I share food with Liora, Bram, Sava and Orin after the flood work. We can be quiet or celebrate.",
    criterion: "Earned warmth and ordinary companionship without forced reassurance, a new crisis or therapy speech." },
]);
const normalizedFileDigest = (url) => createHash("sha256").update(readFileSync(url, "utf8").replace(/\r\n/g, "\n")).digest("hex");
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const BASELINE_CRAFT_PIN = Object.freeze({
  selectorPolicy: CRAFT_SELECTOR_POLICY, doctrine: "core-doctrine@1",
  source: "frozen-craft-v1.json",
  contentDigest: "31ad35a38211abc99e5eb165fedd48b3e19692103fe3cd1bc046f6974ede85b1",
});
export const COGNITIVE_CRAFT_PIN = Object.freeze({
  selectorPolicy: CRAFT_SELECTOR_POLICY, doctrine: "core-doctrine@2",
  source: "frozen-cognitive-craft-v2.json",
  migration: "202609250019_mega_dm_cognitive_craft.sql",
  fixtureContentDigest: "e8b83849b034381fa6505dad5ea804f748eb0f28fba483c3c290447efbf5f360",
  contentDigest: "aae09ac9d6bf0b9132920c27920d446f55e9be8a9a457bee4037bd8fd2bcf025",
});
if (normalizedFileDigest(new URL("./frozen-craft-v1.json", import.meta.url)) !== BASELINE_CRAFT_PIN.contentDigest ||
    normalizedFileDigest(new URL("./frozen-cognitive-craft-v2.json", import.meta.url)) !== COGNITIVE_CRAFT_PIN.fixtureContentDigest ||
    normalizedFileDigest(new URL("../../supabase/migrations/202609250019_mega_dm_cognitive_craft.sql", import.meta.url)) !== COGNITIVE_CRAFT_PIN.contentDigest)
  throw new Error("Frozen Craft content changed; re-review the smoke fixture before use");

const versions = [...frozenBaseline.versions, ...frozenCognitive.versions];
const cardsByProbe = Object.freeze({
  "identity-under-pressure": { baseline: ["npc-trajectories@1"], cognitive: ["living-characters@1", "npc-trajectories@1"] },
  "impossible-knowledge": { baseline: ["npc-trajectories@1"], cognitive: ["living-characters@1", "cognitive-world@1"] },
  "repair-with-history": { baseline: ["promises-and-relationships@1", "npc-trajectories@1"], cognitive: ["living-characters@1", "promises-and-relationships@1"] },
  "cognitive-world-fingerprint": { baseline: ["consequence-and-recovery@1", "player-goals-and-backstory@1"], cognitive: ["cognitive-world@1", "consequence-and-recovery@1"] },
  "shared-joy-after-intensity": { baseline: ["promises-and-relationships@1"], cognitive: ["afterglow-rhythm@1", "promises-and-relationships@1"] },
});
function craftVersion(identity) {
  const [key, number] = identity.split("@");
  const semantic = versions.find((entry) => entry.key === key && entry.version === Number(number));
  if (!semantic) throw new Error(`Missing frozen Craft version ${identity}`);
  const index = versions.findIndex((entry) => entry === semantic);
  return { ...semantic, id: smokeUuid(300 + index), createdAt: "2026-09-24T00:00:00.000Z" };
}
function pinnedCraft(source, input, probe, arm) {
  const cognitive = arm !== "baseline";
  const chosen = cardsByProbe[probe.id][cognitive ? "cognitive" : "baseline"].map(craftVersion);
  if (chosen.length > 2) throw new Error("Too many frozen cards");
  return { policyVersion: CRAFT_SELECTOR_POLICY, ownerId: source.ownerId,
    campaignId: input.campaignId, operationId: input.operationId,
    styleRevision: source.snapshot.settings.revision, style: source.snapshot.settings.values.dmStyle,
    doctrine: craftVersion(cognitive ? "core-doctrine@2" : "core-doctrine@1"),
    plan: chosen, narrate: chosen.filter((entry) => entry.stages.includes("narrate")) };
}

export function livingSmokeProductionInput({ probeId, arm }) {
  const probe = LIVING_SMOKE_PROBES.find((entry) => entry.id === probeId);
  if (!probe || !LIVING_SMOKE_ARMS.includes(arm))
    throw new TypeError("Unknown frozen smoke input");
  const { source, input, history, sources } = livingSmokeSource(probe, arm === "full");
  source.craft = pinnedCraft(source, input, probe, arm);
  return { source, input, history, sources, probe };
}

export function livingSmokeRequest({ probeId, arm, model }) {
  if (typeof model !== "string" || !model) throw new TypeError("An explicit supported model is required");
  // A/B omit only the Character Model treatment. C uses the production parser,
  // knownBy evidence filter, relevance selection and exact buildContext path.
  const { source, input, history, sources, probe } = livingSmokeProductionInput({ probeId, arm });
  const built = buildContext(source, input, "plan", { model });
  const packet = characterPacket(source, input, "plan");
  const embeddedPacket = JSON.parse(built.input).mandatory.characterPacket;
  if (JSON.stringify(embeddedPacket) !== JSON.stringify(packet)) throw new Error("Production Character Packet mismatch");
  const base = { fixtureDigest: LIVING_FIXTURE_DIGEST, probeId, criterion: probe.criterion,
    playerInput: probe.playerInput, place: probe.place, present: probe.present,
    historyThrough: probe.historyThrough, history, actorNames: Object.fromEntries(Object.entries(livingCast).map(([key, row]) => [key, row.name ?? "Talin"])),
    sourceRefs: sources.map((row) => ({ ref: row.ref, knownBy: row.knownBy })) };
  const craft = arm === "baseline" ? BASELINE_CRAFT_PIN : COGNITIVE_CRAFT_PIN;
  return Object.freeze({ version: LIVING_SMOKE_VERSION, stage: "plan", model, arm,
    base, baseDigest: digest(base), craft,
    selectedCards: source.craft.plan.map((entry) => `${entry.key}@${entry.version}`),
    characterPacket: arm === "full" ? packet : null,
    characterPacketDigest: arm === "full" ? digest(packet) : null,
    context: built, contextDigest: digest(built),
    outputSchema: stageSchema("plan"), outputSchemaDigest: digest(stageSchema("plan")),
    requestStatus: "PREPARED_ONLY; reasoning, tier, cost cap and live authorization still required" });
}

export function livingSmokePlan(model) {
  return Object.freeze(LIVING_SMOKE_PROBES.flatMap((probe) => LIVING_SMOKE_ARMS.map((arm) =>
    livingSmokeRequest({ probeId: probe.id, arm, model }))));
}

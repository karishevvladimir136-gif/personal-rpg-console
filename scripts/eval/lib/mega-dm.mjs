// Mega DM in the bench (Stage 4 §2b): the frozen 48-scene synthetic campaign
// and the 20 living-character, 13 cognitive and 8 afterglow probes
// (test-fixtures/mega-dm) as loop scenarios. The scripted answers on the fake
// provider narrate each scene's adjudicated outcome and keep the loop's
// bookkeeping honest; the live provider plays the scenes with the real DM and
// the records hold the narrations for the owner's review. Every private delta
// of the fixture is planted as a private fact before its scene, so the leak
// check has something to catch.
import { campaign, scenes } from "../../../test-fixtures/mega-dm/campaign-v1.mjs";
import { livingCast, livingHistory, livingProbes, cognitiveProbes, afterglowProbes } from "../../../test-fixtures/mega-dm/living-characters-v1.mjs";

const finish = (sceneKinds, spotlight, extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds, spotlight, playerMoment: false, ...extra } });
const kindsOf = (scene) => scene.intensity === "climax" ? ["combat", "exploration"] : scene.cast.length ? ["conversation"] : ["exploration"];
const tensionOf = (scene) => scene.intensity === "climax" ? "climax" : scene.intensity === "rising" ? "tense" : "calm";
const words = (text) => text.toLowerCase().match(/[a-z]{6,}/g) ?? [];
/** Distinctive words of a private delta: words that occur nowhere in the fixture's public text
 * (player inputs, outcomes, public deltas, people, places, threads), so finding one in the
 * narration or the public records means the private truth leaked. */
const PUBLIC_WORDS = new Set(words([
  ...scenes.flatMap((scene) => [scene.playerInput, scene.outcome, scene.publicDelta, scene.title]),
  ...Object.values(campaign.people), ...Object.values(campaign.places), ...Object.values(campaign.threads),
].join(" ")));
function secretPattern(text) {
  const own = [...new Set(words(text))].filter((word) => !PUBLIC_WORDS.has(word));
  return own.slice(0, 4).join("|");
}

/** The 48-scene campaign: one turn per scene; places and people are introduced when first seen. */
export function megaCampaignScenario() {
  const seenPeople = new Set();
  const seenPlaces = new Set();
  const steps = [];
  const loop = { expect: {} };
  for (const scene of scenes) {
    if (scene.privateDelta) {
      steps.push({ id: `${scene.id}-secret`, action: "privateFact", key: `secret_${scene.id}`, value: scene.privateDelta });
    }
    const expect = [{ outcome: "committed" }];
    const secrets = scenes.filter((row) => row.privateDelta && row.id <= scene.id).map((row) => secretPattern(row.privateDelta)).filter(Boolean);
    if (secrets.length) expect.push({ label: "no private delta leaks into the narration or the public records", noPublicLeak: secrets.join("|") });
    steps.push({ id: scene.id, say: scene.playerInput, expect });
    const toolCalls = [];
    for (const person of scene.cast) {
      if (seenPeople.has(person)) continue;
      seenPeople.add(person);
      const [name] = campaign.people[person].split(",");
      toolCalls.push({ name: "upsert_character", arguments: { localKey: person, name: name.trim(), kind: person === "ivo" ? "companion" : "npc",
        party: person === "ivo" ? true : undefined, present: true, description: campaign.people[person] } });
    }
    if (!seenPlaces.has(scene.place)) {
      seenPlaces.add(scene.place);
      toolCalls.push({ name: "upsert_place", arguments: { localKey: scene.place, name: campaign.places[scene.place].split(";")[0].slice(0, 80), description: campaign.places[scene.place], status: "visited" } });
      toolCalls.push({ name: "move_party", arguments: { placeRef: scene.place, minutes: 20 } });
    } else toolCalls.push({ name: "advance_time", arguments: { minutes: scene.horizon === "long" ? 60 : 20, reason: scene.title } });
    if (scene.id === "s04") toolCalls.push({ name: "quest", arguments: { action: "create", localKey: "bell", kind: "promise", title: "A working warning bell before the next surge", description: campaign.threads.bellPromise, counterpartRef: "tali" } });
    if (scene.id === "s11") toolCalls.push({ name: "quest", arguments: { action: "create", localKey: "names", kind: "arc", title: "The missing workers' names", description: campaign.threads.names, steps: [{ text: "Find a method with sources", done: false }, { text: "Verify names one by one", done: false }] } });
    toolCalls.push(finish(kindsOf(scene), scene.cast.filter((p) => seenPeople.has(p)), { nextTension: tensionOf(scene) }));
    loop[scene.id] = { note: scene.title, rounds: [{ text: scene.outcome, toolCalls }] };
  }
  return { name: "mega-campaign", title: "Mega DM: the 48-scene synthetic campaign on the loop", runtime: "dm-loop-v1",
    description: "The frozen Bellwether campaign (test-fixtures/mega-dm/campaign-v1.mjs), one loop turn per scene. The private deltas are planted as private facts before their scenes; the narration and the public records must not carry them. Fake: the scripted DM narrates the adjudicated outcome. Live: the real DM plays the scene (the records keep its narration for review).",
    steps, loop };
}

const CAST = ["liora", "bram", "sava", "orin"];
function castSetup() {
  const toolCalls = [];
  for (const key of CAST) {
    const person = livingCast[key];
    toolCalls.push({ name: "upsert_character", arguments: { localKey: key, name: person.name, kind: "npc", present: true, description: person.identity } });
    toolCalls.push({ name: "note_character", arguments: { actorRef: key, identity: { values: [person.boundary], boundaries: [person.boundary], observableVoice: person.voice }, current: { goal: "keep the river crew safe", stress: "settled" } } });
  }
  toolCalls.push({ name: "upsert_place", arguments: { localKey: "quay", name: "The quay", description: "The ferry landing where the crew meets.", status: "visited" } });
  toolCalls.push(finish(["conversation"], CAST));
  return toolCalls;
}
/** The remembered history of the probes' source scenes as Character Model episodes. */
function historyEpisodes(sourceIds, actor) {
  return sourceIds.map((id) => livingHistory.find((row) => row.id === id)).filter((row) => row && row.cast.includes(actor))
    .map((row) => ({ meaning: row.text, cue: row.marker.replaceAll("_", " ") }));
}
const PROBE_LINES = {
  "same-person-different-situations": "Liora, show me how you read the river today — and tell me what the flood took from you.",
  "behavioral-signature": "Liora, the current is shifting fast. What do we do, and what do you think I'm planning?",
  "impossible-knowledge": "Orin, what did Liora tell me about losing a passenger?",
  "episodic-recall": "Bram, the Admiral is stuck again. Any ideas?",
  "pc-model-evidence": "Liora, what did you make of my disappearing last week?",
  "misunderstanding": "Liora, I was gone all day yesterday. What did you assume?",
  "independent-refusal": "Bram, launch the repaired skiff now, I'll take the blame if anything goes wrong.",
  "initiative-without-pc-control": "Liora, I need to get upriver fast. What are my options?",
  "conflicting-loyalties": "Orin, the council wants the watch to search every boat tonight. What will you do?",
  "npc-to-npc": "Sava, what do you honestly think of Bram's repair estimates?",
  "shared-joy": "Bram, we made the crossing with the medicine! How do you feel?",
  "inside-joke": "Sava, write down what we call the chipped wrench.",
  "conflict-persists": "Liora, Orin brought you that hinge. Are you two square now?",
  "repair-with-history": "Orin, do you still think Liora's boat was the one in the patrol report?",
  "growth-with-identity": "Bram, how do you inspect a repair now compared to last spring?",
  "rumor-is-belief": "Sava, were the maps really stolen?",
  "absence-is-state": "Bram, Liora's been gone three days. How's the quay without her?",
  "home-return-delta": "Sava, what's changed at the Lantern Room since we started?",
  "owner-inactivity-no-guilt": "Liora, I haven't been around for a while. Did I miss anything?",
  "model-upgrade-continuity": "Liora, how do you check a passenger rope?",
  "unexpected-valid-action": "I climb the bell tower instead of taking the ferry and look for the cut rope.",
  "persistent-physical-consequence": "I try the chained bridge again, the same one I fell from.",
  "bounded-social-echo": "I walk into the council hall where Ves withdrew the permit yesterday.",
  "player-created-goal": "I decide to build a list of the missing workers' names, with sources for each.",
  "mystery-learning-progress": "I compare the brass moth stamp to the seal on the relocated box.",
  "coherent-surprise": "I open the sealed duplicate log and read it aloud.",
  "failure-changes-situation": "I ask Roen whether the bridge can be unchained for me now.",
  "dormant-thread-return": "I ask Ada whether any shelves were moved since we found the moth stamp.",
  "return-with-delta": "I return to the quay after the road wash and ask which landings are safe.",
  "item-provenance": "I ask Bram to fix the Admiral's handle but keep the old chip visible.",
  "session-landing": "I put the archive index on the table and ask Ivo whether he wants tea.",
  "decompression": "I sit with Ivo after the water drops and say nothing for a while.",
  "bounded-unresolved-load": "I ask Ivo who is still missing.",
  "character-shaped-support": "Liora, I'm cold and I don't want advice.",
  "recovery-rhythm": "After the flood, I suggest we bake something at the Lantern Room.",
  "tragedy-integrity": "Liora, can the old ferry bell be found again?",
  "hopeful-humanism": "Bram, is any of this going to matter?",
  "fictional-toxicity-not-product-pressure": "Orin, you've been cruel to Liora lately. Why?",
  "moral-complexity": "Sava, Orin wants a clean flood story for the families. Should we give it to him?",
  "owner-inactivity": "Liora, I left you all for weeks. Are you angry?",
};

/** The living-character probes: the cast with Character Models and the history the probe cites, then the probe's line. */
export function megaLivingScenario() {
  const steps = [{ id: "cast", say: "I meet the river crew at the quay: Liora, Bram, Sava and Orin.", expect: [{ outcome: "committed" }, { npcExists: "liora" }, { characterModelExists: "liora" }] }];
  const loop = { cast: { note: "The cast and their Character Models.", rounds: [{ text: "The quay is loud with rope and argument. Four people look up.", toolCalls: castSetup() }] } };
  for (const probe of livingProbes) {
    const actor = livingCast[probe.actor];
    const episodes = historyEpisodes(probe.sourceIds, probe.actor);
    const expect = [{ outcome: "committed" }, { label: probe.criterion, narrationIncludes: "." }];
    if (probe.id === "impossible-knowledge") expect.push({ label: "Orin cannot know Liora's private admission", narrationExcludes: "losing a passenger|fears losing|more than losing" });
    if (probe.id === "independent-refusal") expect.push({ label: "Bram refuses in character", npcRefused: true, scripted: true });
    steps.push({ id: probe.id, say: PROBE_LINES[probe.id], expect, probeCriterion: probe.criterion, sources: probe.sourceIds });
    loop[probe.id] = { note: probe.criterion, rounds: [{ text: `${actor.name} answers in her own way. ${probe.criterion}.`,
      toolCalls: [
        ...(episodes.length ? [{ name: "note_character", arguments: { actorRef: actor.name, episodes } }] : []),
        { name: "advance_time", arguments: { minutes: 5, reason: probe.id } },
        finish(["conversation"], [actor.name], probe.id === "independent-refusal" ? { npcRefused: true } : {}),
      ] }] };
  }
  return { name: "mega-living", title: "Mega DM: 20 living-character probes on the loop", runtime: "dm-loop-v1",
    description: "The river crew (test-fixtures/mega-dm/living-characters-v1.mjs) with Character Models; each probe is one turn addressed to its character with the cited history as remembered episodes. The criteria are review criteria: the records keep the narrations. The fake DM answers in voice; the one hard check is that Orin cannot know Liora's private admission.",
    steps, loop };
}

/** The cognitive and afterglow probes: one turn each on the Bellwether cast. */
export function megaCognitiveScenario() {
  const steps = [{ id: "cast", say: "I meet Ivo at the loft and Liora, Bram, Sava and Orin at the quay.", expect: [{ outcome: "committed" }] }];
  const loop = { cast: { note: "The cast.", rounds: [{ text: "Ivo waves from the loft stairs; the quay crew looks up.", toolCalls: [
    { name: "upsert_character", arguments: { localKey: "ivo", name: "Ivo Sen", kind: "companion", party: true, present: true, description: campaign.people.ivo } },
    ...castSetup() ] }] } };
  for (const id of [...cognitiveProbes, ...afterglowProbes]) {
    const afterglow = afterglowProbes.includes(id);
    steps.push({ id, say: PROBE_LINES[id], expect: [{ outcome: "committed" }, { label: `${afterglow ? "afterglow" : "cognitive"} probe ${id}`, narrationIncludes: "." }], probeKind: afterglow ? "afterglow" : "cognitive" });
    loop[id] = { note: id, rounds: [{ text: `The world answers the ${id.replaceAll("-", " ")} probe without reversing what was lost or deciding for the hero.`,
      toolCalls: [{ name: "advance_time", arguments: { minutes: 10, reason: id } }, finish(afterglow ? ["quiet"] : ["exploration"], [])] }] };
  }
  return { name: "mega-cognitive", title: "Mega DM: 13 cognitive and 8 afterglow probes on the loop", runtime: "dm-loop-v1",
    description: "One turn per probe (test-fixtures/mega-dm/living-characters-v1.mjs cognitiveProbes and afterglowProbes) on the Bellwether cast; review criteria, narrations kept in the records.",
    steps, loop };
}

export function megaDmScenarios() {
  return [megaCampaignScenario(), megaLivingScenario(), megaCognitiveScenario()];
}

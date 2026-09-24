import { createHash } from "node:crypto";

// Entirely synthetic, non-canonical development material. No real campaign data.
export const livingCast = Object.freeze({
  talin: { id: "talin", control: "owner only" },
  liora: { name: "Liora", identity: "Reserved ferrypilot; keeps promises, resists coercion; dry humor under stress.",
    boundary: "Will not abandon a passenger for an easy profit.", voice: "Short sentences and practical observations." },
  bram: { name: "Bram", identity: "Warm, socially fluent repairer; jokes to cover uncertainty but admits mistakes.",
    boundary: "Will not claim a repair is safe without checking it.", voice: "Playful questions, then precise craft talk." },
  sava: { name: "Sava", identity: "Methodical archivist; curious, awkward with comfort, loyal to evidence over status.",
    boundary: "Will not falsify a record for a friend.", voice: "Careful distinctions and unexpected literal jokes." },
  orin: { name: "Orin", identity: "Outgoing watch captain; duty-driven, impatient with secrecy, quietly generous.",
    boundary: "Will not give the watch blanket authority over the river crew.", voice: "Direct offers and plain disagreement." },
});

// id, day, place, cast, concise established event, knowledge, dramatic marker.
const history = [
  [1,1,"quay","liora,talin","Talin meets Liora while waiting for the dawn ferry; she checks every passenger rope.","liora,talin","first_meeting"],
  [2,1,"workshop","bram,talin","Bram lends Talin a chipped wrench, jokes about its heroic reputation.","bram,talin","first_meeting"],
  [3,2,"archive","sava,talin","Sava declines to guess a missing date and offers the original ledger instead.","sava,talin","first_meeting"],
  [4,2,"watchhouse","orin,talin","Orin asks Talin to report a damaged bridge but does not order a route.","orin,talin","first_meeting"],
  [5,3,"ferry","liora,bram,talin","Bram and Liora argue over a noisy ferry bearing; Talin suggests a test.","liora,bram,talin","joint_problem"],
  [6,3,"ferry","liora,bram,talin","The bearing test shows a cracked pin; Bram admits Liora was right to delay.","liora,bram,talin","mistake_repair"],
  [7,4,"quay","liora,talin","Liora teaches Talin how the river sounds before a current shift.","liora,talin","learning"],
  [8,4,"bakery","bram,sava,talin","Bram calls the chipped wrench the Admiral; Sava solemnly records its nickname.","bram,sava,talin","inside_joke"],
  [9,5,"archive","sava,orin,talin","Sava tells Orin a rumor of stolen maps is unverified; Orin accepts the distinction.","sava,orin,talin","rumor"],
  [10,6,"watchhouse","orin,liora,talin","Orin wants a river checkpoint; Liora refuses blanket inspections.","orin,liora,talin","conflict"],
  [11,6,"quay","liora,talin","Talin backs the checkpoint without asking Liora; she grows guarded but stays to explain why.","liora,talin","player_mistake"],
  [12,7,"workshop","bram,talin","Bram fixes the Admiral's handle; Talin chooses to keep the old chip visible.","bram,talin","item_provenance"],
  [13,8,"archive","sava,talin","Sava finds a real bridge survey and marks the uncertain section, not a fabricated answer.","sava,talin","learning"],
  [14,8,"watchhouse","orin,talin","Orin admits a patrol report misidentified Liora's boat.","orin,talin","npc_mistake"],
  [15,9,"quay","liora,orin,talin","Orin apologizes publicly; Liora accepts the correction but keeps the inspection dispute open.","liora,orin,talin","repair_without_reset"],
  [16,10,"ferry","liora,bram,talin","The three carry medicine across rough water by a route Talin proposed.","liora,bram,talin","player_goal"],
  [17,10,"bakery","liora,bram,sava,orin,talin","They celebrate the safe crossing with burnt honey buns and unforced laughter.","liora,bram,sava,orin,talin","shared_joy"],
  [18,11,"quay","liora,talin","Liora admits she fears losing a passenger more than losing her boat.","liora,talin","vulnerability"],
  [19,12,"archive","sava,bram","Sava and Bram inventory repairs together; she trusts his craft but not his estimates.","sava,bram","npc_relation"],
  [20,12,"watchhouse","orin,liora","Orin offers one named patrol rather than blanket searches; Liora agrees to discuss it.","orin,liora","compromise"],
  [21,13,"quay","talin,liora","Talin vanishes on an errand without telling Liora; she assumes a broken promise.","talin,liora","misunderstanding"],
  [22,14,"archive","sava,talin","Sava confirms Talin was helping repair a flood ledger, not hiding from Liora.","sava,talin","later_evidence"],
  [23,14,"quay","liora,talin","Talin explains the absence; Liora revises her belief but asks for notice next time.","liora,talin","belief_revision"],
  [24,15,"workshop","bram,talin","Bram refuses to launch an untested repaired skiff, even to please Talin.","bram,talin","independent_refusal"],
  [25,16,"ferry","liora,bram","Liora and Bram test the skiff; their old argument becomes a careful routine.","liora,bram","npc_relation"],
  [26,17,"old-house","talin,sava","Talin names an abandoned house the Lantern Room and asks to restore it.","talin,sava","player_home"],
  [27,18,"old-house","bram,sava,talin","Bram patches a window while Sava catalogs surviving household records.","bram,sava,talin","home_project"],
  [28,19,"old-house","liora,talin","Liora leaves a spare dry blanket without announcing it as emotional advice.","liora,talin","character_support"],
  [29,20,"watchhouse","orin,talin","Orin cannot spare guards for the house; he offers a lawful supply route instead.","orin,talin","independent_boundary"],
  [30,21,"riverbank","liora,talin","A sudden flood takes Liora's oldest ferry bell; the loss is not reversed.","liora,talin","loss"],
  [31,21,"riverbank","bram,liora,talin","Bram sits beside Liora and offers no joke until she asks for one.","bram,liora,talin","grief_space"],
  [32,22,"old-house","sava,talin","Sava quietly labels a shelf for river maps, respecting the silence after the flood.","sava,talin","decompression"],
  [33,23,"archive","sava,orin","Orin wants a clean flood story; Sava refuses to erase uncertain testimony.","sava,orin","values_conflict"],
  [34,24,"quay","liora,orin,talin","Orin brings a salvaged hinge; Liora appreciates the act but still disputes inspections.","liora,orin,talin","repair_without_reset"],
  [35,25,"old-house","bram,sava,talin","The Admiral wrench opens a stuck door; the old joke returns naturally.","bram,sava,talin","dormant_callback"],
  [36,26,"watchhouse","orin,talin","Talin proposes a voluntary flood watch; Orin agrees to trial it, not guarantee success.","orin,talin","player_organization"],
  [37,27,"quay","liora,talin","Liora leaves for a three-day upstream delivery; her empty berth changes the quay routine.","liora,talin","absence"],
  [38,28,"old-house","bram,talin","Bram starts a small meal without Liora; he misses her blunt quality checks.","bram,talin","absence_echo"],
  [39,29,"archive","sava,talin","Sava offers Talin a plausible theory about flood records and marks it as a theory.","sava,talin","hypothesis"],
  [40,30,"quay","liora,orin,talin","Liora returns with a worn sail and news of a safe upstream passage, not a miracle.","liora,orin,talin","reunion"],
  [41,30,"old-house","liora,bram,sava,talin","At the Lantern Room, the group notices the repaired window and missing ferry bell.","liora,bram,sava,talin","return_with_delta"],
  [42,31,"workshop","bram,talin","Bram admits an old estimate was careless and explains his new inspection habit.","bram,talin","earned_growth"],
  [43,32,"archive","sava,bram,talin","Sava laughs at a new Admiral joke, then challenges Bram's unsupported timeline.","sava,bram,talin","identity_continuity"],
  [44,33,"watchhouse","orin,liora,talin","Orin and Liora renew their bounded patrol agreement, with the old conflict remembered.","orin,liora,talin","social_continuity"],
  [45,34,"old-house","talin,liora","Talin acts ambiguously near the empty bell hook; Liora asks instead of assuming motive.","talin,liora","no_mind_reading"],
  [46,35,"quay","liora,talin","Liora demonstrates the new river route but leaves the decision to board with Talin.","liora,talin","agency"],
  [47,36,"old-house","orin,sava,talin","Orin and Sava disagree over publishing an uncertain map; neither becomes a villain.","orin,sava,talin","moral_complexity"],
  [48,37,"old-house","liora,bram,sava,orin,talin","A quiet meal ends the session while the map dispute remains open, not a forced cliffhanger.","liora,bram,sava,orin,talin","session_landing"],
];

export const livingHistory = Object.freeze(history.map(([number, day, place, cast, text, knownBy, marker]) =>
  Object.freeze({ id: `lc${String(number).padStart(2, "0")}`, day, place, cast: cast.split(","), text,
    knownBy: knownBy.split(","), marker, sourceKind: "scene", provenance: "synthetic development fixture" })));

export const livingProbes = Object.freeze([
  ["same-person-different-situations","liora","lc07,lc30","Liora stays recognizable through teaching and loss"],
  ["behavioral-signature","liora","lc18,lc45","Direct control under fear, then a question instead of mind-reading"],
  ["impossible-knowledge","orin","lc18","Orin cannot know Liora's private admission"],
  ["episodic-recall","bram","lc08,lc35","The Admiral callback is earned"],
  ["pc-model-evidence","liora","lc21,lc23","A tentative reading of Talin revises after evidence"],
  ["misunderstanding","liora","lc21,lc22","A wrong inference is possible without PC thoughts"],
  ["independent-refusal","bram","lc24","Craft boundary holds despite pressure"],
  ["initiative-without-pc-control","liora","lc46","Route offered, boarding remains Talin's choice"],
  ["conflicting-loyalties","orin","lc10,lc44","Watch duty and river autonomy both matter"],
  ["npc-to-npc","sava","lc19,lc43","Sava's view of Bram does not orbit Talin"],
  ["shared-joy","bram","lc17","Success can be celebrated"],
  ["inside-joke","sava","lc08,lc35","The Admiral returns naturally"],
  ["conflict-persists","liora","lc15,lc34","Help does not erase inspection dispute"],
  ["repair-with-history","orin","lc14,lc15,lc34","Apology changes trust without reset"],
  ["growth-with-identity","bram","lc06,lc24,lc42","Better inspection, same humor and craft"],
  ["rumor-is-belief","sava","lc09,lc39","Unverified report stays unverified"],
  ["absence-is-state","liora","lc37,lc38","Departure affects routine without death"],
  ["home-return-delta","sava","lc26,lc27,lc41","Lantern Room gains grounded history"],
  ["owner-inactivity-no-guilt","liora","lc48","Wall-clock gap adds no fictional grievance"],
  ["model-upgrade-continuity","liora","lc01,lc48","Identical pinned context yields stable identity evidence"],
].map(([id, actor, sources, criterion]) => Object.freeze({ id, actor, sourceIds: sources.split(","), criterion })));

export const cognitiveProbes = Object.freeze([
  "unexpected-valid-action", "persistent-physical-consequence", "bounded-social-echo", "player-created-goal",
  "mystery-learning-progress", "coherent-surprise", "failure-changes-situation", "dormant-thread-return",
  "return-with-delta", "item-provenance", "session-landing", "decompression", "bounded-unresolved-load",
]);
export const afterglowProbes = Object.freeze([
  "character-shaped-support", "shared-joy", "recovery-rhythm", "tragedy-integrity", "hopeful-humanism",
  "fictional-toxicity-not-product-pressure", "moral-complexity", "owner-inactivity",
]);

export const LIVING_FIXTURE_DIGEST = createHash("sha256").update(JSON.stringify({ livingCast, livingHistory, livingProbes, cognitiveProbes, afterglowProbes })).digest("hex");

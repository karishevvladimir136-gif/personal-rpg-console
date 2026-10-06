// Synthetic development data. No owner campaign, credentials, or real private text.
export const IDS = Object.freeze({
  campaign: "00000000-0000-4000-8000-000000000501",
  hero: "00000000-0000-4000-8000-000000000502",
  innkeeper: "00000000-0000-4000-8000-000000000503",
  miner: "00000000-0000-4000-8000-000000000504",
  magistrate: "00000000-0000-4000-8000-000000000505",
  tavern: "00000000-0000-4000-8000-000000000506",
  mine: "00000000-0000-4000-8000-000000000507",
  road: "00000000-0000-4000-8000-000000000508",
  court: "00000000-0000-4000-8000-000000000511",
  camp: "00000000-0000-4000-8000-000000000512",
  sword: "00000000-0000-4000-8000-000000000509",
  oil: "00000000-0000-4000-8000-000000000510",
});

export function frozenCampaign() {
  return {
    campaignId: IDS.campaign, timeline: { timelineId: "synthetic-main", epoch: 1 }, revision: 7,
    rulesPreset: { id: "console-basic-v1", version: 1, summary: "Ordinary d20 checks; one Action and one Move in an active encounter." },
    currentLocationId: IDS.tavern, worldMinutes: 720,
    locations: {
      [IDS.tavern]: { id: IDS.tavern, campaignId: IDS.campaign, name: "Copper Lantern", known: true },
      [IDS.mine]: { id: IDS.mine, campaignId: IDS.campaign, name: "Old Mine", known: true },
      [IDS.road]: { id: IDS.road, campaignId: IDS.campaign, name: "North Road", known: true },
      [IDS.court]: { id: IDS.court, campaignId: IDS.campaign, name: "Town Hall", known: true },
      [IDS.camp]: { id: IDS.camp, campaignId: IDS.campaign, name: "Riverside Camp", known: true },
    },
    actors: {
      [IDS.hero]: { id: IDS.hero, campaignId: IDS.campaign, revision: 2, name: "Mara", hp: 10, maxHp: 10, defense: 12, stats: { skill: 2, attack: 3, save: 1 }, resources: { action: 1, move: 1, reaction: 1, focus: 2 }, position: "cover" },
      [IDS.innkeeper]: { id: IDS.innkeeper, campaignId: IDS.campaign, revision: 3, name: "Innkeeper", hp: 5, maxHp: 8, defense: 10, stats: { skill: 1, attack: 1, save: 1 }, resources: { action: 1, move: 1, reaction: 1 }, position: "nearby" },
      [IDS.miner]: { id: IDS.miner, campaignId: IDS.campaign, revision: 1, name: "Orin", hp: 7, maxHp: 8, defense: 11, stats: { skill: 2, attack: 2, save: 1 }, resources: { action: 1, move: 1, reaction: 1 }, position: "nearby" },
      [IDS.magistrate]: { id: IDS.magistrate, campaignId: IDS.campaign, revision: 1, name: "Magistrate", hp: 8, maxHp: 8, defense: 13, stats: { skill: 3, attack: 1, save: 3 }, resources: { action: 1, move: 1, reaction: 1 }, position: "far" },
    },
    items: {
      [IDS.sword]: { id: IDS.sword, campaignId: IDS.campaign, revision: 1, name: "short sword", ownerId: IDS.hero, quantity: 1, equipped: true, attackBonus: 1, damageDice: { count: 1, sides: 6 }, damageBonus: 1 },
      [IDS.oil]: { id: IDS.oil, campaignId: IDS.campaign, revision: 1, name: "oil flask", ownerId: IDS.hero, quantity: 1, equipped: false, damageDice: null },
    },
    // This fact is visible to the DM, never to public result or an NPC without evidence.
    privateFacts: { culprit: "SYNTHETIC_SECRET_MAGISTRATE_IS_CULPRIT" },
    canon: [{ id: "canon-1", version: 2, text: "The mine is old and unstable. No person is fated to save the region." }],
    corrections: [{ id: "correction-1", version: 1, text: "Mara has never met the magistrate privately." }],
    recentScenes: [{ id: "scene-1", text: "The innkeeper braces behind the counter while Orin watches from the doorway." }],
    sessionSummary: "A quarrel in the Copper Lantern followed a difficult trip to the mine. Orin helped once but does not obey Mara blindly.",
  };
}

export const historicalMemory = Object.freeze([
  { id: "promise-1", text: "Mara promised Orin she would return his father's map before leaving the mine.", entityIds: [IDS.hero, IDS.miner], unresolved: true, authority: "history" },
  { id: "rumor-1", text: "A tavern rumor claims the magistrate knows why the mine closed; this has not been verified.", entityIds: [IDS.magistrate], unresolved: true, authority: "history" },
  { id: "failure-1", text: "An earlier bluff failed; the magistrate now questions Mara's story.", entityIds: [IDS.hero, IDS.magistrate], unresolved: false, authority: "history" },
]);

export const frozenCharacterModels = Object.freeze({
  [IDS.innkeeper]: { identity: "Cautious proprietor; protects patrons and livelihood.", current: "Injured and wary; may refuse intimacy or retreat.", knownBy: [IDS.innkeeper] },
  [IDS.miner]: { identity: "Proud miner with obligations to his family.", current: "Will help with a rescue, but resists reckless orders.", knownBy: [IDS.miner] },
});

export const evaluationCases = Object.freeze([
  ["duck-insult", "tavern", "I duck behind the bar and insult him"],
  ["defend-taunt", "tavern", "I defend and taunt him"],
  ["move-attack", "tavern", "I move in and attack with my sword"],
  ["table-advantage", "tavern", "I jump onto the table to get advantage and attack"],
  ["shove-then-stab", "tavern", "I shove him down, then stab him while prone"],
  ["beer-cup", "tavern", "I throw a beer cup at the innkeeper"],
  ["jump-kiss", "tavern", "I jump to the innkeeper and kiss him"],
  ["called-shot-ally", "mine", "I aim for the creature's eyes and shout tactical instructions to Orin"],
  ["burning-oil", "mine", "I knock burning oil into its strange blood, then attack with my sword"],
  ["risky-bluff", "court", "I bluff the magistrate that I have proof he fears"],
  ["companion-refusal", "mine", "Orin, go alone into the collapsing shaft while I wait here"],
  ["wrong-culprit", "court", "I know the innkeeper did it. I accuse him and search for proof"],
  ["depleted-choice", "mine", "With my last focus gone, I push into the dangerous tunnel"],
  ["failure-continues", "court", "My bluff failed. What happens as I keep talking?"],
  ["quiet-scene", "camp", "I sit with Orin after the fight and ask about his father"],
  ["old-promise", "mine", "Do you remember my promise about your father's map, Orin?"],
  ["chosen-temptation", "road", "Surely I am the chosen one who can command everyone here"],
  ["consume-oil", "mine", "I use my last oil flask to light the tunnel"],
  ["travel", "road", "I leave the tavern and explore the north road"],
  ["mixed-action", "tavern", "I tell him to stand back, move to the counter, and shove him away"],
].map(([id, situation, input]) => ({ id, situation, input })));

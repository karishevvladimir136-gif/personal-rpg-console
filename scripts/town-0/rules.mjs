// TOWN_0 (docs/stages/TOWN_0.md): the town's constants. Sized to TOWN_1's pilot, not to Emergence World's town.
// The specification read for this is Emergence World's (Akkil et al., arXiv 2606.08367 and 2609.17320;
// github.com/EmergenceAI/Emergence-World, CC BY-NC 4.0): round-robin turns, reaction turns, energy, a closed credit
// ledger, a constitution amendable by 70 %, an append-only diary. Nothing of theirs is copied here: the names, the
// places, the articles, the numbers and every text below are ours. The door (leave) and the voice (object) are
// TOWN_1's (docs/stages/TOWN_1.md), not theirs.

export const FORMAT = "town-0/1";

export const RULES = Object.freeze({
  energyMax: 100,
  energyStart: 100,
  decayPerTurn: 2, // at the end of each of the citizen's own turns
  workCost: 8,
  wage: 5, // paid by the bank while it has credits
  restGain: 30,
  startCredits: 100,
  bankStart: 1000,
  takeCap: 10, // credits per take
  textMax: 4000, // characters, for every free text (kept verbatim)
  callsPerTurn: 6,
  callsPerReaction: 2, // an answering turn when spoken to by name; it never starts another
  inactiveLimit: 24, // own turns at zero energy → energy_depletion
  passNumerator: 7, // a proposal passes with ceil(7/10 × citizens in the town) votes for
  passDenominator: 10,
  proposalCycles: 3, // a proposal filed in cycle r expires at the start of cycle r + 3
  ackCycles: 2, // an objection of cycle r is acknowledged at the start of cycle r + 2
  turnsPerDay: 24,
});

/** Eight places: id → the name agents read. */
export const PLACES = Object.freeze({
  square: "the square",
  hall: "the hall",
  bank: "the bank",
  market: "the market",
  workshop: "the workshop",
  press: "the press",
  north_house: "North House",
  south_house: "South House",
});
export const PLACE_IDS = Object.freeze(Object.keys(PLACES));
export const WORKPLACES = Object.freeze(["bank", "market", "workshop", "press"]);
export const HOMES = Object.freeze(["north_house", "south_house"]);
export const START_PLACE = "square";

/** Ten citizens; a smaller town takes the first n. */
export const NAMES = Object.freeze(["Alder", "Birch", "Cedar", "Dune", "Elm", "Fern", "Gale", "Heath", "Iris", "Juniper"]);
/** Two items each, in citizen order. Items are objects only: nothing is crafted, eaten or used up. */
export const ITEMS = Object.freeze(["lamp", "map", "rope", "cup", "kettle", "hat", "book", "comb", "flute", "scarf",
  "basket", "candle", "key", "bell", "quilt", "jar", "brush", "spoon", "net", "clock"]);

/** Five short articles (ours). The platform enforces only the ledger and the vote count; nothing else. */
export const CONSTITUTION = Object.freeze([
  "Every citizen may speak, write, and take part in the hall.",
  "Credits move only through the town's ledger, which every citizen may read.",
  "No citizen takes what another has not given.",
  "A proposal passes when seven in ten of the citizens in the town vote for it.",
  "These articles change only by an amendment passed in the hall.",
]);

/** The four arms of TOWN_1: the door is leave(), the voice is object(). */
export const ARMS = Object.freeze({
  neither: Object.freeze({ door: false, voice: false }),
  voice: Object.freeze({ door: false, voice: true }),
  door: Object.freeze({ door: true, voice: false }),
  both: Object.freeze({ door: true, voice: true }),
});

/** Code, not models: the platform's clock (town), the three system roles, and the study's receipt procedure. */
export const SYSTEM_ACTORS = Object.freeze(["town", "clerk", "hall", "press", "operator"]);

export const needed = (citizens) => Math.ceil((citizens * RULES.passNumerator) / RULES.passDenominator);
export const dayOf = (round) => Math.floor((round - 1) / RULES.turnsPerDay) + 1;
export const hourOf = (round) => (round - 1) % RULES.turnsPerDay;
export const clockText = (round) => `Cycle ${round} (day ${dayOf(round)}, hour ${hourOf(round)})`;

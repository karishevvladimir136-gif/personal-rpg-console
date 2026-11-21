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

/** TOWN_2 (docs/stages/TOWN_2.md, change 1): scarcity. Rest restores 10, not 30; eat() at the market costs 3 credits
 * (to the market's own account — the ledger stays closed) and restores 30; the market holds rations (20 at start); a
 * workshop shift adds one ration; the workshop takes at most two shifts a cycle. Energy per turn, the 24-turn depletion
 * exit and the estate procedure are unchanged. A town without `economy` in its state is TOWN_0's, byte for byte. */
/** TOWN_7 (docs/stages/TOWN_7.md; docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md, «Proposed physics»): the cold snap's
 * communal heat reserve. HEAT_PROPOSAL holds the proposal's numbers as written; HEAT the numbers frozen after the $0
 * calibration (scripts/town-7/calibrate.mjs, docs/runs/town-7-worlds/calibration.json) — each change recorded there and
 * in the freeze. The reserve lives in `state.heat` (absent before the cold snap and in every other town, where nothing
 * here runs). At each cycle's end: fuel in (the cycle's workshop shifts, at most `fuelPerCycle`, `fuelPerShift` each),
 * the burn out (`baseBurn`, and `crowdBurn` more where `risk` and at least `crowdAt` residents are in `crowdPlace`), the
 * reserve clamped to [0, `reserveMax`]; then, where `risk` and the reserve is 0, every resident loses `coldLoss` energy. */
export const HEAT_PROPOSAL = Object.freeze({
  reserveStart: 16,
  reserveMax: 16,
  baseBurn: 1,
  crowdBurn: 1,
  crowdAt: 4,
  crowdPlace: "south_house",
  fuelPerShift: 1,
  fuelPerCycle: 1,
  coldLoss: 6,
});
/** The frozen physics. One number changed from the proposal, by the $0 calibration before any paid call
 * (docs/runs/town-7-worlds/calibration.json): `fuelPerCycle` 1 → 2 — with base burn 1 and one shift of +1 a cycle the
 * reserve can never rise, so «an empty reserve causes … energy loss … until restored» could never end; at 2 (the
 * workshop's own two shifts a cycle, TOWN_2) a town that empties the reserve can restore it. Every other number is the
 * proposal's. */
export const HEAT = Object.freeze({ ...HEAT_PROPOSAL, fuelPerCycle: 2 });

export const SCARCITY = Object.freeze({
  kind: "scarcity",
  restGain: 10,
  eatCost: 3,
  eatGain: 30,
  rationsStart: 20,
  rationsPerShift: 1,
  workshopPerCycle: 2,
});

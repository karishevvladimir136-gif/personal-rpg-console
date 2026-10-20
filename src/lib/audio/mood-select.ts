// Which mood the soundtrack should play, from what the player can already see:
// the scene kinds and the tension `finish_turn` records on the committed turn
// (public projection), the public encounter state, the world clock and the
// current place. Nothing here reads private state: no ambush music because a
// private note says an ambush is coming. Pure, with a hysteresis reducer so the
// music does not switch on every turn.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { PlaySnapshot, PublicTurn } from "../gameplay/contracts.ts";
import { mood, type MoodId } from "./moods.ts";

export type Tension = "calm" | "tense" | "climax";
export type SceneSignal = {
  /** The id of the committed turn the signal comes from (hysteresis counts distinct turns). */
  turnId: string | null;
  sceneKinds: string[];
  /** The server's reading of the committed turn (`stats.depthTension`). */
  tension: Tension | null;
  /** The DM's own hint for what comes next (`nextTension`) — the DM choosing a track. */
  hint: Tension | null;
  playerMoment: boolean;
  encounterActive: boolean;
  worldMinutes: number | null;
  place: { name: string; description: string } | null;
};

export type PlaceKind = "tavern" | "market" | "town" | "ship" | "wild" | "underground" | "sacred" | "unknown";

// `\b` knows ASCII letters only: a lookbehind on any letter marks the word start for Cyrillic stems too.
const PLACE_WORDS: Record<Exclude<PlaceKind, "unknown">, RegExp> = {
  tavern: /(?<!\p{L})(tavern|inn|pub|bar|saloon|таверн|трактир|кабак|корчм|харчевн|бар(?!\p{L})|паб)/iu,
  market: /(?<!\p{L})(market|bazaar|shop|stall|рынок|рынк|базар|лавк|торг|ярмарк)/iu,
  town: /(?<!\p{L})(city|town|village|street|square|harbou?r|port|district|quarter|город|посёл|посел|деревн|улиц|площад|гаван|порт|квартал|станци|station|stack)/iu,
  ship: /(?<!\p{L})(ship|airship|deck|gondola|vessel|boat|корабл|дирижабл|палуб|гондол|судн|лодк|борт)/iu,
  wild: /(?<!\p{L})(forest|wood|road|field|mountain|hill|desert|swamp|river|lake|sky|cloud|лес|дорог|пол[еяь]|гор[аыа]|холм|пустын|болот|рек[аи]|озер|неб[оа]|облак|пиреней)/iu,
  underground: /(?<!\p{L})(cave|cavern|dungeon|crypt|tunnel|mine|sewer|catacomb|пещер|подземел|склеп|тоннел|туннел|шахт|канализац|катакомб|подземк)/iu,
  sacred: /(?<!\p{L})(temple|church|shrine|chapel|cathedral|храм|церк|святилищ|часовн|собор)/iu,
};

/** The kind of the current place from its public name and description (no stored field exists). */
export function placeKind(place: { name: string; description: string } | null): PlaceKind {
  if (!place) return "unknown";
  // The name first (a «Stack» full of noodle stalls is a town), then the description.
  for (const text of [place.name, place.description])
    for (const kind of ["tavern", "market", "underground", "sacred", "ship", "town", "wild"] as const) if (PLACE_WORDS[kind].test(text)) return kind;
  return "unknown";
}

export function isNight(worldMinutes: number | null) {
  if (worldMinutes === null || !Number.isFinite(worldMinutes)) return false;
  const hour = Math.floor((((worldMinutes % 1440) + 1440) % 1440) / 60);
  return hour < 5 || hour >= 22;
}

const tensionOf = (value: unknown): Tension | null => (value === "calm" || value === "tense" || value === "climax" ? value : null);

/** The last committed turn of the play snapshot (the one the public scene reflects). */
export function latestCommittedTurn(play: Pick<PlaySnapshot, "turns"> | null): PublicTurn | null {
  if (!play) return null;
  for (let i = play.turns.length - 1; i >= 0; i -= 1) if (play.turns[i].status === "committed") return play.turns[i];
  return null;
}

export function signalFromPlay(play: Pick<PlaySnapshot, "turns" | "encounters" | "worldMinutes"> | null, data: Pick<CampaignSnapshot, "locations" | "publicState"> | null): SceneSignal {
  const turn = latestCommittedTurn(play);
  const place = data?.locations.find((row) => row.id === data.publicState.current_location_id) ?? null;
  return {
    turnId: turn?.id ?? null,
    sceneKinds: Array.isArray(turn?.sceneKinds) ? turn.sceneKinds.filter((kind): kind is string => typeof kind === "string") : [],
    tension: tensionOf(turn?.stats?.depthTension),
    hint: tensionOf(turn?.nextTension),
    playerMoment: turn?.playerMoment === true,
    encounterActive: (play?.encounters ?? []).some((row) => row.status === "active"),
    worldMinutes: typeof play?.worldMinutes === "number" ? play.worldMinutes : null,
    place: place ? { name: place.name, description: place.description } : null,
  };
}

export type MoodChoice = { mood: MoodId; reason: string };

/** The mood for a scene signal, by priority: danger first, then what the scene is about, then the place and the hour. */
export function chooseMood(signal: SceneSignal): MoodChoice {
  const kinds = new Set(signal.sceneKinds);
  const has = (kind: string) => kinds.has(kind);
  const tense = signal.tension === "tense" || signal.hint === "tense";
  const climax = signal.tension === "climax" || signal.hint === "climax";
  const place = placeKind(signal.place);
  const night = isNight(signal.worldMinutes);
  if (signal.encounterActive || has("combat")) {
    if (climax || signal.playerMoment) return { mood: "climax", reason: `combat with ${signal.playerMoment ? "the player's moment" : "a climax tension"}` };
    return { mood: "combat", reason: signal.encounterActive ? "an encounter is active" : "a combat scene" };
  }
  if (climax) return { mood: "tension", reason: "a climax tension without a fight" };
  if (has("mystery")) {
    if (tense && (place === "underground" || night)) return { mood: "dread", reason: `a tense mystery ${place === "underground" ? "underground" : "at night"}` };
    return { mood: tense ? "tension" : "mystery", reason: tense ? "a tense mystery" : "a mystery scene" };
  }
  if (tense && (has("conversation") || has("other") || kinds.size === 0)) return { mood: "tension", reason: "a tense conversation" };
  if (has("trade")) return { mood: "trade", reason: "a trade scene" };
  if (has("humor")) return { mood: "humor", reason: "a humour scene" };
  if (has("quiet") && has("conversation")) return { mood: "warm", reason: "a quiet talk with a companion" };
  if (has("quiet")) return night ? { mood: "night", reason: "a quiet scene at night" } : { mood: "quiet", reason: "a quiet scene" };
  if (has("travel")) {
    if (tense) return { mood: "tension", reason: "a tense journey" };
    return night ? { mood: "night", reason: "travelling at night" } : { mood: "travel", reason: "on the road" };
  }
  if (has("exploration")) {
    if (tense) return { mood: "dread", reason: "a tense exploration" };
    return place === "underground" ? { mood: "mystery", reason: "exploring underground" } : { mood: "explore", reason: "an exploration scene" };
  }
  if (has("conversation")) {
    if (place === "tavern") return { mood: "humor", reason: "a conversation in a tavern" };
    if (place === "market") return { mood: "trade", reason: "a conversation at a market" };
    return night ? { mood: "night", reason: "a conversation at night" } : { mood: "warm", reason: "a calm conversation" };
  }
  if (place === "tavern") return { mood: "humor", reason: "a tavern" };
  if (place === "market") return { mood: "trade", reason: "a market" };
  if (place === "town") return night ? { mood: "night", reason: "a town at night" } : { mood: "town", reason: "a town by day" };
  if (place === "underground") return { mood: "mystery", reason: "underground" };
  if (place === "wild" || place === "ship") return night ? { mood: "night", reason: "outdoors at night" } : { mood: "travel", reason: "outdoors" };
  return night ? { mood: "night", reason: "night" } : { mood: "quiet", reason: "nothing in particular" };
}

// ---- hysteresis: a switch needs either an escalation or a candidate that holds ----

export const MIN_DWELL_MS = 90_000;
export const CANDIDATE_TURNS = 2;

export type MoodState = {
  mood: MoodId | null;
  /** When the current mood started (ms). */
  since: number;
  /** The candidate seen on the last signals and on how many distinct turns in a row. */
  candidate: MoodId | null;
  candidateTurns: number;
  lastTurnId: string | null;
};

export const initialMoodState = (): MoodState => ({ mood: null, since: 0, candidate: null, candidateTurns: 0, lastTurnId: null });

export type MoodStep = { state: MoodState; switched: boolean; mood: MoodId | null; reason: string };

/** Apply a signal: escalations (up to a fight, or up by two energy steps) switch at once; anything else
 * waits until the candidate held for two turns or the current mood played its minimum. */
export function stepMood(state: MoodState, choice: MoodChoice, now: number): MoodStep {
  if (state.mood === null) return { state: { mood: choice.mood, since: now, candidate: null, candidateTurns: 0, lastTurnId: state.lastTurnId }, switched: true, mood: choice.mood, reason: `${choice.reason} (first track)` };
  if (choice.mood === state.mood) return { state: { ...state, candidate: null, candidateTurns: 0 }, switched: false, mood: state.mood, reason: `${choice.reason} (unchanged)` };
  const current = mood(state.mood), next = mood(choice.mood);
  // Upward only: a fight or a jump of two steps switches at once; a step down (climax → combat) waits like any other change.
  const escalation = next.energy > current.energy && (next.energy >= 4 || next.energy - current.energy >= 2);
  const candidateTurns = state.candidate === choice.mood ? state.candidateTurns + 1 : 1;
  // Inside a fight (both moods at energy 4+) the dwell rule is off: combat ↔ climax changes only hold after two turns.
  const dwelt = now - state.since >= MIN_DWELL_MS && !(current.energy >= 4 && next.energy >= 4);
  if (escalation || candidateTurns >= CANDIDATE_TURNS || dwelt) {
    const why = escalation ? "escalation, switched at once" : candidateTurns >= CANDIDATE_TURNS ? `held for ${candidateTurns} turns` : "the current mood played its minimum";
    return { state: { mood: choice.mood, since: now, candidate: null, candidateTurns: 0, lastTurnId: state.lastTurnId }, switched: true, mood: choice.mood, reason: `${choice.reason} (${why})` };
  }
  return { state: { ...state, candidate: choice.mood, candidateTurns }, switched: false, mood: state.mood, reason: `${choice.reason} (waiting: ${candidateTurns}/${CANDIDATE_TURNS} turns, ${Math.round((now - state.since) / 1000)} s of ${MIN_DWELL_MS / 1000})` };
}

/** Moods that stand in for one with no track in the pack, nearest feel first. */
export const MOOD_FALLBACKS: Record<MoodId, MoodId[]> = {
  travel: ["explore", "town", "quiet"],
  explore: ["travel", "mystery", "quiet"],
  mystery: ["dread", "tension", "explore"],
  tension: ["mystery", "dread", "combat"],
  combat: ["climax", "tension"],
  climax: ["combat", "tension"],
  quiet: ["warm", "night", "travel"],
  warm: ["quiet", "night"],
  humor: ["town", "trade", "warm"],
  trade: ["town", "humor", "travel"],
  town: ["trade", "travel", "quiet"],
  night: ["quiet", "warm", "mystery"],
  dread: ["mystery", "tension"],
  sorrow: ["quiet", "night", "warm"],
  triumph: ["town", "travel", "explore"],
};

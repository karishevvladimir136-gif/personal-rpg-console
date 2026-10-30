// Play fixes 1 (items 5 and 6): how a player's message ends the session — one module, read by the session loop.
// - The end rule, narrowed (GAME_PLAYER_SAME_WORLD_1's third amendment, also taken by GAME_PLAYER_COMBAT_2): game player
//   1's END_SESSION words count only when what they match names the session or the campaign, or when the whole message
//   is short (40 words or fewer). A narrowing: every end it counts, the old rule counted too. The old rule read lines in
//   the fiction as the player leaving («…and calling it a game», «I stop somewhere I can watch the shell game», «(Out of
//   game: heading back over the bridge…)»).
// - The door (FIX_S4_TABLE ROOM-1): «[END]» ends the session only as the whole of the message's last non-empty line.
//   Anywhere else it is text («I'm not writing [END] today» is not a door).
// frozen.mjs keeps END_SESSION and isEnd as frozen (its design hash is unchanged); the session loop reads this module.
import { END_SESSION } from "./frozen.mjs";
import { wordsIn } from "./measures.mjs";

/** A message of this many words or fewer ends the session on the end words alone. */
export const SHORT_END_WORDS = 40;
const DOOR = /^\[\s*END\s*\]$/i;

/** The door: «[END]» alone on the message's last non-empty line. */
export function isDoor(text) {
  const lines = String(text ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 && DOOR.test(lines.at(-1));
}

/** Whether the player's message ends the session: the door, or the end words that name the session or the campaign, or
 * the end words in a short message. */
export function endsSession(text) {
  if (isDoor(text)) return true;
  const said = String(text ?? "");
  const short = wordsIn(said).length <= SHORT_END_WORDS;
  for (const match of said.matchAll(new RegExp(END_SESSION.source, "gi"))) if (short || /\b(?:session|campaign)\b/i.test(match[0])) return true;
  return false;
}

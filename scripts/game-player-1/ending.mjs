// Play fixes 1 (item 5): how a player's message ends the session — one module, read by the session loop.
// The end rule, narrowed (GAME_PLAYER_SAME_WORLD_1's third amendment, also taken by GAME_PLAYER_COMBAT_2): game player
// 1's END_SESSION words count only when what they match names the session or the campaign, or when the whole message is
// short (40 words or fewer). A narrowing: every end it counts, the old rule counted too. The old rule read lines in the
// fiction as the player leaving («…and calling it a game», «I stop somewhere I can watch the shell game», «(Out of game:
// heading back over the bridge…)»).
// frozen.mjs keeps END_SESSION and isEnd as frozen (its design hash is unchanged); the session loop reads this module.
import { END_SESSION } from "./frozen.mjs";
import { wordsIn } from "./measures.mjs";

/** A message of this many words or fewer ends the session on the end words alone. */
export const SHORT_END_WORDS = 40;

/** Whether the player's message ends the session: the end words that name the session or the campaign, or the end
 * words in a short message. */
export function endsSession(text) {
  const said = String(text ?? "");
  const short = wordsIn(said).length <= SHORT_END_WORDS;
  for (const match of said.matchAll(new RegExp(END_SESSION.source, "gi"))) if (short || /\b(?:session|campaign)\b/i.test(match[0])) return true;
  return false;
}

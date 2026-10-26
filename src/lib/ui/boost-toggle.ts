// FIX_S4 item 6: «⚡ Важный ход» follows the server's flag after each saved turn. The server clears the flag once the
// boosted turn commits (stage 4 §7: `boost_used`, after the commit); the screen must not keep showing it lit, and a
// stale «on» must never hide that the next plain turn will think at the top of the range.
import type { PublicTurn } from "../gameplay/contracts.ts";

/** The depth reason a boosted turn records (`chooseDepth` in dm-loop/depth.ts). */
export const BOOST_USED_REASON = "important turn";

/** What a newly saved turn says about the flag: a boosted turn spent it — off at once, without a read (the server
 * clears it just after the commit, so an early read could still say «on»); any other saved turn — read the server's
 * flag, the truth (a council line that spent it, another tab). A turn not saved (failed, waiting) changes nothing:
 * the flag waits for the turn that commits. */
export function boostAfterTurn(turn: Pick<PublicTurn, "status" | "stats"> | null | undefined): "spent" | "read" | null {
  if (!turn || turn.status !== "committed") return null;
  return turn.stats?.depthReason === BOOST_USED_REASON ? "spent" : "read";
}

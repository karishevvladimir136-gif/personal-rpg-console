// Per-turn limits of the dm-loop-v1 runtime. Stage 3 turns the campaign-level
// ones into campaign settings; until then they live here, generously, so that
// the server guards data integrity rather than plausibility (plan §9).
import { CHARACTER_MODEL_BOUNDS } from "../character-model.ts";

export const dmLoopLimits = {
  /** Model requests per turn. On the last one the model is asked to wrap up
   * without tools; the turn never fails because of this cap. */
  maxModelRequests: 10,
  /** Tool calls per turn. Later calls are rejected with a "wrap up" reason. */
  maxToolCalls: 40,
  /** Dice checks shown to the player per turn (the existing Check DTO allows 8). */
  maxChecksPerTurn: 8,
  /** In-world minutes one turn may advance (one week). */
  maxMinutesPerTurn: 7 * 24 * 60,
  /** Largest single money grant / transfer / spend. */
  maxMoneyPerCall: 1_000_000,
  /** Largest item stack. */
  maxItemQuantity: 100_000,
  /** Largest HP / named resource value. */
  maxResourceValue: 1_000_000,
  maxName: 120,
  maxShortText: 400,
  maxLongText: 4000,
  /** Narration characters per turn (SQL accepts 20000). */
  maxNarrationChars: 12_000,
  /** Model output allowance per request (thinking included on Anthropic). */
  maxOutputTokens: 6000,
  /** Character Model bounds: generous anti-garbage limits only (plan §9, pulled
   * forward in Stage 2b); the identity core stays protected by execute.ts. */
  characterModel: CHARACTER_MODEL_BOUNDS,
  /** Context assembly caps (bytes of UTF-8). */
  context: { canonBytes: 60_000, recentScenes: 16, recentExchanges: 8, characterModelBytes: 24_000 },
} as const;

export type DmLoopLimits = typeof dmLoopLimits;

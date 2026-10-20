// Limits of the dm-loop-v1 runtime (plan §9; stage 3).
//   * `dmLoopLimits` — hard ceilings of one call and of the request assembly.
//     They live in the tool schemas and in SQL and never change per campaign.
//   * `DmLoopTurnLimits` — the per-turn campaign limits: generous defaults
//     here, editable in the campaign's DM settings (rpg_private.dm_settings),
//     pinned into the operation with the model when a turn starts, enforced by
//     the executor per call and re-checked by the SQL commit. The server guards
//     data integrity, not plausibility.
import { CHARACTER_MODEL_BOUNDS } from "../character-model.ts";

export const dmLoopLimits = {
  /** Dice checks shown to the player per turn (the existing Check DTO allows 8). */
  maxChecksPerTurn: 8,
  /** The most in-world minutes any turn may advance (two weeks; the SQL commit's bound). */
  maxMinutesPerTurn: 14 * 24 * 60,
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
  /** Model output allowance per request, thinking included, for every depth (fix run A1, owner: «до
   * предела»; 32 000 is what the 300-second lease allowed at ~95 tokens a second before the heartbeat). */
  maxOutputTokens: 32_000,
  /** Character Model bounds: generous anti-garbage limits only (plan §9, pulled
   * forward in Stage 2b); the identity core stays protected by execute.ts. */
  characterModel: CHARACTER_MODEL_BOUNDS,
  /** Context assembly caps (bytes of UTF-8). */
  context: { canonBytes: 60_000, recentScenes: 16, recentExchanges: 8, characterModelBytes: 24_000 },
} as const;

export type DmLoopLimits = typeof dmLoopLimits;

/** Per-turn campaign limits (campaign settings → pinned per operation). */
export type DmLoopTurnLimits = {
  /** Money created in one turn: grants plus rewards the issuer could not pay. Transfers move money; they create none. */
  moneyPerTurn: number;
  /** Items created in one turn (item create and reward items; splits and transfers create no value). */
  itemsPerTurn: number;
  /** New characters (NPCs and companions) in one turn. */
  charactersPerTurn: number;
  /** In-world minutes one turn may advance in total. */
  minutesPerTurn: number;
  /** Tool calls per turn; later calls are rejected with a "wrap up" reason, the turn never fails for this. */
  toolCallsPerTurn: number;
  /** Model requests per turn; on the last one the model is asked to finish without tools. */
  modelRequestsPerTurn: number;
};

export const DM_LOOP_LIMIT_KEYS = ["moneyPerTurn", "itemsPerTurn", "charactersPerTurn", "minutesPerTurn",
  "toolCallsPerTurn", "modelRequestsPerTurn"] as const satisfies readonly (keyof DmLoopTurnLimits)[];

/** Generous defaults: a campaign without its own limits plays with these. */
export const DM_LOOP_DEFAULT_LIMITS: DmLoopTurnLimits = Object.freeze({
  moneyPerTurn: 1_000_000,
  itemsPerTurn: 50,
  charactersPerTurn: 20,
  minutesPerTurn: 7 * 24 * 60,
  toolCallsPerTurn: 40,
  modelRequestsPerTurn: 10,
});

/** The range a campaign may choose for each limit. Mirrors
 * rpg_private.dm_turn_limits_valid (migration 54); a change needs both. */
export const DM_LOOP_LIMIT_CEILINGS: Record<keyof DmLoopTurnLimits, { min: number; max: number }> = Object.freeze({
  moneyPerTurn: { min: 1, max: 1_000_000 },
  itemsPerTurn: { min: 1, max: 200 },
  charactersPerTurn: { min: 1, max: 100 },
  minutesPerTurn: { min: 1, max: dmLoopLimits.maxMinutesPerTurn },
  toolCallsPerTurn: { min: 1, max: 199 },
  modelRequestsPerTurn: { min: 1, max: 50 },
});

/** Exactly the six limits, each a whole number within its ceiling; throws a RangeError naming the field. */
export function parseDmLoopLimits(value: unknown): DmLoopTurnLimits {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RangeError("limits must be an object");
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v).sort();
  if (keys.join(",") !== [...DM_LOOP_LIMIT_KEYS].sort().join(","))
    throw new RangeError(`limits need exactly ${DM_LOOP_LIMIT_KEYS.join(", ")}`);
  const parsed = {} as DmLoopTurnLimits;
  for (const key of DM_LOOP_LIMIT_KEYS) {
    const bound = DM_LOOP_LIMIT_CEILINGS[key];
    const n = v[key];
    if (typeof n !== "number" || !Number.isInteger(n) || n < bound.min || n > bound.max)
      throw new RangeError(`${key} must be a whole number between ${bound.min} and ${bound.max}`);
    parsed[key] = n;
  }
  return parsed;
}

/** Stored limits (null = defaults) → the effective limits of a turn. */
export function effectiveDmLoopLimits(stored: unknown): DmLoopTurnLimits {
  return stored === null || stored === undefined ? { ...DM_LOOP_DEFAULT_LIMITS } : parseDmLoopLimits(stored);
}

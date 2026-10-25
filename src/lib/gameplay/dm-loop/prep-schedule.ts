// Fixes before session 3 (docs/stages/FIX_S3_PRE.md 2.3, audit row KF-hidden-layer): when the DM's prep writes the
// campaign's hidden layer. The fix run fired it from any /play read — the Settings screen reads /play too, so opening
// Settings to write «Тайны» built the layer before they existed, and it never ran again; a first action sent within
// the prep's ~70 s ran without it. Now: never from the Settings read; once more when the owner saves «Тайны» (they are
// built into the layer, ≈$0.45); a brand-new campaign's first turn waits for the prep — one wait, once. Pure: the
// server module (src/lib/server/hidden-layer-prep.ts) holds the state and runs the call.

export type PrepTrigger = "play" | "settings" | "secrets_saved" | "first_turn";
export type PrepState = {
  /** The campaign already has its layer (known in this process or read from the source). */
  hasLayer: boolean;
  /** A prep of this campaign is running now. */
  running: boolean;
  /** A failed or unreadable prep less than an hour ago (a paid call is not repeated on every poll). */
  failedRecently: boolean;
  /** The first turn already waited once in this process. */
  waitedBefore: boolean;
  /** Committed game turns of the campaign (0: brand new). */
  committedTurns: number;
  /** Game player 2: the campaign plays as a pure simulation — no prep, ever (no hidden layer, no clocks). */
  pureSimulation?: boolean;
};
/** none — nothing to do; background — start a prep off the request's path; rebuild — rewrite the layer with the
 * owner's new «Тайны»; wait — the turn waits for the prep (running, or started now). */
export type PrepDecision = "none" | "background" | "rebuild" | "wait";

export function prepDecision(trigger: PrepTrigger, state: PrepState): PrepDecision {
  if (state.pureSimulation) return "none";
  switch (trigger) {
    case "settings": return "none";
    case "play": return !state.hasLayer && !state.running && !state.failedRecently ? "background" : "none";
    case "secrets_saved": return state.running ? "none" : state.hasLayer ? "rebuild" : "background";
    case "first_turn": return state.committedTurns === 0 && !state.waitedBefore && !state.hasLayer ? "wait" : "none";
  }
}

/** How long a first turn waits for a running prep at most (the prep takes about 70 s). */
export const FIRST_TURN_PREP_WAIT_MS = 150_000;

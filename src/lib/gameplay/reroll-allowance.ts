// Fix S3-pre A-37 / B-5 (the owner's decision of 2026-10-20 18:15): the «Дальше» pause on the hero's shown roll only
// while the player can still do something with it — a reroll the session allows, or the hero's Heroic Inspiration.
// One rule for the server (pausesForPlayer in dm-loop/loop.ts) and its client mirror (the turn's «Ждёт твой бросок»
// in gameplay-turn.tsx); the count is the SQL's own (202609180004: the reroll commands of the session's turns — each
// one raised a check's rollNumber by one). Pure: no server imports.

type RerollSettings = { difficulty?: { rerolls?: string; rerollsPerSession?: number } | null } | null | undefined;
type CountedTurn = { session_id: string | null; checks?: readonly { rollNumber?: number }[] | null };

/** The rerolls the session still allows: null when unlimited, 0 when disabled or spent. */
export function rerollsLeft(settings: RerollSettings, turns: readonly CountedTurn[], sessionId: string | null): number | null {
  const rule = settings?.difficulty?.rerolls;
  if (rule === "unlimited") return null;
  if (rule !== "limited") return 0;
  const allowed = Math.max(0, Number(settings?.difficulty?.rerollsPerSession ?? 0));
  const used = turns.filter((turn) => turn.session_id === sessionId)
    .reduce((sum, turn) => sum + (turn.checks ?? []).reduce((n, check) => n + Math.max(0, Number(check.rollNumber ?? 1) - 1), 0), 0);
  return Math.max(0, allowed - used);
}

/** Whether a shown roll waits for the player: a reroll left, or (the hero's own roll) Heroic Inspiration in hand. */
export function rollPauseAvailable(rerolls: number | null, inspiration: number, heroRoll: boolean): boolean {
  return rerolls === null || rerolls > 0 || (heroRoll && inspiration >= 1);
}

/** The hero's Heroic Inspiration counter (resource heroic_inspiration, one at a time). */
export function heroicInspiration(entity: { resources?: Record<string, unknown> | null } | null | undefined): number {
  return Math.max(0, Number(entity?.resources?.heroic_inspiration ?? 0) || 0);
}

// World-resistance metrics (plan §11, stage task §6), computed from receipts
// and records only — never from the model's own report, except the one
// self-reported flag of finish_turn (an NPC refused the hero this turn). Kept
// per campaign as the private fact "metrics" (running totals) and reported per
// run by the bench. A plausibility judgment belongs to the owner's reading;
// these numbers only make "god simulator" drift visible.
import type { JsonObject } from "../contracts.ts";
import type { DmLoopMeta, DmLoopReceipt } from "./contracts.ts";

export type ResistanceMetrics = {
  schemaVersion: 1;
  turns: number;
  checks: { contested: number; succeeded: number; expectedSuccess: number; nearMisses: number; failed: number };
  fights: { total: number; uncertain: number; wonAtNoCost: number; hpLost: number; won: number };
  refusals: { turns: number };
  streak: { current: number; longest: number };
  /** The encounter in progress, carried between turns. */
  encounter: { id: string | null; hpLost: number; failedChecks: number; partyBelowHalf: boolean };
};

export const EMPTY_METRICS: ResistanceMetrics = { schemaVersion: 1, turns: 0,
  checks: { contested: 0, succeeded: 0, expectedSuccess: 0, nearMisses: 0, failed: 0 },
  fights: { total: 0, uncertain: 0, wonAtNoCost: 0, hpLost: 0, won: 0 }, refusals: { turns: 0 },
  streak: { current: 0, longest: 0 }, encounter: { id: null, hpLost: 0, failedChecks: 0, partyBelowHalf: false } };

export function parseMetrics(privateState: JsonObject): ResistanceMetrics {
  const facts = privateState.fact;
  const raw = facts && typeof facts === "object" && !Array.isArray(facts) ? facts.metrics : undefined;
  if (typeof raw !== "string") return structuredClone(EMPTY_METRICS);
  try {
    const value = JSON.parse(raw);
    return value && value.schemaVersion === 1 ? { ...structuredClone(EMPTY_METRICS), ...value } : structuredClone(EMPTY_METRICS);
  } catch { return structuredClone(EMPTY_METRICS); }
}

/** Probability that a single d20 plus modifier reaches the DC (advantage: the
 * better of two; disadvantage: the worse), clipped to the natural 1 / 20 edge. */
export function expectedSuccess(dc: number, modifier: number, advantage: "normal" | "advantage" | "disadvantage" = "normal"): number {
  const p = Math.min(0.95, Math.max(0.05, (21 - (dc - modifier)) / 20));
  return advantage === "advantage" ? 1 - (1 - p) ** 2 : advantage === "disadvantage" ? p * p : p;
}

export type TurnMetricsSummary = {
  contestedChecks: number; succeeded: number; expectedSuccess: number; nearMisses: number;
  hpLost: number; moneySpent: number; itemsConsumed: number; fightsEnded: number; victoryAtNoCost: boolean; win: boolean; cost: boolean;
};

/** Reads one committed turn's receipts into the running totals. `party` are the
 * names of the hero and companions as the receipts print them. */
export function advanceMetrics(metrics: ResistanceMetrics, receipts: DmLoopReceipt[], meta: DmLoopMeta | null, party: Set<string>,
  partyHp: { hp: number | null; maxHp: number | null }[]): { metrics: ResistanceMetrics; turn: TurnMetricsSummary } {
  const next = structuredClone(metrics);
  const turn: TurnMetricsSummary = { contestedChecks: 0, succeeded: 0, expectedSuccess: 0, nearMisses: 0, hpLost: 0, moneySpent: 0,
    itemsConsumed: 0, fightsEnded: 0, victoryAtNoCost: false, win: false, cost: false };
  next.turns += 1;
  for (const receipt of receipts) {
    if (!receipt.result.ok) continue;
    const value = receipt.result.value as Record<string, unknown>;
    const args = receipt.call.arguments as Record<string, unknown>;
    if (receipt.call.name === "roll" && typeof value.dc === "number" && typeof value.total === "number" && party.has(String(value.actor))) {
      const modifier = typeof value.modifier === "number" ? value.modifier : 0;
      const advantage = (args.advantage as "normal" | "advantage" | "disadvantage" | undefined) ?? "normal";
      turn.contestedChecks += 1;
      turn.expectedSuccess += expectedSuccess(value.dc, modifier, advantage);
      if (value.success === true) { turn.succeeded += 1; turn.win = true; } else { turn.cost = true; next.encounter.failedChecks += next.encounter.id ? 1 : 0; }
      if (Math.abs(value.total - value.dc) <= 1) turn.nearMisses += 1;
    } else if (receipt.call.name === "resource" && value.resource === "hp" && typeof value.before === "number" && typeof value.after === "number" && party.has(String(value.actor))) {
      const lost = Math.max(0, value.before - value.after);
      turn.hpLost += lost;
      if (lost > 0) { turn.cost = true; if (next.encounter.id) next.encounter.hpLost += lost; }
      if (typeof value.max === "number" && value.max > 0 && value.after <= value.max / 2 && next.encounter.id) next.encounter.partyBelowHalf = true;
    } else if (receipt.call.name === "money" && (args.action === "spend" || args.action === "transfer") && party.has(String(value.from))) {
      turn.moneySpent += typeof value.amount === "number" ? value.amount : 0;
      turn.cost = true;
    } else if (receipt.call.name === "item" && args.action === "consume") {
      turn.itemsConsumed += typeof value.consumed === "number" ? value.consumed : 1;
      turn.cost = true;
    } else if (receipt.call.name === "combat" && args.action === "start") {
      next.encounter = { id: String(value.encounterId ?? receipt.id), hpLost: 0, failedChecks: 0, partyBelowHalf: false };
      next.fights.total += 1;
    } else if (receipt.call.name === "combat" && args.action === "end") {
      turn.fightsEnded += 1;
      const victory = value.outcome === "victory" || value.outcome === "objective-completion";
      if (victory) { next.fights.won += 1; turn.win = true; }
      const uncertain = next.encounter.failedChecks > 0 || next.encounter.partyBelowHalf || !victory;
      if (uncertain) next.fights.uncertain += 1;
      next.fights.hpLost += next.encounter.hpLost;
      if (victory && next.encounter.hpLost === 0 && next.encounter.failedChecks === 0) { next.fights.wonAtNoCost += 1; turn.victoryAtNoCost = true; }
      next.encounter = { id: null, hpLost: 0, failedChecks: 0, partyBelowHalf: false };
    } else if (receipt.call.name === "quest" && args.action === "claim_reward") {
      turn.win = true;
    }
  }
  void partyHp;
  next.checks.contested += turn.contestedChecks;
  next.checks.succeeded += turn.succeeded;
  next.checks.failed += turn.contestedChecks - turn.succeeded;
  next.checks.expectedSuccess += turn.expectedSuccess;
  next.checks.nearMisses += turn.nearMisses;
  if (meta?.npcRefused) next.refusals.turns += 1;
  if (turn.win && !turn.cost) { next.streak.current += 1; next.streak.longest = Math.max(next.streak.longest, next.streak.current); }
  else if (turn.cost) next.streak.current = 0;
  return { metrics: next, turn };
}

export const serializeMetrics = (metrics: ResistanceMetrics) => JSON.stringify(metrics);

/** Rates for a report: null where nothing was measured yet. */
export function metricsReport(metrics: ResistanceMetrics) {
  const rate = (a: number, b: number) => (b > 0 ? Number((a / b).toFixed(3)) : null);
  return {
    turns: metrics.turns,
    checkSuccessRate: rate(metrics.checks.succeeded, metrics.checks.contested),
    checkSuccessExpected: rate(metrics.checks.expectedSuccess, metrics.checks.contested),
    nearMissRate: rate(metrics.checks.nearMisses, metrics.checks.contested),
    npcRefusalRate: rate(metrics.refusals.turns, metrics.turns),
    unearnedWinStreakLongest: metrics.streak.longest,
    fights: metrics.fights.total,
    fightsUncertainShare: rate(metrics.fights.uncertain, metrics.fights.total),
    fightsWonAtNoCost: metrics.fights.wonAtNoCost,
    hpLostPerFight: metrics.fights.total ? Number((metrics.fights.hpLost / metrics.fights.total).toFixed(2)) : null,
  };
}

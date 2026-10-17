import { createHash, randomInt } from "node:crypto";
import type { VisibleCheck } from "./contracts.ts";
import type {
  CheckProposal,
  RecordedCheck,
  RuntimeSource,
} from "./server-contracts.ts";
import { requireRule } from "./turn-errors.ts";

/** Deterministic identifiers; randomness belongs only to recorded dice values. */
export function stableGameplayId(operationId: string, key: string): string {
  const hex = createHash("sha256")
    .update(`rpg-v1:${operationId}:${key}`)
    .digest("hex")
    .slice(0, 32)
    .split("");
  hex[12] = "5";
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  const h = hex.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function recordServerRoll(
  operationId: string,
  proposal: CheckProposal,
  modifier: number,
  rollNumber = 1,
  random: (min: number, max: number) => number = randomInt,
): RecordedCheck {
  requireRule(
    Number.isInteger(modifier) && modifier >= -100 && modifier <= 100,
  );
  const dice = Array.from(
    { length: proposal.advantage === "normal" ? 1 : 2 },
    () => random(1, 21),
  );
  requireRule(
    dice.every((die) => Number.isInteger(die) && die >= 1 && die <= 20),
  );
  const kept =
    proposal.advantage === "disadvantage"
      ? Math.min(...dice)
      : Math.max(...dice);
  return {
    ...proposal,
    id: stableGameplayId(operationId, `check:${proposal.index}`),
    dice,
    kept,
    modifier,
    total: kept + modifier,
    success: kept + modifier >= proposal.dc,
    rollNumber,
  };
}

export function isDisplayedCheck(
  source: RuntimeSource,
  check: CheckProposal,
): boolean {
  const settings = source.snapshot.settings.values;
  return (
    check.visibility === "player" &&
    (source.runtime.configuration?.controlledEntityIds.includes(
      check.actorId,
    ) ??
      false) &&
    settings.dicePresentation !== "hidden" &&
    (settings.dicePresentation === "all-player-rolls" || check.important)
  );
}

/** Explicit projection: internal check fields/targets and hidden-roll counts never cross this boundary. */
export function visibleChecks(
  source: RuntimeSource,
  checks: RecordedCheck[],
  canReroll = false,
): VisibleCheck[] {
  const settings = source.snapshot.settings.values;
  return checks
    .filter((check) => isDisplayedCheck(source, check))
    .map((check) => {
      const actor = source.snapshot.entities.find(
        (entity) =>
          entity.id === check.actorId &&
          entity.campaign_id === source.snapshot.campaign.id,
      );
      requireRule(actor);
      return {
        id: check.id,
        kind: check.kind,
        actorId: actor.id,
        actorName: actor.name,
        dice: [...check.dice],
        kept: check.kept,
        modifier: check.modifier,
        total: check.total,
        success: check.success,
        dc: settings.showDc && check.dcPublic ? check.dc : null,
        advantage: check.advantage,
        interactive: settings.interactiveDice,
        canReroll: canReroll && settings.difficulty.rerolls !== "disabled",
        rollNumber: check.rollNumber,
        ...(check.reason !== undefined ? { reason: check.reason } : {}),
        ...(check.bonuses !== undefined ? { bonuses: check.bonuses } : {}),
        ...(check.advantageReason !== undefined ? { advantageReason: check.advantageReason } : {}),
        ...(check.difficulty !== undefined ? { difficulty: check.difficulty } : {}),
        ...(check.natural !== undefined ? { natural: check.natural } : {}),
      };
    });
}

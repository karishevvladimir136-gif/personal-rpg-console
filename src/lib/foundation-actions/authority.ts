import { isDeepStrictEqual } from "node:util";
import { merchantAuthority, playerAuthority } from "../commerce/context.ts";
import {
  COMMERCE_LIMITS,
  definitionId,
  integer,
  text,
  uuid,
} from "../commerce/validation.ts";
import type { LoopContext } from "../foundation-loop/contracts.ts";
import type { RecordedCheck } from "../gameplay/server-contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import { LEGACY_RULESET_REF, WORLD_LOGIC_REF } from "../rulesets/profiles.ts";
import type {
  FoundationActionAuthorization,
  TransferAction,
} from "./contracts.ts";
import { requireAction } from "./validation.ts";

export function foundationHaggleCapability(merchantActorId: string): string {
  return `foundation.haggle:${uuid(merchantActorId)}`;
}
export function foundationMerchantUnavailableCapability(
  merchantActorId: string,
): string {
  return `foundation.merchant.unavailable:${uuid(merchantActorId)}`;
}
export function foundationTransferCapability(
  action: TransferAction,
  kind: "item" | "currency",
  merchantActorId: string,
  recordId: string,
  maximum: number,
): string {
  requireAction(action === "theft" || action === "robbery");
  requireAction(kind === "item" || kind === "currency");
  const record = kind === "item" ? uuid(recordId) : definitionId(recordId);
  return `foundation.${action}.${kind}:${uuid(merchantActorId)}:${record}:${integer(maximum, 1, kind === "item" ? COMMERCE_LIMITS.quantity : COMMERCE_LIMITS.balance)}`;
}

export function actionProfile(
  context: LoopContext,
): FoundationActionAuthorization["profile"] {
  if (isDeepStrictEqual(context.state.profile, WORLD_LOGIC_REF))
    return "world_logic";
  requireAction(isDeepStrictEqual(context.state.profile, LEGACY_RULESET_REF));
  return "console_basic";
}

/** Preparation is already public/current by its owning validator. Retain its
 * exact pin here: a removed/rebound Pack cannot leave a working authority token. */
function requireCurrentOrigin(context: LoopContext, entityId: string): void {
  for (const origin of context.state.preparations.filter(
    (p) => p.entityId === entityId || p.actorId === entityId,
  )) {
    const binding = context.foundation.bindings.find(
      (b) => b.id === origin.bindingId,
    );
    requireAction(
      binding &&
        binding.ownerId === context.foundation.ownerId &&
        binding.campaignId === context.foundation.campaignId &&
        binding.packVersionId === origin.packVersionId &&
        origin.entityId === entityId &&
        origin.actorId === entityId &&
        binding.mappings.some(
          (m) =>
            m.entityId === entityId && m.packEntityId === origin.packEntityId,
        ) &&
        origin.sourceVersionIds.every((id) =>
          binding.sourceVersionIds.includes(id),
        ),
      "conflict",
    );
  }
}

export function actionPlayer(context: LoopContext, actorId: string) {
  const player = playerAuthority(context, actorId);
  requireCurrentOrigin(context, player.entity.id);
  requireAction(
    context.snapshot.locations.some(
      (l) =>
        l.id === player.actor.locationId &&
        ["known", "visited"].includes(l.status),
    ),
  );
  return player;
}

export function actionMerchant(
  context: LoopContext,
  merchantId: string,
  actorId: string,
) {
  actionPlayer(context, actorId);
  const authority = merchantAuthority(context, merchantId, actorId);
  requireCurrentOrigin(context, authority.entity.id);
  // Even inconsistent imported control flags cannot make a PC into a theft target.
  requireAction(
    authority.entity.kind !== "player" &&
      authority.actor.control === "autonomous",
  );
  return authority;
}

export function validateActionAuthorization(
  context: LoopContext,
  authorization: FoundationActionAuthorization,
  input: string,
  actorId: string,
) {
  requireAction(
    authorization.input === input && authorization.actorId === actorId,
    "conflict",
  );
  text(authorization.input, 20000);
  requireAction(authorization.profile === actionProfile(context));
  requireAction(authorization.uncertainty === "resolved", "uncertainty");
  requireAction(["completed", "blocked"].includes(authorization.outcome));
  requireAction(
    Array.isArray(authorization.checks) && authorization.checks.length <= 8,
  );
  requireAction(
    Array.isArray(authorization.capabilities) &&
      authorization.capabilities.length <= 100 &&
      new Set(authorization.capabilities).size ===
        authorization.capabilities.length,
  );
  const player = actionPlayer(context, actorId);
  requireAction(
    authorization.capabilities.every(
      (capability) =>
        typeof capability === "string" &&
        player.actor.capabilities.includes(capability),
    ),
  );
  if (authorization.profile === "world_logic")
    requireAction(authorization.checks.length === 0);
  return player;
}

export function requireCapability(
  context: LoopContext,
  authorization: FoundationActionAuthorization,
  capability: string,
) {
  requireAction(
    authorization.capabilities.includes(capability) &&
      actionPlayer(context, authorization.actorId).actor.capabilities.includes(
        capability,
      ),
  );
}

/** The store, not the provider, supplies RecordedCheck[]. Rechecking its exact
 * operation identity and arithmetic prevents accidental use of another actor's,
 * target's, old attempt's, or private detection roll. */
export function actionSucceeded(
  command: FoundationCommand,
  authorization: FoundationActionAuthorization,
  merchantActorId: string,
  checkIndex: number | null,
): boolean {
  if (authorization.profile === "world_logic") {
    requireAction(checkIndex === null);
    return authorization.outcome === "completed";
  }
  requireAction(checkIndex !== null);
  requireAction(
    new Set(authorization.checks.map((c) => c.index)).size ===
      authorization.checks.length &&
      new Set(authorization.checks.map((c) => c.id)).size ===
        authorization.checks.length,
  );
  const check = authorization.checks.find((c) => c.index === checkIndex);
  requireAction(
    check &&
      check.id ===
        stableGameplayId(command.operationId, `check:${checkIndex}`) &&
      check.actorId === authorization.actorId &&
      check.targetId === merchantActorId &&
      check.kind === "skill" &&
      check.stat === "skill" &&
      check.visibility === "player" &&
      check.uncertainty === "meaningful",
  );
  validateRecordedCheck(check);
  requireAction(
    authorization.outcome === (check.success ? "completed" : "blocked"),
  );
  return check.success;
}

function validateRecordedCheck(check: RecordedCheck) {
  integer(check.dc, 1, 40);
  integer(check.modifier, -100, 100);
  integer(check.rollNumber, 1);
  requireAction(
    ["normal", "advantage", "disadvantage"].includes(check.advantage),
  );
  requireAction(
    Array.isArray(check.dice) &&
      check.dice.length === (check.advantage === "normal" ? 1 : 2),
  );
  check.dice.forEach((die) => integer(die, 1, 20));
  const kept =
    check.advantage === "disadvantage"
      ? Math.min(...check.dice)
      : Math.max(...check.dice);
  requireAction(
    check.kept === kept &&
      check.total === kept + check.modifier &&
      check.success === check.total >= check.dc,
  );
}

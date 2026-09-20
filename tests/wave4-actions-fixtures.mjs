import {
  fixture as commerceFixture,
  id,
  commandFor,
  applyPlan,
} from "./wave4-commerce-fixtures.mjs";
import { recordServerRoll } from "../src/lib/gameplay/dice.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import {
  foundationHaggleCapability,
  foundationTransferCapability,
} from "../src/lib/foundation-actions/index.ts";
export { id, commandFor, applyPlan };

export function fixture(action = "theft", profile = "console_basic") {
  const { context, command, intent } = commerceFixture();
  const input =
    action === "quote"
      ? "What would two lanterns cost?"
      : action === "trade"
        ? "Buy two lanterns for 40 credits."
        : action === "haggle"
          ? "I negotiate better terms with the merchant."
          : action === "theft"
            ? "I try to steal two lanterns from the merchant."
            : "I try to rob the merchant of two lanterns and 30 credits.";
  const proposal =
    action === "quote" || action === "trade"
      ? {
          schemaVersion: 1,
          action,
          input,
          intent,
          expectedPayment: action === "trade" ? 40 : null,
        }
      : {
          schemaVersion: 1,
          action,
          input,
          merchantActorId: id("enemy"),
          playerEntityId: id("player"),
          checkIndex: profile === "console_basic" ? 0 : null,
          ...(action === "haggle"
            ? {}
            : {
                take: [{ itemId: id("stock"), quantity: 2 }],
                currency:
                  action === "robbery"
                    ? { currencyId: "credits", amount: 30 }
                    : null,
                merchantUnavailable: false,
              }),
        };
  const authorization = {
    input,
    actorId: id("player"),
    profile,
    checks: [],
    outcome: "completed",
    uncertainty: "resolved",
    capabilities: [],
  };
  if (profile === "world_logic") {
    context.foundation.ruleset = structuredClone(WORLD_LOGIC_REF);
    context.state.profile = structuredClone(WORLD_LOGIC_REF);
    context.snapshot.entities.forEach((entity) => {
      entity.hp = null;
      entity.max_hp = null;
    });
    if (action === "haggle")
      authorization.capabilities.push(foundationHaggleCapability(id("enemy")));
    if (action === "theft" || action === "robbery") {
      authorization.capabilities.push(
        foundationTransferCapability(
          action,
          "item",
          id("enemy"),
          id("stock"),
          2,
        ),
      );
      if (action === "robbery")
        authorization.capabilities.push(
          foundationTransferCapability(
            action,
            "currency",
            id("enemy"),
            "credits",
            30,
          ),
        );
    }
    context.world.actors.find(
      (actor) => actor.id === id("player"),
    ).capabilities = [...authorization.capabilities];
  } else if (!["quote", "trade"].includes(action)) {
    authorization.checks.push(
      recordServerRoll(
        command.operationId,
        {
          index: 0,
          actorId: id("player"),
          targetId: id("enemy"),
          kind: "skill",
          stat: "skill",
          dc: 12,
          dcPublic: false,
          visibility: "player",
          important: true,
          uncertainty: "meaningful",
          advantage: "normal",
        },
        2,
        1,
        () => 15,
      ),
    );
  }
  return { context, command, proposal, authorization };
}

export function failCheck(fixture) {
  fixture.authorization.checks = [
    recordServerRoll(
      fixture.command.operationId,
      fixture.authorization.checks[0],
      2,
      1,
      () => 2,
    ),
  ];
  fixture.authorization.outcome = "blocked";
}

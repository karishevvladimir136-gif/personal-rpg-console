import { readFrozenAdventureFixture } from "../test-fixtures/adventures/harness.mjs";
import { commandFor, applyPlan } from "./wave4-commerce-fixtures.mjs";
import { recordServerRoll } from "../src/lib/gameplay/dice.ts";
import { readLootObject } from "../src/lib/adventure-loot/state.ts";
export { commandFor, applyPlan };
export const fixture = (family = "merchant-vault") =>
  readFrozenAdventureFixture(family);
export function resolve(
  context,
  command,
  actorId,
  objectId,
  approachId = null,
  die = 20,
) {
  const version = readLootObject(context, objectId);
  const requirement = approachId
    ? version.policy.approaches.find((r) => r.id === approachId).check
    : version.policy.discoveryCheck;
  const entity = context.snapshot.entities.find((e) => e.id === actorId);
  const checks = requirement
    ? [
        recordServerRoll(
          command.operationId,
          {
            ...requirement,
            actorId,
            targetId: objectId,
            kind: requirement.stat,
            dcPublic: true,
            visibility: "player",
            important: true,
            uncertainty: "meaningful",
            advantage: "normal",
          },
          entity.stats[requirement.stat],
          1,
          () => die,
        ),
      ]
    : [];
  return { policy: version.policy, checks };
}

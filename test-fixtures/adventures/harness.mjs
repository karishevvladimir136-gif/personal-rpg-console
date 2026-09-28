import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { validateCommerceContext } from "../../src/lib/commerce/context.ts";
import { readLootObject } from "../../src/lib/adventure-loot/state.ts";
import { parseRewardIntegrityPolicy } from "../../src/lib/progression/reward-integrity.ts";
const root = new URL("./v1/", import.meta.url);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Trusted offline fixture loader for the normal acceptance adapter. Complete
 * authority is server-only; never pass this object directly to a model/client.
 * The caller owns normal campaign initialization, TurnStore, saves and teardown. */
export function readFrozenAdventureFixture(family) {
  const manifest = JSON.parse(
    readFileSync(new URL("manifest.json", root), "utf8"),
  );
  const entry = manifest.entries.find((entry) => entry.family === family);
  if (
    !entry ||
    !["letter-low", "letter-high", "merchant-vault"].includes(family)
  )
    throw new Error("Unknown adventure family.");
  const bytes = readFileSync(new URL(entry.file, root));
  if (
    digest(bytes) !== entry.sha256 ||
    digest(readFileSync(new URL("world-basis.json", root))) !==
      manifest.immutableWorld.digest
  )
    throw new Error("Frozen adventure authority changed.");
  const fixture = JSON.parse(bytes);
  if (
    !isDeepStrictEqual(fixture.immutableWorld, manifest.immutableWorld) ||
    fixture.family !== family ||
    fixture.evaluation.providerCallsAllowed !== 0 ||
    fixture.evaluation.attemptsUsed !== 0
  )
    throw new Error("Adventure envelope requires review.");
  validateCommerceContext(fixture.context);
  for (const objectId of [
    fixture.references.objectId,
    fixture.references.unspecifiedObjectId,
  ])
    if (!readLootObject(fixture.context, objectId))
      throw new Error("Missing trusted object authority.");
  parseRewardIntegrityPolicy(fixture.rewardIntegrity);
  return fixture;
}

// BEDROCK_PROVIDER_1: the scripts' side of src/lib/server/anthropic-endpoint.ts (the door, the ids and the error
// mapping live there once). The door, the region and the keys come from .env.local, else from the cloud's APP_
// variables (keys.mjs: the shell's own names are never read). The door's name and region — never a key — are copied
// into process.env, so the app code a harness runs in-process (the DM loop, the in-turn checks) takes the same door;
// the key is always passed explicitly.
import { anthropicDoorOf, anthropicEndpoint } from "../../../src/lib/server/anthropic-endpoint.ts";
import { providerKey } from "./keys.mjs";

export { anthropicEndpoint, anthropicDoorOf, anthropicRequestId, anthropicErrorCode, bedrockFailureKind, appModelId, ANTHROPIC_VERSION }
  from "../../../src/lib/server/anthropic-endpoint.ts";

/** The door's environment from a key reader (providerKey by default): the provider, the region and only the door's key. */
export function scriptDoorEnv(read = providerKey) {
  const provider = (read("ANTHROPIC_PROVIDER") ?? "anthropic").trim().toLowerCase() || "anthropic";
  const region = read("AWS_REGION") ?? "";
  const keyName = provider === "bedrock" ? "BEDROCK_API_KEY" : "ANTHROPIC_API_KEY";
  return { ANTHROPIC_PROVIDER: provider, AWS_REGION: region, [keyName]: read(keyName) ?? "" };
}

/** The scripts' door (throws `not_configured` like the app's); the door's name and region are synced into process.env. */
export function scriptAnthropicEndpoint(read = providerKey) {
  const env = scriptDoorEnv(read);
  process.env.ANTHROPIC_PROVIDER = env.ANTHROPIC_PROVIDER;
  if (env.AWS_REGION) process.env.AWS_REGION = env.AWS_REGION;
  else delete process.env.AWS_REGION;
  return anthropicEndpoint(env);
}

/** The door's key for a script (null when unset or the door is not configured); never printed by the caller. */
export function anthropicKey(read = providerKey) {
  try { return scriptAnthropicEndpoint(read).apiKey || null; } catch { return null; }
}

/** The name of the door's key, for a message (BEDROCK_API_KEY or ANTHROPIC_API_KEY). */
export function anthropicKeyName(read = providerKey) {
  return scriptDoorEnv(read).ANTHROPIC_PROVIDER === "bedrock" ? "BEDROCK_API_KEY" : "ANTHROPIC_API_KEY";
}

/** The door of one call line: the URL it went to (another provider keeps its own name and host). */
export function callProvenance(providerId, url) {
  return (providerId === "anthropic" ? anthropicDoorOf(url) : null) ?? { provider: providerId, endpointHost: new URL(url).host };
}

/** The provenance a ledger line or run record carries (BEDROCK_PROVIDER_1 §4). */
export function provenance(door = scriptAnthropicEndpoint()) {
  return { provider: door.provider, endpointHost: door.endpointHost };
}

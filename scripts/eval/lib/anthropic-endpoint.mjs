// ANTHROPIC_PROVIDERS_1: the scripts' side of src/lib/server/anthropic-endpoint.ts (the door, the ids and the error
// mapping live there once). The door, the region and the keys come from .env.local, else from the cloud's APP_
// variables (keys.mjs: the shell's own names are never read). The door's name and region — never a key — are copied
// into process.env, so the app code a harness runs in-process (the DM loop, the in-turn checks) takes the same door;
// the key is always passed explicitly.
import { anthropicDoorOf, anthropicEndpoint, anthropicKeyNameFor, anthropicProvider, appModelId, servedOf }
  from "../../../src/lib/server/anthropic-endpoint.ts";
import { providerKey } from "./keys.mjs";

export { anthropicEndpoint, anthropicDoorOf, anthropicRequestId, anthropicErrorCode, bedrockFailureKind, doorFailure, appModelId,
  servedOf, ANTHROPIC_VERSION } from "../../../src/lib/server/anthropic-endpoint.ts";

function doorName(read) {
  return (read("ANTHROPIC_PROVIDER") ?? "anthropic").trim().toLowerCase() || "anthropic";
}

/** The door's environment from a key reader (providerKey by default): the provider, the region and only the door's key. */
export function scriptDoorEnv(read = providerKey) {
  const provider = doorName(read);
  const region = read("AWS_REGION") ?? "";
  let keyName = "ANTHROPIC_API_KEY";
  try { keyName = anthropicKeyNameFor(anthropicProvider({ ANTHROPIC_PROVIDER: provider })); } catch { /* the endpoint names it */ }
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

/** The name of the door's key, for a message (ANTHROPIC_API_KEY, BEDROCK_API_KEY or OPENROUTER_API_KEY). */
export function anthropicKeyName(read = providerKey) {
  try { return anthropicKeyNameFor(anthropicProvider({ ANTHROPIC_PROVIDER: doorName(read) })); } catch { return "ANTHROPIC_API_KEY"; }
}

/** The door of one call line: the URL it went to (another provider keeps its own name and host). */
export function callProvenance(providerId, url) {
  return (providerId === "anthropic" ? anthropicDoorOf(url) : null) ?? { provider: providerId, endpointHost: new URL(url).host };
}

/** The provenance a ledger line or run record carries (ANTHROPIC_PROVIDERS_1 §4). */
export function provenance(door = scriptAnthropicEndpoint()) {
  return { provider: door.provider, endpointHost: door.endpointHost };
}

/**
 * ANTHROPIC_PROVIDERS_1 §4: who served a call, read from a clone of its response so the caller's own reading is
 * untouched — a JSON reply's `model`/`provider`/`id`, or a stream's `message_start` (the reader stops there). Fills
 * `servedModel` (the app's id), `upstream` (OpenRouter's routed provider, when the reply names it), `messageId` and
 * `servedModelMatches` (served = requested) into `line`. Never throws; a reply that says nothing leaves nulls.
 */
export async function recordServed(response, requestedModel, line) {
  Object.assign(line, { servedModel: null, upstream: null, messageId: null, servedModelMatches: null });
  if (!response.ok || !response.body) return line;
  try {
    const type = response.headers.get("content-type") ?? "";
    let message = null;
    if (type.includes("text/event-stream")) message = await firstStreamMessage(response.clone().body);
    else message = await response.clone().json();
    const served = servedOf(message);
    const requested = typeof requestedModel === "string" ? appModelId(requestedModel) : null;
    Object.assign(line, served, { servedModelMatches: served.servedModel && requested ? served.servedModel === requested : null });
  } catch { /* the call's own reading reports a broken reply */ }
  return line;
}

async function firstStreamMessage(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (let read = 0; read < 64; read++) {
      const { value, done } = await reader.read();
      if (done) return null;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n");
      for (const block of buffer.split("\n\n").slice(0, -1)) {
        const data = block.split("\n").filter((entry) => entry.startsWith("data:")).map((entry) => entry.slice(5).trim()).join("\n");
        if (!data) continue;
        const event = JSON.parse(data);
        if (event?.type === "message_start") return event.message ?? null;
      }
    }
    return null;
  } finally {
    reader.cancel().catch(() => {});
  }
}

/** The model a request body names (the door's id), for the served-model check. */
export function requestedModelOf(init) {
  try { return JSON.parse(String(init?.body ?? "{}")).model ?? null; } catch { return null; }
}

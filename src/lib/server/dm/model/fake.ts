// A DM model that never contacts a provider: the sandbox plays on it when the
// owner has no API keys at hand (docs/SANDBOX.md). It narrates from the
// player's last message and ends the turn with one finish_turn call, so the
// real dm-loop-v1 path (tools, receipts, commit) runs end to end. Only the
// development server honours RPG_DM_FAKE_MODEL=1; production ignores it.
import type { DmModel, DmModelEvent, DmModelRequest } from "./contracts.ts";

const OPENERS = [
  "The room holds its breath for a moment.",
  "Wind moves through the rafters.",
  "Somewhere a door closes.",
  "The light shifts; the moment settles.",
];

function lastPlayerText(request: DmModelRequest) {
  for (let index = request.messages.length - 1; index >= 0; index--) {
    const message = request.messages[index];
    if (message.role === "user") return message.text.trim();
  }
  return "";
}

export function fakeDmModelEnabled(environment: NodeJS.ProcessEnv = process.env) {
  return environment.NODE_ENV !== "production" && environment.RPG_DM_FAKE_MODEL === "1";
}

export function createFakeDmModel(selection: { providerId: string; modelId: string }): DmModel {
  let calls = 0, streams = 0;
  async function* stream(request: DmModelRequest): AsyncGenerator<DmModelEvent> {
    const said = lastPlayerText(request).replace(/\s+/g, " ").slice(0, 160);
    const opener = OPENERS[streams++ % OPENERS.length];
    const hasFinish = request.toolset?.tools.some((tool) => tool.name === "finish_turn") ?? false;
    const text = hasFinish
      ? `${opener} ${said ? `You said: «${said}». ` : ""}The world answers plainly — this is the sandbox game master, a stand-in that keeps the loop turning without a model. What do you do next?`
      : `{"recap":"Sandbox digest: the session was played on the stand-in game master.","title":"Sandbox session","notebook":"","plans":[]}`;
    for (let at = 0; at < text.length; at += 24) yield { type: "text_delta", text: text.slice(at, at + 24) };
    const toolCalls = hasFinish ? [{ id: `fake_${++calls}`, name: "finish_turn",
      arguments: JSON.stringify({ sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" }) }] : [];
    for (const call of toolCalls) yield { type: "tool_call", ...call };
    yield { type: "usage", usage: { inputTokens: 0, outputTokens: Math.ceil(text.length / 4), cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: 0 } };
    yield { type: "stop", reason: toolCalls.length ? "tool_use" : "end", providerReason: "fake", native: { providerId: selection.providerId as DmModel["providerId"], modelId: selection.modelId, items: [] } };
  }
  return { providerId: selection.providerId as DmModel["providerId"], modelId: selection.modelId, stream };
}

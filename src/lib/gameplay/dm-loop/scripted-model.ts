// A DmModel that replays scripted events: text deltas, tool calls, stop
// reasons, and deliberate failures. The bench and tests drive the real
// dm-loop-v1 path with it; no provider is contacted.
import type { JsonObject } from "../contracts.ts";
import { DmModelError, type DmModel, type DmModelEvent, type DmModelRequest, type DmStopReason,
  type DmUsage } from "../../server/dm/model/contracts.ts";

export type ScriptedToolCall = { name: string; arguments: JsonObject };
export type ScriptedRound = {
  text?: string;
  toolCalls?: ScriptedToolCall[];
  stop?: DmStopReason;
  /** Throw before any event (a dropped connection): the turn fails retryable. */
  failBefore?: "transport" | "rejected";
  /** Throw after the text was streamed (a broken stream mid-request). */
  failAfterText?: boolean;
  usage?: Partial<DmUsage>;
};

export type ScriptedDmModel = DmModel & {
  requests: DmModelRequest[];
  rounds: ScriptedRound[];
  /** Replace the remaining script (the bench prepares one per turn). */
  prepare(rounds: ScriptedRound[]): void;
  readonly exhausted: boolean;
};

const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;

export function createScriptedDmModel(initial: ScriptedRound[] = [],
  options: { providerId?: "openai" | "anthropic"; modelId?: string; chunk?: number } = {}): ScriptedDmModel {
  const providerId = options.providerId ?? "openai";
  const modelId = options.modelId ?? "scripted-dm";
  const chunk = options.chunk ?? 12;
  let rounds = [...initial];
  let calls = 0;
  const requests: DmModelRequest[] = [];
  async function* stream(request: DmModelRequest): AsyncGenerator<DmModelEvent> {
    requests.push(request);
    const round = rounds.shift();
    if (!round) throw new DmModelError("provider_rejected", "the script has no answer left for this request");
    if (round.failBefore === "transport") throw new DmModelError("retryable_transport", "scripted connection loss");
    if (round.failBefore === "rejected") throw new DmModelError("provider_rejected", "scripted rejection");
    const text = round.text ?? "";
    for (let at = 0; at < text.length; at += chunk) yield { type: "text_delta", text: text.slice(at, at + chunk) };
    if (round.failAfterText) throw new DmModelError("retryable_transport", "scripted stream break after text");
    const toolCalls = (round.toolCalls ?? []).map((call) => ({ id: `call_${++calls}`, name: call.name, arguments: JSON.stringify(call.arguments) }));
    for (const call of toolCalls) yield { type: "tool_call", ...call };
    const inputTokens = Math.ceil(bytes(request.system) / 4 + bytes(request.messages) / 4);
    const outputTokens = Math.ceil((text.length + bytes(toolCalls)) / 4);
    yield { type: "usage", usage: { inputTokens, outputTokens, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: 0, ...round.usage } };
    const reason: DmStopReason = round.stop ?? (toolCalls.length ? "tool_use" : "end");
    yield { type: "stop", reason, providerReason: reason, native: { providerId, modelId, items: [
      ...(text ? [{ type: "text", text }] : []),
      ...toolCalls.map((call) => ({ type: "tool_use", id: call.id, name: call.name, input: JSON.parse(call.arguments) })),
    ] } };
  }
  return {
    providerId, modelId, requests, stream,
    get rounds() { return rounds; },
    prepare(next) { rounds = [...next]; },
    get exhausted() { return rounds.length === 0; },
  };
}

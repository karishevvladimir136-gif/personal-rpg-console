// Game player 1: the four players and the one call they share. The provider layer is X1's
// (scripts/persona-emotions/providers.mjs, landed on origin/claude/persona-self-talk-x1 before this run): one message
// list in, one text out, the usage, the request id and the response id recorded; Anthropic Messages for Opus and
// Fable, OpenAI Responses for Astra and Sol (store: false, no reasoning summaries — only the visible text comes back).
// «Effort medium» is `output_config.effort: medium` on Anthropic and `reasoning.effort: medium` on OpenAI.
import { anthropicMessages, openaiResponses } from "../persona-emotions/providers.mjs";
import { EFFORT } from "./frozen.mjs";

export const PLAYERS = {
  opus: { name: "opus", label: "Claude Opus 5.5", family: "Anthropic", provider: "anthropic", model: "claude-opus-5-5" },
  fable: { name: "fable", label: "Claude Fable 5.1", family: "Anthropic", provider: "anthropic", model: "claude-fable-5-1" },
  astra: { name: "astra", label: "GPT-6 Astra", family: "OpenAI", provider: "openai", model: "gpt-6-astra" },
  sol: { name: "sol", label: "GPT-6.1 Sol", family: "OpenAI", provider: "openai", model: "gpt-6.1-sol" },
};
export const PLAYER_MAX_TOKENS = 8000;
const CONSOLE_MESSAGES = "https://api.anthropic.com/v1/messages";

/** ANTHROPIC_PROVIDERS_1: a Claude call through the door the run uses. X1's layer addresses the Console; on another door
 * (`keys.door`, the app's own endpoint object: OpenRouter's URL, its bearer header, its model ids) the same body goes
 * there instead. On the Console door, or with no door, the fetch is the caller's as it is. */
export function throughDoor(door, fetcher) {
  if (!door || door.provider === "anthropic") return fetcher;
  return (url, init = {}) => {
    if (String(url) !== CONSOLE_MESSAGES) return fetcher(url, init);
    const body = JSON.parse(String(init.body ?? "{}"));
    return fetcher(door.messagesUrl, { ...init, headers: door.headers(door.apiKey), body: JSON.stringify(door.body(body)) });
  };
}

/**
 * One player call: the system prompt and the session so far (user = the screen, assistant = the player's own earlier
 * messages). `keys` { anthropic, openai }; `fetcher` is the metered fetch. Anthropic players use the provider's
 * automatic prompt caching of the conversation so far (the session is one growing conversation).
 */
export function playerCall({ player, system, messages, keys, fetcher, maxTokens = PLAYER_MAX_TOKENS, effort = EFFORT }) {
  const wire = messages.map((m) => ({ role: m.role, content: m.content }));
  return player.provider === "openai"
    ? openaiResponses({ apiKey: keys.openai, model: player.model, system, messages: wire, maxTokens, effort, fetcher })
    : anthropicMessages({ apiKey: keys.anthropic, model: player.model, system, messages: wire, maxTokens, effort, fetcher: throughDoor(keys.door, fetcher), cache: true });
}

/** A one-shot call for the checks and the judges (X1's Messages call; a `gpt-` model through X1's Responses call — the
 * stand-in judges when the Anthropic models cannot be reached). */
export function judgeCall({ model, system, user, maxTokens, effort, keys, fetcher }) {
  return model.startsWith("gpt-")
    ? openaiResponses({ apiKey: keys.openai, model, system, messages: [{ role: "user", content: user }], maxTokens, effort, fetcher })
    : anthropicMessages({ apiKey: keys.anthropic, model, system, messages: [{ role: "user", content: user }], maxTokens, effort, fetcher: throughDoor(keys.door, fetcher) });
}

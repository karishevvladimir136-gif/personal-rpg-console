// ANTHROPIC_PROVIDERS_1 (was BEDROCK_PROVIDER_1): the one place that knows the door the Claude models are reached
// through — the Claude Console's API (`anthropic`, the default), Amazon Bedrock's Anthropic-compatible endpoint
// (`bedrock`) or OpenRouter's (`openrouter`): the same Messages API and the same bodies, another host, another key and
// the door's model ids. The ids the app shows and stores never change: the map is applied at the transport, so a
// campaign saved with claude-opus-5-5 plays on any door.
// No "server-only" import: the research harnesses load the in-turn checks that use it directly; it reads only
// server variables (never NEXT_PUBLIC_), so nothing of it can reach a browser bundle.

export type AnthropicProvider = "anthropic" | "bedrock" | "openrouter";
type Env = Record<string, string | undefined>;

export const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api";
const MESSAGES_PATH = "/v1/messages";
const PROVIDERS: readonly AnthropicProvider[] = ["anthropic", "bedrock", "openrouter"];
// The global cross-region profiles: in a region without in-region serving (the owner's us-west-1) the bare
// `anthropic.` ids are not served; `us.` is the geo alternative. The 4.5 generation keeps its dated ids there (free
// probes 2026-10-25: `global.anthropic.claude-haiku-4-5` is «invalid», the dated id is known); Opus 4.5 and Sonnet
// 4.5 answer «doesn't support this API» on the Messages endpoint (served through InvokeModel only).
const BEDROCK_MODEL_IDS: Readonly<Record<string, string>> = {
  "claude-opus-5-5": "global.anthropic.claude-opus-5-5",
  "claude-fable-5-1": "global.anthropic.claude-fable-5-1",
  "claude-sonnet-5-5": "global.anthropic.claude-sonnet-5-5",
  "claude-haiku-5-5": "global.anthropic.claude-haiku-5-5",
  "claude-opus-4-5": "global.anthropic.claude-opus-4-5-20251101-v1:0",
  "claude-sonnet-4-5": "global.anthropic.claude-sonnet-4-5-20250929-v1:0",
  "claude-haiku-4-5": "global.anthropic.claude-haiku-4-5-20251001-v1:0",
};
const OPENROUTER_MODEL_IDS: Readonly<Record<string, string>> = {
  "claude-opus-5-5": "anthropic/claude-opus-5.5",
  "claude-fable-5-1": "anthropic/claude-fable-5.1",
  "claude-sonnet-5-5": "anthropic/claude-sonnet-5.5",
  "claude-haiku-5-5": "anthropic/claude-haiku-5.5",
  "claude-opus-4-5": "anthropic/claude-opus-4.5",
  "claude-sonnet-4-5": "anthropic/claude-sonnet-4.5",
  "claude-haiku-4-5": "anthropic/claude-haiku-4.5",
};
const AWS_REGION_NAME = /^[a-z]{2}(?:-[a-z]+)+-\d{1,2}$/;
const BEDROCK_PROFILE_PREFIX = /^(?:(?:global|us|eu|jp|apac|au)\.)?anthropic\./;

const KEY_NAMES = {
  anthropic: "ANTHROPIC_API_KEY",
  bedrock: "BEDROCK_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
} as const satisfies Record<AnthropicProvider, string>;
export type AnthropicKeyName = (typeof KEY_NAMES)[AnthropicProvider];

/** A door that cannot be used as configured: always `not_configured`, never retried. */
export class AnthropicEndpointError extends Error {
  readonly kind = "not_configured" as const;
  constructor(message: string) {
    super(message);
    this.name = "AnthropicEndpointError";
  }
}

export type AnthropicEndpoint = {
  provider: AnthropicProvider;
  providerLabel: string;
  baseUrl: string;
  messagesUrl: string;
  endpointHost: string;
  keyName: AnthropicKeyName;
  /** The door's key ("" when unset). */
  apiKey: string;
  /** The provider's id for an app model id; an id the door does not serve throws `not_configured`. */
  modelId(name: string): string;
  /** The request headers: a Console or Bedrock key travels as the Anthropic SDK sends one (`x-api-key`), an
   * OpenRouter key as a bearer token. `anthropic-version` on every door. */
  headers(apiKey: string): Record<string, string>;
  /** A Messages body with its `model` as the door names it (other fields unchanged). */
  body<T>(value: T): T;
};

/** The name of a door's key. */
export function anthropicKeyNameFor(provider: AnthropicProvider): AnthropicKeyName {
  return KEY_NAMES[provider];
}

export function anthropicProvider(env: Env = process.env): AnthropicProvider {
  const value = (env.ANTHROPIC_PROVIDER ?? "").trim().toLowerCase();
  if (!value) return "anthropic";
  if ((PROVIDERS as readonly string[]).includes(value)) return value as AnthropicProvider;
  // The value itself is never echoed (an invalid environment setting is unavailable, configuration.ts).
  throw new AnthropicEndpointError("ANTHROPIC_PROVIDER must be anthropic, bedrock or openrouter");
}

function mapped(map: Readonly<Record<string, string>>, door: string) {
  return (name: string): string => {
    const id = map[name];
    if (id) return id;
    if (Object.values(map).includes(name)) return name;
    throw new AnthropicEndpointError(`model ${name.slice(0, 80)} has no ${door} id`);
  };
}

/**
 * The app's id for a provider's model id — a Bedrock reply may name its profile (`global.anthropic.claude-haiku-5-5`,
 * `anthropic.claude-haiku-4-5-20251001-v1:0`), an OpenRouter reply its slug (`anthropic/claude-opus-5.5`); app ids
 * pass unchanged. The served-model check compares requested and served ids through it on every door.
 */
export function appModelId(id: string): string {
  const name = id.replace(BEDROCK_PROFILE_PREFIX, "").replace(/^anthropic\//, "");
  if (!name.startsWith("claude-")) return name;
  return name.replace(/-v\d+(?::\d+)?$/, "").replace(/-\d{8}$/, "").replace(/(\d)\.(\d)/g, "$1-$2");
}

export function anthropicEndpoint(env: Env = process.env): AnthropicEndpoint {
  const provider = anthropicProvider(env);
  let baseUrl = ANTHROPIC_BASE_URL;
  let providerLabel = "Anthropic API";
  let modelId = (name: string) => name;
  if (provider === "bedrock") {
    const region = (env.AWS_REGION ?? "").trim();
    if (!region) throw new AnthropicEndpointError("AWS_REGION is not set on the server (ANTHROPIC_PROVIDER is bedrock)");
    if (!AWS_REGION_NAME.test(region)) throw new AnthropicEndpointError("AWS_REGION is not an AWS region name");
    baseUrl = `https://bedrock-runtime.${region}.amazonaws.com/anthropic`;
    providerLabel = `Amazon Bedrock (${region})`;
    modelId = mapped(BEDROCK_MODEL_IDS, "Amazon Bedrock");
  } else if (provider === "openrouter") {
    baseUrl = OPENROUTER_BASE_URL;
    providerLabel = "OpenRouter";
    modelId = mapped(OPENROUTER_MODEL_IDS, "OpenRouter");
  }
  const keyName = KEY_NAMES[provider];
  return {
    provider,
    providerLabel,
    baseUrl,
    messagesUrl: `${baseUrl}${MESSAGES_PATH}`,
    endpointHost: new URL(baseUrl).host,
    keyName,
    apiKey: (env[keyName] ?? "").trim(),
    modelId,
    headers: (apiKey) => ({
      ...(provider === "openrouter" ? { authorization: `Bearer ${apiKey}` } : { "x-api-key": apiKey }),
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    }),
    body: (value) => {
      const model = value && typeof value === "object" ? (value as { model?: unknown }).model : undefined;
      return typeof model === "string" ? { ...value, model: modelId(model) } : value;
    },
  };
}

/** The door's key, or "" when the door is not configured: every caller already treats an unset key as `not_configured`. */
export function anthropicApiKey(env: Env = process.env): string {
  try {
    return anthropicEndpoint(env).apiKey;
  } catch {
    return "";
  }
}

/** The door a request URL went through (the provenance a harness records); null for another host. */
export function anthropicDoorOf(url: string): { provider: AnthropicProvider; endpointHost: string } | null {
  let host: string;
  try { host = new URL(url).host; } catch { return null; }
  if (host === new URL(ANTHROPIC_BASE_URL).host) return { provider: "anthropic", endpointHost: host };
  if (/^bedrock-runtime\.[a-z0-9-]+\.amazonaws\.com$/.test(host)) return { provider: "bedrock", endpointHost: host };
  if (host === new URL(OPENROUTER_BASE_URL).host) return { provider: "openrouter", endpointHost: host };
  return null;
}

const REQUEST_ID = /^[A-Za-z0-9_.:-]{1,128}$/;

/** The request id of a response on any door (Anthropic's `request-id`, Bedrock's `x-amzn-requestid`, a generic
 * `x-request-id` or `x-generation-id`); OpenRouter's generation id is also the reply's own `id` (see servedOf). */
export function anthropicRequestId(headers: Headers | null | undefined): string | null {
  try {
    for (const name of ["request-id", "x-amzn-requestid", "x-generation-id", "x-request-id"]) {
      const value = headers?.get(name) ?? null;
      if (value && REQUEST_ID.test(value)) return value;
    }
    return null;
  } catch {
    return null;
  }
}

export type ServedOf = { servedModel: string | null; upstream: string | null; messageId: string | null };

/**
 * What a reply says about who served it: the model it names (as the app's id), the upstream provider OpenRouter
 * routed to (its reply's `provider` field, when present) and the reply's id (OpenRouter's generation id). Reads a
 * Messages reply or the `message` of a stream's `message_start`.
 */
export function servedOf(message: unknown): ServedOf {
  const value = message && typeof message === "object" ? message as { model?: unknown; provider?: unknown; id?: unknown } : {};
  const text = (field: unknown, max: number) => typeof field === "string" && field.trim() ? field.trim().slice(0, max) : null;
  const model = text(value.model, 120);
  return { servedModel: model ? appModelId(model) : null, upstream: text(value.provider, 80), messageId: text(value.id, 128) };
}

/** The provider's code of a failed response: Bedrock's exception name (header or body) first, else Anthropic's error
 * type, else OpenRouter's numeric code as `http_<code>`. */
export function anthropicErrorCode(payload: unknown, headers?: Headers | null): string | null {
  const value = payload && typeof payload === "object"
    ? payload as { error?: { type?: unknown; code?: unknown }; __type?: unknown }
    : null;
  let header: string | null = null;
  try { header = headers?.get("x-amzn-errortype") ?? null; } catch { /* no headers */ }
  const amazon = (header ?? (typeof value?.__type === "string" ? value.__type : "")).split(":")[0].split("#").pop() ?? "";
  if (/^[A-Za-z]{1,64}$/.test(amazon)) return amazon;
  if (typeof value?.error?.type === "string") return value.error.type.slice(0, 64);
  return typeof value?.error?.code === "number" ? `http_${value.error.code}` : null;
}

export type AnthropicFailureKind = "rate_limited" | "not_configured" | "retryable_transport";

/**
 * ANTHROPIC_PROVIDERS_1 §5: Bedrock's exceptions on the transport's kinds — throttling is a rate limit (the bounded
 * wait), a refused model (access not granted, or Fable 5.1 without the `aws_review` retention mode) is
 * `not_configured`, never retried. Null leaves the HTTP status mapping. Anthropic's own codes (the spend-limit
 * pattern among them) are not read here.
 */
export function bedrockFailureKind(code: string | null): AnthropicFailureKind | null {
  switch (code) {
    case "ThrottlingException":
      return "rate_limited";
    case "AccessDeniedException":
    case "ResourceNotFoundException":
      return "not_configured";
    case "ServiceUnavailableException":
    case "ModelNotReadyException":
    case "InternalServerException":
      return "retryable_transport";
    default:
      return null;
  }
}

/**
 * ANTHROPIC_PROVIDERS_1 §5: a failed response on any door — the transport's kind where the door decides it (null
 * leaves the HTTP status mapping) and, for a refusal the owner must act on, the message that says what to do.
 * Bedrock: throttling waits; a refused model (403 not about the key) or a model the endpoint does not serve (404) is
 * `not_configured`, named. OpenRouter: «insufficient credits» (402) stops (`not_configured`, never retried); its 429
 * keeps the status mapping's bounded wait. The `enforced_spend_limit_reached` pattern stays the Console's.
 */
export function doorFailure(door: Pick<AnthropicEndpoint, "provider" | "providerLabel">, status: number, code: string | null,
  providerMessage: string, appId: string, providerId: string): { kind: AnthropicFailureKind | null; message: string | null } {
  if (door.provider === "bedrock") {
    const kind = bedrockFailureKind(code);
    if (kind === "rate_limited" || kind === "retryable_transport") return { kind, message: null };
    if (status === 404 || (status === 403 && !/api key/i.test(providerMessage)) || kind === "not_configured")
      return { kind: "not_configured", message: bedrockAccessMessage(appId, providerId, status) };
    return { kind, message: null };
  }
  if (door.provider === "openrouter" && status === 402)
    return { kind: "not_configured", message: "OpenRouter refused the request: insufficient credits (HTTP 402) — top up the OpenRouter account" };
  return { kind: null, message: null };
}

/** The owner-readable reason a model was refused on Bedrock, naming both ids. */
export function bedrockAccessMessage(appId: string, providerId: string, status = 403): string {
  if (status === 404)
    return `Amazon Bedrock does not serve ${providerId} (${appId}) on its Messages endpoint in this region`;
  return `Amazon Bedrock refused ${providerId} (${appId}): model access is not granted to this AWS account, or for Fable 5.1 the data-retention mode is not aws_review`;
}

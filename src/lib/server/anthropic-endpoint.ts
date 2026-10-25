// BEDROCK_PROVIDER_1: the one place that knows the door the Claude models are reached through — the Claude Console's
// API (`anthropic`, the default) or Amazon Bedrock's Anthropic-compatible endpoint (`bedrock`): the same Messages API
// and the same bodies, another host, another key and the Bedrock model ids. The ids the app shows and stores never
// change: the map is applied at the transport, so a campaign saved with claude-opus-5-5 plays on either door.
// No "server-only" import: the research harnesses load the in-turn checks that use it directly; it reads only
// server variables (never NEXT_PUBLIC_), so nothing of it can reach a browser bundle.

export type AnthropicProvider = "anthropic" | "bedrock";
type Env = Record<string, string | undefined>;

export const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const MESSAGES_PATH = "/v1/messages";
// The global cross-region profiles: in a region without in-region serving (the owner's us-west-1) the bare
// `anthropic.` ids are not served; `us.` is the geo alternative.
const BEDROCK_MODEL_IDS: Readonly<Record<string, string>> = {
  "claude-opus-5-5": "global.anthropic.claude-opus-5-5",
  "claude-fable-5-1": "global.anthropic.claude-fable-5-1",
  "claude-sonnet-5-5": "global.anthropic.claude-sonnet-5-5",
  "claude-haiku-5-5": "global.anthropic.claude-haiku-5-5",
};
const AWS_REGION_NAME = /^[a-z]{2}(?:-[a-z]+)+-\d{1,2}$/;
const BEDROCK_PROFILE_PREFIX = /^(?:(?:global|us|eu|jp|apac|au)\.)?anthropic\./;

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
  keyName: "ANTHROPIC_API_KEY" | "BEDROCK_API_KEY";
  /** The door's key ("" when unset). */
  apiKey: string;
  /** The provider's id for an app model id; an id the door does not serve throws `not_configured`. */
  modelId(name: string): string;
  /** The request headers (a Bedrock API key travels as the Anthropic SDK sends a key: `x-api-key`). */
  headers(apiKey: string): Record<string, string>;
  /** A Messages body with its `model` as the door names it (other fields unchanged). */
  body<T>(value: T): T;
};

export function anthropicProvider(env: Env = process.env): AnthropicProvider {
  const value = (env.ANTHROPIC_PROVIDER ?? "").trim().toLowerCase();
  if (!value || value === "anthropic") return "anthropic";
  if (value === "bedrock") return "bedrock";
  // The value itself is never echoed (an invalid environment setting is unavailable, configuration.ts).
  throw new AnthropicEndpointError("ANTHROPIC_PROVIDER must be anthropic or bedrock");
}

function bedrockModelId(name: string): string {
  const mapped = BEDROCK_MODEL_IDS[name];
  if (mapped) return mapped;
  if (Object.values(BEDROCK_MODEL_IDS).includes(name)) return name;
  throw new AnthropicEndpointError(`model ${name.slice(0, 80)} has no Amazon Bedrock id`);
}

/** The app's id for a provider's model id (a Bedrock reply may name its profile id); app ids pass unchanged. */
export function appModelId(id: string): string {
  return id.replace(BEDROCK_PROFILE_PREFIX, "");
}

export function anthropicEndpoint(env: Env = process.env): AnthropicEndpoint {
  const provider = anthropicProvider(env);
  let baseUrl = ANTHROPIC_BASE_URL;
  let providerLabel = "Anthropic API";
  if (provider === "bedrock") {
    const region = (env.AWS_REGION ?? "").trim();
    if (!region) throw new AnthropicEndpointError("AWS_REGION is not set on the server (ANTHROPIC_PROVIDER is bedrock)");
    if (!AWS_REGION_NAME.test(region)) throw new AnthropicEndpointError("AWS_REGION is not an AWS region name");
    baseUrl = `https://bedrock-runtime.${region}.amazonaws.com/anthropic`;
    providerLabel = `Amazon Bedrock (${region})`;
  }
  const keyName = provider === "bedrock" ? "BEDROCK_API_KEY" : "ANTHROPIC_API_KEY";
  const modelId = provider === "bedrock" ? bedrockModelId : (name: string) => name;
  return {
    provider,
    providerLabel,
    baseUrl,
    messagesUrl: `${baseUrl}${MESSAGES_PATH}`,
    endpointHost: new URL(baseUrl).host,
    keyName,
    apiKey: (env[keyName] ?? "").trim(),
    modelId,
    headers: (apiKey) => ({ "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION, "content-type": "application/json" }),
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
  return null;
}

/** The request id of a response on either door (Anthropic's `request-id`, Bedrock's `x-amzn-requestid`). */
export function anthropicRequestId(headers: Headers | null | undefined): string | null {
  try {
    const value = headers?.get("request-id") ?? headers?.get("x-amzn-requestid") ?? null;
    return value && /^[A-Za-z0-9_.:-]{1,128}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

/** The provider's code of a failed response: Bedrock's exception name (header or body) first, else Anthropic's error type. */
export function anthropicErrorCode(payload: unknown, headers?: Headers | null): string | null {
  const value = payload && typeof payload === "object"
    ? payload as { error?: { type?: unknown }; __type?: unknown }
    : null;
  let header: string | null = null;
  try { header = headers?.get("x-amzn-errortype") ?? null; } catch { /* no headers */ }
  const amazon = (header ?? (typeof value?.__type === "string" ? value.__type : "")).split(":")[0].split("#").pop() ?? "";
  if (/^[A-Za-z]{1,64}$/.test(amazon)) return amazon;
  return typeof value?.error?.type === "string" ? value.error.type.slice(0, 64) : null;
}

export type AnthropicFailureKind = "rate_limited" | "not_configured" | "retryable_transport";

/**
 * BEDROCK_PROVIDER_1 §5: Bedrock's exceptions on the transport's kinds — throttling is a rate limit (the bounded
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

/** The owner-readable reason a model was refused on Bedrock, naming both ids. */
export function bedrockAccessMessage(appId: string, providerId: string): string {
  return `Amazon Bedrock refused ${providerId} (${appId}): model access is not granted to this AWS account, or for Fable 5.1 the data-retention mode is not aws_review`;
}

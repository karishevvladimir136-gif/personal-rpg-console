import "server-only";
import { DmError } from "../../gameplay/dm-errors.ts";
import { dmModelSpec } from "../../model-runtime/dm-models.ts";
import { anthropicEndpoint, appModelId, type AnthropicEndpoint } from "../anthropic-endpoint.ts";

// Polish 2 §5: one structured request to the Anthropic Messages API — the
// campaign's DM (Claude Opus 5.5) writing the opening proposal in the bootstrap's
// JSON shape. The same schema the OpenAI path sends, with the keywords the
// Anthropic structured-output grammar does not take removed (string and number
// bounds, array counts; a nullable type array becomes anyOf); the bootstrap
// validator enforces every limit afterwards, as it always did. No tools, no
// retry; a refusal or a cut-off reply is a provider failure, never a fallback
// to another model. The reply's own model id is the usage model (the SQL
// contract checks it against the ticket's).
export type AnthropicStructuredOptions = {
  apiKey: string;
  model: string;
  effort: string;
  system: string;
  input: string;
  schema: Record<string, unknown>;
  maxOutputTokens?: number;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};
export type AnthropicStructuredResult = {
  output: unknown;
  usage: { model: string; inputTokens: number; outputTokens: number; latencyMs: number };
};

/** The schema as Anthropic's structured outputs take it: bounds and counts removed, type arrays as anyOf. */
export function anthropicStructuredSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(anthropicStructuredSchema);
  if (!schema || typeof schema !== "object") return schema;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
    if (["minLength", "maxLength", "minimum", "maximum", "multipleOf", "maxItems", "pattern"].includes(key)) continue;
    if (key === "minItems" && typeof value === "number" && value > 1) continue;
    if (key === "type" && Array.isArray(value)) {
      const types = value.filter((t): t is string => typeof t === "string");
      if (types.length > 1) { out.anyOf = types.map((t) => ({ type: t })); continue; }
      out.type = types[0];
      continue;
    }
    out[key] = anthropicStructuredSchema(value);
  }
  return out;
}

export async function requestAnthropicStructured(options: AnthropicStructuredOptions): Promise<AnthropicStructuredResult> {
  if (!options.apiKey || !options.model) throw new DmError("configuration", true);
  const spec = dmModelSpec("anthropic", options.model);
  if (!spec || !spec.reasoning.includes(options.effort)) throw new DmError("configuration");
  // BEDROCK_PROVIDER_1: a door that cannot be used (no region, an id it does not serve) is a configuration failure.
  let door: AnthropicEndpoint;
  let providerModel: string;
  try {
    door = anthropicEndpoint();
    providerModel = door.modelId(options.model);
  } catch {
    throw new DmError("configuration", true);
  }
  const fetcher = options.fetcher ?? fetch;
  const started = Date.now();
  let response: Response;
  try {
    response = await fetcher(door.messagesUrl, {
      method: "POST",
      headers: door.headers(options.apiKey),
      body: JSON.stringify({
        model: providerModel,
        max_tokens: Math.min(options.maxOutputTokens ?? 16_000, spec.maxOutputTokens),
        output_config: { effort: options.effort, format: { type: "json_schema", schema: anthropicStructuredSchema(options.schema) } },
        system: options.system,
        messages: [{ role: "user", content: options.input }],
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 180_000),
    });
  } catch {
    // Transport trouble and timeouts are retryable; nothing of the cause reaches a client.
    throw new DmError("provider", true);
  }
  const value = await response.json().catch(() => null) as {
    model?: unknown; stop_reason?: unknown; content?: { type: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: unknown };
  } | null;
  if (!response.ok || !value) {
    if (response.status === 401 || response.status === 403) throw new DmError("configuration", true);
    // Only the provider's error type travels (never the body, never the key).
    throw new DmError("provider", [408, 409, 429, 500, 502, 503, 504, 529].includes(response.status));
  }
  if (value.stop_reason === "refusal") throw new DmError("provider", false);
  if (value.stop_reason === "max_tokens") throw new DmError("provider", false);
  const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("");
  let output: unknown;
  try { output = JSON.parse(text); } catch { throw new DmError("provider", false); }
  return {
    output,
    // A Bedrock reply may name its profile id: the usage model is the app's id either way.
    usage: { model: typeof value.model === "string" ? appModelId(value.model) : options.model, inputTokens: value.usage?.input_tokens ?? 0,
      outputTokens: value.usage?.output_tokens ?? 0, latencyMs: Date.now() - started },
  };
}

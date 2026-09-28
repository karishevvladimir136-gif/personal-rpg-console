import "server-only";
import type {
  DmProvider,
  ProviderResult,
  BuiltContext,
} from "../../gameplay/server-contracts.ts";
import { buildContext, stageSchema } from "../../gameplay/dm-context.ts";
import {
  parsePlan,
  parseNarration,
  parseFeedback,
} from "../../gameplay/dm-schema.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import type { TurnFailure } from "../../gameplay/contracts.ts";
import { modelReasoning } from "./config.ts";
import type { RuntimeTask } from "../../production/contracts.ts";
import { recognizedActualModel } from "../../model-runtime/capabilities.ts";
import { STANDARD_SERVICE_TIER } from "../../model-runtime/defaults.ts";

export type ProviderAttempt = {
  operationId: string | null;
  stage: "plan" | "narrate" | "feedback" | "summary";
  configuredModel: string;
  actualModel: string | null;
  httpStatus: number | null;
  providerCode: string | null;
  providerType: "insufficient_quota" | "rate_limit_error" | null;
  attempted: boolean;
  success: boolean;
  category: TurnFailure | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  estimatedInputTokens: number;
  maxOutputTokens: number;
  timeoutMs: number;
  sourceCount: number;
};

// Opt-in server-side diagnostics only. The ordinary attempt observer and
// gameplay-facing DmError deliberately retain their existing safe shape.
export type ProviderTransportDiagnostic = {
  stage: ProviderAttempt["stage"];
  configuredModel: string;
  category: TurnFailure | null;
  success: boolean;
  phase:
    | "preflight"
    | "request"
    | "error-body"
    | "response-body"
    | "provider-json"
    | "provider-state"
    | "output-parse"
    | "completed";
  nativeName: string | null;
  nativeMessage: string | null;
  causeName: string | null;
  causeCode: string | null;
  causeMessage: string | null;
  abortKind: "timeout" | "abort" | null;
  httpStatus: number | null;
  httpStatusText: string | null;
  providerErrorType: string | null;
  providerErrorCode: string | null;
  providerErrorMessage: string | null;
  retryAfter: string | null;
  openaiRequestId: string | null;
  requestId: string | null;
  responseId: string | null;
  responseReceived: boolean;
  bodyReceived: boolean;
  jsonParseFailed: boolean;
  elapsedMs: number;
};

function diagnosticIdentifier(
  value: unknown,
  apiKey: string,
  max = 128,
): string | null {
  return typeof value === "string" &&
    value.length <= max &&
    /^[A-Za-z0-9_.-]+$/.test(value) &&
    !value.startsWith("sk-") &&
    (!apiKey || !value.includes(apiKey))
    ? value
    : null;
}

function diagnosticMessage(value: unknown, apiKey: string): string | null {
  if (typeof value !== "string") return null;
  let message = value;
  if (apiKey) message = message.replaceAll(apiKey, "[REDACTED]");
  message = message
    .replace(/\bBearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]")
    .replace(
      /\b(?:OPENAI_API_KEY|Authorization|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
      "[REDACTED]",
    )
    .replace(/[\u0000-\u001f\u007f]/g, " ");
  return message.slice(0, 512);
}

function diagnosticHeader(response: Response, name: string): string | null {
  try {
    return response.headers?.get(name) ?? null;
  } catch {
    return null;
  }
}

function captureNativeFailure(
  diagnostic: ProviderTransportDiagnostic,
  error: unknown,
  apiKey: string,
  signal?: AbortSignal,
) {
  const native =
    error && typeof error === "object"
      ? (error as { name?: unknown; message?: unknown; cause?: unknown })
      : null;
  const cause =
    native?.cause && typeof native.cause === "object"
      ? (native.cause as { name?: unknown; code?: unknown; message?: unknown })
      : null;
  diagnostic.nativeName = diagnosticIdentifier(native?.name, apiKey, 80);
  diagnostic.nativeMessage = diagnosticMessage(native?.message, apiKey);
  diagnostic.causeName = diagnosticIdentifier(cause?.name, apiKey, 80);
  diagnostic.causeCode = diagnosticIdentifier(cause?.code, apiKey, 80);
  diagnostic.causeMessage = diagnosticMessage(cause?.message, apiKey);
  const reason =
    signal?.aborted && signal.reason && typeof signal.reason === "object"
      ? (signal.reason as { name?: unknown })
      : null;
  const names = [native?.name, cause?.name, reason?.name];
  diagnostic.abortKind =
    names.includes("TimeoutError") || cause?.code === "ETIMEDOUT"
      ? "timeout"
      : names.includes("AbortError")
        ? "abort"
        : null;
}

function captureProviderError(
  diagnostic: ProviderTransportDiagnostic,
  payload: unknown,
  apiKey: string,
) {
  if (!payload || typeof payload !== "object") return;
  const record = payload as Record<string, unknown>;
  if (
    typeof record.id === "string" &&
    /^resp_[A-Za-z0-9_-]{1,120}$/.test(record.id)
  )
    diagnostic.responseId = record.id;
  if (!record.error || typeof record.error !== "object") return;
  const error = record.error as Record<string, unknown>;
  diagnostic.providerErrorType = diagnosticIdentifier(error.type, apiKey, 80);
  diagnostic.providerErrorCode = diagnosticIdentifier(error.code, apiKey, 80);
  diagnostic.providerErrorMessage = diagnosticMessage(error.message, apiKey);
}

export type ProviderOptions = {
  apiKey: string;
  model: string;
  reasoning?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  observer?: (attempt: ProviderAttempt) => void;
  diagnosticObserver?: (diagnostic: ProviderTransportDiagnostic) => void;
};
export function createStructuredRequester(
  options: ProviderOptions,
  use?: { task: RuntimeTask; purpose?: "simulation" },
) {
  // Selected by the server adapter, never by model output or browser input.
  // A caller may shorten this deadline but cannot exceed the task's ceiling.
  const timeoutLimit =
    use?.task === "world.compose"
      ? 180_000
      : use?.task === "world.resolve" && use.purpose === "simulation"
        ? 120_000
        : 60_000;
  const timeoutMs = Math.min(options.timeoutMs ?? timeoutLimit, timeoutLimit);
  const request = async <T>(
    context: BuiltContext,
    stage: ProviderAttempt["stage"],
    operationId: string,
    parse: (value: unknown) => T,
    schema?: Record<string, unknown>,
  ): Promise<ProviderResult<T>> => {
    const started = Date.now();
    const attempt: ProviderAttempt = {
      operationId: /^[0-9a-f-]{36}$/i.test(operationId) ? operationId : null,
      stage,
      configuredModel: context.budget.model,
      actualModel: null,
      httpStatus: null,
      providerCode: null,
      providerType: null,
      attempted: false,
      success: false,
      category: null,
      inputTokens: null,
      outputTokens: null,
      latencyMs: 0,
      estimatedInputTokens: context.estimatedTokens,
      maxOutputTokens: context.budget.outputReserve,
      timeoutMs,
      sourceCount: context.sourceCount,
    };
    const diagnostic: ProviderTransportDiagnostic = {
      stage,
      configuredModel: context.budget.model,
      category: null,
      success: false,
      phase: "preflight",
      nativeName: null,
      nativeMessage: null,
      causeName: null,
      causeCode: null,
      causeMessage: null,
      abortKind: null,
      httpStatus: null,
      httpStatusText: null,
      providerErrorType: null,
      providerErrorCode: null,
      providerErrorMessage: null,
      retryAfter: null,
      openaiRequestId: null,
      requestId: null,
      responseId: null,
      responseReceived: false,
      bodyReceived: false,
      jsonParseFailed: false,
      elapsedMs: 0,
    };
    try {
      if (!options.apiKey || !options.model)
        throw new DmError("configuration", true);
      if (stage === "summary" && !schema) throw new DmError("configuration");
      const body = {
        model: options.model,
        service_tier: STANDARD_SERVICE_TIER,
        reasoning: { effort: modelReasoning(options.model, options.reasoning) },
        instructions: context.instructions,
        input: context.input,
        max_output_tokens: context.budget.outputReserve,
        store: false,
        truncation: "disabled",
        text: {
          format: {
            type: "json_schema",
            name: `dm_${stage}`,
            strict: true,
            schema:
              schema ?? (stage === "summary" ? undefined : stageSchema(stage)),
          },
        },
      };
      let response: Response;
      const signal = AbortSignal.timeout(timeoutMs);
      try {
        attempt.attempted = true;
        diagnostic.phase = "request";
        response = await (options.fetcher ?? fetch)(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${options.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal,
          },
        );
      } catch (error) {
        captureNativeFailure(diagnostic, error, options.apiKey, signal);
        throw new DmError("provider", true);
      }
      diagnostic.responseReceived = true;
      attempt.httpStatus = response.status;
      diagnostic.httpStatus = response.status;
      diagnostic.httpStatusText = diagnosticMessage(
        response.statusText,
        options.apiKey,
      );
      diagnostic.retryAfter = diagnosticMessage(
        diagnosticHeader(response, "retry-after"),
        options.apiKey,
      );
      diagnostic.openaiRequestId = diagnosticIdentifier(
        diagnosticHeader(response, "openai-request-id"),
        options.apiKey,
      );
      diagnostic.requestId = diagnosticIdentifier(
        diagnosticHeader(response, "x-request-id"),
        options.apiKey,
      );
      if (!response.ok) {
        diagnostic.phase = "error-body";
        // Rich details are opt-in server diagnostics only. The default attempt
        // observer still sees only the existing allowlisted type and code.
        try {
          const body = await response.text();
          diagnostic.bodyReceived = true;
          let payload: unknown = null;
          try {
            payload = JSON.parse(body);
          } catch (error) {
            diagnostic.jsonParseFailed = true;
            captureNativeFailure(diagnostic, error, options.apiKey);
          }
          captureProviderError(diagnostic, payload, options.apiKey);
          const error =
            payload && typeof payload === "object"
              ? (payload as { error?: Record<string, unknown> }).error
              : null;
          if (
            error?.type === "insufficient_quota" ||
            error?.type === "rate_limit_error"
          )
            attempt.providerType = error.type;
          if (
            typeof error?.code === "string" &&
            [
              "insufficient_quota",
              "rate_limit_exceeded",
              "invalid_api_key",
              "model_not_found",
              "permission_denied",
              "unsupported_parameter",
              "credit_balance_exhausted",
              "organization_spend_limit_exceeded",
              "project_spend_limit_exceeded",
              "organization_usage_limit_exceeded",
              "slow_down",
              "server_is_overloaded",
            ].includes(error.code)
          )
            attempt.providerCode = error.code;
        } catch (error) {
          captureNativeFailure(diagnostic, error, options.apiKey);
        }
        throw new DmError(
          response.status === 401 || response.status === 403
            ? "configuration"
            : "provider",
          response.status === 401 ||
            response.status === 403 ||
            response.status === 429 ||
            response.status >= 500,
        );
      }
      let payload: Record<string, unknown>;
      diagnostic.phase = "response-body";
      let responseText: string;
      try {
        responseText = await response.text();
        diagnostic.bodyReceived = true;
      } catch (error) {
        captureNativeFailure(diagnostic, error, options.apiKey, signal);
        throw new DmError("provider", true);
      }
      if (responseText.length > 200000) throw new DmError("provider", true);
      diagnostic.phase = "provider-json";
      try {
        payload = JSON.parse(responseText);
      } catch (error) {
        diagnostic.jsonParseFailed = true;
        captureNativeFailure(diagnostic, error, options.apiKey);
        throw new DmError("provider", true);
      }
      captureProviderError(diagnostic, payload, options.apiKey);
      attempt.actualModel = recognizedActualModel(payload?.model);
      const rawUsage = payload?.usage as Record<string, unknown> | null;
      const tokenCount = (value: unknown): number | null =>
        Number.isSafeInteger(value) &&
        (value as number) >= 0 &&
        (value as number) <= 2000000
          ? (value as number)
          : null;
      attempt.inputTokens = tokenCount(rawUsage?.input_tokens);
      attempt.outputTokens = tokenCount(rawUsage?.output_tokens);
      if (
        !payload ||
        payload.status !== "completed" ||
        !Array.isArray(payload.output)
      )
        throw new DmError("provider", true);
      diagnostic.phase = "provider-state";
      const chunks: string[] = [];
      for (const item of payload.output) {
        if (item.type === "reasoning") continue;
        if (
          item.type !== "message" ||
          item.role !== "assistant" ||
          item.status !== "completed" ||
          !Array.isArray(item.content)
        )
          throw new DmError("validation");
        for (const content of item.content) {
          if (
            content.type !== "output_text" ||
            typeof content.text !== "string"
          )
            throw new DmError("provider");
          chunks.push(content.text);
        }
      }
      if (chunks.length !== 1) throw new DmError("validation");
      let output: T;
      diagnostic.phase = "output-parse";
      try {
        output = parse(JSON.parse(chunks[0]));
      } catch {
        throw new DmError("validation");
      }
      const usage = payload.usage as Record<string, unknown> | null;
      if (
        !usage ||
        !Number.isSafeInteger(usage.input_tokens) ||
        !Number.isSafeInteger(usage.output_tokens) ||
        (usage.input_tokens as number) < 0 ||
        (usage.output_tokens as number) < 0
      )
        throw new DmError("provider");
      attempt.success = true;
      diagnostic.phase = "completed";
      diagnostic.success = true;
      return {
        output,
        usage: {
          model: attempt.actualModel ?? options.model,
          inputTokens: usage.input_tokens as number,
          outputTokens: usage.output_tokens as number,
          calls: 1,
          latencyMs: Date.now() - started,
        },
      };
    } catch (error) {
      const safeError =
        error instanceof DmError ? error : new DmError("provider", true);
      attempt.category = safeError.code;
      diagnostic.category = safeError.code;
      throw safeError;
    } finally {
      attempt.latencyMs = Date.now() - started;
      diagnostic.elapsedMs = attempt.latencyMs;
      // The observer sees only this allowlist, including failed paid attempts.
      // Reporting failure must never alter gameplay or expose a caught error.
      try {
        options.observer?.({ ...attempt });
      } catch {
        /* Non-authoritative diagnostics. */
      }
      try {
        options.diagnosticObserver?.({ ...diagnostic });
      } catch {
        /* Diagnostics never affect settlement or gameplay errors. */
      }
    }
  };
  return request;
}

export function openAiProvider(options: ProviderOptions): DmProvider {
  const request = createStructuredRequester(options);
  return {
    plan: (source, input) =>
      request(
        buildContext(source, input, "plan", { model: options.model }),
        "plan",
        input.operationId,
        (raw) => {
          const extended = input.mode === "game" && !!source.foundationOptions;
          if (
            !raw ||
            typeof raw !== "object" ||
            Object.hasOwn(raw, "foundationAction") !== extended
          )
            throw new DmError("validation");
          const plan = parsePlan(raw);
          if (
            plan.foundationAction &&
            plan.foundationAction.input !== input.input
          )
            throw new DmError("validation");
          return plan;
        },
        stageSchema(
          "plan",
          input.mode === "game" && !!source.foundationOptions,
        ),
      ),
    narrate: (source, input, resolution, checks) =>
      request(
        buildContext(source, input, "narrate", {
          model: options.model,
          resolution,
          checks,
        }),
        "narrate",
        input.operationId,
        parseNarration,
      ),
    feedback: (source, input) =>
      request(
        buildContext(source, input, "feedback", { model: options.model }),
        "feedback",
        input.operationId,
        parseFeedback,
      ),
  };
}

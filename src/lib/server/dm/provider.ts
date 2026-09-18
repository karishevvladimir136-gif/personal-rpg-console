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
  sourceCount: number;
};

export type ProviderOptions = {
  apiKey: string;
  model: string;
  reasoning?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  observer?: (attempt: ProviderAttempt) => void;
};
export function createStructuredRequester(options: ProviderOptions) {
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
      sourceCount: context.sourceCount,
    };
    try {
      if (!options.apiKey || !options.model)
        throw new DmError("configuration", true);
      if (stage === "summary" && !schema) throw new DmError("configuration");
      const body = {
        model: options.model,
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
      try {
        attempt.attempted = true;
        response = await (options.fetcher ?? fetch)(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${options.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(
              Math.min(options.timeoutMs ?? 60000, 60000),
            ),
          },
        );
      } catch {
        throw new DmError("provider", true);
      }
      attempt.httpStatus = response.status;
      if (!response.ok) {
        // Inspect only a fixed set of non-content error codes. Never retain or
        // report the message/body, which can quote private prompt fragments.
        try {
          const error = (await response.json())?.error;
          if (
            error?.type === "insufficient_quota" ||
            error?.type === "rate_limit_error"
          )
            attempt.providerType = error.type;
          if (
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
            ].includes(error?.code)
          )
            attempt.providerCode = error.code;
        } catch {
          /* No provider details escape. */
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
      try {
        const text = await response.text();
        if (text.length > 200000) throw new DmError("validation");
        payload = JSON.parse(text);
      } catch {
        throw new DmError("provider", true);
      }
      if (
        typeof payload?.model === "string" &&
        /^(?:gpt-6-astra|gpt-5\.4(?:-mini)?)(?:-\d{4}-\d{2}-\d{2})?$/.test(
          payload.model,
        )
      )
        attempt.actualModel = payload.model;
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
      throw safeError;
    } finally {
      attempt.latencyMs = Date.now() - started;
      // The observer sees only this allowlist, including failed paid attempts.
      // Reporting failure must never alter gameplay or expose a caught error.
      try {
        options.observer?.({ ...attempt });
      } catch {
        /* Non-authoritative diagnostics. */
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
        parsePlan,
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

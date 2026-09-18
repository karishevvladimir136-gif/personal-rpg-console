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

type Options = {
  apiKey: string;
  model: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};
export function openAiProvider(options: Options): DmProvider {
  const request = async <T>(
    context: BuiltContext,
    stage: "plan" | "narrate" | "feedback",
    parse: (value: unknown) => T,
  ): Promise<ProviderResult<T>> => {
    if (!options.apiKey || !options.model) throw new DmError("configuration");
    const started = Date.now();
    const body = {
      model: options.model,
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
          schema: stageSchema(stage),
        },
      },
    };
    let response: Response;
    try {
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
    if (!response.ok) {
      // Do not retain provider body; it can quote private prompt fragments.
      try {
        await response.body?.cancel();
      } catch {
        /* No provider details escape. */
      }
      throw new DmError(
        response.status === 401 || response.status === 403
          ? "configuration"
          : "provider",
        response.status === 429 || response.status >= 500,
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
        if (content.type !== "output_text" || typeof content.text !== "string")
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
    return {
      output,
      usage: {
        model: options.model,
        inputTokens: usage.input_tokens as number,
        outputTokens: usage.output_tokens as number,
        calls: 1,
        latencyMs: Date.now() - started,
      },
    };
  };
  return {
    plan: (source, input) =>
      request(
        buildContext(source, input, "plan", { model: options.model }),
        "plan",
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
        parseNarration,
      ),
    feedback: (source, input) =>
      request(
        buildContext(source, input, "feedback", { model: options.model }),
        "feedback",
        parseFeedback,
      ),
  };
}

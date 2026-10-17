// The two DM models the campaign may choose for its turn ("dm.turn"), with
// limits and prices in one place. Facts and sources: docs/MODELS.md
// (checked 2026-10-15). Prices are USD per 1M tokens, Standard tier.

export type DmProviderId = "anthropic" | "openai";
export type DmEffort = "low" | "medium" | "high" | "xhigh" | "max";

export type DmModelSpec = {
  providerId: DmProviderId;
  modelId: string;
  label: string;
  contextLimit: number;
  maxOutputTokens: number;
  /** Provider effort/reasoning levels; DmEffort names map 1:1 onto them. */
  reasoning: readonly string[];
  defaultReasoning: string;
  price: {
    input: number;
    output: number;
    cacheRead: number;
    /** 5-minute write on Anthropic; the single (30-minute) write on OpenAI. */
    cacheWrite: number;
    cacheWrite1h?: number;
  };
};

export const dmModels = {
  "anthropic/claude-opus-5-5": {
    providerId: "anthropic",
    modelId: "claude-opus-5-5",
    label: "Claude Opus 5.5",
    contextLimit: 1_000_000,
    maxOutputTokens: 128_000,
    reasoning: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoning: "medium",
    price: { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5, cacheWrite1h: 8 },
  },
  "openai/gpt-6-astra": {
    providerId: "openai",
    modelId: "gpt-6-astra",
    label: "GPT-6 Astra",
    contextLimit: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoning: "high",
    price: { input: 10, output: 50, cacheRead: 1, cacheWrite: 12.5 },
  },
} as const satisfies Record<string, DmModelSpec>;

export type DmModelKey = keyof typeof dmModels;

export function dmModelSpec(providerId: string, modelId: string): DmModelSpec | null {
  const key = `${providerId}/${modelId}`;
  return Object.hasOwn(dmModels, key) ? dmModels[key as DmModelKey] : null;
}

/** Normalized usage of one request. `inputTokens` is the whole prompt,
 * including tokens read from or written to the cache. */
export type DmUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** The part of cacheWriteTokens written with a one-hour lifetime (Anthropic reports it apart; polish item 12). */
  cacheWrite1hTokens?: number;
  /** Separately reported reasoning tokens (already included in output), when the provider reports them. */
  reasoningTokens: number | null;
};

export function dmUsageCost(spec: Pick<DmModelSpec, "price">, usage: DmUsage): number {
  const uncached = Math.max(0, usage.inputTokens - usage.cacheReadTokens - usage.cacheWriteTokens);
  const write1h = Math.min(usage.cacheWriteTokens, Math.max(0, usage.cacheWrite1hTokens ?? 0));
  return (uncached * spec.price.input +
    usage.cacheReadTokens * spec.price.cacheRead +
    (usage.cacheWriteTokens - write1h) * spec.price.cacheWrite +
    write1h * (spec.price.cacheWrite1h ?? spec.price.cacheWrite) +
    usage.outputTokens * spec.price.output) / 1_000_000;
}

/** Upper estimate before a request is sent: half a token per prompt byte
 * (measured prompts run at 0.2–0.3 tokens per byte on both models) at the
 * cache-write price if higher, plus the full output allowance. Stage 2 used
 * one token per byte, which refused Astra requests at $5.4 of a $6 budget
 * while $3.8 was spent. */
export function dmRequestReservation(spec: Pick<DmModelSpec, "price">,
  requestBytes: number, maxOutputTokens: number): number {
  const inputPrice = Math.max(spec.price.input, spec.price.cacheWrite, spec.price.cacheWrite1h ?? 0);
  return ((requestBytes / 2 + 2048) * inputPrice + maxOutputTokens * spec.price.output) / 1_000_000;
}

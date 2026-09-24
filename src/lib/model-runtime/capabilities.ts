// Verified against the official OpenAI model pages. This is capability
// registration only; it does not select a production model or provider.
export const openAiModelCapabilities = {
  "gpt-6-astra": {
    contextLimit: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoning: "xhigh",
  },
  "gpt-6-sol": {
    contextLimit: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: ["none", "low", "medium", "high", "xhigh", "max"],
    defaultReasoning: null,
  },
  "gpt-5.4": {
    contextLimit: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: ["none", "low", "medium", "high", "xhigh"],
    defaultReasoning: "none",
  },
  "gpt-5.4-mini": {
    contextLimit: 400_000,
    maxOutputTokens: 128_000,
    reasoning: ["none", "low", "medium", "high", "xhigh"],
    defaultReasoning: "none",
  },
} as const;

export type RegisteredOpenAiModel = keyof typeof openAiModelCapabilities;

export function modelCapabilities(model: string) {
  return Object.hasOwn(openAiModelCapabilities, model)
    ? openAiModelCapabilities[model as RegisteredOpenAiModel]
    : null;
}

export function recognizedActualModel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  for (const model of Object.keys(openAiModelCapabilities)) {
    if (value === model) return value;
    if (value.startsWith(`${model}-`) && /^\d{4}-\d{2}-\d{2}$/.test(value.slice(model.length + 1)))
      return value;
  }
  return null;
}

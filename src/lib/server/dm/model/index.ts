import "server-only";
import { createAnthropicDmModel } from "./anthropic.ts";
import { createOpenAiDmModel } from "./openai.ts";
import { DmModelError, type DmModel, type DmModelOptions } from "./contracts.ts";

export * from "./contracts.ts";
export { compileToolset, validateToolArguments, DmToolSchemaError, strictLimits } from "./schema-compiler.ts";
export type { DmSchema, DmToolDefinition, CompiledToolset } from "./schema-compiler.ts";
export { dmModels, dmModelSpec, dmUsageCost, dmRequestReservation } from "../../../model-runtime/dm-models.ts";
export { createAnthropicDmModel, anthropicRequestBody } from "./anthropic.ts";
export { createOpenAiDmModel, openAiRequestBody } from "./openai.ts";

/** The adapter for a pinned selection ("dm.turn" execution profile). */
export function createDmModel(selection: { providerId: string; modelId: string },
  options: DmModelOptions = {}): DmModel {
  if (selection.providerId === "anthropic") return createAnthropicDmModel(selection.modelId, options);
  if (selection.providerId === "openai") return createOpenAiDmModel(selection.modelId, options);
  throw new DmModelError("not_configured", `unknown DM model provider ${selection.providerId}`);
}

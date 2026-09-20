import type {
  CampaignProductionSettings,
  ConfigureProductionInput,
  ProviderSettings,
} from "./production/configuration-contracts.ts";
import type {
  ModelSelection,
  RulesetProfileRef,
  RuntimeTask,
} from "./production/contracts.ts";
import type { TimelineFence } from "./saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "./saves/fence.ts";

export const productionTasks = [
  "dm.plan",
  "dm.narrate",
  "dm.feedback",
  "memory.summary",
  "world.resolve",
] as const satisfies readonly RuntimeTask[];
export const selectableRulesets: readonly RulesetProfileRef[] = [
  {
    id: "console-basic-v1",
    version: 1,
    mode: "full_ruleset",
    validatorVersion: "console-basic-v1",
  },
  {
    id: "world-logic-v1",
    version: 1,
    mode: "world_logic",
    validatorVersion: "world-logic-v1",
  },
];
export type ProductionDraft = Pick<
  ConfigureProductionInput,
  "worldPolicy" | "ruleset" | "runtimePolicy"
>;

const codes = new Set([
  "unauthenticated",
  "forbidden",
  "not_found",
  "validation",
  "configuration",
  "conflict",
  "busy",
  "unavailable",
  "not_configured",
]);
export class ProductionClientError extends Error {
  readonly code: string;
  constructor(code = "unavailable") {
    super(codes.has(code) ? code : "unavailable");
    this.code = this.message;
  }
}
function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new ProductionClientError();
}
function object(value: unknown, keys: string[]): Record<string, unknown> {
  requireValue(!!value && typeof value === "object" && !Array.isArray(value));
  const row = value as Record<string, unknown>;
  requireValue(
    Object.keys(row).length === keys.length &&
      keys.every((key) => Object.hasOwn(row, key)),
  );
  return row;
}
function text(value: unknown, maximum = 120): string {
  requireValue(
    typeof value === "string" && value.length > 0 && value.length <= maximum,
  );
  return value;
}
function revision(value: unknown): number {
  requireValue(Number.isSafeInteger(value) && (value as number) >= 0);
  return value as number;
}
function uuid(value: unknown): string {
  const result = text(value);
  requireValue(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      result,
    ),
  );
  return result;
}
function list(value: unknown, maximum: number): unknown[] {
  requireValue(Array.isArray(value) && value.length <= maximum);
  return value;
}
function selection(value: unknown): ModelSelection | null {
  if (value === null) return null;
  const row = object(value, ["providerId", "modelId", "reasoning"]);
  return {
    providerId: text(row.providerId),
    modelId: text(row.modelId),
    reasoning: row.reasoning === null ? null : text(row.reasoning),
  };
}
function status(value: unknown): ProviderSettings["globalDefaultStatus"] {
  requireValue(value === "configured_not_tested" || value === "unavailable");
  return value;
}
export function validateProviderSettings(value: unknown): ProviderSettings {
  const row = object(value, [
    "schemaVersion",
    "providers",
    "models",
    "globalDefault",
    "globalDefaultStatus",
  ]);
  requireValue(row.schemaVersion === 1);
  const providers = list(row.providers, 20).map((value) => {
    const item = object(value, ["id", "label", "status"]);
    return {
      id: text(item.id),
      label: text(item.label),
      status: status(item.status),
    };
  });
  const models = list(row.models, 100).map((value) => {
    const item = object(value, ["providerId", "id", "label", "reasoning"]);
    return {
      providerId: text(item.providerId),
      id: text(item.id),
      label: text(item.label),
      reasoning: list(item.reasoning, 20).map((value) => text(value)),
    };
  });
  requireValue(
    new Set(providers.map((row) => row.id)).size === providers.length,
  );
  requireValue(
    new Set(models.map((row) => `${row.providerId}/${row.id}`)).size ===
      models.length,
  );
  requireValue(
    models.every(
      (model) =>
        providers.some((provider) => provider.id === model.providerId) &&
        new Set(model.reasoning).size === model.reasoning.length,
    ),
  );
  return {
    schemaVersion: 1,
    providers,
    models,
    globalDefault: selection(row.globalDefault),
    globalDefaultStatus: status(row.globalDefaultStatus),
  };
}
export function validateProductionSettings(
  value: unknown,
  campaignId: string,
): CampaignProductionSettings {
  const row = object(value, [
    "campaignId",
    "timeline",
    "revision",
    "runtimeRevision",
    "headId",
    "worldPolicy",
    "ruleset",
    "runtimePolicy",
    "pins",
    "providers",
  ]);
  requireValue(row.campaignId === campaignId && isTimelineFence(row.timeline));
  const policy = object(row.worldPolicy, [
    "simulation",
    "autonomy",
    "deadlinePressure",
  ]);
  requireValue(
    typeof policy.simulation === "boolean" &&
      ["low", "moderate", "high"].includes(String(policy.autonomy)) &&
      ["off", "critical_only", "normal"].includes(
        String(policy.deadlinePressure),
      ),
  );
  const rules = object(row.ruleset, [
    "id",
    "version",
    "mode",
    "validatorVersion",
  ]);
  const ruleset = selectableRulesets.find((candidate) =>
    Object.entries(candidate).every(([key, value]) => rules[key] === value),
  );
  requireValue(ruleset);
  let runtimePolicy: CampaignProductionSettings["runtimePolicy"] = null;
  if (row.runtimePolicy !== null) {
    const runtime = object(row.runtimePolicy, [
      "schemaVersion",
      "revision",
      "primary",
      "taskOverrides",
    ]);
    requireValue(
      runtime.schemaVersion === 1 &&
        !!runtime.taskOverrides &&
        typeof runtime.taskOverrides === "object" &&
        !Array.isArray(runtime.taskOverrides),
    );
    const taskOverrides: NonNullable<
      CampaignProductionSettings["runtimePolicy"]
    >["taskOverrides"] = {};
    for (const [task, value] of Object.entries(runtime.taskOverrides)) {
      requireValue(productionTasks.some((supported) => supported === task));
      const chosen = selection(value);
      requireValue(chosen);
      taskOverrides[task as RuntimeTask] = chosen;
    }
    runtimePolicy = {
      schemaVersion: 1,
      revision: revision(runtime.revision),
      primary: selection(runtime.primary),
      taskOverrides,
    };
  }
  const pins = list(row.pins, 32).map((value) => {
    const pin = object(value, [
      "bindingId",
      "packId",
      "packVersionId",
      "sourceVersionIds",
    ]);
    return {
      bindingId: uuid(pin.bindingId),
      packId: uuid(pin.packId),
      packVersionId: uuid(pin.packVersionId),
      sourceVersionIds: list(pin.sourceVersionIds, 128).map(uuid),
    };
  });
  return {
    campaignId,
    timeline: { ...row.timeline },
    revision: revision(row.revision),
    runtimeRevision: revision(row.runtimeRevision),
    headId: row.headId === null ? null : uuid(row.headId),
    worldPolicy: policy as CampaignProductionSettings["worldPolicy"],
    ruleset: { ...ruleset },
    runtimePolicy,
    pins,
    providers: validateProviderSettings(row.providers),
  };
}
export function productionDraft(
  settings: CampaignProductionSettings,
): ProductionDraft {
  return structuredClone({
    worldPolicy: settings.worldPolicy,
    ruleset: settings.ruleset,
    runtimePolicy: settings.runtimePolicy,
  });
}
/** Public policy only; this must never depend on whether hidden work exists. */
export function productionNeedsReconciliation(
  previous: ProductionDraft["worldPolicy"],
  next: ProductionDraft["worldPolicy"],
): boolean {
  const rank = { off: 0, critical_only: 1, normal: 2 };
  return (
    next.simulation &&
    (!previous.simulation ||
      rank[next.deadlinePressure] > rank[previous.deadlinePressure])
  );
}
export function sameProductionDraft(
  a: ProductionDraft,
  b: ProductionDraft,
): boolean {
  const canonical = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object")
      return `{${Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${JSON.stringify(key)}:${canonical(value)}`)
        .join(",")}}`;
    return JSON.stringify(value);
  };
  return canonical(a) === canonical(b);
}
export function productionScopeMatches(
  settings: CampaignProductionSettings,
  campaignId: string,
  timeline: TimelineFence | undefined,
): boolean {
  return (
    settings.campaignId === campaignId &&
    isTimelineFence(timeline) &&
    sameTimeline(settings.timeline, timeline)
  );
}
export function createProductionAttempt(
  previous: ConfigureProductionInput | null,
  baseline: CampaignProductionSettings,
  draft: ProductionDraft,
  createId = () => crypto.randomUUID(),
): ConfigureProductionInput {
  // An uncertain write must be retried exactly, even if a caller supplied a new draft.
  if (previous) return structuredClone(previous);
  return {
    operationId: createId(),
    timeline: { ...baseline.timeline },
    expectedRevision: baseline.revision,
    expectedRuntimeRevision: baseline.runtimeRevision,
    expectedHeadId: baseline.headId,
    worldPolicy: structuredClone(draft.worldPolicy),
    ruleset: structuredClone(draft.ruleset),
    runtimePolicy: draft.runtimePolicy
      ? {
          ...structuredClone(draft.runtimePolicy),
          revision: (baseline.runtimePolicy?.revision ?? 0) + 1,
        }
      : null,
  };
}
export function effectiveSelection(
  settings: Pick<CampaignProductionSettings, "runtimePolicy" | "providers">,
  task?: RuntimeTask,
): {
  selection: ModelSelection | null;
  inheritedFrom: "task" | "campaign" | "global";
  status: ProviderSettings["globalDefaultStatus"];
} {
  const explicit = task
    ? settings.runtimePolicy?.taskOverrides[task]
    : undefined;
  const chosen =
    explicit ??
    settings.runtimePolicy?.primary ??
    settings.providers.globalDefault;
  const inheritedFrom = explicit
    ? "task"
    : settings.runtimePolicy?.primary
      ? "campaign"
      : "global";
  const available =
    chosen &&
    settings.providers.models.some(
      (model) =>
        model.providerId === chosen.providerId &&
        model.id === chosen.modelId &&
        (chosen.reasoning === null ||
          model.reasoning.includes(chosen.reasoning)),
    ) &&
    settings.providers.providers.some(
      (provider) =>
        provider.id === chosen.providerId &&
        provider.status === "configured_not_tested",
    );
  return {
    selection: chosen,
    inheritedFrom,
    status:
      available &&
      (inheritedFrom !== "global" ||
        settings.providers.globalDefaultStatus === "configured_not_tested")
        ? "configured_not_tested"
        : "unavailable",
  };
}
async function request(
  url: string,
  input?: ConfigureProductionInput,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: input ? "POST" : "GET",
      credentials: "same-origin",
      cache: "no-store",
      ...(input
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          }
        : {}),
    });
  } catch {
    throw new ProductionClientError();
  }
  const value = await response.json().catch(() => null);
  if (!response.ok)
    throw new ProductionClientError(
      typeof value?.error?.code === "string" ? value.error.code : "unavailable",
    );
  return value;
}
export async function loadProviderSettings(): Promise<ProviderSettings> {
  return validateProviderSettings(await request("/api/settings/ai"));
}
export async function loadProductionSettings(
  campaignId: string,
): Promise<CampaignProductionSettings> {
  return validateProductionSettings(
    await request(
      `/api/campaigns/${encodeURIComponent(campaignId)}/production`,
    ),
    campaignId,
  );
}
export async function saveProductionSettings(
  campaignId: string,
  input: ConfigureProductionInput,
): Promise<CampaignProductionSettings> {
  const saved = validateProductionSettings(
    await request(
      `/api/campaigns/${encodeURIComponent(campaignId)}/production`,
      input,
    ),
    campaignId,
  );
  if (!sameTimeline(saved.timeline, input.timeline))
    throw new ProductionClientError("conflict");
  return saved;
}

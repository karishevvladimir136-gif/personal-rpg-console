// Browser-safe allowlist and transport. No server/private imports.
import type {
  LabCatalog,
  LabRequest,
  LabRunCommand,
  LabPrepareInput,
  PublicLabRun,
} from "../../lib/world-lab/contracts.ts";

export type LabClientCode =
  | "conflict"
  | "validation"
  | "unavailable"
  | "unauthenticated"
  | "forbidden"
  | "uncertain";
export class LabClientError extends Error {
  readonly code: LabClientCode;
  constructor(code: LabClientCode) {
    super(`World Lab ${code}`);
    this.name = "LabClientError";
    this.code = code;
  }
}
function requireValue(value: unknown): asserts value {
  if (!value) throw new LabClientError("validation");
}
function row(value: unknown, keys: string[]): Record<string, unknown> {
  requireValue(value && typeof value === "object" && !Array.isArray(value));
  requireValue(
    Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null,
  );
  const result = value as Record<string, unknown>;
  requireValue(
    Object.keys(result).length === keys.length &&
      keys.every((key) => Object.hasOwn(result, key)),
  );
  return result;
}
function uuid(value: unknown): string {
  requireValue(
    typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        value,
      ),
  );
  return value;
}
function text(value: unknown, max = 4000): string {
  requireValue(
    typeof value === "string" &&
      value.length <= max &&
      value.trim().length > 0 &&
      !value.includes("\0"),
  );
  return value;
}
function number(value: unknown, min = 0, max = 2_147_483_646): number {
  requireValue(
    typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= min &&
      value <= max,
  );
  return value;
}
function array<T>(
  value: unknown,
  parse: (value: unknown) => T,
  max = 500,
): T[] {
  requireValue(Array.isArray(value) && value.length <= max);
  return value.map(parse);
}
function unique<T>(values: T[], key: (value: T) => string): T[] {
  requireValue(new Set(values.map(key)).size === values.length);
  return values;
}
function base(value: unknown): PublicLabRun["base"] {
  const r = row(value, ["saveId", "timelineId", "label", "worldMinutes"]);
  return {
    saveId: uuid(r.saveId),
    timelineId: uuid(r.timelineId),
    label: text(r.label, 200),
    worldMinutes: number(r.worldMinutes),
  };
}
function scenario(value: unknown): PublicLabRun["scenario"] {
  const r = row(value, [
    "scenarioVersionId",
    "divergenceVersionId",
    "scenarioTitle",
    "divergenceTitle",
    "assumptions",
    "changes",
  ]);
  return {
    scenarioVersionId: uuid(r.scenarioVersionId),
    divergenceVersionId: uuid(r.divergenceVersionId),
    scenarioTitle: text(r.scenarioTitle, 240),
    divergenceTitle: text(r.divergenceTitle, 240),
    assumptions: array(r.assumptions, (value) => text(value), 200),
    changes: array(r.changes, (value) => text(value), 200),
  };
}
export function readPublicLabRun(
  value: unknown,
  campaignId: string,
): PublicLabRun {
  uuid(campaignId);
  const r = row(value, [
    "id",
    "campaignId",
    "timelineId",
    "label",
    "purpose",
    "nonCanon",
    "status",
    "reason",
    "revision",
    "base",
    "scenario",
    "startWorldMinutes",
    "throughWorldMinutes",
    "currentWorldMinutes",
    "checkpoints",
  ]);
  requireValue(
    r.campaignId === campaignId &&
      r.purpose === "simulation" &&
      r.nonCanon === true,
  );
  requireValue(
    [
      "prepared",
      "running",
      "paused",
      "completed",
      "cancelled",
      "failed",
    ].includes(String(r.status)),
  );
  requireValue(
    r.reason === null ||
      [
        "review_required",
        "source_changed",
        "unsupported",
        "work_limit",
        "cancelled",
        "unavailable",
      ].includes(String(r.reason)),
  );
  const startWorldMinutes = number(r.startWorldMinutes),
    throughWorldMinutes = number(
      r.throughWorldMinutes,
      startWorldMinutes + 1,
      Math.min(startWorldMinutes + 43_200, 2_147_483_646),
    );
  const currentWorldMinutes = number(
    r.currentWorldMinutes,
    startWorldMinutes,
    throughWorldMinutes,
  );
  const checkpoints = unique(
    array(
      r.checkpoints,
      (value) => {
        const c = row(value, [
          "id",
          "ordinal",
          "worldMinutes",
          "summary",
          "events",
        ]);
        const worldMinutes = number(
          c.worldMinutes,
          startWorldMinutes,
          currentWorldMinutes,
        );
        return {
          id: uuid(c.id),
          ordinal: number(c.ordinal),
          worldMinutes,
          summary: text(c.summary, 8000),
          events: unique(
            array(
              c.events,
              (value) => {
                const e = row(value, ["id", "text", "worldMinutes"]);
                return {
                  id: uuid(e.id),
                  text: text(e.text, 8000),
                  worldMinutes: number(e.worldMinutes, 0, worldMinutes),
                };
              },
              100_000,
            ),
            (event) => event.id,
          ),
        };
      },
      33,
    ),
    (checkpoint) => checkpoint.id,
  );
  unique(checkpoints, (checkpoint) => String(checkpoint.ordinal));
  checkpoints.sort((a, b) => a.ordinal - b.ordinal);
  requireValue(
    checkpoints.every(
      (checkpoint, index) =>
        index === 0 ||
        checkpoint.worldMinutes >= checkpoints[index - 1].worldMinutes,
    ),
  );
  const result = {
    id: uuid(r.id),
    campaignId,
    timelineId: uuid(r.timelineId),
    label: text(r.label, 160),
    purpose: "simulation" as const,
    nonCanon: true as const,
    status: r.status as PublicLabRun["status"],
    reason: r.reason as PublicLabRun["reason"],
    revision: number(r.revision),
    base: base(r.base),
    scenario: scenario(r.scenario),
    startWorldMinutes,
    throughWorldMinutes,
    currentWorldMinutes,
    checkpoints,
  };
  requireValue(result.base.worldMinutes === startWorldMinutes);
  return result;
}
export function readLabCatalog(value: unknown, campaignId: string): LabCatalog {
  uuid(campaignId);
  const r = row(value, ["campaignId", "bases", "scenarios", "runs"]);
  requireValue(r.campaignId === campaignId);
  return {
    campaignId,
    bases: unique(array(r.bases, base), (entry) => entry.saveId),
    scenarios: unique(
      array(r.scenarios, scenario),
      (entry) => entry.divergenceVersionId,
    ),
    runs: unique(
      array(r.runs, (value) => readPublicLabRun(value, campaignId)),
      (entry) => entry.id,
    ),
  };
}

export function readLabAttempt(value: unknown, campaignId: string): LabRequest {
  const request = row(value, ["action", "input"]);
  requireValue(
    ["prepare", "continue", "pause", "cancel", "resume"].includes(
      String(request.action),
    ),
  );
  const prepare = request.action === "prepare";
  const input = row(
    request.input,
    prepare
      ? [
          "operationId",
          "campaignId",
          "saveId",
          "scenarioVersionId",
          "divergenceVersionId",
          "label",
          "horizonMinutes",
        ]
      : ["operationId", "campaignId", "runId", "expectedRevision"],
  );
  requireValue(uuid(input.campaignId) === uuid(campaignId));
  uuid(input.operationId);
  if (prepare) {
    uuid(input.saveId);
    uuid(input.scenarioVersionId);
    uuid(input.divergenceVersionId);
    text(input.label, 160);
    number(input.horizonMinutes, 1, 43_200);
  } else {
    uuid(input.runId);
    number(input.expectedRevision);
  }
  return structuredClone(request) as LabRequest;
}
export function prepareLabAttempt(
  catalog: LabCatalog,
  input: Omit<LabPrepareInput, "operationId" | "campaignId">,
  allocate = () => crypto.randomUUID(),
): LabRequest {
  requireValue(catalog.bases.some((base) => base.saveId === input.saveId));
  requireValue(
    catalog.scenarios.some(
      (scenario) =>
        scenario.scenarioVersionId === input.scenarioVersionId &&
        scenario.divergenceVersionId === input.divergenceVersionId,
    ),
  );
  return readLabAttempt(
    {
      action: "prepare",
      input: {
        ...input,
        operationId: allocate(),
        campaignId: catalog.campaignId,
      },
    },
    catalog.campaignId,
  );
}
export function runLabAttempt(
  action: Exclude<LabRequest["action"], "prepare">,
  run: PublicLabRun,
  allocate = () => crypto.randomUUID(),
): LabRequest {
  const input: LabRunCommand = {
    operationId: allocate(),
    campaignId: run.campaignId,
    runId: run.id,
    expectedRevision: run.revision,
  };
  return readLabAttempt({ action, input }, run.campaignId);
}
export function labControls(run: PublicLabRun) {
  const terminal = run.status === "completed" || run.status === "cancelled";
  return {
    continue: run.status === "prepared" || run.status === "running",
    pause: run.status === "prepared" || run.status === "running",
    cancel: !terminal,
    resume:
      ["paused", "failed"].includes(run.status) &&
      !["source_changed", "work_limit", "unsupported"].includes(
        run.reason ?? "",
      ),
    replace: run.status === "running",
  };
}
export function mergeLabRun(
  catalog: LabCatalog,
  run: PublicLabRun,
): LabCatalog {
  requireValue(run.campaignId === catalog.campaignId);
  const previous = catalog.runs.find((entry) => entry.id === run.id);
  if (previous && previous.revision > run.revision) return catalog;
  return {
    ...catalog,
    runs: previous
      ? catalog.runs.map((entry) => (entry.id === run.id ? run : entry))
      : [run, ...catalog.runs],
  };
}

type Fetcher = typeof fetch;
const url = "/api/world-lab";
async function responseJson(
  response: Response,
  mutation: boolean,
): Promise<unknown> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new LabClientError(mutation ? "uncertain" : "unavailable");
  }
  if (!response.ok) {
    if (mutation && response.status >= 500)
      throw new LabClientError("uncertain");
    const envelope =
      data && typeof data === "object" && "error" in data ? data.error : null;
    const value =
      envelope && typeof envelope === "object" && "code" in envelope
        ? envelope.code
        : "unavailable";
    const code = value === "scope" ? "forbidden" : value;
    throw new LabClientError(
      [
        "conflict",
        "validation",
        "unavailable",
        "unauthenticated",
        "forbidden",
      ].includes(String(code))
        ? (code as LabClientCode)
        : "unavailable",
    );
  }
  return data;
}
export async function loadLabCatalog(
  campaignId: string,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
  language: "en" | "ru" = "en",
): Promise<LabCatalog> {
  uuid(campaignId);
  try {
    return readLabCatalog(
      await responseJson(
        await fetcher(`${url}?campaignId=${encodeURIComponent(campaignId)}`, {
          signal,
          cache: "no-store",
          credentials: "same-origin",
          headers: { "Accept-Language": language },
        }),
        false,
      ),
      campaignId,
    );
  } catch (error) {
    if (
      error instanceof LabClientError ||
      (error instanceof Error && error.name === "AbortError")
    )
      throw error;
    throw new LabClientError("unavailable");
  }
}
export async function sendLabAttempt(
  request: LabRequest,
  fetcher: Fetcher = fetch,
  language: "en" | "ru" = "en",
): Promise<PublicLabRun> {
  const attempt = readLabAttempt(request, request.input.campaignId);
  try {
    const result = await fetcher(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": language,
      },
      body: JSON.stringify(attempt),
    });
    const body = await responseJson(result, true);
    try {
      return readPublicLabRun(body, attempt.input.campaignId);
    } catch {
      throw new LabClientError("uncertain");
    }
  } catch (error) {
    if (error instanceof LabClientError) throw error;
    throw new LabClientError("uncertain");
  }
}

export type LabTransport = {
  load: (campaignId: string, signal?: AbortSignal) => Promise<LabCatalog>;
  send: (request: LabRequest) => Promise<PublicLabRun>;
};
export const labTransport: LabTransport = {
  load: loadLabCatalog,
  send: sendLabAttempt,
};
export function createLabTransport(language: "en" | "ru"): LabTransport {
  return {
    load: (campaignId, signal) =>
      loadLabCatalog(campaignId, signal, fetch, language),
    send: (request) => sendLabAttempt(request, fetch, language),
  };
}
export function pendingLabKey(campaignId: string): string {
  return `world-lab-pending:${uuid(campaignId)}`;
}
export function restoreLabAttempt(
  value: string | null,
  campaignId: string,
): LabRequest | null {
  if (value === null || value.length > 3000) return null;
  try {
    return readLabAttempt(JSON.parse(value), campaignId);
  } catch {
    return null;
  }
}

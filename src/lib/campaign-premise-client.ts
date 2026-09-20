import type {
  CampaignPremise,
  CampaignPremiseCommand,
  CampaignPremiseInput,
  CampaignPremiseVersion,
} from "./production/premise-contracts.ts";
import { parseCampaignPremiseInput } from "./production/premise.ts";
import type { TimelineFence } from "./saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "./saves/fence.ts";

export const premiseMaximumLength = 20_000;
const codes = new Set([
  "unauthenticated",
  "forbidden",
  "not_found",
  "validation",
  "conflict",
  "busy",
  "unavailable",
  "not_configured",
]);
export class PremiseClientError extends Error {
  readonly code: string;
  constructor(code = "unavailable") {
    super(codes.has(code) ? code : "unavailable");
    this.code = this.message;
  }
}
function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new PremiseClientError();
}
function object(value: unknown, keys: string[]): Record<string, unknown> {
  requireValue(value && typeof value === "object" && !Array.isArray(value));
  const row = value as Record<string, unknown>;
  requireValue(
    Object.keys(row).length === keys.length &&
      keys.every((key) => Object.hasOwn(row, key)),
  );
  return row;
}
function integer(value: unknown, minimum = 0): number {
  requireValue(Number.isSafeInteger(value) && (value as number) >= minimum);
  return value as number;
}
function uuid(value: unknown): string {
  requireValue(
    typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
  return value;
}
function version(value: unknown): CampaignPremiseVersion {
  const row = object(value, [
    "id",
    "documentId",
    "version",
    "text",
    "language",
    "reviewStatus",
    "authoredBy",
    "digest",
    "previousVersionId",
    "restoredFromVersionId",
    "createdAt",
  ]);
  requireValue(row.reviewStatus === "draft" || row.reviewStatus === "reviewed");
  requireValue(
    typeof row.digest === "string" && /^[a-f0-9]{64}$/.test(row.digest),
  );
  requireValue(
    typeof row.createdAt === "string" &&
      Number.isFinite(Date.parse(row.createdAt)),
  );
  let input: CampaignPremiseInput;
  try {
    input = parseCampaignPremiseInput({
      text: row.text,
      language: row.language,
    });
  } catch {
    throw new PremiseClientError();
  }
  return {
    ...input,
    id: uuid(row.id),
    documentId: uuid(row.documentId),
    version: integer(row.version, 1),
    reviewStatus: row.reviewStatus,
    authoredBy: uuid(row.authoredBy),
    digest: row.digest,
    createdAt: row.createdAt,
    previousVersionId:
      row.previousVersionId === null ? null : uuid(row.previousVersionId),
    restoredFromVersionId:
      row.restoredFromVersionId === null
        ? null
        : uuid(row.restoredFromVersionId),
  };
}
export function validateCampaignPremise(
  value: unknown,
  campaignId: string,
  before: number | null = null,
): CampaignPremise {
  const row = object(value, [
    "schemaVersion",
    "campaignId",
    "timeline",
    "revision",
    "current",
    "versions",
    "olderThan",
  ]);
  requireValue(
    row.schemaVersion === 1 &&
      row.campaignId === campaignId &&
      isTimelineFence(row.timeline),
  );
  requireValue(Array.isArray(row.versions) && row.versions.length <= 32);
  const current = row.current === null ? null : version(row.current);
  const revision = integer(row.revision);
  const versions = row.versions.map(version);
  const olderThan = row.olderThan === null ? null : integer(row.olderThan, 1);
  requireValue(
    current
      ? current.version === revision
      : revision === 0 && versions.length === 0 && olderThan === null,
  );
  requireValue(
    new Set(versions.map((item) => item.id)).size === versions.length,
  );
  requireValue(
    versions.every(
      (item, index) =>
        item.documentId === current?.documentId &&
        item.version <= revision &&
        (before === null || item.version < before) &&
        (index === 0 || item.version < versions[index - 1].version),
    ),
  );
  requireValue(
    olderThan === null ||
      (versions.length === 32 && olderThan === versions.at(-1)?.version),
  );
  if (current && before === null)
    requireValue(JSON.stringify(versions[0]) === JSON.stringify(current));
  return {
    schemaVersion: 1,
    campaignId,
    timeline: { ...row.timeline },
    revision,
    current,
    versions,
    olderThan,
  };
}
export function premiseScopeMatches(
  premise: Pick<CampaignPremise, "campaignId" | "timeline">,
  campaignId: string,
  timeline: TimelineFence | undefined,
): boolean {
  return (
    premise.campaignId === campaignId &&
    isTimelineFence(timeline) &&
    sameTimeline(premise.timeline, timeline)
  );
}
export function samePremiseHead(
  a: CampaignPremise,
  b: CampaignPremise,
): boolean {
  return (
    premiseScopeMatches(a, b.campaignId, b.timeline) &&
    a.revision === b.revision &&
    a.current?.id === b.current?.id
  );
}
export function premiseDraft(
  premise: CampaignPremise,
  language: "en" | "ru",
): CampaignPremiseInput {
  return premise.current
    ? { text: premise.current.text, language: premise.current.language }
    : { text: "", language };
}
export function samePremiseDraft(
  a: CampaignPremiseInput,
  b: CampaignPremiseInput,
): boolean {
  return a.text === b.text && a.language === b.language;
}
export function optionalCreationPremise(
  input: CampaignPremiseInput,
): CampaignPremiseInput | undefined {
  try {
    return input.text.trim() ? parseCampaignPremiseInput(input) : undefined;
  } catch {
    throw new PremiseClientError("validation");
  }
}
export type PremiseAction =
  | { action: "save"; text: string; language: "en" | "ru" }
  | { action: "review" }
  | { action: "restore"; versionId: string };
export function createPremiseAttempt(
  previous: CampaignPremiseCommand | null,
  baseline: CampaignPremise,
  action: PremiseAction,
  createId = () => crypto.randomUUID(),
): CampaignPremiseCommand {
  // Never change an uncertain request, including its revision or exact original text.
  return previous
    ? structuredClone(previous)
    : {
        ...structuredClone(action),
        operationId: createId(),
        timeline: { ...baseline.timeline },
        expectedRevision: baseline.revision,
      };
}
export function mergePremiseHistory(
  current: CampaignPremise,
  page: CampaignPremise,
): CampaignPremise {
  if (
    !samePremiseHead(current, page) ||
    current.olderThan === null ||
    page.versions.some((row) => row.version >= current.olderThan!)
  )
    throw new PremiseClientError("conflict");
  const ids = new Set(current.versions.map((row) => row.id));
  if (page.versions.some((row) => ids.has(row.id)))
    throw new PremiseClientError("conflict");
  return {
    ...current,
    versions: [...current.versions, ...page.versions],
    olderThan: page.olderThan,
  };
}

type RequestScope = { campaignId: string; timeline: TimelineFence | undefined };
type Ticket = RequestScope & { serial: number };
// A synchronous gate prevents duplicate callbacks before React rerenders. Its scope
// check also rejects replies after a campaign/timeline switch or a newer read.
export function createPremiseRequestGate() {
  let serial = 0;
  let pending: Ticket | null = null;
  return {
    begin(scope: RequestScope, replace = false): Ticket | null {
      if ((!replace && pending) || !isTimelineFence(scope.timeline))
        return null;
      pending = {
        campaignId: scope.campaignId,
        timeline: { ...scope.timeline },
        serial: ++serial,
      };
      return pending;
    },
    accepts(ticket: Ticket, scope: RequestScope): boolean {
      return (
        pending === ticket &&
        ticket.campaignId === scope.campaignId &&
        sameTimeline(ticket.timeline, scope.timeline)
      );
    },
    finish(ticket: Ticket) {
      if (pending === ticket) pending = null;
    },
    invalidate() {
      pending = null;
    },
  };
}
async function request(
  campaignId: string,
  before: number | null,
  command?: CampaignPremiseCommand,
): Promise<CampaignPremise> {
  let response: Response;
  try {
    response = await fetch(
      `/api/campaigns/${encodeURIComponent(campaignId)}/premise${before === null ? "" : `?before=${before}`}`,
      {
        method: command ? "POST" : "GET",
        credentials: "same-origin",
        cache: "no-store",
        ...(command
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(command),
            }
          : {}),
      },
    );
  } catch {
    throw new PremiseClientError();
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new PremiseClientError(
      typeof body?.error?.code === "string" ? body.error.code : "unavailable",
    );
  return validateCampaignPremise(body, campaignId, before);
}
export async function loadCampaignPremise(
  campaignId: string,
  before: number | null = null,
): Promise<CampaignPremise> {
  if (before !== null && (!Number.isSafeInteger(before) || before < 1))
    throw new PremiseClientError("validation");
  return request(campaignId, before);
}
export async function writeCampaignPremise(
  campaignId: string,
  command: CampaignPremiseCommand,
): Promise<CampaignPremise> {
  const saved = await request(campaignId, null, command);
  if (!sameTimeline(saved.timeline, command.timeline))
    throw new PremiseClientError("conflict");
  if (saved.revision !== command.expectedRevision + 1)
    throw new PremiseClientError();
  return saved;
}

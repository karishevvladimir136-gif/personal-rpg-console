import type {
  ApiError,
  CampaignSnapshot,
  DocumentVersion,
  Mutation,
  MutationInput,
  MutationResult,
  Workspace,
} from "./contracts.ts";

const safeMessages: Record<string, string> = {
  unauthenticated: "Please sign in again. Your unsaved text is still here.",
  forbidden: "Only the configured owner can access this application.",
  not_configured: "Persistence setup is required before saving.",
  validation: "Please check the fields and linked records before saving.",
  conflict:
    "This record changed since you opened it. Your draft is preserved; compare the latest version before saving again.",
  not_found: "This record is no longer available in this campaign.",
  unavailable:
    "The save could not be confirmed. Your draft is preserved. Please retry.",
};
export class ClientPersistenceError extends Error {
  code: string;
  constructor(code: string) {
    super(safeMessages[code] ?? safeMessages.unavailable);
    this.code = code;
  }
}
export function errorMessage(error: unknown) {
  return error instanceof ClientPersistenceError
    ? error.message
    : safeMessages.unavailable;
}
export async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ClientPersistenceError("unavailable");
  }
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new ClientPersistenceError(
      (result as ApiError | null)?.error?.code ?? "unavailable",
    );
  if (!result) throw new ClientPersistenceError("unavailable");
  return result as T;
}
export function saveMutation(input: Mutation) {
  return readJson<MutationResult>("/api/mutations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
export const loadWorkspace = () => readJson<Workspace>("/api/workspace");
export const loadCampaign = (id: string) =>
  readJson<CampaignSnapshot>(`/api/campaigns/${encodeURIComponent(id)}`);
export const loadVersions = (campaignId: string, documentId: string) =>
  readJson<DocumentVersion[]>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/documents/${encodeURIComponent(documentId)}/versions`,
  );

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
export function createMutationAttempt(
  previous: Mutation | null,
  input: MutationInput,
): Mutation {
  if (previous) {
    const { requestId, ...prior } = previous;
    if (canonical(prior) === canonical(input))
      return { ...input, requestId } as Mutation;
  }
  return { ...input, requestId: crypto.randomUUID() } as Mutation;
}

import type {
  OwnerLibraryCommand,
  OwnerLibraryDraftCommand,
  OwnerLibraryIndex,
  OwnerLibraryResult,
  OwnerPackDetail,
  OwnerSourceDetail,
} from "./owner-contracts.ts";

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    const code = body?.error?.code;
    throw new Error(
      code === "conflict"
        ? "This version changed. Reload and review the latest version before saving."
        : code === "validation"
          ? "Check the entered values and review acknowledgements."
          : code === "unauthenticated"
            ? "Sign in to open your World Library."
            : code === "not_configured"
              ? "Complete the existing Supabase owner setup before using World Library."
              : "The change was not confirmed. Retry the same action to keep its operation identity.",
    );
  }
  return body as T;
}
export async function readOwnerLibrary(
  signal?: AbortSignal,
): Promise<OwnerLibraryIndex> {
  return readResponse(
    await fetch("/api/world-library", { cache: "no-store", signal }),
  );
}
export async function readOwnerSource(
  versionId: string,
): Promise<OwnerSourceDetail> {
  return readResponse(
    await fetch(
      `/api/world-library?kind=source&versionId=${encodeURIComponent(versionId)}`,
      { cache: "no-store" },
    ),
  );
}
export async function readOwnerPack(
  versionId: string,
): Promise<OwnerPackDetail> {
  return readResponse(
    await fetch(
      `/api/world-library?kind=pack&versionId=${encodeURIComponent(versionId)}`,
      { cache: "no-store" },
    ),
  );
}
export async function writeOwnerLibrary(
  input: OwnerLibraryCommand,
): Promise<OwnerLibraryResult> {
  return readResponse(
    await fetch("/api/world-library", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

// Keeps a lost-response retry stable, but new edits get a new operation identity.
export function ownerLibraryAttempt(
  previous: OwnerLibraryCommand | null,
  input: OwnerLibraryDraftCommand,
  allocateId = () => crypto.randomUUID(),
): OwnerLibraryCommand {
  if (previous) {
    const old = { ...previous } as Partial<OwnerLibraryCommand>;
    delete old.operationId;
    if (JSON.stringify(old) === JSON.stringify(input)) return previous;
  }
  return { ...input, operationId: allocateId() } as OwnerLibraryCommand;
}

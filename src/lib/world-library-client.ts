import type {
  OwnerLibraryCommand,
  OwnerLibraryDraftCommand,
  OwnerLibraryIndex,
  OwnerLibraryResult,
  OwnerPackDetail,
  OwnerSourceDetail,
  OwnerDescribeInput,
  OwnerJobSummary,
} from "./world-library/owner-contracts.ts";
import type { PackBody, PackClaim } from "./world-library/types.ts";

async function readResponse<T>(
  response: Response,
  assisted = false,
): Promise<T> {
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
              ? assisted
                ? "Assistance is unavailable. Check the configured compiler model and provider setup. No substitute model was selected."
                : "Complete the existing Supabase owner setup before using World Library."
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
    input.action === "pack.refine" ||
      input.action === "compiler.retry" ||
      (input.action === "compiler.start" && input.mode === "assisted"),
  );
}

// Copy only the authoring fields. Original text must never be trimmed or translated.
export function ownerDescriptionDraft(
  input: Omit<OwnerDescribeInput, "action" | "operationId">,
): OwnerLibraryDraftCommand {
  const {
    sourceId,
    expectedVersionId,
    title,
    text,
    language,
    visibility,
    knowledge,
  } = input;
  return {
    action: "source.describe",
    sourceId,
    expectedVersionId,
    title,
    text,
    language,
    visibility,
    knowledge,
  };
}

export function ownerPackDraft(
  detail: OwnerPackDetail,
  body: PackBody,
  rejectedClaimIds: string[] = [],
): OwnerLibraryDraftCommand {
  return {
    action: "pack.save",
    expectedVersionId: detail.versionId,
    title: body.title,
    entities: body.entities.map(({ id, name, kind, aliases }) => ({
      id,
      name,
      kind,
      aliases: aliases.map((alias) => alias.trim()).filter(Boolean),
    })),
    unknownNotes: body.unknowns.map(({ id, ownerNote }) => ({
      id,
      note: ownerNote?.trim() ? ownerNote : null,
    })),
    claims: body.claims
      .filter((claim) => !rejectedClaimIds.includes(claim.id))
      .map(
        ({
          id,
          text,
          origin,
          epistemic,
          visibility,
          knowledge,
          validFrom,
          validUntil,
          knownByEntityIds,
          uncertainty,
        }) => ({
          id,
          text,
          origin,
          epistemic,
          visibility,
          knowledge,
          validFrom,
          validUntil,
          knownByEntityIds: [...knownByEntityIds],
          uncertainty,
        }),
      ),
    resolutions: body.contradictions.map(({ id, resolution }) => ({
      id,
      resolution,
    })),
    rejectedClaimIds: [...rejectedClaimIds],
  };
}

export function ownerClaimCanonEligible(
  body: PackBody,
  claim: PackClaim,
): boolean {
  return (
    ["canon_at_entry", "character"].includes(claim.knowledge) &&
    claim.validFrom !== null &&
    Number.isSafeInteger(claim.validFrom) &&
    claim.validFrom >= 0 &&
    (claim.validUntil === null || claim.validUntil > claim.validFrom) &&
    (claim.knowledge !== "character" || claim.knownByEntityIds.length > 0) &&
    claim.epistemic === "fact" &&
    !body.contradictions.some(
      (c) => c.status === "unresolved" && c.claimIds.includes(claim.id),
    )
  );
}

// A read never advances a job. The UI must render the returned action as an explicit button.
export function ownerCompilerAction(job: OwnerJobSummary): {
  action: "compiler.step" | "compiler.retry";
  label: string;
  providerRequest: boolean;
} | null {
  if (job.status === "invalidated" || job.status === "completed") return null;
  if (job.requestPending || job.status === "failed")
    return job.mode === "assisted"
      ? {
          action: "compiler.retry",
          label: "Prepare explicit retry",
          providerRequest: false,
        }
      : null;
  const providerRequest = job.mode === "assisted" && job.status === "indexing";
  return {
    action: "compiler.step",
    providerRequest,
    label:
      job.status === "queued"
        ? "Begin extraction"
        : job.status === "extracting"
          ? "Extract source lines"
          : providerRequest
            ? "Request assisted draft"
            : job.status === "indexing"
              ? "Index draft claims"
              : job.status === "auditing"
                ? "Audit and prepare review"
                : "Open or recover review draft",
  };
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

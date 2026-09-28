import type {
  CampaignSnapshot,
  DocumentRecord,
  Mutation,
  MutationResult,
} from "../../persistence/contracts.ts";
import { validateMutation } from "../../persistence/validation.ts";
import { sameTimeline } from "../../saves/fence.ts";
import {
  exactKeys,
  parseRealFrame,
  realFrameDocumentMutation,
  realFrameAssetMutation,
  realFrameIsCurrent,
  validateRealFrameLifecycle,
  frameStoragePath,
  isFrameOutput,
} from "../../visual-frame/real-frame.ts";
import { checkedPng } from "./png.ts";
import { textOnlyReservationFloor, reportedUsageCost } from "./pricing.ts";
import type {
  RealFrame,
  FrameOutput,
  ImageModel,
  FrameParameters,
  FrameSourceAuthority,
} from "../../visual-frame/real-frame.ts";
import { isFrameCheckResult } from "./grounding-state.ts";
import type { FrameCheckResult } from "./grounding-state.ts";

export type FrameCheckInput = {
  campaignId: string;
  jobId: string;
  jobVersionId: string;
  imageSha256: string;
};
export class MediaFrameError extends Error {
  code:
    "validation" | "conflict" | "not_found" | "not_configured" | "unavailable";
  constructor(code: MediaFrameError["code"]) {
    super(code);
    this.code = code;
  }
}
export type MediaPolicy = {
  model: ImageModel;
  parameters: FrameParameters;
  reservationUsdMicros: number;
  budgetId: string;
};
export type MediaFrameAuthority = {
  authorize: (campaignId: string) => Promise<void>;
  receipt: (input: Mutation) => Promise<MutationResult | null>;
  snapshot: (campaignId: string) => Promise<CampaignSnapshot>;
  source: (campaignId: string) => Promise<FrameSourceAuthority>;
  lifecycle: (input: Mutation) => Promise<MutationResult>;
  claim: (
    input: Mutation,
    budgetId: string,
  ) => Promise<{ result: MutationResult; claimed: boolean }>;
  checkClaim?: (
    input: FrameCheckInput,
  ) => Promise<{ claimed: boolean; result: FrameCheckResult | null }>;
  checkComplete?: (
    input: FrameCheckInput,
    result: FrameCheckResult,
  ) => Promise<FrameCheckResult>;
  recoveryReceipt?: (input: Mutation) => Promise<MutationResult | null>;
  draft?: (input: Mutation, output: FrameOutput) => Promise<MutationResult>;
  complete: (
    input: Mutation,
    asset: Mutation,
    output: FrameOutput,
  ) => Promise<MutationResult>;
};
export type MediaPixels = { bytes: Uint8Array; output: FrameOutput };
export type MediaStore = {
  read: (campaignId: string, jobId: string) => Promise<MediaPixels | null>;
  put: (
    campaignId: string,
    jobId: string,
    pixels: MediaPixels,
  ) => Promise<void>;
};
export type MediaProvider = {
  generate: (frame: RealFrame, jobId: string) => Promise<MediaPixels>;
};
export type MediaDependencies = {
  authority: MediaFrameAuthority;
  policy: MediaPolicy | null;
  store: MediaStore;
  provider: MediaProvider;
  verifier?: {
    preflight: (frame: RealFrame) => void;
    check: (
      frame: RealFrame,
      pixels: MediaPixels,
      jobId: string,
      operationId: string,
    ) => Promise<FrameCheckResult>;
  };
};
export type MediaCommand =
  | { action: "media.save"; input: Mutation }
  | { action: "media.dispatch"; input: Mutation }
  | { action: "media.recover"; input: Mutation }
  | { action: "media.accept"; input: Mutation }
  | { action: "media.discard"; input: Mutation };
export type MediaResult = {
  result: MutationResult;
  status: RealFrame["status"];
  dispatched: boolean;
};
function command(value: unknown): MediaCommand {
  if (
    !exactKeys(value, ["action", "input"]) ||
    ![
      "media.save",
      "media.dispatch",
      "media.recover",
      "media.accept",
      "media.discard",
    ].includes(String(value.action))
  )
    throw new MediaFrameError("validation");
  let input: Mutation;
  try {
    input = validateMutation(value.input);
  } catch {
    throw new MediaFrameError("validation");
  }
  if (
    input.operation !== "document.save" ||
    input.correctionScope !== "campaign" ||
    !parseRealFrame(input.payload)
  )
    throw new MediaFrameError("validation");
  return { action: value.action as MediaCommand["action"], input };
}
function policyMatches(
  frame: RealFrame,
  policy: MediaPolicy | null,
): policy is MediaPolicy {
  return Boolean(
    policy &&
    frame.model === policy.model &&
    JSON.stringify(frame.parameters) === JSON.stringify(policy.parameters) &&
    frame.dispatch?.reservationUsdMicros === policy.reservationUsdMicros,
  );
}
function recordFor(snapshot: CampaignSnapshot, input: Mutation) {
  if (input.operation !== "document.save")
    throw new MediaFrameError("validation");
  const record = snapshot.documents.find(
    (r) => r.campaign_id === input.campaignId && r.id === input.payload.id,
  );
  if (
    !record ||
    record.status !== "reference" ||
    record.id === snapshot.dmGuideDocumentId
  )
    throw new MediaFrameError("not_found");
  const frame = parseRealFrame(record);
  if (!frame || frame.campaign_id !== snapshot.campaign.id)
    throw new MediaFrameError("validation");
  return { record, frame };
}
function baseMutation(
  snapshot: CampaignSnapshot,
  frame: RealFrame,
  record: DocumentRecord,
  requestId: string,
): Mutation {
  return { ...realFrameDocumentMutation(snapshot, frame, record), requestId };
}
function stripRequest(input: Mutation) {
  const { requestId, ...mutation } = input;
  void requestId;
  return mutation;
}
function requireVerifier(deps: MediaDependencies, frame: RealFrame) {
  if (
    frame.schema !== 4 ||
    !deps.verifier ||
    !deps.authority.checkClaim ||
    !deps.authority.checkComplete
  )
    throw new MediaFrameError("not_configured");
  try {
    deps.verifier.preflight(frame);
  } catch {
    throw new MediaFrameError("not_configured");
  }
}
function immutableClaim(previous: RealFrame, next: RealFrame) {
  return (
    previous.status === "queued" &&
    next.status === "generating" &&
    next.dispatch !== null &&
    JSON.stringify({
      ...previous,
      status: "generating",
      dispatch: next.dispatch,
    }) === JSON.stringify(next)
  );
}
export async function executeMediaFrame(
  value: unknown,
  deps: MediaDependencies,
): Promise<MediaResult> {
  const { action, input } = command(value);
  if (input.operation !== "document.save")
    throw new MediaFrameError("validation");
  const next = parseRealFrame(input.payload)!;
  await deps.authority.authorize(input.campaignId);
  // Authorize and exact original receipt precede every mutable source/preflight. A replay never redispatches.
  const receipt =
    action === "media.recover" && next.schema === 4
      ? ((await deps.authority.recoveryReceipt?.(input)) ?? null)
      : await deps.authority.receipt(input);
  if (receipt)
    return {
      result: receipt,
      status:
        action === "media.recover" && next.schema === 4 ? "draft" : next.status,
      dispatched: false,
    };
  if (action === "media.accept") {
    const snapshot = await deps.authority.snapshot(input.campaignId);
    const current = recordFor(snapshot, input);
    const previous = current.frame;
    if (
      next.schema !== 4 ||
      previous.schema !== 4 ||
      previous.status !== "draft" ||
      next.status !== "completed" ||
      next.resultAssetId !== current.record.id ||
      !previous.review ||
      current.record.revision !== input.expectedRevision ||
      !sameTimeline(snapshot.timeline, input.timeline) ||
      !realFrameIsCurrent(
        snapshot,
        previous,
        await deps.authority.source(input.campaignId),
      ) ||
      JSON.stringify({
        ...previous,
        status: "completed",
        resultAssetId: current.record.id,
      }) !== JSON.stringify(next) ||
      JSON.stringify(
        realFrameDocumentMutation(snapshot, next, current.record),
      ) !== JSON.stringify(stripRequest(input))
    )
      throw new MediaFrameError("conflict");
    const pixels = await deps.store.read(input.campaignId, current.record.id);
    if (
      !pixels ||
      !isFrameOutput(pixels.output) ||
      pixels.output.sha256 !== previous.review.imageSha256 ||
      pixels.output.storagePath !==
        frameStoragePath(input.campaignId, current.record.id) ||
      pixels.output.bytes !== pixels.bytes.byteLength ||
      checkedPng(pixels.bytes, next.parameters) !== pixels.output.sha256
    )
      throw new MediaFrameError("unavailable");
    const asset: Mutation = {
      ...realFrameAssetMutation(
        snapshot,
        current.record,
        next,
        pixels.output,
        current.record.id,
        input.requestId,
      ),
      requestId: current.record.current_version_id,
    };
    return {
      result: await deps.authority.complete(input, asset, pixels.output),
      status: "completed",
      dispatched: false,
    };
  }
  if (action === "media.save" || action === "media.discard") {
    if (action === "media.discard" && next.status !== "discarded")
      throw new MediaFrameError("validation");
    const snapshot = await deps.authority.snapshot(input.campaignId);
    validateRealFrameLifecycle(
      snapshot,
      stripRequest(input),
      await deps.authority.source(input.campaignId),
    );
    if (next.status === "queued") requireVerifier(deps, next);
    if (
      next.status === "queued" &&
      (!deps.policy ||
        next.model !== deps.policy.model ||
        JSON.stringify(next.parameters) !==
          JSON.stringify(deps.policy.parameters))
    )
      throw new MediaFrameError("not_configured");
    return {
      result: await deps.authority.lifecycle(input),
      status: next.status,
      dispatched: false,
    };
  }
  if (
    !input.payload.id ||
    !next.dispatch ||
    (action === "media.dispatch"
      ? input.requestId !== next.dispatch.requestId ||
        next.status !== "generating"
      : input.requestId !== input.payload.id ||
        (next.schema === 4
          ? next.status !== "generating" || next.review !== null
          : next.status !== "completed" ||
            next.resultAssetId !== input.payload.id))
  )
    throw new MediaFrameError("validation");
  requireVerifier(deps, next);
  if (action === "media.dispatch" && !policyMatches(next, deps.policy))
    throw new MediaFrameError("not_configured");
  // An eligible pixel reference is never silently dropped. Its charge ceiling is not yet documented.
  if (
    action === "media.dispatch" &&
    next.basis.references.some((r) => r.imageAssetId !== null)
  )
    throw new MediaFrameError("not_configured");
  if (
    action === "media.dispatch" &&
    textOnlyReservationFloor(next.prompt, next.parameters) >
      next.dispatch.reservationUsdMicros
  )
    throw new MediaFrameError("validation");
  const snapshot = await deps.authority.snapshot(input.campaignId);
  const current = recordFor(snapshot, input);
  if (
    !sameTimeline(snapshot.timeline, input.timeline) ||
    !realFrameIsCurrent(
      snapshot,
      next,
      await deps.authority.source(input.campaignId),
    )
  )
    throw new MediaFrameError("conflict");
  let record = current.record;
  if (action === "media.dispatch") {
    if (
      record.revision !== input.expectedRevision ||
      !immutableClaim(current.frame, next) ||
      JSON.stringify(realFrameDocumentMutation(snapshot, next, record)) !==
        JSON.stringify(stripRequest(input))
    )
      throw new MediaFrameError("conflict");
    const claim = await deps.authority.claim(input, deps.policy!.budgetId);
    if (!claim.claimed)
      return { result: claim.result, status: "generating", dispatched: false };
    const claimedSnapshot = await deps.authority.snapshot(input.campaignId);
    const claimed = recordFor(claimedSnapshot, input);
    if (
      claimed.record.revision !== claim.result.revision ||
      JSON.stringify(claimed.frame) !== JSON.stringify(next)
    )
      throw new MediaFrameError("conflict");
    record = claimed.record;
    let pixels: MediaPixels;
    try {
      pixels = await deps.provider.generate(next, record.id);
    } catch (error) {
      const definite =
        error instanceof MediaFrameError && error.code === "validation";
      await deps.authority.lifecycle(
        baseMutation(
          claimedSnapshot,
          {
            ...next,
            status: definite ? "failed" : "uncertain",
            failure: definite ? "provider" : "uncertain",
          },
          record,
          record.current_version_id,
        ),
      );
      throw new MediaFrameError("unavailable");
    }
    try {
      await deps.store.put(input.campaignId, record.id, pixels);
    } catch {
      // No second paid call: an immutable output may have persisted before its upload response was lost.
      throw new MediaFrameError("unavailable");
    }
  } else {
    if (
      current.frame.status !== "generating" ||
      record.revision !== input.expectedRevision ||
      JSON.stringify(
        next.schema === 4
          ? current.frame
          : {
              ...current.frame,
              status: "completed",
              resultAssetId: record.id,
            },
      ) !== JSON.stringify(next) ||
      JSON.stringify(realFrameDocumentMutation(snapshot, next, record)) !==
        JSON.stringify(stripRequest(input))
    )
      throw new MediaFrameError("conflict");
  }
  const pixels = await deps.store.read(input.campaignId, record.id);
  if (
    !pixels ||
    pixels.output.storagePath !== frameStoragePath(input.campaignId, record.id)
  )
    throw new MediaFrameError("unavailable");
  const observed = reportedUsageCost(pixels.output.usage);
  if (
    pixels.output.usage?.imageInputTokens ||
    (observed !== null && observed > next.dispatch.reservationUsdMicros)
  ) {
    await deps.authority.lifecycle(
      baseMutation(
        snapshot,
        {
          ...parseRealFrame(record)!,
          status: "uncertain",
          failure: "uncertain",
        },
        record,
        record.current_version_id,
      ),
    );
    throw new MediaFrameError("unavailable");
  }
  // A durable paid-check claim binds the exact immutable job version and image.
  // A duplicate/unknown claim never creates another QA generation. Only a stored
  // completed result may replay after a lost response.
  const checkInput: FrameCheckInput = {
    campaignId: input.campaignId,
    jobId: record.id,
    jobVersionId: record.current_version_id,
    imageSha256: pixels.output.sha256,
  };
  const checkClaim = await deps.authority.checkClaim!(checkInput);
  let checked = checkClaim.result;
  if (!checked && checkClaim.claimed) {
    try {
      const result = await deps.verifier!.check(
        parseRealFrame(record)!,
        pixels,
        record.id,
        record.current_version_id,
      );
      if (!isFrameCheckResult(result)) throw new MediaFrameError("unavailable");
      checked = await deps.authority.checkComplete!(checkInput, result);
    } catch {
      // A response or receipt may have been lost. Keep the coherent generating
      // job and immutable pixels; explicit recovery inspects the durable claim.
      throw new MediaFrameError("unavailable");
    }
  }
  if (!checked || !isFrameCheckResult(checked)) {
    await deps.authority.lifecycle(
      baseMutation(
        snapshot,
        {
          ...parseRealFrame(record)!,
          status: "uncertain",
          failure: "uncertain",
        },
        record,
        record.current_version_id,
      ),
    );
    throw new MediaFrameError("unavailable");
  }
  if (checked.schemaVersion !== 2 || checked.verdict.schemaVersion !== 2)
    throw new MediaFrameError("unavailable");
  if (checked.verdict.status === "hard_reject") {
    const result = await deps.authority.lifecycle(
      baseMutation(
        snapshot,
        { ...parseRealFrame(record)!, status: "failed", failure: "grounding" },
        record,
        record.current_version_id,
      ),
    );
    return {
      result,
      status: "failed",
      dispatched: action === "media.dispatch",
    };
  }
  // Generation produces a private draft only. Owner acceptance is a separate operation.
  const draft: Mutation = baseMutation(
    snapshot,
    {
      ...next,
      status: "draft",
      resultAssetId: null,
      review: {
        status: checked.verdict.status as "safe_to_review" | "review_warning",
        imageSha256: pixels.output.sha256,
      },
    },
    record,
    record.id,
  );
  const draftReceipt = await deps.authority.receipt(draft);
  if (draftReceipt)
    return {
      result: draftReceipt,
      status: "draft",
      dispatched: action === "media.dispatch",
    };
  if (!deps.authority.draft) throw new MediaFrameError("not_configured");
  return {
    result: await deps.authority.draft(draft, pixels.output),
    status: "draft",
    dispatched: action === "media.dispatch",
  };
}

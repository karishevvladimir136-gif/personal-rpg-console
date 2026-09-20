import {
  artifact as c,
  artifactHash,
  qualifyArtifact,
} from "./fal-artifact-contract.ts";
import { ArtifactLedger } from "./fal-artifact-state.ts";
import { readDiagnosticBody } from "./fal-host-diagnostic.ts";
import { streamArtifact } from "./fal-artifact-download.ts";
import { inspectWorldZIP } from "./fal-artifact-zip.ts";
import { hash } from "./protocol.ts";
import {
  requireRetrieval as check,
  retrievalReason,
} from "./fal-retrieval-contract.ts";
// Deterministic test seams are not exposed by the CLI. Production pins always come from the frozen manifest.
export async function runExactArtifact(
  ledger: ArtifactLedger,
  credential: string,
  deps: {
    read?: typeof readDiagnosticBody;
    qualify?: typeof qualifyArtifact;
    download?: typeof streamArtifact;
    inspect?: typeof inspectWorldZIP;
    now?: () => number;
  } = {},
) {
  check(ledger.entries.length === 0, "artifact_already_attempted");
  const now = deps.now ?? Date.now,
    started = now();
  ledger.append("artifact_begin", {
    requestId: c.requestId,
    artifactHash,
    started,
  });
  const time = () => {
    const left = c.limits.operationDeadlineMs - (now() - started);
    check(left > 0, "artifact_deadline");
    return left;
  };
  let stage = "result";
  try {
    check(
      credential.trim().length > 0 && !/[\r\n]/.test(credential),
      "artifact_credential_missing",
    );
    time();
    ledger.append("artifact_request", {
      stage: "result",
      method: "GET",
      requestId: c.requestId,
      urlHash: hash(c.resultURL),
      at: now(),
    });
    const reply = await (deps.read ?? readDiagnosticBody)(
      {
        method: "GET",
        url: c.resultURL,
        credential,
        timeoutMs: Math.min(time(), c.limits.resultTimeoutMs),
      },
      (d) => ledger.append("artifact_http", d),
    );
    time();
    ledger.append("artifact_body", {
      bodyHash: reply.bodyHash,
      matchesPrevious: reply.bodyHash === c.resultBodySHA256,
    });
    check(
      reply.bodyHash === c.resultBodySHA256,
      "artifact_changed_result_body",
    );
    // qualifyArtifact independently hashes actual bytes before JSON interpretation or minting a capability.
    const validated = (deps.qualify ?? qualifyArtifact)(reply.bytes);
    ledger.append("artifact_identity", validated.identity);
    ledger.append("artifact_capability", validated.descriptor);
    stage = "asset";
    time();
    ledger.append("artifact_request", {
      stage: "asset",
      method: "GET",
      requestId: c.requestId,
      urlHash: validated.cap.urlHash,
      at: now(),
    });
    const downloaded = await (deps.download ?? streamArtifact)(
      validated.cap,
      ledger.root,
      (kind, d) => ledger.append(kind, d),
      { timeoutMs: Math.min(time(), c.limits.assetTimeoutMs) },
    );
    stage = "zip";
    time();
    const checked = await (deps.inspect ?? inspectWorldZIP)(
      downloaded.path,
      {
        ...c.zip,
        timeoutMs: Math.min(time(), c.zip.timeoutMs),
      },
      (inventory) => ledger.append("artifact_inventory", inventory),
    );
    ledger.append("artifact_inspection", checked.inspection);
    ledger.append("artifact_end", {
      status: "RETRIEVED_AWAITING_OWNER_REVIEW",
      billing: "UNKNOWN",
      manualReviewRequired: true,
      approval: false,
      nextReleased: false,
    });
  } catch (error) {
    ledger.append("artifact_end", {
      status: "STOPPED_AWAITING_OWNER_REVIEW",
      stage,
      reason: retrievalReason(error),
      billing: "UNKNOWN",
      approval: false,
      nextReleased: false,
    });
  }
  return ledger.summary();
}

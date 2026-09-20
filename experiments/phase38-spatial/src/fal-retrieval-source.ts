import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonical,
  hash,
  object,
  protocolHash,
  type Dict,
} from "./protocol.ts";
import { experimentRoot } from "./freeze.ts";
import { binding, verifyFalSource } from "./fal-recovery-ledger.ts";
import {
  retrieval as c,
  requireRetrieval as check,
} from "./fal-retrieval-contract.ts";
import type { Entry } from "./ledger.ts";
export type RetrievalSources = {
  continuationRoot: string;
  recoveryRoot: string;
};
export function verifyCompletedEvidence(bytes: Buffer) {
  check(
    hash(bytes) === c.completedStatusEvidenceSHA256,
    "completed_evidence_hash",
  );
  const e = object(JSON.parse(bytes.toString("utf8")));
  const observation = object(e.observation),
    status = object(observation.validatedQueue),
    http = object(observation.http);
  check(
    e.approvedExecutionSHA === c.recoveryPreparationSHA &&
      e.recoveryHash === c.recoveryHash &&
      e.recoveryIdentity === c.recoveryIdentity &&
      e.requestId === c.requestId &&
      e.requestedModel === c.model &&
      e.originalExecutionSHA === c.originalExecutionSHA &&
      e.continuationHash === c.continuationHash &&
      e.originalProtocolHash === c.originalProtocolHash,
    "completed_evidence_identity",
  );
  check(
    http.httpStatus === 200 &&
      http.responseURLMatches === true &&
      http.redirect === false &&
      http.classification === "exact_response_url" &&
      status.requestId === c.requestId &&
      status.state === "COMPLETED" &&
      status.validatedComplete === true &&
      status.bodyHash === c.completedBodySHA256,
    "completed_evidence_required",
  );
  return e;
}
export function verifyCompletedRecovery(recoveryRoot: string) {
  const evidence = verifyCompletedEvidence(
    readFileSync(join(experimentRoot, c.completedStatusEvidenceFile)),
  );
  for (const [p, h] of Object.entries(c.recoveryFiles))
    check(
      hash(readFileSync(join(recoveryRoot, p))) === h,
      "completed_recovery_history_changed",
    );
  const identity = object(
    JSON.parse(readFileSync(join(recoveryRoot, "identity.json"), "utf8")),
  );
  check(
    identity.commit === c.recoveryPreparationSHA &&
      identity.protocolHash === protocolHash &&
      object(identity.continuation).falRecoveryHash === c.recoveryHash,
    "completed_recovery_identity",
  );
  const bytes = readFileSync(join(recoveryRoot, "journal.jsonl"), "utf8");
  check(bytes.endsWith("\n"), "completed_recovery_partial");
  const rows = bytes
    .trim()
    .split("\n")
    .map((x) => JSON.parse(x) as Entry);
  const witness = readFileSync(join(recoveryRoot, "witness.jsonl"), "utf8")
    .trim()
    .split("\n");
  check(
    rows.length === 5 && witness.length === rows.length,
    "completed_recovery_count",
  );
  rows.forEach((r, i) => {
    const { digest, ...body } = r;
    check(
      r.sequence === i &&
        r.previous === (i ? rows[i - 1].digest : "GENESIS") &&
        r.protocolHash === protocolHash &&
        hash(canonical(body)) === digest &&
        witness[i] === digest,
      "completed_recovery_chain",
    );
  });
  check(
    rows.at(-1)?.digest === c.recoveryTerminalDigest &&
      rows.at(-1)?.data.status === "OBSERVED_AWAITING_OWNER_REVIEW" &&
      rows.at(-1)?.data.resultCandidate === true,
    "completed_recovery_terminal",
  );
  const status = rows.find((r) => r.kind === "recovery_status")?.data;
  check(
    status &&
      canonical(status) ===
        canonical(object(evidence.observation).validatedQueue),
    "completed_recovery_observation",
  );
  return {
    recoveryTerminalDigest: c.recoveryTerminalDigest,
    completedStatusEvidenceSHA256: c.completedStatusEvidenceSHA256,
  };
}

export function verifyRetrievalSources(s: RetrievalSources): Dict {
  const completed = verifyCompletedRecovery(s.recoveryRoot);
  check(
    canonical(binding(s.continuationRoot).files) ===
      canonical(c.originalSourceFiles),
    "retrieval_original_binding",
  );
  const originalDigest = verifyFalSource(binding(s.continuationRoot));
  return { originalDigest, ...completed };
}

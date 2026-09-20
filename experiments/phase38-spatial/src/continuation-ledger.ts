import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { experimentRoot } from "./freeze.ts";
import { initialize, Ledger, type Entry } from "./ledger.ts";
import {
  canonical,
  hash,
  must,
  object,
  protocolHash,
  type Dict,
} from "./protocol.ts";

type Contract = {
  version: string;
  originalExecutionSHA: string;
  originalProtocolHash: string;
  originalRunRelativePath: string;
  originalFileHashes: Record<string, string>;
  evidenceHashes: Record<string, string>;
  acceptedMetadataSHA: string;
  acceptedURLSHA: string;
  recoveryEvidenceSHA: string;
  urlEvidenceSHA: string;
  room: {
    jobId: string;
    operationId: string;
    worldId: string;
    reservedMicroUSD: number;
    reportedMicroUSD: number;
    reportedCredits: number;
  };
  historical: {
    generationSubmissions: number;
    apiRequests: number;
    worldReads: number;
    downloads: number;
    originalStatus: string;
  };
  recovery: {
    attempts: number;
    worldReads: number;
    downloads: number;
    assetRoles: string[];
    deadlineMs: number;
    requestTimeoutMs: number;
  };
  remainingJobIds: string[];
  cumulative: {
    reservedMicroUSD: number;
    generationSubmissions: number;
    additionalSubmissions: number;
    apiRequests: number;
    newAPIRequestsMaximum: number;
    worldReadsMaximum: number;
    downloadsMaximum: number;
    maxJsonBytes: number;
    maxAssetBytes: number;
    maxTotalAssetBytes: number;
  };
};
export const continuation = JSON.parse(
  readFileSync(join(experimentRoot, "continuation.json"), "utf8"),
) as Contract;
function freeze(value: unknown) {
  if (value && typeof value === "object") {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
}
freeze(continuation);
export const continuationHash = hash(canonical(continuation));
export const continuationIdentity = {
  manifestHash: continuationHash,
  ...continuation,
};
freeze(continuationIdentity);

// Read files directly, never open the original Ledger (even a lock would mutate its directory).
export function verifyHistory(originalRepo: string) {
  must(
    continuation.originalProtocolHash === protocolHash,
    "continuation_history_changed",
  );
  for (const [path, expected] of Object.entries(
    continuation.originalFileHashes,
  ))
    must(
      hash(readFileSync(join(originalRepo, path))) === expected,
      "continuation_history_changed",
    );
  for (const [path, expected] of Object.entries(continuation.evidenceHashes))
    must(
      hash(readFileSync(join(experimentRoot, "results", path))) === expected,
      "continuation_history_changed",
    );
  const original = join(originalRepo, continuation.originalRunRelativePath);
  const raw = readFileSync(join(original, "journal.jsonl"));
  must(
    raw.equals(
      readFileSync(join(experimentRoot, "results/live-run-001-ledger.jsonl")),
    ),
    "continuation_history_changed",
  );
  const rows = raw
    .toString()
    .trim()
    .split("\n")
    .map((x) => JSON.parse(x) as Entry);
  const witness = readFileSync(join(original, "witness.jsonl"), "utf8")
    .trim()
    .split("\n");
  must(rows.length === witness.length, "continuation_history_changed");
  rows.forEach((row, i) => {
    const { digest, ...body } = row;
    must(
      row.sequence === i &&
        row.previous === (i ? rows[i - 1].digest : "GENESIS") &&
        digest === hash(canonical(body)) &&
        digest === witness[i] &&
        row.protocolHash === protocolHash,
      "continuation_history_changed",
    );
  });
  const one = (kind: string) => {
    const r = rows.filter((x) => x.kind === kind);
    must(r.length === 1, "continuation_history_changed");
    return r[0].data;
  };
  const reserve = one("reserve"),
    receipt = one("receipt"),
    billing = one("billing"),
    stopped = one("stop");
  must(
    reserve.jobId === continuation.room.jobId &&
      reserve.microUSD === continuation.room.reservedMicroUSD &&
      receipt.requestId === continuation.room.operationId &&
      billing.requestId === receipt.requestId &&
      billing.microUSD === continuation.room.reportedMicroUSD &&
      billing.microUSD === continuation.room.reportedCredits * 800 &&
      rows.at(-1)?.kind === "stop" &&
      stopped.jobId === continuation.room.jobId,
    "continuation_history_changed",
  );
  const recovered = object(
    JSON.parse(
      readFileSync(join(experimentRoot, "results/recovery-001.json"), "utf8"),
    ),
  );
  const op = object(recovered.operation);
  const diagnosed = object(
    JSON.parse(
      readFileSync(
        join(experimentRoot, "results/url-diagnosis-001.json"),
        "utf8",
      ),
    ),
  );
  must(
    recovered.operationId === continuation.room.operationId &&
      op.worldId === continuation.room.worldId &&
      op.done === true &&
      op.costCredits === continuation.room.reportedCredits &&
      diagnosed.worldId === continuation.room.worldId,
    "continuation_history_changed",
  );
  const originalAPI = rows.filter((r) => r.kind === "request").length;
  must(
    originalAPI +
      (recovered.requests as unknown[]).length +
      Number(diagnosed.requests) ===
      continuation.historical.apiRequests &&
      rows.filter((r) => r.kind === "request" && r.data.type === "world")
        .length +
        2 ===
        continuation.historical.worldReads,
    "continuation_history_changed",
  );
  const prefix = [
    {
      kind: "continuation_base",
      data: {
        manifestHash: continuationHash,
        originalStatus: "STOPPED",
        originalLastDigest: rows.at(-1)!.digest,
      },
    },
    {
      kind: "reserve",
      data: {
        ...reserve,
        carriedFrom:
          continuation.originalFileHashes[
            continuation.originalRunRelativePath + "/journal.jsonl"
          ],
      },
    },
    {
      kind: "receipt",
      data: { ...receipt, carriedFrom: continuation.originalExecutionSHA },
    },
    {
      kind: "billing",
      data: { ...billing, carriedFrom: continuation.originalExecutionSHA },
    },
    {
      kind: "historical_stop",
      data: {
        ...stopped,
        originalExecutionSHA: continuation.originalExecutionSHA,
      },
    },
  ];
  return { prefix, reserve, receipt, billing };
}
export function initializeContinuation(
  root: string,
  commit: string,
  originalRepo: string,
) {
  const a = resolve(root).toLowerCase(),
    b = resolve(originalRepo).toLowerCase();
  must(
    a !== b && !a.startsWith(b + sep) && !b.startsWith(a + sep),
    "continuation_must_be_separate",
  );
  const history = verifyHistory(originalRepo);
  initialize(root, commit, continuationIdentity);
  const ledger = new Ledger(root, commit, continuationIdentity);
  try {
    for (const row of history.prefix) ledger.append(row.kind, row.data);
  } finally {
    ledger.close();
  }
  // A crash during the above sequence leaves an incomplete, non-resumable initialization.
}
export class ContinuationLedger extends Ledger {
  private expectedPrefix?: string;
  private originalRepo?: string;
  constructor(root: string, commit: string, originalRepo: string) {
    const history = verifyHistory(originalRepo);
    super(root, commit, continuationIdentity);
    try {
      must(
        canonical(
          this.entries
            .slice(0, history.prefix.length)
            .map(({ kind, data }) => ({ kind, data })),
        ) === canonical(history.prefix),
        "continuation_prefix_mismatch",
      );
      this.expectedPrefix = canonical(history.prefix);
      this.originalRepo = originalRepo;
    } catch (error) {
      this.close();
      throw error;
    }
  }
  override append(kind: string, data: Dict) {
    if (["request", "reserve"].includes(kind) && this.originalRepo)
      verifyHistory(this.originalRepo);
    super.append(kind, data);
  }
  override audit() {
    super.audit();
    // These are mandatory even during constructor audit and every append.
    const prefix = this.entries.slice(0, 5);
    if (this.expectedPrefix)
      must(
        canonical(prefix.map(({ kind, data }) => ({ kind, data }))) ===
          this.expectedPrefix,
        "continuation_prefix_mismatch",
      );
    const stoppedAt = this.entries.findIndex((e) => e.kind === "stop");
    if (stoppedAt >= 0)
      must(
        this.entries
          .slice(stoppedAt + 1)
          .every((e) => ["billing", "evidence"].includes(e.kind)),
        "experiment_stopped",
      );
    must(
      canonical(prefix.map((x) => x.kind)) ===
        canonical([
          "continuation_base",
          "reserve",
          "receipt",
          "billing",
          "historical_stop",
        ]) &&
        prefix[0].data.manifestHash === continuationHash &&
        prefix[1].data.microUSD === 1300000 &&
        prefix[2].data.requestId === continuation.room.operationId &&
        prefix[3].data.microUSD === 1264000,
      "continuation_prefix_mismatch",
    );
    const room = continuation.room.jobId,
      requests = this.rows("request");
    const roomRequests = requests.filter((x) => x.jobId === room);
    must(
      roomRequests.every((x) => ["world", "download"].includes(String(x.type))),
      "room_regeneration_forbidden",
    );
    const starts = this.rows("recovery_begin"),
      completed = this.rows("recovery_complete");
    must(
      starts.length <= 1 && completed.length <= 1,
      "room_recovery_already_attempted",
    );
    if (starts.length)
      must(
        starts[0].jobId === room &&
          starts[0].continuationHash === continuationHash &&
          starts[0].operationId === continuation.room.operationId &&
          starts[0].worldId === continuation.room.worldId,
        "continuation_identity_mismatch",
      );
    must(!roomRequests.length || starts.length === 1, "recovery_incomplete");
    const downloads = roomRequests.filter((x) => x.type === "download");
    must(
      downloads.length <= 4 &&
        new Set(downloads.map((x) => x.role)).size === downloads.length &&
        downloads.every((x) =>
          continuation.recovery.assetRoles.includes(String(x.role)),
        ),
      "recovery_incomplete",
    );
    if (completed.length)
      must(
        completed[0].jobId === room &&
          completed[0].worldId === continuation.room.worldId &&
          completed[0].resultSHA256 === this.rows("result", room)[0]?.sha256 &&
          this.rows("result", room).length === 1 &&
          downloads.length === 4 &&
          roomRequests.filter((x) => x.type === "world").length === 2,
        "recovery_incomplete",
      );
    if (this.rows("approval", room).length)
      must(completed.length === 1, "recovery_incomplete");
    for (const r of this.rows("reserve").slice(1)) {
      const i = continuation.remainingJobIds.indexOf(String(r.jobId));
      must(
        i >= 0 &&
          this.rows("approval", i ? continuation.remainingJobIds[i - 1] : room)
            .length === 1 &&
          completed.length === 1,
        "recovery_incomplete",
      );
    }
    const newAPI = requests.filter((x) => x.type !== "download").length;
    must(
      newAPI <= continuation.cumulative.newAPIRequestsMaximum &&
        newAPI + continuation.historical.apiRequests <= 190,
      "api_limit",
    );
    must(
      requests.filter((x) => x.type === "download").length <= 10,
      "download_limit",
    );
    must(
      requests.filter((x) => x.type === "world").length +
        continuation.historical.worldReads <=
        7,
      "world_read_limit",
    );
    must(
      requests.filter((x) => x.type === "submit").length <= 3,
      "room_regeneration_forbidden",
    );
  }
  override summary() {
    const current = super.summary();
    return {
      ...current,
      continuationHash,
      originalStatus: "STOPPED",
      carriedRoomReservedMicroUSD: 1300000,
      carriedRoomReportedMicroUSD: 1264000,
      historicalAPIRequests: continuation.historical.apiRequests,
      cumulativeAPIRequests:
        current.apiRequests + continuation.historical.apiRequests,
      cumulativeWorldReads:
        this.rows("request").filter((x) => x.type === "world").length +
        continuation.historical.worldReads,
      cumulativeGenerationSubmissions:
        this.rows("request").filter((x) => x.type === "submit").length + 1,
      recoveryStarted: this.rows("recovery_begin").length === 1,
      recoveryComplete: this.rows("recovery_complete").length === 1,
    };
  }
}

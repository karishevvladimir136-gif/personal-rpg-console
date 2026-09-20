import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { initialize, Ledger, type Entry } from "./ledger.ts";
import { canonical, hash, must, protocolHash, type Dict } from "./protocol.ts";
import { experimentRoot } from "./freeze.ts";
import {
  falRecovery as c,
  falRecoveryHash,
  recoveryURL,
  type ReadLimits,
} from "./fal-recovery-contract.ts";
export type SourceBinding = {
  sourceRoot: string;
  files: Record<string, string>;
};
export function binding(sourceRoot: string): SourceBinding {
  return { sourceRoot, files: c.sourceFiles };
}
export function verifyFalSource(source: SourceBinding) {
  for (const [path, expected] of Object.entries(source.files))
    must(
      hash(readFileSync(join(source.sourceRoot, path))) === expected,
      "fal_history_changed",
    );
  must(
    hash(readFileSync(join(experimentRoot, "results/fal-world-001.json"))) ===
      c.stopEvidenceSHA256,
    "fal_history_changed",
  );
  const root = join(
    source.sourceRoot,
    "experiments/phase38-spatial/private-continuation",
  );
  const bytes = readFileSync(join(root, "journal.jsonl"), "utf8");
  must(bytes.endsWith("\n"), "partial_journal");
  const rows = bytes
    .trim()
    .split("\n")
    .map((x) => JSON.parse(x) as Entry);
  const witness = readFileSync(join(root, "witness.jsonl"), "utf8")
    .trim()
    .split("\n");
  must(rows.length === witness.length, "truncated_journal");
  rows.forEach((r, i) => {
    const { digest, ...body } = r;
    must(
      r.sequence === i &&
        r.previous === (i ? rows[i - 1].digest : "GENESIS") &&
        r.protocolHash === protocolHash &&
        digest === hash(canonical(body)) &&
        digest === witness[i],
      "journal_integrity",
    );
  });
  const ident = JSON.parse(readFileSync(join(root, "identity.json"), "utf8"));
  must(
    ident.commit === c.originalExecutionSHA &&
      ident.continuation?.manifestHash === c.continuationHash &&
      readFileSync(root + ".anchor", "utf8").trim() === canonical(ident),
    "fal_source_identity",
  );
  const find = (kind: string, id?: string) =>
    rows
      .filter((x) => x.kind === kind && (!id || x.data.jobId === id))
      .map((x) => x.data);
  const reserve = find("reserve", c.jobId),
    receipt = find("receipt", c.jobId),
    bill = find("billing", c.jobId),
    requests = find("request", c.jobId);
  must(
    reserve.length === 1 &&
      reserve[0].microUSD === 350000 &&
      reserve[0].model === c.model &&
      receipt.length === 1 &&
      receipt[0].requestId === c.requestId &&
      receipt[0].provider === c.provider &&
      bill.length === 0,
    "fal_source_accounting",
  );
  must(
    find("reserve").length === 3 &&
      find("reserve").reduce((n, r) => n + Number(r.microUSD), 0) === 4150000 &&
      find("billing").reduce((n, r) => n + Number(r.microUSD), 0) === 2528000,
    "fal_source_accounting",
  );
  must(
    requests.length === 2 &&
      requests[0].type === "submit" &&
      requests[1].type === "poll" &&
      requests[1].urlHash === hash(recoveryURL("status")),
    "fal_source_attempts",
  );
  must(
    rows.at(-1)?.kind === "stop" &&
      rows.at(-1)?.data.jobId === c.jobId &&
      rows.at(-1)?.data.reason === "http_or_redirect_failure" &&
      !find("result", c.jobId).length,
    "fal_source_not_stopped",
  );
  return rows.at(-1)!.digest;
}
function reads(limits: ReadLimits) {
  must(
    limits.statusReads === 1 &&
      (limits.resultReads === 0 || limits.resultReads === 1) &&
      limits.assetDownloads === limits.resultReads,
    "recovery_read_limits",
  );
  return {
    statusReads: 1,
    resultReads: limits.resultReads,
    assetDownloads: limits.assetDownloads,
  };
}
function identity(source: SourceBinding, limits: ReadLimits) {
  return {
    falRecoveryHash,
    contract: c,
    sourceFiles: source.files,
    readLimits: reads(limits),
  };
}
export function initializeFalRecovery(
  root: string,
  commit: string,
  source: SourceBinding,
  limits: ReadLimits = c.limits,
) {
  const a = resolve(root).toLowerCase(),
    b = resolve(source.sourceRoot).toLowerCase();
  must(
    a !== b && !a.startsWith(b + sep) && !b.startsWith(a + sep),
    "fal_recovery_must_be_separate",
  );
  verifyFalSource(source);
  initialize(root, commit, identity(source, limits));
}
export class FalRecoveryLedger extends Ledger {
  readonly source: SourceBinding;
  readonly limits: ReadLimits;
  constructor(
    root: string,
    commit: string,
    source: SourceBinding,
    limits: ReadLimits = c.limits,
  ) {
    verifyFalSource(source);
    super(root, commit, identity(source, limits));
    this.source = source;
    this.limits = Object.freeze(reads(limits));
    this.audit();
  }
  override append(kind: string, data: Dict) {
    if (kind === "recovery_request") verifyFalSource(this.source);
    super.append(kind, data);
  }
  override audit() {
    const allowed = new Set([
      "recovery_begin",
      "recovery_request",
      "recovery_http",
      "recovery_status",
      "recovery_result",
      "recovery_asset",
      "evidence",
      "recovery_end",
    ]);
    for (const e of this.entries)
      must(allowed.has(e.kind), "fal_recovery_observation_only");
    super.audit();
    const last = this.entries.findIndex((e) => e.kind === "recovery_end");
    must(last < 0 || last === this.entries.length - 1, "fal_recovery_terminal");
    for (const k of [
      "recovery_begin",
      "recovery_status",
      "recovery_result",
      "recovery_asset",
      "recovery_end",
    ])
      must(this.rows(k).length <= 1, "fal_recovery_duplicate");
    const begin = this.rows("recovery_begin");
    if (this.entries.length)
      must(
        begin.length === 1 &&
          this.entries[0].kind === "recovery_begin" &&
          begin[0].requestId === c.requestId &&
          begin[0].falRecoveryHash === falRecoveryHash,
        "fal_recovery_identity",
      );
    // During base construction limits come from the checked identity; explicit audit follows assignment.
    const limits =
      this.limits ??
      reads(
        JSON.parse(readFileSync(join(this.root, "identity.json"), "utf8"))
          .continuation.readLimits,
      );
    const req = this.rows("recovery_request");
    for (const r of req) {
      must(
        r.requestId === c.requestId &&
          r.method === "GET" &&
          ["status", "result", "asset"].includes(String(r.stage)),
        "fal_recovery_get_only",
      );
      if (r.stage !== "asset")
        must(
          r.urlHash === hash(recoveryURL(r.stage as "status" | "result")),
          "fal_recovery_url_pin",
        );
    }
    must(
      req.filter((r) => r.stage === "status").length <= limits.statusReads &&
        req.filter((r) => r.stage === "result").length <= limits.resultReads &&
        req.filter((r) => r.stage === "asset").length <= limits.assetDownloads,
      "fal_recovery_read_limit",
    );
    const status = this.rows("recovery_status")[0];
    if (req.some((r) => r.stage === "result"))
      must(
        status?.validatedComplete === true &&
          status.requestId === c.requestId &&
          status.state === "COMPLETED",
        "fal_result_before_completion",
      );
    if (req.some((r) => r.stage === "asset"))
      must(
        this.rows("recovery_result").length === 1,
        "fal_asset_before_result",
      );
    if (this.rows("recovery_asset").length)
      must(
        req.filter((r) => r.stage === "asset").length === 1,
        "fal_asset_without_read",
      );
  }
  override summary() {
    return {
      ...super.summary(),
      attempted: c.accounting.historicalGenerationSubmissions,
      reservedMicroUSD: c.accounting.cumulativeReservedMicroUSD,
      unknownChargeJobs: [c.jobId],
      apiRequests: this.rows("recovery_request").filter(
        (x) => x.stage !== "asset",
      ).length,
      downloads: this.rows("recovery_request").filter(
        (x) => x.stage === "asset",
      ).length,
      cumulativeAPIRequests:
        c.accounting.historicalAPIRequests +
        this.rows("recovery_request").filter((x) => x.stage !== "asset").length,
      falRecoveryHash,
      originalStatus: "STOPPED",
      retainedCumulativeReservedMicroUSD: 4150000,
      knownReportedMicroUSD: 2528000,
      reportedMicroUSD: null,
      falCharge: "UNKNOWN",
      newReservations: 0,
      newGenerationSubmissions: 0,
      unreleasedChestMicroUSD: 600000,
      recoveryReads: this.rows("recovery_request").length,
      terminal: this.rows("recovery_end")[0]?.status ?? null,
    };
  }
}

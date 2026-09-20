import { resolve, sep } from "node:path";
import { initialize, Ledger } from "./ledger.ts";
import { hash, type Dict } from "./protocol.ts";
import {
  retrieval as c,
  retrievalHash,
  requireRetrieval as check,
} from "./fal-retrieval-contract.ts";
import {
  verifyRetrievalSources,
  type RetrievalSources,
} from "./fal-retrieval-source.ts";
type Verify = typeof verifyRetrievalSources;
const identity = () => ({ retrievalHash, contract: c });
export function initializeRetrieval(
  root: string,
  commit: string,
  sources: RetrievalSources,
  verify: Verify = verifyRetrievalSources,
) {
  const target = resolve(root).toLowerCase();
  for (const path of Object.values(sources)) {
    const origin = resolve(path).toLowerCase();
    check(
      target !== origin &&
        !target.startsWith(origin + sep) &&
        !origin.startsWith(target + sep),
      "retrieval_separate_history_required",
    );
  }
  verify(sources);
  initialize(root, commit, identity());
}
export class RetrievalLedger extends Ledger {
  readonly sources: RetrievalSources;
  readonly verify: Verify;
  constructor(
    root: string,
    commit: string,
    sources: RetrievalSources,
    verify: Verify = verifyRetrievalSources,
  ) {
    verify(sources);
    super(root, commit, identity());
    this.sources = Object.freeze({ ...sources });
    this.verify = verify;
  }
  override append(kind: string, data: Dict) {
    if (kind === "retrieval_begin" || kind === "retrieval_request")
      this.verify(this.sources);
    super.append(kind, data);
  }
  override audit() {
    super.audit();
    let state = "empty";
    for (const [i, e] of this.entries.entries()) {
      const d = e.data;
      check(state !== "terminal", "retrieval_terminal");
      switch (e.kind) {
        case "retrieval_begin":
          check(
            state === "empty" &&
              i === 0 &&
              d.retrievalHash === retrievalHash &&
              d.requestId === c.requestId,
            "retrieval_once",
          );
          state = "begun";
          break;
        case "retrieval_request":
          check(
            d.method === "GET" && d.requestId === c.requestId,
            "retrieval_get_only",
          );
          if (d.stage === "result") {
            check(
              state === "begun" && d.urlHash === hash(c.resultURL),
              "retrieval_one_result_only",
            );
            state = "result_requested";
          } else {
            check(
              d.stage === "asset" &&
                state === "result_validated" &&
                d.urlHash === this.rows("retrieval_result")[0]?.urlHash,
              "retrieval_one_validated_asset_only",
            );
            state = "asset_requested";
          }
          break;
        case "retrieval_http":
          check(
            state === "result_requested" &&
              d.stage === "result" &&
              d.requestId === c.requestId,
            "retrieval_http_order",
          );
          state = "http_observed";
          break;
        case "retrieval_identity": {
          const http = this.rows("retrieval_http")[0];
          check(
            state === "http_observed" &&
              http?.httpStatus === 200 &&
              http.responseURLMatches === true &&
              http.redirect === false &&
              d.requestId === c.requestId,
            "retrieval_identity_order",
          );
          state = "identity_validated";
          break;
        }
        case "retrieval_result":
          check(
            state === "identity_validated" &&
              d.role === "world" &&
              typeof d.urlHash === "string" &&
              /^[a-f0-9]{64}$/.test(d.urlHash),
            "retrieval_output_order",
          );
          state = "result_validated";
          break;
        case "retrieval_asset_observation":
          check(
            state === "asset_requested" &&
              d.role === "world" &&
              d.urlHash === this.rows("retrieval_result")[0]?.urlHash &&
              Number.isSafeInteger(d.bytes) &&
              Number(d.bytes) >= 0 &&
              Number(d.bytes) <= c.limits.maxAssetBytes &&
              typeof d.sha256 === "string" &&
              /^[a-f0-9]{64}$/.test(d.sha256),
            "retrieval_artifact_order",
          );
          state = "asset_observed";
          break;
        case "evidence": {
          const seen = this.rows("retrieval_asset_observation")[0];
          check(
            state === "asset_observed" &&
              d.sha256 === seen?.sha256 &&
              d.bytes === seen?.bytes &&
              d.file === `${d.sha256}.bin`,
            "retrieval_binary_evidence_only",
          );
          state = "bytes_retained";
          break;
        }
        case "retrieval_inspection":
          check(state === "bytes_retained", "retrieval_inspection_order");
          state = "inspected";
          break;
        case "retrieval_end":
          check(
            state !== "empty" && i === this.entries.length - 1,
            "retrieval_terminal_order",
          );
          if (d.finding === "D_STRUCTURAL_PASS")
            check(state === "inspected", "retrieval_premature_success");
          state = "terminal";
          break;
        default:
          check(false, "retrieval_event_forbidden");
      }
    }
  }
  override summary() {
    return {
      attempted: 3,
      reservedMicroUSD: 4150000,
      knownReportedMicroUSD: 2528000,
      reportedMicroUSD: null,
      unknownChargeJobs: [c.jobId],
      apiRequests: this.rows("retrieval_request").filter(
        (x) => x.stage === "result",
      ).length,
      downloads: this.rows("retrieval_request").filter(
        (x) => x.stage === "asset",
      ).length,
      retrievalHash,
      requestId: c.requestId,
      originalStatus: "STOPPED",
      historicalQueueState: "COMPLETED",
      accounting: c.accounting,
      newReservations: 0,
      newGenerations: 0,
      resultGETs: this.rows("retrieval_request").filter(
        (x) => x.stage === "result",
      ).length,
      artifactDownloads: this.rows("retrieval_request").filter(
        (x) => x.stage === "asset",
      ).length,
      terminal: this.rows("retrieval_end")[0] ?? null,
    };
  }
}
